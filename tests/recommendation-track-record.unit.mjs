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
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet } from '../scripts/brief-publication.mjs';
import {
    CLOSED_ENTRY_STATE,
    DETERMINED_CLOSURE_CLASS,
    ENTRY_UNBOUND_REASON,
    HORIZON_NOT_REACHED_REASON,
    LIVE_ENTRY_STATE,
    LOOKAHEAD_CODE,
    MEASURED_CLOSURE_EVENTS,
    NOT_DUE_REASON,
    NOT_DUE_REMEDY,
    NO_COMMITTED_REFERENCE_REASON,
    NO_COMMITTED_SERIES_REASON,
    ORIGIN_KEY_TERMS,
    PATH_COMPARATOR_MODE,
    PATH_INCOMPLETE_REASON,
    POINT_COMPARATOR_MODE,
    PREDICATE_INVALIDATED_EVENT,
    PREDICATE_SATISFIED_EVENT,
    PRICE_BASIS_CODE,
    SERIES_NOT_OBSERVED_REASON,
    SESSION_ABSENT_REASON,
    applyClosures,
    basisFingerprint,
    basisValueAt,
    claimEntryBindings,
    closeDueClaims,
    committedSeriesAt,
    dueEntryKeys,
    evaluatePredicate,
    fenceObservations,
    loadBars,
    loadCalendar,
    loadSubjectBars,
    originRecommendationKeyFor,
    outcomeValueFor,
    readBars,
    resolutionAxesFor,
    resolutionFor,
    resolutionProvenanceFor,
    subjectSymbolsFor,
} from '../scripts/brief-resolve-outcomes.mjs';
import { loadInstrumentUniverse, recommendationRowsFromPayload } from '../scripts/recommendation-body.mjs';
import { CLAIM_NOT_EVALUABLE_FIELD, attachClaimRefs, mintClaimRecords } from '../scripts/recommendation-claim-mint.mjs';
import { buildRun } from './fixtures/feature-002/history/history-fixture-builder.mjs';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    assertEvaluable,
    assertRefusal,
    barsDirectoryListing,
    committedSeries,
    foundationActionVocabulary,
    foundationSourceText,
    loadClaimFixture,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    toolsRegistry,
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

/** Mint `evaluable-instrument-add` with `action.claim.priceBasis` replaced verbatim; `undefined`
 *  deletes the key, so absence is tested as a genuinely absent key and not as an authored null. */
function mintWithPriceBasis(priceBasis) {
    const fixture = loadClaimFixture('evaluable-instrument-add');
    const action = structuredClone(fixture.input.action);
    if (priceBasis === undefined) delete action.claim.priceBasis;
    else action.claim.priceBasis = priceBasis;
    return claims.mintClaim(mintInputFrom(fixture, { action }));
}

function mintEvaluableWithPriceBasis(priceBasis) {
    const result = mintWithPriceBasis(priceBasis);
    assertEvaluable(result, `priceBasis ${priceBasis}`);
    return result.claim;
}

test('T-01-U8: priceBasis is a HASHED term, so the basis cannot be chosen after the outcome', () => {
    assert.deepEqual(
        [...claims.PRICE_BASES].sort(),
        ['adjusted-close', 'raw-close'],
        'the vocabulary is the two closing-price fields committed rows actually carry',
    );

    const raw = mintEvaluableWithPriceBasis('raw-close');
    const adjusted = mintEvaluableWithPriceBasis('adjusted-close');

    /* PROVEN, NOT ASSUMED: the two claims are shown to differ at exactly one path BEFORE their
       hashes are compared. Without this, a hash that changed for some unrelated reason would
       still satisfy the assertion below and the term could be unhashed without the row noticing. */
    const differingTerms = claims.HASHED_TERMS.filter(
        (term) => JSON.stringify(raw[term]) !== JSON.stringify(adjusted[term]),
    );
    assert.deepEqual(differingTerms, ['magnitude'], 'exactly one hashed term may differ');
    assert.deepEqual(
        { ...raw.magnitude, priceBasis: null },
        { ...adjusted.magnitude, priceBasis: null },
        'and within magnitude, priceBasis must be the only difference',
    );

    /* THE LOAD-BEARING ASSERTION (Ruling R-04-01). ~74% of committed series have `ac !== c`, so
       `ret(x)` is two functions, not one. A basis outside `claimHash` would let one content
       address yield two different outcomes on two runs — tunable once the result is visible. */
    assert.notEqual(raw.claimHash, adjusted.claimHash, 'priceBasis must be INSIDE claimHash');
    assert.equal(claims.claimHash(raw), raw.claimHash, 'the recorded address is the computed one');

    // The basis is read back verbatim and bound to the row field it names, never re-derived.
    assert.equal(claims.priceBasisFor(raw).rowField, 'c');
    assert.equal(claims.priceBasisFor(adjusted).rowField, 'ac');
});

test('T-01-U9: an absent or out-of-vocabulary priceBasis refuses at the mint', () => {
    assert.equal(claims.MINT_REFUSALS.includes('no-authored-price-basis'), true, 'the reason is a member of the closed set');
    assert.equal(claims.NOT_EVALUABLE_REASONS.includes('no-authored-price-basis'), true, 'and is therefore recordable');

    /* Absent and present-but-outside-the-set are ONE defect, exactly as absent and non-positive
       are one for `flatBand`: both leave `ret(x)` undefined, so the outcome is not merely unknown
       but unmeasurable. `close` and `adjusted` are the near-misses a caller reaches for first and
       neither is a member; `Raw-Close` proves the membership test is not case-folded. */
    const refusing = [
        ['absent', undefined],
        ['null', null],
        ['empty string', ''],
        ['close', 'close'],
        ['adjusted', 'adjusted'],
        ['Raw-Close', 'Raw-Close'],
        ['non-string', 1],
    ];

    for (const [label, basis] of refusing) {
        const result = mintWithPriceBasis(basis);
        assert.equal(result.ok, true, `${label}: the claim is still minted and still counted`);
        assertRefusal(result.claim.notEvaluable, 'no-authored-price-basis', 'magnitude.priceBasis', label);

        // The basis is never repaired or defaulted on the way out, at either layer.
        assert.equal(claims.priceBasisFor(result.claim).ok, false, `${label}: the precondition refuses`);
        assert.equal(
            Object.prototype.hasOwnProperty.call(claims.priceBasisFor(result.claim), 'priceBasis'),
            false,
            `${label}: no basis may be supplied by the consumer`,
        );
    }

    /* ANTI-VACUITY. The SAME fixture with each legal member authored mints evaluable, so every
       refusal above is caused by the basis and by nothing else. */
    for (const member of claims.PRICE_BASES) {
        assert.equal(mintEvaluableWithPriceBasis(member).magnitude.priceBasis, member);
    }
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
                        // Same discipline for the basis: absent, it mints `no-authored-price-basis`.
                        priceBasis: 'adjusted-close',
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

/* ── Scope 04, increment 2 ────────────────────────────────────────────────────────────────
   Increment 1 landed the calendar-session substrate. Increment 2 lands the OBSERVATION read:
   the as-of slice, the frozen-basis lookup, and the unrounded `outcomeValue`. The predicate
   evaluators, the data-quality gates, the reducer bridge and the resolution assembly are later
   increments, so every row carries an `(increment 2)` marker and none claims its Test Plan row
   whole. Every date is a fixture literal or a committed-calendar value; nothing reads a clock.

   The synthetic series under `bars/` exist because the property under test cannot be observed on
   real data: `DVG` diverges in SIGN between its two closes, so a resolver that chose a basis for
   itself scores the same claim as a +10% win or a -10% loss. `RAWONLY` carries no `ac` at all,
   which is not a hypothetical shape — 54 of 292 committed series have rows without one. */

const BARS_FIXTURE_DIR = path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record', 'bars');

const ENTRY_SESSION = '2026-07-28';
const RESOLUTION_SESSION = '2026-07-29';

/* The EXACT returns the fixture closes produce, expression AND literal. Writing `10` here would
   pass against an implementation that rounded, which is the one thing these rows exist to catch —
   and each literal below differs from its decimal reading in the last few bits. */
const DVG_RAW_RETURN = (110 / 100 - 1) * 100;
const DVG_ADJUSTED_RETURN = (90 / 100 - 1) * 100;
const DVG2_RAW_RETURN = (190 / 200 - 1) * 100;

function fixtureBars(symbol) {
    return readBars(readFileSync(path.join(BARS_FIXTURE_DIR, `${symbol}.json`), 'utf8'));
}

/** Fences for the named fixture series, keyed by `seriesRef` exactly as `subjectReturn` reads them. */
function fixtureFences(symbols, resolutionDate = RESOLUTION_SESSION) {
    const calendar = loadCalendar(REPO_ROOT);
    return new Map(symbols.map((symbol) => [
        claims.seriesRefFor(symbol),
        fenceObservations(calendar, fixtureBars(symbol), resolutionDate),
    ]));
}

/**
 * The per-series as-of map the due gate requires: how far each named series has been observed.
 * Keyed by `seriesRef`, exactly as `claimEntryBindings` records the refs the claim will read.
 */
function seriesAsOfMap(symbols, asof) {
    return new Map(symbols.map((symbol) => [claims.seriesRefFor(symbol), asof]));
}

/**
 * Mint an evaluable claim over the synthetic series. The committed set is overridden to the
 * fixture symbols so the mint gate sees them as available, which is the same availability rule
 * `enumerateCommittedSeries` applies to the real tree — never `index.json`, never a count.
 */
function syntheticClaim(symbols, {
    priceBasis,
    weighting = 'primary-only',
    action = 'add',
    predicate = {},
    entryDate = ENTRY_SESSION,
    resolutionDate = RESOLUTION_SESSION,
} = {}) {
    const fixture = structuredClone(loadClaimFixture('evaluable-instrument-add'));
    fixture.input.action.action = action;
    fixture.input.action.claim.resolvesTo = symbols;
    fixture.input.action.claim.weighting = weighting;
    fixture.input.action.claim.priceBasis = priceBasis;
    fixture.input.action.claim.predicate = { ...fixture.input.action.claim.predicate, ...predicate };
    fixture.input.binding.entryDate = entryDate;
    fixture.input.binding.resolutionDate = resolutionDate;
    const result = claims.mintClaim(mintInputFrom(fixture, { committedSeries: symbols }));
    assertEvaluable(result, `synthetic ${symbols.join('+')} @ ${priceBasis}`);
    return result.claim;
}

test('T-04-U8 (increment 2): the price basis is read from the frozen claim, and an absent basis refuses instead of falling back', () => {
    const fences = fixtureFences(['DVG']);

    /* THE BASIS DECIDES THE OUTCOME. Same claim shape, same series, same two sessions — the only
       difference is the hashed term, and it flips the sign. If a resolver picked a basis of its
       own, one of these two numbers would be reported for both claims. */
    const raw = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), fences);
    const adjusted = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'adjusted-close' }), fences);
    assert.equal(raw.ok, true, 'the raw-close claim resolves');
    assert.equal(adjusted.ok, true, 'the adjusted-close claim resolves');
    assert.equal(raw.outcomeValue, DVG_RAW_RETURN, 'raw-close: 100 -> 110 is +10%');
    assert.equal(adjusted.outcomeValue, DVG_ADJUSTED_RETURN, 'adjusted-close: 100 -> 90 is -10%');
    assert.equal(raw.outcomeValue, 10.000000000000009, 'and it is the exact double, not the decimal 10');
    assert.equal(adjusted.outcomeValue, -9.999999999999998, 'nor the decimal -10');
    assert.equal(raw.priceBasis, 'raw-close', 'and each carries the basis it was measured against');
    assert.equal(adjusted.priceBasis, 'adjusted-close');

    /* TWO CLAIMS DIFFERING ONLY IN BASIS ARE TWO DIFFERENT CLAIMS. `priceBasis` is inside
       `magnitude`, which is a hashed term, so this is what makes the basis untunable after the
       outcome is visible rather than merely recorded. */
    assert.notEqual(
        syntheticClaim(['DVG'], { priceBasis: 'raw-close' }).claimHash,
        syntheticClaim(['DVG'], { priceBasis: 'adjusted-close' }).claimHash,
        'the frozen basis is inside the content address',
    );

    /* ABSENT MEANS REFUSE, NEVER SUBSTITUTE. RAWONLY carries the SAME raw closes as DVG, so a
       fallback would return a perfectly plausible +10 and nothing downstream could tell. The
       refusal names the exact row field it could not read. */
    const rawOnlyFences = fixtureFences(['RAWONLY']);
    const substituted = outcomeValueFor(syntheticClaim(['RAWONLY'], { priceBasis: 'adjusted-close' }), rawOnlyFences);
    assert.equal(substituted.ok, false, 'an adjusted-close claim on a series with no adjusted close must refuse');
    assert.equal(substituted.error.code, PRICE_BASIS_CODE, 'code');
    assert.equal(substituted.error.reason, 'basis-series-absent-from-observation', 'reason');
    assert.equal(substituted.error.field, `observations.RAWONLY.${ENTRY_SESSION}.ac`, 'field names the row field');
    assert.equal(Object.prototype.hasOwnProperty.call(substituted, 'outcomeValue'), false, 'and no value is produced');

    /* ANTI-VACUITY: the SAME series under the basis it actually carries resolves, so the refusal
       above is caused by the absent field and not by a reader that refuses this fixture outright. */
    const honest = outcomeValueFor(syntheticClaim(['RAWONLY'], { priceBasis: 'raw-close' }), rawOnlyFences);
    assert.equal(honest.ok, true, 'raw-close on the same series resolves');
    assert.equal(honest.outcomeValue, DVG_RAW_RETURN);

    /* AN UNAUTHORED BASIS IS CARRIED THROUGH from the mint, never re-derived here. */
    const unauthored = claims.mintClaim(mintInputFrom(loadClaimFixture('not-evaluable-no-authored-price-basis')));
    assert.equal(unauthored.ok, true, 'the claim still mints');
    const carried = outcomeValueFor(unauthored.claim, fences);
    assert.equal(carried.ok, false);
    assert.deepEqual(
        carried.closure,
        { closureEventType: 'not-evaluable', reasonCode: 'no-authored-price-basis', field: 'magnitude.priceBasis' },
        'the mint reason is carried through as a not-evaluable closure, not re-derived',
    );
});

