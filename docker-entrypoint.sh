# gunicorn --chdir=bookmarker bookmarker.wsgi:application -c gunicorn_conf.py
python3 bookmarker/manage.py runserver 0.0.0.0:8000