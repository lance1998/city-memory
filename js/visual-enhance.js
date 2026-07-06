// 城市微记忆 · 视觉增强补丁 v1
// 开场动画 + 暗色电影感 + 首屏信息大爆炸
(function() {
  'use strict';

  // ==================== 1. 开场动画 ====================
  function createSplash() {
    var splash = document.createElement('div');
    splash.id = 'cinematic-splash';

    var canvas = document.createElement('canvas');
    canvas.id = 'splash-particles';
    splash.appendChild(canvas);

    var skyline = document.createElement('div');
    skyline.id = 'splash-skyline';
    skyline.innerHTML = '<svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block;">' +
      '<defs>' +
        '<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="transparent"/>' +
          '<stop offset="100%" stop-color="#131a2a"/>' +
        '</linearGradient>' +
        '<linearGradient id="buildGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#1a2340" stop-opacity="0.9"/>' +
          '<stop offset="100%" stop-color="#0a0e17" stop-opacity="0.95"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect fill="url(#skyGrad)" width="1440" height="320"/>' +
      '<g fill="url(#buildGrad)" opacity="0.8">' +
        '<rect x="80" y="180" width="40" height="140" rx="1"/>' +
        '<rect x="130" y="140" width="55" height="180" rx="1"/>' +
        '<rect x="200" y="200" width="35" height="120" rx="1"/>' +
        '<rect x="250" y="100" width="50" height="220" rx="1"/>' +
        '<rect x="310" y="160" width="40" height="160" rx="1"/>' +
        '<rect x="370" y="80" width="60" height="240" rx="1"/>' +
        '<rect x="445" y="150" width="35" height="170" rx="1"/>' +
        '<rect x="490" y="60" width="45" height="260" rx="1"/>' +
        '<rect x="550" y="120" width="55" height="200" rx="1"/>' +
        '<rect x="620" y="170" width="30" height="150" rx="1"/>' +
        '<rect x="660" y="90" width="50" height="230" rx="1"/>' +
        '<rect x="730" y="140" width="40" height="180" rx="1"/>' +
        '<rect x="780" y="50" width="55" height="270" rx="1"/>' +
        '<rect x="850" y="110" width="35" height="210" rx="1"/>' +
        '<rect x="900" y="160" width="45" height="160" rx="1"/>' +
        '<rect x="960" y="70" width="50" height="250" rx="1"/>' +
        '<rect x="1020" y="130" width="40" height="190" rx="1"/>' +
        '<rect x="1070" y="90" width="55" height="230" rx="1"/>' +
        '<rect x="1140" y="170" width="35" height="150" rx="1"/>' +
        '<rect x="1185" y="120" width="45" height="200" rx="1"/>' +
        '<rect x="1240" y="150" width="40" height="170" rx="1"/>' +
        '<rect x="1290" y="100" width="50" height="220" rx="1"/>' +
        '<rect x="1355" y="180" width="45" height="140" rx="1"/>' +
      '</g>' +
      '<g fill="#f0a050" opacity="0.6">' +
        Array.from({length: 60}, function() {
          var x = 80 + Math.random() * 1320;
          var y = 70 + Math.random() * 200;
          var s = 1.5 + Math.random() * 2;
          return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + (s * 1.2) + '" rx="0.3" opacity="' + (0.3 + Math.random() * 0.7) + '"/>';
        }).join('') +
      '</g>' +
    '</svg>';
    splash.appendChild(skyline);

    var titleGroup = document.createElement('div');
    titleGroup.id = 'splash-title-group';
    titleGroup.innerHTML = '<h1 id="splash-title">城市微记忆</h1>' +
      '<p id="splash-subtitle">每一座城市，都有值得被记住的故事</p>';
    splash.appendChild(titleGroup);

    var scanLine = document.createElement('div');
    scanLine.id = 'splash-scan-line';
    splash.appendChild(scanLine);

    var enterBtn = document.createElement('button');
    enterBtn.id = 'splash-enter';
    enterBtn.textContent = '开始探索';
    enterBtn.addEventListener('click', dismissSplash);
    splash.appendChild(enterBtn);

    document.body.appendChild(splash);
    initParticles(canvas);
    setTimeout(function() { splash.classList.add('loaded'); }, 100);
    setTimeout(function() { splash.classList.add('scanning'); }, 600);
  }

  function initParticles(canvas) {
    var ctx = canvas.getContext('2d');
    var w, h, particles = [];
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    for (var i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2, alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.5 ? '240,160,80' : '80,140,255'
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + (p.alpha * 0.15) + ')';
        ctx.fill();
      });
      var sp = document.getElementById('cinematic-splash');
      if (sp && !sp.classList.contains('fade-out')) requestAnimationFrame(draw);
    }
    draw();
  }

  function dismissSplash() {
    var splash = document.getElementById('cinematic-splash');
    if (!splash || splash.classList.contains('fade-out')) return;
    splash.classList.add('fade-out');
    setTimeout(function() { splash.remove(); }, 900);
    setTimeout(showStatsOverlay, 400);
  }

  // ==================== 2. 首屏信息大爆炸 ====================
  function showStatsOverlay() {
    var mapPage = document.getElementById('page-map');
    if (!mapPage || document.getElementById('map-stats-overlay')) return;
    var memCount = DB.memories ? DB.memories.length : 0;
    var cityCount = DB.chinaCities ? DB.chinaCities.length : 0;
    var storyCount = memCount * 3;
    var yearSpan = '50+';
    var overlay = document.createElement('div');
    overlay.id = 'map-stats-overlay';
    overlay.innerHTML =
      '<div class="stats-row">' +
        '<div class="stat-chip" onclick="app.showCityPicker()">' +
          '<span class="stat-value">' + cityCount + '</span>' +
          '<span class="stat-label">座城市</span>' +
        '</div>' +
        '<div class="stat-chip">' +
          '<span class="stat-value">' + memCount + '</span>' +
          '<span class="stat-label">条记忆</span>' +
        '</div>' +
        '<div class="stat-chip">' +
          '<span class="stat-value">' + storyCount + '</span>' +
          '<span class="stat-label">个城市故事</span>' +
        '</div>' +
        '<div class="stat-chip">' +
          '<span class="stat-value">' + yearSpan + '</span>' +
          '<span class="stat-label">年时光跨度</span>' +
        '</div>' +
        '<div class="stat-chip" onclick="app.switchTab(\'discover\')">' +
          '<span class="stat-value" style="font-size:16px;color:#00e5ff;text-shadow:0 0 12px rgba(0,229,255,0.4);">&#9733;</span>' +
          '<span class="stat-label">发现更多</span>' +
        '</div>' +
      '</div>';
    mapPage.appendChild(overlay);
    setTimeout(function() {
      overlay.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateY(-10px)';
      setTimeout(function() { overlay.remove(); }, 600);
    }, 6000);
  }

  // ==================== 3. 地图效果 ====================
  function addMapEffects() {
    var mapPage = document.getElementById('page-map');
    if (!mapPage) return;
    if (!document.getElementById('map-vignette')) {
      var vignette = document.createElement('div');
      vignette.id = 'map-vignette';
      mapPage.appendChild(vignette);
    }
    if (!document.getElementById('map-watermark')) {
      var watermark = document.createElement('div');
      watermark.id = 'map-watermark';
      watermark.innerHTML = '<span class="watermark-text">CITY MEMORY</span>';
      mapPage.appendChild(watermark);
    }
  }

  // ==================== 4. 地图标记发光 ====================
  var _origAddMapMarkers = app.addMapMarkers;
  if (_origAddMapMarkers) {
    app.addMapMarkers = function() {
      _origAddMapMarkers.call(this);
      setTimeout(function() {
        document.querySelectorAll('.leaflet-marker-icon').forEach(function(m) {
          if (!m.classList.contains('marker-glow')) m.classList.add('marker-glow');
        });
      }, 500);
    };
  }

  var _origFilterMapMarkers = app.filterMapMarkers;
  if (_origFilterMapMarkers) {
    app.filterMapMarkers = function() {
      _origFilterMapMarkers.call(this);
      setTimeout(function() {
        document.querySelectorAll('.leaflet-marker-icon').forEach(function(m) {
          if (!m.classList.contains('marker-glow')) m.classList.add('marker-glow');
        });
      }, 300);
    };
  }

  // ==================== 启动 ====================
  createSplash();
  addMapEffects();
  setTimeout(function() { dismissSplash(); }, 8000);

  app._showStatsOverlay = showStatsOverlay;
  app._dismissSplash = dismissSplash;
})();
