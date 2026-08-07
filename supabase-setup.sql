-- ORLANDO ONE-TIME SUPABASE SETUP
-- Universal schedule editing PIN: 190526
-- This PIN edits either family's schedule. Keep it private.
-- To use a different PIN, replace 190526 below BEFORE running this file.

create extension if not exists pgcrypto;

create table if not exists public.schedule_slots (
  trip_date date not null,
  family_id text not null check (family_id in ('peterborough','sthelens')),
  slot text not null check (slot in ('m','a','e')),
  location text not null default 'Flexible time',
  details text not null default '',
  updated_at timestamptz not null default now(),
  primary key (trip_date,family_id,slot)
);

create table if not exists public.app_edit_key (
 id boolean primary key default true check (id),
 pin_hash text not null
);
revoke all on public.app_edit_key from anon, authenticated;
insert into public.app_edit_key(id,pin_hash) values
 (true,crypt('190526',gen_salt('bf')))
on conflict (id) do update set pin_hash=excluded.pin_hash;


create or replace function public.verify_access_pin(p_pin text)
returns boolean
language sql security definer set search_path=public,extensions as $$
 select exists(
   select 1 from public.app_edit_key k
   where k.pin_hash=crypt(p_pin,k.pin_hash)
 );
$$;
revoke all on function public.verify_access_pin(text) from public;
grant execute on function public.verify_access_pin(text) to anon, authenticated;

