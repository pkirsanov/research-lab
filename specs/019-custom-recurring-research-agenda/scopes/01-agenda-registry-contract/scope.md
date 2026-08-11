# Scope 1: Agenda Registry Contract And Owning Module

## 01-agenda-registry-contract

**Status:** Not started
**Scope-Kind:** capability-foundation
**Tags:** foundation, contract, closed-vocabulary, named-refusal, committed-state
Depends On: none — this is the only root scope
Foundation: true

**Primary Outcome:** `research-agenda.json` exists as a committed root artifact
carrying `research-agenda/v1`, and `rlagenda.js` exists as the single UMD module
that owns the topic shape, the three closed vocabularies, the fourteen
`RLAGENDA-*` refusal codes and the balancing assertion. A disposable clone can
read the registry with no network and no browser. An absent registry is a named
absence, never a synthesised default set. One malformed topic is refused by name
and the remaining topics survive. Nothing is researched and nothing is published
in this scope.

## Requirement Coverage

- FR-019-001 — the registry is a committed repository file readable by a Node run
  with no network and no browser.
- FR-019-002 — no `localStorage`, no session storage, no uncommitted local file,
  and no state absent from a fresh `git clone --single-branch`.
- FR-019-003 — a versioned `contractVersion`, following the
  `market-brief-experimental/v1` precedent already committed in
  `market-brief.experimental.json`.
- FR-019-004 — a stable `topicId` matching `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, the
  same pattern a public route target must satisfy, refused by `RLAGENDA-ID` and
  `RLAGENDA-DUPLICATE`.
- FR-019-005 — the operator's `declaredQuestion` in the operator's own words;
  absent or empty is `RLAGENDA-QUESTION`.
- FR-019-006 — an explicit `scopeBoundary` naming subjects, geographies,
  instruments or horizons; absent is `RLAGENDA-BOUNDARY`.
- FR-019-007 — `reviewCadenceDays` and `freshnessWindowDays` both required, neither
  inferred from a default; absent or non-positive is `RLAGENDA-CADENCE`.
- FR-019-008 — `lifecycleState` from the closed `active | paused | retired`
  vocabulary; anything else is `RLAGENDA-LIFECYCLE`.
- FR-019-009 — the contract, the lifecycle vocabulary and the due decision are
  defined in exactly one module and every consumer reads them from it (P19).
- FR-019-015 (contract half) — an invalid topic is refused by name with its reason
  and does not prevent the remaining topics from being reviewed. The lifecycle
  half is scope 2.
- FR-019-020 (contract half) — `reviewBudget` is a required positive integer;
  absent or malformed is `RLAGENDA-BUDGET`. Its enforcement is scope 3.
- NFR-019-004 — every guard introduced here carries an adversarial case that fails
  when the guard is removed.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-001 A disposable clone sees every declared topic
  Given the agenda registry is a committed repository file
  And the scheduler has cloned origin/main into a disposable checkout
  When the generation reads the agenda
  Then it sees every topic the operator declared on the branch
  And it reads no browser state and no uncommitted local file

Scenario: SCN-019-002 An absent agenda is a named absence
  Given no agenda registry exists in the checkout
  When the generation reads the agenda
  Then it records a named absence with a reason
  And it does not synthesise a default topic set
  And the rest of the brief still generates

Scenario: SCN-019-003 One invalid topic does not disable the others
  Given the agenda declares three topics and one is missing its declared question
  When the agenda is validated
  Then the invalid topic is refused with a named reason
  And the remaining two topics are still reviewed
```

## Implementation Files

### New

- `research-agenda.json` — the committed operator-owned registry
- `rlagenda.js` — the single UMD owning module
- `tests/fixtures/research-agenda/registry-valid.json`
- `tests/fixtures/research-agenda/registry-one-topic-no-question.json`
- `tests/fixtures/research-agenda/registry-duplicate-topic-id.json`
- `tests/fixtures/research-agenda/registry-missing-cadence.json`
- `tests/fixtures/research-agenda/registry-bad-contract-version.json`

### Modified

- `scripts/selftest.mjs` — one new assertion group
- `notes/README.md` — the notes-index row for the tool's notes target
- `notes/research-agenda-lab.md` — created here as the contract note; the tool
  registration that makes it a registered `notes` target is scope 5

## Implementation Plan

