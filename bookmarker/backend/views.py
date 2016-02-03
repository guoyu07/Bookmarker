from .models import User, Entry, Favorite, Setting, Tag, TagRelation
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from .serializers import (EntrySerializer, FavoriteSerializer, PasswordSerializer,
    SettingSerializer, TagSerializer, TagRelationSerializer, UserSerializer)

from .permissions import (IsAdminOrIsSelf, EntryOwnerCanEditPermission, UserOwnerCanEditPermission,
    SettingOwnerCanEditPermission, FavoriteOwnerCanEditPermission)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny, UserOwnerCanEditPermission)

    @detail_route(methods=['post'], permission_classes=[IsAdminOrIsSelf])
    def set_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.data['password'])
            user.save()
            return Response({'status': '密码设置成功'})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @detail_route()
    def favorites(self, request, pk=None):
        user = self.get_object()
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
    permission_classes = (EntryOwnerCanEditPermission, )


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all().order_by('-created_at')
    serializer_class = FavoriteSerializer
    permission_classes = (FavoriteOwnerCanEditPermission, permissions.IsAuthenticated)

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

