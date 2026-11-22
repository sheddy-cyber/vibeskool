# Taking VibeSkool live

This guide takes VibeSkool from "works on my computer" to a real website that
students and tutors can use. Follow the parts **in order**; later parts use
things you set up in earlier ones. Each step says exactly where to click, what
to copy, and where to paste it. It ends with a check you can do to be sure the
step worked.

**How the pieces fit together**

```
 Student's browser ── also runs the tests on students' exercise code
        │
        ▼
 Vercel  ── the React app (frontend/)       https://<your-app>.vercel.app
        │   calls the API and opens live-update connections
        ▼
 Render  ── the Django API (backend-django/) https://<your-api>.onrender.com
        │   plus a small Redis next to it, for live class updates and rate limits
        ├──► Supabase Postgres ── accounts, lessons, classes, progress
        ├──► Supabase Storage  ── profile photos and project screenshots
        ├──► Gmail             ── password reset and tutor emails
        ├──► Google Gemini     ── the AI tutor
        └──► Sentry            ── tells you when something breaks
 GitHub Actions ── a nightly encrypted backup of the database
```

**What it costs: nothing.** This guide uses only free plans and Vercel's free
`.vercel.app` address. No domain to buy.

| Service | Plan | Free limits that matter |
| --- | --- | --- |
| Vercel | Hobby | Plenty for this site |
| Render web service (the API) | Free | Sleeps after 15 minutes without visits; 750 hours a month (enough for one service running all month) |
| Render Key Value (Redis) | Free | 25 MB, plenty for live updates |
| Supabase (database + storage) | Free | 500 MB database, 1 GB files; pauses after 7 quiet days |
| Gmail (email) | Your Google account | About 500 emails a day |
| Exercise checks | In the student's browser | No limit |
| Google Gemini | Free tier | Google's free daily limits |
| Sentry, Better Stack, GitHub Actions | Free tiers | Plenty |

**What the free Render plan means for you**

- **It sleeps.** After 15 minutes with no visits, Render stops the API. The
  next visit wakes it, which takes **30–60 seconds**: the first person sees the
  site waiting, then everything is normal. Part 9.1 sets up a free monitor
  that visits every few minutes, which keeps it awake almost all the time.
- **No pre-deploy step:** database updates run each time the server starts
  instead. That's already set up in `render.yaml`; nothing for you to do.
- **No Shell:** the few commands you'd type on the server, like creating your
  admin account, you'll run from your own computer instead. It talks to the
  same Supabase database, so it works the same.
- **Small machine** (512 MB of memory, a share of one processor). It's fine
  for a class or two at a time. Upgrade to Starter (about $7/month) when it
  gets busy; see "Later" at the end.

**Time needed:** about 1–2 hours the first time, most of it the first deploy
and collecting keys.

---

## Part 0. Before you start

### 0.1 Accounts you'll need

Create these now if you don't have them. Sign up with the same email
everywhere so it's easy to keep track.

- [ ] **GitHub**: you already have this (`sheddy-cyber/vibeskool`).
- [ ] **Vercel**: already hosting the frontend.
- [ ] **Supabase**: already holds the database.
- [ ] **Render**: https://render.com. Sign up with GitHub, so Render can see your repository.
- [ ] **A Gmail account for the site**: for sending email. Best as a new one
      just for VibeSkool (e.g. `vibeskool.app@gmail.com`), so students never
      see your personal address. See Part 3.
- [ ] **Google AI Studio**: https://aistudio.google.com. For the Gemini key, using your Google account.
- [ ] **Google Cloud Console**: https://console.cloud.google.com. You already have a Google sign-in client.
- [ ] **Sentry**: https://sentry.io. Error reports (optional but strongly recommended).
- [ ] **Better Stack**: https://betterstack.com. Uptime alerts (optional).

### 0.2 Keep a private notes file

You're about to collect around 15 keys and addresses. Put them in a password
manager, or a private note that is **not** inside the project folder. Never
commit them to GitHub, paste them into chat, or put them in a screenshot.

Use this list as your template:

```
Vercel app address ............ https://
Render API address ............ https://           (you get this in Part 6)
DATABASE_URL (Supabase) ....... postgresql://...
Storage endpoint .............. https://
Storage region ................
Storage access key id ..........
Storage secret key .............
Storage public URL ............ https://
Brevo API key .................
From address (Brevo sender) ...
Gemini API key ................
Google client ID ..............
Sentry DSN (Django) ...........
Sentry DSN (React) ............
Backup passphrase .............
Admin email + password ........
```

### 0.3 Make sure GitHub has the latest code

