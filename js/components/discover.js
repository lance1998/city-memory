
class DiscoverView {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('discover-waterfall');

    // Subscribe to store updates
    this.store.subscribe(() => this.render());

    // Bind DOM events
    this.bindEvents();
  }

  bindEvents() {
    // Year filters
    document.querySelectorAll('#page-discover .filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#page-discover .filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.store.dispatch({ type: 'SET_DISCOVER_FILTER', payload: e.target.dataset.year });
      });
    });

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.store.dispatch({ type: 'SET_DISCOVER_SORT', payload: e.target.dataset.sort });
      });
    });

    // Search input
    const searchInput = document.getElementById('discover-search');
    if (searchInput) {
      let searchTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            this.store.dispatch({ type: 'SET_DISCOVER_SEARCH', payload: e.target.value });
        }, 300);
      });
    }
  }

  render() {
    if (!this.container) return;

    const state = this.store.getState();
    let memories = [...state.memories];

    // City filter
    // memories = memories.filter(m => m.city === state.currentCity); // Discover page shows ALL cities.

    // Year filter
    if (state.discoverYearFilter !== 'all') {
      memories = memories.filter(m => Utils.getYearClass(m.year) === state.discoverYearFilter);
    }

    // Search filter
    if (state.discoverSearchQuery) {
      const q = state.discoverSearchQuery.toLowerCase();
      memories = memories.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.story.toLowerCase().includes(q) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    switch (state.discoverSortBy) {
      case 'likes': memories.sort((a, b) => b.likes - a.likes); break;
      case 'comments': memories.sort((a, b) => b.comments - a.comments); break;
      case 'editor': memories = memories.filter(m => m.isFeatured); break;
      default: memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Render topics
    const topicIcons = ['fa-school', 'fa-store', 'fa-landmark', 'fa-mountain-sun', 'fa-bridge'];
    const topicsHtml = DB.topics.map((t, i) =>
      `<div class="topic-card" onclick="app.showTopic(${t.id})">
        <div class="topic-card-icon"><i class="fas ${topicIcons[i % topicIcons.length]}"></i></div>
        <div class="topic-card-title">${t.title}</div>
        <div class="topic-card-count">${t.count || Math.floor(Math.random()*200+50)} 篇记忆</div>
      </div>`
    ).join('');

    const hotMemories = [...state.memories].sort((a, b) => b.views - a.views).slice(0, 5);

    let html = '';

    html += `
      <div class="discover-section">
        <div class="section-header">
          <h3><i class="fas fa-fire" style="color:var(--primary)"></i> 话题专题</h3>
          <span class="section-more">更多 <i class="fas fa-chevron-right"></i></span>
        </div>
        <div class="topic-cards-scroll">${topicsHtml}</div>
      </div>
    `;

    html += `
      <div class="discover-section">
        <div class="section-header">
          <h3><i class="fas fa-trophy" style="color:#D4A574"></i> 热门地标</h3>
          <span class="section-more">全部 <i class="fas fa-chevron-right"></i></span>
        </div>
        <div class="hot-cards-scroll">
          ${hotMemories.map((m, i) => `
            <div class="hot-card" onclick="app.openDetail('${m.id}')">
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

    html += `<div class="waterfall-grid">`;
    html += memories.map(m => `
      <div class="waterfall-card" onclick="app.openDetail('${m.id}')">
        <div class="waterfall-img-wrap">
          <img src="${m.oldImages[0]}" alt="${m.title}" loading="lazy" onload="this.classList.add('loaded')">
          <div class="waterfall-year-tag">${escHtml(m.year)}</div>
          ${m.isFeatured ? '<div class="waterfall-featured"><i class="fas fa-star"></i> 编辑推荐</div>' : ''}
        </div>
        <div class="waterfall-info">
          <div class="waterfall-title">${escHtml(m.title)}</div>
          <div class="waterfall-author">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}" alt="${m.authorName}" class="author-avatar">
            <span class="author-name">${escHtml(m.authorName)}</span>
          </div>
          <div class="waterfall-meta">
            <span><i class="far fa-heart"></i> ${m.likes}</span>
          </div>
        </div>
      </div>
    `).join('');
    html += `</div>`;

    this.container.innerHTML = html;
  }
}

window.DiscoverView = DiscoverView;
