import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
const admin='11111111-1111-4111-8111-111111111111',outsider='22222222-2222-4222-8222-222222222222';
async function database(){const db=new PGlite({extensions:{btree_gist}});await db.exec(`create schema auth;create schema extensions;create role anon;create role authenticated;create role service_role bypassrls;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;insert into auth.users values('${admin}'),('${outsider}');`);for(const file of ['callback-requests-setup.sql','administrator-requests-migration.sql','crm-workspace-migration.sql'])await db.exec(await readFile(new URL('../../database/'+file,import.meta.url),'utf8'));await db.query('insert into public.clinic_admins(user_id) values($1)',[admin]);return db;}
async function role(db,name,user=''){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role '+name);}
async function manual(db,attempt='44444444-4444-4444-8444-444444444444',fingerprint='a'.repeat(64)){return (await db.query('select public.crm_create_request($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as receipt',[attempt,fingerprint,'unassigned','Допоможіть обрати лікаря','Декларація з терапевтом','Тест Пацієнт','+380970000000','Декларація з терапевтом',null,null,'fixture@example.test','Тестове звернення'])).rows[0].receipt;}
async function list(db,{status='all',kind='all',search='',doctor='',priority='all',due=false,day=null,offset=0}={}){return (await db.query('select public.crm_list_requests($1,$2,$3,$4,$5,$6,$7,$8) as result',[status,kind,search,doctor,priority,due,day,offset])).rows[0].result;}
test('CRM preserves privacy, records administrator provenance and immutable history, and deduplicates manual entry',async()=>{
 const db=await database();try{
  await role(db,'authenticated',admin);const first=await manual(db),again=await manual(db);assert.equal(first.id,again.id);await assert.rejects(manual(db,undefined,'d'.repeat(64)),e=>e.message==='attempt_conflict');
  let result=await list(db);assert.equal(result.total,1);assert.equal(result.requests[0].source,'administrator');assert.equal(result.summary.declarations,1);assert.equal(result.summary.new,1);
  await db.query("update public.callback_requests set status='contacted',assignee='Тест Адміністратор',priority='high',follow_up_at=now()-interval '1 hour',last_note='Тестова нотатка' where id=$1",[first.id]);
  result=await list(db,{due:true,priority:'high',kind:'declaration'});assert.equal(result.total,1);assert.equal(result.requests[0].version,2);assert.equal(result.summary.due,1);
  let history=(await db.query('select * from public.crm_activity where request_id=$1 order by created_at',[first.id])).rows;assert.equal(history.length,2);assert.equal(history[0].actor_id,admin);assert.equal(history[1].changes.last_note.to,'Тестова нотатка');assert.ok(!JSON.stringify(history).includes('+380970000000'));
  await assert.rejects(db.query("update public.crm_activity set changes='{}'"),e=>e.code==='42501');await assert.rejects(db.query('delete from public.crm_activity'),e=>e.code==='42501');
  await assert.rejects(db.query("update public.callback_requests set source='website'"),e=>e.code==='42501');
  await db.query('update public.callback_requests set resolved_at=now() where id=$1',[first.id]);assert.equal((await list(db,{status:'completed'})).total,1);assert.equal((await list(db,{due:true})).total,0);
  await role(db,'authenticated',outsider);assert.equal((await list(db)).total,0);assert.equal((await db.query('select * from public.crm_activity')).rows.length,0);await assert.rejects(manual(db),e=>e.message==='not_authorized');assert.equal((await db.query("select public.crm_contacts('',0) as result")).rows[0].result.total,0);
  await role(db,'anon');await assert.rejects(db.query('select * from public.crm_activity'),e=>e.code==='42501');await assert.rejects(list(db),e=>e.code==='42501');
 }finally{await db.close();}
});
test('CRM counts all results across pages, performs literal search and groups contacts without fabricating patients',async()=>{
 const db=await database();try{
  await role(db,'service_role');await db.exec("insert into public.callback_requests(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,requested_service) select gen_random_uuid(),repeat('a',64),'unassigned','Тестовий лікар','Терапія','Тест Пацієнт '||i,'+380970000000','Терапія' from generate_series(1,51) i");
  await role(db,'authenticated',admin);let result=await list(db);assert.equal(result.total,51);assert.equal(result.requests.length,50);assert.equal(result.summary.all,51);assert.equal((await list(db,{offset:50})).requests.length,1);
  assert.equal((await list(db,{search:'*'})).total,0);assert.equal((await list(db,{search:'970000000'})).total,51);
  const contacts=(await db.query("select public.crm_contacts('',0) as result")).rows[0].result;assert.equal(contacts.total,1);assert.equal(contacts.contacts[0].request_count,51);
 }finally{await db.close();}
});
test('CRM allows notes and completion on an existing past appointment and retains confirmation conflict protection',async()=>{
 const db=await database();try{
  await role(db,'service_role');const {rows:[row]}=await db.query("insert into public.callback_requests(attempt_id,fingerprint,doctor_id,doctor_name,specialty,patient_name,phone,status,confirmed_start,confirmed_end) values(gen_random_uuid(),repeat('a',64),'sokrut','Тестовий лікар','Ендокринолог','Тест Пацієнт','+380970000000','confirmed','2020-01-20T08:00:00Z','2020-01-20T09:00:00Z') returning id");
  await role(db,'authenticated',admin);await db.query("update public.callback_requests set last_note='Візит завершено',resolved_at=now() where id=$1",[row.id]);const result=await list(db,{status:'completed'});assert.equal(result.total,1);assert.ok(result.requests[0].confirmed_start);assert.equal(result.requests[0].status,'confirmed');
  await assert.rejects(db.query("update public.callback_requests set confirmed_start='2020-01-20T10:00:00Z' where id=$1",[row.id]),e=>e.message==='invalid_date');
 }finally{await db.close();}
});