1. Author `rlagenda.js` as a UMD dual module at the repository root beside
   `rlattention.js` and `rlmarketaction.js`. Never ESM, no build step, loadable
   from `file://` (P10). Copy the shape of `rlattention.js` exactly: frozen
   vocabularies, a closed `REFUSAL_CODES` array, and a `refuse(code, field,
   message)` helper that returns `{ ok: false, code, field, message }` rather
   than throwing.
2. Freeze `CONTRACT_VERSION`, `DOSSIER_CONTRACT_VERSION` and
   `READ_CONTRACT_VERSION` as string constants, plus `LIFECYCLE_STATES`,
   `OUTCOME_STATES`, `TRIGGER_KINDS`, `CONFIDENCE_LEVELS`, `PRIVATE_FIELDS` and
   `REFUSAL_CODES` as frozen arrays. `PRIVATE_FIELDS` is the same four names
   `rlattention.js` already freezes, read from one place rather than restated.
3. Implement `validateTopic(topic)` as a top-level `function` declaration
   returning `{ ok, code, field, message }`. Every branch names its field. No
   branch supplies a default, an inference or a fallback value.
4. Implement `validateAgenda(registry)` returning `{ topics, refusals }` where a
   refusal is `{ index, topicId, code, field, reason }` — the same five-member
   shape `payload.attentionExclusions[]` already uses and
   `scripts/validate-brief-payload.mjs` already validates for attention.
5. Assert the balance inside `validateAgenda` itself: `topics.length +
   refusals.length === registry.topics.length`. This is the accounting
   `scripts/build-attention-items.mjs` already enforces for attention, and it is
   what makes "one bad topic does not sink the agenda" mechanical rather than
   hoped for.
6. Return `registryState: 'absent'` for a missing file and `'unreadable'` with
   `RLAGENDA-CONTRACT` for an unparseable body or an unknown `contractVersion`.
   Neither path synthesises a topic, and neither throws into the caller.
7. Commit `research-agenda.json` with the three real topics — defense production
   and earnings acceleration, U.S.–Iran oil and the Strait of Hormuz, and food,
   grains and fertilizer — plus a fourth drafted topic, which settles design open
   question 2 by exercising the contract against a shape beyond the three it was
   designed from. The fourth topic is committed only if it validates unchanged;
   if it does not, the contract is amended in this scope rather than after it is
   frozen.
8. Register a `research-agenda — registry contract` group in
   `scripts/selftest.mjs`, loading `rlagenda.js` through
   `createRequire(import.meta.url)` exactly as `scripts/build-attention-items.mjs`
   loads `rlattention.js`, so the Node consumer and the browser hold the identical
   frozen object.
