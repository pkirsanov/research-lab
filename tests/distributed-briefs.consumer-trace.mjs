/*
 * Feature 002 Scope 10 — TP-10-17 consumer trace (node --test, no browser).
 * Proves the shared mount and its first-party consumers carry zero stale mutable-history count or
 * unsafe-render assumptions: pointer coverage is DERIVED (never a hardcoded participant/source
 * literal), the shared DOM layer renders authored text via textContent (no innerHTML), history is
 * lazy (no eager legacy brief-history.jsonl read), and the mount bootstrap has no page-ID switch.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

test('compatibility consumers contain zero stale mutable-history count or unsafe-render assumptions', () => {
    const rlbrief = read('rlbrief.js');
    const rlapp = read('rlapp.js');
    const registry = JSON.parse(read('tools.json'));
    const entries = Array.isArray(registry) ? registry : (registry.tools || registry.registry || []);

    // ── coverage is DERIVED from the pointer source map, never a hardcoded count ──
    assert.ok(rlbrief.includes('function briefPointerCoverage'), 'briefPointerCoverage exists');
    assert.ok(/Object\.keys\(pointer\.sources\)/.test(rlbrief), 'coverage derived from Object.keys(sources)');
    assert.ok(rlbrief.includes('participantCount - 1'), 'source count is a relation to participants, not a literal');

    // isolate the Scope-10 shared renderer (pure + DOM) region for the unsafe-render scan.
    const scopeStart = rlbrief.indexOf('Feature 002 Scope 10 — distributed-brief shared renderer (pure layer)');
    assert.ok(scopeStart > 0, 'Scope 10 region present');
    const scope10 = rlbrief.slice(scopeStart);
    const domStart = rlbrief.indexOf('Feature 002 Scope 10 — distributed-brief shared renderer (DOM layer)');
    const domRegion = rlbrief.slice(domStart);

    // ── authored text is rendered via textContent; the shared DOM layer never assigns innerHTML ──
    assert.equal(/\.innerHTML\s*=/.test(domRegion), false, 'no innerHTML assignment in the shared DOM layer');
    assert.ok(domRegion.includes('textContent'), 'shared DOM layer uses textContent');
    assert.ok(domRegion.includes('briefSafeAnchor'), 'links flow through the safe-link classifier');

    // ── no stale/eager legacy mutable-history read; history is lazy + partition-scoped ──
    assert.equal(scope10.includes('brief-history.jsonl'), false, 'Scope 10 code never reads the legacy mutable history writer');
    assert.ok(domRegion.includes('briefs/history-current.json'), 'history uses the partitioned pointer');
    assert.ok(/addEventListener\("click"/.test(domRegion), 'history loads inside an explicit user action');

    // ── the mount bootstrap has no per-page / per-tool-id JavaScript switch ──
    assert.equal(/switch\s*\(\s*toolId/.test(rlapp), false, 'no switch on toolId');
    for (const e of entries) assert.equal(rlapp.includes(`=== "${e.id}"`) || rlapp.includes(`=== '${e.id}'`), false, `rlapp has no per-page branch for ${e.id}`);
    assert.ok(rlapp.includes('querySelectorAll("[data-rlbrief-mount]")'), 'mount is discovered declaratively');

    // ── registry compatibility: every participant keeps a briefing block; source count = participants - 1 ──
    const withBriefing = entries.filter((e) => e.briefing && e.briefing.role && e.briefing.profile);
    assert.equal(withBriefing.length, entries.length, 'every registry entry keeps its briefing block');
    const finals = entries.filter((e) => e.briefing.role === 'final-aggregator');
    const sources = entries.filter((e) => e.briefing.role === 'source');
    assert.equal(finals.length, 1, 'exactly one final aggregator');
    assert.equal(sources.length, entries.length - 1, 'source count derives as participants minus the aggregator');

    // ── every registered page carries exactly one anchor with its real registry id (no drift) ──
    for (const e of entries) {
        const html = read(e.file);
        const anchors = (html.match(/data-rlbrief-mount/g) || []).length;
        assert.equal(anchors, 1, `${e.id} has exactly one mount anchor`);
        assert.ok(html.includes(`data-tool-id="${e.id}"`), `${e.id} anchor uses its real registry id`);
    }
});
