import fs from 'node:fs';
import path from 'node:path';
import env from '../config.js';
import {pool} from '../db/pool.js';
import {publishJob} from '../services/providers.js';
let timer,busy=false;
async function runOne(){
 if(!pool||busy)return;busy=true;let client,job;
 try{
  client=await pool.connect();await client.query('BEGIN');
  const q=await client.query(`SELECT j.*,v.stored_name FROM publish_jobs j JOIN videos v ON v.id=j.video_id WHERE j.status='queued' AND (j.scheduled_at IS NULL OR j.scheduled_at<=NOW()) ORDER BY COALESCE(j.scheduled_at,j.created_at),j.created_at FOR UPDATE OF j SKIP LOCKED LIMIT 1`);
  if(!q.rows.length){await client.query('COMMIT');return;}
  job=q.rows[0];await client.query("UPDATE publish_jobs SET status='uploading',attempts=attempts+1,updated_at=NOW() WHERE id=$1",[job.id]);await client.query('COMMIT');client.release();client=null;
  const file=path.join(env.UPLOAD_DIR,job.stored_name);if(!fs.existsSync(file))throw Object.assign(new Error('Stored video file is missing.'),{code:'VIDEO_FILE_MISSING'});
  const result=await publishJob(job,file);
  await pool.query("UPDATE publish_jobs SET status='processing',platform_post_id=$2,platform_status=$3,updated_at=NOW() WHERE id=$1",[job.id,result.postId,result.status]);
 }catch(e){
  if(client)try{await client.query('ROLLBACK')}catch{}
  if(job)await pool.query("UPDATE publish_jobs SET status='failed',error_code=$2,error_message=$3,updated_at=NOW(),completed_at=NOW() WHERE id=$1",[job.id,String(e.code||'PUBLISH_FAILED').slice(0,100),String(e.message||'Publish failed').slice(0,500)]).catch(()=>{});
  console.error('Worker task failed:',e.code||'PUBLISH_FAILED');
 }finally{client?.release();busy=false;}
}
export function startWorker(){if(!timer)timer=setInterval(runOne,env.JOB_POLL_INTERVAL_MS).unref();}
export function stopWorker(){if(timer)clearInterval(timer);timer=null;}
