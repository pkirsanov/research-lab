/**
 * D13 vocabulary — the ONE list of framework words that must never reach a reader.
 *
 * This module exists because the rule had two independent enforcers and only one list.
 * `scripts/audit-reader-legibility.mjs` owned the patterns and ran against RENDERED pages;
 * `scripts/validate-brief-payload.mjs` guarded the PUBLISH path and knew nothing about
 * vocabulary at all. A generator could therefore emit a status code, sail through the
 * publish gate, and only be caught later by a browser audit nobody runs on the 4x/day cron.
 * Both enforcers now import from here, so the list cannot drift apart.
 *
 * Two surfaces, one list:
 *   - rendered page text  -> findReaderVocabularyLeaks()      (audit-reader-legibility.mjs)
 *   - brief payload prose -> findBriefNarrativeVocabularyLeaks() (validate-brief-payload.mjs)
 */

/* Each pattern is a leak of framework vocabulary into product copy. `label` is what
   gets reported; `re` is what proves it. Kept literal so a finding is never inferred.

   `blocksPublication` marks the classes the brief publish gate enforces on narrative
   payload fields. It is deliberately NOT every class: `compute-digest` and
   `contract-version` are provenance, and provenance is legitimate evidence in a Power
   view AND in toolCoverage[].reason, which already carries a real sha256 today. Turning
   those on in the publish gate would block a payload that is not actually leaking. The
   status/dependency classes have no such legitimate narrative use — a reader never needs
   the code, only the plain words. */
export const READER_VOCABULARY_LEAKS = [
  { id: 'compute-digest', label: 'compute-identity digest', re: /sha256:[0-9a-f]{8,}/, blocksPublication: false },
  { id: 'gate-code', label: 'gate/refusal code', re: /\bE0\d{2}-[A-Z]/, blocksPublication: false },
  { id: 'dependency-slug', label: 'dependency slug', re: /dependency-pending|feature-0\d{2}\b/, blocksPublication: true },
  { id: 'withheld-list', label: 'withheld-capability list', re: /\bWithheld:/, blocksPublication: false },
  { id: 'acceptance-gate', label: 'acceptance-gate predicate', re: /\bAcceptance gate:/, blocksPublication: false },
  { id: 'scope-number', label: 'Bubbles scope number', re: /\bScope \d{1,2}\b/, blocksPublication: false },
  { id: 'generic-heading', label: 'generic Simple heading', re: /\bSimple model result\b/, blocksPublication: false },
  { id: 'contract-unit', label: 'raw contract id as a unit', re: /\b[a-z]+-[a-z]+-(decimal|ratio|score|count|bps)\b/, blocksPublication: false },
  { id: 'contract-version', label: 'contract version slug', re: /\b[a-z-]+\/v\d\b/, blocksPublication: false },
  { id: 'integration-state', label: 'integration-state jargon', re: /not-integrated|coverage-only/, blocksPublication: true }
];

/* D13 puts provenance in Power on purpose. A compute digest or a contract version is
   evidence there, not a leak; everywhere else it is framework vocabulary in reader copy. */
export const PROVENANCE_LEAK_IDS = new Set(['compute-digest', 'contract-version']);

export const PUBLICATION_BLOCKING_LEAKS = READER_VOCABULARY_LEAKS.filter((leak) => leak.blocksPublication);

/**
 * Rendered-page surface. `view` is the activated view label, or null when the page
 * exposes none; provenance is tolerated only in Power.
 */
export function findReaderVocabularyLeaks(text, view) {
  const provenanceAllowed = view === 'Power';
  const found = [];
  for (const leak of READER_VOCABULARY_LEAKS) {
    if (provenanceAllowed && PROVENANCE_LEAK_IDS.has(leak.id)) continue;
    const m = text.match(leak.re);
    if (m) found.push({ id: leak.id, label: leak.label, sample: m[0] });
  }
  return found;
}

/* The brief payload mixes two kinds of string in the same object, sometimes under the
   SAME key name: watchlistNotes.<ticker>.status is 1600 characters of prose a reader
   reads, while toolCoverage[].status is the machine enum 'analyzed'|'stale'|'not-relevant'.
   A key-name rule would either miss the prose or condemn the enum, so the split is by
   PATH and both sides are declared from the committed payload's actual shape.

   Path grammar: segments joined by '.', array elements are '[]', '*' matches exactly one
   segment (a tool id, a ticker), a trailing '**' matches the node and everything below it.

   Split REQUIRED/OPTIONAL because two different questions were being conflated. "Does this
   pattern name a field that exists?" is a real defect if the answer is no — it silently
   shrinks D13 coverage — and the committed payload answers it. "Is this optional field
   populated in today's publish?" is not a defect either way, so asking the payload turned
   an ordinary cron publish red. Both lists are still proven real; see the optional list
   for how. */
