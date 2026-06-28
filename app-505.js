const supabaseConfig = window.KOLLECTION_SUPABASE || {};
const state = {
  search: "",
  year: "all",
  order: "asc",
  photos: []
};

const searchInput = document.querySelector("#searchInput");
const yearFilter = document.querySelector("#yearFilter");
const orderFilter = document.querySelector("#orderFilter");
const resultCount = document.querySelector("#resultCount");
const sourceStatus = document.querySelector("#sourceStatus");
const galleryGrid = document.querySelector("#galleryGrid");
const emptyState = document.querySelector("#emptyState");
const heroPreview = document.querySelector("#heroPreview");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxText = document.querySelector("#lightboxText");
const lightboxPost = document.querySelector("#lightboxPost");
const closeLightbox = document.querySelector("#closeLightbox");
const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-nav]")];
const homePhotoCount = document.querySelector("#homePhotoCount");
const designCanvasElement = document.querySelector("#designCanvas");
const fabricStatus = document.querySelector("#fabricStatus");
const designBgColor = document.querySelector("#designBgColor");
const designSwatches = document.querySelector("#designSwatches");
const exportDesignButton = document.querySelector("#exportDesignButton");
const clearDesignButton = document.querySelector("#clearDesignButton");
const deleteSelectedButton = document.querySelector("#deleteSelectedButton");
const bringForwardButton = document.querySelector("#bringForwardButton");
const sendBackButton = document.querySelector("#sendBackButton");
const designAddButtons = [...document.querySelectorAll("[data-design-add]")];
document.documentElement.dataset.appBuild = "english-date-labels-1782669600000";

const designState = {
  fabricCanvas: null,
  initializing: false
};

const designPhoto = "photos/2026-06-18/260618-2067613846605615000-01.jpg";

function hasSupabaseConfig() {
  return Boolean(
    supabaseConfig.url &&
      supabaseConfig.anonKey &&
      !supabaseConfig.url.includes("YOUR_") &&
      !supabaseConfig.anonKey.includes("YOUR_")
  );
}

async function loadSupabaseClient() {
  if (window.supabase) return window.supabase;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  return window.supabase;
}

async function loadPhotos() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await loadSupabaseClient();
      const client = supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
      const { data, error } = await client
        .from("photos")
        .select(
          "id,date_code,photo_date,post_text,caption,post_url,original_url,cached_url,local_path,sort_index"
        )
        .order("photo_date", { ascending: true })
        .order("sort_index", { ascending: true });

      if (error) throw error;

      state.photos = data.map(normalizeDatabasePhoto).filter(Boolean);
      sourceStatus.textContent = "Supabase source";
      initialize();
      return;
    } catch (error) {
      sourceStatus.textContent = "Static fallback";
      console.warn("Supabase gallery load failed", error);
    }
  }

  const staticItems = await loadStaticGalleryData();
  state.photos = normalizePostEntries(staticItems);
  sourceStatus.textContent = "Static source";
  initialize();
}

