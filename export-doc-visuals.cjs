const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const root = __dirname;
  const out = path.resolve(root, '..', '转正答辩文档视觉素材');
  fs.mkdirSync(out, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await page.goto(`file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });

  const jobs = [
    { file: '01_个人背景.png', selectors: ['#profile .profile-layout', '#profile .shell'] },
    { file: '02_业务地图.png', selectors: ['#business-map .layered-map', '#business-map .shell'] },
    { file: '05_能力与协作.png', selectors: ['#team-proof .proof-layout', '#team-proof .shell'] },
  ];

  for (const job of jobs) {
    let locator;
    for (const selector of job.selectors) {
      const candidate = page.locator(selector).first();
      if (await candidate.count()) {
        locator = candidate;
        break;
      }
    }
    if (!locator) throw new Error(`Missing selector for ${job.file}`);
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await locator.screenshot({ path: path.join(out, job.file), animations: 'disabled' });
  }

  await browser.close();
})();
