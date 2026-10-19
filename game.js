'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('rulehunt') || '{}'); } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem('rulehunt', JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  let levels = [], idx = 0, rule = 0, lv = null, daily = false;

  fetch('levels.json').then((r) => r.json()).then((d) => {
    levels = d;
    daily = location.hash === '#daily';
    const h = daily ? Daily.dailyIndex(new Date(), d.length) + 1 : parseInt(location.hash.slice(1), 10);
    buildList();
    load(h > 0 && h <= d.length ? h - 1 : Math.min(store.get().cur || 0, d.length - 1));
  });

  function strip(el, bits, cmp) {
    el.innerHTML = '';
    bits.forEach((b, i) => {
      const c = document.createElement('div');
      c.className = 'cell' + (b ? ' on' : '') + (cmp && cmp[i] !== b ? ' bad' : '');
      el.appendChild(c);
    });
  }

  function load(i) {
    idx = i; lv = levels[i]; rule = 0;
    const s = store.get(); s.cur = i; store.set(s);
    history.replaceState(null, '', daily ? '#daily' : '#' + (i + 1));
    $('share').hidden = true;
    $('lvl').textContent = 'level ' + lv.id + ' of ' + levels.length;
    $('n').textContent = lv.steps;
    strip($('start'), CA.toBits(lv.start));
    strip($('target'), CA.toBits(lv.target));
    buildTable();
    update();
    refreshList();
  }

  function buildTable() {
    const t = $('table');
    t.innerHTML = '';
    for (let k = 7; k >= 0; k--) {
      const d = document.createElement('div');
      d.className = 'rule'; d.dataset.k = k;
      const nb = document.createElement('div'); nb.className = 'nb';
      [4, 2, 1].forEach((m) => { const x = document.createElement('i'); if (k & m) x.className = 'on'; nb.appendChild(x); });
      const out = document.createElement('div'); out.className = 'out';
      d.appendChild(nb); d.appendChild(out);
      d.addEventListener('click', () => { rule ^= 1 << k; update(); });
      t.appendChild(d);
    }
    $('rulenum').innerHTML = '(rule <input id="rn" type="number" min="0" max="255" value="0">)';
    $('rn').addEventListener('input', (e) => { const v = parseInt(e.target.value, 10); if (v >= 0 && v <= 255) { rule = v; update(true); } });
  }

  function update(fromInput) {
    [...$('table').children].forEach((d) => d.classList.toggle('on', !!((rule >> d.dataset.k) & 1)));
    if (!fromInput) $('rn').value = rule;
    const rows = CA.run(CA.toBits(lv.start), rule, lv.steps);
    const run = $('run');
    run.innerHTML = '';
    const target = CA.toBits(lv.target);
    rows.slice(1).forEach((r, i) => {
      const s = document.createElement('div'); s.className = 'strip';
      strip(s, r, i === rows.length - 2 ? target : null);
      run.appendChild(s);
    });
    const ok = CA.toStr(rows[lv.steps]) === lv.target;
    const ones = CA.popcount(rule);
    $('info').textContent = 'par ' + lv.par + '  ones ' + ones;
    $('target').className = 'strip' + (ok ? ' won' : '');
    const m = $('msg');
    if (ok) {
      m.className = 'win';
      m.textContent = 'Match with rule ' + rule + '. ' + (ones <= lv.par ? 'Par.' : (ones - lv.par) + ' over par.') +
        ' ' + lv.matches + (lv.matches === 1 ? ' rule works' : ' rules work') + ' here.';
      const s = store.get(); s.best = s.best || {};
      if (!s.best[idx] || ones < s.best[idx]) s.best[idx] = ones;
      store.set(s); refreshList();
      $('share').hidden = !daily;
    } else { m.className = ''; m.textContent = ''; }
  }

  function buildList() {
    const box = $('levels');
    levels.forEach((l, i) => {
      const b = document.createElement('button');
      b.textContent = l.id; b.addEventListener('click', () => { daily = false; load(i); }); box.appendChild(b);
    });
  }
  function refreshList() {
    const best = store.get().best || {};
    [...$('levels').children].forEach((b, i) => {
      b.className = (i === idx ? 'cur ' : '') + (best[i] ? (best[i] <= levels[i].par ? 'par' : 'done') : '');
    });
  }
  $('daily').addEventListener('click', () => { daily = true; load(Daily.dailyIndex(new Date(), levels.length)); });
  $('share').addEventListener('click', () => {
    const text = Daily.shareText(new Date(), rule, CA.popcount(rule), lv.par, 'https://therealalexxx.github.io/rulehunt/#daily');
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      () => { $('msg').textContent = 'Copied: ' + text.split('\n')[0]; }, () => { $('msg').textContent = text; });
  });
  $('clear').addEventListener('click', () => { rule = 0; update(); });
  $('prev').addEventListener('click', () => { if (idx > 0) { daily = false; load(idx - 1); }; });
  $('next').addEventListener('click', () => { if (idx + 1 < levels.length) { daily = false; load(idx + 1); }; });
})();
