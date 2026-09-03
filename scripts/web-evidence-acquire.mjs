#!/usr/bin/env node
/*
 * scripts/web-evidence-acquire.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 10 — bounded, scheduled, FAIL-CLOSED WebEvidence
 * acquisition stage (design.md "Feature 002 Extension: Web Evidence Before
 * Powerless Authorship").
 *
 * This module is the ONE production transform that turns a validated public
 * query plan into a FROZEN `WebEvidenceBundle/v1`. It sits BETWEEN a frozen
 * owner read and a networkless author (Scope 11). It:
 *
 *   - renders query terms ONLY from public registry templates + validated
 *     public owner facts, and REJECTS private values, URLs, credentials,
 *     shell/control syntax, wildcards, overlength, unknown hosts, and
 *     instruction-shaped text;
 *   - drives an INJECTED search/retrieval boundary (dependency-injected so the
 *     deterministic functional tests and the scheduled operation share the same
 *     code path — this module NEVER opens a socket itself);
 *   - validates DNS/URL/host/path BEFORE any request, obtains the origin robots
 *     policy under the same caps, and REJECTS missing/failed/ambiguous/disallow
 *     WITHOUT retrieving content;
 *   - hashes exact bounded bytes, strips markup, DETECTS hostile instructions,
 *     retains only safe plain excerpts + safe source metadata, groups
 *     independent origins CONSERVATIVELY (syndication/common-origin counts once),
 *     maps claims to excerpts + owner evidence, and DISCARDS raw page bodies;
 *   - rejects credentialed / non-HTTPS / IP-literal / redirecting / executable /
 *     unbounded / missing-metadata / stale / later-than-cutoff / disputed /
 *     instruction content WITHOUT echoing it to logs/artifacts/DOM; and
 *   - FREEZES one immutable bundle before returning.
 *
 * HARD authority boundary (statically provable — see scripts/validate-web-evidence.mjs
 * moduleAuthorityScan and tests/web-evidence.security.mjs):
 *   - ZERO network-retrieval capability of its own. The only I/O it can reach is
 *     the caller-supplied boundary object; it holds no socket, no provider key,
 *     no credential store.
 *   - ZERO repository-write / current-pointer / private-state / owner-model /
 *     provider-key capability. It produces NO ToolBrief and NO public current
 *     pointer (Scope 11).
 *   - Imports NO author or publication module. Its only import is a pure hashing
 *     primitive.
 *
 * Result convention: every entry point returns { ok: true, value } or
 * { ok: false, error: { code, detail } }. `detail` is ALWAYS a closed token,
 * NEVER echoed remote content. Rejection records carry only candidateId, an
 * allowlisted safe host, a closed reason code, and a closed detail token.
 */
import { createHash } from 'node:crypto';

/* ═══════════ closed contract + policy constants ═══════════ */

export const ACQUISITION_CONTRACT = Object.freeze({
  queryPlan: 'web-evidence-query-plan/v1',
  bundle: 'web-evidence-bundle/v1',
  policy: 'web-evidence-acquisition/v1'
});

/* the closed acquisition error codes (design.md security-and-privacy error table). */
export const ACQUISITION_ERROR_CODES = Object.freeze([
  'E012-WEB-POLICY',
  'E012-WEB-ROBOTS',
  'E012-WEB-BUDGET',
  'E012-WEB-UNSAFE',
  'E012-WEB-CORROBORATION',
  'E012-AUTHOR-BOUNDARY',
  'E012-VERSION'
]);

/* closed, content-free rejection detail tokens (never a remote value). */
export const SAFE_REJECTION_DETAILS = Object.freeze([
  'scheme-not-https', 'port-not-443', 'host-not-allowlisted', 'path-not-allowed',
  'redirect-not-allowed', 'ip-literal-host', 'credentialed-url', 'malformed-url',
  'later-than-cutoff', 'stale-out-of-window', 'robots-missing', 'robots-failed',
  'robots-ambiguous', 'robots-disallow', 'response-bytes-over-cap',
  'request-timeout', 'executable-media', 'executable-markup',
  'instruction-shaped-content', 'no-safe-excerpt', 'missing-metadata',
  'candidate-cardinality-over-cap'
]);

export const CLAIM_MATERIALITY = Object.freeze(['material', 'contextual']);
export const CLAIM_KINDS = Object.freeze(['market-state', 'general-material', 'contextual']);
export const CORROBORATION_STATES = Object.freeze(['corroborated', 'uncorroborated', 'conflicted']);
export const FRESHNESS_STATES = Object.freeze(['current', 'stale', 'later-than-cutoff']);
export const ACCEPTED_MEDIA_TYPES = Object.freeze(['text/html', 'text/plain']);

const MIN_INDEPENDENT_ORIGINS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ═══════════ canonical serialization + fingerprint (Node crypto, pure) ═══════════ */

function canonicalize(value) {
  const active = [];
  function encode(current) {
    if (current === null) return 'null';
    if (typeof current === 'string' || typeof current === 'boolean') return JSON.stringify(current);
    if (typeof current === 'number') {
      if (!Number.isFinite(current)) throw new Error('WEB_EVIDENCE_NONFINITE_CANONICAL_VALUE');
      return JSON.stringify(current);
    }
    if (Array.isArray(current)) {
      if (active.indexOf(current) !== -1) throw new Error('WEB_EVIDENCE_CYCLIC_CANONICAL_VALUE');
      active.push(current);
      const items = current.map(encode);
      active.pop();
      return '[' + items.join(',') + ']';
    }
    if (isPlainObject(current)) {
      if (active.indexOf(current) !== -1) throw new Error('WEB_EVIDENCE_CYCLIC_CANONICAL_VALUE');
      active.push(current);
      const fields = Object.keys(current).sort().map((key) => {
        if (typeof current[key] === 'undefined') throw new Error('WEB_EVIDENCE_UNDEFINED_CANONICAL_VALUE');
        return JSON.stringify(key) + ':' + encode(current[key]);
      });
      active.pop();
      return '{' + fields.join(',') + '}';
    }
    throw new Error('WEB_EVIDENCE_UNSUPPORTED_CANONICAL_VALUE');
  }
  return encode(value);
}

