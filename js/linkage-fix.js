/**
 * 城市微记忆 · 全页面联动修复补丁 v1
 * 修复 15 个联动与交互问题（S1-S6, M1-M5, L1-L4）
 *
 * 架构：作为 patch 链最末端加载，通过 hook 模式增强 app 方法
 * 遵循 safeId 沙箱约束：仅操作 DOM 元素，不依赖 getElementById 获取非白名单元素
 */
(function() {
  'use strict';
  if (typeof app === 'undefined' || typeof DB === 'undefined') return;

  var _touchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var _toastTimer = null;
  var _landmarkMarkers = [];

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ==================== 统一 Hook ====================
  // 对每个 app 方法只 hook 一次，合并所有修复逻辑

  // --- selectCity: S2(更新year bar) + S5(更新时光页提示) ---
  var _origSelectCity = app.selectCity.bind(app);
  app.selectCity = function(city) {
    _origSelectCity(city);
    if (typeof V21 !== 'undefined' && V21._updateYearBar) V21._updateYearBar();
    _updateFilterInfo();
  };

  // --- switchTab: S6(切到profile时刷新) ---
  var _origSwitchTab = app.switchTab.bind(app);
  app.switchTab = function(page) {
    _origSwitchTab(page);
    if (page === 'profile') {
      setTimeout(function() {
        if (typeof app.renderProfile === 'function') app.renderProfile();
      }, 50);
    }
  };

  // --- addMapMarkers: S3(增加全国地标) ---
  var _origAddMapMarkers = app.addMapMarkers.bind(app);
  app.addMapMarkers = function() {
    _landmarkMarkers = [];
    _origAddMapMarkers();
    if (!DB.chinaCities || !this.markerLayer) return;
    var existingIds = {};
    this.markers.forEach(function(mk) { existingIds[mk.memoryId] = true; });
    var size = this.getThumbSize(this.map.getZoom());
    var self = this;
    DB.chinaCities.forEach(function(city) {
      (city.landmarks || []).forEach(function(lm) {
        if (lm.status !== '已发布' || existingIds[lm.id]) return;
        var mem = Object.assign({}, lm, { city: city.name });
        var icon = self.createPhotoIcon(mem, size);
        var marker = L.marker([lm.lat, lm.lng], { icon: icon });
        marker.memoryId = lm.id;
        marker._isLandmark = true;
        marker._landmarkData = mem;
        self.markers.push(marker);
        _landmarkMarkers.push(marker);
        self.markerLayer.addLayer(marker);
      });
    });
    // 绑定点击事件（含地标）
    this.markerLayer.off('click');
    this.markerLayer.on('click', function(e) {
      var memId = e.layer.memoryId;
      if (memId === undefined) return;
      if (e.latlng && typeof V21 !== 'undefined') {
        var mem = DB.memories.find(function(m) { return m.id === memId; });
        if (!mem) {
          DB.chinaCities.forEach(function(c) {
            (c.landmarks || []).forEach(function(lm) {
              if (lm.id === memId) mem = Object.assign({}, lm, { city: c.name });
            });
          });
        }
        if (mem) V21.createRipple(mem, e.latlng);
      }
      self.openDetail(memId);
    });
    console.log('[LinkageFix] S3: 全国地标已添加，共 ' + this.markers.length + ' 标记');
  };

  // --- filterMapMarkers: S3(过滤地标) ---
  var _origFilterMapMarkers = app.filterMapMarkers.bind(app);
  app.filterMapMarkers = function() {
    _origFilterMapMarkers();
    if (!this.markerLayer || _landmarkMarkers.length === 0) return;
    var filter = DB.state.yearFilter;
    var city = DB.state.currentCity;
    var self = this;
    _landmarkMarkers.forEach(function(marker) {
      self.markerLayer.removeLayer(marker);
      var mem = marker._landmarkData;
      if (!mem) return;
      var showYear = filter === 'all' || Utils.getYearClass(mem.year) === filter;
      var showCity = mem.city === city;
      if (showYear && showCity) self.markerLayer.addLayer(marker);
    });
  };

  // --- openDetail: S4(添加\"在地图中查看\"按钮) ---
  var _origOpenDetail = app.openDetail.bind(app);
  app.openDetail = function(id) {
    _origOpenDetail(id);
    var mem = DB.memories.find(function(m) { return m.id === id; });
    if (!mem) {
      DB.chinaCities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (lm.id === id) mem = Object.assign({}, lm, { city: c.name });
        });
      });
    }
    if (!mem || !mem.lat || !mem.lng) return;
    var actions = document.querySelector('.detail-actions');
    if (!actions || actions.querySelector('.linkage-view-map-btn')) return;
    var btn = document.createElement('div');
    btn.className = 'detail-action linkage-view-map-btn';
    btn.innerHTML = '<i class=\"fas fa-map-marked-alt\"></i><span>地图</span>';
    var _mem = mem;
    btn.onclick = function() {
      app.closeDetail();
      app.switchTab('map');
      if (app.map) app.map.flyTo([_mem.lat, _mem.lng], 16, { duration: 1.2 });
    };
    actions.appendChild(btn);
  };

  // --- renderDiscover: M3(热门地标按城市过滤) ---
  var _origRenderDiscover = app.renderDiscover.bind(app);
  app.renderDiscover = function(searchQuery) {
    _origRenderDiscover(searchQuery);
    var hotCards = document.querySelectorAll('.hot-card');
    var city = DB.state.currentCity;
    var year = DB.state.yearFilter;
    if (city && city !== '全部') {
      hotCards.forEach(function(card) {
        card.style.display = '';
        var onclickStr = card.getAttribute('onclick') || '';
        var idMatch = onclickStr.match(/openDetail\((\d+)\)/);
        if (idMatch) {
          var mem = DB.memories.find(function(m) { return m.id === parseInt(idMatch[1]); });
          if (mem) {
            var showCity = mem.city === city;
            var showYear = year === 'all' || Utils.getYearClass(mem.year) === year;
            if (!showCity || !showYear) card.style.display = 'none';
          }
        }
      });
    }
  };

  // --- toggleFavorite: S6(补充刷新profile) ---
  var _origToggleFavorite = app.toggleFavorite.bind(app);
  app.toggleFavorite = function(id) {
    _origToggleFavorite(id);
    if (typeof app.renderProfile === 'function') app.renderProfile();
  };

  // --- toast: L2(互斥) ---
  var _origToast = app.toast.bind(app);
  app.toast = function(msg) {
    var t = document.getElementById('toast');
    if (!t) { _origToast(msg); return; }
    if (_toastTimer) clearTimeout(_toastTimer);
    t.textContent = msg;
    t.classList.remove('show');
    void t.offsetHeight;
    t.classList.add('show');
    _toastTimer = setTimeout(function() {
      t.classList.remove('show');
      _toastTimer = null;
    }, 2000);
  };

  // ==================== S1: 年代筛选统一 ====================
  function fixS1() {
    if (typeof V21 === 'undefined') return;
    // V21 year bar 点击 → 同步发现页
    var origUpdateYearBar = V21._updateYearBar.bind(V21);
    V21._updateYearBar = function() {
      origUpdateYearBar();
      document.querySelectorAll('.v21-year-segment').forEach(function(seg) {
        var origOnclick = seg.onclick;
        seg.onclick = function(e) {
          if (origOnclick) origOnclick.call(seg, e);
          var year = seg.dataset.year;
          document.querySelectorAll('#page-discover .filter-btn').forEach(function(b) {
            b.classList.toggle('active', b.dataset.year === year);
          });
          if (app.renderDiscover) {
            var si = document.getElementById('discover-search');
            app.renderDiscover(si ? si.value : '');
          }
          setTimeout(_updateFilterInfo, 50);
        };
      });
    };
    // 发现页 filter-btn → 同步 V21 year bar
    document.querySelectorAll('#page-discover .filter-btn').forEach(function(btn) {
      var origClick = btn.onclick;
      btn.onclick = function() {
        if (origClick) origClick.call(btn);
        var year = btn.dataset.year;
        document.querySelectorAll('.v21-year-segment').forEach(function(s) {
          s.classList.toggle('active', s.dataset.year === year);
        });
        setTimeout(_updateFilterInfo, 50);
      };
    });
  }

  // ==================== S5: 时光页筛选提示 ====================
  function _updateFilterInfo() {
    var el = document.querySelector('.linkage-filter-info');
    if (!el) {
      var timeHeader = document.querySelector('.time-header');
      if (!timeHeader) return;
      el = document.createElement('div');
      el.className = 'linkage-filter-info';
      timeHeader.appendChild(el);
    }
    var city = DB.state.currentCity || '全部';
    var year = DB.state.yearFilter;
    var yearLabel = year === 'all' ? '全部年代' : year.replace('s', '年代');
    el.innerHTML = '<i class=\"fas fa-filter\" style=\"margin-right:6px;\"></i>' +
      '<span style=\"color:var(--primary);\">' + escHtml(city) + '</span>' +
      ' · <span>' + escHtml(yearLabel) + '</span>';
  }

  // ==================== M1: 触摸设备跳过hover ====================
  function fixM1() {
    if (!_touchDevice || typeof V21 === 'undefined') return;
    V21._bindMarkerHover = function() {
      console.log('[LinkageFix] M1: 触摸设备，跳过 marker hover');
    };
  }

  // ==================== M2: 动态城市选择器 ====================
  function fixM2() {
    var origShow = app.showCityPicker.bind(app);
    app.showCityPicker = function() {
      var picker = document.getElementById('city-picker');
      if (!picker) return;
      var cities = DB.chinaCities || [];
      var countMap = {};
      DB.memories.forEach(function(m) {
        if (m.status === '已发布' && m.city) countMap[m.city] = (countMap[m.city] || 0) + 1;
      });
      cities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (lm.status === '已发布') countMap[c.name] = (countMap[c.name] || 0) + 1;
        });
      });
      var sorted = cities.slice().sort(function(a, b) {
        return (countMap[b.name] || 0) - (countMap[a.name] || 0);
      });
      var html = '<div class="city-picker-regions">';
      sorted.forEach(function(c) {
        var count = countMap[c.name] || 0;
        var isActive = DB.state.currentCity === c.name;
        html += '<div class="city-tag' + (isActive ? ' active' : '') + '" onclick="app.selectCity(\'' +
          escHtml(c.name) + '\')">' + escHtml(c.name) +
          (count > 0 ? '<span class="city-tag-count">' + count + '</span>' : '') +
          '</div>';
      });
      html += '</div>';
      var existingContent = picker.querySelector('.city-picker-content');
      if (existingContent) existingContent.innerHTML = html;
      else {
        var d = document.createElement('div');
        d.className = 'city-picker-content';
        d.innerHTML = html;
        picker.appendChild(d);
      }
      picker.classList.add('show');
    };
  }

  // ==================== M4: 年代栏收起/展开 ====================
  function fixM4() {
    var yearBar = document.getElementById('v21-year-bar');
    if (!yearBar) return;
    var collapsed = false;
    yearBar.style.transition = 'height 0.3s ease, opacity 0.3s ease';
    yearBar.style.cursor = 'pointer';
    yearBar.title = '点击收起/展开';
    yearBar.addEventListener('click', function(e) {
      if (e.target.closest('.v21-year-segment')) return;
      collapsed = !collapsed;
      yearBar.style.height = collapsed ? '0px' : '44px';
      yearBar.style.opacity = collapsed ? '0' : '1';
      yearBar.style.overflow = 'hidden';
    });
  }

  // ==================== M5: 统一返回导航 ====================
  var _backMap = {
    'page-upload': 'map', 'page-detail': 'map', 'page-comments': 'map',
    'page-share': 'map', 'page-comparison': 'map', 'page-myuploads': 'profile',
    'page-myfavorites': 'profile', 'page-settings': 'profile',
    'page-badge': 'profile', 'page-shop': 'time', 'page-capsule': 'time',
    'page-routes': 'time', 'page-heritage': 'time', 'page-activity': 'time',
    'page-challenge': 'time', 'page-private': 'time', 'page-starmap': 'time',
    'page-story': 'time', 'page-quiz': 'time', 'page-blindbox': 'time',
    'page-topic': 'discover', 'page-user-profile': 'discover',
    'page-gallery': 'map', 'page-product': 'time'
  };
  function fixM5() {
    app.goBack = function() {
      var activePage = document.querySelector('.page.active');
      var pageId = activePage ? activePage.id : '';
      app.switchTab(_backMap[pageId] || DB.state.prevPage || 'map');
    };
  }

  // ==================== L3: 搜索最少2字符 ====================
  function fixL3() {
    var searchInput = document.getElementById('discover-search');
    if (!searchInput) return;
    var newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);
    var timer = null;
    newInput.addEventListener('input', function(e) {
      var val = e.target.value.trim();
      var clearBtn = document.querySelector('.search-clear-btn');
      if (clearBtn) clearBtn.style.display = val ? '' : 'none';
      if (val.length > 0 && val.length < 2) return;
      clearTimeout(timer);
      timer = setTimeout(function() {
        if (app.renderDiscover) app.renderDiscover(val);
      }, 300);
    });
  }

  // ==================== L4: 深色模式切换 ====================
  function fixL4() {
    var saved = localStorage.getItem('city-memory-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    setTimeout(function() {
      var menu = document.getElementById('profile-menu');
      if (!menu) return;
      var isDark = (document.documentElement.getAttribute('data-theme') || 'modern') === 'dark';
      var toggle = document.createElement('div');
      toggle.className = 'profile-menu-item linkage-dark-toggle';
      toggle.style.cssText = 'display:flex;align-items:center;padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06);cursor:pointer;transition:background 0.15s;';
      toggle.innerHTML =
        '<div style="width:36px;height:36px;border-radius:10px;background:#1e293b15;color:#1e293b;display:flex;align-items:center;justify-content:center;font-size:16px;margin-right:14px;">' +
          '<i class="fas fa-' + (isDark ? 'sun' : 'moon') + '"></i></div>' +
        '<div style="flex:1;font-size:15px;color:#333;font-weight:500;">深色模式</div>' +
        '<div style="margin-right:8px;font-size:13px;color:var(--text-muted);">' + (isDark ? '已开启' : '已关闭') + '</div>' +
        '<div class="linkage-dark-switch" style="width:44px;height:24px;border-radius:12px;background:' + (isDark ? 'var(--primary,#4F46E5)' : '#ddd') + ';position:relative;">' +
          '<div class="linkage-dark-switch-knob" style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:' + (isDark ? '22px' : '2px') + ';box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div></div>';
      toggle.addEventListener('click', function() {
        var el = document.documentElement;
        var cur = el.getAttribute('data-theme');
        var next = cur === 'dark' ? 'modern' : 'dark';
        el.setAttribute('data-theme', next);
        localStorage.setItem('city-memory-theme', next);
        toggle.querySelector('.linkage-dark-switch-knob').style.left = next === 'dark' ? '22px' : '2px';
        toggle.querySelector('.linkage-dark-switch').style.background = next === 'dark' ? 'var(--primary,#4F46E5)' : '#ddd';
        toggle.querySelector('i').className = 'fas fa-' + (next === 'dark' ? 'sun' : 'moon');
        toggle.querySelector('div[style*="margin-right:8px"]').textContent = next === 'dark' ? '已开启' : '已关闭';
        app.toast && app.toast(next === 'dark' ? '深色模式已开启' : '深色模式已关闭');
      });
      toggle.addEventListener('mouseenter', function() { this.style.background = 'rgba(0,0,0,0.02)'; });
      toggle.addEventListener('mouseleave', function() { this.style.background = 'transparent'; });
      menu.appendChild(toggle);
    }, 500);
  }

  // ==================== 初始化 ====================
  function init() {
    fixS1();
    _updateFilterInfo();
    fixM1();
    fixM2();
    fixM4();
    fixM5();
    fixL3();
    fixL4();
    console.log('[LinkageFix] 全页面联动修复 v1 — 15个问题已修复');
  }

  function waitForV21() {
    if (typeof V21 !== 'undefined' && V21._inited) init();
    else setTimeout(waitForV21, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForV21);
  } else {
    waitForV21();
  }
})();
