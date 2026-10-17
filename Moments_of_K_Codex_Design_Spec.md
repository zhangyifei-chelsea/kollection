# Moments of K — Birthday Photo Exhibition
## Design & Implementation Specification for Codex

**Version:** 1.0  
**Purpose:** Build a production-ready, responsive, fast, elegant online birthday photography exhibition.  
**Primary language:** English UI; content must support Japanese and Chinese Unicode.  
**Project status:** Specification; replace all placeholder images/copy before publication.

> **Instruction to Codex:** Treat this document as the source of truth. Implement the design and behavior described here rather than inventing a generic portfolio, masonry gallery, carousel landing page, or template. If a requirement conflicts with a library's defaults, prioritize the requirement. Make pragmatic choices where unspecified, document them, and do not silently remove features. Work incrementally, test each phase, and preserve responsive and accessibility behavior.

---

## 1. Project concept

Create an online birthday photography exhibition for K. It should feel like a contemporary photography museum combined with a restrained luxury editorial publication—not a fan photo dump, ecommerce site, dashboard, or flashy animation showcase.

**Signature layout:** A vertical document containing independently horizontally scrolling museum walls. Each chapter has its own heading, gallery strip, progress indicator, and controls. All images within a chapter wall share the same *rendered height*; their widths follow original aspect ratios. No image cropping in the main exhibition.

**Expected collection:** Approximately 70 photographs (range 50–100), including concerts/stage performances, fansigns/close portraits, candid moments, and mood-driven selections.

**Design values:** Photographs first; museum-like whitespace; understated typographic hierarchy; restrained transitions; authentic aspect ratios; fast first paint; simple, discoverable navigation.

### Non-goals
- No auto-playing image carousels or automatic chapter advancement.
- No forced vertical-wheel-to-horizontal-scroll interception.
- No masonry grid in the curated chapter walls.
- No heavy borders, large rounded photo corners, exaggerated gold gradients, parallax, or persistent motion.
- No loading 70 original 22 MB files at startup.
- No mandatory database, authentication, CMS, or user submissions in v1.

---

## 2. Site map and narrative

Single-page main exhibition with optional separate archive route:

1. **Entrance / Hero** — exhibition title, one representative photo, subtitle, date, unobtrusive “Explore the Exhibition” link scrolling to first chapter.
2. **Chapter 01: In the Spotlight** — stage/concert; approx. 25–30 photos; dark gallery background.
3. **Chapter 02: A Little Closer** — fansign/close portraits; approx. 18–25 photos; warm ivory background.
4. **Chapter 03: In Between** — spontaneous, playful, candid moments; approx. 10–15 photos; warm ivory background.
5. **Chapter 04: All the Colors of You** — curated moods and distinctive looks; approx. 10–15 photos; warm ivory background.
6. **Final Room** — “Happy Birthday, K.”, short message, photographer credits, project credits.
7. **Archive** — optional `/archive` page with all photos in a practical responsive grid and filters for event, year/date, mood. It is separate from the curated exhibition; not required for the first prototype, but data structures must support it.

Photo assignment: Each image has one primary chapter and multiple optional searchable tags. Do not duplicate images across the main curated chapter walls. Counts are approximate and must be data-driven.

### Navigation
- Minimal top bar: exhibition wordmark at left; `Exhibition`, `Archive` (when implemented), and `About`/`Credits` at right on desktop.
- Mobile: accessible compact menu; do not obscure photos.
- Anchor links to chapter IDs; optional small chapter index.
- Header should be understated, not a bulky sticky overlay.

---

## 3. Art direction and design tokens

### Color palette
| Token | Hex | Usage |
|---|---|---|
| `--canvas` | `#F4F0E9` | Main page / warm ivory museum wall |
| `--ink` | `#33271F` | Headings and primary text |
| `--muted` | `#877565` | Metadata and subtitles |
| `--line` | `#D4C9BC` | Hairline dividers |
| `--accent` | `#C5AA80` | Extremely sparing decorative emphasis |
| `--stage-bg` | `#222225` | Stage chapter |
| `--stage-ink` | `#F4F0E9` | Stage chapter text |

Keep chapter backgrounds unified except stage chapter. Do not use four unrelated chapter colors. Avoid gradients and decorative textures by default.

