// cli-promote.js — CLI handler for the `promote` command
import fs from 'fs';
import { parse, serialize } from './parser.js';
import { promote, formatPromote } from './promote.js';

export function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/**
 * runPromote({ from, to, keys, overwrite, dryRun, quiet })
 */
export function runPromote(argv) {
  const {
    from: fromPath,
    to: toPath,
    keys,
    overwrite = false,
    'dry-run': dryRun = false,
    quiet = false,
  } = argv;

  if (!fromPath) fatal('--from <file> is required');
  if (!toPath) fatal('--to <file> is required');

  if (!fs.existsSync(fromPath)) fatal(`source file not found: ${fromPath}`);
  if (!fs.existsSync(toPath)) fatal(`target file not found: ${toPath}`);

  const source = parse(fs.readFileSync(fromPath, 'utf8'));
  const target = parse(fs.readFileSync(toPath, 'utf8'));

  const selectedKeys = keys
    ? (Array.isArray(keys) ? keys : keys.split(',').map(k => k.trim()))
    : [];

  const { result, promoted, skipped, added } = promote(source, target, selectedKeys, { overwrite });

  if (!quiet) {
    console.log(formatPromote({ promoted, skipped, added }));
  }

  if (promoted.length === 0 && !quiet) {
    return;
  }

  if (dryRun) {
    if (!quiet) console.log('\n(dry run — no files written)');
    return;
  }

  fs.writeFileSync(toPath, serialize(result), 'utf8');
  if (!quiet) console.log(`\nWrote ${toPath}`);
}
