# VideoDash — Full Project Context

> Share this file at the start of any new conversation so Claude has complete context about the project.

---

## What This Is

A **private, login-protected web dashboard** for a freelance video editor (client: Zehra) to track how TikTok and Instagram videos are performing across all of her own clients' accounts. The editor pastes video URLs, the dashboard auto-fetches stats where possible, and aggregates performance data across all tracked videos.

**Live stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL (Neon) · NextAuth.js v4 · Recharts · Deployed on Vercel (free tier)

---

## Core Features

- Paste a TikTok or Instagram URL → platform auto-detected → stats auto-fetched (TikTok) or manual entry (Instagram)
- Track: **Views, Likes, Comments, Shares/Reposts**
- Multiple stat snapshots per video over time (growth tracking)
- Separate dashboards for TikTok and Instagram
- Overview dashboard with aggregate totals and charts
- All Videos page with search + filter by platform and client name
- Per-user data isolation — each logged-in user only sees their own videos

---

## Tech Stack Details

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 App Router | `/src/app/` directory structure |
| Language | TypeScript | Strict mode, zero type errors required |
| Styling | Tailwind CSS + inline styles | Dark theme, no UI component libraries |
| Database | PostgreSQL via Neon (free tier) | Managed by Prisma |
| ORM | Prisma v5 | Schema at `prisma/schema.prisma` |
| Auth | NextAuth.js v4 | Credentials provider, JWT sessions |
| Charts | Recharts | Bar charts on dashboard pages |
| Hosting | Vercel (Hobby — free) | Auto-deploys from GitHub |
| DB Hosting | Neon (free tier) | 512MB limit, more than enough |

---

## Authentication & Security — CRITICAL

**This is important. Always keep these in mind when making changes.**

### How Auth Works
- NextAuth v4 with a **Credentials provider** (username + password)
- Sessions use **JWT strategy** (no database session table needed)
- `middleware.ts` at the project root protects every route — unauthenticated users are always redirected to `/login`
- The login page is at `/login` and has NO sidebar (handled by `AppShell` component checking the pathname)

### User Management
Users are **hardcoded** in `src/lib/users.ts`. There is no sign-up flow. To add a new user:
1. Generate a bcrypt hash (12 rounds): `node -e "require('bcryptjs').hash('Password', 12, (e,h) => console.log(h))"`
2. Add an entry to the `USERS` array in `src/lib/users.ts`
3. Redeploy — the new user gets a completely isolated, empty dashboard

**Current users:**
- Username: `MediabyZehra` / Display name: `Media by Zehra` / ID: `user_zehra`

### Data Isolation
Every `Video` record has a `userId` field. **All API routes check the session** using `getServerSession(authOptions)` and filter queries by `userId`. A user can never read, write, update, or delete another user's videos — this is enforced at the database query level, not just the UI.

### Passwords
- Passwords are **bcrypt-hashed** (12 rounds) and stored only as hashes in `src/lib/users.ts`
- Plain-text passwords are never stored anywhere in the codebase
- `NEXTAUTH_SECRET` is stored only in environment variables, never committed to git

### What Must Never Be Committed to Git
- `.env` (contains `NEXTAUTH_SECRET` and database URLs) — already in `.gitignore`
- `prisma/*.db` files (SQLite, if used locally) — already in `.gitignore`
- Any file containing plain-text passwords

---

## Project File Structure

```
/
├── middleware.ts                          ← Route protection (NextAuth)
├── prisma/
│   └── schema.prisma                      ← DB schema (PostgreSQL)
├── src/
│   ├── app/
│   │   ├── layout.tsx                     ← Root layout (AuthProvider + AppShell)
│   │   ├── globals.css
│   │   ├── page.tsx                       ← Overview dashboard (all platforms)
│   │   ├── tiktok/page.tsx                ← TikTok-only dashboard
│   │   ├── instagram/page.tsx             ← Instagram-only dashboard
│   │   ├── videos/page.tsx                ← All videos list with search/filter
│   │   ├── login/page.tsx                 ← Login page (no sidebar)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts ← NextAuth handler
│   │       ├── videos/route.ts             ← GET list + POST create
│   │       ├── videos/[id]/route.ts        ← GET + PUT + DELETE single video
│   │       ├── videos/[id]/stats/route.ts  ← POST new stat snapshot + GET history
│   │       └── fetch-meta/route.ts         ← Auto-fetch title/thumbnail/stats from URL
│   ├── components/
│   │   ├── AuthProvider.tsx               ← SessionProvider wrapper (client)
│   │   ├── AppShell.tsx                   ← Sidebar layout, hides sidebar on /login
│   │   ├── Sidebar.tsx                    ← Navigation + user info + logout button
│   │   ├── AddVideoModal.tsx              ← Modal: paste URL → auto-fetch → save
│   │   ├── UpdateStatsModal.tsx           ← Modal: update stats for existing video
│   │   ├── VideoCard.tsx                  ← Individual video card with stats
│   │   ├── VideoGrid.tsx                  ← Responsive grid of VideoCards
│   │   ├── StatsCards.tsx                 ← Aggregate stat totals (5 cards)
│   │   ├── PerformanceChart.tsx           ← Recharts bar chart (top videos by views)
│   │   ├── TopVideos.tsx                  ← Top 5 videos ranked list
│   │   ├── PlatformBadge.tsx              ← TikTok/Instagram pill badge
│   │   └── DashboardView.tsx             ← Shared layout for all 3 dashboard pages
│   ├── lib/
│   │   ├── auth.ts                        ← NextAuth options (authOptions)
│   │   ├── users.ts                       ← Hardcoded user list (ADD NEW USERS HERE)
│   │   ├── db.ts                          ← Prisma client singleton
│   │   └── utils.ts                       ← formatNumber, formatDate, detectPlatform, cn
│   └── types/
│       ├── index.ts                       ← App types (Video, Stat, VideoWithLatestStat)
│       └── next-auth.d.ts                 ← NextAuth session type augmentation (adds .id)
```

