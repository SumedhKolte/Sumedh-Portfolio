/* ------------------------------------------------------------------
   skyline.js — a 3D city built from real GitHub repositories.

   No three.js, no WebGL, no dependencies: a hand-written perspective
   projection onto a 2D canvas, with painter's-algorithm sorting and
   flat-shaded faces. ~1 API call, 25 boxes, 125 polygons a frame.

   Each building is one repository:
     height  log10(repo size) — so a 28 MB repo doesn't dwarf a 200 KB one
     colour  primary language
     depth   most recent push at the front

   Public API: Skyline.mount(root) / Skyline.unmount()
------------------------------------------------------------------- */
var Skyline = (function () {
  'use strict';

  var LANG = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B',
    Kotlin: '#A97BFF', Java: '#b07219', PLpgSQL: '#336790', Shell: '#89e051',
    C: '#555555', Go: '#00ADD8', Rust: '#dea584', Dart: '#00B4AB'
  };
  var OTHER = '#8b8b8b';

  var state = null;      // live mount, or null
  var cache = null;      // repo list, fetched once per page load

  function langColor(l) { return LANG[l] || OTHER; }

  /* --- tiny 3D ------------------------------------------------------ */

  function makeCamera() {
    return { yaw: -0.62, pitch: 0.48, dist: 34, focal: 520, spin: true };
  }

  /* World point → screen point. Returns null behind the camera. */
  function project(cam, w, h, x, y, z) {
    var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var x1 = x * cy + z * sy;
    var z1 = -x * sy + z * cy;
    var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    var y2 = y * cp - z1 * sp;
    var z2 = y * sp + z1 * cp;
    var zc = z2 + cam.dist;
    if (zc < 1) return null;
    var f = cam.focal / zc;
    return { x: w / 2 + x1 * f, y: h / 2 - y2 * f + h * 0.18, z: zc };
  }

  /* Shade a hex colour by a 0–1 factor. */
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * k);
    var g = Math.round(((n >> 8) & 255) * k);
    var b = Math.round((n & 255) * k);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function poly(ctx, pts, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function inPoly(pts, px, py) {
    var hit = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i].y > py) !== (pts[j].y > py) &&
          px < (pts[j].x - pts[i].x) * (py - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x) {
        hit = !hit;
      }
    }
    return hit;
  }

  /* --- layout -------------------------------------------------------- */

  function layout(repos) {
    var cols = Math.ceil(Math.sqrt(repos.length)) || 1;
    var gap = 4.2, side = 2.15;
    var maxLog = 1;
    repos.forEach(function (r) { maxLog = Math.max(maxLog, Math.log10((r.size || 1) + 1)); });

    return repos.map(function (r, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var span = (cols - 1) * gap / 2;
      var h = 0.9 + Math.pow(Math.log10((r.size || 1) + 1) / maxLog, 1.7) * 9.5;
      return {
        repo: r,
        x: col * gap - span,
        z: row * gap - span,
        w: side,
        h: h,
        color: langColor(r.language)
      };
    });
  }

  /* --- draw ---------------------------------------------------------- */

  function draw() {
    if (!state) return;
    var ctx = state.ctx, cam = state.cam;
    var w = state.w, h = state.h;

    ctx.clearRect(0, 0, w, h);

    if (cam.spin && !state.dragging && !state.reduced) cam.yaw += 0.0022;

    // ground grid
    var g = 22;
    ctx.strokeStyle = state.gridColor;
    ctx.lineWidth = 1;
    for (var i = -g; i <= g; i += 4) {
      var a = project(cam, w, h, i, 0, -g), b = project(cam, w, h, i, 0, g);
      var c = project(cam, w, h, -g, 0, i), d = project(cam, w, h, g, 0, i);
      if (a && b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      if (c && d) { ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke(); }
    }

    // farthest building first
    var boxes = state.boxes.slice();
    boxes.forEach(function (bx) {
      var p = project(cam, w, h, bx.x, 0, bx.z);
      bx._depth = p ? p.z : 1e9;
    });
    boxes.sort(function (a, b) { return b._depth - a._depth; });

    state.picks = [];

    boxes.forEach(function (bx) {
      var x0 = bx.x - bx.w / 2, x1 = bx.x + bx.w / 2;
      var z0 = bx.z - bx.w / 2, z1 = bx.z + bx.w / 2;
      var P = function (x, y, z) { return project(cam, w, h, x, y, z); };

      var top = [P(x0, bx.h, z0), P(x1, bx.h, z0), P(x1, bx.h, z1), P(x0, bx.h, z1)];
      if (top.indexOf(null) > -1) return;

      var sides = [
        [P(x0, 0, z0), P(x1, 0, z0), P(x1, bx.h, z0), P(x0, bx.h, z0)],
        [P(x1, 0, z0), P(x1, 0, z1), P(x1, bx.h, z1), P(x1, bx.h, z0)],
        [P(x1, 0, z1), P(x0, 0, z1), P(x0, bx.h, z1), P(x1, bx.h, z1)],
        [P(x0, 0, z1), P(x0, 0, z0), P(x0, bx.h, z0), P(x0, bx.h, z1)]
      ];

      var lit = state.hover === bx;
      var shades = [0.52, 0.66, 0.40, 0.58];

      sides.forEach(function (s, n) {
        if (s.indexOf(null) > -1) return;
        // back-face cull via 2D winding
        var area = 0;
        for (var i = 0, j = s.length - 1; i < s.length; j = i++) {
          area += (s[j].x - s[i].x) * (s[j].y + s[i].y);
        }
        if (area <= 0) return;
        poly(ctx, s, shade(bx.color, shades[n] * (lit ? 1.45 : 1)));
      });

      poly(ctx, top, shade(bx.color, lit ? 1 : 0.82), lit ? '#fff' : null);
      state.picks.push({ box: bx, top: top });
    });

    state.raf = requestAnimationFrame(draw);
  }

  /* --- interaction ---------------------------------------------------- */

  function pick(px, py) {
    for (var i = state.picks.length - 1; i >= 0; i--) {
      if (inPoly(state.picks[i].top, px, py)) return state.picks[i].box;
    }
    return null;
  }

  function showTip(bx, px, py) {
    var t = state.tip;
    if (!bx) { t.hidden = true; return; }
    var r = bx.repo;
    t.innerHTML = '';
    var name = document.createElement('strong');
    name.textContent = r.name;
    var meta = document.createElement('span');
    meta.textContent = (r.language || '—') + ' · ' + Math.round((r.size || 0) / 1024 * 10) / 10 +
      ' MB · pushed ' + (r.pushed_at || '').slice(0, 10);
    t.appendChild(name);
    t.appendChild(meta);
    t.hidden = false;
    var pad = 14;
    t.style.left = Math.min(px + pad, state.canvas.clientWidth - t.offsetWidth - 8) + 'px';
    t.style.top = Math.max(4, py - t.offsetHeight - pad) + 'px';
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = state.canvas.getBoundingClientRect();
    state.w = rect.width;
    state.h = rect.height;
    state.canvas.width = Math.round(rect.width * dpr);
    state.canvas.height = Math.round(rect.height * dpr);
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function readThemeColors() {
    var cs = getComputedStyle(document.documentElement);
    state.gridColor = cs.getPropertyValue('--line').trim() || '#333';
  }

  /* --- build / mount --------------------------------------------------- */

  function fetchRepos() {
    if (cache) return Promise.resolve(cache);
    if (typeof GITHUB === 'undefined' || !window.fetch) return Promise.reject(new Error('no fetch'));
    var url = 'https://api.github.com/users/' + encodeURIComponent(GITHUB.user) +
              '/repos?per_page=100&sort=pushed';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (list) {
      cache = list.filter(function (r) { return !r.fork; });
      return cache;
    });
  }

  function applyFilter() {
    var all = cache || [];
    var repos = state.showAll
      ? all
      : all.filter(function (r) { return (r.pushed_at || '') >= '2026-01-01'; });
    repos = repos.slice(0, 36);
    state.boxes = layout(repos);
    state.count.textContent = repos.length + ' repositories · height = size (log) · colour = language';
    renderLegend(repos);
  }

  function renderLegend(repos) {
    var seen = {};
    repos.forEach(function (r) { if (r.language) seen[r.language] = true; });
    state.legend.innerHTML = '';
    Object.keys(seen).sort().forEach(function (l) {
      var chip = document.createElement('span');
      var dot = document.createElement('i');
      dot.style.background = langColor(l);
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(l));
      state.legend.appendChild(chip);
    });
  }

  function mount(root) {
    unmount();
    var canvas = root.querySelector('[data-skyline-canvas]');
    if (!canvas || !canvas.getContext) return;

    state = {
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      cam: makeCamera(),
      boxes: [],
      picks: [],
      hover: null,
      dragging: false,
      showAll: false,
      tip: root.querySelector('[data-skyline-tip]'),
      legend: root.querySelector('[data-skyline-legend]'),
      count: root.querySelector('[data-skyline-count]'),
      status: root.querySelector('[data-skyline-status]'),
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      handlers: []
    };

    readThemeColors();
    sizeCanvas();

    var on = function (target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      state.handlers.push([target, type, fn]);
    };

    var last = null;
    on(canvas, 'pointerdown', function (e) {
      state.dragging = true;
      last = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    });
    on(canvas, 'pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left, py = e.clientY - rect.top;
      if (state.dragging && last) {
        state.cam.yaw += (e.clientX - last.x) * 0.007;
        state.cam.pitch = Math.max(0.12, Math.min(1.15, state.cam.pitch + (e.clientY - last.y) * 0.005));
        last = { x: e.clientX, y: e.clientY };
        state.hover = null;
        state.tip.hidden = true;
        return;
      }
      var bx = pick(px, py);
      state.hover = bx;
      canvas.style.cursor = bx ? 'pointer' : 'grab';
      showTip(bx, px, py);
    });
    var end = function (e) {
      state.dragging = false;
      last = null;
      if (e && e.pointerId != null && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };
    on(canvas, 'pointerup', end);
    on(canvas, 'pointercancel', end);
    on(canvas, 'pointerleave', function () {
      state.hover = null;
      if (state.tip) state.tip.hidden = true;
    });
    on(canvas, 'click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var bx = pick(e.clientX - rect.left, e.clientY - rect.top);
      if (bx) window.open(bx.repo.html_url, '_blank', 'noopener');
    });
    on(canvas, 'wheel', function (e) {
      e.preventDefault();
      state.cam.dist = Math.max(16, Math.min(80, state.cam.dist + (e.deltaY > 0 ? 2.5 : -2.5)));
    }, { passive: false });

    var spinBtn = root.querySelector('[data-skyline-spin]');
    if (spinBtn) {
      on(spinBtn, 'click', function () {
        state.cam.spin = !state.cam.spin;
        spinBtn.setAttribute('aria-pressed', String(state.cam.spin));
        spinBtn.textContent = state.cam.spin ? 'Pause rotation' : 'Resume rotation';
      });
    }
    var allBtn = root.querySelector('[data-skyline-all]');
    if (allBtn) {
      on(allBtn, 'click', function () {
        state.showAll = !state.showAll;
        allBtn.setAttribute('aria-pressed', String(state.showAll));
        allBtn.textContent = state.showAll ? 'Showing all years' : 'Showing 2026 only';
        applyFilter();
      });
    }

    on(window, 'resize', function () { if (state) sizeCanvas(); });

    state.status.textContent = 'Fetching repositories from GitHub…';
    fetchRepos().then(function () {
      if (!state) return;
      applyFilter();
      state.status.hidden = true;
      state.raf = requestAnimationFrame(draw);
    }).catch(function () {
      if (!state) return;
      state.status.textContent =
        'GitHub is unreachable right now — the skyline needs live repository data. ' +
        'Everything else on this page works offline.';
    });
  }

  function unmount() {
    if (!state) return;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.handlers.forEach(function (h) { h[0].removeEventListener(h[1], h[2]); });
    state = null;
  }

  function retheme() { if (state) readThemeColors(); }

  return { mount: mount, unmount: unmount, retheme: retheme };
})();
