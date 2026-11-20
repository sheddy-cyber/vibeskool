from rest_framework.permissions import BasePermission


class IsTutor(BasePermission):
    """Tutors and admins."""
    message = 'Only tutors can do that.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_tutor)


class IsAdmin(BasePermission):
    message = 'Only admins can do that.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)