---

## Database Schema

```prisma
model Video {
  id         String   @id @default(cuid())
  userId     String                          // ← Scopes data per user
  url        String
  platform   String                          // "tiktok" | "instagram"
  title      String
  thumbnail  String?
  clientName String                          // Which of Zehra's clients posted this
  notes      String?
  datePosted DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  stats      Stat[]

  @@unique([userId, url])                   // Same URL can exist for different users
}

model Stat {
  id         String   @id @default(cuid())
  videoId    String
  video      Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  views      Int      @default(0)
  likes      Int      @default(0)
  comments   Int      @default(0)
  shares     Int      @default(0)
  recordedAt DateTime @default(now())
}
```

Multiple `Stat` rows per `Video` — each time the user updates stats, a new snapshot is saved. This enables growth tracking over time. The latest stat is always `stats[0]` (ordered by `recordedAt desc`).

---

## Auto-Fetching Stats

### TikTok (works reliably)
Uses **tikwm.com** — a free unofficial API, no key required, 5,000 requests/day/IP.
- Endpoint: `POST https://www.tikwm.com/api/` with `url` in the body
- Returns: `play_count` (views), `digg_count` (likes), `comment_count`, `share_count`, plus `title`, `cover` (thumbnail), `author.nickname`
- All 4 stat fields are auto-filled when a TikTok URL is pasted

### Instagram (partial / unreliable)
No free API exists for Instagram stats. The app tries to scrape the public page HTML:
- Fetches the Instagram URL with browser-like headers
- Parses the `og:description` meta tag which sometimes contains "1,234 Likes, 56 Comments"
- If scraping is blocked (Instagram redirects to login), fields stay blank for manual entry
- Views are never available for Instagram (Instagram doesn't expose them publicly)

### Auto-trigger behavior
When a valid URL is pasted in the Add Video modal, fetch is triggered automatically (no button click needed). The form shows:
- "Stats auto-filled! Review and confirm below." — if tikwm returned stats
- "Info fetched — please enter stats manually." — if only title/thumbnail was fetched

---

## Environment Variables

Required in `.env` (locally) and in Vercel dashboard (production):

```
DATABASE_URL      Pooled PostgreSQL connection string from Neon
DIRECT_URL        Direct (non-pooled) connection string from Neon (required by Prisma)
NEXTAUTH_SECRET   Random 32-byte base64 string — never change after launch
NEXTAUTH_URL      http://localhost:3000 (local) or https://your-app.vercel.app (prod)
```

The `.env` file is gitignored. `.env.example` is committed as a safe template.

---

## Design System

- **Background colors:** `#0f0f0f` (page), `#111111` (sidebar), `#161616` (cards/modals), `#1e1e1e` (inputs)
- **Border color:** `#2a2a2a`
- **Text:** `#f5f5f5` (primary), `#a0a0a0` (secondary), `#5a5a5a` (muted)
- **Accent — default/TikTok-stats:** `#06b6d4` (cyan)
- **Accent — TikTok platform:** `#ff0050` (pink/red)
- **Accent — Instagram:** `#c084fc` (purple)
- No external UI component libraries — all components are hand-built with Tailwind + inline styles

---

## Deployment

- **Platform:** Vercel (free Hobby plan)
- **Database:** Neon PostgreSQL (free tier, ~512MB)
- **CI/CD:** Push to GitHub → Vercel auto-deploys
- **DB migrations:** `npx prisma db push` (run manually when schema changes)
- **Prisma client generation:** Handled automatically by `postinstall` script in `package.json`

### To deploy a schema change:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` with production `DATABASE_URL`
3. Push code to GitHub → Vercel rebuilds automatically

---

## Adding a New Client User

Edit `src/lib/users.ts` and add a new entry:

```bash
# Step 1 — generate a bcrypt hash for their password (run in terminal):
node -e "require('bcryptjs').hash('TheirPassword123', 12, (e,h) => console.log(h))"

# Step 2 — add to USERS array in src/lib/users.ts:
{
  id: 'user_clientname',           // must be unique
  username: 'ClientUsername',      // what they type to log in
  passwordHash: '$2b$12$...',      // paste the hash from step 1
  displayName: 'Their Name',       // shown in the sidebar
}

# Step 3 — commit and push to GitHub → Vercel redeploys automatically
```

The new user gets a completely empty, isolated dashboard. Their data is 100% separate from all other users.

---

## Key Constraints & Decisions

1. **Everything must be free** — no paid APIs, no paid services. tikwm.com is the only external API used and it's free.
2. **No signup flow** — users are hardcoded by the developer. This is intentional for a private tool.
3. **No SQLite in production** — Vercel is serverless (no persistent filesystem). PostgreSQL via Neon is required.
4. **Stats are manual for Instagram** — there is no free, reliable API for Instagram public video stats. This is a platform limitation, not a code limitation.
5. **Session uses JWT** (not database sessions) — simpler, no extra DB table needed.
6. **Security is enforced server-side** — even if someone bypassed the UI, every API route independently verifies the session and filters by `userId`.
