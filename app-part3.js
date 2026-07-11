
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
    document.getElementById('city-picker').classList.add('show');
  },

  hideCityPicker() {
    document.getElementById('city-picker').classList.remove('show');
  },

  selectCity(city) {
    DB.state.currentCity = city;
    document.getElementById('current-city').textContent = city;
    this.hideCityPicker();
    const cityCoords = {
      '日照': [35.42, 119.531], '北京': [39.9042, 116.4074], '上海': [31.2304, 121.4737],
      '广州': [23.1291, 113.2644], '成都': [30.5728, 104.0668], '西安': [34.3416, 108.9398],
      '杭州': [30.2741, 120.1551], '南京': [32.0603, 118.7969]
    };
    const coords = cityCoords[city] || [35.42, 119.531];
    if (this.map) this.map.flyTo(coords, 12);
    document.querySelectorAll('.city-tag').forEach(t => t.classList.toggle('active', t.textContent === city));
    this.toast(`已切换到 ${city}`);
    this.renderDiscover();
    this.filterMapMarkers();
  },

  // ==================== 语音播放 ====================
  playVoice(url) {
    const bar = document.getElementById('voice-player');
    const progress = document.getElementById('voice-progress');
    bar.classList.add('show');
    progress.style.width = '0%';
    let pct = 0;
    if (this.voiceInterval) clearInterval(this.voiceInterval);
    this.voiceInterval = setInterval(() => {
      pct += 2;
      progress.style.width = pct + '%';
      if (pct >= 100) this.stopVoice();
    }, 100);
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
    this.toast('请选择照片');
    const imgUrl = `https://picsum.photos/seed/selfie${Date.now()}/300/300`;
    this.timeTravelNewImg = imgUrl;
    const img = document.getElementById('timetravel-new-img');
    img.src = imgUrl;
    img.style.display = 'block';
    document.getElementById('timetravel-upload-area').style.display = 'none';
    document.getElementById('timetravel-generate-btn').disabled = false;
  },

  generateTimeTravel() {
    if (!this.timeTravelNewImg) return;
    this.toast('正在生成时空同框照...');
    this._addTimer(setTimeout(() => {
      const m = DB.memories.find(x => x.id === DB.state.currentMemoryId);
      const oldImg = m ? m.oldImages[0] : 'https://picsum.photos/seed/old/300/300';
      const resultImg = document.getElementById('timetravel-result-img');
      resultImg.src = oldImg;
      document.getElementById('timetravel-result').style.display = 'block';
      document.getElementById('timetravel-generate-btn').style.display = 'none';
      document.getElementById('timetravel-share-btn').style.display = 'block';
      this.toast('时空同框照生成成功！');
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
      const map = L.map(container).setView([35.42, 119.531], 13);
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
    } catch(e) {}
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
        <div class="feed-item" style="cursor:pointer" onclick="app.toast('发帖功能开发中')">
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
          <div class="relay-add-btn" onclick="event.stopPropagation();app.toast('接力上传功能开发中')"><i class="fas fa-plus"></i></div>
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
    html += `<div class="timeline-add-btn" onclick="app.toast('接力上传功能开发中')"><i class="fas fa-plus"></i>接力你的记忆</div>`;
    html += '</div>';
    content.innerHTML = html;
  },

  // 用户主页
  showUserProfile(userId) {
    this.navigateTo('user-profile');
    const user = DB.users.find(u => u.id === userId);
    if (!user) return;
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
        <button class="follow-btn not-following" onclick="app.toast('私信功能开发中')" style="flex:0.6"><i class="fas fa-envelope"></i> 私信</button>
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
    let html = '<div class="nearby-header"><p>附近有 <strong>4</strong> 位记忆者正在探索</p></div>';
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
        <button class="nearby-greet-btn" onclick="app.toast('打招呼功能开发中')"><i class="fas fa-hand-wave"></i> 打招呼</button>
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
    const friends = DB.users.filter(u => DB.currentUser.following.includes(u.id));
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