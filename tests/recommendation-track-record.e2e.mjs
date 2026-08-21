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
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
 *
 * Output is captured through temporary FILES, not pipes. Node writes a piped stdout asynchronously
 * on POSIX and the Playwright CLI ends a successful collection with `process.exit(0)`, which
 * discards whatever is still queued — so a clean exit could return a transcript truncated
 * mid-stream, losing the trailing summary this row parses. Writes to a file are synchronous, so
 * the child can have nothing queued when it exits.
 */
function runChild(args) {
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_TEST_WORKER_ID;

    const captureRoot = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'rtr-capture-'));
    try {
        const stdoutPath = path.join(captureRoot, 'stdout');
        const stderrPath = path.join(captureRoot, 'stderr');
        const stdoutFd = fs.openSync(stdoutPath, 'w');
        const stderrFd = fs.openSync(stderrPath, 'w');

        let run;
        try {
            run = spawnSync(process.execPath, args, {
                cwd: REPO_ROOT,
                env,
                stdio: ['ignore', stdoutFd, stderrFd],
            });
        } finally {
            fs.closeSync(stdoutFd);
            fs.closeSync(stderrFd);
        }

        assert.equal(run.error, undefined, `node ${args.join(' ')} failed to spawn: ${run.error}`);
        return {
            status: run.status,
            stdout: fs.readFileSync(stdoutPath, 'utf8'),
            stderr: fs.readFileSync(stderrPath, 'utf8'),
        };
    } finally {
        fs.rmSync(captureRoot, { recursive: true, force: true });
    }
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

/* =============================================================================================
 * T-03-R1 — the resolved-flat sentinel, end to end. PERMANENT.
 *
 * SCN-015-004 stated once as a full pass rather than as four separate properties: a mixed cohort
 * of REAL minted claims is classified against each claim's own frozen band, routed, summarised by
 * the 007-owned primitive UNMODIFIED, published with its denominator, partitioned, and stored
 * content-addressed. A later scope that merges resolved-flat back into unresolved, that nudges a
 * flat value to give it a sign, that lets a bare zero reach the primitive, or that lets a class
 * fall out of the accounting fails HERE.
 *
 * Nothing here reads a clock and nothing here writes into the committed `briefs/objects/` tree.
 * =========================================================================================== */

const LEDGER_DIR = path.join(REPO_ROOT, 'briefs', 'history', 'recommendations');

/** The exact unrounded flat value the row tracks through classification, bytes, and read-back. */
const UNROUNDED_FLAT = 0.1 + 0.2 - 0.3;

/** Closure event and reason per class, each pair legal for its class in the module's own tables. */
const CLOSURE_FOR_CLASS = Object.freeze({
    win: { closureEventType: 'satisfied', reasonCode: 'predicate-satisfied' },
    loss: { closureEventType: 'satisfied', reasonCode: 'predicate-satisfied' },
    'resolved-flat': { closureEventType: 'satisfied', reasonCode: 'predicate-satisfied' },
    unresolved: { closureEventType: 'expired', reasonCode: 'horizon-elapsed' },
    'not-evaluable': { closureEventType: 'not-evaluable', reasonCode: 'no-committed-reference' },
});

function committedV2Row() {
    const row = fs
        .readdirSync(LEDGER_DIR)
        .filter((f) => f.endsWith('.jsonl'))
        .sort()
        .flatMap((f) => fs.readFileSync(path.join(LEDGER_DIR, f), 'utf8').split('\n').filter((l) => l.trim().length > 0))
        .map((line) => JSON.parse(line))
        .find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(row, 'the committed ledger must carry a v2 row for this row to mean anything');
    return row;
}

/** Every DISTINCT evaluable claim the fixture set mints, in fixture order. */
function distinctEvaluableClaims() {
    const byHash = new Map();
    for (const fixture of loadClaimFixtures()) {
        if (fixture.expected.outcome !== 'evaluable') continue;
        const minted = claims.mintClaim(mintInputFrom(fixture));
        assertEvaluable(minted, fixture.name);
        if (!byHash.has(minted.claim.claimHash)) byHash.set(minted.claim.claimHash, minted.claim);
    }
    return [...byHash.values()];
}

