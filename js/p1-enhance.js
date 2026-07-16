/**
 * 城市微记忆 P1 · 交互增强层补丁
 * P1-1 详情面板 | P1-2 瀑布流 | P1-3 上传
 * P1-4 互动反馈 | P1-5 地图交互 | P1-6 动画系统
 *
 * 架构：patch 链最末端（在 p0-enhance.js 之后）
 */
(function() {
  'use strict';
  if (typeof app === 'undefined' || typeof DB === 'undefined') return;

  var esc = function(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
  };

  // ==================== P1-6: 动画过渡系统 ====================
  function initAnimationSystem() {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      var mutObs = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.classList && node.classList.contains('p1-reveal')) revealObserver.observe(node);
              (node.querySelectorAll || function() { return []; }).call(node, '.p1-reveal').forEach(function(el) { revealObserver.observe(el); });
            }
          });
        });
      });
      mutObs.observe(document.body, { childList: true, subtree: true });
      var dc = document.getElementById('discover-waterfall');
      if (dc) dc.classList.add('p1-waterfall-stagger');
    }
    var origSwitchTab = app.switchTab ? app.switchTab.bind(app) : null;
    if (origSwitchTab) {
      app.switchTab = function(page) {
        document.querySelectorAll('.page').forEach(function(p) {
          if (p.classList.contains('active') && p !== document.querySelector('#page-' + page)) {
            p.classList.add('page-leave');
            setTimeout(function() { p.classList.remove('page-leave'); }, 250);
          }
        });
        origSwitchTab(page);
        var np = document.getElementById('page-' + page);
        if (np) { np.classList.add('page-enter'); setTimeout(function() { np.classList.remove('page-enter'); }, 350); }
      };
    }
    console.log('[P1-6] 动画过渡系统已初始化');
  }

  // ==================== P1-1: 详情面板重构 ====================
  function initDetailEnhance() {
    var prevOpenDetail = app.openDetail.bind(app);
    app.openDetail = function(id) {
      var dc = document.getElementById('detail-content');
      if (dc) {
        dc.innerHTML = '<div class="p1-detail-skeleton"><div class="p1-skeleton-block p1-skeleton-img"></div><div class="p1-skeleton-block p1-skeleton-title"></div><div class="p1-skeleton-block p1-skeleton-meta"></div><div class="p1-skeleton-block p1-skeleton-story"></div><div class="p1-skeleton-block p1-skeleton-story"></div><div class="p1-skeleton-block p1-skeleton-story"></div><div class="p1-skeleton-actions"><div class="p1-skeleton-block p1-skeleton-action"></div><div class="p1-skeleton-block p1-skeleton-action"></div><div class="p1-skeleton-block p1-skeleton-action"></div></div></div>';
      }
      setTimeout(function() { prevOpenDetail(id); enhanceDetailPanel(id); }, 80);
    };

    function enhanceDetailPanel(id) {
      var dc = document.getElementById('detail-content');
      if (!dc) return;
      dc.classList.add('p1-detail-animate');
      enhanceGallery(dc, id);
    }

    function enhanceGallery(dc, id) {
      var mem = DB.memories.find(function(m) { return String(m.id) === String(id); });
      if (!mem) { DB.chinaCities.forEach(function(c) { (c.landmarks || []).forEach(function(lm) { if (String(lm.id) === String(id)) mem = Object.assign({}, lm, { city: c.name }); }); }); }
      if (!mem) return;
      var allImages = [];
      (mem.oldImages || []).forEach(function(s) { allImages.push({ src: s, type: 'old' }); });
      if (Array.isArray(mem.newImages) && mem.newImages.length > 0) mem.newImages.forEach(function(s) { allImages.push({ src: s, type: 'new' }); });
      else if (mem.newImage) allImages.push({ src: mem.newImage, type: 'new' });
      if (allImages.length < 2) return;
      var el = dc.querySelector('.p0-compare-wrap') || dc.querySelector('.compare-container') || dc.querySelector('#compare-placeholder');
      if (!el) return;
      var th = '';
      allImages.forEach(function(img, idx) { th += '<div class="p1-gallery-thumb' + (idx === 0 ? ' active' : '') + '" data-idx="' + idx + '"><img src="' + esc(img.src) + '"></div>'; });
      var g = '<div class="p1-gallery"><div class="p1-gallery-main"><img id="p1-gallery-img" src="' + esc(allImages[0].src) + '"><span class="p1-gallery-counter" id="p1-gallery-counter">1 / ' + allImages.length + '</span><div class="p1-gallery-nav p1-gallery-nav-prev" id="p1-gallery-prev"><i class="fas fa-chevron-left"></i></div><div class="p1-gallery-nav p1-gallery-nav-next" id="p1-gallery-next"><i class="fas fa-chevron-right"></i></div></div><div class="p1-gallery-thumbs" id="p1-gallery-thumbs">' + th + '</div></div>';
      var tmp = document.createElement('div'); tmp.innerHTML = g; var gallery = tmp.firstElementChild; el.parentNode.replaceChild(gallery, el);
      var ci = 0, mi = document.getElementById('p1-gallery-img'), ct = document.getElementById('p1-gallery-counter'), tbs = document.getElementById('p1-gallery-thumbs');
      function show(idx) {
        idx = Math.max(0, Math.min(allImages.length - 1, idx)); ci = idx; mi.style.opacity = '0';
        setTimeout(function() { mi.src = allImages[idx].src; mi.style.opacity = '1'; }, 150);
        ct.textContent = (idx + 1) + ' / ' + allImages.length;
        tbs.querySelectorAll('.p1-gallery-thumb').forEach(function(t, i) { t.classList.toggle('active', i === idx); });
      }
      var pb = document.getElementById('p1-gallery-prev'), nb = document.getElementById('p1-gallery-next');
      if (pb) pb.onclick = function() { show(ci - 1); };
      if (nb) nb.onclick = function() { show(ci + 1); };
      tbs.querySelectorAll('.p1-gallery-thumb').forEach(function(t) { t.addEventListener('click', function() { show(parseInt(t.dataset.idx)); }); });
      var sx = 0, gm = gallery.querySelector('.p1-gallery-main');
      if (gm) { gm.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; }, { passive: true }); gm.addEventListener('touchend', function(e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(ci + (dx < 0 ? 1 : -1)); }, { passive: true }); }
    }
    console.log('[P1-1] 详情面板增强已初始化');
  }

  // ==================== P1-2: 瀑布流增强 ====================
  function initWaterfallEnhance() {
    var prev = app.renderDiscover ? app.renderDiscover.bind(app) : null;
    if (!prev) return;
    app.renderDiscover = function(query) {
      var wf = document.getElementById('discover-waterfall');
      if (wf) { wf.classList.add('p1-waterfall-stagger'); var sh = ''; for (var i = 0; i < 4; i++) sh += '<div class="p1-card-skeleton"><div class="p1-skeleton-block p1-card-skeleton-img"></div><div class="p1-card-skeleton-info"><div class="p1-skeleton-block p1-card-skeleton-title"></div><div class="p1-skeleton-block p1-card-skeleton-desc"></div></div></div>'; wf.innerHTML = sh; }
      setTimeout(function() {
        prev(query);
        if (wf) { var cards = wf.querySelectorAll('.waterfall-card'); if (cards.length === 0) { wf.innerHTML = '<div class="p1-empty-state"><div class="p1-empty-icon"><i class="fas fa-search"></i></div><div class="p1-empty-title">暂无记忆</div><div class="p1-empty-desc">换个关键词试试？</div></div>'; } else { cards.forEach(function(c, idx) { setTimeout(function() { c.classList.add('card-visible'); }, 60 * idx); }); } }
      }, 100);
    };
    console.log('[P1-2] 瀑布流增强已初始化');
  }

  // ==================== P1-4: 互动反馈升级 ====================
  function initInteractionFeedback() {
    var origLike = app.toggleLike ? app.toggleLike.bind(app) : null;
    if (origLike) {
      app.toggleLike = function(id) {
        var el = document.querySelector('.detail-action[onclick*="toggleLike"]') || document.querySelector('.detail-action:first-child');
        if (el) { var ic = el.querySelector('i'); if (ic) { ic.classList.add('p1-heart-beat'); setTimeout(function() { ic.classList.remove('p1-heart-beat'); }, 400); } burstParticles(el); }
        origLike(id);
        var sp = el ? el.querySelector('span') : null; if (sp) { sp.classList.add('p1-count-bump'); setTimeout(function() { sp.classList.remove('p1-count-bump'); }, 300); }
      };
    }
    var origFav = app.toggleFavorite ? app.toggleFavorite.bind(app) : null;
    if (origFav) {
      app.toggleFavorite = function(id) {
        var el = document.querySelector('.detail-action[onclick*="toggleFavorite"]') || document.querySelectorAll('.detail-action')[2];
        if (el) { el.classList.add('p1-star-burst'); var ic = el.querySelector('i'); if (ic) { ic.classList.add('p1-heart-beat'); setTimeout(function() { ic.classList.remove('p1-heart-beat'); el.classList.remove('p1-star-burst'); }, 500); } }
        origFav(id);
      };
    }
    var co = new MutationObserver(function(muts) { muts.forEach(function(m) { m.addedNodes.forEach(function(n) { if (n.nodeType === 1 && n.classList.contains('p0-comment-item')) n.classList.add('p1-comment-enter'); }); }); });
    var dc = document.getElementById('detail-content'); if (dc) co.observe(dc, { childList: true, subtree: true });
    console.log('[P1-4] 互动反馈已升级');
  }

  function burstParticles(anchor) {
    var c = document.createElement('div'); c.className = 'p1-like-burst';
    var emojis = ['\u2764', '\uD83D\uDC4D', '\u2728', '\uD83D\uDCAB', '\uD83D\uDD25'];
    var r = anchor.getBoundingClientRect(); c.style.left = r.left + r.width / 2 + 'px'; c.style.top = r.top + 'px';
    for (var i = 0; i < 6; i++) {
      var p = document.createElement('span'); p.className = 'p1-like-particle'; p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      var a = (Math.PI * 2 / 6) * i - Math.PI / 2, d = 30 + Math.random() * 20;
      p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px'); c.appendChild(p);
    }
    document.body.appendChild(c); setTimeout(function() { c.remove(); }, 700);
  }

  // ==================== P1-5: 地图交互增强 ====================
  function initMapEnhance() {
    if (!app.map || !app.markerLayer) return;
    var mdm = {};
    function collect() { if (!app.markerLayer) return; app.markerLayer.eachLayer(function(l) { if (l._memId) { var mem = DB.memories.find(function(m) { return String(m.id) === String(l._memId); }); if (!mem) DB.chinaCities.forEach(function(c) { (c.landmarks || []).forEach(function(lm) { if (String(lm.id) === String(l._memId)) mem = Object.assign({}, lm, { city: c.name }); }); }); if (mem) mdm[l._memId] = mem; } }); }
    var origAdd = app.addMapMarkers ? app.addMapMarkers.bind(app) : null;
    if (origAdd) { app.addMapMarkers = function() { origAdd(); setTimeout(collect, 200); }; }
    console.log('[P1-5] 地图交互增强已初始化');
  }

  // ==================== P1-3: 上传增强 ====================
  function initUploadEnhance() { setTimeout(function() {
    document.querySelectorAll('form').forEach(function(form) {
      var inputs = form.querySelectorAll('input[required], textarea[required]');
      inputs.forEach(function(inp) { inp.addEventListener('blur', function() { vf(inp); }); inp.addEventListener('input', function() { if (inp.parentNode.classList.contains('error')) vf(inp); }); });
      form.addEventListener('submit', function(e) { var ok = true; inputs.forEach(function(inp) { if (!vf(inp)) ok = false; }); if (!ok) { e.preventDefault(); e.stopPropagation(); app.toast && app.toast('请完善表单信息'); } else { var btn = form.querySelector('button[type="submit"]'); if (btn) { btn.classList.add('p1-submit-loading'); setTimeout(function() { btn.classList.remove('p1-submit-loading'); }, 2000); } } }, true);
    });
  }, 2000); }
  function vf(inp) { var w = inp.closest('.p1-field-wrap') || inp.parentNode, v = inp.value.trim(), ok = true; if (inp.required && !v) ok = false; if (inp.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false; if (inp.minLength && v.length < inp.minLength) ok = false; w.classList.remove('error', 'success'); if (!v && !inp.required) {} else w.classList.add(ok ? 'success' : 'error'); var h = w.querySelector('.p1-field-hint'); if (!ok) { if (!h) { h = document.createElement('span'); h.className = 'p1-field-hint error'; h.innerHTML = '<i class="fas fa-exclamation-circle"></i>'; w.appendChild(h); } } else { if (h) h.remove(); } return ok; }

  // ==================== 初始化 ====================
  function init() { initAnimationSystem(); initDetailEnhance(); initWaterfallEnhance(); initInteractionFeedback(); initUploadEnhance(); initMapEnhance(); console.log('[P1] 交互增强层补丁已加载 — 6 个模块全部就绪'); }
  function waitForApp() { if (typeof app !== 'undefined' && app.map && app.markerLayer) init(); else setTimeout(waitForApp, 400); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForApp); else waitForApp();
})();
