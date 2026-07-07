// 城市微记忆 · 视觉增强补丁 v2 - 地图增强 JS
// 追加到 visual-enhance.js 末尾
(function() {
  'use strict';

  // ==================== 1. 标记脉冲光环 ====================
  function addPulseRings() {
    var markers = document.querySelectorAll('.leaflet-marker-icon');
    markers.forEach(function(m) {
      if (m.querySelector('.marker-pulse-ring')) return;
      var ring = document.createElement('div');
      ring.className = 'marker-pulse-ring';
      // 插入到标记内部第一个位置
      if (m.firstChild) {
        m.insertBefore(ring, m.firstChild);
      } else {
        m.appendChild(ring);
      }
    });
  }

  // ==================== 2. 记忆连线 ====================
  var connectionLayer = null;
  function createMemoryConnections() {
    if (!app.map) return;
    // 移除旧连线
    if (connectionLayer) {
      app.map.removeLayer(connectionLayer);
    }
    // 获取所有标记的 latlng
    var points = [];
    if (app.markers) {
      app.markers.forEach(function(marker) {
        if (marker && marker.getLatLng) {
          points.push(marker.getLatLng());
        }
      });
    }
    if (points.length < 2) return;

    // 创建 SVG 路径连接最近的标记
    var svgPaths = [];
    for (var i = 0; i < points.length; i++) {
      var nearest = findNearest(points, i, 2);
      nearest.forEach(function(j) {
        if (j > i) { // 避免重复
          var path = L.polyline([points[i], points[j]], {
            color: '#f0a050',
            weight: 1.5,
            opacity: 0.25,
            dashArray: '6 4',
            className: 'memory-connection'
          });
          svgPaths.push(path);
        }
      });
    }

    if (svgPaths.length > 0) {
      connectionLayer = L.layerGroup(svgPaths);
      connectionLayer.addTo(app.map);
    }
  }

  function findNearest(points, idx, count) {
    var p = points[idx];
    var dists = points.map(function(q, i) {
      if (i === idx) return { idx: i, dist: Infinity };
      var dx = p.lat - q.lat;
      var dy = p.lng - q.lng;
      return { idx: i, dist: dx*dx + dy*dy };
    });
    dists.sort(function(a, b) { return a.dist - b.dist; });
    return dists.slice(0, count).map(function(d) { return d.idx; });
  }

  // ==================== 3. 点击涟漪 ====================
  function addClickRipple(e) {
    var mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    var rect = mapContainer.getBoundingClientRect();
    var x = e.containerPoint.x;
    var y = e.containerPoint.y;

    var ripple = document.createElement('div');
    ripple.className = 'map-ripple';
    ripple.style.cssText = 'left:' + (x - 10) + 'px;top:' + (y - 10) + 'px;';
    mapContainer.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 800);
  }

  // ==================== 4. 地图 shimmer 效果 ====================
  function addMapShimmer() {
    var mapPage = document.getElementById('page-map');
    if (!mapPage || document.getElementById('map-shimmer')) return;
    var shimmer = document.createElement('div');
    shimmer.id = 'map-shimmer';
    shimmer.className = 'map-loading-shimmer';
    mapPage.appendChild(shimmer);
    setTimeout(function() { shimmer.remove(); }, 3000);
  }

  // ==================== 5. 自动轮播展示 ====================
  var showcaseTimer = null;
  function startMarkerShowcase() {
    if (!app.markers || app.markers.length === 0) return;
    var idx = 0;
    showcaseTimer = setInterval(function() {
      if (!app.markers || app.markers.length === 0) return;
      var marker = app.markers[idx % app.markers.length];
      if (marker && marker._icon) {
        // 高亮当前标记
        marker._icon.style.transform = 'scale(1.15) translateY(-6px)';
        marker._icon.style.filter = 'drop-shadow(0 0 15px rgba(240,160,80,0.7))';
        marker._icon.style.transition = 'all 0.4s ease';
        marker._icon.style.zIndex = '1000';
        setTimeout(function() {
          if (marker._icon) {
            marker._icon.style.transform = '';
            marker._icon.style.filter = '';
            marker._icon.style.zIndex = '';
          }
        }, 2000);
      }
      idx++;
    }, 3500);
  }

  function stopMarkerShowcase() {
    if (showcaseTimer) {
      clearInterval(showcaseTimer);
      showcaseTimer = null;
    }
  }

  // ==================== 6. 标记 tooltip 增强 ====================
  function enhanceTooltips() {
    if (!app.markers) return;
    app.markers.forEach(function(marker) {
      if (!marker.memoryId) return;
      var mem = DB.memories.find(function(m) { return m.id === marker.memoryId; });
      if (!mem) return;

      var tooltipHtml = '<div style="text-align:center;min-width:140px;">' +
        '<img src="' + mem.oldImages[0] + '" style="width:120px;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px;border:1px solid #253054;">' +
        '<div style="font-size:13px;font-weight:600;color:#e8ecf4;">' + (mem.title || '') + '</div>' +
        '<div style="font-size:11px;color:#7a8bb0;margin-top:4px;">' + (mem.year || '') + ' · ' + (mem.likes || 0) + ' <i class="fas fa-heart" style="font-size:9px;color:#ff6b6b;"></i></div>' +
      '</div>';

      marker.bindTooltip(tooltipHtml, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'cine-tooltip',
        opacity: 1
      });
    });
  }

  // ==================== 7. 整合到现有流程 ====================
  // Hook into addMapMarkers
  var _origAddMapMarkers = app.addMapMarkers;
  if (_origAddMapMarkers) {
    app.addMapMarkers = function() {
      _origAddMapMarkers.call(this);
      setTimeout(function() {
        addPulseRings();
        createMemoryConnections();
        enhanceTooltips();
        addMapShimmer();
      }, 600);
    };
  }

  // Hook into filterMapMarkers
  var _origFilterMapMarkers = app.filterMapMarkers;
  if (_origFilterMapMarkers) {
    app.filterMapMarkers = function() {
      _origFilterMapMarkers.call(this);
      setTimeout(function() {
        addPulseRings();
        createMemoryConnections();
        enhanceTooltips();
      }, 400);
    };
  }

  // Click ripple on map
  if (app.map) {
    app.map.on('click', addClickRipple);
  }

  // Start showcase after map init
  setTimeout(function() {
    if (app.map && app.markers && app.markers.length > 0) {
      startMarkerShowcase();
    }
  }, 2000);

  // Stop showcase on user interaction
  document.addEventListener('click', function() {
    stopMarkerShowcase();
  }, { once: true });

})();