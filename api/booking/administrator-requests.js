'use strict';
const {submit}=require('../../server/administrator-requests');
const {send,fail,origin,body}=require('../../server/clinic-web');
module.exports=async(req,res)=>{
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{ok:false,code:'method_not_allowed'});}
 try{origin(req);return send(res,200,await submit(body(req),req.headers['x-real-ip']||'unknown'));}
 catch(error){return fail(res,error);}
};
