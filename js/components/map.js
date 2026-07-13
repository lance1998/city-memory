
class MapView {
  constructor(store, appInstance) {
    this.store = store;
    this.app = appInstance; // Pass app instance temporarily for shared utilities

    this.store.subscribe(() => this.render());
  }

  mount() {
    if (this.app.map) {
      setTimeout(() => this.app.map.invalidateSize(), 100);
    }
  }

  unmount() {
    // We do not destroy the map, just hide it via CSS as the router does
  }

  render() {
    // This replicates filterMapMarkers
    const state = this.store.getState();
    const filter = state.mapYearFilter;

    if (!this.app.markerLayer) return;
    this.app.markerLayer.clearLayers();

    const memoryMap = new Map();
    for (let i = 0; i < state.memories.length; i++) {
      memoryMap.set(state.memories[i].id, state.memories[i]);
    }

    this.app.markers.forEach(marker => {
      const memory = memoryMap.get(marker.memoryId);
      if (!memory) return;
      const showYear = filter === 'all' || Utils.getYearClass(memory.year) === filter;
      const showCity = memory.city === state.currentCity;
      if (showYear && showCity) this.app.markerLayer.addLayer(marker);
    });
  }
}

window.MapView = MapView;
