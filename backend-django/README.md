# VibeSkool API (Django)

The VibeSkool backend, built with Django and Django REST Framework. It is replacing the
Express server in `../backend` one area at a time and keeps the same API, so the React
app works with either.

- **Accounts:** email and password sign-in, Google sign-in, and profiles. Tokens are
  JWTs that both servers accept, and bcrypt passwords from the Express database still
  work (they are upgraded on the next sign-in).
- **Learning:** paths, lessons, progress, streaks, XP and skill checks. Skill checks are
  graded on the server, so the answers never reach the browser.
- **Classrooms:** where a tutor and their students work together:
  - a class stream with announcements, discussion and questions to the tutor (which can
    be private, tied to a lesson, include code and be marked resolved)
  - assignments (finish a lesson, hand in code, or hand in a link) with a status for
    each student
  - feedback on submissions, which can point at a single line of code
  - a "who needs help" view: questions waiting on the tutor, overdue work and inactive
    students, with the most urgent first
  - nudges: short private messages from the tutor to one student
  - live updates: class pages change as people post, hand in and review, over a
    WebSocket (Django Channels). The socket only says *what* changed; pages refetch
    through the API, so permissions are checked in one place
  - feedback that follows the code: when a student hands in changed code, a line
    comment moves with its line, or is marked outdated if that line was edited
- **Admin (CMS):** lessons, paths, skill-check questions and answers, classes,
  submissions and users, all editable at `/admin`.

## Run it locally

```powershell
cd backend-django
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env          # then fill in JWT_SECRET (same as backend/.env)
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_content   # paths, lessons, skill checks
.venv\Scripts\python manage.py seed_demo      # optional: demo class, tutor and students
.venv\Scripts\python manage.py runserver 8000   # Daphne: HTTP and WebSockets
```

To run the React app against Django instead of Express, use `npm run dev:django` in
`frontend/`.

`seed_demo` creates `admin@`, `tutor@`, and `ada@`, `tunde@`, `mira@`, `leo@` and `ife@`
accounts at `demo.vibeskool.test`. Their password comes from `DEMO_PASSWORD`, or the
default in `apps/classrooms/management/commands/seed_demo.py`. It only runs with
`DJANGO_DEBUG=1`.

- API docs: http://localhost:8000/api/docs
- Admin: http://localhost:8000/admin

## Production

Run under an ASGI server so WebSockets work, and set `REDIS_URL` when there is more
than one process (without it, live updates use an in-memory layer that only works
in a single process):

```bash
python manage.py collectstatic --noinput
python manage.py migrate
daphne -b 0.0.0.0 -p $PORT config.asgi:application
```

## Tests

```powershell
.venv\Scripts\python manage.py test
```

## Layout

```
config/            settings, URLs
apps/accounts/     User model, JWT authentication, sign-in views, permissions
apps/learning/     paths, lessons, progress, streaks, skill checks (+ seed_content)
apps/classrooms/   classes, stream, assignments, feedback, insights, nudges, live.py (+ seed_demo)
seed/              lesson content and skill-check questions as JSON
```

All errors come back as `{"error": "message"}`. Validation errors also include
`"fields"` with the details for each field.
