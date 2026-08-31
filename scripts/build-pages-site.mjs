#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DESTINATION = '_site';
const SKIP_TOP_LEVEL = new Set([
  '.git', '.github', '.specify', '.codegraph', '.brief-work',
  'node_modules', 'playwright-report', 'test-results', 'specs', 'scripts', DESTINATION
]);
const PUBLIC_DIRECTORIES = Object.freeze(['briefs', 'data', 'docs', 'notes', 'pictures', 'research', 'rlexperience-adapters', 'tests/fixtures']);
const SPECIAL_ROOT_FILES = Object.freeze(['.nojekyll']);
const NON_PUBLIC_ROOT_FILES = new Set([
  '.gitignore', '.npmrc', 'package.json', 'package-lock.json', 'playwright.config.mjs',
  'registry-exceptions.json', 'site-exclusions.json'
]);
const COMPANY_MARKET_ACTION_PATHS = Object.freeze([
  'brief-history.jsonl',
  'brief-history.recent.jsonl',
  'causal-rotation.snapshot.json',
  'market-brief.attention-scorecard.json',
  'market-brief.config.page.json',
  'market-brief.experimental.json',
  'market-brief.owner-reads.json',
  'market-brief.page.json',
  'market-brief.payload.json',
  'market-brief.scorecard.json',
  'market-brief.snapshot.json',
  'market-brief.snapshot.page.json',
  'market-brief.tools.page.json'
]);
const PUBLIC_COMPANY_PROJECTION_PATH = 'data/company-intelligence/publication-current.js';
const PUBLIC_COMPANY_PROJECTION_CONTRACT = 'company-publication-projection/v1';
const PUBLIC_COMPANY_PROJECTION_TEMPLATE = Object.freeze([
  '(function (root) {',
  '  "use strict";',
  null,
  '  function deepFreeze(node) {',
  '    if (node === null || typeof node !== "object" || Object.isFrozen(node)) return node;',
  '    Object.keys(node).forEach(function (key) { deepFreeze(node[key]); });',
  '    return Object.freeze(node);',
  '  }',
  '  root.RLCOMPANYINTEL_PUBLICATION = deepFreeze(value);',
  '})(typeof globalThis === "undefined" ? this : globalThis);',
  ''
]);

function readJson(root, path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function packageRefusal(message, relativePath) {
  throw new Error(`C028-PACKAGING: ${message}: ${relativePath}`);
}

function safeRelativePath(relativePath) {
  return typeof relativePath === 'string' && relativePath.length > 0 &&
    !relativePath.startsWith('/') && !relativePath.includes('\\') &&
    relativePath.split('/').every((part) => part && part !== '.' && part !== '..');
}

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value));
}

export function parsePublicCompanyProjectionSource(source, relativePath = PUBLIC_COMPANY_PROJECTION_PATH) {
  if (typeof source !== 'string') packageRefusal('public projection source is not text', relativePath);
  const lines = source.split('\n');
  if (lines.length !== PUBLIC_COMPANY_PROJECTION_TEMPLATE.length ||
      lines.some((line, index) => index !== 2 && line !== PUBLIC_COMPANY_PROJECTION_TEMPLATE[index])) {
    packageRefusal('public projection source wrapper is invalid', relativePath);
  }
  const prefix = '  var value = JSON.parse(';
  const suffix = ');';
  const payloadLine = lines[2];
  if (!payloadLine.startsWith(prefix) || !payloadLine.endsWith(suffix)) {
    packageRefusal('public projection source payload wrapper is invalid', relativePath);
  }
  const encodedLiteral = payloadLine.slice(prefix.length, -suffix.length);
  let encodedDocument;
  let projection;
  try {
    encodedDocument = JSON.parse(encodedLiteral);
    if (typeof encodedDocument !== 'string' || JSON.stringify(encodedDocument) !== encodedLiteral) {
      packageRefusal('public projection source payload is not canonical JSON text', relativePath);
    }
    projection = JSON.parse(encodedDocument);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('C028-PACKAGING:')) throw error;
    packageRefusal('public projection source payload is invalid', relativePath);
  }
  if (!projection || typeof projection !== 'object' || Array.isArray(projection) ||
      canonicalJson(projection) !== encodedDocument) {
    packageRefusal('public projection source payload is not one canonical object', relativePath);
  }
  return projection;
}