Everything below deploys from the `main` branch on GitHub. In a terminal in
the project folder:

```powershell
git status
```

It should say `nothing to commit, working tree clean`. If it lists changes,
commit and push them first.

### 0.4 About secrets (already handled)

- **Production** gets brand-new secrets: Render generates `DJANGO_SECRET_KEY`
  and `JWT_SECRET` for you (Part 6). Don't copy the ones from your `.env`.
- **Your local** `JWT_SECRET` in `backend-django/.env` has been replaced with
  a 64-character random value. The server needs at least 32 when it isn't in
  debug mode. Anyone signed in on your local copy has to sign in again. If
  `npm run dev` is running, stop it and start it again to load the new value.
- If you ever need to make a secret yourself, run this. It prints 64 random characters:

  ```powershell
  backend-django\.venv\Scripts\python -c "import secrets; print(secrets.token_urlsafe(48))"
  ```

### 0.5 Find your exact Vercel address

The API only accepts the website address you give it, character for
character, so get the exact one now.

1. Open https://vercel.com/dashboard → your VibeSkool project →
   **Settings → Domains**.
2. You'll see the free production address, e.g. `vibeskool.vercel.app`, or
   something like `vibeskool-sheddy.vercel.app` if the short name was taken.
   **That's the one to use.**
3. Ignore the long addresses on individual deployments, e.g.
   `vibeskool-8f3k2l1-sheddy-cybers-projects.vercel.app`. Those change with
   every deploy.
4. Write it in your notes with `https://` in front and **no slash at the
   end**: `https://vibeskool.vercel.app`.

Want a nicer free name? In **Settings → Domains** you can **Edit** the
`.vercel.app` address to any free one that's available. Do it **now**, before
the next steps, because this address goes into Render and Google.

---

## Part 1. The database (Supabase)

The database already exists and already has every table, including the latest
changes (tutor requests, skill check attempts). You only need to copy its
connection address.

### 1.1 Copy the connection address

1. Open https://supabase.com/dashboard and click your VibeSkool project.
2. Click **Connect** (top of the page).
3. Under **Connection string**, choose **Session pooler**. Don't choose
   "Direct connection" or "Transaction pooler".
4. Copy the address. It looks like:
   `postgresql://postgres.abcdefghijkl:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your database password, removing the
   brackets too. Forgot it? Go to **Project Settings → Database → Reset
   database password**. Then update the same address in
   `backend-django/.env` as well, or your local copy stops working.
6. **If the password contains** `@ : / ? # [ ] % &` or spaces, those characters
   must be written in a special form in the address. Easiest fix: reset the
   password to one made of only letters and numbers (Supabase's
   **Generate a password** button does this).
7. Save the finished address in your notes as **DATABASE_URL**.

**Check:** the address starts with `postgresql://`, contains
`pooler.supabase.com:5432`, and has no square brackets left in it.

### 1.2 Know the connection limit

Supabase's session pooler allows **15 connections at once** in total. The
live API uses up to 5, your local `npm run dev` up to 5, and the nightly
backup 1. That's fine as is; just don't raise `DB_POOL_SIZE` above 5 unless
you stop using the live database from your own computer.

### 1.3 Free plan pausing

Supabase pauses free projects after **7 days without any activity**. Once the
site is live, normal visits and the nightly backup count as activity. If it
ever pauses, open the project in Supabase and click **Restore**.

---

## Part 2. File storage for uploads (Supabase Storage)

Render wipes its disk every time you deploy, so profile photos and project
screenshots must live somewhere permanent. You'll use Supabase Storage in
the same project.

### 2.1 Create the bucket

1. In your Supabase project, click **Storage** in the left menu.
2. Click **New bucket**.
3. Name: `media`, written exactly like that, in lower case.
4. Switch **Public bucket** ON. The images are meant to be seen by everyone
   on the site, and the links stay the same forever.
5. Leave the file size limit empty, or set it to 10 MB (the app already limits
   uploads to 8 MB).
6. Click **Create bucket**.

### 2.2 Get the S3 keys

The API talks to the bucket the same way it would talk to Amazon S3.

1. Go to **Project Settings** (gear icon) → **Storage**. On newer dashboards
   it's **Storage → Settings**.
2. Find **S3 Connection**. If there's a switch called *Enable connection via
   S3 protocol*, turn it on.
3. Copy into your notes:
   - **Endpoint**, e.g. `https://abcdefghijkl.storage.supabase.co/storage/v1/s3`.
     Save it as STORAGE_ENDPOINT.
   - **Region**, e.g. `eu-west-1`. Save it as STORAGE_REGION.
