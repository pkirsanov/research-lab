#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DESTINATION = '_site';
const SKIP_TOP_LEVEL = new Set([
  '.git', '.github', '.specify', '.codegraph', '.brief-work',
  'node_modules', 'playwright-report', 'test-results', 'specs', 'scripts', DESTINATION
]);
const PUBLIC_DIRECTORIES = Object.freeze(['briefs', 'data', 'docs', 'notes', 'pictures', 'rlexperience-adapters', 'tests/fixtures']);
const SPECIAL_ROOT_FILES = Object.freeze(['.nojekyll']);
const NON_PUBLIC_ROOT_FILES = new Set([
  '.gitignore', '.npmrc', 'package.json', 'package-lock.json', 'playwright.config.mjs',
  'registry-exceptions.json', 'site-exclusions.json'
]);

function readJson(root, path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function planPagesSite(root = ROOT) {
  const registry = readJson(root, 'tools.json');
  const exclusionsDocument = readJson(root, 'site-exclusions.json');
  assert(exclusionsDocument.contractVersion === 'pages-site-exclusions/v1', 'site exclusions contract is invalid');

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
  const indexRoot = join(root, 'briefs/indexes');
  const orphanIndexDirectories = existsSync(indexRoot)
    ? readdirSync(indexRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => `briefs/indexes/${entry.name}`).filter((directory) => directory !== historyIndexDirectory).sort()
    : [];

  return Object.freeze({
    registeredPages: Object.freeze([...registeredPages].sort()),
    excludedPaths: Object.freeze([...exclusions.keys()].sort()),
    rootFiles: Object.freeze(rootFiles.sort()),
    directories: Object.freeze(directories.sort()),
    historyIndexDirectory,
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
    cpSync(join(root, plan.historyIndexDirectory), join(destinationPath, plan.historyIndexDirectory), { recursive: true });

  for (const page of plan.registeredPages) assert(existsSync(join(destinationPath, page)), `packaged site lost registered page: ${page}`);
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
    historyIndexDirectory: plan.historyIndexDirectory,
    omittedOrphanIndexes: plan.orphanIndexDirectories.length
  }));
}
