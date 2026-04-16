/**
 * Format a watch event into a human-readable notification string.
 */
export function formatNotification(event) {
  const lines = [`[${event.timestamp}] .env changed — ${event.changes.length} change(s):`,];
  for (const c of event.changes) {
    if (c.type === 'added') {
      lines.push(`  + ${c.key}=${c.value}`);
    } else if (c.type === 'removed') {
      lines.push(`  - ${c.key}`);
    } else if (c.type === 'changed') {
      lines.push(`  ~ ${c.key}: ${c.oldValue} → ${c.value}`);
    }
  }
  return lines.join('\n');
}

/**
 * Print a watch event to stdout.
 */
export function notify(event) {
  console.log(formatNotification(event));
}
