import { create } from 'zustand'

// ─── Seed data ────────────────────────────────────────────────────────────────

export const PATHS = [
  {
    id: 'web-basics',
    icon: '🌐',
    name: 'Vibe Coding for Web',
    description: 'HTML, CSS & JS — only the parts that matter for working with AI',
    color: 'violet',
    tag: 'Beginner',
    lessons_data: [
      { id: 'frontend-vs-backend', title: 'Frontend vs Backend — what is what',     duration: '8 min'  },
      { id: 'html-structure',      title: 'How HTML structures a page',              duration: '8 min'  },
      { id: 'css-layout',          title: 'CSS Layout without the headache',         duration: '10 min' },
      { id: 'js-variables',        title: 'Variables — where data lives',            duration: '7 min'  },
      { id: 'js-functions',        title: 'Functions — reusable code blocks',        duration: '9 min'  },
      { id: 'js-arrays',           title: 'Arrays & loops in plain English',         duration: '8 min'  },
      { id: 'js-async',            title: 'Async / Await — waiting for things',      duration: '11 min' },
      { id: 'reading-ai-code',     title: 'Reading AI-generated code calmly',        duration: '12 min' },
      { id: 'debug-ai',            title: 'How to solve an error (step by step)',    duration: '10 min' },
    ],
  },
  {
    id: 'vibe-coding',
    icon: '🤖',
    name: 'Vibe Coding Mastery',
    description: 'How to prompt AI, what to watch for, and how to stay in control',
    color: 'teal',
    tag: '🔥 Essential',
    lessons_data: [
      { id: 'prompting-ai',      title: 'How to prompt AI effectively',            duration: '10 min' },
      { id: 'vibe-checklist',    title: 'What to check when vibe coding',          duration: '9 min'  },
      { id: 'error-solving',     title: 'How to solve an error without panicking', duration: '10 min' },
      { id: 'reading-ai-output', title: 'Reading AI output before running it',     duration: '8 min'  },
      { id: 'iterating-with-ai', title: 'Iterating with AI — back and forth',      duration: '9 min'  },
    ],
  },
  {
    id: 'git-github',
    icon: '🗂️',
    name: 'Git & GitHub Basics',
    description: 'Version control just enough to never lose your work again',
    color: 'amber',
    tag: 'Beginner',
    lessons_data: [
      { id: 'what-is-git',       title: 'What is Git and why it matters',          duration: '7 min'  },
      { id: 'git-core-commands', title: 'The 5 git commands you actually need',    duration: '10 min' },
      { id: 'github-basics',     title: 'GitHub — putting your code online',       duration: '8 min'  },
      { id: 'git-with-ai',       title: 'Using AI to write your git workflow',     duration: '9 min'  },
    ],
  },
  {
    id: 'python-basics',
    icon: '🐍',
    name: 'Python for AI Builders',
    description: 'Enough Python to read, tweak, and direct AI-generated scripts',
    color: 'violet',
    tag: 'Beginner',
    lessons_data: [
      { id: 'py-syntax',    title: 'Python syntax in 10 minutes', duration: '10 min' },
      { id: 'py-functions', title: 'Functions & arguments',        duration: '8 min'  },
      { id: 'py-lists',     title: 'Lists, dicts & loops',         duration: '9 min'  },
      { id: 'py-files',     title: 'Reading & writing files',      duration: '7 min'  },
    ],
  },
  {
    id: 'apis',
    icon: '🔌',
    name: 'APIs, Explained Simply',
    description: 'What APIs are, how they talk, and how to get AI to build them',
    color: 'amber',
    tag: 'Beginner',
    lessons_data: [
      { id: 'what-is-api', title: 'What even is an API?',           duration: '6 min' },
      { id: 'http-basics', title: 'GET, POST — talking to the web', duration: '8 min' },
      { id: 'json',        title: 'JSON — data in transit',          duration: '7 min' },
      { id: 'auth-basics', title: 'API keys & authentication',       duration: '9 min' },
    ],
  },
  {
    id: 'sql',
    icon: '🗄️',
    name: 'SQL Without the Pain',
    description: 'Read and write queries just well enough to tell AI what you need',
    color: 'red',
    tag: 'Beginner',
    lessons_data: [
      { id: 'sql-select', title: 'SELECT — asking questions of data', duration: '8 min'  },
      { id: 'sql-filter', title: 'WHERE — filtering results',          duration: '7 min'  },
      { id: 'sql-joins',  title: 'Joins — connecting tables',          duration: '10 min' },
    ],
  },
]

