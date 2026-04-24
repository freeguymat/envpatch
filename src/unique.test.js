import { describe, it, expect } from 'vitest';
import { unique, formatUnique } from './unique.js';

const envA = { FOO: '1', BAR: '2', SHARED: 'x' };
const envB = { BAZ: '3', QUX: '4', SHARED: 'y' };

describe('unique', () => {
  it('finds keys only in A', () => {
    const { onlyInA } = unique(envA, envB);
    expect(onlyInA).toEqual(expect.arrayContaining(['FOO', 'BAR']));
    expect(onlyInA).not.toContain('SHARED');
  });

  it('finds keys only in B', () => {
    const { onlyInB } = unique(envA, envB);
    expect(onlyInB).toEqual(expect.arrayContaining(['BAZ', 'QUX']));
    expect(onlyInB).not.toContain('SHARED');
  });

  it('returns empty arrays when envs share all keys', () => {
    const same = { A: '1', B: '2' };
    const { onlyInA, onlyInB } = unique(same, { ...same });
    expect(onlyInA).toHaveLength(0);
    expect(onlyInB).toHaveLength(0);
  });

  it('handles empty envs', () => {
    const { onlyInA, onlyInB } = unique({}, { X: '1' });
    expect(onlyInA).toHaveLength(0);
    expect(onlyInB).toContain('X');
  });

  it('treats value differences as shared keys (not unique)', () => {
    const { onlyInA, onlyInB } = unique({ K: 'v1' }, { K: 'v2' });
    expect(onlyInA).toHaveLength(0);
    expect(onlyInB).toHaveLength(0);
  });
});

describe('formatUnique', () => {
  it('formats keys unique to each side', () => {
    const result = unique(envA, envB);
    const out = formatUnique(result, '.env.dev', '.env.prod');
    expect(out).toContain('Only in .env.dev');
    expect(out).toContain('Only in .env.prod');
    expect(out).toContain('+ FOO');
    expect(out).toContain('- BAZ');
  });

  it('shows no-unique message when sets are identical', () => {
    const out = formatUnique({ onlyInA: [], onlyInB: [] });
    expect(out).toMatch(/no unique keys/i);
  });

  it('uses default labels A and B', () => {
    const result = unique({ X: '1' }, {});
    const out = formatUnique(result);
    expect(out).toContain('Only in A');
  });
});
