import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const modulePath = fileURLToPath(new URL('../src/health.ts', import.meta.url));

describe('health response contract', () => {
  it('provides a schema that accepts the platform health response', async () => {
    expect(existsSync(modulePath), 'health contract module must exist').toBe(true);
    if (!existsSync(modulePath)) return;

    const { healthResponseSchema } = await import('../src/health.js');
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      timestamp: '2026-09-26T00:00:00.000Z',
    });

    expect(result.success).toBe(true);
  });
});