test('T-04-U5 (increment 2): the as-of fence is a slice, and "not yet observed" is not "read the future"', () => {
    const calendar = loadCalendar(REPO_ROOT);
    const spy = loadBars(REPO_ROOT, 'SPY');

    /* THE SLICE CONTAINS NO FUTURE ROW. Asserted over the map itself rather than over a reader,
       because the fence is structural: an evaluator handed this map cannot reach a later row. */
    const fence = fenceObservations(calendar, spy, RESOLUTION_SESSION);
    assert.equal(fence.observations.size > 0, true, 'the slice must be non-empty for this row to mean anything');
    for (const sessionDate of fence.observations.keys()) {
        assert.equal(sessionDate <= RESOLUTION_SESSION, true, `${sessionDate} is at or before the resolution date`);
    }
    assert.equal(fence.excluded.future > 0, true, 'and rows after it were excluded rather than absent');

    /* ASKING PAST THE FENCE IS RTR-LOOKAHEAD, with its exact code. */
    const past = basisValueAt(fence, 'adjusted-close', '2026-08-03');
    assert.equal(past.ok, false);
    assert.equal(past.error.code, LOOKAHEAD_CODE, 'code');
    assert.equal(past.error.reason, 'observation-past-resolution-date', 'reason');
    assert.equal(past.error.field, 'sessionDate', 'field');

    /* THE DISTINCT CASE. `bars.asof < resolutionDate` is NOT a refusal: the fence reports itself
       unresolvable so the caller can skip and append nothing. Conflating the two would make
       RTR-LOOKAHEAD fire on every routine run and train everyone to ignore it. */
    const notYet = fenceObservations(calendar, fixtureBars('DVG'), '2026-07-31');
    assert.equal(notYet.ok, true, 'a not-yet-observed horizon is not a refusal');
    assert.equal(notYet.resolvable, false, 'it reports itself unresolvable');
    assert.equal(fence.resolvable, true, 'paired with an observed horizon that IS resolvable');

    /* A MISSING SESSION IS A CLOSURE, NOT A REFUSAL, and its reason is the shipped one — so
       `buildResolution` accepts it against `unresolved` and rejects it against anything else. */
    const weekend = basisValueAt(fence, 'adjusted-close', '2026-07-26');
    assert.equal(weekend.ok, false);
    assert.equal(Object.prototype.hasOwnProperty.call(weekend, 'error'), false, 'a data gap carries no RTR-* code');
    assert.deepEqual(weekend.closure, {
        closureEventType: 'unresolved',
        reasonCode: SESSION_ABSENT_REASON,
        field: `observations.SPY.2026-07-26`,
    });
    assert.equal(claims.CLOSURE_REASON_CODES.unresolved.includes(SESSION_ABSENT_REASON), true, 'the reason is shipped, not invented');

    /* NON-SESSION ROWS ARE EXCLUDED, NEVER SUBSTITUTED. A 24h market's off-session bar is not a
       session close, so it must not become one: 6,823 of 48,294 in-window committed rows are
       stamped away from the regular open. Counted rather than dropped in silence. */
    const crypto = fenceObservations(calendar, loadBars(REPO_ROOT, 'BTC-USD'), RESOLUTION_SESSION);
    assert.equal(crypto.excluded.unmappable > 0, true, 'a 24h series carries rows that are not session opens');
    for (const [sessionDate, row] of crypto.observations) {
        const open = calendar.rows.find((candidate) => candidate.tradingDate === sessionDate).regular.startUtc;
        assert.equal(row.t, Date.parse(open), `${sessionDate} maps only a row stamped at its own regular open`);
    }
});

test('T-04-U7 (increment 2): outcomeValue is direction x ret(subject), exact and unrounded, the class comes from classifyOutcome, hold refuses at BOTH the mint and the resolver, and the basis values are fingerprinted', () => {
    const fences = fixtureFences(['DVG', 'DVG2']);
    const bearishClaim = syntheticClaim(['DVG'], { priceBasis: 'adjusted-close', action: 'trim' });

    /* THE BEARISH ADAPTER. `trim` is direction -1, so a series that FELL is a correct call and
       must score POSITIVE. Without the multiply, every correct bearish call reads as a loss. */
    const correctBear = outcomeValueFor(bearishClaim, fences);
    assert.equal(correctBear.ok, true);
    assert.equal(correctBear.subjectReturn, DVG_ADJUSTED_RETURN, 'the series fell 10%');
    assert.equal(correctBear.outcomeValue, -DVG_ADJUSTED_RETURN, 'and the correct bearish call scores positive');
    assert.equal(correctBear.outcomeValue > 0, true, 'which is the whole point of the multiply');

    const wrongBear = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'trim' }), fences);
    assert.equal(wrongBear.outcomeValue, -DVG_RAW_RETURN, 'a bearish call on a series that rose scores negative');

    const correctBull = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'add' }), fences);
    assert.equal(correctBull.outcomeValue, DVG_RAW_RETURN, 'and the same rise is positive for a bullish call');

    /* EXACT AND UNROUNDED. 200 -> 190 is -5% only in decimal; in IEEE-754 it is the value below,
       and asserting the rounded number would let a `toFixed` creep in without failing. */
    const primary = outcomeValueFor(syntheticClaim(['DVG2', 'DVG'], { priceBasis: 'raw-close', weighting: 'primary-only' }), fences);
    assert.equal(primary.outcomeValue, DVG2_RAW_RETURN, 'the exact IEEE-754 value, not -5');
    assert.equal(primary.outcomeValue, -5.000000000000004, 'which is NOT the decimal -5');
    assert.equal(primary.legReturns.length, 1, 'primary-only reads the first leg alone');

    /* THE TWO WEIGHTINGS ARE DIFFERENT MEASUREMENTS, not two renderings of one. */
    const equal = outcomeValueFor(syntheticClaim(['DVG2', 'DVG'], { priceBasis: 'raw-close', weighting: 'equal' }), fences);
    assert.equal(equal.legReturns.length, 2, 'equal weighting reads every leg');
    assert.equal(equal.outcomeValue, (DVG2_RAW_RETURN + DVG_RAW_RETURN) / 2, 'the mean of the leg returns');
    assert.notEqual(equal.outcomeValue, primary.outcomeValue, 'and it differs from primary-only');

    /* THE FINGERPRINT MAKES A RETROACTIVE REWRITE DETECTABLE. It covers the exact values read, so
       BUG-012's `ac` rewrite moves it; and it is stable across passes over unchanged bytes, which
       is what keeps the content-addressed write idempotent rather than conflicting every run. */
    assert.match(correctBear.basisFingerprint, /^sha256:[a-f0-9]{64}$/, 'a content address');
    assert.equal(
        outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'adjusted-close', action: 'trim' }), fixtureFences(['DVG'])).basisFingerprint,
        correctBear.basisFingerprint,
        'a second pass over unchanged bytes recomputes one fingerprint',
    );
    assert.notEqual(correctBear.basisFingerprint, wrongBear.basisFingerprint, 'a different basis reads different values');

    const rewritten = structuredClone(correctBear.observations.map((o) => ({ ...o })));
    rewritten[1].value += 0.0000001;
    assert.notEqual(
        basisFingerprint('adjusted-close', rewritten),
        correctBear.basisFingerprint,
        'and a one-ten-millionth rewrite of a read value changes it',
    );

    /* IT SURVIVES THE HASHED PROVENANCE GATE. `buildResolution` refuses any RUN_SCOPED_KEYS member
       inside `provenance`, so the fingerprint is asserted to be ACCEPTED there rather than merely
       computed — an unhashed fingerprint would not make a rewrite surface as a write conflict. */
    const built = claims.buildResolution({
        closureVocabulary: claims.readClosureEventVocabulary(foundationSourceText()),
        claimHash: syntheticClaim(['DVG'], { priceBasis: 'adjusted-close', action: 'trim' }).claimHash,
        eventId: 'sha256:'.concat('3'.repeat(64)),
        resolutionDate: RESOLUTION_SESSION,
        closureEventType: 'satisfied',
        outcomeClass: 'win',
        outcomeValue: correctBear.outcomeValue,
        reasonCode: 'predicate-satisfied',
        provenance: { priceBasis: correctBear.priceBasis, basisFingerprint: correctBear.basisFingerprint },
        lifecycleBinding: { originRecommendationKey: 'sha256:'.concat('4'.repeat(64)) },
    });
    assert.equal(built.ok, true, `the fingerprint must be admissible in hashed provenance: ${JSON.stringify(built.error)}`);
    assert.equal(built.resolution.provenance.basisFingerprint, correctBear.basisFingerprint);
    assert.equal(built.resolution.outcomeValue, correctBear.outcomeValue, 'and the value is carried through unrounded');

    /* THE CLASS IS ASSIGNED BY `classifyOutcome`, NOT RE-DERIVED HERE. The sign above is a number;
       the item's claim is that a correct bearish call reaches a POSITIVE outcome THROUGH the
       shipped classifier, so the band comparison is exercised where the resolver would meet it.

       `direction-adjusted` is what the frozen `SIGN_CONVENTIONS` calls this multiply, read off the
       module rather than typed, so a renamed convention fails here instead of drifting silently. */
    assert.equal(bearishClaim.magnitude.signConvention, claims.SIGN_CONVENTIONS[0], 'the shipped convention names the multiply');
    const bearClassified = claims.classifyOutcome(correctBear.outcomeValue, bearishClaim);
    assert.equal(bearClassified.ok, true, JSON.stringify(bearClassified.error ?? null));
    assert.equal(bearClassified.outcomeValue > 0, true, 'the correct bearish call reaches the classifier POSITIVE');
    assert.equal(bearClassified.outcomeClass, 'win', 'and classifyOutcome calls it a win');
    assert.equal(bearClassified.contribution, claims.CONTRIBUTION_NUMBER, 'so it contributes a number to the directional array');
    assert.equal(bearClassified.outcomeValue, correctBear.outcomeValue, 'carried through verbatim, unrounded');

    /* NON-VACUITY. One claim, one classifier, two inputs: the UNMULTIPLIED series return and the
       direction-adjusted one land in OPPOSITE classes. A resolver that dropped the multiply — or
       flipped its sign — would hand the classifier `subjectReturn` and publish this correct
       bearish call as a `loss`. The pair measures that rather than assuming it. */
    const unmultiplied = claims.classifyOutcome(correctBear.subjectReturn, bearishClaim);
    assert.equal(unmultiplied.outcomeClass, 'loss', 'the raw fall classifies as a loss');
    assert.notEqual(unmultiplied.outcomeClass, bearClassified.outcomeClass, 'so a sign flip is a class flip, not a rounding difference');
    assert.equal(Math.abs(bearClassified.outcomeValue) > bearClassified.flatBand, true, 'and neither reading sits inside the flat band');

    /* AND `hold` REFUSES — AT THE MINT AND AGAIN AT THE RESOLVER. `MARKET_ACTIONS` admits it as a
       family, but `ACTION_DIRECTION` binds it to 0 — there is no signed magnitude to score — so the
       mint closes `neutral-direction-no-magnitude`. Both facts are read from the shipped vocabulary,
       never restated here. */
    const vocabulary = foundationActionVocabulary();
    const holdFixture = loadClaimFixture('not-evaluable-hold-neutral-direction');
    const holdFamily = holdFixture.input.action.action;
    const holdDirection = vocabulary.direction[holdFamily];
    assert.equal(vocabulary.families.includes(holdFamily), true, 'hold IS a market action family');
    assert.equal(holdDirection, 0, 'bound to the neutral direction');
    assert.notEqual(vocabulary.direction[bearishClaim.actionFamily], 0, 'unlike the signed family above');

    const held = claims.mintClaim(mintInputFrom(holdFixture));
    assert.equal(held.ok, true, 'a hold is minted and counted, not dropped');
    assertRefusal(held.claim.notEvaluable, 'neutral-direction-no-magnitude', 'direction', 'T-04-U7 hold');
    assert.equal(claims.MINT_REFUSALS.includes(held.claim.notEvaluable.reason), true, 'and the reason is a shipped mint refusal');

    /* THE RESOLVER REFUSES IT INDEPENDENTLY. The mint reason above is what `outcomeValueFor` reads
       FIRST, so a hold that arrived here having lost it would never reach the multiply check — and
       `direction-not-bound` is exactly the branch that catches it. Cloning the SIGNED claim and
       rebinding only `direction` to the shipped `ACTION_DIRECTION.hold` is what puts a neutral claim
       in front of that branch; the 0 is USED to build the input rather than typed as a literal, so a
       re-bound hold moves this assertion instead of passing a stale restatement. */
    const holdShaped = structuredClone(bearishClaim);
    holdShaped.actionFamily = holdFamily;
    holdShaped.direction = holdDirection;
    holdShaped.notEvaluable = null;
    const heldOutcome = outcomeValueFor(holdShaped, fences);
    assertViolation(heldOutcome, { reason: 'direction-not-bound', field: 'direction' }, 'T-04-U7 hold at the resolver');
    assert.equal(Object.prototype.hasOwnProperty.call(heldOutcome, 'outcomeValue'), false, 'and no value is produced');

    /* WHAT THAT REFUSAL PREVENTS. Drop it and the multiply yields `0 x ret` — zero for ANY return —
       and zero sits inside every legal flat band, so `classifyOutcome` would hand back a RESOLVED
       verdict. A claim with no directional stake would then be counted as an outcome the desk
       actually resolved, instead of being withheld as not-evaluable. */
    // `Math.abs` because `0 x -9.99…` is `-0`, which is the same point: it still sits in the band.
    assert.equal(Math.abs(holdDirection * correctBear.subjectReturn), 0, '0 x ret is zero even for a 10% move');
    const wouldHaveScored = claims.classifyOutcome(0, bearishClaim);
    assert.equal(wouldHaveScored.ok, true, JSON.stringify(wouldHaveScored.error ?? null));
    assert.equal(wouldHaveScored.outcomeClass, 'resolved-flat', 'the vacuous class a scored hold would land in');
    assert.equal(wouldHaveScored.contribution, claims.CONTRIBUTION_COUNT, 'counted as a resolved outcome');
    assert.notEqual(wouldHaveScored.outcomeClass, 'not-evaluable', 'i.e. published as resolved, not withheld');

    /* NON-VACUITY FOR THE RESOLVER REFUSAL. `holdShaped` is a clone of `bearishClaim`, so the pair
       shares series, dates, basis and fences by construction and differs ONLY in the bound
       direction — which is what shows the refusal is caused by neutrality and not by a reader that
       refuses everything reaching this branch. */
    assert.equal(correctBear.ok, true, 'the signed twin over the same series and dates does NOT refuse');
    assert.equal(Number.isFinite(correctBear.outcomeValue), true, 'and produces a finite outcomeValue');
    assert.notEqual(bearishClaim.direction, holdDirection, 'the sole difference between the two inputs');

    /* THE REFUSAL REACHES THE DENOMINATOR. A neutral claim routes to a COUNT, so a cohort of holds
       alone leaves the directional array empty and `directionalDenominator` refuses to publish a
       rate with nothing to divide by — the branch a caller is expected to take before summarising. */
    const holdRecord = { outcomeClass: 'not-evaluable', outcomeValue: null };
    const holdsOnly = claims.routeOutcomes([holdRecord]);
    assert.equal(holdsOnly.counts['not-evaluable'], 1, 'the hold is counted');
    assert.equal(holdsOnly.resolvedDirectional, 0, 'and contributes no number');
    assertViolation(
        claims.directionalDenominator(holdsOnly, null),
        { reason: 'no-directional-denominator-to-publish', field: 'resolvedDirectional' },
        'T-04-U7 hold-only cohort',
    );

    /* NON-VACUITY FOR THE REFUSAL. The same cohort plus the bearish win publishes, so the refusal
       is caused by the hold's neutrality rather than by a denominator that refuses every input. */
    const withWin = claims.routeOutcomes([holdRecord, { outcomeClass: bearClassified.outcomeClass, outcomeValue: bearClassified.outcomeValue }]);
    const published = claims.directionalDenominator(withWin, summarizeOutcomes(withWin.directional));
    assert.equal(published.ok, true, JSON.stringify(published.error ?? null));
    assert.equal(published.resolvedDirectional, 1, 'the signed call is the whole denominator');
    assert.equal(published.wins, 1, 'and the correct bearish call is the win in it');
});

