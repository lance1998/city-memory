/**
 * 城市微记忆 V2.1 差异化功能补丁
 * 6个独有功能：变迁预览卡片、城市记忆浓度、年代氛围色瓦片滤镜、
 *             点击涟漪、标记年代色边框、城市年谱
 *
 * 设计原则：作为补丁挂载到 app 对象上，不修改原始 app.js
 * 适配远程仓库的 marker 系统（L.layerGroup + L.divIcon + marker.memoryId）
 */

(function() {
  'use strict';

  const V21 = {
    /* ========== 配置 ========== */

    // 年代氛围色配置 — 每个年代对应独特的色调
    yearAtmosphere: {
      'all':  { hue: 0,   sat: 0,  light: 0,  label: '全部年代',  color: 'transparent' },
      '70s':  { hue: 42,  sat: 60, light: 8,  label: '70年代 · 暖黄', color: '#b8962e' },
      '80s':  { hue: 15,  sat: 65, light: 6,  label: '80年代 · 橙红', color: '#c75b39' },
      '90s':  { hue: 145, sat: 40, light: 5,  label: '90年代 · 翠绿', color: '#5B8C5A' },
      '00s':  { hue: 205, sat: 50, light: 5,  label: '00年代 · 静蓝', color: '#4a7c9b' },
      '10s':  { hue: 270, sat: 35, light: 5,  label: '10年代 · 靛紫', color: '#7b6b8d' }
    },

    // 年代到 CSS filter 的映射
    yearFilters: {
      '70s': 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)',
      '80s': 'sepia(0.2) saturate(1.1) hue-rotate(10deg)',
      '90s': 'saturate(1.3) brightness(1.05)',
      '00s': 'saturate(0.9) brightness(1.1) hue-rotate(5deg)',
      '10s': 'saturate(1.1) contrast(1.05)'
    },

    _popup: null,          // 当前预览 popup
    _densityLayers: null,   // 浓度圆环图层
    _densityVisible: false,
    _atmosphereOverlay: null,  // 年代氛围色覆盖层
    _rippleTimers: [],

    /* ========== 1. 变迁预览卡片 ========== */
    // 悬停 marker 时弹出老/新照片对比预览

    _getMemoryImages(m) {
      // 适配两种数据格式：landmarks 用 newImages(数组)，memories 用 newImage(字符串)
      const oldImg = m.oldImages && m.oldImages[0] ? m.oldImages[0] : '';
      const newImg = m.newImages ? (m.newImages[0] || '') : (m.newImage || '');
      return { oldImg, newImg };
    },

    showPreview(mem, e) {
      this.hidePreview();
      if (!app.map || !mem) return;

      const { oldImg, newImg } = this._getMemoryImages(mem);
      const color = app.getMarkerColor(mem.year);

      const html = `
        <div class="v21-preview-card">
          <div class="v21-preview-compare">
            ${oldImg ? `<div class="v21-preview-side v21-preview-old">
              <img src="${oldImg}" alt="旧" loading="lazy">
              <span class="v21-preview-label">旧</span>
            </div>` : '<div class="v21-preview-side v21-preview-empty">暂无旧照</div>'}
            ${newImg ? `<div class="v21-preview-side v21-preview-new">
              <img src="${newImg}" alt="新" loading="lazy">
              <span class="v21-preview-label">新</span>
            </div>` : '<div class="v21-preview-side v21-preview-empty">暂无新照</div>'}
          </div>
          <div class="v21-preview-info">
            <span class="v21-preview-title">${escHtml(mem.title)}</span>
            <span class="v21-preview-meta" style="color:${color}">${escHtml(mem.city)} · ${escHtml(mem.year || '')}</span>
          </div>
        </div>`;

      const popup = L.popup({
        closeButton: false,
        className: 'v21-preview-popup',
        offset: [0, -40],
        minWidth: 220,
        maxWidth: 280,
        autoPan: false
      })
      .setLatLng([mem.lat, mem.lng])
      .setContent(html)
      .openOn(app.map);

      this._popup = popup;
    },

    hidePreview() {
      if (this._popup) {
        app.map.closePopup(this._popup);
        this._popup = null;
      }
    },

    // 绑定 marker hover 事件
    _bindMarkerHover() {
      if (!app.markerLayer) return;
      // 使用 mouseover/mouseout 实现悬停预览
      app.markerLayer.on('mouseover', (e) => {
        const memId = e.layer.memoryId;
        if (memId === undefined) return;
        const mem = DB.memories.find(m => m.id === memId);
        if (mem) this.showPreview(mem, e);
      });
      app.markerLayer.on('mouseout', (e) => {
        this.hidePreview();
      });
    },

    /* ========== 2. 城市记忆浓度可视化 ========== */
    // 在地图上显示每个城市的记忆密度，用脉冲圆环表示

    showCityDensity() {
      if (!app.map) return;

      // 如果已显示，则隐藏
      if (this._densityVisible) {
        this.hideCityDensity();
        return;
      }

      this._densityLayers = L.layerGroup().addTo(app.map);

      // 按城市聚合记忆数量
      const cityData = {};
      const allMemories = [
        ...DB.memories.filter(m => m.status === '已发布'),
        // 也包含全国城市数据中的 landmarks
        ...(DB.chinaCities || []).flatMap(c =>
          (c.landmarks || []).filter(l => l.status === '已发布').map(l => ({
            ...l, city: c.name,
            lat: l.lat, lng: l.lng
          }))
        )
      ];

      allMemories.forEach(m => {
        if (!cityData[m.city]) cityData[m.city] = { count: 0, lat: 0, lng: 0, memories: [] };
        cityData[m.city].count++;
        cityData[m.city].lat += m.lat;
        cityData[m.city].lng += m.lng;
        cityData[m.city].memories.push(m);
      });

      // 计算每个城市的中心点和圆环大小
      const maxCount = Math.max(...Object.values(cityData).map(c => c.count), 1);
      Object.entries(cityData).forEach(([city, data]) => {
        const lat = data.lat / data.count;
        const lng = data.lng / data.count;
        const ratio = data.count / maxCount;
        const baseSize = 30 + ratio * 80; // 30px ~ 110px
        const color = this._getCityColor(ratio);

        // 外圈脉冲
        const ring = L.divIcon({
          className: 'v21-density-icon',
          html: `
            <div class="v21-density-ring" style="
              width:${baseSize}px;height:${baseSize}px;
              border-color:${color};
              animation-duration:${2 + (1 - ratio) * 2}s;
            ">
              <div class="v21-density-ring-inner" style="border-color:${color};"></div>
              <span class="v21-density-count" style="color:${color};">${data.count}</span>
            </div>`,
          iconSize: [baseSize, baseSize],
          iconAnchor: [baseSize / 2, baseSize / 2]
        });

        const marker = L.marker([lat, lng], { icon: ring, interactive: false });
        this._densityLayers.addLayer(marker);
      });

      this._densityVisible = true;

      // 更新按钮状态
      const btn = document.getElementById('v21-density-btn');
      if (btn) btn.classList.add('active');
      app.toast && app.toast('城市记忆浓度已开启');
    },

    hideCityDensity() {
      if (this._densityLayers) {
        app.map.removeLayer(this._densityLayers);
        this._densityLayers = null;
      }
      this._densityVisible = false;
      const btn = document.getElementById('v21-density-btn');
      if (btn) btn.classList.remove('active');
    },

    _getCityColor(ratio) {
      // 低密度→冷色(#4a7c9b)，高密度→暖色(#c75b39)
      const r = Math.round(74 + ratio * 125);
      const g = Math.round(124 - ratio * 33);
      const b = Math.round(155 - ratio * 98);
      return `rgb(${r},${g},${b})`;
    },

    /* ========== 3. 年代氛围色瓦片滤镜 ========== */
    // 选择年代后，在地图上叠加半透明色调覆盖层

    applyYearAtmosphere(yearKey) {
      if (!app.map) return;

      // 移除已有覆盖层
      if (this._atmosphereOverlay) {
        app.map.removeLayer(this._atmosphereOverlay);
        this._atmosphereOverlay = null;
      }

      if (yearKey === 'all') return; // 全部年代不叠加

      const atmo = this.yearAtmosphere[yearKey];
      if (!atmo) return;

      // 创建半透明矩形覆盖层
      const bounds = app.map.getBounds();
      this._atmosphereOverlay = L.rectangle(bounds, {
        color: 'transparent',
        fillColor: atmo.color,
        fillOpacity: 0.12,
        interactive: false
      }).addTo(app.map);

      // 地图移动时更新覆盖层范围
      this._atmosphereBoundsHandler = () => {
        if (this._atmosphereOverlay) {
          const b = app.map.getBounds();
          this._atmosphereOverlay.setBounds(b);
        }
      };
      app.map.on('moveend zoomend', this._atmosphereBoundsHandler);

      // 给地图容器添加 CSS 滤镜
      const container = document.getElementById('map-container');
      if (container) {
        container.style.filter = this.yearFilters[yearKey] || 'none';
      }
    },

    clearYearAtmosphere() {
      if (this._atmosphereOverlay) {
        app.map.removeLayer(this._atmosphereOverlay);
        this._atmosphereOverlay = null;
      }
      if (this._atmosphereBoundsHandler) {
        app.map.off('moveend zoomend', this._atmosphereBoundsHandler);
        this._atmosphereBoundsHandler = null;
      }
      const container = document.getElementById('map-container');
      if (container) container.style.filter = 'none';
    },

    /* ========== 4. 点击涟漪效果 ========== */
    // 点击 marker 时在点击位置产生年代色涟漪扩散动画

    createRipple(mem, latlng) {
      if (!app.map) return;
      const color = app.getMarkerColor(mem.year);

      const rippleIcon = L.divIcon({
        className: 'v21-ripple-icon',
        html: `<div class="v21-ripple" style="--ripple-color:${color};"></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const ripple = L.marker(latlng, { icon: rippleIcon, interactive: false }).addTo(app.map);
      const timer = setTimeout(() => {
        app.map.removeLayer(ripple);
      }, 1200);
      this._rippleTimers.push(timer);
    },

    /* ========== 5. 标记年代色边框增强 ========== */
    // 给现有 marker 添加年代色发光边框效果（通过修改 createPhotoIcon 后的样式注入）

    enhanceMarkerStyles() {
      // 在 style 标签中注入 marker 增强样式
      const style = document.createElement('style');
      style.id = 'v21-marker-enhance';
      style.textContent = `
        .leaflet-marker-icon img {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .leaflet-marker-icon:hover img {
          transform: scale(1.15) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        }
      `;
      document.head.appendChild(style);
    },

    /* ========== 6. 城市年谱 ========== */
    // 按城市分组展示所有地标变迁，类似编年史

    showChronicle() {
      // 收集所有城市数据
      const cities = {};

      // 从 DB.memories 收集
      DB.memories.filter(m => m.status === '已发布').forEach(m => {
        if (!cities[m.city]) cities[m.city] = [];
        cities[m.city].push(m);
      });

      // 从全国城市数据收集 landmarks
      (DB.chinaCities || []).forEach(c => {
        if (!cities[c.name]) cities[c.name] = [];
        (c.landmarks || []).filter(l => l.status === '已发布').forEach(l => {
          cities[c.name].push({ ...l, city: c.name });
        });
      });

      // 按记忆数量排序
      const sorted = Object.entries(cities)
        .filter(([_, items]) => items.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

      if (sorted.length === 0) {
        app.toast && app.toast('暂无数据');
        return;
      }

      let html = '<div class="v21-chronicle">';
      sorted.forEach(([city, items]) => {
        const color = this._getCityColor(items.length / Math.max(...sorted.map(s => s[1].length)));
        html += `<div class="v21-chronicle-city">
          <div class="v21-chronicle-city-header" style="border-left-color:${color}">
            <span class="v21-chronicle-city-name">${escHtml(city)}</span>
            <span class="v21-chronicle-city-count">${items.length} 处变迁</span>
          </div>
          <div class="v21-chronicle-items">`;

        // 按年代排序
        items.sort((a, b) => {
          const ya = (a.year || '').replace(/[^0-9]/g, '');
          const yb = (b.year || '').replace(/[^0-9]/g, '');
          return ya.localeCompare(yb);
        });

        items.forEach(m => {
          const { oldImg } = this._getMemoryImages(m);
          html += `<div class="v21-chronicle-item" onclick="V21.hideChronicle();app.openDetail('${m.id}')">
            ${oldImg ? `<img src="${oldImg}" alt="${escHtml(m.title)}" loading="lazy">` : '<div class="v21-chronicle-noimg"><i class="fas fa-image"></i></div>'}
            <div class="v21-chronicle-item-info">
              <span class="v21-chronicle-item-title">${escHtml(m.title)}</span>
              <span class="v21-chronicle-item-year" style="color:${app.getMarkerColor(m.year)}">${escHtml(m.year || '')}</span>
            </div>
          </div>`;
        });

        html += '</div></div>';
      });
      html += '</div>';

      // 使用现有的 modal 系统展示
      this._showModal('城市年谱', html, 'v21-chronicle-modal');
    },

    hideChronicle() {
      const modal = document.getElementById('v21-chronicle-modal');
      if (modal) modal.classList.remove('show');
    },

    _showModal(title, content, id) {
      let modal = document.getElementById(id);
      if (modal) { modal.remove(); }

      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-backdrop" onclick="V21.hideChronicle()"></div>
        <div class="modal-sheet" style="max-height:80vh;">
          <div class="detail-handle"></div>
          <div class="modal-title" style="padding:12px 16px 8px;font-size:18px;font-weight:700;">${title}</div>
          <div class="modal-body" style="padding:0 16px 24px;overflow-y:auto;max-height:calc(80vh - 80px);">
            ${content}
          </div>
        </div>`;
      document.body.appendChild(modal);
      // 触发重排后添加 show 类以启动动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => modal.classList.add('show'));
      });
    },

    /* ========== 挂载密度按钮到地图页面 ========== */
    _bindButtonEvents() {
      // 绑定城市记忆浓度按钮事件（按钮已硬编码在HTML中）
      const btn = document.getElementById('v21-density-btn');
      if (btn && !btn._v21_bound) {
        btn.onclick = () => this.showCityDensity();
        btn._v21_bound = true;
      }
      // 绑定城市年谱按钮事件
      const btn2 = document.getElementById('v21-chronicle-btn');
      if (btn2 && !btn2._v21_bound) {
        btn2.onclick = () => this.showChronicle();
        btn2._v21_bound = true;
      }
    },

    /* ========== 事件拦截与增强 ========== */

    // 增强 addMapMarkers：在 marker 创建后绑定 hover 和 click 涟漪
    _origAddMapMarkers: null,

    _enhanceAddMapMarkers() {
      if (!app.addMapMarkers || app._v21_patched) return;
      app._v21_patched = true;
      this._origAddMapMarkers = app.addMapMarkers.bind(app);

      app.addMapMarkers = function() {
        this._origAddMapMarkers();
        // 绑定 hover 预览
        V21._bindMarkerHover();

        // 增强 click 事件（涟漪效果）
        if (this.markerLayer) {
          this.markerLayer.on('click', (e) => {
            const memId = e.layer.memoryId;
            if (memId === undefined) return;
            const mem = DB.memories.find(m => m.id === memId);
            if (mem && e.latlng) {
              V21.createRipple(mem, e.latlng);
            }
          });
        }
      };
    },

    // 增强 filterMapMarkers：筛选时同步更新年代氛围色
    _origFilterMapMarkers: null,

    _enhanceFilterMapMarkers() {
      if (!app.filterMapMarkers || app._v21_filter_patched) return;
      app._v21_filter_patched = true;
      this._origFilterMapMarkers = app.filterMapMarkers.bind(app);

      app.filterMapMarkers = function() {
        this._origFilterMapMarkers();
        // 筛选后应用年代氛围色
        V21.applyYearAtmosphere(DB.state.yearFilter);
      };
    },

    /* ========== 初始化入口 ========== */
    _inited: false,

    init() {
      if (this._inited) return;

      // 增强 marker 样式（无需等待地图）
      this.enhanceMarkerStyles();

      // Hook addMapMarkers 和 filterMapMarkers（无论地图是否已就绪）
      this._enhanceAddMapMarkers();
      this._enhanceFilterMapMarkers();

      // 注入按钮（无需等待地图）
      this._bindButtonEvents();

      // 如果地图已初始化，立即绑定事件
      if (typeof app !== 'undefined' && app.map && app.markerLayer) {
        this._bindMarkerHover();
        this.applyYearAtmosphere(DB.state && DB.state.yearFilter);
      }

      this._inited = true;
      console.log('[V2.1] 差异化功能补丁已加载：变迁预览、记忆浓度、年代氛围色、点击涟漪、标记增强、城市年谱');
    },

    // 等待 app 就绪后绑定地图事件
    _waitForApp() {
      if (typeof app !== 'undefined' && app.map && app.markerLayer) {
        this._bindMarkerHover();
        return;
      }
      // 轮询等待，最多 5 秒
      if (this._waitCount === undefined) this._waitCount = 0;
      if (this._waitCount++ < 50) {
        setTimeout(() => this._waitForApp(), 100);
      }
    }
  };

  // 暴露到全局
  window.V21 = V21;

  // DOM Ready 后初始化，然后等待 app 就绪
  const boot = () => {
    V21.init();
    V21._waitForApp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();