from django.contrib import admin
from django.db.models import Count

from .models import (
    CourseInvite, CourseMember, Exercise, ExerciseSubmission, Lesson, LessonCompletion, Option, PassedModule, Question, SkillCheck, SkillPath, Streak,
)


class LessonInline(admin.TabularInline):
    model = Lesson
    fields = ('order', 'id', 'title', 'part', 'duration', 'published')
    show_change_link = True
    extra = 0
    ordering = ('order',)


class TeamInline(admin.TabularInline):
    model = CourseMember
    fields = ('user', 'role', 'added_at')
    readonly_fields = ('added_at',)
    raw_id_fields = ('user',)
    extra = 0


@admin.register(SkillPath)
class SkillPathAdmin(admin.ModelAdmin):
    list_display = ('title', 'id', 'is_official', 'status', 'lesson_count', 'order', 'is_default')
    list_editable = ('order',)
    list_filter = ('is_official', 'status', 'is_default', 'tag')
    search_fields = ('title', 'id', 'description', 'team__user__display_name')
    prepopulated_fields = {'id': ('title',)}
    filter_horizontal = ('classes',)
    inlines = [TeamInline, LessonInline]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_lessons=Count('lessons'))

    @admin.display(description='Lessons', ordering='_lessons')
    def lesson_count(self, obj):
        return obj._lessons


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'path', 'part', 'duration', 'order', 'published', 'updated_at')
    list_filter = ('published', 'path', 'part')
    list_editable = ('published',)
    search_fields = ('title', 'id', 'ai_prompt')
    list_select_related = ('path',)
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    fieldsets = (
        (None, {'fields': ('id', 'path', 'title', 'order', 'published')}),
        ('Labels', {'fields': ('part', 'duration', 'mek_label')}),
        ('Content', {'fields': ('sections',), 'description': 'The lesson body as JSON: a list of sections.'}),
        ('Practice', {'fields': ('terminal_mission', 'ai_prompt')}),
        ('History', {'fields': ('created_by', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    actions = ['publish', 'unpublish']

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    @admin.action(description='Publish selected lessons')
    def publish(self, request, queryset):
        queryset.update(published=True)

    @admin.action(description='Hide selected lessons from students')
    def unpublish(self, request, queryset):
        queryset.update(published=False)


class OptionInline(admin.TabularInline):
    model = Option
    fields = ('order', 'text', 'correct')
    extra = 0
    min_num = 2


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('short_prompt', 'skill_check', 'topic', 'key')
    list_filter = ('skill_check',)
    search_fields = ('prompt', 'topic', 'key')
    inlines = [OptionInline]

    @admin.display(description='Question')
    def short_prompt(self, obj):
        return obj.prompt[:90]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        q = form.instance
        right = q.options.filter(correct=True).count()
        if right != 1:
            self.message_user(request, f'“{q.prompt[:60]}” has {right} correct options. It should have exactly one.', level='warning')


class QuestionInline(admin.TabularInline):
    model = Question
    fields = ('order', 'key', 'topic', 'prompt')
    show_change_link = True
    extra = 0


@admin.register(SkillCheck)
class SkillCheckAdmin(admin.ModelAdmin):
    list_display = ('module_id', 'title', 'path', 'question_count', 'questions_per_attempt')
    inlines = [QuestionInline]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_q=Count('questions'))

    @admin.display(description='Questions', ordering='_q')
    def question_count(self, obj):
        return obj._q


@admin.register(LessonCompletion)
class LessonCompletionAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'completed_at')
    list_filter = ('lesson__path',)
    search_fields = ('student__email', 'student__display_name', 'lesson__title')
    list_select_related = ('student', 'lesson')
    date_hierarchy = 'completed_at'
    raw_id_fields = ('student', 'lesson')


@admin.register(PassedModule)
class PassedModuleAdmin(admin.ModelAdmin):
    list_display = ('student', 'module_id', 'score', 'passed_at')
    list_filter = ('module_id',)
    search_fields = ('student__email', 'student__display_name')
    raw_id_fields = ('student',)


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('student', 'current', 'longest', 'last_active')
    search_fields = ('student__email', 'student__display_name')
    raw_id_fields = ('student',)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'type', 'language', 'order', 'created_at')
    list_filter = ('type', 'language', 'lesson__path')
    search_fields = ('title', 'instructions')
    raw_id_fields = ('lesson', 'teacher')


@admin.register(ExerciseSubmission)
class ExerciseSubmissionAdmin(admin.ModelAdmin):
    list_display = ('exercise', 'student', 'passed', 'score', 'submitted_at')
    list_filter = ('passed',)
    raw_id_fields = ('exercise', 'student')


@admin.register(CourseInvite)
class CourseInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'course', 'invited_by', 'created_at')
    search_fields = ('email', 'course__title')
    raw_id_fields = ('course', 'invited_by')
