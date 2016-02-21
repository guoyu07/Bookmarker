from .base import *

DEBUG = False

ALLOWED_HOST = ['*']

INSTALLED_APPS += (
    'gunicorn',
)

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
