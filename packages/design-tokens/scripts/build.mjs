import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(packageRoot, 'src/tokens.json');
const outputDir = resolve(packageRoot, 'generated');

const tokens = JSON.parse(await readFile(sourcePath, 'utf8'));

function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function flatten(value, prefix = []) {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = [...prefix, toKebabCase(key)];
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      return flatten(child, path);
    }
    return [[path.join('-'), String(child)]];
  });
}

const entries = flatten(tokens);
const cssLines = entries.map(([name, value]) => `  --${name}: ${value};`);
const scssLines = entries.map(([name, value]) => `$${name}: ${value};`);

const webCss = `:root {\n${cssLines.join('\n')}\n}\n`;
const uniappScss = `${scssLines.join('\n')}\n`;
const miniprogramWxss = `page {\n${cssLines.join('\n')}\n}\n`;
const typescript = `export const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n\nexport type DesignTokens = typeof tokens;\n`;

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDir, 'web.css'), webCss),
  writeFile(resolve(outputDir, 'uniapp.scss'), uniappScss),
  writeFile(resolve(outputDir, 'miniprogram.wxss'), miniprogramWxss),
  writeFile(resolve(outputDir, 'tokens.ts'), typescript),
]);
