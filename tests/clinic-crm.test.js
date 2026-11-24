'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const db=require('../server/clinic-db'),crm=require('../server/clinic-crm');
const auth={token:'fixture-auth',user:{id:'11111111-1111-4111-8111-111111111111'}};
const record=()=>({id:randomUUID(),version:3,status:'new',doctor_id:'unassigned',requested_service:'Декларація з терапевтом',resolved_at:null});
test('authenticated contact search reaches the private contact RPC through the shared request endpoint',async()=>{
 const admin=require('../server/clinic-admin'),handler=require('../api/admin/requests');
 const oldSession=admin.session,oldRequest=db.request;let response;
 admin.session=async()=>auth;
 db.request=async(path,options)=>{assert.equal(path,'/rest/v1/rpc/crm_contacts');assert.equal(options.token,auth.token);assert.ok(!options.service);assert.equal(options.data.p_search,'*),(phone.neq.null');assert.equal(options.data.p_offset,50);return {contacts:[],total:0};};
 try{await handler({method:'GET',headers:{},url:'/api/admin/requests?view=contacts&search='+encodeURIComponent('*),(phone.neq.null')+'&offset=50'},{setHeader(){},status(code){assert.equal(code,200);return this;},json(body){response=body;}});assert.deepEqual(response.contacts,[]);assert.equal(response.total,0);}finally{admin.session=oldSession;db.request=oldRequest;}
});
test('CRM update uses persisted request type and optimistic versioning, with no public write credentials',async()=>{
 const original=db.request;let current=record(),writes=[];db.request=async(path,options)=>{assert.equal(options.token,'fixture-auth');assert.ok(!options.service);if(options.method==='PATCH'){writes.push({path,...options});return [{...current,...options.data,version:4}];}return [current];};
 try{
  await assert.rejects(crm.update(auth,{id:current.id,version:2,status:'completed'}),e=>e.code==='request_changed');assert.equal(writes.length,0);
  await assert.rejects(crm.update(auth,{id:current.id,version:3,status:'confirmed',doctorId:'sokrut',confirmedTime:'2030-01-01T10:00'}),e=>e.code==='invalid_request');assert.equal(writes.length,0);
  const result=await crm.update(auth,{id:current.id,version:3,status:'completed',priority:'high',assignee:'Тест Адміністратор',note:'Тестова нотатка',followUp:''});assert.equal(result.request.status,'contacted');assert.ok(result.request.resolved_at);assert.equal(result.request.last_note,'Тестова нотатка');assert.ok(writes[0].path.includes('version=eq.3'));
  db.request=async(path,options)=>options.method==='PATCH'?[]:[current];await assert.rejects(crm.update(auth,{id:current.id,version:3,status:'contacted'}),e=>e.code==='request_changed');
 }finally{db.request=original;}
});
test('CRM permits annotation of a past confirmed visit while rejecting a newly selected past time',async()=>{
 const original=db.request,current={...record(),status:'confirmed',requested_service:'Ендокринологія',doctor_id:'sokrut',confirmed_start:'2020-01-20T08:00:00+00:00'};db.request=async(path,options)=>options.method==='PATCH'?[{...current,...options.data}]:[current];
 try{const result=await crm.update(auth,{id:current.id,version:3,status:'completed',doctorId:'sokrut',confirmedTime:'2020-01-20T10:00',note:'Тестова нотатка'});assert.equal(result.request.status,'confirmed');assert.ok(result.request.resolved_at);await assert.rejects(crm.update(auth,{id:current.id,version:3,status:'confirmed',doctorId:'sokrut',confirmedTime:'2020-01-20T11:00'}),e=>e.code==='invalid_date');const reset=await crm.update(auth,{id:current.id,version:3,status:'contacted',doctorId:''});assert.equal(reset.request.doctor_id,'unassigned');assert.equal(reset.request.confirmed_start,null);await assert.rejects(crm.update(auth,{id:current.id,version:3,status:'confirmed',doctorId:'',confirmedTime:'2030-01-20T11:00'}),e=>e.code==='invalid_request');}finally{db.request=original;}
});
test('CRM uses literal query arguments, validates filters and keeps declaration provenance on manual creation',async()=>{
 const original=db.request,calls=[];db.request=async(path,options)=>{calls.push({path,...options});return path.includes('crm_list_requests')?{requests:[],total:0,summary:{all:0}}:{id:'44444444-4444-4444-8444-444444444444'};};
 try{
  await crm.list(auth,'all',0,{search:'*),(phone.neq.null',kind:'declaration'});assert.equal(calls[0].data.p_search,'*),(phone.neq.null');assert.equal(calls[0].data.p_kind,'declaration');assert.ok(!calls[0].path.includes('phone.neq'));
  await assert.rejects(crm.list(auth,'bad',0),e=>e.code==='invalid_request');await assert.rejects(crm.list(auth,'all',-1),e=>e.code==='invalid_request');
  const input={attemptId:randomUUID(),requestKind:'declaration',patient:{name:'Тест Пацієнт',phone:'0970000000'},contactConfirmed:true};const result=await crm.create(auth,input);assert.equal(result.confirmed,false);const create=calls.find(c=>c.path.includes('crm_create_request'));assert.equal(create.data.p_requested_service,'Декларація з терапевтом');assert.equal(create.token,'fixture-auth');assert.ok(!('consent' in create.data));await assert.rejects(crm.create(auth,{...input,contactConfirmed:false}),e=>e.code==='invalid_request');
 }finally{db.request=original;}
});
test('CRM routes require a session and same-origin mutations before any data access',async()=>{
 const original=db.request;let calls=0;db.request=async()=>{calls++;throw Error('must not access database');};
 const run=async(handler,req)=>{let status;await handler(req,{setHeader(){},status(value){status=value;return this;},json(){return this;}});return status;};
 try{for(const name of ['history','requests'])assert.equal(await run(require('../api/admin/'+name),{method:'GET',headers:{},url:'/api/admin/'+name}),401);assert.equal(await run(require('../api/admin/requests'),{method:'POST',headers:{origin:'https://other.example','content-type':'application/json'},body:{}}),403);assert.equal(await run(require('../api/admin/requests'),{method:'GET',headers:{},url:'/api/admin/requests?view=contacts'}),401);assert.equal(calls,0);}finally{db.request=original;}
});
