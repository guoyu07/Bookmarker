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

        page = self.paginate_queryset(favorites)
        if page is not None:
            serializer = FavoriteSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
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
                Entry.objects.create(**serializer.validated_data)
                return Response(make_status(True))
            return Response(make_status(False, reason='拒绝访问'),
                                status=status.HTTP_403_FORBIDDEN)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all().order_by('-created_at')
    serializer_class = FavoriteSerializer
    permission_classes = (FavoriteOwnerCanEditPermission, CanViewPermisson, permissions.IsAuthenticated)

    def list(self, request):
        if request.user.is_superuser:
            queryset = Favorite.objects.all()
        else:
            queryset = Favorite.objects.filter(Q(created_by=request.user.id) | Q(is_public=True))
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
