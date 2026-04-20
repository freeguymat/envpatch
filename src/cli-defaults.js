/**
 * cli-defaults.js — CLI handler for `envpatch defaults`
 *
 * Usage:
 *   envpatch defaults <env-file> <defaults-file> [--write] [--quiet]
 */

import fs from 'fs';
import { parse, serialize } from './parser.js';
import { applyDefaults, formatDefaults } from './defaults.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filepath) {
  try {
    return parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    fatal(`cannot read file: ${filepath}`);
  }
}

export function runDefaults(argv) {
  const args = argv.slice(2);
  const write = args.includes('--write');
  const quiet = args.includes('--quiet');
  const positional = args.filter((a) => !a.startsWith('--'));

  if (positional.length < 2) {
    fatal('usage: envpatch defaults <env-file> <defaults-file> [--write] [--quiet]');
  }

  const [envFile, defaultsFile] = positional;
  const env = readEnv(envFile);
  const defaults = readEnv(defaultsFile);

  const { result, filled } = applyDefaults(env, defaults);

  if (!quiet) {
    console.log(formatDefaults(filled));
  }

  if (write) {
    if (filled.length === 0) {
      if (!quiet) console.log('Nothing to write.');
      return;
    }
    fs.writeFileSync(envFile, serialize(result), 'utf8');
    if (!quiet) console.log(`Written to ${envFile}`);
  } else {
    if (filled.length > 0) {
      process.stdout.write(serialize(result));
    }
  }
}
