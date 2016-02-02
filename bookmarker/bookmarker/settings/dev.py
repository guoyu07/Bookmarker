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

'''
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['MYSQL_INSTANCE_NAME'],
        'USER': os.environ['MYSQL_USERNAME'],
        'PASSWORD': os.environ['MYSQL_PASSWORD'],
        'HOST': os.environ['MYSQL_PORT_3306_TCP_ADDR'],
        'PORT': os.environ['MYSQL_PORT_3306_TCP_PORT']
    }
}
'''
