#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { normalize, formatNormalize } = require('./normalize');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runNormalize(argv) {
  const args = argv.slice(2);
  const writeFlag = args.includes('--write') || args.includes('-w');
  const quietFlag = args.includes('--quiet') || args.includes('-q');
  const files = args.filter(a => !a.startsWith('-'));

  if (files.length === 0) {
    fatal('Usage: envpatch normalize <file> [--write] [--quiet]');
  }

  const filePath = path.resolve(files[0]);

  if (!fs.existsSync(filePath)) {
    fatal(`File not found: ${filePath}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    fatal(`Could not read file: ${e.message}`);
  }

  const env = parse(raw);
  const { env: normalized, changes } = normalize(env);

  if (!quietFlag) {
    console.log(formatNormalize(changes));
  }

  if (writeFlag) {
    if (changes.length === 0) {
      if (!quietFlag) console.log('Nothing to write.');
      return;
    }
    try {
      fs.writeFileSync(filePath, serialize(normalized), 'utf8');
      if (!quietFlag) console.log(`Written to ${filePath}`);
    } catch (e) {
      fatal(`Could not write file: ${e.message}`);
    }
  } else if (changes.length > 0) {
    console.log('\nNormalized output:');
    console.log(serialize(normalized));
  }
}

if (require.main === module) {
  runNormalize(process.argv);
}

module.exports = { runNormalize };
