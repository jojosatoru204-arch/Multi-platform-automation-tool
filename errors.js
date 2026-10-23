export function notFound(_req,res){res.status(404).json({error:'NOT_FOUND',message:'Route not found.'});}
export function errorHandler(err,_req,res,_next){
 const status=Number.isInteger(err.status)?err.status:500;
 console.error(`Request error (${status}): ${err.code||'INTERNAL'}`);
 res.status(status).json({error:err.code||'REQUEST_FAILED',message:status<500?err.message:'An unexpected server error occurred.'});
}
