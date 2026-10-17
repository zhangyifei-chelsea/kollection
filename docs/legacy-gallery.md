# Kollection Gallery

A static image gallery that is no longer tied to X at runtime. It can render from:

- `gallery-data.js` for local/static entries.
- Supabase `photos` table for cached database records.
- Local image files in `photos/`.

## Check locally

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Add local photos

Place files in `photos/`, then reference them in `gallery-data.js`:

```js
window.KOLLECTION_GALLERY = [
  {
    dateCode: "260618",
    text: "260618 HD",
    caption: "Local photo",
    postUrl: "",
    images: ["photos/my-photo.jpg"]
  }
];
```

The page only renders entries with a valid `YYMMDD` date code, `HD` in the text, and at least one image.

## Cache remote photos to Supabase

Supabase should store metadata in the `photos` table and cached files in Storage.

1. In Supabase SQL Editor, run `database/schema.sql`.
2. Create a public Storage bucket named `kollection-photos`.
3. Add remote X image URLs to `gallery-data.js`.
4. Install dependencies:

```bash
npm install
```

5. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
6. Run:

```bash
export $(grep -v '^#' .env | xargs)
npm run cache:photos
```

The script downloads each remote image, uploads it to Supabase Storage, and upserts one row per photo into `photos`.

## Use Supabase in the browser

Put your public Supabase URL and anon key in `supabase-config.js`:

```js
window.KOLLECTION_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

When configured, the gallery reads from Supabase. If Supabase is not configured or fails, it falls back to `gallery-data.js`.

## Deploy on Vercel

1. Push this folder to GitHub.
2. In Vercel, import the GitHub repository.
3. Use `Other` as the framework preset.
4. Leave build command, install command, and output directory empty.
5. Deploy.
