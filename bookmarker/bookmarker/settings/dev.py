from .base import *

DEBUG = True

APPS = (
	# django extensions here
)

INSTALLED_APPS += APPS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '3306'
    }
}