export const BRIEF_NARRATIVE_FIELDS_REQUIRED = [
  'dataAsOf.*',
  /* '*' matches exactly one segment, so `dataAsOf.*` covers the four long freshness
     narratives but NOT the condensed labels nested one level below them. Same reader,
     same copy, one segment deeper — they need their own pattern to be guarded. */
  'dataAsOf.labels.*',
  'regime.name',
  'regime.scoreNote',
  'regime.crowdPsychology',
  /* The brief author writes a regime-scoped macro read alongside the structural backdrop.macroCycle.
     It is reader prose, so it is declared here and leak-checked like its siblings; leaving it
     undeclared is what the 200-character coverage gate caught. */
  'regime.macroCycle',
  'regime.structuralTrend',
  'regime.pricedIn',
  'regime.asymmetry',
  'regime.falsifiers',
  'regime.note',
  'regime.levels.*',
  'regime.vix.regimeLabel',
  'regime.vix.falsifier',
  'backdrop.primaryTrend',
  'backdrop.macroCycle',
  'backdrop.pricedIn',
  'backdrop.asymmetry',
  'backdrop.trendEvidence.**',
  'backdrop.globalBackdrop.**',
  'backdrop.whatWouldChangeIt.**',
  'backdrop.structuralLevels.**',
  'nextSession.thesis',
  'nextSession.actions.[].subject',
  'nextSession.actions.[].rationale',
  'nextSession.actions.[].structuralAnchor',
  'nextSession.actions.[].trigger',
  'nextSession.actions.[].invalidation',
  /* `instrument` was left undeclared while every sibling was guarded, on the
     assumption that it names an instrument and stays short. The 16:55 refresh
     wrote 213 characters into it — "SPY core (hold overnight into the 8/11
     session; dealers closed positive-gamma …)" — which is reader prose the
     brief renders verbatim, so it belongs under the vocabulary gate rather than
     outside it. Declaring it guards the field; leaving it undeclared would have
     let the next run put a status code in front of the reader unchecked. */
  'recommendations.[].instrument',
  'recommendations.[].structuralAnchor',
  'recommendations.[].levels',
  'recommendations.[].trigger',
  'recommendations.[].invalidation',
  'recommendations.[].rationale',
  'events.[].event',
  'events.[].consensus',
  'events.[].psychologyNote',
  'events.[].scenarios.[].name',
  'events.[].scenarios.[].expectedEffect',
  'psychology.*',
  'groups.[].label',
  'groups.[].note',
  'groups.[].notable.[].reason',
  'toolReads.*.read',
  'toolCoverage.[].reason',
  'watchlistNotes.*.status'
];

/* Real, reader-facing, and guarded exactly like the required patterns — but only PRESENT
   in some publishes. A tool read carries a limitation or an ineligibility reason only
   sometimes (`limitations` last appeared in 82214794, 96779edd, 09ecdba1), and the brief
   carries an `experimental` item only when the lane finds a genuinely new pattern — len=1
   in 1daff325 and 798c365e, len=0 in f67501ae and a6081edf, i.e. it flips both ways rather
   than having regressed. Demanding a live instance would fail a healthy publish.

   They are still proven real, just against the PRODUCER instead of one instance: the
   selftest requires every concrete segment below to appear as a token in that pattern's
   own `producer`. The producer is per-pattern because the optional list spans two lanes
   whose sources are disjoint — brief-refresh.mjs never mentions `experimental`, and
   brief-narrative-parallel.mjs never mentions `limitations` — so a single shared producer
   constant could not prove both halves.

   This proof is weaker than a live instance: a leaf whose name collides with an unrelated
   token in the producer passes. Two of the seven below do exactly that — `title` collides
   with the tools-registry `tool.title` and `note` with the watchlist note instruction, so
   only `experimental` and `method` are named by the lane's own contract. Their real
   warrant is a live payload instance in history (798c365e carries title/note/method/inputs);
   they are optional because that instance is not in TODAY's payload, not because the field
   is doubtful. That residual weakness is why this list stays tiny and why the selftest holds
   it to a structural contract — every entry proven against its own named producer, no
   duplicate patterns, and no pattern classified required and optional at once. Move a pattern
   here ONLY because it is intermittently emitted, NEVER to silence a red required pattern. */
