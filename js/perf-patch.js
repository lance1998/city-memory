// 城市微记忆 · 地图加载性能优化补丁 v2
// 在 app.js 之后加载，覆盖关键函数以实现懒加载与分步渲染
(function() {
  'use strict';

  // ===== 1. 地图瓦片预连接 =====
  var tileDomains = ['webrd01.is.autonavi.com', 'webrd02.is.autonavi.com',
                    'webrd03.is.autonavi.com', 'webrd04.is.autonavi.com'];
  tileDomains.forEach(function(d) {
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://' + d;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // ===== 2. 覆盖非首屏渲染：延迟执行不阻塞地图 =====
  // 不覆盖 init()，只覆盖具体的渲染函数
  function makeDeferred(origFn) {
    return function() {
      var self = this;
      if (window.requestIdleCallback) {
        requestIdleCallback(function() { origFn.call(self); });
      } else {
        setTimeout(function() { origFn.call(self); }, 300);
      }
    };
  }
  if (app.renderDiscover) app.renderDiscover = makeDeferred(app.renderDiscover);
  if (app.renderProfile) app.renderProfile = makeDeferred(app.renderProfile);
  if (app.renderShop) app.renderShop = makeDeferred(app.renderShop);
  if (app.renderRoutes) app.renderRoutes = makeDeferred(app.renderRoutes);
  if (app.renderBadges) app.renderBadges = makeDeferred(app.renderBadges);

  // ===== 3. 覆盖 initMap()：分步初始化 =====
  app.initMap = function() {
    try {
      var navBar = document.querySelector('.bottom-tab-bar');
      var mapPage = document.getElementById('page-map');
      var mapContainer = document.getElementById('map-container');

      // 确保 map-page 和 map-container 都有正确高度
      if (mapPage) {
        var navH = (navBar && navBar.offsetHeight > 0) ? navBar.offsetHeight : 84;
        mapPage.style.height = 'calc(100% - ' + navH + 'px)';
        mapPage.style.display = 'flex';
        mapPage.style.flexDirection = 'column';
      }
      if (mapContainer) {
        mapContainer.style.flex = '1';
        mapContainer.style.minHeight = '200px';
      }
      // 延后修正（导航栏可能延迟渲染）
      setTimeout(function() {
        if (navBar && navBar.offsetHeight > 0) {
          mapPage.style.height = 'calc(100% - ' + navBar.offsetHeight + 'px)';
        }
        if (app.map) app.map.invalidateSize();
      }, 150);

      if (typeof L !== 'undefined') {
        this.map = L.map('map-container', {
          zoomControl: false,
          attributionControl: false
        });
        var cityData = DB.chinaCities ? DB.chinaCities.find(function(c) { return c.name === DB.state.currentCity; }) : null;
        var center = cityData ? cityData.center : [35.42, 119.531];
        var zoom = cityData ? (cityData.zoom || 12) : 13;
        this.map.setView(center, zoom);

        // 只加载矢量图层
        var amapVector = L.tileLayer(
          'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          { subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图' }
        );
        amapVector.addTo(this.map);

        // 图层控制器延迟到用户首次查看时
        this._layersControlAdded = false;

        // 标记分批添加
        this._addMarkersAsync();

        // 缩放事件节流
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

        // 长按事件
        var longPressTimer = null;
        this.map.on('mousedown', function(e) {
          longPressTimer = setTimeout(function() { app.showMapUploadHint(e.latlng); }, 600);
        });
        this.map.on('mouseup', function() { clearTimeout(longPressTimer); });
        this.map.on('mousemove', function() { clearTimeout(longPressTimer); });
        this.map.on('touchstart', function(e) {
          if (e.originalEvent.touches.length === 1) {
            var touch = e.originalEvent.touches[0];
            longPressTimer = setTimeout(function() {
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

  // ===== 4. 异步分批添加标记 =====
  app._addMarkersAsync = function() {
    if (!this.map) return;
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.markers = [];

    var publishedMemories = DB.memories.filter(function(m) { return m.status === '已发布'; });
    var size = this.getThumbSize(this.map.getZoom());
    var self = this;
    var idx = 0;

    function processBatch() {
      var end = Math.min(idx + 8, publishedMemories.length);
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
        requestAnimationFrame(processBatch);
      } else {
        self.markerLayer.on('click', function(e) {
          if (e.layer.memoryId !== undefined) self.openDetail(e.layer.memoryId);
        });
      }
    }

    if (publishedMemories.length > 0) requestAnimationFrame(processBatch);
  };

  console.log('[PerfPatch] v2 已加载 - 瓦片预连接 + 非首屏延迟 + 标记分批');
})();
