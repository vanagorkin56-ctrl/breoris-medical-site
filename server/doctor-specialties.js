'use strict';
const profiles=require('../data/doctors.json').doctors;
const {doctors}=require('../dist/data');
const aliases=new Map([
 ['Невропатолог','Невролог'],
 ['УЗД-фахівець','Лікар ультразвукової діагностики'],
 ['Лікар з ультразвукової діагностики','Лікар ультразвукової діагностики'],
 ['Лікар УЗД','Лікар ультразвукової діагностики']
]);
const canonical=value=>aliases.get(value)||value;
function specialtyMismatch(siteId,specialty){
 if(doctors.find(row=>row.id===siteId)?.specialtyPending)return true;
 const profile=profiles.find(row=>row.id===siteId);
 return !!profile&&!profile.specialties.some(value=>canonical(value)===canonical(specialty));
}
module.exports={canonical,specialtyMismatch};
