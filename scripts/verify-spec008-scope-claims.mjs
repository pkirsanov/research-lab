#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "spec008-scope-claims/v2";
const SPEC_ID = "008";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const MANIFEST_RELATIVE_PATH = "scripts/spec008-scope-claims.json";
const FEATURE_ROOT = "specs/008-portfolio-survival-and-brief-lab";
const BOUNDARY_REGISTRY_ARTIFACT = "scopes/_boundary-attribution.md";
const BOUNDARY_REGISTRY_PATH = `${FEATURE_ROOT}/${BOUNDARY_REGISTRY_ARTIFACT}`;
const BOUNDARY_ROW_SUFFIX = "attribution covers every claimed path and marker, hunk, or whole-file ownership declaration";
const CONSUMER_ROW = "Consumer impact sweep completed; zero stale first-party references remain";

export const SCOPE_CLAIMS_REFUSAL_V2 = Object.freeze({
	MANIFEST_SCHEMA_INVALID: "SCV2-MANIFEST-SCHEMA",
	CANONICAL_PAIR_SET_MISMATCH: "SCV2-PAIR-SET",
	INVENTORY_SOURCE_INVALID: "SCV2-INVENTORY-SOURCE",
	INVENTORY_DESCRIPTOR_MISMATCH: "SCV2-INVENTORY-DESCRIPTOR",
	PATH_MISSING: "SCV2-PATH-MISSING",
	PATH_REPOSITORY_ESCAPE: "SCV2-PATH-REPOSITORY-ESCAPE",
	PATH_FAMILY_ESCAPE: "SCV2-PATH-FAMILY-ESCAPE",
	IDENTITY_UNRESOLVED: "SCV2-IDENTITY-UNRESOLVED",
	OWNERSHIP_OVERLAP_UNDECLARED: "SCV2-OWNERSHIP-OVERLAP",
	EVOLUTION_CHAIN_INVALID: "SCV2-EVOLUTION-CHAIN",
	SEMANTIC_EDGE_FORBIDDEN: "SCV2-SEMANTIC-EDGE-FORBIDDEN",
	SEMANTIC_EDGE_UNRESOLVED: "SCV2-SEMANTIC-EDGE-UNRESOLVED",
	ALIAS_ORIGIN_INVALID: "SCV2-ALIAS-ORIGIN",
	ALIAS_SCAN_INVALID: "SCV2-ALIAS-SCAN",
	ALIAS_NONE_INVALID: "SCV2-ALIAS-NONE",
	CAUSAL_BINDING_DISCONNECTED: "SCV2-CAUSAL-BINDING",
	TEST_TITLE_UNREACHABLE: "SCV2-TEST-TITLE",
	ASSERTION_BINDING_INVALID: "SCV2-ASSERTION-BINDING"
});

const R = SCOPE_CLAIMS_REFUSAL_V2;
const ROOT_KEYS = ["schemaVersion", "specId", "entries"];
const COMMON_ENTRY_KEYS = ["itemId", "scopeId", "kind", "dodClaim", "claimSource"];
const BOUNDARY_KEYS = [...COMMON_ENTRY_KEYS, "expectedInventory", "attributedPaths", "allowedFamilies", "edgePolicy"];
const CONSUMER_KEYS = [...COMMON_ENTRY_KEYS, "canonicalProducers", "consumerSurfaces", "testCarriers", "aliases", "causalBindings"];
const CLAIM_SOURCE_KEYS = ["artifact", "section", "rowIdentity"];
const EXPECTED_INVENTORY_KEYS = ["sources", "descriptors", "descriptorCount", "inventorySha256"];
const INVENTORY_SOURCE_KEYS = ["artifact", "section", "selector", "role"];
const SELECTOR_KEYS = ["kind", "value"];
const DESCRIPTOR_KEYS = ["path", "identityKind", "identity"];
const ATTRIBUTED_DESCRIPTOR_KEYS = [...DESCRIPTOR_KEYS, "ownership"];
const EDGE_POLICY_KEYS = ["dependency", "filesystemWrite", "durableStorageWrite", "publicConsumer"];
const EDGE_CLASS_KEYS = ["permittedSurfaces", "forbiddenSurfaces"];
const EDGE_SURFACE_KEYS = ["pathFamily", "path", "identityKind", "identity"];
const PRODUCER_KEYS = ["path", "language", "identityKind", "identity"];
const CONSUMER_SURFACE_KEYS = ["path", "language", "dependencyEdge", "useKind", "useIdentity"];
const TEST_CARRIER_KEYS = ["path", "title", "assertionKind", "assertionIdentity"];
const BINDING_KEYS = ["bindingId", "producer", "consumer", "test"];
const SOURCE_ROLES = new Set(["owned-paths", "owned-identities", "test-identities", "edge-surfaces"]);
const SELECTOR_KINDS = new Set(["table-column", "registry-row"]);
const IDENTITY_KINDS = new Set(["whole-file", "exported-symbol", "local-symbol", "marker", "marker-pair", "hunk", "test-title", "config-key", "dom-id"]);
const POLICY_IDENTITY_KINDS = new Set([...IDENTITY_KINDS, "contract-token"]);
const LANGUAGES = new Set(["javascript", "html", "json", "markdown"]);
const DEPENDENCY_EDGES = new Set(["static-import", "commonjs-require", "script-global", "same-file", "registry-reference"]);
const USE_KINDS = new Set(["call", "render", "read", "registry"]);
const REGISTRY_COLUMNS = ["Path", "Identity Kind", "Identity", "Role", "Ownership Mode", "Chain ID", "Ordered Scope IDs"];
const REGISTRY_ROLES = new Set(["production", "config", "dom", "test", "support", "fixture", "validator", "canary", "command-registry", "planning"]);
const SEMANTIC_EXECUTABLE_ROLES = new Set(["production", "config", "dom", "test", "support", "fixture", "validator", "canary"]);
const PUBLIC_CONSUMER_ROLES = new Set(["command-registry", "planning"]);
const SEMANTIC_EXECUTABLE_PATH = /\.(?:cjs|mjs|js|html)$/;
const TEXT_ANALYSIS_KINDS = Object.freeze([
	"javascriptTokens",
	"testDeclarations",
	"literalHtmlDomIds",
	"directDomIds",
	"dataDrivenDomIds",
	"derivedConsumerContract"
]);
const TEXT_ANALYSIS_CACHE_MAX_ENTRIES = 4096;
const TEXT_ANALYSIS_CACHE_MAX_CHARACTERS = 64 * 1024 * 1024;
const TEXT_ANALYSIS_CACHE_ACCESS = Symbol("spec008-scope-claims-analysis-cache-access");
const verificationAnalysisCaches = new WeakSet();

function immutableAnalysisValue(value) {
	if (value instanceof Map) {
		const snapshot = new Map([...value].map(([key, entry]) => [key, immutableAnalysisValue(entry)]));
		return Object.freeze({
			get(key) { return snapshot.get(key); },
			has(key) { return snapshot.has(key); },
			get size() { return snapshot.size; }
		});
	}
	if (Array.isArray(value)) return Object.freeze(value.map(immutableAnalysisValue));
	if (value !== null && typeof value === "object") {
		return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, immutableAnalysisValue(entry)])));
	}
	return value;
}

function immutableAnalysisCacheSnapshot(value) {
	return Object.freeze({
		maxEntries: value.maxEntries * TEXT_ANALYSIS_KINDS.length,
		maxCharacters: value.maxCharacters * TEXT_ANALYSIS_KINDS.length,
		maxEntriesPerKind: value.maxEntries,
		maxCharactersPerKind: value.maxCharacters,
		size: value.size,
		characters: value.characters,
		hits: value.hits,
		misses: value.misses,
		stores: value.stores,
		evictions: value.evictions,
		byKind: Object.freeze(Object.fromEntries(TEXT_ANALYSIS_KINDS.map((kind) => [kind, Object.freeze({ ...value.byKind[kind] })])))
	});
}

export function createSpec008ScopeClaimsAnalysisCache() {
	const entriesByKind = new Map(TEXT_ANALYSIS_KINDS.map((kind) => [kind, new Map()]));
	const recencyByKind = new Map(TEXT_ANALYSIS_KINDS.map((kind) => [kind, new Map()]));
	const stats = {
		maxEntries: TEXT_ANALYSIS_CACHE_MAX_ENTRIES,
		maxCharacters: TEXT_ANALYSIS_CACHE_MAX_CHARACTERS,
		size: 0,
		characters: 0,
		hits: 0,
		misses: 0,
		stores: 0,
		evictions: 0,
		byKind: Object.fromEntries(TEXT_ANALYSIS_KINDS.map((kind) => [kind, { hits: 0, misses: 0, stores: 0 }]))
	};
	const evictOldest = (kind) => {
		const recency = recencyByKind.get(kind);
		const oldest = recency.keys().next().value;
		if (!oldest) return;
		recency.delete(oldest);
		entriesByKind.get(kind).delete(oldest.text);
		stats.size -= 1;
		stats.characters -= oldest.characters;
		stats.evictions += 1;
	};
	const cache = Object.freeze({
		[TEXT_ANALYSIS_CACHE_ACCESS](kind, text, analyze, characterWeight = text.length) {
			const entries = entriesByKind.get(kind);
			const recency = recencyByKind.get(kind);
			if (!entries || typeof text !== "string" || typeof analyze !== "function"
				|| !Number.isSafeInteger(characterWeight) || characterWeight < 0) {
				throw new TypeError("scope-claims analysis cache requires a closed analysis kind, complete source text, and analyzer");
			}
			const existing = entries.get(text);
			if (existing) {
				recency.delete(existing);
				recency.set(existing, true);
				stats.hits += 1;
				stats.byKind[kind].hits += 1;
				return existing.value;
			}
			stats.misses += 1;
			stats.byKind[kind].misses += 1;
			const value = immutableAnalysisValue(analyze());
			const characters = characterWeight;
			if (characters > stats.maxCharacters) return value;
			while (recency.size >= stats.maxEntries
				|| [...recency.keys()].reduce((total, cached) => total + cached.characters, 0) + characters > stats.maxCharacters) {
				evictOldest(kind);
			}
			const entry = Object.freeze({ kind, text, characters, value });
			entries.set(text, entry);
			recency.set(entry, true);
			stats.size += 1;
			stats.characters += characters;
			stats.stores += 1;
			stats.byKind[kind].stores += 1;
			return value;
		},
		snapshot() { return immutableAnalysisCacheSnapshot(stats); }
	});
	verificationAnalysisCaches.add(cache);
	return cache;
}

let activeVerificationAnalysisCache = null;

function withVerificationAnalysisCache(cache, operation) {
	if (!verificationAnalysisCaches.has(cache)) throw new TypeError("analysisCache must come from createSpec008ScopeClaimsAnalysisCache");
	const previous = activeVerificationAnalysisCache;
	activeVerificationAnalysisCache = cache;
	try { return operation(); }
	finally { activeVerificationAnalysisCache = previous; }
}

function memoizedTextAnalysis(cacheName, text, analyze, characterWeight = text.length) {
	if (!activeVerificationAnalysisCache) return immutableAnalysisValue(analyze());
	return activeVerificationAnalysisCache[TEXT_ANALYSIS_CACHE_ACCESS](cacheName, text, analyze, characterWeight);
}

function freshAnalysisCopy(value) {
	return structuredClone(value);
}

const SCOPE_ARTIFACTS = Object.freeze({
	"03": "scopes/03-local-behavior-privacy-inventory-and-clear/scope.md",
	"04": "scopes/04-public-evidence-barrier-and-coverage/scope.md",
	"05": "scopes/05-four-window-direct-scope-brief/scope.md",
	"06": "scopes/06-explainable-research-action-lifecycle/scope.md",
	"07": "scopes/07-return-and-drawdown-x-ray/scope.md",
	"08": "scopes/08-concentration-capm-and-risk-contribution/scope.md",
	"09": "scopes/09-dependent-path-reproducibility/scope.md",
	"10": "scopes/10-dated-cash-needs-and-survival-states/scope.md",
	"11": "scopes/11-stress-tail-and-alternative-dependence/scope.md",
	"12": "scopes/12-hedge-variant-research/scope.md",
	"13": "scopes/13-six-method-allocation-basis-and-feasibility/scope.md",
	"15": "scopes/15-walk-forward-research-dossier-and-claim-boundaries/scope.md",
	"16": "scopes/16-integrated-route-accessibility-and-atomic-release/scope.md",
	"17": "scopes/17-local-lifecycle-and-verified-clear-foundation/scope.md",
	"18": "scopes/18-behavior-identity-and-ranking-foundation/scope.md",
	"19": "scopes/19-coverage-aware-market-data-foundation/scope.md",
	"20": "scopes/20-generic-evidence-brief-policy-and-api/scope.md",
	"21": "scopes/21-partial-risk-input-and-diagnostics/scope.md",
	"22": "scopes/22-scenario-contract-and-survival-distributions/scope.md",
	"23": "scopes/23-stress-dependence-and-hedge-effectiveness/scope.md",
	"24": "scopes/24-complete-allocation-and-explicit-views/scope.md",
	"25": "scopes/25-decision-time-dossier-and-immutable-audit/scope.md",
	"26": "scopes/26-immutable-workspace-compute-and-navigation/scope.md",
	"27": "scopes/27-accessible-six-tab-interaction/scope.md",
	"28": "scopes/28-spec-driven-adversarial-test-replacement/scope.md"
});
const BOUNDARY_SCOPE_IDS = ["03", "04", "08", "09", ...range(16, 28)];
const CONSUMER_SCOPE_IDS = [...range(3, 13), ...range(15, 27)];
const EXPECTED_PAIRS = [
	...BOUNDARY_SCOPE_IDS.map((scopeId) => ({ scopeId, kind: "boundary" })),
	...CONSUMER_SCOPE_IDS.map((scopeId) => ({ scopeId, kind: "consumer" }))
].sort(compareScopeKind);

class ScopeClaimsRefusal extends Error {
	constructor(code, detail, itemId = null) {
		const refusal = { schemaVersion: SCHEMA_VERSION, specId: SPEC_ID, status: "refused", refusalCode: code, itemId, detail };
		super(`${code}: ${detail}`);
		this.name = "ScopeClaimsRefusal";
		this.code = code;
		this.refusal = refusal;
	}
}

function range(first, last) {
	return Array.from({ length: last - first + 1 }, (_, index) => String(first + index).padStart(2, "0"));
}

function descriptor(path, identityKind, identity) {
	return Object.freeze({ path, identityKind, identity });
}

function refuse(code, detail, itemId = null) {
	throw new ScopeClaimsRefusal(code, detail, itemId);
}

function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}

function compareText(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

function scopeNumber(scopeId) {
	return typeof scopeId === "string" && /^\d{2}$/.test(scopeId) ? Number(scopeId) : Number.POSITIVE_INFINITY;
}

function compareScopeKind(left, right) {
	return scopeNumber(left.scopeId) - scopeNumber(right.scopeId)
		|| (left.kind === right.kind ? 0 : left.kind === "boundary" ? -1 : 1)
		|| compareText(String(left.itemId ?? ""), String(right.itemId ?? ""));
}

function stableRowIdentity(scopeId, kind) {
	return kind === "boundary" ? `Scope-${scopeId} ${BOUNDARY_ROW_SUFFIX}` : CONSUMER_ROW;
}

function definitionOfDoneSection(scopeId) {
	return Number(scopeId) >= 17 ? "Definition of Done - Tiered Validation" : "Definition of Done";
}

function changeBoundarySection(scopeId) {
	return Number(scopeId) >= 17 ? "Change Boundary" : "Change Boundary And Rollback";
}

function assertExactKeys(value, expected, context, code = R.MANIFEST_SCHEMA_INVALID) {
	if (!isObject(value)) refuse(code, `${context} must be an object`);
	const actual = Object.keys(value);
	const unknown = actual.filter((key) => !expected.includes(key)).sort(compareText);
	const missing = expected.filter((key) => !Object.hasOwn(value, key));
	if (unknown.length > 0) refuse(code, `${context} has unknown key(s): ${unknown.join(", ")}`);
	if (missing.length > 0) refuse(code, `${context} is missing key(s): ${missing.join(", ")}`);
}

function assertArray(value, context, { allowEmpty = false, code = R.MANIFEST_SCHEMA_INVALID } = {}) {
	if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
		refuse(code, `${context} must be ${allowEmpty ? "an array" : "a non-empty array"}`);
	}
}

function assertString(value, context, code = R.MANIFEST_SCHEMA_INVALID) {
	if (!isNonEmptyString(value)) refuse(code, `${context} must be a non-empty string`);
}

function firstDuplicate(values, keyFor) {
	const seen = new Set();
	for (const value of values) {
		const key = keyFor(value);
		if (seen.has(key)) return key;
		seen.add(key);
	}
	return null;
}

function assertManifestSchema(manifest) {
	assertExactKeys(manifest, ROOT_KEYS, "manifest root");
	if (manifest.schemaVersion !== SCHEMA_VERSION) refuse(R.MANIFEST_SCHEMA_INVALID, `schemaVersion must equal ${SCHEMA_VERSION}`);
	if (manifest.specId !== SPEC_ID) refuse(R.MANIFEST_SCHEMA_INVALID, `specId must equal ${SPEC_ID}`);
	assertArray(manifest.entries, "manifest.entries", { allowEmpty: true });
	for (const [index, entry] of manifest.entries.entries()) assertEntrySchema(entry, index);
}

function assertEntrySchema(entry, index) {
	if (!isObject(entry)) refuse(R.MANIFEST_SCHEMA_INVALID, `manifest.entries[${index}] must be an object`);
	const keys = entry.kind === "boundary" ? BOUNDARY_KEYS : entry.kind === "consumer" ? CONSUMER_KEYS : null;
	if (keys === null) refuse(R.MANIFEST_SCHEMA_INVALID, `manifest.entries[${index}].kind must be boundary or consumer`);
	assertExactKeys(entry, keys, `manifest.entries[${index}]`);
	assertString(entry.itemId, `manifest.entries[${index}].itemId`);
	if (!/^\d{2}$/.test(entry.scopeId)) refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.scopeId must be a two-digit string`);
	if (entry.itemId !== `SCOPE-${entry.scopeId}-${entry.kind.toUpperCase()}-CLAIM`) {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId} does not match its scope and kind`);
	}
	assertString(entry.dodClaim, `${entry.itemId}.dodClaim`);
	assertClaimSourceSchema(entry.claimSource, `${entry.itemId}.claimSource`);
	if (entry.kind === "boundary") assertBoundarySchema(entry);
	else assertConsumerSchema(entry);
}

function assertClaimSourceSchema(source, context) {
	assertExactKeys(source, CLAIM_SOURCE_KEYS, context);
	for (const key of CLAIM_SOURCE_KEYS) assertString(source[key], `${context}.${key}`);
}

function assertDescriptorSchema(value, context, attributed = false) {
	assertExactKeys(value, attributed ? ATTRIBUTED_DESCRIPTOR_KEYS : DESCRIPTOR_KEYS, context);
	assertString(value.path, `${context}.path`);
	assertString(value.identityKind, `${context}.identityKind`);
	assertString(value.identity, `${context}.identity`);
	if (!IDENTITY_KINDS.has(value.identityKind)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.identityKind is not closed`);
	if (value.identityKind === "whole-file" && value.identity !== "whole-file") {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${context} whole-file identity must equal whole-file`);
	}
	if (attributed) assertOwnershipSchema(value.ownership, `${context}.ownership`);
}

function assertOwnershipSchema(value, context) {
	if (!isObject(value) || !isNonEmptyString(value.mode)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context} must declare a mode`);
	if (value.mode === "exclusive") {
		assertExactKeys(value, ["mode", "ownerScopeId"], context);
		if (!/^\d{2}$/.test(value.ownerScopeId)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.ownerScopeId must be a scope id`);
		return;
	}
	if (value.mode === "ordered-evolution") {
		assertExactKeys(value, ["mode", "chainId", "orderedScopeIds"], context);
		assertString(value.chainId, `${context}.chainId`);
		assertArray(value.orderedScopeIds, `${context}.orderedScopeIds`);
		if (!value.orderedScopeIds.every((scopeId) => /^\d{2}$/.test(scopeId))) {
			refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.orderedScopeIds must contain scope ids`);
		}
		return;
	}
	refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.mode is not a closed ownership mode`);
}

function assertBoundarySchema(entry) {
	assertExactKeys(entry.expectedInventory, EXPECTED_INVENTORY_KEYS, `${entry.itemId}.expectedInventory`);
	assertArray(entry.expectedInventory.sources, `${entry.itemId}.expectedInventory.sources`);
	assertArray(entry.expectedInventory.descriptors, `${entry.itemId}.expectedInventory.descriptors`);
	if (!Number.isInteger(entry.expectedInventory.descriptorCount) || entry.expectedInventory.descriptorCount < 1) {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.expectedInventory.descriptorCount must be a positive integer`);
	}
	if (!/^sha256:[0-9a-f]{64}$/.test(entry.expectedInventory.inventorySha256)) {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.expectedInventory.inventorySha256 must be normalized sha256`);
	}
	for (const [index, source] of entry.expectedInventory.sources.entries()) {
		const context = `${entry.itemId}.expectedInventory.sources[${index}]`;
		assertExactKeys(source, INVENTORY_SOURCE_KEYS, context);
		assertString(source.artifact, `${context}.artifact`);
		assertString(source.section, `${context}.section`);
		assertString(source.role, `${context}.role`);
		if (!SOURCE_ROLES.has(source.role)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.role is not closed`);
		assertExactKeys(source.selector, SELECTOR_KEYS, `${context}.selector`);
		assertString(source.selector.kind, `${context}.selector.kind`);
		assertString(source.selector.value, `${context}.selector.value`);
		if (!SELECTOR_KINDS.has(source.selector.kind)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.selector.kind is not closed`);
	}
	for (const [index, value] of entry.expectedInventory.descriptors.entries()) {
		assertDescriptorSchema(value, `${entry.itemId}.expectedInventory.descriptors[${index}]`);
	}
	assertArray(entry.attributedPaths, `${entry.itemId}.attributedPaths`);
	for (const [index, value] of entry.attributedPaths.entries()) {
		assertDescriptorSchema(value, `${entry.itemId}.attributedPaths[${index}]`, true);
	}
	assertArray(entry.allowedFamilies, `${entry.itemId}.allowedFamilies`);
	for (const [index, family] of entry.allowedFamilies.entries()) assertString(family, `${entry.itemId}.allowedFamilies[${index}]`);
	if (firstDuplicate(entry.allowedFamilies, (family) => family) !== null) refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.allowedFamilies contains a duplicate`);
	assertExactKeys(entry.edgePolicy, EDGE_POLICY_KEYS, `${entry.itemId}.edgePolicy`);
	for (const edgeClass of EDGE_POLICY_KEYS) assertEdgeClassSchema(entry.edgePolicy[edgeClass], `${entry.itemId}.edgePolicy.${edgeClass}`);
}

function assertEdgeClassSchema(value, context) {
	assertExactKeys(value, EDGE_CLASS_KEYS, context);
	for (const field of EDGE_CLASS_KEYS) {
		assertArray(value[field], `${context}.${field}`, { allowEmpty: true });
		for (const [index, surface] of value[field].entries()) {
			const surfaceContext = `${context}.${field}[${index}]`;
			assertExactKeys(surface, EDGE_SURFACE_KEYS, surfaceContext);
			for (const key of EDGE_SURFACE_KEYS) assertString(surface[key], `${surfaceContext}.${key}`);
			if (!POLICY_IDENTITY_KINDS.has(surface.identityKind)) refuse(R.MANIFEST_SCHEMA_INVALID, `${surfaceContext}.identityKind is not closed`);
		}
	}
}

function assertConsumerSchema(entry) {
	for (const field of ["canonicalProducers", "consumerSurfaces", "testCarriers", "causalBindings"]) assertArray(entry[field], `${entry.itemId}.${field}`);
	for (const [index, producer] of entry.canonicalProducers.entries()) assertProducerSchema(producer, `${entry.itemId}.canonicalProducers[${index}]`);
	for (const [index, consumer] of entry.consumerSurfaces.entries()) assertConsumerSurfaceSchema(consumer, `${entry.itemId}.consumerSurfaces[${index}]`);
	for (const [index, carrier] of entry.testCarriers.entries()) assertTestCarrierSchema(carrier, `${entry.itemId}.testCarriers[${index}]`);
	assertAliasSchema(entry.aliases, `${entry.itemId}.aliases`);
	for (const [index, binding] of entry.causalBindings.entries()) {
		const context = `${entry.itemId}.causalBindings[${index}]`;
		assertExactKeys(binding, BINDING_KEYS, context);
		assertString(binding.bindingId, `${context}.bindingId`);
		assertProducerSchema(binding.producer, `${context}.producer`);
		assertConsumerSurfaceSchema(binding.consumer, `${context}.consumer`);
		assertTestCarrierSchema(binding.test, `${context}.test`);
	}
	const duplicateBindingId = firstDuplicate(entry.causalBindings, (binding) => binding.bindingId);
	if (duplicateBindingId !== null) refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.causalBindings duplicates bindingId ${duplicateBindingId}`, entry.itemId);
	const duplicateBinding = firstDuplicate(entry.causalBindings, (binding) => JSON.stringify(canonicalObject({
		producer: binding.producer,
		consumer: binding.consumer,
		test: binding.test
	})));
	if (duplicateBinding !== null) refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId}.causalBindings contains a duplicate producer-consumer-test binding`, entry.itemId);
}

function assertProducerSchema(value, context) {
	assertExactKeys(value, PRODUCER_KEYS, context);
	for (const key of PRODUCER_KEYS) assertString(value[key], `${context}.${key}`);
	if (!LANGUAGES.has(value.language)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.language is not closed`);
	if (!new Set(["exported-symbol", "contract-token", "local-symbol", "config-key", "dom-id"]).has(value.identityKind)) {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.identityKind is not a producer identity`);
	}
}

function assertConsumerSurfaceSchema(value, context) {
	assertExactKeys(value, CONSUMER_SURFACE_KEYS, context);
	for (const key of CONSUMER_SURFACE_KEYS) assertString(value[key], `${context}.${key}`);
	if (!LANGUAGES.has(value.language)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.language is not closed`);
	if (!DEPENDENCY_EDGES.has(value.dependencyEdge)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.dependencyEdge is not closed`);
	if (!USE_KINDS.has(value.useKind)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.useKind is not closed`);
}