/* ── Scope 04, increment 3 ────────────────────────────────────────────────────────────────
   Increment 2 produced a NUMBER. Increment 3 turns it into a RECORD: the closure event and the
   outcome class as two independent axes, the hashed provenance, and the `buildResolution` call.
   The reducer bridge and the predicate evaluators are later increments, so the closure verdict
   arrives here as an input and every row carries an `(increment 3)` marker. */

/** A `resolutionFor` input. Every lifecycle value is a fixture literal; nothing reads a clock. */
function resolverInput(claim, closureEventType, reasonCode, outcome) {
    return {
        claim,
        calendar: loadCalendar(REPO_ROOT),
        closureVocabulary: closureVocabulary(),
        closureEventType,
        reasonCode,
        outcome,
        eventId: 'sha256:'.concat('7'.repeat(64)),
        lifecycleBinding: { originRecommendationKey: 'sha256:'.concat('8'.repeat(64)) },
    };
}

test('T-04-U3 (increment 3): closure event and outcomeClass are independent axes, derived from the shipped table', () => {
    const fences = fixtureFences(['DVG']);

    /* THE AXES DO NOT DERIVE EACH OTHER. Same closure event, opposite classes — and the class
       comes from the magnitude alone. An implementation that read `satisfied` as "a win" would
       report the first of these as a win, and the claim's real -10% would vanish. */
    const bearOnARise = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'trim' }), fences);
    const bullOnARise = outcomeValueFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'add' }), fences);
    assert.equal(bearOnARise.outcomeValue < 0, true, 'the fixture must give one negative magnitude');
    assert.equal(bullOnARise.outcomeValue > 0, true, 'and one positive, or the pair proves nothing');

    const satisfiedLoss = resolutionAxesFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'trim' }), 'satisfied', bearOnARise);
    assert.equal(satisfiedLoss.ok, true);
    assert.equal(satisfiedLoss.closureEventType, 'satisfied', 'the predicate cleared');
    assert.equal(satisfiedLoss.outcomeClass, 'loss', 'and the magnitude still says loss');
    assert.equal(satisfiedLoss.outcomeValue, bearOnARise.outcomeValue, 'carried through verbatim, not re-derived');

    /* THE MIRROR, so the row cannot pass under an implementation that hard-coded the opposite
       mapping instead. `invalidated` + `win` is admitted by the shipped table for the same
       reason: a predicate can fail while the position still made money. */
    const invalidatedWin = resolutionAxesFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), 'invalidated', bullOnARise);
    assert.equal(invalidatedWin.outcomeClass, 'win', 'the predicate failed and the magnitude still says win');
    assert.equal(invalidatedWin.closureEventType, 'invalidated');

    /* THE ROUTING IS DERIVED FROM `OUTCOME_CLOSURE_EVENTS`, NEVER RESTATED. The ambiguous events
       are ambiguous over EXACTLY the magnitude-bearing classes; the determined ones are not. */
    assert.deepEqual([...MEASURED_CLOSURE_EVENTS].sort(), ['invalidated', 'satisfied']);
    for (const event of MEASURED_CLOSURE_EVENTS) {
        const admitting = Object.keys(claims.OUTCOME_CLOSURE_EVENTS)
            .filter((outcomeClass) => claims.OUTCOME_CLOSURE_EVENTS[outcomeClass].includes(event)).sort();
        assert.deepEqual(admitting, [...claims.MAGNITUDE_BEARING_OUTCOME_CLASSES], `${event} is ambiguous over the magnitude-bearing set`);
    }
    for (const [event, outcomeClass] of Object.entries(DETERMINED_CLOSURE_CLASS)) {
        assert.equal(claims.MAGNITUDE_BEARING_OUTCOME_CLASSES.includes(outcomeClass), false, `${event} determines a counted class`);
    }

    /* `withdrawn` IS THE RESIDUE, and it is unreachable rather than merely unused: it is a real
       member of the 002-owned vocabulary that NO outcome class admits, so it refuses before any
       record exists. A resolver that could withdraw a claim could withdraw the ones it was about
       to score badly. */
    assert.equal(closureVocabulary().includes('withdrawn'), true, 'withdrawn must really be in the upstream vocabulary');
    assert.equal(MEASURED_CLOSURE_EVENTS.includes('withdrawn'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(DETERMINED_CLOSURE_CLASS, 'withdrawn'), false);
    const withdrawn = resolutionAxesFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), 'withdrawn', bullOnARise);
    assert.equal(withdrawn.ok, false);
    assertRefusal(withdrawn.error, 'closure-event-carries-no-outcome-class', 'closureEventType', 'withdrawn');
    assert.equal(
        resolutionFor(resolverInput(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), 'withdrawn', 'predicate-satisfied', bullOnARise)).ok,
        false,
        'and no record is built on it',
    );

    /* A DETERMINED CLOSURE CANNOT CARRY A MAGNITUDE, even when one was computable. The number is
       reported as unrecorded rather than dropped, because a value that vanished without a trace
       reads exactly like one that was never computed. */
    const expired = resolutionAxesFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), 'expired', bullOnARise);
    assert.equal(expired.outcomeClass, 'unresolved', 'the single admitting class');
    assert.equal(expired.outcomeValue, null, 'and a counted class stores no magnitude');
    assert.equal(expired.unrecordedOutcomeValue, bullOnARise.outcomeValue, 'while naming the value it could not record');
    const expiredRecord = resolutionFor(resolverInput(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), 'expired', 'horizon-elapsed', bullOnARise));
    assert.equal(expiredRecord.ok, true, `buildResolution must accept it: ${JSON.stringify(expiredRecord.error)}`);
    assert.equal(expiredRecord.resolution.outcomeValue, null, 'null in the record, not the number');

    /* ONE DECISION, ONE SOURCE. A carried `{ closure }` IS the verdict; a caller naming a
       different closure event is a second source for one decision and must refuse rather than
       have one silently win. */
    const carried = outcomeValueFor(mint('not-evaluable-no-authored-price-basis').claim, fences);
    assert.equal(carried.closure.closureEventType, 'not-evaluable', 'the fixture must really carry a closure');
    const contradicted = resolutionAxesFor(mintEvaluable('evaluable-instrument-add'), 'satisfied', carried);
    assert.equal(contradicted.ok, false);
    assertRefusal(contradicted.error, 'closure-event-contradicts-carried-closure', 'closureEventType', 'contradiction');

    /* AN RTR-* REFUSAL IS AN INVARIANT VIOLATION, NEVER AN OUTCOME. It propagates unchanged and
       no record is built — the split increment 2 draws between `{ error }` and `{ closure }`. */
    const unreadable = outcomeValueFor(syntheticClaim(['RAWONLY'], { priceBasis: 'adjusted-close' }), fixtureFences(['RAWONLY']));
    assert.equal(unreadable.error.code, PRICE_BASIS_CODE, 'the fixture must really refuse');
    const propagated = resolutionAxesFor(syntheticClaim(['RAWONLY'], { priceBasis: 'adjusted-close' }), 'satisfied', unreadable);
    assert.equal(propagated, unreadable, 'the refusal is propagated by identity, not re-wrapped');

    /* ANTI-VACUITY. The identical call shape with a readable series is ACCEPTED, so every refusal
       above is caused by the value under test and not by a builder that refuses everything. */
    const accepted = resolutionFor(resolverInput(syntheticClaim(['DVG'], { priceBasis: 'raw-close', action: 'trim' }), 'satisfied', 'predicate-satisfied', bearOnARise));
    assert.equal(accepted.ok, true, `the control must build: ${JSON.stringify(accepted.error)}`);
    assert.equal(accepted.resolution.closureEventType, 'satisfied');
    assert.equal(accepted.resolution.outcomeClass, 'loss');
    assert.equal(accepted.resolution.outcomeValue, bearOnARise.outcomeValue);
    assert.match(accepted.resolution.resolutionHash, /^sha256:[a-f0-9]{64}$/);
});

test('T-04-U8 (increment 3): the hashed provenance is assembled here, so no run-scoped key can reach the content address', () => {
    const fences = fixtureFences(['DVG']);
    const claim = syntheticClaim(['DVG'], { priceBasis: 'adjusted-close', action: 'trim' });
    const outcome = outcomeValueFor(claim, fences);

    /* THE BASIS FINGERPRINT IS REUSED, NOT RECOMPUTED, so the record commits to exactly the
       values the return was computed from rather than to a second read that could differ. */
    const provenance = resolutionProvenanceFor(loadCalendar(REPO_ROOT), claim, outcome);
    assert.equal(provenance.ok, true);
    assert.equal(provenance.provenance.basisFingerprint, outcome.basisFingerprint);
    assert.equal(provenance.provenance.priceBasis, 'adjusted-close');
    assert.deepEqual(provenance.provenance.earlyCloseSessions, [], 'neither fixture session closed early');

    /* NO RUN-SCOPED KEY CAN REACH IT. Structural, not remembered: the block is assembled from the
       claim and the calendar, and there is no caller-supplied field to inject one through. */
    for (const key of claims.RUN_SCOPED_KEYS) {
        assert.equal(Object.prototype.hasOwnProperty.call(provenance.provenance, key), false, `${key} cannot appear in hashed provenance`);
    }

    /* AND THE SPLIT IS REAL, not a blanket ban: the same `runId` is ACCEPTED in `lifecycleBinding`,
       which sits outside the hash. Without this pair the row would also pass under an
       implementation that refused run-scoped keys everywhere and had no unhashed home for them. */
    const input = resolverInput(claim, 'satisfied', 'predicate-satisfied', outcome);
    const withRunId = resolutionFor({ ...input, lifecycleBinding: { ...input.lifecycleBinding, runId: 'run-2026-07-29-a' } });
    assert.equal(withRunId.ok, true, `lifecycleBinding must accept a runId: ${JSON.stringify(withRunId.error)}`);
    assert.equal(withRunId.resolution.lifecycleBinding.runId, 'run-2026-07-29-a');

    /* AND IT DOES NOT MOVE THE ADDRESS. Two records differing only in an unhashed field share one
       content address — which is why a re-emit is a byte conflict rather than a second object. */
    const without = resolutionFor(input);
    assert.equal(withRunId.resolution.resolutionHash, without.resolution.resolutionHash, 'unhashed fields do not move the address');
    assert.notEqual(
        claims.serializeResolution(withRunId.resolution),
        claims.serializeResolution(without.resolution),
        'while the bytes DO differ, which is what the write conflict detects',
    );

    /* A CLAIM WITH NO READABLE MAGNITUDE STILL GETS A PROVENANCE BLOCK — the basis fields are
       simply absent rather than guessed, so a not-evaluable record cannot imply a read that
       never happened. */
    const carried = mint('not-evaluable-no-authored-price-basis').claim;
    const bare = resolutionProvenanceFor(loadCalendar(REPO_ROOT), carried, outcomeValueFor(carried, fences));
    assert.deepEqual(Object.keys(bare.provenance), ['earlyCloseSessions'], 'no basis is invented for an unmeasured claim');
});

