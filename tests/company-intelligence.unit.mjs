/*
 * Company multi-horizon intelligence composition — Node unit surface (feature 025 scope 1).
 *
 * Every assertion exercises the REAL production functions imported from the owning module and
 * asserts on values the module computed. Nothing here re-implements a composition rule, and no
 * assertion checks a value the test itself supplied.
 *
 * Run: node --test tests/company-intelligence.unit.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require_ = createRequire(import.meta.url);
const INTEL = require_('../rlcompanyintel.js');
const CONTRACTS = require_('../rlcontracts.js');
const PUBLICATION_CONFIG = JSON.parse(readFileSync(join(ROOT, 'company-intelligence.config.json'), 'utf8'));
const MODULE_SOURCE = readFileSync(join(ROOT, 'rlcompanyintel.js'), 'utf8');
const ROUTE_SOURCE = readFileSync(join(ROOT, 'company-intelligence-lab.html'), 'utf8');
const PUBLICATION_MODULE_SOURCE = readFileSync(join(ROOT, 'scripts', 'company-intelligence-publication.mjs'), 'utf8');
const LEGACY_CONFIG_BLOCK = /<script type="application\/json" data-embedded-config="company-intelligence\.config\.json">([\s\S]*?)<\/script>/
    .exec(ROUTE_SOURCE);
assert.ok(LEGACY_CONFIG_BLOCK, 'the excluded Feature 025 route retains its v1 configuration cache');
const CONFIG = JSON.parse(LEGACY_CONFIG_BLOCK[1]);

const DECISION_TIME = '2026-08-18T00:00:00.000Z';
const SESSION_MS = 86400000;

const SEC_COMPANIES = [{ ticker: 'MSFT', cik: '0000789019', displayName: 'Microsoft Corporation' }];

/* A deterministic committed-bar series. `shape` drives the trailing direction so a test can ask
   for a rising or falling leg without hand-writing closes the module would then read back. */
function bars({ sessions = 300, start = 100, step = 0.5, endDate = '2026-08-17', skipEvery = 0 } = {}) {
    const endEpoch = Date.parse(endDate + 'T20:00:00.000Z');
    const rows = [];
    for (let index = 0; index < sessions; index += 1) {
        if (skipEvery > 0 && index % skipEvery === 0) continue;
        rows.push({
            t: endEpoch - (sessions - 1 - index) * SESSION_MS,
            c: start + step * index
        });
    }
    return rows;
}

function stubData({ barsBySymbol = {}, toolReads = {}, macro = null, optionsChains = {} } = {}) {
    const written = {};
    return {
        written,
        bars: (symbol) => (Object.prototype.hasOwnProperty.call(barsBySymbol, symbol) ? barsBySymbol[symbol] : null),
        options: (symbol) => (Object.prototype.hasOwnProperty.call(optionsChains, symbol) ? optionsChains[symbol] : null),
        macro: () => macro,
        toolRead: (id) => {
            if (Object.prototype.hasOwnProperty.call(written, id)) return written[id];
            return Object.prototype.hasOwnProperty.call(toolReads, id) ? toolReads[id] : null;
        },
        putToolRead: (id, object) => {
            written[id] = JSON.parse(JSON.stringify(object));
            return written[id];
        }
    };
}

/* A data stub that drops one key on write, exactly as putToolRead's legacy fall-through does. */
function lossyData(dropKey) {
    const base = stubData();
    return Object.assign({}, base, {
        putToolRead: (id, object) => {
            const stored = JSON.parse(JSON.stringify(object));
            delete stored[dropKey];
            base.written[id] = stored;
            return stored;
        }
    });
}

const REGISTRY = INTEL.readCoverageRegistry(CONFIG);

function subjectOf(ticker = 'MSFT', extra = {}) {
    return INTEL.resolveSubject(ticker, Object.assign({ secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime: DECISION_TIME }, extra));
}

function sourcesOf(extra = {}) {
    return Object.assign({
        registry: REGISTRY,
        secCompanies: SEC_COMPANIES,
        benchmarkSymbol: 'SPY',
        publishedRegimeContext: { available: false },
        maxBranches: REGISTRY.maxBranches,
        decisionTime: DECISION_TIME
    }, extra);
}

function composeAll(bundle) {
    const partition = INTEL.partitionByHorizon(bundle);
    return [
        INTEL.composeImmediate(partition.tactical, REGISTRY, DECISION_TIME),
        INTEL.composeEvent(partition.event, REGISTRY, DECISION_TIME),
        INTEL.composeSwing(partition.swing, REGISTRY, DECISION_TIME),
        INTEL.composeStructural(partition.structural, REGISTRY, DECISION_TIME)
    ];
}

/* The default fixture: both performance adapters agree, so the dimension reads current, and the
   four tactical contributors with no shared owner stay unavailable. */
function richBundle() {
    const data = stubData({
        barsBySymbol: {
            MSFT: bars({ sessions: 300, start: 100, step: 0.9 }),
            SPY: bars({ sessions: 300, start: 400, step: 0.2 })
        },
        toolReads: {
            'volatility-sizing-lab': {
                id: 'volatility-sizing-lab',
                asOf: '2026-08-15T00:00:00.000Z',
                metrics: { subjectId: 'company:msft', volPercentile: 38.4 }
            },
            'research-agenda-lab': {
                id: 'research-agenda-lab',
                asOf: '2026-08-14T00:00:00.000Z',
                read: 'Two supply topics remain open.',
                metrics: { escalationCount: 2 }
            }
        },
        macro: null
    });
    const subject = subjectOf();
    const sources = sourcesOf({
        fundamentalsRead: {
            subjectId: 'company:msft',
            asOf: '2026-06-30',
            sourceName: 'SEC company facts publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '25400.000', unit: 'usd-millions' }]
        },
        derivedMetrics: [{ metricId: 'fcf-yield', label: 'Free cash flow yield', value: '3.100', unit: 'percent', asOf: '2026-06-30' }],
        valuationSignal: 'constructive'
    });
    return { subject, sources, data, bundle: INTEL.runAdapters(subject, sources, DECISION_TIME, data) };
}

/* A benchmark that misses one session in five moves the aligned window, so the two performance
   adapters genuinely disagree on the same value identity and the dimension turns conflicted. */
function conflictedBundle() {
    const data = stubData({
        barsBySymbol: {
            MSFT: bars({ sessions: 300, start: 100, step: 0.9 }),
            SPY: bars({ sessions: 300, start: 400, step: 0.2, skipEvery: 5 })
        }
    });
    const subject = subjectOf();
    return { subject, data, bundle: INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, data) };
}

/* Price history that stopped publishing months ago, so the dimension ages past its window. */
function staleBundle() {
    const data = stubData({ barsBySymbol: { MSFT: bars({ sessions: 300, endDate: '2026-05-01' }) } });
    const subject = subjectOf();
    return { subject, data, bundle: INTEL.runAdapters(subject, sourcesOf({ benchmarkSymbol: null }), DECISION_TIME, data) };
}

/* ---------- 1.1 ---------- */

test('coverage account holds one row per registry dimension and totals sum to the registry length', () => {
    const { bundle } = richBundle();
    const account = INTEL.buildCoverageAccount(bundle, REGISTRY);

    assert.equal(REGISTRY.rows.length, 15);
    assert.equal(account.rows.length, REGISTRY.rows.length);
    assert.deepEqual(
        account.rows.map((row) => row.dimensionId).sort(),
        REGISTRY.rows.map((row) => row.dimensionId).sort()
    );
    const summed = INTEL.EVIDENCE_STATES.reduce((total, state) => total + account.totals[state], 0);
    assert.equal(summed, REGISTRY.rows.length);
    account.rows.forEach((row) => {
        assert.ok(INTEL.EVIDENCE_STATES.includes(row.state), row.dimensionId + ' carries state ' + row.state);
        if (row.state === 'current') assert.equal(row.reasonCode, null);
        else assert.ok(INTEL.REASON_CODES.includes(row.reasonCode), row.dimensionId + ' reason ' + row.reasonCode);
    });
    assert.deepEqual(
        REGISTRY.rows.map((row) => row.dimensionId).sort(),
        INTEL.MANDATORY_DIMENSION_IDS.slice().sort()
    );
});

/* The closed evidence-state vocabulary, written out rather than read back from the module, so a
   sixth state added later fails this test instead of being waved through by EVIDENCE_STATES. */
const CLOSED_EVIDENCE_STATES = ['current', 'partial', 'stale', 'conflicted', 'unavailable'];

test('SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary', () => {
    assert.deepEqual(INTEL.EVIDENCE_STATES.slice().sort(), CLOSED_EVIDENCE_STATES.slice().sort(),
        'the module publishes exactly the five-word closed vocabulary');

    const subject = subjectOf();
    const data = stubData({
        barsBySymbol: {
            MSFT: bars({ sessions: 300, start: 100, step: 0.9 }),
            SPY: bars({ sessions: 300, start: 400, step: 0.2 })
        },
        optionsChains: {
            MSFT: { asOf: '2026-08-15', expiries: [{ expiry: '2026-09-18', calls: 42, puts: 39 }] }
        }
    });
    const bundle = INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, data);
    const account = INTEL.buildCoverageAccount(bundle, REGISTRY);

    /* The fixture really carries both halves the scenario names, so this is not the bars-only run. */
    assert.ok(bundle.reads.find((read) => read.dimensionId === 'performance').values.length > 0,
        'the committed bars answered the performance dimension');
    const optionsStructure = bundle.reads.find((read) => read.dimensionId === 'options-structure');
    assert.ok(optionsStructure.limitations.some((line) => line.includes('An options chain is cached for MSFT')),
        'the cached chain reached the options adapter: ' + optionsStructure.limitations.join(' | '));

    /* The emitted id set equals the fifteen mandatory ids exactly — no omission and no extra. */
    assert.equal(INTEL.MANDATORY_DIMENSION_IDS.length, 15);
    assert.deepEqual(
        account.rows.map((row) => row.dimensionId).slice().sort(),
        INTEL.MANDATORY_DIMENSION_IDS.slice().sort()
    );
    INTEL.MANDATORY_DIMENSION_IDS.forEach((dimensionId) => {
        const row = account.rows.find((entry) => entry.dimensionId === dimensionId);
        assert.ok(row, dimensionId + ' is present in the coverage account');
        assert.ok(CLOSED_EVIDENCE_STATES.includes(row.state),
            dimensionId + ' carries the out-of-vocabulary state ' + row.state);
    });
    /* Non-vacuous: the membership check really rejects a word outside the five. */
    assert.ok(!CLOSED_EVIDENCE_STATES.includes('probably-current'));
});

test('every one of the five evidence states is produced by a real adapter outcome', () => {
    const answered = INTEL.buildCoverageAccount(richBundle().bundle, REGISTRY);
    const conflicted = INTEL.buildCoverageAccount(conflictedBundle().bundle, REGISTRY);
    const aged = INTEL.buildCoverageAccount(staleBundle().bundle, REGISTRY);
    const seen = new Set();
    [answered, conflicted, aged].forEach((account) => {
        INTEL.EVIDENCE_STATES.forEach((state) => {
            if (account.totals[state] > 0) seen.add(state);
        });
    });
    INTEL.EVIDENCE_STATES.forEach((state) => {
        assert.ok(seen.has(state), 'state ' + state + ' is produced by a real adapter outcome');
    });
    /* Named, so a later edit that collapses two of them fails here rather than silently. */
    assert.equal(answered.rows.find((row) => row.dimensionId === 'performance').state, 'current');
    assert.equal(answered.rows.find((row) => row.dimensionId === 'fundamentals').state, 'current');
    assert.equal(answered.rows.find((row) => row.dimensionId === 'valuation').state, 'partial');
    assert.equal(answered.rows.find((row) => row.dimensionId === 'company-risk').state, 'unavailable');
    assert.equal(conflicted.rows.find((row) => row.dimensionId === 'performance').state, 'conflicted');
    assert.equal(aged.rows.find((row) => row.dimensionId === 'performance').state, 'stale');
});

test('a read aged past its window stays in the denominator as stale rather than becoming neutral', () => {
    const { bundle } = staleBundle();
    const account = INTEL.buildCoverageAccount(bundle, REGISTRY);
    const performance = bundle.reads.find((read) => read.dimensionId === 'performance');

    assert.equal(performance.state, 'stale');
    assert.equal(performance.reasonCode, 'read-aged-past-window');
    assert.ok(performance.ageDays > REGISTRY.rows.find((row) => row.dimensionId === 'performance').freshnessWindowDays);
    /* Still counted: the account holds every dimension and the totals still sum to the registry. */
    assert.equal(account.rows.length, REGISTRY.rows.length);
    assert.equal(account.totals.stale, 1);
    assert.equal(INTEL.EVIDENCE_STATES.reduce((total, state) => total + account.totals[state], 0), REGISTRY.rows.length);
    /* And it never becomes a neutral value: it keeps its number and reaches no horizon. */
    assert.ok(performance.values.length > 0);
    assert.equal(performance.directionalSignal, null);
    composeAll(bundle).forEach((horizon) => {
        assert.ok(!horizon.contributingDimensionIds.includes('performance'), horizon.horizonId);
    });
});

/* ---------- 1.2 ---------- */

test('non-financial event dimension reads unavailable with no-source-exists and carries no value', () => {
    const { bundle } = richBundle();
    const read = bundle.reads.find((entry) => entry.dimensionId === 'non-financial-events');

    assert.equal(read.state, 'unavailable');
    assert.equal(read.reasonCode, 'no-source-exists');
    assert.deepEqual(read.values, []);
    assert.equal(read.sourceClass, 'none');
    assert.ok(read.limitations[0].length > 20);
});

test('an unavailable dimension never renders as a zero or a neutral number', () => {
    const { bundle } = richBundle();
    const unavailable = bundle.reads.filter((read) => read.state === 'unavailable');

    assert.ok(unavailable.length >= 1);
    unavailable.forEach((read) => {
        assert.deepEqual(read.values, [], read.dimensionId + ' publishes no value');
        assert.equal(read.directionalSignal, null, read.dimensionId + ' carries no direction');
        assert.equal(read.asOf, null, read.dimensionId + ' carries no as-of date');
        assert.equal(read.ageDays, null, read.dimensionId + ' carries no age');
        assert.ok(INTEL.REASON_CODES.includes(read.reasonCode), read.dimensionId + ' names its reason');
        const serialized = JSON.stringify(read);
        assert.ok(!/"value":\s*(0|"0(\.0+)?")/.test(serialized), read.dimensionId + ' emits no zero value');
    });
});

/* ---------- 1.3 ---------- */

test('an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon', () => {
    const refusal = INTEL.resolveSubject('ZZZZ', { secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime: DECISION_TIME });

    assert.equal(refusal.contractVersion, 'company-intel-error/v1');
    assert.equal(refusal.code, 'C025-IDENTITY-UNRESOLVED');
    assert.ok(refusal.message.length > 20);
    /* A refusal is not a subject, so no composition step will accept it. */
    assert.throws(
        () => INTEL.runAdapters(refusal, sourcesOf(), DECISION_TIME, stubData()),
        (error) => error.code === 'C025-READ-CONTRACT'
    );
    assert.equal(INTEL.resolveSubject('   ', {}).code, 'C025-IDENTITY-UNRESOLVED');

    /* ADVERSARIAL — a non-ticker character never becomes a subject. Per P13 this route holds
       tickers only, and an accepted `?` would then be handed to the owner deep-link composer,
       which builds `<route>.html?<param>=<value>`. The refusal happens at the identity boundary,
       so a resolved subject that reaches an href cannot carry query syntax in the first place. */
    ['MSFT?', 'MSFT?x=1', 'MS FT', 'MSFT&x', 'MSFT#a', '?MSFT'].forEach((entry) => {
        const rejected = INTEL.resolveSubject(entry, { secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime: DECISION_TIME });
        assert.equal(rejected.contractVersion, 'company-intel-error/v1', entry + ' resolved as a subject');
        assert.equal(rejected.code, 'C025-IDENTITY-UNRESOLVED', entry);
    });
    /* Counter-case: the guard is not refusing everything — the plain ticker still resolves. */
    assert.equal(INTEL.resolveSubject('MSFT', { secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime: DECISION_TIME }).ticker, 'MSFT');
});

/* ---------- 1.4 ---------- */

test('a company outside every corpus yields four horizons with absent quality and none direction', () => {
    const subject = INTEL.resolveSubject('ZYX', { secCompanies: [], barSymbols: ['ZYX'], decisionTime: DECISION_TIME });
    assert.equal(subject.identityBasis, 'committed-bars');

    const bundle = INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, stubData());
    const horizons = composeAll(bundle);

    assert.equal(horizons.length, 4);
    assert.deepEqual(horizons.map((horizon) => horizon.horizonId).sort(), INTEL.HORIZON_IDS.slice().sort());
    horizons.forEach((horizon) => {
        assert.equal(horizon.direction, 'none', horizon.horizonId);
        assert.equal(horizon.evidenceQuality, 'absent', horizon.horizonId);
        assert.deepEqual(horizon.claims, [], horizon.horizonId);
        assert.ok(horizon.gapEffect.length > 20, horizon.horizonId);
        assert.ok(horizon.summary.includes('No eligible evidence'), horizon.horizonId);
    });
    assert.equal(INTEL.buildCoverageAccount(bundle, REGISTRY).totals.unavailable, REGISTRY.rows.length);
});

/* ---------- 1.5 ---------- */

test('every claim cites a value present in its own horizon input set', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    const horizons = composeAll(bundle);
    const setByHorizon = {
        immediate: partition.tactical,
        event: partition.event,
        swing: partition.swing,
        structural: partition.structural
    };

    let checkedClaims = 0;
    horizons.forEach((horizon) => {
        const own = new Set();
        setByHorizon[horizon.horizonId].forEach((read) => read.values.forEach((value) => own.add(value.valueId)));
        horizon.claims.forEach((claim) => {
            assert.ok(claim.supportingValueIds.length > 0, claim.claimId);
            claim.supportingValueIds.forEach((valueId) => {
                assert.ok(own.has(valueId), claim.claimId + ' cites ' + valueId);
                checkedClaims += 1;
            });
        });
    });
    assert.ok(checkedClaims > 0, 'at least one claim was actually checked');
});

test('a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    /* Hand the structural composer a read that declares a shorter maximum horizon. The composer
       must refuse the set rather than compose from evidence the partition would have removed. */
    const tacticalOnly = partition.tactical.filter((read) => read.maxHorizon === 'tactical');
    assert.ok(tacticalOnly.length > 0, 'the fixture really contains a tactical-only read');

    assert.throws(
        () => INTEL.composeStructural(partition.structural.concat(tacticalOnly), REGISTRY, DECISION_TIME),
        (error) => error.code === 'C025-HORIZON-ISOLATION'
    );
});

/* ---------- 1.6 ---------- */

test('four unavailable contributors downgrade evidence quality and populate gapEffect', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    const withGaps = INTEL.composeImmediate(partition.tactical, REGISTRY, DECISION_TIME);

    assert.ok(withGaps.unavailableDimensionIds.length >= 4, 'the fixture really leaves four contributors absent');
    assert.notEqual(withGaps.direction, 'none');
    assert.ok(withGaps.gapEffect.includes('did not reach this read'));
    withGaps.unavailableDimensionIds.forEach((dimensionId) => {
        assert.ok(withGaps.gapEffect.includes(dimensionId), 'gapEffect names ' + dimensionId);
    });

    /* The same signalled evidence with the gaps filled reaches a strictly higher quality, so the
       downgrade is a real consequence of the gaps rather than a constant. */
    const filled = partition.tactical.map((read) => {
        if (read.state === 'current' || read.state === 'partial') return read;
        return JSON.parse(JSON.stringify(Object.assign({}, read, {
            state: 'partial',
            reasonCode: 'proxy-only',
            directionalSignal: null,
            values: []
        })));
    });
    const withoutGaps = INTEL.composeImmediate(filled, REGISTRY, DECISION_TIME);
    assert.equal(withoutGaps.unavailableDimensionIds.length, 0);
    assert.equal(withoutGaps.gapEffect, 'Every dimension this horizon composes from answered.');
    const rank = INTEL.EVIDENCE_QUALITIES.indexOf.bind(INTEL.EVIDENCE_QUALITIES);
    assert.ok(rank(withoutGaps.evidenceQuality) < rank(withGaps.evidenceQuality),
        withoutGaps.evidenceQuality + ' outranks ' + withGaps.evidenceQuality);
});

/* ---------- 1.6b: the direction tie and the four evidence bands ---------- */

/* Promote a real read into a signalled one, keeping its own identity. The composer registers a
   read's own value ids, so the synthesized value never trips horizon isolation. */
function promoteRead(read, directionalSignal) {
    return JSON.parse(JSON.stringify(Object.assign({}, read, {
        state: directionalSignal === null ? 'partial' : 'current',
        reasonCode: directionalSignal === null ? 'proxy-only' : null,
        directionalSignal,
        asOf: '2026-08-16',
        ageDays: 2,
        values: [{
            valueId: read.dimensionId + '-promoted-gauge',
            label: read.dimensionId + ' gauge',
            value: '1.000',
            unit: 'index',
            provenanceClass: 'proxy',
            sourceName: 'promoted owner read',
            asOf: '2026-08-16'
        }]
    })));
}

test('a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);

    /* The fixture reads constructive because performance is constructive and volatility is flat. */
    const baseline = INTEL.composeImmediate(partition.tactical, REGISTRY, DECISION_TIME);
    assert.equal(baseline.direction, 'constructive');
    assert.equal(partition.tactical.find((read) => read.dimensionId === 'volatility').directionalSignal, 'flat');

    /* Turning the one flat contributor pressured makes the two signalled dimensions evenly opposed. */
    const opposed = partition.tactical.map((read) => (
        read.dimensionId === 'volatility' ? promoteRead(read, 'pressured') : read
    ));
    const tied = INTEL.composeImmediate(opposed, REGISTRY, DECISION_TIME);

    assert.equal(tied.direction, 'flat', 'an even split reads flat');
    assert.ok(INTEL.DIRECTIONS.includes('flat'));
    assert.notEqual(tied.direction, 'none', 'flat is a reading, not an absence');
    assert.notEqual(tied.evidenceQuality, 'absent');
    /* Both sides survive the tie: neither claim is dropped and neither is averaged away. */
    assert.deepEqual(
        tied.claims.map((claim) => claim.claimId).slice().sort(),
        ['immediate-performance', 'immediate-volatility']
    );
    assert.ok(tied.summary.includes('flat'));
    assert.ok(!/probab|likelihood|odds|chance/i.test(tied.summary + tied.invalidation));
    /* And the opposite promotion moves it off flat, so flat is not a constant. */
    const leaning = INTEL.composeImmediate(
        partition.tactical.map((read) => (read.dimensionId === 'volatility' ? promoteRead(read, 'constructive') : read)),
        REGISTRY, DECISION_TIME
    );
    assert.equal(leaning.direction, 'constructive');
});

