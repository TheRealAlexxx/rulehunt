'use strict';
// Generates levels.json. Each level hides a rule; the player only sees the
// start row, the target row and the step count.
// Usage: node gen.js [seed] [count]
const fs = require('fs');
const CA = require('./ca.js');

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seed = parseInt(process.argv[2] || '5', 10);
const want = parseInt(process.argv[3] || '40', 10);
const rand = rng(seed);
const out = [];
const seen = new Set();
while (out.length < want) {
  const w = 12 + Math.floor(rand() * 9);
  const steps = 1 + Math.floor(rand() * 6);
  const start = [];
  const density = 0.2 + rand() * 0.4;
  for (let i = 0; i < w; i++) start.push(rand() < density ? 1 : 0);
  const rule = Math.floor(rand() * 256);
  const rows = CA.run(start, rule, steps);
  const target = rows[steps];
  const ones = target.reduce((a, b) => a + b, 0);
  if (ones < 2 || ones > w - 2) continue;                  // dull targets
  if (CA.toStr(target) === CA.toStr(start)) continue;
  const m = CA.matchingRules(start, target, steps);
  const par = Math.min(...m.map(CA.popcount));
  if (par < 3) continue;                                   // too easy to stumble onto
  const key = CA.toStr(start) + CA.toStr(target);
  if (seen.has(key)) continue;
  seen.add(key);
  out.push({ w, steps, start: CA.toStr(start), target: CA.toStr(target), par, matches: m.length, example: m[0] });
}
// Easy first: fewer steps to reason through, then more matching rules.
out.sort((a, b) => a.steps - b.steps || b.matches - a.matches);
out.forEach((l, i) => { l.id = i + 1; });
fs.writeFileSync('levels.json', JSON.stringify(out));
const hist = {};
out.forEach((l) => { hist[l.matches] = (hist[l.matches] || 0) + 1; });
console.log('levels', out.length, 'matches histogram', JSON.stringify(hist));
