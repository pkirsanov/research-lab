/*
 * tests/recommendation-track-record.integration.mjs — Feature 015, scope 02 integration rows
 * T-02-I1 and T-02-I2.
 *
 * Where the unit and functional rows assert the contract against sampled rows, these two assert it
 * against the COMMITTED LEDGER ITSELF and against a real filesystem append. That is the whole
 * point: a reader can agree with every fixture a test author chose and still refuse a shape that
 * only exists on disk.
 *
 * Two conventions carry both rows. No count is written as a literal — the partition total, the
 * per-version split and the refused-by-a-v1-only-reader total are all READ from the file, so a
 * reader that silently skipped a shape cannot pass by the test agreeing with it. And nothing is
 * written inside the repository: the append round-trip runs in a disposable directory under the OS
 * temp dir, and both rows assert the committed bytes are unchanged after the read.
 *
 * Nothing here reads a clock and nothing here mutates the validator; T-02-I1 asserts the validator
 * source digest is identical before and after the sweep, so a row that "passed" by editing the
 * thing under test fails instead.
 */

import assert from 'node:assert/strict';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet } from '../scripts/brief-publication.mjs';
import {
    fenceObservations,
    loadCalendar,
    outcomeValueFor,
    readBars,
    recordResolution,
} from '../scripts/brief-resolve-outcomes.mjs';
import { loadInstrumentUniverse, recommendationRowsFromPayload } from '../scripts/recommendation-body.mjs';
import { attachClaimRefs } from '../scripts/recommendation-claim-mint.mjs';
import { buildRun } from './fixtures/feature-002/history/history-fixture-builder.mjs';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    committedSeries,
    foundationSourceText,
    loadClaimFixture,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    withDisposableStore,
} from './recommendation-track-record.support.mjs';

const claims = loadClaimsModule();

/** The one partition T-02-I1 names, and the relative path an append round-trip reproduces. */
const PARTITION_REL = path.join('briefs', 'history', 'recommendations', '2026-07.jsonl');
const PARTITION_ABS = path.join(REPO_ROOT, PARTITION_REL);
const VALIDATOR_ABS = path.join(REPO_ROOT, 'rlclaims.js');

function nonEmptyLines(text) {
    return text.split('\n').filter((line) => line.trim().length > 0);
}

/** A deterministic, module-produced pointer. Never a hand-typed digest. */
function pointerFor(row) {
    return claims.stableSha({ contractVersion: claims.CONTRACT_VERSION, eventId: row.eventId });
}

/**
 * The reader as it stood under the SUPERSEDED plan: `v1` only. Used as the anti-vacuity control —
 * the count it refuses must be exactly the committed `v2` count, and non-zero. Without it, "every
 * row validated" would also hold for a reader that had never been extended.
 */
function validateAsV1OnlyReader(row) {
    if (row.contractVersion !== claims.ROW_CONTRACT_V1) {
        return { ok: false, error: { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'row-contract-version-not-allowed', field: 'contractVersion' } };
    }
    return claims.validateLedgerRow(row);
}