export function fingerprint(value) {
  return 'sha256:' + createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

function contentHash(bytesText) {
  return 'sha256:' + createHash('sha256').update(bytesText, 'utf8').digest('hex');
}

/* ═══════════ structural helpers ═══════════ */

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function utf8Bytes(text) {
  return Buffer.byteLength(String(text), 'utf8');
}

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function isIso(value) {
  return typeof value === 'string' && ISO_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

function fail(code, detail) {
  if (!ACQUISITION_ERROR_CODES.includes(code)) throw new Error('WEB_EVIDENCE_UNKNOWN_ERROR_CODE:' + code);
  return { ok: false, error: Object.freeze({ code, detail }) };
}

function ok(value) {
  return { ok: true, value };
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach((key) => deepFreeze(value[key]));
  return Object.freeze(value);
}

/* ═══════════ hostile-content + unsafe-shape detection ═══════════ */

/* instruction-shaped / injection patterns applied to query terms AND, after a
   full markup strip, to candidate excerpt text. Matching text is NEVER stored. */
const INSTRUCTION_PATTERNS = [
  /ignore\s+(the\s+)?(all\s+)?(above|previous|prior|earlier)\s+(instruction|instructions|prompt|context|message)/i,
  /disregard\s+(the\s+)?(above|previous|prior|earlier|all)/i,
  /\b(system|assistant|developer)\s*:/i,
  /you\s+are\s+(now\s+)?(an?\s+|the\s+)?/i,
  /\bact\s+as\b/i,
  /\bpretend\s+(to\s+be|you)/i,
  /\b(jailbreak|prompt\s*injection|prompt\s*override|override\s+(the\s+)?(instruction|prompt|system))\b/i,
  /\brespond\s+(only\s+)?(in|with)\s+(json|the\s+following)/i,
  /\b(output|return|emit)\s+the\s+(following|schema|json)\b/i,
  /\bset\s+(the\s+)?(field|status|flag|state)\b/i,
  /\b(reveal|print|send|leak|exfiltrate|disclose)\b[^.]{0,40}\b(secret|api[\s_-]*key|token|password|credential|private\s+key)\b/i,
  /\brm\s+-rf\b/i,
  /\b(curl|wget)\s+https?:/i,
  /\$\([^)]*\)/,
  /`[^`]*`/
];

function containsInstructionShape(text) {
  return INSTRUCTION_PATTERNS.some((pattern) => pattern.test(text));
}

/* executable / active markup that is never retained as evidence. */
const EXECUTABLE_MARKUP_PATTERNS = [
  /<\s*script\b/i, /<\s*style\b/i, /<\s*iframe\b/i, /<\s*form\b/i,
  /<\s*object\b/i, /<\s*embed\b/i, /\son\w+\s*=/i, /javascript\s*:/i, /\bdata\s*:/i
];

function containsExecutableMarkup(text) {
  return EXECUTABLE_MARKUP_PATTERNS.some((pattern) => pattern.test(text));
}

/* strip ALL markup, decode a minimal safe entity set, collapse whitespace. The
   stripped plain text is what hostile-instruction detection runs against and what
   a bounded excerpt is sliced from. */
function stripMarkup(raw) {
  return String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* bound a plain-text excerpt to at most maxBytes UTF-8 bytes on a codepoint edge. */
function boundExcerpt(text, maxBytes) {
  if (utf8Bytes(text) <= maxBytes) return text;
  let sliced = text;
  while (sliced.length > 0 && utf8Bytes(sliced) > maxBytes) {
    sliced = sliced.slice(0, -1);
  }
  return sliced;
}

/* ═══════════ URL / transport classification (before any request) ═══════════ */

const IPV4_LITERAL = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/* classify a candidate URL against the lane transport policy + the query record
   host/path allowlist. Returns { ok:true, host, canonicalUrl } or a closed
   rejection detail. NO network access — pure string/URL analysis. */
function classifyUrl(rawUrl, queryRecord) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, detail: 'malformed-url' };
  }
  if (parsed.username || parsed.password) return { ok: false, detail: 'credentialed-url' };
  if (parsed.protocol !== 'https:') return { ok: false, detail: 'scheme-not-https' };
  const host = parsed.hostname.toLowerCase();
  if (IPV4_LITERAL.test(host) || host.startsWith('[')) return { ok: false, detail: 'ip-literal-host' };
  const port = parsed.port === '' ? '443' : parsed.port;
  if (port !== '443') return { ok: false, detail: 'port-not-443' };
  const allowedHost = queryRecord.allowedHosts.find((entry) => entry.host === host);
  if (!allowedHost) return { ok: false, detail: 'host-not-allowlisted' };
  const decodedPath = safeDecodePath(parsed.pathname);
  if (decodedPath === null) return { ok: false, detail: 'path-not-allowed' };
  if (!decodedPath.startsWith(allowedHost.pathPrefix)) return { ok: false, detail: 'path-not-allowed' };
  const canonicalUrl = 'https://' + host + parsed.pathname + parsed.search;
  return { ok: true, host, canonicalUrl, allowedHost };
}

/* reject encoded path traversal and undecodable paths outright. */
function safeDecodePath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('..') || decoded.includes('\\') || /%2e/i.test(pathname)) return null;
  return decoded;
}

/* ═══════════ robots policy ═══════════ */

/* parse the retrieved robots body for the configured user agent. Returns a
   closed decision: 'allow' | 'disallow' | 'ambiguous'. A path allowed by the
   most-specific rule set wins; conflicting equal-length allow/disallow is
   ambiguous (fail-closed). */
function evaluateRobots(robotsBody, userAgent, path) {
  if (typeof robotsBody !== 'string' || robotsBody.length === 0) return 'ambiguous';
  const lines = robotsBody.split(/\r?\n/).map((line) => line.replace(/#.*$/, '').trim());
  const groups = [];
  let current = null;
  for (const line of lines) {
    const match = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const raw = match[2].trim();
    if (field === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(raw.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && current) {
      current.rules.push({ type: field, path: raw });
    }
  }
  const uaLower = userAgent.toLowerCase();
  const uaToken = uaLower.split('/')[0];
  let applicable = groups.find((group) => group.agents.some((agent) => uaLower.startsWith(agent) || agent === uaToken));
  if (!applicable) applicable = groups.find((group) => group.agents.includes('*'));
  if (!applicable) return 'allow';
  let bestAllow = -1;
  let bestDisallow = -1;
  for (const rule of applicable.rules) {
    if (rule.path === '') continue;
    if (path.startsWith(rule.path)) {
      if (rule.type === 'allow') bestAllow = Math.max(bestAllow, rule.path.length);
      else bestDisallow = Math.max(bestDisallow, rule.path.length);
    }
  }
  if (bestDisallow === -1 && bestAllow === -1) return 'allow';
  if (bestDisallow > bestAllow) return 'disallow';
  if (bestAllow > bestDisallow) return 'allow';
  return 'ambiguous';
}

/* ═══════════ freshness / temporal integrity ═══════════ */

function computeFreshnessState(publishedAtMs, cutoffMs, freshnessWindowDays) {
  if (publishedAtMs > cutoffMs) return 'later-than-cutoff';
  if (publishedAtMs < cutoffMs - freshnessWindowDays * DAY_MS) return 'stale';
  return 'current';
}

/* ═══════════ independent-origin grouping (conservative) ═══════════ */

/* Two retained sources belong to the same independent origin group when they
   share a declared canonical origin ref, an identical content hash (byte-for-byte
   reprint), or the same publisher wire. Syndication/common-origin counts once. */
function deriveOriginGroup(source, groupIndex) {
  if (isNonEmptyString(source.canonicalOriginRef)) return 'origin:' + source.canonicalOriginRef;
  if (isNonEmptyString(source.contentSha256) && groupIndex.byHash.has(source.contentSha256)) {
    return groupIndex.byHash.get(source.contentSha256);
  }
  if (source.sourceClass === 'wire' && isNonEmptyString(source.publisher)) {
    return 'wire:' + source.publisher.toLowerCase();
  }
  return 'source:' + source.sourceId;
}

/* ═══════════ policy resolution ═══════════ */

/* extract + validate a lane policy from an ALREADY-PARSED config object. This
   module performs NO file access; the caller parses market-brief.config.json and
   passes the object in (keeps the authority surface empty). */
export function resolveLanePolicy(config, lane) {
  if (!isPlainObject(config)) return fail('E012-VERSION', 'config-not-object');
  const root = config[ACQUISITION_CONTRACT.policy];
  if (!isPlainObject(root)) return fail('E012-VERSION', 'policy-block-missing');
  if (!isPlainObject(root.lanes) || !isPlainObject(root.lanes[lane])) return fail('E012-WEB-POLICY', 'lane-missing');
  const laneCfg = root.lanes[lane];
  const numericFields = [
    'maxQueries', 'maxCandidateUrls', 'maxRetainedOrigins', 'maxRetainedExcerpts',
    'maxExcerptBytes', 'maxResponseBytesPerUrl', 'maxBundleBytes',
    'perRequestTimeoutMs', 'totalAcquisitionMs', 'maxConcurrentFetches'
  ];
  for (const field of numericFields) {
    if (!Number.isInteger(laneCfg[field]) || laneCfg[field] <= 0) return fail('E012-WEB-POLICY', 'lane-budget-invalid');
  }
  if (laneCfg.redirects !== 'none') return fail('E012-WEB-POLICY', 'redirect-policy-invalid');
  if (laneCfg.scheme !== 'https') return fail('E012-WEB-POLICY', 'scheme-policy-invalid');
  if (laneCfg.port !== 443) return fail('E012-WEB-POLICY', 'port-policy-invalid');
  if (root.userAgent !== 'ResearchLabEvidenceBot/1.0') return fail('E012-WEB-POLICY', 'user-agent-invalid');
  if (!Number.isInteger(root.maxQueryChars) || root.maxQueryChars <= 0) return fail('E012-WEB-POLICY', 'query-char-cap-invalid');
  const acceptedMedia = Array.isArray(root.acceptedMediaTypes) ? root.acceptedMediaTypes : [];
  if (acceptedMedia.length === 0) return fail('E012-WEB-POLICY', 'accepted-media-missing');
  const policy = Object.freeze({
    contractVersion: ACQUISITION_CONTRACT.policy,
    lane,
    policyId: isNonEmptyString(root.policyId) ? root.policyId : (ACQUISITION_CONTRACT.policy + ':' + lane),
    userAgent: root.userAgent,
    maxQueryChars: root.maxQueryChars,
    acceptedMediaTypes: Object.freeze([...acceptedMedia]),
    ...Object.fromEntries(numericFields.map((field) => [field, laneCfg[field]])),
    redirects: 'none',
    scheme: 'https',
    port: 443
  });
  return ok(policy);
}

/* ═══════════ query-plan rendering + validation ═══════════ */

const URL_IN_TERMS = /\bhttps?:\/\//i;
const HOSTY_TERMS = /\b(?:www\.|ftp:\/\/|file:\/\/)/i;
const CREDENTIALISH_TERMS = /(?:password|passwd|token|api[\s_-]*key|secret|bearer)\s*[=:]/i;
const SHELL_CONTROL_TERMS = /[;&|`<>\n\r]|\$\(|\|\||&&/;
const PRIVATE_FIELD_ROOTS = Object.freeze([
  'holding', 'quantity', 'sharecount', 'shares', 'costbasis', 'avgcost', 'avgprice',
  'lotsize', 'pnl', 'pandl', 'profitloss', 'mandate', 'exposure', 'personalexposure',
  'position', 'accountid', 'brokerage'
]);

function factLooksPrivate(key, value) {
  const lowerKey = String(key).toLowerCase();
  if (PRIVATE_FIELD_ROOTS.some((root) => lowerKey.includes(root))) return true;
  if (typeof value !== 'string' && typeof value !== 'number') return true;
  const lowerValue = String(value).toLowerCase();
  if (PRIVATE_FIELD_ROOTS.some((root) => lowerValue.includes(root + ':') || lowerValue.includes(root + '='))) return true;
  return false;
}

/* render one query record's terms from a template + public facts, then validate
   the rendered string against every closed policy. */
function renderTerms(template, facts, maxQueryChars) {
  const rendered = template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match, key) => {
    if (!(key in facts)) throw new Error('WEB_EVIDENCE_UNRENDERED_FACT');
    return String(facts[key]);
  });
  if (/\{\{|\}\}/.test(rendered)) return { ok: false, detail: 'unrendered-placeholder' };
  if (utf8Bytes(rendered) > maxQueryChars) return { ok: false, detail: 'terms-overlength' };
  if (URL_IN_TERMS.test(rendered) || HOSTY_TERMS.test(rendered)) return { ok: false, detail: 'terms-contain-url' };
  if (CREDENTIALISH_TERMS.test(rendered)) return { ok: false, detail: 'terms-contain-credential' };
  if (SHELL_CONTROL_TERMS.test(rendered)) return { ok: false, detail: 'terms-contain-control' };
  if (rendered.includes('*')) return { ok: false, detail: 'terms-contain-wildcard' };
  if (containsInstructionShape(rendered)) return { ok: false, detail: 'terms-instruction-shaped' };
  return { ok: true, rendered };
}