function assertTestCarrierSchema(value, context) {
	assertExactKeys(value, TEST_CARRIER_KEYS, context);
	for (const key of TEST_CARRIER_KEYS) assertString(value[key], `${context}.${key}`);
}

function assertAliasSchema(value, context) {
	if (!isObject(value) || !isNonEmptyString(value.mode)) refuse(R.MANIFEST_SCHEMA_INVALID, `${context} must declare a mode`);
	if (value.mode === "none") {
		assertExactKeys(value, ["mode", "reason", "scanSurfaces"], context);
		assertString(value.reason, `${context}.reason`, R.ALIAS_NONE_INVALID);
		assertArray(value.scanSurfaces, `${context}.scanSurfaces`, { code: R.ALIAS_NONE_INVALID });
		for (const [index, path] of value.scanSurfaces.entries()) assertString(path, `${context}.scanSurfaces[${index}]`, R.ALIAS_NONE_INVALID);
		if (firstDuplicate(value.scanSurfaces, (path) => path) !== null) refuse(R.ALIAS_NONE_INVALID, `${context}.scanSurfaces contains a duplicate`);
		return;
	}
	if (value.mode === "declared") {
		assertExactKeys(value, ["mode", "values"], context);
		assertArray(value.values, `${context}.values`, { code: R.ALIAS_ORIGIN_INVALID });
		for (const [index, alias] of value.values.entries()) {
			const aliasContext = `${context}.values[${index}]`;
			assertExactKeys(alias, ["identity", "origin", "scanSurfaces"], aliasContext);
			assertString(alias.identity, `${aliasContext}.identity`, R.ALIAS_ORIGIN_INVALID);
			assertArray(alias.scanSurfaces, `${aliasContext}.scanSurfaces`, { code: R.ALIAS_SCAN_INVALID });
			for (const [scanIndex, path] of alias.scanSurfaces.entries()) assertString(path, `${aliasContext}.scanSurfaces[${scanIndex}]`, R.ALIAS_SCAN_INVALID);
			if (firstDuplicate(alias.scanSurfaces, (path) => path) !== null) refuse(R.ALIAS_SCAN_INVALID, `${aliasContext}.scanSurfaces contains a duplicate`);
			assertAliasOriginSchema(alias.origin, `${aliasContext}.origin`);
		}
		if (firstDuplicate(value.values, (alias) => alias.identity) !== null) refuse(R.ALIAS_ORIGIN_INVALID, `${context}.values contains a duplicate identity`);
		return;
	}
	refuse(R.MANIFEST_SCHEMA_INVALID, `${context}.mode is not a closed alias mode`);
}

function assertAliasOriginSchema(origin, context) {
	if (!isObject(origin) || !isNonEmptyString(origin.kind)) refuse(R.ALIAS_ORIGIN_INVALID, `${context} must declare a kind`);
	const keys = origin.kind === "commit"
		? ["kind", "commit", "path", "identity"]
		: origin.kind === "artifact"
			? ["kind", "artifact", "section", "identity"]
			: origin.kind === "current-contract"
				? ["kind", "path", "identity"]
				: null;
	if (keys === null) refuse(R.ALIAS_ORIGIN_INVALID, `${context}.kind is not a closed origin kind`);
	assertExactKeys(origin, keys, context, R.ALIAS_ORIGIN_INVALID);
	for (const key of keys.filter((key) => key !== "kind")) assertString(origin[key], `${context}.${key}`, R.ALIAS_ORIGIN_INVALID);
}

function assertSafeRelativePath(path, repositoryRoot, context, code = R.PATH_REPOSITORY_ESCAPE, allowTrailingSlash = false) {
	assertString(path, context, R.PATH_MISSING);
	if (isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\")) refuse(code, `${context} must be repository-relative`);
	if (path.includes("\\") || path.includes("\0")) refuse(code, `${context} must be a safe POSIX path`);
	const parts = path.split("/");
	if (allowTrailingSlash && parts.at(-1) === "") parts.pop();
	if (parts.length === 0 || parts.some((part) => part === "" || part === "." || part === "..")) refuse(code, `${context} contains an unsafe path segment`);
	const absolute = resolve(repositoryRoot, path);
	if (!pathIsWithin(repositoryRoot, absolute)) refuse(code, `${context} resolves outside the repository`);
	return absolute;
}

function pathIsWithin(root, candidate) {
	const rel = relative(root, candidate);
	return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function relativePosix(root, candidate) {
	return relative(root, candidate).split(sep).join("/");
}

function makeRecordReader(repositoryRoot, sourceReader) {
	const cache = new Map();
	const readRecord = (path, context) => {
		const expectedPath = assertSafeRelativePath(path, repositoryRoot, context);
		if (cache.has(path)) return cache.get(path);
		const sourceRecord = sourceReader(path);
		if (!isObject(sourceRecord)) refuse(R.PATH_MISSING, `${context} does not exist`);
		if (!isNonEmptyString(sourceRecord.realPath) || !isAbsolute(sourceRecord.realPath)) refuse(R.PATH_REPOSITORY_ESCAPE, `${context} has no absolute physical path`);
		const realPath = resolve(sourceRecord.realPath);
		if (!pathIsWithin(repositoryRoot, realPath)) refuse(R.PATH_REPOSITORY_ESCAPE, `${context} resolves outside the repository`);
		if (!new Set(["file", "symlink"]).has(sourceRecord.type) || typeof sourceRecord.text !== "string") refuse(R.PATH_MISSING, `${context} is not a readable file`);
		const record = Object.freeze({ path, expectedPath, realPath, relativeRealPath: relativePosix(repositoryRoot, realPath), type: sourceRecord.type, text: sourceRecord.text });
		cache.set(path, record);
		return record;
	};
	readRecord.readCommit = sourceReader.readCommit;
	return readRecord;
}

function markdownSection(text, section, code = R.INVENTORY_SOURCE_INVALID, context = "artifact") {
	const lines = text.split(/\r?\n/);
	const starts = [];
	for (let index = 0; index < lines.length; index += 1) {
		const match = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index]);
		if (match?.[2] === section) starts.push({ index, level: match[1].length });
	}
	if (starts.length !== 1) refuse(code, `${context} section ${section} resolved ${starts.length} times`);
	const start = starts[0];
	let end = lines.length;
	for (let index = start.index + 1; index < lines.length; index += 1) {
		const heading = /^(#{1,6})\s+/.exec(lines[index]);
		if (heading && heading[1].length <= start.level) { end = index; break; }
	}
	return lines.slice(start.index + 1, end);
}

function parseMarkdownRow(line, context = "Markdown table row") {
	const trimmed = line.trim();
	if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) refuse(R.INVENTORY_SOURCE_INVALID, `${context} must start and end with a pipe`);
	const cells = [];
	let cell = "";
	for (let index = 1; index < trimmed.length - 1; index += 1) {
		const char = trimmed[index];
		if (char === "\\" && trimmed[index + 1] === "|") {
			cell += "|";
			index += 1;
			continue;
		}
		if (char === "\\" && index === trimmed.length - 2) refuse(R.INVENTORY_SOURCE_INVALID, `${context} has a dangling escape`);
		if (char === "|") {
			cells.push(cell.trim());
			cell = "";
			continue;
		}
		cell += char;
	}
	cells.push(cell.trim());
	return cells;
}

function stripSingleCodeSpan(value) {
	const match = /^(`+)([\s\S]*)\1$/.exec(value);
	return match ? match[2] : value;
}

function registrySourceRole(row) {
	if (row.identityKind === "whole-file") return "owned-paths";
	if (row.role === "test" || row.role === "canary") return "test-identities";
	if (["support", "fixture", "validator", "command-registry", "planning"].includes(row.role)) return "edge-surfaces";
	return "owned-identities";
}

function registrySelectorValue(value) {
	return JSON.stringify([value.path, value.identityKind, value.identity]);
}

function decodeRegistrySelector(value, context) {
	let parsed;
	try { parsed = JSON.parse(value); } catch { parsed = null; }
	if (!Array.isArray(parsed) || parsed.length !== 3 || parsed.some((part) => !isNonEmptyString(part))) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${context} must encode one closed registry tuple`);
	}
	return { path: parsed[0], identityKind: parsed[1], identity: parsed[2] };
}

function registrySource(scopeId, descriptorValue, role) {
	return {
		artifact: BOUNDARY_REGISTRY_ARTIFACT,
		section: `Scope ${scopeId}`,
		selector: { kind: "registry-row", value: registrySelectorValue(descriptorValue) },
		role
	};
}

