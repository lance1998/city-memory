// 城市微记忆 · 城市选择器 v3
// 动态创建 DOM + 城市切换过滤 + 地图平移到目标城市
(function() {
  'use strict';
  if (typeof app === 'undefined') return;

  function ensurePickerDOM() {
    if (document.getElementById('city-picker')) return;
    var picker = document.createElement('div');
    picker.id = 'city-picker';
    picker.className = 'picker-modal';
    picker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;display:none;opacity:0;transition:opacity 0.3s ease;';
    picker.innerHTML =
      '<div class="picker-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);"></div>' +
      '<div class="picker-container" style="position:absolute;bottom:0;left:0;width:100%;max-height:70%;background:#131a2a;border-radius:20px 20px 0 0;transform:translateY(100%);transition:transform 0.3s ease;display:flex;flex-direction:column;">' +
        '<div class="picker-handle" style="width:40px;height:4px;background:#253054;border-radius:2px;margin:12px auto;"></div>' +
        '<div class="picker-header" style="padding:0 20px 12px;display:flex;justify-content:space-between;align-items:center;">' +
          '<h3 style="margin:0;font-size:18px;color:#e8ecf4;">选择城市</h3>' +
          '<button class="picker-close" style="background:none;border:none;color:#7a8bb0;font-size:20px;cursor:pointer;">&#10005;</button>' +
        '</div>' +
        '<div id="city-picker-body" style="flex:1;overflow-y:auto;padding:0 20px 20px;"></div>' +
      '</div>';
    document.body.appendChild(picker);
    picker.querySelector('.picker-overlay').addEventListener('click', function() { app.hideCityPicker(); });
    picker.querySelector('.picker-close').addEventListener('click', function() { app.hideCityPicker(); });
  }

  app.showCityPicker = function() {
    ensurePickerDOM();
    var picker = document.getElementById('city-picker');
    var body = document.getElementById('city-picker-body');
    if (!body) return;

    var cities = DB.chinaCities ? DB.chinaCities.slice() : [];
    body.innerHTML = '';
    var currentCity = app.currentCity || '日照';

    // Add "All cities" option
    var allItem = document.createElement('div');
    allItem.className = 'city-item';
    var isAll = currentCity === '__ALL__' || !currentCity;
    allItem.style.cssText = 'padding:14px 16px;border-radius:10px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;' +
      (isAll ? 'background:rgba(240,160,80,0.2);border:1px solid rgba(240,160,80,0.4);' : 'background:#1a2340;border:1px solid #253054;');
    allItem.innerHTML = '<span style="font-size:16px;font-weight:600;color:#e8ecf4;">&#127758; 全国所有城市</span>' +
      '<span style="font-size:12px;color:#7a8bb0;">' + (DB.memories ? DB.memories.length : 0) + ' 条记忆</span>';
    allItem.addEventListener('click', function() { app.selectCity('__ALL__'); });
    body.appendChild(allItem);

    // Group by pinyin first letter
    var groups = {};
    cities.forEach(function(city) {
      var letter = city.pinyin ? city.pinyin.charAt(0).toUpperCase() : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(city);
    });

    // Count memories per city
    var cityCounts = {};
    if (DB.memories) {
      DB.memories.forEach(function(m) {
        cityCounts[m.city] = (cityCounts[m.city] || 0) + 1;
      });
    }

    var letters = Object.keys(groups).sort();
    letters.forEach(function(letter) {
      var groupDiv = document.createElement('div');
      groupDiv.style.marginBottom = '16px';
      var label = document.createElement('div');
      label.textContent = letter;
      label.style.cssText = 'font-size:12px;color:#f0a050;font-weight:600;margin-bottom:8px;padding-left:4px;letter-spacing:2px;';
      groupDiv.appendChild(label);

      groups[letter].forEach(function(city) {
        var count = cityCounts[city.name] || 0;
        var item = document.createElement('div');
        item.className = 'city-item';
        var isCurrent = city.name === currentCity && currentCity !== '__ALL__';
        item.style.cssText = 'padding:12px 16px;border-radius:10px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;' +
          (isCurrent ? 'background:rgba(240,160,80,0.15);border:1px solid rgba(240,160,80,0.3);' : 'background:#1a2340;border:1px solid #253054;');
        item.innerHTML = '<span style="font-size:15px;color:#e8ecf4;">' + city.name + '</span>' +
          '<span style="font-size:12px;color:' + (count > 0 ? '#00e5ff' : '#7a8bb0') + ';">' +
          (isCurrent ? '&#10003; 当前 · ' : '') + (count > 0 ? count + ' 条' : '暂无') + '</span>';
        item.addEventListener('click', function() { app.selectCity(city.name); });
        groupDiv.appendChild(item);
      });
      body.appendChild(groupDiv);
    });

    picker.style.display = 'block';
    setTimeout(function() {
      picker.style.opacity = '1';
      var container = picker.querySelector('.picker-container');
      if (container) container.style.transform = 'translateY(0)';
    }, 10);
  };

  app.hideCityPicker = function() {
    var picker = document.getElementById('city-picker');
    if (!picker) return;
    picker.style.opacity = '0';
    var container = picker.querySelector('.picker-container');
    if (container) container.style.transform = 'translateY(100%)';
    setTimeout(function() { picker.style.display = 'none'; }, 300);
  };

  app.selectCity = function(cityName) {
    app.hideCityPicker();
    app.currentCity = cityName;

    var el = document.getElementById('current-city');
    if (el) el.textContent = cityName === '__ALL__' ? '全国' : cityName;

    // Get city data for panning
    var cityData = null;
    if (cityName !== '__ALL__' && DB.chinaCities) {
      cityData = DB.chinaCities.find(function(c) { return c.name === cityName; });
    }

    // Filter and animate markers
    if (app.markers && app.map) {
      var visibleCount = 0;
      var totalInCity = 0;

      var memoryDict = {};
      if (DB.memories) {
        for (var i = 0; i < DB.memories.length; i++) {
          var m = DB.memories[i];
          memoryDict[m.id] = m;
        }
      }

      app.markers.forEach(function(marker) {
        if (!marker.memoryId) return;
        var mem = memoryDict[marker.memoryId] || null;
        if (!mem) return;

        if (cityName === '__ALL__') {
          // Show all
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
        } else if (mem.city === cityName) {
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
          totalInCity++;
        } else {
          marker.setOpacity(0);
          if (marker._icon) marker._icon.style.display = 'none';
        }
      });

      // Pan to city center
      if (cityData && cityData.center) {
        app.map.flyTo(cityData.center, cityData.zoom || 12, { duration: 0.8 });
      } else if (cityName === '__ALL__') {
        app.map.flyTo([35.5, 110], 5, { duration: 1.0 });
      }

      // Show toast
      if (cityName === '__ALL__') {
        app.showToast && app.showToast('已切换到全国视图，共 ' + (DB.memories ? DB.memories.length : 0) + ' 条记忆');
      } else {
        app.showToast && app.showToast(cityName + ' · ' + totalInCity + ' 条记忆');
      }
    }

    // Filter discover page
    if (app.filterDiscover) {
      app.filterDiscover(cityName === '__ALL__' ? {} : { city: cityName });
    }

    app._selectedCity = cityName;
  };

  app._cityPickerReady = true;
  console.log('[CityPicker] v3 已加载，共 ' + (DB.chinaCities ? DB.chinaCities.length : 0) + ' 个城市');
})();