/*
 * renderQueryPlan(input, lanePolicy)
 *   input: {
 *     toolId, runId, cutoffAt,
 *     templates: [{ templateId, termsTemplate, purpose, allowedHosts:[{host,pathPrefix}],
 *                   requiredSourceClasses:[...], freshnessWindowDays, maxResults }],
 *     facts: { <key>: <public scalar> }
 *   }
 * Returns a frozen WebEvidenceQueryPlan/v1 or a closed rejection.
 */
export function renderQueryPlan(input, lanePolicy) {
  if (!isPlainObject(input)) return fail('E012-WEB-POLICY', 'plan-input-not-object');
  if (!isNonEmptyString(input.toolId) || !isNonEmptyString(input.runId)) return fail('E012-WEB-POLICY', 'plan-identity-missing');
  if (!isIso(input.cutoffAt)) return fail('E012-WEB-POLICY', 'plan-cutoff-invalid');
  if (!Array.isArray(input.templates) || input.templates.length === 0) return fail('E012-WEB-POLICY', 'plan-templates-missing');
  if (input.templates.length > lanePolicy.maxQueries) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
  const facts = isPlainObject(input.facts) ? input.facts : {};
  for (const [key, value] of Object.entries(facts)) {
    if (factLooksPrivate(key, value)) return fail('E012-WEB-POLICY', 'fact-private');
  }
  const queries = [];
  for (let index = 0; index < input.templates.length; index += 1) {
    const template = input.templates[index];
    if (!isPlainObject(template) || !isNonEmptyString(template.templateId) || !isNonEmptyString(template.termsTemplate)) {
      return fail('E012-WEB-POLICY', 'template-shape-invalid');
    }
    if (!Array.isArray(template.allowedHosts) || template.allowedHosts.length === 0) return fail('E012-WEB-POLICY', 'template-hosts-missing');
    const allowedHosts = [];
    for (const entry of template.allowedHosts) {
      if (!isPlainObject(entry) || !isNonEmptyString(entry.host) || !isNonEmptyString(entry.pathPrefix)) return fail('E012-WEB-POLICY', 'template-host-shape-invalid');
      if (!entry.pathPrefix.startsWith('/')) return fail('E012-WEB-POLICY', 'template-path-prefix-invalid');
      allowedHosts.push(Object.freeze({ host: entry.host.toLowerCase(), pathPrefix: entry.pathPrefix }));
    }
    if (!Array.isArray(template.requiredSourceClasses) || template.requiredSourceClasses.length === 0) return fail('E012-WEB-POLICY', 'template-source-class-missing');
    if (!Number.isInteger(template.freshnessWindowDays) || template.freshnessWindowDays <= 0) return fail('E012-WEB-POLICY', 'template-freshness-invalid');
    if (!Number.isInteger(template.maxResults) || template.maxResults <= 0 || template.maxResults > lanePolicy.maxCandidateUrls) return fail('E012-WEB-POLICY', 'template-max-results-invalid');
    let renderResult;
    try {
      renderResult = renderTerms(template.termsTemplate, facts, lanePolicy.maxQueryChars);
    } catch {
      return fail('E012-WEB-POLICY', 'terms-unrendered-fact');
    }
    if (!renderResult.ok) return fail('E012-WEB-POLICY', renderResult.detail);
    queries.push({
      queryId: input.runId + ':q' + index,
      templateId: template.templateId,
      terms: renderResult.rendered,
      purpose: isNonEmptyString(template.purpose) ? template.purpose : 'evidence',
      allowedHosts,
      requiredSourceClasses: Object.freeze([...template.requiredSourceClasses]),
      freshnessWindowDays: template.freshnessWindowDays,
      maxResults: template.maxResults
    });
  }
  const totalMaxResults = queries.reduce((sum, query) => sum + query.maxResults, 0);
  if (totalMaxResults > lanePolicy.maxCandidateUrls) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
  const planWithoutFingerprint = {
    contractVersion: ACQUISITION_CONTRACT.queryPlan,
    toolId: input.toolId,
    runId: input.runId,
    cutoffAt: input.cutoffAt,
    lane: lanePolicy.lane,
    searchPolicyId: lanePolicy.policyId,
    queries: queries.map((query) => ({ ...query, allowedHosts: query.allowedHosts.map((host) => ({ ...host })), requiredSourceClasses: [...query.requiredSourceClasses] }))
  };
  const plan = { ...planWithoutFingerprint, planFingerprint: fingerprint(planWithoutFingerprint) };
  return ok(deepFreeze(plan));
}