test('T-02-I1: every committed row of both versions validates unchanged, at a count read from the file', () => {
    const validatorBefore = claims.sha256Hex(readFileSync(VALIDATOR_ABS, 'utf8'));
    const bytesBefore = readBytes(PARTITION_ABS);
    assert.ok(bytesBefore, `the committed partition must exist at ${PARTITION_REL}`);

    // THE COUNT IS READ, never asserted as a literal.
    const lines = nonEmptyLines(bytesBefore);
    const rowCount = lines.length;
    assert.equal(rowCount > 0, true, 'the committed partition must be non-empty for this row to mean anything');

    let validated = 0;
    const byVersion = new Map();
    for (let index = 0; index < rowCount; index += 1) {
        const row = JSON.parse(lines[index]);
        const outcome = claims.validateLedgerRow(row);
        assert.equal(outcome.ok, true, `line ${index + 1}: ${JSON.stringify(outcome.error)}`);
        validated += 1;
        byVersion.set(row.contractVersion, (byVersion.get(row.contractVersion) ?? 0) + 1);
    }

    // THE ASSERTION: not "some validated" but "as many as the file holds".
    assert.equal(validated, rowCount, 'the validated count must equal the count read from the file');

    /* Both versions are genuinely present, and their split accounts for every line — a partition
       that had drifted to one version would make the dual-version claim vacuous. */
    const versions = [...byVersion.keys()].sort();
    assert.deepEqual(versions, [claims.ROW_CONTRACT_V1, claims.ROW_CONTRACT_V2].sort(), 'both contract versions must be present');
    assert.equal(
        [...byVersion.values()].reduce((sum, n) => sum + n, 0),
        rowCount,
        'the per-version split must account for every line',
    );
    for (const version of versions) {
        assert.equal(byVersion.get(version) > 0, true, `${version}: must contribute rows`);
    }

    /* ANTI-VACUITY. The v1-only reader of the superseded plan refuses exactly the v2 rows. If the
       dual-version acceptance were reverted, the equality above would fail by this many. */
    let refusedByV1Only = 0;
    for (const line of lines) {
        if (validateAsV1OnlyReader(JSON.parse(line)).ok !== true) refusedByV1Only += 1;
    }
    assert.equal(refusedByV1Only, byVersion.get(claims.ROW_CONTRACT_V2), 'a v1-only reader refuses exactly the v2 rows');
    assert.equal(refusedByV1Only > 0, true, 'and that set is non-empty, so the extension is load-bearing');

    // Nothing was written, and nothing under test was edited to make the sweep pass.
    assertBytesUnchanged(bytesBefore, readBytes(PARTITION_ABS), `${PARTITION_REL} bytes`);
    assert.equal(claims.sha256Hex(readFileSync(VALIDATOR_ABS, 'utf8')), validatorBefore, 'the validator source must be unmodified by this row');
});

/** A fully authored action, so the run under append genuinely mints a claim. */
function authoredAction(symbol) {
    return {
        action: 'trim',
        subject: `Trim ${symbol} into the event print`,
        horizon: 'next-session',
        trigger: `${symbol} closes below 100`,
        invalidation: `${symbol} closes above 120`,
        deepLink: 'sector-research-lab.html',
        confidence: 55,
        claim: {
            subjectKind: 'instrument',
            resolvesTo: [symbol],
            thesisFamily: 'positioning-unwind',
            horizonKind: 'event-bound',
            eventRef: 'fixture-event-2026-07-15',
            predicate: { kind: 'threshold', basis: 'close', comparator: 'lte', value: 100 },
            flatBand: 0.25,
            priceBasis: 'adjusted-close',
        },
    };
}

const APPEND_RUN_FINGERPRINT = claims.stableSha({ fixture: 'T-02-I2 run fingerprint' });
const APPEND_OCCURRED_AT = '2026-07-14T12:40:00.000Z';

function appendEventIdFor(recommendationKey, index) {
    return claims.stableSha({
        contractVersion: 'brief-distributed-eventid/v1',
        runFingerprint: APPEND_RUN_FINGERPRINT,
        recommendationKey,
        index,
    });
}

/** The bytes the REAL writer appends for a run — never a string this test formatted itself. */
function appendedBytesForRun(events) {
    const built = buildPublishSet(buildRun({ recommendationEvents: events }));
    assert.equal(built.ok, true, 'the publish set must build for the append to be a real round-trip');
    const partition = Object.keys(built.staging.historyPartitions).find((p) => p.includes('/recommendations/'));
    assert.ok(partition, 'the publish set must carry a recommendation partition');
    return built.staging.historyPartitions[partition].appendedBytes;
}

