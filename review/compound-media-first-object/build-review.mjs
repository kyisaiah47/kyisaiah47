import fs from 'node:fs';
import path from 'node:path';
import { cardHtml, prepare } from '/Users/admin/Projects/compound-ops/social/tools/landing-card.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const spec = JSON.parse(fs.readFileSync(path.join(here, 'spec.json'), 'utf8'));
const cache = path.join(here, '.cache');
fs.mkdirSync(cache, { recursive: true });
const object = prepare(spec, cache);

fs.writeFileSync(path.join(here, 'canonical-banner.html'), cardHtml(spec, 'BX', object));
