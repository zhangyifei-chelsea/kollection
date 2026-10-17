# Phase 2 verification

## Image pipeline

The later asset pipeline now processes **all 80 originals** and integrates all 80 derivatives into the existing four chapter galleries: 31 stage, 21 close appearances, 14 candid moments, and 14 distinctive looks. Exact original and optimized byte totals are generated in [image-pipeline-report.md](image-pipeline-report.md); per-image dimensions, paths, SHA-256, and file sizes are in `content/image-assets.json`.

Gallery derivatives are 2000px maximum long edge at WebP quality 90; fullscreen derivatives are 4000px maximum long edge at quality 94. Both sets embed an sRGB ICC profile, retain aspect ratios, rotate according to EXIF orientation, and exclude source metadata from public WebPs. Original files remain untouched. `content/photos.ts` contains only optimized public paths and the gallery display metadata.

## Browser checks

`npm run verify:phase2` passed against the production build on desktop and mobile touch emulation. `npm run verify:prototype` also passed at 320, 375, 390, 768, 1024, 1440, and 1920 CSS px; gallery height and aspect-ratio checks passed at every width, as did independent arrows, keyboard movement, vertical scrolling, touch scrolling, mobile navigation, and no-JavaScript content.

The initial page requested 7 gallery WebP files and no fullscreen files. With the first wall in view, 3 nearby images had loaded. Opening a photograph requested its fullscreen version. The checks cover PhotoSwipe captions and alt text, next/previous navigation, zoom, Escape, focus and gallery-position restoration, plus mobile touch swipe navigation. The responsive check regenerated the [desktop](preview-1440.png) and [mobile](preview-390.png) review captures.

To reproduce, run `npm run build && npm start`, then `npm run verify:phase2` and `npm run verify:prototype` in another terminal. The checks expect `http://127.0.0.1:3000`. If Playwright cannot find a local Chromium installation, install one with `npx playwright install chromium`.

## Performance concerns and limits

- Initial image traffic includes the optimized hero image and, after a wall enters the viewport, only nearby gallery images. The shared queue caps gallery requests at three. There are no fullscreen image requests before a lightbox opens.
- The static app package carries about **104.66 MiB of generated WebP files**, including the 89.31 MiB fullscreen set. This is much smaller than the 891.03 MiB source folder, but still a meaningful deployment upload. For publication at scale, place immutable derivatives in object storage/CDN and point the paths there. Originals remain excluded from version control and must not be deployed.
- The local checks use desktop Chromium and mobile touch emulation. They do not measure physical-device 4G Core Web Vitals. Image bytes and browser request counts are measured during verification; LCP/CLS/INP on representative hardware remain production QA.
- User-provided photo-use permissions and photographer credits must be confirmed before publication.