test('T-02-I2: a mixed partition round-trips append-only with the prior bytes byte-identical', () => {
    const committedBefore = readBytes(PARTITION_ABS);
    const committedRows = nonEmptyLines(committedBefore).map((line) => JSON.parse(line));

    /* The prior partition is REAL: pre-contract rows of both versions, taken verbatim from the
       committed ledger, so what is preserved across the append is what is actually on disk. */
    const priorRows = [
        committedRows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V1),
        committedRows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V2),
    ];
    assert.ok(priorRows[0] && priorRows[1], 'the committed ledger must carry a pre-contract row of each version');
    for (const row of priorRows) {
        assert.equal(Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD), false, 'the prior rows must be pre-contract');
    }

    const symbol = committedSeries()[0];
    assert.ok(symbol, 'the committed bars set must be non-empty');
    const payload = { nextSession: { actions: [authoredAction(symbol)] }, recommendations: [] };
    const events = attachClaimRefs(
        recommendationRowsFromPayload(payload, {
            root: REPO_ROOT,
            occurredAt: APPEND_OCCURRED_AT,
            universe: loadInstrumentUniverse(REPO_ROOT),
            eventIdFor: appendEventIdFor,
        }).map((event) => ({ ...event, bodySource: 'next-session-action' })),
        payload,
        { root: REPO_ROOT, proposalRunId: 'dist-2026-07-14-append', proposedAt: APPEND_OCCURRED_AT },
    );
    const appended = appendedBytesForRun(events);
    const appendedRows = nonEmptyLines(appended.toString('utf8')).map((line) => JSON.parse(line));
    assert.equal(
        appendedRows.some((row) => Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD)),
        true,
        'the appended block must genuinely carry a claimRef — otherwise this row proves nothing about the extension',
    );

    withDisposableStore(({ root }) => {
        assert.equal(root.startsWith(REPO_ROOT), false, 'the round-trip must run outside the repository');
        const partitionPath = path.join(root, PARTITION_REL);
        mkdirSync(path.dirname(partitionPath), { recursive: true });

        const priorBytes = Buffer.from(`${priorRows.map((row) => claims.stableStringify(row)).join('\n')}\n`, 'utf8');
        writeFileSync(partitionPath, priorBytes);
        const onDiskBefore = readFileSync(partitionPath);
        assert.ok(onDiskBefore.equals(priorBytes), 'the prior partition must land on disk verbatim');

        appendFileSync(partitionPath, appended);
        const onDiskAfter = readFileSync(partitionPath);

        // THE ASSERTION: the prior bytes are an EXACT prefix, so no history was rewritten.
        assert.ok(
            onDiskAfter.subarray(0, onDiskBefore.length).equals(onDiskBefore),
            'the prior bytes must be byte-identical after the append',
        );
        assert.equal(onDiskAfter.length > onDiskBefore.length, true, 'and the partition must have grown');

        const finalRows = nonEmptyLines(onDiskAfter.toString('utf8')).map((line) => JSON.parse(line));
        assert.equal(finalRows.length, priorRows.length + appendedRows.length, 'every prior and appended row survives');
        for (const row of finalRows) {
            assert.equal(claims.validateLedgerRow(row).ok, true, 'every row in the round-tripped partition must validate');
        }
        for (let i = 0; i < priorRows.length; i += 1) {
            assert.equal(
                Object.prototype.hasOwnProperty.call(finalRows[i], claims.CLAIM_REF_FIELD),
                false,
                `prior row ${i}: must still be claimless — the append back-fills nothing`,
            );
            assert.equal(claims.stableStringify(finalRows[i]), claims.stableStringify(priorRows[i]), `prior row ${i}: unchanged`);
        }

        /* ANTI-VACUITY. A null-filling REWRITE of the same rows — the migration this scope forbids —
           produces a partition whose prefix is NOT the prior bytes. So the prefix comparison above
           can fail, and fails on exactly the behaviour it exists to exclude. */
        const rewritten = Buffer.from(
            `${priorRows.map((row) => claims.stableStringify({ ...row, [claims.CLAIM_REF_FIELD]: null })).join('\n')}\n`,
            'utf8',
        );
        assert.equal(
            rewritten.subarray(0, onDiskBefore.length).equals(onDiskBefore),
            false,
            'a null-filling rewrite must NOT satisfy the prefix assertion',
        );
    });

    assertBytesUnchanged(committedBefore, readBytes(PARTITION_ABS), `${PARTITION_REL} bytes`);
});

