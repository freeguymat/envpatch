#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { lint, formatLint } = require('./lint');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runLint(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: envpatch lint <file> [--strict]');
    console.log('');
    console.log('Options:');
    console.log('  --strict   Exit with code 1 on warnings as well as errors');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  const strict = args.includes('--strict');

  if (!fs.existsSync(filePath)) {
    fatal(`file not found: ${filePath}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    fatal(`could not read file: ${e.message}`);
  }

  const env = parse(raw);
  const issues = lint(env, raw);

  console.log(formatLint(issues));

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warn');

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  if (strict && warnings.length > 0) {
    console.error(`\n${warnings.length} warning(s) found (strict mode).`);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  runLint(process.argv);
}

module.exports = { runLint };