test('T-03-R1: a resolved-flat outcome survives a full classify-route-summarise-store pass as its own class', () => {
    const vocabulary = claims.readClosureEventVocabulary(foundationSourceText());
    const eventId = committedV2Row().eventId;
    const cohortClaims = distinctEvaluableClaims();
    assert.ok(cohortClaims.length >= 5, `the fixture set must mint at least five distinct evaluable claims, got ${cohortClaims.length}`);

    /* One outcome per distinct claim, each value expressed in THAT claim's own frozen band, so the
       classes below are the classifier's verdict rather than this row's label. */
    const OUTCOME_FOR_INDEX = Object.freeze([
        (band) => band * 6,
        (band) => -band * 4,
        () => UNROUNDED_FLAT,
        (band) => -band * 0.5,
        (band) => band * 2.5,
    ]);

    const resolved = cohortClaims.slice(0, OUTCOME_FOR_INDEX.length).map((claim, index) => {
        const band = claims.flatBandFor(claim);
        assert.equal(band.ok, true, `claim ${index}: must carry a usable frozen band`);
        const classified = claims.classifyOutcome(OUTCOME_FOR_INDEX[index](band.flatBand), claim);
        assert.equal(classified.ok, true, `claim ${index}: classifyOutcome refused: ${JSON.stringify(classified.error)}`);
        assert.equal(classified.flatBand, band.flatBand, `claim ${index}: classified against the claim's OWN band`);
        return { claim, outcomeClass: classified.outcomeClass, outcomeValue: classified.outcomeValue };
    });

    assert.deepEqual(
        resolved.map((r) => r.outcomeClass),
        ['win', 'loss', 'resolved-flat', 'resolved-flat', 'win'],
        'the module assigned two wins, one loss and two resolved-flat outcomes',
    );

    // Withheld classes at deliberately DIFFERENT multiplicities, so a scorer that collapsed the
    // three 015-owned counts into one bucket cannot agree with this row.
    const cohort = Object.freeze([
        ...resolved.map(({ outcomeClass, outcomeValue }) => ({ outcomeClass, outcomeValue })),
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'unresolved', outcomeValue: null },
        { outcomeClass: 'not-evaluable', outcomeValue: null },
        { outcomeClass: 'unresolvable-legacy' },
    ]);

    const routed = claims.routeOutcomes([...cohort]);
    assert.equal(routed.ok, true, `the cohort must route: ${JSON.stringify(routed.error)}`);
    assert.equal(routed.resolvedDirectional, 3, 'exactly the two wins and the one loss are fed');
    assert.deepEqual(
        [routed.counts['resolved-flat'], routed.counts.unresolved, routed.counts['not-evaluable']],
        [2, 3, 1],
        'the three 015-owned counts are non-zero AND pairwise distinct',
    );

    // THE SENTINEL. The primitive, unmodified, reports zero unresolved BY CONSTRUCTION — which is
    // exactly why its field is discarded and the 015 counts are rendered instead.
    const validationRequire = createRequire(import.meta.url);
    const summary = validationRequire('../rlvalidation.js').rlvSummarizeOutcomes(routed.directional);
    assert.equal(summary.ok, true, 'the primitive must accept a zero-free finite array');
    assert.equal(summary.unresolved, 0, 'summary.unresolved is 0 and therefore says nothing about the cohort');
    assert.notEqual(summary.unresolved, routed.counts.unresolved, 'it is NOT the 015 unresolved count');
    assert.equal(summary.count, routed.resolvedDirectional, 'the primitive counted exactly the fed array');

    const published = claims.directionalDenominator(routed, summary);
    assert.equal(published.ok, true, `the denominator must publish: ${JSON.stringify(published.error)}`);
    assert.equal(published.resolvedDirectional, routed.directional.length, 'the denominator IS the fed length');
    assert.equal(published.label, claims.DIRECTIONAL_RATE_LABEL, 'and the rate is labelled directional');

    // RTR-FLAT-ZERO still fires on a bare zero reaching the array.
    const withZero = claims.assertZeroFreeOutcomes([...routed.directional, 0]);
    assert.equal(withZero.ok, false, 'a bare zero must not reach the primitive');
    assert.equal(withZero.error.code, claims.FLAT_ZERO_CODE, 'and refuses with RTR-FLAT-ZERO');
    assert.equal(withZero.error.index, routed.directional.length, 'naming the offending index');

    // THE PARTITION over the whole result: every proposed call accounted for exactly once.
    const lifecycle = { totalProposed: cohort.length + 3, withdrawn: 2, open: 1 };
    const partition = claims.classPartition(routed, lifecycle);
    assert.equal(partition.ok, true, `the partition must hold: ${JSON.stringify(partition.error)}`);
    assert.deepEqual(
        partition.buckets,
        { resolvedDirectional: 3, resolvedFlat: 2, unresolved: 3, notEvaluable: 1, unresolvableLegacy: 1, withdrawn: 2, open: 1 },
        'resolved-flat is its own bucket and is never folded into unresolved',
    );
    assert.equal(partition.sum, lifecycle.totalProposed, 'and sums to the proposed total');

    // THE STORE. One resolution per resolved claim, written content-addressed, then re-written.
    withDisposableStore(({ root, ports }) => {
        assert.equal(root.startsWith(REPO_ROOT), false, 'the disposable store must live outside the repository');

        const expectedNames = [];
        for (const { claim, outcomeClass, outcomeValue } of resolved) {
            const built = claims.buildResolution({
                closureVocabulary: vocabulary,
                claimHash: claim.claimHash,
                eventId,
                resolutionDate: claim.horizon.resolutionDate,
                outcomeClass,
                outcomeValue,
                ...CLOSURE_FOR_CLASS[outcomeClass],
                provenance: { seriesRef: claim.subject.seriesRef, entryDate: claim.magnitude.entryDate, entryBasis: claim.magnitude.entryBasis },
                lifecycleBinding: { runId: 'run-2026-07-15T20-00-00', resolvedAt: '2026-07-15T20:00:00.000Z' },
            });
            assert.equal(built.ok, true, `${outcomeClass}: buildResolution refused: ${JSON.stringify(built.error)}`);
            assert.equal(
                Object.is(built.resolution.outcomeValue, outcomeValue),
                true,
                `${outcomeClass}: the record holds the EXACT value — no nudge, no rounding, no fabricated sign`,
            );

            const row = { ...committedV2Row(), [claims.CLAIM_REF_FIELD]: claim.claimHash };
            const write = claims.writeResolutionObject(built.resolution, row, ports);
            assert.equal(write.ok, true, `${outcomeClass}: the write must succeed: ${JSON.stringify(write.error)}`);
            assert.equal(write.written, true, `${outcomeClass}: the first write creates the object`);

            const objectPath = path.join(root, write.path);
            const before = readBytes(objectPath);
            assert.equal(before, claims.serializeResolution(built.resolution), `${outcomeClass}: stored bytes`);
            assert.equal(
                Object.is(JSON.parse(before).outcomeValue, outcomeValue),
                true,
                `${outcomeClass}: the exact value survives the round trip through the stored bytes`,
            );

            const repeat = claims.writeResolutionObject(built.resolution, row, ports);
            assert.equal(repeat.ok, true, `${outcomeClass}: a repeat must not be refused`);
            assert.equal(repeat.written, false, `${outcomeClass}: a second file would count one resolution twice`);
            assert.equal(repeat.reused, true, `${outcomeClass}: the repeat reuses the first object`);
            assertBytesUnchanged(before, readBytes(objectPath), `T-03-R1 ${outcomeClass} repeat`);

            expectedNames.push(`${bareHexOf(built.resolution.resolutionHash)}.json`);
        }

        assert.equal(new Set(expectedNames).size, resolved.length, 'each resolved claim occupies its own address');
        assert.deepEqual(
            fs.readdirSync(path.join(root, claims.RESOLUTION_STORE_DIR)).sort(),
            [...expectedNames].sort(),
            'the store holds exactly one object per resolved claim and nothing else',
        );
        for (const name of expectedNames) {
            assert.match(name, OBJECT_FILENAME, `${name}: bare lowercase hex with a .json extension`);
        }

        // The exact unrounded flat value is READ BACK from disk and is still itself. A `toFixed`,
        // a `Math.round`, or a `±ε` nudge anywhere on this path visibly changes it.
        const flatRecord = resolved.find((r) => Object.is(r.outcomeValue, UNROUNDED_FLAT));
        assert.ok(flatRecord, 'the cohort must genuinely carry the unrounded flat outcome');
        assert.equal(flatRecord.outcomeClass, 'resolved-flat', 'and it must have classified as resolved-flat');
        assert.notEqual(UNROUNDED_FLAT, 0, 'the tracked value is NOT a plain zero a `=== 0` path would also carry');
        const flatBytes = fs
            .readdirSync(path.join(root, claims.RESOLUTION_STORE_DIR))
            .map((name) => JSON.parse(fs.readFileSync(path.join(root, claims.RESOLUTION_STORE_DIR, name), 'utf8')))
            .filter((record) => record.outcomeClass === 'resolved-flat');
        assert.equal(flatBytes.length, 2, 'both resolved-flat outcomes are on disk as resolved-flat');
        assert.equal(
            flatBytes.some((record) => Object.is(record.outcomeValue, UNROUNDED_FLAT)),
            true,
            'the exact unrounded flat value is on disk, unmodified',
        );
        for (const record of flatBytes) {
            assert.notEqual(record.outcomeClass, 'unresolved', 'a resolved-flat record is never stored as unresolved');
        }
    });

    // A legacy row has nothing to address a resolution BY, so its class is counted permanently and
    // never recorded — the partition above already counts it.
    assert.deepEqual([...claims.OUTCOME_CLOSURE_EVENTS['unresolvable-legacy']], [], 'no closure event admits it');
    assertRefusal(
        claims.buildResolution({
            closureVocabulary: vocabulary,
            claimHash: cohortClaims[0].claimHash,
            eventId,
            resolutionDate: cohortClaims[0].horizon.resolutionDate,
            outcomeClass: 'unresolvable-legacy',
            outcomeValue: null,
            closureEventType: 'satisfied',
            reasonCode: 'predicate-satisfied',
            provenance: { seriesRef: cohortClaims[0].subject.seriesRef },
            lifecycleBinding: { runId: 'run-2026-07-15T20-00-00' },
        }).error,
        'outcome-class-carries-no-resolution',
        'outcomeClass',
        'T-03-R1 legacy',
    );
});

