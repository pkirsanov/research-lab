#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_PATH = realpathSync(fileURLToPath(import.meta.url));
const ROOT = realpathSync(resolve(dirname(SCRIPT_PATH), '..'));
const TESTS_DIR = resolve(ROOT, 'tests');
const PLAYWRIGHT_CONFIG = realpathSync(resolve(ROOT, 'playwright.config.mjs'));
const PLAYWRIGHT_CLI = realpathSync(resolve(ROOT, 'node_modules/playwright/cli.js'));
const OWNED_TEMP_PREFIX = `research-lab-scn-bug017-06-${process.pid}-`;
const FR_017_004_MAXIMUM_RATIO = 3.0;
const EXPECTED_LIFETIME_TAX_FILE_COUNT = 22;
const SIGNAL_EXIT_CODES = Object.freeze({
  SIGHUP: 129,
  SIGINT: 130,
  SIGTERM: 143,
  SIGALRM: 142
});

const activeChildren = new Set();
const interruptionHandlers = new Map();
const ownedTempRoots = new Set();
let interruptedSignal = null;
let interruptionTimer = null;

class UsageError extends Error {}
class ContractError extends Error {}

function usage(stream = console.error) {
  stream('Usage: node scripts/validate-playwright-cost-ratio.mjs --live');
  stream('       node scripts/validate-playwright-cost-ratio.mjs --control at-bound');
  stream('       node scripts/validate-playwright-cost-ratio.mjs --control over-bound');
}

function parseInvocation(argv) {
  if (argv.length === 1 && argv[0] === '--live') return { mode: 'live' };
  if (argv.length === 2 && argv[0] === '--control') {
    if (argv[1] === 'at-bound' || argv[1] === 'over-bound') {
      return { mode: 'control', control: argv[1] };
    }
    throw new UsageError(`unknown control: ${argv[1]}`);
  }
  throw new UsageError(`unknown invocation: ${argv.length === 0 ? '(none)' : argv.join(' ')}`);
}

function evaluateWallTimeRatio(comparison) {
  const { systemChromeWallMs, bundledChromiumWallMs } = comparison;
  if (!Number.isFinite(systemChromeWallMs) || systemChromeWallMs <= 0) {
    throw new ContractError('systemChromeWallMs must be a positive finite number');
  }
  if (!Number.isFinite(bundledChromiumWallMs) || bundledChromiumWallMs <= 0) {
    throw new ContractError('bundledChromiumWallMs must be a positive finite number');
  }

  const ratio = systemChromeWallMs / bundledChromiumWallMs;
  const meetsMaximum = ratio <= FR_017_004_MAXIMUM_RATIO;
  const disposition = meetsMaximum ? 'meets' : 'exceeds';
  return Object.freeze({
    exitCode: meetsMaximum ? 0 : 1,
    ratio,
    meetsMaximum,
    message: `SCN-BUG017-06: wall-time ratio ${ratio.toFixed(3)} ${disposition} FR-017-004 maximum ${FR_017_004_MAXIMUM_RATIO.toFixed(3)}`
  });
}

function createOwnedTempRoot(kind) {
  const externalTempRoot = realpathSync(tmpdir());
  if (externalTempRoot === ROOT || externalTempRoot.startsWith(ROOT + sep)) {
    throw new ContractError('operating-system temp root must resolve outside the repository');
  }
  const root = mkdtempSync(resolve(externalTempRoot, `${OWNED_TEMP_PREFIX}${kind}-`));
  ownedTempRoots.add(root);
  return root;
}

function removeOwnedTempRoot(root) {
  rmSync(root, { recursive: true, force: true });
  ownedTempRoots.delete(root);
}

function cleanupOwnedTempRoots() {
  for (const root of [...ownedTempRoots]) removeOwnedTempRoot(root);
}

function signalChildTree(child, signal) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === 'win32') child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error;
  }
}

function terminateActiveChildren(signal) {
  for (const child of activeChildren) signalChildTree(child, signal);
}

