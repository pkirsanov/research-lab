/* Shared registry-driven four-view shell for Research Lab tools. */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : {};
  if (typeof document === "undefined" || root.__rlviewsInit) return;
  var registration = root.__rlviewsRegistration;
  if (!registration || !registration.shell || !root.RLEXPERIENCE) return;
  root.__rlviewsInit = 1;

  var SHELL = registration.shell;
  var EXPERIENCE = root.RLEXPERIENCE;
  var CONFIG = registration.config;
  var DEPENDENCY_STATES = registration.dependencyStates || {};
  var ANCHOR = registration.anchor;
  var MODES = SHELL.viewIds.slice();
  var TOOL = SHELL.toolId;
  /* When the page owns its route, location.hash belongs to the page. The shell reads
     its stored mode instead and writes no history entry. */
  var OWNS_ROUTE = registration.ownsRoute === true;
  var ownerModes = Array.isArray(registration.ownerModes) ? registration.ownerModes.slice() : [];
  /* An owns-route page renders every view itself, so no mode may focus the shell over it. */
  if (OWNS_ROUTE) ownerModes = MODES.slice();
  var labels = {};
  var current = SHELL.defaultViewId;
  var panels = {};
  var shellControl;
  var drivingLegacy = false;

  for (var labelIndex = 0; labelIndex < MODES.length; labelIndex += 1) {
    labels[MODES[labelIndex]] = SHELL.labels[labelIndex];
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character];
    });
  }

  function injectCss() {
    if (document.getElementById("rlviews-css")) return;
    var style = document.createElement("style");
    style.id = "rlviews-css";
    style.textContent = [
      "html,body{max-width:100%;overflow-x:clip}",
      "#rlviews{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9995;display:inline-flex;align-items:stretch;gap:2px;padding:3px;max-width:calc(100vw - 20px);border:1px solid #24313f;border-radius:8px;background:rgba(14,20,28,.94);box-shadow:0 6px 20px -8px rgba(0,0,0,.7);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);font:600 13px/1 ui-rounded,'Avenir Next','Segoe UI',sans-serif}",
      "body{padding-top:54px}",
      "#rlviews button{appearance:none;-webkit-appearance:none;flex:0 0 auto;width:auto;min-height:32px;padding:6px 14px;border:1px solid transparent;border-radius:6px;background:transparent;color:#9fb2c4;cursor:pointer;font:inherit;letter-spacing:0;white-space:nowrap;transition:color .14s,background .14s,border-color .14s}",
      "#rlviews button:hover{color:#e6edf3;background:#152230}",
      "#rlviews button:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px}",
      "#rlviews button[aria-selected='true']{color:#04121a;background:#2dd4bf;font-weight:700}",
      "body.rlv-focused>*:not(#rlviews):not(#rlnav):not(#rlnav-launcher):not(#rlnav-edge):not(#rl-proto-warn):not(#rl-data-shell):not([data-rlexperience-panel]):not(script):not(style):not(link){display:none!important}",
      "[data-rlexperience-panel][hidden]{display:none!important}",
      "[data-rlexperience-panel]{display:block;max-width:860px;margin:64px auto 40px;padding:18px;color:inherit}",
      "[data-rlexperience-panel].rlexperience-placeholder{border:1px solid #263646;border-radius:8px;background:#101821}",
      ".rlexperience-placeholder h2{margin:0 0 8px;font-size:18px}.rlexperience-placeholder p{margin:6px 0;color:#9fb2c4}",
      "[data-rlexperience-gate]{padding:12px 14px;border-left:3px solid #f5b942;background:rgba(245,185,66,.08)}",
      "[data-rlexperience-gate] h2{margin:0 0 8px;font-size:17px}[data-rlexperience-gate] p{margin:5px 0}",
      OWNS_ROUTE ? "" : "#modeSeg,#simpleTab,#powerTab{display:none!important}",
      "@media(max-width:560px){#rlviews{top:auto;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));left:8px;transform:none;max-width:none;overflow-x:auto;overscroll-behavior-inline:contain}#rlviews button{min-height:44px;padding:8px 12px}body{padding-top:0;padding-bottom:calc(68px + env(safe-area-inset-bottom))}}",
      "@media(prefers-reduced-motion:reduce){#rlviews button{transition:none}}"
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  }

  function driveLegacy(mode) {
    /* An owns-route page drives its own control; synthesising clicks here would
       persist a mode the reader never chose. */
    if (OWNS_ROUTE) return;
    if (drivingLegacy || (mode !== "simple" && mode !== "power")) return;
    var button = null;
    var legacyControl = document.getElementById("modeSeg");
    if (legacyControl) {
      button = legacyControl.querySelector('[data-mode="' + mode + '"],[data-m="' + mode + '"],[data-value="' + mode + '"]');
      if (!button) {
        var candidates = legacyControl.querySelectorAll("button");
        for (var index = 0; index < candidates.length; index += 1) {
          if ((candidates[index].textContent || "").trim().toLowerCase() === mode) {
            button = candidates[index];
            break;
          }
        }
      }
    }
    if (!button) button = document.getElementById(mode + "Tab");
    if (!button || typeof button.click !== "function") return;
    drivingLegacy = true;
    try { button.click(); } catch (error) { }
    drivingLegacy = false;
  }

  function suppressLegacyControls() {
    /* A page that owns its route also owns its view control; suppressing it would
       leave the reader no way to switch views at all. */
    if (OWNS_ROUTE) return;
    function suppress() {
      var controls = [
        document.getElementById("modeSeg"),
        document.getElementById("simpleTab"),
        document.getElementById("powerTab")
      ].filter(Boolean);
      for (var index = 0; index < controls.length; index += 1) {
        if (controls[index].getAttribute("aria-hidden") !== "true") {
          controls[index].setAttribute("aria-hidden", "true");
        }
        if (controls[index].tabIndex !== -1) controls[index].tabIndex = -1;
      }
    }
    suppress();
    if (!root.MutationObserver) return;
    var observer = new root.MutationObserver(suppress);
    var legacyRoot = document.getElementById("modeSeg");
    if (legacyRoot) observer.observe(legacyRoot, { attributes: true, attributeFilter: ["aria-hidden", "tabindex"], subtree: true });
  }

  /* Capability slugs are engineering nouns. A reader needs to know what is missing from the
     view in front of them, not the slug, the gate code or the acceptance predicate. */
  var CAPABILITY_LABEL = {
    "dynamic-tool-brief-v2": "the live tool brief",
    "live-web-evidence": "live web evidence",
    "public-alert-publication": "published alerts",
    "private-portfolio-overlay": "your own portfolio overlay",
    "portfolio-stress-journey": "the portfolio stress journey"
  };

  function capabilityPhrase(slugs) {
    var labels = (slugs || []).map(function (slug) { return CAPABILITY_LABEL[slug] || slug; });
    if (!labels.length) return "";
    if (labels.length === 1) return labels[0];
    return labels.slice(0, -1).join(", ") + " and " + labels[labels.length - 1];
  }

  function dependencyMarkup(gateKey) {
    var result = EXPERIENCE.projectDependencyGate(CONFIG, gateKey, DEPENDENCY_STATES);
    if (!result.ok) return "";
    var gate = result.value;
    /* A satisfied dependency is not news. It used to render a "Dependency available" heading
       followed by a Withheld: list, an acceptance predicate and a gate code — governance
       bookkeeping shown to a reader who never asked for it. The full projection remains
       available to Power as an evidence disclosure, which is where provenance belongs. */
    if (gate.state === "available") return "";
    var phrase = capabilityPhrase(gate.withheldCapabilities);
    return '<p data-rlexperience-gate="' + escapeHtml(gate.gateId) + '" data-rlexperience-gate-state="pending">'
      + 'Not in this view yet' + (phrase ? ': ' + escapeHtml(phrase) : '') + '.'
      + '</p>';
  }

  /* rlviews is loaded dynamically, AFTER RLAPP exists, so the mount is a direct call rather than an
     event. Deferred one tick so every panel is in the document before the runtime queries for the
     anchor, and re-entrant-safe because RLAPP.boot() already made one (inert) attempt. */
  function mountJourneyWhenReady() {
    if (!root.RLAPP || typeof root.RLAPP.mountJourney !== "function") return;
    root.setTimeout(function () {
      try { root.RLAPP.mountJourney(); } catch (error) { /* a journey failure must never break the shell */ }
    }, 0);
  }

  function buildPanels() {
    for (var index = 0; index < MODES.length; index += 1) {
      var mode = MODES[index];
      var panel = document.createElement("section");
      panel.className = "rlexperience-placeholder";
      if (mode === "brief" && ANCHOR) {
        panel.appendChild(ANCHOR);
        if (SHELL.kind === "ordinary") panel.insertAdjacentHTML("beforeend", dependencyMarkup("FEATURE002"));
      } else if (mode === "journey") {
        // The 48 designed journeys shipped with no way in: this panel used to be a literal
        // placeholder and no page carried the [data-rljourney-mount] anchor the runtime looks for,
        // so RLAPP's boot hook was inert everywhere. The anchor lives here now, and the panel drives
        // the SAME production mount path the journey suites exercise.
        panel.innerHTML = '<h2>Journey</h2><p>Choose a tool goal to begin a guided research workflow. Progress is stored only in this browser.</p>'
          + '<div data-rljourney-mount data-rljourney-state="pending"></div>';
        mountJourneyWhenReady();
      } else if (mode === "portfolio") {
        panel.innerHTML = '<h2>Portfolio</h2><p>Public watchlist research remains available without implying holdings.</p>' + dependencyMarkup("FEATURE008");
      } else if (mode === "red-alert") {
        panel.innerHTML = '<h2>Red Alert</h2><p>No current evidence-qualified alert is published by this shell foundation.</p>';
      }
      panel.setAttribute("data-rlexperience-panel", mode);
      panel.hidden = true;
      panels[mode] = panel;
      (document.body || document.documentElement).appendChild(panel);
    }
  }

  function applyVisual(mode) {
    current = mode;
    document.body.classList.toggle("power", mode === "power");
    document.body.classList.toggle("rlv-brief", mode === "brief");
    document.body.classList.toggle("rlv-focused", ownerModes.indexOf(mode) === -1);
    document.body.setAttribute("data-rlview", mode);
    Object.keys(panels).forEach(function (panelMode) {
      var ownerPlaceholder = ownerModes.indexOf(panelMode) !== -1 && panelMode !== "brief";
      panels[panelMode].hidden = panelMode !== mode || ownerPlaceholder;
    });
    if (!shellControl) return;
    var tabs = shellControl.querySelectorAll("button[data-rlview-mode]");
    for (var index = 0; index < tabs.length; index += 1) {
      var selected = tabs[index].getAttribute("data-rlview-mode") === mode;
      tabs[index].setAttribute("aria-selected", selected ? "true" : "false");
      tabs[index].tabIndex = selected ? 0 : -1;
    }
  }

  function persistMode(mode) {
    try {
      var record = EXPERIENCE.createModeRecord(SHELL, mode, new Date().toISOString());
      if (record.ok) localStorage.setItem(SHELL.routingPolicy.localModeKey, JSON.stringify(record.value));
    } catch (error) { }
  }

  function apply(mode, source) {
    var previous = current;
    applyVisual(mode);
    driveLegacy(mode);
    if (source !== "boot" && source !== "popstate") persistMode(mode);
    try {
      root.dispatchEvent(new CustomEvent("rlviews:change", {
        detail: { mode: mode, previousMode: previous, baseMode: mode, toolId: TOOL }
      }));
    } catch (error) { }
  }

  function readModeRecord() {
    try {
      var raw = localStorage.getItem(SHELL.routingPolicy.localModeKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) { return null; }
  }

  function resolveCurrentRoute(includeLocalRecord) {
    var options = { publicTargetIds: [] };
    if (includeLocalRecord) options.localModeRecord = readModeRecord();
    var routeHash = OWNS_ROUTE ? "" : location.hash;
    if (!OWNS_ROUTE && SHELL.kind === "ordinary" && MODES.indexOf(String(routeHash || "").replace(/^#/, "").split("/")[0]) === -1) {
      try {
        var legacyMode = new URLSearchParams(location.search).get("mode");
        if (legacyMode === "simple" || legacyMode === "power") routeHash = "#" + legacyMode;
      } catch (error) { }
    }
    var result = EXPERIENCE.resolveRoute(SHELL, routeHash, options);
    return result.ok ? result.value : null;
  }

  function selectMode(mode, source) {
    if (mode === current && source !== "popstate") return;
    if (source !== "popstate") {
      var transition = EXPERIENCE.transitionRoute(SHELL, {
        contractVersion: "experience-route/v1",
        mode: current,
        targetId: null,
        canonicalHash: "#" + current,
        source: "current",
        historyAction: "none",
        focusPolicy: "preserve",
        recovery: null,
        noFetch: true
      }, { type: "select", mode: mode, savedAt: new Date().toISOString() });
      if (!transition.ok) return;
      if (!OWNS_ROUTE && transition.value.historyAction === "push") {
        history.pushState({ contractVersion: "experience-history/v1", toolId: TOOL, mode: mode }, "", transition.value.route.canonicalHash);
      }
    }
    apply(mode, source);
  }

  function buildControl() {
    shellControl = document.createElement("div");
    shellControl.id = "rlviews";
    shellControl.setAttribute("role", "tablist");
    shellControl.setAttribute("aria-label", "View mode");
    shellControl.setAttribute("data-rlexperience-shell", "ready");
    shellControl.setAttribute("data-rlexperience-canary", "shadow-safe");
    shellControl.innerHTML = MODES.map(function (mode) {
      return '<button type="button" role="tab" data-rlview-mode="' + escapeHtml(mode) + '" aria-selected="false" title="Switch to ' + escapeHtml(labels[mode]) + '">' + escapeHtml(labels[mode]) + '</button>';
    }).join("");
    (document.body || document.documentElement).appendChild(shellControl);

    shellControl.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button[data-rlview-mode]") : null;
      if (button) selectMode(button.getAttribute("data-rlview-mode"), "pointer");
    });
    shellControl.addEventListener("keydown", function (event) {
      if (["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].indexOf(event.key) === -1) return;
      var index = MODES.indexOf(current);
      if (index === -1) return;
      var next = index;
      if (event.key === "ArrowRight") next = (index + 1) % MODES.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + MODES.length) % MODES.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = MODES.length - 1;
      selectMode(MODES[next], "keyboard");
      var target = shellControl.querySelector('button[data-rlview-mode="' + MODES[next] + '"]');
      if (target && target.focus) target.focus();
      event.preventDefault();
    });
  }

  function build() {
    injectCss();
    buildPanels();
    buildControl();
    suppressLegacyControls();
    var route = resolveCurrentRoute(true);
    var initialMode = route ? route.mode : SHELL.defaultViewId;
    if (!OWNS_ROUTE && route && route.historyAction === "replace") {
      history.replaceState({ contractVersion: "experience-history/v1", toolId: TOOL, mode: initialMode }, "", route.canonicalHash);
    }
    apply(initialMode, "boot");
    root.addEventListener("popstate", function () {
      if (OWNS_ROUTE) return;
      var restored = resolveCurrentRoute(false);
      if (!restored) return;
      if (restored.historyAction === "replace") {
        history.replaceState({ contractVersion: "experience-history/v1", toolId: TOOL, mode: restored.mode }, "", restored.canonicalHash);
      }
      selectMode(restored.mode, "popstate");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();