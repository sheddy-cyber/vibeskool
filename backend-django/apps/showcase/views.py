from django.db import IntegrityError, transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.images import ImageError, project_preview

from . import services
from .models import Appreciation, Project, ProjectComment, ProjectMember
from .serializers import MAX_MEMBERS, CommentSerializer, ProjectSerializer, ProjectWriteSerializer, person

PUBLISHED = Project.Status.PUBLISHED


def ctx(request, **extra):
    return {'request': request, 'my_class_ids': services.my_class_ids(request.user), **extra}


def load(request, pk):
    """A project the viewer may see, with counts, or 404."""
    project = services.annotated(Project.objects.filter(pk=pk), request.user).first()
    if not project or not project.visible_to(request.user):
        raise NotFound('Project not found')
    return project


def apply_changes(project, d, user, creating=False):
    """Save what the form sent. Returns XP awarded (first publish only)."""
    for key in ('title', 'tagline', 'description', 'live_url', 'repo_url', 'image_alt', 'tags'):
        if key in d:
            setattr(project, key, d[key])

    if 'classroomId' in d:
        room_id = d['classroomId']
        if room_id and not user.is_admin and room_id not in services.my_class_ids(user):
            raise serializers.ValidationError({'classroomId': 'Pick one of your own classes'})
        project.classroom_id = room_id

    if d.get('status') == PUBLISHED:
        if not (project.live_url or project.repo_url):
            raise serializers.ValidationError({'live_url': 'Add a link to the live site or the GitHub repository before publishing'})
        project.publish()
    elif d.get('status') == Project.Status.DRAFT:
        project.status = Project.Status.DRAFT

    project.save()
    if creating:
        ProjectMember.objects.create(project=project, user=user, role=ProjectMember.Role.OWNER)

    if 'collaboratorIds' in d:
        if not creating and not project.can_manage(user):
            raise PermissionDenied('Only the owner can change who worked on this.')
        set_collaborators(project, user, d['collaboratorIds'])

    xp = 0
    if project.is_published and not project.xp_awarded:
        owner_id = project.owner_id() or user.id
        type(user).objects.filter(pk=owner_id).update(xp=F('xp') + services.PUBLISH_XP)
        Project.objects.filter(pk=project.pk).update(xp_awarded=True)
        project.xp_awarded = True
        xp = services.PUBLISH_XP
    return xp


def set_collaborators(project, user, ids):
    ids = {str(i) for i in ids}
    current = {str(m.user_id): m for m in project.members.all() if m.role == ProjectMember.Role.COLLABORATOR}
    owner = str(project.owner_id())
    ids.discard(owner)
    new = ids - set(current)
    if new:
        allowed = {str(i) for i in services.people_i_can_add(user).filter(id__in=new).values_list('id', flat=True)}
        if not user.is_admin and new - allowed:
            raise serializers.ValidationError({'collaboratorIds': 'You can add people you share a class with'})
    if len(ids) + 1 > MAX_MEMBERS:
        raise serializers.ValidationError({'collaboratorIds': f'Up to {MAX_MEMBERS} people per project'})
    for uid, m in current.items():
        if uid not in ids:
            m.delete()
    for uid in new:
        ProjectMember.objects.get_or_create(project=project, user_id=uid, defaults={'role': ProjectMember.Role.COLLABORATOR})


