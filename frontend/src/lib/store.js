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
    description: 'Before, during, and after — the full vibe coding playbook',
    color: 'teal',
    tag: '🔥 Essential',
    lessons_data: [
      // Part 1: Before you start
      { id: 'vc-before-intro',    title: 'Part 1 — Before you start',                      duration: '5 min',  part: 'Before' },
      { id: 'vc-choose-stack',    title: 'Choosing the right stack for your project',       duration: '10 min', part: 'Before' },
      { id: 'vc-plan-features',   title: 'Defining features before you write a prompt',    duration: '9 min',  part: 'Before' },
      { id: 'vc-security-basics', title: 'Security risks every vibe coder must know',      duration: '11 min', part: 'Before' },
      { id: 'vc-first-prompt',    title: 'Writing your first project prompt',               duration: '10 min', part: 'Before' },
      // Part 2: During
      { id: 'vc-during-intro',    title: 'Part 2 — While you are building',                duration: '4 min',  part: 'During' },
      { id: 'vc-error-handling',  title: 'How to handle errors without panicking',         duration: '10 min', part: 'During' },
      { id: 'vc-review-output',   title: 'What to check before running AI code',           duration: '9 min',  part: 'During' },
      { id: 'vc-iterate',         title: 'Iterating — how to guide AI toward the goal',   duration: '9 min',  part: 'During' },
      { id: 'vc-terminal',        title: 'The terminal — commands every vibe coder needs', duration: '12 min', part: 'During' },
      // Part 3: After
      { id: 'vc-after-intro',     title: 'Part 3 — After you build',                       duration: '4 min',  part: 'After'  },
      { id: 'vc-deploy',          title: 'How to deploy your project',                      duration: '11 min', part: 'After'  },
      { id: 'vc-update',          title: 'How to update and maintain your project',        duration: '9 min',  part: 'After'  },
      { id: 'vc-env-vars',        title: 'Environment variables and secrets',               duration: '8 min',  part: 'After'  },
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

  // ── Vibe Coding Mastery — Part 1: Before ───────────────────────────────────

  'vc-before-intro': {
    pathId: 'vibe-coding', title: 'Part 1 — Before you start', duration: '5 min', part: 'Before',
    mekLabel: 'the foundation that makes everything else work',
    sections: [
      { heading: 'The mistake most people make', body: `Most people open Claude or ChatGPT, type "build me an app that does X," and wonder why the result is a mess. The problem is not the AI — it is that they gave the AI nothing to work with. No stack, no feature list, no constraints. Vague input produces vague output.`, callout: `Vibe coding is not about typing less. It is about thinking clearly first, then letting AI do the heavy lifting.` },
      { heading: 'Three things you need before your first prompt', body: `A clear stack (the technologies you want used), a clear feature list (what the project must do), and awareness of the security risks specific to your project type. Get these three right and your first prompt will produce something usable. Skip them and you will spend hours cleaning up AI guesswork.` },
    ],
    aiPrompt: `I want to build [describe your project in one sentence]. What stack would you recommend, what are the 5 most important features I should define before I start, and what are the main security risks I should be aware of?`,
    terminalMission: `Type: help — read what the Lab offers. Build the habit of understanding your tools before using them.`,
  },

  'vc-choose-stack': {
    pathId: 'vibe-coding', title: 'Choosing the right stack for your project', duration: '10 min', part: 'Before',
    mekLabel: 'enough to tell AI exactly what to build with',
    sections: [
      { heading: 'What is a tech stack', body: `A tech stack is the combination of technologies used to build your project — frontend (what users see), backend (the server logic), and database (where data lives). Every project needs all three, or a deliberate decision to skip one.` },
      { heading: 'Why the stack matters before you prompt', body: `If you do not specify a stack, AI will pick one for you — often whatever it saw most in training. You end up with technology you did not choose. Decide first, then tell AI. You can ask for a recommendation, but you make the final call.`, callout: `Tell AI the stack — do not ask it to choose one blindly. You are the one maintaining this project.` },
      { heading: 'Common stacks and when to use each', code: `// Simple website or landing page:\nHTML + CSS + Vanilla JS\n→ No framework. AI builds it in one file.\n\n// Web app with a backend:\nReact + Node/Express + PostgreSQL\n→ The standard. AI knows it extremely well.\n\n// Quick prototype:\nNext.js + Supabase\n→ Faster to set up. Good for solo projects.\n\n// Python-heavy (AI scripts, data):\nPython + FastAPI + React\n→ When you need pandas, numpy, etc.\n\n// Mobile app:\nReact Native / Expo\n→ One codebase for iOS and Android.` },
    ],
    aiPrompt: `I want to build [your project]. My constraints: [list constraints]. Recommend a tech stack. For each technology, explain in one sentence why it is the right choice for my specific project — not just in general.`,
    terminalMission: `Type: npm install axios — this simulates installing a package. Your stack choice determines which packages your whole project will use.`,
  },

  'vc-plan-features': {
    pathId: 'vibe-coding', title: 'Defining features before you write a prompt', duration: '9 min', part: 'Before',
    mekLabel: 'enough to get exactly what you asked for from AI',
    sections: [
      { heading: 'Features vs wishes', body: `A wish is "I want users to be able to sign up." A feature is "Users can register with email and password. They receive a verification email. They cannot access the app until verified." The difference is specificity. AI cannot build a feature from a wish — it has to guess, and it will guess wrong on several things.` },
      { heading: 'The feature definition format', code: `// Format every feature like this before prompting:\n\nFeature: User authentication\n- User registers with email + password\n- User receives a verification email on signup\n- User cannot log in until email is verified\n- User can reset password via email link\n- Session persists for 7 days\n- User is logged out after 30 min of inactivity\n\n// Compare to: "Add login" — which is what most people send.` },
      { heading: 'Edge cases are features too', body: `What happens when a user submits an empty form? What if two users edit the same item simultaneously? What if the API is down? AI skips these unless you mention them. Ask "what could go wrong with this feature" for 5 minutes before prompting.`, callout: `A focused MVP with 3 well-defined features beats a vague 10-feature prompt every time. You can always add more later.` },
    ],
    aiPrompt: `Here are the features I want for my project: [list features in the format above]. For each feature, tell me: what edge cases I have not considered, what could go wrong, and what the simplest implementation looks like.`,
    terminalMission: `Type: greetUser("your project name") — practice being specific. A function needs exact input. So does a prompt.`,
  },

  'vc-security-basics': {
    pathId: 'vibe-coding', title: 'Security risks every vibe coder must know', duration: '11 min', part: 'Before',
    mekLabel: 'enough to not accidentally expose your users or data',
    sections: [
      { heading: 'Why security matters before you start', body: `AI builds what you ask for. It does not always build it securely. It may hardcode API keys, skip input validation, or expose database queries to injection attacks. These are the most common issues in AI-generated code. Knowing the risks before you start means you know what to check.`, callout: `Security is not a feature you add at the end. It is a constraint you define at the start.` },
      { heading: 'The five risks every project faces', code: `// 1. Exposed secrets\n// Never hardcode API keys or passwords in code.\n// They must live in environment variables (.env files).\n\n// 2. SQL injection\n// Database queries must use parameterised inputs.\n// Ask AI for parameterised queries explicitly.\n\n// 3. Missing authentication\n// Any route that accesses user data must verify login.\n// AI often generates routes without auth checks.\n\n// 4. Unvalidated user input\n// Never trust what a user submits. Validate server-side.\n\n// 5. CORS misconfiguration\n// If your API accepts requests from any origin (*),\n// anyone can call it. Specify exactly which domains.` },
      { heading: 'The security line to add to every first prompt', body: `Include this in your first prompt: "Follow security best practices. Use environment variables for all secrets. Validate all user input server-side. Use parameterised queries for all database operations." That one line significantly improves AI output quality.` },
    ],
    aiPrompt: `Review the following code for security vulnerabilities. Check for: hardcoded secrets, SQL injection risks, missing authentication on routes, unvalidated user input, and insecure CORS settings. For each issue, show the vulnerable line and the secure version: [paste code]`,
    terminalMission: `Type: help — notice how destructive commands like rm -rf are blocked. That is a security constraint. Your projects need the same thinking built in from the start.`,
  },

  'vc-first-prompt': {
    pathId: 'vibe-coding', title: 'Writing your first project prompt', duration: '10 min', part: 'Before',
    mekLabel: 'enough to start any project with a prompt that actually works',
    sections: [
      { heading: 'The anatomy of a first project prompt', body: `A good first prompt has five components: what you are building (one sentence), the tech stack, the core features (defined precisely), the security constraints, and the output format (what files you want back). Most people send one sentence and wonder why the result needs five rounds of correction.` },
      { heading: 'The template', code: `"I am building [what] for [who].\n\nTech stack:\n- Frontend: [e.g. React with Vite]\n- Backend: [e.g. Node.js with Express]\n- Database: [e.g. PostgreSQL]\n\nCore features (build these only):\n1. [Feature 1 — defined in detail]\n2. [Feature 2 — defined in detail]\n3. [Feature 3 — defined in detail]\n\nSecurity requirements:\n- Use environment variables for all secrets\n- Validate all user input server-side\n- Use parameterised queries for all DB operations\n\nPlease:\n- Build the project structure first\n- Add a comment above every function\n- Flag uncertainty with TODO comments"` },
      { heading: 'After the first response', body: `Look at the structure, not the details. Is the folder layout sensible? Are the filenames clear? If yes, move to the details. If no, correct the structure first — fixing bad architecture later is far more painful than fixing it now.` },
    ],
    aiPrompt: `[Use the template above — fill in your actual project details. This is the lesson. The prompt IS the practice.]`,
    terminalMission: `Type: git init — that is the first command of any real project. Your first prompt and your first git init should happen in the same session.`,
  },

  // ── Vibe Coding Mastery — Part 2: During ─────────────────────────────────

  'vc-during-intro': {
    pathId: 'vibe-coding', title: 'Part 2 — While you are building', duration: '4 min', part: 'During',
    mekLabel: 'the skills that keep a vibe coding session on track',
    sections: [
      { heading: 'The session mindset', body: `A vibe coding session is a conversation, not a one-shot transaction. You prompt, review, correct, and prompt again. The people who get great results are not the ones with the best first prompt — they are the ones who review carefully and correct precisely.`, callout: `Review every response before running it. One minute of reading saves thirty minutes of debugging.` },
      { heading: 'What this part covers', body: `How to handle errors without losing momentum, what to check before you run AI-generated code, how to iterate when the output is close but not right, and how to use the terminal — the tool that connects everything AI builds.` },
    ],
    aiPrompt: `I am in the middle of building [project]. I just received this code: [paste code]. Before I run it, what should I check? Walk me through a quick review for obvious issues.`,
    terminalMission: `Type: git status — in a real session you run this before every commit. Build the habit now.`,
  },

  'vc-error-handling': {
    pathId: 'vibe-coding', title: 'How to handle errors without panicking', duration: '10 min', part: 'During',
    mekLabel: 'enough to debug any error AI throws at you',
    sections: [
      { heading: 'Errors are directions, not dead ends', body: `An error message tells you exactly where the computer got confused — the type, the message, the file, and the line number together point at the problem with more precision than any guess. The panic response — asking AI to "fix everything" — is slower and less reliable than reading the error first.`, callout: `Read the error fully before doing anything. The answer is almost always in the message itself.` },
      { heading: 'How to read any error', code: `TypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (UserList.jsx:12:18)\n\n// Break it down:\n// Error type:  TypeError\n// Message:     Cannot read properties of undefined\n// Detail:      which property — 'map'\n// Location:    UserList.jsx line 12\n// Action:      Go to line 12. Look at the two lines above it.` },
      { heading: 'The exact prompt to fix an error', code: `"I am getting this error:\n[paste the full error message]\n\nIn this code:\n[paste the 15 lines around the error]\n\nI expected it to:\n[describe what should happen]\n\nFix only the broken part — do not rewrite anything else."` },
      { heading: 'When AI makes it worse', body: `If the fix introduces a new error, stop. Do not ask it to fix the new error blindly. Ask it to explain what it changed and why. If the explanation does not make sense, ask it to revert its last change and try a different approach.` },
    ],
    aiPrompt: `I am getting this error: [paste error]. Here is the relevant code: [paste code]. I expected it to [expected behavior]. Explain what is causing this in plain English, then fix only the broken part without changing anything else.`,
    terminalMission: `Type something invalid and read the error carefully. Good error messages tell you exactly what to try next.`,
  },

  'vc-review-output': {
    pathId: 'vibe-coding', title: 'What to check before running AI code', duration: '9 min', part: 'During',
    mekLabel: 'enough to catch AI mistakes before they become your problems',
    sections: [
      { heading: 'The 60-second review', body: `Before running any AI-generated code, spend sixty seconds scanning it — not reading every line, but scanning for the patterns that most commonly break things. This single habit saves more time than any other practice in vibe coding.` },
      { heading: 'The checklist', code: `Before running AI code, check:\n\n[ ] Does it import packages not in your package.json?\n[ ] Are there hardcoded values that should be env variables?\n[ ] Does it handle errors — try/catch around async calls?\n[ ] Are there TODO or placeholder comments AI left incomplete?\n[ ] Does the file structure match what you already have?\n[ ] Are there console.log statements that should not be in production?` },
      { heading: 'The follow-up prompt', body: `After AI gives you code, send: "Review this for bugs, missing error handling, hardcoded values that should be env variables, and any TODO stubs you left incomplete." AI is better at reviewing its own output than at writing it perfectly first time.` },
    ],
    aiPrompt: `Review the following code before I run it. Check for: missing package imports, hardcoded secrets, missing error handling, incomplete TODOs, and anything that could crash on first run. Show each issue and the fix: [paste your code]`,
    terminalMission: `Type: npm install — this installs all declared dependencies. Running this before starting is your pre-flight checklist.`,
  },

  'vc-iterate': {
    pathId: 'vibe-coding', title: 'Iterating — how to guide AI toward the goal', duration: '9 min', part: 'During',
    mekLabel: 'enough to get from close to exactly right',
    sections: [
      { heading: 'Iteration is the skill', body: `The best vibe coders are not those with the best first prompts. They are the ones who correct precisely and quickly. Getting from "almost right" to "exactly right" in two corrections instead of ten is the real differentiator.` },
      { heading: 'Precise correction prompts', code: `// Bad (forces AI to guess):\n"This is not working, fix it"\n\n// Good (tells AI exactly what to change):\n"The button on line 34 does not trigger form submit.\n It should call handleSubmit() on click. Fix only that."\n\n"The user list shows all users instead of only\n the current user's items. The filter should be:\n items.filter(i => i.userId === user.id)"` },
      { heading: 'When to start over vs correct', body: `Correct when the overall structure is right but a specific part is wrong. Start over when the structure itself is wrong — when AI has organised the code in a way that makes future changes painful.`, callout: `If you have made more than five corrections to the same piece of code without it working, explain the goal again from scratch. Fresh context often solves what targeted corrections cannot.` },
    ],
    aiPrompt: `The code you gave me is close but [specific issue]. Here is what is happening: [actual behavior]. Here is what I expected: [expected behavior]. Make only this one change — do not modify anything else.`,
    terminalMission: `Type: git commit -m "describe your change" — good iteration means committing every working state. Each commit is a checkpoint you can return to.`,
  },

  'vc-terminal': {
    pathId: 'vibe-coding', title: 'The terminal — commands every vibe coder needs', duration: '12 min', part: 'During',
    mekLabel: 'enough to run, install, and manage any AI-generated project',
    sections: [
      { heading: 'Why the terminal matters', body: `Every project AI builds gives you instructions to run in the terminal. Install this, run that, start the server. If the terminal feels like a black box, those instructions feel like magic spells. This lesson explains what each command is actually doing.`, callout: `You do not need to memorise commands. You need to understand them so you can read them, recognise when they are wrong, and ask AI to explain the ones you do not know.` },
      { heading: 'Navigation', code: `pwd              # Where am I right now?\nls               # What files are in this folder?\nls -la           # All files including hidden ones\ncd my-project    # Move into a folder\ncd ..            # Go up one level\nmkdir new-folder # Create a folder\nrm -rf folder    # Delete a folder completely (careful)` },
      { heading: 'Package management', code: `npm install              # Install all packages in package.json\nnpm install axios        # Install a specific package\nnpm install -D eslint    # Install as a dev-only dependency\nnpm uninstall axios      # Remove a package\nnpm run dev              # Start the dev server\nnpm run build            # Build for production\nnpx create-react-app .   # Run a package without installing globally` },
      { heading: 'Running and stopping', code: `node index.js   # Run a Node.js file directly\nnpm start       # Start the project\nCtrl + C        # Stop whatever is running — most important command` },
      { heading: 'When a command fails', body: `Most terminal errors are one of three things: you are in the wrong folder (check with pwd), a package is not installed (run npm install), or you do not have permission (try adding sudo on Mac/Linux). If none of those apply, paste the exact error into AI with the command you ran.` },
    ],
    aiPrompt: `Explain what each of these commands does in plain English, no jargon. I want to understand what is happening, not just what to type: [paste the commands AI gave you]`,
    terminalMission: `Work through the commands above: pwd, ls, cd, npm install axios, git status, clear. Read what each does before you run it.`,
  },

  // ── Vibe Coding Mastery — Part 3: After ──────────────────────────────────

  'vc-after-intro': {
    pathId: 'vibe-coding', title: 'Part 3 — After you build', duration: '4 min', part: 'After',
    mekLabel: 'the step most vibe coders skip — and regret',
    sections: [
      { heading: 'Shipping is not the end', body: `Most vibe coding tutorials stop when the app works locally. But running locally is not a product. A product is deployed, backed up, and updatable without breaking. Part 3 covers what to do after the build is done.`, callout: `A project that only runs on your laptop is a prototype. The next three lessons turn it into something real.` },
      { heading: 'What this part covers', body: `Deploying your project so others can access it. Updating it after changes without downtime. And environment variables — the thing AI most often gets wrong, and the source of most post-launch security issues.` },
    ],
    aiPrompt: `My project is built and running locally. Walk me through what I need to do to: 1. Get it online, 2. Set it up for easy updates, 3. Make sure no secrets are accidentally exposed. My stack is [your stack].`,
    terminalMission: `Type: git log — see your commit history. That history is your safety net when you deploy and something breaks.`,
  },

  'vc-deploy': {
    pathId: 'vibe-coding', title: 'How to deploy your project', duration: '11 min', part: 'After',
    mekLabel: 'enough to get any project online in under 30 minutes',
    sections: [
      { heading: 'Deployment is simpler than it used to be', body: `Deploying used to mean configuring servers, SSH, nginx. Today it means connecting a GitHub repo to a platform and clicking deploy. For 90% of AI-built projects, you do not need to manage a server yourself.` },
      { heading: 'Choosing a platform', code: `// Frontend only (React, Next.js, HTML):\nVercel   → Best for React/Next.js. Free tier is generous.\nNetlify  → Great for SPAs and static sites.\n\n// Backend (Node, Python, APIs):\nRailway  → Deploy any backend from GitHub. Straightforward.\nRender   → Free tier available. Good for Node and Python.\n\n// Database:\nSupabase → PostgreSQL with a UI. Free tier is solid.\nNeon     → Serverless PostgreSQL. Great with Vercel.` },
      { heading: 'The standard Vercel deploy', code: `// For a React frontend:\n1. Push project to GitHub\n2. vercel.com → Import Project → select repo\n3. Set root directory to your frontend folder\n4. Build command: npm run build\n5. Output directory: dist\n6. Add environment variables from your .env file\n7. Deploy\n\n// Every future push to main auto-deploys.\n// That is your CI/CD pipeline — zero config.` },
      { heading: 'After deploying', body: `Check three things: the site loads without console errors, all API calls hit the right URL (not localhost), and environment variables are set correctly in the platform dashboard. Most first-deploy failures are caused by API URLs still pointing at localhost.` },
    ],
    aiPrompt: `I have built a [describe project] using [stack]. Walk me through deploying the frontend to Vercel and the backend to Railway. Give me exact steps and commands, and tell me what environment variables I need to set in each platform dashboard.`,
    terminalMission: `Type: npm run build — this prepares your project for deployment. After it runs, the dist folder contains everything the hosting platform needs.`,
  },

  'vc-update': {
    pathId: 'vibe-coding', title: 'How to update and maintain your project', duration: '9 min', part: 'After',
    mekLabel: 'enough to keep your project alive after launch',
    sections: [
      { heading: 'The update cycle', body: `Once deployed, updating is a four-step loop: change locally, test locally, push to GitHub, platform auto-deploys. If you set up auto-deploy (Vercel and Railway both do this by default), step four requires nothing from you.`, code: `git add .\ngit commit -m "describe what changed"\ngit push\n// That is it. The platform picks up the push and deploys.` },
      { heading: 'Testing before pushing', body: `Run the project locally and check the specific feature you changed, plus two adjacent things. Changes have a way of breaking things they did not touch. For significant changes, create a new branch first.`, code: `git checkout -b feature/new-thing\n# ... make changes ...\ngit add .\ngit commit -m "add new thing"\ngit push origin feature/new-thing\n# Test it, then merge to main when ready` },
      { heading: 'When an update breaks something', body: `In Vercel and Railway, every deployment has a Redeploy button to restore any previous version in under a minute. Use it immediately — do not try to debug a broken production site under pressure.`, callout: `Always have at least one clean commit you can roll back to before pushing a major change.` },
    ],
    aiPrompt: `I want to add [new feature] to my existing project. The current codebase: [describe or paste relevant parts]. Plan how to add this without breaking what already works. What should I change and in what order?`,
    terminalMission: `Run the full git cycle: git add . → git commit -m "practice commit" → git log. That three-step sequence is the heartbeat of every maintained project.`,
  },

  'vc-env-vars': {
    pathId: 'vibe-coding', title: 'Environment variables and secrets', duration: '8 min', part: 'After',
    mekLabel: 'enough to never accidentally expose your API keys',
    sections: [
      { heading: 'What environment variables are', body: `A value stored outside your code that your code can read at runtime. API keys, database passwords, and secret tokens all go here — never in the code itself. If they are in the code, they end up in GitHub, where anyone can read them.`, callout: `If you push an API key to a public GitHub repo, assume it is compromised within minutes. Bots scan for this constantly.` },
      { heading: 'How they work', code: `// 1. Create a .env file:\nDATABASE_URL=postgresql://user:password@host/db\nOPENAI_API_KEY=sk-...\nJWT_SECRET=a-long-random-string\n\n// 2. Add to .gitignore — never commit this file:\necho ".env" >> .gitignore\n\n// 3. Access in code:\n// Node.js:\nprocess.env.OPENAI_API_KEY\n// React/Vite (must prefix with VITE_):\nimport.meta.env.VITE_OPENAI_API_KEY\n\n// 4. Create .env.example for teammates:\nDATABASE_URL=your-database-url-here\nOPENAI_API_KEY=your-key-here\n// This IS committed — shows what vars are needed` },
      { heading: 'Setting them in deployment platforms', body: `Every platform has an environment variables section in project settings. Copy each key-value pair from your .env file into the dashboard. The platform injects them at runtime. This is how your deployed app reads secrets without having them in the code.` },
    ],
    aiPrompt: `Generate a .env.example file for my project. My project uses: [list services — e.g. PostgreSQL, OpenAI API, Stripe, JWT auth]. Include every environment variable I will need, with a comment explaining what it is for and where to find the value.`,
    terminalMission: `Type: touch .env — creates the file. Then: cat .env — notice it is empty. In a real project, you fill it with secrets before running anything.`,
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
    theme:          'dark',   // 'dark' | 'warm' | 'dusk' | 'stone' | 'light'
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
