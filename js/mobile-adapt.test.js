const fs = require('fs');
const path = require('path');

describe('Mobile Adapt - Viewport Height Fix', () => {
  let originalInnerHeight;
  let listeners = {};

  beforeEach(() => {
    originalInnerHeight = window.innerHeight;

    // Track listeners to avoid duplicates when eval-ing multiple times
    jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    });

    // Mock the global app object
    global.app = {
      map: {
        invalidateSize: jest.fn(),
        on: jest.fn(),
        zoomIn: jest.fn()
      },
      markers: [],
      openDetail: jest.fn()
    };

    // Clean up document
    document.documentElement.style.removeProperty('--vh');
  });

  afterEach(() => {
    window.innerHeight = originalInnerHeight;
    delete global.app;
    listeners = {};
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  function loadScript() {
    const scriptPath = path.resolve(__dirname, 'mobile-adapt.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    // Using eval to run the IIFE in current context
    eval(scriptContent);
  }

  function triggerEvent(eventName) {
    if (listeners[eventName]) {
      listeners[eventName].forEach(handler => handler(new Event(eventName)));
    }
  }

  test('should set --vh property correctly on initial load', () => {
    window.innerHeight = 800;
    loadScript();

    const vh = document.documentElement.style.getPropertyValue('--vh');
    expect(vh).toBe('8px');
  });

  test('should update --vh property on window resize', () => {
    loadScript();

    // Change height and trigger resize
    window.innerHeight = 600;
    triggerEvent('resize');

    const vh = document.documentElement.style.getPropertyValue('--vh');
    expect(vh).toBe('6px');
  });

  test('should update --vh property and invalidate map size on orientationchange', () => {
    jest.useFakeTimers();
    loadScript();

    window.innerHeight = 400;
    triggerEvent('orientationchange');

    // The orientationchange handler uses setTimeout of 100ms
    jest.advanceTimersByTime(100);

    const vh = document.documentElement.style.getPropertyValue('--vh');
    expect(vh).toBe('4px');
    expect(global.app.map.invalidateSize).toHaveBeenCalledTimes(1);
  });
});
