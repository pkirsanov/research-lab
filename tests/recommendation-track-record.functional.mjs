/*
 * tests/recommendation-track-record.functional.mjs — Feature 015, scope 01 functional rows
 * T-01-F1 .. T-01-F3.
 *
 * Where the unit rows assert the claim contract at the function level, these three assert what
 * the contract MEANS once objects reach the store: that a re-proposal of identical terms occupies
 * exactly one file rather than double-counting a call, that `citedToolId` is provenance a claim
 * carries rather than identity a claim is addressed by, and that one `recommendationKey` can own
 * several distinct claims without the publisher's key derivation being touched.
 *
 * Two conventions carry the rows. Every assertion is against an exact value — a shape check would
 * still pass while the wrong tool was cited or the wrong horizon persisted — and every property is
 * paired with the permissive behaviour it must exclude: a second file on re-mint, a `sha256:`
 * prefix leaking into a filename, a citation conflated with the producer constant, an unmatched
 * deep link refusing a mint D1 requires to succeed, a whole-bytes store comparison firing
 * RTR-PREDICATE-AMEND on a re-citation, and a horizon folded into the key or dropped from the hash.
 *
 * Nothing here reads a clock: every date comes from a fixture. Nothing here writes into the
 * committed `briefs/objects/claims/` tree: every store row runs inside a disposable root asserted
 * to live outside the repository, so a run leaves the working tree byte-identical.
 *
 * Scopes 02 - 10 EXTEND this file; they do not rewrite it.
 */

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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
    foundationSourceText,
    loadClaimFixture,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    toolsRegistry,
    withDisposableStore,
} from './recommendation-track-record.support.mjs';

const claims = loadClaimsModule();

const SHA256_PREFIX = 'sha256:';
const NO_MUTATION = () => {};

/**
 * Mint from a named fixture, optionally mutating the authored input first. The fixture is cloned
 * so a mutation never leaks into a later row, and the result is returned whole — a violation is
 * never swallowed.
 */
function mintFixture(fixtureName, mutate = NO_MUTATION) {
    const fixture = structuredClone(loadClaimFixture(fixtureName));
    mutate(fixture.input);
    return { fixture, result: claims.mintClaim(mintInputFrom(fixture)) };
}

function mintEvaluable(fixtureName, mutate = NO_MUTATION) {
    const { fixture, result } = mintFixture(fixtureName, mutate);
    assertEvaluable(result, fixtureName);
    return { fixture, claim: result.claim };
}

/**
 * The bare lowercase hex, derived HERE from the hash rather than through `claimObjectPath`, so a
 * store that agreed with itself about a wrong layout still fails the filename assertions.
 */
function bareHexOf(hash) {
    assert.equal(hash.startsWith(SHA256_PREFIX), true, `claimHash must carry the ${SHA256_PREFIX} prefix`);
    const hex = hash.slice(SHA256_PREFIX.length);
    assert.match(hex, /^[a-f0-9]{64}$/, 'the content address must be bare lowercase sha256 hex');
    return hex;
}

function storeDir(root) {
    return path.join(root, claims.CLAIM_STORE_DIR);
}

function storeListing(root) {
    return readdirSync(storeDir(root)).sort();
}

function objectPathFor(root, claim) {
    return path.join(storeDir(root), `${bareHexOf(claim.claimHash)}.json`);
}

function readObject(root, claim) {
    return JSON.parse(readBytes(objectPathFor(root, claim)));
}

function refusalCodeOf(outcome) {
    return outcome.error ? outcome.error.code : null;
}

/** The producing pipeline, read from its registry marker rather than trusted as a bare literal. */
function producerToolId(registry) {
    const owners = registry.tools.filter(
        (tool) => tool && tool.experience && tool.experience.kind === 'market-action-center',
    );
    assert.equal(owners.length, 1, 'exactly one tools.json entry may carry the market-action-center marker');
    return owners[0].id;
}

function assertOutsideRepository(root) {
    assert.equal(
        root.startsWith(REPO_ROOT),
        false,
        'the disposable store must live outside the repository so a run leaves it byte-identical',
    );
}

test('T-01-F1: the content-addressed write round-trips as a byte-identical no-op', () => {
    // Two distinct claims, so no property below can be an accident of one fixture's shape.
    const fixtureNames = ['evaluable-basket-trim', 'evaluable-instrument-add'];
    const addresses = new Set();

    withDisposableStore(({ root, ports }) => {
        assertOutsideRepository(root);

        for (const name of fixtureNames) {
            const { claim } = mintEvaluable(name);
            const hex = bareHexOf(claim.claimHash);

            const first = claims.writeClaimObject(claim, ports);
            assert.equal(first.ok, true, `${name}: the first write must succeed`);
            assert.equal(first.written, true, `${name}: the first write must create the object`);
            assert.equal(first.reused, false, `${name}: nothing exists to reuse yet`);

            const objectPath = objectPathFor(root, claim);
            const before = readBytes(objectPath);
            assert.notEqual(before, null, `${name}: the object must land at <bare-hex>.json`);
            assert.equal(before, claims.serializeClaim(claim), `${name}: the stored bytes are the serialized claim`);

            // The same call proposed twice: identical hashed terms AND identical provenance.
            const reminted = mintEvaluable(name).claim;
            assert.equal(reminted.claimHash, claim.claimHash, `${name}: the re-mint must land on the same address`);

            const second = claims.writeClaimObject(reminted, ports);
            assert.equal(second.ok, true, `${name}: an identical re-mint must not be refused`);
            assert.equal(second.written, false, `${name}: a second file would count one call twice`);
            assert.equal(second.reused, true, `${name}: the re-mint reuses the first object`);
            assert.equal(second.path, first.path, `${name}: the re-mint resolves to the first path`);
            assertBytesUnchanged(before, readBytes(objectPath), `${name}: re-mint`);

            // Exactly one file per distinct address across BOTH passes, so neither pass wrote a
            // duplicate under a second name and neither collapsed the earlier fixture's object.
            addresses.add(hex);
            const listing = storeListing(root);
            assert.equal(listing.length, addresses.size, `${name}: one object per distinct claim, no duplicates`);
            assert.equal(listing.includes(`${hex}.json`), true, `${name}: the object is named by its bare hex`);

            // A store using the whole prefixed string as the filename would still be "content
            // addressed" and still be wrong, so the prefix's absence from the NAME is asserted
            // directly — while the BODY is asserted to keep it.
            for (const entry of listing) {
                assert.equal(entry.includes(SHA256_PREFIX), false, `${entry}: no sha256: prefix in the filename`);
                assert.match(entry, /^[a-f0-9]{64}\.json$/, `${entry}: bare lowercase hex with a .json extension`);
            }

            const persisted = JSON.parse(before);
            assert.equal(persisted.claimHash, claim.claimHash, `${name}: the body records the full claimHash`);
            assert.equal(
                persisted.claimHash.startsWith(SHA256_PREFIX),
                true,
                `${name}: the body retains the sha256: prefix the filename strips`,
            );
            assert.equal(
                `${SHA256_PREFIX}${path.basename(objectPath, '.json')}`,
                persisted.claimHash,
                `${name}: the filename and the recorded hash are the same address in two notations`,
            );

            // The full round trip: serialize, parse, re-hash, and land back on the same address.
            assert.equal(
                claims.claimHash(persisted),
                claim.claimHash,
                `${name}: the round-tripped object must re-hash to the address it is stored at`,
            );
        }

        assert.equal(addresses.size, fixtureNames.length, 'the two fixtures must occupy distinct addresses');
    });
});

