import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = resolve(ROOT, 'specs/_ops/OPS-integrate-research-lab-main');
const EXPECTED_INVENTORY_ID = 'sha256:e3d062462b03930c7abc565837254eb3e37c0866ac5b9dbd0ee537bc86f5acf5';
const FULL_OID = /^[0-9a-f]{40}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

function readLedger() {
  return readFileSync(resolve(SPEC_DIR, 'integration-ledger.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map((line, index) => {
      assert.doesNotThrow(() => JSON.parse(line), `ledger line ${index + 1} must be valid JSON`);
      return JSON.parse(line);
    });
}

function closedClassifications() {
  const spec = readFileSync(resolve(SPEC_DIR, 'spec.md'), 'utf8');
  const requirement = spec.match(/\*\*OPS-FR-005:\*\*[^\n]+/);
  assert.ok(requirement, 'OPS-FR-005 must declare the closed classification vocabulary');
  const values = [...requirement[0].matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  assert.equal(values.length, 7, 'OPS-FR-005 must expose all seven closed classifications');
  return new Set(values);
}

function selectionViolations(rows) {
  const frozen = rows.find((row) => row.eventType === 'inventory-frozen');
  const resolutions = new Set(rows
    .filter((row) => row.eventType === 'classification-resolution')
    .map((row) => row.recordId));
  return (frozen?.selectedInputs || []).filter((selection) => {
    return typeof selection !== 'object'
      || selection === null
      || !resolutions.has(selection.classificationResolutionRecordId);
  });
}

function cardinalityFacts(rows) {
  const items = rows.filter((row) => row.eventType === 'inventory-item');
  const refGroups = items.filter((row) => row.itemKind === 'ref-object-group');
  const worktrees = items.filter((row) => row.itemKind === 'worktree-registration');
  const stashAliases = items.filter((row) => row.itemKind === 'stash-alias');
  const refs = refGroups.flatMap((row) => row.refs);
  const worktreeAliases = worktrees.map((row) => row.alias);
  const stashNames = stashAliases.map((row) => row.name);
  return {
    items,
    refGroups,
    worktrees,
    stashAliases,
    refs,
    worktreeAliases,
    stashNames,
    uniqueRefs: new Set(refs),
    uniqueWorktreeAliases: new Set(worktreeAliases),
    uniqueStashNames: new Set(stashNames)
  };
}

test('Regression: SCN-OPS-001 fetch discovery never selects merge inputs', () => {
  const rows = readLedger();
  const frozen = rows.find((row) => row.eventType === 'inventory-frozen');
  assert.ok(frozen, 'the ledger must contain an inventory-frozen record');
  assert.equal(frozen.inventoryId, EXPECTED_INVENTORY_ID, 'the test must examine the current frozen inventory');
  assert.equal(frozen.fetchEvidence.operatorReportedComplete, true, 'fetch discovery must remain recorded');
  assert.equal(frozen.fetchEvidence.fetchExecutedByScope1, false, 'Scope 1 must not perform another fetch');
  assert.match(frozen.fetchEvidence.currentOriginMain, FULL_OID, 'fetch evidence must carry a full tracking-ref identity');
  assert.deepEqual(frozen.selectedInputs, [], 'fetch discovery must leave selectedInputs empty at freeze');
  assert.deepEqual(selectionViolations(rows), [], 'an empty selection must require no classification-resolution record');

  const fetchedPreservation = rows.find((row) => {
    return row.eventType === 'inventory-item'
      && row.itemKind === 'ref-object-group'
      && row.classification === 'represented-preservation'
      && row.refs.some((ref) => ref.startsWith('refs/remotes/origin/'));
  });
  assert.ok(fetchedPreservation, 'the frozen inventory must exercise a fetched preservation ref');

  const negativeControl = structuredClone(rows);
  const controlFreeze = negativeControl.find((row) => row.eventType === 'inventory-frozen');
  controlFreeze.selectedInputs = [{
    itemId: fetchedPreservation.itemId,
    ref: fetchedPreservation.refs.find((ref) => ref.startsWith('refs/remotes/origin/')),
    classificationResolutionRecordId: 'missing-resolution'
  }];
  assert.deepEqual(
    selectionViolations(negativeControl).map((entry) => entry.itemId),
    [fetchedPreservation.itemId],
    'negative control: a fetched preservation ref without a classification resolution must be rejected'
  );
});

test('Regression: SCN-OPS-002 inventory cardinality and classifications are exact', () => {
  const rows = readLedger();
  const frozen = rows.find((row) => row.eventType === 'inventory-frozen');
  const facts = cardinalityFacts(rows);
  const vocabulary = closedClassifications();

  assert.equal(rows.length, 37, 'the ledger must contain one freeze record and 36 inventory items');
  assert.deepEqual(rows.map((row) => row.sequence), Array.from({ length: 37 }, (_, index) => index + 1));
  assert.equal(new Set(rows.map((row) => row.recordId)).size, rows.length, 'every recordId must be unique');
  assert.equal(facts.items.length, 36, 'every discovered item must have one inventory-item record');
  assert.equal(facts.refGroups.length, 30, 'the 68 refs must remain grouped into 30 object groups');
  assert.equal(facts.refs.length, 68, 'every discovered ref must occur once');
  assert.equal(facts.uniqueRefs.size, 68, 'no full ref name may occur in two object groups');
  assert.equal(facts.worktrees.length, 5, 'every worktree registration must occur once');
  assert.equal(facts.uniqueWorktreeAliases.size, 5, 'every worktree alias must be unique');
  assert.equal(facts.stashAliases.length, 1, 'the logical stash alias must occur once');
  assert.equal(facts.uniqueStashNames.size, 1, 'the stash alias must be unique');
  assert.deepEqual(frozen.counts, {
    refs: 68,
    refObjectGroups: 30,
    worktrees: 5,
    stashAliases: 1,
    inventoryItems: 36
  });

  const refItemByRecordId = new Map(facts.refGroups.map((row) => [row.recordId, row]));
  for (const item of facts.items) {
    assert.equal(vocabulary.has(item.classification), true, `${item.itemId} must use a closed classification`);
    assert.equal(typeof item.owner === 'string' && item.owner.length > 0, true, `${item.itemId} must name ownership`);
    assert.equal(typeof item.proposedAction === 'string' && item.proposedAction.length > 0, true, `${item.itemId} must name an action`);
    assert.equal(Array.isArray(item.sourceEvidence) && item.sourceEvidence.length > 0, true, `${item.itemId} must name evidence`);
    assert.equal(item.inventoryId, EXPECTED_INVENTORY_ID, `${item.itemId} must bind to the frozen identity`);

    if (item.itemKind === 'ref-object-group') {
      assert.equal(Array.isArray(item.refs) && item.refs.length > 0, true, `${item.itemId} must name at least one ref`);
      assert.match(item.object?.oid || '', FULL_OID, `${item.itemId} must carry a full object identity`);
      assert.equal(typeof item.object?.type === 'string' && item.object.type.length > 0, true, `${item.itemId} must carry an object type`);
      assert.match(item.object?.tree || '', FULL_OID, `${item.itemId} must carry a full tree identity`);
      for (const baseline of ['localMain', 'originMain']) {
        const topology = item.topology?.[baseline];
        assert.equal(typeof topology?.relation === 'string' && topology.relation.length > 0, true, `${item.itemId} must record ${baseline} ancestry`);
        assert.equal(Number.isInteger(topology?.baselineOnlyCommits), true, `${item.itemId} must count ${baseline} unique commits`);
        assert.equal(Number.isInteger(topology?.itemOnlyCommits), true, `${item.itemId} must count item-only commits against ${baseline}`);
        assert.equal(Number.isInteger(topology?.uniqueTreePaths?.count), true, `${item.itemId} must count ${baseline} tree paths`);
        assert.match(topology?.uniqueTreePaths?.sha256 || '', SHA256_HEX, `${item.itemId} must identify the ${baseline} tree-path set`);
      }
    } else if (item.itemKind === 'worktree-registration') {
      assert.equal(typeof item.alias === 'string' && item.alias.length > 0, true, `${item.itemId} must carry a worktree alias`);
      assert.match(item.head || '', FULL_OID, `${item.itemId} must carry a full worktree head`);
      assert.equal(typeof item.branch === 'string' && item.branch.startsWith('refs/heads/'), true, `${item.itemId} must carry its branch identity`);
      const topologyOwner = refItemByRecordId.get(item.topologyRef);
      assert.ok(topologyOwner, `${item.itemId} must link to a ref topology record`);
      assert.equal(topologyOwner.object.oid, item.head, `${item.itemId} topology must carry its head tree and ancestry`);
      assert.equal(typeof item.normalizedStatus === 'object' && item.normalizedStatus !== null, true, `${item.itemId} must carry normalized status evidence`);
    } else if (item.itemKind === 'stash-alias') {
      assert.equal(typeof item.name === 'string' && item.name.length > 0, true, `${item.itemId} must carry a stash alias`);
      assert.match(item.oid || '', FULL_OID, `${item.itemId} must carry a full stash identity`);
      for (const field of ['base', 'index', 'worktreeTree', 'indexTree']) {
        assert.match(item.stash?.[field] || '', FULL_OID, `${item.itemId} must carry stash ${field} identity`);
      }
      const topologyOwner = refItemByRecordId.get(item.topologyRef);
      assert.ok(topologyOwner, `${item.itemId} must link to a ref topology record`);
      assert.equal(topologyOwner.object.oid, item.oid, `${item.itemId} topology must match the stash object`);
    } else {
      assert.fail(`unexpected inventory item kind: ${item.itemKind}`);
    }
  }

  const duplicateControl = structuredClone(rows);
  const duplicateGroups = duplicateControl.filter((row) => row.itemKind === 'ref-object-group');
  duplicateGroups[1].refs.push(duplicateGroups[0].refs[0]);
  const duplicateFacts = cardinalityFacts(duplicateControl);
  assert.equal(
    duplicateFacts.refs.length > duplicateFacts.uniqueRefs.size,
    true,
    'negative control: a repeated ref name must violate exact cardinality'
  );

  const omissionControl = structuredClone(rows).filter((row) => row.itemId !== facts.worktrees[0].itemId);
  const omissionFacts = cardinalityFacts(omissionControl);
  assert.equal(
    omissionFacts.uniqueWorktreeAliases.size,
    4,
    'negative control: an omitted worktree alias must violate exact cardinality'
  );
});