function parseMarkerPair(identity, context) {
	let markers;
	try { markers = JSON.parse(identity); } catch { markers = null; }
	if (!Array.isArray(markers) || markers.length !== 2 || markers.some((marker) => !isNonEmptyString(marker)) || markers[0] === markers[1]) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${context} marker-pair must be two distinct JSON strings`);
	}
	return markers;
}

function parseRegistryOwnership(mode, chainId, orderedScopeIds, scopeId, context) {
	if (mode === "exclusive") {
		if (chainId !== "—" || orderedScopeIds !== "—") refuse(R.INVENTORY_SOURCE_INVALID, `${context} exclusive ownership must use the em-dash sentinel`);
		return { mode, ownerScopeId: scopeId };
	}
	if (mode !== "ordered-evolution") refuse(R.INVENTORY_SOURCE_INVALID, `${context} has an unknown ownership mode`);
	if (!isNonEmptyString(chainId) || chainId === "—") refuse(R.INVENTORY_SOURCE_INVALID, `${context} ordered evolution needs a chain id`);
	if (!/^\d{2}(?:,\d{2})+$/.test(orderedScopeIds)) refuse(R.INVENTORY_SOURCE_INVALID, `${context} ordered scope ids are malformed`);
	const members = orderedScopeIds.split(",");
	if (new Set(members).size !== members.length || !members.includes(scopeId)) refuse(R.INVENTORY_SOURCE_INVALID, `${context} ordered evolution has duplicate or missing members`);
	return { mode, chainId, orderedScopeIds: members };
}

function parseRegistryDataRow(line, scopeId, rowIndex) {
	const context = `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} row ${rowIndex}`;
	const cells = parseMarkdownRow(line, context);
	if (cells.length !== REGISTRY_COLUMNS.length) refuse(R.INVENTORY_SOURCE_INVALID, `${context} must contain exactly seven decoded cells`);
	if (cells.some((cell) => cell.length === 0 || cell === "N/A" || cell === "none")) refuse(R.INVENTORY_SOURCE_INVALID, `${context} contains a forbidden empty or substitute sentinel`);
	const [path, identityKind, rawIdentity, role, ownershipMode, chainId, orderedScopeIds] = cells.map(stripSingleCodeSpan);
	if (!IDENTITY_KINDS.has(identityKind)) refuse(R.INVENTORY_SOURCE_INVALID, `${context} uses unknown identity kind ${identityKind}`);
	if (!REGISTRY_ROLES.has(role)) refuse(R.INVENTORY_SOURCE_INVALID, `${context} uses unknown role ${role}`);
	const identity = identityKind === "whole-file" ? "whole-file" : rawIdentity;
	if (identityKind === "whole-file" && rawIdentity !== "—") refuse(R.INVENTORY_SOURCE_INVALID, `${context} whole-file identity must use the em-dash sentinel`);
	if (identityKind !== "whole-file" && rawIdentity === "—") refuse(R.INVENTORY_SOURCE_INVALID, `${context} non-whole-file identity cannot use the em-dash sentinel`);
	if (identityKind === "marker-pair") parseMarkerPair(identity, context);
	const descriptorValue = { path, identityKind, identity };
	return {
		descriptor: descriptorValue,
		role,
		ownership: parseRegistryOwnership(ownershipMode, chainId, orderedScopeIds, scopeId, context),
		source: registrySource(scopeId, descriptorValue, registrySourceRole({ identityKind, role }))
	};
}

function registrySectionRows(lines, headingIndex, endIndex, scopeId) {
	const body = lines.slice(headingIndex + 1, endIndex);
	if (body.some((line) => /^#{1,6}\s+/.test(line))) refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} contains an unknown nested heading`);
	const headers = [];
	for (let index = 0; index < body.length - 1; index += 1) {
		if (!body[index].trim().startsWith("|") || !body[index + 1].trim().startsWith("|")) continue;
		const header = parseMarkdownRow(body[index], `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} header`);
		if (!sameStringArray(header, REGISTRY_COLUMNS)) continue;
		const separator = parseMarkdownRow(body[index + 1], `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} separator`);
		if (separator.length !== REGISTRY_COLUMNS.length || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) {
			refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} has a malformed table separator`);
		}
		headers.push(index);
	}
	if (headers.length !== 1) refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} must contain exactly one closed registry table`);
	const rows = [];
	for (let index = headers[0] + 2; index < body.length && body[index].trim().startsWith("|"); index += 1) {
		rows.push(parseRegistryDataRow(body[index], scopeId, rows.length + 1));
	}
	if (rows.length === 0) refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} registry table is empty`);
	return rows;
}

function parseBoundaryRegistry(readRecord) {
	const record = readRecord(BOUNDARY_REGISTRY_PATH, "boundary attribution registry");
	const lines = record.text.split(/\r?\n/);
	if (lines[0] !== "# Feature 008 Boundary Attribution Registry") refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} has an unexpected document heading`);
	const eofRows = lines.map((line, index) => line === "<!-- registry-eof -->" ? index : -1).filter((index) => index >= 0);
	if (eofRows.length !== 1 || lines.slice(eofRows[0] + 1).some((line) => line.trim().length > 0)) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} must end at one registry-eof marker`);
	}
	const levelTwo = [];
	for (let index = 0; index < eofRows[0]; index += 1) {
		const heading = /^##\s+(.+?)\s*$/.exec(lines[index]);
		if (heading) levelTwo.push({ index, title: heading[1] });
	}
	const expectedTitles = ["Closed Registry Contract", ...BOUNDARY_SCOPE_IDS.map((scopeId) => `Scope ${scopeId}`)];
	if (!sameStringArray(levelTwo.map(({ title }) => title), expectedTitles)) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} level-two headings do not equal the closed registry sequence`);
	}
	const result = new Map();
	for (let index = 1; index < levelTwo.length; index += 1) {
		const scopeId = /^Scope (\d{2})$/.exec(levelTwo[index].title)?.[1];
		if (!scopeId) refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} has a malformed scope heading`);
		const endIndex = levelTwo[index + 1]?.index ?? eofRows[0];
		const rows = registrySectionRows(lines, levelTwo[index].index, endIndex, scopeId);
		const duplicate = firstDuplicate(rows, (row) => descriptorKey(row.descriptor));
		if (duplicate !== null) refuse(R.INVENTORY_SOURCE_INVALID, `${BOUNDARY_REGISTRY_PATH} Scope ${scopeId} repeats a path-and-identity tuple`);
		const descriptors = normalizedDescriptors(rows.map((row) => row.descriptor));
		const ownershipByDescriptor = new Map(rows.map((row) => [descriptorKey(row.descriptor), row.ownership]));
		const registryRoleByDescriptor = new Map(rows.map((row) => [descriptorKey(row.descriptor), row.role]));
		result.set(scopeId, {
			descriptors,
			sources: rows.map((row) => row.source).sort(sourceOrder),
			attributedPaths: descriptors.map((value) => ({ ...value, ownership: ownershipByDescriptor.get(descriptorKey(value)) })),
			registryRoleByDescriptor
		});
	}
	return result;
}

const FIXTURE_BOUNDARY_SOURCES = Object.freeze([
	{ role: "owned-paths", section: "Boundary Owned Paths" },
	{ role: "owned-identities", section: "Boundary Owned Identities" },
	{ role: "test-identities", section: "Boundary Test Identities" },
	{ role: "edge-surfaces", section: "Boundary Edge Surfaces" }
]);

function isInjectedFixtureSource(sourceReader) {
	if (typeof sourceReader.listPaths !== "function") return false;
	let paths;
	try { paths = sourceReader.listPaths(); } catch { return false; }
	if (!Array.isArray(paths) || paths.includes(BOUNDARY_REGISTRY_PATH)) return false;
	return BOUNDARY_SCOPE_IDS.every((scopeId) => paths.includes(`${FEATURE_ROOT}/${SCOPE_ARTIFACTS[scopeId]}`))
		&& BOUNDARY_SCOPE_IDS.every((scopeId) => paths.includes(`owned/scope-${scopeId}.mjs`));
}

function deriveInjectedFixtureBoundaryAuthority(readRecord) {
	const result = new Map();
	for (const scopeId of BOUNDARY_SCOPE_IDS) {
		const artifact = SCOPE_ARTIFACTS[scopeId];
		const sources = FIXTURE_BOUNDARY_SOURCES.map(({ role, section }) => ({
			artifact,
			section,
			selector: { kind: "table-column", value: "Descriptor" },
			role
		}));
		const descriptors = normalizedDescriptors(sources.map((source, index) => deriveSourceDescriptor(null, source, index, readRecord)));
		const registryRoleByDescriptor = new Map(descriptors.map((value) => [descriptorKey(value), "fixture"]));
		result.set(scopeId, { descriptors, sources: sources.sort(sourceOrder), attributedPaths: null, registryRoleByDescriptor });
	}
	return result;
}

function deriveBoundaryAuthority(readRecord, sourceReader) {
	if (isInjectedFixtureSource(sourceReader)) return deriveInjectedFixtureBoundaryAuthority(readRecord);
	return parseBoundaryRegistry(readRecord);
}

function deriveAuthority(readRecord) {
	const pairs = [];
	const rows = new Map();
	const expectedKindsByScope = new Map();
	for (const { scopeId, kind } of EXPECTED_PAIRS) {
		if (!expectedKindsByScope.has(scopeId)) expectedKindsByScope.set(scopeId, []);
		expectedKindsByScope.get(scopeId).push(kind);
	}
	for (const scopeId of Object.keys(SCOPE_ARTIFACTS).sort(compareText)) {
		const artifact = SCOPE_ARTIFACTS[scopeId];
		const path = `${FEATURE_ROOT}/${artifact}`;
		const record = readRecord(path, `authority scope ${scopeId}`);
		const section = definitionOfDoneSection(scopeId);
		const scopedRows = markdownSection(record.text, section, R.INVENTORY_SOURCE_INVALID, path)
			.map((line) => /^- \[[ xX]\] (.+)$/.exec(line)?.[1]).filter(Boolean);
		for (const kind of expectedKindsByScope.get(scopeId) ?? []) {
			const expected = stableRowIdentity(scopeId, kind);
			const matching = scopedRows.filter((row) => row === expected || row.startsWith(`${expected}.`) || row.startsWith(`${expected},`) || row.startsWith(`${expected} →`));
			if (matching.length > 1) refuse(R.INVENTORY_SOURCE_INVALID, `${path} has ambiguous ${kind} checklist rows`);
			if (matching.length === 1) {
				pairs.push({ scopeId, kind });
				rows.set(`${scopeId}:${kind}`, { artifact, section, rowIdentity: matching[0] });
			}
		}
	}
	return { pairs: pairs.sort(compareScopeKind), rows };
}

function pairKey(value) { return `${value.scopeId}/${value.kind}`; }
function sameStringArray(left, right) { return left.length === right.length && left.every((value, index) => value === right[index]); }

function assertPairSet(entries, authority) {
	if (firstDuplicate(entries, (entry) => entry.itemId) !== null || firstDuplicate(entries, (entry) => `${entry.scopeId}:${entry.kind}`) !== null) {
		refuse(R.CANONICAL_PAIR_SET_MISMATCH, "manifest contains a duplicate item or pair");
	}
	const expected = EXPECTED_PAIRS.map(pairKey);
	const derived = authority.pairs.map(pairKey);
	const declared = [...entries].sort(compareScopeKind).map(pairKey);
	if (!sameStringArray(derived, expected)) {
		const missing = expected.filter((value) => !derived.includes(value));
		const extra = derived.filter((value) => !expected.includes(value));
		refuse(R.CANONICAL_PAIR_SET_MISMATCH, `authority does not derive the canonical 41-pair set; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`);
	}
	if (!sameStringArray(declared, expected)) refuse(R.CANONICAL_PAIR_SET_MISMATCH, "manifest entries do not equal the authority-derived 41-pair set");
}

function validateClaimSource(entry, authority) {
	const expected = authority.rows.get(`${entry.scopeId}:${entry.kind}`);
	if (!expected || entry.claimSource.artifact !== expected.artifact || entry.claimSource.section !== expected.section) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${entry.itemId} claimSource does not match the canonical artifact and section`, entry.itemId);
	}
	if (entry.claimSource.rowIdentity !== expected.rowIdentity || entry.dodClaim !== expected.rowIdentity) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${entry.itemId} must use the complete exact checklist row`, entry.itemId);
	}
}

function descriptorOrder(left, right) {
	return compareText(left.path, right.path) || compareText(left.identityKind, right.identityKind) || compareText(left.identity, right.identity);
}

function normalizedDescriptors(values) {
	return values.map(({ path, identityKind, identity }) => ({ path, identityKind, identity })).sort(descriptorOrder);
}

function descriptorKey(value) { return `${value.path}\u0000${value.identityKind}\u0000${value.identity}`; }
function encodedDescriptor(value) { return `${value.path} :: ${value.identityKind} :: ${value.identity}`; }

function decodedDescriptor(value, context) {
	const parts = value.split(" :: ");
	if (parts.length !== 3 || parts.some((part) => !isNonEmptyString(part))) refuse(R.INVENTORY_SOURCE_INVALID, `${context} must encode path, identity kind, and identity`);
	const output = { path: parts[0], identityKind: parts[1], identity: parts[2] };
	if (!IDENTITY_KINDS.has(output.identityKind)) refuse(R.INVENTORY_SOURCE_INVALID, `${context} uses an unknown identity kind`);
	return output;
}

function inventorySha256(values) {
	return `sha256:${createHash("sha256").update(JSON.stringify(normalizedDescriptors(values).map((value) => canonicalObject(value)))).digest("hex")}`;
}

function sourceOrder(left, right) {
	return compareText(left.artifact, right.artifact) || compareText(left.section, right.section)
		|| compareText(left.selector.kind, right.selector.kind) || compareText(left.selector.value, right.selector.value)
		|| compareText(left.role, right.role);
}

function deriveInventory(entry, readRecord, boundaryAuthority) {
	const authority = boundaryAuthority.get(entry.scopeId);
	if (!authority) refuse(R.INVENTORY_SOURCE_INVALID, `${entry.itemId} has no boundary registry section`, entry.itemId);
	const orderedSources = [...entry.expectedInventory.sources].sort(sourceOrder);
	if (JSON.stringify(canonicalObject(orderedSources)) !== JSON.stringify(canonicalObject(authority.sources))) {
		refuse(R.INVENTORY_SOURCE_INVALID, `${entry.itemId} inventory sources differ from independently parsed authority`, entry.itemId);
	}
	const derived = orderedSources.map((source, index) => deriveSourceDescriptor(entry, source, index, readRecord, authority));
	if (firstDuplicate(derived, descriptorKey) !== null) refuse(R.INVENTORY_DESCRIPTOR_MISMATCH, `${entry.itemId} derives a duplicate descriptor`, entry.itemId);
	const normalized = normalizedDescriptors(derived);
	if (JSON.stringify(normalized) !== JSON.stringify(authority.descriptors)) {
		refuse(R.INVENTORY_DESCRIPTOR_MISMATCH, `${entry.itemId} source derivation differs from boundary authority`, entry.itemId);
	}
	return normalized;
}

function deriveSourceDescriptor(entry, source, index, readRecord, authority = null) {
	const itemId = entry?.itemId ?? "injected-fixture-boundary";
	const context = `${itemId}.expectedInventory.sources[${index}]`;
	const artifactPath = `${FEATURE_ROOT}/${source.artifact}`;
	const record = readRecord(artifactPath, `${context}.artifact`);
	if (source.selector.kind === "registry-row") {
		if (source.artifact !== BOUNDARY_REGISTRY_ARTIFACT || source.section !== `Scope ${entry.scopeId}` || authority === null) {
			refuse(R.INVENTORY_SOURCE_INVALID, `${context} is not bound to the exact scope registry section`, itemId);
		}
		const value = decodeRegistrySelector(source.selector.value, `${context}.selector.value`);
		const matches = authority.descriptors.filter((candidate) => descriptorKey(candidate) === descriptorKey(value));
		if (matches.length !== 1) refuse(R.INVENTORY_SOURCE_INVALID, `${context} does not select exactly one authoritative registry row`, itemId);
		return value;
	}
	const section = markdownSection(record.text, source.section, R.INVENTORY_SOURCE_INVALID, artifactPath);
	if (source.selector.kind === "table-column") return deriveTableColumnDescriptor(section, source.selector.value, context);
	refuse(R.INVENTORY_SOURCE_INVALID, `${context} uses an unsupported selector`, itemId);
}

function deriveTableColumnDescriptor(lines, columnName, context) {
	const tables = [];
	for (let index = 0; index < lines.length - 1; index += 1) {
		if (!lines[index].trim().startsWith("|") || !/^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[index + 1].trim())) continue;
		const headers = parseMarkdownRow(lines[index]);
		const column = headers.indexOf(columnName);
		if (column < 0) continue;
		const values = [];
		for (let rowIndex = index + 2; rowIndex < lines.length && lines[rowIndex].trim().startsWith("|"); rowIndex += 1) {
			const row = parseMarkdownRow(lines[rowIndex]);
			if (row[column] !== undefined) values.push(stripSingleCodeSpan(row[column]));
		}
		tables.push(values);
	}
	if (tables.length !== 1 || tables[0].length !== 1) refuse(R.INVENTORY_SOURCE_INVALID, `${context} table column ${columnName} must resolve exactly one descriptor`);
	return decodedDescriptor(tables[0][0], context);
}

function validateBoundaryInventory(entry, readRecord, repositoryRoot, boundaryAuthority) {
	const derived = deriveInventory(entry, readRecord, boundaryAuthority);
	const cached = normalizedDescriptors(entry.expectedInventory.descriptors);
	const attributed = normalizedDescriptors(entry.attributedPaths);
	if (JSON.stringify(cached) !== JSON.stringify(derived) || JSON.stringify(attributed) !== JSON.stringify(derived)) {
		refuse(R.INVENTORY_DESCRIPTOR_MISMATCH, `${entry.itemId} derived, cached, and attributed descriptor sets differ`, entry.itemId);
	}
	if (entry.expectedInventory.descriptorCount !== derived.length || entry.expectedInventory.inventorySha256 !== inventorySha256(derived)) {
		refuse(R.INVENTORY_DESCRIPTOR_MISMATCH, `${entry.itemId} descriptor count or digest disagrees with the normalized derived set`, entry.itemId);
	}
	const families = validateFamilies(entry, repositoryRoot);
	for (const value of entry.attributedPaths) {
		const record = readRecord(value.path, `${entry.itemId}.attributedPaths ${value.path}`);
		validateDescriptorFamily(entry, value.path, record.relativeRealPath, families);
		validateStructuralIdentity(value, record.text, entry.itemId);
	}
	return derived;
}

function validateFamilies(entry, repositoryRoot) {
	return [...entry.allowedFamilies].sort(compareText).map((family) => {
		assertSafeRelativePath(family, repositoryRoot, `${entry.itemId}.allowedFamilies`, R.PATH_FAMILY_ESCAPE, family.endsWith("/"));
		return family;
	});
}

function familyMatches(path, family) { return family.endsWith("/") ? path.startsWith(family) : path === family; }

function validateDescriptorFamily(entry, lexicalPath, physicalPath, families) {
	const lexicalFamilies = families.filter((family) => familyMatches(lexicalPath, family));
	if (lexicalFamilies.length === 0 || !lexicalFamilies.some((family) => familyMatches(physicalPath, family))) {
		refuse(R.PATH_FAMILY_ESCAPE, `${entry.itemId} path ${lexicalPath} escapes its declared lexical family`, entry.itemId);
	}
}

function occurrenceCount(text, token) { return token.length === 0 ? 0 : text.split(token).length - 1; }

function configKeyExists(text, dottedKey) {
	let parsed;
	try { parsed = JSON.parse(text); } catch { return false; }
	let cursor = parsed;
	for (const segment of dottedKey.split(".")) {
		if (!isObject(cursor) || !Object.hasOwn(cursor, segment)) return false;
		cursor = cursor[segment];
	}
	return true;
}

function javascriptStructuralRegions(text) {
	const scripts = [...text.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
	return scripts.length > 0 ? scripts : [text];
}

function immediateBraceContainers(tokens) {
	const containers = new Array(tokens.length).fill(-1);
	const stack = [];
	for (let index = 0; index < tokens.length; index += 1) {
		if (tokens[index].value === "}") stack.pop();
		containers[index] = stack.at(-1) ?? -1;
		if (tokens[index].value === "{") stack.push(index);
	}
	return containers;
}

function staticCollectionRow(tokens, first, last) {
	const opener = tokens[first]?.value;
	const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
	if (closer === null || matchingToken(tokens, first, opener, closer) !== last - 1) return null;
	const members = topLevelArgumentRanges(tokens, first, last - 1);
	if (opener === "[") {
		return {
			kind: "tuple",
			values: members.map(([memberFirst, memberLast]) =>
				memberLast === memberFirst + 1 && tokens[memberFirst].type === "string" ? tokens[memberFirst].value : null)
		};
	}
	const values = new Map();
	for (const [memberFirst, memberLast] of members) {
		const keyToken = tokens[memberFirst];
		if (!new Set(["identifier", "string"]).has(keyToken?.type) || tokens[memberFirst + 1]?.value !== ":") return null;
		if (memberLast !== memberFirst + 3 || tokens[memberFirst + 2]?.type !== "string" || values.has(keyToken.value)) return null;
		values.set(keyToken.value, tokens[memberFirst + 2].value);
	}
	return { kind: "record", values };
}

function staticCollectionDeclarations(tokens, containers) {
	const declarations = [];
	for (let index = 0; index < tokens.length - 3; index += 1) {
		if (!new Set(["const", "let", "var"]).has(tokens[index].value)
			|| tokens[index + 1]?.type !== "identifier"
			|| tokens[index + 2]?.value !== "="
			|| tokens[index + 3]?.value !== "[") continue;
		const close = matchingToken(tokens, index + 3, "[", "]");
		if (close < 0) continue;
		let rows;
		try {
			rows = topLevelArgumentRanges(tokens, index + 3, close)
				.map(([first, last]) => staticCollectionRow(tokens, first, last));
		} catch (error) {
			if (error instanceof JavaScriptLexicalAmbiguity) continue;
			throw error;
		}
		declarations.push({ name: tokens[index + 1].value, start: index, end: close, container: containers[index], rows });
	}
	return declarations;
}

function singleCallbackArgument(tokens, first, last) {
	let cursor = first;
	if (tokens[cursor]?.value === "async") cursor += 1;
	let parameter = null;
	let bodyStart = -1;
	if (tokens[cursor]?.value === "function") {
		cursor += 1;
		if (tokens[cursor]?.type === "identifier") cursor += 1;
		if (tokens[cursor]?.value !== "(") return null;
		const parametersEnd = matchingToken(tokens, cursor, "(", ")");
		if (parametersEnd < 0 || parametersEnd !== cursor + 2 || tokens[cursor + 1]?.type !== "identifier") return null;
		parameter = tokens[cursor + 1].value;
		bodyStart = parametersEnd + 1;
	} else {
		if (tokens[cursor]?.type === "identifier") {
			parameter = tokens[cursor].value;
			cursor += 1;
		} else if (tokens[cursor]?.value === "(") {
			const parametersEnd = matchingToken(tokens, cursor, "(", ")");
			if (parametersEnd < 0 || parametersEnd !== cursor + 2 || tokens[cursor + 1]?.type !== "identifier") return null;
			parameter = tokens[cursor + 1].value;
			cursor = parametersEnd + 1;
		} else return null;
		if (tokens[cursor]?.value !== "=>") return null;
		bodyStart = cursor + 1;
	}
	if (tokens[bodyStart]?.value !== "{") return null;
	const bodyEnd = matchingToken(tokens, bodyStart, "{", "}");
	if (bodyEnd < 0 || bodyEnd !== last - 1) return null;
	return { parameter, bodyStart, bodyEnd };
}

function selectedRecordMember(tokens, start, parameter) {
	if (tokens[start]?.value !== parameter) return null;
	if (tokens[start + 1]?.value === "." && tokens[start + 2]?.type === "identifier") {
		return { selector: { kind: "record", key: tokens[start + 2].value }, end: start + 3 };
	}
	if (tokens[start + 1]?.value !== "[") return null;
	const member = tokens[start + 2];
	if (tokens[start + 3]?.value !== "]") return null;
	if (member.type === "string") return { selector: { kind: "record", key: member.value }, end: start + 4 };
	if (member.type === "number" && /^(?:0|[1-9]\d*)$/.test(member.value)) {
		return { selector: { kind: "tuple", key: Number(member.value) }, end: start + 4 };
	}
	return null;
}

function callbackElementConstructions(tokens, containers, callback) {
	const creations = [];
	for (let index = callback.bodyStart + 1; index < callback.bodyEnd; index += 1) {
		if (containers[index] !== callback.bodyStart
			|| !new Set(["const", "let", "var"]).has(tokens[index].value)
			|| tokens[index + 1]?.type !== "identifier"
			|| tokens[index + 2]?.value !== "="
			|| tokens[index + 3]?.value !== "document"
			|| tokens[index + 4]?.value !== "."
			|| tokens[index + 5]?.value !== "createElement"
			|| tokens[index + 6]?.value !== "(") continue;
		const callEnd = matchingToken(tokens, index + 6, "(", ")");
		const args = callEnd < 0 ? [] : topLevelArgumentRanges(tokens, index + 6, callEnd);
		if (args.length !== 1 || args[0][1] !== args[0][0] + 1 || tokens[args[0][0]].type !== "string") continue;
		creations.push({ name: tokens[index + 1].value, index });
	}
	const constructions = [];
	for (const creation of creations) {
		const assignments = [];
		const appends = [];
		for (let index = callback.bodyStart + 1; index < callback.bodyEnd; index += 1) {
			if (containers[index] !== callback.bodyStart) continue;
			if (tokens[index].value === creation.name
				&& tokens[index + 1]?.value === "."
				&& tokens[index + 2]?.value === "id"
				&& tokens[index + 3]?.value === "=") {
				const selected = selectedRecordMember(tokens, index + 4, callback.parameter);
				if (selected !== null && tokens[selected.end]?.value === ";") assignments.push({ index, selector: selected.selector });
			}
			if (new Set(["append", "appendChild"]).has(tokens[index].value)
				&& tokens[index - 1]?.value === "."
				&& tokens[index - 2]?.type === "identifier"
				&& tokens[index + 1]?.value === "(") {
				const callEnd = matchingToken(tokens, index + 1, "(", ")");
				const args = callEnd < 0 ? [] : topLevelArgumentRanges(tokens, index + 1, callEnd);
				if (args.length === 1 && args[0][1] === args[0][0] + 1 && tokens[args[0][0]].value === creation.name) {
					appends.push({ index });
				}
			}
		}
		if (assignments.length === 1 && appends.length === 1
			&& creation.index < assignments[0].index && assignments[0].index < appends[0].index) {
			constructions.push(assignments[0].selector);
		}
	}
	return constructions;
}

function selectedCollectionValues(declaration, selector) {
	if (declaration.rows.length === 0 || declaration.rows.some((row) => row === null || row.kind !== selector.kind)) return null;
	const values = declaration.rows.map((row) => selector.kind === "tuple" ? row.values[selector.key] : row.values.get(selector.key));
	return values.every((value) => typeof value === "string") ? values : null;
}

function htmlStartTagAttributeValues(startTag, wantedName) {
	const values = [];
	let index = 1;
	while (/[A-Za-z0-9:-]/.test(startTag[index] ?? "")) index += 1;
	while (index < startTag.length - 1) {
		while (/\s/.test(startTag[index] ?? "")) index += 1;
		if (startTag[index] === "/" || startTag[index] === ">") break;
		const nameStart = index;
		while (index < startTag.length && !/[\s=/>]/.test(startTag[index])) index += 1;
		const name = startTag.slice(nameStart, index).toLowerCase();
		while (/\s/.test(startTag[index] ?? "")) index += 1;
		let value = null;
		if (startTag[index] === "=") {
			index += 1;
			while (/\s/.test(startTag[index] ?? "")) index += 1;
			const quote = startTag[index];
			if (quote === "\"" || quote === "'") {
				const valueStart = ++index;
				while (index < startTag.length && startTag[index] !== quote) index += 1;
				value = startTag.slice(valueStart, index);
				if (startTag[index] === quote) index += 1;
			} else {
				const valueStart = index;
				while (index < startTag.length && !/[\s>]/.test(startTag[index])) index += 1;
				value = startTag.slice(valueStart, index);
			}
		}
		if (name === wantedName) values.push(value);
	}
	return values;
}

function literalHtmlDomIdDefinitionCount(text, identity) {
	const counts = memoizedTextAnalysis("literalHtmlDomIds", text, () => {
		const values = new Map();
		const rawTextTags = new Set(["script", "style", "textarea", "title"]);
		const lowerText = text.toLowerCase();
		let cursor = 0;
		while (cursor < text.length) {
			const start = text.indexOf("<", cursor);
			if (start < 0) break;
			if (text.startsWith("<!--", start)) {
				const commentEnd = text.indexOf("-->", start + 4);
				cursor = commentEnd < 0 ? text.length : commentEnd + 3;
				continue;
			}
			if (!/[A-Za-z]/.test(text[start + 1] ?? "")) {
				cursor = start + 1;
				continue;
			}
			let nameEnd = start + 2;
			while (/[A-Za-z0-9:-]/.test(text[nameEnd] ?? "")) nameEnd += 1;
			const tagName = text.slice(start + 1, nameEnd).toLowerCase();
			let quote = null;
			let end = nameEnd;
			for (; end < text.length; end += 1) {
				const char = text[end];
				if (quote !== null) {
					if (char === quote) quote = null;
					continue;
				}
				if (char === "\"" || char === "'") quote = char;
				else if (char === ">") break;
			}
			if (end >= text.length) break;
			const startTag = text.slice(start, end + 1);
			for (const value of htmlStartTagAttributeValues(startTag, "id")) {
				if (value !== null) values.set(value, (values.get(value) ?? 0) + 1);
			}
			if (rawTextTags.has(tagName)) {
				const closingStart = lowerText.indexOf(`</${tagName}`, end + 1);
				const closingEnd = closingStart < 0 ? -1 : text.indexOf(">", closingStart + tagName.length + 2);
				cursor = closingEnd < 0 ? text.length : closingEnd + 1;
			} else cursor = end + 1;
		}
		return values;
	});
	return counts.get(identity) ?? 0;
}

function staticIdentifierArray(tokens, openIndex) {
	if (tokens[openIndex]?.value !== "[") return null;
	const closeIndex = matchingToken(tokens, openIndex, "[", "]");
	if (closeIndex < 0) return null;
	const members = topLevelArgumentRanges(tokens, openIndex, closeIndex);
	if (members.length === 0 || members.some(([first, last]) => last !== first + 1 || tokens[first].type !== "identifier")) return null;
	return { closeIndex, names: members.map(([first]) => tokens[first].value) };
}

function callbackDirectlyAppendsParameter(tokens, containers, callback) {
	let count = 0;
	for (let index = callback.bodyStart + 1; index < callback.bodyEnd; index += 1) {
		if (containers[index] !== callback.bodyStart
			|| !new Set(["append", "appendChild"]).has(tokens[index].value)
			|| tokens[index - 1]?.value !== "."
			|| tokens[index - 2]?.type !== "identifier"
			|| tokens[index + 1]?.value !== "(") continue;
		const callEnd = matchingToken(tokens, index + 1, "(", ")");
		const args = callEnd < 0 ? [] : topLevelArgumentRanges(tokens, index + 1, callEnd);
		if (args.length === 1 && args[0][1] === args[0][0] + 1 && tokens[args[0][0]].value === callback.parameter) count += 1;
	}
	return count === 1;
}

function hasStaticArrayForwardedAppend(tokens, containers, variable, container, afterIndex) {
	for (let index = afterIndex + 1; index < tokens.length - 3; index += 1) {
		if (containers[index] !== container || tokens[index].value !== "[") continue;
		const array = staticIdentifierArray(tokens, index);
		if (array === null || array.names.filter((name) => name === variable).length !== 1
			|| tokens[array.closeIndex + 1]?.value !== "."
			|| tokens[array.closeIndex + 2]?.value !== "forEach"
			|| tokens[array.closeIndex + 3]?.value !== "(") continue;
		const callOpen = array.closeIndex + 3;
		const callEnd = matchingToken(tokens, callOpen, "(", ")");
		const args = callEnd < 0 ? [] : topLevelArgumentRanges(tokens, callOpen, callEnd);
		const callback = args.length === 1 ? singleCallbackArgument(tokens, args[0][0], args[0][1]) : null;
		if (callback !== null && callbackDirectlyAppendsParameter(tokens, containers, callback)) return true;
	}
	return false;
}

function directlyConstructedDomIdDefinitionCount(text, identity) {
	const counts = memoizedTextAnalysis("directDomIds", text, () => {
		const values = new Map();
		for (const region of javascriptStructuralRegions(text)) {
			let tokens;
			try { tokens = tokenizeJavaScript(region); }
			catch (error) {
				if (error instanceof JavaScriptLexicalAmbiguity) continue;
				throw error;
			}
			const containers = immediateBraceContainers(tokens);
			for (let index = 0; index < tokens.length - 7; index += 1) {
				if (!new Set(["const", "let", "var"]).has(tokens[index].value)
					|| tokens[index + 1]?.type !== "identifier"
					|| tokens[index + 2]?.value !== "="
					|| tokens[index + 3]?.value !== "document"
					|| tokens[index + 4]?.value !== "."
					|| tokens[index + 5]?.value !== "createElement"
					|| tokens[index + 6]?.value !== "(") continue;
				const callEnd = matchingToken(tokens, index + 6, "(", ")");
				if (callEnd !== index + 8 || tokens[index + 7]?.type !== "string") continue;
				const variable = tokens[index + 1].value;
				const container = containers[index];
				const assignments = new Map();
				const appends = [];
				for (let cursor = callEnd + 1; cursor < tokens.length; cursor += 1) {
					if (containers[cursor] !== container) continue;
					if (tokens[cursor].value === variable
						&& tokens[cursor + 1]?.value === "."
						&& tokens[cursor + 2]?.value === "id"
						&& tokens[cursor + 3]?.value === "="
						&& tokens[cursor + 4]?.type === "string") {
						const assignedIdentity = tokens[cursor + 4].value;
						if (!assignments.has(assignedIdentity)) assignments.set(assignedIdentity, []);
						assignments.get(assignedIdentity).push(cursor);
					}
					if (new Set(["append", "appendChild"]).has(tokens[cursor].value)
						&& tokens[cursor - 1]?.value === "."
						&& tokens[cursor + 1]?.value === "(") {
						const appendEnd = matchingToken(tokens, cursor + 1, "(", ")");
						if (appendEnd === cursor + 3 && tokens[cursor + 2]?.value === variable) appends.push(cursor);
					}
				}
				for (const [assignedIdentity, indexes] of assignments) {
					if (indexes.length !== 1) continue;
					const assignmentIndex = indexes[0];
					if (appends.some((appendIndex) => appendIndex > assignmentIndex)
						|| hasStaticArrayForwardedAppend(tokens, containers, variable, container, assignmentIndex)) {
						values.set(assignedIdentity, (values.get(assignedIdentity) ?? 0) + 1);
					}
				}
			}
		}
		return values;
	});
	return counts.get(identity) ?? 0;
}

function dataDrivenDomIdDefinitionCount(text, identity) {
	const counts = memoizedTextAnalysis("dataDrivenDomIds", text, () => {
		const identities = new Map();
		for (const region of javascriptStructuralRegions(text)) {
			let tokens;
			try { tokens = tokenizeJavaScript(region); }
			catch (error) {
				if (error instanceof JavaScriptLexicalAmbiguity) continue;
				throw error;
			}
			const containers = immediateBraceContainers(tokens);
			const declarations = staticCollectionDeclarations(tokens, containers);
			const collectionNames = new Set(declarations.map((declaration) => declaration.name));
			for (let index = 0; index < tokens.length - 3; index += 1) {
				if (tokens[index].type !== "identifier"
					|| !collectionNames.has(tokens[index].value)
					|| tokens[index + 1]?.value !== "."
					|| tokens[index + 2]?.value !== "forEach"
					|| tokens[index + 3]?.value !== "(") continue;
				const callEnd = matchingToken(tokens, index + 3, "(", ")");
				if (callEnd < 0) continue;
				try {
					const args = topLevelArgumentRanges(tokens, index + 3, callEnd);
					const callback = args.length > 0 ? singleCallbackArgument(tokens, args[0][0], args[0][1]) : null;
					if (callback === null) continue;
					const candidates = declarations.filter((declaration) => declaration.name === tokens[index].value
						&& declaration.container === containers[index] && declaration.end < index);
					if (candidates.length !== 1) continue;
					for (const selector of callbackElementConstructions(tokens, containers, callback)) {
						const values = selectedCollectionValues(candidates[0], selector);
						if (values === null) continue;
						for (const value of values) identities.set(value, (identities.get(value) ?? 0) + 1);
					}
				} catch (error) {
					if (error instanceof JavaScriptLexicalAmbiguity) continue;
					throw error;
				}
			}
		}
		return identities;
	});
	return counts.get(identity) ?? 0;
}

function validateStructuralIdentity(value, text, itemId) {
	let count;
	if (value.identityKind === "whole-file") return;
	if (value.identityKind === "marker-pair") {
		const [start, end] = parseMarkerPair(value.identity, `${itemId} ${value.path}`);
		const startCount = occurrenceCount(text, start);
		const endCount = occurrenceCount(text, end);
		const startIndex = text.indexOf(start);
		const endIndex = text.indexOf(end, startIndex + start.length);
		if (startCount !== 1 || endCount !== 1 || startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
			refuse(R.IDENTITY_UNRESOLVED, `${itemId} marker-pair resolved start=${startCount} end=${endCount} with invalid order in ${value.path}`, itemId);
		}
		return;
	}
	if (value.identityKind === "test-title") count = testDeclarations(text).filter((declaration) => declaration.title === value.identity).length;
	else if (value.identityKind === "dom-id") {
		const literalCount = value.path.endsWith(".html") ? literalHtmlDomIdDefinitionCount(text, value.identity) : 0;
		count = literalCount + directlyConstructedDomIdDefinitionCount(text, value.identity) + dataDrivenDomIdDefinitionCount(text, value.identity);
	}
	else if (value.identityKind === "config-key") count = configKeyExists(text, value.identity) ? 1 : 0;
	else if (value.identityKind === "exported-symbol" || value.identityKind === "local-symbol") {
		if (/^[A-Za-z_$][\w$]*$/.test(value.identity)) {
			const exportPrefix = value.identityKind === "exported-symbol" ? "export\\s+" : "(?:export\\s+)?";
			count = [...text.matchAll(new RegExp(`\\b${exportPrefix}(?:async\\s+)?(?:const|let|var|function|class)\\s+${escapeRegExp(value.identity)}\\b`, "g"))].length;
		} else {
			const declaration = /^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+[A-Za-z_$][\w$]*/.test(value.identity);
			if (!declaration) refuse(R.IDENTITY_UNRESOLVED, `${itemId} ${value.identityKind} is not a stable declaration anchor in ${value.path}`, itemId);
			count = occurrenceCount(text, value.identity);
		}
	} else count = occurrenceCount(text, value.identity);
	if (count !== 1) refuse(R.IDENTITY_UNRESOLVED, `${itemId} identity ${value.identity} resolved ${count} times in ${value.path}`, itemId);
}

function validateOwnership(boundaries) {
	const owners = new Map();
	for (const entry of boundaries) {
		for (const value of entry.attributedPaths) {
			const key = descriptorKey(value);
			if (!owners.has(key)) owners.set(key, []);
			owners.get(key).push({ entry, ownership: value.ownership });
		}
	}
	for (const claims of owners.values()) {
		if (claims.length === 1) {
			const [{ entry, ownership }] = claims;
			if (ownership.mode !== "exclusive" || ownership.ownerScopeId !== entry.scopeId) {
				refuse(R.EVOLUTION_CHAIN_INVALID, `${entry.itemId} single-owner tuple must be exclusive`, entry.itemId);
			}
			continue;
		}
		if (claims.some(({ ownership }) => ownership.mode !== "ordered-evolution")) {
			refuse(R.OWNERSHIP_OVERLAP_UNDECLARED, "repeated descriptor lacks one ordered evolution chain", claims[0].entry.itemId);
		}
		const first = claims[0].ownership;
		const expectedMembers = claims.map(({ entry }) => entry.scopeId).sort(compareText);
		const ordered = first.orderedScopeIds;
		const sameChain = claims.every(({ ownership }) => ownership.chainId === first.chainId && JSON.stringify(ownership.orderedScopeIds) === JSON.stringify(ordered));
		const memberSet = [...new Set(ordered)].sort(compareText);
		const ascending = ordered.every((scopeId, index) => index === 0 || Number(ordered[index - 1]) < Number(scopeId));
		if (!sameChain || ordered.length < 2 || new Set(ordered).size !== ordered.length || !sameStringArray(memberSet, expectedMembers) || !ascending) {
			refuse(R.EVOLUTION_CHAIN_INVALID, `evolution chain ${first.chainId} is incomplete, inconsistent, or unordered`, claims[0].entry.itemId);
		}
	}
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractConstants(text) {
	const constants = new Map();
	const declarations = [...text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+);/g)];
	for (let pass = 0; pass <= declarations.length; pass += 1) {
		let changed = false;
		for (const match of declarations) {
			if (constants.has(match[1])) continue;
			const value = evaluateExpression(match[2], constants);
			if (value !== null) { constants.set(match[1], value); changed = true; }
		}
		if (!changed) break;
	}
	return constants;
}

function evaluateExpression(expression, constants) {
	const value = String(expression ?? "").trim().replace(/^await\s+/, "");
	const parts = splitTopLevel(value, "+");
	if (parts.length > 1) {
		const values = parts.map((part) => evaluateExpression(part, constants));
		return values.every((part) => part !== null) ? values.join("") : null;
	}
	const quoted = /^(["'`])([\s\S]*)\1$/.exec(value);
	if (quoted && !quoted[2].includes("${")) return quoted[2].replace(/\\(["'`\\])/g, "$1");
	if (/^[A-Za-z_$][\w$]*$/.test(value) && constants.has(value)) return constants.get(value);
	return null;
}

function splitTopLevel(value, delimiter) {
	const parts = [];
	let quote = null;
	let depth = 0;
	let start = 0;
	for (let index = 0; index < value.length; index += 1) {
		const char = value[index];
		if (quote !== null) {
			if (char === "\\") index += 1;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "\"" || char === "'" || char === "`") quote = char;
		else if (char === "(" || char === "[" || char === "{") depth += 1;
		else if (char === ")" || char === "]" || char === "}") depth -= 1;
		else if (char === delimiter && depth === 0) { parts.push(value.slice(start, index).trim()); start = index + 1; }
	}
	parts.push(value.slice(start).trim());
	return parts;
}

function resolveLocalReference(sourcePath, reference) {
	if (!reference.startsWith(".")) return null;
	return posix.normalize(posix.join(posix.dirname(sourcePath), reference));
}

function extractStaticModuleUrlConstants(text, constants, tokenAt) {
	const urls = new Map();
	for (const match of text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+URL\s*\(\s*([^,\n]+)\s*,\s*import\.meta\.url\s*\)\s*;/g)) {
		if (tokenAt !== null && tokenAt.get(match.index)?.value !== "const") continue;
		const reference = evaluateExpression(match[2], constants);
		if (reference !== null) urls.set(match[1], reference);
	}
	return urls;
}

function evaluateDynamicImportExpression(expression, constants, moduleUrls) {
	const direct = evaluateExpression(expression, constants);
	if (direct !== null) return direct;
	const value = String(expression ?? "").trim().replace(/^await\s+/, "");
	const urlReference = /^([A-Za-z_$][\w$]*)(?:\s*\.\s*href|\s*\[\s*(["'])href\2\s*\])?$/.exec(value);
	return urlReference && moduleUrls.has(urlReference[1]) ? moduleUrls.get(urlReference[1]) : null;
}

function classifyPathEdge(entry, edgeClass, targetPath) {
	const policy = entry.edgePolicy[edgeClass];
	const permitted = policy.permittedSurfaces.filter((surface) => surface.path === targetPath);
	const forbidden = policy.forbiddenSurfaces.filter((surface) => surface.path === targetPath);
	if (forbidden.length > 0) refuse(R.SEMANTIC_EDGE_FORBIDDEN, `${entry.itemId} ${edgeClass} reaches forbidden surface ${targetPath}`, entry.itemId);
	if (permitted.length !== 1) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${entry.itemId} ${edgeClass} cannot classify ${targetPath} exactly`, entry.itemId);
}

function classifyStorageEdge(entry, sourcePath, identity) {
	const policy = entry.edgePolicy.durableStorageWrite;
	const matches = (surfaces) => surfaces.filter((surface) => surface.path === sourcePath && surface.identity === identity);
	if (matches(policy.forbiddenSurfaces).length > 0) refuse(R.SEMANTIC_EDGE_FORBIDDEN, `${entry.itemId} durableStorageWrite reaches forbidden identity ${identity}`, entry.itemId);
	if (matches(policy.permittedSurfaces).length !== 1) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${entry.itemId} durableStorageWrite cannot classify ${identity} exactly`, entry.itemId);
}

function assertSafeFamilyDeclaration(pathFamily, context) {
	if (!isNonEmptyString(pathFamily) || pathFamily.includes("\\") || pathFamily.split("/").includes("..") || isAbsolute(pathFamily)) {
		refuse(R.MANIFEST_SCHEMA_INVALID, `${context} has an unsafe pathFamily`);
	}
}

function validatePolicyPaths(entry, readRecord) {
	for (const edgeClass of EDGE_POLICY_KEYS) {
		for (const field of EDGE_CLASS_KEYS) {
			for (const surface of entry.edgePolicy[edgeClass][field]) {
				readRecord(surface.path, `${entry.itemId}.edgePolicy.${edgeClass}.${field} ${surface.path}`);
				assertSafeFamilyDeclaration(surface.pathFamily, `${entry.itemId}.edgePolicy.${edgeClass}.${field}`);
				if (!familyMatches(surface.path, surface.pathFamily)) refuse(R.MANIFEST_SCHEMA_INVALID, `${entry.itemId} policy surface ${surface.path} is outside ${surface.pathFamily}`, entry.itemId);
			}
		}
	}
}

const JAVASCRIPT_SOURCE_PATH = /\.(?:cjs|mjs|js)$/;
const NON_EXECUTABLE_SEMANTIC_IDENTITIES = new Set(["marker", "dom-id", "config-key"]);
const JAVASCRIPT_DECLARATION_PREFIX = /^(?:(?:export\s+(?:default\s+)?)?async\s+|export\s+(?:default\s+)?)?(function|class|const|let|var)\b/;
const JAVASCRIPT_BLOCK_STATEMENTS = new Set(["if", "for", "while", "switch", "try", "function", "class"]);
const JAVASCRIPT_STATEMENT_LEADERS = new Set([
	"async", "await", "break", "class", "const", "continue", "debugger", "do", "export", "for", "function",
	"if", "import", "let", "return", "switch", "throw", "try", "var", "while", "with", "yield"
]);
const SEMANTIC_SLICE_SEPARATOR = "\n;\n";

function semanticIdentityLabel(value, role = null) {
	return `${value.identityKind} ${JSON.stringify(value.identity)}${role === null ? "" : ` role=${role}`}`;
}

function refuseSemanticSlice(entry, value, role, detail) {
	refuse(R.SEMANTIC_EDGE_UNRESOLVED,
		`${entry.itemId} semantic source ${value.path} identity ${semanticIdentityLabel(value, role)} ${detail}`,
		entry.itemId);
}

function assertBalancedJavaScriptTokens(tokens) {
	const closingFor = { "(": ")", "[": "]", "{": "}" };
	const stack = [];
	for (const token of tokens) {
		if (token.type !== "punctuator") continue;
		if (Object.hasOwn(closingFor, token.value)) stack.push({ expected: closingFor[token.value], token });
		else if ([")", "]", "}"].includes(token.value)) {
			const opening = stack.pop();
			if (!opening || opening.expected !== token.value) javascriptLexicalFailure("ambiguous JavaScript delimiter nesting", token.start);
		}
	}
	if (stack.length > 0) javascriptLexicalFailure("unterminated JavaScript delimiter", stack.at(-1).token.start);
}

function assertCompleteJavaScriptSlice(text) {
	const tokens = tokenizeJavaScript(text);
	assertBalancedJavaScriptTokens(tokens);
	return tokens;
}

function identityRange(text, value) {
	const start = text.indexOf(value.identity);
	return start < 0 ? null : { start, end: start + value.identity.length };
}

function tokenIndexAtOrAfter(tokens, offset) {
	return tokens.findIndex((token) => token.end > offset);
}

function statementEndToken(tokens, startIndex) {
	const stack = [];
	const closingFor = { "(": ")", "[": "]", "{": "}" };
	const first = tokens[startIndex]?.value;
	for (let index = startIndex; index < tokens.length; index += 1) {
		const value = tokens[index].value;
		if (Object.hasOwn(closingFor, value)) stack.push(closingFor[value]);
		else if ([")", "]", "}"].includes(value)) {
			if (stack.length === 0 || stack.pop() !== value) return -1;
			if (stack.length === 0 && value === "}" && JAVASCRIPT_BLOCK_STATEMENTS.has(first)) {
				const next = tokens[index + 1]?.value;
				if ((first === "if" && next === "else") || (first === "try" && (next === "catch" || next === "finally"))) continue;
				return index;
			}
		} else if (value === ";" && stack.length === 0) return index;
	}
	return -1;
}

function declarationSlice(text, value) {
	const trimmed = value.identity.trim();
	let declarationStart = text.indexOf(value.identity);
	let declarationKind = JAVASCRIPT_DECLARATION_PREFIX.exec(trimmed)?.[1] ?? null;
	if (declarationKind === null && /^[A-Za-z_$][\w$]*$/.test(trimmed)) {
		const declarationPattern = new RegExp(`\\b(?:(?:export\\s+(?:default\\s+)?)?async\\s+|export\\s+(?:default\\s+)?)?(function|class|const|let|var)\\s+${escapeRegExp(trimmed)}\\b`, "g");
		const declarations = [...text.matchAll(declarationPattern)];
		if (declarations.length !== 1) return null;
		declarationStart = declarations[0].index;
		declarationKind = declarations[0][1];
	}
	if (declarationStart < 0 || declarationKind === null) return null;
	const tokens = tokenizeJavaScript(text);
	const startIndex = tokenIndexAtOrAfter(tokens, declarationStart);
	if (startIndex < 0) return null;
	if (declarationKind === "function") {
		const functionIndex = tokens.findIndex((token, index) => index >= startIndex && token.value === "function");
		const parametersStart = tokens.findIndex((token, index) => index > functionIndex && token.value === "(");
		const parametersEnd = parametersStart >= 0 ? matchingToken(tokens, parametersStart, "(", ")") : -1;
		const bodyStart = parametersEnd >= 0 ? tokens.findIndex((token, index) => index > parametersEnd && token.value === "{") : -1;
		const bodyEnd = bodyStart >= 0 ? matchingToken(tokens, bodyStart, "{", "}") : -1;
		return bodyEnd < 0 ? null : text.slice(declarationStart, tokens[bodyEnd].end);
	}
	if (declarationKind === "class") {
		const bodyStart = tokens.findIndex((token, index) => index >= startIndex && token.value === "{");
		const bodyEnd = bodyStart >= 0 ? matchingToken(tokens, bodyStart, "{", "}") : -1;
		return bodyEnd < 0 ? null : text.slice(declarationStart, tokens[bodyEnd].end);
	}
	const endIndex = statementEndToken(tokens, startIndex);
	return endIndex < 0 ? null : text.slice(declarationStart, tokens[endIndex].end);
}

function hunkSlice(text, value) {
	const range = identityRange(text, value);
	if (range === null) return null;
	const declaration = declarationSlice(text, value);
	if (declaration !== null) return declaration;
	const tokens = tokenizeJavaScript(text);
	const anchorIndex = tokenIndexAtOrAfter(tokens, range.start);
	if (anchorIndex < 0) return null;
	const candidates = [];
	for (let index = 0; index <= anchorIndex; index += 1) {
		const previous = tokens[index - 1]?.value;
		if (index === 0 || [";", "{", "}"].includes(previous) || JAVASCRIPT_STATEMENT_LEADERS.has(tokens[index].value)) candidates.push(index);
	}
	for (const startIndex of candidates.sort((left, right) => right - left)) {
		const endIndex = statementEndToken(tokens, startIndex);
		if (endIndex >= anchorIndex && tokens[endIndex].end >= range.end) {
			return text.slice(tokens[startIndex].start, tokens[endIndex].end);
		}
	}
	return null;
}

function inlineScriptBody(text, value) {
	const range = identityRange(text, value);
	if (range === null) return null;
	const open = text.lastIndexOf("<script", range.start);
	if (open < 0) return null;
	const bodyStart = text.indexOf(">", open);
	const bodyEnd = bodyStart >= 0 ? text.indexOf("</script>", bodyStart + 1) : -1;
	if (bodyStart < 0 || bodyEnd < range.end) return null;
	return text.slice(bodyStart + 1, bodyEnd);
}

function completeHtmlSlice(text, value) {
	const range = identityRange(text, value);
	if (range === null) return null;
	const tagStart = text.lastIndexOf("<", range.start);
	const tagEnd = text.indexOf(">", range.end);
	if (tagStart >= 0 && tagEnd >= range.end && !text.slice(tagStart, range.start).includes(">")) return text.slice(tagStart, tagEnd + 1);
	const lineStart = text.lastIndexOf("\n", range.start - 1) + 1;
	const nextLine = text.indexOf("\n", range.end);
	return text.slice(lineStart, nextLine < 0 ? text.length : nextLine);
}

function executableIdentitySlice(text, value) {
	if (value.identityKind === "test-title") {
		const declaration = testDeclarations(text).find((candidate) => candidate.title === value.identity);
		return declaration ? text.slice(declaration.declarationStart, declaration.declarationEnd) : null;
	}
	if (value.identityKind === "exported-symbol" || value.identityKind === "local-symbol") return declarationSlice(text, value);
	if (value.identityKind === "hunk") return hunkSlice(text, value);
	return null;
}

function attributedSlice(text, value, role, entry) {
	if (NON_EXECUTABLE_SEMANTIC_IDENTITIES.has(value.identityKind)) return null;
	let slice = null;
	try {
		if (value.identityKind === "whole-file") slice = text;
		else if (value.identityKind === "marker-pair") {
			const [start, end] = parseMarkerPair(value.identity, `${value.path} marker-pair`);
			const startIndex = text.indexOf(start);
			const endIndex = text.indexOf(end, startIndex + start.length);
			slice = startIndex >= 0 && endIndex >= 0 ? text.slice(startIndex, endIndex + end.length) : null;
		} else {
			const scriptBody = value.path.endsWith(".html") ? inlineScriptBody(text, value) : null;
			if (JAVASCRIPT_SOURCE_PATH.test(value.path) || scriptBody !== null) {
				slice = executableIdentitySlice(scriptBody ?? text, value);
				if (slice !== null) assertCompleteJavaScriptSlice(slice);
			} else if (value.path.endsWith(".html") && value.identityKind === "hunk") slice = completeHtmlSlice(text, value);
		}
		if (slice === null) refuseSemanticSlice(entry, value, role, "does not resolve to one complete executable unit");
		if (JAVASCRIPT_SOURCE_PATH.test(value.path) && value.identityKind === "marker-pair") assertCompleteJavaScriptSlice(slice);
		return slice;
	} catch (error) {
		if (error instanceof ScopeClaimsRefusal) throw error;
		if (error instanceof JavaScriptLexicalAmbiguity) {
			refuseSemanticSlice(entry, value, role, `is lexically ambiguous: ${error.message}`);
		}
		throw error;
	}
}

function registryRoleForDescriptor(scopeId, descriptorValue, authority) {
	const role = authority?.registryRoleByDescriptor?.get(descriptorKey(descriptorValue));
	if (!REGISTRY_ROLES.has(role)) {
		refuse(R.INVENTORY_SOURCE_INVALID, `Scope ${scopeId} descriptor ${encodedDescriptor(descriptorValue)} has no authoritative registry role`);
	}
	return role;
}

function semanticRecords(entry, readRecord, authority) {
	const records = new Map();
	const injectedFullSemanticPaths = authority.attributedPaths === null
		? new Set(EDGE_CLASS_KEYS.flatMap((field) => entry.edgePolicy.durableStorageWrite[field].map((surface) => surface.path)))
		: new Set();
	const executable = [...entry.attributedPaths].sort(descriptorOrder).map((value) => ({
		value,
		role: registryRoleForDescriptor(entry.scopeId, value, authority)
	})).filter(({ value, role }) => SEMANTIC_EXECUTABLE_ROLES.has(role) && SEMANTIC_EXECUTABLE_PATH.test(value.path));
	for (const { value, role } of executable) {
		const record = readRecord(value.path, `${entry.itemId} semantic source ${value.path}`);
		const text = injectedFullSemanticPaths.has(value.path) && JAVASCRIPT_SOURCE_PATH.test(value.path)
			? record.text
			: attributedSlice(record.text, value, role, entry);
		if (text === null) continue;
		if (!records.has(value.path)) records.set(value.path, { ...record, text: "", semanticIdentities: [] });
		const semanticRecord = records.get(value.path);
		semanticRecord.text += `${semanticRecord.text.length === 0 ? "" : SEMANTIC_SLICE_SEPARATOR}${text}\n;`;
		semanticRecord.semanticIdentities.push(semanticIdentityLabel(value, role));
	}
	for (const record of records.values()) {
		if (!JAVASCRIPT_SOURCE_PATH.test(record.path)) continue;
		try { assertCompleteJavaScriptSlice(record.text); }
		catch (error) {
			if (error instanceof JavaScriptLexicalAmbiguity) {
				refuse(R.SEMANTIC_EDGE_UNRESOLVED,
					`${entry.itemId} semantic source ${record.path} identities ${record.semanticIdentities.join(", ")} are lexically ambiguous after composition: ${error.message}`,
					entry.itemId);
			}
			throw error;
		}
	}
	return [...records.values()].sort((left, right) => compareText(left.path, right.path));
}

function validateSemanticEdges(entry, readRecord, boundaryAuthority) {
	validatePolicyPaths(entry, readRecord);
	const authority = boundaryAuthority.get(entry.scopeId);
	if (!authority) refuse(R.INVENTORY_SOURCE_INVALID, `${entry.itemId} has no boundary registry section`, entry.itemId);
	for (const record of semanticRecords(entry, readRecord, authority)) {
		for (const target of analyzeDependencies(record.text, record.path, entry.itemId)) classifyPathEdge(entry, "dependency", target);
		for (const target of analyzeFilesystemWrites(record.text, record.path, entry.itemId)) classifyPathEdge(entry, "filesystemWrite", target);
		for (const identity of analyzeStorageWrites(record.text, entry.itemId)) classifyStorageEdge(entry, record.path, identity);
	}
	validatePublicConsumers(entry, readRecord);
}

function policySurface(path, identityKind = "whole-file", identity = "whole-file") {
	return { pathFamily: path, path, identityKind, identity };
}

function uniquePolicySurfaces(values) {
	const byValue = new Map();
	for (const value of values) byValue.set(JSON.stringify(canonicalObject(value)), value);
	return [...byValue.values()].sort((left, right) => compareText(JSON.stringify(canonicalObject(left)), JSON.stringify(canonicalObject(right))));
}

function deriveCanonicalEdgePolicy(scopeId, authority, readRecord) {
	const attributedPaths = authority.attributedPaths;
	const syntheticEntry = {
		itemId: `SCOPE-${scopeId}-BOUNDARY-CLAIM`,
		scopeId,
		attributedPaths
	};
	const dependencies = [];
	const filesystemWrites = [];
	const durableStorageWrites = [];
	for (const record of semanticRecords(syntheticEntry, readRecord, authority)) {
		for (const path of analyzeDependencies(record.text, record.path, syntheticEntry.itemId)) dependencies.push(policySurface(path));
		for (const path of analyzeFilesystemWrites(record.text, record.path, syntheticEntry.itemId)) filesystemWrites.push(policySurface(path));
		for (const identity of analyzeStorageWrites(record.text, syntheticEntry.itemId)) {
			durableStorageWrites.push(policySurface(record.path, identity.startsWith("expression:") ? "contract-token" : "config-key", identity));
		}
	}
	const publicConsumers = attributedPaths
		.filter((value) => PUBLIC_CONSUMER_ROLES.has(registryRoleForDescriptor(scopeId, value, authority)))
		.map((value) => policySurface(value.path, value.identityKind, value.identity));
	return {
		dependency: { permittedSurfaces: uniquePolicySurfaces(dependencies), forbiddenSurfaces: [] },
		filesystemWrite: { permittedSurfaces: uniquePolicySurfaces(filesystemWrites), forbiddenSurfaces: [] },
		durableStorageWrite: { permittedSurfaces: uniquePolicySurfaces(durableStorageWrites), forbiddenSurfaces: [] },
		publicConsumer: { permittedSurfaces: uniquePolicySurfaces(publicConsumers), forbiddenSurfaces: [] }
	};
}

function buildCanonicalBoundaryEntry(scopeId, authority, pairAuthority, readRecord) {
	const row = authority.get(scopeId);
	if (!row || row.attributedPaths === null) refuse(R.INVENTORY_SOURCE_INVALID, `Scope ${scopeId} has no canonical registry authority`);
	const claimSource = pairAuthority.rows.get(`${scopeId}:boundary`);
	if (!claimSource) refuse(R.INVENTORY_SOURCE_INVALID, `Scope ${scopeId} has no authoritative boundary checklist row`);
	const descriptors = normalizedDescriptors(row.descriptors);
	return {
		itemId: `SCOPE-${scopeId}-BOUNDARY-CLAIM`,
		scopeId,
		kind: "boundary",
		dodClaim: claimSource.rowIdentity,
		claimSource: {
			artifact: claimSource.artifact,
			section: claimSource.section,
			rowIdentity: claimSource.rowIdentity
		},
		expectedInventory: {
			sources: [...row.sources].sort(sourceOrder),
			descriptors,
			descriptorCount: descriptors.length,
			inventorySha256: inventorySha256(descriptors)
		},
		attributedPaths: [...row.attributedPaths].sort(descriptorOrder),
		allowedFamilies: [...new Set(descriptors.map((value) => value.path))].sort(compareText),
		edgePolicy: deriveCanonicalEdgePolicy(scopeId, row, readRecord)
	};
}

function isFunctionDeclarationCall(text, index) {
	return /\bfunction\s*$/.test(text.slice(Math.max(0, index - 80), index));
}

function analyzeDependencies(text, sourcePath, itemId) {
	const constants = extractConstants(text);
	const references = [];
	const language = languageForPath(sourcePath, itemId);
	const javascript = language === "javascript";
	let tokenAt = null;
	if (javascript) {
		try { tokenAt = new Map(tokenizeJavaScript(text).map((token) => [token.start, token])); }
		catch (error) {
			if (error instanceof JavaScriptLexicalAmbiguity) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} dependency source ${sourcePath} is lexically ambiguous: ${error.message}`, itemId);
			throw error;
		}
	}
	const moduleUrls = extractStaticModuleUrlConstants(text, constants, tokenAt);
	const isCodeMatch = (match, values) => !javascript || values.includes(tokenAt.get(match.index)?.value);
	for (const match of text.matchAll(/\b(?:import|export)\s+(?:[^;\n]*?\s+from\s+)?(["'])([^"']+)\1/g)) {
		if (isCodeMatch(match, ["import", "export"])) references.push(match[2]);
	}
	if (language === "html") {
		for (const match of text.matchAll(/<script[^>]+\bsrc\s*=\s*(["'])(.*?)\1/gi)) {
			const reference = match[2].split(/[?#]/, 1)[0];
			if (!/^(?:[a-z]+:|\/\/|\/)/i.test(reference)) references.push(reference.startsWith(".") ? reference : `./${reference}`);
		}
	}
	for (const match of text.matchAll(/\bimport\s*\(([^)]+)\)/g)) {
		if (!isCodeMatch(match, ["import"])) continue;
		const value = evaluateDynamicImportExpression(match[1], constants, moduleUrls);
		if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved dynamic import`, itemId);
		references.push(value);
	}
	for (const match of text.matchAll(/\brequire\s*\(([^)]+)\)/g)) {
		if (!isCodeMatch(match, ["require"])) continue;
		const value = evaluateExpression(match[1], constants);
		if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved require argument ${match[1].trim()}`, itemId);
		references.push(value);
	}
	const requireAliases = new Set([...text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*require\s*;/g)]
		.filter((match) => isCodeMatch(match, ["const"])).map((match) => match[1]));
	const helpers = [];
	for (const match of text.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{([^{}]*)\}/g)) {
		if (!isCodeMatch(match, ["function"])) continue;
		const params = match[2].split(",").map((value) => value.trim()).filter(Boolean);
		for (const alias of requireAliases) {
			const parameterIndex = params.findIndex((param) => new RegExp(`\\b${escapeRegExp(alias)}\\s*\\(\\s*${escapeRegExp(param)}\\s*\\)`).test(match[3]));
			if (parameterIndex >= 0) helpers.push({ name: match[1], parameterIndex });
		}
	}
	for (const alias of requireAliases) {
		const pattern = new RegExp(`\\b${escapeRegExp(alias)}\\s*\\(([^)]*)\\)`, "g");
		for (const match of text.matchAll(pattern)) {
			if (javascript && tokenAt.get(match.index)?.value !== alias) continue;
			const value = evaluateExpression(match[1], constants);
			if (value !== null) references.push(value);
		}
	}
	for (const helper of helpers) {
		const pattern = new RegExp(`\\b${escapeRegExp(helper.name)}\\s*\\(([^)]*)\\)`, "g");
		for (const match of text.matchAll(pattern)) {
			if (javascript && tokenAt.get(match.index)?.value !== helper.name) continue;
			if (isFunctionDeclarationCall(text, match.index)) continue;
			const value = evaluateExpression(splitTopLevel(match[1], ",")[helper.parameterIndex] ?? "", constants);
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved dependency helper`, itemId);
			references.push(value);
		}
	}
	return [...new Set(references.map((reference) => resolveLocalReference(sourcePath, reference)).filter(Boolean))].sort(compareText);
}

