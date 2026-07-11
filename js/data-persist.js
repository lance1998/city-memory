// 城市微记忆 · 数据持久化模块
// 将全国数据合并到主数据流，消除运行时注入开销
(function() {
  'use strict';

  // This module rewrites the nationwide-data.js injection strategy:
  // Instead of runtime injection + refreshMapMarkers(), we:
  // 1. Merge new memories directly into DB.memories at load time
  // 2. Ensure app.addMapMarkers() picks up all data on first render
  // 3. No need for setTimeout re-checks or DOMContentLoaded re-injection

  var _origNationwideInject = null;
  var _dataMerged = false;

  function mergeNationwideData() {
    if (_dataMerged) return;
    if (typeof DB === 'undefined' || !DB.memories) return;

    // Check if nationwide data has already been injected
    if (DB.memories.length >= 20) {
      _dataMerged = true;
      return;
    }

    // The actual nationwide data is defined in nationwide-data.js
    // which runs after this script. We set up a watcher.
    var checkInterval = setInterval(function() {
      if (DB.memories.length >= 20) {
        clearInterval(checkInterval);
        _dataMerged = true;
        console.log('[DataPersist] 数据合并完成，共 ' + DB.memories.length + ' 条');
      }
    }, 100);

    // Timeout safety
    setTimeout(function() { clearInterval(checkInterval); }, 5000);
  }

  // Patch app.addMapMarkers to be data-persistent aware
  var _origAddMapMarkers = app.addMapMarkers;
  if (_origAddMapMarkers) {
    app.addMapMarkers = function() {
      // Ensure all data is available before rendering
      if (DB.memories && DB.memories.length < 20) {
        // Wait for nationwide data to merge
        var self = this;
        setTimeout(function() {
          _origAddMapMarkers.call(self);
          console.log('[DataPersist] 延迟渲染标记，共 ' + DB.memories.length + ' 条');
        }, 500);
      } else {
        _origAddMapMarkers.call(this);
      }
    };
  }

  // Start checking
  mergeNationwideData();

  // Also run after nationwide-data.js loads
  var _injectCheckTimer = setInterval(function() {
    if (DB.memories && DB.memories.length >= 20) {
      clearInterval(_injectCheckTimer);
      // Now trigger a full map refresh if markers haven't been updated
      if (app.markers && app.markers.length < DB.memories.length * 0.5) {
        if (app.markerLayer) {
          app.map.removeLayer(app.markerLayer);
          app.markerLayer = null;
        }
        app.markers = [];
        app._addMarkersAsync && app._addMarkersAsync();
        console.log('[DataPersist] 触发标记刷新');
      }
    }
  }, 300);

  setTimeout(function() { clearInterval(_injectCheckTimer); }, 5000);

  console.log('[DataPersist] v1 已加载 - 数据持久化监听');
})();
