/*
 * Shared fixture helper: make a brief payload conformant with BRIEF_NARRATIVE_FIELDS_REQUIRED.
 *
 * Two suites need this and they need it for the same reason. The publish path now refuses a newly
 * generated narrative that omits required reader copy, and both suites build their "generated"
 * payload from the COMMITTED one — which is exactly the artifact that drifts. Backfilling one named
 * field is not enough: the 2026-08-15 publish dropped `dataAsOf.labels`, the next publish restored
 * it and dropped `regime.macroCycle` instead. A fixture pinned to either field breaks for a reason
 * that has nothing to do with what the suite is testing.
 *
 * So the backfill is DERIVED from the required list. Whatever today's publish happens to omit, the
 * fixture reaches conformance and the suite stays about its own subject.
 */
import { BRIEF_NARRATIVE_FIELDS_REQUIRED, matchesFieldPatterns, walkBriefStrings } from '../scripts/reader-vocabulary.mjs';

export const REQUIRED_FIELD_PLACEHOLDER =
  'Reader-facing placeholder copy supplied by a fixture so the gate is what is under test.';

/** Required patterns that resolve to no string in this payload. */
export function missingRequiredNarrativeFields(payload) {
  const present = walkBriefStrings(payload);
  return BRIEF_NARRATIVE_FIELDS_REQUIRED.filter(
    (pattern) => !present.some((entry) => matchesFieldPatterns([pattern], entry.segments))
  );
}

/* Follows the segment grammar walkBriefStrings emits: '[]' is an array element, '*' and '**' stand
   for one unnamed segment (a tool id, a ticker). Gives up rather than inventing a shape it cannot
   place, so a pattern it cannot satisfy stays visibly missing instead of silently passing. */
function ensurePattern(payload, pattern) {
  const segments = pattern.split('.');
  let node = payload;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const last = index === segments.length - 1;
    if (segment === '[]') {
      if (!Array.isArray(node)) return;
      if (!node.length) node.push({});
      node = node[0];
      continue;
    }
    const key = segment === '*' || segment === '**' ? (Object.keys(node)[0] ?? 'placeholder') : segment;
    if (last) { node[key] = REQUIRED_FIELD_PLACEHOLDER; return; }
    if (typeof node[key] !== 'object' || node[key] === null) {
      node[key] = segments[index + 1] === '[]' ? [] : {};
    }
    node = node[key];
  }
}

/** A deep copy carrying every required narrative field. */
export function conformantNarrativePayload(payload) {
  const next = JSON.parse(JSON.stringify(payload));
  for (const pattern of missingRequiredNarrativeFields(next)) ensurePattern(next, pattern);
  return next;
}
