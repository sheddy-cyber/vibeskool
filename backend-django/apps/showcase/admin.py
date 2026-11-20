from django.contrib import admin
from django.db.models import Count
from django.utils import timezone

from .models import Appreciation, Project, ProjectComment, ProjectMember


class MemberInline(admin.TabularInline):
    model = ProjectMember
    fields = ('user', 'role', 'added_at')
    readonly_fields = ('added_at',)
    raw_id_fields = ('user',)
    extra = 0


class CommentInline(admin.TabularInline):
    model = ProjectComment
    fields = ('author', 'body', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('author',)
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'is_featured', 'appreciation_count', 'classroom', 'published_at')
    list_filter = ('status', ('featured_at', admin.EmptyFieldListFilter), 'classroom')
    search_fields = ('title', 'tagline', 'tag_index', 'members__user__display_name')
    readonly_fields = ('id', 'tag_index', 'xp_awarded', 'created_at', 'updated_at', 'image_width', 'image_height')
    raw_id_fields = ('classroom', 'created_by')
    inlines = [MemberInline, CommentInline]
    actions = ['feature', 'unfeature', 'unpublish']
    fieldsets = (
        (None, {'fields': ('id', 'title', 'tagline', 'description', 'tags', 'tag_index')}),
        ('Links', {'fields': ('live_url', 'repo_url')}),
        ('Preview', {'fields': ('image', 'image_alt', 'image_width', 'image_height')}),
        ('Publishing', {'fields': ('status', 'published_at', 'featured_at', 'classroom', 'created_by', 'xp_awarded')}),
        ('Dates', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_likes=Count('appreciations', distinct=True))

    @admin.display(description='Appreciations', ordering='_likes')
    def appreciation_count(self, obj):
        return obj._likes

    @admin.display(description='Featured', boolean=True, ordering='featured_at')
    def is_featured(self, obj):
        return obj.featured_at is not None

    @admin.action(description='Feature on the showcase')
    def feature(self, request, queryset):
        queryset.filter(status='published', featured_at__isnull=True).update(featured_at=timezone.now())

    @admin.action(description='Stop featuring')
    def unfeature(self, request, queryset):
        queryset.update(featured_at=None)

    @admin.action(description='Unpublish (back to draft)')
    def unpublish(self, request, queryset):
        queryset.update(status='draft', featured_at=None)


@admin.register(ProjectComment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('project', 'author', 'short', 'created_at')
    search_fields = ('body', 'author__display_name', 'project__title')
    raw_id_fields = ('project', 'author')

    @admin.display(description='Comment')
    def short(self, obj):
        return obj.body[:80]


admin.site.register(Appreciation)
