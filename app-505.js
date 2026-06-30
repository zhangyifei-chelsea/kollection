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
const designBgColor = document.querySelector("#designBgColor");
const designSwatches = document.querySelector("#designSwatches");
const designPhotoSelect = document.querySelector("#designPhotoSelect");
const designTextInput = document.querySelector("#designTextInput");
const designTextColor = document.querySelector("#designTextColor");
const designTextFont = document.querySelector("#designTextFont");
const designTextOpacity = document.querySelector("#designTextOpacity");
const designTextPreview = document.querySelector("#designTextPreview");
const designAccessorySelect = document.querySelector("#designAccessorySelect");
const designAccessoryOpacity = document.querySelector("#designAccessoryOpacity");
const designAccessoryPreview = document.querySelector("#designAccessoryPreview");
const exportDesignButton = document.querySelector("#exportDesignButton");
const clearDesignButton = document.querySelector("#clearDesignButton");
const deleteSelectedButton = document.querySelector("#deleteSelectedButton");
const bringForwardButton = document.querySelector("#bringForwardButton");
const sendBackButton = document.querySelector("#sendBackButton");
const showBorderToggle = document.querySelector("#showBorderToggle");
const designAddButtons = [...document.querySelectorAll("[data-design-add]")];
document.documentElement.dataset.appBuild = "accessory-expansion-1782761800000";

const designState = {
  fabricCanvas: null,
  initializing: false
};

const designMainFigures = [
  { label: "Choice 1 (Fairy)", src: "assets/designs/main-fig-fairy.PNG" },
  { label: "Choice 2 (Pastry)", src: "assets/designs/main-fig-apron.PNG" },
  { label: "Choice 3", src: "assets/designs/main-fig-choice-3.PNG" },
  { label: "Choice 4 (NANA)", src: "assets/designs/main-fig-choice-4.PNG" }
];

const designTextFonts = {
  "bubble-serif": {
    family: 'Georgia, "Times New Roman", serif',
    weight: 900
  },
  "playful-serif": {
    family: 'Palatino, "Book Antiqua", Georgia, serif',
    weight: 800
  },
  "cute-display": {
    family: '"Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif',
    weight: 900
  },
  "soft-serif": {
    family: 'Garamond, Georgia, "Times New Roman", serif',
    weight: 700
  },
  "editorial-serif": {
    family: 'Didot, "Bodoni 72", Georgia, serif',
    weight: 800
  },
  "retro-bubble": {
    family: 'Cooper, "Cooper Black", Georgia, serif',
    weight: 900
  },
  "y2k-serif": {
    family: '"Bodoni 72", Didot, Georgia, serif',
    weight: 900
  },
  "korean-magazine": {
    family: '"Apple SD Gothic Neo", "Noto Serif KR", Georgia, serif',
    weight: 800
  },
  "cute-branding": {
    family: '"Avenir Next", "Helvetica Neue", Arial, sans-serif',
    weight: 900
  },
  hobeaux: {
    family: 'Hobeaux, "Cooper Black", Georgia, serif',
    weight: 900
  },
  "itc-souvenir": {
    family: '"ITC Souvenir", Souvenir, Georgia, serif',
    weight: 800
  },
  "cooper-black": {
    family: '"Cooper Black", Cooper, Georgia, serif',
    weight: 900
  },
  windsor: {
    family: 'Windsor, Georgia, serif',
    weight: 800
  },
  genty: {
    family: 'Genty, "Cooper Black", Georgia, serif',
    weight: 900
  },
  recoleta: {
    family: 'Recoleta, Georgia, serif',
    weight: 800
  },
  "tan-pearl": {
    family: '"TAN Pearl", "Cooper Black", Georgia, serif',
    weight: 900
  },
  gliker: {
    family: 'Gliker, Georgia, serif',
    weight: 900
  },
  pilowlava: {
    family: 'Pilowlava, "Cooper Black", Georgia, serif',
    weight: 900
  }
};

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
  populateDesignPhotoSelect();
  renderHeroPreview();
  renderGallery();
  renderPage();
}

function currentPageName() {
  const pageName = window.location.hash.replace("#", "");
  return pages.some((page) => page.dataset.page === pageName) ? pageName : "home";
}

function renderPage() {
  const pageName = currentPageName();
  document.body.dataset.page = pageName;
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

function populateDesignPhotoSelect() {
  if (!designPhotoSelect) return;

  designPhotoSelect.innerHTML = "";
  designMainFigures.forEach((figure) => {
    const option = document.createElement("option");
    option.value = figure.src;
    option.textContent = figure.label;
    designPhotoSelect.append(option);
  });
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
  } catch (error) {
    console.warn("Fabric.js failed to load", error);
  } finally {
    designState.initializing = false;
  }
}