const WRITE_NAMES = new Set(["writeFile", "writeFileSync", "appendFile", "appendFileSync", "rename", "renameSync", "copyFile", "copyFileSync", "createWriteStream"]);

function analyzeFilesystemWrites(text, sourcePath, itemId) {
	const constants = extractConstants(text);
	const writers = new Set();
	const fsObjects = new Set();
	for (const match of text.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*(["'])node:fs(?:\/promises)?\2/g)) {
		for (const part of match[1].split(",")) {
			const names = part.trim().split(/\s+as\s+/);
			if (WRITE_NAMES.has(names[0])) writers.add(names[1] ?? names[0]);
		}
	}
	for (const match of text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*await\s+import\s*\(\s*(["'])node:fs(?:\/promises)?\2\s*\)/g)) fsObjects.add(match[1]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const match of text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+);/g)) {
			if (writers.has(match[1])) continue;
			const rhs = match[2];
			const memberExpression = /\[([^\]]+)\]/.exec(rhs);
			const memberName = memberExpression ? evaluateExpression(memberExpression[1], constants) : /\.([A-Za-z_$][\w$]*)/.exec(rhs)?.[1] ?? null;
			const referencesWriter = [...writers].some((writer) => new RegExp(`\\b${escapeRegExp(writer)}\\b`).test(rhs));
			const referencesFs = [...fsObjects].some((object) => new RegExp(`\\b${escapeRegExp(object)}\\b`).test(rhs));
			if (referencesWriter || (referencesFs && memberName && WRITE_NAMES.has(memberName))) { writers.add(match[1]); changed = true; }
		}
	}
	const targets = [];
	for (const writer of writers) {
		const pattern = new RegExp(`\\b${escapeRegExp(writer)}\\s*\\(([^)]*)\\)`, "g");
		for (const match of text.matchAll(pattern)) {
			const value = evaluateExpression(splitTopLevel(match[1], ",")[0] ?? "", constants);
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved filesystem write`, itemId);
			targets.push(value);
		}
	}
	for (const match of text.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{([^{}]*)\}/g)) {
		const params = match[2].split(",").map((value) => value.trim());
		const writerIndex = params.findIndex((param) => new RegExp(`\\b${escapeRegExp(param)}\\s*\\(`).test(match[3]));
		if (writerIndex < 0) continue;
		const pathIndex = params.findIndex((param, index) => index !== writerIndex && new RegExp(`\\b${escapeRegExp(param)}\\b`).test(match[3]));
		const invocation = new RegExp(`\\b${escapeRegExp(match[1])}\\s*\\(([^)]*)\\)`, "g");
		for (const call of text.matchAll(invocation)) {
			if (isFunctionDeclarationCall(text, call.index)) continue;
			const args = splitTopLevel(call[1], ",");
			if (!writers.has((args[writerIndex] ?? "").trim())) continue;
			const value = evaluateExpression(args[pathIndex] ?? "", constants);
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved filesystem helper path`, itemId);
			targets.push(value);
		}
	}
	return [...new Set(targets.map((target) => resolveLocalReference(sourcePath, target)).filter(Boolean))].sort(compareText);
}

function evaluateStorageKey(expression, constants) {
	const value = evaluateExpression(expression, constants);
	if (value !== null) return value;
	const symbolic = String(expression ?? "").trim();
	if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/.test(symbolic)) return `expression:${symbolic}`;
	const parts = splitTopLevel(symbolic, "+");
	if (parts.length > 1 && parts.every((part) => /^(?:[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+|(["'`])[^\r\n]*\1)$/.test(part))) {
		return `expression:${parts.join(" + ")}`;
	}
	if (symbolic.startsWith("`") && symbolic.endsWith("`")) {
		const inner = symbolic.slice(1, -1);
		const interpolations = [...inner.matchAll(/\$\{([^{}]+)\}/g)];
		const remainder = inner.replace(/\$\{[^{}]+\}/g, "");
		if (interpolations.length > 0
			&& interpolations.every((match) => /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/.test(match[1].trim()))
			&& !remainder.includes("${") && !remainder.includes("`")) {
			return `expression:${symbolic}`;
		}
	}
	return null;
}

function analyzeStorageWrites(text, itemId) {
	const constants = extractConstants(text);
	let tokenAt = null;
	const writers = new Set();
	const keys = [];
	for (const match of text.matchAll(/\b(?:localStorage|sessionStorage)\s*\.\s*setItem\s*\(([^,)]*)/g)) {
		if (tokenAt === null) tokenAt = new Map(tokenizeJavaScript(text).map((token) => [token.start, token]));
		if (!new Set(["localStorage", "sessionStorage"]).has(tokenAt.get(match.index)?.value)) continue;
		const value = evaluateStorageKey(match[1], constants);
		if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved durable-storage key expression ${match[1].trim()}`, itemId);
		keys.push(value);
	}
	for (const match of text.matchAll(/\bconst\s*\{\s*setItem\s*:\s*([A-Za-z_$][\w$]*)\s*\}\s*=\s*(?:localStorage|sessionStorage)/g)) writers.add(match[1]);
	for (const match of text.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+);/g)) {
		if (/(?:localStorage|sessionStorage)/.test(match[2]) && /set[^\n]*Item/i.test(match[2])) writers.add(match[1]);
	}
	for (const writer of writers) {
		const direct = new RegExp(`\\b${escapeRegExp(writer)}\\s*\\(([^)]*)\\)`, "g");
		for (const match of text.matchAll(direct)) {
			const value = evaluateStorageKey(splitTopLevel(match[1], ",")[0] ?? "", constants);
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved durable-storage alias key expression ${match[1].trim()}`, itemId);
			keys.push(value);
		}
		const called = new RegExp(`\\b${escapeRegExp(writer)}\\s*\\.\\s*call\\s*\\(\\s*(?:localStorage|sessionStorage)\\s*,([^,)]*)`, "g");
		for (const match of text.matchAll(called)) {
			const value = evaluateStorageKey(match[1], constants);
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved destructured storage key`, itemId);
			keys.push(value);
		}
	}
	for (const match of text.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{([^{}]*)\}/g)) {
		const params = match[2].split(",").map((value) => value.trim());
		const writerIndex = params.findIndex((param) => new RegExp(`\\b${escapeRegExp(param)}\\s*\\(`).test(match[3]));
		if (writerIndex < 0) continue;
		const bodyCall = new RegExp(`\\b${escapeRegExp(params[writerIndex])}\\s*\\(([^)]*)\\)`).exec(match[3]);
		const invocation = new RegExp(`\\b${escapeRegExp(match[1])}\\s*\\(([^)]*)\\)`, "g");
		for (const call of text.matchAll(invocation)) {
			if (isFunctionDeclarationCall(text, call.index)) continue;
			const args = splitTopLevel(call[1], ",");
			if (!writers.has((args[writerIndex] ?? "").trim())) continue;
			const value = bodyCall ? evaluateStorageKey(splitTopLevel(bodyCall[1], ",")[0] ?? "", constants) : null;
			if (value === null) refuse(R.SEMANTIC_EDGE_UNRESOLVED, `${itemId} has an unresolved storage helper key`, itemId);
			keys.push(value);
		}
	}
	return [...new Set(keys)].sort(compareText);
}

function validatePublicConsumers(entry, readRecord) {
	const attributedPaths = new Set(entry.attributedPaths.map((value) => value.path));
	const attributedIdentities = new Set(entry.attributedPaths.map((value) => value.identity));
	for (const field of EDGE_CLASS_KEYS) {
		for (const surface of entry.edgePolicy.publicConsumer[field]) {
			const record = readRecord(surface.path, `${entry.itemId}.edgePolicy.publicConsumer.${field} ${surface.path}`);
			const reachesBoundary = publicReferences(record.text, surface.path)
				.some(({ path, hash }) => attributedPaths.has(path) || (hash && attributedIdentities.has(hash)));
			if (reachesBoundary && field === "forbiddenSurfaces") refuse(R.SEMANTIC_EDGE_FORBIDDEN, `${entry.itemId} has forbidden public consumer ${surface.path}`, entry.itemId);
		}
	}
}

function publicReferences(text, sourcePath) {
	const raw = [];
	for (const match of text.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/g)) raw.push(match[2]);
	for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) raw.push(match[1]);
	if (sourcePath.endsWith(".json")) {
		try { collectJsonStrings(JSON.parse(text), raw); } catch { /* The owning JSON surface validates its syntax. */ }
	}
	if (sourcePath.endsWith(".mjs") || sourcePath.endsWith(".js")) {
		for (const match of text.matchAll(/(["'`])([^"'`\n]+)\1/g)) raw.push(match[2]);
	}
	return raw.map((reference) => {
		const hashIndex = reference.indexOf("#");
		const withoutHash = hashIndex >= 0 ? reference.slice(0, hashIndex) : reference;
		const hash = hashIndex >= 0 ? reference.slice(hashIndex + 1) : "";
		const withoutQuery = withoutHash.split("?", 1)[0];
		return { path: withoutQuery.startsWith(".") ? resolveLocalReference(sourcePath, withoutQuery) : withoutQuery, hash };
	});
}

function collectJsonStrings(value, target) {
	if (typeof value === "string") target.push(value);
	else if (Array.isArray(value)) value.forEach((entry) => collectJsonStrings(entry, target));
	else if (isObject(value)) Object.values(value).forEach((entry) => collectJsonStrings(entry, target));
}

function requiredAliasScans(entry) {
	return [...new Set([
		...entry.canonicalProducers.map((value) => value.path),
		...entry.consumerSurfaces.map((value) => value.path),
		...entry.testCarriers.map((value) => value.path)
	])].sort(compareText);
}

function aliasAuthoritySection(text, itemId, code) {
	const headings = [...text.matchAll(/^#{1,6}\s+Legacy Alias Origins\s*$/gm)];
	if (headings.length === 0) return null;
	if (headings.length !== 1) refuse(code, `${itemId} alias authority must contain exactly one Legacy Alias Origins section`, itemId);
	return markdownSection(text, "Legacy Alias Origins", code, `${itemId} alias authority`);
}

function artifactAliases(text, itemId) {
	const section = aliasAuthoritySection(text, itemId, R.ALIAS_NONE_INVALID);
	if (section === null) return [];
	const markerLines = section.filter((line) => /^\s*-\s+Alias:/.test(line));
	const identities = markerLines.map((line) => /^\s*-\s+Alias:\s+`([^`]+)`\s*$/.exec(line)?.[1] ?? null);
	if (identities.some((identity) => identity === null)) refuse(R.ALIAS_NONE_INVALID, `${itemId} alias authority contains a malformed Alias marker`, itemId);
	if (firstDuplicate(identities, (identity) => identity) !== null) refuse(R.ALIAS_NONE_INVALID, `${itemId} alias authority repeats an Alias marker`, itemId);
	return identities;
}

function assertSafeAliasOriginPath(path, context, itemId) {
	if (isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\") || path.includes("\\") || path.includes("\0")) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${context} must be a safe repository-relative POSIX path`, itemId);
	}
	const parts = path.split("/");
	if (parts.length === 0 || parts.some((part) => part === "" || part === "." || part === "..")) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${context} contains an unsafe path segment`, itemId);
	}
}

function parsePlanAliasAuthority(text, itemId) {
	const section = aliasAuthoritySection(text, itemId, R.ALIAS_ORIGIN_INVALID);
	if (section === null) return null;
	const fenceIndexes = section.map((line, index) => /^\s*```/.test(line) ? index : -1).filter((index) => index >= 0);
	if (fenceIndexes.length !== 2
		|| section[fenceIndexes[0]].trim() !== "```json"
		|| section[fenceIndexes[1]].trim() !== "```"
		|| fenceIndexes[0] >= fenceIndexes[1]) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority must contain exactly one closed json code fence`, itemId);
	}
	const markerLines = section
		.filter((_, index) => index < fenceIndexes[0] || index > fenceIndexes[1])
		.filter((line) => /^\s*-\s+Alias:/.test(line));
	const markerIdentities = markerLines.map((line) => /^\s*-\s+Alias:\s+`([^`]+)`\s*$/.exec(line)?.[1] ?? null);
	if (markerIdentities.some((identity) => identity === null)) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority contains a malformed Alias marker`, itemId);
	}
	if (firstDuplicate(markerIdentities, (identity) => identity) !== null) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority repeats an Alias marker`, itemId);
	}
	let authority;
	try { authority = JSON.parse(section.slice(fenceIndexes[0] + 1, fenceIndexes[1]).join("\n")); }
	catch { refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority json is invalid`, itemId); }
	assertExactKeys(authority, ["mode", "values"], `${itemId} alias authority`, R.ALIAS_ORIGIN_INVALID);
	if (authority.mode !== "declared") refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority mode must be declared`, itemId);
	assertArray(authority.values, `${itemId} alias authority.values`, { code: R.ALIAS_ORIGIN_INVALID });
	for (const [index, alias] of authority.values.entries()) {
		const context = `${itemId} alias authority.values[${index}]`;
		assertExactKeys(alias, ["identity", "origin", "scanSurfaces"], context, R.ALIAS_ORIGIN_INVALID);
		assertString(alias.identity, `${context}.identity`, R.ALIAS_ORIGIN_INVALID);
		assertAliasOriginSchema(alias.origin, `${context}.origin`);
		assertArray(alias.scanSurfaces, `${context}.scanSurfaces`, { code: R.ALIAS_SCAN_INVALID });
		for (const [scanIndex, path] of alias.scanSurfaces.entries()) {
			assertString(path, `${context}.scanSurfaces[${scanIndex}]`, R.ALIAS_SCAN_INVALID);
			assertSafeAliasOriginPath(path, `${context}.scanSurfaces[${scanIndex}]`, itemId);
		}
		if (firstDuplicate(alias.scanSurfaces, (path) => path) !== null) refuse(R.ALIAS_SCAN_INVALID, `${context}.scanSurfaces contains a duplicate`, itemId);
		if (alias.origin.kind === "commit") {
			if (!/^[0-9a-f]{40}$/.test(alias.origin.commit)) refuse(R.ALIAS_ORIGIN_INVALID, `${context}.origin.commit must be a full lowercase commit SHA`, itemId);
			assertSafeAliasOriginPath(alias.origin.path, `${context}.origin.path`, itemId);
		} else if (alias.origin.kind === "artifact") {
			assertSafeAliasOriginPath(alias.origin.artifact, `${context}.origin.artifact`, itemId);
		} else {
			assertSafeAliasOriginPath(alias.origin.path, `${context}.origin.path`, itemId);
		}
	}
	const valueIdentities = authority.values.map((alias) => alias.identity);
	if (firstDuplicate(valueIdentities, (identity) => identity) !== null) refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} alias authority repeats a values identity`, itemId);
	if (!sameStringArray(markerIdentities, valueIdentities)) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${itemId} ordered Alias markers do not equal values identities`, itemId);
	}
	return authority;
}

