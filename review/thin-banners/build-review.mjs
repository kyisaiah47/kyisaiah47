import fs from 'node:fs';
import path from 'node:path';
import { cardHtml, prepare } from '/Users/admin/CompoundLabs/compound-ops/social/tools/landing-card.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const specs = JSON.parse(fs.readFileSync(path.join(here, 'specs.json'), 'utf8'));
const cache = path.join(here, '.cache');
fs.mkdirSync(cache, { recursive: true });

for (const spec of specs) {
  const object = prepare(spec, cache);
  fs.writeFileSync(path.join(here, `${spec.id}.html`), cardHtml(spec, 'GRS', object));
}
