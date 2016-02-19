from django.db.models import Q
from .models import User, Entry, Favorite, Setting, Tag, TagRelation
from .utils import make_status
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from .serializers import (EntrySerializer, FavoriteSerializer, PasswordSerializer,
    SettingSerializer, TagSerializer, TagRelationSerializer, UserSerializer)

from .permissions import (IsAdminOrIsSelf, EntryOwnerCanEditPermission, UserOwnerCanEditPermission,
    SettingOwnerCanEditPermission, FavoriteOwnerCanEditPermission, CanViewPermisson)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny, UserOwnerCanEditPermission)

    @detail_route(methods=['put', 'post'], permission_classes=[IsAdminOrIsSelf])
    def set_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.data['password'])
            user.save()
            return Response(make_status(True))
        else:
            return Response(make_status(False, reason='格式错误'),
                            status=status.HTTP_400_BAD_REQUEST)

    @detail_route()
    def favorites(self, request, pk=None):
        user = self.get_object()
        if request.user.is_superuser or request.user.id == user.id:
            favorites = Favorite.objects.filter(created_by=user)
        else:
            favorites = Favorite.objects.filter(created_by=user, is_public=True)

        # 分页
        # page = self.paginate_queryset(favorites)
        # if page is not None:
        #     serializer = FavoriteSerializer(page, many=True, context={'request': request})
        #     return self.get_paginated_response(serializer.data)

        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    @detail_route()
    def entries(self, request, pk=None):
        user = self.get_object()
        if request.user.is_superuser or request.user.id == user.id:
            entries = Entry.objects.filter(created_by=user)
        else:
            entries = Entry.objects.filter(created_by=user, is_public=True)

        serializer = EntrySerializer(entries, many=True, context={'request': request})
        return Response(serializer.data)


class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all().order_by('-created_at')
    serializer_class = EntrySerializer
    permission_classes = (EntryOwnerCanEditPermission, CanViewPermisson, permissions.IsAuthenticated)

    def list(self, request):
        if request.user.is_superuser:
            queryset = Entry.objects.all()
        else:
            queryset = Entry.objects.filter(Q(created_by=request.user.id) | Q(is_public=True))
        serializer = EntrySerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        serializer = EntrySerializer(data=request.data)
        if serializer.is_valid():
            # 检查收藏夹是否属于请求用户
            if Favorite.objects.filter(created_by=request.user.id,
                id=request.data['belong']).exists():
                entry = Entry.objects.create(**serializer.validated_data)
                serialized_entry = EntrySerializer(entry)
                return Response(serialized_entry.data, status=status.HTTP_201_CREATED)
            return Response(make_status(False, reason='拒绝访问'),
                                status=status.HTTP_403_FORBIDDEN)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        entry = self.get_object()
        orig_favor = entry.belong
        entry = serializer.save()
        new_favor = entry.belong
        if orig_favor.id != new_favor.id:
            entry.is_public = new_favor.is_public
            orig_favor.entries_num -= 1
            new_favor.entries_num += 1
            entry.save()
            orig_favor.save()
            new_favor.save()

    @detail_route(methods=['get'])
    def tags(self, request, pk=None):
        entry = self.get_object()
        tags = entry.tag_set.all()
        serializer = TagSerializer(tags, many=True, context={'request': request})
        return Response(serializer.data)

    # @list_route(methods=['post'])
    # def quick_add(self, request, pk=None):
    #     from urllib.request import urlopen
    #     import re
    #     # content = urlopen('https://baidu.com', timeout=5).read()
    #     # for m in re.finditer(b'<title>(.*)</title>', content):
    #     #     print(m.group(1).decode())
    #
    #     return Response({'st':True})


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all().order_by('-created_at')
    serializer_class = FavoriteSerializer
    permission_classes = (FavoriteOwnerCanEditPermission, CanViewPermisson, permissions.IsAuthenticated)

    def list(self, request):
        if request.user.is_superuser:
            queryset = Favorite.objects.all()
        else:
            queryset = Favorite.objects.filter(is_public=True).exclude(created_by=request.user.id)
        serializer = FavoriteSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = (SettingOwnerCanEditPermission, permissions.IsAuthenticated)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class TagRelationViewSet(viewsets.ModelViewSet):
    queryset = TagRelation.objects.all()
    serializer_class = TagRelationSerializer
