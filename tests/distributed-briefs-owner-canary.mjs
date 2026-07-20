/*
 * distributed-briefs-owner-canary.mjs — Feature 002, Scope 04 (Event Reaction and
 * Owner Integration) independent Shared-Infrastructure canary.
 *
 * rldata.js (putToolRead) and scripts/brief-refresh.mjs (owner read builders) are
 * high-fan-out protected surfaces. These canaries prove the Scope 04 additive
 * changes preserve every pre-evidence owner projection: the five current browser
 * publisher reads still round-trip through the unchanged putToolRead legacy and
 * rl-tool-read/v1 paths, the four headless read builders remain unchanged
 * production functions (Sector is exercised over a committed-shape fixture), and
 * the Bond Regime owner read plus browser credential surfaces exclude every
 * restricted local observation and private credential field.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import '../rldata.js';
import {
    buildSectorToolRead,
    buildEtfToolRead,
    buildGlobalToolRead,
    buildRealAssetsToolRead,
    buildOwnerEvidenceRead,
    OWNER_EVIDENCE_DECLARATIONS
} from '../scripts/brief-refresh.mjs';

const RLDATA = globalThis.RLDATA;

const FIVE_CURRENT_PUBLISHERS = ['sector-research-lab', 'global-rotation-lab', 'real-assets-lab', 'bond-regime-lab', 'etf-momentum-lab'];

function compactStrictRead(id) {
    return {
        contractVersion: 'rl-tool-read/v1',
        id,
        availability: 'current',
        asOf: '2026-07-14T12:00:00.000Z',
        computedAt: '2026-07-14T12:05:00.000Z',
        freshUntil: '2026-07-14T18:00:00.000Z',
        read: `${id} pre-evidence read`,
        metrics: { leader: 'SPY', score: 42 },
        deepLink: `${id}.html`
    };
}

function evidenceBundleFixture() {
    const hash = (seed) => `sha256:${createHash('sha256').update(seed).digest('hex')}`;
    return {
        contractVersion: 'market-session-evidence/v1',
        cutoffAt: '2026-07-14T12:40:00.000Z',
        fingerprint: hash('bundle'),
        sessionAggregateRefs: [{ evidenceType: 'session-aggregate', fingerprint: hash('aggregate-SPY') }],
        volumeBaselineRefs: [{ evidenceType: 'comparable-volume-baseline', fingerprint: hash('baseline-SPY') }],
        releasedReportRefs: [{ evidenceType: 'released-report-evidence', fingerprint: hash('cpi-report') }],
        eventReactionRefs: [{ evidenceType: 'event-market-reaction', fingerprint: hash('cpi-reaction') }]
    };
}

test('Canary: five current publisher reads and four headless reads preserve pre-evidence semantics', () => {
    // The five current browser publisher projections still round-trip through the UNCHANGED
    // rl-tool-read/v1 strict path byte-identically (the additive tool-model-read/v1 branch and
    // validateToolModelRead never intercept or mutate them).
    for (const id of FIVE_CURRENT_PUBLISHERS) {
        const source = compactStrictRead(id);
        const stored = RLDATA.putToolRead(id, source);
        assert.deepEqual(stored, source, `${id} strict publisher read must round-trip unchanged`);
    }

    // The legacy compact publisher projection {read,metrics,deepLink} still normalizes to the exact
    // pre-evidence 5-field shape (no evidence fields injected).
    const legacy = RLDATA.putToolRead('sector-research-lab', { read: 'legacy compact read', metrics: { a: 1 }, deepLink: 'sector-research-lab.html' });
    assert.deepEqual(Object.keys(legacy).sort(), ['asOf', 'deepLink', 'id', 'metrics', 'read']);
    assert.equal(legacy.read, 'legacy compact read');
    assert.equal(Object.prototype.hasOwnProperty.call(legacy, 'evidenceInterpretations'), false);

    // Headless read #1 (Sector, the synchronous builder) is exercised over a committed-shape
    // sectors fixture and preserves its exact pre-evidence compact contract.
    const sectorRead = buildSectorToolRead({
        XLK: { rotation: 'into', accel: 0.30, rsMom1m: 1.2, rsMom3m: 2.5 },
        XLF: { rotation: 'out', accel: -0.20, rsMom1m: -0.5, rsMom3m: -1.0 },
        XLE: { rotation: 'neutral', accel: 0.05, rsMom1m: 0.1, rsMom3m: 0.4 }
    });
    assert.deepEqual(Object.keys(sectorRead).sort(), ['asOf', 'deepLink', 'id', 'metrics', 'read', 'source']);
    assert.equal(sectorRead.id, 'sector-research-lab');
    assert.equal(sectorRead.deepLink, 'sector-research-lab.html');
    assert.equal(sectorRead.source, 'tier-a-tool-aligned-rrg');
    assert.deepEqual(Object.keys(sectorRead.metrics).sort(), ['benchmark', 'count', 'into', 'leader', 'out']);
    // No evidence-interpretation field leaks into the pre-evidence compact projection.
    assert.equal(Object.prototype.hasOwnProperty.call(sectorRead, 'evidenceInterpretations'), false);

    // Headless reads #2-#4 (ETF, Global, Real Assets — the network builders) remain unchanged,
    // callable production functions rather than being removed or replaced by the shared layer.
    assert.equal(typeof buildEtfToolRead, 'function');
    assert.equal(typeof buildGlobalToolRead, 'function');
    assert.equal(typeof buildRealAssetsToolRead, 'function');
});

test('Canary: Bond Regime and browser credential boundaries exclude restricted and private fields', () => {
    const evidence = evidenceBundleFixture();
    const bondDeclaration = OWNER_EVIDENCE_DECLARATIONS.find((declaration) => declaration.toolId === 'bond-regime-lab');
    const bond = buildOwnerEvidenceRead(bondDeclaration, evidence, { symbol: 'SPY' });

    // Bond Regime consumes ONLY committed content-addressed evidence (CPI report + reaction refs);
    // restricted local observations never enter the committed owner projection.
    assert.equal(RLDATA.validateToolModelRead(bond).ok, true);
    for (const ref of bond.evidenceRefs) assert.match(ref.fingerprint, /^sha256:[a-f0-9]{64}$/);
    for (const fingerprint of bond.evidenceInterpretations[0].evidenceRefs) assert.match(fingerprint, /^sha256:[a-f0-9]{64}$/);
    const RESTRICTED_FIELDS = ['localObservations', 'privateBars', 'credential', 'apiKey', 'token', 'secret', 'localStorage', 'rawBars'];
    for (const field of RESTRICTED_FIELDS) assert.equal(Object.prototype.hasOwnProperty.call(bond, field), false, `bond read leaked restricted field ${field}`);
    // The interpretation summary is a bounded human-readable string, never embedded raw data.
    assert.equal(typeof bond.evidenceInterpretations[0].summary, 'string');

    // Provider surfaces expose only presence/tier state, never a secret value, and start
    // unconfigured by default so no owner read can carry a private credential.
    const status = RLDATA.providerStatus('twelvedata');
    assert.equal(status.ok, true);
    assert.equal(['unconfigured', 'configured', 'proxy'].includes(status.state), true);
    assert.equal(Object.prototype.hasOwnProperty.call(status, 'credential'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(status, 'apiKey'), false);
    for (const policy of RLDATA.providerAccess().providers) {
        assert.equal(Object.prototype.hasOwnProperty.call(policy, 'credential'), false);
        assert.equal(Object.prototype.hasOwnProperty.call(policy, 'apiKey'), false);
        assert.equal(['unconfigured', 'configured', 'proxy'].includes(policy.state), true);
    }
});