test('the evidence band a horizon publishes follows the count of signalled dimensions it composed', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    const primary = REGISTRY.horizons.find((horizon) => horizon.horizonId === 'immediate').primaryDimensionIds;
    assert.equal(primary.length, 6);

    /* Build an immediate input set where each primary dimension is signalled, merely usable, or
       left as the adapter produced it. Only the counts vary between the four cases. */
    function immediateSet(signalled, usable) {
        return partition.tactical.map((read) => {
            if (signalled.includes(read.dimensionId)) return promoteRead(read, 'constructive');
            if (usable.includes(read.dimensionId)) return promoteRead(read, null);
            if (primary.includes(read.dimensionId)) {
                return JSON.parse(JSON.stringify(Object.assign({}, read, {
                    state: 'unavailable', reasonCode: 'no-shared-read', directionalSignal: null, values: []
                })));
            }
            return read;
        });
    }

    const cases = [
        { band: 'absent', signalled: [], usable: [], unavailable: 6 },
        { band: 'thin', signalled: ['performance'], usable: [], unavailable: 5 },
        { band: 'narrow', signalled: ['performance', 'volatility'], usable: ['sentiment', 'technicals', 'dealer-gamma'], unavailable: 1 },
        /* The boundary case. Three signalled dimensions is still narrow; broad begins at four. */
        { band: 'narrow', signalled: ['performance', 'volatility', 'sentiment'], usable: ['technicals'], unavailable: 2 },
        { band: 'broad', signalled: ['performance', 'volatility', 'sentiment', 'technicals'], usable: ['dealer-gamma', 'options-flow'], unavailable: 0 }
    ];

    const observed = new Set();
    cases.forEach(({ band, signalled, usable, unavailable }) => {
        const horizon = INTEL.composeImmediate(immediateSet(signalled, usable), REGISTRY, DECISION_TIME);
        assert.equal(horizon.unavailableDimensionIds.length, unavailable,
            band + ' case with ' + signalled.length + ' signalled leaves ' + unavailable + ' contributors absent');
        assert.equal(horizon.evidenceQuality, band,
            signalled.length + ' signalled dimensions publish band ' + horizon.evidenceQuality);
        assert.equal(horizon.claims.length, signalled.length, band + ' publishes one claim per signalled dimension');
        assert.equal(horizon.direction, signalled.length === 0 ? 'none' : 'constructive');
        observed.add(band);
    });

    /* All four declared bands were reached by the real composer, not just the two the fixture hits. */
    assert.deepEqual(Array.from(observed).sort(), INTEL.EVIDENCE_QUALITIES.slice().sort());
    assert.equal(INTEL.EVIDENCE_QUALITIES.length, 4);
});

/* ---------- 1.7 ---------- */

test('two opposing horizons keep their directions and produce one contradiction record', () => {
    const risingSubject = subjectOf();
    const opposed = INTEL.runAdapters(risingSubject, sourcesOf({
        fundamentalsRead: {
            subjectId: 'company:msft',
            asOf: '2026-08-10',
            sourceName: 'SEC company facts publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '25400.000', unit: 'usd-millions' }]
        },
        derivedMetrics: [{ metricId: 'fcf-yield', label: 'Free cash flow yield', value: '3.100', unit: 'percent', asOf: '2026-08-10' }],
        valuationSignal: 'constructive'
    }), DECISION_TIME, stubData({
        barsBySymbol: { MSFT: bars({ sessions: 300, start: 200, step: -0.4 }) },
        toolReads: {
            'volatility-sizing-lab': {
                id: 'volatility-sizing-lab',
                asOf: '2026-08-16T00:00:00.000Z',
                metrics: { subjectId: 'company:msft', volPercentile: 88.2 }
            }
        }
    }));
    const horizons = composeAll(opposed);
    const immediate = horizons.find((horizon) => horizon.horizonId === 'immediate');
    const structural = horizons.find((horizon) => horizon.horizonId === 'structural');

    assert.equal(immediate.direction, 'pressured');
    assert.equal(structural.direction, 'constructive');

    const contradictions = INTEL.extractContradictions(horizons);
    const pair = contradictions.filter((record) => record.contradictionId === 'immediate-vs-structural');
    assert.equal(pair.length, 1);
    assert.deepEqual(pair[0].horizonIds, ['immediate', 'structural']);
    assert.deepEqual(pair[0].directions, ['pressured', 'constructive']);
    assert.ok(pair[0].statement.includes('Both readings stand'));
    /* Neither horizon was rewritten and no blended direction exists anywhere. */
    assert.equal(immediate.direction, 'pressured');
    assert.equal(structural.direction, 'constructive');
    contradictions.forEach((record) => {
        assert.ok(!Object.prototype.hasOwnProperty.call(record, 'blendedDirection'));
    });
});

/* Walk a serialized structure and report every key whose name mentions a direction, together with
   whether the object holding it identifies the single horizon (or horizon pair) it belongs to. */
function directionBearingKeys(value, path, found) {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => directionBearingKeys(entry, path + '[' + index + ']', found));
        return found;
    }
    if (value && typeof value === 'object') {
        const scoped = Object.prototype.hasOwnProperty.call(value, 'horizonId') ||
            Object.prototype.hasOwnProperty.call(value, 'horizonIds');
        Object.keys(value).forEach((key) => {
            if (/direction/i.test(key)) found.push({ path: path + '.' + key, scoped });
            directionBearingKeys(value[key], path + '.' + key, found);
        });
    }
    return found;
}

test('SCN-025-008 the published read version keeps both opposed horizon directions and holds no blended direction key', () => {
    const subject = subjectOf();
    const opposed = INTEL.runAdapters(subject, sourcesOf({
        fundamentalsRead: {
            subjectId: 'company:msft',
            asOf: '2026-08-10',
            sourceName: 'SEC company facts publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '25400.000', unit: 'usd-millions' }]
        },
        derivedMetrics: [{ metricId: 'fcf-yield', label: 'Free cash flow yield', value: '3.100', unit: 'percent', asOf: '2026-08-10' }],
        valuationSignal: 'constructive'
    }), DECISION_TIME, stubData({
        barsBySymbol: { MSFT: bars({ sessions: 300, start: 200, step: -0.4 }) },
        toolReads: {
            'volatility-sizing-lab': {
                id: 'volatility-sizing-lab',
                asOf: '2026-08-16T00:00:00.000Z',
                metrics: { subjectId: 'company:msft', volPercentile: 88.2 }
            }
        }
    }));
    const horizons = composeAll(opposed);
    const contradictions = INTEL.extractContradictions(horizons);
    const pair = contradictions.filter((record) => record.contradictionId === 'immediate-vs-structural');

    assert.equal(pair.length, 1, 'exactly one record names the opposed pair');
    assert.deepEqual(pair[0].horizonIds, ['immediate', 'structural']);

    const version = INTEL.buildReadVersion({
        subject,
        horizons,
        coverageAccount: INTEL.buildCoverageAccount(opposed, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(opposed),
        contradictions,
        researchPlan: INTEL.attachResearchPlan(subject, sourcesOf()),
        events: INTEL.selectRenderableEvents([]),
        refusals: opposed.refusals
    }, DECISION_TIME);
    const published = INTEL.publishToolRead(version, stubData());

    /* Both readings survive publication under their own horizon identity. */
    const summaries = published.metrics.horizonSummaries;
    assert.equal(summaries.length, 4);
    assert.equal(summaries.find((summary) => summary.horizonId === 'immediate').direction, 'pressured');
    assert.equal(summaries.find((summary) => summary.horizonId === 'structural').direction, 'constructive');

    /* Every direction the version and the payload carry is scoped to the horizon it belongs to.
       An unscoped direction key would be a single blended reading standing over the four. */
    [['version', version], ['published', published]].forEach(([label, subjectValue]) => {
        const keys = directionBearingKeys(subjectValue, '$', []);
        assert.ok(keys.length > 0, label + ' really carries direction-bearing keys to inspect');
        keys.forEach((entry) => {
            assert.ok(entry.scoped, label + ' carries an unscoped direction at ' + entry.path);
        });
    });
    assert.ok(!Object.prototype.hasOwnProperty.call(version, 'direction'), 'the version states no overall direction');
    assert.ok(!/"(overall|blended|net|combined|consensus|aggregate)[A-Za-z]*[Dd]irection"/
        .test(JSON.stringify(version) + JSON.stringify(published)), 'no blended-direction key is published');
    /* Non-vacuous: the walker really flags an unscoped direction key. */
    assert.equal(directionBearingKeys({ overallDirection: 'constructive' }, '$', [])[0].scoped, false);
});

/* ---------- 1.8 ---------- */

test('module source contains no second definition of a volatility or ratio metric', () => {
    const banned = [
        /function\s+\w*[Ss]tdev/, /function\s+\w*[Ss]tandardDeviation/, /function\s+\w*[Vv]ariance/,
        /function\s+\w*[Rr]ealizedVol/, /function\s+\w*[Rr]atioSeries/, /function\s+\w*[Ww]indowStats/,
        /function\s+\w*[Ss]harpe/, /function\s+\w*[Zz]Score/, /function\s+\w*[Pp]ercentileOf/
    ];
    banned.forEach((pattern) => {
        assert.ok(!pattern.test(MODULE_SOURCE), 'module declares no ' + pattern.source);
    });
    /* Adversarial: the detector really fires on a re-declaration. */
    assert.ok(/function\s+\w*[Ss]tdev/.test('function computeStdev(values) { return 0; }'));
    /* Every closed vocabulary the design names is declared exactly once in this module. */
    ['REASON_CODES', 'ERROR_CODES', 'EVIDENCE_STATES', 'HORIZON_RANKS'].forEach((name) => {
        const declarations = MODULE_SOURCE.match(new RegExp('var\\s+' + name + '\\s*=', 'g')) || [];
        assert.equal(declarations.length, 1, name + ' is declared once');
    });
});

test('the module holds no DOM, storage, credential, clock or timer authority', () => {
    ['document', 'localStorage', 'sessionStorage', 'innerHTML', 'requestAnimationFrame',
        'setTimeout', 'setInterval', 'providerFetch', 'XMLHttpRequest', 'Math.random',
        'Date.now()', 'new Date()'].forEach((token) => {
            assert.ok(!MODULE_SOURCE.includes(token), 'module source contains no ' + token);
        });
    /* Bare isFinite coerces strings; every numeric guard uses the strict form. */
    assert.ok(!/[^.\w]isFinite\s*\(/.test(MODULE_SOURCE), 'module uses no bare isFinite');
    assert.ok(MODULE_SOURCE.includes('Number.isFinite('), 'module does use Number.isFinite');
    assert.ok(!/\bfetch\s*\(/.test(MODULE_SOURCE), 'module performs no fetch');

    /* The list above bans the shapes a browser build reaches for. It did not ban the ambient
       authorities a Node build reaches for, nor a clock read that drops its parentheses, so
       `var clock = Date.now;` or `process.env.X` would have passed every assertion above. */
    const ambient = [
        [/\bwindow\s*\.\s*[A-Za-z_$]/, 'window property access'],
        [/\bwindow\s*\[/, 'window index access'],
        [/\bnavigator\b/, 'navigator'],
        [/\bprocess\s*\./, 'process'],
        [/\bcrypto\b/, 'crypto'],
        [/\bperformance\s*\.\s*now\b/, 'performance.now'],
        [/\bDate\s*\.\s*now\b/, 'any Date.now reference'],
        [/\beval\s*\(/, 'eval'],
        [/\bnew\s+Function\s*\(/, 'new Function'],
        [/\bstructuredClone\s*\(/, 'structuredClone']
    ];
    ambient.forEach(([pattern, name]) => {
        assert.ok(!pattern.test(MODULE_SOURCE), 'module reaches for no ' + name);
    });
    /* Adversarial: each detector really fires on the shape it bans, so none is a dead pattern. */
    assert.ok(/\bDate\s*\.\s*now\b/.test('var clock = Date.now;'));
    assert.ok(/\bwindow\s*\.\s*[A-Za-z_$]/.test('window.location.href'));
    assert.ok(/\bprocess\s*\./.test('process.env.SECRET'));
    /* And the window detector does not fire on the freshness-window sentence the module really
       emits, so the ban is narrow rather than merely absent from the source. */
    assert.ok(MODULE_SOURCE.includes(' day window.'), 'the module does emit a freshness-window sentence');
    assert.ok(!/\bwindow\s*\.\s*[A-Za-z_$]/.test('past the 7 day window.'));
});

test('the module exports a frozen api and loads under Node through module.exports', () => {
    assert.equal(Object.isFrozen(INTEL), true);
    assert.equal(typeof INTEL.composeStructural, 'function');
    assert.ok(!/^\s*(import|export)\s/m.test(MODULE_SOURCE), 'module uses no browser ES module syntax');
    assert.ok(MODULE_SOURCE.includes('module.exports = api'));
    assert.ok(MODULE_SOURCE.includes('globalThis.RLCOMPANYINTEL = api'));
    assert.equal(globalThis.RLCOMPANYINTEL, INTEL);
});

test('every reason code and every refusal code named by the design appears in the module source', () => {
    assert.equal(INTEL.REASON_CODES.length, 16);
    assert.equal(INTEL.ERROR_CODES.length, 11);
    INTEL.REASON_CODES.forEach((code) => {
        assert.ok(MODULE_SOURCE.includes('"' + code + '"'), 'module source names reason ' + code);
    });
    INTEL.ERROR_CODES.forEach((code) => {
        assert.ok(MODULE_SOURCE.includes('"' + code + '"'), 'module source names refusal ' + code);
    });
});

/* Every refusal code is reachable from a real call rather than merely present as a string. */
test('all eleven C025 refusal codes are raised by a real call path', () => {
    const observed = new Set();
    const capture = (thunk) => {
        try {
            const result = thunk();
            if (result && result.contractVersion === 'company-intel-error/v1') observed.add(result.code);
            if (result && Array.isArray(result.refusals)) result.refusals.forEach((refusal) => observed.add(refusal.code));
            if (result && result.events && Array.isArray(result.events.refusals)) {
                result.events.refusals.forEach((refusal) => observed.add(refusal.code));
            }
        } catch (error) {
            if (error.code) observed.add(error.code);
        }
    };
    const subject = subjectOf();

    capture(() => INTEL.resolveSubject('ZZZZ', { secCompanies: [], barSymbols: [] }));
    capture(() => INTEL.refuseInput('120 shares'));
    capture(() => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { contractVersion: 'company-intelligence-config/v9' })));
    capture(() => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { maxBranches: 0 })));
    capture(() => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, {
        coverageRegistry: CONFIG.coverageRegistry.filter((row) => row.dimensionId !== 'valuation')
    })));
    capture(() => INTEL.runAdapters({}, sourcesOf(), DECISION_TIME, stubData()));
    capture(() => INTEL.selectRenderableEvents([{ contractVersion: 'company-event/v1' }]));
    capture(() => {
        const bundle = INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, stubData({
            toolReads: {
                'volatility-sizing-lab': {
                    id: 'volatility-sizing-lab', asOf: '2026-08-16T00:00:00.000Z',
                    metrics: { subjectId: 'company:other', volPercentile: 40 }
                }
            }
        }));
        return bundle;
    });
    capture(() => {
        const partition = INTEL.partitionByHorizon(richBundle().bundle);
        return INTEL.composeStructural(partition.tactical, REGISTRY, DECISION_TIME);
    });
    capture(() => INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: [{ question: 'why' }] }
    })));
    capture(() => INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: subject.subjectId,
            branches: Array.from({ length: REGISTRY.maxBranches + 1 }, (unused, index) => completeBranch(index))
        }
    })));
    capture(() => INTEL.publishToolRead(publishableVersion(), lossyData('freshUntil')));

    INTEL.ERROR_CODES.forEach((code) => {
        assert.ok(observed.has(code), 'refusal ' + code + ' was raised by a real call');
    });
});

/* The two assertions above walk the DECLARED set outward: each declared code appears in the
   source, and each declared code is raised. Neither walks inward, so a twelfth code introduced at
   a call site would leave both green while the set silently stopped being closed. */
test('the refusal-code set is closed: no call site raises a code the module does not declare', () => {
    const literals = [...MODULE_SOURCE.matchAll(/(?:makeError|raise)\(\s*"([^"]+)"/g)].map((match) => match[1]);
    const distinct = [...new Set(literals)].sort();

    assert.ok(distinct.length > 0, 'call sites naming a refusal code were found');
    assert.deepEqual(distinct.filter((code) => !INTEL.ERROR_CODES.includes(code)), [],
        'every raised code is declared in ERROR_CODES');
    /* Closed in both directions, so a declared code cannot become dead weight either. */
    assert.deepEqual(INTEL.ERROR_CODES.filter((code) => !distinct.includes(code)), [],
        'every declared code has a call site');
    assert.deepEqual(distinct, INTEL.ERROR_CODES.slice().sort());

    /* Adversarial: the scanner really finds an unregistered literal when one is introduced. */
    const injected = [...'raise("C025-NOT-DECLARED", "x");'.matchAll(/(?:makeError|raise)\(\s*"([^"]+)"/g)]
        .map((match) => match[1]);
    assert.deepEqual(injected.filter((code) => !INTEL.ERROR_CODES.includes(code)), ['C025-NOT-DECLARED']);
});

/* ---------- 1.9 ---------- */

test('a dimension with no owner renders no deep link and states that no owner exists', () => {
    const owned = INTEL.describeDimensionOwner(REGISTRY, 'volatility');
    const unowned = INTEL.describeDimensionOwner(REGISTRY, 'company-risk');

    assert.equal(owned.hasOwner, true);
    assert.equal(owned.ownerToolId, 'volatility-sizing-lab');
    assert.equal(owned.ownerDeepLink, 'volatility-sizing-lab.html');

    assert.equal(unowned.hasOwner, false);
    assert.equal(unowned.ownerToolId, null);
    assert.equal(unowned.ownerDeepLink, null);
    assert.ok(unowned.statement.includes('No registered tool owns'));

    /* Every registry row that names an owner names a route, and every row without one names
       neither. There is no half-declared owner anywhere in the registry. */
    REGISTRY.rows.forEach((row) => {
        const described = INTEL.describeDimensionOwner(REGISTRY, row.dimensionId);
        assert.equal(described.hasOwner, row.ownerToolId !== null, row.dimensionId);
        assert.equal(described.ownerDeepLink === null, row.ownerToolId === null, row.dimensionId);
        assert.ok(described.statement.length > 10, row.dimensionId);
    });
    assert.ok(REGISTRY.rows.some((row) => row.ownerToolId === null), 'the registry really has an unowned dimension');
});

/* ---------- 1.10 ---------- */

test('every exported function of the module has a caller inside the route source', () => {
    const exported = Object.keys(INTEL).filter((name) => typeof INTEL[name] === 'function');
    const headlessOnly = new Set([
        'readPublicationPolicy',
        'normalizeOwnerDimensionRead',
        'validateResearchPlanV2',
        'buildReadVersionV2',
        'validateReadVersionV2',
        'buildCompanyToolModelRead',
        'validateCompanyToolModelRead'
    ]);
    assert.ok(exported.length >= 15, exported.length + ' functions are exported');
    exported.forEach((name) => {
        const consumer = headlessOnly.has(name) ? PUBLICATION_MODULE_SOURCE : ROUTE_SOURCE;
        assert.ok(consumer.includes('INTEL.' + name + '('),
            (headlessOnly.has(name) ? 'the headless publication module calls ' : 'the route calls ') + name);
    });
    /* Adversarial: the detector really fails for a name the route never calls. */
    assert.ok(!ROUTE_SOURCE.includes('INTEL.definitelyNotCalled('));
});

/* ---------- 1.11 and 1.13 ---------- */

test('an estimated date without a basis is refused and a scheduled date keeps its class', () => {
    const selection = INTEL.selectRenderableEvents([
        {
            contractVersion: 'company-event/v1', subjectId: 'company:msft', eventId: 'earnings-2026q1',
            eventType: 'earnings', eventClass: 'financial', date: '2026-10-24', dateClass: 'scheduled',
            sourceClass: 'committed-file', sourceName: 'issuer investor-relations page'
        },
        {
            contractVersion: 'company-event/v1', subjectId: 'company:msft', eventId: 'earnings-2027q1',
            eventType: 'earnings', eventClass: 'financial', date: '2027-01-23', dateClass: 'estimated',
            sourceClass: 'committed-file', sourceName: 'prior reporting pattern'
        },
        {
            contractVersion: 'company-event/v1', subjectId: 'company:msft', eventId: 'earnings-2027q2',
            eventType: 'earnings', eventClass: 'financial', date: '2027-04-24', dateClass: 'estimated',
            estimateBasis: 'the last eight reports landed in the fourth calendar week',
            sourceClass: 'committed-file', sourceName: 'prior reporting pattern'
        }
    ]);

    assert.equal(selection.events.length, 2);
    assert.equal(selection.refusals.length, 1);
    assert.equal(selection.refusals[0].code, 'C025-READ-CONTRACT');
    assert.ok(selection.refusals[0].message.includes('estimate basis'));
    assert.equal(selection.events.find((event) => event.eventId === 'earnings-2026q1').dateClass, 'scheduled');
    const estimated = selection.events.find((event) => event.eventId === 'earnings-2027q2');
    assert.equal(estimated.dateClass, 'estimated');
    assert.ok(estimated.estimateBasis.length > 10);
    assert.ok(!selection.events.some((event) => event.eventId === 'earnings-2027q1'));
});

test('a non-financial event without a source url or an as-of date never renders', () => {
    const complete = {
        contractVersion: 'company-event/v1', subjectId: 'company:msft', eventId: 'regulatory-hearing',
        eventType: 'regulatory-hearing', eventClass: 'non-financial', date: '2026-11-05',
        dateClass: 'scheduled', sourceClass: 'committed-file',
        sourceUrl: 'https://example.invalid/docket', asOf: '2026-08-14'
    };
    const withoutUrl = Object.assign({}, complete, { eventId: 'no-url', sourceUrl: null });
    const withoutAsOf = Object.assign({}, complete, { eventId: 'no-as-of', asOf: null });

    const selection = INTEL.selectRenderableEvents([complete, withoutUrl, withoutAsOf]);
    assert.deepEqual(selection.events.map((event) => event.eventId), ['regulatory-hearing']);
    assert.equal(selection.refusals.length, 2);
    selection.refusals.forEach((refusal) => {
        assert.ok(refusal.message.includes('source url and as-of pair'));
    });
    /* A financial event needs neither, so the rule is scoped rather than universal. */
    const financialOnly = INTEL.selectRenderableEvents([
        Object.assign({}, complete, { eventId: 'financial-no-url', eventClass: 'financial', sourceUrl: null, asOf: null })
    ]);
    assert.equal(financialOnly.events.length, 1);
    assert.equal(financialOnly.refusals.length, 0);
});

/* ---------- 1.12 ---------- */

test('the event horizon reads none with absent quality and names the missing source', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    const eventHorizon = INTEL.composeEvent(partition.event, REGISTRY, DECISION_TIME);

    assert.equal(eventHorizon.direction, 'none');
    assert.equal(eventHorizon.evidenceQuality, 'absent');
    assert.deepEqual(eventHorizon.claims, []);
    assert.deepEqual(eventHorizon.unavailableDimensionIds,
        ['financial-events', 'non-financial-events', 'options-structure']);
    assert.ok(eventHorizon.gapEffect.includes('no-source-wired'));
    assert.ok(eventHorizon.gapEffect.includes('no-source-exists'));
    assert.ok(eventHorizon.gapEffect.includes('no-shared-read'));
    /* Longer-horizon evidence is present in the set yet never becomes an event direction. */
    assert.ok(partition.event.some((read) => read.dimensionId === 'fundamentals'));
});

/* ---------- 1.14 through 1.17 and 1.22 ---------- */

function completeBranch(index = 0, overrides = {}) {
    return Object.assign({
        branchId: 'branch-' + (index + 1),
        question: 'Does the rising margin survive a currency move?',
        relevance: { horizonId: 'structural', claimId: 'structural-fundamentals' },
        consulted: [{ kind: 'registered-tool', ref: 'company-fundamentals-lab', deepLink: 'company-fundamentals-lab.html' }],
        result: 'Two of three periods hold after the currency adjustment.',
        disposition: 'confirmed',
        changedTargets: [],
        refusalReason: null,
        stopCondition: 'Three reported periods checked.',
        stoppedBy: 'declared-limit'
    }, overrides);
}

test('a branch missing any of the six mandatory fields raises C025-PLAN-SCHEMA', () => {
    const subject = subjectOf();
    assert.equal(INTEL.MANDATORY_BRANCH_FIELDS.length, 6);

    INTEL.MANDATORY_BRANCH_FIELDS.forEach((field) => {
        const broken = completeBranch(0);
        delete broken[field];
        const plan = INTEL.attachResearchPlan(subject, sourcesOf({
            committedPlan: { subjectId: subject.subjectId, branches: [broken] }
        }));
        assert.equal(plan.branches.length, 0, field + ' removal drops the branch');
        assert.equal(plan.refusals.length, 1, field + ' removal raises one refusal');
        assert.equal(plan.refusals[0].code, 'C025-PLAN-SCHEMA', field);
        assert.ok(plan.refusals[0].detail.includes(field), 'the refusal names ' + field);
    });

    /* The complete branch publishes, so the check is not refusing everything. */
    const good = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: [completeBranch(0)] }
    }));
    assert.equal(good.branches.length, 1);
    assert.equal(good.refusals.length, 0);
});

