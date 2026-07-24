/* ═══════════ RLTKR — shared ticker → Yahoo Finance link + RLCTX disclosure decorator ═══════════
   Loaded by every Research Lab page. NON-NEGOTIABLE house standard: every ticker anywhere
   (cards, tables, prose, chart labels/legends) is a link to finance.yahoo.com with a rich
   tooltip (company name + kind). Two paths:
     • RLTKR.tag(ticker[, {label,name,kind}]) → an <a class="rltkr"> string for renderers.
     • auto scan() upgrades elements marked `.tkr` / `[data-tkr]`, and — inside any container
       marked `[data-tkr-auto]` — every KNOWN-map ticker token (word-bounded, no false links).
  The ticker link remains navigation. A separate context control delegates disclosure to RLCTX.
   Safe on file://, GitHub Pages, and Node (no-DOM guard). Educational only — not advice. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : {});

  /* ── company map (watchlist + indexes + 11 GICS sector SPDRs + megacaps/semis). Extend freely. ── */
  var NAMES = {
    "SPY": ["SPDR S&P 500 ETF", "Index ETF"], "QQQ": ["Invesco Nasdaq-100 ETF", "Index ETF"],
    "RSP": ["Invesco S&P 500 Equal Weight ETF", "Index ETF"], "IWM": ["iShares Russell 2000 ETF", "Index ETF"],
    "DIA": ["SPDR Dow Jones Industrial Average ETF", "Index ETF"], "MDY": ["SPDR S&P MidCap 400 ETF", "Index ETF"],
    "VGT": ["Vanguard Information Technology ETF", "Sector ETF"], "SPMO": ["Invesco S&P 500 Momentum ETF", "Factor ETF"],
    "MTUM": ["iShares MSCI USA Momentum Factor ETF", "Factor ETF"], "SMH": ["VanEck Semiconductor ETF", "Industry ETF"],
    "IGV": ["iShares Expanded Tech-Software ETF", "Industry ETF"], "MAGS": ["Roundhill Magnificent Seven ETF", "Thematic ETF"],
    "XLK": ["Technology Select Sector SPDR", "Sector ETF"], "XLC": ["Communication Services Select Sector SPDR", "Sector ETF"],
    "XLY": ["Consumer Discretionary Select Sector SPDR", "Sector ETF"], "XLP": ["Consumer Staples Select Sector SPDR", "Sector ETF"],
    "XLE": ["Energy Select Sector SPDR", "Sector ETF"], "XLF": ["Financial Select Sector SPDR", "Sector ETF"],
    "XLV": ["Health Care Select Sector SPDR", "Sector ETF"], "XLI": ["Industrial Select Sector SPDR", "Sector ETF"],
    "XLB": ["Materials Select Sector SPDR", "Sector ETF"], "XLRE": ["Real Estate Select Sector SPDR", "Sector ETF"],
    "XLU": ["Utilities Select Sector SPDR", "Sector ETF"],
    "MSFT": ["Microsoft", "Technology"], "NVDA": ["NVIDIA", "Semiconductors"], "AAPL": ["Apple", "Technology"],
    "AMZN": ["Amazon", "Consumer Discretionary"], "GOOGL": ["Alphabet (A)", "Communication Svcs"], "GOOG": ["Alphabet (C)", "Communication Svcs"],
    "META": ["Meta Platforms", "Communication Svcs"], "TSLA": ["Tesla", "Consumer Discretionary"], "AVGO": ["Broadcom", "Semiconductors"],
    "MU": ["Micron Technology", "Semiconductors"], "AMD": ["Advanced Micro Devices", "Semiconductors"], "INTC": ["Intel", "Semiconductors"],
    "LRCX": ["Lam Research", "Semiconductors"], "TSM": ["Taiwan Semiconductor", "Semiconductors"], "ORCL": ["Oracle", "Technology"],
    "^VIX": ["CBOE Volatility Index", "Index"], "^VIX9D": ["CBOE 9-Day Volatility Index", "Index"], "^VIX3M": ["CBOE 3-Month Volatility Index", "Index"],
    "^GSPC": ["S&P 500 Index", "Index"], "^IXIC": ["Nasdaq Composite", "Index"], "^NDX": ["Nasdaq-100 Index", "Index"], "^DJI": ["Dow Jones Industrial Average", "Index"]
  };

  /* ── pure helpers (extractable by selftest) ── */
  function normTicker(t) { return (t == null ? "" : String(t)).trim().toUpperCase(); }
  function tickerHref(t) {
    t = normTicker(t); if (!t) return "";
    var q = (t.charAt(0) === "^") ? "%5E" + t.slice(1) : t; /* ^VIX → %5EVIX */
    return "https://finance.yahoo.com/quote/" + q;
  }
  function companyName(t) { t = normTicker(t); return NAMES[t] ? NAMES[t][0] : null; }
  function companyKind(t) { t = normTicker(t); return NAMES[t] ? NAMES[t][1] : null; }

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }

  function safeId(value) {
    return normTicker(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "ticker";
  }

  function tickerContext(ticker, opts) {
    opts = opts || {};
    var t = normTicker(ticker);
    if (!t) return null;
    var name = opts.name || companyName(t) || t;
    var kind = opts.kind || companyKind(t) || "Public market symbol";
    var context = {
      contractVersion: "contextual-tooltip/v1",
      contextId: "rlticker/" + safeId(t),
      triggerKind: "ticker",
      label: t + " market symbol",
      definition: name + " is identified by the public market symbol " + t + ".",
      displayed: { valueText: t, numericValue: null, unit: "ticker symbol", truthState: "current" },
      interpretation: {
        text: t + " identifies " + name + " as " + kind + "; this identity does not state price direction or a recommendation.",
        direction: "not-directional",
        comparisonBasis: "RLTKR public symbol registry",
        window: "Current bundled symbol registry",
        thresholdsOrBounds: []
      },
      provenance: {
        ownerId: "rlticker",
        modelId: "public-symbol-registry",
        evidenceIdentity: "rlticker:" + t,
        sourceRefs: ["rlticker:NAMES:" + t],
        observedAsOf: "bundled symbol registry",
        retrievedOrPublishedAt: "bundled with this page",
        freshness: "static",
        dataTier: "public symbol identity"
      },
      uncertainty: {
        state: companyName(t) ? "bounded" : "partial",
        rangeOrBand: companyName(t) ? "Known symbol identity" : "Symbol only",
        reason: companyName(t) ? "Company and kind are present in the public RLTKR registry." : "Company and kind are not present in the bundled public registry."
      },
      limitation: "The public Yahoo Finance link is navigational and carries no user-specific financial data.",
      triggerCondition: "The rendered public symbol is " + t + ".",
      invalidationCondition: "The public symbol registry changes this identity or the symbol is removed.",
      links: { owner: "", citation: "", sameDataTable: "", ticker: tickerHref(t) },
      accessibility: {
        conciseLabel: t + ", " + name + ", " + kind,
        longDescriptionId: "rlcontext-rlticker-" + safeId(t)
      },
      contextFingerprint: null
    };
    if (root.RLCTX && typeof root.RLCTX.validateContext === "function") {
      var result = root.RLCTX.validateContext(context);
      if (result.ok) return result.value;
    }
    return freeze(context);
  }

  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* renderer-facing: build a linked, tooltipped ticker <a>. */
  function tag(ticker, opts) {
    opts = opts || {};
    var t = normTicker(ticker); if (!t) return esc(opts.label || "");
    var nm = opts.name || companyName(t), kd = opts.kind || companyKind(t);
    var identity = (nm ? nm : t) + (kd ? " · " + kd : "");
    return '<span class="rltkr-wrap" data-tkr-symbol="' + esc(t) + '"><a class="rltkr" href="' + esc(tickerHref(t)) + '" target="_blank" rel="noopener" ' +
      'data-rlk-done="1" aria-label="' + esc(identity + " — open Yahoo Finance") + '">' + esc(opts.label || t) + '</a>' +
      '<button class="rltkr-context" type="button" data-tkr-context="' + esc(t) + '" aria-label="Explain ' + esc(t) + '">?</button></span>';
  }

  root.RLTKR = { context: tickerContext, tag: tag, href: tickerHref, name: companyName, kind: companyKind, normTicker: normTicker, NAMES: NAMES };
  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM */

  function injectCSS() {
    if (document.getElementById("rltkr-css")) return;
    var st = document.createElement("style"); st.id = "rltkr-css";
    st.textContent = "a.rltkr{color:var(--teal,#2dd4bf);text-decoration:none;border-bottom:1px dotted rgba(45,212,191,.5);cursor:pointer}a.rltkr:hover{border-bottom-color:#2dd4bf;color:#7fe9db}" +
      ".rltkr-wrap{display:inline-flex;align-items:baseline;gap:3px}.rltkr-context{display:inline-grid;place-items:center;width:18px;height:18px;padding:0;border:1px solid var(--bd,#2f4457);border-radius:50%;background:transparent;color:var(--mut,#93a6b8);font:700 11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;cursor:help}.rltkr-context:hover,.rltkr-context:focus{border-color:var(--teal,#2dd4bf);color:var(--teal,#2dd4bf)}";
    (document.head || document.documentElement).appendChild(st);
  }

  function bindContextControl(button, ticker, opts) {
    if (!button || button.getAttribute("data-rltkr-context-bound")) return;
    function bindNow() {
      if (!root.RLCTX || typeof root.RLCTX.bind !== "function") return;
      var result = root.RLCTX.bind(button, tickerContext(ticker, opts));
      if (result.ok) button.setAttribute("data-rltkr-context-bound", "1");
    }
    if (root.RLCTX) bindNow();
    else if (typeof root.addEventListener === "function") root.addEventListener("rlcontextready", bindNow, { once: true });
  }

  function createContextControl(ticker, opts) {
    var button = document.createElement("button");
    button.className = "rltkr-context";
    button.type = "button";
    button.textContent = "?";
    button.setAttribute("data-tkr-context", ticker);
    button.setAttribute("aria-label", "Explain " + ticker);
    bindContextControl(button, ticker, opts);
    return button;
  }

  function configureLink(anchor, ticker, label, opts) {
    var name = opts.name || companyName(ticker);
    var kind = opts.kind || companyKind(ticker);
    var identity = (name || ticker) + (kind ? " \u00b7 " + kind : "");
    anchor.className = "rltkr";
    anchor.href = tickerHref(ticker);
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.textContent = label || ticker;
    anchor.setAttribute("data-rlk-done", "1");
    anchor.setAttribute("aria-label", identity + " \u2014 open Yahoo Finance");
    anchor.removeAttribute("data-tip");
    anchor.removeAttribute("title");
  }

  function makeLink(elm, t) {
    if (!elm || elm.getAttribute("data-rltkr-done")) return;
    t = normTicker(t || elm.getAttribute("data-tkr") || elm.textContent);
    if (!t) return;
    var label = elm.textContent || t;
    var opts = { name: companyName(t), kind: companyKind(t) };
    var wrapper = document.createElement("span");
    wrapper.className = "rltkr-wrap";
    wrapper.setAttribute("data-tkr-symbol", t);
    var anchor = elm.tagName === "A" ? elm : document.createElement("a");
    configureLink(anchor, t, label, opts);
    var button = createContextControl(t, opts);
    if (elm.tagName === "A") {
      elm.parentNode.replaceChild(wrapper, elm);
      wrapper.appendChild(anchor);
    } else {
      elm.textContent = "";
      elm.appendChild(wrapper);
      wrapper.appendChild(anchor);
    }
    wrapper.appendChild(button);
    elm.setAttribute("data-rltkr-done", "1");
  }

  /* bounded auto-scan of KNOWN tickers inside a container marked [data-tkr-auto] — no false links. */
  var KNOWN_RE = null;
  function knownRe() { if (KNOWN_RE) return KNOWN_RE; var ks = Object.keys(NAMES).filter(function (k) { return k.charAt(0) !== "^"; }).sort(function (a, b) { return b.length - a.length; }); KNOWN_RE = new RegExp("\\b(" + ks.join("|") + ")\\b", "g"); return KNOWN_RE; }
  function autoScanText(container) {
    try {
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null), nodes = [], n, re = knownRe();
      while ((n = walker.nextNode())) { re.lastIndex = 0; if (n.parentNode && !n.parentNode.closest("a,button,input,textarea,select,script,style,code,pre,.rltkr,[data-rlk-done],.rlnav,#rlcontext-disclosure,#rlcontext-announcer") && re.test(n.nodeValue)) nodes.push(n); }
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment(), s = node.nodeValue, last = 0, m; knownRe().lastIndex = 0;
        while ((m = knownRe().exec(s))) {
          if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
          var span = document.createElement("span"); span.setAttribute("data-tkr", m[1]); span.textContent = m[1]; makeLink(span, m[1]); frag.appendChild(span);
          last = m.index + m[1].length;
        }
        if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
    } catch (e) { }
  }
  function scan(rootEl) {
    rootEl = rootEl || document;
    try {
      var ex = rootEl.querySelectorAll(".tkr,[data-tkr]"); for (var i = 0; i < ex.length; i++) makeLink(ex[i]);
      var controls = rootEl.querySelectorAll(".rltkr-context[data-tkr-context]"); for (var c = 0; c < controls.length; c++) bindContextControl(controls[c], controls[c].getAttribute("data-tkr-context"), {});
      var au = rootEl.querySelectorAll("[data-tkr-auto]"); for (var j = 0; j < au.length; j++) autoScanText(au[j]);
      var body = rootEl.body || (rootEl === document ? document.body : (rootEl.nodeType === 1 ? rootEl : null));
      if (body && body.getAttribute && !body.getAttribute("data-tkr-noauto")) autoScanText(body);
    } catch (e) { }
  }
  root.RLTKR.scan = scan;

  var timer = null;
  function schedule() { if (timer) return; timer = setTimeout(function () { timer = null; scan(document); }, 240); }
  function mutationBelongsToContext(node) {
    var element = node && node.nodeType === 1 ? node : node && node.parentElement;
    return Boolean(element && element.closest && element.closest("#rlcontext-disclosure,#rlcontext-announcer"));
  }
  function textContainsKnownTicker(value) {
    var re = knownRe();
    re.lastIndex = 0;
    return re.test(String(value || ""));
  }
  function mutationNeedsTickerScan(node) {
    if (!node || mutationBelongsToContext(node)) return false;
    if (node.nodeType === 3) {
      var parent = node.parentElement;
      if (!parent || (parent.closest && parent.closest("a,button,input,textarea,select,script,style,code,pre,.rltkr,[data-rlk-done],.rlnav"))) return false;
      var autoRegion = parent.closest && parent.closest("[data-tkr-auto]");
      var bodyAuto = document.body && !document.body.getAttribute("data-tkr-noauto");
      return Boolean((autoRegion || bodyAuto) && textContainsKnownTicker(node.nodeValue));
    }
    if (node.nodeType !== 1) return false;
    if ((node.matches && node.matches(".tkr,[data-tkr],.rltkr-context[data-tkr-context],[data-tkr-auto]")) ||
        (node.querySelector && node.querySelector(".tkr,[data-tkr],.rltkr-context[data-tkr-context],[data-tkr-auto]"))) return true;
    var inAutoRegion = node.closest && node.closest("[data-tkr-auto]");
    var bodyAllowsAuto = document.body && !document.body.getAttribute("data-tkr-noauto");
    return Boolean((inAutoRegion || bodyAllowsAuto) && textContainsKnownTicker(node.textContent));
  }
  function boot() { try { injectCSS(); scan(document); try { new MutationObserver(function (m) { for (var i = 0; i < m.length; i++) { for (var j = 0; m[i].addedNodes && j < m[i].addedNodes.length; j++) { if (mutationNeedsTickerScan(m[i].addedNodes[j])) { schedule(); return; } } } }).observe(document.body, { childList: true, subtree: true }); } catch (e) { } } catch (e) { } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
