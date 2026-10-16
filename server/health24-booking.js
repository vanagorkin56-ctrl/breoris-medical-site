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
module.exports={BookingError,context,catalog,today,validDate,safeText,send,fail};
