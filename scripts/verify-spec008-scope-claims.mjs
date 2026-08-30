#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "spec008-scope-claims/v1";
const SPEC_ID = "008";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const MANIFEST_RELATIVE_PATH = "scripts/spec008-scope-claims.json";

const BOUNDARY_SCOPE_IDS = ["03", "04", "08", "09", ...range(16, 28)];
const CONSUMER_SCOPE_IDS = [...range(3, 13), ...range(15, 27)];
const REQUIRED_PAIRS = [
  ...BOUNDARY_SCOPE_IDS.map((scopeId) => ({ scopeId, kind: "boundary" })),
  ...CONSUMER_SCOPE_IDS.map((scopeId) => ({ scopeId, kind: "consumer" }))
].sort(compareScopeKind);

const ROOT_KEYS = ["schemaVersion", "specId", "entries"];
const BOUNDARY_KEYS = [
  "itemId",
  "scopeId",
  "kind",
  "dodClaim",
  "attributedPaths",
  "allowedFamilies",
  "excludedEdges"
];
const CONSUMER_KEYS = [
  "itemId",
  "scopeId",
  "kind",
  "dodClaim",
  "canonicalIdentifiers",
  "sourceSurfaces",
  "consumerSurfaces",
  "testCarriers",
  "forbiddenAliases"
];
const ATTRIBUTED_PATH_KEYS = ["path", "attribution"];
const WHOLE_FILE_ATTRIBUTION_KEYS = ["kind"];
const IDENTIFIED_ATTRIBUTION_KEYS = ["kind", "identities"];
const EXCLUDED_EDGE_KEYS = ["kind", "token"];
const TOKEN_DESCRIPTOR_KEYS = ["path", "token"];
const CONSUMER_DESCRIPTOR_KEYS = ["path", "consumerClass", "token"];
const EXCLUDED_EDGE_KINDS = ["dependency", "filesystem-write", "storage-write", "public-consumer"];

const REFUSALS = Object.freeze({
  UNKNOWN_ROOT_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ROOT-KEY",
  UNKNOWN_ENTRY_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ENTRY-KEY",
  UNKNOWN_ATTRIBUTION_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ATTRIBUTION-KEY",
  UNKNOWN_EXCLUDED_EDGE_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-EXCLUDED-EDGE-KEY",
  UNKNOWN_CONSUMER_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-CONSUMER-KEY",
  DUPLICATE_ITEM_ID: "E008-SCOPE-CLAIMS-DUPLICATE-ITEM-ID",
  DUPLICATE_SCOPE_KIND: "E008-SCOPE-CLAIMS-DUPLICATE-SCOPE-KIND",
  INVENTORY_COUNT: "E008-SCOPE-CLAIMS-INVENTORY-COUNT",
  REQUIRED_PAIR_MISSING: "E008-SCOPE-CLAIMS-REQUIRED-PAIR-MISSING",
  ABSOLUTE_PATH: "E008-SCOPE-CLAIMS-ABSOLUTE-PATH",
  PARENT_TRAVERSAL: "E008-SCOPE-CLAIMS-PARENT-TRAVERSAL",
  PATH_ESCAPE: "E008-SCOPE-CLAIMS-PATH-ESCAPE",
  PATH_MISSING: "E008-SCOPE-CLAIMS-PATH-MISSING",
  PATH_FAMILY: "E008-SCOPE-CLAIMS-PATH-FAMILY",
  ATTRIBUTION_IDENTITY_REQUIRED: "E008-SCOPE-CLAIMS-ATTRIBUTION-IDENTITY-REQUIRED",
  ATTRIBUTION_ZERO_MATCH: "E008-SCOPE-CLAIMS-ATTRIBUTION-ZERO-MATCH",
  EXCLUDED_DEPENDENCY: "E008-SCOPE-CLAIMS-EXCLUDED-DEPENDENCY",
  EXCLUDED_FILESYSTEM_WRITE: "E008-SCOPE-CLAIMS-EXCLUDED-FILESYSTEM-WRITE",
  EXCLUDED_STORAGE_WRITE: "E008-SCOPE-CLAIMS-EXCLUDED-STORAGE-WRITE",
  EXCLUDED_PUBLIC_CONSUMER: "E008-SCOPE-CLAIMS-EXCLUDED-PUBLIC-CONSUMER",
  CANONICAL_IDENTIFIER_ZERO_MATCH: "E008-SCOPE-CLAIMS-CANONICAL-IDENTIFIER-ZERO-MATCH",
  SOURCE_TOKEN_ZERO_MATCH: "E008-SCOPE-CLAIMS-SOURCE-TOKEN-ZERO-MATCH",
  CONSUMER_CLASS_ZERO_MATCH: "E008-SCOPE-CLAIMS-CONSUMER-CLASS-ZERO-MATCH",
  TEST_CARRIER_ZERO_MATCH: "E008-SCOPE-CLAIMS-TEST-CARRIER-ZERO-MATCH",
  FORBIDDEN_ALIAS: "E008-SCOPE-CLAIMS-FORBIDDEN-ALIAS",
  MANIFEST_SCHEMA: "E008-SCOPE-CLAIMS-MANIFEST-SCHEMA",
  SCHEMA_VERSION: "E008-SCOPE-CLAIMS-SCHEMA-VERSION",
  SPEC_ID: "E008-SCOPE-CLAIMS-SPEC-ID",
  ENTRY_SCHEMA: "E008-SCOPE-CLAIMS-ENTRY-SCHEMA",
  ATTRIBUTION_SCHEMA: "E008-SCOPE-CLAIMS-ATTRIBUTION-SCHEMA",
  EXCLUDED_EDGE_SCHEMA: "E008-SCOPE-CLAIMS-EXCLUDED-EDGE-SCHEMA",
  CONSUMER_SCHEMA: "E008-SCOPE-CLAIMS-CONSUMER-SCHEMA",
  PATH_READER: "E008-SCOPE-CLAIMS-PATH-READER",
  PATH_TYPE: "E008-SCOPE-CLAIMS-PATH-TYPE",
  MANIFEST_MISSING: "E008-SCOPE-CLAIMS-MANIFEST-MISSING"
});

