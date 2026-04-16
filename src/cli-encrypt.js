import fs from 'fs';
import path from 'path';
import { parse, serialize } from './parser.js';
import { isSensitive } from './redact.js';
import { encryptEnv, decryptEnv } from './encrypt.js';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(filePath, 'utf8'));
}

export function runEncrypt(argv) {
  const mode = argv[0];
  const filePath = argv[1];
  const key = argv[2] || process.env.ENVPATCH_KEY;

  if (!['encrypt', 'decrypt'].includes(mode)) {
    fatal('usage: envpatch encrypt <encrypt|decrypt> <file> [key]');
  }
  if (!filePath) fatal('no .env file specified');
  if (!key) fatal('no encryption key provided (pass as arg or ENVPATCH_KEY)');

  const parsed = readEnv(filePath);

  let result;
  if (mode === 'encrypt') {
    const sensitiveKeys = Object.keys(parsed).filter(isSensitive);
    if (sensitiveKeys.length === 0) {
      console.log('no sensitive keys detected, nothing to encrypt');
      return;
    }
    result = encryptEnv(parsed, key, sensitiveKeys);
    console.log(`encrypted ${sensitiveKeys.length} key(s): ${sensitiveKeys.join(', ')}`);
  } else {
    result = decryptEnv(parsed, key);
    console.log('decrypted env values');
  }

  const outPath = path.resolve(filePath);
  fs.writeFileSync(outPath, serialize(result), 'utf8');
  console.log(`written to ${outPath}`);
}