4. Under **S3 Access Keys**, click **New access key**. Give it a name like
   `render-api` and create it.
5. Copy the **Access key ID** (STORAGE_ACCESS_KEY) and the **Secret access
   key** (STORAGE_SECRET_KEY). **The secret is shown only once.** If you lose
   it, delete the key and make a new one.

### 2.3 Work out the public address

This is where the images can be viewed. It follows a fixed pattern:

```
https://<project-ref>.supabase.co/storage/v1/object/public/media
```

`<project-ref>` is the random-looking part of your endpoint, the bit before
`.storage.supabase.co`. For the endpoint example above, the public URL is:

```
https://abcdefghijkl.supabase.co/storage/v1/object/public/media
```

Save it as **STORAGE_PUBLIC_URL**. No slash at the end.

**Check:** you now have five storage values: bucket `media`, endpoint, region,
access key ID, secret key. Plus the public URL.

### 2.4 Move uploads you already have (do this after Part 6)

If you uploaded photos while developing, they're on your computer in
`backend-django/media/`. Come back to this step once Render is live:

1. Add the five storage values and the public URL to your local
   `backend-django/.env` (same names as above; see `.env.example`).
2. In a terminal in `backend-django`, first see what would be copied:

   ```powershell
   .venv\Scripts\python manage.py move_media_to_storage --dry-run
   ```

3. Then copy them for real. It also fixes the saved profile photo links:

   ```powershell
   .venv\Scripts\python manage.py move_media_to_storage
   ```

**Check:** in Supabase → Storage → `media`, you can see `avatars/` and
`projects/` folders.

---

## Part 3. Email (password resets and tutor requests)

The site sends email for "Forgot password?", for new tutor requests (to you)
and for approvals and declines (to the tutor).

**Why Brevo and not Gmail directly:** Render's free plan blocks the ports
that ordinary email sending uses (25, 465 and 587). Gmail's usual way of
sending would simply time out there. Brevo sends over a normal web request,
which is allowed. Its free plan gives you 300 emails a day and doesn't need a
domain. The site already supports it; you only need a key.

### 3.1 The address emails come from

Emails need a "From" address that you can receive mail at. Use the Gmail
account you made for the site in 0.1, e.g. `vibeskool.app@gmail.com`. Students
will see it, so it shouldn't be your personal address.

### 3.2 Set up Brevo

1. Go to https://www.brevo.com and click **Sign up free**. Sign up with the
   site's Gmail address. Fill in the short company profile; "VibeSkool" and
   "Education" are fine.
2. **Add the sender:** click your name (top right) → **Senders, Domains &
   Dedicated IPs** → **Senders** tab → **Add sender**.
   - From name: `VibeSkool`
   - From email: the site's Gmail address
   - Click **Add sender**. Brevo emails that address a code or link. Open
     the Gmail inbox and confirm it.
3. **Make the API key:** click your name → **SMTP & API** → **API Keys** tab
   → **Generate a new API key**. Name it `vibeskool-render` and click
   **Generate**. Copy the key (it starts with `xkeysib-`). **It's shown once.**
   Save it in your notes as **BREVO_API_KEY**.
4. **Allow sending from Render:** Brevo can block API calls from internet
   addresses it hasn't seen before, and Render's address isn't fixed. Click
   your name → **Security** → **Authorised IPs**. If blocking is switched on,
   click **Deactivate blocking**. Your key is still secret; this only stops
   Brevo checking where calls come from.
5. New Brevo accounts are sometimes reviewed before they can send. If Brevo
   shows a banner asking you to complete or activate your account, follow it.
   It's usually done within a day.

### 3.3 Your email values

| Render variable | Value |
| --- | --- |
| `BREVO_API_KEY` | the key from step 3, `xkeysib-...` |
| `DEFAULT_FROM_EMAIL` | `VibeSkool <vibeskool.app@gmail.com>`: the **same** address you verified as a sender |

**Good to know:**
- Because the From address is a Gmail address and the email is sent by
  Brevo, the first few may land in **Spam** or show "via brevosend.com".
  Tell your first students to check spam and mark it "Not spam". Once you
  own a domain, you can switch to an address there and this goes away (see
  "Later").
- **Who hears about tutor requests:** by default every admin (staff) account,
  i.e. you after Part 6.4. To send them to a different inbox, add
  `TUTOR_REQUEST_EMAILS` on Render with that address (several addresses:
  separate them with commas).

---

## Part 4. Checking students' code (nothing to set up)

