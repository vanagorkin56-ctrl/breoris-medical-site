'use strict';
const {directory}=require('../../server/clinic-directory'),{send,fail}=require('../../server/clinic-web');
module.exports=async(req,res)=>{if(req.method!=='GET'){res.setHeader('Allow','GET');return send(res,405,{ok:false,code:'method_not_allowed'});}try{return send(res,200,{ok:true,...await directory()});}catch(error){return fail(res,error);}};
