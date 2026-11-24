import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, 'dist');
// Only the current site is deployable. Historical work never enters this directory.
await readFile(join(root, 'index.html'));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'assets', 'css']) {
  await cp(join(root, entry), join(output, entry), { recursive: true, filter: source => source !== join(root, 'assets/images/wildfolk') });
}
console.log('Portfolio listo en dist/');
