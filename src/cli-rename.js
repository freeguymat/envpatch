#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { parse, serialize } from './parser.js';
import { renameKeys, formatRename } from './rename.js';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

export function runRename(argv) {
  const args = argv.slice(2);

  if (args.length < 2) {
    fatal('usage: envpatch rename <file> <OLD=NEW> [OLD=NEW ...] [--dry-run] [--quiet]');
  }

  const file = args[0];
  const dryRun = args.includes('--dry-run');
  const quiet = args.includes('--quiet');

  const mappingArgs = args.slice(1).filter(a => !a.startsWith('--'));

  if (mappingArgs.length === 0) {
    fatal('provide at least one OLD=NEW mapping');
  }

  const mapping = {};
  for (const m of mappingArgs) {
    const eq = m.indexOf('=');
    if (eq < 1) fatal(`invalid mapping: ${m}`);
    const oldKey = m.slice(0, eq);
    const newKey = m.slice(eq + 1);
    if (!newKey) fatal(`invalid mapping: ${m}`);
    mapping[oldKey] = newKey;
  }

  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    fatal(`cannot read file: ${file}`);
  }

  const env = parse(src);
  const { result, changes } = renameKeys(env, mapping);

  if (!quiet) {
    const report = formatRename(changes);
    if (report) console.log(report);
    else console.log('no matching keys found');
  }

  if (!dryRun) {
    writeFileSync(file, serialize(result), 'utf8');
    if (!quiet) console.log(`wrote ${file}`);
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('cli-rename.js');
if (isMain) runRename(process.argv);
