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

(function flow() {
  const cv = $('#net');
  const ctx = cv.getContext('2d');
  const labels = [['Ingest', 'Kafka'], ['Process', 'SQL and ETL'], ['Model', 'ML and GenAI'], ['Insight', 'Dashboards']];
  const flash = [0, 0, 0, 0];
  const bars = [0.4, 0.65, 0.5, 0.8, 0.6];
  let targets = bars.slice();
  let w = 0, h = 0, raf = 0, last = 0, clock = 0, next = 0, nextBars = 0, packets = [], visible = true;

  function size() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function geometry() {
    return { cw: Math.min(132, w * 0.2), ch: Math.min(88, h - 62), top: 4, xs: [0.125, 0.375, 0.625, 0.875].map(v => v * w) };
  }

  const visuals = [
    (x0, y0, cw, ch) => {
      const p = 14, span = cw - 2 * p;
      [0.3, 0.5, 0.7].forEach((f, lane) => {
        const y = y0 + ch * f;
        segment(ctx, x0 + p, y, x0 + p + span, y, '#F0E8DE', 3);
        for (let k = 0; k < 3; k++) {
          const dx = (clock * (34 + lane * 8) + (k * span) / 3 + lane * 11) % span;
          const len = Math.min(10, span - dx);
          ctx.globalAlpha = 0.85;
          segment(ctx, x0 + p + dx, y, x0 + p + dx + len, y, C.soft, 3);
          ctx.globalAlpha = 1;
        }
      });
    },
    (x0, y0, cw, ch) => {
      const p = 14, gap = 4;
      const cwid = (cw - 2 * p - 2 * gap) / 3, chei = (ch - 2 * p - 2 * gap) / 3;
      const act = Math.floor(clock * 2.2) % 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const fill = r === act ? C.brown : r === (act + 2) % 3 ? C.soft : '#F0E8DE';
          box(ctx, x0 + p + c * (cwid + gap), y0 + p + r * (chei + gap), cwid, chei, 3, fill, 'rgba(0,0,0,0)');
        }
      }
    },
    (x0, y0, cw, ch) => {
      const layers = [3, 4, 2], p = 16;
      const pts = layers.map((n, l) => Array.from({ length: n }, (_, i) => ({ x: x0 + p + (l * (cw - 2 * p)) / 2, y: y0 + (ch * (i + 1)) / (n + 1) })));
      for (let l = 0; l < 2; l++) {
        pts[l].forEach((a, i) => pts[l + 1].forEach((b, j) => {
          const act = 0.5 + 0.5 * Math.sin(clock * 3 + l * 1.3 + i + j);
          segment(ctx, a.x, a.y, b.x, b.y, `rgba(143,104,71,${0.08 + 0.22 * act})`, 1);
        }));
      }
      pts.forEach((layer, l) => layer.forEach((n, i) => {
        const act = 0.5 + 0.5 * Math.sin(clock * 3 + l * 1.3 + i * 1.7);
        dot(ctx, n.x, n.y, 3.6, C.brown, 0.3 + 0.7 * act);
      }));
    },
    (x0, y0, cw, ch) => {
      const p = 14, base = y0 + ch - p, maxH = ch - 2 * p - 8, slot = (cw - 2 * p) / 5, bw = slot * 0.6;
      const tops = bars.map((b, i) => ({ x: x0 + p + i * slot + slot / 2, y: base - b * maxH }));
      tops.forEach((t, i) => box(ctx, t.x - bw / 2, t.y, bw, base - t.y, 2, i === 4 ? C.brown : C.soft, 'rgba(0,0,0,0)'));
      ctx.beginPath();
      tops.forEach((t, i) => { if (i) ctx.lineTo(t.x, t.y - 7); else ctx.moveTo(t.x, t.y - 7); });
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      const end = tops[tops.length - 1];
      dot(ctx, end.x, end.y - 7, 2.6, C.ink);
    }
  ];

  function packet(x, y, seg, a) {
    ctx.globalAlpha = a;
    if (seg === 0) box(ctx, x - 4, y - 4, 8, 8, 2, C.soft, C.soft);
    else if (seg === 1) box(ctx, x - 4, y - 4, 8, 8, 2, C.brown, C.brown);
    else {
      dot(ctx, x, y, 4.5, C.brown);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = C.brown;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    clock += dt;
    for (let i = 0; i < 4; i++) flash[i] = Math.max(0, flash[i] - dt * 2.2);
    if (clock > next) { packets.push({ u: 0 }); flash[0] = 1; next = clock + 0.95; }
    packets.forEach(k => {
      const before = Math.floor(k.u);
      k.u += dt * 0.6;
      const after = Math.floor(k.u);
      if (after > before && after <= 3) flash[after] = 1;
    });
    packets = packets.filter(k => k.u < 3);
    if (clock > nextBars) { targets = bars.map(() => rand(0.3, 0.95)); nextBars = clock + 1.8; }
    bars.forEach((b, i) => { bars[i] = b + (targets[i] - b) * Math.min(1, dt * 3); });
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    const { cw, ch, top, xs } = geometry();
    const cy = top + ch / 2;
    for (let i = 0; i < 3; i++) segment(ctx, xs[i] + cw / 2, cy, xs[i + 1] - cw / 2, cy, C.line, 1.5, [4, 5]);
    xs.forEach((x, i) => {
      const x0 = x - cw / 2;
      box(ctx, x0, top, cw, ch, 12, '#fff', C.line);
      ctx.globalAlpha = flash[i];
      box(ctx, x0, top, cw, ch, 12, 'rgba(0,0,0,0)', C.brown);
      ctx.globalAlpha = 1;
      visuals[i](x0, top, cw, ch);
      text(ctx, labels[i][0], x, top + ch + 18, C.ink, 13, 600);
      text(ctx, labels[i][1], x, top + ch + 35, C.muted, 11);
    });
    packets.forEach(k => {
      const seg = Math.min(2, Math.floor(k.u));
      const from = xs[seg] + cw / 2, to = xs[seg + 1] - cw / 2;
      const x = lerp(from, to, k.u - seg);
      for (let t = 1; t <= 3; t++) {
        if (x - t * 9 > from) dot(ctx, x - t * 9, cy, 2.2, C.brown, 0.28 - t * 0.07);
      }
      packet(x, cy, seg, 1);
    });
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
  function still() { clock = 3; packets = [{ u: 0.5 }, { u: 1.4 }, { u: 2.3 }]; render(); }

  size();
  if (reduce) still(); else play();
  addEventListener('resize', () => { size(); if (reduce) still(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else pause(); }).observe(cv);
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