test('a no-change branch stays in the published plan', () => {
    const subject = subjectOf();
    const plan = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: subject.subjectId,
            branches: [
                completeBranch(0, { disposition: 'no-change', result: 'The currency adjustment moved nothing.' }),
                completeBranch(1, { disposition: 'changed', changedTargets: [{ horizonId: 'structural', field: 'evidenceQuality', from: 'narrow', to: 'thin' }] })
            ]
        }
    }));

    assert.equal(plan.branches.length, 2);
    const kept = plan.branches.find((branch) => branch.disposition === 'no-change');
    assert.ok(kept, 'the no-change branch survived publication');
    assert.equal(kept.result, 'The currency adjustment moved nothing.');
    assert.deepEqual(kept.changedTargets, []);
    assert.equal(plan.refusals.length, 0);
    assert.equal(plan.budgetRemaining, REGISTRY.maxBranches - 2);
});

test('a refused branch records its reason and no horizon cites its claim', () => {
    const { bundle, subject } = richBundle();
    const plan = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: subject.subjectId,
            branches: [completeBranch(0, {
                branchId: 'branch-refused',
                relevance: { horizonId: 'structural', claimId: 'structural-currency-adjusted-margin' },
                disposition: 'refused',
                refusalReason: 'No source publishes a currency-adjusted margin series.',
                result: 'The question could not be answered from any available source.',
                stoppedBy: 'no-source'
            })]
        }
    }));

    assert.equal(plan.branches.length, 1);
    assert.equal(plan.branches[0].disposition, 'refused');
    assert.ok(plan.branches[0].refusalReason.length > 20);
    assert.deepEqual(plan.branches[0].changedTargets, []);

    const claimIds = new Set();
    composeAll(bundle).forEach((horizon) => horizon.claims.forEach((claim) => claimIds.add(claim.claimId)));
    assert.ok(!claimIds.has(plan.branches[0].relevance.claimId),
        'no horizon claim carries the refused branch identity');

    /* A refused branch that also claims a change is itself refused. */
    const contradictory = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: subject.subjectId,
            branches: [completeBranch(0, {
                disposition: 'refused',
                refusalReason: 'No source answers.',
                changedTargets: [{ horizonId: 'structural', field: 'direction', from: 'flat', to: 'constructive' }]
            })]
        }
    }));
    assert.equal(contradictory.branches.length, 0);
    assert.equal(contradictory.refusals[0].code, 'C025-PLAN-SCHEMA');
});

test('a branch against any registered tool is permitted and records the tool it consulted', () => {
    const subject = subjectOf();
    const tools = ['company-fundamentals-lab', 'volatility-sizing-lab', 'research-agenda-lab', 'market-brief'];
    const plan = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: subject.subjectId,
            branches: tools.map((tool, index) => completeBranch(index, {
                consulted: [
                    { kind: 'registered-tool', ref: tool, deepLink: tool + '.html' },
                    { kind: 'committed-data', ref: 'data/bars/MSFT.json', deepLink: null }
                ]
            }))
        }
    }));

    assert.equal(plan.branches.length, tools.length);
    assert.equal(plan.refusals.length, 0);
    plan.branches.forEach((branch, index) => {
        assert.equal(branch.consulted[0].kind, 'registered-tool');
        assert.equal(branch.consulted[0].ref, tools[index]);
        assert.equal(branch.consulted[0].deepLink, tools[index] + '.html');
        assert.equal(branch.consulted[1].kind, 'committed-data');
        assert.equal(branch.consulted[1].deepLink, null);
    });
    /* No allowlist narrows which registered tool a branch may consult. */
    const declaredTools = new Set(plan.branches.map((branch) => branch.consulted[0].ref));
    assert.equal(declaredTools.size, tools.length);
});

test('one branch beyond the declared maxBranches raises C025-PLAN-BUDGET', () => {
    const subject = subjectOf();
    const budget = REGISTRY.maxBranches;
    const atBudget = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: Array.from({ length: budget }, (unused, index) => completeBranch(index)) }
    }));
    assert.equal(atBudget.branches.length, budget);
    assert.equal(atBudget.refusals.length, 0);
    assert.equal(atBudget.budgetRemaining, 0);

    const overBudget = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: Array.from({ length: budget + 1 }, (unused, index) => completeBranch(index)) }
    }));
    assert.equal(overBudget.branches.length, budget);
    assert.equal(overBudget.refusals.length, 1);
    assert.equal(overBudget.refusals[0].code, 'C025-PLAN-BUDGET');

    /* The declared budget is unchanged by this test, and it is the config that declares it. */
    assert.equal(REGISTRY.maxBranches, CONFIG.maxBranches);
    assert.equal(atBudget.maxBranches, CONFIG.maxBranches);
});

test('a branch declaring an unknown disposition or an unknown stop authority is refused', () => {
    const subject = subjectOf();
    const refuse = (overrides) => INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: [completeBranch(0, overrides)] }
    }));

    const unknownDisposition = refuse({ disposition: 'probably-fine' });
    assert.equal(unknownDisposition.branches.length, 0);
    assert.equal(unknownDisposition.refusals.length, 1);
    assert.equal(unknownDisposition.refusals[0].code, 'C025-PLAN-SCHEMA');
    assert.ok(unknownDisposition.refusals[0].message.includes('unknown disposition'));

    const unknownStop = refuse({ stoppedBy: 'ran-out-of-patience' });
    assert.equal(unknownStop.branches.length, 0);
    assert.equal(unknownStop.refusals.length, 1);
    assert.equal(unknownStop.refusals[0].code, 'C025-PLAN-SCHEMA');
    assert.ok(unknownStop.refusals[0].message.includes('unknown stop authority'));

    /* Every declared word publishes, so the refusals above discriminate rather than reject all. */
    assert.equal(INTEL.DISPOSITIONS.length, 4);
    INTEL.DISPOSITIONS.forEach((disposition) => {
        const overrides = disposition === 'refused'
            ? { disposition, refusalReason: 'No source publishes the series this branch needed.', changedTargets: [] }
            : { disposition };
        const plan = refuse(overrides);
        assert.equal(plan.refusals.length, 0, disposition + ' is a declared disposition');
        assert.equal(plan.branches[0].disposition, disposition);
    });
    assert.equal(INTEL.STOPPED_BY.length, 4);
    INTEL.STOPPED_BY.forEach((stoppedBy) => {
        const plan = refuse({ stoppedBy });
        assert.equal(plan.refusals.length, 0, stoppedBy + ' is a declared stop authority');
        assert.equal(plan.branches[0].stoppedBy, stoppedBy);
    });
});

test('a committed research plan naming another company publishes no branch and records the mismatch', () => {
    const subject = subjectOf();
    const borrowed = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: {
            subjectId: 'company:aapl',
            branches: [completeBranch(0, { result: 'The other issuer held its margin at 44.100 percent.' })]
        }
    }));

    assert.deepEqual(borrowed.branches, [], 'no branch is borrowed from another company');
    assert.equal(borrowed.subjectId, subject.subjectId, 'the plan still answers this subject');
    assert.equal(borrowed.emptyReason, 'plan-names-another-company');
    assert.equal(borrowed.planSource, 'committed-file');
    assert.equal(borrowed.refusals.length, 1);
    assert.equal(borrowed.refusals[0].code, 'C025-READ-COMPANY-MISMATCH');
    assert.ok(borrowed.refusals[0].detail.includes('company:aapl'));
    assert.ok(!JSON.stringify(borrowed).includes('44.100'), 'the other issuer\u2019s number reaches nothing');
    assert.equal(borrowed.budgetRemaining, CONFIG.maxBranches, 'a rejected file spends no budget');

    /* Non-vacuous: the same branch under this subject's own id publishes. */
    const own = INTEL.attachResearchPlan(subject, sourcesOf({
        committedPlan: { subjectId: subject.subjectId, branches: [completeBranch(0)] }
    }));
    assert.equal(own.branches.length, 1);
    assert.equal(own.emptyReason, null);
});

test('an empty research plan is a real outcome rather than an absent one', () => {
    const plan = INTEL.attachResearchPlan(subjectOf(), sourcesOf());
    assert.equal(plan.contractVersion, 'company-research-plan/v1');
    assert.deepEqual(plan.branches, []);
    assert.equal(plan.emptyReason, 'floor-was-sufficient');
    assert.equal(plan.budgetRemaining, CONFIG.maxBranches);
});

/* ---------- 1.18 ---------- */

test('a position, size, cost or profit input raises C025-INPUT-REFUSED and stores nothing', () => {
    const refusedEntries = ['120 shares', '$4,300', 'cost basis 210.44', 'PnL +1200', 'position size 3%', 'I own 50 units'];
    refusedEntries.forEach((entry) => {
        const refusal = INTEL.refuseInput(entry);
        assert.ok(refusal, 'refused: ' + entry);
        assert.equal(refusal.code, 'C025-INPUT-REFUSED');
        assert.ok(refusal.message.includes('nothing is stored'));
        /* The refusal never echoes the entry back, so no amount is retained anywhere. */
        assert.ok(!JSON.stringify(refusal).includes(entry), 'the refusal stores no part of: ' + entry);
    });
    ['MSFT', 'ko', 'BRK.B'].forEach((entry) => {
        assert.equal(INTEL.refuseInput(entry), null, 'accepted: ' + entry);
    });
    /* The same refusal fires through subject resolution, so the route cannot bypass it. */
    const viaSubject = INTEL.resolveSubject('120 shares', { secCompanies: SEC_COMPANIES, barSymbols: [] });
    assert.equal(viaSubject.code, 'C025-INPUT-REFUSED');
});

test('SCN-025-023 each refused position shape raises C025-INPUT-REFUSED and reaches no published rl-tool-read/v1 payload', () => {
    const shapes = [
        { shape: 'position size', entry: 'position size 3%' },
        { shape: 'share count', entry: '120 shares' },
        { shape: 'cost basis', entry: 'cost basis 210.44' },
        { shape: 'profit', entry: 'PnL +1200' }
    ];

    shapes.forEach(({ shape, entry }) => {
        const refusal = INTEL.refuseInput(entry);
        assert.ok(refusal, shape + ' is refused');
        assert.equal(refusal.code, 'C025-INPUT-REFUSED', shape);
        /* The module's own returned state never carries the submitted literal back. */
        assert.ok(!JSON.stringify(refusal).includes(entry), shape + ' is not echoed by the refusal');
        const viaSubject = INTEL.resolveSubject(entry, { secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime: DECISION_TIME });
        assert.equal(viaSubject.code, 'C025-INPUT-REFUSED', shape + ' is refused through subject resolution too');
        assert.ok(!JSON.stringify(viaSubject).includes(entry), shape + ' is not echoed by the subject refusal');
    });

    /* A real run publishes afterwards. Nothing any refused entry carried appears in the payload. */
    const store = stubData();
    const published = INTEL.publishToolRead(publishableVersion(), store);
    assert.equal(published.contractVersion, 'rl-tool-read/v1');
    const persisted = JSON.stringify(published) + JSON.stringify(store.written);

    shapes.forEach(({ shape, entry }) => {
        assert.ok(!persisted.includes(entry), shape + ' literal is absent from the published payload');
    });
    ['shares', 'cost basis', 'PnL', 'position size', '210.44'].forEach((token) => {
        assert.ok(!persisted.includes(token), 'the published payload names no ' + token);
    });
    /* The payload's own readable text would itself be refused if it carried a position. */
    assert.equal(INTEL.refuseInput(published.read), null, 'the published narrative carries no position language');
    /* Non-vacuous: the same detector fires on a payload that did carry one. */
    assert.ok((persisted + ' cost basis 210.44').includes('cost basis 210.44'));
    assert.ok(INTEL.refuseInput(published.read + ' cost basis 210.44'));
});

/* ---------- 1.19 adversarial ---------- */
test('adversarial: adding a tactical read leaves the structural horizon byte-identical', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);
    const baseline = INTEL.composeStructural(partition.structural, REGISTRY, DECISION_TIME);

    /* A tactical read that WOULD flip the direction if the partition let it through. */
    const flipping = JSON.parse(JSON.stringify(partition.tactical.find((read) => read.dimensionId === 'sentiment')));
    flipping.state = 'current';
    flipping.reasonCode = null;
    flipping.directionalSignal = 'pressured';
    flipping.values = [{
        valueId: 'sentiment-market-gauge', label: 'Market sentiment gauge', value: '12.000',
        unit: 'index', provenanceClass: 'proxy', sourceName: 'market sentiment cache', asOf: '2026-08-16'
    }];
    assert.equal(flipping.maxHorizon, 'tactical');

    const widened = INTEL.partitionByHorizon({ reads: bundle.reads.concat([flipping]) });
    const afterwards = INTEL.composeStructural(widened.structural, REGISTRY, DECISION_TIME);

    assert.equal(JSON.stringify(afterwards), JSON.stringify(baseline));
    assert.equal(afterwards.inputFingerprint, baseline.inputFingerprint);
    assert.ok(!widened.structural.some((read) => read.maxHorizon === 'tactical'),
        'the structural set holds no tactical read');
    /* Non-vacuous: the same read DOES reach the immediate horizon. */
    assert.ok(widened.tactical.some((read) => read.directionalSignal === 'pressured' && read.dimensionId === 'sentiment'));
});

test('partitionByHorizon returns four deep-frozen sets a caller cannot mutate', () => {
    const { bundle } = richBundle();
    const partition = INTEL.partitionByHorizon(bundle);

    assert.deepEqual(Object.keys(partition).sort(), INTEL.HORIZON_RANKS.slice().sort());
    assert.throws(() => { partition.structural.push({}); }, TypeError);
    assert.throws(() => { partition.structural[0].state = 'current'; }, TypeError);
    assert.throws(() => { partition.structural[0].values.push({}); }, TypeError);
    assert.throws(() => { partition.tactical = []; }, TypeError);
    /* Each set is strictly narrower than the one below it, so the filter really filters. */
    assert.ok(partition.tactical.length > partition.event.length);
    assert.ok(partition.event.length > partition.swing.length);
    assert.ok(partition.swing.length > partition.structural.length);
    assert.equal(partition.tactical.length, REGISTRY.rows.length);
});

/* ---------- 1.20 adversarial ---------- */

