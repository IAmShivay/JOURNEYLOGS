
-- Destinations table
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  location text not null,
  country text,
  summary text,
  story text not null default '',
  cover_image_url text,
  gallery jsonb not null default '[]'::jsonb,
  visited_on date,
  lat double precision,
  lng double precision,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index destinations_published_idx on public.destinations(published, created_at desc);
create index destinations_slug_idx on public.destinations(slug);

alter table public.destinations enable row level security;

create policy "Published destinations are viewable by everyone"
on public.destinations for select
using (published = true);

create policy "Authors can view own destinations"
on public.destinations for select
to authenticated
using (auth.uid() = author_id);

create policy "Authenticated users can insert own destinations"
on public.destinations for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Authors can update own destinations"
on public.destinations for update
to authenticated
using (auth.uid() = author_id);

create policy "Authors can delete own destinations"
on public.destinations for delete
to authenticated
using (auth.uid() = author_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger destinations_set_updated_at
before update on public.destinations
for each row execute function public.set_updated_at();

-- Storage bucket for destination images
insert into storage.buckets (id, name, public)
values ('destination-images', 'destination-images', true)
on conflict (id) do nothing;

create policy "Destination images are publicly accessible"
on storage.objects for select
using (bucket_id = 'destination-images');

create policy "Authenticated users can upload destination images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'destination-images');

create policy "Authenticated users can update own destination images"
on storage.objects for update
to authenticated
using (bucket_id = 'destination-images' and owner = auth.uid());

create policy "Authenticated users can delete own destination images"
on storage.objects for delete
to authenticated
using (bucket_id = 'destination-images' and owner = auth.uid());
