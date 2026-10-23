import {Router} from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {requireAuth} from '../middleware/auth.js';
import env from '../config.js';
import {requireDatabase} from '../db/pool.js';
const r=Router(),allowed=new Set(['video/mp4','video/quicktime','video/webm']);
const upload=multer({dest:env.UPLOAD_DIR,limits:{fileSize:env.MAX_VIDEO_BYTES,files:1,fields:0},fileFilter:(_req,file,cb)=>cb(null,allowed.has(file.mimetype))});
r.post('/',requireAuth,(req,res,next)=>{
 fs.mkdirSync(env.UPLOAD_DIR,{recursive:true});
 upload.single('video')(req,res,async err=>{
  if(err)return res.status(err.code==='LIMIT_FILE_SIZE'?413:400).json({error:err.code||'UPLOAD_FAILED',message:err.code==='LIMIT_FILE_SIZE'?'Video exceeds configured size limit.':'Invalid upload.'});
  if(!req.file)return res.status(400).json({error:'VIDEO_REQUIRED',message:'Attach one supported video in field video.'});
  try{
   const id=crypto.randomUUID(),stored=`${id}${path.extname(req.file.originalname).toLowerCase()}`,target=path.join(env.UPLOAD_DIR,stored),buf=fs.readFileSync(req.file.path),sha=crypto.createHash('sha256').update(buf).digest('hex');
   fs.renameSync(req.file.path,target);
   const q=await requireDatabase().query('INSERT INTO videos(id,original_name,stored_name,mime_type,size_bytes,sha256) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,original_name,mime_type,size_bytes,sha256,created_at',[id,path.basename(req.file.originalname).slice(0,255),stored,req.file.mimetype,req.file.size,sha]);
   res.status(201).json({video:q.rows[0]});
  }catch(e){try{fs.unlinkSync(req.file.path)}catch{}next(e);}
 });
});
export default r;
