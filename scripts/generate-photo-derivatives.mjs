import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "2026_final");
const galleryDir = path.join(root, "public/images/gallery");
const fullscreenDir = path.join(root, "public/images/fullscreen");
const sourceRecords = JSON.parse(
  await fs.readFile(path.join(root, "content/photo-sources.json"), "utf8"),
);
const conversion = {
  format: "WebP",
  colorProfile: "sRGB",
  gallery: { maxEdge: 2000, quality: 90, effort: 6 },
  fullscreen: { maxEdge: 4000, quality: 94, effort: 6 },
};
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff"]);

function readExifMetadata(exif) {
  if (!exif || exif.toString("ascii", 0, 6) !== "Exif\0\0") return {};
  const start = 6;
  const littleEndian = exif.toString("ascii", start, start + 2) === "II";
  const u16 = (offset) =>
    littleEndian ? exif.readUInt16LE(offset) : exif.readUInt16BE(offset);
  const u32 = (offset) =>
    littleEndian ? exif.readUInt32LE(offset) : exif.readUInt32BE(offset);
  const ifdAt = (pointerOffset) => start + u32(pointerOffset);
  const findTag = (directory, wanted) => {
    const count = u16(directory);
    for (let i = 0; i < count; i += 1) {
      const entry = directory + 2 + i * 12;
      if (u16(entry) !== wanted) continue;
      const length = u32(entry + 4);
      const valueOffset = length <= 4 ? entry + 8 : start + u32(entry + 8);
      return exif
        .toString("ascii", valueOffset, valueOffset + length)
        .replace(/\0.*$/, "")
        .trim();
    }
    return undefined;
  };
  try {
    const ifd0 = ifdAt(start + 4);
    const count = u16(ifd0);
    let exifPointer;
    for (let i = 0; i < count; i += 1) {
      const entry = ifd0 + 2 + i * 12;
      if (u16(entry) === 0x8769) exifPointer = entry + 8;
    }
    const exifIfd = exifPointer ? ifdAt(exifPointer) : ifd0;
    return {
      date: findTag(exifIfd, 0x9003) ?? findTag(exifIfd, 0x9004),
      credit: findTag(ifd0, 0x013b),
    };
  } catch {
    return {};
  }
}

function normalizeDate(value) {
  const match = value?.match(/^(\d{4}):(\d{2}):(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function sourceHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const mib = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;

function orientedDimensions(metadata) {
  const swapsAxes = metadata.orientation >= 5 && metadata.orientation <= 8;
  return {
    width: swapsAxes ? metadata.height : metadata.width,
    height: swapsAxes ? metadata.width : metadata.height,
  };
}

function formatAssetPath(filePath) {
  return `/${path.relative(path.join(root, "public"), filePath).split(path.sep).join("/")}`;
}

async function removeStaleWebpFiles(directory, currentFiles) {
  const expected = new Set(currentFiles);
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".webp") && !expected.has(entry.name)) {
      await fs.unlink(path.join(directory, entry.name));
    }
  }
}