function publishableVersion() {
    const { bundle, subject } = richBundle();
    const horizons = composeAll(bundle);
    return INTEL.buildReadVersion({
        subject,
        horizons,
        coverageAccount: INTEL.buildCoverageAccount(bundle, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(bundle),
        contradictions: INTEL.extractContradictions(horizons),
        researchPlan: INTEL.attachResearchPlan(subject, sourcesOf()),
        events: INTEL.selectRenderableEvents([]),
        refusals: bundle.refusals
    }, DECISION_TIME);
}

test('adversarial: an extra published key raises C025-PUBLISH-LOSSY rather than reporting success', () => {
    const version = publishableVersion();
    const honest = stubData();
    const published = INTEL.publishToolRead(version, honest);

    assert.equal(published.contractVersion, 'rl-tool-read/v1');
    assert.deepEqual(Object.keys(published).sort(), INTEL.TOOL_READ_KEYS.slice().sort());
    assert.equal(INTEL.TOOL_READ_KEYS.length, 9);
    assert.equal(published.id, INTEL.TOOL_ID);

    /* A store that silently adds a key, and a store that silently drops one, are both caught. */
    const adding = Object.assign({}, stubData(), {
        putToolRead: (id, object) => Object.assign({}, object, { extraKey: 'silently added' })
    });
    const added = INTEL.publishToolRead(version, adding);
    assert.equal(added.code, 'C025-PUBLISH-LOSSY');

    const dropped = INTEL.publishToolRead(version, lossyData('computedAt'));
    assert.equal(dropped.code, 'C025-PUBLISH-LOSSY');
    assert.ok(dropped.message.includes('must not be reported as published'));

    const rejecting = Object.assign({}, stubData(), { putToolRead: () => null });
    assert.equal(INTEL.publishToolRead(version, rejecting).code, 'C025-PUBLISH-LOSSY');
});

test('the published read round trips through the real RLDATA nine-key contract', () => {
    const version = publishableVersion();
    const data = stubData();
    const published = INTEL.publishToolRead(version, data);

    /* The exact key set RLDATA itself demands before it will persist an rl-tool-read/v1 intact. */
    const rldataExpected = ['asOf', 'availability', 'computedAt', 'contractVersion', 'deepLink', 'freshUntil', 'id', 'metrics', 'read'];
    assert.deepEqual(Object.keys(published).sort(), rldataExpected.sort());
    assert.ok(['current', 'stale', 'unavailable'].includes(published.availability));
    assert.equal(published.metrics.contentFingerprint, version.contentFingerprint);
    assert.equal(published.metrics.subjectId, version.subjectId);
    assert.equal(published.metrics.horizonSummaries.length, 4);
    assert.equal(typeof published.deepLink, 'string');

    /* FR-025-039 asks the published read to carry the four horizon summaries AND the coverage
       account. The summaries are asserted above; the account half reaches the payload as
       `coverageTotals`, and no assertion had ever read it back. */
    assert.deepEqual(Object.keys(published.metrics.coverageTotals).sort(), INTEL.EVIDENCE_STATES.slice().sort());
    assert.deepEqual(published.metrics.coverageTotals, version.coverageAccount.totals,
        'the published totals are the composed coverage account, not a second tally');
    const publishedFloor = INTEL.EVIDENCE_STATES
        .reduce((total, state) => total + published.metrics.coverageTotals[state], 0);
    assert.equal(publishedFloor, INTEL.MANDATORY_DIMENSION_IDS.length,
        'the published account still accounts for all fifteen mandatory dimensions');
    assert.equal(published.metrics.contradictionCount, version.contradictions.length);
    /* No horizon summary states a probability or any number beside its direction. */
    published.metrics.horizonSummaries.forEach((summary) => {
        assert.ok(INTEL.DIRECTIONS.includes(summary.direction));
        assert.ok(INTEL.EVIDENCE_QUALITIES.includes(summary.evidenceQuality));
        assert.equal(Object.keys(summary).sort().join(','), 'direction,evidenceQuality,horizonId');
    });
});

test('an unavailable availability forces asOf and freshUntil to null', () => {
    const subject = INTEL.resolveSubject('ZYX', { secCompanies: [], barSymbols: ['ZYX'], decisionTime: DECISION_TIME });
    const bundle = INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, stubData());
    const horizons = composeAll(bundle);
    const version = INTEL.buildReadVersion({
        subject,
        horizons,
        coverageAccount: INTEL.buildCoverageAccount(bundle, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(bundle),
        contradictions: INTEL.extractContradictions(horizons),
        researchPlan: INTEL.attachResearchPlan(subject, sourcesOf()),
        events: INTEL.selectRenderableEvents([]),
        refusals: bundle.refusals
    }, DECISION_TIME);

    const published = INTEL.publishToolRead(version, stubData());
    assert.equal(published.availability, 'unavailable');
    assert.equal(published.asOf, null);
    assert.equal(published.freshUntil, null);
    assert.equal(typeof published.computedAt, 'string');

    /* And an answered run really does carry both clocks, so the rule is conditional. */
    const answered = INTEL.publishToolRead(publishableVersion(), stubData());
    assert.notEqual(answered.availability, 'unavailable');
    assert.equal(typeof answered.asOf, 'string');
    assert.equal(typeof answered.freshUntil, 'string');
});

test('no horizon read emits a numeric confidence beside its direction', () => {
    const horizons = composeAll(richBundle().bundle);
    horizons.forEach((horizon) => {
        assert.ok(INTEL.EVIDENCE_QUALITIES.includes(horizon.evidenceQuality), horizon.horizonId);
        assert.equal(typeof horizon.evidenceQuality, 'string');
        assert.ok(!/\d+(\.\d+)?\s*%/.test(horizon.summary), horizon.horizonId + ' summary states no percentage');
        assert.ok(!/probab|likelihood|odds|chance/i.test(horizon.summary + horizon.invalidation), horizon.horizonId);
        assert.ok(!Object.keys(horizon).some((key) => /confidence|probability|score/i.test(key)), horizon.horizonId);
    });
    assert.equal(INTEL.EVIDENCE_QUALITIES.length, 4);
    assert.ok(!/probability|confidence\s*[:=]\s*\d/i.test(MODULE_SOURCE));
});

/* FR-025-026 asks each horizon to carry the conditions that would invalidate its own read. Until
   now that was held only negatively — the assertion above proves the invalidation states no
   probability, and the browser row counts four `[data-invalidation]` nodes, which an empty string
   would still satisfy. Neither could fail on an invalidation that said nothing. */
test('every horizon states a real invalidation condition naming one of its own dimensions', () => {
    const answered = composeAll(richBundle().bundle);
    const silent = composeAll(INTEL.runAdapters(
        INTEL.resolveSubject('ZYX', { secCompanies: [], barSymbols: ['ZYX'], decisionTime: DECISION_TIME }),
        sourcesOf(), DECISION_TIME, stubData()
    ));

    assert.equal(answered.length, 4);
    assert.equal(silent.length, 4);

    [...answered, ...silent].forEach((horizon) => {
        const declared = REGISTRY.horizons.find((entry) => entry.horizonId === horizon.horizonId);
        assert.equal(typeof horizon.invalidation, 'string', horizon.horizonId);
        assert.ok(horizon.invalidation.trim().length >= 40, horizon.horizonId + ' states a sentence, not a stub');
        assert.match(horizon.invalidation, /\.$/, horizon.horizonId + ' invalidation is a finished sentence');

        /* The named condition is drawn from this horizon's OWN dimensions, so the sentence cannot
           promise a reversal in a dimension this horizon never composed from. */
        const named = INTEL.MANDATORY_DIMENSION_IDS.filter((id) => horizon.invalidation.includes(id));
        assert.ok(named.length > 0, horizon.horizonId + ' names at least one dimension');
        named.forEach((id) => {
            assert.ok(declared.primaryDimensionIds.includes(id),
                horizon.horizonId + ' invalidation names ' + id + ', one of its own primary dimensions');
        });
    });

    /* The two branches really are different sentences, so neither is a constant: an answered
       horizon names the reading that would have to reverse, a silent one names what must publish. */
    const answeredImmediate = answered.find((horizon) => horizon.direction !== 'none');
    const silentImmediate = silent.find((horizon) => horizon.horizonId === answeredImmediate.horizonId);
    assert.equal(silentImmediate.direction, 'none');
    assert.notEqual(silentImmediate.invalidation, answeredImmediate.invalidation);
    assert.match(answeredImmediate.invalidation, /reverses its (constructive|pressured|flat) reading\.$/);
    assert.match(silentImmediate.invalidation, /publishes an eligible read\.$/);
});

/* ---------- 1.21 adversarial ---------- */

test('adversarial: a fixture-sourced read reaches no horizon and reads fixture-only-evidence', () => {
    const subject = subjectOf();
    const bundle = INTEL.runAdapters(subject, sourcesOf({
        fundamentalsRead: {
            subjectId: 'company:msft',
            asOf: '2026-06-30',
            sourceClass: 'fixture',
            sourceName: 'fixture publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '25400.000', unit: 'usd-millions' }]
        },
        derivedMetrics: [{
            metricId: 'fcf-yield', label: 'Free cash flow yield', value: '3.100', unit: 'percent',
            asOf: '2026-06-30', sourcePath: 'tests/fixtures/company/derived.json'
        }]
    }), DECISION_TIME, stubData());

    const fundamentals = bundle.reads.find((read) => read.dimensionId === 'fundamentals');
    const valuation = bundle.reads.find((read) => read.dimensionId === 'valuation');
    assert.equal(fundamentals.state, 'unavailable');
    assert.equal(fundamentals.reasonCode, 'fixture-only-evidence');
    assert.equal(valuation.state, 'unavailable');
    assert.equal(valuation.reasonCode, 'fixture-only-evidence');
    assert.deepEqual(fundamentals.values, []);

    composeAll(bundle).forEach((horizon) => {
        assert.ok(!horizon.contributingDimensionIds.includes('fundamentals'), horizon.horizonId);
        assert.ok(!horizon.contributingDimensionIds.includes('valuation'), horizon.horizonId);
        horizon.claims.forEach((claim) => {
            claim.supportingValueIds.forEach((valueId) => {
                assert.ok(!valueId.startsWith('fundamentals-'), horizon.horizonId + ' cites no fixture value');
                assert.ok(!valueId.startsWith('valuation-'), horizon.horizonId + ' cites no fixture value');
            });
        });
    });

    /* Non-vacuous: the same publication without the fixture marker DOES reach the structural read. */
    const honest = richBundle();
    const structural = composeAll(honest.bundle).find((horizon) => horizon.horizonId === 'structural');
    assert.ok(structural.contributingDimensionIds.includes('fundamentals'));
});

test('adversarial: a read naming another company is refused and never reaches a horizon', () => {
    const subject = subjectOf();
    const bundle = INTEL.runAdapters(subject, sourcesOf({
        fundamentalsRead: {
            subjectId: 'company:aapl',
            asOf: '2026-06-30',
            sourceName: 'SEC company facts publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '99999.000', unit: 'usd-millions' }]
        }
    }), DECISION_TIME, stubData({
        toolReads: {
            'volatility-sizing-lab': {
                id: 'volatility-sizing-lab', asOf: '2026-08-16T00:00:00.000Z',
                metrics: { subjectId: 'company:aapl', volPercentile: 91.5 }
            }
        }
    }));

    const fundamentals = bundle.reads.find((read) => read.dimensionId === 'fundamentals');
    const volatility = bundle.reads.find((read) => read.dimensionId === 'volatility');
    assert.equal(fundamentals.reasonCode, 'read-company-mismatch');
    assert.equal(volatility.reasonCode, 'read-company-mismatch');
    assert.deepEqual(fundamentals.values, []);

    const mismatchRefusals = bundle.refusals.filter((refusal) => refusal.code === 'C025-READ-COMPANY-MISMATCH');
    assert.equal(mismatchRefusals.length, 2);
    assert.ok(mismatchRefusals.some((refusal) => refusal.detail.includes('fundamentalsAdapter')));
    assert.ok(mismatchRefusals.some((refusal) => refusal.detail.includes('volatilityAdapter')));

    const serialized = JSON.stringify(composeAll(bundle));
    assert.ok(!serialized.includes('99999.000'), 'no horizon carries the other company\u2019s number');
    assert.ok(!serialized.includes('91.500'), 'no horizon carries the other company\u2019s percentile');
});

/* ---------- 1.23 determinism ---------- */

test('two runs over one frozen bundle and one decisionTime produce identical canonical output and fingerprint', () => {
    const first = publishableVersion();
    const second = publishableVersion();

    const canonicalFirst = CONTRACTS.canonicalize(first, 'company-read-version/v1');
    const canonicalSecond = CONTRACTS.canonicalize(second, 'company-read-version/v1');
    assert.equal(canonicalFirst, canonicalSecond);
    assert.equal(first.contentFingerprint, second.contentFingerprint);
    assert.match(first.contentFingerprint, /^sha256:[a-f0-9]{64}$/);

    /* Changing one input really moves the fingerprint, so the equality above is not a constant. */
    const moved = INTEL.runAdapters(subjectOf(), sourcesOf(), DECISION_TIME, stubData({
        barsBySymbol: { MSFT: bars({ sessions: 300, start: 100, step: 0.9 }), SPY: bars({ sessions: 300, start: 400, step: 0.2, skipEvery: 5 }) }
    }));
    const movedHorizons = composeAll(moved);
    const movedVersion = INTEL.buildReadVersion({
        subject: subjectOf(),
        horizons: movedHorizons,
        coverageAccount: INTEL.buildCoverageAccount(moved, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(moved),
        contradictions: INTEL.extractContradictions(movedHorizons),
        researchPlan: INTEL.attachResearchPlan(subjectOf(), sourcesOf()),
        events: INTEL.selectRenderableEvents([]),
        refusals: moved.refusals
    }, DECISION_TIME);
    assert.notEqual(movedVersion.contentFingerprint, first.contentFingerprint);

    /* The counter-case above varies the BARS. It leaves the clock fixed, so a module that ignored
       its injected decisionTime entirely would satisfy every assertion above — which is exactly
       the failure the no-clock purity contract exists to prevent. NFR-025-010 conditions
       determinism on "an identical decision time", and that condition only carries meaning if a
       different decision time can move the output. Same inputs, later clock: */
    const LATER = '2026-11-18T00:00:00.000Z';
    const frozenBars = {
        MSFT: bars({ sessions: 300, start: 100, step: 0.9 }),
        SPY: bars({ sessions: 300, start: 400, step: 0.2 })
    };
    const composeAt = (decisionTime) => {
        const subject = INTEL.resolveSubject('MSFT', { secCompanies: SEC_COMPANIES, barSymbols: ['MSFT'], decisionTime });
        const sources = sourcesOf({ decisionTime });
        const bundle = INTEL.runAdapters(subject, sources, decisionTime, stubData({ barsBySymbol: frozenBars }));
        const partition = INTEL.partitionByHorizon(bundle);
        const horizons = [
            INTEL.composeImmediate(partition.tactical, REGISTRY, decisionTime),
            INTEL.composeEvent(partition.event, REGISTRY, decisionTime),
            INTEL.composeSwing(partition.swing, REGISTRY, decisionTime),
            INTEL.composeStructural(partition.structural, REGISTRY, decisionTime)
        ];
        return {
            bundle,
            version: INTEL.buildReadVersion({
                subject,
                horizons,
                coverageAccount: INTEL.buildCoverageAccount(bundle, REGISTRY),
                evidenceFamilies: INTEL.groupEvidenceFamilies(bundle),
                contradictions: INTEL.extractContradictions(horizons),
                researchPlan: INTEL.attachResearchPlan(subject, sources),
                events: INTEL.selectRenderableEvents([]),
                refusals: bundle.refusals
            }, decisionTime)
        };
    };
    const atDecision = composeAt(DECISION_TIME);
    const atLater = composeAt(LATER);

    /* Re-running the same clock over the same bars is still byte-identical, so the clock is a
       real input rather than a source of drift. */
    assert.equal(composeAt(DECISION_TIME).version.contentFingerprint, atDecision.version.contentFingerprint);
    assert.notEqual(atLater.version.contentFingerprint, atDecision.version.contentFingerprint,
        'the injected decisionTime reaches the composed output');

    /* That fingerprint clause on its own is weak and is not what carries this requirement: the
       version body stores `composedAt`, so the hash would move on the timestamp alone even if the
       clock reached no composition rule. The load-bearing clause is below — the same committed
       bars read current at the decision time and stop reading current months on, which a module
       ignoring its injected clock cannot produce. Verified against a clock-inert build in which
       `dayDifference` returns 0: both runs then report age 0 and stay current, and these three
       assertions fail while the fingerprint clause above still passes. */
    const readAt = (run) => run.bundle.reads.find((read) => read.dimensionId === 'performance');
    assert.equal(readAt(atDecision).state, 'current');
    assert.notEqual(readAt(atLater).state, 'current');
    assert.ok(readAt(atLater).ageDays > readAt(atDecision).ageDays,
        'the later run reports the larger age over identical bars');
});

/* ---------- registry, config and grouping ---------- */

test('an owner deep link that is not a same-origin route file is refused, and the committed registry passes', () => {
    /* The page CSP keeps script-src 'unsafe-inline', so a javascript: or data: href executes
       rather than being blocked. The registry is the only config value reaching an href. */
    const hostile = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        '//evil.example/market-brief.html',
        'https://evil.example/market-brief.html',
        '../../etc/passwd',
        'market-brief.html?x=1"onmouseover="alert(1)'
    ];
    hostile.forEach((href) => {
        const poisoned = Object.assign({}, CONFIG, {
            coverageRegistry: CONFIG.coverageRegistry.map((row) => (
                row.ownerDeepLink === null ? row : Object.assign({}, row, { ownerDeepLink: href })
            ))
        });
        assert.throws(
            () => INTEL.readCoverageRegistry(poisoned),
            (error) => error.code === 'C025-CONFIG-SCHEMA',
            href + ' is refused as an owner route'
        );
    });

    /* ADVERSARIAL COUNTER-CASE: the guard is not refusing everything. The committed registry
       still reads, and every owner route it carries is a registered page. */
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const linked = registry.rows.filter((row) => row.ownerDeepLink !== null);
    assert.ok(linked.length > 0, 'the committed registry carries owner routes');
    linked.forEach((row) => {
        assert.match(row.ownerDeepLink, /^[A-Za-z0-9._-]+\.html$/);
    });
});

test('a subject-carrying owner link opens the owning tool on the same company and can carry nothing else', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);

    /* The reason this link exists: UC-025-003 asks the reader to follow the maths to its owner
       FOR THE COMPANY IN FRONT OF THEM, so the href must name that company. */
    const carrying = registry.rows.filter((row) => row.ownerSubjectParam !== null);
    assert.ok(carrying.length > 0, 'the registry declares at least one subject-carrying owner');
    carrying.forEach((row) => {
        const described = INTEL.describeDimensionOwner(registry, row.dimensionId, 'MSFT');
        assert.equal(described.carriesSubject, true, row.dimensionId);
        assert.equal(described.ownerDeepLink, row.ownerDeepLink + '?' + row.ownerSubjectParam + '=MSFT');
        assert.equal(new URL(described.ownerDeepLink, 'https://example.test/lab/').searchParams
            .get(row.ownerSubjectParam), 'MSFT');
    });

    /* And an owner route that reads no company parameter is NOT given a fabricated one. It
       links to the bare route and the statement says WHY that owner carries no company. */
    const bare = registry.rows.filter((row) => row.ownerToolId !== null && row.ownerSubjectParam === null);
    assert.ok(bare.length > 0, 'the registry still carries plain owner routes');
    bare.forEach((row) => {
        const described = INTEL.describeDimensionOwner(registry, row.dimensionId, 'MSFT');
        assert.equal(described.carriesSubject, false, row.dimensionId);
        assert.equal(described.ownerDeepLink, row.ownerDeepLink, row.dimensionId);
        assert.match(described.statement, row.ownerBareReason === 'market-scoped'
            ? /answers a market-wide question/
            : /does not model an individual company you can choose/, row.dimensionId);
    });

    /* A dimension with no owner is still given no link at all. */
    const unowned = INTEL.describeDimensionOwner(registry, 'company-risk', 'MSFT');
    assert.equal(unowned.hasOwner, false);
    assert.equal(unowned.ownerDeepLink, null);

    /* SECURITY — the company identifier is attacker-reachable: it arrives from the ?symbol=
       query and from the subject box. Under this page's script-src 'unsafe-inline' CSP an href
       that grew a scheme would EXECUTE, so every hostile value must stay inert data. */
    const hostileSubjects = [
        'javascript:alert(1)',
        'JaVaScRiPt:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'https://evil.example/steal',
        '//evil.example/steal',
        '../../etc/passwd',
        '..\\..\\windows\\system32',
        'MSFT&admin=1',
        'MSFT#javascript:alert(1)',
        'MSFT" onmouseover="alert(1)',
        'MSFT?x=1'
    ];
    const carrier = carrying[0];
    hostileSubjects.forEach((subject) => {
        const href = INTEL.describeDimensionOwner(registry, carrier.dimensionId, subject).ownerDeepLink;
        const prefix = carrier.ownerDeepLink + '?' + carrier.ownerSubjectParam + '=';
        assert.ok(href.startsWith(prefix), subject + ' stays behind the validated route file');
        /* No scheme, no authority, no second parameter, no fragment, no traversal, no quote —
           the whole href is the validated route plus one percent-encoded value. */
        assert.match(href, /^[A-Za-z0-9._-]+\.html\?[A-Za-z][A-Za-z0-9_]*=[A-Za-z0-9%._~!*'()-]+$/,
            subject + ' produced ' + href);
        const resolved = new URL(href, 'https://example.test/lab/');
        assert.equal(resolved.origin, 'https://example.test', subject + ' left the origin');
        assert.equal(resolved.pathname, '/lab/' + carrier.ownerDeepLink, subject + ' left the path');
        assert.equal(resolved.hash, '', subject + ' introduced a fragment');
        assert.equal([...resolved.searchParams.keys()].length, 1, subject + ' introduced a parameter');
        /* Encoded, not discarded: the target still reads back exactly what was passed. */
        assert.equal(resolved.searchParams.get(carrier.ownerSubjectParam), subject);
    });

    /* A hostile PARAMETER NAME is refused at the registry, so it never reaches an href. */
    ['tick er', 'ticker=x', 'ticker&x', '__proto__', 'a#b', '1ticker', ''].forEach((param) => {
        const poisoned = Object.assign({}, CONFIG, {
            coverageRegistry: CONFIG.coverageRegistry.map((row) => (
                row.ownerDeepLink === null ? row : Object.assign({}, row, { ownerSubjectParam: param })
            ))
        });
        if (param === '') {
            /* An empty string is "declares nothing". That is no longer a legal registry: a row
               that links to an owner and declares neither a subject parameter nor a bare-link
               reason is refused, so silence cannot pass as a decision. */
            assert.throws(
                () => INTEL.readCoverageRegistry(poisoned),
                (error) => error.code === 'C025-CONFIG-SCHEMA',
                'a linked row that declares neither field is refused'
            );
            return;
        }
        assert.throws(
            () => INTEL.readCoverageRegistry(poisoned),
            (error) => error.code === 'C025-CONFIG-SCHEMA',
            param + ' is refused as a subject parameter'
        );
    });

});

/* ---------------------------------------------------------------------------
 * Feature 027 Scope 3 — the registry, the declarations and the stated bare reasons.
 *
 * A row that links to an owner now has to SAY which of the two positions it holds: it either
 * carries the company, or it states why it cannot. Silence used to be indistinguishable from a
 * forgotten declaration, which is the defect these assertions close.
 * ------------------------------------------------------------------------- */

/* Rewrites one registry row by dimension id and leaves the other fourteen untouched, so each
   refusal below is provably caused by the single field under test. */
function withRow(dimensionId, patch) {
    return Object.assign({}, CONFIG, {
        coverageRegistry: CONFIG.coverageRegistry.map((row) => (
            row.dimensionId === dimensionId ? Object.assign({}, row, patch) : row
        ))
    });
}

function refusalFor(config) {
    try {
        INTEL.readCoverageRegistry(config);
    } catch (error) {
        return error;
    }
    return null;
}

test('a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id', () => {
    /* `performance` links to market-brief.html. Stripping its reason leaves a link with no
       stated position, which is exactly the shape that shipped undetected before this scope. */
    const error = refusalFor(withRow('performance', { ownerBareReason: null }));
    assert.ok(error, 'a linked row declaring neither field is refused');
    assert.equal(error.code, 'C025-CONFIG-SCHEMA');
    assert.match(error.record.detail, /dimension: performance/);
    assert.match(error.message, /exactly one of a subject parameter and a bare-link reason/);

    /* ADVERSARIAL COUNTER-CASE: the guard is not refusing everything. The shipped registry,
       and the same row with its reason restored, both read. */
    assert.equal(INTEL.readCoverageRegistry(CONFIG).rows.length, 15);
    assert.equal(refusalFor(withRow('performance', { ownerBareReason: 'market-scoped' })), null);
});

test('a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id', () => {
    /* `volatility` carries the company. Adding a bare reason on top would claim both positions
       at once, so the reader could not tell which one the link actually holds. */
    const error = refusalFor(withRow('volatility', { ownerBareReason: 'fixed-subject' }));
    assert.ok(error, 'a linked row declaring both fields is refused');
    assert.equal(error.code, 'C025-CONFIG-SCHEMA');
    assert.match(error.record.detail, /dimension: volatility/);
    assert.match(error.message, /exactly one of a subject parameter and a bare-link reason/);

    /* The same row without the added reason still reads and still carries the company. */
    assert.equal(refusalFor(withRow('volatility', {})), null);
    assert.equal(INTEL.describeDimensionOwner(
        INTEL.readCoverageRegistry(CONFIG), 'volatility', 'MSFT').carriesSubject, true);
});

test('an ownerSubjectParam on a row with no ownerDeepLink raises C025-CONFIG-SCHEMA naming its dimension id', () => {
    /* A parameter names the query key a ROUTE reads a company from. Declared on a row that has
       no route, it is a half-declared owner: the reader is told how the company travels while
       nothing carries it. The mirror case — a bare reason with no route — is asserted in the
       enum test below; this is the half the sibling guard does not reach.

       Every ownerless row is exercised, not merely the first, because a guard that fired for
       one dimension and not the rest would still pass a single-row probe. */
    const ownerless = INTEL.readCoverageRegistry(CONFIG).rows
        .filter((row) => row.ownerDeepLink === null)
        .map((row) => row.dimensionId);
    assert.deepEqual(ownerless.slice().sort(),
        ['company-risk', 'financial-events', 'market-regime', 'non-financial-events'],
        'the ownerless set is the one this assertion claims to walk');

    ownerless.forEach((dimensionId) => {
        const error = refusalFor(withRow(dimensionId, { ownerSubjectParam: 'ticker' }));
        assert.ok(error, dimensionId + ': a subject parameter with no owner route is refused');
        assert.equal(error.code, 'C025-CONFIG-SCHEMA', dimensionId);
        assert.match(error.record.detail, new RegExp('dimension: ' + dimensionId), dimensionId);
        assert.match(error.message, /declares a subject parameter without an owner route/, dimensionId);
        /* Named by the guard under test, not by a neighbour that happens to share the code. */
        assert.ok(!/bare-link reason/.test(error.message), dimensionId + ' was refused by the wrong guard');
        assert.ok(!/exactly one of/.test(error.message), dimensionId + ' was refused by the wrong guard');
    });

    /* ADVERSARIAL COUNTER-CASE: the guard is not refusing every ownerless row. Each one reads
       untouched, and the parameter is legal on a row that does have a route to carry it. */
    ownerless.forEach((dimensionId) => {
        assert.equal(refusalFor(withRow(dimensionId, {})), null, dimensionId + ' reads untouched');
    });
    assert.equal(refusalFor(withRow('volatility', { ownerSubjectParam: 'ticker' })), null,
        'a subject parameter on a routed row is legal');
});

test('a declared ownerSubjectParam that is not a plain identifier raises C025-CONFIG-SCHEMA naming that guard', () => {
    /* The sibling guard four lines below the one above. The hostile-parameter-name loop at the
       end of the previous section looked like it covered this, and does not: it rewrites every
       linked row, so a bare row gains a second declaration and is refused by the "exactly one
       of" rule before the identifier rule is ever consulted. Only a row that ALREADY carries a
       subject parameter reaches this guard, and the message is matched so a refusal from the
       neighbouring rule cannot be mistaken for this one. */
    ['tick er', 'ticker=x', 'ticker&x', 'a#b', '1ticker', 'ticker-1', '__proto__.x', 'ti%20cker']
        .forEach((param) => {
            const error = refusalFor(withRow('volatility', { ownerSubjectParam: param }));
            assert.ok(error, JSON.stringify(param) + ' is refused as a subject parameter');
            assert.equal(error.code, 'C025-CONFIG-SCHEMA', JSON.stringify(param));
            assert.match(error.record.detail, /dimension: volatility/, JSON.stringify(param));
            assert.match(error.message, /declares a subject parameter that is not a plain identifier/,
                JSON.stringify(param));
        });

    /* ADVERSARIAL COUNTER-CASE: the guard admits the identifiers it is supposed to admit, so
       it is not simply refusing every rewrite of this row. */
    ['ticker', 'symbol', 't', 'subject_id', 'Ticker9'].forEach((param) => {
        assert.equal(refusalFor(withRow('volatility', { ownerSubjectParam: param })), null, param);
    });
});

test('an ownerBareReason outside the closed enum, and an ownerBareReason on a row with no ownerDeepLink, each raise C025-CONFIG-SCHEMA', () => {
    /* The enum is closed so operator-authored wording cannot reach a rendering path. A third
       value, however plausible, is refused rather than rendered. */
    ['company-scoped', 'MARKET-SCOPED', 'market scoped', 'other', 'fixed_subject', 42, true, {}]
        .forEach((value) => {
            const error = refusalFor(withRow('performance', { ownerBareReason: value }));
            assert.ok(error, JSON.stringify(value) + ' is refused as a bare-link reason');
            assert.equal(error.code, 'C025-CONFIG-SCHEMA', JSON.stringify(value));
            assert.match(error.record.detail, /dimension: performance/);
            assert.match(error.message, /outside the closed enum/, JSON.stringify(value));
        });

    /* A reason with no route to be bare ABOUT is a half-declared owner. */
    const orphan = refusalFor(withRow('company-risk', { ownerBareReason: 'market-scoped' }));
    assert.ok(orphan, 'a bare reason on an ownerless row is refused');
    assert.equal(orphan.code, 'C025-CONFIG-SCHEMA');
    assert.match(orphan.record.detail, /dimension: company-risk/);
    assert.match(orphan.message, /bare-link reason without an owner route/);

    /* ADVERSARIAL COUNTER-CASE: both admitted members are accepted on a linked row. */
    ['market-scoped', 'fixed-subject'].forEach((value) => {
        assert.equal(refusalFor(withRow('performance', { ownerBareReason: value })), null, value);
    });
});

test('a market-scoped row composes a bare href and its statement says the owner answers a market-wide question', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const marketScoped = registry.rows.filter((row) => row.ownerBareReason === 'market-scoped');
    assert.deepEqual(marketScoped.map((row) => row.dimensionId).sort(),
        ['geopolitics', 'performance', 'sentiment']);
    marketScoped.forEach((row) => {
        const described = INTEL.describeDimensionOwner(registry, row.dimensionId, 'MSFT');
        assert.equal(described.hasOwner, true, row.dimensionId);
        assert.equal(described.carriesSubject, false, row.dimensionId);
        /* Bare means bare: no query, no fragment, nothing appended to the route file. */
        assert.equal(described.ownerDeepLink, row.ownerDeepLink, row.dimensionId);
        assert.match(described.ownerDeepLink, /^[A-Za-z0-9._-]+\.html$/, row.dimensionId);
        assert.match(described.statement, /answers a market-wide question rather than a company one/,
            row.dimensionId);
        assert.match(described.statement, /so the link carries no company/, row.dimensionId);
    });
});

