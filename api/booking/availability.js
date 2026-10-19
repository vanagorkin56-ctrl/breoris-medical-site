'use strict';
const {availability}=require('../../server/clinic-slots'),{send,fail}=require('../../server/clinic-web');
module.exports=async(req,res)=>{if(req.method!=='GET')return send(res,405,{ok:false,code:'method_not_allowed'});try{const query=new URL(req.url,'https://local.invalid').searchParams;return send(res,200,await availability(query.get('doctorId'),query.get('start')||undefined));}catch(error){return fail(res,error);}};