/* ── Scope 04, increment 4 ────────────────────────────────────────────────────────────────
   Increment 3 could BUILD a record but not DECIDE one: `resolutionFor` still took
   `closureEventType` and `reasonCode` from its caller. Increment 4 computes that verdict from
   the claim's own frozen predicate. The reducer bridge and the data-quality gates are later
   increments, so every row carries an `(increment 4)` marker and none claims its Test Plan row
   whole. Every date is a fixture literal or a committed-calendar value; nothing reads a clock.

   The DVG fixture is what makes point and path genuinely different rather than nominally so: it
   CLOSES at +10% but its high touches +12% and its low touches -12% on the same session, so a
   bound of 11 is missed by `gte` and cleared by `crosses-above`. Every expected number below is
   an EXPRESSION over the fixture closes, so a `toFixed` creeping into the arithmetic fails. */

const DVG_RAW_HIGH_RETURN = (112 / 100 - 1) * 100;
const DVG_RAW_LOW_RETURN = (88 / 100 - 1) * 100;
const PATH_SESSION_3 = '2026-07-30';
const PATH_BOUND = 11;
const FIXTURE_FLAT_BAND = 0.25;
const SERIES_INTERVAL = claims.seriesRefFor('X').split('/')[2];

/** Override a MINTED claim's predicate. Out-of-vocabulary values cannot be minted, only injected. */
function withPredicate(claim, patch) {
    const mutated = structuredClone(claim);
    Object.assign(mutated.predicate, patch);
    return mutated;
}

function sessionOpenEpoch(calendar, tradingDate) {
    return Date.parse(calendar.rows.find((row) => row.tradingDate === tradingDate).regular.startUtc);
}

/**
 * A three-session synthetic series so a path window can be COMPLETE or carry an interior gap.
 * The two fixture series are adjacent sessions, which cannot express a gap at all. Session
 * timestamps are read from the committed calendar rather than computed by day arithmetic.
 */
function threeSessionBars(calendar, { skip = null } = {}) {
    const sessions = [ENTRY_SESSION, RESOLUTION_SESSION, PATH_SESSION_3];
    const closes = [100, 110, 120];
    const rows = sessions
        .map((tradingDate, index) => ({
            t: sessionOpenEpoch(calendar, tradingDate),
            o: closes[index] - 1,
            h: closes[index] + 2,
            l: closes[index] - 2,
            c: closes[index],
            v: 1000,
            ac: closes[index],
        }))
        .filter((_row, index) => sessions[index] !== skip);
    return readBars(JSON.stringify({
        sym: 'PATH3', interval: SERIES_INTERVAL, range: '1mo', asof: PATH_SESSION_3, rows,
    }));
}

test('T-04-U1 (increment 4): all four predicate kinds evaluate, and the kind and comparator are bound to the frozen vocabularies', () => {
    const calendar = loadCalendar(REPO_ROOT);
    const fences = fixtureFences(['DVG', 'DVG2']);
    const evaluate = (claim) => evaluatePredicate(claim, fences, calendar);

    /* THRESHOLD — `cmp(ret(subject), predicate.value)`. Satisfied and invalidated on the SAME
       series, so the verdict tracks the bound rather than the fixture. */
    const thresholdMet = evaluate(syntheticClaim(['DVG'], {
        priceBasis: 'raw-close', predicate: { kind: 'threshold', comparator: 'gte', value: 1.5 },
    }));
    assert.equal(thresholdMet.ok, true);
    assert.equal(thresholdMet.observed, DVG_RAW_RETURN, 'threshold observes ret(subject) exactly');
    assert.equal(thresholdMet.closureEventType, PREDICATE_SATISFIED_EVENT);
    assert.equal(thresholdMet.reasonCode, 'predicate-satisfied');
    const thresholdMissed = evaluate(syntheticClaim(['DVG'], {
        priceBasis: 'raw-close', predicate: { kind: 'threshold', comparator: 'gte', value: PATH_BOUND },
    }));
    assert.equal(thresholdMissed.closureEventType, PREDICATE_INVALIDATED_EVENT, '+10% does not clear 11');
    assert.equal(thresholdMissed.reasonCode, 'predicate-invalidated');

    /* RELATIVE — `cmp(ret(subject) - ret(reference), predicate.value)`. DVG rose 10 while DVG2
       fell 5, so the pair differ by 15 and NEITHER leg alone would produce that number. */
    const relativeClaim = (value) => syntheticClaim(['DVG'], {
        priceBasis: 'raw-close',
        predicate: { kind: 'relative', comparator: 'gte', value, reference: 'DVG2' },
    });
    const relativeMet = evaluate(relativeClaim(14));
    assert.equal(relativeMet.observed, DVG_RAW_RETURN - DVG2_RAW_RETURN, 'relative subtracts the reference return');
    assert.notEqual(relativeMet.observed, DVG_RAW_RETURN, 'and is not the subject return alone');
    assert.equal(relativeMet.closureEventType, PREDICATE_SATISFIED_EVENT);
    assert.equal(evaluate(relativeClaim(16)).closureEventType, PREDICATE_INVALIDATED_EVENT, '15 does not clear 16');

    /* DIRECTIONAL — `direction x ret(subject) > flatBand`. The bound is the claim's FROZEN band,
       not `predicate.value`, and the multiply is why a correct BEARISH call is satisfied on a
       series that fell. Without it every correct `trim` would read as invalidated. */
    const directional = (action, priceBasis) => evaluate(syntheticClaim(['DVG'], {
        priceBasis, action, predicate: { kind: 'directional', comparator: 'gte', value: PATH_BOUND },
    }));
    const correctBull = directional('add', 'raw-close');
    assert.equal(correctBull.bound, FIXTURE_FLAT_BAND, 'the bound is the frozen flat band');
    assert.notEqual(correctBull.bound, PATH_BOUND, 'and expressly NOT predicate.value');
    assert.equal(correctBull.observed, DVG_RAW_RETURN, '+1 x +10%');
    assert.equal(correctBull.closureEventType, PREDICATE_SATISFIED_EVENT);
    assert.equal(directional('trim', 'raw-close').observed, -DVG_RAW_RETURN, '-1 x +10% is a wrong bearish call');
    assert.equal(directional('trim', 'raw-close').closureEventType, PREDICATE_INVALIDATED_EVENT);
    const correctBear = directional('trim', 'adjusted-close');
    assert.equal(correctBear.observed, -DVG_ADJUSTED_RETURN, '-1 x -10% is a correct bearish call');
    assert.equal(correctBear.closureEventType, PREDICATE_SATISFIED_EVENT, 'which the flat band clears');

    /* SPREAD — `cmp(ret(subject.leg) - ret(reference.leg), predicate.value)`, LEG-scoped, so it is
       a different predicate from `relative` rather than a second spelling. On an equal-weighted
       basket the two disagree in VERDICT at the same bound, which is what proves the distinction:
       spread reads -15 (DVG2 leg alone) while relative reads -7.5 (the basket mean). */
    const pairPredicate = (kind) => ({ kind, comparator: 'lte', value: -10, reference: 'DVG' });
    const spread = evaluate(syntheticClaim(['DVG2', 'DVG'], {
        priceBasis: 'raw-close', weighting: 'equal', predicate: pairPredicate('spread'),
    }));
    const relativeSame = evaluate(syntheticClaim(['DVG2', 'DVG'], {
        priceBasis: 'raw-close', weighting: 'equal', predicate: pairPredicate('relative'),
    }));
    assert.equal(spread.observed, DVG2_RAW_RETURN - DVG_RAW_RETURN, 'spread is first leg minus reference leg');
    assert.equal(relativeSame.observed, (DVG2_RAW_RETURN + DVG_RAW_RETURN) / 2 - DVG_RAW_RETURN, 'relative weights the basket');
    assert.equal(spread.closureEventType, PREDICATE_SATISFIED_EVENT, '-15 clears -10');
    assert.equal(relativeSame.closureEventType, PREDICATE_INVALIDATED_EVENT, 'while -7.5 does not');

    /* EVERY SHIPPED KIND AND COMPARATOR IS HANDLED, iterated from the frozen arrays rather than
       from a list written here — so a fifth kind cannot be silently unreachable. */
    for (const kind of claims.PREDICATE_KINDS) {
        const result = evaluate(syntheticClaim(['DVG'], {
            priceBasis: 'raw-close', predicate: { kind, comparator: 'gte', value: 0, reference: 'DVG2' },
        }));
        assert.equal(result.ok, true, `${kind}: ${JSON.stringify(result.error ?? result.closure)}`);
        assert.equal(result.kind, kind, 'and reports the kind it was given');
    }
    for (const comparator of claims.PREDICATE_COMPARATORS) {
        const result = evaluate(syntheticClaim(['DVG'], {
            priceBasis: 'raw-close', predicate: { kind: 'threshold', comparator, value: 0 },
        }));
        assert.equal(result.ok, true, `${comparator}: ${JSON.stringify(result.error ?? result.closure)}`);
        assert.equal([POINT_COMPARATOR_MODE, PATH_COMPARATOR_MODE].includes(result.mode), true, 'in one of the two modes');
    }

    /* OUT OF VOCABULARY REFUSES — never coerced, and never treated as a default kind. The mint
       rejects both, so they can only arrive by injection into an already-minted claim. */
    const minted = syntheticClaim(['DVG'], { priceBasis: 'raw-close' });
    const badKind = evaluate(withPredicate(minted, { kind: 'thresholds' }));
    assert.equal(badKind.ok, false);
    assertRefusal(badKind.error, 'predicate-kind-not-allowed', 'predicate.kind', 'one-character-off kind');
    const badComparator = evaluate(withPredicate(minted, { comparator: 'gte ' }));
    assert.equal(badComparator.ok, false);
    assertRefusal(badComparator.error, 'predicate-comparator-not-allowed', 'predicate.comparator', 'trailing-space comparator');
    /* `constructor` is a real property of every object, so a lookup that missed the membership
       test would resolve it through the prototype chain instead of refusing. */
    assert.equal(evaluate(withPredicate(minted, { kind: 'constructor' })).error.reason, 'predicate-kind-not-allowed');

    /* A REFERENCE THAT IS NOT A COMMITTED SERIES CLOSES, with the shipped resolver reason so
       `buildResolution` accepts it against `not-evaluable` and rejects it against anything else. */
    const noReference = evaluate(syntheticClaim(['DVG'], {
        priceBasis: 'raw-close', predicate: { kind: 'relative', comparator: 'gte', value: 0, reference: null },
    }));
    assert.equal(noReference.ok, false);
    assert.deepEqual(noReference.closure, {
        closureEventType: 'not-evaluable', reasonCode: NO_COMMITTED_REFERENCE_REASON, field: 'predicate.reference',
    });
    assert.equal(claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(NO_COMMITTED_REFERENCE_REASON), true, 'the reason is shipped');

    /* THE VERDICT PAIR IS THE SHIPPED PAIR, so `buildResolution` needs no adapter. */
    for (const verdict of [thresholdMet, thresholdMissed]) {
        assert.equal(claims.CLOSURE_REASON_CODES[verdict.closureEventType].includes(verdict.reasonCode), true);
    }
});

