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
/* A NAMESPACE import, not named bindings: T-04-V1 derives the resolver's shipped `RTR-*` code set
 * from the live export surface, so it needs the surface itself rather than a list of names a test
 * author chose — a code that was renamed or never shipped cannot hide behind a named import. */
import * as resolver from '../scripts/brief-resolve-outcomes.mjs';
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
    loadClaimFixtures,
    loadClaimsModule,
    mintInputFrom,
    readBytes,
    toolsRegistry,
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

/* =============================================================================================
 * T-04-V1 — the resolver is offline, asserted by a scan that is proven able to fail. PERMANENT.
 *
 * The property is BS-007: nothing on the resolve path may reach a network, a provider host, or a
 * credential. A scan is a weak instrument by default — one that never flags anything is
 * indistinguishable from one that is broken — so this row spends most of its length proving the
 * scanner's two failure modes are closed.
 *
 * NOT VACUOUS. The same scanner is run over four synthetic sources, each referencing exactly one
 * forbidden category, and each must be flagged as exactly that category. A scanner that had
 * silently stopped matching fails here before it can certify the resolver.
 *
 * NOT SLOPPY. Two false positives are ruled out by construction rather than by hope, because the
 * shipped resolver carries both of them TODAY and a naive scan would reject it:
 *
 *   1. PROSE. The resolver's own header says it "opens a socket" (in the negative) and a later
 *      comment names the `fetch-bars` producer. Comments are therefore STRIPPED before matching,
 *      by a scanner that tracks string state so a `//` inside a literal is not mistaken for one.
 *   2. SUBSTRINGS. The resolver exports `SESSION_PREDICATE_KEY`, `originRecommendationKeyFor` and
 *      `dueEntryKeys`, and reads `import.meta.url`. A `/key/i` or `/url/i` substring scan flags all
 *      four. So identifiers are SPLIT INTO WORDS on camelCase and `_` boundaries and matched as
 *      whole words or as adjacent word PAIRS — `key` alone is never a trigger, `api`+`key` is.
 *      `prefetchIndex` splits to `prefetch`+`index` and is likewise untouched.
 *
 * `RTR-NETWORK` IS NOT SHIPPED. `specs/.../design.md` and scope 04 both name it, and scope 04's own
 * DoD line for this row is still unchecked; no product module defines it. The eleven codes that DO
 * ship are derived here from the live export surfaces, and the absence is asserted as an absence
 * rather than papered over with an invented constant. When scope 09 lands it, THIS row fails —
 * which is the correct way for a recorded gap to close.
 *
 * Nothing here reads a clock, opens anything, or writes anything.
 * =========================================================================================== */

/** The resolve path: the resolver plus the whole local module graph it pulls in. */
const OFFLINE_SURFACE_REL = Object.freeze([
    path.join('scripts', 'brief-resolve-outcomes.mjs'),
    'rlclaims.js',
    'rlcontracts.js',
]);

const RESOLVER_REL = OFFLINE_SURFACE_REL[0];

/** Builtins that cannot reach a network. Anything else must be a relative module in this repo. */
const OFFLINE_BUILTINS = Object.freeze(['node:assert', 'node:fs', 'node:module', 'node:path', 'node:url']);

/**
 * Remove comments while PRESERVING string, template and REGEX literals.
 *
 * All three are load-bearing. Comments must go, because the resolver's prose names the very
 * surfaces this row forbids. Strings must STAY, because a provider host or a credential name would
 * live in one — stripping them would make the scan pass for the wrong reason. And a regex must be
 * recognised as a literal rather than walked character by character: `rlcontracts.js:739` carries a
 * backtick INSIDE a character-class alternation, which a scanner that only knew about quotes reads
 * as the start of a template literal and then never closes.
 *
 * A leading `/` is a regex only where an expression may begin, decided from the last significant
 * character already emitted — so `a / b` stays division while `= /.../` is a literal. Inside a
 * character class a `/` is content, which is what the offending pattern needs.
 *
 * Two outputs, because a regex BODY is pattern data rather than a reference. `code` keeps every
 * literal intact and is what the code-survival checks read. `scannable` blanks each regex body,
 * and is what the matcher reads: `rlcontracts.js:501` and `:739` are DENYLISTS naming
 * `authorization`, `credential` and `passphrase` in order to REFUSE keys shaped like them, which
 * is the opposite of a credential lookup. Scanning their bodies would report the foundation's own
 * guard as the defect the guard exists to prevent. String literals are NOT blanked, because a
 * header name or a host genuinely does live in one.
 *
 * String state is tracked so that `//` inside a literal is content rather than a comment opener,
 * and so that an apostrophe inside a comment cannot flip the scanner into a string it never left.
 * Ending inside an unterminated literal means the scan mis-read the source, so it THROWS rather
 * than returning a partial strip a caller would treat as clean.
 */
const REGEX_MAY_FOLLOW = Object.freeze(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>']);
const REGEX_MAY_FOLLOW_KEYWORD = Object.freeze(['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw', 'do', 'else', 'yield', 'await']);
const TRAILING_WORD = /[A-Za-z_$][A-Za-z0-9_$]*$/;

function regexMayStartAfter(emitted) {
    const trimmed = emitted.replace(/\s+$/, '');
    if (trimmed.length === 0) return true;
    if (REGEX_MAY_FOLLOW.includes(trimmed[trimmed.length - 1])) return true;
    const word = TRAILING_WORD.exec(trimmed);
    return word !== null && REGEX_MAY_FOLLOW_KEYWORD.includes(word[0]);
}

function prepareSource(source) {
    let code = '';
    let scannable = '';
    let quote = null;
    let index = 0;
    const emit = (text) => {
        code += text;
        scannable += text;
    };

    while (index < source.length) {
        const character = source[index];
        const next = source[index + 1];

        if (quote !== null) {
            if (character === '\\') {
                emit(character + (next ?? ''));
                index += 2;
                continue;
            }
            emit(character);
            if (character === quote) quote = null;
            index += 1;
            continue;
        }
        if (character === "'" || character === '"' || character === '`') {
            quote = character;
            emit(character);
            index += 1;
            continue;
        }
        if (character === '/' && next === '/') {
            while (index < source.length && source[index] !== '\n') index += 1;
            continue;
        }
        if (character === '/' && next === '*') {
            index += 2;
            while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
                if (source[index] === '\n') emit('\n');
                index += 1;
            }
            index += 2;
            continue;
        }
        if (character === '/' && regexMayStartAfter(code)) {
            code += character;
            index += 1;
            let inCharacterClass = false;
            while (index < source.length) {
                const inner = source[index];
                if (inner === '\\') {
                    code += inner + (source[index + 1] ?? '');
                    index += 2;
                    continue;
                }
                if (inner === '\n') break;
                code += inner;
                index += 1;
                if (inner === '[') inCharacterClass = true;
                else if (inner === ']') inCharacterClass = false;
                else if (inner === '/' && !inCharacterClass) break;
            }
            while (index < source.length && /[A-Za-z]/.test(source[index])) {
                code += source[index];
                index += 1;
            }
            scannable += ' ';
            continue;
        }
        emit(character);
        index += 1;
    }

    assert.equal(quote, null, 'the source preparer ended inside a literal — its read of this source is not trustworthy');
    return { code, scannable };
}

const IDENTIFIER_TOKEN = /[A-Za-z_$][A-Za-z0-9_$]*/g;
const EXPORT_DECLARATION = /^export (?:const|function|async function) /gm;

/** `SESSION_PREDICATE_KEY` → `session predicate key`; `keyFor` → `key for`; `prefetch` → `prefetch`. */
function wordsOf(identifier) {
    return identifier
        .replace(/[_$]+/g, ' ')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);
}

/**
 * The four forbidden categories, each expressed as whole words, adjacent word pairs, module
 * specifiers, or a pattern — never as a bare substring.
 *
 * `key`, `token`, `url` and `auth` are deliberately absent as single words: each of them appears
 * innocently in the shipped resolver, and a scanner that flagged them would be reporting its own
 * imprecision as a defect. The network-scheme pattern excludes `file://` and `data:` for the same
 * reason — `rlclaims.js` documents that it loads under `file://`, which is the opposite of a
 * network reach.
 */
