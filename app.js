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
    // 销毁地图实例，防止内存泄漏
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
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

  showComingSoon(feature) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
      <div style="background:var(--card-bg,#fff);border-radius:12px;padding:24px;max-width:280px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <i class="fas fa-rocket" style="font-size:32px;color:var(--primary,#C75B39);margin-bottom:12px;display:block;"></i>
        <h3 style="margin:0 0 8px;font-size:16px;color:var(--ink,#2c3e50);">${feature}即将上线</h3>
        <p style="margin:0 0 16px;font-size:13px;color:var(--text-light);">该功能正在加紧开发中，敬请期待！</p>
        <button style="background:var(--primary,#C75B39);color:#fff;border:none;border-radius:6px;padding:8px 20px;font-size:14px;cursor:pointer;">知道了</button>
      </div>
    `;
    modal.querySelector('button').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  // ==================== 地图模块 (照片缩略图地图) ====================
  getMarkerColor(year) {
    const map = { '70年代': '#8B6914', '80年代': '#C75B39', '90年代': '#5B8C5A', '00年代': '#4A7C9B', '10年代': '#7B6B8D', '20年代': '#7B6B8D' };
    return map[year] || '#C75B39';
  },

  getThumbSize(zoom) {
    // zoom 10 -> 28px, zoom 19 -> 160px, 指数增长
    const size = Math.round(28 * Math.pow(1.35, zoom - 10));
    return Math.min(size, 180);
  },

  createPhotoIcon(m, size) {
    const color = this.getMarkerColor(m.year);
    const visited = DB.footprints.includes(m.id);
    const border = visited ? `3px solid ${color}` : '2px solid #fff';
    const shadow = visited
      ? '0 0 0 3px rgba(199,91,57,0.25),0 4px 12px rgba(0,0,0,0.35)'
      : '0 2px 8px rgba(0,0,0,0.25)';
    const yearLabel = m.year ? m.year.replace('年代','') : '';
    const html = `<div style="position:relative;cursor:pointer;transition:transform 0.2s;">
      <img src="${m.oldImages[0]}" alt="${escHtml(m.title)}" style="width:${size}px;height:${Math.round(size*0.75)}px;object-fit:cover;border-radius:8px;border:${border};box-shadow:${shadow};display:block;">
      ${yearLabel ? `<div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:500;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${yearLabel}</div>` : ''}
      ${visited ? '<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#C75B39;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.2);"><i class="fas fa-check" style="color:#fff;font-size:8px;"></i></div>' : ''}
    </div>`;
    return L.divIcon({ className: '', html, iconSize: [size, Math.round(size * 0.75) + 10], iconAnchor: [size / 2, Math.round(size * 0.75) + 10] });
  },

  initMap() {
    try {
      const navBar = document.querySelector('.bottom-tab-bar');
      const mapPage = document.getElementById('page-map');
      const mapContainer = document.getElementById('map-container');
      if (navBar && mapPage && mapContainer) {
        const navH = navBar.offsetHeight;
        mapPage.style.height = `calc(100% - ${navH}px)`;
      }

      if (typeof L !== 'undefined') {
        this.map = L.map('map-container', {
          zoomControl: false,
          attributionControl: false
        });
        // 根据当前城市设置地图中心和缩放
        {
          const cityData = DB.chinaCities ? DB.chinaCities.find(c => c.name === DB.state.currentCity) : null;
          const center = cityData ? cityData.center : [35.42, 119.531];
          const zoom = cityData ? (cityData.zoom || 12) : 13;
          this.map.setView(center, zoom);
        }

        // 高德矢量地图（中文标注）
        const amapVector = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
          subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图'
        });
        // 高德卫星影像
        const amapSatellite = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
          subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图'
        });
        amapVector.addTo(this.map);
        L.control.layers({ '高德矢量': amapVector, '高德卫星': amapSatellite }, null, { position: 'topright', collapsed: true }).addTo(this.map);

        this.addMapMarkers();

        // 缩放时更新所有缩略图大小
        this.map.on('zoomend', () => {
          const size = this.getThumbSize(this.map.getZoom());
          this.markers.forEach(marker => {
            const mem = DB.memories.find(mm => mm.id === marker.memoryId);
            if (mem) marker.setIcon(this.createPhotoIcon(mem, size));
          });
        });

        // 长按地图空白处 → 提示上传记忆（单击不做任何操作）
        let longPressTimer = null;
        let longPressFired = false;
        this.map.on('mousedown', (e) => {
          longPressFired = false;
          longPressTimer = setTimeout(() => {
            longPressFired = true;
            this.showMapUploadHint(e.latlng);
          }, 600);
        });
        this.map.on('mouseup', () => { clearTimeout(longPressTimer); });
        this.map.on('mousemove', () => { clearTimeout(longPressTimer); });
        // 触摸支持
        this.map.on('touchstart', (e) => {
          if (e.originalEvent.touches.length === 1) {
            longPressFired = false;
            const touch = e.originalEvent.touches[0];
            longPressTimer = setTimeout(() => {
              longPressFired = true;
              const latlng = this.map.containerPointToLatLng(L.point(touch.clientX, touch.clientY));
              this.showMapUploadHint(latlng);
            }, 600);
          }
        });
        this.map.on('touchend', () => { clearTimeout(longPressTimer); });
        this.map.on('touchmove', () => { clearTimeout(longPressTimer); });
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
      <div style="width:100%;height:100%;background:#f5f0eb;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#8c7b6b;gap:16px;padding:20px;overflow-y:auto;">
        <p style="font-size:14px;color:#a09890;">照片地图</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;">
          ${DB.memories.filter(m=>m.status==='已发布').map(m => `<div onclick="app.openDetail(${m.id})" style="cursor:pointer;"><img src="${m.oldImages[0]}" style="width:72px;height:54px;object-fit:cover;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.15);"><div style="text-align:center;font-size:10px;margin-top:4px;color:#8c7b6b;">${escHtml(m.title)}</div></div>`).join('')}
        </div>
      </div>
    `;
  },

  addMapMarkers() {
    if (!this.map) return;
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.markers = [];
    const size = this.getThumbSize(this.map.getZoom());
    DB.memories.forEach(m => {
      if (m.status !== '已发布') return;
      const icon = this.createPhotoIcon(m, size);
      const marker = L.marker([m.lat, m.lng], { icon });
      marker.memoryId = m.id;
      this.markers.push(marker);
      this.markerLayer.addLayer(marker);
    });

    this.markerLayer.on('click', (e) => {
      const layer = e.layer;
      if (layer.memoryId !== undefined) {
        this.openDetail(layer.memoryId);
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
    const onMouseMove = (e) => { if (isDragging) updateSlider(e.clientX); };
    const onTouchMove = (e) => { if (isDragging) updateSlider(e.touches[0].clientX); };
    const onMouseUp = () => { isDragging = false; };
    const onTouchEnd = () => { isDragging = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);
    container.addEventListener('click', (e) => updateSlider(e.clientX));
    // 存储全局监听器引用以便closeDetail中移除
    this._compareListeners = [
      { el: document, event: 'mousemove', fn: onMouseMove },
      { el: document, event: 'touchmove', fn: onTouchMove },
      { el: document, event: 'mouseup', fn: onMouseUp },
      { el: document, event: 'touchend', fn: onTouchEnd }
    ];

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
    // 移除对比组件全局事件监听器，防止内存泄漏
    if (this._compareListeners) {
      this._compareListeners.forEach(({ el, event, fn }) => {
        if (el) el.removeEventListener(event, fn);
      });
      this._compareListeners = null;
    }
    // 停止语音播放
    this.stopVoice();
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

    // 4. 视觉质量：基于oldImages数量和是否有newImage
    const visualScore = Math.min(100, 50 + (memory.oldImages ? memory.oldImages.length * 15 : 0) + (memory.newImage ? 20 : 0));

    // 5. 社区热度：(likes + comments*2 + views/10) 归一化到0-100
    const communityRaw = (memory.likes || 0) + (memory.comments || 0) * 2 + (memory.views || 0) / 10;
    const communityScore = Math.min(100, Math.round(communityRaw / 20));

    // 6. 时空跨度：基于年代久远度和故事长度
    const spanScore = Math.min(100, Math.round(historyScore * 0.5 + Math.min(storyLength, 100) * 0.3 + (memory.newImage ? 20 : 0)));

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

    // 解析颜色为 RGB
    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }

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
      id: 'm' + Date.now(),
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
        <div class="topic-card-count">${t.count || DB.memories.filter(m => m.tags && m.tags.includes(t.title)).length || 0} 篇记忆</div>
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
          <div class="waterfall-desc">${escHtml(m.story.substring(0, 40))}${m.story.length > 40 ? '...' : ''}</div>
          <div class="waterfall-footer">
            <div class="waterfall-author">
              <img src="${m.authorName === DB.currentUser.nickname ? DB.currentUser.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (m.userId || m.authorName)}" alt="">
              <span>${escHtml(m.authorName)}</span>
            </div>
            <div class="waterfall-actions">
              <span><i class="fas fa-heart"></i> ${m.likes}</span>
              <span><i class="fas fa-comment"></i> ${m.comments}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    html += `</div>`;

    container.innerHTML = html;

    // 瀑布流卡片滚动揭示动画
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '50px' });
      
      container.querySelectorAll('.waterfall-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
        observer.observe(card);
      });
    }
  },

  renderDiscoverFeed() {
    const list = document.getElementById('discover-feed-list');
    if (!list) return;
    const items = DB.feedItems.slice(0, 3);
    let html = '';
    items.forEach(item => {
      html += `<div class="discover-feed-item" ${item.memoryId ? `onclick="app.openDetail(${item.memoryId})"` : ''}>
        <img class="discover-feed-avatar" src="${item.userAvatar}" alt="">
        <div class="discover-feed-body">
          <div class="discover-feed-name">${escHtml(item.userName)} <span class="discover-feed-action">${escHtml(item.action)}</span></div>
          ${item.type === 'memory' ? `<div class="discover-feed-memory"><img src="${item.memoryImage}" alt=""><span>${item.memoryTitle}</span></div>` : ''}
          <div class="discover-feed-time">${item.time}</div>
        </div>
      </div>`;
    });
    list.innerHTML = html;
  },

  showFeedPage() {
    this.navigateTo('feed');
    const list = document.getElementById('feed-list');
    let html = '';
    DB.feedItems.forEach(item => {
      let bodyHtml = '';
      if (item.type === 'memory') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-memory"><img src="${item.memoryImage}" alt=""><div><div class="feed-item-memory-title">${item.memoryTitle}</div><div style="font-size:12px;color:var(--muted,#7f8c8d)">点击查看详情</div></div></div></div>`;
      } else if (item.type === 'relay') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-relay"><i class="fas fa-exchange-alt"></i>「${item.relayTitle}」${item.relayYear}的记忆接力</div></div>`;
      } else if (item.type === 'circle') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-circle"><i class="fas fa-users"></i>圈子「${item.circleTitle}」中有新内容</div></div>`;
      } else if (item.type === 'badge') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-badge"><i class="fas ${item.badgeIcon}"></i>获得勋章「${item.badgeName}」</div></div>`;
      } else if (item.type === 'follow') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-follow"><i class="fas fa-user-plus"></i>开始关注你了</div></div>`;
      } else if (item.type === 'comment') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-comment"><i class="fas fa-comment"></i>「${item.memoryTitle}」：${item.commentPreview}</div></div>`;
      } else if (item.type === 'like') {
        bodyHtml = `<div class="feed-item-body"><div class="feed-item-likewarn"><i class="fas fa-heart"></i>赞了你的记忆「${item.memoryTitle}」</div></div>`;
      }
      html += `<div class="feed-item" ${item.memoryId ? `onclick="app.openDetail(${item.memoryId})"` : ''}>
        <div class="feed-item-header">
          <img class="feed-item-avatar" src="${item.userAvatar}" alt="">
          <div class="feed-item-info"><div class="feed-item-name">${item.userName}</div><div class="feed-item-action">${item.action}</div></div>
          <div class="feed-item-time">${item.time}</div>
        </div>
        ${bodyHtml}
        ${item.type === 'memory' ? `<div class="feed-item-actions"><button onclick="event.stopPropagation();this.classList.toggle('liked')"><i class="fas fa-heart"></i> ${item.likes}</button><button><i class="fas fa-comment"></i> ${item.comments}</button><button><i class="fas fa-share"></i></button></div>` : ''}
      </div>`;
    });
    list.innerHTML = html;
  },

  showTopic(id) {
    const topic = DB.topics.find(t => t.id === id);
    if (!topic) return;
    document.getElementById('topic-title').textContent = topic.title;
    const related = DB.memories.filter(m => m.tags.some(t => t.includes(topic.title.slice(0, 2))));
    document.getElementById('topic-content').innerHTML = `
      <div class="topic-banner"><i class="fas fa-hashtag" style="font-size:48px;color:var(--text-muted);"></i></div>
      <div class="topic-desc">${escHtml(topic.desc)}</div>
      <div style="font-size:14px;color:var(--text-light);margin-bottom:12px;">共 ${topic.count} 条记忆</div>
      <div class="discover-content" style="column-count:2;column-gap:10px;">
        ${related.map(m => `
          <div class="waterfall-card" onclick="app.openDetail(${m.id})">
            <img src="${m.oldImages[0]}" alt="${m.title}">
            <div class="waterfall-info">
              <div class="waterfall-title">${escHtml(m.title)}</div>
              <div class="waterfall-meta">
                <span class="waterfall-year">${m.year}</span>
                <span><i class="fas fa-heart"></i> ${m.likes}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    this.navigateTo('topic');
  },

  // ==================== 上传模块 ====================
  initUpload() {
    this.uploadData = { step: 1, lat: null, lng: null, address: '' };
  },

  initUploadMap() {
    const container = document.getElementById('upload-map');
    if (!container || container.dataset.initialized) return;
    container.innerHTML = '';
    try {
      const map = L.map(container);{
      const cityData = DB.chinaCities ? DB.chinaCities.find(c => c.name === DB.state.currentCity) : null;
      const center = cityData ? cityData.center : [35.42, 119.531];
      const zoom = cityData ? (cityData.zoom || 12) : 13;
      this.map.setView(center, zoom);
    }
      L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图'
      }).addTo(map);
      map.on('click', e => {
        this.uploadData.lat = e.latlng.lat;
        this.uploadData.lng = e.latlng.lng;
        document.getElementById('selected-location').innerHTML = `<i class="fas fa-map-pin" style="color:var(--primary);"></i><span>已选择位置：${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}</span>`;
        if (this.uploadMarker) map.removeLayer(this.uploadMarker);
        this.uploadMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      });
      container.dataset.initialized = 'true';
    } catch(e) { console.error('初始化失败:', e); this.toast('初始化失败，请刷新重试'); }
  },

  resetUpload() {
    this.uploadData = { step: 1, lat: null, lng: null, address: '', privacy: 'private' };
    this.setUploadStep(1);
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-story').value = '';
    document.getElementById('upload-year').value = '';
    document.getElementById('upload-tags').value = '';
    document.getElementById('upload-anonymous').checked = false;
    document.getElementById('use-streetview').checked = false;
    document.getElementById('ai-preview').innerHTML = '';
    document.getElementById('old-photo-upload').innerHTML = `
      <div class="upload-placeholder" onclick="app.selectPhoto('old')"><i class="fas fa-plus"></i><span>添加老照片</span></div>
    `;
    this.selectPrivacy('private');
  },

  selectPrivacy(type) {
    this.uploadData.privacy = type;
    document.querySelectorAll('.privacy-option').forEach(el => el.classList.remove('active'));
    document.getElementById('privacy-' + type).classList.add('active');
    const notice = document.getElementById('privacy-notice');
    if (notice) {
      notice.innerHTML = type === 'private'
        ? '<i class="fas fa-shield-alt"></i> 住宅类记忆默认私密，你可以随时申请公开'
        : '<i class="fas fa-globe"></i> 公开后位置将自动模糊处理，经审核后进入公共地图';
    }
  },

  setUploadStep(step) {
    DB.state.uploadStep = step;
    document.getElementById('upload-step').textContent = step;
    document.querySelectorAll('.upload-step').forEach(s => s.classList.remove('active'));
    document.getElementById('upload-step-' + step).classList.add('active');

    if (step === 1) {
      setTimeout(() => this.initUploadMap(), 100);
    }
    if (step === 3) {
      this.renderUploadPreview();
    }
  },

  nextUploadStep() {
    if (DB.state.uploadStep < 3) {
      this.setUploadStep(DB.state.uploadStep + 1);
    }
  },

  prevUploadStep() {
    if (DB.state.uploadStep > 1) {
      this.setUploadStep(DB.state.uploadStep - 1);
    }
  },

  selectPhoto(type) {
    const uploadArea = type === 'old' ? document.getElementById('old-photo-upload') :
                       type === 'new' ? document.getElementById('new-photo-upload') :
                       document.getElementById('capsule-photo-upload');
    // 创建隐藏的文件选择器
    let fileInput = document.getElementById(`file-input-${type}`);
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = `file-input-${type}`;
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', (e) => this.handlePhotoSelect(e, type, uploadArea));
      document.body.appendChild(fileInput);
    }
    fileInput.click();
  },

  handlePhotoSelect(e, type, uploadArea) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast('请选择图片文件');
      return;
    }
    // 限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.toast('图片过大，请压缩后上传（最大5MB）');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;width:100px;height:100px;flex-shrink:0;';
      wrapper.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"><button onclick="this.parentElement.remove();event.stopPropagation();app.clearPhoto('${type}');" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#EF5350;color:#fff;border:none;border-radius:50%;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-times"></i></button>`;
      // 移除占位符
      const placeholder = uploadArea.querySelector('.upload-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      uploadArea.appendChild(wrapper);
      if (type === 'old') this.uploadData.oldImg = base64;
      if (type === 'new') this.uploadData.newImg = base64;
      if (type === 'capsule') this.uploadData.capsuleImg = base64;
      this.toast('图片已加载');
    };
    reader.readAsDataURL(file);
    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  },

  clearPhoto(type) {
    const uploadArea = type === 'old' ? document.getElementById('old-photo-upload') :
                       type === 'new' ? document.getElementById('new-photo-upload') :
                       document.getElementById('capsule-photo-upload');
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    if (placeholder) placeholder.style.display = 'flex';
    if (type === 'old') delete this.uploadData.oldImg;
    if (type === 'new') delete this.uploadData.newImg;
    if (type === 'capsule') delete this.uploadData.capsuleImg;
  },

  aiFixPhoto() {
    const oldImg = this.uploadData.oldImg;
    if (!oldImg) {
      this.toast('请先上传照片');
      return;
    }
    this.toast('AI修复中...');
    this._addTimer(setTimeout(() => {
      const preview = document.getElementById('ai-preview');
      preview.innerHTML = `
        <div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">AI修复需要后端支持，当前为概念演示</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div><div style="font-size:11px;color:#999;margin-bottom:4px;">修复前</div><img src="${oldImg}" style="width:90px;height:90px;object-fit:cover;border-radius:4px;"></div>
          <i class="fas fa-arrow-right" style="color:var(--primary);"></i>
          <div><div style="font-size:11px;color:#999;margin-bottom:4px;">修复后</div><img src="${oldImg}" style="width:90px;height:90px;object-fit:cover;border-radius:4px;filter:contrast(1.1) saturate(1.1);"></div>
        </div>
      `;
      this.toast('AI修复演示完成');
    }, 1500));
  },

  toggleVoiceRecord() {
    const btn = document.getElementById('voice-btn');
    const timer = document.getElementById('voice-timer');
    if (DB.state.recording) {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      clearInterval(DB.state.voiceTimer);
      DB.state.recording = false;
      btn.classList.remove('recording');
      btn.innerHTML = '<i class="fas fa-microphone"></i> 点击录制';
      this.toast('录音已保存');
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      this.toast('您的浏览器不支持语音录制');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.uploadData.voiceUrl = URL.createObjectURL(blob);
          this.uploadData.voiceDuration = Math.round(this._recordedSec || 0);
          stream.getTracks().forEach(t => t.stop());
        };
        this.mediaRecorder.start();
        DB.state.recording = true;
        btn.classList.add('recording');
        btn.innerHTML = '<i class="fas fa-stop"></i> 点击停止';
        let sec = 0;
        this._recordedSec = 0;
        timer.textContent = '00:00';
        DB.state.voiceTimer = setInterval(() => {
          sec++;
          this._recordedSec = sec;
          const m = String(Math.floor(sec / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          timer.textContent = `${m}:${s}`;
          if (sec >= 180) this.toggleVoiceRecord();
        }, 1000);
      })
      .catch(err => {
        console.error('录音失败:', err);
        this.toast('无法访问麦克风，请检查权限设置');
      });
  },

  renderUploadPreview() {
    const title = document.getElementById('upload-title').value || '未命名地标';
    const year = document.getElementById('upload-year').value || '未知年代';
    const oldImg = this.uploadData.oldImg || 'https://picsum.photos/seed/preview/400/200';
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = `
      <img src="${oldImg}" style="width:100%;height:180px;object-fit:cover;">
      <div style="padding:12px;">
        <div style="font-weight:600;font-size:16px;margin-bottom:4px;">${title}</div>
        <span style="background:var(--primary-light);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-size:12px;">${year}</span>
        <div style="margin-top:8px;font-size:13px;color:var(--text-light);">${document.getElementById('upload-story').value || '暂无回忆文字'}</div>
      </div>
    `;
  },

  publishMemory() {
    const title = document.getElementById('upload-title').value.trim();
    const year = document.getElementById('upload-year').value;
    const story = document.getElementById('upload-story').value.trim();
    if (!title) { this.toast('请填写地标名称'); return; }
    if (!year) { this.toast('请选择年代'); return; }
    if (!story) { this.toast('请填写回忆文字'); return; }
    if (!this.uploadData.lat) { this.toast('请在地图上选择位置'); return; }
    const lat = this.uploadData.lat || 35.42 + (Math.random() - 0.5) * 0.02;
    const lng = this.uploadData.lng || 119.53 + (Math.random() - 0.5) * 0.02;
    const privacy = this.uploadData.privacy || 'private';

    if (privacy === 'private') {
      const privateMemory = {
        id: 'p' + Date.now(),
        title: document.getElementById('upload-title').value || '未命名地标',
        city: DB.state.currentCity,
        lat, lng,
        oldImages: [this.uploadData.oldImg || `https://picsum.photos/seed/${Date.now()}/400/300`],
        year: document.getElementById('upload-year').value || '未知',
        story: document.getElementById('upload-story').value || '',
        tags: (document.getElementById('upload-tags').value || '').split(' ').filter(Boolean),
        privacy: 'private',
        publicApplied: false,
        familyMembers: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      DB.privateMemories.unshift(privateMemory);
      DB.save(['privateMemories']);
      this.toast('已保存到私人记忆，仅你自己可见');
    } else {
      const newMemory = {
        id: 'm' + Date.now(),
        title: document.getElementById('upload-title').value || '未命名地标',
        city: DB.state.currentCity,
        lat: lat + (Math.random() - 0.5) * 0.001,
        lng: lng + (Math.random() - 0.5) * 0.001,
        oldImages: [this.uploadData.oldImg || `https://picsum.photos/seed/${Date.now()}/400/300`],
        newImage: this.uploadData.newImg || `https://picsum.photos/seed/${Date.now()+1}/400/300`,
        year: document.getElementById('upload-year').value || '未知',
        story: document.getElementById('upload-story').value || '',
        tags: (document.getElementById('upload-tags').value || '').split(' ').filter(Boolean),
        userId: DB.currentUser.id,
        authorName: DB.currentUser.nickname,
        isAnonymous: document.getElementById('upload-anonymous').checked,
        likes: 0, comments: 0, views: 0,
        status: '待审核',
        createdAt: new Date().toISOString().split('T')[0]
      };
      DB.memories.unshift(newMemory);
      DB.currentUser.memoryCount++;
      DB.save(['memories', 'currentUser']);
      this.toast('已提交公开审核，位置已模糊处理');
      this.renderDiscover();
    }
    this.switchTab('map');
    this.renderProfile();
    this.checkBadge(1);
    this.checkBadge(9);
  },

  // ==================== 时光玩法 ====================

  // ==================== 城市星图可视化 ====================
  // 星图动画帧ID，用于取消动画
  _starMapAnimId: null,
  // 星图相关数据缓存
  _starMapData: null,
  // 流星列表
  _shootingStars: [],
  // 背景小星星
  _bgStars: [],
  // 星云数据
  _nebulae: [],
  // DNA计算结果缓存，避免重复计算
  _dnaCache: {},

  // 进入城市星图全屏视图
  openStarMap() {
    DB.state.currentPage = 'starmap';
    // 创建全屏容器
    let container = document.createElement('div');
    container.id = 'page-starmap';
    container.className = 'page active';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:900;background:#0a0a1a;display:flex;flex-direction:column;align-items:center;justify-content:center';
    container.innerHTML =
      '<canvas id="' + starCanvasId + '" style="width:100%;height:100%;display:block"></canvas>' +
      '<div id="starmap-header" style="position:absolute;top:0;left:0;right:0;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;z-index:10">' +
        '<button id="starmap-back" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:18px;width:40px;height:40px;border-radius:50%;cursor:pointer;backdrop-filter:blur(8px)"><i class="fas fa-arrow-left"></i></button>' +
        '<div style="color:rgba(255,255,255,0.9);font-size:16px;font-weight:600;text-shadow:0 0 12px rgba(100,140,255,0.6)">城市星图</div>' +
        '<div style="width:40px"></div>' +
      '</div>' +
      '<div id="starmap-legend" style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:12px;text-align:center;pointer-events:none;text-shadow:0 0 6px rgba(0,0,0,0.8)">点击星星探索城市记忆</div>';
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.body.appendChild(container);

    // 返回按钮事件
    this._addListener(document.getElementById('starmap-back'), 'click', function() {
      app.closeStarMap();
    });

    // 初始化并开始渲染
    this.renderStarMap();

    // 页面可见性变化时暂停/恢复星图动画
    this._starVisHandler = () => {
      if (document.hidden) {
        if (this._starMapAnimId) {
          cancelAnimationFrame(this._starMapAnimId);
          this._starMapAnimId = null;
        }
      } else {
        if (!this._starMapAnimId) {
          this.animateStarMap();
        }
      }
    };
    document.addEventListener('visibilitychange', this._starVisHandler);
  },

  // 关闭星图，释放资源
  closeStarMap() {
    if (this._starMapAnimId) {
      cancelAnimationFrame(this._starMapAnimId);
      this._starMapAnimId = null;
    }
    // 移除 resize 监听器，防止内存泄漏
    if (this._starMapResizeHandler) {
      window.removeEventListener('resize', this._starMapResizeHandler);
      this._starMapResizeHandler = null;
    }
    // 清理所有定时器和事件监听器
    this._clearTimers();
    this._clearListeners();
    // 移除页面可见性监听器
    if (this._starVisHandler) {
      document.removeEventListener('visibilitychange', this._starVisHandler);
      this._starVisHandler = null;
    }
    let page = document.getElementById('page-starmap');
    if (page) page.remove();
    this.switchTab('time');
  },

  // 初始化并渲染星空Canvas
  renderStarMap() {
    let self = this;
    let canvas = document.getElementById(starCanvasId);
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let W = canvas.clientWidth;
    let H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // 取记忆数据（取前8个地标）
    let memories = DB.memories.slice(0, 8);
    // 计算热度范围，用于归一化
    let maxHeat = 1;
    memories.forEach(function(m) {
      let heat = (m.likes || 0) + (m.views || 0) * 0.1;
      if (heat > maxHeat) maxHeat = heat;
    });

    // 生成星星布局：以不规则间距分布在Canvas中心周围
    let cx = W / 2;
    let cy = H / 2;
    // 使用预设的不规则角度和半径偏移，形成星座般效果
    let angleOffsets = [0, 45, 95, 155, 200, 260, 310, 350];
    let radiusFactors = [0.28, 0.22, 0.35, 0.18, 0.32, 0.25, 0.38, 0.15];
    let baseRadius = Math.min(W, H) * 0.38;

    let stars = memories.map(function(m, i) {
      let heat = ((m.likes || 0) + (m.views || 0) * 0.1) / maxHeat;
      let angle = (angleOffsets[i] || 0) * Math.PI / 180;
      let dist = (radiusFactors[i] || 0.25) * baseRadius;
      // 归一化半径和亮度
      let radius = Math.max(3, 3 + heat * 10); // 3~13px
      let brightness = Math.max(0.4, 0.4 + heat * 0.6); // 0.4~1.0

      // 围绕该星星公转的光点
      let orbitPoints = [];
      let orbitCount = 1 + Math.floor((m.comments || 0) / 15); // 评论数决定光点数量
      orbitCount = Math.min(orbitCount, 5); // 最多5个光点
      for (let j = 0; j < orbitCount; j++) {
        orbitPoints.push({
          angle: Math.random() * Math.PI * 2,
          distance: radius + 10 + j * 7,
          speed: 0.003 + Math.random() * 0.005,
          size: Math.max(1, 1.2 + Math.random() * 1.5),
          opacity: 0.5 + Math.random() * 0.4
        });
      }

      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        radius: radius,
        brightness: brightness,
        heat: heat,
        memory: m,
        orbitPoints: orbitPoints,
        pulsePhase: Math.random() * Math.PI * 2,
        glowRadius: radius * 3 + heat * 15
      };
    });

    // 初始化200个背景闪烁小星星
    if (self._bgStars.length === 0) {
      for (let i = 0; i < 200; i++) {
        self._bgStars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() * 1.8 + 0.3,
          opacity: Math.random(),
          speed: 0.005 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2
        });
      }
    } else {
      // resize时重新分布
      self._bgStars.forEach(function(s) {
        s.x = Math.random() * W;
        s.y = Math.random() * H;
      });
    }

    // 初始化星云（径向渐变雾气）
    if (self._nebulae.length === 0) {
      let nebulaColors = [
        { r: 60, g: 80, b: 180 },
        { r: 120, g: 50, b: 150 },
        { r: 30, g: 100, b: 160 },
        { r: 80, g: 40, b: 120 }
      ];
      for (let i = 0; i < 4; i++) {
        self._nebulae.push({
          x: Math.random() * W,
          y: Math.random() * H,
          rx: 100 + Math.random() * 150,
          ry: 80 + Math.random() * 120,
          color: nebulaColors[i],
          opacity: 0.06 + Math.random() * 0.06,
          driftX: (Math.random() - 0.5) * 0.1,
          driftY: (Math.random() - 0.5) * 0.08
        });
      }
    }

    // 保存数据到缓存
    self._starMapData = { canvas: canvas, ctx: ctx, W: W, H: H, dpr: dpr, stars: stars, cx: cx, cy: cy, time: 0 };

    // 窗口resize自适应
    self._starMapResizeHandler = function() {
      let c = document.getElementById(starCanvasId);
      if (!c) return;
      let nW = c.clientWidth;
      let nH = c.clientHeight;
      let nDpr = window.devicePixelRatio || 1;
      c.width = nW * nDpr;
      c.height = nH * nDpr;
      let nCtx = c.getContext('2d');
      nCtx.scale(nDpr, nDpr);

      // 重新计算星星位置
      let nCx = nW / 2;
      let nCy = nH / 2;
      let nBaseRadius = Math.min(nW, nH) * 0.38;
      self._starMapData.stars.forEach(function(star, i) {
        let angle = (angleOffsets[i] || 0) * Math.PI / 180;
        let dist = (radiusFactors[i] || 0.25) * nBaseRadius;
        star.x = nCx + Math.cos(angle) * dist;
        star.y = nCy + Math.sin(angle) * dist;
      });
      // 重新分布背景星
      self._bgStars.forEach(function(s) {
        s.x = Math.random() * nW;
        s.y = Math.random() * nH;
      });
      self._starMapData.W = nW;
      self._starMapData.H = nH;
      self._starMapData.ctx = nCtx;
      self._starMapData.cx = nCx;
      self._starMapData.cy = nCy;
    };
    self._addListener(window, 'resize', self._starMapResizeHandler);

    // canvas点击事件 — 检测是否点中了星星
    this._addListener(canvas, 'click', function(e) {
      let rect = canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left;
      let my = e.clientY - rect.top;
      let sd = self._starMapData;
      if (!sd) return;
      for (let i = 0; i < sd.stars.length; i++) {
        let star = sd.stars[i];
        let dx = mx - star.x;
        let dy = my - star.y;
        let hitRadius = star.glowRadius * 0.8;
        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          self.showStarMapDetail(star.memory);
          return;
        }
      }
    });

    // 启动动画循环
    this.animateStarMap();
  },

  // requestAnimationFrame 动画循环
  animateStarMap() {
    let self = this;
    let sd = this._starMapData;
    if (!sd) return;
    let ctx = sd.ctx;
    let W = sd.W;
    let H = sd.H;
    sd.time += 0.016; // 约每帧16ms

    // 清空画布
    ctx.clearRect(0, 0, W, H);

    // ---- 绘制深色背景渐变 ----
    let bgGrad = ctx.createRadialGradient(sd.cx, sd.cy, 0, sd.cx, sd.cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, '#0d1025');
    bgGrad.addColorStop(0.5, '#080b18');
    bgGrad.addColorStop(1, '#030510');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ---- 绘制星云雾气（径向渐变） ----
    this._nebulae.forEach(function(neb) {
      // 缓慢漂移
      neb.x += neb.driftX;
      neb.y += neb.driftY;
      if (neb.x < -neb.rx) neb.x = W + neb.rx;
      if (neb.x > W + neb.rx) neb.x = -neb.rx;
      if (neb.y < -neb.ry) neb.y = H + neb.ry;
      if (neb.y > H + neb.ry) neb.y = -neb.ry;

      let grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, Math.max(neb.rx, neb.ry));
      let c = neb.color;
      grad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + neb.opacity + ')');
      grad.addColorStop(0.6, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (neb.opacity * 0.3) + ')');
      grad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');
      ctx.fillStyle = grad;
      ctx.fillRect(neb.x - neb.rx, neb.y - neb.ry, neb.rx * 2, neb.ry * 2);
    });

    // ---- 绘制背景200颗闪烁小星星 ----
    this._bgStars.forEach(function(s) {
      // 闪烁效果
      let flicker = Math.sin(sd.time * s.speed * 60 + s.phase) * 0.5 + 0.5;
      let alpha = s.opacity * flicker;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,230,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
    });

    // ---- 绘制流星 ----
    this._spawnShootingStar(W, H);
    this._shootingStars = this._shootingStars.filter(function(m) {
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.012;
      if (m.life <= 0) return false;

      // 流星尾巴（渐变线）
      let tailLen = 60 * m.life;
      let grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tailLen * 0.6, m.y - m.vy * tailLen * 0.6);
      grad.addColorStop(0, 'rgba(255,255,255,' + (m.life * 0.9).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * tailLen * 0.6, m.y - m.vy * tailLen * 0.6);
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, 2 * m.life);
      ctx.stroke();

      // 流星头部亮点
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.max(1, 2 * m.life), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + m.life.toFixed(3) + ')';
      ctx.fill();
      return true;
    });

    // ---- 绘制星座连线（暗淡虚线连接相邻星星） ----
    if (sd.stars.length > 1) {
      ctx.strokeStyle = 'rgba(100,140,220,0.08)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      for (let i = 0; i < sd.stars.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(sd.stars[i].x, sd.stars[i].y);
        ctx.lineTo(sd.stars[i + 1].x, sd.stars[i + 1].y);
        ctx.stroke();
      }
      // 连接首尾形成闭环
      ctx.beginPath();
      ctx.moveTo(sd.stars[sd.stars.length - 1].x, sd.stars[sd.stars.length - 1].y);
      ctx.lineTo(sd.stars[0].x, sd.stars[0].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ---- 绘制每颗地标星星及其光点 ----
    sd.stars.forEach(function(star) {
      // 脉冲效果
      let pulse = Math.sin(sd.time * 1.5 + star.pulsePhase) * 0.15 + 1;
      let drawRadius = star.radius * pulse;

      // 已访问标记
      let isVisited = !!DB.state.starVisited[star.memory.id];

      // 外层光晕
      let glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.glowRadius * pulse);
      let baseColor = isVisited ? '255,200,80' : '140,180,255';
      glowGrad.addColorStop(0, 'rgba(' + baseColor + ',' + (star.brightness * 0.4).toFixed(3) + ')');
      glowGrad.addColorStop(0.5, 'rgba(' + baseColor + ',' + (star.brightness * 0.12).toFixed(3) + ')');
      glowGrad.addColorStop(1, 'rgba(' + baseColor + ',0)');
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.glowRadius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 核心星体
      let coreGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, drawRadius);
      coreGrad.addColorStop(0, 'rgba(255,255,255,' + star.brightness.toFixed(3) + ')');
      coreGrad.addColorStop(0.4, 'rgba(' + baseColor + ',' + (star.brightness * 0.8).toFixed(3) + ')');
      coreGrad.addColorStop(1, 'rgba(' + baseColor + ',0)');
      ctx.beginPath();
      ctx.arc(star.x, star.y, drawRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // 已访问的星星加一个环
      if (isVisited) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, drawRadius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,200,80,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 星星名称标签
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,' + (star.brightness * 0.7).toFixed(3) + ')';
      ctx.textAlign = 'center';
      ctx.fillText(star.memory.title, star.x, star.y + drawRadius + 16);

      // ---- 光点围绕公转 ----
      star.orbitPoints.forEach(function(pt) {
        pt.angle += pt.speed;
        let px = star.x + Math.cos(pt.angle) * pt.distance;
        let py = star.y + Math.sin(pt.angle) * pt.distance;
        // 光点尾迹
        let trailAngle = pt.angle - pt.speed * 3;
        let tx = star.x + Math.cos(trailAngle) * pt.distance;
        let ty = star.y + Math.sin(trailAngle) * pt.distance;
        let trailGrad = ctx.createLinearGradient(px, py, tx, ty);
        trailGrad.addColorStop(0, 'rgba(200,220,255,' + pt.opacity.toFixed(3) + ')');
        trailGrad.addColorStop(1, 'rgba(200,220,255,0)');
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = pt.size;
        ctx.stroke();

        // 光点本体
        ctx.beginPath();
        ctx.arc(px, py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,235,255,' + pt.opacity.toFixed(3) + ')';
        ctx.fill();
      });
    });

    // 缓慢旋转效果 — 通过微调背景星星位置模拟
    this._bgStars.forEach(function(s) {
      // 绕画布中心缓慢旋转
      let dx = s.x - sd.cx;
      let dy = s.y - sd.cy;
      let rotSpeed = 0.00005;
      let cos = Math.cos(rotSpeed);
      let sin = Math.sin(rotSpeed);
      s.x = sd.cx + dx * cos - dy * sin;
      s.y = sd.cy + dx * sin + dy * cos;
      // 超出边界则循环
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10;
      if (s.y > H + 10) s.y = -10;
    });

    // 继续动画循环
    this._starMapAnimId = requestAnimationFrame(function() {
      self.animateStarMap();
    });
  },

  // 生成流星（每3-6秒一颗）
  _spawnShootingStar(W, H) {
    // 用随机概率模拟定时生成
    if (Math.random() < 0.005) { // 约3-6秒一颗（60fps * 0.005 ≈ 每200帧）
      let startX = Math.random() * W * 0.8;
      let startY = Math.random() * H * 0.3;
      this._shootingStars.push({
        x: startX,
        y: startY,
        vx: 4 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
        life: 1
      });
    }
  },

  // 点击星星显示记忆详情
  showStarMapDetail(memory) {
    // 标记已访问
    DB.state.starVisited[memory.id] = true;
    DB.save(['state']);

    // 构建详情弹窗
    let overlay = document.createElement('div');
    overlay.id = 'starmap-detail-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:910;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    overlay.innerHTML =
      '<div style="width:320px;max-width:90vw;background:rgba(15,15,35,0.95);border:1px solid rgba(100,140,255,0.2);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5)">' +
        '<div style="position:relative">' +
          '<img src="' + (memory.oldImages[0] || '') + '" style="width:100%;height:180px;object-fit:cover;display:block" alt="">' +
          '<div style="position:absolute;bottom:0;left:0;right:0;padding:12px 16px;background:linear-gradient(transparent,rgba(10,10,30,0.9))">' +
            '<div style="color:rgba(255,255,255,0.5);font-size:12px">' + (memory.year || '') + ' · ' + (memory.district || '') + '</div>' +
            '<div style="color:#fff;font-size:17px;font-weight:600;margin-top:2px">' + memory.title + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px">' +
          '<p style="color:rgba(255,255,255,0.75);font-size:13px;line-height:1.7;margin:0">' + (memory.story || '').substring(0, 100) + '...</p>' +
          '<div style="display:flex;gap:16px;margin-top:14px;color:rgba(180,200,255,0.7);font-size:12px">' +
            '<span><i class="fas fa-heart" style="color:#ff6b81"></i> ' + (memory.likes || 0) + '</span>' +
            '<span><i class="fas fa-eye"></i> ' + (memory.views || 0) + '</span>' +
            '<span><i class="fas fa-comment"></i> ' + (memory.comments || 0) + '</span>' +
          '</div>' +
          '<div style="margin-top:14px;text-align:right">' +
            '<button id="starmap-detail-close" style="background:rgba(100,140,255,0.2);border:1px solid rgba(100,140,255,0.3);color:rgba(200,220,255,0.9);padding:8px 20px;border-radius:20px;font-size:13px;cursor:pointer">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 点击遮罩关闭
    this._addListener(overlay, 'click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);

    // 关闭按钮
    this._addListener(document.getElementById('starmap-detail-close'), 'click', function() {
      overlay.remove();
    });
  },

  // ==================== 时光玩法（原有） ====================
  showTimeCapsule() {
    this.navigateTo('capsule');
  },

  buryCapsule() {
    const content = document.getElementById('capsule-content').value.trim();
    if (!content) {
      this.toast('请填写胶囊内容');
      return;
    }
    const unlockSelect = document.getElementById('capsule-unlock');
    let unlockDate = new Date();
    if (unlockSelect.value === 'custom') {
      const customDate = prompt('请输入解锁日期（格式：YYYY-MM-DD）：', unlockDate.toISOString().split('T')[0]);
      if (customDate) unlockDate = new Date(customDate);
    } else {
      const years = { '1year': 1, '5year': 5, '10year': 10 };
      const addYears = years[unlockSelect.value] || 1;
      unlockDate.setFullYear(unlockDate.getFullYear() + addYears);
    }

    const capsule = {
      id: 'm' + Date.now(),
      recipient: document.getElementById('capsule-recipient').value,
      recipientName: document.getElementById('capsule-recipient').selectedOptions[0].text,
      unlockTime: unlockDate.toISOString().split('T')[0],
      content,
      photo: this.uploadData.capsuleImg,
      style: document.querySelector('.capsule-style.active')?.dataset.style || 'classic',
      createdAt: new Date().toISOString().split('T')[0]
    };
    DB.capsules.push(capsule);
    DB.save(['capsules']);
    this.toast('时光胶囊已埋下');
    document.getElementById('capsule-content').value = '';
    this.renderCapsules();
  },

  renderCapsules() {
    const container = document.getElementById('my-capsules');
    if (!container) return;
    container.innerHTML = DB.capsules.map(c => {
      const isUnlocked = new Date(c.unlockTime) <= new Date();
      return `
      <div class="capsule-item ${isUnlocked ? 'unlocked' : ''}">
        <div class="capsule-item-header">
          <span class="capsule-item-title">给${escHtml(c.recipientName)}的胶囊</span>
          <span class="capsule-item-date">${Utils.formatDate(c.createdAt)}</span>
        </div>
        <div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">${escHtml(c.content.substring(0, 50))}...</div>
        <div class="capsule-countdown"><i class="fas ${isUnlocked ? 'fa-unlock' : 'fa-hourglass-half'}"></i> ${isUnlocked ? '已解锁' : Utils.formatCountdown(c.unlockTime)}</div>
        ${isUnlocked ? `<div class="capsule-unlocked-content">${escHtml(c.content)}</div>` : ''}
      </div>
    `}).join('');
  },

  showMemoryRoutes() {
    this.navigateTo('routes');
  },

  renderRoutes() {
    const container = document.getElementById('routes-list');
    if (!container) return;
    container.innerHTML = DB.routes.map(r => `
      <div class="route-card">
        <div style="position:relative;">
          <img src="${r.image}" alt="${r.title}">
          ${r.official ? `<div class="official-badge"><i class="fas fa-certificate"></i> ${r.officialBadge || '官方认证'}</div>` : ''}
        </div>
        <div class="route-info">
          <div class="route-title">${r.title}</div>
          <div class="route-desc">${r.desc}</div>
          <div class="route-meta">
            <span><i class="fas fa-clock"></i> ${r.duration}</span>
            <span><i class="fas fa-walking"></i> ${r.distance}</span>
            <button class="route-btn" onclick="app.showRouteDetail(${r.id})">查看路线</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  showRouteDetail(id) {
    const route = DB.routes.find(r => r.id === id);
    if (!route) return;
    document.getElementById('route-detail-title').textContent = route.title;
    document.getElementById('route-detail-content').innerHTML = `
      <div style="position:relative;">
        <img src="${route.image}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:16px;">
        ${route.official ? `<div class="official-badge" style="top:12px;left:12px;"><i class="fas fa-certificate"></i> ${route.officialBadge || '官方认证'}</div>` : ''}
      </div>
      <p style="color:var(--text-light);line-height:1.6;margin-bottom:16px;">${route.desc}</p>
      <div style="display:flex;gap:16px;margin-bottom:20px;font-size:14px;color:var(--text-light);">
        <span><i class="fas fa-clock"></i> ${route.duration}</span>
        <span><i class="fas fa-walking"></i> ${route.distance}</span>
        <span><i class="fas fa-map-pin"></i> ${route.stops.length} 个打卡点</span>
      </div>
      <div class="checkin-progress" id="checkin-progress"></div>
      <button class="checkin-btn" id="checkin-btn" onclick="app.checkinRoute(${route.id})"><i class="fas fa-map-marker-alt"></i> 打卡当前站点</button>
      <div class="route-stops" style="margin-top:24px;">
        <h3 style="margin-bottom:12px;">路线站点</h3>
        ${route.stops.map((s, i) => `
          <div class="route-stop" id="stop-${i}">
            <div class="stop-number">${i + 1}</div>
            <div class="stop-info">
              <div class="stop-name">${escHtml(s.name)}</div>
              <div class="stop-desc">${escHtml(s.desc)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    this.navigateTo('route-detail');
    this._addTimer(setTimeout(() => this.renderCheckinProgress(route.id), 100));
  },

  renderCheckinProgress(routeId) {
    const route = DB.routes.find(r => r.id === routeId);
    const completions = Storage.get('routeCheckins') || {};
    const checked = completions[routeId] || 0;
    const total = route.stops.length;
    let html = '';
    for (let i = 0; i < total; i++) {
      const cls = i < checked ? 'done' : i === checked ? 'current' : '';
      html += `<div class="checkin-dot ${cls}"></div>`;
      if (i < total - 1) html += `<div class="checkin-line ${i < checked ? 'done' : ''}"></div>`;
    }
    document.getElementById('checkin-progress').innerHTML = html;
    const btn = document.getElementById('checkin-btn');
    if (checked >= total) {
      btn.innerHTML = '<i class="fas fa-check-circle"></i> 已完成路线';
      btn.disabled = true;
      document.getElementById('route-detail-content').innerHTML += `
        <div class="route-complete">
          <div class="route-complete-icon"><i class="fas fa-medal"></i></div>
          <h3>恭喜完成「${escHtml(route.title)}」</h3>
          <p style="color:var(--text-light);margin-top:8px;">获得路线征服者勋章</p>
        </div>
      `;
      this.checkBadge(6);
    } else {
      btn.innerHTML = `<i class="fas fa-map-marker-alt"></i> 打卡：${route.stops[checked].name}`;
    }
  },

  checkinRoute(routeId) {
    const completions = Storage.get('routeCheckins') || {};
    const checked = (completions[routeId] || 0) + 1;
    completions[routeId] = checked;
    Storage.set('routeCheckins', completions);
    const completionsArr = Storage.get('routeCompletions') || [];
    if (!completionsArr.includes(routeId)) completionsArr.push(routeId);
    Storage.set('routeCompletions', completionsArr);
    this.toast('打卡成功');
    this.renderCheckinProgress(routeId);
  },

  showTimePost() {
    this.navigateTo('post');
    const select = document.getElementById('pc-memory-select');
    select.innerHTML = '<option value="">请选择一张记忆...</option>' +
      DB.memories.map(m => `<option value="${m.id}">${escHtml(m.title)}</option>`).join('');
    document.getElementById('pc-from').textContent = DB.currentUser.nickname;
    this.renderPostLists();
  },

  changePostcardMemory() {
    const id = parseInt(document.getElementById('pc-memory-select').value);
    const m = DB.memories.find(x => x.id === id);
    if (m) {
      document.getElementById('pc-img').src = m.oldImages[0];
      document.getElementById('pc-title').textContent = m.title;
    }
  },

  sendPostcard() {
    const memoryId = parseInt(document.getElementById('pc-memory-select').value);
    const to = document.getElementById('pc-to').value.trim();
    const message = document.getElementById('pc-message').value.trim();
    if (!memoryId) { this.toast('请选择一张记忆'); return; }
    if (!to) { this.toast('请填写收件人'); return; }
    const m = DB.memories.find(x => x.id === memoryId);
    const postcard = {
      id: 'm' + Date.now(),
      memoryId,
      title: m.title,
      image: m.oldImages[0],
      to,
      from: DB.currentUser.nickname,
      message,
      date: new Date().toISOString().split('T')[0]
    };
    if (!DB.postcards) DB.postcards = [];
    DB.postcards.push(postcard);
    Storage.set('postcards', DB.postcards);
    this.toast('明信片已寄出');
    document.getElementById('pc-message').value = '';
    document.getElementById('pc-to').value = '';
    this.renderPostLists();
  },

  renderPostLists() {
    const sentList = document.getElementById('post-sent-list');
    const receivedList = document.getElementById('post-received-list');
    const postcards = DB.postcards || [];
    const renderItem = pc => `
      <div class="post-item">
        <img src="${pc.image}" alt="${pc.title}">
        <div class="post-item-info">
          <div class="post-item-title">${escHtml(pc.title)}</div>
          <div class="post-item-desc">寄给：${escHtml(pc.to)} · ${pc.date}</div>
          ${pc.message ? `<div style="font-size:12px;color:var(--text-light);margin-top:4px;">${escHtml(pc.message)}</div>` : ''}
        </div>
      </div>
    `;
    sentList.innerHTML = postcards.filter(pc => pc.from === DB.currentUser.nickname).map(renderItem).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">暂无寄出的明信片</div>';
    receivedList.innerHTML = postcards.filter(pc => pc.to === DB.currentUser.nickname).map(renderItem).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">暂无收到的明信片</div>';
  },

  showQuiz() {
    this.navigateTo('quiz');
    document.getElementById('quiz-start').style.display = 'block';
    document.getElementById('quiz-game').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
  },

  startQuiz() {
    DB.state.quizScore = 0;
    DB.state.quizIndex = 0;
    document.getElementById('quiz-score').textContent = '0';
    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'block';
    this.renderQuizQuestion();
  },

  renderQuizQuestion() {
    const q = DB.quizQuestions[DB.state.quizIndex];
    if (!q) {
      this.showQuizResult();
      return;
    }
    const progress = ((DB.state.quizIndex) / DB.quizQuestions.length) * 100;
    document.getElementById('quiz-progress').style.width = progress + '%';

    let html = '';
    if (q.image) {
      html += `<img src="${q.image}" alt="题目图片" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px;">`;
    }
    html += `<p>${q.question}</p>`;
    document.getElementById('quiz-question').innerHTML = html;

    document.getElementById('quiz-options').innerHTML = q.options.map((opt, i) => `
      <div class="quiz-option" onclick="app.answerQuiz(${i})">${opt}</div>
    `).join('');
  },

  answerQuiz(index) {
    const q = DB.quizQuestions[DB.state.quizIndex];
    const options = document.querySelectorAll('.quiz-option');
    options[index].classList.add(index === q.answer ? 'correct' : 'wrong');
    if (index === q.answer) {
      DB.state.quizScore += 20;
      document.getElementById('quiz-score').textContent = DB.state.quizScore;
    }
    if (q.answer !== index) {
      options[q.answer].classList.add('correct');
    }
    this._addTimer(setTimeout(() => {
      DB.state.quizIndex++;
      this.renderQuizQuestion();
    }, 1000));
  },

  showQuizResult() {
    document.getElementById('quiz-game').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('final-score').textContent = DB.state.quizScore;
    const badgeEl = document.getElementById('quiz-badge');
    if (DB.state.quizScore >= 80) {
      badgeEl.innerHTML = '<div style="margin-top:16px;padding:12px;background:#FFF8E1;border-radius:8px;color:var(--accent);"><i class="fas fa-medal"></i> 解锁勋章：怀旧智者</div>'; // 静态文本无需转义
      const badge = DB.badges.find(b => b.id === 8);
      if (badge) badge.unlocked = true;
    } else {
      badgeEl.innerHTML = '';
    }
  },

  showBlindBox() {
    this.navigateTo('blindbox');
    document.getElementById('blindbox-result').innerHTML = '';
  },

  openBlindBox() {
    const box = document.getElementById('blindbox-box');
    box.classList.add('shake');
    this._addTimer(setTimeout(() => {
      box.classList.remove('shake');
      const randomMemory = DB.memories[Math.floor(Math.random() * DB.memories.length)];
      document.getElementById('blindbox-result').innerHTML = `
        <div class="float-up">
          <div style="background:var(--bg-card);border-radius:12px;padding:16px;box-shadow:0 4px 12px var(--shadow);margin-top:16px;">
            <img src="${randomMemory.oldImages[0]}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;">
            <div style="font-weight:600;margin-bottom:4px;">${escHtml(randomMemory.title)}</div>
            <span style="background:var(--primary-light);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-size:12px;">${escHtml(randomMemory.year)}</span>
            <p style="font-size:13px;color:var(--text-light);margin-top:8px;line-height:1.5;">${escHtml(randomMemory.story.substring(0, 60))}...</p>
            <button class="next-btn" style="margin-top:12px;" onclick="app.openDetail(${randomMemory.id})">查看详情</button>
          </div>
        </div>
      `;
    }, 600));
  },

  showCalendar() {
    this.navigateTo('calendar');
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    document.getElementById('calendar-date').textContent = `${month}月${day}日`;
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const todayPattern = `-${monthStr}-${dayStr}`;
    const todayMemories = DB.memories.filter(m => m.createdAt.includes(todayPattern));
    const container = document.getElementById('calendar-memories');
    container.innerHTML = todayMemories.map(m => `
      <div class="calendar-card" onclick="app.openDetail(${m.id})">
        <img src="${m.oldImages[0]}" alt="${m.title}">
        <div class="calendar-card-body">
          <div class="calendar-card-title">${escHtml(m.title)}</div>
          <span class="calendar-card-year">${escHtml(m.year)}</span>
          <p style="font-size:13px;color:var(--text-light);margin-top:6px;line-height:1.5;">${escHtml(m.story.substring(0, 60))}...</p>
        </div>
      </div>
    `).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">历史上的今天暂无记忆</div>';
  },

  // ==================== 个人中心 ====================
  renderProfile() {
    document.getElementById('profile-name').textContent = DB.currentUser.nickname;
    document.getElementById('profile-bio').textContent = DB.currentUser.bio;
    document.getElementById('stat-memories').textContent = DB.currentUser.memoryCount;
    document.getElementById('stat-likes').textContent = DB.currentUser.likeCount;
    document.getElementById('stat-cities').textContent = DB.currentUser.exploredCities;
  },

  showMyUploads() {
    const container = document.getElementById('myuploads-list');
    const myMemories = DB.memories.filter(m => m.userId === DB.currentUser.id);
    container.innerHTML = myMemories.map(m => `
      <div class="myupload-card">
        <img src="${m.oldImages[0]}" alt="${m.title}">
        <div class="myupload-info">
          <div class="myupload-title">${escHtml(m.title)}</div>
          <span class="myupload-status status-${m.status === '已发布' ? 'approved' : m.status === '待审核' ? 'pending' : 'rejected'}">${m.status}</span>
          <div class="myupload-stats"><i class="fas fa-heart"></i> ${m.likes} · <i class="fas fa-comment"></i> ${m.comments}</div>
        </div>
      </div>
    `).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">暂无上传记录</div>';
    this.navigateTo('myuploads');
  },

  showMyFavorites() {
    const container = document.getElementById('myfavorites-list');
    const favMemories = DB.memories.filter(m => DB.favorites.includes(m.id));
    container.innerHTML = favMemories.map(m => `
      <div class="myfav-card" onclick="app.openDetail(${m.id})">
        <img src="${m.oldImages[0]}" alt="${m.title}">
        <div class="myfav-info">
          <div class="myfav-title">${escHtml(m.title)}</div>
          <span style="background:var(--primary-light);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-size:12px;">${escHtml(m.year)}</span>
          <div class="myfav-stats"><i class="fas fa-heart"></i> ${m.likes}</div>
        </div>
      </div>
    `).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">暂无收藏</div>';
    this.navigateTo('myfavorites');
  },

  showMyFootprint() {
    document.getElementById('fp-memories').textContent = DB.footprints.length;
    document.getElementById('fp-cities').textContent = DB.currentUser.exploredCities;
    document.getElementById('fp-routes').textContent = Storage.get('routeCompletions')?.length || 0;
    const listContainer = document.getElementById('footprint-list');
    if (listContainer) {
      const footprintMemories = DB.memories.filter(m => DB.footprints.includes(m.id));
      listContainer.innerHTML = footprintMemories.map(m => `
        <div class="footprint-card" onclick="app.openDetail(${m.id})">
          <img src="${m.oldImages[0]}" alt="${m.title}">
          <div class="footprint-card-info">
            <div class="footprint-card-title">${escHtml(m.title)}</div>
            <span class="footprint-card-year">${escHtml(m.year)}</span>
            <div class="footprint-card-meta">${escHtml(m.city)} · ${escHtml(m.address || '')}</div>
          </div>
        </div>
      `).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">还没有足迹，快去探索吧</div>';
    }
    this.navigateTo('footprint');
    this._addTimer(setTimeout(() => this.initFootprintMap(), 200));
  },

  initFootprintMap() {
    const container = document.getElementById('footprint-map');
    if (!container || container.dataset.initialized) return;
    container.innerHTML = '';
    try {
      const map = L.map(container).setView([35.42, 119.531], 12);
      L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图'
      }).addTo(map);
      DB.footprints.forEach(id => {
        const m = DB.memories.find(x => x.id === id);
        if (!m) return;
        const color = this.getMarkerColor(m.year);
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:34px;position:relative;"><div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fas fa-map-pin" style="transform:rotate(45deg);color:#fff;font-size:11px;"></i></div></div>`,
          iconSize: [28, 34], iconAnchor: [14, 34]
        });
        L.marker([m.lat, m.lng], { icon }).addTo(map)
          .bindPopup(`<b>${m.title}</b><br>${m.year}`);
      });
      container.dataset.initialized = 'true';
    } catch(e) { console.error('初始化失败:', e); this.toast('初始化失败，请刷新重试'); }
  },

  showMyCapsules() {
    this.navigateTo('capsule');
    document.querySelectorAll('.capsule-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.capsule-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('.capsule-tab[data-tab="list"]').classList.add('active');
    document.getElementById('capsule-list').classList.add('active');
  },

  showBadges() {
    this.navigateTo('badges');
  },

  renderBadges() {
    const container = document.getElementById('badges-grid');
    if (!container) return;
    container.innerHTML = DB.badges.map(b => `
      <div class="badge-item ${b.unlocked ? '' : 'locked'}">
        <div class="badge-icon"><i class="fas ${b.icon}"></i></div>
        <div class="badge-name">${escHtml(b.name)}</div>
        <div class="badge-desc">${escHtml(b.desc)}</div>
      </div>
    `).join('');
  },

  showSettings() {
    this.navigateTo('settings');
    document.getElementById('setting-nickname').innerHTML = `${escHtml(DB.currentUser.nickname)} <i class="fas fa-chevron-right"></i>`;
    document.getElementById('setting-bio').innerHTML = `${escHtml(DB.currentUser.bio)} <i class="fas fa-chevron-right"></i>`;
    const themeNames = { '': '复古怀旧', 'dark': '深色模式', 'modern': '现代简约' };
    const currentTheme = document.documentElement.dataset.theme || '';
    document.getElementById('setting-theme').innerHTML = `${themeNames[currentTheme]} <i class="fas fa-chevron-right"></i>`;
  },

  showThemePicker() {
    const themes = [
      { key: '', name: '复古怀旧', icon: 'fa-sun' },
      { key: 'dark', name: '深色模式', icon: 'fa-moon' },
      { key: 'modern', name: '现代简约', icon: 'fa-bolt' }
    ];
    const current = document.documentElement.dataset.theme || '';
    const currentIndex = themes.findIndex(t => t.key === current);
    const next = themes[(currentIndex + 1) % themes.length];
    this.setTheme(next.key);
    document.getElementById('setting-theme').innerHTML = `${next.name} <i class="fas fa-chevron-right"></i>`;
    this.toast(`已切换至「${next.name}」`);
  },

  setTheme(theme) {
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
    Storage.set('theme', theme);
  },

  editNickname() {
    this.editField = 'nickname';
    document.getElementById('edit-title').textContent = '修改昵称';
    document.getElementById('edit-input').value = DB.currentUser.nickname;
    document.getElementById('edit-modal').classList.add('show');
  },

  editBio() {
    this.editField = 'bio';
    document.getElementById('edit-title').textContent = '修改简介';
    document.getElementById('edit-input').value = DB.currentUser.bio;
    document.getElementById('edit-modal').classList.add('show');
  },

  hideEdit() {
    document.getElementById('edit-modal').classList.remove('show');
    this.editField = null;
  },

  saveEdit() {
    const value = document.getElementById('edit-input').value.trim();
    if (!value) { this.toast('内容不能为空'); return; }
    if (this.editField === 'nickname') {
      DB.currentUser.nickname = value;
      this.toast('昵称已更新');
    } else if (this.editField === 'bio') {
      DB.currentUser.bio = value;
      this.toast('简介已更新');
    }
    this.renderProfile();
    this.showSettings();
    this.hideEdit();
  },

  // ==================== 文创商城 ====================
  showShop() {
    this.navigateTo('shop');
  },

  renderShop(category = 'all') {
    const container = document.getElementById('shop-grid');
    if (!container) return;
    let products = DB.products;
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    container.innerHTML = products.map(p => `
      <div class="shop-card" onclick="app.showProduct(${p.id})">
        <img src="${p.image}" alt="${p.name}">
        <div class="shop-info">
          <div class="shop-name">${p.name}</div>
          <div class="shop-price">¥${p.price}</div>
        </div>
      </div>
    `).join('');
  },

  showProduct(id) {
    const p = DB.products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('product-content').innerHTML = `
      <div class="product-images"><img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;"></div>
      <div class="product-title">${p.name}</div>
      <div class="product-price">¥${p.price}</div>
      <div class="product-desc">${p.desc}</div>
      <button class="buy-btn" onclick="app.toast('已加入购物车')"><i class="fas fa-shopping-cart"></i> 加入购物车</button>
    `;
    this.navigateTo('product');
  },

  // ==================== 城市选择 ====================
  showCityPicker() {
    const picker = document.getElementById('city-picker');
    const citiesHtml = `
      <div class="city-picker-regions">
      <div class='city-tag ${DB.state.currentCity === '日照' ? 'active' : ''}' onclick='app.selectCity("日照")'>日照</div>
      <div class='city-tag ${DB.state.currentCity === '北京' ? 'active' : ''}' onclick='app.selectCity("北京")'>北京</div>
      <div class='city-tag ${DB.state.currentCity === '天津' ? 'active' : ''}' onclick='app.selectCity("天津")'>天津</div>
      <div class='city-tag ${DB.state.currentCity === '上海' ? 'active' : ''}' onclick='app.selectCity("上海")'>上海</div>
      <div class='city-tag ${DB.state.currentCity === '南京' ? 'active' : ''}' onclick='app.selectCity("南京")'>南京</div>
      <div class='city-tag ${DB.state.currentCity === '杭州' ? 'active' : ''}' onclick='app.selectCity("杭州")'>杭州</div>
      <div class='city-tag ${DB.state.currentCity === '苏州' ? 'active' : ''}' onclick='app.selectCity("苏州")'>苏州</div>
      <div class='city-tag ${DB.state.currentCity === '青岛' ? 'active' : ''}' onclick='app.selectCity("青岛")'>青岛</div>
      <div class='city-tag ${DB.state.currentCity === '厦门' ? 'active' : ''}' onclick='app.selectCity("厦门")'>厦门</div>
      <div class='city-tag ${DB.state.currentCity === '广州' ? 'active' : ''}' onclick='app.selectCity("广州")'>广州</div>
      <div class='city-tag ${DB.state.currentCity === '深圳' ? 'active' : ''}' onclick='app.selectCity("深圳")'>深圳</div>
      <div class='city-tag ${DB.state.currentCity === '武汉' ? 'active' : ''}' onclick='app.selectCity("武汉")'>武汉</div>
      <div class='city-tag ${DB.state.currentCity === '长沙' ? 'active' : ''}' onclick='app.selectCity("长沙")'>长沙</div>
      <div class='city-tag ${DB.state.currentCity === '成都' ? 'active' : ''}' onclick='app.selectCity("成都")'>成都</div>
      <div class='city-tag ${DB.state.currentCity === '重庆' ? 'active' : ''}' onclick='app.selectCity("重庆")'>重庆</div>
      <div class='city-tag ${DB.state.currentCity === '昆明' ? 'active' : ''}' onclick='app.selectCity("昆明")'>昆明</div>
      <div class='city-tag ${DB.state.currentCity === '拉萨' ? 'active' : ''}' onclick='app.selectCity("拉萨")'>拉萨</div>
      <div class='city-tag ${DB.state.currentCity === '西安' ? 'active' : ''}' onclick='app.selectCity("西安")'>西安</div>
      <div class='city-tag ${DB.state.currentCity === '哈尔滨' ? 'active' : ''}' onclick='app.selectCity("哈尔滨")'>哈尔滨</div>
      <div class='city-tag ${DB.state.currentCity === '沈阳' ? 'active' : ''}' onclick='app.selectCity("沈阳")'>沈阳</div>
      <div class='city-tag ${DB.state.currentCity === '大连' ? 'active' : ''}' onclick='app.selectCity("大连")'>大连</div>
      </div>
    `;
    const existingContent = picker.querySelector('.city-picker-content');
    if (existingContent) {
      existingContent.innerHTML = citiesHtml;
    } else {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'city-picker-content';
      contentDiv.innerHTML = citiesHtml;
      picker.appendChild(contentDiv);
    }
    picker.classList.add('show');
  },

  hideCityPicker() {
    document.getElementById('city-picker').classList.remove('show');
  },

  selectCity(city) {
    DB.state.currentCity = city;
    document.getElementById('current-city').textContent = city;
    this.hideCityPicker();
    // 从 DB.chinaCities 获取城市坐标和缩放级别
    const cityData = DB.chinaCities ? DB.chinaCities.find(c => c.name === city) : null;
    let coords, zoom;
    if (cityData) {
      coords = cityData.center;
      zoom = cityData.zoom || 12;
    } else {
      // 日照使用默认坐标
      const fallbackCoords = { '日照': [35.42, 119.531] };
      coords = fallbackCoords[city] || [35.42, 119.531];
      zoom = 13;
    }
    if (this.map) this.map.flyTo(coords, zoom);
    // 更新城市标签激活状态
    document.querySelectorAll('.city-tag').forEach(t => t.classList.toggle('active', t.textContent === city));
    this.toast(`已切换到 ${city}`);
    this.renderDiscover();
    this.filterMapMarkers();
    // 保存城市状态
    DB.save(['state']);
  },

  // ==================== 语音播放 ====================
  playVoice(url) {
    const bar = document.getElementById('voice-player');
    const progress = document.getElementById('voice-progress');
    if (!url) { this.toast('暂无语音'); return; }
    bar.classList.add('show');
    progress.style.width = '0%';
    if (this.voiceInterval) clearInterval(this.voiceInterval);
    if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null; }
    try {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
        }
      });
      audio.addEventListener('ended', () => this.stopVoice());
      audio.addEventListener('error', () => {
        this.toast('语音播放失败');
        this.stopVoice();
      });
      audio.play().catch(err => {
        console.error('播放失败:', err);
        this.toast('语音播放失败');
        this.stopVoice();
      });
    } catch (err) {
      console.error('Audio初始化失败:', err);
      this.toast('您的浏览器不支持语音播放');
      this.stopVoice();
    }
  },

  stopVoice() {
    const bar = document.getElementById('voice-player');
    bar.classList.remove('show');
    if (this.voiceInterval) { clearInterval(this.voiceInterval); this.voiceInterval = null; }
  },

  // ==================== 分享功能 ====================
  shareWeixin() { this.toast('请使用微信分享'); this.hideShare(); },
  shareMoments() { this.toast('请使用朋友圈分享'); this.hideShare(); },
  shareWeibo() { this.toast('请使用微博分享'); this.hideShare(); },

  copyLink() {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => this.toast('链接已复制'));
    this.hideShare();
  },

  generatePoster() {
    this.hideShare();
    const m = DB.memories.find(x => x.id === DB.state.currentMemoryId);
    const canvas = document.getElementById('poster-canvas');
    canvas.innerHTML = `
      <img src="${m ? m.oldImages[0] : 'https://picsum.photos/seed/poster/400/500'}" alt="海报">
      <div class="poster-overlay">
        <div class="poster-title">${m ? m.title : '城市微记忆'}</div>
        <div class="poster-subtitle">扫码查看更多城市记忆</div>
      </div>
      <div class="poster-qr">二维码</div>
    `;
    document.getElementById('poster-modal').classList.add('show');
  },

  hidePoster() {
    document.getElementById('poster-modal').classList.remove('show');
  },

  downloadPoster() {
    this.toast('海报已保存（模拟）');
    this.hidePoster();
  },

  changeAvatar() {
    const seeds = ['user', 'city', 'memory', 'old', 'retro', 'vintage', 'travel'];
    const seed = seeds[Math.floor(Math.random() * seeds.length)] + Date.now();
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    DB.currentUser.avatar = newAvatar;
    document.querySelector('.profile-avatar img').src = newAvatar;
    const settingAvatar = document.querySelector('.setting-avatar');
    if (settingAvatar) settingAvatar.src = newAvatar;
    this.toast('头像已更换');
  },

  showImagePreview(url) {
    const modal = document.getElementById('image-preview-modal');
    document.getElementById('image-preview-img').src = url;
    modal.classList.add('show');
  },

  hideImagePreview() {
    document.getElementById('image-preview-modal').classList.remove('show');
  },

  scrollToTop() {
    document.getElementById('page-discover').scrollTo({ top: 0, behavior: 'smooth' });
  },

  clearSearch() {
    const input = document.getElementById('discover-search');
    input.value = '';
    this.renderDiscover();
    const clearBtn = document.querySelector('.search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
  },

  // ==================== 非遗寻访专区 ====================
  showHeritageZone() {
    this.navigateTo('heritage');
    this.switchHeritageTab('heritage');
  },

  switchHeritageTab(tab) {
    document.querySelectorAll('.heritage-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.heritage-tab[data-tab="${tab}"]`)?.classList.add('active');
    if (tab === 'heritage') this.renderHeritage();
    else this.renderTimehonored();
  },

  renderHeritage() {
    const container = document.getElementById('heritage-content');
    if (!container) return;
    container.innerHTML = DB.heritage.map(h => `
      <div class="heritage-card">
        <img src="${h.image}" alt="${h.title}">
        <div class="heritage-info">
          <div class="heritage-title">${h.title}</div>
          <div class="heritage-location"><i class="fas fa-map-marker-alt"></i> ${h.location}</div>
          <div class="heritage-desc">${h.desc}</div>
          <span class="heritage-tag">非物质文化遗产</span>
        </div>
      </div>
    `).join('');
  },

  renderTimehonored() {
    const container = document.getElementById('heritage-content');
    if (!container) return;
    container.innerHTML = DB.timehonored.map(t => `
      <div class="heritage-card">
        <img src="${t.image}" alt="${t.title}">
        <div class="heritage-info">
          <div class="heritage-title">${t.title}</div>
          <div class="heritage-location"><i class="fas fa-map-marker-alt"></i> ${t.location}</div>
          <div class="heritage-desc">${t.desc}</div>
          <span class="heritage-tag timehonored">老字号</span>
        </div>
      </div>
    `).join('');
  },

  // ==================== 文旅活动 ====================
  showActivities() {
    this.navigateTo('activities');
    this.renderActivities();
  },

  renderActivities() {
    const container = document.getElementById('activities-list');
    if (!container) return;
    container.innerHTML = DB.activities.map(a => `
      <div class="activity-card">
        <img src="${a.image}" alt="${a.title}">
        <div class="activity-info">
          <div class="activity-header">
            <span class="activity-tag ${a.status === '进行中' ? 'ongoing' : 'upcoming'}">${a.status}</span>
            <span class="activity-tag">${a.tag}</span>
          </div>
          <div class="activity-title">${a.title}</div>
          <div class="activity-desc">${a.desc}</div>
          <div class="activity-meta">
            <span><i class="fas fa-user"></i> ${a.participants} 人参与</span>
            <span><i class="fas fa-calendar"></i> 截止 ${a.endDate}</span>
          </div>
          <button class="activity-btn" onclick="app.joinActivity(${a.id})">立即参与</button>
        </div>
      </div>
    `).join('');
  },

  joinActivity(id) {
    const activity = DB.activities.find(a => a.id === id);
    if (activity) {
      activity.participants++;
      this.toast(`已参与「${activity.title}」`);
      this.renderActivities();
    }
  },

  // ==================== 研学闯关 ====================
  showChallenge() {
    this.navigateTo('challenge');
    document.getElementById('challenge-start').style.display = 'block';
    document.getElementById('challenge-game').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'none';
  },

  startChallenge() {
    DB.state.quizChallengeLevel = 1;
    DB.state.quizChallengeScore = 0;
    DB.state.quizChallengeLives = 3;
    DB.state.quizChallengeIndex = 0;
    document.getElementById('challenge-start').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'none';
    document.getElementById('challenge-game').style.display = 'block';
    this.renderChallengeQuestion();
  },

  renderChallengeQuestion() {
    const questions = DB.quizQuestions;
    const idx = DB.state.quizChallengeIndex;
    if (idx >= questions.length || DB.state.quizChallengeLives <= 0) {
      this.showChallengeResult();
      return;
    }
    const q = questions[idx];
    const progress = ((idx) / questions.length) * 100;
    document.getElementById('challenge-progress').style.width = progress + '%';
    document.getElementById('challenge-level').textContent = DB.state.quizChallengeLevel;
    document.getElementById('challenge-score').textContent = DB.state.quizChallengeScore;
    document.getElementById('challenge-lives').innerHTML = Array(3).fill(0).map((_, i) => `<i class="${i < DB.state.quizChallengeLives ? 'fas' : 'far'} fa-heart"></i>`).join('');

    let html = '';
    if (q.image) {
      html += `<img src="${q.image}" alt="题目图片" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px;">`;
    }
    html += `<p>${q.question}</p>`;
    document.getElementById('challenge-question').innerHTML = html;
    document.getElementById('challenge-options').innerHTML = q.options.map((opt, i) => `
      <div class="quiz-option" onclick="app.answerChallenge(${i})">${opt}</div>
    `).join('');
  },

  answerChallenge(index) {
    const q = DB.quizQuestions[DB.state.quizChallengeIndex];
    const options = document.querySelectorAll('#challenge-options .quiz-option');
    options[index].classList.add(index === q.answer ? 'correct' : 'wrong');
    if (index === q.answer) {
      DB.state.quizChallengeScore += 20 * DB.state.quizChallengeLevel;
      DB.state.quizChallengeLevel++;
    } else {
      DB.state.quizChallengeLives--;
      options[q.answer].classList.add('correct');
    }
    this._addTimer(setTimeout(() => {
      DB.state.quizChallengeIndex++;
      this.renderChallengeQuestion();
    }, 1000));
  },

  showChallengeResult() {
    document.getElementById('challenge-game').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'block';
    const score = DB.state.quizChallengeScore;
    document.getElementById('challenge-final-score').textContent = score;
    const title = document.getElementById('challenge-result-title');
    const desc = document.getElementById('challenge-result-desc');
    const badge = document.getElementById('challenge-badge');
    if (score >= 100) {
      title.textContent = '闯关大师';
      desc.textContent = '恭喜你完成所有关卡，城市知识达人！';
      badge.innerHTML = '<div style="margin-top:16px;padding:12px;background:#FFF8E1;border-radius:8px;color:var(--accent);"><i class="fas fa-medal"></i> 解锁勋章：研学达人</div>';
      this.checkBadge(10);
    } else if (score >= 60) {
      title.textContent = '闯关完成';
      desc.textContent = '表现不错，继续加油！';
      badge.innerHTML = '';
    } else {
      title.textContent = '闯关失败';
      desc.textContent = '别灰心，再试一次吧！';
      badge.innerHTML = '';
    }
  },

  // ==================== 时空同框 ====================
  showTimeTravel() {
    const m = DB.memories.find(x => x.id === DB.state.currentMemoryId);
    document.getElementById('timetravel-old-img').src = m ? m.oldImages[0] : 'https://picsum.photos/seed/old/300/300';
    document.getElementById('timetravel-new-img').style.display = 'none';
    document.getElementById('timetravel-upload-area').style.display = 'flex';
    document.getElementById('timetravel-result').style.display = 'none';
    document.getElementById('timetravel-generate-btn').disabled = true;
    document.getElementById('timetravel-share-btn').style.display = 'none';
    this.timeTravelNewImg = null;
    document.getElementById('timetravel-modal').classList.add('show');
  },

  hideTimeTravel() {
    document.getElementById('timetravel-modal').classList.remove('show');
  },

  uploadTimeTravelPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.timeTravelNewImg = ev.target.result;
        const img = document.getElementById('timetravel-new-img');
        img.src = ev.target.result;
        img.style.display = 'block';
        document.getElementById('timetravel-upload-area').style.display = 'none';
        document.getElementById('timetravel-generate-btn').disabled = false;
        this.toast('照片已选择');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  generateTimeTravel() {
    if (!this.timeTravelNewImg) return;
    this.toast('正在生成时空同框照...');
    this._addTimer(setTimeout(() => {
      const m = DB.memories.find(x => x.id === DB.state.currentMemoryId);
      const oldImg = m ? m.oldImages[0] : null;
      if (!oldImg || !this.timeTravelNewImg) {
        this.toast('概念演示：请将两张照片叠加对比');
        return;
      }
      const resultImg = document.getElementById('timetravel-result-img');
      resultImg.src = oldImg;
      document.getElementById('timetravel-result').style.display = 'block';
      document.getElementById('timetravel-generate-btn').style.display = 'none';
      document.getElementById('timetravel-share-btn').style.display = 'block';
      this.toast('时空同框照生成成功！（概念演示：请将两张照片叠加对比）');
    }, 1500));
  },

  shareTimeTravel() {
    this.toast('已生成分享海报');
    this.hideTimeTravel();
  },

  // ==================== 私人记忆 ====================
  showPrivateMemories() {
    this.navigateTo('private');
    this.renderPrivateList();
    this._addTimer(setTimeout(() => this.initPrivateMap(), 200));
  },

  renderPrivateList() {
    const container = document.getElementById('private-list');
    if (!container) return;
    const list = DB.privateMemories || [];
    container.innerHTML = list.map(p => `
      <div class="private-card">
        <img src="${p.oldImages[0]}" alt="${p.title}">
        <div class="private-info">
          <div class="private-title">${escHtml(p.title)}</div>
          <div class="private-address"><i class="fas fa-map-marker-alt"></i> ${escHtml(p.address || p.city)}</div>
          <div class="private-story">${escHtml(p.story.substring(0, 60))}...</div>
          <div class="private-tags">${p.tags.map(t => `<span class="private-tag">${escHtml(t)}</span>`).join('')}</div>
          <div class="private-meta">
            <span><i class="fas fa-lock"></i> ${p.privacy === 'private' ? '私密' : '已公开'}</span>
            <span>${p.familyMembers.length > 0 ? '<i class="fas fa-users"></i> ' + p.familyMembers.length + '位家人' : ''}</span>
          </div>
          <div class="private-actions">
            ${p.privacy === 'private' && !p.publicApplied ? `<button class="private-btn" onclick="app.showPublicApply('${p.id}')"><i class="fas fa-globe"></i> 申请公开</button>` : ''}
            ${p.publicApplied ? '<span style="font-size:12px;color:var(--text-muted);"><i class="fas fa-clock"></i> 审核中</span>' : ''}
            <button class="private-btn secondary" onclick="app.showFamilyInvite('${p.id}')"><i class="fas fa-user-plus"></i> 邀请家人</button>
          </div>
        </div>
      </div>
    `).join('') || '<div style="text-align:center;padding:40px;color:var(--text-light);">还没有私人记忆，去上传吧</div>';
  },

  initPrivateMap() {
    const container = document.getElementById('private-map');
    if (!container || container.dataset.initialized) return;
    try {
      const map = L.map(container);{
      const cityData = DB.chinaCities ? DB.chinaCities.find(c => c.name === DB.state.currentCity) : null;
      const center = cityData ? cityData.center : [35.42, 119.531];
      const zoom = cityData ? (cityData.zoom || 12) : 13;
      this.map.setView(center, zoom);
    }
      L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: '1234', maxZoom: 19, attribution: '&copy; 高德地图'
      }).addTo(map);
      DB.privateMemories.forEach(p => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fas fa-home" style="color:#fff;font-size:14px;"></i></div>`,
          iconSize: [32, 32], iconAnchor: [16, 16]
        });
        L.marker([p.lat, p.lng], { icon }).addTo(map)
          .bindPopup(`<b>${p.title}</b><br>${p.address || p.city}`);
      });
      container.dataset.initialized = 'true';
    } catch(e) { console.error('初始化失败:', e); this.toast('初始化失败，请刷新重试'); }
  },

  togglePrivateLayer() {
    const checked = document.getElementById('private-layer-toggle')?.checked;
    DB.state.showPrivateLayer = checked;
    this.toast(checked ? '私人记忆图层已开启' : '私人记忆图层已关闭');
  },

  showPublicApply(id) {
    DB.state.currentPrivateId = id;
    document.getElementById('public-apply-agree').checked = false;
    document.getElementById('public-apply-modal').classList.add('show');
  },

  hidePublicApply() {
    document.getElementById('public-apply-modal').classList.remove('show');
  },

  submitPublicApply() {
    if (!document.getElementById('public-apply-agree').checked) {
      this.toast('请先同意公开协议');
      return;
    }
    const p = DB.privateMemories.find(x => x.id === DB.state.currentPrivateId);
    if (p) {
      p.publicApplied = true;
      this.toast('已提交公开申请，审核通过后将进入公共地图');
      this.hidePublicApply();
      this.renderPrivateList();
    }
  },

  showFamilyInvite(id) {
    DB.state.currentPrivateId = id;
    const p = DB.privateMemories.find(x => x.id === id);
    document.getElementById('family-invite-link').value = '';
    const membersContainer = document.getElementById('family-members');
    if (membersContainer && p) {
      membersContainer.innerHTML = p.familyMembers.length > 0
        ? `<div style="margin-bottom:12px;"><strong>已邀请家人：</strong> ${p.familyMembers.join('、')}</div>`
        : '<div style="color:var(--text-muted);font-size:13px;margin-bottom:12px;">还没有邀请家人</div>';
    }
    document.getElementById('family-invite-modal').classList.add('show');
  },

  hideFamilyInvite() {
    document.getElementById('family-invite-modal').classList.remove('show');
  },

  generateFamilyInvite() {
    const p = DB.privateMemories.find(x => x.id === DB.state.currentPrivateId);
    if (!p) return;
    const link = `https://citymemory.cn/invite/${p.id}?t=${Date.now()}`;
    document.getElementById('family-invite-link').value = link;
    this.toast('邀请链接已生成');
  },

  copyFamilyLink() {
    const input = document.getElementById('family-invite-link');
    if (input.value) {
      navigator.clipboard?.writeText(input.value);
      this.toast('链接已复制');
    }
  },

  // ===== 社交功能方法 =====

  // 关注动态
  // 消息中心
  showNotifications() {
    this.navigateTo('notifications');
    this.renderNotifications();
  },
  renderNotifications() {
    const list = document.getElementById('notif-list');
    let html = '';
    const iconMap = { system: 'fa-bullhorn', like: 'fa-heart', comment: 'fa-comment', relay: 'fa-exchange-alt', circle: 'fa-users', follow: 'fa-user-plus', capsule: 'fa-hourglass-half' };
    DB.notifications.forEach(n => {
      html += `<div class="notif-item ${n.read ? '' : 'unread'}">
        <div class="notif-icon ${n.type}"><i class="fas ${iconMap[n.type] || 'fa-bell'}"></i></div>
        <div class="notif-body">
          <div class="notif-title">${escHtml(n.title)}</div>
          <div class="notif-desc">${escHtml(n.content)}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>`;
    });
    list.innerHTML = html;
    // 隐藏红点
    const dot = document.getElementById('notif-dot');
    if (dot) dot.style.display = 'none';
  },
  markAllRead() {
    DB.notifications.forEach(n => n.read = true);
    this.renderNotifications();
    this.toast('已全部标记为已读');
  },

  // 话题圈子列表
  showCircles() {
    this.navigateTo('circles');
    const list = document.getElementById('circles-list');
    const colors = ['#c0392b', '#e67e22', '#3498db', '#8e44ad'];
    let html = '';
    DB.circles.forEach((c, i) => {
      html += `<div class="circle-card" onclick="app.showCircleDetail(${c.id})">
        <div class="circle-card-header">
          <div class="circle-card-icon" style="background:${colors[i]}"><i class="fas fa-hashtag"></i></div>
          <div class="circle-card-info">
            <div class="circle-card-title">${escHtml(c.title)}</div>
            <div class="circle-card-desc">${escHtml(c.desc)}</div>
          </div>
          <button class="circle-card-join-btn joined">已加入</button>
        </div>
        <div class="circle-card-stats">
          <span><i class="fas fa-users"></i>${c.members} 成员</span>
          <span><i class="fas fa-file-alt"></i>${c.posts} 帖子</span>
          <span><i class="fas fa-images"></i>${c.count} 记忆</span>
        </div>
      </div>`;
    });
    list.innerHTML = html;
  },
  // 圈子详情
  showCircleDetail(circleId) {
    this.navigateTo('circle-detail');
    const circle = DB.circles.find(c => c.id === circleId);
    if (!circle) return;
    document.getElementById('circle-detail-title').textContent = circle.title;
    const content = document.getElementById('circle-detail-content');
    let pinnedHtml = '';
    if (circle.pinned && circle.pinned.length) {
      pinnedHtml = `<div class="circle-pinned"><h4><i class="fas fa-thumbtack"></i> 置顶精华</h4>`;
      circle.pinned.forEach(p => {
        pinnedHtml += `<div class="circle-pinned-item" onclick="app.openDetail(${p.memoryId})">${p.title}</div>`;
      });
      pinnedHtml += '</div>';
    }
    content.innerHTML = `
      <div class="circle-detail-header-info">
        <h3>${escHtml(circle.title)}</h3>
        <p>${escHtml(circle.desc)}</p>
      </div>
      <div class="circle-detail-stats">
        <span><div class="num">${circle.members}</div><div class="label">成员</div></span>
        <span><div class="num">${circle.posts}</div><div class="label">帖子</div></span>
        <span><div class="num">${circle.count}</div><div class="label">记忆</div></span>
      </div>
      ${pinnedHtml}
      <div style="padding:16px">
        <div class="feed-item" style="cursor:pointer" onclick="app.showComingSoon('发帖功能')">
          <div style="text-align:center;padding:20px;color:var(--muted,#7f8c8d)">
            <i class="fas fa-pen" style="font-size:20px;margin-bottom:6px;display:block"></i>
            在圈子中分享你的记忆...
          </div>
        </div>
      </div>`;
  },

  // 记忆接力列表
  showRelay() {
    this.navigateTo('relay');
    const list = document.getElementById('relay-list');
    let html = '<h3 style="padding:0 4px;margin-bottom:12px;font-size:15px;color:var(--ink,#2c3e50)">这些地标正在接力中</h3>';
    DB.memoryRelay.forEach(r => {
      html += `<div class="relay-card" onclick="app.showRelayTimeline(${r.landmarkId})">
        <div class="relay-card-title">${escHtml(r.landmarkTitle)}</div>
        <div class="relay-card-meta">
          <span><i class="fas fa-users"></i> ${r.timeline.length} 人接力</span>
          <span><i class="fas fa-calendar"></i> ${r.timeline[0].year} - ${r.timeline[r.timeline.length-1].year}</span>
        </div>
        <div class="relay-card-preview">
          ${r.timeline.map(t => `<div class="relay-card-thumb"><img src="${t.image}" alt=""><span class="year-tag">${t.year}</span></div>`).join('')}
          <div class="relay-add-btn" onclick="event.stopPropagation();app.showComingSoon('接力上传')"><i class="fas fa-plus"></i></div>
        </div>
      </div>`;
    });
    list.innerHTML = html;
  },
  // 接力时间线
  showRelayTimeline(landmarkId) {
    this.navigateTo('relay-timeline');
    const relay = DB.memoryRelay.find(r => r.landmarkId === landmarkId);
    if (!relay) return;
    document.getElementById('relay-timeline-title').textContent = relay.landmarkTitle;
    const content = document.getElementById('relay-timeline-content');
    let html = '<div class="timeline-line">';
    relay.timeline.forEach(t => {
      html += `<div class="timeline-item">
        <div class="timeline-year">${t.year}</div>
        <div class="timeline-card">
          <img src="${t.image}" alt="">
          <div class="timeline-card-story">${escHtml(t.story)}</div>
          <div class="timeline-card-author">
            <span>${escHtml(t.authorName)}</span>
            <div class="timeline-card-stats">
              <span><i class="fas fa-heart"></i> ${t.likes}</span>
              <span><i class="fas fa-comment"></i></span>
            </div>
          </div>
        </div>
      </div>`;
    });
    html += `<div class="timeline-add-btn" onclick="app.showComingSoon('接力上传')"><i class="fas fa-plus"></i>接力你的记忆</div>`;
    html += '</div>';
    content.innerHTML = html;
  },

  // 用户主页
  showUserProfile(userId) {
    this.navigateTo('user-profile');
    const user = DB.users.find(u => u.id === userId);
    if (!user) return;
    const levelInfo = DB.levelSystem.find(l => l.level === user.level);
    const isFollowing = DB.currentUser.following.includes(userId);
    const userMemories = DB.memories.filter(m => m.userId === userId);
    const content = document.getElementById('user-profile-content');
    let memoriesHtml = '';
    userMemories.forEach(m => {
      memoriesHtml += `<div class="user-memory-grid-item" onclick="app.openDetail(${m.id})">
        <img src="${m.oldImages[0]}" alt="">
        <div class="title">${m.title}</div>
        <div class="meta">${m.year} · ${m.likes} 赞</div>
      </div>`;
    });
    content.innerHTML = `
      <div class="user-profile-banner">
        <div class="user-profile-avatar-wrap">
          <img src="${user.avatar}" alt="">
          <span class="user-profile-level-badge">${user.levelName}</span>
        </div>
      </div>
      <div class="user-profile-info">
        <div class="user-profile-name">${user.nickname} ${user.isExpert ? '<i class="fas fa-check-circle" style="color:#3498db;font-size:14px"></i>' : ''}</div>
        <div class="user-profile-bio">${escHtml(user.bio)}</div>
        <div class="user-profile-stats-row">
          <div class="stat-item"><span class="stat-num">${user.memoryCount}</span><span class="stat-label">记忆</span></div>
          <div class="stat-item"><span class="stat-num">${user.followerCount}</span><span class="stat-label">粉丝</span></div>
          <div class="stat-item"><span class="stat-num">${user.followingCount}</span><span class="stat-label">关注</span></div>
          <div class="stat-item"><span class="stat-num">${user.likeCount}</span><span class="stat-label">获赞</span></div>
        </div>
      </div>
      <div class="user-profile-actions">
        <button class="follow-btn ${isFollowing ? 'is-following' : 'not-following'}" onclick="app.toggleFollow('${userId}')">
          ${isFollowing ? '<i class="fas fa-check"></i> 已关注' : '<i class="fas fa-plus"></i> 关注'}
        </button>
        <button class="follow-btn not-following" onclick="app.showComingSoon('私信功能')" style="flex:0.6"><i class="fas fa-envelope"></i> 私信</button>
      </div>
      <div class="user-profile-memories">
        <h3>${user.nickname}的记忆 (${userMemories.length})</h3>
        <div class="user-memory-grid">${memoriesHtml || '<div style="text-align:center;color:var(--muted,#7f8c8d);padding:20px">暂无公开记忆</div>'}</div>
      </div>`;
  },
  // 关注/取消关注
  toggleFollow(userId) {
    const idx = DB.currentUser.following.indexOf(userId);
    if (idx > -1) {
      DB.currentUser.following.splice(idx, 1);
      const user = DB.users.find(u => u.id === userId);
      if (user) user.followerCount--;
      this.toast('已取消关注');
    } else {
      DB.currentUser.following.push(userId);
      const user = DB.users.find(u => u.id === userId);
      if (user) user.followerCount++;
      this.toast('关注成功');
    }
    DB.save(['currentUser']);
    this.showUserProfile(userId);
  },

  // 附近记忆者
  showNearby() {
    this.navigateTo('nearby');
    const list = document.getElementById('nearby-list');
    let html = `<div class="nearby-header"><p>附近有 <strong>${DB.nearbyUsers.length}</strong> 位记忆者正在探索</p></div>`;
    DB.nearbyUsers.forEach(u => {
      html += `<div class="nearby-user-card">
        <img src="${u.avatar}" alt="">
        <div class="nearby-user-info">
          <div class="nearby-user-name">${escHtml(u.nickname)}</div>
          <div class="nearby-user-status">${escHtml(u.status)}</div>
          <div class="nearby-user-meta">
            <span class="distance"><i class="fas fa-map-marker-alt"></i> ${u.distance}</span>
            <span><i class="fas fa-star"></i> ${u.levelName}</span>
          </div>
        </div>
        <button class="nearby-greet-btn" onclick="app.showComingSoon('打招呼功能')"><i class="fas fa-hand-wave"></i> 打招呼</button>
      </div>`;
    });
    list.innerHTML = html;
  },

  // 本周最佳记忆投票
  showWeeklyBest() {
    this.navigateTo('weekly-best');
    const content = document.getElementById('weekly-best-content');
    let html = `<div class="weekly-best-banner">
      <h3><i class="fas fa-trophy"></i> 本周最佳记忆评选</h3>
      <p>投票截止：${DB.weeklyBest.endTime}</p>
    </div>`;
    DB.weeklyBest.candidates.sort((a,b) => b.votes - a.votes).forEach((c, i) => {
      html += `<div class="weekly-candidate">
        <img src="${c.image}" alt="">
        <div class="weekly-candidate-info">
          <div class="weekly-candidate-title">${i + 1}. ${escHtml(c.title)}</div>
          <div class="weekly-candidate-author">by ${escHtml(c.authorName)}</div>
          <div class="vote-count"><i class="fas fa-fire"></i> ${c.votes} 票</div>
        </div>
        <button class="vote-btn ${DB.weeklyBest.userVoted ? 'voted' : ''}" onclick="app.voteWeekly(${c.memoryId})">
          <i class="fas fa-thumbs-up"></i> ${DB.weeklyBest.userVoted ? '已投' : '投票'}
        </button>
      </div>`;
    });
    content.innerHTML = html;
  },
  voteWeekly(memoryId) {
    if (DB.weeklyBest.userVoted) { this.toast('你已经投过票了'); return; }
    DB.weeklyBest.userVoted = true;
    const c = DB.weeklyBest.candidates.find(x => x.memoryId === memoryId);
    if (c) c.votes++;
    DB.save(['weeklyBest']);
    this.showWeeklyBest();
    this.toast('投票成功！');
  },

  // 等级体系
  showLevel() {
    this.navigateTo('level');
    const user = DB.currentUser;
    const currentLevel = DB.levelSystem.find(l => l.level === user.level);
    const nextLevel = DB.levelSystem.find(l => l.level === user.level + 1);
    const expPercent = currentLevel ? Math.min(((user.exp - currentLevel.minExp) / (currentLevel.maxExp - currentLevel.minExp)) * 100, 100) : 100;
    const content = document.getElementById('level-content');
    let html = `<div class="level-current">
      <div class="level-current-icon"><i class="fas ${currentLevel.icon}"></i></div>
      <div class="level-current-name">${currentLevel.name}</div>
      <div class="level-exp-bar">
        <div class="level-exp-bar-bg"><div class="level-exp-bar-fill" style="width:${expPercent}%"></div></div>
        <div class="level-exp-text">${user.exp} / ${currentLevel.maxExp} 经验值</div>
      </div>
      ${nextLevel ? `<p style="font-size:12px;opacity:0.8;margin-top:8px">距离「${nextLevel.name}」还需 ${nextLevel.minExp - user.exp} 经验</p>` : '<p style="font-size:12px;opacity:0.8;margin-top:8px">已达最高等级</p>'}
    </div><div class="level-list"><h3>等级说明</h3>`;
    DB.levelSystem.forEach(l => {
      const locked = user.level < l.level;
      html += `<div class="level-item ${user.level === l.level ? 'active' : ''} ${locked ? 'locked' : ''}">
        <div class="level-item-icon" style="background:${l.color}20;color:${l.color}"><i class="fas ${l.icon}"></i></div>
        <div class="level-item-info">
          <div class="level-item-name">Lv.${l.level} ${l.name}</div>
          <div class="level-item-range">${l.minExp} - ${l.maxExp} 经验值</div>
        </div>
        ${locked ? '<i class="fas fa-lock" style="color:var(--muted,#95a5a6)"></i>' : user.level === l.level ? '<i class="fas fa-check-circle" style="color:var(--accent,#c0392b)"></i>' : ''}
      </div>`;
    });
    html += '</div>';
    content.innerHTML = html;
  },

  // 路线排行榜
  showRouteLeaderboard() {
    this.navigateTo('leaderboard');
    const content = document.getElementById('leaderboard-content');
    content.innerHTML = `
      <div class="weekly-best-banner" style="background:linear-gradient(135deg,#2ecc71,#27ae60)">
        <h3><i class="fas fa-trophy"></i> 路线打卡排行榜</h3>
        <p>完成更多路线，登上排行榜</p>
      </div>
      <div class="route-leaderboard">
        ${DB.routeLeaderboard.map((u, i) => {
          const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
          const isSelf = u.userId === 'u001';
          return `<div class="leaderboard-item ${isSelf ? 'leaderboard-self' : ''}">
            <div class="leaderboard-rank ${rankClass}">${i + 1}</div>
            <img class="leaderboard-avatar" src="${u.avatar}" alt="">
            <div class="leaderboard-info">
              <div class="leaderboard-name">${u.userName} ${isSelf ? '(我)' : ''}</div>
              <div class="leaderboard-meta">完成 ${u.completedRoutes} 条路线 · ${u.totalCheckins} 次打卡</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  },

  // 社交化时光邮局 - 寄给好友
  showTimePostSocial() {
    this.showTimePost();
    this._addTimer(setTimeout(() => {
      const sendSection = document.querySelector('.postcard-send-section');
      if (!sendSection) return;
      const recipientHtml = `<div class="postcard-recipient-section">
        <label style="font-size:13px;color:var(--ink,#2c3e50);font-weight:600;margin-bottom:6px;display:block">寄给好友（可选）</label>
        <div class="postcard-recipient-input">
          <i class="fas fa-search" style="color:var(--muted,#95a5a6)"></i>
          <input type="text" placeholder="搜索好友..." id="postcard-recipient-search" oninput="app.filterFriendSuggest(this.value)">
        </div>
        <div class="friend-suggest-list" id="friend-suggest-list">
          ${DB.users.filter(u => DB.currentUser.following.includes(u.id)).map(u => `
            <div class="friend-suggest-item" onclick="app.selectPostcardRecipient('${u.id}')">
              <img src="${u.avatar}" alt=""> ${escHtml(u.nickname)}
            </div>
          `).join('')}
        </div>
      </div>`;
      sendSection.insertAdjacentHTML('beforebegin', recipientHtml);
    }, 100));
  },
  filterFriendSuggest(keyword) {
    const list = document.getElementById('friend-suggest-list');
    if (!list) return;
    const followingSet = new Set(DB.currentUser.following);
    const friends = DB.users.filter(u => followingSet.has(u.id));
    const filtered = keyword ? friends.filter(u => u.nickname.includes(keyword)) : friends;
    list.innerHTML = filtered.map(u => `<div class="friend-suggest-item" onclick="app.selectPostcardRecipient('${u.id}')"><img src="${u.avatar}" alt=""> ${escHtml(u.nickname)}</div>`).join('');
  },
  selectPostcardRecipient(userId) {
    const user = DB.users.find(u => u.id === userId);
    const input = document.getElementById('postcard-recipient-search');
    if (input) input.value = user.nickname;
    const list = document.getElementById('friend-suggest-list');
    if (list) list.style.display = 'none';
    this.toast('已选择：' + user.nickname);
  },

  // 生成分享记忆卡片
  showShareCard(memoryId) {
    const memory = DB.memories.find(m => m.id === memoryId);
    if (!memory) return;
    const modal = document.getElementById('memory-detail');
    const extra = document.createElement('div');
    extra.id = 'share-card-overlay';
    extra.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center';
    extra.innerHTML = `<div style="width:300px;max-width:90vw;background:#fff;border-radius:16px;overflow:hidden">
      <div class="share-card-preview" style="margin:0;border-radius:0">
        <img src="${memory.oldImages[0]}" alt="">
        <div class="card-body">
          <h4>${escHtml(memory.title)}</h4>
          <p>${escHtml(memory.story.substring(0, 60))}...</p>
        </div>
        <div class="card-footer">城市微记忆 · ${memory.year} · 扫码查看更多</div>
      </div>
      <div class="share-actions">
        <button class="share-action-btn weixin" onclick="app.toast('分享到微信')"><i class="fab fa-weixin"></i>微信</button>
        <button class="share-action-btn moments" onclick="app.toast('分享到朋友圈')"><i class="fas fa-circle"></i>朋友圈</button>
        <button class="share-action-btn weibo" onclick="app.toast('分享到微博')"><i class="fab fa-weibo"></i>微博</button>
        <button class="share-action-btn link" onclick="app.toast('链接已复制')"><i class="fas fa-link"></i>复制链接</button>
      </div>
      <div style="text-align:center;padding-bottom:16px">
        <button onclick="document.getElementById('share-card-overlay').remove()" style="background:none;border:none;font-size:14px;color:var(--muted,#7f8c8d);cursor:pointer">取消</button>
      </div>
    </div>`;
    extra.onclick = (e) => { if (e.target === extra) extra.remove(); };
    document.body.appendChild(extra);
  },

  // ==================== 记忆碎片收集模块（盲盒收集游戏化） ====================

  // 显示碎片收集页面
  showFragments() {
    this.navigateTo('fragments');
    this.renderFragments();
  },

  // 渲染碎片收集UI（碎片进度条 + 地标打卡列表）
  renderFragments() {
    const container = document.getElementById('fragments-content');
    if (!container) return;

    const fragments = DB.fragments;
    const collectedCount = fragments.filter(f => f.collected).length;
    const totalCount = fragments.length;
    const progress = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

    // 碎片进度条（3x3网格，中间空）
    let gridHtml = '<div class="fragments-grid">';
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        // 中间空格：显示进度百分比
        gridHtml += `<div class="fragment-cell fragment-center">
          <div class="fragment-progress">${progress}%</div>
          <div class="fragment-count">${collectedCount}/${totalCount}</div>
        </div>`;
      } else {
        const frag = fragments[i < 4 ? i : i - 1];
        if (frag) {
          if (frag.collected) {
            // 已收集：显示地标缩略图 + 金色边框
            const memory = DB.memories.find(m => m.id === frag.memoryId);
            const thumb = memory && memory.oldImages && memory.oldImages[0] ? memory.oldImages[0] : '';
            gridHtml += `<div class="fragment-cell fragment-collected" title="${escHtml(frag.title)}">
              ${thumb ? `<img src="${thumb}" alt="${frag.title}" class="fragment-thumb">` : `<i class="fas ${frag.icon}"></i>`}
              <span class="fragment-label">${escHtml(frag.title)}</span>
            </div>`;
          } else {
            // 未收集：灰色半透明
            gridHtml += `<div class="fragment-cell fragment-locked">
              <i class="fas fa-question"></i>
            </div>`;
          }
        } else {
          gridHtml += `<div class="fragment-cell fragment-empty"></div>`;
        }
      }
    }
    gridHtml += '</div>';

    // 地标打卡列表
    let listHtml = '<div class="fragment-landmark-list">';
    fragments.forEach(frag => {
      const memory = DB.memories.find(m => m.id === frag.memoryId);
      if (!memory) return;
      const thumb = memory.oldImages && memory.oldImages[0] ? memory.oldImages[0] : '';
      listHtml += `<div class="fragment-landmark-card ${frag.collected ? 'collected' : ''}">
        <div class="fragment-landmark-img">
          ${thumb ? `<img src="${thumb}" alt="${memory.title}">` : '<i class="fas fa-image"></i>'}
        </div>
        <div class="fragment-landmark-info">
          <h4>${escHtml(memory.title)}</h4>
          <p>${escHtml(memory.year)} · ${escHtml(memory.address || '')}</p>
          ${frag.collected ? `<span class="fragment-collected-badge"><i class="fas fa-check-circle"></i> 已收集</span>` : ''}
        </div>
        <button class="fragment-checkin-btn ${frag.collected ? 'checked' : ''}" onclick="app.collectFragment(${frag.memoryId})" ${frag.collected ? 'disabled' : ''}>
          <i class="fas ${frag.collected ? 'fa-check' : 'fa-map-pin'}"></i>
          ${frag.collected ? '已打卡' : '打卡'}
        </button>
      </div>`;
    });
    listHtml += '</div>';

    container.innerHTML = `
      <div class="fragments-header-area">
        <div class="fragments-title">
          <i class="fas fa-puzzle-piece"></i> 记忆碎片
        </div>
        <p class="fragments-subtitle">打卡城市地标，收集8枚记忆碎片，解锁专属城市故事</p>
        <div class="fragments-progress-bar">
          <div class="fragments-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="fragments-progress-text">收集进度 ${collectedCount}/${totalCount}</div>
      </div>
      ${gridHtml}
      ${listHtml}
    `;
  },

  // 打卡收集碎片，更新进度
  collectFragment(memoryId) {
    const frag = DB.fragments.find(f => f.memoryId === memoryId);
    if (!frag || frag.collected) return;

    frag.collected = true;
    frag.collectedAt = new Date().toISOString();
    DB.save(['fragments', 'storyUnlocked', 'storyEndings']);

    // 播放金色粒子动画
    this.showCollectAnimation(memoryId);

    // 重新渲染
    this.renderFragments();

    const memory = DB.memories.find(m => m.id === memoryId);
    this.toast(`收集成功！${memory ? memory.title : '碎片'} 已解锁`);

    // 检查是否全部收集
    this.checkAllCollected();
  },

  // 金色粒子动画（CSS动画）
  showCollectAnimation(memoryId) {
    const card = document.querySelector(`.fragment-landmark-card button[onclick="app.collectFragment(${memoryId})"]`);
    if (!card) return;
    const parentCard = card.closest('.fragment-landmark-card');

    // 创建粒子容器
    const particles = document.createElement('div');
    particles.className = 'collect-particles';
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--y', (Math.random() * -80 - 20) + 'px');
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      particles.appendChild(p);
    }
    parentCard.appendChild(particles);

    // 动画结束后移除
    this._addTimer(setTimeout(() => {
      if (particles.parentNode) particles.parentNode.removeChild(particles);
    }, 1000));
  },

  // 检查是否全部收集，解锁奖励
  checkAllCollected() {
    const allCollected = DB.fragments.every(f => f.collected);
    if (allCollected && !DB.storyUnlocked) {
      DB.storyUnlocked = true;
      DB.save(['fragments', 'storyUnlocked', 'storyEndings']);

      // 弹出"城市故事"奖励弹窗
      this._addTimer(setTimeout(() => {
        this.showStoryRewardModal();
      }, 800));
    }
  },

  // 城市故事奖励弹窗
  showStoryRewardModal() {
    const overlay = document.createElement('div');
    overlay.className = 'story-reward-overlay';
    overlay.innerHTML = `
      <div class="story-reward-modal">
        <div class="story-reward-sparkles"></div>
        <div class="story-reward-icon"><i class="fas fa-trophy"></i></div>
        <h2>恭喜！全部碎片已收集</h2>
        <p>你已成功收集所有8枚记忆碎片</p>
        <p class="story-reward-hint">解锁奖励：城市故事「日照往事」</p>
        <div class="story-reward-actions">
          <button class="story-reward-btn primary" onclick="app.showStory(); this.closest('.story-reward-overlay').remove();">
            <i class="fas fa-book-open"></i> 开始阅读
          </button>
          <button class="story-reward-btn" onclick="this.closest('.story-reward-overlay').remove();">
            稍后再看
          </button>
        </div>
      </div>
    `;
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  },

  // ==================== 互动分支叙事模块（城市故事） ====================

  // 叙事打字机定时器
  _storyTypeTimer: null,

  // 显示互动叙事页面
  showStory() {
    this.navigateTo('story');
    this.resetStory();
  },

  // 渲染互动叙事UI
  renderStory() {
    const container = document.getElementById('story-content');
    if (!container) return;

    // 获取当前故事节点
    const currentNode = DB.storyNodes[DB.state.currentStoryNode || 'start'];
    if (!currentNode) return;

    // 判断是否为结局
    const isEnding = currentNode.isEnding;

    // 已到达的结局列表
    const endings = this.getStoryEndings();
    const totalEndings = Object.values(DB.storyNodes).filter(n => n.isEnding).length;

    container.innerHTML = `
      <div class="story-scene">
        ${isEnding ? `
          <div class="story-ending-badge">
            <i class="fas ${currentNode.endingIcon}"></i>
            <span>${currentNode.endingTitle}</span>
          </div>
        ` : ''}
        <div class="story-text" id="story-text"></div>
        <div class="story-choices" id="story-choices" style="display:none;"></div>
        ${isEnding ? `
          <div class="story-ending-actions">
            <button class="story-restart-btn" onclick="app.resetStory()">
              <i class="fas fa-redo"></i> 重新开始
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // 打字机效果：文字逐字显示
    this.typewriterEffect(currentNode.text, () => {
      if (!isEnding) {
        this.renderStoryChoices(currentNode.choices);
      } else {
        // 记录结局到 localStorage
        this.recordEnding(currentNode);
      }
    });
  },

  // 打字机效果
  typewriterEffect(text, callback) {
    // 清除之前的定时器
    if (this._storyTypeTimer) {
      clearTimeout(this._storyTypeTimer);
      this._storyTypeTimer = null;
    }

    const textEl = document.getElementById('story-text');
    if (!textEl) return;

    let index = 0;
    textEl.textContent = '';

    const typeChar = () => {
      if (index < text.length) {
        textEl.textContent += text[index];
        index++;
        // 中文标点稍微停顿
        const delay = /[，。！？、；：]/.test(text[index - 1]) ? 80 : 35;
        this._storyTypeTimer = this._addTimer(setTimeout(typeChar, delay));
      } else {
        textEl.textContent = text;
        if (callback) callback();
      }
    };
    typeChar();

    // 点击跳过打字效果
    textEl.onclick = () => {
      if (this._storyTypeTimer) {
        clearTimeout(this._storyTypeTimer);
        this._storyTypeTimer = null;
      }
      textEl.textContent = text;
      if (callback) callback();
      textEl.onclick = null;
    };
  },

  // 渲染故事选择按钮
  renderStoryChoices(choices) {
    const container = document.getElementById('story-choices');
    if (!container) return;

    container.innerHTML = choices.map((choice, i) => `
      <button class="story-choice-btn" style="animation-delay:${i * 0.1}s" onclick="app.navigateStory('${choice.next}')">
        <i class="fas ${choice.icon}"></i>
        <span>${choice.text}</span>
        <i class="fas fa-chevron-right choice-arrow"></i>
      </button>
    `).join('');

    // 显示选择按钮
    container.style.display = 'block';
  },

  // 根据选择导航到下一个节点
  navigateStory(nodeId) {
    DB.state.currentStoryNode = nodeId;
    this.renderStory();
  },

  // 重新开始故事
  resetStory() {
    if (this._storyTypeTimer) {
      clearTimeout(this._storyTypeTimer);
      this._storyTypeTimer = null;
    }
    DB.state.currentStoryNode = 'start';
    this.renderStory();
  },

  // 记录已达成的结局
  recordEnding(node) {
    if (!DB.storyEndings) DB.storyEndings = [];
    const endingKey = DB.state.currentStoryNode;
    if (!DB.storyEndings.includes(endingKey)) {
      DB.storyEndings.push(endingKey);
      DB.save(['storyEndings']);
      const endings = this.getStoryEndings();
      const totalEndings = Object.values(DB.storyNodes).filter(n => n.isEnding).length;
      this.toast(`达成结局「${node.endingTitle}」(${endings.length}/${totalEndings})`);
    }
  },

  // 获取所有已达成的结局
  getStoryEndings() {
    if (!DB.storyEndings) DB.storyEndings = [];
    return DB.storyEndings.map(key => {
      const node = DB.storyNodes[key];
      return node ? { key, title: node.endingTitle, icon: node.endingIcon } : null;
    }).filter(Boolean);
  }
};

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
