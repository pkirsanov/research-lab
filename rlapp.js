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
    if (!api || typeof api.providerAccess !== "function" || typeof api.setKey !== "function" || typeof api.setProxyBaseUrl !== "function" || typeof api.clearAllProviderConfig !== "function") return null;
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
    if (STATIC_PAGES[currentFile()]) return { tone: "local", label: currentFile() === "index.html" ? "Provider access" : "Local model", detail: currentFile() === "index.html" ? "proxy + local-key tiers" : "no live data required" };
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
  function tierLabel(access) {
    if (access.proxyReachable === null) return "checking proxy…";
    if (access.tier === "proxy") return "Tier 1 · tailnet proxy (reachable)";
    if (access.proxyBaseUrl) return "Tier 2 · local keys (proxy unreachable)";
    return "Tier 2 · local keys (no proxy set)";
  }
  function renderProviderRows(access) {
    return access.providers.map(function (p) {
      var stateClass = p.state === "proxy" ? "on" : (p.state === "configured" ? "set" : "");
      var stateText = p.state === "proxy" ? "via proxy" : (p.state === "configured" ? "local key set" : "not set");
      return '<div class="settings-provider">' +
        '<span><b>' + esc(p.label) + '</b><small>' + esc(p.note) + ' · <a href="' + esc(p.enrollmentUrl) + '" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">provider site</a></small></span>' +
        '<span class="settings-key"><input type="password" autocomplete="off" placeholder="local key (this browser only)" data-provider-key="' + esc(p.providerId) + '"><button type="button" class="settings-savekey" data-provider="' + esc(p.providerId) + '">Save</button>' + (p.localConfigured ? '<button type="button" class="settings-clearkey" data-provider="' + esc(p.providerId) + '">Clear</button>' : '') + '</span>' +
        '<em data-provider-status="' + esc(p.providerId) + '" class="' + stateClass + '">' + esc(stateText) + '</em></div>';
    }).join("");
  }
  function wireSettings(host, api, paint) {
    var message = host.querySelector(".settings-message");
    function msg(text) { if (message) message.textContent = text; }
    host.querySelector(".settings-saveproxy").addEventListener("click", function () {
      var input = host.querySelector("[data-proxy-url]");
      api.setProxyBaseUrl(input ? input.value : "");
      msg("Proxy URL saved; rechecking…");
      api.recheckProxy().then(paint);
    });
    host.querySelector(".settings-recheck").addEventListener("click", function () {
      msg("Rechecking proxy…"); api.recheckProxy().then(paint);
    });
    var force = host.querySelector("[data-force-local]");
    if (force) force.addEventListener("change", function (event) { api.setForceLocal(!!event.target.checked); paint(); });
    Array.prototype.forEach.call(host.querySelectorAll(".settings-savekey"), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-provider"), input = host.querySelector('[data-provider-key="' + id + '"]');
        var result = api.setKey(id, input ? input.value : "");
        msg(result.ok ? (id + " key saved (stored only in this browser).") : (id + " key rejected: " + (result.reasonCode || "error")));
        if (result.ok) paint();
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll(".settings-clearkey"), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-provider"); api.clearKey(id); msg(id + " local key cleared."); paint();
      });
    });
    host.querySelector(".settings-clear").addEventListener("click", function () {
      api.clearAllProviderConfig(); msg("All local keys and the proxy URL were cleared from this browser."); paint();
    });
  }
  function mountSettings(host) {
    if (!host || host.getAttribute("data-mounted") === "1") return;
    var api = credentialApi();
    host.setAttribute("data-mounted", "1");
    if (!api) {
      host.innerHTML = '<div class="settings-head"><div><h2>Provider access</h2><p>Provider settings are unavailable because the shared data layer did not load.</p></div></div>';
      return;
    }
    function paint() {
      var access = api.providerAccess();
      host.innerHTML =
        '<div class="settings-head"><div><h2>Provider access</h2><p>Two tiers: a tailnet <b>proxy</b> (keys held on your server, never in the browser) with automatic fallback to <b>local keys</b> stored only in this browser.</p></div><span class="settings-privacy" data-tier>' + esc(tierLabel(access)) + '</span></div>' +
        '<div class="settings-proxy"><label>Tailnet proxy URL <input type="url" inputmode="url" autocomplete="off" placeholder="https://host.tailnet.ts.net:PORT" data-proxy-url value="' + esc(access.proxyBaseUrl) + '"></label><button type="button" class="settings-saveproxy">Save proxy</button><button type="button" class="settings-recheck">Recheck</button><label class="settings-forcelocal"><input type="checkbox" data-force-local' + (access.forceLocal ? " checked" : "") + '> force local keys</label></div>' +
        '<div class="settings-grid">' + renderProviderRows(access) + '</div>' +
        '<div class="settings-actions"><button type="button" class="settings-clear">Clear all keys + proxy</button><span class="settings-message" role="status"></span></div>';
      wireSettings(host, api, paint);
    }
    paint();
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
  function fetchRequiredJson(path) {
    if (typeof fetch !== "function") return Promise.resolve(null);
    return fetch(path, { cache: "no-store" }).then(function (res) {
      return res && res.ok ? res.text() : null;
    }).then(function (text) {
      if (!text) return null;
      try { return JSON.parse(text); } catch (e) { return null; }
    }).catch(function () { return null; });
  }
  function ensureSharedScript(id, src, ready) {
    return new Promise(function (resolve) {
      if (ready()) return resolve(true);
      var existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
      var script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.addEventListener("load", function () { resolve(ready()); });
      script.addEventListener("error", function () { resolve(false); });
      (document.head || document.documentElement).appendChild(script);
    });
  }
  function markExperienceUnavailable(anchor, message) {
    if (!anchor) return;
    anchor.setAttribute("data-rlexperience-state", "unavailable");
    anchor.setAttribute("data-rlexperience-error", message);
  }
  function fetchDependencyStates(config) {
    var gates = config && config.dependencyGates;
    if (!gates || typeof gates !== "object") return Promise.resolve(null);
    var keys = Object.keys(gates);
    return Promise.all(keys.map(function (key) {
      return fetchRequiredJson(gates[key].statePath).then(function (state) {
        return { key: key, state: state };
      });
    })).then(function (rows) {
      var states = {};
      for (var i = 0; i < rows.length; i++) states[rows[i].key] = rows[i].state;
      return states;
    });
  }
  function mountExperienceShell() {
    var anchors = document.querySelectorAll ? document.querySelectorAll("[data-rlbrief-mount][data-tool-id]") : [];
    if (anchors.length !== 1) return Promise.resolve(false);
    var anchor = anchors[0];
    return Promise.all([
      fetchRegistry(),
      fetchRequiredJson("tool-experience.config.json"),
      ensureSharedScript("rlexperience-shared-js", "rlexperience.js", function () {
        return !!(root.RLEXPERIENCE && typeof root.RLEXPERIENCE.resolveShell === "function");
      })
    ]).then(function (values) {
      var registry = values[0];
      var config = values[1];
      if (!registry || !config || values[2] !== true) {
        markExperienceUnavailable(anchor, "experience-bootstrap-unavailable");
        return false;
      }
      var toolId = anchor.getAttribute("data-tool-id");
      var resolved = root.RLEXPERIENCE.resolveShell(config, registry, toolId);
      if (!resolved.ok) {
        markExperienceUnavailable(anchor, resolved.error.code);
        return false;
      }
      return fetchDependencyStates(config).then(function (dependencyStates) {
        if (!dependencyStates) {
          markExperienceUnavailable(anchor, "dependency-state-unavailable");
          return false;
        }
        root.__rlviewsRegistration = {
          shell: resolved.value,
          config: config,
          registry: registry,
          dependencyStates: dependencyStates,
          anchor: anchor,
          ownerModes: resolved.value.kind === "ordinary" ? ["simple", "power"] : ["brief"]
        };
        anchor.setAttribute("data-rlexperience-state", "registered");
        return ensureSharedScript("rlviews-shared-js", "rlviews.js", function () {
          return !!root.__rlviewsInit;
        });
      });
    }).catch(function () {
      markExperienceUnavailable(anchor, "experience-bootstrap-failed");
      return false;
    });
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
    mountExperienceShell();
  }

  root.RLAPP = { report: report, autoRefresh: autoRefresh, renderStatus: renderStatus, mountBriefs: mountBriefs, mountExperienceShell: mountExperienceShell };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
