/***********************************
 * 城市微记忆 - 核心应用逻辑
 * 包含所有模块的交互实现
 ***********************************/

// HTML 安全转义工具函数
function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// 魔法数字命名常量
const NAV_HEIGHT = 52;
const HEADER_HEIGHT = 48;
const ANIMATION_DURATION = 300;
const MAX_UPLOAD_SIZE = 10;


// 城市星图 Canvas 元素 ID
let starCanvasId = 'star-map-canvas';

const app = {
  // ==================== 定时器和监听器管理 ====================
  // 定时器列表，用于批量清理防止内存泄漏
  _timers: [],
  // 事件监听器列表，用于批量移除防止内存泄漏
  _listeners: [],

  /** 记录一个定时器ID到列表中 */
  _addTimer(id) {
    if (id != null) this._timers.push(id);
    return id;
  },

  /** 批量清理所有已记录的定时器 */
  _clearTimers() {
    this._timers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    this._timers = [];
  },

  /** 包装 addEventListener，自动记录监听器以便后续批量移除 */
  _addListener(el, event, fn, options) {
    if (!el) return;
    el.addEventListener(event, fn, options);
    this._listeners.push({ el, event, fn, options });
  },

  /** 批量移除所有已记录的事件监听器 */
  _clearListeners() {
    this._listeners.forEach(({ el, event, fn, options }) => {
      if (el) el.removeEventListener(event, fn, options);
    });
    this._listeners = [];
  },

  // ==================== DOM 缓存 ====================
  // DOM 元素引用缓存，避免重复查询
  _domCache: {},

  /** 带缓存的 DOM 元素查询方法 */
  _$(id) {
    if (!this._domCache[id]) {
      this._domCache[id] = document.getElementById(id);
    }
    return this._domCache[id];
  },

  // ==================== 初始化 ====================
  init() {
    initStorage();
    // 加载保存的主题
    const savedTheme = Storage.get('theme');
    if (savedTheme !== null) this.setTheme(savedTheme);
    this.bindEvents();
    this.initMap();
    this.renderDiscover();
    this.renderProfile();
    this.renderShop();
    this.renderRoutes();
    this.renderBadges();
    this.renderCapsules();
    this.initUpload();
    this.initOrientation();
    this.initRouteSelector();
  },

  initOrientation() {
    // 使用 matchMedia 检测屏幕方向，兼容分屏/折叠设备
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const landscapeQuery = window.matchMedia('(orientation: landscape)');
    const handleChange = () => {
      const isPortrait = portraitQuery.matches;
      document.documentElement.dataset.orientation = isPortrait ? 'portrait' : 'landscape';
      // 折叠设备/分屏时重新计算地图尺寸
      if (this.map) {
        setTimeout(() => this.map.invalidateSize(), 150);
      }
    };
    portraitQuery.addEventListener('change', handleChange);
    landscapeQuery.addEventListener('change', handleChange);
    handleChange();
    // 额外监听分屏/折叠设备的多窗口模式
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.map) this.map.invalidateSize();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ratio = vw / vh;
        document.documentElement.dataset.viewportRatio = ratio < 0.6 ? 'narrow' : ratio > 1.8 ? 'wide' : 'normal';
      }, 200);
    });
  },

  // ==================== 事件绑定 ====================
  bindEvents() {
    // 底部 Tab 切换
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const page = tab.dataset.page;
        if (page === 'upload') {
          this.navigateTo('upload');
          this.resetUpload();
        } else {
          this.switchTab(page);
        }
      });
    });

    // 年代筛选（地图页）
    document.querySelectorAll('#page-map .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#page-map .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        DB.state.yearFilter = btn.dataset.year;
        this.filterMapMarkers();
      });
    });

    // 年代筛选（发现页）
    document.querySelectorAll('#page-discover .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#page-discover .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        DB.state.yearFilter = btn.dataset.year;
        this.renderDiscover();
      });
    });

    // 排序方式
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        DB.state.sortBy = btn.dataset.sort;
        this.renderDiscover();
      });
    });

    // 搜索
    const searchInput = document.getElementById('discover-search');
    if (searchInput) {
      let searchTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => this.renderDiscover(e.target.value), 300);
      });
    }

    // 城市标签点击
    document.querySelectorAll('.city-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        this.selectCity(tag.textContent);
      });
    });

    // 城市列表点击
    document.querySelectorAll('.city-items span').forEach(item => {
      item.addEventListener('click', () => {
        const city = item.textContent;
        this.selectCity(city);
      });
    });

    // 时光胶囊标签切换
    document.querySelectorAll('.capsule-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.capsule-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.capsule-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('capsule-' + tab.dataset.tab).classList.add('active');
      });
    });

    // 胶囊样式选择
    document.querySelectorAll('.capsule-style').forEach(style => {
      style.addEventListener('click', () => {
        document.querySelectorAll('.capsule-style').forEach(s => s.classList.remove('active'));
        style.classList.add('active');
      });
    });

    // 商城分类
    document.querySelectorAll('.shop-cat').forEach(cat => {
      cat.addEventListener('click', () => {
        document.querySelectorAll('.shop-cat').forEach(c => c.classList.remove('active'));
        cat.classList.add('active');
        this.renderShop(cat.dataset.cat);
      });
    });

    // 时光邮局标签切换
    document.querySelectorAll('.post-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.post-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.post-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('post-' + tab.dataset.tab).classList.add('active');
      });
    });

    // 城市搜索过滤
    const citySearch = document.querySelector('.city-search input');
    if (citySearch) {
      citySearch.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        document.querySelectorAll('.city-items span').forEach(item => {
          item.style.display = !q || item.textContent.includes(q) ? 'inline-block' : 'none';
        });
      });
    }

    // 设置项点击
    document.querySelectorAll('.setting-item').forEach(item => {
      item.addEventListener('click', () => {
        const label = item.querySelector('span')?.textContent;
        if (label === '头像') this.changeAvatar();
        if (label === '昵称') this.editNickname();
        if (label === '简介') this.editBio();
        if (label === '退出登录') this.toast('已退出登录（模拟）');
      });
    });

    // 评论回车发送
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.postComment();
      });
    }

    // 回到顶部
    const discoverPage = document.getElementById('page-discover');
    const backToTop = document.getElementById('back-to-top');
    if (discoverPage && backToTop) {
      discoverPage.addEventListener('scroll', () => {
        backToTop.style.display = discoverPage.scrollTop > 300 ? 'flex' : 'none';
      });
    }
  },

  // ==================== 页面导航 ====================
  switchTab(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab-item[data-page="${page}"]`)?.classList.add('active');
    DB.state.prevPage = DB.state.currentPage;
    DB.state.currentPage = page;

    if (page === 'map') {
      setTimeout(() => this.map && this.map.invalidateSize(), 100);
    }
  },

  navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    DB.state.prevPage = DB.state.currentPage;
    DB.state.currentPage = page;
  },

  goBack() {
    // 返回时清理定时器和监听器，防止内存泄漏
    this._clearTimers();
    this._clearListeners();
    const backMap = {
      'upload': 'map',
      'capsule': 'time',
      'routes': 'time',
      'route-detail': 'routes',
      'quiz': 'time',
      'blindbox': 'time',
      'shop': 'profile',
      'product': 'shop',
      'myuploads': 'profile',
      'myfavorites': 'profile',
      'footprint': 'profile',
      'badges': 'profile',
      'settings': 'profile',
      'topic': 'discover',
      'heritage': 'time',
      'activities': 'time',
      'challenge': 'time',
      'private': 'profile',
      'starmap': 'time',
      'fragments': 'time',
      'story': 'discover'
    };
    const target = backMap[DB.state.currentPage] || 'map';
    if (['upload', 'capsule', 'routes', 'quiz', 'blindbox', 'shop', 'myuploads', 'myfavorites', 'footprint', 'badges', 'settings', 'topic', 'product', 'route-detail', 'heritage', 'activities', 'challenge', 'private', 'starmap', 'fragments', 'story'].includes(DB.state.currentPage)) {
      this.switchTab(target);
    } else {
      this.navigateTo(target);
    }
  },

  // ==================== Toast ====================
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  },

  // ==================== 地图模块 (Leaflet + OpenStreetMap) ====================
  initMap() {
    try {
      // 动态计算地图容器高度 = viewport - 导航栏实际高度
      const navBar = document.querySelector('.bottom-tab-bar');
      const mapPage = document.getElementById('page-map');
      const mapContainer = document.getElementById('map-container');
      if (navBar && mapPage && mapContainer) {
        const navH = navBar.offsetHeight;
        mapPage.style.height = `calc(100% - ${navH}px)`;
      }

      if (typeof L !== 'undefined') {
        this.map = L.map('map-container').setView([35.42, 119.531], 13);

        // 高德矢量地图（中文标注）
        const amapVector = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
          subdomains: '1234',
          maxZoom: 19,
          attribution: '&copy; 高德地图'
        });

        // 高德卫星影像
        const amapSatellite = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
          subdomains: '1234',
          maxZoom: 19,
          attribution: '&copy; 高德地图'
        });

        // 默认加载矢量地图
        amapVector.addTo(this.map);

        // 图层切换控件
        L.control.layers({
          '高德矢量': amapVector,
          '高德卫星': amapSatellite
        }, null, { position: 'topright', collapsed: true }).addTo(this.map);

        // 根据 zoom 级别切换标记样式（pin <-> thumb）
        this.map.on('zoomend', () => {
          const zoomed = this.map.getZoom() >= 15;
          this.markers.forEach(marker => {
            marker.setIcon(zoomed ? marker.thumbIcon : marker.pinIcon);
          });
        });

        // 地图点击空白处 — 提示上传记忆
        this.map.on('click', (e) => {
          // 如果点击的是标记，Leaflet 会触发 marker 的 click 事件，不会到这里
          // 但为了保险，检查一下是否有标记被点击
          this.showMapUploadHint(e.latlng);
        });

        this.addMapMarkers();
      } else {
        this.showMockMap();
      }
    } catch(e) {
      this.showMockMap();
    }
  },

  showMockMap() {
    const container = document.getElementById('map-container');
    container.innerHTML = `
      <div style="width:100%;height:100%;background:linear-gradient(135deg,#e8e0d0 0%,#d5cdc0 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;color:#8c7b6b;">
        <i class="fas fa-map-marked-alt" style="font-size:48px;margin-bottom:16px;"></i>
        <p style="font-size:14px;">地图加载中...</p>
        <p style="font-size:12px;margin-top:8px;">请检查网络连接</p>
        <div style="margin-top:20px;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:300px;">
          ${DB.memories.map(m => `<div class="mock-marker" data-id="${m.id}" style="background:#C75B39;color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;">${escHtml(m.title)}</div>`).join('')}
        </div>
      </div>
    `;
    container.querySelectorAll('.mock-marker').forEach(marker => {
      marker.addEventListener('click', () => {
        this.openDetail(parseInt(marker.dataset.id));
      });
    });
  },

  getMarkerColor(year) {
    const map = { '70年代': '#8B6914', '80年代': '#C75B39', '90年代': '#5B8C5A', '00年代': '#4A7C9B', '10年代': '#7B6B8D', '20年代': '#7B6B8D' };
    return map[year] || '#C75B39';
  },

  addMapMarkers() {
    if (!this.map) return;
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.markers = [];
    DB.memories.forEach(m => {
      if (m.status !== '已发布') return;
      const color = this.getMarkerColor(m.year);
      const visited = DB.footprints.includes(m.id);
      const glow = visited ? 'box-shadow:0 0 0 4px rgba(199,91,57,0.3),0 2px 6px rgba(0,0,0,0.3);' : 'box-shadow:0 2px 6px rgba(0,0,0,0.3);';
      // 两种标记样式：pin（缩小）和 thumb（放大）
      const pinHtml = `<div style="width:36px;height:44px;position:relative;cursor:pointer;"><div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;${glow}"><i class="fas fa-map-pin" style="transform:rotate(45deg);color:#fff;font-size:14px;"></i></div><div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:8px;height:4px;background:rgba(0,0,0,0.2);border-radius:50%;"></div>${visited ? '<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#C75B39;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;"><i class="fas fa-check" style="color:#fff;font-size:8px;"></i></div>' : ''}</div>`;
      // 限制缩略图尺寸不超过 64x64
      const thumbHtml = `<div class="map-thumb-only" style="cursor:pointer;"><img src="${m.oldImages[0]}" alt="${m.title}" style="width:56px;height:46px;object-fit:cover;max-width:64px;max-height:64px;"><div class="map-thumb-year">${m.year ? m.year.replace('年代','') : ''}</div></div>`;
      const pinIcon = L.divIcon({ className: '', html: pinHtml, iconSize: [36, 44], iconAnchor: [18, 44] });
      const thumbIcon = L.divIcon({ className: '', html: thumbHtml, iconSize: [56, 46], iconAnchor: [28, 46] });
      const marker = L.marker([m.lat, m.lng], { icon: this.map.getZoom() >= 15 ? thumbIcon : pinIcon });
      marker.memoryId = m.id;
      marker.pinIcon = pinIcon;
      marker.thumbIcon = thumbIcon;
      this.markers.push(marker);
      this.markerLayer.addLayer(marker);
    });

    // 使用事件委托：在 LayerGroup 上统一监听 marker 点击，避免每个 marker 单独绑定
    this.markerLayer.on('click', (e) => {
      const layer = e.layer;
      if (layer.memoryId !== undefined) {
        if (this.map.getZoom() >= 15) {
          this.openGallery(layer.memoryId);
        } else {
          this.openDetail(layer.memoryId);
        }
      }
    });
  },

  showMapUploadHint(latlng) {
    // 关闭已有提示
    const existing = document.getElementById('map-upload-hint');
    if (existing) existing.remove();
    const popup = document.createElement('div');
    popup.id = 'map-upload-hint';
    popup.innerHTML = `
      <div class="map-hint-card">
        <div class="map-hint-text">这里没有记忆记录，要做第一个记录者吗？</div>
        <div class="map-hint-actions">
          <button class="map-hint-btn map-hint-primary" onclick="app.closeMapUploadHint();app.startUploadAt(${latlng.lat},${latlng.lng})">
            <i class="fas fa-camera"></i> 上传记忆
          </button>
          <button class="map-hint-btn map-hint-secondary" onclick="app.closeMapUploadHint()">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('show'));
  },

  closeMapUploadHint() {
    const popup = document.getElementById('map-upload-hint');
    if (!popup) return;
    popup.classList.remove('show');
    this._addTimer(setTimeout(() => popup.remove(), ANIMATION_DURATION));
  },

  startUploadAt(lat, lng) {
    this.navigateTo('upload');
    this.resetUpload();
    // 预填充位置
    this.uploadData = this.uploadData || {};
    this.uploadData.lat = lat;
    this.uploadData.lng = lng;
    // 自动跳到步骤2（照片上传）
    this._addTimer(setTimeout(() => {
      const step1 = document.getElementById('upload-step1');
      const step2 = document.getElementById('upload-step2');
      if (step1 && step2) {
        step1.style.display = 'none';
        step2.style.display = 'block';
        document.getElementById('upload-step').textContent = '2';
      }
    }, 300));
  },

  openGallery(memoryId) {
    const m = DB.memories.find(x => x.id === memoryId);
    if (!m) return;
    const images = [...(m.oldImages || []), m.newImage].filter(Boolean);
    const overlay = document.createElement('div');
    overlay.id = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-backdrop" onclick="app.closeGallery()"></div>
      <div class="gallery-content">
        <button class="gallery-close" onclick="app.closeGallery()"><i class="fas fa-times"></i></button>
        <div class="gallery-main">
          <img id="gallery-current" src="${images[0]}" alt="">
        </div>
        <div class="gallery-thumbs">
          ${images.map((img, i) => `<img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="document.getElementById('gallery-current').src='${img}';this.parentElement.querySelectorAll('img').forEach(t=>t.classList.remove('active'));this.classList.add('active')" alt="">`).join('')}
        </div>
        <div class="gallery-title">${m.title}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  },

  closeGallery() {
    const overlay = document.getElementById('gallery-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    this._addTimer(setTimeout(() => overlay.remove(), ANIMATION_DURATION));
  },

  filterMapMarkers() {
    const filter = DB.state.yearFilter;
    if (!this.markerLayer) return;
    this.markerLayer.clearLayers();
    this.markers.forEach(marker => {
      const memory = DB.memories.find(m => m.id === marker.memoryId);
      if (!memory) return;
      const showYear = filter === 'all' || Utils.getYearClass(memory.year) === filter;
      const showCity = memory.city === DB.state.currentCity;
      if (showYear && showCity) this.markerLayer.addLayer(marker);
    });
  },

  locateMe() {
    this.toast('正在定位...');
    if (this.map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.map.flyTo([lat, lng], 15);
        L.marker([lat, lng]).addTo(this.map)
          .bindPopup('你的位置')
          .openPopup();
        this.toast('定位成功');
      }, () => {
        this.toast('定位失败，请检查权限');
      });
    }
  },

  // ==================== 地图路线展示 ====================
  _routeLayers: null,
  _activeRouteId: 0,

  initRouteSelector() {
    const scroll = document.getElementById('route-selector-scroll');
    if (!scroll) return;
    // 为每条路线创建选择 chip
    let html = '<span class="route-chip active" data-route="0" onclick="app.toggleMapRoute(0)"><i class="fas fa-eye-slash"></i> 隐藏路线</span>';
    DB.routes.forEach(r => {
      html += `<span class="route-chip" data-route="${r.id}" onclick="app.toggleMapRoute(${r.id})" style="--route-color:${r.color}">${escHtml(r.title)}</span>`;
    });
    scroll.innerHTML = html;
  },

  toggleMapRoute(routeId) {
    // 切换路线显示
    if (this._activeRouteId === routeId && routeId !== 0) {
      // 再次点击同一路线则隐藏
      routeId = 0;
    }
    this._activeRouteId = routeId;

    // 更新 chip 激活状态
    document.querySelectorAll('.route-chip').forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.route) === routeId);
    });

    // 清除已有路线图层
    if (this._routeLayers) {
      this._routeLayers.forEach(l => l.forEach(layer => this.map.removeLayer(layer)));
      this._routeLayers = null;
    }
    this._routeStopMarkers = [];

    if (routeId === 0) return;

    const route = DB.routes.find(r => r.id === routeId);
    if (!route || !route.stops.length) return;

    const layers = [];
    const latlngs = route.stops.map(s => [s.lat, s.lng]);

    // 绘制路线 polyline（带虚线尾迹效果）
    const polyline = L.polyline(latlngs, {
      color: route.color,
      weight: 4,
      opacity: 0.9,
      dashArray: '12, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);
    layers.push([polyline]);

    // 底部发光路线
    const glow = L.polyline(latlngs, {
      color: route.color,
      weight: 12,
      opacity: 0.15,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);
    layers.push([glow]);

    // 获取打卡进度
    const completions = Storage.get('routeCheckins') || {};
    const checked = completions[routeId] || 0;

    // 站点标记
    route.stops.forEach((stop, i) => {
      const isChecked = i < checked;
      const marker = L.circleMarker([stop.lat, stop.lng], {
        radius: isChecked ? 10 : 8,
        fillColor: isChecked ? route.color : '#fff',
        fillOpacity: isChecked ? 1 : 0.9,
        color: route.color,
        weight: 3,
        className: 'route-stop-marker'
      }).addTo(this.map);

      // 序号 circleIcon
      const iconHtml = `<div style="width:22px;height:22px;border-radius:50%;background:${isChecked ? route.color : '#fff'};border:3px solid ${route.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${isChecked ? '#fff' : route.color};box-shadow:0 2px 6px rgba(0,0,0,0.3)">${isChecked ? '<i class="fas fa-check" style="font-size:10px"></i>' : (i + 1)}</div>`;

      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
      const iconMarker = L.marker([stop.lat, stop.lng], { icon }).addTo(this.map);
      iconMarker.bindPopup(`
        <div style="min-width:180px;font-family:system-ui;">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${escHtml(stop.name)}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px;">${escHtml(stop.desc)}</div>
          <div style="font-size:11px;color:#999;">${escHtml(route.title)} · 第${i+1}站/${route.stops.length}站</div>
          <button onclick="app.checkinRouteStop(${route.id}, ${i})" style="margin-top:8px;width:100%;padding:6px;border:none;border-radius:6px;background:${route.color};color:#fff;font-size:12px;cursor:pointer;">${isChecked ? '已打卡' : '打卡此站'}</button>
        </div>
      `);
      layers.push([marker, iconMarker]);
    });

    this._routeLayers = layers;

    // 适配地图视图到路线范围
    const bounds = L.latLngBounds(latlngs).pad(0.3);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  },

  checkinRouteStop(routeId, stopIndex) {
    const route = DB.routes.find(r => r.id === routeId);
    if (!route) return;
    const completions = Storage.get('routeCheckins') || {};
    const checked = completions[routeId] || 0;
    if (stopIndex <= checked) {
      this.toast('该站点已打卡');
      return;
    }
    // 必须按顺序打卡
    if (stopIndex !== checked) {
      this.toast('请先打卡第' + (checked + 1) + '站');
      return;
    }
    completions[routeId] = stopIndex + 1;
    Storage.set('routeCheckins', completions);
    this.toast('打卡成功：' + route.stops[stopIndex].name);

    // 刷新路线标记
    this.toggleMapRoute(routeId);

    // 检查是否完成
    if (completions[routeId] >= route.stops.length) {
      this._addTimer(setTimeout(() => {
        this.toast('恭喜完成「' + route.title + '」路线！');
        this.checkBadge(6);
      }, 800));
    }
  },

  checkBadge(badgeId) {
    const badge = DB.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      DB.save(['badges']);
      this.toast(`解锁勋章：${badge.name}`);
      if (document.getElementById('badges-grid')) this.renderBadges();
    }
  },

  updateMarkerVisited(id) {
    if (!this.map) return;
    const marker = this.markers.find(mk => mk.memoryId === id);
    if (!marker) return;
    const memory = DB.memories.find(m => m.id === id);
    if (!memory) return;
    const color = this.getMarkerColor(memory.year);
    const glow = 'box-shadow:0 0 0 4px rgba(199,91,57,0.3),0 2px 6px rgba(0,0,0,0.3);';
    const pinHtml = `<div style="width:36px;height:44px;position:relative;cursor:pointer;"><div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;${glow}"><i class="fas fa-map-pin" style="transform:rotate(45deg);color:#fff;font-size:14px;"></i></div><div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:8px;height:4px;background:rgba(0,0,0,0.2);border-radius:50%;"></div><div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#C75B39;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;"><i class="fas fa-check" style="color:#fff;font-size:8px;"></i></div></div>`;
    marker.setIcon(L.divIcon({ className: '', html: pinHtml, iconSize: [36, 44], iconAnchor: [18, 44] }));
  },

  toggleCommentLike(id) {
    const c = DB.comments.find(x => x.id === id);
    if (!c) return;
    c.liked = !c.liked;
    c.likes = (c.likes || 0) + (c.liked ? 1 : -1);
    this.openComments(DB.state.currentMemoryId);
  },

  // ==================== 滑动对比组件 ====================
  createCompareSlider(oldImg, newImg) {
    const container = document.createElement('div');
    container.className = 'compare-container';
    container.innerHTML = `
      <img class="compare-old" src="${oldImg}" alt="老照片">
      <div class="compare-new"><img src="${newImg || oldImg}" alt="新照片"></div>
      <div class="compare-slider"><div class="compare-handle"><i class="fas fa-arrows-alt-h"></i></div></div>
      <div class="compare-labels"><span class="compare-label">旧时光</span><span class="compare-label">现今</span></div>
    `;

    let isDragging = false;
    const slider = container.querySelector('.compare-slider');
    const newLayer = container.querySelector('.compare-new');
    const newImgEl = container.querySelector('.compare-new img');

    const updateSlider = (clientX) => {
      const rect = container.getBoundingClientRect();
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      slider.style.left = percent + '%';
      newLayer.style.width = percent + '%';
      if (newImgEl) newImgEl.style.width = rect.width + 'px';
    };

    slider.addEventListener('mousedown', () => isDragging = true);
    slider.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
    document.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches[0].clientX); });
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);
    container.addEventListener('click', (e) => updateSlider(e.clientX));

    return container;
  },

  // ==================== 记忆详情 ====================
  openDetail(id) {
    const m = DB.memories.find(x => x.id === id);
    if (!m) return;
    DB.state.currentMemoryId = id;

    // 添加足迹
    if (!DB.footprints.includes(id)) {
      DB.footprints.push(id);
      DB.save(['footprints']);
      this.updateMarkerVisited(id);
    }
    if (DB.footprints.length >= 10) this.checkBadge(2);

    const content = document.getElementById('detail-content');
    const oldImg = m.oldImages[0];
    const newImg = m.newImage || oldImg;

    content.innerHTML = `
      <div id="compare-placeholder"></div>
      <div class="detail-title">${escHtml(m.title)}</div>
      <div class="detail-meta">
        <span class="detail-year">${escHtml(m.year)}</span>
        <span><i class="fas fa-map-marker-alt"></i> ${escHtml(m.address || m.city)}</span>
        <span><i class="fas fa-eye"></i> ${m.views}</span>
      </div>
      ${m.useStreetview ? `<div class="streetview-hint"><i class="fas fa-street-view"></i> 新照片使用街景，实际效果请在地图中查看</div>` : ''}
      <div class="detail-story">${escHtml(m.story)}</div>
      ${m.voiceUrl ? `<div class="detail-voice" onclick="app.playVoice('${m.voiceUrl}')"><i class="fas fa-play-circle"></i><span>语音回忆 (${m.voiceDuration}秒)</span></div>` : ''}
      <div class="detail-tags">${m.tags.map(t => `<span class="detail-tag">${escHtml(t)}</span>`).join('')}</div>
      <div class="detail-actions">
        <div class="detail-action ${m.liked ? 'active' : ''}" onclick="app.toggleLike(${m.id})"><i class="${m.liked ? 'fas' : 'far'} fa-heart"></i><span>${m.likes}</span></div>
        <div class="detail-action" onclick="app.openComments(${m.id})"><i class="far fa-comment"></i><span>${m.comments}</span></div>
        <div class="detail-action ${DB.favorites.includes(m.id) ? 'active' : ''}" onclick="app.toggleFavorite(${m.id})"><i class="${DB.favorites.includes(m.id) ? 'fas' : 'far'} fa-star"></i><span>收藏</span></div>
        <div class="detail-action" onclick="app.showShareCard(${m.id})"><i class="fas fa-share-alt"></i><span>分享</span></div>
        <div class="detail-action" onclick="app.showTimeTravel()"><i class="fas fa-images"></i><span>同框</span></div>
      </div>
      <div style="padding:10px 0;font-size:13px;color:var(--text-light);">
        <i class="fas fa-user"></i> ${m.isAnonymous ? '匿名' : `<span style="color:var(--accent);cursor:pointer" onclick="app.showUserProfile('${m.userId}')">${escHtml(m.authorName)}</span>`} · ${Utils.formatDate(m.createdAt)}
      </div>
      <!-- 记忆DNA标签页区域 -->
      <div class="detail-dna-section">
        <div class="detail-dna-toggle" onclick="app.toggleDNAPanel(${m.id})">
          <i class="fas fa-fingerprint"></i>
          <span>记忆 DNA 视觉指纹</span>
          <i class="fas fa-chevron-down" id="dna-chevron-${m.id}"></i>
        </div>
        <div class="detail-dna-panel" id="dna-panel-${m.id}" style="display:none;">
          <div class="dna-visual-row">
            <div class="dna-flower-wrap">
              <canvas id="dna-flower-${m.id}" width="240" height="240"></canvas>
            </div>
            <div class="dna-radar-wrap" id="dna-radar-${m.id}"></div>
          </div>
          <div class="dna-scores" id="dna-scores-${m.id}"></div>
        </div>
      </div>
    `;
    const placeholder = document.getElementById('compare-placeholder');
    if (placeholder) {
      const compareEl = this.createCompareSlider(oldImg, newImg);
      placeholder.replaceWith(compareEl);
    }
    document.getElementById('memory-detail').classList.add('show');
  },

  closeDetail() {
    document.getElementById('memory-detail').classList.remove('show');
    DB.state.currentMemoryId = null;
  },

  // ==================== 记忆DNA ====================
  // 切换DNA面板的展开/收起
  toggleDNAPanel(id) {
    const panel = document.getElementById('dna-panel-' + id);
    const chevron = document.getElementById('dna-chevron-' + id);
    if (!panel) return;
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
    if (chevron) {
      chevron.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    }
    // 首次展开时绘制DNA指纹和雷达图
    if (isHidden) {
      const m = DB.memories.find(x => x.id === id);
      if (!m) return;
      // 优先使用缓存，避免重复计算
      let dnaData = this._dnaCache[m.id];
      if (!dnaData) {
        dnaData = this.renderMemoryDNA(m);
        this._dnaCache[m.id] = dnaData;
      }
      this.drawDNAFlower('dna-flower-' + id, dnaData);
      this.drawDNARadar('dna-radar-' + id, dnaData);
      // 渲染分数列表
      const scoresEl = document.getElementById('dna-scores-' + id);
      if (scoresEl) {
        scoresEl.innerHTML = dnaData.dimensions.map(d =>
          `<div class="dna-score-item">
            <span class="dna-score-label">${d.name}</span>
            <div class="dna-score-bar"><div class="dna-score-fill" style="width:${d.score}%;background:${d.color}"></div></div>
            <span class="dna-score-value">${d.score}</span>
          </div>`
        ).join('');
      }
    }
  },

  // 计算记忆的6维度DNA分数
  renderMemoryDNA(memory) {
    // 维度名称和颜色
    const dimNames = ['历史价值', '情感温度', '文化深度', '视觉质量', '社区热度', '时空跨度'];
    const dimColors = ['#C75B39', '#E07A5F', '#D4A574', '#8B6914', '#5B8C5A', '#6A5ACD'];

    // 1. 历史价值：year越老分数越高
    const yearScoreMap = { '70年代': 100, '80年代': 85, '90年代': 70, '00年代': 50, '10年代': 30, '20年代': 20 };
    const historyScore = yearScoreMap[memory.year] || 40;

    // 2. 情感温度：story长度 x 情感词频率
    const emotionWords = ['怀念', '记得', '小时候', '温暖', '泪', '想念', '难忘', '幸福', '开心', '感动', '怀念', '回忆', '青春', '童年', '妈妈', '爸爸', '奶奶', '爷爷', '那时候', '回不去'];
    const storyText = memory.story || '';
    let emotionCount = 0;
    emotionWords.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = storyText.match(regex);
      if (matches) emotionCount += matches.length;
    });
    const storyLength = storyText.length;
    const emotionScore = Math.min(100, Math.round((storyLength / 5) * (1 + emotionCount * 0.3)));

    // 3. 文化深度：tags数量 x isFeatured加分
    const tagsCount = (memory.tags || []).length;
    const cultureScore = Math.min(100, tagsCount * 20 + (memory.isFeatured ? 30 : 0));

    // 4. 视觉质量：oldImages数量（固定1，基础分50+随机20）
    const visualScore = Math.min(100, 50 + Math.round(Math.random() * 20) + (memory.oldImages ? memory.oldImages.length * 10 : 0));

    // 5. 社区热度：(likes + comments*2 + views/10) 归一化到0-100
    const communityRaw = (memory.likes || 0) + (memory.comments || 0) * 2 + (memory.views || 0) / 10;
    const communityScore = Math.min(100, Math.round(communityRaw / 20));

    // 6. 时空跨度：固定50 + 随机30
    const spanScore = Math.min(100, 50 + Math.round(Math.random() * 30));

    const scores = [historyScore, emotionScore, cultureScore, visualScore, communityScore, spanScore];

    return {
      dimensions: dimNames.map((name, i) => ({
        name,
        score: Math.max(0, Math.min(100, scores[i])),
        color: dimColors[i]
      })),
      // 综合分数
      totalScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    };
  },

  // Canvas 绘制六瓣花形指纹
  drawDNAFlower(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxRadius = Math.min(cx, cy) - 20;

    // 清空画布
    ctx.clearRect(0, 0, W, H);

    // 获取主色调（从CSS变量）
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#C75B39';
    const primaryLight = getComputedStyle(document.documentElement).getPropertyValue('--primary-light').trim() || '#E8A88A';

    const rgbPrimary = hexToRgb(primaryColor);
    const rgbLight = hexToRgb(primaryLight);

    // 绘制背景装饰圈
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.1)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制6个花瓣
    const dims = data.dimensions;
    const angleStep = (Math.PI * 2) / 6;

    // 先绘制连接线形成六边形
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const r = (dims[i % 6].score / 100) * maxRadius * 0.7 + maxRadius * 0.15;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.08)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.3)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 绘制花瓣
    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const score = dims[i].score;
      const petalLength = (score / 100) * maxRadius * 0.65 + maxRadius * 0.15;
      const petalWidth = maxRadius * 0.22 + (score / 100) * maxRadius * 0.08;

      // 花瓣方向
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      // 垂直方向
      const px = -dy;
      const py = dx;

      // 花瓣颜色渐变
      const grad = ctx.createLinearGradient(
        cx, cy,
        cx + dx * petalLength, cy + dy * petalLength
      );
      const dimRgb = hexToRgb(dims[i].color);
      grad.addColorStop(0, `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.6)`);
      grad.addColorStop(0.5, `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.4)`);
      grad.addColorStop(1, `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.15)`);

      // 使用贝塞尔曲线绘制花瓣形状
      ctx.beginPath();
      const tipX = cx + dx * petalLength;
      const tipY = cy + dy * petalLength;
      const cpDist = petalLength * 0.6;

      // 花瓣左侧控制点
      const cp1x = cx + px * petalWidth + dx * cpDist * 0.5;
      const cp1y = cy + py * petalWidth + dy * cpDist * 0.5;
      // 花瓣右侧控制点
      const cp2x = cx - px * petalWidth + dx * cpDist * 0.5;
      const cp2y = cy - py * petalWidth + dy * cpDist * 0.5;

      ctx.moveTo(cx + px * 4, cy + py * 4);
      ctx.quadraticCurveTo(cp1x, cp1y, tipX, tipY);
      ctx.quadraticCurveTo(cp2x, cp2y, cx - px * 4, cy - py * 4);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      // 花瓣边框
      ctx.strokeStyle = `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 在花瓣尖端绘制小圆点
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.8)`;
      ctx.fill();
    }

    // 绘制中心圆（多层渐变）
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    centerGrad.addColorStop(0, `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.9)`);
    centerGrad.addColorStop(0.6, `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.6)`);
    centerGrad.addColorStop(1, `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.2)`);

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = centerGrad;
    ctx.fill();

    // 中心综合分数字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.totalScore, cx, cy);

    // 绘制维度标签
    ctx.font = '11px sans-serif';
    ctx.fillStyle = `rgba(${rgbPrimary.r},${rgbPrimary.g},${rgbPrimary.b},0.9)`;
    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const labelR = maxRadius + 10;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;

      ctx.save();
      ctx.translate(lx, ly);
      // 旋转标签使其朝外
      let textAngle = angle;
      if (textAngle > Math.PI / 2 && textAngle < Math.PI * 1.5) {
        textAngle += Math.PI;
      }
      ctx.rotate(textAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dims[i].name, 0, 0);
      ctx.restore();
    }
  },

  // ECharts 绘制雷达图
  drawDNARadar(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || typeof echarts === 'undefined') return;

    // 初始化ECharts实例
    const chart = echarts.init(container);

    // 获取主色调
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#C75B39';
    const primaryLight = getComputedStyle(document.documentElement).getPropertyValue('--primary-light').trim() || '#E8A88A';

    const indicator = data.dimensions.map(d => ({
      name: d.name,
      max: 100
    }));

    const values = data.dimensions.map(d => d.score);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const vals = params.value;
          let html = '<div style="font-size:12px">';
          data.dimensions.forEach((d, i) => {
            html += `<div style="display:flex;justify-content:space-between;gap:12px">
              <span>${d.name}</span><span style="font-weight:bold">${vals[i]}</span></div>`;
          });
          html += '</div>';
          return html;
        }
      },
      radar: {
        indicator: indicator,
        shape: 'polygon',
        radius: '65%',
        axisName: {
          color: 'var(--text, #333)',
          fontSize: 11
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(199,91,57,0.02)', 'rgba(199,91,57,0.05)', 'rgba(199,91,57,0.08)', 'rgba(199,91,57,0.11)', 'rgba(199,91,57,0.14)']
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(199,91,57,0.15)'
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(199,91,57,0.2)'
          }
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: values,
          name: '记忆DNA',
          areaStyle: {
            color: 'rgba(199,91,57,0.25)'
          },
          lineStyle: {
            color: primaryColor,
            width: 2
          },
          itemStyle: {
            color: primaryColor
          },
          symbol: 'circle',
          symbolSize: 6
        }]
      }]
    };

    chart.setOption(option);

    // 响应窗口大小变化
    self._addListener(window, 'resize', function() {
      chart.resize();
    });

    // 记录实例以便关闭时销毁
    container._echartInstance = chart;
  },

  toggleLike(id) {
    const m = DB.memories.find(x => x.id === id);
    if (!m) return;
    m.liked = !m.liked;
    m.likes += m.liked ? 1 : -1;
    DB.currentUser.likeCount += m.liked ? 1 : -1;
    // 清除对应记忆的DNA缓存，因为likes变更会影响社区热度维度
    delete this._dnaCache[id];
    DB.save(['memories', 'currentUser']);
    this.renderProfile();
    this.openDetail(id);
    this.toast(m.liked ? '已点赞' : '取消点赞');
    if (m.likes >= 100) this.checkBadge(5);
  },

  toggleFavorite(id) {
    const idx = DB.favorites.indexOf(id);
    if (idx > -1) {
      DB.favorites.splice(idx, 1);
      this.toast('已取消收藏');
    } else {
      DB.favorites.push(id);
      this.toast('已收藏');
    }
    DB.save(['favorites']);
    if (DB.state.currentMemoryId) this.openDetail(id);
  },

  // ==================== 评论 ====================
  openComments(id) {
    const list = document.getElementById('comment-list');
    const comments = DB.comments.filter(c => c.memoryId === id);
    document.getElementById('comment-count').textContent = comments.length;
    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <img class="comment-avatar" src="${c.avatar}" alt="">
        <div class="comment-body">
          <div class="comment-author">${escHtml(c.authorName)}</div>
          <div class="comment-text">${escHtml(c.content)}</div>
          <div class="comment-time">${Utils.formatDate(c.createdAt)}</div>
          <div class="comment-like ${c.liked ? 'active' : ''}" onclick="app.toggleCommentLike(${c.id})">
            <i class="${c.liked ? 'fas' : 'far'} fa-thumbs-up"></i> ${c.likes || 0}
          </div>
        </div>
      </div>
    `).join('');
    document.getElementById('comment-modal').classList.add('show');
  },

  hideCommentModal() {
    document.getElementById('comment-modal').classList.remove('show');
  },

  postComment() {
    const input = document.getElementById('comment-input');
    const content = input.value.trim();
    if (!content) return;
    const newComment = {
      id: Date.now(),
      memoryId: DB.state.currentMemoryId,
      userId: DB.currentUser.id,
      authorName: DB.currentUser.nickname,
      avatar: DB.currentUser.avatar,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0
    };
    DB.comments.push(newComment);
    const m = DB.memories.find(x => x.id === DB.state.currentMemoryId);
    if (m) m.comments++;
    DB.save(['comments', 'memories']);
    input.value = '';
    this.openComments(DB.state.currentMemoryId);
    this.toast('评论已发布');
  },

  // ==================== 分享 ====================
  showShare() {
    document.getElementById('share-modal').classList.add('show');
  },

  hideShare() {
    document.getElementById('share-modal').classList.remove('show');
  },

  // ==================== 发现广场 ====================
  renderDiscover(searchQuery = '') {
    const container = document.getElementById('discover-waterfall');
    let memories = [...DB.memories];

    // 城市筛选
    memories = memories.filter(m => m.city === DB.state.currentCity);

    // 年代筛选
    if (DB.state.yearFilter !== 'all') {
      memories = memories.filter(m => Utils.getYearClass(m.year) === DB.state.yearFilter);
    }

    // 搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      memories = memories.filter(m =>
        m.title.includes(q) || m.story.includes(q) || m.tags.some(t => t.includes(q))
      );
    }

    // 排序
    switch (DB.state.sortBy) {
      case 'likes': memories.sort((a, b) => b.likes - a.likes); break;
      case 'comments': memories.sort((a, b) => b.comments - a.comments); break;
      case 'editor': memories = memories.filter(m => m.isFeatured); break;
      default: memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 渲染关注动态（前3条）
    this.renderDiscoverFeed();

    // 热门地标（前5）
    const hotMemories = [...DB.memories].sort((a, b) => b.views - a.views).slice(0, 5);

    // 话题
    const topicIcons = ['fa-school', 'fa-store', 'fa-landmark', 'fa-mountain-sun', 'fa-bridge'];
    const topicsHtml = DB.topics.map((t, i) =>
      `<div class="topic-card" onclick="app.showTopic(${t.id})">
        <div class="topic-card-icon"><i class="fas ${topicIcons[i % topicIcons.length]}"></i></div>
        <div class="topic-card-title">${t.title}</div>
        <div class="topic-card-count">${t.count || Math.floor(Math.random()*200+50)} 篇记忆</div>
      </div>`
    ).join('');

    let html = '';

    // 话题专题 — 横向卡片
    html += `
      <div class="discover-section">
        <div class="section-header">
          <h3><i class="fas fa-fire" style="color:var(--primary)"></i> 话题专题</h3>
          <span class="section-more">更多 <i class="fas fa-chevron-right"></i></span>
        </div>
        <div class="topic-cards-scroll">${topicsHtml}</div>
      </div>
    `;

    // 热门地标 — 横向滚动卡片
    html += `
      <div class="discover-section">
        <div class="section-header">
          <h3><i class="fas fa-trophy" style="color:#D4A574"></i> 热门地标</h3>
          <span class="section-more">全部 <i class="fas fa-chevron-right"></i></span>
        </div>
        <div class="hot-cards-scroll">
          ${hotMemories.map((m, i) => `
            <div class="hot-card" onclick="app.openDetail(${m.id})">
              <div class="hot-card-img"><img src="${m.oldImages[0]}" alt="${m.title}" loading="lazy"><div class="hot-card-badge">${i + 1}</div></div>
              <div class="hot-card-info">
                <div class="hot-card-title">${escHtml(m.title)}</div>
                <div class="hot-card-stats"><i class="fas fa-eye"></i> ${m.views} <i class="fas fa-heart" style="margin-left:6px"></i> ${m.likes}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 瀑布流卡片
    html += `<div class="waterfall-grid">`;
    html += memories.map(m => `
      <div class="waterfall-card" onclick="app.openDetail(${m.id})">
        <div class="waterfall-img-wrap">
          <img src="${m.oldImages[0]}" alt="${m.title}" loading="lazy" onload="this.classList.add('loaded')">
          <div class="waterfall-year-tag">${escHtml(m.year)}</div>
          ${m.isFeatured ? '<div class="waterfall-featured"><i class="fas fa-star"></i> 编辑推荐</div>' : ''}
        </div>
        <div class="waterfall-info">
          <div class="waterfall-title">${escHtml(m.title)}</div>
