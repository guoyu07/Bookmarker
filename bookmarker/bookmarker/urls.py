"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url, include, patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import TemplateView
from rest_framework import routers
from backend import views


router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'entries', views.EntryViewSet)
router.register(r'favorites', views.FavoriteViewSet)
router.register(r'settings', views.SettingViewSet)

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='home.html'), name='home'),
    url(r'^web/$', TemplateView.as_view(template_name=settings.WEB_ROOT+'/index.html')),
    url(r'^sign-up/', views.sign_up, name="sign-up"),
    url(r'^qq-login', views.qq_login, name="qq-login"),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-token-auth/', 'rest_framework_jwt.views.obtain_jwt_token'),
    url(r'^api-token-refresh/', 'rest_framework_jwt.views.refresh_jwt_token'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT
) + static(settings.WEB_URL, document_root=settings.WEB_ROOT)
