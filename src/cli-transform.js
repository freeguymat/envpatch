#!/usr/bin/env node
// cli-transform.js — CLI wrapper for the transform command

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { transform, formatTransform } = require('./transform');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runTransform(argv) {
  const args = argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));

  if (!file) fatal('usage: envpatch transform <file> [--keys=<mode>] [--values=<mode>] [--in-place]');

  const keysFlag   = (args.find(a => a.startsWith('--keys='))   || '').replace('--keys=', '')   || null;
  const valuesFlag = (args.find(a => a.startsWith('--values=')) || '').replace('--values=', '') || null;
  const inPlace    = args.includes('--in-place');

  const validKeyModes   = ['uppercase', 'lowercase', 'snake', 'camel'];
  const validValModes   = ['uppercase', 'lowercase', 'trim'];

  if (keysFlag   && !validKeyModes.includes(keysFlag))   fatal(`unknown --keys mode: ${keysFlag}`);
  if (valuesFlag && !validValModes.includes(valuesFlag)) fatal(`unknown --values mode: ${valuesFlag}`);

  let raw;
  try { raw = fs.readFileSync(path.resolve(file), 'utf8'); }
  catch (e) { fatal(`cannot read file: ${file}`); }

  const env = parse(raw);
  const { result, changes } = transform(env, {
    ...(keysFlag   ? { keys: keysFlag }     : {}),
    ...(valuesFlag ? { values: valuesFlag } : {}),
  });

  console.log(formatTransform(changes));

  if (inPlace) {
    fs.writeFileSync(path.resolve(file), serialize(result), 'utf8');
    console.log(`Written to ${file}`);
  } else {
    process.stdout.write(serialize(result));
  }
}

if (require.main === module) runTransform(process.argv);
module.exports = { runTransform };
