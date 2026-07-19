/*
 * report-fixture-builder.mjs — Feature 002, Scope 03 captured-response fixture
 * builder for the BLS CPI report vertical. It deterministically constructs the
 * external-boundary bytes the production adapter parses:
 *   - the BLS "Schedule of Releases for the Consumer Price Index" HTML page,
 *   - the no-key BLS Public Data API v2 JSON response for CUSR0000SA0 (SA index,
 *     headline MoM) and CUUR0000SA0 (NSA index, headline YoY),
 *   - an immutable committed ReportConsensusArtifact/v1 (pre-release locked),
 * plus a routing captured transport that replays those bytes with the correct
 * media type per allowlisted source. Nothing here contacts the network; these
 * bytes are classified only as external contract inputs.
 *
 * The golden values mirror design.md BS-002-022: June 2026 CPI scheduled
 * 2026-07-14T08:30 ET (12:30Z); CUSR0000SA0 Jun=320/May=319 -> MoM 100*(320/319-1);
 * CUUR0000SA0 Jun=323/prior-Jun=315 -> YoY 100*(323/315-1); consensus 0.30 MoM SA.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../../../../rlcontracts.js');

// Default committed CPI index levels (enough history for target + previous period).
export const DEFAULT_CPI_LEVELS = {
    // Seasonally adjusted All-items index (headline month-over-month).
    CUSR0000SA0: {
        '2026-04': 318.0,
        '2026-05': 319.0,
        '2026-06': 320.0
    },
    // Not seasonally adjusted All-items index (headline year-over-year).
    CUUR0000SA0: {
        '2025-05': 314.0,
        '2025-06': 315.0,
        '2026-05': 322.0,
        '2026-06': 323.0
    }
};

const SCHEDULE_HEADING = 'Schedule of Releases for the Consumer Price Index';

// One default schedule table: prior, target (June 2026), and next reference month.
export const DEFAULT_SCHEDULE_ROWS = [
    { referenceMonth: 'May 2026', releaseDate: 'June 11, 2026', releaseTime: '8:30 AM', reportPeriod: '2026-05', scheduledAt: '2026-06-11T12:30:00.000Z' },
    { referenceMonth: 'June 2026', releaseDate: 'July 14, 2026', releaseTime: '8:30 AM', reportPeriod: '2026-06', scheduledAt: '2026-07-14T12:30:00.000Z' },
    { referenceMonth: 'July 2026', releaseDate: 'August 12, 2026', releaseTime: '8:30 AM', reportPeriod: '2026-07', scheduledAt: '2026-08-12T12:30:00.000Z' }
];

/* Build the BLS CPI schedule HTML page. options.rows overrides the default rows;
 * options.omitHeading / options.duplicatePeriod / options.garbleRow inject the
 * documented fail-closed mutations. */
export function buildBlsScheduleHtml(options = {}) {
    const rows = options.rows || DEFAULT_SCHEDULE_ROWS;
    const heading = options.omitHeading ? 'Consumer Price Index Home Page' : SCHEDULE_HEADING;
    const tableRows = [];
    for (const row of rows) {
        tableRows.push(
            '        <tr><td class="reference-month">' + row.referenceMonth +
            '</td><td class="release-date">' + row.releaseDate +
            '</td><td class="release-time">' + row.releaseTime + ' ET</td></tr>'
        );
    }
    if (options.duplicatePeriod) {
        const target = rows.find((row) => row.reportPeriod === options.duplicatePeriod) || rows[0];
        tableRows.push(
            '        <tr><td class="reference-month">' + target.referenceMonth +
            '</td><td class="release-date">' + target.releaseDate +
            '</td><td class="release-time">' + target.releaseTime + ' ET</td></tr>'
        );
    }
    if (options.garbleRow) {
        tableRows.push('        <tr><td class="reference-month">Notamonth 2026</td><td class="release-date">Someday</td><td class="release-time">midday</td></tr>');
    }
    return [
        '<!DOCTYPE html>',
        '<html lang="en"><head><title>' + SCHEDULE_HEADING + '</title></head>',
        '<body>',
        '  <h1>' + heading + '</h1>',
        '  <table class="cpi-release-schedule">',
        '    <thead><tr><th>Reference Month</th><th>Release Date</th><th>Release Time</th></tr></thead>',
        '    <tbody>',
        tableRows.join('\n'),
        '    </tbody>',
        '  </table>',
        '</body></html>',
        ''
    ].join('\n');
}

/* Build a BLS Public Data API v2 JSON response for the requested series over a
 * year range. options.levels overrides DEFAULT_CPI_LEVELS; options.status,
 * options.missingSeries, options.dropPeriod, options.overrideValue inject the
 * documented fail-closed / disagreement mutations. */
