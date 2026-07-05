// 城市选择器动态化补丁 - 在 app.js 加载后自动应用
(function() {
  const originalShowCityPicker = app.showCityPicker;
  app.showCityPicker = function() {
    const picker = document.getElementById('city-picker');
    let cityTags = '';
    if (DB.chinaCities && DB.chinaCities.length > 0) {
      DB.chinaCities.forEach(function(city) {
        cityTags += '<div class="city-tag ' + (DB.state.currentCity === city.name ? 'active' : '') + '" onclick="app.selectCity(\'' + city.name + '\')">' + city.name + '</div>';
      });
    }
    const citiesHtml = '<div class="city-picker-regions">' +
      '<div class="city-tag ' + (DB.state.currentCity === '日照' ? 'active' : '') + '" onclick="app.selectCity(\'日照\')">日照</div>' +
      cityTags +
      '</div>';
    const existingContent = picker.querySelector('.city-picker-content');
    if (existingContent) {
      existingContent.innerHTML = citiesHtml;
    } else {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'city-picker-content';
      contentDiv.innerHTML = citiesHtml;
      picker.appendChild(contentDiv);
    }
    picker.classList.add('show');
  };
  console.log('[CityPicker] 动态城市选择器已应用，支持 ' + (DB.chinaCities ? DB.chinaCities.length : 0) + ' 个城市');
})();