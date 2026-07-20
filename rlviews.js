/* ═══════════ RL Views — shared, uniform view-mode switch (loaded by every Research Lab tool) ═══════════
   One self-contained script that injects a SINGLE standardized segmented control in a FIXED position
   (top-center) on every tool, so the Simple / Power / Brief switch always looks the same and sits in the
   same place — regardless of each tool's own header layout. It replaces the per-tool hand-rolled toggles
   (which had drifted into three different markups/positions) with one shared component.

   Contract (opt-in, per tool):
     <meta name="rlviews" content="simple,power,brief">   ← simple/power tools
     <meta name="rlviews" content="view,brief">           ← single-view tools (no Simple/Power)
   If the meta is absent, rlviews stays inert (renders nothing) — safe to ship before a tool opts in.

   Mode semantics (mutually exclusive; the switch is the single source of truth):
     simple → body has NEITHER `power` NOR `rlv-brief`  (tool's decision-first view)
     power  → body has `power`, not `rlv-brief`          (tool's full dashboard)
     view   → body has neither                            (single-view tool's normal view)
     brief  → body has `rlv-brief`                        (focused shared-brief view; underlying view preserved)

   On every change rlviews:
     • toggles `document.body.classList` → `power` (back-compat with existing tool CSS) + `rlv-brief`
     • sets `document.body.dataset.rlview = <mode>`
     • dispatches `window` CustomEvent `rlviews:change` with `{ detail: { mode, previousMode, toolId } }`
       so each tool can run its own render/compute on mode change (tools listen; rlviews never forks their logic).
     • persists the active non-brief mode per tool in localStorage.

   Design language mirrors rlnav.js (teal #2dd4bf accent, dark glass, shared font stack). No dependencies;
   safe on file:// and GitHub Pages; DOM-guarded for Node. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : {};
  if (root.__rlviewsInit) return; root.__rlviewsInit = 1;
  if (typeof document === "undefined") return; /* no-DOM (Node) guard */

  var ALL_MODES = { simple: 1, power: 1, view: 1, brief: 1 };
  var LABELS = { simple: "Simple", power: "Power", view: "Tool", brief: "Brief" };
  var TITLES = {
    simple: "Decision-first view — the curated read",
    power: "Full dashboard — every panel, chart and table",
    view: "The tool",
    brief: "Shared brief — the current read for this tool"
  };

  function briefEnabledPage() {
    try {
      var m = document.querySelector('meta[name="rlbrief-enabled"]');
      var c = m && m.getAttribute("content");
      return !!(c && c !== "0" && c !== "false");
    } catch (e) { return false; }
  }
  function readModeMeta() {
    try {
      var meta = document.querySelector('meta[name="rlviews"]');
      return meta ? (meta.getAttribute("content") || "").trim().toLowerCase() : null;
    } catch (e) { return null; }
  }
  /* Modes: an explicit <meta name="rlviews" content="simple,power,brief"> wins; otherwise
     auto-detect from the presence of a legacy Simple/Power toggle (#modeSeg / #simpleTab /
     #powerTab). Every enabled tool has a brief mount, so Brief is always offered. */
  function detectModes(metaContent) {
    if (metaContent && metaContent !== "off") {
      var out = [];
      metaContent.split(",").forEach(function (raw) {
        var m = (raw || "").trim().toLowerCase();
        if (ALL_MODES[m] && out.indexOf(m) === -1) out.push(m);
      });
      if (out.length) return out;
    }
    var hasSP = false;
    try { hasSP = !!(document.getElementById("modeSeg") || document.getElementById("simpleTab") || document.getElementById("powerTab")); } catch (e) { }
    return hasSP ? ["simple", "power", "brief"] : ["view", "brief"];
  }

  function toolId() {
    try {
      var mount = document.querySelector && document.querySelector("[data-rlbrief-mount][data-tool-id]");
      if (mount) return mount.getAttribute("data-tool-id") || "tool";
      var p = (location.pathname || "").split("/").pop() || "tool";
      return p.replace(/\.html?$/, "") || "tool";
    } catch (e) { return "tool"; }
  }

  /* Activate only on enabled tool pages (they carry the rlbrief-enabled meta); allow a tool
     to opt OUT with <meta name="rlviews" content="off"> — used by tools whose tests still
     couple to the legacy toggle, pending a spec migration. */
  var META_MODES = readModeMeta();
  if (!briefEnabledPage() || META_MODES === "off") return;
  var MODES = detectModes(META_MODES);
  var TOOL = toolId();
  var baseModes = MODES.filter(function (m) { return m !== "brief"; });
  var defaultBase = baseModes.length ? baseModes[0] : "view";

  var lastBase = defaultBase; /* the underlying view to return to when leaving Brief */
  var current = defaultBase;
  var seg;

  function esc(s) {
    return (s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function injectCSS() {
    if (document.getElementById("rlviews-css")) return;
    var st = document.createElement("style"); st.id = "rlviews-css";
    st.textContent = [
      "#rlviews{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9995;display:inline-flex;align-items:stretch;gap:2px;padding:3px;border-radius:11px;background:rgba(14,20,28,.72);border:1px solid #24313f;box-shadow:0 6px 20px -8px rgba(0,0,0,.7);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}",
      /* reserve top space so the fixed switch never overlaps the tool's title (desktop) */
      "body{padding-top:54px}",
      "#rlviews button{appearance:none;-webkit-appearance:none;border:1px solid transparent;background:transparent;color:#9fb2c4;cursor:pointer;padding:6px 14px;min-height:32px;border-radius:8px;font:inherit;letter-spacing:.1px;transition:color .14s,background .14s,border-color .14s}",
      "#rlviews button:hover{color:#e6edf3;background:#152230}",
      "#rlviews button:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px}",
      "#rlviews button[aria-selected='true']{color:#04121a;background:linear-gradient(90deg,#2dd4bf,#4bd6c4);border-color:transparent;font-weight:700;box-shadow:0 1px 5px -1px rgba(45,212,191,.5)}",
      "#rlviews .rlv-ico{font-weight:700;margin-right:5px;opacity:.85}",
      "@media (max-width:560px){#rlviews{top:auto;bottom:12px}#rlviews button{padding:6px 12px}body{padding-top:0;padding-bottom:66px}}",
      "@media (prefers-reduced-motion:reduce){#rlviews button{transition:none}}",
      /* Brief focus view: hide the tool's own top-level content, reveal the shared brief mount as a card. */
      "body.rlv-brief>*:not(#rlviews):not(#rlnav):not(#rlnav-launcher):not(#rlnav-edge):not(#rl-proto-warn):not([data-rlbrief-mount]):not(script):not(style):not(link){display:none!important}",
      "body.rlv-brief [data-rlbrief-mount]{display:block!important;max-width:860px;margin:64px auto 40px;padding:0 18px}",
      "body.rlv-brief{overflow-y:auto}",      /* Outside Brief mode the shared brief lives ONLY behind the Brief tab \u2014 never dumped at the
         page bottom in Simple/Power. (Injected only on switch-active tools, so opt-out tools keep
         their inline brief until migrated.) */
      "body:not(.rlv-brief) [data-rlbrief-mount]{display:none!important}",      /* Hide each tool's legacy inline Simple/Power toggle — rlviews replaces and drives it. */
      "#modeSeg,#simpleTab,#powerTab{display:none!important}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  /* Legacy-toggle facade: most tools still carry their original inline Simple/Power toggle
     (now hidden by CSS). rlviews drives that existing, tested logic by synthesizing a click
     on the matching legacy button — so a tool needs only the <meta> + <script>, no JS surgery.
     Three legacy shapes are supported: #modeSeg[data-mode] (pattern A), #modeSeg[data-m]
     (pattern C), and #simpleTab/#powerTab (pattern B). A fully-migrated tool (e.g. the sector
     pilot) has no legacy toggle and instead listens for the rlviews:change event below. */
  var driving = false;
  function driveLegacy(mode) {
    if (driving || (mode !== "simple" && mode !== "power")) return false;
    var btn = null;
    var legacySeg = document.getElementById("modeSeg");
    if (legacySeg) {
      /* attribute variants seen across tools: data-mode / data-m / data-value */
      btn = legacySeg.querySelector('[data-mode="' + mode + '"], [data-m="' + mode + '"], [data-value="' + mode + '"]');
      if (!btn) {
        /* universal fallback: match the legacy button by its visible label */
        var kids = legacySeg.querySelectorAll("button");
        for (var i = 0; i < kids.length; i++) {
          if ((kids[i].textContent || "").trim().toLowerCase() === mode) { btn = kids[i]; break; }
        }
      }
    }
    /* pattern B tools use #simpleTab / #powerTab (currently opt-out holdouts) */
    if (!btn) btn = document.getElementById(mode + "Tab");
    if (btn && typeof btn.click === "function") {
      driving = true;
      try { btn.click(); } catch (e) { }
      driving = false;
      return true;
    }
    return false;
  }

  /* Detect the tool's CURRENT base mode for boot reflection: body.power OR an active legacy toggle
     button (some tools mark power via aria-pressed/aria-selected/.on without setting body.power). */
  function legacyActiveIsPower() {
    try {
      if (document.body.classList.contains("power")) return true;
      var legacySeg = document.getElementById("modeSeg");
      if (legacySeg) {
        var pw = legacySeg.querySelector('[data-mode="power"],[data-m="power"],[data-value="power"]');
        if (!pw) {
          var kids = legacySeg.querySelectorAll("button");
          for (var i = 0; i < kids.length; i++) { if ((kids[i].textContent || "").trim().toLowerCase() === "power") { pw = kids[i]; break; } }
        }
        if (pw && (pw.getAttribute("aria-pressed") === "true" || pw.getAttribute("aria-selected") === "true" || pw.classList.contains("on"))) return true;
      }
      var pt = document.getElementById("powerTab");
      if (pt && (pt.getAttribute("aria-selected") === "true" || pt.getAttribute("aria-pressed") === "true")) return true;
    } catch (e) { }
    return false;
  }

  /* Pure visual reflection: body state + control UI. No tool drive, no event. */
  function applyVisual(mode) {
    var isBrief = (mode === "brief");
    if (!isBrief) lastBase = mode;
    current = mode;
    document.body.classList.toggle("power", mode === "power");
    document.body.classList.toggle("rlv-brief", isBrief);
    try { document.body.setAttribute("data-rlview", mode); } catch (e) { }
    if (seg) {
      var btns = seg.querySelectorAll("button[data-rlview-mode]");
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i].getAttribute("data-rlview-mode") === mode;
        btns[i].setAttribute("aria-selected", on ? "true" : "false");
        btns[i].tabIndex = on ? 0 : -1;
      }
    }
  }

  /* User-initiated change: reflect + drive the tool (legacy click for simple/power) + notify. */
  function apply(mode) {
    var previous = current;
    applyVisual(mode);
    if (mode === "simple" || mode === "power") driveLegacy(mode);
    try {
      root.dispatchEvent(new CustomEvent("rlviews:change", {
        detail: { mode: mode, previousMode: previous, baseMode: (mode === "brief") ? lastBase : mode, toolId: TOOL }
      }));
    } catch (e) { }
  }

  function build() {
    injectCSS();
    seg = document.createElement("div");
    seg.id = "rlviews";
    seg.setAttribute("role", "tablist");
    seg.setAttribute("aria-label", "View mode");
    var html = "";
    MODES.forEach(function (m) {
      html +=
        '<button type="button" role="tab" data-rlview-mode="' + esc(m) + '"' +
        ' aria-selected="false" title="' + esc(TITLES[m] || "") + '">' +
        esc(LABELS[m] || m) + "</button>";
    });
    seg.innerHTML = html;
    (document.body || document.documentElement).appendChild(seg);

    seg.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button[data-rlview-mode]") : null;
      if (!btn) return;
      var mode = btn.getAttribute("data-rlview-mode");
      if (mode && mode !== current) apply(mode);
    });
    /* keyboard: left/right move between segments (roving tabindex) */
    seg.addEventListener("keydown", function (ev) {
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var idx = MODES.indexOf(current);
      if (idx === -1) return;
      var next = ev.key === "ArrowRight" ? (idx + 1) % MODES.length : (idx - 1 + MODES.length) % MODES.length;
      apply(MODES[next]);
      var target = seg.querySelector('button[data-rlview-mode="' + MODES[next] + '"]');
      if (target && target.focus) target.focus();
      ev.preventDefault();
    });

    /* initial mode: rlviews is a stateless facade — it FOLLOWS the tool's own restored state
       (each tool persists its own mode and sets body.power during its init) rather than forcing
       one. Reflect defaultBase immediately (no unselected flash), then, once the tool has
       initialized, reflect its actual base view. Never boot into Brief. */
    applyVisual(defaultBase);
    var bootReflect = function () {
      var m = defaultBase;
      if (baseModes.indexOf("power") !== -1 && legacyActiveIsPower()) m = "power";
      applyVisual(m);
    };
    if (root.requestAnimationFrame) root.requestAnimationFrame(function () { root.setTimeout(bootReflect, 0); });
    else root.setTimeout(bootReflect, 30);
    /* Follow late/async tool mode changes (e.g. a persisted mode restored after data settles):
       observe the legacy toggle and re-reflect when its active state changes, unless we're mid-drive
       or in Brief. Bounded to the first few seconds so it never perpetually observes. */
    (function observeLegacy() {
      try {
        var targets = [document.getElementById("modeSeg"), document.getElementById("simpleTab"), document.getElementById("powerTab")].filter(Boolean);
        if (!targets.length || !root.MutationObserver) return;
        var obs = new root.MutationObserver(function () {
          if (driving || current === "brief") return;
          var want = (baseModes.indexOf("power") !== -1 && legacyActiveIsPower()) ? "power" : defaultBase;
          if (want !== current) applyVisual(want);
        });
        for (var i = 0; i < targets.length; i++) obs.observe(targets[i], { attributes: true, attributeFilter: ["aria-pressed", "aria-selected", "class"], subtree: true });
        root.setTimeout(function () { try { obs.disconnect(); } catch (e) { } }, 4000);
      } catch (e) { }
    })();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
