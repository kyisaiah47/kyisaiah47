import fs from 'node:fs';
import path from 'node:path';
import { cardHtml, prepare } from '/Users/admin/CompoundLabs/compound-ops/social/tools/landing-card.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const spec = JSON.parse(fs.readFileSync(path.join(here, 'spec.json'), 'utf8'));
const cache = path.join(here, '.cache');
fs.mkdirSync(cache, { recursive: true });
const object = prepare(spec, cache);
const html = cardHtml(spec, 'B', object)
  + '<script>document.fonts.ready.then(() => window.__fitDiagonal && window.__fitDiagonal())</script>';
fs.writeFileSync(path.join(here, 'landscape.html'), html);