### Typography
- Display / chapter headings: `Cormorant Garamond` (preferred), fallback Georgia, serif. Large, light-to-medium weight, occasionally italic.
- UI / body / metadata: `Inter`, fallback system sans; for Japanese use `Noto Sans JP` fallback.
- Metadata: 11–12px, uppercase when appropriate, letter spacing 0.08–0.14em, muted color.
- Desktop chapter headings: clamp(56px, 6vw, 96px); mobile: clamp(36px, 9vw, 52px).
- Body text: 14–16px, comfortable line height.
- No more than two primary font families.

### Composition
- Desktop content max-width for text: 1200–1440px, centered.
- Hero has generous whitespace and one prominent photo, not text piled over a busy photo.
- Gallery strips may visually extend to the right viewport edge, beyond the aligned text column, communicating continuity.
- Photos are rectangular, no decorative rounded corners. Use zero radius or max 2px.
- Use very subtle photo shadow if needed; never heavy card UI.
- Horizontal separators: thin and low-contrast.
- Consistent museum-style metadata, e.g. `CHAPTER 01 / 04`, `28 WORKS`, `K — 001`.

---

## 4. Core horizontal museum-wall component

Build reusable `<ChapterGallery />` with props: chapter metadata, array of image records, theme (`light`/`dark`), and optional subtitle.

**Critical geometry:** Every image in the same chapter has the same *CSS height*, `width: auto`, `object-fit: contain`, `flex: 0 0 auto`, preserving intrinsic aspect ratio. Set width from image metadata before load to prevent layout shifts. A 3:4 photo at 450px height is 337.5px wide; a 4:3 photo is 600px wide; a 16:9 photo is 800px wide. The actual source photos may have other aspect ratios.

**Desktop (>= 1024px):**
- Gallery photo height responsive within ~400–520px, e.g. `clamp(400px, 36vw, 520px)`; tune for typical laptop screens.
- Horizontal gap 20–28px; suggested 24px.
- Chapter section total vertical space approximately 650–800px depending on viewport.
- Chapter vertical spacing 100–140px, except dark/light background boundaries can use larger padding.
- Show visible previous/next arrow buttons near gallery heading or below the strip; scrolling by roughly 70–85% of the gallery viewport per click (not by an arbitrary photo count).
- Support native horizontal trackpad scrolling, shift+wheel if browser supports it, scrollbar/drag as progressive enhancement; do not hijack ordinary vertical scrolling.
- Allow keyboard navigation when gallery controls or gallery region have focus.

**Mobile (< 768px):**
- Gallery photo height approximately 260–340px; use `clamp(260px, 72vw, 340px)` and adjust for very small screens.
- Horizontal gap 10–14px; suggested 12px.
- Chapter spacing 64–88px.
- Native touch swipe with `overflow-x: auto` and `touch-action: pan-x pan-y` as appropriate; page vertical scrolling must remain natural.
- Let part of the next image peek into view, indicating horizontal scrolling.
- No forced single-image paging; this is a continuous wall, not a conventional one-photo carousel.
- Optional arrows may be hidden on small screens if swipe affordance and progress remain clear.

**Tablet (768–1023px):** Intermediate gallery height and gaps; keep native horizontal scroll.

**Gallery interaction:**
- Scroll container: `display:flex; overflow-x:auto; overflow-y:hidden; scroll-behavior:smooth` for button-driven navigation, but respect reduced motion. Consider `scroll-snap-type: x proximity` only if it improves usability; avoid mandatory snap that makes long panoramas awkward.
- Native vertical page scroll always works when pointer is over the gallery.
- A thin progress line below each strip reflects `scrollLeft / (scrollWidth - clientWidth)`; hide/disable progress and arrows if there is no overflow.
- Optional `NN / TOTAL` label should represent the first substantially visible photo or be labeled clearly as progress, not an inaccurate page count.
- On hover (desktop) show restrained image label/caption; on touch do not rely on hover—metadata must be accessible in Lightbox.
- Click/tap photo to open Lightbox.
- Preserve each chapter's horizontal scroll position if a user opens/closes Lightbox or scrolls to another chapter.
- Do not render images in a way that crops stage lights, faces, or full-body compositions.

---

## 5. Hero / entrance

- Warm ivory full-width entrance, min-height approximately 85–100svh desktop; mobile adapt to content and viewport.
- Exhibition wordmark `MOMENTS OF K` (placeholder title editable in config).
- Editorial subtitle `A Birthday Photo Exhibition` and date `21 OCTOBER 2026` (editable).
- One curated hero photograph, ideally visually dominant with generous whitespace. Use a separate optimized asset, not an original 22MB file.
- Understated `EXPLORE THE EXHIBITION` anchor action.
- No auto-play video, heavy loading intro, or blocking splash screen.