When a student clicks **Run the checks** on a coding exercise, their own
browser runs the tests: JavaScript in a sealed-off sandbox, Python through
Pyodide (Python built for browsers). The browser sends the server what each
test printed, and the server decides pass or fail by comparing that with the
tests' expected output itself. Student code never runs on your server.

**What to know:**
- **It's free**, with no account, key or daily limit.
- **The first Python check** downloads Python into the browser, about 11 MB,
  which takes 5–15 seconds on a normal connection. The button says
  "Loading Python…" meanwhile. After that it's cached and instant.
- **Code that never stops** (an endless loop) is stopped after 4 seconds
  for JavaScript, 8 for Python, with a message saying so.
- **The trade-off:** a determined student who knows how could send made-up
  output and get the exercise's 20 XP without solving it. Skill checks
  aren't affected; those are always marked on the server. For homework
  that really matters, use a class assignment, which a tutor reviews.

**If you later want checks that can't be faked**, the code still supports
running them on a sandbox server: subscribe to Judge0 CE on RapidAPI (pay per
use, about $0.0017 a check) and add `JUDGE0_KEY` on Render. With a key set,
the server runs every check itself and ignores what browsers send. See
"Later" at the end.

---

## Part 5. Keys for Google and error reports

### 5.1 Gemini (the AI tutor)

1. Open https://aistudio.google.com/apikey.
2. Click **Create API key**. Choose or create a Google Cloud project when asked.
3. Copy the key (starts with `AIza`). Save it as **GEMINI_API_KEY**.

Without it, the site still works; the "Ask the tutor" panel says the tutor
is offline.

### 5.2 Google sign-in client ID

You already use this locally. Find it in `backend-django/.env`
(`GOOGLE_CLIENT_ID`) or in Google Cloud Console → **APIs & Services →
Credentials** under **OAuth 2.0 Client IDs** (it ends in
`.apps.googleusercontent.com`). The same ID goes on both Render and Vercel.
You'll add the live website address to it in Part 7.

### 5.3 Sentry (error reports)

1. Sign in at https://sentry.io. Create an organisation if asked.
2. **Projects → Create Project** → platform **Django** → name `vibeskool-api`
   → **Create**. On the setup page, copy the **DSN** (a long address starting
   with `https://` and containing `ingest`). Save it as **SENTRY_DSN (Django)**.
3. Create a second project → platform **React** → name `vibeskool-web` →
   copy its DSN. Save it as **SENTRY_DSN (React)**.
4. Skip the install instructions Sentry shows; the code already has
   everything. You only need the two DSNs.

---

## Part 6. The API on Render

### 6.1 Create everything from the blueprint

The file `render.yaml` in the project describes the API service and its Redis,
so Render sets them up in one go.

1. Sign in at https://dashboard.render.com.
2. Click **New +** → **Blueprint**.
3. Connect GitHub if asked, then pick the **vibeskool** repository and the
   **main** branch.
4. Name the blueprint `vibeskool`. Render reads `render.yaml` and lists:
   - **vibeskool-api**: a web service (Python, **Free** plan, Frankfurt, the
     closest region to your database in Ireland), and
   - **vibeskool-redis**: a Key Value store (**Free**).

   Both say Free. If Render asks for a card, that's to stop abuse; the free
   plan isn't charged.
5. Render asks for the values marked "sync: false". Fill them in from your
   notes:

| Variable | What to enter | If you leave it empty |
| --- | --- | --- |
| `DATABASE_URL` | the Supabase session pooler address from Part 1 | **Required.** The deploy fails. |
| `FRONTEND_URL` | your Vercel address from 0.5, e.g. `https://vibeskool.vercel.app`. **No slash at the end** | **Required.** The site can't talk to the API. |
| `GOOGLE_CLIENT_ID` | from Part 5.2 | Google sign-in shows an error |
| `GEMINI_API_KEY` | from Part 5.1 | AI tutor offline |
| `STORAGE_BUCKET` | `media` | Uploads go to Render's disk and vanish at the next deploy |
| `STORAGE_ENDPOINT` | from Part 2.2 | (as above) |
| `STORAGE_REGION` | from Part 2.2 | (as above) |
| `STORAGE_ACCESS_KEY` | from Part 2.2 | (as above) |
| `STORAGE_SECRET_KEY` | from Part 2.2 | (as above) |
| `STORAGE_PUBLIC_URL` | from Part 2.3 | (as above) |
| `BREVO_API_KEY` | from Part 3, `xkeysib-...` | Emails are only written to the logs, never sent |
| `DEFAULT_FROM_EMAIL` | `VibeSkool <your site Gmail>`, the sender you verified in Brevo | Brevo refuses to send |
| `SENTRY_DSN` | the **Django** DSN from Part 5.3 | No error reports |
| `ADMIN_PATH` | a hard-to-guess word, e.g. `staff-7f3k9`. The admin page will be at `/staff-7f3k9/` | Admin stays at `/admin/` |

   The rest are filled in for you: `DJANGO_SECRET_KEY` and `JWT_SECRET` get
   long random values, `REDIS_URL` points at the new Redis,
   `DJANGO_DEBUG=0` and `PYTHON_VERSION`.
