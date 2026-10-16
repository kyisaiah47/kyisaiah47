// Renders the profile README graphics (Layout A, review/readme-light-2026-10-16, approved) and
// writes README.md from README.template.md, products.json and the resume content source.
//   node assets/readme-2026-10-16/build.mjs            graphics + README
//   node assets/readme-2026-10-16/build.mjs --readme   README only
// Graphics CSS is the review page's CSS. The one change on cards: the supporting sentence and the
// domain pill are larger so they read at ~420px per card, and the pill sits on its own row under
// the lockup because it no longer fits beside it at that size.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from '/Users/admin/CompoundLabs/compound-ops/node_modules/playwright/index.mjs';

const require = createRequire(import.meta.url);
const lockup = require('/Users/admin/CompoundLabs/compound-ops/lib/compound-lockup.cjs');
const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, '../..');
const REL = 'assets/readme-2026-10-16';
const RESUME = '/Users/admin/CompoundLabs/resume/build/content.html';
const products = JSON.parse(fs.readFileSync(path.join(DIR, 'products.json'), 'utf8'));
const LAB = lockup.html();
const LAB_NAME = 'Compound Labs';
const HERO = {
  h: `Founder of ${LAB_NAME}, an independent product R&amp;D lab.`,
  s: 'Staff / Principal Software Engineer · Tech Lead · Builder.',
  pill: 'thecompound.tech',
  url: 'https://thecompound.tech',
};
const CARD_W = 700, HERO_W = 880, DSF = 2; // exports: card 1400x600, hero 1760x503
const README_CARD_W = 420; // the width a card shows at in the README's two-column grid

const CSS = `
@font-face{font-family:Inter;src:url(inter-latin.woff2) format('woff2');font-weight:100 900;font-display:block}
:root{--ground:#fbfbfc;--ink:#15171a;--ink2:#4d525b;--ink3:#6b7079;--rule:#e3e5e9;--blue:#2f6bff}
*{box-sizing:border-box}
body{margin:0;background:transparent}
.gfx{container-type:inline-size;width:100%;position:relative;overflow:hidden;border-radius:6px;display:block}
.gfx .c{position:absolute;inset:0;font-family:Inter,system-ui,sans-serif;color:var(--ink);background:var(--ground)}
.gfx .dots{position:absolute;inset:0;background-image:radial-gradient(circle,#d3d6dc .09cqw,transparent .11cqw);background-size:1.15cqw 1.15cqw}
.gfx .rail{position:absolute;top:0;bottom:0;width:1px;background:var(--rule)}
.gfx .plus{position:absolute;width:.9cqw;height:.9cqw;transform:translate(-50%,-50%)}
.gfx .plus:before,.gfx .plus:after{content:"";position:absolute;background:#a9adb5}
.gfx .plus:before{left:50%;top:0;width:1px;height:100%}.gfx .plus:after{top:50%;left:0;height:1px;width:100%}
.gfx .obj{position:absolute;object-fit:contain}
.gfx .h{font-weight:500;letter-spacing:-.035em;line-height:1.06;margin:0}
.gfx .s{font-weight:400;letter-spacing:-.01em;line-height:1.3;color:var(--ink2);margin:0}
.gfx .lock{position:absolute;display:flex;align-items:center;gap:.9cqw;font-weight:600;letter-spacing:-.02em;white-space:nowrap}
.gfx .pill{display:inline-flex;align-items:center;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:400;background:#fff;box-shadow:inset 0 0 0 .08cqw var(--rule);border-radius:999px;color:var(--ink3);letter-spacing:0}
.gfx .nm{color:var(--blue)}
.gfx .pm{display:inline-block;height:.8em;width:auto;vertical-align:-.04em;margin-right:.22em}
.hero{aspect-ratio:7/2}
.hero .dots{right:auto;width:36cqw;-webkit-mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 15%,transparent 80%);mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 15%,transparent 80%)}
.hero .rail{left:36cqw}.hero .plus.a{left:36cqw;top:2.6cqw}.hero .plus.b{left:36cqw;top:auto;bottom:2.6cqw;transform:translate(-50%,50%)}
.hero .obj{left:2cqw;top:2cqw;width:32cqw;height:24.6cqw}
.hero .txt{position:absolute;left:40cqw;right:4cqw;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.hero .h{font-size:3.7cqw}
.hero .s{font-size:1.8cqw;margin-top:1.6cqw}
.hero .lock{left:40cqw;bottom:2.4cqw;font-size:1.5cqw}
.hero .lock .pill{font-size:.95cqw;height:1.9cqw;padding:0 .9cqw;margin-left:.6cqw}
.card{aspect-ratio:7/3}
.card .dots{right:auto;width:40cqw;-webkit-mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 15%,transparent 80%);mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 15%,transparent 80%)}
.card .rail{left:40cqw}.card .plus.a{left:40cqw;top:3cqw}.card .plus.b{left:40cqw;top:auto;bottom:3cqw;transform:translate(-50%,50%)}
.card .obj{left:3cqw;top:4cqw;width:34cqw;height:34.8cqw}
.card .txt{position:absolute;left:45cqw;right:5cqw;top:2cqw;bottom:var(--lockh,0);display:flex;flex-direction:column;justify-content:center}
.card .h{font-size:4.6cqw}
.card .s{font-size:3.1cqw;margin-top:2cqw}
.card .lock{left:45cqw;bottom:2.6cqw;font-size:1.9cqw;flex-direction:column;align-items:flex-start;gap:.9cqw}
.card .lock .pill{font-size:2.4cqw;height:4.2cqw;padding:0 1.9cqw;margin-left:0}
`;