export function validateQueryPlan(plan, lanePolicy) {
  if (!isPlainObject(plan)) return fail('E012-WEB-POLICY', 'plan-not-object');
  if (plan.contractVersion !== ACQUISITION_CONTRACT.queryPlan) return fail('E012-VERSION', 'plan-version-unsupported');
  if (!isNonEmptyString(plan.toolId) || !isNonEmptyString(plan.runId) || !isIso(plan.cutoffAt)) return fail('E012-WEB-POLICY', 'plan-identity-invalid');
  if (plan.lane !== lanePolicy.lane) return fail('E012-WEB-POLICY', 'plan-lane-mismatch');
  if (!Array.isArray(plan.queries) || plan.queries.length === 0) return fail('E012-WEB-POLICY', 'plan-queries-missing');
  if (plan.queries.length > lanePolicy.maxQueries) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
  for (const query of plan.queries) {
    if (utf8Bytes(query.terms) > lanePolicy.maxQueryChars) return fail('E012-WEB-BUDGET', 'terms-overlength');
    if (containsInstructionShape(query.terms) || URL_IN_TERMS.test(query.terms)) return fail('E012-WEB-UNSAFE', 'instruction-shaped-content');
  }
  const { planFingerprint, ...planBody } = plan;
  if (planFingerprint !== fingerprint(planBody)) return fail('E012-WEB-POLICY', 'plan-fingerprint-mismatch');
  return ok({ queryCount: plan.queries.length });
}

/* ═══════════ the bounded acquisition stage ═══════════ */

/*
 * acquire(input) -> Promise<{ ok:true, value: frozenBundle } | { ok:false, error }>
 *   input: {
 *     queryPlan,            // WebEvidenceQueryPlan/v1
 *     policy,               // resolved lane policy
 *     claimSpecs: [{ claimId, materiality, claimKind, normalizedClaim }],
 *     ownerEvidence: { <ownerEvidenceId>: { state, asOf } },
 *     boundary,             // INJECTED: { search(queryRecord), retrieve(url, opts) }
 *     acquisitionStartedAt, // ISO (stable fingerprint anchor)
 *     frozenAt              // ISO (defaults to acquisitionStartedAt)
 *   }
 *
 * The boundary is the ONLY I/O surface. `search(queryRecord)` returns candidate
 * descriptors; `retrieve(url, {maxBytes, timeoutMs, userAgent})` returns
 * { status, finalUrl, contentType, body, durationMs, meta } or { error }.
 * A robots URL is retrieved through the SAME boundary before any content URL.
 */