// ─── Full lesson content ──────────────────────────────────────────────────────

export const LESSONS_CONTENT = {

  'frontend-vs-backend': {
    pathId: 'web-basics',
    title: 'Frontend vs Backend — what is what',
    duration: '8 min',
    mekLabel: 'enough to have a real conversation with any developer or AI',
    sections: [
      {
        heading: 'The simplest explanation',
        body: `Every web application has two sides. The frontend is everything the user sees and touches — the buttons, the layout, the colors. The backend is the invisible engine behind it — the database, the logic, the server that responds when you click things.`,
      },
      {
        heading: 'The restaurant analogy',
        body: `Think of a restaurant. The frontend is the dining room — the decor, the menu, the table you sit at. The backend is the kitchen — where the actual food is made. Customers only see the dining room, but nothing works without the kitchen.`,
        callout: `When you ask AI to build an app, it will build both sides. Knowing which is which means you can point it at the right one when something needs fixing.`,
      },
      {
        heading: 'What lives where',
        code: `// FRONTEND (runs in the browser)
HTML   → structure and content
CSS    → styling and layout
JS     → interactivity and UI logic

// BACKEND (runs on a server)
Node / Python / etc  → business logic
Database             → storing data
API                  → bridge between the two`,
      },
      {
        heading: 'Why vibe coders need to know this',
        body: `When AI generates code, it mixes frontend and backend all the time. If your button is not working, that is a frontend problem. If your data is not saving, that is a backend problem. Knowing the difference cuts your debugging time in half — you tell the AI exactly where to look.`,
      },
    ],
    aiPrompt: `Explain the difference between frontend and backend to me like I am a non-developer. Then show me a simple example where both are needed — like a login form that saves to a database.`,
    terminalMission: `Type help to see available commands, then try: greetUser("frontend learner") — that is a frontend function call.`,
  },

  'js-functions': {
    pathId: 'web-basics',
    title: 'Functions — reusable code blocks',
    duration: '9 min',
    mekLabel: 'enough to read any AI-generated JS file',
    sections: [
      {
        heading: 'The idea in plain English',
        body: `A function is a reusable block of code that does one specific job. Think of it like a coffee machine — you press a button (call the function), it runs its process, and gives you a result. You do not need to know how it works inside to use it.`,
      },
      {
        heading: 'Why this matters for AI coding',
        body: `When AI generates code, it wraps almost everything in functions. Knowing this means you can read the output, spot what does what, and tell the AI exactly which part needs changing — without touching anything else.`,
        callout: `You do not need to understand every line. You just need to recognize when something is a function and understand what job it is doing.`,
      },
      {
        heading: 'What it looks like',
        code: `function greetUser(name) {\n  return "Hello, " + name\n}\n\n// Calling it:\ngreetUser("Shedrach")\n// → "Hello, Shedrach"`,
      },
      {
        heading: 'The pattern to recognize',
        body: `Every function has three parts: a name (what it is called), parameters (what it needs to do its job), and a return value (what it gives back). When AI code breaks, it is usually one of these three things that is wrong.`,
      },
    ],
    aiPrompt: `Write me a JavaScript function that takes a user's name and email, and returns a welcome message string. Add a comment on each line explaining what it does.`,
    terminalMission: `Call the greetUser() function with your own name and see what happens.`,
  },

  'html-structure': {
    pathId: 'web-basics',
    title: 'How HTML structures a page',
    duration: '8 min',
    mekLabel: 'enough to understand any webpage AI builds for you',
    sections: [
      {
        heading: 'The idea in plain English',
        body: `HTML is like the skeleton of a webpage. It does not make things look good (that is CSS) — it just says what things are: this is a heading, this is a paragraph, this is a button.`,
      },
      {
        heading: 'Tags are just labels',
        body: `Every HTML element is wrapped in angle brackets called tags. There is an opening tag and a closing tag, and the content sits in between.`,
        code: `<h1>This is a big heading</h1>\n<p>This is a paragraph of text.</p>\n<button>Click me</button>`,
      },
      {
        heading: 'Why nesting matters',
        body: `HTML elements can live inside other elements. AI-generated HTML uses this nesting constantly. When something looks wrong on screen, it is often because an element ended up in the wrong parent.`,
        callout: `Reading HTML is about finding the parent-child relationship. Who contains what? That is the whole game.`,
      },
    ],
    aiPrompt: `Build me an HTML page for a personal portfolio. Include a header with my name, a short bio section, and a list of 3 projects. Make it clean and minimal.`,
    terminalMission: `Type: console.log("HTML lesson complete!") and see the output.`,
  },

  'debug-ai': {
    pathId: 'web-basics',
    title: 'How to solve an error (step by step)',
    duration: '10 min',
    mekLabel: 'enough to fix 80% of AI errors without asking AI to start over',
    sections: [
      {
        heading: 'Errors are not failures',
        body: `An error message is not the app shouting at you. It is the app telling you exactly what went wrong. Most beginners panic and ask AI to rewrite everything. Most of the time, you just need to read the error carefully.`,
        callout: `Every error has three parts: what went wrong, where it went wrong, and why. Find all three before touching any code.`,
      },
      {
        heading: 'The 4-step process',
        body: `Step 1 — Read the error message fully, do not skim it. Step 2 — Find the file and line number it points to. Step 3 — Look at that line and the two lines above it. Step 4 — If you still do not understand, paste the exact error into AI with the surrounding code.`,
      },
      {
        heading: 'The most common errors and what they mean',
        code: `// "is not defined"
// You used a variable or function before declaring it

// "Cannot read properties of undefined"
// You tried to access .something on a value that does not exist yet

// "is not a function"
// You called something as a function but it is not one

// "SyntaxError: Unexpected token"
// Missing bracket, comma, or quote somewhere nearby`,
      },
      {
        heading: 'What to tell AI when you are stuck',
        body: `Never just say "it is not working." Paste the exact error message, paste the code around the error, and tell AI what you expected to happen. That three-part structure gets you a fix 90% of the time on the first try.`,
      },
    ],
    aiPrompt: `I am getting this error: [paste your error here]. Here is the code around it: [paste your code]. I expected it to [describe expected behavior]. What is wrong and how do I fix it?`,
    terminalMission: `Type something invalid in the terminal and read the friendly error message. Notice how it tells you exactly what to try instead.`,
  },

  // ── Vibe Coding Mastery ────────────────────────────────────────────────────

  'prompting-ai': {
    pathId: 'vibe-coding',
    title: 'How to prompt AI effectively',
    duration: '10 min',
    mekLabel: 'enough to get useful code from AI on the first try, most of the time',
    sections: [
      {
        heading: 'Why most AI prompts fail',
        body: `Most people type "make me a website" and get confused when the result is not what they imagined. The problem is not the AI — it is that the AI had no context. AI is incredibly powerful but it reads minds poorly. The more specific you are, the better the output.`,
        callout: `A good prompt has four ingredients: what you want built, what tech stack to use, any constraints, and what the end result should feel like.`,
      },
      {
        heading: 'The anatomy of a great prompt',
        code: `// Weak prompt:
"Make me a login form"

// Strong prompt:
"Build a login form in HTML and CSS.
It should have an email field and a password field.
Add a submit button that says Sign in.
Style it with a dark background and white text.
Do not use any external libraries."`,
      },
      {
        heading: 'Prompting patterns that work',
        body: `Pattern 1 — Role assignment: start with "Act as a senior React developer and..." Pattern 2 — Constraints first: "Without using any libraries, build..." Pattern 3 — Output format: "Return only the HTML file, no explanation." Pattern 4 — Step by step: "First explain what you will build, then write the code."`,
      },
      {
        heading: 'Iterating on AI output',
        body: `Your first prompt is rarely your last. Treat it as a conversation. If the output is wrong, do not start over — tell AI specifically what to change. "Change the button color to blue" beats "redo this" every time. Small, targeted corrections get you to the right result faster.`,
      },
      {
        heading: 'Prompt templates for common tasks',
        code: `// Explaining code you do not understand:
"Explain this code to me line by line in plain English: [paste code]"

// Fixing a bug:
"This code has a bug. The error is: [error]. Fix only the broken part."

// Adding a feature:
"Add [feature] to this existing code without changing anything else: [paste code]"

// Reviewing AI output:
"Review this code for bugs, security issues, and anything that could break."`,
      },
    ],
    aiPrompt: `I want to build [describe your project]. The tech stack is [your stack]. My main concern is [your concern]. Build the first version and explain each major decision you made.`,
    terminalMission: `Try: shout("good prompts get good code") — notice how even a simple function needs the right input to give the right output.`,
  },

  'vibe-checklist': {
    pathId: 'vibe-coding',
    title: 'What to check when vibe coding',
    duration: '9 min',
    mekLabel: 'enough to catch AI mistakes before they become your mistakes',
    sections: [
      {
        heading: 'AI is a brilliant intern, not a senior dev',
        body: `AI will confidently write code that looks correct but is broken, insecure, or subtly wrong. This is not a reason to distrust it — it is a reason to review it. A few minutes of checking saves hours of debugging later.`,
        callout: `Never run AI-generated code you have not at least skimmed. It takes 60 seconds and saves you from 60-minute debugging sessions.`,
      },
      {
        heading: 'The vibe coding checklist',
        code: `Before running AI-generated code, check:

[ ] Does it use the tech stack you asked for?
[ ] Are there any hardcoded values that should be variables?
[ ] Does it import anything you have not installed?
[ ] Are there any TODO or placeholder comments left in?
[ ] Does it handle errors — what happens when something goes wrong?
[ ] Are there console.log debug lines that should not be in production?
[ ] Does the file structure match what you already have?`,
      },
      {
        heading: 'The three most common AI mistakes',
        body: `First — hallucinated imports: AI references packages or functions that do not exist. Check every import statement. Second — missing error handling: AI often skips the "what if this fails" part entirely. Third — outdated syntax: AI may use deprecated patterns. When in doubt, ask it to use the latest syntax for your framework.`,
      },
      {
        heading: 'When to ask AI to review its own output',
        body: `After AI gives you code, follow up with: "Review this for bugs, security issues, and anything that could break in production." AI is often better at finding problems in code than writing it perfectly the first time. Use that.`,
      },
    ],
    aiPrompt: `Review the following code for bugs, security vulnerabilities, hardcoded values that should be environment variables, missing error handling, and anything that could break in production. Be specific about each issue: [paste your code]`,
    terminalMission: `Type: help — and treat this like an AI giving you a list of what it can do. Notice how understanding the options lets you use the tool better.`,
  },

  'error-solving': {
    pathId: 'vibe-coding',
    title: 'How to solve an error without panicking',
    duration: '10 min',
    mekLabel: 'enough to debug any error AI throws at you',
    sections: [
      {
        heading: 'The panic trap',
        body: `Most beginners see a red error and immediately ask AI to fix it without reading what it says. This is like going to a doctor and saying "I feel bad" without describing symptoms. The result is slow, imprecise, and often creates new problems.`,
        callout: `Read the error before you do anything else. The solution is almost always in the error message itself.`,
      },
      {
        heading: 'How to read an error message',
        code: `// Example error:
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.jsx:12:18)

// Breaking it down:
// "TypeError"         → category of error
// "Cannot read..."    → what went wrong
// "reading 'map'"     → .map() was called on undefined
// "UserList.jsx:12"   → file and line number to go look at`,
      },
      {
        heading: 'The diagnostic questions',
        body: `Ask yourself in order: What type of error is it? Where exactly did it happen — file and line? What value was I expecting vs what was there? Has this code ever worked, or is it new? What changed most recently? Answering these narrows the problem down before you touch anything.`,
      },
      {
        heading: 'The perfect AI error prompt',
        code: `"I am getting this error:
[paste full error message]

It happens in this code:
[paste the 10-20 lines around the error]

I expected it to:
[describe what should happen]

What is causing it and how do I fix just this part?"`,
      },
      {
        heading: 'When AI makes the error worse',
        body: `If AI's fix introduces a new error, do not keep asking it to fix the new error blindly. Step back. Ask it to explain what it changed and why. If the explanation does not make sense to you, ask it to undo its last change and try a different approach. You are the director — AI is the coder.`,
      },
    ],
    aiPrompt: `I am getting this error: [paste error]. Here is the code: [paste code]. I expected it to [expected behavior]. Explain what is causing this in plain English, then fix only the broken part without changing anything else.`,
    terminalMission: `Type something the terminal does not recognize and observe the error. Notice it tells you exactly what to try next — that is good error design.`,
  },

  // ── Git & GitHub ──────────────────────────────────────────────────────────

  'what-is-git': {
    pathId: 'git-github',
    title: 'What is Git and why it matters',
    duration: '7 min',
    mekLabel: 'enough to never lose your work again',
    sections: [
      {
        heading: 'The problem Git solves',
        body: `Imagine working on a project, making a change, and breaking everything — with no way to go back. Or finishing a feature and accidentally deleting it. Git is a tool that takes snapshots of your code over time, so you can always go back to any point in the history.`,
        callout: `Git is not a backup tool — it is a time machine. Every commit is a point in time you can return to.`,
      },
      {
        heading: 'Three concepts that are all you need',
        code: `// 1. Repository (repo)
// The folder Git is tracking. Your project lives here.

// 2. Commit
// A saved snapshot of your code at a specific moment.
// Think of it as a checkpoint in a video game.

// 3. Branch
// A separate copy of your code to experiment on.
// When it works, you merge it back in.`,
      },
      {
        heading: 'Git vs GitHub — they are not the same thing',
        body: `Git is the tool that runs on your computer and tracks changes. GitHub is a website where you upload your Git repository so it is backed up online and shareable. Git is the engine. GitHub is the garage. You can use Git without GitHub, but you cannot use GitHub without Git.`,
      },
      {
        heading: 'Why vibe coders especially need Git',
        body: `When you are building with AI, you will make a lot of rapid changes. Some will work, some will not. Without Git, a bad AI suggestion can ruin your project. With Git, you commit before every major AI-assisted change — and if it breaks, you roll back in 10 seconds.`,
      },
    ],
    aiPrompt: `I am new to Git. Set up a Git repository for my project, create an initial commit with all my current files, and explain each command you use in a comment above it.`,
    terminalMission: `Type: git status — and read the simulated output. Notice it tells you the state of your project at a glance.`,
  },

  'git-core-commands': {
    pathId: 'git-github',
    title: 'The 5 git commands you actually need',
    duration: '10 min',
    mekLabel: 'enough to use Git confidently for any vibe coding project',
    sections: [
      {
        heading: 'You only need five',
        body: `Git has hundreds of commands. For 90% of vibe coding work, you only need five. Learn these and you can manage any project.`,
      },
      {
        heading: 'The five commands',
        code: `// 1. git init
// Start tracking a project folder with Git
git init

// 2. git add .
// Stage all changed files to be committed
git add .

// 3. git commit -m "your message"
// Save a snapshot with a description
git commit -m "add login form"

// 4. git push
// Upload your commits to GitHub
git push

// 5. git pull
// Download the latest changes from GitHub
git pull`,
      },
      {
        heading: 'The everyday workflow',
        code: `// The loop you will use every single day:

// 1. Make changes to your code
// 2. Stage them
git add .

// 3. Commit with a clear message
git commit -m "what you just did"

// 4. Push to GitHub
git push`,
      },
      {
        heading: 'Undoing things',
        code: `// Undo the last commit but keep your changes:
git reset --soft HEAD~1

// See what changed before committing:
git diff

// Check the full history:
git log`,
      },
    ],
    aiPrompt: `Generate the git commands to: initialize a new repo, add all files, make an initial commit, create a branch called feature/login, and push everything to GitHub. Add a comment explaining each command.`,
    terminalMission: `Try: git status — then git log — see the simulated output and read what each line means.`,
  },

  'github-basics': {
    pathId: 'git-github',
    title: 'GitHub — putting your code online',
    duration: '8 min',
    mekLabel: 'enough to back up, share, and deploy any project',
    sections: [
      {
        heading: 'What GitHub is for',
        body: `GitHub is where your code lives online. It is a backup, a portfolio, and a collaboration platform all in one. When you push your code to GitHub, it is safe even if your laptop dies. And when you want to deploy to the internet, platforms like Vercel and Railway connect directly to GitHub.`,
      },
      {
        heading: 'Connecting your project to GitHub',
        code: `// 1. Create a new repo on github.com

// 2. Connect your local project to it:
git remote add origin https://github.com/you/your-repo.git

// 3. Push your code up:
git branch -M main
git push -u origin main

// After this first setup, future pushes are just:
git push`,
      },
      {
        heading: 'Four GitHub concepts you need',
        body: `Repository — your project folder online. Branch — a separate version of your code. Pull Request — a proposal to merge one branch into another. Fork — your own copy of someone else's repo. These four concepts cover everything you will encounter as a vibe coder.`,
      },
      {
        heading: 'The modern vibe coding deploy pipeline',
        body: `Write code with AI, commit to Git, push to GitHub, and let Vercel or Railway auto-deploy from there. Every push to your main branch automatically deploys to production. No manual uploads, no FTP, no DevOps headache. AI builds it, Git tracks it, GitHub stores it, Vercel ships it.`,
        callout: `Set this pipeline up once and every future project deploys automatically on every push.`,
      },
    ],
    aiPrompt: `Walk me through connecting my local project to a new GitHub repository and setting up automatic deployment to Vercel. Give me every command I need to run and explain what each one does.`,
    terminalMission: `Type: git push — and read the simulated success output. That is what a successful push to GitHub looks like.`,
  },

  'git-with-ai': {
    pathId: 'git-github',
    title: 'Using AI to write your git workflow',
    duration: '9 min',
    mekLabel: 'enough to use AI as your Git co-pilot on every project',
    sections: [
      {
        heading: 'Git is one of the best things to delegate to AI',
        body: `Complex Git operations — reverting bad merges, resolving conflicts, setting up CI/CD — are exactly the kind of thing AI excels at. You understand the concepts now. Let AI write the commands.`,
        callout: `Knowing what Git does is your job. Remembering the exact flags and syntax is AI's job.`,
      },
      {
        heading: 'Prompts that work for Git',
        code: `// Set up a new project:
"Initialize a git repo, add all files, make an initial commit
 with message initial commit, and push to GitHub."

// Undo a mistake:
"I accidentally committed sensitive API keys. How do I remove
 them from the entire git history safely?"

// Resolve a merge conflict:
"I have a merge conflict. Here is what both versions look like:
 [paste]. Which should I keep and why?"

// Write better commit messages:
"Based on these file changes, write a clear git commit message
 in the imperative mood: [paste diff]"`,
      },
      {
        heading: 'The rule of thumb',
        body: `Before every AI-assisted coding session, commit your current state. Before every major change AI suggests, commit again. This way, the worst that can happen is you lose 10 minutes of work — not hours.`,
      },
    ],
    aiPrompt: `Write a complete git workflow for a new web project. Include: initializing the repo, a .gitignore for a Node.js project, an initial commit, creating a development branch, and connecting to GitHub. Comment every command.`,
    terminalMission: `Try: npm install axios — and read the simulated output. This is what AI means when it says run npm install after generating code with new dependencies.`,
  },
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create((set) => ({
  // User
  user: {
    name: 'Shedrach',
    avatar: 'S',
    mekScore: 68,
    lessonsCompleted: 12,
    buildsUnlocked: 4,
  },

  // Progress per path (id → number of completed lessons)
  progress: {
    'web-basics':    4,
    'vibe-coding':   2,
    'git-github':    0,
    'python-basics': 1,
    'apis':          0,
    'sql':           0,
  },

  // Settings
  settings: {
    theme:          'dark',
    fontSize:       'md',
    terminalSound:  false,
    showMekBar:     true,
    compactSidebar: false,
  },

  // Active lesson
  activeLesson: null,
  setActiveLesson: (id) => set({ activeLesson: id }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Update settings
  updateSettings: (patch) => set((s) => ({
    settings: { ...s.settings, ...patch },
  })),

  // Complete a lesson
  completeLesson: (pathId) => set((s) => ({
    progress: {
      ...s.progress,
      [pathId]: Math.min(
        (s.progress[pathId] || 0) + 1,
        PATHS.find((p) => p.id === pathId)?.lessons_data.length || 99
      ),
    },
    user: {
      ...s.user,
      lessonsCompleted: s.user.lessonsCompleted + 1,
      mekScore: Math.min(100, s.user.mekScore + 3),
    },
  })),
}))