function seedDesignCanvas() {
  const canvas = designState.fabricCanvas;
  if (!canvas || canvas.getObjects().length > 0) return;

  addDesignMainFig();
  setDesignBorderVisible(showBorderToggle?.getAttribute("aria-pressed") !== "false");
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
  [designTextInput, designTextColor, designTextFont, designTextOpacity].forEach((control) => {
    control?.addEventListener("input", updateDesignPreviews);
    control?.addEventListener("change", updateDesignPreviews);
  });
  [designAccessorySelect, designAccessoryOpacity].forEach((control) => {
    control?.addEventListener("input", updateDesignPreviews);
    control?.addEventListener("change", updateDesignPreviews);
  });
  designPhotoSelect?.addEventListener("change", () => addDesignMainFig());
  showBorderToggle?.addEventListener("click", () => {
    const nextState = showBorderToggle.getAttribute("aria-pressed") !== "true";
    setDesignBorderVisible(nextState);
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
  updateDesignPreviews();
}

function setDesignBackground(color) {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
}

function addDesignComponent(type) {
  const actions = {
    text: addDesignText,
    accessory: addDesignAccessories
  };

  actions[type]?.();
}

function addDesignText() {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  const content = designTextInput?.value.trim() || "Your text";
  const font = designTextFonts[designTextFont?.value] || designTextFonts["bubble-serif"];
  const text = new fabric.IText(content, {
    left: 96,
    top: 96,
    width: 520,
    fill: designTextColor?.value || "#ffffff",
    fontFamily: font.family,
    fontSize: 44,
    fontWeight: font.weight,
    lineHeight: 1.08,
    opacity: getRangeOpacity(designTextOpacity)
  });
  canvas.add(text).setActiveObject(text);
  canvas.renderAll();
}

function getRangeOpacity(input) {
  const value = Number(input?.value || 100);
  return Math.min(Math.max(value, 10), 100) / 100;
}

function updateDesignPreviews() {
  if (designTextPreview) {
    const font = designTextFonts[designTextFont?.value] || designTextFonts["bubble-serif"];
    designTextPreview.textContent = designTextInput?.value.trim() || "Your text";
    designTextPreview.style.color = designTextColor?.value || "#ffffff";
    designTextPreview.style.fontFamily = font.family;
    designTextPreview.style.fontWeight = String(font.weight);
    designTextPreview.style.opacity = String(getRangeOpacity(designTextOpacity));
  }

  if (designAccessoryPreview) {
    designAccessoryPreview.src = designAccessorySelect?.value || "assets/designs/accessory-01.PNG";
    designAccessoryPreview.style.opacity = String(getRangeOpacity(designAccessoryOpacity));
  }
}

function addDesignAccessories() {
  const canvas = designState.fabricCanvas;
  const selectedAccessory = designAccessorySelect?.value;
  if (!canvas || !selectedAccessory) return;

  const opacity = getRangeOpacity(designAccessoryOpacity);
  const accessoryCount = canvas.getObjects().filter((object) => object.designRole === "accessory").length;
  fabric.Image.fromURL(selectedAccessory, (image) => {
    const targetSize = 180;
    const scale = Math.min(targetSize / image.width, targetSize / image.height);
    const column = accessoryCount % 3;
    const row = Math.floor(accessoryCount / 3) % 3;
    image.set({
      left: 88 + column * 178,
      top: 84 + row * 178,
      designRole: "accessory",
      opacity,
      scaleX: scale,
      scaleY: scale
    });
    canvas.add(image).setActiveObject(image);
    const border = getDesignBorder();
    if (border) canvas.bringToFront(border);
    canvas.renderAll();
  });
}

function getDesignBorder() {
  return designState.fabricCanvas?.getObjects().find((object) => object.designRole === "border");
}

function setDesignBorderVisible(isVisible) {
  const canvas = designState.fabricCanvas;
  if (!canvas) return;

  if (showBorderToggle) {
    showBorderToggle.setAttribute("aria-pressed", String(isVisible));
    showBorderToggle.classList.toggle("is-on", isVisible);
  }

  const existingBorder = getDesignBorder();
  if (!isVisible && existingBorder) {
    canvas.remove(existingBorder);
    canvas.discardActiveObject();
    canvas.renderAll();
    return;
  }
  if (!isVisible || existingBorder) return;

  const heart = new fabric.Path(
    "M 280 560 C 130 440 0 330 0 170 C 0 70 80 0 180 0 C 230 0 260 25 280 65 C 300 25 330 0 380 0 C 480 0 560 70 560 170 C 560 330 430 440 280 560 Z",
        {
          left: 80,
          top: 80,
          designRole: "border",
          fill: "rgba(255,255,255,0)",
          stroke: "#ffffff",
          strokeWidth: 5,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasControls: false,
          hasBorders: false
        }
      );
      canvas.add(heart);
      canvas.renderAll();
    }

function addDesignBorder() {
  setDesignBorderVisible(true);
}

function getSelectedDesignPhoto() {
  return designPhotoSelect?.value || state.photos[0]?.image || "";
}

function addDesignMainFig() {
  const canvas = designState.fabricCanvas;
  const selectedPhoto = getSelectedDesignPhoto();
  if (!canvas || !selectedPhoto) return;

  canvas
    .getObjects()
    .filter((object) => object.designRole === "mainFig")
    .forEach((object) => canvas.remove(object));

  fabric.Image.fromURL(selectedPhoto, (image) => {
    const targetSize = 560;
    const scale = Math.min(targetSize / image.width, targetSize / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    image.set({
      left: 360 - scaledWidth / 2,
      top: 360 - scaledHeight / 2,
      designRole: "mainFig",
      scaleX: scale,
      scaleY: scale
    });
    canvas.add(image);
    canvas.sendToBack(image);
    const border = canvas.getObjects().find((object) => object.designRole === "border");
    if (border) canvas.bringToFront(border);
    canvas.setActiveObject(image);
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
  const baseHeight = 720;
  const availableWidth = Math.min(wrapper.clientWidth - 28, baseWidth);
  const zoom = Math.max(0.38, availableWidth / baseWidth);
  canvas.setZoom(zoom);
  canvas.setDimensions({
    width: baseWidth,
    height: baseHeight
  });
  canvas.setDimensions(
    {
      width: `${Math.round(baseWidth * zoom)}px`,
      height: `${Math.round(baseHeight * zoom)}px`
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
