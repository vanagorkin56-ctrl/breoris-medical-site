'use strict';
const {doctors}=require('../dist/data');
const profiles=require('../data/doctors.json').doctors;
const {catalog}=require('./health24-booking');
const {config}=require('./clinic-db');
function callbackDoctors(health24){return doctors.filter(d=>!health24.some(h=>h.siteId===d.id)).map(d=>{const profile=profiles.find(p=>p.id===d.id),prices=(profile?.services||[]).filter(s=>['Консультація','Консультативний прийом'].includes(s.name)&&Number.isFinite(s.price)).map(s=>s.price);return {id:'callback:'+d.id,siteId:d.id,name:d.name,specialty:d.role,mode:'callback',consultationFrom:prices.length?Math.min(...prices):null};});}
async function directory(){const live=await catalog();return {...live,callbackEnabled:!!config(),doctors:[...live.doctors.map(d=>({...d,mode:'health24'})),...(config()?callbackDoctors(live.doctors):[])]};}
module.exports={directory,callbackDoctors};