test('a fixed-subject row composes a bare href and its statement says the owner opens on its own subject', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const fixed = registry.rows.filter((row) => row.ownerBareReason === 'fixed-subject');
    assert.deepEqual(fixed.map((row) => row.dimensionId).sort(),
        ['cycles', 'fundamentals', 'technicals', 'valuation']);
    fixed.forEach((row) => {
        const described = INTEL.describeDimensionOwner(registry, row.dimensionId, 'MSFT');
        assert.equal(described.hasOwner, true, row.dimensionId);
        assert.equal(described.carriesSubject, false, row.dimensionId);
        assert.equal(described.ownerDeepLink, row.ownerDeepLink, row.dimensionId);
        assert.match(described.ownerDeepLink, /^[A-Za-z0-9._-]+\.html$/, row.dimensionId);
        assert.match(described.statement, /does not model an individual company you can choose/,
            row.dimensionId);
        assert.match(described.statement, /opens on that tool's own subject/, row.dimensionId);
    });

    /* The two reasons are distinguishable, which is the whole point of a two-member enum: a
       reader can tell a market-wide owner from a single-issuer one without opening either. */
    const marketStatement = INTEL.describeDimensionOwner(registry, 'performance', 'MSFT').statement;
    const fixedStatement = INTEL.describeDimensionOwner(registry, 'fundamentals', 'MSFT').statement;
    assert.notEqual(marketStatement, fixedStatement);
    assert.ok(!/answers a market-wide question/.test(fixedStatement));
    assert.ok(!/does not model an individual company/.test(marketStatement));

    /* describeDimensionOwner keeps its published contract: same version, same seven keys. */
    const described = INTEL.describeDimensionOwner(registry, 'fundamentals', 'MSFT');
    assert.equal(described.contractVersion, 'company-dimension-owner/v1');
    assert.deepEqual(Object.keys(described).sort(), [
        'carriesSubject', 'contractVersion', 'dimensionId', 'hasOwner',
        'ownerDeepLink', 'ownerToolId', 'statement'
    ]);
});

test('the shipped registry declares four subject-carrying rows, seven bare rows with a reason and four ownerless rows, and no market-scoped row carries a subject parameter', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);
    assert.equal(registry.rows.length, 15, 'the coverage registry declares fifteen rows');

    const carrying = registry.rows.filter((row) => row.ownerSubjectParam !== null);
    const bare = registry.rows.filter((row) => row.ownerBareReason !== null);
    const ownerless = registry.rows.filter((row) => row.ownerDeepLink === null);
    assert.equal(carrying.length, 4);
    assert.equal(bare.length, 7);
    assert.equal(ownerless.length, 4);
    assert.equal(carrying.length + bare.length + ownerless.length, registry.rows.length,
        'the three sets partition the registry exactly');

    assert.deepEqual(carrying.map((row) => row.dimensionId).sort(),
        ['dealer-gamma', 'options-flow', 'options-structure', 'volatility']);
    assert.deepEqual(ownerless.map((row) => row.dimensionId).sort(),
        ['company-risk', 'financial-events', 'market-regime', 'non-financial-events']);

    /* The rule walked over all fifteen rows, not merely over the ones it expected to find. */
    registry.rows.forEach((row) => {
        const declared = (row.ownerSubjectParam !== null ? 1 : 0) + (row.ownerBareReason !== null ? 1 : 0);
        assert.equal(declared, row.ownerDeepLink === null ? 0 : 1,
            row.dimensionId + ' declares the wrong number of owner fields');
        if (row.ownerBareReason !== null) {
            assert.ok(['market-scoped', 'fixed-subject'].includes(row.ownerBareReason), row.dimensionId);
            assert.equal(row.ownerSubjectParam, null, row.dimensionId);
        }
    });
});

test('every declared ownerSubjectParam is the single shared parameter name and no second convention exists', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const names = new Set(registry.rows
        .filter((row) => row.ownerSubjectParam !== null)
        .map((row) => row.ownerSubjectParam));
    assert.deepEqual([...names], ['ticker'], 'one parameter name, declared once, used everywhere');

    /* And it is the SAME name the shared receiving rule reads, so the sending and receiving
       halves cannot drift into two conventions that each look correct in isolation. The shared
       module is a UMD that publishes onto the global, so it is read back from there. */
    require_('../rlticker.js');
    const shared = globalThis.RLTKR;
    assert.equal(shared.SUBJECT_PARAM, 'ticker');
    assert.deepEqual([...names], [shared.SUBJECT_PARAM]);

    /* Each declared parameter has a committed reader: the route named by the row loads the
       shared module and calls the shared rule. A declaration with no reader is the defect
       FR-027-027 forbids, and it is checked against the route source rather than assumed. */
    registry.rows.filter((row) => row.ownerSubjectParam !== null).forEach((row) => {
        const source = readFileSync(join(ROOT, row.ownerDeepLink), 'utf8');
        assert.match(source, /rlticker\.js/, row.ownerDeepLink + ' loads the shared module');
        assert.match(source, /RLTKR\.linkedSubject\(/, row.ownerDeepLink + ' calls the shared rule');
    });
});

test('the excluded route retains a readable byte-stable v1 registry cache', () => {
    /* Scope 01 keeps the excluded Feature 025 route unchanged while the committed publication
       policy advances additively to v2. The route cache remains a readable historical v1 input. */
    const block = /<script type="application\/json" data-embedded-config="([^"]+)">([\s\S]*?)<\/script>/
        .exec(ROUTE_SOURCE);
    assert.ok(block, 'the route carries an embedded coverage registry block');
    assert.equal(block[1], 'company-intelligence.config.json', 'the block names the file it mirrors');
    const embedded = JSON.parse(block[2]);
    assert.deepEqual(embedded, CONFIG, 'the embedded registry equals the captured v1 route cache');

    /* The embedded copy really is a working registry, not merely equal-looking text. */
    assert.equal(INTEL.readCoverageRegistry(embedded).rows.length, 15);

    /* ADVERSARIAL COUNTER-CASE: the check can fail. A single drifted field is caught. */
    const drifted = JSON.parse(JSON.stringify(embedded));
    drifted.coverageRegistry[0].freshnessWindowDays += 1;
    assert.notDeepEqual(drifted, CONFIG, 'a one-field v1 cache drift is detectable');
});

test('readCoverageRegistry raises C025-REGISTRY-INCOMPLETE when a mandatory dimension is absent', () => {
    INTEL.MANDATORY_DIMENSION_IDS.forEach((dimensionId) => {
        const trimmed = Object.assign({}, CONFIG, {
            coverageRegistry: CONFIG.coverageRegistry.filter((row) => row.dimensionId !== dimensionId),
            horizons: CONFIG.horizons.map((horizon) => Object.assign({}, horizon, {
                primaryDimensionIds: horizon.primaryDimensionIds.filter((id) => id !== dimensionId)
            })).filter((horizon) => horizon.primaryDimensionIds.length > 0)
        });
        assert.throws(
            () => INTEL.readCoverageRegistry(trimmed),
            (error) => error.code === 'C025-REGISTRY-INCOMPLETE' || error.code === 'C025-CONFIG-SCHEMA',
            'removing ' + dimensionId + ' is refused'
        );
    });
    assert.equal(INTEL.readCoverageRegistry(PUBLICATION_CONFIG).rows.length, 15,
        'the additive v2 configuration is also admitted');
    assert.throws(
        () => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { contractVersion: 'company-intelligence-config/v3' })),
        (error) => error.code === 'C025-CONFIG-VERSION'
    );
    /* Both supported configurations pass, so the guard is not refusing everything. */
    assert.equal(INTEL.readCoverageRegistry(CONFIG).rows.length, 15);
});

test('the shipped configuration declares exactly fifteen registry rows and four horizons', () => {
    assert.equal(PUBLICATION_CONFIG.contractVersion, 'company-intelligence-config/v2');
    assert.equal(PUBLICATION_CONFIG.coverageRegistry.length, 15);
    assert.equal(PUBLICATION_CONFIG.horizons.length, 4);
    assert.equal(PUBLICATION_CONFIG.decisionTimeSource, 'caller');
    assert.equal(PUBLICATION_CONFIG.publication.branchBudget, 5);
    assert.ok(!Object.prototype.hasOwnProperty.call(PUBLICATION_CONFIG, 'maxBranches'));
    assert.ok(!/key|token|secret|password/i.test(JSON.stringify(PUBLICATION_CONFIG)), 'the config carries no credential');
    PUBLICATION_CONFIG.coverageRegistry.forEach((row) => {
        assert.ok(INTEL.HORIZON_RANKS.includes(row.maxHorizon), row.dimensionId);
        assert.equal(row.ownerToolId === null, row.ownerDeepLink === null, row.dimensionId);
    });
    /* Every dimension is a primary contributor to at least one horizon, so none is unreachable. */
    const claimed = new Set();
    PUBLICATION_CONFIG.horizons.forEach((horizon) => horizon.primaryDimensionIds.forEach((id) => claimed.add(id)));
    assert.deepEqual([...claimed].sort(), INTEL.MANDATORY_DIMENSION_IDS.slice().sort());

    /* Every other floor assertion in this suite compares the registry against
       MANDATORY_DIMENSION_IDS, so the floor was only ever verified against itself: dropping
       `geopolitics` from BOTH the constant and the config would keep all of them green.
       FR-025-004 names the fifteen dimensions in prose; this transcribes them independently. */
    const FLOOR_NAMED_BY_FR_025_004 = [
        'performance', 'fundamentals', 'valuation', 'technicals', 'cycles',
        'options-structure', 'dealer-gamma', 'options-flow', 'volatility',
        'financial-events', 'non-financial-events', 'geopolitics', 'market-regime',
        'sentiment', 'company-risk'
    ];
    assert.equal(FLOOR_NAMED_BY_FR_025_004.length, 15);
    assert.deepEqual(INTEL.MANDATORY_DIMENSION_IDS.slice().sort(), FLOOR_NAMED_BY_FR_025_004.slice().sort(),
        'the module constant carries exactly the fifteen dimensions FR-025-004 names');
    assert.deepEqual(PUBLICATION_CONFIG.coverageRegistry.map((row) => row.dimensionId).sort(), FLOOR_NAMED_BY_FR_025_004.slice().sort(),
        'the committed registry carries exactly the fifteen dimensions FR-025-004 names');
});

test('evidence families group every read exactly once and report what answered', () => {
    const { bundle } = richBundle();
    const grouped = INTEL.groupEvidenceFamilies(bundle);

    assert.equal(grouped.groupedCount, bundle.reads.length);
    grouped.families.forEach((family) => {
        assert.ok(INTEL.SOURCE_CLASSES.includes(family.familyId));
        assert.equal(family.dimensionIds.length, family.memberCount);
        assert.ok(family.answeredCount <= family.memberCount);
    });
    const allDimensions = grouped.families.flatMap((family) => family.dimensionIds).sort();
    assert.deepEqual(allDimensions, bundle.reads.map((read) => read.dimensionId).sort());
    assert.ok(grouped.families.some((family) => family.familyId === 'none' && family.answeredCount === 0),
        'the unsourced family answered nothing');
    assert.ok(grouped.families.some((family) => family.answeredCount > 0), 'some family answered');
});

test('sixteen adapters answer fifteen dimensions and every adapter identity is declared', () => {
    assert.equal(INTEL.ADAPTER_IDS.length, 16);
    assert.equal(new Set(INTEL.ADAPTER_IDS).size, 16);
    assert.equal(REGISTRY.rows.length, 15);
    INTEL.ADAPTER_IDS.forEach((adapterId) => {
        assert.ok(MODULE_SOURCE.includes(adapterId), 'the module declares ' + adapterId);
    });
    /* The performance dimension is the one two adapters answer, which is what makes a genuine
       source disagreement reachable at all. */
    const { bundle } = conflictedBundle();
    const performance = bundle.reads.find((read) => read.dimensionId === 'performance');
    assert.equal(performance.state, 'conflicted');
    assert.equal(performance.reasonCode, 'sources-disagree');
    const trailing = performance.values.filter((value) => value.valueId === 'performance-trailing-63');
    assert.equal(trailing.length, 2, 'both disagreeing numbers are retained');
    assert.notEqual(trailing[0].value, trailing[1].value);
    assert.equal(performance.directionalSignal, null, 'a conflicted dimension carries no direction');
    /* And a conflicted dimension reaches no horizon, so neither number wins by default. */
    INTEL.partitionByHorizon(bundle);
    composeAll(bundle).forEach((horizon) => {
        assert.ok(!horizon.contributingDimensionIds.includes('performance'), horizon.horizonId);
    });
    /* Non-vacuous: an aligned benchmark makes the same pair agree and read current. */
    assert.equal(richBundle().bundle.reads.find((read) => read.dimensionId === 'performance').state, 'current');
});

/* ==========================================================================
   Scope 3 — Company event capability (increment B).

   The event dimension gets a real producer. The chosen source is the SEC EDGAR
   company submissions endpoint, which needs no key and no account; its 8-K
   Item 2.02 rows are committed under data/company-intelligence/ with their own
   filing-index URL, so the route reads them same-origin and the module still
   performs no network call.
   ========================================================================== */

const EVENTS_FILE_PATH = join(ROOT, 'data', 'company-intelligence', 'company-msft', 'events.json');

/* Read lazily. A missing committed file must fail the tests that depend on it, not abort the
   whole file before the other assertions ever run. */
function eventsFile() {
    return JSON.parse(readFileSync(EVENTS_FILE_PATH, 'utf8'));
}

/* An event document shaped exactly like the committed one, so a test can vary one field
   without depending on whatever the real filing history currently holds. */
function eventDocument(events, overrides = {}) {
    return Object.assign({
        contractVersion: 'company-event-file/v1',
        subjectId: 'company:msft',
        sourceId: 'sec-edgar-submissions',
        sourceName: 'SEC EDGAR company submissions',
        sourceUrl: 'https://data.sec.gov/submissions/CIK0000789019.json',
        asOf: '2026-08-18',
        events
    }, overrides);
}

function occurredEarnings(overrides = {}) {
    return Object.assign({
        eventId: 'msft-earnings-2026-07-29',
        eventType: 'quarterly-results',
        eventClass: 'financial',
        date: '2026-07-29',
        dateClass: 'scheduled',
        observedOutcome: 'Results of operations were reported in an 8-K carrying Item 2.02.',
        sourceUrl: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526323632/0001193125-26-323632-index.htm',
        asOf: '2026-08-18',
        effectHorizonId: 'event'
    }, overrides);
}

function estimatedEarnings(overrides = {}) {
    return Object.assign({
        eventId: 'msft-earnings-2026-10-28',
        eventType: 'quarterly-results',
        eventClass: 'financial',
        date: '2026-10-28',
        dateClass: 'estimated',
        estimateBasis: 'The last eight Item 2.02 filings reported in January, April, July and October, each on the 28th, 29th or 30th.',
        sourceUrl: 'https://data.sec.gov/submissions/CIK0000789019.json',
        asOf: '2026-08-18',
        effectHorizonId: 'event'
    }, overrides);
}

function sourcedBundle(events) {
    const base = richBundle();
    const sources = sourcesOf(Object.assign({}, base.sources, { committedEvents: eventDocument(events) }));
    return { subject: base.subject, sources, data: base.data, bundle: INTEL.runAdapters(base.subject, sources, DECISION_TIME, base.data) };
}

/* ---------- 3.1 ---------- */

test('an event dated before decisionTime reclassifies to occurred and carries its observed outcome', () => {
    const produced = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([occurredEarnings(), estimatedEarnings()])
    }), DECISION_TIME);

    const passed = produced.find((event) => event.eventId === 'msft-earnings-2026-07-29');
    assert.equal(passed.dateClass, 'occurred', 'a date before the decision time is no longer a forecast');
    assert.ok(passed.observedOutcome.length > 20, 'the occurred event carries what was observed');
    assert.equal(passed.date, '2026-07-29', 'reclassification never rewrites the date');

    /* Non-vacuous: the same document read at a decision time BEFORE that date keeps it scheduled. */
    const earlier = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([occurredEarnings()])
    }), '2026-07-01T00:00:00.000Z');
    assert.equal(earlier[0].dateClass, 'scheduled');
    assert.equal(earlier[0].observedOutcome, null, 'an outcome is never claimed before the date passes');

    /* A future date is untouched by the same run. */
    const ahead = produced.find((event) => event.eventId === 'msft-earnings-2026-10-28');
    assert.equal(ahead.dateClass, 'estimated');
    assert.ok(ahead.estimateBasis.length > 20);
});

/* ---------- 3.2 ---------- */

test('an occurred event is absent from the upcoming catalyst list', () => {
    const selection = INTEL.selectRenderableEvents(INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([occurredEarnings(), estimatedEarnings()])
    }), DECISION_TIME));
    const catalysts = INTEL.selectUpcomingCatalysts(selection, DECISION_TIME);

    assert.equal(catalysts.contractVersion, 'company-upcoming-catalysts/v1');
    const upcomingIds = catalysts.upcoming.map((event) => event.eventId);
    const occurredIds = catalysts.occurred.map((event) => event.eventId);
    assert.ok(!upcomingIds.includes('msft-earnings-2026-07-29'), 'the passed event left the catalyst list');
    assert.ok(occurredIds.includes('msft-earnings-2026-07-29'), 'and it is recorded as an outcome instead');
    assert.deepEqual(upcomingIds, ['msft-earnings-2026-10-28'], 'only the dated event ahead remains a catalyst');
    /* Every renderable event lands in exactly one of the two lists, so none is silently dropped. */
    assert.equal(catalysts.upcoming.length + catalysts.occurred.length, selection.events.length);
    assert.equal(catalysts.emptyReason, null);

    /* An empty catalyst list states its reason rather than rendering as a blank. */
    const onlyPast = INTEL.selectUpcomingCatalysts(
        INTEL.selectRenderableEvents(INTEL.publicScheduleSource(subjectOf(), sourcesOf({
            committedEvents: eventDocument([occurredEarnings()])
        }), DECISION_TIME)), DECISION_TIME);
    assert.deepEqual(onlyPast.upcoming, []);
    assert.ok(onlyPast.emptyReason.length > 10, 'an empty list names why it is empty');
});

/* ---------- 3.3 ---------- */

test('a sourced schedule yields dateClass scheduled and a pattern yields dateClass estimated with a basis', () => {
    const produced = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([
            occurredEarnings({ eventId: 'msft-scheduled-ahead', date: '2026-09-30', observedOutcome: null }),
            estimatedEarnings()
        ])
    }), DECISION_TIME);

    const scheduled = produced.find((event) => event.eventId === 'msft-scheduled-ahead');
    assert.equal(scheduled.dateClass, 'scheduled');
    assert.equal(scheduled.estimateBasis, null, 'a scheduled date states no estimate basis');
    const estimated = produced.find((event) => event.eventId === 'msft-earnings-2026-10-28');
    assert.equal(estimated.dateClass, 'estimated');
    assert.ok(estimated.estimateBasis.length > 20, 'an estimated date states the basis of the estimate');

    /* An estimated date whose basis is empty never reaches the rendered set. */
    const refused = INTEL.selectRenderableEvents(INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([estimatedEarnings({ eventId: 'msft-basisless', estimateBasis: '' })])
    }), DECISION_TIME));
    assert.deepEqual(refused.events, []);
    assert.equal(refused.refusals.length, 1);
    assert.equal(refused.refusals[0].code, 'C025-READ-CONTRACT');
    assert.ok(refused.refusals[0].message.includes('estimate basis'));
});

/* ---------- 3.4 ---------- */

test('a non-financial event missing sourceUrl or asOf never reaches the rendered set', () => {
    const complete = occurredEarnings({
        eventId: 'msft-regulatory-hearing', eventType: 'regulatory-hearing', eventClass: 'non-financial',
        date: '2026-09-15', observedOutcome: null
    });
    const produced = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([
            complete,
            Object.assign({}, complete, { eventId: 'msft-no-url', sourceUrl: null }),
            Object.assign({}, complete, { eventId: 'msft-no-as-of', asOf: null })
        ])
    }), DECISION_TIME);
    const selection = INTEL.selectRenderableEvents(produced);

    assert.deepEqual(selection.events.map((event) => event.eventId), ['msft-regulatory-hearing']);
    assert.equal(selection.refusals.length, 2);
    selection.refusals.forEach((refusal) => assert.ok(refusal.message.includes('source url and as-of pair')));
    /* The suppressed pair leaves no partial row anywhere the route could render. */
    const catalysts = INTEL.selectUpcomingCatalysts(selection, DECISION_TIME);
    const shownIds = catalysts.upcoming.concat(catalysts.occurred).map((event) => event.eventId);
    assert.ok(!shownIds.includes('msft-no-url') && !shownIds.includes('msft-no-as-of'));
});

/* ---------- 3.5 ---------- */

test('a company with no sourced event keeps the event horizon at none direction and absent quality', () => {
    /* No committedEvents key at all: the source answers with an empty set rather than throwing. */
    const produced = INTEL.publicScheduleSource(subjectOf(), sourcesOf(), DECISION_TIME);
    assert.deepEqual(produced, []);

    const { bundle } = richBundle();
    const eventHorizon = INTEL.composeEvent(INTEL.partitionByHorizon(bundle).event, REGISTRY, DECISION_TIME);
    assert.equal(eventHorizon.direction, 'none');
    assert.equal(eventHorizon.evidenceQuality, 'absent');
    assert.equal(bundle.reads.find((read) => read.dimensionId === 'financial-events').state, 'unavailable');
    assert.equal(bundle.reads.find((read) => read.dimensionId === 'financial-events').reasonCode, 'no-source-wired');

    /* A document that names another company reaches this subject's run with nothing. */
    const foreign = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument([occurredEarnings()], { subjectId: 'company:ko' })
    }), DECISION_TIME);
    assert.deepEqual(foreign, []);
});

/* ---------- 3.8: FR-025-027 schema floor ---------- */

test('every event the public schedule source produces carries a type, a date, a date class and a source class', () => {
    const produced = INTEL.publicScheduleSource(subjectOf(), sourcesOf({
        committedEvents: eventDocument(eventsFile().events)
    }), DECISION_TIME);
    assert.ok(produced.length >= 4, produced.length + ' committed events reached the source');

    produced.forEach((event) => {
        assert.equal(event.contractVersion, 'company-event/v1', event.eventId);
        assert.ok(event.eventType.length > 0, event.eventId);
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(event.date), event.eventId);
        assert.ok(INTEL.DATE_CLASSES.includes(event.dateClass), event.eventId);
        assert.ok(INTEL.SOURCE_CLASSES.includes(event.sourceClass), event.eventId + ' declares a source class');
        assert.equal(event.sourceClass, 'committed-file', event.eventId);
        assert.ok(event.sourceName.length > 0, event.eventId);
    });

    /* The selection keeps the source class rather than dropping it on the way to the route. */
    INTEL.selectRenderableEvents(produced).events.forEach((event) => {
        assert.ok(INTEL.SOURCE_CLASSES.includes(event.sourceClass), event.eventId);
    });
    /* Adversarial: an event with no source class is refused rather than rendered unlabelled. */
    const unlabelled = INTEL.selectRenderableEvents([Object.assign({ contractVersion: 'company-event/v1', subjectId: 'company:msft' },
        occurredEarnings(), { sourceClass: undefined, dateClass: 'occurred' })]);
    assert.deepEqual(unlabelled.events, []);
    assert.equal(unlabelled.refusals[0].code, 'C025-READ-CONTRACT');
    assert.ok(unlabelled.refusals[0].message.includes('source class'));
});

/* ---------- 3.9: the dimension states move ---------- */

test('the financial event dimension moves to current from a sourced document while the non-financial one keeps no-source-exists', () => {
    const before = richBundle().bundle.reads.find((read) => read.dimensionId === 'financial-events');
    assert.equal(before.state, 'unavailable');
    assert.equal(before.reasonCode, 'no-source-wired');

    const { bundle } = sourcedBundle(eventsFile().events);
    const financial = bundle.reads.find((read) => read.dimensionId === 'financial-events');
    assert.equal(financial.state, 'current');
    assert.equal(financial.reasonCode, null);
    assert.equal(financial.sourceClass, 'committed-file');
    assert.ok(financial.values.length > 0, 'a current dimension publishes its numbers');
    financial.values.forEach((value) => {
        assert.ok(INTEL.PROVENANCE_CLASSES.includes(value.provenanceClass), value.valueId);
        assert.ok(value.sourceName.length > 0, value.valueId);
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(value.asOf), value.valueId);
    });

    /* Non-financial events have no source at all, so that dimension is unchanged. */
    const nonFinancial = bundle.reads.find((read) => read.dimensionId === 'non-financial-events');
    assert.equal(nonFinancial.state, 'unavailable');
    assert.equal(nonFinancial.reasonCode, 'no-source-exists');
    assert.deepEqual(nonFinancial.values, []);

    /* The coverage account still holds one row per dimension and totals still sum to fifteen. */
    const account = INTEL.buildCoverageAccount(bundle, REGISTRY);
    assert.equal(account.rows.length, 15);
    assert.equal(INTEL.EVIDENCE_STATES.reduce((total, state) => total + account.totals[state], 0), 15);

    /* And the event horizon now names financial-events as a contributor rather than a gap. */
    const horizon = INTEL.composeEvent(INTEL.partitionByHorizon(bundle).event, REGISTRY, DECISION_TIME);
    assert.ok(horizon.contributingDimensionIds.includes('financial-events'));
    assert.ok(!horizon.unavailableDimensionIds.includes('financial-events'));
    assert.ok(horizon.unavailableDimensionIds.includes('non-financial-events'));
});

