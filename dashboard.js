import {Router} from 'express';
import {requireAuth} from '../middleware/auth.js';
import {listJobs} from '../services/jobs.js';
import {requireDatabase} from '../db/pool.js';
const r=Router();r.use(requireAuth);
r.get('/summary',async(_req,res,next)=>{try{const q=await requireDatabase().query('SELECT status,COUNT(*)::int AS count FROM publish_jobs GROUP BY status');res.json({counts:Object.fromEntries(q.rows.map(x=>[x.status,x.count])),database:'connected'});}catch(e){next(e);}});
r.get('/jobs',async(req,res,next)=>{try{res.json({jobs:await listJobs(req.query.limit)});}catch(e){next(e);}});
export default r;
