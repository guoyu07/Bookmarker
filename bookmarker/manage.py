#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    if '--dev' in sys.argv:
        # for development
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bookmarker.settings.dev")
        sys.argv.remove('--dev')
    else:
        # for production
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bookmarker.settings.prod")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
