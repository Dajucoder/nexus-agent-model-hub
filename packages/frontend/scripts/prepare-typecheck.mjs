import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(scriptDir, '..');

for (const relativePath of ['.next/types', 'tsconfig.tsbuildinfo']) {
  rmSync(join(projectRoot, relativePath), {
    recursive: true,
    force: true
  });
}