test('T-01-F2: citedToolId is a citation — neither identity nor the producer', () => {
    const registry = toolsRegistry();
    const producer = producerToolId(registry);
    assert.equal(producer, 'market-brief', 'the producing pipeline is the market-brief constant (D4)');

    assert.equal(
        claims.UNHASHED_FIELDS.includes('citedToolId'),
        true,
        'citedToolId is provenance and must sit outside the content address',
    );
    assert.equal(claims.HASHED_TERMS.includes('citedToolId'), false, 'citedToolId is never a hashed term');
    // The retired refusal has no trigger left: carrying it forward would refuse a mint D1 requires
    // to succeed, so its absence from the closed set is asserted structurally rather than implied.
    assert.equal(
        claims.MINT_REFUSALS.includes('unresolvable-owning-tool'),
        false,
        'unresolvable-owning-tool is retired — an unmatched deepLink yields null, not a refusal',
    );

    // A deepLink naming a real tools.json `file` resolves to THAT tool's id. An implementation that
    // conflated the citation with the producer would return `market-brief` for every one of these.
    for (const name of ['evaluable-basket-trim', 'evaluable-basket-trim-reproposed', 'evaluable-instrument-add']) {
        const { fixture, claim } = mintEvaluable(name);
        const linkedFile = fixture.input.action.deepLink.split('#')[0];
        const registered = registry.tools.filter((tool) => tool.file === linkedFile);

        assert.equal(registered.length, 1, `${name}: the deepLink must name exactly one registered tool`);
        assert.equal(claim.citedToolId, registered[0].id, `${name}: citedToolId is the CITED tool's id`);
        assert.equal(claim.citedToolId, fixture.expected.citedToolId, `${name}: the fixture declares that citation`);
        assert.notEqual(claim.citedToolId, producer, `${name}: a citation is not the producing pipeline`);
        assert.equal('originToolId' in claim, false, `${name}: originToolId is a resolver constant, not a claim field`);
    }

    // The adversarial half. Both unresolvable shapes must still MINT and still be counted: the
    // retired `unresolvable-owning-tool` behaviour would drop these calls and shrink the
    // denominator in the direction that flatters.
    for (const { name, hasDeepLink } of [
        { name: 'evaluable-absent-deeplink', hasDeepLink: false },
        { name: 'evaluable-unmatched-deeplink', hasDeepLink: true },
    ]) {
        const { fixture, result } = mintFixture(name);
        const deepLink = fixture.input.action.deepLink;

        assert.equal(typeof deepLink === 'string', hasDeepLink, `${name}: the fixture must carry the declared link shape`);
        const linkedFile = hasDeepLink ? deepLink.split('#')[0] : null;
        assert.equal(
            registry.tools.filter((tool) => tool.file === linkedFile).length,
            0,
            `${name}: the deepLink must genuinely name no registered tool`,
        );

        assert.equal(result.ok, true, `${name}: an unresolvable citation is not a contract violation`);
        assertEvaluable(result, name);
        assert.equal(result.claim.citedToolId, null, `${name}: citedToolId is null — never guessed, never defaulted`);
        assert.equal(fixture.expected.citedToolId, null, `${name}: the fixture declares the null citation`);
        assert.match(result.claim.claimHash, /^sha256:[a-f0-9]{64}$/, `${name}: the claim still has a content address`);
    }

    // Provenance, not identity: mutating ONLY the deep link — and therefore only the resolved
    // citation — must leave every hashed term and the content address byte-identical.
    const base = mintEvaluable('evaluable-basket-trim');
    const baseFile = base.fixture.input.action.deepLink.split('#')[0];
    const substitutes = registry.tools.filter(
        (tool) => typeof tool.file === 'string' && tool.file !== baseFile && tool.id !== producer,
    );
    assert.ok(substitutes.length > 0, 'a second registered non-producer tool must exist to re-cite with');
    const substitute = substitutes[0];

    const recited = mintEvaluable('evaluable-basket-trim', (input) => {
        input.action.deepLink = substitute.file;
    });
    assert.equal(recited.claim.citedToolId, substitute.id, 're-citing must actually change the citation');
    assert.notEqual(recited.claim.citedToolId, base.claim.citedToolId, 'the pair must genuinely differ in citation');
    assert.notEqual(recited.claim.citedToolId, producer, 'the substitute citation is not the producer either');
    assert.deepEqual(
        claims.hashedTermsOf(recited.claim),
        claims.hashedTermsOf(base.claim),
        're-citing must move no hashed term',
    );
    assert.equal(
        recited.claim.claimHash,
        base.claim.claimHash,
        'citedToolId is outside the content address: a re-citation is the SAME claim',
    );

    // The store consequence, which is how an unhashed field coexists with the append-only refusal
    // instead of contradicting it. A store comparing whole bytes rather than the hashed terms
    // would fire RTR-PREDICATE-AMEND here and force a second object for one call.
    withDisposableStore(({ root, ports }) => {
        assertOutsideRepository(root);

        const first = claims.writeClaimObject(base.claim, ports);
        assert.equal(first.ok, true, 'the first write must succeed');
        assert.equal(first.written, true);

        const objectPath = objectPathFor(root, base.claim);
        const before = readBytes(objectPath);
        assert.equal(readObject(root, base.claim).citedToolId, base.claim.citedToolId, 'the object carries the first citation');

        const reuse = claims.writeClaimObject(recited.claim, ports);
        assert.equal(reuse.ok, true, 'an unhashed-only re-citation must not be refused');
        assert.equal(
            refusalCodeOf(reuse),
            null,
            `RTR-PREDICATE-AMEND must not fire on a re-citation — the code is ${claims.PREDICATE_AMEND_CODE}`,
        );
        assert.equal(reuse.written, false, 'a re-citation writes nothing');
        assert.equal(reuse.reused, true, 'a re-citation reuses the first object');
        assert.equal(reuse.path, first.path, 'the re-citation resolves to the first object');

        assertBytesUnchanged(before, readBytes(objectPath), 'T-01-F2 re-citation');
        assert.equal(
            readObject(root, base.claim).citedToolId,
            base.claim.citedToolId,
            'the on-disk bytes keep the FIRST citation',
        );
        assert.notEqual(
            readObject(root, base.claim).citedToolId,
            recited.claim.citedToolId,
            'the re-citation must not have overwritten the recorded citation',
        );
        assert.equal(storeListing(root).length, 1, 'a re-citation must not create a second object');
    });
});

