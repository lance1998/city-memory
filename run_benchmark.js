const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, 'benchmark.html')}`);
  await page.waitForTimeout(1000);
  const text = await page.evaluate(() => document.getElementById('res').innerText);
  console.log(text);
  await browser.close();
})();
