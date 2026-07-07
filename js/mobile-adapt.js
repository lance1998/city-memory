// 城市微记忆 · 移动端适配补丁
// 触摸交互优化、长按添加记忆引导、双指缩放保护、地图控件适配
(function() {
  'use strict';
  if (typeof app === 'undefined') return;

  // ===== 1. 长按添加记忆引导（首次使用提示） =====
  function showLongPressGuide() {
    if (localStorage.getItem('_longPressGuideShown')) return;

    var guide = document.createElement('div');
    guide.id = 'long-press-guide';
    guide.style.cssText = 'position:fixed;bottom:140px;left:50%;transform:translateX(-50%);' +
      'background:rgba(19,26,42,0.95);border:1px solid rgba(240,160,80,0.3);border-radius:14px;' +
      'padding:14px 20px;z-index:999;display:flex;align-items:center;gap:12px;' +
      'backdrop-filter:blur(8px);box-shadow:0 8px 32px rgba(0,0,0,0.3);max-width:90vw;';
    guide.innerHTML =
      '<div style="width:36px;height:36px;border-radius:50%;background:rgba(240,160,80,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
        '<i class="fas fa-hand-pointer" style="color:#f0a050;font-size:16px;"></i>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:14px;color:#e8ecf4;font-weight:600;">长按地图添加记忆</div>' +
        '<div style="font-size:12px;color:#7a8bb0;margin-top:2px;">在地图空白处长按 0.6 秒即可创建新地标</div>' +
      '</div>' +
      '<button onclick="this.parentElement.remove();localStorage.setItem(\'_longPressGuideShown\',\'1\');" ' +
        'style="background:none;border:none;color:#7a8bb0;font-size:16px;cursor:pointer;padding:4px;">&#10005;</button>';
    document.body.appendChild(guide);

    // Auto dismiss after 8 seconds
    setTimeout(function() {
      var el = document.getElementById('long-press-guide');
      if (el) {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '0';
        setTimeout(function() { el.remove(); }, 500);
      }
      localStorage.setItem('_longPressGuideShown', '1');
    }, 8000);
  }

  // ===== 2. 地图触摸优化 =====
  if (app.map) {
    var lastTapTime = 0;
    var lastTapLatlng = null;

    // Double-tap to zoom (prevent single-tap detail)
    app.map.on('click', function(e) {
      var now = Date.now();
      if (now - lastTapTime < 350 && lastTapLatlng &&
          Math.abs(e.latlng.lat - lastTapLatlng.lat) < 0.001 &&
          Math.abs(e.latlng.lng - lastTapLatlng.lng) < 0.001) {
        // Double tap - zoom in
        app.map.zoomIn();
      }
      lastTapTime = now;
      lastTapLatlng = e.latlng;
    });

    // Prevent map drag when touching bottom nav
    var bottomNav = document.querySelector('.bottom-tab-bar');
    if (bottomNav) {
      bottomNav.addEventListener('touchstart', function(e) {
        e.stopPropagation();
      }, { passive: true });
    }
  }

  // ===== 3. 触摸反馈增强 =====
  document.addEventListener('touchstart', function(e) {
    var target = e.target.closest('.tab-item, .filter-btn, .sort-btn, .city-selector');
    if (target) {
      target.style.transition = 'transform 0.1s ease';
      target.style.transform = 'scale(0.95)';
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    var target = e.target.closest('.tab-item, .filter-btn, .sort-btn, .city-selector');
    if (target) {
      setTimeout(function() { target.style.transform = ''; }, 100);
    }
  }, { passive: true });

  // ===== 4. 地图标记触摸优化 =====
  var _origOpenDetail = app.openDetail;
  if (_origOpenDetail) {
    app.openDetail = function(id, opts) {
      // On touch devices, add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      _origOpenDetail.call(this, id, opts);
    };
  }

  // ===== 5. Viewport height fix for mobile browsers =====
  function setViewportHeight() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      setViewportHeight();
      if (app.map) app.map.invalidateSize();
    }, 100);
  });

  // ===== 6. Safe area padding for notched phones =====
  function addSafeAreaPadding() {
    var style = document.createElement('style');
    style.textContent =
      '@supports(padding: max(0px)) {' +
        '.bottom-tab-bar { padding-bottom: max(8px, env(safe-area-inset-bottom)); }' +
        '.map-locate-btn { bottom: calc(20px + env(safe-area-inset-bottom)); }' +
        '#page-map { padding-top: env(safe-area-inset-top); }' +
      '}';
    document.head.appendChild(style);
  }
  addSafeAreaPadding();

  // ===== 7. Show long-press guide after map loads =====
  setTimeout(function() {
    if (app.map && app.markers && app.markers.length > 0) {
      showLongPressGuide();
    }
  }, 3000);

  console.log('[MobileAdapt] v1 已加载 - 触摸优化 + 长按引导 + 安全区域适配');
})();