const imageSources = (await fs.readdir(sourceDir, { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()),
  )
  .map((entry) => `2026_final/${entry.name}`);
const recordsBySource = new Map();
for (const record of sourceRecords) {
  if (recordsBySource.has(record.source)) {
    throw new Error(`Duplicate source in content/photo-sources.json: ${record.source}`);
  }
  recordsBySource.set(record.source, record);
}

const sourceSet = new Set(imageSources);
const manifestSet = new Set(recordsBySource.keys());
const missingFromManifest = imageSources.filter((source) => !manifestSet.has(source));
const absentFromSource = [...manifestSet].filter((source) => !sourceSet.has(source));
if (missingFromManifest.length || absentFromSource.length) {
  throw new Error(
    [
      missingFromManifest.length
        ? `Add these originals to content/photo-sources.json:\n${missingFromManifest.join("\n")}`
        : "",
      absentFromSource.length
        ? `These manifest files are missing from 2026_final:\n${absentFromSource.join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  );
}

await Promise.all([
  fs.mkdir(galleryDir, { recursive: true }),
  fs.mkdir(fullscreenDir, { recursive: true }),
]);

const generatedPhotos = [];
const generatedAssets = [];
const galleryNames = [];
const fullscreenNames = [];
let originalBytesTotal = 0;
let galleryBytesTotal = 0;
let fullscreenBytesTotal = 0;

for (let index = 0; index < sourceRecords.length; index += 1) {
  const record = sourceRecords[index];
  const sourcePath = path.join(root, record.source);
  const sourceBuffer = await fs.readFile(sourcePath);
  const hash = sourceHash(sourceBuffer);
  const id = `K-${String(index + 1).padStart(3, "0")}`;
  const filename = `${id.toLowerCase()}-${hash.slice(0, 12)}.webp`;
  const galleryPath = path.join(galleryDir, filename);
  const fullscreenPath = path.join(fullscreenDir, filename);
  const original = sharp(sourceBuffer, { failOn: "error" });
  const metadata = await original.metadata();
  const dimensions = orientedDimensions(metadata);
  const exifFields = readExifMetadata(metadata.exif);
  const date = normalizeDate(exifFields.date);
  const credit = exifFields.credit;
  const { dominant } = await original.stats();
  const dominantColor = `#${[dominant.r, dominant.g, dominant.b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;

  const [gallery, fullscreen] = await Promise.all([
    sharp(sourceBuffer, { failOn: "error" })
      .rotate()
      .resize({
        width: conversion.gallery.maxEdge,
        height: conversion.gallery.maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .withIccProfile("srgb")
      .webp({ quality: conversion.gallery.quality, effort: conversion.gallery.effort, smartSubsample: true })
      .toFile(galleryPath),
    sharp(sourceBuffer, { failOn: "error" })
      .rotate()
      .resize({
        width: conversion.fullscreen.maxEdge,
        height: conversion.fullscreen.maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .withIccProfile("srgb")
      .webp({ quality: conversion.fullscreen.quality, effort: conversion.fullscreen.effort, smartSubsample: true })
      .toFile(fullscreenPath),
  ]);
  const gallerySrc = formatAssetPath(galleryPath);
  const fullscreenSrc = formatAssetPath(fullscreenPath);
  const asset = {
    id,
    chapterId: record.chapterId,
    ...(record.locationId ? { locationId: record.locationId } : {}),
    source: record.source,
    sourceSha256: hash,
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
    originalBytes: sourceBuffer.byteLength,
    gallery: {
      path: gallerySrc,
      width: gallery.width,
      height: gallery.height,
      bytes: gallery.size,
    },
    fullscreen: {
      path: fullscreenSrc,
      width: fullscreen.width,
      height: fullscreen.height,
      bytes: fullscreen.size,
    },
    title: record.title,
    alt: record.alt,
    tags: record.tags,
    dominantColor,
    ...(date ? { date } : {}),
    ...(record.event ? { event: record.event } : {}),
    ...(record.eventType ? { eventType: record.eventType } : {}),
    ...(record.captureTime ? { captureTime: record.captureTime } : {}),
    ...(credit ? { credit } : {}),
  };
  generatedAssets.push(asset);
  generatedPhotos.push({
    id,
    chapterId: record.chapterId,
    ...(record.locationId ? { locationId: record.locationId } : {}),
    gallerySrc,
    fullscreenSrc,
    width: dimensions.width,
    height: dimensions.height,
    galleryWidth: gallery.width,
    galleryHeight: gallery.height,
    galleryBytes: gallery.size,
    fullscreenWidth: fullscreen.width,
    fullscreenHeight: fullscreen.height,
    fullscreenBytes: fullscreen.size,
    title: record.title,
    alt: record.alt,
    ...(date ? { date } : {}),
    ...(record.event ? { event: record.event } : {}),
    ...(record.eventType ? { eventType: record.eventType } : {}),
    ...(record.captureTime ? { captureTime: record.captureTime } : {}),
    ...(credit ? { credit } : {}),
    tags: record.tags,
    dominantColor,
  });
  galleryNames.push(filename);
  fullscreenNames.push(filename);
  originalBytesTotal += sourceBuffer.byteLength;
  galleryBytesTotal += gallery.size;
  fullscreenBytesTotal += fullscreen.size;
  console.log(
    `${id} ${path.basename(record.source)} → ${gallery.width}×${gallery.height} ${(gallery.size / 1024).toFixed(0)} KB; ${fullscreen.width}×${fullscreen.height} ${(fullscreen.size / 1024).toFixed(0)} KB`,
  );
}

await Promise.all([
  removeStaleWebpFiles(galleryDir, galleryNames),
  removeStaleWebpFiles(fullscreenDir, fullscreenNames),
]);

const derivativeBytesTotal = galleryBytesTotal + fullscreenBytesTotal;
const sizeSummary = {
  original: { files: generatedAssets.length, bytes: originalBytesTotal },
  gallery: { files: generatedAssets.length, bytes: galleryBytesTotal },
  fullscreen: { files: generatedAssets.length, bytes: fullscreenBytesTotal },
  derivativesCombined: { files: generatedAssets.length * 2, bytes: derivativeBytesTotal },
  reductionVsOriginalBytes: originalBytesTotal - derivativeBytesTotal,
  reductionVsOriginalPercent: Number(
    ((1 - derivativeBytesTotal / originalBytesTotal) * 100).toFixed(2),
  ),
};
const report = `# Image pipeline size report

Generated by \`npm run images:build\` from the originals in \`2026_final/\`.

| Variant | Files | Bytes | Size |
| --- | ---: | ---: | ---: |
| Original JPEGs | ${sizeSummary.original.files} | ${sizeSummary.original.bytes} | ${mib(sizeSummary.original.bytes)} |
| Gallery WebP (≤ ${conversion.gallery.maxEdge}px, quality ${conversion.gallery.quality}) | ${sizeSummary.gallery.files} | ${sizeSummary.gallery.bytes} | ${mib(sizeSummary.gallery.bytes)} |
| Lightbox WebP (≤ ${conversion.fullscreen.maxEdge}px, quality ${conversion.fullscreen.quality}) | ${sizeSummary.fullscreen.files} | ${sizeSummary.fullscreen.bytes} | ${mib(sizeSummary.fullscreen.bytes)} |
| Both derivative sets | ${sizeSummary.derivativesCombined.files} | ${sizeSummary.derivativesCombined.bytes} | ${mib(sizeSummary.derivativesCombined.bytes)} |

The combined derivatives are ${sizeSummary.reductionVsOriginalPercent}% smaller than the originals (${mib(sizeSummary.reductionVsOriginalBytes)} saved). The originals remain unchanged and outside the public asset directories. Outputs use sRGB ICC profiles, preserve EXIF orientation through rotation, retain aspect ratio, and remove source EXIF/GPS metadata from WebP files.
`;

await Promise.all([
  fs.writeFile(
    path.join(root, "content/photos.ts"),
    `import type { Photo } from './photo-model';\nexport type { Photo } from './photo-model';\n\n// Generated by scripts/generate-photo-derivatives.mjs; original paths are not used by the client.\nexport const photos: Photo[] = ${JSON.stringify(generatedPhotos, null, 2)};\n`,
  ),
  fs.writeFile(
    path.join(root, "content/image-assets.json"),
    `${JSON.stringify(
      {
        version: 1,
        sourceDirectory: "2026_final",
        conversion,
        sizes: sizeSummary,
        assets: generatedAssets,
      },
      null,
      2,
    )}\n`,
  ),
  fs.writeFile(path.join(root, "docs/image-pipeline-report.md"), report),
]);

console.log(`Processed ${generatedAssets.length} originals without modifying them.`);
console.log(
  `Originals ${mib(originalBytesTotal)} → gallery ${mib(galleryBytesTotal)} + fullscreen ${mib(fullscreenBytesTotal)} = ${mib(derivativeBytesTotal)} (${sizeSummary.reductionVsOriginalPercent}% smaller combined).`,
);
