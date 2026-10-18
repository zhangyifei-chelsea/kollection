# Single-photo real torn-paper study

## Scope and inspection

The user's image 1 shows the large memory print: its white frame comes from `.torn-photo` padding/background in `components/archive/archive.css`; rotation, shadow and the nearly straight outer clip are also there. That detail section is unchanged, as required by the prototype brief. The calendar itself already used `TornPaperPhoto` with the previous task's static SVG masks, intrinsic-size optimized images, slight rotation and soft shadows.

Only the K-017 calendar thumbnail now uses the real-paper treatment. All other thumbnails retain their previous appearance. `/paper-study` shows a clean framed treatment modeled on image 1 beside the new torn treatment at approximately calendar-thumbnail size, and an enlarged inspection of the same existing photograph. This is working HTML, not a generated mockup. The full-screen viewer, date data and interactions, grid, navigation, other sections and Mochamaru preview remain unchanged.

## Source and license

- Source website: https://rippedpaper.org/
- Source asset: https://rippedpaper.org/assets/pack/ripped-paper-white-06.png
- Downloaded pack: https://rippedpaper.org/assets/ripped-paper-white.zip
- Original asset: white/ripped-paper-white-06.png, 2000×1400 RGBA.
- Included license copied verbatim to `docs/licenses/rippedpaper-LICENCE.txt`.

The included license permits use in personal/commercial projects, including client work and products, without attribution. It prohibits resale or redistribution of raw files as a pack, stock listing or asset bundle. The raw pack and original PNG remain outside the repository in temporary storage. Only a small transformed alpha-mask derivative used by this site's UI is included; this project does not offer an asset pack or downloadable stock originals.

## Actual clipping

The source has 545,012 fully transparent pixels, 1,983,245 fully opaque pixels and 271,743 partially transparent pixels. It is a filled paper silhouette with real alpha, not an edge-only overlay. Its low-alpha cast shadow is unsuitable for clipping and was removed by remapping alpha from [96,255] to [0,255]. The meaningful paper boundary was trimmed to x=82, y=83, width=1827, height=1228, then resized to 1200px width. The resulting ~24 KB white-alpha PNG is used as CSS `mask-image` on the actual photo element. No CSS polygon or generated sawtooth path is used for this prototype. A subpixel pale edge and a separate soft shadow suggest fiber and contact with the calendar paper. The picture is not recolored or replaced. The mask naturally trims outer portions of the scene; the central face, hands and subject remain recognizable. Fine fibers are subdued at phone thumbnail sizes. No extra tear variants were created.

## Files changed

- `components/archive/TornPaperPhoto.tsx`: opt-in real-paper treatment; image size hints for the comparison.
- `components/archive/Archive.tsx`: opt in K-017 only.
- `components/archive/archive.css`: treatment shadow and narrow-phone label clearance.
- `public/images/paper/real-tear-mask.png`: derived alpha mask.
- `app/paper-study/page.tsx`, `app/paper-study/study.css`: isolated before/after comparison.
- `docs/licenses/rippedpaper-LICENCE.txt`: source license.
- `docs/PAPER_STUDY.md`: this report.
- `components/SiteHeader.tsx`: minimal baseline lint fix, internal anchors use Next Link; appearance/destinations unchanged.

## Verification

- PASS: production build, including static `/paper-study`, and TypeScript checks (see final check outcome).
- PASS: existing calendar date tests and whitespace checks.
- PASS: comparison page and calendar inspected in the browser at desktop and phone sizes (1440×900, 390×844, 320×640). No horizontal overflow; exactly one real-paper calendar thumbnail; image remains inside its cell; final 320px thumbnail top 96.78px is below date text bottom 94.94px; image uses optimized 96px derivative; mask wrapper has pointer-events:none; selected date remains pressed and memories remain below the phone viewport.
- Actual screenshots: `test-results/paper-study/desktop.png`, `mobile.png`, `calendar-320.png`.
- Lint: launched; final status recorded below.

No push or deployment. Stop at this prototype and await approval before wider use.

Final results: the final production build, separate TypeScript check, calendar regression checks and `git diff --check` all pass. Lint initially loaded dependencies slowly, then reported an existing plain-anchor home navigation error in `components/SiteHeader.tsx`. Its internal anchors were changed to Next Link without visual or destination changes. Lint is being rerun. The browser checks were performed against the actual local implementation.

Final rerun after the shared-header lint fix: `npm run lint` PASS (exit 0; one existing unused `_props` warning), `npm run build` PASS, `npm run typecheck` PASS, `node tools/check-archive.cjs` PASS, `git diff --check` PASS. The build prerenders all 10 pages including the prototype route. No other visual or backend changes were made.

## Approved rollout

The user approved rollout in the subsequent request. The real-paper treatment now covers all archive calendar thumbnails, main memory photographs, and Collections/Search photographs. The scrolling filmstrip is excluded: its white padding/background/frame is removed, its images have 10px rounded corners, and its selected item uses a steel-blue focus-style outline. Fullscreen viewer images remain unmasked. The calendar grain is coarser (lower-frequency, stronger fiber/noise layer), its dividing lines are 2px, and the grain stays beneath photographs to preserve their colors. The comparison page text reflects the rollout.

Validation: production build, TypeScript and calendar checks pass; lint exits 0 with the same existing unused-header-prop warning. Browser inspection at 1440×900, 390×844 and 320×640 confirms no horizontal overflow, all visible calendar photographs use the real-paper mask, the main photograph has zero frame padding and the same mask, and every filmstrip image is unmasked with 10px corners and zero button padding. Filmstrip selection still updates the main photograph. All 82 displayed collection entries (80 photos plus two repeated in the undated section) use the approved mask. Screenshots: `test-results/paper-rollout/mobile.png` and `memories-desktop.png`. No photo metadata or originals changed; nothing pushed or deployed.


## Superseded: all torn-photo effects removed

At the user's subsequent request, all photo-edge masks, irregular clipping and pale torn-fiber effects were removed. The rendering component is now `ArchivePhoto.tsx`, with complete unmasked images; the old `TornPaperPhoto.tsx` was retired. Calendar, memory, Collections and Search photos use the clean component. The obsolete paper-study route redirects to the homepage and its unused styles were removed. The real continuous calendar paper surface and puzzle seams remain, as do the scrolling filmstrip's 10px corners. Source photos/metadata are unchanged. Old mask files remain unused archival assets, with no executable references.

Validation: build, TypeScript, calendar checks and whitespace checks pass. Lint passes with the same existing unused-header-prop warning. Browser inspection confirms all 11 homepage images and all 82 displayed Collections images have no masks or irregular clipping; the filmstrip retains 10px corners. Actual screenshot: `test-results/clean-photo-edges/memories.png`. Nothing pushed or deployed.