/* ── Scope 04, increment 3 ────────────────────────────────────────────────────────────────
   The resolver's write path against a REAL filesystem, in a disposable root outside the
   repository. Two properties only a real store can show: what happens when the same claim is
   resolved twice, and that scope 02's gate runs before the resolution is inspected at all.

   The predicate evaluators and the reducer bridge are later increments, so the closure verdict
   and the lifecycle ids arrive as inputs and both rows carry an `(increment 3)` marker. */

const BARS_FIXTURE_DIR = path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record', 'bars');
const ENTRY_SESSION = '2026-07-28';
const RESOLUTION_SESSION = '2026-07-29';

function fixtureBarsText(symbol) {
    return readFileSync(path.join(BARS_FIXTURE_DIR, `${symbol}.json`), 'utf8');
}

/** Fences for one fixture series, keyed by `seriesRef` exactly as `subjectReturn` reads them. */
function fencesFor(barsText) {
    const bars = readBars(barsText);
    return new Map([[claims.seriesRefFor(bars.sym), fenceObservations(loadCalendar(REPO_ROOT), bars, RESOLUTION_SESSION)]]);
}

/** A minted claim over a fixture series, on the two fixture sessions. */
function fixtureClaim(symbol, priceBasis) {
    const fixture = structuredClone(loadClaimFixture('evaluable-instrument-add'));
    fixture.input.action.claim.resolvesTo = [symbol];
    fixture.input.action.claim.weighting = 'primary-only';
    fixture.input.action.claim.priceBasis = priceBasis;
    fixture.input.binding.entryDate = ENTRY_SESSION;
    fixture.input.binding.resolutionDate = RESOLUTION_SESSION;
    const minted = claims.mintClaim(mintInputFrom(fixture, { committedSeries: [symbol] }));
    assert.equal(minted.ok && minted.claim.notEvaluable, null, `${symbol}: the fixture claim must mint evaluable`);
    return minted.claim;
}

function resolverInput(claim, outcome, overrides = {}) {
    return {
        claim,
        calendar: loadCalendar(REPO_ROOT),
        closureVocabulary: claims.readClosureEventVocabulary(foundationSourceText()),
        closureEventType: 'satisfied',
        reasonCode: 'predicate-satisfied',
        outcome,
        eventId: 'sha256:'.concat('7'.repeat(64)),
        lifecycleBinding: { originRecommendationKey: 'sha256:'.concat('8'.repeat(64)) },
        ...overrides,
    };
}

