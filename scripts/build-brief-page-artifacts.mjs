#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const OUTPUTS = Object.freeze({
  payload: 'market-brief.page.json',
  config: 'market-brief.config.page.json',
  snapshot: 'market-brief.snapshot.page.json',
  tools: 'market-brief.tools.page.json',
  experimental: 'market-brief.experimental.json'
});

function readJson(root, file) {
  return JSON.parse(readFileSync(resolve(root, file), 'utf8'));
}

function jsonBytes(value) {
  return `${JSON.stringify(value)}\n`;
}

export function buildBriefPageArtifactsFromInputs({ payload, config, snapshot, tools }) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !config || typeof config !== 'object' || Array.isArray(config) ||
      !snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) ||
      !tools || typeof tools !== 'object' || !Array.isArray(tools.tools)) {
    throw new Error('brief page projection inputs are incomplete');
  }
  return {
    [OUTPUTS.payload]: {
      contractVersion: 'market-brief-page/v1',
      toolId: payload.toolId,
      window: payload.window,
      asOf: payload.asOf,
      generatedAt: payload.generatedAt,
      nextSession: payload.nextSession,
      dataAsOf: payload.dataAsOf,
      regime: payload.regime,
      backdrop: payload.backdrop,
      attention: payload.attention,
      attentionExclusions: payload.attentionExclusions,
      recommendations: payload.recommendations,
      events: payload.events,
      watchlistNotes: payload.watchlistNotes,
      researchAgenda: payload.researchAgenda
    },
    [OUTPUTS.config]: {
      contractVersion: 'market-brief-config-page/v1',
      windows: config.windows,
      track: config.track,
      deepLinks: config.deepLinks,
      thresholds: config.thresholds,
      macroEvents: config.macroEvents,
      'freshness-policy/v1': config['freshness-policy/v1']
    },
    [OUTPUTS.snapshot]: {
      contractVersion: 'market-brief-snapshot-page/v1',
      asOf: snapshot.asOf,
      generatedAt: snapshot.generatedAt,
      window: snapshot.window,
      marketClosed: snapshot.marketClosed,
      nextSessionDate: snapshot.nextSessionDate,
      regime: snapshot.regime,
      names: snapshot.names,
      groups: snapshot.groups,
      toolReads: snapshot.toolReads
    },
    [OUTPUTS.tools]: {
      contractVersion: 'market-brief-tools-page/v1',
      tools: tools.tools.map((tool) => ({ id: tool.id, title: tool.title, file: tool.file }))
    },
    [OUTPUTS.experimental]: {
      contractVersion: 'market-brief-experimental/v1',
      generatedAt: payload.generatedAt,
      items: Array.isArray(payload.experimental) ? payload.experimental : []
    }
  };
}

export function buildBriefPageArtifacts(root = process.cwd()) {
  return buildBriefPageArtifactsFromInputs({
    payload: readJson(root, 'market-brief.payload.json'),
    config: readJson(root, 'market-brief.config.json'),
    snapshot: readJson(root, 'market-brief.snapshot.json'),
    tools: readJson(root, 'tools.json')
  });
}

export function serializeBriefPageArtifacts(artifacts) {
  const expectedPaths = Object.values(OUTPUTS);
  if (!artifacts || typeof artifacts !== 'object' || Array.isArray(artifacts) ||
      Object.keys(artifacts).length !== expectedPaths.length ||
      expectedPaths.some((path) => !artifacts[path] || typeof artifacts[path] !== 'object' || Array.isArray(artifacts[path]))) {
    throw new Error('brief page projection inventory is incomplete');
  }
  return Object.fromEntries(expectedPaths.map((path) => [path, jsonBytes(artifacts[path])]));
}

export function runBuildBriefPageArtifacts({ root = process.cwd(), dryRun = false, check = false } = {}) {
  const artifacts = buildBriefPageArtifacts(root);
  const serialized = serializeBriefPageArtifacts(artifacts);
  const sizes = {};
  let stale = false;
  for (const [file, bytes] of Object.entries(serialized)) {
    sizes[file] = Buffer.byteLength(bytes);
    if (check) {
      let current = null;
      try { current = readFileSync(resolve(root, file), 'utf8'); } catch { current = null; }
      if (current !== bytes) { stale = true; console.error(`[brief-page] stale=${file}`); }
    } else if (!dryRun) {
      writeFileSync(resolve(root, file), bytes);
    }
  }
  console.log(JSON.stringify({ contractVersion: 'market-brief-page-build-result/v1', dryRun, check, stale, sizes }));
  if (check && stale) process.exitCode = 1;
  return { artifacts, sizes, stale };
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runBuildBriefPageArtifacts({ dryRun: process.argv.includes('--dry-run'), check: process.argv.includes('--check') });
}