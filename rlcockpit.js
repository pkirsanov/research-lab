/*
 * rlcockpit.js
 * ------------------------------------------------------------------------
 * Feature 026 — the ONE output-budget measurement and the ONE cross-asset leg
 * resolver for the Actionable Market Brief.
 *
 * Scope 1 — the output budget.
 *
 * The brief has two budgets and they govern opposite ends of the run.
 * `artifact-budget/v1` in market-brief.config.json caps what a run may PULL
 * (bars per symbol, symbols per run, normalized observation bytes). It has
 * never capped prose. `output-budget/v1`, introduced beside it, caps what a
 * run may PUBLISH as default-visible reader narrative. Neither replaces the
 * other and neither may be raised inside a change that would otherwise fail
 * against it.
 *
 * Five functions, every one pure and every one a top-level `function`
 * declaration so scripts/selftest.mjs `extractFn` can reach it by name:
 *
 *   measureDefaultVisible(payload, budgetPolicy) -> budget-measurement/v1
 *       Sums String.length over the committed `defaultVisibleFields` path
 *       list. Counts no key, no number, no boolean, no null and no field
 *       outside the list. Reports `disclosedTotal` — everything else in the
 *       payload — beside it, uncapped, so collapsing text can never be
 *       mistaken for removing it.
 *
 *   budgetViolations(measurement, budgetPolicy) -> [{ path, measured, cap }]
 *       The refusal set. One entry per breach, each naming the exceeding
 *       path, the measured value and the cap it exceeded.
 *
 *   selectDefaultVisible(composed, budgetPolicy) -> { published, demoted, heldBack }
 *       Allocation. Demotes WHOLE items in the declared order — changed
 *       lines fold into the roll-up count first, then the lowest-ranked
 *       decision cards move to the held-back list. Dark states and the
 *       track-record line are excluded from the ladder by material class,
 *       not by a runtime check a later change could reorder.
 *
 * There is deliberately NO character-cutting helper in this file. A cut
 * sentence is not brevity, so the capability offers no way to produce one:
 * a caller can demote an item or refuse the run, and nothing else.
 *
 * Scope 2 — the cross-asset legs.
 *
 *   resolveLeg(legPolicy, measurement, sessions) -> reading | dark card | null
 *       One declared slot in, exactly one of a cross-asset-reading/v1 or a
 *       dark-state/v1 out. A NON-required leg with nothing to carry is
 *       omitted and returns null; a required one never is. `provenance` is
 *       copied off the committed declaration and is never inferred from what
 *       the run observed.
 *
 *   darkState(leg, reason, withheld) -> dark-state/v1
 *       The published blindness. It names the leg, the reason, the conclusion
 *       being withheld and the refusal to substitute.
 *
 * Scope 3 — the change vocabulary.
 *
 *   changeKind(prevState, curState, vocabulary) -> kind | null
 *       The whole point of the feature. It takes TWO STATE OBJECTS AND THE
 *       VOCABULARY AND NOTHING ELSE, and it reads no narrative field: rewrite
 *       every sentence about an unchanged instrument and the answer is still
 *       `null`. That is what stops novel wording from buying a paragraph.
 *
 *   rollUpFrom(trackedStates, kinds) -> rollUp
 *       Everything that did not change, as ONE line and a drawer body of
 *       symbol-plus-state-token pairs. `baseline` is counted separately from
 *       `unchanged`, because an instrument the brief has never seen before is
 *       not unchanged — that would be a false statement about the past.
 *
 *   rollUpBalances(narrativeCount, rollUp, trackedSize) -> boolean
 *       The arithmetic that makes silent dropping impossible:
 *       narrative + unchanged + baseline === trackedSize, and the drawer body
 *       holds exactly the members those two counts claim.
 *
 * Neither function measures anything. The trailing return lives once, in the
 * owning tool (real-assets-lab.html `realTrailingPct`), and Tier A calls it;
 * this module resolves what Tier A measured into a published shape. A
 * non-finite measurement is an absence and raises a dark state — it is never
 * coerced to 0, never carried forward from an earlier run and never filled in
 * from a neighbouring instrument.
 *
 * UMD dual module: Node takes `module.exports`, the browser takes the
 * `globalThis.RLCOCKPIT` branch, and both receive the SAME frozen api object.
 * No build step, no ES module syntax, no browser-only global.
 * Educational only — not investment advice.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLCOCKPIT_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLCOCKPIT = api;
})(function () {
  "use strict";

  var MEASUREMENT_CONTRACT = "budget-measurement/v1";
  var LEG_CONTRACT = "cross-asset-reading/v1";
  var DARK_CONTRACT = "dark-state/v1";

  /* Two closes is the floor for a change: one close is a level, not a move. A leg that
     cannot reach it raises a dark state rather than reporting a change of nothing. */
  var MIN_LEG_SESSIONS = 2;

  /* The three cap names, in the wording the refusal line uses. Keeping the
     label beside the number is what lets the validator print one sentence per
     breach without re-deriving which cap a path answers to. */
  var CAP_ITEM = "cap";
  var CAP_CARD = "per-card cap";
  var CAP_TOTAL = "total cap";
  var TOTAL_PATH = "default-visible narrative";

  /* Every reader token is a GLYPH PLUS A WORD. Strip all colour, or zoom to 200 percent and
     lose the glyph's shape, and the word still carries the state. A bare glyph or a bare
     colour would not survive either, which is why neither is a permitted token form. */
  var LEG_TOKEN_RESOLVED = "\u25CF Resolved";
  var LEG_TOKEN_PARTIAL = "\u25D0 Partial";
  var LEG_TOKEN_DARK = "\u25CB Dark";

  /* The change vocabulary as words, keyed by the SAME kind strings `changeKind` returns.
     `baseline` and the null kind are roll-up-only tokens: neither ever labels a per-instrument
     line, because an unchanged or never-before-seen instrument earns no line at all. */
  var CHANGE_TOKEN_LEVEL_CROSSED = "\u25B2 Level crossed";
  var CHANGE_TOKEN_STATE_FLIPPED = "\u21C4 State flipped";
  var CHANGE_TOKEN_FLAG_RAISED = "\u2691 Flag raised";
  var CHANGE_TOKEN_FLAG_CLEARED = "\u2690 Flag cleared";
  var CHANGE_TOKEN_BASELINE = "\u002B First seen";
  var CHANGE_TOKEN_UNCHANGED = "= Unchanged";

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function finiteOrNull(value) {
    return Number.isFinite(value) ? value : null;
  }

  /* Split "crossAsset.legs[].label" into ["crossAsset", "legs[]", "label"]. */
  function pathSegments(path) {
    return typeof path === "string" && path.length ? path.split(".") : [];
  }

  /* Walk one declared path and collect every string it reaches. A segment
     ending in [] iterates an array; anything the payload does not carry
     simply contributes nothing, which is why a v1 payload measures 0 rather
     than raising. */
  function collectStrings(node, segments, index, out) {
    if (index >= segments.length) {
      if (typeof node === "string") out.push(node);
      return;
    }
    var segment = segments[index];
    var isList = segment.length > 2 && segment.charAt(segment.length - 2) === "["
      && segment.charAt(segment.length - 1) === "]";
    var key = isList ? segment.substring(0, segment.length - 2) : segment;
    if (!isPlainObject(node)) return;
    var child = node[key];
    if (isList) {
      if (!Array.isArray(child)) return;
      for (var i = 0; i < child.length; i++) collectStrings(child[i], segments, index + 1, out);
      return;
    }
    collectStrings(child, segments, index + 1, out);
  }

  function sumStringsAtPath(payload, path) {
    var found = [];
    collectStrings(payload, pathSegments(path), 0, found);
    var chars = 0;
    for (var i = 0; i < found.length; i++) chars += found[i].length;
    return chars;
  }

  /* Every string anywhere in the payload. `disclosedTotal` is this minus the
     default-visible total, so the two figures partition the run's prose and
     neither can masquerade as the other. */
  function sumEveryString(node) {
    if (typeof node === "string") return node.length;
    if (Array.isArray(node)) {
      var listTotal = 0;
      for (var i = 0; i < node.length; i++) listTotal += sumEveryString(node[i]);
      return listTotal;
    }
    if (isPlainObject(node)) {
      var keys = Object.keys(node);
      var objectTotal = 0;
      for (var k = 0; k < keys.length; k++) objectTotal += sumEveryString(node[keys[k]]);
      return objectTotal;
    }
    return 0;
  }

  function declaredFields(budgetPolicy) {
    var declared = isPlainObject(budgetPolicy) ? budgetPolicy.defaultVisibleFields : null;
    return Array.isArray(declared) ? declared : [];
  }

  /* The per-card paths are read OUT of the policy rather than restated here,
     so adding a card field to the committed list is a config edit and never a
     second place that has to agree. */
  function cardFieldKeys(budgetPolicy) {
    var prefix = "attention[].";
    var fields = declaredFields(budgetPolicy);
    var keys = [];
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (typeof field === "string" && field.indexOf(prefix) === 0) {
        keys.push(field.substring(prefix.length));
      }
    }
    return keys;
  }

  function measureCards(payload, budgetPolicy) {
    var cards = isPlainObject(payload) && Array.isArray(payload.attention) ? payload.attention : [];
    var keys = cardFieldKeys(budgetPolicy);
    var measured = [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var chars = 0;
      for (var k = 0; k < keys.length; k++) {
        var value = isPlainObject(card) ? card[keys[k]] : null;
        if (typeof value === "string") chars += value.length;
      }
      measured.push({ path: "attention[" + i + "]", chars: chars });
    }
    return measured;
  }

  function policyCaps(budgetPolicy) {
    var policy = isPlainObject(budgetPolicy) ? budgetPolicy : {};
    return {
      headline: finiteOrNull(policy.headlineChars),
      decisionCard: finiteOrNull(policy.decisionCardChars),
      total: finiteOrNull(policy.totalDefaultVisibleChars)
    };
  }

  /* ═══════════ exported: measurement ═══════════ */

  function measureDefaultVisible(payload, budgetPolicy) {
    var fields = declaredFields(budgetPolicy);
    var byField = [];
    var total = 0;
    for (var i = 0; i < fields.length; i++) {
      var path = fields[i];
      if (typeof path !== "string" || !path.length) continue;
      var chars = sumStringsAtPath(payload, path);
      byField.push({ path: path, chars: chars });
      total += chars;
    }
    var everyString = sumEveryString(payload);
    var disclosedTotal = everyString - total;
    if (disclosedTotal < 0) disclosedTotal = 0;
    var measurement = {
      contractVersion: MEASUREMENT_CONTRACT,
      total: total,
      byField: byField,
      disclosedTotal: disclosedTotal,
      caps: policyCaps(budgetPolicy),
      cards: measureCards(payload, budgetPolicy),
      violations: []
    };
    measurement.violations = budgetViolations(measurement, budgetPolicy);
    return measurement;
  }

  /* ═══════════ exported: refusal set ═══════════ */

  function budgetViolations(measurement, budgetPolicy) {
    var breaches = [];
    if (!isPlainObject(measurement)) return breaches;
    var caps = policyCaps(budgetPolicy);

    if (caps.headline !== null) {
      var byField = Array.isArray(measurement.byField) ? measurement.byField : [];
      for (var i = 0; i < byField.length; i++) {
        var row = byField[i];
        if (isPlainObject(row) && row.path === "headline" && Number.isFinite(row.chars) && row.chars > caps.headline) {
          breaches.push({ path: "headline", measured: row.chars, cap: caps.headline, capName: CAP_ITEM });
        }
      }
    }

    if (caps.decisionCard !== null) {
      var cards = Array.isArray(measurement.cards) ? measurement.cards : [];
      for (var c = 0; c < cards.length; c++) {
        var card = cards[c];
        if (isPlainObject(card) && Number.isFinite(card.chars) && card.chars > caps.decisionCard) {
          breaches.push({ path: card.path, measured: card.chars, cap: caps.decisionCard, capName: CAP_CARD });
        }
      }
    }

    if (caps.total !== null && Number.isFinite(measurement.total) && measurement.total > caps.total) {
      breaches.push({ path: TOTAL_PATH, measured: measurement.total, cap: caps.total, capName: CAP_TOTAL });
    }

    return breaches;
  }

  /* ═══════════ exported: allocation ═══════════ */

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* Whole items only. A demoted item stays counted and stays named — it moves
     to a published form the reader can open, it is never shortened and it is
     never dropped silently. */
  function selectDefaultVisible(composed, budgetPolicy) {
    var demoted = [];
    var heldBack = [];
    if (!isPlainObject(composed)) {
      return { published: composed, demoted: demoted, heldBack: heldBack };
    }
    var published = cloneValue(composed);
    var caps = policyCaps(budgetPolicy);
    if (caps.total === null) {
      return { published: published, demoted: demoted, heldBack: heldBack };
    }

    /* Rung 1 — changed-instrument lines fold into the roll-up count. */
    while (measureDefaultVisible(published, budgetPolicy).total > caps.total
      && Array.isArray(published.changed) && published.changed.length > 0) {
      var line = published.changed.pop();
      demoted.push({ rung: "changed", item: line });
      if (isPlainObject(published.rollUp)) {
        published.rollUp.count = (Number.isFinite(published.rollUp.count) ? published.rollUp.count : 0) + 1;
        if (Array.isArray(published.rollUp.members) && isPlainObject(line)
          && typeof line.symbol === "string") {
          published.rollUp.members.push({ symbol: line.symbol, state: line.state !== undefined ? line.state : null });
        }
      }
    }

    /* Rung 2 — decision cards below the lowest published rank move to the
       held-back list. The highest-ranked card is never demoted: an empty
       attention feed would hide the run's own subject. */
    while (measureDefaultVisible(published, budgetPolicy).total > caps.total
      && Array.isArray(published.attention) && published.attention.length > 1) {
      var card = published.attention.pop();
      heldBack.push({ rung: "attention", item: card });
    }

    return { published: published, demoted: demoted, heldBack: heldBack };
  }

  /* ═══════════ exported: cross-asset legs ═══════════ */

  function nonEmptyString(value) {
    return typeof value === "string" && value.length > 0 ? value : null;
  }

  function stringOrEmpty(value) {
    return typeof value === "string" ? value : "";
  }

  function wholeNumberOrNull(value) {
    return Number.isFinite(value) ? Math.floor(value) : null;
  }

  function sessionPhrase(count) {
    if (count === null) return "no measurable span";
    return count + (count === 1 ? " session" : " sessions");
  }

  /* The refusal sentence is assembled from a fixed clause and the leg's own id, so a card
     can never be published claiming a refusal it did not make. */
  function darkState(leg, reason, withheld) {
    var id = typeof leg === "string" ? leg : (isPlainObject(leg) ? stringOrEmpty(leg.id) : "");
    return {
      contractVersion: DARK_CONTRACT,
      leg: id,
      shape: "dark",
      reason: stringOrEmpty(reason),
      withheld: stringOrEmpty(withheld),
      substitutionRefusal: "Nothing was substituted for the " + id
        + " leg: no neighbouring instrument, no earlier run's value and no zero."
    };
  }

  /* A dark leg's reason is READ from what the owning model already published. It is never
     composed here, because a reason this module wrote would assert an absence no model
     reported. An absent reason stays empty and the validator refuses the card. */
  function carriedDarkReason(measurement) {
    return isPlainObject(measurement) ? stringOrEmpty(measurement.reason) : "";
  }

  function resolveMeasuredLeg(legPolicy, measurement, sessions) {
    var declared = wholeNumberOrNull(sessions);
    var driver = stringOrEmpty(legPolicy.driver);
    if (!isPlainObject(measurement)) {
      return darkState(legPolicy, "no " + driver + " measurement reached the publication step this run",
        legPolicy.withheld);
    }
    var span = wholeNumberOrNull(measurement.sessions);
    if (span === null || span < MIN_LEG_SESSIONS) {
      return darkState(legPolicy, driver + " reaches " + sessionPhrase(span)
        + " of committed closes, below the two a change needs", legPolicy.withheld);
    }
    /* The one guard that keeps a leg from ever publishing a substituted number, written as a
       single expression so the guard and the published value cannot drift apart: replace it
       with a coercion and the same absence becomes a 0, which is the defect it exists to
       stop. A non-finite return from the owning tool's own function is an absence, and an
       absence raises a dark state — it is never coerced, never carried forward from an
       earlier run and never filled in from a neighbouring instrument. */
    var change = Number.isFinite(measurement.changePct) ? measurement.changePct : null;
    if (change === null) {
      return darkState(legPolicy, driver + " produced no finite " + span
        + "-session change from its committed closes", legPolicy.withheld);
    }
    var asOf = nonEmptyString(measurement.asOf);
    if (asOf === null) {
      return darkState(legPolicy, driver + " carries no close date, so its change cannot be dated",
        legPolicy.withheld);
    }
    return {
      contractVersion: LEG_CONTRACT,
      leg: stringOrEmpty(legPolicy.id),
      shape: "measured",
      label: stringOrEmpty(legPolicy.label),
      driver: driver,
      claim: stringOrEmpty(legPolicy.claim),
      changePct: change,
      sessions: span,
      long63Pct: Number.isFinite(measurement.long63Pct) ? measurement.long63Pct : null,
      provenance: legPolicy.provenance,
      state: declared !== null && span < declared ? "partial" : "resolved",
      confirmation: null,
      withheld: null,
      asOf: asOf,
      deepLink: stringOrEmpty(legPolicy.deepLink)
    };
  }

  /* A carried leg measures nothing here: it forwards the owning model's own classification.
     It therefore carries no changePct and no long63Pct, so a reader cannot mistake a
     classification for a measurement this run took. */
  function resolveCarriedLeg(legPolicy, measurement) {
    var pairId = isPlainObject(measurement) ? nonEmptyString(measurement.pairId) : null;
    var direction = isPlainObject(measurement) ? nonEmptyString(measurement.direction) : null;
    if (pairId === null || direction === null) {
      if (legPolicy.required === true) {
        return darkState(legPolicy, "the owning model published no classification to carry this run",
          legPolicy.withheld);
      }
      return null;
    }
    var confirmation = isPlainObject(measurement.confirmation)
      ? { state: stringOrEmpty(measurement.confirmation.state), detail: measurement.confirmation.detail }
      : null;
    return {
      contractVersion: LEG_CONTRACT,
      leg: stringOrEmpty(legPolicy.id),
      shape: "carried",
      label: stringOrEmpty(legPolicy.label),
      pairId: pairId,
      direction: direction,
      purity: isPlainObject(measurement) ? measurement.purity : null,
      provenance: legPolicy.provenance,
      state: "resolved",
      confirmation: confirmation,
      withheld: stringOrEmpty(legPolicy.withheld),
      asOf: isPlainObject(measurement) ? nonEmptyString(measurement.asOf) : null,
      deepLink: stringOrEmpty(legPolicy.deepLink)
    };
  }

  /* One slot in, exactly one of a reading or a dark state out — never both and never
     neither, except for a NON-required leg with nothing to carry, which is omitted.
     `provenance` is copied straight off the committed declaration; nothing here infers it
     from what the run happened to observe. */
  function resolveLeg(legPolicy, measurement, sessions) {
    if (!isPlainObject(legPolicy) || nonEmptyString(legPolicy.id) === null) return null;
    if (legPolicy.shape === "dark") {
      return darkState(legPolicy, carriedDarkReason(measurement), legPolicy.withheld);
    }
    if (legPolicy.shape === "carried") return resolveCarriedLeg(legPolicy, measurement);
    if (legPolicy.shape === "measured") return resolveMeasuredLeg(legPolicy, measurement, sessions);
    return darkState(legPolicy, "the committed declaration names no published shape for this leg",
      legPolicy.withheld);
  }

  /* ═══════════ exported: the change vocabulary ═══════════ */

  function declaredList(vocabulary, key) {
    return isPlainObject(vocabulary) && Array.isArray(vocabulary[key]) ? vocabulary[key] : [];
  }

  /* The signed distance from a declared level, or null when the run cannot place the
     instrument against it. Sitting EXACTLY on a level returns null too: zero has no side, so
     a run that touches the 200-day and a run that closes on it are not a crossing between
     them. Both sides must be placeable or there is nothing to compare. */
  function levelGap(state, name) {
    var px = finiteOrNull(state.px);
    var levels = isPlainObject(state.levels) ? state.levels : null;
    var level = levels === null ? null : finiteOrNull(levels[name]);
    if (px === null || level === null) return null;
    var gap = px - level;
    return gap === 0 ? null : gap;
  }

  function crossedDeclaredLevel(prevState, curState, vocabulary) {
    var levels = declaredList(vocabulary, "levels");
    for (var i = 0; i < levels.length; i++) {
      var before = levelGap(prevState, levels[i]);
      var after = levelGap(curState, levels[i]);
      if (before === null || after === null) continue;
      if ((before > 0) !== (after > 0)) return true;
    }
    return false;
  }

  /* A token that is absent on either side is an absence, not a flip. Otherwise the first run
     to persist a token would report every instrument as flipped out of nothing. */
  function flippedDeclaredToken(prevState, curState, vocabulary) {
    var tokens = declaredList(vocabulary, "stateTokens");
    for (var i = 0; i < tokens.length; i++) {
      var before = nonEmptyString(prevState[tokens[i]]);
      var after = nonEmptyString(curState[tokens[i]]);
      if (before === null || after === null) continue;
      if (before !== after) return true;
    }
    return false;
  }

  /* Strict booleans on both sides. A flag that was absent last run and is `false` now has not
     been cleared — nothing was ever raised. */
  function movedDeclaredFlag(prevState, curState, vocabulary, toValue) {
    var before = isPlainObject(prevState.flags) ? prevState.flags : null;
    var after = isPlainObject(curState.flags) ? curState.flags : null;
    if (before === null || after === null) return false;
    var flags = declaredList(vocabulary, "flags");
    for (var i = 0; i < flags.length; i++) {
      var was = before[flags[i]], now = after[flags[i]];
      if (typeof was !== "boolean" || typeof now !== "boolean") continue;
      if (now === toValue && was === !toValue) return true;
    }
    return false;
  }

  function predicateFires(kind, prevState, curState, vocabulary) {
    if (kind === "levelCrossed") return crossedDeclaredLevel(prevState, curState, vocabulary);
    if (kind === "stateFlipped") return flippedDeclaredToken(prevState, curState, vocabulary);
    if (kind === "flagRaised") return movedDeclaredFlag(prevState, curState, vocabulary, true);
    if (kind === "flagCleared") return movedDeclaredFlag(prevState, curState, vocabulary, false);
    throw new Error("RLCOCKPIT_UNDECLARED_CHANGE_KIND: " + String(kind));
  }

  /* The one predicate. TWO STATE OBJECTS AND THE VOCABULARY — no narrative argument exists to
     pass, so rewriting every sentence about an instrument cannot move the answer. That is the
     whole mechanism behind "novel wording around an unchanged conclusion earns nothing".

     The vocabulary is CLOSED: a kind named in `precedence` that this module carries no
     predicate for, or a resolved kind absent from `kinds`, throws rather than passing through.
     A silent pass-through is how a closed set stops being closed. */
  function changeKind(prevState, curState, vocabulary) {
    if (!isPlainObject(curState)) return null;
    var kinds = declaredList(vocabulary, "kinds");
    if (kinds.indexOf("baseline") < 0) {
      throw new Error("RLCOCKPIT_UNDECLARED_CHANGE_KIND: baseline");
    }
    if (!isPlainObject(prevState)) return "baseline";
    var order = declaredList(vocabulary, "precedence");
    for (var i = 0; i < order.length; i++) {
      var kind = order[i];
      if (kinds.indexOf(kind) < 0) throw new Error("RLCOCKPIT_UNDECLARED_CHANGE_KIND: " + String(kind));
      if (predicateFires(kind, prevState, curState, vocabulary)) return kind;
    }
    return null;
  }

  /* The state token a drawer row shows. It is the instrument's OWN declared token, never a
     sentence: an unchanged instrument gets a symbol and a word, and the roll-up carries no
     rationale, no paragraph and no restated position. */
  function rollUpStateToken(state) {
    if (!isPlainObject(state)) return "n/a";
    return nonEmptyString(state.maStack) || nonEmptyString(state.rrgState) || "n/a";
  }

  /* Everything that earned no narrative, as ONE line and a drawer body. `unchanged` and
     `baseline` are counted SEPARATELY on purpose: telling a reader an instrument is unchanged
     when the brief has never seen it before is a false statement about the past. Members sort
     by symbol so two runs over one pair of rows serialize identically. */
  function rollUpFrom(trackedStates, kinds) {
    var states = isPlainObject(trackedStates) ? trackedStates : {};
    var resolved = isPlainObject(kinds) ? kinds : {};
    var symbols = Object.keys(states).sort();
    var members = [], count = 0, baselineCount = 0;
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      var kind = resolved[symbol] === undefined ? null : resolved[symbol];
      if (kind !== null && kind !== "baseline") continue;
      if (kind === "baseline") baselineCount++; else count++;
      members.push({ symbol: symbol, state: rollUpStateToken(states[symbol]) });
    }
    var parts = [];
    if (count > 0 || baselineCount === 0) parts.push(count + " unchanged");
    if (baselineCount > 0) parts.push(baselineCount + " first seen");
    return { line: "= " + parts.join(" · "), count: count, baselineCount: baselineCount, members: members };
  }

  /* The arithmetic that makes a silent drop impossible. An instrument is EITHER published with
     narrative OR counted here — never neither. The members check is the second half: a roll-up
     that claims eleven and lists ten has lost one, and a count alone would not notice. */
  function rollUpBalances(narrativeCount, rollUp, trackedSize) {
    if (!isPlainObject(rollUp) || !Array.isArray(rollUp.members)) return false;
    var narrative = finiteOrNull(narrativeCount);
    var size = finiteOrNull(trackedSize);
    var unchanged = finiteOrNull(rollUp.count);
    var baseline = finiteOrNull(rollUp.baselineCount);
    if (narrative === null || size === null || unchanged === null || baseline === null) return false;
    if (rollUp.members.length !== unchanged + baseline) return false;
    return narrative + unchanged + baseline === size;
  }

  /* ═══════════ exported: the reader tokens ═══════════ */

  /* ONE definition of each reader token, so a renderer cannot ship a second copy that drifts.
     The default is DARK, never Resolved: an unrecognised reading is a reading this module
     cannot vouch for, and claiming it resolved would assert a measurement nobody took. */
  function legTokenLabel(reading) {
    if (!isPlainObject(reading)) return LEG_TOKEN_DARK;
    if (reading.shape === "dark") return LEG_TOKEN_DARK;
    if (reading.shape !== "measured" && reading.shape !== "carried") return LEG_TOKEN_DARK;
    if (reading.state === "partial") return LEG_TOKEN_PARTIAL;
    if (reading.state === "resolved") return LEG_TOKEN_RESOLVED;
    return LEG_TOKEN_DARK;
  }

  /* The vocabulary is CLOSED at the reader surface too. A kind this module carries no word for
     returns null so the renderer can refuse the row by name, rather than passing the raw kind
     through and printing a contract identifier at a reader. */
  function changeTokenLabel(kind) {
    if (kind === "levelCrossed") return CHANGE_TOKEN_LEVEL_CROSSED;
    if (kind === "stateFlipped") return CHANGE_TOKEN_STATE_FLIPPED;
    if (kind === "flagRaised") return CHANGE_TOKEN_FLAG_RAISED;
    if (kind === "flagCleared") return CHANGE_TOKEN_FLAG_CLEARED;
    if (kind === "baseline") return CHANGE_TOKEN_BASELINE;
    if (kind === null || kind === undefined) return CHANGE_TOKEN_UNCHANGED;
    return null;
  }

  return {
    MEASUREMENT_CONTRACT: MEASUREMENT_CONTRACT,
    LEG_CONTRACT: LEG_CONTRACT,
    DARK_CONTRACT: DARK_CONTRACT,
    MIN_LEG_SESSIONS: MIN_LEG_SESSIONS,
    measureDefaultVisible: measureDefaultVisible,
    budgetViolations: budgetViolations,
    selectDefaultVisible: selectDefaultVisible,
    resolveLeg: resolveLeg,
    darkState: darkState,
    changeKind: changeKind,
    rollUpFrom: rollUpFrom,
    rollUpBalances: rollUpBalances,
    legTokenLabel: legTokenLabel,
    changeTokenLabel: changeTokenLabel
  };
});
