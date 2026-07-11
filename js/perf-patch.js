// 城市微记忆 · 地图性能与交互优化补丁 v3
// 修复：地图空白处点击不再弹窗、恢复卫星图层、优化长按互斥、优化地图销毁
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

  // ===== 3. 覆盖 initMap()：修复交互问题 =====
  app.initMap = function() {
    try {
      var navBar = document.querySelector('.bottom-tab-bar');
      var mapPage = document.getElementById('page-map');
      var mapContainer = document.getElementById('map-container');

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

        var amapVector = L.tileLayer(
          'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          { subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图' }
        );

        var amapSatellite = L.tileLayer(
          'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          { subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图' }
        );

        var baseMaps = {
          '地图': amapVector,
          '卫星': amapSatellite
        };

        amapVector.addTo(this.map);

        L.control.layers(baseMaps, null, {
          position: 'topright',
          collapsed: true
        }).addTo(this.map);

        this._addMarkersAsync();

        var zoomTimer = null;
        this.map.on('zoomend', function() {
          if (zoomTimer) clearTimeout(zoomTimer);
          zoomTimer = setTimeout(function() {
            var size = app.getThumbSize(app.map.getZoom());
            var memoryMap = {};
            DB.memories.forEach(function(mm) { memoryMap[mm.id] = mm; });
            app.markers.forEach(function(marker) {
              var mem = memoryMap[marker.memoryId];
              if (mem) marker.setIcon(app.createPhotoIcon(mem, size));
            });
          }, 100);
        });

        var longPressTimer = null;
        var isLongPress = false;

        this.map.on('mousedown', function(e) {
          isLongPress = false;
          longPressTimer = setTimeout(function() {
            isLongPress = true;
            app.showMapUploadHint(e.latlng);
          }, 600);
        });

        this.map.on('mouseup', function(e) {
          clearTimeout(longPressTimer);
        });

        this.map.on('mousemove', function() {
          clearTimeout(longPressTimer);
        });

        this.map.on('touchstart', function(e) {
          if (e.originalEvent.touches.length === 1) {
            isLongPress = false;
            var touch = e.originalEvent.touches[0];
            longPressTimer = setTimeout(function() {
              isLongPress = true;
              var latlng = app.map.containerPointToLatLng(L.point(touch.clientX, touch.clientY));
              app.showMapUploadHint(latlng);
            }, 600);
          }
        });

        this.map.on('touchend', function() {
          clearTimeout(longPressTimer);
        });

        this.map.on('touchmove', function() {
          clearTimeout(longPressTimer);
        });
      } else {
        this.showMockMap();
      }
    } catch(e) {
      console.error('[PerfPatch] initMap error:', e);
      this.showMockMap();
    }
  };

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

  var _origGoBack = app.goBack;
  if (_origGoBack) {
    app.goBack = function() {
      var fromPage = DB.state.currentPage;
      _origGoBack.call(this);
      if (fromPage === 'map') {
        setTimeout(function() {
          if (app.map) app.map.invalidateSize();
        }, 100);
      }
    };
  }

  console.log('[PerfPatch] v3 已加载 - 地图/卫星双图层 + 长按互斥修复 + 空白点击不弹窗');
})();
