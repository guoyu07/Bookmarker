# python3 bookmarker/manage.py runserver 0.0.0.0:8000
python3 bookmarker/manage.py migrate
gunicorn --chdir=bookmarker bookmarker.wsgi:application -c gunicorn_conf.py
