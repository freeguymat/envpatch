// cli-set.js — CLI handler for `envpatch set` and `envpatch unset`
import fs from 'node:fs';
import { parse, serialize } from './parser.js';
import { setKeys, unsetKeys, formatSet } from './set.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function runSet(argv) {
  // argv: [file, KEY=VALUE ...]
  const [file, ...pairs] = argv;
  if (!file || pairs.length === 0) fatal('usage: envpatch set <file> KEY=VALUE ...');

  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch { fatal(`cannot read ${file}`); }

  const env = parse(raw);
  const updates = {};
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq < 1) fatal(`invalid pair: ${pair}`);
    updates[pair.slice(0, eq)] = pair.slice(eq + 1);
  }

  const result = setKeys(env, updates);
  fs.writeFileSync(file, serialize(result));
  console.log(formatSet(Object.keys(updates), []));
}

export function runUnset(argv) {
  // argv: [file, KEY ...]
  const [file, ...keys] = argv;
  if (!file || keys.length === 0) fatal('usage: envpatch unset <file> KEY ...');

  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch { fatal(`cannot read ${file}`); }

  const env = parse(raw);
  const result = unsetKeys(env, keys);
  fs.writeFileSync(file, serialize(result));
  console.log(formatSet([], keys));
}
