'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function harness(options={}){
 const previousFetch=global.fetch,keys=['HEALTH24_API_BASE_URL','HEALTH24_LEGAL_ENTITY_ID','HEALTH24_CLIENT_ID','HEALTH24_CLIENT_SECRET'];
 const previousEnv=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{HEALTH24_API_BASE_URL:'https://ehr.h24.ua',HEALTH24_LEGAL_ENTITY_ID:'17027',HEALTH24_CLIENT_ID:'test-client-'+randomUUID(),HEALTH24_CLIENT_SECRET:'server-test-secret'});
 delete require.cache[require.resolve('../server/health24-booking')];
 const booking=require('../server/health24-booking');
 const day=booking.addDays(booking.today(),3);
 const hour=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Kyiv',timeZoneName:'shortOffset'}).formatToParts(new Date(day+'T12:00:00Z')).find(p=>p.type==='timeZoneName').value;
 const offset=hour.includes('+3')?'+03:00':'+02:00';
 const slot={time:'10:00',period_start:day+'T10:00:00.000'+offset,period_end:day+'T10:30:00.000'+offset,status:'available',direction_required:false,prepayment_required:false,appointment_services_duration_required:false,appointment_services_required:false};
 const patient={firstName:'Тест',lastName:'Перевірка',phone:'+380 97 000 00 00',birthDate:'1990-01-01',gender:'male',consent:true};
 let posts=0,reads=0;
 global.fetch=async(url,request)=>{
  if(url.endsWith('/oauth/token'))return json({access_token:'server-only-token',token_type:'Bearer',expires_in:3600});
  if(url.includes('/employees?'))return json([{id:595920,name:'Test doctor',fired:false,resource_office:false,employee_type:{value:'SPECIALIST'},position:{name_uk:'Невропатолог'},party_id:999,phone:'private-staff-phone'},{id:999,fired:false,name:'Resource',resource_office:true,employee_type:{value:'SPECIALIST'}}]);
  if(url.includes('/schedule?')){reads++;return json({[day]:[{...slot,...(options.schedule||{})}]});}
  if(url.endsWith('/visit_moderations')){
   posts++;assert.equal(request.method,'POST');assert.equal(request.redirect,'error');assert.equal(request.headers.Authorization,'Bearer server-only-token');
   const body=JSON.parse(request.body);assert.deepEqual(body,{first_name:'Тест',last_name:'Перевірка',phone_number:'0970000000',gender:'male',birth_date:'1990-01-01',employee_id:595920,period_start:slot.period_start,period_end:slot.period_end});
   if(options.uncertain)throw new Error('network lost');
   if(options.reject)return json({patient:'private-upstream-body'},422);
   await new Promise(resolve=>setTimeout(resolve,10));
   return json({id:54321,state:options.state||'approved',legal_entity:{id:17027},employee:{id:595920},period_start:slot.period_start,period_end:slot.period_end,patient:{name:'private-patient'}});
  }
  throw new Error('unexpected path '+url);
 };
 return {booking,day,slot,patient,posts:()=>posts,reads:()=>reads,restore(){global.fetch=previousFetch;for(const [k,v]of Object.entries(previousEnv))if(v===undefined)delete process.env[k];else process.env[k]=v;}};
}
test('catalog is clinic-scoped, strips staff contacts and excludes resources',async()=>{const h=harness();try{const c=await h.booking.catalog();assert.equal(c.doctors.length,1);assert.equal(c.doctors[0].siteId,'tomakh');for(const value of ['party_id','private-staff-phone','Resource'])assert.ok(!JSON.stringify(c).includes(value));assert.equal(h.posts(),0);}finally{h.restore();}});
test('availability filters booked and prerequisite slots and rejects doctors outside clinic',async()=>{
 for(const schedule of [{status:'booked'},{prepayment_required:true},{direction_required:true},{appointment_services_required:true}]){
  const h=harness({schedule});try{const a=await h.booking.availability(595920,h.day);assert.equal(a.days[0].slots.length,0);await assert.rejects(h.booking.availability(123,h.day),e=>e.code==='doctor_unavailable');assert.equal(h.posts(),0);}finally{h.restore();}
 }
});
test('booking rechecks a signed slot and coalesces duplicate submissions without leaking patient data',async()=>{
 const h=harness();try{const a=await h.booking.availability(595920,h.day),token=a.days[0].slots[0].token;const input={attemptId:randomUUID(),token,patient:h.patient};
 const [first,duplicate]=await Promise.all([h.booking.book(input,'test-ip'),h.booking.book(input,'test-ip')]);
 assert.equal(h.posts(),1);assert.ok(h.reads()>=2);assert.deepEqual(first,duplicate);assert.equal(first.confirmed,true);assert.equal(first.reference,'54321');
 for(const value of ['private-patient','server-only-token','server-test-secret','0970000000','1990-01-01'])assert.ok(!JSON.stringify(first).includes(value));
 await assert.rejects(h.booking.book({...input,patient:{...h.patient,firstName:'Інше'}},'test-ip'),e=>e.code==='invalid_request');assert.equal(h.posts(),1);
 }finally{h.restore();}
});
test('forged tokens, missing consent and stale slots cannot create visits',async()=>{
 const h=harness({schedule:{status:'booked'}});try{const token=h.booking.signSlot(595920,h.slot);
 await assert.rejects(h.booking.book({attemptId:randomUUID(),token:token.slice(0,-10)+'AAAAAAAAAA',patient:h.patient},'test-ip'),e=>e.code==='slot_expired');
 await assert.rejects(h.booking.book({attemptId:randomUUID(),token,patient:{...h.patient,consent:false}},'test-ip'),e=>e.code==='invalid_patient');
 await assert.rejects(h.booking.book({attemptId:randomUUID(),token,patient:h.patient},'test-ip'),e=>e.code==='slot_taken');assert.equal(h.posts(),0);
 }finally{h.restore();}
});
test('a lost POST response is uncertain and never automatically retried',async()=>{
 const h=harness({uncertain:true});try{const input={attemptId:randomUUID(),token:h.booking.signSlot(595920,h.slot),patient:h.patient};for(let i=0;i<2;i++)await assert.rejects(h.booking.book(input,'test-ip'),e=>e.code==='booking_uncertain');assert.equal(h.posts(),1);}finally{h.restore();}
});
test('appointment route requires same-site JSON POST before any upstream call',async()=>{
 const h=harness();try{delete require.cache[require.resolve('../api/health24/appointments')];const handler=require('../api/health24/appointments');let code,body;const res={setHeader(){},status(v){code=v;return this;},json(v){body=v;return this;}};
 await handler({method:'GET',headers:{}},res);assert.equal(code,405);
 await handler({method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json'},body:{}},res);assert.equal(code,403);
 await handler({method:'POST',headers:{origin:'https://breoris-medical-site-dist.vercel.app','content-type':'text/plain'},body:'{}'},res);assert.equal(code,400);assert.equal(h.posts(),0);assert.equal(h.reads(),0);assert.equal(body.ok,false);
 }finally{h.restore();}
});


test('rejected and unrecognized upstream states cannot produce a booking confirmation',async()=>{
 for(const state of ['rejected','unexpected_state','pending']){
  const h=harness({state});try{const input={attemptId:randomUUID(),token:h.booking.signSlot(595920,h.slot),patient:h.patient};
   if(state==='pending'){const result=await h.booking.book(input,'test-ip');assert.equal(result.confirmed,false);assert.equal(result.accepted,true);}
   else await assert.rejects(h.booking.book(input,'test-ip'),e=>e.code===(state==='rejected'?'booking_rejected':'booking_uncertain'));
   assert.equal(h.posts(),1);
  }finally{h.restore();}
 }
});
