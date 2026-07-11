const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

test('search-index pinyin extraction', async (t) => {
    // 1. Setup mock environment
    global.app = {};
    global.DB = {
        chinaCities: [
            { name: '北京', pinyin: 'beijing' },
            { name: '上海', pinyin: 'shanghai' }
        ],
        memories: []
    };
    global.document = {
        getElementById: () => null,
        querySelector: () => null
    };
    global.setTimeout = () => {};
    global.clearTimeout = () => {};

    // 2. Load and evaluate the script
    const code = fs.readFileSync('./js/search-index.js', 'utf-8');
    vm.runInThisContext(code);

    const getPinyin = app._searchIndex.getPinyin;

    await t.test('returns pinyin for known city', () => {
        assert.strictEqual(getPinyin('北京'), 'beijing');
        assert.strictEqual(getPinyin('上海'), 'shanghai');
    });

    await t.test('returns original string for unknown city', () => {
        assert.strictEqual(getPinyin('未知城市'), '未知城市');
        assert.strictEqual(getPinyin('New York'), 'New York');
    });

    await t.test('handles null safely', () => {
        assert.strictEqual(getPinyin(null), '');
    });

    await t.test('handles undefined safely', () => {
        assert.strictEqual(getPinyin(undefined), '');
    });
});
