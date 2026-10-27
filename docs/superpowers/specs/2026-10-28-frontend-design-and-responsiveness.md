# Design Document: Frontend Visual Optimization & Multi-Screen Responsiveness

**Date:** 2026-10-28  
**Project:** S.Y. 2025-2026 OJT Portfolio (Justin Royse L. Solomon, BSCpE 2-6)  
**Status:** Approved (Approach 1)  

---

## 1. Intent and Why

The portfolio documents a Computer Engineering (`BSCpE 2-6`) On-the-Job Training (OJT 1) internship at the Polytechnic University of the Philippines. While the initial version established a dark graphite engineering theme (`#252525`), several structural and visual issues hindered usability across desktop, tablet, and mobile viewports:

1. **Duplicate DOM Trees in `AppLayout.tsx`:** Rendering `{children}` twice (`hidden lg:grid` and `flex lg:hidden`) caused client components (`RequirementsList`, `AdminDashboard`) to unmount and lose state when crossing the `1024px` breakpoint, while hardcoding student details instead of reading from `about.json`.
2. **Redundant & Cramped Navigation:** `DropdownSelector` and `NavBar` rendered identical links on both desktop and mobile, and `NavBar` overflowed narrow `320px–390px` mobile screens.
3. **Nested Scroll Traps:** `log/page.tsx`, `RequirementsList.tsx`, and `admin/page.tsx` locked content inside `max-h-[400px] overflow-y-auto` containers, creating double scrollbars on mobile and wasting vertical viewport height on desktop.
4. **Overuse of Display Typography:** Setting `Orbitron` as the default `body` font made long paragraphs, task bullets, and admin form inputs difficult to scan.
5. **Underutilized Content on Home:** `hte.json` contained a full company description (`details`) that was editable in Admin but never displayed on the public site, and the `300 HOURS` target lacked a visual progress readout.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Unified Responsive Shell:** Render `{children}` once inside a single semantic CSS Grid layout in `AppLayout.tsx` that adapts smoothly from `320px` mobile to `4K` desktop, hydrated with live student metadata from `about.json`.
- **Intentional Typographic Hierarchy:** Reserve `Orbitron` for architectural headers, navigation, and primary telemetry numbers; set `Geist Sans` as the default body/UI font (`< 70ch` line length); use `Geist Mono` for student IDs, dates, indices, and status badges.
- **Zero Nested Scroll Traps:** Remove fixed `400px`/`500px` internal scroll containers across `/log`, `/requirements`, and `/admin` in favor of natural document scrolling.
- **Thumb-Friendly Mobile Ergonomics:** Provide `>= 44px` touch targets, responsive form grids (`grid-cols-1 sm:grid-cols-3`), and full-viewport mobile document preview modals with `Escape` key support.
- **Richer Screen Utility:** Surface HTE company details and a visual 300-hour progress meter on `/`, add status filtering (`All`, `Submitted`, `Pending`) and completion progress on `/requirements`, and add cumulative telemetry on `/log`.

### Non-Goals
- Changing the backend GitHub/filesystem storage architecture (`src/lib/db.ts`, `src/lib/github.ts`) or API route contracts.
- Altering the JSON data schemas (`about.json`, `hte.json`, `logs.json`, `requirements.json`).

### Anti-Goals
- Avoid generic AI-generated template chrome (excessive `//` or `SYS_` prefixes on every element, fade-up animations on every card, or rounded SaaS drop-shadow cards).
- Do not introduce heavy UI component libraries that bloat the client JS bundle.

---

## 3. Compact Design Token System (`frontend-design`)

### Color Palette (5 Core Hex Tokens)
- **Graphite Drafting Surface (`#252525`):** Primary background canvas overlaid with a subtle `30px` architectural coordinate grid (`rgba(255, 255, 255, 0.025)`).
- **Obsidian Module Well (`#1B1C1E`):** Recessed surface for cards, telemetry blocks, inputs, and document preview frames.
- **Blueprint Hairline (`#383A3E` / `rgba(255, 255, 255, 0.14)`):** `1px` zero-radius structural rules dividing the title block, sidebar, and content modules.
- **Chalk Ivory & Slate Prose (`#F4F4F6` / `#A1A1AA`):** High-contrast display text paired with comfortable secondary prose for body copy and task lists.
- **Verification Emerald & Amber (`#10B981` / `#F59E0B`):** Semantic accents used strictly for verified OJT hours, approved weekly logs, and submitted vs. pending requirements.

### Typography
- **Display & Title Block (`--font-orbitron`):** Student identity block, page titles, primary telemetry counters, and navigation items.
- **Body & Form UI (`--font-geist-sans`):** Default `body` font; used for biography, internship objectives, company description, weekly log tasks, and form controls.
- **Technical Metadata (`--font-geist-mono`):** Student ID, course code, date ranges, document numbering (`01`–`17`), and status pills.

### Layout Concept & Wireframe
Left-aligned architectural schematic layout with a persistent engineering "Title Block" sidebar on desktop (`lg+`) and a compact sticky header + bottom/top accessible navigation bar on mobile (`< lg`).

```
Desktop (lg+):
+--------+------------------------+--------------------------------------------------+
|        |  DOSSIER TITLE BLOCK   |  PRIMARY NAVIGATION BAR                 [ADMIN]  |
|--------+------------------------+--------------------------------------------------+
|        |  JUSTIN ROYSE SOLOMON  |                                                  |
|        |  BSCpE 2-6             |  MAIN CONTENT VIEWPORT (Natural Page Scroll)     |
|        |  2024-02548-mn-0       |  - Left-aligned content, max-w-5xl               |
|        |                        |  - Hero / Telemetry / Requirements / Timeline    |
|        |  [QUICK TELEMETRY]     |                                                  |
|--------+------------------------+--------------------------------------------------+
|        |  PUP // SY 2025-2026   |  SYSTEM STATUS: ONLINE              © 2026 OJT   |
+--------+------------------------+--------------------------------------------------+

Mobile / Tablet (< lg):
+-----------------------------------------+
|  PUP OJT-1 // JUSTIN ROYSE L. SOLOMON   |
|  [HOME]  [ABOUT]  [REQ]  [LOG]  [ADMIN] |  <-- Sticky 44px touch-target nav bar
+-----------------------------------------+
|  MAIN CONTENT VIEWPORT                  |
|  - Single-column fluid stack            |
|  - Full-width cards & forms             |
+-----------------------------------------+
|  © 2026 JUSTIN ROYSE L. SOLOMON         |
+-----------------------------------------+
```

---

## 4. Approaches Considered

1. **Approach 1: Refined Blueprint Dossier & Unified Responsive Shell (Chosen)** — Unifies `AppLayout.tsx` into a single responsive CSS Grid tree, fixes typography hierarchy (`Geist Sans` body + `Orbitron` headers), removes all `400px` scroll traps, enriches Home/Requirements/Log with progress telemetry and filters, and makes Admin forms/modals mobile-responsive.
2. **Approach 2: Fixed-Viewport Desktop HUD + Scrollable Mobile** — Rejected because fixed `100vh` internal scroll areas still feel cramped on `768px–900px` laptop screens.
3. **Approach 3: Single-Column Editorial Redesign** — Rejected because it discards the distinctive Computer Engineering schematic grid identity.
