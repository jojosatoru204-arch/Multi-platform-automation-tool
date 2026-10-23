import {Router} from 'express';
import crypto from 'node:crypto';
import {google} from 'googleapis';
import env from '../config.js';
const r=Router(),states=new Map(),ttl=600000;
function makeState(platform){const s=crypto.randomBytes(32).toString('hex');states.set(s,{platform,expires:Date.now()+ttl});return s;}
function consume(s,p){const x=states.get(s);states.delete(s);return !!x&&x.platform===p&&x.expires>Date.now();}
function missing(res,p){return res.status(503).json({error:'OAUTH_NOT_CONFIGURED',message:`${p} OAuth credentials are not configured.`});}
r.get('/youtube',(_req,res)=>{if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.GOOGLE_REDIRECT_URI)return missing(res,'YouTube');const o=new google.auth.OAuth2(env.GOOGLE_CLIENT_ID,env.GOOGLE_CLIENT_SECRET,env.GOOGLE_REDIRECT_URI);res.redirect(o.generateAuthUrl({access_type:'offline',prompt:'consent',scope:['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube.readonly'],state:makeState('youtube')}));});
r.get('/youtube/callback',(req,res)=>{if(!consume(String(req.query.state||''),'youtube'))return res.status(400).send('Invalid or expired OAuth state.');if(req.query.error)return res.status(400).send('Authorization denied.');res.status(501).send('OAuth callback received, but account identity mapping and encrypted token persistence are not yet implemented. No post was published.');});
r.get('/tiktok',(_req,res)=>{if(!env.TIKTOK_CLIENT_KEY||!env.TIKTOK_CLIENT_SECRET||!env.TIKTOK_REDIRECT_URI)return missing(res,'TikTok');const u=new URL('https://www.tiktok.com/v2/auth/authorize/');u.search=new URLSearchParams({client_key:env.TIKTOK_CLIENT_KEY,response_type:'code',scope:'user.info.basic,video.publish,video.upload',redirect_uri:env.TIKTOK_REDIRECT_URI,state:makeState('tiktok')}).toString();res.redirect(u.toString());});
r.get('/tiktok/callback',(req,res)=>{if(!consume(String(req.query.state||''),'tiktok'))return res.status(400).send('Invalid or expired OAuth state.');res.status(501).send('TikTok token exchange and secure persistence are not implemented; no video was published.');});
r.get('/facebook',(_req,res)=>{if(!env.META_APP_ID||!env.META_APP_SECRET||!env.META_REDIRECT_URI)return missing(res,'Facebook');const u=new URL(`https://www.facebook.com/${env.META_GRAPH_VERSION}/dialog/oauth`);u.search=new URLSearchParams({client_id:env.META_APP_ID,redirect_uri:env.META_REDIRECT_URI,state:makeState('facebook'),response_type:'code',scope:'pages_show_list,pages_read_engagement,pages_manage_posts'}).toString();res.redirect(u.toString());});
r.get('/facebook/callback',(req,res)=>{if(!consume(String(req.query.state||''),'facebook'))return res.status(400).send('Invalid or expired OAuth state.');res.status(501).send('Meta token exchange and Page selection are not implemented; no video was published.');});
export default r;
