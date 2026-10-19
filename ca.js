'use strict';
// Elementary cellular automata on a ring. A rule is a number 0-255: bit i is
// the output for the neighbourhood (left, centre, right) read as the 3-bit
// number left*4 + centre*2 + right.

function step(cells, rule) {
  const n = cells.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const l = cells[(i + n - 1) % n], c = cells[i], r = cells[(i + 1) % n];
    out[i] = (rule >> (l * 4 + c * 2 + r)) & 1;
  }
  return out;
}

function run(cells, rule, steps) {
  const rows = [cells];
  for (let i = 0; i < steps; i++) rows.push(step(rows[i], rule));
  return rows;
}

const toBits = (s) => s.split('').map(Number);
const toStr = (a) => a.join('');
const popcount = (n) => { let c = 0; for (; n; n >>= 1) c += n & 1; return c; };

// Every rule that turns start into target in the given number of steps.
function matchingRules(start, target, steps) {
  const s = Array.isArray(start) ? start : toBits(start);
  const t = toStr(Array.isArray(target) ? target : toBits(target));
  const out = [];
  for (let r = 0; r < 256; r++) {
    const rows = run(s, r, steps);
    if (toStr(rows[steps]) === t) out.push(r);
  }
  return out;
}

// Fewest table flips from the all-zero rule to any matching rule.
function par(start, target, steps) {
  const m = matchingRules(start, target, steps);
  return m.length ? Math.min(...m.map(popcount)) : null;
}

const caApi = { step, run, toBits, toStr, popcount, matchingRules, par };
if (typeof module !== 'undefined') module.exports = caApi;
else window.CA = caApi;