function requirePackagePath(root, relativePath) {
  if (!safeRelativePath(relativePath)) packageRefusal('unsafe required package path', String(relativePath));
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) packageRefusal('required package dependency is missing', relativePath);
  return absolutePath;
}

function requireJson(root, relativePath) {
  const absolutePath = requirePackagePath(root, relativePath);
  try {
    return JSON.parse(readFileSync(absolutePath, 'utf8'));
  } catch {
    packageRefusal('required JSON dependency is invalid', relativePath);
  }
}

export function validateCompanyPublicationPackage(root = ROOT, options = {}) {
  const registry = options.registry || readJson(root, 'tools.json');
  const exclusionsDocument = options.exclusionsDocument || readJson(root, 'site-exclusions.json');
  const companyEntries = registry.tools.filter((tool) => tool && tool.id === 'company-intelligence-lab');
  if (companyEntries.length === 0) return Object.freeze({ active: false, requiredPaths: Object.freeze([]) });
  if (companyEntries.length !== 1) packageRefusal('company registry identity is not unique', 'tools.json');

  const entry = companyEntries[0];
  const expected = {
    file: 'company-intelligence-lab.html',
    notes: 'notes/company-intelligence-lab.md',
    data: 'company-intelligence.config.json',
    status: 'live'
  };
  for (const [field, value] of Object.entries(expected)) {
    if (entry[field] !== value) packageRefusal(`company registry ${field} is inconsistent`, 'tools.json');
  }
  if (entry.briefing?.readAdapter !== 'company-intelligence-owner-v1' ||
      entry.experience?.simpleAdapterModule !== 'rlexperience-adapters/company-intelligence.js' ||
      entry.experience?.simpleModelDefinitionId !== 'simple-model/company-multi-horizon/v1' ||
      entry.experience?.journeyDefinitionIds?.length !== 2) {
    packageRefusal('company registry briefing or experience contract is incomplete', 'tools.json');
  }

  const retiredExclusions = [entry.file, 'rlcompanyintel.js', entry.data];
  const excludedPaths = new Set(exclusionsDocument.files.map((item) => item.path));
  for (const relativePath of retiredExclusions) {
    if (excludedPaths.has(relativePath)) packageRefusal('registered company dependency remains excluded', relativePath);
  }

  const experienceConfig = requireJson(root, 'tool-experience.config.json');
  if (!experienceConfig.adapterPolicy?.moduleAllowlist?.includes(entry.experience.simpleAdapterModule)) {
    packageRefusal('company adapter is absent from the exact module allowlist', entry.experience.simpleAdapterModule);
  }
  const simpleModels = requireJson(root, 'simple-models.json');
  if (simpleModels.definitions?.filter((definition) => definition.definitionId === entry.experience.simpleModelDefinitionId).length !== 1) {
    packageRefusal('company Simple model registration is absent or duplicated', 'simple-models.json');
  }
  const journeys = requireJson(root, 'journeys.json');
  for (const journeyId of entry.experience.journeyDefinitionIds) {
    if (journeys.definitions?.filter((definition) => definition.definitionId === journeyId).length !== 1) {
      packageRefusal('company journey registration is absent or duplicated', 'journeys.json');
    }
  }

  const selectorPath = 'data/company-intelligence/publication-current.json';
  const selector = requireJson(root, selectorPath);
  if (selector.contractVersion !== 'company-brief-current-pointer/v1' ||
      !Array.isArray(selector.coveredSubjectIds) || selector.coveredSubjectIds.length !== 1 ||
      selector.coveredSubjectIds[0] !== 'company:msft' ||
      !safeRelativePath(selector.publicationManifestRef?.path)) {
    packageRefusal('coupled selector does not identify exactly company:msft', selectorPath);
  }
  const manifestPath = selector.publicationManifestRef.path;
  const manifestBytes = readFileSync(requirePackagePath(root, manifestPath));
  if (sha256(manifestBytes) !== selector.publicationManifestRef.sha256) {
    packageRefusal('coupled selector manifest hash does not match packaged bytes', manifestPath);
  }
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (manifest.contractVersion !== 'company-brief-publication-manifest/v1' ||
      manifest.generation?.generationId !== selector.generationId ||
      manifest.brief?.runId !== selector.briefRunId ||
      manifest.companyOwnerRead?.toolId !== 'company-intelligence-lab' ||
      !Array.isArray(manifest.subjects) || manifest.subjects.length !== 1 ||
      manifest.subjects[0].subjectId !== 'company:msft') {
    packageRefusal('coupled manifest identity disagrees with the selector', manifestPath);
  }

  const projectionSource = readFileSync(requirePackagePath(root, PUBLIC_COMPANY_PROJECTION_PATH), 'utf8');
  const projection = parsePublicCompanyProjectionSource(projectionSource);
  if (projection.contractVersion !== PUBLIC_COMPANY_PROJECTION_CONTRACT ||
      canonicalJson(Object.keys(projection).sort()) !== canonicalJson(['attempt', 'contractVersion', 'pair', 'versions'])) {
    packageRefusal('public projection contract is invalid', PUBLIC_COMPANY_PROJECTION_PATH);
  }
  const manifestSubject = manifest.subjects[0];
  const pair = projection.pair;
  if (!pair || pair.authority !== 'acknowledged' || pair.state !== 'current' ||
      pair.generationId !== selector.generationId || pair.subjectId !== manifestSubject.subjectId ||
      pair.ticker !== 'MSFT' || pair.versionId !== manifestSubject.versionId ||
      pair.priorVersionId !== manifestSubject.priorVersionId ||
      pair.contentFingerprint !== manifestSubject.contentFingerprint ||
      pair.manifest?.path !== manifestPath || pair.manifest?.sha256 !== selector.publicationManifestRef.sha256 ||
      pair.brief?.runId !== selector.briefRunId ||
      pair.version?.contractVersion !== 'company-read-version/v2' ||
      pair.version?.generationId !== selector.generationId ||
      pair.version?.subjectId !== manifestSubject.subjectId ||
      pair.version?.versionId !== manifestSubject.versionId ||
      pair.version?.contentFingerprint !== manifestSubject.contentFingerprint ||
      pair.ownerRead?.contractVersion !== 'tool-model-read/v1' ||
      pair.ownerRead?.toolId !== 'company-intelligence-lab' ||
      pair.ownerRead?.generationId !== selector.generationId ||
      pair.ownerRead?.fingerprint !== manifest.companyOwnerRead?.fingerprint ||
      !Array.isArray(projection.versions) || projection.versions.length === 0 ||
      canonicalJson(projection.versions[0]) !== canonicalJson(pair.version) ||
      new Set(projection.versions.map((version) => version?.versionId)).size !== projection.versions.length) {
    packageRefusal('public projection does not preserve the acknowledged pair identity',
      PUBLIC_COMPANY_PROJECTION_PATH);
  }

  const requiredPaths = new Set([
    'index.html', 'tools.json', 'rlnav.js', entry.file, entry.notes, entry.data,
    'rlcompanyintel.js', 'rlexperience.js', 'rlbrief.js', 'simple-models.json',
    'journeys.json', 'tool-experience.config.json', entry.experience.simpleAdapterModule,
    selectorPath, PUBLIC_COMPANY_PROJECTION_PATH, manifestPath,
    'briefs/current.json', 'briefs/history-current.json',
    'data/company-intelligence/company-msft/current.json',
    manifest.brief.manifestPath, manifest.subjects[0].versionPath
  ]);
  const attemptPointerPath = 'data/company-intelligence/attempt-current.json';
  if (existsSync(join(root, attemptPointerPath))) {
    const attemptPointer = requireJson(root, attemptPointerPath);
    if (attemptPointer.contractVersion !== 'company-publication-attempt-pointer/v1' ||
        attemptPointer.authoritativeGenerationId !== selector.generationId ||
        !safeRelativePath(attemptPointer.attemptRef?.path) ||
        !/^sha256:[a-f0-9]{64}$/.test(attemptPointer.attemptRef?.sha256 || '')) {
      packageRefusal('public attempt pointer is malformed or names another acknowledged pair', attemptPointerPath);
    }
    const attemptBytes = readFileSync(requirePackagePath(root, attemptPointer.attemptRef.path));
    if (sha256(attemptBytes) !== attemptPointer.attemptRef.sha256) {
      packageRefusal('public attempt pointer hash does not match its immutable record', attemptPointer.attemptRef.path);
    }
    const attempt = JSON.parse(attemptBytes.toString('utf8'));
    if (attempt.contractVersion !== 'company-publication-attempt/v1' ||
        attempt.attemptId !== attemptPointer.attemptId ||
        attempt.authoritativeGenerationId !== selector.generationId ||
        attempt.authoritativeUnchanged !== true) {
      packageRefusal('public attempt record can grant no authority and must preserve the selected pair',
        attemptPointer.attemptRef.path);
    }
    if (!projection.attempt ||
        projection.attempt.contractVersion !== 'company-publication-attempt/v1' ||
        projection.attempt.attemptId !== attemptPointer.attemptId ||
        projection.attempt.authoritativeGenerationId !== pair.generationId ||
        projection.attempt.authoritativeUnchanged !== true ||
        canonicalJson(projection.attempt) !== canonicalJson(attempt)) {
      packageRefusal('public projection attempt does not match the selected attempt record',
        PUBLIC_COMPANY_PROJECTION_PATH);
    }
    requiredPaths.add(attemptPointerPath);
    requiredPaths.add(attemptPointer.attemptRef.path);
  } else if (projection.attempt !== null) {
    packageRefusal('public projection carries an attempt without a selected attempt record',
      PUBLIC_COMPANY_PROJECTION_PATH);
  }
  for (const relativePath of COMPANY_MARKET_ACTION_PATHS) requiredPaths.add(relativePath);
  for (const inventoryEntry of manifest.inventory || []) {
    if (!safeRelativePath(inventoryEntry.path)) packageRefusal('manifest inventory path is unsafe', String(inventoryEntry.path));
    const bytes = readFileSync(requirePackagePath(root, inventoryEntry.path));
    if (bytes.length !== inventoryEntry.byteLength || sha256(bytes) !== inventoryEntry.sha256) {
      packageRefusal('manifest inventory bytes do not match their immutable identity', inventoryEntry.path);
    }
    requiredPaths.add(inventoryEntry.path);
  }
  const briefManifest = requireJson(root, manifest.brief.manifestPath);
  if (briefManifest.runId !== selector.briefRunId || !safeRelativePath(briefManifest.finalRef?.path)) {
    packageRefusal('matching brief manifest disagrees with the coupled selector', manifest.brief.manifestPath);
  }
  requiredPaths.add(briefManifest.finalRef.path);
  const companyBriefEntry = briefManifest.tools?.['company-intelligence-lab'];
  if (!companyBriefEntry || companyBriefEntry.outcome !== 'newly-authored' ||
      !safeRelativePath(companyBriefEntry.readPath) || !safeRelativePath(companyBriefEntry.briefPath)) {
    packageRefusal('matching brief lacks one real company owner read', manifest.brief.manifestPath);
  }
  requiredPaths.add(companyBriefEntry.readPath);
  requiredPaths.add(companyBriefEntry.briefPath);

  const companyOwnerRead = requireJson(root, companyBriefEntry.readPath);
  const publicPayload = requireJson(root, 'market-brief.payload.json');
  const publicSnapshot = requireJson(root, 'market-brief.snapshot.json');
  const payloadCompanyRead = publicPayload.toolReads?.['company-intelligence-lab'];
  const snapshotCompanyRead = publicSnapshot.toolReads?.['company-intelligence-lab'];
  if (JSON.stringify(payloadCompanyRead) !== JSON.stringify(companyOwnerRead) ||
      JSON.stringify(snapshotCompanyRead) !== JSON.stringify(companyOwnerRead)) {
    packageRefusal('public Market Action projections do not carry the acknowledged company owner read',
      'market-brief.payload.json');
  }
  for (const [relativePath, document] of [
    ['market-brief.payload.json', publicPayload],
    ['market-brief.snapshot.json', publicSnapshot]
  ]) {
    const rows = Array.isArray(document.toolCoverage)
      ? document.toolCoverage.filter((row) => row?.id === 'company-intelligence-lab')
      : [];
    if (rows.length !== 1 || rows[0].status !== 'fresh-headless') {
      packageRefusal('public Market Action projection lacks one real company coverage row', relativePath);
    }
  }

  for (const relativePath of requiredPaths) requirePackagePath(root, relativePath);
  return Object.freeze({
    active: true,
    generationId: selector.generationId,
    briefRunId: selector.briefRunId,
    manifestPath,
    requiredPaths: Object.freeze([...requiredPaths].sort())
  });
}

