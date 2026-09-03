import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  resolveShadowRuntimeProfile
} from '../scripts/brief-route-runtime.mjs';
import {
  buildOpenAICompatibleChatRequest,
  invokeOpenAICompatibleChat,
  qualifyOpenAICompatibleModel
} from '../scripts/brief-openai-compatible-adapter.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SHADOW_CLI = join(ROOT, 'scripts', 'brief-shadow-generate.mjs');
const require = createRequire(import.meta.url);
const RLBRIEFROUTE = require('../rlbriefroute.js');
const PROFILE_KEYS = Object.freeze([
  'BRIEF_SHADOW_PROFILE',
  'BRIEF_OMLX_BASE_URL',
  'BRIEF_OLLAMA_BASE_URL',
  'BRIEF_OLLAMA_MODEL'
]);
const PROTECTED_PATHS = Object.freeze([
  'scripts/brief-author.mjs',
  'scripts/brief-refresh.mjs',
  'scripts/brief-narrative-parallel.mjs',
  'scripts/brief-refresh-and-push.sh',
  'scripts/brief-refresh-scheduled.sh',
  'scripts/validate-brief-payload.mjs',
  'market-brief.payload.json',
  'brief-history.jsonl',
  'briefs/current.json',
  'package.json',
  'package-lock.json',
  '.npmrc'
]);

function frozenAuthorRequest(overrides = {}) {
  const request = {
    contractVersion: 'tool-author-request/v1',
    instructions: 'Return one bounded JSON response for the frozen data.',
    data: {
      contractVersion: 'tool-author-data/v1',
      compactedRead: { state: 'available', observationRef: 'observation-shadow-1' },
      includedFactIds: ['fact-shadow-1'],
      omittedFacts: []
    },
    provider: 'shadow-route',
    model: 'selected-by-shadow-profile',
    promptPolicy: 'shadow-canary/v1',
    schema: 'tool-brief/v1',
    validator: 'brief-author/v1',
    maxOutputTokens: 96,
    requestFingerprint: `sha256:${'a'.repeat(64)}`
  };
  return Object.assign(request, overrides);
}

function validAuthorEnvelope(request, suffix = 'ok') {
  return {
    contractVersion: 'tool-author-response/v1',
    requestFingerprint: request.requestFingerprint,
    brief: {
      contractVersion: 'tool-brief/v1',
      briefId: `shadow-${suffix}`,
      summary: 'Bounded shadow candidate.',
      citations: ['fact-shadow-1']
    }
  };
}

function openAIResponse(request, usage, overrides = {}) {
  const response = {
    id: 'chatcmpl-shadow-functional',
    object: 'chat.completion',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: JSON.stringify(validAuthorEnvelope(request))
      },
      finish_reason: 'stop'
    }]
  };
  if (usage !== undefined) response.usage = usage;
  return Object.assign(response, overrides);
}

function profileEnvironment(overrides = {}) {
  const environment = { ...process.env };
  for (const key of PROFILE_KEYS) delete environment[key];
  return Object.assign(environment, overrides);
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function startServer(handler) {
  const server = http.createServer((request, response) => {
    Promise.resolve(handler(request, response)).catch(() => {
      if (!response.headersSent) response.writeHead(500, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: { code: 'fixture-handler-failed' } }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert(address && typeof address === 'object');
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

function runShadowCli(environment, request, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SHADOW_CLI, ...args], {
      cwd: ROOT,
      env: environment,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    const ceiling = 512 * 1024;
    child.stdout.on('data', (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > ceiling) child.kill('SIGKILL');
      else stdout.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > ceiling) child.kill('SIGKILL');
      else stderr.push(chunk);
    });
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({
      code,
      signal,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8')
    }));
    child.stdin.end(JSON.stringify(request));
  });
}

function responseJson(response, status, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  response.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body)
  });
  response.end(body);
}

