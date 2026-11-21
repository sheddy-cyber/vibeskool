# VibeSkool

Learn just enough code to build with AI. VibeSkool teaches the minimum a person needs
to understand, direct and fix what AI writes for them: short lessons, a real terminal
and code playground in the browser, skill checks, and tutors who run classes and write
their own courses.

## What's in it

**For learners**
- **Paths and lessons:** short lessons grouped into modules, each with a terminal
  mission, a scratchpad and an AI tutor, plus a skill check at the end of a module.
- **Playground:** a browser terminal with a virtual file system, Git, npm and Node,
  next to an editor and live preview.
- **Classes:** a class stream for questions (privately, if you like) and discussion,
  assignments with line-by-line feedback on your code, and live updates.
- **Showcase:** share what you built (a live site, a GitHub repo, or both) with
  everyone who worked on it credited; appreciate and comment on other people's work.
- **Profile and settings:** a public profile, light/dark themes, and a choice of
  Exo 2 or Geist as the interface font.

**For tutors**
- **Overview:** what needs you across your classes (questions waiting, work to review,
  students falling behind).
- **Classes:** invite codes, the class stream, classwork and reviews, a "needs help"
  view and nudges.
- **Courses:** build your own courses (modules, lessons, exercises) alone or with other
  tutors, then share them with your classes. Each course is visible only to its team
  until it's published and shared.
- **Exercises:** coding tasks with tests, checked against your own solution as you
  write them.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router 6, Zustand, CSS Modules |
| Editor | CodeMirror 6 (HTML, CSS, JavaScript, Python) |
| Backend | Django 6, Django REST Framework, Django Channels (WebSockets) |
| Database | PostgreSQL (Supabase) in production; SQLite for local development |
| Auth | JWT, bcrypt-compatible password hashing, Google sign-in |
| AI | Google Gemini (lesson tutor and exercise hints) |
| Fonts | Exo 2 and Geist (interface), Geist Mono (code) |

## Project structure

```
vibeskool/
├── frontend/                 React app
│   └── src/
│       ├── components/       layout, lesson, playground, terminal, classroom, showcase, icons
│       ├── lib/              API client, auth, live updates, the browser shell (lib/shell)
│       └── pages/            learner pages, classroom/, showcase/, teaching/ (tutor side)
├── backend-django/           Django API (see its README)
│   ├── apps/accounts/        users, sign-in, profiles
│   ├── apps/learning/        courses, lessons, progress, skill checks, exercises, studio
│   ├── apps/classrooms/      classes, stream, assignments, feedback, live updates
│   └── apps/showcase/        projects, collaborators, appreciations, comments
└── package.json              scripts to run both
```

## Run it locally

You need Node.js 18+ and Python 3.12+.

```bash
git clone https://github.com/sheddy-cyber/vibeskool.git
cd vibeskool
npm run install:all

cd backend-django
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt   # macOS/Linux: .venv/bin/python
copy .env.example .env                                     # then fill it in
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_content                # lessons and skill checks
cd ..

npm run dev
```

- App: http://localhost:5173
- API: http://localhost:8000/api (docs at `/api/docs`, admin at `/admin`)

The Vite dev server forwards `/api` and `/ws` to Django, so the frontend needs no API
address in development. Other commands:

```bash
npm run dev:frontend    # the React app only
npm run dev:backend     # the Django API only
```

For demo data, run `manage.py seed_demo` and `manage.py seed_showcase` in
`backend-django/` (development only).

## Deploying

The app runs on Vercel, the API and Redis on Render (`render.yaml`), and the
database and uploads on Supabase. [DEPLOYING.md](DEPLOYING.md) walks through
it step by step: email, the Judge0 code runner, error reports, nightly
encrypted backups, and a checklist for after launch.

## License

MIT
