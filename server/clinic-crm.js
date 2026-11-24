'use strict';
const {createHash}=require('node:crypto');
const db=require('./clinic-db'),{ClinicError}=require('./clinic-web');
const {uuid,kyivInstant}=require('./clinic-requests'),{validate}=require('./administrator-requests');
const catalogue=require('../dist/appointment-catalog.json');
const columns='id,doctor_id,doctor_name,specialty,patient_name,phone,preferred_start,preferred_end,status,confirmed_start,created_at,updated_at,version,requested_service,preferred_date,preferred_time,email,comment,priority,assignee,follow_up_at,resolved_at,last_note,source';
const stages=['all','new','contacted','confirmed','completed','cancelled'];
function text(value,max){if(value===undefined||value===null)return '';if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new ClinicError('invalid_request');return value.trim();}
function offset(value){if(!Number.isInteger(value)||value<0||value>100000)throw new ClinicError('invalid_request');return value;}
function search(value){const q=text(value,80);return /^[+\d ()-]+$/.test(q)&&q.replace(/\D/g,'').length>=7?q.replace(/\D/g,'').replace(/^0/,''):q;}
function date(value){const day=text(value,10);if(day&&(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day+'T12:00:00Z'))||new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day))throw new ClinicError('invalid_date');return day||null;}
async function list(auth,status='all',pageOffset=0,filters={}){
 const kind=text(filters.kind,20)||'all',priority=text(filters.priority,10)||'all',doctorId=text(filters.doctorId,60);
 if(!stages.includes(status)||!['all','appointment','declaration'].includes(kind)||!['all','low','normal','high'].includes(priority)||(doctorId&&!catalogue.doctors.some(d=>d.id===doctorId)))throw new ClinicError('invalid_request');
 const result=await db.request('/rest/v1/rpc/crm_list_requests',{token:auth.token,method:'POST',data:{p_status:status,p_kind:kind,p_search:search(filters.search),p_doctor_id:doctorId,p_priority:priority,p_due:filters.due===true,p_day:date(filters.day),p_offset:offset(pageOffset)}});
 if(!Array.isArray(result?.requests)||!Number.isSafeInteger(result.total)||!result.summary)throw new ClinicError('service_unavailable',503);
 return {ok:true,...result,hasMore:pageOffset+result.requests.length<result.total};
}
async function update(auth,input){
 if(!uuid(input.id)||!Number.isSafeInteger(input.version)||input.version<1||!stages.slice(1).includes(input.status))throw new ClinicError('invalid_request');
 const rows=await db.request('/rest/v1/callback_requests?id=eq.'+input.id+'&select='+columns,{token:auth.token});
 const current=rows?.[0];if(!current||current.version!==input.version)throw new ClinicError('request_changed',409);
 const declaration=current.requested_service==='Декларація з терапевтом';
 if(declaration&&input.status==='confirmed')throw new ClinicError('invalid_request');
 const nextStatus=input.status==='completed'?(current.status==='confirmed'?'confirmed':'contacted'):input.status;
 const changes={status:nextStatus,resolved_at:input.status==='completed'?(current.resolved_at||new Date().toISOString()):null};
 const doctorId=text(input.doctorId,60);
 if(doctorId){const doctor=catalogue.doctors.find(d=>d.id===doctorId);if(!doctor)throw new ClinicError('doctor_unavailable',409);Object.assign(changes,{doctor_id:doctor.id,doctor_name:doctor.name,specialty:doctor.specialty});}else if(!declaration&&input.doctorId!==undefined){Object.assign(changes,{doctor_id:'unassigned',doctor_name:'Допоможіть обрати лікаря',specialty:current.requested_service||'Напрям уточнюється'});}
 if(nextStatus==='confirmed'){
  if((changes.doctor_id||current.doctor_id)==='unassigned')throw new ClinicError('invalid_request');
  const candidate=text(input.confirmedTime,16);
  if(input.status==='completed'&&!candidate)changes.confirmed_start=current.confirmed_start;
  else {
   const instant=kyivInstant(candidate,false),unchanged=current.status==='confirmed'&&Date.parse(instant)===Date.parse(current.confirmed_start)&&(changes.doctor_id||current.doctor_id)===current.doctor_id;
   if(!unchanged&&Date.parse(instant)<Date.now())throw new ClinicError('invalid_date');
   changes.confirmed_start=instant;
  }
 }else changes.confirmed_start=null;
 if(input.priority!==undefined){if(!['low','normal','high'].includes(input.priority))throw new ClinicError('invalid_request');changes.priority=input.priority;}
 if(input.assignee!==undefined)changes.assignee=text(input.assignee,80);
 if(input.followUp!==undefined){const value=text(input.followUp,16);changes.follow_up_at=value?kyivInstant(value,false):null;}
 const note=text(input.note,2000);if(note)changes.last_note=note;
 const saved=await db.request('/rest/v1/callback_requests?id=eq.'+input.id+'&version=eq.'+input.version+'&select='+columns,{token:auth.token,method:'PATCH',data:changes,prefer:'return=representation'});
 if(!Array.isArray(saved)||saved.length!==1)throw new ClinicError('request_changed',409);
 return {ok:true,request:saved[0]};
}
async function create(auth,input){
 if(input.contactConfirmed!==true)throw new ClinicError('invalid_request');
 const value=validate({...input,patient:{...input.patient,consent:true}});
 const fingerprint=createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const row=await db.request('/rest/v1/rpc/crm_create_request',{token:auth.token,method:'POST',data:{p_attempt_id:input.attemptId,p_fingerprint:fingerprint,p_doctor_id:value.doctorId,p_doctor_name:value.doctorName,p_specialty:value.specialty,p_patient_name:value.name,p_phone:value.phone,p_requested_service:value.service,p_preferred_date:value.date||null,p_preferred_time:value.time||null,p_email:value.email,p_comment:value.comment}});
 if(!uuid(row?.id))throw new ClinicError('service_unavailable',503);
 return {ok:true,accepted:true,confirmed:false,reference:row.id};
}
async function history(auth,id){if(!uuid(id))throw new ClinicError('invalid_request');const rows=await db.request('/rest/v1/crm_activity?select=id,event_type,changes,created_at&request_id=eq.'+id+'&order=created_at.desc,id.desc&limit=100',{token:auth.token});if(!Array.isArray(rows))throw new ClinicError('service_unavailable',503);return {ok:true,events:rows};}
async function contacts(auth,q,pageOffset=0){const result=await db.request('/rest/v1/rpc/crm_contacts',{token:auth.token,method:'POST',data:{p_search:search(q),p_offset:offset(pageOffset)}});if(!Array.isArray(result?.contacts)||!Number.isSafeInteger(result.total))throw new ClinicError('service_unavailable',503);return {ok:true,...result,hasMore:pageOffset+result.contacts.length<result.total};}
module.exports={list,update,create,history,contacts};