test('T-04-U2 (increment 4): point and path comparators are different evaluations, and a path gap closes path-incomplete', () => {
    const calendar = loadCalendar(REPO_ROOT);
    const fences = fixtureFences(['DVG']);
    const dvg = (comparator, value) => evaluatePredicate(syntheticClaim(['DVG'], {
        priceBasis: 'raw-close', predicate: { kind: 'threshold', comparator, value },
    }), fences, calendar);

    /* THE SAME BOUND, TWO VERDICTS. The close returns +10 and misses 11; the session HIGH reaches
       +12 and clears it. If path evaluation silently read the close, these two would agree — and
       a claim whose author asked "did it ever touch +11%" would be answered "no" for a session
       that did. The mirrored low pair proves it is not merely reading a different constant. */
    assert.equal(dvg('gte', PATH_BOUND).closureEventType, PREDICATE_INVALIDATED_EVENT, 'the close misses the bound');
    const crossedAbove = dvg('crosses-above', PATH_BOUND);
    assert.equal(crossedAbove.closureEventType, PREDICATE_SATISFIED_EVENT, 'while the high clears it');
    assert.equal(crossedAbove.observed, DVG_RAW_HIGH_RETURN, 'and the observed value is the HIGH return');
    assert.notEqual(crossedAbove.observed, DVG_RAW_RETURN, 'never the close return');
    assert.equal(dvg('lte', -PATH_BOUND).closureEventType, PREDICATE_INVALIDATED_EVENT);
    const crossedBelow = dvg('crosses-below', -PATH_BOUND);
    assert.equal(crossedBelow.closureEventType, PREDICATE_SATISFIED_EVENT);
    assert.equal(crossedBelow.observed, DVG_RAW_LOW_RETURN, 'crosses-below reads the LOW');

    /* THE WINDOW IS THE UNIT OF EVALUATION. A point comparator reads one session; a path
       comparator reads every session of `[entryDate, resolutionDate]` from the committed calendar. */
    assert.deepEqual(dvg('gte', 0).sessionsEvaluated, [RESOLUTION_SESSION], 'a point comparator evaluates once');
    assert.equal(dvg('gte', 0).mode, POINT_COMPARATOR_MODE);
    assert.deepEqual(crossedAbove.sessionsEvaluated, [ENTRY_SESSION, RESOLUTION_SESSION], 'a path comparator walks the window');
    assert.equal(crossedAbove.mode, PATH_COMPARATOR_MODE);

    /* A GAP CLOSES RATHER THAN SCORING A PARTIAL PATH — a path evaluated over a subset is a
       DIFFERENT predicate, and answering it as though it were the authored one is the silent
       substitution HC-6 forbids. Anti-vacuity: the SAME window with the session restored
       resolves, so the closure is caused by the gap and not by a reader that refuses this shape. */
    const complete = threeSessionBars(calendar);
    const gapped = threeSessionBars(calendar, { skip: RESOLUTION_SESSION });
    assert.equal(complete.rows.length - gapped.rows.length, 1, 'exactly one interior session is removed');
    const pathClaim = syntheticClaim(['PATH3'], {
        priceBasis: 'raw-close',
        predicate: { kind: 'threshold', comparator: 'crosses-above', value: PATH_BOUND },
        resolutionDate: PATH_SESSION_3,
    });
    const fenceFor = (bars) => new Map([[claims.seriesRefFor('PATH3'), fenceObservations(calendar, bars, PATH_SESSION_3)]]);

    const whole = evaluatePredicate(pathClaim, fenceFor(complete), calendar);
    assert.equal(whole.ok, true, 'the complete window evaluates');
    assert.deepEqual(whole.sessionsEvaluated, [ENTRY_SESSION, RESOLUTION_SESSION, PATH_SESSION_3]);
    assert.equal(whole.decidedAt, RESOLUTION_SESSION, 'and it decides at the CROSSING session, not the last one');
    assert.equal(whole.observed, (112 / 100 - 1) * 100, 'reading that session own high');

    const gap = evaluatePredicate(pathClaim, fenceFor(gapped), calendar);
    assert.equal(gap.ok, false);
    assert.equal(Object.prototype.hasOwnProperty.call(gap, 'error'), false, 'a path gap carries no RTR-* code');
    assert.deepEqual(gap.closure, {
        closureEventType: 'unresolved',
        reasonCode: PATH_INCOMPLETE_REASON,
        field: `observations.${claims.seriesRefFor('PATH3')}.${RESOLUTION_SESSION}`,
    });
    assert.equal(claims.CLOSURE_REASON_CODES.unresolved.includes(PATH_INCOMPLETE_REASON), true, 'the reason is shipped');

    /* A MISSING ENTRY SESSION IS THE SINGLE-SESSION CASE, not a path gap: it is every term's
       denominator, so it comes back from the shipped endpoint reader as `session-absent`. */
    const noEntry = evaluatePredicate(pathClaim, fenceFor(threeSessionBars(calendar, { skip: ENTRY_SESSION })), calendar);
    assert.equal(noEntry.closure.reasonCode, SESSION_ABSENT_REASON, 'the denominator is the endpoint case');

    /* LOOKAHEAD IS THE INCREMENT-2 REFUSAL, NOT A SECOND RULE. A window fenced short of its own
       resolution date cannot be walked, and the code that says so is `basisValueAt`. */
    const shortFence = new Map([[claims.seriesRefFor('PATH3'), fenceObservations(calendar, complete, RESOLUTION_SESSION)]]);
    const beyond = evaluatePredicate(pathClaim, shortFence, calendar);
    assert.equal(beyond.ok, false);
    assert.equal(beyond.error.code, LOOKAHEAD_CODE, 'reading past the fence is RTR-LOOKAHEAD');

    /* A PATH ON AN ADJUSTED BASIS REFUSES RATHER THAN MIXING TWO SERIES. `h`/`l` are quoted with
       the OHLC close only, so dividing a RAW high by an ADJUSTED entry close would fabricate a
       return from two different series — the untraceable substitution R-04-01 exists to prevent. */
    const mixed = evaluatePredicate(syntheticClaim(['DVG'], {
        priceBasis: 'adjusted-close',
        predicate: { kind: 'threshold', comparator: 'crosses-above', value: PATH_BOUND },
    }), fences, calendar);
    assert.equal(mixed.ok, false);
    assert.equal(mixed.error.code, PRICE_BASIS_CODE, 'code');
    assert.equal(mixed.error.reason, 'path-extremes-absent-for-basis', 'reason');
    assert.equal(mixed.error.priceBasis, 'adjusted-close', 'naming the basis that carries no extremes');

    /* AN ABSENT EXTREME ON A ROW REFUSES rather than arriving as `undefined` and then `NaN`.
       The fence is built directly here because `readBars` requires `h`, which is exactly the
       guarantee this guard exists to survive the absence of. */
    const noHigh = {
        sym: 'NOHIGH',
        rows: [ENTRY_SESSION, RESOLUTION_SESSION].map((tradingDate, index) => ({
            t: sessionOpenEpoch(calendar, tradingDate), o: 99, l: 98, c: 100 + index * 10, v: 1,
        })),
    };
    const absent = evaluatePredicate(syntheticClaim(['NOHIGH'], {
        priceBasis: 'raw-close',
        predicate: { kind: 'threshold', comparator: 'crosses-above', value: PATH_BOUND },
    }), new Map([[claims.seriesRefFor('NOHIGH'), fenceObservations(calendar, noHigh, RESOLUTION_SESSION)]]), calendar);
    assert.equal(absent.ok, false);
    assert.equal(absent.error.reason, 'path-extreme-absent-from-observation', 'reason');
    assert.equal(absent.error.field, `observations.NOHIGH.${ENTRY_SESSION}.h`, 'naming the exact row field');
});

test('T-04-U9: closing a due claim twice appends nothing the second time', () => {
    const foundation = validationRequire('../rlcontracts.js');
    const registry = toolsRegistry();
    const claim = syntheticClaim(['DVG'], { priceBasis: 'raw-close' });

    const derived = originRecommendationKeyFor(claim, registry);
    assert.equal(derived.ok, true, JSON.stringify(derived.error ?? null));
    const key = derived.originRecommendationKey;

    /* The live entry is PROPOSED THROUGH THE SHIPPED REDUCER, so the entry this row closes has the
       shape the reducer itself writes rather than one authored here. The five terms the origin key
       ignores arrive from the bridge as `null` sentinels and `normalizeRecommendation` requires
       them present, so they are supplied — and because the key ignores them, the proposed entry
       must still land under the DERIVED key, which is asserted rather than assumed. */
    const run = {
        runId: `run-${RESOLUTION_SESSION}`,
        occurredAt: `${RESOLUTION_SESSION}T20:00:00.000Z`,
        canonicalMonth: RESOLUTION_SESSION.slice(0, 7),
    };
    const proposed = foundation.reduceRecommendationEvents(null, [{
        ...derived.terms,
        trigger: 'fixture-trigger',
        invalidation: 'fixture-invalidation',
        confidenceBand: 'fixture-band',
        confidenceScore: 0.5,
        rationaleEvidenceIds: ['fixture-evidence'],
    }], run);
    assert.equal(proposed.ok, true, JSON.stringify(proposed.error ?? null));
    const liveIndex = proposed.value.index;
    assert.equal(liveIndex.entries[key].state, LIVE_ENTRY_STATE, 'the proposal is live under the derived key');

    /* The gate the due predicate needs and the reducer entry cannot carry: the row's `claimRef`
       and the claim's frozen `horizon.resolutionDate`, keyed by the producer's own key. */
    const bound = claimEntryBindings([{ claim, row: { claimRef: claim.claimHash } }], registry);
    assert.equal(bound.ok, true, JSON.stringify(bound.error ?? null));
    const gate = {
        asOfDate: RESOLUTION_SESSION,
        bindings: bound.bindings,
        seriesAsOf: seriesAsOfMap(['DVG'], RESOLUTION_SESSION),
    };
    assert.deepEqual(dueEntryKeys(liveIndex, gate).dueEntryKeys, [key], 'so exactly that one key is due');

    const verdicts = [{ claim, closureEventType: PREDICATE_SATISFIED_EVENT, reasonCode: 'predicate-satisfied' }];

    /* FIRST PASS — one closure, nothing skipped, one event appended. */
    const first = closeDueClaims({ index: liveIndex, verdicts, toolsRegistry: registry, run, ...gate });
    assert.equal(first.ok, true, JSON.stringify(first.error ?? null));
    assert.equal(first.closures.length, 1, 'the first pass closes exactly one entry');
    assert.equal(first.closures[0].originRecommendationKey, key, 'the derived key, never an authored one');
    assert.equal(first.skipped.length, 0, 'and skips nothing');
    assert.equal(first.events.length, 1, 'appending exactly one lifecycle event');
    assert.equal(first.events[0].eventType, PREDICATE_SATISFIED_EVENT, 'of the verdict own closure type');

    /* THE TRANSITION IS THE REDUCER OWN OUTPUT — `first.index` is what `applyClosures` returned,
       so nothing here hand-sets a state and then tests its own fake. */
    const closedIndex = first.index;
    assert.equal(closedIndex.entries[key].state, CLOSED_ENTRY_STATE, 'the reducer closed the entry');
    assert.deepEqual(dueEntryKeys(closedIndex, gate).dueEntryKeys, [], 'so the due set is now empty');

    /* SECOND PASS — the SAME verdict against the reduction the first pass produced. */
    const second = closeDueClaims({ index: closedIndex, verdicts, toolsRegistry: registry, run, ...gate });
    assert.equal(second.ok, true, JSON.stringify(second.error ?? null));
    assert.equal(second.closures.length, 0, 'the second pass closes nothing');
    assert.equal(second.events.length, 0, 'and appends NO event — this is the idempotence claim');
    assert.equal(second.skipped.length, 1, 'the claim is accounted for as skipped, not silently dropped');
    assert.equal(second.skipped[0].originRecommendationKey, key);
    assert.equal(second.skipped[0].reason, NOT_DUE_REASON, 'a re-run is a normal event, not a refusal');
    assert.equal(second.skipped[0].state, CLOSED_ENTRY_STATE, 'naming the state that made it not due');
    assert.equal(second.skipped[0].claimHash, claim.claimHash, 'and carrying the claim own address');
    assert.equal(
        second.index.indexFingerprint,
        closedIndex.indexFingerprint,
        'the reduction is byte-identical, so the second pass changed nothing at all',
    );

    /* NON-VACUITY. The second pass being empty only means something because the first was not:
       an implementation that returned zero closures unconditionally fails these two, so the
       emptiness above is a measured suppression rather than a function that never closes. */
    assert.equal(first.closures.length > 0, true, 'the first pass was non-empty on this same input');
    assert.equal(first.events.length > 0, true, 'and did append an event, which the second did not');
});

/** The live lifecycle index this claim proposes into, produced BY THE SHIPPED REDUCER. */
function proposedLiveIndex(foundation, terms, run) {
    const proposed = foundation.reduceRecommendationEvents(null, [proposalRow(terms)], run);
    assert.equal(proposed.ok, true, JSON.stringify(proposed.error ?? null));
    return proposed.value.index;
}

test('T-04-U10: the reducer key is derived by the shipped producer, never authored here', () => {
    const foundation = validationRequire('../rlcontracts.js');
    const registry = toolsRegistry();

    const derived = originRecommendationKeyFor(syntheticClaim(['DVG'], { priceBasis: 'raw-close' }), registry);
    assert.equal(derived.ok, true, JSON.stringify(derived.error ?? null));

    /* THE KEY IS THE PRODUCER'S OWN OUTPUT, byte for byte, over the record the bridge reports it
       assembled. A bridge that derived correctly and then prefixed, truncated, cached or
       substituted a hand-authored key fails HERE, because the comparison re-runs the producer
       rather than re-reading whatever the bridge chose to return. */
    assert.equal(
        derived.originRecommendationKey,
        foundation.deriveRecommendationKeys(derived.terms).originRecommendationKey,
        'the bridge returns the producer own key for the record it built',
    );

    /* NON-VACUITY, TERM BY TERM. Equality above would also hold for a producer — or a bridge —
       that returned one constant, so every MEASURED contributing term is perturbed in isolation
       and must move the key. `ORIGIN_KEY_TERMS` is read off the producer by perturbation, so this
       loop widens by itself if the producer starts folding in a further field. */
    assert.equal(ORIGIN_KEY_TERMS.length > 0, true, 'the measured contributing set is not empty');
    for (const term of ORIGIN_KEY_TERMS) {
        const value = derived.terms[term];
        assert.notEqual(value, undefined, `${term}: the bridge supplies every contributing term`);
        const perturbed = Array.isArray(value) ? [...value, 'PERTURBED'] : `${value}-perturbed`;
        assert.notEqual(
            foundation.deriveRecommendationKeys({ ...derived.terms, [term]: perturbed }).originRecommendationKey,
            derived.originRecommendationKey,
            `${term}: changing this term MUST move the key`,
        );
    }

    /* AND THE BRIDGE ITSELF IS SENSITIVE TO CLAIM CONTENT, not merely the producer beneath it:
       two claims differing in one HASHED field derive two different keys through the same call,
       and the second key is the producer own as well. */
    const other = originRecommendationKeyFor(syntheticClaim(['DVG2'], { priceBasis: 'raw-close' }), registry);
    assert.equal(other.ok, true, JSON.stringify(other.error ?? null));
    assert.notEqual(other.originRecommendationKey, derived.originRecommendationKey, 'a different subject derives a different key');
    assert.equal(
        other.originRecommendationKey,
        foundation.deriveRecommendationKeys(other.terms).originRecommendationKey,
        'and that key is the producer own too',
    );
});

