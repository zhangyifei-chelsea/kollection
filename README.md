# Moments of K — Photography Exhibition

A responsive birthday photography exhibition built with Next.js App Router, TypeScript, and Tailwind CSS. The design and implementation source of truth is `Moments_of_K_Codex_Design_Spec.md`.

## Run locally

Use Node.js 22.13+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build && npm start`.

## Gallery assets

The exhibition contains all 80 photographs from the local `2026_final/` source collection across four chapters: 31 stage, 21 close appearances, 14 candid moments, and 14 distinctive looks. Source names, chapter assignments, alt text, mood tags, and known events are explicit in `content/photo-sources.json`; dates and photographer credits are read from image metadata when available. Unknown event details and dates stay empty.

The source originals remain in `2026_final/`, excluded from version control. `npm run images:build` validates and processes every source image, then regenerates `content/photos.ts`, `content/image-assets.json`, and `docs/image-pipeline-report.md` without modifying originals. Gallery WebP images are at most 2000px on the long edge at quality 90; fullscreen WebP images are at most 4000px at quality 94. Outputs use an embedded sRGB profile, preserve aspect ratios, and omit source EXIF/GPS metadata. The current 80 originals total 891.03 MiB; the 160 derivatives total 104.66 MiB (15.35 MiB gallery and 89.31 MiB fullscreen). See the [pipeline report](docs/image-pipeline-report.md) for exact byte totals.

The prior static gallery and its 450 MiB `photos/` archive are not part of this Next.js site. The archive remains in the local workspace but is ignored by Git. The current exhibition is served only from the optimized derivatives in `public/images/`.

At runtime, each horizontal wall uses its own IntersectionObserver. It loads nearby images from that wall within a 480px margin, while a shared queue limits concurrent gallery requests to three. Gallery dimensions are reserved from source metadata before loading. The homepage prioritizes its single entrance image; it requests no fullscreen images until a photo opens. PhotoSwipe and its core are dynamically loaded at that interaction, and PhotoSwipe preloads one adjacent image on either side.

If the original source collection is unavailable on another checkout, existing generated derivatives remain usable. Regenerating requires access to the ignored source images. Avoid deploying the originals.

## Structure

- `app/`: App Router page, shared layout, typography, photo-wall sizing and PhotoSwipe styles.
- `components/`: exhibition header, entrance, reusable chapter wall, progress and PhotoSwipe lightbox.
- `content/exhibition.ts`: ordered chapter and exhibition copy.
- `content/photo-sources.json`: deliberate local source selection and editorial metadata.
- `content/photos.ts`: generated typed image paths, intrinsic dimensions, derivative byte sizes and display metadata.
- `content/image-assets.json`: generated full manifest with original hashes and before/after image dimensions and file sizes.
- `lib/image-load-queue.ts`: shared three-request gallery loader.
- `scripts/generate-photo-derivatives.mjs`: reproducible all-source WebP, dimension, ICC-profile and size-report pipeline.
- `public/images/gallery/`: small WebP images for the walls.
- `public/images/fullscreen/`: larger WebP images loaded by PhotoSwipe.

## Interactions

PhotoSwipe provides fullscreen viewing, zoom and pan, left/right and Escape keyboard controls, touch swipe/pinch gestures, focus trapping and focus restoration. Captions show image ID, title, known event/date and available credit. Each wall remains a separate PhotoSwipe collection. Native gallery scroll positions persist when the lightbox closes. With JavaScript disabled, links open the gallery-sized WebP derivative.

The image files are personal photographs from the supplied local collection. Confirm final publication permissions and credits before deployment.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm run verify:phase2
```

The browser verification scripts expect the production site at `http://127.0.0.1:3000`. See [Phase 2 verification](docs/phase-2-verification.md) for the tested image-request behavior and responsive checks.

## Deploy to Vercel

Push this repository to the connected Git provider and import it into Vercel as a Next.js project. Use the repository root (`.`) as the Root Directory; keep the detected Next.js framework, install command, `npm run build` build command, and automatically detected output directory. Node.js 24.x is the recommended Vercel build runtime. This project currently requires no environment variables. Choose `2026_birthday` as the production branch if its deployments should receive the production domain; otherwise, deploy it as a preview first.

The original `2026_final/` files are ignored by Git and must stay out of deployments. The optimized public derivatives total 104.66 MiB. This is deployable as a static Next.js asset set, but it adds transfer and build/deployment weight; use object storage/CDN for the immutable derivatives if deployment size or global image delivery becomes a concern. Confirm photographer credits and publication permissions before making the exhibition public.

See [Production readiness review](docs/production-readiness.md) for the verified results and remaining device/network checks.
