#!/usr/bin/env node
// render.mjs — the ONLY way banner.png and the strip PNGs are produced.
//
// ⛔ Never hand-edit a PNG in here, and never let README.md's alt text say something the
// image does not paint. Change banner.html / strip.html, re-run this, commit both.
//
// It fails closed on the failure that actually happened: banner.html and strip.html used to
// hardcode file:///Users/admin/Projects/kynth/brand-studio/plates/, which was deleted on
// 2026-07-22 when the plate set moved to kynth-ops/social/tools/bg/slate/. A missing
// background-image throws nothing, so the generators would have quietly rendered black
// bands. This script stats every plate before it opens a browser and exits 1 if one is gone.
//
//   node assets/render.mjs                    # all four PNGs at 2x
//   node assets/render.mjs banner             # just the banner
//   PLATES=/some/dir node assets/render.mjs   # override the plate directory
//
// It launches its OWN headless Chrome and does not touch the portals daemon on :9222 —
// that daemon is shared, is reaped when no run holds its lease, and being down is the normal
// state. A generator that only works when somebody else's browser happens to be up is a
// generator that does not work.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// puppeteer-core lives in kynth-ops (pnpm, so the path carries a version — resolve it, never
// hardcode it). ⛔ Do NOT swap this for playwright: playwright >= 1.53 sends
// Browser.setDownloadBehavior on connectOverCDP, which a real Chrome rejects and the socket
// drops. Same reason kynth-ops/portals/lib/attach.mjs is puppeteer-core.
const OPS = process.env.KYNTH_OPS || '/Users/admin/Projects/kynth-ops';
const puppeteer = createRequire(import.meta.url)(
  createRequire(`${OPS}/package.json`).resolve('puppeteer-core'),
);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLATES = process.env.PLATES || '/Users/admin/Projects/kynth-ops/social/tools/bg/slate';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCALE = 2;

const TARGETS = [
  { out: 'banner.png',            page: 'banner.html', q: { plate: 'AI_Bg_044.png' }, w: 1600, h: 460 },
  { out: 'strip-install.png',     page: 'strip.html',  q: { key: 'install' },         w: 1600, h: 104 },
  { out: 'strip-studio.png',      page: 'strip.html',  q: { key: 'studio' },          w: 1600, h: 104 },
  { out: 'strip-background.png',  page: 'strip.html',  q: { key: 'background' },      w: 1600, h: 104 },
];

// ---- gate: every plate the generators reference must exist BEFORE we render ----------
const referenced = new Set();
for (const f of ['banner.html', 'strip.html']) {
  const src = fs.readFileSync(path.join(HERE, f), 'utf8');
  for (const m of src.matchAll(/'([A-Za-z0-9_]+\.png)'/g)) referenced.add(m[1]);
}
const missing = [...referenced].filter((p) => !fs.existsSync(path.join(PLATES, p)));
if (missing.length) {
  console.error(`⛔ plate(s) missing from ${PLATES}: ${missing.join(', ')}`);
  console.error('   Point PLATES= at the real directory, or pick a plate that exists.');
  process.exit(1);
}
console.log(`plates ok (${referenced.size}) in ${PLATES}`);

// ---- render --------------------------------------------------------------------------
const only = process.argv.slice(2);
const rows = only.length ? TARGETS.filter((t) => only.some((o) => t.out.includes(o))) : TARGETS;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--hide-scrollbars', '--allow-file-access-from-files', '--force-color-profile=srgb'],
});
try {
  for (const t of rows) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.w, height: t.h, deviceScaleFactor: SCALE });
    const url = new URL(pathToFileURL(path.join(HERE, t.page)));
    url.searchParams.set('plates', pathToFileURL(PLATES).href);
    for (const [k, v] of Object.entries(t.q)) url.searchParams.set(k, v);
    await page.goto(url.href, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const title = await page.title();
    if (/MISSING-PLATES|UNKNOWN-KEY/.test(title)) throw new Error(`${t.out}: generator reported ${title}`);
    await new Promise((r) => setTimeout(r, 400));
    const el = await page.$('.banner, .strip');
    await el.screenshot({ path: path.join(HERE, t.out) });
    await page.close();
    console.log(`wrote ${t.out} (${t.w * SCALE}x${t.h * SCALE})`);
  }
} finally {
  await browser.close();
}
