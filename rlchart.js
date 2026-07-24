/* ═══════════ RLCHART — shared canvas context inspection (+ tiny hit-test helpers) ═══════════
  Structured charts expose pointer, touch, keyboard point rails, and same-data table targets
  through RLCTX. The original function hit-test overload remains migration compatibility:

       RLCHART.attach(canvasEl, function (mx, my) {   // mx,my = CSS px inside the canvas
         ...return RLCHART.tip(title, [[label,value],...], "context note") OR null...
       });

  The helper owns point selection and accessibility wiring; RLCTX alone owns disclosure.
  Redraws call attach() again (idempotent wiring).
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

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function adapterError(reason, fieldPath) {
    if (root.RLCTX && typeof root.RLCTX.projectError === "function") {
      return root.RLCTX.projectError({ reason: reason, fieldPath: fieldPath, phase: "chart-adapter-validation" });
    }
    return deepFreeze({
      contractVersion: "experience-error/v1",
      code: "E012-CONTEXT-MISSING",
      phase: "chart-adapter-validation",
      toolId: null,
      contractId: "contextual-tooltip/v1",
      reason: reason,
      fieldPath: fieldPath,
      recoverable: false,
      dependencyGateId: null,
      valueEchoed: false
    });
  }

  function validateStructuredAdapter(adapter) {
    function fail(reason, fieldPath) { return deepFreeze({ ok: false, error: adapterError(reason, fieldPath) }); }
    if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) return fail("structured chart adapter required", "$.adapter");
    var expected = ["contextFor", "hitTest", "orderedPointIds", "seriesOrder", "tableTargetFor"];
    var keys = Object.keys(adapter).sort();
    if (keys.join("|") !== expected.join("|")) return fail("structured chart adapter fields must match the contract exactly", "$.adapter");
    if (typeof adapter.hitTest !== "function") return fail("hitTest function required", "$.hitTest");
    if (typeof adapter.contextFor !== "function") return fail("contextFor function required", "$.contextFor");
    if (typeof adapter.tableTargetFor !== "function") return fail("tableTargetFor function required", "$.tableTargetFor");
    if (!Array.isArray(adapter.orderedPointIds) || !adapter.orderedPointIds.length) return fail("orderedPointIds must be non-empty", "$.orderedPointIds");
    if (!Array.isArray(adapter.seriesOrder)) return fail("seriesOrder array required", "$.seriesOrder");
    if (!root.RLCTX || typeof root.RLCTX.validateContext !== "function") return fail("RLCTX validator unavailable", "$.contextFor");
    var seen = Object.create(null), points = Object.create(null), tableTargets = Object.create(null);
    for (var i = 0; i < adapter.orderedPointIds.length; i++) {
      var pointId = adapter.orderedPointIds[i];
      if (typeof pointId !== "string" || !/^[A-Za-z0-9:._-]+$/.test(pointId)) return fail("stable point ID required", "$.orderedPointIds[" + i + "]");
      if (seen[pointId]) return fail("duplicate point ID", "$.orderedPointIds[" + i + "]");
      seen[pointId] = true;
      var contextResult = root.RLCTX.validateContext(adapter.contextFor(pointId));
      if (!contextResult.ok) return deepFreeze({ ok: false, error: contextResult.error });
      var target = adapter.tableTargetFor(pointId);
      if (typeof target !== "string" || !/^[A-Za-z][A-Za-z0-9:._-]*$/.test(target)) return fail("safe same-data table target required", "$.tableTargetFor(" + pointId + ")");
      if (contextResult.value.links.sameDataTable !== "#" + target) return fail("context same-data link must match tableTargetFor", "$.contextFor(" + pointId + ").links.sameDataTable");
      points[pointId] = contextResult.value;
      tableTargets[pointId] = target;
    }
    for (var s = 0; s < adapter.seriesOrder.length; s++) {
      if (typeof adapter.seriesOrder[s] !== "string" || !adapter.seriesOrder[s]) return fail("seriesOrder values must be non-empty strings", "$.seriesOrder[" + s + "]");
    }
    return deepFreeze({
      ok: true,
      value: {
        orderedPointIds: adapter.orderedPointIds.slice(),
        points: points,
        seriesOrder: adapter.seriesOrder.slice(),
        tableTargets: tableTargets
      }
    });
  }

  root.RLCHART = { esc: esc, dist2: dist2, nearestIndex: nearestIndex, fmt: fmt, signed: signed, pct: pct, logTicks: logTicks, tip: tip, declutterY: declutterY, validateStructuredAdapter: validateStructuredAdapter };
  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM */

  function injectCSS() {
    if (document.getElementById("rlchart-css")) return;
    var st = document.createElement("style"); st.id = "rlchart-css";
    st.textContent =
      "canvas[data-rlchart]{cursor:crosshair}canvas[data-rlchart-mode=structured]:focus{outline:2px solid var(--teal,#2dd4bf);outline-offset:2px}" +
      ".rlchart-point-rail{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}";
    (document.head || document.documentElement).appendChild(st);
  }
  var activeCanvas = null;

  function safeDomId(value) {
    return String(value || "point").replace(/[^A-Za-z0-9:._-]+/g, "-").replace(/^-+|-+$/g, "") || "point";
  }

  function pointOptionId(canvas, pointId) {
    return "rlchart-point-" + safeDomId(canvas.id || "canvas") + "-" + safeDomId(pointId);
  }

  function ensurePointRail(canvas, projection) {
    var railId = "rlchart-rail-" + safeDomId(canvas.id || "canvas");
    var rail = document.getElementById(railId);
    if (!rail) {
      rail = document.createElement("div");
      rail.id = railId;
      rail.className = "rlchart-point-rail";
      rail.setAttribute("role", "listbox");
      rail.setAttribute("aria-label", (canvas.getAttribute("aria-label") || "Chart") + " point rail");
      canvas.insertAdjacentElement("afterend", rail);
    }
    rail.textContent = "";
    projection.orderedPointIds.forEach(function (pointId) {
      var option = document.createElement("span");
      option.id = pointOptionId(canvas, pointId);
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = projection.points[pointId].accessibility.conciseLabel;
      rail.appendChild(option);
    });
    canvas.setAttribute("aria-owns", railId);
    return rail;
  }

  function contextApi() {
    return root.RLCTX && typeof root.RLCTX.open === "function" ? root.RLCTX : null;
  }

  function pointIndex(state, pointId) {
    return state.projection.orderedPointIds.indexOf(pointId);
  }

  function selectPoint(canvas, pointId, options) {
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "structured" || !state.projection.points[pointId]) return false;
    options = options || {};
    state.activePointId = pointId;
    state.pinned = Boolean(options.pinned);
    activeCanvas = canvas;
    canvas.setAttribute("data-rlchart-active-point", pointId);
    canvas.setAttribute("aria-activedescendant", pointOptionId(canvas, pointId));
    var railOptions = state.rail.querySelectorAll("[role=option]");
    for (var i = 0; i < railOptions.length; i++) {
      railOptions[i].setAttribute("aria-selected", railOptions[i].id === pointOptionId(canvas, pointId) ? "true" : "false");
    }
    var tableTarget = document.getElementById(state.projection.tableTargets[pointId]);
    if (tableTarget) {
      tableTarget.setAttribute("data-rlchart-point-id", pointId);
      tableTarget.setAttribute("data-rlcontext-fingerprint", state.projection.points[pointId].contextFingerprint);
    }
    var api = contextApi();
    if (!api) return false;
    api.open(canvas, state.projection.points[pointId], {
      mode: options.mode || "chart",
      pinned: state.pinned,
      pointer: options.pointer || null
    });
    return true;
  }

  function chartCoordinates(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return { mx: event.clientX - rect.left, my: event.clientY - rect.top };
  }

  function handleStructuredPointer(canvas, event, pin) {
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "structured") return;
    var coordinates = chartCoordinates(canvas, event);
    var pointId = null;
    try { pointId = state.adapter.hitTest(coordinates.mx, coordinates.my); } catch (error) { pointId = null; }
    if (pointId && state.projection.points[pointId]) {
      selectPoint(canvas, pointId, { mode: pin ? "touch" : "hover", pinned: pin, pointer: event });
    } else if (!state.pinned) {
      hide(canvas, false);
    }
  }

  function handleLegacyPointer(canvas, event, pin) {
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "legacy") return;
    var coordinates = chartCoordinates(canvas, event);
    var html = null;
    try { html = state.hitFn(coordinates.mx, coordinates.my, event); } catch (error) { html = null; }
    var api = contextApi();
    if (html && api) {
      state.pinned = Boolean(pin);
      activeCanvas = canvas;
      api.openLegacy(canvas, html, { mode: pin ? "touch" : "legacy-hover", pinned: pin, pointer: event });
    } else if (!state.pinned) hide(canvas, false);
  }

  function handlePointerMove(event) {
    var canvas = event.currentTarget;
    var state = canvas.__rlchartState;
    if (!state || event.pointerType === "touch") return;
    if (state.mode === "structured") handleStructuredPointer(canvas, event, false);
    else handleLegacyPointer(canvas, event, false);
  }

  function handlePointerDown(event) {
    if (event.pointerType !== "touch") return;
    var canvas = event.currentTarget;
    var state = canvas.__rlchartState;
    if (!state) return;
    if (state.mode === "structured") handleStructuredPointer(canvas, event, true);
    else handleLegacyPointer(canvas, event, true);
  }

  function handleFocus(event) {
    var canvas = event.currentTarget;
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "structured") return;
    var pointId = state.activePointId || state.projection.orderedPointIds[0];
    selectPoint(canvas, pointId, { mode: "keyboard", pinned: true });
  }

  function movePoint(canvas, delta, edge) {
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "structured") return;
    var ids = state.projection.orderedPointIds;
    var index = pointIndex(state, state.activePointId);
    if (edge === "first") index = 0;
    else if (edge === "last") index = ids.length - 1;
    else index = Math.max(0, Math.min(ids.length - 1, (index < 0 ? 0 : index) + delta));
    selectPoint(canvas, ids[index], { mode: "keyboard", pinned: true });
  }

  function handleKeyDown(event) {
    var canvas = event.currentTarget;
    var state = canvas.__rlchartState;
    if (!state || state.mode !== "structured") return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); movePoint(canvas, 1); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); movePoint(canvas, -1); }
    else if (event.key === "Home") { event.preventDefault(); movePoint(canvas, 0, "first"); }
    else if (event.key === "End") { event.preventDefault(); movePoint(canvas, 0, "last"); }
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPoint(canvas, state.activePointId || state.projection.orderedPointIds[0], { mode: "keyboard", pinned: true });
    } else if (event.key === "Escape") {
      event.preventDefault();
      hide(canvas, true);
    }
  }

  function wireCanvas(canvas) {
    if (canvas.__rlchartWired) return;
    canvas.__rlchartWired = true;
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", function () {
      var state = canvas.__rlchartState;
      if (state && !state.pinned) hide(canvas, false);
    });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("focus", handleFocus);
    canvas.addEventListener("keydown", handleKeyDown);
  }

  function attachStructured(canvas, adapter) {
    var validated = validateStructuredAdapter(adapter);
    if (!validated.ok) {
      canvas.setAttribute("data-rlchart-error", validated.error.code);
      canvas.removeAttribute("data-rlchart-mode");
      return validated;
    }
    var previous = canvas.__rlchartState;
    var activePointId = previous && previous.mode === "structured" && validated.value.points[previous.activePointId]
      ? previous.activePointId
      : null;
    var pinned = Boolean(activePointId && previous.pinned);
    canvas.__rlchartState = {
      activePointId: activePointId,
      adapter: adapter,
      mode: "structured",
      pinned: pinned,
      projection: validated.value,
      rail: ensurePointRail(canvas, validated.value)
    };
    canvas.tabIndex = 0;
    canvas.setAttribute("data-rlchart", "1");
    canvas.setAttribute("data-rlchart-mode", "structured");
    canvas.removeAttribute("data-rlchart-error");
    if (activePointId) {
      canvas.setAttribute("data-rlchart-active-point", activePointId);
      canvas.setAttribute("aria-activedescendant", pointOptionId(canvas, activePointId));
      var activeOption = document.getElementById(pointOptionId(canvas, activePointId));
      if (activeOption) activeOption.setAttribute("aria-selected", "true");
    }
    wireCanvas(canvas);
    return validated;
  }

  function attachLegacy(canvas, hitFn) {
    canvas.__rlchartState = { hitFn: hitFn, mode: "legacy", pinned: false };
    canvas.setAttribute("data-rlchart", "1");
    canvas.setAttribute("data-rlchart-mode", "legacy");
    canvas.setAttribute("data-rlchart-migration-required", "true");
    wireCanvas(canvas);
    return deepFreeze({ ok: true, value: { mode: "legacy" } });
  }

  function attach(canvas, adapterOrHitFn) {
    if (!canvas) return deepFreeze({ ok: false, error: adapterError("canvas required", "$.canvas") });
    injectCSS();
    if (typeof adapterOrHitFn === "function") return attachLegacy(canvas, adapterOrHitFn);
    return attachStructured(canvas, adapterOrHitFn);
  }

  function hide(canvas, returnFocus) {
    var target = canvas || activeCanvas;
    if (target && target.__rlchartState) target.__rlchartState.pinned = false;
    var api = contextApi();
    if (api) api.close({ returnFocus: Boolean(returnFocus) });
    if (activeCanvas === target) activeCanvas = null;
  }

  root.RLCHART.attach = attach;
  root.RLCHART.hide = hide;
})();
