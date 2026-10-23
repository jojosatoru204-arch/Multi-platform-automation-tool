import crypto from 'node:crypto';
import {requireDatabase} from '../db/pool.js';
export async function listJobs(limit=50){
 const r=await requireDatabase().query(`SELECT j.id,j.platform,j.title,j.scheduled_at,j.status,j.platform_post_id,j.platform_status,j.error_code,j.error_message,j.attempts,j.created_at,j.updated_at,j.completed_at,v.original_name,v.size_bytes FROM publish_jobs j JOIN videos v ON v.id=j.video_id ORDER BY j.created_at DESC LIMIT $1`,[Math.min(Math.max(Number(limit)||50,1),100)]);
 return r.rows;
}
export async function createJob(d){
 const id=crypto.randomUUID(),idem=crypto.randomUUID();
 const r=await requireDatabase().query(`INSERT INTO publish_jobs(id,video_id,platform,account_id,title,description,tags,privacy,scheduled_at,status,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'queued',$10) RETURNING id,platform,title,scheduled_at,status,created_at`,[id,d.videoId,d.platform,d.accountId||null,d.title,d.description||'',d.tags||[],d.privacy||'private',d.scheduledAt||null,idem]);
 return r.rows[0];
}
