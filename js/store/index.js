class AppStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  reducer(state, action) {
    switch (action.type) {
      case 'SET_CITY':
        return { ...state, currentCity: action.payload };
      case 'SET_DISCOVER_FILTER':
        return { ...state, discoverYearFilter: action.payload };
      case 'SET_DISCOVER_SORT':
        return { ...state, discoverSortBy: action.payload };
      case 'SET_DISCOVER_SEARCH':
        return { ...state, discoverSearchQuery: action.payload };
      case 'SET_MAP_FILTER':
        return { ...state, mapYearFilter: action.payload };
      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: action.payload };
      case 'INIT_STORE':
        return { ...state, ...action.payload };
      case 'UPDATE_MEMORIES':
        return { ...state, memories: action.payload };
      default:
        return state;
    }
  }
}

window.appStore = new AppStore({
  currentCity: '日照',
  discoverYearFilter: 'all',
  discoverSortBy: 'newest',
  discoverSearchQuery: '',
  mapYearFilter: 'all',
  currentPage: 'map',
  memories: [],
  favorites: [],
  footprints: new Set()
});