async function loadStaticGalleryData() {
  const response = await fetch(`gallery-data-expanded.js?v=${Date.now()}`, {
    cache: "no-store"
  });
  const text = await response.text();
  const match = text.match(/window\.KOLLECTION_GALLERY\s*=\s*([\s\S]*);\s*$/);
  if (!match) return [];

  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function normalizePostEntries(items) {
  return items.filter(isHdDatedPost).flatMap((item) => {
    const capturedDateCode = extractCapturedDateCode(item);
    const publishedAt = getPublishedAtFromPostUrl(item.postUrl);

    return item.images.map((image, index) => ({
      id: `${capturedDateCode}-${getPostId(item.postUrl) || "post"}-${index + 1}`,
      dateCode: capturedDateCode,
      capturedDateCode,
      capturedDate: toIsoDate(capturedDateCode),
      publishedAt,
      text: item.text,
      caption: item.caption || `Photo ${index + 1}`,
      postUrl: item.postUrl || "https://x.com/Kollection__",
      image,
      imageIndex: index + 1
    }));
  });
}

function normalizeDatabasePhoto(item) {
  const dateCode = extractCapturedDateCode({
    caption: item.caption,
    text: item.post_text,
    dateCode: item.date_code
  });
  const image = item.cached_url || item.local_path || item.original_url;
  const publishedAt = getPublishedAtFromPostUrl(item.post_url);

  if (!/^\d{6}$/.test(dateCode || "") || !image) return null;

  return {
    id: item.id,
    dateCode,
    capturedDateCode: dateCode,
    capturedDate: toIsoDate(dateCode),
    publishedAt,
    text: item.post_text || "",
    caption: item.caption || "Kollection__ photo",
    postUrl: item.post_url || "https://x.com/Kollection__",
    image,
    imageIndex: item.sort_index || 1
  };
}

function isHdDatedPost(item) {
  return (
    item &&
    /^\d{6}$/.test(extractCapturedDateCode(item) || "") &&
    /\bHD\d*\b/i.test(item.text || "") &&
    Array.isArray(item.images) &&
    item.images.length > 0
  );
}

function extractCapturedDateCode(item = {}) {
  const candidates = [item.caption, item.text, item.dateCode, item.date_code]
    .filter(Boolean)
    .map(String);

  for (const value of candidates) {
    const match = value.match(/(?:^|\D)(\d{6})(?=\D|$)/);
    if (match) return match[1];
  }

  return "";
}

function toIsoDate(dateCode) {
  const year = Number(`20${dateCode.slice(0, 2)}`);
  const month = dateCode.slice(2, 4);
  const day = dateCode.slice(4, 6);
  return `${year}-${month}-${day}`;
}

function getPostId(postUrl = "") {
  const match = String(postUrl).match(/status\/(\d+)/);
  return match ? match[1] : "";
}

function getPublishedAtFromPostUrl(postUrl = "") {
  const postId = getPostId(postUrl);
  if (!postId) return "";

  try {
    const twitterEpoch = 1288834974657n;
    const timestamp = (BigInt(postId) >> 22n) + twitterEpoch;
    return new Date(Number(timestamp)).toISOString();
  } catch {
    return "";
  }
}

function formatDate(isoDate) {
  if (!isoDate) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${isoDate}T00:00:00`));
}

function formatDateTime(isoDateTime) {
  if (!isoDateTime) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDateTime));
}

function initialize() {
  updateHomeCount();
  populateYears();
  renderHeroPreview();
  renderGallery();
  renderPage();
}

function currentPageName() {
  const pageName = window.location.hash.replace("#", "");
  return pages.some((page) => page.dataset.page === pageName) ? pageName : "gallery";
}

function renderPage() {
  const pageName = currentPageName();
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === pageName);
  });

  if (pageName === "design") {
    initializeDesignStudio();
  }
}

function updateHomeCount() {
  if (!homePhotoCount) return;
  homePhotoCount.textContent = `${state.photos.length} ${
    state.photos.length === 1 ? "photo" : "photos"
  } cached`;
}

function populateYears() {
  const selectedYear = yearFilter.value;
  yearFilter.innerHTML = '<option value="all">All years</option>';
  const years = [...new Set(state.photos.map((photo) => photo.capturedDate.slice(0, 4)))].sort();

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.append(option);
  });

  yearFilter.value = years.includes(selectedYear) ? selectedYear : "all";
}

function getVisiblePhotos() {
  const query = state.search.trim().toLowerCase();

  return state.photos
    .filter((photo) => {
      const matchesYear = state.year === "all" || photo.capturedDate.startsWith(state.year);
      const haystack = [
        photo.dateCode,
        photo.capturedDate,
        photo.publishedAt,
        photo.text,
        photo.caption,
        photo.postUrl
      ]
        .join(" ")
        .toLowerCase();

      return matchesYear && (!query || haystack.includes(query));
    })
    .sort((a, b) => {
      const direction = state.order === "asc" ? 1 : -1;
      return (
        a.capturedDate.localeCompare(b.capturedDate) * direction ||
        a.publishedAt.localeCompare(b.publishedAt) ||
        a.imageIndex - b.imageIndex
      );
    });
}

function renderHeroPreview() {
  if (!heroPreview) return;

  heroPreview.innerHTML = "";
  const previewPhotos = state.photos.slice(0, 4);

  if (previewPhotos.length === 0) {
    ["YYMMDD", "HD", "Cached", "Local"].forEach((label) => {
      const tile = document.createElement("div");
      tile.className = "preview-placeholder";
      tile.textContent = label;
      heroPreview.append(tile);
    });
    return;
  }

  previewPhotos.forEach((photo) => {
    const tile = document.createElement("div");
    tile.className = "preview-tile";
    tile.innerHTML = `<img src="${escapeAttribute(photo.image)}" alt="">`;
    heroPreview.append(tile);
  });
}

function renderGallery() {
  const visiblePhotos = getVisiblePhotos();
  galleryGrid.innerHTML = "";
  resultCount.textContent = `${visiblePhotos.length} ${
    visiblePhotos.length === 1 ? "photo" : "photos"
  }`;
  emptyState.classList.toggle("visible", visiblePhotos.length === 0);

  visiblePhotos.forEach((photo) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.innerHTML = `
      <button type="button" data-photo-id="${escapeAttribute(photo.id)}" aria-label="Open ${escapeAttribute(photo.caption)}">
        <img src="${escapeAttribute(photo.image)}" alt="${escapeAttribute(photo.caption)}" loading="lazy">
        <div class="photo-meta">
          <h3>${escapeHtml(photo.caption || `Photo ${photo.imageIndex}`)}</h3>
          <dl class="photo-dates">
            <div>
              <dt>Capture Date</dt>
              <dd>${escapeHtml(formatDate(photo.capturedDate))}</dd>
            </div>
            <div>
              <dt>Publish Date</dt>
              <dd>${escapeHtml(formatDateTime(photo.publishedAt))}</dd>
            </div>
          </dl>
        </div>
      </button>
    `;
    galleryGrid.append(card);
  });
}

function openPhoto(id) {
  const photo = state.photos.find((item) => String(item.id) === String(id));
  if (!photo) return;

  lightboxImage.src = photo.image;
  lightboxImage.alt = photo.caption || "";
  lightboxTitle.textContent = `${formatDate(photo.capturedDate)} / ${photo.dateCode}`;
  lightboxText.textContent = `Capture Date: ${formatDate(photo.capturedDate)}\nPublish Date: ${formatDateTime(photo.publishedAt)}\n\n${photo.text || ""}`;
  lightboxPost.href = photo.postUrl || "https://x.com/Kollection__";

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function loadFabricScript() {
  if (window.fabric) return Promise.resolve(window.fabric);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector("[data-fabric-script]");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.fabric), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js";
    script.dataset.fabricScript = "true";
    script.onload = () => resolve(window.fabric);
    script.onerror = reject;
    document.head.append(script);
  });
}

async function initializeDesignStudio() {
  if (!designCanvasElement || designState.fabricCanvas || designState.initializing) return;

  designState.initializing = true;
  if (fabricStatus) fabricStatus.textContent = "Loading canvas...";

  try {
    const fabric = await loadFabricScript();
    const canvas = new fabric.Canvas(designCanvasElement, {
      backgroundColor: designBgColor?.value || "#f6f1e7",
      preserveObjectStacking: true,
      selectionColor: "rgba(111, 143, 122, 0.16)",
      selectionBorderColor: "#6f8f7a",
      selectionLineWidth: 2
    });

    designState.fabricCanvas = canvas;
    seedDesignCanvas();
    bindDesignControls();
    resizeDesignCanvas();
    window.addEventListener("resize", resizeDesignCanvas);
    if (fabricStatus) fabricStatus.textContent = "Ready";
  } catch (error) {
    console.warn("Fabric.js failed to load", error);
    if (fabricStatus) fabricStatus.textContent = "Canvas unavailable";
  } finally {
    designState.initializing = false;
  }
}

function seedDesignCanvas() {
  const canvas = designState.fabricCanvas;
  if (!canvas || canvas.getObjects().length > 0) return;

  addDesignFrame();
  addDesignTitle();
  addDesignDate();
  addDesignBadge();
  canvas.renderAll();
}

function bindDesignControls() {
  if (designCanvasElement.dataset.designBound === "true") return;
  designCanvasElement.dataset.designBound = "true";

  designBgColor?.addEventListener("input", (event) => setDesignBackground(event.target.value));
  designSwatches?.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-color]");
    if (!swatch) return;
    const color = swatch.dataset.color;
    if (designBgColor) designBgColor.value = color;
    setDesignBackground(color);
  });

  designAddButtons.forEach((button) => {
    button.addEventListener("click", () => addDesignComponent(button.dataset.designAdd));
  });

  bringForwardButton?.addEventListener("click", () => {
    const object = designState.fabricCanvas?.getActiveObject();
    if (object) {
      designState.fabricCanvas.bringForward(object);
      designState.fabricCanvas.renderAll();
    }
  });

  sendBackButton?.addEventListener("click", () => {
    const object = designState.fabricCanvas?.getActiveObject();
    if (object) {
      designState.fabricCanvas.sendBackwards(object);
      designState.fabricCanvas.renderAll();
    }
  });

  deleteSelectedButton?.addEventListener("click", deleteSelectedDesignObject);
  clearDesignButton?.addEventListener("click", resetDesignCanvas);
  exportDesignButton?.addEventListener("click", exportDesignPng);
}

function setDesignBackground(color) {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
}

function addDesignComponent(type) {
  const actions = {
    title: addDesignTitle,
    date: addDesignDate,
    frame: addDesignFrame,
    badge: addDesignBadge,
    photo: addDesignPhoto,
    line: addDesignLine
  };

  actions[type]?.();
}

function addDesignTitle() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const title = new fabric.IText("Kollection Space", {
    left: 72,
    top: 92,
    width: 520,
    fill: "#141715",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 58,
    fontWeight: 900,
    lineHeight: 0.98
  });
  canvas.add(title).setActiveObject(title);
  canvas.renderAll();
}

function addDesignDate() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const date = new fabric.IText("2026 / 06 / 18", {
    left: 76,
    top: 178,
    fill: "#b86c54",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 24,
    fontWeight: 800,
    charSpacing: 40
  });
  canvas.add(date).setActiveObject(date);
  canvas.renderAll();
}

function addDesignFrame() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const frame = new fabric.Rect({
    left: 52,
    top: 52,
    width: 616,
    height: 796,
    fill: "rgba(255,255,255,0)",
    stroke: "#141715",
    strokeWidth: 3
  });
  canvas.add(frame).sendToBack(frame);
  canvas.renderAll();
}

function addDesignBadge() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const badge = new fabric.Group(
    [
      new fabric.Circle({ radius: 56, fill: "#d5ad45", originX: "center", originY: "center" }),
      new fabric.Text("HD", {
        fill: "#141715",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 30,
        fontWeight: 900,
        originX: "center",
        originY: "center"
      })
    ],
    { left: 524, top: 650 }
  );
  canvas.add(badge).setActiveObject(badge);
  canvas.renderAll();
}

function addDesignLine() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const line = new fabric.Rect({
    left: 76,
    top: 242,
    width: 420,
    height: 7,
    fill: "#6f8f7a",
    rx: 4,
    ry: 4
  });
  canvas.add(line).setActiveObject(line);
  canvas.renderAll();
}

function addDesignPhoto() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  fabric.Image.fromURL(designPhoto, (image) => {
    const targetWidth = 360;
    image.scaleToWidth(targetWidth);
    image.set({
      left: 180,
      top: 300,
      clipPath: new fabric.Rect({
        width: targetWidth,
        height: 460,
        originX: "center",
        originY: "center"
      })
    });
    canvas.add(image).setActiveObject(image);
    canvas.renderAll();
  });
}

function deleteSelectedDesignObject() {
  const canvas = designState.fabricCanvas;
  const activeObject = canvas?.getActiveObject();
  if (!canvas || !activeObject) return;

  if (activeObject.type === "activeSelection") {
    activeObject.getObjects().forEach((object) => canvas.remove(object));
  } else {
    canvas.remove(activeObject);
  }
  canvas.discardActiveObject();
  canvas.renderAll();
}

function resetDesignCanvas() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  canvas.clear();
  canvas.setBackgroundColor(designBgColor?.value || "#f6f1e7", () => {
    seedDesignCanvas();
  });
}

function exportDesignPng() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = "kollection-design.png";
  link.href = canvas.toDataURL({
    format: "png",
    multiplier: 2,
    enableRetinaScaling: true
  });
  link.click();
}

function resizeDesignCanvas() {
  const canvas = designState.fabricCanvas;
  const wrapper = document.querySelector(".canvas-wrap");
  if (!canvas || !wrapper) return;

  const baseWidth = 720;
  const availableWidth = Math.min(wrapper.clientWidth - 28, baseWidth);
  const zoom = Math.max(0.38, availableWidth / baseWidth);
  canvas.setZoom(zoom);
  canvas.setDimensions({
    width: baseWidth,
    height: 900
  });
  canvas.setDimensions(
    {
      width: `${Math.round(baseWidth * zoom)}px`,
      height: `${Math.round(900 * zoom)}px`
    },
    { cssOnly: true }
  );
  canvas.renderAll();
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderGallery();
});

yearFilter.addEventListener("change", (event) => {
  state.year = event.target.value;
  renderGallery();
});

orderFilter.addEventListener("change", (event) => {
  state.order = event.target.value;
  renderGallery();
});

galleryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-id]");
  if (button) openPhoto(button.dataset.photoId);
});

closeLightbox.addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

window.addEventListener("hashchange", renderPage);

loadPhotos();
