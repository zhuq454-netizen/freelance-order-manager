import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const modulePath = fileURLToPath(new URL('../src/app-metadata.ts', import.meta.url));

describe('application metadata', () => {
  it('defines the stable application name and display timezone', async () => {
    expect(existsSync(modulePath), 'app metadata module must exist').toBe(true);
    if (!existsSync(modulePath)) return;

    const metadata = await import('../src/app-metadata.js');
    expect(metadata.APP_NAME).toBe('OrderlyDesk');
    expect(metadata.DEFAULT_TIME_ZONE).toBe('Asia/Shanghai');
  });
});