function hashValue(value) {
  return createHash('sha256').update(value).digest('hex');
}

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', shell: false });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function snapshotAuthority() {
  const files = {};
  for (const relativePath of PROTECTED_PATHS) {
    files[relativePath] = hashValue(readFileSync(join(ROOT, relativePath)));
  }
  const statusPath = gitOutput(['rev-parse', '--git-path', 'brief-scheduler.status']).trim();
  const absoluteStatusPath = statusPath.startsWith('/') ? statusPath : join(ROOT, statusPath);
  for (const absolutePath of [absoluteStatusPath, `${absoluteStatusPath}.publish-ack`]) {
    files[absolutePath] = existsSync(absolutePath) ? hashValue(readFileSync(absolutePath)) : '<absent>';
  }
  const indexPath = gitOutput(['rev-parse', '--git-path', 'index']).trim();
  const absoluteIndexPath = indexPath.startsWith('/') ? indexPath : join(ROOT, indexPath);
  return {
    files,
    index: hashValue(readFileSync(absoluteIndexPath)),
    status: gitOutput(['status', '--porcelain=v1', '--untracked-files=all'])
  };
}

test('Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP', async () => {
  let requestCount = 0;
  const server = await startServer((_request, response) => {
    requestCount += 1;
    responseJson(response, 500, { error: { code: 'unexpected-request' } });
  });
  try {
    const base = profileEnvironment({
      BRIEF_OMLX_BASE_URL: server.baseUrl,
      BRIEF_OLLAMA_BASE_URL: server.baseUrl,
      BRIEF_OLLAMA_MODEL: 'ollama-functional-model'
    });
    const missing = await runShadowCli(base, frozenAuthorRequest());
    assert.notEqual(missing.code, 0);
    assert.equal(safeJson(missing.stderr)?.error?.code, 'B030-SHADOW-PROFILE');

    const unknown = await runShadowCli({ ...base, BRIEF_SHADOW_PROFILE: 'ollama' }, frozenAuthorRequest());
    assert.notEqual(unknown.code, 0);
    assert.equal(safeJson(unknown.stderr)?.error?.code, 'B030-SHADOW-PROFILE');

    const missingOmlxUrl = { ...base, BRIEF_SHADOW_PROFILE: 'omlx-openai-compatible-qwen38' };
    delete missingOmlxUrl.BRIEF_OMLX_BASE_URL;
    const noOmlxUrl = await runShadowCli(missingOmlxUrl, frozenAuthorRequest());
    assert.notEqual(noOmlxUrl.code, 0);
    assert.equal(safeJson(noOmlxUrl.stderr)?.error?.code, 'B030-ADAPTER-CONFIG', noOmlxUrl.stderr);

    const missingOllamaModel = { ...base, BRIEF_SHADOW_PROFILE: 'ollama-openai-compatible' };
    delete missingOllamaModel.BRIEF_OLLAMA_MODEL;
    const noOllamaModel = await runShadowCli(missingOllamaModel, frozenAuthorRequest());
    assert.notEqual(noOllamaModel.code, 0);
    assert.equal(safeJson(noOllamaModel.stderr)?.error?.code, 'B030-ADAPTER-CONFIG');

    const unsafeUrl = await runShadowCli({
      ...base,
      BRIEF_SHADOW_PROFILE: 'omlx-openai-compatible-qwen38',
      BRIEF_OMLX_BASE_URL: `${server.baseUrl}?credential=present`
    }, frozenAuthorRequest());
    assert.notEqual(unsafeUrl.code, 0);
    assert.equal(safeJson(unsafeUrl.stderr)?.error?.code, 'B030-ADAPTER-CONFIG');

    const omlx = resolveShadowRuntimeProfile({
      ...base,
      BRIEF_SHADOW_PROFILE: 'omlx-openai-compatible-qwen38'
    });
    const ollama = resolveShadowRuntimeProfile({
      ...base,
      BRIEF_SHADOW_PROFILE: 'ollama-openai-compatible'
    });
    assert.equal(omlx.ok, true, JSON.stringify(omlx.error || null));
    assert.equal(ollama.ok, true, JSON.stringify(ollama.error || null));
    assert.equal(omlx.value.profileId, 'omlx-openai-compatible-qwen38');
    assert.equal(omlx.value.modelId, 'Qwen3.8-27B-3bit-MLX');
    assert.equal(ollama.value.profileId, 'ollama-openai-compatible');
    assert.equal(ollama.value.modelId, 'ollama-functional-model');
    assert.notEqual(omlx.value.providerId, ollama.value.providerId);
    assert.equal(omlx.value.transportContract, ollama.value.transportContract);
    assert.equal(requestCount, 0);
  } finally {
    await server.close();
  }
});

