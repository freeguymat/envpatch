import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { doctor, formatDoctor } from './doctor.js';

describe('doctor', () => {
  it('returns healthy with no issues for clean env', () => {
    const result = doctor({ NODE_ENV: 'production', PORT: '3000' });
    assert.equal(result.healthy, true);
    assert.equal(result.issues.length, 0);
  });

  it('reports missing required keys as errors', () => {
    const result = doctor({}, { requiredKeys: ['DATABASE_URL'] });
    assert.equal(result.healthy, false);
    assert.ok(result.issues.some(i => i.level === 'error' && i.message.includes('DATABASE_URL')));
  });

  it('reports empty required keys as warnings', () => {
    const result = doctor({ DATABASE_URL: '' }, { requiredKeys: ['DATABASE_URL'] });
    assert.equal(result.healthy, true);
    assert.ok(result.issues.some(i => i.level === 'warn' && i.message.includes('DATABASE_URL')));
  });

  it('warns on unusual NODE_ENV', () => {
    const result = doctor({ NODE_ENV: 'banana' });
    assert.ok(result.issues.some(i => i.level === 'warn' && i.message.includes('NODE_ENV')));
  });

  it('does not warn on valid NODE_ENV values', () => {
    for (const val of ['development', 'production', 'test', 'staging']) {
      const result = doctor({ NODE_ENV: val });
      assert.ok(!result.issues.some(i => i.message.includes('NODE_ENV')), `should accept ${val}`);
    }
  });

  it('warns on values with whitespace', () => {
    const result = doctor({ SECRET: '  abc  ' });
    assert.ok(result.issues.some(i => i.level === 'warn' && i.message.includes('SECRET')));
  });

  it('reports info for possible duplicate keys', () => {
    const result = doctor({ DB_URL: 'x', DB_URL_: 'y' });
    assert.ok(result.issues.some(i => i.level === 'info' && i.message.includes('DB_URL')));
  });

  it('skips NODE_ENV check when disabled', () => {
    const result = doctor({ NODE_ENV: 'banana' }, { checkNodeEnv: false });
    assert.ok(!result.issues.some(i => i.message.includes('NODE_ENV')));
  });
});

describe('formatDoctor', () => {
  it('returns success message when no issues', () => {
    const out = formatDoctor({ issues: [], healthy: true });
    assert.ok(out.includes('No issues found'));
  });

  it('includes issue messages in output', () => {
    const out = formatDoctor({
      issues: [{ level: 'error', message: 'Missing required key: FOO' }],
      healthy: false
    });
    assert.ok(out.includes('FOO'));
    assert.ok(out.includes('Unhealthy'));
  });
});
