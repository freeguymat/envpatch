import fs from 'fs';
import { parse } from './parser.js';
import { diff } from './diff.js';

/**
 * Watch a .env file for changes and emit diffs on each change.
 * @param {string} filePath
 * @param {(diff: object) => void} onChange
 * @returns {{ stop: () => void }}
 */
export function watchEnv(filePath, onChange) {
  let previous = {};

  try {
    previous = parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    // file may not exist yet
  }

  const watcher = fs.watch(filePath, { persistent: false }, (event) => {
    if (event !== 'change' && event !== 'rename') return;
    let current = {};
    try {
      current = parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return;
    }
    const changes = diff(previous, current);
    if (changes.length > 0) {
      onChange({ changes, previous, current, timestamp: new Date().toISOString() });
    }
    previous = current;
  });

  return {
    stop() {
      watcher.close();
    }
  };
}
