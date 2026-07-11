const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => {
    console.error('BROWSER ERROR:', err.message);
  });

  console.log('Navigating to index.html...');
  await page.goto('file:///app/index.html', { waitUntil: 'networkidle' });

  console.log('Waiting for app to initialize...');
  await page.waitForTimeout(2000);

  console.log('Evaluating city picker...');
  await page.evaluate(() => {
    // the global 'app' object in app.js is declared with `const app = {...}`. It might not be available on `window.app` if it is a const in global scope, although it usually is unless executed as a module.
    // However, it should be available via `app`.
    if (typeof app === 'undefined') throw new Error('app is undefined');
    if (typeof app.showCityPicker !== 'function') throw new Error('app.showCityPicker is not a function');

    // Simulate user flow
    console.log('Opening city picker...');
    app.showCityPicker();

    console.log('Selecting a city (全国)...');
    app.selectCity('__ALL__');

    console.log('Selecting a specific city (日照)...');
    app.selectCity('日照');
  });

  console.log('City picker interactions successful.');
  await browser.close();
})();
