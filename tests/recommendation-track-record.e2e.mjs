/*
 * tests/recommendation-track-record.e2e.mjs — Feature 015, scope 01 regression rows T-01-R1 and
 * T-01-R2.
 *
 * These two rows are PERMANENT. They re-run in every later scope's pass, so a scope that narrows
 * the hashed-term list, softens the append-only store, drops a mint refusal, or reinstates the
 * retired `unresolvable-owning-tool` behaviour fails HERE rather than silently.
 *
 * T-01-R1 is a full sweep over the whole fixture claim set against the real
 * `briefs/objects/claims/` layout — the same relative path the store writes in production, rooted
 * in a disposable directory asserted to live outside the repository. Where the unit and functional
 * rows each prove one property on one or two fixtures, this row proves every property on every
 * fixture at once: nothing may be true of the sample and false of the set.
 *
 * T-01-R2 is the broader-suite row, and its honesty matters more than its breadth. The committed
 * Node E2E suite is EXECUTED here and asserted green — that suite is where the brief pipeline that
 * reads `briefs/objects/` actually lives, so it is the half that can detect the disturbance this
 * row exists to rule out. The committed Playwright suite is asserted at COLLECTION and at
 * HEAD-parity, and its 498-test browser EXECUTION is deliberately NOT asserted here: measured in
 * this session, the identical tree produced a page-readiness failure under concurrent load, which
 * is anti-drift D18 exactly. Widening a gate that already has 27-40x headroom would convert a
 * visible environmental problem into an invisible one, and asserting a run that shifts between
 * identical trees would be a coin toss reported as a guard. What is asserted is stated in each
 * block; what is not is stated too, in the same place, so the row can never read stronger than it is.
 *
 * Conventions carried from the unit and functional rows. Every assertion is against an exact value,
 * every negative names its reason AND the field that caused it, and no count is written as a
 * literal — the fixture total, the closed reason set, the committed suite membership and the
 * collected test inventory are all DERIVED at test time (F-015-D5-02). There are no early returns,
 * no conditional skips and no swallowed errors: a missing precondition fails the row instead of
 * quietly shrinking it.
 *
 * Nothing here reads a clock: every date is asserted equal to the fixture that authored it.
 * Nothing here writes into the committed `briefs/objects/claims/` tree.
 *
 * Scopes 02 - 10 EXTEND this file; they do not rewrite it.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    REPO_ROOT,
    assertBytesUnchanged,
    assertEvaluable,
    assertRefusal,
    loadClaimFixtures,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    withDisposableStore,
} from './recommendation-track-record.support.mjs';

const claims = loadClaimsModule();

const SELF_PATH = fileURLToPath(import.meta.url);
const SELF_RELATIVE = path.relative(REPO_ROOT, SELF_PATH);

/* A committed suite transcript runs to thousands of lines; the 1 MiB default would truncate one
 * into a parse error and report the truncation as a suite failure. */
const CAPTURE_LIMIT = 64 * 1024 * 1024;

/** The three `expected.outcome` discriminators every fixture must declare exactly one of. */
const DECLARED_OUTCOMES = Object.freeze(['evaluable', 'not-evaluable', 'violation']);

/** The bare-hex object filename the real store layout requires. */
const OBJECT_FILENAME = /^[a-f0-9]{64}\.json$/;
const PREFIXED_HASH = /^sha256:[a-f0-9]{64}$/;

/**
 * Every authored date `mintInputFrom` carries, paired with where the minted claim records it.
 * Asserting each against the fixture that declared it is what proves the mint path never reached
 * for a clock — a loader that did would make these rows intermittently green, which is strictly
 * worse than failing.
 */
const AUTHORED_DATES = Object.freeze([
    { binding: 'proposedAt', read: (claim) => claim.proposedAt },
    { binding: 'resolutionDate', read: (claim) => claim.horizon.resolutionDate },
    { binding: 'entryDate', read: (claim) => claim.magnitude.entryDate },
]);

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

function storeDir(root) {
    return path.join(root, claims.CLAIM_STORE_DIR);
}

function storeListing(root) {
    return fs.readdirSync(storeDir(root)).sort();
}

