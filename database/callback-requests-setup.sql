-- Initial setup for a NEW, dedicated Supabase project. Run once in SQL Editor.
-- No patient records or administrator accounts are seeded here.
begin;
create extension if not exists btree_gist with schema extensions;
set local search_path=public,extensions,pg_catalog;
create table public.clinic_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 is_active boolean not null default true
);
create table public.callback_slots (
 id uuid primary key default gen_random_uuid(), doctor_id text not null check(doctor_id ~ '^[a-z0-9-]{1,60}$'),
 starts_at timestamptz not null, ends_at timestamptz not null,
 active boolean not null default true,
 check(ends_at=starts_at+interval '1 hour'), unique(doctor_id,starts_at)
);
create table public.callback_requests (
 id uuid primary key default gen_random_uuid(), attempt_id uuid not null unique,
 fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
 doctor_id text not null, doctor_name text not null check(length(doctor_name) between 2 and 150),
 specialty text not null check(length(specialty) between 2 and 200),
 patient_name text not null check(length(patient_name) between 2 and 80),
 phone text not null check(phone ~ '^\+380[0-9]{9}$'),
 preferred_slot_id uuid not null references public.callback_slots(id),
 preferred_start timestamptz not null, preferred_end timestamptz not null,
 status text not null default 'new' check(status in ('new','contacted','confirmed','cancelled')),
 confirmed_start timestamptz, confirmed_end timestamptz,
 consent_at timestamptz not null default now(), consent_version text not null default '2026-10-19',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id), version integer not null default 1 check(version>0),
 check(preferred_end=preferred_start+interval '1 hour'),
 check((status='confirmed' and confirmed_start is not null and confirmed_end=confirmed_start+interval '1 hour') or (status<>'confirmed' and confirmed_start is null and confirmed_end is null)),
 exclude using gist(doctor_id with =,tstzrange(confirmed_start,confirmed_end,'[)') with &&) where(status='confirmed')
);
create index callback_requests_queue on public.callback_requests(status,created_at desc);
create table public.callback_request_limits (
 key text not null check(key ~ '^[a-f0-9]{64}$'), bucket timestamptz not null,
 hits integer not null check(hits>0), primary key(key,bucket)
);
alter table public.clinic_admins enable row level security;
alter table public.callback_slots enable row level security;
alter table public.callback_requests enable row level security;
alter table public.callback_request_limits enable row level security;
revoke all on public.clinic_admins,public.callback_slots,public.callback_requests,public.callback_request_limits from public,anon,authenticated;
grant all on public.clinic_admins,public.callback_slots,public.callback_requests,public.callback_request_limits to service_role;
grant select on public.clinic_admins to authenticated;
create policy self_admin on public.clinic_admins for select to authenticated using(user_id=(select auth.uid()) and is_active);
grant select,insert on public.callback_slots to authenticated;
grant update(active) on public.callback_slots to authenticated;
create policy admin_read_slots on public.callback_slots for select to authenticated using(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
create policy admin_insert_slots on public.callback_slots for insert to authenticated with check(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
create policy admin_update_slots on public.callback_slots for update to authenticated using(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active)) with check(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
grant select(id,doctor_id,doctor_name,specialty,patient_name,phone,preferred_slot_id,preferred_start,preferred_end,status,confirmed_start,confirmed_end,created_at,updated_at,version) on public.callback_requests to authenticated;
grant update(status,confirmed_start) on public.callback_requests to authenticated;
create policy admin_read_requests on public.callback_requests for select to authenticated using(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
create policy admin_update_requests on public.callback_requests for update to authenticated using(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active)) with check(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
create function public.callback_request_changed() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.clinic_admins where user_id=auth.uid() and is_active) then raise exception 'not_authorized'; end if;
 if new.status='confirmed' then
  if new.confirmed_start is null or new.confirmed_start<now() then raise exception 'invalid_date'; end if;
  new.confirmed_end=new.confirmed_start+interval '1 hour';
 else new.confirmed_start=null;new.confirmed_end=null; end if;
 new.version=old.version+1;new.updated_at=now();new.updated_by=auth.uid();return new;
end $$;
revoke all on function public.callback_request_changed() from public,anon,authenticated;
create trigger callback_request_changed before update on public.callback_requests for each row execute function public.callback_request_changed();
create function public.callback_available_slots(p_doctor_id text,p_start date,p_end date) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'start',s.starts_at,'end',s.ends_at) order by s.starts_at),'[]'::jsonb)
 from public.callback_slots s where s.doctor_id=p_doctor_id and s.active and s.starts_at>now()
 and (s.starts_at at time zone 'Europe/Kyiv')::date between p_start and p_end
 and not exists(select 1 from public.callback_requests r where r.doctor_id=s.doctor_id and r.status='confirmed' and tstzrange(r.confirmed_start,r.confirmed_end,'[)') && tstzrange(s.starts_at,s.ends_at,'[)'));
$$;
revoke all on function public.callback_available_slots(text,date,date) from public,anon,authenticated;
grant execute on function public.callback_available_slots(text,date,date) to service_role;
create function public.submit_callback_request(p_attempt_id uuid,p_fingerprint text,p_ip_key text,p_phone_key text,p_doctor_id text,p_doctor_name text,p_specialty text,p_patient_name text,p_phone text,p_slot_id uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare previous public.callback_requests%rowtype; slot public.callback_slots%rowtype; receipt uuid; hit_count integer; limit_bucket timestamptz;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_attempt_id::text,0));
 select * into previous from public.callback_requests where attempt_id=p_attempt_id;
 if found then
  if previous.fingerprint<>p_fingerprint then raise exception 'attempt_conflict';end if;
  return jsonb_build_object('id',previous.id);
 end if;
 select * into slot from public.callback_slots where id=p_slot_id and doctor_id=p_doctor_id and active and starts_at>now() for share;
 if not found then raise exception 'slot_taken';end if;
 if exists(select 1 from public.callback_requests r where r.doctor_id=p_doctor_id and r.status='confirmed' and tstzrange(r.confirmed_start,r.confirmed_end,'[)') && tstzrange(slot.starts_at,slot.ends_at,'[)')) then raise exception 'slot_taken';end if;
 limit_bucket=to_timestamp(floor(extract(epoch from now())/600)*600);
 insert into public.callback_request_limits as l(key,bucket,hits) values(p_ip_key,limit_bucket,1) on conflict(key,bucket) do update set hits=l.hits+1 where l.hits<5 returning l.hits into hit_count;
 if hit_count is null then raise exception 'request_limit';end if;
 limit_bucket=to_timestamp(floor(extract(epoch from now())/1800)*1800);
 hit_count=null;
 insert into public.callback_request_limits as l(key,bucket,hits) values(p_phone_key,limit_bucket,1) on conflict(key,bucket) do update set hits=l.hits+1 where l.hits<3 returning l.hits into hit_count;
 if hit_count is null then raise exception 'request_limit';end if;
 delete from public.callback_request_limits where callback_request_limits.bucket<now()-interval '1 day';
 insert into public.callback_requests(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,preferred_slot_id,preferred_start,preferred_end) values(p_attempt_id,p_fingerprint,p_doctor_id,p_doctor_name,p_specialty,p_patient_name,p_phone,slot.id,slot.starts_at,slot.ends_at) returning id into receipt;
 return jsonb_build_object('id',receipt);
end $$;
revoke all on function public.submit_callback_request(uuid,text,text,text,text,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.submit_callback_request(uuid,text,text,text,text,text,text,text,text,uuid) to service_role;
commit;
