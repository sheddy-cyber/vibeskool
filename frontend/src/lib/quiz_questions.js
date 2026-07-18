// Module-specific 20-question quiz database for VibeSkool.
// Keyed by module ID (m0 to m8), each having exactly 20 structured questions.

export const QUIZ_QUESTIONS = {
  m0: [
    {
      id: 'm0-q1',
      topic: 'DNS Resolver',
      question: 'What is the primary job of the Domain Name System (DNS)?',
      options: [
        { text: 'To encrypt all web traffic between client and server', correct: false },
        { text: 'To translate human-readable domain names (like google.com) into machine IP addresses', correct: true },
        { text: 'To store html pages and serve them to the browser', correct: false },
        { text: 'To compile Javascript code into binary executable files', correct: false }
      ],
      explanation: 'DNS is the phonebook of the internet. It maps domain names to IP addresses so browsers can locate servers.'
    },
    {
      id: 'm0-q2',
      topic: 'IP Address',
      question: 'What does an IP address (like 192.168.1.1) represent on the internet?',
      options: [
        { text: 'A secure encryption key for cookies', correct: false },
        { text: 'A unique locator code identifying a specific computer or server on the network', correct: true },
        { text: 'The username of the computer owner', correct: false },
        { text: 'The version number of the browser installed', correct: false }
      ],
      explanation: 'An IP (Internet Protocol) address acts as a unique mailing address for devices connected to a network.'
    },
    {
      id: 'm0-q3',
      topic: 'Client-Server Model',
      question: 'In the client-server model, which of the following acts as the client?',
      options: [
        { text: 'The cloud database server hosting user credentials', correct: false },
        { text: 'The web browser running on a user\'s laptop making requests', correct: true },
        { text: 'The Express backend server listening on port 3000', correct: false },
        { text: 'The physical fiber optic cable carrying packets under the ocean', correct: false }
      ],
      explanation: 'The client is the requester of services (typically the browser), while the server responds to those requests.'
    },
    {
      id: 'm0-q4',
      topic: 'HTTP Methods',
      question: 'Which HTTP method should be used when a client wants to submit new data (like a signup form) to a server?',
      options: [
        { text: 'GET', correct: false },
        { text: 'DELETE', correct: false },
        { text: 'POST', correct: true },
        { text: 'OPTIONS', correct: false }
      ],
      explanation: 'POST is designed to send entity data to the server, often causing a change in state or creation on the server.'
    },
    {
      id: 'm0-q5',
      topic: 'HTTP Status Codes',
      question: 'What does a 404 HTTP status code represent?',
      options: [
        { text: 'Success: The request was processed perfectly', correct: false },
        { text: 'Client Error: The requested resource could not be found on the server', correct: true },
        { text: 'Server Error: The database has crashed', correct: false },
        { text: 'Redirect: The URL has moved to another site', correct: false }
      ],
      explanation: '404 is the standard client-side error code representing "Not Found".'
    },
    {
      id: 'm0-q6',
      topic: 'HTTPS Encryption',
      question: 'What does the "S" in HTTPS stand for and what does it do?',
      options: [
        { text: 'Simple; it runs faster than basic HTTP', correct: false },
        { text: 'Secure; it encrypts the communication channel between client and server using SSL/TLS', correct: true },
        { text: 'Serverless; it loads pages directly from local storage', correct: false },
        { text: 'Static; it only supports pure HTML websites', correct: false }
      ],
      explanation: 'HTTPS stands for Hypertext Transfer Protocol Secure. It uses TLS/SSL to encrypt HTTP requests and responses.'
    },
    {
      id: 'm0-q7',
      topic: 'Port Numbers',
      question: 'Which default port number is used for insecure HTTP web traffic?',
      options: [
        { text: 'Port 80', correct: true },
        { text: 'Port 443', correct: false },
        { text: 'Port 22', correct: false },
        { text: 'Port 3000', correct: false }
      ],
      explanation: 'Port 80 is the default port for unencrypted HTTP traffic. HTTPS defaults to port 443.'
    },
    {
      id: 'm0-q8',
      topic: 'Frontend Responsibilities',
      question: 'Which of the following is primarily a frontend responsibility?',
      options: [
        { text: 'Storing passwords in a secure hashed format', correct: false },
        { text: 'Rendering user interfaces, executing hover animations, and handling button click events', correct: true },
        { text: 'Running complex database queries to calculate sales metrics', correct: false },
        { text: 'Generating JWT authentication signatures', correct: false }
      ],
      explanation: 'The frontend handles everything the user interacts with directly: structure (HTML), styling (CSS), and logic (JS).'
    },
    {
      id: 'm0-q9',
      topic: 'Backend Responsibilities',
      question: 'Which of the following is a backend responsibility?',
      options: [
        { text: 'Displaying responsive grids and CSS animations', correct: false },
        { text: 'Authenticating users, querying the database, and serving APIs', correct: true },
        { text: 'Executing browser window scroll event listeners', correct: false },
        { text: 'Styling input placeholder attributes', correct: false }
      ],
      explanation: 'The backend handles business logic, databases, API routes, security, and authentication behind the scenes.'
    },
    {
      id: 'm0-q10',
      topic: 'DNS Caching',
      question: 'Why do computers cache DNS records locally?',
      options: [
        { text: 'To prevent viruses from hacking domain names', correct: false },
        { text: 'To speed up page loading times by avoiding repeated lookups across the internet hierarchy', correct: true },
        { text: 'To clean up temporary internet browser cookie files', correct: false },
        { text: 'To store the styling files of visited websites', correct: false }
      ],
      explanation: 'DNS caching saves the resolved IP address on your local machine so it doesn\'t have to query the DNS root servers every time.'
    },
    {
      id: 'm0-q11',
      topic: 'Request Headers',
      question: 'What is the purpose of HTTP Headers in a request?',
      options: [
        { text: 'To contain only the HTML source code of the webpage', correct: false },
        { text: 'To send metadata (like content type, authentication tokens, and user-agent)', correct: true },
        { text: 'To hold the main images of the webpage', correct: false },
        { text: 'To store variables inside the server memory', correct: false }
      ],
      explanation: 'HTTP Headers contain key-value pairs that convey metadata about the request or response context.'
    },
    {
      id: 'm0-q12',
      topic: 'Status Codes Group',
      question: 'HTTP status codes starting with the number 5 (e.g., 500, 502) indicate what?',
      options: [
        { text: 'Successful operations', correct: false },
        { text: 'Redirections to other paths', correct: false },
        { text: 'Server-side errors or failures', correct: true },
        { text: 'Client-side input validation errors', correct: false }
      ],
      explanation: '5xx codes represent Server Errors (the server encountered an error it didn\'t know how to handle).'
    },
    {
      id: 'm0-q13',
      topic: 'Browser DevTools',
      question: 'Which tab in the Browser Developer Tools is used to inspect HTTP requests, sizes, and loading times?',
      options: [
        { text: 'Console tab', correct: false },
        { text: 'Elements tab', correct: false },
        { text: 'Network tab', correct: true },
        { text: 'Application tab', correct: false }
      ],
      explanation: 'The Network tab records all asset and fetch HTTP requests, displaying headers, response payloads, and timeline profiles.'
    },
    {
      id: 'm0-q14',
      topic: 'Web Servers',
      question: 'What is the primary role of a Web Server?',
      options: [
        { text: 'To compile HTML into Javascript', correct: false },
        { text: 'To listen for network requests on a specific port and respond with web pages or data files', correct: true },
        { text: 'To connect local laptops using ethernet cables', correct: false },
        { text: 'To encrypt local hard drive files', correct: false }
      ],
      explanation: 'Web servers run constantly, listening on ports (like 80 or 443) and responding to client requests.'
    },
    {
      id: 'm0-q15',
      topic: 'JSON Format',
      question: 'Why is JSON (JavaScript Object Notation) so popular in client-server communication?',
      options: [
        { text: 'It compiles directly to binary files', correct: false },
        { text: 'It is a lightweight, human-readable text format representing structured objects and arrays', correct: true },
        { text: 'It requires specialized software to open', correct: false },
        { text: 'It prevents XSS vulnerabilities automatically', correct: false }
      ],
      explanation: 'JSON is language-agnostic, lightweight, and easily parsed by both JavaScript and backend languages.'
    },
    {
      id: 'm0-q16',
      topic: 'Localhost IP',
      question: 'What standard IP address represents "localhost" (your own machine)?',
      options: [
        { text: '8.8.8.8', correct: false },
        { text: '127.0.0.1', correct: true },
        { text: '192.168.0.1', correct: false },
        { text: '0.0.0.0', correct: false }
      ],
      explanation: '127.0.0.1 is the standard loopback IP address representing the local machine.'
    },
    {
      id: 'm0-q17',
      topic: 'Request Body',
      question: 'Can an HTTP GET request safely transmit large payload bodies (like user files)?',
      options: [
        { text: 'Yes, GET requests are designed for file uploads', correct: false },
        { text: 'No, GET requests should not contain body payloads; parameters are passed in the URL string', correct: true },
        { text: 'Yes, but only if they are encrypted with TLS', correct: false },
        { text: 'No, because GET requests do not communicate with databases', correct: false }
      ],
      explanation: 'GET requests should only retrieve data and parameters are sent via the URL query string. POST/PUT are used for bodies.'
    },
    {
      id: 'm0-q18',
      topic: 'Stateless Protocol',
      question: 'HTTP is called a "stateless" protocol. What does this mean?',
      options: [
        { text: 'The connection stays open forever', correct: false },
        { text: 'Every HTTP request is isolated and the server remembers nothing about previous requests by default', correct: true },
        { text: 'HTTP pages do not contain dynamic variables', correct: false },
        { text: 'Only governments can host HTTP websites', correct: false }
      ],
      explanation: 'HTTP is stateless. To link requests (like keeping a user logged in), developers must use cookies, sessions, or tokens.'
    },
    {
      id: 'm0-q19',
      topic: 'Static vs Dynamic Hosting',
      question: 'What is the main difference between Static and Dynamic hosting?',
      options: [
        { text: 'Static hosting runs backend databases; dynamic hosting doesn\'t', correct: false },
        { text: 'Static hosting serves pre-built files (HTML/CSS/JS) directly; dynamic hosting executes code on a server for each request', correct: true },
        { text: 'Static hosting only works in dark mode', correct: false },
        { text: 'Dynamic hosting does not use TCP/IP protocols', correct: false }
      ],
      explanation: 'Static hosting (Vercel/GitHub Pages) serves assets directly. Dynamic hosting (Render/Heroku) executes node/python code to render pages.'
    },
    {
      id: 'm0-q20',
      topic: 'Client-Side Rendering',
      question: 'What happens during Client-Side Rendering (CSR)?',
      options: [
        { text: 'The server compiles the database queries directly to HTML', correct: false },
        { text: 'The browser downloads a blank HTML shell and uses JavaScript to build the UI dynamically in the browser', correct: true },
        { text: 'All React code is converted into SQL queries', correct: false },
        { text: 'The client encrypts the router state using JWT', correct: false }
      ],
      explanation: 'In CSR (typical for React SPAs), the browser fetches a minimal HTML page and JS files, which then construct the DOM.'
    }
  ],

  m1: [
    {
      id: 'm1-q1',
      topic: 'CLI Commands',
      question: 'What terminal command prints the absolute path of the current folder you are inside?',
      options: [
        { text: 'ls', correct: false },
        { text: 'pwd', correct: true },
        { text: 'cd', correct: false },
        { text: 'mkdir', correct: false }
      ],
      explanation: 'pwd stands for "Print Working Directory" and outputs the current folder path.'
    },
    {
      id: 'm1-q2',
      topic: 'Folder Creation',
      question: 'How do you create a new directory named "project" in the terminal?',
      options: [
        { text: 'touch project', correct: false },
        { text: 'mkdir project', correct: true },
        { text: 'cd project', correct: false },
        { text: 'dir project', correct: false }
      ],
      explanation: 'mkdir stands for "Make Directory" and is used to create new folders.'
    },
    {
      id: 'm1-q3',
      topic: 'File Creation',
      question: 'What terminal command is commonly used to create a new empty file (like index.html)?',
      options: [
        { text: 'touch index.html', correct: true },
        { text: 'mkdir index.html', correct: false },
        { text: 'cd index.html', correct: false },
        { text: 'cat index.html', correct: false }
      ],
      explanation: 'touch creates an empty file or updates the access date of an existing file.'
    },
    {
      id: 'm1-q4',
      topic: 'Directory Navigation',
      question: 'How do you move up one level (to the parent directory) in the terminal?',
      options: [
        { text: 'cd ..', correct: true },
        { text: 'cd /', correct: false },
        { text: 'cd ~', correct: false },
        { text: 'cd .', correct: false }
      ],
      explanation: 'The double dot (..) represents the parent directory. cd .. changes the directory to the parent.'
    },
    {
      id: 'm1-q5',
      topic: 'Integrated Terminal',
      question: 'Why is using the integrated terminal inside VS Code recommended over separate shell windows?',
      options: [
        { text: 'It runs commands twice as fast', correct: false },
        { text: 'It automatically keeps your terminal located in the root of your currently open project workspace', correct: true },
        { text: 'It translates bash commands into PowerShell syntax automatically', correct: false },
        { text: 'It hides your code from hackers', correct: false }
      ],
      explanation: 'The integrated terminal opens directly in your open workspace directory, preventing "wrong folder" execution errors.'
    },
    {
      id: 'm1-q6',
      topic: 'Git Init',
      question: 'What does the command "git init" do?',
      options: [
        { text: 'It downloads a repository from GitHub', correct: false },
        { text: 'It creates a hidden .git folder, initializing a new local Git repository in the current folder', correct: true },
        { text: 'It commits all unstaged changes to the main branch', correct: false },
        { text: 'It installs Node.js dependencies', correct: false }
      ],
      explanation: 'git init sets up all the tracking databases Git needs inside a hidden .git folder in your directory.'
    },
    {
      id: 'm1-q7',
      topic: 'Git Staging',
      question: 'What is the purpose of the Git Staging Area?',
      options: [
        { text: 'To host code on GitHub servers', correct: false },
        { text: 'A preparation area where you select and organize changes before committing them', correct: true },
        { text: 'A test sandbox for running code scripts', correct: false },
        { text: 'A place to recover deleted files', correct: false }
      ],
      explanation: 'Staging (via git add) lets you choose exactly which modifications will be packaged into the next commit snapshot.'
    },
    {
      id: 'm1-q8',
      topic: 'Git Add',
      question: 'Which command stages all modified and new files in the current directory?',
      options: [
        { text: 'git add .', correct: true },
        { text: 'git commit -a', correct: false },
        { text: 'git stage all', correct: false },
        { text: 'git status', correct: false }
      ],
      explanation: 'git add . searches recursively in the current folder and stages all changes.'
    },
    {
      id: 'm1-q9',
      topic: 'Git Commit',
      question: 'What is a Git Commit?',
      options: [
        { text: 'A backup file uploaded to a server', correct: false },
        { text: 'A permanent snapshot of staged files with a descriptive message, acting as a savepoint', correct: true },
        { text: 'A merge request sent to other developers', correct: false },
        { text: 'A setting to ignore temporary folders', correct: false }
      ],
      explanation: 'Commits are core Git checkpoints. They create a record of changes that you can safely return to later.'
    },
    {
      id: 'm1-q10',
      topic: 'Git Commit Flag',
      question: 'What is the correct syntax to commit changes with a short message?',
      options: [
        { text: 'git commit "My message"', correct: false },
        { text: 'git commit -m "My message"', correct: true },
        { text: 'git commit -message "My message"', correct: false },
        { text: 'git commit add "My message"', correct: false }
      ],
      explanation: 'The -m flag stands for message. It lets you write the message directly in the command line.'
    },
    {
      id: 'm1-q11',
      topic: 'Git Status',
      question: 'What information does "git status" show?',
      options: [
        { text: 'Your commit history graph', correct: false },
        { text: 'Which files are modified, staged for commit, or currently untracked', correct: true },
        { text: 'The login email of your GitHub account', correct: false },
        { text: 'The list of installed npm modules', correct: false }
      ],
      explanation: 'git status tells you what files are staged, modified, or untracked in your local workspace.'
    },
    {
      id: 'm1-q12',
      topic: 'Git Remote',
      question: 'What is a Git Remote?',
      options: [
        { text: 'A physical controller for displaying slides', correct: false },
        { text: 'A reference pointing to a version of your repository hosted on a shared server like GitHub', correct: true },
        { text: 'A hidden file configuration for VS Code', correct: false },
        { text: 'A command line tool to deploy servers', correct: false }
      ],
      explanation: 'A remote is a URL (usually pointing to GitHub) that connects your local repository to a cloud host.'
    },
    {
      id: 'm1-q13',
      topic: 'Git Push',
      question: 'Which command uploads local commits from your current branch to the remote repository?',
      options: [
        { text: 'git upload remote', correct: false },
        { text: 'git push', correct: true },
        { text: 'git commit --push', correct: false },
        { text: 'git pull', correct: false }
      ],
      explanation: 'git push uploads your local branch commits to the corresponding branch on your remote repository.'
    },
    {
      id: 'm1-q14',
      topic: 'Git Pull',
      question: 'What does "git pull" do?',
      options: [
        { text: 'It staging all local files', correct: false },
        { text: 'It fetches changes from the remote server and merges them into your local branch', correct: true },
        { text: 'It deletes local files matching the server', correct: false },
        { text: 'It creates a new repository on GitHub', correct: false }
      ],
      explanation: 'git pull downloads remote updates and immediately merges them, syncing your local codebase.'
    },
    {
      id: 'm1-q15',
      topic: 'Git Log',
      question: 'What command displays your local commit savepoint history?',
      options: [
        { text: 'git history', correct: false },
        { text: 'git status', correct: false },
        { text: 'git log', correct: true },
        { text: 'git diff', correct: false }
      ],
      explanation: 'git log shows a list of past commits, showing hashes, authors, dates, and commit messages.'
    },
    {
      id: 'm1-q16',
      topic: 'Gitignore File',
      question: 'What is the purpose of the `.gitignore` file?',
      options: [
        { text: 'To delete temp files automatically from your disk', correct: false },
        { text: 'To tell Git which files or folders (like node_modules and .env) to completely ignore and never track', correct: true },
        { text: 'To encrypt sensitive credentials files', correct: false },
        { text: 'To show which files have compile errors', correct: false }
      ],
      explanation: 'The .gitignore file prevents temporary, vendor, or sensitive files from being checked into version control.'
    },
    {
      id: 'm1-q17',
      topic: 'Package JSON',
      question: 'What is the role of `package.json` in a Node.js project?',
      options: [
        { text: 'To write style definitions in JSON format', correct: false },
        { text: 'A metadata file that tracks project info, dependency packages, and scripts configuration', correct: true },
        { text: 'To serve as a database storage file', correct: false },
        { text: 'To compile frontend code into HTML templates', correct: false }
      ],
      explanation: 'package.json manages project metadata, scripts (like dev/build), and required library versions.'
    },
    {
      id: 'm1-q18',
      topic: 'Node Modules',
      question: 'What is the `node_modules` directory?',
      options: [
        { text: 'A folder containing your core database scripts', correct: false },
        { text: 'A folder where npm downloads and stores all third-party package dependencies', correct: true },
        { text: 'A hidden folder containing Git configurations', correct: false },
        { text: 'The installation path of VS Code extensions', correct: false }
      ],
      explanation: 'node_modules is the local cache directory where npm installs all library packages your project imports.'
    },
    {
      id: 'm1-q19',
      topic: 'NPM Install',
      question: 'If you download a project that has a `package.json` but no `node_modules` folder, how do you install all required packages?',
      options: [
        { text: 'Run "npm init"', correct: false },
        { text: 'Run "npm install" (or "npm i")', correct: true },
        { text: 'Run "git clone"', correct: false },
        { text: 'Copy the folder from your desktop', correct: false }
      ],
      explanation: 'Running `npm install` tells npm to read package.json and download all listed dependencies.'
    },
    {
      id: 'm1-q20',
      topic: 'NPM Scripts',
      question: 'How do you execute custom scripts defined in your package.json (like a "start" script)?',
      options: [
        { text: 'npm run start', correct: true },
        { text: 'node start', correct: false },
        { text: 'git run start', correct: false },
        { text: 'bash start.sh', correct: false }
      ],
      explanation: 'npm run [script-name] is the standard command to execute scripts configured inside package.json.'
    }
  ],

  m2: [
    {
      id: 'm2-q1',
      topic: 'HTML Semantics',
      question: 'Why is using semantic elements (like <header>, <main>, <nav>) preferred over generic <div> tags?',
      options: [
        { text: 'They automatically center elements on the page', correct: false },
        { text: 'They convey structure and meaning to browsers, screen readers, and search engines, improving SEO and accessibility', correct: true },
        { text: 'They compile faster into CSS styles', correct: false },
        { text: 'They prevent Javascript files from throwing errors', correct: false }
      ],
      explanation: 'Semantic tags define the purpose of a block, assisting screen readers and SEO indices.'
    },
    {
      id: 'm2-q2',
      topic: 'HTML Form Inputs',
      question: 'Which element is crucial for grouping input controls and handling submit actions on a web form?',
      options: [
        { text: '<section>', correct: false },
        { text: '<form>', correct: true },
        { text: '<fieldset>', correct: false },
        { text: '<div>', correct: false }
      ],
      explanation: 'The <form> element handles submissions and maps inputs for API submissions.'
    },
    {
      id: 'm2-q3',
      topic: 'CSS Box Model',
      question: 'What are the four components of the CSS Box Model, starting from the inside out?',
      options: [
        { text: 'Border, Padding, Content, Margin', correct: false },
        { text: 'Content, Padding, Border, Margin', correct: true },
        { text: 'Content, Margin, Border, Padding', correct: false },
        { text: 'Padding, Content, Margin, Border', correct: false }
      ],
      explanation: 'The sequence is content, padding (spacing inside border), border (frame outline), and margin (spacing outside border).'
    },
    {
      id: 'm2-q4',
      topic: 'CSS Selectors',
      question: 'How do you target an element with the class name "btn" in CSS?',
      options: [
        { text: '#btn', correct: false },
        { text: '.btn', correct: true },
        { text: 'btn', correct: false },
        { text: '*btn', correct: false }
      ],
      explanation: 'Classes are prefixed with a dot (.) in CSS selectors. IDs are prefixed with a hash (#).'
    },
    {
      id: 'm2-q5',
      topic: 'Flexbox Layout',
      question: 'In CSS Flexbox, what property controls the horizontal alignment of elements along the main axis?',
      options: [
        { text: 'align-items', correct: false },
        { text: 'justify-content', correct: true },
        { text: 'flex-direction', correct: false },
        { text: 'align-content', correct: false }
      ],
      explanation: 'justify-content defines the spacing and alignment along the main axis (usually horizontally).'
    },
    {
      id: 'm2-q6',
      topic: 'CSS Grid',
      question: 'How do you define a grid layout with three columns of equal width?',
      options: [
        { text: 'grid-template-columns: repeat(3, 1fr);', correct: true },
        { text: 'display: flex; columns: 3;', correct: false },
        { text: 'grid-columns: 33% 33% 33%;', correct: false },
        { text: 'grid-template-rows: 1fr 1fr 1fr;', correct: false }
      ],
      explanation: 'repeat(3, 1fr) sets up three equal columns taking up one fraction (1fr) of the container width.'
    },
    {
      id: 'm2-q7',
      topic: 'JS Variables',
      question: 'Which of the following is true regarding variables declared with "const" in JavaScript?',
      options: [
        { text: 'They are globally accessible by default', correct: false },
        { text: 'They must be initialized immediately and their values cannot be reassigned', correct: true },
        { text: 'They can only store text strings', correct: false },
        { text: 'They are hoisted as undefined values', correct: false }
      ],
      explanation: 'const declares a read-only reference. Its value cannot be changed via reassignment.'
    },
    {
      id: 'm2-q8',
      topic: 'JS Functions',
      question: 'You see this arrow function in AI code. What is its name?\n\nconst greet = (name) => `Hello, ${name}`;',
      options: [
        { text: 'name', correct: false },
        { text: 'greet', correct: true },
        { text: 'const', correct: false },
        { text: 'Hello', correct: false }
      ],
      explanation: 'The variable greet stores the anonymous arrow function, naming it greet.'
    },
    {
      id: 'm2-q9',
      topic: 'JS Conditionals',
      question: 'What is the output of the console log in this script?\n\nconst score = 75;\nif (score >= 80) {\n  console.log("A");\n} else if (score >= 70) {\n  console.log("B");\n} else {\n  console.log("C");\n}',
      options: [
        { text: 'A', correct: false },
        { text: 'B', correct: true },
        { text: 'C', correct: false },
        { text: 'undefined', correct: false }
      ],
      explanation: 'Since 75 is not >= 80 but is >= 70, the first else-if branch triggers, printing "B".'
    },
    {
      id: 'm2-q10',
      topic: 'JS Arrays',
      question: 'How do you add an item to the end of a JavaScript array?',
      options: [
        { text: 'items.append(item)', correct: false },
        { text: 'items.push(item)', correct: true },
        { text: 'items.add(item)', correct: false },
        { text: 'items.insert(item)', correct: false }
      ],
      explanation: 'The push() method appends elements to the end of a JavaScript array.'
    },
    {
      id: 'm2-q11',
      topic: 'JS Loops',
      question: 'How many times will this loop execute?\n\nfor (let i = 0; i < 5; i++) { ... }',
      options: [
        { text: '4 times', correct: false },
        { text: '5 times', correct: true },
        { text: '6 times', correct: false },
        { text: '0 times', correct: false }
      ],
      explanation: 'The index i goes from 0, 1, 2, 3, to 4. Since 5 is not < 5, it terminates, yielding 5 iterations.'
    },
    {
      id: 'm2-q12',
      topic: 'DOM Selection',
      question: 'How do you select an element with the class name "alert" using the modern DOM API?',
      options: [
        { text: 'document.getElementByClass("alert")', correct: false },
        { text: 'document.querySelector(".alert")', correct: true },
        { text: 'document.select(".alert")', correct: false },
        { text: 'document.querySelectorAll("alert")', correct: false }
      ],
      explanation: 'querySelector selector uses CSS syntax, so selecting by class requires the dot notation.'
    },
    {
      id: 'm2-q13',
      topic: 'Event Listeners',
      question: 'How do you attach a click event handler function to a button element?',
      options: [
        { text: 'button.onclickListener(handler)', correct: false },
        { text: 'button.addEventListener("click", handler)', correct: true },
        { text: 'button.addEvent("click", handler)', correct: false },
        { text: 'button.click(handler)', correct: false }
      ],
      explanation: 'addEventListener is the standard method to register event listeners on DOM elements.'
    },
    {
      id: 'm2-q14',
      topic: 'Fetch API',
      question: 'What type of object does the global fetch() function return?',
      options: [
        { text: 'A JSON string', correct: false },
        { text: 'A Promise that resolves to a Response object', correct: true },
        { text: 'A raw database record', correct: false },
        { text: 'An array of objects', correct: false }
      ],
      explanation: 'fetch() operates asynchronously and returns a Promise.'
    },
    {
      id: 'm2-q15',
      topic: 'CSS Cascade',
      question: 'If a CSS stylesheet has two rules targeting the same paragraph tag: "p { color: red; }" followed by "p { color: blue; }", what color will the text be?',
      options: [
        { text: 'Red', correct: false },
        { text: 'Blue', correct: true },
        { text: 'Black', correct: false },
        { text: 'Purple (mixed)', correct: false }
      ],
      explanation: 'Because of the CSS Cascade, if selectors have the same specificity, the last rule declared wins.'
    },
    {
      id: 'm2-q16',
      topic: 'Async/Await',
      question: 'Why do developers use "async" and "await" keywords with fetch calls?',
      options: [
        { text: 'To speed up network data transfer rates', correct: false },
        { text: 'To write clean, synchronous-looking code for handling asynchronous operations', correct: true },
        { text: 'To encrypt request bodies before shipping', correct: false },
        { text: 'To allow the page to reload faster', correct: false }
      ],
      explanation: 'async/await is syntactic sugar over Promises, making code readable and readable.'
    },
    {
      id: 'm2-q17',
      topic: 'Responsive Design',
      question: 'What is the purpose of media queries in CSS?',
      options: [
        { text: 'To play music files on the page', correct: false },
        { text: 'To apply different stylesheets depending on the screen width or device size', correct: true },
        { text: 'To query the database for media links', correct: false },
        { text: 'To style videos specifically', correct: false }
      ],
      explanation: 'Media queries are the foundation of responsive web design, letting layouts adapt to viewport sizes.'
    },
    {
      id: 'm2-q18',
      topic: 'JSON Parse',
      question: 'If you receive a response string from fetch, which method parses it into a JavaScript object?',
      options: [
        { text: 'response.parse()', correct: false },
        { text: 'response.json()', correct: true },
        { text: 'JSON.stringify(response)', correct: false },
        { text: 'response.body()', correct: false }
      ],
      explanation: 'The response.json() method parses the Response stream to read the body as JSON.'
    },
    {
      id: 'm2-q19',
      topic: 'Semantic Forms',
      question: 'Why is the "<label>" element important next to input fields?',
      options: [
        { text: 'It styles inputs in dark mode', correct: false },
        { text: 'It connects text to inputs, enabling screen readers to speak the label and widening click targets', correct: true },
        { text: 'It sends input data directly to the database', correct: false },
        { text: 'It centers form fields on screen', correct: false }
      ],
      explanation: 'Using label with an "htmlFor" or nested connected input is a key accessibility standard.'
    },
    {
      id: 'm2-q20',
      topic: 'Inline Styles',
      question: 'Why should you avoid using inline styles (like style="color: blue") in production templates?',
      options: [
        { text: 'They render slower than normal CSS', correct: false },
        { text: 'They override external stylesheets, clutter layouts, and make styling hard to maintain', correct: true },
        { text: 'They are blocked by modern browsers for security', correct: false },
        { text: 'They only work on text elements', correct: false }
      ],
      explanation: 'Inline styles have high specificity, causing overrides that complicate code maintenance.'
    }
  ],

  m3: [
    {
      id: 'm3-q1',
      topic: 'React Components',
      question: 'What is a React Component?',
      options: [
        { text: 'A database collection of user objects', correct: false },
        { text: 'A reusable, self-contained function that returns JSX describing a UI section', correct: true },
        { text: 'A CSS class library for grid layout settings', correct: false },
        { text: 'An API route on an Express server', correct: false }
      ],
      explanation: 'React components are JS functions returning JSX, forming the building blocks of user interfaces.'
    },
    {
      id: 'm3-q2',
      topic: 'JSX Rules',
      question: 'Which of the following is a strict requirement when writing JSX tags?',
      options: [
        { text: 'All tags must be capitalized', correct: false },
        { text: 'Every element must close, and a single root parent element must wrap all returned siblings', correct: true },
        { text: 'Class names must be defined using the "class" attribute', correct: false },
        { text: 'You cannot write javascript variables inside it', correct: false }
      ],
      explanation: 'JSX requires closed tags (like <img />) and a single parent wrapper (or Fragment `<>...</>`).'
    },
    {
      id: 'm3-q3',
      topic: 'Props',
      question: 'What is the purpose of "props" in React?',
      options: [
        { text: 'To update the internal state of a component', correct: false },
        { text: 'To pass data from a parent component down to a child component', correct: true },
        { text: 'To query database elements on the server', correct: false },
        { text: 'To define animation timing values', correct: false }
      ],
      explanation: 'Props are short for properties. They represent read-only inputs passed down the component tree.'
    },
    {
      id: 'm3-q4',
      topic: 'State',
      question: 'What is the key difference between props and state?',
      options: [
        { text: 'Props are mutable; state is read-only', correct: false },
        { text: 'State is managed internally inside a component and can change; props are read-only inputs passed down', correct: true },
        { text: 'State is only for numbers; props are for text', correct: false },
        { text: 'There is no difference between them', correct: false }
      ],
      explanation: 'State is local to a component and can trigger re-renders when updated. Props are immutable inputs.'
    },
    {
      id: 'm3-q5',
      topic: 'useState Hook',
      question: 'In `const [count, setCount] = useState(0);`, what is setCount?',
      options: [
        { text: 'A variable holding the current number', correct: false },
        { text: 'A function used to update the count state and trigger a component re-render', correct: true },
        { text: 'An event listener mapping click events', correct: false },
        { text: 'An external API URL route', correct: false }
      ],
      explanation: 'setCount is the setter function returned by useState to update the state variable and queue a re-render.'
    },
    {
      id: 'm3-q6',
      topic: 'JSX Class Attribute',
      question: 'How do you define a CSS class name on an element inside JSX?',
      options: [
        { text: 'class="container"', correct: false },
        { text: 'className="container"', correct: true },
        { text: 'class_name="container"', correct: false },
        { text: 'styleClass="container"', correct: false }
      ],
      explanation: 'Since "class" is a reserved keyword in JS, JSX uses "className" to assign CSS classes.'
    },
    {
      id: 'm3-q7',
      topic: 'Conditional Rendering',
      question: 'How do you render a component only if a condition (like isLoggedIn) is true inside JSX?',
      options: [
        { text: '{isLoggedIn && <Dashboard />}', correct: true },
        { text: '{if (isLoggedIn) <Dashboard />}', correct: false },
        { text: '{isLoggedIn ? <Dashboard>}', correct: false },
        { text: '{isLoggedIn.render(<Dashboard />)}', correct: false }
      ],
      explanation: 'The logical AND (&&) operator evaluates the right expression if the left condition is truthy.'
    },
    {
      id: 'm3-q8',
      topic: 'Rendering Lists',
      question: 'When rendering lists of components using `.map()`, why does React require you to pass a "key" prop to each list item?',
      options: [
        { text: 'To apply CSS grid alignments', correct: false },
        { text: 'To help React identify which items have changed, been added, or removed, optimizing performance during updates', correct: true },
        { text: 'To encrypt list items for database storage', correct: false },
        { text: 'To allow items to link to external URLs', correct: false }
      ],
      explanation: 'The "key" prop provides a unique identity to list items, letting React reconcile lists during rendering.'
    },
    {
      id: 'm3-q9',
      topic: 'React Events',
      question: 'What is the correct syntax for a click event handler in React?',
      options: [
        { text: 'onclick={handleClick}', correct: false },
        { text: 'onClick={handleClick}', correct: true },
        { text: 'onClick="handleClick()"', correct: false },
        { text: 'on_click={handleClick}', correct: false }
      ],
      explanation: 'React event handlers use camelCase naming (like onClick) and receive function references (not strings).'
    },
    {
      id: 'm3-q10',
      topic: 'Controlled Inputs',
      question: 'What is a "controlled component" in React forms?',
      options: [
        { text: 'An input controlled directly by the server API', correct: false },
        { text: 'An input whose value is bound to and driven by a React state variable, with updates handled via onChange', correct: true },
        { text: 'An input that cannot be edited by the user', correct: false },
        { text: 'A component with strict CSS styles', correct: false }
      ],
      explanation: 'A controlled component ensures the React state acts as the "single source of truth" for the form element.'
    },
    {
      id: 'm3-q11',
      topic: 'useEffect Hook',
      question: 'What is the primary purpose of the `useEffect` hook?',
      options: [
        { text: 'To declare local state variables', correct: false },
        { text: 'To synchronize a component with external systems or run side effects (like fetching data, event handlers, timers)', correct: true },
        { text: 'To navigate between path routes', correct: false },
        { text: 'To write CSS styling rules inside Javascript', correct: false }
      ],
      explanation: 'useEffect lets you handle operations that affect things outside the pure rendering flow (side effects).'
    },
    {
      id: 'm3-q12',
      topic: 'useEffect Array',
      question: 'If you pass an empty dependency array `[]` to a `useEffect` hook, when does the effect execute?',
      options: [
        { text: 'On every single re-render of the component', correct: false },
        { text: 'Only once, immediately after the component mounts (is rendered on screen the first time)', correct: true },
        { text: 'Only when the component props change', correct: false },
        { text: 'Whenever local storage is modified', correct: false }
      ],
      explanation: 'An empty dependency array tells React the effect does not depend on any state/props, running it once on mount.'
    },
    {
      id: 'm3-q13',
      topic: 'Dynamic Styles',
      question: 'How do you apply dynamic inline styles in JSX?',
      options: [
        { text: 'style="color: red;"', correct: false },
        { text: 'style={{ color: "red" }}', correct: true },
        { text: 'style={color: "red"}', correct: false },
        { text: 'style="color: {red}"', correct: false }
      ],
      explanation: 'In JSX, styles require an object. Double braces `{{ }}` denote a JS expression containing an object literal.'
    },
    {
      id: 'm3-q14',
      topic: 'Immutability State',
      question: 'If you have an array state variable "todos", how should you append a new item to it?',
      options: [
        { text: 'todos.push(newItem);', correct: false },
        { text: 'setTodos([...todos, newItem]);', correct: true },
        { text: 'setTodos(todos.push(newItem));', correct: false },
        { text: 'todos = [...todos, newItem];', correct: false }
      ],
      explanation: 'React state must be treated as immutable. Creating a new array (via spread syntax) is required to trigger re-renders.'
    },
    {
      id: 'm3-q15',
      topic: 'Parent-Child State',
      question: 'If two child components need to share a state variable, how should you structure the state?',
      options: [
        { text: 'Declare the state in both child components separately', correct: false },
        { text: '"Lift state up" by declaring it in their nearest common parent component, passing it down as props', correct: true },
        { text: 'Save the state inside local browser cookies', correct: false },
        { text: 'Write the state values directly into CSS rules', correct: false }
      ],
      explanation: 'Lifting state up is the standard React design pattern for sharing state between sibling components.'
    },
    {
      id: 'm3-q16',
      topic: 'React Fragment',
      question: 'What is a React Fragment (`<>...</>`) used for?',
      options: [
        { text: 'To split files into smaller code blocks', correct: false },
        { text: 'To wrap multiple sibling JSX elements without adding an extra layout node (like a <div>) to the DOM', correct: true },
        { text: 'To encrypt sensitive JSX fields', correct: false },
        { text: 'To create CSS flex box alignments', correct: false }
      ],
      explanation: 'Fragments avoid DOM bloat, grouping siblings without introducing unwanted wrapper elements.'
    },
    {
      id: 'm3-q17',
      topic: 'Children Prop',
      question: 'What does the reserved `children` prop represent in React?',
      options: [
        { text: 'The number of sub-components spawned', correct: false },
        { text: 'Any JSX elements nested inside the opening and closing tags of a custom component wrapper', correct: true },
        { text: 'A list of user records from database queries', correct: false },
        { text: 'CSS styles for kid layouts', correct: false }
      ],
      explanation: 'The children prop allows components to act as template shells, containing arbitrary nested content.'
    },
    {
      id: 'm3-q18',
      topic: 'State Lifecycle',
      question: 'What happens when state changes inside a React component?',
      options: [
        { text: 'The whole page reloads from the server', correct: false },
        { text: 'The component function executes again (re-renders), computing a new UI snapshot', correct: true },
        { text: 'The CSS stylesheets are re-downloaded', correct: false },
        { text: 'The database schema updates', correct: false }
      ],
      explanation: 'React responds to state changes by executing the component function again to reflect the state in the DOM.'
    },
    {
      id: 'm3-q19',
      topic: 'Hooks Rules',
      question: 'Which of the following is a rule when using React Hooks?',
      options: [
        { text: 'They can only be called inside loops and conditionals', correct: false },
        { text: 'They must only be called at the top level of React function components (not inside loops or if statements)', correct: true },
        { text: 'They can only be declared inside class constructors', correct: false },
        { text: 'They must return HTML tags', correct: false }
      ],
      explanation: 'Hooks rely on call order consistency. Calling them conditionally breaks React\'s internal hook indexing.'
    },
    {
      id: 'm3-q20',
      topic: 'State Batching',
      question: 'If you run `setCount(c => c + 1)` three times in a single event handler, does React render 3 times?',
      options: [
        { text: 'Yes, it triggers 3 separate rendering sweeps', correct: false },
        { text: 'No, React batches state updates together, triggering a single visual re-render for performance', correct: true },
        { text: 'Yes, but only if they are wrapped in a useEffect hook', correct: false },
        { text: 'No, because state updates are blocked inside event handlers', correct: false }
      ],
      explanation: 'React batches state updates that happen inside the same event handler block to optimize DOM updates.'
    }
  ],

  m4: [
    {
      id: 'm4-q1',
      topic: 'Node.js',
      question: 'What is Node.js?',
      options: [
        { text: 'A database management system', correct: false },
        { text: 'A JavaScript runtime that allows you to execute JavaScript code on a server, outside the browser', correct: true },
        { text: 'A CSS compiler extension for VS Code', correct: false },
        { text: 'A cloud hosting server provider', correct: false }
      ],
      explanation: 'Node.js wraps Google Chrome\'s V8 engine, letting JS run on server computers.'
    },
    {
      id: 'm4-q2',
      topic: 'Express.js',
      question: 'What is Express.js?',
      options: [
        { text: 'A fast compiler for React templates', correct: false },
        { text: 'A minimal, flexible Node.js web application framework designed for building servers and API routes', correct: true },
        { text: 'A packages downloader command line tool', correct: false },
        { text: 'A database query optimizer', correct: false }
      ],
      explanation: 'Express handles server listening, routes, middleware, and request/response pipelines.'
    },
    {
      id: 'm4-q3',
      topic: 'Express Server setup',
      question: 'What is the correct way to start an Express server listening for requests on port 3000?',
      options: [
        { text: 'app.listen(3000, callback)', correct: true },
        { text: 'app.start(3000, callback)', correct: false },
        { text: 'app.serve(3000, callback)', correct: false },
        { text: 'app.port = 3000', correct: false }
      ],
      explanation: 'The app.listen() method starts a UNIX socket on the specified port to listen for connections.'
    },
    {
      id: 'm4-q4',
      topic: 'Express Routing',
      question: 'What does this route handler do?\n\napp.get("/api/users", (req, res) => { ... })',
      options: [
        { text: 'It creates a new user inside the database', correct: false },
        { text: 'It handles HTTP GET requests sent to the "/api/users" path', correct: true },
        { text: 'It fetches user details from the client-side browser cookies', correct: false },
        { text: 'It redirects users to their signup forms', correct: false }
      ],
      explanation: 'app.get maps a GET request targeting "/api/users" to the callback handler.'
    },
    {
      id: 'm4-q5',
      topic: 'Route Parameters',
      question: 'In `app.get("/api/items/:id", (req, res) => { ... })`, how do you access the value of ":id"?',
      options: [
        { text: 'req.body.id', correct: false },
        { text: 'req.params.id', correct: true },
        { text: 'req.query.id', correct: false },
        { text: 'req.id', correct: false }
      ],
      explanation: 'Dynamic route parameters (prefixed with a colon) are parsed into the `req.params` object.'
    },
    {
      id: 'm4-q6',
      topic: 'Query String Parameters',
      question: 'If a client requests `/api/search?q=react`, how does the Express backend access the search term "react"?',
      options: [
        { text: 'req.params.q', correct: false },
        { text: 'req.query.q', correct: true },
        { text: 'req.body.q', correct: false },
        { text: 'req.search', correct: false }
      ],
      explanation: 'Query string parameters (following the question mark) are parsed into `req.query`.'
    },
    {
      id: 'm4-q7',
      topic: 'JSON Response',
      question: 'Which method should you use in an Express route to send a JSON response to the client?',
      options: [
        { text: 'res.sendJSON(data)', correct: false },
        { text: 'res.json(data)', correct: true },
        { text: 'res.write(data)', correct: false },
        { text: 'res.sendHTML(data)', correct: false }
      ],
      explanation: 'res.json() converts objects/arrays to a JSON string and sets the Content-Type header to application/json.'
    },
    {
      id: 'm4-q8',
      topic: 'JSON Body Parsing',
      question: 'Which Express middleware is required to automatically parse JSON payloads sent in request bodies?',
      options: [
        { text: 'app.use(express.static())', correct: false },
        { text: 'app.use(express.json())', correct: true },
        { text: 'app.use(express.cors())', correct: false },
        { text: 'app.use(express.body())', correct: false }
      ],
      explanation: 'Without `express.json()`, `req.body` is undefined. This middleware parses incoming requests with JSON payloads.'
    },
    {
      id: 'm4-q9',
      topic: 'Status Code response',
      question: 'How do you send an HTTP 201 Created status code alongside a JSON response in Express?',
      options: [
        { text: 'res.status(201).json(data)', correct: true },
        { text: 'res.code(201).send(data)', correct: false },
        { text: 'res.json(data, 201)', correct: false },
        { text: 'res.send(201, data)', correct: false }
      ],
      explanation: 'Chaining .status(code) before calling .json() or .send() sets the HTTP response status code.'
    },
    {
      id: 'm4-q10',
      topic: 'Relational vs Document DB',
      question: 'What is a core characteristic of Relational Databases (like PostgreSQL)?',
      options: [
        { text: 'They store data in unstructured text files', correct: false },
        { text: 'They store data in structured tables with defined schemas, columns, types, and constraints', correct: true },
        { text: 'They do not support primary keys', correct: false },
        { text: 'They are built entirely on JSON structures', correct: false }
      ],
      explanation: 'Relational databases use tables, strict schemas, columns, and relationships (foreign keys).'
    },
    {
      id: 'm4-q11',
      topic: 'SQL SELECT',
      question: 'What is the SQL query to retrieve the "username" of all records in a table named "users"?',
      options: [
        { text: 'GET username FROM users;', correct: false },
        { text: 'SELECT username FROM users;', correct: true },
        { text: 'FIND username IN users;', correct: false },
        { text: 'SELECT * FROM users;', correct: false }
      ],
      explanation: 'SELECT specifies the column names, and FROM specifies the target table name.'
    },
    {
      id: 'm4-q12',
      topic: 'SQL WHERE',
      question: 'How do you select all columns from the "products" table where the price is greater than 50?',
      options: [
        { text: 'SELECT * FROM products HAVING price > 50;', correct: false },
        { text: 'SELECT * FROM products WHERE price > 50;', correct: true },
        { text: 'FIND products WHERE price > 50;', correct: false },
        { text: 'SELECT price > 50 FROM products;', correct: false }
      ],
      explanation: 'The WHERE clause filters database records based on specified comparison conditions.'
    },
    {
      id: 'm4-q13',
      topic: 'Primary Key',
      question: 'What is the role of a Primary Key in a relational database table?',
      options: [
        { text: 'To encrypt table records', correct: false },
        { text: 'A column containing a unique identifier for every single record in that table', correct: true },
        { text: 'To link one database server to another', correct: false },
        { text: 'To store user passwords', correct: false }
      ],
      explanation: 'A Primary Key uniquely identifies each row in a database table, preventing duplicate records.'
    },
    {
      id: 'm4-q14',
      topic: 'Foreign Key',
      question: 'What is a Foreign Key?',
      options: [
        { text: 'An encryption key used by foreign users', correct: false },
        { text: 'A column that stores the primary key value of another table, linking the two tables together', correct: true },
        { text: 'A backup key for root servers', correct: false },
        { text: 'A index query speed booster', correct: false }
      ],
      explanation: 'Foreign keys establish relationships between rows in different tables.'
    },
    {
      id: 'm4-q15',
      topic: 'CRUD Operations',
      question: 'Which HTTP method maps to the "Create" operation in CRUD?',
      options: [
        { text: 'GET', correct: false },
        { text: 'POST', correct: true },
        { text: 'PUT', correct: false },
        { text: 'DELETE', correct: false }
      ],
      explanation: 'In REST principles, POST creates resources, GET reads them, PUT/PATCH updates them, and DELETE removes them.'
    },
    {
      id: 'm4-q16',
      topic: 'Relational Joins',
      question: 'What does an INNER JOIN query accomplish in SQL?',
      options: [
        { text: 'It creates a new database table', correct: false },
        { text: 'It combines rows from two tables based on a related column between them', correct: true },
        { text: 'It deletes overlapping records in columns', correct: false },
        { text: 'It hashes matching data keys', correct: false }
      ],
      explanation: 'JOINS let you query related data across multiple tables in a single operation.'
    },
    {
      id: 'm4-q17',
      topic: 'Password Hashing',
      question: 'Why should passwords never be stored in plain text in a database?',
      options: [
        { text: 'Plain text files are slow to search', correct: false },
        { text: 'If the database is hacked or leaked, all user passwords will be exposed; hashing stores an irreversible mathematical representation', correct: true },
        { text: 'Node.js cannot compile plain text strings', correct: false },
        { text: 'Browsers block plain text passwords from being typed', correct: false }
      ],
      explanation: 'Hashing algorithms (like bcrypt) protect user credentials in the event of database breaches.'
    },
    {
      id: 'm4-q18',
      topic: 'JWT Tokens',
      question: 'What is a JSON Web Token (JWT)?',
      options: [
        { text: 'A secure package containing Express server files', correct: false },
        { text: 'A digitally signed text string encoding user data (payload) that the server can verify without querying a session database', correct: true },
        { text: 'A browser plugin for security validations', correct: false },
        { text: 'A type of database indexing key', correct: false }
      ],
      explanation: 'JWTs are stateless credentials. The server signs the token, and the client sends it back on every request.'
    },
    {
      id: 'm4-q19',
      topic: 'Node Env Variables',
      question: 'How do you load environment variables (like PORT or database keys) from a `.env` file into process.env in Node?',
      options: [
        { text: 'npm install env-file', correct: false },
        { text: 'Importing and calling "dotenv.config()" at the start of your server', correct: true },
        { text: 'Writing them inside package.json files', correct: false },
        { text: 'Git loads them automatically', correct: false }
      ],
      explanation: 'The dotenv library reads .env and loads key-value pairs into process.env.'
    },
    {
      id: 'm4-q20',
      topic: 'REST Routing',
      question: 'Which route and HTTP method is most appropriate for deleting a comment with ID 42?',
      options: [
        { text: 'GET /api/comments/delete/42', correct: false },
        { text: 'DELETE /api/comments/42', correct: true },
        { text: 'POST /api/comments/42/delete', correct: false },
        { text: 'DELETE /api/comments?id=42', correct: false }
      ],
      explanation: 'REST resources should use plural nouns (`/comments`) followed by the ID, with the DELETE HTTP verb.'
    }
  ],

  m5: [
    {
      id: 'm5-q1',
      topic: 'CORS definition',
      question: 'What does CORS stand for?',
      options: [
        { text: 'Client Origin Routing Security', correct: false },
        { text: 'Cross-Origin Resource Sharing', correct: true },
        { text: 'Connection Over Relational Servers', correct: false },
        { text: 'Core Object Request Service', correct: false }
      ],
      explanation: 'CORS is a browser security mechanism that regulates resource requests from different domains.'
    },
    {
      id: 'm5-q2',
      topic: 'CORS Purpose',
      question: 'Why does the browser block fetch requests from React (port 5173) to Express (port 3000) by default?',
      options: [
        { text: 'Express is running slower than React', correct: false },
        { text: 'They are on different origins (ports), and browsers restrict cross-origin requests for security unless explicitly allowed by the server', correct: true },
        { text: 'React code cannot read JSON files', correct: false },
        { text: 'Node does not support React routing', correct: false }
      ],
      explanation: 'The browser Same-Origin Policy blocks scripts on one origin from fetching data from another origin without permission headers.'
    },
    {
      id: 'm5-q3',
      topic: 'Express CORS middleware',
      question: 'How do you enable CORS in an Express server to allow request from a React app running on http://localhost:5173?',
      options: [
        { text: 'app.use(cors({ origin: "http://localhost:5173" }))', correct: true },
        { text: 'app.enableCORS("http://localhost:5173")', correct: false },
        { text: 'res.setHeader("Allow-React", true)', correct: false },
        { text: 'app.use(express.static("cors"))', correct: false }
      ],
      explanation: 'The `cors` npm package creates a middleware that appends Access-Control-Allow-Origin headers to responses.'
    },
    {
      id: 'm5-q4',
      topic: 'Full-Stack Fetch',
      question: 'In a React frontend, what URL path should you fetch from if you are running your server locally on port 3000?',
      options: [
        { text: 'fetch("/api/todos")', correct: false },
        { text: 'fetch("http://localhost:3000/api/todos")', correct: true },
        { text: 'fetch("http://localhost:5173/api/todos")', correct: false },
        { text: 'fetch("postgres://localhost:3000")', correct: false }
      ],
      explanation: 'During local development, frontend and backend run on different ports, requiring absolute URLs.'
    },
    {
      id: 'm5-q5',
      topic: 'Fetch headers config',
      question: 'When sending a JSON payload in a POST request body, which request header is required so the server parses it correctly?',
      options: [
        { text: '"Authorization": "Bearer token"', correct: false },
        { text: '"Content-Type": "application/json"', correct: true },
        { text: '"Accept": "text/html"', correct: false },
        { text: '"Method": "POST"', correct: false }
      ],
      explanation: 'The "Content-Type" header tells the server body parser how to decode the incoming byte payload.'
    },
    {
      id: 'm5-q6',
      topic: 'Fetch POST Body',
      question: 'If you want to send a JavaScript object named "formData" inside the body of a fetch request, how must it be formatted?',
      options: [
        { text: 'body: formData', correct: false },
        { text: 'body: JSON.stringify(formData)', correct: true },
        { text: 'body: formData.toJSON()', correct: false },
        { text: 'body: JSON.parse(formData)', correct: false }
      ],
      explanation: 'HTTP bodies carry text strings. `JSON.stringify` converts the JavaScript object into a JSON string.'
    },
    {
      id: 'm5-q7',
      topic: 'React Fetch lifecycle',
      question: 'Where is the best place to make an API fetch request when a React component loads (mounts) on screen?',
      options: [
        { text: 'Directly in the body of the component function', correct: false },
        { text: 'Inside a useEffect hook with an empty dependency array []', correct: true },
        { text: 'Inside an event handler for screen scrolls', correct: false },
        { text: 'In the style definitions of the CSS modules', correct: false }
      ],
      explanation: 'Placing fetches directly in the function body triggers them on every single render loop. useEffect locks it to mount.'
    },
    {
      id: 'm5-q8',
      topic: 'Loading State UX',
      question: 'Why should full-stack React components manage a "loading" state (e.g., const [loading, setLoading] = useState(true))?',
      options: [
        { text: 'To run compile checks', correct: false },
        { text: 'To provide a good user experience (e.g., show a spinner) while waiting for the asynchronous network fetch to complete', correct: true },
        { text: 'To prevent CORS errors', correct: false },
        { text: 'To speed up SQL database operations', correct: false }
      ],
      explanation: 'Network requests take time. Showing loading prompts assures users that the application is functional.'
    },
    {
      id: 'm5-q9',
      topic: 'Fetch Error handling',
      question: 'If a fetch request returns an error status (like 500), does the global fetch() function automatically reject and throw an error?',
      options: [
        { text: 'Yes, it rejects on all non-200 status codes', correct: false },
        { text: 'No, fetch only rejects on network failures; you must check if response.ok is false and manually throw an error', correct: true },
        { text: 'Yes, but only if the server returns HTML', correct: false },
        { text: 'No, fetch never throws errors', correct: false }
      ],
      explanation: 'fetch resolves successfully even if the server returns 400 or 500 error codes. You must check `res.ok` or `res.status`.'
    },
    {
      id: 'm5-q10',
      topic: 'Global State Management',
      question: 'When should a full-stack developer adopt global state management (like Zustand or Redux) instead of simple useState hook?',
      options: [
        { text: 'For all variables, including simple toggle switches', correct: false },
        { text: 'When state needs to be accessed and shared across many deeply nested, unrelated components, avoiding prop-drilling', correct: true },
        { text: 'To query SQL databases directly', correct: false },
        { text: 'To speed up frontend static file compression', correct: false }
      ],
      explanation: 'Global state acts as a shared store, letting any component access variables without routing props through parent blocks.'
    },
    {
      id: 'm5-q11',
      topic: 'Zustand Store',
      question: 'What is a key benefit of using Zustand for state management over React Context?',
      options: [
        { text: 'It compiles to database SQL scripts', correct: false },
        { text: 'It is highly lightweight, has minimal boilerplate, and prevents unnecessary re-renders of components that do not select the modified state', correct: true },
        { text: 'It requires wrapping the entire app in context provider shells', correct: false },
        { text: 'It encrypts state files on disk', correct: false }
      ],
      explanation: 'Zustand selector patterns let components subscribe to specific state slices, bypassing global re-render sweeps.'
    },
    {
      id: 'm5-q12',
      topic: 'Zustand Setter',
      question: 'How do you update state variables inside a Zustand store definition?',
      options: [
        { text: 'By mutating the state variables directly', correct: false },
        { text: 'By calling the set() helper function inside actions to merge the state update object', correct: true },
        { text: 'By dispatching actions to a reducer function', correct: false },
        { text: 'By updating localStorage manually', correct: false }
      ],
      explanation: 'Zustand provides a `set` action helper that safely merges patches into the state store.'
    },
    {
      id: 'm5-q13',
      topic: 'Prop Drilling',
      question: 'What is "prop drilling"?',
      options: [
        { text: 'A command to sync state to databases', correct: false },
        { text: 'The practice of passing props down through multiple layers of components that do not need them, just to reach a deep child component', correct: true },
        { text: 'A CSS class centering utility', correct: false },
        { text: 'A security breach in React routers', correct: false }
      ],
      explanation: 'Prop drilling complicates component code. Global stores or React Context help bypass intermediate layers.'
    },
    {
      id: 'm5-q14',
      topic: 'State synchronization',
      question: 'If a user logs in, how should the frontend sync subsequent fetch calls so the Express server knows who they are?',
      options: [
        { text: 'By reading variables from local memory only', correct: false },
        { text: 'By attaching an Authorization header (JWT token) to every fetch request', correct: true },
        { text: 'By adding the user ID to every CSS class', correct: false },
        { text: 'By setting server ports dynamically', correct: false }
      ],
      explanation: 'Attaching the JWT (e.g. `Authorization: Bearer <token>`) lets the server verify the caller identity.'
    },
    {
      id: 'm5-q15',
      topic: 'Optimistic Updates',
      question: 'What is an "optimistic update" in full-stack UI development?',
      options: [
        { text: 'Waiting for the database write to complete before showing any changes on screen', correct: false },
        { text: 'Updating the UI immediately on user action before the server responds, reverting the change if the API request fails', correct: true },
        { text: 'Adding style attributes to forms', correct: false },
        { text: 'Ignoring server error responses', correct: false }
      ],
      explanation: 'Optimistic updates make apps feel instant. If the server throws an error, the state is rolled back.'
    },
    {
      id: 'm5-q16',
      topic: 'Frontend ENV prefix',
      question: 'In Vite-built React projects, what prefix must you append to environment variables so they are exposed to the browser?',
      options: [
        { text: 'REACT_APP_', correct: false },
        { text: 'VITE_', correct: true },
        { text: 'PROCESS_', correct: false },
        { text: 'ENV_', correct: false }
      ],
      explanation: 'Vite ignores variables lacking the `VITE_` prefix to prevent accidentally leaking server secrets.'
    },
    {
      id: 'm5-q17',
      topic: 'Full-Stack deployment',
      question: 'In a typical full-stack deployment, where are files served from?',
      options: [
        { text: 'Frontend files are served from a CDN; backend runs constantly on a server listening for API calls', correct: true },
        { text: 'All files are bundled inside the PostgreSQL database server', correct: false },
        { text: 'The React app runs on the Express server machine directly', correct: false },
        { text: 'Everything runs on the browser, including the database', correct: false }
      ],
      explanation: 'cdns serve static frontend bundles instantly, while Express processes API calls on dynamic server hosts.'
    },
    {
      id: 'm5-q18',
      topic: 'CORS preflight',
      question: 'What is a CORS "Preflight" request?',
      options: [
        { text: 'An check done by Git before push', correct: false },
        { text: 'An HTTP OPTIONS request sent by the browser before the actual request to verify that the server allows it', correct: true },
        { text: 'A compilation step in Vite', correct: false },
        { text: 'A database validation hook', correct: false }
      ],
      explanation: 'For complex requests (like POST with JSON bodies), the browser sends an OPTIONS preflight to verify CORS headers.'
    },
    {
      id: 'm5-q19',
      topic: 'Network Tab analysis',
      question: 'If your React app fails to fetch data, and the console shows a CORS error, what should you inspect in DevTools?',
      options: [
        { text: 'The size of your index.css stylesheet', correct: false },
        { text: 'The response headers of the failed request in the Network tab to check for Access-Control-Allow-Origin', correct: true },
        { text: 'The Console DOM outline', correct: false },
        { text: 'The VS Code configurations file', correct: false }
      ],
      explanation: 'CORS errors stem from missing server headers. Inspecting Network response headers helps debug configuration issues.'
    },
    {
      id: 'm5-q20',
      topic: 'Unified Build',
      question: 'Can you serve a static React build directly from an Express server?',
      options: [
        { text: 'No, React apps must run on separate Vercel servers', correct: false },
        { text: 'Yes, by building the React project and using "express.static" middleware to serve the dist folder as static assets', correct: true },
        { text: 'Yes, but only if you use a database connection', correct: false },
        { text: 'No, because Express does not support CSS styling', correct: false }
      ],
      explanation: 'Express can serve static assets (like built React files) using `app.use(express.static(\'dist\'))`.'
    }
  ],

  m6: [
    {
      id: 'm6-q1',
      topic: 'Security Mindset',
      question: 'What is the core principle of the "security mindset"?',
      options: [
        { text: 'Assuming the code works perfectly because it compiles', correct: false },
        { text: 'Thinking defensively about how features can be intentionally abused or manipulated by malicious actors', correct: true },
        { text: 'Making the frontend UI as clean as possible', correct: false },
        { text: 'Running tests on a schedule', correct: false }
      ],
      explanation: 'Vulnerabilities are gaps in assumptions. Developers must analyze how a client request could violate data logic.'
    },
    {
      id: 'm6-q2',
      topic: 'Trust boundary',
      question: 'Why must you never trust the client in web application design?',
      options: [
        { text: 'The client-side browser is slower than the server', correct: false },
        { text: 'Anything running in the user\'s browser can be bypassed, modified, or forged using curl/DevTools', correct: true },
        { text: 'Browsers do not support TLS encryption', correct: false },
        { text: 'Users do not understand how web routing operates', correct: false }
      ],
      explanation: 'Frontend validations are for UX, not security. Anyone can send forged payload requests directly to your API.'
    },
    {
      id: 'm6-q3',
      topic: 'Least Privilege',
      question: 'What does the Principle of Least Privilege dictate in databases?',
      options: [
        { text: 'Giving all users full administrator control to avoid errors', correct: false },
        { text: 'Ensuring each process, user, and route only has the minimum permission rights required to complete its job', correct: true },
        { text: 'Storing passwords in database views', correct: false },
        { text: 'Encrypting table primary keys', correct: false }
      ],
      explanation: 'Limiting permissions (e.g., read-only credentials for queries) minimizes the impact of potential leaks.'
    },
    {
      id: 'm6-q4',
      topic: 'SQL Injection',
      question: 'What causes a SQL Injection vulnerability?',
      options: [
        { text: 'The database server running out of disk space', correct: false },
        { text: 'Concatenating raw user inputs directly into a SQL query string instead of using parameterized inputs', correct: true },
        { text: 'Missing foreign key references', correct: false },
        { text: 'Running queries inside Express servers', correct: false }
      ],
      explanation: 'Directly concatenating strings lets malicious inputs change the logic structure of SQL commands.'
    },
    {
      id: 'm6-q5',
      topic: 'Parameterized Query',
      question: 'Which of the following represents a safe parameterized SQL query?',
      options: [
        { text: 'pool.query(`SELECT * FROM users WHERE id = ${id}`)', correct: false },
        { text: 'pool.query("SELECT * FROM users WHERE id = $1", [id])', correct: true },
        { text: 'pool.query("SELECT * FROM users WHERE id = " + id)', correct: false },
        { text: 'pool.query(`SELECT * FROM users WHERE id = \'" + id + "\'` )', correct: false }
      ],
      explanation: 'Using placeholder values ($1) separate query logic from parameters, neutralizing injection vectors.'
    },
    {
      id: 'm6-q6',
      topic: 'Cross-Site Scripting',
      question: 'What is Cross-Site Scripting (XSS)?',
      options: [
        { text: 'Injecting SQL statements to delete databases', correct: false },
        { text: 'Injecting malicious client-side scripts (HTML/JavaScript) into web pages viewed by other users', correct: true },
        { text: 'Accessing local folder paths in VS Code', correct: false },
        { text: 'Intercepting network traffic on local connections', correct: false }
      ],
      explanation: 'XSS occurs when unfiltered user inputs are displayed in a webpage, executing javascript on user browsers.'
    },
    {
      id: 'm6-q7',
      topic: 'React XSS safety',
      question: 'Why is React generally safe from XSS by default?',
      options: [
        { text: 'React blocks HTML forms completely', correct: false },
        { text: 'React automatically escapes strings rendered inside JSX braces, treating them as safe text content (not executable HTML)', correct: true },
        { text: 'React doesn\'t use JavaScript', correct: false },
        { text: 'React encrypts all text arrays', correct: false }
      ],
      explanation: 'React treats values inside JSX `{ }` as plain text, rendering script tags harmlessly.'
    },
    {
      id: 'm6-q8',
      topic: 'Dangerous HTML React',
      question: 'Which React attribute bypasses default XSS protection and must be audited with extreme caution?',
      options: [
        { text: 'dangerouslySetInnerHTML', correct: true },
        { text: 'innerHtmlContent', correct: false },
        { text: 'unsafeHTMLRender', correct: false },
        { text: 'renderHTML', correct: false }
      ],
      explanation: '`dangerouslySetInnerHTML` injects raw, unescaped HTML, exposing the application to XSS risk.'
    },
    {
      id: 'm6-q9',
      topic: 'Secrets Leak',
      question: 'How do developers leak credentials to public repositories?',
      options: [
        { text: 'By running git add on build folders', correct: false },
        { text: 'By hardcoding secret keys, tokens, or passwords directly inside code tracked in git repositories', correct: true },
        { text: 'By writing variables inside .env files', correct: false },
        { text: 'By using private SSH connections', correct: false }
      ],
      explanation: 'Hardcoding keys in scripts leads to leaks once pushed to hosts (like GitHub). Keys must live in ignored .env files.'
    },
    {
      id: 'm6-q10',
      topic: 'Secrets storage',
      question: 'Where should sensitive configuration keys be stored in production servers?',
      options: [
        { text: 'Inside package.json dependencies list', correct: false },
        { text: 'In server environment variables, loaded via process.env', correct: true },
        { text: 'In public database tables', correct: false },
        { text: 'In the style sheets of the website', correct: false }
      ],
      explanation: 'Environment variables keep secrets isolated from code files, allowing separate developer/production setups.'
    },
    {
      id: 'm6-q11',
      topic: 'Password Hashing math',
      question: 'What is password hashing salting?',
      options: [
        { text: 'Adding style rules to input fields', correct: false },
        { text: 'Adding random characters (salt) to a password before hashing it to ensure identical passwords yield different hashes', correct: true },
        { text: 'Encrypting database keys with database names', correct: false },
        { text: 'Deleting duplicate entries', correct: false }
      ],
      explanation: 'Salting prevents lookup tables or rainbow tables from cracking matches for commonly used passwords.'
    },
    {
      id: 'm6-q12',
      topic: 'Rate Limiting',
      question: 'What is the purpose of Rate Limiting in web APIs?',
      options: [
        { text: 'To encrypt SQL query strings', correct: false },
        { text: 'To restrict the number of requests an IP can make in a given timeframe, protecting endpoints from abuse/brute-force', correct: true },
        { text: 'To compile JS files faster', correct: false },
        { text: 'To cache responses for offline access', correct: false }
      ],
      explanation: 'Rate limiters safeguard servers against DDoS overload and brute-force password guessing attempts.'
    },
    {
      id: 'm6-q13',
      topic: 'CSRF Definition',
      question: 'What does CSRF stand for?',
      options: [
        { text: 'Cross-Site Request Forgery', correct: true },
        { text: 'Client Server Routing Framework', correct: false },
        { text: 'Connection State Recovery File', correct: false },
        { text: 'Core Security Request Filter', correct: false }
      ],
      explanation: 'CSRF is an attack where a malicious site tricks a user\'s browser into executing commands on another site.'
    },
    {
      id: 'm6-q14',
      topic: 'CSRF Defense',
      question: 'Which technique is a common, modern way to protect APIs from CSRF attacks?',
      options: [
        { text: 'Using CSS layout media queries', correct: false },
        { text: 'Using custom authentication headers (like Bearer tokens) or SameSite cookie policies', correct: true },
        { text: 'Compressing database backup files', correct: false },
        { text: 'Disabling fetch request bodies', correct: false }
      ],
      explanation: 'Custom headers (like JWT Bearer authorization) are not attached automatically by browsers, neutralizing CSRF attacks.'
    },
    {
      id: 'm6-q15',
      topic: 'Input Sanitization',
      question: 'What is input sanitization?',
      options: [
        { text: 'Deleting all whitespace inside strings', correct: false },
        { text: 'Cleaning or escaping user inputs to remove harmful characters or HTML script tags before storing or rendering them', correct: true },
        { text: 'Validating variables type', correct: false },
        { text: 'Formatting JSON payloads with spaces', correct: false }
      ],
      explanation: 'Sanitization cleans inputs (e.g., stripping HTML tags) to ensure they are safe to render.'
    },
    {
      id: 'm6-q16',
      topic: 'HTTPS transit security',
      question: 'Why is HTTPS mandatory for any site handling logins?',
      options: [
        { text: 'HTTP pages do not support cookies', correct: false },
        { text: 'Without HTTPS, network packets (including user credentials and session tokens) are sent in plain text, open to sniffing', correct: true },
        { text: 'Postgres requires HTTPS database connections', correct: false },
        { text: 'It speeds up server API response times', correct: false }
      ],
      explanation: 'HTTPS encrypts data in transit, preventing packet-sniffing or man-in-the-middle credential theft.'
    },
    {
      id: 'm6-q17',
      topic: 'XSS Sanitizer',
      question: 'What library is commonly used in Node.js to sanitize user-submitted HTML to prevent XSS?',
      options: [
        { text: 'express-validator', correct: false },
        { text: 'dompurify', correct: true },
        { text: 'bcrypt', correct: false },
        { text: 'dotenv', correct: false }
      ],
      explanation: 'DOMPurify sanitizes HTML strings, stripping out script elements and attributes while leaving styling safe.'
    },
    {
      id: 'm6-q18',
      topic: 'CORS as Security',
      question: 'Does CORS protect a backend database from direct hacker scripts (e.g., using curl or Python)?',
      options: [
        { text: 'Yes, CORS blocks python script requests', correct: false },
        { text: 'No, CORS is a browser-enforced policy; command-line tools can query APIs directly without browser restrictions', correct: true },
        { text: 'Yes, because CORS encrypts Express ports', correct: false },
        { text: 'No, because CORS only blocks database writes', correct: false }
      ],
      explanation: 'CORS only stops malicious cross-origin scripts inside the browser. Script utilities can query any API endpoint.'
    },
    {
      id: 'm6-q19',
      topic: 'Authentication Lifecycle',
      question: 'Why should JSON Web Tokens (JWT) have short expiration times (like 15 minutes)?',
      options: [
        { text: 'To save database memory space', correct: false },
        { text: 'To minimize the time window a hijacked token is valid and can be abused by an attacker', correct: true },
        { text: 'To prevent React from crashing', correct: false },
        { text: 'To speed up client page navigation', correct: false }
      ],
      explanation: 'Short-lived tokens decrease the risk of session hijacking, requiring users or refresh cycles to acquire fresh tokens.'
    },
    {
      id: 'm6-q20',
      topic: 'Brute Force Defense',
      question: 'How do hackers execute "credential stuffing" attacks?',
      options: [
        { text: 'By injecting SQL commands', correct: false },
        { text: 'By automatically testing millions of leaked username/password combinations using high-speed scripts', correct: true },
        { text: 'By stealing CSS styling tags', correct: false },
        { text: 'By editing VS Code configurations', correct: false }
      ],
      explanation: 'Credential stuffing relies on automated scripts. Rate limiters and MFA help defend against these attacks.'
    }
  ],

  m7: [
    {
      id: 'm7-q1',
      topic: 'AI Code Autocomplete',
      question: 'What is the primary role of inline AI code autocomplete (like GitHub Copilot)?',
      options: [
        { text: 'To verify backend security boundaries', correct: false },
        { text: 'To suggest single lines or blocks of code based on comments and surrounding file context as you write', correct: true },
        { text: 'To write complete functional specifications automatically', correct: false },
        { text: 'To deploy files to cdns', correct: false }
      ],
      explanation: 'Inline autocomplete is a fast typing assistant suggesting variables and syntax templates.'
    },
    {
      id: 'm7-q2',
      topic: 'Agentic Workspaces',
      question: 'How does an agentic coding assistant (like Antigravity) differ from simple code autocompletion?',
      options: [
        { text: 'It only supports vanilla Javascript syntax', correct: false },
        { text: 'It can inspect the workspace folder, read/write files, and propose terminal commands to solve multi-step tasks', correct: true },
        { text: 'It automatically commits code to main branches without review', correct: false },
        { text: 'It does not use large language models', correct: false }
      ],
      explanation: 'Agentic assistants have tool access (read, write, terminal) to plan and coordinate workspace changes.'
    },
    {
      id: 'm7-q3',
      topic: 'Context Window Limits',
      question: 'What is the "context window" of a code AI assistant?',
      options: [
        { text: 'The size of the VS Code editor panel', correct: false },
        { text: 'The maximum amount of code, chat history, and files the model can read and process in a single turn', correct: true },
        { text: 'The time limit set for terminal commands', correct: false },
        { text: 'The database connection pool limit', correct: false }
      ],
      explanation: 'AI assistants have capacity limits. Feeding them whole codebases overflows their context windows, causing loss of focus.'
    },
    {
      id: 'm7-q4',
      topic: 'Prompting constraints',
      question: 'Why should you define the "Tech Stack" in your system prompts?',
      options: [
        { text: 'To change compiler settings on the server', correct: false },
        { text: 'To prevent the AI from generating code using irrelevant libraries or outdated programming patterns', correct: true },
        { text: 'To speed up network data transfer speeds', correct: false },
        { text: 'To encrypt response outputs', correct: false }
      ],
      explanation: 'Specifying your framework (e.g., React, Express) forces the AI to output matching syntax.'
    },
    {
      id: 'm7-q5',
      topic: 'Auditing mindset',
      question: 'When using AI-generated code, what role should you assume?',
      options: [
        { text: 'The passive writer who copy-pastes code without review', correct: false },
        { text: 'The senior architect directing a fast intern — auditing every line for security, bugs, and edge cases', correct: true },
        { text: 'A database administrator only', correct: false },
        { text: 'A user feedback tester', correct: false }
      ],
      explanation: 'AI is fast but lacks critical judgment. You are liable for verifying correctness and security.'
    },
    {
      id: 'm7-q6',
      topic: 'AI Hallucinations',
      question: 'What is a "hallucination" in AI code generation?',
      options: [
        { text: 'The assistant throwing syntax check errors', correct: false },
        { text: 'The AI generating code that references non-existent packages, variables, or server API routes confidently', correct: true },
        { text: 'The server shutting down on compile errors', correct: false },
        { text: 'The browser failing to render styling styles', correct: false }
      ],
      explanation: 'LLMs generate probable text sequences, which can result in fictional APIs or variables.'
    },
    {
      id: 'm7-q7',
      topic: 'Iterative Prompting',
      question: 'What is the golden rule of the human-AI iterative coding workflow?',
      options: [
        { text: 'Prompting for an entire full-stack app in a single turn', correct: false },
        { text: 'Breaking tasks into small steps: prompt, review, compile/test, commit, and then repeat', correct: true },
        { text: 'Committing code only when the project is deployed', correct: false },
        { text: 'Letting the AI write the git commit messages', correct: false }
      ],
      explanation: 'Iterative workflows minimize errors. Small, focused updates are easier to review and debug.'
    },
    {
      id: 'm7-q8',
      topic: 'Refactoring Drift',
      question: 'How do you prevent "refactoring drift" where the AI edits code unrelated to your task?',
      options: [
        { text: 'By hiding files in gitignore paths', correct: false },
        { text: 'By providing explicit scopes and instructing the AI to only change target blocks, keeping adjacent code intact', correct: true },
        { text: 'By locking the workspace files', correct: false },
        { text: 'By renaming your folders', correct: false }
      ],
      explanation: 'AIs often drift or delete adjacent methods. Explicit boundaries keep outputs targeted.'
    },
    {
      id: 'm7-q9',
      topic: 'Git Checkpoints',
      question: 'Why should you make a Git commit before prompting an AI for a major change?',
      options: [
        { text: 'To update remote backup files on GitHub', correct: false },
        { text: 'To create a clean revert point in case the AI\'s changes break the codebase beyond easy recovery', correct: true },
        { text: 'To increase the speed of the compiler checks', correct: false },
        { text: 'To clear local browser session states', correct: false }
      ],
      explanation: 'Committing beforehand provides a safety net, letting you discard AI changes with a single git command.'
    },
    {
      id: 'm7-q10',
      topic: 'Git Diff reviews',
      question: 'Which tool is best for auditing AI edits line-by-line before committing them?',
      options: [
        { text: 'git log', correct: false },
        { text: 'git diff (or VS Code Git source control changes panel)', correct: true },
        { text: 'npm run build', correct: false },
        { text: 'git status', correct: false }
      ],
      explanation: 'git diff displays line additions and deletions, making changes visible.'
    },
    {
      id: 'm7-q11',
      topic: 'System Prompts',
      question: 'What is the purpose of system prompts/developer rules (like custom instructions or devRules.txt)?',
      options: [
        { text: 'To compile JS files into binary', correct: false },
        { text: 'To provide persistent instructions, style guides, tech preferences, and formatting constraints to the AI across all prompts', correct: true },
        { text: 'To check database schemas on startup', correct: false },
        { text: 'To host websites online', correct: false }
      ],
      explanation: 'System prompts customize the AI\'s defaults, ensuring consistency across coding loops.'
    },
    {
      id: 'm7-q12',
      topic: 'Security audits of AI',
      question: 'Which of the following security holes is an AI assistant most likely to write in an Express/PostgreSQL backend by default?',
      options: [
        { text: 'Encrypting database passwords too heavily', correct: false },
        { text: 'Vulnerable raw SQL query strings concatenated with variables, rather than parameterized inputs', correct: true },
        { text: 'Using custom headers for fetch calls', correct: false },
        { text: 'Rejecting invalid email formats', correct: false }
      ],
      explanation: 'AI defaults to simple patterns, which often include insecure string concatenations in DB queries.'
    },
    {
      id: 'm7-q13',
      topic: 'Edge Case analysis',
      question: 'If you ask an AI to write a division function, which input is an edge case you must audit manually?',
      options: [
        { text: 'Dividing by zero', correct: true },
        { text: 'Dividing by two', correct: false },
        { text: 'Dividing high numbers', correct: false },
        { text: 'Dividing decimal numbers', correct: false }
      ],
      explanation: 'AIs often neglect logical boundaries (like dividing by zero), causing runtime failures.'
    },
    {
      id: 'm7-q14',
      topic: 'Copy-paste risk',
      question: 'What is the risk of copy-pasting an AI response without reading it?',
      options: [
        { text: 'It makes your computer run slower', correct: false },
        { text: 'You introduce syntax errors, security holes, or break existing functions that you won\'t know how to debug', correct: true },
        { text: 'It is blocked by browser security guidelines', correct: false },
        { text: 'The CSS layout is removed', correct: false }
      ],
      explanation: 'Auditing code is critical. Shipping code you don\'t understand makes debugging impossible.'
    },
    {
      id: 'm7-q15',
      topic: 'Incremental verification',
      question: 'How do you verify a step in the iterative workflow?',
      options: [
        { text: 'By assuming it works because the code looks good', correct: false },
        { text: 'By running compilation tools, testing routes via fetch/Postman, and checking logs immediately', correct: true },
        { text: 'By asking another AI to check the code', correct: false },
        { text: 'By writing a README summary first', correct: false }
      ],
      explanation: 'Active verification with console execution, tools, and logs is the only way to confirm correctness.'
    },
    {
      id: 'm7-q16',
      topic: 'AI debugging loops',
      question: 'If an AI generated route causes a server crash, what is the best way to prompt the AI for a fix?',
      options: [
        { text: 'Re-paste the entire prompt from scratch', correct: false },
        { text: 'Paste the exact error trace output alongside the failing code block context', correct: true },
        { text: 'Ask the AI why it is bad at coding', correct: false },
        { text: 'Write a long paragraph describing what you think went wrong', correct: false }
      ],
      explanation: 'Providing exact error traces (stack traces) lets the AI pinpoint the exception line and resolve it.'
    },
    {
      id: 'm7-q17',
      topic: 'GitHub PR Audits',
      question: 'Why should team projects have code reviews (PRs) for AI-generated code?',
      options: [
        { text: 'To check if the developer typed the prompt correctly', correct: false },
        { text: 'To ensure a second human eye audits the logic, security, and styling to prevent buggy code leaks', correct: true },
        { text: 'To compile assets for production cdns', correct: false },
        { text: 'To clear git branch logs', correct: false }
      ],
      explanation: 'Code reviews are crucial when developers use AI, ensuring team members understand changes.'
    },
    {
      id: 'm7-q18',
      topic: 'AI licensing',
      question: 'What is a licensing consideration when using AI assistants trained on public code repositories?',
      options: [
        { text: 'AI code is always owned by the developer assistant company', correct: false },
        { text: 'AI can occasionally output copyrighted code snippets that might violate licenses if shipped without changes', correct: true },
        { text: 'AI code cannot be used commercially', correct: false },
        { text: 'AI code does not require license templates', correct: false }
      ],
      explanation: 'Licensing compliance requires checking that AI outputs do not copy proprietary blocks verbatim.'
    },
    {
      id: 'm7-q19',
      topic: 'Autopilot Trap',
      question: 'What is the "autopilot trap" in developer development?',
      options: [
        { text: 'Using automatic navigation in browsers', correct: false },
        { text: 'Letting the AI direct the app structure and changes while the developer blindly accepts all suggestions', correct: true },
        { text: 'Running tests on server triggers', correct: false },
        { text: 'Deploying servers automatically on commits', correct: false }
      ],
      explanation: 'The autopilot trap is when developers delegate design decisions to AI, yielding systems they cannot maintain.'
    },
    {
      id: 'm7-q20',
      topic: 'Understanding code liability',
      question: 'If an AI-generated script introduces a security leak in your production app, who is responsible?',
      options: [
        { text: 'The AI assistant provider company', correct: false },
        { text: 'You, the developer who approved, committed, and shipped the code', correct: true },
        { text: 'The database server hosting provider', correct: false },
        { text: 'The users who filled the forms', correct: false }
      ],
      explanation: 'Code ownership is absolute. Once you accept a commit, it is YOUR code, along with all security implications.'
    }
  ],

  m8: [
    {
      id: 'm8-q1',
      topic: 'Project Scoping',
      question: 'What is the primary goal of the "planning phase" of your Capstone Project?',
      options: [
        { text: 'To write all backend server routes in a text editor', correct: false },
        { text: 'To define a clear scope, list user stories, design the database schema, and write API route specifications before coding', correct: true },
        { text: 'To deploy the application to Vercel/Render', correct: false },
        { text: 'To ask the AI assistant to write the front-end styling', correct: false }
      ],
      explanation: 'Planning maps out structural dependencies, aligning database design and routes before implementation.'
    },
    {
      id: 'm8-q2',
      topic: 'User Story focus',
      question: 'Why should you frame project features as User Stories?',
      options: [
        { text: 'To write SQL queries faster', correct: false },
        { text: 'To keep features grounded in real user value and prevent scope creep during development', correct: true },
        { text: 'To style forms in responsive grids', correct: false },
        { text: 'To automate Git commit messages', correct: false }
      ],
      explanation: 'User stories focus on utility, ensuring developers implement features users actually need.'
    },
    {
      id: 'm8-q3',
      topic: 'Minimum Viable Product',
      question: 'What is a Minimum Viable Product (MVP)?',
      options: [
        { text: 'A project with complete features and complex styling themes', correct: false },
        { text: 'The simplest version of your product that has enough core features to satisfy early users and gather feedback', correct: true },
        { text: 'A database server running on local ports', correct: false },
        { text: 'An application built without any Git repositories', correct: false }
      ],
      explanation: 'An MVP focuses on core features, letting developers test the product before building advanced overlays.'
    },
    {
      id: 'm8-q4',
      topic: 'Data model design',
      question: 'When designing a database schema, why do you outline tables and relationships on paper first?',
      options: [
        { text: 'To compile SQL commands into binary code', correct: false },
        { text: 'To prevent index errors, redundant columns, and messy migrations that are difficult to correct later', correct: true },
        { text: 'To configure local environment variables', correct: false },
        { text: 'To bypass security audits', correct: false }
      ],
      explanation: 'Database schemas are hard to change once populated. Upfront planning ensures data integrity.'
    },
    {
      id: 'm8-q5',
      topic: 'API contract',
      question: 'What does a "REST API Specification" serve as during development?',
      options: [
        { text: 'A compiler tool that runs checks', correct: false },
        { text: 'A contract defining URLs, request payloads, and response formats that ensures frontend and backend coordinate smoothly', correct: true },
        { text: 'A styling template library', correct: false },
        { text: 'A database table listing foreign keys', correct: false }
      ],
      explanation: 'An API specification outlines endpoints, enabling parallel frontend/backend development.'
    },
    {
      id: 'm8-q6',
      topic: 'Folder structure scoping',
      question: 'In a full-stack Capstone Project repository, why do developers split source code into separate "frontend" and "backend" directories?',
      options: [
        { text: 'To comply with database hosting rules', correct: false },
        { text: 'To keep dependencies isolated and maintain a modular codebase that can be deployed to different cloud hosts', correct: true },
        { text: 'To prevent git status from showing changed files', correct: false },
        { text: 'To allow CSS styling rules to apply to Express', correct: false }
      ],
      explanation: 'Separating directories keeps configurations isolated, letting CDNs host the UI and servers run the API.'
    },
    {
      id: 'm8-q7',
      topic: 'Pairing execution',
      question: 'During the building phase, what is the best strategy for utilizing your AI assistant?',
      options: [
        { text: 'Pasting the planning doc and asking the AI to code the entire app in one go', correct: false },
        { text: 'Prompting the AI to generate modular blocks (like one schema table or one route handler), verifying each, and committing', correct: true },
        { text: 'Letting the AI push directly to production servers', correct: false },
        { text: 'Letting the AI write the entire database migration', correct: false }
      ],
      explanation: 'Incremental building using focused prompts reduces debugging overhead and keeps you in control.'
    },
    {
      id: 'm8-q8',
      topic: 'Database migration',
      question: 'What is a "database migration script"?',
      options: [
        { text: 'A script that copy files between hosts', correct: false },
        { text: 'A SQL file containing table schema definition commands (like CREATE TABLE) to set up or update database structures', correct: true },
        { text: 'A tool to backup user files', correct: false },
        { text: 'An API controller route handler', correct: false }
      ],
      explanation: 'Migrations version your database. They contain SQL statements that build or alter tables.'
    },
    {
      id: 'm8-q9',
      topic: 'Production CORS setup',
      question: 'When deploying your Express API server to production, what CORS configuration must you write?',
      options: [
        { text: 'Allow all origins using cors(*)', correct: false },
        { text: 'Configure CORS to explicitly only allow requests from your production frontend Vercel/Netlify URL origin', correct: true },
        { text: 'Disable CORS completely on the server', correct: false },
        { text: 'Point CORS to the Postgres connection string', correct: false }
      ],
      explanation: 'Production API security requires locking down CORS to only trust your public website origin.'
    },
    {
      id: 'm8-q10',
      topic: 'Cloud Database',
      question: 'When deploying a database to neon.tech or supabase, what connection credential must be loaded in environment variables?',
      options: [
        { text: 'DATABASE_URL connection string', correct: true },
        { text: 'Localhost port number', correct: false },
        { text: 'SQL schema file name', correct: false },
        { text: 'GitHub repository path', correct: false }
      ],
      explanation: 'The connection string is a URL containing the database hostname, port, database name, credentials, and SSL settings.'
    },
    {
      id: 'm8-q11',
      topic: 'README role',
      question: 'Why is a clean, structured README.md important for your Capstone portfolio?',
      options: [
        { text: 'It compiles your frontend React code', correct: false },
        { text: 'It acts the documentation page that demonstrates your project purpose, stack, features, installation, and database structure', correct: true },
        { text: 'It hides credentials files from users', correct: false },
        { text: 'It speed up deployment build cycles', correct: false }
      ],
      explanation: 'A README is your portfolio page, detailing project architecture and installation steps.'
    },
    {
      id: 'm8-q12',
      topic: 'Collaboration reporting',
      question: 'In modern developer interviews, why is presenting your "Human-AI Collaboration Process" highly valued?',
      options: [
        { text: 'It proves you did not write any code yourself', correct: false },
        { text: 'It shows you are a capable director who can plan, inspect, audit, and debug code, rather than a passive prompt coder', correct: true },
        { text: 'It demonstrates that your app compiles without warnings', correct: false },
        { text: 'It satisfies database licensing restrictions', correct: false }
      ],
      explanation: 'Interviewers seek developers who understand their codebase and can direct AI safely.'
    },
    {
      id: 'm8-q13',
      topic: 'Deployment verification',
      question: 'If your deployed React application fails to load records and displays a console network error, what is the most likely cause?',
      options: [
        { text: 'The CSS layout is too complex', correct: false },
        { text: 'Your frontend VITE_API_URL variable is misconfigured or pointing to localhost instead of your production backend server URL', correct: true },
        { text: 'The README file is missing from git', correct: false },
        { text: 'The user has not registered their email', correct: false }
      ],
      explanation: 'Forgetting to update client connection URLs to production backend domains is a common deployment error.'
    },
    {
      id: 'm8-q14',
      topic: 'Security audit checklist',
      question: 'Which of the following belongs in your backend pre-launch security audit checklist?',
      options: [
        { text: 'Verifying that all hover animations render smoothly', correct: false },
        { text: 'Scanning the repository to ensure no secrets or .env files are tracked, and confirming all SQL queries are parameterized', correct: true },
        { text: 'Checking if your index.html has semantic tags', correct: false },
        { text: 'Checking if the project uses a README.md', correct: false }
      ],
      explanation: 'Launch checks require auditing query parameterizations, password encryption, and secret configurations.'
    },
    {
      id: 'm8-q15',
      topic: 'Render deployment',
      question: 'When deploying a backend Express app on Render, what command should be configured as the "Start Command"?',
      options: [
        { text: 'npm run dev', correct: false },
        { text: 'node server.js (or npm start)', correct: true },
        { text: 'npm run build', correct: false },
        { text: 'nodemon server.js', correct: false }
      ],
      explanation: 'Nodemon is for local hot-reloads. Production servers require running the stable node process directly.'
    },
    {
      id: 'm8-q16',
      topic: 'Database seeds',
      question: 'What is the purpose of database "seed data"?',
      options: [
        { text: 'To update the table column types', correct: false },
        { text: 'To populate the database with initial demo records (like sample products or users) for development and testing', correct: true },
        { text: 'To secure password logins', correct: false },
        { text: 'To delete temporary cookie configurations', correct: false }
      ],
      explanation: 'Seed data populates databases, providing dummy information for testing features.'
    },
    {
      id: 'm8-q17',
      topic: 'Static frontend routes',
      question: 'If you use React Router, why do Vercel/Netlify deployments return a 404 error when you refresh the page on a sub-route (like /profile)?',
      options: [
        { text: 'The React app has crashed', correct: false },
        { text: 'The static host tries to find a physical file named "profile", you need a redirect rule pointing all sub-routes to index.html', correct: true },
        { text: 'CORS has blocked the client request', correct: false },
        { text: 'The Express server port is closed', correct: false }
      ],
      explanation: 'SPA routing requires configuring redirects so host routing points back to index.html, letting React resolve sub-routes.'
    },
    {
      id: 'm8-q18',
      topic: 'Client-side verification',
      question: 'Why should backend routing test tools (like Postman or REST Client) be used to audit your API endpoints directly?',
      options: [
        { text: 'They compile Express servers faster', correct: false },
        { text: 'They let you test boundary payloads and authentication headers directly without being constrained by React UI controls', correct: true },
        { text: 'They check the database schema on disk', correct: false },
        { text: 'They host the server API on remote ports', correct: false }
      ],
      explanation: 'Postman lets you test raw requests (e.g. malformed inputs), validating backend defenses.'
    },
    {
      id: 'm8-q19',
      topic: 'HTTPS credentials',
      question: 'Do cloud database providers (like Neon or Supabase) require HTTPS/SSL connections by default?',
      options: [
        { text: 'No, databases do not use SSL', correct: false },
        { text: 'Yes, they require secure SSL database connections to prevent credential interception', correct: true },
        { text: 'Yes, but only if you use static frontend hosts', correct: false },
        { text: 'No, because databases are hosted locally', correct: false }
      ],
      explanation: 'Cloud database links transfer sensitive data, making SSL transit encryption mandatory.'
    },
    {
      id: 'm8-q20',
      topic: 'Capstone presentation',
      question: 'What is the most effective way to present your Capstone project to a hiring manager?',
      options: [
        { text: 'Showing them the git commit history log', correct: false },
        { text: 'Giving a demo of the live app, explaining the database structure, and describing how you audited and secured the AI-generated code', correct: true },
        { text: 'Re-running the npm run build command in front of them', correct: false },
        { text: 'Reading your index.css stylesheet line-by-line', correct: false }
      ],
      explanation: 'Hiring managers value live demos, database design understanding, and developer-critical code auditing.'
    }
  ]
};