function bareHexOf(hash) {
    assert.match(hash, PREFIXED_HASH, 'claimHash must be a sha256:-prefixed lowercase hex address');
    return hash.slice('sha256:'.length);
}

/* =============================================================================================
 * T-01-R1
 * =========================================================================================== */

test('T-01-R1: the whole fixture claim set holds the frozen contract against the real store layout', () => {
    const fixtures = loadClaimFixtures();
    assert.ok(fixtures.length > 0, 'the fixture set must be non-empty — an empty sweep asserts nothing at all');

    // Every fixture falls in exactly one declared bucket, and every bucket is populated. A bucket
    // that emptied would silently narrow the sweep while it still reported green.
    const byOutcome = new Map(DECLARED_OUTCOMES.map((outcome) => [outcome, []]));
    for (const fixture of fixtures) {
        assert.equal(
            byOutcome.has(fixture.expected.outcome),
            true,
            `${fixture.name}: declares outcome "${fixture.expected.outcome}", which is outside the closed set`,
        );
        byOutcome.get(fixture.expected.outcome).push(fixture);
    }
    for (const outcome of DECLARED_OUTCOMES) {
        assert.ok(byOutcome.get(outcome).length > 0, `no fixture declares "${outcome}" — the sweep would be blind to it`);
    }
    assert.equal(
        DECLARED_OUTCOMES.reduce((running, outcome) => running + byOutcome.get(outcome).length, 0),
        fixtures.length,
        'every fixture must fall into exactly one declared outcome bucket',
    );

    const liveStore = path.join(REPO_ROOT, claims.CLAIM_STORE_DIR);
    const liveStoreExistedBefore = fs.existsSync(liveStore);
    const liveStoreListingBefore = liveStoreExistedBefore ? fs.readdirSync(liveStore).sort() : null;

    withDisposableStore(({ root, ports }) => {
        assert.equal(
            root.startsWith(REPO_ROOT),
            false,
            'the disposable store must live outside the repository so a run leaves the working tree byte-identical',
        );

        /* ---- 1. A contract violation never reaches the store ---------------------------- */

        for (const fixture of byOutcome.get('violation')) {
            const result = claims.mintClaim(mintInputFrom(fixture));
            assert.equal(result.ok, false, `${fixture.name}: a declared violation must not mint a claim`);
            assert.equal(result.error.code, claims.CONTRACT_VIOLATION_CODE, `${fixture.name}: violation code`);
            assertRefusal(result.error, fixture.expected.reason, fixture.expected.field, fixture.name);
            assert.equal('claim' in result, false, `${fixture.name}: a violation yields no claim to store`);
        }

        // Malformed input is refused before anything is created. A store directory conjured by a
        // rejected mint would mean the refusal happened after a side effect, not instead of one.
        assert.equal(
            fs.existsSync(storeDir(root)),
            false,
            'no contract violation may have created the store directory',
        );

        /* ---- 2. Mint and write every mintable fixture ------------------------------------ */

        // Evaluable and not-evaluable alike: a not-evaluable claim is still minted and still
        // written with its reason. Dropping it would shrink the denominator in the flattering
        // direction, which is the measurement error this whole contract exists to prevent.
        const mintable = [...byOutcome.get('evaluable'), ...byOutcome.get('not-evaluable')];
        const stored = new Map();
        const addresses = new Set();

        for (const fixture of mintable) {
            const result = claims.mintClaim(mintInputFrom(fixture));
            assert.equal(result.ok, true, `${fixture.name}: a mintable fixture must not be a contract violation`);

            const claim = result.claim;
            assert.match(claim.claimHash, PREFIXED_HASH, `${fixture.name}: every minted claim carries a content address`);
            assert.equal(claim.contractVersion, claims.CONTRACT_VERSION, `${fixture.name}: contract version`);

            if (fixture.expected.outcome === 'evaluable') {
                assertEvaluable(result, fixture.name);
            } else {
                assertRefusal(claim.notEvaluable, fixture.expected.reason, fixture.expected.field, fixture.name);
                assert.equal(
                    claims.MINT_REFUSALS.includes(claim.notEvaluable.reason),
                    true,
                    `${fixture.name}: "${claim.notEvaluable.reason}" is outside the closed mint-reason set`,
                );
            }

            // Every authored date is the fixture's own. Nothing defaults to "now".
            const binding = fixture.input.binding ?? {};
            for (const { binding: field, read } of AUTHORED_DATES) {
                const declared = binding[field] ?? null;
                assert.equal(read(claim), declared, `${fixture.name}: ${field} must be the authored value, never a clock`);
                if (declared !== null) {
                    assert.match(declared, ISO_DATE_PREFIX, `${fixture.name}: ${field} must be an authored ISO date`);
                }
            }

            const hex = bareHexOf(claim.claimHash);
            const alreadyStored = addresses.has(hex);

            const write = claims.writeClaimObject(claim, ports);
            assert.equal(write.ok, true, `${fixture.name}: every minted claim is written and counted`);
            assert.equal(
                write.path,
                `${claims.CLAIM_STORE_DIR}/${hex}.json`,
                `${fixture.name}: the object lands in the real briefs/objects/claims layout under its bare hex`,
            );
            // Two fixtures differing only in the four unhashed provenance fields share one address.
            // Which of `written`/`reused` is true is therefore DERIVED from what is already there,
            // not asserted as a constant that would be wrong for one of the pair.
            assert.equal(write.written, !alreadyStored, `${fixture.name}: written`);
            assert.equal(write.reused, alreadyStored, `${fixture.name}: reused`);

            const objectPath = path.join(root, write.path);
            const bytes = readBytes(objectPath);
            assert.notEqual(bytes, null, `${fixture.name}: the object must exist on disk after the write`);
            if (!alreadyStored) {
                assert.equal(bytes, claims.serializeClaim(claim), `${fixture.name}: the stored bytes are the serialized claim`);
            }
            assert.equal(
                claims.claimHash(JSON.parse(bytes)),
                stored.has(hex) ? stored.get(hex).claim.claimHash : claim.claimHash,
                `${fixture.name}: the round-tripped object re-hashes to the address it is stored at`,
            );

            addresses.add(hex);
            if (!stored.has(hex)) stored.set(hex, { fixture, claim, write, objectPath });
        }

        assert.ok(stored.size > 0, 'the sweep must have stored something');
        const listingAfterMint = storeListing(root);
        assert.equal(listingAfterMint.length, addresses.size, 'one object per distinct content address, no duplicates');
        for (const entry of listingAfterMint) {
            assert.match(entry, OBJECT_FILENAME, `${entry}: the real layout names objects by bare lowercase hex`);
        }
        assert.deepEqual(
            listingAfterMint,
            [...addresses].map((hex) => `${hex}.json`).sort(),
            'the store holds exactly the addresses the sweep minted',
        );

        /* ---- 3. A second full pass is a byte-identical no-op ----------------------------- */

        const snapshot = new Map([...stored].map(([hex, entry]) => [hex, readBytes(entry.objectPath)]));

        for (const fixture of mintable) {
            const again = claims.mintClaim(mintInputFrom(fixture));
            assert.equal(again.ok, true, `${fixture.name}: the re-mint must not become a violation`);

            const hex = bareHexOf(again.claim.claimHash);
            assert.equal(addresses.has(hex), true, `${fixture.name}: the re-mint must land on an address the first pass produced`);
            assert.deepEqual(
                claims.hashedTermsOf(again.claim),
                claims.hashedTermsOf(stored.get(hex).claim),
                `${fixture.name}: the re-mint must carry byte-identical hashed terms`,
            );

            const rewrite = claims.writeClaimObject(again.claim, ports);
            assert.equal(rewrite.ok, true, `${fixture.name}: an identical re-mint must not be refused`);
            assert.equal(rewrite.written, false, `${fixture.name}: a second file would count one call twice`);
            assert.equal(rewrite.reused, true, `${fixture.name}: the re-mint reuses the first object`);
            assert.equal(rewrite.path, stored.get(hex).write.path, `${fixture.name}: the re-mint resolves to the first path`);
        }

        for (const [hex, before] of snapshot) {
            assertBytesUnchanged(before, readBytes(stored.get(hex).objectPath), `${hex}: whole-set re-mint`);
        }
        assert.deepEqual(storeListing(root), listingAfterMint, 'a full re-mint pass creates no object and removes none');

        /* ---- 4. A byte-changing write at an existing address aborts and never overwrites -- */

        // Every stored object is probed, not one sample. The amendment is re-submitted against the
        // ORIGINAL claim reference — same path, different hashed terms — which is BS-008 exactly.
        let predicateAmendments = 0;
        for (const [hex, entry] of stored) {
            const original = entry.claim;
            const amended = structuredClone(original);
            let amendedTerm = null;

            if (original.predicate === null) {
                // The claims with no authored predicate still carry a weighting, and the amended
                // value is DERIVED as the other legal member rather than assumed to be one — the
                // fixture set authors both, and an equal-weighted and a primary-only basket are
                // different measurements, so this is a real re-statement rather than a malformed
                // value the store could reject for the wrong reason.
                const reweighted = claims.SUBJECT_WEIGHTINGS.find((member) => member !== original.subject.weighting);
                assert.equal(typeof reweighted, 'string', `${hex}: a second legal weighting must exist to amend with`);
                assert.notEqual(reweighted, original.subject.weighting, `${hex}: the amendment must change the weighting`);
                amended.subject.weighting = reweighted;
                amendedTerm = 'subject.weighting';
            } else {
                assert.ok(Number.isFinite(original.predicate.value), `${hex}: the predicate amendment needs a finite base`);
                amended.predicate.value = original.predicate.value + 1;
                amendedTerm = 'predicate.value';
                predicateAmendments += 1;
            }

            assert.notDeepEqual(
                claims.hashedTermsOf(amended),
                claims.hashedTermsOf(original),
                `${hex}: the ${amendedTerm} amendment must genuinely move a hashed term`,
            );
            assert.notEqual(
                claims.claimHash(amended),
                original.claimHash,
                `${hex}: the amendment must genuinely change the content address it would compute`,
            );

            amended.claimHash = original.claimHash;
            assert.equal(
                claims.claimObjectPath(amended.claimHash),
                entry.write.path,
                `${hex}: the amendment must target the original content address`,
            );

            const refused = claims.writeClaimObject(amended, ports);
            assert.equal(refused.ok, false, `${hex}: a byte-changing write at an existing address must be refused`);
            assert.equal(refused.error.code, claims.PREDICATE_AMEND_CODE, `${hex}: refusal code`);
            assert.equal(refused.error.code, 'RTR-PREDICATE-AMEND', `${hex}: the refusal code is frozen`);
            assertRefusal(refused.error, 'predicate-amend-refused', 'claimHash', `${hex} amendment`);
            assert.equal(refused.error.path, entry.write.path, `${hex}: the refusal names the path it protected`);

            assertBytesUnchanged(snapshot.get(hex), readBytes(entry.objectPath), `${hex}: on-disk bytes after the refusal`);
            const persisted = JSON.parse(readBytes(entry.objectPath));
            assert.deepEqual(
                claims.hashedTermsOf(persisted),
                claims.hashedTermsOf(original),
                `${hex}: the original frozen terms remain the scoring basis`,
            );
        }

        assert.ok(
            predicateAmendments > 0,
            'at least one probe must amend a real predicate — BS-008 is about an amended predicate, not only about a moved term',
        );
        assert.deepEqual(storeListing(root), listingAfterMint, 'no refused amendment may have created an object');

        /* ---- 5. Each mint reason fires for its own trigger and only its own -------------- */

        const observed = new Map();
        const declared = new Map();
        for (const fixture of byOutcome.get('not-evaluable')) {
            const reason = fixture.expected.reason;
            if (!declared.has(reason)) declared.set(reason, []);
            declared.get(reason).push(fixture.name);
        }
        for (const fixture of mintable) {
            const claim = claims.mintClaim(mintInputFrom(fixture)).claim;
            const reason = claim.notEvaluable === null ? null : claim.notEvaluable.reason;
            assert.equal(
                reason === null,
                fixture.expected.outcome === 'evaluable',
                `${fixture.name}: an evaluable fixture must carry no reason and a not-evaluable one must carry exactly its own`,
            );
            if (reason !== null) {
                if (!observed.has(reason)) observed.set(reason, []);
                observed.get(reason).push(fixture.name);
            }
        }

        // Derived on both sides: the closed set from the module, the triggers from the fixtures. A
        // later scope that drops a refusal, adds one without coverage, or lets a reason fire for a
        // trigger that is not its own fails here rather than silently.
        assert.deepEqual(
            [...observed.keys()].sort(),
            [...claims.MINT_REFUSALS].sort(),
            'every closed mint reason must fire, and no reason outside the closed set may fire',
        );
        for (const reason of claims.MINT_REFUSALS) {
            assert.deepEqual(
                observed.get(reason).sort(),
                declared.get(reason).sort(),
                `"${reason}" must fire for exactly the fixtures that declare it — no more, no fewer`,
            );
        }

        /* ---- 6. An unmatched deepLink still mints, with a null citation ------------------ */

        // The retired `unresolvable-owning-tool` refusal would drop exactly these calls. Its
        // absence is asserted structurally, and the mints it would have refused are asserted to
        // have reached the store with their citation recorded as null rather than guessed.
        assert.equal(
            claims.MINT_REFUSALS.includes('unresolvable-owning-tool'),
            false,
            'unresolvable-owning-tool is retired — an unmatched deepLink yields null, never a refusal',
        );

        const nullCitations = byOutcome.get('evaluable').filter((fixture) => fixture.expected.citedToolId === null);
        assert.ok(nullCitations.length > 0, 'the fixture set must declare at least one unresolvable citation');
        for (const fixture of nullCitations) {
            const claim = claims.mintClaim(mintInputFrom(fixture)).claim;
            assert.equal(claim.citedToolId, null, `${fixture.name}: citedToolId is null — never guessed, never defaulted`);
            assert.equal(claim.notEvaluable, null, `${fixture.name}: an unresolvable citation is not a refusal`);

            const entry = stored.get(bareHexOf(claim.claimHash));
            assert.notEqual(entry, undefined, `${fixture.name}: the claim must have reached the store`);
            assert.equal(
                JSON.parse(readBytes(entry.objectPath)).citedToolId,
                null,
                `${fixture.name}: the persisted object records the null citation`,
            );
        }
    });

    /* ---- 7. The committed claim store is untouched --------------------------------------- */

    assert.equal(fs.existsSync(liveStore), liveStoreExistedBefore, 'the committed claim store must be untouched by this row');
    assert.deepEqual(
        liveStoreExistedBefore ? fs.readdirSync(liveStore).sort() : null,
        liveStoreListingBefore,
        'the committed claim store listing must be unchanged',
    );
});