export function planPagesSite(root = ROOT) {
  const registry = readJson(root, 'tools.json');
  const exclusionsDocument = readJson(root, 'site-exclusions.json');
  assert(exclusionsDocument.contractVersion === 'pages-site-exclusions/v1', 'site exclusions contract is invalid');
  const companyPublication = validateCompanyPublicationPackage(root, { registry, exclusionsDocument });

  const registeredPages = new Set(registry.tools.map((tool) => tool.file));
  const exclusions = new Map();
  for (const entry of exclusionsDocument.files) {
    assert(entry && typeof entry.path === 'string' && entry.path && typeof entry.reason === 'string' && entry.reason.length >= 40,
      'every site exclusion needs a path and substantive reason');
    assert(!exclusions.has(entry.path), `duplicate site exclusion: ${entry.path}`);
    exclusions.set(entry.path, entry);
  }

  for (const page of registeredPages) {
    assert(existsSync(join(root, page)), `registered page is missing: ${page}`);
    assert(!exclusions.has(page), `registered page is still excluded: ${page}`);
  }
  for (const entry of exclusions.values()) assert(existsSync(join(root, entry.path)), `site exclusion is stale: ${entry.path}`);

  const rootPages = readdirSync(root).filter((name) => name.endsWith('.html'));
  const unaccountedPages = findUnaccountedPages(rootPages, registeredPages, exclusions.keys());
  assert(unaccountedPages.length === 0, `unregistered root page lacks a deploy decision: ${unaccountedPages.join(', ')}`);

  const rootFiles = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.') && !NON_PUBLIC_ROOT_FILES.has(entry.name) && !exclusions.has(entry.name))
    .map((entry) => entry.name)
    .concat(SPECIAL_ROOT_FILES.filter((file) => existsSync(join(root, file))));
  const directories = PUBLIC_DIRECTORIES.filter((directory) => existsSync(join(root, directory)) && !SKIP_TOP_LEVEL.has(directory));
  const historyPointer = readJson(root, 'briefs/history-current.json');
  const historyIndexPath = historyPointer && historyPointer.historyIndexRef && historyPointer.historyIndexRef.path;
  assert(typeof historyIndexPath === 'string' && /^briefs\/indexes\/[a-f0-9]{64}\/history\.json$/.test(historyIndexPath), 'history pointer does not name a canonical current index');
  assert(existsSync(join(root, historyIndexPath)), `current history index is missing: ${historyIndexPath}`);
  const historyIndexDirectory = historyIndexPath.split('/').slice(0, -1).join('/');
  const retainedHistoryIndexDirectories = new Set([historyIndexDirectory]);
  for (const relativePath of companyPublication.requiredPaths) {
    const match = /^(briefs\/indexes\/[a-f0-9]{64})\//.exec(relativePath);
    if (match) retainedHistoryIndexDirectories.add(match[1]);
  }
  const indexRoot = join(root, 'briefs/indexes');
  const orphanIndexDirectories = existsSync(indexRoot)
    ? readdirSync(indexRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => `briefs/indexes/${entry.name}`).filter((directory) => !retainedHistoryIndexDirectories.has(directory)).sort()
    : [];

  return Object.freeze({
    registeredPages: Object.freeze([...registeredPages].sort()),
    excludedPaths: Object.freeze([...exclusions.keys()].sort()),
    rootFiles: Object.freeze(rootFiles.sort()),
    directories: Object.freeze(directories.sort()),
    companyPublication,
    historyIndexDirectory,
    retainedHistoryIndexDirectories: Object.freeze([...retainedHistoryIndexDirectories].sort()),
    orphanIndexDirectories: Object.freeze(orphanIndexDirectories)
  });
}

