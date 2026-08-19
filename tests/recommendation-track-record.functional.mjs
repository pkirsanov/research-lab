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
import { readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    assertEvaluable,
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
