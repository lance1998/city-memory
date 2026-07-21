/**
 * 城市微记忆 P2 · 进阶体验增强补丁
 * P2-1 主题面板 | P2-2 地图聚合 | P2-3 个人资料
 * P2-4 性能优化 | P2-5 无障碍 | P2-6 消息中心
 *
 * 架构：patch 链最末端（在 p1-enhance.js 之后）
 */
(function() {
  'use strict';
  if (typeof app === 'undefined' || typeof DB === 'undefined') return;

  var esc = function(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // ==================== P2-1: 主题选择面板 ====================
  function initThemePanel() {
    var themes = [
      { key: 'modern', name: '现代简约', desc: '清爽干净的界面风格', colors: ['#F8FAFC','#E2E8F0','#4F46E5'] },
      { key: 'dark', name: '深色模式', desc: '护眼暗色，适合夜间使用', colors: ['#1E293B','#334155','#818CF8'] },
      { key: '', name: '复古怀旧', desc: '温暖怀旧的城市记忆色调', colors: ['#F5F0E8','#E8DFD0','#C75B39'] },
      { key: 'auto', name: '跟随系统', desc: '自动匹配设备外观设置', colors: ['#94A3B8','#64748B','#6366F1'] }
    ];

    var backdrop = document.createElement('div');
    backdrop.className = 'p2-theme-backdrop';
    document.body.appendChild(backdrop);

    var sheet = document.createElement('div');
    sheet.className = 'p2-theme-sheet';
    var html = '<div class="p2-theme-handle"></div>' +
      '<div class="p2-theme-title">选择主题</div>' +
      '<div class="p2-theme-options">';
    themes.forEach(function(t) {
      var swatchBg = 'linear-gradient(135deg, ' + t.colors.join(', ') + ')';
      html += '<div class="p2-theme-opt" data-theme="' + t.key + '">' +
        '<div class="p2-theme-swatch"><div class="p2-theme-swatch-inner" style="background:' + swatchBg + '"></div></div>' +
        '<div class="p2-theme-opt-label"><div class="p2-theme-opt-name">' + esc(t.name) + '</div>' +
        '<div class="p2-theme-opt-desc">' + esc(t.desc) + '</div></div>' +
        '<div class="p2-theme-check"><i class="fas fa-check"></i></div>' +
      '</div>';
    });
    html += '</div>';
    sheet.innerHTML = html;
    document.body.appendChild(sheet);

    function getCurrentTheme() {
      var saved = localStorage.getItem('city-memory-theme');
      if (saved === 'auto') return 'auto';
      if (saved) return saved;
      var el = document.documentElement;
      var dt = el.getAttribute('data-theme');
      return dt || 'modern';
    }

    function setTheme(key) {
      document.documentElement.classList.add('p2-theme-transitioning');
      if (key === 'auto') {
        localStorage.setItem('city-memory-theme', 'auto');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'modern');
      } else {
        localStorage.setItem('city-memory-theme', key);
        document.documentElement.setAttribute('data-theme', key || 'modern');
        if (app.setTheme) app.setTheme(key || 'modern');
      }
      updateActive(key);
      app.toast && app.toast('主题已切换');
      setTimeout(function() {
        document.documentElement.classList.remove('p2-theme-transitioning');
      }, 400);
    }

    function updateActive(key) {
      sheet.querySelectorAll('.p2-theme-opt').forEach(function(opt) {
        opt.classList.toggle('active', opt.dataset.theme === key);
      });
    }

    function openPanel() {
      updateActive(getCurrentTheme());
      backdrop.classList.add('show');
      sheet.classList.add('show');
    }
    function closePanel() {
      backdrop.classList.remove('show');
      sheet.classList.remove('show');
    }

    backdrop.addEventListener('click', closePanel);
    sheet.querySelectorAll('.p2-theme-opt').forEach(function(opt) {
      opt.addEventListener('click', function() {
        setTheme(opt.dataset.theme);
        setTimeout(closePanel, 200);
      });
    });

    if (app.showThemePicker) {
      var origShow = app.showThemePicker.bind(app);
      app.showThemePicker = function() {
        openPanel();
        origShow();
      };
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      var saved = localStorage.getItem('city-memory-theme');
      if (saved === 'auto') {
        document.documentElement.classList.add('p2-theme-transitioning');
        document.documentElement.setAttribute('data-theme', this.matches ? 'dark' : 'modern');
        setTimeout(function() {
          document.documentElement.classList.remove('p2-theme-transitioning');
        }, 400);
      }
    });

    var initTheme = localStorage.getItem('city-memory-theme');
    if (initTheme === 'auto') {
      var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'modern');
    }

    console.log('[P2-1] 主题选择面板已初始化');
  }

  // ==================== P2-2: 地图聚合与弹窗 ====================
  function initMapCluster() {
    if (!app.map || !app.markerLayer) return;
    var clusterLayer = L.layerGroup().addTo(app.map);
    var _clusterMarkers = [];
    var _origMarkers = [];
    var THRESHOLD_ZOOM = 13;
    var PIXEL_THRESHOLD = 40;

    var memoryMapCache = null;
    function getMemById(id) {
      if (!memoryMapCache) {
        memoryMapCache = new Map();
        DB.memories.forEach(function(m) { memoryMapCache.set(String(m.id), m); });
        DB.chinaCities.forEach(function(c) {
          (c.landmarks || []).forEach(function(lm) {
            if (!memoryMapCache.has(String(lm.id))) memoryMapCache.set(String(lm.id), Object.assign({}, lm, { city: c.name }));
          });
        });
      }
      return memoryMapCache.get(String(id)) || null;
    }

    function getThumb(mem) {
      var imgs = mem.newImages || [];
      if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
      if (mem.newImage) return mem.newImage;
      var olds = mem.oldImages || [];
      if (olds.length > 0) return olds[0];
      return '';
    }

    function buildPopup(mem) {
      var thumb = getThumb(mem);
      var html = '<div class="p2-popup-card">' +
        '<div class="p2-popup-close" onclick="this.closest(\'.p2-popup-card\').remove()"><i class="fas fa-times"></i></div>';
      if (thumb) html += '<img class="p2-popup-img" src="' + esc(thumb) + '" alt="" loading="lazy">';
      html += '<div class="p2-popup-body">' +
        '<div class="p2-popup-title">' + esc(mem.title) + '</div>' +
        '<div class="p2-popup-meta">' +
          '<span><i class="fas fa-map-marker-alt"></i> ' + esc(mem.city || '') + '</span>' +
          '<span><i class="fas fa-calendar"></i> ' + esc(mem.year || '') + '</span>' +
        '</div>' +
        '<div class="p2-popup-actions">' +
          '<div class="p2-popup-btn p2-popup-btn-primary" onclick="app.openDetail(' + mem.id + ')">查看详情</div>' +
          '<div class="p2-popup-btn p2-popup-btn-secondary" onclick="app.switchTab(\'discover\')">去发现</div>' +
        '</div></div></div>';
      return html;
    }

    function clusterMarkers() {
      clusterLayer.clearLayers();
      _clusterMarkers = [];
      if (!app.markerLayer) return;

      var zoom = app.map.getZoom();
      if (zoom >= THRESHOLD_ZOOM) {
        app.markerLayer.eachLayer(function(layer) {
          if (!layer.getLatLng || !layer._memId) return;
          layer.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            var mem = getMemById(layer._memId);
            if (!mem) return;
            var latlng = layer.getLatLng();
            var popup = L.popup({ closeButton: false, className: '', maxWidth: 230, offset: [0, -10] })
              .setLatLng(latlng)
              .setContent(buildPopup(mem))
              .openOn(app.map);
          });
        });
        return;
      }

      var points = [];
      app.markerLayer.eachLayer(function(layer) {
        if (!layer.getLatLng || !layer._memId) return;
        var pos = app.map.latLngToContainerPoint(layer.getLatLng());
        points.push({ layer: layer, memId: layer._memId, pos: pos });
      });

      var grouped = [];
      var used = {};
      points.forEach(function(p, i) {
        if (used[i]) return;
        var group = [p];
        used[i] = true;
        points.forEach(function(q, j) {
          if (used[j] || i === j) return;
          var dx = p.pos.x - q.pos.x;
          var dy = p.pos.y - q.pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < PIXEL_THRESHOLD) {
            group.push(q);
            used[j] = true;
          }
        });
        grouped.push(group);
      });

      app.markerLayer.eachLayer(function(layer) {
        if (layer._memId) {
          if (!layer._origOpacity) layer._origOpacity = layer.options && layer.options.opacity !== undefined ? layer.options.opacity : 1;
          layer.setOpacity(0.15);
        }
      });

      grouped.forEach(function(group) {
        if (group.length === 1) return;
        var latlngs = group.map(function(g) { return g.layer.getLatLng(); });
        var centerLat = latlngs.reduce(function(s, l) { return s + l.lat; }, 0) / latlngs.length;
        var centerLng = latlngs.reduce(function(s, l) { return s + l.lng; }, 0) / latlngs.length;
        var icon = L.divIcon({
          className: '',
          html: '<div class="p2-cluster">' + group.length + '</div>',
          iconSize: [32, 32], iconAnchor: [16, 16]
        });
        var marker = L.marker([centerLat, centerLng], { icon: icon });
        marker.on('click', function() {
          app.map.flyTo([centerLat, centerLng], THRESHOLD_ZOOM, { duration: 0.5 });
        });
        clusterLayer.addLayer(marker);
        _clusterMarkers.push(marker);
      });

      grouped.forEach(function(group) {
        if (group.length > 1) return;
        var layer = group[0].layer;
        var mem = getMemById(group[0].memId);
        if (!mem) return;
        layer.setOpacity(1);
        layer.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          var latlng = layer.getLatLng();
          L.popup({ closeButton: false, className: '', maxWidth: 230, offset: [0, -10] })
            .setLatLng(latlng)
            .setContent(buildPopup(mem))
            .openOn(app.map);
        });
      });
    }

    var origAdd = app.addMapMarkers ? app.addMapMarkers.bind(app) : null;
    if (origAdd) {
      app.addMapMarkers = function() {
        origAdd();
        setTimeout(function() {
          clusterMarkers();
        }, 300);
      };
    }

    app.map.on('zoomend', function() {
      app.markerLayer.eachLayer(function(layer) {
        if (layer._memId && layer._origOpacity !== undefined) {
          layer.setOpacity(layer._origOpacity);
        }
      });
      setTimeout(clusterMarkers, 100);
    });

    app.map.on('click', function() {
      app.map.closePopup();
    });

    console.log('[P2-2] 地图聚合与弹窗已初始化');
  }

  // ==================== P2-3: 个人资料增强 ====================
  function initProfileEnhance() {
    if (!app.renderProfile) return;
    var origRender = app.renderProfile.bind(app);

    app.renderProfile = function() {
      origRender();

      var page = document.getElementById('page-profile');
      if (!page) return;

      var header = page.querySelector('.profile-header');
      if (header && !header.querySelector('.p2-profile-banner')) {
        var banner = document.createElement('div');
        banner.className = 'p2-profile-banner';
        header.insertBefore(banner, header.firstChild);
      }

      var user = DB.currentUser || {};
      var memCount = user.memoryCount || DB.memories.filter(function(m) { return m.status === '已发布'; }).length;
      var likeCount = user.likeCount || 0;
      var cityCount = 0;
      if (Array.isArray(user.exploredCities)) {
        cityCount = user.exploredCities.length;
      } else if (typeof user.exploredCities === 'number' && user.exploredCities > 0) {
        cityCount = user.exploredCities;
      }

      var statsArea = page.querySelector('.profile-info');
      if (statsArea && !page.querySelector('.p2-profile-stats')) {
        var statsDiv = document.createElement('div');
        statsDiv.className = 'p2-profile-stats';
        statsDiv.innerHTML =
          '<div class="p2-stat-item"><div class="p2-stat-num">' + memCount + '</div><div class="p2-stat-label">记忆</div></div>' +
          '<div class="p2-stat-item"><div class="p2-stat-num">' + likeCount + '</div><div class="p2-stat-label">获赞</div></div>' +
          '<div class="p2-stat-item"><div class="p2-stat-num">' + cityCount + '</div><div class="p2-stat-label">城市</div></div>';
        statsArea.parentNode.insertBefore(statsDiv, statsArea.nextSibling);
      }

      var menu = page.querySelector('.profile-menu');
      if (menu && !page.querySelector('.p2-level-bar')) {
        var vipLevel = user.vipLevel || 1;
        var expCurrent = memCount * 10 + likeCount;
        while (vipLevel < 99 && expCurrent >= vipLevel * 100) {
          expCurrent -= vipLevel * 100;
          vipLevel++;
        }
        var expNext = vipLevel * 100;
        var pct = Math.min(100, Math.round((expCurrent / expNext) * 100));
        var levelNames = ['新手记忆者', '城市探索者', '记忆达人', '城市故事家', '传奇记录者'];
        var levelName = levelNames[Math.min(vipLevel - 1, levelNames.length - 1)] || 'Lv.' + vipLevel;

        var levelDiv = document.createElement('div');
        levelDiv.className = 'p2-level-bar';
        levelDiv.innerHTML =
          '<div class="p2-level-info"><span class="p2-level-name">' + esc(levelName) + '</span>' +
          '<span class="p2-level-exp">Lv.' + vipLevel + ' · ' + expCurrent + '/' + expNext + ' EXP</span></div>' +
          '<div class="p2-level-track"><div class="p2-level-fill" style="width:0%"></div></div>';
        menu.parentNode.insertBefore(levelDiv, menu);
        setTimeout(function() {
          levelDiv.querySelector('.p2-level-fill').style.width = pct + '%';
        }, 200);
      }

      var badges = DB.badges || [];
      var badgeGrid = page.querySelector('#badge-grid');
      if (!badgeGrid && menu) {
        var badgeSection = document.createElement('div');
        badgeSection.className = 'p2-menu-section';
        badgeSection.innerHTML = '<div class="p2-menu-section-title">成就勋章</div>';
        var wall = document.createElement('div');
        wall.className = 'p2-badge-wall';
        badges.forEach(function(b) {
          var iconHtml = '';
          if (b.icon && b.icon.indexOf('fa-') === 0) {
            iconHtml = '<i class="fas ' + esc(b.icon) + '"></i>';
          } else if (b.icon) {
            iconHtml = esc(b.icon);
          } else {
            iconHtml = '🏆';
          }
          wall.innerHTML += '<div class="p2-badge-item' + (b.unlocked ? '' : ' locked') + '">' +
            '<div class="p2-badge-icon">' + iconHtml + '</div>' +
            '<div class="p2-badge-name">' + esc(b.name || '') + '</div>' +
            (!b.unlocked ? '<div class="p2-badge-lock"><i class="fas fa-lock"></i></div>' : '') +
          '</div>';
        });
        badgeSection.appendChild(wall);
        menu.insertBefore(badgeSection, menu.firstChild);
      }
    };

    console.log('[P2-3] 个人资料增强已初始化');
  }

  // ==================== P2-4: 性能优化 ====================
  function initPerformance() {
    if ('IntersectionObserver' in window) {
      var imgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });

      var mutObs = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              var imgs = node.querySelectorAll ? node.querySelectorAll('img[src]') : [];
              imgs.forEach(function(img) {
                if (img.src && !img.hasAttribute('loading')) {
                  img.setAttribute('loading', 'lazy');
                }
              });
              if (node.tagName === 'IMG' && node.dataset.src) {
                imgObserver.observe(node);
              }
              if (node.querySelectorAll) {
                node.querySelectorAll('img[data-src]').forEach(function(img) {
                  imgObserver.observe(img);
                });
              }
            }
          });
        });
      });
      mutObs.observe(document.body, { childList: true, subtree: true });

      document.querySelectorAll('img[src]').forEach(function(img) {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
    }

    var PAGE_SIZE = 20;
    var _currentPage = 0;
    var _allFiltered = [];

    var origRender = app.renderDiscover ? app.renderDiscover.bind(app) : null;
    if (origRender) {
      app.renderDiscover = function(query) {
        _currentPage = 0;
        origRender(query);
        var waterfall = document.getElementById('discover-waterfall');
        if (!waterfall) return;

        setTimeout(function() {
          var cards = waterfall.querySelectorAll('.waterfall-card');
          if (cards.length <= PAGE_SIZE) return;

          for (var i = PAGE_SIZE; i < cards.length; i++) {
            cards[i].style.display = 'none';
            cards[i].classList.remove('card-visible');
          }

          if (!waterfall.querySelector('.p2-load-more')) {
            var loadMoreDiv = document.createElement('div');
            loadMoreDiv.className = 'p2-load-more';
            loadMoreDiv.innerHTML = '<button class="p2-load-more-btn"><i class="fas fa-chevron-down"></i> 加载更多</button>';
            loadMoreDiv.querySelector('.p2-load-more-btn').addEventListener('click', function() {
              var hidden = waterfall.querySelectorAll('.waterfall-card[style*=\"display: none\"]');
              var showCount = 0;
              hidden.forEach(function(card) {
                if (showCount < PAGE_SIZE) {
                  card.style.display = '';
                  setTimeout(function() { card.classList.add('card-visible'); }, 50 * showCount);
                  showCount++;
                }
              });
              var remaining = waterfall.querySelectorAll('.waterfall-card[style*=\"display: none\"]');
              if (remaining.length === 0) {
                loadMoreDiv.remove();
              }
            });
            waterfall.appendChild(loadMoreDiv);
          }
        }, 200);
      };
    }

    console.log('[P2-4] 性能优化已初始化');
  }

  // ==================== P2-5: 无障碍增强 ====================
  function initAccessibility() {
    var skipLink = document.createElement('a');
    skipLink.className = 'p2-skip-link';
    skipLink.href = '#page-map';
    skipLink.textContent = '跳转到主要内容';
    document.body.insertBefore(skipLink, document.body.firstChild);

    function addAriaAttrs() {
      document.querySelectorAll('.tab-item').forEach(function(tab) {
        if (!tab.getAttribute('role')) {
          tab.setAttribute('role', 'tab');
          tab.setAttribute('tabindex', '0');
          tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
        }
      });
      var tabBar = document.querySelector('.bottom-tab-bar');
      if (tabBar && !tabBar.getAttribute('role')) {
        tabBar.setAttribute('role', 'tablist');
      }
      var toast = document.getElementById('toast');
      if (toast) {
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
      }
      document.querySelectorAll('.filter-btn, .sort-btn').forEach(function(btn) {
        if (!btn.getAttribute('role')) {
          btn.setAttribute('role', 'button');
          btn.setAttribute('tabindex', '0');
        }
      });
      document.querySelectorAll('.detail-modal, .modal').forEach(function(modal) {
        if (!modal.getAttribute('role')) {
          modal.setAttribute('role', 'dialog');
          modal.setAttribute('aria-modal', 'true');
          modal.setAttribute('aria-label', modal.classList.contains('detail-modal') ? '记忆详情' : '弹窗');
        }
      });
      var search = document.getElementById('discover-search');
      if (search && !search.getAttribute('aria-label')) {
        search.setAttribute('aria-label', '搜索地标、回忆、标签');
      }
      var citySelector = document.querySelector('.city-selector');
      if (citySelector && !citySelector.getAttribute('role')) {
        citySelector.setAttribute('role', 'button');
        citySelector.setAttribute('aria-label', '选择城市');
        citySelector.setAttribute('tabindex', '0');
      }
    }

    function addKeyboardNav() {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var el = document.activeElement;
          if (el && (el.classList.contains('filter-btn') || el.classList.contains('sort-btn') ||
              el.classList.contains('city-selector') || el.classList.contains('tab-item'))) {
            e.preventDefault();
            el.click();
          }
        }
        if (e.key === 'Escape') {
          var detail = document.querySelector('.detail-modal.show');
          if (detail) app.closeDetail && app.closeDetail();
          var cityPicker = document.getElementById('p0-city-picker');
          if (cityPicker && cityPicker.classList.contains('show')) {
            cityPicker.classList.remove('show');
          }
          var themeSheet = document.querySelector('.p2-theme-sheet.show');
          if (themeSheet) themeSheet.classList.remove('show');
          var themeBackdrop = document.querySelector('.p2-theme-backdrop.show');
          if (themeBackdrop) themeBackdrop.classList.remove('show');
        }
      });
    }

    var origOpen = app.openDetail ? app.openDetail.bind(app) : null;
    if (origOpen) {
      app.openDetail = function(id) {
        origOpen(id);
        setTimeout(function() {
          var closeBtn = document.querySelector('.detail-backdrop');
          if (closeBtn) closeBtn.setAttribute('tabindex', '0');
        }, 100);
      };
    }

    addAriaAttrs();
    addKeyboardNav();
    var ariaObs = new MutationObserver(function() { addAriaAttrs(); });
    ariaObs.observe(document.body, { childList: true, subtree: true });

    console.log('[P2-5] 无障碍增强已初始化');
  }

  // ==================== P2-6: 消息中心增强 ====================
  function initNotifications() {
    if (!app.showNotifications) return;

    var origShow = app.showNotifications.bind(app);
    app.showNotifications = function() {
      origShow();
      enhanceNotifPage();
    };

    updateNotifBadge();

    function updateNotifBadge() {
      var notifs = DB.notifications || [];
      var unreadCount = notifs.filter(function(n) { return !n.read; }).length;
      setTimeout(function() {
        var menuItems = document.querySelectorAll('.profile-menu-item');
        menuItems.forEach(function(item) {
          if (item.textContent.indexOf('消息') !== -1 || item.textContent.indexOf('通知') !== -1) {
            if (!item.querySelector('.p2-notif-badge')) {
              if (unreadCount > 0) {
                var badge = document.createElement('span');
                badge.className = 'p2-notif-badge';
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                item.style.position = 'relative';
                item.appendChild(badge);
              }
            }
          }
        });
      }, 300);
    }

    function enhanceNotifPage() {
      var notifContainer = document.querySelector('#notifications-list') ||
                          document.querySelector('.notifications-list');
      if (!notifContainer) return;

      var notifs = DB.notifications || [];
      if (notifs.length === 0) {
        notifContainer.innerHTML = '<div class="p2-notif-empty"><i class="fas fa-bell-slash"></i>暂无消息</div>';
        return;
      }

      var now = new Date();
      var today = [], yesterday = [], earlier = [];
      notifs.forEach(function(n) {
        var time = n.createdAt ? new Date(n.createdAt) : new Date(0);
        var diff = now - time;
        if (diff < 86400000) today.push(n);
        else if (diff < 172800000) yesterday.push(n);
        else earlier.push(n);
      });

      var html = '';
      function renderGroup(title, items) {
        if (items.length === 0) return '';
        var h = '<div class="p2-notif-group"><div class="p2-notif-group-title">' + esc(title) + '</div>';
        items.forEach(function(n) {
          var icon = getNotifIcon(n.type);
          var text = getNotifText(n);
          var timeStr = n.createdAt ? formatTime(n.createdAt) : '';
          h += '<div class="p2-notif-item' + (n.read ? '' : ' unread') + '" data-type="' + esc(n.type || '') + '" data-ref="' + esc(n.refId || '') + '">' +
            '<div class="p2-notif-avatar">' + icon + '</div>' +
            '<div class="p2-notif-body"><div class="p2-notif-text">' + text + '</div>' +
            '<div class="p2-notif-time">' + esc(timeStr) + '</div></div></div>';
        });
        h += '</div>';
        return h;
      }

      html += renderGroup('今天', today);
      html += renderGroup('昨天', yesterday);
      html += renderGroup('更早', earlier);
      notifContainer.innerHTML = html;

      notifContainer.querySelectorAll('.p2-notif-item').forEach(function(item) {
        item.addEventListener('click', function() {
          item.classList.remove('unread');
          var type = item.dataset.type;
          var refId = item.dataset.ref;
          if (type === 'like' || type === 'comment') {
            app.openDetail(parseInt(refId));
          } else if (type === 'follow') {
            app.toast && app.toast('查看用户主页（开发中）');
          } else if (type === 'badge') {
            app.switchTab('profile');
          } else if (type === 'capsule') {
            app.switchTab('time');
          }
        });
      });
    }

    function getNotifIcon(type) {
      var icons = {
        'system': '<i class="fas fa-bullhorn"></i>',
        'like': '<i class="fas fa-heart"></i>',
        'comment': '<i class="fas fa-comment"></i>',
        'relay': '<i class="fas fa-share"></i>',
        'circle': '<i class="fas fa-users"></i>',
        'follow': '<i class="fas fa-user-plus"></i>',
        'badge': '<i class="fas fa-trophy"></i>',
        'capsule': '<i class="fas fa-mailbox"></i>'
      };
      return icons[type] || '<i class="fas fa-bell"></i>';
    }

    function getNotifText(n) {
      var text = n.content || n.text || '';
      if (n.fromUser) {
        text = '<span class="p2-notif-highlight">' + esc(n.fromUser) + '</span> ' + esc(text);
      }
      return text || esc(n.type || '消息');
    }

    function formatTime(dateStr) {
      var d = new Date(dateStr);
      var now = new Date();
      var diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      return (d.getMonth() + 1) + '月' + d.getDate() + '日';
    }

    if (app.markAllRead) {
      var origMark = app.markAllRead.bind(app);
      app.markAllRead = function() {
        origMark();
        setTimeout(function() {
          document.querySelectorAll('.p2-notif-badge').forEach(function(b) { b.remove(); });
          document.querySelectorAll('.p2-notif-item.unread').forEach(function(n) { n.classList.remove('unread'); });
        }, 200);
      };
    }

    console.log('[P2-6] 消息中心增强已初始化');
  }

  function init() {
    initThemePanel();
    initMapCluster();
    initProfileEnhance();
    initPerformance();
    initAccessibility();
    initNotifications();
    console.log('[P2] 进阶体验增强补丁已加载 — 6 个模块全部就绪');
  }

  function waitForApp() {
    if (typeof app !== 'undefined' && app.map && app.markerLayer) {
      init();
    } else {
      setTimeout(waitForApp, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }
})();