export async function acquire(input) {
  if (!isPlainObject(input)) return fail('E012-WEB-POLICY', 'acquire-input-not-object');
  const { queryPlan, policy, boundary } = input;
  if (!isPlainObject(policy) || policy.contractVersion !== ACQUISITION_CONTRACT.policy) return fail('E012-VERSION', 'policy-invalid');
  const planValidation = validateQueryPlan(queryPlan, policy);
  if (!planValidation.ok) return planValidation;
  if (!isPlainObject(boundary) || typeof boundary.search !== 'function' || typeof boundary.retrieve !== 'function') {
    return fail('E012-WEB-POLICY', 'boundary-invalid');
  }
  const claimSpecs = Array.isArray(input.claimSpecs) ? input.claimSpecs : [];
  const ownerEvidence = isPlainObject(input.ownerEvidence) ? input.ownerEvidence : {};
  const acquisitionStartedAt = isIso(input.acquisitionStartedAt) ? input.acquisitionStartedAt : queryPlan.cutoffAt;
  const frozenAt = isIso(input.frozenAt) ? input.frozenAt : acquisitionStartedAt;
  const cutoffMs = Date.parse(queryPlan.cutoffAt);

  const sources = [];
  const rejected = [];
  const robotsCache = new Map();
  const groupIndex = { byHash: new Map() };
  let cumulativeMs = 0;
  let totalSourceBytes = 0;
  let candidateCount = 0;

  const reject = (candidateId, reasonCode, safeHost, safeReasonDetail) => {
    rejected.push(Object.freeze({ candidateId, reasonCode, safeHost: safeHost || 'unknown', safeReasonDetail }));
  };

  for (const query of queryPlan.queries) {
    let candidates;
    try {
      candidates = await boundary.search(query);
    } catch {
      return fail('E012-WEB-POLICY', 'boundary-search-failed');
    }
    if (!Array.isArray(candidates)) return fail('E012-WEB-POLICY', 'boundary-search-shape');
    if (candidates.length > query.maxResults) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
    for (const candidate of candidates) {
      candidateCount += 1;
      if (candidateCount > policy.maxCandidateUrls) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
      const candidateId = isNonEmptyString(candidate && candidate.candidateId) ? candidate.candidateId : query.queryId + ':c' + candidateCount;

      /* (1) URL / transport policy BEFORE any request. */
      const classified = classifyUrl(candidate && candidate.url, query);
      if (!classified.ok) {
        const policyDetails = new Set(['scheme-not-https', 'port-not-443', 'host-not-allowlisted', 'path-not-allowed', 'malformed-url']);
        const code = policyDetails.has(classified.detail) ? 'E012-WEB-POLICY' : 'E012-WEB-UNSAFE';
        reject(candidateId, code, safeHostFrom(candidate && candidate.url), classified.detail);
        continue;
      }
      const host = classified.host;

      /* (2) robots policy under the same caps BEFORE content retrieval. */
      const robotsDecision = await resolveRobots(host, classified.canonicalUrl, boundary, policy, robotsCache);
      cumulativeMs += robotsDecision.durationMs;
      if (robotsDecision.decision !== 'allow') {
        reject(candidateId, 'E012-WEB-ROBOTS', host, robotsDecision.detail);
        continue;
      }
      if (cumulativeMs > policy.totalAcquisitionMs) return fail('E012-WEB-BUDGET', 'request-timeout');

      /* (3) retrieve content through the injected boundary; NO redirects. */
      let response;
      try {
        response = await boundary.retrieve(classified.canonicalUrl, {
          maxBytes: policy.maxResponseBytesPerUrl,
          timeoutMs: policy.perRequestTimeoutMs,
          userAgent: policy.userAgent
        });
      } catch {
        reject(candidateId, 'E012-WEB-BUDGET', host, 'request-timeout');
        continue;
      }
      if (!isPlainObject(response) || response.error) {
        reject(candidateId, 'E012-WEB-BUDGET', host, 'request-timeout');
        continue;
      }
      const durationMs = Number.isFinite(response.durationMs) ? response.durationMs : 0;
      cumulativeMs += durationMs;
      if (durationMs > policy.perRequestTimeoutMs) {
        reject(candidateId, 'E012-WEB-BUDGET', host, 'request-timeout');
        continue;
      }
      if (cumulativeMs > policy.totalAcquisitionMs) return fail('E012-WEB-BUDGET', 'request-timeout');
      if (response.finalUrl && normalizeUrl(response.finalUrl) !== normalizeUrl(classified.canonicalUrl)) {
        reject(candidateId, 'E012-WEB-POLICY', host, 'redirect-not-allowed');
        continue;
      }
      const contentType = String(response.contentType || '').split(';')[0].trim().toLowerCase();
      if (!policy.acceptedMediaTypes.includes(contentType)) {
        reject(candidateId, 'E012-WEB-UNSAFE', host, 'executable-media');
        continue;
      }
      const body = typeof response.body === 'string' ? response.body : '';
      const bodyBytes = utf8Bytes(body);
      if (bodyBytes > policy.maxResponseBytesPerUrl) {
        reject(candidateId, 'E012-WEB-BUDGET', host, 'response-bytes-over-cap');
        continue;
      }

      /* (4) safe-source construction: hash exact bytes, reject executable markup,
             strip + bound + hostile-detect excerpts, then DISCARD the raw body. */
      const meta = isPlainObject(response.meta) ? response.meta : {};
      const metadataDetail = missingMetadata(meta);
      if (metadataDetail) {
        reject(candidateId, 'E012-WEB-POLICY', host, 'missing-metadata');
        continue;
      }
      const publishedAtMs = Date.parse(meta.publishedAt);
      const freshnessState = computeFreshnessState(publishedAtMs, cutoffMs, query.freshnessWindowDays);
      if (freshnessState === 'later-than-cutoff') {
        reject(candidateId, 'E012-WEB-POLICY', host, 'later-than-cutoff');
        continue;
      }
      if (containsExecutableMarkup(body)) {
        reject(candidateId, 'E012-WEB-UNSAFE', host, 'executable-markup');
        continue;
      }
      const hash = contentHash(body);
      const rawExcerpts = Array.isArray(meta.excerpts) ? meta.excerpts : [];
      const excerpts = [];
      let hostileSeen = false;
      for (let ei = 0; ei < rawExcerpts.length; ei += 1) {
        const stripped = stripMarkup(rawExcerpts[ei]);
        if (stripped.length === 0) continue;
        if (containsInstructionShape(stripped) || containsExecutableMarkup(rawExcerpts[ei])) {
          hostileSeen = true;
          continue; /* hostile excerpt is DISCARDED, never stored or echoed. */
        }
        const bounded = boundExcerpt(stripped, policy.maxExcerptBytes);
        excerpts.push(Object.freeze({
          excerptId: candidateId + ':e' + excerpts.length,
          text: bounded,
          byteLength: utf8Bytes(bounded),
          contentOffsetRef: 'offset:' + ei
        }));
      }
      if (excerpts.length === 0) {
        reject(candidateId, 'E012-WEB-UNSAFE', host, hostileSeen ? 'instruction-shaped-content' : 'no-safe-excerpt');
        continue;
      }
      if (sources.length + 1 > policy.maxRetainedExcerpts) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
      totalSourceBytes += bodyBytes;

      const source = {
        sourceId: candidateId,
        canonicalUrl: classified.canonicalUrl,
        title: meta.title,
        publisher: meta.publisher,
        publishedAt: meta.publishedAt,
        fetchedAt: acquisitionStartedAt,
        sourceClass: meta.sourceClass,
        mediaType: contentType,
        contentSha256: hash,
        robotsPolicyRef: 'robots:' + host,
        canonicalOriginRef: isNonEmptyString(meta.canonicalOriginRef) ? meta.canonicalOriginRef : null,
        freshnessState,
        supportsClaims: Array.isArray(meta.supportsClaims) ? meta.supportsClaims.filter(isNonEmptyString) : [],
        directionTag: isNonEmptyString(meta.directionTag) ? meta.directionTag : null,
        excerpts
      };
      source.independentOriginGroup = deriveOriginGroup(source, groupIndex);
      if (isNonEmptyString(source.contentSha256) && !groupIndex.byHash.has(source.contentSha256)) {
        groupIndex.byHash.set(source.contentSha256, source.independentOriginGroup);
      }
      sources.push(source);
    }
  }

  /* origin-count cap. */
  const originGroups = new Set(sources.map((source) => source.independentOriginGroup));
  if (originGroups.size > policy.maxRetainedOrigins) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');

  /* (5) claim mapping + conservative corroboration. */
  const claims = buildClaims(claimSpecs, sources, ownerEvidence);

  /* (6) assemble + FREEZE the immutable bundle. */
  const coverage = {
    queryCount: queryPlan.queries.length,
    candidateCount,
    retainedSourceCount: sources.length,
    independentOriginCount: originGroups.size,
    rejectedCandidateCount: rejected.length,
    materialClaimCount: claims.filter((claim) => claim.materiality === 'material').length,
    corroboratedMaterialClaimCount: claims.filter((claim) => claim.materiality === 'material' && claim.corroborationState === 'corroborated').length,
    rejectedMaterialClaimCount: claims.filter((claim) => claim.materiality === 'material' && claim.corroborationState !== 'corroborated').length
  };
  const byteInventory = {
    totalSourceBytes,
    totalExcerptBytes: sources.reduce((sum, source) => sum + source.excerpts.reduce((inner, excerpt) => inner + excerpt.byteLength, 0), 0),
    rejectedCount: rejected.length
  };
  const bundleWithoutFingerprint = {
    contractVersion: ACQUISITION_CONTRACT.bundle,
    bundleId: queryPlan.runId + ':bundle',
    toolId: queryPlan.toolId,
    runId: queryPlan.runId,
    cutoffAt: queryPlan.cutoffAt,
    queryPlanRef: queryPlan.planFingerprint,
    policyId: policy.policyId,
    acquisitionStartedAt,
    frozenAt,
    sources: sources.map(serializeSource),
    claims,
    rejected: rejected.map((entry) => ({ ...entry })),
    coverage,
    byteInventory
  };
  const bundleBytes = utf8Bytes(canonicalize(bundleWithoutFingerprint));
  if (bundleBytes > policy.maxBundleBytes) return fail('E012-WEB-BUDGET', 'response-bytes-over-cap');
  bundleWithoutFingerprint.byteInventory = { ...byteInventory, bundleBytes };
  const bundle = {
    ...bundleWithoutFingerprint,
    bundleFingerprint: fingerprint(bundleWithoutFingerprint)
  };
  return ok(deepFreeze(bundle));
}