6. Click **Apply**. Render creates the Redis first, then builds the API. The
   first build takes 5–10 minutes. Click **vibeskool-api → Events/Logs** to
   watch.

**What happens on every deploy**, so the logs make sense:

1. **Build:** `pip install -r requirements.txt`, then `collectstatic` (styles for the admin page).
2. **Start:** first `python manage.py migrate` updates the database tables if
   the code needs it. Right now it's already up to date, so the log says
   "No migrations to apply". Then `daphne ... config.asgi:application` runs the API.
   (Paid plans do the migrate as a separate step; the free plan does it at start.)
3. **Health check:** Render opens `/api/health`. The new version only goes
   live once that answers OK, so a broken deploy never replaces a working one.

The free plan has a monthly allowance of build minutes; each deploy uses a
few. Pushing a handful of times a day is fine.

### 6.2 Add any extra values

If you want tutor emails to go to one inbox (Part 3):

1. **vibeskool-api → Environment → Add Environment Variable**.
2. Add `TUTOR_REQUEST_EMAILS` with the address.
3. Click **Save, rebuild, and deploy**.

### 6.3 Copy your API address

At the top of the **vibeskool-api** page is its address, e.g.
`https://vibeskool-api.onrender.com`, or with some letters added if that
name was taken. Save it in your notes as **Render API address**.

**Check:** open `https://<your-api>.onrender.com/api/health` in your browser.
If the API was asleep, the page spins for up to a minute first. It must show:

```json
{"status": "ok"}
```

If it shows `{"status": "error", "database": "unreachable"}`, the
`DATABASE_URL` is wrong (see Troubleshooting).

### 6.4 Create your admin account

The live database has no admin account yet. The free plan has no Shell on
Render, so you'll create it **from your own computer**. Your local
`backend-django/.env` already points at the same Supabase database, so the
account lands in the live database.

1. Open a terminal in the project folder and go into the backend:

   ```powershell
   cd backend-django
   ```

2. Check that `.env` really points at Supabase. This prints only the server
   name, never the password:

   ```powershell
   .venv\Scripts\python -c "from dotenv import dotenv_values; print(dotenv_values('.env').get('DATABASE_URL', 'NOT SET').split('@')[-1])"
   ```

   It should print something ending in `pooler.supabase.com:5432/postgres`. If
   it says `NOT SET`, add `DATABASE_URL=` with your Supabase address (Part 1)
   to `.env` first.
3. Create the account:

   ```powershell
   .venv\Scripts\python manage.py createsuperuser
   ```

4. Answer the questions: your email, a display name, then a strong password
   (twice; nothing shows as you type, which is normal). Save them in your notes.
5. Open `https://<your-api>.onrender.com/<ADMIN_PATH>/` in your browser, or
   `/admin/` if you didn't set `ADMIN_PATH`, and sign in. The first visit may
   take up to a minute if the API was asleep.

**Check:** you see the "VibeSkool admin" page with Users, classes and content.

> A fresh, empty database would also need lesson content. Not your case: your
> Supabase already has the lessons and all 180 skill check questions. For a
> new database you'd run `.venv\Scripts\python manage.py seed_content` the same
> way, from your computer.

**Any other one-off command** you'd normally type on the server, run it from
`backend-django` on your computer like this.

---

## Part 7. Point the website at the API (Vercel)

### 7.1 Check the project setup

1. Open https://vercel.com/dashboard → your VibeSkool project →
   **Settings → Build and Deployment** (or **General**).
2. Confirm:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or the default)
   - **Output Directory**: `dist` (or the default)

### 7.2 Set the environment variables

1. **Settings → Environment Variables**.
2. Add each one below, with **Environment: Production** ticked (tick
   Preview too if you like):

| Name | Value |
| --- | --- |
| `VITE_API_URL` | your Render API address, e.g. `https://vibeskool-api.onrender.com`. **No slash at the end** |
| `VITE_GOOGLE_CLIENT_ID` | the same Google client ID as on Render |
| `VITE_SENTRY_DSN` | the **React** DSN from Part 5.3 (optional) |

