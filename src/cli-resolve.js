#!/usr/bin/env node
// cli-resolve.js — CLI entry for the resolve command
// Usage: envpatch resolve <env-file> [--base <base-file>] [--write]

import fs from 'node:fs';
import path from 'node:path';
import { parse, serialize } from './parser.js';
import { resolve, formatResolve } from './resolve.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(filePath, 'utf8'));
}

export function runResolve(argv) {
  const args = argv.slice(2);
  const envFile = args[0];
  if (!envFile) fatal('usage: envpatch resolve <env-file> [--base <base-file>] [--write]');

  let baseEnv = {};
  const baseIdx = args.indexOf('--base');
  if (baseIdx !== -1) {
    const baseFile = args[baseIdx + 1];
    if (!baseFile) fatal('--base requires a file argument');
    baseEnv = readEnv(baseFile);
  }

  const write = args.includes('--write');
  const env = readEnv(envFile);
  const { resolved, unresolved } = resolve(env, baseEnv);

  if (unresolved.length > 0) {
    for (const warn of unresolved) {
      console.warn(`warning: ${warn}`);
    }
  }

  if (write) {
    fs.writeFileSync(envFile, serialize(resolved), 'utf8');
    console.log(`wrote resolved env to ${path.resolve(envFile)}`);
  } else {
    console.log(formatResolve(resolved, unresolved));
  }
}

if (process.argv[1] && process.argv[1].endsWith('cli-resolve.js')) {
  runResolve(process.argv);
}