/* ---------- 3.10: the committed data is real ---------- */

test('the committed MSFT event file is dated, sourced from the declared keyless source and free of any position value', () => {
    const file = eventsFile();
    assert.equal(file.contractVersion, 'company-event-file/v1');
    assert.equal(file.subjectId, 'company:msft');
    assert.equal(file.sourceId, CONFIG.eventSource.sourceId);
    assert.ok(file.sourceUrl.startsWith('https://data.sec.gov/'), file.sourceUrl);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(file.asOf));
    assert.ok(file.events.length >= 4, file.events.length + ' committed rows');

    file.events.forEach((event) => {
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(event.date), event.eventId);
        assert.ok(INTEL.DATE_CLASSES.includes(event.dateClass), event.eventId);
        assert.ok(event.sourceUrl.startsWith('https://'), event.eventId);
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(event.asOf), event.eventId);
        if (event.dateClass === 'estimated') assert.ok(event.estimateBasis.length > 20, event.eventId);
    });

    /* P13: tickers only. The committed file names no money, no size and no holding. */
    const text = JSON.stringify(file);
    assert.ok(!/cost basis|position|pnl|p&l|profit|shares held|portfolio/i.test(text), 'no position language');
    assert.ok(!/[$€£]\s*\d/.test(text), 'no currency amount');

    /* The config declares the covered subject and points at exactly this file. */
    const covered = CONFIG.eventSource.coveredSubjects.find((entry) => entry.subjectId === 'company:msft');
    assert.equal(covered.eventsPath, 'data/company-intelligence/company-msft/events.json');
    assert.ok(Number.isFinite(CONFIG.eventSource.freshnessWindowDays) && CONFIG.eventSource.freshnessWindowDays > 0);
    assert.ok(CONFIG.eventSource.accessTerms.length > 40, 'the access terms are stated');
    assert.ok(!/token|secret|password|api[_ -]?key/i.test(JSON.stringify(CONFIG.eventSource)),
        'the event source declaration carries no credential');
});

/* ---------- 3.11: the module keeps its purity after gaining a source ---------- */

test('the public schedule source performs no network call and refuses a caller with no decision time', () => {
    assert.ok(!/fetch\s*\(|XMLHttpRequest|require\s*\(\s*['"]https?/.test(MODULE_SOURCE),
        'the module still performs no network call of its own');

    let raised = null;
    try {
        INTEL.publicScheduleSource(subjectOf(), sourcesOf({ committedEvents: eventDocument([occurredEarnings()]) }), 'not-an-instant');
    } catch (error) { raised = error.code; }
    assert.equal(raised, 'C025-READ-CONTRACT');

    let raisedSubject = null;
    try {
        INTEL.publicScheduleSource({ contractVersion: 'wrong' }, sourcesOf(), DECISION_TIME);
    } catch (error) { raisedSubject = error.code; }
    assert.equal(raisedSubject, 'C025-READ-CONTRACT');

    let raisedCatalysts = null;
    try {
        INTEL.selectUpcomingCatalysts({ contractVersion: 'wrong' }, DECISION_TIME);
    } catch (error) { raisedCatalysts = error.code; }
    assert.equal(raisedCatalysts, 'C025-READ-CONTRACT');
});

/* ==========================================================================
   Scope 4 — Authored research plan and append-only versions (increment C).

   Two capabilities land here. The Research Agent authors discretionary branches
   in the run rather than reading them from a committed plan, and each run emits
   a write plan that creates exactly one new dated version file and advances the
   pointer. The module owns no filesystem, so the writer returns the operations
   it would perform and the route performs them. That keeps the append-only
   guarantee assertable: a test reads the operation list and proves no prior
   version path appears in it.
   ========================================================================== */

const VERSION_DIR = join(ROOT, 'data', 'company-intelligence', 'company-msft');
const PLAN_FILE_PATH = join(VERSION_DIR, 'plan-authored.json');
const POINTER_FILE_PATH = join(VERSION_DIR, 'current.json');
const PRIOR_VERSION_FILE_PATH = join(VERSION_DIR, 'versions', 'company-msft-2026-08-11.json');

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

/* A branch the agent authored in this run rather than one read from a committed plan. */
function authoredBranch(index = 0, overrides = {}) {
    return completeBranch(index, Object.assign({
        consulted: [{ kind: 'registered-tool', ref: 'company-fundamentals-lab', deepLink: 'company-fundamentals-lab.html' }]
    }, overrides));
}

function authoredDocument(branches, overrides = {}) {
    return Object.assign({
        contractVersion: 'company-authored-plan/v1',
        subjectId: 'company:msft',
        authoredBy: 'research-agent',
        authoredAt: '2026-08-18',
        branches
    }, overrides);
}

/* A committed version tree shaped exactly like the one on disk, so a test can vary one
   element without depending on whatever the real tree currently holds. */
function versionRecord(versionId, priorVersionId, composedAt) {
    const body = {
        contractVersion: 'company-read-version/v1',
        versionId,
        subjectId: 'company:msft',
        composedAt,
        priorVersionId,
        horizonSummaries: [{ horizonId: 'immediate', direction: 'flat', evidenceQuality: 'thin' }]
    };
    return Object.assign({}, body, {
        contentFingerprint: CONTRACTS.contentSha256(body, 'company-read-version/v1')
    });
}

function versionTree(records, currentVersionId) {
    return {
        pointer: currentVersionId === null ? null : {
            contractVersion: 'company-version-pointer/v1',
            subjectId: 'company:msft',
            versionId: currentVersionId
        },
        versions: records
    };
}

/* The composed parts a read version needs, so a version test states only what it varies. */
function versionParts(subject, priorVersionId, researchPlan = null) {
    const { bundle } = richBundle();
    return {
        subject,
        horizons: composeAll(bundle),
        coverageAccount: INTEL.buildCoverageAccount(bundle, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(bundle),
        contradictions: [],
        researchPlan: researchPlan || INTEL.agentAuthoredPlanSource(subject, sourcesOf()),
        events: INTEL.selectRenderableEvents([]),
        priorVersionId,
        refusals: []
    };
}

/* ---------- 4.1 ---------- */

test('a new version references its predecessor and every prior file keeps its original contentFingerprint', () => {
    const subject = subjectOf();
    const prior = versionRecord('company:msft:2026-08-11', null, '2026-08-11T00:00:00.000Z');
    const priorBefore = JSON.stringify(prior);
    const history = INTEL.readVersionHistory(subject, sourcesOf({
        versionTree: versionTree([prior], 'company:msft:2026-08-11')
    }));

    assert.equal(history.contractVersion, 'company-version-history/v1');
    assert.equal(history.currentVersionId, 'company:msft:2026-08-11');
    assert.equal(history.versions.length, 1);
    assert.deepEqual(history.refusals, []);

    /* The second run composes with the pointer as its predecessor. */
    const { bundle } = richBundle();
    const version = INTEL.buildReadVersion({
        subject,
        horizons: composeAll(bundle),
        coverageAccount: INTEL.buildCoverageAccount(bundle, REGISTRY),
        evidenceFamilies: INTEL.groupEvidenceFamilies(bundle),
        contradictions: [],
        researchPlan: INTEL.agentAuthoredPlanSource(subject, sourcesOf({
            authoredPlan: authoredDocument([authoredBranch(0)])
        })),
        events: INTEL.selectRenderableEvents([]),
        priorVersionId: history.currentVersionId,
        refusals: []
    }, DECISION_TIME);

    assert.equal(version.versionId, 'company:msft:2026-08-18', 'the new version is dated by its decision time');
    assert.equal(version.priorVersionId, history.versions[0].versionId, 'priorVersionId equals the predecessor versionId');

    const plan = INTEL.planVersionWrite(version, history);
    assert.equal(plan.contractVersion, 'company-version-write-plan/v1');
    assert.equal(plan.versionId, 'company:msft:2026-08-18');
    assert.equal(plan.priorVersionId, 'company:msft:2026-08-11');

    const created = plan.operations.filter((operation) => operation.operation === 'create');
    assert.equal(created.length, 1, 'exactly one new dated version file is created');
    assert.equal(created[0].path, 'data/company-intelligence/company-msft/versions/company-msft-2026-08-18.json');
    assert.equal(created[0].body.versionId, version.versionId);

    /* The predecessor object the history reported is byte-identical after the write plan
       is built, and its fingerprint still recomputes to the value it shipped with. */
    assert.equal(JSON.stringify(prior), priorBefore, 'the prior record is byte-unchanged');
    const recomputedBody = Object.assign({}, prior);
    delete recomputedBody.contentFingerprint;
    assert.equal(CONTRACTS.contentSha256(recomputedBody, 'company-read-version/v1'), prior.contentFingerprint,
        'the prior fingerprint still describes the prior bytes');
    assert.equal(history.versions[0].contentFingerprint, prior.contentFingerprint);
});

/* ---------- 4.2 ---------- */

test('the version writer opens no prior version file for writing', () => {
    const subject = subjectOf();
    const records = [
        versionRecord('company:msft:2026-08-04', null, '2026-08-04T00:00:00.000Z'),
        versionRecord('company:msft:2026-08-11', 'company:msft:2026-08-04', '2026-08-11T00:00:00.000Z')
    ];
    const history = INTEL.readVersionHistory(subject, sourcesOf({
        versionTree: versionTree(records, 'company:msft:2026-08-11')
    }));
    const version = INTEL.buildReadVersion(versionParts(subject, history.currentVersionId), DECISION_TIME);
    const plan = INTEL.planVersionWrite(version, history);

    /* Every existing version path is reported untouched, and no operation names one. */
    assert.equal(plan.untouchedPaths.length, 2);
    assert.deepEqual(plan.untouchedPaths.slice().sort(), [
        'data/company-intelligence/company-msft/versions/company-msft-2026-08-04.json',
        'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
    ]);
    plan.operations.forEach((operation) => {
        assert.ok(!plan.untouchedPaths.includes(operation.path),
            operation.operation + ' does not target an existing version file: ' + operation.path);
    });

    /* Only two operations exist, and only one of them writes inside versions/. */
    assert.equal(plan.operations.length, 2);
    const insideVersions = plan.operations.filter((operation) => operation.path.indexOf('/versions/') >= 0);
    assert.equal(insideVersions.length, 1);
    assert.equal(insideVersions[0].operation, 'create');

    /* The pointer advances to the new version and keeps the predecessor readable. */
    const pointer = plan.operations.find((operation) => operation.operation === 'advance-pointer');
    assert.equal(pointer.path, 'data/company-intelligence/company-msft/current.json');
    assert.equal(pointer.body.versionId, version.versionId);
    assert.equal(pointer.body.priorVersionId, 'company:msft:2026-08-11');
    assert.equal(pointer.body.contractVersion, 'company-version-pointer/v1');

    /* Authoring the same dated version twice is refused rather than silently overwriting. */
    const replayed = INTEL.readVersionHistory(subject, sourcesOf({
        versionTree: versionTree(records.concat([versionRecord(version.versionId, 'company:msft:2026-08-11', DECISION_TIME)]), version.versionId)
    }));
    const refused = INTEL.planVersionWrite(version, replayed);
    assert.equal(refused.contractVersion, 'company-intel-error/v1');
    assert.equal(refused.code, 'C025-READ-CONTRACT');
    assert.ok(refused.message.length > 20);
});

/* ---------- 4.2b: the first version and the pointer advance ---------- */

test('a first version carries a null priorVersionId and the pointer advances to it', () => {
    const subject = subjectOf();
    const history = INTEL.readVersionHistory(subject, sourcesOf({ versionTree: versionTree([], null) }));
    assert.equal(history.currentVersionId, null);
    assert.equal(history.versions.length, 0);
    assert.equal(history.emptyReason, 'no-committed-version');

    const version = INTEL.buildReadVersion(versionParts(subject, history.currentVersionId), DECISION_TIME);
    assert.equal(version.priorVersionId, null, 'a first version has no predecessor');

    const plan = INTEL.planVersionWrite(version, history);
    assert.equal(plan.priorVersionId, null);
    assert.deepEqual(plan.untouchedPaths, []);
    const pointer = plan.operations.find((operation) => operation.operation === 'advance-pointer');
    assert.equal(pointer.body.versionId, version.versionId);
    assert.equal(pointer.body.priorVersionId, null);
    assert.equal(pointer.body.contentFingerprint, version.contentFingerprint);
});

test('a silently edited prior version is refused as history and a version that skips the pointer refuses the write plan', () => {
    const subject = subjectOf();
    const intactRecord = versionRecord('company:msft:2026-08-11', null, '2026-08-11T00:00:00.000Z');
    const tampered = JSON.parse(JSON.stringify(intactRecord));
    /* One field rewritten in place, with the fingerprint the record shipped with left alone. */
    tampered.horizonSummaries[0].direction = 'constructive';
    assert.equal(tampered.contentFingerprint, intactRecord.contentFingerprint);

    const edited = INTEL.readVersionHistory(subject, sourcesOf({
        versionTree: versionTree([tampered], 'company:msft:2026-08-11')
    }));
    assert.equal(edited.versions.length, 0, 'the edited record is not presented as history');
    assert.equal(edited.currentVersionId, null, 'no current version is claimed from an unreadable record');
    assert.equal(edited.emptyReason, 'no-committed-version');
    assert.ok(edited.refusals.some((refusal) => refusal.code === 'C025-READ-CONTRACT' &&
        String(refusal.detail).includes('company:msft:2026-08-11')), 'the refusal names the edited version');

    /* Non-vacuous: the untouched record is accepted by the same call. */
    const intact = INTEL.readVersionHistory(subject, sourcesOf({
        versionTree: versionTree([intactRecord], 'company:msft:2026-08-11')
    }));
    assert.equal(intact.versions.length, 1);
    assert.equal(intact.currentVersionId, 'company:msft:2026-08-11');
    assert.deepEqual(intact.refusals, []);

    /* A composed version that does not reference the pointer would orphan the chain. */
    const orphan = INTEL.buildReadVersion(versionParts(subject, null), DECISION_TIME);
    assert.equal(orphan.priorVersionId, null);
    const refused = INTEL.planVersionWrite(orphan, intact);
    assert.equal(refused.contractVersion, 'company-intel-error/v1');
    assert.equal(refused.code, 'C025-READ-CONTRACT');
    assert.ok(refused.message.includes('chain'));

    /* And the correctly chained version is accepted, so the refusal discriminates. */
    const chained = INTEL.buildReadVersion(versionParts(subject, intact.currentVersionId), DECISION_TIME);
    const plan = INTEL.planVersionWrite(chained, intact);
    assert.equal(plan.contractVersion, 'company-version-write-plan/v1');
    assert.deepEqual(plan.untouchedPaths, ['data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json']);
});

/* ---------- 4.3 ---------- */

test('an authored branch records all six mandatory fields and a missing field raises C025-PLAN-SCHEMA', () => {
    const subject = subjectOf();
    assert.equal(INTEL.MANDATORY_BRANCH_FIELDS.length, 6);

    const good = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([authoredBranch(0)])
    }));
    assert.equal(good.contractVersion, 'company-research-plan/v1');
    assert.equal(good.planSource, 'agent-authored');
    assert.equal(good.authoredBy, 'research-agent');
    assert.equal(good.authoredAt, '2026-08-18');
    assert.equal(good.branches.length, 1);
    assert.deepEqual(good.refusals, []);
    INTEL.MANDATORY_BRANCH_FIELDS.forEach((field) => {
        assert.ok(Object.prototype.hasOwnProperty.call(good.branches[0], field), 'the published branch records ' + field);
    });

    INTEL.MANDATORY_BRANCH_FIELDS.forEach((field) => {
        const broken = authoredBranch(0);
        delete broken[field];
        const plan = INTEL.agentAuthoredPlanSource(subject, sourcesOf({ authoredPlan: authoredDocument([broken]) }));
        assert.equal(plan.branches.length, 0, field + ' removal drops the branch');
        assert.equal(plan.refusals.length, 1, field + ' removal raises one refusal');
        assert.equal(plan.refusals[0].code, 'C025-PLAN-SCHEMA', field);
        assert.ok(plan.refusals[0].detail.includes(field), 'the refusal names ' + field);
    });

    /* An authored document with no authorship is refused rather than published as anonymous. */
    const anonymous = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([authoredBranch(0)], { authoredBy: '' })
    }));
    assert.equal(anonymous.branches.length, 0);
    assert.equal(anonymous.refusals[0].code, 'C025-PLAN-SCHEMA');
    assert.equal(anonymous.emptyReason, 'authorship-not-recorded');

    /* No authored document at all is an empty plan, never a fabricated one. */
    const absent = INTEL.agentAuthoredPlanSource(subject, sourcesOf());
    assert.deepEqual(absent.branches, []);
    assert.equal(absent.emptyReason, 'floor-was-sufficient');
    assert.equal(absent.planSource, 'none');
});

/* ---------- 4.4 ---------- */

test('an authored no-change branch survives publication with its explicit disposition', () => {
    const subject = subjectOf();
    const plan = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([
            authoredBranch(0, { disposition: 'no-change', result: 'The currency adjustment moved nothing.' }),
            authoredBranch(1, { disposition: 'changed', changedTargets: [{ horizonId: 'structural', field: 'evidenceQuality', from: 'narrow', to: 'thin' }] })
        ])
    }));

    assert.equal(plan.branches.length, 2);
    const kept = plan.branches.find((branch) => branch.disposition === 'no-change');
    assert.ok(kept, 'the no-change branch survived publication');
    assert.equal(kept.result, 'The currency adjustment moved nothing.');
    assert.deepEqual(kept.changedTargets, []);
    assert.equal(plan.refusals.length, 0);

    /* The plan survives the version it belongs to, so the record reaches the published run. */
    const version = INTEL.buildReadVersion(versionParts(subject, null, plan), DECISION_TIME);
    const dispositions = version.researchPlan.branches.map((branch) => branch.disposition).sort();
    assert.deepEqual(dispositions, ['changed', 'no-change']);
    assert.equal(version.researchPlan.planSource, 'agent-authored');
});

/* ---------- 4.5 ---------- */

test('an authored refused branch records its reason and changes no horizon field', () => {
    const subject = subjectOf();
    const plan = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([authoredBranch(0, {
            disposition: 'refused',
            refusalReason: 'The only answer sat behind a paid feed, so the branch bought no public evidence.',
            changedTargets: [],
            stoppedBy: 'guardrail'
        })])
    }));

    assert.equal(plan.branches.length, 1);
    assert.equal(plan.branches[0].disposition, 'refused');
    assert.ok(plan.branches[0].refusalReason.length > 20);
    assert.deepEqual(plan.branches[0].changedTargets, [], 'a refused branch changes nothing');

    /* A refused branch that claims a change is itself refused. */
    const contradictory = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([authoredBranch(0, {
            disposition: 'refused',
            refusalReason: 'The source needed a credential.',
            changedTargets: [{ horizonId: 'structural', field: 'direction', from: 'flat', to: 'constructive' }]
        })])
    }));
    assert.equal(contradictory.branches.length, 0);
    assert.equal(contradictory.refusals[0].code, 'C025-PLAN-SCHEMA');

    /* No horizon in the published version cites the refused branch's claim. */
    const version = INTEL.buildReadVersion(versionParts(subject, null, plan), DECISION_TIME);
    const claimIds = version.horizons.reduce((all, horizon) => all.concat(horizon.claims.map((claim) => claim.claimId)), []);
    assert.ok(!claimIds.includes(plan.branches[0].branchId), 'no horizon claim carries the refused branch id');
});

/* ---------- 4.6: the declared budget still refuses ---------- */

test('the authored branch budget still refuses one branch beyond maxBranches and the recorded budget is unchanged', () => {
    const subject = subjectOf();
    const atBudget = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument(Array.from({ length: REGISTRY.maxBranches }, (unused, index) => authoredBranch(index)))
    }));
    assert.equal(atBudget.branches.length, REGISTRY.maxBranches);
    assert.equal(atBudget.refusals.length, 0);
    assert.equal(atBudget.budgetRemaining, 0);

    const overBudget = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument(Array.from({ length: REGISTRY.maxBranches + 1 }, (unused, index) => authoredBranch(index)))
    }));
    assert.equal(overBudget.refusals.length, 1);
    assert.equal(overBudget.refusals[0].code, 'C025-PLAN-BUDGET');

    /* Raising the budget to pass a failing test is forbidden, so the recorded value is asserted
       against the shipped config rather than against whatever the test just exercised. */
    assert.equal(CONFIG.maxBranches, REGISTRY.maxBranches);
    assert.equal(CONFIG.maxBranches, 5);
});

/* ---------- 4.7: the two recorded decisions ---------- */

test('the configuration records the branch budget and the refused-branch counting decision with written rationales', () => {
    assert.ok(Number.isInteger(CONFIG.maxBranches) && CONFIG.maxBranches > 0);
    assert.ok(typeof CONFIG.branchBudgetRationale === 'string' && CONFIG.branchBudgetRationale.length > 120,
        'the chosen maxBranches integer carries a written rationale');
    assert.ok(CONFIG.branchBudgetRationale.includes(String(CONFIG.maxBranches)),
        'the rationale names the integer it justifies');

    assert.ok(CONFIG.refusedBranchCounting && typeof CONFIG.refusedBranchCounting === 'object');
    assert.equal(CONFIG.refusedBranchCounting.countsAgainstBudget, true);
    assert.ok(typeof CONFIG.refusedBranchCounting.rationale === 'string' && CONFIG.refusedBranchCounting.rationale.length > 120,
        'the refused-branch counting decision carries a written rationale');

    /* The recorded decision is not decorative: the module actually charges a refused branch. */
    const subject = subjectOf();
    const withRefusal = INTEL.agentAuthoredPlanSource(subject, sourcesOf({
        authoredPlan: authoredDocument([
            authoredBranch(0),
            authoredBranch(1, { disposition: 'refused', refusalReason: 'The source needed a credential.', stoppedBy: 'guardrail' })
        ])
    }));
    assert.equal(withRefusal.branches.length, 2);
    assert.equal(withRefusal.budgetRemaining, CONFIG.maxBranches - 2,
        'a refused branch is charged against the budget exactly as the config records');
});

/* ---------- 4.8: the committed authored plan and version tree are real ---------- */