/* =============================================================================================
 * T-02-R1 — the scope 02 persistent regression, covering SCN-015-013, SCN-015-014, SCN-015-015.
 *
 * PERMANENT. One publish-and-append pass re-asserts all four properties end to end, so a later
 * scope that back-fills, null-fills, or migrates a legacy row fails HERE rather than silently:
 *   1. a v2 row references the claim minted in the SAME pass;
 *   2. a v1 row and a v2 row are both valid under the dual-version reader, with the seven-field
 *      projection byte-identical with and without claimRef;
 *   3. the prior partition bytes are byte-identical after the append;
 *   4. a resolution against a claimless row still fires RTR-LEGACY-BACKFILL — including the
 *      complete, well-formed, plausible predicate a permissive implementation most wants through.
 * =========================================================================================== */

const R1_RUN_FINGERPRINT = claims.stableSha({ fixture: 'T-02-R1 run fingerprint' });
const R1_OCCURRED_AT = '2026-07-14T12:40:00.000Z';
const R1_PARTITION_REL = path.join('briefs', 'history', 'recommendations', '2026-07.jsonl');

const R1_PLAUSIBLE_RESOLUTION = Object.freeze({
    contractVersion: 'brief-recommendation-resolution/v1',
    predicate: { kind: 'threshold', basis: 'close', comparator: 'lte', value: 100 },
    horizon: { kind: 'next-session', resolutionDate: '2026-07-15' },
    outcomeClass: 'satisfied',
    outcomeValue: -2.4,
    resolvedAt: '2026-07-15T20:00:00.000Z',
});