export function findUnaccountedPages(rootPages, registeredPages, excludedPaths) {
  const registered = registeredPages instanceof Set ? registeredPages : new Set(registeredPages);
  const excluded = excludedPaths instanceof Set ? excludedPaths : new Set(excludedPaths);
  return rootPages.filter((page) => page !== 'index.html' && !registered.has(page) && !excluded.has(page));
}

export function buildPagesSite({ root = ROOT, destination = DESTINATION, dryRun = false } = {}) {
  const plan = planPagesSite(root);
  if (dryRun) return plan;
  const destinationPath = join(root, destination);
  rmSync(destinationPath, { recursive: true, force: true });
  mkdirSync(destinationPath, { recursive: true });

  for (const file of plan.rootFiles) cpSync(join(root, file), join(destinationPath, file));
  for (const directory of plan.directories) {
    mkdirSync(join(destinationPath, directory, '..'), { recursive: true });
    cpSync(join(root, directory), join(destinationPath, directory), { recursive: true });
  }

    /* briefs/ is copied as one immutable graph, then the mutable index inventory is reduced to the
      one directory the current pointer names. Old generated indexes remain available in source/git
      history but are not shipped as unreachable public assets. */
    rmSync(join(destinationPath, 'briefs/indexes'), { recursive: true, force: true });
    mkdirSync(join(destinationPath, 'briefs/indexes'), { recursive: true });
    for (const directory of plan.retainedHistoryIndexDirectories) {
      cpSync(join(root, directory), join(destinationPath, directory), { recursive: true });
    }

  for (const page of plan.registeredPages) assert(existsSync(join(destinationPath, page)), `packaged site lost registered page: ${page}`);
  for (const relativePath of plan.companyPublication.requiredPaths) {
    assert(existsSync(join(destinationPath, relativePath)), `packaged site lost Company publication dependency: ${relativePath}`);
  }
  for (const path of plan.excludedPaths) assert(!existsSync(join(destinationPath, path)), `packaged site contains excluded path: ${path}`);
  for (const directory of plan.orphanIndexDirectories) assert(!existsSync(join(destinationPath, directory)), `packaged site contains orphan history index: ${directory}`);
  assert(existsSync(join(destinationPath, '.nojekyll')), 'packaged site lost .nojekyll');
  return plan;
}

if (basename(process.argv[1] || '') === 'build-pages-site.mjs') {
  const plan = buildPagesSite({ dryRun: process.argv.includes('--dry-run') });
  console.log(JSON.stringify({
    contractVersion: 'pages-site-build-result/v1',
    dryRun: process.argv.includes('--dry-run'),
    registeredPages: plan.registeredPages.length,
    excludedPaths: plan.excludedPaths.length,
    rootFiles: plan.rootFiles.length,
    directories: plan.directories,
    companyPublicationGeneration: plan.companyPublication.active ? plan.companyPublication.generationId : null,
    companyPublicationPaths: plan.companyPublication.requiredPaths.length,
    historyIndexDirectory: plan.historyIndexDirectory,
    retainedHistoryIndexes: plan.retainedHistoryIndexDirectories.length,
    omittedOrphanIndexes: plan.orphanIndexDirectories.length
  }));
}
