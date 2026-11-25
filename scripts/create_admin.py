"""Optionally create the first Django admin from Render environment variables."""
import os
import sys

import django

username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

if not all((username, email, password)):
    print(
        "Admin bootstrap skipped. Set DJANGO_SUPERUSER_USERNAME, "
        "DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD in Render "
        "to create the admin account during the next deploy."
    )
    sys.exit(0)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

User = get_user_model()
if User.objects.filter(username=username).exists():
    print(f"Admin user {username!r} already exists; leaving it unchanged.")
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Created Django admin user {username!r}.")
