import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const tokensPath = fileURLToPath(new URL('../src/tokens.json', import.meta.url));
const webCssPath = fileURLToPath(new URL('../generated/web.css', import.meta.url));

describe('OrderlyDesk design tokens', () => {
  it('defines the approved light-theme colors', () => {
    expect(existsSync(tokensPath), 'tokens.json must exist').toBe(true);
    if (!existsSync(tokensPath)) return;

    const tokens = JSON.parse(readFileSync(tokensPath, 'utf8')) as {
      color: Record<string, unknown>;
    };
    expect(tokens.color).toMatchObject({
      brand: { primary: '#4F6BFF' },
      tech: { blue: '#3B82F6', cyan: '#22D3EE' },
      page: '#F7F9FC',
      surface: '#FFFFFF',
    });
    expect(tokens).not.toHaveProperty('dark');
  });

  it('generates web CSS variables from the token source', () => {
    expect(existsSync(webCssPath), 'generated web.css must exist').toBe(true);
    if (!existsSync(webCssPath)) return;

    const css = readFileSync(webCssPath, 'utf8');
    expect(css.toUpperCase()).toContain('--COLOR-BRAND-PRIMARY: #4F6BFF;');
    expect(css.toUpperCase()).toContain('--COLOR-PAGE: #F7F9FC;');
    expect(css).not.toContain('prefers-color-scheme: dark');
  });
});