const EDGE_REFUSAL = Object.freeze({
  dependency: REFUSALS.EXCLUDED_DEPENDENCY,
  "filesystem-write": REFUSALS.EXCLUDED_FILESYSTEM_WRITE,
  "storage-write": REFUSALS.EXCLUDED_STORAGE_WRITE,
  "public-consumer": REFUSALS.EXCLUDED_PUBLIC_CONSUMER
});

class ScopeClaimsRefusal extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = "ScopeClaimsRefusal";
    this.code = code;
  }
}

function range(first, last) {
  return Array.from({ length: last - first + 1 }, (_, index) => String(first + index).padStart(2, "0"));
}

function refuse(code, message) {
  throw new ScopeClaimsRefusal(code, message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function scopeNumber(value) {
  return typeof value === "string" && /^\d{2}$/.test(value) ? Number(value) : Number.POSITIVE_INFINITY;
}

function kindRank(kind) {
  if (kind === "boundary") return 0;
  if (kind === "consumer") return 1;
  return 2;
}

function compareScopeKind(left, right) {
  return scopeNumber(left.scopeId) - scopeNumber(right.scopeId)
    || kindRank(left.kind) - kindRank(right.kind)
    || compareText(String(left.scopeId ?? ""), String(right.scopeId ?? ""))
    || compareText(String(left.kind ?? ""), String(right.kind ?? ""))
    || compareText(String(left.itemId ?? ""), String(right.itemId ?? ""));
}

function assertExactKeys(value, expected, unknownCode, malformedCode, context) {
  if (!isObject(value)) refuse(malformedCode, `${context} must be an object`);
  const actual = Object.keys(value);
  const unknown = actual.filter((key) => !expected.includes(key)).sort(compareText);
  if (unknown.length > 0) refuse(unknownCode, `${context} has unknown key(s): ${unknown.join(", ")}`);
  const missing = expected.filter((key) => !Object.hasOwn(value, key));
  if (missing.length > 0) refuse(malformedCode, `${context} is missing key(s): ${missing.join(", ")}`);
}

function assertNonEmptyString(value, code, context) {
  if (!isNonEmptyString(value)) refuse(code, `${context} must be a non-empty string`);
}

function assertArray(value, code, context, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    refuse(code, `${context} must be ${allowEmpty ? "an array" : "a non-empty array"}`);
  }
}

function assertEntryShape(entry) {
  if (!isObject(entry)) refuse(REFUSALS.ENTRY_SCHEMA, "each manifest entry must be an object");
  const context = `entry ${String(entry.itemId ?? "<missing>")}`;
  if (entry.kind !== "boundary" && entry.kind !== "consumer") {
    refuse(REFUSALS.ENTRY_SCHEMA, `${context} kind must be boundary or consumer`);
  }
  const expectedKeys = entry.kind === "boundary" ? BOUNDARY_KEYS : CONSUMER_KEYS;
  assertExactKeys(entry, expectedKeys, REFUSALS.UNKNOWN_ENTRY_KEY, REFUSALS.ENTRY_SCHEMA, context);
  assertNonEmptyString(entry.itemId, REFUSALS.ENTRY_SCHEMA, `${context}.itemId`);
  if (typeof entry.scopeId !== "string" || !/^\d{2}$/.test(entry.scopeId)) {
    refuse(REFUSALS.ENTRY_SCHEMA, `${context}.scopeId must be a two-digit string`);
  }
  assertNonEmptyString(entry.dodClaim, REFUSALS.ENTRY_SCHEMA, `${context}.dodClaim`);
  if (entry.kind === "boundary") assertBoundaryShape(entry, context);
  else assertConsumerShape(entry, context);
}

function assertBoundaryShape(entry, context) {
  assertArray(entry.attributedPaths, REFUSALS.ATTRIBUTION_SCHEMA, `${context}.attributedPaths`);
  assertArray(entry.allowedFamilies, REFUSALS.ATTRIBUTION_SCHEMA, `${context}.allowedFamilies`);
  assertArray(entry.excludedEdges, REFUSALS.EXCLUDED_EDGE_SCHEMA, `${context}.excludedEdges`);

  for (const [index, descriptor] of entry.attributedPaths.entries()) {
    const descriptorContext = `${context}.attributedPaths[${index}]`;
    assertExactKeys(
      descriptor,
      ATTRIBUTED_PATH_KEYS,
      REFUSALS.UNKNOWN_ATTRIBUTION_KEY,
      REFUSALS.ATTRIBUTION_SCHEMA,
      descriptorContext
    );
    assertNonEmptyString(descriptor.path, REFUSALS.ATTRIBUTION_SCHEMA, `${descriptorContext}.path`);
    if (!isObject(descriptor.attribution)) {
      refuse(REFUSALS.ATTRIBUTION_SCHEMA, `${descriptorContext}.attribution must be an object`);
    }
    const attributionKind = descriptor.attribution.kind;
    const attributionKeys = attributionKind === "whole-file"
      ? WHOLE_FILE_ATTRIBUTION_KEYS
      : IDENTIFIED_ATTRIBUTION_KEYS;
    assertExactKeys(
      descriptor.attribution,
      attributionKeys,
      REFUSALS.UNKNOWN_ATTRIBUTION_KEY,
      REFUSALS.ATTRIBUTION_SCHEMA,
      `${descriptorContext}.attribution`
    );
    if (!new Set(["whole-file", "marker", "hunk"]).has(attributionKind)) {
      refuse(REFUSALS.ATTRIBUTION_SCHEMA, `${descriptorContext}.attribution.kind is invalid`);
    }
    if (attributionKind !== "whole-file") {
      assertArray(
        descriptor.attribution.identities,
        REFUSALS.ATTRIBUTION_SCHEMA,
        `${descriptorContext}.attribution.identities`,
        true
      );
      for (const identity of descriptor.attribution.identities) {
        assertNonEmptyString(identity, REFUSALS.ATTRIBUTION_SCHEMA, `${descriptorContext}.attribution identity`);
      }
    }
  }

  for (const family of entry.allowedFamilies) {
    assertNonEmptyString(family, REFUSALS.ATTRIBUTION_SCHEMA, `${context}.allowedFamilies entry`);
  }

  const edgeKinds = new Set();
  for (const [index, edge] of entry.excludedEdges.entries()) {
    const edgeContext = `${context}.excludedEdges[${index}]`;
    assertExactKeys(
      edge,
      EXCLUDED_EDGE_KEYS,
      REFUSALS.UNKNOWN_EXCLUDED_EDGE_KEY,
      REFUSALS.EXCLUDED_EDGE_SCHEMA,
      edgeContext
    );
    if (!EXCLUDED_EDGE_KINDS.includes(edge.kind)) {
      refuse(REFUSALS.EXCLUDED_EDGE_SCHEMA, `${edgeContext}.kind is invalid`);
    }
    if (edgeKinds.has(edge.kind)) {
      refuse(REFUSALS.EXCLUDED_EDGE_SCHEMA, `${context} repeats excluded edge kind ${edge.kind}`);
    }
    edgeKinds.add(edge.kind);
    assertNonEmptyString(edge.token, REFUSALS.EXCLUDED_EDGE_SCHEMA, `${edgeContext}.token`);
  }
  const missingKinds = EXCLUDED_EDGE_KINDS.filter((kind) => !edgeKinds.has(kind));
  if (missingKinds.length > 0) {
    refuse(REFUSALS.EXCLUDED_EDGE_SCHEMA, `${context} is missing excluded edge kind(s): ${missingKinds.join(", ")}`);
  }
}

function assertConsumerShape(entry, context) {
  const descriptorFields = ["canonicalIdentifiers", "sourceSurfaces", "testCarriers"];
  for (const field of descriptorFields) {
    assertArray(entry[field], REFUSALS.CONSUMER_SCHEMA, `${context}.${field}`);
    for (const [index, descriptor] of entry[field].entries()) {
      assertTokenDescriptor(descriptor, `${context}.${field}[${index}]`);
    }
  }

  assertArray(entry.consumerSurfaces, REFUSALS.CONSUMER_SCHEMA, `${context}.consumerSurfaces`);
  for (const [index, descriptor] of entry.consumerSurfaces.entries()) {
    const descriptorContext = `${context}.consumerSurfaces[${index}]`;
    assertExactKeys(
      descriptor,
      CONSUMER_DESCRIPTOR_KEYS,
      REFUSALS.UNKNOWN_CONSUMER_KEY,
      REFUSALS.CONSUMER_SCHEMA,
      descriptorContext
    );
    assertNonEmptyString(descriptor.path, REFUSALS.CONSUMER_SCHEMA, `${descriptorContext}.path`);
    assertNonEmptyString(descriptor.consumerClass, REFUSALS.CONSUMER_SCHEMA, `${descriptorContext}.consumerClass`);
    assertNonEmptyString(descriptor.token, REFUSALS.CONSUMER_SCHEMA, `${descriptorContext}.token`);
  }

  assertArray(entry.forbiddenAliases, REFUSALS.CONSUMER_SCHEMA, `${context}.forbiddenAliases`, true);
  for (const [index, descriptor] of entry.forbiddenAliases.entries()) {
    assertTokenDescriptor(descriptor, `${context}.forbiddenAliases[${index}]`);
  }
}

function assertTokenDescriptor(descriptor, context) {
  assertExactKeys(
    descriptor,
    TOKEN_DESCRIPTOR_KEYS,
    REFUSALS.UNKNOWN_CONSUMER_KEY,
    REFUSALS.CONSUMER_SCHEMA,
    context
  );
  assertNonEmptyString(descriptor.path, REFUSALS.CONSUMER_SCHEMA, `${context}.path`);
  assertNonEmptyString(descriptor.token, REFUSALS.CONSUMER_SCHEMA, `${context}.token`);
}

function assertInventory(entries) {
  const duplicateItemId = firstDuplicate(entries, (entry) => entry.itemId);
  if (duplicateItemId !== null) {
    refuse(REFUSALS.DUPLICATE_ITEM_ID, `itemId ${duplicateItemId} appears more than once`);
  }
  const duplicatePair = firstDuplicate(entries, (entry) => `${entry.scopeId}:${entry.kind}`);
  if (duplicatePair !== null) {
    refuse(REFUSALS.DUPLICATE_SCOPE_KIND, `scope-kind pair ${duplicatePair} appears more than once`);
  }
  if (entries.length !== REQUIRED_PAIRS.length) {
    refuse(REFUSALS.INVENTORY_COUNT, `expected ${REQUIRED_PAIRS.length} entries, received ${entries.length}`);
  }
  const actualPairs = new Set(entries.map((entry) => `${entry.scopeId}:${entry.kind}`));
  const missingPair = REQUIRED_PAIRS.find(({ scopeId, kind }) => !actualPairs.has(`${scopeId}:${kind}`));
  if (missingPair) {
    refuse(REFUSALS.REQUIRED_PAIR_MISSING, `required pair ${missingPair.scopeId}:${missingPair.kind} is missing`);
  }
}

function firstDuplicate(entries, keyFor) {
  const seen = new Set();
  for (const value of entries.map(keyFor).sort(compareText)) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return null;
}

function assertSafeRelativePath(path, repositoryRoot, context, allowTrailingSlash = false) {
  assertNonEmptyString(path, REFUSALS.PATH_MISSING, context);
  if (isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\")) {
    refuse(REFUSALS.ABSOLUTE_PATH, `${context} must be repository-relative: ${path}`);
  }
  if (path.includes("\\") || path.includes("\0")) {
    refuse(REFUSALS.PATH_ESCAPE, `${context} is not a safe POSIX repository path: ${path}`);
  }
  const segments = path.split("/");
  if (allowTrailingSlash && segments.at(-1) === "") segments.pop();
  if (segments.length === 0 || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    refuse(REFUSALS.PARENT_TRAVERSAL, `${context} contains an unsafe path segment: ${path}`);
  }
  const absolutePath = resolve(repositoryRoot, path);
  if (!pathIsWithin(repositoryRoot, absolutePath)) {
    refuse(REFUSALS.PATH_ESCAPE, `${context} resolves outside the repository: ${path}`);
  }
  return absolutePath;
}

function pathIsWithin(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function makeRecordReader(repositoryRoot, sourceReader) {
  const cache = new Map();
  return (path, context) => {
    const expectedPath = assertSafeRelativePath(path, repositoryRoot, context);
    if (cache.has(path)) return cache.get(path);
    let sourceRecord;
    try {
      sourceRecord = sourceReader(path);
    } catch (error) {
      refuse(REFUSALS.PATH_READER, `${context} could not be read: ${error instanceof Error ? error.name : "unknown error"}`);
    }
    if (!isObject(sourceRecord)) refuse(REFUSALS.PATH_MISSING, `${context} does not exist: ${path}`);
    if (!isNonEmptyString(sourceRecord.realPath) || !isAbsolute(sourceRecord.realPath)) {
      refuse(REFUSALS.PATH_ESCAPE, `${context} has no safe absolute real path: ${path}`);
    }
    const realPath = resolve(sourceRecord.realPath);
    if (!pathIsWithin(repositoryRoot, realPath)) {
      refuse(REFUSALS.PATH_ESCAPE, `${context} resolves outside the repository: ${path}`);
    }
    if (sourceRecord.type !== "symlink" && realPath !== expectedPath) {
      refuse(REFUSALS.PATH_ESCAPE, `${context} resolves to a different repository path: ${path}`);
    }
    if (!new Set(["file", "symlink"]).has(sourceRecord.type) || typeof sourceRecord.text !== "string") {
      refuse(REFUSALS.PATH_TYPE, `${context} must resolve to a readable file: ${path}`);
    }
    const record = Object.freeze({ type: sourceRecord.type, realPath, text: sourceRecord.text });
    cache.set(path, record);
    return record;
  };
}

function pathMatchesFamily(path, family) {
  const prefix = family.endsWith("/") ? family : `${family}/`;
  return path === family || path.startsWith(prefix);
}

function validateBoundary(entry, repositoryRoot, readRecord) {
  const families = [...entry.allowedFamilies].sort(compareText);
  for (const family of families) {
    assertSafeRelativePath(family, repositoryRoot, `${entry.itemId}.allowedFamilies`, true);
  }
  const attributedPaths = [...entry.attributedPaths].sort((left, right) => compareText(left.path, right.path));
  const records = [];
  for (const descriptor of attributedPaths) {
    const context = `${entry.itemId}.attributedPaths ${descriptor.path}`;
    const record = readRecord(descriptor.path, context);
    if (!families.some((family) => pathMatchesFamily(descriptor.path, family))) {
      refuse(REFUSALS.PATH_FAMILY, `${context} is outside allowed families ${families.join(", ")}`);
    }
    const { attribution } = descriptor;
    if (attribution.kind !== "whole-file") {
      if (attribution.identities.length === 0) {
        refuse(
          REFUSALS.ATTRIBUTION_IDENTITY_REQUIRED,
          `${context} ${attribution.kind} attribution requires at least one identity`
        );
      }
      const missingIdentity = [...attribution.identities].sort(compareText)
        .find((identity) => !record.text.includes(identity));
      if (missingIdentity !== undefined) {
        refuse(
          REFUSALS.ATTRIBUTION_ZERO_MATCH,
          `${context} ${attribution.kind} identity has zero matches: ${missingIdentity}`
        );
      }
    }
    records.push({ path: descriptor.path, text: record.text });
  }

  const edges = [...entry.excludedEdges].sort(
    (left, right) => EXCLUDED_EDGE_KINDS.indexOf(left.kind) - EXCLUDED_EDGE_KINDS.indexOf(right.kind)
      || compareText(left.token, right.token)
  );
  for (const edge of edges) {
    const matchedPath = records.find((record) => record.text.includes(edge.token))?.path;
    if (matchedPath !== undefined) {
      refuse(EDGE_REFUSAL[edge.kind], `${entry.itemId} contains excluded ${edge.kind} token ${edge.token} in ${matchedPath}`);
    }
  }

  return [
    "closed-entry-schema",
    `attributed-paths:${attributedPaths.length}`,
    `allowed-families:${families.length}`,
    "attribution-identities",
    `excluded-edge-kinds:${edges.length}`
  ];
}

function descriptorOrder(left, right) {
  return compareText(left.path, right.path)
    || compareText(String(left.consumerClass ?? ""), String(right.consumerClass ?? ""))
    || compareText(left.token, right.token);
}

function requireDescriptorMatches(entry, descriptors, readRecord, code, label, fields) {
  const ordered = [...descriptors].sort(descriptorOrder);
  for (const descriptor of ordered) {
    const record = readRecord(descriptor.path, `${entry.itemId}.${label} ${descriptor.path}`);
    for (const field of fields) {
      const literal = descriptor[field];
      if (!record.text.includes(literal)) {
        refuse(code, `${entry.itemId}.${label} has zero matches for ${field} ${literal} in ${descriptor.path}`);
      }
    }
  }
  return ordered.length;
}

function validateConsumer(entry, readRecord) {
  const canonicalCount = requireDescriptorMatches(
    entry,
    entry.canonicalIdentifiers,
    readRecord,
    REFUSALS.CANONICAL_IDENTIFIER_ZERO_MATCH,
    "canonicalIdentifiers",
    ["token"]
  );
  const sourceCount = requireDescriptorMatches(
    entry,
    entry.sourceSurfaces,
    readRecord,
    REFUSALS.SOURCE_TOKEN_ZERO_MATCH,
    "sourceSurfaces",
    ["token"]
  );
  const consumerCount = requireDescriptorMatches(
    entry,
    entry.consumerSurfaces,
    readRecord,
    REFUSALS.CONSUMER_CLASS_ZERO_MATCH,
    "consumerSurfaces",
    ["consumerClass", "token"]
  );
  const testCount = requireDescriptorMatches(
    entry,
    entry.testCarriers,
    readRecord,
    REFUSALS.TEST_CARRIER_ZERO_MATCH,
    "testCarriers",
    ["token"]
  );

  const aliases = [...entry.forbiddenAliases].sort(descriptorOrder);
  for (const descriptor of aliases) {
    const record = readRecord(descriptor.path, `${entry.itemId}.forbiddenAliases ${descriptor.path}`);
    if (record.text.includes(descriptor.token)) {
      refuse(REFUSALS.FORBIDDEN_ALIAS, `${entry.itemId} contains forbidden alias ${descriptor.token} in ${descriptor.path}`);
    }
  }

  return [
    "closed-entry-schema",
    `canonical-identifiers:${canonicalCount}`,
    `source-surfaces:${sourceCount}`,
    `consumer-surfaces:${consumerCount}`,
    `test-carriers:${testCount}`,
    `forbidden-aliases:${aliases.length}`
  ];
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  const output = {};
  for (const key of Object.keys(value).sort(compareText)) output[key] = canonicalize(value[key]);
  return output;
}

function manifestDigest(manifest, orderedEntries) {
  const canonicalManifest = canonicalize({
    schemaVersion: manifest.schemaVersion,
    specId: manifest.specId,
    entries: orderedEntries
  });
  return `sha256:${createHash("sha256").update(JSON.stringify(canonicalManifest)).digest("hex")}`;
}

export function verifySpec008ScopeClaims({ manifest, repositoryRoot, sourceReader } = {}) {
  assertExactKeys(
    manifest,
    ROOT_KEYS,
    REFUSALS.UNKNOWN_ROOT_KEY,
    REFUSALS.MANIFEST_SCHEMA,
    "manifest root"
  );
  if (manifest.schemaVersion !== SCHEMA_VERSION) {
    refuse(REFUSALS.SCHEMA_VERSION, `schemaVersion must equal ${SCHEMA_VERSION}`);
  }
  if (manifest.specId !== SPEC_ID) refuse(REFUSALS.SPEC_ID, `specId must equal ${SPEC_ID}`);
  assertArray(manifest.entries, REFUSALS.MANIFEST_SCHEMA, "manifest.entries", true);
  if (!isNonEmptyString(repositoryRoot) || !isAbsolute(repositoryRoot)) {
    refuse(REFUSALS.PATH_ESCAPE, "repositoryRoot must be an absolute path");
  }
  if (typeof sourceReader !== "function") {
    refuse(REFUSALS.PATH_READER, "sourceReader must be a function");
  }

  const root = resolve(repositoryRoot);
  const entries = [...manifest.entries].sort(compareScopeKind);
  for (const entry of entries) assertEntryShape(entry);
  assertInventory(entries);

  const readRecord = makeRecordReader(root, sourceReader);
  const results = entries.map((entry) => ({
    itemId: entry.itemId,
    scopeId: entry.scopeId,
    kind: entry.kind,
    status: "pass",
    checks: entry.kind === "boundary"
      ? validateBoundary(entry, root, readRecord)
      : validateConsumer(entry, readRecord)
  }));
  const boundary = results.filter((result) => result.kind === "boundary").length;
  const consumer = results.filter((result) => result.kind === "consumer").length;
  const pass = results.filter((result) => result.status === "pass").length;

  return {
    schemaVersion: SCHEMA_VERSION,
    specId: SPEC_ID,
    manifestSha256: manifestDigest(manifest, entries),
    results,
    summary: {
      total: results.length,
      boundary,
      consumer,
      pass,
      fail: results.length - pass
    }
  };
}

export function serializeSpec008ScopeClaimsResult(result) {
  return `${JSON.stringify(result)}\n`;
}

function createDiskSourceReader(repositoryRoot) {
  return (path) => {
    const absolutePath = resolve(repositoryRoot, path);
    try {
      const linkStat = lstatSync(absolutePath);
      const targetStat = statSync(absolutePath);
      return {
        type: linkStat.isSymbolicLink() ? "symlink" : targetStat.isFile() ? "file" : "other",
        realPath: realpathSync(absolutePath),
        text: targetStat.isFile() ? readFileSync(absolutePath, "utf8") : ""
      };
    } catch {
      return null;
    }
  };
}

function emitVerdicts(result) {
  for (const row of result.results) {
    process.stderr.write(
      `[spec008-scope-claims] scope=${row.scopeId} kind=${row.kind} item=${row.itemId} status=${row.status} checks=${row.checks.join(",")}\n`
    );
  }
  process.stderr.write(
    `[spec008-scope-claims] total=${result.summary.total} boundary=${result.summary.boundary} consumer=${result.summary.consumer} pass=${result.summary.pass} fail=${result.summary.fail}\n`
  );
}

function main() {
  const manifestPath = join(REPOSITORY_ROOT, MANIFEST_RELATIVE_PATH);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    const detail = error instanceof Error && error.name === "SyntaxError" ? "is not valid JSON" : "is missing or unreadable";
    refuse(REFUSALS.MANIFEST_MISSING, `${MANIFEST_RELATIVE_PATH} ${detail}`);
  }
  const result = verifySpec008ScopeClaims({
    manifest,
    repositoryRoot: REPOSITORY_ROOT,
    sourceReader: createDiskSourceReader(REPOSITORY_ROOT)
  });
  emitVerdicts(result);
  process.stdout.write(serializeSpec008ScopeClaimsResult(result));
  return 0;
}

if (resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  try {
    process.exitCode = main();
  } catch (error) {
    const code = error instanceof Error && typeof error.code === "string"
      ? error.code
      : "E008-SCOPE-CLAIMS-INTERNAL";
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[spec008-scope-claims] REFUSED code=${code} message=${message}\n`);
    process.exitCode = 1;
  }
}
