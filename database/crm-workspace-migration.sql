-- Apply after administrator-requests-migration.sql. No patient records are seeded.
begin;
alter table public.callback_requests add column priority text not null default 'normal' check(priority in ('low','normal','high'));
alter table public.callback_requests add column assignee text not null default '' check(length(assignee)<=80);
alter table public.callback_requests add column follow_up_at timestamptz;
alter table public.callback_requests add column resolved_at timestamptz;
alter table public.callback_requests add column last_note text not null default '' check(length(last_note)<=2000);
alter table public.callback_requests add column source text not null default 'website' check(source in ('website','administrator'));
alter table public.callback_requests add column created_by uuid references auth.users(id);
alter table public.callback_requests add column contact_consent_source text not null default 'website-form' check(contact_consent_source in ('website-form','administrator-recorded'));
grant select(priority,assignee,follow_up_at,resolved_at,last_note,source,created_by,contact_consent_source) on public.callback_requests to authenticated;
grant update(priority,assignee,follow_up_at,resolved_at,last_note) on public.callback_requests to authenticated;
grant insert(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,requested_service,preferred_date,preferred_time,email,comment,source,created_by,contact_consent_source,consent_version) on public.callback_requests to authenticated;
create policy admin_create_request on public.callback_requests for insert to authenticated with check(
 exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active)
 and created_by=(select auth.uid()) and source='administrator' and contact_consent_source='administrator-recorded'
);
create table public.crm_activity (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.callback_requests(id),
 actor_id uuid references auth.users(id), event_type text not null check(event_type in ('created','updated')),
 changes jsonb not null, created_at timestamptz not null default now()
);
create index crm_activity_request on public.crm_activity(request_id,created_at desc);
alter table public.crm_activity enable row level security;
revoke all on public.crm_activity from public,anon,authenticated;
grant select on public.crm_activity to authenticated;
grant all on public.crm_activity to service_role;
create policy admin_read_activity on public.crm_activity for select to authenticated using(exists(select 1 from public.clinic_admins where user_id=(select auth.uid()) and is_active));
create function public.record_crm_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare changes jsonb='{}'::jsonb; field text;
begin
 if tg_op='INSERT' then changes=jsonb_build_object('source',new.source);
 else
  foreach field in array array['status','doctor_id','doctor_name','confirmed_start','priority','assignee','follow_up_at','resolved_at','last_note'] loop
   if (to_jsonb(new)->field) is distinct from (to_jsonb(old)->field) then
    changes=changes||jsonb_build_object(field,jsonb_build_object('from',to_jsonb(old)->field,'to',to_jsonb(new)->field));
   end if;
  end loop;
 end if;
 if tg_op='INSERT' or changes<>'{}'::jsonb then
  insert into public.crm_activity(request_id,actor_id,event_type,changes) values(new.id,auth.uid(),case when tg_op='INSERT' then 'created' else 'updated' end,changes);
 end if;
 return new;
end $$;
revoke all on function public.record_crm_activity() from public,anon,authenticated;
create trigger record_crm_activity after insert or update on public.callback_requests for each row execute function public.record_crm_activity();
-- Existing confirmed visits may be annotated/completed after their start time.
create or replace function public.callback_request_changed() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.clinic_admins where user_id=auth.uid() and is_active) then raise exception 'not_authorized';end if;
 if new.status='confirmed' then
  if new.confirmed_start is null or ((old.status<>'confirmed' or new.confirmed_start is distinct from old.confirmed_start or new.doctor_id<>old.doctor_id) and new.confirmed_start<now()) then raise exception 'invalid_date';end if;
  new.confirmed_end=new.confirmed_start+interval '1 hour';
 else new.confirmed_start=null;new.confirmed_end=null;end if;
 new.version=old.version+1;new.updated_at=now();new.updated_by=auth.uid();return new;
