
alter function public.set_updated_at() set search_path = public;

drop policy if exists "Destination images are publicly accessible" on storage.objects;
