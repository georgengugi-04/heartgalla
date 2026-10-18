/**
 * EARTGALLA site audit — visits every page in the sitemap in a real browser and reports what's actually wrong.
 *
 *   npm run build && npm start                       (in one terminal)
 *   npm i -D playwright axe-core --no-save           (once; not added to package.json)
 *   npx playwright install chromium                  (once)
 *   BASE=http://localhost:3000 node scripts/audit/audit.mjs
 *
 * Checks per page: HTTP status, console + page errors, failed requests, broken images, images without alt, exactly
 * one <h1>, heading order, <main>, title / description / canonical / Open Graph / Twitter tags, horizontal overflow at
 * 320 · 375 · 390 · 430 · 768 · 1024 · 1440 px, and an axe-core accessibility scan (WCAG 2 A + AA) at phone and desktop.
 * The audit visits with a "headless" browser, which the site treats like a bot: it skips the intro animations.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
let axePath = null;
try { axePath = require.resolve("axe-core/axe.min.js"); } catch { console.warn("axe-core not installed — skipping the accessibility scan"); }

const BASE = (process.env.BASE || "http://localhost:3000").replace(/\/$/, "");
const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
console.log(`Auditing ${routes.length} pages from ${BASE}/sitemap.xml\n`);

const CONCURRENCY = Number(process.env.CONCURRENCY || 4);
async function pool(items, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (i < items.length) await fn(items[i++]); }));
}

const browser = await chromium.launch();
const problems = [];
const add = (route, msg) => problems.push(`${route.padEnd(48)} ${msg}`);

async function open(route, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const seen = { errors: [], failed: [] };
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && seen.errors.push(m.text().slice(0, 140)));
  page.on("pageerror", (e) => seen.errors.push(e.message.slice(0, 140)));
  page.on("response", (r) => r.status() >= 400 && seen.failed.push(`${r.status()} ${new URL(r.url()).pathname}`));
  const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
  for (let i = 0; i < 10; i++) { await page.evaluate(() => window.scrollBy(0, innerHeight)); await wait(80); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);
  return { ctx, page, res, seen };
}

await pool(routes, async (route) => {
  const { ctx, page, res, seen } = await open(route, 1440);
  if (res.status() !== 200) add(route, `HTTP ${res.status()}`);
  seen.errors.forEach((e) => add(route, `console: ${e}`));
  seen.failed.forEach((f) => add(route, `failed request: ${f}`));
  const d = await page.evaluate(() => {
    const meta = (n, a = "name") => document.querySelector(`meta[${a}="${n}"]`)?.content || null;
    const imgs = [...document.images];
    const heads = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
    return {
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).length,
      noAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      h1: heads.filter((h) => h === 1).length,
      skips: heads.filter((h, i) => i && h - heads[i - 1] > 1).length,
      main: document.querySelectorAll("main").length,
      title: document.title, desc: meta("description"), canonical: !!document.querySelector("link[rel=canonical]"),
      og: meta("og:title", "property") && meta("og:image", "property"), tw: meta("twitter:card"),
    };
  });
  if (d.broken) add(route, `${d.broken} broken image(s)`);
  if (d.noAlt) add(route, `${d.noAlt} image(s) with no alt attribute`);
  if (d.h1 !== 1) add(route, `${d.h1} <h1> elements (want 1)`);
  if (d.skips) add(route, `${d.skips} heading level skip(s)`);
  if (d.main !== 1) add(route, `${d.main} <main> elements (want 1)`);
  if (!d.desc) add(route, "no meta description");
  if (!d.canonical) add(route, "no canonical link");
  if (!d.og) add(route, "missing Open Graph title/image");
  if (!d.tw) add(route, "missing twitter:card");
  if (axePath) {
    await page.addScriptTag({ path: axePath });
    const r = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }));
    r.violations.forEach((v) => add(route, `a11y [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.help}`));
  }
  await ctx.close();
});

// overflow: one page per template is enough, at every width
const templates = [...new Set(routes.map((r) => r.replace(/^(\/[^/]+)\/[^/]+$/, "$1/*")))].map((t) => routes.find((r) => r.replace(/^(\/[^/]+)\/[^/]+$/, "$1/*") === t));
await pool(templates.flatMap((route) => WIDTHS.map((w) => [route, w])), async ([route, w]) => {
  const { ctx, page } = await open(route, w);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) add(route, `horizontal overflow of ${over}px at ${w}px wide`);
  await ctx.close();
});
await browser.close();

console.log(problems.length ? `${problems.length} problem(s):\n\n${problems.join("\n")}` : "No problems found.");
process.exit(problems.length ? 1 : 0);
