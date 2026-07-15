const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock DB
window.DB = { state: { currentPage: 'map' }, users: [{id: 'u2', following: []}], currentUser: {following: []}, memories: [] };

// Load app
const appJs = fs.readFileSync('app.js', 'utf8');
const script = document.createElement("script");
script.textContent = appJs;
document.body.appendChild(script);

try {
  window.app.showUserProfile('u2');
  console.log("showUserProfile Success!");
} catch(e) {
  console.log("showUserProfile Error: " + e.message);
}

try {
  window.app.showMyUploads();
  console.log("showMyUploads Success!");
} catch(e) {
  console.log("showMyUploads Error: " + e.message);
}
