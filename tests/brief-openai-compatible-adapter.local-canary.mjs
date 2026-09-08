import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildToolAuthorRequest,
  verifyAuthorRequestFingerprint
} from '../scripts/brief-author.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHADOW_CLI = join(ROOT, 'scripts', 'brief-shadow-generate.mjs');
const CANARY_BRIEF = Object.freeze({
  contractVersion: 'tool-brief/v1',
  briefId: 'local-provider-canary',
  summary: 'Bounded shadow candidate.',
  citations: ['local-provider-canary']
});

function frozenCanaryRequest() {
  const built = buildToolAuthorRequest({
    contractVersion: 'compact-author-input/v1',
    compactedRead: {
      state: 'available',
      observationRef: 'local-provider-canary',
      candidate: CANARY_BRIEF
    },
    includedFactIds: ['local-provider-canary'],
    omittedFacts: [],
    // Bonsai writes a complete schema-fixed envelope rather than abbreviating the
    // supplied candidate; leave enough headroom for the closing JSON delimiters.
    maxOutputTokens: 512
  }, {
    providerId: 'shadow-route',
    modelId: 'selected-by-shadow-profile',
    promptPolicyVersion: 'local-provider-canary/v1',
    schemaVersion: 'tool-brief/v1',
    validatorVersion: 'brief-author/v1'
  });
  assert.equal(built.ok, true, JSON.stringify(built.error || null));
  const verified = verifyAuthorRequestFingerprint(built.request);
  assert.equal(verified.ok, true, JSON.stringify(verified.error || null));
  assert.equal(verified.request, built.request);
  return built.request;
}

function requiredEnvironment(name) {
  const value = process.env[name];
  assert.equal(typeof value, 'string', `${name} must be supplied for the requested real-provider canary`);
  assert(value.length > 0, `${name} must be non-empty for the requested real-provider canary`);
  return value;
}

function runCanary() {
  return new Promise((resolve, reject) => {
    const request = frozenCanaryRequest();
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
      request,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8')
    }));
    child.stdin.end(JSON.stringify(request));
  });
}

function assertCanaryResult(result, profileId) {
  assert.equal(result.code, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.contractVersion, 'brief-shadow-result/v1');
  assert.equal(parsed.authoritative, false);
  assert.equal(parsed.profile.profileId, profileId);
  assert.equal(parsed.authorResponse.requestFingerprint, result.request.requestFingerprint);
  assert.deepEqual(Object.keys(parsed.authorResponse).sort(), ['brief', 'contractVersion', 'requestFingerprint']);
  assert(parsed.candidate && typeof parsed.candidate === 'object' && !Array.isArray(parsed.candidate));
  assert.deepEqual(parsed.candidate, parsed.authorResponse.brief);
  for (const dimension of ['inputTokens', 'outputTokens', 'totalTokens']) {
    assert(['measured', 'unmeasured'].includes(parsed.usage[dimension].state));
    if (parsed.usage[dimension].state === 'measured') {
      assert(Number.isSafeInteger(parsed.usage[dimension].value));
      assert(parsed.usage[dimension].value >= 0);
    } else {
      assert.equal(Object.hasOwn(parsed.usage[dimension], 'value'), false);
    }
  }
  assert.equal(parsed.usage.providerCredits.state, 'not-applicable');
  assert.equal(parsed.usage.monetaryCost.state, 'not-applicable');
}

test('Regression E2E: SCN-030-002 OMLX returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state', async () => {
  assert.equal(process.env.BRIEF_SHADOW_PROFILE, 'omlx-openai-compatible-bonsai27');
  requiredEnvironment('BRIEF_OMLX_BASE_URL');
  const result = await runCanary();
  assertCanaryResult(result, 'omlx-openai-compatible-bonsai27');
});

test('Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state', async () => {
  assert.equal(process.env.BRIEF_SHADOW_PROFILE, 'ollama-openai-compatible');
  requiredEnvironment('BRIEF_OLLAMA_BASE_URL');
  requiredEnvironment('BRIEF_OLLAMA_MODEL');
  const result = await runCanary();
  assertCanaryResult(result, 'ollama-openai-compatible');
});