end $$;
create index crm_follow_up on public.callback_requests(follow_up_at) where resolved_at is null and status<>'cancelled';
create index crm_agenda on public.callback_requests(confirmed_start) where status='confirmed';
create function public.crm_list_requests(p_status text,p_kind text,p_search text,p_doctor_id text,p_priority text,p_due boolean,p_day date,p_offset integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with visible as (
  select id,doctor_id,doctor_name,specialty,patient_name,phone,preferred_start,preferred_end,status,confirmed_start,created_at,updated_at,version,
  requested_service,preferred_date,preferred_time,email,comment,priority,assignee,follow_up_at,resolved_at,last_note,source
  from public.callback_requests
 ), filtered as (
  select * from visible r where
  (p_status='all' or (p_status='completed' and resolved_at is not null) or (p_status<>'completed' and resolved_at is null and status=p_status))
  and (p_kind='all' or (p_kind='declaration' and requested_service='Декларація з терапевтом') or (p_kind='appointment' and requested_service<>'Декларація з терапевтом'))
  and (p_search='' or strpos(lower(concat_ws(' ',patient_name,phone,email,requested_service,doctor_name,assignee)),lower(p_search))>0)
  and (p_doctor_id='' or doctor_id=p_doctor_id) and (p_priority='all' or priority=p_priority)
  and (not p_due or (follow_up_at<=now() and resolved_at is null and status<>'cancelled'))
  and (p_day is null or (status='confirmed' and resolved_at is null and (confirmed_start at time zone 'Europe/Kyiv')::date=p_day))
 ), page as (select * from filtered order by case when p_day is not null then confirmed_start end asc nulls last,created_at desc,id limit 50 offset greatest(0,least(p_offset,100000)))
 select jsonb_build_object('requests',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'::jsonb),'total',(select count(*) from filtered),
 'summary',jsonb_build_object('all',(select count(*) from visible),'appointments',(select count(*) from visible where requested_service<>'Декларація з терапевтом'),
 'declarations',(select count(*) from visible where requested_service='Декларація з терапевтом'),
 'new',(select count(*) from visible where status='new' and resolved_at is null),
 'due',(select count(*) from visible where follow_up_at<=now() and resolved_at is null and status<>'cancelled'),
 'today',(select count(*) from visible where status='confirmed' and resolved_at is null and (confirmed_start at time zone 'Europe/Kyiv')::date=(now() at time zone 'Europe/Kyiv')::date)));
$$;
revoke all on function public.crm_list_requests(text,text,text,text,text,boolean,date,integer) from public,anon,authenticated;
grant execute on function public.crm_list_requests(text,text,text,text,text,boolean,date,integer) to authenticated;
create function public.crm_create_request(p_attempt_id uuid,p_fingerprint text,p_doctor_id text,p_doctor_name text,p_specialty text,p_patient_name text,p_phone text,p_requested_service text,p_preferred_date date,p_preferred_time time,p_email text,p_comment text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare previous public.callback_requests%rowtype;receipt uuid;
begin
 if not exists(select 1 from public.clinic_admins where user_id=auth.uid() and is_active) then raise exception 'not_authorized';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_attempt_id::text,0));
 select id into receipt from public.callback_requests where attempt_id=p_attempt_id;
 if found then
  -- Fingerprints are intentionally not selectable by browser-role callers.
  -- A separate protected helper compares only the hash and returns no contact data.
  if not public.crm_same_attempt(p_attempt_id,p_fingerprint) then raise exception 'attempt_conflict';end if;
  return jsonb_build_object('id',receipt);
 end if;
 insert into public.callback_requests(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,requested_service,preferred_date,preferred_time,email,comment,source,created_by,contact_consent_source,consent_version)
 values(p_attempt_id,p_fingerprint,p_doctor_id,p_doctor_name,p_specialty,p_patient_name,p_phone,p_requested_service,p_preferred_date,p_preferred_time,p_email,p_comment,'administrator',auth.uid(),'administrator-recorded','staff-recorded-request-2026-11-24') returning id into receipt;
 return jsonb_build_object('id',receipt);
end $$;
-- This helper checks active membership before using its owner privileges.
create function public.crm_same_attempt(p_attempt_id uuid,p_fingerprint text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.clinic_admins where user_id=auth.uid() and is_active)
 and exists(select 1 from public.callback_requests where attempt_id=p_attempt_id and fingerprint=p_fingerprint);
$$;
revoke all on function public.crm_same_attempt(uuid,text) from public,anon,authenticated;
grant execute on function public.crm_same_attempt(uuid,text) to authenticated;
revoke all on function public.crm_create_request(uuid,text,text,text,text,text,text,text,date,time,text,text) from public,anon,authenticated;
grant execute on function public.crm_create_request(uuid,text,text,text,text,text,text,text,date,time,text,text) to authenticated;
grant select(attempt_id) on public.callback_requests to authenticated;
create function public.crm_contacts(p_search text,p_offset integer) returns jsonb language sql stable security invoker set search_path='' as $$
 with contacts as (
  select phone,(array_agg(patient_name order by created_at desc))[1] as name,
  coalesce((array_agg(email order by created_at desc) filter(where email<>''))[1],'') as email,
  count(*) as request_count,max(created_at) as last_contact,max(confirmed_start) as last_visit
  from public.callback_requests group by phone
 ), filtered as (select * from contacts where p_search='' or strpos(lower(concat_ws(' ',name,phone,email)),lower(p_search))>0),
 page as (select * from filtered order by last_contact desc,phone limit 50 offset greatest(0,least(p_offset,100000)))
 select jsonb_build_object('contacts',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'::jsonb),'total',(select count(*) from filtered));
$$;
revoke all on function public.crm_contacts(text,integer) from public,anon,authenticated;
grant execute on function public.crm_contacts(text,integer) to authenticated;
commit;
