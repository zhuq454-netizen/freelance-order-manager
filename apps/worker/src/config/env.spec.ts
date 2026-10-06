import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const modulePath = fileURLToPath(new URL('./env.ts', import.meta.url));

describe('worker environment', () => {
  it('provides safe local defaults for the worker process', async () => {
    expect(existsSync(modulePath), 'worker env module must exist').toBe(true);
    if (!existsSync(modulePath)) return;

    const { validateWorkerEnvironment } = await import('./env.js');
    expect(validateWorkerEnvironment({})).toMatchObject({
      NODE_ENV: 'development',
      REDIS_URL: 'redis://localhost:6379',
    });
  });
});
