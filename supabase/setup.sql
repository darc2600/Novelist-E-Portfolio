-- Novel E-Portfolio: ONE shared, intentionally publicly editable portfolio.
-- Run in a new dedicated Supabase project's SQL Editor. No login is required.
-- Anyone with the public site configuration can read, replace, or delete content.

create table if not exists public.portfolio_archive (
  id text primary key check (id = 'main'),
  data jsonb not null,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_archive enable row level security;
revoke all on public.portfolio_archive from anon, authenticated;
grant select on public.portfolio_archive to anon;
drop policy if exists "Read shared portfolio" on public.portfolio_archive;
create policy "Read shared portfolio" on public.portfolio_archive for select to anon using (true);

create or replace function public.save_portfolio(archive jsonb, expected_revision integer)
returns table(revision integer)
language plpgsql security definer set search_path = ''
as $$
declare next_revision integer;
begin
  if archive is null or expected_revision is null or expected_revision < 0
     or (archive->>'version') is distinct from '1'
     or jsonb_typeof(archive->'subjects') is distinct from 'array'
     or jsonb_typeof(archive->'professors') is distinct from 'array'
     or jsonb_typeof(archive->'memories') is distinct from 'array'
     or octet_length(archive::text) > 20971520 then
    raise exception 'Invalid archive or archive exceeds 20 MB';
  end if;
  if expected_revision = 0 then
    insert into public.portfolio_archive as a (id, data, revision)
      values ('main', archive, 1) on conflict (id) do nothing
      returning a.revision into next_revision;
  else
    update public.portfolio_archive as a
      set data = archive, revision = a.revision + 1, updated_at = now()
      where a.id = 'main' and a.revision = expected_revision
      returning a.revision into next_revision;
  end if;
  if next_revision is not null then
    return query select next_revision;
  end if;
end;
$$;
revoke all on function public.save_portfolio(jsonb, integer) from public, authenticated;
grant execute on function public.save_portfolio(jsonb, integer) to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-files', 'portfolio-files', false, 10485760,
  array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Read portfolio files" on storage.objects;
drop policy if exists "Upload portfolio files" on storage.objects;
drop policy if exists "Delete portfolio files" on storage.objects;
create policy "Read portfolio files" on storage.objects for select to anon using (bucket_id = 'portfolio-files');
create policy "Upload portfolio files" on storage.objects for insert to anon with check (bucket_id = 'portfolio-files');
create policy "Delete portfolio files" on storage.objects for delete to anon using (bucket_id = 'portfolio-files');