test('T-04-U11: a closure that bypasses run.closures is not silently accepted', () => {
    const foundation = validationRequire('../rlcontracts.js');
    const registry = toolsRegistry();
    const claim = syntheticClaim(['DVG'], { priceBasis: 'raw-close' });

    const derived = originRecommendationKeyFor(claim, registry);
    assert.equal(derived.ok, true, JSON.stringify(derived.error ?? null));
    const key = derived.originRecommendationKey;

    const run = {
        runId: `run-${RESOLUTION_SESSION}`,
        occurredAt: `${RESOLUTION_SESSION}T20:00:00.000Z`,
        canonicalMonth: RESOLUTION_SESSION.slice(0, 7),
    };
    const liveIndex = proposedLiveIndex(foundation, derived.terms, run);
    assert.equal(liveIndex.entries[key].state, LIVE_ENTRY_STATE, 'the entry starts live');

    /* Exactly the row `closeDueClaims` builds, so the two bypasses below differ from the accepted
       path in the CHANNEL alone and never in the payload. */
    const closure = {
        originRecommendationKey: key,
        eventType: PREDICATE_SATISFIED_EVENT,
        reasonCode: 'predicate-satisfied',
    };

    /* BYPASS 1 — the closure rides on the RUN OBJECT rather than the argument. `applyClosures`
       calls the reducer with `{ ...run, closures }`, its own parameter LAST, so a smuggled
       `run.closures` is overwritten by the empty argument before the reducer ever sees it.
       MEASURED OUTCOME: accepted and inert — a silent DROP, not a refusal. */
    const smuggled = applyClosures(liveIndex, [], { ...run, closures: [closure] });
    assert.equal(smuggled.ok, true, 'the smuggled closure does not refuse — it is dropped');
    assert.equal(smuggled.events.length, 0, 'and appends no lifecycle event at all');
    assert.equal(smuggled.index.entries[key].state, LIVE_ENTRY_STATE, 'so the entry is STILL LIVE');
    assert.equal(
        smuggled.index.indexFingerprint,
        liveIndex.indexFingerprint,
        'the reduction is byte-identical, so nothing at all took effect',
    );

    /* BYPASS 2 — the same row handed through `current`, the PROPOSALS channel, which is the other
       array the reducer reads. MEASURED OUTCOME: a REFUSAL, and the reducer own named one —
       `eventType` is not a recommendation field, so a closure cannot masquerade as a proposal. */
    const asProposal = foundation.reduceRecommendationEvents(liveIndex, [closure], run);
    assert.equal(asProposal.ok, false, 'a closure is not a proposal');
    assertRefusal(asProposal.error, 'unknown-field', 'current.0.eventType', 'closure through current');

    /* NON-VACUITY. Both bypasses failing to close means nothing unless the SAME closure through
       the SAME reducer DOES close when it enters by `run.closures`: without this pairing every
       assertion above would also pass against a reducer that closed nothing, ever. */
    const correct = applyClosures(liveIndex, [closure], run);
    assert.equal(correct.ok, true, JSON.stringify(correct.error ?? null));
    assert.equal(correct.events.length, 1, 'the sanctioned channel appends exactly one event');
    assert.equal(correct.events[0].eventType, PREDICATE_SATISFIED_EVENT, 'of the closure own type');
    assert.equal(correct.index.entries[key].state, CLOSED_ENTRY_STATE, 'and transitions the entry to closed');
    assert.notEqual(
        correct.index.indexFingerprint,
        liveIndex.indexFingerprint,
        'so a real closure is observable in the reduction the bypasses left untouched',
    );
});

/* ── The due gate: T-04-U12 .. T-04-U14 (increment 6) ────────────────────────────────────────

   Step 3's predicate is THREE conjuncts and only the first is a property of the reduction. The
   other two read facts a `recommendation-index/v1` entry does not carry — the ledger row's
   `claimRef` and the claim's frozen `horizon.resolutionDate` — so the binding is passed IN, per
   Ruling R-04-06. These rows assert that each conjunct is a real gate, that each exclusion names
   its own reason AND its own remedy, and that the date comparison is exact on both sides. */

const GATE_SESSION = RESOLUTION_SESSION;
const LATER_SESSION = PATH_SESSION_3;

/** The proposal row the shipped reducer accepts, built from the terms the bridge derived. */
function proposalRow(terms) {
    return {
        ...terms,
        trigger: 'fixture-trigger',
        invalidation: 'fixture-invalidation',
        confidenceBand: 'fixture-band',
        confidenceScore: 0.5,
        rationaleEvidenceIds: ['fixture-evidence'],
    };
}

/** A claim, the ledger row that points at it, and the reducer key all three are joined under. */
function gateFixture(registry, symbols, { resolutionDate = GATE_SESSION, bound = true } = {}) {
    const claim = syntheticClaim(symbols, { priceBasis: 'raw-close', resolutionDate });
    const derived = originRecommendationKeyFor(claim, registry);
    assert.equal(derived.ok, true, JSON.stringify(derived.error ?? null));
    return {
        claim,
        key: derived.originRecommendationKey,
        terms: derived.terms,
        /* A legacy row OMITS the pointer field entirely — that absence is exactly what
           `authorizeResolutionWrite` reads — so the fixture deletes the key rather than nulling it. */
        row: bound ? { claimRef: claim.claimHash } : {},
        verdict: { claim, closureEventType: PREDICATE_SATISFIED_EVENT, reasonCode: 'predicate-satisfied' },
    };
}

test('T-04-U12: the due gate evaluates all three conjuncts, and each exclusion names its own reason', () => {
    const foundation = validationRequire('../rlcontracts.js');
    const registry = toolsRegistry();
    const run = {
        runId: `run-${GATE_SESSION}`,
        occurredAt: `${GATE_SESSION}T20:00:00.000Z`,
        canonicalMonth: GATE_SESSION.slice(0, 7),
    };

    const matured = gateFixture(registry, ['DVG']);
    const unarrived = gateFixture(registry, ['DVG2'], { resolutionDate: LATER_SESSION });
    const unbound = gateFixture(registry, ['RAWONLY'], { bound: false });
    const closedOut = gateFixture(registry, ['PATH3']);
    const all = [matured, unarrived, unbound, closedOut];
    assert.equal(new Set(all.map((fixture) => fixture.key)).size, 4, 'the four fixtures derive four distinct keys');

    const proposed = foundation.reduceRecommendationEvents(null, all.map((fixture) => proposalRow(fixture.terms)), run);
    assert.equal(proposed.ok, true, JSON.stringify(proposed.error ?? null));

    /* The fourth entry is closed THROUGH THE REDUCER, so the state the first conjunct reads is
       the reduction's own rather than one hand-set here and then tested against itself. */
    const preClosed = applyClosures(proposed.value.index, [{
        originRecommendationKey: closedOut.key,
        eventType: PREDICATE_SATISFIED_EVENT,
        reasonCode: 'predicate-satisfied',
    }], run);
    assert.equal(preClosed.ok, true, JSON.stringify(preClosed.error ?? null));
    const index = preClosed.index;
    assert.equal(index.entries[closedOut.key].state, CLOSED_ENTRY_STATE, 'the reducer closed it');
    assert.equal(index.entries[unbound.key].state, LIVE_ENTRY_STATE, 'and the unbound entry is still LIVE');

    const bound = claimEntryBindings(all.map((fixture) => ({ claim: fixture.claim, row: fixture.row })), registry);
    assert.equal(bound.ok, true, JSON.stringify(bound.error ?? null));
    assert.equal(bound.bindings.get(unbound.key).claimRef, null, 'a row with no pointer binds a null claimRef');
    assert.equal(bound.bindings.get(matured.key).claimRef, matured.claim.claimHash, 'a bound row carries the claim own address');
    assert.equal(bound.bindings.get(unarrived.key).resolutionDate, LATER_SESSION, 'and the horizon comes off the claim');

    /* EVERY series here is observed through the LATER session, so the data conjunct is satisfied
       for all four and cannot be the thing selecting between them. The three exclusions below are
       therefore the three ORIGINAL conjuncts, isolated — T-04-U16 exercises the fourth alone. */
    const seriesAsOf = seriesAsOfMap(['DVG', 'DVG2', 'RAWONLY', 'PATH3'], LATER_SESSION);

    const gated = dueEntryKeys(index, { asOfDate: GATE_SESSION, bindings: bound.bindings, seriesAsOf });
    assert.equal(gated.ok, true, JSON.stringify(gated.error ?? null));

    /* ONE key survives all three conjuncts, and its horizon lands EXACTLY on the as-of date — the
       comparison is `<=`, so a claim maturing today resolves today rather than waiting a session. */
    assert.deepEqual(gated.dueEntryKeys, [matured.key], 'exactly the live, bound, matured entry');

    /* EVERY exclusion is reported, and each names a DIFFERENT reason and a DIFFERENT remedy. */
    const excluded = new Map(gated.notDue.map((entry) => [entry.originRecommendationKey, entry]));
    assert.equal(gated.notDue.length, 3, 'three entries excluded, none silently dropped');
    assert.equal(excluded.get(unarrived.key).reason, HORIZON_NOT_REACHED_REASON, 'the unarrived horizon');
    assert.equal(excluded.get(unarrived.key).remedy, 'later-as-of-date', 'which time alone will cure');
    assert.equal(excluded.get(unbound.key).reason, ENTRY_UNBOUND_REASON, 'the claimless row');
    assert.equal(excluded.get(unbound.key).remedy, 'never', 'which is unscoreable by construction');
    assert.equal(excluded.get(closedOut.key).reason, NOT_DUE_REASON, 'the closed entry');
    assert.equal(excluded.get(closedOut.key).remedy, 'ledger-event', 'which only a re-proposal reopens');
    assert.equal(new Set(gated.notDue.map((entry) => entry.reason)).size, 3, 'three distinct reasons');
    assert.equal(new Set(gated.notDue.map((entry) => entry.remedy)).size, 3, 'and three distinct remedies');
    assert.deepEqual(
        gated.notDue.map((entry) => entry.remedy).sort(),
        [NOT_DUE_REMEDY[ENTRY_UNBOUND_REASON], NOT_DUE_REMEDY[HORIZON_NOT_REACHED_REASON], NOT_DUE_REMEDY[NOT_DUE_REASON]].sort(),
        'each remedy read off the shipped table rather than authored at the exclusion',
    );

    /* Each exclusion carries the FACTS that caused it, so a reader diagnoses it without
       re-deriving the gate. */
    assert.equal(excluded.get(unarrived.key).resolutionDate, LATER_SESSION, 'the horizon it is waiting on');
    assert.equal(excluded.get(unarrived.key).asOfDate, GATE_SESSION, 'and the date it was measured against');

    /* THE PASS REPORTS THE SAME REASON IT GATED ON. One verdict per fixture: one closes, the
       other three are accounted for as `skipped` with the gate's own reason rather than one name
       standing for three different facts. */
    const pass = closeDueClaims({
        index,
        verdicts: all.map((fixture) => fixture.verdict),
        toolsRegistry: registry,
        run,
        asOfDate: GATE_SESSION,
        bindings: bound.bindings,
        seriesAsOf,
    });
    assert.equal(pass.ok, true, JSON.stringify(pass.error ?? null));
    assert.deepEqual(pass.closures.map((closure) => closure.originRecommendationKey), [matured.key], 'one closure');
    assert.equal(pass.events.length, 1, 'and exactly one lifecycle event appended');
    assert.equal(pass.skipped.length, 3, 'the other three verdicts are accounted for, not dropped');
    assert.deepEqual(
        pass.skipped.map((skip) => skip.reason).slice().sort(),
        [ENTRY_UNBOUND_REASON, HORIZON_NOT_REACHED_REASON, NOT_DUE_REASON].slice().sort(),
        'each skip carries the conjunct that excluded it',
    );
    assert.equal(pass.skipped.every((skip) => skip.claimHash !== null), true, 'each naming the claim own address');
    assert.equal(pass.notDue.length, 3, 'and the entry-side exclusions are reported too');

    /* NON-VACUITY, AND THE WHOLE POINT OF THE SPLIT. Advance ONLY the as-of date by one session:
       the unarrived horizon joins the due set and the other two exclusions do not move. An
       implementation reporting one undifferentiated "not due" could not produce this, and one
       that ignored the horizon conjunct would have admitted `unarrived` in the first pass. */
    const tomorrow = dueEntryKeys(index, { asOfDate: LATER_SESSION, bindings: bound.bindings, seriesAsOf });
    assert.equal(tomorrow.ok, true, JSON.stringify(tomorrow.error ?? null));
    assert.deepEqual(
        tomorrow.dueEntryKeys.slice().sort(),
        [matured.key, unarrived.key].slice().sort(),
        'the matured horizon becomes due on the passage of time alone',
    );
    const later = new Map(tomorrow.notDue.map((entry) => [entry.originRecommendationKey, entry.reason]));
    assert.equal(later.size, 2, 'and only two exclusions remain');
    assert.equal(later.get(unbound.key), ENTRY_UNBOUND_REASON, 'the claimless row never becomes due');
    assert.equal(later.get(closedOut.key), NOT_DUE_REASON, 'nor does the closed entry');
});

