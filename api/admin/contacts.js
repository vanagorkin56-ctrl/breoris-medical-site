'use strict';
const admin=require('../../server/clinic-admin'),crm=require('../../server/clinic-crm'),{send,fail,ClinicError}=require('../../server/clinic-web');
module.exports=async(req,res)=>{try{if(req.method!=='GET')throw new ClinicError('method_not_allowed',405);const auth=await admin.session(req),query=new URL(req.url,'https://local.invalid').searchParams;return send(res,200,await crm.contacts(auth,query.get('search'),Number(query.get('offset')||0)));}catch(error){return fail(res,error);}};
