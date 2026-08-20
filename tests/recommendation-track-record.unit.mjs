/*
 * tests/recommendation-track-record.unit.mjs — Feature 015, scope 01 unit rows T-01-U1 .. T-01-U7.
 *
 * These rows assert the frozen claim contract at the function level: what `claimHash` covers and
 * what it deliberately excludes, that the append-only store refuses an amendment rather than
 * overwriting it, and that each closed vocabulary and each authored-input absence resolves to its
 * own named reason and the field that caused it.
 *
 * Two conventions run through every row and are what make them detect a regression rather than
 * certify one. Every negative asserts the EXACT reason plus its companion field — "some refusal
 * occurred" would still pass if the wrong rule fired — and every negative is paired with an input
 * that differs in exactly the offending value and MUST be accepted, so a permissive implementation
 * fails the pair even when it happens to refuse the negative for an unrelated reason.
 *
 * Nothing here reads a clock: every date is taken from a fixture. Nothing here writes into the
 * committed `briefs/objects/claims/` tree: the store rows run inside a disposable temp root and
 * T-01-U3 asserts the live tree is untouched across the run.
 *
 * Scopes 02 - 10 EXTEND this file; they do not rewrite it.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet } from '../scripts/brief-publication.mjs';
import { loadInstrumentUniverse, recommendationRowsFromPayload } from '../scripts/recommendation-body.mjs';
import { CLAIM_NOT_EVALUABLE_FIELD, attachClaimRefs, mintClaimRecords } from '../scripts/recommendation-claim-mint.mjs';
import { buildRun } from './fixtures/feature-002/history/history-fixture-builder.mjs';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    assertEvaluable,
    assertRefusal,
    committedSeries,
    foundationActionVocabulary,
    foundationSourceText,
    loadClaimFixture,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    withDisposableStore,
} from './recommendation-track-record.support.mjs';

const claims = loadClaimsModule();

/** Mint from a named fixture. The result is returned whole — a violation is never swallowed. */
function mint(fixtureName, overrides = {}) {
    return claims.mintClaim(mintInputFrom(loadClaimFixture(fixtureName), overrides));
}

function mintEvaluable(fixtureName, overrides = {}) {
    const result = mint(fixtureName, overrides);
    assertEvaluable(result, fixtureName);
    return result.claim;
}

/** A contract violation: the closed code, the exact reason, and the field that caused it. */
function assertViolation(result, expected, label) {
    assert.equal(result.ok, false, `${label}: expected a contract violation, got a minted claim`);
    assert.equal(result.error.code, claims.CONTRACT_VIOLATION_CODE, `${label}: code`);
    assertRefusal(result.error, expected.reason, expected.field, label);
}

function valueAt(node, dottedPath) {
    return dottedPath.split('.').reduce((carry, segment) => carry[segment], node);
}

function setAt(node, dottedPath, value) {
    const segments = dottedPath.split('.');
    const parent = segments.slice(0, -1).reduce((carry, segment) => carry[segment], node);
    parent[segments[segments.length - 1]] = value;
    return node;
}

/** Replace every string value exactly equal to `from`. Generic, so no per-fixture path literals. */
function replaceStringValue(node, from, to) {
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i += 1) {
            if (node[i] === from) node[i] = to;
            else replaceStringValue(node[i], from, to);
        }
        return node;
    }
    if (node && typeof node === 'object') {
        for (const key of Object.keys(node)) {
            if (node[key] === from) node[key] = to;
            else replaceStringValue(node[key], from, to);
        }
    }
    return node;
}

test('T-01-U1: claimHash is content-only across exactly the five unhashed fields', () => {
    const first = mintEvaluable('evaluable-basket-trim');
    const reproposed = mintEvaluable('evaluable-basket-trim-reproposed');

    assert.deepEqual(
        [...claims.UNHASHED_FIELDS].sort(),
        ['citedToolId', 'notEvaluable', 'proposalEventId', 'proposalRunId', 'proposedAt'],
        'the unhashed set is exactly five fields — the partition over the fifteen declared fields is '
            + '9 hashed + 5 unhashed + claimHash, and there is no unhashed block',
    );

    // The re-proposal pair cannot exercise `notEvaluable`: both sides are evaluable, so it is
    // `null` on both by construction. Splitting it out keeps the pair's anti-vacuity guard honest
    // — the guard demands a differing value, which an evaluable pair cannot supply — and moves the
    // fifth field to the dedicated mutation probe below, which supplies one.
    const proposalProvenance = claims.UNHASHED_FIELDS.filter((field) => field !== 'notEvaluable');
    assert.equal(proposalProvenance.length, 4, 'four of the five unhashed fields vary across a re-proposal pair');

    // Without this the row would pass vacuously: a pair that shared its provenance would prove
    // nothing about exclusion. All four must be populated on both sides AND differ.
    for (const field of proposalProvenance) {
        assert.notEqual(first[field], null, `${field} must be populated on the first proposal`);
        assert.notEqual(reproposed[field], null, `${field} must be populated on the re-proposal`);
        assert.notEqual(reproposed[field], first[field], `unhashed field ${field} must differ across the pair`);
    }

    assert.deepEqual(
        claims.hashedTermsOf(reproposed),
        claims.hashedTermsOf(first),
        'the re-proposal must carry byte-identical hashed terms',
    );
    assert.equal(reproposed.claimHash, first.claimHash, 're-proposing identical terms must reuse the identical hash');
    assert.equal(
        claims.claimObjectPath(reproposed.claimHash),
        claims.claimObjectPath(first.claimHash),
        're-proposal must land on the identical content address',
    );

    // The fifth unhashed field, mutated ALONE. `no-committed-series` is the one probe that carries
    // information: every other branch of the mint verdict reads only hashed terms — `actionFamily`,
    // `subject`, `thesisFamily`, `horizon`, `predicate`, `direction` — so it cannot differ while the
    // hashed terms are equal, and a probe using one would be vacuous. Only the committed-series
    // check reads state outside the claim, so only it can flip between two mints of the same call.
    // That is exactly the case hashing would split into two addresses and two denominator entries.
    const amendedVerdict = structuredClone(first);
    assert.equal(first.notEvaluable, null, 'the evaluable fixture must mint a null verdict for the probe to differ');
    amendedVerdict.notEvaluable = { reason: 'no-committed-series', field: 'subject.seriesRefs' };
    assert.notDeepEqual(
        amendedVerdict.notEvaluable,
        first.notEvaluable,
        'the probe must actually change the verdict, or the equality below proves nothing',
    );
    assert.deepEqual(
        claims.hashedTermsOf(amendedVerdict),
        claims.hashedTermsOf(first),
        'the probe must leave every hashed term untouched, so only notEvaluable differs',
    );
    assert.equal(
        claims.claimHash(amendedVerdict),
        first.claimHash,
        'notEvaluable is unhashed: one authored call must hold one content address whether or not its series has landed',
    );

    // Adversarial half. An implementation still carrying `thesisFamily` as unhashed provenance —
    // its placement under the withdrawn provenance block — passes everything above and
    // fails here, which is the only thing that tells the two apart.
    const amendedThesis = structuredClone(first);
    amendedThesis.thesisFamily = `${first.thesisFamily}-alt`;
    assert.notEqual(amendedThesis.thesisFamily, first.thesisFamily);
    assert.notEqual(
        claims.claimHash(amendedThesis),
        first.claimHash,
        'thesisFamily is a hashed term: two claims asserting different theses must not collide on one address',
    );
});

test('T-01-U2: every hashed term is load-bearing', () => {
    const base = mintEvaluable('evaluable-basket-trim');
    const alternate = loadClaimFixture('evaluable-instrument-add');

    // Each mutation moves ONE term to a value that is itself legal, so a hash covering only the
    // terms resolution consumes cannot pass by rejecting the mutation as malformed.
    const mutations = [
        { path: 'contractVersion', value: `${base.contractVersion}-probe` },
        { path: 'recommendationKey', value: claims.deriveRecommendationKey(`${base.subject.prose} (revised)`, base.actionFamily) },
        { path: 'subject.weighting', value: 'primary-only' },
        { path: 'actionFamily', value: 'add' },
        { path: 'direction', value: 1 },
        { path: 'thesisFamily', value: `${base.thesisFamily}-alt` },
        { path: 'predicate.kind', value: 'threshold' },
        { path: 'predicate.comparator', value: 'gte' },
        { path: 'predicate.value', value: base.predicate.value + 1 },
        { path: 'horizon.resolutionDate', value: alternate.input.binding.resolutionDate },
        { path: 'horizon.sessions', value: base.horizon.sessions + 1 },
        { path: 'horizon.authoredBand', value: alternate.input.action.horizon },
        { path: 'magnitude.flatBand', value: base.magnitude.flatBand + 0.1 },
    ];

    assert.ok(
        mutations.length >= 11,
        `expected at least the eleven mutations the scope names, got ${mutations.length}`,
    );
    for (const required of ['thesisFamily', 'horizon.authoredBand']) {
        assert.ok(
            mutations.some((mutation) => mutation.path === required),
            `${required} is the term a permissive implementation is likeliest to omit and must be probed`,
        );
    }

    // Coverage is derived from the module's own HASHED_TERMS, never from a literal list here.
    const touched = new Set(mutations.map((mutation) => mutation.path.split('.')[0]));
    assert.deepEqual(
        [...touched].sort(),
        [...claims.HASHED_TERMS].sort(),
        'the mutation set must span every hashed term',
    );

    assert.equal(base.subject.weighting, 'equal', 'the weighting mutation must actually change the value');
    assert.ok(Number.isFinite(base.horizon.sessions), 'the sessions mutation needs a finite base');
    assert.ok(Number.isFinite(base.magnitude.flatBand), 'the flatBand mutation needs a finite base');
    assert.notEqual(alternate.input.binding.resolutionDate, base.horizon.resolutionDate);
    assert.notEqual(alternate.input.action.horizon, base.horizon.authoredBand);

    const seen = new Map([[base.claimHash, 'base']]);
    for (const mutation of mutations) {
        const mutated = structuredClone(base);
        setAt(mutated, mutation.path, mutation.value);
        assert.notDeepEqual(
            valueAt(mutated, mutation.path),
            valueAt(base, mutation.path),
            `${mutation.path}: the mutation must change the value it probes`,
        );

        const hash = claims.claimHash(mutated);
        assert.notEqual(hash, base.claimHash, `${mutation.path} must be inside claimHash`);
        assert.equal(
            seen.has(hash),
            false,
            `${mutation.path} collided with ${seen.get(hash)} — distinct terms must produce distinct addresses`,
        );
        seen.set(hash, mutation.path);
    }

    assert.equal(seen.size, mutations.length + 1);
});

test('T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites', () => {
    const liveStore = path.join(REPO_ROOT, claims.CLAIM_STORE_DIR);
    const liveStoreExistedBefore = existsSync(liveStore);

    withDisposableStore(({ root, ports }) => {
        assert.equal(
            root.startsWith(REPO_ROOT),
            false,
            'the disposable store must live outside the repository so a run leaves it byte-identical',
        );

        const original = mintEvaluable('evaluable-basket-trim');
        const firstWrite = claims.writeClaimObject(original, ports);
        assert.equal(firstWrite.ok, true, 'the first write must succeed');
        assert.equal(firstWrite.written, true);
        assert.equal(firstWrite.reused, false);
        assert.equal(firstWrite.path, claims.claimObjectPath(original.claimHash));

        const objectPath = path.join(root, firstWrite.path);
        const before = readBytes(objectPath);
        assert.equal(before, claims.serializeClaim(original), 'the stored bytes are the serialized claim');

        // Control 1 — an identical re-mint is a byte-identical no-op, not an amendment.
        const identical = claims.writeClaimObject(mintEvaluable('evaluable-basket-trim'), ports);
        assert.equal(identical.ok, true, 'an identical re-mint must not be refused');
        assert.equal(identical.written, false);
        assert.equal(identical.reused, true);
        assertBytesUnchanged(before, readBytes(objectPath), 'identical re-mint');

        // Control 2 — a re-proposal differing ONLY in the four unhashed fields is the SAME claim.
        // It reuses the first object and keeps the first citation; refusing it would force a
        // second object for a call the record must count exactly once.
        const reproposed = mintEvaluable('evaluable-basket-trim-reproposed');
        assert.notEqual(reproposed.citedToolId, original.citedToolId, 'the control must genuinely differ in provenance');
        const reuse = claims.writeClaimObject(reproposed, ports);
        assert.equal(reuse.ok, true, 'an unhashed-only re-proposal must not be refused');
        assert.equal(reuse.written, false);
        assert.equal(reuse.reused, true);
        assertBytesUnchanged(before, readBytes(objectPath), 'unhashed-only re-proposal');

        // BS-008 — an amended predicate re-submitted against the ORIGINAL claim reference, so it
        // lands at the original path carrying different hashed terms. A permissive store would
        // have overwritten it, leaving the amended predicate as the scoring basis and no trace.
        const amended = structuredClone(original);
        amended.predicate.value = original.predicate.value + 1;
        amended.claimHash = original.claimHash;
        assert.notEqual(amended.predicate.value, original.predicate.value);
        assert.notEqual(
            claims.claimHash(amended),
            original.claimHash,
            'the amendment must genuinely change the hashed terms',
        );
        assert.equal(
            claims.claimObjectPath(amended.claimHash),
            firstWrite.path,
            'the amendment must target the original content address',
        );

        const refused = claims.writeClaimObject(amended, ports);
        assert.equal(refused.ok, false, 'a byte-changing write at an existing address must be refused');
        assert.equal(refused.error.code, claims.PREDICATE_AMEND_CODE);
        assert.equal(refused.error.code, 'RTR-PREDICATE-AMEND');
        assertRefusal(refused.error, 'predicate-amend-refused', 'claimHash', 'T-01-U3 amendment');
        assert.equal(refused.error.path, firstWrite.path);

        assertBytesUnchanged(before, readBytes(objectPath), 'T-01-U3 on-disk bytes after the refusal');
        assert.equal(
            JSON.parse(readBytes(objectPath)).predicate.value,
            original.predicate.value,
            'the original frozen predicate remains the scoring basis',
        );
    });

    assert.equal(
        existsSync(liveStore),
        liveStoreExistedBefore,
        'the committed claim store must be untouched by the store rows',
    );
});

