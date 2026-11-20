from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.learning.models import Lesson

from .models import Assignment, Classroom, FeedbackComment, Nudge, Post, Reply, Submission


def viewer(ctx):
    request = ctx.get('request')
    return request.user if request else None


class ClassroomSerializer(serializers.ModelSerializer):
    """A class as the frontend reads it. The invite code and AI settings are for the tutor only."""

    teacher_id = serializers.UUIDField(read_only=True)
    teacher_name = serializers.CharField(source='teacher.display_name', read_only=True)
    teacher_avatar = serializers.CharField(source='teacher.avatar_url', read_only=True)
    member_count = serializers.IntegerField(read_only=True, default=None)
    is_tutor = serializers.SerializerMethodField()
    has_ai_key = serializers.SerializerMethodField()
    # Accept the camelCase names the frontend already sends
    aiProvider = serializers.CharField(source='ai_provider', write_only=True, required=False, allow_blank=True)
    aiApiKey = serializers.CharField(source='ai_api_key', write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Classroom
        fields = ['id', 'teacher_id', 'teacher_name', 'teacher_avatar', 'name', 'description', 'invite_code',
                  'joining_open', 'archived', 'ai_provider', 'has_ai_key', 'aiProvider', 'aiApiKey',
                  'member_count', 'is_tutor', 'created_at']
        read_only_fields = ['invite_code', 'ai_provider', 'created_at']

    def get_is_tutor(self, obj):
        return obj.is_tutor(viewer(self.context))

    def get_has_ai_key(self, obj):
        return bool(obj.ai_api_key)

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Name is required')
        return value

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if not obj.is_tutor(viewer(self.context)):
            for key in ('invite_code', 'ai_provider', 'has_ai_key', 'joining_open'):
                data.pop(key, None)
        return data


class MemberSerializer(serializers.Serializer):
    """A student in the class. Email is only included for the tutor."""
    id = serializers.UUIDField(source='student.id')
    display_name = serializers.CharField(source='student.display_name')
    avatar_url = serializers.CharField(source='student.avatar_url')
    email = serializers.EmailField(source='student.email')
    xp = serializers.IntegerField(source='student.xp')
    joined_at = serializers.DateTimeField()
    last_seen_at = serializers.DateTimeField()

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if not self.context.get('tutor'):
            data.pop('email', None)
            data.pop('last_seen_at', None)
        return data


class LessonRefSerializer(serializers.ModelSerializer):
    pathId = serializers.CharField(source='path_id')

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'pathId']


class ReplySerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'author', 'body', 'code', 'accepted', 'created_at']
        read_only_fields = ['accepted', 'created_at']

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError('Write something first')
        return value.strip()


class PostSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    lesson = LessonRefSerializer(read_only=True)
    lessonId = serializers.PrimaryKeyRelatedField(
        source='lesson', queryset=Lesson.objects.all(), write_only=True, required=False, allow_null=True,
    )
    replies = ReplySerializer(many=True, read_only=True)
    resolved = serializers.BooleanField(required=False)
    code_review = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'kind', 'author', 'title', 'body', 'code', 'code_language', 'lesson', 'lessonId',
                  'is_private', 'pinned', 'resolved', 'resolved_at', 'replies', 'code_review',
                  'created_at', 'edited_at']
        read_only_fields = ['resolved_at', 'created_at', 'edited_at']

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError('Write something first')
        return value.strip()

    def get_code_review(self, post):
        if not post.reviewed_at:
            return None
        return {
            'code': post.review_code,
            'base': post.review_base,
            'notes': post.review_notes or [],
            'by': PublicUserSerializer(post.reviewed_by).data if post.reviewed_by else None,
            'at': post.reviewed_at,
            # The student changed their code after the tutor's edit
            'outdated': post.review_base != post.code,
        }


