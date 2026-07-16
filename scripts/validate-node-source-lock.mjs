#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLAYWRIGHT_VERSION = '1.61.1';
const TRUSTED_REGISTRY = 'https://registry.npmjs.org/';
const REQUIRED_FILES = ['package.json', 'package-lock.json', '.npmrc'];
const EXPECTED_MANIFEST_KEYS = ['devDependencies', 'engines', 'name', 'private', 'version'];
const EXPECTED_NPMRC = new Map([
  ['registry', TRUSTED_REGISTRY],
  ['save-exact', 'true'],
  ['package-lock', 'true'],
  ['ignore-scripts', 'true'],
  ['replace-registry-host', 'never']
]);
const EXPECTED_PACKAGES = new Map([
  ['node_modules/fsevents', '2.3.2'],
  ['node_modules/playwright', PLAYWRIGHT_VERSION],
  ['node_modules/playwright-core', PLAYWRIGHT_VERSION]
]);

function finding(code, path, message) {
  return { code, path, message };
}

function exactKeys(value, expected) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
}

function exactVersion(value) {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}

function parseJsonFile(files, name, findings) {
  if (!Object.hasOwn(files, name)) {
    findings.push(finding('FILE-MISSING', name, 'required source-lock file is missing'));
    return null;
  }
  try {
    return JSON.parse(files[name]);
  } catch (error) {
    findings.push(finding('JSON-INVALID', name, 'file must contain valid JSON'));
    return null;
  }
}

function validateManifest(manifest, findings) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    findings.push(finding('MANIFEST-SHAPE', 'package.json', 'manifest must be an object'));
    return;
  }
  if (!exactKeys(manifest, EXPECTED_MANIFEST_KEYS)) {
    findings.push(finding('MANIFEST-KEYS', 'package.json', 'manifest keys must be the exact dev-only contract'));
  }
  if (manifest.name !== 'research-lab-browser-tests' || manifest.version !== '0.0.0') {
    findings.push(finding('MANIFEST-IDENTITY', 'package.json', 'manifest identity must remain fixed'));
  }
  if (manifest.private !== true) {
    findings.push(finding('MANIFEST-PRIVATE', 'package.json.private', 'manifest must be private'));
  }
  if (!exactKeys(manifest.engines, ['node']) || manifest.engines.node !== '>=20') {
    findings.push(finding('MANIFEST-NODE', 'package.json.engines', 'Node policy must be exactly >=20'));
  }
  if (!exactKeys(manifest.devDependencies, ['playwright']) || manifest.devDependencies.playwright !== PLAYWRIGHT_VERSION) {
    findings.push(finding('MANIFEST-PLAYWRIGHT', 'package.json.devDependencies.playwright', 'Playwright must be exactly 1.61.1'));
  }
  if (Object.hasOwn(manifest, 'dependencies') || Object.hasOwn(manifest, 'scripts')) {
    findings.push(finding('MANIFEST-RUNTIME', 'package.json', 'runtime dependencies and package scripts are forbidden'));
  }
}

function parseNpmrc(text, findings) {
  if (typeof text !== 'string') return [];
  const entries = [];
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) {
      findings.push(finding('NPMRC-SYNTAX', `.npmrc:${index + 1}`, 'each entry must be key=value'));
      continue;
    }
    entries.push({ key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim(), line: index + 1 });
  }
  return entries;
}

