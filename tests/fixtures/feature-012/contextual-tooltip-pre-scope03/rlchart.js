/* ═══════════ RLCHART — shared canvas-chart hover tooltips (+ tiny hit-test helpers) ═══════════
   NON-NEGOTIABLE house standard: every chart (including <canvas> charts) carries a rich hover
   tooltip explaining what the hovered element is and what its value means in context.
   Canvas pixels can't be DOM-linked, so each chart registers a hit-test closure:

       RLCHART.attach(canvasEl, function (mx, my) {   // mx,my = CSS px inside the canvas
         ...return RLCHART.tip(title, [[label,value],...], "context note") OR null...
       });

   The helper owns the floating tooltip element, positioning, and mouse/touch wiring; the chart
   only maps a cursor position to content. Redraws just call attach() again (idempotent wiring).
   Safe on file://, GitHub Pages, and Node (no-DOM guard). Educational only — not investment advice. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : {});

  /* ── pure helpers (extractable by scripts/selftest.mjs — keep as `function` decls) ── */
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
  /* nearest index into an ASCENDING numeric array (binary search); -1 if empty. */
  function nearestIndex(xs, x) {
    if (!xs || !xs.length) return -1;
    var lo = 0, hi = xs.length - 1;
    if (x <= xs[0]) return 0;
    if (x >= xs[hi]) return hi;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (xs[m] < x) lo = m; else hi = m; }
    return (x - xs[lo] <= xs[hi] - x) ? lo : hi;
  }
  function fmt(v, d) { if (v == null || !isFinite(v)) return "\u2014"; d = (d == null ? 2 : d); return (+v).toFixed(d); }
  function signed(v, d) { if (v == null || !isFinite(v)) return "\u2014"; return (v >= 0 ? "+" : "") + fmt(v, d); }
  function pct(v, d) { if (v == null || !isFinite(v)) return "\u2014"; return (v >= 0 ? "+" : "") + fmt(v, d) + "%"; }

  /* nice log-scale gridlines (1·2·5 ×10^k) inside a positive [lo,hi] window. */
  function logTicks(lo, hi) {
    var out = []; if (!(lo > 0) || !(hi > lo)) return out;
    var e = Math.floor(Math.log(lo) / Math.LN10);
    for (; Math.pow(10, e) <= hi * 1.0000001; e++) { [1, 2, 5].forEach(function (m) { var t = m * Math.pow(10, e); if (t >= lo * 0.9999 && t <= hi * 1.0001) out.push(t); }); }
    return out;
  }

  /* standard tooltip HTML: title + rows [[label,value],...] + optional context note. */
  function tip(title, rows, note) {
    var h = '<div class="h">' + esc(title) + '</div>';
    if (rows && rows.length) h += '<div class="g">' + rows.map(function (r) { return esc(r[0]) + ': <b>' + esc(r[1]) + '</b>'; }).join('<br>') + '</div>';
    if (note) h += '<div class="c">' + esc(note) + '</div>';
    return h;
  }

  /* de-collide horizontal-level LABELS along the y-axis: given items with a numeric pixel `y`,
     assign each a label `ly` so no two labels sit closer than `gap` px, clamped into [top,bottom].
     The gridline/level stays at `y`; only the label moves (draw a connector when ly!==y). Pure,
     stable, and Node-safe so scripts/selftest.mjs covers it. Returns a NEW array (own props copied
     from each input item) sorted ascending by y with `ly` set; null / non-finite `y` items drop. */
  function declutterY(items, gap, top, bottom) {
    var a = [], k;
    for (var q = 0; q < ((items && items.length) || 0); q++) {
      var it = items[q]; if (!it || it.y == null || !isFinite(+it.y)) continue;
      var o = {}; for (k in it) if (Object.prototype.hasOwnProperty.call(it, k)) o[k] = it[k];
      o.y = +it.y; o.ly = +it.y; a.push(o);
    }
    a.sort(function (p, r) { return p.y - r.y; });
    var n = a.length; if (!n) return a;
    gap = (gap > 0) ? gap : 12;
    var hasTop = isFinite(top), hasBot = isFinite(bottom);
    if (hasTop && a[0].ly < top) a[0].ly = top;
    for (var i = 1; i < n; i++) if (a[i].ly < a[i - 1].ly + gap) a[i].ly = a[i - 1].ly + gap;
    if (hasBot && a[n - 1].ly > bottom) {
      a[n - 1].ly = bottom;
      for (var j = n - 2; j >= 0; j--) if (a[j].ly > a[j + 1].ly - gap) a[j].ly = a[j + 1].ly - gap;
      if (hasTop && a[0].ly < top) { a[0].ly = top; for (var m = 1; m < n; m++) if (a[m].ly < a[m - 1].ly + gap) a[m].ly = a[m - 1].ly + gap; }
    }
    return a;
  }

  root.RLCHART = { esc: esc, dist2: dist2, nearestIndex: nearestIndex, fmt: fmt, signed: signed, pct: pct, logTicks: logTicks, tip: tip, declutterY: declutterY };
  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM */

  /* ── floating tooltip element ── */
  function injectCSS() {
    if (document.getElementById("rlchart-css")) return;
    var st = document.createElement("style"); st.id = "rlchart-css";
    st.textContent =
      "#rlcharttip{position:fixed;z-index:10001;max-width:320px;background:#0e1620;border:1px solid #2f4457;border-radius:9px;padding:8px 11px;font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#cbd8e4;box-shadow:0 12px 34px -10px rgba(0,0,0,.75);pointer-events:none;opacity:0;transform:translateY(3px);transition:opacity .1s,transform .1s}" +
      "#rlcharttip.on{opacity:1;transform:translateY(0)}#rlcharttip .h{font-weight:700;color:#e6edf3;margin:0 0 3px}#rlcharttip .g{color:#cbd8e4}#rlcharttip .g b{color:#e6edf3;font-weight:700}#rlcharttip .c{margin-top:6px;padding-top:6px;border-top:1px solid #22303f;color:#93a6b8}" +
      "canvas[data-rlchart]{cursor:crosshair}";
    (document.head || document.documentElement).appendChild(st);
  }
  var tipEl = null;
  function ensure() { if (!tipEl) { tipEl = document.createElement("div"); tipEl.id = "rlcharttip"; (document.body || document.documentElement).appendChild(tipEl); } return tipEl; }
  function place(ev) {
    var e = ensure(), pad = 14, r = e.getBoundingClientRect();
    var x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - pad - r.width;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - pad - r.height;
    e.style.left = Math.max(6, x) + "px"; e.style.top = Math.max(6, y) + "px";
  }
  function show(html, ev) { var e = ensure(); if (e.innerHTML !== html) e.innerHTML = html; place(ev); e.classList.add("on"); }
  function hide() { if (tipEl) tipEl.classList.remove("on"); }

  function handle(ev) {
    var cv = ev.currentTarget, fn = cv && cv.__rlhit; if (!fn) return;
    var r = cv.getBoundingClientRect();
    var mx = ev.clientX - r.left, my = ev.clientY - r.top;
    var html = null; try { html = fn(mx, my, ev); } catch (e) { html = null; }
    if (html) show(html, ev); else hide();
  }

  /* register (or refresh) the hit-tester for a canvas; wiring is idempotent across redraws. */
  function attach(cv, hitFn) {
    if (!cv) return;
    injectCSS();
    cv.__rlhit = hitFn;
    cv.setAttribute("data-rlchart", "1");
    if (!cv.__rlwired) {
      cv.__rlwired = 1;
      cv.addEventListener("mousemove", handle);
      cv.addEventListener("mouseleave", hide);
      cv.addEventListener("touchstart", function (e) { if (e.touches && e.touches[0]) handle({ currentTarget: cv, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); }, { passive: true });
    }
  }

  root.RLCHART.attach = attach;
  root.RLCHART.hide = hide;
})();
