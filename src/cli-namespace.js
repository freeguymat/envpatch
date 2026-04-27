#!/usr/bin/env node
// cli-namespace.js — CLI for namespace grouping of .env files

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { namespaceGroup, formatNamespace } = require('./namespace');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runNamespace(argv) {
  const args = argv.slice(2);
  let file = null;
  let delimiter = '_';
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--delimiter' || args[i] === '-d') {
      delimiter = args[++i];
    } else if (args[i] === '--json') {
      jsonOut = true;
    } else if (!file) {
      file = args[i];
    }
  }

  if (!file) fatal('usage: envpatch namespace <file> [--delimiter <char>] [--json]');

  let raw;
  try {
    raw = fs.readFileSync(path.resolve(file), 'utf8');
  } catch {
    fatal(`cannot read file: ${file}`);
  }

  const env = parse(raw);
  const grouped = namespaceGroup(env, delimiter);

  if (jsonOut) {
    // Remove __root__ label for cleaner JSON output
    const out = {};
    for (const [ns, keys] of Object.entries(grouped)) {
      out[ns === '__root__' ? '$root' : ns] = keys;
    }
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(formatNamespace(grouped));
  }
}

if (require.main === module) {
  runNamespace(process.argv);
}

module.exports = { runNamespace };
