# VibeSkool 🎓

> **The Modern Collaborative Coding Classroom for Learners & Mentors.**

Execute code instantly in the browser, progress through hands-on test-driven curriculum tracks, and pair live with mentors with zero local environment configuration or setup drag.

---

## ✨ Key Platform Features

### 👨‍💻 For Learners
- **In-Browser IDE & Sandboxed Execution**: Code in Python and JavaScript directly in your browser with real-time test evaluations and syntax highlighting via CodeMirror.
- **Hands-On Curriculum Tracks**:
  - *Python Foundations & Algorithms*: Control flow, data structures, and algorithmic problem solving.
  - *Web Systems & Modern JavaScript*: DOM APIs, async event loops, state architecture, and REST patterns.
  - *Software Design & Engineering Patterns*: Clean architecture, TDD with automated unit tests, and concurrency.
- **Immediate Feedback Loop**: Automatic unit-test scoring, instant execution durations, and interactive skill-check quizzes after each chapter.
- **Code Lab & Playground**: Standalone scratchpad (`/app/lab`) for experimental programming and browser-safe command evaluation.
- **Community Hub**: Showcase student milestone projects (`/app/showcase`) and participate in community discussions (`/app/community/forum`).

### 👩‍🏫 For Educators & Tutors
- **Live Classroom Telemetry**: Real-time visibility into student code and test statuses across active cohorts. Spot exactly which test case a student is struggling with before they have to ask for help.
- **Multiplayer 1-on-1 Code Pairing**: One-click live pairing directly in the browser editor powered by Socket.IO real-time synchronization.
- **Cohort Management (`/app/teacher/classrooms`)**: Generate shareable cohort invite codes (e.g. `CS-104-ALGO`), manage student rosters, and monitor completion rates.
- **Content & Exercise Builder (`/app/teacher/cms`, `/app/teacher/exercises`)**: Create custom coding challenges, specify starter code, author unit test suites, and deploy custom lesson paths.

---

## 🎨 Design System & UI Architecture

- **Human-Crafted Developer Aesthetic**: Monochromatic elevation, crisp 1px borders, high-density telemetry tables, and authentic editor windows inspired by Linear, Stripe, and Vercel.
- **VibeSkool Logo Brand Color Palette**:
  - 🔵 **Blue (`#1A73E8`)**: Hero workspace, primary actions, and brand identity.
  - 🟢 **Green (`#34A853`)**: Classroom Telemetry and mentor pairing hub.
  - 🟡 **Amber (`#F9AB00`)**: Dynamic ambient energy waves and live status alerts.
  - 🔴 **Crimson (`#EA4335`)**: Structured Curriculum Tracks and test assertions.
- **Absorbed Porcelain Glassmorphic Cards**: Cards in colored sections feature semi-translucent porcelain surfaces with chromatic diffusion shadows that organically merge with their canvas.
- **Plain Solid Buttons with Animated Hover Borders**:
  - *At rest*: Flat, solid, clean buttons without heavy gradients, drop-shadows, or 3D jumps.
  - *On hover*: Dynamic multi-color conic gradient sweeps continuously around the 1.5px–2px perimeter rim while keeping button text and icons crisp and unobstructed.
- **Fluid Wave Section Transition**: A multi-layered SVG junction blending the green telemetry section into the red curriculum section, complete with an animated luminous crest beam.
- **Lenis Smooth Gliding Scroll**: Scoped exclusively to the landing page with automatic lifecycle disposal upon navigating to internal app pages.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18 (Vite SPA) |
| **Routing** | React Router DOM v6 |
| **State Management** | Zustand |
| **Code Editor** | CodeMirror 6 (`@uiw/react-codemirror`) with Python, JavaScript, and HTML extensions |
| **Smooth Scrolling** | Lenis (`lenis` v1.3.26) |
| **Icons & Typography** | Lucide React, Outfit (`@fontsource/outfit`), Geist Mono (`@fontsource/geist-mono`) |
| **Styling** | Scoped CSS Modules with custom CSS design tokens |
| **Backend Framework** | Node.js + Express |
| **Real-Time Communication** | Socket.IO |
| **Database & Persistence** | PostgreSQL (`pg`) with automatic in-memory fallback for zero-config local development |
| **Authentication** | JWT (`jsonwebtoken`), bcrypt password hashing, role-based access control (Student / Teacher / Admin) |

---

## 📁 Project Structure

