import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {verifyAdminCredentials,issueSession,requireAuth} from '../middleware/auth.js';
const r=Router(),limiter=rateLimit({windowMs:900000,limit:10,standardHeaders:true,legacyHeaders:false});
r.post('/login',limiter,async(req,res,next)=>{try{
 const u=String(req.body?.username||''),p=String(req.body?.password||'');
 if(u.length>100||p.length>500||!(await verifyAdminCredentials(u,p)))return res.status(401).json({error:'INVALID_CREDENTIALS',message:'Invalid credentials or server authentication is not configured.'});
 res.cookie('mp_session',issueSession(u),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:28800000,path:'/'});
 res.json({ok:true,user:{username:u}});
}catch(e){next(e);}});
r.post('/logout',(_req,res)=>{res.clearCookie('mp_session',{httpOnly:true,sameSite:'strict',path:'/'});res.json({ok:true});});
r.get('/me',requireAuth,(req,res)=>res.json({user:req.user}));
export default r;
