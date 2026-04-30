#!/usr/bin/env node
/**
 * cli-split.js — CLI for splitting a .env file by prefix into separate files
 *
 * Usage:
 *   envpatch split <input> --prefix DB_ --prefix REDIS_ [--out-dir ./envs] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { split, formatSplit } = require('./split');

function fatal(msg) {
  console.error('error: ' + msg);
  process.exit(1);
}

function runSplit(argv) {
  const args = argv.slice(2);
  const inputFile = args[0];

  if (!inputFile) fatal('input file required');

  const prefixes = [];
  let outDir = '.';
  let dryRun = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--prefix' && args[i + 1]) {
      prefixes.push(args[++i]);
    } else if (args[i] === '--out-dir' && args[i + 1]) {
      outDir = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (prefixes.length === 0) fatal('at least one --prefix is required');

  let raw;
  try {
    raw = fs.readFileSync(inputFile, 'utf8');
  } catch (e) {
    fatal(`cannot read file: ${inputFile}`);
  }

  const env = parse(raw);
  const groups = split(env, prefixes);

  console.log('Split summary:');
  console.log(formatSplit(groups));

  if (dryRun) {
    console.log('\n(dry run — no files written)');
    return;
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const [group, keys] of Object.entries(groups)) {
    const filename = group === '__rest__'
      ? '.env.rest'
      : `.env.${group.replace(/_+$/, '').toLowerCase()}`;
    const outPath = path.join(outDir, filename);
    fs.writeFileSync(outPath, serialize(keys), 'utf8');
    console.log(`wrote ${outPath} (${Object.keys(keys).length} keys)`);
  }
}

if (require.main === module) {
  runSplit(process.argv);
}

module.exports = { runSplit };