function assertPlanAliasMatch(entry, authority) {
	if (authority.values.length !== entry.aliases.values.length) {
		refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} declared aliases do not equal plan authority`, entry.itemId);
	}
	for (let index = 0; index < authority.values.length; index += 1) {
		const expected = authority.values[index];
		const actual = entry.aliases.values[index];
		if (actual.identity !== expected.identity || !deepEqualJson(actual.origin, expected.origin)) {
			refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} declared alias ${index + 1} differs from plan identity or origin`, entry.itemId);
		}
		if (!sameStringArray(actual.scanSurfaces, expected.scanSurfaces)) {
			refuse(R.ALIAS_SCAN_INVALID, `${entry.itemId} declared alias ${index + 1} scan surfaces differ from plan authority`, entry.itemId);
		}
	}
}

function validateAliases(entry, readRecord, strictPlanAuthority) {
	const required = requiredAliasScans(entry);
	const originArtifact = readRecord(`${FEATURE_ROOT}/${entry.claimSource.artifact}`, `${entry.itemId}.claimSource.artifact`);
	const planAuthority = strictPlanAuthority ? parsePlanAliasAuthority(originArtifact.text, entry.itemId) : null;
	const legacyAliases = strictPlanAuthority ? planAuthority?.values.map((alias) => alias.identity) ?? [] : artifactAliases(originArtifact.text, entry.itemId);
	if (entry.aliases.mode === "none") {
		const scans = [...new Set(entry.aliases.scanSurfaces)].sort(compareText);
		if (!sameStringArray(scans, required)) refuse(R.ALIAS_NONE_INVALID, `${entry.itemId} none scan surfaces are incomplete`, entry.itemId);
		if (legacyAliases.length > 0) refuse(R.ALIAS_NONE_INVALID, `${entry.itemId} declares none but its authority grounds an alias`, entry.itemId);
		for (const path of scans) readRecord(path, `${entry.itemId}.aliases.scanSurfaces ${path}`);
		return;
	}
	if (strictPlanAuthority) {
		if (planAuthority === null) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} declares aliases without a Legacy Alias Origins authority`, entry.itemId);
		assertPlanAliasMatch(entry, planAuthority);
	}
	const canonicalIdentities = new Set(entry.canonicalProducers.map((value) => value.identity));
	for (const alias of entry.aliases.values) {
		if (canonicalIdentities.has(alias.identity)) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} relabels a canonical identity as an alias`, entry.itemId);
		validateAliasOrigin(entry, alias, readRecord, strictPlanAuthority);
		const scans = [...new Set(alias.scanSurfaces)].sort(compareText);
		if (!sameStringArray(scans, required)) refuse(R.ALIAS_SCAN_INVALID, `${entry.itemId} alias scans omit a consumer class`, entry.itemId);
		for (const path of scans) {
			if (readRecord(path, `${entry.itemId}.aliases.scanSurfaces ${path}`).text.includes(alias.identity)) {
				refuse(R.ALIAS_SCAN_INVALID, `${entry.itemId} stale alias survives in ${path}`, entry.itemId);
			}
		}
	}
}

function validateAliasOrigin(entry, alias, readRecord, requireFullCommit = false) {
	const origin = alias.origin;
	if (origin.identity !== alias.identity) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} alias origin identity disagrees`, entry.itemId);
	let text;
	if (origin.kind === "artifact") {
		const record = readRecord(`${FEATURE_ROOT}/${origin.artifact}`, `${entry.itemId}.aliases.origin.artifact`);
		text = markdownSection(record.text, origin.section, R.ALIAS_ORIGIN_INVALID, origin.artifact).join("\n");
	} else if (origin.kind === "current-contract") {
		text = readRecord(origin.path, `${entry.itemId}.aliases.origin.path`).text;
	} else {
		if (requireFullCommit && !/^[0-9a-f]{40}$/.test(origin.commit)) {
			refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} commit origin must use a full lowercase SHA`, entry.itemId);
		}
		if (typeof readRecord.readCommit !== "function") refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} has no commit reader`, entry.itemId);
		let record;
		try { record = readRecord.readCommit(origin.commit, origin.path); } catch { record = null; }
		text = typeof record === "string" ? record : isObject(record) && typeof record.text === "string" ? record.text : null;
		if (text === null) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} commit origin is unresolved`, entry.itemId);
	}
	if (!text.includes(alias.identity)) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} origin does not contain alias ${alias.identity}`, entry.itemId);
}

class JavaScriptLexicalAmbiguity extends Error {
	constructor(detail, index) {
		super(`${detail} at byte ${index}`);
		this.name = "JavaScriptLexicalAmbiguity";
		this.index = index;
	}
}

const REGEX_PREFIX_KEYWORDS = new Set([
	"await", "case", "delete", "do", "else", "in", "instanceof", "new", "of", "return", "throw", "typeof", "void", "yield"
]);
const REGEX_PREFIX_PUNCTUATORS = new Set([
	"(", "[", "{", ",", ";", ":", "?", "=", "==", "===", "!=", "!==", "=>", "+", "-", "*", "%", "**",
	"&", "|", "^", "!", "~", "&&", "||", "??", "<", ">", "<=", ">=", "<<", ">>", ">>>", "+=", "-=", "*=",
	"/=", "%=", "&=", "|=", "^=", "&&=", "||=", "??=", "<<=", ">>=", ">>>=", "?."
]);
const JAVASCRIPT_PUNCTUATORS = [
	">>>=", "===", "!==", ">>>", "**=", "&&=", "||=", "??=", "<<=", ">>=", "=>", "==", "!=", "<=", ">=", "++", "--",
	"&&", "||", "??", "?.", "**", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "..."
];

function javascriptLexicalFailure(detail, index) {
	throw new JavaScriptLexicalAmbiguity(detail, index);
}

function scanQuotedJavaScriptString(text, start, quote) {
	let index = start + 1;
	while (index < text.length) {
		const char = text[index];
		if (char === quote) return index + 1;
		if (char === "\n" || char === "\r") javascriptLexicalFailure("unterminated JavaScript string", start);
		if (char === "\\") {
			index += 1;
			if (index >= text.length) javascriptLexicalFailure("unterminated JavaScript string escape", start);
			if (text[index] === "\r" && text[index + 1] === "\n") index += 1;
		}
		index += 1;
	}
	javascriptLexicalFailure("unterminated JavaScript string", start);
}

function scanJavaScriptBlockComment(text, start) {
	const end = text.indexOf("*/", start + 2);
	if (end < 0) javascriptLexicalFailure("unterminated JavaScript block comment", start);
	return end + 2;
}

function scanJavaScriptRegex(text, start) {
	let index = start + 1;
	let inClass = false;
	while (index < text.length) {
		const char = text[index];
		if (char === "\n" || char === "\r") javascriptLexicalFailure("unterminated JavaScript regular expression", start);
		if (char === "\\") {
			index += 2;
			continue;
		}
		if (char === "[") inClass = true;
		else if (char === "]" && inClass) inClass = false;
		else if (char === "/" && !inClass) {
			index += 1;
			while (/[A-Za-z]/.test(text[index] ?? "")) index += 1;
			return index;
		}
		index += 1;
	}
	javascriptLexicalFailure("unterminated JavaScript regular expression", start);
}

function regexMayStartAfter(previous) {
	if (previous === null) return true;
	if (previous.type === "keyword") return REGEX_PREFIX_KEYWORDS.has(previous.value);
	return previous.type === "punctuator" && REGEX_PREFIX_PUNCTUATORS.has(previous.value);
}

function scanTemplateExpression(text, start) {
	let index = start;
	let depth = 1;
	let previous = null;
	while (index < text.length) {
		const char = text[index];
		if (/\s/.test(char)) { index += 1; continue; }
		if (char === "/" && text[index + 1] === "/") {
			const newline = text.indexOf("\n", index + 2);
			index = newline < 0 ? text.length : newline + 1;
			continue;
		}
		if (char === "/" && text[index + 1] === "*") { index = scanJavaScriptBlockComment(text, index); continue; }
		if (char === "\"" || char === "'") {
			index = scanQuotedJavaScriptString(text, index, char);
			previous = { type: "literal", value: "string" };
			continue;
		}
		if (char === "`") {
			index = scanJavaScriptTemplate(text, index).end;
			previous = { type: "literal", value: "template" };
			continue;
		}
		if (char === "/" && regexMayStartAfter(previous)) {
			index = scanJavaScriptRegex(text, index);
			previous = { type: "literal", value: "regex" };
			continue;
		}
		if (/[A-Za-z_$]/.test(char)) {
			const end = scanJavaScriptIdentifier(text, index);
			const value = text.slice(index, end);
			previous = { type: REGEX_PREFIX_KEYWORDS.has(value) ? "keyword" : "identifier", value };
			index = end;
			continue;
		}
		if (/[0-9]/.test(char)) {
			index = scanJavaScriptNumber(text, index);
			previous = { type: "literal", value: "number" };
			continue;
		}
		if (char === "{") depth += 1;
		else if (char === "}") {
			depth -= 1;
			if (depth === 0) return index + 1;
		}
		const punctuator = javascriptPunctuatorAt(text, index);
		previous = { type: "punctuator", value: punctuator };
		index += punctuator.length;
	}
	javascriptLexicalFailure("unterminated JavaScript template expression", start - 2);
}

function scanJavaScriptTemplate(text, start) {
	let index = start + 1;
	let dynamic = false;
	while (index < text.length) {
		const char = text[index];
		if (char === "\\") {
			index += 2;
			continue;
		}
		if (char === "`") return { end: index + 1, dynamic };
		if (char === "$" && text[index + 1] === "{") {
			dynamic = true;
			index = scanTemplateExpression(text, index + 2);
			continue;
		}
		index += 1;
	}
	javascriptLexicalFailure("unterminated JavaScript template literal", start);
}