3. These are built into the app, so they only take effect after a new build.
   Go to **Deployments**, open the ⋯ menu on the newest deployment →
   **Redeploy**, untick "Use existing build cache", and confirm.

### 7.3 Allow your live address in Google sign-in

1. Google Cloud Console → **APIs & Services → Credentials** → click your
   OAuth 2.0 client.
2. Under **Authorized JavaScript origins**, click **Add URI** and enter your
   Vercel address, e.g. `https://vibeskool.vercel.app` (no slash at the end).
   Keep `http://localhost:5173` there too for local development.
3. Click **Save**. It can take up to 5 minutes to apply.

### 7.4 Preview deployments

Vercel also builds a preview with its own address for every branch. The API
only accepts calls from `FRONTEND_URL`, so previews can show pages but can't
sign in. That's expected. To allow a fixed preview address too, add
`CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` on Render, each with both
addresses separated by a comma.

**Check:** open your Vercel address. The landing page loads, and **Log in**
works with an existing account.

---

## Part 8. Backups (GitHub Actions)

Every night at 02:17 UTC, a GitHub Action copies the database, locks it with
a passphrase only you know, and keeps it for 30 days.

### 8.1 Make a passphrase

Run this and save the result in your password manager **before** you do
anything else. Without it, a backup can never be opened.

```powershell
backend-django\.venv\Scripts\python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 8.2 Add the two secrets to GitHub

1. Open https://github.com/sheddy-cyber/vibeskool → **Settings** → **Secrets
   and variables** → **Actions**.
2. **New repository secret**: Name `BACKUP_DATABASE_URL`, value = your
   DATABASE_URL from Part 1. Click **Add secret**.
3. **New repository secret**: Name `BACKUP_PASSPHRASE`, value = the
   passphrase from 8.1. Click **Add secret**.

### 8.3 Run it once by hand

1. Go to the **Actions** tab → **Database backup** (left list) → **Run
   workflow** → **Run workflow**.
2. Wait about a minute and click the run. It should end with a green tick and,
   at the bottom, an artifact named `vibeskool-db-YYYY-MM-DD`.

**Check:** the artifact is there, and the "Dump and encrypt" step printed a
dump size.

### 8.4 How to restore a backup (keep for emergencies)

You need PostgreSQL's tools (`pg_restore`) and `gpg`. Git for Windows
includes gpg; for PostgreSQL install it from postgresql.org, or use the
`postgres:17` Docker image.

1. Download the artifact from the workflow run and unzip it.
2. Unlock it (it asks for the passphrase):

   ```bash
   gpg --decrypt vibeskool-YYYY-MM-DD.pgc.gpg > dump.pgc
   ```

3. Load it into a database. **Safest:** a new, empty Supabase project first,
   so you can look before touching the live data:

   ```bash
   pg_restore --clean --if-exists --no-owner --dbname "<DATABASE_URL of the target>" dump.pgc
   ```

   `--clean` replaces the tables in the target. Point it at the live
   database only if you really mean to roll the live site back.

---

## Part 9. Monitoring

### 9.1 Keep the API awake and get alerts (Better Stack, free)

**Don't skip this one on the free plan.** Render puts the API to sleep after
15 minutes without visits, and waking it takes 30–60 seconds. A monitor that
visits it every 3 minutes keeps it awake, and tells you if it goes down.

1. Sign in at https://betterstack.com → **Uptime** → **Monitors** →
   **Create monitor**.
2. Fill in:
   - **Alert us when:** URL becomes unavailable
   - **URL to monitor:** `https://<your-api>.onrender.com/api/health`
   - **Check frequency:** 3 minutes (the shortest on the free plan). Must be
     under 15 so Render never sees 15 quiet minutes.
   - **Request timeout:** 60 seconds, so a wake-up isn't mistaken for an outage
   - **On-call escalation:** your email (and the phone app if you like)
3. Click **Create monitor**.
4. Add a second monitor for your Vercel address, e.g.
   `https://vibeskool.vercel.app`, with the same settings.

**Why this is fine with Render's limits:** the free plan includes 750 hours
a month and a month has at most 744, so one service kept awake all month
fits. Keep only **one** free Render web service, since the hours are shared.

The health address also checks the database, so you're alerted if Supabase
pauses or stops answering, and the regular visits stop it pausing.

If you'd rather not create another account, https://cron-job.org (free) can
do the same: a job that opens the health address every 5 minutes.

### 9.2 Errors (Sentry)

Nothing to do. Sentry emails you the first time each new error happens, with
what the person was doing. No personal data is sent: no IP addresses, no
form contents.

### 9.3 Logs and metrics (Render)

