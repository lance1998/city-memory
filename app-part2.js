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
      const map = L.map(container).setView([35.42, 119.531], 13);
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
    } catch(e) {}
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
    this.toast('AI修复中...');
    this._addTimer(setTimeout(() => {
      const preview = document.getElementById('ai-preview');
      preview.innerHTML = `<img src="https://picsum.photos/seed/aifix/200/200" alt="修复后"><span style="font-size:12px;color:var(--text-light);margin-left:8px;">已增强清晰度</span>`;
      this.toast('AI修复完成');
    }, 1500));
  },

  toggleVoiceRecord() {
    const btn = document.getElementById('voice-btn');
    const timer = document.getElementById('voice-timer');
    if (DB.state.recording) {
      clearInterval(DB.state.voiceTimer);
      DB.state.recording = false;
      btn.classList.remove('recording');
      btn.innerHTML = '<i class="fas fa-microphone"></i> 点击录制';
      this.toast('录音已保存');
    } else {
      DB.state.recording = true;
      btn.classList.add('recording');
      btn.innerHTML = '<i class="fas fa-stop"></i> 点击停止';
      let sec = 0;
      timer.textContent = '00:00';
      DB.state.voiceTimer = setInterval(() => {
        sec++;
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        timer.textContent = `${m}:${s}`;
        if (sec >= 180) this.toggleVoiceRecord();
      }, 1000);
    }
  },

  renderUploadPreview() {
    const title = document.getElementById('upload-title').value || '未命名地标';
    const year = document.getElementById('upload-year').value || '未知年代';
    const oldImg = this.uploadData.oldImg || 'https://picsum.photos/seed/preview/400/200';
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = `
      <img src="${oldImg}" style="width:100%;height:180px;object-fit:cover;">
      <div style="padding:12px;">
        <div style="font-weight:600;font-size:16px;margin-bottom:4px;">${escHtml(title)}</div>
        <span style="background:var(--primary-light);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-size:12px;">${escHtml(year)}</span>
        <div style="margin-top:8px;font-size:13px;color:var(--text-light);">${escHtml(document.getElementById('upload-story').value || '暂无回忆文字')}</div>
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
        id: Date.now(),
        title: document.getElementById('upload-title').value || '未命名地标',
        city: DB.state.currentCity,
        lng: lat + (Math.random() - 0.5) * 0.001,
        lat: lng + (Math.random() - 0.5) * 0.001,
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
      id: Date.now(),
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
      id: Date.now(),
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
          <span class="myupload-status status-${m.status === '已发布' ? 'approved' : m.status === '待审核' ? 'pending' : 'rejected'}">${escHtml(m.status)}</span>
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
    } catch(e) {}
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