test('T-01-U4: non-semantic-subject refuses both publisher positional fallbacks', () => {
    const cases = [
        { fixture: 'not-evaluable-positional-subject', repair: (input) => { input.action.subject = 'SOXX into the post-FOMC fade'; } },
        { fixture: 'not-evaluable-note-family', repair: (input) => { input.action.action = 'trim'; } },
    ];

    for (const { fixture: name, repair } of cases) {
        const fixture = loadClaimFixture(name);
        assert.equal(fixture.expected.outcome, 'not-evaluable');
        assert.equal(fixture.expected.reason, 'non-semantic-subject');
        assert.ok(claims.MINT_REFUSALS.includes('non-semantic-subject'), 'the reason is a member of the closed set');

        const result = mint(name);
        assert.equal(result.ok, true, `${name}: a not-evaluable claim is still minted and still counted`);
        assertRefusal(result.claim.notEvaluable, fixture.expected.reason, fixture.expected.field, name);
        assert.match(result.claim.claimHash, /^sha256:[a-f0-9]{64}$/, `${name}: the claim still carries a content address`);

        // The fixture is otherwise complete, so a permissive minter that only looked for absent
        // inputs would have accepted it. Repairing the sole offending value proves that.
        const repaired = structuredClone(fixture);
        repair(repaired.input);
        assertEvaluable(claims.mintClaim(mintInputFrom(repaired)), `${name}: repaired`);
    }

    // The positional pattern is a shape, not one blacklisted string.
    const positional = loadClaimFixture('not-evaluable-positional-subject');
    assert.equal(positional.input.action.subject, 'action-3');
    for (const prose of ['action-0', 'action-17', 'action-403']) {
        const probe = structuredClone(positional);
        probe.input.action.subject = prose;
        const result = claims.mintClaim(mintInputFrom(probe));
        assert.equal(result.ok, true);
        assertRefusal(result.claim.notEvaluable, 'non-semantic-subject', 'subject.prose', `positional ${prose}`);
    }
});

test('T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket', () => {
    const committed = committedSeries();
    assert.ok(committed.length > 0, 'the committed set is enumerated from data/bars at test time, never asserted as a count');
    assert.equal(
        committed.includes(claims.BARS_MANIFEST_FILENAME.replace(/\.json$/, '')),
        false,
        'the refresh manifest is not a price series and must never be resolvable',
    );

    for (const name of ['not-evaluable-empty-series-refs', 'not-evaluable-second-series-absent']) {
        const fixture = loadClaimFixture(name);
        assert.equal(fixture.expected.reason, 'no-committed-series');
        const result = mint(name);
        assert.equal(result.ok, true, `${name}: the not-evaluable claim is still minted, not dropped`);
        assertRefusal(result.claim.notEvaluable, fixture.expected.reason, fixture.expected.field, name);
    }

    // The claim object is still WRITTEN with its reason. Dropping the call instead would shrink
    // the denominator in the direction that flatters.
    withDisposableStore(({ root, ports }) => {
        const claim = mint('not-evaluable-second-series-absent').claim;
        const write = claims.writeClaimObject(claim, ports);
        assert.equal(write.ok, true);
        assert.equal(write.written, true);
        const persisted = JSON.parse(readBytes(path.join(root, write.path)));
        assert.equal(persisted.notEvaluable.reason, 'no-committed-series');
        assert.equal(persisted.notEvaluable.field, 'subject.seriesRefs');
    });

    // Adversarial: the first member resolves and the second does not. An implementation checking
    // only seriesRefs[0] accepts this basket and then scores it against a series it cannot read.
    const absent = loadClaimFixture('not-evaluable-second-series-absent');
    const members = absent.input.action.claim.resolvesTo;
    assert.equal(members.length, 2);
    assert.equal(committed.includes(members[0]), true, 'the first member must resolve');
    assert.equal(committed.includes(members[1]), false, 'the second member must be absent from the committed set');

    const substitute = committed.find((symbol) => symbol !== members[0]);
    assert.equal(typeof substitute, 'string');
    assert.ok(substitute.length > 0, 'a second committed symbol must exist to repair the basket with');

    const repaired = structuredClone(absent);
    repaired.input.action.claim.resolvesTo = [members[0], substitute];
    assertEvaluable(claims.mintClaim(mintInputFrom(repaired)), 'basket with both members committed');
});

test('T-01-U6: every closed vocabulary refuses a one-character-off value', () => {
    const vocabularies = {
        SUBJECT_KINDS: claims.SUBJECT_KINDS,
        PREDICATE_KINDS: claims.PREDICATE_KINDS,
        PREDICATE_COMPARATORS: claims.PREDICATE_COMPARATORS,
        HORIZON_KINDS: claims.HORIZON_KINDS,
        MAGNITUDE_UNITS: claims.MAGNITUDE_UNITS,
        SIGN_CONVENTIONS: claims.SIGN_CONVENTIONS,
        MARKET_ACTIONS: foundationActionVocabulary().families,
    };

    const fixtureNames = [
        'violation-subject-kind-one-char-off',
        'violation-predicate-kind-one-char-off',
        'violation-predicate-comparator-one-char-off',
        'violation-horizon-kind-one-char-off',
        'violation-magnitude-unit-one-char-off',
        'violation-magnitude-sign-convention-one-char-off',
        'violation-action-family-not-allowed',
    ];

    const coveredVocabularies = new Set();
    for (const name of fixtureNames) {
        const fixture = loadClaimFixture(name);
        assert.equal(fixture.expected.outcome, 'violation', `${name}: expected a contract violation fixture`);

        const vocabulary = vocabularies[fixture.expected.vocabulary];
        assert.ok(Array.isArray(vocabulary), `${name}: unknown vocabulary ${fixture.expected.vocabulary}`);
        coveredVocabularies.add(fixture.expected.vocabulary);

        const legal = fixture.expected.legalMember;
        const offending = legal.slice(0, -1);
        assert.equal(vocabulary.includes(legal), true, `${name}: the declared legal member must be in the vocabulary`);
        assert.equal(vocabulary.includes(offending), false, `${name}: the offending value must be outside the vocabulary`);
        assert.equal(legal.startsWith(offending), true, `${name}: the offending value must defeat a prefix check`);
        assert.equal(
            JSON.stringify(fixture.input).includes(`"${offending}"`),
            true,
            `${name}: the fixture must actually carry the one-character-off value`,
        );

        assertViolation(claims.mintClaim(mintInputFrom(fixture)), fixture.expected, name);

        // One rule violated per fixture: substituting the legal member mints an evaluable claim.
        const repaired = structuredClone(fixture);
        replaceStringValue(repaired.input, offending, legal);
        assert.equal(JSON.stringify(repaired.input).includes(`"${offending}"`), false, `${name}: repair must be complete`);
        assertEvaluable(claims.mintClaim(mintInputFrom(repaired)), `${name}: repaired`);
    }

    assert.deepEqual(
        [...coveredVocabularies].sort(),
        Object.keys(vocabularies).sort(),
        'every closed vocabulary must be probed by a fixture',
    );
});

