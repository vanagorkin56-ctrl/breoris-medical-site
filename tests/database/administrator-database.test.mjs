import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
const admin='11111111-1111-4111-8111-111111111111',outsider='22222222-2222-4222-8222-222222222222';
async function database(){const db=new PGlite({extensions:{btree_gist}});await db.exec(`create schema auth;create schema extensions;create role anon;create role authenticated;create role service_role bypassrls;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;insert into auth.users values('${admin}'),('${outsider}');`);for(const file of ['callback-requests-setup.sql','administrator-requests-migration.sql'])await db.exec(await readFile(new URL('../../database/'+file,import.meta.url),'utf8'));await db.query('insert into public.clinic_admins(user_id) values($1)',[admin]);return db;}
async function role(db,name,user=''){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role '+name);}
async function submit(db,id='44444444-4444-4444-8444-444444444444',fingerprint='a'.repeat(64)){return (await db.query('select public.submit_administrator_request($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) as receipt',[id,fingerprint,'b'.repeat(64),'c'.repeat(64),'unassigned','Допоможіть обрати лікаря','Вакцинація','Тест Пацієнт','+380970000000','Вакцинація','2027-01-20','10:30','fixture@example.test','Зателефонуйте після обіду'])).rows[0].receipt;}
test('slot-free requests persist once, remain pending, and are private to clinic administrators',async()=>{
 const db=await database();try{
  await role(db,'service_role');const first=await submit(db),same=await submit(db);assert.equal(first.id,same.id);
  const rows=(await db.query('select * from public.callback_requests')).rows;assert.equal(rows.length,1);assert.equal(rows[0].status,'new');assert.equal(rows[0].preferred_slot_id,null);assert.equal(rows[0].preferred_start,null);assert.equal(rows[0].requested_service,'Вакцинація');assert.equal(rows[0].comment,'Зателефонуйте після обіду');assert.equal(rows[0].consent_version,'2026-11-24');
  assert.equal((await db.query('select * from public.callback_slots')).rows.length,0);
  await assert.rejects(submit(db,undefined,'d'.repeat(64)),e=>e.message==='attempt_conflict');
  await role(db,'anon');await assert.rejects(db.query('select email,comment from public.callback_requests'),e=>e.code==='42501');
  await assert.rejects(db.query('select public.submit_administrator_request(null,null,null,null,null,null,null,null,null,null,null,null,null,null)'),e=>e.code==='42501');
  await role(db,'authenticated',outsider);assert.equal((await db.query('select email,comment from public.callback_requests')).rows.length,0);
  await role(db,'authenticated',admin);assert.equal((await db.query('select email,comment,preferred_date,preferred_time from public.callback_requests')).rows.length,1);
  await assert.rejects(db.query("update public.callback_requests set status='confirmed',confirmed_start='2027-01-20T10:30:00+02:00' where id=$1",[first.id]),e=>e.code==='23514');
  await db.query("update public.callback_requests set doctor_id='sokrut',doctor_name='Тестовий лікар',specialty='Ендокринолог',status='confirmed',confirmed_start='2027-01-20T10:30:00+02:00' where id=$1",[first.id]);
  assert.equal((await db.query('select status from public.callback_requests where id=$1',[first.id])).rows[0].status,'confirmed');
 }finally{await db.close();}
});