insert into public.schedule_slots(trip_date,family_id,slot,location,details) values
('2026-08-14','peterborough','m','Flexible time',''),
('2026-08-14','peterborough','a','Flexible time',''),
('2026-08-14','peterborough','e','Flexible time',''),
('2026-08-14','sthelens','m','Travel',''),
('2026-08-14','sthelens','a','Travel',''),
('2026-08-14','sthelens','e','Disney Springs',''),
('2026-08-15','peterborough','m','Flexible time',''),
('2026-08-15','peterborough','a','Flexible time',''),
('2026-08-15','peterborough','e','Flexible time',''),
('2026-08-15','sthelens','m','Magic Kingdom',''),
('2026-08-15','sthelens','a','Magic Kingdom',''),
('2026-08-15','sthelens','e','Magic Kingdom',''),
('2026-08-16','peterborough','m','Flexible time',''),
('2026-08-16','peterborough','a','Flexible time',''),
('2026-08-16','peterborough','e','Flexible time',''),
('2026-08-16','sthelens','m','Animal Kingdom',''),
('2026-08-16','sthelens','a','EPCOT',''),
('2026-08-16','sthelens','e','EPCOT',''),
('2026-08-17','peterborough','m','Flexible time',''),
('2026-08-17','peterborough','a','Flexible time',''),
('2026-08-17','peterborough','e','Flexible time',''),
('2026-08-17','sthelens','m','Water Park',''),
('2026-08-17','sthelens','a','Hollywood Studios',''),
('2026-08-17','sthelens','e','Hollywood Studios',''),
('2026-08-18','peterborough','m','Flexible time',''),
('2026-08-18','peterborough','a','Flexible time',''),
('2026-08-18','peterborough','e','Flexible time',''),
('2026-08-18','sthelens','m','Magic Kingdom',''),
('2026-08-18','sthelens','a','Magic Kingdom',''),
('2026-08-18','sthelens','e','Disney Springs',''),
('2026-08-19','peterborough','m','Flexible time',''),
('2026-08-19','peterborough','a','Flexible time',''),
('2026-08-19','peterborough','e','Flexible time',''),
('2026-08-19','sthelens','m','EPCOT',''),
('2026-08-19','sthelens','a','EPCOT',''),
('2026-08-19','sthelens','e','EPCOT',''),
('2026-08-20','peterborough','m','Travel',''),
('2026-08-20','peterborough','a','Travel',''),
('2026-08-20','peterborough','e','Flexible time',''),
('2026-08-20','sthelens','m','Hollywood Studios',''),
('2026-08-20','sthelens','a','Hollywood Studios',''),
('2026-08-20','sthelens','e','Hollywood Studios',''),
('2026-08-21','peterborough','m','Magic Kingdom',''),
('2026-08-21','peterborough','a','Flexible time',''),
('2026-08-21','peterborough','e','EPCOT',''),
('2026-08-21','sthelens','m','Magic Kingdom',''),
('2026-08-21','sthelens','a','Magic Kingdom',''),
('2026-08-21','sthelens','e','Magic Kingdom',''),
('2026-08-22','peterborough','m','Animal Kingdom',''),
('2026-08-22','peterborough','a','Flexible time',''),
('2026-08-22','peterborough','e','Disney Springs',''),
('2026-08-22','sthelens','m','Animal Kingdom',''),
('2026-08-22','sthelens','a','Animal Kingdom',''),
('2026-08-22','sthelens','e','Disney Springs',''),
('2026-08-23','peterborough','m','Celebration',''),
('2026-08-23','peterborough','a','EPCOT',''),
('2026-08-23','peterborough','e','EPCOT',''),
('2026-08-23','sthelens','m','Water Park',''),
('2026-08-23','sthelens','a','Water Park',''),
('2026-08-23','sthelens','e','Water Park',''),
('2026-08-24','peterborough','m','Hollywood Studios',''),
('2026-08-24','peterborough','a','Flexible time',''),
('2026-08-24','peterborough','e','Magic Kingdom',''),
('2026-08-24','sthelens','m','Hollywood Studios',''),
('2026-08-24','sthelens','a','Hollywood Studios',''),
('2026-08-24','sthelens','e','Hollywood Studios',''),
('2026-08-25','peterborough','m','EPCOT',''),
('2026-08-25','peterborough','a','Magic Kingdom',''),
('2026-08-25','peterborough','e','Flexible time',''),
('2026-08-25','sthelens','m','Magic Kingdom',''),
('2026-08-25','sthelens','a','Magic Kingdom',''),
('2026-08-25','sthelens','e','Magic Kingdom',''),
('2026-08-26','peterborough','m','Magic Kingdom',''),
('2026-08-26','peterborough','a','Flexible time',''),
('2026-08-26','peterborough','e','CityWalk',''),
('2026-08-26','sthelens','m','Hollywood Studios',''),
('2026-08-26','sthelens','a','Hollywood Studios',''),
('2026-08-26','sthelens','e','Magic Kingdom',''),
('2026-08-27','peterborough','m','Epic Universe',''),
('2026-08-27','peterborough','a','Epic Universe',''),
('2026-08-27','peterborough','e','Epic Universe',''),
('2026-08-27','sthelens','m','EPCOT',''),
('2026-08-27','sthelens','a','EPCOT',''),
('2026-08-27','sthelens','e','Magic Kingdom',''),
('2026-08-28','peterborough','m','Universal / Islands of Adventure',''),
('2026-08-28','peterborough','a','Universal / Islands of Adventure',''),
('2026-08-28','peterborough','e','Universal / Islands of Adventure',''),
('2026-08-28','sthelens','m','Cruise',''),
('2026-08-28','sthelens','a','Cruise',''),
('2026-08-28','sthelens','e','Cruise',''),
('2026-08-29','peterborough','m','Animal Kingdom',''),
('2026-08-29','peterborough','a','Flexible time',''),
('2026-08-29','peterborough','e','Flexible time',''),
('2026-08-29','sthelens','m','Nassau',''),
('2026-08-29','sthelens','a','Nassau',''),
('2026-08-29','sthelens','e','Cruise',''),
('2026-08-30','peterborough','m','EPCOT',''),
('2026-08-30','peterborough','a','Flexible time',''),
('2026-08-30','peterborough','e','Flexible time',''),
('2026-08-30','sthelens','m','Castaway Cay',''),
('2026-08-30','sthelens','a','Castaway Cay',''),
('2026-08-30','sthelens','e','Cruise',''),
('2026-08-31','peterborough','m','Flexible time',''),
('2026-08-31','peterborough','a','EPCOT',''),
('2026-08-31','peterborough','e','EPCOT',''),
('2026-08-31','sthelens','m','Cruise',''),
('2026-08-31','sthelens','a','EPCOT',''),
('2026-08-31','sthelens','e','EPCOT',''),
('2026-09-01','peterborough','m','Hollywood Studios',''),
('2026-09-01','peterborough','a','Hollywood Studios',''),
('2026-09-01','peterborough','e','Flexible time',''),
('2026-09-01','sthelens','m','Flexible time',''),
('2026-09-01','sthelens','a','Flexible time',''),
('2026-09-01','sthelens','e','Travel',''),
('2026-09-02','peterborough','m','Flexible time',''),
('2026-09-02','peterborough','a','Flexible time',''),
('2026-09-02','peterborough','e','Flexible time',''),
('2026-09-02','sthelens','m','Travel',''),
('2026-09-02','sthelens','a','Home',''),
('2026-09-02','sthelens','e','Home',''),
('2026-09-03','peterborough','m','Flexible time',''),
('2026-09-03','peterborough','a','Flexible time',''),
('2026-09-03','peterborough','e','Flexible time',''),
('2026-09-03','sthelens','m','Flexible time',''),
('2026-09-03','sthelens','a','Flexible time',''),
('2026-09-03','sthelens','e','Flexible time','')
on conflict (trip_date,family_id,slot) do nothing;

