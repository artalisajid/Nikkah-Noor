-- Nikkah Noor Supabase schema
-- Run this in the Supabase SQL editor before adding EXPO_PUBLIC_SUPABASE_* values.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id text primary key,
  handle text unique,
  email text,
  full_name text not null,
  age integer,
  gender text check (gender in ('male', 'female')),
  city text,
  country text default 'Pakistan',
  phone text,
  marital_status text,
  profession text,
  education text,
  living_situation text,
  children text,
  income_range text,
  sect text,
  prayer text,
  quran text,
  family_type text,
  photo_privacy text,
  photo_url text,
  bio text,
  tags jsonb not null default '[]'::jsonb,
  verification jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  compatibility integer,
  first_wife_consent boolean not null default false,
  planned_arrangement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text;

create table if not exists public.profile_private (
  id text primary key references public.profiles(id) on delete cascade,
  email text,
  phone text,
  first_wife_consent boolean not null default false,
  planned_arrangement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profile_private (
  id,
  email,
  phone,
  first_wife_consent,
  planned_arrangement,
  updated_at
)
select
  id,
  email,
  phone,
  first_wife_consent,
  planned_arrangement,
  now()
from public.profiles
where email is not null
  or phone is not null
  or first_wife_consent is true
  or planned_arrangement is not null
on conflict (id) do update set
  email = excluded.email,
  phone = excluded.phone,
  first_wife_consent = excluded.first_wife_consent,
  planned_arrangement = excluded.planned_arrangement,
  updated_at = now();

create table if not exists public.matches (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  matched_user_id text not null references public.profiles(id) on delete cascade,
  matched_at timestamptz not null default now(),
  unread integer not null default 0,
  unique (user_id, matched_user_id)
);

create table if not exists public.messages (
  id text primary key,
  conversation_id text not null,
  sender_id text not null references public.profiles(id) on delete cascade,
  receiver_id text not null references public.profiles(id) on delete cascade,
  body text not null,
  time_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  relation text not null,
  phone text,
  permission text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  time_label text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.push_tokens (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  device_name text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create table if not exists public.interactions (
  id text primary key,
  actor_id text not null references public.profiles(id) on delete cascade,
  target_id text not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('pass', 'like', 'super_like', 'block')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id text primary key,
  reporter_id text not null references public.profiles(id) on delete cascade,
  reported_user_id text references public.profiles(id) on delete set null,
  reason text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_profiles_gender_created_at on public.profiles (gender, created_at desc);
create index if not exists idx_matches_user_id on public.matches (user_id);
create index if not exists idx_matches_matched_user_id on public.matches (matched_user_id);
create index if not exists idx_messages_conversation_id_created_at on public.messages (conversation_id, created_at);
create index if not exists idx_messages_sender_receiver on public.messages (sender_id, receiver_id);
create index if not exists idx_family_members_user_id on public.family_members (user_id);
create index if not exists idx_notifications_user_id_created_at on public.notifications (user_id, created_at desc);
create index if not exists idx_push_tokens_user_id_enabled on public.push_tokens (user_id, enabled);
create index if not exists idx_interactions_actor_target on public.interactions (actor_id, target_id);
create index if not exists idx_reports_reporter_id on public.reports (reporter_id);
create index if not exists idx_account_deletion_requests_user_id on public.account_deletion_requests (user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'messages_body_length'
  ) then
    alter table public.messages
      add constraint messages_body_length check (char_length(trim(body)) between 1 and 1000);
  end if;
end $$;

alter table public.interactions
  drop constraint if exists interactions_action_check;

alter table public.interactions
  add constraint interactions_action_check check (action in ('pass', 'like', 'super_like', 'block'));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
    ) then
      alter publication supabase_realtime add table public.profiles;
    end if;
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.family_members enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.interactions enable row level security;
alter table public.reports enable row level security;
alter table public.account_deletion_requests enable row level security;

drop policy if exists "prototype read profiles" on public.profiles;
drop policy if exists "prototype write profiles" on public.profiles;
drop policy if exists "prototype read matches" on public.matches;
drop policy if exists "prototype write matches" on public.matches;
drop policy if exists "prototype read messages" on public.messages;
drop policy if exists "prototype write messages" on public.messages;
drop policy if exists "prototype family access" on public.family_members;
drop policy if exists "prototype notifications access" on public.notifications;
drop policy if exists "prototype push token access" on public.push_tokens;
drop policy if exists "prototype interactions access" on public.interactions;
drop policy if exists "prototype reports access" on public.reports;
drop policy if exists "profile private owner access" on public.profile_private;
drop policy if exists "account deletion owner access" on public.account_deletion_requests;

drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profile owner insert" on public.profiles;
create policy "profile owner insert" on public.profiles
  for insert to authenticated with check (id = (select auth.uid())::text);

drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles
  for update to authenticated using (id = (select auth.uid())::text) with check (id = (select auth.uid())::text);

drop policy if exists "profile owner delete" on public.profiles;
create policy "profile owner delete" on public.profiles
  for delete to authenticated using (id = (select auth.uid())::text);

drop policy if exists "profile private owner access" on public.profile_private;
create policy "profile private owner access" on public.profile_private
  for all to authenticated using (id = (select auth.uid())::text) with check (id = (select auth.uid())::text);

drop policy if exists "match participants read" on public.matches;
create policy "match participants read" on public.matches
  for select to authenticated using (user_id = (select auth.uid())::text or matched_user_id = (select auth.uid())::text);

drop policy if exists "match owner insert" on public.matches;
create policy "match owner insert" on public.matches
  for insert to authenticated with check (user_id = (select auth.uid())::text);

drop policy if exists "match owner update" on public.matches;
create policy "match owner update" on public.matches
  for update to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

drop policy if exists "match owner delete" on public.matches;
create policy "match owner delete" on public.matches
  for delete to authenticated using (user_id = (select auth.uid())::text);

drop policy if exists "message participants read" on public.messages;
create policy "message participants read" on public.messages
  for select to authenticated using (sender_id = (select auth.uid())::text or receiver_id = (select auth.uid())::text);

drop policy if exists "message sender insert" on public.messages;
create policy "message sender insert" on public.messages
  for insert to authenticated with check (sender_id = (select auth.uid())::text);

drop policy if exists "message sender update" on public.messages;
create policy "message sender update" on public.messages
  for update to authenticated using (sender_id = (select auth.uid())::text) with check (sender_id = (select auth.uid())::text);

drop policy if exists "family owner access" on public.family_members;
create policy "family owner access" on public.family_members
  for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

drop policy if exists "notification owner access" on public.notifications;
create policy "notification owner access" on public.notifications
  for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

drop policy if exists "push token owner access" on public.push_tokens;
create policy "push token owner access" on public.push_tokens
  for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

drop policy if exists "interaction owner access" on public.interactions;
create policy "interaction owner access" on public.interactions
  for all to authenticated using (actor_id = (select auth.uid())::text) with check (actor_id = (select auth.uid())::text);

drop policy if exists "report owner access" on public.reports;
create policy "report owner access" on public.reports
  for all to authenticated using (reporter_id = (select auth.uid())::text) with check (reporter_id = (select auth.uid())::text);

drop policy if exists "account deletion owner access" on public.account_deletion_requests;
create policy "account deletion owner access" on public.account_deletion_requests
  for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

grant usage on schema public to authenticated;
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select (
  id,
  handle,
  full_name,
  age,
  gender,
  city,
  country,
  marital_status,
  profession,
  education,
  living_situation,
  children,
  income_range,
  sect,
  prayer,
  quran,
  family_type,
  photo_privacy,
  photo_url,
  bio,
  tags,
  verification,
  preferences,
  stats,
  compatibility,
  created_at,
  updated_at
) on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profile_private to authenticated;
grant select, insert, update, delete on public.matches to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.push_tokens to authenticated;
grant select, insert, update, delete on public.interactions to authenticated;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.account_deletion_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "prototype profile photo read" on storage.objects;
drop policy if exists "prototype profile photo upload" on storage.objects;
drop policy if exists "prototype profile photo update" on storage.objects;

drop policy if exists "profile photo owner upload" on storage.objects;
create policy "profile photo owner upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "profile photo owner update" on storage.objects;
create policy "profile photo owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
