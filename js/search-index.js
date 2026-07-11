// 城市微记忆 · 搜索索引优化
// 为发现页提供快速搜索索引（拼音、标签、城市多维度）
(function() {
  'use strict';
  if (typeof app === 'undefined' || typeof DB === 'undefined') return;

  // Build search index once
  var _searchIndex = null;
  var _pinyinCache = {};

  // Simple pinyin first-char extraction (no library needed)
  function getPinyin(str) {
    if (_pinyinCache[str]) return _pinyinCache[str];
    // Use built-in city data pinyin if available
    if (DB.chinaCities) {
      var city = DB.chinaCities.find(function(c) { return c.name === str; });
      if (city && city.pinyin) { _pinyinCache[str] = city.pinyin; return city.pinyin; }
    }
    // Fallback: just return original
    _pinyinCache[str] = str;
    return str;
  }

  function buildIndex() {
    if (!DB.memories) return;
    _searchIndex = DB.memories.filter(function(m) { return m.status === '已发布'; }).map(function(m) {
      var py = getPinyin(m.city || '');
      var titlePy = py;
      return {
        id: m.id,
        title: m.title || '',
        city: m.city || '',
        cityPinyin: py,
        titlePinyin: titlePy,
        tags: (m.tags || []).join(' '),
        year: m.year || '',
        author: m.authorName || '',
        story: (m.story || '').substring(0, 100),
        likes: m.likes || 0,
        _matchStr: (m.title + ' ' + m.city + ' ' + py + ' ' + (m.tags || []).join(' ') + ' ' + m.year + ' ' + m.authorName + ' ' + (m.story || '').substring(0, 100)).toLowerCase(),
        titleLow: (m.title || '').toLowerCase(),
        cityLow: (m.city || '').toLowerCase(),
        cityPinyinLow: (py || '').toLowerCase(),
        tagsLow: ((m.tags || []).join(' ')).toLowerCase(),
        yearLow: (m.year || '').toLowerCase(),
        authorLow: (m.authorName || '').toLowerCase(),
        storyLow: ((m.story || '').substring(0, 100)).toLowerCase()
      };
    });
    console.log('[SearchIndex] 已建立索引，共 ' + _searchIndex.length + ' 条');
  }

  function search(query) {
    if (!_searchIndex) buildIndex();
    if (!_searchIndex || !query) return null;

    var q = query.toLowerCase().trim();
    if (!q) return null;

    // Score-based search
    var scored = [];
    for (var i = 0; i < _searchIndex.length; i++) {
      var item = _searchIndex[i];
      var str = item._matchStr;

      // Fast exit if query does not exist anywhere in the text
      if (str.indexOf(q) === -1) continue;

      var score = 0;

      // Exact title match
      if (item.titleLow.indexOf(q) !== -1) score += 100;
      // City match
      if (item.cityLow.indexOf(q) !== -1) score += 80;
      // Pinyin match
      if (item.cityPinyinLow.indexOf(q) !== -1) score += 70;
      // Tag match
      if (item.tagsLow.indexOf(q) !== -1) score += 60;
      // Year match
      if (item.yearLow.indexOf(q) !== -1) score += 50;
      // Author match
      if (item.authorLow.indexOf(q) !== -1) score += 40;
      // Story partial match
      if (item.storyLow.indexOf(q) !== -1) score += 20;

      if (score > 0) {
        scored.push({ id: item.id, score: score });
      }
    }

    // Sort by score descending
    scored.sort(function(a, b) { return b.score - a.score; });

    return scored.map(function(s) { return s.id; });
  }

  // Hook into existing search
  var _origSearch = app.search || null;

  app.search = function(query) {
    var resultIds = search(query);
    if (resultIds === null) return _origSearch ? _origSearch.call(this, query) : [];

    // Convert IDs to memory objects
    return resultIds.map(function(id) {
      return DB.memories.find(function(m) { return m.id === id; });
    }).filter(Boolean);
  };

  // Hook into search input for live suggestions
  var searchInput = document.getElementById('discover-search');
  if (searchInput) {
    var _suggestTimer = null;
    searchInput.addEventListener('input', function() {
      var val = this.value.trim();
      var clearBtn = document.querySelector('.search-clear-btn');
      if (clearBtn) clearBtn.style.display = val ? '' : 'none';

      clearTimeout(_suggestTimer);
      _suggestTimer = setTimeout(function() {
        if (app.search && app.renderDiscover) {
          var results = app.search(val);
          if (val && results.length === 0) {
            app.showToast && app.showToast('未找到"' + val + '"相关记忆');
          }
        }
      }, 300);
    });
  }

  // Build index after nationwide data is loaded
  function tryBuildIndex() {
    if (DB.memories && DB.memories.length > 10) {
      buildIndex();
    } else {
      setTimeout(tryBuildIndex, 500);
    }
  }
  tryBuildIndex();

  app._searchIndex = { count: function() { return _searchIndex ? _searchIndex.length : 0; } };
  console.log('[SearchIndex] 搜索索引模块已加载');
})();
