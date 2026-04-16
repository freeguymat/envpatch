import { describe, it, expect } from 'vitest';
import { formatNotification } from './notify.js';

const ts = '2024-01-01T00:00:00.000Z';

describe('formatNotification', () => {
  it('formats added key', () => {
    const out = formatNotification({
      timestamp: ts,
      changes: [{ type: 'added', key: 'FOO', value: 'bar' }],
      previous: {},
      current: { FOO: 'bar' }
    });
    expect(out).toContain('+ FOO=bar');
    expect(out).toContain('1 change');
  });

  it('formats removed key', () => {
    const out = formatNotification({
      timestamp: ts,
      changes: [{ type: 'removed', key: 'FOO', value: undefined }],
      previous: { FOO: 'bar' },
      current: {}
    });
    expect(out).toContain('- FOO');
  });

  it('formats changed key', () => {
    const out = formatNotification({
      timestamp: ts,
      changes: [{ type: 'changed', key: 'PORT', oldValue: '3000', value: '4000' }],
      previous: { PORT: '3000' },
      current: { PORT: '4000' }
    });
    expect(out).toContain('~ PORT: 3000 → 4000');
  });

  it('handles multiple changes', () => {
    const out = formatNotification({
      timestamp: ts,
      changes: [
        { type: 'added', key: 'A', value: '1' },
        { type: 'removed', key: 'B', value: undefined }
      ],
      previous: { B: '2' },
      current: { A: '1' }
    });
    expect(out).toContain('2 change');
  });
});