test('T-01-F3: recommendationKey is one-to-many with claimHash across horizon kinds', () => {
    const BASE_FIXTURE = 'evaluable-basket-trim';
    const ALTERNATE_KIND = 'next-session';

    const base = mintEvaluable(BASE_FIXTURE);
    const baseKind = base.claim.horizon.kind;
    assert.equal(claims.HORIZON_KINDS.includes(ALTERNATE_KIND), true, 'the alternate horizon kind must be a legal member');
    assert.notEqual(ALTERNATE_KIND, baseKind, 'the pair must genuinely differ in horizon kind');

    // The ONLY authored change is `horizon.kind`. Subject prose and family are byte-identical, so
    // the publisher's key derivation is untouched and any divergence below is attributable to the
    // horizon and to nothing else.
    const variant = mintEvaluable(BASE_FIXTURE, (input) => {
        input.action.claim.horizonKind = ALTERNATE_KIND;
    });
    assert.equal(base.claim.horizon.kind, baseKind);
    assert.equal(variant.claim.horizon.kind, ALTERNATE_KIND);

    // One key. An implementation that folded the horizon into the key would produce two, and a
    // same-call pair would stop being recognisable as one recommendation.
    assert.equal(
        variant.claim.recommendationKey,
        base.claim.recommendationKey,
        'two horizons on one call share one recommendationKey',
    );
    assert.equal(
        base.claim.recommendationKey,
        claims.deriveRecommendationKey(base.fixture.input.action.subject, base.fixture.input.action.action),
        'the key is the publisher key over the VERBATIM prose and family',
    );
    assert.equal(base.claim.subject.prose, base.fixture.input.action.subject, 'the prose is retained verbatim');
    assert.equal(variant.claim.subject.prose, base.claim.subject.prose, 'both claims name the identical subject');
    assert.equal(variant.claim.actionFamily, base.claim.actionFamily, 'both claims share the identical family');

    // Two addresses. An implementation that left `horizon` out of the hash would produce one, and
    // the second call would silently overwrite or collapse into the first.
    assert.notEqual(variant.claim.claimHash, base.claim.claimHash, 'a different horizon is a different claim');
    assert.notEqual(
        claims.claimObjectPath(variant.claim.claimHash),
        claims.claimObjectPath(base.claim.claimHash),
        'the two claims occupy different content addresses',
    );

    // The divergence is attributable to `horizon.kind` alone: without this the row would pass even
    // if some unrelated term had drifted and produced the second address for the wrong reason.
    const baseTerms = claims.hashedTermsOf(base.claim);
    const variantTerms = claims.hashedTermsOf(variant.claim);
    for (const term of claims.HASHED_TERMS.filter((name) => name !== 'horizon')) {
        assert.deepEqual(variantTerms[term], baseTerms[term], `${term} must be identical across the pair`);
    }
    for (const field of Object.keys(baseTerms.horizon).filter((name) => name !== 'kind')) {
        assert.deepEqual(variantTerms.horizon[field], baseTerms.horizon[field], `horizon.${field} must be identical`);
    }

    withDisposableStore(({ root, ports }) => {
        assertOutsideRepository(root);

        const pair = [base.claim, variant.claim];
        const writes = pair.map((claim) => claims.writeClaimObject(claim, ports));
        for (let i = 0; i < writes.length; i += 1) {
            assert.equal(writes[i].ok, true, `write ${i}: both claims must persist`);
            assert.equal(writes[i].written, true, `write ${i}: neither may collapse into the other`);
            assert.equal(
                refusalCodeOf(writes[i]),
                null,
                `write ${i}: distinct addresses must not trip ${claims.PREDICATE_AMEND_CODE}`,
            );
        }
        assert.notEqual(writes[0].path, writes[1].path, 'the two writes must target different paths');

        assert.deepEqual(
            storeListing(root),
            pair.map((claim) => `${bareHexOf(claim.claimHash)}.json`).sort(),
            'both claims coexist — the store holds exactly the two content addresses',
        );

        // Individually resolvable: each address returns ITS OWN horizon under the shared key. This
        // is the property that makes a same-key pair scoreable without touching key derivation.
        const resolved = pair.map((claim) => readObject(root, claim));
        assert.equal(resolved[0].horizon.kind, baseKind, 'the first address resolves to the first horizon');
        assert.equal(resolved[1].horizon.kind, ALTERNATE_KIND, 'the second address resolves to the second horizon');
        assert.notEqual(resolved[0].claimHash, resolved[1].claimHash, 'the two objects record distinct addresses');
        assert.equal(
            resolved[0].recommendationKey,
            resolved[1].recommendationKey,
            'both persisted objects carry the one shared recommendationKey',
        );
        assert.equal(resolved[0].recommendationKey, base.claim.recommendationKey, 'and it is the publisher key');
    });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Scope 03 — the cohort-level halves of the resolution record: T-03-F1, T-03-F2, T-03-F3.
 *
 * The unit rows prove these properties one function at a time. These three prove what they MEAN
 * once a whole cohort moves through routing and into the store: that a second resolving pass over
 * an unchanged outcome occupies one file rather than two, that no class can leave the accounting
 * without the shortfall being named, and that a cohort with nothing directional in it never
 * reaches a primitive that would refuse it.
 *
 * Every class below is produced by `classifyOutcome` against a REAL minted claim's frozen band
 * rather than hand-labelled in the fixture, so a classifier that regressed would change the
 * cohort these rows partition instead of leaving them agreeing with a stale literal.
 *
 * Nothing here reads a clock and nothing here writes into the committed
 * `briefs/objects/resolutions/` tree.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const validationRequire = createRequire(import.meta.url);
const LEDGER_DIR = path.join(REPO_ROOT, 'briefs', 'history', 'recommendations');

/** The 007-owned primitive, loaded lazily so importing this file opens nothing. */
function loadSummarizeOutcomes() {
    return validationRequire('../rlvalidation.js').rlvSummarizeOutcomes;
}

/** The closure vocabulary, read from rlcontracts.js's own source text — never a local copy. */
function closureVocabulary() {
    return claims.readClosureEventVocabulary(foundationSourceText());
}

function committedV2Row() {
    const row = readdirSync(LEDGER_DIR)
        .filter((f) => f.endsWith('.jsonl'))
        .sort()
        .flatMap((f) => readFileSync(path.join(LEDGER_DIR, f), 'utf8').split('\n').filter((l) => l.trim().length > 0))
        .map((line) => JSON.parse(line))
        .find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(row, 'the committed ledger must carry a v2 row for these rows to mean anything');
    return row;
}

/** The committed row made resolvable by the single optional pointer scope 02 added. */
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
        claimHash: mintEvaluable('evaluable-instrument-add').claim.claimHash,
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

function resolutionStoreListing(root) {
    return readdirSync(path.join(root, claims.RESOLUTION_STORE_DIR)).sort();
}

/** The hashed terms picked off a built record, so "no hashed term moved" is checkable directly. */
function hashedTermsOfResolution(resolution) {
    return Object.fromEntries(claims.RESOLUTION_HASHED_TERMS.map((term) => [term, resolution[term]]));
}

/*
 * One replacement per hashed term and one per unhashed field. The key sets are asserted against
 * the module's own two lists below, so a term moved between them — or a ninth term added to
 * either — fails this row rather than silently going uncovered.
 */
const HASHED_TERM_MUTATION = Object.freeze({
    contractVersion: 'brief-recommendation-resolution/v2',
    claimHash: `sha256:${'0'.repeat(64)}`,
    resolutionDate: '2026-07-16',
    closureEventType: 'invalidated',
    outcomeClass: 'win',
    outcomeValue: 0.0009765625,
    reasonCode: 'predicate-invalidated',
    provenance: { seriesRef: 'bars/QQQ/1d', entryDate: '2026-07-14', entryBasis: 'close' },
});

const UNHASHED_FIELD_MUTATION = Object.freeze({
    eventId: 'evt-a-later-pass-over-the-same-outcome',
    lifecycleBinding: { runId: 'run-2027-01-02T09-30-00', resolvedAt: '2027-01-02T09:30:00.000Z' },
});

test('T-03-F1: resolutionHash is content-only and the content-addressed write is a byte-identical no-op', () => {
    const claimHash = mintEvaluable('evaluable-instrument-add').claim.claimHash;
    const row = resolvableRow(claimHash);
    const base = builtResolution({ claimHash });

    // A SECOND RESOLVING PASS over the SAME outcome: new run id, new wall clock, new event id.
    // Every difference lands in a field the module declares unhashed, so an address that moved
    // here would give one resolved claim two entries in an accounting that counts each call once.
    const rerun = builtResolution({ claimHash, ...UNHASHED_FIELD_MUTATION });
    assert.notEqual(rerun.eventId, base.eventId, 'the pair must genuinely differ in event id');
    assert.notDeepEqual(rerun.lifecycleBinding, base.lifecycleBinding, 'and in run id and wall clock');
    assert.deepEqual(hashedTermsOfResolution(rerun), hashedTermsOfResolution(base), 'while no hashed term moved');
    assert.equal(rerun.resolutionHash, base.resolutionHash, 'run identity is outside the content address');
    assert.notEqual(claims.serializeResolution(rerun), claims.serializeResolution(base), 'the BYTES do differ');

    // Every hashed term moves the address. Driven by the module's list, so a term that quietly
    // left the hash fails here instead of leaving the address blind to a change in the record.
    assert.deepEqual(
        Object.keys(HASHED_TERM_MUTATION).sort(),
        [...claims.RESOLUTION_HASHED_TERMS].sort(),
        'a hashed term with no mutation authored here would go uncovered',
    );
    for (const term of claims.RESOLUTION_HASHED_TERMS) {
        const mutated = { ...base, [term]: HASHED_TERM_MUTATION[term] };
        assert.notDeepEqual(mutated[term], base[term], `${term}: the mutation must genuinely differ`);
        assert.notEqual(
            claims.resolutionHash(mutated),
            base.resolutionHash,
            `${term} is hashed: changing it MUST move the content address`,
        );
    }

    // And no unhashed field does — the other half of the same partition.
    assert.deepEqual(
        Object.keys(UNHASHED_FIELD_MUTATION).sort(),
        [...claims.RESOLUTION_UNHASHED_FIELDS].sort(),
        'an unhashed field with no mutation authored here would go uncovered',
    );
    for (const field of claims.RESOLUTION_UNHASHED_FIELDS) {
        const mutated = { ...base, [field]: UNHASHED_FIELD_MUTATION[field] };
        assert.notDeepEqual(mutated[field], base[field], `${field}: the mutation must genuinely differ`);
        assert.equal(claims.resolutionHash(mutated), base.resolutionHash, `${field} is provenance, not identity`);
    }

    withDisposableStore(({ root, ports }) => {
        assertOutsideRepository(root);

        const first = claims.writeResolutionObject(base, row, ports);
        assert.equal(first.ok, true, `the first write must succeed: ${JSON.stringify(first.error)}`);
        assert.equal(first.written, true, 'the first write must create the object');
        assert.equal(first.reused, false, 'nothing exists to reuse yet');

        const hex = bareHexOf(base.resolutionHash);
        assert.equal(first.path, `${claims.RESOLUTION_STORE_DIR}/${hex}.json`, 'the bare lowercase hex filename');
        assert.equal(first.path.includes(SHA256_PREFIX), false, 'no sha256: prefix in the stored path');

        const objectPath = path.join(root, first.path);
        const before = readBytes(objectPath);
        assert.notEqual(before, null, 'the object must land at <bare-hex>.json');
        assert.equal(before, claims.serializeResolution(base), 'the stored bytes are the serialized resolution');
        assert.equal(JSON.parse(before).resolutionHash, base.resolutionHash, 'the body keeps the prefixed address');

        // THE REPEAT: re-derived from the identical input, so identical bytes at one address.
        const repeat = claims.writeResolutionObject(builtResolution({ claimHash }), row, ports);
        assert.equal(repeat.ok, true, 'an identical re-resolution must not be refused');
        assert.equal(repeat.written, false, 'a second file would count one resolution twice');
        assert.equal(repeat.reused, true, 'the repeat reuses the first object');
        assert.equal(repeat.path, first.path, 'the repeat resolves to the first path');
        assertBytesUnchanged(before, readBytes(objectPath), 'T-03-F1 repeat');
        assert.deepEqual(resolutionStoreListing(root), [`${hex}.json`], 'exactly one object across both passes');

        // The rerun shares the address but not the bytes, so the append-only store refuses rather
        // than overwriting the run identity already on record.
        const conflict = claims.writeResolutionObject(rerun, row, ports);
        assert.equal(conflict.ok, false, 'differing bytes at one address must not overwrite');
        assert.equal(conflict.error.code, claims.RESOLUTION_CONFLICT_CODE, 'the conflict names its own code');
        assertRefusal(conflict.error, 'resolution-conflict-refused', 'resolutionHash', 'T-03-F1 conflict');
        assertBytesUnchanged(before, readBytes(objectPath), 'T-03-F1 conflict');
        assert.deepEqual(resolutionStoreListing(root), [`${hex}.json`], 'and writes nothing');
    });
});

/**
 * A cohort whose directional and flat classes are ASSIGNED BY THE MODULE from values derived from
 * the claim's own frozen band, so the row partitions what the classifier actually produced. The
 * three withheld classes carry no magnitude and are appended as counts.
 */
function classifiedCohort() {
    const { claim } = mintEvaluable('evaluable-instrument-add');
    const band = claims.flatBandFor(claim);
    assert.equal(band.ok, true, `the fixture claim must carry a usable band: ${JSON.stringify(band.error)}`);

    const values = [band.flatBand * 6, band.flatBand * 3, -band.flatBand * 9, 0, band.flatBand * 0.4, -band.flatBand * 0.2];
    const magnitudeBearing = values.map((value) => {
        const classified = claims.classifyOutcome(value, claim);
        assert.equal(classified.ok, true, `classifyOutcome refused ${value}: ${JSON.stringify(classified.error)}`);
        return { outcomeClass: classified.outcomeClass, outcomeValue: classified.outcomeValue };
    });
    assert.deepEqual(
        magnitudeBearing.map((r) => r.outcomeClass),
        ['win', 'win', 'loss', 'resolved-flat', 'resolved-flat', 'resolved-flat'],
        'the module — not this row — assigned the directional and flat classes',
    );

    return Object.freeze([
        ...magnitudeBearing,
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'not-evaluable', outcomeValue: null },
        { outcomeClass: 'unresolvable-legacy' },
    ]);
}

test('T-03-F2: the class partition holds over a classified cohort and fails when a whole class is dropped', () => {
    const cohort = classifiedCohort();
    const lifecycle = { totalProposed: cohort.length + 3, withdrawn: 2, open: 1 };

    const routed = claims.routeOutcomes([...cohort]);
    assert.equal(routed.ok, true, `the cohort must route: ${JSON.stringify(routed.error)}`);

    const partition = claims.classPartition(routed, lifecycle);
    assert.equal(partition.ok, true, `the complete accounting must be accepted: ${JSON.stringify(partition.error)}`);
    assert.equal(partition.sum, lifecycle.totalProposed, 'and sum to the proposed total');
    assert.deepEqual(
        partition.buckets,
        { resolvedDirectional: 3, resolvedFlat: 3, unresolved: 2, notEvaluable: 1, unresolvableLegacy: 1, withdrawn: 2, open: 1 },
        'every bucket carries its own count, and resolvedDirectional IS the published denominator',
    );
    assert.equal(partition.buckets.resolvedDirectional, routed.directional.length, 'the denominator is the fed length');

    /* THE ADVERSARIAL HALF: DROP A WHOLE CLASS, OBSERVE, REVERT. Every occurrence of one class is
       removed while the proposed total is held FIXED, the exact shortfall is required in the
       refusal, and the intact cohort is then re-asserted green — so the failure is attributable to
       the drop and to nothing else. A partition that only ever sees a correct cohort is
       decoration, and a dropped class is precisely how a denominator gets quietly flattered. */
    for (const outcomeClass of claims.OUTCOME_CLASSES) {
        const kept = cohort.filter((record) => record.outcomeClass !== outcomeClass);
        const droppedCount = cohort.length - kept.length;
        assert.ok(droppedCount > 0, `${outcomeClass}: the cohort must genuinely contain the class to drop`);

        const refused = claims.classPartition(claims.routeOutcomes(kept), lifecycle);
        assert.equal(refused.ok, false, `${outcomeClass}: a dropped class must be detected`);
        assert.equal(refused.error.code, claims.CONTRACT_VIOLATION_CODE, `${outcomeClass}: code`);
        assertRefusal(refused.error, 'partition-does-not-sum-to-proposed', 'totalProposed', `dropped every ${outcomeClass}`);
        assert.equal(refused.error.unaccounted, droppedCount, `${outcomeClass}: the refusal names the exact shortfall`);
        assert.equal(refused.error.sum, lifecycle.totalProposed - droppedCount, `${outcomeClass}: and the sum it reached`);

        // REVERT.
        const restored = claims.classPartition(claims.routeOutcomes([...cohort]), lifecycle);
        assert.equal(restored.ok, true, `${outcomeClass}: restoring the class must make the identity hold again`);
        assert.deepEqual(restored.buckets, partition.buckets, `${outcomeClass}: and restore every bucket exactly`);
    }

    // The same for the two lifecycle states no outcome class describes: excluded is not hidden.
    for (const bucket of claims.NON_CLASS_PARTITION_BUCKETS) {
        const dropped = { ...lifecycle, [bucket]: 0 };
        const refused = claims.classPartition(routed, dropped);
        assert.equal(refused.ok, false, `${bucket}: a dropped lifecycle class must be detected`);
        assertRefusal(refused.error, 'partition-does-not-sum-to-proposed', 'totalProposed', `dropped every ${bucket}`);
        assert.equal(refused.error.unaccounted, lifecycle[bucket], `${bucket}: the refusal names the exact shortfall`);
        assert.equal(claims.classPartition(routed, lifecycle).ok, true, `${bucket}: restored`);
    }
});

test('T-03-F3: resolvedDirectional === 0 is reachable and the primitive is never called', () => {
    const cohort = classifiedCohort();

    /* A COUNTING SEAM around the 007-owned primitive. Its own export object is deep-frozen and
       cannot be patched, so the count is taken at the ONLY route this row gives the scoring pass
       to reach it. The counter is asserted directly — never inferred from an output that a
       withheld cohort would produce either way. */
    let primitiveCalls = 0;
    const summarize = (values) => {
        primitiveCalls += 1;
        return loadSummarizeOutcomes()(values);
    };

    /* The scoring pass exactly as the contract prescribes it: route, then ask the MODULE — with no
       summary in hand at all — whether there is a denominator to publish, and reach the primitive
       only when there is. The two refusals are distinguished rather than lumped together, which is
       what pins the ORDER of the module's own checks: an implementation that validated `summary`
       first would answer `outcome-summary-invalid` for the empty cohort too, and the caller would
       have had to call the primitive to find out it should not have. */
    function score(records) {
        const routed = claims.routeOutcomes(records);
        assert.equal(routed.ok, true, `the cohort must route: ${JSON.stringify(routed.error)}`);
        const branch = claims.directionalDenominator(routed, null);
        assert.equal(branch.ok, false, 'a null summary can never be accepted');
        if (branch.error.reason === 'no-directional-denominator-to-publish') return { routed, refusal: branch.error };
        assertRefusal(branch.error, 'outcome-summary-invalid', 'summary', 'a denominator exists, so a summary is required');
        return { routed, summary: summarize(routed.directional) };
    }

    // A cohort in which every claim resolved flat, unresolved, not-evaluable or unresolvable-legacy.
    const withheld = cohort.filter((record) => !claims.DIRECTIONAL_OUTCOME_CLASSES.includes(record.outcomeClass));
    assert.equal(withheld.length > 0, true, 'the withheld cohort must genuinely contain claims');
    assert.equal(
        withheld.length,
        cohort.length - claims.routeOutcomes([...cohort]).resolvedDirectional,
        'and must be exactly the non-directional remainder of the classified cohort',
    );

    const empty = score([...withheld]);
    assert.equal(empty.routed.resolvedDirectional, 0, 'resolvedDirectional === 0 is REACHABLE, not theoretical');
    assert.deepEqual(empty.routed.directional, [], 'the fed array is genuinely empty');
    assert.equal(primitiveCalls, 0, 'THE ASSERTION: the primitive was not called even once');
    assert.equal(empty.summary, undefined, 'and no summary was produced to be published');

    /* The verdict was reached WITHOUT a summary at all — `null` was passed and the refusal still
       names `resolvedDirectional`. An implementation that validated the summary first would refuse
       with `outcome-summary-invalid` here, which is a caller that has already had to call. */
    assertRefusal(empty.refusal, 'no-directional-denominator-to-publish', 'resolvedDirectional', 'empty cohort');
    assert.equal(empty.refusal.code, claims.CONTRACT_VIOLATION_CODE, 'the refusal carries the contract code');

    // WHAT THE PRIMITIVE WOULD HAVE DONE. One deliberate call, counted, proving the branch is not
    // decoration: the empty array is refused outright rather than summarised as a zero rate.
    const wouldHave = summarize(empty.routed.directional);
    assert.equal(primitiveCalls, 1, 'the deliberate counterfactual call is the first call in this row');
    assert.equal(wouldHave.ok, false, 'the primitive refuses an empty array');
    assert.deepEqual(
        wouldHave.errors.map((e) => e.code),
        ['RLV-OUTCOME-VALUES'],
        'with the code the caller would have had to handle',
    );

    /* THE POSITIVE CONTROL. The identical seam DOES observe a call once the cohort has something
       directional in it — so the zero above is a branch not taken, never a spy that never worked. */
    const scored = score([...cohort]);
    assert.equal(primitiveCalls, 2, 'the directional cohort reaches the primitive exactly once');
    assert.equal(scored.refusal, undefined, 'and is not refused a denominator');
    assert.equal(scored.summary.ok, true, 'the primitive accepts the zero-free finite array');
    assert.equal(scored.routed.resolvedDirectional > 0, true, 'the control cohort is genuinely directional');

    const published = claims.directionalDenominator(scored.routed, scored.summary);
    assert.equal(published.ok, true, `the pairing must be accepted: ${JSON.stringify(published.error)}`);
    assert.equal(published.resolvedDirectional, scored.routed.directional.length, 'the denominator IS the fed length');
    assert.equal(published.label, claims.DIRECTIONAL_RATE_LABEL, 'and the rate is labelled directional');
    assert.equal(primitiveCalls, 2, 'publishing the denominator calls the primitive no second time');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Scope 02 — the additive ledger-row extension, at the level where the contract MEANS something.
 *
 * Three properties the unit rows cannot reach: where `claimRef` lands once a row is serialised,
 * what ABSENCE of the key is allowed to mean, and what a refused mint is allowed to emit.
 *
 * Every row here reads REAL committed rows rather than a synthetic shape, because the point of
 * each is compatibility with what is already on disk. Every one carries the permissive behaviour
 * it must exclude — a `null` wearing the legacy marker's clothes, a classifier keying on the
 * version stamp, a projector that grew an eighth field, a hook that attaches a pointer anyway.
 *
 * `LEDGER_DIR` is the module-level constant declared with the scope 03 helpers above.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Every committed row, in file-name then file order. Nothing here is a literal. */
function committedLedgerRows() {
    return readdirSync(LEDGER_DIR)
        .filter((f) => f.endsWith('.jsonl'))
        .sort()
        .flatMap((f) => readFileSync(path.join(LEDGER_DIR, f), 'utf8').split('\n').filter((l) => l.trim().length > 0))
        .map((line) => JSON.parse(line));
}

/** One real row per live `v2` key-count, READ from the ledger rather than declared as a literal. */
function liveV2Shapes(rows) {
    const byShape = new Map();
    for (const row of rows) {
        if (row.contractVersion !== claims.ROW_CONTRACT_V2) continue;
        const count = Object.keys(row).length;
        if (!byShape.has(count)) byShape.set(count, row);
    }
    return [...byShape.entries()].sort((a, b) => a[0] - b[0]);
}

/** A deterministic, module-produced pointer. Never a hand-typed digest. */
function pointerFor(row) {
    return claims.stableSha({ contractVersion: claims.CONTRACT_VERSION, eventId: row.eventId });
}

/**
 * The serialised key order, READ BACK OUT of the canonical serialiser's own output rather than
 * recomputed here with `.sort()`. A test that sorted the keys itself would agree with a serialiser
 * that did not sort at all — which is the one failure this row exists to catch.
 */
function canonicalKeyOrder(row) {
    return Object.keys(JSON.parse(claims.stableStringify(row)));
}

/** The seven-field projection, taking its names from the module's frozen `v1` list. */
function projectSevenFields(row) {
    const projection = {};
    for (const field of claims.ROW_V1_FIELDS) projection[field] = row[field];
    return projection;
}

/** A row refusal: the closed code, the exact reason, and the field that caused it. */
function assertRowRefusal(result, expected, label) {
    assert.equal(result.ok, false, `${label}: expected a row refusal, got an accepted row`);
    assert.equal(result.error.code, expected.code, `${label}: code`);
    assertRefusal(result.error, expected.reason, expected.field, label);
}

test('T-02-F1: claimRef canonicalises immediately after canonicalMonth on every live shape, and the seven-field projection is unchanged', () => {
    const rows = committedLedgerRows();
    const shapes = liveV2Shapes(rows);
    assert.equal(shapes.length > 0, true, 'the committed ledger must carry v2 rows for this row to mean anything');

    for (const [shape, committed] of shapes) {
        const label = `v2 shape ${shape}`;
        assert.equal(
            Object.prototype.hasOwnProperty.call(committed, claims.CLAIM_REF_FIELD),
            false,
            `${label}: the committed row must be pre-contract, so the position under test is genuinely new`,
        );

        const withRef = { ...committed, [claims.CLAIM_REF_FIELD]: pointerFor(committed) };
        assert.equal(claims.validateLedgerRow(withRef).ok, true, `${label}: the row under test must validate`);

        const order = canonicalKeyOrder(withRef);
        const at = order.indexOf(claims.CLAIM_REF_FIELD);
        assert.equal(at > 0, true, `${label}: claimRef must appear in the canonical order`);
        assert.equal(order[at - 1], 'canonicalMonth', `${label}: claimRef's canonical predecessor`);
        assert.equal(order[at + 1], 'confidence', `${label}: claimRef's canonical successor is confidence`);
        assert.notEqual(order[at + 1], 'contractVersion', `${label}: the v1-shaped successor must NOT hold on a v2 row`);

        /* Determinism, proven against a genuinely different insertion order rather than against the
           same object serialised twice — which would hold under a serialiser that emitted whatever
           order it was handed. */
        const reversed = {};
        for (const key of Object.keys(withRef).reverse()) reversed[key] = withRef[key];
        assert.notDeepEqual(Object.keys(reversed), Object.keys(withRef), `${label}: the two builds must differ in insertion order`);
        assert.equal(
            claims.stableStringify(withRef),
            claims.stableStringify(reversed),
            `${label}: two independent serialisations must be byte-identical`,
        );

        // The seven-field projection is UNCHANGED by the addition: same names, same bytes.
        const projected = projectSevenFields(withRef);
        assert.deepEqual(Object.keys(projected), [...claims.ROW_V1_FIELDS], `${label}: exactly the seven v1 key names`);
        assert.equal(Object.keys(projected).length, 7, `${label}: seven, not eight`);
        assert.equal(
            Object.prototype.hasOwnProperty.call(projected, claims.CLAIM_REF_FIELD),
            false,
            `${label}: a projector that grew an eighth field must fail here`,
        );
        assert.equal(
            claims.stableStringify(projected),
            claims.stableStringify(projectSevenFields(committed)),
            `${label}: the projection is byte-identical with and without claimRef`,
        );
    }

    /* THE CONTROL that makes the successor assertion non-vacuous. On a SEVEN-FIELD row the
       successor genuinely IS `contractVersion` — so `confidence` above is a measured property of
       the live v2 shape and not a name that happens to sort into place on every row. */
    const v1Row = rows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V1);
    assert.ok(v1Row, 'the committed ledger must carry a v1 row');
    const v1Order = canonicalKeyOrder({ ...v1Row, [claims.CLAIM_REF_FIELD]: pointerFor(v1Row) });
    const v1At = v1Order.indexOf(claims.CLAIM_REF_FIELD);
    assert.equal(v1Order[v1At - 1], 'canonicalMonth', 'the predecessor is the same on both shapes');
    assert.equal(v1Order[v1At + 1], 'contractVersion', 'on a seven-field shape the successor IS contractVersion');
    assert.equal(claims.ROW_V1_FIELDS.includes('confidence'), false, 'v1 carries no confidence — which is why the two successors differ');
});

/* The imputation a permissive classifier most wants through: complete, well-formed, plausible,
   and authored by nobody. Declared once and reused, so both rows below probe the same input. */
const PLAUSIBLE_RESOLUTION = Object.freeze({
    contractVersion: 'brief-recommendation-resolution/v1',
    predicate: { kind: 'threshold', basis: 'close', comparator: 'lte', value: 100 },
    horizon: { kind: 'next-session', resolutionDate: '2026-07-15' },
    outcomeClass: 'satisfied',
    outcomeValue: -2.4,
    resolvedAt: '2026-07-15T20:00:00.000Z',
});

test('T-02-F2: a pre-contract row of either version has no claimRef key at all, and the classifier keys on absence rather than null', () => {
    const rows = committedLedgerRows();
    const legacyV1 = rows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V1);
    const legacyV2 = rows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(legacyV1 && legacyV2, 'the committed ledger must carry a pre-contract row of each version');

    const legacyExpected = {
        code: claims.LEGACY_BACKFILL_CODE,
        reason: 'claimless-row-unscoreable',
        field: claims.CLAIM_REF_FIELD,
    };

    for (const [label, row] of [['pre-contract v1', legacyV1], ['pre-contract body-v2', legacyV2]]) {
        /* ABSENCE, asserted four ways. A `claimRef: null` row passes the first two and FAILS the
           last two, which is exactly the distinction this row exists to hold. */
        assert.equal(Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD), false, `${label}: no own key`);
        assert.equal(claims.CLAIM_REF_FIELD in row, false, `${label}: nothing inherited either`);
        assert.equal(canonicalKeyOrder(row).includes(claims.CLAIM_REF_FIELD), false, `${label}: absent from the canonical key order`);
        assert.equal(claims.stableStringify(row).includes('"claimRef"'), false, `${label}: the name appears nowhere in the bytes`);

        // The classifier reaches the SAME refusal on both versions — so the marker is not the stamp.
        assertRowRefusal(claims.authorizeResolutionWrite(row, PLAUSIBLE_RESOLUTION), legacyExpected, label);
    }

    /** Legacy under the shipped classifier, expressed once so the disagreements below are exact. */
    const shippedSaysLegacy = (row) => {
        const outcome = claims.authorizeResolutionWrite(row, PLAUSIBLE_RESOLUTION);
        return outcome.ok === false && outcome.error.code === claims.LEGACY_BACKFILL_CODE;
    };

    /* A NULL IS NOT LEGACY. It is a malformed value on the contract, refused on a different code —
       a back-fill wearing the marker's clothes must not be able to pass as never-minted. */
    const nulled = { ...legacyV2, [claims.CLAIM_REF_FIELD]: null };
    assertRowRefusal(
        claims.authorizeResolutionWrite(nulled, PLAUSIBLE_RESOLUTION),
        { code: claims.ROW_CONTRACT_VIOLATION_CODE, reason: 'claim-ref-not-opaque-sha256', field: claims.CLAIM_REF_FIELD },
        'null claimRef',
    );
    assert.equal(shippedSaysLegacy(nulled), false, 'a null row is NOT classified legacy');
    const nullTolerantSaysLegacy = (row) => row[claims.CLAIM_REF_FIELD] === undefined || row[claims.CLAIM_REF_FIELD] === null;
    assert.equal(nullTolerantSaysLegacy(nulled), true, 'a null-tolerant classifier WOULD call it legacy');
    assert.equal(
        nullTolerantSaysLegacy(nulled) === shippedSaysLegacy(nulled),
        false,
        'the two classifiers must genuinely disagree — otherwise this row guards nothing',
    );

    /* AND THE STAMP IS NOT THE MARKER. A version-stamp classifier ("v1 is legacy, v2 is current")
       disagrees with the shipped one on the claimless v2 row, and the claim-bearing v2 row is
       accepted — so the refusals above are absence-driven, not a blanket refusal. */
    const versionStampSaysLegacy = (row) => row.contractVersion === claims.ROW_CONTRACT_V1;
    assert.equal(shippedSaysLegacy(legacyV2), true, 'a claimless v2 row IS legacy');
    assert.equal(versionStampSaysLegacy(legacyV2), false, 'a version-stamp classifier would call it current');

    const bearing = { ...legacyV2, [claims.CLAIM_REF_FIELD]: pointerFor(legacyV2) };
    assert.equal(shippedSaysLegacy(bearing), false, 'the same row plus a pointer is NOT legacy');
    const authorized = claims.authorizeResolutionWrite(bearing, PLAUSIBLE_RESOLUTION);
    assert.equal(authorized.ok, true, 'and the identical resolution is accepted against it');
    assert.equal(authorized.claimRef, bearing[claims.CLAIM_REF_FIELD], 'the authorisation returns the pointer to resolve against');
});

