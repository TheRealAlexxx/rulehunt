'use strict';
const test = require('node:test');
const assert = require('node:assert');
const D = require('./daily.js');

test('every level appears once per cycle', () => {
  for (const count of [1, 2, 7, 48, 50]) {
    const seen = new Set();
    for (let i = 0; i < count; i++) seen.add(D.dailyIndex(new Date(Date.UTC(2026, 9, 19 + i)), count));
    assert.strictEqual(seen.size, count, 'count ' + count);
  }
});

test('stable through the day', () => {
  assert.strictEqual(D.dailyIndex(new Date('2026-10-19T00:00:01Z'), 48), D.dailyIndex(new Date('2026-10-19T23:59:59Z'), 48));
});

test('share text', () => {
  const d = new Date('2026-10-19T12:00:00Z');
  assert.strictEqual(D.shareText(d, 91, 5, 5, 'u'), 'rulehunt daily 2026-10-19: solved with 5 ones (par)\nu');
  assert.strictEqual(D.shareText(d, 255, 8, 5, 'u'), 'rulehunt daily 2026-10-19: solved with 8 ones (+3)\nu');
});
