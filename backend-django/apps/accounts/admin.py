from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from . import emails
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
    list_display = ('display_name', 'email', 'role', 'tutor_status', 'xp', 'auth_provider', 'created_at', 'is_active')
    list_filter = ('tutor_status', 'role', 'auth_provider', 'is_active', 'is_staff')
    actions = ['approve_tutors', 'decline_tutors', 'send_test_email']
    search_fields = ('email', 'display_name')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login', 'google_id', 'tutor_requested_at')
    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}),
        ('Profile', {'fields': ('display_name', 'avatar_url', 'role', 'settings')}),
        ('Tutor request', {'fields': ('tutor_status', 'tutor_request_note', 'tutor_requested_at')}),
        ('Progress', {'fields': ('xp', 'badges')}),
        ('Sign-in', {'fields': ('auth_provider', 'google_id', 'last_login')}),
        ('Admin access', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'display_name', 'role', 'password1', 'password2')}),
    )

    @admin.action(description='Approve as tutors (emails them)')
    def approve_tutors(self, request, queryset):
        done = 0
        for user in queryset.exclude(role=User.Role.ADMIN):
            user.role = User.Role.TEACHER
            user.tutor_status = User.TutorStatus.APPROVED
            user.save(update_fields=['role', 'tutor_status', 'updated_at'])
            emails.tutor_approved(user)
            done += 1
        self.message_user(request, f'{done} approved as tutor{"" if done == 1 else "s"}.', messages.SUCCESS)

    @admin.action(description='Decline tutor requests (emails them)')
    def decline_tutors(self, request, queryset):
        done = 0
        for user in queryset.filter(tutor_status=User.TutorStatus.PENDING):
            user.tutor_status = User.TutorStatus.DECLINED
            user.save(update_fields=['tutor_status', 'updated_at'])
            emails.tutor_declined(user)
            done += 1
        self.message_user(request, f'{done} request{"" if done == 1 else "s"} declined.', messages.SUCCESS)

    @admin.action(description='Send a test email to me (checks email works)')
    def send_test_email(self, request, queryset):
        """Sends from this server, so it shows whether Render can reach the email service."""
        from django.conf import settings
        if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
            self.message_user(request, 'Email is not set up on this server: add BREVO_API_KEY on Render '
                              '(DEPLOYING.md, Part 3). Nothing was sent.', messages.ERROR)
            return
        try:
            emails.send(request.user.email, 'VibeSkool test email',
                        ['This is a test from your live VibeSkool server. If you can read it, '
                         'password resets and tutor emails can be sent.'], raise_errors=True)
        except Exception as exc:  # shown to the admin so they can fix it
            hint = ''
            if '401' in str(exc) and 'IP' in str(exc):
                hint = ' Brevo is blocking this server\'s address: in Brevo, open Security → Authorised IPs and deactivate blocking.'
            elif 'sender' in str(exc).lower():
                hint = ' DEFAULT_FROM_EMAIL must be exactly the sender you verified in Brevo.'
            self.message_user(request, f'Sending failed: {exc}.{hint}', messages.ERROR)
            return
        self.message_user(request, f'Test email sent to {request.user.email}. Check that inbox (and spam).', messages.SUCCESS)