test('T-04-U13: the horizon comparison is exact — a prefix-shaped date refuses rather than sorting', () => {
    const registry = toolsRegistry();
    const claim = syntheticClaim(['DVG'], { priceBasis: 'raw-close' });
    const bound = claimEntryBindings([{ claim, row: { claimRef: claim.claimHash } }], registry);
    assert.equal(bound.ok, true, JSON.stringify(bound.error ?? null));
    const empty = { entries: {} };
    const seriesAsOf = seriesAsOfMap(['DVG'], GATE_SESSION);

    /* A PREFIX-SHAPED AS-OF DATE REFUSES. `2026-07-1` is not a date this module can compare: it
       sorts BELOW `2026-07-10` and ABOVE `2026-07-09`, so accepting it would call the same claim
       due on one day and not-yet-due on the next. */
    const malformed = dueEntryKeys(empty, { asOfDate: '2026-07-1', bindings: bound.bindings, seriesAsOf });
    assert.equal(malformed.ok, false);
    assertRefusal(malformed.error, 'as-of-date-not-iso', 'gate.asOfDate', 'prefix-shaped asOfDate');

    /* ANTI-VACUITY: the well-formed neighbours on BOTH sides of that ambiguity are accepted, so
       the refusal is caused by the shape and not by a gate that refuses dates in this region. */
    for (const asOfDate of ['2026-07-01', '2026-07-09', '2026-07-10']) {
        assert.equal(dueEntryKeys(empty, { asOfDate, bindings: bound.bindings, seriesAsOf }).ok, true, asOfDate);
    }

    /* AND ON THE OTHER SIDE OF THE COMPARISON: a prefix-shaped frozen horizon never reaches the
       gate at all, because the binding refuses to be built from it. */
    const short = structuredClone(claim);
    short.horizon.resolutionDate = '2026-07-1';
    const unbuildable = claimEntryBindings([{ claim: short, row: { claimRef: short.claimHash } }], registry);
    assert.equal(unbuildable.ok, false);
    assertRefusal(unbuildable.error, 'resolution-date-not-iso', 'horizon.resolutionDate', 'prefix-shaped horizon');

    /* ANTI-VACUITY for the same mutation shape: the padded date binds and is carried through
       verbatim, so the refusal is the missing digit and not the fact that the date was rewritten. */
    const padded = structuredClone(claim);
    padded.horizon.resolutionDate = '2026-07-01';
    const buildable = claimEntryBindings([{ claim: padded, row: { claimRef: padded.claimHash } }], registry);
    assert.equal(buildable.ok, true, JSON.stringify(buildable.error ?? null));
    const paddedKey = originRecommendationKeyFor(padded, registry).originRecommendationKey;
    assert.equal(buildable.bindings.get(paddedKey).resolutionDate, '2026-07-01', 'carried through, never reformatted');

    /* THE GATE IS REQUIRED, NOT OPTIONAL. Omitting either half refuses rather than degrading to a
       narrower predicate, which would silently admit an unbound, an unmatured, or a not-yet-
       observed entry with nothing in the result to say that conjunct was never evaluated. */
    const ungated = dueEntryKeys(empty, { asOfDate: GATE_SESSION, seriesAsOf });
    assert.equal(ungated.ok, false);
    assertRefusal(ungated.error, 'claim-bindings-absent', 'gate.bindings', 'omitted bindings');
    const unobserved = dueEntryKeys(empty, { asOfDate: GATE_SESSION, bindings: bound.bindings });
    assert.equal(unobserved.ok, false);
    assertRefusal(unobserved.error, 'series-as-of-absent', 'gate.seriesAsOf', 'omitted series as-of map');
    assert.equal(dueEntryKeys(empty).ok, false, 'and omitting the gate entirely refuses too');
});

test('T-04-U14: a binding names the claim it gates, and a pointer to another claim refuses', () => {
    const registry = toolsRegistry();
    const claim = syntheticClaim(['DVG'], { priceBasis: 'raw-close' });
    const other = syntheticClaim(['DVG2'], { priceBasis: 'raw-close' });
    assert.notEqual(other.claimHash, claim.claimHash, 'the two fixtures are two different claims');

    /* THE POINTER IS CHECKED AGAINST THE CLAIM IT GATES. Holding one claim's horizon behind
       another claim's `claimRef` would gate a row on terms nobody bound to it — the untraceable
       substitution the pointer exists to make impossible. */
    const crossed = claimEntryBindings([{ claim, row: { claimRef: other.claimHash } }], registry);
    assert.equal(crossed.ok, false);
    assertRefusal(crossed.error, 'claim-ref-names-another-claim', claims.CLAIM_REF_FIELD, 'crossed pointer');

    /* A MALFORMED POINTER IS A DIFFERENT DEFECT and is named as one, through the shipped
       `CLAIM_REF_PATTERN` rather than a second copy of the shape written here. */
    const malformed = claimEntryBindings([{ claim, row: { claimRef: 'sha256:not-hex' } }], registry);
    assert.equal(malformed.ok, false);
    assertRefusal(malformed.error, 'claim-ref-not-opaque-sha256', claims.CLAIM_REF_FIELD, 'malformed pointer');
    assert.equal(claims.CLAIM_REF_PATTERN.test(claim.claimHash), true, 'and the accepted shape is the shipped one');

    /* ANTI-VACUITY: the SAME call with the claim's own pointer binds, so both refusals above are
       caused by the pointer value rather than by a builder that refuses this fixture outright. */
    const honest = claimEntryBindings([{ claim, row: { claimRef: claim.claimHash } }], registry);
    assert.equal(honest.ok, true, JSON.stringify(honest.error ?? null));

    /* TWO PAIRS DERIVING ONE KEY REFUSE. Silently keeping the last would gate the entry on
       whichever claim happened to be listed second, which is the same ambiguity
       `duplicate-closure-key-in-pass` refuses one step later. */
    const duplicated = claimEntryBindings([
        { claim, row: { claimRef: claim.claimHash } },
        { claim, row: { claimRef: claim.claimHash } },
    ], registry);
    assert.equal(duplicated.ok, false);
    assertRefusal(duplicated.error, 'duplicate-binding-key', 'pairs', 'duplicate binding');
});

/** The resolver's own source text, for the two "consumed, never re-implemented" static scans. */
function resolverSourceText() {
    return readFileSync(path.join(REPO_ROOT, 'scripts', 'brief-resolve-outcomes.mjs'), 'utf8');
}

/**
 * A git exit code, never its stdout. `execFileSync` throws on non-zero, so the status is read off
 * the thrown error rather than inferred from output; a command that failed to run at all reports
 * -1 and can never be mistaken for a clean 0.
 */
function gitExitCode(args) {
    try {
        execFileSync('git', args, { cwd: REPO_ROOT, stdio: 'ignore' });
        return 0;
    } catch (error) {
        return typeof error.status === 'number' ? error.status : -1;
    }
}

/**
 * Array literals in `source` that restate the reason vocabulary — two or more members quoted
 * inside ONE literal. Naming a single reason as a constant is legitimate and the resolver does it;
 * naming a SET is a second copy of a shipped list, which is what goes stale against it.
 */
function restatedReasonSets(source, reasons) {
    return [...source.matchAll(/\[[^[\]]*\]/g)]
        .map((match) => match[0])
        .filter((literal) => reasons.filter((r) => literal.includes(`'${r}'`) || literal.includes(`"${r}"`)).length >= 2);
}

