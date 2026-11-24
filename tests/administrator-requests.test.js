'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const db=require('../server/clinic-db'),requests=require('../server/administrator-requests');
const input=()=>({attemptId:randomUUID(),doctorId:'sokrut',service:'Ендокринологія',preferredDate:'',preferredTime:'',email:'',comment:'',website:'',patient:{name:'Тест Пацієнт',phone:'0970000000',consent:true}});
test('administrator requests include Health24 clinicians and need neither Health24 nor a slot',async()=>{
 const oldConfig=db.config,oldRequest=db.request,oldFetch=global.fetch,calls=[];
 db.config=()=>({secret:'fixture-only-secret'});db.request=async(path,options)=>{calls.push({path,...options});return {id:'44444444-4444-4444-8444-444444444444'};};global.fetch=async()=>{throw Error('Health24 must not be called');};
 try{
  for(const doctorId of ['sokrut','tomakh','hrytsai','podhorna','sushko','honchar','']){
   const payload={...input(),doctorId,service:'',email:'fixture@example.test',comment:'Зателефонуйте після обіду'};
   const result=await requests.submit(payload,'fixture-ip');assert.equal(result.accepted,true);assert.equal(result.confirmed,false);
   assert.ok(!JSON.stringify(result).includes('fixture@example.test'));assert.ok(!JSON.stringify(result).includes('Пацієнт'));
  }
  assert.equal(calls.length,7);assert.ok(calls.every(c=>c.path==='/rest/v1/rpc/submit_administrator_request'));
  assert.ok(calls.every(c=>!('p_slot_id' in c.data)));assert.equal(calls[6].data.p_doctor_id,'unassigned');
  assert.ok(calls.every(c=>!JSON.stringify(c.data).includes('fixture-ip')));
  const same=input();await requests.submit(same,'fixture-ip');await requests.submit(same,'fixture-ip');
  assert.equal(calls[7].data.p_fingerprint,calls[8].data.p_fingerprint);
  await requests.submit({...same,comment:'Інший час для дзвінка'},'fixture-ip');assert.notEqual(calls[8].data.p_fingerprint,calls[9].data.p_fingerprint);
 }finally{db.config=oldConfig;db.request=oldRequest;global.fetch=oldFetch;}
});
test('invalid or mismatched fields cannot create an administrator request',()=>{
 for(const change of [{doctorId:'unknown'},{doctorId:'sushko',service:'Терапія'},{preferredDate:'2027-02-30'},{preferredDate:'2020-01-01'},{preferredTime:'10:00'},{preferredDate:'2027-01-01',preferredTime:'25:00'},{email:'invalid'},{comment:'x'.repeat(601)},{website:'bot'}])assert.throws(()=>requests.validate({...input(),...change}));
 assert.throws(()=>requests.validate({...input(),patient:{...input().patient,consent:false}}));
 assert.equal(requests.validate(input()).phone,'+380970000000');
 assert.equal(requests.validate({...input(),preferredDate:'2027-01-01',preferredTime:'10:30'}).time,'10:30');
});
test('missing storage or a failed write never returns a successful receipt',async()=>{
 const oldConfig=db.config,oldRequest=db.request;
 try{
  db.config=()=>null;await assert.rejects(requests.submit(input(),'fixture-ip'),e=>e.code==='service_unavailable');
  db.config=()=>({secret:'fixture-secret'});db.request=async()=>({});await assert.rejects(requests.submit(input(),'fixture-ip'),e=>e.code==='service_unavailable');
 }finally{db.config=oldConfig;db.request=oldRequest;}
});
test('administrator route rejects cross-origin POST; legacy direct booking is disabled',async()=>{
 const run=async(handler,req)=>{let status,data;await handler(req,{setHeader(){},status(value){status=value;return this;},json(value){data=value;return this;}});return {status,data};};
 let result=await run(require('../api/booking/administrator-requests'),{method:'POST',headers:{origin:'https://other.example','content-type':'application/json'},body:input()});assert.equal(result.status,403);
 result=await run(require('../api/health24/appointments'),{method:'POST',headers:{origin:'https://breoris-medical-site-dist.vercel.app','content-type':'application/json'},body:input()});assert.equal(result.status,409);assert.equal(result.data.code,'booking_via_administrator');
});
test('declaration enquiries retain their purpose without a doctor, slot or medical identity fields',async()=>{
 const oldConfig=db.config,oldRequest=db.request;let saved;
 db.config=()=>({secret:'fixture-only-secret'});db.request=async(path,options)=>{saved=options.data;return {id:'44444444-4444-4444-8444-444444444444'};};
 try{
  const declaration={...input(),requestKind:'declaration',doctorId:'',service:''};
  const result=await requests.submit(declaration,'fixture-ip');
  assert.equal(result.confirmed,false);assert.equal(saved.p_requested_service,'Декларація з терапевтом');assert.equal(saved.p_specialty,'Декларація з терапевтом');assert.equal(saved.p_doctor_id,'unassigned');assert.equal(saved.p_preferred_date,null);assert.equal(saved.p_preferred_time,null);
  assert.throws(()=>requests.validate({...declaration,doctorId:'sokrut'}));assert.throws(()=>requests.validate({...declaration,requestKind:'unknown'}));
  assert.notEqual(requests.validate(declaration).service,requests.validate({...declaration,requestKind:'appointment'}).service);
 }finally{db.config=oldConfig;db.request=oldRequest;}
});
