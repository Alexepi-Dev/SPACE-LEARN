# SPACE LEARN

SPACE LEARN is a bilingual astronomy learning platform built with React, Vite, TypeScript and Tailwind CSS. Its Express API runs as a separate Render service; the frontend is deployed to Netlify.

## Current capabilities

- Four French/English lessons, quizzes and progress saved locally in the browser.
- A NASA Astronomy Picture of the Day page backed by NASA's current `apod-basic` WordPress endpoint, with paginated history, source links and media-type labels.
- A bilingual, responsive 3D solar-system explorer at `/simulator`, with JPL Horizons orbital elements, a Kepler two-body propagation model, planet and major-moon views, comparison, a guided tour, and pedagogical/linear scale modes.
- A bilingual cookie policy at `/cookies`, with first-visit accept/reject/customize controls and a persistent footer link for changing consent. Consent is stored locally for six months; language preferences are stored only when preference consent is granted.
- No analytics or marketing trackers are currently configured. Enabling the statistics consent option does not load Google Analytics.
- No NASA API key is exposed to the browser. The APOD Basic endpoint is public; `NASA_API_KEY` is reserved for later server-side integrations such as NeoWs and DONKI.
- A separate bilingual `/admin` console with a responsive navigation, environment-bootstrapped super-admin, 15-minute signed sessions, rate-limited login, PostgreSQL audit logging, live service checks, rolling API request/error/latency metrics, configurable refresh, current outage alerts, and CSV export of the latest audit entries. The content catalog is read-only. Learner accounts, learner activity/analytics, additional admin roles, and content editing are explicitly unavailable.

## Local setup

Requirements: Node.js 22 or newer and npm.

1. Install the frontend dependencies from the repository root:

   ```powershell
   npm install
   Copy-Item .env.example .env.local
   ```

   For local development, leave `VITE_API_BASE_URL` blank to use Vite's `/api` proxy to `http://127.0.0.1:3001`. Set it only when using a different API origin. Production builds must set it to the deployed API origin.

2. Install and configure the API:

   ```powershell
   npm --prefix server install
   Copy-Item server/.env.example server/.env
   ```

   Set `CLIENT_ORIGIN` to the exact local frontend origin. `NASA_API_KEY` is not needed for APOD Basic.

3. Start the API and frontend in separate terminals:

   ```powershell
   npm --prefix server run dev
   ```

   ```powershell
   npm run dev
   ```

4. Open the Vite URL printed in the frontend terminal. The API health check is available at `http://localhost:3001/api/health`.

## Environment variables

Frontend `.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Public Express API origin. Optional locally (Vite proxies `/api` to port 3001); required for production builds. |

Render backend environment:

| Variable | Purpose |
| --- | --- |
| `NASA_API_KEY` | Secret for NASA endpoints that require a key; never prefix it with `VITE_` |
| `DEEPL_AUTH_KEY` | Optional DeepL API secret for translating NASA APOD text into French; server-only, never use a `VITE_` prefix |
| `DEEPL_API_URL` | Official DeepL translate endpoint; defaults to `https://api-free.deepl.com/v2/translate` (use `https://api.deepl.com/v2/translate` for a Pro key) |
| `CLIENT_ORIGIN` | Comma-separated exact browser origins allowed by CORS |
| `NODE_ENV` | Set to `production` on Render |
| `PORT` | Supplied by Render; local development defaults to `3001` |
| `DATABASE_URL` | Render PostgreSQL connection string; server-only |
| `ADMIN_EMAIL` | Email identity for the initial environment-bootstrapped super-admin |
| `ADMIN_PASSWORD_HASH` | Scrypt password hash generated with `npm run admin:hash`; never expose to the frontend |
| `ADMIN_SESSION_SECRET` | Random secret of at least 32 bytes used to sign short-lived admin sessions |

Never commit `.env` files. `.env.example` files contain placeholders only.

## Available API routes

- `GET /api/health`
- `GET /api/space/apod?page=1&per_page=8&language=fr`
- `GET /api/space/solar-system?include_moons=false` (set `true` to request the featured moons)
- `POST /api/admin/session` (rate-limited; environment bootstrap credentials)
- `GET /api/admin/overview` (super-admin bearer token required)
- `GET /api/admin/services` (super-admin bearer token required)
- `GET /api/admin/audit-log` (super-admin bearer token required)

The APOD endpoint validates pagination and language, times out after 10 seconds, normalizes NASA fields, strips HTML from explanatory text, caches successful pages for 30 minutes and returns pagination metadata from the WordPress response headers. When requested in French and `DEEPL_AUTH_KEY` is configured, the server translates titles, explanations and alternative text through DeepL, caches successful translations for 24 hours, and keeps the original NASA text and source link available. Without that key, it clearly reports that translation is not configured and returns the original English text. The solar-system endpoint requests osculating elements from NASA/JPL Horizons in AU, degrees and days, relative to the Sun or the relevant planet. It limits upstream concurrency, times out each request, caches successful target elements for 15 minutes, and reports unavailable targets instead of substituting invented positions. No NASA API key is required or exposed.

