import pg from 'pg';
import env from '../config.js';
const {Pool}=pg;
export const pool=env.DATABASE_URL?new Pool({connectionString:env.DATABASE_URL,ssl:env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined,max:5,connectionTimeoutMillis:10000}):null;
export function requireDatabase(){if(!pool)throw Object.assign(new Error('Database not configured; set DATABASE_URL.'),{status:503,code:'DATABASE_NOT_CONFIGURED'});return pool;}