class ProjectListView(APIView):
    """GET ?scope=all|classes|mine&q=&tag=&sort=new|popular&page=   ·   POST a new project."""
    PAGE = 18

    def get(self, request):
        user, p = request.user, request.query_params
        class_ids = services.my_class_ids(user)
        qs = services.visible_projects(user)

        scope = p.get('scope', 'all')
        if scope == 'mine':
            qs = qs.filter(pk__in=services.projects_of(user))
        else:
            qs = qs.filter(status=PUBLISHED)
            if scope == 'classes':
                people = services.people_i_can_add(user, class_ids)
                qs = qs.filter(Q(classroom_id__in=class_ids) | Q(pk__in=services.projects_of(people)))

        q = p.get('q', '').strip()[:80]
        if q:
            qs = qs.filter(
                Q(title__icontains=q) | Q(tagline__icontains=q) | Q(tag_index__icontains=q)
                | Q(pk__in=ProjectMember.objects.filter(user__display_name__icontains=q).values('project'))
            )
        tag = p.get('tag', '').strip().lower()[:24]
        if tag:
            qs = qs.filter(tag_index__icontains=f',{tag},')

        qs = services.annotated(qs, user)
        if p.get('sort') == 'popular':
            qs = qs.order_by('-n_appreciations', F('published_at').desc(nulls_last=True))
        else:
            # In "mine", drafts (not published yet) come first
            qs = qs.order_by(F('published_at').desc(nulls_first=True), '-created_at')

        try:
            page = max(1, int(p.get('page', 1)))
        except ValueError:
            page = 1
        rows = list(qs[(page - 1) * self.PAGE: page * self.PAGE + 1])
        c = ctx(request, card=True)
        c['my_class_ids'] = class_ids
        data = {
            'projects': ProjectSerializer(rows[:self.PAGE], many=True, context=c).data,
            'hasMore': len(rows) > self.PAGE,
            'page': page,
        }
        if page == 1:
            data['tags'] = services.top_tags()
            if scope == 'all' and not q and not tag:
                featured = services.annotated(
                    Project.objects.filter(status=PUBLISHED, featured_at__isnull=False), user,
                ).order_by('-featured_at')[:3]
                data['featured'] = ProjectSerializer(featured, many=True, context=c).data
        return Response(data)

    def post(self, request):
        s = ProjectWriteSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        if not s.validated_data.get('title'):
            raise serializers.ValidationError({'title': 'Give your project a name'})
        with transaction.atomic():
            project = Project(created_by=request.user)
            xp = apply_changes(project, s.validated_data, request.user, creating=True)
        return Response({'project': ProjectSerializer(load(request, project.pk), context=ctx(request)).data, 'xpAwarded': xp},
                        status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    def get(self, request, pk):
        return Response({'project': ProjectSerializer(load(request, pk), context=ctx(request)).data})

    def patch(self, request, pk):
        project = load(request, pk)
        if not project.can_edit(request.user):
            raise PermissionDenied("You didn't work on this project.")
        s = ProjectWriteSerializer(data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        with transaction.atomic():
            xp = apply_changes(project, s.validated_data, request.user)
        return Response({'project': ProjectSerializer(load(request, pk), context=ctx(request)).data, 'xpAwarded': xp})

    put = patch

    def delete(self, request, pk):
        project = load(request, pk)
        if not project.can_manage(request.user):
            raise PermissionDenied('Only the owner can delete this project.')
        project.image.delete(save=False)
        project.delete()
        return Response({'success': True})


class ProjectImageView(APIView):
    """POST a preview image (multipart field "image"), or DELETE it."""
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        project = load(request, pk)
        if not project.can_edit(request.user):
            raise PermissionDenied("You didn't work on this project.")
        upload = request.FILES.get('image')
        if not upload:
            return Response({'error': 'Choose an image to upload'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            content, (w, h) = project_preview(upload)
        except ImageError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        old = project.image.name
        project.image.save(content.name, content, save=False)
        project.image_width, project.image_height = w, h
        if 'alt' in request.data:
            project.image_alt = request.data['alt'][:200]
        project.save()
        if old:
            project.image.storage.delete(old)
        return Response({'project': ProjectSerializer(load(request, pk), context=ctx(request)).data})

    def delete(self, request, pk):
        project = load(request, pk)
        if not project.can_edit(request.user):
            raise PermissionDenied("You didn't work on this project.")
        project.image.delete(save=False)
        project.image_width = project.image_height = None
        project.save()
        return Response({'project': ProjectSerializer(load(request, pk), context=ctx(request)).data})


class AppreciateView(APIView):
    """POST toggles your appreciation."""

    def post(self, request, pk):
        project = load(request, pk)
        if not project.is_published:
            return Response({'error': 'Publish the project first'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.id in project.member_ids():
            return Response({'error': "You can't appreciate your own project"}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = Appreciation.objects.filter(project=project, user=request.user).delete()
        if not deleted:
            try:
                Appreciation.objects.create(project=project, user=request.user)
            except IntegrityError:
                pass
        return Response({'appreciated': not deleted, 'appreciations': project.appreciations.count()})


class FeatureView(APIView):
    """POST toggles "featured" (admins, or the tutor of the class it was built in)."""

    def post(self, request, pk):
        project = load(request, pk)
        if not project.can_feature(request.user):
            raise PermissionDenied('Only the tutor of the class it was built in can feature it.')
        if not project.is_published:
            return Response({'error': 'Only published projects can be featured'}, status=status.HTTP_400_BAD_REQUEST)
        project.featured_at = None if project.featured_at else timezone.now()
        project.save(update_fields=['featured_at'])
        return Response({'featured': project.featured_at is not None})


class LeaveView(APIView):
    """POST: a collaborator takes themselves off a project."""

    def post(self, request, pk):
        project = load(request, pk)
        m = project.members.filter(user=request.user).first()
        if not m:
            return Response({'error': "You're not on this project"}, status=status.HTTP_400_BAD_REQUEST)
        if m.role == ProjectMember.Role.OWNER:
            return Response({'error': 'The owner can delete the project instead'}, status=status.HTTP_400_BAD_REQUEST)
        m.delete()
        return Response({'success': True})


class CommentListView(APIView):
    def get(self, request, pk):
        project = load(request, pk)
        comments = project.comments.select_related('author')
        return Response({'comments': CommentSerializer(comments, many=True, context={'request': request, 'project': project}).data})

    def post(self, request, pk):
        project = load(request, pk)
        if not project.is_published:
            return Response({'error': 'Comments open once the project is published'}, status=status.HTTP_400_BAD_REQUEST)
        c = {'request': request, 'project': project}
        s = CommentSerializer(data=request.data, context=c)
        s.is_valid(raise_exception=True)
        comment = s.save(project=project, author=request.user)
        return Response({'comment': CommentSerializer(comment, context=c).data}, status=status.HTTP_201_CREATED)


class CommentDetailView(APIView):
    def delete(self, request, pk, comment_id):
        project = load(request, pk)
        comment = get_object_or_404(ProjectComment, pk=comment_id, project=project)
        if not (comment.author_id == request.user.id or project.can_edit(request.user)):
            raise PermissionDenied("You can't delete this comment.")
        comment.delete()
        return Response({'success': True})


class CollaboratorSearchView(APIView):
    """GET ?q= — people you could add to a project (you share a class with them)."""

    def get(self, request):
        q = request.query_params.get('q', '').strip()[:60]
        people = services.people_i_can_add(request.user)
        if q:
            people = people.filter(display_name__icontains=q)
        return Response({'people': [person(u) for u in people.order_by('display_name')[:20]]})