---

## 6. Lightbox / full-resolution experience

Implement accessible Lightbox (PhotoSwipe recommended or equivalent). It must:
- Open when any wall image is clicked, with the selected image already identified.
- Initially show a usable gallery image immediately; load the higher-resolution asset on demand and swap seamlessly once ready.
- Load a `fullscreen` derivative (long edge ~3000–4000px) only when opened; optionally prefetch adjacent fullscreen images conservatively.
- Support desktop previous/next arrow keys, Escape to close, visible close button, touch swipe, pinch zoom, and zoom/pan on supported devices.
- Display image index and metadata (title/event/date/credit) unobtrusively.
- Restore focus to the triggering image on close, lock background scroll while open, and provide proper dialog semantics.
- Do not preload all 70 fullscreen files.
- Optional `View Original` link should be **explicit user initiated**, only when a publicly distributable original is available and permission allows it. Do not silently download originals.

**Important distinction:** Gallery uses compressed/optimized derivatives; Lightbox uses larger optimized derivatives. The 8000×6000 originals are stored separately and are not normal gallery requests.

---

## 7. Image optimization and performance

**Source situation:** ~70 photos, each ~8000×6000 pixels and ~22MB, totaling ~1.54GB. Loading them all at once is prohibited.

### Asset derivatives
| Variant | Target | Typical target size | Usage |
|---|---|---|---|
| `placeholder` | tiny blurred image or CSS color | < 5KB | Layout placeholder |
| `gallery` | long edge 1600–2000px | ~150–400KB | Exhibition strips and archive |
| `fullscreen` | long edge 3000–4000px | ~0.5–2MB | Lightbox |
| `original` | 8000×6000, ~22MB | unchanged | Private archival storage or optional explicit link |

These are targets, not guarantees. WebP quality ~80–85 for gallery and ~85–90 for fullscreen is a starting point; inspect skin texture, stage haze, saturated lights, shadows, and fine detail. AVIF may be evaluated, but compatibility and encode cost should be considered. Preserve EXIF orientation, avoid unexpected color profile changes, and strip sensitive EXIF location metadata from public derivatives.

### Loading strategy
- Pre-generate image variants at build/preprocessing time; do not depend on runtime resizing of 70 enormous originals.
- Render intrinsic width/height or aspect ratio in metadata to avoid CLS.
- Prioritize the hero and truly visible first-viewport assets only.
- Lazily load images in each horizontally scrollable strip using `IntersectionObserver` with that strip as `root` and a modest horizontal `rootMargin` (e.g. 300–600px). Native `loading="lazy"` may be used as a secondary mechanism; do not assume it perfectly matches nested horizontal visibility.
- Other chapters' images should not all download immediately because they exist in the DOM.
- Use a bounded number of simultaneous image fetches; prefetch the next 1–2 gallery images in the user's scroll direction.
- Use a CDN/object storage for image derivatives with immutable hashed filenames and long cache headers. Next.js/Vercel can host app; avoid bloating the app deployment with 1.54GB of originals.
- Set `decoding="async"`; reserve layout space; prefer responsive `srcset` where useful.
- Respect `prefers-reduced-motion`.
- Consider virtualizing gallery items only if real-device tests show DOM/performance issues; 70 optimized images in four strips should not require premature virtualization.

### Performance acceptance targets (measured, not promised)
- Aim for initial page transfer around 1–3MB on typical viewport (including hero, visible photos, CSS, JS); measure actual results.
- No request for full original image files during normal page load.
- No eager requests for all 70 gallery photos on first paint.
- Target Core Web Vitals: LCP <= 2.5s on representative fast mobile conditions, CLS <= 0.1, INP <= 200ms where measurable; document real results and device/network used.
- Test 4G throttling and mid-range phone, not just desktop broadband.

---

## 8. Data model

Use a simple typed TypeScript data source, no database in v1. Example:

```ts
export type Photo = {
  id: string;                 // e.g. "K-001"
  chapterId: 'spotlight' | 'closer' | 'between' | 'colors';
  gallerySrc: string;
  fullscreenSrc: string;
  originalSrc?: string;       // optional, never requested automatically
  width: number;              // original aspect-ratio dimensions
  height: number;
  alt: string;
  title?: string;
  event?: string;
  date?: string;              // ISO date where known
  credit?: string;
  tags?: string[];
  dominantColor?: string;
  blurDataURL?: string;
};

export type Chapter = {
  id: Photo['chapterId'];
  index: number;
  title: string;
  subtitle: string;
  theme: 'light' | 'dark';
};
```