test('T-04-U4: RTR-CLOSURE-VOCAB is raised by the shipped buildResolution, never re-implemented by the resolver', () => {
    const vocabulary = closureVocabulary();
    const offending = 'partially-satisfied';
    assert.equal(vocabulary.includes(offending), false, `${offending}: must genuinely be outside the vocabulary`);

    /* THE REFUSAL, from the SHIPPED builder. The code identity is read off the rlclaims.js export
       rather than typed here, so a rename upstream fails this row instead of leaving it asserting
       a string the module no longer raises. */
    const refused = claims.buildResolution(resolutionInput({ closureEventType: offending }));
    assert.equal(refused.ok, false, `${offending}: must refuse`);
    assert.equal(refused.error.code, claims.CLOSURE_VOCAB_CODE, 'the owned code');
    assert.equal(claims.CLOSURE_VOCAB_CODE, 'RTR-CLOSURE-VOCAB', 'which is the code D4 names');
    assertRefusal(refused.error, 'closure-event-not-in-vocabulary', 'closureEventType', `closureEventType "${offending}"`);

    /* ANTI-VACUITY. The same call differing in exactly the closure event is ACCEPTED, so the
       refusal above is caused by vocabulary membership and not by a builder refusing this input
       outright — which is what a permissive-or-broken implementation would look like here. */
    const accepted = builtResolution({ closureEventType: 'satisfied', reasonCode: 'predicate-satisfied' });
    assert.equal(accepted.closureEventType, 'satisfied', 'an in-vocabulary member is accepted');
    assert.equal(vocabulary.includes(accepted.closureEventType), true, 'and it is a member of the frozen vocabulary');

    /* RAISED FROM rlclaims.js, NOT FROM THE RESOLVER. The resolver carries no quoted copy of the
       code and no constant of its own bound to it — its single mention is backticked prose saying
       the refusal stays `buildResolution`'s to raise. Two owners of one refusal code is how a code
       ends up meaning two things, so a second owner added tomorrow fails here. */
    const resolverSource = resolverSourceText();
    assert.equal(/['"]RTR-CLOSURE-VOCAB['"]/.test(resolverSource), false, 'the resolver declares no copy of the code');
    assert.equal(/CLOSURE_VOCAB_CODE\s*=/.test(resolverSource), false, 'nor a constant of its own bound to it');

    /* Nor does it PRE-EMPT the check. Handed the same offending value, the resolver's own axis step
       refuses under a DIFFERENT, resolver-owned code; reaching RTR-CLOSURE-VOCAB therefore requires
       the shipped builder. The vocabulary is consumed, not shadowed and not extended locally. */
    const preempted = resolutionAxesFor({}, offending, null);
    assert.equal(preempted.ok, false, 'the resolver refuses the same value');
    assert.notEqual(preempted.error.code, claims.CLOSURE_VOCAB_CODE, 'but never under the builder-owned code');
    assertRefusal(preempted.error, 'closure-event-carries-no-outcome-class', 'closureEventType', 'resolver axis step');

    /* THE CONSUMED MODULES ARE UNMODIFIED, so this row asserts the behaviour of the SHIPPED bytes
       rather than of a local edit made to satisfy it. */
    assert.equal(
        gitExitCode(['diff', '--quiet', '--', 'rlclaims.js', 'rlcontracts.js']),
        0,
        'rlclaims.js and rlcontracts.js carry no working-tree modification',
    );
    // The helper can genuinely report failure, so the 0 above is a measurement and not a constant.
    assert.notEqual(
        gitExitCode(['rev-parse', '--verify', '--quiet', 'refs/heads/rtr-t-04-u4-absent-ref']),
        0,
        'the exit-code helper distinguishes non-zero',
    );
});

test('T-04-U6: the not-evaluable reason set is READ from rlclaims.js, never restated by the resolver', () => {
    const reasons = claims.NOT_EVALUABLE_REASONS;

    /* DERIVED, NOT PINNED. The set IS the sorted dedup union of the two shipped lists, so a tenth
       mint reason lands here automatically instead of leaving this row asserting a stale count.

       The plan's arithmetic does NOT hold and is not asserted: `MINT_REFUSALS.length + 2` is 11,
       while the shipped set carries 12. `MINT_REFUSALS` grew to nine and
       `RESOLVER_NOT_EVALUABLE_REASONS` carries THREE members, not two. The relationship asserted
       here is the one `unionSorted` actually implements. */
    const union = [...new Set([...claims.MINT_REFUSALS, ...claims.RESOLVER_NOT_EVALUABLE_REASONS])].sort();
    assert.deepEqual([...reasons], union, 'the set is the union of the two shipped lists');
    assert.deepEqual(
        claims.MINT_REFUSALS.filter((reason) => claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(reason)),
        [],
        'the two lists are disjoint, which is what makes the sum exact rather than an upper bound',
    );
    assert.equal(
        reasons.length,
        claims.MINT_REFUSALS.length + claims.RESOLVER_NOT_EVALUABLE_REASONS.length,
        'so the cardinality is the sum of the two source lists, derived rather than typed',
    );
    assert.equal(Object.isFrozen(reasons), true, 'and the shipped set is frozen against a local push');

    /* Every member is a non-empty kebab-case string. A reason is a wire value: an empty string, a
       capital or an underscore would still read as "a reason" to a consumer while never matching
       the value the module raises. */
    for (const reason of reasons) {
        assert.equal(typeof reason, 'string', `${JSON.stringify(reason)}: is a string`);
        assert.notEqual(reason.length, 0, `${JSON.stringify(reason)}: is non-empty`);
        assert.match(reason, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${reason}: is kebab-case`);
    }

    /* READ, NOT RESTATED. The resolver may legitimately name an INDIVIDUAL reason as a constant —
       it does so twice and asserts each against the shipped set at load, which is why a rename
       upstream fails at import there rather than producing a reason `buildResolution` rejects.
       What is forbidden is a restated SET, so the scan looks inside array literals rather than at
       bare occurrences, which would condemn those two legitimate constants. */
    const resolverSource = resolverSourceText();
    assert.deepEqual(restatedReasonSets(resolverSource, reasons), [], 'no array literal in the resolver restates the reason set');
    for (const named of ['calendar-coverage-exhausted', 'no-committed-reference']) {
        assert.equal(reasons.includes(named), true, `${named}: the individually named constant is a member of the shipped set`);
    }
    assert.equal(
        /claims\.RESOLVER_NOT_EVALUABLE_REASONS/.test(resolverSource),
        true,
        'and the resolver CONSUMES the shipped list rather than merely avoiding a copy',
    );

    /* ANTI-VACUITY. The same scan is run over sources that DO restate the set and must flag them —
       without this the clean result above would hold equally for a scanner that never matched. */
    assert.equal(
        restatedReasonSets(`const LOCAL = [${reasons.map((r) => `'${r}'`).join(', ')}];`, reasons).length,
        1,
        'a fully restated set is detected',
    );
    assert.equal(
        restatedReasonSets(`const LOCAL = ["${reasons[0]}", "${reasons[1]}"];`, reasons).length,
        1,
        'and so is a two-member fragment of it, under either quote style',
    );
    assert.deepEqual(
        restatedReasonSets(`const ONE = ['${reasons[0]}'];`, reasons),
        [],
        'while a single named member is not a restated set',
    );
});

test('T-04-U15: the committed set is the bars LISTING, and an uncommitted leg closes before a single bar is read', () => {
    const committed = committedSeriesAt(REPO_ROOT);
    const listing = barsDirectoryListing();
    const manifestSymbol = claims.BARS_MANIFEST_FILENAME.slice(0, -'.json'.length);

    /* ONE DERIVATION, THROUGH THE SHIPPED FUNCTION. The resolver's set and the support module's
       set are the same value because both call `enumerateCommittedSeries` over the same listing.
       A second local copy inside the resolver would surface here as a divergence rather than as a
       drift nobody notices until a denominator moves. */
    assert.deepEqual([...committed], [...committedSeries()], 'the resolver derives the set the shipped enumeration derives');
    assert.equal(Object.isFrozen(committed), true, 'and the shipped set is frozen against a local push');
    assert.equal(committed.includes(manifestSymbol), false, 'the refresh manifest is not a tradeable symbol');

    /* NO COUNT LITERAL. The expectation is recomputed from the listing at run time, so committing
       or removing a series moves both sides together instead of leaving a pinned number stale. */
    const readable = listing.filter((name) => name.endsWith('.json') && name !== claims.BARS_MANIFEST_FILENAME);
    assert.equal(committed.length, readable.length, 'the set size IS the readable-file count, never a typed constant');
    assert.equal(committed.length > 0, true, 'and the tree is non-empty, so every assertion below is over real symbols');

    /* AVAILABILITY, NEVER CURATION — the inversion this row exists to keep out. `index.json` is
       the refresh manifest and names strictly fewer symbols than the tree carries; reading IT as
       the committed set would close every symbol in the difference `no-committed-series` even
       though its bars are committed and readable, shrinking the denominator over a refresh
       detail. The divergent symbols are enumerated here rather than named, so the row keeps
       meaning as the manifest changes. */
    const curated = new Set(
        JSON.parse(readFileSync(path.join(REPO_ROOT, claims.BARS_DIR, claims.BARS_MANIFEST_FILENAME), 'utf8'))
            .tickers.map((ticker) => ticker.sym),
    );
    const readableButUncurated = committed.filter((symbol) => !curated.has(symbol));
    assert.equal(readableButUncurated.length > 0, true, 'the two sets genuinely diverge, so the next assertion is not vacuous');
    for (const symbol of readableButUncurated) {
        assert.equal(existsSync(path.join(REPO_ROOT, claims.BARS_DIR, `${symbol}.json`)), true, `${symbol}: its bars are committed`);
        assert.deepEqual(
            subjectSymbolsFor({ subject: { seriesRefs: [claims.seriesRefFor(symbol)] } }, committed),
            { ok: true, symbols: [symbol] },
            `${symbol}: readable-but-uncurated resolves, which the manifest-as-set rule would have refused`,
        );
    }

    /* AN UNCOMMITTED LEG CLOSES, and closes as the reason the mint uses for the same fact. */
    const absent = subjectSymbolsFor({ subject: { seriesRefs: [claims.seriesRefFor('NOSUCHSYM')] } }, committed);
    assert.equal(absent.ok, false, 'a symbol outside the committed set is not scoreable');
    assert.deepEqual(
        absent.closure,
        { closureEventType: 'not-evaluable', reasonCode: NO_COMMITTED_SERIES_REASON, field: 'subject.seriesRefs' },
        'closing not-evaluable with the shipped reason and the field that caused it',
    );
    assert.equal(claims.NOT_EVALUABLE_REASONS.includes(NO_COMMITTED_SERIES_REASON), true, 'the reason is a shipped member, not a local invention');

    /* AN UNPARSEABLE REF CLOSES TOO rather than surviving as `null` and being read as `null.json`. */
    assert.equal(subjectSymbolsFor({ subject: { seriesRefs: ['garbage'] } }, committed).ok, false, 'a ref whose shape carries no symbol closes');
    assert.equal(subjectSymbolsFor({ subject: { seriesRefs: [] } }, committed).ok, false, 'and so does a subject with no legs at all');

    /* WHAT THE GATE ADDS OVER `loadBars` FAILING, made executable. The direct read throws a raw
       ENOENT — an unstructured Node error outside the shipped reason vocabulary, which aborts the
       whole pass and takes every other due claim with it. The gated read returns a closure for
       this one claim instead, and reads NOTHING: a basket whose first leg is perfectly readable
       still loads no bars once a later leg is absent. */
    assert.throws(
        () => loadBars(REPO_ROOT, 'NOSUCHSYM'),
        (error) => error.code === 'ENOENT',
        'the ungated read throws ENOENT rather than closing',
    );
    const basket = { subject: { seriesRefs: [claims.seriesRefFor('SPY'), claims.seriesRefFor('NOSUCHSYM')] } };
    const gated = loadSubjectBars(REPO_ROOT, basket, committed);
    assert.equal(gated.ok, false, 'the gated read closes rather than throwing');
    assert.equal(gated.closure.reasonCode, NO_COMMITTED_SERIES_REASON, 'with the same reason the single-leg case raised');
    assert.equal(Object.prototype.hasOwnProperty.call(gated, 'bars'), false, 'and no partial basket is handed back');

    /* ANTI-VACUITY: the SAME basket minus the absent leg loads cleanly through the SAME function,
       so the closure above is caused by the uncommitted symbol and not by a reader that refuses
       every basket. The map is keyed by `seriesRef` exactly as the evaluators read it. */
    const honest = loadSubjectBars(REPO_ROOT, { subject: { seriesRefs: [claims.seriesRefFor('SPY')] } }, committed);
    assert.equal(honest.ok, true, 'a fully committed subject loads');
    assert.deepEqual([...honest.bars.keys()], [claims.seriesRefFor('SPY')], 'keyed by seriesRef, not by symbol');
    assert.equal(honest.bars.get(claims.seriesRefFor('SPY')).sym, 'SPY', 'and the bars are the validated series');
});

/* T-04-U16 — the FOURTH due-set conjunct, isolated. T-04-U12 holds every series observed past the
 * horizon so the other three conjuncts select alone; this row does the mirror image, holding the
 * entry, the pointer and the run date fixed and moving ONLY how far the series has been observed.
 *
 * The distinction is the whole reason the reason exists. `horizon-not-reached` says the RUN date
 * has not reached the frozen horizon and time alone cures it. `series-not-yet-observed` says the
 * run date HAS reached it and the SERIES has not — which no later run date cures. Told apart, an
 * operator refreshes the series; collapsed, they wait for a date that has already passed. */
test('T-04-U16: the data conjunct gates on the SERIES as-of alone, and no later run date cures it', () => {
    const foundation = validationRequire('../rlcontracts.js');
    const registry = toolsRegistry();
    const run = {
        runId: `run-${GATE_SESSION}-observed`,
        occurredAt: `${GATE_SESSION}T20:00:00.000Z`,
        canonicalMonth: GATE_SESSION.slice(0, 7),
    };

    /* THE TWO FRESHNESS VALUES ARE COMMITTED FIXTURE FACTS, read from the files rather than
       authored here: one series reaches the horizon under test, the other stops a session short. */
    const reached = fixtureBars('DVG').asof;
    const short = fixtureBars('DVGSTALE').asof;
    assert.equal(reached, GATE_SESSION, 'the fresh fixture is observed through the horizon');
    assert.equal(short, ENTRY_SESSION, 'and the stale fixture stops at the entry session');
    assert.equal(short < reached, true, 'so the two differ in freshness, and in that direction');

    const fixture = gateFixture(registry, ['DVG']);
    const proposed = foundation.reduceRecommendationEvents(null, [proposalRow(fixture.terms)], run);
    assert.equal(proposed.ok, true, JSON.stringify(proposed.error ?? null));
    const index = proposed.value.index;
    assert.equal(index.entries[fixture.key].state, LIVE_ENTRY_STATE, 'the entry is live');

    const bound = claimEntryBindings([{ claim: fixture.claim, row: fixture.row }], registry);
    assert.equal(bound.ok, true, JSON.stringify(bound.error ?? null));
    assert.equal(bound.bindings.get(fixture.key).resolutionDate, GATE_SESSION, 'and its horizon lands exactly ON the run date');

    /* ONE claim, ONE index, ONE binding map, ONE run date. The ONLY thing differing between the
       two calls is the `asof` the series map reports for the SAME `seriesRef`. */
    const gate = { asOfDate: GATE_SESSION, bindings: bound.bindings };
    const observed = dueEntryKeys(index, { ...gate, seriesAsOf: seriesAsOfMap(['DVG'], reached) });
    const unobserved = dueEntryKeys(index, { ...gate, seriesAsOf: seriesAsOfMap(['DVG'], short) });
    assert.equal(observed.ok, true, JSON.stringify(observed.error ?? null));
    assert.equal(unobserved.ok, true, JSON.stringify(unobserved.error ?? null));

    /* NON-VACUITY, and what would break without it. The fresh read is DUE, so the exclusion below
       is caused by the one value that moved rather than by a gate that excludes this fixture
       whatever it is told. A conjunct that ignored the series map entirely would put the key in
       BOTH due sets; one that excluded on any series map at all would put it in NEITHER; and a
       `>` where the code has `<` would exclude the fresh read, whose asof EQUALS the horizon. */
    assert.deepEqual(observed.dueEntryKeys, [fixture.key], 'observed through its horizon, the entry is due');
    assert.deepEqual(observed.notDue, [], 'and nothing is excluded');
    assert.deepEqual(unobserved.dueEntryKeys, [], 'one session short of it, the entry is not');
    assert.equal(unobserved.notDue.length, 1, 'and it is reported rather than silently dropped');

    /* THE REASON IS THE SERIES', NOT THE CALENDAR'S — asserted as a NON-equality too, so a change
       collapsing the two "wait" reasons into one string fails here. */
    const excluded = unobserved.notDue[0];
    assert.equal(excluded.originRecommendationKey, fixture.key, 'the excluded entry is the one under test');
    assert.equal(excluded.reason, SERIES_NOT_OBSERVED_REASON, 'excluded because the SERIES has not been observed that far');
    assert.notEqual(excluded.reason, HORIZON_NOT_REACHED_REASON, 'and NOT because the run date has not arrived');
    assert.equal(excluded.remedy, NOT_DUE_REMEDY[SERIES_NOT_OBSERVED_REASON], 'so the remedy names the fact that has to move');
    assert.notEqual(NOT_DUE_REMEDY[SERIES_NOT_OBSERVED_REASON], NOT_DUE_REMEDY[HORIZON_NOT_REACHED_REASON], 'which is a different fact from waiting for a date');

    /* AND THE FACTS THAT CAUSED IT ARE CARRIED, so a reader can see the run date was not the
       cause: the horizon HAS arrived on the calendar and only the series is behind it. */
    assert.equal(excluded.asOfDate, GATE_SESSION, 'measured on the run date');
    assert.equal(excluded.resolutionDate, GATE_SESSION, 'against a horizon that has already arrived');
    assert.equal(excluded.observedThrough, short, 'while the series stops short of it');
    assert.equal(excluded.state, LIVE_ENTRY_STATE, 'the entry is live, so state does not explain it');
    assert.equal(excluded.claimRef, fixture.claim.claimHash, 'and its row carries a pointer, so neither does that');

    /* NO LATER RUN DATE CURES IT. This is what makes the reason worth keeping apart: in T-04-U12
       advancing the clock moves the unarrived horizon INTO the due set; here it changes nothing. */
    const tomorrow = dueEntryKeys(index, { asOfDate: LATER_SESSION, bindings: bound.bindings, seriesAsOf: seriesAsOfMap(['DVG'], short) });
    assert.equal(tomorrow.ok, true, JSON.stringify(tomorrow.error ?? null));
    assert.equal(LATER_SESSION > GATE_SESSION, true, 'the clock really did move forward');
    assert.deepEqual(tomorrow.dueEntryKeys, [], 'a later run date does not make a stale series observable');
    assert.equal(tomorrow.notDue[0].reason, SERIES_NOT_OBSERVED_REASON, 'and the reason does not change with the clock');

    /* AND NOTHING IS WRITTEN. The point of the conjunct: a claim whose series stopped short must
       not close `unresolved`, which would record a measurement nobody could take. */
    const pass = closeDueClaims({
        index,
        verdicts: [fixture.verdict],
        toolsRegistry: registry,
        run,
        asOfDate: GATE_SESSION,
        bindings: bound.bindings,
        seriesAsOf: seriesAsOfMap(['DVG'], short),
    });
    assert.equal(pass.ok, true, JSON.stringify(pass.error ?? null));
    assert.deepEqual(pass.closures, [], 'no closure is scheduled');
    assert.equal(pass.events.length, 0, 'no lifecycle event is appended');
    assert.equal(pass.skipped.length, 1, 'the verdict is accounted for rather than dropped');
    assert.equal(pass.skipped[0].reason, SERIES_NOT_OBSERVED_REASON, 'carrying the conjunct that declined it');
    assert.deepEqual(pass.index.entries[fixture.key], index.entries[fixture.key], 'and the entry is untouched in every field');
});


