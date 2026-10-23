import fs from 'node:fs';
import {google} from 'googleapis';
import env from '../config.js';
import {requireDatabase} from '../db/pool.js';
import {decryptSecret} from '../utils/crypto.js';
async function account(id,platform){const q=await requireDatabase().query('SELECT * FROM connected_accounts WHERE id=$1 AND platform=$2',[id,platform]);if(!q.rows[0])throw Object.assign(new Error(`No connected ${platform} account selected.`),{status:400,code:'ACCOUNT_NOT_FOUND'});return q.rows[0];}
export async function publishYouTube(job,file){
 const a=await account(job.account_id,'youtube'),auth=new google.auth.OAuth2(env.GOOGLE_CLIENT_ID,env.GOOGLE_CLIENT_SECRET,env.GOOGLE_REDIRECT_URI);
 auth.setCredentials({access_token:decryptSecret(a.access_token_enc),refresh_token:a.refresh_token_enc?decryptSecret(a.refresh_token_enc):undefined});
 const yt=google.youtube({version:'v3',auth});
 const r=await yt.videos.insert({part:['snippet','status'],requestBody:{snippet:{title:job.title,description:job.description,tags:job.tags},status:{privacyStatus:['private','unlisted','public'].includes(job.privacy)?job.privacy:'private'}},media:{body:fs.createReadStream(file)}});
 if(!r.data?.id)throw Object.assign(new Error('YouTube did not return a video ID.'),{code:'NO_VIDEO_ID'});
 return {postId:r.data.id,status:'upload_accepted'};
}
export async function publishFacebook(){
 throw Object.assign(new Error('Facebook Page upload is not enabled until Page-token retrieval, permissions and resumable upload flow are implemented.'),{status:501,code:'FACEBOOK_FLOW_NOT_IMPLEMENTED'});
}
export async function publishTikTok(){
 throw Object.assign(new Error('TikTok posting is disabled until the approved Content Posting API flow, creator privacy selection, upload and status polling are implemented.'),{status:501,code:'TIKTOK_FLOW_NOT_IMPLEMENTED'});
}
export async function publishJob(job,file){if(job.platform==='youtube')return publishYouTube(job,file);if(job.platform==='facebook')return publishFacebook(job,file);if(job.platform==='tiktok')return publishTikTok(job,file);throw Object.assign(new Error('Unsupported platform.'),{status:400,code:'UNSUPPORTED_PLATFORM'});}
