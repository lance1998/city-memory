// 城市微记忆 · 内容补全补丁 v1
// 为时光页和个人页填充内容
(function() {
  'use strict';

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  // ==================== 时光页内容 ====================
  var timeCards = [
    {
      icon: 'fa-hourglass-half',
      title: '时光胶囊',
      desc: '封存此刻的记忆，与未来对话',
      color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      action: function() { app.showToast && app.showToast('时光胶囊功能即将开放'); }
    },
    {
      icon: 'fa-route',
      title: '记忆路线',
      desc: '沿着城市脉络，重走历史轨迹',
      color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      action: function() { app.showToast && app.showToast('记忆路线功能即将开放'); }
    },
    {
      icon: 'fa-images',
      title: '老照片故事',
      desc: '一张老照片，一段城市往事',
      color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      action: function() { app.showToast && app.showToast('老照片功能即将开放'); }
    },
    {
      icon: 'fa-film',
      title: '年代影厅',
      desc: '重温经典影像，感受岁月变迁',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      action: function() { app.showToast && app.showToast('年代影厅功能即将开放'); }
    },
    {
      icon: 'fa-music',
      title: '城市民谣',
      desc: '一首歌，一座城，一种情怀',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: function() { app.showToast && app.showToast('城市民谣功能即将开放'); }
    },
    {
      icon: 'fa-calendar-alt',
      title: '历史今日',
      desc: '翻开城市历史上的今天',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: function() { app.showToast && app.showToast('历史今日功能即将开放'); }
    }
  ];

  function renderTimeGrid() {
    var container = document.getElementById('time-grid-container');
    if (!container) return;
    if (container.children.length > 0) return; // already rendered

    var html = timeCards.map(function(card, i) {
      return '<div class="time-card" data-index="' + i + '" style="' +
        'background: ' + escHtml(card.color) + ';' +
        'border-radius: 16px;' +
        'padding: 20px;' +
        'color: #fff;' +
        'cursor: pointer;' +
        'transition: transform 0.2s, box-shadow 0.2s;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.1);' +
        '">' +
        '<div style="font-size: 28px; margin-bottom: 12px; opacity: 0.95;">' +
          '<i class="fas ' + escHtml(card.icon) + '"></i>' +
        '</div>' +
        '<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">' + escHtml(card.title) + '</h3>' +
        '<p style="margin: 0; font-size: 13px; opacity: 0.9; line-height: 1.5;">' + escHtml(card.desc) + '</p>' +
      '</div>';
    }).join('');

    container.innerHTML = html;

    // Add click handlers
    Array.from(container.querySelectorAll('.time-card')).forEach(function(el, i) {
      el.addEventListener('click', function() {
        var card = timeCards[i];
        if (card && card.action) card.action();
      });
      // Hover effects via JS
      el.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      });
      el.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });
    });
  }

  // ==================== 个人页内容 ====================
  var menuItems = [
    { icon: 'fa-map-marker-alt', title: '我的记忆', badge: '3', color: '#ff6b6b' },
    { icon: 'fa-heart', title: '我的收藏', badge: '12', color: '#ff6b6b' },
    { icon: 'fa-history', title: '浏览历史', badge: '', color: '#4ecdc4' },
    { icon: 'fa-trophy', title: '记忆成就', badge: '5', color: '#ffd93d' },
    { icon: 'fa-bell', title: '消息通知', badge: '2', color: '#ff6b6b' },
    { icon: 'fa-cog', title: '设置', badge: '', color: '#95a5a6' },
    { icon: 'fa-question-circle', title: '帮助与反馈', badge: '', color: '#74b9ff' },
    { icon: 'fa-info-circle', title: '关于我们', badge: '', color: '#a29bfe' }
  ];

  function renderProfileMenu() {
    var container = document.getElementById('profile-menu');
    if (!container) return;
    if (container.children.length > 0) return; // already rendered

    var html = menuItems.map(function(item) {
      var badgeHtml = item.badge ?
        '<span style="' +
          'background: ' + escHtml(item.color) + ';' +
          'color: #fff;' +
          'font-size: 11px;' +
          'padding: 2px 8px;' +
          'border-radius: 10px;' +
          'margin-left: 8px;' +
          'min-width: 18px;' +
          'text-align: center;' +
          'display: inline-block;' +
        '">' + escHtml(item.badge) + '</span>' : '';

      return '<div class="profile-menu-item" style="' +
        'display: flex;' +
        'align-items: center;' +
        'padding: 14px 0;' +
        'border-bottom: 1px solid rgba(0,0,0,0.06);' +
        'cursor: pointer;' +
        'transition: background 0.15s;' +
        '" onmouseenter="this.style.background=\'rgba(0,0,0,0.02)\'" onmouseleave="this.style.background=\'transparent\'">' +
        '<div style="' +
          'width: 36px;' +
          'height: 36px;' +
          'border-radius: 10px;' +
          'background: ' + escHtml(item.color) + '15;' +
          'color: ' + escHtml(item.color) + ';' +
          'display: flex;' +
          'align-items: center;' +
          'justify-content: center;' +
          'font-size: 16px;' +
          'margin-right: 14px;' +
        '">' +
          '<i class="fas ' + escHtml(item.icon) + '"></i>' +
        '</div>' +
        '<div style="flex: 1; font-size: 15px; color: #333; font-weight: 500;">' +
          escHtml(item.title) + badgeHtml +
        '</div>' +
        '<div style="color: #bbb; font-size: 14px;">' +
          '<i class="fas fa-chevron-right"></i>' +
        '</div>' +
      '</div>';
    }).join('');

    container.innerHTML = html;

    // Add click handlers
    Array.from(container.querySelectorAll('.profile-menu-item')).forEach(function(el, i) {
      el.addEventListener('click', function() {
        var item = menuItems[i];
        app.showToast && app.showToast(item.title + '功能即将开放');
      });
    });
  }

  // ==================== 自动渲染 ====================
  renderTimeGrid();
  renderProfileMenu();

  // Also hook into page switching to render when pages become visible
  var _origSwitchTab = app.switchTab;
  if (_origSwitchTab) {
    app.switchTab = function(page) {
      _origSwitchTab.apply(this, arguments);
      if (page === 'time') {
        setTimeout(renderTimeGrid, 100);
      } else if (page === 'profile') {
        setTimeout(renderProfileMenu, 100);
      }
    };
  }

  // Expose for manual use
  app.renderTimeGrid = renderTimeGrid;
  app.renderProfileMenu = renderProfileMenu;

})();
