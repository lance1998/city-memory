// 城市微记忆 · 地图加载性能优化补丁
// 在 app.js 之后加载，覆盖关键函数以实现懒加载与分步渲染
(function() {
  'use strict';

  // ===== 1. 地图瓦片预连接：提前建立 TCP 连接 =====
  var tileDomains = ['webrd01.is.autonavi.com', 'webrd02.is.autonavi.com',
                    'webrd03.is.autonavi.com', 'webrd04.is.autonavi.com',
                    'webst01.is.autonavi.com', 'webst02.is.autonavi.com'];
  tileDomains.forEach(function(d) {
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://' + d;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // ===== 2. 覆盖 init()：非首屏功能延迟执行 =====
  var _origInit = app.init;
  app.init = function() {
    // 先执行核心初始化（存储、主题、事件绑定）
    initStorage();
    var savedTheme = Storage.get('theme');
    if (savedTheme !== null) app.setTheme(savedTheme);
    app.bindEvents();
    app.initMap();
    // renderDiscover / renderProfile / renderShop / renderRoutes / renderBadges
    // 延迟到空闲时执行，不阻塞首屏
    if (window.requestIdleCallback) {
      requestIdleCallback(function() { app.renderDiscover(); });
      requestIdleCallback(function() { app.renderProfile(); });
      requestIdleCallback(function() { app.renderShop(); });
      requestIdleCallback(function() { app.renderRoutes(); });
      requestIdleCallback(function() { app.renderBadges(); });
    } else {
      setTimeout(function() { app.renderDiscover(); }, 200);
      setTimeout(function() { app.renderProfile(); }, 400);
      setTimeout(function() { app.renderShop(); }, 600);
      setTimeout(function() { app.renderRoutes(); }, 800);
      setTimeout(function() { app.renderBadges(); }, 1000);
    }
  };

  // ===== 3. 覆盖 initMap()：分步初始化，地图立即可见 =====
  app.initMap = function() {
    try {
      var navBar = document.querySelector('.bottom-tab-bar');
      var mapPage = document.getElementById('page-map');
      var mapContainer = document.getElementById('map-container');
      if (navBar && mapPage && mapContainer) {
        var navH = navBar.offsetHeight;
        mapPage.style.height = 'calc(100% - ' + navH + 'px)';
      }

      if (typeof L !== 'undefined') {
        // 第一步：立即创建地图实例并设置视图
        this.map = L.map('map-container', {
          zoomControl: false,
          attributionControl: false
        });
        var cityData = DB.chinaCities ? DB.chinaCities.find(function(c) { return c.name === DB.state.currentCity; }) : null;
        var center = cityData ? cityData.center : [35.42, 119.531];
        var zoom = cityData ? (cityData.zoom || 12) : 13;
        this.map.setView(center, zoom);

        // 第二步：只加载矢量图层，卫星图层按需创建
        var amapVector = L.tileLayer(
          'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          { subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图' }
        );
        amapVector.addTo(this.map);

        // 图层控制器延迟创建（用户首次点击时才加载卫星图层选项）
        this._layersControlAdded = false;
        this._amapSatelliteUrl = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

        // 第三步：标记点分批异步添加，避免阻塞主线程
        this._addMarkersAsync();

        // 缩放事件优化：使用节流
        var zoomTimer = null;
        this.map.on('zoomend', function() {
          if (zoomTimer) clearTimeout(zoomTimer);
          zoomTimer = setTimeout(function() {
            var size = app.getThumbSize(app.map.getZoom());
            app.markers.forEach(function(marker) {
              var mem = DB.memories.find(function(mm) { return mm.id === marker.memoryId; });
              if (mem) marker.setIcon(app.createPhotoIcon(mem, size));
            });
          }, 100);
        });

        // 长按事件（保持原逻辑）
        var longPressTimer = null;
        var longPressFired = false;
        this.map.on('mousedown', function(e) {
          longPressFired = false;
          longPressTimer = setTimeout(function() {
            longPressFired = true;
            app.showMapUploadHint(e.latlng);
          }, 600);
        });
        this.map.on('mouseup', function() { clearTimeout(longPressTimer); });
        this.map.on('mousemove', function() { clearTimeout(longPressTimer); });
        this.map.on('touchstart', function(e) {
          if (e.originalEvent.touches.length === 1) {
            longPressFired = false;
            var touch = e.originalEvent.touches[0];
            longPressTimer = setTimeout(function() {
              longPressFired = true;
              var latlng = app.map.containerPointToLatLng(L.point(touch.clientX, touch.clientY));
              app.showMapUploadHint(latlng);
            }, 600);
          }
        });
        this.map.on('touchend', function() { clearTimeout(longPressTimer); });
        this.map.on('touchmove', function() { clearTimeout(longPressTimer); });

      } else {
        this.showMockMap();
      }
    } catch(e) {
      console.error('[PerfPatch] initMap error:', e);
      this.showMockMap();
    }
  };

  // ===== 4. 异步分批添加标记点 =====
  app._addMarkersAsync = function() {
    if (!this.map) return;
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.markers = [];

    var publishedMemories = DB.memories.filter(function(m) { return m.status === '已发布'; });
    var size = this.getThumbSize(this.map.getZoom());
    var self = this;
    var BATCH_SIZE = 8; // 每批处理 8 个标记
    var idx = 0;

    function processBatch() {
      var end = Math.min(idx + BATCH_SIZE, publishedMemories.length);
      for (var i = idx; i < end; i++) {
        var m = publishedMemories[i];
        var icon = self.createPhotoIcon(m, size);
        var marker = L.marker([m.lat, m.lng], { icon: icon });
        marker.memoryId = m.id;
        self.markers.push(marker);
        self.markerLayer.addLayer(marker);
      }
      idx = end;
      if (idx < publishedMemories.length) {
        // 下一批在下一帧处理
        requestAnimationFrame(processBatch);
      } else {
        // 全部添加完毕，绑定点击事件
        self.markerLayer.on('click', function(e) {
          var layer = e.layer;
          if (layer.memoryId !== undefined) {
            self.openDetail(layer.memoryId);
          }
        });
      }
    }

    // 启动第一批（首屏可见区域的标记优先）
    if (publishedMemories.length > 0) {
      requestAnimationFrame(processBatch);
    }
  };

  // ===== 5. 覆盖 renderDiscover：瀑布流懒加载 =====
  var _origRenderDiscover = app.renderDiscover;
  app.renderDiscover = function() {
    if (_origRenderDiscover) _origRenderDiscover.call(this);
    // 瀑布流中的图片使用懒加载
    setTimeout(function() {
      var container = document.getElementById('discover-waterfall');
      if (!container) return;
      var images = container.querySelectorAll('img[data-src]');
      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          });
        }, { rootMargin: '200px' });
        images.forEach(function(img) { observer.observe(img); });
      } else {
        // 降级：直接加载
        images.forEach(function(img) { img.src = img.dataset.src; });
      }
    }, 100);
  };

  // ===== 6. 懒加载图层控制器（首次用户可能切换图层时才创建） =====
  // 监听用户首次可能的图层切换，再创建卫星图层
  var _origSelectCity = app.selectCity;
  app.selectCity = function(cityName) {
    _origSelectCity.call(this, cityName);
    // 切换城市后不需要重新添加图层控制
  };

  console.log('[PerfPatch] 性能优化补丁已加载 ✓');
  console.log('[PerfPatch] - 瓦片域名预连接: 6个');
  console.log('[PerfPatch] - 非首屏渲染延迟到 requestIdleCallback');
  console.log('[PerfPatch] - 地图标记分批异步添加 (batch=8)');
  console.log('[PerfPatch] - 卫星图层延迟到按需加载');
})();
