#!/usr/bin/env node
// cli-rotate.js — CLI for key rotation

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { rotate, formatRotate } = require('./rotate');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/**
 * Parse rotation specs from CLI args.
 * Format: FROM:TO or FROM:TO=newvalue
 */
function parseRotations(args) {
  return args.map((arg) => {
    const eqIdx = arg.indexOf('=');
    let spec = arg;
    let value;
    if (eqIdx !== -1) {
      value = arg.slice(eqIdx + 1);
      spec = arg.slice(0, eqIdx);
    }
    const colonIdx = spec.indexOf(':');
    if (colonIdx === -1) fatal(`invalid rotation spec: ${arg} (expected FROM:TO)`);
    const from = spec.slice(0, colonIdx);
    const to = spec.slice(colonIdx + 1);
    if (!from || !to) fatal(`invalid rotation spec: ${arg}`);
    return value !== undefined ? { from, to, value } : { from, to };
  });
}

function runRotate(argv) {
  const args = argv.slice(2);
  const fileIdx = args.indexOf('--file');
  const outIdx = args.indexOf('--out');
  const dryRun = args.includes('--dry-run');

  if (fileIdx === -1 || fileIdx + 1 >= args.length) {
    fatal('usage: rotate --file <path> [--out <path>] [--dry-run] FROM:TO[=val] ...');
  }

  const filePath = args[fileIdx + 1];
  const outPath = outIdx !== -1 ? args[outIdx + 1] : filePath;

  const specArgs = args.filter(
    (a, i) =>
      !['--file', '--out', '--dry-run'].includes(a) &&
      args[i - 1] !== '--file' &&
      args[i - 1] !== '--out'
  );

  if (specArgs.length === 0) fatal('no rotation specs provided');

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    fatal(`cannot read file: ${filePath}`);
  }

  const env = parse(raw);
  const rotations = parseRotations(specArgs);
  const report = rotate(env, rotations);

  console.log(formatRotate(report));

  if (!dryRun) {
    fs.writeFileSync(outPath, serialize(report.result));
    console.log(`written to ${outPath}`);
  }
}

if (require.main === module) runRotate(process.argv);
module.exports = { runRotate };