export function buildBlsApiResponse(options = {}) {
    const levels = options.levels || DEFAULT_CPI_LEVELS;
    const seriesIds = options.seriesIds || ['CUSR0000SA0', 'CUUR0000SA0'];
    const monthName = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June',
        '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    const series = [];
    for (const seriesId of seriesIds) {
        if (options.missingSeries === seriesId) continue;
        const points = Object.keys(levels[seriesId] || {})
            .sort()
            .reverse()
            .map((period) => {
                const [year, month] = period.split('-');
                let value = levels[seriesId][period];
                if (options.overrideValue && options.overrideValue.series === seriesId && options.overrideValue.period === period) {
                    value = options.overrideValue.value;
                }
                return {
                    year,
                    period: 'M' + month,
                    periodName: monthName[month],
                    value: value.toFixed(3),
                    footnotes: [{}]
                };
            })
            .filter((point) => !(options.dropPeriod && options.dropPeriod.series === seriesId && ('M' + options.dropPeriod.period.split('-')[1]) === point.period && options.dropPeriod.period.split('-')[0] === point.year));
        series.push({ seriesID: seriesId, data: points });
    }
    return {
        status: options.status || 'REQUEST_SUCCEEDED',
        responseTime: 120,
        message: [],
        Results: { series }
    };
}

/* Build an immutable pre-release-locked ReportConsensusArtifact/v1 that
 * validateConsensus accepts (all clocks strictly before scheduledAt, lock ref
 * cutoff before scheduledAt, deterministic fingerprint). */
export function buildConsensusArtifact(options = {}) {
    const scheduledAt = options.scheduledAt || '2026-07-14T12:30:00.000Z';
    const artifact = {
        contractVersion: 'report-consensus-artifact/v1',
        consensusId: options.consensusId || 'consensus:cpi:headline-mom-sa:2026-06',
        reportId: options.reportId || 'report:bls-cpi:2026-06',
        reportPeriod: options.reportPeriod || '2026-06',
        metricId: options.metricId || 'headline-mom-sa',
        value: options.value === undefined ? 0.30 : options.value,
        unit: options.unit || '%',
        seasonalBasis: options.seasonalBasis || 'seasonally-adjusted',
        transform: options.transform || 'mom',
        sourcePublishedAt: options.sourcePublishedAt || '2026-07-14T11:00:00.000Z',
        capturedAt: options.capturedAt || '2026-07-14T11:05:00.000Z',
        sourceRef: options.sourceRef || 'reviews/consensus/test-provider/v1',
        contentSha256: options.contentSha256 || 'sha256:5555555555555555555555555555555555555555555555555555555555555555',
        preReleaseLockRef: {
            contractVersion: 'evidence-reference/v1',
            evidenceType: 'market-session-evidence',
            fingerprint: 'sha256:6666666666666666666666666666666666666666666666666666666666666666',
            path: 'briefs/objects/evidence/bundles/6666666666666666666666666666666666666666666666666666666666666666.json',
            sha256: 'sha256:7777777777777777777777777777777777777777777777777777777777777777',
            state: 'available',
            cutoffAt: options.lockCutoffAt || '2026-07-14T11:10:00.000Z',
            provenanceRefs: []
        },
        lockedAt: options.lockedAt || '2026-07-14T11:10:00.000Z',
        lockRunId: options.lockRunId || 'run-pre-release-cpi-2026-06',
        lockManifestSha256: options.lockManifestSha256 || 'sha256:8888888888888888888888888888888888888888888888888888888888888888',
        scheduledAt
    };
    artifact.fingerprint = RLCONTRACTS.semanticFingerprint('report-consensus-artifact', artifact);
    return artifact;
}

export function encodeHtml(html) {
    return Buffer.from(html, 'utf8');
}

export function encodeJson(value) {
    return Buffer.from(JSON.stringify(value), 'utf8');
}

/* A routing transport that replays captured BLS bytes by allowlisted source:
 * the schedule GET yields text/html, the API POST yields application/json.
 * options.apiResponses is an optional queue consumed one-per-POST (for the
 * disagreement / revision multi-call cases); otherwise options.apiBytes is
 * replayed for every POST. overrides let a test inject redirect/status/media. */
export function capturedReportTransport(options = {}) {
    const scheduleBytes = options.scheduleBytes || encodeHtml(buildBlsScheduleHtml());
    const apiBytes = options.apiBytes || encodeJson(buildBlsApiResponse());
    const apiQueue = Array.isArray(options.apiResponses) ? options.apiResponses.slice() : null;
    return async (resolved) => {
        const isSchedule = resolved.url.indexOf('/schedule/news_release/cpi.htm') !== -1;
        if (isSchedule) {
            return Object.assign({
                status: 200,
                ok: true,
                redirected: false,
                finalUrl: resolved.url,
                contentType: 'text/html; charset=utf-8',
                bytes: Buffer.isBuffer(scheduleBytes) ? scheduleBytes : Buffer.from(scheduleBytes)
            }, options.scheduleOverrides || {});
        }
        const nextApi = apiQueue && apiQueue.length ? apiQueue.shift() : apiBytes;
        return Object.assign({
            status: 200,
            ok: true,
            redirected: false,
            finalUrl: resolved.url,
            contentType: 'application/json; charset=utf-8',
            bytes: Buffer.isBuffer(nextApi) ? nextApi : Buffer.from(nextApi)
        }, options.apiOverrides || {});
    };
}