test('the committed MSFT research plan and version tree are authored, dated and free of any position value', () => {
    const authored = readJson(PLAN_FILE_PATH);
    assert.equal(authored.contractVersion, 'company-authored-plan/v1');
    assert.equal(authored.subjectId, 'company:msft');
    assert.ok(authored.authoredBy.length > 0);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(authored.authoredAt));
    assert.ok(authored.branches.length >= 2, authored.branches.length + ' committed branches');
    authored.branches.forEach((branch) => {
        INTEL.MANDATORY_BRANCH_FIELDS.forEach((field) => {
            assert.ok(Object.prototype.hasOwnProperty.call(branch, field), branch.branchId + ' records ' + field);
        });
        assert.ok(INTEL.DISPOSITIONS.includes(branch.disposition), branch.branchId);
        assert.ok(INTEL.STOPPED_BY.includes(branch.stoppedBy), branch.branchId);
    });

    /* The committed document publishes through the real production source with zero refusals. */
    const plan = INTEL.agentAuthoredPlanSource(subjectOf(), sourcesOf({ authoredPlan: authored }));
    assert.equal(plan.branches.length, authored.branches.length);
    assert.deepEqual(plan.refusals, []);

    const pointer = readJson(POINTER_FILE_PATH);
    assert.equal(pointer.contractVersion, 'company-version-pointer/v1');
    assert.equal(pointer.subjectId, 'company:msft');

    const prior = readJson(PRIOR_VERSION_FILE_PATH);
    assert.equal(prior.versionId, pointer.versionId, 'the pointer names the committed version');
    const body = Object.assign({}, prior);
    delete body.contentFingerprint;
    assert.equal(CONTRACTS.contentSha256(body, 'company-read-version/v1'), prior.contentFingerprint,
        'the committed fingerprint really describes the committed bytes');

    /* P13: tickers only. Neither committed file names money, size or a holding. The word
       boundaries matter: `disposition` is a mandatory branch field and must not read as a
       holding, while a bare `position` still fails. */
    const text = JSON.stringify(authored) + JSON.stringify(prior) + JSON.stringify(pointer);
    assert.ok(!/cost basis|\bpositions?\b|\bpnl\b|p&l|\bprofit\b|shares held|\bportfolio\b/i.test(text), 'no position language');
    assert.ok(/\bpositions?\b/i.test('a 120 share position'), 'the position detector really fires');
    assert.ok(!/[$€£]\s*\d/.test(text), 'no currency amount');
});

/* ---------- AUD-025-F1: the four legs a mutation removed without breaking a single test ----------
 *
 * The audit phase deleted four implemented legs one at a time, on disk, and every one of the 70
 * unit tests, 29 browser tests and 3065 selftest assertions still passed. Each test below asserts
 * the leg's own outcome, so removing the leg turns the assertion red. Each also carries the
 * control that would still hold if the leg were dead code, which is what makes the pairing
 * evidence rather than coincidence.
 */

/* AUD-025-F1 / M14-recheck / FR-025-013.
   `envelopeSubjectMismatch` refuses a foreign owner envelope on three independent legs —
   `subjectId`, `ticker` and `cik`. Only the `subjectId` leg had a case, so an owner tool that
   keys its published read by ticker or by cik could have had its numbers adopted as this
   company's. */
test('adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused', () => {
    const subject = subjectOf();
    assert.equal(subject.ticker, 'MSFT');
    assert.equal(subject.cik, '0000789019', 'the cik leg has something to compare against');

    function volatilityReadFrom(metrics) {
        const bundle = INTEL.runAdapters(subject, sourcesOf(), DECISION_TIME, stubData({
            toolReads: {
                'volatility-sizing-lab': {
                    id: 'volatility-sizing-lab', asOf: '2026-08-16T00:00:00.000Z', metrics
                }
            }
        }));
        return { bundle, read: bundle.reads.find((read) => read.dimensionId === 'volatility') };
    }

    /* Ticker leg alone: no subjectId and no cik, so nothing but `ticker` can refuse this. */
    const byTicker = volatilityReadFrom({ ticker: 'AAPL', volPercentile: 91.5 });
    assert.equal(byTicker.read.state, 'unavailable', 'a foreign-ticker read never reaches a horizon');
    assert.equal(byTicker.read.reasonCode, 'read-company-mismatch');
    assert.deepEqual(byTicker.read.values, [], 'the other company\u2019s percentile is not carried');
    assert.equal(
        byTicker.bundle.refusals.filter((refusal) => refusal.code === 'C025-READ-COMPANY-MISMATCH').length, 1,
        'the ticker mismatch is accounted for as a refusal, not silently dropped'
    );
    assert.ok(!JSON.stringify(composeAll(byTicker.bundle)).includes('91.500'),
        'no horizon carries the foreign-ticker number');

    /* Cik leg alone: no subjectId and no ticker. */
    const byCik = volatilityReadFrom({ cik: '0000320193', volPercentile: 87.25 });
    assert.equal(byCik.read.state, 'unavailable');
    assert.equal(byCik.read.reasonCode, 'read-company-mismatch');
    assert.ok(!JSON.stringify(composeAll(byCik.bundle)).includes('87.250'),
        'no horizon carries the foreign-cik number');

    /* Controls. The own ticker reads through with a value, so neither leg is a blanket refusal,
       and the lower-case form proves the comparison really normalises case rather than always
       matching. The own cik does the same. */
    const ownTicker = volatilityReadFrom({ ticker: 'msft', volPercentile: 38.4 });
    assert.equal(ownTicker.read.state, 'current', 'the subject\u2019s own ticker is accepted');
    assert.equal(ownTicker.read.reasonCode, null);
    assert.equal(ownTicker.read.values.length, 1);
    assert.deepEqual(ownTicker.bundle.refusals.filter((r) => r.code === 'C025-READ-COMPANY-MISMATCH'), []);

    const ownCik = volatilityReadFrom({ cik: '0000789019', volPercentile: 38.4 });
    assert.equal(ownCik.read.state, 'current', 'the subject\u2019s own cik is accepted');

    /* The same two legs guard the fundamentals envelope, which is a different adapter reading a
       different source, so the refusal is a property of the shared check rather than of one path. */
    const foreignFundamentals = INTEL.runAdapters(subject, sourcesOf({
        fundamentalsRead: {
            ticker: 'AAPL', asOf: '2026-06-30', sourceName: 'SEC company facts publication',
            directionalSignal: 'constructive',
            facts: [{ factId: 'fcf-latest', label: 'Free cash flow, latest period', value: '77777.000', unit: 'usd-millions' }]
        }
    }), DECISION_TIME, stubData({}));
    const fundamentals = foreignFundamentals.reads.find((read) => read.dimensionId === 'fundamentals');
    assert.equal(fundamentals.reasonCode, 'read-company-mismatch', 'the fundamentals ticker leg fires too');
    assert.deepEqual(fundamentals.values, []);
    assert.ok(!JSON.stringify(composeAll(foreignFundamentals)).includes('77777.000'));
});

/* AUD-025-F1 / M17-recheck / FR-025-018.
   `buildCoverageAccount` refuses a read set that omits a registry dimension. Dropping the row
   instead would shorten the account silently, and the coverage floor exists precisely so a
   reader is told that a dimension went unanswered rather than never seeing it at all. */
test('the coverage account refuses a read set missing any one registry dimension rather than dropping the row', () => {
    const { bundle } = richBundle();

    /* Control: the complete set builds, so the refusal below is about absence, not about the
       account being broken for every input. */
    const complete = INTEL.buildCoverageAccount(bundle, REGISTRY);
    assert.equal(complete.rows.length, REGISTRY.rows.length);
    assert.ok(complete.rows.every((row) => row !== null && typeof row.state === 'string'));

    /* Every dimension in turn, so no single row carries the whole assertion. */
    assert.equal(REGISTRY.rows.length, 15);
    REGISTRY.rows.forEach((registryRow) => {
        const short = bundle.reads.filter((read) => read.dimensionId !== registryRow.dimensionId);
        assert.equal(short.length, REGISTRY.rows.length - 1, 'exactly one read was withheld');

        let raised = null;
        try {
            INTEL.buildCoverageAccount(short, REGISTRY);
        } catch (error) {
            raised = error;
        }
        assert.ok(raised, 'withholding ' + registryRow.dimensionId + ' refuses instead of returning an account');
        assert.equal(raised.code, 'C025-REGISTRY-INCOMPLETE', registryRow.dimensionId);
        assert.equal(raised.record.detail, registryRow.dimensionId,
            'the refusal names the dimension that produced no read');
    });
});

/* AUD-025-F1 / M11-recheck / FR-025-031.
   `selectUpcomingCatalysts` splits on the date as well as on `dateClass`. The date leg is the
   second line of defence behind `publicScheduleSource`, and it is the only one left for a caller
   that assembles a selection itself — `selectRenderableEvents` copies `dateClass` through
   untouched, so a past date still classed `scheduled` reaches the partition. */
test('a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast', () => {
    function scheduled(eventId, date) {
        return {
            contractVersion: 'company-event/v1', subjectId: 'company:msft', eventId,
            eventType: 'quarterly-results', eventClass: 'financial', date, dateClass: 'scheduled',
            sourceClass: 'committed-file', sourceName: 'issuer investor-relations page'
        };
    }

    const selection = INTEL.selectRenderableEvents([
        scheduled('msft-past-scheduled', '2026-07-29'),
        scheduled('msft-future-scheduled', '2026-10-28')
    ]);
    assert.deepEqual(selection.refusals, [], 'both events are renderable');
    /* The premise the date leg exists for: the selection really did keep a passed date classed
       `scheduled`, so `dateClass` alone cannot separate these two. */
    assert.equal(selection.events.find((event) => event.eventId === 'msft-past-scheduled').dateClass, 'scheduled');
    assert.equal(selection.events.find((event) => event.eventId === 'msft-future-scheduled').dateClass, 'scheduled');

    const catalysts = INTEL.selectUpcomingCatalysts(selection, DECISION_TIME);
    assert.equal(DECISION_TIME.slice(0, 10), '2026-08-18', 'one date sits behind the run and one ahead of it');
    assert.deepEqual(catalysts.occurred.map((event) => event.eventId), ['msft-past-scheduled'],
        'a date behind the run is an outcome, never a catalyst');
    assert.deepEqual(catalysts.upcoming.map((event) => event.eventId), ['msft-future-scheduled'],
        'a date ahead of the run stays a catalyst');
    assert.equal(catalysts.emptyReason, null, 'a populated catalyst list states no empty reason');

    /* When every sourced event has passed the region says so, which it can only do if the date
       leg moved them. */
    const allPassed = INTEL.selectUpcomingCatalysts(
        INTEL.selectRenderableEvents([scheduled('msft-past-scheduled', '2026-07-29')]), DECISION_TIME);
    assert.deepEqual(allPassed.upcoming, []);
    assert.equal(allPassed.occurred.length, 1);
    assert.ok(allPassed.emptyReason.includes('already passed'), allPassed.emptyReason);

    /* Non-vacuous the other way: read at a decision time BEFORE that date, the same event is a
       catalyst, so the partition is driven by the date and not by the event identity. */
    const earlier = INTEL.selectUpcomingCatalysts(
        INTEL.selectRenderableEvents([scheduled('msft-past-scheduled', '2026-07-29')]), '2026-07-01T00:00:00.000Z');
    assert.deepEqual(earlier.upcoming.map((event) => event.eventId), ['msft-past-scheduled']);
    assert.deepEqual(earlier.occurred, []);
});

/* AUD-025-F1 / M01-recheck / FR-025-006.
   `makeRead` refuses a non-current read whose reason code is outside the closed vocabulary.
   Reaching that guard needs a caller who supplies the reason code, and no such caller exists:
   `makeRead` is deliberately NOT exported, every one of its sixteen call sites passes a literal
   from REASON_CODES, and `mergeDimensionReads` only ever forwards a code an adapter already
   produced. So the shipped public API cannot exercise it, and no black-box assertion over the
   public surface can distinguish the guard from its removal.

   This test therefore re-evaluates the SHIPPED source, adding one key to the returned object and
   changing nothing else, so the production function body itself is under test. The guard is
   real, not decoration: the module's own comment says an unavailable state ALWAYS carries a
   named reason, and the coverage account, the horizon composers and the route's gap copy all
   read `reasonCode` on the assumption that it is one of the sixteen. */
test('makeRead refuses a non-current read whose reason code is outside the closed vocabulary', () => {
    const EXPORT_MARKER = '\n    return {\n        CONTRACT_VERSION: "company-intelligence/v1",';
    assert.equal(MODULE_SOURCE.split(EXPORT_MARKER).length - 1, 1, 'the export block is found exactly once');
    const probeSource = MODULE_SOURCE.replace(
        EXPORT_MARKER,
        '\n    return {\n        makeRead: makeRead,\n        CONTRACT_VERSION: "company-intelligence/v1",'
    );
    assert.notEqual(probeSource, MODULE_SOURCE, 'the probe really injected the extra export');
    assert.equal(probeSource.length - MODULE_SOURCE.length, '\n        makeRead: makeRead,'.length,
        'the probe added exactly one line and rewrote nothing else');

    /* `globalThis` is shadowed by a throwaway object so evaluating the probe cannot replace the
       real RLCOMPANYINTEL global for any other test in this file. */
    const sandbox = { exports: {} };
    new Function('module', 'globalThis', probeSource)(sandbox, {});
    const PROBE = sandbox.exports;

    /* The probe is the shipped module, not a paraphrase of it. */
    assert.equal(PROBE.CONTRACT_VERSION, INTEL.CONTRACT_VERSION);
    assert.deepEqual(PROBE.REASON_CODES, INTEL.REASON_CODES);
    assert.equal(PROBE.readCoverageRegistry(CONFIG).rows.length, REGISTRY.rows.length);
    assert.equal(typeof PROBE.makeRead, 'function');

    function spec(overrides) {
        return Object.assign({
            dimensionId: 'volatility', subjectId: 'company:msft', state: 'unavailable',
            reasonCode: 'no-owner', maxHorizon: 'structural', values: [], directionalSignal: null,
            ownerToolId: null, ownerDeepLink: null, sourceClass: 'none', sourceName: null,
            asOf: null, ageDays: null, limitations: []
        }, overrides);
    }
    function refusalFrom(overrides) {
        try {
            PROBE.makeRead(spec(overrides));
        } catch (error) {
            return error;
        }
        return null;
    }

    /* Controls: a named reason on a non-current read, and a null reason on a current read, both
       build. So the guard is not refusing everything. */
    const named = PROBE.makeRead(spec({ reasonCode: 'no-owner' }));
    assert.equal(named.state, 'unavailable');
    assert.equal(named.reasonCode, 'no-owner');
    const current = PROBE.makeRead(spec({ state: 'current', reasonCode: null, values: [] }));
    assert.equal(current.reasonCode, null);

    /* An invented reason code on a non-current read is refused. */
    const invented = refusalFrom({ state: 'unavailable', reasonCode: 'source-was-a-bit-quiet' });
    assert.ok(invented, 'an unnamed reason really refuses');
    assert.equal(invented.code, 'C025-READ-CONTRACT');
    assert.equal(invented.record.detail, 'dimension: volatility', 'the refusal names the dimension');

    /* A non-current read with NO reason at all is refused by the same guard, which is the case
       that would otherwise reach a reader as an unexplained gap. */
    const unexplained = refusalFrom({ state: 'stale', reasonCode: null });
    assert.ok(unexplained, 'a non-current read with no reason really refuses');
    assert.equal(unexplained.code, 'C025-READ-CONTRACT');

    /* Every one of the sixteen published codes is accepted, so the closed vocabulary the module
       exports and the vocabulary this guard enforces are the same list. */
    INTEL.REASON_CODES.forEach((reasonCode) => {
        const accepted = PROBE.makeRead(spec({ state: 'partial', reasonCode }));
        assert.equal(accepted.reasonCode, reasonCode, reasonCode + ' is accepted');
    });
    assert.equal(INTEL.REASON_CODES.length, 16);
});

/* ══════════════════ feature 027 security phase — the deep-link corridor ══════════════════
   Threat model. Every page in this repository serves script-src 'unsafe-inline', so an href
   that grows a scheme EXECUTES rather than being blocked, and esc() cannot neutralise a URL
   scheme. Feature 025 shipped exactly that defect on this surface. The corridor has two ends:
   rlcompanyintel.js::ownerRouteFor composes the link, and four routes read ?ticker= back
   through RLTKR.linkedSubject. Both ends are attacked here from the same corpus.

   Every hostile value below is SHORT ENOUGH to pass the receiver's 1..12 length bound, so the
   only thing that can refuse it is the character class. That is deliberate: a value refused
   for length would prove nothing about scheme, authority or markup safety. */

const SEC_RECEIVERS = Object.freeze([
    'options-structure-lab.html',
    'gamma-trading-lab.html',
    'volatility-sizing-lab.html',
    'options-flow-feed-lab.html'
]);
const SEC_RECEIVER_SOURCE = Object.freeze(SEC_RECEIVERS.map((name) => ({
    name,
    source: readFileSync(join(ROOT, name), 'utf8')
})));

/* Loading rlticker.js in Node runs its IIFE, which returns before touching the DOM and
   publishes the real rule on globalThis. Nothing here re-implements the grammar. */
require_('../rlticker.js');
const SEC_RULE = globalThis.RLTKR;

/* Scheme, authority and traversal probes that the existing corpora do not reach: case-shuffled
   schemes, leading control whitespace, backslash authorities, and single- and double-encoded
   bytes. All ≤12 characters after trim/upper-case. */
const SEC_SCHEME_CORPUS = Object.freeze([
    'javascript:', 'JaVaScRiPt:', 'JAVASCRIPT:', '\tjavascript:', '\njavascript:',
    ' javascript:', 'data:x', 'DATA:x', 'vbscript:x', 'VbScRiPt:x',
    '%6aavascrip', '%256a%2561'
]);
const SEC_AUTHORITY_CORPUS = Object.freeze([
    '//evil.co', '\\\\evil.co', '\\evil.co', 'https://e.co', 'HTTPS://e.co', '%2F%2Fe.co'
]);
const SEC_TRAVERSAL_CORPUS = Object.freeze([
    '../', '..\\', '%2e%2e%2f', '..%2f..', './..', 'a/../b'
]);
const SEC_INJECTION_CORPUS = Object.freeze([
    'A?x=1', 'A#frag', 'A&x=1', 'A=1', 'A;x=1', 'A%26x', 'A%3Fx', 'A%23f'
]);
/* The four characters that turn text into markup. Three bytes each, so nothing but the
   character class can be refusing them. */
const SEC_MARKUP_CORPUS = Object.freeze(['A<B', 'A>B', 'A&B', 'A"B', "A'B", 'A`B']);
const SEC_HOSTILE_CORPUS = Object.freeze(
    SEC_SCHEME_CORPUS
        .concat(SEC_AUTHORITY_CORPUS, SEC_TRAVERSAL_CORPUS, SEC_INJECTION_CORPUS, SEC_MARKUP_CORPUS)
);

