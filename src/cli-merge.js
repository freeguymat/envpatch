/**
 * CLI handler for the `envpatch merge` command.
 * Usage: envpatch merge <base> <incoming> [--strategy=ours|theirs|union] [--out=<file>]
 */
import fs from 'fs';
import path from 'path';
import { parse, serialize } from './parser.js';
import { merge } from './merge.js';

export function runMerge(args) {
  const positional = args.filter(a => !a.startsWith('--'));
  const flags = Object.fromEntries(
    args
      .filter(a => a.startsWith('--'))
      .map(a => a.slice(2).split('='))
      .map(([k, v]) => [k, v ?? true])
  );

  const [basePath, incomingPath] = positional;

  if (!basePath || !incomingPath) {
    console.error('Usage: envpatch merge <base> <incoming> [--strategy=ours|theirs|union] [--out=<file>]');
    process.exit(1);
  }

  const strategy = flags.strategy || 'ours';
  if (!['ours', 'theirs', 'union'].includes(strategy)) {
    console.error(`Unknown strategy: ${strategy}. Use ours, theirs, or union.`);
    process.exit(1);
  }

  let baseContent, incomingContent;
  try {
    baseContent = fs.readFileSync(path.resolve(basePath), 'utf8');
    incomingContent = fs.readFileSync(path.resolve(incomingPath), 'utf8');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  const base = parse(baseContent);
  const incoming = parse(incomingContent);
  const { merged, conflicts } = merge(base, incoming, strategy);

  if (conflicts.length > 0) {
    console.warn(`⚠ ${conflicts.length} conflict(s) resolved using strategy "${strategy}":`);
    for (const c of conflicts) {
      console.warn(`  ${c.key}: base="${c.base}" incoming="${c.incoming}"`);
    }
  }

  const output = serialize(merged);

  if (flags.out) {
    fs.writeFileSync(path.resolve(flags.out), output, 'utf8');
    console.log(`Merged env written to ${flags.out}`);
  } else {
    process.stdout.write(output);
  }
}
