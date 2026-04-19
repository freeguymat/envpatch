#!/usr/bin/env node
// CLI: envpatch search --key <pattern> --value <pattern> [--regex] <file>

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { search, formatSearch } = require('./search');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runSearch(argv = process.argv.slice(2)) {
  const args = argv.slice();
  let keyPattern, valuePattern, regex = false;
  const files = [];

  while (args.length) {
    const a = args.shift();
    if (a === '--key') keyPattern = args.shift();
    else if (a === '--value') valuePattern = args.shift();
    else if (a === '--regex') regex = true;
    else files.push(a);
  }

  if (files.length === 0) fatal('no input file specified');
  if (!keyPattern && !valuePattern) fatal('provide at least --key or --value');

  const filePath = path.resolve(files[0]);
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);

  let env;
  try {
    env = parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    fatal(`failed to parse file: ${e.message}`);
  }

  const results = search(env, { key: keyPattern, value: valuePattern, regex });
  console.log(formatSearch(results));
}

if (require.main === module) runSearch();
module.exports = { runSearch };