function scanJavaScriptIdentifier(text, start) {
	let index = start + 1;
	while (/[\w$]/.test(text[index] ?? "")) index += 1;
	return index;
}

function scanJavaScriptNumber(text, start) {
	let index = start + 1;
	while (/[A-Za-z0-9_.]/.test(text[index] ?? "")) index += 1;
	return index;
}

function javascriptPunctuatorAt(text, index) {
	return JAVASCRIPT_PUNCTUATORS.find((value) => text.startsWith(value, index)) ?? text[index];
}

function decodeStaticJavaScriptString(raw, quote, start) {
	let value = "";
	for (let index = 0; index < raw.length; index += 1) {
		const char = raw[index];
		if (char !== "\\") { value += char; continue; }
		index += 1;
		if (index >= raw.length) javascriptLexicalFailure("unterminated JavaScript string escape", start);
		const escaped = raw[index];
		const simple = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "0": "\0", "\\": "\\", "\"": "\"", "'": "'", "`": "`" };
		if (Object.hasOwn(simple, escaped)) { value += simple[escaped]; continue; }
		if (escaped === "\n") continue;
		if (escaped === "\r") { if (raw[index + 1] === "\n") index += 1; continue; }
		if (escaped === "x") {
			const digits = raw.slice(index + 1, index + 3);
			if (!/^[0-9a-fA-F]{2}$/.test(digits)) javascriptLexicalFailure("invalid hexadecimal JavaScript string escape", start);
			value += String.fromCodePoint(Number.parseInt(digits, 16));
			index += 2;
			continue;
		}
		if (escaped === "u") {
			const braced = /^\{([0-9a-fA-F]+)\}/.exec(raw.slice(index + 1));
			if (braced) {
				const codePoint = Number.parseInt(braced[1], 16);
				if (codePoint > 0x10ffff) javascriptLexicalFailure("invalid braced Unicode JavaScript string escape", start);
				value += String.fromCodePoint(codePoint);
				index += braced[0].length;
				continue;
			}
			const digits = raw.slice(index + 1, index + 5);
			if (!/^[0-9a-fA-F]{4}$/.test(digits)) javascriptLexicalFailure("invalid Unicode JavaScript string escape", start);
			value += String.fromCodePoint(Number.parseInt(digits, 16));
			index += 4;
			continue;
		}
		if (/[1-9]/.test(escaped)) javascriptLexicalFailure("ambiguous legacy octal JavaScript string escape", start);
		value += escaped;
	}
	if (quote === "`" && value.includes("${")) javascriptLexicalFailure("ambiguous static JavaScript template title", start);
	return value;
}

function tokenizeJavaScript(text) {
	return memoizedTextAnalysis("javascriptTokens", text, () => tokenizeJavaScriptUncached(text));
}

function tokenizeJavaScriptUncached(text) {
	const tokens = [];
	let index = 0;
	let previous = null;
	while (index < text.length) {
		const char = text[index];
		if (/\s/.test(char)) { index += 1; continue; }
		if (char === "/" && text[index + 1] === "/") {
			const newline = text.indexOf("\n", index + 2);
			index = newline < 0 ? text.length : newline + 1;
			continue;
		}
		if (char === "/" && text[index + 1] === "*") { index = scanJavaScriptBlockComment(text, index); continue; }
		if (char === "\"" || char === "'") {
			const end = scanQuotedJavaScriptString(text, index, char);
			const token = { type: "string", value: decodeStaticJavaScriptString(text.slice(index + 1, end - 1), char, index), start: index, end };
			tokens.push(token);
			previous = token;
			index = end;
			continue;
		}
		if (char === "`") {
			const scanned = scanJavaScriptTemplate(text, index);
			const token = { type: scanned.dynamic ? "dynamic-template" : "string", value: scanned.dynamic ? null : decodeStaticJavaScriptString(text.slice(index + 1, scanned.end - 1), char, index), start: index, end: scanned.end };
			tokens.push(token);
			previous = token;
			index = scanned.end;
			continue;
		}
		if (char === "/" && regexMayStartAfter(previous)) {
			const end = scanJavaScriptRegex(text, index);
			const token = { type: "regex", value: text.slice(index, end), start: index, end };
			tokens.push(token);
			previous = token;
			index = end;
			continue;
		}
		if (/[A-Za-z_$]/.test(char)) {
			const end = scanJavaScriptIdentifier(text, index);
			const value = text.slice(index, end);
			const token = { type: REGEX_PREFIX_KEYWORDS.has(value) || value === "function" || value === "async" ? "keyword" : "identifier", value, start: index, end };
			tokens.push(token);
			previous = token;
			index = end;
			continue;
		}
		if (/[0-9]/.test(char)) {
			const end = scanJavaScriptNumber(text, index);
			const token = { type: "number", value: text.slice(index, end), start: index, end };
			tokens.push(token);
			previous = token;
			index = end;
			continue;
		}
		const value = javascriptPunctuatorAt(text, index);
		const token = { type: "punctuator", value, start: index, end: index + value.length };
		tokens.push(token);
		previous = token;
		index += value.length;
	}
	return tokens;
}

function matchingToken(tokens, startIndex, open, close) {
	let depth = 0;
	for (let index = startIndex; index < tokens.length; index += 1) {
		if (tokens[index].type !== "punctuator") continue;
		if (tokens[index].value === open) depth += 1;
		else if (tokens[index].value === close) {
			depth -= 1;
			if (depth === 0) return index;
			if (depth < 0) return -1;
		}
	}
	return -1;
}

function topLevelArgumentRanges(tokens, openIndex, closeIndex) {
	const ranges = [];
	let start = openIndex + 1;
	const stack = [];
	const closingFor = { "(": ")", "[": "]", "{": "}" };
	for (let index = openIndex + 1; index < closeIndex; index += 1) {
		const value = tokens[index].value;
		if (Object.hasOwn(closingFor, value)) stack.push(closingFor[value]);
		else if ([")", "]", "}"].includes(value)) {
			if (stack.pop() !== value) javascriptLexicalFailure("ambiguous JavaScript delimiter nesting", tokens[index].start);
		} else if (value === "," && stack.length === 0) {
			ranges.push([start, index]);
			start = index + 1;
		}
	}
	if (stack.length > 0) javascriptLexicalFailure("unterminated JavaScript argument delimiter", tokens[closeIndex].start);
	ranges.push([start, closeIndex]);
	return ranges.filter(([first, last]) => first < last);
}

function callbackBodyFromArgument(tokens, first, last) {
	let arrow = -1;
	const stack = [];
	const closingFor = { "(": ")", "[": "]", "{": "}" };
	for (let index = first; index < last; index += 1) {
		const value = tokens[index].value;
		if (Object.hasOwn(closingFor, value)) stack.push(closingFor[value]);
		else if ([")", "]", "}"].includes(value)) {
			if (stack.pop() !== value) javascriptLexicalFailure("ambiguous JavaScript callback delimiter nesting", tokens[index].start);
		} else if (value === "=>" && stack.length === 0) {
			if (arrow >= 0) javascriptLexicalFailure("multiple top-level arrows in one test callback argument", tokens[index].start);
			arrow = index;
		}
	}
	if (arrow >= 0) {
		const bodyStart = arrow + 1;
		if (bodyStart >= last || tokens[bodyStart].value !== "{") return null;
		const bodyEnd = matchingToken(tokens, bodyStart, "{", "}");
		if (bodyEnd < 0 || bodyEnd >= last) javascriptLexicalFailure("unterminated or ambiguous arrow test callback body", tokens[bodyStart].start);
		return { bodyStart, bodyEnd };
	}
	let cursor = first;
	if (tokens[cursor]?.value === "async") cursor += 1;
	if (tokens[cursor]?.value !== "function") return null;
	cursor += 1;
	if (tokens[cursor]?.type === "identifier") cursor += 1;
	if (tokens[cursor]?.value !== "(") javascriptLexicalFailure("test function callback has no parameter list", tokens[cursor]?.start ?? tokens[first].start);
	const parametersEnd = matchingToken(tokens, cursor, "(", ")");
	if (parametersEnd < 0 || parametersEnd >= last || tokens[parametersEnd + 1]?.value !== "{") {
		javascriptLexicalFailure("test function callback has no unambiguous body", tokens[cursor].start);
	}
	const bodyStart = parametersEnd + 1;
	const bodyEnd = matchingToken(tokens, bodyStart, "{", "}");
	if (bodyEnd < 0 || bodyEnd >= last) javascriptLexicalFailure("unterminated test function callback body", tokens[bodyStart].start);
	return { bodyStart, bodyEnd };
}

function testDeclarations(text) {
	return memoizedTextAnalysis("testDeclarations", text, () => testDeclarationsUncached(text));
}

function testDeclarationsUncached(text) {
	const tokens = tokenizeJavaScript(text);
	const declarations = [];
	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (token.type !== "identifier" || !new Set(["test", "it"]).has(token.value) || tokens[index - 1]?.value === ".") continue;
		let cursor = index + 1;
		let modifier = null;
		if (tokens[cursor]?.value === ".") {
			const candidate = tokens[cursor + 1]?.value;
			if (!new Set(["skip", "todo", "fixme", "only"]).has(candidate)) continue;
			modifier = candidate;
			cursor += 2;
		}
		if (tokens[cursor]?.value !== "(") continue;
		const callEnd = matchingToken(tokens, cursor, "(", ")");
		if (callEnd < 0) javascriptLexicalFailure("unterminated test declaration call", tokens[cursor].start);
		const argumentsFound = topLevelArgumentRanges(tokens, cursor, callEnd);
		const titleTokens = argumentsFound[0] ? tokens.slice(argumentsFound[0][0], argumentsFound[0][1]) : [];
		if (titleTokens.length !== 1 || titleTokens[0].type !== "string") continue;
		const callbacks = argumentsFound.slice(1).map(([first, last]) => callbackBodyFromArgument(tokens, first, last)).filter(Boolean);
		if (callbacks.length > 1) javascriptLexicalFailure(`test title ${titleTokens[0].value} has multiple callback arguments`, token.start);
		const callback = callbacks[0] ?? null;
		let declarationEnd = tokens[callEnd].end;
		if (tokens[callEnd + 1]?.value === ";") declarationEnd = tokens[callEnd + 1].end;
		declarations.push({
			title: titleTokens[0].value,
			modifier,
			body: callback ? text.slice(tokens[callback.bodyStart].end, tokens[callback.bodyEnd].start) : "",
			bodyStart: callback ? tokens[callback.bodyStart].end : null,
			bodyEnd: callback ? tokens[callback.bodyEnd].start : null,
			declarationStart: token.start,
			declarationEnd
		});
		index = callEnd;
	}
	return declarations;
}

function matchingBrace(text, start) {
	if (text[start] !== "{") return -1;
	try {
		const tokens = tokenizeJavaScript(text.slice(start));
		if (tokens[0]?.value !== "{") return -1;
		const end = matchingToken(tokens, 0, "{", "}");
		return end < 0 ? -1 : start + tokens[end].start;
	} catch (error) {
		if (error instanceof JavaScriptLexicalAmbiguity) return -1;
		throw error;
	}
}

function assertionCallEnd(tokens, startIndex) {
	const token = tokens[startIndex];
	if (token?.value === "expect" && tokens[startIndex + 1]?.value === "(") {
		const inputEnd = matchingToken(tokens, startIndex + 1, "(", ")");
		if (inputEnd < 0) javascriptLexicalFailure("unterminated expect input", token.start);
		let cursor = inputEnd + 1;
		while (tokens[cursor]?.value === "." && tokens[cursor + 1]?.type === "identifier" && tokens[cursor + 2]?.value !== "(") cursor += 2;
		if (tokens[cursor]?.value !== "." || tokens[cursor + 1]?.type !== "identifier" || tokens[cursor + 2]?.value !== "(") return null;
		const matcherEnd = matchingToken(tokens, cursor + 2, "(", ")");
		if (matcherEnd < 0) javascriptLexicalFailure("unterminated expect matcher", tokens[cursor + 2].start);
		return matcherEnd;
	}
	if (token?.value === "assert") {
		let callStart = startIndex + 1;
		if (tokens[callStart]?.value === "." && tokens[callStart + 1]?.type === "identifier") callStart += 2;
		if (tokens[callStart]?.value !== "(") return null;
		const callEnd = matchingToken(tokens, callStart, "(", ")");
		if (callEnd < 0) javascriptLexicalFailure("unterminated assert call", tokens[callStart].start);
		return callEnd;
	}
	return null;
}

function extractAssertions(body) {
	const tokens = tokenizeJavaScript(body);
	const assertions = [];
	for (let index = 0; index < tokens.length; index += 1) {
		if (!new Set(["expect", "assert"]).has(tokens[index].value) || tokens[index - 1]?.value === ".") continue;
		const callEnd = assertionCallEnd(tokens, index);
		if (callEnd === null) continue;
		let startIndex = index;
		if (tokens[index - 1]?.value === "await") startIndex = index - 1;
		let endIndex = callEnd;
		if (tokens[callEnd + 1]?.value === ";") endIndex = callEnd + 1;
		const identity = body.slice(tokens[startIndex].start, tokens[endIndex].end).trim();
		if (!isNonEmptyString(identity)) javascriptLexicalFailure("empty assertion identity", tokens[index].start);
		assertions.push({
			kind: tokens[index].value === "expect" ? "expect" : "assert",
			identity,
			start: tokens[startIndex].start,
			end: tokens[endIndex].end
		});
		index = callEnd;
	}
	return assertions;
}

function languageForPath(path, itemId) {
	if (/\.(?:cjs|mjs|js)$/.test(path)) return "javascript";
	if (/\.html$/.test(path)) return "html";
	if (/\.json$/.test(path)) return "json";
	if (/\.md$/.test(path)) return "markdown";
	refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} cannot classify the language of ${path}`, itemId);
}

function deepEqualJson(left, right) {
	return JSON.stringify(canonicalObject(left)) === JSON.stringify(canonicalObject(right));
}

function markdownTables(lines, context) {
	const tables = [];
	for (let index = 0; index < lines.length - 1; index += 1) {
		if (!lines[index].trim().startsWith("|") || !lines[index + 1].trim().startsWith("|")) continue;
		const headers = parseMarkdownRow(lines[index], `${context} header`);
		const separator = parseMarkdownRow(lines[index + 1], `${context} separator`);
		if (separator.length !== headers.length || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
		const rows = [];
		let rowIndex = index + 2;
		for (; rowIndex < lines.length && lines[rowIndex].trim().startsWith("|"); rowIndex += 1) {
			const cells = parseMarkdownRow(lines[rowIndex], `${context} row ${rows.length + 1}`);
			if (cells.length !== headers.length) refuse(R.INVENTORY_SOURCE_INVALID, `${context} row ${rows.length + 1} has ${cells.length} cells for ${headers.length} columns`);
			rows.push(cells);
		}
		tables.push({ headers, rows });
		index = rowIndex - 1;
	}
	return tables;
}

function inlineCodeSpans(value) {
	const spans = [];
	for (const match of value.matchAll(/(`+)([^\r\n]*?)\1/g)) spans.push(match[2]);
	return spans;
}

function planTestCarrierCandidates(scopeId, artifact, text, readRecord, itemId) {
	const section = markdownSection(text, "Test Plan", R.INVENTORY_SOURCE_INVALID, `${FEATURE_ROOT}/${artifact}`);
	const tables = markdownTables(section, `${itemId} Test Plan`).filter(({ headers }) =>
		headers.includes("ID") && headers.includes("File / Location") && headers.includes("Command")
	);
	if (tables.length !== 1) refuse(R.INVENTORY_SOURCE_INVALID, `${itemId} Test Plan resolved ${tables.length} structural tables`, itemId);
	const table = tables[0];
	const idColumn = table.headers.indexOf("ID");
	const pathColumn = table.headers.indexOf("File / Location");
	const commandColumn = table.headers.indexOf("Command");
	const behaviorColumn = table.headers.findIndex((header) => /(?:Behavior|Persistent Title)/.test(header));
	if (behaviorColumn < 0) refuse(R.INVENTORY_SOURCE_INVALID, `${itemId} Test Plan has no behavior/title column`, itemId);
	const candidates = [];
	for (const cells of table.rows) {
		const testPlanId = stripSingleCodeSpan(cells[idColumn]);
		if (!new RegExp(`^TP-${scopeId}-\\d{2}$`).test(testPlanId)) continue;
		const paths = inlineCodeSpans(cells[pathColumn]).filter((path) => /\.(?:cjs|mjs|js)$/.test(path));
		if (paths.length !== 1) continue;
		const path = paths[0];
		const declarationText = readRecord(path, `${itemId} ${testPlanId} carrier`).text;
		let declarations;
		try { declarations = testDeclarations(declarationText); }
		catch (error) {
			if (error instanceof JavaScriptLexicalAmbiguity) refuse(R.TEST_TITLE_UNREACHABLE, `${itemId} ${testPlanId} carrier is lexically ambiguous: ${error.message}`, itemId);
			throw error;
		}
		const authorityText = `${cells[behaviorColumn]}\n${cells[commandColumn]}`;
		for (const declaration of declarations) {
			if (declaration.modifier !== null || declaration.body.length === 0 || !authorityText.includes(declaration.title)) continue;
			candidates.push({ testPlanId, path, title: declaration.title, declaration });
		}
	}
	const duplicate = firstDuplicate(candidates, (candidate) => `${candidate.path}\u0000${candidate.title}`);
	if (duplicate !== null) refuse(R.TEST_TITLE_UNREACHABLE, `${itemId} Test Plan repeats executable carrier ${duplicate}`, itemId);
	if (candidates.length === 0) refuse(R.TEST_TITLE_UNREACHABLE, `${itemId} Test Plan declares no exact executable title`, itemId);
	return candidates.sort((left, right) => compareText(left.testPlanId, right.testPlanId)
		|| compareText(left.path, right.path) || compareText(left.title, right.title));
}

function planIdentity(value) {
	const declaration = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/.exec(value.trim());
	if (declaration) return declaration[1];
	const withoutSelector = value.startsWith("#") ? value.slice(1) : value;
	const parts = withoutSelector.split(/[.:]/).filter(Boolean);
	return parts.at(-1)?.replace(/\(.*$/, "") ?? withoutSelector;
}

function compareExplicitPlanGraphs(left, right) {
	return compareText(left.carrier.testPlanId, right.carrier.testPlanId)
		|| compareText(left.carrier.path, right.carrier.path)
		|| compareText(left.carrier.title, right.carrier.title)
		|| compareText(left.chain.join("\u0000"), right.chain.join("\u0000"))
		|| compareText(left.observables.join("\u0000"), right.observables.join("\u0000"));
}

function explicitConsumerPlanGraphs(scopeId, text, carriers, itemId) {
	const section = markdownSection(text, "Consumer Impact Sweep", R.INVENTORY_SOURCE_INVALID, `${itemId} authority`);
	const candidates = [];
	for (const table of markdownTables(section, `${itemId} Consumer Impact Sweep`)) {
		for (const cells of table.rows) {
			const chainCells = cells.filter((cell) => cell.includes("→"));
			if (chainCells.length === 0 || !cells.some((cell) => /\bexact title\b/i.test(cell))) continue;
			if (chainCells.length !== 1) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} plan row has ${chainCells.length} causal chains`, itemId);
			const rowText = cells.join("\n");
			const titleMatches = carriers.filter((carrier) => rowText.includes(carrier.title));
			if (titleMatches.length !== 1) refuse(R.TEST_TITLE_UNREACHABLE, `${itemId} explicit causal row resolves ${titleMatches.length} Test Plan titles`, itemId);
			const selectedCarrier = titleMatches[0];
			const rowIds = [...new Set(rowText.match(/\bTP-\d{2}-\d{2}\b/g) ?? [])];
			if (!rowIds.includes(selectedCarrier.testPlanId)) {
				refuse(R.TEST_TITLE_UNREACHABLE, `${itemId} explicit causal row does not name ${selectedCarrier.testPlanId}`, itemId);
			}
			const identities = inlineCodeSpans(chainCells[0]);
			const observables = identities.filter((identity) => identity.startsWith("#")).map(planIdentity);
			const chain = identities.filter((identity) => !identity.startsWith("#")).map(planIdentity);
			if (chain.length < 2 || observables.length === 0 || chain.some((identity) => !/^[A-Za-z_$][\w$]*$/.test(identity))
				|| observables.some((identity) => !/^[A-Za-z][\w:-]*$/.test(identity))) {
				refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} explicit causal row must declare producer, consumer, and observable result identities`, itemId);
			}
			candidates.push({ carrier: selectedCarrier, chain, observables });
		}
	}
	const duplicateGraph = firstDuplicate(candidates, (candidate) => JSON.stringify({
		chain: candidate.chain,
		observables: candidate.observables
	}));
	if (duplicateGraph !== null) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} plan repeats explicit causal graph ${duplicateGraph}`, itemId);
	}
	const duplicateCarrier = firstDuplicate(candidates, (candidate) => [
		candidate.carrier.testPlanId,
		candidate.carrier.path,
		candidate.carrier.title
	].join("\u0000"));
	if (duplicateCarrier !== null) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} plan repeats explicit causal carrier ${duplicateCarrier}`, itemId);
	}
	return candidates.sort(compareExplicitPlanGraphs);
}

function planAllowedExecutablePaths(scopeId, text, readRecord, itemId) {
	const section = markdownSection(text, changeBoundarySection(scopeId), R.INVENTORY_SOURCE_INVALID, `${itemId} authority`);
	const allowed = [];
	let collecting = false;
	for (const line of section) {
		const label = /^\*\*(Allowed file families|Allowed files?|Allowed new files?|Allowed edits):\*\*\s*(.*)$/i.exec(line.trim());
		if (label) {
			collecting = true;
			allowed.push(label[2]);
			continue;
		}
		if (/^\*\*[^*]+:\*\*/.test(line.trim())) {
			collecting = false;
			continue;
		}
		if (collecting) allowed.push(line);
	}
	const paths = [...new Set(inlineCodeSpans(allowed.join("\n"))
		.filter((path) => !/[?*\[\]{}]/.test(path) && /\.(?:cjs|mjs|js|html)$/.test(path)))]
		.sort(compareText);
	if (paths.length === 0) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} explicit graph has no plan-allowed executable source surfaces`, itemId);
	}
	for (const path of paths) readRecord(path, `${itemId} plan-allowed source ${path}`);
	return paths;
}

function consumerMigrationAuthority(scopeId, claimSource, readRecord, itemId) {
	const path = `${FEATURE_ROOT}/${claimSource.artifact}`;
	const text = readRecord(path, `${itemId} owning plan authority`).text;
	const carriers = planTestCarrierCandidates(scopeId, claimSource.artifact, text, readRecord, itemId);
	const explicitGraphs = explicitConsumerPlanGraphs(scopeId, text, carriers, itemId);
	return {
		carriers,
		explicitGraphs,
		allowedExecutablePaths: explicitGraphs.length > 0 ? planAllowedExecutablePaths(scopeId, text, readRecord, itemId) : []
	};
}

function collectDerivedConsumerAuthority(entry, pairAuthority, readRecord) {
	const claimSource = pairAuthority.rows.get(`${entry.scopeId}:consumer`);
	if (!claimSource) refuse(R.INVENTORY_SOURCE_INVALID, `Scope ${entry.scopeId} has no authoritative consumer checklist row`, entry.itemId);
	const planPath = `${FEATURE_ROOT}/${claimSource.artifact}`;
	const planText = readRecord(planPath, `${entry.itemId} derived consumer plan authority`).text;
	const carriers = planTestCarrierCandidates(entry.scopeId, claimSource.artifact, planText, readRecord, entry.itemId);
	const explicitGraphs = explicitConsumerPlanGraphs(entry.scopeId, planText, carriers, entry.itemId);
	if (explicitGraphs.length === 0) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} owning plan declares no explicit Consumer Impact Sweep graph`, entry.itemId);
	}
	const allowedExecutablePaths = planAllowedExecutablePaths(entry.scopeId, planText, readRecord, entry.itemId);
	const sourcePaths = [...new Set(allowedExecutablePaths)].sort(compareText);
	const testPaths = [...new Set(carriers.map((carrier) => carrier.path))].sort(compareText);
	const aliasOrigins = [];
	const aliasAuthority = parsePlanAliasAuthority(planText, entry.itemId);
	if (aliasAuthority?.mode === "declared") {
		for (const alias of aliasAuthority.values) {
			const origin = alias.origin;
			if (origin.kind === "artifact") {
				const path = `${FEATURE_ROOT}/${origin.artifact}`;
				const text = readRecord(path, `${entry.itemId} derived consumer alias artifact`).text;
				aliasOrigins.push({ kind: origin.kind, path, section: origin.section, text });
			} else if (origin.kind === "current-contract") {
				const text = readRecord(origin.path, `${entry.itemId} derived consumer alias contract`).text;
				aliasOrigins.push({ kind: origin.kind, path: origin.path, text });
			} else {
				if (typeof readRecord.readCommit !== "function") refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} has no commit reader`, entry.itemId);
				let record;
				try { record = readRecord.readCommit(origin.commit, origin.path); } catch { record = null; }
				const text = typeof record === "string" ? record : isObject(record) && typeof record.text === "string" ? record.text : null;
				if (text === null) refuse(R.ALIAS_ORIGIN_INVALID, `${entry.itemId} commit origin is unresolved`, entry.itemId);
				aliasOrigins.push({ kind: origin.kind, commit: origin.commit, path: origin.path, text });
			}
		}
	}
	const authority = canonicalObject({
		itemId: entry.itemId,
		scopeId: entry.scopeId,
		claimSource,
		plan: { path: planPath, text: planText },
		sources: sourcePaths.map((path) => ({ path, text: readRecord(path, `${entry.itemId} derived consumer source ${path}`).text })),
		tests: testPaths.map((path) => ({ path, text: readRecord(path, `${entry.itemId} derived consumer test ${path}`).text })),
		aliasOrigins
	});
	const authorityKey = JSON.stringify(authority);
	const authorityCharacters = [...new Set([
		planText,
		...authority.sources.map(({ text }) => text),
		...authority.tests.map(({ text }) => text),
		...aliasOrigins.map(({ text }) => text)
	])].reduce((total, text) => total + text.length, 0);
	return { authorityKey, authorityCharacters, claimSource, planAuthority: { carriers, explicitGraphs, allowedExecutablePaths } };
}

function jsonPathsForProperty(value, property, expected, prefix = []) {
	const matches = [];
	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1) matches.push(...jsonPathsForProperty(value[index], property, expected, [...prefix, String(index)]));
		return matches;
	}
	if (!isObject(value)) return matches;
	for (const [key, child] of Object.entries(value)) {
		if (key === property && deepEqualJson(child, expected)) matches.push([...prefix, key].join("."));
		matches.push(...jsonPathsForProperty(child, property, expected, [...prefix, key]));
	}
	return matches;
}

function configKeyFromLegacyToken(text, token, itemId) {
	let parsed;
	try { parsed = JSON.parse(text); } catch { refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} producer JSON is invalid`, itemId); }
	const propertyMatch = /^\s*"([^"\\]+)"\s*:\s*([\s\S]+?)\s*,?\s*$/.exec(token);
	if (!propertyMatch) return null;
	let expected;
	try { expected = JSON.parse(propertyMatch[2].replace(/,\s*$/, "")); } catch { return null; }
	const matches = jsonPathsForProperty(parsed, propertyMatch[1], expected);
	if (matches.length !== 1 || matches[0].split(".").some((part) => /^\d+$/.test(part))) return null;
	return matches[0];
}

