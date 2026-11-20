import ipaddress
import re
from urllib.parse import urlparse

from rest_framework import serializers

from apps.media_urls import media_url

from .models import GITHUB_REPO, Project, ProjectComment, host_label, repo_label

TAG_RE = re.compile(r'^[a-z0-9][a-z0-9 .+#-]{0,23}$')
MAX_TAGS = 6
MAX_MEMBERS = 8


def person(user):
    return {'id': str(user.id), 'display_name': user.display_name, 'avatar_url': user.avatar_url, 'role': user.role}


class ProjectSerializer(serializers.ModelSerializer):
    """Read shape for cards and the project page."""
    live_host = serializers.SerializerMethodField()
    repo_label = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    classroom = serializers.SerializerMethodField()
    featured = serializers.SerializerMethodField()
    appreciations = serializers.SerializerMethodField()
    appreciated = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'tagline', 'description', 'live_url', 'live_host', 'repo_url', 'repo_label',
                  'image_url', 'image_width', 'image_height', 'image_alt', 'tags', 'status', 'featured',
                  'members', 'classroom', 'appreciations', 'appreciated', 'comments_count', 'permissions',
                  'published_at', 'created_at', 'updated_at']

    def viewer(self):
        return self.context['request'].user

    def get_live_host(self, p):
        return host_label(p.live_url)

    def get_repo_label(self, p):
        return repo_label(p.repo_url)

    def get_image_url(self, p):
        return media_url(p.image)

    def get_members(self, p):
        return [{**person(m.user), 'project_role': m.role} for m in p.members.all()]

    def get_classroom(self, p):
        # Class names are only shown to people in that class
        ids = self.context.get('my_class_ids')
        if p.classroom_id and ids is not None and p.classroom_id in ids:
            return {'id': str(p.classroom_id), 'name': p.classroom.name}
        return None

    def get_featured(self, p):
        return p.featured_at is not None

    def get_appreciations(self, p):
        n = getattr(p, 'n_appreciations', None)
        return n if n is not None else p.appreciations.count()

    def get_appreciated(self, p):
        v = getattr(p, 'i_appreciated', None)
        return bool(v) if v is not None else p.appreciations.filter(user=self.viewer()).exists()

    def get_comments_count(self, p):
        n = getattr(p, 'n_comments', None)
        return n if n is not None else p.comments.count()

    def get_permissions(self, p):
        u = self.viewer()
        return {'edit': p.can_edit(u), 'manage': p.can_manage(u), 'feature': p.can_feature(u)}

    def to_representation(self, p):
        data = super().to_representation(p)
        if self.context.get('card'):
            data.pop('description', None)
        return data


class ProjectWriteSerializer(serializers.Serializer):
    """What the publish form sends. Links are checked; tags tidied."""
    title = serializers.CharField(max_length=80, required=False)
    tagline = serializers.CharField(max_length=140, required=False, allow_blank=True)
    description = serializers.CharField(max_length=6000, required=False, allow_blank=True)
    live_url = serializers.URLField(max_length=500, required=False, allow_blank=True)
    repo_url = serializers.URLField(max_length=500, required=False, allow_blank=True)
    image_alt = serializers.CharField(max_length=200, required=False, allow_blank=True)
    tags = serializers.ListField(child=serializers.CharField(max_length=40), required=False, max_length=20)
    classroomId = serializers.UUIDField(required=False, allow_null=True)
    collaboratorIds = serializers.ListField(child=serializers.UUIDField(), required=False, max_length=MAX_MEMBERS)
    status = serializers.ChoiceField(choices=Project.Status.choices, required=False)

    def validate_title(self, v):
        v = v.strip()
        if len(v) < 2:
            raise serializers.ValidationError('Give your project a name')
        return v

    def validate_tagline(self, v):
        return v.strip()

    def validate_live_url(self, v):
        if not v:
            return ''
        u = urlparse(v)
        if u.scheme not in ('http', 'https'):
            raise serializers.ValidationError('Use a link that starts with https://')
        host = (u.hostname or '').lower()
        private = host in ('localhost',) or host.endswith('.local') or host.endswith('.localhost')
        try:
            ip = ipaddress.ip_address(host)
            private = private or ip.is_private or ip.is_loopback or ip.is_link_local
        except ValueError:
            pass
        if private:
            raise serializers.ValidationError("That link only works on your own computer. Deploy the site and share its public link.")
        return v

    def validate_repo_url(self, v):
        if not v:
            return ''
        v = v.strip().rstrip('/').removesuffix('.git')
        v = re.sub(r'^http://', 'https://', v)
        v = re.sub(r'^https://www\.github\.com', 'https://github.com', v)
        if not GITHUB_REPO.match(v):
            raise serializers.ValidationError('Use the link to a GitHub repository, like https://github.com/you/project')
        return v

    def validate_tags(self, tags):
        clean = []
        for t in tags:
            t = re.sub(r'\s+', ' ', t.strip().lower().lstrip('#'))
            if not t:
                continue
            if not TAG_RE.match(t):
                raise serializers.ValidationError(f'"{t}" can only use letters, numbers, spaces and . + # -')
            if t not in clean:
                clean.append(t)
        if len(clean) > MAX_TAGS:
            raise serializers.ValidationError(f'Up to {MAX_TAGS} tags')
        return clean


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = ProjectComment
        fields = ['id', 'author', 'body', 'created_at', 'can_delete']
        read_only_fields = ['created_at']

    def get_author(self, c):
        return person(c.author)

    def get_can_delete(self, c):
        u = self.context['request'].user
        return c.author_id == u.id or self.context['project'].can_edit(u)

    def validate_body(self, v):
        v = v.strip()
        if not v:
            raise serializers.ValidationError('Write something first')
        return v
