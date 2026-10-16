'use strict';
const {createHash,createHmac,randomUUID,timingSafeEqual}=require('node:crypto');
const {configuration,createClient}=require('./health24');
const {validDate}=require('./health24-schedule');
let client,key,catalogCache,catalogAt=0;
class BookingError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status;}}
function context(){const config=configuration();if(config.missing)throw new BookingError('not_configured',503);const next=createHash('sha256').update(JSON.stringify(config)).digest('hex');if(key!==next){client=createClient(config);key=next;catalogCache=null;catalogAt=0;}return {client,config};}
function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date());}
function safeText(value,max=150){return typeof value==='string'?value.replace(/[\x00-\x1f\x7f-\x9f]/g,'').slice(0,max):'';}
async function catalog(fresh=false){const {client,config}=context();if(!fresh&&catalogCache&&Date.now()-catalogAt<60000)return catalogCache;const rows=await client.employees();const doctors=rows.filter(row=>row.fired===false&&!row.resource_office&&['DOCTOR','SPECIALIST'].includes(row.employee_type?.value)&&Number.isSafeInteger(row.id)&&row.id>0).map(row=>({id:row.id,name:safeText(row.name),specialty:safeText(row.position?.name_uk||row.position?.name),type:row.employee_type.value})).filter(row=>row.name);catalogCache={environment:config.environment,legalEntityId:Number(config.entity),doctors};catalogAt=Date.now();return catalogCache;}
function send(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');return res.status(status).json(body);}
function fail(res,error){return send(res,error.status||502,{ok:false,code:error instanceof BookingError?error.code:'health24_unavailable'});}
function addDays(day,n){return new Date(Date.parse(day)+n*86400000).toISOString().slice(0,10);}
function signSlot(employeeId,slot){const {config}=context();const body=Buffer.from(JSON.stringify({v:1,clinic:Number(config.entity),employeeId,start:slot.period_start,end:slot.period_end,expires:Date.now()+10*60000,nonce:randomUUID()})).toString('base64url');const signature=createHmac('sha256',config.secret).update('health24-slot:'+body).digest('base64url');return body+'.'+signature;}
async function availability(employeeId,start=today(),inspect=false){
 const id=Number(employeeId),current=today();
 if(!Number.isSafeInteger(id)||id<=0||!validDate(start)||start<current||start>addDays(current,90))throw new BookingError('invalid_selection');
 const list=await catalog();if(!list.doctors.some(d=>d.id===id))throw new BookingError('doctor_unavailable',404);
 const end=addDays(start,13)>addDays(current,90)?addDays(current,90):addDays(start,13);
 const days=await context().client.schedule(id,start,end),result=[],statusCounts={},flagNames=new Set();let sample;
 for(const [date,slots]of Object.entries(days)){
  const available=[];
  for(const slot of slots){if(!slot||typeof slot!=='object')continue;statusCounts[slot.status]=(statusCounts[slot.status]||0)+1;Object.keys(slot.flags).forEach(key=>flagNames.add(key));sample??={status:slot.status,flags:slot.flags};
   if(slot.status!=='available'||Date.parse(slot.period_start)<=Date.now())continue;
   if(Object.entries(slot.flags).some(([key,value])=>((/busy|booked|blocked|reserved|occupied|overlap|disabled/.test(key))&&value)||((/^(is_)?available$|online_available|allow_online_booking/.test(key))&&!value)))continue;
   available.push({time:slot.time,start:slot.period_start,end:slot.period_end,token:signSlot(id,slot)});
  }
  result.push({date,slots:available});
 }
 return {employeeId:id,start,end,days:result.sort((a,b)=>a.date.localeCompare(b.date)),...(inspect?{inspection:{statusCounts,flagNames:[...flagNames],sample}}:{})};
}
module.exports={BookingError,context,catalog,today,validDate,safeText,send,fail,availability,addDays};
