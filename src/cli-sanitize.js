#!/usr/bin/env node
// cli-sanitize.js — CLI for the sanitize command

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { sanitize, formatSanitize } = require('./sanitize');

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function runSanitize(argv = process.argv.slice(2)) {
  const args = argv.filter(a => !a.startsWith('--'));
  const flags = argv.filter(a => a.startsWith('--'));

  const inPlace = flags.includes('--in-place') || flags.includes('-i');
  const collapseWhitespace = flags.includes('--collapse-whitespace');
  const quiet = flags.includes('--quiet');
  const outputFlag = flags.find(f => f.startsWith('--output='));
  const outputFile = outputFlag ? outputFlag.split('=')[1] : null;

  const filePath = args[0];
  if (!filePath) fatal('Usage: envpatch sanitize <file> [--in-place] [--collapse-whitespace] [--output=<file>]');

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    fatal(`Cannot read file: ${filePath}`);
  }

  const env = parse(raw);
  const { result, changes } = sanitize(env, { collapseWhitespace });

  if (!quiet) {
    console.log(formatSanitize(changes));
  }

  if (changes.length === 0) return;

  const serialized = serialize(result);

  if (inPlace) {
    fs.writeFileSync(filePath, serialized, 'utf8');
    if (!quiet) console.log(`\nWrote sanitized file to ${filePath}`);
  } else if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), serialized, 'utf8');
    if (!quiet) console.log(`\nWrote sanitized file to ${outputFile}`);
  } else {
    process.stdout.write(serialized);
  }
}

if (require.main === module) runSanitize();
module.exports = { runSanitize, fatal };
