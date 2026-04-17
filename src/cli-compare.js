#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { compare, formatCompare } = require('./compare');

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function readEnv(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(abs, 'utf8'));
}

function runCompare(args) {
  const flags = {
    json: args.includes('--json'),
    keysOnly: args.includes('--keys-only'),
    missingOnly: args.includes('--missing-only'),
  };

  const files = args.filter(a => !a.startsWith('--'));

  if (files.length < 2) {
    fatal('usage: envpatch compare <file1> <file2> [--json] [--keys-only] [--missing-only]');
  }

  const [file1, file2] = files;
  const envA = readEnv(file1);
  const envB = readEnv(file2);

  const result = compare(envA, envB);

  if (flags.json) {
    let output = result;
    if (flags.missingOnly) {
      output = {
        onlyInA: result.onlyInA,
        onlyInB: result.onlyInB,
      };
    } else if (flags.keysOnly) {
      output = {
        onlyInA: result.onlyInA,
        onlyInB: result.onlyInB,
        changed: result.changed.map(c => c.key),
      };
    }
    console.log(JSON.stringify(output, null, 2));
  } else {
    const formatted = formatCompare(result, { keysOnly: flags.keysOnly, missingOnly: flags.missingOnly });
    if (!formatted.trim()) {
      console.log('no differences found');
    } else {
      console.log(formatted);
    }
  }
}

module.exports = { runCompare };

if (require.main === module) {
  runCompare(process.argv.slice(2));
}
