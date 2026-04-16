import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encrypt(text, key) {
  const keyBuf = normalizeKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuf, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(data, key) {
  const keyBuf = normalizeKey(key);
  const buf = Buffer.from(data, 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuf, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function encryptEnv(parsed, key, sensitiveKeys) {
  const result = {};
  for (const [k, v] of Object.entries(parsed)) {
    result[k] = sensitiveKeys.includes(k) ? 'enc:' + encrypt(v, key) : v;
  }
  return result;
}

export function decryptEnv(parsed, key) {
  const result = {};
  for (const [k, v] of Object.entries(parsed)) {
    result[k] = typeof v === 'string' && v.startsWith('enc:') ? decrypt(v.slice(4), key) : v;
  }
  return result;
}

function normalizeKey(key) {
  return crypto.createHash('sha256').update(key).digest();
}
