'use strict';
const {createHash,createHmac}=require('node:crypto');
const {ClinicError}=require('./clinic-web'),db=require('./clinic-db');
const {patient,uuid}=require('./clinic-requests');
const catalogue=require('../dist/appointment-catalog.json');
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date());
function text(value,max){if(value===undefined||value===null)return '';if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new ClinicError('invalid_request');return value.trim();}
function validate(input){
 if(!input||!uuid(input.attemptId)||input.website)throw new ClinicError('invalid_request');
 const contact=patient(input.patient),doctorId=text(input.doctorId,60),service=text(input.service,120);
 const kind=text(input.requestKind,20)||'appointment';
 if(!['appointment','declaration'].includes(kind))throw new ClinicError('invalid_request');
 const doctor=catalogue.doctors.find(d=>d.id===doctorId);
 if(doctorId&&!doctor)throw new ClinicError('doctor_unavailable',409);
 if(service&&!catalogue.services.includes(service))throw new ClinicError('invalid_request');
 if(doctor&&service&&!doctor.services.includes(service))throw new ClinicError('invalid_request');
 const date=text(input.preferredDate,10),time=text(input.preferredTime,5),email=text(input.email,254),comment=text(input.comment,600);
 if(kind==='declaration'&&(doctorId||service||date||time))throw new ClinicError('invalid_request');
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||date<today()||Number(date.slice(0,4))>Number(today().slice(0,4))+2))throw new ClinicError('invalid_date');
 if(time&&(!date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))throw new ClinicError('invalid_date');
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ClinicError('invalid_request');
 return {doctorId:doctor?.id||'unassigned',doctorName:doctor?.name||'Допоможіть обрати лікаря',specialty:kind==='declaration'?'Декларація з терапевтом':doctor?.specialty||service||'Напрям уточнюється',service:kind==='declaration'?'Декларація з терапевтом':service,date,time,email,comment,...contact};
}
async function submit(input,ip){
 const value=validate(input),config=db.config();
 if(!config)throw new ClinicError('service_unavailable',503);
 const fingerprint=createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const hash=value=>createHmac('sha256',config.secret).update(value).digest('hex');
 const row=await db.request('/rest/v1/rpc/submit_administrator_request',{service:true,method:'POST',data:{
  p_attempt_id:input.attemptId,p_fingerprint:fingerprint,p_ip_key:hash('ip:'+ip),p_phone_key:hash('phone:'+value.phone),
  p_doctor_id:value.doctorId,p_doctor_name:value.doctorName,p_specialty:value.specialty,
  p_patient_name:value.name,p_phone:value.phone,p_requested_service:value.service,p_preferred_date:value.date||null,
  p_preferred_time:value.time||null,p_email:value.email,p_comment:value.comment
 }});
 if(!uuid(row?.id))throw new ClinicError('service_unavailable',503);
 return {ok:true,accepted:true,confirmed:false,reference:row.id};
}
module.exports={validate,submit};