function validateNpmrc(text, findings) {
  if (typeof text !== 'string') {
    findings.push(finding('FILE-MISSING', '.npmrc', 'required source-lock file is missing'));
    return;
  }
  const entries = parseNpmrc(text, findings);
  const counts = new Map();
  for (const entry of entries) {
    counts.set(entry.key, (counts.get(entry.key) || 0) + 1);
    if (entry.key.startsWith('@') || entry.key.endsWith(':registry')) {
      findings.push(finding('NPMRC-SCOPED-REGISTRY', `.npmrc:${entry.line}`, 'scoped registries are forbidden'));
    }
    if (entry.key === 'strict-ssl' && entry.value !== 'true') {
      findings.push(finding('NPMRC-VERIFICATION', `.npmrc:${entry.line}`, 'TLS verification may not be disabled'));
    }
    if (!EXPECTED_NPMRC.has(entry.key)) {
      findings.push(finding('NPMRC-KEYS', `.npmrc:${entry.line}`, 'only the five source-lock settings are allowed'));
    }
  }
  for (const [key, expectedValue] of EXPECTED_NPMRC) {
    const matches = entries.filter((entry) => entry.key === key);
    if (matches.length !== 1) {
      findings.push(finding('NPMRC-DUPLICATE', `.npmrc:${key}`, 'each required setting must occur exactly once'));
    } else if (matches[0].value !== expectedValue) {
      const code = key === 'ignore-scripts' ? 'NPMRC-IGNORE-SCRIPTS' : key === 'registry' ? 'NPMRC-REGISTRY' : 'NPMRC-VALUE';
      findings.push(finding(code, `.npmrc:${matches[0].line}`, `${key} must equal ${expectedValue}`));
    }
  }
  if (entries.length !== EXPECTED_NPMRC.size) {
    findings.push(finding('NPMRC-COUNT', '.npmrc', 'exactly five source-lock settings are required'));
  }
}

function trustedTarball(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === 'https://registry.npmjs.org' &&
      !url.username && !url.password && !url.port && !url.hash && url.pathname.endsWith('.tgz');
  } catch (error) {
    return false;
  }
}

function validateDependencyEdges(packagePath, entry, findings) {
  for (const field of ['dependencies', 'optionalDependencies']) {
    if (!Object.hasOwn(entry, field)) continue;
    if (!entry[field] || typeof entry[field] !== 'object' || Array.isArray(entry[field])) {
      findings.push(finding('LOCK-EDGE', `package-lock.json.packages.${packagePath}.${field}`, 'dependency edges must be an object'));
      continue;
    }
    for (const [name, version] of Object.entries(entry[field])) {
      if (!exactVersion(version)) {
        findings.push(finding('LOCK-EDGE-VERSION', `package-lock.json.packages.${packagePath}.${field}.${name}`, 'dependency edge must use an exact version'));
      }
      const target = `node_modules/${name}`;
      if (!EXPECTED_PACKAGES.has(target) || EXPECTED_PACKAGES.get(target) !== version) {
        findings.push(finding('LOCK-GRAPH', `package-lock.json.packages.${packagePath}.${field}.${name}`, 'dependency edge is outside the exact Playwright graph'));
      }
    }
  }
}