function interruptionExitCode() {
  return SIGNAL_EXIT_CODES[interruptedSignal] ?? 1;
}

function handleInterruption(signal) {
  if (interruptedSignal !== null) {
    terminateActiveChildren('SIGKILL');
    cleanupOwnedTempRoots();
    process.exit(interruptionExitCode());
  }

  interruptedSignal = signal;
  console.error(`SCN-BUG017-06: interrupted by ${signal}; terminating owned child processes`);
  terminateActiveChildren('SIGTERM');
  interruptionTimer = setTimeout(() => {
    terminateActiveChildren('SIGKILL');
    cleanupOwnedTempRoots();
    process.exit(interruptionExitCode());
  }, 2000);
}

function installInterruptionHandlers() {
  for (const signal of Object.keys(SIGNAL_EXIT_CODES)) {
    const handler = () => handleInterruption(signal);
    interruptionHandlers.set(signal, handler);
    process.on(signal, handler);
  }
}

function removeInterruptionHandlers() {
  for (const signal of Object.keys(SIGNAL_EXIT_CODES)) {
    const handler = interruptionHandlers.get(signal);
    if (handler) process.off(signal, handler);
  }
  interruptionHandlers.clear();
  if (interruptionTimer !== null) clearTimeout(interruptionTimer);
}

function throwIfInterrupted() {
  if (interruptedSignal !== null) {
    throw new ContractError(`interrupted by ${interruptedSignal}`);
  }
}

function deterministicControlRecord(control) {
  const atBound = Object.freeze({
    inputKind: 'deterministic comparison input',
    systemChromeWallMs: 3000,
    bundledChromiumWallMs: 1000
  });
  return control === 'over-bound'
    ? { ...atBound, systemChromeWallMs: 3001 }
    : { ...atBound };
}

function runControl(control) {
  const tempRoot = createOwnedTempRoot(`control-${control}`);
  const recordPath = resolve(tempRoot, 'comparison.json');
  try {
    writeFileSync(recordPath, JSON.stringify(deterministicControlRecord(control)) + '\n', 'utf8');
    const comparison = JSON.parse(readFileSync(recordPath, 'utf8'));
    console.log(
      `SCN-BUG017-06: ${comparison.inputKind}`
      + ` systemChromeWallMs=${comparison.systemChromeWallMs}`
      + ` bundledChromiumWallMs=${comparison.bundledChromiumWallMs}`
    );
    const result = evaluateWallTimeRatio(comparison);
    console.log(result.message);
    throwIfInterrupted();
    return result.exitCode;
  } finally {
    removeOwnedTempRoot(tempRoot);
  }
}

function lifetimeTaxFiles() {
  const files = readdirSync(TESTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^lifetime-tax.*\.spec\.mjs$/.test(entry.name))
    .map((entry) => `tests/${entry.name}`)
    .sort();
  if (files.length !== EXPECTED_LIFETIME_TAX_FILE_COUNT) {
    throw new ContractError(
      `expected exactly ${EXPECTED_LIFETIME_TAX_FILE_COUNT} tests/lifetime-tax*.spec.mjs files, found ${files.length}`
    );
  }
  return files;
}

function oneProject(config, name) {
  const matches = Array.isArray(config?.projects)
    ? config.projects.filter((project) => project?.name === name)
    : [];
  if (matches.length !== 1) {
    throw new ContractError(`playwright.config.mjs must define exactly one ${name} project`);
  }
  return matches[0];
}

