/**
 * @jest-environment jsdom
 */

// Load the script. We need to mock 'app', 'DB' and 'L' that might be accessed,
// though makeDeferred is self-contained. The file evaluates immediately.
beforeAll(() => {
  window.app = {
    renderDiscover: jest.fn(),
    renderProfile: jest.fn(),
    renderShop: jest.fn(),
    renderRoutes: jest.fn(),
    renderBadges: jest.fn(),
    getThumbSize: jest.fn(),
    createPhotoIcon: jest.fn(),
    showMapUploadHint: jest.fn(),
    showMockMap: jest.fn(),
    goBack: jest.fn()
  };
  window.DB = {
    state: {},
    chinaCities: [],
    memories: []
  };
  window.L = undefined;

  // Load script
  require('../js/perf-patch.js');
});

describe('makeDeferred', () => {
  let makeDeferred;

  beforeEach(() => {
    makeDeferred = window.__makeDeferred;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  test('returns null if origFn is not provided', () => {
    expect(makeDeferred(undefined)).toBeNull();
    expect(makeDeferred(null)).toBeNull();
  });

  describe('with window.requestIdleCallback', () => {
    let originalRequestIdleCallback;

    beforeEach(() => {
      originalRequestIdleCallback = window.requestIdleCallback;
      window.requestIdleCallback = jest.fn((cb) => {
        // Execute synchronously for testing
        cb();
      });
    });

    afterEach(() => {
      window.requestIdleCallback = originalRequestIdleCallback;
    });

    test('executes using requestIdleCallback', () => {
      const mockFn = jest.fn();
      const deferredFn = makeDeferred(mockFn);

      deferredFn();

      expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('preserves arguments and context', () => {
      const mockFn = jest.fn();
      const deferredFn = makeDeferred(mockFn);
      const ctx = { id: 1 };

      deferredFn.call(ctx, 'arg1', 'arg2');

      expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      // Jest uses mockFn.mock.instances for context
      expect(mockFn.mock.contexts[0]).toBe(ctx);
    });
  });

  describe('without window.requestIdleCallback (fallback)', () => {
    let originalRequestIdleCallback;

    beforeEach(() => {
      originalRequestIdleCallback = window.requestIdleCallback;
      delete window.requestIdleCallback;
    });

    afterEach(() => {
      window.requestIdleCallback = originalRequestIdleCallback;
    });

    test('executes using setTimeout fallback', () => {
      const mockFn = jest.fn();
      const deferredFn = makeDeferred(mockFn);

      deferredFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('preserves arguments and context in fallback', () => {
      const mockFn = jest.fn();
      const deferredFn = makeDeferred(mockFn);
      const ctx = { id: 1 };

      deferredFn.call(ctx, 'arg1', 'arg2');

      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFn.mock.contexts[0]).toBe(ctx);
    });
  });
});
