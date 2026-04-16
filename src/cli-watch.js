import path from 'path';
import { watchEnv } from './watch.js';
import { notify } from './notify.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function runWatch(argv) {
  const args = argv.slice(2);
  const fileArg = args.find((a) => !a.startsWith('--'));

  if (!fileArg) {
    fatal('usage: envpatch watch <file.env> [--quiet]');
  }

  const quiet = args.includes('--quiet');
  const filePath = path.resolve(fileArg);

  console.log(`watching ${filePath} for changes...`);

  const watcher = watchEnv(filePath, (event) => {
    if (!quiet) {
      notify(event);
    } else {
      console.log(JSON.stringify(event));
    }
  });

  process.on('SIGINT', () => {
    watcher.stop();
    console.log('\nstopped.');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    watcher.stop();
    process.exit(0);
  });
}

if (process.argv[1] && process.argv[1].endsWith('cli-watch.js')) {
  runWatch(process.argv);
}
