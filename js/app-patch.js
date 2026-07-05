// 城市微记忆 · app.js 运行时补丁 v2
// 修复 Round 1 发现的函数缺失和类型匹配问题 + Round 2 CSS缓存/retro主题
(function() {
  'use strict';

  // ===== 1. 修复 openDetail ID 类型不匹配 =====
  // DB.memories 中 id 为字符串，调用处可能传数字，导致 === 严格比较失败
  if (app.openDetail) {
    var _origOpenDetail = app.openDetail.bind(app);
    app.openDetail = function(id) {
      // 统一转为字符串后再比较
      return _origOpenDetail(String(id));
    };
  }

  // ===== 2. 补充缺失的 showUpload 函数 =====
  // Round 1 发现代码中调用 app.showUpload() 但函数不存在
  app.showUpload = function() {
    app.navigateTo('upload');
    if (app.resetUpload) app.resetUpload();
  };

  // ===== 3. 补充 showMapUploadHint（长按地图添加记忆） =====
  // perf-patch.js 中的长按事件依赖此函数
  app.showMapUploadHint = function(latlng) {
    app.navigateTo('upload');
    if (app.resetUpload) app.resetUpload();
    // 如果存在地图位置字段，自动填入坐标
    var latInput = document.getElementById('upload-lat');
    var lngInput = document.getElementById('upload-lng');
    if (latInput && latlng && latlng.lat !== undefined) latInput.value = latlng.lat.toFixed(6);
    if (lngInput && latlng && latlng.lng !== undefined) lngInput.value = latlng.lng.toFixed(6);
    // 显示提示
    if (app.showToast) app.showToast('已定位到长按位置，请完善记忆信息');
  };

  // ===== 4. 修复 setTheme('retro') 无效 =====
  // 复古怀旧主题对应的 key 是空字符串 ''，不是 'retro'
  if (app.setTheme) {
    var _origSetTheme = app.setTheme.bind(app);
    app.setTheme = function(theme) {
      // 将 'retro' / 'vintage' 等别名映射到默认空主题
      if (theme === 'retro' || theme === 'vintage' || theme === 'default') {
        theme = '';
      }
      return _origSetTheme(theme);
    };
  }

  console.log('[AppPatch] v2 已加载 - openDetail类型修复 + showUpload补全 + showMapUploadHint补全 + setTheme别名修复');
})();
