# CIPHER Deploy Hunt — Submission
**Name:** Prince Andani  
**Repo:** https://github.com/PrinceAndani/Dev-SMP-task3  
**Live URL:** https://dev-smp-task3-git-main-prince-devscape.vercel.app  
**Program:** IET CIPHER · SMP 2026 · Session 03

---

## Stage 1
```
Broken:  "compile": "next build"
Fixed:   "build": "next build"
Why:     Vercel runs "npm run build" by default; the script was named "compile" so the build command was never found.
```

---

## Stage 2
```
Broken:  import LaunchBanner from "@/app/components/ui/LaunchBanner"
Fixed:   import LaunchBanner from "@/app/components/widgets/LaunchBanner"
Why:     The component file lives in /widgets/ not /ui/, causing a module-not-found error at build time.
```

---

## Stage 3
```
Broken:  "date-fns" not listed in package.json dependencies
Fixed:   "date-fns": "^3.6.0" added to dependencies
Why:     LaunchBanner.js imports { format } from "date-fns" but the package was never declared as an explicit dependency.
```

---

## Stage 4
```
Broken:  NEXT_PUBLIC_LAUNCH_CODE environment variable not set on Vercel
Fixed:   Added NEXT_PUBLIC_LAUNCH_CODE = CIPHER-2026 in Vercel → Settings → Environment Variables → Production
Why:     LaunchBanner.js throws an error inside useEffect if the variable is undefined, crashing the page at runtime.
```

---

## Stage 5
```
Broken:  "outputDirectory": "dist"  (in vercel.json)
Fixed:   Removed the outputDirectory line from vercel.json
Why:     Next.js outputs its build to .next/ not dist/, so Vercel could not find the build output to serve the app.
```

---

# vercel.json — Detailed Overview

## What is vercel.json?

`vercel.json` is a configuration file placed at the root of your project that tells Vercel **how to build, route, and serve your application**. It is optional — Vercel auto-detects most frameworks — but it becomes necessary when you need custom behavior beyond the defaults.

When Vercel starts a deployment, it reads `vercel.json` before doing anything else. Every instruction in this file overrides Vercel's automatic detection.

---

## File location

Always at the root of your repository, alongside `package.json`:

```
my-project/
├── vercel.json       ← here
├── package.json
├── app/
└── public/
```

---

## Configuration Categories

### 1. Build Configuration

Controls how Vercel builds your project.

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

| Key | What it does |
|---|---|
| `buildCommand` | Command Vercel runs to build the project |
| `installCommand` | Command to install dependencies |
| `outputDirectory` | Folder Vercel looks in for the built output |
| `devCommand` | Command used for local Vercel dev server |
| `framework` | Tells Vercel which framework you're using |

**Real use case — our task's Bug 5:**
```json
{
  "outputDirectory": "dist"    ← WRONG: Next.js never outputs to dist/
  "outputDirectory": ".next"   ← CORRECT
}
```

---

### 2. Rewrites

Rewrites let you map an incoming URL path to a different destination **without changing the URL in the browser**.

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}
```

**Use cases:**

**Proxy API requests to a backend:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://my-backend.railway.app/:path*"
    }
  ]
}
```
Frontend at `vercel.app/api/users` silently proxies to your backend — no CORS issues.

**Single Page App fallback:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Every route serves `index.html` so React Router / Vue Router works on hard refresh.

---

### 3. Redirects

Redirects send the browser to a **new URL**, changing the address bar. Supports 301 (permanent) and 302 (temporary).

```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

**Use cases:**

**Redirect old blog URLs:**
```json
{
  "redirects": [
    {
      "source": "/blog/:slug",
      "destination": "/posts/:slug",
      "permanent": true
    }
  ]
}
```

**Force HTTPS / remove www:**
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.example.com" }],
      "destination": "https://example.com/:path*",
      "permanent": true
    }
  ]
}
```

---

### 4. Headers

Attach custom HTTP response headers to specific routes.

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

**Use cases:**

**Security headers for all routes:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

**Cache static assets aggressively:**
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Allow CORS for an API route:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

---

### 5. Regions

Controls which Vercel edge regions your serverless functions deploy to.

```json
{
  "regions": ["bom1", "sin1"]
}
```

**Use cases:**

**Deploy close to your users (India + Southeast Asia):**
```json
{
  "regions": ["bom1", "sin1", "hnd1"]
}
```

**Global deployment:**
```json
{
  "regions": ["all"]
}
```

| Code | Location |
|---|---|
| `iad1` | Washington D.C., USA (default) |
| `bom1` | Mumbai, India |
| `sin1` | Singapore |
| `hnd1` | Tokyo, Japan |
| `lhr1` | London, UK |

---

### 6. Environment Variables (in file)

You can define non-secret env vars directly in `vercel.json`. **Never put secrets here** — use the Vercel dashboard for those.

```json
{
  "env": {
    "APP_MODE": "production",
    "REGION": "india"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_VERSION": "1.0.0"
    }
  }
}
```

`env` → available at runtime. `build.env` → available only during build.

---

### 7. Function Configuration

Configure serverless function behavior per route.

```json
{
  "functions": {
    "app/api/heavy-task/route.js": {
      "memory": 1024,
      "maxDuration": 30
    },
    "app/api/quick/route.js": {
      "memory": 128,
      "maxDuration": 5
    }
  }
}
```

**Use cases:** AI inference routes need more memory and time; lightweight routes stay cheap.

---

### 8. cleanUrls and trailingSlash

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

`cleanUrls: true` → `/about.html` becomes `/about`  
`trailingSlash: false` → `/about/` redirects to `/about`

---

## Priority Order

When Vercel processes a request, it checks in this order:

```
1. Redirects   → checked first, browser gets sent elsewhere
2. Rewrites    → URL mapped silently to another destination  
3. Filesystem  → actual files in your output directory
4. Headers     → applied to whatever is served
```

---

## Common Mistakes

| Mistake | Effect |
|---|---|
| `"outputDirectory": "dist"` on a Next.js app | Vercel can't find the build output |
| `"buildCommand": "npm run compile"` when script is named `build` | Build never runs |
| Putting secrets in `vercel.json` | Credentials exposed in your public repo |
| Setting wrong `"framework"` | Vercel applies wrong preset |

---

## Minimal valid vercel.json for a Next.js app

```json
{
  "framework": "nextjs"
}
```

Vercel handles the rest automatically. Only add other keys when you need to override defaults.

---

