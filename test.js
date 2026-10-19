'use strict';
const test = require('node:test');
const assert = require('node:assert');
const CA = require('./ca.js');
const levels = require('./levels.json');

test('rule 90 is xor of the neighbours', () => {
  const rows = CA.run(CA.toBits('00010000'), 90, 3);
  assert.deepStrictEqual(rows.map(CA.toStr), ['00010000', '00101000', '01000100', '10101010']);
});

test('rule 30 first rows from a single cell', () => {
  const rows = CA.run(CA.toBits('0000100000000'), 30, 3).map(CA.toStr);
  assert.deepStrictEqual(rows, ['0000100000000', '0001110000000', '0011001000000', '0110111100000']);
});

test('the edges wrap around', () => {
  // rule 2 shifts a cell one place left (output 1 only for neighbourhood 001)
  assert.strictEqual(CA.toStr(CA.step(CA.toBits('1000'), 2)), '0001');
  assert.strictEqual(CA.toStr(CA.step(CA.toBits('0100'), 2)), '1000');
});

test('rule 0 kills everything, rule 255 fills everything', () => {
  assert.strictEqual(CA.toStr(CA.step(CA.toBits('1011'), 0)), '0000');
  assert.strictEqual(CA.toStr(CA.step(CA.toBits('1011'), 255)), '1111');
});

test('matchingRules brute force finds the hidden rule', () => {
  const start = CA.toBits('01101001110');
  for (const rule of [30, 90, 110, 184, 45]) {
    const target = CA.run(start, rule, 4)[4];
    assert.ok(CA.matchingRules(start, target, 4).includes(rule), 'rule ' + rule);
  }
});

test('par is the smallest popcount among matching rules', () => {
  const start = CA.toBits('0110100111');
  const target = CA.run(start, 90, 3)[3];
  const m = CA.matchingRules(start, target, 3);
  assert.strictEqual(CA.par(start, target, 3), Math.min(...m.map(CA.popcount)));
});

test('every shipped level is consistent', () => {
  assert.ok(levels.length >= 40);
  for (const l of levels) {
    const start = CA.toBits(l.start);
    assert.strictEqual(l.start.length, l.w);
    assert.strictEqual(l.target.length, l.w);
    const m = CA.matchingRules(start, CA.toBits(l.target), l.steps);
    assert.ok(m.includes(l.example), 'level ' + l.id + ' example rule');
    assert.strictEqual(m.length, l.matches, 'level ' + l.id + ' match count');
    assert.strictEqual(Math.min(...m.map(CA.popcount)), l.par, 'level ' + l.id + ' par');
  }
});
