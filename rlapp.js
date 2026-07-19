/* Research Lab shared application shell.
  - Current production providers expose status only; browser credential collection is disabled.
   - Every page gets one compact data-status control.
   - RLDATA lifecycle events are aggregated without duplicating model fetch logic. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : {};
  if (root.__rlappInit) return; root.__rlappInit = 1;
  if (typeof document === "undefined") return;

  var STATIC_PAGES = {
    "index.html": 1,
    "strategy-self-improvement-lab.html": 1,
    "smart-money-flow-lab.html": 1,
    "waterfront-polo-lab.html": 1
  };
  var localResources = {}, shell, shellButton, shellPanel, shellSummary, shellDetail;

  function currentFile() {
    var value = (location.pathname || "").split("/").pop();
    return value || "index.html";
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char];
    });
  }
  function credentialApi() {
    var api = root.RLDATA;
    if (!api || typeof api.providerPolicies !== "function" || typeof api.credentialStatus !== "function" || typeof api.clearAllCredentials !== "function") return null;
    return api;
  }
  function ageText(at) {
    if (!at) return "age unknown";
    var age = Math.max(0, Date.now() - at), minutes = Math.round(age / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";
    var hours = Math.round(minutes / 60); return hours < 48 ? hours + "h ago" : Math.round(hours / 24) + "d ago";
  }
  function allResources() {
    var shared = root.RLDATA && typeof root.RLDATA.dataState === "function" ? root.RLDATA.dataState().resources : [];
    var own = Object.keys(localResources).map(function (key) { return localResources[key]; });
    var byId = {};
    shared.concat(own).forEach(function (row) { if (row && row.resource) byId[row.resource] = row; });
    return Object.keys(byId).map(function (key) { return byId[key]; });
  }
  function statusView() {
    var rows = allResources(), refreshing = rows.filter(function (row) { return row.state === "refreshing"; });
    var failures = rows.filter(function (row) { return row.state === "error" || row.state === "missing"; });
    var stale = rows.filter(function (row) { return row.state === "stale"; });
    var ready = rows.filter(function (row) { return row.state === "ready" || row.state === "fresh"; });
    var latest = 0; ready.concat(stale).forEach(function (row) { latest = Math.max(latest, Number(row.at) || 0); });
    if (refreshing.length) return { tone: "loading", label: "Refreshing " + refreshing.length + " data " + (refreshing.length === 1 ? "set" : "sets"), detail: ready.length + " ready" + (stale.length ? " · " + stale.length + " cached" : "") };
    if (failures.length && !ready.length && !stale.length) return { tone: "bad", label: "Data unavailable", detail: failures.length + " request" + (failures.length === 1 ? "" : "s") + " failed" };
    if (failures.length) return { tone: "warn", label: "Partial data", detail: ready.length + " fresh · " + failures.length + " unavailable" };
    if (stale.length) return { tone: "warn", label: "Cached data in use", detail: ready.length + " fresh · " + stale.length + " stale" };
    if (ready.length) return { tone: "ok", label: "Data ready", detail: ready.length + " source" + (ready.length === 1 ? "" : "s") + " · " + ageText(latest) };
    if (STATIC_PAGES[currentFile()]) return { tone: "local", label: currentFile() === "index.html" ? "Provider status" : "Local model", detail: currentFile() === "index.html" ? "browser credential use disabled" : "no live data required" };
    return { tone: "local", label: "Data on demand", detail: "waiting for this page's first request" };
  }
  function renderStatus() {
    if (!shell) return;
    var view = statusView(), rows = allResources();
    shell.className = "rl-data-shell " + view.tone;
    shellSummary.textContent = view.label;
    shellDetail.textContent = view.detail;
    var list = shellPanel.querySelector(".rl-data-list");
    list.innerHTML = rows.length ? rows.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).slice(0, 18).map(function (row) {
      var state = row.state === "ready" ? "fresh" : row.state;
      return '<div class="rl-data-row"><span class="rl-data-state ' + esc(state) + '"></span><span>' + esc(row.label || row.resource) + '</span><small>' + esc(state) + (row.at ? " · " + ageText(row.at) : "") + '</small></div>';
    }).join("") : '<div class="rl-data-empty">This page has not requested remote data.</div>';
  }
  function report(resource, state, detail) {
    if (root.RLDATA && typeof root.RLDATA.reportData === "function") root.RLDATA.reportData(resource, state, detail || {});
    else {
      localResources[resource] = Object.assign({ resource: resource, state: state || "idle", at: Date.now() }, detail || {});
      renderStatus();
    }
  }
  function autoRefresh(resources, options) {
    options = options || {}; resources = Array.isArray(resources) ? resources : [];
    if (!root.RLDATA || typeof root.RLDATA.ensureBars !== "function") return Promise.resolve([]);
    var tasks = resources.map(function (item) {
      item = typeof item === "string" ? { symbol: item } : item;
      return root.RLDATA.ensureBars(item.symbol, item.interval || "1d", item.maxAgeH == null ? (options.maxAgeH == null ? 6 : options.maxAgeH) : item.maxAgeH, item.range || options.range);
    });
    return Promise.all(tasks).then(function (rows) { if (typeof options.onReady === "function") options.onReady(rows); return rows; });
  }
  function injectCSS() {
    if (document.getElementById("rlapp-css")) return;
    var style = document.createElement("style"); style.id = "rlapp-css";
    style.textContent = [
      ".rl-data-shell,.rl-data-shell *{box-sizing:border-box}",
      "body.rlapp-status{padding-bottom:64px!important}",
      ".rl-data-shell{position:fixed;right:14px;bottom:14px;z-index:9988;width:min(310px,calc(100vw - 28px));font:12px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#dce7f0}",
      ".rl-data-trigger{width:100%;display:flex;align-items:center;gap:8px;border:1px solid #263646;border-radius:9px;background:rgba(14,20,28,.94);color:inherit;padding:8px 10px;box-shadow:0 9px 28px -14px #000;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
      ".rl-data-dot{width:8px;height:8px;border-radius:50%;background:#8aa0b3;flex:0 0 auto}.rl-data-shell.ok .rl-data-dot{background:#39d98a}.rl-data-shell.warn .rl-data-dot{background:#f5b942}.rl-data-shell.bad .rl-data-dot{background:#f0556b}.rl-data-shell.loading .rl-data-dot{background:#5aa9f0;animation:rl-data-pulse 1s infinite}",
      ".rl-data-summary{font-weight:700}.rl-data-detail{margin-left:auto;color:#8aa0b3;font-size:11px;text-align:right}",
      ".rl-data-panel{display:none;margin-top:6px;border:1px solid #263646;border-radius:9px;background:#101821;padding:9px;box-shadow:0 12px 34px -16px #000;max-height:54vh;overflow:auto}.rl-data-shell.open .rl-data-panel{display:block}",
      ".rl-data-head{display:flex;justify-content:space-between;gap:10px;padding:2px 2px 8px;color:#8aa0b3}.rl-data-head a{color:#67d7c6;text-decoration:none;font-weight:650}",
      ".rl-data-row{display:grid;grid-template-columns:8px 1fr auto;align-items:center;gap:7px;padding:5px 2px;border-top:1px solid #1d2a36}.rl-data-row small{color:#71869a}.rl-data-state{width:6px;height:6px;border-radius:50%;background:#8aa0b3}.rl-data-state.fresh{background:#39d98a}.rl-data-state.stale{background:#f5b942}.rl-data-state.error,.rl-data-state.missing{background:#f0556b}.rl-data-state.refreshing{background:#5aa9f0}",
      ".rl-data-empty{padding:8px 2px;color:#71869a}",
      "@keyframes rl-data-pulse{50%{opacity:.35}}",
      "@media(max-width:640px){.rl-data-shell{right:8px;bottom:8px;width:auto;max-width:calc(100% - 16px)}.rl-data-shell.open{width:calc(100% - 16px)}.rl-data-trigger{min-width:126px}.rl-data-detail{display:none}.rl-data-shell.open .rl-data-detail{display:block;max-width:48%}}",
      "@media(prefers-reduced-motion:reduce){.rl-data-shell.loading .rl-data-dot{animation:none}}"
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  }
  function buildStatus() {
    if (document.getElementById("rl-data-shell")) return;
    injectCSS(); if (document.body) document.body.classList.add("rlapp-status"); shell = document.createElement("aside"); shell.id = "rl-data-shell";
    shell.innerHTML = '<button class="rl-data-trigger" type="button" aria-expanded="false" title="Show the data sources and freshness behind this page"><span class="rl-data-dot"></span><span class="rl-data-summary"></span><span class="rl-data-detail"></span></button><div class="rl-data-panel"><div class="rl-data-head"><span>Data behind this page</span><a href="index.html#data-settings">Provider status</a></div><div class="rl-data-list"></div></div>';
    (document.body || document.documentElement).appendChild(shell);
    shellButton = shell.querySelector(".rl-data-trigger"); shellPanel = shell.querySelector(".rl-data-panel"); shellSummary = shell.querySelector(".rl-data-summary"); shellDetail = shell.querySelector(".rl-data-detail");
    shellButton.addEventListener("click", function () { var open = shell.classList.toggle("open"); shellButton.setAttribute("aria-expanded", open ? "true" : "false"); });
    renderStatus();
  }
  function mountSettings(host) {
    if (!host || host.getAttribute("data-mounted") === "1") return;
    var api = credentialApi();
    host.setAttribute("data-mounted", "1");
    if (!api) {
      host.innerHTML = '<div class="settings-head"><div><h2>Provider access</h2><p>Provider status is unavailable because the central data owner did not load.</p></div></div>';
      return;
    }
    var providers = api.providerPolicies();
    host.innerHTML = '<div class="settings-head"><div><h2>Provider access</h2><p>Browser credential use is disabled until one document owns a fully authorized collection and request path.</p></div><span class="settings-privacy">Current-document memory only</span></div><div class="settings-grid">' + providers.map(function (provider) {
      return '<div class="settings-provider"><span><b>' + esc(provider.label) + '</b><small>' + esc(provider.note) + ' · <a href="' + esc(provider.enrollmentUrl) + '" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">provider site</a></small></span><em data-provider-status="' + esc(provider.providerId) + '">' + esc(provider.state) + ' · ' + esc(provider.reasonCode) + '</em></div>';
    }).join("") + '</div><div class="settings-actions"><button type="button" class="settings-clear">Clear current document</button><span class="settings-message" role="status"></span></div>';
    var message = host.querySelector(".settings-message");
    host.querySelector(".settings-clear").addEventListener("click", function () {
      var result = api.clearAllCredentials();
      updateCredentialStatuses(host, providers, api);
      message.textContent = result.ok ? "Current-document credential references cleared." : "Current-document clear failed.";
    });
  }
  function updateCredentialStatuses(host, providers, api) {
    providers.forEach(function (provider) {
      var status = host.querySelector('[data-provider-status="' + provider.providerId + '"]'), current = api.credentialStatus(provider.providerId);
      if (!status) return;
      status.className = current.state === "configured" ? "set" : ""; status.textContent = current.state + (current.reasonCode ? " · " + current.reasonCode : "");
    });
  }
  /* ── Feature 002 Scope 10: narrow shared-brief mount bootstrap ──
     Detects the single declarative `data-rlbrief-mount` anchor, validates its tool-id against the
     registry, loads rlbrief.js once, and calls RLBRIEF.BriefMount. It performs NO page-ID/tool-ID
     switch, no page restyle, and never mutates the host Simple/Power state or owner controls. */
  function briefFindEntry(registry, id) {
    var arr = Array.isArray(registry) ? registry : (registry && (registry.tools || registry.registry)) || [];
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id === id) return arr[i];
    return null;
  }
  function markBriefUnavailable(anchor, message) {
    if (!anchor || anchor.getAttribute("data-rlbrief-ready") === "1") return;
    anchor.setAttribute("data-rlbrief-ready", "1");
    anchor.setAttribute("data-rlbrief-state", "integrity-error");
    var p = document.createElement("p");
    p.setAttribute("data-rlbrief-part", "unavailable");
    p.textContent = message;
    anchor.appendChild(p);
  }
  function fetchRegistry() {
    if (typeof fetch !== "function") return Promise.resolve(null);
    return fetch("tools.json", { cache: "no-store" }).then(function (res) {
      return res && res.ok ? res.text() : null;
    }).then(function (text) {
      if (!text) return null; try { return JSON.parse(text); } catch (e) { return null; }
    }).catch(function () { return null; });
  }
  function ensureBriefRenderer() {
    return new Promise(function (resolve) {
      if (root.RLBRIEF && typeof root.RLBRIEF.BriefMount === "function") return resolve(root.RLBRIEF);
      var existing = document.getElementById("rlbrief-shared-js");
      if (existing) { existing.addEventListener("load", function () { resolve(root.RLBRIEF || null); }); existing.addEventListener("error", function () { resolve(null); }); return; }
      var s = document.createElement("script");
      s.id = "rlbrief-shared-js"; s.src = "rlbrief.js";
      s.addEventListener("load", function () { resolve(root.RLBRIEF || null); });
      s.addEventListener("error", function () { resolve(null); });
      (document.head || document.documentElement).appendChild(s);
    });
  }
  /* The shared brief activates only after the atomic cutover publishes briefs/ and enables it via
     `<meta name="rlbrief-enabled">` (or window.RLBRIEF_ENABLED). Pre-cutover the mount stays inert
     and makes ZERO network requests, so no page shows a failed pointer fetch. */
  function briefsEnabled() {
    try {
      if (root.RLBRIEF_ENABLED === true) return true;
      var meta = document.querySelector && document.querySelector('meta[name="rlbrief-enabled"]');
      var content = meta && meta.getAttribute("content");
      return !!(content && content !== "0" && content !== "false");
    } catch (e) { return false; }
  }
  function markBriefIdle(anchor) {
    if (!anchor || anchor.getAttribute("data-rlbrief-ready") === "1") return;
    anchor.setAttribute("data-rlbrief-ready", "1");
    anchor.setAttribute("data-rlbrief-state", "idle");
  }
  function mountBriefs() {
    var anchors = document.querySelectorAll ? document.querySelectorAll("[data-rlbrief-mount]") : [];
    if (!anchors.length) return;
    if (!briefsEnabled()) { for (var k = 0; k < anchors.length; k++) markBriefIdle(anchors[k]); return; }
    fetchRegistry().then(function (registry) {
      ensureBriefRenderer().then(function (RB) {
        if (!RB || typeof RB.BriefMount !== "function") {
          for (var j = 0; j < anchors.length; j++) markBriefUnavailable(anchors[j], "Shared brief renderer is unavailable.");
          return;
        }
        for (var i = 0; i < anchors.length; i++) {
          (function (anchor) {
            var toolId = anchor.getAttribute("data-tool-id");
            if (registry && !briefFindEntry(registry, toolId)) { markBriefUnavailable(anchor, "Shared brief mount references an unknown registry tool: " + esc(toolId)); return; }
            try { RB.BriefMount(anchor, { registry: registry }); }
            catch (e) { markBriefUnavailable(anchor, "Shared brief mount failed to initialize."); }
          })(anchors[i]);
        }
      });
    });
  }
  function boot() {
    buildStatus(); mountSettings(document.getElementById("data-settings"));
    root.addEventListener("rl:data-status", renderStatus);
    setTimeout(renderStatus, 0);
    mountBriefs();
  }

  root.RLAPP = { report: report, autoRefresh: autoRefresh, renderStatus: renderStatus, mountBriefs: mountBriefs };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
