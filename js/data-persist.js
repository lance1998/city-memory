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
    if (!window.NATIONWIDE_DATA || !window.DB) return false;

    var addedCount = 0;
    window.NATIONWIDE_DATA.forEach(function(mem) {
      var exists = window.DB.memories.some(function(m) { return m.id === mem.id; });
      if (!exists) {
        window.DB.memories.push(mem);
        addedCount++;
      }
    });
    return addedCount;
  }

  function watchNationwideData() {
    if (_dataMerged) return;
    if (typeof window.DB === 'undefined' || !window.DB.memories) return;

    // Check if nationwide data has already been injected
    if (window.DB.memories.length >= 20) {
      _dataMerged = true;
      return;
    }

    // The actual nationwide data is defined in nationwide-data.js
    // which runs after this script. We set up a watcher.
    var checkInterval = setInterval(function() {
      if (window.NATIONWIDE_DATA) {
        clearInterval(checkInterval);
        mergeNationwideData();
        _dataMerged = true;
        console.log('[DataPersist] 数据合并完成，共 ' + window.DB.memories.length + ' 条');
      } else if (window.DB.memories.length >= 20) {
        clearInterval(checkInterval);
        _dataMerged = true;
        console.log('[DataPersist] 数据合并完成，共 ' + window.DB.memories.length + ' 条');
      }
    }, 100);

    // Timeout safety
    setTimeout(function() { clearInterval(checkInterval); }, 5000);
  }

  // Patch app.addMapMarkers to be data-persistent aware
  if (typeof window.app !== 'undefined') {
    var _origAddMapMarkers = window.app.addMapMarkers;
    if (_origAddMapMarkers) {
      window.app.addMapMarkers = function() {
        // Ensure all data is available before rendering
        if (window.DB && window.DB.memories && window.DB.memories.length < 20) {
          // Wait for nationwide data to merge
          var self = this;
          setTimeout(function() {
            _origAddMapMarkers.call(self);
            console.log('[DataPersist] 延迟渲染标记，共 ' + window.DB.memories.length + ' 条');
          }, 500);
        } else {
          _origAddMapMarkers.call(this);
        }
      };
    }
  }

  // Start checking
  watchNationwideData();

  // Also run after nationwide-data.js loads
  var _origInjectData = null;
  var _injectCheckTimer = setInterval(function() {
    if (window.DB && window.DB.memories && window.DB.memories.length >= 20) {
      clearInterval(_injectCheckTimer);
      // Now trigger a full map refresh if markers haven't been updated
      if (typeof window.app !== 'undefined' && window.app.markers && window.app.markers.length < window.DB.memories.length * 0.5) {
        if (window.app.markerLayer) {
          window.app.map.removeLayer(window.app.markerLayer);
          window.app.markerLayer = null;
        }
        window.app.markers = [];
        window.app._addMarkersAsync && window.app._addMarkersAsync();
        console.log('[DataPersist] 触发标记刷新');
      }
    }
  }, 300);

  setTimeout(function() { clearInterval(_injectCheckTimer); }, 5000);

  console.log('[DataPersist] v1 已加载 - 数据持久化监听');

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      mergeNationwideData: mergeNationwideData
    };
  }
})();
