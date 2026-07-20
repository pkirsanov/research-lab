/* ═══════════ RL Nav — shared collapsible left navigation (loaded by every Research Lab page) ═══════════
   One self-contained script that injects a common left-side drawer linking every tool.
     • Open/close via the ☰ launcher button (works for touch + click); the open/closed state persists across pages.
     • When closed on a desktop (fine pointer), the drawer PREVIEWS as the mouse approaches the left screen edge and
       hides again when the pointer moves away. On touch devices the launcher is the only control.
     • Highlights the current tool. Injects its own CSS; no dependencies; safe on file:// and GitHub Pages.
   To add a tool: drop its single-file .html at the repo root, then add one entry to the TOOLS array below
   (keep it in sync with the TOOLS array in index.html and with tools.json). */

/* ═══════════ RL Theme — shared typography + brand tokens, injected on every tool ═══════════
   Unifies the "feel and look" across all tools: ONE typeface everywhere (intentional monospace for
   data/code is preserved) and canonical brand accent tokens. Runs immediately when rlnav.js executes
   (defer → after each tool's own inline <style>, so equal-specificity rules win) to override the drift
   (Trebuchet / Georgia / Iowan / Avenir / Inter / JetBrains …) with one consistent system sans. */
(function rlThemeInject() {
  try {
    if (typeof document === "undefined") return;
    if (document.getElementById("rl-theme-css")) return;
    var st = document.createElement("style"); st.id = "rl-theme-css";
    st.textContent = [
      /* Canonical dark theme: the tools are var-based but use several naming conventions
         (--bg/--surface/--paper/--ink/--txt/--text, --line/--border/--bd, --muted/--dim …).
         Map them ALL to one dark palette so every tool shares the same surfaces + text, then a
         body safety-net for anything hardcoded. Contrast is preserved (dark surface + light text). */
      ":root{--bg:#0b0f14;--panel:#121922;--panel2:#0e141c;--surface:#121922;--surface2:#0e141c;--surface-2:#0e141c;--paper:#0b0f14;--card:#121922;--band:#121922;--band-2:#0e141c;--ground:#0b0f14;--chip:#16202b;--txt:#e6edf3;--text:#e6edf3;--ink:#e6edf3;--fg:#e6edf3;--tx:#cbd8e4;--muted:#8aa0b3;--mut:#8aa0b3;--text-muted:#8aa0b3;--dim:#5d7186;--faint:#667477;--line:#1f2a36;--line2:#2e4254;--bd:#22303f;--bd2:#2f4457;--border:#243040;--teal:#2dd4bf;--amber:#f5b942;--gold:#f5b942;--green:#39d98a;--up:#39d98a;--blue:#5aa9f0;--violet:#a98bf0;--purple:#a98bf0;--red:#f0556b;--down:#f0556b;--pink:#f072b6;--cyan:#40c9d8}",
      "body{background:#0b0f14!important;color:#e6edf3!important}",
      /* one typeface everywhere */
      "html,body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif!important}",
      "h1,h2,h3,h4,h5,h6,button,input,select,textarea,.card,.panel,.pill,.kpi,.hint,.dim,.meta{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif!important}",
      /* intentional monospace preserved for numeric/code/tabular content */
      "code,kbd,samp,pre,.mono,.token,.rlbrief-token,[class*=mono],[class*=Mono]{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Roboto Mono',monospace!important}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* never break a tool over the shared theme */ }
})();

(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : {};
  if (root.__rlnavInit) return; root.__rlnavInit = 1;
  if (typeof document === "undefined") return; /* no-DOM (Node) guard */

  /* ── tool registry — order mirrors index.html's TOOLS array ── */
  var HOME = { label: "All tools", full: "Research Lab — home", icon: "🏠", file: "index.html" };
  var TOOLS = [
    { label: "Market Brief", full: "Actionable Market Brief", icon: "🛰️", file: "market-brief.html" },
    { label: "Market Heatmap", full: "Market Heatmap Lab", icon: "🗺️", file: "market-heatmap-lab.html" },
    { label: "Unusual Options", full: "Unusual Options Activity Lab", icon: "🐋", file: "options-flow-feed-lab.html" },
    { label: "Intraday Tape", full: "Intraday Tape & Volume-Profile Lab", icon: "🎯", file: "intraday-tape-lab.html" },
    { label: "Swing Structure", full: "Swing Structure & Market-Regime Lab", icon: "🌊", file: "swing-structure-lab.html" },
    { label: "Options Structure", full: "Options Structure & Momentum Research Lab", icon: "🧱", file: "options-structure-lab.html" },
    { label: "Gamma Trading", full: "Gamma Trading & Dealer-Flow Playbook Lab", icon: "🧨", file: "gamma-trading-lab.html" },
    { label: "Sector Rotation", full: "Sector Rotation & Momentum Research Lab", icon: "🧭", file: "sector-research-lab.html" },
    { label: "Global Rotation", full: "Global Rotation Lab", icon: "🌐", file: "global-rotation-lab.html" },
    { label: "Real Assets", full: "Real Assets Lab", icon: "🪙", file: "real-assets-lab.html" },
    { label: "Bond Regime", full: "Bond Regime & Fixed-Income Scenario Lab", icon: "📉", file: "bond-regime-lab.html" },
    { label: "AI Capex Strategy", full: "AI Capex Strategy Lab", icon: "⚡", file: "ai-capex-strategy-lab.html" },
    { label: "MSFT July Print", full: "MSFT July-Print Margin & EPS Model", icon: "📊", file: "msft-july-print-model.html" },
    { label: "Company Fundamentals", full: "Company Fundamentals & Adaptive Brief Lab", icon: "🏢", file: "company-fundamentals-lab.html" },
    { label: "ETF Momentum", full: "ETF Momentum Research Lab", icon: "📈", file: "etf-momentum-lab.html" },
    { label: "Strategy Self-Improve", full: "Strategy Self-Improvement & Walk-Forward Lab", icon: "🔬", file: "strategy-self-improvement-lab.html" },
    { label: "Strategy Validate", full: "Strategy Validation & Real-Data Walk-Forward Lab", icon: "🧪", file: "strategy-validation-lab.html" },
    { label: "Smart-Money Flow", full: "Smart-Money & Congressional-Flow Lab", icon: "🏛️", file: "smart-money-flow-lab.html" },
    { label: "Waterfront × Polo", full: "Florida Waterfront × Masters Water-Polo Screener", icon: "🤽", file: "waterfront-polo-lab.html" }
  ];

  function currentFile() {
    var p = (location.pathname || "").split("/").pop();
    return (!p || p === "") ? "index.html" : p;
  }

  TOOLS.push(
    { label: "Vol Sizing", full: "Volatility Regime & Vol-Targeting Sizing Lab", icon: "🌪️", file: "volatility-sizing-lab.html" }
  );
  TOOLS.push(
    { label: "Palm Springs Rentals", full: "Palm Springs Rental Market Lab", icon: "🌴", file: "palm-springs-rental-market-lab.html" },
    { label: "Ocean Shores Rentals", full: "Ocean Shores Rental Market Lab", icon: "🏖️", file: "ocean-shores-rental-market-lab.html" }
  );
  TOOLS.push(
    { label: "TA Decision", full: "Technical Analysis Decision Lab", icon: "📐", file: "technical-analysis-decision-lab.html" }
  );

  var LSKEY = "rlnav.pinned";
  function loadPinned() { try { return localStorage.getItem(LSKEY) === "1"; } catch (e) { return false; } }
  function savePinned(v) { try { localStorage.setItem(LSKEY, v ? "1" : "0"); } catch (e) { } }

  var hoverCapable = false;
  try { hoverCapable = !!(window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches); } catch (e) { }

  var EDGE = 16;      /* px from the left edge that triggers the preview */
  var HIDE_GAP = 28;  /* px past the drawer's right edge before it hides again */
  var pinned = loadPinned();  /* user asked for it open (persisted) */
  var preview = false;        /* transient edge-hover reveal */
  var panel, launcher, edge, headBtn;

  function esc(s) {
    return (s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function injectCSS() {
    if (document.getElementById("rlnav-css")) return;
    var st = document.createElement("style"); st.id = "rlnav-css";
    st.textContent = [
      "#rlnav,#rlnav *{box-sizing:border-box}",
      /* floating launcher — the always-available open control (also the only control on touch) */
      "#rlnav-launcher{position:fixed;top:12px;left:12px;z-index:9997;width:38px;height:34px;display:flex;align-items:center;justify-content:center;padding:0;margin:0;background:rgba(14,20,28,.72);color:#cbd8e4;border:1px solid #24313f;border-radius:9px;cursor:pointer;font:16px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;opacity:.6;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 4px 14px -6px rgba(0,0,0,.6);transition:opacity .15s,color .15s,border-color .15s,background .15s}",
      "#rlnav-launcher:hover{opacity:1;color:#2dd4bf;border-color:#2dd4bf}",
      "#rlnav-launcher:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px;opacity:1}",
      "#rlnav-launcher.hidden{opacity:0;pointer-events:none}",
      /* thin left-edge hint that the drawer lives here (desktop only) */
      "#rlnav-edge{position:fixed;top:0;left:0;width:5px;height:100vh;z-index:9990;pointer-events:none;background:linear-gradient(180deg,rgba(45,212,191,.55),rgba(90,169,240,.16) 55%,transparent);opacity:.25;transition:opacity .2s}",
      "#rlnav-edge.hide{opacity:0}",
      /* the drawer */
      "#rlnav{position:fixed;top:0;left:0;height:100vh;width:248px;max-width:86vw;z-index:9996;display:flex;flex-direction:column;background:linear-gradient(180deg,#121922,#0d131b);border-right:1px solid #22303f;box-shadow:0 0 44px -8px rgba(0,0,0,.75);color:#e6edf3;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;transform:translateX(-100%);transition:transform .22s cubic-bezier(.4,0,.2,1);will-change:transform}",
      "#rlnav.open{transform:translateX(0)}",
      "#rlnav .rlnav-head{display:flex;align-items:center;gap:9px;padding:13px 12px 11px;border-bottom:1px solid #1c2836}",
      "#rlnav .rlnav-logo{display:flex;align-items:center;gap:7px;font-size:16px;font-weight:750;letter-spacing:-.3px;text-decoration:none;color:#e6edf3;white-space:nowrap}",
      "#rlnav .rlnav-logo .rlnav-word{background:linear-gradient(90deg,#2dd4bf,#f5b942);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}",
      "#rlnav .rlnav-head-btn{margin-left:auto;width:28px;height:28px;display:flex;align-items:center;justify-content:center;padding:0;background:transparent;border:1px solid transparent;border-radius:7px;color:#8aa0b3;cursor:pointer;font:14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;transition:.14s}",
      "#rlnav .rlnav-head-btn:hover{color:#e6edf3;background:#152230;border-color:#22323f}",
      "#rlnav .rlnav-head-btn:focus-visible{outline:2px solid #2dd4bf;outline-offset:1px}",
      "#rlnav .rlnav-list{flex:1;overflow-y:auto;padding:8px 8px 4px;-webkit-overflow-scrolling:touch}",
      "#rlnav a.rlnav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:2px;border-radius:8px;border:1px solid transparent;color:#c2cfdc;text-decoration:none;transition:background .14s,color .14s,border-color .14s}",
      "#rlnav a.rlnav-item .rlnav-ico{flex:0 0 auto;width:20px;text-align:center;font-size:15px}",
      "#rlnav a.rlnav-item .rlnav-tt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#rlnav a.rlnav-item:hover{background:#152230;color:#e6edf3;border-color:#22323f}",
      "#rlnav a.rlnav-item.active{background:linear-gradient(90deg,rgba(45,212,191,.16),rgba(45,212,191,.03));color:#fff;border-color:rgba(45,212,191,.42)}",
      "#rlnav a.rlnav-item.active .rlnav-tt{font-weight:650}",
      "#rlnav a.rlnav-item:focus-visible{outline:2px solid #2dd4bf;outline-offset:1px}",
      "#rlnav .rlnav-sep{height:1px;margin:6px 10px;background:#1c2836}",
      "#rlnav .rlnav-foot{padding:9px 14px;border-top:1px solid #1c2836;color:#5d7186;font-size:11px;line-height:1.4}",
      "#rlnav .rlnav-foot a{color:#67d7c6;text-decoration:none;font-weight:650}",
      "@media (max-width:640px){#rlnav{width:82vw}}",
      "@media (prefers-reduced-motion:reduce){#rlnav{transition:none}}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  function render() {
    var open = pinned || preview;
    if (panel) panel.classList.toggle("open", open);
    if (edge) edge.classList.toggle("hide", open);
    if (launcher) launcher.classList.toggle("hidden", open);
    if (headBtn) {
      /* pinned → a close control; preview-only → a pin/keep-open control */
      headBtn.innerHTML = pinned ? "✕" : "📌";
      headBtn.setAttribute("aria-label", pinned ? "Close navigation" : "Keep navigation open");
      headBtn.setAttribute("title", pinned ? "Close" : "Keep open");
    }
    if (launcher) launcher.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setPinned(v) {
    pinned = !!v; savePinned(pinned);
    if (!pinned) preview = false;
    render();
  }

  function build() {
    injectCSS();
    var cur = currentFile();

    edge = document.createElement("div");
    edge.id = "rlnav-edge";
    if (!hoverCapable) edge.style.display = "none"; /* no hover reveal on touch → no hint */

    launcher = document.createElement("button");
    launcher.id = "rlnav-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-controls", "rlnav");
    launcher.setAttribute("aria-label", "Open navigation");
    launcher.innerHTML = "☰";
    launcher.addEventListener("click", function () { setPinned(!pinned); });

    panel = document.createElement("nav");
    panel.id = "rlnav";
    panel.setAttribute("aria-label", "Research Lab tools");

    var items = [HOME, "sep"].concat(TOOLS);
    var listHTML = "";
    items.forEach(function (t) {
      if (t === "sep") { listHTML += '<div class="rlnav-sep"></div>'; return; }
      var active = (t.file === cur);
      listHTML +=
        '<a class="rlnav-item' + (active ? " active" : "") + '" href="' + esc(t.file) + '"' +
        (active ? ' aria-current="page"' : "") + ' title="' + esc(t.full) + '">' +
        '<span class="rlnav-ico" aria-hidden="true">' + t.icon + "</span>" +
        '<span class="rlnav-tt">' + esc(t.label) + "</span></a>";
    });

    panel.innerHTML =
      '<div class="rlnav-head">' +
      '<a class="rlnav-logo" href="index.html" title="Research Lab — home">' +
      '<span aria-hidden="true">⚡</span><span class="rlnav-word">Research Lab</span></a>' +
      '<button class="rlnav-head-btn" type="button" aria-label="Close navigation" title="Close">✕</button>' +
      "</div>" +
      '<div class="rlnav-list">' + listHTML + "</div>" +
      '<div class="rlnav-foot"><a href="index.html#data-settings">Data &amp; API keys</a><br>Educational models · not investment advice</div>';

    var host = document.body || document.documentElement;
    host.appendChild(edge);
    host.appendChild(panel);
    host.appendChild(launcher);

    headBtn = panel.querySelector(".rlnav-head-btn");
    headBtn.addEventListener("click", function () { setPinned(!pinned); });

    if (hoverCapable) {
      document.addEventListener("mousemove", function (ev) {
        if (pinned) return;
        var x = ev.clientX;
        if (x <= EDGE) { if (!preview) { preview = true; render(); } }
        else if (preview && x > panel.offsetWidth + HIDE_GAP) { preview = false; render(); }
      }, { passive: true });
      document.addEventListener("mouseleave", function () { if (preview && !pinned) { preview = false; render(); } });
      window.addEventListener("blur", function () { if (preview && !pinned) { preview = false; render(); } });
    }

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && (pinned || preview)) setPinned(false);
    });

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();

/* Protocol guard: file:// (or any non-http) origin can't fetch the same-origin
   data/ snapshots, and public CORS proxies reject the null origin — so data
   tools silently hang. Surface an actionable banner instead of a mystery load. */
(function rlProtocolGuard() {
  try {
    if (typeof location === 'undefined' || /^https?:$/.test(location.protocol)) return;
    var show = function () {
      if (typeof document === 'undefined' || !document.body || document.getElementById('rl-proto-warn')) return;
      var b = document.createElement('div');
      b.id = 'rl-proto-warn';
      b.setAttribute('role', 'alert');
      b.style.cssText = 'position:sticky;top:0;z-index:99999;background:#3a2a12;color:#f5b942;border-bottom:1px solid #6a4a1a;padding:8px 14px;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center';
      b.innerHTML = 'Data can\'t load over <b>file://</b> — open this tool over http. '
        + 'Live: <a style="color:#7fd9c9" href="https://pkirsanov.github.io/research-lab/">pkirsanov.github.io/research-lab</a>'
        + ' &nbsp;·&nbsp; or run <code>python3 -m http.server 8000</code> in the repo and use <code>http://localhost:8000/</code>';
      document.body.insertBefore(b, document.body.firstChild);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
  } catch (e) { /* never break a tool over a warning banner */ }
})();

/* Load the shared view-mode switch (rlviews) once on every tool page. rlviews self-gates on the
   rlbrief-enabled meta (and an optional `<meta name="rlviews" content="off">` opt-out), so it stays
   inert on index.html / market-brief and on tools that have opted out pending a spec migration. */
(function loadRlviews() {
  try {
    if (typeof document === "undefined") return;
    if (document.getElementById("rlviews-shared-js")) return;
    var s = document.createElement("script");
    s.id = "rlviews-shared-js";
    s.src = "rlviews.js";
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) { /* never break a tool over the switch loader */ }
})();