```
vibeskool/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ide/            # StudentIDE in-browser code workspace
│   │   │   ├── layout/         # AppLayout, Topbar, Sidebar, ProtectedRoute, SmoothScroll
│   │   │   ├── terminal/       # FriendlyTerminal sandboxed evaluator
│   │   │   └── ui/             # Reusable UI system (Button, Card, Badge, BrandLogo, ProgressBar)
│   │   ├── lib/
│   │   │   ├── api.js          # Unified REST API client
│   │   │   ├── auth.js         # useAuth context & JWT session storage
│   │   │   ├── socket.js       # Socket.IO client instance
│   │   │   ├── store.js        # Global Zustand state (paths, lessons, classrooms)
│   │   │   └── theme.js        # App theme persistence & management
│   │   └── pages/
│   │       ├── LandingPage     # Public high-end landing page with Lenis smooth scroll
│   │       ├── SignInPage      # Authentication sign-in
│   │       ├── SignUpPage      # Multi-role sign-up (Student / Instructor)
│   │       ├── DashboardPage   # Student command dashboard & recent progress
│   │       ├── PathsPage       # Interactive course curriculum tracks
│   │       ├── LessonPage      # Single-column reading view with slide-out practice drawer
│   │       ├── LabPage         # Standalone coding sandbox
│   │       ├── SkillCheckPage  # Automated quiz & skill assessment
│   │       ├── JoinClassroom   # Cohort code entry portal
│   │       ├── ProfilePage     # Learning achievements & statistics
│   │       ├── SettingsPage    # Account preferences & theme switcher
│   │       ├── community/      # Student project showcase & forums
│   │       └── teacher/        # Teacher dashboard, classroom manager, multiplayer IDE, exercise builder
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── db/                 # PostgreSQL connection pool, schema, and seed scripts
│   │   ├── middleware/         # JWT authentication & role-verification middleware
│   │   ├── routes/             # REST endpoints (auth, paths, lessons, classrooms, exercises, forums)
│   │   ├── socket/             # Socket.IO handlers for multiplayer code pairing & telemetry
│   │   └── index.js            # Express server initialization
│   └── package.json
│
├── package.json                # Root package for concurrent development scripts
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL** *(Optional)*: If no database is configured, the backend automatically runs in local memory mode for immediate zero-config testing.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sheddy-cyber/vibeskool.git
cd vibeskool

# Install root, frontend, and backend dependencies concurrently
npm run install:all
```

### 2. Environment Variables

Create `.env` files in both `frontend` and `backend`:

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Default frontend configuration (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

Default backend configuration (`backend/.env`):
```env
PORT=4000
JWT_SECRET=supersecret_dev_jwt_key_vibeskool_2026
CLIENT_ORIGIN=http://localhost:5173
# Optional: DATABASE_URL=postgres://postgres:postgres@localhost:5432/vibeskool
```

### 3. Run Development Servers

Start both frontend and backend concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

Or run each service individually:
```bash
# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```

---

## 🗺️ Application Routes

| Route | Role / Access | Description |
|-------|---------------|-------------|
| `/` | Public | High-end developer marketing landing page with Lenis smooth scroll |
| `/signin` | Public | Account authentication & login |
| `/signup` | Public | Account registration with role selection (`Student` or `Instructor`) |
| `/app/dashboard` | Student / All | Welcome hub, active course progress, daily streak, and course overview |
| `/app/paths` | Student / All | Browse and expand structured engineering curriculum tracks |
| `/app/paths/:pathId/lessons/:lessonId` | Student / All | Full lesson reading pane with slide-out practice IDE & terminal |
| `/app/paths/:pathId/modules/:moduleId/skill-check` | Student / All | Interactive chapter comprehension quiz |
| `/app/lab` | Student / All | Standalone coding sandbox and browser terminal |
| `/app/classrooms` | Student | Active classroom cohorts & join classroom portal |
| `/app/showcase` | Student / All | Community student project gallery |
| `/app/profile` | Student / All | User profile, learning stats, and completed milestones |
| `/app/settings` | Student / All | Account preferences and UI theme options |
| `/app/teacher/dashboard` | Instructor / Admin | Educator command center & cohort health statistics |
| `/app/teacher/classrooms` | Instructor / Admin | Classroom cohort manager & invite code generator |
| `/app/teacher/cms` | Instructor / Admin | Curriculum authoring & module editor |
| `/app/teacher/exercises` | Instructor / Admin | Challenge builder & automated test suite creator |

---

## 🔌 Backend API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Create user account (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Verify session and retrieve current user object.

### Curriculum & Progress (`/api/paths`, `/api/lessons`, `/api/progress`)
- `GET /api/paths` — List all published curriculum tracks and modules.
- `GET /api/paths/:id` — Fetch complete syllabus for a path.
- `GET /api/lessons/:id` — Fetch interactive lesson sections and challenges.
- `POST /api/progress/:userId/complete` — Mark lesson completed and update user streak.

### Classrooms & Multiplayer Pairing (`/api/classrooms`)
- `GET /api/classrooms` — List user's active classrooms.
- `POST /api/classrooms` — Create classroom cohort and generate unique invite code.
- `POST /api/classrooms/join` — Join cohort via invite code (e.g. `CS-104-ALGO`).
- `GET /api/classrooms/:id/telemetry` — Retrieve live student progress and test statuses.

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)
The frontend is a standard Vite Single Page Application (SPA):
1. Connect the repository to your host.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Set `VITE_API_URL` and `VITE_SOCKET_URL` environment variables pointing to your backend service.

### Backend (Render / Railway / Docker)
1. Deploy from the `backend/` root directory.
2. Set **Start Command** to `node src/index.js`.
3. Supply production environment variables (`JWT_SECRET`, `CLIENT_ORIGIN`, `DATABASE_URL`).
4. Execute `node src/db/migrate.js` to initialize PostgreSQL tables.

---

## 📄 License

Distributed under the MIT License. Built with passion for modern engineering education.