test('T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome', () => {
    const vocabulary = foundationActionVocabulary();
    const fixture = loadClaimFixture('violation-direction-not-bound');
    const family = fixture.input.action.action;
    const bound = vocabulary.direction[family];

    assert.equal(vocabulary.families.includes(family), true, 'the family must be a legal market action');
    assert.equal(bound, fixture.expected.boundDirection, 'the fixture must declare the value ACTION_DIRECTION binds');
    assert.equal(fixture.input.binding.direction, fixture.expected.authoredDirection);
    assert.notEqual(fixture.input.binding.direction, bound, 'the authored direction must contradict the bound value');

    assertViolation(claims.mintClaim(mintInputFrom(fixture)), fixture.expected, 'T-01-U7 authored direction');

    // The sole difference is the direction value, so the pair isolates the binding itself.
    const accepted = claims.mintClaim(mintInputFrom(fixture, { direction: bound }));
    assertEvaluable(accepted, 'T-01-U7 bound direction');
    assert.equal(accepted.claim.direction, bound);
    assert.equal(accepted.claim.actionFamily, family);

    // `hold` binds to 0 and has no signed outcome to define — but is still minted and counted.
    const hold = loadClaimFixture('not-evaluable-hold-neutral-direction');
    const holdFamily = hold.input.action.action;
    assert.equal(vocabulary.direction[holdFamily], 0, 'the hold fixture must exercise the neutral bound direction');
    assert.equal(hold.expected.reason, 'neutral-direction-no-magnitude');

    const held = claims.mintClaim(mintInputFrom(hold));
    assert.equal(held.ok, true, 'a hold is minted and counted, not dropped');
    assert.equal(held.claim.direction, 0);
    assertRefusal(held.claim.notEvaluable, hold.expected.reason, hold.expected.field, 'T-01-U7 hold');

    // The refusal is caused by the neutral direction and nothing else: the same authored inputs
    // under a signed family mint an evaluable claim.
    const signed = structuredClone(hold);
    signed.input.action.action = family;
    assert.notEqual(vocabulary.direction[family], 0);
    assertEvaluable(claims.mintClaim(mintInputFrom(signed)), 'T-01-U7 hold repaired to a signed family');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Scope 02 — additive ledger row extension. Rows T-02-U1 and T-02-U2.
 *
 * These rows are deliberately anchored on the REAL committed ledger rather than on synthetic
 * rows: the whole point of the extension is compatibility with what is already on disk, and a
 * synthetic row would only ever prove the reader agrees with the test author.
 *
 * The support module's export surface is pinned exactly by T-01-C1, so the ledger helpers below
 * are local to this file. Adding them to the substrate would fail the canary.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const LEDGER_DIR = path.join(REPO_ROOT, 'briefs', 'history', 'recommendations');
const LEDGER_FIXTURE_DIR = path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record', 'ledger');

/** Every non-empty line of every committed partition, in file-name then file order. */
function committedLedgerLines() {
    return readdirSync(LEDGER_DIR)
        .filter((f) => f.endsWith('.jsonl'))
        .sort()
        .flatMap((f) => readFileSync(path.join(LEDGER_DIR, f), 'utf8').split('\n').filter((l) => l.trim().length > 0));
}

function jsonlFixtureLines(name) {
    return readFileSync(path.join(LEDGER_FIXTURE_DIR, `${name}.jsonl`), 'utf8')
        .split('\n')
        .filter((l) => l.trim().length > 0);
}

/** A negative fixture and its declared expectation. A missing sibling throws — an unexpected
 *  input is not a test, so it must not load as "no expectation at all". */
function loadLedgerNegative(name) {
    const expectedPath = path.join(LEDGER_FIXTURE_DIR, `${name}.expected.json`);
    if (!existsSync(expectedPath)) {
        throw new Error(`ledger fixture "${name}" has no .expected.json sibling`);
    }
    return {
        name,
        input: JSON.parse(readFileSync(path.join(LEDGER_FIXTURE_DIR, `${name}.json`), 'utf8')),
        expected: JSON.parse(readFileSync(expectedPath, 'utf8')),
    };
}

/** A row refusal: the closed code, the exact reason, and the field that caused it. */
function assertRowRefusal(result, expected, label) {
    assert.equal(result.ok, false, `${label}: expected a row refusal, got an accepted row`);
    assert.equal(result.error.code, expected.code, `${label}: code`);
    assertRefusal(result.error, expected.reason, expected.field, label);
}

/**
 * The reader with the closed-field-list rule REVERTED — i.e. an accept-anything reader that
 * still checks the version stamp. Every negative below is asserted to be ACCEPTED by this,
 * which is what proves the negative can actually fail. A negative that refuses under both the
 * shipped and the reverted implementation is guarding nothing.
 */
function validateWithUnknownFieldRuleReverted(row) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return { ok: false };
    const known = [claims.ROW_CONTRACT_V1, claims.ROW_CONTRACT_V2];
    if (!known.includes(row.contractVersion)) return { ok: false };
    const required = row.contractVersion === claims.ROW_CONTRACT_V1
        ? claims.ROW_V1_FIELDS
        : claims.ROW_V2_REQUIRED_FIELDS;
    for (const field of required) {
        if (!Object.prototype.hasOwnProperty.call(row, field)) return { ok: false };
    }
    return { ok: true, row };
}

/** A deterministic, module-produced pointer. Never a hand-typed digest. */
function claimRefFor(row) {
    return claims.stableSha({ contractVersion: claims.CONTRACT_VERSION, eventId: row.eventId });
}

test('T-02-U1: claimRef is optional on the live v2 at every committed shape, and v1 needs it never', () => {
    const rows = committedLedgerLines().map((line) => JSON.parse(line));
    assert.equal(rows.length > 0, true, 'the committed ledger must be non-empty for this row to mean anything');

    const v2Rows = rows.filter((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    const v1Rows = rows.filter((r) => r.contractVersion === claims.ROW_CONTRACT_V1);
    assert.equal(v1Rows.length > 0, true, 'the committed ledger must carry v1 rows');

    // The three live shapes are READ from the ledger, not asserted as a literal — a reader that
    // silently skipped a shape must not be able to pass by the test agreeing with it.
    const byShape = new Map();
    for (const row of v2Rows) {
        const n = Object.keys(row).length;
        if (!byShape.has(n)) byShape.set(n, row);
    }
    assert.deepEqual([...byShape.keys()].sort((a, b) => a - b), [17, 25, 27], 'the live v2 key counts');

    // The declared constants are a MEASUREMENT of this ledger. Re-derive both halves from it, so a
    // hand-maintained list cannot drift away from the rows it claims to describe.
    const derived = claims.deriveRowFieldUnion(v2Rows);
    assert.equal(derived.rowCount, v2Rows.length);
    assert.deepEqual([...derived.required], [...claims.ROW_V2_REQUIRED_FIELDS], 'v2 required set');
    assert.deepEqual([...derived.optional], [...claims.ROW_V2_MEASURED_OPTIONAL_FIELDS], 'v2 optional set');
    assert.deepEqual([...derived.union].length, 32, 'the measured v2 union');
    assert.equal(derived.union.includes(claims.CLAIM_REF_FIELD), false, 'no committed row carries claimRef yet');
    assert.equal(claims.ROW_V2_FIELDS.length, derived.union.length + 1, 'the accepted set is the union plus one');

    for (const [shape, committed] of [...byShape.entries()].sort((a, b) => a[0] - b[0])) {
        const label = `v2 shape ${shape}`;

        // WITHOUT claimRef — the row exactly as committed.
        assert.equal(claims.validateLedgerRow(committed).ok, true, `${label}: must validate as committed`);

        // WITH claimRef — the same row plus the one added optional member.
        const withRef = { ...committed, [claims.CLAIM_REF_FIELD]: claimRefFor(committed) };
        assert.equal(claims.validateLedgerRow(withRef).ok, true, `${label}: must validate with claimRef`);
        assert.equal(Object.keys(withRef).length, shape + 1, `${label}: exactly one key was added`);
        assert.equal(Object.keys(committed).length, shape, `${label}: the committed row was not mutated`);

        // Anti-vacuity: a reader that made claimRef REQUIRED on v2 fails all three committed
        // shapes. Without this the pair above would pass under a reader that ignored the field.
        assert.equal(
            Object.prototype.hasOwnProperty.call(committed, claims.CLAIM_REF_FIELD),
            false,
            `${label}: a required-claimRef reader must fail this committed row`,
        );
    }

    // v1 validates without claimRef, and claimRef is not in its list at all.
    assert.equal(claims.validateLedgerRow(v1Rows[0]).ok, true, 'a committed v1 row must validate without claimRef');
    assert.equal(claims.ROW_V1_FIELDS.includes(claims.CLAIM_REF_FIELD), false, "v1's list stays closed");

    // The fixtures are REAL: every fixture line is byte-present in the committed ledger, so the
    // shapes under test are what is on disk rather than what a test author typed.
    const committedLines = new Set(committedLedgerLines());
    for (const name of ['v1-only', 'v2-shape-17', 'v2-shape-25', 'v2-shape-27']) {
        const lines = jsonlFixtureLines(name);
        assert.equal(lines.length > 0, true, `${name}: fixture must be non-empty`);
        for (const line of lines) {
            assert.equal(committedLines.has(line), true, `${name}: every fixture line must be a real committed row`);
            assert.equal(claims.validateLedgerRow(JSON.parse(line)).ok, true, `${name}: fixture row must validate`);
        }
    }
});

test('T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else', () => {
    const negatives = ['v1-carrying-claim-ref', 'v2-unknown-field'].map(loadLedgerNegative);
    const committedLines = new Set(committedLedgerLines());

    for (const { name, input, expected } of negatives) {
        assert.equal(claims.ROW_CONTRACT_VIOLATION_CODE, expected.code, `${name}: the fixture must declare the live code`);

        assertRowRefusal(claims.validateLedgerRow(input), expected, name);

        // REVERT-VERIFICATION. The same input is ACCEPTED once the closed-field-list rule is
        // reverted, so this negative demonstrably fails when the behaviour it guards is removed.
        assert.equal(
            validateWithUnknownFieldRuleReverted(input).ok,
            true,
            `${name}: an accept-anything reader must ACCEPT this row — otherwise the negative guards nothing`,
        );

        // ONE rule violated: deleting the single declared offending key makes the row valid.
        const repaired = { ...input };
        delete repaired[expected.repairByDeletingField];
        assert.equal(claims.validateLedgerRow(repaired).ok, true, `${name}: repaired row must validate`);
        assert.equal(
            committedLines.has(JSON.stringify(repaired)),
            expected.repairMatchesCommittedRow,
            `${name}: whether the repair lands back on a real committed row is a declared property`,
        );
    }

    // The v1 negative refuses on the VERSION STAMP, not on a malformed value: its claimRef is a
    // well-formed pointer, and the identical value is accepted on v2.
    const v1Negative = loadLedgerNegative('v1-carrying-claim-ref');
    const pointer = v1Negative.input[claims.CLAIM_REF_FIELD];
    assert.equal(claims.CLAIM_REF_PATTERN.test(pointer), true, 'the v1 negative must carry a well-formed pointer');

    const v2Row = JSON.parse(jsonlFixtureLines('v2-shape-17')[0]);
    assert.equal(
        claims.validateLedgerRow({ ...v2Row, [claims.CLAIM_REF_FIELD]: pointer }).ok,
        true,
        'the same pointer value is accepted on v2 — so the v1 refusal is about the version, not the value',
    );

    // The v2 negative's surviving claimRef is what proves the refusal was about resolutionRef.
    const v2Negative = loadLedgerNegative('v2-unknown-field');
    const v2Repaired = { ...v2Negative.input };
    delete v2Repaired[v2Negative.expected.repairByDeletingField];
    assert.equal(
        Object.prototype.hasOwnProperty.call(v2Repaired, claims.CLAIM_REF_FIELD),
        true,
        'the repaired v2 row must still carry claimRef',
    );

    // v2 is not an escape hatch: every name outside the union ∪ {claimRef} is refused by name.
    for (const stranger of ['resolutionRef', 'outcomeValue', 'claimref', 'claimRefs']) {
        assert.equal(claims.ROW_V2_FIELDS.includes(stranger), false, `${stranger} must be outside the accepted set`);
        assertRowRefusal(
            claims.validateLedgerRow({ ...v2Row, [stranger]: 'x' }),
            { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'unknown-field', field: stranger },
            `v2 stranger ${stranger}`,
        );
    }
});

/* ── Scope 02, second increment: the publisher mint hook and the legacy refusal ──────────────── */

/** The publisher's own event-id namespace, held FIXED across the pair so any drift in an
 *  identifier is attributable to the mint hook and to nothing else. */
const PAIR_RUN_FINGERPRINT = claims.stableSha({ fixture: 'T-02-U3 run fingerprint' });
const PAIR_RUN_ID = 'dist-2026-07-14-morning-fixture';
const PAIR_OCCURRED_AT = '2026-07-14T12:40:00.000Z';

function pairEventIdFor(recommendationKey, index) {
    return claims.stableSha({
        contractVersion: 'brief-distributed-eventid/v1',
        runFingerprint: PAIR_RUN_FINGERPRINT,
        recommendationKey,
        index,
    });
}

/**
 * Two authored actions: one the minter can fully evaluate, one it cannot.
 *
 * The evaluable action is what makes the stability pair non-vacuous — if no event ever gained a
 * `claimRef`, "identical with and without the hook" would be trivially true. The `note` action is
 * the publisher's positional fallback and is the refused half of step 5.
 *
 * The symbol is READ from the committed bars set rather than typed, so the claim resolves to a
 * series that actually exists and the mint is evaluable for the right reason.
 */
function mintPairPayload(symbol) {
    return {
        nextSession: {
            actions: [
                {
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
                        // Authored, not defaulted: without a positive band this action mints
                        // `no-authored-flat-band` and the pair loses its one evaluable half.
                        flatBand: 0.25,
                    },
                },
                { action: 'note', subject: 'action-1' },
            ],
        },
        recommendations: [],
    };
}

/** One independent build of the publisher's event list, WITHOUT the mint hook. */
function buildEventsWithoutHook(payload, universe) {
    return recommendationRowsFromPayload(payload, {
        root: REPO_ROOT,
        occurredAt: PAIR_OCCURRED_AT,
        universe,
        eventIdFor: pairEventIdFor,
    }).map((event) => ({ ...event, bodySource: 'next-session-action' }));
}

/** The rows this run appends to the recommendation partition, from the REAL writer. */
function appendedRecommendationRows(events) {
    const built = buildPublishSet(buildRun({ recommendationEvents: events }));
    assert.equal(built.ok, true, 'the publish set must build for the row-emission assertions to mean anything');
    const partition = Object.keys(built.staging.historyPartitions)
        .find((p) => p.includes('/recommendations/'));
    assert.ok(partition, 'the publish set must carry a recommendation partition');
    return built.staging.historyPartitions[partition].appendedBytes
        .toString('utf8')
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
}

test('T-02-U3: eventId and recommendationKey are byte-identical with and without the mint hook', () => {
    const series = committedSeries();
    assert.equal(series.length > 0, true, 'the committed bars set must be non-empty');
    const symbol = series[0];
    const payload = mintPairPayload(symbol);
    const universe = loadInstrumentUniverse(REPO_ROOT);

    // Two INDEPENDENT builds. `withoutHook` is never passed through the hook, so this is a genuine
    // before/after rather than the same array inspected twice.
    const withoutHook = buildEventsWithoutHook(payload, universe);
    const withHook = attachClaimRefs(buildEventsWithoutHook(payload, universe), payload, {
        root: REPO_ROOT,
        proposalRunId: PAIR_RUN_ID,
        proposedAt: PAIR_OCCURRED_AT,
    });

    assert.equal(withoutHook.length, payload.nextSession.actions.length, 'one event per authored action');
    assert.equal(withHook.length, withoutHook.length, 'the hook adds and removes no event');

    for (let i = 0; i < withoutHook.length; i += 1) {
        // Byte-level, not just `===`: the pair is compared as serialized text, which is what the
        // ledger and every downstream join actually consume.
        assert.equal(
            JSON.stringify([withHook[i].eventId, withHook[i].recommendationKey]),
            JSON.stringify([withoutHook[i].eventId, withoutHook[i].recommendationKey]),
            `event ${i}: eventId and recommendationKey must be byte-identical across the hook`,
        );
        assert.equal(
            Object.prototype.hasOwnProperty.call(withoutHook[i], claims.CLAIM_REF_FIELD),
            false,
            `event ${i}: the pre-hook event must carry no claimRef`,
        );
    }

    // ANTI-VACUITY. Without a real attachment the comparison above would hold under a hook that did
    // nothing at all. Exactly one action here is evaluable, and exactly one event must gain the field.
    const records = mintClaimRecords(buildEventsWithoutHook(payload, universe), payload, {
        root: REPO_ROOT,
        proposalRunId: PAIR_RUN_ID,
        proposedAt: PAIR_OCCURRED_AT,
    });
    const attached = withHook.filter((e) => Object.prototype.hasOwnProperty.call(e, claims.CLAIM_REF_FIELD));
    assert.equal(attached.length, 1, 'exactly one event must gain a claimRef');
    assert.equal(claims.CLAIM_REF_PATTERN.test(attached[0].claimRef), true, 'the attached pointer must be an opaque sha256');
    assert.equal(records[0].claim.notEvaluable, null, 'the first action must mint an evaluable claim');
    assert.equal(attached[0].claimRef, records[0].claim.claimHash, 'the pointer must be the minted claimHash');

    // A REFUSED mint yields NO pointer and carries its exact reason forward instead — never a
    // fabricated claim. The positional fallback refuses on `actionFamily`, not on a guess.
    const refused = withHook[1];
    assert.equal(Object.prototype.hasOwnProperty.call(refused, claims.CLAIM_REF_FIELD), false, 'a refused mint attaches no claimRef');
    assertRefusal(refused[CLAIM_NOT_EVALUABLE_FIELD], 'non-semantic-subject', 'actionFamily', 'refused mint');

    // The REAL writer emits the pointer, and emits it as an ABSENT key rather than a null.
    const rows = appendedRecommendationRows(withHook);
    assert.equal(rows.length, withHook.length, 'one ledger row per event');
    const bearing = rows.filter((r) => Object.prototype.hasOwnProperty.call(r, claims.CLAIM_REF_FIELD));
    assert.equal(bearing.length, 1, 'exactly one emitted row carries claimRef');
    assert.equal(bearing[0].claimRef, attached[0].claimRef, 'the emitted row carries the minted pointer');
    for (const row of rows) {
        assert.equal(claims.validateLedgerRow(row).ok, true, 'every emitted row must validate');
        assert.equal(row.contractVersion, claims.ROW_CONTRACT_V2, 'the body-bearing rows are v2');
    }
    const claimless = rows.find((r) => !Object.prototype.hasOwnProperty.call(r, claims.CLAIM_REF_FIELD));
    assert.equal(claimless.claimRef, undefined, 'a claimless row has NO claimRef key — absence, never null');
    assert.equal(
        Object.prototype.hasOwnProperty.call(claimless, CLAIM_NOT_EVALUABLE_FIELD),
        false,
        'the refusal reason travels on the event, never into the row — v2 gains exactly one field',
    );

    // The identifiers survive BECAUSE neither is derived from the row. Recomputing one from the row
    // would fail: adding the field demonstrably moves a row-derived digest.
    const rowWith = bearing[0];
    const rowWithout = { ...rowWith };
    delete rowWithout[claims.CLAIM_REF_FIELD];
    assert.notEqual(
        claims.stableSha(rowWith),
        claims.stableSha(rowWithout),
        'a row-derived identifier WOULD shift — which is why eventId must not be one',
    );
    assert.equal(rowWith.eventId, rowWithout.eventId, 'eventId is unmoved by the very change that moves the row digest');

    // CANONICAL ORDERING (step 8), checked against REAL committed rows rather than a synthetic one:
    // sorted keys put claimRef immediately after canonicalMonth, and its successor on a live v2 row
    // is `confidence` — NOT `contractVersion`, which holds only for the v1 shape this scope rejects.
    const liveShapes = new Map();
    for (const line of committedLedgerLines()) {
        const row = JSON.parse(line);
        if (row.contractVersion !== claims.ROW_CONTRACT_V2) continue;
        const n = Object.keys(row).length;
        if (!liveShapes.has(n)) liveShapes.set(n, row);
    }
    assert.equal(liveShapes.size > 0, true, 'the committed ledger must carry v2 rows');
    for (const [shape, committed] of [...liveShapes.entries(), [Object.keys(rowWith).length - 1, rowWithout]]) {
        const keys = Object.keys({ ...committed, [claims.CLAIM_REF_FIELD]: attached[0].claimRef }).sort();
        const at = keys.indexOf(claims.CLAIM_REF_FIELD);
        assert.equal(keys[at - 1], 'canonicalMonth', `shape ${shape}: claimRef's predecessor`);
        assert.equal(keys[at + 1], 'confidence', `shape ${shape}: claimRef's successor is confidence`);
        assert.notEqual(keys[at + 1], 'contractVersion', `shape ${shape}: the v1-shaped successor must NOT hold here`);
    }
});

test('T-02-U4: RTR-LEGACY-BACKFILL refuses a resolution written against a claimless row', () => {
    // The exact code, asserted as a literal. A renamed constant must fail here.
    assert.equal(claims.LEGACY_BACKFILL_CODE, 'RTR-LEGACY-BACKFILL', 'the owned refusal code');

    const rows = committedLedgerLines().map((line) => JSON.parse(line));
    const legacyV2 = rows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    const legacyV1 = rows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V1);
    assert.ok(legacyV2 && legacyV1, 'the committed ledger must carry a claimless row of each version');

    /* THE ADVERSARIAL INPUT. Complete, well-formed, and entirely plausible: a real comparator from
       the claim vocabulary, a finite level, a real horizon kind, a signed outcome. This is precisely
       the imputation a permissive implementation wants through — every field looks authored, and
       none of it was. If the refusal consulted the resolution at all, this is what would slip past. */
    const plausible = {
        contractVersion: 'brief-recommendation-resolution/v1',
        eventId: legacyV2.eventId,
        recommendationKey: legacyV2.recommendationKey,
        predicate: { kind: 'threshold', basis: 'close', comparator: 'lte', value: 100 },
        horizon: { kind: 'next-session', resolutionDate: '2026-07-15' },
        outcomeClass: 'satisfied',
        outcomeValue: -2.4,
        resolvedAt: '2026-07-15T20:00:00.000Z',
    };
    const expected = { code: claims.LEGACY_BACKFILL_CODE, reason: 'claimless-row-unscoreable', field: claims.CLAIM_REF_FIELD };

    for (const [label, row] of [['legacy v2', legacyV2], ['legacy v1', legacyV1]]) {
        assert.equal(
            Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD),
            false,
            `${label}: the row under test must genuinely carry no claimRef`,
        );
        assertRowRefusal(claims.authorizeResolutionWrite(row, plausible), expected, `${label} + plausible predicate`);

        // Nothing about the resolution can change the answer: an empty one refuses identically, so
        // the refusal is a property of the ROW and the resolution is never consulted to reach it.
        assertRowRefusal(claims.authorizeResolutionWrite(row, {}), expected, `${label} + empty resolution`);
        assertRowRefusal(claims.authorizeResolutionWrite(row, null), expected, `${label} + absent resolution`);

        // The refusal names the event it refused, so an operator can find the row.
        assert.equal(claims.authorizeResolutionWrite(row, plausible).error.eventId, row.eventId, `${label}: names the event`);
    }

    /* ANTI-VACUITY. The IDENTICAL plausible resolution against the SAME row plus a claimRef is
       ACCEPTED. Without this the refusals above would pass under an implementation that refused
       every resolution, which would guard nothing. */
    const pointer = claims.stableSha({ contractVersion: claims.CONTRACT_VERSION, eventId: legacyV2.eventId });
    const bearing = { ...legacyV2, [claims.CLAIM_REF_FIELD]: pointer };
    const authorized = claims.authorizeResolutionWrite(bearing, plausible);
    assert.equal(authorized.ok, true, 'a claimRef-bearing row accepts the identical resolution');
    assert.equal(authorized.claimRef, pointer, 'the authorization returns the pointer to resolve against');
    assert.equal(authorized.eventId, legacyV2.eventId, 'and the event it belongs to');

    // A null pointer is NOT a claim reference. Absence is the marker; a null would be a back-fill
    // wearing the marker's clothes, and it must refuse on the contract rather than resolve.
    assertRowRefusal(
        claims.authorizeResolutionWrite({ ...legacyV2, [claims.CLAIM_REF_FIELD]: null }, plausible),
        { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'claim-ref-not-opaque-sha256', field: claims.CLAIM_REF_FIELD },
        'null claimRef',
    );

    // PRECEDENCE. A malformed row is a different defect and must not be reported as legacy — that
    // would hide it. And on a valid claimRef-bearing row a malformed resolution surfaces as a row
    // contract violation rather than as a silent accept.
    assertRowRefusal(
        claims.authorizeResolutionWrite({ ...legacyV2, resolutionRef: 'x' }, plausible),
        { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'unknown-field', field: 'resolutionRef' },
        'malformed row outranks legacy',
    );
    assertRowRefusal(
        claims.authorizeResolutionWrite(bearing, 'a resolution'),
        { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'resolution-not-an-object', field: 'resolution' },
        'malformed resolution on a claim-bearing row',
    );

    // Newly written claimless rows are legacy-equivalent BY CONSTRUCTION: the marker keys on key
    // absence, not on age or on the version stamp, so a refused mint today is as unscoreable as 2026-07.
    const series = committedSeries();
    const payload = mintPairPayload(series[0]);
    const emitted = appendedRecommendationRows(attachClaimRefs(
        buildEventsWithoutHook(payload, loadInstrumentUniverse(REPO_ROOT)),
        payload,
        { root: REPO_ROOT, proposalRunId: PAIR_RUN_ID, proposedAt: PAIR_OCCURRED_AT },
    ));
    const freshClaimless = emitted.find((r) => !Object.prototype.hasOwnProperty.call(r, claims.CLAIM_REF_FIELD));
    assert.ok(freshClaimless, 'a refused mint must produce a fresh claimless row');
    assertRowRefusal(claims.authorizeResolutionWrite(freshClaimless, plausible), expected, 'fresh claimless row');
    const freshBearing = emitted.find((r) => Object.prototype.hasOwnProperty.call(r, claims.CLAIM_REF_FIELD));
    assert.equal(claims.authorizeResolutionWrite(freshBearing, plausible).ok, true, 'the claim-bearing sibling is resolvable');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Scope 03 — the resolved-flat sentinel. Increment 1: the closed outcomeClass vocabulary, the
 * class → contribution routing table, the proposal-frozen flat-band precondition, and
 * RTR-FLAT-ZERO.
 *
 * Every row here is written to fail against the ONE implementation that would otherwise look
 * correct: `outcomeValue === 0`. That classifier passes any fixture built around an exact zero,
 * and it is also what `Math.abs(v) <= flatBand` silently degrades into when the band is `null`,
 * because `null` coerces to `0` in a relational comparison. So the boundary values below are
 * deliberately NON-zero, and the degenerate-band row probes with an exact zero — the one value a
 * band-less classifier would happily accept.
 *
 * The resolution OBJECT contract, `resolutionHash`, the content-addressed write, the partition
 * identity, and the closure-event vocabulary are later increments of this scope and are not
 * asserted here. Rows carrying `(increment 1)` cover part of their Test Plan row, not all of it.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/* Hand-declared rather than read from the module. Iterating the module's own vocabulary would make
 * the completeness assertion vacuous — a seventh class added tomorrow would cover itself. Declaring
 * the six independently and then proving the two lists are equal is what makes an unaccompanied
 * addition fail here instead of shipping unrouted. */
const EXPECTED_OUTCOME_ROUTING = {
    win: 'number',
    loss: 'number',
    'resolved-flat': 'count',
    unresolved: 'count',
    'not-evaluable': 'count',
    'unresolvable-legacy': 'count',
};

/** A minted claim from a real committed fixture, with `magnitude.flatBand` overridden verbatim. */
function claimWithBand(band) {
    const claim = structuredClone(mintEvaluable('evaluable-instrument-add'));
    claim.magnitude.flatBand = band;
    return claim;
}

const DEGENERATE_BAND_VIOLATION = { reason: 'flat-band-not-finite-positive', field: 'magnitude.flatBand' };

test('T-03-U1: outcomeClass at the flatBand boundary, where an `=== 0` classifier fails', () => {
    // The band comes from a REAL minted claim, so the row is written against the frozen term the
    // classifier must read rather than against a value the test chose.
    const claim = mintEvaluable('evaluable-instrument-add');
    const band = claim.magnitude.flatBand;
    assert.equal(Number.isFinite(band) && band > 0, true, 'the fixture must carry a finite positive band');
    assert.notEqual(band, 0, 'the boundary values below must be non-zero for this row to bite');

    // EXACTLY at each edge: resolved-flat, because the band is inclusive. An `=== 0` classifier
    // calls +band a win and -band a loss, so it fails both of these.
    for (const [value, label] of [[band, '+flatBand'], [-band, '-flatBand']]) {
        const at = claims.classifyOutcome(value, claim);
        assert.equal(at.ok, true, `${label}: expected a classification`);
        assert.equal(at.outcomeClass, 'resolved-flat', `${label} is inside the band`);
        assert.equal(at.contribution, claims.CONTRIBUTION_COUNT, `${label} contributes a count`);
    }

    // One ulp OUTSIDE each edge: directional. The pair isolates the comparison itself — the only
    // difference between these four inputs is the last representable bit.
    const justAbove = band + Number.EPSILON * band;
    const justBelow = -justAbove;
    assert.notEqual(justAbove, band, 'the ulp step must actually move the value');
    assert.equal(claims.classifyOutcome(justAbove, claim).outcomeClass, 'win', 'one ulp above +flatBand is a win');
    assert.equal(claims.classifyOutcome(justBelow, claim).outcomeClass, 'loss', 'one ulp below -flatBand is a loss');
    assert.equal(claims.classifyOutcome(justAbove, claim).contribution, claims.CONTRIBUTION_NUMBER);
    assert.equal(claims.classifyOutcome(justBelow, claim).contribution, claims.CONTRIBUTION_NUMBER);

    // An exact zero is resolved-flat too — but it is the ONLY value an `=== 0` classifier gets
    // right, which is why it is asserted last and never alone.
    assert.equal(claims.classifyOutcome(0, claim).outcomeClass, 'resolved-flat', 'an exact zero is resolved-flat');

    // THE EXACT UNROUNDED VALUE SURVIVES. No ±ε nudge, no rounding, no fabricated sign: a flat
    // outcome pushed to +ε to land in `wins` would manufacture a direction the data never showed.
    for (const value of [band, -band, 0, justAbove, justBelow, 0.1234567890123456]) {
        const classified = claims.classifyOutcome(value, claim);
        assert.equal(Object.is(classified.outcomeValue, value), true, `${value}: the value is carried through verbatim`);
        assert.equal(Math.sign(classified.outcomeValue), Math.sign(value), `${value}: the sign is never fabricated`);
    }
});

test('T-03-U2: RTR-FLAT-ZERO refuses a bare zero reaching the directional array', () => {
    // The exact code, asserted as a literal. A renamed constant must fail here.
    assert.equal(claims.FLAT_ZERO_CODE, 'RTR-FLAT-ZERO', 'the owned refusal code');

    const expected = { code: claims.FLAT_ZERO_CODE, reason: 'bare-zero-in-directional-array' };

    // Half one: a literal `0` placed in the array handed to the primitive.
    const literal = claims.assertZeroFreeOutcomes([1.5, 0, -1.5]);
    assert.equal(literal.ok, false, 'a bare zero in the array must refuse');
    assert.equal(literal.error.code, expected.code, 'code');
    assert.equal(literal.error.reason, expected.reason, 'reason');
    assert.equal(literal.error.index, 1, 'the refusal names the offending position');

    // `-0 === 0` is true, and the primitive would drop a negative zero into `unresolved` exactly
    // as it drops a positive one, so the gate must catch both.
    assert.equal(claims.assertZeroFreeOutcomes([1.5, -0]).error.code, expected.code, 'negative zero refuses too');

    // Half two: a resolved-flat record's own outcomeValue routed onto the number side instead of
    // being counted. The value is taken from a real classification, not typed in.
    const flat = claims.classifyOutcome(0, mintEvaluable('evaluable-instrument-add'));
    assert.equal(flat.outcomeClass, 'resolved-flat', 'the record under test must genuinely be resolved-flat');
    assert.equal(flat.contribution, claims.CONTRIBUTION_COUNT, 'and it must genuinely be a counted class');
    const misrouted = claims.assertZeroFreeOutcomes([1.5, flat.outcomeValue]);
    assert.equal(misrouted.error.code, expected.code, 'a mis-routed resolved-flat value refuses');
    assert.equal(misrouted.error.reason, expected.reason);

    // Nothing is coerced into a zero: a non-number refuses for what it actually is.
    assertViolation(claims.assertZeroFreeOutcomes([1.5, '0']), { reason: 'outcome-value-not-finite', field: 'outcomes[1]' }, 'string zero');
    assertViolation(claims.assertZeroFreeOutcomes([1.5, null]), { reason: 'outcome-value-not-finite', field: 'outcomes[1]' }, 'null');
    assertViolation(claims.assertZeroFreeOutcomes([NaN]), { reason: 'outcome-value-not-finite', field: 'outcomes[0]' }, 'NaN');

    /* ANTI-VACUITY. The identical array with the zero removed is ACCEPTED. Without this the
       refusals above would pass under an implementation that refused every array. */
    const accepted = claims.assertZeroFreeOutcomes([1.5, -1.5]);
    assert.equal(accepted.ok, true, 'a zero-free array is accepted');
    assert.deepEqual(accepted.outcomes, [1.5, -1.5], 'and is returned unaltered');
});

test('T-03-U3 (increment 1): the routing table feeds only win and loss to the directional array', () => {
    // The table is the module's, the expectation is the test's, and they must agree.
    assert.deepEqual(
        Object.keys(EXPECTED_OUTCOME_ROUTING).sort(),
        [...claims.OUTCOME_CLASSES].sort(),
        'a class added to the vocabulary without a declared contribution must fail here',
    );
    for (const [outcomeClass, contribution] of Object.entries(EXPECTED_OUTCOME_ROUTING)) {
        assert.equal(claims.OUTCOME_CONTRIBUTIONS[outcomeClass], contribution, `${outcomeClass} contribution`);
    }
    assert.deepEqual([...claims.DIRECTIONAL_OUTCOME_CLASSES], ['win', 'loss'], 'the number side');
    assert.deepEqual(
        [...claims.COUNTED_OUTCOME_CLASSES],
        ['resolved-flat', 'unresolved', 'not-evaluable', 'unresolvable-legacy'],
        'the count side',
    );

    /* The adversarial member is the NON-zero resolved-flat: a routing bug that pushed it onto the
       number side would slip straight past RTR-FLAT-ZERO, because 0.1 is a perfectly legal
       element. Only the array's contents can catch that one. */
    const routed = claims.routeOutcomes([
        { outcomeClass: 'win', outcomeValue: 1.5 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0.1 },
        { outcomeClass: 'loss', outcomeValue: -2.25 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0 },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'not-evaluable', outcomeValue: null },
        { outcomeClass: 'unresolvable-legacy' },
        { outcomeClass: 'win', outcomeValue: 0.75 },
    ]);
    assert.equal(routed.ok, true, 'the mixed cohort routes');
    assert.deepEqual(routed.directional, [1.5, -2.25, 0.75], 'only win and loss values reach the array, in order');
    for (const value of routed.directional) {
        assert.equal(Number.isFinite(value), true, 'every element is finite');
        assert.notEqual(value, 0, 'and strictly non-zero');
    }
    assert.equal(routed.directional.includes(0.1), false, 'the non-zero flat value is withheld, not fed');
    assert.deepEqual(
        routed.counts,
        { 'resolved-flat': 2, unresolved: 1, 'not-evaluable': 1, 'unresolvable-legacy': 1 },
        'the four withheld classes contribute counts',
    );
    assert.equal(routed.resolvedDirectional, 3, 'resolvedDirectional is the array length, and so the denominator');
    assert.equal(routed.resolvedDirectional, routed.directional.length);

    // A class that never fired reads as an explicit 0 rather than a missing key: a missing bucket
    // is how a partition quietly stops summing to the proposed total.
    const winsOnly = claims.routeOutcomes([{ outcomeClass: 'win', outcomeValue: 1 }]);
    assert.deepEqual(
        Object.keys(winsOnly.counts).sort(),
        [...claims.COUNTED_OUTCOME_CLASSES].sort(),
        'every counted class is present in the tally',
    );
    for (const outcomeClass of claims.COUNTED_OUTCOME_CLASSES) {
        assert.equal(winsOnly.counts[outcomeClass], 0, `${outcomeClass} reads zero, not undefined`);
    }

    // An empty cohort is reachable and reports zero — the branch a caller needs BEFORE reaching a
    // primitive that refuses an empty array. It is not an error here.
    const empty = claims.routeOutcomes([{ outcomeClass: 'unresolved', outcomeValue: null }]);
    assert.equal(empty.ok, true);
    assert.equal(empty.resolvedDirectional, 0, 'an all-withheld cohort reports zero directional calls');
    assert.deepEqual(empty.directional, []);

    // A win carrying no usable magnitude refuses rather than being counted as a zero.
    assertViolation(
        claims.routeOutcomes([{ outcomeClass: 'win', outcomeValue: null }]),
        { reason: 'outcome-value-not-finite', field: 'records[0].outcomeValue' },
        'directional record with no value',
    );
});

test('T-03-U6 (increment 1): the outcomeClass vocabulary refuses a one-character-off value', () => {
    const covered = new Set();
    const expected = { reason: 'outcome-class-not-allowed', field: 'outcomeClass' };

    for (const [legal, contribution] of Object.entries(EXPECTED_OUTCOME_ROUTING)) {
        const offending = legal.slice(0, -1);
        assert.equal(claims.OUTCOME_CLASSES.includes(legal), true, `${legal}: the declared member must be in the vocabulary`);
        assert.equal(claims.OUTCOME_CLASSES.includes(offending), false, `${offending}: must be outside the vocabulary`);
        assert.equal(legal.startsWith(offending), true, `${offending}: must defeat a prefix or startsWith check`);

        assertViolation(claims.outcomeContributionFor(offending), expected, `outcomeClass "${offending}"`);
        assertViolation(claims.routeOutcomes([{ outcomeClass: offending, outcomeValue: 1 }]), expected, `routed "${offending}"`);

        // The pair isolates the character: the legal member is accepted and routes as declared.
        const accepted = claims.outcomeContributionFor(legal);
        assert.equal(accepted.ok, true, `${legal}: the legal member must be accepted`);
        assert.equal(accepted.contribution, contribution, `${legal}: declared contribution`);
        covered.add(legal);
    }

    // Nothing is coerced, and nothing resolves through the prototype: an inherited property name
    // refuses like any other value outside the vocabulary.
    for (const outside of ['constructor', 'toString', '__proto__', 'WIN', ' win', '', null, undefined, 0, {}]) {
        assertViolation(claims.outcomeContributionFor(outside), expected, `outside value ${JSON.stringify(outside)}`);
    }

    assert.deepEqual(
        [...covered].sort(),
        [...claims.OUTCOME_CLASSES].sort(),
        'every member of the closed vocabulary must be probed by a declared expectation',
    );
});

test('T-03-U7: a degenerate flatBand refuses before any outcomeClass is assigned', () => {
    // Layer one is the mint, which refuses a degenerate band at proposal (F-015-03-01, scope 01).
    // This row asserts layer two: the consuming side never classifies against one either.
    assert.equal(claims.MINT_REFUSALS.includes('no-authored-flat-band'), true, 'the mint-side refusal exists');

    /* THE ADVERSARIAL VALUE IS 0, NOT A SMALL NUMBER. `Math.abs(0) <= null` is `true`, so a
       classifier that skipped the precondition would answer `resolved-flat` here and look correct.
       `Math.abs(1e-320) <= null` is `false`, so the same classifier would call a vanishing value a
       win. That pair IS the `=== 0` behaviour T-03-U1 exists to defeat, reached with no `=== 0`
       written anywhere — which is why the precondition is asserted rather than assumed. */
    const degenerate = [
        ['null', null],
        ['absent', undefined],
        ['negative', -0.25],
        ['zero', 0],
        ['non-numeric', '0.25'],
        ['NaN', Number.NaN],
        ['Infinity', Number.POSITIVE_INFINITY],
    ];

    for (const [label, band] of degenerate) {
        const claim = claimWithBand(band);
        if (label === 'absent') delete claim.magnitude.flatBand;

        for (const value of [0, 1e-320, -1e-320, 0.1, -0.1, 5]) {
            const result = claims.classifyOutcome(value, claim);
            assertViolation(result, DEGENERATE_BAND_VIOLATION, `band ${label}, value ${value}`);
            assert.equal(
                Object.prototype.hasOwnProperty.call(result, 'outcomeClass'),
                false,
                `band ${label}, value ${value}: no outcomeClass may be assigned`,
            );
            assert.equal(
                Object.prototype.hasOwnProperty.call(result, 'outcomeValue'),
                false,
                `band ${label}, value ${value}: no value may be carried out of a refusal`,
            );
        }

        // The band is never repaired, defaulted, or substituted on the way out.
        assert.equal(claims.flatBandFor(claim).ok, false, `band ${label}: the precondition refuses`);
        assert.equal(
            Object.prototype.hasOwnProperty.call(claims.flatBandFor(claim), 'flatBand'),
            false,
            `band ${label}: no band is supplied by the consumer`,
        );
    }

    /* ANTI-VACUITY. The SAME claim with the band restored classifies every one of those values,
       so the refusals above are caused by the band and by nothing else. */
    const repaired = claimWithBand(0.25);
    assert.equal(claims.flatBandFor(repaired).flatBand, 0.25, 'the repaired band is read verbatim');
    assert.equal(claims.classifyOutcome(0, repaired).outcomeClass, 'resolved-flat');
    assert.equal(claims.classifyOutcome(1e-320, repaired).outcomeClass, 'resolved-flat');
    assert.equal(claims.classifyOutcome(5, repaired).outcomeClass, 'win');
    assert.equal(claims.classifyOutcome(-5, repaired).outcomeClass, 'loss');

    // A malformed outcome value refuses AFTER the band precondition and on its own field, so the
    // two defects stay distinguishable.
    assertViolation(
        claims.classifyOutcome('1.5', repaired),
        { reason: 'outcome-value-not-finite', field: 'outcomeValue' },
        'non-numeric outcome value',
    );
    assertViolation(claims.classifyOutcome(0, {}), { reason: 'claim-magnitude-invalid', field: 'magnitude' }, 'claim with no magnitude');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Scope 03, increment 2 — `brief-recommendation-resolution/v1`: the record a resolved claim
 * produces, its content address, its content-addressed write, and the class partition.
 *
 * Two properties carry this increment and both are asserted against a MUTATION rather than
 * against a shape. The record must hold the EXACT unrounded value, so every value below is one a
 * `toFixed`, a `Math.round`, or a `±ε` nudge would visibly change — a fixture of `0.5` survives
 * all three and would prove nothing. And the digest must cover EXACTLY the eight hashed terms, so
 * each term is mutated in turn and each excluded field is mutated in turn, driven by the module's
 * own two lists: a field moved between them fails here rather than silently leaving the address.
 *
 * Rows carrying `(unit precursor)` cover the function-level half of a Test Plan row whose own file
 * is `.functional.mjs`. The cohort-level halves of T-03-F1 and T-03-F2 remain outstanding, as does
 * the resolutions fixture tree of plan step 12.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const validationRequire = createRequire(import.meta.url);

/** The 007-owned primitive, consumed UNMODIFIED and loaded lazily so importing opens nothing. */
function summarizeOutcomes(values) {
    return validationRequire('../rlvalidation.js').rlvSummarizeOutcomes(values);
}

/** The closure vocabulary, read from rlcontracts.js's own source text — never a local copy. */
function closureVocabulary() {
    return claims.readClosureEventVocabulary(foundationSourceText());
}

/** A real minted claim's content address. Never a hand-typed digest. */
function resolvedClaimHash() {
    return claims.claimHash(mintEvaluable('evaluable-instrument-add'));
}

/** A real committed v2 row, so the write rows are anchored on what is on disk. */
function committedV2Row() {
    const row = committedLedgerLines()
        .map((line) => JSON.parse(line))
        .find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(row, 'the committed ledger must carry a v2 row for these rows to mean anything');
    return row;
}

/** The same row made resolvable by the single optional pointer scope 02 added. */
function resolvableRow(claimHash) {
    return { ...committedV2Row(), [claims.CLAIM_REF_FIELD]: claimHash };
}

/**
 * A resolution input in which every field is a legal member of its own vocabulary, so a refusal
 * below is caused by the ONE overridden value and never by incidental malformation.
 */
function resolutionInput(overrides = {}) {
    return {
        closureVocabulary: closureVocabulary(),
        claimHash: resolvedClaimHash(),
        eventId: committedV2Row().eventId,
        resolutionDate: '2026-07-15',
        closureEventType: 'satisfied',
        outcomeClass: 'resolved-flat',
        outcomeValue: 0,
        reasonCode: 'predicate-satisfied',
        provenance: { seriesRef: 'bars/SPY/1d', entryDate: '2026-07-14', entryBasis: 'close' },
        lifecycleBinding: { runId: 'run-2026-07-15T20-00-00', resolvedAt: '2026-07-15T20:00:00.000Z' },
        ...overrides,
    };
}

function builtResolution(overrides = {}) {
    const built = claims.buildResolution(resolutionInput(overrides));
    assert.equal(built.ok, true, `buildResolution refused: ${JSON.stringify(built.error)}`);
    return built.resolution;
}

/* Values a rounding step or an ε-nudge would visibly change, and every one of them inside the
   fixture's authored band. None is a round number, because a round number survives every mutation
   this row exists to detect. */
const UNROUNDED_FLAT_VALUES = Object.freeze([
    0,
    0.1234567890123456,
    -0.1234567890123456,
    Number.MIN_VALUE,
    -1e-320,
    0.1 + 0.2 - 0.3,
]);

test('T-03-U5: the exact unrounded outcomeValue survives into the record, the bytes, and the store', () => {
    const claim = mintEvaluable('evaluable-instrument-add');

    for (const value of UNROUNDED_FLAT_VALUES) {
        // The class is decided by the module against the PROPOSAL-FROZEN band, never asserted here.
        const classified = claims.classifyOutcome(value, claim);
        assert.equal(classified.outcomeClass, 'resolved-flat', `${value}: must genuinely be inside the authored band`);

        const resolution = builtResolution({ outcomeValue: classified.outcomeValue });

        // VERBATIM in the record. Object.is rather than ===, so a -0 rewritten to 0 is caught too.
        assert.equal(Object.is(resolution.outcomeValue, value), true, `${value}: carried verbatim into the record`);

        // VERBATIM through serialization: the bytes that reach disk parse back to the same double.
        const parsed = JSON.parse(claims.serializeResolution(resolution));
        assert.equal(Object.is(parsed.outcomeValue, value), true, `${value}: survives serialization unchanged`);

        // VERBATIM on disk, through the real content-addressed write.
        withDisposableStore(({ root, ports }) => {
            const written = claims.writeResolutionObject(resolution, resolvableRow(resolution.claimHash), ports);
            assert.equal(written.ok, true, `${value}: the record must be written`);
            const onDisk = JSON.parse(readBytes(path.join(root, written.path)));
            assert.equal(Object.is(onDisk.outcomeValue, value), true, `${value}: survives the write unchanged`);
        });
    }

    /* THE ADVERSARIAL HALF. Each mutation is exactly what an implementation "tidying" the value
       would do, and each must produce a different record AND a different content address. Without
       this the assertions above would also pass under an implementation that rounded consistently
       — the row would be agreeing with the bug rather than detecting it. */
    const exact = 0.1234567890123456;
    const truthful = builtResolution({ outcomeValue: exact });
    const tidyings = {
        'rounded to 6dp': Number(exact.toFixed(6)),
        'rounded to 2dp': Number(exact.toFixed(2)),
        'nudged by one ulp': exact + Number.EPSILON * exact,
        'sign fabricated': -exact,
    };
    for (const [label, mutated] of Object.entries(tidyings)) {
        assert.equal(Object.is(mutated, exact), false, `${label}: the mutation must actually move the value`);
        const nudged = builtResolution({ outcomeValue: mutated });
        assert.notEqual(nudged.outcomeValue, truthful.outcomeValue, `${label}: produces a different record`);
        assert.notEqual(nudged.resolutionHash, truthful.resolutionHash, `${label}: and a different content address`);
    }

    /* HC-7. A resolved-flat record stays distinguishable from an unresolved one IN THE RECORD:
       the class is named and the value is present, where an unresolved record carries an explicit
       null. The two can never read the same to a consumer that only asks whether a value is falsy. */
    assert.equal(claims.MAGNITUDE_BEARING_OUTCOME_CLASSES.includes('resolved-flat'), true, 'resolved-flat carries a magnitude');
    assert.equal(claims.OUTCOME_CONTRIBUTIONS['resolved-flat'], claims.CONTRIBUTION_COUNT, 'while still sitting on the count side');

    const flat = builtResolution({ outcomeValue: 0 });
    const unresolved = builtResolution({
        outcomeClass: 'unresolved',
        closureEventType: 'expired',
        reasonCode: 'horizon-elapsed',
        outcomeValue: null,
    });
    assert.equal(flat.outcomeClass, 'resolved-flat', 'the flat record names its own class');
    assert.equal(unresolved.outcomeClass, 'unresolved', 'and the unresolved record names a different one');
    assert.equal(flat.outcomeValue, 0, 'the flat record carries its exact value');
    assert.equal(unresolved.outcomeValue, null, 'the unresolved record carries an explicit null, never an absent key');
    assert.equal(Object.prototype.hasOwnProperty.call(unresolved, 'outcomeValue'), true, 'the key is present and null');
    assert.notEqual(flat.resolutionHash, unresolved.resolutionHash, 'and the two land at different addresses');

    // The two cannot be conflated in either direction.
    assertViolation(
        claims.buildResolution(resolutionInput({
            outcomeClass: 'unresolved', closureEventType: 'expired', reasonCode: 'horizon-elapsed', outcomeValue: 0,
        })),
        { reason: 'outcome-value-must-be-null', field: 'outcomeValue' },
        'an unresolved record may not carry a value',
    );
    assertViolation(
        claims.buildResolution(resolutionInput({ closureEventType: 'expired', reasonCode: 'horizon-elapsed' })),
        { reason: 'closure-event-not-allowed-for-outcome-class', field: 'closureEventType' },
        'a resolved-flat record may not close under an unresolved event',
    );

    /* A DIRECTIONAL class holding an exact zero is HC-7 one step earlier than the array gate, and
       it refuses with the same owned code rather than being summarised as never resolved. */
    for (const [outcomeClass, legal] of [['win', 1.5], ['loss', -1.5]]) {
        const zeroed = claims.buildResolution(resolutionInput({ outcomeClass, outcomeValue: 0 }));
        assert.equal(zeroed.ok, false, `${outcomeClass}: a bare zero must refuse`);
        assert.equal(zeroed.error.code, claims.FLAT_ZERO_CODE, `${outcomeClass}: code`);
        assertRefusal(zeroed.error, 'bare-zero-in-directional-class', 'outcomeValue', `${outcomeClass} bare zero`);

        // The sign may not contradict the class either, and the legal value is accepted — so the
        // refusals above are about the value and not about the class.
        assertViolation(
            claims.buildResolution(resolutionInput({ outcomeClass, outcomeValue: -legal })),
            { reason: 'outcome-value-sign-contradicts-class', field: 'outcomeValue' },
            `${outcomeClass} with a contradicting sign`,
        );
        assert.equal(Object.is(builtResolution({ outcomeClass, outcomeValue: legal }).outcomeValue, legal), true, `${outcomeClass}: verbatim`);
    }
});

test('T-03-U4 (increment 2): summary.unresolved is consumed and discarded while the 015 counts stay distinct', () => {
    /* A cohort that GENUINELY contains all three withheld classes, at deliberately DIFFERENT
       multiplicities: equal counts would let a scorer collapse them into one bucket and still
       agree with this row. */
    const cohort = Object.freeze([
        { outcomeClass: 'win', outcomeValue: 1.5 },
        { outcomeClass: 'win', outcomeValue: 0.75 },
        { outcomeClass: 'loss', outcomeValue: -2.25 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0.1 },
        { outcomeClass: 'resolved-flat', outcomeValue: -0.05 },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'not-evaluable', outcomeValue: null },
        { outcomeClass: 'unresolvable-legacy' },
    ]);
    const routed = claims.routeOutcomes([...cohort]);
    assert.equal(routed.ok, true, 'the mixed cohort must route');

    const counts = routed.counts;
    assert.deepEqual(
        [counts['resolved-flat'], counts.unresolved, counts['not-evaluable']],
        [3, 2, 1],
        'the three 015-owned counts are non-zero AND pairwise distinct, so a merged bucket cannot agree with this row',
    );

    // THE PRIMITIVE, UNMODIFIED, ON THE FED ARRAY.
    const summary = summarizeOutcomes(routed.directional);
    assert.equal(summary.ok, true, 'the primitive must accept a zero-free finite array');
    assert.equal(summary.unresolved, 0, 'summary.unresolved is 0 BY CONSTRUCTION and therefore says nothing');
    assert.equal(summary.count, routed.resolvedDirectional, 'the primitive counts exactly the fed array');
    assert.equal(summary.wins + summary.losses, routed.resolvedDirectional, 'wins and losses exhaust it');
    assert.equal(summary.winRate, summary.wins / routed.resolvedDirectional, 'winRate divides by the fed length');

    /* THE LIE THE FIELD WOULD TELL. Seven claims in this cohort did not resolve directionally, so
       surfacing `summary.unresolved` would read as "0 unresolved" beside a visible unresolved
       column. The gap is asserted, so a scorer that surfaced the field fails here. */
    const withheld = counts['resolved-flat'] + counts.unresolved + counts['not-evaluable'] + counts['unresolvable-legacy'];
    assert.equal(withheld, 7, 'the cohort genuinely contains non-directional claims');
    assert.notEqual(summary.unresolved, counts.unresolved, 'the primitive field is NOT the 015 unresolved count');
    assert.notEqual(summary.unresolved, withheld, 'and it is not the total withheld either');
    assert.equal(routed.resolvedDirectional + withheld, cohort.length, 'the two sides account for the whole cohort');

    /* THE ADVERSARIAL HALF: the counterfactual. Had one resolved-flat value been fed to the
       primitive instead of counted, the primitive would have reported it as never resolved — the
       exact HC-7 failure — and would have moved the published denominator with it. */
    const misfed = summarizeOutcomes([...routed.directional, 0]);
    assert.equal(misfed.ok, true, 'the primitive accepts an array containing a zero');
    assert.equal(misfed.unresolved, 1, 'and silently reports the resolved-flat claim as never resolved');
    assert.notEqual(misfed.winRate, summary.winRate, 'the published denominator moves with it');
    assert.equal(
        claims.assertZeroFreeOutcomes([...routed.directional, 0]).error.code,
        claims.FLAT_ZERO_CODE,
        'which is why the gate refuses that array before it can be built',
    );

    /* An all-withheld cohort is reachable, reports zero, and must NOT reach the primitive: the
       same guard that rejects non-finite values also rejects an empty array. */
    const allWithheld = claims.routeOutcomes(cohort.filter((r) => !['win', 'loss'].includes(r.outcomeClass)));
    assert.equal(allWithheld.resolvedDirectional, 0, 'resolvedDirectional === 0 is reachable');
    const empty = summarizeOutcomes(allWithheld.directional);
    assert.equal(empty.ok, false, 'the primitive refuses an empty array');
    assert.equal(empty.errors[0].code, 'RLV-OUTCOME-VALUES', 'with its own 007-owned code');
});

test('T-03-U6 (increment 2): the closure vocabulary is read from rlcontracts.js and RTR-CLOSURE-VOCAB refuses', () => {
    assert.equal(claims.CLOSURE_VOCAB_CODE, 'RTR-CLOSURE-VOCAB', 'the owned refusal code');
    assert.equal(claims.CLOSURE_VOCABULARY_SOURCE, 'rlcontracts.js', 'the single definition lives upstream');

    const source = foundationSourceText();
    const vocabulary = closureVocabulary();
    assert.deepEqual(
        [...vocabulary],
        ['expired', 'invalidated', 'not-evaluable', 'satisfied', 'unresolved', 'withdrawn'],
        'the six upstream members, sorted',
    );

    /* NOT A LOCAL COPY. The literal is byte-present upstream and absent from 015-authored code, so
       a shadow copy added tomorrow fails here instead of quietly going stale. */
    assert.equal(source.includes('var CLOSE_EVENT_TYPES = Object.freeze({'), true, 'the upstream definition is real');
    const claimsSource = readFileSync(path.join(REPO_ROOT, 'rlclaims.js'), 'utf8');
    assert.equal(/CLOSE_EVENT_TYPES\s*=/.test(claimsSource), false, '015 must not declare its own CLOSE_EVENT_TYPES');
    for (const member of vocabulary) {
        assert.equal(
            new RegExp(`["']${member}["']\\s*:\\s*true`).test(claimsSource),
            false,
            `${member}: must not be shadowed as a 015-local vocabulary member`,
        );
    }

    // The reader THROWS rather than scoring against an absent, empty, renamed or reshaped literal.
    assert.throws(() => claims.readClosureEventVocabulary(''), /source text is required/, 'empty source');
    assert.throws(() => claims.readClosureEventVocabulary(null), /source text is required/, 'absent source');
    assert.throws(
        () => claims.readClosureEventVocabulary(source.replace('var CLOSE_EVENT_TYPES', 'var CLOSE_EVENT_TYPES_RENAMED')),
        /CLOSE_EVENT_TYPES not found/,
        'a renamed literal throws rather than falling back',
    );
    assert.throws(
        () => claims.readClosureEventVocabulary('var CLOSE_EVENT_TYPES = Object.freeze({});'),
        /CLOSE_EVENT_TYPES/,
        'an emptied literal throws',
    );
    assert.throws(
        () => claims.readClosureEventVocabulary('var CLOSE_EVENT_TYPES = Object.freeze({ satisfied: 1 });'),
        /changed shape/,
        'a member that changed shape throws',
    );
    assert.throws(
        () => claims.readClosureEventVocabulary(
            'var CLOSE_EVENT_TYPES = Object.freeze({ withdrawn: true, expired: true, satisfied: true, invalidated: true, unresolved: true });',
        ),
        /closure event 'not-evaluable' is absent/,
        'a dropped member would leave an outcome class unable to close, and throws instead',
    );

    /* THE REFUSAL. One character off a legal member carries the OWNED code and names its field, so
       a vocabulary drift stays distinguishable from a pairing error. The vocabulary check runs
       before the pairing check, so this holds for `withdrawn` too. */
    for (const legal of vocabulary) {
        const offending = legal.slice(0, -1);
        assert.equal(vocabulary.includes(offending), false, `${offending}: must be outside the vocabulary`);
        assert.equal(legal.startsWith(offending), true, `${offending}: must defeat a prefix or startsWith check`);
        const refused = claims.buildResolution(resolutionInput({ closureEventType: offending }));
        assert.equal(refused.ok, false, `${offending}: must refuse`);
        assert.equal(refused.error.code, claims.CLOSURE_VOCAB_CODE, `${offending}: code`);
        assertRefusal(refused.error, 'closure-event-not-in-vocabulary', 'closureEventType', `closureEventType "${offending}"`);
    }
    for (const outside of ['SATISFIED', ' satisfied', '', null, undefined, 0, {}]) {
        assert.equal(
            claims.buildResolution(resolutionInput({ closureEventType: outside })).error.code,
            claims.CLOSURE_VOCAB_CODE,
            `outside value ${JSON.stringify(outside)}`,
        );
    }

    /* THE VOCABULARY IS CONSUMED, NOT SHADOWED. The acceptance set is the ARGUMENT, so a
       RESTRICTED vocabulary genuinely restricts. An implementation carrying its own local copy of
       the six members would accept `invalidated` here and fail this pair — which the static scan
       above cannot catch, because it cannot see a copy written as an inline array literal. */
    const restricted = claims.buildResolution(resolutionInput({
        closureVocabulary: ['satisfied'], closureEventType: 'invalidated', reasonCode: 'predicate-invalidated',
    }));
    assert.equal(restricted.ok, false, 'a member outside the SUPPLIED vocabulary must refuse');
    assert.equal(restricted.error.code, claims.CLOSURE_VOCAB_CODE, 'restricted vocabulary: code');
    assertRefusal(restricted.error, 'closure-event-not-in-vocabulary', 'closureEventType', 'restricted vocabulary');
    assert.equal(
        builtResolution({
            closureVocabulary: ['satisfied', 'invalidated'], closureEventType: 'invalidated', reasonCode: 'predicate-invalidated',
        }).closureEventType,
        'invalidated',
        'the identical value is accepted once the supplied vocabulary admits it, so the refusal is about the argument',
    );
    // An absent or empty vocabulary refuses rather than falling back to a local copy.
    for (const bad of [undefined, null, [], 'satisfied', {}]) {
        assertViolation(
            claims.buildResolution(resolutionInput({ closureVocabulary: bad })),
            { reason: 'closure-vocabulary-invalid', field: 'closureVocabulary' },
            `closureVocabulary ${JSON.stringify(bad)}`,
        );
    }

    /* ANTI-VACUITY. Every legal member is ACCEPTED by a class that admits it. Without this the
       refusals above would pass under an implementation that refused every closure event. */
    const admittedBinding = {
        satisfied: { outcomeClass: 'resolved-flat', reasonCode: 'predicate-satisfied' },
        invalidated: { outcomeClass: 'resolved-flat', reasonCode: 'predicate-invalidated' },
        expired: { outcomeClass: 'unresolved', reasonCode: 'horizon-elapsed', outcomeValue: null },
        unresolved: { outcomeClass: 'unresolved', reasonCode: 'session-absent', outcomeValue: null },
        'not-evaluable': { outcomeClass: 'not-evaluable', reasonCode: 'no-committed-reference', outcomeValue: null },
    };
    for (const [closureEventType, binding] of Object.entries(admittedBinding)) {
        const built = builtResolution({ closureEventType, ...binding });
        assert.equal(built.closureEventType, closureEventType, `${closureEventType}: the legal member is accepted`);
    }

    /* `withdrawn` exists upstream and NO outcome class admits it — a withdrawal is an authoring
       act, and a resolver that could withdraw a claim could withdraw the ones it was about to
       score badly. The property is DERIVED from the pairing table rather than restated. */
    const admitted = new Set(Object.values(claims.OUTCOME_CLOSURE_EVENTS).flat());
    assert.deepEqual(
        vocabulary.filter((name) => !admitted.has(name)),
        ['withdrawn'],
        'withdrawn is the only upstream closure event no outcome class admits',
    );
    assert.deepEqual([...admitted].sort(), Object.keys(admittedBinding).sort(), 'and every other member is admitted by some class');
    for (const outcomeClass of claims.OUTCOME_CLASSES) {
        const expected = outcomeClass === 'unresolvable-legacy'
            ? { reason: 'outcome-class-carries-no-resolution', field: 'outcomeClass' }
            : { reason: 'closure-event-not-allowed-for-outcome-class', field: 'closureEventType' };
        assertViolation(
            claims.buildResolution(resolutionInput({ outcomeClass, closureEventType: 'withdrawn' })),
            expected,
            `${outcomeClass} closing as withdrawn`,
        );
    }

    // A legacy row carries no claim, so there is nothing to address a resolution BY — the record
    // side of the same fact RTR-LEGACY-BACKFILL states from the row side.
    assertViolation(
        claims.buildResolution(resolutionInput({ outcomeClass: 'unresolvable-legacy', closureEventType: 'satisfied' })),
        { reason: 'outcome-class-carries-no-resolution', field: 'outcomeClass' },
        'unresolvable-legacy is never recorded',
    );

    // The reason code is bound to the closure EVENT, so a reason legal for a different event refuses.
    assertViolation(
        claims.buildResolution(resolutionInput({ closureEventType: 'satisfied', reasonCode: 'predicate-invalidated' })),
        { reason: 'reason-code-not-allowed-for-closure-event', field: 'reasonCode' },
        'a cross-bound reason code',
    );

    /* Every mint refusal is a legal not-evaluable reason BY CONSTRUCTION, so a claim refused at
       proposal is still recordable and still counted rather than falling out of the denominator. */
    for (const mintReason of claims.MINT_REFUSALS) {
        assert.equal(claims.NOT_EVALUABLE_REASONS.includes(mintReason), true, `${mintReason}: must be recordable`);
        const built = builtResolution({
            outcomeClass: 'not-evaluable', closureEventType: 'not-evaluable', reasonCode: mintReason, outcomeValue: null,
        });
        assert.equal(built.reasonCode, mintReason, `${mintReason}: is carried into the record`);
    }
});

/* The mutation maps ARE the two vocabularies, declared here and proved equal to the module's own
   lists below. A term moved between hashed and unhashed — or a ninth term added — fails there. */
const RESOLUTION_HASHED_MUTATIONS = Object.freeze({
    contractVersion: 'brief-recommendation-resolution/v2',
    claimHash: `sha256:${'f'.repeat(64)}`,
    resolutionDate: '2026-07-16',
    closureEventType: 'invalidated',
    outcomeClass: 'win',
    outcomeValue: 1.5,
    reasonCode: 'predicate-invalidated',
    provenance: { seriesRef: 'bars/QQQ/1d', entryDate: '2026-07-14', entryBasis: 'open' },
});
const RESOLUTION_UNHASHED_MUTATIONS = Object.freeze({
    eventId: 'evt-a-completely-different-event',
    lifecycleBinding: { runId: 'run-tomorrow', resolvedAt: '2027-01-01T00:00:00.000Z' },
});

test('T-03-F1 (unit precursor): resolutionHash covers exactly the hashed terms, and the write is a no-op or a refusal', () => {
    assert.deepEqual(Object.keys(RESOLUTION_HASHED_MUTATIONS).sort(), [...claims.RESOLUTION_HASHED_TERMS].sort(), 'the hashed terms');
    assert.deepEqual(Object.keys(RESOLUTION_UNHASHED_MUTATIONS).sort(), [...claims.RESOLUTION_UNHASHED_FIELDS].sort(), 'the excluded fields');

    // The three lists partition the record exhaustively, with no overlap and nothing outside.
    assert.deepEqual(
        [...claims.RESOLUTION_FIELDS],
        [...new Set([...claims.RESOLUTION_HASHED_TERMS, ...claims.RESOLUTION_UNHASHED_FIELDS, 'resolutionHash'])].sort(),
        'hashed + excluded + the digest IS the declared field set',
    );
    assert.equal(
        claims.RESOLUTION_HASHED_TERMS.some((term) => claims.RESOLUTION_UNHASHED_FIELDS.includes(term)),
        false,
        'no field is both hashed and excluded',
    );

    const resolution = builtResolution();
    assert.deepEqual(Object.keys(resolution).sort(), [...claims.RESOLUTION_FIELDS], 'the record carries exactly the declared fields');
    assert.equal(resolution.contractVersion, 'brief-recommendation-resolution/v1', 'the owned contract version');

    /* THE ADDRESS IS EXACTLY THE EIGHT TERMS, derived independently here rather than by calling
       the module's own extractor — which would only prove the module agrees with itself. */
    const hashedOnly = {};
    for (const term of claims.RESOLUTION_HASHED_TERMS) hashedOnly[term] = resolution[term];
    assert.equal(claims.resolutionHash(resolution), claims.stableSha(hashedOnly), 'the address is those eight terms and nothing else');
    assert.equal(resolution.resolutionHash, claims.resolutionHash(resolution), 'and the record is filed under it');

    // EXCLUDED: mutating an unhashed field leaves the address BYTE-IDENTICAL.
    for (const [field, mutation] of Object.entries(RESOLUTION_UNHASHED_MUTATIONS)) {
        const mutated = { ...resolution, [field]: mutation };
        assert.notDeepEqual(mutated[field], resolution[field], `${field}: the mutation must actually change the field`);
        assert.equal(claims.resolutionHash(mutated), resolution.resolutionHash, `${field}: is excluded from the address`);
    }

    // COVERED: mutating any hashed term MOVES the address.
    for (const [term, mutation] of Object.entries(RESOLUTION_HASHED_MUTATIONS)) {
        const mutated = { ...resolution, [term]: mutation };
        assert.notDeepEqual(mutated[term], resolution[term], `${term}: the mutation must actually change the term`);
        assert.notEqual(claims.resolutionHash(mutated), resolution.resolutionHash, `${term}: is load-bearing in the address`);
    }

    // Key order cannot move the address: the canonicalizer sorts, so the same content in reverse
    // key order files under the identical name.
    const reversed = {};
    for (const key of [...Object.keys(resolution)].reverse()) reversed[key] = resolution[key];
    assert.notDeepEqual(Object.keys(reversed), Object.keys(resolution), 'the key order genuinely differs');
    assert.equal(claims.resolutionHash(reversed), resolution.resolutionHash, 'key order does not move the address');

    /* A run id or a wall clock inside the HASHED provenance would move the address on every pass,
       which is exactly the idempotence the content-addressed store exists to provide. */
    for (const runScoped of claims.RUN_SCOPED_KEYS) {
        assertViolation(
            claims.buildResolution(resolutionInput({ provenance: { seriesRef: 'bars/SPY/1d', [runScoped]: 'x' } })),
            { reason: 'run-scoped-key-in-hashed-provenance', field: `provenance.${runScoped}` },
            `provenance.${runScoped}`,
        );
    }
    // The same keys are legal in lifecycleBinding, which is deliberately outside the address.
    assert.equal(
        builtResolution({ lifecycleBinding: RESOLUTION_UNHASHED_MUTATIONS.lifecycleBinding }).resolutionHash,
        resolution.resolutionHash,
        'a different run and wall clock recompute the identical address',
    );

    // The path is the address, at the claim store's depth and under a bare lowercase hex name.
    assert.equal(claims.RESOLUTION_STORE_DIR, 'briefs/objects/resolutions', 'the store directory');
    const hex = resolution.resolutionHash.replace(/^sha256:/, '');
    assert.equal(claims.resolutionObjectPath(resolution.resolutionHash), `${claims.RESOLUTION_STORE_DIR}/${hex}.json`);
    for (const bad of ['sha256:NOTHEX', `sha256:${'F'.repeat(64)}`, `sha256:${'a'.repeat(63)}`, '']) {
        assert.throws(() => claims.resolutionObjectPath(bad), /bare lowercase sha256 hex/, `path from ${JSON.stringify(bad)}`);
    }

    withDisposableStore(({ root, ports }) => {
        const row = resolvableRow(resolution.claimHash);

        const first = claims.writeResolutionObject(resolution, row, ports);
        assert.deepEqual(
            { ok: first.ok, written: first.written, reused: first.reused, path: first.path },
            { ok: true, written: true, reused: false, path: claims.resolutionObjectPath(resolution.resolutionHash) },
        );
        const bytes = readBytes(path.join(root, first.path));
        assert.equal(bytes, claims.serializeResolution(resolution), 'the stored bytes are the canonical serialization');

        // A repeat write of unchanged content is a byte-identical no-op, not a rewrite.
        const second = claims.writeResolutionObject(resolution, row, ports);
        assert.deepEqual({ ok: second.ok, written: second.written, reused: second.reused }, { ok: true, written: false, reused: true });
        assertBytesUnchanged(bytes, readBytes(path.join(root, first.path)), 'repeat write');

        /* RTR-RESOLUTION-CONFLICT. A write that would CHANGE the bytes at an existing address
           aborts rather than overwriting: a silently rewritten outcome is a scoring lie that
           leaves no trace. */
        assert.equal(claims.RESOLUTION_CONFLICT_CODE, 'RTR-RESOLUTION-CONFLICT', 'the owned refusal code');
        const squatted = '{"contractVersion":"squatted"}';
        ports.writeFileSync(path.join(root, first.path), squatted);
        const conflicted = claims.writeResolutionObject(resolution, row, ports);
        assert.equal(conflicted.ok, false, 'a byte-changing write must refuse');
        assert.equal(conflicted.error.code, claims.RESOLUTION_CONFLICT_CODE, 'code');
        assertRefusal(conflicted.error, 'resolution-conflict-refused', 'resolutionHash', 'conflict');
        assert.equal(conflicted.error.path, first.path, 'the refusal names the object it refused to overwrite');
        assertBytesUnchanged(squatted, readBytes(path.join(root, first.path)), 'the refused write left the bytes alone');
    });

    withDisposableStore(({ root, ports }) => {
        /* SCOPE 02'S GATE RUNS FIRST. A well-formed, correctly-addressed record cannot rescue a
           claimless row: the legacy refusal is reached before the resolution is inspected at all,
           so no property of a valid record can buy a back-fill. */
        const claimless = committedV2Row();
        assert.equal(Object.prototype.hasOwnProperty.call(claimless, claims.CLAIM_REF_FIELD), false, 'the row genuinely carries no pointer');
        const refused = claims.writeResolutionObject(resolution, claimless, ports);
        assert.equal(refused.ok, false, 'a claimless row is unscoreable by construction');
        assert.equal(refused.error.code, claims.LEGACY_BACKFILL_CODE, 'code');
        assertRefusal(refused.error, 'claimless-row-unscoreable', claims.CLAIM_REF_FIELD, 'claimless row');
        assert.equal(existsSync(path.join(root, claims.RESOLUTION_STORE_DIR)), false, 'and nothing was written');

        // The record must be ABOUT the claim the row points at, and its address must BE its content.
        assertViolation(
            claims.writeResolutionObject(resolution, resolvableRow(`sha256:${'b'.repeat(64)}`), ports),
            { reason: 'resolution-claim-hash-does-not-match-row', field: 'claimHash' },
            'a pointer mismatch',
        );
        assertViolation(
            claims.writeResolutionObject({ ...resolution, resolutionHash: `sha256:${'c'.repeat(64)}` }, resolvableRow(resolution.claimHash), ports),
            { reason: 'resolution-hash-does-not-match-content', field: 'resolutionHash' },
            'a forged address',
        );
        assertViolation(
            claims.writeResolutionObject({ ...resolution, resolutionRef: 'x' }, resolvableRow(resolution.claimHash), ports),
            { reason: 'unknown-field', field: 'resolutionRef' },
            'an unknown field on the record',
        );
        assert.equal(existsSync(path.join(root, claims.RESOLUTION_STORE_DIR)), false, 'no refusal wrote anything');
    });
});

/* Hand-declared rather than read from the module, for the same reason EXPECTED_OUTCOME_ROUTING is:
   iterating the module's own table would let a seventh class cover itself. */
const EXPECTED_PARTITION_BUCKET_FOR_CLASS = Object.freeze({
    win: 'resolvedDirectional',
    loss: 'resolvedDirectional',
    'resolved-flat': 'resolvedFlat',
    unresolved: 'unresolved',
    'not-evaluable': 'notEvaluable',
    'unresolvable-legacy': 'unresolvableLegacy',
});
const EXPECTED_NON_CLASS_BUCKETS = Object.freeze(['withdrawn', 'open']);

test('T-03-F2 (unit precursor): the partition accounts for every proposed call, and no claim can fall out', () => {
    assert.deepEqual(
        Object.keys(EXPECTED_PARTITION_BUCKET_FOR_CLASS).sort(),
        [...claims.OUTCOME_CLASSES].sort(),
        'a class added to the vocabulary without a declared bucket must fail here',
    );
    for (const [outcomeClass, bucket] of Object.entries(EXPECTED_PARTITION_BUCKET_FOR_CLASS)) {
        assert.equal(claims.PARTITION_BUCKET_FOR_CLASS[outcomeClass], bucket, `${outcomeClass} bucket`);
    }
    assert.deepEqual([...claims.NON_CLASS_PARTITION_BUCKETS], [...EXPECTED_NON_CLASS_BUCKETS], 'the two lifecycle states');
    assert.deepEqual(
        [...claims.PARTITION_BUCKETS].sort(),
        [...new Set([...Object.values(EXPECTED_PARTITION_BUCKET_FOR_CLASS), ...EXPECTED_NON_CLASS_BUCKETS])].sort(),
        'the buckets are exactly the class buckets plus the two lifecycle states',
    );
    assert.equal(claims.PARTITION_BUCKETS.length, 7, 'seven buckets, win and loss deliberately sharing one');

    const cohort = Object.freeze([
        { outcomeClass: 'win', outcomeValue: 1.5 },
        { outcomeClass: 'win', outcomeValue: 0.75 },
        { outcomeClass: 'loss', outcomeValue: -2.25 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0 },
        { outcomeClass: 'resolved-flat', outcomeValue: 0.1 },
        { outcomeClass: 'resolved-flat', outcomeValue: -0.05 },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'not-evaluable', outcomeValue: null },
        { outcomeClass: 'unresolvable-legacy' },
    ]);
    const lifecycle = { totalProposed: cohort.length + 3, withdrawn: 2, open: 1 };
    const routed = claims.routeOutcomes([...cohort]);
    const partition = claims.classPartition(routed, lifecycle);

    assert.equal(partition.ok, true, 'the complete accounting is accepted');
    assert.equal(partition.sum, lifecycle.totalProposed, 'and sums to the proposed total');
    assert.deepEqual(
        partition.buckets,
        { resolvedDirectional: 3, resolvedFlat: 3, unresolved: 2, notEvaluable: 1, unresolvableLegacy: 1, withdrawn: 2, open: 1 },
        'every bucket carries its own count, and resolvedDirectional IS the published denominator',
    );
    assert.equal(partition.buckets.resolvedDirectional, routed.directional.length, 'the denominator is the fed array length');

    /* THE ADVERSARIAL HALF: A CLAIM CANNOT FALL OUT. Every one of the seven buckets is dropped in
       turn while the proposed total is held FIXED, and each drop must be detected with the exact
       shortfall. A partition assertion that only ever sees a correct cohort is decoration. */
    for (const outcomeClass of claims.OUTCOME_CLASSES) {
        const index = cohort.findIndex((r) => r.outcomeClass === outcomeClass);
        assert.notEqual(index, -1, `${outcomeClass}: the cohort must genuinely contain one to drop`);
        const dropped = claims.routeOutcomes(cohort.filter((_, i) => i !== index));
        const refused = claims.classPartition(dropped, lifecycle);
        assert.equal(refused.ok, false, `${outcomeClass}: a dropped claim must be detected`);
        assert.equal(refused.error.code, claims.CONTRACT_VIOLATION_CODE, `${outcomeClass}: code`);
        assertRefusal(refused.error, 'partition-does-not-sum-to-proposed', 'totalProposed', `dropped ${outcomeClass}`);
        assert.equal(refused.error.unaccounted, 1, `${outcomeClass}: the refusal names the exact shortfall`);
        assert.equal(refused.error.sum, lifecycle.totalProposed - 1, `${outcomeClass}: and the sum it did reach`);
    }
    for (const bucket of claims.NON_CLASS_PARTITION_BUCKETS) {
        const refused = claims.classPartition(routed, { ...lifecycle, [bucket]: lifecycle[bucket] - 1 });
        assert.equal(refused.ok, false, `${bucket}: a dropped lifecycle claim must be detected`);
        assertRefusal(refused.error, 'partition-does-not-sum-to-proposed', 'totalProposed', `dropped ${bucket}`);
        assert.equal(refused.error.unaccounted, 1, `${bucket}: the refusal names the exact shortfall`);
    }

    /* An ABSENT bucket refuses rather than reading as zero, and an UNKNOWN name refuses rather than
       being ignored. Both are the same defect from two sides: a mistyped bucket silently
       contributes nothing while looking like it contributes. */
    const complete = { ...partition.buckets, totalProposed: lifecycle.totalProposed };
    for (const bucket of claims.PARTITION_BUCKETS) {
        const parts = { ...complete };
        delete parts[bucket];
        assertViolation(claims.assertClassPartition(parts), { reason: 'partition-bucket-absent', field: bucket }, `absent ${bucket}`);
    }
    assertViolation(
        claims.assertClassPartition({ ...complete, resolvedFlats: 0 }),
        { reason: 'unknown-partition-bucket', field: 'resolvedFlats' },
        'a mistyped bucket name',
    );
    for (const bucket of claims.NON_CLASS_PARTITION_BUCKETS) {
        const partial = { ...lifecycle };
        delete partial[bucket];
        assertViolation(claims.classPartition(routed, partial), { reason: 'lifecycle-count-absent', field: bucket }, `absent lifecycle ${bucket}`);
    }

    // Counts are non-negative integers: a float, a negative or a string refuses rather than being
    // rounded or coerced into the sum.
    for (const bad of [1.5, -1, '3', null, Number.NaN]) {
        assertViolation(
            claims.assertClassPartition({ ...complete, open: bad }),
            { reason: 'partition-bucket-not-a-count', field: 'open' },
            `open = ${JSON.stringify(bad)}`,
        );
        assertViolation(
            claims.assertClassPartition({ ...complete, totalProposed: bad }),
            { reason: 'partition-total-not-a-count', field: 'totalProposed' },
            `totalProposed = ${JSON.stringify(bad)}`,
        );
    }

    /* ANTI-VACUITY. The correct accounting is accepted, so every refusal above is caused by the
       dropped or malformed value and not by an assertion that refuses everything. And zero is a
       legal count: an empty cohort is a valid partition of zero rather than an error. */
    assert.equal(claims.assertClassPartition(complete).ok, true, 'the complete accounting is accepted');
    const emptyPartition = claims.classPartition(claims.routeOutcomes([]), { totalProposed: 0, withdrawn: 0, open: 0 });
    assert.equal(emptyPartition.ok, true, 'an empty cohort is a valid partition of zero');
    assert.equal(emptyPartition.sum, 0);
    for (const bucket of claims.PARTITION_BUCKETS) {
        assert.equal(emptyPartition.buckets[bucket], 0, `${bucket} reads an explicit zero, never a missing key`);
    }
});