async function loadValidatedConfiguration() {
  const imported = await import(pathToFileURL(PLAYWRIGHT_CONFIG).href);
  const config = imported.default;
  if (config?.workers !== 1) {
    throw new ContractError(`playwright.config.mjs workers must be exactly 1, found ${String(config?.workers)}`);
  }

  const systemChrome = oneProject(config, 'system-chrome');
  if (systemChrome?.use?.browserName !== 'chromium' || systemChrome?.use?.channel !== 'chrome') {
    throw new ContractError('system-chrome must use browserName chromium and channel chrome');
  }

  const bundledChromium = oneProject(config, 'chromium');
  if (bundledChromium?.use?.browserName !== 'chromium') {
    throw new ContractError('chromium must use browserName chromium');
  }
  if (
    Object.hasOwn(config?.use ?? {}, 'channel')
    || Object.hasOwn(bundledChromium?.use ?? {}, 'channel')
  ) {
    throw new ContractError('bundled chromium must not declare or inherit a channel override');
  }

  return { bundledChromium, config, systemChrome };
}

function runPlaywrightProject(project, files, outputDirectory) {
  const args = [
    PLAYWRIGHT_CLI,
    'test',
    ...files,
    `--config=${PLAYWRIGHT_CONFIG}`,
    `--project=${project}`,
    '--reporter=list',
    `--output=${outputDirectory}`
  ];
  if (args.some((argument) => argument === '--workers' || argument.startsWith('--workers='))) {
    throw new ContractError('live comparison must not override configured workers');
  }

  console.log(`SCN-BUG017-06: live project=${project} files=${files.length} start`);
  const startedAt = performance.now();
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      detached: process.platform !== 'win32',
      stdio: 'inherit'
    });
    activeChildren.add(child);

    child.once('error', (error) => {
      activeChildren.delete(child);
      rejectRun(error);
    });
    child.once('close', (code, signal) => {
      activeChildren.delete(child);
      const wallMs = performance.now() - startedAt;
      console.log(
        `SCN-BUG017-06: live project=${project} exit=${String(code)}`
        + ` signal=${signal ?? 'none'} wallMs=${wallMs.toFixed(3)}`
      );
      resolveRun({ code, project, signal, wallMs });
    });
  });
}

async function runLive() {
  await loadValidatedConfiguration();
  const files = lifetimeTaxFiles();
  const tempRoot = createOwnedTempRoot('live');
  try {
    console.log(`SCN-BUG017-06: live workload files=${files.length} configuredWorkers=1`);
    const bundled = await runPlaywrightProject('chromium', files, resolve(tempRoot, 'bundled-chromium'));
    throwIfInterrupted();
    const systemChrome = await runPlaywrightProject(
      'system-chrome',
      files,
      resolve(tempRoot, 'system-chrome')
    );
    throwIfInterrupted();

    for (const run of [bundled, systemChrome]) {
      if (run.code !== 0 || run.signal !== null) {
        throw new ContractError(
          `${run.project} child must exit 0 without a signal, got exit=${String(run.code)} signal=${run.signal ?? 'none'}`
        );
      }
    }

    console.log(
      'SCN-BUG017-06: observed runtime input'
      + ` systemChromeWallMs=${systemChrome.wallMs.toFixed(3)}`
      + ` bundledChromiumWallMs=${bundled.wallMs.toFixed(3)}`
    );
    const result = evaluateWallTimeRatio({
      systemChromeWallMs: systemChrome.wallMs,
      bundledChromiumWallMs: bundled.wallMs
    });
    console.log(result.message);
    return result.exitCode;
  } finally {
    removeOwnedTempRoot(tempRoot);
  }
}

async function main(argv) {
  let invocation;
  try {
    invocation = parseInvocation(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(error.message);
    usage();
    return 64;
  }

  installInterruptionHandlers();
  try {
    const exitCode = invocation.mode === 'control'
      ? runControl(invocation.control)
      : await runLive();
    return interruptedSignal === null ? exitCode : interruptionExitCode();
  } catch (error) {
    if (interruptedSignal !== null) return interruptionExitCode();
    console.error(`SCN-BUG017-06: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  } finally {
    terminateActiveChildren('SIGTERM');
    cleanupOwnedTempRoots();
    removeInterruptionHandlers();
  }
}

process.exitCode = await main(process.argv.slice(2));
