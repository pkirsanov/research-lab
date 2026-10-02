import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stalenessReport } from '../scripts/brief-staleness-check.mjs';

const POLICY = { 'freshness-policy/v1': { warnAfterHours: 18, staleAfterHours: 72 } };
function tree(generatedAt) {
    const dir = mkdtempSync(join(tmpdir(), 'brief-staleness-'));
    writeFileSync(join(dir, 'market-brief.config.json'), JSON.stringify(POLICY));
    if (generatedAt !== undefined) writeFileSync(join(dir, 'market-brief.payload.json'), JSON.stringify({ generatedAt }));
    return dir;
}
const NOW = Date.parse('2026-10-01T12:00:00Z');

test('fresh, aging and stale follow the page policy thresholds', () => {
    assert.equal(stalenessReport(tree('2026-10-01T06:00:00Z'), NOW).exitCode, 0);
    assert.equal(stalenessReport(tree('2026-09-30T12:00:00Z'), NOW).state, 'aging');
    const stale = stalenessReport(tree('2026-09-17T15:00:00Z'), NOW);
    assert.equal(stale.state, 'stale');
    assert.equal(stale.exitCode, 2);
});

test('a missing payload is never reported as fresh', () => {
    const report = stalenessReport(tree(undefined), NOW);
    assert.equal(report.state, 'absent');
    assert.equal(report.exitCode, 2);
});
