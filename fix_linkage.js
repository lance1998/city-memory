const fs = require('fs');

let content = fs.readFileSync('js/linkage-fix.js', 'utf8');

// Fixing linkage-fix.js renderDiscover replacement
const renderDiscoverReplacement = `    _origRenderDiscover(searchQuery);
    var hotCards = document.querySelectorAll('.hot-card');
    var city = DB.state.currentCity;
    var year = DB.state.yearFilter;
    if (city && city !== '全部') {
      var memoryMap = new Map();
      DB.memories.forEach(function(m) { memoryMap.set(m.id, m); });
      hotCards.forEach(function(card) {
        card.style.display = '';
        var onclickStr = card.getAttribute('onclick') || '';
        var idMatch = onclickStr.match(/openDetail\\((\\d+)\\)/);
        if (idMatch) {
          var mem = memoryMap.get(parseInt(idMatch[1]));
          if (mem) {
            var showCity = mem.city === city;
            var showYear = year === 'all' || Utils.getYearClass(mem.year) === year;
            if (!showCity || !showYear) card.style.display = 'none';
          }
        }
      });
    }`;

content = content.replace(
  /    _origRenderDiscover\(searchQuery\);\n    var hotCards = document\.querySelectorAll\('\.hot-card'\);\n    var city = DB\.state\.currentCity;\n    var year = DB\.state\.yearFilter;\n    if \(city && city !== '全部'\) \{\n      hotCards\.forEach\(function\(card\) \{\n        card\.style\.display = '';\n        var onclickStr = card\.getAttribute\('onclick'\) \|\| '';\n        var idMatch = onclickStr\.match\(\/openDetail\\\(\(\\d\+\)\\\)\/\);\n        if \(idMatch\) \{\n          var mem = DB\.memories\.find\(function\(m\) \{ return m\.id === parseInt\(idMatch\[1\]\); \}\);\n          if \(mem\) \{\n            var showCity = mem\.city === city;\n            var showYear = year === 'all' \|\| Utils\.getYearClass\(mem\.year\) === year;\n            if \(\!showCity \|\| \!showYear\) card\.style\.display = 'none';\n          \}\n        \}\n      \}\);\n    \}/,
  renderDiscoverReplacement
);

fs.writeFileSync('js/linkage-fix.js', content, 'utf8');
