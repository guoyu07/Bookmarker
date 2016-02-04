from rest_framework import permissions


class SafeMethodsOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return self.has_object_permission(request, view)

    def has_object_permission(self, request, view, obj=None):
        return request.method in permissions.SAFE_METHODS


class IsAdminOrIsSelf(SafeMethodsOnlyPermission):
    def has_object_permission(self, request, view, obj=None):
        return request.user.is_superuser or obj is None or request.user.id == obj.id


def owner_can_edit_permisson(clsname, obj_attr, *, allow_safe=False):
    def has_object_permission(self, request, view, obj=None):
        if obj is None:
            can_edit = True
        else:
            check_list = obj_attr.split('.')
            for attr in check_list:
                obj = getattr(obj, attr)
            can_edit = request.user == obj
        if allow_safe:
            return can_edit or super(type(self), self).has_object_permission(request, view, obj)
        return can_edit
    return type(clsname, (SafeMethodsOnlyPermission,), dict(has_object_permission=has_object_permission))


UserOwnerCanEditPermission = owner_can_edit_permisson('UserOwnerCanEditPermission', 'id', allow_safe=True)
FavoriteOwnerCanEditPermission = owner_can_edit_permisson('FavoriteOwnerCanEditPermission', 'created_by')
EntryOwnerCanEditPermission = owner_can_edit_permisson('EntryOwnerCanEditPermission', 'created_by')
SettingOwnerCanEditPermission = owner_can_edit_permisson('SettingOwnerCanEditPermission', 'owner')

