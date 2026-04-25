#!/usr/bin/env node
// cli-extract.js — CLI handler for the extract command

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { extract, formatExtract } = require('./extract');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runExtract(argv) {
  // usage: envpatch extract <file> KEY1 KEY2 ... [--out <outfile>] [--strict]
  if (argv.length < 2) {
    fatal('usage: extract <file> KEY1 KEY2 ... [--out <outfile>] [--strict]');
  }

  const [file, ...rest] = argv;

  const outIdx = rest.indexOf('--out');
  let outFile = null;
  let keys = [...rest];

  if (outIdx !== -1) {
    outFile = rest[outIdx + 1];
    if (!outFile) fatal('--out requires a filename');
    keys = rest.filter((_, i) => i !== outIdx && i !== outIdx + 1);
  }

  const strict = keys.includes('--strict');
  keys = keys.filter(k => k !== '--strict');

  if (keys.length === 0) fatal('at least one key must be specified');

  let raw;
  try {
    raw = fs.readFileSync(path.resolve(file), 'utf8');
  } catch {
    fatal(`could not read file: ${file}`);
  }

  const env = parse(raw);
  const result = extract(env, keys);

  if (strict && result.missing.length > 0) {
    fatal(`missing keys: ${result.missing.join(', ')}`);
  }

  if (outFile) {
    const serialized = serialize(result.extracted);
    fs.writeFileSync(path.resolve(outFile), serialized, 'utf8');
    console.log(formatExtract(result));
  } else {
    console.log(formatExtract(result));
  }
}

module.exports = { runExtract };
