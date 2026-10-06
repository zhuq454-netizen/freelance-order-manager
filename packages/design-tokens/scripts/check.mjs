import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputs = ['web.css', 'uniapp.scss', 'miniprogram.wxss', 'tokens.ts'];

await Promise.all(outputs.map((file) => access(resolve(packageRoot, 'generated', file))));
