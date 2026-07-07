(function() {
    'use strict';
    if (typeof app === 'undefined') return;

    // Ensure DOM exists
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

        // Overlay click to close
        picker.querySelector('.picker-overlay').addEventListener('click', function() {
            app.hideCityPicker();
        });
        // Close button
        picker.querySelector('.picker-close').addEventListener('click', function() {
            app.hideCityPicker();
        });
    }

    app.showCityPicker = function() {
        ensurePickerDOM();
        var picker = document.getElementById('city-picker');
        var body = document.getElementById('city-picker-body');
        if (!body) return;

        // Build city list
        var cities = [];
        if (DB.chinaCities) {
            cities = DB.chinaCities.slice();
        }
        // Sort by pinyin or keep original order
        body.innerHTML = '';

        // Current city indicator
        var currentCity = app.currentCity || '日照';

        // Group cities by first letter
        var groups = {};
        cities.forEach(function(city) {
            var letter = city.pinyin ? city.pinyin.charAt(0).toUpperCase() : '#';
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(city);
        });

        var letters = Object.keys(groups).sort();
        letters.forEach(function(letter) {
            var groupDiv = document.createElement('div');
            groupDiv.style.marginBottom = '16px';
            var label = document.createElement('div');
            label.textContent = letter;
            label.style.cssText = 'font-size:12px;color:#f0a050;font-weight:600;margin-bottom:8px;padding-left:4px;';
            groupDiv.appendChild(label);

            groups[letter].forEach(function(city) {
                var item = document.createElement('div');
                item.className = 'city-item';
                var isCurrent = city.name === currentCity;
                item.style.cssText = 'padding:12px 16px;border-radius:10px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;' +
                    (isCurrent ? 'background:rgba(240,160,80,0.15);border:1px solid rgba(240,160,80,0.3);' : 'background:#1a2340;border:1px solid #253054;');
                item.innerHTML = '<span style="font-size:15px;color:#e8ecf4;">' + city.name + '</span>' +
                    (isCurrent ? '<span style="font-size:12px;color:#f0a050;">&#10003; 当前</span>' : '');
                item.addEventListener('click', function() {
                    app.selectCity(city.name);
                });
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
        setTimeout(function() {
            picker.style.display = 'none';
        }, 300);
    };

    app.selectCity = function(cityName) {
        app.hideCityPicker();
        app.currentCity = cityName;
        var el = document.getElementById('current-city');
        if (el) el.textContent = cityName;

        // Filter map markers by city
        if (app.markers && app.map) {
            app.markers.forEach(function(marker) {
                if (!marker.memoryId) return;
                var mem = DB.memories.find(function(m) { return m.id === marker.memoryId; });
                if (!mem) return;
                if (mem.city === cityName) {
                    marker.setOpacity(1);
                    if (marker._icon) marker._icon.style.display = '';
                } else {
                    marker.setOpacity(0.15);
                    if (marker._icon) marker._icon.style.display = 'none';
                }
            });
        }

        // Filter discover page
        if (app.filterDiscover) {
            app.filterDiscover({ city: cityName });
        }
    };

    // Expose
    app._cityPickerReady = true;
    console.log('[CityPicker] v2 已加载，共 ' + (DB.chinaCities ? DB.chinaCities.length : 0) + ' 个城市');
})();
