// 城市选择器动态化补丁 - 在 app.js 加载后自动应用
(function() {
  app.showCityPicker = function() {
    var picker = document.getElementById('city-picker');
    var body = document.getElementById('city-picker-body');
    if (!body) return;

    var html = '';
    if (DB.chinaCities && DB.chinaCities.length > 0) {
      html += '<div class="city-picker-regions" style="display:flex;flex-wrap:wrap;gap:10px;padding:16px;">';
      html += '<div class="city-tag ' + (DB.state.currentCity === '日照' ? 'active' : '') + '" onclick="app.selectCity(\'日照\')">日照</div>';
      DB.chinaCities.forEach(function(city) {
        html += '<div class="city-tag ' + (DB.state.currentCity === city.name ? 'active' : '') + '" onclick="app.selectCity(\'' + city.name + '\')">' + city.name + '</div>';
      });
      html += '</div>';
    }
    body.innerHTML = html;
    picker.classList.add('show');
  };
  console.log('[CityPicker] 城市选择器已就绪，共 ' + (DB.chinaCities ? DB.chinaCities.length : 0) + ' 个城市');
})();