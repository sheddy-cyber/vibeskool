# VibeSkool API (Django)

The VibeSkool backend, built with Django and Django REST Framework. It serves
everything the React app in `../frontend` uses.

- **Accounts:** email and password sign-in, Google sign-in, and profiles. Tokens are
  JWTs. Accounts imported from the earlier Express server keep their passwords (bcrypt
  hashes are upgraded on the next sign-in).
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
- **Course studio (tutors):** tutors build their own courses (modules, lessons,
  exercises) alone or as a team. A course belongs to its team: other tutors can't see
  or touch it. The owner invites tutors by email (the reply never reveals whether an
  account exists), can hand over ownership, and decides which of their classes see the
  course once it's published. Saving over a teammate's newer changes is refused, so
  nobody silently overwrites anyone. VibeSkool's own (official) courses are read-only
  except for admins. All the rules live in `apps/learning/access.py`.
- **Tutor overview:** one place for what needs a tutor across their classes.
- **Showcase:** students and tutors share what they built: a live site, a GitHub repo,
  or both, with an optional preview image. Projects credit everyone who worked on them
  (collaborators come from people you share a class with), can be drafts, get
  appreciations and comments, and can be featured by the tutor of the class they were
  built in. Uploaded images are checked, resized and re-encoded, which also strips
  location data from photos.
- **Profiles:** headline, bio, GitHub, website and photo; learning stats can be hidden.
- **Admin (CMS):** lessons, paths, skill-check questions and answers, classes,
  submissions and users, all editable at `/admin`.

## Run it locally

```powershell
cd backend-django
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env          # then fill in JWT_SECRET and DATABASE_URL
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_content   # paths, lessons, skill checks
.venv\Scripts\python manage.py seed_demo      # optional: demo class, tutor and students
.venv\Scripts\python manage.py seed_showcase  # optional: demo projects (after seed_demo)
.venv\Scripts\python manage.py runserver 8000   # Daphne: HTTP and WebSockets
```

`npm run dev` in the project root starts this API and the React app together.

Without `DATABASE_URL` the API uses a local SQLite file (`db.sqlite3`).
`import_express` is a one-time tool that copied the old Express server's tables into
Django's; it's only needed if you're moving another copy of that database.

`seed_demo` creates `admin@`, `tutor@`, and `ada@`, `tunde@`, `mira@`, `leo@` and `ife@`
accounts at `demo.vibeskool.test`. Their password comes from `DEMO_PASSWORD`, or the
default in `apps/classrooms/management/commands/seed_demo.py`. It only runs with
`DJANGO_DEBUG=1`.

- API docs: http://localhost:8000/api/docs (development only)
- Admin: http://localhost:8000/admin (or `ADMIN_PATH`)

## Production

The full walkthrough (Render, Supabase Storage, email, Judge0, Sentry, backups)
is in [../DEPLOYING.md](../DEPLOYING.md). In short:

- With `DJANGO_DEBUG` off the server refuses to start unless `DJANGO_SECRET_KEY`
  and `JWT_SECRET` are 32+ random characters, and it turns on HTTPS-only,
  HSTS and the other security headers. `manage.py check --deploy` is clean.
- Uploads go to a public Supabase Storage bucket when the `STORAGE_*` variables
  are set (`move_media_to_storage` copies files from local disk).
- Exercise code runs on Judge0 (`JUDGE0_KEY`) or a self-hosted Piston (`PISTON_URL`),
  all test cases in one run. Without either, exercises say checking isn't set up.
- Skill checks are marked here: answers are locked in one at a time, and the
  score comes from those.
- Email goes through any SMTP provider (`EMAIL_*`): password resets, and tutor
  requests that an admin approves under Users.
- `/api/health` checks the database, for the host's health check and uptime monitors.
- `SENTRY_DSN` turns on error reports.

Run under an ASGI server so WebSockets work, and set `REDIS_URL` when there is more
than one process (live updates and rate limits are shared through it):

```bash
python manage.py collectstatic --noinput
python manage.py migrate
daphne --proxy-headers -b 0.0.0.0 -p $PORT config.asgi:application
```

## Tests

```powershell
.venv\Scripts\python manage.py test
```

## Layout

```
config/            settings, URLs
apps/accounts/     User model, JWT authentication, sign-in views, permissions
apps/learning/     courses, lessons, progress, skill checks, exercises, AI tutor,
                   studio.py (course studio), access.py (who sees and edits what)
apps/classrooms/   classes, stream, assignments, feedback, insights, nudges, live.py (+ seed_demo)
apps/showcase/     projects, collaborators, appreciations, comments (+ seed_showcase)
apps/images.py     upload checks, resizing and metadata stripping
seed/              lesson content and skill-check questions as JSON
```

All errors come back as `{"error": "message"}`. Validation errors also include
`"fields"` with the details for each field.
