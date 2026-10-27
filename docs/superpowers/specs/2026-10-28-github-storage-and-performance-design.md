# Design Document: GitHub Storage Integration & Vercel Performance Optimization

**Date:** 2026-10-28  
**Project:** S.Y. 2025-2026 OJT Portfolio (Justin Royse L. Solomon, BSCpE 2-6)  
**Status:** Pending Review  

---

## 1. Intent and Why

The portfolio was previously configured with Supabase for document storage (`uploads` bucket) and JSON database records (`cms_data` table). However, managing an external database introduces unnecessary complexity, potential cold-start latency, external dependencies, and runtime points of failure.

The intent of this project is to:
1. Completely decouple the application from Supabase, removing all Supabase SDK dependencies.
2. Store all uploaded documents (e.g. resumes, endorsement letters, certificates, HTE logos) and structured CMS data (JSON records) directly inside the project's GitHub repository (`Justinroyse/S.Y.-2025-2026-OJT-Portfolio`).
3. Optimize the site for Vercel deployment according to Vercel React Best Practices to achieve instant, zero-latency static page delivery with minimal bundle size.
4. Polish the existing frontend navigation so it feels simple, effortless to navigate, and professional while retaining its distinctive engineering aesthetic.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Complete Supabase Removal:** Zero `@supabase` dependencies in `package.json` and elimination of all Supabase environment variables and client wrappers.
- **Direct GitHub Repo Persistence:** Admin CMS updates and file uploads persist via GitHub REST API commits directly to the repository (in `src/data/*.json` and `public/uploads/*`).
- **Instant Viewing Fallback:** New uploads are immediately viewable via GitHub Raw CDN URL (`raw.githubusercontent.com`) even before Vercel completes its redeployment.
- **Blazing Vercel Performance:** Transform pages (`/`, `/about`, `/log`, `/requirements`) into pre-rendered static React Server Components without runtime database blocking.
- **Frictionless Local Development:** When running locally without a GitHub token, fall back transparently to local filesystem read/writes (`fs/promises`).
- **Streamlined Navigation:** Refine active states, tab indicators, and mobile navigation in `NavBar.tsx` and `AppLayout.tsx` for a clean, professional user experience.

