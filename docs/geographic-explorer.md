# Geographic Explorer

## Investigation on 2026_birthday

At the start of this change, Geography was not hidden or partially implemented. `docs/explore-architecture.md` explicitly deferred it for Calendar approval. There was no map component, geographic filter UI, map dependency, verified location registry or photo location field. The user has now approved implementation and demonstration data.

## Access and interaction

Open `/explore?view=map`, or choose Explore → By place / Geographic Explorer. By date continues to render the existing CalendarExplorer. The main exhibition and its four chapter walls are unchanged.

GeographicExplorer derives countries/regions, cities and photograph counts from actual assigned photos, never from unused city records. Country and city selects, the city list, and map markers share URL state (`view=map`, `country=JP`, `city=tokyo`). Back, forward and direct links restore the selection. Existing calendar date/month parameters survive switching views.

The interactive map is lazy-loaded with `next/dynamic` and SSR disabled inside a client component. It uses a local SVG land asset with the same equirectangular projection as the GeoNames coordinates. No map service, API key, runtime tile requests, native map dependency or WebGL is required. This replaces the earlier MapLibre proposal for the small city set and keeps the bundle and visual styling restrained.

Markers have 44px hit targets and photograph counts. Nearby cities cluster at world scale without falsifying individual city coordinates. Selecting a cluster zooms to it; selecting a city shows that city's photographs in ExploreGallery. Buttons, keyboard +/−, arrow keys and Home support map navigation. Touch pan is opt-in so normal vertical scrolling works by default. The country/city selectors and city list always provide an alternative to dragging or clicking a marker. The existing GalleryImage, image load queue, and PhotoSwipe Lightbox are reused.

## MOCK LOCATION DATA — replacement instructions

`content/mock-photo-locations.ts` is deliberately separate from the generated photographs and all verified metadata. It contains:

- `enableMockLocations`: set to false to disable all demonstration assignments.
- `mockLocations`: six real city coordinate records whose **photo associations are fictional**, all with `source: 'mock'` and GeoNames coordinate-source URLs.
- `mockPhotoLocationIds`: deterministic photo-ID assignments, stable if the photo array is reordered.

The UI displays a persistent demonstration notice and marks mock city entries and selected results. No fictional assignment is written to `content/photos.ts` or to the originals. Counts for the current collection: Seoul 14, Tokyo 14, Osaka 13, Los Angeles 13, Hong Kong 13 and Shanghai 13 (80 total).

To replace demonstration data:

1. Add confirmed cities to `content/photo-locations.ts` → `verifiedPhotoLocations`, with `source: 'verified'`, ISO country code, accurate WGS84 longitude/latitude and an HTTPS coordinate-source URL.
2. Add each confirmed photo's `locationId` to its record in `content/photo-sources.json`; the derivative generator now preserves this field in generated photo metadata. For immediate metadata editing, the optional field is also accepted by the shared Photo type. Only assert a verified ID after checking the capture assignment.
3. Set `enableMockLocations` to false when ready to release real locations. A verified photo ID takes precedence; an unknown verified ID is kept unlocated rather than silently converted to mock. Missing/invalid locations are available through Location unknown. Unused cities never appear on the map or in filters.

Keep location IDs stable to preserve shared links. The registry validation rejects missing labels/codes/source URLs, non-finite coordinates, and coordinates outside geographic bounds.

## Geography sources and regeneration

- Land geometry: Natural Earth 1:110m land polygons, public domain, packaged by world-atlas 2.0.2: https://www.naturalearthdata.com/about/terms-of-use/ and https://github.com/topojson/world-atlas . The generated SVG includes attribution and has no political boundary styling.
- Coordinates: GeoNames, CC BY 4.0. Each city record links its exact source. Attribution and a license link appear beneath the map.
- Regenerate `public/maps/world-land.svg`: obtain `land-110m.json` from the pinned world-atlas 2.0.2 package, then run `node scripts/generate-world-map.mjs /path/to/land-110m.json`. The development-only TopoJSON Client decodes original arcs and D3 Geo handles spherical date-line clipping before projecting actual coordinates; it does not hand-draw geography.

## Local commands

- `npm run typecheck`
- `npm run lint` (now includes lib)
- `npm run build`
- `npm run verify:geography:data`
- Start a local production server, then run `EXPLORE_BASE_URL=http://127.0.0.1:3000 npm run verify:geography`.
- Browser checks need the matching Playwright Chromium runtime (`npx playwright install chromium`). `PLAYWRIGHT_BROWSERS_PATH` can point to a temporary installation; optional `PLAYWRIGHT_CHANNEL` selects a browser channel.

The browser check covers all six city lists/counts, country/city filters, markers and clustering, direct links/history, Lightbox loading and focus, map keyboard controls, mobile touch-pan toggle, invalid URL filters, returning to Calendar, and overflow across seven widths. Review screenshots are saved in docs/geographic-review.

## Local environment repair

The previously installed dependency tree and build cache repeatedly stalled, including on the committed pre-feature baseline. A clean temporary installation from the unchanged package lock completed builds successfully. The fresh dependency tree was then placed in the repository; the prior tree and cache are preserved under ignored `node_modules/.previous-installation` and `node_modules/.previous-next-cache`. The existing application dependency versions did not change. Development-only D3 Geo and TopoJSON Client were subsequently added to regenerate correctly clipped map geometry; neither is imported by client components. A missing Playwright headless browser was installed separately under `/private/tmp/kollection-playwright-browsers` for testing. This demonstrates a workable local environment without claiming an exact OS-level cause for the old stall.

## Refined initial framing and calendar window

The calendar is restricted to the inclusive window October 2025–October 2026. Month/year options, arrow buttons, URL-derived dates and months, and keyboard day/week/month movement all enforce this window.

The map uses Pacific-centered equirectangular land geometry and marker coordinates. Its default camera is 180° longitude, 25° north at 2× zoom: a half-world view covering 90°E through 90°W, with Asia on the left and the American west coast on the right. Home and Pacific reset to this view; World and zoom-out remain available for the full map. The bundled SVG generator rotates and clips the same coordinate system used by city markers.
