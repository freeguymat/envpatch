import { toTemplate, fillTemplate } from './template.js';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

describe('toTemplate', () => {
  test('blanks all values', () => {
    const out = toTemplate(sampleEnv);
    expect(out).toContain('DB_HOST=');
    expect(out).not.toContain('localhost');
    expect(out).toContain('SECRET_KEY=');
  });

  test('includes schema comments', () => {
    const schema = {
      DB_HOST: { description: 'Database hostname', required: true },
      SECRET_KEY: { description: 'App secret', default: 'changeme' },
    };
    const out = toTemplate(sampleEnv, schema);
    expect(out).toContain('# Database hostname');
    expect(out).toContain('# required: true');
    expect(out).toContain('# default: changeme');
  });

  test('ends with newline', () => {
    const out = toTemplate(sampleEnv);
    expect(out.endsWith('\n')).toBe(true);
  });

  test('empty env produces only newline', () => {
    expect(toTemplate({})).toBe('\n');
  });
});

describe('fillTemplate', () => {
  test('fills values from source', () => {
    const tmpl = toTemplate(sampleEnv);
    const filled = fillTemplate(tmpl, sampleEnv);
    expect(filled).toContain('DB_HOST=localhost');
    expect(filled).toContain('DB_PORT=5432');
  });

  test('leaves missing keys blank', () => {
    const tmpl = toTemplate(sampleEnv);
    const filled = fillTemplate(tmpl, { DB_HOST: 'prod-host' });
    expect(filled).toContain('DB_HOST=prod-host');
    expect(filled).toContain('DB_PORT=');
    expect(filled).not.toContain('DB_PORT=5432');
  });

  test('preserves comment lines', () => {
    const tmpl = toTemplate(sampleEnv, { DB_HOST: { description: 'host' } });
    const filled = fillTemplate(tmpl, sampleEnv);
    expect(filled).toContain('# host');
  });
});
