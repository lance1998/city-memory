class Router {
  constructor(store) {
    this.store = store;
    this.routes = {};
    this.currentRoute = null;

    // Listen to hash changes if we want to support browser back button
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  register(path, viewComponent) {
    this.routes[path] = viewComponent;
  }

  handleHashChange() {
    let hash = window.location.hash.slice(1);
    if (!hash) hash = 'map'; // default route

    // Some routes might have params like detail/1
    const [path, param] = hash.split('/');

    this.navigate(path, param, false);
  }

  navigate(path, param = null, pushState = true) {
    if (this.currentRoute && this.currentRoute.unmount) {
      this.currentRoute.unmount();
    }

    const view = this.routes[path];
    if (view) {
      this.currentRoute = view;

      // Update UI tab
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const pageEl = document.getElementById(`page-${path}`);
      if (pageEl) pageEl.classList.add('active');

      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      const tabEl = document.querySelector(`.tab-item[data-page="${path}"]`);
      if (tabEl) tabEl.classList.add('active');

      // Dispatch state update
      this.store.dispatch({ type: 'SET_CURRENT_PAGE', payload: path });

      // Update URL hash
      if (pushState) {
        const newHash = param ? `#${path}/${param}` : `#${path}`;
        if (window.location.hash !== newHash) {
          window.history.pushState(null, '', newHash);
        }
      }

      if (view.mount) {
        view.mount(param);
      }
    } else {
      console.warn(`Route ${path} not found`);
      // Fallback
      if (path !== 'map') this.navigate('map');
    }
  }
}

window.AppRouter = Router;
