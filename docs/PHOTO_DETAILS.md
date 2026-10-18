# Photo information and tags

The large memory photograph now has a quiet information block beside it on desktop and below it on mobile, following the supplied reference's numeric date, location icon, handwritten annotation and pale paper tag styling. The fullscreen viewer reuses the same component, so Collections/Search photos also expose their information when opened. Both places update from the current photograph when using the filmstrip or viewer arrows.

## Data accuracy

`PhotoDetails.tsx` formats existing verified capture dates as YYYY.MM.DD (DAY), using UTC only to render a literal date without shifting it. Locations resolve only through `photo.locationId` and `verifiedPhotoLocations`. `event` supplies the actual event name; newly supported optional `eventType` and `captureTime` fields supply a confirmed event category and local capture time text. The generator now carries these explicit fields through from the source manifest, without rerunning or replacing images.

The current registry has capture dates and editorial content tags but no verified photo locations, event names, event types or curated exact times. The UI therefore explicitly shows pending-curation placeholders for those fields. Existing live/stage/portrait etc. tags are labeled as content, not misrepresented as confirmed event categories. The sample reference's Tokyo/Concert/date/poem are not assigned to any actual photograph. No photo record, original, image derivative, database or credentials were changed.

## Files

- `components/archive/PhotoDetails.tsx`: shared date/location/event/tag rendering and missing-data states.
- `components/archive/Archive.tsx`: main-photo info and fullscreen-viewer integration.
- `components/archive/archive.css`: responsive information layout, handwritten event annotation, subtle tags, dark-viewer variant.
- `content/photo-model.ts`: optional event category and local-time fields.
- `scripts/generate-photo-derivatives.mjs`: preserve those explicit curated fields during future generation.

## Validation

Browser inspected at 1440×900, 390×844 and 320×640: no horizontal overflow; desktop sidebar and phone stacked layout; viewer remains scroll-locked with accessible photo info; Escape closes. Switching from K-017 to K-072 updated the real content tags (live/stage → playful/style/expression); viewer previous-arrow navigation updated them back. Native screenshots: `test-results/photo-details/desktop.png`.

Separate TypeScript, calendar checks, generator syntax check and whitespace checks pass. Final build/lint status is recorded in the task response. No push or deployment.

Final results: production build PASS, TypeScript PASS, calendar checks PASS, generator syntax PASS, whitespace PASS. Lint remained stalled without diagnostics during dependency loading and was stopped; no lint success is claimed for this change.
