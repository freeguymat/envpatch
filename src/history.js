import fs from 'fs';
import path from 'path';

const DEFAULT_HISTORY_DIR = '.envpatch-history';

export function getHistoryPath(dir = DEFAULT_HISTORY_DIR) {
  return path.resolve(process.cwd(), dir, 'history.json');
}

export function loadHistory(dir = DEFAULT_HISTORY_DIR) {
  const file = getHistoryPath(dir);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

export function saveHistory(entry, dir = DEFAULT_HISTORY_DIR) {
  const histDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });
  const file = getHistoryPath(dir);
  const history = loadHistory(dir);
  history.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(history, null, 2));
  return history;
}

export function clearHistory(dir = DEFAULT_HISTORY_DIR) {
  const file = getHistoryPath(dir);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

export function formatHistory(history) {
  if (!history.length) return 'No history entries found.';
  return history
    .map((e, i) => {
      const lines = [`[${i + 1}] ${e.timestamp} — ${e.action}`, `  file: ${e.file}`];
      if (e.keys && e.keys.length) lines.push(`  keys: ${e)}`);
      if (e.note) lines.push(`  note: ${e.note}`);
      return lines.join('\n');
    })
    .join('\n\n');
}
