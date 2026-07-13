const test = require('node:test');
const assert = require('node:assert');
const vm = require('vm');
const fs = require('fs');

const code = fs.readFileSync('data.js', 'utf8');

function setupEnvironment(localStorageMock) {
  const context = {
    console: {
      log: () => {},
      error: () => {}
    },
    window: {},
    localStorage: localStorageMock,
    app: { toast: () => {} }
  };
  vm.createContext(context);
  // We run the actual code so that `DB` and `initStorage` are available on context
  vm.runInContext(code + '\nwindow.DB = DB; window.initStorage = initStorage;', context);
  // To avoid const reassignment crash of `DB = localDB`, we capture the original DB and wrap it in a proxy or just
  // provide a wrapper function
  vm.runInContext('function runInitStorage() { initStorage(); } window.runInitStorage = runInitStorage;', context);
  return context;
}

test('initStorage handles localStorage getItem error smoothly', (t) => {
  let getItemCalled = false;

  const mockLocalStorage = {
    getItem: (key) => {
      getItemCalled = true;
      if (key === 'city_memory_db') {
        throw new Error('Simulated localStorage getItem error');
      }
      return null;
    },
    setItem: (key, value) => {
      // do nothing
    }
  };

  const ctx = setupEnvironment(mockLocalStorage);

  assert.doesNotThrow(() => {
    ctx.window.runInitStorage();
  });

  assert.strictEqual(getItemCalled, true, 'getItem should be called');
});

test('initStorage handles setItem quota exceeded error', (t) => {
  let setItemCalled = false;

  const mockLocalStorage = {
    getItem: (key) => null, // return null so it tries to set
    setItem: (key, value) => {
      setItemCalled = true;
      if (key === 'city_memory_db') {
        const err = new Error('Quota exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
    }
  };

  const ctx = setupEnvironment(mockLocalStorage);

  assert.doesNotThrow(() => {
    ctx.window.runInitStorage();
  });

  assert.strictEqual(setItemCalled, true, 'setItem should be called');
});

test('initStorage normal happy path - first visit saves city_memory_db', (t) => {
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; }
  };

  const ctx = setupEnvironment(mockLocalStorage);

  ctx.window.runInitStorage();

  assert.ok(store['city_memory_db'], 'DB should be stringified and saved under city_memory_db');
});
