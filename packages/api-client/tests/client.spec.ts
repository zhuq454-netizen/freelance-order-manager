import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const clientModulePath = fileURLToPath(new URL('../src/client.ts', import.meta.url));

describe('generated API client', () => {
  it('creates an OpenAPI client with the configured base URL', async () => {
    expect(existsSync(clientModulePath), 'API client module must exist').toBe(true);
    if (!existsSync(clientModulePath)) return;

    const { createApiClient } = await import('../src/client.js');
    const client = createApiClient('http://localhost:3000');

    expect(client).toHaveProperty('GET');
    expect(client).toHaveProperty('POST');
  });
});
