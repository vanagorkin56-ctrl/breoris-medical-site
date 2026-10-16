'use strict';
const {createHash,createHmac,randomUUID,timingSafeEqual}=require('node:crypto');
const {configuration,createClient}=require('./health24');
const {validDate}=require('./health24-schedule');
let client,key,catalogCache,catalogAt=0;
const attempts=new Map(),limits=new Map();
const mapped={595920:'tomakh',595938:'sokrut',596094:'sokrut',596096:'sushko',596803:'sushko',596308:'orlov',596330:'hrytsai',658345:'mishchenko',663338:'pokaichuk'};
class BookingError extends Error{constructor(code,status=400,diagnostic){super(code);this.code=code;this.status=status;this.diagnostic=diagnostic;}}
function context(){
 const config=configuration();if(config.missing)throw new BookingError('not_configured',503);
 const next=createHash('sha256').update(JSON.stringify(config)).digest('hex');
 if(key!==next){client=createClient(config);key=next;catalogCache=null;catalogAt=0;attempts.clear();limits.clear();}
 return {client,config};
}
function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date());}
function safeText(value,max=150){return typeof value==='string'?value.replace(/[\x00-\x1f\x7f-\x9f]/g,'').slice(0,max):'';}
async function catalog(fresh=false){
 const {client,config}=context();if(!fresh&&catalogCache&&Date.now()-catalogAt<60000)return catalogCache;
 const rows=await client.employees();
 const doctors=rows.filter(row=>row.fired===false&&!row.resource_office&&['DOCTOR','SPECIALIST'].includes(row.employee_type?.value)&&Number.isSafeInteger(row.id)&&row.id>0)
  .map(row=>({id:row.id,name:safeText(row.name),specialty:safeText(row.position?.name_uk||row.position?.name),type:row.employee_type.value,siteId:config.environment==='production'?mapped[row.id]||null:null})).filter(row=>row.name);
 catalogCache={environment:config.environment,legalEntityId:Number(config.entity),doctors};catalogAt=Date.now();return catalogCache;
}
function send(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');return res.status(status).json(body);}
function fail(res,error){
 const code=error instanceof BookingError?error.code:'health24_unavailable';
 const body={ok:false,code};
 if((error.status||502)>=500){
  const source=error.diagnostic||{},diagnostic={checkedAt:new Date().toISOString()};
  // Only fixed metadata is exposed: never patient fields, response bodies or tokens.
  for(const field of ['method','path','checkedAt','responseKind','server','cloudflareRayId','stage']){
   const value=source[field];
   if(typeof value==='string'&&/^[a-zA-Z0-9_/:.\-]{1,160}$/.test(value))diagnostic[field]=value;
  }
  if(Number.isInteger(error.upstreamStatus))diagnostic.upstreamStatus=error.upstreamStatus;
  if(['network_error','unexpected_response','unexpected_schedule_response','upstream_error','authorization_failed','access_blocked'].includes(error.code))diagnostic.reason=error.code;
  body.incidentId=randomUUID();body.diagnostic=diagnostic;
  console.warn(JSON.stringify({event:'health24_request_failed',code,incidentId:body.incidentId,diagnostic}));
 }
 return send(res,error.status||502,body);
}
function addDays(day,n){return new Date(Date.parse(day)+n*86400000).toISOString().slice(0,10);}
function signSlot(employeeId,slot){
 const {config}=context();const body=Buffer.from(JSON.stringify({v:1,clinic:Number(config.entity),employeeId,start:slot.period_start,end:slot.period_end,expires:Date.now()+10*60000,nonce:randomUUID()})).toString('base64url');
 return body+'.'+createHmac('sha256',config.secret).update('health24-slot:'+body).digest('base64url');
}
function verifySlot(token){
 if(typeof token!=='string'||token.length>2048)throw new BookingError('slot_expired',409);
 const parts=token.split('.');if(parts.length!==2)throw new BookingError('slot_expired',409);
 const signature=createHmac('sha256',context().config.secret).update('health24-slot:'+parts[0]).digest();
 const given=Buffer.from(parts[1],'base64url');if(given.length!==signature.length||!timingSafeEqual(given,signature))throw new BookingError('slot_expired',409);
 let slot;try{slot=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{throw new BookingError('slot_expired',409);}
 if(slot.v!==1||slot.clinic!==Number(context().config.entity)||!Number.isSafeInteger(slot.employeeId)||typeof slot.start!=='string'||typeof slot.end!=='string'||!Number.isFinite(slot.expires)||slot.expires<Date.now()||slot.expires>Date.now()+11*60000||Date.parse(slot.start)<=Date.now()||!Number.isFinite(Date.parse(slot.start))||!Number.isFinite(Date.parse(slot.end)))throw new BookingError('slot_expired',409);
 return slot;
}
function isBookable(slot){
 if(!slot||typeof slot!=='object'||slot.status!=='available'||Date.parse(slot.period_start)<=Date.now())return false;
 return !Object.entries(slot.flags).some(([name,value])=>
  (value&&(/busy|booked|blocked|reserved|occupied|overlap|disabled|unavailable/.test(name)||/_required$/.test(name)))||
  (!value&&/^(is_)?available$|online_available|allow_online_booking/.test(name)));
}
async function availability(employeeId,start=today(),inspect=false){
 const id=Number(employeeId),current=today();
 if(!Number.isSafeInteger(id)||id<=0||!validDate(start)||start<current||start>addDays(current,90))throw new BookingError('invalid_selection');
 const list=await catalog();if(!list.doctors.some(d=>d.id===id))throw new BookingError('doctor_unavailable',404);
 const end=addDays(start,13)>addDays(current,90)?addDays(current,90):addDays(start,13);
 const days=await context().client.schedule(id,start,end),result=[],statusCounts={},flagNames=new Set();let sample;
 for(const [date,slots]of Object.entries(days)){
  const available=[];
  for(const slot of slots){if(!slot||typeof slot!=='object')continue;statusCounts[slot.status]=(statusCounts[slot.status]||0)+1;Object.keys(slot.flags).forEach(name=>flagNames.add(name));sample??={status:slot.status,flags:slot.flags};
   if(isBookable(slot))available.push({time:slot.time,start:slot.period_start,end:slot.period_end,token:signSlot(id,slot)});
  }
  result.push({date,slots:available});
 }
 return {employeeId:id,start,end,days:result.sort((a,b)=>a.date.localeCompare(b.date)),...(inspect?{inspection:{statusCounts,flagNames:[...flagNames],sample}}:{})};
}
function originAllowed(origin){
 const allowed=new Set(['https://breoris-medical.com','https://www.breoris-medical.com','https://breoris-medical-site-dist.vercel.app']);
 for(const host of [process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL])if(host&&/^[a-z0-9.-]+$/.test(host))allowed.add('https://'+host);
 return allowed.has(origin);
}
function patientPayload(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>6000||input.consent!==true)throw new BookingError('invalid_patient');
 const name=value=>typeof value==='string'&&value.trim().length>=2&&value.trim().length<=80&&/^[\p{L}\p{M}\s'’ʼ\-]+$/u.test(value.trim());
 if(!name(input.firstName)||!name(input.lastName)||!['male','female'].includes(input.gender)||!validDate(input.birthDate)||input.birthDate>today()||input.birthDate<addDays(today(),-130*366))throw new BookingError('invalid_patient');
 const digits=typeof input.phone==='string'?input.phone.replace(/\D/g,''):'';
 const phone=/^380\d{9}$/.test(digits)?'0'+digits.slice(3):/^0\d{9}$/.test(digits)?digits:null;
 if(!phone)throw new BookingError('invalid_patient');
 return {first_name:input.firstName.trim(),last_name:input.lastName.trim(),phone_number:phone,gender:input.gender,birth_date:input.birthDate};
}
function rateLimit(ip){
 const now=Date.now();for(const [hash,row]of limits)if(row.expires<now)limits.delete(hash);
 const hash=createHash('sha256').update(String(ip)).digest('hex'),row=limits.get(hash)||{count:0,expires:now+10*60000};
 if(row.count>=5||limits.size>10000)throw new BookingError('too_many_requests',429);row.count++;limits.set(hash,row);
}
async function book(input,ip){
 const {config}=context();if(config.environment!=='production')throw new BookingError('production_required',503);
 if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>8000||!/^[a-f0-9-]{36}$/i.test(input.attemptId||''))throw new BookingError('invalid_request');
 const patient=patientPayload(input.patient),fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const now=Date.now();for(const [id,row]of attempts)if(row.expires<now)attempts.delete(id);
 const previous=attempts.get(input.attemptId);
 if(previous){if(previous.fingerprint!==fingerprint)throw new BookingError('invalid_request',409);return previous.promise;}
 if(attempts.size>10000)throw new BookingError('too_many_requests',429);
 rateLimit(ip);
 const selected=verifySlot(input.token);
 const promise=(async()=>{
  const list=await catalog(true),doctor=list.doctors.find(row=>row.id===selected.employeeId);
  if(!doctor)throw new BookingError('doctor_unavailable',409);
  const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date(selected.start));
  const days=await context().client.schedule(selected.employeeId,date,date);
  const current=days[date]?.find(row=>row&&typeof row==='object'&&row.period_start===selected.start&&row.period_end===selected.end);
  if(!isBookable(current))throw new BookingError('slot_taken',409);
  let result;
  try{result=await context().client.createVisit({...patient,employee_id:doctor.id,period_start:current.period_start,period_end:current.period_end});}
  catch(error){
   if(error.upstreamStatus===409||error.upstreamStatus===422)throw new BookingError('booking_rejected',409);
   if(error.code==='authorization_failed'||error.code==='access_blocked')throw new BookingError('health24_unavailable',502);
   // Never retry an ambiguous POST; ask the clinic to verify the outcome.
   const uncertain=new BookingError('booking_uncertain',503,{...error.diagnostic,stage:'create_visit'});uncertain.upstreamStatus=error.upstreamStatus;throw uncertain;
  }
  if(!Number.isSafeInteger(result?.id)||result.id<=0||result.legal_entity?.id!==Number(config.entity)||result.employee?.id!==doctor.id||Date.parse(result.period_start)!==Date.parse(current.period_start)||Date.parse(result.period_end)!==Date.parse(current.period_end))throw new BookingError('booking_uncertain',503,{stage:'validate_visit_response'});
  if(['rejected','cancelled','canceled'].includes(result.state))throw new BookingError('booking_rejected',409);
  if(!['approved','pending','new','requested'].includes(result.state))throw new BookingError('booking_uncertain',503,{stage:'validate_visit_state'});
  return {ok:true,accepted:true,confirmed:result.state==='approved',reference:String(result.id),doctor:{id:doctor.id,name:doctor.name,specialty:doctor.specialty},start:current.period_start,end:current.period_end,location:safeText(result.division?.address,200)};
 })();
 attempts.set(input.attemptId,{fingerprint,promise,expires:now+30*60000});return promise;
}
module.exports={BookingError,context,catalog,today,validDate,safeText,send,fail,availability,addDays,book,originAllowed,patientPayload,isBookable,signSlot,verifySlot};