function exportedJavaScriptSymbol(text, name) {
	const direct = new RegExp(`\\bexport\\s+(?:async\\s+)?function\\s+${escapeRegExp(name)}\\b`).test(text);
	const mapped = new RegExp(`\\b${escapeRegExp(name)}\\s*:\\s*${escapeRegExp(name)}\\b`).test(text);
	return direct || mapped;
}

function classifyLegacyProducerToken(path, token, text, itemId) {
	const language = languageForPath(path, itemId);
	if (language === "json") {
		const configKey = configKeyFromLegacyToken(text, token, itemId);
		if (configKey !== null) return { path, language, identityKind: "config-key", identity: configKey, legacyToken: token };
	}
	const functionMatch = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(token.trim());
	const bareName = /^[A-Za-z_$][\w$]*$/.test(token) ? token : null;
	const functionName = functionMatch?.[1] ?? (bareName && new RegExp(`\\bfunction\\s+${escapeRegExp(bareName)}\\s*\\(`).test(text) ? bareName : null);
	if (functionName !== null) {
		const declarations = [...text.matchAll(new RegExp(`\\b(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegExp(functionName)}\\s*\\(`, "g"))];
		if (declarations.length !== 1) return null;
		return {
			path,
			language,
			identityKind: exportedJavaScriptSymbol(text, functionName) ? "exported-symbol" : "local-symbol",
			identity: functionName,
			legacyToken: token
		};
	}
	if (language === "html") {
		const id = /^id\s*=\s*(["'])([^"']+)\1$/.exec(token.trim())?.[2];
		if (id) return { path, language, identityKind: "dom-id", identity: id, legacyToken: token };
	}
	const count = occurrenceCount(text, token);
	if (count < 1) return null;
	return { path, language, identityKind: "contract-token", identity: token, legacyToken: token };
}

function legacyProducerCandidates(entry, readRecord) {
	const legacy = [
		...(entry.sourceSurfaces ?? []).map((value) => ({ value, authorityRank: 1 })),
		...(entry.canonicalIdentifiers ?? []).map((value) => ({ value, authorityRank: 0 }))
	];
	const candidates = [];
	for (const { value, authorityRank } of legacy) {
		if (!isObject(value) || !isNonEmptyString(value.path) || !isNonEmptyString(value.token)) continue;
		const text = readRecord(value.path, `${entry.itemId} legacy producer ${value.path}`).text;
		const candidate = classifyLegacyProducerToken(value.path, value.token, text, entry.itemId);
		if (candidate) candidates.push({ ...candidate, authorityRank });
	}
	const unique = new Map();
	for (const candidate of candidates) unique.set(JSON.stringify(canonicalObject(candidate)), candidate);
	return [...unique.values()];
}

function htmlLoadsProducer(consumerPath, consumerText, producerPath) {
	return [...consumerText.matchAll(/<script[^>]+\bsrc\s*=\s*(["'])(.*?)\1/gi)]
		.some((match) => {
			const reference = match[2].split(/[?#]/, 1)[0];
			if (/^(?:[a-z]+:|\/\/|\/)/i.test(reference)) return false;
			return resolveLocalReference(consumerPath, reference.startsWith(".") ? reference : `./${reference}`) === producerPath;
		});
}

function namedImportConnects(consumerPath, consumerText, producerPath, identity) {
	return parseNamedImports(consumerText).some((candidate) =>
		resolveLocalReference(consumerPath, candidate.reference) === producerPath
		&& candidate.names.some((name) => name.imported === identity)
	);
}

function commonJsConnects(consumerPath, consumerText, producerPath) {
	for (const match of consumerText.matchAll(/\brequire\s*\(\s*(["'])([^"']+)\1\s*\)/g)) {
		if (resolveLocalReference(consumerPath, match[2]) === producerPath) return true;
	}
	return false;
}

function exportedForwarders(producerText, producerIdentity, consumerText, itemId) {
	if (!/^[A-Za-z_$][\w$]*$/.test(producerIdentity)) return [];
	const functionNames = [...new Set([...producerText.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)]
		.map((match) => match[1]))];
	const bodies = new Map();
	for (const name of functionNames) {
		const definitions = functionDefinitions(producerText, name, itemId);
		if (definitions.length === 1) bodies.set(name, definitions[0].body);
	}
	const reachable = new Set([producerIdentity]);
	for (let pass = 0; pass < bodies.size; pass += 1) {
		let changed = false;
		for (const [name, body] of bodies) {
			if (reachable.has(name)) continue;
			if ([...reachable].some((callee) => new RegExp(`(?:\\.|\\b)${escapeRegExp(callee)}\\s*\\(`).test(body))) {
				reachable.add(name);
				changed = true;
			}
		}
		if (!changed) break;
	}
	return [...reachable].filter((name) => name !== producerIdentity
		&& exportedJavaScriptSymbol(producerText, name)
		&& new RegExp(`(?:\\.|\\b)${escapeRegExp(name)}\\s*\\(`).test(consumerText)).sort(compareText);
}

function producerConnection(candidate, entry, legacyConsumer, consumerText) {
	const producerText = candidate._producerText;
	const canonicalBridges = (entry.canonicalIdentifiers ?? [])
		.filter((value) => value.path === candidate.path && isNonEmptyString(value.token) && producerText.includes(value.token) && consumerText.includes(value.token));
	const directIdentity = consumerText.includes(candidate.identity);
	if (candidate.path === legacyConsumer.path) {
		return { dependencyEdge: "same-file", score: directIdentity ? 500 : 300, reason: "same-file" };
	}
	if (languageForPath(legacyConsumer.path, entry.itemId) === "html" && htmlLoadsProducer(legacyConsumer.path, consumerText, candidate.path)) {
		if (directIdentity) return { dependencyEdge: "script-global", score: 700, reason: "script-global-direct" };
		if (exportedForwarders(producerText, candidate.identity, consumerText, entry.itemId).length > 0) {
			return { dependencyEdge: "script-global", score: 675, reason: "script-global-forwarded" };
		}
		if (canonicalBridges.length > 0) return { dependencyEdge: "script-global", score: 650, reason: "script-global-contract" };
		return null;
	}
	if (namedImportConnects(legacyConsumer.path, consumerText, candidate.path, candidate.identity)) {
		return { dependencyEdge: "static-import", score: 800, reason: "static-import" };
	}
	if (commonJsConnects(legacyConsumer.path, consumerText, candidate.path)) {
		return { dependencyEdge: "commonjs-require", score: directIdentity ? 750 : 600, reason: "commonjs-require" };
	}
	const producerReference = consumerText.includes(candidate.path) || consumerText.includes(posix.basename(candidate.path));
	if (producerReference && (directIdentity || canonicalBridges.length > 0 || candidate.language === "html" || candidate.language === "json")) {
		return { dependencyEdge: "registry-reference", score: directIdentity ? 550 : 450, reason: "registry-reference" };
	}
	if (canonicalBridges.length > 0) return { dependencyEdge: "registry-reference", score: 400, reason: "shared-contract" };
	return null;
}

function selectProducer(entry, legacyConsumers, readRecord, preferredIdentity = null) {
	const candidates = legacyProducerCandidates(entry, readRecord).map((candidate) => ({
		...candidate,
		_producerText: readRecord(candidate.path, `${entry.itemId} producer candidate`).text
	})).filter((candidate) => preferredIdentity === null || candidate.identity === preferredIdentity || planIdentity(candidate.legacyToken) === preferredIdentity);
	if (candidates.length === 0) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} has no structurally present v1 producer token`, entry.itemId);
	const ranked = candidates.map((candidate) => {
		const connections = legacyConsumers.map((consumer) => {
			const text = readRecord(consumer.path, `${entry.itemId} consumer candidate ${consumer.path}`).text;
			return producerConnection(candidate, entry, consumer, text);
		});
		return { candidate, connections, score: connections.every(Boolean) ? connections.reduce((sum, value) => sum + value.score, 0) : -1 };
	}).filter((value) => value.score >= 0).sort((left, right) => right.score - left.score
		|| right.candidate.authorityRank - left.candidate.authorityRank
		|| compareText(left.candidate.path, right.candidate.path)
		|| compareText(left.candidate.identity, right.candidate.identity));
	if (ranked.length === 0) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} has no v1 producer token connected to every declared consumer surface`, entry.itemId);
	if (ranked.length > 1 && ranked[0].score === ranked[1].score
		&& ranked[0].candidate.authorityRank === ranked[1].candidate.authorityRank) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} has ambiguous equally grounded producer tokens ${ranked[0].candidate.legacyToken} and ${ranked[1].candidate.legacyToken}`, entry.itemId);
	}
	const selected = ranked[0];
	const producer = {
		path: selected.candidate.path,
		language: selected.candidate.language,
		identityKind: selected.candidate.identityKind,
		identity: selected.candidate.identity
	};
	return { producer, legacyToken: selected.candidate.legacyToken, connections: selected.connections };
}

function classifyConsumerUse(legacyConsumer, text, itemId) {
	if (!isObject(legacyConsumer) || !isNonEmptyString(legacyConsumer.path) || !isNonEmptyString(legacyConsumer.token)) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} has an invalid v1 consumer surface`, itemId);
	}
	if (!text.includes(legacyConsumer.token)) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} consumer token ${legacyConsumer.token} is absent from ${legacyConsumer.path}`, itemId);
	const language = languageForPath(legacyConsumer.path, itemId);
	let useKind = "read";
	if (language === "json" || language === "markdown" || legacyConsumer.path === "index.html") useKind = "registry";
	else if (/\b(?:render|append|setText|textContent|innerHTML)\b/i.test(legacyConsumer.token) || isNonEmptyString(legacyConsumer.consumerClass)) useKind = "render";
	else if (new RegExp(`${escapeRegExp(legacyConsumer.token)}\\s*\\(`).test(text)) useKind = "call";
	return { path: legacyConsumer.path, language, useKind, useIdentity: legacyConsumer.token };
}

function observerNeedles(legacyConsumer, observableIdentities = []) {
	const values = [legacyConsumer.token, legacyConsumer.consumerClass, ...observableIdentities];
	for (const value of [legacyConsumer.token, legacyConsumer.consumerClass, ...observableIdentities]) {
		if (!isNonEmptyString(value)) continue;
		const attribute = /^(?:id|role|data-[\w-]+)\s*=\s*(["'])([^"']+)\1$/.exec(value.trim());
		if (attribute) values.push(attribute[2], `#${attribute[2]}`);
		if (/^[A-Za-z][\w:-]*$/.test(value)) values.push(`#${value}`, `[data-${value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}]`);
	}
	return [...new Set(values.filter(isNonEmptyString))].sort((left, right) => right.length - left.length || compareText(left, right));
}

function variableAssignmentsBefore(body, end) {
	const prefix = body.slice(0, end);
	const assignments = [];
	for (const match of prefix.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g)) {
		assignments.push({ name: match[1], expression: match[2] });
	}
	return assignments;
}

function assertionObservation(assertion, body, legacyConsumer, observableIdentities = []) {
	const needles = observerNeedles(legacyConsumer, observableIdentities);
	const direct = needles.filter((needle) => assertion.identity.includes(needle));
	if (direct.length > 0) return { strength: 3000 + direct[0].length, reason: `direct:${direct[0]}` };
	const assignments = variableAssignmentsBefore(body, assertion.start);
	const tainted = new Set();
	let changed = true;
	while (changed) {
		changed = false;
		for (const assignment of assignments) {
			if (tainted.has(assignment.name)) continue;
			const directAssignment = needles.some((needle) => assignment.expression.includes(needle));
			const derivedAssignment = [...tainted].some((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(assignment.expression));
			if (directAssignment || derivedAssignment) { tainted.add(assignment.name); changed = true; }
		}
	}
	const observedVariables = [...tainted].filter((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(assertion.identity));
	if (observedVariables.length > 0) return { strength: 2000 + observedVariables[0].length, reason: `derived:${observedVariables[0]}` };
	return null;
}

function observedAssertions(entry, declaration, legacyConsumer, observableIdentities = []) {
	let assertions;
	try { assertions = extractAssertions(declaration.body); }
	catch (error) {
		if (error instanceof JavaScriptLexicalAmbiguity) {
			refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} cannot parse assertions for ${declaration.title}: ${error.message}`, entry.itemId);
		}
		throw error;
	}
	return assertions.map((assertion) => ({ assertion, observation: assertionObservation(assertion, declaration.body, legacyConsumer, observableIdentities) }))
		.filter((value) => value.observation !== null)
		.sort((left, right) => right.observation.strength - left.observation.strength || left.assertion.start - right.assertion.start);
}

function selectObservedAssertion(entry, declaration, legacyConsumer, observableIdentities = []) {
	const observed = observedAssertions(entry, declaration, legacyConsumer, observableIdentities);
	if (observed.length === 0) {
		refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} title ${declaration.title} has no assertion that observes consumer ${legacyConsumer.token}`, entry.itemId);
	}
	return observed[0].assertion;
}

function functionDefinitions(text, name, itemId) {
	const scriptRegions = [...text.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
	const regions = scriptRegions.length > 0 ? scriptRegions : [text];
	const matches = regions.flatMap((region) => [...region.matchAll(new RegExp(`\\b(?:async\\s+)?function\\s+${escapeRegExp(name)}\\s*\\([^)]*\\)\\s*\\{`, "g"))]
		.map((match) => ({ match, region })));
	return matches.map(({ match, region }) => {
		const open = match.index + match[0].length - 1;
		const close = matchingBrace(region, open);
		if (close < 0) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} cannot resolve function ${name} body`, itemId);
		return { body: region.slice(open + 1, close) };
	});
}

function resolvePlanFunctionNode(entry, identity, paths, readRecord) {
	const matches = [];
	for (const path of paths) {
		const record = readRecord(path, `${entry.itemId} explicit graph source ${path}`);
		for (const definition of functionDefinitions(record.text, identity, entry.itemId)) {
			matches.push({
				path,
				language: languageForPath(path, entry.itemId),
				identityKind: exportedJavaScriptSymbol(record.text, identity) ? "exported-symbol" : "local-symbol",
				identity,
				body: definition.body,
				text: record.text
			});
		}
	}
	if (matches.length !== 1) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan function ${identity} resolved ${matches.length} times across allowed source surfaces`, entry.itemId);
	}
	return matches[0];
}

function graphDependencyConnection(entry, producer, consumer) {
	return producerConnection(
		{ ...producer, legacyToken: producer.identity, _producerText: producer.text },
		entry,
		{ path: consumer.path },
		consumer.text
	);
}

function callsGraphNode(body, identity) {
	return new RegExp(`(?:\\.|\\b)${escapeRegExp(identity)}\\s*\\(`).test(body);
}

function orderedCommonCaller(nodes, left, right, itemId) {
	const matches = [];
	const records = new Map(nodes.map((node) => [node.path, node.text]));
	for (const [path, text] of records) {
		const names = [...new Set([...text.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)]
			.map((match) => match[1]))].sort(compareText);
		for (const name of names) {
			for (const definition of functionDefinitions(text, name, itemId)) {
				const leftMatch = new RegExp(`(?:\\.|\\b)${escapeRegExp(left.identity)}\\s*\\(`).exec(definition.body);
				const rightMatch = new RegExp(`(?:\\.|\\b)${escapeRegExp(right.identity)}\\s*\\(`).exec(definition.body);
				if (leftMatch && rightMatch && leftMatch.index < rightMatch.index) matches.push(`${path}::${name}`);
			}
		}
	}
	return [...new Set(matches)].sort(compareText);
}

function stringConstants(text) {
	const constants = new Map();
	for (const match of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(["'])([^"'\r\n]+)\2\s*;/g)) {
		if (constants.has(match[1]) && constants.get(match[1]) !== match[3]) constants.set(match[1], null);
		else if (!constants.has(match[1])) constants.set(match[1], match[3]);
	}
	return constants;
}

function storageAccessKeys(node, method) {
	const constants = stringConstants(node.text);
	const keys = [];
	const pattern = new RegExp(`\\.\\s*${method}\\s*\\(\\s*(?:([A-Za-z_$][\\w$]*)|(["'])([^"'\\r\\n]+)\\2)`, "g");
	for (const match of node.body.matchAll(pattern)) {
		const key = match[1] ? constants.get(match[1]) : match[3];
		if (isNonEmptyString(key)) keys.push(key);
	}
	return [...new Set(keys)].sort(compareText);
}

function sharedStorageKeys(nodes, edgeIndex) {
	const written = new Set(nodes.slice(0, edgeIndex + 1).flatMap((node) => storageAccessKeys(node, "setItem")));
	return storageAccessKeys(nodes[edgeIndex + 1], "getItem").filter((key) => written.has(key));
}

function hasHistoryReturnEdge(left, right) {
	return /\b(?:root|window)\.history\.back\s*\(/.test(left.body)
		&& /\b(?:root|window)\.history\.state\b/.test(right.body);
}

function validateExplicitGraphEdge(entry, nodes, edgeIndex) {
	const left = nodes[edgeIndex];
	const right = nodes[edgeIndex + 1];
	if (callsGraphNode(right.body, left.identity)) {
		if (!graphDependencyConnection(entry, left, right)) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan edge ${left.identity} -> ${right.identity} has no classified dependency`, entry.itemId);
		}
		return;
	}
	if (callsGraphNode(left.body, right.identity)) {
		if (!graphDependencyConnection(entry, right, left)) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan edge ${left.identity} -> ${right.identity} has no classified dependency`, entry.itemId);
		}
		return;
	}
	if (orderedCommonCaller(nodes, left, right, entry.itemId).length > 0) return;
	if (sharedStorageKeys(nodes, edgeIndex).length > 0) return;
	if (hasHistoryReturnEdge(left, right)) return;
	refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan edge ${left.identity} -> ${right.identity} is disconnected`, entry.itemId);
}

function reachableLocalPlanNodes(entry, nodes) {
	const reachable = [];
	const queued = [...nodes];
	const visited = new Set();
	const definitionsByPathAndName = new Map();
	while (queued.length > 0) {
		const node = queued.shift();
		const key = `${node.path}\u0000${node.identity}`;
		if (visited.has(key)) continue;
		visited.add(key);
		reachable.push(node);
		const names = [...new Set([...node.body.matchAll(/(?:\.|\b)([A-Za-z_$][\w$]*)\s*\(/g)]
			.map((match) => match[1]))].sort(compareText);
		for (const name of names) {
			const definitionKey = `${node.path}\u0000${name}`;
			if (!definitionsByPathAndName.has(definitionKey)) {
				definitionsByPathAndName.set(definitionKey, functionDefinitions(node.text, name, entry.itemId));
			}
			const definitions = definitionsByPathAndName.get(definitionKey);
			if (definitions.length !== 1) continue;
			queued.push({ ...node, identity: name, body: definitions[0].body });
		}
	}
	return reachable;
}

function resolveExplicitConsumerGraph(entry, authority, graph, readRecord) {
	const nodes = graph.chain.map((identity) => resolvePlanFunctionNode(entry, identity, authority.allowedExecutablePaths, readRecord));
	for (let index = 0; index < nodes.length - 1; index += 1) validateExplicitGraphEdge(entry, nodes, index);
	const producerNode = nodes[0];
	const consumerNode = nodes.at(-1);
	const observableNodes = reachableLocalPlanNodes(entry, nodes);
	for (const observable of graph.observables) {
		const producers = observableNodes.filter((node) => node.body.includes(observable));
		if (producers.length === 0) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan observable ${observable} is absent from the connected graph`, entry.itemId);
		}
	}
	const dependency = graphDependencyConnection(entry, producerNode, consumerNode);
	if (!dependency) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} plan consumer ${consumerNode.identity} has no classified dependency on ${producerNode.identity}`, entry.itemId);
	}
	return {
		producer: {
			path: producerNode.path,
			language: producerNode.language,
			identityKind: producerNode.identityKind,
			identity: producerNode.identity
		},
		consumer: {
			path: consumerNode.path,
			language: consumerNode.language,
			dependencyEdge: dependency.dependencyEdge,
			useKind: "render",
			useIdentity: consumerNode.identity
		},
		observer: { path: consumerNode.path, token: consumerNode.identity },
		observableIdentities: graph.observables.flatMap((identity) => [identity, `#${identity}`])
	};
}

function selectPlanCarrier(entry, authority, legacyConsumer, observableIdentities, explicitGraph = null) {
	const evaluated = authority.carriers.map((carrier) => ({
		carrier,
		observed: observedAssertions(entry, carrier.declaration, legacyConsumer, observableIdentities)
	})).filter(({ observed }) => observed.length > 0);
	if (explicitGraph) {
		const selected = evaluated.filter(({ carrier }) => carrier.path === explicitGraph.carrier.path
			&& carrier.title === explicitGraph.carrier.title);
		if (selected.length !== 1) {
			refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} explicit plan carrier has no assertion connected to its declared observable result`, entry.itemId);
		}
		return selected[0];
	}
	if (evaluated.length === 1) return evaluated[0];
	const legacyCandidates = Array.isArray(entry.testCarriers) ? entry.testCarriers : [];
	const confirmedLegacy = evaluated.filter(({ carrier }) => legacyCandidates.some((candidate) =>
		candidate.path === carrier.path && candidate.token === carrier.title));
	if (confirmedLegacy.length === 1) return confirmedLegacy[0];
	if (evaluated.length === 0) refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} owning Test Plan has no assertion connected to consumer ${legacyConsumer.token}`, entry.itemId);
	refuse(R.TEST_TITLE_UNREACHABLE, `${entry.itemId} owning Test Plan has ${evaluated.length} connected carriers without one unambiguous selection`, entry.itemId);
}

function canonicalUnique(values) {
	const valuesByCanonicalJson = new Map();
	for (const value of values) {
		const canonicalJson = JSON.stringify(canonicalObject(value));
		if (!valuesByCanonicalJson.has(canonicalJson)) valuesByCanonicalJson.set(canonicalJson, value);
	}
	return [...valuesByCanonicalJson.entries()]
		.sort(([left], [right]) => compareText(left, right))
		.map(([, value]) => value);
}

