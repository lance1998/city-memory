const fs = require('fs');

// Stub out document and DOM elements
const document = {
  getElementById: (id) => ({
    innerHTML: '',
    textContent: '',
  })
};

// Stub out DB and Utils
const DB = {
  currentUser: { id: 1 },
  memories: [
    {
      userId: 1,
      oldImages: ['img.jpg'],
      title: 'Test Upload',
      status: '<script>alert("XSS")</script>',
      likes: 0,
      comments: 0
    }
  ]
};

// Stub out navigation
const app = {
  navigateTo: (path) => {}
};

// EscHtml mock, assuming it is defined in app-part1.js
const escHtml = (s) => {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Read the app-part2.js
const sourceCode = fs.readFileSync('./app-part2.js', 'utf8');

const regex = /showMyUploads\(\)\s*\{([\s\S]*?navigateTo\('myuploads'\);\s*)\}/;
const match = sourceCode.match(regex);

if (match) {
  const functionBody = match[1];

  // create a dummy function
  const showMyUploads = new Function('document', 'DB', 'escHtml', 'app', `
    const container = { innerHTML: '' };
    document.getElementById = (id) => {
      if(id === 'myuploads-list') return container;
      return { innerHTML: '', textContent: '' };
    };

    // We bind 'this' to 'app'
    const context = { navigateTo: () => {} };

    // Execute body but bind 'this'
    const fn = function() {
      ${functionBody}
    };
    fn.call(context);

    return container.innerHTML;
  `);

  const innerHTML = showMyUploads(document, DB, escHtml, app);

  if (innerHTML.includes('<script>alert("XSS")</script>')) {
    console.error("FAIL: XSS vulnerability is still present.");
    process.exit(1);
  } else if (innerHTML.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')) {
    console.log("PASS: The script was properly escaped.");
    process.exit(0);
  } else {
    console.log("UNKNOWN: Output was unexpected:");
    console.log(innerHTML);
    process.exit(2);
  }
} else {
  console.log("Could not parse function showMyUploads");
  process.exit(3);
}
