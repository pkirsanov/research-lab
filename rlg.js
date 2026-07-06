/* ═══════════ RL Glossary tooltips — shared, self-contained (loaded by the trading tools) ═══════════
   Hover any recognised term (KPI labels, gauge titles, table headers, chart titles) to get a rich
   tooltip: a general definition PLUS what the term means in the context of these tools. Injects its
   own CSS, auto-scans the DOM, and re-scans dynamically-rendered content via a MutationObserver. */
(function () {
    var root = (typeof window !== 'undefined') ? window : {};
    if (root.__rlgInit) return; root.__rlgInit = 1;
    /* term -> [general meaning, meaning in the context of these tools] */
    var G = {
        "spot": ["The current traded price of the underlying.", "The reference for every level, distance and greek shown here."],
        "strike": ["The fixed price at which an option can be exercised.", "The axis of the wall / GEX / greeks panels; levels sit at specific strikes."],
        "call": ["An option giving the right to BUY the underlying at the strike.", "Call open interest above spot builds the Call Wall (resistance)."],
        "put": ["An option giving the right to SELL the underlying at the strike.", "Put open interest below spot builds the Put Wall (support)."],
        "open interest": ["The number of option contracts of a strike/expiry currently outstanding (not yet closed).", "Big OI is where dealers must hedge, so it acts as support/resistance (the walls)."],
        "implied volatility": ["The annualised volatility an option's price implies via a pricing model — the market's expected movement.", "Higher IV = pricier options and wider expected-move cones."],
        "delta": ["Change in an option's price per $1 move in the underlying (roughly its chance of expiring in-the-money).", "Net delta exposure shows positioning's directional tilt."],
        "gamma": ["Rate of change of delta per $1 move — how fast hedges must be adjusted.", "Aggregated into GEX; gamma peaks near the walls and rises into expiry."],
        "vega": ["Change in an option's price per 1 percentage-point change in implied volatility.", "How sensitive positioning is to a move in IV."],
        "theta": ["Time decay — how much an option loses per day, all else equal.", "Negative for long options; shown per day here."],
        "greeks": ["The sensitivities of an option's price (delta, gamma, vega, theta and higher orders).", "All computed in your browser via Black-Scholes from the fetched chain."],
        "gex": ["Gamma Exposure — aggregate dealer gamma across all strikes, in dollars of hedging per 1% move.", "Positive = dealers dampen moves (pinning); negative = they amplify (trending). Sign depends on the dealer assumption."],
        "gamma flip": ["The price where net dealer gamma crosses zero — the boundary between the pinning and trending regimes.", "Above it price tends to mean-revert (pin); below it, moves accelerate (waterfall)."],
        "call wall": ["The strike with the largest call open interest above spot — a common resistance level.", "Dealers hedging short calls tend to cap price here."],
        "put wall": ["The strike with the largest put open interest below spot — a common support level.", "Dealers hedging puts tend to cushion price here."],
        "max pain": ["The settle price at which the total value of all in-the-money options is smallest.", "A soft magnet into expiry where option buyers lose most — a heuristic, not a forecast."],
        "poc": ["Point of Control — the price at which the most SHARES traded over the window.", "Cash-market support/resistance; strongest when it lines up with an option wall."],
        "value area": ["The price band holding about 70% of traded volume around the POC.", "Inside is accepted price; its edges (VAH/VAL) often act as support/resistance."],
        "volume profile": ["A histogram of traded volume by price (instead of by time).", "Reveals high/low-volume nodes (HVN/LVN) that behave as support/resistance."],
        "skew": ["The gap in implied volatility between downside puts and upside calls.", "Positive (put) skew = demand for downside protection (fear); negative = call chasing."],
        "put/call ratio": ["Put volume (or open interest) divided by call volume (or OI) — a sentiment gauge.", "High = defensive/bearish; low = call-heavy/bullish."],
        "vol/oi": ["A contract's traded volume divided by its open interest.", "Above 1 flags UNUSUAL activity — new positioning rather than resting OI."],
        "dealer": ["The market-maker on the other side of option trades, who hedges in the underlying.", "Dealer hedging is what turns option open interest into real support/resistance."],
        "dte": ["Days To Expiration.", "Shorter DTE = sharper gamma and tighter cones; 0DTE dominates the intraday walls."],
        "expiration": ["The date an option contract expires.", "Each fetched expiry has its own chain and gamma weight."],
        "volume": ["The number of shares (or contracts) traded in a period.", "Confirms moves; the bottom histogram is volume-by-time, the profile is volume-by-price."],
        "obv": ["On-Balance Volume — a running total adding volume on up days and subtracting it on down days.", "OBV falling while price rises signals distribution (a warning)."],
        "rsi": ["Relative Strength Index — a 0-100 momentum oscillator; >70 overbought, <30 oversold.", "Read with the levels to judge if momentum is stretched into resistance."],
        "atr": ["Average True Range — the average daily range, a normal-move / volatility gauge.", "Stops and targets are sized in ATR units (how many normal days away)."],
        "vwap": ["Volume-Weighted Average Price — the average price weighted by volume, reset at the session open.", "Intraday buyers hold the edge above VWAP, sellers below; the ±σ bands frame the normal range."],
        "moving average": ["The average close over N days, smoothing the trend.", "The 20/50/200-day lines frame short-, medium- and long-term trend; their stacking order is the alignment."],
        "momentum": ["The tendency of recent price trends to persist.", "Read from price vs its averages, RSI, and the direction of flow."],
        "volatility": ["How much returns fluctuate, usually annualised.", "Realised (historical) vs implied volatility gives the risk premium."],
        "regime": ["A market environment (risk-on / risk-off / neutral) with its own behaviour.", "Blended here from a Fear & Greed proxy plus the VIX level."],
        "accumulation": ["Buying into weakness (smart money entering).", "Flagged when price falls while OBV / money-flow rises."],
        "distribution": ["Selling into strength — price up but flow weak (smart money exiting).", "Flagged when price rises while OBV / money-flow falls."],
        "drawdown": ["The decline from a prior peak, as a percentage.", "Depth and duration gauge the pain of a position."],
        "money-flow": ["Volume-based pressure of buying vs selling (e.g. OBV).", "Divergence from price flags accumulation or distribution."],
        "squeeze": ["A sharp rally forced by short-sellers buying to cover, often amplified by call hedging.", "Fuelled by negative gamma + up-momentum."],
        /* ── trading-lab specific ── */
        "ovi": ["Option Volume Imbalance — gamma-weighted CALL volume vs gamma-weighted PUT volume, netted into a direction (ratio) and an impact (weighted quantity).", "A strong reading + a one-sided ratio is rare, high-conviction breakout flow forcing dealers to hedge; scored 0-100 immediately (turnover x one-sidedness), then upgraded to a percentile vs your rolling history."],
        "opex": ["Options Expiration — the monthly (3rd Friday) or quarterly triple-witching date when large option open interest expires.", "Gamma pins hardest into OPEX, then 'un-pins' after; the expiration-cycle playbook trades this."],
        "pin": ["Pinning — when dealers are long gamma they sell strength and buy weakness, compressing price toward high-open-interest strikes.", "Positive-gamma / above-the-flip regimes pin; fade the range toward max pain rather than chasing breakouts."],
        "waterfall": ["A gamma-flip 'waterfall' — once price falls below the flip, dealers are short gamma and sell into weakness, amplifying the drop.", "The highest-potential short is the FIRST negative-gamma close after a long positive-gamma run (the JEX flip)."],
        "confluence": ["A weighted agreement score of the underlying signals — how many independent reads line up.", "Shown 0-100; it is NOT a win-rate, only how much the evidence agrees."],
        "stance": ["Your chosen bias: trade WITH the dealers/trend, let the model pick, or FADE / counter it.", "A Simple-cockpit lever — it can override the model's direction and reshapes the trade plan live."],
        "aggressiveness": ["How weak a setup you are willing to act on.", "A Simple-cockpit lever — patient waits for a clean high-R:R setup; aggressive triggers on a weaker read."],
        "horizon": ["Your holding timeframe — scalp / intraday vs hold-into-expiration (swing / position).", "A Simple-cockpit lever — it selects the primary target (near vs far) and the resulting R:R."],
        "r:r": ["Reward-to-Risk — the distance to the target divided by the distance to the stop.", "Shown as 1 : N; the plan grade rises with R:R and confluence."],
        "net delta": ["Cumulative up-volume minus down-volume across the session (a buy/sell-pressure proxy).", "Positive = net buying; derived from each bar's close vs open, not real bid/ask order flow."],
        "tape control": ["Who is driving today's tape — trend-following algos pinned to VWAP, or emotional retail flow.", "A heuristic read; 'mixed' means no clear controller — trade the level, not the story."],
        "session type": ["The shape of the trading day — trend, balance/rotation, or a developing / mixed profile.", "A heuristic classification of the VWAP behaviour and volume profile."],
        "opening range": ["The high-low band of the first N minutes of the session.", "A break of it often sets the day's direction; shown as the shaded box."],
        "scalp": ["A very short-term trade aiming for the first / nearest target.", "The intraday Horizon lever's near-target mode (vs holding the full session)."],
        "turnover": ["Gamma-weighted option VOLUME divided by gamma-weighted open INTEREST.", "The OVI flow-strength ingredient — high turnover means today's flow is large vs resting positioning."],
        "structure": ["The market's swing structure — higher-highs/higher-lows (up) vs lower-highs/lower-lows (down), and patterns like double tops.", "Framed over days-to-weeks from swing pivots; each pattern carries a descriptive analog base rate, not a forecast."],
        "trend": ["The prevailing direction of price over the chosen timeframe.", "Read from the 20/50/200-day MA stack (bull-stacked vs bear-stacked) and swing pivots."],
        "shelf": ["A high-volume node (HVN) in the profile — a price shelf where lots of volume traded.", "Shelves tend to hold as support/resistance; low-volume gaps get crossed fast."],
        "delta divergence": ["When price makes a new extreme but the cumulative up/down-volume delta does not confirm it — a warning the move lacks participation.", "A PROXY read from close-vs-open volume, NOT real bid/ask order flow; strongest when it prints INTO a support/resistance level."],
        "absorption": ["Large volume trading at a level with little price progress and a rejection wick — one side 'absorbing' the opposing flow.", "Here it is a PROXY: an outsized-volume bar with a rejection wick at a POC / value-area edge / prior level, inferred from OHLCV — NOT real bid/ask absorption."],
        "volume imbalance": ["A lopsided amount of buying vs selling stacked at adjacent prices, leaving a 'shelf' that tends to act as support/resistance.", "Here it is a PROXY: up-volume vs down-volume (close-vs-open) ≥ 3× across ≥ 3 adjacent price buckets — NOT a real bid/ask footprint imbalance."],
        "liquidity sweep": ["A quick poke beyond a key level (like the opening-range high/low) that grabs stops, then reverses — 'taking liquidity' before the real move.", "Inferred from the opening-range OHLCV only; the tool has no view of real resting orders or stops — a price-structure read, not real liquidity data."]
    };
    /* aliases: rendered label text (normalised) -> glossary key */
    var A = {
        "oi": "open interest", "call oi": "open interest", "put oi": "open interest", "open int": "open interest",
        "iv": "implied volatility", "call iv": "implied volatility", "put iv": "implied volatility", "atm iv": "implied volatility", "implied vol": "implied volatility",
        "call vol": "volume", "put vol": "volume", "raw vol": "volume", "vol": "volatility", "realized volatility": "volatility", "realised volatility": "volatility",
        "\u03b3": "gamma", "net gamma": "gamma", "\u03b4": "delta", "\u03b8": "theta", "\u03bd": "vega",
        "gex$": "gex", "net gex": "gex", "gamma exposure": "gex", "net gamma by strike": "gex", "zero gamma": "gamma flip", "flip": "gamma flip", "gamma-flip": "gamma flip", "gamma regime": "gamma flip", "gamma flip": "gamma flip", "dealer gamma": "gamma flip", "dealer-gamma": "gamma flip", "regime read": "gamma flip",
        "vol poc": "poc", "point of control": "poc", "hvn": "shelf", "hvn shelf": "shelf", "shelves": "shelf",
        "put/call": "put/call ratio", "p/c": "put/call ratio", "p/c oi": "put/call ratio", "put/call oi": "put/call ratio", "pcoi": "put/call ratio",
        "dma": "moving average", "sma": "moving average", "20dma": "moving average", "50dma": "moving average", "200dma": "moving average", "20d": "moving average", "50d": "moving average", "200d": "moving average", "ma stack": "moving average",
        "\u00b1\u03c3": "vwap", "sigma bands": "vwap", "vwap side": "vwap",
        "option volume imbalance": "ovi", "ovi flow": "ovi", "ovi flow breakout": "ovi", "call-heavy": "ovi", "put-heavy": "ovi", "flow strength": "ovi", "flow-strength": "ovi", "weighted qty": "ovi",
        "opex clock": "opex", "expiration cycle": "opex", "gamma-time": "opex", "monthly opex": "opex", "quarterly opex": "opex", "triple-witching": "opex", "0dte": "dte", "0dte walls": "call wall",
        "jex": "waterfall", "jex-flip": "waterfall", "jex-flip waterfall": "waterfall", "gamma-flip waterfall": "waterfall", "pinning": "pin", "pin / range": "pin", "expiration pin": "pin",
        "your stance": "stance", "aggr": "aggressiveness", "risk:reward": "r:r", "r/r": "r:r", "reward-to-risk": "r:r", "reward to risk": "r:r",
        "net \u0394": "net delta", "control": "tape control", "tape control": "tape control", "session": "session type", "opening range box": "opening range", "or": "opening range",
        "value": "value area", "value area": "value area", "vah": "value area", "val": "value area",
        "money flow": "money-flow", "a/d": "money-flow", "accum/dist": "money-flow", "reversal risk": "session type", "overextension": "session type", "capitulation": "session type",
        "signal": "momentum", "rs": "momentum", "gamma-weighted": "gamma", "net delta": "net delta",
        "cvd": "delta divergence", "cvd divergence": "delta divergence", "delta divergence (proxy)": "delta divergence", "cumulative-delta divergence": "delta divergence", "absorption (proxy)": "absorption", "volume-imbalance": "volume imbalance", "imbalance shelf": "volume imbalance", "buy-vol shelf": "volume imbalance", "sell-vol shelf": "volume imbalance", "or liquidity sweep": "liquidity sweep", "opening-range sweep": "liquidity sweep"
    };
    function norm(s) { return (s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, " ").trim(); }
    function resolve(k) { return G[k] ? k : ((A[k] && G[A[k]]) ? A[k] : null); }
    var ORDER = null;
    function order() { if (ORDER) return ORDER; var ks = [], k; for (k in G) ks.push(k); for (k in A) ks.push(k); ks.sort(function (a, b) { return b.length - a.length; }); ORDER = ks; return ks; }
    function isB(ch) { return ch === undefined || ch === "" || !/[a-z0-9]/.test(ch); }
    function hasWord(text, key) { var i = text.indexOf(key); while (i >= 0) { if (isB(text.charAt(i - 1)) && isB(text.charAt(i + key.length))) return true; i = text.indexOf(key, i + 1); } return false; }
    function labelKey(text) {
        var n = norm(text); if (!n || n.length > 90) return null;
        if (resolve(n)) return resolve(n);
        var s = n.replace(/^[^a-z0-9$%&]+/, "").replace(/^(call|put|net|avg|ann\.?|rolling|trailing|window|daily|total|focus|active|min|max|top|your)\s+/, "").replace(/\s+by\s+(strike|expiry|expiration|date)$/, "").replace(/\s*\([^)]*\)\s*$/, "").replace(/[\s:%$]+$/, "").trim();
        if (resolve(s)) return resolve(s);
        var t0 = s.split(" ")[0]; if (resolve(t0)) return resolve(t0);
        var scan = s || n, ks = order(); for (var i = 0; i < ks.length; i++) { if (ks[i].length < 4) continue; if (hasWord(scan, ks[i])) return resolve(ks[i]); }
        return null;
    }
    root.__rlg = { G: G, A: A, labelKey: labelKey, norm: norm };
    if (typeof document === "undefined") return; /* no-DOM (Node test): stop here */

    function injectCSS() {
        if (document.getElementById("rlg-css")) return;
        var st = document.createElement("style"); st.id = "rlg-css";
        st.textContent = ".rlg{cursor:help}.rlg.u{border-bottom:1px dotted rgba(138,160,179,.55)}.rlg.u:hover{border-bottom-color:#2dd4bf;color:#2dd4bf}#rlgtip{position:fixed;z-index:9999;max-width:344px;background:#0e1620;border:1px solid #2f4457;border-radius:9px;padding:9px 11px;font:12px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#cbd8e4;box-shadow:0 12px 34px -10px rgba(0,0,0,.75);pointer-events:none;opacity:0;transform:translateY(3px);transition:opacity .12s ease,transform .12s ease}#rlgtip.on{opacity:1;transform:translateY(0)}#rlgtip .h{font-weight:700;color:#e6edf3;margin:0 0 3px;font-size:12.5px}#rlgtip .g{color:#cbd8e4}#rlgtip .c{margin-top:6px;padding-top:6px;border-top:1px solid #22303f;color:#93a6b8}#rlgtip .c b{color:#f5b942;font-weight:700}";
        (document.head || document.documentElement).appendChild(st);
    }
    var tip = null;
    function ensure() { if (!tip) { tip = document.createElement("div"); tip.id = "rlgtip"; (document.body || document.documentElement).appendChild(tip); } return tip; }
    function place(ev) { var t = ensure(), pad = 14, vw = window.innerWidth, vh = window.innerHeight, r = t.getBoundingClientRect(); var x = ev.clientX + pad, y = ev.clientY + pad; if (x + r.width > vw - 8) x = ev.clientX - pad - r.width; if (y + r.height > vh - 8) y = ev.clientY - pad - r.height; t.style.left = Math.max(6, x) + "px"; t.style.top = Math.max(6, y) + "px"; }
    function esc(s) { return (s || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function onEnter(ev) { try { var k = ev.currentTarget.getAttribute("data-rlk"), d = G[k]; if (!d) return; var t = ensure(); t.innerHTML = '<div class="h">' + esc((ev.currentTarget.textContent || "").trim().slice(0, 60)) + '</div><div class="g">' + d[0] + '</div>' + (d[1] ? '<div class="c"><b>In context:</b> ' + d[1] + '</div>' : ''); place(ev); t.classList.add("on"); } catch (e) { } }
    function onMove(ev) { if (tip && tip.classList.contains("on")) place(ev); }
    function onLeave() { if (tip) tip.classList.remove("on"); }
    function decorate(elm, underline) {
        try {
            if (!elm || elm.getAttribute("data-rlk-done")) return;
            var key = labelKey(elm.textContent);
            elm.setAttribute("data-rlk-done", "1");
            if (!key) return; var d = G[key]; if (!d) return;
            if (elm.getAttribute("title")) return;
            elm.setAttribute("data-rlk", key); elm.classList.add("rlg"); if (underline) elm.classList.add("u");
            elm.setAttribute("aria-label", d[0] + (d[1] ? " \u2014 In context: " + d[1] : ""));
            elm.addEventListener("mouseenter", onEnter); elm.addEventListener("mousemove", onMove); elm.addEventListener("mouseleave", onLeave);
        } catch (e) { }
    }
    function scan(rootEl) {
        rootEl = rootEl || document; try {
            ["th", ".kpi .k", ".k", ".badge", ".flag", ".legend span", ".ctl label", ".panel label", "label", ".g-title", ".gt", ".pill"].forEach(function (sel) { var ns = rootEl.querySelectorAll(sel); for (var i = 0; i < ns.length; i++)decorate(ns[i], true); });
            [".chart .ct", ".chart .cc", ".panel h2"].forEach(function (sel) { var ns = rootEl.querySelectorAll(sel); for (var i = 0; i < ns.length; i++)decorate(ns[i], false); });
        } catch (e) { }
    }
    var timer = null;
    function schedule() { if (timer) return; timer = setTimeout(function () { timer = null; scan(document); }, 220); }
    /* ── shared canonical macro-regime classifier (single source of truth from RLDATA.macro: F&G score + VIX) ──
       Every tool blends its own local context (session / MA trend) on top of this; the MACRO band + risk should agree lab-wide. */
    function macroRegime(macro) {
        var fg = macro && macro.fg, vix = macro && macro.vix;
        var score = (fg && isFinite(fg.score)) ? fg.score : null, hasVix = (vix != null && isFinite(vix));
        if (score == null && !hasVix) return { score: null, vix: null, band: "Unknown", cls: "", risk: 0, note: "macro proxy unavailable" };
        if (score == null) return { score: null, vix: vix, band: "VIX " + vix.toFixed(1), cls: vix >= 26 ? "warn" : vix <= 15 ? "live" : "", risk: vix >= 26 ? -1 : vix <= 15 ? 1 : 0, note: "F&G unavailable \u2014 VIX only" };
        var band, cls, risk, note;
        if (score >= 76) { band = "Extreme greed"; cls = "warn"; risk = 1; }
        else if (score >= 56) { band = "Greed / risk-on"; cls = "live"; risk = 1; }
        else if (score > 44) { band = "Neutral"; cls = ""; risk = 0; }
        else if (score > 24) { band = "Fear / risk-off"; cls = "warn"; risk = -1; }
        else { band = "Extreme fear"; cls = "bad"; risk = -1; }
        if (hasVix && vix >= 30 && risk >= 0) { cls = "warn"; note = "elevated VIX " + vix.toFixed(0) + " tempers the risk-on read"; }
        return { score: score, vix: hasVix ? vix : null, band: band, cls: cls, risk: risk, note: note || (fg.band || band) };
    }
    try { window.RLG = window.RLG || {}; window.RLG.macroRegime = macroRegime; } catch (e) { }
    function boot() { try { injectCSS(); scan(document); window.addEventListener("scroll", onLeave, true); try { new MutationObserver(function (m) { for (var i = 0; i < m.length; i++) { if (m[i].addedNodes && m[i].addedNodes.length) { schedule(); return; } } }).observe(document.body, { childList: true, subtree: true }); } catch (e) { } } catch (e) { } }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
