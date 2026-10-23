import crypto from 'node:crypto';
const KEY_TEXT=process.env.TOKEN_ENCRYPTION_KEY||'';
function key(){const k=Buffer.from(KEY_TEXT,'base64');if(!KEY_TEXT||k.length!==32)throw Object.assign(new Error('TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.'),{status:503,code:'TOKEN_ENCRYPTION_NOT_CONFIGURED'});return k;}
export function encryptSecret(value){const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',key(),iv),data=Buffer.concat([c.update(String(value),'utf8'),c.final()]);return [iv.toString('base64'),c.getAuthTag().toString('base64'),data.toString('base64')].join('.');}
export function decryptSecret(payload){const [i,t,d]=String(payload).split('.');if(!i||!t||!d)throw Error('Invalid encrypted secret format.');const c=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(i,'base64'));c.setAuthTag(Buffer.from(t,'base64'));return Buffer.concat([c.update(Buffer.from(d,'base64')),c.final()]).toString('utf8');}
