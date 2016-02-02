from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from django.utils.deconstruct import deconstructible

from uuid import uuid4

# Create your models here.
@deconstructible
class UploadToDir(object):
    path = "{0}/{1}/{2}.{3}"

    def __init__(self, sub_path):
        self.sub_path = sub_path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        return self.path.format(self.sub_path, instance.username, uuid4().hex, ext)


class Setting(models.Model):
    DISPLAYS = (
        ('High', '多'),
        ('Medium', '默认'),
        ('Low', '少')
    )
    LAYOUTS = (
        ('Wide', '宽'),
        ('Medium', '默认'),
        ('Narrow', '窄')
    )
    
    display_style = models.CharField(max_length=16, verbose_name='显示风格', choices=DISPLAYS, default='Medium')
    layout_style = models.CharField(max_length=16, verbose_name='布局风格', choices=LAYOUTS, default='Medium')
    hot_key = models.CharField(max_length=16, verbose_name='快捷键', blank=True)
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='setting',
                     on_delete=models.CASCADE, verbose_name='所属用户')

    def __str__(self):
        return "设置 [%s]" %(self.owner)

    class Meta:
        verbose_name = '设置'
        verbose_name_plural = '设置'


class Favorite(models.Model):
    name = models.CharField(max_length=32, verbose_name='标题', default='默认')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    is_public = models.BooleanField(verbose_name='是否公开', default=False)
    entries_num = models.IntegerField(verbose_name='条目数量', default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='favorites',
                    on_delete=models.CASCADE, verbose_name='创建用户')

    def __str__(self):
        return "%s [%s]" %(self.name, self.created_by)

    class Meta:
        verbose_name = '收藏夹'
        verbose_name_plural = '收藏夹'


class Entry(models.Model):
    PRIORITIES = (
        ('High', '高'),
        ('Medium', '中'),
        ('Low', '低')
    )

    title = models.CharField(max_length=128, verbose_name='标题')
    url = models.URLField(verbose_name='url')
    thumbnail = models.ImageField(upload_to=UploadToDir('thumbnail'), verbose_name='缩略图', blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    views = models.IntegerField(verbose_name='点击量', default=0)
    priority = models.CharField(max_length=8, verbose_name='优先级', choices=PRIORITIES, default='Medium')
    remarks = models.CharField(max_length=1024, verbose_name='备注', blank=True)
    belong = models.ForeignKey(Favorite, on_delete=models.CASCADE, related_name='entries',
                     verbose_name='所属收藏夹', blank=True)

    def __str__(self):
        return self.url

    class Meta:
        verbose_name = '条目'
        verbose_name_plural = '条目'


class Tag(models.Model):
    name = models.CharField(max_length=16, verbose_name='标题')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'


class TagRelation(models.Model):
    entry = models.ForeignKey(Entry, verbose_name='条目')
    tag = models.ForeignKey(Tag, verbose_name='标签')

    class Meta:
        verbose_name = '条目标签'
        verbose_name_plural = '条目标签'


class User(AbstractUser):
    avatar = models.ImageField(upload_to=UploadToDir('avatar'), verbose_name='头像', blank=True)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'


@receiver(pre_delete, sender=Entry)
def my_handler(entry, **kwargs):
    entry.belong.update(entries_num=F('entries_num') - 1)

