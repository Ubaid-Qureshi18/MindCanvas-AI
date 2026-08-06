# MindCanvas — Deployment Guide

## Architecture

```
apps/
  web/    → Next.js 16 (Vercel)
  api/    → NestJS (Railway / Render / Fly.io)
supabase/ → Database schema & migrations
```

---

## 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/` directory in the SQL Editor
3. Copy your:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## 2. API Backend (Railway or Render)

### Required Environment Variables

```
NODE_ENV=production
PORT=4000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=change-this-to-a-strong-random-secret-in-production
JWT_REFRESH_SECRET=another-strong-random-secret-for-refresh-tokens
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — Set to your Vercel app URL
CORS_ORIGIN=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# AI (optional — app works without these, uses smart fallbacks)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Search (optional — enhances research feature)
TAVILY_API_KEY=tvly-...
EXA_API_KEY=...
SERPAPI_API_KEY=...

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Deploy to Railway
```bash
# From the apps/api directory
railway init
railway up
```

### Deploy to Render
- Create a Web Service pointing to `apps/api`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Add all env vars above

---

## 3. Web Frontend (Vercel)

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Deploy Steps
1. Push repository to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set Root Directory to `apps/web`
4. Add all environment variables above
5. Deploy!

### Or use CLI
```bash
cd apps/web
vercel --prod
```

---

## 4. Local Development

```bash
# Install all dependencies
npm install

# Start the API (from apps/api)
npm run start:dev --workspace=api

# Start the web app (from apps/web)
npm run dev --workspace=web

# OR start both with turbo
npx turbo dev
```

Create `apps/web/.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 5. Security Checklist

- [ ] All JWT secrets are strong, random, and unique per environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the frontend
- [ ] CORS is set to your exact production frontend URL (not `*`)
- [ ] `NODE_ENV=production` is set on the API
- [ ] Rate limiting is enabled
- [ ] No debug API URLs exposed in the frontend UI

---

## 6. Post-Deployment Checks

1. Visit `/auth/signup` — create an account
2. Visit `/dashboard` — should load without errors
3. Create a canvas, enter a prompt — AI generation should work (or show smart fallback)
4. Click a node → Right panel opens with AI Tools, Tasks, Research tabs
5. AI Copilot, Scenario Simulator, Pitch Deck mode — all should open correctly
6. Export canvas → Markdown, HTML, and JSON downloads should all work
