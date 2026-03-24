import { chromium } from "playwright";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const indexUrl = pathToFileURL(path.join(root, "dist", "index.html")).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(indexUrl, { waitUntil: "load" });

await page.locator("#planos").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const vp = page.locator("[data-carousel-viewport]");
const next = page.locator("[data-carousel-next]");
const prev = page.locator("[data-carousel-prev]");

const scroll0 = await vp.evaluate((el) => el.scrollLeft);
await next.click({ force: true });
await page.waitForTimeout(400);
const scroll1 = await vp.evaluate((el) => el.scrollLeft);

await next.click({ force: true });
await page.waitForTimeout(400);
const scroll2 = await vp.evaluate((el) => el.scrollLeft);

await prev.click({ force: true });
await page.waitForTimeout(400);
const scroll3 = await vp.evaluate((el) => el.scrollLeft);

console.log("scrollLeft:", { scroll0, scroll1, scroll2, scroll3 });
console.log("pageerrors:", errors);

const ok = scroll1 > scroll0 && scroll2 > scroll1 && scroll3 < scroll2;
if (!ok) {
  console.error("FAIL: carousel scroll did not change as expected");
  await browser.close();
  process.exit(1);
}
console.log("PASS");
await browser.close();
process.exit(0);
