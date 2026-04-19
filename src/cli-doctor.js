import fs from 'node:fs';
import path from 'node:path';
import { parse } from './parser.js';
import { doctor, formatDoctor } from './doctor.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/**
 * runDoctor — CLI entry point for the doctor command.
 * Usage: envpatch doctor <envfile> [--require KEY,...] [--no-node-env]
 */
export function runDoctor(argv) {
  const args = argv.slice(0);
  const filePath = args.shift();
  if (!filePath) fatal('usage: envpatch doctor <envfile> [--require KEY,...] [--no-node-env]');

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) fatal(`file not found: ${filePath}`);

  let raw;
  try {
    raw = fs.readFileSync(resolved, 'utf8');
  } catch (e) {
    fatal(`could not read file: ${e.message}`);
  }

  const env = parse(raw);

  // Parse --require KEY,KEY2
  let requiredKeys = [];
  const reqIdx = args.indexOf('--require');
  if (reqIdx !== -1) {
    const val = args[reqIdx + 1];
    if (!val || val.startsWith('--')) fatal('--require expects a comma-separated list of keys');
    requiredKeys = val.split(',').map(k => k.trim()).filter(Boolean);
  }

  const checkNodeEnv = !args.includes('--no-node-env');

  const result = doctor(env, { requiredKeys, checkNodeEnv });
  console.log(formatDoctor(result));

  if (!result.healthy) process.exit(1);
}
