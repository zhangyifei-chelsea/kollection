# Calendar presentation refinement

The calendar now uses a unified seven-column, square-cornered paper grid with single thin boundaries. SVG jigsaw outlines and their unused geometry helper were retired. `monthDays` and `shiftMonth` calculations are unchanged.

`TornPaperPhoto.tsx` reuses optimized gallery derivatives. A stable photo-ID hash chooses one of four static SVG silhouettes, restrained rotation, and occasional translucent tape. The image element keeps its original proportions with intrinsic sizing and maximum dimensions; only approximately the outer two percent is masked. A pale edge and lightweight shadow suggest exposed paper without a uniform white frame. Mobile removes rotation and tape. The full-screen viewer is unchanged and remains unmasked.

One shared deterministic paper-grain/fiber asset covers the calendar. The selected cell uses #344D69 under that shared texture. All six required colors remain unchanged.

Only calendar presentation, its obsolete geometry, and the associated checks were changed. Photo assets/metadata, date selection and navigation, memory/viewer behavior, other archive sections and the Mochamaru preview were not changed. No backend was restored or modified. No push or deployment was performed. The text attachment had no screenshots; the written visual direction was used.

## Verification

- PASS: `npm run typecheck`.
- PASS: `node tools/check-archive.cjs` and `node tools/check-photo-calendar.cjs`.
- PASS: `git diff --check`.
- PASS: browser inspection at 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×812, 320×640. Seven columns, 42 cells for the six-week August month, no horizontal overflow, square cell corners, loaded torn-edge masks at every viewport. Phone memories remain after the first viewport. Tablet memories remain below the complete calendar in normal flow.
- PASS: direct date click preserved scroll position (61.5px before and after); keyboard arrows changed selection; selected background settled at rgb(52,77,105).
- PASS: viewer image computed mask `none`, object-fit `contain`, fullscreen derivative source; arrow navigation and Escape worked.
- Screenshots: `test-results/calendar-refinement/desktop.png` (full page) and `mobile.png` (390×844).
- PASS: `npm run build` outside the restricted runner: successful webpack compilation, TypeScript validation, static generation for all 9 pages, optimization and traces.
- BLOCKED: `npm run lint` stalled during installed dependency reads in both restricted and unrestricted attempts. The unrestricted process used only about two seconds of CPU over six minutes and remained in dependency loading; stopped without a lint result. No lint success is claimed.

The legacy browser regression script was updated for the rectangular-cell selectors, mask checks and current local URL. The seven-size verification above used the connected browser directly, rather than claiming that script had completed.
