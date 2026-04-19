#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parse, serialize } from './parser.js';
import { sort, formatSort } from './sort.js';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

export function runSort(argv) {
  const args = argv.slice(2);
  const fileArg = args.find(a => !a.startsWith('--'));
  const inPlace = args.includes('--in-place') || args.includes('-i');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const groupsFlag = args.find(a => a.startsWith('--groups='));
  const groups = groupsFlag ? groupsFlag.split('=')[1].split(',') : [];

  if (!fileArg) fatal('usage: envpatch sort <file> [--in-place] [--verbose] [--groups=A,B]');

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);

  const raw = fs.readFileSync(filePath, 'utf8');
  const env = parse(raw);
  const result = sort(env, { groups });

  if (verbose) {
    console.log(formatSort(result));
  }

  const output = serialize(result.sorted);

  if (inPlace) {
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`sorted ${filePath}`);
  } else {
    process.stdout.write(output);
  }
}

if (process.argv[1].endsWith('cli-sort.js')) {
  runSort(process.argv);
}
