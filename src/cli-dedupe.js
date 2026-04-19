#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { dedupe, formatDedupe } from './dedupe.js';
import { parse, serialize } from './parser.js';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

export function runDedupe(argv) {
  const args = argv.slice(2);
  const inPlace = args.includes('--in-place') || args.includes('-i');
  const quiet = args.includes('--quiet') || args.includes('-q');
  const files = args.filter(a => !a.startsWith('-'));

  if (files.length === 0) {
    fatal('usage: envpatch dedupe <file> [--in-place] [--quiet]');
  }

  const filePath = files[0];
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    fatal(`could not read file: ${filePath}`);
  }

  const parsed = parse(raw);
  const result = dedupe(parsed);

  if (!quiet) {
    const report = formatDedupe(result);
    if (report) console.log(report);
    else console.log('no duplicates found');
  }

  if (inPlace) {
    const out = serialize(result.deduped);
    writeFileSync(filePath, out, 'utf8');
    if (!quiet) console.log(`wrote ${filePath}`);
  }
}

if (process.argv[1].endsWith('cli-dedupe.js')) {
  runDedupe(process.argv);
}
