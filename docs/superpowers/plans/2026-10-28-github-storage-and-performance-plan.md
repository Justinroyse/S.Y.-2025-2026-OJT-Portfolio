# Implementation Plan: GitHub Storage Integration & Vercel Performance Optimization

**Date:** 2026-10-28  
**Design Doc:** `docs/superpowers/specs/2026-10-28-github-storage-and-performance-design.md`  
**Target Branch:** `main`  
**Status:** In Progress  

---

## Overview

Migrate the OJT Portfolio off Supabase, commit uploads and CMS data directly to GitHub via the GitHub REST API using a server-side Personal Access Token, optimize for Vercel deployment according to Vercel React Best Practices, and polish navigation.

---

## Step-by-Step Execution Plan

### Phase 1: Environment & Token Configuration
- [ ] **Task 1.1:** Create `.env.local` with the provided `GITHUB_TOKEN`, `GITHUB_OWNER=Justinroyse`, `GITHUB_REPO=S.Y.-2025-2026-OJT-Portfolio`, `GITHUB_BRANCH=main`, and `ADMIN_PASSWORD=ojt2026`.
- [ ] **Task 1.2:** Create `.env.example` as a clean reference for Vercel deployment variables (without sensitive values).
- [ ] **Verification:** Verify `.env.local` is ignored by Git in `.gitignore` so secrets are never committed.

### Phase 2: Lightweight GitHub REST Client
- [ ] **Task 2.1:** Create `src/lib/github.ts` using native Node `fetch`.
  - Implement `commitFileToGitHub({ path, contentBuffer, message })`: fetches existing `sha` if present, then `PUT /repos/{owner}/{repo}/contents/{path}` with base64 payload.
  - Implement `deleteFileFromGitHub({ path, message })`: fetches `sha`, then `DELETE /repos/{owner}/{repo}/contents/{path}`.
  - Implement `isGitHubConfigured()`: checks presence of token, owner, and repo.
  - Implement `getGitHubRawUrl(path)`: generates `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`.
- [ ] **Verification:** Run a test script to verify GitHub API authentication and ability to read/commit to repo.

### Phase 3: Supabase Deprecation & Database Refactoring
- [ ] **Task 3.1:** Refactor `src/lib/db.ts`:
  - `readData<T>(fileName)`: Read directly from local `src/data/{fileName}` via `fs/promises`.
  - `writeData<T>(fileName, data)`: If `isGitHubConfigured()`, commit updated JSON to `src/data/{fileName}` on GitHub, plus local disk write.
  - Remove all Supabase imports and logic.
- [ ] **Task 3.2:** Delete `src/lib/supabase.ts`.
- [ ] **Task 3.3:** Remove `@supabase/ssr` and `@supabase/supabase-js` dependencies via `pnpm remove @supabase/ssr @supabase/supabase-js`.
- [ ] **Verification:** Check `package.json` and ensure no references to Supabase remain across the codebase.

### Phase 4: Upload API Route Refactoring
- [ ] **Task 4.1:** Refactor `src/app/api/upload/route.ts`:
  - `POST`: Write uploaded buffer to `public/uploads/{filename}` on GitHub via `commitFileToGitHub` (and locally to `public/uploads/` during dev).
  - Return `fileUrl`: `https://raw.githubusercontent.com/...` for immediate zero-lag viewing.
  - Update `requirements.json` or `hte.json` with new file URL and submission date.
  - `DELETE`: Delete file from GitHub via `deleteFileFromGitHub` (or local filesystem) and update metadata.
- [ ] **Verification:** Test upload route with a test file payload.

### Phase 5: Vercel React Best Practices & Performance Optimization
- [ ] **Task 5.1:** Update pages (`src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/log/page.tsx`, `src/app/requirements/page.tsx`):
  - Remove `export const dynamic = "force-dynamic"`.
  - Enable Next.js static generation (SSG) so pages pre-render to HTML at build time for near-instant Vercel delivery.
- [ ] **Task 5.2:** Audit for waterfalls and bundle bloat:
  - Ensure static data reads don't block independently.
  - Verify images use Next.js `<Image>` or optimized SVGs with proper sizes.
- [ ] **Verification:** Run `pnpm build` to verify successful static page generation without runtime errors.

### Phase 6: Frontend & Navigation Polish
- [ ] **Task 6.1:** Update `src/components/ui/NavBar.tsx`:
  - Add active state indicators using `usePathname()` so the active section is highlighted clearly.
  - Ensure accessible labels and keyboard focus rings.
- [ ] **Task 6.2:** Polish `src/components/layout/AppLayout.tsx`:
  - Ensure mobile header and desktop layout transition smoothly and navigation is intuitive and effortless.
- [ ] **Task 6.3:** Polish `src/components/ui/RequirementsList.tsx`:
  - Clear submission badges ("SUBMITTED" vs "NOT SUBMITTED") and direct preview/download buttons.
- [ ] **Verification:** Test desktop and mobile layout in browser, checking responsiveness and visual quality.

### Phase 7: Final Verification & Clean-up
- [ ] **Task 7.1:** Run `pnpm build` and `pnpm lint` to ensure zero build errors or warnings.
- [ ] **Task 7.2:** Verify Git status to confirm no secrets are staged or unignored.
