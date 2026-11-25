IXLOSBEK PORTFOLIO — DJANGO + RENDER
====================================

PROJECT FEATURES
----------------
- Django admin panel at /admin/.
- Projects can be edited, added, hidden and reordered in admin.
- Contact form saves messages to the database.
- Page-view log stores path and session only (no visitor IP address).
- Local scripted assistant: prepared answers about projects, skills and contacts.
  It is not a neural network and does not require an AI API key.
- Interactive portfolio UI, mini-games and responsive layout.

DEPLOY TO RENDER (RECOMMENDED: BLUEPRINT)
-----------------------------------------
1. Extract this ZIP on your computer.
2. Create a GitHub repository and upload the CONTENTS of the
   ixlosbek_portfolio_site folder (the folder containing manage.py and render.yaml).
3. Sign in at https://render.com/ and open https://dashboard.render.com/blueprints.
4. Click New Blueprint Instance, connect your GitHub repository and select it.
5. Render reads render.yaml and creates the Django web service and PostgreSQL DB.
6. Wait for the first deploy to finish, then open the .onrender.com address shown
   on the web service page.

The Blueprint currently selects Render's Free plans for the web service and DB.
Free web services sleep after 15 minutes without traffic and can take about a
minute to wake. Free PostgreSQL expires 30 days after creation; upgrade the DB
before expiry to keep its data. Do not treat a free database as permanent storage.

DJANGO ADMIN ACCOUNT
--------------------
Free Render web services do not provide the Render Shell. To create the first
Django admin user, add these three variables in the web service's Environment
page, then trigger a Manual Deploy:

DJANGO_SUPERUSER_USERNAME = your chosen username
DJANGO_SUPERUSER_EMAIL = your email address
DJANGO_SUPERUSER_PASSWORD = a strong unique password

The build script creates this admin user after migrations. It never prints the
password. After the user exists, you can remove DJANGO_SUPERUSER_PASSWORD from
the Environment page. Future deploys will not change an existing user's password.

The admin page is https://YOUR-SERVICE.onrender.com/admin/.

MANUAL RENDER SETTINGS (IF NOT USING render.yaml)
-------------------------------------------------
Runtime: Python 3
Build command: ./build.sh
Start command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
Environment variables:
  DJANGO_DEBUG=0
  DJANGO_SECRET_KEY=<generate a secret value in Render>
  DATABASE_URL=<Internal Database URL from your Render PostgreSQL database>
  WEB_CONCURRENCY=1

LOCAL INSTALL ON UBUNTU
-----------------------
cd ixlosbek_portfolio_site
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

Open http://127.0.0.1:8000/ and http://127.0.0.1:8000/admin/.

IMPORTANT
---------
- Never commit .env files, passwords, or API keys to GitHub.
- The local assistant does not use OpenAI and does not need an API key.
- Render's filesystem is ephemeral. The Render PostgreSQL database stores
  projects, contact messages and page visits persistently (subject to DB plan).