**vibeskool-api → Logs** shows every request and error as it happens;
**Metrics** shows memory, CPU and response times.

---

## Part 10. Final check before telling anyone

Do these on the **live** site, ideally on your phone and on a computer.

- [ ] **Health:** `https://<your-api>.onrender.com/api/health` shows `{"status": "ok"}`.
- [ ] **Sign up** as a new student with an email you can read. You land on the dashboard.
- [ ] **Google sign-in:** log out, then use **Sign in with Google**.
- [ ] **Password reset:** log out → **Forgot password?** → enter your email.
      The email arrives (check spam), the link opens "Choose a new password",
      and saving signs you in.
- [ ] **Lessons:** open a lesson, mark it done, and see your progress on the dashboard.
- [ ] **Skill check:** take one. Each answer is marked straight away and the
      result is saved. A pass shows on the path page.
- [ ] **Exercises:** open a lesson that has a coding exercise (tutors add them
      under **Teaching → Exercises**) and click **Run the checks**. A wrong answer
      shows what was expected and what your code printed; a right one passes. Try
      a Python one too: the first check says "Loading Python…" for a few seconds.
- [ ] **AI tutor:** in a lesson, open **Ask the tutor** and ask something. A reply comes back.
- [ ] **Uploads:** add a profile photo. Right-click it → open image in new
      tab. The address starts with your STORAGE_PUBLIC_URL.
- [ ] **Become a tutor:** with a second account, sign up and choose **I want
      to teach**. You get the "Tutor request" email. In the admin: **Users** →
      filter **Tutor status: Waiting for approval** → tick the person →
      **Action: Approve as tutors (emails them)** → **Go**. They get the approval email,
      and after refreshing they see **Teaching** in the menu.
- [ ] **Live class:** as the tutor, create a class and copy its code. As the
      student, join it. Open the class on both. A post from one appears on
      the other without refreshing, so Redis and live updates work.
- [ ] **Showcase:** share a project with a screenshot; it shows on the Showcase page.
- [ ] **Backup:** the Actions tab shows last night's backup with a green tick
      (on day 2).

If every box is ticked, you're live.

---

## Everyday running

**Approving tutors:** you get an email for each request. Admin → **Users** →
filter by **Tutor status: Waiting for approval** → read their note → select
→ **Approve as tutors (emails them)** or **Decline tutor requests (emails them)** → **Go**. Both send the
person an email.

**Deploying changes:** push to `main`. Render rebuilds the API and Vercel
rebuilds the site automatically. Database changes are applied when the new
version starts; if that fails, the health check fails, the old version keeps
running, and Render shows the error in **Events**.

**Changing a setting or key:** Render → vibeskool-api → **Environment** → edit
→ **Save, rebuild, and deploy**. On Vercel: change the variable, then
**Redeploy**.

**Signing everyone out** (e.g. if you think a secret leaked): on Render, give
`JWT_SECRET` a new 64-character value (see 0.4) and save. Every session ends;
people just sign in again.

**Using the live database from your computer** (as `npm run dev` does now):
it's fine for reading, but anything you do locally changes real data.
For experiments, remove `DATABASE_URL` from your local `.env` and the
backend uses a local SQLite copy instead.

---

## Troubleshooting

