import fs from 'node:fs';
import { parse } from './parser.js';
import { group, formatGroup, listPrefixes } from './group.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function runGroup(argv) {
  const args = argv.slice(2);
  const listOnly = args.includes('--list-prefixes');
  const prefixFilter = (() => {
    const idx = args.indexOf('--prefix');
    return idx !== -1 ? args[idx + 1] : null;
  })();
  const separatorIdx = args.indexOf('--sep');
  const separator = separatorIdx !== -1 ? args[separatorIdx + 1] : '_';

  const file = args.find(a => !a.startsWith('-') && args.indexOf(a) !== separatorIdx + 1 && args.indexOf(a) !== args.indexOf('--prefix') + 1);

  if (!file) fatal('usage: envpatch group <file> [--prefix PREFIX] [--sep SEP] [--list-prefixes]');
  if (!fs.existsSync(file)) fatal(`file not found: ${file}`);

  const raw = fs.readFileSync(file, 'utf8');
  const env = parse(raw);

  if (listOnly) {
    const prefixes = listPrefixes(env, separator);
    if (prefixes.length === 0) {
      console.log('no prefixes found');
    } else {
      console.log(prefixes.join('\n'));
    }
    return;
  }

  const grouped = group(env, separator);

  if (prefixFilter) {
    const key = prefixFilter.toUpperCase();
    if (!grouped[key]) {
      fatal(`prefix not found: ${prefixFilter}`);
    }
    const filtered = { [key]: grouped[key] };
    console.log(formatGroup(filtered));
    return;
  }

  console.log(formatGroup(grouped));
}
