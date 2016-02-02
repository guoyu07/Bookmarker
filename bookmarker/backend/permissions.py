from rest_framework import permissions


class SafeMethodsOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return self.has_object_permission(request, view)

    def has_object_permission(self, request, view, obj=None):
        return request.method in permissions.SAFE_METHODS


class IsAdminOrIsSelf(SafeMethodsOnlyPermission):
    def has_object_permission(self, request, view, obj=None):
        return request.user.is_superuser or obj is None or request.user.id == obj.id


class EntryOwnerCanEditPermission(SafeMethodsOnlyPermission):
    def has_object_permission(self, request, view, obj=None):
        if obj is None:
            can_edit = True
        else:
            can_edit = request.user == obj.belong.created_by
        return can_edit or super(EntryOwnerCanEditPermission, self).has_object_permission(request, view, obj)


class SettingOwnerCanEditPermission(SafeMethodsOnlyPermission):
    def has_object_permission(self, request, view, obj=None):
        if obj is None:
            can_edit = True
        else:
            can_edit = request.user == obj.owner
        return can_edit or super(SettingOwnerCanEditPermission, self).has_object_permission(request, view, obj)
