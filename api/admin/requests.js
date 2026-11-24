'use strict';
const admin=require('../../server/clinic-admin'),crm=require('../../server/clinic-crm'),{send,fail,origin,body,ClinicError}=require('../../server/clinic-web');
module.exports=async(req,res)=>{try{
 if(!['GET','POST','PATCH'].includes(req.method))throw new ClinicError('method_not_allowed',405);
 if(req.method!=='GET')origin(req);
 const auth=await admin.session(req);
 if(req.method==='POST')return send(res,200,await crm.create(auth,body(req,8192)));
 if(req.method==='PATCH')return send(res,200,await crm.update(auth,body(req,8192)));
 const query=new URL(req.url,'https://local.invalid').searchParams;
 return send(res,200,await crm.list(auth,query.get('status')||'all',Number(query.get('offset')||0),{kind:query.get('kind'),search:query.get('search'),doctorId:query.get('doctorId'),priority:query.get('priority'),due:query.get('due')==='true',day:query.get('day')}));
}catch(error){return fail(res,error);}};
