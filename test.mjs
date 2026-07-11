import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  let errorCount = 0;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Page error: ${msg.text()}`);
      errorCount++;
    }
  });

  await page.goto('file:///app/index.html', { waitUntil: 'networkidle' });

  if (errorCount > 0) {
    console.error(`Tests failed with ${errorCount} errors.`);
    process.exit(1);
  }

  console.log('Successfully loaded index.html without errors.');
  await browser.close();
})();
