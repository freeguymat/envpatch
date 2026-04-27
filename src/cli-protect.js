#!/usr/bin/env node
// cli-protect.js — CLI for protect command

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { protect, checkProtected, formatProtect } = require('./protect');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(abs, 'utf8'));
}

function runProtect(argv) {
  // envpatch protect check <base> <updated> --keys KEY1,KEY2
  // envpatch protect list  <file>           --keys KEY1,KEY2  (just echoes)
  const [subcmd, ...rest] = argv;

  if (subcmd === 'check') {
    const [baseFile, updatedFile] = rest;
    if (!baseFile || !updatedFile) fatal('usage: protect check <base> <updated> --keys KEY1,KEY2');

    const keyFlag = rest.find(a => a.startsWith('--keys=')) ||
      (() => { const i = rest.indexOf('--keys'); return i !== -1 ? `--keys=${rest[i + 1]}` : null; })();
    if (!keyFlag) fatal('--keys is required');

    const keys = keyFlag.replace('--keys=', '').split(',').map(k => k.trim()).filter(Boolean);
    if (!keys.length) fatal('--keys must include at least one key name');

    const base = readEnv(baseFile);
    const updated = readEnv(updatedFile);

    const result = checkProtected(base, updated, keys);
    console.log(formatProtect(result));

    if (result.violations.length > 0) process.exit(1);
    return;
  }

  if (subcmd === 'list') {
    const [file] = rest;
    if (!file) fatal('usage: protect list <file> --keys KEY1,KEY2');

    const keyFlag = rest.find(a => a.startsWith('--keys=')) ||
      (() => { const i = rest.indexOf('--keys'); return i !== -1 ? `--keys=${rest[i + 1]}` : null; })();
    if (!keyFlag) fatal('--keys is required');

    const keys = keyFlag.replace('--keys=', '').split(',').map(k => k.trim()).filter(Boolean);
    const env = readEnv(file);
    const { protected: pkeys } = protect(env, keys);
    console.log('Protected keys:');
    pkeys.forEach(k => console.log(`  ${k} = ${env[k]}`));
    return;
  }

  fatal(`unknown subcommand: ${subcmd}. Use check or list.`);
}

if (require.main === module) {
  runProtect(process.argv.slice(2));
}

module.exports = { runProtect };
