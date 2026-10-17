# Geographic Explorer verification — 18 October 2026

Verified on branch `2026_birthday`, using the actual repository production build, Next.js 16.4.2, React 19.3.1, Node 20.12.2 and Playwright 1.58.2 / Chromium 145.

## Results

All completed successfully:

- `npm run typecheck`.
- `npm run lint`, including the new lib utilities.
- `npm run build`: `/`, `/_not-found` and `/explore` prerendered successfully.
- `npm run verify:geography:data`: all 80 photographs assigned to exactly one mock city; all six cities populated; no loss/duplication; verified metadata precedence; disabled mocks; unknown, invalid and empty metadata; geographic projection and collision clustering.
- `npm run verify:geography` against the production server: desktop 1440px and touch/mobile 390px. Entered through the actual desktop header or mobile menu, then Explore → By place. Confirmed no map SVG request in Calendar before switching views.
- Geographic interaction coverage: all six cities and counts, country and city filters, cluster expansion, clicking Osaka's map marker, direct links/reload and browser back, actual mouse and touch dragging, keyboard zoom/pan/reset, explicit touch-pan mode, invalid query values, existing fullscreen asset requested on opening a photograph, Escape close, focus restoration, no browser page errors, and return to Calendar.
- Responsive document-overflow checks: 320, 375, 390, 768, 1024, 1440 and 1920 CSS pixels.
- Calendar browser regression (`tools/check-explore.cjs`): URL/history, metadata counts, empty/invalid dates, multiple years, keyboard focus, Lightbox/focus, deferred fullscreen requests, all seven widths. The previously unexecuted test had date-locale, count-parsing and asynchronous focus/opening timing assumptions corrected; CalendarExplorer itself is unchanged.
- `npm run verify:prototype`: original chapter geometry/aspect ratios, independent scrolling, keyboard arrows, natural vertical wheel, mobile menu, native horizontal/vertical touch, no-JavaScript exhibition content, and responsive widths.
- `npm run verify:phase2`: 80 photographs, 7 initial gallery requests, 0 initial fullscreen/original requests; Lightbox captions/alt, previous/next, zoom, Escape, focus and wall-scroll restoration; mobile touch open/swipe; no browser errors.
- `git diff --check` and generator/test JavaScript syntax checks.

## Visual review and corrections

Reviewed desktop/mobile screenshots at `docs/geographic-review/places-1440.png` and `places-390.png`. Corrected Natural Earth polygons crossing the date line using development-only D3 clipping, avoiding horizontal seams. A 320px regression exposed the existing homepage mobile heading nowrap rule leaking into Explore; an Explore-only override now allows its longer heading to wrap. The Calendar component and four chapter components were not changed.

## Mock data

Seoul 14; Tokyo 14; Osaka 13; Los Angeles 13; Hong Kong 13; Shanghai 13. All assignments are fictional, labeled with `source: 'mock'`, and separate from generated/verified metadata. City coordinates themselves match the linked GeoNames records. The visible demonstration notice, per-city mock text and result labels prevent presenting these as verified capture locations.

Replacement instructions and coordinate/map provenance are in `docs/geographic-explorer.md`. There are no known failing verification checks. The capture-location data is deliberately still mock and must be replaced or disabled for verified-location publication.

## Environment

The old dependency tree/cache stalled repeatedly. A fresh install of the original locked application dependencies passed verification; prior files were retained under ignored `node_modules/.previous-installation` and `node_modules/.previous-next-cache`. A matching headless Chromium was installed at `/private/tmp/kollection-playwright-browsers`, supplied through PLAYWRIGHT_BROWSERS_PATH for browser checks. Development-only `d3-geo` and `topojson-client` were added for SVG generation; no map library runs in the client bundle.

npm emitted an engine warning for eslint-visitor-keys (requires Node >=20.19 within the 20.x line); the actual lint/build/type/browser checks above nevertheless completed on Node 20.12.2. The exact OS-level reason for the old native-loader stall has not been established.

A local production preview is running at `http://127.0.0.1:3000/explore?view=map`.

## Follow-up: requested bounds and Pacific framing

Implemented and verified the inclusive October 2025–October 2026 calendar range, including filtered month/year dropdowns, disabled boundary arrows, keyboard clamping and out-of-range URL handling. Updated the land SVG and city projection together to a Pacific-centered half-world default at 2× zoom; tested both Pacific and World reset buttons and confirmed all six cities fall inside the initial camera.

Production build, type checking, lint, calendar/geographic data checks, and desktop/mobile Calendar and Geographic browser suites passed again. Updated desktop/mobile screenshots show the Pacific framing.
