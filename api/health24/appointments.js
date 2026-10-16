'use strict';
const {book,originAllowed,BookingError,send,fail}=require('../../server/health24-booking');
module.exports=async(req,res)=>{
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{ok:false,code:'method_not_allowed'});}
 try{
  if(!originAllowed(req.headers.origin))throw new BookingError('origin_not_allowed',403);
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')||Number(req.headers['content-length']||0)>8192)throw new BookingError('invalid_request');
  let body=req.body;if(typeof body==='string'){if(Buffer.byteLength(body)>8192)throw new BookingError('invalid_request');try{body=JSON.parse(body);}catch{throw new BookingError('invalid_request');}}
  const ip=req.headers['x-real-ip']||req.headers['x-forwarded-for']?.split(',')[0]||'unknown';
  return send(res,200,await book(body,ip));
 }catch(error){return fail(res,error);}
};
