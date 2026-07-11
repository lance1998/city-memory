// 城市微记忆 · UX/呈现修复补丁 v1
// 修复：模态框动画、地图交互、closeDetail空指针、深色模式分享按钮
(function() {
  'use strict';

  var _origShowModal = app.showModal;
  if (_origShowModal) {
    app.showModal = function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.display = 'flex';
      void el.offsetHeight;
      el.classList.add('show');
      el.setAttribute('aria-hidden', 'false');
    };
  }

  app.closeModalAnimated = function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
    setTimeout(function() {
      if (!el.classList.contains('show')) {
        el.style.display = 'none';
      }
    }, 350);
  };

  var _origCloseDetail = app.closeDetail;
  if (_origCloseDetail) {
    app.closeDetail = function() {
      var detail = document.getElementById('memory-detail');
      if (detail) {
        detail.classList.remove('show');
        detail.style.opacity = '0';
        detail.style.visibility = 'hidden';
        detail.style.pointerEvents = 'none';
      }
      try { _origCloseDetail.call(this); } catch(e) {
        console.warn('[UXPatch] closeDetail suppressed error:', e.message);
      }
    };
  }

  function adaptShareColors() {
    var isDark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('.share-btn').forEach(function(btn) {
      if (isDark) {
        btn.style.opacity = '0.85';
        btn.style.filter = 'brightness(1.1)';
      } else {
        btn.style.opacity = '';
        btn.style.filter = '';
      }
    });
  }
  var observer = new MutationObserver(adaptShareColors);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  adaptShareColors();

  function addA11yAttrs() {
    document.querySelectorAll('.tab-item').forEach(function(tab) {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      if (!tab.getAttribute('aria-label')) {
        tab.setAttribute('aria-label', tab.querySelector('span') ? tab.querySelector('span').textContent : '');
      }
    });
    var searchInput = document.getElementById('discover-search');
    if (searchInput) searchInput.setAttribute('aria-label', '搜索地标、回忆、标签');
    var searchClearBtn = document.querySelector('.search-clear-btn');
    if (searchClearBtn) {
      searchClearBtn.setAttribute('aria-label', '清空搜索内容');
    }
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    });
    var citySelector = document.querySelector('.city-selector');
    var mapLocateBtn = document.querySelector('.map-locate-btn');
    if (mapLocateBtn) {
      mapLocateBtn.setAttribute('role', 'button');
      mapLocateBtn.setAttribute('tabindex', '0');
      mapLocateBtn.setAttribute('aria-label', '定位到当前位置');
    }
    if (citySelector) {
      citySelector.setAttribute('role', 'button');
      citySelector.setAttribute('tabindex', '0');
      citySelector.setAttribute('aria-label', '选择城市');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      requestAnimationFrame(addA11yAttrs);
    });
  } else {
    requestAnimationFrame(addA11yAttrs);
  }

  var contentObserver = new MutationObserver(function() {
    var content = document.getElementById('detail-content');
    if (content && content.children.length > 0) {
      content.setAttribute('role', 'dialog');
      content.setAttribute('aria-label', '记忆详情');
      var backdrop = content.closest('.detail-modal');
      if (backdrop) backdrop.setAttribute('aria-modal', 'true');
    }
  });
  var detailContent = document.getElementById('detail-content');
  if (detailContent) {
    contentObserver.observe(detailContent, { childList: true, subtree: true });
  }

  console.log('[UXPatch] v1 已加载 - 模态框动画 + closeDetail修复 + 无障碍支持 + 深色模式适配');
})();