export const BRIEF_NARRATIVE_FIELDS_OPTIONAL = [
  { pattern: 'toolReads.*.limitations.[]', producer: 'scripts/brief-refresh.mjs' },
  { pattern: 'toolReads.*.recommendationEligibility.reason', producer: 'scripts/brief-refresh.mjs' },
  { pattern: 'experimental.[].title', producer: 'scripts/brief-narrative-parallel.mjs' },
  { pattern: 'experimental.[].note', producer: 'scripts/brief-narrative-parallel.mjs' },
  { pattern: 'experimental.[].pattern', producer: 'scripts/brief-narrative-parallel.mjs' },
  { pattern: 'experimental.[].method', producer: 'scripts/brief-narrative-parallel.mjs' },
  /* A cross-asset leg is dark only when its driver cannot be measured or its source is not
     approved, so the reason is intermittent by design — an approved FX source would empty
     this array. It is reader prose and is leak-checked like its siblings: rlcockpit.js READS
     the sentence from the owning model rather than composing one, so a leak here is the
     owning model's to fix, not a gloss this list should tolerate. */
  { pattern: 'crossAsset.dark.[].reason', producer: 'rlcockpit.js' },
  /* A generation may validly refuse every attention candidate. Legacy feed prose is rendered
     by rlbrief.js when present; certified item prose is emitted by rlattention.js. Both remain
     guarded for vocabulary leaks, but neither is required to appear in every payload. */
  { pattern: 'attention.[].title', producer: 'rlbrief.js' },
  { pattern: 'attention.[].what', producer: 'rlbrief.js' },
  { pattern: 'attention.[].why', producer: 'rlbrief.js' },
  { pattern: 'attention.[].structuralAnchor', producer: 'rlbrief.js' },
  { pattern: 'attention.[].rationale', producer: 'rlattention.js' },
  { pattern: 'attention.[].invalidation', producer: 'rlattention.js' },
  { pattern: 'attention.[].escalationTrigger', producer: 'rlattention.js' },
  /* Conditional and complementary by contract: rlattention.js checkConfirmation demands
     `detail` only when the confirmation state is 'present', and the note only when it is NOT.
     Today's payload happens to carry both (states present/partial/partial), which is what made
     declaring them required look safe. It is not: a healthy publish in which every item is
     confirmed nulls every note, and one in which no unconfirmed item carries authored detail
     nulls every detail. Either turns a required pattern red on a GOOD publish — precisely the
     false alarm this list exists to prevent.
     Producer is rlattention.js rather than the assembling script because that is where these
     leaves are named and their conditionality is defined; scripts/build-attention-items.mjs
     forwards the item wholesale and never mentions `detail` at all, so it could not prove the
     pattern real. Both stay narrative here, so the vocabulary gate covers them exactly as
     before — only the proof of realness moves. */
  { pattern: 'attention.[].marketConfirmation.detail', producer: 'rlattention.js' },
  { pattern: 'attention.[].marketConfirmationNote', producer: 'rlattention.js' }
];

/* The leak gate guards required and optional fields identically. The split governs only how
   each is proven to be real, never whether it is checked for framework vocabulary. */
export const BRIEF_NARRATIVE_FIELDS = [
  ...BRIEF_NARRATIVE_FIELDS_REQUIRED,
  ...BRIEF_NARRATIVE_FIELDS_OPTIONAL.map((entry) => entry.pattern)
];

/* Machine carriers. These are the fields a status code legitimately lives in —
   scripts/brief-distributed-publish.mjs sets outcome/applicabilityStatus to
   'coverage-only' and 'not-integrated' by design — plus the metrics subtree, which
   carries long machine strings (capability ids, adapter notes) that are not reader copy.
   Declared, not merely omitted, so the selftest can prove the payload has no long string
   that is neither reader prose nor declared machine state. */
export const BRIEF_STRUCTURED_FIELDS = [
  'toolCoverage.[].status',
  'toolReads.*.status',
  'toolReads.*.state',
  'toolReads.*.role',
  'toolReads.*.profile',
  'toolReads.*.contractVersion',
  'toolReads.*.fingerprint',
  'toolReads.*.adapter.**',
  'toolReads.*.ownerReadRef.**',
  'toolReads.*.metrics.**',
  'toolReads.*.recommendationEligibility.eligible',
  'experimental.[].id',
  'experimental.[].inputs.**',
  'groups.[].read.**',
  'groups.[].breadth.**'
];

function segmentsMatch(pattern, segments) {
  const patternSegments = pattern.split('.');
  const openEnded = patternSegments[patternSegments.length - 1] === '**';
  const fixed = openEnded ? patternSegments.slice(0, -1) : patternSegments;
  if (openEnded ? segments.length < fixed.length : segments.length !== fixed.length) return false;
  return fixed.every((part, index) => part === '*' || part === segments[index]);
}

export function matchesFieldPatterns(patterns, segments) {
  return patterns.some((pattern) => segmentsMatch(pattern, segments));
}

export function isBriefNarrativeField(segments) {
  return matchesFieldPatterns(BRIEF_NARRATIVE_FIELDS, segments);
}

