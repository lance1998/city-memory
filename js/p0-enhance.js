/**
 * 城市微记忆 P0 · 基础体验增强补丁
 * p0-1 时光滑块 | p0-2 城市选择器 | p0-3 详情面板
 * p0-4 发现页 | p0-5 搜索 | p0-6 移动端 | p0-7 Design Token
 *
 * 架构：patch 链最末端，hook 模式增强
 * 在 linkage-fix.js 之后加载
 */
(function() {
  'use strict';
  if (typeof app === 'undefined' || typeof DB === 'undefined') return;

  var esc = function(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // ==================== P0-1: 时光滑块 ====================
  function initTimeSlider() {
    var yearBar = document.getElementById('v21-year-bar');
    if (!yearBar || !yearBar.parentNode) return;
    var wrap = document.createElement('div');
    wrap.className = 'p0-timeslider-wrap';
    wrap.innerHTML = '<div class="p0-timeslider">' +
      '<div class="p0-timeslider-track">' +
        '<div class="p0-timeslider-fill" id="p0-ts-fill"></div>' +
      '</div>' +
      '<div class="p0-timeslider-thumb" id="p0-ts-thumb"></div>' +
      '<div class="p0-timeslider-year-display" id="p0-ts-year">全部年代</div>' +
    '</div>' +
    '<div class="p0-timeslider-labels" id="p0-ts-labels"></div>';
    yearBar.parentNode.insertBefore(wrap, yearBar);
    yearBar.style.display = 'none';

    var decades = [
      { key: 'all', label: '全部', start: 0, end: 0 },
      { key: '70s', label: '70s', start: 0, end: 0.2 },
      { key: '80s', label: '80s', start: 0.2, end: 0.4 },
      { key: '90s', label: '90s', start: 0.4, end: 0.6 },
      { key: '00s', label: '00s', start: 0.6, end: 0.8 },
      { key: '10s', label: '10s', start: 0.8, end: 1.0 }
    ];

    var labelsEl = document.getElementById('p0-ts-labels');
    decades.forEach(function(d) {
      var lbl = document.createElement('span');
      lbl.className = 'p0-timeslider-label' + (d.key === 'all' ? ' active' : '');
      lbl.textContent = d.label;
      lbl.dataset.year = d.key;
      lbl.onclick = function() {
        var pos = d.key === 'all' ? 0 : d.start + 0.1;
        setSliderPos(pos, d.key);
      };
      labelsEl.appendChild(lbl);
    });

    var thumb = document.getElementById('p0-ts-thumb');
    var fill = document.getElementById('p0-ts-fill');
    var yearDisplay = document.getElementById('p0-ts-year');
    var dragging = false;

    function setSliderPos(pct, yearKey) {
      pct = Math.max(0, Math.min(1, pct));
      thumb.style.left = (pct * 100) + '%';
      fill.style.width = (pct * 100) + '%';

      var key = yearKey || 'all';
      if (!yearKey) {
        if (pct < 0.15) key = '70s';
        else if (pct < 0.35) key = '80s';
        else if (pct < 0.55) key = '90s';
        else if (pct < 0.75) key = '00s';
        else if (pct < 0.9) key = '10s';
        else key = '10s';
        if (pct < 0.05) key = 'all';
      }
      DB.state.yearFilter = key;

      // 更新 labels
      labelsEl.querySelectorAll('.p0-timeslider-label').forEach(function(l) {
        l.classList.toggle('active', l.dataset.year === key);
      });

      // 更新显示
      var label = decades.find(function(d) { return d.key === key; });
      if (label) {
        yearDisplay.textContent = key === 'all' ? '全部年代' : label.label + '年代';
        yearDisplay.classList.add('visible');
        setTimeout(function() { yearDisplay.classList.remove('visible'); }, 1500);
      }

      // 触发筛选
      if (app.filterMapMarkers) app.filterMapMarkers();
      if (typeof V21 !== 'undefined') {
        if (V21._updateYearBarActive) V21._updateYearBarActive();
        if (V21.applyYearAtmosphere) V21.applyYearAtmosphere(key);
      }
      // 同步发现页
      if (app.renderDiscover) {
        var si = document.getElementById('discover-search');
        app.renderDiscover(si ? si.value : '');
      }
      document.querySelectorAll('#page-discover .filter-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.year === key);
      });
    }

    // 拖拽
    function onPointerDown(e) {
      dragging = true;
      thumb.style.transition = 'none';
      fill.style.transition = 'none';
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var rect = thumb.parentElement.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var pct = (clientX - rect.left) / rect.width;
      setSliderPos(pct);
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      thumb.style.transition = '';
      fill.style.transition = '';
    }

    thumb.addEventListener('mousedown', onPointerDown);
    thumb.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);

    // 初始化位置
    setSliderPos(0, 'all');
    console.log('[P0-1] 时光滑块已初始化');
  }

  // ==================== P0-2: 城市选择器重做 ====================
  function initCityPicker() {
    // 创建新的城市选择器 DOM
    var picker = document.createElement('div');
    picker.className = 'p0-city-picker';
    picker.id = 'p0-city-picker';
    picker.innerHTML =
      '<div class="p0-city-picker-backdrop"></div>' +
      '<div class="p0-city-picker-sheet">' +
        '<div class="p0-city-picker-handle"></div>' +
        '<div class="p0-city-picker-search">' +
          '<i class="fas fa-search"></i>' +
          '<input type="text" placeholder="搜索城市..." id="p0-city-search-input">' +
        '</div>' +
        '<div class="p0-city-picker-body">' +
          '<div class="p0-city-picker-index" id="p0-city-index"></div>' +
          '<div class="p0-city-picker-list" id="p0-city-list"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(picker);

    var searchInput = document.getElementById('p0-city-search-input');
    var listEl = document.getElementById('p0-city-list');
    var indexEl = document.getElementById('p0-city-index');
    var backdrop = picker.querySelector('.p0-city-picker-backdrop');
    var cities = DB.chinaCities || [];

    // 计算每个城市的记忆数
    function getCountMap() {
      var map = {};
      DB.memories.forEach(function(m) {
        if (m.status === '已发布' && m.city) map[m.city] = (map[m.city] || 0) + 1;
      });
      cities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (lm.status === '已发布') map[c.name] = (map[c.name] || 0) + 1;
        });
      });
      return map;
    }

    // 按拼音首字母分组
    function groupByLetter(cityList) {
      var groups = {};
      cityList.forEach(function(c) {
        var letter = (c.pinyin || c.name || '?')[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(c);
      });
      return Object.keys(groups).sort().map(function(letter) {
        return { letter: letter, cities: groups[letter] };
      });
    }

    function renderCities(filter) {
      var countMap = getCountMap();
      var filtered = cities;
      if (filter) {
        var q = filter.toLowerCase();
        filtered = cities.filter(function(c) {
          return c.name.toLowerCase().indexOf(q) !== -1 ||
            (c.pinyin || '').toLowerCase().indexOf(q) !== -1 ||
            (c.province || '').toLowerCase().indexOf(q) !== -1;
        });
      }
      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="p0-city-picker-empty">未找到匹配的城市</div>';
        return;
      }
      var groups = groupByLetter(filtered);
      var html = '';
      groups.forEach(function(g) {
        html += '<div class="p0-city-letter-group" data-letter="' + esc(g.letter) + '">' +
          '<div class="p0-city-letter-label">' + esc(g.letter) + '</div>';
        g.cities.forEach(function(c) {
          var count = countMap[c.name] || 0;
          var isCurrent = DB.state.currentCity === c.name;
          html += '<div class="p0-city-item' + (isCurrent ? ' current' : '') + '" data-city="' + esc(c.name) + '">' +
            '<div class="p0-city-item-avatar"><i class="fas fa-map-marker-alt" style="color:var(--primary);font-size:16px;"></i></div>' +
            '<div class="p0-city-item-info">' +
              '<div class="p0-city-item-name">' + esc(c.name) + '</div>' +
              '<div class="p0-city-item-province">' + esc(c.province || '') + '</div>' +
            '</div>' +
            (count > 0 ? '<span class="p0-city-item-count">' + count + '</span>' : '') +
          '</div>';
        });
        html += '</div>';
      });
      listEl.innerHTML = html;

      // 渲染字母索引
      var indexHtml = '';
      groups.forEach(function(g) {
        indexHtml += '<span data-letter="' + esc(g.letter) + '">' + esc(g.letter) + '</span>';
      });
      indexEl.innerHTML = indexHtml;

      // 绑定城市点击
      listEl.querySelectorAll('.p0-city-item').forEach(function(item) {
        item.addEventListener('click', function() {
          app.selectCity(item.dataset.city);
          closePicker();
        });
      });

      // 绑定字母索引点击
      indexEl.querySelectorAll('span').forEach(function(span) {
        span.addEventListener('click', function() {
          var target = listEl.querySelector('[data-letter="' + span.dataset.letter + '"]');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    function openPicker() {
      renderCities();
      picker.classList.add('show');
      searchInput.value = '';
      setTimeout(function() { searchInput.focus(); }, 300);
    }

    function closePicker() {
      picker.classList.remove('show');
    }

    backdrop.addEventListener('click', closePicker);
    searchInput.addEventListener('input', function() {
      renderCities(searchInput.value.trim());
    });

    // 替换原有的城市选择器
    app.showCityPicker = openPicker;
    console.log('[P0-2] 城市选择器已重做');
  }

  // ==================== P0-3: 详情面板增强 ====================
  function initDetailEnhance() {
    var origOpenDetail = app.openDetail.bind(app);
    app.openDetail = function(id) {
      origOpenDetail(id);

      // 找到记忆
      var mem = DB.memories.find(function(m) { return m.id === id; });
      if (!mem) {
        DB.chinaCities.forEach(function(c) {
          (c.landmarks || []).forEach(function(lm) {
            if (lm.id === id) mem = Object.assign({}, lm, { city: c.name });
          });
        });
      }
      if (!mem) return;

      var detailContent = document.getElementById('detail-content');
      if (!detailContent) return;

      // 找到现有 compare-container 并替换为增强版
      var oldCompare = detailContent.querySelector('.compare-container');
      if (oldCompare) {
        var oldImg = oldCompare.querySelector('.compare-old img');
        var newImg = oldCompare.querySelector('.compare-new img');
        var oldSrc = oldImg ? oldImg.src : '';
        var newSrc = newImg ? newImg.src : '';

        var compareHtml = buildCompareSlider(oldSrc, newSrc);
        var tmp = document.createElement('div');
        tmp.innerHTML = compareHtml;
        var newCompare = tmp.firstElementChild;
        oldCompare.parentNode.replaceChild(newCompare, oldCompare);
        initCompareSlider(newCompare);
      }

      // 增强评论区
      enhanceComments(detailContent, mem);
    };

    function buildCompareSlider(oldSrc, newSrc) {
      var hasBoth = oldSrc && newSrc;
      if (!hasBoth) {
        var src = oldSrc || newSrc;
        if (src) {
          return '<div class="p0-compare-wrap"><div class="p0-compare-side"><img src="' + src + '" alt="照片"></div></div>';
        }
        return '<div class="p0-compare-wrap"><div class="p0-compare-empty"><i class="fas fa-image" style="margin-right:8px;"></i>暂无照片</div></div>';
      }
      return '<div class="p0-compare-wrap">' +
        '<div class="p0-compare-side"><img src="' + oldSrc + '" alt="旧照"></div>' +
        '<div class="p0-compare-new-wrap"><img src="' + newSrc + '" alt="新照"></div>' +
        '<div class="p0-compare-divider"></div>' +
        '<div class="p0-compare-handle"><i class="fas fa-arrows-alt-h"></i></div>' +
        '<span class="p0-compare-label p0-compare-label-old">旧</span>' +
        '<span class="p0-compare-label p0-compare-label-new">新</span>' +
      '</div>';
    }

    function initCompareSlider(wrap) {
      var newWrap = wrap.querySelector('.p0-compare-new-wrap');
      var divider = wrap.querySelector('.p0-compare-divider');
      var handle = wrap.querySelector('.p0-compare-handle');
      if (!newWrap || !divider) return;

      var dragging = false;
      function updatePosition(clientX) {
        var rect = wrap.getBoundingClientRect();
        var pct = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
        newWrap.style.width = (pct * 100) + '%';
        divider.style.left = (pct * 100) + '%';
        handle.style.left = (pct * 100) + '%';
      }
      function onDown(e) { dragging = true; e.preventDefault(); }
      function onMove(e) {
        if (!dragging) return;
        var cx = e.touches ? e.touches[0].clientX : e.clientX;
        updatePosition(cx);
      }
      function onUp() { dragging = false; }

      wrap.addEventListener('mousedown', onDown);
      wrap.addEventListener('touchstart', onDown, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
    }

    function enhanceComments(detailContent, mem) {
      // 在 detail-actions 后添加评论区
      var actions = detailContent.querySelector('.detail-actions');
      if (!actions || actions.parentNode.querySelector('.p0-comments-section')) return;

      var comments = (DB.comments && DB.comments[mem.id]) || [];
      var section = document.createElement('div');
      section.className = 'p0-comments-section';
      section.innerHTML =
        '<div class="p0-comments-header">' +
          '<h3>评论 (' + comments.length + ')</h3>' +
        '</div>' +
        '<div class="p0-comments-list">' +
          comments.map(function(c) {
            return '<div class="p0-comment-item">' +
              '<div class="p0-comment-avatar"><i class="fas fa-user"></i></div>' +
              '<div class="p0-comment-body">' +
                '<div><span class="p0-comment-name">' + esc(c.name || '匿名') + '</span>' +
                '<span class="p0-comment-time">' + esc(c.time || '') + '</span></div>' +
                '<div class="p0-comment-text">' + esc(c.text || '') + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="p0-comment-input-wrap">' +
          '<input class="p0-comment-input" placeholder="写评论..." maxlength="200">' +
          '<button class="p0-comment-send"><i class="fas fa-paper-plane"></i></button>' +
        '</div>';

      actions.parentNode.appendChild(section);

      // 绑定发送
      var input = section.querySelector('.p0-comment-input');
      var sendBtn = section.querySelector('.p0-comment-send');
      var listEl = section.querySelector('.p0-comments-list');
      var headerH3 = section.querySelector('.p0-comments-header h3');

      sendBtn.addEventListener('click', function() {
        var text = input.value.trim();
        if (!text) return;
        if (!DB.comments[mem.id]) DB.comments[mem.id] = [];
        var newComment = { name: DB.user ? DB.user.name : '我', text: text, time: '刚刚' };
        DB.comments[mem.id].push(newComment);
        if (DB.save) DB.save();

        // 渲染新评论
        var item = document.createElement('div');
        item.className = 'p0-comment-item';
        item.innerHTML =
          '<div class="p0-comment-avatar"><i class="fas fa-user"></i></div>' +
          '<div class="p0-comment-body">' +
            '<div><span class="p0-comment-name">' + esc(newComment.name) + '</span>' +
            '<span class="p0-comment-time">刚刚</span></div>' +
            '<div class="p0-comment-text">' + esc(newComment.text) + '</div>' +
          '</div>';
        listEl.appendChild(item);
        headerH3.textContent = '评论 (' + DB.comments[mem.id].length + ')';
        input.value = '';
        app.toast && app.toast('评论已发送');
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendBtn.click();
      });
    }

    console.log('[P0-3] 详情面板增强已初始化');
  }

  // ==================== P0-5: 搜索下拉 ====================
  function initSearchDropdown() {
    var searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;
    searchBar.style.position = 'relative';

    var dropdown = document.createElement('div');
    dropdown.className = 'p0-search-dropdown';
    dropdown.id = 'p0-search-dropdown';
    searchBar.appendChild(dropdown);

    var searchInput = document.getElementById('discover-search');
    if (!searchInput) return;

    var searchHistory = JSON.parse(localStorage.getItem('cm_search_history') || '[]');

    function getHotTags() {
      var tags = {};
      DB.memories.forEach(function(m) {
        (m.tags || []).forEach(function(t) { tags[t] = (tags[t] || 0) + 1; });
      });
      return Object.entries(tags).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 8).map(function(e) { return e[0]; });
    }

    function highlightMatch(text, query) {
      if (!query) return esc(text);
      var idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return esc(text);
      return esc(text.substring(0, idx)) + '<mark>' + esc(text.substring(idx, idx + query.length)) + '</mark>' + esc(text.substring(idx + query.length));
    }

    function renderDropdown(query) {
      var html = '';

      if (!query) {
        // 显示历史 + 热门标签
        if (searchHistory.length > 0) {
          html += '<div class="p0-search-section-title">搜索历史</div>';
          searchHistory.slice(0, 5).forEach(function(h) {
            html += '<div class="p0-search-item" data-query="' + esc(h) + '">' +
              '<div class="p0-search-item-icon"><i class="fas fa-clock"></i></div>' +
              '<span class="p0-search-item-text">' + esc(h) + '</span></div>';
          });
          html += '<div class="p0-search-clear-history" id="p0-clear-history">清除搜索历史</div>';
        }

        var tags = getHotTags();
        if (tags.length > 0) {
          html += '<div class="p0-search-section-title">热门标签</div>';
          tags.forEach(function(tag) {
            html += '<div class="p0-search-item" data-query="' + esc(tag) + '">' +
              '<div class="p0-search-item-icon"><i class="fas fa-hashtag"></i></div>' +
              '<span class="p0-search-item-text">' + esc(tag) + '</span></div>';
          });
        }
      } else if (query.length >= 1) {
        // 搜索建议
        var results = app.search ? app.search(query) : [];
        results.slice(0, 6).forEach(function(mem) {
          html += '<div class="p0-search-item" data-id="' + mem.id + '">' +
            '<div class="p0-search-item-icon"><i class="fas fa-map-marker-alt"></i></div>' +
            '<div><div class="p0-search-item-text">' + highlightMatch(mem.title, query) + '</div>' +
            '<div class="p0-search-item-sub">' + esc(mem.city || '') + ' · ' + esc(mem.year || '') + '</div></div></div>';
        });
        if (results.length === 0) {
          html += '<div class="p0-search-section-title">未找到相关记忆</div>';
        }
      }

      dropdown.innerHTML = html;
      dropdown.classList.toggle('show', html.length > 0);

      // 绑定点击
      dropdown.querySelectorAll('.p0-search-item[data-query]').forEach(function(item) {
        item.addEventListener('click', function() {
          searchInput.value = item.dataset.query;
          searchInput.focus();
          dropdown.classList.remove('show');
          if (app.renderDiscover) app.renderDiscover(item.dataset.query);
        });
      });
      dropdown.querySelectorAll('.p0-search-item[data-id]').forEach(function(item) {
        item.addEventListener('click', function() {
          dropdown.classList.remove('show');
          app.openDetail(parseInt(item.dataset.id));
        });
      });

      var clearBtn = dropdown.querySelector('#p0-clear-history');
      if (clearBtn) {
        clearBtn.addEventListener('click', function() {
          searchHistory = [];
          localStorage.removeItem('cm_search_history');
          renderDropdown('');
        });
      }
    }

    searchInput.addEventListener('focus', function() {
      renderDropdown(searchInput.value.trim());
    });

    var timer = null;
    searchInput.addEventListener('input', function() {
      clearTimeout(timer);
      timer = setTimeout(function() {
        var val = searchInput.value.trim();
        renderDropdown(val);
        if (val.length >= 2 && app.renderDiscover) {
          app.renderDiscover(val);
        }
      }, 250);
    });

    // 点击外部关闭
    document.addEventListener('click', function(e) {
      if (!searchBar.contains(e.target)) dropdown.classList.remove('show');
    });

    // 保存搜索历史
    var origSearch = searchInput.onchange;
    searchInput.addEventListener('change', function() {
      var val = searchInput.value.trim();
      if (val.length >= 2) {
        searchHistory = searchHistory.filter(function(h) { return h !== val; });
        searchHistory.unshift(val);
        searchHistory = searchHistory.slice(0, 10);
        localStorage.setItem('cm_search_history', JSON.stringify(searchHistory));
      }
    });

    console.log('[P0-5] 搜索下拉已初始化');
  }

  // ==================== P0-6: 移动端增强 ====================
  function initMobileEnhance() {
    var pageMap = document.getElementById('page-map');
    if (!pageMap) return;
    pageMap.classList.add('p0-map-header-compact');

    var mapHeader = pageMap.querySelector('.map-header');
    var mapContainer = document.getElementById('map-container');
    if (!mapHeader || !mapContainer) return;

    // 向下滚动地图时收起 header
    var lastScrollTop = 0;
    mapContainer.addEventListener('scroll', function() {
      var st = mapContainer.scrollTop || document.documentElement.scrollTop;
      if (st > 20) {
        mapHeader.classList.add('p0-header-minimized');
      } else {
        mapHeader.classList.remove('p0-header-minimized');
      }
      lastScrollTop = st;
    }, { passive: true });

    // 双击 marker 在触摸设备上的处理（避免与双击缩放冲突）
    var lastTapTime = 0;
    if ('ontouchstart' in window) {
      var mapEl = mapContainer;
      mapEl.addEventListener('touchend', function(e) {
        var now = Date.now();
        if (now - lastTapTime < 300) {
          // 双击 - 不做处理，让 Leaflet 处理缩放
        }
        lastTapTime = now;
      }, { passive: true });
    }

    console.log('[P0-6] 移动端增强已初始化');
  }

  // ==================== 初始化 ====================
  function init() {
    initTimeSlider();
    initCityPicker();
    initDetailEnhance();
    initSearchDropdown();
    initMobileEnhance();
    console.log('[P0] 基础体验增强补丁已加载 — 7 个模块全部就绪');
  }

  function waitForApp() {
    if (typeof app !== 'undefined' && app.map && app.markerLayer) {
      init();
    } else {
      setTimeout(waitForApp, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }
})();
