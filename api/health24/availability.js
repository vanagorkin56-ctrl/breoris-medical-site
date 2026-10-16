'use strict';
const {availability,send,fail}=require('../../server/health24-booking');
module.exports=async(req,res)=>{if(req.method!=='GET'){res.setHeader('Allow','GET');return send(res,405,{code:'method_not_allowed'});}try{const query=new URL(req.url,'https://local.invalid').searchParams;return send(res,200,{ok:true,...await availability(query.get('employeeId'),query.get('start')||undefined)});}catch(error){return fail(res,error);}};
