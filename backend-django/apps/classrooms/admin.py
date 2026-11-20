from django.contrib import admin
from django.db.models import Count

from .models import Assignment, Classroom, FeedbackComment, Membership, Nudge, Post, Reply, Submission


class MembershipInline(admin.TabularInline):
    model = Membership
    fields = ('student', 'joined_at', 'last_seen_at')
    readonly_fields = ('joined_at', 'last_seen_at')
    raw_id_fields = ('student',)
    extra = 0


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher', 'invite_code', 'students', 'joining_open', 'archived', 'created_at')
    list_filter = ('archived', 'joining_open')
    search_fields = ('name', 'invite_code', 'teacher__email', 'teacher__display_name')
    raw_id_fields = ('teacher',)
    readonly_fields = ('id', 'created_at')
    fields = ('id', 'name', 'description', 'teacher', 'invite_code', 'joining_open', 'archived',
              'ai_provider', 'ai_api_key', 'created_at')
    inlines = [MembershipInline]
    actions = ['new_invite_codes']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('teacher').annotate(_students=Count('memberships'))

    @admin.display(description='Students', ordering='_students')
    def students(self, obj):
        return obj._students

    @admin.action(description='Give the selected classes new invite codes')
    def new_invite_codes(self, request, queryset):
        for room in queryset:
            room.reset_invite_code()


class ReplyInline(admin.StackedInline):
    model = Reply
    fields = ('author', 'body', 'code', 'accepted')
    raw_id_fields = ('author',)
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('summary', 'kind', 'classroom', 'author', 'pinned', 'is_resolved', 'is_private', 'created_at')
    list_filter = ('kind', 'pinned', 'is_private', 'classroom')
    search_fields = ('title', 'body', 'author__display_name')
    list_select_related = ('classroom', 'author')
    raw_id_fields = ('author', 'lesson', 'classroom')
    date_hierarchy = 'created_at'
    inlines = [ReplyInline]

    @admin.display(description='Post')
    def summary(self, obj):
        return str(obj)[:70]

    @admin.display(description='Resolved', boolean=True)
    def is_resolved(self, obj):
        return obj.resolved


class FeedbackInline(admin.TabularInline):
    model = FeedbackComment
    fields = ('line', 'body', 'author', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('author',)
    extra = 0


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'kind', 'classroom', 'due_at', 'published', 'handed_in')
    list_filter = ('kind', 'published', 'classroom')
    search_fields = ('title', 'instructions')
    raw_id_fields = ('classroom', 'lesson', 'created_by')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('classroom').annotate(_subs=Count('submissions'))

    @admin.display(description='Handed in', ordering='_subs')
    def handed_in(self, obj):
        return obj._subs


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'status', 'score', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'assignment__classroom')
    search_fields = ('student__display_name', 'student__email', 'assignment__title')
    list_select_related = ('assignment', 'student')
    raw_id_fields = ('assignment', 'student')
    inlines = [FeedbackInline]


@admin.register(Nudge)
class NudgeAdmin(admin.ModelAdmin):
    list_display = ('student', 'classroom', 'message', 'created_at', 'read_at')
    list_filter = ('classroom',)
    raw_id_fields = ('classroom', 'sender', 'student')