const grid = '<div class="dots"></div><div class="rail"></div><div class="plus a"></div><div class="plus b"></div>';
const host = (u) => new URL(u).host;
const heroHtml = () => `<div class="gfx hero" id="g"><div class="c">${grid}<img class="obj" src="objects/hero.png" alt=""><div class="txt"><p class="h">${HERO.h}</p><p class="s">${HERO.s}</p></div><div class="lock">${LAB}<span class="pill">${HERO.pill}</span></div></div></div>`;
const cardHtml = (p) => `<div class="gfx card" id="g"><div class="c">${grid}<img class="obj" src="objects/${p.slug}.png" alt=""><div class="txt"><p class="h"><img class="pm" src="marks/${p.icon}.svg" alt=""><span class="nm">${p.name}</span> ${p.h}</p><p class="s">${p.s}</p></div><div class="lock">${LAB}<span class="pill">${host(p.url)}</span></div></div></div>`;
const page = (body, w) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div style="width:${w}px">${body}</div></body></html>`;

async function renderAll(browser) {
  const ctx = await browser.newContext({ deviceScaleFactor: DSF, viewport: { width: 1000, height: 700 } });
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const jobs = [{ name: 'hero', html: heroHtml(), w: HERO_W, card: false },
    ...products.map((p) => ({ name: `card-${p.slug}`, html: cardHtml(p), w: CARD_W, card: true }))]
    .filter((j) => !only.length || only.some((o) => j.name.includes(o)));
  const failures = [];
  for (const j of jobs) {
    const tmp = path.join(DIR, `.render-${j.name}.html`);
    fs.writeFileSync(tmp, page(j.html, j.w));
    const pg = await ctx.newPage();
    await pg.goto('file://' + tmp, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    if (j.card) {
      // Centre the text in the space above the lockup and pill.
      await pg.evaluate(() => {
        const g = document.getElementById('g'), lock = g.querySelector('.lock');
        const lockTop = g.getBoundingClientRect().bottom - lock.getBoundingClientRect().top;
        g.querySelector('.txt').style.setProperty('--lockh', (lockTop + g.getBoundingClientRect().width * 0.01) + 'px');
      });
    }
    const probe = await pg.evaluate(lockup.probe, lockup.probeArgs());
    const checks = await pg.evaluate(({ card, readmeW }) => {
      const errs = [];
      const g = document.getElementById('g'), G = g.getBoundingClientRect();
      for (const img of g.querySelectorAll('img')) if (!img.complete || !img.naturalWidth) errs.push('image failed: ' + img.src.slice(0, 80));
      const r = (s) => g.querySelector(s).getBoundingClientRect();
      const h = r('.h'), s = r('.s'), lock = r('.lock'), pill = r('.pill');
      const margin = G.width * 0.02;
      if (h.top < G.top + margin || s.bottom > G.bottom - margin) errs.push('text runs off the graphic');
      if (s.bottom > lock.top - G.width * 0.01) errs.push(`text collides with lockup (${(s.bottom - lock.top).toFixed(1)}px)`);
      if (lock.right > G.right - margin || pill.right > G.right - margin) errs.push('lockup/pill overflows right edge');
      const p = g.querySelector('.pill'); if (p.scrollWidth > p.clientWidth + 1) errs.push('pill text overflows');
      for (const el of g.querySelectorAll('.h,.s')) if (el.scrollWidth > el.clientWidth + 1) errs.push('line overflow in ' + el.className);
      const k = readmeW / G.width;
      const sz = { sentence: parseFloat(getComputedStyle(g.querySelector('.s')).fontSize) * k, pill: parseFloat(getComputedStyle(p).fontSize) * k };
      if (card && (sz.sentence < 13 || sz.pill < 10)) errs.push(`at ${readmeW}px: sentence ${sz.sentence.toFixed(1)}px, pill ${sz.pill.toFixed(1)}px`);
      return { errs, sz };
    }, { card: j.card, readmeW: j.card ? README_CARD_W : 880 });
    const errs = [...probe.map((e) => 'lockup probe: ' + e), ...checks.errs];
    if (errs.length) failures.push(`${j.name}: ${errs.join('; ')}`);
    else {
      await pg.locator('#g').screenshot({ path: path.join(DIR, `${j.name}.png`), omitBackground: true });
      console.log(`${j.name}.png  lockup probe ok  sentence@${j.card ? README_CARD_W : 880}=${checks.sz.sentence.toFixed(1)}px pill=${checks.sz.pill.toFixed(1)}px`);
    }
    await pg.close();
    fs.rmSync(tmp);
  }
  if (failures.length) throw new Error('graphics failed:\n' + failures.join('\n'));
}

async function resume(browser) {
  const pg = await browser.newPage();
  await pg.setContent(`<div id="src">${fs.readFileSync(RESUME, 'utf8')}</div>`);
  const r = await pg.evaluate(() => {
    const t = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
    const blocks = [...document.querySelectorAll('section.block')];
    const block = (l) => blocks.find((b) => t(b.querySelector('.label')) === l);
    const li = (x) => { const s = x.querySelector('strong'); const lead = t(s); return { lead, rest: t(x).slice(lead.length) }; };
    return {
      headline: t(document.querySelector('.headline')),
      // Private values that must never reach the README; read here only to assert their absence.
      privateValues: [...document.querySelectorAll('a[href^="tel:"]')].flatMap((a) => [a.getAttribute('href').slice(4), t(a)]),
      roles: [...block('Work Experience').querySelectorAll('.entry')].map((e) => {
        const role = e.querySelector('.role').cloneNode(true);
        const company = t(role.querySelector('.company')), loc = t(role.querySelector('.loc')).replace(/^·\s*/, '');
        role.querySelectorAll('.company,.loc').forEach((n) => n.remove());
        return { title: t(role).replace(/,\s*$/, ''), company, loc, date: t(e.querySelector('.date')),
          subtitle: t(e.querySelector('.subtitle')), bullets: [...e.querySelectorAll('li')].map(li) };
      }),
      skills: [...block('Technical Skills').querySelectorAll('.skill-row')].map((x) => ({ cat: t(x.querySelector('.skill-cat')), list: t(x.querySelector('.skill-list')) })),
      edu: (() => { const b = block('Education & Awards'), role = b.querySelector('.role');
        return { degree: t(role.firstChild).replace(/,\s*$/, ''), school: t(role.querySelector('.company')), honor: t(role.querySelector('em')),
          date: t(b.querySelector('.date')), awards: [...b.querySelectorAll('li')].map(li) }; })(),
    };
  });
  await pg.close();
  return r;
}

const md = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*/g, '\\*').replace(/_/g, '\\_');
const attr = (s) => s.replace(/&amp;/g, '&').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function writeReadme(r) {
  if (r.headline !== 'Open to: Staff / Principal Software Engineer · Tech Lead · Builder') throw new Error('resume role line changed: ' + r.headline);
  const role = r.headline.replace(/^Open to:\s*/, '');
  const heroAlt = `${HERO.h} ${HERO.s}`;
  const hero = `<a href="${HERO.url}"><img src="./${REL}/hero.png" alt="${attr(heroAlt)}" width="100%"></a>`;
  const card = (p) => `<a href="${p.url}"><img src="./${REL}/card-${p.slug}.png" alt="${attr(`${p.name} ${p.h} ${p.s}`)}" width="49%"></a>`;
  const rows = [];
  for (let i = 0; i < products.length; i += 2) rows.push(`<p>\n${products.slice(i, i + 2).map(card).join('\n')}\n</p>`);
  const experience = r.roles.map((x) => [
    `#### ${md(x.company)} · ${md(x.title)}`, '',
    `${md(x.subtitle)} · ${md(x.loc)} · ${md(x.date)}`, '',
    ...x.bullets.map((b) => `- **${md(b.lead)}**${md(b.rest)}`),
  ].join('\n')).join('\n\n');
  const skills = r.skills.map((s) => `- **${md(s.cat)}:** ${md(s.list)}`).join('\n');
  const e = r.edu;
  const education = [`**${md(e.school)}** · ${md(e.degree)} · *${md(e.honor)}* · ${md(e.date)}`, '',
    ...e.awards.map((a) => `- **${md(a.lead)}**${md(a.rest)}`)].join('\n');
  let out = fs.readFileSync(path.join(DIR, 'README.template.md'), 'utf8')
    .replace('{{HERO}}', hero).replace('{{PRODUCTS}}', rows.join('\n\n'))
    .replace('{{EXPERIENCE}}', experience).replace('{{SKILLS}}', skills).replace('{{EDUCATION}}', education)
    .replaceAll('{{ROLE}}', role);
  if (/\{\{/.test(out)) throw new Error('unfilled placeholder in README template');
  for (const bad of [/senior full/i, /AI product/i, /Leaving for|Left to/, /Isaiah Kim/, /atgent(?!\.dev)/i, /open.source/i]) {
    if (bad.test(out.replace(/(src|href)="[^"]*"/g, ''))) throw new Error('README contains banned text: ' + bad);
  }
  const digits = out.replace(/\D/g, '');
  if (r.privateValues.some((v) => v && (out.includes(v) || (v.replace(/\D/g, '').length >= 7 && digits.includes(v.replace(/\D/g, '')))))) throw new Error('README contains a private contact value');
  fs.writeFileSync(path.join(REPO, 'README.md'), out);
  console.log('README.md written');
}

const browser = await chromium.launch({ args: ['--mute-audio'] });
try {
  if (!process.argv.includes('--readme')) await renderAll(browser);
  writeReadme(await resume(browser));
} finally { await browser.close(); }