function serializeSource(source) {
  return {
    sourceId: source.sourceId,
    canonicalUrl: source.canonicalUrl,
    title: source.title,
    publisher: source.publisher,
    publishedAt: source.publishedAt,
    fetchedAt: source.fetchedAt,
    sourceClass: source.sourceClass,
    mediaType: source.mediaType,
    contentSha256: source.contentSha256,
    robotsPolicyRef: source.robotsPolicyRef,
    independentOriginGroup: source.independentOriginGroup,
    canonicalOriginRef: source.canonicalOriginRef,
    freshnessState: source.freshnessState,
    excerpts: source.excerpts.map((excerpt) => ({ ...excerpt }))
  };
}

function missingMetadata(meta) {
  if (!isNonEmptyString(meta.title)) return 'title';
  if (!isNonEmptyString(meta.publisher)) return 'publisher';
  if (!isIso(meta.publishedAt)) return 'publishedAt';
  if (!isNonEmptyString(meta.sourceClass)) return 'sourceClass';
  return null;
}

function buildClaims(claimSpecs, sources, ownerEvidence) {
  const claims = [];
  for (const spec of claimSpecs) {
    if (!isPlainObject(spec) || !isNonEmptyString(spec.claimId)) continue;
    const materiality = CLAIM_MATERIALITY.includes(spec.materiality) ? spec.materiality : 'contextual';
    const claimKind = CLAIM_KINDS.includes(spec.claimKind) ? spec.claimKind : 'contextual';
    const supporting = sources.filter((source) => source.supportsClaims.includes(spec.claimId));
    const currentSupporting = supporting.filter((source) => source.freshnessState === 'current');
    const groups = new Set(currentSupporting.map((source) => source.independentOriginGroup));
    const sourceExcerptRefs = [];
    for (const source of supporting) {
      for (const excerpt of source.excerpts) sourceExcerptRefs.push(excerpt.excerptId);
    }
    const directions = new Set(currentSupporting.map((source) => source.directionTag).filter(isNonEmptyString));
    const conflicted = directions.size > 1;
    const ownerEvidenceRefs = Array.isArray(spec.ownerEvidenceRefs)
      ? spec.ownerEvidenceRefs.filter((ref) => isNonEmptyString(ref) && ref in ownerEvidence)
      : [];
    let corroborationState;
    if (conflicted) {
      corroborationState = 'conflicted';
    } else if (materiality !== 'material') {
      corroborationState = groups.size >= 1 ? 'corroborated' : 'uncorroborated';
    } else if (groups.size < MIN_INDEPENDENT_ORIGINS) {
      corroborationState = 'uncorroborated';
    } else if (claimKind === 'market-state' && ownerEvidenceRefs.length === 0) {
      corroborationState = 'uncorroborated';
    } else {
      corroborationState = 'corroborated';
    }
    const authorable = materiality !== 'material' ? corroborationState !== 'conflicted' : corroborationState === 'corroborated';
    claims.push(Object.freeze({
      claimId: spec.claimId,
      materiality,
      claimKind,
      normalizedClaim: isNonEmptyString(spec.normalizedClaim) ? spec.normalizedClaim : spec.claimId,
      sourceExcerptRefs: Object.freeze(sourceExcerptRefs),
      independentOriginGroups: Object.freeze([...groups].sort()),
      ownerEvidenceRefs: Object.freeze(ownerEvidenceRefs),
      corroborationState,
      conflictState: conflicted ? 'conflicted' : 'consistent',
      freshnessState: currentSupporting.length > 0 ? 'current' : (supporting.length > 0 ? 'stale' : 'unsupported'),
      authorable
    }));
  }
  return claims;
}

