/* RLCausal - deterministic causal-rotation contracts and evaluation.
   Browser/Node safe; no DOM, storage, network, provider, or market-owner logic. */
(function () {
  "use strict";

  var root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
  var diagnosticState = freshDiagnostics();

  function freshDiagnostics() {
    return {
      evaluations: 0,
      acceptedRecords: 0,
      rejectedRecords: 0,
      excludedByCode: {},
      clusters: 0,
      collapsedObservations: 0,
      candidatesByStage: {},
      missingClocks: 0,
      staleClocks: 0,
      unavailableTimingReads: 0,
      persistenceFailures: 0
    };
  }

  function increment(bucket, key) {
    bucket[key] = (bucket[key] || 0) + 1;
  }

  function isObject(value) {
    return !!value && Object.prototype.toString.call(value) === "[object Object]";
  }

  function isIso(value) {
    return typeof value === "string" && Number.isFinite(Date.parse(value));
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function canonicalize(value) {
    if (value === null) return "null";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new Error("non-finite number cannot be canonicalized");
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
    if (isObject(value)) {
      return "{" + Object.keys(value).sort().filter(function (key) {
        return value[key] !== undefined;
      }).map(function (key) {
        return JSON.stringify(key) + ":" + canonicalize(value[key]);
      }).join(",") + "}";
    }
    throw new Error("unsupported canonical value type: " + typeof value);
  }

  function utf8Binary(value) {
    var bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(value) : null;
    if (bytes) {
      var encoded = "";
      for (var byteIndex = 0; byteIndex < bytes.length; byteIndex++) encoded += String.fromCharCode(bytes[byteIndex]);
      return encoded;
    }
    return unescape(encodeURIComponent(value));
  }

  function rotateRight(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  function sha256Hex(value) {
    var binary = utf8Binary(String(value));
    var words = [];
    var hash = [];
    var constants = [];
    var composite = {};
    var candidate = 2;
    while (constants.length < 64) {
      if (!composite[candidate]) {
        for (var multiple = candidate * candidate; multiple < 313; multiple += candidate) composite[multiple] = true;
        hash.push((Math.pow(candidate, 0.5) * 0x100000000) | 0);
        constants.push((Math.pow(candidate, 1 / 3) * 0x100000000) | 0);
      }
      candidate++;
    }
    var bitLength = binary.length * 8;
    binary += "\x80";
    while (binary.length % 64 !== 56) binary += "\x00";
    for (var charIndex = 0; charIndex < binary.length; charIndex++) {
      words[charIndex >> 2] = words[charIndex >> 2] || 0;
      words[charIndex >> 2] |= binary.charCodeAt(charIndex) << ((3 - charIndex) % 4) * 8;
    }
    words.push(Math.floor(bitLength / 0x100000000));
    words.push(bitLength | 0);

    for (var blockStart = 0; blockStart < words.length; blockStart += 16) {
      var schedule = words.slice(blockStart, blockStart + 16);
      var priorHash = hash.slice(0);
      for (var round = 0; round < 64; round++) {
        var scheduleMinus15 = schedule[round - 15];
        var scheduleMinus2 = schedule[round - 2];
        if (round >= 16) {
          var sigma0 = rotateRight(scheduleMinus15, 7) ^ rotateRight(scheduleMinus15, 18) ^ (scheduleMinus15 >>> 3);
          var sigma1 = rotateRight(scheduleMinus2, 17) ^ rotateRight(scheduleMinus2, 19) ^ (scheduleMinus2 >>> 10);
          schedule[round] = (schedule[round - 16] + sigma0 + schedule[round - 7] + sigma1) | 0;
        }
        var choose = (hash[4] & hash[5]) ^ ((~hash[4]) & hash[6]);
        var majority = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var upper0 = rotateRight(hash[0], 2) ^ rotateRight(hash[0], 13) ^ rotateRight(hash[0], 22);
        var upper1 = rotateRight(hash[4], 6) ^ rotateRight(hash[4], 11) ^ rotateRight(hash[4], 25);
        var temp1 = (hash[7] + upper1 + choose + constants[round] + schedule[round]) | 0;
        var temp2 = (upper0 + majority) | 0;
        hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
      }
      for (var hashIndex = 0; hashIndex < 8; hashIndex++) hash[hashIndex] = (hash[hashIndex] + priorHash[hashIndex]) | 0;
    }
    var result = "";
    for (var wordIndex = 0; wordIndex < 8; wordIndex++) {
      for (var byteOffset = 3; byteOffset >= 0; byteOffset--) {
        var hex = ((hash[wordIndex] >> (byteOffset * 8)) & 255).toString(16);
        result += hex.length === 1 ? "0" + hex : hex;
      }
    }
    return result;
  }

  function withoutDigest(record) {
    var copy = {};
    Object.keys(record || {}).forEach(function (key) { if (key !== "contentDigest") copy[key] = record[key]; });
    return copy;
  }

  function digestRecord(record) {
    return "sha256:" + sha256Hex(canonicalize(withoutDigest(record || {})));
  }

  function error(code, path, message, detail) {
    return { code: code, path: path || "", message: message, detail: detail || null };
  }

  function contains(list, value) {
    return Array.isArray(list) && list.indexOf(value) >= 0;
  }

  function requireFields(value, fields, path, errors) {
    fields.forEach(function (field) {
      if (value == null || value[field] === undefined || value[field] === null || value[field] === "") {
        errors.push(error("CR-SCHEMA-INVALID", path + "." + field, "required field is missing"));
      }
    });
  }

  function validateConfig(value) {
    var errors = [];
    if (!isObject(value)) return { ok: false, errors: [error("CR-CONFIG-INVALID", "$", "config must be an object")] };
    requireFields(value, ["schemaVersion", "version", "evaluatorVersion", "contracts", "enums", "exposureCatalog", "sourcePolicies", "freshnessPolicies", "sensitivityPolicies", "riskPolicy", "stagePolicy", "outcomeStates"], "$", errors);
    if (value.schemaVersion !== "causal-config/v1") errors.push(error("CR-CONFIG-INVALID", "$.schemaVersion", "unknown config contract"));
    var requiredContracts = ["observationSet", "timingRead", "candidateRead", "decisionRecord", "ledgerEvent", "snapshot", "toolRead"];
    requiredContracts.forEach(function (key) { if (!value.contracts || typeof value.contracts[key] !== "string") errors.push(error("CR-CONFIG-INVALID", "$.contracts." + key, "contract version is required")); });
    ["classification", "evidenceClass", "clock", "stance", "observationStatus", "catalystLifecycle", "candidateStage", "timingState"].forEach(function (key) {
      if (!value.enums || !Array.isArray(value.enums[key]) || !value.enums[key].length) errors.push(error("CR-CONFIG-INVALID", "$.enums." + key, "closed enum is required"));
    });
    var exposureIds = {};
    if (Array.isArray(value.exposureCatalog)) value.exposureCatalog.forEach(function (exposure, index) {
      requireFields(exposure, ["id", "kind", "label", "timingOwner", "deepLink"], "$.exposureCatalog[" + index + "]", errors);
      if (exposureIds[exposure.id]) errors.push(error("CR-CONFIG-INVALID", "$.exposureCatalog[" + index + "].id", "duplicate exposure id"));
      exposureIds[exposure.id] = true;
    });
    ["discovery", "balanced", "confirmation"].forEach(function (posture) {
      var policy = value.sensitivityPolicies && value.sensitivityPolicies[posture];
      if (!isObject(policy)) errors.push(error("CR-CONFIG-INVALID", "$.sensitivityPolicies." + posture, "posture policy is required"));
      else requireFields(policy, ["visibleStages", "minimumIndependentNonMarketClusters", "minimumEvidenceClasses", "minimumMarketState", "invariantGates"], "$.sensitivityPolicies." + posture, errors);
    });
    if (!Array.isArray(value.stagePolicy) || !value.stagePolicy.length) errors.push(error("CR-CONFIG-INVALID", "$.stagePolicy", "ordered stage policy is required"));
    return { ok: errors.length === 0, errors: errors };
  }

  function validateDigest(record, path, errors) {
    if (!record || typeof record.contentDigest !== "string" || !/^sha256:[a-f0-9]{64}$/.test(record.contentDigest)) {
      errors.push(error("CR-SCHEMA-INVALID", path + ".contentDigest", "sha256 content digest is required"));
      return;
    }
    var expected = digestRecord(record);
    if (record.contentDigest !== expected) errors.push(error("CR-CONFLICTING-IDENTITY", path + ".contentDigest", "content digest does not match canonical record", { expected: expected, actual: record.contentDigest }));
  }

  function validateObservationSet(value, config) {
    var errors = [];
    var configResult = validateConfig(config);
    if (!configResult.ok) return { ok: false, errors: configResult.errors };
    if (!isObject(value)) return { ok: false, errors: [error("CR-SCHEMA-INVALID", "$", "observation set must be an object")] };
    if (value.contractVersion !== config.contracts.observationSet) errors.push(error("CR-SCHEMA-INVALID", "$.contractVersion", "unknown observation-set contract"));
    requireFields(value, ["contractVersion", "recordedAt", "catalysts", "observations", "exposureMaps", "regimes", "hypotheses"], "$", errors);
    var collections = ["catalysts", "observations", "exposureMaps", "regimes", "hypotheses"];
    var identities = {};
    collections.forEach(function (collection) {
      if (!Array.isArray(value[collection])) { errors.push(error("CR-SCHEMA-INVALID", "$." + collection, "array is required")); return; }
      value[collection].forEach(function (record, index) {
        var path = "$." + collection + "[" + index + "]";
        requireFields(record, ["id", "version", "recordedAt", "contentDigest"], path, errors);
        if (!(record.version >= 1 && Math.floor(record.version) === record.version)) errors.push(error("CR-SCHEMA-INVALID", path + ".version", "version must be a positive integer"));
        if (!isIso(record.recordedAt)) errors.push(error("CR-SCHEMA-INVALID", path + ".recordedAt", "recordedAt must be ISO time"));
        var identity = record.id + "@" + record.version;
        if (identities[identity] && identities[identity] !== record.contentDigest) errors.push(error("CR-CONFLICTING-IDENTITY", path, "identity is reused with different content"));
        identities[identity] = record.contentDigest;
        validateDigest(record, path, errors);
      });
    });
    var observationsById = {};
    (value.observations || []).forEach(function (observation, index) {
      var path = "$.observations[" + index + "]";
      observationsById[observation.id] = observation;
      requireFields(observation, ["assertion", "classification", "evidenceClass", "clock", "stance", "source", "publishedAt", "verifiedAt", "availableAt", "freshness", "originKey", "dependencyIds", "limitations", "status"], path, errors);
      if (!contains(config.enums.classification, observation.classification)) errors.push(error("CR-SCHEMA-INVALID", path + ".classification", "classification is outside the closed enum"));
      if (!contains(config.enums.evidenceClass, observation.evidenceClass)) errors.push(error("CR-SCHEMA-INVALID", path + ".evidenceClass", "evidence class is outside the closed enum"));
      if (!contains(config.enums.clock, observation.clock)) errors.push(error("CR-SCHEMA-INVALID", path + ".clock", "clock is outside the closed enum"));
      if (!contains(config.enums.stance, observation.stance)) errors.push(error("CR-SCHEMA-INVALID", path + ".stance", "stance is outside the closed enum"));
      if (!contains(config.enums.observationStatus, observation.status)) errors.push(error("CR-SCHEMA-INVALID", path + ".status", "status is outside the closed enum"));
      ["publishedAt", "verifiedAt", "availableAt"].forEach(function (field) { if (!isIso(observation[field])) errors.push(error("CR-SCHEMA-INVALID", path + "." + field, field + " must be ISO time")); });
      if (isIso(observation.availableAt) && isIso(observation.publishedAt) && Date.parse(observation.availableAt) < Date.parse(observation.publishedAt)) errors.push(error("CR-TIME-INELIGIBLE", path + ".availableAt", "availableAt cannot predate publication"));
      if (isIso(observation.availableAt) && isIso(observation.verifiedAt) && Date.parse(observation.availableAt) < Date.parse(observation.verifiedAt)) errors.push(error("CR-TIME-INELIGIBLE", path + ".availableAt", "availableAt cannot predate first verification"));
      if (!isObject(observation.source) || !observation.source.publisher || !observation.source.title || !(observation.source.url || observation.source.publicId) || !observation.source.sourceType) errors.push(error("CR-SOURCE-INCOMPLETE", path + ".source", "publisher, title, stable citation, and sourceType are required"));
      if (observation.source && observation.source.url && !/^https?:\/\//.test(observation.source.url)) errors.push(error("CR-SOURCE-INCOMPLETE", path + ".source.url", "source URL must use http or https"));
      if (!isObject(observation.freshness) || !observation.freshness.mode || !isIso(observation.freshness.reviewAt) || (observation.freshness.mode === "time-bound" && !isIso(observation.freshness.expiresAt))) errors.push(error("CR-SCHEMA-INVALID", path + ".freshness", "explicit freshness mode, reviewAt, and expiry are required"));
      if (!Array.isArray(observation.dependencyIds) || !Array.isArray(observation.limitations)) errors.push(error("CR-SCHEMA-INVALID", path, "dependencyIds and limitations must be arrays"));
    });
    (value.observations || []).forEach(function (observation, index) {
      (observation.dependencyIds || []).forEach(function (dependencyId) { if (!observationsById[dependencyId]) errors.push(error("CR-CLUSTER-INVALID", "$.observations[" + index + "].dependencyIds", "unknown evidence dependency", { dependencyId: dependencyId })); });
    });
    var catalystIds = {};
    (value.catalysts || []).forEach(function (catalyst, index) {
      catalystIds[catalyst.id] = true;
      if (!contains(config.enums.catalystLifecycle, catalyst.lifecycle)) errors.push(error("CR-SCHEMA-INVALID", "$.catalysts[" + index + "].lifecycle", "catalyst lifecycle is outside the closed enum"));
      requireFields(catalyst, ["title", "eventClass", "lifecycle", "sourceObservationIds", "reviewAt", "expiresAt"], "$.catalysts[" + index + "]", errors);
    });
    var exposureMapIds = {};
    (value.exposureMaps || []).forEach(function (map, index) { exposureMapIds[map.id] = true; requireFields(map, ["exposures", "asOf"], "$.exposureMaps[" + index + "]", errors); });
    var regimeIds = {};
    (value.regimes || []).forEach(function (regime, index) {
      regimeIds[regime.id] = true;
      requireFields(regime, ["dimensions", "asOf", "freshUntil"], "$.regimes[" + index + "]", errors);
      ["growth", "inflation", "liquidityRates", "volatilityGamma", "correlationDispersion", "credit"].forEach(function (dimension) { if (!regime.dimensions || !regime.dimensions[dimension]) errors.push(error("CR-SCHEMA-INVALID", "$.regimes[" + index + "].dimensions." + dimension, "regime dimension is required")); });
    });
    (value.hypotheses || []).forEach(function (hypothesis, index) {
      var path = "$.hypotheses[" + index + "]";
      requireFields(hypothesis, ["catalystEventId", "primaryMechanism", "exposureMapVersionId", "currentRegimeVersionId", "regimeConsequences", "expectedWindow", "confirmation", "invalidation", "requiredEvidenceClasses", "observationIds", "status"], path, errors);
      if (!catalystIds[hypothesis.catalystEventId]) errors.push(error("CR-SCHEMA-INVALID", path + ".catalystEventId", "unknown catalyst reference"));
      if (!exposureMapIds[hypothesis.exposureMapVersionId]) errors.push(error("CR-SCHEMA-INVALID", path + ".exposureMapVersionId", "unknown exposure map reference"));
      if (!regimeIds[hypothesis.currentRegimeVersionId]) errors.push(error("CR-SCHEMA-INVALID", path + ".currentRegimeVersionId", "unknown regime reference"));
      (hypothesis.observationIds || []).forEach(function (observationId) { if (!observationsById[observationId]) errors.push(error("CR-SCHEMA-INVALID", path + ".observationIds", "unknown observation reference", { observationId: observationId })); });
      if (!Array.isArray(hypothesis.regimeConsequences) || hypothesis.regimeConsequences.length < 2 || !hypothesis.regimeConsequences.some(function (item) { return item.current === true; }) || !hypothesis.regimeConsequences.some(function (item) { return item.current === false; })) errors.push(error("CR-SCHEMA-INVALID", path + ".regimeConsequences", "current and alternative regime consequences are required"));
      if (!hypothesis.primaryMechanism || !hypothesis.primaryMechanism.name || !hypothesis.primaryMechanism.statement) errors.push(error("CR-SCHEMA-INVALID", path + ".primaryMechanism", "one named falsifiable primary mechanism is required"));
      if (!Array.isArray(hypothesis.confirmation) || !hypothesis.confirmation.length || !Array.isArray(hypothesis.invalidation) || !hypothesis.invalidation.length) errors.push(error("CR-SCHEMA-INVALID", path, "confirmation and invalidation are required"));
    });
    diagnosticState.acceptedRecords = Object.keys(identities).length - errors.length;
    diagnosticState.rejectedRecords = errors.length;
    return { ok: errors.length === 0, errors: errors };
  }

  function parseLedger(text, config) {
    var errors = [];
    var events = [];
    var eventIds = {};
    String(text || "").split(/\r?\n/).forEach(function (line, index) {
      if (!line.trim()) return;
      var event;
      try { event = JSON.parse(line); }
      catch (parseError) { errors.push(error("CR-SCHEMA-INVALID", "line:" + (index + 1), "invalid JSONL", { message: parseError.message })); return; }
      var path = "line:" + (index + 1);
      requireFields(event, ["contractVersion", "eventType", "eventId", "recordedAt", "payload", "contentDigest"], path, errors);
      if (event.contractVersion !== config.contracts.ledgerEvent) errors.push(error("CR-SCHEMA-INVALID", path + ".contractVersion", "unknown ledger contract"));
      if (["decision", "outcome", "correction"].indexOf(event.eventType) < 0) errors.push(error("CR-SCHEMA-INVALID", path + ".eventType", "unknown ledger event type"));
      if (eventIds[event.eventId]) errors.push(error("CR-CONFLICTING-IDENTITY", path + ".eventId", "duplicate ledger event id"));
      eventIds[event.eventId] = true;
      if (event.eventType === "outcome" && (!event.payload || !eventIds[event.payload.decisionEventId])) errors.push(error("CR-SCHEMA-INVALID", path + ".payload.decisionEventId", "outcome must reference an earlier decision"));
      if (event.eventType === "correction" && (!event.payload || !eventIds[event.payload.targetEventId])) errors.push(error("CR-SCHEMA-INVALID", path + ".payload.targetEventId", "correction must reference an earlier event"));
      validateDigest(event, path, errors);
      events.push(event);
    });
    return { events: events, errors: errors, ok: errors.length === 0 };
  }

  function mergeSources(committed, local) {
    var errors = [];
    var records = [];
    var byIdentity = {};
    function add(record, origin) {
      var identity = record && record.id + "@" + record.version;
      if (!record || !record.id || !record.version) { errors.push(error("CR-SCHEMA-INVALID", origin, "record identity is required")); return; }
      if (byIdentity[identity]) {
        if (canonicalize(byIdentity[identity].record) !== canonicalize(record)) errors.push(error("CR-CONFLICTING-IDENTITY", identity, "committed and local content conflict", { origins: [byIdentity[identity].origin, origin] }));
        return;
      }
      byIdentity[identity] = { record: clone(record), origin: origin };
      records.push(clone(record));
    }
    (Array.isArray(committed) ? committed : []).forEach(function (record) { add(record, "committed"); });
    (Array.isArray(local) ? local : []).forEach(function (record) { add(record, "browser-local"); });
    records.sort(function (left, right) { return left.id === right.id ? left.version - right.version : left.id.localeCompare(right.id); });
    return { records: records, errors: errors, ok: errors.length === 0 };
  }

  function freshnessState(observation, asOf) {
    if (observation.status === "retracted") return { state: "retracted", code: "CR-EVIDENCE-RETRACTED" };
    if (observation.status === "superseded") return { state: "superseded", code: "CR-EVIDENCE-SUPERSEDED" };
    if (observation.status === "stale") return { state: "stale", code: "CR-EVIDENCE-STALE" };
    if (observation.classification === "unverified") return { state: "unverified", code: "CR-SOURCE-INCOMPLETE" };
    if (observation.freshness && observation.freshness.mode === "historical-context") return { state: "historical-context", code: "CR-EVIDENCE-HISTORICAL" };
    if (observation.freshness && isIso(observation.freshness.expiresAt) && Date.parse(asOf) > Date.parse(observation.freshness.expiresAt)) return { state: "stale", code: "CR-EVIDENCE-STALE" };
    return { state: "current", code: null };
  }

  function eligibleEvidence(hypothesis, asOf, observationSet) {
    var eligible = [];
    var excluded = [];
    var observationById = {};
    (observationSet && observationSet.observations || hypothesis && hypothesis.observations || []).forEach(function (observation) { observationById[observation.id] = observation; });
    (hypothesis && hypothesis.observationIds || []).forEach(function (observationId) {
      var observation = observationById[observationId];
      if (!observation) { excluded.push({ observationId: observationId, code: "CR-SCHEMA-INVALID", state: "missing" }); return; }
      if (!isIso(asOf) || Date.parse(observation.availableAt) > Date.parse(asOf)) {
        excluded.push({ observation: observation, observationId: observation.id, code: "CR-TIME-INELIGIBLE", state: "later" });
        increment(diagnosticState.excludedByCode, "CR-TIME-INELIGIBLE");
        return;
      }
      var state = freshnessState(observation, asOf);
      if (state.code) {
        excluded.push({ observation: observation, observationId: observation.id, code: state.code, state: state.state });
        increment(diagnosticState.excludedByCode, state.code);
        return;
      }
      eligible.push(observation);
    });
    return { eligible: eligible, excluded: excluded };
  }

  function clusterEvidence(observations) {
    observations = Array.isArray(observations) ? observations : [];
    var errors = [];
    var byId = {};
    var parents = {};
    observations.forEach(function (observation) { byId[observation.id] = observation; parents[observation.id] = observation.id; });
    function find(id) { while (parents[id] !== id) { parents[id] = parents[parents[id]]; id = parents[id]; } return id; }
    function unite(leftId, rightId) { var leftRoot = find(leftId), rightRoot = find(rightId); if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot < rightRoot ? leftRoot : rightRoot, parents[leftRoot] = leftRoot < rightRoot ? leftRoot : rightRoot; }
    var byOrigin = {};
    observations.forEach(function (observation) {
      if (!observation.originKey) errors.push(error("CR-CLUSTER-INVALID", observation.id, "originKey is required"));
      if (byOrigin[observation.originKey]) unite(observation.id, byOrigin[observation.originKey]); else byOrigin[observation.originKey] = observation.id;
      (observation.dependencyIds || []).forEach(function (dependencyId) {
        if (!byId[dependencyId]) errors.push(error("CR-CLUSTER-INVALID", observation.id, "unknown dependency", { dependencyId: dependencyId }));
        else unite(observation.id, dependencyId);
      });
    });
    var visiting = {}, visited = {};
    function visit(id, stack) {
      if (visiting[id]) { errors.push(error("CR-CLUSTER-INVALID", id, "dependency cycle", { cycle: stack.concat(id) })); return; }
      if (visited[id] || !byId[id]) return;
      visiting[id] = true;
      (byId[id].dependencyIds || []).forEach(function (dependencyId) { visit(dependencyId, stack.concat(id)); });
      delete visiting[id]; visited[id] = true;
    }
    Object.keys(byId).forEach(function (id) { visit(id, []); });
    var groups = {};
    observations.forEach(function (observation) { var rootId = find(observation.id); (groups[rootId] = groups[rootId] || []).push(observation); });
    var clusters = Object.keys(groups).sort().map(function (rootId) {
      var members = groups[rootId].slice().sort(function (left, right) { return left.id.localeCompare(right.id); });
      var origins = Array.from(new Set(members.map(function (member) { return member.originKey; }))).sort();
      return { id: "cluster:" + sha256Hex(origins.join("|") + "|" + members.map(function (member) { return member.id; }).join("|" )).slice(0, 16), originKeys: origins, observationIds: members.map(function (member) { return member.id; }), members: members };
    });
    diagnosticState.clusters = clusters.length;
    diagnosticState.collapsedObservations = Math.max(0, observations.length - clusters.length);
    return { clusters: clusters, errors: errors, ok: errors.length === 0 };
  }

  function latestIso(observations) {
    var values = observations.map(function (observation) { return observation.availableAt; }).filter(isIso).sort();
    return values.length ? values[values.length - 1] : null;
  }

  function earliestIso(observations) {
    var values = observations.map(function (observation) { return observation.availableAt; }).filter(isIso).sort();
    return values.length ? values[0] : null;
  }

  function clockState(clock, observations, clusters, excluded, missingRequirements, owner) {
    var relevant = observations.filter(function (observation) { return observation.clock === clock; });
    var excludedRelevant = excluded.filter(function (entry) { return entry.observation && entry.observation.clock === clock; });
    var contradictory = relevant.filter(function (observation) { return observation.stance === "contradict"; });
    var supportive = relevant.filter(function (observation) { return observation.stance === "support"; });
    var state = "missing";
    if (excludedRelevant.some(function (entry) { return entry.state === "stale"; })) state = "stale";
    else if (excludedRelevant.length) state = "unavailable";
    if (relevant.length) state = contradictory.length ? (supportive.length ? "mixed" : "contradictory") : (supportive.length ? "supportive" : "mixed");
    var observationIds = relevant.map(function (observation) { return observation.id; });
    var clusterIds = clusters.filter(function (cluster) { return cluster.observationIds.some(function (id) { return observationIds.indexOf(id) >= 0; }); }).map(function (cluster) { return cluster.id; });
    if (state === "missing") diagnosticState.missingClocks++;
    if (state === "stale") diagnosticState.staleClocks++;
    return {
      state: state,
      asOf: latestIso(relevant),
      freshUntil: relevant.map(function (observation) { return observation.freshness && observation.freshness.expiresAt; }).filter(isIso).sort()[0] || null,
      independentClusterIds: clusterIds,
      observationIds: observationIds,
      missingRequirements: missingRequirements || [],
      summary: state === "supportive" ? supportive.length + " current supporting observation" + (supportive.length === 1 ? "" : "s") : state === "mixed" ? "support and contradiction remain separate" : state === "contradictory" ? contradictory.length + " current contradiction" + (contradictory.length === 1 ? "" : "s") : state,
      owner: owner || "causal-rotation-lab"
    };
  }

  function timingClock(timingRead, asOf, config) {
    if (!timingRead || timingRead.contractVersion !== config.contracts.timingRead || !isIso(timingRead.asOf) || !isIso(timingRead.freshUntil) || Date.parse(timingRead.freshUntil) < Date.parse(asOf)) {
      diagnosticState.unavailableTimingReads++;
      return { state: timingRead && isIso(timingRead.freshUntil) && Date.parse(timingRead.freshUntil) < Date.parse(asOf) ? "stale" : "unavailable", code: "CR-TIMING-UNAVAILABLE", asOf: timingRead && timingRead.asOf || null, freshUntil: timingRead && timingRead.freshUntil || null, independentClusterIds: [], observationIds: [], missingRequirements: ["current " + config.contracts.timingRead], summary: "timing owner read is absent, stale, or incompatible", owner: timingRead && timingRead.ownerToolId || null };
    }
    var stateMap = { emerging: "mixed", confirming: "supportive", established: "supportive", weakening: "contradictory", invalidated: "contradictory", unavailable: "unavailable" };
    return { state: stateMap[timingRead.marketState] || "unavailable", code: timingRead.marketState === "unavailable" ? "CR-TIMING-UNAVAILABLE" : null, asOf: timingRead.asOf, freshUntil: timingRead.freshUntil, independentClusterIds: [], observationIds: [], missingRequirements: [], summary: timingRead.marketState, owner: timingRead.ownerToolId };
  }

  function findRecord(records, id) {
    var matches = (records || []).filter(function (record) { return record.id === id; }).sort(function (left, right) { return right.version - left.version; });
    return matches[0] || null;
  }

  function stageRank(stage) {
    return { established: 0, confirmable: 1, watch: 2, "cause-emerging": 3, contradicted: 4, falsified: 5, expired: 6 }[stage] == null ? 99 : { established: 0, confirmable: 1, watch: 2, "cause-emerging": 3, contradicted: 4, falsified: 5, expired: 6 }[stage];
  }

  function evaluateCandidate(input) {
    input = input || {};
    var config = input.config;
    var observationSet = input.observationSet;
    var hypothesis = input.hypothesis;
    var asOf = input.asOf;
    var posture = input.posture || "discovery";
    var configResult = validateConfig(config);
    if (!configResult.ok) return { excluded: true, code: "CR-CONFIG-INVALID", errors: configResult.errors };
    if (!hypothesis || !isIso(asOf) || !config.sensitivityPolicies[posture]) return { excluded: true, code: "CR-SCHEMA-INVALID", errors: [error("CR-SCHEMA-INVALID", "$", "hypothesis, asOf, and posture are required")] };
    var eligibility = eligibleEvidence(hypothesis, asOf, observationSet);
    var clustered = clusterEvidence(eligibility.eligible);
    if (!clustered.ok) return { excluded: true, code: "CR-CLUSTER-INVALID", errors: clustered.errors };
    var catalyst = findRecord(observationSet.catalysts, hypothesis.catalystEventId);
    var exposureMap = findRecord(observationSet.exposureMaps, hypothesis.exposureMapVersionId);
    var regime = findRecord(observationSet.regimes, hypothesis.currentRegimeVersionId);
    if (!catalyst || !exposureMap || !regime) return { excluded: true, code: "CR-SCHEMA-INVALID", errors: [error("CR-SCHEMA-INVALID", hypothesis.id, "candidate references are incomplete")] };
    var exposure = (exposureMap.exposures || []).filter(function (item) { return item.exposureId === input.exposureId; })[0] || exposureMap.exposures && exposureMap.exposures[0];
    if (!exposure) return { excluded: true, code: "CR-SCHEMA-INVALID", errors: [error("CR-SCHEMA-INVALID", hypothesis.id, "exposure map is empty")] };
    var eligibleClasses = Array.from(new Set(eligibility.eligible.map(function (observation) { return observation.evidenceClass; })));
    var missingClasses = (hypothesis.requiredEvidenceClasses || []).filter(function (evidenceClass) { return eligibleClasses.indexOf(evidenceClass) < 0; });
    var unavailableEvidence = (hypothesis.unavailableEvidence || []).filter(function (item) { return missingClasses.indexOf(item.evidenceClass) >= 0; });
    var supportObservations = eligibility.eligible.filter(function (observation) { return observation.stance === "support" && observation.classification !== "contextual-prior"; });
    var supportIds = supportObservations.map(function (observation) { return observation.id; });
    var supportClusters = clustered.clusters.filter(function (cluster) { return cluster.observationIds.some(function (id) { return supportIds.indexOf(id) >= 0; }); });
    var contradictions = eligibility.eligible.filter(function (observation) { return observation.stance === "contradict"; });
    var blockingContradictions = contradictions.filter(function (observation) { return contains(observation.blockingFor, hypothesis.id); });
    var seasonalityOnly = eligibility.eligible.length > 0 && eligibility.eligible.every(function (observation) { return observation.evidenceClass === "seasonality" || observation.classification === "contextual-prior"; });
    var integrityCodes = seasonalityOnly ? ["CR-SEASONALITY-CONTEXT-ONLY"] : [];
    var timing = timingClock(input.timingRead, asOf, config);
    var clocks = {
      catalyst: clockState("catalyst", eligibility.eligible, clustered.clusters, eligibility.excluded, [], "causal-rotation-lab"),
      fundamental: clockState("fundamental", eligibility.eligible, clustered.clusters, eligibility.excluded, missingClasses.filter(function (item) { return ["guidance", "revision", "margin", "valuation", "balance-sheet", "credit", "supply-demand"].indexOf(item) >= 0; }), "causal-rotation-lab"),
      positioning: clockState("positioning", eligibility.eligible, clustered.clusters, eligibility.excluded, missingClasses.filter(function (item) { return ["positioning", "leverage"].indexOf(item) >= 0; }), "causal-rotation-lab"),
      marketConfirmation: timing
    };
    var expectedExpired = hypothesis.expectedWindow && isIso(hypothesis.expectedWindow.end) && Date.parse(asOf) > Date.parse(hypothesis.expectedWindow.end);
    var stage;
    if (blockingContradictions.length) stage = "contradicted";
    else if (expectedExpired) stage = "expired";
    else if (timing.summary === "established" && supportClusters.length >= 2 && clocks.fundamental.state !== "contradictory") stage = "established";
    else if ((timing.summary === "emerging" || timing.summary === "confirming") && supportClusters.length >= 2 && eligibleClasses.length >= 2 && clocks.fundamental.state !== "contradictory") stage = "confirmable";
    else if (supportClusters.length >= 2 || clocks.fundamental.state === "mixed" || contradictions.length || seasonalityOnly) stage = "watch";
    else stage = "cause-emerging";
    var policy = config.sensitivityPolicies[posture];
    var nonMarketSupportClusters = supportClusters.filter(function (cluster) { return cluster.members.some(function (observation) { return observation.clock !== "market-confirmation" && observation.evidenceClass !== "market-reaction"; }); });
    var marketRank = { unavailable: 0, emerging: 1, confirming: 2, established: 3, weakening: 1, invalidated: 0 };
    var postureEligible = contains(policy.visibleStages, stage) && nonMarketSupportClusters.length >= policy.minimumIndependentNonMarketClusters && eligibleClasses.length >= policy.minimumEvidenceClasses && (marketRank[input.timingRead && input.timingRead.marketState || "unavailable"] || 0) >= (marketRank[policy.minimumMarketState] || 0);
    if (seasonalityOnly) postureEligible = false;
    if (input.riskOverlay && input.riskOverlay !== "none") postureEligible = postureEligible && nonMarketSupportClusters.length >= policy.minimumIndependentNonMarketClusters + config.riskPolicy.additionalIndependentClusters && (marketRank[input.timingRead && input.timingRead.marketState || "unavailable"] || 0) >= (marketRank[config.riskPolicy.minimumMarketState] || 0);
    var candidateId = "cand:" + hypothesis.id.replace(/^hyp:/, "") + ":" + exposure.exposureId.replace(/^exp:/, "");
    var reasonKeys = clustered.clusters.map(function (cluster) { return "causal-origin:" + cluster.originKeys.join("+"); });
    var sourceQuality = supportClusters.length >= 2 ? "corroborated" : supportClusters.length === 1 ? "bounded" : "unverified";
    var candidateRead = {
      contractVersion: config.contracts.candidateRead,
      candidateId: candidateId,
      hypothesisId: hypothesis.id,
      exposureId: exposure.exposureId,
      asOf: asOf,
      evidenceAsOf: latestIso(eligibility.eligible),
      oldestDecisionCriticalInput: earliestIso(eligibility.eligible),
      nextReviewAt: eligibility.eligible.map(function (observation) { return observation.freshness && observation.freshness.reviewAt; }).filter(isIso).sort()[0] || null,
      stage: stage,
      causeStatus: sourceQuality === "unverified" ? "unverified" : sourceQuality,
      entryEdge: stage === "established" ? (timing.summary === "established" ? "limited" : "absent") : "not-assessed",
      stageReasons: ["independent-current-support:" + supportClusters.length, "blocking-contradictions:" + blockingContradictions.length, "timing:" + timing.summary].concat(integrityCodes),
      integrityCodes: integrityCodes,
      primaryCatalyst: { id: catalyst.id, title: catalyst.title, lifecycle: catalyst.lifecycle },
      primaryMechanism: clone(hypothesis.primaryMechanism),
      clocks: clocks,
      currentRegime: clone(regime),
      regimeConsequences: clone(hypothesis.regimeConsequences),
      independentSupportClusterCount: supportClusters.length,
      independentSupportClusterIds: supportClusters.map(function (cluster) { return cluster.id; }),
      evidenceClusters: clustered.clusters.map(function (cluster) { return { id: cluster.id, originKeys: cluster.originKeys, observationIds: cluster.observationIds }; }),
      eligibleEvidenceIds: eligibility.eligible.map(function (observation) { return observation.id; }),
      excludedEvidence: eligibility.excluded.map(function (entry) { return { observationId: entry.observationId, code: entry.code, state: entry.state }; }),
      contradictionCount: contradictions.length,
      blockingContradictionCount: blockingContradictions.length,
      contradictionIds: contradictions.map(function (observation) { return observation.id; }),
      staleEvidenceIds: eligibility.excluded.filter(function (entry) { return entry.state === "stale"; }).map(function (entry) { return entry.observationId; }),
      unavailableEvidence: clone(unavailableEvidence),
      missingRequiredEvidenceClasses: missingClasses,
      sourceQuality: sourceQuality,
      limitations: clone(hypothesis.limitations || []),
      expectedWindow: clone(hypothesis.expectedWindow),
      confirmation: clone(hypothesis.confirmation),
      invalidation: clone(hypothesis.invalidation),
      exposureMismatch: !!exposure.exposureMismatch,
      fragilityFlags: clone(hypothesis.fragilityFlags || []),
      sensitivityPosture: posture,
      riskOverlay: input.riskOverlay || "none",
      postureEligible: postureEligible,
      planEligible: postureEligible && (stage === "confirmable" || stage === "established") && timing.state === "supportive" && !blockingContradictions.length,
      timingOwner: input.timingRead && input.timingRead.ownerToolId || (config.exposureCatalog.filter(function (item) { return item.id === exposure.exposureId; })[0] || {}).timingOwner || null,
      ownerDeepLink: "causal-rotation-lab.html#candidate=" + encodeURIComponent(candidateId) + "&asOf=" + encodeURIComponent(asOf),
      timingDeepLink: input.timingRead && input.timingRead.deepLink || null,
      reasonKeys: reasonKeys
    };
    candidateRead.candidateDigest = "sha256:" + sha256Hex(canonicalize(candidateRead));
    diagnosticState.evaluations++;
    increment(diagnosticState.candidatesByStage, stage);
    return deepFreeze(candidateRead);
  }

  function evaluateAll(input) {
    input = input || {};
    var candidates = [];
    var exclusions = [];
    var hypotheses = input.observationSet && input.observationSet.hypotheses || [];
    hypotheses.forEach(function (hypothesis) {
      var exposureMap = findRecord(input.observationSet.exposureMaps, hypothesis.exposureMapVersionId);
      (exposureMap && exposureMap.exposures || []).forEach(function (exposure) {
        var timingRead = (input.timingReads || []).filter(function (read) { return read.exposureId === exposure.exposureId; })[0] || null;
        var result = evaluateCandidate({ config: input.config, observationSet: input.observationSet, hypothesis: hypothesis, exposureId: exposure.exposureId, timingRead: timingRead, posture: input.posture || "discovery", riskOverlay: input.riskOverlay || "none", asOf: input.asOf });
        if (result && result.excluded) exclusions.push(result); else candidates.push(result);
      });
    });
    candidates.sort(function (left, right) {
      if (left.postureEligible !== right.postureEligible) return left.postureEligible ? -1 : 1;
      var stageDifference = stageRank(left.stage) - stageRank(right.stage); if (stageDifference) return stageDifference;
      if (left.sourceQuality !== right.sourceQuality) return { corroborated: 0, bounded: 1, unverified: 2 }[left.sourceQuality] - { corroborated: 0, bounded: 1, unverified: 2 }[right.sourceQuality];
      if (left.independentSupportClusterCount !== right.independentSupportClusterCount) return right.independentSupportClusterCount - left.independentSupportClusterCount;
      if (left.blockingContradictionCount !== right.blockingContradictionCount) return left.blockingContradictionCount - right.blockingContradictionCount;
      return left.candidateId.localeCompare(right.candidateId);
    });
    var readsByExposure = {};
    candidates.forEach(function (candidate) { (readsByExposure[candidate.exposureId] = readsByExposure[candidate.exposureId] || []).push(candidate.candidateId); });
    var snapshot = { contractVersion: input.config.contracts.snapshot, generatedAt: input.generatedAt || input.asOf, asOf: input.asOf, configVersion: input.config.version, sourceDataAsOf: latestIso(input.observationSet.observations || []), health: { state: exclusions.length ? "partial" : "fresh", errors: exclusions, staleResources: [], rejectedRecordCount: exclusions.length }, candidates: candidates, readsByExposure: readsByExposure };
    snapshot.toolRead = projectToolRead(snapshot, input.config);
    return deepFreeze(snapshot);
  }

  function explainSensitivity(candidate, from, to, config) {
    var fromPolicy = config && config.sensitivityPolicies && config.sensitivityPolicies[from];
    var toPolicy = config && config.sensitivityPolicies && config.sensitivityPolicies[to];
    if (!candidate || !fromPolicy || !toPolicy) return { contractVersion: "threshold-explanation/v1", ok: false, errors: ["candidate and known postures are required"] };
    return deepFreeze({
      contractVersion: "threshold-explanation/v1",
      ok: true,
      candidateId: candidate.candidateId,
      from: from,
      to: to,
      changed: {
        visibleStages: { from: clone(fromPolicy.visibleStages), to: clone(toPolicy.visibleStages) },
        minimumIndependentNonMarketClusters: { from: fromPolicy.minimumIndependentNonMarketClusters, to: toPolicy.minimumIndependentNonMarketClusters },
        minimumEvidenceClasses: { from: fromPolicy.minimumEvidenceClasses, to: toPolicy.minimumEvidenceClasses },
        minimumMarketState: { from: fromPolicy.minimumMarketState, to: toPolicy.minimumMarketState }
      },
      invariantGates: clone(toPolicy.invariantGates),
      evidenceDigest: candidate.candidateDigest
    });
  }

  function freezeDecision(candidate, context) {
    if (!candidate || !candidate.candidateDigest || !context || !isIso(context.decisionAt)) return { ok: false, code: "CR-SCHEMA-INVALID", errors: ["candidate and decisionAt are required"] };
    var record = {
      contractVersion: context.contractVersion || "causal-decision/v1",
      decisionId: context.decisionId,
      decisionAt: context.decisionAt,
      configVersion: context.configVersion,
      evaluatorVersion: context.evaluatorVersion,
      sensitivityPosture: candidate.sensitivityPosture,
      riskOverlay: candidate.riskOverlay,
      evidenceRefs: clone(context.evidenceRefs || candidate.eligibleEvidenceIds.map(function (id) { return { id: id }; })),
      regimeVersionId: candidate.currentRegime.id,
      timingRead: clone(context.timingRead || null),
      candidate: clone(candidate),
      candidateDigest: candidate.candidateDigest
    };
    record.decisionDigest = "sha256:" + sha256Hex(canonicalize(record));
    return deepFreeze(record);
  }

  function evaluateOutcome(decision, currentFacts) {
    if (!decision || !decision.decisionDigest || !currentFacts || !isIso(currentFacts.observedAt)) return { ok: false, code: "CR-SCHEMA-INVALID" };
    var originalDigest = "sha256:" + sha256Hex(canonicalize(withoutDigest(Object.assign({}, decision, { decisionDigest: undefined }))));
    var state = currentFacts.invalidationConditionIds && currentFacts.invalidationConditionIds.length ? "falsified" : currentFacts.confirmationConditionIds && currentFacts.confirmationConditionIds.length ? "confirmed" : currentFacts.windowExpired ? "expired" : "unresolved";
    return deepFreeze({
      contractVersion: currentFacts.contractVersion || "causal-ledger-event/v1",
      eventType: "outcome",
      decisionId: decision.decisionId,
      observedAt: currentFacts.observedAt,
      state: state,
      confirmationConditionIds: clone(currentFacts.confirmationConditionIds || []),
      invalidationConditionIds: clone(currentFacts.invalidationConditionIds || []),
      sourceObservationIds: clone(currentFacts.sourceObservationIds || []),
      evaluatorVersion: currentFacts.evaluatorVersion,
      frozenCandidateDigest: decision.candidateDigest,
      decisionDigest: decision.decisionDigest,
      decisionIntegrityDigest: originalDigest
    });
  }

  function projectToolRead(snapshot, config) {
    var candidate = snapshot && snapshot.candidates && snapshot.candidates[0];
    var contractVersion = config && config.contracts && config.contracts.toolRead || "causal-tool-read/v1";
    if (!candidate) return { id: "causal-rotation-lab", asOf: snapshot && snapshot.asOf || null, read: "Causal rotation research unavailable: no valid current candidate.", metrics: { contractVersion: contractVersion, topCandidateId: null, exposureId: null, stage: null, causeStatus: "unavailable", evidenceAsOf: null, regimeVersionId: null, independentConfirmationCount: 0, contradictionCount: 0, confirmation: null, invalidation: null, timingOwner: null, planEligible: false, candidateCount: 0, health: "unavailable" }, deepLink: "causal-rotation-lab.html" };
    return {
      id: "causal-rotation-lab",
      asOf: snapshot.asOf,
      read: candidate.stage + ": " + candidate.primaryMechanism.name + "; " + (candidate.planEligible ? "eligible for plan comparison" : "not plan-eligible; confirmation remains required") + ".",
      metrics: {
        contractVersion: contractVersion,
        topCandidateId: candidate.candidateId,
        exposureId: candidate.exposureId,
        stage: candidate.stage,
        causeStatus: candidate.causeStatus,
        evidenceAsOf: candidate.evidenceAsOf,
        regimeVersionId: candidate.currentRegime.id,
        independentConfirmationCount: candidate.independentSupportClusterCount,
        contradictionCount: candidate.contradictionCount,
        confirmation: candidate.confirmation[0] && candidate.confirmation[0].description || null,
        invalidation: candidate.invalidation[0] && candidate.invalidation[0].description || null,
        timingOwner: candidate.timingOwner,
        planEligible: candidate.planEligible,
        candidateCount: snapshot.candidates.length,
        health: snapshot.health && snapshot.health.state || "partial",
        reasonKeys: clone(candidate.reasonKeys)
      },
      deepLink: candidate.ownerDeepLink
    };
  }

  function readForExposure(snapshot, exposureId) {
    if (!snapshot || snapshot.contractVersion !== "causal-snapshot/v1") return { available: false, code: "CR-SCHEMA-INVALID", reason: "unknown causal snapshot version" };
    var candidates = (snapshot.candidates || []).filter(function (candidate) { return candidate.exposureId === exposureId; });
    if (!candidates.length) return { available: false, code: "CR-TIMING-UNAVAILABLE", reason: "no causal read for exposure", exposureId: exposureId };
    var candidate = candidates[0];
    return { available: true, contractVersion: candidate.contractVersion, candidateId: candidate.candidateId, exposureId: exposureId, stage: candidate.stage, causeStatus: candidate.causeStatus, evidenceAsOf: candidate.evidenceAsOf, contradictionCount: candidate.contradictionCount, confirmation: clone(candidate.confirmation), invalidation: clone(candidate.invalidation), limitations: clone(candidate.limitations), deepLink: candidate.ownerDeepLink };
  }

  function diagnostics() {
    return deepFreeze(clone(diagnosticState));
  }

  function resetDiagnostics() {
    diagnosticState = freshDiagnostics();
    return diagnostics();
  }

  root.RLCausal = Object.freeze({
    canonicalize: canonicalize,
    sha256Hex: sha256Hex,
    digestRecord: digestRecord,
    validateConfig: validateConfig,
    validateObservationSet: validateObservationSet,
    parseLedger: parseLedger,
    mergeSources: mergeSources,
    eligibleEvidence: eligibleEvidence,
    clusterEvidence: clusterEvidence,
    evaluateCandidate: evaluateCandidate,
    evaluateAll: evaluateAll,
    explainSensitivity: explainSensitivity,
    freezeDecision: freezeDecision,
    evaluateOutcome: evaluateOutcome,
    projectToolRead: projectToolRead,
    readForExposure: readForExposure,
    diagnostics: diagnostics,
    resetDiagnostics: resetDiagnostics
  });
})();