#!/usr/bin/env node
/*
 * generate-xnys-calendar.mjs — materialize the committed XNYS trading calendar
 * (Feature 002, Scope 02) from a reviewed NYSE Holidays & Trading Hours source
 * projection into data/calendars/xnys/calendar.json.
 *
 * The reviewed source (data/calendars/xnys/source/nyse-hours-calendar.reviewed.json)
 * is an operator-reviewed transcription of the official NYSE publication. This
 * generator NEVER fetches the network and NEVER derives an unlisted closure from
 * getDay(): every full-day holiday and 13:00 ET early close is taken from the
 * reviewed table, and each declared weekday is cross-checked against the computed
 * weekday so a transcription error fails loud instead of shipping silently.
 *
 * Local/UTC session boundaries are resolved through an Intl.DateTimeFormat
 * round-trip under America/New_York (DST-aware), so no fixed offset is assumed.
 *
 * Usage:
 *   node scripts/generate-xnys-calendar.mjs --config market-brief.config.json
 *   node scripts/generate-xnys-calendar.mjs --config market-brief.config.json --check
 *   node scripts/generate-xnys-calendar.mjs --config <path> --source <path> --out <path>
 *
 * Exit: 0 = wrote / --check bytes match; non-zero = validation failure or --check drift.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const TIME_ZONE = 'America/New_York';
const BOUNDARY_POLICY_VERSION = 'xnys-session-boundaries/v1';
const GENERATOR_CONTRACT = 'generate-xnys-calendar/v1';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

class CalendarError extends Error { }

function fail(reason, field) {
    throw new CalendarError(`[XNYS-CALENDAR] ${reason}${field ? ' (' + field + ')' : ''}`);
}

/* ---- timezone-aware boundary resolution (mirrors rlsession.js localWallAt) ---- */

function localWallAt(epochMs, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });
    const values = {};
    for (const part of formatter.formatToParts(new Date(epochMs))) {
        if (part.type !== 'literal') values[part.type] = part.value;
    }
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.000`;
}

function offsetMsAt(timeZone, epochMs) {
    return Date.parse(localWallAt(epochMs, timeZone) + 'Z') - epochMs;
}

function isoOffset(offsetMs) {
    const sign = offsetMs < 0 ? '-' : '+';
    const abs = Math.abs(offsetMs) / 60000;
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${sign}${hh}:${mm}`;
}

/* Resolve a wall-clock HH:MM on a civil date in `timeZone` to the exact UTC
 * instant plus its ISO-offset local form. Iterative fixpoint: utc = wallMs - offset(utc). */
function zonedBoundary(timeZone, isoDate, wallHhMm) {
    const [y, mo, d] = isoDate.split('-').map(Number);
    const [h, mi] = wallHhMm.split(':').map(Number);
    const wallMs = Date.UTC(y, mo - 1, d, h, mi, 0, 0);
    let utc = wallMs;
    for (let i = 0; i < 4; i += 1) utc = wallMs - offsetMsAt(timeZone, utc);
    const offset = offsetMsAt(timeZone, utc);
    const startLocal = `${localWallAt(utc, timeZone)}${isoOffset(offset)}`;
    const startUtc = new Date(utc).toISOString().replace(/\.\d{3}Z$/, '.000Z');
    if (!CANONICAL_TIMESTAMP_PATTERN.test(startUtc)) fail('utc-boundary-noncanonical', isoDate + ' ' + wallHhMm);
    if (Date.parse(startLocal) !== utc) fail('local-utc-roundtrip-mismatch', isoDate + ' ' + wallHhMm);
    return { local: startLocal, utc: startUtc, epoch: utc };
}

function interval(timeZone, isoDate, startWall, endWall) {
    const start = zonedBoundary(timeZone, isoDate, startWall);
    const end = zonedBoundary(timeZone, isoDate, endWall);
    if (end.epoch <= start.epoch) fail('interval-nonpositive', isoDate + ' ' + startWall + '-' + endWall);
    return { startLocal: start.local, endLocal: end.local, startUtc: start.utc, endUtc: end.utc };
}

