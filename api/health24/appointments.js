'use strict';
const {originAllowed,BookingError,send,fail}=require('../../server/health24-booking');
module.exports=async(req,res)=>{
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{ok:false,code:'method_not_allowed'});}
 try{
  if(!originAllowed(req.headers.origin))throw new BookingError('origin_not_allowed',403);
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw new BookingError('invalid_request');
  // Cached versions of the previous form must not create direct appointments.
  throw new BookingError('booking_via_administrator',409);
 }catch(error){return fail(res,error);}
};
