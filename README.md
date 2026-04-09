# VibeSkool 🎓

> **Learn enough. Build anything.**

The AI-native learning platform. VibeSkool teaches you the Minimum Effective Knowledge (MEK) to direct AI tools effectively — not a full curriculum, just enough to be dangerous.

---

---

## BB Casual Pro font

BB Casual Pro is a commercial typeface and is not included in this repo.
To activate it:

1. Purchase or license BB Casual Pro from its foundry
2. Export `bbcasualpro-regular.woff2` and `bbcasualpro-medium.woff2`
3. Place both files in `frontend/public/fonts/`

Until the files are present, the site falls back to **Nunito** (loaded from Google Fonts),
which shares BB Casual Pro's rounded, friendly character. The UI looks great either way.


## What's in this project

```
vibeskool/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/
│       │   ├── layout/        # AppLayout, Topbar, Sidebar
│       │   ├── terminal/      # FriendlyTerminal (the signature feature)
│       │   └── ui/            # Shared components (Button, Card, etc.)
│       ├── lib/
│       │   ├── store.js        # Zustand global state
│       │   └── terminalEval.js # Sandboxed terminal evaluator
│       └── pages/
│           ├── LandingPage      # Public marketing page
│           ├── DashboardPage    # Home after login
│           ├── PathsPage        # Browse all skill paths
│           ├── LessonPage       # The lesson + terminal view
│           ├── LabPage          # Standalone terminal sandbox
│           ├── SkillCheckPage   # Quiz system
│           └── ProfilePage      # User progress overview
│
└── backend/           # Node.js + Express + Socket.IO API
    └── src/
        ├── routes/    # REST API routes
        ├── data/      # Lesson & path content
        └── socket/    # Socket.IO event handlers
```

---

## Quick start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Set up environment variables

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### 3. Run both servers

```bash
npm run dev
```

This starts:
- **Frontend** at `http://localhost:5173`
- **Backend API** at `http://localhost:4000`

Or run them separately:

```bash
npm run dev:frontend
npm run dev:backend
```

---

## Pages & features

| Route | What it does |
|-------|-------------|
| `/` | Landing page |
| `/app/dashboard` | MEK score, stats, skill paths overview |
| `/app/paths` | Browse and expand all skill paths |
| `/app/lesson/:id` | Lesson content + The Lab terminal side by side |
| `/app/lab` | Standalone free-mode terminal sandbox |
| `/app/skillcheck` | 5-question quiz with explanations |
| `/app/profile` | Progress breakdown, builds unlocked |

---

## The Lab (Friendly Terminal)

The terminal is the platform's signature feature. It runs entirely in the browser (no server execution needed for the MVP). Available commands:

```
greetUser("name")       call a function with an argument
let x = "value"         create a variable
console.log("text")     print output
add(3, 4)               arithmetic function
shout("hello")          string transformer
reverseString("abc")    reverse a string
isEven(7)               check a condition
git status              simulated git command
npm install axios       simulated npm command
help                    list all commands
clear                   clear the terminal
```

Destructive commands (`rm -rf`, `format`, etc.) are automatically blocked with a friendly message.

---

## Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/paths` | All skill paths |
| GET | `/api/paths/:id` | Single path + lessons |
| GET | `/api/lessons` | All lessons (lightweight) |
| GET | `/api/lessons/:id` | Full lesson content |
| GET | `/api/progress/:userId` | User progress |
| POST | `/api/progress/:userId/complete` | Mark lesson complete |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | Zustand |
| Styling | CSS Modules |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database (ready) | PostgreSQL via `pg` |
| Fonts | Plus Jakarta Sans + Geist Mono |

---

## Adding more lessons

Lesson content lives in two places:

1. **Frontend** — `frontend/src/lib/store.js` → `LESSONS_CONTENT` object
2. **Backend** — `backend/src/data/content.js` → `LESSONS` object

Both use the same schema:

```js
{
  id: 'lesson-id',
  pathId: 'web-basics',
  title: 'Lesson Title',
  duration: '9 min',
  mekLabel: 'enough to do X with AI',
  sections: [
    { heading: 'Section heading', body: 'Explanation text' },
    { heading: 'Code example',   code: 'function example() {}' },
    { heading: 'Key insight',    body: '...', callout: 'The thing to remember.' },
  ],
  aiPrompt: 'The ready-made prompt users copy into Claude/ChatGPT',
  terminalMission: 'What to try in the Lab',
}
```

---


---

## Deploying to Vercel or Netlify

The frontend is a standard Vite SPA. Both hosting files are already included.

### Vercel
1. Import the repo into Vercel
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy — the `vercel.json` handles SPA routing automatically

### Netlify
1. Connect repo to Netlify
2. Set **Base directory** to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy — the `public/_redirects` file handles SPA routing automatically

No environment variables are required for the frontend-only deployment.
The backend is a separate service and is not required for the frontend to run.

## Roadmap (next things to build)

- [ ] Authentication (NextAuth or Supabase)
- [ ] PostgreSQL progress persistence
- [ ] Real Docker sandboxes for server-side code execution
- [ ] "Start from your idea" onboarding flow
- [ ] More lesson content across all 4 paths
- [ ] AI-powered "Explain this code" feature (Claude API)
- [ ] Community builds showcase
- [ ] Mobile responsive layout

---

## License

MIT — build freely.