function validateLockfile(lockfile, manifest, findings) {
  if (!lockfile || typeof lockfile !== 'object' || Array.isArray(lockfile)) {
    findings.push(finding('LOCK-SHAPE', 'package-lock.json', 'lockfile must be an object'));
    return;
  }
  if (!exactKeys(lockfile, ['lockfileVersion', 'name', 'packages', 'requires', 'version'])) {
    findings.push(finding('LOCK-KEYS', 'package-lock.json', 'lockfile must use the exact npm v3 top-level shape'));
  }
  if (lockfile.lockfileVersion !== 3 || lockfile.requires !== true) {
    findings.push(finding('LOCK-VERSION', 'package-lock.json.lockfileVersion', 'lockfile version 3 with requires=true is mandatory'));
  }
  if (lockfile.name !== 'research-lab-browser-tests' || lockfile.version !== '0.0.0') {
    findings.push(finding('LOCK-IDENTITY', 'package-lock.json', 'lockfile identity must match package.json'));
  }
  if (!lockfile.packages || typeof lockfile.packages !== 'object' || Array.isArray(lockfile.packages)) {
    findings.push(finding('LOCK-PACKAGES', 'package-lock.json.packages', 'packages map is required'));
    return;
  }
  const root = lockfile.packages[''];
  if (!root || typeof root !== 'object' || Array.isArray(root)) {
    findings.push(finding('LOCK-ROOT', 'package-lock.json.packages[""]', 'root package entry is required'));
  } else {
    if (!exactKeys(root, ['devDependencies', 'engines', 'name', 'version']) ||
        root.name !== manifest?.name || root.version !== manifest?.version ||
        !exactKeys(root.engines, ['node']) || root.engines.node !== '>=20' ||
        !exactKeys(root.devDependencies, ['playwright']) || root.devDependencies.playwright !== PLAYWRIGHT_VERSION) {
      findings.push(finding('LOCK-ROOT', 'package-lock.json.packages[""]', 'root package entry must exactly mirror the dev-only manifest'));
    }
  }
  const externalPaths = Object.keys(lockfile.packages).filter((packagePath) => packagePath !== '').sort();
  const expectedPaths = [...EXPECTED_PACKAGES.keys()].sort();
  if (JSON.stringify(externalPaths) !== JSON.stringify(expectedPaths)) {
    findings.push(finding('LOCK-GRAPH', 'package-lock.json.packages', 'packages must be the exact Playwright dependency graph'));
  }
  for (const packagePath of externalPaths) {
    const entry = lockfile.packages[packagePath];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      findings.push(finding('LOCK-PACKAGE', `package-lock.json.packages.${packagePath}`, 'external package entry must be an object'));
      continue;
    }
    const expectedVersion = EXPECTED_PACKAGES.get(packagePath);
    if (!expectedVersion || entry.version !== expectedVersion || !exactVersion(entry.version)) {
      findings.push(finding('LOCK-PACKAGE-VERSION', `package-lock.json.packages.${packagePath}.version`, 'external package version must be exact and expected'));
    }
    if (!trustedTarball(entry.resolved) || entry.link === true) {
      findings.push(finding('LOCK-SOURCE', `package-lock.json.packages.${packagePath}.resolved`, 'external package must resolve from the canonical HTTPS npm registry tarball'));
    }
    if (typeof entry.integrity !== 'string' || !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(entry.integrity)) {
      findings.push(finding('LOCK-INTEGRITY', `package-lock.json.packages.${packagePath}.integrity`, 'external package must have a sha512 integrity hash'));
    }
    validateDependencyEdges(packagePath, entry, findings);
  }
  const playwright = lockfile.packages['node_modules/playwright'];
  if (!playwright || !exactKeys(playwright.dependencies, ['playwright-core']) || playwright.dependencies['playwright-core'] !== PLAYWRIGHT_VERSION ||
      !exactKeys(playwright.optionalDependencies, ['fsevents']) || playwright.optionalDependencies.fsevents !== '2.3.2') {
    findings.push(finding('LOCK-GRAPH', 'package-lock.json.packages.node_modules/playwright', 'Playwright dependency edges must be exact'));
  }
}

function validateSourceLock(files) {
  const findings = [];
  for (const name of REQUIRED_FILES) {
    if (!Object.hasOwn(files, name)) findings.push(finding('FILE-MISSING', name, 'required source-lock file is missing'));
  }
  const manifest = parseJsonFile(files, 'package.json', findings);
  const lockfile = parseJsonFile(files, 'package-lock.json', findings);
  validateManifest(manifest, findings);
  if (Object.hasOwn(files, '.npmrc')) validateNpmrc(files['.npmrc'], findings);
  validateLockfile(lockfile, manifest, findings);
  return findings;
}

