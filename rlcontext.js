(function (factory) {
  "use strict";

  function foundation() {
    if (typeof module === "object" && module && module.exports) {
      return require("./rlexperience.js");
    }
    return typeof globalThis !== "undefined" ? globalThis.RLEXPERIENCE : null;
  }

  var api = Object.freeze(factory(foundation));
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") throw new Error("RLCONTEXT_BROWSER_GLOBAL_UNAVAILABLE");
  globalThis.RLCTX = api;
  if (typeof globalThis.dispatchEvent === "function" && typeof globalThis.CustomEvent === "function") {
    globalThis.dispatchEvent(new globalThis.CustomEvent("rlcontextready"));
  }
})(function (getFoundation) {
  "use strict";

  var CONTEXT_KEYS = [
    "contractVersion", "contextId", "triggerKind", "label", "definition",
    "displayed", "interpretation", "provenance", "uncertainty", "limitation",
    "triggerCondition", "invalidationCondition", "links", "accessibility",
    "contextFingerprint"
  ];
  var DISPLAYED_KEYS = ["valueText", "numericValue", "unit", "truthState"];
  var INTERPRETATION_KEYS = [
    "text", "direction", "comparisonBasis", "window", "thresholdsOrBounds"
  ];
  var PROVENANCE_KEYS = [
    "ownerId", "modelId", "evidenceIdentity", "sourceRefs", "observedAsOf",
    "retrievedOrPublishedAt", "freshness", "dataTier"
  ];
  var UNCERTAINTY_KEYS = ["state", "rangeOrBand", "reason"];
  var LINK_KEYS = ["owner", "citation", "sameDataTable", "ticker"];
  var ACCESSIBILITY_KEYS = ["conciseLabel", "longDescriptionId"];
  var TRIGGER_KINDS = [
    "term", "section", "kpi", "badge", "chart", "axis", "legend",
    "chart-point", "table-header", "table-value", "ticker", "conclusion"
  ];
  var TRUTH_STATES = [
    "current", "partial", "stale", "unavailable", "disputed", "rejected",
    "dependency-pending", "superseded"
  ];
  var DIRECTIONS = [
    "higher-supports", "lower-supports", "bidirectional",
    "threshold-dependent", "not-directional"
  ];
  var CONTROLLER_ID = "rlcontext-disclosure";
  var ANNOUNCER_ID = "rlcontext-announcer";
  var controller = null;
  var contentHost = null;
  var announcer = null;
  var currentTrigger = null;
  var currentContext = null;
  var pinned = false;
  var modal = false;
  var announcedFingerprint = null;

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function foundation() {
    var value = getFoundation();
    if (!value || typeof value.canonicalize !== "function" || typeof value.fingerprint !== "function") {
      throw new Error("RLCONTEXT_EXPERIENCE_FOUNDATION_UNAVAILABLE");
    }
    return value;
  }

  function canonicalize(value) {
    return foundation().canonicalize(value);
  }

  function fingerprint(value) {
    return foundation().fingerprint(value);
  }

  function cloneCanonical(value) {
    return JSON.parse(canonicalize(value));
  }

  function projectError(details) {
    var source = isPlainObject(details) ? details : {};
    return deepFreeze({
      contractVersion: "experience-error/v1",
      code: "E012-CONTEXT-MISSING",
      phase: typeof source.phase === "string" ? source.phase : "context-validation",
      toolId: typeof source.toolId === "string" ? source.toolId : null,
      contractId: "contextual-tooltip/v1",
      reason: typeof source.reason === "string" ? source.reason : "context validation failed",
      fieldPath: typeof source.fieldPath === "string" ? source.fieldPath : "$",
      recoverable: false,
      dependencyGateId: null,
      valueEchoed: false
    });
  }

  function ContextFailure(details) {
    this.details = projectError(details);
  }

  function reject(path, reason, toolId) {
    throw new ContextFailure({ fieldPath: path, reason: reason, toolId: toolId || null });
  }

  function capture(operation) {
    try {
      return deepFreeze({ ok: true, value: deepFreeze(operation()) });
    } catch (error) {
      if (error instanceof ContextFailure) return deepFreeze({ ok: false, error: error.details });
      return deepFreeze({
        ok: false,
        error: projectError({ reason: "validator rejected an unsupported value" })
      });
    }
  }

  function exactKeys(value, expected, path, toolId) {
    if (!isPlainObject(value)) reject(path, "object required", toolId);
    Object.keys(value).forEach(function (key) {
      if (expected.indexOf(key) === -1) reject(path + "." + key, "unknown field", toolId);
    });
    expected.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        reject(path + "." + key, "required field missing", toolId);
      }
    });
  }

  function requireString(value, path, toolId) {
    if (typeof value !== "string" || value.trim().length === 0) {
      reject(path, "non-empty string required", toolId);
    }
  }

  function requireStringArray(value, path, toolId) {
    if (!Array.isArray(value)) reject(path, "string array required", toolId);
    var seen = Object.create(null);
    value.forEach(function (item, index) {
      requireString(item, path + "[" + index + "]", toolId);
      if (seen[item]) reject(path + "[" + index + "]", "duplicate value", toolId);
      seen[item] = true;
    });
  }

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isLabelOnly(context) {
    var interpretation = normalizeText(context.interpretation.text);
    var label = normalizeText(context.label);
    var value = normalizeText(context.displayed.valueText);
    var remainder = interpretation;
    if (label) remainder = remainder.replace(label, " ");
    if (value) remainder = remainder.replace(value, " ");
    remainder = remainder.replace(/\s+/g, " ").trim();
    return !remainder;
  }

  function safeLink(value, kind, path, toolId) {
    if (value === "") return;
    if (typeof value !== "string") reject(path, "link must be a string", toolId);
    if (kind === "sameDataTable") {
      if (!/^#[A-Za-z][A-Za-z0-9:._-]*$/.test(value)) reject(path, "same-data link must be a safe fragment", toolId);
      return;
    }
    if (/^(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+\.html(?:#[A-Za-z0-9/._-]+)?$/.test(value)) return;
    var parsed;
    try { parsed = new URL(value); } catch (error) { reject(path, "link must be HTTPS, a safe relative page, or a safe fragment", toolId); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      reject(path, "link must be credential-free HTTPS", toolId);
    }
    if (kind === "ticker" && parsed.hostname !== "finance.yahoo.com") {
      reject(path, "ticker link must use the Yahoo Finance owner", toolId);
    }
  }

  function validateContextInternal(context) {
    var toolId = isPlainObject(context) && isPlainObject(context.provenance)
      ? context.provenance.ownerId
      : null;
    exactKeys(context, CONTEXT_KEYS, "$", toolId);
    if (context.contractVersion !== "contextual-tooltip/v1") {
      reject("$.contractVersion", "unsupported context contract version", toolId);
    }
    ["contextId", "label", "definition", "limitation", "triggerCondition", "invalidationCondition"]
      .forEach(function (key) { requireString(context[key], "$." + key, toolId); });
    if (TRIGGER_KINDS.indexOf(context.triggerKind) === -1) {
      reject("$.triggerKind", "unknown trigger kind", toolId);
    }

    exactKeys(context.displayed, DISPLAYED_KEYS, "$.displayed", toolId);
    requireString(context.displayed.valueText, "$.displayed.valueText", toolId);
    requireString(context.displayed.unit, "$.displayed.unit", toolId);
    if (TRUTH_STATES.indexOf(context.displayed.truthState) === -1) {
      reject("$.displayed.truthState", "unknown truth state", toolId);
    }
    if (context.displayed.numericValue !== null && !Number.isFinite(context.displayed.numericValue)) {
      reject("$.displayed.numericValue", "numeric value must be finite or null", toolId);
    }
    if (context.displayed.truthState === "unavailable" && context.displayed.numericValue !== null) {
      reject("$.displayed.numericValue", "unavailable values must remain null", toolId);
    }

    exactKeys(context.interpretation, INTERPRETATION_KEYS, "$.interpretation", toolId);
    ["text", "comparisonBasis", "window"].forEach(function (key) {
      requireString(context.interpretation[key], "$.interpretation." + key, toolId);
    });
    if (DIRECTIONS.indexOf(context.interpretation.direction) === -1) {
      reject("$.interpretation.direction", "unsupported interpretation direction", toolId);
    }
    requireStringArray(context.interpretation.thresholdsOrBounds, "$.interpretation.thresholdsOrBounds", toolId);
    if (isLabelOnly(context)) reject("$.interpretation.text", "interpretation repeats only the label and value", toolId);

    exactKeys(context.provenance, PROVENANCE_KEYS, "$.provenance", toolId);
    [
      "ownerId", "modelId", "evidenceIdentity", "observedAsOf",
      "retrievedOrPublishedAt", "freshness", "dataTier"
    ].forEach(function (key) { requireString(context.provenance[key], "$.provenance." + key, toolId); });
    requireStringArray(context.provenance.sourceRefs, "$.provenance.sourceRefs", toolId);

    exactKeys(context.uncertainty, UNCERTAINTY_KEYS, "$.uncertainty", toolId);
    ["state", "rangeOrBand", "reason"].forEach(function (key) {
      requireString(context.uncertainty[key], "$.uncertainty." + key, toolId);
    });

    exactKeys(context.links, LINK_KEYS, "$.links", toolId);
    LINK_KEYS.forEach(function (key) { safeLink(context.links[key], key, "$.links." + key, toolId); });

    exactKeys(context.accessibility, ACCESSIBILITY_KEYS, "$.accessibility", toolId);
    requireString(context.accessibility.conciseLabel, "$.accessibility.conciseLabel", toolId);
    requireString(context.accessibility.longDescriptionId, "$.accessibility.longDescriptionId", toolId);
    if (!/^[A-Za-z][A-Za-z0-9:._-]*$/.test(context.accessibility.longDescriptionId)) {
      reject("$.accessibility.longDescriptionId", "description ID is not safe", toolId);
    }

    if (context.contextFingerprint !== null && typeof context.contextFingerprint !== "string") {
      reject("$.contextFingerprint", "fingerprint must be null or canonical SHA-256", toolId);
    }
    var fingerprintInput = cloneCanonical(context);
    fingerprintInput.contextFingerprint = null;
    var computed = fingerprint(fingerprintInput);
    if (context.contextFingerprint !== null && context.contextFingerprint !== computed) {
      reject("$.contextFingerprint", "context fingerprint mismatch", toolId);
    }
    var projected = cloneCanonical(context);
    projected.contextFingerprint = computed;
    return projected;
  }

  function hasDOM() {
    return typeof document !== "undefined" && document && typeof document.createElement === "function";
  }

  function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];
      if (value === null || value === undefined || value === false) element.removeAttribute(name);
      else element.setAttribute(name, value === true ? "" : String(value));
    });
  }

  function appendText(parent, tagName, label, value, className) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (label) {
      var strong = document.createElement("strong");
      strong.textContent = label + ": ";
      element.appendChild(strong);
    }
    element.appendChild(document.createTextNode(value));
    parent.appendChild(element);
    return element;
  }

  function injectControllerCSS() {
    if (!hasDOM() || document.getElementById("rlcontext-css")) return;
    var style = document.createElement("style");
    style.id = "rlcontext-css";
    style.textContent =
      "#" + CONTROLLER_ID + "{position:fixed;z-index:11000;width:min(390px,calc(100vw - 24px));max-height:min(620px,calc(100vh - 24px));overflow:auto;background:var(--panel,#0e1620);border:1px solid var(--bd,#2f4457);border-radius:8px;padding:14px;color:var(--text,#e6edf3);box-shadow:0 18px 46px rgba(0,0,0,.48);font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;opacity:1;transform:none;transition:opacity .12s ease,transform .12s ease}" +
      "#" + CONTROLLER_ID + "[hidden]{display:none}" +
      "#" + CONTROLLER_ID + "[data-layout=popover][data-state=open]{animation:rlcontext-in .12s ease-out}" +
      "#" + CONTROLLER_ID + "[data-layout=sheet]{inset:auto 0 0 0;width:100%;max-width:none;max-height:min(78vh,680px);border-radius:8px 8px 0 0;border-left:0;border-right:0;border-bottom:0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));animation:rlcontext-sheet-in .16s ease-out}" +
      "body.rlcontext-open #rl-data-shell{pointer-events:none}" +
      "#" + CONTROLLER_ID + " h2{margin:0 36px 6px 0;font-size:16px;line-height:1.3;letter-spacing:0}" +
      "#" + CONTROLLER_ID + " p{margin:6px 0}" +
      "#" + CONTROLLER_ID + " .rlcontext-definition{color:var(--mut,#aebdca)}" +
      "#" + CONTROLLER_ID + " .rlcontext-current{padding:8px 10px;border-left:3px solid var(--teal,#2dd4bf);background:rgba(45,212,191,.08)}" +
      "#" + CONTROLLER_ID + " .rlcontext-detail{color:var(--mut,#aebdca)}" +
      "#" + CONTROLLER_ID + " .rlcontext-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--bd,#2f4457)}" +
      "#" + CONTROLLER_ID + " .rlcontext-links a{color:var(--teal,#2dd4bf)}" +
      "#" + CONTROLLER_ID + " [data-rlcontext-close]{position:absolute;top:8px;right:8px;width:32px;height:32px;border:1px solid var(--bd,#2f4457);border-radius:6px;background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer}" +
      ".rlcontext-trigger{cursor:help}" +
      ".rlcontext-trigger[aria-invalid=true]{outline:2px solid #dc2626;outline-offset:2px}" +
      ".rlcontext-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}" +
      "@keyframes rlcontext-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}" +
      "@keyframes rlcontext-sheet-in{from{opacity:0}to{opacity:1}}" +
      "@media(prefers-reduced-motion:reduce){#" + CONTROLLER_ID + "{transition:none!important;animation:none!important}}";
    (document.head || document.documentElement).appendChild(style);
  }

  function createController() {
    if (!hasDOM()) return null;
    var existing = document.getElementById(CONTROLLER_ID);
    if (existing) {
      controller = existing;
      contentHost = existing.querySelector("[data-rlcontext-content]");
      announcer = document.getElementById(ANNOUNCER_ID);
      return controller;
    }
    injectControllerCSS();
    controller = document.createElement("section");
    controller.id = CONTROLLER_ID;
    controller.hidden = true;
    controller.tabIndex = -1;
    setAttributes(controller, {
      "aria-hidden": "true",
      "data-layout": "popover",
      "data-pinned": "false",
      "data-state": "closed",
      role: "tooltip"
    });
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.setAttribute("data-rlcontext-close", "");
    closeButton.setAttribute("aria-label", "Close context");
    closeButton.textContent = "\u00d7";
    closeButton.addEventListener("click", function () { close({ returnFocus: true }); });
    controller.appendChild(closeButton);
    contentHost = document.createElement("div");
    contentHost.setAttribute("data-rlcontext-content", "");
    controller.appendChild(contentHost);
    (document.body || document.documentElement).appendChild(controller);

    announcer = document.createElement("div");
    announcer.id = ANNOUNCER_ID;
    announcer.className = "rlcontext-sr";
    setAttributes(announcer, { "aria-atomic": "true", "aria-live": "polite", role: "status" });
    (document.body || document.documentElement).appendChild(announcer);
    return controller;
  }

  function linkLabel(kind) {
    return {
      owner: "Open owner",
      citation: "Open citation",
      sameDataTable: "Same-data table",
      ticker: "Open public quote"
    }[kind];
  }

  function focusFragment(href) {
    if (!hasDOM() || typeof href !== "string" || href.charAt(0) !== "#") return false;
    var target = document.getElementById(href.slice(1));
    if (!target) return false;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: false });
    return true;
  }

  function appendLinks(parent, links) {
    var host = document.createElement("div");
    host.className = "rlcontext-links";
    LINK_KEYS.forEach(function (kind) {
      var href = links[kind];
      if (!href) return;
      var anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = linkLabel(kind);
      anchor.setAttribute("data-rlcontext-link", kind);
      if (href.charAt(0) !== "#") {
        anchor.target = "_blank";
        anchor.rel = "noopener";
      } else {
        anchor.addEventListener("click", function (event) {
          event.preventDefault();
          focusFragment(href);
        });
      }
      host.appendChild(anchor);
    });
    if (host.childNodes.length) parent.appendChild(host);
  }

  function renderContext(context) {
    contentHost.textContent = "";
    contentHost.id = context.accessibility.longDescriptionId;
    var heading = document.createElement("h2");
    heading.id = context.accessibility.longDescriptionId + "-heading";
    heading.textContent = context.label;
    contentHost.appendChild(heading);
    appendText(contentHost, "p", "", context.definition, "rlcontext-definition");
    appendText(contentHost, "p", "Current value", context.displayed.valueText + " " + context.displayed.unit + " (" + context.displayed.truthState + ")", "rlcontext-current");
    appendText(contentHost, "p", "Current interpretation", context.interpretation.text, "rlcontext-current");
    appendText(contentHost, "p", "Basis", context.interpretation.comparisonBasis, "rlcontext-detail");
    appendText(contentHost, "p", "Window", context.interpretation.window, "rlcontext-detail");
    if (context.interpretation.thresholdsOrBounds.length) {
      appendText(contentHost, "p", "Thresholds / bounds", context.interpretation.thresholdsOrBounds.join("; "), "rlcontext-detail");
    }
    appendText(contentHost, "p", "Source", context.provenance.sourceRefs.join("; ") + " (" + context.provenance.ownerId + ")", "rlcontext-detail");
    appendText(contentHost, "p", "As of", context.provenance.observedAsOf + "; " + context.provenance.freshness, "rlcontext-detail");
    appendText(contentHost, "p", "Uncertainty", context.uncertainty.state + ": " + context.uncertainty.rangeOrBand + ". " + context.uncertainty.reason, "rlcontext-detail");
    appendText(contentHost, "p", "Limitation", context.limitation, "rlcontext-detail");
    appendText(contentHost, "p", "Trigger", context.triggerCondition, "rlcontext-detail");
    appendText(contentHost, "p", "Invalidation", context.invalidationCondition, "rlcontext-detail");
    appendLinks(contentHost, context.links);
    setAttributes(controller, {
      "aria-describedby": contentHost.id,
      "aria-labelledby": heading.id,
      "data-context-fingerprint": context.contextFingerprint,
      "data-context-id": context.contextId,
      "data-contract": context.contractVersion
    });
  }

  function renderLegacy(html) {
    contentHost.textContent = "";
    contentHost.id = "rlcontext-legacy-description";
    var textProbe = document.createElement("div");
    textProbe.innerHTML = typeof html === "string" ? html : "";
    appendText(contentHost, "h2", "", "Legacy chart context", "");
    appendText(contentHost, "p", "", textProbe.textContent || "Legacy chart context unavailable.", "rlcontext-detail");
    setAttributes(controller, {
      "aria-describedby": contentHost.id,
      "aria-labelledby": null,
      "data-context-fingerprint": "legacy-compatibility",
      "data-context-id": "legacy-compatibility",
      "data-contract": "legacy-compatibility"
    });
  }

  function isMobileLayout() {
    if (!hasDOM()) return false;
    if (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 640px)").matches) return true;
    return Number(window.innerWidth) <= 640;
  }

  function positionController(trigger, pointer) {
    if (!controller || modal) return;
    var viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    var viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    var triggerRect = trigger && trigger.getBoundingClientRect ? trigger.getBoundingClientRect() : { left: 12, right: 12, top: 12, bottom: 12 };
    var disclosureRect = controller.getBoundingClientRect();
    var pad = 12;
    var anchorX = pointer && Number.isFinite(pointer.clientX) ? pointer.clientX : triggerRect.right;
    var anchorY = pointer && Number.isFinite(pointer.clientY) ? pointer.clientY : triggerRect.bottom;
    var left = anchorX + pad;
    var top = anchorY + pad;
    if (left + disclosureRect.width > viewportWidth - 8) left = Math.max(8, anchorX - pad - disclosureRect.width);
    if (top + disclosureRect.height > viewportHeight - 8) top = Math.max(8, triggerRect.top - pad - disclosureRect.height);
    if (top < 8 || (top < triggerRect.bottom && top + disclosureRect.height > triggerRect.top)) {
      top = Math.min(viewportHeight - disclosureRect.height - 8, triggerRect.bottom + pad);
    }
    controller.style.left = Math.max(8, left) + "px";
    controller.style.top = Math.max(8, top) + "px";
    controller.style.right = "auto";
    controller.style.bottom = "auto";
  }

  function announce(context, mode) {
    if (!announcer || mode === "hover" || !context || announcedFingerprint === context.contextFingerprint) return;
    announcedFingerprint = context.contextFingerprint;
    announcer.textContent = "";
    window.setTimeout(function () { announcer.textContent = context.accessibility.conciseLabel + ". " + context.interpretation.text; }, 0);
  }

  function configureLayout(trigger, mode) {
    modal = isMobileLayout();
    setAttributes(controller, {
      "aria-modal": modal ? "true" : null,
      "data-layout": modal ? "sheet" : "popover",
      role: modal ? "dialog" : "tooltip"
    });
    if (modal && (mode === "touch" || mode === "click" || mode === "keyboard")) {
      var closeButton = controller.querySelector("[data-rlcontext-close]");
      if (closeButton) closeButton.focus({ preventScroll: true });
    }
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  function openValidated(trigger, context, options) {
    if (!createController()) return capture(function () { reject("$", "document required for disclosure", context.provenance.ownerId); });
    options = options || {};
    if (currentTrigger && currentTrigger !== trigger) currentTrigger.setAttribute("aria-expanded", "false");
    currentTrigger = trigger || null;
    currentContext = context;
    pinned = Boolean(options.pinned);
    controller.hidden = false;
    document.body.classList.add("rlcontext-open");
    setAttributes(controller, {
      "aria-hidden": "false",
      "data-pinned": pinned ? "true" : "false",
      "data-state": "open"
    });
    renderContext(context);
    configureLayout(trigger, options.mode || "programmatic");
    positionController(trigger, options.pointer || null);
    announce(context, options.mode || "programmatic");
    return deepFreeze({ ok: true, value: context });
  }

  function open(trigger, context, options) {
    var validation = capture(function () { return validateContextInternal(context); });
    if (!validation.ok) {
      if (trigger && trigger.setAttribute) {
        trigger.setAttribute("aria-invalid", "true");
        trigger.setAttribute("data-rlcontext-error", validation.error.code);
      }
      return validation;
    }
    if (trigger && trigger.removeAttribute) {
      trigger.removeAttribute("aria-invalid");
      trigger.removeAttribute("data-rlcontext-error");
    }
    return openValidated(trigger, validation.value, options);
  }

  function openLegacy(trigger, html, options) {
    if (!createController()) return false;
    options = options || {};
    currentTrigger = trigger || null;
    currentContext = null;
    pinned = Boolean(options.pinned);
    controller.hidden = false;
    document.body.classList.add("rlcontext-open");
    setAttributes(controller, {
      "aria-hidden": "false",
      "data-pinned": pinned ? "true" : "false",
      "data-state": "open"
    });
    renderLegacy(html);
    configureLayout(trigger, options.mode || "legacy");
    positionController(trigger, options.pointer || null);
    return true;
  }

  function close(options) {
    options = options || {};
    if (!controller || controller.hidden) return;
    var trigger = currentTrigger;
    controller.hidden = true;
    document.body.classList.remove("rlcontext-open");
    setAttributes(controller, {
      "aria-hidden": "true",
      "data-pinned": "false",
      "data-state": "closed"
    });
    if (trigger && trigger.setAttribute) trigger.setAttribute("aria-expanded", "false");
    pinned = false;
    modal = false;
    currentContext = null;
    currentTrigger = null;
    if (options.returnFocus && trigger && trigger.isConnected && typeof trigger.focus === "function") {
      trigger.__rlcontextReturningFocus = true;
      trigger.focus({ preventScroll: true });
    }
  }

  function bind(trigger, context, options) {
    options = options || {};
    var validation = capture(function () { return validateContextInternal(context); });
    if (!trigger || typeof trigger.addEventListener !== "function") {
      return validation.ok ? deepFreeze({ ok: false, error: projectError({ reason: "interactive trigger required", fieldPath: "$.trigger" }) }) : validation;
    }
    if (!validation.ok) {
      trigger.setAttribute("aria-invalid", "true");
      trigger.setAttribute("data-rlcontext-error", validation.error.code);
      return validation;
    }
    trigger.__rlcontextValue = validation.value;
    trigger.__rlcontextOptions = options;
    trigger.classList.add("rlcontext-trigger");
    setAttributes(trigger, {
      "aria-controls": CONTROLLER_ID,
      "aria-describedby": validation.value.accessibility.longDescriptionId,
      "aria-expanded": "false",
      "data-rlcontext-fingerprint": validation.value.contextFingerprint,
      "data-rlcontext-id": validation.value.contextId
    });
    trigger.removeAttribute("aria-invalid");
    trigger.removeAttribute("data-rlcontext-error");
    if (!/^(?:A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(trigger.tagName || "") && !trigger.hasAttribute("tabindex")) {
      trigger.tabIndex = 0;
    }
    if (trigger.__rlcontextWired) return deepFreeze({ ok: true, value: validation.value });
    trigger.__rlcontextWired = true;
    function ownsEvent(event) {
      if (!event || event.target === trigger || !event.target.closest) return true;
      return event.target.closest(".rlcontext-trigger") === trigger;
    }
    trigger.addEventListener("mouseenter", function (event) {
      if (!pinned) openValidated(trigger, trigger.__rlcontextValue, { mode: "hover", pointer: event, pinned: false });
    });
    trigger.addEventListener("mousemove", function (event) {
      if (!pinned && currentTrigger === trigger) positionController(trigger, event);
    });
    trigger.addEventListener("mouseleave", function () {
      if (!pinned && currentTrigger === trigger) close({ returnFocus: false });
    });
    trigger.addEventListener("focus", function () {
      if (trigger.__rlcontextReturningFocus) {
        trigger.__rlcontextReturningFocus = false;
        return;
      }
      if (!pinned) openValidated(trigger, trigger.__rlcontextValue, { mode: "focus", pinned: false });
    });
    trigger.addEventListener("blur", function () {
      window.setTimeout(function () {
        if (!pinned && controller && !controller.contains(document.activeElement)) close({ returnFocus: false });
      }, 0);
    });
    trigger.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "touch" || !ownsEvent(event)) return;
      trigger.__rlcontextTouchOpened = true;
      openValidated(trigger, trigger.__rlcontextValue, { mode: "touch", pointer: event, pinned: true });
    });
    trigger.addEventListener("click", function (event) {
      if (!ownsEvent(event)) return;
      if (trigger.__rlcontextTouchOpened) {
        trigger.__rlcontextTouchOpened = false;
        return;
      }
      if (options.clickOpens === false) return;
      var samePinnedTrigger = pinned && currentTrigger === trigger;
      if (samePinnedTrigger) close({ returnFocus: false });
      else openValidated(trigger, trigger.__rlcontextValue, { mode: "click", pointer: event, pinned: true });
    });
    trigger.addEventListener("keydown", function (event) {
      if (!ownsEvent(event)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close({ returnFocus: true });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openValidated(trigger, trigger.__rlcontextValue, { mode: "keyboard", pinned: true });
      }
    });
    return deepFreeze({ ok: true, value: validation.value });
  }

  function documentPointerDown(event) {
    if (!controller || controller.hidden || !pinned) return;
    if (controller.contains(event.target) || (currentTrigger && currentTrigger.contains && currentTrigger.contains(event.target))) return;
    close({ returnFocus: false });
  }

  function documentKeyDown(event) {
    if (!controller || controller.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close({ returnFocus: true });
      return;
    }
    if (event.key !== "Tab" || !modal) return;
    var focusable = controller.querySelectorAll("button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])");
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (hasDOM()) {
    document.addEventListener("pointerdown", documentPointerDown, true);
    document.addEventListener("keydown", documentKeyDown, true);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", createController);
    else createController();
  }

  return {
    ANNOUNCER_ID: ANNOUNCER_ID,
    CONTROLLER_ID: CONTROLLER_ID,
    bind: bind,
    canonicalize: canonicalize,
    close: close,
    createController: createController,
    fingerprint: fingerprint,
    open: open,
    openLegacy: openLegacy,
    projectError: projectError,
    validateContext: function (context) {
      return capture(function () { return validateContextInternal(context); });
    }
  };
});