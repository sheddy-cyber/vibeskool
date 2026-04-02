// ─── Skill Paths ─────────────────────────────────────────────────────────────
export const PATHS = [
  {
    id: 'web-basics',
    icon: '🌐',
    name: 'Vibe Coding for Web',
    description: 'HTML, CSS & JS — only the parts that matter for working with AI',
    color: 'violet',
    tag: 'Beginner',
    lessons: [
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
    lessons: [
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
    lessons: [
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
    lessons: [
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
    lessons: [
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
    lessons: [
      { id: 'sql-select', title: 'SELECT — asking questions of data', duration: '8 min'  },
      { id: 'sql-filter', title: 'WHERE — filtering results',          duration: '7 min'  },
      { id: 'sql-joins',  title: 'Joins — connecting tables',          duration: '10 min' },
    ],
  },
]

// ─── Lesson content (summaries for API — full content lives in frontend store) ─
export const LESSONS = {
  'frontend-vs-backend': {
    id: 'frontend-vs-backend', pathId: 'web-basics',
    title: 'Frontend vs Backend — what is what', duration: '8 min',
    mekLabel: 'enough to have a real conversation with any developer or AI',
  },
  'html-structure': {
    id: 'html-structure', pathId: 'web-basics',
    title: 'How HTML structures a page', duration: '8 min',
    mekLabel: 'enough to understand any webpage AI builds for you',
  },
  'js-functions': {
    id: 'js-functions', pathId: 'web-basics',
    title: 'Functions — reusable code blocks', duration: '9 min',
    mekLabel: 'enough to read any AI-generated JS file',
  },
  'debug-ai': {
    id: 'debug-ai', pathId: 'web-basics',
    title: 'How to solve an error (step by step)', duration: '10 min',
    mekLabel: 'enough to fix 80% of AI errors without asking AI to start over',
  },
  'prompting-ai': {
    id: 'prompting-ai', pathId: 'vibe-coding',
    title: 'How to prompt AI effectively', duration: '10 min',
    mekLabel: 'enough to get useful code from AI on the first try, most of the time',
  },
  'vibe-checklist': {
    id: 'vibe-checklist', pathId: 'vibe-coding',
    title: 'What to check when vibe coding', duration: '9 min',
    mekLabel: 'enough to catch AI mistakes before they become your mistakes',
  },
  'error-solving': {
    id: 'error-solving', pathId: 'vibe-coding',
    title: 'How to solve an error without panicking', duration: '10 min',
    mekLabel: 'enough to debug any error AI throws at you',
  },
  'what-is-git': {
    id: 'what-is-git', pathId: 'git-github',
    title: 'What is Git and why it matters', duration: '7 min',
    mekLabel: 'enough to never lose your work again',
  },
  'git-core-commands': {
    id: 'git-core-commands', pathId: 'git-github',
    title: 'The 5 git commands you actually need', duration: '10 min',
    mekLabel: 'enough to use Git confidently for any vibe coding project',
  },
  'github-basics': {
    id: 'github-basics', pathId: 'git-github',
    title: 'GitHub — putting your code online', duration: '8 min',
    mekLabel: 'enough to back up, share, and deploy any project',
  },
  'git-with-ai': {
    id: 'git-with-ai', pathId: 'git-github',
    title: 'Using AI to write your git workflow', duration: '9 min',
    mekLabel: 'enough to use AI as your Git co-pilot on every project',
  },
}
