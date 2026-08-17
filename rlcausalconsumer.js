/* RLCausalConsumer — read-only causal context for owner tools.
   Browser/Node safe. Produces versioned rotation-timing reads and renders causal context as a
   STRING, so an owner page never has to reimplement either and the canaries can assert the exact
   rendered output in Node without a DOM.

   This module deliberately owns NO market logic. It never reads, derives, or influences an owner
   verdict; it only formats what rlcausal already decided. */
(function () {
  "use strict";

  var root = typeof globalThis !== "undefined" ? globalThis : this;

  var TIMING_CONTRACT = "rotation-timing/v1";
  var MARKET_STATES = ["emerging", "confirming", "established", "weakening", "invalidated", "unavailable"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function isIso(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  /* A timing read is the owner tool's OWN statement about market confirmation. It carries its own
     freshness so a stale read degrades to "unavailable" in rlcausal rather than silently counting. */
  function buildTimingRead(input) {
    input = input || {};
    var errors = [];
    if (typeof input.exposureId !== "string" || !input.exposureId) errors.push("exposureId is required");
    if (typeof input.ownerToolId !== "string" || !input.ownerToolId) errors.push("ownerToolId is required");
    if (!isIso(input.asOf)) errors.push("asOf must be an ISO timestamp");
    if (!isIso(input.freshUntil)) errors.push("freshUntil must be an ISO timestamp");
    if (MARKET_STATES.indexOf(input.marketState) < 0) errors.push("marketState must be one of " + MARKET_STATES.join("/"));
    if (!Array.isArray(input.limitations)) errors.push("limitations array is required");
    if (errors.length) return deepFreeze({ ok: false, errors: errors });
    return deepFreeze({
      ok: true,
      value: {
        contractVersion: TIMING_CONTRACT,
        exposureId: input.exposureId,
        ownerToolId: input.ownerToolId,
        asOf: input.asOf,
        freshUntil: input.freshUntil,
        marketState: input.marketState,
        deepLink: typeof input.deepLink === "string" ? input.deepLink : "",
        limitations: input.limitations.slice()
      }
    });
  }

  /* The owner lab is only linked once it is a registered, shipped page. Deriving the href from the
     registry means an unregistered lab renders as plain text instead of a link the deployed site
     would 404 on, and it starts linking automatically the moment the lab is registered. */
  function labHref(registry, toolId) {
    var id = toolId || "causal-rotation-lab";
    var tools = registry && Array.isArray(registry.tools) ? registry.tools : [];
    for (var i = 0; i < tools.length; i++) {
      if (tools[i] && tools[i].id === id) return tools[i].file || (id + ".html");
    }
    return null;
  }

  /* Wraps rlcausal's read so every unavailable path carries a reason instead of an empty panel. */
  function contextFor(snapshot, exposureId, causal) {
    var api = causal || root.RLCausal;
    if (!api || typeof api.readForExposure !== "function") {
      return deepFreeze({ exposureId: exposureId, available: false, code: "CR-EVALUATOR-UNAVAILABLE", reason: "the causal evaluator is not loaded" });
    }
    var read = api.readForExposure(snapshot, exposureId);
    if (!read || read.available !== true) {
      return deepFreeze({
        exposureId: exposureId,
        available: false,
        code: read && read.code || "CR-TIMING-UNAVAILABLE",
        reason: read && read.reason || "no causal read for exposure"
      });
    }
    return deepFreeze({
      exposureId: exposureId,
      available: true,
      candidateId: read.candidateId,
      stage: read.stage,
      causeStatus: read.causeStatus,
      evidenceAsOf: read.evidenceAsOf,
      contradictionCount: read.contradictionCount,
      confirmation: read.confirmation || [],
      invalidation: read.invalidation || [],
      limitations: read.limitations || [],
      deepLink: read.deepLink || ""
    });
  }

  function conditionText(items) {
    if (!items || !items.length) return "none recorded";
    return items.map(function (item) { return item && item.description || String(item); }).join(" · ");
  }

  /* Pure: returns the panel HTML. Owner markup is never touched, and nothing here can reach an
     owner metric, so a rendering change cannot move a verdict. */
  function renderContextHtml(contexts, options) {
    options = options || {};
    var href = typeof options.labHref === "string" && options.labHref ? options.labHref : null;
    var rows = (contexts || []).map(function (context) {
      if (!context.available) {
        return '<div class="rlcausal-row" data-causal-exposure="' + esc(context.exposureId) + '" data-causal-state="unavailable">'
          + '<div class="rlcausal-exposure">' + esc(context.exposureId) + '</div>'
          + '<div class="rlcausal-verdict" data-causal-cause="unverified">cause unverified</div>'
          + '<div class="rlcausal-why">' + esc(context.code) + ' — ' + esc(context.reason) + '</div>'
          + '</div>';
      }
      var link = href
        ? '<a class="rlcausal-link" data-causal-deeplink href="' + esc(href + "#candidate=" + encodeURIComponent(context.candidateId)) + '">open the causal read</a>'
        : '<span class="rlcausal-link" data-causal-deeplink-unpublished>causal read ' + esc(context.candidateId) + ' (owner lab not published yet)</span>';
      return '<div class="rlcausal-row" data-causal-exposure="' + esc(context.exposureId) + '" data-causal-state="available">'
        + '<div class="rlcausal-exposure">' + esc(context.exposureId) + '</div>'
        + '<div class="rlcausal-verdict" data-causal-stage="' + esc(context.stage) + '">' + esc(context.stage)
        + ' · cause ' + esc(context.causeStatus) + '</div>'
        + '<div class="rlcausal-meta" data-causal-contradictions="' + esc(context.contradictionCount) + '">'
        + 'evidence as of ' + esc(String(context.evidenceAsOf || "unavailable").slice(0, 10))
        + ' · ' + esc(context.contradictionCount) + ' contradiction(s)</div>'
        + '<div class="rlcausal-meta" data-causal-confirmation>confirms when: ' + esc(conditionText(context.confirmation)) + '</div>'
        + '<div class="rlcausal-meta" data-causal-invalidation>wrong if: ' + esc(conditionText(context.invalidation)) + '</div>'
        + (context.limitations.length ? '<div class="rlcausal-meta" data-causal-limitations>limits: ' + esc(context.limitations.join(" · ")) + '</div>' : "")
        + '<div class="rlcausal-meta">' + link + '</div>'
        + '</div>';
    }).join("");
    return '<div class="rlcausal-context" data-causal-context>'
      + '<p class="rlcausal-note">Causal context is separate research. It does not enter this tool\'s '
      + 'model, ranking, or verdict, and it is not advice.</p>'
      + (rows || '<div class="rlcausal-row" data-causal-state="unavailable"><div class="rlcausal-why">No exposure on this page maps to a causal candidate.</div></div>')
      + '</div>';
  }

  function injectCss(documentRef) {
    var doc = documentRef || (typeof document !== "undefined" ? document : null);
    if (!doc || doc.getElementById("rlcausal-consumer-css")) return;
    var style = doc.createElement("style");
    style.id = "rlcausal-consumer-css";
    style.textContent = [
      ".rlcausal-panel{border:1px solid rgba(127,127,127,.35);border-radius:10px;padding:14px 16px;margin:0 0 14px}",
      ".rlcausal-heading{font-size:15px;font-weight:600;margin:0 0 8px}",
      ".rlcausal-sub{font-size:12px;font-weight:400;opacity:.75}",
      ".rlcausal-context{display:flex;flex-direction:column;gap:8px}",
      ".rlcausal-note{margin:0 0 4px;font-size:11.5px;opacity:.75}",
      ".rlcausal-row{border:1px solid rgba(127,127,127,.35);border-radius:8px;padding:8px 10px;font-size:12.5px}",
      ".rlcausal-exposure{font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;opacity:.75}",
      ".rlcausal-verdict{margin-top:2px;font-size:13.5px}",
      ".rlcausal-meta{margin-top:3px;opacity:.85}",
      ".rlcausal-why{margin-top:3px;opacity:.85}",
      ".rlcausal-link:focus-visible{outline:2px solid currentColor;outline-offset:2px}"
    ].join("");
    doc.head.appendChild(style);
  }

  /* Owner pages publish their timing reads here from inside their own closure, and mount() reads
     them back, so a page never has to leak an owner value onto a global. */
  var publishedTimingReads = Object.create(null);

  function publishTimingReads(ownerToolId, reads) {
    if (typeof ownerToolId !== "string" || !ownerToolId) return [];
    publishedTimingReads[ownerToolId] = (Array.isArray(reads) ? reads : []).slice();
    return publishedTimingReads[ownerToolId];
  }

  function timingReads(ownerToolId) {
    if (ownerToolId) return (publishedTimingReads[ownerToolId] || []).slice();
    return Object.keys(publishedTimingReads).reduce(function (all, key) {
      return all.concat(publishedTimingReads[key]);
    }, []);
  }

  /* Loads the committed causal sources and evaluates them with the OWNER's timing reads. Every
     resource reports separately so a partial failure is visible rather than silently empty. */
  function loadSnapshot(options) {
    options = options || {};
    var report = typeof options.report === "function" ? options.report : function () { };
    var fetchImpl = options.fetch || (typeof fetch === "function" ? fetch : null);
    var causal = options.causal || root.RLCausal;
    if (!fetchImpl || !causal) return Promise.resolve({ ok: false, code: "CR-EVALUATOR-UNAVAILABLE" });

    function grab(path, resource, label) {
      report(resource, "refreshing", { label: label });
      return fetchImpl(path, { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("http " + response.status);
        return response.text();
      }).then(function (text) {
        report(resource, "ready", { label: label });
        return text;
      }).catch(function () {
        report(resource, "unavailable", { label: label });
        return null;
      });
    }

    return Promise.all([
      grab("causal-rotation.config.json", "causal-config", "Causal config"),
      grab("causal-rotation-observations.json", "causal-observations", "Causal observations"),
      grab("tools.json", "causal-registry", "Tool registry")
    ]).then(function (parts) {
      var config = null, observationSet = null, registry = null;
      try { config = parts[0] ? JSON.parse(parts[0]) : null; } catch (error) { config = null; }
      try { observationSet = parts[1] ? JSON.parse(parts[1]) : null; } catch (error) { observationSet = null; }
      try { registry = parts[2] ? JSON.parse(parts[2]) : null; } catch (error) { registry = null; }
      if (!config || !observationSet) return { ok: false, code: "CR-SCHEMA-INVALID", registry: registry };
      var asOf = options.asOf || observationSet.recordedAt || new Date().toISOString();
      var reads = Array.isArray(options.timingReads) && options.timingReads.length
        ? options.timingReads
        : timingReads(options.ownerToolId);
      var snapshot = causal.evaluateAll({
        config: config,
        observationSet: observationSet,
        timingReads: reads,
        posture: options.posture || "discovery",
        riskOverlay: "none",
        asOf: asOf,
        generatedAt: asOf
      });
      return { ok: true, snapshot: snapshot, registry: registry, config: config };
    });
  }

  /* Renders read-only context into a host element. Returns the contexts so a caller can assert
     them without scraping the DOM. */
  function mount(options) {
    options = options || {};
    var doc = options.document || (typeof document !== "undefined" ? document : null);
    var host = typeof options.host === "string" ? (doc && doc.getElementById(options.host)) : options.host;
    if (!host) return Promise.resolve([]);
    injectCss(doc);
    return loadSnapshot(options).then(function (loaded) {
      var exposureIds = options.exposureIds || [];
      var contexts;
      if (!loaded.ok) {
        contexts = exposureIds.map(function (exposureId) {
          return { exposureId: exposureId, available: false, code: loaded.code, reason: "causal sources did not load" };
        });
      } else {
        contexts = exposureIds.map(function (exposureId) { return contextFor(loaded.snapshot, exposureId, options.causal); });
      }
      host.innerHTML = renderContextHtml(contexts, { labHref: labHref(loaded.registry) });
      host.setAttribute("data-causal-mounted", "1");
      return contexts;
    });
  }

  root.RLCausalConsumer = Object.freeze({
    TIMING_CONTRACT: TIMING_CONTRACT,
    MARKET_STATES: MARKET_STATES.slice(),
    buildTimingRead: buildTimingRead,
    publishTimingReads: publishTimingReads,
    timingReads: timingReads,
    labHref: labHref,
    contextFor: contextFor,
    renderContextHtml: renderContextHtml,
    injectCss: injectCss,
    loadSnapshot: loadSnapshot,
    mount: mount
  });

  if (typeof module === "object" && module && module.exports) module.exports = root.RLCausalConsumer;
})();