/** Every string in the payload, as `{ segments, path, value }`. */
export function walkBriefStrings(payload) {
  const out = [];
  const visit = (node, segments) => {
    if (typeof node === 'string') {
      out.push({ segments, path: segments.join('.'), value: node });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, [...segments, '[]']));
      return;
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) visit(node[key], [...segments, key]);
    }
  };
  visit(payload, []);
  return out;
}

/**
 * Publish-path surface. Returns one finding per (narrative field, leak class) hit.
 *
 * A translated code kept as a gloss is still a leak: "no call this cycle (coverage-only;
 * does not feed the brief yet)" carries the plain words AND the code, and the code is the
 * part a reader cannot act on. The match is on the code alone, so the presence of a
 * correct translation beside it never excuses it.
 */
export function findBriefNarrativeVocabularyLeaks(payload) {
  const findings = [];
  for (const { segments, path, value } of walkBriefStrings(payload)) {
    if (!isBriefNarrativeField(segments)) continue;
    for (const leak of PUBLICATION_BLOCKING_LEAKS) {
      const match = value.match(leak.re);
      if (match) findings.push({ path, id: leak.id, label: leak.label, sample: match[0] });
    }
  }
  return findings;
}

/**
 * The regime and backdrop KEYS, rendered from the declared narrative list.
 *
 * The core lane was told to "name the regime and crowd psychology, structural
 * trend, macro cycle, priced-in view, asymmetry, levels, and falsifiers" — prose
 * that describes fields and names no key. Most regime/backdrop pairs share a
 * name (`macroCycle`, `pricedIn`, `asymmetry`), so the pattern predicts
 * `backdrop.structuralTrend`; the real backdrop key is `primaryTrend`. One run
 * in twelve duly wrote a third 741-character structural narrative under a key no
 * renderer reads, which the 200-character coverage gate caught. Naming the keys
 * from the declared list is the same fix `regime.macroCycle` got, one step
 * earlier: state the contract instead of catching the guess.
 */
export function briefBackdropKeysInstruction() {
  const own = (prefix) => BRIEF_NARRATIVE_FIELDS_REQUIRED
    .filter((field) => field.startsWith(prefix) && field.slice(prefix.length).indexOf('.') === -1)
    .map((field) => field.slice(prefix.length));
  /* The flat filter above drops every NESTED requirement, because `levels.*` and
     `trendEvidence.**` both carry a dot. The publish path requires them all the same, so an
     instruction built only from the flat names told the author less than the gate demanded:
     the 2026-08-29 morning window lost both attempts to `regime.levels.*`,
     `backdrop.trendEvidence.**`, `backdrop.globalBackdrop.**`, `backdrop.whatWouldChangeIt.**`
     and `backdrop.structuralLevels.**` — none of which this instruction had ever named. The
     author had been producing them by copying the shape of the prior payload, which works until
     the run it doesn't. Naming them here is what makes the requirement legible to its producer. */
  const nested = (prefix) => [...new Set(BRIEF_NARRATIVE_FIELDS_REQUIRED
    .filter((field) => field.startsWith(prefix) && field.slice(prefix.length).indexOf('.') !== -1)
    .map((field) => field.slice(prefix.length).split('.')[0]))];
  const regimeKeys = own('regime.');
  const backdropKeys = own('backdrop.');
  const regimeGroups = nested('regime.');
  const backdropGroups = nested('backdrop.');
  if (regimeKeys.length === 0 || backdropKeys.length === 0) {
    throw new Error('RLBRIEF-BACKDROP-KEYS: the declared regime/backdrop narrative keys are unreadable');
  }
  if (regimeGroups.length === 0 || backdropGroups.length === 0) {
    throw new Error('RLBRIEF-BACKDROP-KEYS: the declared regime/backdrop nested groups are unreadable');
  }
  const groupList = regimeGroups.map((key) => `regime.${key}`)
    .concat(backdropGroups.map((key) => `backdrop.${key}`))
    .join(', ');
  return `Author the regime block under exactly these keys: ${regimeKeys.join(', ')}. Author the `
    + `structural backdrop under exactly these: ${backdropKeys.join(', ')}. Most pairs share a name `
    + 'across the two blocks, but the backdrop\'s structural read is `primaryTrend`, not '
    + '`structuralTrend` — that one belongs to regime, and a third copy under any other key is '
    + 'carried by no renderer and reaches no reader. A key outside these lists is unguarded prose '
    + 'and fails the payload coverage gate. '
    + `These NESTED groups are required too, and each must carry at least one populated field: ${groupList}. `
    + 'They are required reader copy exactly like the flat keys above, and the publish path refuses '
    + 'the whole narrative when any one of them is absent or empty.';
}