/* One publisher run, held FIXED so any drift in an identifier is attributable to the hook alone. */
const REFUSAL_RUN_FINGERPRINT = claims.stableSha({ fixture: 'T-02-F3 run fingerprint' });
const REFUSAL_RUN_ID = 'dist-2026-07-14-morning-refusal';
const REFUSAL_OCCURRED_AT = '2026-07-14T12:40:00.000Z';

function refusalEventIdFor(recommendationKey, index) {
    return claims.stableSha({
        contractVersion: 'brief-distributed-eventid/v1',
        runFingerprint: REFUSAL_RUN_FINGERPRINT,
        recommendationKey,
        index,
    });
}

/** A fully authored action. Every claim term is declared; nothing is defaulted into existence. */
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

/** The rows this run appends to the recommendation partition, from the REAL writer. */
function appendedRecommendationRows(events) {
    const built = buildPublishSet(buildRun({ recommendationEvents: events }));
    assert.equal(built.ok, true, 'the publish set must build for the row assertions to mean anything');
    const partition = Object.keys(built.staging.historyPartitions).find((p) => p.includes('/recommendations/'));
    assert.ok(partition, 'the publish set must carry a recommendation partition');
    return built.staging.historyPartitions[partition].appendedBytes
        .toString('utf8')
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
}