### Non-Goals
- Complete visual redesign or altering the core dark technical identity (Orbitron/Geist fonts, `#252525` theme, engineering grid).
- Replacing the passcode-based admin authentication (`ADMIN_PASSWORD` / session cookie).
- Storing multi-gigabyte video or media files (documents are standard OJT PDFs and images well below GitHub's 25MB single-file API limit).

### Anti-Goals
- Do not make the public pages depend on client-side GitHub API calls (which would exhaust the 60 req/hr unauthenticated rate limit).
- Do not add heavy third-party git/bundle libraries like full `octokit` SDK if native `fetch` accomplishes the task with zero bundle weight.

---

## 3. Constraints
- **GitHub API Limits:** The GitHub Contents API accepts files up to 25MB base64-encoded. OJT documents (resumes, letters, receipts) are typically under 5MB.
- **Authentication:** Committing via GitHub API requires a Personal Access Token (classic or fine-grained) with `Contents: Read and write` permission.
- **Vercel Read-Only Runtime:** In production on Vercel, the local serverless filesystem is ephemeral and read-only. All runtime persistence must go through the GitHub API.

---

## 4. Approaches Considered

### Approach 1: Static Pre-rendering with Server-Side GitHub Commits (Chosen)
- **Mechanism:** Next.js API routes (`/api/upload`, `/api/cms`) use a server-side `GITHUB_TOKEN` to commit files and JSON directly to the GitHub repo via GitHub REST API (`PUT /repos/{owner}/{repo}/contents/{path}`). Public pages read static JSON files bundled at build time.
- **Trade-offs:** Fast, zero database cost, zero client bundle weight. Requires setting 3 environment variables in Vercel (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`).
- **Why Chosen:** Provides the fastest possible visitor experience (pre-rendered static HTML from Vercel Edge CDN) and stores everything directly in version control.

### Approach 2: Live GitHub Fetching with Runtime Revalidation (Rejected)
- **Mechanism:** Public pages fetch data dynamically on every request from GitHub's REST API or Raw CDN with tag revalidation.
- **Trade-offs:** Avoids rebuild delay, but introduces external network waterfalls, potential rate-limiting, and slower TTFB. Rejected because it contradicts the fast-loading requirement.

---

## 5. System Design and Implementation Details

### 5.1 Architecture Overview

```
[ Admin Dashboard ]
       │
       ▼ (POST /api/upload or POST /api/cms)
[ Next.js API Route (Server-side) ]
       │
       ├─ Local Dev: Write to local disk (`src/data/` or `public/uploads/`)
       │
       └─ Production: GitHub REST API (PUT /repos/{owner}/{repo}/contents/{path})
              │
              ▼ Commits file to GitHub Repository
       [ GitHub Repo: Justinroyse/S.Y.-2025-2026-OJT-Portfolio ]
              │
              ▼ Triggers Vercel Deployment Webhook / Auto-build
       [ Vercel Edge Network ] ──▶ Serves Static Pre-rendered Portfolio to Public
```

### 5.2 GitHub Integration Helper (`src/lib/github.ts`)
A lightweight utility using native Node `fetch` (no heavy Octokit bundle):
- `commitFileToGitHub({ path, contentBuffer, message })`:
  1. Checks if the file already exists via `GET /repos/{owner}/{repo}/contents/{path}` to retrieve its current `sha`.
  2. Commits or updates the file via `PUT /repos/{owner}/{repo}/contents/{path}` with base64-encoded content and the existing `sha` (if updating).
  3. Returns the commit details and the canonical GitHub Raw URL.
- `deleteFileFromGitHub({ path, message })`:
  1. Retrieves the file `sha`.
  2. Calls `DELETE /repos/{owner}/{repo}/contents/{path}`.
- `isGitHubConfigured()`: Checks if `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` are defined.

### 5.3 Database & CMS Layer Refactoring (`src/lib/db.ts`)
- **Read Operations (`readData<T>`):**
  - Reads directly from local files in `src/data/{fileName}` via `fs/promises` (which are bundled in the build artifact). This is instant and synchronous in static generation.
- **Write Operations (`writeData<T>`):**
  - If `isGitHubConfigured()`: commits the formatted JSON string directly to `src/data/{fileName}` in the repository with message `chore(cms): update {fileName}`.
  - Also attempts local filesystem write so local dev immediately reflects changes without pulling.

### 5.4 Upload Route Refactoring (`src/app/api/upload/route.ts`)
- Converts uploaded file to Buffer.
- Generates standard sanitized filename: `${reqKey}${extension}`.
- If in local dev (without GitHub configured): writes to `public/uploads/${filename}`.
- If in production / GitHub configured:
  - Commits file to `public/uploads/${filename}` in GitHub.
  - Returns `fileUrl`: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/uploads/${filename}` (allowing immediate display in the browser without waiting for Vercel's build to finish). Once redeployed, `/uploads/${filename}` is also valid.
- If deleting: deletes via GitHub API or local filesystem.
- Updates `requirements.json` or `hte.json` with the new URL and timestamp.

### 5.5 Package Cleanup
- Run `pnpm remove @supabase/ssr @supabase/supabase-js`.
- Delete `src/lib/supabase.ts`.

### 5.6 Vercel Performance & React Best Practices
- **Eliminate Force Dynamic:** Remove `export const dynamic = "force-dynamic"` from `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/log/page.tsx`, `src/app/requirements/page.tsx`.
- **Static Generation:** Next.js will pre-render pages to static HTML during `pnpm build`.
- **Bundle Optimization:** Avoid barrel imports, ensure dynamic imports for heavy admin components if needed.
- **Image Optimization:** Ensure logo and avatar use Next.js `<Image>` with explicit width/height and modern formats (WebP/AVIF).

### 5.7 Frontend Polish & Navigation Simplicity
- **Active Navigation Highlighting:** Update `NavBar.tsx` to detect `usePathname()` and give the current active route a distinct indicator (e.g. solid white underline and bright text vs muted neutral text).
- **Mobile Usability:** Ensure responsive layout transitions smoothly between mobile header and desktop technical grid with accessible touch targets.
- **Requirements UI:** Ensure documents indicate status clearly (e.g., "SUBMITTED", "PENDING", with direct view/download actions).

---

## 6. What's Left to the Builder
- Precise commit message wording (`chore(cms): ...` or `feat(upload): ...`).
- Exact styling details for active state indicators in `NavBar.tsx` (using Tailwind classes matching the existing palette).
- Handling fallback to default branches (`main`).