test('027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment', () => {
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const carrying = registry.rows.filter((row) => row.ownerSubjectParam !== null);
    assert.ok(carrying.length > 0, 'the registry declares at least one subject-carrying owner');

    /* The corpus is only a probe of THIS property if the length bound is not doing the work. */
    SEC_HOSTILE_CORPUS.forEach((subject) => {
        assert.ok(subject.trim().toUpperCase().length <= 12,
            JSON.stringify(subject) + ' is long enough that the length bound could refuse it');
    });

    carrying.forEach((row) => {
        const prefix = row.ownerDeepLink + '?' + row.ownerSubjectParam + '=';
        SEC_HOSTILE_CORPUS.forEach((subject) => {
            const href = INTEL.describeDimensionOwner(registry, row.dimensionId, subject).ownerDeepLink;
            const label = row.dimensionId + ' ← ' + JSON.stringify(subject);
            assert.ok(href.startsWith(prefix), label + ' escaped the validated route file: ' + href);

            /* Resolve the way a browser would, from a nested directory so a traversal would show. */
            const resolved = new URL(href, 'https://lab.example/tools/deep/');
            assert.equal(resolved.protocol, 'https:', label + ' introduced a scheme');
            assert.equal(resolved.origin, 'https://lab.example', label + ' left the origin');
            assert.equal(resolved.pathname, '/tools/deep/' + row.ownerDeepLink, label + ' left the path');
            assert.equal(resolved.hash, '', label + ' introduced a fragment');
            assert.equal([...resolved.searchParams.keys()].length, 1, label + ' introduced a parameter');
            /* Encoded, never discarded. The composer trims surrounding whitespace and encodes the
               rest, so the target reads back exactly the trimmed value — a leading tab or newline
               is removed rather than smuggled through, and nothing else is altered. */
            assert.equal(resolved.searchParams.get(row.ownerSubjectParam), subject.trim(),
                label + ' was altered by more than the documented trim');
            assert.ok(!/^[\s]/.test(resolved.searchParams.get(row.ownerSubjectParam)),
                label + ' carried leading whitespace into the target');
            /* Nothing that closes a double-quoted HTML attribute survives into the href text.
               encodeURIComponent leaves the apostrophe alone, which is inert here because the
               only sink is setAttribute and the route builds no attribute by concatenation —
               both pinned by the ownerBareReason test below (innerHTML count is zero). */
            assert.ok(!/["<>]/.test(href.slice(prefix.length)),
                label + ' left an attribute-breaking character in the href');
        });
    });

    /* ADVERSARIAL COUNTER-CASE — the assertions above are not passing because everything is
       refused. A benign subject still composes a working, company-carrying link. */
    const benign = INTEL.describeDimensionOwner(registry, carrying[0].dimensionId, 'MSFT');
    assert.equal(benign.carriesSubject, true);
    assert.equal(new URL(benign.ownerDeepLink, 'https://lab.example/tools/deep/').searchParams
        .get(carrying[0].ownerSubjectParam), 'MSFT');

    /* The composition is safe by TWO independent mechanisms, and this separates them.
       POSITION neutralises the scheme, authority and traversal families: they sit after a
       validated `<file>.html?<param>=`, so they are already inert data even unencoded.
       encodeURIComponent neutralises the remaining families — a fragment, a second parameter
       and an attribute break — which is exactly the set that survives when it is removed.
       Naming that set beats a threshold: it says WHICH hazard the encoder is carrying. */
    const prefixOf = (row) => row.ownerDeepLink + '?' + row.ownerSubjectParam + '=';
    const unencoded = (row, value) => row.ownerDeepLink + '?' + row.ownerSubjectParam + '=' + String(value).trim();
    const leaked = SEC_HOSTILE_CORPUS.filter((subject) => {
        const href = unencoded(carrying[0], subject);
        const resolved = new URL(href, 'https://lab.example/tools/deep/');
        return resolved.hash !== ''
            || [...resolved.searchParams.keys()].length !== 1
            || resolved.pathname !== '/tools/deep/' + carrying[0].ownerDeepLink
            || /["<>]/.test(href.slice(prefixOf(carrying[0]).length));
    });
    assert.deepEqual(leaked, ['A#frag', 'A&x=1', 'A<B', 'A>B', 'A&B', 'A"B'],
        'removing encodeURIComponent must let exactly the fragment, second-parameter and '
        + 'attribute-break families through; a different set means the encoder is carrying a '
        + 'different hazard than this test claims (' + JSON.stringify(leaked) + ')');

    /* The complement is the positional claim: every scheme, authority and traversal probe stays
       inert even with the encoder removed, because the query position is what defuses it. */
    SEC_SCHEME_CORPUS.concat(SEC_AUTHORITY_CORPUS, SEC_TRAVERSAL_CORPUS).forEach((subject) => {
        const resolved = new URL(unencoded(carrying[0], subject), 'https://lab.example/tools/deep/');
        assert.equal(resolved.origin, 'https://lab.example',
            JSON.stringify(subject) + ' left the origin even from the query position');
        assert.equal(resolved.protocol, 'https:', JSON.stringify(subject) + ' introduced a scheme');
    });
});

test('027 security — the receiver refuses every hostile subject outright and returns no field carrying it', () => {
    SEC_HOSTILE_CORPUS.forEach((value) => {
        const read = SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent(value));
        const label = JSON.stringify(value);
        assert.equal(read.status, 'refused', label + ' was not refused: ' + JSON.stringify(read));
        assert.equal(read.subject, null, label + ' returned a subject');
        assert.equal(read.raw, null, label + ' returned the raw value');
        /* No accessor anywhere on the result may still be carrying the hostile text. */
        Object.keys(read).forEach((key) => {
            assert.notEqual(read[key], value, label + ' survived on result key ' + key);
        });
    });

    /* ADVERSARIAL COUNTER-CASE 1 — the rule is not refusing everything. */
    ['MSFT', 'BRK.B', 'brk.b', '  nvda  ', 'A', 'ABCDEFGHIJKL'].forEach((value) => {
        const read = SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent(value));
        assert.equal(read.status, 'accepted', value + ' should still be accepted');
        assert.equal(read.subject, value.trim().toUpperCase());
    });

    /* ADVERSARIAL COUNTER-CASE 2 — each family is refused by the CHARACTER CLASS, not by length
       or by some unrelated guard. A pattern widened by exactly the family's character admits it. */
    const widened = [
        [/^[A-Z0-9.\-:%]{1,12}$/, SEC_SCHEME_CORPUS],
        [/^[A-Z0-9.\-/\\:%]{1,12}$/, SEC_AUTHORITY_CORPUS],
        [/^[A-Z0-9.\-/\\%]{1,12}$/, SEC_TRAVERSAL_CORPUS],
        [/^[A-Z0-9.\-?#&=;%]{1,12}$/, SEC_INJECTION_CORPUS],
        [/^[A-Z0-9.\-<>&"'`]{1,12}$/, SEC_MARKUP_CORPUS]
    ];
    widened.forEach(([pattern, corpus]) => {
        const admitted = corpus.filter((value) => pattern.test(value.trim().toUpperCase()));
        assert.equal(admitted.length, corpus.length,
            'widening the class by this family admits all of it, proving the class is what refuses it '
            + '(' + admitted.length + '/' + corpus.length + ' under ' + pattern + ')');
    });
});

test('027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype', () => {
    /* Every value the receiver can accept, including the grammar-valid oddities D5 hands to
       catalog binding rather than to the grammar. */
    const accepted = ['MSFT', 'BRK.B', 'A-B', '..', '.', '-', '...........', 'ABCDEFGHIJKL',
        'CONSTRUCTOR', 'PROTOTYPE', '0', '..-..'];
    accepted.forEach((value) => {
        assert.equal(SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent(value)).status, 'accepted',
            value + ' must be accepted for this test to be probing the right values');
    });

    /* The path builder is lifted from production text, so this binds to the shipped expression
       rather than to a copy of it. All three subject-carrying chain routes share the shape. */
    const builders = SEC_RECEIVER_SOURCE
        .map((file) => ({ name: file.name, match: file.source.match(/function pagesUrl\(([A-Za-z]+)\)\s*\{\s*return\s*([^;]+);/) }))
        .filter((entry) => entry.match !== null);
    assert.equal(builders.length, 3, 'three receiver routes build a same-origin options path');
    builders.forEach((entry) => {
        const build = new Function(entry.match[1], 'return ' + entry.match[2] + ';');
        accepted.forEach((value) => {
            const url = new URL(build(value), 'https://lab.example/tools/');
            assert.equal(url.origin, 'https://lab.example', entry.name + ' ← ' + value + ' left the origin');
            assert.ok(url.pathname.startsWith('/tools/data/options/'),
                entry.name + ' ← ' + value + ' left data/options/: ' + url.pathname);
            /* Exactly one segment below the directory: a traversal would remove or add one. */
            assert.equal(url.pathname.slice('/tools/data/options/'.length).split('/').length, 1,
                entry.name + ' ← ' + value + ' introduced a path segment: ' + url.pathname);
            assert.equal(url.search, '', entry.name + ' ← ' + value + ' introduced a query');
        });
        /* ADVERSARIAL — the guard CAN fail, and encodeURIComponent is what stops it. Drop the
           encoder from the same production expression and a slash-bearing value walks straight
           out of the directory. The path is therefore safe by construction at the sink, not only
           by the receiver grammar upstream — two independent defences, and this proves both. */
        const unencodedBuild = new Function(entry.match[1],
            'return ' + entry.match[2].replace(/encodeURIComponent\(([A-Za-z]+)\)/, '$1') + ';');
        const escaped = new URL(unencodedBuild('../../etc'), 'https://lab.example/tools/');
        assert.ok(!escaped.pathname.startsWith('/tools/data/options/'),
            entry.name + ' path guard cannot fail even unencoded, so it proves nothing: ' + escaped.pathname);
        /* And the encoder still holds for that same value, which is the property under test. */
        const held = new URL(build('../../etc'), 'https://lab.example/tools/');
        assert.ok(held.pathname.startsWith('/tools/data/options/')
            && held.pathname.slice('/tools/data/options/'.length).split('/').length === 1,
            entry.name + ' let a slash-bearing value out of data/options/: ' + held.pathname);
        /* Upstream, the receiver refuses it before it ever reaches the builder. */
        assert.equal(SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent('../../etc')).status, 'refused');
    });

    /* No deep-link subject can NAME a browser storage container. Three routes settle this by
       using only literal keys, so a subject can at most be a value nested inside a fixed
       container. The fourth, options-flow-feed, genuinely COMPOSES a key — `rlOptFlow:<SYM>` —
       so for that route the proof is reachability instead: the composing functions are fed only
       from the closed UNIVERSE catalog and never from the linked subject. */
    let literalKeys = 0;
    let composedKeys = 0;
    SEC_RECEIVER_SOURCE.forEach((file) => {
        [...file.source.matchAll(/(?:localStorage|sessionStorage)\s*\.\s*(?:get|set|remove)Item\s*\(\s*([^,)]+)/g)]
            .forEach((match) => {
                const argument = match[1].trim();
                if (/^(['"])[^'"]*\1$/.test(argument)) { literalKeys += 1; return; }
                composedKeys += 1;
                assert.equal(file.name, 'options-flow-feed-lab.html',
                    file.name + ' newly composes a storage key from an expression: ' + argument);
                assert.match(argument, /^(?:LS|CACHE_PREFIX \+ sym)$/,
                    'an unreviewed storage-key expression appeared: ' + argument);
            });
    });
    assert.ok(literalKeys >= 8, 'the literal-key scan found real call sites to check (' + literalKeys + ')');
    assert.ok(composedKeys >= 1,
        'the composed-key branch found no call site, so the reachability proof below is vacuous');

    /* `LS` is a literal container name; `CACHE_PREFIX + sym` is the one key the subject could in
       principle reach. Every caller of the three functions that touch it passes UNIVERSE[...], so
       an accepted-but-uncatalogued subject can never mint a storage key. */
    const flow = SEC_RECEIVER_SOURCE.find((file) => file.name === 'options-flow-feed-lab.html').source;
    assert.match(flow, /var LS = "optFlowState", CACHE_PREFIX = "rlOptFlow:";/,
        'the flow route no longer declares its container names as literals');
    const cacheArguments = [...flow.matchAll(/(?:ensureChain|cacheGet|cachePut)\(\s*([A-Za-z_$][\w$.[\]]*)/g)]
        .map((match) => match[1]);
    assert.ok(cacheArguments.length >= 5, 'the cache call-site scan found real call sites (' + cacheArguments.length + ')');
    cacheArguments.forEach((argument) => {
        assert.match(argument, /^(?:UNIVERSE\[i\]|sym|s)$/,
            'a cache call site takes an argument that is neither the catalog nor a catalog-bound '
            + 'local, so the subject may now reach a storage key: ' + argument);
    });
    /* The two catalog-bound locals are themselves fed only from the catalog. */
    assert.match(flow, /var s = UNIVERSE\[i\+\+\];\s*\n\s*return ensureChain\(s, 12\)/,
        'the hydration worker no longer draws its symbol from the closed catalog');
    assert.equal((flow.match(/(?:ensureChain|cacheGet|cachePut)\(\s*FOCUS/g) || []).length, 0,
        'the linked subject is passed to a cache function, so it can mint a localStorage key');

    /* ADVERSARIAL — the reachability proof can fail. Feeding the subject to the cache is exactly
       the change it exists to catch, and the same scan flags it. */
    const regressed = flow.replace('return ensureChain(s, 12)', 'return ensureChain(FOCUS.subject, 12)');
    assert.notEqual(regressed, flow, 'the adversarial rewrite matched nothing, so it proves nothing');
    assert.equal((regressed.match(/(?:ensureChain|cacheGet|cachePut)\(\s*FOCUS/g) || []).length, 1,
        'the subject-to-cache scan cannot detect the shape it exists to catch');

    /* Prototype reach: normTicker upper-cases before the class test, and the class excludes the
       underscore, so no accepted subject can name a prototype-mutating property. */
    ['__proto__', 'constructor', 'prototype', '__PROTO__'].forEach((value) => {
        const read = SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent(value));
        assert.notEqual(read.subject, '__proto__', value + ' reached __proto__');
        assert.notEqual(read.subject, 'constructor', value + ' reached constructor');
    });
    const probe = {};
    probe[SEC_RULE.linkedSubject('?ticker=CONSTRUCTOR').subject] = { hostile: true };
    assert.equal(Object.getPrototypeOf(probe), Object.prototype, 'an accepted subject mutated a prototype');
    assert.equal(({}).hostile, undefined, 'an accepted subject polluted Object.prototype');
});

test('027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup', () => {
    /* The reason is a closed enum TODAY. This pins the SINK instead, because a later config edit
       that widened the enum would otherwise put operator wording on a rendering path. */
    assert.deepEqual(INTEL.OWNER_BARE_REASONS ?? ['market-scoped', 'fixed-subject'],
        ['market-scoped', 'fixed-subject']);

    /* The route renders through one element factory: text becomes textContent, attributes go
       through setAttribute, and the page has no markup sink at all. */
    assert.match(ROUTE_SOURCE, /function el\(tag, text, attributes\)[\s\S]{0,120}node\.textContent = String\(text\)/,
        'the element factory writes its text through textContent');
    assert.equal((ROUTE_SOURCE.match(/\.innerHTML\s*=/g) || []).length, 0,
        'the company route must have no innerHTML sink');
    assert.equal((ROUTE_SOURCE.match(/\.(?:outerHTML|insertAdjacentHTML)\s*[=(]/g) || []).length, 0,
        'the company route must have no outerHTML or insertAdjacentHTML sink');

    /* The bare-reason marker attribute carries the literal "true", never the reason value, so the
       reason cannot reach an attribute even indirectly. */
    const markers = [...ROUTE_SOURCE.matchAll(/"data-owner-bare-reason":\s*([^,}]+)/g)].map((m) => m[1].trim());
    assert.ok(markers.length > 0, 'the bare-reason marker is rendered somewhere');
    markers.forEach((value) => assert.equal(value, '"true"',
        'the bare-reason marker must be a literal, not the reason value: ' + value));

    /* ADVERSARIAL — a reason carrying a scheme and markup still lands only in the STATEMENT, and
       the statement is not the href. The href stays the validated route file. */
    const registry = INTEL.readCoverageRegistry(CONFIG);
    const bare = registry.rows.filter((row) => row.ownerToolId !== null && row.ownerSubjectParam === null);
    assert.ok(bare.length > 0, 'the registry still carries bare owner routes');
    bare.forEach((row) => {
        const described = INTEL.describeDimensionOwner(registry, row.dimensionId, 'MSFT');
        assert.match(described.ownerDeepLink, /^[A-Za-z0-9._-]+\.html$/,
            row.dimensionId + ' bare href is not a plain route file');
        /* An apostrophe in prose is not markup; the tag delimiters are. The statement is written
           through textContent, so this is depth rather than the primary defence. */
        assert.ok(!/[<>]/.test(described.statement), row.dimensionId + ' statement carries markup');
        assert.ok(described.statement.includes(row.ownerToolId),
            row.dimensionId + ' statement does not actually name its owner, so this check is vacuous');
    });

    /* A reason outside the closed enum is refused at the registry, so unreviewed wording never
       reaches the renderer in the first place. */
    ['<img src=x onerror=1>', 'javascript:alert(1)', 'market scoped', ''].forEach((reason) => {
        const poisoned = Object.assign({}, CONFIG, {
            coverageRegistry: CONFIG.coverageRegistry.map((row) => (
                row.ownerDeepLink === null || row.ownerBareReason === null || row.ownerBareReason === undefined
                    ? row
                    : Object.assign({}, row, { ownerBareReason: reason })
            ))
        });
        assert.throws(
            () => INTEL.readCoverageRegistry(poisoned),
            (error) => error.code === 'C025-CONFIG-SCHEMA',
            JSON.stringify(reason) + ' is refused as a bare-link reason'
        );
    });
});

test('027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes', () => {
    /* FIRST LINE OF DEFENCE — the receiver character class admits no markup metacharacter, so a
       deep link cannot deliver one to any sink on any of the four routes. */
    SEC_MARKUP_CORPUS.forEach((value) => {
        assert.equal(SEC_RULE.linkedSubject('?ticker=' + encodeURIComponent(value)).status, 'refused',
            JSON.stringify(value) + ' reached a route carrying markup');
    });
    assert.ok(!/[<>&"'`]/.test('ABCDEFGHIJKL'.replace(/[A-Z0-9.\-]/g, '')),
        'the accepted class contains no markup metacharacter');

    /* SECOND LINE OF DEFENCE — depth, not luck. The subject reaches innerHTML on the chain
       routes, so every markup sink that interpolates it must ALSO escape it. Without this, the
       whole surface rests on the grammar alone and a single widening becomes stored XSS.

       The scan must follow INDIRECTION. A route that writes markup through a helper — say
       `setStatus(s)` whose body does `e.innerHTML = ... + s + ...` — puts the subject into
       markup from a line that never contains the word innerHTML. A scan that only reads
       `.innerHTML =` lines returns a false all-clear on exactly that shape, so the writers are
       discovered first and their CALL SITES are scanned too. */
    /* The subject must be recognised WHEREVER it sits in the expression, not only after a `+`.
       A scan anchored on `+` reads the trailing shape `'…' + tk` and is blind to the three other
       shapes that reach the same sink: the subject in LEADING position (`yLink(state.ticker, …)`,
       `setStatus(tk + '…')`), the subject inside a TEMPLATE literal, and the subject LAUNDERED
       through an alias that a route assigns from it (`state.name = state.name || tk`). Each of
       those is refuted below, so no half of this scan is inert. */
    const SUBJECT_NAMES = '(?:state\\.ticker|state\\.name|tk|sym|FOCUS\\.subject|handoff\\.subject)';
    const SUBJECT_VARS = new RegExp('(?<![\\w$.])' + SUBJECT_NAMES + '(?![\\w$])', 'g');
    /* Only a CONCATENATION OPERAND or a template placeholder actually lands in the markup
       string. A condition (`state.ticker ? …`), a guard (`if (!tk)`) and an argument handed to
       an escaping or encoding helper (`esc(tk)`, `encodeURIComponent(state.ticker)`) all read
       the subject on a markup line without interpolating it, and flagging those would make the
       scan noise that a later reader silences. */
    const isWrapped = (before, after) => {
        if (/(?:esc|encodeURIComponent|escapeHtml|String)\(\s*$/.test(before)) return true;
        const inTemplate = /\$\{\s*$/.test(before) && /^\s*\}/.test(after);
        const operand = /\+\s*$/.test(before) || /^\s*\+/.test(after);
        return !(inTemplate || operand);
    };
    const offenders = [];
    SEC_RECEIVER_SOURCE.forEach((file) => {
        const lines = file.source.split(/\r?\n/);
        /* Helpers whose own body writes a parameter into markup. */
        const writers = new Set();
        lines.forEach((line) => {
            const declaration = line.match(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
            if (!declaration || !/\.innerHTML\s*=/.test(line)) return;
            const parameters = declaration[2].split(',').map((p) => p.trim()).filter(Boolean);
            if (parameters.some((p) => new RegExp('\\b' + p + '\\b').test(line.split('.innerHTML')[1] || ''))) {
                writers.add(declaration[1]);
            }
        });
        const callPattern = writers.size
            ? new RegExp('\\b(?:' + [...writers].join('|') + ')\\s*\\(')
            : null;
        lines.forEach((line, index) => {
            const direct = /\.innerHTML\s*=/.test(line);
            const indirect = callPattern !== null && callPattern.test(line) && !/function\s/.test(line);
            if (!direct && !indirect) return;
            /* These routes pack several statements onto one line, so a whole-line read would
               charge a markup line for an unrelated neighbour. Narrow a direct hit to the
               assignment's own right-hand side, and an indirect hit to the writer call itself. */
            let segment = line;
            let offset = 0;
            if (direct) {
                const assignment = line.search(/\.innerHTML\s*=/);
                const rest = line.slice(assignment);
                const end = rest.indexOf(';');
                offset = assignment;
                segment = end === -1 ? rest : rest.slice(0, end);
            } else {
                const call = line.search(callPattern);
                offset = call;
                segment = line.slice(call);
            }
            [...segment.matchAll(SUBJECT_VARS)].forEach((match) => {
                if (isWrapped(segment.slice(0, match.index), segment.slice(match.index + match[0].length))) return;
                offenders.push(file.name + ':' + (index + 1) + ' → ' + match[0]
                    + (direct ? ' (direct innerHTML)' : ' (via markup writer)') + ' @col' + (offset + match.index));
            });
        });
        /* The writer discovery must actually find something on a route that has one, otherwise
           the indirect half of this scan is silently inert. */
        if (/\.innerHTML\s*=/.test(file.source)) {
            assert.ok(writers.size > 0 || !/function\s+\w+\([^)]+\)[^\n]*\.innerHTML/.test(file.source),
                file.name + ' has a parameterised markup writer the scan failed to discover');
        }
    });
    assert.deepEqual(offenders, [],
        'a receiver puts the linked subject into markup without escaping it, so the deep-link '
        + 'corridor is protected only by the receiver grammar and a single widening of that '
        + 'grammar becomes stored XSS:\n  ' + offenders.join('\n  '));

    /* ADVERSARIAL — both halves of the scan can fail, and on the real shapes.
       (a) the direct shape. */
    const directBad = "        el('x').innerHTML = '<b>' + state.ticker + '</b>';";
    assert.equal([...directBad.matchAll(SUBJECT_VARS)].filter((m) => !isWrapped(directBad.slice(0, m.index))).length, 1,
        'the direct-sink scan cannot detect the shape it exists to catch');
    /* (b) the INDIRECT shape — the one that produced a false all-clear before this was fixed. */
    const indirectSource = [
        "    function setStatus(s, kind) { var e = el('status'); if (e) e.innerHTML = s; }",
        "      setStatus('<b>' + tk + '</b> is not in the cached snapshot', 'bad');"
    ].join('\n');
    const indirectWriters = new Set();
    indirectSource.split('\n').forEach((line) => {
        const declaration = line.match(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
        if (!declaration || !/\.innerHTML\s*=/.test(line)) return;
        const parameters = declaration[2].split(',').map((p) => p.trim()).filter(Boolean);
        if (parameters.some((p) => new RegExp('\\b' + p + '\\b').test(line.split('.innerHTML')[1] || ''))) {
            indirectWriters.add(declaration[1]);
        }
    });
    assert.deepEqual([...indirectWriters], ['setStatus'], 'the writer discovery missed a real markup writer');
    const indirectCall = indirectSource.split('\n')[1];
    assert.equal([...indirectCall.matchAll(SUBJECT_VARS)].filter((m) => !isWrapped(indirectCall.slice(0, m.index))).length, 1,
        'the indirect-sink scan cannot detect the shape it exists to catch');
    /* (c) and it clears an escaped call, so it would not refuse every fix. */
    const repaired = "      setStatus('<b>' + esc(tk) + '</b> is not in the cached snapshot', 'bad');";
    assert.equal([...repaired.matchAll(SUBJECT_VARS)].filter((m) => !isWrapped(repaired.slice(0, m.index), '')).length, 0,
        'the scan flags an escaped sink, so it would refuse every fix');
    /* (d) the three shapes the `+`-anchored scan was blind to. Each is a real shape a receiver
       has actually carried, so a regression to the narrow regex fails here rather than silently
       returning an all-clear. */
    const blindShapes = [
        ["leading position at a markup writer", "      setStatus(tk + ' is not in the cached snapshot', 'bad');"],
        ["leading position at a direct innerHTML", "      el('pillTk').innerHTML = yLink(state.ticker, state.ticker + '', tipFor(state.ticker));"],
        ["template-literal interpolation", "      el('x').innerHTML = `<b>${state.ticker}</b>`;"],
        ["alias a route assigns from the subject", "      setStatus('<b>' + state.name + '</b> missing', 'bad');"]
    ];
    blindShapes.forEach(([label, line]) => {
        const hits = [...line.matchAll(SUBJECT_VARS)]
            .filter((m) => !isWrapped(line.slice(0, m.index), line.slice(m.index + m[0].length)));
        assert.ok(hits.length > 0, 'the sink scan is blind to a real shape it exists to catch: ' + label);
    });
});

test('Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2', () => {
    const embeddedMatch = /<script type="application\/json" data-embedded-config="company-intelligence\.config\.json">([\s\S]*?)<\/script>/
        .exec(ROUTE_SOURCE);
    assert.ok(embeddedMatch, 'the excluded Feature 025 route retains its committed-first-read v1 configuration');
    const legacyConfig = JSON.parse(embeddedMatch[1]);
    assert.equal(legacyConfig.contractVersion, 'company-intelligence-config/v1');
    const legacyRegistry = INTEL.readCoverageRegistry(legacyConfig);
    assert.equal(legacyRegistry.rows.length, 15);
    assert.equal(legacyRegistry.maxBranches, 5);

    assert.equal(PUBLICATION_CONFIG.contractVersion, 'company-intelligence-config/v2');
    const policy = INTEL.readPublicationPolicy(PUBLICATION_CONFIG);
    assert.equal(policy.contractVersion, 'company-publication-policy/v1');
    assert.deepEqual(policy.coveredSubjects.map((subject) => subject.subjectId), ['company:msft']);
    assert.equal(policy.branchBudget, 5);
    const coveredPaths = [];
    const visit = (value, at = '') => {
        if (!value || typeof value !== 'object') return;
        Object.keys(value).forEach((key) => {
            const next = at ? at + '.' + key : key;
            if (key === 'coveredSubjects') coveredPaths.push(next);
            visit(value[key], next);
        });
    };
    visit(PUBLICATION_CONFIG);
    assert.deepEqual(coveredPaths, ['publication.coveredSubjects']);
    const duplicatedAuthority = structuredClone(PUBLICATION_CONFIG);
    duplicatedAuthority.eventSource.coveredSubjects = [{
        subjectId: 'company:msft',
        eventsPath: 'data/company-intelligence/company-msft/events.json'
    }];
    assert.throws(() => INTEL.readPublicationPolicy(duplicatedAuthority),
        (error) => error.code === 'C028-SUBJECT-POLICY');
    const currentRegistry = INTEL.readCoverageRegistry(PUBLICATION_CONFIG);
    assert.equal(currentRegistry.rows.length, 15);
    assert.equal(currentRegistry.maxBranches, policy.branchBudget);
    assert.deepEqual(currentRegistry.researchRecordSubjects, ['company:msft']);
    assert.equal(INTEL.eventsPathFor(currentRegistry, 'company:msft'),
        'data/company-intelligence/company-msft/events.json');
    assert.equal(currentRegistry.rows.find((row) => row.dimensionId === 'performance').ownerToolId,
        'etf-momentum-lab');
    assert.equal(currentRegistry.rows.find((row) => row.dimensionId === 'technicals').ownerToolId,
        'swing-structure-lab');
    assert.equal(currentRegistry.rows.find((row) => row.dimensionId === 'sentiment').ownerToolId, null);

    const historical = readJson(PRIOR_VERSION_FILE_PATH);
    const history = INTEL.readVersionHistory(subjectOf(), sourcesOf({
        versionTree: versionTree([historical], historical.versionId)
    }));
    assert.equal(history.currentVersionId, historical.versionId);
    assert.equal(history.versions.length, 1);
    assert.deepEqual(history.refusals, []);

    [
        'readPublicationPolicy',
        'normalizeOwnerDimensionRead',
        'validateResearchPlanV2',
        'buildReadVersionV2',
        'validateReadVersionV2',
        'buildCompanyToolModelRead',
        'validateCompanyToolModelRead'
    ].forEach((name) => assert.equal(typeof INTEL[name], 'function', name + ' is an additive UMD export'));
    assert.equal(Object.isFrozen(INTEL), true);
});