/** A committed ledger row re-pointed at the claim under resolution. */
function rowFor(claim) {
    const row = nonEmptyLines(readBytes(PARTITION_ABS))
        .map((line) => JSON.parse(line))
        .find((candidate) => candidate.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(row, 'the committed partition must carry a v2 row');
    return { ...row, [claims.CLAIM_REF_FIELD]: claim.claimHash };
}

test('T-04-I4 (increment 3): re-resolving is a byte-identical no-op, a changed unhashed field conflicts, and a moved basis lands at a new address', () => {
    const committedBefore = readBytes(PARTITION_ABS);
    const claim = fixtureClaim('DVG', 'adjusted-close');
    const outcome = outcomeValueFor(claim, fencesFor(fixtureBarsText('DVG')));
    assert.equal(outcome.ok, true, `the fixture must resolve: ${JSON.stringify(outcome.error ?? outcome.closure)}`);
    const row = rowFor(claim);

    withDisposableStore(({ root, ports }) => {
        const storeDir = path.join(root, claims.RESOLUTION_STORE_DIR);
        const first = recordResolution(resolverInput(claim, outcome), row, ports);
        assert.equal(first.ok, true, `the first write must succeed: ${JSON.stringify(first.error)}`);
        assert.equal(first.written, true, 'and it must actually write');
        assert.equal(first.reused, false);

        const objectPath = path.join(root, first.path);
        const bytesAfterFirst = readBytes(objectPath);
        const digestAfterFirst = claims.sha256Hex(bytesAfterFirst);
        assert.equal(readdirSync(storeDir).length, 1, 'exactly one object on disk');

        /* HALF ONE — THE BYTE-IDENTICAL NO-OP. A second pass over unchanged inputs recomputes one
           address AND one byte string, so the store reuses rather than rewrites. This is what
           makes a resolver safe to re-run, and it holds only because `resolutionHash` covers the
           hashed terms and the provenance block carries no run-scoped key. */
        const second = recordResolution(resolverInput(claim, outcome), row, ports);
        assert.equal(second.ok, true, `the repeat must not refuse: ${JSON.stringify(second.error)}`);
        assert.equal(second.path, first.path, 'one content address');
        assert.equal(second.written, false, 'nothing is rewritten');
        assert.equal(second.reused, true, 'the identical bytes are reused');
        assert.equal(claims.sha256Hex(readBytes(objectPath)), digestAfterFirst, 'and the file is byte-identical');
        assert.equal(readdirSync(storeDir).length, 1, 'still exactly one object');

        /* HALF TWO — A CHANGED UNHASHED FIELD IS A CONFLICT. `eventId` sits outside the hash, so
           a re-emit lands at the SAME address with DIFFERENT bytes. That is the one case
           `RTR-RESOLUTION-CONFLICT` exists for, and it must refuse rather than overwrite: the
           first record is the one an auditor already saw. */
        const reEmitted = recordResolution(
            resolverInput(claim, outcome, { eventId: 'sha256:'.concat('9'.repeat(64)) }),
            row,
            ports,
        );
        assert.equal(reEmitted.ok, false, 'a byte-changing write at a taken address must refuse');
        assert.equal(reEmitted.error.code, claims.RESOLUTION_CONFLICT_CODE, 'code');
        assert.equal(reEmitted.error.reason, 'resolution-conflict-refused', 'reason');
        assert.equal(reEmitted.error.path, first.path, 'and it names the address it refused');
        assert.equal(claims.sha256Hex(readBytes(objectPath)), digestAfterFirst, 'the on-disk bytes are unchanged');
        assert.equal(readdirSync(storeDir).length, 1, 'and nothing new was created');

        /* HALF THREE — A MOVED BASIS IS A NEW ADDRESS, NOT A CONFLICT. The rewritten series doubles
           both closes, so the RETURN is bit-identical and every other hashed term is unchanged:
           without the fingerprint in hashed provenance this would have been the no-op above and
           BUG-012's retroactive `ac` rewrite would have been invisible. With it, the record lands
           at a second address and both survive — which is detection, not refusal. */
        const doubled = JSON.parse(fixtureBarsText('DVG'));
        for (const bar of doubled.rows) bar.ac *= 2;
        const rewritten = outcomeValueFor(claim, fencesFor(JSON.stringify(doubled)));
        assert.equal(rewritten.outcomeValue, outcome.outcomeValue, 'the doubling must leave the return bit-identical');
        assert.notEqual(rewritten.basisFingerprint, outcome.basisFingerprint, 'while the values read did move');

        const moved = recordResolution(resolverInput(claim, rewritten), row, ports);
        assert.equal(moved.ok, true, `a moved basis is recorded, not refused: ${JSON.stringify(moved.error)}`);
        assert.notEqual(moved.path, first.path, 'at a SECOND content address');
        assert.equal(moved.written, true, 'written rather than reused');
        assert.equal(readdirSync(storeDir).length, 2, 'so both readings survive on disk');
        assert.equal(claims.sha256Hex(readBytes(objectPath)), digestAfterFirst, 'and the first record is untouched');

        /* ANTI-VACUITY for half three: the two records agree on every OTHER hashed term, so the
           second address is caused by the fingerprint alone and not by a value that also drifted. */
        const [a, b] = [first.resolution, moved.resolution];
        assert.equal(a.outcomeValue, b.outcomeValue);
        assert.equal(a.outcomeClass, b.outcomeClass);
        assert.equal(a.closureEventType, b.closureEventType);
        assert.equal(a.claimHash, b.claimHash);
        assert.notEqual(a.provenance.basisFingerprint, b.provenance.basisFingerprint);
    });

    assertBytesUnchanged(committedBefore, readBytes(PARTITION_ABS), `${PARTITION_REL} bytes`);
});

test('T-04-I5 (increment 3): the write runs scope 02 gate first, so a claimless row is unscoreable and nothing reaches the store', () => {
    const committedBefore = readBytes(PARTITION_ABS);
    const claim = fixtureClaim('DVG', 'adjusted-close');
    const outcome = outcomeValueFor(claim, fencesFor(fixtureBarsText('DVG')));

    const claimless = nonEmptyLines(committedBefore)
        .map((line) => JSON.parse(line))
        .find((row) => row.contractVersion === claims.ROW_CONTRACT_V2
            && !Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD));
    assert.ok(claimless, 'the committed partition must carry a claimless v2 row');

    withDisposableStore(({ root, ports }) => {
        const storeDir = path.join(root, claims.RESOLUTION_STORE_DIR);

        /* THE ADVERSARIAL INPUT IS A COMPLETE, VALID RECORD — the same one that writes cleanly
           below. If the gate consulted the resolution at all, this is exactly what would slip
           past; because it runs first, no property of a well-formed record can rescue the row. */
        const refused = recordResolution(resolverInput(claim, outcome), claimless, ports);
        assert.equal(refused.ok, false, 'a claimless row must refuse');
        assert.equal(refused.error.code, claims.LEGACY_BACKFILL_CODE, 'code');
        assert.equal(refused.error.reason, 'claimless-row-unscoreable', 'reason');
        assert.equal(refused.error.field, claims.CLAIM_REF_FIELD, 'field');
        assert.equal(existsSync(storeDir), false, 'and the store directory is never even created');

        /* A ROW POINTING AT A DIFFERENT CLAIM ALSO REFUSES. The resolution must be ABOUT the claim
           the row names, or a record could be filed against a call nobody made. */
        const mismatched = recordResolution(
            resolverInput(claim, outcome),
            { ...claimless, [claims.CLAIM_REF_FIELD]: claims.stableSha({ other: true }) },
            ports,
        );
        assert.equal(mismatched.ok, false, 'a claimRef naming another claim must refuse');
        assert.equal(mismatched.error.reason, 'resolution-claim-hash-does-not-match-row', 'reason');
        assert.equal(mismatched.error.field, 'claimHash', 'field');
        assert.equal(existsSync(storeDir), false, 'still nothing written');

        /* ANTI-VACUITY. The IDENTICAL record against the SAME row plus the right claimRef writes.
           Without it, both refusals above would pass under a writer that refused everything. */
        const written = recordResolution(
            resolverInput(claim, outcome),
            { ...claimless, [claims.CLAIM_REF_FIELD]: claim.claimHash },
            ports,
        );
        assert.equal(written.ok, true, `the control must write: ${JSON.stringify(written.error)}`);
        assert.equal(written.written, true);
        assert.equal(readdirSync(storeDir).length, 1, 'exactly one object, created only by the accepted write');
    });

    assertBytesUnchanged(committedBefore, readBytes(PARTITION_ABS), `${PARTITION_REL} bytes`);
});
