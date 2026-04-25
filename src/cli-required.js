#!/usr/bin/env node
// cli-required.js — CLI for checking required env keys

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { checkRequired, formatRequired } = require('./required');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runRequired(argv = process.argv.slice(2)) {
  // Usage: envpatch required <envFile> KEY1 KEY2 ...
  // Or with --keys-file <file> for a newline-separated list

  let envFile = null;
  const keys = [];
  let keysFile = null;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--keys-file' || argv[i] === '-k') {
      keysFile = argv[++i];
    } else if (!envFile) {
      envFile = argv[i];
    } else {
      keys.push(argv[i]);
    }
  }

  if (!envFile) fatal('usage: envpatch required <envFile> [KEY...] [--keys-file <file>]');

  let raw;
  try {
    raw = fs.readFileSync(path.resolve(envFile), 'utf8');
  } catch {
    fatal(`could not read file: ${envFile}`);
  }

  if (keysFile) {
    try {
      const content = fs.readFileSync(path.resolve(keysFile), 'utf8');
      const fileKeys = content.split('\n').map(l => l.trim()).filter(Boolean);
      keys.push(...fileKeys);
    } catch {
      fatal(`could not read keys file: ${keysFile}`);
    }
  }

  if (keys.length === 0) fatal('no required keys specified');

  const env = parse(raw);
  const result = checkRequired(env, keys);

  console.log(formatRequired(result));

  if (result.missing.length > 0) {
    process.exit(1);
  }
}

module.exports = { runRequired };

if (require.main === module) {
  runRequired();
}