class CodeReviewSerializer(serializers.Serializer):
    """The tutor's edited version of a post's code, with notes on its lines."""
    MAX_CODE = 40_000
    MAX_NOTES = 60

    code = serializers.CharField(allow_blank=True, trim_whitespace=False, max_length=MAX_CODE)
    notes = serializers.ListField(child=serializers.DictField(), required=False, default=list)

    def validate(self, attrs):
        code = attrs['code']
        if not code.strip():
            raise serializers.ValidationError({'code': 'The code can’t be empty'})
        line_count = len(code.split('\n'))
        notes, seen = [], set()
        if len(attrs['notes']) > self.MAX_NOTES:
            raise serializers.ValidationError({'notes': f'Up to {self.MAX_NOTES} notes'})
        for n in attrs['notes']:
            body = str(n.get('body', '')).strip()
            try:
                line = int(n.get('line'))
            except (TypeError, ValueError):
                raise serializers.ValidationError({'notes': 'Each note needs a line number'})
            if not body:
                continue
            if not 1 <= line <= line_count:
                raise serializers.ValidationError({'notes': f'Line {line} isn’t in the code'})
            if len(body) > 1000:
                raise serializers.ValidationError({'notes': 'Keep each note under 1000 characters'})
            if line in seen:
                raise serializers.ValidationError({'notes': f'Line {line} has two notes; combine them'})
            seen.add(line)
            notes.append({'line': line, 'body': body})
        attrs['notes'] = sorted(notes, key=lambda x: x['line'])
        return attrs


class AssignmentSerializer(serializers.ModelSerializer):
    lesson = LessonRefSerializer(read_only=True)
    lessonId = serializers.PrimaryKeyRelatedField(
        source='lesson', queryset=Lesson.objects.all(), write_only=True, required=False, allow_null=True,
    )
    past_due = serializers.BooleanField(source='is_past_due', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'kind', 'title', 'instructions', 'lesson', 'lessonId', 'starter_code', 'due_at',
                  'published', 'past_due', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        kind = attrs.get('kind', getattr(self.instance, 'kind', Assignment.Kind.CODE))
        lesson = attrs.get('lesson', getattr(self.instance, 'lesson', None))
        if kind == Assignment.Kind.LESSON and not lesson:
            raise serializers.ValidationError({'lessonId': 'Pick the lesson students should finish'})
        if not (attrs.get('title') or getattr(self.instance, 'title', '')).strip():
            raise serializers.ValidationError({'title': 'Give the assignment a title'})
        return attrs


class FeedbackCommentSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)

    class Meta:
        model = FeedbackComment
        fields = ['id', 'author', 'line', 'line_text', 'outdated', 'revision', 'body', 'created_at']
        read_only_fields = ['line_text', 'outdated', 'revision', 'created_at']

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError('Write something first')
        return value.strip()


class SubmissionSerializer(serializers.ModelSerializer):
    student = PublicUserSerializer(read_only=True)
    comments = FeedbackCommentSerializer(many=True, read_only=True)
    late = serializers.BooleanField(read_only=True)
    assignmentId = serializers.IntegerField(source='assignment_id', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignmentId', 'student', 'code', 'link', 'note', 'status', 'score', 'late',
                  'revision', 'submitted_at', 'reviewed_at', 'comments']
        read_only_fields = ['status', 'score', 'revision', 'submitted_at', 'reviewed_at']


class ReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[Submission.Status.APPROVED, Submission.Status.CHANGES])
    score = serializers.IntegerField(min_value=0, max_value=100, required=False, allow_null=True)
    comment = serializers.CharField(required=False, allow_blank=True)


class NudgeSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)
    student = PublicUserSerializer(read_only=True)
    studentId = serializers.UUIDField(write_only=True)

    class Meta:
        model = Nudge
        fields = ['id', 'sender', 'student', 'studentId', 'message', 'created_at', 'read_at']
        read_only_fields = ['created_at', 'read_at']

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Write a message first')
        return value.strip()
