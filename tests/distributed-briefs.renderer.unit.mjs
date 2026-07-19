/*
 * Feature 002 Scope 10 — TP-10-01 UI unit (node --test).
 * Exercises the pure rlbrief.js shared layer (loaded with document=undefined): exact state
 * vocabulary labels, safe-link classification, four distinct clocks, profile boundaries, and
 * fail-closed contract parsing over REAL fixture bytes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildGraph } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
function loadRlbrief() {
    const src = readFileSync(join(ROOT, 'rlbrief.js'), 'utf8');
    return Function('globalThis', 'window', 'document', `${src}\n;return globalThis.RLBRIEF;`)(globalThis, globalThis, undefined);
}

test('shared primitives emit exact labels escaped text safe links clocks and profile boundaries', () => {
    const RB = loadRlbrief();

    // BriefMount is DOM-only and must NOT leak into the Node pure layer.
    assert.equal(typeof RB.BriefMount, 'undefined');

    // ── exact state-vocabulary labels (spec.md / scope.md matrix) ──
    assert.equal(RB.briefIndicativeLabel('pre-market'), 'Pre-market - indicative');
    assert.equal(RB.briefIndicativeLabel('after-hours'), 'After-hours - indicative');
    assert.equal(RB.briefIndicativeLabel('regular'), 'Regular session - partial');
    assert.equal(RB.briefOfficialCloseLabel(), 'Official close');
    assert.equal(RB.briefReportStateLabel('upcoming'), 'Not released');
    assert.equal(RB.briefReportStateLabel('disputed'), 'Disputed sources');
    assert.equal(RB.briefLowNoiseLabel(), 'Context only - action gate not met');
    assert.equal(RB.briefStatusLabel('not-applicable'), 'Session evidence not applicable to this profile');
    assert.equal(RB.briefLoadStateText('integrity-error'), 'Could not verify this brief; showing no partial evidence');
    assert.equal(RB.briefLoadStateText('empty'), 'No published brief yet.');
    assert.equal(RB.briefLastVerifiedLabel(), 'Last verified publication');
    assert.equal(RB.briefCalendarLabel('holiday', 'Independence Day').indexOf('Market holiday') === 0, true);
    assert.equal(RB.briefVolumeStateLabel('observed-zero'), 'Observed zero volume');
    assert.equal(RB.briefComparableStateLabel('thin', 'not-qualified'), 'Thin sample - not qualified for an anomaly');

    // ── profile honesty boundaries ──
    assert.equal(RB.briefProfileBoundary('off-theme'), 'excluded: off-theme');
    assert.equal(RB.briefProfileBoundary('live-market'), '');
    assert.ok(RB.briefProfileBoundary('static-model').indexOf('Committed projection') === 0);

    // ── safe-link classifier (reject unsafe schemes, protocol-relative, credentialed, malformed) ──
    assert.equal(RB.briefClassifyLink('javascript:alert(1)').kind, 'unsafe');
    assert.equal(RB.briefClassifyLink('data:text/html,<b>x</b>').kind, 'unsafe');
    assert.equal(RB.briefClassifyLink('//evil.example/x').kind, 'unsafe');
    assert.equal(RB.briefClassifyLink('https://user:pass@bls.gov/x').kind, 'unsafe');
    assert.equal(RB.briefClassifyLink('http://bls.gov/x').kind, 'unsafe');
    assert.equal(RB.briefClassifyLink('https://www.bls.gov/schedule').kind, 'https-citation');
    assert.equal(RB.briefClassifyLink('sector-research-lab.html', { allowHtml: true }).kind, 'registry-path');
    assert.equal(RB.briefClassifyLink('briefs/objects/reads/x/y.json').kind, 'registry-path');
    assert.equal(RB.briefClassifyLink('briefs/../secret').kind, 'unsafe');

    // ── four distinct clocks, never collapsed ──
    const clocks = RB.briefClockLabels({ evaluatedAt: 'e', modelAsOf: 'm', sourceAsOf: 's', freshUntil: 'f' });
    assert.deepEqual(clocks.map((c) => c.label), ['Evaluated', 'Model as-of', 'Source as-of', 'Fresh until']);
    assert.deepEqual(clocks.map((c) => c.value), ['e', 'm', 's', 'f']);

    // ── byte-cap + safe slug ──
    assert.equal(RB.briefSafeSlug('briefs/objects/final-briefs/x.json'), true);
    assert.equal(RB.briefSafeSlug('/etc/passwd'), false);
    assert.equal(RB.briefSafeSlug('briefs/x/../y.json'), false);
    assert.equal(RB.briefHashEqual('sha256:' + 'a'.repeat(64), 'A'.repeat(64)), true);
    assert.equal(RB.briefHashEqual('sha256:' + 'a'.repeat(64), 'b'.repeat(64)), false);

    // ── fail-closed contract parsing over REAL fixture bytes ──
    const g = buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' });
    const pointerText = g.files.get('briefs/current.json');
    const pointer = RB.briefParsePointer(pointerText);
    assert.equal(pointer.ok, true);
    // coverage IDs are DERIVED from the source map, matching the registry-derived source count.
    assert.equal(RB.briefPointerCoverage(pointer.value).length, g.sourceCount);

    const readText = g.files.get('briefs/objects/reads/sector-research-lab/read.json');
    const read = RB.briefParseRead(readText);
    assert.equal(read.ok, true);
    // authored summary is preserved verbatim as a string (DOM renders it via textContent).
    assert.equal(typeof read.value.summary, 'string');

    const briefText = g.files.get('briefs/objects/tool-briefs/sector-research-lab/brief.json');
    assert.equal(RB.briefParseBrief(briefText, read.value).ok, true);
    // a market recommendation on an INELIGIBLE read is rejected.
    const ineligible = Object.assign({}, read.value, { recommendationEligibility: { eligible: false }, profile: 'live-market' });
    assert.equal(RB.briefParseBrief(briefText, ineligible).ok, false);

    // tampered contract version / generation / source cardinality are rejected.
    const badVersion = JSON.parse(pointerText); badVersion.contractVersion = 'brief-current-pointer/v2';
    assert.equal(RB.briefParsePointer(JSON.stringify(badVersion)).ok, false);
    const badGen = JSON.parse(pointerText); badGen.generation = 0;
    assert.equal(RB.briefParsePointer(JSON.stringify(badGen)).ok, false);
    const badCard = JSON.parse(pointerText); delete badCard.sources[Object.keys(badCard.sources)[0]];
    assert.equal(RB.briefParsePointer(JSON.stringify(badCard)).ok, false);

    // evidence objects parse by kind; a wrong contractVersion is rejected.
    const aggText = g.files.get('briefs/objects/evidence/sessions/SPY/agg-pre-market.json');
    assert.equal(RB.briefParseEvidence(aggText, 'session-aggregate').ok, true);
    assert.equal(RB.briefParseEvidence(aggText, 'released-report-evidence').ok, false);

    // a malformed JSONL partition suppresses the entire chronology (fail-closed).
    assert.equal(RB.briefParsePartition('{"eventType":"authored"}\n{bad', 'tools/x').ok, false);
    assert.equal(RB.briefParsePartition('{"eventType":"authored","occurredAt":"t"}', 'evidence').ok, true);
});