function readActualFiles() {
  const files = {};
  for (const name of REQUIRED_FILES) {
    try {
      files[name] = readFileSync(resolve(ROOT, name), 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  return files;
}

function cloneFiles(files) {
  return { ...files };
}

function mutateJson(files, name, mutate) {
  const value = JSON.parse(files[name]);
  mutate(value);
  files[name] = JSON.stringify(value, null, 2) + '\n';
}

function requireRejected(actualFiles, name, expectedCode, mutate) {
  const candidate = cloneFiles(actualFiles);
  mutate(candidate);
  const findings = validateSourceLock(candidate);
  if (!findings.some((item) => item.code === expectedCode)) {
    throw new Error(`adversarial ${name} was unexpectedly accepted; expected ${expectedCode}`);
  }
  console.log(`[node-source-lock] adversarial=${name} result=REJECTED code=${expectedCode}`);
}

function main() {
  const actualFiles = readActualFiles();
  const actualFindings = validateSourceLock(actualFiles);
  if (actualFindings.length) {
    console.error('[node-source-lock] actual=FAIL');
    for (const item of actualFindings) console.error(`[node-source-lock] finding=${item.code} path=${item.path} message=${item.message}`);
    console.error('[node-source-lock] FAIL');
    process.exit(1);
  }

  console.log('[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20');
  console.log('[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true');
  console.log('[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512');
  console.log('[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2');

  requireRejected(actualFiles, 'missing-file', 'FILE-MISSING', (files) => { delete files['package-lock.json']; });
  requireRejected(actualFiles, 'manifest-drift', 'MANIFEST-KEYS', (files) => mutateJson(files, 'package.json', (value) => { value.scripts = { test: 'playwright test' }; }));
  requireRejected(actualFiles, 'manifest-range', 'MANIFEST-PLAYWRIGHT', (files) => mutateJson(files, 'package.json', (value) => { value.devDependencies.playwright = '^1.61.1'; }));
  requireRejected(actualFiles, 'manifest-wrong-version', 'MANIFEST-PLAYWRIGHT', (files) => mutateJson(files, 'package.json', (value) => { value.devDependencies.playwright = '1.61.0'; }));
  requireRejected(actualFiles, 'second-registry', 'NPMRC-DUPLICATE', (files) => { files['.npmrc'] += '\nregistry=https://example.invalid/\n'; });
  requireRejected(actualFiles, 'scoped-registry', 'NPMRC-SCOPED-REGISTRY', (files) => { files['.npmrc'] += '\n@untrusted:registry=https://example.invalid/\n'; });
  requireRejected(actualFiles, 'verification-disabled', 'NPMRC-VERIFICATION', (files) => { files['.npmrc'] += '\nstrict-ssl=false\n'; });
  requireRejected(actualFiles, 'lifecycle-relaxation', 'NPMRC-IGNORE-SCRIPTS', (files) => { files['.npmrc'] = files['.npmrc'].replace('ignore-scripts=true', 'ignore-scripts=false'); });
  requireRejected(actualFiles, 'untrusted-resolved-url', 'LOCK-SOURCE', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].resolved = 'https://example.invalid/playwright-1.61.1.tgz'; }));
  requireRejected(actualFiles, 'missing-integrity', 'LOCK-INTEGRITY', (files) => mutateJson(files, 'package-lock.json', (value) => { delete value.packages['node_modules/playwright'].integrity; }));
  requireRejected(actualFiles, 'git-source', 'LOCK-SOURCE', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].resolved = 'git+https://github.com/microsoft/playwright.git'; }));
  requireRejected(actualFiles, 'file-source', 'LOCK-SOURCE', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].resolved = 'file:../playwright'; }));
  requireRejected(actualFiles, 'path-source', 'LOCK-SOURCE', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].resolved = '../playwright'; }));
  requireRejected(actualFiles, 'http-source', 'LOCK-SOURCE', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].resolved = 'http://registry.npmjs.org/playwright/-/playwright-1.61.1.tgz'; }));
  requireRejected(actualFiles, 'external-version-range', 'LOCK-PACKAGE-VERSION', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/playwright'].version = '^1.61.1'; }));
  requireRejected(actualFiles, 'extra-package', 'LOCK-GRAPH', (files) => mutateJson(files, 'package-lock.json', (value) => { value.packages['node_modules/unplanned'] = { version: '1.0.0', resolved: 'https://registry.npmjs.org/unplanned/-/unplanned-1.0.0.tgz', integrity: 'sha512-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==' }; }));

  console.log('[node-source-lock] actual=PASS');
  console.log('[node-source-lock] OK adversarial=16 unexpectedAcceptances=0');
}

main();