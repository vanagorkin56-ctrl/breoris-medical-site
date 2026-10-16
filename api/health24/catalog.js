'use strict';
const {catalog,send,fail}=require('../../server/health24-booking');
module.exports=async(req,res)=>{if(req.method!=='GET'){res.setHeader('Allow','GET');return send(res,405,{code:'method_not_allowed'});}try{return send(res,200,{ok:true,...await catalog()});}catch(error){return fail(res,error);}};
