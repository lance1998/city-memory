module.exports = [
  {
    ignores: ["node_modules/**", "dist/**", "app-part*.js", "tests/**", "*.test.js"]
  },
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        DB: "writable",
        AppStore: "readonly",
        DiscoverView: "readonly",
        MapView: "readonly",
        Router: "readonly",
        L: "readonly",
        echarts: "readonly",
        Utils: "readonly"
      }
    }
  }
];
