const { createEntry, buildAuditLog, formatAuditLog } = require('./audit');

describe('createEntry', () => {
  test('creates a valid added entry', () => {
    const entry = createEntry('FOO', 'added', { to: 'bar' });
    expect(entry.key).toBe('FOO');
    expect(entry.type).toBe('added');
    expect(entry.to).toBe('bar');
    expect(entry.timestamp).toBeTruthy();
  });

  test('creates a changed entry with from/to', () => {
    const entry = createEntry('DB_URL', 'changed', { from: 'old', to: 'new' });
    expect(entry.from).toBe('old');
    expect(entry.to).toBe('new');
  });

  test('throws on unknown type', () => {
    expect(() => createEntry('X', 'unknown')).toThrow('Unknown audit change type');
  });
});

describe('buildAuditLog', () => {
  const diff = [
    { key: 'NEW_KEY', type: 'added', to: 'hello' },
    { key: 'OLD_KEY', type: 'removed', from: 'bye' },
    { key: 'CHANGED', type: 'changed', from: 'v1', to: 'v2' },
  ];

  test('builds log with correct types', () => {
    const log = buildAuditLog(diff);
    expect(log).toHaveLength(3);
    expect(log[0].type).toBe('added');
    expect(log[1].type).toBe('removed');
    expect(log[2].type).toBe('changed');
  });

  test('redacts values when option set', () => {
    const log = buildAuditLog(diff, { redactSensitive: true });
    expect(log[0].to).toBe('[redacted]');
    expect(log[1].from).toBe('[redacted]');
    expect(log[2].from).toBe('[redacted]');
    expect(log[2].to).toBe('[redacted]');
  });

  test('preserves values when redactSensitive is false', () => {
    const log = buildAuditLog(diff);
    expect(log[2].from).toBe('v1');
    expect(log[2].to).toBe('v2');
  });
});

describe('formatAuditLog', () => {
  test('returns no changes message for empty log', () => {
    expect(formatAuditLog([])).toBe('No changes.');
  });

  test('formats added entry', () => {
    const log = [{ timestamp: '2024-01-01T00:00:00Z', type: 'added', key: 'X', to: '1' }];
    expect(formatAuditLog(log)).toContain('ADDED');
    expect(formatAuditLog(log)).toContain('X=1');
  });

  test('formats removed entry', () => {
    const log = [{ timestamp: '2024-01-01T00:00:00Z', type: 'removed', key: 'Y', from: 'old' }];
    expect(formatAuditLog(log)).toContain('REMOVED');
    expect(formatAuditLog(log)).toContain('was old');
  });

  test('formats changed entry', () => {
    const log = [{ timestamp: '2024-01-01T00:00:00Z', type: 'changed', key: 'Z', from: 'a', to: 'b' }];
    expect(formatAuditLog(log)).toContain('CHANGED');
    expect(formatAuditLog(log)).toContain('a -> b');
  });
});
