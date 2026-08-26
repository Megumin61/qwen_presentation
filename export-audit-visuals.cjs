const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const source = path.resolve(__dirname, '..', '转正述职文档审核视觉建议');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 720 }, deviceScaleFactor: 1.25 });
  for (const name of ['01_生态业务全景', '02_个人工作组合', '03_个人价值闭环']) {
    const input = `file:///${path.join(source, `${name}.svg`).replace(/\\/g, '/')}`;
    const output = path.join(source, `${name}.png`);
    await page.goto(input, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    await page.screenshot({ path: output, fullPage: true });
    console.log(output);
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