| What you see | Likely cause | Fix |
| --- | --- | --- |
| Render deploy fails with `DJANGO_SECRET_KEY must be set to at least 32 random characters` (or `JWT_SECRET ...`) | The value was changed by hand to something short | Environment → set it to a 64-character value from 0.4 |
| Deploy fails while starting, with a database error in the log, or health shows `"database": "unreachable"` | `DATABASE_URL` wrong: brackets left in, wrong password, special characters, or the direct connection used instead of the session pooler | Redo Part 1.1 and update it on Render |
| `max clients reached` in the logs | More than 15 connections to Supabase at once | Stop `npm run dev` on your computer if it uses the live database, or lower `DB_POOL_SIZE` |
| The site loads but every action fails; the browser console (F12) mentions **CORS** | `FRONTEND_URL` on Render doesn't exactly match the address in the browser bar (http vs https, `www`, a slash at the end) | Fix `FRONTEND_URL`; for more than one address use `CORS_ALLOWED_ORIGINS` |
| The site calls `localhost` or `/api` on Vercel and gets 404s | `VITE_API_URL` not set, or no redeploy after setting it | Part 7.2, including the Redeploy |
| `Bad Request (400)` on the API address | Using a custom API domain that isn't in the allowed hosts | Add it to `DJANGO_ALLOWED_HOSTS` on Render (the onrender.com address is allowed automatically) |
| Class posts only appear after refreshing | Live connection blocked | Check `FRONTEND_URL` (it also controls live connections) and that `REDIS_URL` is set on Render |
| Google button says it can't sign in, or the popup closes with an error | The live address isn't in Google's **Authorized JavaScript origins**, or the client IDs differ | Part 7.3; use the same ID on Render and Vercel |
| Password reset says it sent, or a tutor request or approval happened, but no email arrives | It went to spam; `BREVO_API_KEY` missing; the From address isn't a verified Brevo sender; or Brevo blocked Render's address | Check spam first. Then in the admin: **Users** → tick any user → **Action: Send a test email to me (checks email works)** → **Go**. It says exactly what's wrong. Render **Logs** also show `EMAIL IS NOT SET UP` at start-up when the key is missing, and `Brevo answered` when Brevo refuses. `401` with "unrecognised IP": Part 3.2 step 4. Sender errors: `DEFAULT_FROM_EMAIL` must match the verified sender exactly |
| `Network is unreachable` or timeouts mentioning `smtp` in the logs | `EMAIL_HOST` is set: SMTP is blocked on Render's free plan | Remove `EMAIL_HOST` on Render and use `BREVO_API_KEY` (Part 3) |
| The site sits on a spinner for up to a minute, then works | The API was asleep (free plan) | Set up the monitor in Part 9.1; check it's running every 3 minutes |
| Python checks say "Python couldn't load in this browser" | The student's connection blocked or interrupted the 11 MB download (school networks sometimes block cdn.jsdelivr.net) | Try again on another network; JavaScript exercises aren't affected |
| Every check fails with "Couldn't run your code right now" | `JUDGE0_KEY` is set on Render, so the server tries Judge0, but the RapidAPI subscription isn't active | Remove `JUDGE0_KEY` on Render to go back to browser checks, or fix the subscription |
| Photos disappear after a deploy | Storage variables missing, so files went to Render's temporary disk | Part 2, then set the `STORAGE_*` variables |
| Photos upload but show as broken images | `STORAGE_PUBLIC_URL` wrong, or the bucket isn't public | Check the bucket is Public; the URL must end in `/object/public/media` |
| "Ask the tutor" says the tutor is offline | `GEMINI_API_KEY` missing or invalid | Part 5.1 |
| Everything was fine, then the database stopped answering | Supabase paused the free project after a quiet week | Supabase dashboard → Restore project |

---

## Later, when you're ready

- **Checks that can't be faked:** subscribe to Judge0 CE on RapidAPI
  (https://rapidapi.com/judge0-official/api/judge0-ce, **Basic**: pay per use,
  about $0.0017 a check; set a spending alert), copy your `X-RapidAPI-Key`, and
  add it on Render as `JUDGE0_KEY`. The defaults are language 93 (JavaScript,
  Node.js 18) and 92 (Python 3.11); if Judge0's **Get Languages** lists other
  numbers for those, add `JUDGE0_JS_ID` / `JUDGE0_PYTHON_ID`. To go back to free
  browser checks, delete the key.
- **Moving to Render Starter (about $7/month):** no sleeping, faster, and
  SMTP allowed. In `render.yaml` change `plan: free` to `plan: starter`, and
  move `python manage.py migrate --noinput` out of `startCommand` into a new
  line, `preDeployCommand: python manage.py migrate --noinput`. Push. You can
  then also use **Shell** on Render for one-off commands.
- **Email from your own domain:** once you own a domain, in Brevo → **Senders,
  Domains & Dedicated IPs** → **Domains** → **Add a domain**, add the DNS
  records it shows at your domain provider, then verify a sender like
  `hello@yourdomain.com` and put it in `DEFAULT_FROM_EMAIL`. Emails stop
  landing in spam and lose the "via brevosend.com".
- **Your own domain:** point `www.yourdomain.com` (or the bare domain) at Vercel
  (**Vercel → Settings → Domains**) and `api.yourdomain.com` at Render
  (**vibeskool-api → Settings → Custom Domains**). Then update:
  - `FRONTEND_URL` on Render, to the new site address;
  - `VITE_API_URL` on Vercel, then redeploy;
  - Google's Authorized JavaScript origins.

  Once everything runs on your domain over https, add
  `SECURE_HSTS_INCLUDE_SUBDOMAINS=1` on Render.
- **More students:** raise the Render plan, or add instances under
  **Settings → Scaling**. Redis already shares live updates and rate limits
  between them. Keep the total database connections under 15 (instances × 5).
- **Supabase Pro** ($25/month): daily backups by Supabase itself, no pausing,
  more space.
