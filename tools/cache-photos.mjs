import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET = "kollection-photos"
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the cache script."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const sourceItems = await readGalleryData();
const rows = [];

for (const item of sourceItems.filter(isHdDatedPost)) {
  for (const [index, imageUrl] of item.images.entries()) {
    if (!/^https?:\/\//i.test(imageUrl)) {
      rows.push(toLocalRow(item, imageUrl, index));
      continue;
    }

    const storagePath = storagePathFor(item, imageUrl, index);
    const bytes = await downloadImage(imageUrl);

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(storagePath, bytes, {
        contentType: contentTypeFor(imageUrl),
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
    rows.push(toRemoteRow(item, imageUrl, index, storagePath, data.publicUrl));
  }
}

if (rows.length === 0) {
  console.log("No matching HD dated photos found in gallery-data.js.");
  process.exit(0);
}

const { error } = await supabase.from("photos").upsert(rows, {
  onConflict: "date_code,sort_index,source_key"
});

if (error) throw error;

console.log(`Cached ${rows.length} photo record${rows.length === 1 ? "" : "s"}.`);

async function readGalleryData() {
  const file = await readFile(new URL("../gallery-data.js", import.meta.url), "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(file, context);
  return Array.isArray(context.window.KOLLECTION_GALLERY)
    ? context.window.KOLLECTION_GALLERY
    : [];
}

function isHdDatedPost(item) {
  return (
    item &&
    /^\d{6}$/.test(item.dateCode || "") &&
    /\bHD\b/i.test(item.text || "") &&
    Array.isArray(item.images) &&
    item.images.length > 0
  );
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function toRemoteRow(item, imageUrl, index, storagePath, cachedUrl) {
  return {
    date_code: item.dateCode,
    photo_date: toIsoDate(item.dateCode),
    post_text: item.text,
    caption: item.caption || `Kollection__ ${item.dateCode}`,
    post_url: item.postUrl || null,
    original_url: imageUrl,
    cached_url: cachedUrl,
    local_path: null,
    storage_path: storagePath,
    source: "x",
    source_key: imageUrl,
    sort_index: index + 1
  };
}

function toLocalRow(item, localPath, index) {
  return {
    date_code: item.dateCode,
    photo_date: toIsoDate(item.dateCode),
    post_text: item.text,
    caption: item.caption || `Kollection__ ${item.dateCode}`,
    post_url: item.postUrl || null,
    original_url: null,
    cached_url: null,
    local_path: localPath,
    storage_path: null,
    source: "local",
    source_key: localPath,
    sort_index: index + 1
  };
}

function storagePathFor(item, imageUrl, index) {
  const extension = extensionFor(imageUrl);
  return `${toIsoDate(item.dateCode)}/${item.dateCode}-${index + 1}.${extension}`;
}

function extensionFor(url) {
  const format = new URL(url).searchParams.get("format");
  if (format) return format.replace(/[^a-z0-9]/gi, "").toLowerCase();

  const pathExtension = new URL(url).pathname.split(".").pop();
  return pathExtension && pathExtension.length <= 5 ? pathExtension : "jpg";
}

function contentTypeFor(url) {
  const extension = extensionFor(url);
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

function toIsoDate(dateCode) {
  return `20${dateCode.slice(0, 2)}-${dateCode.slice(2, 4)}-${dateCode.slice(4, 6)}`;
}