## Solar-system simulator data and limitations

- The initial view requests JPL Horizons elements for the Sun's eight planets; the featured natural satellites are fetched only when the moon view is opened. The backend converts UTC to TDB and rounds down to a five-minute boundary because Horizons ELEMENTS accepts TDB only. The conversion uses TT−UTC of 69.184 seconds at the current 37 leap seconds plus a periodic TDB−TT correction; update the offset if a leap second is introduced. Each result identifies its TDB epoch and the J2000 ecliptic reference plane.
- Motion is propagated locally from those epoch elements with a two-body Kepler model. This is an educational approximation, not a long-term numerical ephemeris; perturbations and spacecraft trajectories are not modeled.
- Planet physical parameters link to [NASA/JPL Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html); descriptive facts link to the corresponding NASA factsheets. Orbital elements link to [NASA/JPL Horizons](https://ssd.jpl.nasa.gov/horizons/).
- Local planet maps are from [Solar System Scope](https://www.solarsystemscope.com/textures/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The source notes that unmapped areas may be filled with fictional terrain and that colors may be adjusted; the simulator displays this limitation and identifies bodies without a global map.
- The pedagogical view compresses distances and enlarges bodies and moon orbits for visibility. The linear view applies one AU-to-scene scale to orbital distances and diameters; at the system view, select a body to zoom in because planets are tiny relative to their orbits.

## Quality checks

```powershell
npm run build
npm run build:server
npm run test:server
npm run lint
```

The frontend progress store remains local to the browser. The admin database stores only authentication audit events; it does not collect learner progress or analytics. The Prisma packages in the existing root dependency manifest are still unused and have different major versions; the API uses `pg` directly for the admin audit table.

The admin console can refresh manually or every 30 seconds, 60 seconds, or 5 minutes. API request metrics count completed API responses in one-minute buckets over a rolling 60-minute window in process memory, with chart bars aggregated into five-minute intervals. They reset when the API restarts. Its activity page contains administrator sign-ins and API requests only; CSV export includes the latest audit entries returned by the API. NASA service statuses come from actual checks for configured integrations; other services are marked not configured, not operational.

## Initial administrator setup

The admin console stays unavailable until its server environment, PostgreSQL database, and audit migration are ready. Never put administrator credentials or hashes in a `VITE_` variable.

1. Provision a Render PostgreSQL database and set the API service's `DATABASE_URL` to its private/internal connection string.
2. Set `ADMIN_EMAIL` and `ADMIN_SESSION_SECRET` in the Render API environment. Generate a session secret with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

3. Generate the password hash locally from a hidden PowerShell prompt. This prints only the hash; enter that value directly in Render's environment settings and do not commit it:

   ```powershell
   $secure = Read-Host "Initial administrator password (12+ characters)" -AsSecureString
   $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
   try {
     $env:ADMIN_BOOTSTRAP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
     npm --prefix server run admin:hash
   } finally {
     Remove-Item Env:ADMIN_BOOTSTRAP_PASSWORD -ErrorAction SilentlyContinue
     [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
   }
   ```

4. Set the resulting hash as `ADMIN_PASSWORD_HASH` on the Render API. Set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` only in the server environment.
5. Run the initial database migration from the API service directory (locally with `DATABASE_URL` set, or from the Render shell):

   ```powershell
   npm run db:migrate
   ```

6. Open `/admin` on the deployed frontend. The login is limited to five attempts per 15 minutes. A successful session is held in memory and expires after 15 minutes. Protected reads are denied if they cannot be written to the audit table.

The audit log records successful and failed login attempts and authenticated admin API reads. It does not record client IP addresses. PostgreSQL availability is therefore required for admin login and audited requests.

## Netlify deployment

- Connect the GitHub repository to Netlify; `netlify.toml` configures the Vite build and SPA fallback.
- Set `VITE_API_BASE_URL` to the deployed Render API origin in Netlify's build environment.
- Deploy the frontend after the Render URL is available.

## Render deployment

- Create a Node Web Service from the same GitHub repository with root directory `server`.
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Set `CLIENT_ORIGIN` to the exact Netlify site origin, `NODE_ENV=production`, and `NASA_API_KEY` in Render's environment dashboard.
- Add the Render PostgreSQL `DATABASE_URL` and administrator environment values described above; run the audit migration before enabling admin sign-in.
- Render supplies `PORT`; the service binds to `0.0.0.0`.

The remaining NASA integrations are intentionally not mocked. NASA media search, NeoWs, DONKI, exoplanets, GIBS and PDS will be added in their planned phases.
