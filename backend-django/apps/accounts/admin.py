from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import User


class VibeUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'display_name', 'role')


class VibeUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = VibeUserChangeForm
    add_form = VibeUserCreationForm
    list_display = ('display_name', 'email', 'role', 'xp', 'auth_provider', 'created_at', 'is_active')
    list_filter = ('role', 'auth_provider', 'is_active', 'is_staff')
    search_fields = ('email', 'display_name')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login', 'google_id')
    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}),
        ('Profile', {'fields': ('display_name', 'avatar_url', 'role', 'settings')}),
        ('Progress', {'fields': ('xp', 'badges')}),
        ('Sign-in', {'fields': ('auth_provider', 'google_id', 'last_login')}),
        ('Admin access', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'display_name', 'role', 'password1', 'password2')}),
    )
