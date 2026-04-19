#!/usr/bin/env node
// cli-clone.js — envpatch clone command

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { cloneEnv, formatCloneSummary } = require('./clone');

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function runClone(argv) {
  const args = argv.slice(2);
  const srcIndex = args.indexOf('--src');
  const outIndex = args.indexOf('--out');
  const pickIndex = args.indexOf('--pick');
  const omitIndex = args.indexOf('--omit');
  const prefixIndex = args.indexOf('--prefix');
  const stripIndex = args.indexOf('--strip');
  const dryRun = args.includes('--dry-run');

  if (srcIndex === -1) fatal('--src <file> is required');

  const srcFile = args[srcIndex + 1];
  if (!srcFile) fatal('--src requires a file path');
  if (!fs.existsSync(srcFile)) fatal(`file not found: ${srcFile}`);

  const raw = fs.readFileSync(srcFile, 'utf8');
  const env = parse(raw);

  const opts = {};
  if (pickIndex !== -1 && args[pickIndex + 1]) {
    opts.pick = args[pickIndex + 1].split(',').map(s => s.trim());
  }
  if (omitIndex !== -1 && args[omitIndex + 1]) {
    opts.omit = args[omitIndex + 1].split(',').map(s => s.trim());
  }
  if (prefixIndex !== -1 && args[prefixIndex + 1]) {
    opts.prefix = args[prefixIndex + 1];
  }
  if (stripIndex !== -1 && args[stripIndex + 1]) {
    opts.strip = args[stripIndex + 1];
  }

  const cloned = cloneEnv(env, opts);
  const summary = formatCloneSummary(env, cloned);
  const output = serialize(cloned);

  if (dryRun) {
    console.log(output);
    console.log('\n---');
    console.log(summary);
    return;
  }

  if (outIndex === -1) fatal('--out <file> is required (or use --dry-run)');
  const outFile = args[outIndex + 1];
  if (!outFile) fatal('--out requires a file path');

  fs.writeFileSync(outFile, output, 'utf8');
  console.log(`cloned ${srcFile} -> ${outFile}`);
  console.log(summary);
}

if (require.main === module) runClone(process.argv);
module.exports = { runClone };
