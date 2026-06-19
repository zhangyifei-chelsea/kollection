import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const manifestPath = new URL("../x-hd-download-manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const run = promisify(execFile);

for (const job of manifest.jobs) {
  await mkdir(path.dirname(job.local), { recursive: true });

  if (existsSync(job.local)) {
    continue;
  }

  await downloadWithCurl(job.url, job.local);
  console.log(`saved ${job.local}`);
}

await writeFile(
  new URL("../gallery-data.js", import.meta.url),
  `window.KOLLECTION_GALLERY = ${JSON.stringify(manifest.posts, null, 2)};\n`
);

console.log(
  `Updated gallery-data.js with ${manifest.posts.length} posts and ${manifest.jobs.length} photos.`
);

async function downloadWithCurl(url, outputPath) {
  await run("curl", [
    "-L",
    "--fail",
    "--retry",
    "3",
    "--retry-delay",
    "2",
    "--connect-timeout",
    "30",
    "--max-time",
    "180",
    "-A",
    "Mozilla/5.0",
    url,
    "-o",
    outputPath
  ]);
}
