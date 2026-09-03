import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { invokeAuthor, validateAuthorEnvelope } from './brief-author.mjs';

const require = createRequire(import.meta.url);
const RLBRIEFROUTE = require('../rlbriefroute.js');
const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(HERE, '..', 'market-brief.config.json');
const ADAPTER_PATH = join(HERE, 'brief-openai-compatible-adapter.mjs');
const PROCESS_CONTRACT = 'openai-compatible-author-process/v1';
const REQUEST_CONTRACTS = Object.freeze([
  'tool-author-request/v1',
  'tool-author-request/v2',
  'final-author-request/v1'
]);
const SECRET_KEY = /(?:authorization|cookie|credential|api[-_]?key|password|passphrase|secret|bearer|position|cost[-_]?basis|pnl|holding|account)/i;
const TOKEN_COUNT_KEYS = Object.freeze(['maxOutputTokens', 'inputTokens', 'outputTokens', 'totalTokens']);

function failure(code, reason, field) {
  return RLBRIEFROUTE.failure(code, reason, field);
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function unsafeRequestField(value, field) {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = unsafeRequestField(value[index], `${field}.${index}`);
      if (found) return found;
    }
    return null;
  }
  for (const key of Object.keys(value)) {
    if (SECRET_KEY.test(key) || (/token/i.test(key) && TOKEN_COUNT_KEYS.indexOf(key) === -1)) return `${field}.${key}`;
    const found = unsafeRequestField(value[key], `${field}.${key}`);
    if (found) return found;
  }
  return null;
}

function validateFrozenAuthorRequest(value) {
  if (!isPlainObject(value) || REQUEST_CONTRACTS.indexOf(value.contractVersion) === -1
    || typeof value.requestFingerprint !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(value.requestFingerprint)) {
    return failure(RLBRIEFROUTE.ERRORS.VALIDATION, 'frozen-author-request-invalid', 'authorRequest');
  }
  const unsafeField = unsafeRequestField(value, 'authorRequest');
  if (unsafeField) return failure(RLBRIEFROUTE.ERRORS.VALIDATION, 'secret-shaped-request-field', unsafeField);
  return { ok: true, value };
}

export function loadShadowPolicy() {
  let config;
  try {
    config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    return failure(RLBRIEFROUTE.ERRORS.POLICY, 'config-unreadable', 'market-brief.config.json');
  }
  if (!isPlainObject(config) || !Object.prototype.hasOwnProperty.call(config, RLBRIEFROUTE.POLICY_CONTRACT)) {
    return failure(RLBRIEFROUTE.ERRORS.POLICY, 'shadow-policy-required', RLBRIEFROUTE.POLICY_CONTRACT);
  }
  return RLBRIEFROUTE.validateShadowPolicy(config[RLBRIEFROUTE.POLICY_CONTRACT]);
}

export function resolveShadowRuntimeProfile(environment) {
  const policy = loadShadowPolicy();
  if (!policy.ok) return policy;
  return RLBRIEFROUTE.resolveShadowProfile(policy.value, environment);
}

function publicProfile(profile) {
  return {
    profileId: profile.profileId,
    adapterId: profile.adapterId,
    providerId: profile.providerId,
    modelId: profile.modelId,
    routeClass: profile.routeClass,
    transportContract: profile.transportContract,
    capabilityId: profile.capabilityId
  };
}

export async function runShadowAuthor(authorRequest, options = {}) {
  const request = validateFrozenAuthorRequest(authorRequest);
  if (!request.ok) return request;
  const environment = isPlainObject(options.environment) ? options.environment : process.env;
  const resolved = options.resolvedProfile || resolveShadowRuntimeProfile(environment);
  const profileResult = resolved && resolved.profileId ? { ok: true, value: resolved } : resolved;
  if (!profileResult || !profileResult.ok) return profileResult || failure(RLBRIEFROUTE.ERRORS.ADAPTER_CONFIG, 'profile-resolution-failed', 'profile');
  const profile = profileResult.value;
  if (environment.BRIEF_SHADOW_PROFILE !== profile.profileId) {
    return failure(RLBRIEFROUTE.ERRORS.SHADOW_PROFILE, 'profile-identity-mismatch', 'BRIEF_SHADOW_PROFILE');
  }
  const invoked = await invokeAuthor(authorRequest, {
    command: process.execPath,
    args: [ADAPTER_PATH, `--profile-id=${profile.profileId}`],
    timeoutMs: profile.limits.modelListTimeoutMs + profile.limits.chatTimeoutMs,
    maxStdoutBytes: profile.limits.chatMaxResponseBytes
  });
  if (!invoked.ok) return failure(RLBRIEFROUTE.ERRORS.ROUTE_UNAVAILABLE, 'adapter-process-refused', 'adapter');
  const processResult = invoked.envelope;
  if (!isPlainObject(processResult) || processResult.contractVersion !== PROCESS_CONTRACT || typeof processResult.ok !== 'boolean') {
    return failure(RLBRIEFROUTE.ERRORS.VALIDATION, 'adapter-process-shape', 'adapter');
  }
  if (!processResult.ok) {
    if (!isPlainObject(processResult.error) || typeof processResult.error.code !== 'string') {
      return failure(RLBRIEFROUTE.ERRORS.VALIDATION, 'adapter-refusal-shape', 'adapter.error');
    }
    return { ok: false, error: processResult.error };
  }
  const expectedProfile = publicProfile(profile);
  if (JSON.stringify(processResult.profile) !== JSON.stringify({
    contractVersion: 'openai-compatible-model-qualification/v1',
    profileId: profile.profileId,
    adapterId: profile.adapterId,
    providerId: profile.providerId,
    modelId: profile.modelId
  })) {
    return failure(RLBRIEFROUTE.ERRORS.VALIDATION, 'adapter-profile-mismatch', 'adapter.profile');
  }
  const usage = RLBRIEFROUTE.validateUsageReceipt(processResult.usage);
  if (!usage.ok) return usage;
  const validated = validateAuthorEnvelope(processResult.authorResponse, authorRequest, {
    maxStdoutBytes: profile.limits.chatMaxResponseBytes
  });
  if (!validated.ok) return failure(
    RLBRIEFROUTE.ERRORS.VALIDATION,
    `author-${validated.error.reason}`,
    validated.error.field
  );
  const candidate = Object.prototype.hasOwnProperty.call(validated, 'brief') ? validated.brief : validated.final;
  return {
    ok: true,
    value: {
      contractVersion: 'brief-shadow-result/v1',
      authoritative: false,
      profile: expectedProfile,
      authorResponse: processResult.authorResponse,
      candidate,
      responseFingerprint: validated.responseFingerprint,
      usage: usage.value
    }
  };
}