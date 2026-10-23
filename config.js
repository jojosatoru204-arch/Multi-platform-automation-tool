import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';
const schema = z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 PORT:z.coerce.number().int().min(1).max(65535).default(3000),
 HOST:z.string().default('0.0.0.0'), APP_NAME:z.string().default('MultiPost Studio'),
 PUBLIC_BASE_URL:z.string().url().default('http://localhost:3000'),
 DATABASE_URL:z.string().optional().default(''), DATABASE_SSL:z.string().default('false'),
 JWT_SECRET:z.string().default(''), ADMIN_USERNAME:z.string().default('admin'),
 ADMIN_PASSWORD_HASH:z.string().default(''), MAX_VIDEO_BYTES:z.coerce.number().int().positive().default(536870912),
 UPLOAD_DIR:z.string().default('./var/uploads'), JOB_POLL_INTERVAL_MS:z.coerce.number().int().min(5000).default(15000),
 GOOGLE_CLIENT_ID:z.string().default(''), GOOGLE_CLIENT_SECRET:z.string().default(''), GOOGLE_REDIRECT_URI:z.string().default(''),
 TIKTOK_CLIENT_KEY:z.string().default(''), TIKTOK_CLIENT_SECRET:z.string().default(''), TIKTOK_REDIRECT_URI:z.string().default(''),
 META_APP_ID:z.string().default(''), META_APP_SECRET:z.string().default(''), META_REDIRECT_URI:z.string().default(''),
 META_GRAPH_VERSION:z.string().default('v23.0')
});
const parsed=schema.safeParse(process.env);
if(!parsed.success){console.error('Invalid environment configuration');process.exit(1);}
const env=parsed.data;
if(env.NODE_ENV==='production'){
 if(env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be at least 32 characters.');
 if(!env.DATABASE_URL)throw new Error('DATABASE_URL required in production.');
 if(!env.ADMIN_PASSWORD_HASH)throw new Error('ADMIN_PASSWORD_HASH required in production.');
 if(!env.PUBLIC_BASE_URL.startsWith('https://'))throw new Error('PUBLIC_BASE_URL must use HTTPS.');
}
env.UPLOAD_DIR=path.resolve(env.UPLOAD_DIR);
export default env;
