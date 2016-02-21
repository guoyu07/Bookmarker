python3 bookmarker/manage.py migrate
# python3 bookmarker/manage.py runserver 0.0.0.0:8000
gunicorn --chdir=bookmarker bookmarker.wsgi:application -c gunicorn_conf.py
