import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHADOW_CLI = join(ROOT, 'scripts', 'brief-shadow-generate.mjs');

function frozenCanaryRequest() {
  return {
    contractVersion: 'tool-author-request/v1',
    instructions: 'Return one JSON tool-author-response/v1 object. Copy requestFingerprint exactly. Set brief to one small JSON object.',
    data: {
      contractVersion: 'tool-author-data/v1',
      compactedRead: { state: 'available', observationRef: 'local-provider-canary' },
      includedFactIds: ['local-provider-canary'],
      omittedFacts: []
    },
    provider: 'shadow-route',
    model: 'selected-by-shadow-profile',
    promptPolicy: 'local-provider-canary/v1',
    schema: 'tool-brief/v1',
    validator: 'brief-author/v1',
    maxOutputTokens: 128,
    requestFingerprint: `sha256:${'c'.repeat(64)}`
  };
}

function requiredEnvironment(name) {
  const value = process.env[name];
  assert.equal(typeof value, 'string', `${name} must be supplied for the requested real-provider canary`);
  assert(value.length > 0, `${name} must be non-empty for the requested real-provider canary`);
  return value;
}

function runCanary() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SHADOW_CLI], {
      cwd: ROOT,
      env: process.env,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({
      code,
      signal,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8')
    }));
    child.stdin.end(JSON.stringify(frozenCanaryRequest()));
  });
}

function assertCanaryResult(result, profileId) {
  assert.equal(result.code, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.contractVersion, 'brief-shadow-result/v1');
  assert.equal(parsed.authoritative, false);
  assert.equal(parsed.profile.profileId, profileId);
  assert.equal(parsed.authorResponse.requestFingerprint, frozenCanaryRequest().requestFingerprint);
  assert(parsed.candidate && typeof parsed.candidate === 'object' && !Array.isArray(parsed.candidate));
  for (const dimension of ['inputTokens', 'outputTokens', 'totalTokens']) {
    assert(['measured', 'unmeasured'].includes(parsed.usage[dimension].state));
    if (parsed.usage[dimension].state === 'measured') {
      assert(Number.isInteger(parsed.usage[dimension].value));
      assert(parsed.usage[dimension].value >= 0);
    } else {
      assert.equal(Object.hasOwn(parsed.usage[dimension], 'value'), false);
    }
  }
  assert.equal(parsed.usage.providerCredits.state, 'not-applicable');
  assert.equal(parsed.usage.monetaryCost.state, 'not-applicable');
}

test('Regression E2E: SCN-030-002 OMLX returns tiny strict JSON with truthful usage state', async () => {
  assert.equal(process.env.BRIEF_SHADOW_PROFILE, 'omlx-openai-compatible-qwen38');
  requiredEnvironment('BRIEF_OMLX_BASE_URL');
  const result = await runCanary();
  assertCanaryResult(result, 'omlx-openai-compatible-qwen38');
});

test('Regression E2E: SCN-030-002 Ollama returns tiny strict JSON with truthful usage state', async () => {
  assert.equal(process.env.BRIEF_SHADOW_PROFILE, 'ollama-openai-compatible');
  requiredEnvironment('BRIEF_OLLAMA_BASE_URL');
  requiredEnvironment('BRIEF_OLLAMA_MODEL');
  const result = await runCanary();
  assertCanaryResult(result, 'ollama-openai-compatible');
});