function buildCanonicalConsumerEntry(sourceEntry, pairAuthority, readRecord, {
	requireExplicitPlanAuthority = false,
	preparedClaimSource = null,
	preparedPlanAuthority = null
} = {}) {
	const claimSource = preparedClaimSource ?? pairAuthority.rows.get(`${sourceEntry.scopeId}:consumer`);
	if (!claimSource) refuse(R.INVENTORY_SOURCE_INVALID, `Scope ${sourceEntry.scopeId} has no authoritative consumer checklist row`, sourceEntry.itemId);
	const planAuthority = preparedPlanAuthority ?? consumerMigrationAuthority(sourceEntry.scopeId, claimSource, readRecord, sourceEntry.itemId);
	const graphs = planAuthority.explicitGraphs;
	if (requireExplicitPlanAuthority && graphs.length === 0) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${sourceEntry.itemId} owning plan declares no explicit Consumer Impact Sweep graph`, sourceEntry.itemId);
	}
	const legacyConsumers = sourceEntry.consumerSurfaces;
	const producers = [];
	const consumers = [];
	const tests = [];
	const bindings = [];
	if (graphs.length > 0) {
		for (const [index, graph] of graphs.entries()) {
			const resolved = resolveExplicitConsumerGraph(sourceEntry, planAuthority, graph, readRecord);
			const planCarrier = selectPlanCarrier(sourceEntry, planAuthority, resolved.observer, resolved.observableIdentities, graph);
			const assertion = planCarrier.observed[0].assertion;
			const test = {
				path: planCarrier.carrier.path,
				title: planCarrier.carrier.title,
				assertionKind: assertion.kind === "expect" ? "executable-expect" : "node-assertion",
				assertionIdentity: assertion.identity
			};
			producers.push(resolved.producer);
			consumers.push(resolved.consumer);
			tests.push(test);
			bindings.push({
				bindingId: `SCOPE-${sourceEntry.scopeId}-CONSUMER-${String(index + 1).padStart(2, "0")}`,
				producer: resolved.producer,
				consumer: resolved.consumer,
				test
			});
		}
	} else {
		if (!Array.isArray(legacyConsumers) || legacyConsumers.length === 0) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${sourceEntry.itemId} has no v1 consumer surfaces`, sourceEntry.itemId);
		}
		const selected = selectProducer(sourceEntry, legacyConsumers, readRecord);
		const producer = selected.producer;
		producers.push(producer);
		for (const [index, legacyConsumer] of legacyConsumers.entries()) {
			const consumerText = readRecord(legacyConsumer.path, `${sourceEntry.itemId} v1 consumer ${legacyConsumer.path}`).text;
			const consumer = {
				...classifyConsumerUse(legacyConsumer, consumerText, sourceEntry.itemId),
				dependencyEdge: selected.connections[index].dependencyEdge
			};
			const planCarrier = selectPlanCarrier(sourceEntry, planAuthority, legacyConsumer, []);
			const assertion = planCarrier.observed[0].assertion;
			const test = {
				path: planCarrier.carrier.path,
				title: planCarrier.carrier.title,
				assertionKind: assertion.kind === "expect" ? "executable-expect" : "node-assertion",
				assertionIdentity: assertion.identity
			};
			consumers.push(consumer);
			tests.push(test);
			bindings.push({
				bindingId: `SCOPE-${sourceEntry.scopeId}-CONSUMER-${String(index + 1).padStart(2, "0")}`,
				producer,
				consumer,
				test
			});
		}
	}
	const canonicalProducers = canonicalUnique(producers);
	const consumerSurfaces = canonicalUnique(consumers);
	const testCarriers = canonicalUnique(tests);
	const scanSurfaces = [...new Set([
		...canonicalProducers.map((value) => value.path),
		...consumerSurfaces.map((value) => value.path),
		...testCarriers.map((value) => value.path)
	])].sort(compareText);
	const authorityText = readRecord(`${FEATURE_ROOT}/${claimSource.artifact}`, `${sourceEntry.itemId} alias authority`).text;
	const aliasAuthority = parsePlanAliasAuthority(authorityText, sourceEntry.itemId);
	if (aliasAuthority !== null) {
		for (const [index, alias] of aliasAuthority.values.entries()) {
			if (!sameStringArray(alias.scanSurfaces, scanSurfaces)) {
				refuse(R.ALIAS_SCAN_INVALID, `${sourceEntry.itemId} plan alias ${index + 1} scan surfaces do not equal the derived producer, consumer, and test paths`, sourceEntry.itemId);
			}
			validateAliasOrigin(sourceEntry, alias, readRecord, true);
		}
	}
	return {
		itemId: sourceEntry.itemId,
		scopeId: sourceEntry.scopeId,
		kind: "consumer",
		dodClaim: claimSource.rowIdentity,
		claimSource: { artifact: claimSource.artifact, section: claimSource.section, rowIdentity: claimSource.rowIdentity },
		canonicalProducers,
		consumerSurfaces,
		testCarriers,
		aliases: aliasAuthority ?? {
			mode: "none",
			reason: `The authoritative Scope ${sourceEntry.scopeId} artifact contains no Legacy Alias Origins section.`,
			scanSurfaces
		},
		causalBindings: bindings
	};
}

function assertLegacyManifestForMigration(manifest) {
	assertExactKeys(manifest, ROOT_KEYS, "v1 manifest root");
	if (manifest.schemaVersion !== "spec008-scope-claims/v1") refuse(R.MANIFEST_SCHEMA_INVALID, "--emit-v2-manifest requires the committed v1 manifest");
	if (manifest.specId !== SPEC_ID) refuse(R.MANIFEST_SCHEMA_INVALID, `v1 specId must equal ${SPEC_ID}`);
	assertArray(manifest.entries, "v1 manifest.entries");
	const pairs = manifest.entries.map(({ scopeId, kind }) => ({ scopeId, kind })).sort(compareScopeKind).map(pairKey);
	const expected = EXPECTED_PAIRS.map(pairKey);
	if (firstDuplicate(manifest.entries, (entry) => entry.itemId) !== null
		|| firstDuplicate(manifest.entries, (entry) => `${entry.scopeId}:${entry.kind}`) !== null
		|| !sameStringArray(pairs, expected)) {
		refuse(R.CANONICAL_PAIR_SET_MISMATCH, "v1 manifest does not contain the exact canonical 41-pair set");
	}
}

function assertManifestForV2Emission(manifest, context) {
	if (manifest.schemaVersion === "spec008-scope-claims/v1") {
		assertLegacyManifestForMigration(manifest);
		return;
	}
	if (manifest.schemaVersion !== SCHEMA_VERSION) {
		refuse(R.MANIFEST_SCHEMA_INVALID, "--emit-v2-manifest requires a v1 migration or v2 refresh manifest");
	}
	assertManifestSchema(manifest);
	assertPairSet(manifest.entries, context.authority);
}

function buildV2ManifestCandidate(sourceManifest, context) {
	assertManifestForV2Emission(sourceManifest, context);
	const boundaries = BOUNDARY_SCOPE_IDS.map((scopeId) =>
		buildCanonicalBoundaryEntry(scopeId, context.boundaryAuthority, context.authority, context.readRecord));
	const sourceConsumers = sourceManifest.entries.filter((entry) => entry.kind === "consumer").sort(compareScopeKind);
	const consumers = sourceConsumers.map((entry) => buildCanonicalConsumerEntry(
		entry,
		context.authority,
		context.readRecord,
		{ requireExplicitPlanAuthority: true }
	));
	const candidate = { schemaVersion: SCHEMA_VERSION, specId: SPEC_ID, entries: [...boundaries, ...consumers].sort(compareScopeKind) };
	verifyPreparedManifest(candidate, context);
	return candidate;
}

function parseNamedImports(text) {
	const imports = [];
	for (const match of text.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*(["'])([^"']+)\2/g)) {
		const names = match[1].split(",").map((part) => {
			const values = part.trim().split(/\s+as\s+/);
			return { imported: values[0], local: values[1] ?? values[0] };
		});
		imports.push({ reference: match[3], names });
	}
	return imports;
}

function exportedFunctions(text) {
	const functions = [];
	for (const match of text.matchAll(/\bexport\s+function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)) {
		const start = match.index + match[0].length - 1;
		const end = matchingBrace(text, start);
		if (end >= 0) functions.push({ name: match[1], body: text.slice(start + 1, end) });
	}
	return functions;
}

function validateProducerIdentity(producer, readRecord, itemId) {
	const text = readRecord(producer.path, `${itemId}.producer ${producer.path}`).text;
	const present = producer.identityKind === "config-key"
		? configKeyExists(text, producer.identity)
		: text.includes(producer.identity);
	if (!present) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${itemId} producer identity is absent`, itemId);
	return text;
}

function validateCausalBinding(entry, binding, readRecord) {
	validateProducerIdentity(binding.producer, readRecord, entry.itemId);
	const consumerText = readRecord(binding.consumer.path, `${entry.itemId}.consumer ${binding.consumer.path}`).text;
	const testText = readRecord(binding.test.path, `${entry.itemId}.test ${binding.test.path}`).text;
	const declarations = testDeclarations(testText).filter((value) => value.title === binding.test.title);
	if (declarations.length !== 1 || declarations[0].modifier !== null || declarations[0].body.length === 0) {
		refuse(R.TEST_TITLE_UNREACHABLE, `${entry.itemId} test title resolved ${declarations.length} executable times`, entry.itemId);
	}
	const body = declarations[0].body;
	if (!body.includes(binding.test.assertionIdentity)) refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} assertion is absent from the named test body`, entry.itemId);
	if (!/assert\.|expect\s*\(/.test(binding.test.assertionIdentity)) refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} assertion identity is not assertion syntax`, entry.itemId);
	if (binding.consumer.dependencyEdge === "static-import") {
		validateStaticImportGraph(entry, binding, consumerText, testText, body);
		return;
	}
	if (!consumerText.includes(binding.consumer.useIdentity)) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} consumer use identity is absent`, entry.itemId);
	if (binding.consumer.dependencyEdge === "script-global" && binding.producer.path !== binding.consumer.path) {
		const linked = [...consumerText.matchAll(/<script[^>]+src=(["'])(.*?)\1/gi)]
			.some((match) => resolveLocalReference(binding.consumer.path, match[2]) === binding.producer.path || match[2] === binding.producer.path);
		if (!linked) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} consumer does not load its producer`, entry.itemId);
	}
	if (binding.consumer.dependencyEdge === "same-file" && binding.producer.path !== binding.consumer.path) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} same-file binding names different files`, entry.itemId);
	}
	if (!/\b(?:page|locator|expect|assert)\b/.test(body)) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} test body does not observe a consumer result`, entry.itemId);
}

function validateStaticImportGraph(entry, binding, consumerText, testText, body) {
	const producerImport = parseNamedImports(consumerText).find((candidate) =>
		resolveLocalReference(binding.consumer.path, candidate.reference) === binding.producer.path
		&& candidate.names.some((name) => name.imported === binding.producer.identity && name.local === binding.consumer.useIdentity)
	);
	if (!producerImport) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} producer import does not reach the declared use`, entry.itemId);
	const output = exportedFunctions(consumerText).find((candidate) => candidate.body.includes(`${binding.consumer.useIdentity}(`));
	if (!output) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} imported producer is unused by an exported consumer`, entry.itemId);
	const testImport = parseNamedImports(testText).find((candidate) =>
		resolveLocalReference(binding.test.path, candidate.reference) === binding.consumer.path
		&& candidate.names.some((name) => name.imported === output.name)
	);
	if (!testImport) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} test does not import the connected consumer`, entry.itemId);
	const imported = testImport.names.find((name) => name.imported === output.name);
	if (!new RegExp(`\\b${escapeRegExp(imported.local)}\\s*\\(`).test(body)) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} named test does not call the connected consumer`, entry.itemId);
	const assignment = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(?:await\\s+)?${escapeRegExp(imported.local)}\\s*\\(`).exec(body);
	if (!assignment || !binding.test.assertionIdentity.includes(assignment[1])) {
		refuse(R.ASSERTION_BINDING_INVALID, `${entry.itemId} assertion does not observe the connected consumer result`, entry.itemId);
	}
}

function validateDeclaredLanguage(value, entry, context) {
	const expected = languageForPath(value.path, entry.itemId);
	if (value.language !== expected) {
		refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} ${context} language ${value.language} does not match ${value.path} (${expected})`, entry.itemId);
	}
}

function validateConsumerProjections(entry) {
	const projections = [
		["canonicalProducers", "producer"],
		["consumerSurfaces", "consumer"],
		["testCarriers", "test"]
	];
	for (const [field, bindingField] of projections) {
		const expected = canonicalUnique(entry.causalBindings.map((binding) => binding[bindingField]));
		if (entry[field].length !== expected.length || !deepEqualJson(entry[field], expected)) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId}.${field} must equal the canonical deduplicated ${bindingField} projection of causalBindings`, entry.itemId);
		}
	}
	for (const [index, producer] of entry.canonicalProducers.entries()) {
		validateDeclaredLanguage(producer, entry, `canonicalProducers[${index}]`);
	}
	for (const [index, consumer] of entry.consumerSurfaces.entries()) {
		validateDeclaredLanguage(consumer, entry, `consumerSurfaces[${index}]`);
	}
	for (const [index, binding] of entry.causalBindings.entries()) {
		validateDeclaredLanguage(binding.producer, entry, `causalBindings[${index}].producer`);
		validateDeclaredLanguage(binding.consumer, entry, `causalBindings[${index}].consumer`);
	}
}

function sameCanonicalSequence(left, right) {
	return left.length === right.length && left.every((value, index) =>
		JSON.stringify(canonicalObject(value)) === JSON.stringify(canonicalObject(right[index]))
	);
}

function deriveExpectedConsumerContract(entry, readRecord, pairAuthority) {
	const authority = collectDerivedConsumerAuthority(entry, pairAuthority, readRecord);
	return memoizedTextAnalysis("derivedConsumerContract", authority.authorityKey, () =>
		diagnosticPlanDerivedBuild(() => buildCanonicalConsumerEntry(
			{ itemId: entry.itemId, scopeId: entry.scopeId },
			pairAuthority,
			readRecord,
			{
				requireExplicitPlanAuthority: true,
				preparedClaimSource: authority.claimSource,
				preparedPlanAuthority: authority.planAuthority
			}
		)), authority.authorityCharacters
	);
}

function validatePlanDerivedConsumerContract(entry, expectedConsumerContracts) {
	const expected = freshAnalysisCopy(expectedConsumerContracts.get(entry.scopeId));
	if (!expected) refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId} has no precomputed plan-derived causal authority`, entry.itemId);
	for (const field of ["causalBindings", "canonicalProducers", "consumerSurfaces", "testCarriers"]) {
		if (!sameCanonicalSequence(entry[field], expected[field])) {
			refuse(R.CAUSAL_BINDING_DISCONNECTED, `${entry.itemId}.${field} differs from current plan-derived causal authority`, entry.itemId);
		}
	}
}

function validateConsumer(entry, readRecord, strictPlanAuthority, getExpectedConsumerContracts) {
	validateConsumerProjections(entry);
	validateAliases(entry, readRecord, strictPlanAuthority);
	for (const binding of entry.causalBindings) validateCausalBinding(entry, binding, readRecord);
	if (strictPlanAuthority) validatePlanDerivedConsumerContract(entry, getExpectedConsumerContracts());
	return ["closed-entry-schema", "claim-source", `canonical-producers:${entry.canonicalProducers.length}`,
		`consumer-surfaces:${entry.consumerSurfaces.length}`, `test-carriers:${entry.testCarriers.length}`,
		`causal-bindings:${entry.causalBindings.length}`, `aliases:${entry.aliases.mode}`,
		...(strictPlanAuthority ? ["plan-derived-causal-authority"] : [])];
}

function canonicalObject(value, key = "") {
	if (Array.isArray(value)) {
		const normalized = value.map((entry) => canonicalObject(entry));
		return key === "orderedScopeIds" ? normalized : normalized.sort((left, right) => compareText(JSON.stringify(left), JSON.stringify(right)));
	}
	if (!isObject(value)) return value;
	const output = {};
	for (const childKey of Object.keys(value).sort(compareText)) output[childKey] = canonicalObject(value[childKey], childKey);
	return output;
}

function manifestDigest(manifest) {
	return `sha256:${createHash("sha256").update(JSON.stringify(canonicalObject(manifest))).digest("hex")}`;
}

function prepareVerificationContext(repositoryRoot, sourceReader, analysisCache = createSpec008ScopeClaimsAnalysisCache()) {
	if (!isNonEmptyString(repositoryRoot) || !isAbsolute(repositoryRoot)) refuse(R.PATH_REPOSITORY_ESCAPE, "repositoryRoot must be an absolute path");
	if (typeof sourceReader !== "function") refuse(R.PATH_MISSING, "sourceReader must be a function");
	return withVerificationAnalysisCache(analysisCache, () => {
		const root = resolve(repositoryRoot);
		const readRecord = makeRecordReader(root, sourceReader);
		const boundaryAuthority = deriveBoundaryAuthority(readRecord, sourceReader);
		const authority = deriveAuthority(readRecord);
		const strictPlanAuthority = !isInjectedFixtureSource(sourceReader);
		let expectedConsumerContracts = null;
		const getExpectedConsumerContracts = () => {
			if (expectedConsumerContracts !== null) return expectedConsumerContracts;
			expectedConsumerContracts = new Map();
			for (const { scopeId } of EXPECTED_PAIRS.filter(({ kind }) => kind === "consumer")) {
				const itemId = `SCOPE-${scopeId}-CONSUMER-CLAIM`;
				expectedConsumerContracts.set(scopeId, deriveExpectedConsumerContract({ itemId, scopeId }, readRecord, authority));
			}
			return expectedConsumerContracts;
		};
		return { root, readRecord, boundaryAuthority, authority, strictPlanAuthority, getExpectedConsumerContracts, analysisCache };
	});
}

function verifyPreparedManifest(manifest, context) {
	return withVerificationAnalysisCache(context.analysisCache, () => verifyPreparedManifestWithActiveCache(manifest, context));
}

function verifyPreparedManifestWithActiveCache(manifest, context) {
	const { root, readRecord, boundaryAuthority, authority, strictPlanAuthority, getExpectedConsumerContracts } = context;
	assertManifestSchema(manifest);
	const entries = [...manifest.entries].sort(compareScopeKind);
	assertPairSet(entries, authority);
	for (const entry of entries) validateClaimSource(entry, authority);
	const boundaries = entries.filter((entry) => entry.kind === "boundary");
	const consumers = entries.filter((entry) => entry.kind === "consumer");
	const consumerChecks = new Map();
	const injectedFixture = boundaries.every((entry) => boundaryAuthority.get(entry.scopeId)?.attributedPaths === null);
	if (injectedFixture) {
		for (const entry of consumers) consumerChecks.set(entry.itemId, validateConsumer(entry, readRecord, strictPlanAuthority, getExpectedConsumerContracts));
	}
	const boundaryChecks = new Map();
	for (const entry of boundaries) {
		const derived = validateBoundaryInventory(entry, readRecord, root, boundaryAuthority);
		boundaryChecks.set(entry.itemId, ["closed-entry-schema", "claim-source", `inventory-sources:${entry.expectedInventory.sources.length}`,
			`inventory-descriptors:${derived.length}`, "path-and-identity-containment"]);
	}
	validateOwnership(boundaries);
	for (const entry of boundaries) {
		validateSemanticEdges(entry, readRecord, boundaryAuthority);
		boundaryChecks.get(entry.itemId).push("ownership-graph", "semantic-edge-policy");
	}
	const results = entries.map((entry) => ({
		itemId: entry.itemId,
		scopeId: entry.scopeId,
		kind: entry.kind,
		status: "pass",
		checks: entry.kind === "boundary" ? boundaryChecks.get(entry.itemId) : consumerChecks.get(entry.itemId) ?? validateConsumer(entry, readRecord, strictPlanAuthority, getExpectedConsumerContracts)
	}));
	const boundary = results.filter((result) => result.kind === "boundary").length;
	const consumer = results.filter((result) => result.kind === "consumer").length;
	const pass = results.filter((result) => result.status === "pass").length;
	return {
		schemaVersion: SCHEMA_VERSION,
		specId: SPEC_ID,
		manifestSha256: manifestDigest(manifest),
		results,
		summary: { total: results.length, boundary, consumer, pass, fail: results.length - pass }
	};
}


let scopeClaimsDiagnosticCall = 0;
let scopeClaimsPlanDerivedBuild = 0;
let scopeClaimsPlanDerivedBuildMilliseconds = 0;

function diagnosticPlanDerivedBuild(operation) {
	if (process.env.SPEC008_SCOPE_CLAIMS_DIAGNOSTIC !== "1") return operation();
	const started = performance.now();
	try { return operation(); }
	finally {
		scopeClaimsPlanDerivedBuild += 1;
		scopeClaimsPlanDerivedBuildMilliseconds += performance.now() - started;
	}
}

export function verifySpec008ScopeClaims({ manifest, repositoryRoot, sourceReader, analysisCache } = {}) {
	if (process.env.SPEC008_SCOPE_CLAIMS_DIAGNOSTIC === "1") {
		scopeClaimsDiagnosticCall += 1;
	}
	const result = verifyPreparedManifest(manifest, prepareVerificationContext(
		repositoryRoot,
		sourceReader,
		analysisCache ?? createSpec008ScopeClaimsAnalysisCache()
	));
	if (process.env.SPEC008_SCOPE_CLAIMS_DIAGNOSTIC === "1") {
		process.stderr.write(`[spec008-scope-claims-diagnostic] call=${scopeClaimsDiagnosticCall} planDerivedBuilds=${scopeClaimsPlanDerivedBuild} planDerivedBuildMilliseconds=${scopeClaimsPlanDerivedBuildMilliseconds.toFixed(3)}\n`);
	}
	return result;
}

export function serializeSpec008ScopeClaimsResult(result) {
	return `${JSON.stringify(result)}\n`;
}

function createDiskSourceReader(repositoryRoot) {
	const reader = (path) => {
		const absolutePath = resolve(repositoryRoot, path);
		try {
			const linkStat = lstatSync(absolutePath);
			const targetStat = statSync(absolutePath);
			return { type: linkStat.isSymbolicLink() ? "symlink" : targetStat.isFile() ? "file" : "other",
				realPath: realpathSync(absolutePath), text: targetStat.isFile() ? readFileSync(absolutePath, "utf8") : "" };
		} catch (error) {
			if (error && typeof error === "object" && new Set(["EACCES", "ELOOP", "ENOENT", "ENOTDIR"]).has(error.code)) return null;
			throw error;
		}
	};
	reader.readCommit = (commit, path) => {
		const run = spawnSync("git", ["show", `${commit}:${path}`], { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
		return run.status === 0 ? { text: run.stdout } : null;
	};
	return reader;
}

function emitVerdicts(result) {
	for (const row of result.results) process.stderr.write(`[spec008-scope-claims] scope=${row.scopeId} kind=${row.kind} item=${row.itemId} status=${row.status} checks=${row.checks.join(",")}\n`);
	process.stderr.write(`[spec008-scope-claims] total=${result.summary.total} boundary=${result.summary.boundary} consumer=${result.summary.consumer} pass=${result.summary.pass} fail=${result.summary.fail}\n`);
}

function main() {
	const sourceReader = createDiskSourceReader(REPOSITORY_ROOT);
	const context = prepareVerificationContext(REPOSITORY_ROOT, sourceReader);
	const emitBoundary = process.argv.find((argument) => argument.startsWith("--emit-boundary="));
	if (emitBoundary) {
		const scopeId = emitBoundary.slice("--emit-boundary=".length);
		if (!BOUNDARY_SCOPE_IDS.includes(scopeId)) refuse(R.INVENTORY_SOURCE_INVALID, `unknown boundary scope ${scopeId}`);
		process.stdout.write(`${JSON.stringify(buildCanonicalBoundaryEntry(scopeId, context.boundaryAuthority, context.authority, context.readRecord))}\n`);
		return;
	}
	let manifest;
	try { manifest = JSON.parse(readFileSync(join(REPOSITORY_ROOT, MANIFEST_RELATIVE_PATH), "utf8")); }
	catch (error) { refuse(R.MANIFEST_SCHEMA_INVALID, `${MANIFEST_RELATIVE_PATH} ${error instanceof SyntaxError ? "is not valid JSON" : "is missing or unreadable"}`); }
	if (process.argv.includes("--inspect-v1-consumers")) {
		for (const entry of manifest.entries.filter((candidate) => candidate.kind === "consumer")) {
			const source = entry.sourceSurfaces[0];
			const consumer = entry.consumerSurfaces[0];
			const carrier = entry.testCarriers[0];
			const declarations = testDeclarations(context.readRecord(carrier.path, `${entry.itemId} test carrier`).text)
				.filter((candidate) => candidate.title === carrier.token);
			const assertions = declarations.flatMap((declaration) => extractAssertions(declaration.body).map((assertion) => assertion.identity));
			process.stdout.write(`${JSON.stringify({ scopeId: entry.scopeId, source, consumer, carrier, titleMatches: declarations.length, assertions })}\n`);
		}
		return;
	}
	if (process.argv.includes("--emit-v2-manifest")) {
		process.stdout.write(`${JSON.stringify(buildV2ManifestCandidate(manifest, context), null, 2)}\n`);
		return;
	}
	const result = verifyPreparedManifest(manifest, context);
	emitVerdicts(result);
	process.stdout.write(serializeSpec008ScopeClaimsResult(result));
}

if (resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
	try { main(); }
	catch (error) {
		if (!(error instanceof ScopeClaimsRefusal)) throw error;
		const refusal = error.refusal;
		process.stderr.write(`[spec008-scope-claims] REFUSED code=${refusal.refusalCode} item=${refusal.itemId ?? "none"} detail=${refusal.detail}\n`);
		process.stdout.write(serializeSpec008ScopeClaimsResult(refusal));
		process.exitCode = 1;
	}
}
