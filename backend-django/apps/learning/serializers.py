"""Shapes match what the React app already reads from the Express API
(e.g. `name` for a path title, `lessons_data`, camelCase lesson fields)."""
from rest_framework import serializers

from .models import Lesson, Question, SkillCheck, SkillPath


class LessonSummarySerializer(serializers.ModelSerializer):
    path_id = serializers.CharField(source='path.id', read_only=True)
    mekLabel = serializers.CharField(source='mek_label', read_only=True)
    order_index = serializers.IntegerField(source='order', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'path_id', 'title', 'duration', 'part', 'mekLabel', 'order_index']


class PathSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title')
    lessons_data = serializers.SerializerMethodField()
    order_index = serializers.IntegerField(source='order', required=False)

    class Meta:
        model = SkillPath
        fields = ['id', 'icon', 'name', 'description', 'color', 'tag', 'lessons_data', 'modules', 'order_index', 'classroom']
        extra_kwargs = {'classroom': {'required': False}}

    def validate_classroom(self, room):
        request = self.context.get('request')
        if room and request and not room.is_tutor(request.user):
            raise serializers.ValidationError("You can only add paths to classes you teach")
        return room

    def get_lessons_data(self, path):
        lessons = getattr(path, 'visible_lessons', None)
        if lessons is None:
            lessons = path.lessons.all()
        return LessonSummarySerializer(lessons, many=True).data


class LessonListSerializer(serializers.ModelSerializer):
    pathId = serializers.CharField(source='path_id', read_only=True)
    pathName = serializers.CharField(source='path.title', read_only=True)
    mekLabel = serializers.CharField(source='mek_label', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'pathId', 'pathName', 'title', 'duration', 'part', 'mekLabel']


class LessonSerializer(serializers.ModelSerializer):
    """Full lesson, read and written with the camelCase keys the app uses."""
    pathId = serializers.PrimaryKeyRelatedField(source='path', queryset=SkillPath.objects.all())
    mekLabel = serializers.CharField(source='mek_label', required=False, allow_blank=True)
    aiPrompt = serializers.CharField(source='ai_prompt', required=False, allow_blank=True, allow_null=True)
    terminalMission = serializers.CharField(source='terminal_mission', required=False, allow_blank=True, allow_null=True)
    order_index = serializers.IntegerField(source='order', required=False)

    class Meta:
        model = Lesson
        fields = ['id', 'pathId', 'title', 'duration', 'part', 'mekLabel', 'sections', 'aiPrompt',
                  'terminalMission', 'order_index', 'published']

    def validate(self, attrs):
        for key in ('ai_prompt', 'terminal_mission'):
            if key in attrs and attrs[key] is None:
                attrs[key] = ''
        return attrs


class OptionPublicSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()


class QuestionPublicSerializer(serializers.ModelSerializer):
    """A question without its answer; grading happens on the server."""
    id = serializers.CharField(source='key')
    question = serializers.CharField(source='prompt')
    options = OptionPublicSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'topic', 'question', 'options']


class SkillCheckSerializer(serializers.ModelSerializer):
    passMark = serializers.SerializerMethodField()

    class Meta:
        model = SkillCheck
        fields = ['module_id', 'title', 'questions_per_attempt', 'passMark']

    def get_passMark(self, obj):
        return SkillCheck.PASS_MARK
