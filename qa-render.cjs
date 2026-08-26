const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

(async () => {
  const root = __dirname;
  const width = Number(process.argv[2] || 1440);
  const height = Number(process.argv[3] || 900);
  const output = path.join(root, width === 1440 && height === 900 ? 'qa' : `qa-${width}x${height}`);
  fs.mkdirSync(output, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  const slides = await page.locator('.slide').count();
  const report = [];
  for (let index = 0; index < slides; index += 1) {
    const slide = page.locator('.slide').nth(index);
    await slide.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const metrics = await slide.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const content = node.querySelector('.slide-inner');
      const cb = content?.getBoundingClientRect();
      return {
        id: node.id,
        title: node.querySelector('h1,h2')?.textContent?.replace(/\s+/g, ' ').trim(),
        slideHeight: Math.round(box.height),
        contentHeight: cb ? Math.round(cb.height) : null,
        scrollHeight: node.scrollHeight,
        overflowX: node.scrollWidth > node.clientWidth + 2,
        overflowY: node.scrollHeight > node.clientHeight + 2,
      };
    });
    report.push(metrics);
    await page.screenshot({ path: path.join(output, `slide-${String(index + 1).padStart(2, '0')}.png`) });
  }

  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  process.stdout.write(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
