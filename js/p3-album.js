/**
 * 城市微记忆 P3 · 地图照片图集聚合
 * 将密集区域的标记聚合为照片缩略图网格，点击展开图集面板
 *
 * 架构：patch 链最末端（在 p2-enhance.js 之后）
 * 依赖：P2-2 的 clusterLayer 和 getMemById
 */
(function() {
  'use strict';

  function initP3() {
    if (typeof app === 'undefined' || typeof DB === 'undefined') return false;
    if (!app.map || !app.markerLayer) return false;

  var esc = function(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // ==================== 工具函数 ====================
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

  function getAllImages(mem) {
    var imgs = mem.newImages || [];
    if (Array.isArray(imgs) && imgs.length > 0) return imgs;
    if (mem.newImage) return [mem.newImage];
    var olds = mem.oldImages || [];
    return olds.length > 0 ? olds : [];
  }

  // ==================== 图集面板 ====================
  // 创建全屏图集面板 DOM（只创建一次）
  var albumPanel = document.createElement('div');
  albumPanel.className = 'p3-album-panel';
  albumPanel.innerHTML =
    '<div class="p3-album-backdrop"></div>' +
    '<div class="p3-album-sheet">' +
      '<div class="p3-album-handle"></div>' +
      '<div class="p3-album-header">' +
        '<div class="p3-album-title"></div>' +
        '<div class="p3-album-subtitle"></div>' +
      '</div>' +
      '<div class="p3-album-grid" id="p3-album-grid"></div>' +
      '<div class="p3-album-detail" id="p3-album-detail" style="display:none">' +
        '<div class="p3-album-detail-close" onclick="document.querySelector(\'.p3-album-panel\').classList.remove(\'show\')"><i class="fas fa-arrow-left"></i> 返回图集</div>' +
        '<div class="p3-album-detail-img-wrap"><img class="p3-album-detail-img" id="p3-album-detail-img" src="" alt=""></div>' +
        '<div class="p3-album-detail-info">' +
          '<div class="p3-album-detail-title" id="p3-album-detail-title"></div>' +
          '<div class="p3-album-detail-meta" id="p3-album-detail-meta"></div>' +
        '</div>' +
        '<div class="p3-album-detail-nav">' +
          '<div class="p3-album-nav-btn p3-album-nav-prev" id="p3-album-nav-prev"><i class="fas fa-chevron-left"></i></div>' +
          '<div class="p3-album-nav-indicator" id="p3-album-nav-indicator">1/1</div>' +
          '<div class="p3-album-nav-btn p3-album-nav-next" id="p3-album-nav-next"><i class="fas fa-chevron-right"></i></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(albumPanel);

  var _albumMems = [];
  var _albumStartIdx = 0;

  function openAlbum(mems, startIdx) {
    _albumMems = mems;
    _albumStartIdx = startIdx || 0;

    // 标题
    var titleEl = albumPanel.querySelector('.p3-album-title');
    var subtitleEl = albumPanel.querySelector('.p3-album-subtitle');
    titleEl.textContent = mems.length + ' 处地标';
    // 收集城市信息
    var cities = [];
    mems.forEach(function(m) {
      if (m.city && cities.indexOf(m.city) === -1) cities.push(m.city);
    });
    subtitleEl.textContent = cities.length > 0 ? cities.join('、') : '';

    // 渲染网格
    var grid = document.getElementById('p3-album-grid');
    var detail = document.getElementById('p3-album-detail');
    grid.style.display = '';
    detail.style.display = 'none';
    grid.innerHTML = '';

    mems.forEach(function(mem, idx) {
      var thumb = getThumb(mem);
      var imgCount = getAllImages(mem).length;
      var item = document.createElement('div');
      item.className = 'p3-album-item';
      item.innerHTML =
        '<div class="p3-album-item-thumb">' +
          (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '<div class="p3-album-item-placeholder"><i class="fas fa-image"></i></div>') +
          (imgCount > 1 ? '<span class="p3-album-item-count"><i class="fas fa-images"></i> ' + imgCount + '</span>' : '') +
        '</div>' +
        '<div class="p3-album-item-title">' + esc(mem.title) + '</div>';
      item.addEventListener('click', function() {
        openDetail(mem, idx);
      });
      grid.appendChild(item);
    });

    albumPanel.classList.add('show');
  }

  function openDetail(mem, globalIdx) {
    var grid = document.getElementById('p3-album-grid');
    var detail = document.getElementById('p3-album-detail');
    var imgs = getAllImages(mem);
    if (imgs.length === 0) return;

    grid.style.display = 'none';
    detail.style.display = '';

    var titleEl = document.getElementById('p3-album-detail-title');
    var metaEl = document.getElementById('p3-album-detail-meta');
    var imgEl = document.getElementById('p3-album-detail-img');
    var indicatorEl = document.getElementById('p3-album-nav-indicator');

    titleEl.textContent = mem.title || '';
    metaEl.textContent = (mem.city || '') + ' · ' + (mem.year || '');

    var _imgIdx = 0;
    function showImage(idx) {
      _imgIdx = idx;
      imgEl.src = imgs[idx];
      indicatorEl.textContent = (idx + 1) + '/' + imgs.length;
    }
    showImage(0);

    // 导航按钮
    document.getElementById('p3-album-nav-prev').onclick = function() {
      if (_imgIdx > 0) showImage(_imgIdx - 1);
    };
    document.getElementById('p3-album-nav-next').onclick = function() {
      if (_imgIdx < imgs.length - 1) showImage(_imgIdx + 1);
    };

    // 点击查看详情
    imgEl.style.cursor = 'pointer';
    imgEl.onclick = function() {
      albumPanel.classList.remove('show');
      if (mem.id !== undefined) {
        setTimeout(function() { app.openDetail(mem.id); }, 300);
      }
    };
  }

  // 关闭
  albumPanel.querySelector('.p3-album-backdrop').addEventListener('click', function() {
    albumPanel.classList.remove('show');
  });

  // ==================== 升级聚合标记为照片图集 ====================
  var ALBUM_THRESHOLD_ZOOM = 14;
  var ALBUM_PIXEL_THRESHOLD = 60;
  var albumLayer = L.layerGroup().addTo(app.map);

  function buildAlbumCluster() {
    albumLayer.clearLayers();

    var zoom = app.map.getZoom();
    if (zoom >= ALBUM_THRESHOLD_ZOOM) return; // 高缩放时不聚合

    // 收集所有有 memId 的标记
    var points = [];
    app.markerLayer.eachLayer(function(layer) {
      if (!layer.getLatLng || !layer.memoryId) return;
      var pos = app.map.latLngToContainerPoint(layer.getLatLng());
      points.push({ layer: layer, memId: layer.memoryId, pos: pos });
    });

    // 像素距离聚合
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
        if (Math.sqrt(dx * dx + dy * dy) < ALBUM_PIXEL_THRESHOLD) {
          group.push(q);
          used[j] = true;
        }
      });
      grouped.push(group);
    });

    // 对每个多标记组创建照片图集标记（替代 P2 的数字圆圈）
    grouped.forEach(function(group) {
      if (group.length < 2) return;

      // 收集组内地标的缩略图
      var mems = [];
      var thumbs = [];
      group.forEach(function(g) {
        var mem = getMemById(g.memId);
        if (mem) {
          mems.push(mem);
          var thumb = getThumb(mem);
          if (thumb) thumbs.push(thumb);
        }
      });

      if (mems.length < 2) return;

      var latlngs = group.map(function(g) { return g.layer.getLatLng(); });
      var centerLat = latlngs.reduce(function(s, l) { return s + l.lat; }, 0) / latlngs.length;
      var centerLng = latlngs.reduce(function(s, l) { return s + l.lng; }, 0) / latlngs.length;

      // 构建照片网格标记（最多显示4张缩略图）
      var showCount = Math.min(thumbs.length, 4);
      var gridSize = showCount <= 2 ? 48 : 60;
      var cellSize = gridSize / 2;

      var gridHtml = '<div class="p3-album-marker" style="width:' + gridSize + 'px;height:' + gridSize + 'px;">';

      // 根据数量决定布局
      if (showCount === 2) {
        gridHtml += '<div class="p3-am-cell" style="width:100%;height:50%;top:0;left:0;"><img src="' + esc(thumbs[0]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:100%;height:50%;top:50%;left:0;"><img src="' + esc(thumbs[1]) + '"></div>';
      } else if (showCount === 3) {
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:100%;top:0;left:0;"><img src="' + esc(thumbs[0]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:0;left:50%;"><img src="' + esc(thumbs[1]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:50%;left:50%;"><img src="' + esc(thumbs[2]) + '"></div>';
      } else if (showCount >= 4) {
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:0;left:0;"><img src="' + esc(thumbs[0]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:0;left:50%;"><img src="' + esc(thumbs[1]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:50%;left:0;"><img src="' + esc(thumbs[2]) + '"></div>';
        gridHtml += '<div class="p3-am-cell" style="width:50%;height:50%;top:50%;left:50%;"><img src="' + esc(thumbs[3]) + '"></div>';
      }

      // 数量角标
      gridHtml += '<div class="p3-am-badge">' + mems.length + '</div>';
      gridHtml += '</div>';

      var icon = L.divIcon({
        className: '',
        html: gridHtml,
        iconSize: [gridSize, gridSize],
        iconAnchor: [gridSize / 2, gridSize / 2]
      });

      var marker = L.marker([centerLat, centerLng], { icon: icon });
      marker.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        // 打开图集面板
        openAlbum(mems, 0);
      });

      albumLayer.addLayer(marker);
    });

    // 隐藏 P2 的数字圆圈聚合标记（被 P3 照片标记替代）
    document.querySelectorAll('.p2-cluster').forEach(function(el) {
      var parent = el.closest('.leaflet-marker-icon');
      if (parent) parent.style.visibility = 'hidden';
    });
  }

  // 监听地图事件
  var origAddMap = app.addMapMarkers ? app.addMapMarkers.bind(app) : null;
  if (origAddMap) {
    app.addMapMarkers = function() {
      origAddMap();
      setTimeout(buildAlbumCluster, 350); // 在 P2 聚合之后执行（P2 用 300ms）
    };
  }

  app.map.on('zoomend', function() {
    setTimeout(buildAlbumCluster, 150);
  });

  // 缩放变化时隐藏图集面板
  app.map.on('zoomstart', function() {
    albumLayer.clearLayers();
    albumPanel.classList.remove('show');
    // 恢复 P2 的数字圆圈
    document.querySelectorAll('.p2-cluster').forEach(function(el) {
      var parent = el.closest('.leaflet-marker-icon');
      if (parent) parent.style.visibility = '';
    });
  });

  // 初始化时立即构建一次聚合
  setTimeout(buildAlbumCluster, 500);

  console.log('[P3] 地图照片图集聚合已初始化');
  return true;
  }

  // 延迟初始化（app.init 可能在 DOMContentLoaded 中才执行）
  function tryInit(retries) {
    if (initP3()) return;
    if (retries <= 0) return;
    setTimeout(function() { tryInit(retries - 1); }, 300);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { tryInit(10); });
  } else {
    tryInit(10);
  }
})();
