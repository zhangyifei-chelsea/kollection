# Explore

The exhibition remains at `/`; Explore is a separate `/explore` route. Only the shared navigation gains a link. The four curated walls and hero are preserved.

## Calendar (implemented for review)

- `content/photo-model.ts`: shared Photo type, re-exported by generated photos.ts for compatibility. The image generator preserves this shared model.
- `lib/photo-calendar.ts`: strict date validation, UTC date arithmetic, metadata-derived date index and unknown-date bucket.
- `CalendarExplorer`: independent calendar, month/year navigation, arrow/day/week keyboard movement, Home/End and Page Up/Down, counts, and date selection. Initial selection is the latest recorded date. Month navigation preserves the selected result until a new date is chosen.
- `ExploreGallery`: reusable responsive results grid using existing GalleryImage and the bounded image queue with viewport intersection loading. Photos retain natural aspect ratios.
- `ExhibitionLightbox`: existing PhotoSwipe implementation, additionally bound to Explore's gallery. No new Lightbox implementation.
- URL state: `date=YYYY-MM-DD` (or `unknown`) and `month=YYYY-MM`. Native history integrates with Next useSearchParams, including back/forward. Invalid dates/months use metadata-derived defaults; other query parameters survive changes.
- Dates without photographs remain selectable. Missing/invalid photo dates are grouped as Date unknown, without inventing capture dates. If no dates exist, the calendar remains usable with a neutral January 2026 view and empty state.

Required photo fields already exist: ID, ISO capture date when known, derivative paths/dimensions, title, alt text, optional event and credit. Current dates originated in the existing derivative pipeline; Explore does not reinterpret them.

## Geographic phase (implemented after approval)

The approved Geographic Explorer is accessible through Explore → By place, or `/explore?view=map`. See [Geographic implementation and mock replacement guide](geographic-explorer.md).

GeographicExplorer provides URL-backed country/city filters and a semantic city list; InteractivePhotoMap is a separate lazy client component. It uses a local Natural Earth SVG and coordinate projection with pan, zoom and marker clustering. This lightweight implementation needs no map API key, tile service or WebGL. The earlier MapLibre proposal was replaced for this small city collection.

Photo metadata now accepts an optional verified locationId. Verified locations and clearly labeled mock photo assignments live in separate typed modules. Invalid/missing locations are unlocated, and only locations with actual assigned photographs appear. Both explorers reuse ExploreGallery and ExhibitionLightbox.
