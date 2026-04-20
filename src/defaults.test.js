import { describe, it, expect } from 'vitest';
import { applyDefaults, formatDefaults } from './defaults.js';

describe('applyDefaults', () => {
  it('fills missing keys', () => {
    const env = { A: '1' };
    const defaults = { A: '99', B: '2', C: '3' };
    const { result, filled } = applyDefaults(env, defaults);
    expect(result).toEqual({ A: '1', B: '2', C: '3' });
    expect(filled).toEqual(['B', 'C']);
  });

  it('fills empty-string keys', () => {
    const env = { A: '' };
    const defaults = { A: 'hello' };
    const { result, filled } = applyDefaults(env, defaults);
    expect(result.A).toBe('hello');
    expect(filled).toContain('A');
  });

  it('does not mutate original env', () => {
    const env = { A: '1' };
    const defaults = { B: '2' };
    applyDefaults(env, defaults);
    expect(env).toEqual({ A: '1' });
  });

  it('returns empty filled when nothing to add', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    const { result, filled } = applyDefaults(env, defaults);
    expect(filled).toHaveLength(0);
    expect(result).toEqual({ A: '1', B: '2' });
  });

  it('handles empty env', () => {
    const { result, filled } = applyDefaults({}, { X: '10', Y: '20' });
    expect(result).toEqual({ X: '10', Y: '20' });
    expect(filled).toEqual(['X', 'Y']);
  });
});

describe('formatDefaults', () => {
  it('shows message when nothing filled', () => {
    expect(formatDefaults([])).toMatch(/No defaults applied/);
  });

  it('lists filled keys', () => {
    const out = formatDefaults(['FOO', 'BAR']);
    expect(out).toMatch(/2 default/);
    expect(out).toMatch(/\+ FOO/);
    expect(out).toMatch(/\+ BAR/);
  });
});
