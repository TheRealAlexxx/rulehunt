'use strict';
// Level of the day: same level for everyone on a given UTC date.
function dayNumber(date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function dailyIndex(date, count) {
  // A stride coprime to the count visits every level once per cycle.
  let stride = 7;
  while (gcd(stride, count) !== 1) stride++;
  return (dayNumber(date) * stride) % count;
}

function shareText(date, rule, ones, par, url) {
  const d = date.toISOString().slice(0, 10);
  const tag = ones <= par ? 'par' : '+' + (ones - par);
  return 'rulehunt daily ' + d + ': solved with ' + ones + (ones === 1 ? ' one' : ' ones') + ' (' + tag + ')\n' + url;
}

const dailyApi = { dayNumber, dailyIndex, shareText };
if (typeof module !== 'undefined') module.exports = dailyApi;
else window.Daily = dailyApi;
