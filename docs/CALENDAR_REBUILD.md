# Calendar frontend rebuild

Implemented on the existing `2026_birthday` checkout from the fresh-start brief.

## Architecture and inventory

- `components/archive/Archive.tsx`: new calendar-first client experience, shared date selection, responsive navigation, below-calendar memories, collections, metadata search, honest unplaced-location view, and native modal photo viewer.
- `components/archive/archive.css`: scoped cool-paper foundation; exact #DCE2E5, #EEF1F1, #A9B5BD, #222A30, #344D69, #687780 tokens; responsive interlocking SVG tiles, photo prints, tape and restrained annotations.
- `lib/archive-calendar.ts`: UTC date-only calendar arithmetic and deterministic matching tab/socket geometry. No exhibition date clamps.
- Homepage and `/explore` replaced. `/map`, `/collections`, `/search`, `/about` added.
- Shared header links updated to the new archive destinations. Root metadata and skip-link label updated.
- Previous exhibition components remain in the repository as unused source; no photograph or historical UI source was deleted. Existing global styles remain to preserve the independent vote page appearance.
- `tools/check-archive.cjs` and `tools/check-archive-browser.cjs`: focused data and responsive interaction checks.

## Data preserved and curation

All 80 existing image IDs and derivative paths are reused without editing the photo registry or original files. 78 photos have EXIF-derived capture dates spanning 31 distinct dates; two lack dates and remain outside the calendar. Capture dates are treated as literal dates in UTC formatting, never inferred event dates. There are no verified photo-location assignments; mock city assignments are deliberately excluded. Collection names/tags reuse the existing curated registry. No new event, place, or credit claims were introduced. The four visual reference images mentioned in the brief were not attached to this task; the written visual direction was used.

The independent vote UI, API, libraries, migrations, database policies and environment files were not edited. The shared navigation links now point into the new archive. No database mutation, credential change, push or deployment was performed.

## Interaction decisions

Default collapsed 68px desktop rail; expanding it adjusts the single main column. Mobile compact bottom navigation includes safe-area padding. The complete calendar section grows beyond one viewport when needed; memories follow in normal flow. Date clicks update selection without scrolling; only View memories explicitly scrolls. Viewer uses a native modal dialog for focus containment, restores focus on close, locks page scrolling, contains images at their original aspect ratio, and supports arrow keys, Escape and touch swipes. Adjacent full-size derivatives are prefetched only while the viewer is open. Calendar thumbnails use Next Image optimization.

## Validation

See the final task report for actual command outcomes. Legacy exhibition/prototype browser scripts target retired DOM structure and are not acceptance tests for this redesign. The new browser script checks all seven requested viewport sizes, horizontal overflow, mobile section placement, date selection without scrolling, viewer keyboard handling, and the verified-only map empty state. Screenshots, if browser execution succeeds, are written under `test-results/archive/`.

### Recorded validation outcomes

- PASS — `node tools/check-archive.cjs` (4/5/6 weeks, leap year, weekday alignment, adjacent padding, year rollover, jigsaw boundary generation).
- PASS — `node tools/check-photo-calendar.cjs` (existing strict date/index tests).
- PASS — `npm run verify:geography:data` (existing geography utility tests; demo locations are not displayed in the new archive).
- PASS — source-only TypeScript check using the installed TypeScript compiler API, excluding generated `.next` files: 39 source files, zero diagnostics.
- PASS — six existing vote-security tests, transpiled into temporary CommonJS files using the installed TypeScript compiler; the server-only marker was omitted only in the temporary test copy. Original tests/backend source unchanged. The standard tsx runner was blocked by IPC restrictions and then a child-process timeout.
- PASS — `git diff --check`.
- Standard typecheck initially failed on missing generated `.next/types` files while Next initialized its build. PASS on separate retry: `npm run typecheck` exited 0.
- Production build and lint launched but were still stalled without completion at the time of this record.
- Browser suite attempted with both default Playwright Chromium (missing executable) and installed Chrome (local preview navigation timed out). No successful screenshot or viewport result is claimed.
- No production vote/database integration test was run, because this frontend task must not mutate the database.

Final check status: `npm run typecheck` PASS (exit 0). Production build remained unfinished after over ten minutes; lint remained unfinished after over seven minutes. Installed-Chrome browser retry timed out after 120 seconds waiting for the local preview homepage. Those checks are BLOCKED, not successful. Seven-viewport screenshots and visual/accessibility interaction verification remain outstanding. No claim of production readiness is made.


## Subsequent change: vote backend removed

At the user’s request, the local Mochamaru Vote backend was removed: API route, server libraries, Supabase SQL/migrations/seeds, backend setup/audit documentation, seed generator, backend tests, and local voting/Supabase environment settings. The `/vote` visual page and photo assets remain as an explicitly labeled style preview, with no submission, cookies, network requests or persistence. Presentation types now live with the content registry. Earlier preservation/testing notes above describe the prior implementation, not the current backend state. Hosted Supabase projects, remote records and deployment settings were not accessed or changed.

Backend-removal validation: after clearing stale generated Next output, `npm run typecheck` passes; calendar regression checks and `git diff --check` pass. Source scan finds no vote API, backend-library, Supabase configuration, or vote submission references in executable source. Build and lint were rerun; final results are in the task response.