/* =============================================================================================
 * T-01-R2
 * =========================================================================================== */

function git(args) {
    const run = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: CAPTURE_LIMIT });
    assert.equal(run.error, undefined, `git ${args.join(' ')} failed to spawn: ${run.error}`);
    assert.equal(run.status, 0, `git ${args.join(' ')} exited ${run.status}: ${run.stderr}`);
    return run.stdout;
}

/** NUL-delimited so a path is never split on whitespace and a rename can never be mistaken for two. */
function nulSeparated(stdout) {
    return stdout.split('\u0000').filter((entry) => entry.length > 0);
}

function trackedFiles(pathspec) {
    return nulSeparated(git(['ls-files', '-z', '--', pathspec])).sort();
}

function porcelainEntries(paths) {
    return nulSeparated(git(['status', '--porcelain', '-z', '--', ...paths]));
}

/**
 * Run a child in the repository root with the parent's test context stripped.
 *
 * `node --test` exports its child protocol through the environment, so a child that inherited it
 * would report through the parent instead of the reporter named on its own command line, and the
 * summary this parses would never be emitted.
 */
function runChild(args) {
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_TEST_WORKER_ID;

    const run = spawnSync(process.execPath, args, {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        env,
        maxBuffer: CAPTURE_LIMIT,
    });
    assert.equal(run.error, undefined, `node ${args.join(' ')} failed to spawn: ${run.error}`);
    return run;
}

