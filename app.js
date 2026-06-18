const starterItems = [
  {
    id: "seed-1",
    title: "Launch moodboard references",
    category: "Design",
    stage: "Reviewing",
    created_at: new Date().toISOString()
  },
  {
    id: "seed-2",
    title: "Supabase schema checklist",
    category: "Product",
    stage: "Saved",
    created_at: new Date().toISOString()
  },
  {
    id: "seed-3",
    title: "Customer discovery notes",
    category: "Research",
    stage: "New",
    created_at: new Date().toISOString()
  }
];

const storageKey = "kollection-space-items";
const config = window.KOLLECTION_SUPABASE || {};
const canUseSupabase = Boolean(
  config.url &&
    config.anonKey &&
    window.supabase &&
    !config.url.includes("YOUR_") &&
    !config.anonKey.includes("YOUR_")
);

const state = {
  items: [],
  search: "",
  stage: "All",
  client: null,
  remote: false
};

const itemForm = document.querySelector("#itemForm");
const titleInput = document.querySelector("#titleInput");
const categoryInput = document.querySelector("#categoryInput");
const stageInput = document.querySelector("#stageInput");
const searchInput = document.querySelector("#searchInput");
const itemGrid = document.querySelector("#itemGrid");
const itemCount = document.querySelector("#itemCount");
const emptyState = document.querySelector("#emptyState");
const syncStatus = document.querySelector("#syncStatus");
const filterButtons = [...document.querySelectorAll("[data-stage-filter]")];

function readLocalItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : starterItems;
  } catch {
    return starterItems;
  }
}

function writeLocalItems() {
  localStorage.setItem(storageKey, JSON.stringify(state.items));
}

async function loadItems() {
  if (canUseSupabase) {
    state.client = window.supabase.createClient(config.url, config.anonKey);
    const { data, error } = await state.client
      .from("items")
      .select("id,title,category,stage,created_at")
      .order("created_at", { ascending: false });

    if (!error) {
      state.items = data;
      state.remote = true;
      syncStatus.textContent = "Supabase connected";
      syncStatus.classList.add("online");
      renderItems();
      return;
    }

    syncStatus.textContent = "Local mode";
  }

  state.items = readLocalItems();
  renderItems();
}

function getVisibleItems() {
  const query = state.search.trim().toLowerCase();

  return state.items.filter((item) => {
    const matchesStage = state.stage === "All" || item.stage === state.stage;
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesStage && matchesSearch;
  });
}

function renderItems() {
  const visibleItems = getVisibleItems();
  itemGrid.innerHTML = "";
  itemCount.textContent = `${visibleItems.length} ${
    visibleItems.length === 1 ? "item" : "items"
  }`;
  emptyState.classList.toggle("visible", visibleItems.length === 0);

  visibleItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML = `
      <header>
        <h3>${escapeHtml(item.title)}</h3>
        <span class="tag">${escapeHtml(item.stage)}</span>
      </header>
      <div class="meta-row">
        <span>${escapeHtml(item.category)}</span>
        <span>${formatDate(item.created_at)}</span>
      </div>
      <button type="button" data-delete-id="${item.id}">Remove</button>
    `;
    itemGrid.append(card);
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
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

async function createItem(event) {
  event.preventDefault();
  const item = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    stage: stageInput.value
  };

  if (!item.title) return;

  if (state.remote) {
    const { data, error } = await state.client
      .from("items")
      .insert(item)
      .select()
      .single();

    if (!error) {
      state.items.unshift(data);
    }
  } else {
    state.items.unshift({
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    });
    writeLocalItems();
  }

  itemForm.reset();
  titleInput.focus();
  renderItems();
}

async function deleteItem(id) {
  if (state.remote) {
    const { error } = await state.client.from("items").delete().eq("id", id);
    if (error) return;
  }

  state.items = state.items.filter((item) => item.id !== id);
  writeLocalItems();
  renderItems();
}

itemForm.addEventListener("submit", createItem);

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderItems();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.stage = button.dataset.stageFilter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderItems();
  });
});

itemGrid.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    deleteItem(deleteButton.dataset.deleteId);
  }
});

loadItems();
