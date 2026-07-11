/**
 * @jest-environment jsdom
 */

describe('data-persist.js mergeNationwideData', () => {
  let mergeNationwideData;

  beforeEach(() => {
    // Reset globals
    jest.useFakeTimers();
    window.DB = { memories: [] };
    window.NATIONWIDE_DATA = undefined;
    window.app = {
      addMapMarkers: jest.fn(),
      markers: [],
      markerLayer: {},
      map: { removeLayer: jest.fn() },
      _addMarkersAsync: jest.fn()
    };
    global.console = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

    // Load module which will export the function
    const dataPersist = require('../js/data-persist.js');
    mergeNationwideData = dataPersist.mergeNationwideData;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetModules();
    delete window.DB;
    delete window.NATIONWIDE_DATA;
    delete window.app;
  });

  it('should return false if window.NATIONWIDE_DATA is not defined', () => {
    const result = mergeNationwideData();
    expect(result).toBe(false);
    expect(window.DB.memories).toEqual([]);
  });

  it('should merge data from NATIONWIDE_DATA into DB.memories and avoid duplicates', () => {
    window.DB.memories = [{ id: 1, name: 'Existing' }];
    window.NATIONWIDE_DATA = [
      { id: 1, name: 'Duplicate' },
      { id: 2, name: 'New 1' },
      { id: 3, name: 'New 2' }
    ];

    const addedCount = mergeNationwideData();

    expect(addedCount).toBe(2);
    expect(window.DB.memories).toHaveLength(3);
    expect(window.DB.memories).toEqual([
      { id: 1, name: 'Existing' }, // Original kept
      { id: 2, name: 'New 1' },
      { id: 3, name: 'New 2' }
    ]);
  });

  it('should return false if window.DB is not defined', () => {
    window.DB = undefined;
    window.NATIONWIDE_DATA = [{ id: 1 }];

    const result = mergeNationwideData();
    expect(result).toBe(false);
  });
});