/* Every counter the TAP summary carries. Parsing all six is what lets "green" mean green: a suite
 * that skipped half its tests still exits 0 and still reports `fail 0`. */
const TAP_COUNTERS = Object.freeze(['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']);
const TAP_REPORTER = '--test-reporter=tap';

function parseTapCounters(stdout) {
    const counters = {};
    for (const label of TAP_COUNTERS) {
        const matched = new RegExp(`^# ${label} (\\d+)$`, 'm').exec(stdout);
        assert.notEqual(matched, null, `the TAP summary is missing its "${label}" line. stdout was:\n${stdout}`);
        counters[label] = Number(matched[1]);
    }
    return counters;
}

/* The committed Playwright entry point, invoked exactly as `.github/workflows/pages.yml` invokes
 * it — same config, same project — so this row measures the suite CI measures and not a variant. */
const PLAYWRIGHT_CLI = path.join(REPO_ROOT, 'node_modules', 'playwright', 'cli.js');
const PLAYWRIGHT_CONFIG = 'playwright.config.mjs';
const PLAYWRIGHT_PROJECT = 'system-chrome';

/* `  [system-chrome] › tests/<file>.spec.mjs:<line>:<col> › <title>` — U+203A is the separator the
 * list reporter emits. */
const LISTED_TEST = /^\s*\[([^\]]+)\]\s+\u203a\s+([^\s:]+):(\d+):(\d+)\s+\u203a\s+(.+)$/;
const LIST_TOTAL = /^Total:\s+(\d+)\s+tests?\s+in\s+(\d+)\s+files?$/m;

