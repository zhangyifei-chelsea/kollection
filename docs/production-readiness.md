# Production readiness review

Reviewed against the production build on 17 October 2026. The page was served locally and inspected in the in-app Chromium browser. This is a code and browser review; it is not a Vercel deployment or a real-device field test.

## Verified

- `npm run lint`, `npm run typecheck`, and `npm run build` passed. Next.js 16.4.2 generated the `/` route as static content. The existing `vercel.json` selects the Next.js framework.
- The responsive layout was measured at 375, 390, 768, 1024, and 1440 CSS px. No page-level horizontal overflow appeared. Each of the four gallery strips overflowed independently and every image in a strip had one shared rendered height: 270, 281, 340, 400, and 518 CSS px at those widths respectively. All 80 image aspect ratios matched their source metadata within the check tolerance.
- Gallery controls and keyboard movement scrolled their own walls independently. A PageDown/scroll gesture moved the vertical document. A photo opened PhotoSwipe and the close control dismissed it while returning focus to the selected photo.
- A fresh 1280px page load exposed one loaded image asset: the optimized K-001 hero. No fullscreen or original image URL was present. The hero gallery WebP is 369,076 bytes. An opened image in the in-app accessibility tree is named, and its gallery link describes its full-screen action.
- Accessibility spot checks found one main landmark, one page-level heading, two navigation landmarks (desktop and mobile variants), no duplicate IDs, no missing image `alt` attributes, and no unnamed buttons. The inspected browser console contained no errors or warnings.
- All 160 paths in the generated image manifest exist in `public/`, and every file size matches its manifest entry. The client-facing image URLs point to WebP derivatives; original JPEG/TIFF URLs are absent from the rendered page.
- On ivory, the muted text color was adjusted slightly darker to `#756354` to achieve 5.04:1 contrast. The dark chapter retains its lighter muted color, which measures 7.02:1 against the stage background. Layout and palette direction are unchanged.

## Performance and deployment considerations

- The 80 originals total 891.03 MiB. The 80 gallery derivatives total 15.35 MiB and the 80 fullscreen derivatives total 89.31 MiB; all 160 derivatives total 104.66 MiB, an 88.25% reduction against the original collection. The fullscreen assets are requested only when a visitor opens a photograph.
- The cold-load browser inventory showed only the hero image, but it did not expose reliable transferred-byte totals for JavaScript, CSS, fonts, or the whole document. The 1–3 MiB first-load target, LCP, CLS, and INP are therefore not claimed as measured results.
- The existing Playwright scripts could not be freshly run here: the bundled Playwright browser is absent, and launching the installed desktop Chrome through Playwright aborted. The responsive and interaction checks above were performed in the in-app browser instead. Native touch swipe/pinch was not re-tested on a physical mobile device or touch-emulated browser. Nor was a throttled 4G/CWV session run.
- The static build passed locally, but no Vercel deployment was created. The derivative set is a substantial deployment payload even though visitors do not download it all. Keep `2026_final/` excluded; for a larger public rollout, move immutable derivatives to object storage/CDN and use those paths in the photo manifest.
- The supplied photographs' publication permissions and final photographer credits remain a human content approval item. The closing room labels that accurately instead of claiming that permission is cleared.

## Deployment

Import the repository in Vercel with the repository root as the Root Directory. Keep the Next.js framework detection and default build/output settings; the `build` script is `npm run build`. Node 24.x is recommended, and no environment variables are required for the current exhibition. Select `2026_birthday` as the Production Branch only if this branch should serve the production domain; otherwise, deploy it first as a preview. Do not include the private `2026_final/` sources. See the project [README](../README.md#deploy-to-vercel) and Vercel's [build configuration](https://vercel.com/docs/builds/configure-a-build) and [Node.js version](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) guidance.
