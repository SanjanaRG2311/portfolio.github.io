document.documentElement.classList.add('js');

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { line: '#E3D5C4', soft: '#C9A27E', brown: '#8F6847', ink: '#2B2420', muted: '#6F645B', tint: '#F3EADF', warn: '#C2503F', ok: '#4C8C6B' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, u) => a + (b - a) * u;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function box(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function text(ctx, str, x, y, color, size = 11, weight = 500, align = 'center') {
  ctx.font = `${weight} ${size}px Figtree, system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function dot(ctx, x, y, r, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function segment(ctx, x1, y1, x2, y2, color, width = 1, dash = []) {
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

const demos = {
  kafka(ctx, w, h, t, s) {
    const dt = s.last === undefined ? 0 : t - s.last;
    s.last = t;
    s.p = s.p || [];
    s.flash = s.flash || [0, 0, 0, 0];
    s.next = s.next || 0;
    s.count = s.count || 0;
    const py = [0.2, 0.5, 0.8].map(v => v * h);
    const cy = [0.14, 0.38, 0.62, 0.86].map(v => v * h);
    const bw = Math.min(62, w * 0.17), tw = Math.min(92, w * 0.24);
    const px = w * 0.13, tx = w * 0.5, cx = w * 0.87;
    const tl = tx - tw / 2, tr = tx + tw / 2;
    const names = ['Detect', 'Track', 'Face', 'Count'];

    py.forEach(y => segment(ctx, px + bw / 2, y, tl, y, C.line, 1, [3, 4]));
    cy.forEach(y => segment(ctx, tr, y, cx - bw / 2, y, C.line, 1, [3, 4]));
    box(ctx, tl, h * 0.06, tw, h * 0.88, 12, C.tint, C.soft);
    text(ctx, 'Kafka', tx, h * 0.47, C.brown, 14, 600);
    text(ctx, 'topic', tx, h * 0.47 + 17, C.muted, 11);
    py.forEach((y, i) => {
      box(ctx, px - bw / 2, y - 13, bw, 26, 8, '#fff', C.line);
      text(ctx, 'Cam ' + (i + 1), px, y, C.ink, 11);
    });

    if (t > s.next) {
      s.p.push({ a: Math.floor(Math.random() * 3), b: Math.floor(Math.random() * 4), u: 0, v: rand(0.7, 1.1) });
      s.next = t + 0.26;
    }
    s.flash = s.flash.map(f => Math.max(0, f - dt * 2.5));
    s.p.forEach(k => { k.u += dt * k.v; });
    s.p = s.p.filter(k => {
      if (k.u >= 2) { s.flash[k.b] = 1; s.count++; return false; }
      return true;
    });

    cy.forEach((y, i) => {
      box(ctx, cx - bw / 2, y - 13, bw, 26, 8, '#fff', C.line);
      if (s.flash[i] > 0) {
        ctx.globalAlpha = s.flash[i] * 0.7;
        box(ctx, cx - bw / 2, y - 13, bw, 26, 8, C.soft, C.brown);
        ctx.globalAlpha = 1;
      }
      text(ctx, names[i], cx, y, C.ink, 11);
    });

    s.p.forEach(k => {
      let x, y;
      if (k.u < 1) { x = lerp(px + bw / 2, tl, k.u); y = py[k.a]; }
      else { x = lerp(tr, cx - bw / 2, k.u - 1); y = cy[k.b]; }
      dot(ctx, x, y, 7, C.brown, 0.15);
      dot(ctx, x, y, 3.5, C.brown);
    });
    text(ctx, 'events ' + s.count, px, h - 10, C.muted, 11);
  },

  graph(ctx, w, h, t, s) {
    if (!s.n) {
      s.n = Array.from({ length: 14 }, () => ({ x: rand(0.08, 0.92), y: rand(0.16, 0.84), ph: rand(0, 6.28) }));
      s.e = [];
      s.n.forEach((a, i) => {
        s.n.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, (a.y - b.y) * 0.6) }))
          .filter(o => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2)
          .forEach(o => { if (!s.e.some(e => e[0] === o.j && e[1] === i)) s.e.push([i, o.j]); });
      });
      s.pulses = [];
      s.nextP = 0;
      s.flag = -1;
      s.flagT = 0;
      s.nextF = 1;
      s.last = t;
    }
    const dt = t - s.last;
    s.last = t;
    const pos = s.n.map(n => ({ x: n.x * w + Math.sin(t * 0.8 + n.ph) * 5, y: n.y * h + Math.cos(t * 0.7 + n.ph) * 5 }));
    if (t > s.nextF) { s.flag = Math.floor(Math.random() * s.n.length); s.flagT = t; s.nextF = t + 4.2; }
    const fa = s.flag >= 0 ? clamp(1 - (t - s.flagT) / 3.4, 0, 1) : 0;

    s.e.forEach(e => {
      const hot = fa > 0 && (e[0] === s.flag || e[1] === s.flag);
      const a = pos[e[0]], b = pos[e[1]];
      segment(ctx, a.x, a.y, b.x, b.y, hot ? `rgba(194,80,63,${0.25 + 0.5 * fa})` : C.line, hot ? 1.5 : 1);
    });

    if (t > s.nextP) { s.pulses.push({ e: s.e[Math.floor(Math.random() * s.e.length)], u: 0, r: Math.random() < 0.5 }); s.nextP = t + 0.2; }
    s.pulses.forEach(k => { k.u += dt * 0.9; });
    s.pulses = s.pulses.filter(k => k.u < 1);
    s.pulses.forEach(k => {
      const a = pos[k.r ? k.e[1] : k.e[0]], b = pos[k.r ? k.e[0] : k.e[1]];
      dot(ctx, lerp(a.x, b.x, k.u), lerp(a.y, b.y, k.u), 3, C.brown);
    });

    pos.forEach((p, i) => {
      if (i === s.flag && fa > 0) {
        const ring = ((t - s.flagT) * 22) % 26;
        ctx.globalAlpha = fa * (1 - ring / 26);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + ring, 0, Math.PI * 2);
        ctx.strokeStyle = C.warn;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        dot(ctx, p.x, p.y, 6.5, C.warn);
      } else {
        dot(ctx, p.x, p.y, 5.5, '#fff');
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
        ctx.strokeStyle = C.brown;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    if (fa > 0 && s.flag >= 0) {
      const p = pos[s.flag];
      const lx = clamp(p.x, 62, w - 62);
      const ly = p.y < h / 2 ? p.y + 24 : p.y - 24;
      ctx.globalAlpha = Math.min(1, fa * 2.5);
      box(ctx, lx - 58, ly - 11, 116, 22, 11, '#fff', C.warn);
      text(ctx, 'anomaly detected', lx, ly, C.warn, 11, 600);
      ctx.globalAlpha = 1;
    }
  },

  pay(ctx, w, h, t) {
    const y = h * 0.42;
    const xs = [w * 0.15, w * 0.5, w * 0.85];
    const names = ['Your app', 'APISHIFT', 'Solana Devnet'];
    const bw = Math.min(92, w * 0.27);
    const p = (t % 4.5) / 4.5;
    const moving1 = p < 0.4, moving2 = p > 0.55 && p < 0.9;
    const processing = p >= 0.4 && p <= 0.55;
    const done = p >= 0.9;

    segment(ctx, xs[0] + bw / 2, y, xs[1] - bw / 2, y, C.line, 2, [4, 5]);
    segment(ctx, xs[1] + bw / 2, y, xs[2] - bw / 2, y, C.line, 2, [4, 5]);

    xs.forEach((x, i) => {
      const lit = (i === 1 && processing) || (i === 2 && done);
      box(ctx, x - bw / 2, y - 18, bw, 36, 10, lit ? C.tint : '#fff', lit ? C.brown : C.line);
      text(ctx, names[i], x, y, C.ink, 11, 600);
    });

    if (processing) {
      const r = 26 + ((p - 0.4) / 0.15) * 10;
      ctx.globalAlpha = 1 - (p - 0.4) / 0.15;
      ctx.beginPath();
      ctx.arc(xs[1], y, r, 0, Math.PI * 2);
      ctx.strokeStyle = C.brown;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (done) text(ctx, '\u2713', xs[2], y - 34, C.ok, 18, 700);

    let cx = xs[0] + bw / 2;
    if (moving1) cx = lerp(xs[0] + bw / 2, xs[1] - bw / 2, p / 0.4);
    else if (p <= 0.55) cx = xs[1];
    else if (moving2) cx = lerp(xs[1] + bw / 2, xs[2] - bw / 2, (p - 0.55) / 0.35);
    else cx = xs[2] - bw / 2;

    if (moving1 || moving2) {
      for (let k = 1; k <= 6; k++) dot(ctx, cx - k * 9, y, 6 - k * 0.7, C.soft, 0.5 - k * 0.07);
    }
    if (!done) {
      dot(ctx, cx, y, 10, C.brown);
      ctx.beginPath();
      ctx.arc(cx, y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, '$', cx, y + 0.5, '#fff', 9, 700);
    }

    const steps = ['Request sent', 'Payment routed', 'Confirmed on Solana'];
    const idx = moving1 ? 0 : done ? 2 : 1;
    text(ctx, steps[idx], w / 2, h * 0.8, idx === 2 ? C.ok : C.brown, 13, 600);
    [0, 1, 2].forEach(i => dot(ctx, w / 2 + (i - 1) * 14, h * 0.8 + 20, 3, i === idx ? C.brown : C.line));
  },

  doc(ctx, w, h, t) {
    const x0 = w * 0.07, dw = w * 0.5, top = h * 0.12, n = 9, gap = (h * 0.76) / n;
    const widths = [0.92, 0.8, 0.95, 0.7, 0.88, 0.6, 0.93, 0.76, 0.5];
    const hits = { 2: 'Termination', 5: 'Payment', 7: 'Liability' };
    const p = (t % 5) / 5;
    const sy = top + p * n * gap;
    const fade = p > 0.9 ? 1 - (p - 0.9) * 10 : 1;

    box(ctx, x0 - 12, top - 12, dw + 24, n * gap + 24, 10, '#fff', C.line);
    for (let i = 0; i < n; i++) {
      const y = top + i * gap + gap / 2;
      const scanned = sy > y;
      const hit = hits[i] && scanned;
      ctx.globalAlpha = hit ? fade : 1;
      box(ctx, x0, y - 3, dw * widths[i], 6, 3, hit ? C.soft : scanned ? '#E6DACB' : '#F0E8DE', 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      if (hit) {
        const a = clamp((sy - y) / 30, 0, 1) * fade;
        const cw = Math.min(w * 0.3, 104), cxp = w * 0.65 + (1 - a) * 12;
        ctx.globalAlpha = a;
        segment(ctx, x0 + dw * widths[i] + 4, y, cxp, y, C.soft, 1, [3, 3]);
        box(ctx, cxp, y - 12, cw, 24, 12, C.tint, C.soft);
        text(ctx, hits[i], cxp + cw / 2, y, C.brown, 11, 600);
        ctx.globalAlpha = 1;
      }
    }
    if (p < 0.94) {
      ctx.fillStyle = 'rgba(143,104,71,0.12)';
      ctx.fillRect(x0 - 12, sy - 12, dw + 24, 12);
      segment(ctx, x0 - 12, sy, x0 + dw + 12, sy, C.brown, 2);
    }
  }
};

function runner(canvas, draw) {
  const ctx = canvas.getContext('2d');
  let raf = 0, t0 = 0, w = 0, h = 0, state = {};
  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function frame(now) {
    if (!t0) t0 = now;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, (now - t0) / 1000, state);
    raf = requestAnimationFrame(frame);
  }
  return {
    start() {
      cancelAnimationFrame(raf);
      size();
      state = {};
      t0 = 0;
      if (reduce) { ctx.clearRect(0, 0, w, h); draw(ctx, w, h, 3, state); return; }
      raf = requestAnimationFrame(frame);
    },
    stop() { cancelAnimationFrame(raf); },
    resize() { size(); }
  };
}

const runners = [];
$$('.project').forEach(card => {
  const btn = $('.project-toggle', card);
  const cv = $('canvas', card);
  const pill = $('.pill-text', card);
  const run = runner(cv, demos[cv.dataset.demo]);
  runners.push({ card, run });
  btn.addEventListener('click', () => {
    const open = !card.classList.contains('open');
    card.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    pill.textContent = open ? 'Close demo' : 'Live demo';
    if (open) run.start(); else run.stop();
  });
});
addEventListener('resize', () => runners.forEach(r => r.card.classList.contains('open') && r.run.resize()));

(function vision() {
  const cv = $('#net');
  const hero = $('.hero');
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, objs = [], raf = 0, last = 0, clock = 0, nextId = 1, visible = true;

  function make(kind, fresh) {
    const car = kind === 'car';
    const dir = Math.random() < 0.5 ? 1 : -1;
    return {
      id: nextId++,
      kind,
      born: clock,
      x: car ? (fresh ? rand(0, w) : dir > 0 ? -60 : w + 60) : rand(40, w - 40),
      y: car ? rand(h * 0.6, h * 0.9) : rand(h * 0.2, h * 0.85),
      vx: car ? dir * rand(60, 95) : rand(-22, 22),
      vy: car ? 0 : rand(-12, 12),
      ph: rand(0, 6.28),
      acc: 0,
      trail: []
    };
  }

  function size() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const small = w < 600;
    objs = [];
    for (let i = 0; i < (small ? 3 : 5); i++) objs.push(make('person', true));
    for (let i = 0; i < (small ? 1 : 2); i++) objs.push(make('car', true));
  }

  function step(dt) {
    clock += dt;
    objs = objs.map(o => {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (o.kind === 'car') {
        if (o.x < -80 || o.x > w + 80) return make('car', false);
      } else {
        o.vx = clamp(o.vx + rand(-1, 1) * dt * 30, -28, 28);
        o.vy = clamp(o.vy + rand(-1, 1) * dt * 20, -14, 14);
        if (o.x < 30 || o.x > w - 30) { o.vx *= -1; o.x = clamp(o.x, 30, w - 30); }
        if (o.y < h * 0.15 || o.y > h * 0.9) { o.vy *= -1; o.y = clamp(o.y, h * 0.15, h * 0.9); }
      }
      o.acc += dt;
      if (o.acc > 0.08) { o.acc = 0; o.trail.push({ x: o.x, y: o.y }); if (o.trail.length > 18) o.trail.shift(); }
      return o;
    });
  }

  function corners(x, y, hw, hh, len, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = C.brown;
    ctx.lineWidth = 1.5;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * hw, y + sy * (hh - len));
      ctx.lineTo(x + sx * hw, y + sy * hh);
      ctx.lineTo(x + sx * (hw - len), y + sy * hh);
      ctx.stroke();
    });
    ctx.globalAlpha = alpha * 0.18;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - hw, y - hh, hw * 2, hh * 2);
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    const sy = (clock * 70) % (h + 140) - 70;
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = `rgba(143,104,71,${0.05 * (1 - k / 8)})`;
      ctx.fillRect(0, sy - k * 5, w, 5);
    }
    segment(ctx, 0, sy, w, sy, 'rgba(143,104,71,0.28)', 1);

    objs.forEach(o => {
      o.trail.forEach((p, i) => dot(ctx, p.x, p.y, 1.6, C.brown, (i / o.trail.length) * 0.35));
      const a = clamp((clock - o.born) / 0.6, 0, 1);
      const car = o.kind === 'car';
      ctx.globalAlpha = 0.6;
      if (car) {
        box(ctx, o.x - 27, o.y - 9, 54, 18, 6, C.soft, 'rgba(0,0,0,0)');
        dot(ctx, o.x - 15, o.y + 10, 5, C.brown);
        dot(ctx, o.x + 15, o.y + 10, 5, C.brown);
      } else {
        dot(ctx, o.x, o.y - 14, 6, C.soft);
        box(ctx, o.x - 9, o.y - 6, 18, 26, 7, C.soft, 'rgba(0,0,0,0)');
      }
      ctx.globalAlpha = 1;
      const hw = car ? 38 : 17, hh = car ? 20 : 29;
      const cy = car ? o.y + 1 : o.y;
      const grow = 1 + (1 - a) * 0.5;
      corners(o.x, cy, hw * grow, hh * grow, 7, a);
      const conf = (0.9 + 0.08 * Math.sin(clock * 0.9 + o.ph)).toFixed(2);
      const tag = (car ? 'car ' : 'person ') + conf + '  #' + o.id;
      const tw = tag.length * 5.7 + 12;
      ctx.globalAlpha = a;
      box(ctx, o.x - hw, cy - hh - 17, tw, 15, 4, C.brown, C.brown);
      text(ctx, tag, o.x - hw + 6, cy - hh - 9.5, '#fff', 10, 500, 'left');
      ctx.globalAlpha = 1;
    });

    const on = Math.floor(clock * 1.2) % 2 === 0;
    if (on) dot(ctx, w - 118, 30, 4, C.warn);
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = C.muted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('CAM 01  LIVE', w - 108, 30);
    ctx.fillText(objs.length + ' objects tracked', w - 138, 50);
  }

  function loop(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    step(dt);
    render();
    raf = requestAnimationFrame(loop);
  }
  function play() { if (!reduce && visible && !document.hidden) { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop); } }
  function pause() { cancelAnimationFrame(raf); }
  function still() { clock = 3; objs.forEach(o => { o.born = 0; }); render(); }

  size();
  if (reduce) still(); else play();
  addEventListener('resize', () => { size(); if (reduce) still(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else pause(); }).observe(hero);
})();

(function typing() {
  const el = $('#typed');
  const words = ['real-time data pipelines', 'computer vision systems', 'applied generative AI'];
  if (reduce) { el.textContent = words[0]; return; }
  let wi = 0, ci = 0, del = false;
  (function tick() {
    const word = words[wi];
    ci += del ? -1 : 1;
    el.textContent = word.slice(0, ci);
    let d = del ? 35 : 70;
    if (!del && ci === word.length) { del = true; d = 1500; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 350; }
    setTimeout(tick, d);
  })();
})();

(function terminal() {
  const term = $('#term');
  const lines = [
    { t: 'run pipelines --live', c: 'cmd' },
    { t: 'Kafka stream online, 9 pipelines', c: 'ok' },
    { t: 'Face recognition ready', c: 'ok' },
    { t: 'Fall detection ready', c: 'ok' }
  ];
  const els = lines.map(l => {
    const d = document.createElement('div');
    d.className = 'tl ' + l.c;
    term.appendChild(d);
    return d;
  });
  function finish() {
    const p = document.createElement('div');
    p.className = 'tl cmd prompt';
    term.appendChild(p);
  }
  if (reduce) { lines.forEach((l, i) => { els[i].textContent = l.t; }); finish(); return; }
  let li = 0, ci = 0;
  setTimeout(function step() {
    if (li >= lines.length) { finish(); return; }
    const l = lines[li];
    ci++;
    els[li].textContent = l.t.slice(0, ci);
    if (ci >= l.t.length) { li++; ci = 0; setTimeout(step, 380); }
    else setTimeout(step, l.c === 'cmd' ? 55 : 22);
  }, 500);
})();

$$('.tiles .tile').forEach((el, i) => el.style.setProperty('--d', i * 60 + 'ms'));
$$('.project-grid .project').forEach((el, i) => el.style.setProperty('--d', i * 90 + 'ms'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealObserver.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

const header = $('.header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const toggle = $('.nav-toggle');
const menu = $('.nav-menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
$$('a', menu).forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const emailBtn = $('#emailBtn');
const emailReveal = $('#emailReveal');
const copyBtn = $('#copyBtn');
const EMAIL = 'sanjanaravi2311@gmail.com';
emailBtn.addEventListener('click', () => { emailReveal.hidden = false; });
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyBtn.textContent = 'Copied';
  } catch (err) {
    const range = document.createRange();
    range.selectNodeContents($('.email-addr'));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    copyBtn.textContent = 'Press Ctrl+C';
  }
  setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
});

$('#current-year').textContent = new Date().getFullYear();