9. Record the contract, its field rules and its refusal table in
   `notes/research-agenda-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `rlagenda.js` (new root module) | Created | Scopes 2–5, the publish gate, both pages | High — a second copy of any vocabulary anywhere downstream breaks P19 permanently and silently | Assert the module is loaded through `createRequire` and that the repository holds exactly one declaration of each vocabulary name | Delete the file; nothing consumes it until scope 2 |
| `research-agenda.json` (new root artifact) | Created | The offline plan, the published read, the Pages build | Medium — a root `.json` ships to Pages by the ordinary root-file rule, so a private field here becomes public immediately | `node scripts/pii-scan.mjs` over the committed tree, and a fixture carrying `size` proving `RLAGENDA-PRIVATE` fires | Delete the file; the absent path is a named absence by construction |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate and the Pages verify job | Medium — a group that reads the real registry rather than a fixture would flake as the operator edits topics | Every case drives a committed fixture; the real registry is asserted only for validity, never for content | Remove the appended group |
| `notes/README.md` | One index row | The notes index | Low | The row points at a file created in this scope | Revert the row |

## Change Boundary And Protected Paths

**Allowed:** `research-agenda.json` · `rlagenda.js` ·
`tests/fixtures/research-agenda/*.json` · `scripts/selftest.mjs` ·
`notes/research-agenda-lab.md` · `notes/README.md`.

**Excluded (must remain byte-identical in this scope):**
`scripts/brief-narrative-parallel.mjs` · `scripts/validate-brief-payload.mjs` ·
`scripts/build-attention-items.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`scripts/build-pages-site.mjs` · `tools.json` · `index.html` · `rlnav.js` ·
`rlattention.js` · `rlmarketaction.js` · `rlbrief.js` · `rlviews.js` · `rlapp.js` ·
`rlexperience.js` · `market-brief.html` · `market-brief.config.json` ·
`market-brief.payload.json` · `market-brief.page.json` ·
`market-brief.snapshot.json` · `site-exclusions.json` ·
`tool-experience.config.json` · `watchlist.json` · `README.md`.

`tools.json` is on the excluded list for a reason that is not stylistic:
`scripts/build-pages-site.mjs` asserts at `:41-43` that every registered page
exists, so registering the tool before its page exists leaves the site build red.
Registration is atomic and belongs entirely to scope 5.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlagenda.js` | The deliverable. |
| Registry artifact | `research-agenda.json` | The committed operator surface the whole feature reads. |
| Contract fixtures | `tests/fixtures/research-agenda/*.json` | The registries the refusals are proven against. `tests/fixtures` is already in the frozen `PUBLIC_DIRECTORIES` list at `scripts/build-pages-site.mjs:13`, so no publication rule changes. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Tool notes | `notes/research-agenda-lab.md`, `notes/README.md` | Where the contract is recorded beside the tool. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Publisher lane wiring | `scripts/brief-narrative-parallel.mjs` | Scope 4 |
| Publish gate and page artifacts | `scripts/validate-brief-payload.mjs`, `scripts/build-brief-page-artifacts.mjs` | Scope 5 |
| Registration surfaces | `tools.json`, `index.html`, `rlnav.js`, `README.md`, `site-exclusions.json`, `tool-experience.config.json`, `scripts/build-pages-site.mjs` | Scope 5 |
| Attention and alert modules | `rlattention.js`, `rlmarketaction.js`, `scripts/build-attention-items.mjs` | Feature 020, and not this feature at all |

## Rollback

Delete `research-agenda.json`, `rlagenda.js`, the five fixtures and
`notes/research-agenda-lab.md`; remove the appended selftest group and the
`notes/README.md` row. Prove the restore by running `node scripts/selftest.mjs`
and recording exit 0 with the unfiltered output. Nothing downstream is affected,
because no consumer exists until scope 2.

## Scenario-First RED/GREEN Contract

RED: author the three scenarios and the five fixtures first. Record the
one-topic-no-question fixture returning three accepted topics before
`RLAGENDA-QUESTION` exists — that is the silent-acceptance defect the refusal
removes. Record the absent-registry path throwing before the named-absence branch
exists.

GREEN: the valid fixture yields three accepted topics and zero refusals; the
no-question fixture yields two accepted topics and exactly one refusal carrying
`RLAGENDA-QUESTION` and the field `declaredQuestion`; the balance holds in every
case; the absent path returns `registryState: 'absent'` with zero synthesised
topics; the bad-contract-version path returns `registryState: 'unreadable'` with
`RLAGENDA-CONTRACT`; and the offline case runs with global `fetch` stubbed to
throw.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-019-001 | `scripts/selftest.mjs` | the committed `research-agenda.json` is read by a Node run with global `fetch` stubbed to throw and with no `localStorage` binding present, and every topic the file declares is returned by `validateAgenda`; the set of files opened during the read is recorded and contains no path outside the repository checkout | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Named absence | unit | SCN-019-002 | `scripts/selftest.mjs` | reading an absent registry path returns `registryState: 'absent'` with a named reason, returns exactly zero topics, and is asserted to synthesise no default topic set — the returned topic array is empty rather than populated with an example | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Named absence | unit | SCN-019-002 | `scripts/selftest.mjs` | an unparseable body and an unknown `contractVersion` both return `registryState: 'unreadable'` with `RLAGENDA-CONTRACT`, neither throws into the caller, and the caller's remaining work continues so the rest of the brief still generates | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Refusal | unit | SCN-019-003 | `scripts/selftest.mjs` | the three-topic fixture whose middle topic is missing its declared question yields exactly two accepted topics and exactly one refusal carrying `RLAGENDA-QUESTION`, the field `declaredQuestion` and a named reason, and both surviving topics are still reviewed | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Adversarial | unit | SCN-019-003 | `scripts/selftest.mjs` | Regression: the balancing assertion `accepted + refusals === declared` is asserted for every fixture, and a deliberately mutated validator that drops a refused topic without recording it is proven to fail the assertion — the guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Contract | unit | SCN-019-003 | `scripts/selftest.mjs` | each of the fourteen `RLAGENDA-*` codes is raised by at least one fixture or constructed input, every code raised is a member of the frozen `REFUSAL_CODES` array, and no validation branch returns a code absent from that array | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Contract | unit | SCN-019-001 | `scripts/selftest.mjs` | `topicId` accepts `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` and refuses a leading hyphen, a trailing hyphen, an uppercase character and an empty string with `RLAGENDA-ID`; two topics sharing an id are refused `RLAGENDA-DUPLICATE` | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Contract | unit | SCN-019-001 | `scripts/selftest.mjs` | `reviewCadenceDays`, `freshnessWindowDays` and `reviewBudget` are each refused when absent, zero, negative or non-integer, with `RLAGENDA-CADENCE` and `RLAGENDA-BUDGET` respectively, and no branch substitutes a default value for any of the three | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Single-definition | unit | SCN-019-001 | `scripts/selftest.mjs` | Regression: `rlagenda.js` is loaded through `createRequire` and the repository is scanned for a second literal declaration of `LIFECYCLE_STATES`, `OUTCOME_STATES`, `TRIGGER_KINDS` or `REFUSAL_CODES`; exactly one declaration of each exists, so no consumer holds a divergent copy | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Contract | unit | SCN-019-001 | `scripts/selftest.mjs` | the committed `research-agenda.json` validates with zero refusals, including the fourth drafted topic, proving the contract holds against a topic shape beyond the three it was designed from | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Path guard | unit | SCN-019-001 | `scripts/validate-spec-test-paths.mjs` | the spec-artifact test-path guard reports zero new missing paths for this scope's artifacts, so no declared verification path is stale | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-11` |

### Definition of Done

- [ ] SCN-019-001 — a Node run in a disposable-clone-equivalent checkout, with `fetch` stubbed to throw, sees every topic the operator declared on the branch and reads no browser state and no uncommitted local file, proven by TP-01-01.
- [ ] SCN-019-002 — an absent agenda registry records a named absence with a reason, synthesises no default topic set, and the rest of the brief still generates, proven by TP-01-02 and TP-01-03.
- [ ] SCN-019-003 — one invalid topic missing its declared question is refused with a named reason while the remaining two topics are still reviewed, proven by TP-01-04.
- [ ] `research-agenda.json` exists at the repository root, carries `contractVersion: "research-agenda/v1"` and a positive-integer `reviewBudget`, and is committed — not `localStorage`, not session storage, not an uncommitted file (FR-019-001, FR-019-002, FR-019-003), proven by TP-01-01 and TP-01-08.
- [ ] Every topic carries a stable `topicId` matching the public-target pattern, and duplicate ids are refused, proven by TP-01-07.
- [ ] Every topic carries `declaredQuestion`, `scopeBoundary`, `reviewCadenceDays`, `freshnessWindowDays` and `lifecycleState`, each refused by its own named code when absent, with no default substituted for any of them, proven by TP-01-04, TP-01-06 and TP-01-08.
- [ ] `rlagenda.js` is the only module declaring the lifecycle vocabulary, the outcome vocabulary, the trigger vocabulary and the refusal codes, proven by TP-01-09.
- [ ] All fourteen `RLAGENDA-*` codes are members of one frozen array and every validation branch returns a member of it, proven by TP-01-06.
- [ ] The balancing assertion `accepted + refusals === declared` holds for every fixture, and a mutated validator that drops a refused topic is proven to fail it, proven by TP-01-05.
- [ ] Every public function in `rlagenda.js` is authored as a top-level `function name(...)` declaration, so `extractFn` in `scripts/selftest.mjs:46` can extract it for headless testing.
- [ ] The committed registry validates with zero refusals including a fourth drafted topic, settling design open question 2 with an observation rather than an assumption, proven by TP-01-10.
- [ ] `node scripts/selftest.mjs` exits 0 with the new group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths, proven by TP-01-11.
- [ ] `node scripts/pii-scan.mjs` exits 0 across `git ls-files` with the new registry and fixtures committed.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-01-01 executed with raw output recorded at `report.md#tp-01-01`.
- [ ] TP-01-02 executed with raw output recorded at `report.md#tp-01-02`.
- [ ] TP-01-03 executed with raw output recorded at `report.md#tp-01-03`.
- [ ] TP-01-04 executed with raw output recorded at `report.md#tp-01-04`.
- [ ] TP-01-05 executed with raw output recorded at `report.md#tp-01-05`.
- [ ] TP-01-06 executed with raw output recorded at `report.md#tp-01-06`.
- [ ] TP-01-07 executed with raw output recorded at `report.md#tp-01-07`.
- [ ] TP-01-08 executed with raw output recorded at `report.md#tp-01-08`.
- [ ] TP-01-09 executed with raw output recorded at `report.md#tp-01-09`.
- [ ] TP-01-10 executed with raw output recorded at `report.md#tp-01-10`.
- [ ] TP-01-11 executed with raw output recorded at `report.md#tp-01-11`.
