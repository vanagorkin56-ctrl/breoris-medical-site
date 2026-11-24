-- Apply after callback-requests-setup.sql. Existing requests and slots are retained.
begin;
alter table public.callback_requests alter column preferred_slot_id drop not null;
alter table public.callback_requests alter column preferred_start drop not null;
alter table public.callback_requests alter column preferred_end drop not null;
alter table public.callback_requests add column requested_service text not null default '' check(length(requested_service)<=120);
alter table public.callback_requests add column preferred_date date;
alter table public.callback_requests add column preferred_time time;
alter table public.callback_requests add column email text not null default '' check(length(email)<=254);
alter table public.callback_requests add column comment text not null default '' check(length(comment)<=600);
alter table public.callback_requests add constraint request_time_needs_date check(preferred_time is null or preferred_date is not null);
alter table public.callback_requests add constraint confirmed_request_needs_doctor check(status<>'confirmed' or doctor_id<>'unassigned');
grant select(requested_service,preferred_date,preferred_time,email,comment) on public.callback_requests to authenticated;
grant update(doctor_id,doctor_name,specialty) on public.callback_requests to authenticated;
create function public.submit_administrator_request(
 p_attempt_id uuid,p_fingerprint text,p_ip_key text,p_phone_key text,
 p_doctor_id text,p_doctor_name text,p_specialty text,p_patient_name text,p_phone text,
 p_requested_service text,p_preferred_date date,p_preferred_time time,p_email text,p_comment text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare previous public.callback_requests%rowtype;receipt uuid;hit_count integer;limit_bucket timestamptz;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_attempt_id::text,0));
 select * into previous from public.callback_requests where attempt_id=p_attempt_id;
 if found then
  if previous.fingerprint<>p_fingerprint then raise exception 'attempt_conflict';end if;
  return jsonb_build_object('id',previous.id);
 end if;
 if p_preferred_date is not null and p_preferred_date<(now() at time zone 'Europe/Kyiv')::date then raise exception 'invalid_date';end if;
 limit_bucket=to_timestamp(floor(extract(epoch from now())/600)*600);
 insert into public.callback_request_limits as l(key,bucket,hits) values(p_ip_key,limit_bucket,1)
 on conflict(key,bucket) do update set hits=l.hits+1 where l.hits<5 returning l.hits into hit_count;
 if hit_count is null then raise exception 'request_limit';end if;
 limit_bucket=to_timestamp(floor(extract(epoch from now())/1800)*1800);hit_count=null;
 insert into public.callback_request_limits as l(key,bucket,hits) values(p_phone_key,limit_bucket,1)
 on conflict(key,bucket) do update set hits=l.hits+1 where l.hits<3 returning l.hits into hit_count;
 if hit_count is null then raise exception 'request_limit';end if;
 delete from public.callback_request_limits where bucket<now()-interval '1 day';
 insert into public.callback_requests(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,
 requested_service,preferred_date,preferred_time,email,comment,consent_version)
 values(p_attempt_id,p_fingerprint,p_doctor_id,p_doctor_name,p_specialty,p_patient_name,p_phone,
 p_requested_service,p_preferred_date,p_preferred_time,p_email,p_comment,'2026-11-24') returning id into receipt;
 return jsonb_build_object('id',receipt);
end $$;
revoke all on function public.submit_administrator_request(uuid,text,text,text,text,text,text,text,text,text,date,time,text,text) from public,anon,authenticated;
grant execute on function public.submit_administrator_request(uuid,text,text,text,text,text,text,text,text,text,date,time,text,text) to service_role;
commit;