function r1EventIdFor(recommendationKey, index) {
    return claims.stableSha({
        contractVersion: 'brief-distributed-eventid/v1',
        runFingerprint: R1_RUN_FINGERPRINT,
        recommendationKey,
        index,
    });
}

function r1AuthoredAction(symbol) {
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

function r1NonEmptyLines(text) {
    return text.split('\n').filter((line) => line.trim().length > 0);
}

/** The seven-field projection, taking its names from the module's frozen v1 list. */
function r1ProjectSevenFields(row) {
    const projection = {};
    for (const field of claims.ROW_V1_FIELDS) projection[field] = row[field];
    return projection;
}

test('T-02-R1: a full publish-and-append pass holds the claim-referencing row, the dual-version read, the append-only bytes, and RTR-LEGACY-BACKFILL', () => {
    const symbol = committedSeries()[0];
    assert.ok(symbol, 'the committed bars set must be non-empty');

    /* One evaluable action and one the minter refuses, so the pass covers BOTH halves: a row that
       gains a pointer and a row that honestly does not. */
    const payload = {
        nextSession: { actions: [r1AuthoredAction(symbol), { action: 'note', subject: 'action-1' }] },
        recommendations: [],
    };
    const universe = loadInstrumentUniverse(REPO_ROOT);
    const buildEvents = () => recommendationRowsFromPayload(payload, {
        root: REPO_ROOT,
        occurredAt: R1_OCCURRED_AT,
        universe,
        eventIdFor: r1EventIdFor,
    }).map((event) => ({ ...event, bodySource: 'next-session-action' }));
    const mintOptions = { root: REPO_ROOT, proposalRunId: 'dist-2026-07-14-r1', proposedAt: R1_OCCURRED_AT };

    const events = attachClaimRefs(buildEvents(), payload, mintOptions);
    const records = mintClaimRecords(buildEvents(), payload, mintOptions);

    const built = buildPublishSet(buildRun({ recommendationEvents: events }));
    assert.equal(built.ok, true, 'the publish set must build for this pass to be a real one');
    const partitionKey = Object.keys(built.staging.historyPartitions).find((p) => p.includes('/recommendations/'));
    assert.ok(partitionKey, 'the publish set must carry a recommendation partition');
    const appended = built.staging.historyPartitions[partitionKey].appendedBytes;
    const appendedRows = r1NonEmptyLines(appended.toString('utf8')).map((line) => JSON.parse(line));
    assert.equal(appendedRows.length, events.length, 'one emitted row per event');

    // 1. THE CLAIM-REFERENCING ROW: the pointer IS the claim minted in the same pass.
    const bearing = appendedRows.filter((row) => Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD));
    assert.equal(bearing.length, 1, 'exactly one emitted row carries claimRef');
    assert.equal(bearing[0].contractVersion, claims.ROW_CONTRACT_V2, 'the claim-referencing row is v2');
    assert.equal(bearing[0][claims.CLAIM_REF_FIELD], records[0].claim.claimHash, 'the row references the claim minted in this pass');
    assert.match(bearing[0][claims.CLAIM_REF_FIELD], PREFIXED_HASH, 'and the pointer is an opaque sha256');
    const freshClaimless = appendedRows.find((row) => !Object.prototype.hasOwnProperty.call(row, claims.CLAIM_REF_FIELD));
    assert.ok(freshClaimless, 'the refused half must emit a claimless row');
    assert.equal(freshClaimless[claims.CLAIM_REF_FIELD], undefined, 'absence, never null');
    assertRefusal(events[1][CLAIM_NOT_EVALUABLE_FIELD], 'non-semantic-subject', 'actionFamily', 'T-02-R1 refused mint');

    // 2. THE DUAL-VERSION READ, against REAL committed rows of each version.
    const committedBytes = readBytes(path.join(REPO_ROOT, R1_PARTITION_REL));
    assert.ok(committedBytes, `the committed partition must exist at ${R1_PARTITION_REL}`);
    const committedRows = r1NonEmptyLines(committedBytes).map((line) => JSON.parse(line));
    const legacyV1 = committedRows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V1);
    const legacyV2 = committedRows.find((r) => r.contractVersion === claims.ROW_CONTRACT_V2);
    assert.ok(legacyV1 && legacyV2, 'the committed partition must carry a pre-contract row of each version');
    for (const [label, row] of [['v1', legacyV1], ['v2', legacyV2], ['fresh v2 with claimRef', bearing[0]]]) {
        assert.equal(claims.validateLedgerRow(row).ok, true, `${label}: must validate under the dual-version reader`);
    }
    assert.deepEqual(
        Object.keys(r1ProjectSevenFields(bearing[0])),
        [...claims.ROW_V1_FIELDS],
        'the seven-field projection of a claim-referencing row returns exactly the seven v1 key names',
    );
    const strippedOfPointer = { ...bearing[0] };
    delete strippedOfPointer[claims.CLAIM_REF_FIELD];
    assert.equal(
        claims.stableStringify(r1ProjectSevenFields(bearing[0])),
        claims.stableStringify(r1ProjectSevenFields(strippedOfPointer)),
        'and is byte-identical with and without claimRef',
    );

    // 3. THE APPEND IS APPEND-ONLY, proven on a real filesystem outside the repository.
    withDisposableStore(({ root }) => {
        assert.equal(root.startsWith(REPO_ROOT), false, 'the append must run outside the repository');
        const partitionPath = path.join(root, R1_PARTITION_REL);
        fs.mkdirSync(path.dirname(partitionPath), { recursive: true });
        const priorBytes = Buffer.from(`${[legacyV1, legacyV2].map((row) => claims.stableStringify(row)).join('\n')}\n`, 'utf8');
        fs.writeFileSync(partitionPath, priorBytes);

        fs.appendFileSync(partitionPath, appended);
        const after = fs.readFileSync(partitionPath);
        assert.ok(after.subarray(0, priorBytes.length).equals(priorBytes), 'the prior partition bytes are byte-identical after the append');
        assert.equal(after.length > priorBytes.length, true, 'and the partition grew');

        const finalRows = r1NonEmptyLines(after.toString('utf8')).map((line) => JSON.parse(line));
        assert.equal(finalRows.length, 2 + appendedRows.length, 'every prior and appended row survives');
        for (const row of finalRows) assert.equal(claims.validateLedgerRow(row).ok, true, 'every round-tripped row validates');
        for (let i = 0; i < 2; i += 1) {
            assert.equal(
                Object.prototype.hasOwnProperty.call(finalRows[i], claims.CLAIM_REF_FIELD),
                false,
                `prior row ${i}: still claimless — nothing was back-filled`,
            );
        }
    });

    // 4. RTR-LEGACY-BACKFILL still fires, including the plausible-imputation case.
    const legacyExpected = { code: claims.LEGACY_BACKFILL_CODE, reason: 'claimless-row-unscoreable', field: claims.CLAIM_REF_FIELD };
    for (const [label, row] of [['committed v1', legacyV1], ['committed v2', legacyV2], ['freshly refused row', freshClaimless]]) {
        for (const [shape, resolution] of [['plausible', R1_PLAUSIBLE_RESOLUTION], ['empty', {}], ['absent', null]]) {
            const outcome = claims.authorizeResolutionWrite(row, resolution);
            assert.equal(outcome.ok, false, `${label} + ${shape}: must refuse`);
            assert.equal(outcome.error.code, legacyExpected.code, `${label} + ${shape}: code`);
            assertRefusal(outcome.error, legacyExpected.reason, legacyExpected.field, `${label} + ${shape}`);
        }
    }

    /* ANTI-VACUITY. The identical plausible resolution against the claim-BEARING row of the same
       pass is ACCEPTED — so the refusals above are a property of key absence, not a blanket
       refusal, and a null pointer refuses on the contract rather than passing as never-minted. */
    const authorized = claims.authorizeResolutionWrite(bearing[0], R1_PLAUSIBLE_RESOLUTION);
    assert.equal(authorized.ok, true, 'the claim-referencing row accepts the identical resolution');
    assert.equal(authorized.claimRef, bearing[0][claims.CLAIM_REF_FIELD], 'and returns the pointer to resolve against');
    const nulled = claims.authorizeResolutionWrite({ ...legacyV2, [claims.CLAIM_REF_FIELD]: null }, R1_PLAUSIBLE_RESOLUTION);
    assert.equal(nulled.ok, false, 'a null pointer is not resolvable');
    assert.notEqual(nulled.error.code, claims.LEGACY_BACKFILL_CODE, 'and is NOT classified legacy — absence is the marker, never a null');

    assertBytesUnchanged(committedBytes, readBytes(path.join(REPO_ROOT, R1_PARTITION_REL)), `${R1_PARTITION_REL} bytes`);
});