Store chapter order in configuration, and photo order explicitly in data (or via an `order` field). Do not rely on filesystem enumeration. Use meaningful alt text and preserve author/photographer credits. Do not invent dates or event names.

Suggested directories:

```text
app/
  page.tsx
  archive/page.tsx                 # phase 4 / optional
  layout.tsx
components/
  SiteHeader.tsx
  ExhibitionHero.tsx
  ChapterGallery.tsx
  GalleryImage.tsx
  GalleryProgress.tsx
  ExhibitionLightbox.tsx
  FinalRoom.tsx
  ArchiveGrid.tsx                 # optional
content/
  exhibition.ts
  photos.ts
styles/
  globals.css
scripts/
  generate-images.mjs            # or Python script
public/
  images/gallery/
  images/fullscreen/
  images/placeholders/
```

Image derivatives may instead be on a CDN; paths in data should be configurable.

---

## 9. Accessibility and UX

- Semantic landmarks, headings in order, accessible names for all controls.
- All photo actions keyboard accessible, visible focus states.
- Avoid relying only on color or hover to communicate function.
- Lightbox traps focus while open and restores focus on close.
- Sufficient text contrast on warm and dark backgrounds.
- Provide useful image alt text; decorative assets can use empty alt.
- No scroll-jacking or forced animations; respect reduced motion.
- Keep touch targets around 44×44 CSS px.
- Provide fallback when JavaScript is disabled where feasible (photos and section content should remain accessible).
- Consider screen-reader labels for gallery controls and progress (e.g. `Scroll In the Spotlight gallery right`).

---

## 10. Responsive implementation details

Breakpoints are guidance, not arbitrary layout switches:
- Mobile: < 768px
- Tablet: 768–1023px
- Desktop: >= 1024px

Use `100svh`/`100dvh` carefully for mobile viewport units. Ensure no unintended horizontal overflow of the *document*; horizontal overflow must be contained in each gallery strip. Test at 320, 375, 390, 768, 1024, 1440, and 1920 CSS px widths.

Prevent content jumps when fonts and images load. Make progress bars responsive to resize and image load. A mouse/trackpad should never be trapped in a horizontally scrollable gallery.

---

## 11. Archive page (phase 4, optional)

Archive is a practical browsing tool, visually quieter than the main exhibition:
- Responsive grid (desktop 3–4 columns, mobile 2 columns where readable; adjust for portrait-heavy imagery).
- Filters: All, Concert, Fansign, mood tags; optionally date/event.
- Photos may be cropped *only in archive thumbnails if explicitly chosen*; preferred default is `object-fit: contain` or consistent thumbnail cells without destructive cropping.
- Reuse the same Lightbox and photo data.
- Filter state reflected in URL query parameters if feasible.
- Archive does not replace or duplicate the curated main-exhibition structure.

---

## 12. Final room and credits

Use a restrained closing page on ivory:
- `Happy Birthday, K.` as elegant display headline.
- One short editable dedication (placeholder only until user supplies final text).
- Photographer and project credits, image-use permissions where relevant.
- Minimal footer and link back to exhibition top.
- Avoid confetti, music autoplay, animated balloons, and decorative clutter.

---

## 13. Engineering stack

Recommended: **Next.js (App Router) + TypeScript + Tailwind CSS + PhotoSwipe + Vercel**.

- Use current stable compatible versions and pin dependencies.
- Keep data in typed local modules or JSON.
- Use a simple preprocessing script with Sharp to generate derivatives, record dimensions, and optionally blurred placeholders.
- Keep UI modular, not a single monolithic page component.
- Use native browser scrolling as the foundation; custom JS only for controls/progress/visibility.
- No Supabase required unless later adding CMS or uploads.
- Document environment variables only if CDN is used; do not commit secrets.

---

## 14. Implementation plan for Codex

### Phase 1 — Structural prototype
1. Initialize Next.js/TypeScript/Tailwind project.
2. Build design tokens, typography, header, hero, four chapters, final room.
3. Create 12–16 local placeholder photos with **mixed aspect ratios** and sample metadata.
4. Implement continuous equal-height horizontal galleries, responsive dimensions, progress bars, arrows.
5. Validate desktop/mobile scroll behavior and no unwanted document overflow.

**Acceptance:** Four vertically stacked sections; independent horizontal gallery scroll; photos equal-height and uncropped; mobile swipe works; vertical page scroll remains natural.

