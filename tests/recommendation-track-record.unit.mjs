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
import path from 'node:path';
import test from 'node:test';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    assertEvaluable,
    assertRefusal,
    committedSeries,
    foundationActionVocabulary,
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
