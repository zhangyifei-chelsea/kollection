> Superseded after Phase 2 image integration. See [Phase 2 verification](phase-2-verification.md) for current image loading and interactions.

# Phase 1 verification — 17 October 2026

## Completed

- `npm run lint`, `npm run typecheck`, and `npm run build`: pass. The route is statically prerendered by Next.js 16.4.2 using webpack.
- Chromium 145 desktop browser checks against the local production build on macOS.
- Widths: **320, 375, 390, 768, 1024, 1440, 1920 CSS px**. At every width the document's scroll width equals the viewport width. All four galleries overflow horizontally and remain independently scrollable.
- Every photograph within each wall has exactly the same rendered height, within subpixel rounding. Rendered width/height matches intrinsic aspect ratio within 0.01.
- Measured gallery heights: 260px at 320; 270px at 375; 280.8px at 390; 340px at 768; 400px at 1024; 518.4px at 1440; 520px at 1920.
- Clicking the first wall's right arrow moves only that wall. Focusing the second wall and pressing Right moves only the second wall.
- Ordinary vertical mouse-wheel input continues moving the document while interacting with gallery regions.
- Mobile menu opens, its chapter anchor navigates to the correct section, and the menu closes on selection.
- Chromium touch emulation with real dispatched touch gestures: horizontal swipe moves only the selected wall; vertical swipe continues scrolling the document.
- JavaScript disabled: all 16 figures, headings, images and native scroll containers remain in the rendered document.
- No browser JavaScript errors during these checks.
- Desktop and mobile screenshots inspected after scrolling each chapter into view to load visible photographs.

## Review screenshots

- [Desktop, 1440px](preview-1440.png)
- [Mobile, 390px](preview-390.png)

## Reproduce

Start the production server with `npm run build && npm start`. In another terminal:

```sh
npx playwright install chromium
npm run verify:prototype
```

The scripts expect the server at `http://127.0.0.1:3000` and update the screenshots above. The touch check uses Chromium's touch emulation. A physical iPhone/Android test is still advisable before release.

## Scope and limits

This is Phase 1, not production performance acceptance. No physical-device/4G Core Web Vitals results are claimed. No original collection files are referenced by the new app. Native image lazy loading is used for the small placeholders; strict per-gallery intersection loading and production transfer/LCP/CLS/INP measurements remain Phase 3 work. Fullscreen interaction and image zoom remain Phase 2; archive and final content remain Phase 4.

The dependency audit reports five high-severity entries in one transitive lint-tool chain (`braces` → `micromatch` → `fast-glob` → Next ESLint tooling), plus two low-severity entries in the retained legacy Supabase tooling. None is imported into the exhibition's client code. Resolve these tooling advisories before production release; an automatic major-version framework downgrade was not applied.
