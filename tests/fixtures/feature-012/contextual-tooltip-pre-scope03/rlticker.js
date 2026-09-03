/* ═══════════ RLTKR — shared ticker → Yahoo Finance link + rich tooltip decorator ═══════════
   Loaded by every Research Lab page. NON-NEGOTIABLE house standard: every ticker anywhere
   (cards, tables, prose, chart labels/legends) is a link to finance.yahoo.com with a rich
   tooltip (company name + kind). Two paths:
     • RLTKR.tag(ticker[, {label,name,kind}]) → an <a class="rltkr"> string for renderers.
     • auto scan() upgrades elements marked `.tkr` / `[data-tkr]`, and — inside any container
       marked `[data-tkr-auto]` — every KNOWN-map ticker token (word-bounded, no false links).
   Custom hover tooltip (its own element; sets `data-rlk-done` so rlg.js won't double-decorate).
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

  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* renderer-facing: build a linked, tooltipped ticker <a>. */
  function tag(ticker, opts) {
    opts = opts || {};
    var t = normTicker(ticker); if (!t) return esc(opts.label || "");
    var nm = opts.name || companyName(t), kd = opts.kind || companyKind(t);
    var tip = (nm ? nm : t) + (kd ? " · " + kd : "") + " — click → Yahoo Finance";
    return '<a class="rltkr" href="' + esc(tickerHref(t)) + '" target="_blank" rel="noopener" ' +
      'data-rlk-done="1" data-tip="' + esc(tip) + '" title="' + esc(tip) + '">' + esc(opts.label || t) + '</a>';
  }

  root.RLTKR = { tag: tag, href: tickerHref, name: companyName, kind: companyKind, normTicker: normTicker, NAMES: NAMES };
  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM */

  /* ── custom tooltip ── */
  function injectCSS() {
    if (document.getElementById("rltkr-css")) return;
    var st = document.createElement("style"); st.id = "rltkr-css";
    st.textContent = "a.rltkr{color:var(--teal,#2dd4bf);text-decoration:none;border-bottom:1px dotted rgba(45,212,191,.5);cursor:pointer}a.rltkr:hover{border-bottom-color:#2dd4bf;color:#7fe9db}" +
      "#rltkrtip{position:fixed;z-index:10000;max-width:300px;background:#0e1620;border:1px solid #2f4457;border-radius:9px;padding:8px 11px;font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#cbd8e4;box-shadow:0 12px 34px -10px rgba(0,0,0,.75);pointer-events:none;opacity:0;transform:translateY(3px);transition:opacity .12s,transform .12s}#rltkrtip.on{opacity:1;transform:translateY(0)}#rltkrtip b{color:#f5b942}";
    (document.head || document.documentElement).appendChild(st);
  }
  var tip = null;
  function ensure() { if (!tip) { tip = document.createElement("div"); tip.id = "rltkrtip"; (document.body || document.documentElement).appendChild(tip); } return tip; }
  function place(ev) { var e = ensure(), pad = 14, r = e.getBoundingClientRect(), x = ev.clientX + pad, y = ev.clientY + pad; if (x + r.width > window.innerWidth - 8) x = ev.clientX - pad - r.width; if (y + r.height > window.innerHeight - 8) y = ev.clientY - pad - r.height; e.style.left = Math.max(6, x) + "px"; e.style.top = Math.max(6, y) + "px"; }
  function onEnter(ev) { var el = ev.currentTarget, txt = el.getAttribute("data-tip"); if (!txt) return; var e = ensure(); e.innerHTML = "<b>" + esc((el.textContent || "").trim()) + "</b> — " + esc(txt); place(ev); e.classList.add("on"); }
  function onMove(ev) { if (tip && tip.classList.contains("on")) place(ev); }
  function onLeave() { if (tip) tip.classList.remove("on"); }

  function makeLink(elm, t) {
    if (!elm || elm.getAttribute("data-rlk-done")) return;
    t = normTicker(t || elm.getAttribute("data-tkr") || elm.textContent);
    elm.setAttribute("data-rlk-done", "1");
    if (!t) return;
    var nm = companyName(t), kd = companyKind(t), tipTxt = (nm || t) + (kd ? " · " + kd : "") + " — click → Yahoo Finance";
    var a = document.createElement("a");
    a.className = "rltkr"; a.href = tickerHref(t); a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("data-tip", tipTxt); a.title = tipTxt; a.textContent = elm.textContent || t;
    a.addEventListener("mouseenter", onEnter); a.addEventListener("mousemove", onMove); a.addEventListener("mouseleave", onLeave);
    if (elm.tagName === "A") { elm.parentNode.replaceChild(a, elm); } else { elm.textContent = ""; elm.appendChild(a); }
  }

  /* bounded auto-scan of KNOWN tickers inside a container marked [data-tkr-auto] — no false links. */
  var KNOWN_RE = null;
  function knownRe() { if (KNOWN_RE) return KNOWN_RE; var ks = Object.keys(NAMES).filter(function (k) { return k.charAt(0) !== "^"; }).sort(function (a, b) { return b.length - a.length; }); KNOWN_RE = new RegExp("\\b(" + ks.join("|") + ")\\b", "g"); return KNOWN_RE; }
  function autoScanText(container) {
    try {
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null), nodes = [], n, re = knownRe();
      while ((n = walker.nextNode())) { re.lastIndex = 0; if (n.parentNode && !n.parentNode.closest("a,button,input,textarea,select,script,style,code,pre,.rltkr,[data-rlk-done],.rlnav") && re.test(n.nodeValue)) nodes.push(n); }
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
      var au = rootEl.querySelectorAll("[data-tkr-auto]"); for (var j = 0; j < au.length; j++) autoScanText(au[j]);
      var body = rootEl.body || (rootEl === document ? document.body : (rootEl.nodeType === 1 ? rootEl : null));
      if (body && body.getAttribute && !body.getAttribute("data-tkr-noauto")) autoScanText(body);
    } catch (e) { }
  }
  root.RLTKR.scan = scan;

  var timer = null;
  function schedule() { if (timer) return; timer = setTimeout(function () { timer = null; scan(document); }, 240); }
  function boot() { try { injectCSS(); scan(document); try { new MutationObserver(function (m) { for (var i = 0; i < m.length; i++) if (m[i].addedNodes && m[i].addedNodes.length) { schedule(); return; } }).observe(document.body, { childList: true, subtree: true }); } catch (e) { } } catch (e) { } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