test('T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green', () => {
    /* ---- 1. Derive both committed suites, excluding this file -------------------------- */

    // This file matches `tests/*.e2e.mjs` and will match `git ls-files` the moment it is committed.
    // Excluding it by its OWN resolved path rather than by its untracked status is what stops this
    // row from invoking itself once scope 01 lands — a recursion that would not fail, it would hang.
    const trackedNodeE2E = trackedFiles('tests/*.e2e.mjs');
    const committedNodeE2E = trackedNodeE2E.filter((file) => file !== SELF_RELATIVE);
    assert.ok(
        trackedNodeE2E.length - committedNodeE2E.length <= 1,
        'the self-exclusion may remove this file and nothing else',
    );
    assert.ok(committedNodeE2E.length > 0, 'the committed Node E2E set must be non-empty — an empty run asserts nothing');
    assert.equal(committedNodeE2E.includes(SELF_RELATIVE), false, 'this row must never invoke itself');

    const committedSpecs = trackedFiles('tests/*.spec.mjs');
    assert.ok(committedSpecs.length > 0, 'the committed Playwright spec set must be non-empty');

    /* ---- 2. No pre-existing test was removed, renamed or edited ------------------------ */

    // Removal, rename, staging and in-place editing all surface here. Byte-parity with HEAD is also
    // what forecloses a newly-added `.skip` in a Playwright spec, which `--list` cannot see.
    const disturbed = porcelainEntries([...committedNodeE2E, ...committedSpecs]);
    assert.deepEqual(
        disturbed,
        [],
        `no committed test file may be modified, renamed or removed by this scope; git reported:\n${disturbed.join('\n')}`,
    );
    for (const file of [...committedNodeE2E, ...committedSpecs]) {
        assert.equal(fs.existsSync(path.join(REPO_ROOT, file)), true, `${file}: a committed test file is missing from the tree`);
    }

    /* ---- 3. The committed brief tree was not disturbed --------------------------------- */

    // This is the concern the row names: a new content-addressed tree under `briefs/objects/` must
    // not disturb the committed pipeline that reads the same tree. Additions under the claim store
    // are the Change Boundary's own family and are allowed; anything that MODIFIES or REMOVES a
    // tracked file under `briefs/` is exactly the disturbance being ruled out.
    const briefEntries = porcelainEntries(['briefs']).map((entry) => ({
        status: entry.slice(0, 2),
        target: entry.slice(3),
    }));
    const briefDisturbances = briefEntries.filter(
        (entry) => entry.status !== '??' || !entry.target.startsWith(`${claims.CLAIM_STORE_DIR}/`),
    );
    assert.deepEqual(
        briefDisturbances,
        [],
        'no tracked file under briefs/ may be modified or removed, and no untracked file may appear outside the claim store',
    );

    /* ---- 4. EXECUTED: the committed Node E2E suite is green ---------------------------- */

    // This is the half that can detect the disturbance. The committed Node E2E set is where the
    // distributed-brief, market-session-evidence and released-report pipelines are exercised
    // against the same `briefs/objects/` tree this scope's store writes into, so if the claim
    // module, the store or the fixtures broke that pipeline, this run fails and this row fails.
    const nodeRun = runChild(['--test', TAP_REPORTER, ...committedNodeE2E]);
    const counters = parseTapCounters(nodeRun.stdout);

    assert.equal(nodeRun.status, 0, `the committed Node E2E suite must exit 0, got ${nodeRun.status}`);
    assert.ok(counters.tests > 0, 'the committed Node E2E suite must have run something');
    assert.equal(counters.fail, 0, 'no committed Node E2E test may fail');
    assert.equal(counters.cancelled, 0, 'no committed Node E2E test may be cancelled');
    assert.equal(counters.skipped, 0, 'no committed Node E2E test may be skipped');
    assert.equal(counters.todo, 0, 'no committed Node E2E test may be marked todo');
    assert.equal(counters.pass, counters.tests, 'every committed Node E2E test must pass');

    /* ---- 5. COLLECTED, NOT EXECUTED: the committed Playwright suite -------------------- */

    // What this asserts: the whole committed spec suite still COLLECTS under the exact config and
    // project CI uses, every committed spec file is present in the collected inventory, and the
    // inventory reconciles with the total the reporter prints. A spec this scope broke at module
    // load, removed from collection, or renamed out of the glob fails here.
    //
    // What this does NOT assert, deliberately: the 498-test BROWSER RUN. Measured in this session,
    // the identical tree produced a page-readiness failure under concurrent load. That is anti-drift
    // D18 — the readiness condition resolves with 27-40x headroom, so an expiry is worker starvation
    // rather than slowness, and the documented remedy is NOT to widen the gate. Asserting a run that
    // shifts between identical trees would report a coin toss as a guard, and widening a timeout to
    // make it green would hide the real cause. The browser execution is therefore an honest,
    // recorded limitation of this row rather than a false green inside it.
    assert.equal(fs.existsSync(PLAYWRIGHT_CLI), true, `the committed Playwright CLI must exist at ${PLAYWRIGHT_CLI}`);

    const listRun = runChild([
        PLAYWRIGHT_CLI,
        'test',
        `--config=${PLAYWRIGHT_CONFIG}`,
        `--project=${PLAYWRIGHT_PROJECT}`,
        '--list',
        '--reporter=list',
    ]);
    assert.equal(
        listRun.status,
        0,
        `the committed Playwright suite must collect cleanly, got ${listRun.status}:\n${listRun.stdout}\n${listRun.stderr}`,
    );

    const listedFiles = new Set();
    let listedTests = 0;
    for (const line of listRun.stdout.split('\n')) {
        const matched = LISTED_TEST.exec(line);
        if (matched !== null) {
            assert.equal(matched[1], PLAYWRIGHT_PROJECT, `a collected test names an unexpected project: ${line}`);
            listedFiles.add(matched[2]);
            listedTests += 1;
        }
    }

    const total = LIST_TOTAL.exec(listRun.stdout);
    assert.notEqual(total, null, `the collection summary is missing its total line. stdout was:\n${listRun.stdout}`);

    // Self-consistency first: a parser that matched nothing would otherwise "prove" an empty suite
    // intact. The reporter's own totals must reconcile with the lines this row actually read.
    assert.ok(listedTests > 0, 'the collection must have listed tests — a silent parse failure is not a green suite');
    assert.equal(listedTests, Number(total[1]), 'the parsed test lines must reconcile with the reported total');
    assert.equal(listedFiles.size, Number(total[2]), 'the parsed spec files must reconcile with the reported file total');

    assert.deepEqual(
        [...listedFiles].sort(),
        committedSpecs,
        'every committed spec file must still collect, and collection must contain nothing that is not committed',
    );
});
