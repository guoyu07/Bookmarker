from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Setting, Entry, Tag, TagRelation, Favorite

# Register your models here.

# Define a new User admin
class UserAdmin(UserAdmin):
    fieldsets = (
        ('个人信息', {'fields': ('username', 'email', 'password', 'avatar',)}),
        ('资料信息', {'fields': ('date_joined',)}),
        ('权限', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('登录信息', {'fields': ('last_login',)}),
    )
    list_display = ('username', 'email', 'is_active', 'is_staff', 'is_superuser')
    ordering = ('date_joined',)


class SettingAdmin(admin.ModelAdmin):
    list_display = ('display_style', 'layout_style', 'quick_mode', 'owner')


class EntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'created_at', 'belong')
    ordering = ('created_at',)
    exclude = ('is_public', 'created_by',)


class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)


class TagRelationAdmin(admin.ModelAdmin):
    list_display = ('entry', 'tag')


class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at', 'entries_num')
    ordering = ('created_at',)


admin.site.register(User, UserAdmin)
admin.site.register(Setting, SettingAdmin)
admin.site.register(Entry, EntryAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(TagRelation, TagRelationAdmin)
admin.site.register(Favorite, FavoriteAdmin)
