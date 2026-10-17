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

## Geographic phase (proposed only; awaiting approval)

Use a separate GeographicExplorer with country/city filters and an accessible semantic location list. Both feed ExploreGallery. Dynamically import an InteractivePhotoMap client component with SSR disabled, only when the geographic view is selected. A missing WebGL or tile connection must leave the list usable.

Recommend MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/ . Use a restrained ivory/espresso vector style, minimal controls and visible attribution. Agree the tile provider and its hosting/key terms before implementation.

Add an optional typed location object with stable location ID, ISO country code, country name, city name, longitude, latitude, and a coordinate-source/provider identifier or source URL. Coordinates must be validated for range and provenance against an authoritative source or geocoder. Group counts by stable location ID, derive available countries/cities only from actual photo records, and retain unknown locations in an explicit unlocated state. Existing records contain no location fields; no geographic values should be guessed from filenames, dates or chapter labels.

Future URL parameters: `view=map`, `country=ISO_CODE`, `city=LOCATION_ID`; initialize from and update the same URL state as the calendar. No map dependency or implementation is included in this phase.
