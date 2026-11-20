from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.learning.models import Lesson

from .models import Assignment, Classroom, FeedbackComment, Nudge, Post, Reply, Submission


def viewer(ctx):
    request = ctx.get('request')
    return request.user if request else None


class ClassroomSerializer(serializers.ModelSerializer):
    """Keeps the Express field names (teacher_name, member_count…) so the
    current pages keep working. The invite code and AI settings are for the tutor only."""

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

    class Meta:
        model = Post
        fields = ['id', 'kind', 'author', 'title', 'body', 'code', 'code_language', 'lesson', 'lessonId',
                  'is_private', 'pinned', 'resolved', 'resolved_at', 'replies', 'created_at', 'edited_at']
        read_only_fields = ['resolved_at', 'created_at', 'edited_at']

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError('Write something first')
        return value.strip()


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