const FORBIDDEN_SURFACES = Object.freeze({
    'network-call': {
        words: ['fetch', 'eventsource'],
        pairs: [['xml', 'http'], ['http', 'request'], ['send', 'beacon'], ['http', 'client']],
        modules: ['http', 'https', 'http2', 'node:http', 'node:https', 'node:http2', 'axios', 'undici', 'node-fetch', 'superagent'],
        patterns: [],
    },
    socket: {
        words: ['socket', 'websocket'],
        pairs: [['create', 'connection'], ['web', 'socket']],
        modules: ['net', 'tls', 'dgram', 'node:net', 'node:tls', 'node:dgram', 'ws'],
        patterns: [],
    },
    'provider-host': {
        words: [],
        pairs: [],
        modules: [],
        patterns: [/(?:https?|wss?|ftps?):\/\//g],
    },
    'credential-lookup': {
        words: ['apikey', 'authorization', 'bearer', 'credential', 'credentials', 'passphrase'],
        pairs: [['api', 'key'], ['api', 'token'], ['access', 'token'], ['auth', 'token'], ['bearer', 'token'], ['client', 'secret'], ['secret', 'key'], ['private', 'key']],
        modules: [],
        patterns: [/\bprocess\s*\.\s*env\b/g],
    },
});

const FROM_SPECIFIER = /\bfrom\s*['"]([^'"]+)['"]/g;
const CALL_SPECIFIER = /\b(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const BARE_IMPORT_SPECIFIER = /^\s*import\s+['"]([^'"]+)['"]/gm;

function specifiersIn(code) {
    const found = new Set();
    for (const pattern of [FROM_SPECIFIER, CALL_SPECIFIER, BARE_IMPORT_SPECIFIER]) {
        for (const match of code.matchAll(pattern)) found.add(match[1]);
    }
    return [...found].sort();
}

/** Scan ALREADY-PREPARED text. Kept separate from the preparer so the preparer can be measured. */
function scanCode(scanned) {
    const identifiers = scanned.match(IDENTIFIER_TOKEN) ?? [];
    const wordLists = identifiers.map(wordsOf);
    const specifiers = specifiersIn(scanned);
    const flagged = new Map();

    for (const [category, rule] of Object.entries(FORBIDDEN_SURFACES)) {
        const hits = [];
        for (let index = 0; index < identifiers.length; index += 1) {
            const words = wordLists[index];
            const wholeWord = rule.words.some((word) => words.includes(word));
            const adjacentPair = rule.pairs.some(([first, second]) => words.some((word, at) => word === first && words[at + 1] === second));
            if (wholeWord || adjacentPair) hits.push(identifiers[index]);
        }
        for (const specifier of specifiers) {
            if (rule.modules.includes(specifier)) hits.push(`import ${specifier}`);
        }
        for (const pattern of rule.patterns) {
            for (const match of scanned.matchAll(pattern)) hits.push(match[0]);
        }
        if (hits.length > 0) flagged.set(category, [...new Set(hits)].sort());
    }
    return { scanned, identifiers, specifiers, flagged };
}

function scanOfflineSurface(source) {
    const prepared = prepareSource(source);
    return { ...scanCode(prepared.scannable), code: prepared.code };
}

function flaggedCategories(scan) {
    return [...scan.flagged.keys()].sort();
}

function describeFlags(scan) {
    return JSON.stringify(Object.fromEntries(scan.flagged), null, 0);
}

/** One synthetic source per category, each referencing that category and no other. */
const FORBIDDEN_SYNTHETICS = Object.freeze([
    { category: 'network-call', source: "export async function load(at) {\n  return fetch(at);\n}\n" },
    { category: 'socket', source: "import net from 'node:net';\nexport function open(port) {\n  return net.createConnection({ port });\n}\n" },
    { category: 'provider-host', source: "export const ORIGIN = 'https://prices.example.test/v1/bars';\n" },
    { category: 'credential-lookup', source: "export function reader() {\n  const apiKey = process.env.PROVIDER_API_KEY;\n  return apiKey;\n}\n" },
]);

/** Sources that MENTION every forbidden surface innocently, and must therefore stay clean. */
const INNOCENT_SYNTHETICS = Object.freeze([
    {
        label: 'prose only',
        source: [
            '/*',
            ' * This module opens no socket, calls no fetch, needs no api key, holds no bearer token,',
            " * reads no process.env, and never touches https://prices.example.test. It is offline.",
            ' */',
            '// Nor does it use axios, node:net, an access token, or an Authorization header.',
            'export const OFFLINE = true;\n',
        ].join('\n'),
    },
    {
        label: 'innocent identifiers and a file:// literal',
        source: [
            "export const SESSION_PREDICATE_KEY = 'regular-block';",
            'export const ORIGIN_KEY_TERMS = Object.freeze([]);',
            'export function keyFor(entry) {',
            '  return Object.keys(entry).sort();',
            '}',
            'export function dueEntryKeys(index) {',
            '  const originRecommendationKeyFor = (row) => row.key;',
            '  return prefetchIndex(index).map(originRecommendationKeyFor);',
            '}',
            "export const LOCAL = 'file://./data/calendars/xnys/calendar.json';",
            'export const HERE = import.meta.url;\n',
        ].join('\n'),
    },
    {
        /* The exact shape that broke an earlier draft of this scanner, and the exact shape the
           foundation ships: `rlcontracts.js:739` holds a regex whose alternation carries a backtick
           and whose character class carries a `/`, and `:501` and `:739` are credential DENYLISTS.
           Read without regex handling the backtick opens a template literal that never closes; read
           without blanking the body, a guard that refuses `authorization` is reported as a lookup
           of one. Both failures are ruled out here. */
        label: 'regex literals: a backtick, a class-internal slash, and a credential denylist',
        source: [
            'export const MARKUP = /<[a-z!/]|javascript:|data:text\\/html|`{3}|\\bignore (?:all |previous )/i;',
            'export const SECRET_SHAPED_KEY = /(?:authorization|cookie|credential|api[-_]?key|password|passphrase|secret|token)/i;',
            'export function ratio(numerator, denominator) {',
            '  return numerator / denominator;',
            '}',
            "export const CLEAN = MARKUP.test('plain text') || SECRET_SHAPED_KEY.test('plain text');\n",
        ].join('\n'),
    },
]);

test('T-04-V1: the shipped resolver reaches no network, host or credential, under a scanner proven able to flag each and to ignore prose', () => {
    /* ---- 1. THE SCANNER FLAGS. Four synthetics, four categories, one apiece. ---------------- */

    // Run FIRST and asserted per-category. A scanner certified against the resolver before it was
    // shown able to fail would be certifying its own silence.
    for (const { category, source } of FORBIDDEN_SYNTHETICS) {
        const scan = scanOfflineSurface(source);
        assert.deepEqual(
            flaggedCategories(scan),
            [category],
            `the ${category} synthetic must be flagged as exactly ${category}, got ${describeFlags(scan)}`,
        );
        assert.ok(scan.flagged.get(category).length > 0, `${category}: the flag must name what it matched`);
    }
    assert.deepEqual(
        FORBIDDEN_SYNTHETICS.map((entry) => entry.category).sort(),
        Object.keys(FORBIDDEN_SURFACES).sort(),
        'every declared category must have a synthetic that proves it fires — an uncovered category is an unproven one',
    );

    /* ---- 2. THE SCANNER DOES NOT OVER-FLAG. Prose and substrings stay clean. ---------------- */

    for (const { label, source } of INNOCENT_SYNTHETICS) {
        const scan = scanOfflineSurface(source);
        assert.deepEqual(flaggedCategories(scan), [], `${label}: must not be flagged, got ${describeFlags(scan)}`);
    }

    // The precision is a property of the WORD SPLIT, so it is asserted directly rather than only
    // through the composite above: `key` never fires alone, `api`+`key` always does.
    assert.deepEqual(wordsOf('keyFor'), ['key', 'for'], 'keyFor splits to key+for — no api, so no pair');
    assert.deepEqual(wordsOf('SESSION_PREDICATE_KEY'), ['session', 'predicate', 'key'], 'and a screaming-snake constant splits too');
    assert.deepEqual(wordsOf('prefetchIndex'), ['prefetch', 'index'], 'prefetch is one word and is NOT fetch');
    assert.deepEqual(wordsOf('apiKey'), ['api', 'key'], 'while apiKey splits to the adjacent pair that DOES fire');
    assert.deepEqual(flaggedCategories(scanOfflineSurface('const apiKey = 1;\n')), ['credential-lookup'], 'and firing is measured, not assumed');

    /* ---- 3. THE STRIP IS LOAD-BEARING, and the strip does not eat code. --------------------- */

    const rawResolver = readBytes(path.join(REPO_ROOT, RESOLVER_REL));
    assert.ok(rawResolver, `the shipped resolver must exist at ${RESOLVER_REL}`);
    const resolverScan = scanOfflineSurface(rawResolver);

    assert.ok(resolverScan.code.length < rawResolver.length, 'the resolver genuinely carries comments, so stripping them is a real step');
    assert.equal(
        (resolverScan.code.match(EXPORT_DECLARATION) ?? []).length,
        (rawResolver.match(EXPORT_DECLARATION) ?? []).length,
        'stripping removed no export declaration — a strip that ate code would produce a clean scan of nothing',
    );
    assert.equal(resolverScan.code.includes('export function closeDueClaims'), true, 'and the resolve pass itself survives into the scanned text');
    assert.ok(resolverScan.identifiers.length > 0, 'the scan must have read identifiers — an empty read certifies nothing');

    // MEASURED, not assumed: the UNSTRIPPED resolver IS flagged today, and every hit disappears
    // under the strip. That is what proves the shipped file's cleanliness comes from prose and not
    // from a scanner that never looked at it.
    const unstripped = scanCode(rawResolver);
    assert.ok(unstripped.flagged.size > 0, 'the resolver must genuinely mention a forbidden surface in PROSE, or this control proves nothing');
    for (const [category, hits] of unstripped.flagged) {
        for (const hit of hits) {
            assert.equal(
                resolverScan.scanned.includes(hit),
                false,
                `${category}: "${hit}" survives comment stripping, so it is a real reference rather than prose`,
            );
        }
    }

    /* ---- 4. THE ASSERTION. The whole resolve path is offline. ------------------------------- */

    for (const relative of OFFLINE_SURFACE_REL) {
        const source = readBytes(path.join(REPO_ROOT, relative));
        assert.ok(source, `${relative}: the resolve path must exist`);
        const scan = scanOfflineSurface(source);
        assert.ok(scan.identifiers.length > 0, `${relative}: the scan must have read identifiers — an empty read certifies nothing`);
        assert.deepEqual(flaggedCategories(scan), [], `${relative}: must reach no network, host or credential; found ${describeFlags(scan)}`);

        // An import is the other way a network could arrive, so the specifier set is constrained
        // rather than merely un-flagged: relative modules in this repository, or offline builtins.
        for (const specifier of scan.specifiers) {
            const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
            assert.equal(
                isRelative || OFFLINE_BUILTINS.includes(specifier),
                true,
                `${relative}: imports "${specifier}", which is neither a relative module nor an offline builtin`,
            );
        }
    }
    assert.deepEqual(
        resolverScan.specifiers,
        ['../rlclaims.js', '../rlcontracts.js', 'node:fs', 'node:module', 'node:path'],
        'and the resolver reaches for exactly three offline builtins and the two local modules',
    );

    /* ---- 5. RTR-NETWORK IS NOT SHIPPED — recorded as an absence, never invented. ------------ */

    const shippedCodes = [...new Set(
        [resolver, claims].flatMap((module) => Object.values(module).filter((value) => typeof value === 'string' && value.startsWith('RTR-'))),
    )].sort();
    assert.ok(shippedCodes.length > 0, 'the shipped code set must be non-empty for its membership test to mean anything');
    assert.equal(shippedCodes.includes(resolver.SESSION_PREDICATE_CODE), true, 'the derivation must find a code this row can name');
    assert.equal(
        shippedCodes.includes('RTR-NETWORK'),
        false,
        `RTR-NETWORK is named by the design and by scope 04 but no product module defines it; the shipped set is ${shippedCodes.join(', ')}`,
    );
});

/* =============================================================================================
 * T-04-E1 — one full resolve pass over a fixture ledger state. PERMANENT.
 *
 * The pass is offered a verdict for EVERY claim in the index, so "one closure per due claim" is a
 * measured SELECTION rather than the only input available. Three properties:
 *
 *   1. exactly one closure per due claim, and one reducer event per closure;
 *   2. a claim whose frozen horizon has not arrived is still `active`, in every field;
 *   3. THE PARTITION IDENTITY, over the WHOLE index rather than over sampled keys.
 *
 * The third is the one worth the length. Spot-checking three keys would pass just as happily on a
 * pass that silently dropped a fourth, and a dropped claim is the exact accounting error this
 * ledger exists to prevent: it would leave a call unresolved while nothing in the output said so.
 * So the index is partitioned as SET ARITHMETIC — union covers every key, the three sets are
 * pairwise disjoint, the sizes sum to the whole, and each set is non-empty so the identity cannot
 * be satisfied by collapsing it. The same identity is then re-derived a SECOND time from the
 * resolver's OWN `notDue` report, which is the stronger statement: the resolver does not merely
 * leave the right entries alone, it accounts for every one it excluded.
 *
 * Nothing here reads a clock, and nothing here writes into the committed tree.
 * =========================================================================================== */

const {
    CLOSED_ENTRY_STATE,
    HORIZON_NOT_REACHED_REASON,
    LIVE_ENTRY_STATE,
    NOT_DUE_REASON,
    NOT_DUE_REMEDY,
    PREDICATE_SATISFIED_EVENT,
    SESSION_PREDICATE_KEY: E1_SESSION_PREDICATE_KEY,
    claimEntryBindings,
    closeDueClaims,
    loadCalendar,
    originRecommendationKeyFor,
    sessionsBy,
} = resolver;

const E1_ENTRY_SESSION = '2026-07-28';
const E1_AS_OF_SESSION = '2026-07-29';
const E1_LATER_SESSION = '2026-07-30';

/** The fixture ledger state: two due, two whose horizon has not arrived, one closed by an earlier pass. */
const E1_COHORT = Object.freeze([
    { symbol: 'E1DUEA', resolutionDate: E1_AS_OF_SESSION, bucket: 'closed-this-pass' },
    { symbol: 'E1DUEB', resolutionDate: E1_AS_OF_SESSION, bucket: 'closed-this-pass' },
    { symbol: 'E1LATEA', resolutionDate: E1_LATER_SESSION, bucket: 'still-active' },
    { symbol: 'E1LATEB', resolutionDate: E1_LATER_SESSION, bucket: 'still-active' },
    { symbol: 'E1PRIOR', resolutionDate: E1_AS_OF_SESSION, bucket: 'already-closed' },
]);

const E1_BUCKETS = Object.freeze(['closed-this-pass', 'still-active', 'already-closed']);

/** The frozen proposal terms the reducer requires beyond the derived ones. */
const E1_PROPOSAL_TERMS = Object.freeze({
    trigger: 'e2e-frozen-trigger',
    invalidation: 'e2e-frozen-invalidation',
    confidenceBand: 'e2e-frozen-band',
    confidenceScore: 0.5,
    rationaleEvidenceIds: ['e2e-frozen-evidence'],
});

function e1Claim(symbol, resolutionDate) {
    const fixture = structuredClone(loadClaimFixture('evaluable-instrument-add'));
    fixture.input.action.claim.resolvesTo = [symbol];
    fixture.input.action.claim.weighting = 'primary-only';
    fixture.input.action.claim.priceBasis = 'raw-close';
    fixture.input.binding.entryDate = E1_ENTRY_SESSION;
    fixture.input.binding.resolutionDate = resolutionDate;
    const minted = claims.mintClaim(mintInputFrom(fixture, { committedSeries: [symbol] }));
    assertEvaluable(minted, `${symbol}: the fixture claim must mint`);
    return minted.claim;
}

function e1Run(suffix) {
    return { runId: `run-${E1_AS_OF_SESSION}${suffix}`, occurredAt: `${E1_AS_OF_SESSION}T20:00:00.000Z`, canonicalMonth: E1_AS_OF_SESSION.slice(0, 7) };
}

function e1Verdict(claim) {
    return { claim, closureEventType: PREDICATE_SATISFIED_EVENT, reasonCode: 'predicate-satisfied' };
}

test('T-04-E1: a full resolve pass closes each due claim exactly once, leaves the not-yet-due active, and partitions the whole index', () => {
    const committedBefore = readBytes(path.join(REPO_ROOT, R1_PARTITION_REL));
    const registry = toolsRegistry();
    const foundation = createRequire(import.meta.url)('../rlcontracts.js');

    /* ---- 1. THE FIXTURE STATE, grounded in the committed calendar ------------------------- */

    // The three dates are real committed trading sessions, read through the resolver's own session
    // predicate. A horizon authored on a non-session would make "not yet due" a fact about a day
    // the market never opened, which is a different property than the one this row asserts.
    const sessions = sessionsBy(loadCalendar(REPO_ROOT), E1_SESSION_PREDICATE_KEY);
    assert.equal(sessions.ok, true, `the committed calendar must yield sessions: ${JSON.stringify(sessions.error ?? null)}`);
    for (const session of [E1_ENTRY_SESSION, E1_AS_OF_SESSION, E1_LATER_SESSION]) {
        assert.equal(sessions.tradingDates.includes(session), true, `${session}: must be a committed trading session`);
    }
    assert.equal(E1_ENTRY_SESSION < E1_AS_OF_SESSION && E1_AS_OF_SESSION < E1_LATER_SESSION, true, 'the fixture dates must be strictly ordered');

    const cohort = E1_COHORT.map((member) => ({ ...member, claim: e1Claim(member.symbol, member.resolutionDate) }));
    const derived = cohort.map((member) => {
        const key = originRecommendationKeyFor(member.claim, registry);
        assert.equal(key.ok, true, `${member.symbol}: the origin key must derive: ${JSON.stringify(key.error ?? null)}`);
        return { ...member, key: key.originRecommendationKey, terms: key.terms };
    });
    const keyOf = new Map(derived.map((member) => [member.symbol, member.key]));
    assert.equal(new Set(keyOf.values()).size, derived.length, 'every fixture claim must occupy its own lifecycle entry');

    // Proposed THROUGH THE SHIPPED REDUCER, so each entry has the shape the reducer itself writes.
    const proposed = foundation.reduceRecommendationEvents(
        null,
        derived.map((member) => ({ ...member.terms, ...E1_PROPOSAL_TERMS })),
        e1Run('-propose'),
    );
    assert.equal(proposed.ok, true, `the fixture proposals must reduce: ${JSON.stringify(proposed.error ?? null)}`);

    const bound = claimEntryBindings(
        derived.map((member) => ({ claim: member.claim, row: { [claims.CLAIM_REF_FIELD]: member.claim.claimHash } })),
        registry,
    );
    assert.equal(bound.ok, true, `the bindings must build: ${JSON.stringify(bound.error ?? null)}`);
    /* Every cohort series is observed through the LATER session, so the fourth due conjunct is
       satisfied throughout and the partition below stays a measurement of the lifecycle gate. */
    const gate = {
        asOfDate: E1_AS_OF_SESSION,
        bindings: bound.bindings,
        seriesAsOf: new Map(E1_COHORT.map((member) => [claims.seriesRefFor(member.symbol), E1_LATER_SESSION])),
        toolsRegistry: registry,
    };

    // An EARLIER pass closes exactly the one entry that must already be closed when the measured
    // pass runs. Authoring a `closed` entry by hand would test this row against a state the
    // reducer never produces; closing it through the same shipped path cannot drift from one.
    const prior = closeDueClaims({
        ...gate,
        index: proposed.value.index,
        verdicts: [e1Verdict(cohort.find((member) => member.bucket === 'already-closed').claim)],
        run: e1Run('-prior'),
    });
    assert.equal(prior.ok, true, `the prior pass must run: ${JSON.stringify(prior.error ?? null)}`);
    assert.equal(prior.closures.length, 1, 'the prior pass closes exactly the one entry it was given a verdict for');

    const before = prior.index;
    const expected = new Map(E1_BUCKETS.map((bucket) => [bucket, derived.filter((member) => member.bucket === bucket).map((member) => member.key).sort()]));
    for (const bucket of E1_BUCKETS) {
        assert.ok(expected.get(bucket).length > 0, `${bucket}: the fixture must populate every bucket — an empty one makes the partition trivial`);
    }
    for (const member of derived) {
        assert.equal(
            before.entries[member.key].state,
            member.bucket === 'already-closed' ? CLOSED_ENTRY_STATE : LIVE_ENTRY_STATE,
            `${member.symbol}: the fixture state must be what the buckets claim before the measured pass runs`,
        );
    }

    /* ---- 2. THE MEASURED PASS, offered a verdict for EVERY claim -------------------------- */

    const pass = closeDueClaims({ ...gate, index: before, verdicts: derived.map((member) => e1Verdict(member.claim)), run: e1Run('-measured') });
    assert.equal(pass.ok, true, `the resolve pass must run: ${JSON.stringify(pass.error ?? null)}`);
    assert.equal(pass.asOfDate, E1_AS_OF_SESSION, 'against the as-of date it was given');
    assert.equal(derived.length > pass.closures.length, true, 'the pass was offered more verdicts than it closed, so its selection is measured');

    /* ---- 3. EXACTLY ONE CLOSURE PER DUE CLAIM --------------------------------------------- */

    const closedKeys = pass.closures.map((closure) => closure.originRecommendationKey);
    assert.deepEqual([...closedKeys].sort(), expected.get('closed-this-pass'), 'the closures name exactly the due claims');
    assert.equal(new Set(closedKeys).size, closedKeys.length, 'and each due claim is closed ONCE — a repeat would count one call twice');
    assert.equal(pass.events.length, closedKeys.length, 'the reducer appends exactly one event per closure');
    assert.deepEqual(
        pass.events.map((event) => event.recommendationKey).sort(),
        [...closedKeys].sort(),
        'and each event names the entry its closure named',
    );
    for (const event of pass.events) {
        assert.equal(event.eventType, PREDICATE_SATISFIED_EVENT, `${event.recommendationKey}: of the verdict's own closure type`);
    }
    for (const key of closedKeys) {
        assert.equal(before.entries[key].state, LIVE_ENTRY_STATE, `${key}: was live before the pass — a closure may only come from a live entry`);
        assert.equal(pass.index.entries[key].state, CLOSED_ENTRY_STATE, `${key}: and the reducer transitioned it to closed`);
    }

    /* ---- 4. THE NOT-YET-DUE CLAIMS REMAIN ACTIVE ------------------------------------------ */

    for (const key of expected.get('still-active')) {
        assert.equal(pass.index.entries[key].state, LIVE_ENTRY_STATE, `${key}: a claim whose horizon has not arrived is still active`);
        assert.deepEqual(pass.index.entries[key], before.entries[key], `${key}: and its entry is unchanged in every field, not merely in state`);
    }
    for (const key of expected.get('already-closed')) {
        assert.deepEqual(pass.index.entries[key], before.entries[key], `${key}: an entry an earlier pass closed is left exactly as it was`);
    }

    /* ---- 5. THE PARTITION IDENTITY, over the WHOLE index ---------------------------------- */

    const allKeys = Object.keys(pass.index.entries).sort();
    assert.deepEqual(allKeys, Object.keys(before.entries).sort(), 'a closing pass mints no entry and drops none');
    assert.deepEqual(allKeys, [...keyOf.values()].sort(), 'and the index is exactly the fixture cohort');

    const partition = new Map([
        ['closed-this-pass', new Set(closedKeys)],
        ['still-active', new Set(allKeys.filter((key) => pass.index.entries[key].state === LIVE_ENTRY_STATE))],
        ['already-closed', new Set(allKeys.filter((key) => before.entries[key].state !== LIVE_ENTRY_STATE))],
    ]);

    // COVERING: the union is the whole index. A dropped claim fails here and nowhere else.
    const union = new Set([...partition.values()].flatMap((members) => [...members]));
    assert.deepEqual([...union].sort(), allKeys, 'every claim in the index falls in at least one bucket — none is silently dropped');

    // DISJOINT: no claim is in two. Asserted pairwise rather than by a count, so the message names
    // the two buckets that overlapped instead of only reporting that some total disagreed.
    for (const left of E1_BUCKETS) {
        for (const right of E1_BUCKETS) {
            if (left >= right) continue;
            const both = [...partition.get(left)].filter((key) => partition.get(right).has(key));
            assert.deepEqual(both, [], `${left} and ${right} must be disjoint, but share ${JSON.stringify(both)}`);
        }
    }

    // AND THE ARITHMETIC CLOSES. Covering plus disjoint already implies it; asserting it as well is
    // what makes a future bucket added without a matching set-membership rule fail immediately.
    assert.equal(
        E1_BUCKETS.reduce((running, bucket) => running + partition.get(bucket).size, 0),
        allKeys.length,
        'and the three bucket sizes sum to the whole index',
    );
    for (const bucket of E1_BUCKETS) {
        assert.deepEqual([...partition.get(bucket)].sort(), expected.get(bucket), `${bucket}: the derived bucket is the one the fixture authored`);
        assert.ok(partition.get(bucket).size > 0, `${bucket}: a bucket that emptied would satisfy the identity while asserting nothing`);
    }

    /* ---- 6. THE SAME PARTITION, RE-DERIVED FROM THE RESOLVER'S OWN REPORT ------------------ */

    // The stronger statement. Above, the buckets are read off the reduced index; here they are read
    // off what the pass SAID it did. A pass that quietly excluded an entry without reporting it
    // would satisfy section 5 and fail this one.
    const reportedNotDue = pass.notDue.map((entry) => entry.originRecommendationKey).sort();
    assert.equal(new Set(reportedNotDue).size, reportedNotDue.length, 'the exclusion report names each entry once');
    assert.deepEqual(
        [...new Set([...reportedNotDue, ...closedKeys])].sort(),
        allKeys,
        'the resolver own accounting covers the whole index: every entry is either closed by this pass or reported as excluded',
    );
    assert.deepEqual(
        reportedNotDue,
        [...expected.get('still-active'), ...expected.get('already-closed')].sort(),
        'and the entries it excluded are exactly the two non-closing buckets',
    );

    const reasonByKey = new Map(pass.notDue.map((entry) => [entry.originRecommendationKey, entry]));
    for (const key of expected.get('still-active')) {
        assert.equal(reasonByKey.get(key).reason, HORIZON_NOT_REACHED_REASON, `${key}: excluded because its horizon has not arrived`);
        assert.equal(reasonByKey.get(key).remedy, NOT_DUE_REMEDY[HORIZON_NOT_REACHED_REASON], `${key}: with the remedy that reason carries`);
        assert.equal(reasonByKey.get(key).resolutionDate, E1_LATER_SESSION, `${key}: naming the frozen date it is waiting on`);
    }
    for (const key of expected.get('already-closed')) {
        assert.equal(reasonByKey.get(key).reason, NOT_DUE_REASON, `${key}: excluded because its entry is no longer live`);
        assert.equal(reasonByKey.get(key).remedy, NOT_DUE_REMEDY[NOT_DUE_REASON], `${key}: with the remedy that reason carries`);
        assert.equal(reasonByKey.get(key).state, CLOSED_ENTRY_STATE, `${key}: and the state that excluded it`);
    }

    // Every verdict the pass declined is reported too, with the gate's own reason — so a verdict is
    // never swallowed between the caller and the ledger.
    assert.deepEqual(
        pass.skipped.map((entry) => entry.originRecommendationKey).sort(),
        reportedNotDue,
        'every declined verdict is reported, carrying the same key set the exclusion report named',
    );

    assertBytesUnchanged(committedBefore, readBytes(path.join(REPO_ROOT, R1_PARTITION_REL)), `${R1_PARTITION_REL} bytes`);
});

/* =============================================================================================
 * T-04-R1 — the scope-04 regression row. PERMANENT.
 *
 * Every later scope re-runs this file, so a scope that collapses the two predicate verdicts into
 * one, folds the four due-set exclusions back into a single "not due", teaches the data-quality
 * gate to discard a degraded session it should measure, or loosens the horizon comparison fails
 * HERE rather than silently.
 *
 * Five behaviours, each asserted by its own EXACT reason rather than by the fact that SOMETHING
 * was refused. "It threw" is not coverage. Four exclusions that all reported one reason would
 * satisfy a weaker row while telling an operator to wait for a date that can never matter, and
 * that collapse is precisely what this row exists to catch.
 *
 *   1-2. Both predicate verdicts resolve, record and close — and they DIFFER, in the closure
 *        event AND in the outcome class. A resolver returning one verdict for everything passes
 *        each half read alone and fails the pair.
 *   3.   The four due-set exclusions, each with its own reason and its own remedy. The reason
 *        SET is asserted against the shipped remedy table rather than against four strings
 *        named here, so a fifth exclusion added without a fixture fails instead of hiding. The
 *        two "wait" reasons are held apart by WHICH date is behind: `horizon-not-reached` is the
 *        RUN's, `series-not-yet-observed` is the SERIES' own `bars.asof`.
 *   4.   The three data-quality verdicts. Zero-observed CLOSES not-evaluable; reconstructed and
 *        thin each RESOLVE and carry their own date into the record's hashed provenance. A gate
 *        that refused all three would pass a row that only checked the refusal, so the two
 *        degraded cases assert a real record with a real class and the clean magnitude.
 *   5.   The horizon boundary, from BOTH sides: a claim resolving exactly ON the as-of date is
 *        due, one resolving one calendar day beyond it is excluded. The successor is derived by
 *        arithmetic and asserted, so "one day" is a measured relation rather than a second
 *        literal that could drift from the first.
 *
 * The four excluded members are offered a WELL-FORMED verdict, so each exclusion is attributable
 * to the gate rather than to a malformed input the pass would have dropped whatever it did.
 *
 * Every price, date and reason comes from a fixture or a shipped table. Nothing here reads a
 * clock, and nothing here writes into the committed tree.
 * =========================================================================================== */

const {
    ENTRY_UNBOUND_REASON,
    PREDICATE_INVALIDATED_EVENT,
    SERIES_NOT_OBSERVED_REASON,
    ZERO_OBSERVED_REASON,
    applyClosures,
    dueEntryKeys,
    evaluatePredicate,
    fenceObservations,
    outcomeValueFor,
    readBars,
    recordResolution,
    resolutionFor,
} = resolver;

const R4_BARS_FIXTURE_DIR = path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record', 'bars');

const R4_ENTRY_SESSION = '2026-07-28';
const R4_AS_OF_SESSION = '2026-07-29';
const R4_BEYOND_HORIZON = '2026-07-30';

/**
 * The closes the two fixture series DECLARE, asserted against the fixture files before any
 * expected return is computed from them. Pinning them is what keeps the magnitudes below
 * arithmetic over known prices instead of magic numbers, without re-deriving the return the way
 * the resolver does — which would make the assertion agree with any implementation at all.
 */
const R4_DECLARED_CLOSE = Object.freeze({
    DVG: { entry: 100, resolution: 110 },
    DVG2: { entry: 200, resolution: 190 },
});

/** Which exclusion each non-closing member must draw. Four buckets, four DIFFERENT reasons. */
const R4_EXCLUSION = Object.freeze({
    'excluded-wrong-state': NOT_DUE_REASON,
    'excluded-unbound': ENTRY_UNBOUND_REASON,
    'excluded-unmatured': HORIZON_NOT_REACHED_REASON,
    'excluded-unobserved': SERIES_NOT_OBSERVED_REASON,
});

/**
 * The cohort. Members 1-2 differ only in the SERIES they measure, so the satisfied/invalidated
 * split is attributable to the price path and not to two differently-authored predicates.
 * Members 3-6 are each excluded for one reason and one reason only.
 *
 * The last two are the pair the fourth conjunct exists to keep apart, and they differ in exactly
 * one fact: `excluded-unmatured` freezes a horizon the RUN has not reached, while
 * `excluded-unobserved` freezes one the run HAS reached over a SERIES that stops short of it.
 */
const R4_COHORT = Object.freeze([
    { bucket: 'closes-satisfied', family: 'r4-thesis-satisfied', symbol: 'DVG', resolutionDate: R4_AS_OF_SESSION, bound: true, closureEventType: PREDICATE_SATISFIED_EVENT, outcomeClass: 'win' },
    { bucket: 'closes-invalidated', family: 'r4-thesis-invalidated', symbol: 'DVG2', resolutionDate: R4_AS_OF_SESSION, bound: true, closureEventType: PREDICATE_INVALIDATED_EVENT, outcomeClass: 'loss' },
    { bucket: 'excluded-wrong-state', family: 'r4-thesis-wrong-state', symbol: 'DVG', resolutionDate: R4_AS_OF_SESSION, bound: true, closureEventType: null, outcomeClass: null },
    { bucket: 'excluded-unbound', family: 'r4-thesis-unbound', symbol: 'DVG', resolutionDate: R4_AS_OF_SESSION, bound: false, closureEventType: null, outcomeClass: null },
    { bucket: 'excluded-unmatured', family: 'r4-thesis-unmatured', symbol: 'DVG', resolutionDate: R4_BEYOND_HORIZON, bound: true, closureEventType: null, outcomeClass: null },
    { bucket: 'excluded-unobserved', family: 'r4-thesis-unobserved', symbol: 'DVGSTALE', resolutionDate: R4_AS_OF_SESSION, bound: true, closureEventType: null, outcomeClass: null },
]);

/** The one data-quality array each case sets, the session it sets it on, and the verdict owed. */
const R4_QUALITY_CASES = Object.freeze([
    { field: 'zeroObservedSessions', session: R4_ENTRY_SESSION, resolves: false },
    { field: 'reconstructedSessions', session: R4_ENTRY_SESSION, resolves: true },
    { field: 'thinObservedSessions', session: R4_AS_OF_SESSION, resolves: true },
]);

/** UTC calendar arithmetic on a fixture date. Nothing here consults the current time. */
function r4NextCalendarDay(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** The fixture series, optionally rewritten with the one data-quality array a case needs. */
function r4Bars(symbol, quality = {}) {
    const source = JSON.parse(fs.readFileSync(path.join(R4_BARS_FIXTURE_DIR, `${symbol}.json`), 'utf8'));
    return readBars(JSON.stringify({ ...source, ...quality }));
}

/** Keyed by `seriesRef` exactly as the value path reads them, fenced at the as-of session. */
function r4Fences(calendar, symbol, quality = {}) {
    return new Map([[claims.seriesRefFor(symbol), fenceObservations(calendar, r4Bars(symbol, quality), R4_AS_OF_SESSION)]]);
}

/**
 * How far each named series has been OBSERVED, read from the fixture file's own `asof` rather
 * than declared as a literal here. This is the fact the fourth conjunct turns on, so sourcing it
 * from the committed fixture is what makes the exclusion below a property of the data rather than
 * of a map this row hand-built to produce the answer it wanted.
 */
function r4SeriesAsOf(symbols) {
    return new Map(symbols.map((symbol) => [claims.seriesRefFor(symbol), r4Bars(symbol).asof]));
}

function r4Claim(member) {
    const fixture = structuredClone(loadClaimFixture('evaluable-instrument-add'));
    fixture.input.action.claim.resolvesTo = [member.symbol];
    fixture.input.action.claim.weighting = 'primary-only';
    fixture.input.action.claim.priceBasis = 'raw-close';
    fixture.input.action.claim.thesisFamily = member.family;
    fixture.input.binding.entryDate = R4_ENTRY_SESSION;
    fixture.input.binding.resolutionDate = member.resolutionDate;
    const minted = claims.mintClaim(mintInputFrom(fixture, { committedSeries: [member.symbol] }));
    assertEvaluable(minted, `${member.bucket}: the fixture claim must mint evaluable`);
    return minted.claim;
}

/** A verdict whose reason is READ from the shipped table, never restated as a literal here. */
function r4Verdict(claim, closureEventType) {
    const reasons = claims.CLOSURE_REASON_CODES[closureEventType];
    assert.equal(reasons.length, 1, `${closureEventType}: a predicate verdict carries exactly one shipped reason`);
    return { claim, closureEventType, reasonCode: reasons[0] };
}

test('T-04-R1: both verdicts close, each due-set exclusion keeps its own reason and remedy, each data-quality input its own verdict, and the horizon boundary is exact on both sides', () => {
    const committedBefore = readBytes(path.join(REPO_ROOT, R1_PARTITION_REL));
    const calendar = loadCalendar(REPO_ROOT);
    const registry = toolsRegistry();
    const foundation = createRequire(import.meta.url)('../rlcontracts.js');
    const closureVocabulary = claims.readClosureEventVocabulary(foundationSourceText());

    /* ---- 1. THE FIXTURE GROUND, asserted before anything is measured against it ------------ */

    const sessions = sessionsBy(calendar, E1_SESSION_PREDICATE_KEY);
    assert.equal(sessions.ok, true, `the committed calendar must yield sessions: ${JSON.stringify(sessions.error ?? null)}`);
    for (const session of [R4_ENTRY_SESSION, R4_AS_OF_SESSION, R4_BEYOND_HORIZON]) {
        assert.equal(sessions.tradingDates.includes(session), true, `${session}: must be a committed trading session`);
    }

    // THE BOUNDARY IS ONE DAY, MEASURED. Derived by arithmetic rather than asserted as a second
    // literal, so the two dates cannot drift apart and leave "one day beyond" quietly meaning two.
    assert.equal(r4NextCalendarDay(R4_AS_OF_SESSION), R4_BEYOND_HORIZON, 'the beyond-horizon date is the calendar-day successor of the as-of date');

    for (const symbol of Object.keys(R4_DECLARED_CLOSE)) {
        const rows = r4Bars(symbol).rows;
        assert.equal(rows.length, 2, `${symbol}: the fixture is the two-session window this row measures`);
        assert.equal(rows[0].c, R4_DECLARED_CLOSE[symbol].entry, `${symbol}: the declared entry close`);
        assert.equal(rows[1].c, R4_DECLARED_CLOSE[symbol].resolution, `${symbol}: the declared resolution close`);
    }
    const r4ExpectedValue = (symbol) => (R4_DECLARED_CLOSE[symbol].resolution / R4_DECLARED_CLOSE[symbol].entry - 1) * 100;

    // THE FRESHNESS GROUND, and the ONLY fact separating the last two exclusions. The two closing
    // series are observed through the as-of session; the stale one stops a session short of the
    // horizon its claim freezes, so the calendar has reached that horizon and the data has not.
    assert.equal(r4Bars('DVG').asof, R4_AS_OF_SESSION, 'DVG is observed through the as-of session');
    assert.equal(r4Bars('DVG2').asof, R4_AS_OF_SESSION, 'and so is DVG2');
    assert.equal(r4Bars('DVGSTALE').asof, R4_ENTRY_SESSION, 'while the stale fixture stops at the entry session');
    assert.equal(R4_ENTRY_SESSION < R4_AS_OF_SESSION, true, 'which is strictly earlier — that gap IS the fourth exclusion');
    assert.equal(r4Bars('DVGSTALE').rows.every((row) => row.t <= r4Bars('DVG').rows[0].t), true, 'and the file carries no row past the session it claims');

    /* ---- 2. THE COHORT, one lifecycle entry each ------------------------------------------- */

    const cohort = R4_COHORT.map((member) => {
        const claim = r4Claim(member);
        const derived = originRecommendationKeyFor(claim, registry);
        assert.equal(derived.ok, true, `${member.bucket}: the origin key must derive: ${JSON.stringify(derived.error ?? null)}`);
        assert.equal(claim.direction, 1, `${member.bucket}: the add family binds direction +1, so outcomeValue IS the subject return`);
        return { ...member, claim, key: derived.originRecommendationKey, terms: derived.terms };
    });
    assert.equal(new Set(cohort.map((member) => member.key)).size, cohort.length, 'every member occupies its own lifecycle entry');
    const byBucket = new Map(cohort.map((member) => [member.bucket, member]));
    assert.equal(byBucket.size, cohort.length, 'and every bucket names exactly one member');

    const proposed = foundation.reduceRecommendationEvents(null, cohort.map((member) => ({ ...member.terms, ...E1_PROPOSAL_TERMS })), e1Run('-r4-propose'));
    assert.equal(proposed.ok, true, `the fixture proposals must reduce: ${JSON.stringify(proposed.error ?? null)}`);

    // The wrong-state member is closed THROUGH THE REDUCER, so the state the first conjunct reads
    // is the reduction's own rather than one hand-set here and then tested against itself.
    const preClosed = applyClosures(
        proposed.value.index,
        [{ originRecommendationKey: byBucket.get('excluded-wrong-state').key, eventType: PREDICATE_SATISFIED_EVENT, reasonCode: claims.CLOSURE_REASON_CODES[PREDICATE_SATISFIED_EVENT][0] }],
        e1Run('-r4-prior'),
    );
    assert.equal(preClosed.ok, true, `the prior pass must run: ${JSON.stringify(preClosed.error ?? null)}`);
    const before = preClosed.index;
    assert.equal(before.entries[byBucket.get('excluded-wrong-state').key].state, CLOSED_ENTRY_STATE, 'the reducer closed the wrong-state entry');
    assert.equal(before.entries[byBucket.get('excluded-unbound').key].state, LIVE_ENTRY_STATE, 'and the unbound entry is still LIVE, so only its pointer can exclude it');

    /* ---- 3. THE BINDINGS. Only the unbound member's row carries no pointer ------------------ */

    const bound = claimEntryBindings(
        cohort.map((member) => ({ claim: member.claim, row: member.bound ? { [claims.CLAIM_REF_FIELD]: member.claim.claimHash } : {} })),
        registry,
    );
    assert.equal(bound.ok, true, `the bindings must build: ${JSON.stringify(bound.error ?? null)}`);
    assert.equal(bound.bindings.get(byBucket.get('excluded-unbound').key).claimRef, null, 'a row with no pointer binds a null claimRef — an answer, not an omission');
    assert.equal(bound.bindings.get(byBucket.get('closes-satisfied').key).claimRef, byBucket.get('closes-satisfied').claim.claimHash, 'and a bound row carries the claim own address');

    /* ---- 4. THE MEASURED PASS, offered a well-formed verdict for EVERY member --------------- */

    // The two closing members get the verdict their own PREDICATE decides; the three excluded
    // members are handed a valid satisfied verdict, so nothing about their input could explain
    // the exclusion. Only the gate can.
    const verdicts = cohort.map((member) => {
        if (member.closureEventType === null) return r4Verdict(member.claim, PREDICATE_SATISFIED_EVENT);
        const evaluated = evaluatePredicate(member.claim, r4Fences(calendar, member.symbol), calendar);
        assert.equal(evaluated.ok, true, `${member.bucket}: the frozen predicate must evaluate: ${JSON.stringify(evaluated.error ?? evaluated.closure)}`);
        assert.equal(evaluated.closureEventType, member.closureEventType, `${member.bucket}: the verdict the fixture price path decides`);
        assert.equal(evaluated.reasonCode, claims.CLOSURE_REASON_CODES[member.closureEventType][0], `${member.bucket}: on the shipped reason for that event`);
        assert.equal(evaluated.decidedAt, R4_AS_OF_SESSION, `${member.bucket}: decided at the resolution session`);
        return r4Verdict(member.claim, evaluated.closureEventType);
    });

    const pass = closeDueClaims({
        index: before,
        verdicts,
        asOfDate: R4_AS_OF_SESSION,
        bindings: bound.bindings,
        seriesAsOf: r4SeriesAsOf([...new Set(cohort.map((member) => member.symbol))]),
        toolsRegistry: registry,
        run: e1Run('-r4-measured'),
    });
    assert.equal(pass.ok, true, `the resolve pass must run: ${JSON.stringify(pass.error ?? null)}`);

    /* ---- 5. BOTH VERDICTS CLOSE, AND THEY DIFFER ------------------------------------------- */

    const closing = cohort.filter((member) => member.closureEventType !== null);
    assert.deepEqual(
        pass.closures.map((closure) => closure.originRecommendationKey).sort(),
        closing.map((member) => member.key).sort(),
        'exactly the two due members close',
    );
    assert.equal(pass.events.length, pass.closures.length, 'one reducer event per closure');

    const eventByKey = new Map(pass.events.map((event) => [event.recommendationKey, event]));
    for (const member of closing) {
        const closure = pass.closures.find((entry) => entry.originRecommendationKey === member.key);
        assert.equal(closure.eventType, member.closureEventType, `${member.bucket}: closes on its own verdict event`);
        assert.equal(closure.reasonCode, claims.CLOSURE_REASON_CODES[member.closureEventType][0], `${member.bucket}: carrying that event shipped reason`);
        assert.equal(eventByKey.get(member.key).eventType, member.closureEventType, `${member.bucket}: and the reducer appended that event`);
        assert.equal(before.entries[member.key].state, LIVE_ENTRY_STATE, `${member.bucket}: was live before the pass`);
        assert.equal(pass.index.entries[member.key].state, CLOSED_ENTRY_STATE, `${member.bucket}: and the reducer transitioned it to closed`);
    }

    // THE ANTI-VACUITY PAIR. A resolver that returned one verdict for every claim satisfies each
    // half above read alone; the two closures must be DIFFERENT facts, on both axes.
    assert.equal(new Set(closing.map((member) => member.closureEventType)).size, 2, 'the two closures are different closure events');
    assert.equal(new Set(closing.map((member) => member.outcomeClass)).size, 2, 'and fall in different outcome classes');

    /* ---- 6. AND EACH RECORDS, into a disposable store outside the repository ---------------- */

    const ledgerRow = committedV2Row();
    withDisposableStore(({ root, ports }) => {
        assert.equal(root.startsWith(REPO_ROOT), false, 'the disposable store must live outside the repository');

        for (const member of closing) {
            const outcome = outcomeValueFor(member.claim, r4Fences(calendar, member.symbol));
            assert.equal(outcome.ok, true, `${member.bucket}: the claim must measure: ${JSON.stringify(outcome.error ?? outcome.closure)}`);
            assert.equal(outcome.outcomeValue, r4ExpectedValue(member.symbol), `${member.bucket}: the exact unrounded return over the declared closes`);

            const recorded = recordResolution(
                {
                    claim: member.claim,
                    calendar,
                    closureVocabulary,
                    closureEventType: member.closureEventType,
                    reasonCode: claims.CLOSURE_REASON_CODES[member.closureEventType][0],
                    outcome,
                    // The lifecycle id the pass ITSELF appended, so the record names the event that
                    // closed the entry rather than a plausible identifier authored by this row.
                    eventId: eventByKey.get(member.key).eventId,
                    lifecycleBinding: { originRecommendationKey: member.key },
                },
                { ...ledgerRow, [claims.CLAIM_REF_FIELD]: member.claim.claimHash },
                ports,
            );
            assert.equal(recorded.ok, true, `${member.bucket}: the record must write: ${JSON.stringify(recorded.error ?? null)}`);
            assert.equal(recorded.written, true, `${member.bucket}: and actually reach the store`);
            assert.equal(recorded.resolution.closureEventType, member.closureEventType, `${member.bucket}: recording its closure event`);
            assert.equal(recorded.resolution.outcomeClass, member.outcomeClass, `${member.bucket}: and the class its magnitude fell in`);
            assert.equal(claims.MAGNITUDE_BEARING_OUTCOME_CLASSES.includes(member.outcomeClass), true, `${member.bucket}: which is a shipped magnitude-bearing class`);
            assert.equal(recorded.resolution.outcomeValue, outcome.outcomeValue, `${member.bucket}: carrying the measured value verbatim`);
            assert.equal(fs.existsSync(path.join(root, recorded.path)), true, `${member.bucket}: the object is on disk at its content address`);
        }
    });

    /* ---- 7. THE FOUR EXCLUSIONS, EACH DISTINCT --------------------------------------------- */

    const excludedByKey = new Map(pass.notDue.map((entry) => [entry.originRecommendationKey, entry]));
    assert.deepEqual(
        [...excludedByKey.keys()].sort(),
        Object.keys(R4_EXCLUSION).map((bucket) => byBucket.get(bucket).key).sort(),
        'exactly the four non-closing members are excluded',
    );

    for (const [bucket, reason] of Object.entries(R4_EXCLUSION)) {
        const excluded = excludedByKey.get(byBucket.get(bucket).key);
        assert.equal(excluded.reason, reason, `${bucket}: excluded for its own reason`);
        assert.equal(excluded.remedy, NOT_DUE_REMEDY[reason], `${bucket}: with the remedy that reason carries`);
    }

    // DISTINCT, not merely all excluded. These are four different FUTURES — a ledger event, a
    // later run date, a later series refresh, and never — so collapsing any two would tell an
    // operator to wait for a fact that can make no difference. Asserted on both the reason and the
    // remedy, and the reason set is compared against the shipped remedy table so a fifth exclusion
    // cannot land untested.
    const drawnReasons = Object.values(R4_EXCLUSION);
    assert.equal(new Set(drawnReasons).size, drawnReasons.length, 'the four exclusions name four different reasons');
    assert.equal(new Set(drawnReasons.map((reason) => NOT_DUE_REMEDY[reason])).size, drawnReasons.length, 'and promise four different remedies');
    assert.deepEqual([...drawnReasons].sort(), Object.keys(NOT_DUE_REMEDY).sort(), 'and are exactly the shipped exclusion set — a fifth reason fails here rather than going untested');

    // Each declined verdict is reported with the gate's own reason, so a verdict is never swallowed
    // between the caller and the ledger.
    const skippedByKey = new Map(pass.skipped.map((entry) => [entry.originRecommendationKey, entry]));
    for (const [bucket, reason] of Object.entries(R4_EXCLUSION)) {
        assert.equal(skippedByKey.get(byBucket.get(bucket).key).reason, reason, `${bucket}: the declined verdict is reported with the same reason`);
    }

    /* ---- 7b. THE TWO "WAIT" REASONS ARE NOT ONE REASON ------------------------------------- */

    // They differ in WHICH date is behind, and each exclusion carries both dates, so the
    // distinction is read off the gate's own output rather than inferred from the reason string.
    const unmatured = excludedByKey.get(byBucket.get('excluded-unmatured').key);
    const unobserved = excludedByKey.get(byBucket.get('excluded-unobserved').key);
    assert.equal(unmatured.asOfDate < unmatured.resolutionDate, true, 'horizon-not-reached: the RUN date has not reached the horizon');
    assert.equal(unobserved.asOfDate >= unobserved.resolutionDate, true, 'series-not-yet-observed: the run date HAS reached it, so the calendar is not the cause');
    assert.equal(unobserved.observedThrough < unobserved.resolutionDate, true, 'and only the SERIES stops short of that horizon');
    assert.equal(unobserved.observedThrough, r4Bars('DVGSTALE').asof, 'the gate reports the fixture own asof, not a value derived here');

    /* AND THE CLOCK SEPARATES THEM. Re-gate the SAME index, SAME bindings and SAME series map,
       moving ONLY the run's as-of date one calendar day forward. The horizon exclusion is cured
       and immediately exposes the stale series underneath it, while the series exclusion does not
       move — no later run date makes a series that stopped short observable. A gate that answered
       one reason for both facts could not produce this divergence, which is why the two must not
       be collapsed: their remedies point at different things. */
    const later = dueEntryKeys(before, {
        asOfDate: R4_BEYOND_HORIZON,
        bindings: bound.bindings,
        seriesAsOf: r4SeriesAsOf([...new Set(cohort.map((member) => member.symbol))]),
    });
    assert.equal(later.ok, true, `the later gate must run: ${JSON.stringify(later.error ?? null)}`);
    const laterReason = new Map(later.notDue.map((entry) => [entry.originRecommendationKey, entry.reason]));
    assert.equal(laterReason.get(byBucket.get('excluded-unmatured').key), SERIES_NOT_OBSERVED_REASON, 'a later run date cures the horizon and reveals the series behind it');
    assert.notEqual(unmatured.reason, laterReason.get(byBucket.get('excluded-unmatured').key), 'so one entry drew TWO different reasons on two run dates — the two are not one reason');
    assert.equal(unobserved.reason, laterReason.get(byBucket.get('excluded-unobserved').key), 'while the series reason is the one the clock cannot cure');
    assert.equal(NOT_DUE_REMEDY[HORIZON_NOT_REACHED_REASON] !== NOT_DUE_REMEDY[SERIES_NOT_OBSERVED_REASON], true, 'and they promise different remedies');

    /* AND THE STALE SERIES WRITES NOTHING. This is the whole point of the conjunct: a claim whose
       series stopped short must not close `unresolved`, which would append a measurement nobody
       could take into the permanent ledger. */
    const staleKey = byBucket.get('excluded-unobserved').key;
    assert.equal(pass.closures.some((closure) => closure.originRecommendationKey === staleKey), false, 'the unobserved member does not close');
    assert.equal(pass.events.some((event) => event.recommendationKey === staleKey), false, 'and no lifecycle event is appended for it');
    assert.equal(pass.index.entries[staleKey].state, LIVE_ENTRY_STATE, 'its entry stays live, waiting for a series refresh');
    assert.deepEqual(pass.index.entries[staleKey], before.entries[staleKey], 'unchanged in every field, not merely in state');

    /* ---- 8. THE HORIZON BOUNDARY, FROM BOTH SIDES ------------------------------------------ */

    // This is the comparison a stubbed conjunct used to swallow, so both sides are asserted. The
    // two members differ ONLY in the frozen resolution date: one exactly ON the as-of date, one a
    // single calendar day past it.
    const onBoundary = byBucket.get('closes-satisfied');
    const pastBoundary = byBucket.get('excluded-unmatured');
    assert.equal(bound.bindings.get(onBoundary.key).resolutionDate, R4_AS_OF_SESSION, 'the due member resolves exactly ON the as-of date');
    assert.equal(bound.bindings.get(pastBoundary.key).resolutionDate, R4_BEYOND_HORIZON, 'the excluded member resolves one calendar day beyond it');
    assert.equal(pass.closures.some((closure) => closure.originRecommendationKey === onBoundary.key), true, 'equal to the as-of date IS due');
    assert.equal(pass.closures.some((closure) => closure.originRecommendationKey === pastBoundary.key), false, 'and one day beyond is NOT');
    assert.equal(excludedByKey.get(pastBoundary.key).reason, HORIZON_NOT_REACHED_REASON, 'excluded for the horizon rather than for its state or its pointer');
    assert.equal(excludedByKey.get(pastBoundary.key).state, LIVE_ENTRY_STATE, 'while its entry is live');
    assert.equal(excludedByKey.get(pastBoundary.key).claimRef, pastBoundary.claim.claimHash, 'and its row carries a pointer — the date is the only thing holding it back');
    assert.equal(pass.index.entries[pastBoundary.key].state, LIVE_ENTRY_STATE, 'so it stays active, waiting for a later pass');
    assert.deepEqual(pass.index.entries[pastBoundary.key], before.entries[pastBoundary.key], 'unchanged in every field, not merely in state');

    /* ---- 9. THE DATA-QUALITY GATE, THREE INPUTS AND THREE DIFFERENT VERDICTS ---------------- */

    const qualityMember = byBucket.get('closes-satisfied');
    const cleanValue = r4ExpectedValue(qualityMember.symbol);
    const qualityFields = R4_QUALITY_CASES.map((qualityCase) => qualityCase.field);
    assert.equal(new Set(qualityFields).size, qualityFields.length, 'the three cases set three different arrays');

    for (const qualityCase of R4_QUALITY_CASES) {
        const label = `${qualityCase.field}@${qualityCase.session}`;
        const measured = outcomeValueFor(qualityMember.claim, r4Fences(calendar, qualityMember.symbol, { [qualityCase.field]: [qualityCase.session] }));

        if (!qualityCase.resolves) {
            // NOTHING TRADED, so there is no return to compute — and it is a CLOSURE about the
            // claim, not an `RTR-*` refusal about our substrate.
            assert.equal(measured.ok, false, `${label}: a zero-observed session in the window must not score`);
            assert.equal(measured.error, undefined, `${label}: it is a fact about the claim, not a substrate refusal`);
            assert.equal(measured.closure.closureEventType, 'not-evaluable', `${label}: closes not-evaluable`);
            assert.equal(measured.closure.reasonCode, ZERO_OBSERVED_REASON, `${label}: on the shipped reason`);
            assert.equal(measured.closure.field, `observations.${qualityMember.symbol}.${qualityCase.session}`, `${label}: naming the session that did not trade`);
            continue;
        }

        /* A REPAIRED OR THIN SESSION DID TRADE. Discarding it would throw away a real measurement,
           so it must produce a RECORD — asserted here rather than assumed, because a gate that
           refused all three would satisfy the refusal above and nothing else. */
        assert.equal(measured.ok, true, `${label}: a degraded session traded, so it must still score`);
        assert.equal(measured.outcomeValue, cleanValue, `${label}: and score exactly what a clean read scores`);

        const built = resolutionFor({
            claim: qualityMember.claim,
            calendar,
            closureVocabulary,
            closureEventType: qualityMember.closureEventType,
            reasonCode: claims.CLOSURE_REASON_CODES[qualityMember.closureEventType][0],
            outcome: measured,
            eventId: eventByKey.get(qualityMember.key).eventId,
            lifecycleBinding: { originRecommendationKey: qualityMember.key },
        });
        assert.equal(built.ok, true, `${label}: a degraded read must still build a record: ${JSON.stringify(built.error ?? null)}`);
        assert.equal(built.resolution.outcomeClass, qualityMember.outcomeClass, `${label}: in the class the clean read falls in`);
        assert.equal(built.resolution.outcomeValue, cleanValue, `${label}: carrying the clean magnitude`);

        // AND THE SOURCING IS RECORDED, in the HASHED provenance, on its OWN field. A reader can
        // weigh the number against how it was sourced, and the two degradations never merge.
        assert.deepEqual(built.resolution.provenance[qualityCase.field], [qualityCase.session], `${label}: the degraded session is carried into provenance`);
        for (const other of qualityFields) {
            if (other === qualityCase.field || other === 'zeroObservedSessions') continue;
            assert.deepEqual(built.resolution.provenance[other], [], `${label}: and the other degradation is not invented`);
        }
    }

    assertBytesUnchanged(committedBefore, readBytes(path.join(REPO_ROOT, R1_PARTITION_REL)), `${R1_PARTITION_REL} bytes`);
});