### Phase 2 — Lightbox and polished UI
1. Implement accessible PhotoSwipe Lightbox and keyboard/touch controls.
2. Add museum captions, numbering, progress, focus states.
3. Add restrained entrance/chapter animations with reduced-motion fallback.
4. Check dark stage chapter transitions and contrast.

**Acceptance:** Correct selected image opens; zoom/navigation/close works; returning to gallery retains scroll position; no autoplay.

### Phase 3 — Production images and performance
1. Create Sharp image preprocessing script.
2. Generate gallery/fullscreen derivatives and metadata from user originals.
3. Implement intersection-based loading within each gallery root and limited adjacent prefetch.
4. Configure CDN/cache strategy and verify network requests.
5. Test on mobile, slow network, and desktop.

**Acceptance:** No original assets loaded on initial visit; only visible/nearby gallery photos load; fullscreen files requested on interaction; no significant CLS; document measured load sizes.

### Phase 4 — Archive and content polish
1. Add `/archive` filters and reusable Lightbox.
2. Populate all ~70 records and curate ordering.
3. Add final credits and copy; verify permissions and accessibility.
4. Run responsive, performance, and interaction QA.

**Acceptance:** All images are discoverable, metadata is correct, filters work, and exhibition remains visually coherent.

---

## 15. QA checklist

### Visual
- [ ] Warm ivory main canvas and one dark stage chapter; no unrelated background themes.
- [ ] Editorial serif headings + restrained sans-serif metadata.
- [ ] Hero has generous whitespace and strong photo focus.
- [ ] All photos in each horizontal wall have identical CSS height.
- [ ] Images preserve original aspect ratio; no unintended cropping or distortion.
- [ ] Wall extends toward viewport edge with clear horizontal affordance.
- [ ] Photo captions and chapter numbers follow a consistent system.

### Interaction
- [ ] Each chapter scrolls independently left/right.
- [ ] Vertical scrolling between chapters always works.
- [ ] Arrow buttons and progress reflect actual scroll state.
- [ ] Touch swipe works on mobile without trapping vertical gestures.
- [ ] Clicking any photo opens its correct fullscreen asset.
- [ ] Escape/close/next/previous/zoom function in Lightbox.
- [ ] Lightbox close restores gallery position and focus.

### Performance
- [ ] No full original images in ordinary browsing network requests.
- [ ] Offscreen photos are lazy-loaded per horizontal container.
- [ ] Image dimensions are reserved before download.
- [ ] Derivatives served with suitable cache policy.
- [ ] No excessive first-load JavaScript or all-photo prefetch.
- [ ] Test and report real initial transfer size, LCP, CLS, and interaction behavior.

### Responsive / accessibility
- [ ] 320px phone, common phones, tablets, laptops, and wide desktops tested.
- [ ] No accidental page-level horizontal overflow.
- [ ] No illegible labels or tiny touch targets.
- [ ] Keyboard focus visible; reduced motion honored.
- [ ] Metadata and controls available without hover.

---

## 16. Initial prompt to give Codex

```text
Read Moments_of_K_Codex_Design_Spec.md in full and treat it as the source of truth for the project.

Build Phase 1 only first: a polished, responsive Next.js + TypeScript + Tailwind prototype for the birthday photography exhibition. The signature layout is FOUR vertically stacked chapters, each with ONE independently horizontally scrolling, continuous museum photo wall. All photos within a wall must have the same displayed height, natural aspect-ratio widths, and zero cropping. Include an editorial entrance, museum-style chapter headings, a dark stage chapter, warm ivory remaining chapters, scroll progress and arrows, and a restrained final room.

Use 12–16 clearly marked placeholder images with mixed landscape/portrait aspect ratios and local sample metadata. Do not invent actual event dates, real photographer credits, or final photos. Use accessible native scrolling; do not hijack the vertical wheel. Mobile swipe must work while vertical page scrolling remains natural.

Before coding, briefly describe your component structure and implementation plan. After implementing, run lint/type checks, inspect responsive behavior, and report which requirements are complete and which remain for Phases 2–4. Do not attempt all phases at once.
```

---

## 17. Open decisions (do not block Phase 1)

- Final title and copy; `Moments of K` is a working title.
- Final image ordering, credits, and permissions.
- Whether originals should ever be publicly accessible.
- Archive launch in v1 or after the birthday exhibition.
- Whether to include Japanese-language copy in the first release.

**Success criterion:** The result should feel like an elegant, fast, responsive photography exhibition with four independently scrollable museum walls, not a generic photo portfolio template.