/* ═══════════ robots retrieval helper ═══════════ */

async function resolveRobots(host, canonicalUrl, boundary, policy, robotsCache) {
  if (robotsCache.has(host)) {
    const cached = robotsCache.get(host);
    return { ...cached, durationMs: 0, decision: decideRobots(cached, canonicalUrl, policy) };
  }
  const robotsUrl = 'https://' + host + '/robots.txt';
  let response;
  try {
    response = await boundary.retrieve(robotsUrl, {
      maxBytes: policy.maxResponseBytesPerUrl,
      timeoutMs: policy.perRequestTimeoutMs,
      userAgent: policy.userAgent
    });
  } catch {
    const failed = { failed: true };
    robotsCache.set(host, failed);
    return { decision: 'disallow', detail: 'robots-failed', durationMs: 0 };
  }
  const durationMs = isPlainObject(response) && Number.isFinite(response.durationMs) ? response.durationMs : 0;
  if (!isPlainObject(response) || response.error) {
    robotsCache.set(host, { failed: true });
    return { decision: 'disallow', detail: 'robots-failed', durationMs };
  }
  if (Number.isInteger(response.status) && response.status >= 400) {
    robotsCache.set(host, { missing: true });
    return { decision: 'disallow', detail: 'robots-missing', durationMs };
  }
  const bodyBytes = utf8Bytes(String(response.body || ''));
  if (bodyBytes > policy.maxResponseBytesPerUrl) {
    robotsCache.set(host, { failed: true });
    return { decision: 'disallow', detail: 'robots-failed', durationMs };
  }
  const cached = { body: String(response.body || '') };
  robotsCache.set(host, cached);
  return { decision: decideRobots(cached, canonicalUrl, policy), durationMs, detail: robotsDetailFor(cached, canonicalUrl, policy) };
}

function decideRobots(cached, canonicalUrl, policy) {
  if (cached.failed) return 'disallow';
  if (cached.missing) return 'disallow';
  const path = pathOf(canonicalUrl);
  const decision = evaluateRobots(cached.body, policy.userAgent, path);
  return decision === 'allow' ? 'allow' : 'disallow';
}

function robotsDetailFor(cached, canonicalUrl, policy) {
  if (cached.failed) return 'robots-failed';
  if (cached.missing) return 'robots-missing';
  const path = pathOf(canonicalUrl);
  const decision = evaluateRobots(cached.body, policy.userAgent, path);
  if (decision === 'ambiguous') return 'robots-ambiguous';
  if (decision === 'disallow') return 'robots-disallow';
  return null;
}

function pathOf(canonicalUrl) {
  try {
    return new URL(canonicalUrl).pathname;
  } catch {
    return '/';
  }
}

function normalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return 'https://' + parsed.hostname.toLowerCase() + parsed.pathname + parsed.search;
  } catch {
    return String(rawUrl);
  }
}

function safeHostFrom(rawUrl) {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
}

/* ═══════════ bundle validation (closed) ═══════════ */

/* re-validate a frozen bundle against the closed contract + budgets, and prove
   its declared fingerprint matches its content. Never trusts a caller-supplied
   fingerprint. */
export function validateBundle(bundle, policy) {
  if (!isPlainObject(bundle)) return fail('E012-WEB-POLICY', 'bundle-not-object');
  if (bundle.contractVersion !== ACQUISITION_CONTRACT.bundle) return fail('E012-VERSION', 'bundle-version-unsupported');
  for (const field of ['bundleId', 'toolId', 'runId', 'policyId', 'queryPlanRef']) {
    if (!isNonEmptyString(bundle[field])) return fail('E012-WEB-POLICY', 'bundle-identity-invalid');
  }
  if (!isIso(bundle.cutoffAt) || !isIso(bundle.acquisitionStartedAt) || !isIso(bundle.frozenAt)) return fail('E012-WEB-POLICY', 'bundle-time-invalid');
  if (!Array.isArray(bundle.sources) || !Array.isArray(bundle.claims) || !Array.isArray(bundle.rejected)) return fail('E012-WEB-POLICY', 'bundle-collections-invalid');
  const originGroups = new Set();
  for (const source of bundle.sources) {
    const sourceCheck = validateSource(source, policy);
    if (!sourceCheck.ok) return sourceCheck;
    originGroups.add(source.independentOriginGroup);
  }
  if (policy && originGroups.size > policy.maxRetainedOrigins) return fail('E012-WEB-BUDGET', 'candidate-cardinality-over-cap');
  for (const claim of bundle.claims) {
    const claimCheck = validateClaim(claim);
    if (!claimCheck.ok) return claimCheck;
  }
  for (const rejection of bundle.rejected) {
    if (!isPlainObject(rejection) || !ACQUISITION_ERROR_CODES.includes(rejection.reasonCode) || !SAFE_REJECTION_DETAILS.includes(rejection.safeReasonDetail)) {
      return fail('E012-WEB-POLICY', 'rejection-shape-invalid');
    }
    if (containsExecutableMarkup(JSON.stringify(rejection)) || containsInstructionShape(JSON.stringify(rejection))) {
      return fail('E012-WEB-UNSAFE', 'instruction-shaped-content');
    }
  }
  if (policy && Number.isFinite(bundle.byteInventory?.bundleBytes) && bundle.byteInventory.bundleBytes > policy.maxBundleBytes) {
    return fail('E012-WEB-BUDGET', 'response-bytes-over-cap');
  }
  const { bundleFingerprint, ...bundleBody } = bundle;
  if (bundleFingerprint !== fingerprint(bundleBody)) return fail('E012-WEB-POLICY', 'bundle-fingerprint-mismatch');
  return ok({
    sourceCount: bundle.sources.length,
    claimCount: bundle.claims.length,
    independentOriginCount: originGroups.size,
    frozen: Object.isFrozen(bundle)
  });
}

