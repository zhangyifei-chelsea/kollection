# Kollection Space

A static collection-board demo that runs with local browser storage first and can later persist to Supabase. It is ready to deploy on Vercel as a plain static site.

## Files

- `index.html` contains the page structure and script loading.
- `styles.css` contains the responsive interface.
- `app.js` contains local storage behavior and optional Supabase persistence.
- `supabase-config.js` is where Supabase project credentials can be added.
- `vercel.json` keeps Vercel's static routing predictable.

## Supabase table

Create a table named `items` with these columns:

```sql
create table public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Research',
  stage text not null default 'New',
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "Allow public demo reads"
on public.items for select
using (true);

create policy "Allow public demo inserts"
on public.items for insert
with check (true);

create policy "Allow public demo deletes"
on public.items for delete
using (true);
```

The public policies are only suitable for a demo. For a real product, add authentication and user-scoped policies before sharing the app broadly.

## Deploy

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Keep the project as a static site with no build command.
4. Add your Supabase URL and anon key in `supabase-config.js`.

Opening `index.html` directly in a browser also works for the local-storage demo.