test('Regression: SCN-030-002 exact model preflight precedes one bounded strict JSON completion', async () => {
  const observed = [];
  const state = {
    includeModel: true,
    usage: { prompt_tokens: 11, completion_tokens: 7, total_tokens: 18 },
    candidate: null,
    failModels: false
  };
  const server = await startServer(async (request, response) => {
    const body = await readBody(request);
    observed.push({ method: request.method, url: request.url, headers: request.headers, body });
    if (request.url === '/v1/models') {
      if (state.failModels) return responseJson(response, 503, { error: { code: 'unavailable' } });
      return responseJson(response, 200, {
        object: 'list',
        data: state.includeModel ? [{ id: 'Qwen3.8-27B-3bit-MLX', object: 'model' }] : []
      });
    }
    if (request.url === '/v1/chat/completions') {
      const chat = JSON.parse(body);
      const authorRequest = JSON.parse(chat.messages[1].content);
      const responseBody = openAIResponse(authorRequest, state.usage);
      if (state.candidate !== null) responseBody.choices[0].message.content = state.candidate;
      return responseJson(response, 200, responseBody);
    }
    return responseJson(response, 404, { error: { code: 'unknown-path' } });
  });

  try {
    const environment = profileEnvironment({
      BRIEF_SHADOW_PROFILE: 'omlx-openai-compatible-qwen38',
      BRIEF_OMLX_BASE_URL: server.baseUrl
    });
    const request = frozenAuthorRequest();
    const completed = await runShadowCli(environment, request);
    assert.equal(completed.code, 0, completed.stderr);
    const result = safeJson(completed.stdout);
    assert.equal(result?.contractVersion, 'brief-shadow-result/v1');
    assert.equal(result?.authoritative, false);
    assert.equal(result?.profile?.profileId, 'omlx-openai-compatible-qwen38');
    assert.equal(result?.profile?.modelId, 'Qwen3.8-27B-3bit-MLX');
    assert.equal(result?.authorResponse?.requestFingerprint, request.requestFingerprint);
    assert.deepEqual(observed.map((entry) => entry.url), ['/v1/models', '/v1/chat/completions']);

    const chatRequest = JSON.parse(observed[1].body);
    assert.equal(chatRequest.model, 'Qwen3.8-27B-3bit-MLX');
    assert.equal(chatRequest.stream, false);
    assert.deepEqual(chatRequest.response_format, { type: 'json_object' });
    assert.equal(chatRequest.messages.length, 2);
    assert.equal(chatRequest.messages[0].role, 'system');
    assert.equal(chatRequest.messages[1].role, 'user');
    assert.deepEqual(JSON.parse(chatRequest.messages[1].content), request);
    assert.equal(Object.hasOwn(chatRequest, 'tools'), false);
    assert.equal(Object.hasOwn(chatRequest, 'tool_choice'), false);
    assert.equal(observed[1].headers.authorization, undefined);
    assert.equal(result.usage.inputTokens.state, 'measured');
    assert.equal(result.usage.inputTokens.value, 11);
    assert.equal(result.usage.outputTokens.value, 7);
    assert.equal(result.usage.totalTokens.value, 18);
    assert.equal(result.usage.providerCredits.state, 'not-applicable');
    assert.equal(result.usage.monetaryCost.state, 'not-applicable');

    state.includeModel = false;
    const chatCountBeforeMissing = observed.filter((entry) => entry.url === '/v1/chat/completions').length;
    const absentModel = await runShadowCli(environment, request);
    assert.notEqual(absentModel.code, 0);
    assert.equal(safeJson(absentModel.stderr)?.error?.code, 'B030-ROUTE-UNAVAILABLE');
    assert.equal(observed.filter((entry) => entry.url === '/v1/chat/completions').length, chatCountBeforeMissing);

    state.includeModel = true;
    state.usage = undefined;
    const unmeasured = await runShadowCli(environment, request);
    assert.equal(unmeasured.code, 0, unmeasured.stderr);
    const unmeasuredResult = safeJson(unmeasured.stdout);
    for (const dimension of ['inputTokens', 'outputTokens', 'totalTokens']) {
      assert.equal(unmeasuredResult.usage[dimension].state, 'unmeasured');
      assert.equal(Object.hasOwn(unmeasuredResult.usage[dimension], 'value'), false);
    }

    state.usage = { prompt_tokens: 3, completion_tokens: 4, total_tokens: 99 };
    const inconsistent = await runShadowCli(environment, request);
    assert.notEqual(inconsistent.code, 0);
    assert.equal(safeJson(inconsistent.stderr)?.error?.code, 'B030-USAGE-INVALID');

    state.usage = { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 };
    state.candidate = '[]';
    const nonObjectCandidate = await runShadowCli(environment, request);
    assert.notEqual(nonObjectCandidate.code, 0);
    assert.equal(safeJson(nonObjectCandidate.stderr)?.error?.code, 'B030-VALIDATION');
  } finally {
    await server.close();
  }
});

