# Calendar Explorer verification

Implemented for review at `/explore`. Geographic Explorer is deliberately deferred pending Calendar approval.

## Passed

- `node tools/check-photo-calendar.cjs`: strict date parsing, leap-year validity, year rollover, metadata indexing across multiple years, per-date counts, missing/invalid dates, and an empty collection.
- TypeScript transpilation syntax checks for the new route, CalendarExplorer, ExploreGallery, SiteHeader, ExhibitionLightbox, shared Photo model, generated data, and calendar utilities: no syntax diagnostics. This is not a substitute for full type checking.
- `node --check tools/check-explore.cjs` and `node --check scripts/generate-photo-derivatives.mjs`.

## Unresolved environment verification

`npm run typecheck`, `npm run lint`, and `npm run build` started but stalled without a completion result or error diagnostics. Direct/scoped type and lint attempts also did not complete. `npm run dev` likewise did not reach a listening preview; an HTTP check confirmed nothing listening on port 3000. These tasks were interrupted after repeated checks. The root cause is unconfirmed.

Browser checks were prepared in `tools/check-explore.cjs` but could not complete. No responsive screenshots or browser success results are claimed. With a working server, run `node tools/check-explore.cjs` (or set EXPLORE_BASE_URL). It checks direct links, URL history, counts, empty/invalid dates, year changes, arrow-key focus, Lightbox opening/closing and focus, deferred fullscreen requests, console errors, and document overflow at 320, 375, 390, 768, 1024, 1440, and 1920 pixels. It also saves desktop/mobile review screenshots.

Re-run the existing prototype and phase-2 regression checks against a working server as well. Manual touch, screen reader, reduced-motion and visual review remain outstanding.

## Review behavior

- Latest photographed date is selected by default.
- Month/year navigation browses the calendar without clearing the selected day's photographs; selecting another day updates results.
- Empty days can be selected and show an explanatory state.
- If missing or malformed capture dates occur, a Date unknown control appears with its actual count.
- Shared links use date and month query parameters; unrelated parameters are preserved.
- Existing homepage composition and chapter components are unchanged; header navigation gains Explore.
- Shared Photo type was extracted to photo-model.ts and preserved by the generator.

## Blank homepage investigation

A direct HTTP request to the user's localhost:3000 server connected, but received zero bytes and timed out after ten seconds. This establishes that the blank window was waiting for a server response rather than displaying an empty React render.

A macOS stack sample of that server showed its main thread in `node::binding::DLOpen` → dyld native-library loading → `fcntl` while mapping/validating a library. The Next SWC native binary was among its mapped files. This points to native dependency initialization; it does not establish exactly why macOS was waiting or prove a particular binary is defective. A separate direct SWC require completed in approximately 633 ms.

The homepage does not import CalendarExplorer or ExploreGallery. Its shared-component changes are navigation links, an additional Lightbox gallery selector, and a type-only Photo model extraction. No cause for the no-response symptom was found in those changes. The calendar data checks passed again. Full type checking again did not complete, so overall application verification remains unresolved.

Two agent-owned diagnostic servers were found and stopped. The user's terminal server was left under the user's control. The earlier Ready message was not sufficient evidence of a functional preview.

## Verification before commit — 18 October 2026

Re-ran local verification before committing and pushing the Calendar feature.

Passed:
- Calendar data checks (`node tools/check-photo-calendar.cjs`).
- JavaScript syntax checks for the Explore browser test and image generator.
- `git diff --check`.

Incomplete, not passed:
- `npm run typecheck`, `npm run lint`, and `npm run build`: remained running without completion or error diagnostics for several minutes, then were interrupted.
- Scoped TypeScript checks against the application source folders and checks using the bundled newer Node runtime also did not complete. Therefore scanning the photograph folders has not been established as the cause.
- `node tools/check-explore.cjs`: did not produce browser verification results and was interrupted. No responsive or Lightbox browser acceptance is claimed.

Compared the committed baseline (`fe75675`) with the current implementation in separate temporary folders and independent build caches, sharing the same installed dependencies and image assets. The baseline contained only committed source files and no Explore route. Started the two previews on ports 3100 and 3101; both stalled before accepting local HTTP connections. Direct homepage requests to each returned HTTP 000 with zero bytes because neither port was listening. Both diagnostic servers were stopped afterward.

This comparison reproduces a startup problem without the new feature. It does not establish the exact environmental cause or prove that every new interaction is correct. The previously observed macOS native-loader wait remains relevant evidence, not a confirmed explanation for every stalled command. Production build and browser acceptance remain required before release.

Only Explore-related source, test, architecture, and verification files are intended for this commit. Unrelated design asset changes remain outside it. Map implementation remains deferred for Calendar approval.
