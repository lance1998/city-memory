const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

// Read app.js
const code = fs.readFileSync('./app.js', 'utf8');

// Mock a lightweight browser environment to evaluate app.js
const sandbox = {
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ innerHTML: '', style: {} }),
    documentElement: { dataset: {} },
    body: { appendChild: () => {} }
  },
  window: {
    matchMedia: () => ({ addEventListener: () => {}, matches: false }),
    addEventListener: () => {}
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: () => {},
  cancelAnimationFrame: () => {},
  Storage: { get: () => null, set: () => {} },
  DB: { state: {}, footprints: [], memories: [], routes: [], feedItems: [], badges: [], topics: [], comments: [], favorites: [] },
  Utils: { getYearClass: () => '', formatDate: () => '' },
  L: undefined // Optional mock for Leaflet
};

// Create the VM context
vm.createContext(sandbox);

try {
  // Execute the script in the sandbox
  vm.runInContext(code, sandbox);
} catch (e) {
  // app.js might have a few global references we didn't mock, but as long as it parses
  // and escHtml is hoisted, we can extract it.
  // Let's just print a warning if it throws.
  // Actually, we don't strictly need everything to execute, we just need escHtml.
}

// Ensure escHtml was extracted
if (typeof sandbox.escHtml !== 'function') {
  console.error("Could not extract escHtml from app.js using vm context.");
  process.exit(1);
}

const escHtml = sandbox.escHtml;

console.log("Testing escHtml function...");

try {
  // Edge cases and empty values
  assert.strictEqual(escHtml(''), '');
  assert.strictEqual(escHtml(null), '');
  assert.strictEqual(escHtml(undefined), '');

  // Normal strings without unsafe characters
  assert.strictEqual(escHtml('normal text'), 'normal text');
  assert.strictEqual(escHtml('hello world'), 'hello world');

  // Strings containing HTML entities
  assert.strictEqual(escHtml('A & B'), 'A &amp; B');
  assert.strictEqual(escHtml('<tag>'), '&lt;tag&gt;');
  assert.strictEqual(escHtml('<div>test</div>'), '&lt;div&gt;test&lt;/div&gt;');
  assert.strictEqual(escHtml('"quotes"'), '&quot;quotes&quot;');
  assert.strictEqual(escHtml("'single'"), '&#39;single&#39;');

  // Strings with mixed and multiple entities
  assert.strictEqual(
    escHtml('<script>alert("1 & 2")</script>'),
    '&lt;script&gt;alert(&quot;1 &amp; 2&quot;)&lt;/script&gt;'
  );
  assert.strictEqual(escHtml('&&&&'), '&amp;&amp;&amp;&amp;');
  assert.strictEqual(escHtml('<<>>'), '&lt;&lt;&gt;&gt;');
  assert.strictEqual(escHtml('\'\'""'), '&#39;&#39;&quot;&quot;');

  // Non-string inputs (should be cast to string)
  assert.strictEqual(escHtml(123), '123');
  assert.strictEqual(escHtml(0), ''); // 0 is falsy, so !s matches and it returns ''
  assert.strictEqual(escHtml(false), ''); // falsy, returns ''

  console.log("All tests passed!");
} catch (error) {
  console.error("Test failed!");
  console.error("Expected:", error.expected);
  console.error("Actual:", error.actual);
  console.error("Operator:", error.operator);
  process.exit(1);
}