test('Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one', async () => {
  const request = frozenAuthorRequest({ data: { contractVersion: 'tool-author-data/v1', padding: '' } });
  const state = {
    modelBody: null,
    chatBody: null,
    modelStatus: 200,
    chatStatus: 200,
    holdModels: false,
    holdChat: false,
    modelRequests: 0,
    chatRequests: 0,
    releaseChat: null,
    chatEntered: null
  };
  let notifyChatEntered;
  state.chatEntered = new Promise((resolve) => { notifyChatEntered = resolve; });
  const server = await startServer(async (incoming, response) => {
    await readBody(incoming);
    if (incoming.url === '/v1/models') {
      state.modelRequests += 1;
      if (state.holdModels) return;
      return responseJson(response, state.modelStatus, state.modelBody || {
        object: 'list', data: [{ id: 'Qwen3.8-27B-3bit-MLX' }]
      });
    }
    if (incoming.url === '/v1/chat/completions') {
      state.chatRequests += 1;
      notifyChatEntered();
      if (state.holdChat) {
        await new Promise((resolve) => { state.releaseChat = resolve; });
      }
      return responseJson(response, state.chatStatus, state.chatBody || openAIResponse(
        request,
        { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
      ));
    }
    return responseJson(response, 404, { error: { code: 'unknown-path' } });
  });

  try {
    const resolved = resolveShadowRuntimeProfile(profileEnvironment({
      BRIEF_SHADOW_PROFILE: 'omlx-openai-compatible-qwen38',
      BRIEF_OMLX_BASE_URL: server.baseUrl
    }));
    assert.equal(resolved.ok, true, JSON.stringify(resolved.error || null));
    const profile = resolved.value;
    const limits = profile.limits;
    assert.deepEqual(limits, {
      modelListTimeoutMs: 5000,
      modelListMaxResponseBytes: 262144,
      chatTimeoutMs: 120000,
      chatMaxRequestBytes: 98304,
      chatMaxResponseBytes: 98304,
      retryCount: 0,
      maxInFlightChats: 1
    });

    const baseRequestBody = buildOpenAICompatibleChatRequest(profile, request);
    assert.equal(baseRequestBody.ok, true, JSON.stringify(baseRequestBody.error || null));
    const padAtCap = 'x'.repeat(limits.chatMaxRequestBytes - baseRequestBody.bytes);
    const atCapRequest = frozenAuthorRequest({ data: { contractVersion: 'tool-author-data/v1', padding: padAtCap } });
    const atCapBody = buildOpenAICompatibleChatRequest(profile, atCapRequest);
    assert.equal(atCapBody.bytes, limits.chatMaxRequestBytes);
    const overCapRequest = frozenAuthorRequest({ data: { contractVersion: 'tool-author-data/v1', padding: `${padAtCap}x` } });
    const overCapBody = buildOpenAICompatibleChatRequest(profile, overCapRequest);
    assert.equal(overCapBody.ok, false);
    assert.equal(overCapBody.error.code, 'B030-ADAPTER-CONFIG');
    const chatsBeforeOverCap = state.chatRequests;
    const overCapInvocation = await invokeOpenAICompatibleChat(profile, overCapRequest);
    assert.equal(overCapInvocation.ok, false);
    assert.equal(overCapInvocation.error.code, 'B030-ADAPTER-CONFIG');
    assert.equal(state.chatRequests, chatsBeforeOverCap);

    const modelAtCap = { object: 'list', data: [{ id: 'Qwen3.8-27B-3bit-MLX' }], padding: '' };
    modelAtCap.padding = 'x'.repeat(limits.modelListMaxResponseBytes - Buffer.byteLength(JSON.stringify(modelAtCap)));
    assert.equal(Buffer.byteLength(JSON.stringify(modelAtCap)), limits.modelListMaxResponseBytes);
    state.modelBody = modelAtCap;
    const qualifiedAtCap = await qualifyOpenAICompatibleModel(profile);
    assert.equal(qualifiedAtCap.ok, true, JSON.stringify(qualifiedAtCap.error || null));
    state.modelBody = { ...modelAtCap, padding: `${modelAtCap.padding}x` };
    const chatsBeforeLargeModels = state.chatRequests;
    const modelsOverCap = await qualifyOpenAICompatibleModel(profile);
    assert.equal(modelsOverCap.ok, false);
    assert.equal(modelsOverCap.error.code, 'B030-ROUTE-UNAVAILABLE');
    assert.equal(state.chatRequests, chatsBeforeLargeModels);

    const chatAtCap = openAIResponse(request, { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, { padding: '' });
    chatAtCap.padding = 'x'.repeat(limits.chatMaxResponseBytes - Buffer.byteLength(JSON.stringify(chatAtCap)));
    assert.equal(Buffer.byteLength(JSON.stringify(chatAtCap)), limits.chatMaxResponseBytes);
    state.modelBody = null;
    state.chatBody = chatAtCap;
    const chatAtCapResult = await invokeOpenAICompatibleChat(profile, request);
    assert.equal(chatAtCapResult.ok, true, JSON.stringify(chatAtCapResult.error || null));
    state.chatBody = { ...chatAtCap, padding: `${chatAtCap.padding}x` };
    const chatOverCapResult = await invokeOpenAICompatibleChat(profile, request);
    assert.equal(chatOverCapResult.ok, false);
    assert.equal(chatOverCapResult.error.code, 'B030-ROUTE-UNAVAILABLE');

    state.chatBody = null;
    state.modelStatus = 503;
    const modelsBeforeRetryProbe = state.modelRequests;
    const retryProbe = await qualifyOpenAICompatibleModel(profile);
    assert.equal(retryProbe.ok, false);
    assert.equal(state.modelRequests - modelsBeforeRetryProbe, 1);
    state.modelStatus = 200;

    state.holdModels = true;
    const timeoutStarted = Date.now();
    const timedOut = await qualifyOpenAICompatibleModel(profile);
    const elapsed = Date.now() - timeoutStarted;
    assert.equal(timedOut.ok, false);
    assert.equal(timedOut.error.code, 'B030-ROUTE-UNAVAILABLE');
    assert(elapsed >= 4900 && elapsed < 8000, `model-list deadline elapsed ${elapsed}ms`);
    state.holdModels = false;

    state.holdChat = true;
    state.chatEntered = new Promise((resolve) => { notifyChatEntered = resolve; });
    const first = invokeOpenAICompatibleChat(profile, request);
    await state.chatEntered;
    const second = await invokeOpenAICompatibleChat(profile, request);
    assert.equal(second.ok, false);
    assert.equal(second.error.code, 'B030-ROUTE-UNAVAILABLE');
    assert.equal(second.error.reason, 'max-in-flight');
    state.releaseChat();
    const firstResult = await first;
    assert.equal(firstResult.ok, true, JSON.stringify(firstResult.error || null));
    state.holdChat = false;

    state.holdChat = true;
    state.chatEntered = new Promise((resolve) => { notifyChatEntered = resolve; });
    const controller = new AbortController();
    const cancelledPromise = invokeOpenAICompatibleChat(profile, request, controller.signal);
    await state.chatEntered;
    controller.abort();
    if (state.releaseChat) state.releaseChat();
    const cancelled = await cancelledPromise;
    assert.equal(cancelled.ok, false);
    assert.equal(cancelled.error.code, 'B030-CANCELLED');
  } finally {
    if (state.releaseChat) state.releaseChat();
    await server.close();
  }
});

test('Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels', async () => {
  const sentinel = 'feature030-secret-sentinel-should-never-appear';
  const observedBodies = [];
  const server = await startServer(async (request, response) => {
    const body = await readBody(request);
    observedBodies.push(body);
    if (request.url === '/v1/models') {
      return responseJson(response, 200, { object: 'list', data: [{ id: 'ollama-functional-model' }] });
    }
    if (request.url === '/v1/chat/completions') {
      const parsed = JSON.parse(body);
      const authorRequest = JSON.parse(parsed.messages[1].content);
      return responseJson(response, 200, openAIResponse(
        authorRequest,
        { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 }
      ));
    }
    return responseJson(response, 404, { error: { code: 'unknown-path' } });
  });

  try {
    const environment = profileEnvironment({
      BRIEF_SHADOW_PROFILE: 'ollama-openai-compatible',
      BRIEF_OLLAMA_BASE_URL: server.baseUrl,
      BRIEF_OLLAMA_MODEL: 'ollama-functional-model',
      BRIEF_SECRET_SENTINEL: sentinel
    });
    const before = snapshotAuthority();
    const completed = await runShadowCli(environment, frozenAuthorRequest());
    assert.equal(completed.code, 0, completed.stderr);
    const result = safeJson(completed.stdout);
    assert.equal(result?.authoritative, false);
    assert.deepEqual(Object.keys(result).sort(), [
      'authorResponse', 'authoritative', 'candidate', 'contractVersion', 'profile', 'responseFingerprint', 'usage'
    ]);
    assert.equal(Object.hasOwn(result, 'publish'), false);
    assert.equal(Object.hasOwn(result, 'commit'), false);
    assert.equal(Object.hasOwn(result, 'fallback'), false);

    const unsafeText = [completed.stdout, completed.stderr, ...observedBodies].join('\n');
    assert.equal(unsafeText.includes(sentinel), false);
    assert.equal(unsafeText.includes(server.baseUrl), false);

    const requestsBeforeUnsafeArgs = observedBodies.length;
    for (const argument of ['--publish', '--commit', '--fallback=ollama', '--no-validate']) {
      const refused = await runShadowCli(environment, frozenAuthorRequest(), [argument]);
      assert.notEqual(refused.code, 0, argument);
      assert.equal(safeJson(refused.stderr)?.error?.code, 'B030-SHADOW-PROFILE');
      assert.equal([refused.stdout, refused.stderr].join('\n').includes(sentinel), false);
      assert.equal([refused.stdout, refused.stderr].join('\n').includes(server.baseUrl), false);
    }
    assert.equal(observedBodies.length, requestsBeforeUnsafeArgs);
    assert.deepEqual(snapshotAuthority(), before);

    const authorSource = readFileSync(join(ROOT, 'scripts', 'brief-author.mjs'), 'utf8');
    assert.match(authorSource, /spawn\(settings\.command, settings\.args, \{ shell: false/);
    const productionPaths = [
      'scripts/brief-refresh.mjs',
      'scripts/brief-narrative-parallel.mjs',
      'scripts/brief-refresh-and-push.sh',
      'scripts/brief-refresh-scheduled.sh',
      'scripts/validate-brief-payload.mjs'
    ];
    const shadowTokens = [
      'brief-route-runtime',
      'brief-openai-compatible-adapter',
      'brief-shadow-generate',
      'BRIEF_SHADOW_PROFILE',
      'BRIEF_OMLX_BASE_URL',
      'BRIEF_OLLAMA_BASE_URL',
      'BRIEF_OLLAMA_MODEL'
    ];
    const productionLeaks = [];
    for (const relativePath of productionPaths) {
      const source = readFileSync(join(ROOT, relativePath), 'utf8');
      for (const token of shadowTokens) {
        if (source.includes(token)) productionLeaks.push(`${relativePath}:${token}`);
      }
    }
    assert.deepEqual(productionLeaks, []);

    const runtimeSource = readFileSync(join(ROOT, 'scripts', 'brief-route-runtime.mjs'), 'utf8');
    const cliSource = readFileSync(SHADOW_CLI, 'utf8');
    assert.match(runtimeSource, /from '\.\/brief-author\.mjs'/);
    assert.match(cliSource, /from '\.\/brief-route-runtime\.mjs'/);
    assert.doesNotMatch(cliSource, /writeFile|appendFile|unlink|rmSync|exec\(|execSync|git\s/);
  } finally {
    await server.close();
  }
});