/* ---- civil-date enumeration ---- */

function enumerateDates(coverageStart, coverageEnd) {
    const dates = [];
    const end = Date.parse(coverageEnd + 'T00:00:00.000Z');
    let cursor = Date.parse(coverageStart + 'T00:00:00.000Z');
    while (cursor <= end) {
        dates.push(new Date(cursor).toISOString().slice(0, 10));
        cursor += 86400000;
    }
    return dates;
}

function weekdayName(isoDate) {
    return WEEKDAY_NAMES[new Date(Date.parse(isoDate + 'T00:00:00.000Z')).getUTCDay()];
}

/* ---- source parsing ---- */

export function parseNyseCalendarSource(sourceText) {
    let parsed;
    try {
        parsed = typeof sourceText === 'string' ? JSON.parse(sourceText) : sourceText;
    } catch (error) {
        fail('source-json-invalid');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail('source-not-object');
    if (parsed.contractVersion !== 'nyse-hours-calendar-source/v1') fail('source-contract-version-invalid', 'contractVersion');
    if (parsed.sourceId !== 'nyse-hours-calendar') fail('source-id-invalid', 'sourceId');
    if (parsed.timeZone !== TIME_ZONE) fail('source-timezone-invalid', 'timeZone');
    if (typeof parsed.timeZoneVersion !== 'string' || !parsed.timeZoneVersion) fail('source-tz-version-invalid', 'timeZoneVersion');
    if (!DATE_PATTERN.test(parsed.coverageStart || '') || !DATE_PATTERN.test(parsed.coverageEnd || '') ||
        parsed.coverageStart > parsed.coverageEnd) {
        fail('source-coverage-invalid', 'coverage');
    }
    const hours = parsed.regularHours;
    if (!hours || hours.preMarketStart !== '04:00' || hours.regularOpen !== '09:30' ||
        hours.regularClose !== '16:00' || hours.earlyClose !== '13:00' || hours.afterHoursEnd !== '20:00') {
        fail('source-regular-hours-invalid', 'regularHours');
    }
    const closures = Object.create(null);
    const ingest = (list, kind, field) => {
        if (!Array.isArray(list)) fail('source-closure-list-invalid', field);
        let previous = null;
        for (const entry of list) {
            if (!entry || typeof entry !== 'object' || !DATE_PATTERN.test(entry.date || '') ||
                typeof entry.closureCode !== 'string' || !entry.closureCode ||
                typeof entry.closureLabel !== 'string' || !entry.closureLabel ||
                typeof entry.weekday !== 'string') {
                fail('source-closure-entry-invalid', field);
            }
            if (entry.date < parsed.coverageStart || entry.date > parsed.coverageEnd) fail('source-closure-out-of-coverage', entry.date);
            if (previous && entry.date <= previous) fail('source-closure-not-ordered', entry.date);
            previous = entry.date;
            const computedWeekday = weekdayName(entry.date);
            if (entry.weekday !== computedWeekday) fail('source-closure-weekday-mismatch', entry.date + ' declared ' + entry.weekday + ' computed ' + computedWeekday);
            if (computedWeekday === 'Saturday' || computedWeekday === 'Sunday') fail('source-closure-on-weekend', entry.date);
            if (closures[entry.date]) fail('source-closure-duplicate-date', entry.date);
            closures[entry.date] = { kind, closureCode: entry.closureCode, closureLabel: entry.closureLabel };
        }
    };
    ingest(parsed.holidays, 'holiday', 'holidays');
    ingest(parsed.earlyCloses, 'early-close', 'earlyCloses');
    return {
        sourceId: parsed.sourceId,
        sourceUrl: parsed.sourceUrl,
        reviewedAt: parsed.reviewedAt,
        sourceUsePolicyId: parsed.sourceUsePolicyId,
        sourceUseReviewRef: parsed.sourceUseReviewRef,
        timeZone: parsed.timeZone,
        timeZoneVersion: parsed.timeZoneVersion,
        coverageStart: parsed.coverageStart,
        coverageEnd: parsed.coverageEnd,
        closures
    };
}

/* ---- materialization ---- */

export function materializeXNYSCalendar(parsed, contentSha256) {
    if (!/^sha256:[a-f0-9]{64}$/.test(contentSha256 || '')) fail('content-sha256-invalid');
    const rows = [];
    for (const isoDate of enumerateDates(parsed.coverageStart, parsed.coverageEnd)) {
        const weekday = weekdayName(isoDate);
        const closure = parsed.closures[isoDate];
        if (closure && closure.kind === 'holiday') {
            rows.push({ tradingDate: isoDate, dateState: 'holiday', closureCode: closure.closureCode, closureLabel: closure.closureLabel, preMarket: null, regular: null, afterHours: null });
            continue;
        }
        if (weekday === 'Saturday' || weekday === 'Sunday') {
            rows.push({ tradingDate: isoDate, dateState: 'weekend', closureCode: 'weekend', closureLabel: 'Weekend', preMarket: null, regular: null, afterHours: null });
            continue;
        }
        const regularCloseWall = closure && closure.kind === 'early-close' ? '13:00' : '16:00';
        const dateState = closure && closure.kind === 'early-close' ? 'early-close' : 'regular';
        rows.push({
            tradingDate: isoDate,
            dateState,
            closureCode: null,
            closureLabel: null,
            preMarket: interval(parsed.timeZone, isoDate, '04:00', '09:30'),
            regular: interval(parsed.timeZone, isoDate, '09:30', regularCloseWall),
            afterHours: interval(parsed.timeZone, isoDate, regularCloseWall, '20:00')
        });
    }
    const calendarVersion = `xnys-v1:${parsed.coverageStart}:${parsed.coverageEnd}:${contentSha256}:${parsed.timeZoneVersion}`;
    return {
        contractVersion: 'xnys-calendar/v1',
        calendarId: 'XNYS',
        calendarVersion,
        timeZone: parsed.timeZone,
        timeZoneVersion: parsed.timeZoneVersion,
        boundaryPolicyVersion: BOUNDARY_POLICY_VERSION,
        coverageStart: parsed.coverageStart,
        coverageEnd: parsed.coverageEnd,
        generator: GENERATOR_CONTRACT,
        sourceUrl: parsed.sourceUrl,
        sourceContentSha256: contentSha256,
        retrievedAt: parsed.reviewedAt,
        sourceRef: {
            contractVersion: 'source-provenance/v1',
            sourceId: 'nyse-hours-calendar',
            adapterId: 'xnys-committed-calendar',
            adapterVersion: 'xnys-calendar-adapter/v1',
            sourceKind: 'official-calendar',
            sourceUrl: parsed.sourceUrl,
            requestDescriptor: { method: 'GET', path: '/markets/hours-calendars', query: {} },
            sourcePublishedAt: null,
            retrievedAt: parsed.reviewedAt,
            contentSha256,
            accessClass: 'public-official',
            sourceUsePolicyId: parsed.sourceUsePolicyId,
            sourceUseReviewRef: parsed.sourceUseReviewRef,
            retentionMode: 'normalized-facts-and-hash',
            freshnessPolicy: 'calendar-covered-version/v1',
            freshnessState: 'current',
            diagnostics: []
        },
        rows
    };
}

/* ---- coverage validation ---- */

export function validateCalendarCoverage(calendar) {
    if (!calendar || calendar.contractVersion !== 'xnys-calendar/v1') fail('calendar-contract-invalid');
    const expected = enumerateDates(calendar.coverageStart, calendar.coverageEnd);
    if (calendar.rows.length !== expected.length) fail('calendar-row-count-mismatch', `${calendar.rows.length} != ${expected.length}`);
    let openDates = 0;
    for (let i = 0; i < expected.length; i += 1) {
        const row = calendar.rows[i];
        if (row.tradingDate !== expected[i]) fail('calendar-row-not-contiguous', `${row.tradingDate} != ${expected[i]}`);
        const closed = row.dateState === 'holiday' || row.dateState === 'weekend';
        if (closed) {
            if (row.preMarket !== null || row.regular !== null || row.afterHours !== null || !row.closureCode || !row.closureLabel) {
                fail('calendar-closed-row-invalid', row.tradingDate);
            }
        } else {
            openDates += 1;
            if (row.closureCode !== null || row.closureLabel !== null) fail('calendar-open-row-closure-invalid', row.tradingDate);
            const regularEndLocal = row.regular.endLocal.slice(11, 16);
            const expectedEnd = row.dateState === 'early-close' ? '13:00' : '16:00';
            if (regularEndLocal !== expectedEnd) fail('calendar-regular-close-invalid', row.tradingDate);
            if (row.preMarket.endUtc !== row.regular.startUtc || row.regular.endUtc !== row.afterHours.startUtc) {
                fail('calendar-boundary-overlap-or-gap', row.tradingDate);
            }
        }
    }
    if (openDates === 0) fail('calendar-no-open-dates');
    return { rowCount: calendar.rows.length, openDates };
}

/* ---- canonical bytes ---- */

function canonicalBytes(calendar) {
    return JSON.stringify(calendar, null, 2) + '\n';
}

/* ---- CLI ---- */

function argValue(argv, flag) {
    const index = argv.indexOf(flag);
    return index >= 0 && index + 1 < argv.length ? argv[index + 1] : null;
}

function main() {
    const argv = process.argv.slice(2);
    const configPath = argValue(argv, '--config');
    if (!configPath) fail('missing-config-flag');
    const check = argv.includes('--check');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const evidenceConfig = config.marketSessionEvidence;
    if (!evidenceConfig || !evidenceConfig.calendar) fail('config-market-session-evidence-missing');
    const sourcePath = argValue(argv, '--source') || evidenceConfig.calendar.sourcePath;
    const outPath = argValue(argv, '--out') || evidenceConfig.calendar.path;
    if (!sourcePath || !outPath) fail('config-calendar-paths-missing');

    const sourceBytes = readFileSync(sourcePath);
    const contentSha256 = 'sha256:' + createHash('sha256').update(sourceBytes).digest('hex');
    const parsed = parseNyseCalendarSource(sourceBytes.toString('utf8'));
    const calendar = materializeXNYSCalendar(parsed, contentSha256);
    const summary = validateCalendarCoverage(calendar);
    const bytes = canonicalBytes(calendar);

    if (check) {
        if (!existsSync(outPath)) fail('committed-calendar-absent', outPath);
        const committed = readFileSync(outPath, 'utf8');
        if (committed !== bytes) {
            process.stderr.write(`[XNYS-CALENDAR] --check drift: committed ${outPath} differs from reviewed-source projection\n`);
            process.exit(3);
        }
        process.stdout.write(`[XNYS-CALENDAR] --check OK: ${outPath} matches reviewed source (${summary.rowCount} rows, ${summary.openDates} open) sha=${contentSha256} tz=${process.versions.tz || 'n/a'}\n`);
        return;
    }

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, bytes);
    process.stdout.write(`[XNYS-CALENDAR] wrote ${outPath} (${summary.rowCount} rows, ${summary.openDates} open) sha=${contentSha256} version=${calendar.calendarVersion} tz=${process.versions.tz || 'n/a'}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        main();
    } catch (error) {
        if (error instanceof CalendarError) {
            process.stderr.write(error.message + '\n');
            process.exit(2);
        }
        throw error;
    }
}