alter table public.schedule_slots enable row level security;
drop policy if exists "Anyone can view schedule" on public.schedule_slots;
create policy "Anyone can view schedule" on public.schedule_slots for select to anon, authenticated using (true);

create or replace function public.edit_schedule_slot(
 p_trip_date date, p_family_id text, p_slot text, p_location text, p_details text, p_pin text
) returns public.schedule_slots
language plpgsql security definer set search_path=public,extensions as $$
declare result public.schedule_slots;
begin
 if p_family_id not in ('peterborough','sthelens') or p_slot not in ('m','a','e') then raise exception 'Invalid schedule selection'; end if;
 if not exists(select 1 from public.app_edit_key k where k.pin_hash=crypt(p_pin,k.pin_hash)) then raise exception 'Incorrect universal PIN'; end if;
 update public.schedule_slots set location=coalesce(nullif(trim(p_location),''),'Flexible time'), details=coalesce(trim(p_details),''), updated_at=now()
 where trip_date=p_trip_date and family_id=p_family_id and slot=p_slot returning * into result;
 if result is null then raise exception 'Schedule slot not found'; end if;
 return result;
end $$;
revoke all on function public.edit_schedule_slot(date,text,text,text,text,text) from public;
grant execute on function public.edit_schedule_slot(date,text,text,text,text,text) to anon, authenticated;

create table if not exists public.trip_photos (
 id uuid primary key default gen_random_uuid(), kind text not null check (kind in ('general','food')),
 storage_path text not null, caption text, family_name text not null,
 restaurant text, dish text, rating int check (rating between 1 and 5), notes text,
 created_at timestamptz not null default now()
);
alter table public.trip_photos enable row level security;
drop policy if exists "Anyone can view trip photos" on public.trip_photos;
drop policy if exists "Anyone can add trip photos" on public.trip_photos;
create policy "Anyone can view trip photos" on public.trip_photos for select to anon, authenticated using (true);
create policy "Anyone can add trip photos" on public.trip_photos for insert to anon, authenticated with check (kind in ('general','food'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('trip-photos','trip-photos',true,8388608,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict(id) do update set public=true,file_size_limit=8388608;
drop policy if exists "Anyone can view photo files" on storage.objects;
drop policy if exists "Anyone can upload photo files" on storage.objects;
create policy "Anyone can view photo files" on storage.objects for select to anon, authenticated using (bucket_id='trip-photos');
create policy "Anyone can upload photo files" on storage.objects for insert to anon, authenticated with check (bucket_id='trip-photos');

do $$ begin
 alter publication supabase_realtime add table public.schedule_slots;
exception when duplicate_object then null;
end $$;
