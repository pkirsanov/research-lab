#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNarrative(value) {
  return hasText(value) || (Array.isArray(value) && value.length > 0 && value.every(hasText));
}

function hasObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

export function validateBriefPayload(payload, registry, config, snapshot) {
  const errors = [];
  const thresholds = config?.thresholds || {};
  const minimumConfidence = Number.isFinite(thresholds.minimumActionConfidence) ? thresholds.minimumActionConfidence : 55;
  const tacticalCap = Number.isFinite(thresholds.tacticalConfidenceCap) ? thresholds.tacticalConfidenceCap : 55;
  const maxActions = Number.isFinite(thresholds.nextSessionMaxActions) ? thresholds.nextSessionMaxActions : 5;
  const allowedActions = new Set(['hold', 'trim', 'add', 'hedge', 'rotate']);
  const allowedHorizons = new Set(['structural', 'swing', 'tactical']);

  if (payload?.toolId !== 'market-brief') errors.push('toolId must be market-brief');
  if (!hasText(payload?.generatedAt) || !Number.isFinite(Date.parse(payload.generatedAt))) errors.push('generatedAt must be a valid ISO timestamp');
  if (!hasText(payload?.asOf) || !Number.isFinite(Date.parse(payload.asOf))) errors.push('asOf must be a valid timestamp');

  if (!hasObject(payload?.dataAsOf)) errors.push('dataAsOf must be a non-empty object');
  else {
    for (const field of ['bars', 'options', 'macro', 'events']) {
      if (!hasText(payload.dataAsOf[field])) errors.push(`dataAsOf.${field} is required`);
    }
  }

  if (!hasObject(payload?.regime)) errors.push('regime must be a non-empty object');
  else {
    if (!['bull', 'bear', 'neutral'].includes(payload.regime.bias)) errors.push('regime.bias must be bull|bear|neutral');
    if (!hasText(payload.regime.note)) errors.push('regime.note is required');
    if (!hasObject(payload.regime.vix) || !Number.isFinite(payload.regime.vix.level)) errors.push('regime.vix.level must be finite');
  }

  const backdrop = payload?.backdrop;
  if (!hasObject(backdrop)) errors.push('backdrop must be a non-empty object');
  else {
    for (const field of ['primaryTrend', 'macroCycle', 'pricedIn', 'asymmetry']) {
      if (!hasText(backdrop[field])) errors.push(`backdrop.${field} is required`);
    }
    for (const field of ['trendEvidence', 'globalBackdrop', 'whatWouldChangeIt']) {
      if (!hasNarrative(backdrop[field])) errors.push(`backdrop.${field} must be text or a non-empty text array`);
    }
    if (!hasObject(backdrop.structuralLevels)) errors.push('backdrop.structuralLevels must be a non-empty object');
  }

  const actions = payload?.nextSession?.actions;
  if (!hasObject(payload?.nextSession)) errors.push('nextSession must be a non-empty object');
  if (!hasText(payload?.nextSession?.sessionDate)) errors.push('nextSession.sessionDate is required');
  if (!hasText(payload?.nextSession?.thesis)) errors.push('nextSession.thesis is required');
  if (!Array.isArray(actions)) errors.push('nextSession.actions must be an array');
  else {
    if (actions.length > maxActions) errors.push(`nextSession.actions exceeds configured maximum ${maxActions}`);
    actions.forEach((action, index) => {
      const prefix = `nextSession.actions[${index}]`;
      if (!allowedActions.has(action?.action)) errors.push(`${prefix}.action must be hold|trim|add|hedge|rotate`);
      for (const field of ['subject', 'rationale', 'structuralAnchor', 'trigger', 'invalidation', 'deepLink']) {
        if (!hasText(action?.[field])) errors.push(`${prefix}.${field} is required`);
      }
      if (!allowedHorizons.has(action?.horizon)) errors.push(`${prefix}.horizon must be structural|swing|tactical`);
      if (!Number.isFinite(action?.confidence) || action.confidence < minimumConfidence) errors.push(`${prefix}.confidence must be at least ${minimumConfidence}`);
      if (action?.horizon === 'tactical' && Number.isFinite(action.confidence) && action.confidence > tacticalCap) errors.push(`${prefix}.confidence exceeds tactical cap ${tacticalCap}`);
    });
  }
  if (snapshot?.nextSessionDate && payload?.nextSession?.sessionDate !== snapshot.nextSessionDate) errors.push('nextSession.sessionDate must match snapshot.nextSessionDate');

  const expectedIds = (registry?.tools || []).map((tool) => tool.id).filter(Boolean);
  const coverage = Array.isArray(payload?.toolCoverage) ? payload.toolCoverage : [];
  const coverageIds = coverage.map((entry) => entry?.id).filter(Boolean);
  const duplicateIds = coverageIds.filter((id, index) => coverageIds.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`toolCoverage contains duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
  const missingIds = expectedIds.filter((id) => !coverageIds.includes(id));
  const extraIds = coverageIds.filter((id) => !expectedIds.includes(id));
  if (missingIds.length) errors.push(`toolCoverage missing registered tools: ${missingIds.join(', ')}`);
  if (extraIds.length) errors.push(`toolCoverage contains unregistered tools: ${extraIds.join(', ')}`);
  coverage.forEach((entry, index) => {
    if (!hasText(entry?.reason)) errors.push(`toolCoverage[${index}].reason must state the analyzed read, staleness, or specific irrelevance`);
  });

  for (const id of ['sector-research-lab', 'etf-momentum-lab', 'global-rotation-lab', 'real-assets-lab']) {
    const read = payload?.toolReads?.[id];
    if (!read || !hasText(read.read) || !hasText(read.deepLink) || !read.metrics || typeof read.metrics !== 'object') errors.push(`toolReads.${id} must include read, metrics, and deepLink`);
  }
  const realAssets = JSON.stringify(payload?.toolReads?.['real-assets-lab']?.metrics || {}).toUpperCase();
  for (const token of ['GLD', 'SLV', 'BTC']) {
    if (!realAssets.includes(token)) errors.push(`real-assets tool read must include model-specific ${token} analysis`);
  }
  if (!/(DBC|PDBC|USO|BNO|COMMOD)/.test(realAssets)) errors.push('real-assets tool read must include broad-commodity or oil analysis');

  if (!Array.isArray(payload?.attention)) errors.push('attention must be an array');
  else if (payload.attention.length > (thresholds.attentionMaxCards || 7)) errors.push('attention exceeds configured card maximum');

  if (!Array.isArray(payload?.recommendations)) errors.push('recommendations must be an array');
  if (!Array.isArray(payload?.events) || payload.events.length === 0) errors.push('events must be a non-empty array');
  if (!Array.isArray(payload?.groups) || payload.groups.length === 0) errors.push('groups must be a non-empty array');
  if (!hasObject(payload?.watchlistNotes)) errors.push('watchlistNotes must be a non-empty object');
  if (!hasObject(payload?.toolReads)) errors.push('toolReads must be a non-empty object');
  if (!Array.isArray(payload?.experimental)) errors.push('experimental must be an array');

  return errors;
}

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
}

function main() {
  const payloadPath = process.argv[2] || 'market-brief.payload.json';
  const errors = validateBriefPayload(
    loadJson(payloadPath),
    loadJson('tools.json'),
    loadJson('market-brief.config.json'),
    loadJson('market-brief.snapshot.json')
  );
  if (errors.length) {
    console.error('[brief-contract] FAIL');
    errors.forEach((error) => console.error('  - ' + error));
    process.exit(1);
  }
  console.log('[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid');
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
