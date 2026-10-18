# Archive Map and randomized demo locations

The user requested a random location for every photograph and a complete Map module. All 80 photos now have stable pseudorandom demo assignments across the existing six-city coordinate registry: Tokyo 20, Hong Kong 16, Osaka 13, Los Angeles 11, Seoul 11, Shanghai 9. A deterministic photo-ID hash replaces the prior sequential round-robin assignment. Refreshes and source ordering do not reshuffle locations.

Assignments remain in the separate mock registry and do not overwrite original/verified metadata. `displayPhotoLocation` gives any explicit verified location priority; a supplied invalid verified ID remains unknown. Map, main-photo information, fullscreen information and city-name search use this common display resolution. Every fictional assignment is labeled as a demo in both Map and photo details.

## Completed interactions

- Local Pacific-centered world map, matching cool archive colors, with Natural Earth geography and existing GeoNames coordinate attribution.
- Zoom controls, world/Pacific reset, pointer pan, opt-in touch pan, keyboard pan/zoom/Home, nearby-city marker clustering.
- Click a cluster to reveal cities, click a city marker or list button to filter its photographs.
- Country/region filter; clear/all-location actions reset the map camera as well as relevant filters.
- City/photo counts, original-photo gallery, fullscreen viewer with location information and previous/next controls.
- Direct `/map` route and existing sidebar Map navigation.
- City-name search now finds photos using these same demo assignments.

## Files

`components/archive/ArchiveMap.tsx`, `lib/display-photo-location.ts`, `content/mock-photo-locations.ts`, `components/archive/Archive.tsx`, `components/archive/PhotoDetails.tsx`, `components/archive/archive.css`, `public/maps/world-land.svg`, `tools/check-archive-browser.cjs`, this report. Existing `InteractivePhotoMap.tsx` and geography utilities were reused without replacing their interaction algorithms. No new map service, external API key, backend, vote integration, photo files or original capture dates were added/changed.

## Browser verification

- Map starts with 6 cities and all 80 photographs. Tokyo list selection returns 20; Japan country filter returns 33 across Tokyo and Osaka. Cluster expansion reveals Tokyo/Osaka, Tokyo marker selection returns the same 20. Clear filters restores 80.
- A map photo opens in the existing fullscreen viewer with Tokyo and the explicit demo label; Escape closes.
- Touch pan toggles aria-pressed; zoom/world/Home controls respond. Coordinates/geography stay at their true city positions; only photo associations are fictional.
- Direct `/map` navigation preserves all city-assignment counts.
- 1440×900, 768×1024, 390×844 and 320×640: no horizontal overflow; six city options and 80 photos remain available; map keeps usable controls and phone height of at least 350px.
- Actual screenshots: `test-results/archive-map/desktop.png`, `mobile.png`.

Existing geographic data tests pass, including all 80 assignments, six populated groups, verified precedence, unknown/disabled/invalid handling, projection and clustering. TypeScript passed. Final build/lint outcomes are recorded in the task response. Nothing pushed or deployed.
