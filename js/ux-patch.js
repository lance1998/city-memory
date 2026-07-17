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
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    });
    var citySelector = document.querySelector('.city-selector');
    if (citySelector) {
      citySelector.setAttribute('role', 'button');
      citySelector.setAttribute('tabindex', '0');
      citySelector.setAttribute('aria-label', '选择城市');
    }

    var locateBtn = document.querySelector('.map-locate-btn');
    if (locateBtn) {
      locateBtn.setAttribute('role', 'button');
      locateBtn.setAttribute('tabindex', '0');
      locateBtn.setAttribute('aria-label', '定位到当前位置');
    }

    var clearSearchBtn = document.querySelector('.search-clear-btn');
    if (clearSearchBtn) {
      clearSearchBtn.setAttribute('role', 'button');
      clearSearchBtn.setAttribute('tabindex', '0');
      clearSearchBtn.setAttribute('aria-label', '清除搜索');
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var el = document.activeElement;
      if (el && (el.getAttribute('role') === 'button' || el.getAttribute('role') === 'tab' || el.classList.contains('filter-btn') || el.classList.contains('map-locate-btn') || el.classList.contains('search-clear-btn') || el.classList.contains('detail-action'))) {
        e.preventDefault();
        el.click();
      }
    }
  });

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

      var actions = content.querySelectorAll('.detail-action');
      actions.forEach(function(action) {
        action.setAttribute('role', 'button');
        action.setAttribute('tabindex', '0');
        var icon = action.querySelector('i');
        var span = action.querySelector('span');
        if (icon && span) {
          var actionName = '';
          if (icon.classList.contains('fa-heart')) {
            actionName = action.classList.contains('active') ? '取消点赞' : '点赞';
          } else if (icon.classList.contains('fa-comment')) {
            actionName = '评论';
          } else if (icon.classList.contains('fa-star')) {
            actionName = action.classList.contains('active') ? '取消收藏' : '收藏';
          } else if (icon.classList.contains('fa-share-alt')) {
            actionName = '分享';
          } else if (icon.classList.contains('fa-images')) {
            actionName = '同框';
          }
          var countText = span.textContent.trim();
          if (countText && !isNaN(countText)) {
            action.setAttribute('aria-label', actionName + ', ' + countText);
          } else {
            action.setAttribute('aria-label', actionName);
          }
        }
      });
    }
  });
  var detailContent = document.getElementById('detail-content');
  if (detailContent) {
    contentObserver.observe(detailContent, { childList: true, subtree: true });
  }

  console.log('[UXPatch] v1 已加载 - 模态框动画 + closeDetail修复 + 无障碍支持 + 深色模式适配');
})();
