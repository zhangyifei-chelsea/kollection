# Calendar reference visual pass

The supplied Weixin reference guides this pass: a continuous cool off-white sheet, nearly square date compartments, small shared jigsaw seams, restrained serif typography, small torn photographs and one handwritten note. Reference screenshot application controls are not reproduced. Photo density is determined by the real metadata: October 2026 has seven photos on one capture date; no dates/photos were invented to fill the reference's denser composition.

## Changes

- `components/archive/CalendarSeams.tsx`: one SVG draws each internal shared boundary exactly once, with small alternating curved tabs/sockets. It fits 4/5/6 calendar weeks without changing the regular seven-column cell footprints. Lines are thin and low contrast; no floating pieces or physics.
- `components/archive/Archive.tsx`: mounts that decorative SVG; refines calendar-only heading, weekday labels and real month day/photo totals. Date calculation functions, date selection and month-navigation handlers are unchanged.
- `components/archive/archive.css`: calendar-scoped overrides replace heavy straight 2px seams and coarse noise with near-square cells, a continuous real paper surface, subtle seams, legible serif dates and consistent 72%-wide photo placement areas. Existing licensed torn-photo masks remain. Selected cells retain #344D69 and identical dimensions with no elevation or scaling.
- `public/images/paper/calendar-paper-surface.webp`: ~34 KB lossless texture derived from the safe interior of the previously licensed white paper asset, cropped at x=300, y=250, 1400×900, normalized to low contrast and resized to 700px. The source license remains at `docs/licenses/rippedpaper-LICENCE.txt`; no raw asset pack is included. Shared material is drawn beneath date text/photos so photo colors remain unchanged.

Photo metadata, calendar utilities, viewer, memory photo section/filmstrip, Collections, Map, Search, About, Mochamaru preview, and backend state are unchanged in this pass. No push or deployment.

## Browser verification

- Inspected 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×812, 320×640: seven columns, no horizontal page overflow, same selected/unselected footprint, off-white readable selected text, photos clear date labels. Phone memories remain below the first viewport and calendar rows can extend beyond short screens.
- At 320px, the shared SVG and date cells align exactly: SVG starts at x=15 with width 290; seven cells total ~289.95px (subpixel rounding); SVG and five rows are both 230px high.
- Month buttons verified August's 42 cells/viewBox 700×600, February's 28 cells/viewBox 700×400, October's 35 cells/viewBox 700×500. Return to October restored real selected-date photos.
- Direct date tap preserved scrollY=0 before/after and changed the pressed date without opening a modal.
- Actual screenshots: `test-results/calendar-reference/mobile.png`, `desktop.png`.

Final lint, TypeScript, production build, calendar/date regression and whitespace results are recorded in the task response.

## Final editorial simplification

At the user's request, removed the top archive/search header, rail K wordmark, month picker, calendar footer slogans, previous handwritten slogan, photo IDs/captions/titles, memory metadata/tags/secondary viewer link, and memory photo-count sentence. `PHOTO ARCHIVE / MOMENTS OF K` now uses the handwritten font and aligns right. The memory image occupies one centered column; its date, clickable photograph and rounded filmstrip remain. Viewer counter/navigation and accessible image labels remain without visible photo titles.

Month navigation is limited to the inclusive October 2025–October 2026 window using the existing shared date constants. Previous/next buttons disable at their respective ends. Out-of-window adjacent padding days are also disabled, and date selection/keyboard handlers reject out-of-window dates. Source photo metadata is untouched.

Browser verification: traversed all 13 months in both directions; October 2025's previous arrow and September padding dates are disabled; October 2026's next arrow is disabled. No month picker/header/rail brand/calendar slogans/photo captions remain. Seven viewport sizes have seven columns and no horizontal overflow; handwritten title aligns right; phone memories start after the first screen. Filmstrip selection, clicking the photo into the full viewer, and Escape still work. Actual screenshot: `test-results/final-simplification/mobile.png`.

Build, TypeScript, date/calendar checks and whitespace checks pass. Lint passes with the existing unused `_props` header warning. No push or deployment.

Verification clarification: the complete first production build, TypeScript, lint and date checks passed after the functionality/text changes. The only subsequent application change was increasing the CSS selector specificity for right-aligned handwriting on mobile; that final CSS was verified in the browser at all seven sizes. Its production-build retry stalled in dependency/worker reads (about two seconds CPU over five minutes) and was stopped without completion. No successful final retry is claimed.
