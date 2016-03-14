from .base import *
import sys
# DEBUG = False

# ALLOWED_HOSTS = []

if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'bookmarker'),
        }
    }
else:
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