test('T-02-F3: a refused mint degrades to an event without claimRef, carrying its reason', () => {
    const series = committedSeries();
    assert.equal(series.length > 0, true, 'the committed bars set must be non-empty');
    const symbol = series[0];
    const absentSymbol = 'ZZZZNOSERIES';
    assert.equal(series.includes(absentSymbol), false, 'the refusing symbol must genuinely have no committed series');

    /* Three actions, one evaluable and two refused for DIFFERENT reasons: the publisher's
       positional fallback, and a fully authored action whose subject resolves to no committed
       series. Two distinct refusals rule out a hook that hard-codes one reason. */
    const payload = {
        nextSession: { actions: [authoredAction(symbol), { action: 'note', subject: 'action-1' }, authoredAction(absentSymbol)] },
        recommendations: [],
    };
    const universe = loadInstrumentUniverse(REPO_ROOT);
    const build = () => recommendationRowsFromPayload(payload, {
        root: REPO_ROOT,
        occurredAt: REFUSAL_OCCURRED_AT,
        universe,
        eventIdFor: refusalEventIdFor,
    }).map((event) => ({ ...event, bodySource: 'next-session-action' }));
    const mintOptions = { root: REPO_ROOT, proposalRunId: REFUSAL_RUN_ID, proposedAt: REFUSAL_OCCURRED_AT };

    const before = build();
    const after = attachClaimRefs(build(), payload, mintOptions);
    const records = mintClaimRecords(build(), payload, mintOptions);
    assert.equal(before.length, payload.nextSession.actions.length, 'one event per authored action');
    assert.equal(after.length, before.length, 'the hook adds and removes no event');

    const expected = [
        { refusal: null },
        { refusal: { reason: 'non-semantic-subject', field: 'actionFamily' } },
        { refusal: { reason: 'no-committed-series', field: 'subject.seriesRefs' } },
    ];

    for (let i = 0; i < expected.length; i += 1) {
        const label = `event ${i}`;
        if (expected[i].refusal === null) {
            // The evaluable half. Without it "no event gained a pointer" would be trivially true.
            assert.equal(Object.prototype.hasOwnProperty.call(after[i], claims.CLAIM_REF_FIELD), true, `${label}: must gain a pointer`);
            assert.equal(after[i][claims.CLAIM_REF_FIELD], records[i].claim.claimHash, `${label}: the pointer is the minted claimHash`);
            continue;
        }

        assert.equal(Object.prototype.hasOwnProperty.call(after[i], claims.CLAIM_REF_FIELD), false, `${label}: a refused mint attaches no claimRef`);
        assert.equal(records[i].claimRef, null, `${label}: the record carries no pointer either`);
        assertRefusal(after[i][CLAIM_NOT_EVALUABLE_FIELD], expected[i].refusal.reason, expected[i].refusal.field, `${label} refusal`);

        /* NOTHING FABRICATED. The refused event's key set is the pre-hook event's plus exactly the
           one refusal field — no invented subject, predicate or horizon rides along, and no
           claimHash from the refused mint leaks onto the event under another name. */
        assert.deepEqual(
            Object.keys(after[i]).sort(),
            [...Object.keys(before[i]), CLAIM_NOT_EVALUABLE_FIELD].sort(),
            `${label}: exactly one key was added`,
        );
        if (records[i].claim !== null) {
            assert.deepEqual(records[i].claim.notEvaluable, expected[i].refusal, `${label}: the claim records the same refusal`);
            assert.equal(
                claims.stableStringify(after[i]).includes(records[i].claim.claimHash),
                false,
                `${label}: the refused claim's address must appear nowhere on the event`,
            );
        }
    }

    // Selective, not global: exactly one of the three events gained a pointer.
    const bearingEvents = after.filter((e) => Object.prototype.hasOwnProperty.call(e, claims.CLAIM_REF_FIELD));
    assert.equal(bearingEvents.length, 1, 'exactly one event gains a claimRef');
    assert.equal(claims.CLAIM_REF_PATTERN.test(bearingEvents[0][claims.CLAIM_REF_FIELD]), true, 'and it is an opaque sha256');

    /* AND THE REASON NEVER REACHES A ROW. The real writer emits the refusal as an ABSENT key, not
       a null and not a carried-through refusal field — v2 gains exactly one optional member. */
    const emitted = appendedRecommendationRows(after);
    assert.equal(emitted.length, after.length, 'one ledger row per event');
    const claimless = emitted.filter((row) => !Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD));
    assert.equal(claimless.length, expected.filter((e) => e.refusal !== null).length, 'one claimless row per refused mint');
    for (const row of emitted) {
        assert.equal(claims.validateLedgerRow(row).ok, true, 'every emitted row must validate');
        assert.equal(Object.prototype.hasOwnProperty.call(row, CLAIM_NOT_EVALUABLE_FIELD), false, 'the refusal travels on the event, never into the row');
    }
    for (const row of claimless) {
        assert.equal(row[claims.CLAIM_REF_FIELD], undefined, 'a claimless row has NO claimRef key — absence, never null');
        assertRowRefusal(
            claims.authorizeResolutionWrite(row, PLAUSIBLE_RESOLUTION),
            { code: claims.LEGACY_BACKFILL_CODE, reason: 'claimless-row-unscoreable', field: claims.CLAIM_REF_FIELD },
            'freshly refused row',
        );
    }
});