export function validateSource(source, policy) {
  if (!isPlainObject(source)) return fail('E012-WEB-POLICY', 'source-not-object');
  for (const field of ['sourceId', 'canonicalUrl', 'title', 'publisher', 'sourceClass', 'mediaType', 'contentSha256', 'independentOriginGroup']) {
    if (!isNonEmptyString(source[field])) return fail('E012-WEB-POLICY', 'source-metadata-invalid');
  }
  if (!isIso(source.publishedAt) || !isIso(source.fetchedAt)) return fail('E012-WEB-POLICY', 'source-time-invalid');
  if (!/^https:\/\//.test(source.canonicalUrl)) return fail('E012-WEB-POLICY', 'scheme-not-https');
  if (!ACCEPTED_MEDIA_TYPES.includes(source.mediaType)) return fail('E012-WEB-UNSAFE', 'executable-media');
  if (!FRESHNESS_STATES.includes(source.freshnessState) || source.freshnessState === 'later-than-cutoff') return fail('E012-WEB-POLICY', 'later-than-cutoff');
  if (!/^sha256:[0-9a-f]{64}$/.test(source.contentSha256)) return fail('E012-WEB-POLICY', 'source-hash-invalid');
  if (!Array.isArray(source.excerpts) || source.excerpts.length === 0) return fail('E012-WEB-UNSAFE', 'no-safe-excerpt');
  for (const excerpt of source.excerpts) {
    if (!isPlainObject(excerpt) || !isNonEmptyString(excerpt.text)) return fail('E012-WEB-POLICY', 'excerpt-invalid');
    if (policy && excerpt.byteLength > policy.maxExcerptBytes) return fail('E012-WEB-BUDGET', 'response-bytes-over-cap');
    if (containsExecutableMarkup(excerpt.text) || containsInstructionShape(excerpt.text)) return fail('E012-WEB-UNSAFE', 'instruction-shaped-content');
  }
  return ok({ excerptCount: source.excerpts.length });
}

export function validateClaim(claim) {
  if (!isPlainObject(claim)) return fail('E012-WEB-POLICY', 'claim-not-object');
  if (!isNonEmptyString(claim.claimId) || !isNonEmptyString(claim.normalizedClaim)) return fail('E012-WEB-POLICY', 'claim-identity-invalid');
  if (!CLAIM_MATERIALITY.includes(claim.materiality)) return fail('E012-WEB-POLICY', 'claim-materiality-invalid');
  if (!CORROBORATION_STATES.includes(claim.corroborationState)) return fail('E012-WEB-CORROBORATION', 'claim-corroboration-invalid');
  if (containsInstructionShape(claim.normalizedClaim)) return fail('E012-WEB-UNSAFE', 'instruction-shaped-content');
  if (claim.materiality === 'material' && claim.authorable === true && claim.corroborationState !== 'corroborated') {
    return fail('E012-WEB-CORROBORATION', 'claim-authorable-uncorroborated');
  }
  return ok({ authorable: claim.authorable === true });
}

/* ═══════════ Feature 012 Scope 11 — the frozen author projection ═══════════

   The ONE shape the ToolBrief/v2 author is allowed to see of a WebEvidenceBundle.
   It is deliberately narrower than the bundle:

   - the bundle is REVALIDATED here (identity, budgets, and a re-derived
     fingerprint), so a tampered or hand-written bundle can never be frozen;
   - only claims the acquisition stage already marked `authorable` survive, and
     every dropped claim is recorded by id with a closed reason token, so the
     author sees the omission rather than a silently shorter list;
   - raw excerpt TEXT is withheld entirely. The author receives the normalized
     claim plus citation metadata, so remote prose can never reach the model even
     as data; and
   - the result is deep-frozen and carries its own projection fingerprint, which
     the author boundary re-derives before it will build a request.

   This module keeps its zero-authority posture: no fetch, no write, no author
   invocation, no import beyond node:crypto. */

export const AUTHOR_PROJECTION_CONTRACT = 'web-evidence-author-projection/v1';

export function freezeBundleForAuthor(bundle, policy) {
  const revalidated = validateBundle(bundle, policy);
  if (!revalidated.ok) return revalidated;

  const claims = [];
  const omittedClaims = [];
  for (const claim of bundle.claims) {
    if (claim.authorable !== true) {
      omittedClaims.push({ claimId: claim.claimId, reason: 'not-authorable' });
      continue;
    }
    claims.push({
      claimId: claim.claimId,
      normalizedClaim: claim.normalizedClaim,
      materiality: claim.materiality,
      claimKind: claim.claimKind,
      corroborationState: claim.corroborationState,
      conflictState: claim.conflictState,
      freshnessState: claim.freshnessState,
      independentOriginGroups: (claim.independentOriginGroups || []).slice().sort(),
      ownerEvidenceRefs: (claim.ownerEvidenceRefs || []).slice().sort()
    });
  }

  const sources = bundle.sources.map((source) => ({
    sourceId: source.sourceId,
    canonicalUrl: source.canonicalUrl,
    title: source.title,
    publisher: source.publisher,
    sourceClass: source.sourceClass,
    publishedAt: source.publishedAt,
    independentOriginGroup: source.independentOriginGroup,
    contentSha256: source.contentSha256,
    freshnessState: source.freshnessState
  }));

  const body = {
    contractVersion: AUTHOR_PROJECTION_CONTRACT,
    bundleRef: bundle.bundleId,
    bundleSha256: bundle.bundleFingerprint,
    toolId: bundle.toolId,
    runId: bundle.runId,
    policyId: bundle.policyId,
    cutoffAt: bundle.cutoffAt,
    frozenAt: bundle.frozenAt,
    claims,
    omittedClaims,
    sources
  };
  return ok(deepFreeze({ ...body, projectionFingerprint: fingerprint(body) }));
}

/* Re-derive an author projection's declared fingerprint. The author boundary calls
   this shape check through its own hashing; this export exists so a consumer that
   already has the acquisition module can verify without re-implementing the rule. */
export function validateAuthorProjection(projection) {
  if (!isPlainObject(projection)) return fail('E012-WEB-POLICY', 'bundle-not-object');
  if (projection.contractVersion !== AUTHOR_PROJECTION_CONTRACT) return fail('E012-VERSION', 'bundle-version-unsupported');
  const { projectionFingerprint, ...body } = projection;
  if (projectionFingerprint !== fingerprint(body)) return fail('E012-WEB-POLICY', 'bundle-fingerprint-mismatch');
  return ok({ claimCount: projection.claims.length, omittedCount: projection.omittedClaims.length });
}
