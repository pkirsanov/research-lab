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
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet } from '../scripts/brief-publication.mjs';
import { loadInstrumentUniverse, recommendationRowsFromPayload } from '../scripts/recommendation-body.mjs';
import { attachClaimRefs } from '../scripts/recommendation-claim-mint.mjs';
import { buildRun } from './fixtures/feature-002/history/history-fixture-builder.mjs';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    committedSeries,
    loadClaimsModule,
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
