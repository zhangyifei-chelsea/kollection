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
document.documentElement.dataset.appBuild = "no-gallery-hero-1781836259791";

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
  return items.filter(isHdDatedPost).flatMap((item) =>
    item.images.map((image, index) => ({
      id: `${item.dateCode}-${index + 1}`,
      dateCode: item.dateCode,
      isoDate: toIsoDate(item.dateCode),
      text: item.text,
      caption: item.caption || `Photo ${index + 1}`,
      postUrl: item.postUrl || "https://x.com/Kollection__",
      image,
      imageIndex: index + 1
    }))
  );
}

function normalizeDatabasePhoto(item) {
  const dateCode = item.date_code;
  const image = item.cached_url || item.local_path || item.original_url;

  if (!/^\d{6}$/.test(dateCode || "") || !image) return null;

  return {
    id: item.id,
    dateCode,
    isoDate: item.photo_date || toIsoDate(dateCode),
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
    /^\d{6}$/.test(item.dateCode || "") &&
    /\bHD\d*\b/i.test(item.text || "") &&
    Array.isArray(item.images) &&
    item.images.length > 0
  );
}

function toIsoDate(dateCode) {
  const year = Number(`20${dateCode.slice(0, 2)}`);
  const month = dateCode.slice(2, 4);
  const day = dateCode.slice(4, 6);
  return `${year}-${month}-${day}`;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${isoDate}T00:00:00`));
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
  return pages.some((page) => page.dataset.page === pageName) ? pageName : "home";
}

function renderPage() {
  const pageName = currentPageName();
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === pageName);
  });
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
  const years = [...new Set(state.photos.map((photo) => photo.isoDate.slice(0, 4)))].sort();

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
      const matchesYear = state.year === "all" || photo.isoDate.startsWith(state.year);
      const haystack = [
        photo.dateCode,
        photo.isoDate,
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
      return a.isoDate.localeCompare(b.isoDate) * direction || a.imageIndex - b.imageIndex;
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
          <div class="badge-row">
            <span class="badge">${escapeHtml(photo.dateCode)}</span>
            <span class="badge hd">HD</span>
          </div>
          <h3>${escapeHtml(photo.caption || `Photo ${photo.imageIndex}`)}</h3>
          <p>${escapeHtml(formatDate(photo.isoDate))}</p>
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
  lightboxTitle.textContent = `${formatDate(photo.isoDate)} / ${photo.dateCode}`;
  lightboxText.textContent = photo.text || "";
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
