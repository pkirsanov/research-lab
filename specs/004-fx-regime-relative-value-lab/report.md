# Report: 004 FX Regime And Relative-Value Lab

Related artifacts: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This file is the single-file execution-evidence destination for the five sequential scopes in [scopes.md](scopes.md). `bubbles.plan` authored the planning structure and scenario/test contracts; it did not implement or certify product behavior.

The design records a prior `node scripts/selftest.mjs` result of 345 passed and 0 failed. The planning run executed the command again on 2026-07-14 and observed 344 passed and 1 failed: the current shared Market Brief payload omits registered `bond-regime-lab`, a pre-existing finding already recorded by spec 003. These observations are context only and are not execution evidence for any Feature 004 DoD item. `BASE-SEC-01`, `BASE-SEC-02`, `BASE-SEC-03`, and `BASE-BRIEF-01` remain protected assertions with their existing owners.

## Summary

- Scope order: additive RLFX vehicle/owner/shared contracts -> ETF-first four-view route and Simple/Power -> Global Rotation equity-only migration -> shared Brief/Journey -> atomic registration/docs/closure.
- Scenario coverage: all 33 business scenarios map one-to-one to `SCN-004-001` through `SCN-004-033`.
- Test handoff: 84 exact Markdown Test Plan rows are mirrored in the active `test-plan.json` inventory; scope counts are 30, 17, 10, 14, and 13. Each row has one row-linked DoD item. Historical checked Scope 1 evidence is preserved, while every reconciled vehicle, owner, Brief, Journey, registration, and closure requirement remains unchecked.
- Planning repair: `CMD-BROWSER-FUNCTIONAL` now uses the executable unanchored literal `--grep "Browser functional"` in active Markdown and machine-readable planning. Historical anchored executions below remain verbatim evidence of the former command defect.
- Runtime boundary: controlled same-origin production-module cases are functional tests. E2E uses the real production route and current source posture with no request interception or fixture replacement; unavailable official-dollar/carry/REER/positioning/event states are expected public-v1 behavior.
- Dirty-tree boundary: exact non-secret identities and hunk hashes below protect every already-dirty shared path. `market-brief.config.json` requires a fresh implementation-time checkpoint because reported concurrent mutation makes the planning-time clean observation non-authoritative.

## Completion Statement

Implementation is nonterminal. Scope 1 remains In Progress; Scopes 2-5 remain Not Started. Existing valid implementation/test evidence and checkbox states are preserved. New requirements are unchecked. Scope 1 is not marked Done, and certification remains unchanged.

## Decision Record

- `rlfx.js` plus its additive vehicle, owner-decision, control-binding, Brief-eligibility, Journey-refresh, and source-envelope contracts form the mandatory `foundation:true` capability before every browser/headless overlay.
- Five single-file scopes each own one outcome and execute in a strict DAG. Shared Brief/Journey readiness is separated from public registration. Scope 5 is the only atomic registry, notes, owner-coverage, and exclusion cutover.
- The FX page is a separate owner; Global Rotation consumes decomposition only and Market Brief consumes owner reads only.
- Cross-owner Agreement/Divergence belongs to `RLBRIEF`, not RLFX; it compares independent leader-currency strength with Global approximate local-relative return.
- The visible title is **FX Regime & Currency Vehicle Lab** while stable route, registry, owner-read, and Journey identity remains `fx-regime-relative-value-lab`.
- Vehicle direction, basket, exact tracking residual, No Eligible Vehicle, and YCS reset/horizon boundaries are explicit owner behavior. A listed wrapper is never relabeled as spot.
- Optional evidence unavailable under its source contract is complete runtime behavior and is rendered as an exact unavailable state.
- Project config has no `testImpact` or `traceContracts`, so no inferred G079/G080 workflow is added.

## Planning Reconciliation - 2026-08-03T14:26:25Z

**Claim Source:** not-run

This section creates evidence destinations only. No scenario below has execution evidence from this planning reconciliation, and no new DoD item is checked.

### Scenario SCN-004-027

Planned persistent regression: `Regression SCN-004-027: JPY strength rejects every direction-mismatched vehicle before selecting FXY` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must prove the real same-origin route rejects an opposite-direction vehicle before accepting an oriented unlevered result.

### Scenario SCN-004-028

Planned persistent regression: `Regression SCN-004-028: tracking preserves an unexplained residual when no sourced contribution closes it` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must prove market, NAV, underlying, and residual remain distinct.

### Scenario SCN-004-029

Planned persistent regression: `Regression SCN-004-029: a long-dollar direction cannot erase the UUP and USDU basket mismatch` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must include both direction-matched but structurally different baskets.

### Scenario SCN-004-030

Planned persistent regression: `Regression SCN-004-030: YCS resets to Rejected outside Tactical and expires at the source session boundary` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must exercise Swing, reset exclusion, direction mismatch, Tactical permission, and reset expiry.

### Scenario SCN-004-031

Planned persistent regression: `Regression SCN-004-031: no eligible result preserves every rejection and selects no substitute` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must prove null selection and one settled disposition per registry vehicle without loosening constraints.

### Scenario SCN-004-032

Planned persistent regression: `Regression SCN-004-032: stale vehicle facts refuse the current Brief while prior evidence stays visibly non-current` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must prove current refusal, exact blocking clocks, and the prior-evidence label.

### Scenario SCN-004-033

Planned persistent regression: `Regression SCN-004-033: Journey evidence refresh reopens transitive dependents and every completion packet remains non-executable` in `tests/fx-regime-relative-value-lab.spec.mjs`. Required evidence must prove semantic refresh, transitive reopening, preserved audit history, current-step gating, human signoff, and no execution.

### Scope 1 Provider Canary Disposition

`TR-F004-SCOPE01-PROVIDER-STRESS-CANARY-001` remains open and test-owned. Remaining bounded Scope 1 implementation may proceed. Scope 1 completion and Scope 2 pickup remain blocked until `bubbles.test` reconciles only the BUG-001-owned provider stress/load tests and replays the focused Scope 1 matrix. This planning reconciliation does not edit BUG-001 or claim the canary resolved.

## Dirty-Tree Collision Baseline (GRILL-004-09)

The valid baseline was captured read-only at `2026-07-14T16:43:33Z`. Two earlier terminal attempts are invalid and intentionally excluded: a zsh loop shadowed the special `path` variable and then inherited a broken `PATH`, so neither attempt produced usable hashes. The baseline below came from the successful absolute-command run. It contains no file contents or secrets.

### Preservation Contract

1. Before the first Feature 004 edit to a listed tracked path, its worktree SHA-256, Git blob identity, index entry, status, and complete pre-existing hunk-hash multiset must equal this record. A mismatch is a concurrent collision and blocks that edit until a fresh reviewed checkpoint is appended.
2. After Feature 004 changes, the index entry must still equal this record and every pre-existing hunk-body SHA-256 must remain present as a byte-identical distinct diff hunk. Feature hunks may be additive but cannot absorb, rewrite, reorder, or delete baseline hunks.
3. `scripts/validate-brief-payload.mjs` was untracked. Before editing, its full SHA-256 and first-137-line ordered-line digest must match. Feature changes are append-only: the first 137 line chunks must retain the recorded digest, and the file must remain unstaged.
4. `market-brief.config.json` was clean at the observation below, but a concurrent mutation was reported outside this capture. This clean hash is informational only, not an implementation baseline. Immediately before editing, Scope 4 must append a `feature004-jit-config-baseline/v1` evidence record containing current status, worktree SHA-256, index entry, and any hunk-body hashes. Final collision validation uses that newer record.
5. No baseline or verification step may stage, commit, stash, reset, checkout, clean, or write a repository file from the shell. Planning records live in this IDE-authored report; implementation evidence is appended here by the executing owner.

<!-- feature004-dirty-baseline-v1:start -->
```json
{
 "contractVersion": "feature004-dirty-baseline/v1",
 "capturedAt": "2026-07-14T16:43:33Z",
 "tracked": [
  {"path":"rldata.js","status":" M","worktreeGitOid":"14c08a2f9037bd2ef083dc499a79176e83f2a434","worktreeSha256":"f2cedb9eb3199699a41fb9774c58ac04c6bcb2a59a53ef934cd78c1ea58845d5","indexOid":"0af20c4f4b701c235beaad1025512ec7e4270d9b","hunkBodySha256":["e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6","685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c","15d8d8768a725d1b58e3c71533463190b8820d742f189b158d93eeca4c66993c","11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908","d6acad21e88d5705127b75f141b6728ef6d640804a265c5c84231208403c7cef","9a001bdbbfbdc6874ad4bc6c5a54d53342bffb97988d89587fd378dcad8f1161","2a259038eef66b416fdcf0e0af3d06b3088d33bb5e3df10906911412b0c612a6","88eaa6da8c6a1bbf40619885d35d76da6a809640b5e1963bb01cbba9d79ef2ef","a5e5f2ca04d7100f45fd769c5a4d646cde38a5c25bdbb8c2b347a7ef25697dfa","b24da9912801f624be02fbb0d8f068b7289f89219e4e6690fe897740c516c968","a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43"]},
  {"path":"scripts/selftest.mjs","status":" M","worktreeGitOid":"7538733bab76e5cd8968057e8435f2dd7a0af229","worktreeSha256":"edbd9cf5ff9679206bf8f950e816987fbfe399d9bd959f87a39fd0b3a7ea4bff","indexOid":"03a285cfa21b2f2e1b22b539ac0452094029c110","hunkBodySha256":["83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc","bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd","2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227","71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb","c412a7268a4ed3b6e9fe8aea49fd954e45ad2240d2c033daee9c2a0cc94961eb","ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc"]},
  {"path":"scripts/fetch-bars.mjs","status":" M","worktreeGitOid":"f3824908c7396de4a611ca62722f91326cc095af","worktreeSha256":"f01b86dfd06a185193a10327ad3885bea4d044bd7f4f91e569a368cfd4f5196f","indexOid":"883e010dfcaad0910b052512d565b59f403edbc7","hunkBodySha256":["4b1d75d0e036317e895be3505cc8ddc56bdc3146bc24315d5f896c634241d634","92ae18897fa47c8601c260d851a5d31046271f14c1acaf2094813ed65442257d","27bc6ca9be9659717f1a995d915f07d72aeacd6c29daffad165078dabff8e61f","d23b7397fb464e5d8b2ead43c600a973e91833cb87da823649b1d704dc48ec52","201d444e2c5b9a79160947f3bf72aed0fbe25a4dee688fc12b5fbe86ceedb57d"]},
  {"path":"global-rotation-lab.html","status":" M","worktreeGitOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeSha256":"cdd92f8d4f8ce5804b96fab284bad4248f361b7639ba48dd6acf8f12be903f9d","indexOid":"87ea5dfe151ddcbf3056f8be0b7da876878fbac2","hunkBodySha256":["db252c047cc9abf42c5e1ba26b58be9a56f1c7c930bb44a4ef6fb99756835c91","0d503bb9bfbdf51fa10afe3956199bd1e06a9c78067a74f423fa5a68da169f12"]},
  {"path":"index.html","status":" M","worktreeGitOid":"32bbe36d6500fb402231c1db1bc2cbc45beb08d6","worktreeSha256":"0b54f99e66d010c038c408cdfd4e28538d2b9c164ddf7a0dd79e32520753b436","indexOid":"72ee07530fa313393d40515697b8ceae634f1e9f","hunkBodySha256":["6714e0d22b903826ff40fed63fbe12332713b1a85a016622adaee7d241bf4376","631ba96d2e0e396b1e49cd7a9b288b6ada1464d889c9ff7fd62a38fda75fcbd0","f6f198787fa6fb6b7ddf74c14df9866df3c70dfdb4b71c1bf8a7dcae2513f8d1","784e0fa7488dfea165fc6e4280cc93c2d1b4092582a8fbdf558d45a6712ee86b","35b674e7d4243d3a9f0369365ee559a32bc0cd15b3ffb368ce4a85e05c66fbde","5e7199274d025114bfb9a1b9ae1d63fae602e3381506341c63ca8e89a5c003c1","6b668d7294045854e2bf16ce97293467fe9061a263860e47ef787fe00111ff1c","34c76e798ba0d04e202444705f55e23f4df41e1020c269ba5bdfd7512ec60707","26045bed9279e4d59a1891b8efecc2a0bc4d8c510cc38fbbcc57f107857d8945"]},
  {"path":"rlnav.js","status":" M","worktreeGitOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","worktreeSha256":"dc7cb211eacd14490af3074eba6363f2b302fa41dc23a4a1af864f90d188667a","indexOid":"df89becde170e5ca8265ac1bb4ff2d5abc201561","hunkBodySha256":["9612c297e09b2c8f33c4cc21cde564f28ef977289c9dc4653258b1741c72d0eb","18e2515bcfbd0d80339391a710e194202051c7970ec2092b3e04d2183bf12f9a","e969657414524f480b7a1fad2aced832a2eac28744cbde750085f523f6daf535"]},
  {"path":"tools.json","status":" M","worktreeGitOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","worktreeSha256":"698bf7505add311bb0f9d6cc983eb25aab0d85921f5283b8025f6e1ecdaa776e","indexOid":"f218cdd776c03eb4b90e03b2c88138c6c4d890b9","hunkBodySha256":["05de8c3b05411f1f37dca4fa7576cbc699410757447bd827013c17ad3cad3eca"]},
  {"path":"market-brief.html","status":" M","worktreeGitOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeSha256":"e0e17492704921937706682b6de8c0efa998890e22a1abaaa36c6688fc5c2b0b","indexOid":"5a17faccd23308e502bf899d52761f5a6838f856","hunkBodySha256":["8212c3f22f8e51328198735dc8320654b99142bf15e8c5ebe9a60daa05e5f208","f36be6c93013b09a2747c8e0f224ba63331cdcf19a72b109d0700e6dbd895b72","148e60d4cf16f44f642faf80b11298122024cda65cb89446621a11cd091bda0c","637874e494fa55e0fafb0b28a4733d43c1d4840892395b5e17f9c16c13dcb00d","8a10c0f9949b20e99adaa9db05ef336d8ceb8864d75678a0e69086ef2d12a338","a67c44e16a8ef470c1cea4c527dfd517a55bbef1625a228f04038e7c4ba776a3","db252c047cc9abf42c5e1ba26b58be9a56f1c7c930bb44a4ef6fb99756835c91","0d503bb9bfbdf51fa10afe3956199bd1e06a9c78067a74f423fa5a68da169f12"]},
  {"path":"notes/market-brief.md","status":" M","worktreeGitOid":"670c0acbfee59e43df69773d63cb6f8bac0a8818","worktreeSha256":"5f79826698bfc97010fb63a3d349e38d6affe9c4c42eac80d4073dc182957836","indexOid":"f6b06647c4650978120aabc7192933d917e2edfa","hunkBodySha256":["6d6d3c2fe78883aaf4942f552121d09bb1c4fe655fc7f8ee9a71542daec036b6","18cad22107d973059d7dea69f2590f0a4c4ebb5d48eb96cd46fa36a72fd6a5a2","ce4e03af4d678b4483e98bf67f92adfdb5b5a13f6ab628d568d74e90173222d1","29aae8a2be68c96ce821b7b4fe8ec0332fd295e3db29e5be83a0381b694dd9d2","3fc98715fa76a64db6f4e86dac0c0f0641825fac6b250d9be0b429371d697ed4","b740e1c6efd00b8a4b7d33a51d16dc3f752caa2cb7ca24bf19d4794b76b3831b","757514ec19a12f194c6766108300f66bc41b70d2e6cd309a918187e6fb187054","d598665de4d9d5969cc8f78a86ba97c7f2a94a8794d25f90876a7469689181a7"]},
  {"path":"README.md","status":" M","worktreeGitOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","worktreeSha256":"10f61b75d7b9b9121e491cf7585b6f796770c691118dc81e92aca0a084a607d8","indexOid":"843a211803eb821bf9ced788fa47980b6475d1bd","hunkBodySha256":["d01b55b578932114976316b6ca0dbe06455999054cda9e7b6d7318f0feb8269a","9826d5ac122fba542997905d273e7977f1928297bd97d8349aebc254b466935b","a7f9100a52126e218e1c0f645f14679bf5134ed26a04cca2ce8a728b5fb23415","101f30f3d027ccc14fff2df84abe05d184864564f7d43dbf2b68f0dca6071c08","972e88d8112a44c0c0af772832442a3f46aeb9c58c586f658cc8ccfd39eab1c8","75aef919dace703dc2d500a043b77bff828f519512927e7476bda87273e79159","2c2cf7730b689e6a3ddb0cc0ec6773b3e09d0bacec47b6be9a36a193caa69662","a7f9100a52126e218e1c0f645f14679bf5134ed26a04cca2ce8a728b5fb23415","8c5af06def1cb0c5247d3e86a45b212ed44c98300a5bea27106352860c081487"]},
  {"path":"notes/README.md","status":" M","worktreeGitOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","worktreeSha256":"715c27366f612d1a6760e7e3cf1e6f603689564a572edf058ba0b37c3ff163dc","indexOid":"8b093e81913a52729bcc21808728e59253409ae4","hunkBodySha256":["a7f9100a52126e218e1c0f645f14679bf5134ed26a04cca2ce8a728b5fb23415","101f30f3d027ccc14fff2df84abe05d184864564f7d43dbf2b68f0dca6071c08","4deb42abc2a7816fd753aec91daebc35589a45e6bf8766ff26661a4d9d0d27de"]}
 ],
 "untracked": {"path":"scripts/validate-brief-payload.mjs","status":"??","worktreeGitOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeSha256":"78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f","lineChunkCount":137,"orderedLineHashSha256":"63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e","requiredMutation":"append-only"},
 "volatile": {"path":"market-brief.config.json","observedStatus":"clean","observedWorktreeSha256":"895753e48f431b16372774811d495a3e7ae64f622de9fe43e0bd417b2402cc15","observedIndexOid":"463ab78ba0c6ab22fb52dbaade6134ef0ff6b21f","reportedConcurrentMutation":true,"authoritativeForImplementation":false,"requiredCheckpoint":"feature004-jit-config-baseline/v1 immediately before edit"}
}
```
<!-- feature004-dirty-baseline-v1:end -->

## Reviewed `rldata.js` Supersession Checkpoint (F004-COLLISION-001)

This checkpoint is additive. The `feature004-dirty-baseline-v1` block above remains the immutable record of the original Feature 004 worktree. BUG-001 intentionally replaced four credential-owned `rldata.js` hunks while removing serialized client credentials, raw legacy-value activation, and cross-document credential continuity. The active security rationale and behavior evidence are recorded in [BUG-001 spec](../_bugs/BUG-001-central-provider-credential-security/spec.md#current-document-lifetime), [design](../_bugs/BUG-001-central-provider-credential-security/design.md#non-secret-rldata-and-feature-004), [Scope 1 plan](../_bugs/BUG-001-central-provider-credential-security/scopes.md#scope-1-scope-01-current-document-runtime-foundation), [final green replay](../_bugs/BUG-001-central-provider-credential-security/report.md#final-green-replay), and [Feature 004 collision evidence](../_bugs/BUG-001-central-provider-credential-security/report.md#feature-004-collision-evidence).

The read-only capture at `2026-07-15T19:39:12.612Z` used the collision test's exact zero-context hunk-body hashing algorithm. It proved that `rldata.js` has the original index OID, is unstaged, and is missing exactly the four reviewed hashes. It also found unreviewed original-hash losses in `scripts/selftest.mjs` and `index.html`. Those five unrelated losses are not accepted by this checkpoint, so the current aggregate collision verdict remains blocked and fail-closed.

<!-- feature004-dirty-supersession-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-supersession/v1",
    "capturedAt": "2026-07-15T19:39:12.612Z",
    "supersedesContractVersion": "feature004-dirty-baseline/v1",
    "scopePath": "rldata.js",
    "supersededHunkBodySha256": [
        "e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6",
        "685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c",
        "11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908",
        "a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43"
    ],
    "securityRationale": {
        "owner": "specs/_bugs/BUG-001-central-provider-credential-security",
        "summary": "BUG-001 replaced credential-owned hunks to enforce current-document-only credential memory, erase-only legacy cleanup, disabled unapproved providers, and no serialized or cross-document credential path while preserving non-secret rlData behavior.",
        "evidenceRefs": [
            "../_bugs/BUG-001-central-provider-credential-security/spec.md#current-document-lifetime",
            "../_bugs/BUG-001-central-provider-credential-security/design.md#non-secret-rldata-and-feature-004",
            "../_bugs/BUG-001-central-provider-credential-security/scopes.md#scope-1-scope-01-current-document-runtime-foundation",
            "../_bugs/BUG-001-central-provider-credential-security/report.md#final-green-replay",
            "../_bugs/BUG-001-central-provider-credential-security/report.md#feature-004-collision-evidence"
        ]
    },
    "currentRldata": {
        "status": " M",
        "staged": false,
        "unstaged": true,
        "indexOid": "0af20c4f4b701c235beaad1025512ec7e4270d9b",
        "worktreeGitOid": "212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b",
        "worktreeSha256": "d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91",
        "hunkCount": 15,
        "hunkBodySha256": [
            "024cf1481f96402587eb06fdca57d97cc54750c6d6697ea5f1918c645fb556c3",
            "5421cf7eee3a865b8baea38971463f0f8df799b43c3c2c2d58c7b1994b5dc202",
            "15d8d8768a725d1b58e3c71533463190b8820d742f189b158d93eeca4c66993c",
            "cf2cd5517dd8495b12dca4f869f15e939ee460f565de250707ad0707a8966cb1",
            "6f5a76ed482eaffabbd9f0aaf67d932034db27562ee79cdba0333fba3c9e6275",
            "2ef92c60515bef103942fe916f2c2a64321fb22c5f1ab8355dccd78d5eaf7ab2",
            "d6acad21e88d5705127b75f141b6728ef6d640804a265c5c84231208403c7cef",
            "9a001bdbbfbdc6874ad4bc6c5a54d53342bffb97988d89587fd378dcad8f1161",
            "2a259038eef66b416fdcf0e0af3d06b3088d33bb5e3df10906911412b0c612a6",
            "88eaa6da8c6a1bbf40619885d35d76da6a809640b5e1963bb01cbba9d79ef2ef",
            "a5e5f2ca04d7100f45fd769c5a4d646cde38a5c25bdbb8c2b347a7ef25697dfa",
            "b24da9912801f624be02fbb0d8f068b7289f89219e4e6690fe897740c516c968",
            "7fab600224de4be614829fa67d0b2b064ab493c7dd88a79403169b05eb35ed31",
            "d167e49edbef714a5409ccbfb408187d903c5c839804fa5bce5c7c33f6ce33a8",
            "72c41740270b93a9a0c996e0938687ea36c1022454e5db1b2fd248903aca2d42"
        ]
    },
    "preservationContract": {
        "originalBaselineBlockBytePreserved": true,
        "reviewedPathSet": ["rldata.js"],
        "allOtherOriginalTrackedContractsMustRemainUnchanged": true,
        "originalUntrackedContractMustRemainUnchanged": true,
        "originalVolatileContractMustRemainUnchanged": true,
        "futureUnreviewedLossFailsClosed": true,
        "currentVerification": {
            "verdict": "BLOCKED_UNREVIEWED_BASELINE_LOSS",
            "unexpectedMissingBaselineHunks": [
                {"path":"scripts/selftest.mjs","hash":"c412a7268a4ed3b6e9fe8aea49fd954e45ad2240d2c033daee9c2a0cc94961eb"},
                {"path":"scripts/selftest.mjs","hash":"ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc"},
                {"path":"index.html","hash":"631ba96d2e0e396b1e49cd7a9b288b6ada1464d889c9ff7fd62a38fda75fcbd0"},
                {"path":"index.html","hash":"784e0fa7488dfea165fc6e4280cc93c2d1b4092582a8fbdf558d45a6712ee86b"},
                {"path":"index.html","hash":"5e7199274d025114bfb9a1b9ae1d63fae602e3381506341c63ca8e89a5c003c1"}
            ]
        }
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "requirements": [
            "Require the original feature004-dirty-baseline-v1 block unchanged.",
            "Parse exactly one feature004-dirty-supersession-v1 block for rldata.js.",
            "Permit only the four listed original hashes to be absent and only when the current index OID, unstaged status, worktree SHA-256, and complete ordered hunk-hash multiset equal this checkpoint.",
            "Require every other original tracked and untracked contract and the volatile checkpoint rule unchanged.",
            "Reject duplicate, unknown, path-mismatched, incomplete, or identity-mismatched supersession records and any unreviewed missing or extra hunk."
        ]
    }
}
```
<!-- feature004-dirty-supersession-v1:end -->

## Reviewed Shared-Path Collision Disposition Checkpoint (F004-COLLISION-001)

This planning-owned checkpoint is additive. The original `feature004-dirty-baseline-v1` block and the existing `feature004-dirty-supersession-v1` block remain byte-identical, with raw block SHA-256 values `3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad` and `251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d` respectively.

The immutable `scripts/selftest.mjs` bytes were recovered from VS Code local-history entry `mijZ.mjs`; its SHA-256 and Git blob identity exactly equal the original report record. The immutable `index.html` worktree blob remains readable from Git object `32bbe36d6500fb402231c1db1bc2cbc45beb08d6`. Native zero-context diffs prove the original hunk bodies rather than inferring them from packet prose.

Exactly five original hashes are accepted below. The three `index.html` records are BUG-001's removal of credential-editor inputs/copy in favor of status-only current-document controls. The first `scripts/selftest.mjs` record is BUG-001's surgical replacement of migration/session-storage assertions. The second selftest record is the original shared-shell/Brief/Causal hunk after one BUG-001 assertion replacement and additive, marker-bounded Feature 005, Feature 006, Feature 007, and Feature 009 test blocks. Feature 008 owns no current byte in either path. Feature 006 Scope 3 and Feature 009 Scope 1 evidence is RED and proves intentional owner execution only; this checkpoint does not claim either feature, TP-01-22, or the collision guard is green.

<!-- feature004-dirty-collision-disposition-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-disposition/v1",
    "capturedAt": "2026-07-15T22:27:43.258Z",
    "extendsContracts": [
        {
            "marker": "feature004-dirty-baseline-v1",
            "rawBlockSha256": "3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad"
        },
        {
            "marker": "feature004-dirty-supersession-v1",
            "rawBlockSha256": "251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d"
        }
    ],
    "baselineByteSources": [
        {
            "path": "scripts/selftest.mjs",
            "sourceKind": "vscode-local-history",
            "sourceRef": "User/History/-77703807/mijZ.mjs",
            "sourceObservedAt": "2026-07-14T13:44:23.109Z",
            "indexOid": "03a285cfa21b2f2e1b22b539ac0452094029c110",
            "worktreeGitOid": "7538733bab76e5cd8968057e8435f2dd7a0af229",
            "worktreeSha256": "edbd9cf5ff9679206bf8f950e816987fbfe399d9bd959f87a39fd0b3a7ea4bff"
        },
        {
            "path": "index.html",
            "sourceKind": "git-object",
            "sourceRef": "32bbe36d6500fb402231c1db1bc2cbc45beb08d6",
            "sourceObservedAt": "2026-07-14T16:43:33.000Z",
            "indexOid": "72ee07530fa313393d40515697b8ceae634f1e9f",
            "worktreeGitOid": "32bbe36d6500fb402231c1db1bc2cbc45beb08d6",
            "worktreeSha256": "0b54f99e66d010c038c408cdfd4e28538d2b9c164ddf7a0dd79e32520753b436"
        }
    ],
    "acceptedOriginalHunks": [
        {
            "path": "scripts/selftest.mjs",
            "originalHunkBodySha256": "c412a7268a4ed3b6e9fe8aea49fd954e45ad2240d2c033daee9c2a0cc94961eb",
            "baselineHunkIndex": 5,
            "baselineHunkHeader": "@@ -674,0 +836,31 @@ try {",
            "currentHunkIndex": 6,
            "currentHunkBodySha256": "b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794",
            "disposition": "intentional-supersession",
            "owners": [
                {
                    "owner": "bubbles.test",
                    "packet": "specs/_bugs/BUG-001-central-provider-credential-security",
                    "evidenceRefs": [
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#broad-selftest-reconciliation",
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#feature-004-collision-evidence"
                    ]
                }
            ]
        },
        {
            "path": "scripts/selftest.mjs",
            "originalHunkBodySha256": "ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc",
            "baselineHunkIndex": 6,
            "baselineHunkHeader": "@@ -689,0 +882,143 @@ try {",
            "currentHunkIndex": 7,
            "currentHunkBodySha256": "0f9739b064bc90a02c3baf5a1014442b8f566ad9f88dd3528c1103a462c55e1b",
            "disposition": "intentional-supersession",
            "owners": [
                {
                    "owner": "bubbles.test",
                    "packet": "specs/_bugs/BUG-001-central-provider-credential-security",
                    "evidenceRefs": [
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#broad-selftest-reconciliation",
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#exact-live-browser-evidence"
                    ]
                },
                {
                    "owner": "bubbles.test",
                    "packet": "specs/005-palm-springs-rental-market-lab",
                    "evidenceRefs": [
                        "../005-palm-springs-rental-market-lab/report.md#repository-selftest-and-shared-runtime"
                    ]
                },
                {
                    "owner": "bubbles.implement",
                    "packet": "specs/006-trend-dynamics-cycle-lab",
                    "evidenceRefs": [
                        "../006-trend-dynamics-cycle-lab/report.md#scope-1-owner-attributed-containment-evidence",
                        "../006-trend-dynamics-cycle-lab/report.md#scope-1-recovery-final-green-and-gate-evidence",
                        "../../.specify/runtime/tool-calls.jsonl::sessionId=feature006-scope3-implement-current;line=591;exitCode=1"
                    ]
                },
                {
                    "owner": "bubbles.implement",
                    "packet": "specs/007-technical-analysis-decision-lab",
                    "evidenceRefs": [
                        "../007-technical-analysis-decision-lab/scopes/01-capability-foundation/report.md#code-diff-evidence",
                        "../007-technical-analysis-decision-lab/scopes/01-capability-foundation/report.md#tp-01-01"
                    ]
                },
                {
                    "owner": "bubbles.test",
                    "packet": "specs/009-msft-july-market-refresh",
                    "evidenceRefs": [
                        "../009-msft-july-market-refresh/report.md#tp-009-s1-01"
                    ]
                }
            ]
        },
        {
            "path": "index.html",
            "originalHunkBodySha256": "631ba96d2e0e396b1e49cd7a9b288b6ada1464d889c9ff7fd62a38fda75fcbd0",
            "baselineHunkIndex": 2,
            "baselineHunkHeader": "@@ -107,0 +109,121 @@",
            "currentHunkIndex": 2,
            "currentHunkBodySha256": "4a16da9963c053126d42e4c9dd906ae9b6334700dc6e8b2e77c6041c6cc4f634",
            "disposition": "intentional-supersession",
            "owners": [
                {
                    "owner": "bubbles.implement",
                    "packet": "specs/_bugs/BUG-001-central-provider-credential-security",
                    "evidenceRefs": [
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#scope-01-current-document-runtime-foundation---2026-07-15",
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#exact-live-browser-evidence"
                    ]
                }
            ]
        },
        {
            "path": "index.html",
            "originalHunkBodySha256": "784e0fa7488dfea165fc6e4280cc93c2d1b4092582a8fbdf558d45a6712ee86b",
            "baselineHunkIndex": 4,
            "baselineHunkHeader": "@@ -273,2 +410,2 @@",
            "currentHunkIndex": 4,
            "currentHunkBodySha256": "81b692552dff1467ced513d166eff6b709e9ce3ba9d034d18afe30793959c0ec",
            "disposition": "intentional-supersession",
            "owners": [
                {
                    "owner": "bubbles.implement",
                    "packet": "specs/_bugs/BUG-001-central-provider-credential-security",
                    "evidenceRefs": [
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#scope-01-current-document-runtime-foundation---2026-07-15",
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#exact-live-browser-evidence"
                    ]
                }
            ]
        },
        {
            "path": "index.html",
            "originalHunkBodySha256": "5e7199274d025114bfb9a1b9ae1d63fae602e3381506341c63ca8e89a5c003c1",
            "baselineHunkIndex": 6,
            "baselineHunkHeader": "@@ -283,0 +421,2 @@",
            "currentHunkIndex": 6,
            "currentHunkBodySha256": "5bd7a10ad9f02cbf8dc0f19b51c733e259b20b16e87969723b4422e1899478c7",
            "disposition": "intentional-supersession",
            "owners": [
                {
                    "owner": "bubbles.implement",
                    "packet": "specs/_bugs/BUG-001-central-provider-credential-security",
                    "evidenceRefs": [
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#scope-01-current-document-runtime-foundation---2026-07-15",
                        "../_bugs/BUG-001-central-provider-credential-security/report.md#exact-live-browser-evidence"
                    ]
                }
            ]
        }
    ],
    "currentPaths": [
        {
            "path": "scripts/selftest.mjs",
            "status": " M",
            "staged": false,
            "unstaged": true,
            "indexOid": "03a285cfa21b2f2e1b22b539ac0452094029c110",
            "worktreeGitOid": "ae885666d954386ba0aea1434e6f78fa9fcefe6f",
            "worktreeSha256": "6ff184b884ca4b1a03e61b965b8bff3b8b2bf5e21acc6cc40f4722c1b84f9b06",
            "hunkCount": 7,
            "hunkBodySha256": [
                "83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc",
                "71752c795e40ccb663ceb0aa005516f9205fcd3a2fb118d0a2a725f8137e918c",
                "bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd",
                "2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227",
                "71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb",
                "b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794",
                "0f9739b064bc90a02c3baf5a1014442b8f566ad9f88dd3528c1103a462c55e1b"
            ]
        },
        {
            "path": "index.html",
            "status": " M",
            "staged": false,
            "unstaged": true,
            "indexOid": "72ee07530fa313393d40515697b8ceae634f1e9f",
            "worktreeGitOid": "f8172ce807a43ffa1c43952893bdba280c07cdaf",
            "worktreeSha256": "457ade7f8938c65763ed1086116e15c695b3548a79ded8e38b1eb794ea823f82",
            "hunkCount": 9,
            "hunkBodySha256": [
                "6714e0d22b903826ff40fed63fbe12332713b1a85a016622adaee7d241bf4376",
                "4a16da9963c053126d42e4c9dd906ae9b6334700dc6e8b2e77c6041c6cc4f634",
                "f6f198787fa6fb6b7ddf74c14df9866df3c70dfdb4b71c1bf8a7dcae2513f8d1",
                "81b692552dff1467ced513d166eff6b709e9ce3ba9d034d18afe30793959c0ec",
                "35b674e7d4243d3a9f0369365ee559a32bc0cd15b3ffb368ce4a85e05c66fbde",
                "5bd7a10ad9f02cbf8dc0f19b51c733e259b20b16e87969723b4422e1899478c7",
                "6b668d7294045854e2bf16ce97293467fe9061a263860e47ef787fe00111ff1c",
                "34c76e798ba0d04e202444705f55e23f4df41e1020c269ba5bdfd7512ec60707",
                "26045bed9279e4d59a1891b8efecc2a0bc4d8c510cc38fbbcc57f107857d8945"
            ]
        }
    ],
    "preservationContract": {
        "acceptedOriginalHashCount": 5,
        "acceptedPathSet": [
            "scripts/selftest.mjs",
            "index.html"
        ],
        "rldataSupersessionRemainsIndependent": true,
        "allOtherOriginalBaselineHashesRemainRequired": true,
        "allUnlistedPathsAndHashesFailClosed": true,
        "currentIdentityMismatchFailsClosed": true,
        "duplicateUnknownOrReorderedRecordFailsClosed": true,
        "subsequentHunkAdditionRemovalOrReorderFailsClosed": true
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "requirements": [
            "Keep the raw feature004-dirty-baseline-v1 and feature004-dirty-supersession-v1 block hashes unchanged.",
            "Parse exactly one feature004-dirty-collision-disposition-v1 block and reject any unknown or missing top-level, baseline-source, accepted-hunk, owner, current-path, preservation, or handoff key.",
            "Require exactly five unique accepted original records in the listed order and prove each hash belongs to the named original baseline path before removing it from that path's required multiset.",
            "Validate the existing four-hash rldata.js checkpoint independently; this checkpoint cannot widen or replace its path or hash set.",
            "Recompute status, staged and unstaged state, index OID, worktree SHA-256, Git worktree OID, hunk count, and complete ordered hunk hashes for both current paths and require exact equality.",
            "Require every original hash outside the existing rldata.js four-hash set and this five-hash set, plus every untracked and volatile contract, exactly as before.",
            "Reject duplicate, unknown, path-mismatched, ownerless, evidence-less, incomplete, identity-mismatched, added, removed, or reordered records and hunks.",
            "Do not add a skip, fallback, broad path exemption, subset comparison, or success-on-unknown branch."
        ]
    }
}
```
<!-- feature004-dirty-collision-disposition-v1:end -->

## Additive Shared-Path Identity Delta Checkpoint (F004-IDENTITY-DRIFT-001)

Exact owner attribution is proven for one post-checkpoint transition. The strict collision parser and complete zero-context diff retain the prior status, staging flags, index OID, hunk count, and ordered hunk hashes 1 through 6; only `scripts/selftest.mjs` hunk 7 and the worktree identities derived from it changed. Feature 006 Scope 3 owns the added M13-M18 consumers inside its unique marker bounds. The current repository selftest remains failed solely on the unrelated Market Brief `nextSession.sessionDate` contract, so this checkpoint makes no Feature 006 success, Feature 004 completion, or collision-green claim.

<!-- feature004-dirty-collision-delta-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-delta/v1",
    "findingId": "F004-IDENTITY-DRIFT-001",
    "capturedAt": "2026-07-15T22:53:31Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-disposition-v1",
        "rawBlockSha256": "5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e"
    },
    "hunkTransition": {
        "path": "scripts/selftest.mjs",
        "hunkIndex": 7,
        "previousHunkBodySha256": "0f9739b064bc90a02c3baf5a1014442b8f566ad9f88dd3528c1103a462c55e1b",
        "currentHunkBodySha256": "ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80",
        "disposition": "owner-attributed-additive-delta"
    },
    "ownerAttribution": {
        "owner": "bubbles.implement",
        "packet": "specs/006-trend-dynamics-cycle-lab",
        "scope": "Scope 3",
        "phase": "implement",
        "observedState": {
            "activeAgent": "bubbles.implement",
            "currentScope": "Scope 3",
            "currentPhase": "implement",
            "scopeStatus": "In Progress"
        },
        "markerBounds": {
            "startInclusive": "/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */",
            "endExclusive": "/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */",
            "startByte": 117316,
            "endByte": 159382,
            "currentSliceSha256": "2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef"
        },
        "ownedSymbols": [
            "tdcHarmonicDecomposition",
            "tdcWelchSpectrum",
            "tdcGeneralizedLombScargle",
            "tdcRollingSpectrum",
            "tdcLeadLag",
            "tdcEventStudy",
            "tdcEvaluateCycle",
            "tdcRunScope3Engine"
        ],
        "artifactRefs": [
            "../006-trend-dynamics-cycle-lab/scopes.md#scope-3-season-cycle-context-and-association-engine",
            "../006-trend-dynamics-cycle-lab/report.md#scope-3-season-cycle-context-and-association-engine",
            "../006-trend-dynamics-cycle-lab/state.json::execution.activeAgent=bubbles.implement;execution.currentPhase=implement;execution.currentScope=Scope 3"
        ],
        "toolLogRefs": [
            "../../.specify/runtime/tool-calls.jsonl::line=652;sessionId=feature006-scope3-implement-current;agent=bubbles.implement;spec=006-trend-dynamics-cycle-lab;scope=Scope-3;exitCode=0;stdoutHash=546f242bf30e36ce4c15284992e6722238aa8b1b92238c6c3e93ac89038afa02;tags=consumer-sweep,stale-reference,containment,quality,rerun",
            "../../.specify/runtime/tool-calls.jsonl::line=730;sessionId=feature006-scope3-implement-current;agent=bubbles.implement;spec=006-trend-dynamics-cycle-lab;scope=Scope-3;command=node scripts/selftest.mjs;exitCode=1;stdoutHash=18aa519ae24fe1db442c97a5adaf4e4acb6a4fc4ac41e19964ede200357fded2;tags=final-determination,TP-03-01,repository-selftest"
        ]
    },
    "currentPathIdentity": {
        "path": "scripts/selftest.mjs",
        "status": " M",
        "staged": false,
        "unstaged": true,
        "indexOid": "03a285cfa21b2f2e1b22b539ac0452094029c110",
        "worktreeGitOid": "825ca9387c2557cc17a1590c02d65d61090b6180",
        "worktreeSha256": "4740b0a3f063844cc04dd8793147788106f1af3b10e8e330b386cb7989369f6b",
        "hunkCount": 7,
        "hunkBodySha256": [
            "83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc",
            "71752c795e40ccb663ceb0aa005516f9205fcd3a2fb118d0a2a725f8137e918c",
            "bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd",
            "2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227",
            "71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb",
            "b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794",
            "ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80"
        ]
    },
    "aggregateObservation": {
        "command": "node scripts/selftest.mjs",
        "toolLogRef": "../../.specify/runtime/tool-calls.jsonl::line=703;sessionId=feature004-identity-drift-plan-current;agent=bubbles.plan;spec=004-fx-regime-relative-value-lab;scope=Scope-1;exitCode=1;stdoutHash=5676ab5c7b55b7bdc4bcb0edd9e97b7d90fbe8a951ccec030423b7ec79884f94;tags=F004-IDENTITY-DRIFT-001,owner-attribution,aggregate-red,feature006-scope3-current",
        "exitCode": 1,
        "passed": 491,
        "failed": 1,
        "failureOwner": "Market Brief",
        "failure": "nextSession.sessionDate must match snapshot.nextSessionDate",
        "feature006Assertions": "M13-M18 and cycle assertions observed passing inside the failed aggregate",
        "feature006CompletionClaim": false,
        "feature004CompletionClaim": false,
        "collisionPassClaim": false
    },
    "preservationContract": {
        "priorDispositionRemainsByteIdentical": true,
        "priorAcceptedOriginalHunksRemainExact": true,
        "originalBaselineRequirementsRemainExact": true,
        "independentSupersessionRequirementsRemainExact": true,
        "nonTargetCurrentPathsRemainInheritedAndExact": true,
        "onlyNamedPathMayOverlayPriorIdentity": true,
        "onlyNamedHunkMayTransition": true,
        "hunkCountAndOrderRemainExact": true,
        "subsequentIdentityOrHunkDriftFailsClosed": true
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "evidenceRefs": [
            "../../.specify/runtime/tool-calls.jsonl::line=700;sessionId=feature004-identity-drift-plan-current;exitCode=1;stdoutHash=84d784f4f71620777702d8d2347bb7b764772f67a55f31c876eb83be892b1387",
            "../../.specify/runtime/tool-calls.jsonl::line=727;sessionId=feature004-identity-drift-plan-current;exitCode=0;stdoutHash=21afceb4701514668056ffd27dd7c13a90ad15fef5b4997028d3a9b7360736cd"
        ],
        "requirements": [
            "Require the feature004-dirty-baseline-v1 and feature004-dirty-supersession-v1 raw hashes unchanged, then require the feature004-dirty-collision-disposition-v1 raw hash to equal 5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e before applying this delta.",
            "Parse exactly one feature004-dirty-collision-delta-v1 block and reject a duplicate, missing marker, malformed JSON, or any unknown or missing top-level or nested field.",
            "Require contractVersion feature004-dirty-collision-delta/v1, findingId F004-IDENTITY-DRIFT-001, a UTC ISO-8601 capturedAt, and the exact extendsContract marker and raw hash.",
            "Require exactly one hunkTransition object: path scripts/selftest.mjs, hunkIndex 7, the exact previous and current hashes, and disposition owner-attributed-additive-delta.",
            "Validate the prior disposition, its five accepted original hunks, both prior currentPaths, the independent four-hash supersession, every other baseline hash, every untracked contract, and the volatile-path rule before overlaying the delta.",
            "Overlay only scripts/selftest.mjs in the prior currentPaths array; every non-target currentPaths record must still recompute to the inherited identity exactly.",
            "Before accepting the overlay, require path, status, staged, unstaged, indexOid, hunkCount, and ordered hashes 1 through 6 to equal the prior scripts/selftest.mjs record, and require only ordered hunk 7 to make the named old-to-current transition.",
            "Recompute scripts/selftest.mjs status, staged and unstaged state, index OID, Git worktree OID, worktree SHA-256, hunk count, and all seven ordered hunk hashes and require exact equality with currentPathIdentity.",
            "Require the Feature 006 start and Feature 007 end markers exactly once and in order, require the exact marker byte offsets and slice SHA-256, and require all eight ownedSymbols inside the slice and absent outside it.",
            "Require ownerAttribution to name only bubbles.implement, specs/006-trend-dynamics-cycle-lab, Scope 3, and phase implement; require the exact observedState, artifactRefs, and two append-only toolLogRefs with matching line metadata.",
            "Require aggregateObservation to remain exitCode 1 with 491 passed and 1 failed solely on the exact Market Brief nextSession.sessionDate message, and require all three completion/pass claim booleans to remain false.",
            "Reject any duplicate transition, second path, second hunk, path mismatch, owner mismatch, evidence mismatch, marker drift, symbol outside the owner slice, identity mismatch, hunk addition, hunk removal, or hunk reorder.",
            "Do not add a skip, fallback, broad path exemption, subset comparison, mutable owner inference, or success-on-unknown branch."
        ]
    }
}
```
<!-- feature004-dirty-collision-delta-v1:end -->

## Additive Settled-Owner Identity Delta Checkpoint (F004-POSTCHECKPOINT-DRIFT-001)

The earlier delta remains immutable history and is no longer the current identity. Feature 006 Scope 3 owner evidence settles exactly one later `scripts/selftest.mjs` hunk-7 identity while preserving hunks 1-6 and every inherited collision contract. The aggregate repository selftest remains failed solely on the unrelated Market Brief `nextSession.sessionDate` contract, so this checkpoint makes no Feature 006 pass, Feature 004 pass, completion, certification, or collision-green claim.

<!-- feature004-dirty-collision-settled-delta-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-settled-delta/v1",
    "findingId": "F004-POSTCHECKPOINT-DRIFT-001",
    "capturedAt": "2026-07-15T23:17:11Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-delta-v1",
        "rawBlockSha256": "334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b",
        "historyDisposition": "superseded-current-identity-history",
        "priorBlockMustRemainByteIdentical": true
    },
    "hunkTransition": {
        "path": "scripts/selftest.mjs",
        "hunkIndex": 7,
        "previousHunkBodySha256": "ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80",
        "currentHunkBodySha256": "15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943",
        "disposition": "settled-owner-additive-delta"
    },
    "ownerAttribution": {
        "owner": "bubbles.implement",
        "packet": "specs/006-trend-dynamics-cycle-lab",
        "scope": "Scope 3",
        "phase": "implement",
        "scopeStatus": "In Progress",
        "executionHistoryEvidence": {
            "agent": "bubbles.implement",
            "phasesExecuted": [
                "implement"
            ],
            "statusBefore": "not_started",
            "statusAfter": "not_started",
            "startedAt": "2026-07-15T19:42:05Z",
            "finishedAt": "2026-07-15T22:48:39Z",
            "outcome": "route_required",
            "addressedFindings": [
                "F006-S3-M16-WINDOW-ELIGIBILITY-001",
                "F006-S3-ANALYTIC-ACTIVATION-POSTURE-001",
                "F006-S3-HELDOUT-CONFIG-KEY-001",
                "F006-S3-M13-RECONSTRUCTION-KEY-001",
                "F006-S3-CLIMATE-SOURCE-SPELLING-001",
                "F006-S3-CATALOG-REPETITION-OVERRIDE-001",
                "F006-S3-SELFVALIDATION-DATAFLOW-001",
                "F006-S3-CONSUMER-PROPERTY-SCOPE-001",
                "F006-EXT-SELFTEST-F009-001"
            ],
            "unresolvedFindings": [
                "F006-FW-CHECK8-MJS-001",
                "F006-FW-G085-001",
                "F006-EXT-SELFTEST-MARKET-BRIEF-001"
            ],
            "evidenceRef": "report.md#scope-3-season-cycle-context-and-association-engine"
        },
        "markerBounds": {
            "startInclusive": "/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */",
            "endExclusive": "/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */",
            "endBoundary": "exclusive-before-feature-007-start-marker",
            "startByte": 117426,
            "endByteExclusive": 159494,
            "byteLength": 42068,
            "currentSliceSha256": "2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef",
            "symbolInventoryRule": "unique lexicographically sorted matches of /\\btdc[A-Z][A-Za-z0-9_]*/g inside the marker slice",
            "symbolInventory": [
                "tdcAdjustPValues",
                "tdcApplyTransform",
                "tdcAssessDataQuality",
                "tdcAutocorrelation",
                "tdcBocpd",
                "tdcBuildAnalyticSeries",
                "tdcBuildChangeTimeline",
                "tdcBuildConsensus",
                "tdcClassifyDynamics",
                "tdcClassifyTrend",
                "tdcClusterFamilyVotes",
                "tdcConfig",
                "tdcCorrelation",
                "tdcCorrelationShift",
                "tdcCreateWorkPlan",
                "tdcCusum",
                "tdcDeepFreeze",
                "tdcDistributionShift",
                "tdcEndpointLocalQuadratic",
                "tdcError",
                "tdcEvaluateCycle",
                "tdcEventStudy",
                "tdcFiniteNumber",
                "tdcGaussianHmm2",
                "tdcGeneralizedLombScargle",
                "tdcHarmonicDecomposition",
                "tdcHasExactKeys",
                "tdcHouseholderSolve",
                "tdcIndexConfig",
                "tdcInfluenceDiagnostics",
                "tdcIsPlainObject",
                "tdcKahanSum",
                "tdcLeadLag",
                "tdcLinearFit",
                "tdcLjungBox",
                "tdcLocalLinearState",
                "tdcLogGamma",
                "tdcLogSumExp",
                "tdcMad",
                "tdcMeanVariance",
                "tdcMedian",
                "tdcMethodFailure",
                "tdcMethodSuccess",
                "tdcNames",
                "tdcNearbyStability",
                "tdcNormalCdf",
                "tdcPenalizedLinearSegments",
                "tdcProminentExtrema",
                "tdcQuantile",
                "tdcRegularizedBeta",
                "tdcResolveAsOfVintage",
                "tdcRollingOlsHac",
                "tdcRollingSpectrum",
                "tdcRunScope2Engine",
                "tdcRunScope3Engine",
                "tdcScaleShift",
                "tdcSource",
                "tdcStableDigest",
                "tdcStableSerialize",
                "tdcStudentTCdf",
                "tdcTheilSenKendall",
                "tdcValidateConfig",
                "tdcValidateNumericSeries",
                "tdcValidateSeriesEnvelope",
                "tdcWelchSpectrum"
            ]
        },
        "artifactRefs": [
            "../006-trend-dynamics-cycle-lab/state.json::executionHistory[agent=bubbles.implement;finishedAt=2026-07-15T22:48:39Z;outcome=route_required;evidenceRef=report.md#scope-3-season-cycle-context-and-association-engine]",
            "../006-trend-dynamics-cycle-lab/report.md#scope-3-season-cycle-context-and-association-engine"
        ],
        "toolLogEvidence": [
            {
                "line": 672,
                "sessionId": "feature006-scope3-implement-current",
                "agent": "bubbles.implement",
                "spec": "006-trend-dynamics-cycle-lab",
                "scope": "Scope-3",
                "command": "npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list",
                "exitCode": 0,
                "stdoutHash": "5e8ae44377294cf33c6fa8108290c803102ab02a56016ca8bb5b4fca50f291fc",
                "tags": [
                    "green",
                    "TP-03-09",
                    "Scope-1-3",
                    "e2e-ui",
                    "post-catalog-fix"
                ]
            },
            {
                "line": 690,
                "sessionId": "feature006-scope3-implement-current",
                "agent": "bubbles.implement",
                "spec": "006-trend-dynamics-cycle-lab",
                "scope": "Scope-3",
                "command": "node scripts/validate-trend-dynamics-cycle.mjs",
                "exitCode": 0,
                "stdoutHash": "f2583980e8932b94e0a2d03ea75e403e0d30288628bc2f6ce1e89fa2f0546c48",
                "tags": [
                    "green",
                    "TP-03-02",
                    "consumer-sweep",
                    "post-evidence-edit"
                ]
            },
            {
                "line": 730,
                "sessionId": "feature006-scope3-implement-current",
                "agent": "bubbles.implement",
                "spec": "006-trend-dynamics-cycle-lab",
                "scope": "Scope-3",
                "command": "node scripts/selftest.mjs",
                "exitCode": 1,
                "stdoutHash": "18aa519ae24fe1db442c97a5adaf4e4acb6a4fc4ac41e19964ede200357fded2",
                "tags": [
                    "final-determination",
                    "TP-03-01",
                    "repository-selftest"
                ]
            },
            {
                "line": 739,
                "sessionId": "feature006-scope3-implement-current",
                "agent": "bubbles.implement",
                "spec": "006-trend-dynamics-cycle-lab",
                "scope": "Scope-3",
                "commandClass": "state-report-invariants",
                "exitCode": 0,
                "stdoutHash": "a2b9a0187b7ea6b9dffb4700697422a0f438f5b8d2e0d457764cd711c8e8a906",
                "tags": [
                    "state-report-invariants",
                    "parent-routing",
                    "final-validation"
                ]
            }
        ]
    },
    "currentPathIdentity": {
        "path": "scripts/selftest.mjs",
        "status": " M",
        "staged": false,
        "unstaged": true,
        "indexOid": "03a285cfa21b2f2e1b22b539ac0452094029c110",
        "worktreeGitOid": "484706d2f819971c298fd3dcef19e34915c4f052",
        "worktreeSha256": "f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8",
        "hunkCount": 7,
        "hunkBodySha256": [
            "83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc",
            "71752c795e40ccb663ceb0aa005516f9205fcd3a2fb118d0a2a725f8137e918c",
            "bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd",
            "2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227",
            "71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb",
            "b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794",
            "15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943"
        ]
    },
    "aggregateObservation": {
        "command": "node scripts/selftest.mjs",
        "exitCode": 1,
        "passed": 491,
        "failed": 1,
        "failureOwner": "Market Brief",
        "failure": "nextSession.sessionDate must match snapshot.nextSessionDate",
        "feature006Assertions": "M13-M18 and all Feature 006 Scope 3 cycle assertions observed passing",
        "focusedValidator": "tool log line 690 exited 0",
        "focusedBrowser": "tool log line 672 exited 0",
        "relationshipToFeature006Scope3": "unrelated-unresolved-aggregate-failure",
        "relationshipToFeature004": "unrelated-unresolved-aggregate-failure",
        "feature006PassClaim": false,
        "feature006CompletionClaim": false,
        "feature004PassClaim": false,
        "feature004CompletionClaim": false,
        "collisionPassClaim": false
    },
    "preservationContract": {
        "priorDeltaRawHashRemainsExact": true,
        "priorDeltaRemainsByteIdentical": true,
        "priorDeltaIsSupersededCurrentIdentityHistory": true,
        "originalBaselineRequirementsRemainExact": true,
        "independentRldataSupersessionRequirementsRemainExact": true,
        "fiveHashDispositionRequirementsRemainExact": true,
        "currentIndexIdentityRemainsExact": true,
        "nonTargetCurrentPathsRemainInheritedAndExact": true,
        "hunksOneThroughSixRemainExact": true,
        "onlyNamedPathMayOverlayPriorIdentity": true,
        "onlyNamedHunkMayTransition": true,
        "hunkCountAndOrderRemainExact": true,
        "outsideOwnerMarkerDeltaFailsClosed": true,
        "subsequentIdentityHunkMarkerOrSymbolDriftFailsClosed": true
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "requirements": [
            "Require the feature004-dirty-collision-delta-v1 raw marker-inclusive no-trailing-newline SHA-256 to equal 334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b and preserve that prior block byte-for-byte as superseded-current-identity history.",
            "Parse exactly one feature004-dirty-collision-settled-delta-v1 block and reject a duplicate, missing marker, malformed JSON, or any unknown, missing, or reordered top-level or nested field.",
            "Require the exact top-level field order contractVersion, findingId, capturedAt, extendsContract, hunkTransition, ownerAttribution, currentPathIdentity, aggregateObservation, preservationContract, testOwnerHandoff.",
            "Require contractVersion feature004-dirty-collision-settled-delta/v1, findingId F004-POSTCHECKPOINT-DRIFT-001, a UTC ISO-8601 capturedAt, and the exact extendsContract marker, raw hash, history disposition, and byte-identity boolean.",
            "Require exactly one hunkTransition object naming only scripts/selftest.mjs hunkIndex 7, previous hash ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80, current hash 15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943, and disposition settled-owner-additive-delta.",
            "Apply the prior disposition and first delta in order, then overlay only scripts/selftest.mjs hunk 7; require inherited status, staging flags, index OID, hunk count, and ordered hashes 1 through 6 before accepting the transition.",
            "Recompute scripts/selftest.mjs status, staged and unstaged state, index OID, Git worktree OID, worktree SHA-256, hunk count, and all seven trimmed hunk-body hashes and require exact equality with currentPathIdentity.",
            "Require the Feature 006 start marker and Feature 007 exclusive end marker exactly once and in order; recompute byte range [117426,159494), byte length 42068, slice SHA-256 2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef, and the exact 65-entry symbol inventory under the declared regex rule.",
            "Require ownerAttribution to bind the exact Feature 006 Scope 3 executionHistory entry finished at 2026-07-15T22:48:39Z with outcome route_required, nine addressed findings, three unresolved findings, and evidenceRef report.md#scope-3-season-cycle-context-and-association-engine.",
            "Require the Feature 006 report anchor and tool-log lines 672, 690, 730, and 739 to resolve with exact session, agent, spec, scope, command or command class, exit code, stdout hash, and tags.",
            "Require aggregateObservation to remain exitCode 1 with 491 passed and 1 failed solely on Market Brief nextSession.sessionDate must match snapshot.nextSessionDate, classify the failure unrelated and unresolved for both features, and require all five pass, completion, and collision claim booleans false.",
            "Require every inherited baseline, independent rldata.js supersession, five-hash disposition, current index, non-target currentPaths, untracked, and volatile-path contract exactly as before; no inherited record may be rewritten or reinterpreted by this overlay.",
            "Reject any second path or hunk, duplicate transition, path mismatch, owner mismatch, evidence mismatch, marker or symbol drift, identity mismatch, hunk addition, hunk removal, hunk reorder, or byte change outside the named owner marker slice.",
            "Fail closed on every identity change after this capture; a later owner change requires another planning-owned additive checkpoint and cannot mutate this block or any prior block.",
            "Do not add a skip, fallback, broad path exemption, subset comparison, mutable owner inference, completion inference, or success-on-unknown branch."
        ]
    }
}
```
<!-- feature004-dirty-collision-settled-delta-v1:end -->

## Current Script Identity Transition Checkpoint - F004-CURRENT-SCRIPT-IDENTITY-002

This planning-owned checkpoint is additive. Every earlier raw checkpoint block remains immutable history. It records the two owner-attributed transitions that invalidate the prior collision canary identity, plus the complete current identity and last-commit provenance of all 13 inherited checkpoint paths: the previously captured `scripts/selftest.mjs` worktree blob was promoted unchanged into the index before one Feature 010 owner-bounded hunk was added, and the previously untracked `scripts/validate-brief-payload.mjs` blob was promoted unchanged into the index and is now clean. The record makes no test-pass, phase-completion, scope-completion, or certification claim.

<!-- feature004-dirty-collision-script-transitions-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-script-transitions/v1",
    "findingIds": [
        "F004-CURRENT-SCRIPT-IDENTITY-002",
        "BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY",
        "BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY"
    ],
    "capturedAt": "2026-07-17T00:12:23Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-settled-delta-v1",
        "rawBlockSha256": "f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0",
        "priorBlockMustRemainByteIdentical": true
    },
    "inheritedRawBlocks": [
        {
            "marker": "feature004-dirty-baseline-v1",
            "rawBlockSha256": "3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad"
        },
        {
            "marker": "feature004-dirty-supersession-v1",
            "rawBlockSha256": "251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d"
        },
        {
            "marker": "feature004-dirty-collision-disposition-v1",
            "rawBlockSha256": "5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e"
        },
        {
            "marker": "feature004-dirty-collision-delta-v1",
            "rawBlockSha256": "334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b"
        },
        {
            "marker": "feature004-dirty-collision-settled-delta-v1",
            "rawBlockSha256": "f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0"
        }
    ],
    "commitCatalog": [
        {"commit":"db06c29650ba351770297acefa658f51cbc4ff00","author":"pkirsanov","authoredAt":"2026-07-16T12:01:36-07:00","subject":"feat: expand research lab capabilities and automation"},
        {"commit":"56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3","author":"pkirsanov","authoredAt":"2026-07-16T11:18:43-07:00","subject":"compact market brief lane inputs"},
        {"commit":"d7fd1d02e99c748ab5366c5a8e6de1192b24b823","author":"pkirsanov","authoredAt":"2026-07-16T11:33:40-07:00","subject":"persist automatic ticker cache refreshes"},
        {"commit":"932efdd9912bfc264ae96ded90f6410fe4cc5537","author":"pkirsanov","authoredAt":"2026-07-16T09:35:08-07:00","subject":"fix market brief scheduled publication"},
        {"commit":"71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef","author":"pkirsanov","authoredAt":"2026-07-15T12:32:33-07:00","subject":"market-brief: Tier-A data-only refresh 2026-07-15 15:32 EDT (pre-close)"}
    ],
    "pathTransitions": [
        {
            "path": "scripts/selftest.mjs",
            "transition": "prior-worktree-promoted-to-index-plus-owner-bounded-working-hunk",
            "priorIdentityRef": {
                "marker": "feature004-dirty-collision-settled-delta-v1",
                "field": "currentPathIdentity",
                "status": " M",
                "indexOid": "03a285cfa21b2f2e1b22b539ac0452094029c110",
                "worktreeGitOid": "484706d2f819971c298fd3dcef19e34915c4f052",
                "worktreeSha256": "f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8",
                "hunkCount": 7
            },
            "indexPromotion": {
                "commit": "db06c29650ba351770297acefa658f51cbc4ff00",
                "authorName": "pkirsanov",
                "authorEmail": "pkirsanov@users.noreply.github.com",
                "committedAt": "2026-07-16T12:01:36-07:00",
                "subject": "feat: expand research lab capabilities and automation",
                "blobOid": "484706d2f819971c298fd3dcef19e34915c4f052",
                "matchesPriorWorktreeGitOid": true
            },
            "currentIdentity": {
                "status": " M",
                "staged": false,
                "unstaged": true,
                "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
                "worktreeGitOid": "855894dd0d466ef299667e4aaff02a6923482608",
                "worktreeSha256": "cb160b9a2e4860f17c89b875d3dc8eaf729bc974b7886d8c1da6d963fca97406",
                "hunkCount": 1,
                "hunkBodySha256": [
                    "8090d43820796759b0def54d4744290e0a5137710ebda91e1e25109e50942d50"
                ]
            },
            "settledOwner": {
                "owner": "bubbles.implement",
                "packet": "specs/010-company-fundamentals-and-brief-lab",
                "scope": "Scope 01",
                "phase": "implement",
                "ownershipBasis": "active-packet-state-plus-explicit-spec-review-disposition",
                "markerBounds": {
                    "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
                    "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
                    "startByte": 183893,
                    "endByteExclusive": 189582,
                    "byteLength": 5689,
                    "sliceSha256": "290e3fb9efe0b1da836556c012a67980478b38fc209710e5d769545f5a2b43ae"
                },
                "artifactRefs": [
                    "../010-company-fundamentals-and-brief-lab/state.json::execution.activeAgent=bubbles.implement;currentPhase=implement;currentScope=1;nextRequiredOwner=bubbles.implement",
                    "../010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/scope.md#change-boundary-and-rollback",
                    "../010-company-fundamentals-and-brief-lab/spec-review.md#shared-surface-assessment",
                    "../010-company-fundamentals-and-brief-lab/spec-review.md#required-route"
                ],
                "completionClaim": false
            }
        },
        {
            "path": "scripts/validate-brief-payload.mjs",
            "transition": "historical-untracked-blob-promoted-unchanged-to-clean-index",
            "priorIdentityRef": {
                "marker": "feature004-dirty-baseline-v1",
                "field": "untracked",
                "status": "??",
                "worktreeGitOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
                "worktreeSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
                "lineChunkCount": 137,
                "orderedLineHashSha256": "63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e"
            },
            "indexPromotion": {
                "commit": "932efdd9912bfc264ae96ded90f6410fe4cc5537",
                "authorName": "pkirsanov",
                "authorEmail": "pkirsanov@users.noreply.github.com",
                "committedAt": "2026-07-16T09:35:08-07:00",
                "subject": "fix market brief scheduled publication",
                "change": "added",
                "blobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
                "matchesPriorUntrackedGitOid": true
            },
            "currentIdentity": {
                "status": "",
                "staged": false,
                "unstaged": false,
                "indexOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
                "worktreeGitOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
                "worktreeSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
                "hunkCount": 0,
                "hunkBodySha256": [],
                "lineChunkCount": 137,
                "orderedLineHashSha256": "63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e"
            },
            "settledOwner": {
                "ownerType": "git-commit-author",
                "owner": "pkirsanov",
                "phase": "operator-commit",
                "ownershipBasis": "immutable-introducing-commit",
                "artifactRefs": [
                    "git:commit:932efdd9912bfc264ae96ded90f6410fe4cc5537",
                    "git:commit:932efdd9912bfc264ae96ded90f6410fe4cc5537:path=scripts/validate-brief-payload.mjs;change=added;blob=7bd6639ce774a6b2a04f5cebf5254684a9f3ba28"
                ],
                "bubblesOwnerInferred": false,
                "completionClaim": false
            }
        }
    ],
    "currentCheckpointPaths": [
        {"path":"rldata.js","status":"","staged":false,"unstaged":false,"headOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","indexOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeGitOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeSha256":"d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/selftest.mjs","status":" M","staged":false,"unstaged":true,"headOid":"484706d2f819971c298fd3dcef19e34915c4f052","indexOid":"484706d2f819971c298fd3dcef19e34915c4f052","worktreeGitOid":"855894dd0d466ef299667e4aaff02a6923482608","worktreeSha256":"cb160b9a2e4860f17c89b875d3dc8eaf729bc974b7886d8c1da6d963fca97406","hunkCount":1,"hunkBodySha256":["8090d43820796759b0def54d4744290e0a5137710ebda91e1e25109e50942d50"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/fetch-bars.mjs","status":"","staged":false,"unstaged":false,"headOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","indexOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeGitOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeSha256":"05534ce159bd230f5af2fda7890ed62b06d36d1cdfd14945a0687f572db93e78","hunkCount":0,"hunkBodySha256":[],"lastCommit":"56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3"},
        {"path":"global-rotation-lab.html","status":"","staged":false,"unstaged":false,"headOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","indexOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeGitOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeSha256":"cdd92f8d4f8ce5804b96fab284bad4248f361b7639ba48dd6acf8f12be903f9d","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"index.html","status":"","staged":false,"unstaged":false,"headOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","indexOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","worktreeGitOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","worktreeSha256":"457ade7f8938c65763ed1086116e15c695b3548a79ded8e38b1eb794ea823f82","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"rlnav.js","status":"","staged":false,"unstaged":false,"headOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","indexOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","worktreeGitOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","worktreeSha256":"dc7cb211eacd14490af3074eba6363f2b302fa41dc23a4a1af864f90d188667a","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"tools.json","status":"","staged":false,"unstaged":false,"headOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","indexOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","worktreeGitOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","worktreeSha256":"698bf7505add311bb0f9d6cc983eb25aab0d85921f5283b8025f6e1ecdaa776e","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"market-brief.html","status":"","staged":false,"unstaged":false,"headOid":"9cf3d6974d14525c915a11df39bc241778ff3869","indexOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeGitOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeSha256":"e0e17492704921937706682b6de8c0efa998890e22a1abaaa36c6688fc5c2b0b","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"notes/market-brief.md","status":"","staged":false,"unstaged":false,"headOid":"e3e3b8252f7415890665106414f39191b696bcf8","indexOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeGitOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeSha256":"aa0c9abb817a0397212017cb3366079e5b29a4f1046a1471b131dcb256480243","hunkCount":0,"hunkBodySha256":[],"lastCommit":"d7fd1d02e99c748ab5366c5a8e6de1192b24b823"},
        {"path":"README.md","status":"","staged":false,"unstaged":false,"headOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","indexOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","worktreeGitOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","worktreeSha256":"10f61b75d7b9b9121e491cf7585b6f796770c691118dc81e92aca0a084a607d8","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"notes/README.md","status":"","staged":false,"unstaged":false,"headOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","indexOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","worktreeGitOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","worktreeSha256":"715c27366f612d1a6760e7e3cf1e6f603689564a572edf058ba0b37c3ff163dc","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/validate-brief-payload.mjs","status":"","staged":false,"unstaged":false,"headOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","indexOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeGitOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeSha256":"78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f","hunkCount":0,"hunkBodySha256":[],"lastCommit":"932efdd9912bfc264ae96ded90f6410fe4cc5537"},
        {"path":"market-brief.config.json","status":"","staged":false,"unstaged":false,"headOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","indexOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeGitOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeSha256":"85f9134435ec7f361d258f067d59611895df3b0f6959dcca506370744b7932ca","hunkCount":0,"hunkBodySha256":[],"lastCommit":"71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef"}
    ],
    "volatileConfigPolicy": {
        "path": "market-brief.config.json",
        "currentIdentityRecorded": true,
        "authoritativeForFutureScope4Edit": false,
        "inheritedJustInTimeCheckpointRuleRemainsRequired": true
    },
    "preservationContract": {
        "allInheritedRawBlocksRemainByteIdentical": true,
        "onlyTwoNamedPathTransitionsAreAccepted": true,
        "completeCurrentIdentityEqualityRequired": true,
        "completeThirteenPathMatrixRequired": true,
        "allCleanPathsMustMatchHeadIndexAndWorktree": true,
        "onlySelftestMayHaveOneCurrentWorktreeHunk": true,
        "everyPathLastCommitMustResolveThroughCommitCatalog": true,
        "selftestCurrentHunkMustRemainInsideUniqueOwnerMarkers": true,
        "validatorMustRemainByteIdenticalToItsHistoricalUntrackedBlob": true,
        "volatileConfigRuleRemainsNonAuthoritativeForFutureEdit": true,
        "unknownPathIdentityOwnerOrFieldFailsClosed": true,
        "testWeakeningBroadExemptionAndUnknownIdentityAcceptanceForbidden": true,
        "plannerCanaryPassClaim": false,
        "plannerTestPhaseCompletionClaim": false,
        "plannerScopeCompletionClaim": false,
        "plannerCertificationClaim": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "nextPacket": "specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence",
        "requirements": [
            "Require all five inherited marker-inclusive raw block SHA-256 values exactly and preserve every inherited block byte-for-byte before parsing this successor.",
            "Parse exactly one feature004-dirty-collision-script-transitions-v1 block and reject duplicate, missing, malformed, unknown, omitted, or reordered fields at every level.",
            "Require the exact top-level field order contractVersion, findingIds, capturedAt, extendsContract, inheritedRawBlocks, commitCatalog, pathTransitions, currentCheckpointPaths, volatileConfigPolicy, preservationContract, testOwnerHandoff.",
            "Require exactly the two pathTransitions in listed order: scripts/selftest.mjs and scripts/validate-brief-payload.mjs; reject every third, duplicate, renamed, or reordered path.",
            "For scripts/selftest.mjs, require the prior settled currentPathIdentity, prove commit db06c29650ba351770297acefa658f51cbc4ff00 stores blob 484706d2f819971c298fd3dcef19e34915c4f052 equal to that prior worktree Git OID, then recompute the complete current one-hunk identity exactly.",
            "Require the unique Feature 010 markers and exact byte range, slice hash, active bubbles.implement Scope 01 state, allowed scope boundary, and explicit spec-review ownership disposition; infer no completion from ownership.",
            "For scripts/validate-brief-payload.mjs, require the baseline untracked identity, prove introducing commit 932efdd9912bfc264ae96ded90f6410fe4cc5537 stores the same blob, and recompute an empty status, zero-hunk, index/worktree-identical current identity with the same 137-line prefix contract.",
            "Attribute the validator promotion only to its immutable Git commit author; do not infer a Bubbles specialist or phase absent artifact evidence.",
            "Require exactly 13 currentCheckpointPaths in the listed order and recompute each path's short status, staging flags, HEAD/index/worktree Git OIDs, SHA-256, hunk count, complete ordered hunk hashes, and last commit.",
            "Require every clean path to have identical HEAD, index, and worktree Git OIDs with zero hunks; require only scripts/selftest.mjs to carry exactly the one owner-attributed current hunk.",
            "Require every currentCheckpointPaths lastCommit to resolve through the closed commitCatalog and reject an unknown commit, changed subject/date/author, or path whose HEAD blob differs from the recorded headOid.",
            "Preserve market-brief.config.json as non-authoritative for any future Scope 4 edit and continue requiring its separate just-in-time checkpoint even though this record captures its current clean identity.",
            "Reject any identity drift, marker drift, owner drift, commit/blob mismatch, extra hunk, removed hunk, staged state, validator byte change, broad path exemption, subset comparison, skip, fallback, mutable inference, or success-on-unknown branch.",
            "Run the direct Feature 004 collision canary and the BUG-003 acceptance replay under bubbles.test ownership; planner observations cannot satisfy or complete the test phase."
        ]
    }
}
```
<!-- feature004-dirty-collision-script-transitions-v1:end -->

## Superseded Concurrent Validator-Only Proposal (Do Not Execute)

This non-authoritative concurrent proposal is retained only to make the planning race auditable. It does not extend, supersede, or override the active `feature004-dirty-collision-script-transitions-v1` checkpoint above; no parser may consume it as a checkpoint. The active successor already records the validator transition, the owner-attributed current Feature 010 hunk, and the complete 13-path matrix with fail-closed drift handling.

<!-- feature004-superseded-validator-note-v1:start -->
```json
{
    "contractVersion": "feature004-superseded-validator-note/v1",
    "active": false,
    "findingId": "F004-VALIDATOR-TRACKED-TRANSITION-001",
    "capturedAt": "2026-07-17T00:01:05Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-script-transitions-v1",
        "rawBlockSha256": "0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3",
        "historyDisposition": "superseded-planning-disposition-history",
        "priorBlockMustRemainByteIdentical": true
    },
    "acceptedTransition": {
        "path": "scripts/validate-brief-payload.mjs",
        "transition": "historical-untracked-blob-promoted-unchanged-to-clean-index",
        "priorIdentityRef": {
            "marker": "feature004-dirty-baseline-v1",
            "field": "untracked",
            "status": "??",
            "worktreeGitOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "worktreeSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
            "lineChunkCount": 137,
            "orderedLineHashSha256": "63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e"
        },
        "ownerAttribution": {
            "ownerType": "git-commit-plus-bug-artifact",
            "owner": "BUG-002 Market Brief scheduled-publication implementation",
            "commit": "932efdd9912bfc264ae96ded90f6410fe4cc5537",
            "subject": "fix market brief scheduled publication",
            "change": "added",
            "authorName": "pkirsanov",
            "committedAt": "2026-07-16T09:35:08-07:00",
            "blobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "artifactRefs": [
                "../_bugs/BUG-002-market-brief-session-date-drift/report.md#commit-provenance",
                "../_bugs/BUG-002-market-brief-session-date-drift/report.md#current-invocation-byte-and-dirty-boundary-integrity",
                "git:commit:932efdd9912bfc264ae96ded90f6410fe4cc5537:path=scripts/validate-brief-payload.mjs;change=added;blob=7bd6639ce774a6b2a04f5cebf5254684a9f3ba28"
            ],
            "bubblesSpecialistInferred": false
        },
        "currentIdentity": {
            "status": "",
            "staged": false,
            "unstaged": false,
            "indexOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "headOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "worktreeGitOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "worktreeSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
            "hunkCount": 0,
            "hunkBodySha256": [],
            "diffFromOwnerCommitExit": 0
        }
    },
    "unacceptedTransition": {
        "path": "scripts/selftest.mjs",
        "priorRecordRef": {
            "marker": "feature004-dirty-collision-script-transitions-v1",
            "field": "pathTransitions[path=scripts/selftest.mjs]"
        },
        "owner": "bubbles.implement",
        "packet": "specs/010-company-fundamentals-and-brief-lab",
        "scope": "Scope 01",
        "phase": "implement",
        "ownerMarker": "FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION",
        "ownerEvidenceRefs": [
            "../010-company-fundamentals-and-brief-lab/state.json::execution.activeAgent=bubbles.implement;currentPhase=implement;currentScope=1;nextRequiredOwner=bubbles.implement",
            "../010-company-fundamentals-and-brief-lab/spec-review.md#shared-surface-assessment",
            "../010-company-fundamentals-and-brief-lab/spec-review.md#required-route"
        ],
        "reason": "The marker proves ownership, but the owning Scope 01 implementation remains active with unresolved findings, so its current bytes are not a settled identity.",
        "identityAccepted": false,
        "canaryRequiredState": "red"
    },
    "preservationContract": {
        "allSixPredecessorBlocksRemainByteIdentical": true,
        "twoPathBlockIsSupersededPlanningHistory": true,
        "onlyValidatorTransitionIsAccepted": true,
        "validatorHistoricalPrefixRemainsExact": true,
        "validatorCurrentIdentityRequiresCompleteEquality": true,
        "selftestSuccessorIdentityIsNotAccepted": true,
        "settledDeltaSelftestIdentityRemainsTheActiveRequirement": true,
        "unknownPathIdentityOwnerCommitOrFieldFailsClosed": true,
        "testWeakeningBroadExemptionSubsetComparisonFallbackAndUnknownSuccessForbidden": true,
        "plannerCanaryPassClaim": false,
        "plannerTestPhaseCompletionClaim": false,
        "plannerScopeCompletionClaim": false,
        "plannerCertificationClaim": false
    },
    "planningValidation": {
        "command": "node --test tests/feature-004-dirty-tree-collision.test.mjs",
        "exitCode": 1,
        "tests": 3,
        "passed": 1,
        "failed": 2,
        "skipped": 0,
        "failedAssertions": [
            "scripts/selftest.mjs complete current identity matches the reviewed disposition",
            "scripts/validate-brief-payload.mjs remains untracked and unstaged"
        ],
        "classification": "expected-pre-parser-red",
        "claimSource": "executed",
        "testPhaseClaim": false
    },
    "routing": {
        "outcome": "route_required",
        "addressedFindingIds": [
            "F004-VALIDATOR-TRACKED-TRANSITION-001",
            "BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY"
        ],
        "unresolvedFindingIds": [
            "F004-CURRENT-SCRIPT-IDENTITY-002",
            "BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY",
            "BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION",
            "BUG003-INDEPENDENT-VERIFICATION"
        ],
        "nextRequiredOwner": "bubbles.implement",
        "nextRequiredTarget": "specs/010-company-fundamentals-and-brief-lab SCOPE-01",
        "returnOwnerAfterSettlement": "bubbles.plan",
        "testOwnerAfterOwnerBoundCheckpoint": "bubbles.test"
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "requirements": [
            "Require all six predecessor marker-inclusive raw block SHA-256 values exactly and preserve every predecessor block byte-for-byte before parsing this correction.",
            "Parse exactly one feature004-dirty-validator-tracked-v1 block and reject a duplicate, missing marker, malformed JSON, unknown field, missing field, or reordered field at every level.",
            "Require the exact top-level field order contractVersion, findingId, capturedAt, extendsContract, acceptedTransition, unacceptedTransition, preservationContract, planningValidation, routing, testOwnerHandoff.",
            "Require the correction to extend feature004-dirty-collision-script-transitions-v1 raw hash 881fe048e39e3d033f56c5905051c5f1c9957acdfb730f5af8640a52a6b6271f and preserve that block as superseded planning history.",
            "Accept exactly one transition for scripts/validate-brief-payload.mjs and prove its historical untracked Git OID, SHA-256, 137-line prefix contract, BUG-002 add commit, clean current status, zero hunks, and index HEAD worktree blob equality.",
            "Supersede only the validator historical status assertion; preserve its original prefix bytes and every other baseline, supersession, disposition, delta, settled-delta, and volatile-path obligation.",
            "Do not apply the predecessor two-path block's scripts/selftest.mjs record to active currentPaths; require the settled-delta selftest identity until a separate planning-owned owner-settled checkpoint exists.",
            "Keep CMD-COLLISION red on the current Feature 010 selftest mismatch and report that mismatch without changing source, planning history, or test assertions.",
            "Reject every unknown path, identity, owner, commit, marker, hunk, byte, staged state, duplicate, omission, reordering, broad path exemption, subset comparison, skip, fallback, mutable inference, or success-on-unknown branch.",
            "Do not claim a test pass, test phase completion, scope completion, certification, BUG-003 acceptance, or BUG-002 resume from this planning checkpoint."
        ]
    }
}
```
<!-- feature004-superseded-validator-note-v1:end -->

## Owner-Settled Selftest Successor Checkpoint - F004-CURRENT-SCRIPT-IDENTITY-003

This planning-owned checkpoint is additive. All seven predecessor marker blocks remain byte-identical. The immediate predecessor is retained as superseded validator-only history, while the active script-transition contract remains the base for exactly one owner-settled `scripts/selftest.mjs` identity overlay. The already-approved tracked-clean validator transition and the other 12 checkpoint path identities are unchanged.

The current `node scripts/selftest.mjs` execution is recorded only as a planning observation against the exact captured bytes. It does not establish Feature 010 test ownership, scope or feature completion, certification, Feature 004 test or scope completion, BUG-003 acceptance, or BUG-002 acceptance. The direct collision canary remains test-owned and is expected to fail closed until `bubbles.test` consumes this schema without weakening any inherited assertion.

<!-- feature004-dirty-collision-owner-settled-selftest-v1:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-owner-settled-selftest/v1",
    "findingId": "F004-CURRENT-SCRIPT-IDENTITY-003",
    "capturedAt": "2026-07-17T02:09:13Z",
    "extendsContract": {
        "marker": "feature004-superseded-validator-note-v1",
        "rawBlockSha256": "7beb0c5892b6f26b52f24c229f5b2bc340befb6141683ecc92756174f02f9870",
        "historyDisposition": "immediate-superseded-validator-history",
        "priorBlockMustRemainByteIdentical": true
    },
    "activeContract": {
        "marker": "feature004-dirty-collision-script-transitions-v1",
        "rawBlockSha256": "0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3",
        "historyDisposition": "active-before-owner-settled-selftest-overlay",
        "priorBlockMustRemainByteIdentical": true
    },
    "inheritedRawBlocks": [
        {
            "marker": "feature004-dirty-baseline-v1",
            "rawBlockSha256": "3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad"
        },
        {
            "marker": "feature004-dirty-supersession-v1",
            "rawBlockSha256": "251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d"
        },
        {
            "marker": "feature004-dirty-collision-disposition-v1",
            "rawBlockSha256": "5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e"
        },
        {
            "marker": "feature004-dirty-collision-delta-v1",
            "rawBlockSha256": "334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b"
        },
        {
            "marker": "feature004-dirty-collision-settled-delta-v1",
            "rawBlockSha256": "f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0"
        },
        {
            "marker": "feature004-dirty-collision-script-transitions-v1",
            "rawBlockSha256": "0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3"
        },
        {
            "marker": "feature004-superseded-validator-note-v1",
            "rawBlockSha256": "7beb0c5892b6f26b52f24c229f5b2bc340befb6141683ecc92756174f02f9870"
        }
    ],
    "selftestTransition": {
        "path": "scripts/selftest.mjs",
        "previousIdentityRef": {
            "marker": "feature004-dirty-collision-script-transitions-v1",
            "field": "currentCheckpointPaths[path=scripts/selftest.mjs]"
        },
        "previousIdentity": {
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
            "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
            "worktreeGitOid": "855894dd0d466ef299667e4aaff02a6923482608",
            "worktreeSha256": "cb160b9a2e4860f17c89b875d3dc8eaf729bc974b7886d8c1da6d963fca97406",
            "hunkCount": 1,
            "hunkBodySha256": [
                "8090d43820796759b0def54d4744290e0a5137710ebda91e1e25109e50942d50"
            ],
            "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00"
        },
        "currentIdentity": {
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
            "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
            "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
            "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
            "hunkCount": 1,
            "hunkBodySha256": [
                "9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"
            ],
            "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00"
        },
        "markerBounds": {
            "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
            "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 183893,
            "endMarkerStartByte": 191689,
            "endByteExclusive": 191742,
            "byteLength": 7849,
            "sliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
        },
        "disposition": "owner-settled-marker-bounded-selftest-overlay"
    },
    "retainedValidatorTransition": {
        "path": "scripts/validate-brief-payload.mjs",
        "sourceRecordRef": {
            "marker": "feature004-dirty-collision-script-transitions-v1",
            "field": "pathTransitions[path=scripts/validate-brief-payload.mjs]"
        },
        "historicalStatus": "??",
        "currentIdentity": {
            "status": "",
            "staged": false,
            "unstaged": false,
            "headOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "indexOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "worktreeGitOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "worktreeSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
            "hunkCount": 0,
            "hunkBodySha256": [],
            "lastCommit": "932efdd9912bfc264ae96ded90f6410fe4cc5537"
        },
        "historicalPrefixContract": {
            "lineChunkCount": 137,
            "orderedLineHashSha256": "63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e"
        },
        "introducingCommit": {
            "commit": "932efdd9912bfc264ae96ded90f6410fe4cc5537",
            "change": "added",
            "blobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
            "subject": "fix market brief scheduled publication"
        },
        "unchangedByThisSuccessor": true
    },
    "ownerAttribution": {
        "owner": "bubbles.implement",
        "packet": "specs/010-company-fundamentals-and-brief-lab",
        "scope": "Scope 01",
        "phase": "implement",
        "executionHistorySelector": {
            "agent": "bubbles.implement",
            "executionModel": "direct-authorized-runner",
            "parentAgent": "bubbles.goal",
            "startedAt": "2026-07-17T00:14:13Z",
            "finishedAt": "2026-07-17T00:34:15Z",
            "outcome": "route_required",
            "evidenceRef": "scopes/01-contract-config-validator-publication-foundation/report.md#final-concurrent-owner-reconciliation---2026-07-17t003415z"
        },
        "scopeFindingDisposition": {
            "addressedFindingIds": [
                "SR010-001",
                "SR010-002",
                "SR010-003",
                "SR010-004",
                "SR010-005"
            ],
            "pendingTestFindingIds": [
                "F010-INDEPENDENT-VERIFICATION-001"
            ]
        },
        "testOwnershipRoute": {
            "transitionRequestId": "TR-F010-SCOPE01-TEST-OWNERSHIP-01",
            "status": "pending",
            "routedTo": "bubbles.test",
            "findingIds": [
                "F010-INDEPENDENT-VERIFICATION-001"
            ],
            "evidenceRef": "scopes/01-contract-config-validator-publication-foundation/report.md#final-current-session-supersession---2026-07-17t003401z"
        },
        "artifactRefs": [
            "../010-company-fundamentals-and-brief-lab/state.json::executionHistory[agent=bubbles.implement;finishedAt=2026-07-17T00:34:15Z;outcome=route_required]",
            "../010-company-fundamentals-and-brief-lab/state.json::transitionRequests[id=TR-F010-SCOPE01-TEST-OWNERSHIP-01;status=pending;routedTo=bubbles.test;findingIds=F010-INDEPENDENT-VERIFICATION-001]",
            "../010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md#final-owner-settled-selftest-identity",
            "../010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md#final-current-session-supersession---2026-07-17t003401z"
        ],
        "nonCompletionState": {
            "featureStatus": "not_started",
            "scopeStatus": "not_started",
            "certificationStatus": "not_started",
            "completedPhaseClaims": [
                "spec-review"
            ],
            "completedScopes": []
        }
    },
    "currentCheckpointPaths": [
        {"path":"rldata.js","status":"","staged":false,"unstaged":false,"headOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","indexOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeGitOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeSha256":"d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/selftest.mjs","status":" M","staged":false,"unstaged":true,"headOid":"484706d2f819971c298fd3dcef19e34915c4f052","indexOid":"484706d2f819971c298fd3dcef19e34915c4f052","worktreeGitOid":"f1f5d4c604efd6a46b4183408fd397202e650b6f","worktreeSha256":"25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b","hunkCount":1,"hunkBodySha256":["9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/fetch-bars.mjs","status":"","staged":false,"unstaged":false,"headOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","indexOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeGitOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeSha256":"05534ce159bd230f5af2fda7890ed62b06d36d1cdfd14945a0687f572db93e78","hunkCount":0,"hunkBodySha256":[],"lastCommit":"56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3"},
        {"path":"global-rotation-lab.html","status":"","staged":false,"unstaged":false,"headOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","indexOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeGitOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeSha256":"cdd92f8d4f8ce5804b96fab284bad4248f361b7639ba48dd6acf8f12be903f9d","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"index.html","status":"","staged":false,"unstaged":false,"headOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","indexOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","worktreeGitOid":"f8172ce807a43ffa1c43952893bdba280c07cdaf","worktreeSha256":"457ade7f8938c65763ed1086116e15c695b3548a79ded8e38b1eb794ea823f82","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"rlnav.js","status":"","staged":false,"unstaged":false,"headOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","indexOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","worktreeGitOid":"d06842ad8b5eaf6e97602cc7492016cd7e41fbdc","worktreeSha256":"dc7cb211eacd14490af3074eba6363f2b302fa41dc23a4a1af864f90d188667a","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"tools.json","status":"","staged":false,"unstaged":false,"headOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","indexOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","worktreeGitOid":"be5dcb929d2e0db1dcb3e259b6a1f11e799e2b7e","worktreeSha256":"698bf7505add311bb0f9d6cc983eb25aab0d85921f5283b8025f6e1ecdaa776e","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"market-brief.html","status":"","staged":false,"unstaged":false,"headOid":"9cf3d6974d14525c915a11df39bc241778ff3869","indexOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeGitOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeSha256":"e0e17492704921937706682b6de8c0efa998890e22a1abaaa36c6688fc5c2b0b","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"notes/market-brief.md","status":"","staged":false,"unstaged":false,"headOid":"e3e3b8252f7415890665106414f39191b696bcf8","indexOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeGitOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeSha256":"aa0c9abb817a0397212017cb3366079e5b29a4f1046a1471b131dcb256480243","hunkCount":0,"hunkBodySha256":[],"lastCommit":"d7fd1d02e99c748ab5366c5a8e6de1192b24b823"},
        {"path":"README.md","status":"","staged":false,"unstaged":false,"headOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","indexOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","worktreeGitOid":"b9ef9ef8997d3302388153ab206c2aa7bb9f164e","worktreeSha256":"10f61b75d7b9b9121e491cf7585b6f796770c691118dc81e92aca0a084a607d8","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"notes/README.md","status":"","staged":false,"unstaged":false,"headOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","indexOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","worktreeGitOid":"f1eed41bbb234e1285b5a3e022118329f0e61b05","worktreeSha256":"715c27366f612d1a6760e7e3cf1e6f603689564a572edf058ba0b37c3ff163dc","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/validate-brief-payload.mjs","status":"","staged":false,"unstaged":false,"headOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","indexOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeGitOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeSha256":"78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f","hunkCount":0,"hunkBodySha256":[],"lastCommit":"932efdd9912bfc264ae96ded90f6410fe4cc5537"},
        {"path":"market-brief.config.json","status":"","staged":false,"unstaged":false,"headOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","indexOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeGitOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeSha256":"85f9134435ec7f361d258f067d59611895df3b0f6959dcca506370744b7932ca","hunkCount":0,"hunkBodySha256":[],"lastCommit":"71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef"}
    ],
    "aggregateObservation": {
        "command": "node scripts/selftest.mjs",
        "executedAt": "2026-07-17T02:06:35Z",
        "exitCode": 0,
        "passed": 508,
        "failed": 0,
        "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
        "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
        "classification": "planning-observation-only",
        "testEvidenceClaim": false,
        "completionEvidenceClaim": false
    },
    "completionClaims": {
        "feature010ScopePassClaim": false,
        "feature010ScopeCompletionClaim": false,
        "feature010FeaturePassClaim": false,
        "feature010FeatureCompletionClaim": false,
        "feature010TestPassClaim": false,
        "feature010TestCompletionClaim": false,
        "feature010CertificationPassClaim": false,
        "feature010CertificationCompletionClaim": false,
        "feature004CanaryPassClaim": false,
        "feature004TestPhasePassClaim": false,
        "feature004TestPhaseCompletionClaim": false,
        "feature004ScopePassClaim": false,
        "feature004ScopeCompletionClaim": false,
        "feature004CertificationPassClaim": false,
        "feature004CertificationCompletionClaim": false,
        "bug003AcceptanceClaim": false,
        "bug002AcceptanceClaim": false
    },
    "volatileConfigPolicy": {
        "path": "market-brief.config.json",
        "currentIdentityRecorded": true,
        "authoritativeForScope4Edit": false,
        "inheritedJustInTimeCheckpointRuleRemainsRequired": true
    },
    "preservationContract": {
        "allSevenPredecessorBlocksRemainByteIdentical": true,
        "immediateSupersededValidatorHistoryRemainsNonAuthoritative": true,
        "activeScriptTransitionsBlockRemainsByteIdentical": true,
        "onlySelftestCurrentIdentityMayChange": true,
        "selftestStatusAndStagingMustMatchExactly": true,
        "selftestHunkCountOrderAndHashMustMatchExactly": true,
        "selftestMarkerCountsOrderBoundsAndHashMustMatchExactly": true,
        "feature010OwnerReturnMustResolveExactly": true,
        "validatorTransitionRemainsExactAndUnchanged": true,
        "otherTwelveCheckpointPathIdentitiesRemainExact": true,
        "completeThirteenPathOrderAndIdentityRemainExact": true,
        "volatileConfigRuleRemainsNonAuthoritativeForScope4Edit": true,
        "subsequentByteHunkMarkerOwnerStatusOrStagingDriftFailsClosed": true,
        "unknownMissingDuplicateReorderedOrBroadenedRecordFailsClosed": true,
        "skipFallbackSubsetComparisonMutableInferenceAndUnknownSuccessForbidden": true
    },
    "routing": {
        "outcome": "route_required",
        "addressedFindingIds": [
            "F004-CURRENT-SCRIPT-IDENTITY-003",
            "BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY"
        ],
        "unresolvedFindingIds": [
            "F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002",
            "BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION",
            "BUG003-INDEPENDENT-VERIFICATION",
            "BUG002-ACCEPTANCE-BLOCK"
        ],
        "nextRequiredOwner": "bubbles.test",
        "nextRequiredTarget": "tests/feature-004-dirty-tree-collision.test.mjs then BUG-003 independent acceptance replay",
        "bug003StatusRequired": "in_progress",
        "bug002ResumeAllowed": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "nextPacket": "specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence",
        "requirements": [
            "Require all seven inherited marker-inclusive raw block SHA-256 values exactly before parsing this successor; preserve every predecessor block byte-for-byte.",
            "Parse exactly one feature004-dirty-collision-owner-settled-selftest-v1 block and reject a duplicate, missing marker, malformed JSON, or any unknown, missing, or reordered top-level or nested field.",
            "Require the exact top-level field order contractVersion, findingId, capturedAt, extendsContract, activeContract, inheritedRawBlocks, selftestTransition, retainedValidatorTransition, ownerAttribution, currentCheckpointPaths, aggregateObservation, completionClaims, volatileConfigPolicy, preservationContract, routing, testOwnerHandoff.",
            "Require extendsContract to hash-link the immediate feature004-superseded-validator-note-v1 bytes at 1df8a233ab8bf6daec8c8081fdb61176e113b5bf4436eb7e3904824265b4f592 while retaining that note as non-authoritative history.",
            "Require activeContract to identify feature004-dirty-collision-script-transitions-v1 bytes at 6939ebd01e0a1b89849b75c9b228e0957c285f8500c6191da5338a5ae58dad69 before applying exactly one selftest current-identity overlay.",
            "Require the exact previous selftest record, then recompute status, staging flags, HEAD and index OIDs, worktree Git OID, SHA-256, one trimmed hunk-body hash, and last commit for the owner-settled current identity.",
            "Require the Feature 010 begin and end markers exactly once and in order; recompute byte range [183893,191742), end-marker start 191689, byte length 7849, and slice SHA-256 29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3.",
            "Resolve exactly one Feature 010 Scope 01 bubbles.implement owner-return record finished at 2026-07-17T00:34:15Z and the pending TR-F010-SCOPE01-TEST-OWNERSHIP-01 route containing only F010-INDEPENDENT-VERIFICATION-001.",
            "Require SR010-001 through SR010-005 addressed while Feature 010 status, Scope 01 status, certification status, test ownership, and every completion or pass inference remain nonterminal and false.",
            "Retain the approved validator tracked-clean identity, 137-line prefix contract, and introducing commit exactly; this successor may not rewrite or reinterpret that transition.",
            "Require exactly 13 currentCheckpointPaths in the inherited order, recompute every identity, and prove the 12 non-selftest records equal the active predecessor byte-for-byte.",
            "Keep market-brief.config.json non-authoritative for a Scope 4 edit and continue requiring its separate just-in-time checkpoint.",
            "Treat the 508 passed and 0 failed selftest run only as a planning observation bound to the captured bytes; it cannot satisfy Feature 010 or Feature 004 test, scope, feature, certification, or acceptance claims.",
            "Reject any byte, hunk, marker, owner, status, staging, path-order, validator-prefix, commit, or completion-claim drift and every broad exemption, skip, fallback, subset comparison, mutable inference, or success-on-unknown branch.",
            "Run the direct Feature 004 canary under bubbles.test ownership, then run a fresh BUG-003 independent acceptance replay; keep BUG-003 in progress and BUG-002 blocked until those executions are green and independently dispositioned."
        ]
    }
}
```
<!-- feature004-dirty-collision-owner-settled-selftest-v1:end -->

## Code Diff Evidence

Execution agents record path-scoped git evidence here. A delivery claim must show at least one allowed source, test, contract, runtime, or docs path outside planning-only files and must prove zero excluded-file changes.

### Scope 1 Implement Surface - 2026-07-14

**Claim Source:** executed

The implementation-owned Scope 1 paths are:

- `rlfx.js`
- `fx-regime-universe.json`
- additive hunks in `rldata.js`, `scripts/selftest.mjs`, and `scripts/fetch-bars.mjs`
- `tests/fx-regime-relative-value-lab.spec.mjs`
- `tests/feature-004-dirty-tree-collision.test.mjs`
- `tests/fixtures/fx-regime/commonjs-determinism-input.json`
- `tests/fixtures/fx-regime/foundation-cases.json`
- `tests/fixtures/fx-regime/foundation-harness.html`

No Scope 2-4 product path, generated bar/snapshot path, registry, Global Rotation path, Market Brief path, owner note, other spec, or framework-managed path was changed by this implementation phase. A cached Playwright attempt created `test-results/.last-run.json`; that session-owned generated file was deleted immediately and is absent from the final Scope 1 status.

**Executed:** YES (current session)  
**Command:** `git --no-pager diff --check -- rlfx.js rldata.js fx-regime-universe.json scripts/selftest.mjs scripts/fetch-bars.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/feature-004-dirty-tree-collision.test.mjs tests/fixtures/fx-regime/commonjs-determinism-input.json tests/fixtures/fx-regime/foundation-cases.json tests/fixtures/fx-regime/foundation-harness.html`  
**Exit Code:** 0  
**Output:** empty stdout; the command completed with exit 0.  
**Result:** PASS

The final collision test reports 14 current `rldata.js` hunks containing all 11 baseline hashes, 7 current `scripts/selftest.mjs` hunks containing all 6 baseline hashes, and 6 current `scripts/fetch-bars.mjs` hunks containing all 5 baseline hashes. The three Feature 004 shared-file additions therefore remain distinct from every recorded baseline hunk.

## Test Evidence

Execution agents record the exact command, actual exit code, `Claim Source`, and full unfiltered output under the matching `TP-*` identifier. Scenario-first behavior records the focused failing assertion, the identical green assertion, and the broader regression command in that order.

### Scope 1 First RED - TP-01-01

**Phase:** implement  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** `node -e 'const assert=require("node:assert/strict");const input=require("./tests/fixtures/fx-regime/commonjs-determinism-input.json");const sentinel=Object.freeze({owner:"preexisting-global"});globalThis.RLFX=sentinel;delete require.cache[require.resolve("./rlfx.js")];const RLFX=require("./rlfx.js");assert.strictEqual(globalThis.RLFX,sentinel);const first=RLFX.computeCurrencyDecision(structuredClone(input));const second=RLFX.computeCurrencyDecision(structuredClone(input));assert.equal(first.computedAt,input.decisionTime);assert.equal(second.computedAt,input.decisionTime);assert.equal(RLFX.canonicalize(first),RLFX.canonicalize(second));assert.equal(first.decisionId,second.decisionId);console.log("PASS RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic")'`  
**Exit Code:** 1  
**Output:**

```text
node:internal/modules/cjs/loader:1572
    throw err;
    ^

Error: Cannot find module './tests/fixtures/fx-regime/commonjs-determinism-input.json'
Require stack:
- ~/research-lab/[eval]
        at Module._resolveFilename (node:internal/modules/cjs/loader:1568:15)
        at wrapResolveFilename (node:internal/modules/cjs/loader:1122:27)
        at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1146:10)
        at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1173:12)
        at Module._load (node:internal/modules/cjs/loader:1345:5)
        at wrapModuleLoad (node:internal/modules/cjs/loader:260:19)
        at Module.require (node:internal/modules/cjs/loader:1689:12)
        at require (node:internal/modules/helpers:191:16)
```

**Result:** EXPECTED RED. The exact planned command failed before either the controlled fixture or `rlfx.js` existed.

### Scope 1 First GREEN - TP-01-01

**Phase:** implement  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** identical TP-01-01 command above  
**Exit Code:** 0  
**Output:**

```text
PASS RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
```

**Result:** PASS. CommonJS returned the production API without replacing the sentinel global; both complete inputs retained the explicit `computedAt`, canonical output, and decision ID.

### Scope 1 Production Module And Selftest - TP-01-02, TP-01-03, TP-01-05 Through TP-01-12, TP-01-21

**Phase:** implement  
**Claim Source:** executed

The first post-implementation selftest run exposed one Feature 004 test defect: the policy-proxy assertion treated the required limitation wording "not executable" as an executable-carry claim. The test was reconciled to the planned typed union (`subtype` absent, `roll: not-applicable`, `liquidity: not-observed`, `cost: not-observed`) without weakening the production contract. The identical repository command was rerun immediately.

**Executed:** YES (current session)  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 0  
**Observed Feature 004 output and terminal summary:**

```text
Feature 004 RLFX/RLDATA foundation
    ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
    ✓ RLFX universe is bounded closed and asserts no live source authorization
    ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
    ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
    ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
    ✓ RLFX cohort rank requires one full-graph exact-date window
    ✓ RLFX orientation and inverse relationship contracts count one economic edge
    ✓ RLFX cohort and managed-reference eligibility never pool or auto-elevate
    ✓ RLFX pair momentum and Policy-rate proxy remain distinct evidence
    ✓ RLFX CarryReadV1 rejects every incomplete market-implied branch
    ✓ RLFX value and delayed positioning preserve semantics clocks and unavailable states
    ✓ RLFX carry unwind and event absence retain multi-family rules and market invalidation
    ✓ RLFX rights gate strips restricted numeric values from public projections

================================================
Research-Lab self-test: 358 passed, 0 failed
================================================
```

**Result:** PASS. `BASE-SEC-01`, `BASE-SEC-02`, `BASE-SEC-03`, and the current Market Brief/Bond payload assertion all passed unchanged. The planning-time 344/1 baseline is no longer present in this worktree and is not an unresolved finding from this run.

### Scope 1 Browser Functional - TP-01-04 Through TP-01-12

**Phase:** implement  
**Claim Source:** executed

The committed suite uses `startStaticServer()`, ordinary same-origin fixture GETs, and real production `/rldata.js` plus `/rlfx.js`; it contains no request interception, `skip`, or `only` marker. The exact planned runner command is currently unavailable because this checkout has no local Playwright package and `npx --no-install` correctly refuses package acquisition.

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "^Browser functional" --reporter=list`  
**Exit Code:** 1  
**Output:**

```text
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
npm error A complete log of this run can be found in the local npm cache log directory
```

**Result:** BLOCKED BEFORE TEST DISCOVERY under the exact command. This output is not a product-test failure and cannot satisfy TP-01-04.

Supplemental current-session execution used the repository's existing `loadPlaywright()` and `startStaticServer()` support with real Chrome. The temporary driver lived outside the repository, used no response interception, and executed the same committed harness, controlled fixture, `rldata.js`, and `rlfx.js` paths.

**Executed:** YES (current session)  
**Command:** `node /tmp/research-lab-feature004-browser-functional.mjs`  
**Exit Code:** 0  
**Output:**

```text
PASS Browser functional source envelopes match in browser and CommonJS for one decisionTime
PASS Browser functional SCN-004-001/002: Broad AFE EME and proxy states remain separate
PASS Browser functional SCN-004-003/005/008: cohort rank uses one full-graph exact-date window
PASS Browser functional SCN-004-004: explicit orientation and inverse sources count one relationship
PASS Browser functional SCN-004-006/007: cohort and managed-reference eligibility never pool
PASS Browser functional SCN-004-009/010: pair momentum and Policy-rate proxy remain distinct
PASS Browser functional SCN-004-011: CarryReadV1 rejects every incomplete market-implied branch
PASS Browser functional SCN-004-012/013/014: value and positioning retain semantics and clocks
PASS Browser functional SCN-004-015/016/024: unwind and event absence retain multi-family rules and safe projection
Browser functional summary: 9 passed, 0 failed
```

**Result:** PASS as supplemental real-browser functional evidence. It does not convert the required exact `npx --no-install` command to green.

### Scope 1 Provider And Cross-Tool Canaries - TP-01-13 Through TP-01-20

**Phase:** implement  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** `node --test tests/provider-credentials.unit.mjs`  
**Exit Code:** 0  
**Output:**

```text
✔ unknown and prototype-shaped provider ids fail without mutation
✔ approved credentials share one versioned same-tab envelope
✔ verified header provider builds a secret-free URL and no query fallback
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS.

**Executed:** YES (current session)  
**Command:** `node --test tests/provider-credentials.functional.mjs`  
**Exit Code:** 0  
**Output:**

```text
✔ consent migration writes verifies scrubs and fails closed atomically
✔ clear all erases session and every known durable legacy location
✔ tool routes cannot migrate erase or clear provider credentials
✔ adversarial scrub failure clears staged session credentials and reports no values
✔ auth failure never retries with a credential query parameter
✔ adversarial credential-like query names and encoded sentinels never enter request URLs
✔ Twelve Data remains disabled without authorization evidence
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ skipped 0
```

**Result:** PASS.

**Executed:** YES (current session)  
**Command:** `node tests/provider-credentials.stress.mjs`  
**Exit Code:** 0  
**Output:**

```text
BUG001_STRESS_BEGIN
CATEGORY=stress
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PRODUCTION_PAGE=index.html
PRODUCTION_OWNER=rldata.js+rlapp.js
CYCLES=250
RELOADS=10
NAVIGATION_CYCLES=25
PROVIDER_FAILURE_CASES=50
SESSION_STORE_BOUNDED=true
RENDERED_SENTINELS=0
DIAGNOSTIC_SENTINELS=0
RESULT=PASS
BUG001_STRESS_END
```

**Result:** PASS.

**Executed:** YES (current session)  
**Command:** `node tests/provider-credentials.load.mjs`  
**Exit Code:** 0  
**Output:**

```text
BUG001_LOAD_BEGIN
CATEGORY=load
SERVER=ephemeral-same-origin-http
BROWSER=existing-chromium-compatible-executable
PARALLEL_CONTEXTS=8
PAGES_PER_CONTEXT=2
TOTAL_PAGES=16
REGISTERED_PAGES=18
REGISTRY_SOURCE_OFFENDERS=0
REGISTRY_RUNTIME_ERRORS=0
UNVERIFIED_PROVIDER_REQUESTS=0
PRIMARY_CONFIGURED=8
INDEPENDENT_CONFIGURED=0
DURABLE_CREDENTIAL_STORES=0
CROSS_TAB_TRANSFERS=0
RESULT=PASS
BUG001_LOAD_END
```

**Result:** PASS.

The exact provider, Bond, and Causal browser commands each exited 1 before discovery with the same missing-package refusal:

```text
npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list
npx --no-install playwright test tests/bond-regime-lab.spec.mjs --reporter=list
npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --reporter=list
npm error npx canceled due to missing packages and no YES option: ["playwright@1.61.1"]
```

These three required browser canaries remain **not run** under their planned commands.

**Executed:** YES (current session)  
**Command:** `node scripts/validate-causal-rotation.mjs`  
**Exit Code:** 0  
**Output:**

```text
[causal-contract] validating production foundation and committed records
    PASS RLCausal API is frozen
    PASS SHA-256 implementation passes the abc reference vector
    PASS CausalConfig/v1 is valid with no implicit policy defaults
    PASS committed observation set is source-complete and digest-valid
    PASS all observation availability times are conservative
    PASS unsupported valuation and revision categories remain explicitly unavailable
    PASS later evidence is excluded with CR-TIME-INELIGIBLE
    PASS frozen decision bytes remain unchanged after later evidence
    PASS same inputs produce byte-equivalent normalized snapshots
    PASS evaluator calls do not mutate config observations or input arrays
[causal-contract] checks passed: 39
[causal-contract] checks failed: 0
[causal-contract] candidates: 5
[causal-contract] source observations: 6
[causal-contract] adversarial fixtures: 8
[causal-contract] result: PASS
```

**Result:** PASS.

### Scope 1 Collision Proof - TP-01-22

**Phase:** implement  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 0  
**Output:**

```text
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6910.144959
```

The command's structured output also enumerated all 11 tracked paths, all recorded hunk counts, the unchanged validator 137-line prefix SHA-256 `78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f`, and `volatileEditAttemptedByScopeOne: false`.

**Result:** PASS.

### Scope 1 Test-Phase Browser Recheck - 2026-07-15

**Phase:** test  
**Claim Source:** executed

The checkout-local runner is now available at the exact source-locked version. No package installation was performed.

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright --version`  
**Exit Code:** 0  
**Output:**

```text
Version 1.61.1
```

**Result:** PASS.

#### TP-01-04 Exact Browser Functional Command

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "^Browser functional" --reporter=list`  
**Exit Code:** 1  
**Output:**

```text
Error: No tests found.
Make sure that arguments are regular expressions matching test files.
You may need to escape symbols like "$" or "*" and quote the arguments.
```

**Result:** FAIL BEFORE TEST EXECUTION. The package-resolution blocker is obsolete, but the literal anchored filter selects zero tests under Playwright 1.61.1.

The same committed file was listed without the anchored grep to distinguish runner discovery from the command filter:

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --list --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Listing tests:
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:34:1 › Browser f
unctional source envelopes match in browser and CommonJS for one decisionTime
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:94:1 › Browser f
unctional SCN-004-001/002: Broad AFE EME and proxy states remain separate
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:106:1 › Browser
functional SCN-004-003/005/008: cohort rank uses one full-graph exact-date windo
w
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:140:1 › Browser
functional SCN-004-004: explicit orientation and inverse sources count one relat
ionship
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:158:1 › Browser
functional SCN-004-006/007: cohort and managed-reference eligibility never pool
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:193:1 › Browser
functional SCN-004-009/010: pair momentum and Policy-rate proxy remain distinct
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:226:1 › Browser
functional SCN-004-011: CarryReadV1 rejects every incomplete market-implied bran
ch
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:253:1 › Browser
functional SCN-004-012/013/014: value and positioning retain semantics and clock
s
    [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:286:1 › Browser
functional SCN-004-015/016/024: unwind and event absence retain multi-family rul
es and safe projection
Total: 9 tests in 1 file
```

The narrow diagnostic rerun removed only the invalid start anchor. It is supplemental evidence and does not satisfy the literal TP-01-04 command row.

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --grep "Browser functional" --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 9 tests using 1 worker

    ✓  1 …rce envelopes match in browser and CommonJS for one decisionTime (701ms)
    ✓  2 … SCN-004-001/002: Broad AFE EME and proxy states remain separate (195ms)
    ✓  3 …4-003/005/008: cohort rank uses one full-graph exact-date window (531ms)
    ✓  4 … explicit orientation and inverse sources count one relationship (216ms)
    ✓  5 …004-006/007: cohort and managed-reference eligibility never pool (336ms)
    ✓  6 …004-009/010: pair momentum and Policy-rate proxy remain distinct (255ms)
    ✓  7 …-011: CarryReadV1 rejects every incomplete market-implied branch (187ms)
    ✓  8 …4-012/013/014: value and positioning retain semantics and clocks (279ms)
    ✓  9 … and event absence retain multi-family rules and safe projection (361ms)

    9 passed (4.5s)
```

**Result:** PASS as supplemental behavior evidence only.

#### TP-01-15 Provider Browser Canary

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 12 tests using 1 worker

    ✓   1 … real index loads RLDATA before RLAPP with one credential editor (1.1s)
    ✓   2 … Regression BUG-001: only index can mutate provider credentials (297ms)
    ✓   3 …etains credentials and an independently opened tab starts empty (787ms)
    ✓   4 … BUG-001: save blanks fields and exposes configured status only (463ms)
    ✓   5 …uire consent and successful migration scrubs every durable copy (385ms)
    ✓   6 …1: unknown and prototype-shaped providers fail without mutation (225ms)
    ✓   7 …ession BUG-001: clear all removes active and legacy credentials (268ms)
    ✓   8 … credential never appears in DOM console errors URL or referrer (341ms)
    ✓   9 …every registered tool has no credential editor or storage writer (3.1s)
    ✓  10 …credential calls remain disabled without authorization evidence (226ms)
    ✓  11 …uth never places credentials in URLs or retries with query auth (197ms)
    ✓  12 …closes genuine rows without deleting noncredential rlData cache (272ms)

    12 passed (9.3s)
```

**Result:** PASS with zero skipped tests.

#### TP-01-18 Bond Browser Canary

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 26 tests using 1 worker

    ✓   1 …mjs:80:1 › BS-001 duration-driven ratio improvement stays mixed (354ms)
    ✓   2 … › BS-002 aligned ratios plus OAS confirmation are constructive (484ms)
    ✓   3 …1 › BS-003 tight but widening keeps level and momentum separate (425ms)
    ✓   4 …ec.mjs:133:1 › BS-010 latest common date excludes unmatched leg (281ms)
    ✓   5 …:142:1 › BS-004 bull steepener retains defensive credit context (215ms)
    ✓   6 ….mjs:155:1 › BS-005 bear steepener penalizes long duration most (231ms)
    ✓   7 …curve inversion alone leaves duration balanced or indeterminate (338ms)
    ✓   8 …js:177:1 › BS-006 six month mixed shock decomposes every sleeve (280ms)
    ✓   9 …S-007 oversized shock preserves estimate and lowers reliability (245ms)
    ✓  10 …97:1 › BS-008 stale characteristic remains visible and unranked (235ms)
    ✓  11 …reject nonfinite input and persist only allowlisted assumptions (412ms)
    ✓  12 …nd official nominal headers or explicit unavailable source state (6.6s)
    ✓  13 …7:1 › BS-009 optional macro outage leaves truthful partial read (361ms)
    ✓  14 …c.mjs:270:1 › BS-013 restricted observation remains memory only (302ms)
    ✓  15 …rst refresh preserves successful families when one source fails (569ms)
    ✓  16 … restricted endpoint or raw observation persistence path exists (544ms)
    ✓  17 …spec.mjs:317:1 › BS-011 Simple and Power share one model digest (390ms)
    ✓  18 …-012 lever change recomputes without fetch or observed mutation (259ms)
    ✓  19 …mjs:348:1 › BS-014 partial data is keyboard and text equivalent (347ms)
    ✓  20 …Regime tool publishes one owner read without restricted payload (445ms)
    ✓  21 … nonblank synchronous and text equivalent on desktop and mobile (587ms)
    ✓  22 …stale error and large-shock layouts contain text without overlap (1.5s)
    ✓  23 …r ratio window sleeve focus and restored preferences stay local (344ms)
    ✓  24 …xpose return risk drawdown and trend when history is sufficient (338ms)
    ✓  25 …nfig cache and reachable public sources without uncaught errors (213ms)
    ✓  26 …andmarks names focus and noncolor states at 390 and 1440 widths (370ms)

    26 passed (17.7s)
```

**Result:** PASS with zero skipped tests.

#### TP-01-19 Causal Browser Canary

**Executed:** YES (current session)  
**Command:** `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 4 tests using 1 worker

    ✓  1 …d causal contracts preserve explicit stale and unavailable states (45ms)
    ✓  2 …idence available after a decision is excluded from that decision (318ms)
    ✓  3 …gression: One announcement drives price options and ETF activity (180ms)
    ✓  4 …on-critical valuation and timing inputs are stale or unavailable (178ms)

    4 passed (1.7s)
```

**Result:** PASS with zero skipped tests.

#### Scope 1 Test Quality And Authenticity

**Executed:** YES (current session)  
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/fx-regime-relative-value-lab.spec.mjs tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 0  
**Output:**

```text
============================================================
    BUBBLES REGRESSION QUALITY GUARD
    Repo: /Users/redacted/Projects/research-lab
    Timestamp: 2026-07-15T05:04:54Z
    Bugfix mode: false
============================================================

ℹ️  Scanning tests/fx-regime-relative-value-lab.spec.mjs
ℹ️  Scanning tests/feature-004-dirty-tree-collision.test.mjs

============================================================
    REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
    Files scanned: 2
============================================================
```

**Result:** PASS.

**Executed:** YES (current session)  
**Command:** `files=(tests/fx-regime-relative-value-lab.spec.mjs tests/feature-004-dirty-tree-collision.test.mjs); failures=0; check_clean() { local label="$1"; local pattern="$2"; printf 'CHECK %s\n' "$label"; grep -nE "$pattern" "${files[@]}"; local grep_exit=$?; if [[ "$grep_exit" -eq 1 ]]; then printf 'PASS %s: zero matches\n' "$label"; elif [[ "$grep_exit" -eq 0 ]]; then printf 'FAIL %s: prohibited matches found\n' "$label"; failures=$((failures + 1)); else printf 'ERROR %s: grep exit %s\n' "$label" "$grep_exit"; exit "$grep_exit"; fi; }; printf 'SCOPE1_TEST_AUDIT_BEGIN\n'; printf 'FILES_SCANNED=%s\n' "${#files[@]}"; check_clean request-interception 'page\.route|context\.route|route\.fulfill|route\.abort|cy\.intercept|intercept\(|msw|nock|wiremock|responses'; check_clean skip-exclusive-todo 't\.Skip|\.skip\(|xit\(|xdescribe\(|\.only\(|test\.todo|it\.todo|pending\('; check_clean mock-frameworks 'jest\.fn|sinon\.stub|sinon|mock\('; check_clean proxy-status-only 'expect\(.*status.*\)\.toBe\((200|201|204)\)'; check_clean silent-bailout 'if[[:space:]]*\([^)]*\)[[:space:]]*\{?[[:space:]]*return[[:space:]]*;'; printf 'FX_TEST_DECLARATIONS=%s\n' "$(grep -c '^test(' tests/fx-regime-relative-value-lab.spec.mjs)"; printf 'FX_EXPECT_ASSERTIONS=%s\n' "$(grep -c 'expect(' tests/fx-regime-relative-value-lab.spec.mjs)"; printf 'AUDIT_FAILURES=%s\n' "$failures"; printf 'SCOPE1_TEST_AUDIT_END\n'; [[ "$failures" -eq 0 ]]`  
**Exit Code:** 0  
**Output:**

```text
SCOPE1_TEST_AUDIT_BEGIN
FILES_SCANNED=2
CHECK request-interception
PASS request-interception: zero matches
CHECK skip-exclusive-todo
PASS skip-exclusive-todo: zero matches
CHECK mock-frameworks
PASS mock-frameworks: zero matches
CHECK proxy-status-only
PASS proxy-status-only: zero matches
CHECK silent-bailout
PASS silent-bailout: zero matches
FX_TEST_DECLARATIONS=9
FX_EXPECT_ASSERTIONS=62
AUDIT_FAILURES=0
SCOPE1_TEST_AUDIT_END
```

**Result:** PASS. The committed functional suite starts the real ephemeral HTTP server, loads `foundation-harness.html`, and that harness loads production `rldata.js` and `rlfx.js`. Its assertions exercise normalization, rights erasure, broad-dollar classification, full-graph alignment, orientation, cohort eligibility, pair conflict logic, carry schema rejection, positioning clocks, unwind state, and public projection; they do not assert fixture pass-through values.

**Claim Source:** interpreted  
**Interpretation:** The clean mechanical scans establish the absence of interception, mocks, bailouts, and skips. Inspection of the executed test data paths establishes that fixture values are inputs to production `RLFX`/`RLDATA` transformations and that assertions target computed classifications, rejected schemas, erased restricted values, exact-date coverage, and conflict/state transitions rather than an identity or fixture echo. This interpretation remains available for audit review.

#### Scope 1 Collision Recheck

**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1  
**Output:**

```text
{
    "untrackedPath": "scripts/validate-brief-payload.mjs",
    "prefixLineChunks": 137,
    "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa78
70f",
    "volatilePath": "market-brief.config.json",
    "volatileEditAttemptedByScopeOne": false
}
✖ Feature 004 preserves every pre-existing dirty hunk (85.143834ms)
✔ Feature 004 preserves the untracked validator prefix and volatile config bound
ary (9.736291ms)
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 195.982

✖ failing tests:

test at tests/feature-004-dirty-tree-collision.test.mjs:61:1
✖ Feature 004 preserves every pre-existing dirty hunk (85.143834ms)
    AssertionError [ERR_ASSERTION]: scripts/selftest.mjs preserves every recorded
hunk body as a distinct hunk
    + actual - expected

    + [
    +   'ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc'
    + ]
    - []
```

**Result:** FAIL. This session did not edit `scripts/selftest.mjs`; the current worktree has absorbed or changed one report-recorded baseline hunk. The user/concurrent bytes are preserved and no reset, checkout, stash, clean, staging, or collision-test weakening was performed.

#### Test-Phase Finding Reconciliation

**Claim Source:** interpreted  
**Interpretation:** The paired exact-command failure, successful nine-test discovery listing, and 9/9 unanchored execution isolate TP-01-04 to the start-anchored filter contract rather than package resolution or missing test declarations. The collision disposition is taken directly from the guard output; ownership routing follows the artifact boundaries in `scopes.md` and `state.json`.

- `F004-PW-001` remains open in revised form. The missing-package cause is resolved (`Version 1.61.1`), and three exact canary commands pass, but the exact TP-01-04 command exits 1 with zero selected tests because its start-anchored grep does not match Playwright's full title path. The unanchored diagnostic is 9/9 green but cannot replace the planned literal command.
- `F004-REALITY-001` is preserved unchanged for its credential/security or gate owner. This test phase did not edit `rldata.js` or rerun the implementation reality scan.
- `F004-PLAN-001` is preserved unchanged for `bubbles.plan`. This test phase did not alter `spec.md`, `design.md`, `scopes.md`, `test-plan.json`, or `scenario-manifest.json`.
- `F004-COLLISION-001` is newly open. The collision validator reports that baseline selftest hunk `ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc` is no longer a distinct current diff hunk. The current unstaged user/concurrent content remains untouched.

No Scope 1 checkbox, DoD description, certification field, framework file, package manifest, Scope 2+ product file, spec 005 artifact, or unrelated dirty path was changed by this test phase.

## Scenario Contract Evidence

| Scenario | Scope | Planned production proof | Evidence anchor |
| --- | --- | --- | --- |
| SCN-004-001 | SCOPE-01 | Broad/AFE/EME separation in production RLFX and FX route | `report.md#scenario-scn-004-001` |
| SCN-004-002 | SCOPE-01 | Official/proxy divergence without averaging | `report.md#scenario-scn-004-002` |
| SCN-004-003 | SCOPE-01 | Rising USD pair cannot fake multi-peer strength | `report.md#scenario-scn-004-003` |
| SCN-004-004 | SCOPE-01 | Explicit orientation and inverse deduplication | `report.md#scenario-scn-004-004` |
| SCN-004-005 | SCOPE-01 | Exact dates and unmatched newest observations | `report.md#scenario-scn-004-005` |
| SCN-004-006 | SCOPE-01 | Separate G10/liquid-EM rank and pair selection | `report.md#scenario-scn-004-006` |
| SCN-004-007 | SCOPE-01 | Managed low-vol currency remains reference-only | `report.md#scenario-scn-004-007` |
| SCN-004-008 | SCOPE-01 | Insufficient peers produce no rank | `report.md#scenario-scn-004-008` |
| SCN-004-009 | SCOPE-01 | Momentum/carry conflict remains named | `report.md#scenario-scn-004-009` |
| SCN-004-010 | SCOPE-01 | Policy-rate proxy excludes executable-carry language | `report.md#scenario-scn-004-010` |
| SCN-004-011 | SCOPE-01 | Market-implied carry requires complete lineage | `report.md#scenario-scn-004-011` |
| SCN-004-012 | SCOPE-01 | REER tension cannot time a tactical reversal | `report.md#scenario-scn-004-012` |
| SCN-004-013 | SCOPE-01 | Positioning retains Tuesday and Friday clocks | `report.md#scenario-scn-004-013` |
| SCN-004-014 | SCOPE-01 | Missing positioning is not uncrowded | `report.md#scenario-scn-004-014` |
| SCN-004-015 | SCOPE-01 | Carry unwind requires multiple evidence families | `report.md#scenario-scn-004-015` |
| SCN-004-016 | SCOPE-01 | Missing events preserve market invalidation | `report.md#scenario-scn-004-016` |
| SCN-004-017 | SCOPE-02 | Cache-first partial production page paint | `report.md#scenario-scn-004-017` |
| SCN-004-018 | SCOPE-02 | Control changes produce zero requests | `report.md#scenario-scn-004-018` |
| SCN-004-019 | SCOPE-02 | Simple/Power/mobile/toolRead decision parity | `report.md#scenario-scn-004-019` |
| SCN-004-020 | SCOPE-03 | USD/local/translation/interaction decomposition | `report.md#scenario-scn-004-020` |
| SCN-004-021 | SCOPE-03 | FX reversal cannot change Global score/rank | `report.md#scenario-scn-004-021` |
| SCN-004-022 | SCOPE-03 | Missing FX preserves USD leadership | `report.md#scenario-scn-004-022` |
| SCN-004-023 | SCOPE-04 | Current-owner relationship only; no third composite | `report.md#scenario-scn-004-023` |
| SCN-004-024 | SCOPE-01 | Restricted value absent from public state | `report.md#scenario-scn-004-024` |
| SCN-004-025 | SCOPE-02 | Keyboard/pointer/canvas/mobile/desktop equivalence | `report.md#scenario-scn-004-025` |
| SCN-004-026 | SCOPE-02 | Registry parity and current toolRead | `report.md#scenario-scn-004-026` |

## Coverage Report

Coverage evidence is recorded by execution and test owners against the 26 scenario contracts and 78 test identifiers. Planned tests must assert production-computed outcomes rather than values merely copied from fixture setup.

## Lint And Quality

Planning-owned artifact, freshness, capability-foundation, traceability, and diff checks are recorded here only when actually executed. Delivery reality and state-transition results remain nonterminal until implementation and evidence exist.

## Uncertainty Declarations

This planning repair introduces no new execution claim. The execution-owner uncertainty and evidence records below are preserved verbatim; current planning truth is carried by `scopes.md`, `scenario-manifest.json`, and the active inventory in `test-plan.json`.

### Scope 1 Implementation Uncertainty

**Claim Source:** executed

- `F004-PW-001`: the four exact `npx --no-install playwright ...` commands required by Scope 1 cannot resolve Playwright 1.61.1 in this checkout and exit before test discovery. The committed Feature 004 suite is discoverable by the already-cached runner and the real-Chrome supplemental functional probe passed, but required exact-command browser evidence is absent.
- `F004-REALITY-001`: `implementation-reality-scan.sh --verbose` reports five sensitive-client-storage findings in pre-existing protected `rldata.js` credential-migration hunks. Feature 004 preserved those hunks byte-for-byte; provider unit, functional, stress, and load canaries pass. The finding requires the credential/security owner or gate owner to classify rather than a Feature 004 rewrite.
- `F004-PLAN-001`: the reality scan reports that `scopes.md` yielded zero implementation files and fell back to 20 paths from `design.md`. The path references are planning-owned. This implementation phase did not rewrite the plan.

Unchecked Scope 1 DoD mapping:

- **Independent shared-consumer canary and rollback/restore proof:** unchecked because provider/Bond/Causal browser canaries did not execute under the planned runner. Supplemental Feature 004 browser proof cannot substitute for those independent suites. **Claim Source:** not-run.
- **TP-01-04 browser/CommonJS envelope parity:** unchecked because the exact `CMD-BROWSER-FUNCTIONAL` command stopped at package resolution. Supplemental real-Chrome parity passed but does not satisfy the command row. **Claim Source:** not-run.
- **TP-01-15 provider browser canary:** unchecked because the exact command stopped at package resolution. **Claim Source:** not-run.
- **TP-01-18 Bond browser canary:** unchecked because the exact command stopped at package resolution. **Claim Source:** not-run.
- **TP-01-19 Causal browser canary:** unchecked because the exact command stopped at package resolution. **Claim Source:** not-run.

Scope 1 therefore remains In Progress and is not claimed Done.

## Spot-Check Recommendations

Audit owns evidence spot checks after execution. Planning identifies the highest-risk proof targets as raw-FX score invariance, exact-date exclusion, rights-value erasure, stale-owner synthesis refusal, and Simple/Power/browser/CommonJS identity.

## Validation Summary

Validation owners append current governance and product command evidence here. Planning leaves spec status and certification unchanged.

### Scope 1 Implement-Time Checks - 2026-07-14

**Claim Source:** executed

| Command | Exit | Result |
| --- | ---: | --- |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/004-fx-regime-relative-value-lab 'SCN-004-[0-9]{3}'` | 0 | PASS; deprecated state-field warnings are planning/state-owned |
| `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/004-fx-regime-relative-value-lab` | 0 | PASS; 0 failures, 0 warnings |
| `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/004-fx-regime-relative-value-lab` | 0 | PASS; G094 grandfather note because `createdAt` is absent |
| `bash .github/bubbles/scripts/regression-quality-guard.sh tests/fx-regime-relative-value-lab.spec.mjs tests/feature-004-dirty-tree-collision.test.mjs` | 0 | PASS; 0 violations, 0 warnings |
| Scope 1 path-scoped `git diff --check` | 0 | PASS; empty stdout |
| Editor diagnostics on all ten touched product/test files | 0 | PASS; no errors |
| `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/004-fx-regime-relative-value-lab --verbose` | 1 | BLOCKED by five pre-existing credential-hunk findings plus one planning warning; routed as `F004-REALITY-001` and `F004-PLAN-001` |

No validation or certification authority was exercised, and `certification.*` remains untouched.

## Security Review Evidence - F004-REALITY-001

**Phase:** security  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/004-fx-regime-relative-value-lab --verbose`  
**Exit Code:** 1  
**Output:**

```text
INFO: Resolved 8 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---

--- Scan 1B: Handler / Endpoint Execution Depth ---

--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---

--- Scan 1D: External Integration Authenticity ---

--- Scan 2: Frontend Hardcoded Data Patterns ---

--- Scan 2B: Sensitive Client Storage ---
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:174
     Context:       var central = JSON.parse(localStorage.getItem("rlApiKeys") || "null");
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
     Context:     try { localStorage.removeItem("rlApiKeys"); if (localStorage.getItem("rlApiKeys") !== null) remaining.push("central-store"); }
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:66
     Context:   var _mem = null;   /* in-memory source of truth - keeps the session working even when localStorage is full (QuotaExceededError) */
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:108
     Context:     try { return (typeof sessionStorage !== "undefined" && sessionStorage) ? sessionStorage : null; }
VIOLATION [SENSITIVE_CLIENT_STORAGE] rldata.js:203
     Context:     try { localStorage.removeItem("rlApiKeys"); if (localStorage.getItem("rlApiKeys") !== null) remaining.push("central-store"); }

--- Scan 3: Frontend API Call Absence ---

--- Scan 4: Prohibited Simulation Helpers in Production ---

--- Scan 5: Default/Fallback Value Patterns ---

--- Scan 6: Live-System Test Interception ---
INFO: No live-system test files referenced in scope artifacts for interception scan

--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---

--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
    IMPLEMENTATION REALITY SCAN RESULT
============================================================

    Files scanned:  8
    Violations:     5
    Warnings:       0

BLOCKED: 5 source code reality violation(s) found
```

**Result:** BLOCKED. The five emitted rows contain two genuine sensitive-storage paths and three mechanical false positives. Pre-existing ownership does not alter either classification.

### One-To-One Finding Classification

**Claim Source:** interpreted  
**Interpretation:** The classification follows the executed scanner output through the current production symbols and committed provider tests. A row is genuine only when the current call graph reads, stages, persists, or consumes a provider credential. Comment-only non-secret cache text and verified deletion/readback are not credential persistence.

| Emitted row | Classification | Evidence and disposition |
| --- | --- | --- |
| `rldata.js:174` | **Genuine - High - OWASP A02/A07** | `collectLegacyCredentials()` reads raw `localStorage.rlApiKeys` values into `found`; `detectLegacyCredentials()` retains those raw values in `_legacyDetection.credentials`; `migrateLegacyCredentials()` copies them through `writeCredentialEnvelope()`. The UI is redacted, but the value path is not. Durable credential access and activation remain blocking. |
| `rldata.js:203` first emission | **Mechanical false positive** | `scrubLegacyCredentials()` calls `removeItem("rlApiKeys")` and then reads only to verify absence. It does not persist, activate, return, or transmit a credential. Preserve the verified scrub behavior. |
| `rldata.js:66` | **Mechanical false positive** | The line is an inline comment on `_mem`, the in-memory mirror of non-secret `localStorage.rlData` market/cache state loaded through `KEY = "rlData"`. Credential values use a separate owner and have no data flow into `_mem`. Preserve the non-secret cache. |
| `rldata.js:108` | **Genuine - High - OWASP A02/A07** | `storageSurface()` returns browser `sessionStorage`; `setKey()` passes provider API-key values to `writeCredentialEnvelope()`, which executes `store.setItem(CREDENTIAL_STORE_KEY, ...)`; `getKey()` reads them and `buildProviderRequest()` places the Finnhub value in `X-Finnhub-Token`. This is sensitive third-party trust material in a prohibited client store under the installed policy. |
| `rldata.js:203` second emission | **Mechanical duplicate false positive** | The same cleanup line is emitted by two lexical patterns. It is one removal/readback operation, not a second storage event. |

The three false-positive rows do not clear the gate because the two genuine paths remain. The installed lexical scanner also misses the indirect `store.setItem(CREDENTIAL_STORE_KEY, ...)` persistence call, so reducing the result to emitted-line counting would understate the live path.

### Security Decision And Owner Route

The existing `specs/_bugs/BUG-001-central-provider-credential-security` packet is `in_progress`, but its active requirements make same-tab `sessionStorage` mandatory. That requirement conflicts with the installed absolute client-storage policy and must be reconciled by the bug/design/plan owners before source or test remediation. Feature 004 explicitly protects credential behavior and does not authorize this shared-infrastructure redesign.

```yaml
routeVersion: 1
findingId: F004-REALITY-001
outcome: route_required
severity: high
owasp: [A02, A07]
targetOwner: bubbles.bug
targetArtifact: specs/_bugs/BUG-001-central-provider-credential-security
requiredAction: Re-enter BUG-001 planning because its same-tab sessionStorage success contract is incompatible with the current absolute policy and its dynamic multi-provider envelope cannot receive an exact low-privilege provider classification.
trueFindings:
    - location: rldata.js:174
        symbol: collectLegacyCredentials
        path: collectLegacyCredentials -> detectLegacyCredentials -> _legacyDetection.credentials -> migrateLegacyCredentials -> writeCredentialEnvelope
        defect: Raw durable legacy provider credentials are read, staged, and activated instead of being erase-only material.
    - location: rldata.js:108
        symbols: [storageSurface, writeCredentialEnvelope, setKey, getKey, buildProviderRequest]
        path: index settings -> RLDATA.setKey -> sessionStorage rlSessionProviderCredentialsV1 -> RLDATA.getKey -> X-Finnhub-Token
        defect: A dynamic multi-provider credential object is persisted in sessionStorage and consumed as provider authentication material.
falsePositiveRows:
    - location: rldata.js:66
        reason: Inline comment on the non-secret rlData cache; no credential data flow.
    - location: rldata.js:203
        reason: Verified removeItem/readback cleanup; emitted twice by lexical patterns.
affectedConsumers:
    - rlapp.js:28-35,128-170 index-only editor, migration, erase, clear, and configured-status UI
    - index.html:421 data-settings mount
    - ai-capex-strategy-lab.html:2741-2742,2815,2874 Finnhub checks and provider fetch
    - etf-momentum-lab.html:2069-2070,2082 Finnhub checks and provider fetch
    - msft-july-print-model.html:1729-1733,1800 Finnhub checks and provider fetch
    - scripts/selftest.mjs:967-971 same-tab credential assertions
affectedTests:
    - tests/provider-credentials.unit.mjs
    - tests/provider-credentials.functional.mjs
    - tests/provider-credentials.spec.mjs
    - tests/provider-credentials.stress.mjs
    - tests/provider-credentials.load.mjs
    - tests/provider-credentials.support.mjs
    - tests/fx-regime-relative-value-lab.spec.mjs
blastRadius:
    - rldata.js is loaded across the static Research Lab and is a protected high-fan-out shared surface.
    - Removing the envelope changes landing-page status, reload/navigation behavior, three direct Finnhub consumers, legacy migration, clear-all, stress/load isolation, and Feature 004 provider canaries.
    - The non-secret rlData cache, source envelopes, tool reads, and all pre-existing dirty hunks must remain intact.
requiredSafeEndState:
    - No provider credential value exists in localStorage, sessionStorage, IndexedDB, Cache Storage, cookies, URL state, committed files, or another browser/client persistence surface under the installed policy.
    - Known durable legacy credentials are erase-only material: they are never activated, migrated into another client store, rendered, logged, returned, or transmitted.
    - Browser credential-backed provider transport remains disabled unless an owner-approved design keeps raw credentials outside prohibited client storage and preserves the closed provider/origin/header policy.
    - Non-secret localStorage.rlData market/cache behavior remains byte-compatible.
    - No project config approval is added for the current rlSessionProviderCredentialsV1 envelope: one dynamic object/key carries multiple providers, including browser-disabled providers, and cannot satisfy an exact path/key/provider tuple.
requiredCanaries:
    - Add scenario-first red proof for the prohibited current envelope before changing implementation.
    - Reconcile and run provider unit, functional, browser, stress, and load suites against the new safe contract.
    - Run node scripts/selftest.mjs and the Feature 004 browser-functional suite without weakening protected assertions.
    - Run the implementation reality scan and require zero genuine sensitive-storage findings; scanner cleanup/comment precision is independently owner-routed.
    - Run the Feature 004 collision validator and preserve F004-COLLISION-001 exactly until its owning collision repair closes it.
rollbackRequirements:
    - Capture a just-in-time rldata.js dirty-hunk/index baseline and make surgical edits only; no stash, reset, checkout, clean, broad formatting, staging, or wholesale replacement.
    - A failed credential repair must fail closed by disabling credential save/read/provider transport; rollback must not restore localStorage or sessionStorage credential persistence.
    - Re-run provider and collision canaries after rollback and prove all unrelated rldata.js, selftest, Feature 004, and user/concurrent hunks are unchanged.
secondaryRoutes:
    - owner: canonical Bubbles framework owner
        action: Deliver the semantic Scan 2B classifier through the supported release/upgrade path so inline comments, cleanup, scrubbed rewrites, indirect keys, and duplicate physical-line matches are classified correctly.
    - owner: project security/config owner
        action: Keep scans.sensitiveClientStorage approval absent for the current shared envelope; evaluate an exact tuple only after the installed policy and source design both authorize one statically resolved low-privilege provider.
```

### Collision Preservation - F004-COLLISION-001

**Phase:** security  
**Claim Source:** executed

**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1  
**Output:**

```text
{
    "untrackedPath": "scripts/validate-brief-payload.mjs",
    "prefixLineChunks": 137,
    "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
    "volatilePath": "market-brief.config.json",
    "volatileEditAttemptedByScopeOne": false
}
not ok 1 - Feature 004 preserves every pre-existing dirty hunk
ok 2 - Feature 004 preserves the untracked validator prefix and volatile config boundary
tests 2
pass 1
fail 1
cancelled 0
skipped 0
todo 0
AssertionError [ERR_ASSERTION]: scripts/selftest.mjs preserves every recorded hunk body as a distinct hunk
actual:
    ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc
expected: []
```

**Result:** FAIL with the same open `scripts/selftest.mjs` hunk identity already recorded as `F004-COLLISION-001`. This security review did not edit that file, the collision test, `rldata.js`, source/tests, planning text, framework-managed files, or certification state. The collision finding remains open and unchanged.

### Security Verdict

**VULNERABLE - HIGH.** `F004-REALITY-001` contains two genuine client-credential storage paths requiring BUG-001 planning reconciliation and implementation. Three mechanical rows are precisely accounted for and routed without suppressing the genuine paths. Scope 1 remains In Progress and no security phase completion claim is recorded.

## Audit Verdict

Audit owns this section after the required implementation, test, regression, validation, and documentation evidence exists.

## Test Phase Evidence - F004-COLLISION-001 Parser Remediation

### Focused Parser-Gap RED

**Phase:** test  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1  
**Output:**

```text
✖ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: rldata.js preserves every recorded hunk body as a distinct hunk
actual:
    e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6
    685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c
    11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908
    a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43
expected: []
```

**Result:** FAIL. The pre-edit guard rejected exactly the four plan-reviewed `rldata.js` superseded hashes because it parsed only the immutable baseline.

### Focused Post-Edit Collision Gate

**Phase:** test  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 1  
**Output:**

```text
✖ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: scripts/selftest.mjs preserves every recorded hunk body as a distinct hunk
actual:
    c412a7268a4ed3b6e9fe8aea49fd954e45ad2240d2c033daee9c2a0cc94961eb
    ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc
expected: []
```

**Result:** FAIL-CLOSED. The reviewed `rldata.js` replacement now validates, and the aggregate guard advances to the first non-superseded loss. A read-only full-set diagnostic confirmed all six `currentRldata` identity checks match and found exactly the five already-recorded unreviewed losses: the two hashes above plus `index.html` hashes `631ba96d2e0e396b1e49cd7a9b288b6ada1464d889c9ff7fd62a38fda75fcbd0`, `784e0fa7488dfea165fc6e4280cc93c2d1b4092582a8fbdf558d45a6712ee86b`, and `5e7199274d025114bfb9a1b9ae1d63fae602e3381506341c63ca8e89a5c003c1`. No source or planning checkpoint was changed.

### Regression Quality Guard

**Phase:** test  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 0  
**Output:**

```text
============================================================
    BUBBLES REGRESSION QUALITY GUARD
    Repo: /Users/redacted/Projects/research-lab
    Timestamp: 2026-07-15T22:07:10Z
    Bugfix mode: true
============================================================

Scanning tests/feature-004-dirty-tree-collision.test.mjs
Adversarial signal detected in tests/feature-004-dirty-tree-collision.test.mjs

============================================================
    REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
    Files scanned: 1
    Files with adversarial signals: 1
============================================================
```

**Result:** PASS. The parser remediation retains an adversarial, fail-closed collision contract with no bailout violation.

### Two-Stage Additive Overlay Parser GREEN - 2026-07-15

**Phase:** test  
**Claim Source:** executed

The focused RED and settled owner identity were supplied by the current frozen handoff. This evidence records the test-owner implementation of both additive overlays; it does not mark TP-01-22, Scope 1, Feature 004, Feature 006, or any certification state complete.

**Executed:** YES (current session)  
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`  
**Exit Code:** 0  
**Output:**

```text
{
    "contractVersion": "feature004-dirty-baseline/v1",
    "trackedPaths": [
        {
            "path": "rldata.js",
            "status": " M",
            "recordedHunks": 11,
            "currentHunks": 15
        },
        {
            "path": "scripts/selftest.mjs",
            "status": " M",
            "recordedHunks": 6,
            "currentHunks": 7
        },
        {
            "path": "scripts/fetch-bars.mjs",
            "status": " M",
            "recordedHunks": 5,
            "currentHunks": 6
        },
        {
            "path": "global-rotation-lab.html",
            "status": " M",
            "recordedHunks": 2,
            "currentHunks": 2
        },
        {
            "path": "index.html",
            "status": " M",
            "recordedHunks": 9,
            "currentHunks": 9
        },
        {
            "path": "rlnav.js",
            "status": " M",
            "recordedHunks": 3,
            "currentHunks": 3
        },
        {
            "path": "tools.json",
            "status": " M",
            "recordedHunks": 1,
            "currentHunks": 1
        },
        {
            "path": "market-brief.html",
            "status": " M",
            "recordedHunks": 8,
            "currentHunks": 8
        },
        {
            "path": "notes/market-brief.md",
            "status": " M",
            "recordedHunks": 8,
            "currentHunks": 8
        },
        {
            "path": "README.md",
            "status": " M",
            "recordedHunks": 9,
            "currentHunks": 9
        },
        {
            "path": "notes/README.md",
            "status": " M",
            "recordedHunks": 3,
            "currentHunks": 3
        }
    ]
}
{
    "untrackedPath": "scripts/validate-brief-payload.mjs",
    "prefixLineChunks": 137,
    "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
    "volatilePath": "market-brief.config.json",
    "volatileEditAttemptedByScopeOne": false
}
✔ Feature 004 preserves every pre-existing dirty hunk (312.349667ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (71.726625ms)
✔ Feature 004 preserves the untracked validator prefix and volatile config boundary (11.277333ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 462.618667
```

**Result:** PASS. The parser now hash-verifies and validates the baseline, independent `rldata.js` supersession, five-hash disposition, historical delta, and settled delta in order; only `scripts/selftest.mjs` hunk 7 is overlaid at either stage, current settled identity recomputes exactly, and the in-memory malformed overlay set fails closed without changing report or source bytes.

## Direct Canary Replay - 2026-07-17T00:39:24Z

**Phase:** test
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

The direct canary was executed before any evidence or routing edit. These are the pre-recording current-byte hashes and the complete unfiltered test-run output:

```text
FEATURE004_CURRENT_BYTES_BEGIN
bf44787182bdc0e70043e0ee3cb69a0d67b3b85db72878b82f26c4f72071331c  specs/004-fx-regime-relative-value-lab/state.json
dba9df01aa2b8365ca1fa5bdc589f691a8592f175340b8e3a3844ade5490576b  specs/004-fx-regime-relative-value-lab/scopes.md
6d208d49c90d1dc9fe15c048cab17ba364b471050da06fb456a58ddb4b0c94a5  specs/004-fx-regime-relative-value-lab/test-plan.json
fcf51297b4a9604161b00012483941f939779661824e17f132d8dfcaa50b578c  specs/004-fx-regime-relative-value-lab/report.md
07f5ac1e3c423d5f6bc232a9a97e94870e103b0e560c31201fec69758da4ad13  tests/feature-004-dirty-tree-collision.test.mjs
25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b  scripts/selftest.mjs
78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f  scripts/validate-brief-payload.mjs
 M scripts/selftest.mjs
 M specs/004-fx-regime-relative-value-lab/report.md
 M specs/004-fx-regime-relative-value-lab/scopes.md
 M specs/004-fx-regime-relative-value-lab/state.json
 M specs/004-fx-regime-relative-value-lab/test-plan.json
FEATURE004_CANARY_BEGIN
✖ Feature 004 preserves every pre-existing dirty hunk (52.870125ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (82.899541ms)
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (17.146166ms)
ℹ tests 3
ℹ suites 0
ℹ pass 1
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 208.800291

✖ failing tests:

test at tests/feature-004-dirty-tree-collision.test.mjs:1056:1
✖ Feature 004 preserves every pre-existing dirty hunk (52.870125ms)
    AssertionError [ERR_ASSERTION]: scripts/selftest.mjs complete current identity matches the reviewed disposition
    + actual - expected

        {
            hunkBodySha256: [
    +     '9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0'
    -     '83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc',
    -     '71752c795e40ccb663ceb0aa005516f9205fcd3a2fb118d0a2a725f8137e918c',
    -     'bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd',
    -     '2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227',
    -     '71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb',
    -     'b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794',
    -     '15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943'
            ],
    +   hunkCount: 1,
    +   indexOid: '484706d2f819971c298fd3dcef19e34915c4f052',
    -   hunkCount: 7,
    -   indexOid: '03a285cfa21b2f2e1b22b539ac0452094029c110',
            path: 'scripts/selftest.mjs',
            staged: false,
            status: ' M',
            unstaged: true,
    +   worktreeGitOid: 'f1f5d4c604efd6a46b4183408fd397202e650b6f',
    +   worktreeSha256: '25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b'
    -   worktreeGitOid: '484706d2f819971c298fd3dcef19e34915c4f052',
    -   worktreeSha256: 'f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8'
        }

            at assertCurrentPathIdentity (file:///Users/redacted/Projects/research-lab/tests/feature-004-dirty-tree-collision.test.mjs:1049:10)
            at Array.forEach (<anonymous>)
            at TestContext.<anonymous> (file:///Users/redacted/Projects/research-lab/tests/feature-004-dirty-tree-collision.test.mjs:1059:16)
            at Test.runInAsyncScope (node:async_hooks:226:14)
            at Test.run (node:internal/test_runner/test:1382:25)
            at Test.start (node:internal/test_runner/test:1242:17)
            at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
        generatedMessage: false,
        code: 'ERR_ASSERTION',
        actual: { path: 'scripts/selftest.mjs', status: ' M', staged: false, unstaged: true, indexOid: '484706d2f819971c298fd3dcef19e34915c4f052', worktreeGitOid: 'f1f5d4c604efd6a46b4183408fd397202e650b6f', worktreeSha256: '25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b', hunkCount: 1, hunkBodySha256: [ '9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0' ] },
        expected: { path: 'scripts/selftest.mjs', status: ' M', staged: false, unstaged: true, indexOid: '03a285cfa21b2f2e1b22b539ac0452094029c110', worktreeGitOid: '484706d2f819971c298fd3dcef19e34915c4f052', worktreeSha256: 'f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8', hunkCount: 7, hunkBodySha256: [ '83a1837a7297a0d693e058331561605f4dd36c6356faaa3819f9ee2ebb0bf9cc', '71752c795e40ccb663ceb0aa005516f9205fcd3a2fb118d0a2a725f8137e918c', 'bdd6e8b6980d7d285bc28654a0d888d14acc3c66b6f4c79c19f5bdbf5cc168cd', '2f3ac37a908b335327e6752c78d881949c5401c8b0b89ffe97ea7a726f9f0227', '71b0a4ec42bb329a73f03df68d253643e58a8eb44b0c2a82e053dd4e93d1b0eb', 'b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794', '15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943' ] },
        operator: 'deepStrictEqual',
        diff: 'simple'
    }

test at tests/feature-004-dirty-tree-collision.test.mjs:1166:1
✖ Feature 004 preserves the untracked validator prefix and volatile config boundary (17.146166ms)
    AssertionError [ERR_ASSERTION]: scripts/validate-brief-payload.mjs remains untracked and unstaged

    '' !== '??'

            at TestContext.<anonymous> (file:///Users/redacted/Projects/research-lab/tests/feature-004-dirty-tree-collision.test.mjs:1172:10)
            at Test.runInAsyncScope (node:async_hooks:226:14)
            at Test.run (node:internal/test_runner/test:1382:25)
            at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
            at Test.postRun (node:internal/test_runner/test:1522:19)
            at Test.run (node:internal/test_runner/test:1447:12)
            at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
        generatedMessage: false,
        code: 'ERR_ASSERTION',
        actual: '',
        expected: '??',
        operator: 'strictEqual',
        diff: 'simple'
    }
FEATURE004_CANARY_EXIT=1
FEATURE004_CANARY_END
```

### Current Mismatch And Route

- `F004-CURRENT-SCRIPT-IDENTITY-003`: the active Feature 004 checkpoint captures the earlier Feature 010 identity `855894dd0d466ef299667e4aaff02a6923482608` / `cb160b9a2e4860f17c89b875d3dc8eaf729bc974b7886d8c1da6d963fca97406` / hunk `8090d43820796759b0def54d4744290e0a5137710ebda91e1e25109e50942d50`. Current owner-settled Feature 010 bytes are `f1f5d4c604efd6a46b4183408fd397202e650b6f` / `25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b` / hunk `9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0`. The next required owner is `bubbles.plan` for one additive current-identity checkpoint; prior blocks remain immutable.
- `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002`: the test still asserts historical validator status `??`, while the approved current status is empty and the SHA-256 remains `78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f`. This remains `bubbles.test` owned after the planning checkpoint is current; the test was not edited in this invocation.

`TR-F004-SCRIPT-TRANSITIONS-TEST` remains pending. No Feature 004 scope, phase, status, or certification completion is claimed, and the gated BUG-003 replay was not started.

## Test Phase Owner-Settled Successor Acceptance - 2026-07-17T02:27:26Z

This section supersedes only the stale pending-route statement immediately above. It records the current `bubbles.test` parser adoption and direct canary. All seven predecessor blocks remain immutable; no product, Feature 010, BUG-003, BUG-002, planning, DoD, scope-status, feature-status, completed-phase, or certification byte is claimed complete here.

### Direct Collision Canary

**Phase:** test
**Claim Source:** executed
**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 0
**Output:**

```text
{
    "contractVersion": "feature004-dirty-collision-owner-settled-selftest/v1",
    "predecessorBlocksValidated": 7,
    "currentCheckpointPaths": [
        { "path": "rldata.js", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "scripts/selftest.mjs", "status": " M", "currentHunks": 1, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "scripts/fetch-bars.mjs", "status": "", "currentHunks": 0, "lastCommit": "56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3" },
        { "path": "global-rotation-lab.html", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "index.html", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "rlnav.js", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "tools.json", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "market-brief.html", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "notes/market-brief.md", "status": "", "currentHunks": 0, "lastCommit": "d7fd1d02e99c748ab5366c5a8e6de1192b24b823" },
        { "path": "README.md", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "notes/README.md", "status": "", "currentHunks": 0, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
        { "path": "scripts/validate-brief-payload.mjs", "status": "", "currentHunks": 0, "lastCommit": "932efdd9912bfc264ae96ded90f6410fe4cc5537" },
        { "path": "market-brief.config.json", "status": "", "currentHunks": 0, "lastCommit": "71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef" }
    ]
}
{
    "historicalUntrackedPath": "scripts/validate-brief-payload.mjs",
    "currentStatus": "",
    "currentBlobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
    "prefixLineChunks": 137,
    "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
    "volatilePath": "market-brief.config.json",
    "volatileEditAttemptedByScopeOne": false
}
✔ Feature 004 preserves every pre-existing dirty hunk (503.768208ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (597.504083ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (88.601292ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1238.042208
```

**Result:** PASS. The test validates all seven predecessor raw hashes and schemas before consuming exactly one owner-settled successor, recomputes all 13 path identities, accepts only the one-hunk Feature 010 overlay and tracked-clean validator transition, resolves the current Feature 010 owner/test provenance, and keeps every Feature 010, Feature 004, BUG-003, and BUG-002 completion claim false.

### Collision-Test Integrity Audit

**Phase:** test
**Claim Source:** executed and interpreted
**Interpretation:** The canonical guard directly proves the canary retains an adversarial fail-closed shape. The zero-match scans and source review confirm that assertions consume actual report bytes, Git object/status/diff output, current Feature 010 state/report provenance, and current file hashes rather than a test-authored success fixture.
**Command 1:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/feature-004-dirty-tree-collision.test.mjs`
**Command 2:** `file_path=tests/feature-004-dirty-tree-collision.test.mjs && failures=0 && printf 'COLLISION_TEST_INTEGRITY_BEGIN\n' && printf 'skipOnlyTodoMatches='; grep -cE 't\.Skip|\.skip\(|xit\(|xdescribe\(|\.only\(|test\.todo|it\.todo|pending\(' "$file_path"; skip_exit=$?; printf 'mockOrInterceptionMatches='; grep -cE 'jest\.fn|sinon\.stub|msw|nock|page\.route|context\.route|route\.fulfill|route\.abort' "$file_path"; mock_exit=$?; printf 'silentBailoutMatches='; grep -cE 'if[[:space:]]*\([^)]*\)[[:space:]]*\{?[[:space:]]*return[[:space:]]*;|catch[[:space:]]*\([^)]*\)[[:space:]]*\{[[:space:]]*\}' "$file_path"; bailout_exit=$?; if git diff --check -- "$file_path"; then printf 'gitDiffCheckExit=0\n'; else printf 'gitDiffCheckExit=1\n'; failures=$((failures + 1)); fi; [[ "$skip_exit" -eq 1 ]] || failures=$((failures + 1)); [[ "$mock_exit" -eq 1 ]] || failures=$((failures + 1)); [[ "$bailout_exit" -eq 1 ]] || failures=$((failures + 1)); printf 'auditFailures=%s\n' "$failures"; printf 'COLLISION_TEST_INTEGRITY_END\n'; [[ "$failures" -eq 0 ]]`
**Exit Codes:** 0, 0
**Output:**

```text
============================================================
    BUBBLES REGRESSION QUALITY GUARD
    Repo: /Users/redacted/Projects/research-lab
    Timestamp: 2026-07-17T02:26:24Z
    Bugfix mode: true
============================================================

ℹ️  Scanning tests/feature-004-dirty-tree-collision.test.mjs
✅ Adversarial signal detected in tests/feature-004-dirty-tree-collision.test.mjs

============================================================
    REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
    Files scanned: 1
    Files with adversarial signals: 1
============================================================
COLLISION_TEST_INTEGRITY_BEGIN
skipOnlyTodoMatches=0
mockOrInterceptionMatches=0
silentBailoutMatches=0
gitDiffCheckExit=0
auditFailures=0
COLLISION_TEST_INTEGRITY_END
```

### Test-Owned Finding Accounting

| Finding | Disposition |
| --- | --- |
| `F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002` | Addressed by strict predecessor, successor, provenance, current-identity, completion-claim, and malformed-record validation in the persistent canary. |
| `TR-F004-SCRIPT-TRANSITIONS-TEST` | Resolved by the current direct 3/3 canary and the fresh BUG-003 replay recorded in the BUG-003 report. |
| `BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION` | Addressed for this acceptance chain by executing the direct Node canary as an independent blocking command before TP-01-08; the complete system-Chrome run also emitted the same 3/3 canary prelude before 76/76 browser tests. |
| Feature 004 remaining delivery | Unresolved and unchanged. Scope 1 remains In Progress; no unchecked DoD, later scope, phase completion, status, or certification claim is inferred from collision acceptance. |

## Current Selftest Multi-Owner Successor Checkpoint - F004-CURRENT-SCRIPT-IDENTITY-004

This planning-owned checkpoint is additive. Every predecessor marker block, including the immediate active `feature004-dirty-collision-owner-settled-selftest-v1` block, remains byte-identical. The record accepts one stable current identity for fail-closed parser adoption; it does not convert a current diff, an owner state, or parent-session command output into test, completion, acceptance, or certification evidence.

The current worktree diff is not a one-owner overlay. Three hunks are bounded Feature 005 bytes, while three hunks target foreign Feature 011 and Feature 010 bytes without a current authorizing owner record. Those distinctions are part of the contract: identity capture is not semantic approval, and no parser may infer authorship or completion from marker proximity alone.

<!-- feature004-dirty-collision-selftest-successor-v2:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-selftest-successor/v2",
    "findingIds": [
        "F004-CURRENT-SCRIPT-IDENTITY-004",
        "BUG002-F004-SELFTEST-CHECKPOINT-DRIFT",
        "TR-BUG-002-F004-PLAN-02"
    ],
    "capturedAt": "2026-07-18T03:11:21.524Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-owner-settled-selftest-v1",
        "rawBlockSha256": "50f40dab7a9112bdfae30eddaa73f1bc6543383ea8dbce2b7920028ed2d32508",
        "rawBlockByteLength": 20937,
        "startCount": 1,
        "endCount": 1,
        "historyDisposition": "immediate-active-checkpoint-before-v2-successor",
        "priorBlockMustRemainByteIdentical": true
    },
    "captureStability": {
        "firstCapturedAt": "2026-07-18T03:08:13.862Z",
        "finalCapturedAt": "2026-07-18T03:11:21.524Z",
        "stableAcrossFirstImmediateRecapture": true,
        "stableAcrossFinalImmediateRecapture": true,
        "activeCheckpointMatchedAcrossCaptures": true,
        "allThirteenProtectedPathsMatchedAcrossCaptures": true,
        "selftestIdentityMatchedAcrossCaptures": true,
        "feature006MarkerAndSymbolInventoryMatchedAcrossCaptures": true,
        "raceDetected": false
    },
    "previousActiveIdentity": {
        "path": "scripts/selftest.mjs",
        "sourceRecordRef": {
            "marker": "feature004-dirty-collision-owner-settled-selftest-v1",
            "field": "selftestTransition.currentIdentity"
        },
        "status": " M",
        "staged": false,
        "unstaged": true,
        "headOid": "484706d2f819971c298fd3dcef19e34915c4f052",
        "indexOid": "484706d2f819971c298fd3dcef19e34915c4f052",
        "worktreeGitOid": "f1f5d4c604efd6a46b4183408fd397202e650b6f",
        "worktreeSha256": "25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b",
        "hunkCount": 1,
        "hunkBodySha256": [
            "9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0"
        ],
        "markerSliceSha256": "29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3"
    },
    "committedIndexTransitions": {
        "baseCommit": "db06c29650ba351770297acefa658f51cbc4ff00",
        "currentHead": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6",
        "currentIndexOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
        "previousActiveWorktreeOidFoundInCommittedHistory": false,
        "currentWorktreeOidFoundInCommittedHistory": false,
        "currentIndexOidFoundAtCurrentHead": true,
        "records": [
            {
                "commit": "d3d953a33ea9ea5beddea6a84c1539598fba6b3f",
                "selftestBlobOid": "25c9d9200926b88ab4cc963cc802b5ef7e8594c9",
                "authoredAt": "2026-07-17T07:54:50-07:00",
                "subject": "feat(010): MSFT source-qualified facts, periods, reconciliation & statement integrity (Increment A / Scope 1)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "6f90aeb7f0f09cf1bcadbf5d759a6b613b7d553c",
                "selftestBlobOid": "6de7c7c6f1e3485f6654a382e603a7673fbf386a",
                "authoredAt": "2026-07-17T08:56:35-07:00",
                "subject": "feat(010): MSFT derived metrics, resilience diagnostics, capital allocation & trustworthy Simple cockpit (Increment A / Scope 2)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "70fb186df0a775b8f645a1020eb72fefad97638e",
                "selftestBlobOid": "f8ba15f569dcd3538b873b42dbbcbfd10aa12c67",
                "authoredAt": "2026-07-17T09:55:49-07:00",
                "subject": "feat(010): MSFT linked model & user-owned accepted state (Increment A / Scope 3)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "93829ce8a0ada1b24db1b1cb20d03e0da7215042",
                "selftestBlobOid": "e8e9559dc395944de3caa5df2706b5ea20c6ac8c",
                "authoredAt": "2026-07-17T11:41:31-07:00",
                "subject": "feat(010): MSFT Detailed workspaces, peers, source trace, export & committed owner read (Increment A / Scope 4)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "1373a2b4fd7d653818b085f93f1ae23eeca0e67f",
                "selftestBlobOid": "601b9e8b80bb9df8ee83e60cb1a39cd803e8f622",
                "authoredAt": "2026-07-17T13:50:07-07:00",
                "subject": "feat(010): dynamic adaptive company brief (brief core) + Scope 5/6 split (Increment B / Scope 5)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "097c3f44c107b29fd91ceb71f7a27ec3b89f0ac2",
                "selftestBlobOid": "33a14a2a7296dde2a29a418df2a31660bc394567",
                "authoredAt": "2026-07-17T17:03:26-07:00",
                "subject": "feat(010): CMG & JPM source-qualified overlays with real SEC-captured publications (Increment C / Scope 7)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            },
            {
                "commit": "bf793168e1f43ae2ba439173e5e02e3cd55513ad",
                "selftestBlobOid": "271452fd60eb9ac626a823a4b66411f0ea9410fe",
                "authoredAt": "2026-07-17T18:49:17-07:00",
                "subject": "spec(011): register volatility-sizing-lab in nav/catalog/selftest",
                "targetOwner": "specs/011-volatility-regime-and-sizing-lab"
            },
            {
                "commit": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6",
                "selftestBlobOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
                "authoredAt": "2026-07-17T18:59:06-07:00",
                "subject": "feat(010): Feature 002 consume-once owner-read + registry discoverability (Increment B / Scope 6)",
                "targetOwner": "specs/010-company-fundamentals-and-brief-lab"
            }
        ]
    },
    "currentSelftestIdentity": {
        "path": "scripts/selftest.mjs",
        "status": " M",
        "staged": false,
        "unstaged": true,
        "headOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
        "indexOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
        "worktreeGitOid": "660eb298ff2a417064e514da5db8f95c2e85b87d",
        "worktreeSha256": "519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b",
        "byteLength": 187207,
        "lineCount": 1834,
        "hunkCount": 6,
        "hunkBodySha256": [
            "5f8706158e62567df9209b6cd28b43696986ec3551d2923acfb9276d606b2583",
            "97c46079ae90ba2503b2fb5c0315c65f326b5f7235353d90a8dcb60e3ec17569",
            "1addadeede3f463621a9547383654e18b8e84f7aee14d921dad850bef61c931d",
            "2bf47377972d8bc0ec2fc9e52d8db8c23a4a76e3e792352a1d518d2805f36473",
            "efb99951bc693852ade7a70e1dd036a72f6ea457c2de3f45dc66291a3f1961a6",
            "f58c7d11019a0b3ce4283f755d6ff6391eeaaae087b88023261028b626daf3b0"
        ],
        "lastCommit": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6"
    },
    "orderedDiffHunks": [
        {
            "hunkIndex": 1,
            "header": "@@ -19 +18,0 @@ import { validateBriefPayload } from './validate-brief-payload.mjs';",
            "additionCount": 0,
            "deletionCount": 1,
            "changedLineCount": 1,
            "hunkBodySha256": "5f8706158e62567df9209b6cd28b43696986ec3551d2923acfb9276d606b2583",
            "markerLines": [],
            "targetOwner": "specs/011-volatility-regime-and-sizing-lab",
            "ownerRecord": "state.json::status=done;certification.status=done",
            "authorAttribution": "not-established-by-current-owner-state-or-history",
            "disposition": "foreign-protected-current-deletion-identity-only",
            "completionInferenceAllowed": false
        },
        {
            "hunkIndex": 2,
            "header": "@@ -181,223 +179,0 @@ try {",
            "additionCount": 0,
            "deletionCount": 223,
            "changedLineCount": 223,
            "hunkBodySha256": "97c46079ae90ba2503b2fb5c0315c65f326b5f7235353d90a8dcb60e3ec17569",
            "markerLines": [
                "/* ---------- Feature 011: RLVOL conditional-volatility foundation ---------- */"
            ],
            "targetOwner": "specs/011-volatility-regime-and-sizing-lab",
            "ownerRecord": "state.json::status=done;certification.status=done;completedScopes=SCOPE-01,SCOPE-02,SCOPE-03,SCOPE-04",
            "authorAttribution": "not-established-by-current-owner-state-or-history",
            "disposition": "foreign-protected-current-deletion-identity-only",
            "completionInferenceAllowed": false
        },
        {
            "hunkIndex": 3,
            "header": "@@ -1371 +1147 @@ try {",
            "additionCount": 1,
            "deletionCount": 1,
            "changedLineCount": 2,
            "hunkBodySha256": "1addadeede3f463621a9547383654e18b8e84f7aee14d921dad850bef61c931d",
            "markerLines": [
                "/* ---------- Feature 005: Palm Springs contract + deterministic model foundation ---------- */",
                "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-BEGIN */"
            ],
            "targetOwner": "specs/005-palm-springs-rental-market-lab",
            "ownerRecord": "report.md#boundary-test-compliance-and-security-evidence;state.json::certification.scopeProgress[scope=1].status=done",
            "authorAttribution": "feature005-scope1-sentinel-rewrite",
            "disposition": "owner-bounded-current-hunk",
            "completionInferenceAllowed": false
        },
        {
            "hunkIndex": 4,
            "header": "@@ -1373,140 +1149,17 @@ try {",
            "additionCount": 17,
            "deletionCount": 140,
            "changedLineCount": 157,
            "hunkBodySha256": "2bf47377972d8bc0ec2fc9e52d8db8c23a4a76e3e792352a1d518d2805f36473",
            "markerLines": [],
            "targetOwner": "specs/005-palm-springs-rental-market-lab",
            "ownerRecord": "report.md#boundary-test-compliance-and-security-evidence;state.json::certification.scopeProgress[scope=1].status=done",
            "authorAttribution": "feature005-scope1-sentinel-rewrite",
            "disposition": "owner-bounded-current-hunk",
            "completionInferenceAllowed": false
        },
        {
            "hunkIndex": 5,
            "header": "@@ -1514,64 +1167,16 @@ try {",
            "additionCount": 16,
            "deletionCount": 64,
            "changedLineCount": 80,
            "hunkBodySha256": "efb99951bc693852ade7a70e1dd036a72f6ea457c2de3f45dc66291a3f1961a6",
            "markerLines": [
                "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-END */"
            ],
            "targetOwner": "specs/005-palm-springs-rental-market-lab",
            "ownerRecord": "report.md#boundary-test-compliance-and-security-evidence;state.json::certification.scopeProgress[scope=1].status=done",
            "authorAttribution": "feature005-scope1-sentinel-rewrite",
            "disposition": "owner-bounded-current-hunk",
            "completionInferenceAllowed": false
        },
        {
            "hunkIndex": 6,
            "header": "@@ -2225,323 +1829,0 @@ try {",
            "additionCount": 0,
            "deletionCount": 323,
            "changedLineCount": 323,
            "hunkBodySha256": "f58c7d11019a0b3ce4283f755d6ff6391eeaaae087b88023261028b626daf3b0",
            "markerLines": [
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE2-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE2-END */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE3-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE3-END */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE4-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE4-END */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE5-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE5-END */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE6-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE6-END */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-BEGIN */",
                "/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-END */"
            ],
            "targetOwner": "specs/010-company-fundamentals-and-brief-lab",
            "ownerRecord": "state.json::status=not_started;certification.status=not_started;execution.scopeProgress[2..7].status=not_started",
            "authorAttribution": "not-established-by-current-owner-state-or-history",
            "disposition": "foreign-protected-current-deletion-identity-only",
            "completionInferenceAllowed": false
        }
    ],
    "markerOwnership": {
        "feature005": {
            "startInclusive": "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-BEGIN */",
            "endInclusive": "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-END */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 104099,
            "endMarkerStartByte": 108184,
            "endByteExclusive": 108231,
            "byteLength": 4132,
            "sliceSha256": "84a6f11c4ba1ab0812187feeaf0bf8ac57f85beb23b1762ec9d55f82a9b77121",
            "ownedHunkIndexes": [
                3,
                4,
                5
            ]
        },
        "feature006": {
            "startInclusive": "/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */",
            "endExclusive": "/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 108232,
            "endByteExclusive": 150300,
            "byteLength": 42068,
            "currentSliceSha256": "2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef",
            "contentUnchangedFromSettledDelta": true,
            "offsetOnlyTransitionFromSettledDelta": {
                "previousStartByte": 117426,
                "currentStartByte": 108232,
                "previousEndByteExclusive": 159494,
                "currentEndByteExclusive": 150300,
                "deltaBytes": -9194
            },
            "symbolInventoryRule": "unique lexicographically sorted matches of /\\btdc[A-Z][A-Za-z0-9_]*/g inside the marker slice",
            "symbolInventory": [
                "tdcAdjustPValues",
                "tdcApplyTransform",
                "tdcAssessDataQuality",
                "tdcAutocorrelation",
                "tdcBocpd",
                "tdcBuildAnalyticSeries",
                "tdcBuildChangeTimeline",
                "tdcBuildConsensus",
                "tdcClassifyDynamics",
                "tdcClassifyTrend",
                "tdcClusterFamilyVotes",
                "tdcConfig",
                "tdcCorrelation",
                "tdcCorrelationShift",
                "tdcCreateWorkPlan",
                "tdcCusum",
                "tdcDeepFreeze",
                "tdcDistributionShift",
                "tdcEndpointLocalQuadratic",
                "tdcError",
                "tdcEvaluateCycle",
                "tdcEventStudy",
                "tdcFiniteNumber",
                "tdcGaussianHmm2",
                "tdcGeneralizedLombScargle",
                "tdcHarmonicDecomposition",
                "tdcHasExactKeys",
                "tdcHouseholderSolve",
                "tdcIndexConfig",
                "tdcInfluenceDiagnostics",
                "tdcIsPlainObject",
                "tdcKahanSum",
                "tdcLeadLag",
                "tdcLinearFit",
                "tdcLjungBox",
                "tdcLocalLinearState",
                "tdcLogGamma",
                "tdcLogSumExp",
                "tdcMad",
                "tdcMeanVariance",
                "tdcMedian",
                "tdcMethodFailure",
                "tdcMethodSuccess",
                "tdcNames",
                "tdcNearbyStability",
                "tdcNormalCdf",
                "tdcPenalizedLinearSegments",
                "tdcProminentExtrema",
                "tdcQuantile",
                "tdcRegularizedBeta",
                "tdcResolveAsOfVintage",
                "tdcRollingOlsHac",
                "tdcRollingSpectrum",
                "tdcRunScope2Engine",
                "tdcRunScope3Engine",
                "tdcScaleShift",
                "tdcSource",
                "tdcStableDigest",
                "tdcStableSerialize",
                "tdcStudentTCdf",
                "tdcTheilSenKendall",
                "tdcValidateConfig",
                "tdcValidateNumericSeries",
                "tdcValidateSeriesEnvelope",
                "tdcWelchSpectrum"
            ]
        },
        "feature010Foundation": {
            "startInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */",
            "endInclusive": "/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 174699,
            "endMarkerStartByte": 186932,
            "endByteExclusive": 186985,
            "byteLength": 12286,
            "sliceSha256": "bb06c409df2d201a0f43c1a9fd47d7ab491e3e002f6a9d23720f4b79c562128c",
            "scope2Through7MarkerCount": 0
        },
        "feature011": {
            "groupTitle": "Feature 011 RLVOL foundation",
            "currentGroupTitleCount": 0,
            "targetOwnerState": "done",
            "targetCertificationState": "done",
            "currentDeletionAuthorAttributionEstablished": false,
            "identityAcceptanceIsSemanticApproval": false
        }
    },
    "ownerStateSnapshot": {
        "feature004": {
            "path": "specs/004-fx-regime-relative-value-lab/state.json",
            "status": "not_started",
            "certificationStatus": "not_started",
            "scope1PlanningStatus": "in_progress",
            "completedScopes": [],
            "completionInference": false
        },
        "feature005": {
            "path": "specs/005-palm-springs-rental-market-lab/state.json",
            "status": "in_progress",
            "certificationStatus": "in_progress",
            "completedScopes": [
                "01-red-first-shared-v2-foundation"
            ],
            "scope1Status": "done",
            "scope2Status": "in_progress",
            "currentSelftestDisposition": "three-feature005-hunks-three-foreign-preserved-zero-overlap",
            "featureCompletionInference": false
        },
        "feature006": {
            "path": "specs/006-trend-dynamics-cycle-lab/state.json",
            "status": "not_started",
            "certificationStatus": "not_started",
            "currentScope": "Scope 3",
            "completedPhaseClaims": [
                "implement",
                "test"
            ],
            "completedScopes": [],
            "completionInference": false
        },
        "feature010": {
            "path": "specs/010-company-fundamentals-and-brief-lab/state.json",
            "status": "not_started",
            "certificationStatus": "not_started",
            "completedPhaseClaims": [
                "spec-review"
            ],
            "completedScopes": [],
            "scope1IndependentTestTransitionStatus": "resolved-route-required",
            "completionInference": false
        },
        "feature011": {
            "path": "specs/011-volatility-regime-and-sizing-lab/state.json",
            "status": "done",
            "certificationStatus": "done",
            "completedScopes": [
                "SCOPE-01",
                "SCOPE-02",
                "SCOPE-03",
                "SCOPE-04"
            ],
            "stateObservationOnly": true,
            "currentDeletionAcceptedAsCompletionEvidence": false
        },
        "bug003": {
            "path": "specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json",
            "status": "in_progress",
            "certificationStatus": "in_progress",
            "completedScopes": [],
            "testTransitionStatus": "resolved-route-required",
            "acceptanceInference": false
        },
        "bug002": {
            "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/state.json",
            "status": "in_progress",
            "certificationStatus": "in_progress",
            "completedPhaseClaims": [
                "implement"
            ],
            "completedScopes": [],
            "acceptanceInference": false
        }
    },
    "protectedPathIdentities": [
        {"path":"rldata.js","status":"","staged":false,"unstaged":false,"headOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","indexOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeGitOid":"212590f3c91dcfc1ad1ca69ab5b6b4e7c9ac439b","worktreeSha256":"d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"scripts/selftest.mjs","status":" M","staged":false,"unstaged":true,"headOid":"44be5ac34526a076050ddf69e92cb32ffc443831","indexOid":"44be5ac34526a076050ddf69e92cb32ffc443831","worktreeGitOid":"660eb298ff2a417064e514da5db8f95c2e85b87d","worktreeSha256":"519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b","hunkCount":6,"hunkBodySha256":["5f8706158e62567df9209b6cd28b43696986ec3551d2923acfb9276d606b2583","97c46079ae90ba2503b2fb5c0315c65f326b5f7235353d90a8dcb60e3ec17569","1addadeede3f463621a9547383654e18b8e84f7aee14d921dad850bef61c931d","2bf47377972d8bc0ec2fc9e52d8db8c23a4a76e3e792352a1d518d2805f36473","efb99951bc693852ade7a70e1dd036a72f6ea457c2de3f45dc66291a3f1961a6","f58c7d11019a0b3ce4283f755d6ff6391eeaaae087b88023261028b626daf3b0"],"lastCommit":"4c677c88b8d5f863f3409aa0e33133bc15fa25b6"},
        {"path":"scripts/fetch-bars.mjs","status":"","staged":false,"unstaged":false,"headOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","indexOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeGitOid":"6768c3c64012a6014e26f93f9b192799e5a2732f","worktreeSha256":"05534ce159bd230f5af2fda7890ed62b06d36d1cdfd14945a0687f572db93e78","hunkCount":0,"hunkBodySha256":[],"lastCommit":"56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3"},
        {"path":"global-rotation-lab.html","status":"","staged":false,"unstaged":false,"headOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","indexOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeGitOid":"d23d1e24044106e2df17a9c1e32dbd44670f465f","worktreeSha256":"cdd92f8d4f8ce5804b96fab284bad4248f361b7639ba48dd6acf8f12be903f9d","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"index.html","status":"","staged":false,"unstaged":false,"headOid":"22cf1addfd0db6f67d08526f31e1f4c291f252c3","indexOid":"22cf1addfd0db6f67d08526f31e1f4c291f252c3","worktreeGitOid":"22cf1addfd0db6f67d08526f31e1f4c291f252c3","worktreeSha256":"4d20da32eacb2f293a469b81cb7afd34b408f1000ce25b159ddeb80cebb07ed3","hunkCount":0,"hunkBodySha256":[],"lastCommit":"4c677c88b8d5f863f3409aa0e33133bc15fa25b6"},
        {"path":"rlnav.js","status":"","staged":false,"unstaged":false,"headOid":"f97966120af6a8146f23f816941fe8dc26bf3e44","indexOid":"f97966120af6a8146f23f816941fe8dc26bf3e44","worktreeGitOid":"f97966120af6a8146f23f816941fe8dc26bf3e44","worktreeSha256":"3ad9f51b065493a90a0306361dbaec7a1a8450a246e8597e4b48fff2e5738621","hunkCount":0,"hunkBodySha256":[],"lastCommit":"4c677c88b8d5f863f3409aa0e33133bc15fa25b6"},
        {"path":"tools.json","status":"","staged":false,"unstaged":false,"headOid":"f50486f6a7090f3f5d31fdb36d0bc429c315b1b6","indexOid":"f50486f6a7090f3f5d31fdb36d0bc429c315b1b6","worktreeGitOid":"f50486f6a7090f3f5d31fdb36d0bc429c315b1b6","worktreeSha256":"3bad6ef5fd16b29595aed4c873ef22a38cd04eafbe6d0faf49782e07b96d7a8b","hunkCount":0,"hunkBodySha256":[],"lastCommit":"4c677c88b8d5f863f3409aa0e33133bc15fa25b6"},
        {"path":"market-brief.html","status":"","staged":false,"unstaged":false,"headOid":"9cf3d6974d14525c915a11df39bc241778ff3869","indexOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeGitOid":"9cf3d6974d14525c915a11df39bc241778ff3869","worktreeSha256":"e0e17492704921937706682b6de8c0efa998890e22a1abaaa36c6688fc5c2b0b","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"notes/market-brief.md","status":"","staged":false,"unstaged":false,"headOid":"e3e3b8252f7415890665106414f39191b696bcf8","indexOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeGitOid":"e3e3b8252f7415890665106414f39191b696bcf8","worktreeSha256":"aa0c9abb817a0397212017cb3366079e5b29a4f1046a1471b131dcb256480243","hunkCount":0,"hunkBodySha256":[],"lastCommit":"d7fd1d02e99c748ab5366c5a8e6de1192b24b823"},
        {"path":"README.md","status":"","staged":false,"unstaged":false,"headOid":"f83030fc41ea85cef7dbb474b12d144adea00e6f","indexOid":"f83030fc41ea85cef7dbb474b12d144adea00e6f","worktreeGitOid":"f83030fc41ea85cef7dbb474b12d144adea00e6f","worktreeSha256":"8a6fa63f70f2be45bae7b8b956500db9a82d7409be421a5ad30e82007ce48960","hunkCount":0,"hunkBodySha256":[],"lastCommit":"bf793168e1f43ae2ba439173e5e02e3cd55513ad"},
        {"path":"notes/README.md","status":"","staged":false,"unstaged":false,"headOid":"10a6499404fe22bb795ff770e4a74e068c0ed871","indexOid":"10a6499404fe22bb795ff770e4a74e068c0ed871","worktreeGitOid":"10a6499404fe22bb795ff770e4a74e068c0ed871","worktreeSha256":"ccf529e42bac2e222b87436dcbc1f8e28e92890e402882ebf71b892bc60a704b","hunkCount":0,"hunkBodySha256":[],"lastCommit":"bf793168e1f43ae2ba439173e5e02e3cd55513ad"},
        {"path":"scripts/validate-brief-payload.mjs","status":"","staged":false,"unstaged":false,"headOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","indexOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeGitOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeSha256":"78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f","hunkCount":0,"hunkBodySha256":[],"lastCommit":"932efdd9912bfc264ae96ded90f6410fe4cc5537"},
        {"path":"market-brief.config.json","status":"","staged":false,"unstaged":false,"headOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","indexOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeGitOid":"bc7806bfacbab08eb2bee9ba31e8ebb0b2b3a522","worktreeSha256":"85f9134435ec7f361d258f067d59611895df3b0f6959dcca506370744b7932ca","hunkCount":0,"hunkBodySha256":[],"lastCommit":"71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef"}
    ],
    "aggregateObservation": {
        "planningCommandExecuted": false,
        "planningClassification": "identity-capture-only",
        "parentSessionReportedCommand": "node scripts/selftest.mjs",
        "parentSessionReportedExitCode": 0,
        "parentSessionReportedPassed": 491,
        "parentSessionReportedFailed": 0,
        "acceptedAsCurrentPlanningTestEvidence": false,
        "acceptedAsCompletionEvidence": false
    },
    "completionClaims": {
        "feature004CanaryPassClaim": false,
        "feature004TestPhasePassClaim": false,
        "feature004TestPhaseCompletionClaim": false,
        "feature004ScopePassClaim": false,
        "feature004ScopeCompletionClaim": false,
        "feature004FeatureCompletionClaim": false,
        "feature004CertificationPassClaim": false,
        "feature004CertificationCompletionClaim": false,
        "feature006ScopePassClaim": false,
        "feature006ScopeCompletionClaim": false,
        "feature006FeatureCompletionClaim": false,
        "feature006CertificationCompletionClaim": false,
        "feature010ScopePassClaim": false,
        "feature010ScopeCompletionClaim": false,
        "feature010FeatureCompletionClaim": false,
        "feature010CertificationCompletionClaim": false,
        "bug003AcceptanceClaim": false,
        "bug003CompletionClaim": false,
        "bug003CertificationClaim": false,
        "bug002AcceptanceClaim": false,
        "bug002CompletionClaim": false,
        "bug002CertificationClaim": false,
        "feature005FeatureCompletionClaim": false,
        "feature011NewCompletionInference": false
    },
    "volatileConfigPolicy": {
        "path": "market-brief.config.json",
        "currentIdentityRecorded": true,
        "authoritativeForScope4Edit": false,
        "inheritedJustInTimeCheckpointRuleRemainsRequired": true
    },
    "preservationContract": {
        "allPredecessorBlocksRemainByteIdentical": true,
        "immediateActiveBlockHashMustMatchBeforeV2": true,
        "committedIndexTransitionsMustMatchInOrder": true,
        "currentHeadIndexAndWorktreeIdentitiesMustMatchExactly": true,
        "allSixHunkHeadersCountsOrderAndHashesMustMatchExactly": true,
        "feature005OnlyOwnsHunksThreeThroughFive": true,
        "foreignDeletionAuthorshipMustNotBeInferred": true,
        "feature006ContentHashLengthAndSymbolsMustRemainExact": true,
        "feature006OffsetChangeAloneMustNotImplyContentChange": true,
        "feature010FoundationAndRemovedScopeMarkersMustMatchExactly": true,
        "feature011CertifiedStateMustNotAuthorizeCurrentDeletion": true,
        "allThirteenProtectedPathIdentitiesMustMatchInOrder": true,
        "validatorTransitionAndPrefixContractRemainExact": true,
        "volatileConfigRuleRemainsNonAuthoritativeForScope4Edit": true,
        "ownerStatesMustRemainNonterminalWhereRecorded": true,
        "everyListedCompletionClaimMustRemainFalse": true,
        "unknownMissingDuplicateReorderedBroadenedOrExtraRecordsFailClosed": true,
        "skipFallbackSubsetComparisonMutableInferenceAndUnknownSuccessForbidden": true,
        "subsequentByteHunkMarkerOwnerStateStatusOrStagingDriftFailsClosed": true
    },
    "routing": {
        "outcome": "route_required",
        "addressedFindingIds": [
            "F004-CURRENT-SCRIPT-IDENTITY-004",
            "BUG002-F004-SELFTEST-CHECKPOINT-DRIFT",
            "TR-BUG-002-F004-PLAN-02"
        ],
        "unresolvedFindingIds": [
            "BUG002-WRAPPER-DEAD-NARRATIVE-CONFIG",
            "F004-COLLISION-SELFTEST-SUCCESSOR-PARSER-003",
            "BUG002-INDEPENDENT-VERIFICATION"
        ],
        "nextRequiredOwner": "bubbles.implement",
        "nextRequiredTransition": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "testOwnerAfterImplementationDiagnostics": "bubbles.test",
        "bug002StatusRequired": "in_progress",
        "terminalStatusMutationAllowed": false
    },
    "implementationOwnerHandoff": {
        "owner": "bubbles.implement",
        "transitionRequestId": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "targetPath": "scripts/brief-refresh-and-push.sh",
        "allowedChange": "diagnosed-dead-narrative-configuration-only",
        "protectedSelftestWorktreeGitOid": "660eb298ff2a417064e514da5db8f95c2e85b87d",
        "protectedSelftestSha256": "519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b",
        "selftestEditAllowed": false,
        "collisionTestEditAllowed": false,
        "returnOwner": "bubbles.test"
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "afterTransition": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "nextPacket": "specs/_bugs/BUG-002-market-brief-session-date-drift",
        "requirements": [
            "Require the immediate feature004-dirty-collision-owner-settled-selftest-v1 raw SHA-256 a569a5eaa89ca2de4905167dd2bfe13c306e88fb8e11dd912efdaee86523cc07 and preserve every predecessor block byte-for-byte before parsing v2.",
            "Parse exactly one feature004-dirty-collision-selftest-successor-v2 block and reject a duplicate marker, malformed JSON, or any unknown, missing, or reordered top-level or nested field.",
            "Require the exact top-level field order contractVersion, findingIds, capturedAt, extendsContract, captureStability, previousActiveIdentity, committedIndexTransitions, currentSelftestIdentity, orderedDiffHunks, markerOwnership, ownerStateSnapshot, protectedPathIdentities, aggregateObservation, completionClaims, volatileConfigPolicy, preservationContract, routing, implementationOwnerHandoff, testOwnerHandoff.",
            "Require both capture-stability passes, raceDetected false, and exact continuity from the previous active identity to the current committed-index and worktree records without treating the prior worktree as a committed blob.",
            "Require the eight committed index transitions in order from base commit db06c29650ba351770297acefa658f51cbc4ff00 to current HEAD 4c677c88b8d5f863f3409aa0e33133bc15fa25b6 and verify every commit-to-blob mapping.",
            "Recompute scripts/selftest.mjs status, staging flags, HEAD and index OIDs, worktree Git OID, SHA-256, byte and line counts, six ordered hunk hashes, and last commit exactly.",
            "Recompute all six zero-context hunk headers, addition/deletion/changed-line counts, marker-line arrays, and trimmed changed-body hashes in the recorded order.",
            "Require only hunks 3, 4, and 5 to be Feature 005 owner-bounded; require hunks 1, 2, and 6 to remain foreign-protected identity records whose author and semantic approval are not inferred.",
            "Require the Feature 005 begin and end markers exactly once and in order at [104099,108231), byte length 4132, slice SHA-256 84a6f11c4ba1ab0812187feeaf0bf8ac57f85beb23b1762ec9d55f82a9b77121.",
            "Require the Feature 006 start and Feature 007 exclusive end markers exactly once and in order at [108232,150300), byte length 42068, slice SHA-256 2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef, and the exact sorted 65-symbol inventory.",
            "Require the Feature 010 foundation markers and slice exactly while requiring zero Scope 2 through Scope 7 markers in the current worktree; do not infer Feature 010 scope, feature, test, or certification completion.",
            "Require zero current Feature 011 RLVOL group-title markers while independently requiring the recorded Feature 011 done and certified state; the certified owner state cannot authorize or semantically approve the current deletion.",
            "Require exactly 13 protectedPathIdentities in the listed order and recompute every status, staging flag, HEAD/index/worktree OID, SHA-256, hunk list, and last commit.",
            "Retain the approved tracked-clean validator identity, historical 137-line prefix contract, and just-in-time volatile-config rule without reinterpretation.",
            "Require Feature 004, Feature 006, Feature 010, BUG-003, and BUG-002 owner states and every listed pass, completion, acceptance, and certification claim exactly as recorded; no false value may become true through parser inference.",
            "Reject adversarial mutations for every top-level field, path, hunk order, hash, marker, symbol, owner target, author attribution, state, status, staging flag, commit, completion flag, and extra or missing record.",
            "Run the direct Feature 004 canary under bubbles.test ownership after parser adoption; a red pre-adoption canary is not a planning failure and a green canary is not Feature 004 completion.",
            "Replay the unchanged BUG-002 focused and complete required matrix after the direct canary; preserve test, regression, validation, audit, certification, and parent-replay ownership boundaries."
        ]
    }
}
```
<!-- feature004-dirty-collision-selftest-successor-v2:end -->

## Current Selftest Provenance Correction Successor - F005-IDENTITY-HUNK1-PRODUCER-CORRECTION

This planning-owned correction is additive. The complete `feature004-dirty-collision-selftest-successor-v2` block above remains mandatory byte-identical history and remains a required parser input. V3 supersedes v2 only as the active provenance interpretation and current parser target. The current selftest identity is unchanged; this record corrects only hunk 1 committed-producer provenance and does not infer the author, approval, acceptance, completion, or certification of any current deletion.

<!-- feature004-dirty-collision-selftest-successor-v3:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-selftest-successor/v3",
    "findingIds": [
        "F005-IDENTITY-HUNK1-PRODUCER-CORRECTION",
        "BUG002-F004-SELFTEST-CHECKPOINT-DRIFT"
    ],
    "capturedAt": "2026-07-18T03:36:07.754Z",
    "extendsContract": {
        "marker": "feature004-dirty-collision-selftest-successor-v2",
        "rawBlockSha256": "5484e14998c3cec0105f04413dc9f25a580658d272647e2e90b780b4d5e13ce4",
        "rawBlockByteLength": 35844,
        "hashInput": "marker-inclusive-no-trailing-newline",
        "startCount": 1,
        "endCount": 1,
        "historyDisposition": "mandatory-validated-history-superseded-only-as-active-provenance-interpretation",
        "priorBlockMustRemainByteIdentical": true,
        "priorBlockMustRemainParserValidated": true
    },
    "settlementSource": {
        "packet": "specs/005-palm-springs-rental-market-lab",
        "section": "Scope 2 Selftest Identity Settlement And Current-Byte Replay - 2026-07-18T03:20:48.669Z",
        "sectionCapturedAt": "2026-07-18T03:20:48.669Z",
        "agent": "bubbles.test",
        "phase": "test",
        "claimSource": "interpreted",
        "identityReturnContractVersion": "feature005-scope2-selftest-identity-return/v1",
        "feature005Scope2Status": "nonterminal",
        "feature005ExistingOwnerRoute": "TR-005-S02-E2E-FIDELITY-IMPLEMENT-20260718",
        "ownerReceiptSelftestObservation": {
            "command": "node scripts/selftest.mjs",
            "exitCode": 0,
            "passed": 491,
            "failed": 0,
            "acceptedAsPlanningTestEvidence": false,
            "acceptedAsCompletionEvidence": false
        }
    },
    "identityContinuity": {
        "path": "scripts/selftest.mjs",
        "v2IdentityRef": "feature004-dirty-collision-selftest-successor-v2::currentSelftestIdentity",
        "status": " M",
        "staged": false,
        "unstaged": true,
        "headOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
        "indexOid": "44be5ac34526a076050ddf69e92cb32ffc443831",
        "worktreeGitOid": "660eb298ff2a417064e514da5db8f95c2e85b87d",
        "worktreeSha256": "519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b",
        "byteLength": 187207,
        "lineChunkCount": 1834,
        "hunkCount": 6,
        "hunkBodySha256": [
            "5f8706158e62567df9209b6cd28b43696986ec3551d2923acfb9276d606b2583",
            "97c46079ae90ba2503b2fb5c0315c65f326b5f7235353d90a8dcb60e3ec17569",
            "1addadeede3f463621a9547383654e18b8e84f7aee14d921dad850bef61c931d",
            "2bf47377972d8bc0ec2fc9e52d8db8c23a4a76e3e792352a1d518d2805f36473",
            "efb99951bc693852ade7a70e1dd036a72f6ea457c2de3f45dc66291a3f1961a6",
            "f58c7d11019a0b3ce4283f755d6ff6391eeaaae087b88023261028b626daf3b0"
        ],
        "lastCommit": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6",
        "identityChangedSinceV2": false
    },
    "orderedDiffHunks": [
        {
            "hunkIndex": 1,
            "header": "@@ -19 +18,0 @@ import { validateBriefPayload } from './validate-brief-payload.mjs';",
            "additionCount": 0,
            "deletionCount": 1,
            "changedLineCount": 1,
            "hunkBodySha256": "5f8706158e62567df9209b6cd28b43696986ec3551d2923acfb9276d606b2583",
            "hunkHeaderContextLine": "import { validateBriefPayload } from './validate-brief-payload.mjs';",
            "hunkHeaderContextProducerCommit": "db06c29650ba351770297acefa658f51cbc4ff00",
            "hunkHeaderContextRetained": true,
            "deletedCommittedLine": "import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';",
            "committedProducer": "specs/010-company-fundamentals-and-brief-lab Scope 6",
            "producerCommit": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6",
            "producerCommitSubject": "feat(010): Feature 002 consume-once owner-read + registry discoverability (Increment B / Scope 6)",
            "currentDeletionAuthor": "unknown",
            "disposition": "foreign-protected-current-deletion-identity-only"
        },
        {
            "hunkIndex": 2,
            "header": "@@ -181,223 +179,0 @@ try {",
            "additionCount": 0,
            "deletionCount": 223,
            "changedLineCount": 223,
            "hunkBodySha256": "97c46079ae90ba2503b2fb5c0315c65f326b5f7235353d90a8dcb60e3ec17569",
            "marker": "/* ---------- Feature 011: RLVOL conditional-volatility foundation ---------- */",
            "committedProducer": "specs/011-volatility-regime-and-sizing-lab",
            "producerCommit": "bf793168e1f43ae2ba439173e5e02e3cd55513ad",
            "producerCommitSubject": "spec(011): register volatility-sizing-lab in nav/catalog/selftest",
            "producerStateEvidence": "state.json::status=done;certification.status=done",
            "currentDeletionAuthor": "unknown",
            "disposition": "foreign-protected-current-deletion-identity-only"
        },
        {
            "hunkIndex": 3,
            "header": "@@ -1371 +1147 @@ try {",
            "additionCount": 1,
            "deletionCount": 1,
            "changedLineCount": 2,
            "hunkBodySha256": "1addadeede3f463621a9547383654e18b8e84f7aee14d921dad850bef61c931d",
            "owner": "specs/005-palm-springs-rental-market-lab Scope 1",
            "evidenceRefs": [
                "../005-palm-springs-rental-market-lab/report.md#boundary-test-compliance-and-security-evidence",
                "../005-palm-springs-rental-market-lab/report.md#scope-01-final-current-byte-re-audit-attempt-6---2026-07-17",
                "../005-palm-springs-rental-market-lab/report.md#scope-1-validate-certification---2026-07-18"
            ],
            "disposition": "feature005-marker-bounded-owner-hunk"
        },
        {
            "hunkIndex": 4,
            "header": "@@ -1373,140 +1149,17 @@ try {",
            "additionCount": 17,
            "deletionCount": 140,
            "changedLineCount": 157,
            "hunkBodySha256": "2bf47377972d8bc0ec2fc9e52d8db8c23a4a76e3e792352a1d518d2805f36473",
            "owner": "specs/005-palm-springs-rental-market-lab Scope 1",
            "evidenceRefs": [
                "../005-palm-springs-rental-market-lab/report.md#boundary-test-compliance-and-security-evidence",
                "../005-palm-springs-rental-market-lab/report.md#scope-01-final-current-byte-re-audit-attempt-6---2026-07-17",
                "../005-palm-springs-rental-market-lab/report.md#scope-1-validate-certification---2026-07-18"
            ],
            "disposition": "feature005-marker-bounded-owner-hunk"
        },
        {
            "hunkIndex": 5,
            "header": "@@ -1514,64 +1167,16 @@ try {",
            "additionCount": 16,
            "deletionCount": 64,
            "changedLineCount": 80,
            "hunkBodySha256": "efb99951bc693852ade7a70e1dd036a72f6ea457c2de3f45dc66291a3f1961a6",
            "owner": "specs/005-palm-springs-rental-market-lab Scope 1",
            "evidenceRefs": [
                "../005-palm-springs-rental-market-lab/report.md#boundary-test-compliance-and-security-evidence",
                "../005-palm-springs-rental-market-lab/report.md#scope-01-final-current-byte-re-audit-attempt-6---2026-07-17",
                "../005-palm-springs-rental-market-lab/report.md#scope-1-validate-certification---2026-07-18"
            ],
            "disposition": "feature005-marker-bounded-owner-hunk"
        },
        {
            "hunkIndex": 6,
            "header": "@@ -2225,323 +1829,0 @@ try {",
            "additionCount": 0,
            "deletionCount": 323,
            "changedLineCount": 323,
            "hunkBodySha256": "f58c7d11019a0b3ce4283f755d6ff6391eeaaae087b88023261028b626daf3b0",
            "committedProducer": "specs/010-company-fundamentals-and-brief-lab Scopes 2-7",
            "producerCommitsInBlameOrder": [
                "6f90aeb7f0f09cf1bcadbf5d759a6b613b7d553c",
                "097c3f44c107b29fd91ceb71f7a27ec3b89f0ac2",
                "70fb186df0a775b8f645a1020eb72fefad97638e",
                "93829ce8a0ada1b24db1b1cb20d03e0da7215042",
                "1373a2b4fd7d653818b085f93f1ae23eeca0e67f",
                "4c677c88b8d5f863f3409aa0e33133bc15fa25b6"
            ],
            "currentDeletionAuthor": "unknown",
            "disposition": "foreign-protected-current-deletion-identity-only"
        }
    ],
    "markerOwnership": {
        "feature005": {
            "startInclusive": "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-BEGIN */",
            "endInclusive": "/* FEATURE-005-PLACE-BASED-RENTAL-MARKET-END */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 104099,
            "endMarkerStartByte": 108184,
            "endByteExclusive": 108231,
            "byteLength": 4132,
            "sliceSha256": "84a6f11c4ba1ab0812187feeaf0bf8ac57f85beb23b1762ec9d55f82a9b77121",
            "ownedHunkIndexes": [
                3,
                4,
                5
            ]
        },
        "feature006": {
            "startInclusive": "/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */",
            "endExclusive": "/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */",
            "startCount": 1,
            "endCount": 1,
            "ordered": true,
            "startByte": 108232,
            "endByteExclusive": 150300,
            "byteLength": 42068,
            "sliceSha256": "2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef",
            "contentUnchangedFromV2": true
        }
    },
    "provenanceCorrection": {
        "correctedHunkIndex": 1,
        "v2TargetOwner": "specs/011-volatility-regime-and-sizing-lab",
        "ownerReceiptDeletedLineClaim": "import { validateBriefPayload } from './validate-brief-payload.mjs';",
        "ownerReceiptLineClaimDisposition": "corrected-hunk-header-context-not-deleted-body",
        "actualDeletedCommittedLine": "import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';",
        "hunkHeaderContextProducerCommit": "db06c29650ba351770297acefa658f51cbc4ff00",
        "correctedCommittedProducer": "specs/010-company-fundamentals-and-brief-lab Scope 6",
        "correctedProducerCommit": "4c677c88b8d5f863f3409aa0e33133bc15fa25b6",
        "correctedProducerCommitSubject": "feat(010): Feature 002 consume-once owner-read + registry discoverability (Increment B / Scope 6)",
        "currentDeletionAuthor": "unknown",
        "currentDeletionSemanticApproval": false,
        "otherHunkDispositionsRemainExact": true
    },
    "completionClaims": {
        "feature004CanaryPassClaim": false,
        "feature004TestPhasePassClaim": false,
        "feature004TestPhaseCompletionClaim": false,
        "feature004ScopePassClaim": false,
        "feature004ScopeCompletionClaim": false,
        "feature004FeatureCompletionClaim": false,
        "feature004CertificationClaim": false,
        "feature005Scope2PassClaim": false,
        "feature005Scope2CompletionClaim": false,
        "feature005FeatureCompletionClaim": false,
        "feature006ScopePassClaim": false,
        "feature006ScopeCompletionClaim": false,
        "feature006FeatureCompletionClaim": false,
        "feature006CertificationClaim": false,
        "feature010ScopePassClaim": false,
        "feature010ScopeCompletionClaim": false,
        "feature010FeatureCompletionClaim": false,
        "feature010CertificationClaim": false,
        "feature011CurrentDeletionApprovalClaim": false,
        "feature011CurrentDeletionCompletionEvidenceClaim": false,
        "feature011NewCompletionInference": false,
        "bug002AcceptanceClaim": false,
        "bug002TestPhasePassClaim": false,
        "bug002TestPhaseCompletionClaim": false,
        "bug002CompletionClaim": false,
        "bug002CertificationClaim": false,
        "bug003AcceptanceClaim": false,
        "bug003CompletionClaim": false,
        "bug003CertificationClaim": false
    },
    "preservationContract": {
        "allPredecessorBlocksRemainByteIdentical": true,
        "v2RawHashAndLengthRemainExact": true,
        "v2RemainsMandatoryParserInput": true,
        "v3OnlySupersedesActiveProvenanceInterpretation": true,
        "currentSelftestIdentityRemainsExact": true,
        "onlyHunkOneCommittedProducerProvenanceIsCorrected": true,
        "currentDeletionAuthorshipRemainsUnknownForHunksOneTwoAndSix": true,
        "hunksThreeThroughFiveRemainFeature005MarkerBounded": true,
        "hunkTwoRemainsCommittedFeature011Content": true,
        "hunkSixRemainsCommittedFeature010ScopesTwoThroughSevenContent": true,
        "feature005Scope2SemanticFidelityRouteRemainsUntouched": true,
        "v2ThirteenPathMatrixValidatorAndVolatileRulesRemainExact": true,
        "everyListedCompletionClaimRemainsFalse": true,
        "unknownMissingDuplicateReorderedBroadenedOrExtraRecordsFailClosed": true,
        "skipFallbackSubsetComparisonMutableInferenceAndUnknownSuccessForbidden": true,
        "subsequentIdentityHunkMarkerOwnerStateStatusOrStagingDriftFailsClosed": true
    },
    "routing": {
        "outcome": "route_required",
        "addressedFindingIds": [
            "F005-IDENTITY-HUNK1-PRODUCER-CORRECTION",
            "BUG002-F004-SELFTEST-CHECKPOINT-DRIFT"
        ],
        "unresolvedFindingIds": [
            "BUG002-WRAPPER-DEAD-NARRATIVE-CONFIG",
            "F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001",
            "BUG002-INDEPENDENT-VERIFICATION"
        ],
        "nextRequiredOwner": "bubbles.implement",
        "nextRequiredTransition": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "testOwnerAfterImplementationDiagnostics": "bubbles.test",
        "bug002StatusRequired": "in_progress",
        "terminalStatusMutationAllowed": false
    },
    "implementationOwnerHandoff": {
        "owner": "bubbles.implement",
        "transitionRequestId": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "targetPath": "scripts/brief-refresh-and-push.sh",
        "allowedChange": "diagnosed-dead-narrative-configuration-only",
        "protectedSelftestWorktreeGitOid": "660eb298ff2a417064e514da5db8f95c2e85b87d",
        "protectedSelftestSha256": "519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b",
        "selftestEditAllowed": false,
        "collisionTestEditAllowed": false,
        "returnOwner": "bubbles.test"
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "afterTransition": "TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01",
        "nextPacket": "specs/_bugs/BUG-002-market-brief-session-date-drift",
        "requirements": [
            "Require the marker-inclusive no-trailing-newline v2 raw SHA-256 eef8aa415b739df80b1aab4046adbb64a39c87c6fb1b73ff0ac210b67870f32a and byte length 35844, validate v2 as a mandatory input, and preserve v2 plus every predecessor block byte-for-byte before parsing v3.",
            "Parse exactly one feature004-dirty-collision-selftest-successor-v3 block and reject duplicate markers, malformed JSON, or any unknown, missing, or reordered top-level or nested field.",
            "Require the exact top-level field order contractVersion, findingIds, capturedAt, extendsContract, settlementSource, identityContinuity, orderedDiffHunks, markerOwnership, provenanceCorrection, completionClaims, preservationContract, routing, implementationOwnerHandoff, testOwnerHandoff.",
            "Require the exact Feature 005 Scope 2 owner receipt section, interpreted claim source, nonterminal Scope 2 status, and existing semantic-fidelity implementation route; the receipt's 491/0 selftest observation is not planning test or completion evidence.",
            "Require current identity equality with v2 and current bytes: status, staging flags, HEAD/index OIDs, worktree Git OID, SHA-256, byte length, line-chunk count, six ordered hashes, and last commit.",
            "Recompute all six zero-context hunk headers, addition, deletion, and changed-line counts plus trimmed changed-body hashes in order.",
            "Require hunk 1's retained validateBriefPayload import to be classified only as header context from commit db06c29650ba351770297acefa658f51cbc4ff00, and require the actual deleted buildCompanyFundamentalsOwnerRead import to resolve to Feature 010 Scope 6 commit 4c677c88b8d5f863f3409aa0e33133bc15fa25b6 with its exact subject while current deletion author remains unknown and no approval is inferred.",
            "Require hunk 2 to remain committed Feature 011 content with unknown current deletion author, hunks 3 through 5 to remain Feature 005 marker-bounded owner hunks, and hunk 6 to remain committed Feature 010 Scopes 2 through 7 content with unknown current deletion author.",
            "Require the Feature 005 slice [104099,108231) and SHA-256 84a6f11c4ba1ab0812187feeaf0bf8ac57f85beb23b1762ec9d55f82a9b77121 plus Feature 006 slice [108232,150300) and SHA-256 2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef exactly.",
            "Retain v2's complete 13-path matrix, tracked-clean validator identity, historical 137-line prefix contract, and just-in-time volatile-config rule without reinterpretation.",
            "Require every listed Feature 004, Feature 005, Feature 006, Feature 010, Feature 011 current-deletion, BUG-002, and BUG-003 pass, completion, acceptance, and certification claim to remain false as applicable.",
            "Reject adversarial mutations for every field, path, hunk, order, hash, marker, owner, producer commit, current deletion author, state, status, staging flag, completion flag, and extra or missing record.",
            "After TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01 closes, execute the direct Feature 004 collision canary under bubbles.test ownership; the expected red before v3 adoption is not a planning failure and a green canary is not Feature 004 completion.",
            "After a green direct canary, replay the unchanged BUG-002 focused and complete matrix under independent bubbles.test ownership without weakening rows, DoD, assertions, worker count, inventory, or lifecycle checks.",
            "Do not add a skip, fallback, broad path exemption, subset comparison, mutable inference, completion inference, or success-on-unknown branch."
        ]
    }
}
```
<!-- feature004-dirty-collision-selftest-successor-v3:end -->

## V3 Collision Parser And BUG-002 Replay - 2026-07-18T04:23:35Z

**Phase:** test

**Agent:** `bubbles.test`

**Claim Source:** executed

This section records only the test-owned parser adoption and the required
BUG-002 replay. It does not complete Feature 004 Scope 1, does not start Scope
2, and does not change any Feature 004 planning checkbox, source byte, scope
status, top-level status, or certification field.

### Final Direct Collision Canary

**Executed:** YES (current session)

**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`

**Exit Code:** 0

**Output window:** contiguous final contract record and complete runner summary
from the current parser SHA-256
`83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d`

```text
{
    "historicalUntrackedPath": "scripts/validate-brief-payload.mjs",
    "currentStatus": "",
    "currentBlobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
    "prefixLineChunks": 137,
    "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
    "volatilePath": "market-brief.config.json",
    "volatileEditAttemptedByScopeOne": false
}
✔ Feature 004 preserves every pre-existing dirty hunk (1111.436041ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (7739.492084ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (594.752291ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9544.617458
```

**Result:** PASS. Mandatory v2 and all predecessors remain parser-validated;
the additive v3 correction is the active provenance interpretation. The parser
recomputes the six-hunk identity, exact Feature 005/006 marker slices, Feature
011 and Feature 010 committed producers, unknown current deletion authorship,
the complete 13-path matrix, and every false completion claim. Exhaustive
closed-schema mutation and explicit provenance-boundary mutations fail closed.

### Final Parser Broad Preludes

**Executed:** YES (current session, twice sequentially)

**Command for each repetition:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0

**Output windows:** direct parser prelude and full-inventory completion lines
from the two executions against the final parser bytes

```text
✔ Feature 004 preserves every pre-existing dirty hunk (1208.630958ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (9760.282875ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (866.604833ms)
Running 132 tests using 6 workers
    ✓  1 …serves prior-session actions beside an advanced Tier-A snapshot (3.9s)
    ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (513ms)
132 passed (31.4s)
✔ Feature 004 preserves every pre-existing dirty hunk (1483.588334ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (10393.06975ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (921.892125ms)
Running 132 tests using 6 workers
    ✓  1 …serves prior-session actions beside an advanced Tier-A snapshot (3.2s)
    ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (355ms)
132 passed (30.6s)
```

**Result:** PASS. Both final-parser repetitions include the direct `3/3`
prelude, pass all `132/132` browser assertions, and emit no worker force-kill or
non-test error.

### Collision Finding Disposition

| Finding | Disposition |
| --- | --- |
| `F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001` | Addressed by strict mandatory-v2 plus additive-v3 parsing, exhaustive mutation rejection, and current-byte `3/3` execution. |
| `F004-V3-PARSER-COMMITTED-TRANSITIONS-SHAPE-001` | Addressed by validating the closed `committedIndexTransitions` envelope and its exact eight ordered `records`. |
| `F004-V3-RAW-LENGTH-001` | Addressed by requiring the v3 marker-inclusive byte length `18606` in addition to its raw hash. |
| `BUG002-INDEPENDENT-VERIFICATION` | Addressed by the unchanged focused and complete replay recorded in the BUG-002 report, including two final-parser `132/132` inventories. |

The collision evidence supports TP-01-22 only. Feature 004 Scope 1 remains
nonterminal because its other unchecked rows were not changed or certified in
this invocation, and Scope 2 was not started.

## Scope 1 Focused Verification Replay - 2026-07-18T23:09:34Z

**Phase:** test

**Claim Source:** executed

This replay used only the focused Scope 1 commands. It did not invoke the
moving all-repository Playwright inventory, did not start Scope 2, and did not
edit product, test, config, or framework files. Before each browser-spawning
command, the process preflight reported zero Playwright CLI test runners and
zero `playwright_chromiumdev_profile` processes; the persistent VS Code
`playwright test-server` was outside the exact runner match and was left alone.

### Current Command Matrix

| Order | Command | Result | Current total |
| ---: | --- | --- | ---: |
| 1 | `node --test tests/feature-004-dirty-tree-collision.test.mjs` | PASS | 3 passed, 0 failed, 0 skipped, 0 todo |
| 2a | `node scripts/selftest.mjs` | PASS | 491 passed, 0 failed |
| 2b | exact `CMD-FIRST-RED` after-image from `scopes.md` | PASS | 1 standalone assertion passed |
| 3 | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Browser functional" --reporter=list` | PASS | 9 passed, 0 failed |
| 4a | `node --test tests/provider-credentials.unit.mjs` | PASS | 2 passed, 0 failed, 0 skipped, 0 todo |
| 4b | `node --test tests/provider-credentials.functional.mjs` | PASS | 1 passed, 0 failed, 0 skipped, 0 todo |
| 4c | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | PASS | 4 passed, 0 failed |
| 4d | `node tests/provider-credentials.stress.mjs` | FAIL | command exited 1 before cycle 1 |

Runner-counted successful checks before fail-fast termination total 510, plus
the standalone CommonJS assertion. The stress command is the one blocking
command failure. No total is invented for its unstarted 250-cycle body.

### TP-01-22 Current Collision Gate

**Executed:** YES (current session)

**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`

**Exit Code:** 0

**Output window:** final contract records and complete runner summary

```text
"contractVersion": "feature004-dirty-collision-selftest-successor/v3"
"predecessorBlocksValidated": 9
"path": "scripts/selftest.mjs"
"status": " M"
"currentHunks": 6
"path": "market-brief.config.json"
"status": ""
"currentHunks": 0
PASS Feature 004 preserves every pre-existing dirty hunk
PASS Feature 004 collision disposition parser fails closed on malformed records
PASS Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
tests 3
pass 3
fail 0
cancelled 0
skipped 0
todo 0
```

**Result:** PASS. Current TP-01-22 is 3/3 and remains fail-closed against every
report checkpoint and the complete 13-path matrix.

### Foundation And Protected Selftest

**Executed:** YES (current session)

**Commands:** `node scripts/selftest.mjs`; exact `CMD-FIRST-RED` after-image
from `scopes.md`

**Exit Codes:** 0; 0

**Output window:** complete Feature 004 group, repository summary, and exact
after-image assertion

```text
Feature 004 RLFX/RLDATA foundation
    PASS RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
    PASS RLFX universe is bounded closed and asserts no live source authorization
    PASS RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
    PASS RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
    PASS RLFX broad dollar keeps Broad AFE EME and proxy states separate
    PASS RLFX cohort rank requires one full-graph exact-date window
    PASS RLFX orientation and inverse relationship contracts count one economic edge
    PASS RLFX cohort and managed-reference eligibility never pool or auto-elevate
    PASS RLFX pair momentum and Policy-rate proxy remain distinct evidence
    PASS RLFX CarryReadV1 rejects every incomplete market-implied branch
    PASS RLFX value and delayed positioning preserve semantics clocks and unavailable states
    PASS RLFX carry unwind and event absence retain multi-family rules and market invalidation
    PASS RLFX rights gate strips restricted numeric values from public projections
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
PASS RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
```

**Result:** PASS. The current aggregate retains the provider-storage,
registry, Bond `BASE-BRIEF-01`, Causal, legacy schema-one, versioned-read, and
fetch-inventory assertions without decreasing the current 491-check count.

### TP-01-04 Current Browser Functional Proof

**Executed:** YES (current session)

**Command:** `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Browser functional" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 9 tests using 1 worker

    PASS 1 Browser functional source envelopes match in browser and CommonJS for one decisionTime
    PASS 2 Browser functional SCN-004-001/002: Broad AFE EME and proxy states remain separate
    PASS 3 Browser functional SCN-004-003/005/008: cohort rank uses one full-graph exact-date window
    PASS 4 Browser functional SCN-004-004: explicit orientation and inverse sources count one relationship
    PASS 5 Browser functional SCN-004-006/007: cohort and managed-reference eligibility never pool
    PASS 6 Browser functional SCN-004-009/010: pair momentum and Policy-rate proxy remain distinct
    PASS 7 Browser functional SCN-004-011: CarryReadV1 rejects every incomplete market-implied branch
    PASS 8 Browser functional SCN-004-012/013/014: value and positioning retain semantics and clocks
    PASS 9 Browser functional SCN-004-015/016/024: unwind and event absence retain multi-family rules and safe projection

    9 passed (3.1s)
```

**Result:** PASS. TP-01-04 is current and remains classified functional: the
controlled same-origin harness loads production `rldata.js` and `rlfx.js`.

### Provider Canary Sequence And Blocking Finding

**Executed:** YES (current session)

**Commands:** `node --test tests/provider-credentials.unit.mjs`;
`node --test tests/provider-credentials.functional.mjs`;
`npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list`;
`node tests/provider-credentials.stress.mjs`

**Exit Codes:** 0; 0; 0; 1

**Output:**

```text
PASS SCN-BUG001-001 current-document runtime has no serialized store or raw credential API
PASS SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes
tests 2
pass 2
fail 0
skipped 0
PASS SCN-BUG001-002 every lifecycle signal clears current-document memory
tests 1
pass 1
fail 0
skipped 0
Running 4 tests using 1 worker
PASS 1 index loads shared status and erase controls with no credential editor
PASS 2 shared current-document capability owns every credential surface
PASS 3 Regression BUG-001: every lifecycle and document boundary starts unconfigured
PASS 4 Regression BUG-001: unknown and prototype-shaped providers fail without mutation
4 passed (5.5s)
node:internal/modules/run_main:107
        triggerUncaughtException(
        ^
page.evaluate: TypeError: Cannot set properties of null (setting 'value')
        at eval (eval at evaluate (:303:30), <anonymous>:6:19)
        at UtilityScript.evaluate (<anonymous>:305:16)
        at UtilityScript.<anonymous> (<anonymous>:1:44)
        at ~/research-lab/tests/provider-credentials.stress.mjs:22:32
Node.js v26.4.0
```

**Result:** FAIL at the stress canary. The passing current provider suites prove
the intended status-only, no-editor, closure-private contract. The stress file
still queries `input[data-provider="finnhub"]`, `.settings-save`, and
`.settings-clear`, then calls removed `RLDATA.hasKey`, `RLDATA.providers`,
`RLDATA.providerFetch`, and `RLDATA.buildProviderRequest`. The load file contains
the same stale editor/API contract and was not executed after fail-fast.

### Fail-Fast Boundary And Finding Accounting

**Claim Source:** not-run

The following commands were not executed because the required provider stress
gate failed first: provider load; Bond full browser; Causal full browser;
`node scripts/validate-causal-rotation.mjs`; the remaining shared-consumer and
rollback/restore determination; and every governance/diagnostic command in
matrix step 7. The unrestricted all-repository Playwright inventory was never
invoked.

| Finding | Status | Owner | Disposition |
| --- | --- | --- | --- |
| `F004-SCOPE01-PROVIDER-STRESS-CANARY-DRIFT-001` | open, blocking | `bubbles.test` on `specs/_bugs/BUG-001-central-provider-credential-security` | Reconcile only the BUG-001 stress/load tests to the active no-editor APIs and scenario contracts, then replay this exact focused matrix from TP-01-22. |

Scope 1 remains In Progress. TP-01-04, TP-01-15, and TP-01-22 have current
passing evidence; TP-01-18 and TP-01-19 remain not run in this replay, and the
independent shared-consumer rollback/restore proof remains incomplete. No Scope
1 completion, test-phase completion, validate route, Scope 2 pickup, feature
status, or certification claim is made.

### Certification And Artifact Containment

**Executed:** YES (current session)

**Command:** `node -e 'const fs=require("node:fs"),crypto=require("node:crypto");const state=JSON.parse(fs.readFileSync("specs/004-fx-regime-relative-value-lab/state.json","utf8"));const hash=crypto.createHash("sha256").update(JSON.stringify(state.certification)).digest("hex");console.log("F004_CERTIFICATION_CONTAINMENT_BEGIN");console.log("stateJson=parse-pass");console.log("certificationSha256="+hash);console.log("expectedCertificationSha256=db6d7979a282d542957c460d85ac1addb849628bd0535d8c3b0516e908fc49d0");console.log("certificationPreserved="+(hash==="db6d7979a282d542957c460d85ac1addb849628bd0535d8c3b0516e908fc49d0"));console.log("certificationStatus="+state.certification.status);console.log("certificationCompletedScopes="+state.certification.completedScopes.length);console.log("featureStatus="+state.status);console.log("currentScope="+state.execution.currentScope);console.log("currentPhase="+state.execution.currentPhase);console.log("completedPhaseClaims="+state.execution.completedPhaseClaims.join(","));console.log("pendingTransitionRequests="+state.execution.pendingTransitionRequests.join(","));console.log("F004_CERTIFICATION_CONTAINMENT_END");if(hash!=="db6d7979a282d542957c460d85ac1addb849628bd0535d8c3b0516e908fc49d0")process.exit(1);'`

**Exit Code:** 0

**Output:**

```text
F004_CERTIFICATION_CONTAINMENT_BEGIN
stateJson=parse-pass
certificationSha256=db6d7979a282d542957c460d85ac1addb849628bd0535d8c3b0516e908fc49d0
expectedCertificationSha256=db6d7979a282d542957c460d85ac1addb849628bd0535d8c3b0516e908fc49d0
certificationPreserved=true
certificationStatus=not_started
certificationCompletedScopes=0
featureStatus=not_started
currentScope=SCOPE-01
currentPhase=test
completedPhaseClaims=bootstrap
pendingTransitionRequests=TR-F004-SCOPE01-PROVIDER-STRESS-CANARY-001
F004_CERTIFICATION_CONTAINMENT_END
```

**Result:** PASS. The canonical `certification.*` hash is byte-for-byte
unchanged from the pre-edit baseline; the feature and scope remain nonterminal,
and only the pending test-owner route was added.

## Finding F-004-EVIDENCE-DURABILITY — cited evidence lives in a gitignored, machine-local log

**State:** OPEN. Not fixable in-repo; requires an owner decision on evidence policy.

`tests/feature-004-dirty-tree-collision.test.mjs` is **0 pass / 3 fail** in this
checkout. All three failures share one root cause:

```
error: "ENOENT: no such file or directory, open
  '/home/redacted/research-lab/.specify/runtime/tool-calls.jsonl'"
code: 'ENOENT'
```

`toolLogRecord()` reads that log and `assertToolLogEvidence()` asserts that
**specific line numbers** in it contain **specific recorded commands**. So the
test does not merely need *a* log — it needs the exact append-only capture log
produced by the original Feature 004 execution session.

That log is unrecoverable:

| Check | Result |
|---|---|
| Present in this checkout | **no** |
| Tracked by git | **no** — `.specify/runtime/.gitignore` is `*` + `!.gitignore` |
| Ever committed (`git log --all -- <path>`) | **no** — never |
| Any copy under `$HOME` | only Bubbles selftest fixtures under `~/.cache/bubbles-evidence-admission-selftest.*`, which belong to the framework's own tests, not this repo |
| Produced by a repo script | written by the framework shim `.github/bubbles/scripts/tool-capture-shim.sh`, i.e. only as a side effect of an agent session |

**Consequence.** The test is structurally unrunnable in *any* fresh clone,
including CI. It can only pass on the exact machine where Feature 004 was first
executed, while that session's runtime log happens to still exist. Note the test
itself calls the path "the append-only **repository** log" — but the repository
deliberately excludes it, so the assertion's own premise is contradicted by
`.gitignore`.

**Blast radius.** This is not isolated to Feature 004. Six spec artifacts cite
`tool-calls.jsonl` as evidence:

- `specs/004-fx-regime-relative-value-lab/report.md`
- `specs/005-palm-springs-rental-market-lab/report.md`
- `specs/006-trend-dynamics-cycle-lab/report.md`
- `specs/002-distributed-tool-briefs-and-history/scopes/01-market-session-evidence-foundation/report.md`
- `specs/_bugs/BUG-002-market-brief-session-date-drift/report.md`
- `specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md`

This is the same defect class as `BUG-002-scope-baseline-head-drift-antipattern`:
evidence pinned to something that is not durably retained. There the anchor was a
moving `HEAD`; here it is a machine-local file git is configured to discard.

**Why this was not "fixed" here.** The three candidate resolutions all require an
owner decision, and two are policy violations:

1. Commit the log — contradicts `.specify/runtime/.gitignore` and would import
   another session's runtime data. Moot regardless: the file does not exist.
2. Let the test degrade when the log is absent — a silent-pass pattern, forbidden
   by repo policy, and it would make the assertion permanently inert.
3. Re-anchor the evidence contract onto something durable (committed evidence
   excerpts, or a captured fixture) — a real fix, but it changes the evidence
   model for all six artifacts above and is the owner's call.

### Update 2026-07-31 — framework mechanism investigated; option 3 now has framework backing

The open question above was whether the framework already provides a durable
evidence-admission path to re-anchor onto. It does, and it does **not** support the
constraint this test imposes.

`.github/bubbles/scripts/evidence-tool-log-bridge.sh` is the sanctioned reader of
`.specify/runtime/tool-calls.jsonl`. Two properties settle the question:

1. **It only reads the log; it cannot reconstruct one.** The log is produced solely as a
   side effect of running commands through `tool-capture-shim.sh` during a live session, so
   a session that did not capture leaves nothing recoverable. This confirms the evidence is
   unreproducible on any other machine, not merely missing here.
2. **The framework treats the tool-log as _additive_, not mandatory.** Its own header states
   the contract verbatim:

   > "Markdown evidence stays a valid fallback when no tool-log entry exists."
   >
   > "Anti-fabrication is monotonically stronger: existing prose-evidence path is preserved;
   > tool-log path is additive proof."

So `feature-004-dirty-tree-collision.test.mjs` is **stricter than the framework contract it
encodes**: it makes the tool-log the sole admissible proof *and* pins absolute line numbers
(652, 730, 703) inside a gitignored, append-only, machine-local file. Absolute line offsets
are not stable under any append, rotation, or replay, so the citation cannot survive even on
the originating machine.

**Still not fixed here, and deliberately so.** Relaxing the assertion to accept the
framework's markdown fallback would make a *currently red* anti-fabrication test go green by
loosening it. That is indistinguishable from the "change the test to make it pass"
antipattern from the outside, and this session will not do it unilaterally to a test it does
not own. What changed is the evidence base: option 3 is no longer a speculative redesign but
the alignment the framework already sanctions, and options 1 and 2 remain policy violations.

**Recommended remediation for the owner:** cite tool-log entries by a stable key
(`sessionId` + `agent` + `spec` + a content hash of the recorded command) rather than by
line number, and admit the framework's markdown-evidence fallback when no log entry exists.
That keeps the assertion load-bearing — a fabricated or absent command still fails — while
removing the dependency on a byte offset in a file git is configured to discard.

<!-- bubbles:certifying-window-begin -->

## Current Planning Gate Repair - 2026-08-03T19:02:48Z

### Summary

This window records only the plan-owned repair for `F004-SCOPE01-PLANNING-GATES-001`. It preserves every earlier report byte as historical evidence, keeps Scope 1 In Progress, keeps Scopes 2 through 5 Not Started, and changes no certification field or checkbox state.

### Completion Statement

The planning repair is nonterminal. Scope 1 still requires current owner-produced evidence for its unchecked implementation and Test Plan items. Scope 2 cannot start from this result.

### Code Diff Evidence

The current change boundary contains only `specs/004-fx-regime-relative-value-lab/scopes.md`, `specs/004-fx-regime-relative-value-lab/report.md`, and plan/orchestrator-owned fields in `specs/004-fx-regime-relative-value-lab/state.json`. This window makes no runtime, source, or test delta claim. The immutable earlier Scope 1 implementation record remains the report's runtime-path and executed `git diff` evidence for `rlfx.js`, `rldata.js`, `fx-regime-universe.json`, `scripts/selftest.mjs`, `scripts/fetch-bars.mjs`, and the dedicated Feature 004 tests.

### Test Evidence

**Phase:** plan
**Claim Source:** not-run

No product or test result is recorded by this planning repair. A subagent summary is not raw report evidence and does not change a TP item, core DoD item, scope status, or certification state.

### Unresolved Owner Routes

- `TR-F004-SCOPE01-MCP-EVIDENCE-CARRIER-001` remains assigned to `bubbles.test` for current-session command evidence admitted through the sanctioned MCP carrier.
- `TR-F004-SCOPE01-FEATURE012-TEST-001` remains assigned to `bubbles.test` for the Feature 012 shared control, Brief, and Journey consumer tests.
- `TR-F004-SCOPE01-FEATURE012-DOCS-001` remains assigned to `bubbles.docs` for the Feature 012 shared-contract documentation.
- `TR-F004-SCOPE01-PROVIDER-STRESS-CANARY-001` remains assigned to `bubbles.test` on the BUG-001 provider stress/load test surface. Its state remains open because the current recorded test evidence is failing.

### Validation Summary

Artifact and guard results for this planning repair are reported from commands executed in this invocation. They are planning diagnostics, not product-test evidence and not support for a Scope 1 completion claim.

## Durable Evidence Admission Successor - 2026-08-03T23:58:28Z

### Summary

This plan-owned window resolves the design defect recorded by `F-004-EVIDENCE-DURABILITY`. The additive `feature004-durable-evidence-admission/v1` contract supersedes only absolute tool-log line numbers as the runtime admission mechanism. It does not supersede, rewrite, reinterpret, or re-run any historical receipt, raw evidence block, marker-inclusive hash, v2/v3 provenance record, collision identity, or false-completion assertion.

The future test-owned durable receipt marker is `feature004-scope1-durable-evidence-v1`. The future additive current-identity marker is `feature004-dirty-collision-current-identity-v4`. Their closed schema and exact implementation handoff are recorded in `scopes.md#durable-evidence-admission-successor` and `test-plan.json::durableEvidenceAdmissionHandoff`.

### Two-Source Admission Boundary

When a current `.specify/runtime/tool-calls.jsonl` has full-key Scope 1 matches, each receipt must resolve exactly once by `sessionId + agent + spec + scope + exact cmd + exitCode + stdoutHash + exact required tags`. Line number and append order are never identity. Earlier RED or unrelated executions with a different full key remain distinct history. A nonempty proper subset of matched receipts, malformed selected row, duplicate full key, broadened comparison, or contradiction fails closed and blocks the Markdown branch.

Only when the log is absent or has zero full-key matches for the entire declared receipt set may the parser admit one committed `feature004-scope1-durable-evidence-v1` block. Every receipt requires at least ten literal raw output lines, exact command/exit/hash fields, exact stable-key fields, ordered hash links to every immutable predecessor block it relies on, and an exact marker-inclusive no-trailing-newline SHA-256 pinned by the parser. Missing, malformed, mismatched, duplicated, broadened, subset-only, synthetic, reordered, contradictory, or absent evidence fails. There is no success-on-absence branch and no synthetic row creation.

### Current Diagnostic Boundary

Planning read the corrected root ledger and the unchanged collision test. The current ledger uses stable records and contains `bubbles.test` Scope 1 rows for the focused Feature 004 suites, provider matrix, browser functional suite, provider/Bond/Causal browser suites, Causal validator, and repository selftest. The current CMD-COLLISION row is exit 1, and the parser's three failures all stop at the missing absolute line 652 assertion. These are diagnostic observations only. Planning does not copy them into a raw evidence block, admit a receipt, check TP-01-22, close the provider transition, or claim any command reran in this invocation.

The current provider unit, functional, browser, stress, and load rows are green in that ledger. `TR-F004-SCOPE01-PROVIDER-STRESS-CANARY-001` remains open because only `bubbles.test` may admit those rows and return the transition disposition. The Feature 012 test and documentation routes also remain open because no terminal owner evidence was reconciled here.

### Current-Identity Checkpoint Boundary

The v4 checkpoint must capture all 19 exact Scope 1 implementation, harness, dedicated-test, and fixture paths declared in the planning artifacts. It must also capture every current protected foreign dirty hunk and untracked file as `foreign-unrelated`, retaining existing owner attribution without transferring ownership to Feature 004. Tracked and untracked path kinds have explicit closed identity fields. The collision parser itself uses the closed `normalized-self-pins/v1` rule: exactly two named 64-hex pin literals are normalized to zeroes before hashing, so the final test can pin both report blocks without creating an impossible self-hash cycle. Every non-pin parser byte and ordered hunk remains covered. Any volatile or concurrently changing path requires a just-in-time capture immediately before parser work, and any later drift requires another additive owner-routed checkpoint.

### Test-Owner Handoff

`bubbles.test` must append the actual current durable receipt block and JIT v4 identity block, pin both marker-inclusive hashes, change only `tests/feature-004-dirty-tree-collision.test.mjs`, add adversarial cases for every two-source and identity failure branch, run unchanged CMD-COLLISION RED then GREEN, and replay unchanged BUG-002 verification. No product code edit is authorized. A green parser does not complete Scope 1, unlock Scope 2, close Feature 012 routes, or mutate certification.

### Completion Statement

Planning is complete for the successor schema and route only. Scope 1 remains In Progress, Scope 2 remains locked, every current checkbox is preserved, and `certification.*` is untouched. Test implementation and evidence admission remain unresolved under `TR-F004-SCOPE01-DURABLE-EVIDENCE-001` with next owner `bubbles.test`.

<!-- feature004-scope1-durable-evidence-v1:start -->
```json
{
    "contractVersion": "feature004-durable-evidence-admission/v1",
    "findingId": "F-004-EVIDENCE-DURABILITY",
    "capturedAt": "2026-08-04T01:04:30Z",
    "immutablePredecessorBlocks": [
        {
            "marker": "feature004-dirty-baseline-v1",
            "rawBlockSha256": "3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad"
        },
        {
            "marker": "feature004-dirty-supersession-v1",
            "rawBlockSha256": "251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d"
        },
        {
            "marker": "feature004-dirty-collision-disposition-v1",
            "rawBlockSha256": "5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e"
        },
        {
            "marker": "feature004-dirty-collision-delta-v1",
            "rawBlockSha256": "334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b"
        },
        {
            "marker": "feature004-dirty-collision-settled-delta-v1",
            "rawBlockSha256": "f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0"
        },
        {
            "marker": "feature004-dirty-collision-script-transitions-v1",
            "rawBlockSha256": "0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3"
        },
        {
            "marker": "feature004-superseded-validator-note-v1",
            "rawBlockSha256": "7beb0c5892b6f26b52f24c229f5b2bc340befb6141683ecc92756174f02f9870"
        },
        {
            "marker": "feature004-dirty-collision-owner-settled-selftest-v1",
            "rawBlockSha256": "50f40dab7a9112bdfae30eddaa73f1bc6543383ea8dbce2b7920028ed2d32508"
        },
        {
            "marker": "feature004-dirty-collision-selftest-successor-v2",
            "rawBlockSha256": "5484e14998c3cec0105f04413dc9f25a580658d272647e2e90b780b4d5e13ce4"
        },
        {
            "marker": "feature004-dirty-collision-selftest-successor-v3",
            "rawBlockSha256": "6ebeebb0c28965925ff6a97310f380ccfce17f62e65e4794b383bf2eb2ad2f73"
        }
    ],
    "sourceSelection": {
        "currentToolLogPath": ".specify/runtime/tool-calls.jsonl",
        "stableKeyFields": [
            "sessionId",
            "agent",
            "spec",
            "scope",
            "cmd",
            "exitCode",
            "stdoutHash",
            "tags"
        ],
        "tagComparison": "exact-ordered-equality",
        "markdownEligibility": "log-absent-or-zero-full-key-matches-across-entire-receipt-set",
        "minimumRawLinesPerReceipt": 10,
        "rawOutputHashInput": "rawOutputLines-joined-with-lf",
        "blockHashInput": "marker-inclusive-no-trailing-newline"
    },
    "receipts": [
        {
            "sessionId": "vscode-e24db39cf992f7ccd8ec75209602db59",
            "agent": "bubbles.test",
            "spec": "004-fx-regime-relative-value-lab",
            "scope": "SCOPE-01",
            "cmd": "node tests/provider-credentials.stress.mjs",
            "exitCode": 0,
            "stdoutHash": "da71c907a5d058ae5f0557c68d88c2667a8e06e6be96128009d29abb8d9a5a68",
            "tags": [
                "provider",
                "stress",
                "BASE-SEC-01",
                "BASE-SEC-02",
                "BASE-SEC-03"
            ],
            "rawOutputLines": [
                "BUG002_STRESS_BEGIN",
                "CATEGORY=stress",
                "CYCLES=250",
                "TIER2_ROUNDTRIPS=250",
                "TIER1_PROXY_FETCHES=250",
                "TIER2_PROVIDER_FETCHES=250",
                "PROXY_KEY_LEAKS=0",
                "TIER2_REQUESTS_MISSING_KEY=0",
                "KEY_LEAKS=0",
                "LEGACY_STORAGE_OFFENDERS=0",
                "RESULT=PASS",
                "BUG002_STRESS_END",
                ""
            ],
            "rawOutputSha256": "da71c907a5d058ae5f0557c68d88c2667a8e06e6be96128009d29abb8d9a5a68"
        },
        {
            "sessionId": "vscode-e24db39cf992f7ccd8ec75209602db59",
            "agent": "bubbles.test",
            "spec": "004-fx-regime-relative-value-lab",
            "scope": "SCOPE-01",
            "cmd": "node tests/provider-credentials.load.mjs",
            "exitCode": 0,
            "stdoutHash": "bdf2d697b46916bbe7e32b88887e3b6a37d36106e2e9281013fb68418511271a",
            "tags": [
                "provider",
                "load",
                "BASE-SEC-01",
                "BASE-SEC-02",
                "BASE-SEC-03"
            ],
            "rawOutputLines": [
                "BUG002_LOAD_BEGIN",
                "CATEGORY=load",
                "PARALLEL_CONTEXTS=8",
                "ISOLATED_KEYS=8",
                "PERSISTED_ACROSS_RELOAD=8",
                "PERSISTED_ACROSS_NAV=8",
                "TIER2_PROVIDER_REACHED=8",
                "KEY_LEAKS=0",
                "RESULT=PASS",
                "BUG002_LOAD_END",
                ""
            ],
            "rawOutputSha256": "bdf2d697b46916bbe7e32b88887e3b6a37d36106e2e9281013fb68418511271a"
        }
    ]
}
```
<!-- feature004-scope1-durable-evidence-v1:end -->

<!-- feature004-dirty-collision-current-identity-v4:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-current-identity/v4",
    "findingId": "F-004-EVIDENCE-DURABILITY",
    "capturedAt": "2026-08-04T01:15:20Z",
    "extendsContracts": [{"marker":"feature004-dirty-baseline-v1","rawBlockSha256":"3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad"},{"marker":"feature004-dirty-supersession-v1","rawBlockSha256":"251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d"},{"marker":"feature004-dirty-collision-disposition-v1","rawBlockSha256":"5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e"},{"marker":"feature004-dirty-collision-delta-v1","rawBlockSha256":"334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b"},{"marker":"feature004-dirty-collision-settled-delta-v1","rawBlockSha256":"f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0"},{"marker":"feature004-dirty-collision-script-transitions-v1","rawBlockSha256":"0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3"},{"marker":"feature004-superseded-validator-note-v1","rawBlockSha256":"7beb0c5892b6f26b52f24c229f5b2bc340befb6141683ecc92756174f02f9870"},{"marker":"feature004-dirty-collision-owner-settled-selftest-v1","rawBlockSha256":"50f40dab7a9112bdfae30eddaa73f1bc6543383ea8dbce2b7920028ed2d32508"},{"marker":"feature004-dirty-collision-selftest-successor-v2","rawBlockSha256":"5484e14998c3cec0105f04413dc9f25a580658d272647e2e90b780b4d5e13ce4"},{"marker":"feature004-dirty-collision-selftest-successor-v3","rawBlockSha256":"6ebeebb0c28965925ff6a97310f380ccfce17f62e65e4794b383bf2eb2ad2f73"},{"marker":"feature004-scope1-durable-evidence-v1","rawBlockSha256":"3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd"}],
    "requiredScope1Paths": [
        {"path":"rlfx.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"139b41b18f985b5d5b29cf6627e43bcdf154764b","indexOid":"139b41b18f985b5d5b29cf6627e43bcdf154764b","worktreeGitOid":"6221c546b83045e65daef4712ab44ac244ea17fa","worktreeSha256":"ea90a95934935a1d3a6ce57a53baeffa1201e113ec9e9fd9ca06d92bc4204349","hunkCount":7,"hunkBodySha256":["460c257499dc897d92f59989e14301aff7356a62a819fb17acacf0769a7046de","e3c41ddd251bd7d2ebb2d4c9de3279c7dadef322a8ff5ad65a05f71fae44e668","4f355f4408c718758bda3eac11f58079ac799ef88c044757d1bd88d589feef41","ce227cd07a3f0c56db3cbeac400edcb72cb22eefa009f89545639fa53ff68860","ef3f8f61c0b849e231de2229f2bbd13e745e19656c8a36cb8410e6d55523daff","f2da74583f54642c9eeb3c90970619e3bc0688c7d7b6d0a2a68f98b7faac9379","fd10202a7cd0107ea494ba42559a11bbe2a49b6a2b4b7e768d4e7b1e54231db7"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"fx-regime-universe.json","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"75ab66d267a4df54b05d00f4d59ca88452eec6fd","indexOid":"75ab66d267a4df54b05d00f4d59ca88452eec6fd","worktreeGitOid":"75ab66d267a4df54b05d00f4d59ca88452eec6fd","worktreeSha256":"8abeecdf6ea23e5e15e8080ecbd9ecbe4b507959b7637ec79c4a7933061fc927","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"fx-vehicle-universe.json","pathKind":"untracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"c970443312c21c45a4fc562c876c159a1db5fc26","worktreeSha256":"96c9a1f910dc54d78dbd62faf6e7d3804736ed7c75f1d409e8c699dcbf2f5da7","hunkCount":0,"hunkBodySha256":[],"lastCommit":null},
        {"path":"rldata.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"3afe3b673746e7be23790b4846a004f4a7f3c5ef","indexOid":"3afe3b673746e7be23790b4846a004f4a7f3c5ef","worktreeGitOid":"3afe3b673746e7be23790b4846a004f4a7f3c5ef","worktreeSha256":"fc65480db17ad92600e46832ea86548378acc334e1b3454f5bac133966088772","hunkCount":0,"hunkBodySha256":[],"lastCommit":"76168e86e2030634d9fa740026c2f1e9733de53c"},
        {"path":"rlexperience.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"8c7eec663fb4e9552fe1fdda77ef9c29282cb2c6","indexOid":"8c7eec663fb4e9552fe1fdda77ef9c29282cb2c6","worktreeGitOid":"6f72ca10decbb4544de5627d729aa54ca7839d07","worktreeSha256":"b64c6f7fe1e008f4fd8d2d4d5d1228b334acab78e8ce0364f8b56b3acb462c78","hunkCount":3,"hunkBodySha256":["3176fdc4dcf7f08990a7bda3b89e647020095dd8a085890e010c3e4780a03c14","f2cf150373099b27fd8c38206b407842c026350976e4d239bd483649802f0c98","bc8cecb3e6caf70c81f78d5f1e4ec93c38167fe7fa38fc93e4c9720c94df042e"],"lastCommit":"b55fb10a0927b9d9741df08f082c2bdc26bffdd1"},
        {"path":"rlviews.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"dca0b579390907f8f1b59ee88a5082c5f311b5a4","indexOid":"dca0b579390907f8f1b59ee88a5082c5f311b5a4","worktreeGitOid":"dca0b579390907f8f1b59ee88a5082c5f311b5a4","worktreeSha256":"4aba205dd62ce44af83df0aec29438382fa40dc980220a929a0c87e0b6dd706f","hunkCount":0,"hunkBodySha256":[],"lastCommit":"5d30675c3743b78e879ab4b1f26625bc014f0163"},
        {"path":"rlbrief.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"b1109e02c94e20211c904279e92c2c1fdb525bc9","indexOid":"b1109e02c94e20211c904279e92c2c1fdb525bc9","worktreeGitOid":"9a6967914e00c0f6ba379bc15cd9a592691bf5a8","worktreeSha256":"37b0b447e658e64334a7ad600da1298e80d6ad937e2ee95cb1947d47bac5e32b","hunkCount":2,"hunkBodySha256":["6aa615d3a7e4581cdaef6729d7a69fbc94329fcf7db55af8f62b4eab81c09ea3","af97849a3df0f94fb01d03b94df3d8fa1a14f9b924cc980af254ea0e96151f8d"],"lastCommit":"8c6a6cbefada657494e63edd0e65464527166aff"},
        {"path":"rljourney.js","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"436768746a54852748836fb3a7e2ccc04f2da82e","indexOid":"436768746a54852748836fb3a7e2ccc04f2da82e","worktreeGitOid":"1879f170a71b1f05df96d9466e785928163eac1d","worktreeSha256":"3230b836afeabbb675d308a0d8b3c4dc19740984a79aefc2d665dbec8a6c37ac","hunkCount":13,"hunkBodySha256":["aaa1eb2c7bbb4fdbfd542efaec3d12c5701eeb103e2868ad3e27c71724556edb","f84061a9099778b892bcad094e965b72101436e2d22b192bdf6810a6fca83b30","f14b74d30ea20adbafa74c3604e5f7cb02b7d7fb7a799051b7e31b956fce28ab","8af37d7ca422a18a4f4f972d2756c555946e4a694a255b370d454669add32ece","9ebdfce8499a8cc3971f17a5f78a61736827c6691b028e78659a3aac163aa12e","c569e3763ed77c494bbf78ead88ee5ca8a565e62a6225ad9b9735d0ac561767d","003915253b02528a103874aed1bb2ba1b7c7af180e81e9206ba0aee97c671c50","540243d530562a950a8500887ac3fd6324361d4e314ffdf7648f34692d1cf29b","79584706335ef984845f5a07dd1c7d7cfa0d9f5dd9dc03ca0226f40ddee74c90","a6d4c631d11968c3f99498b4ecc76cbe64ec0f42d5b15dd6ba4c036c1a7ee864","102cd9d7094ade6119761703a584e5000be0332dbea9857d7af9623a5c82fae8","bbb869c95de5632fcf17b6ea414c5eecdf4192978e860d4d5d60d7c83d887039","2760e22c6a539c81cd5da277b672443a87da4d62baaf5b91059b2b4ef6e67417"],"lastCommit":"16252f08066068258f9cc6eb1f1ab48f39e1926f"},
        {"path":"scripts/fetch-bars.mjs","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"6384588c656492cc7dcdd9370b0d80ccc7d08ac3","indexOid":"6384588c656492cc7dcdd9370b0d80ccc7d08ac3","worktreeGitOid":"6384588c656492cc7dcdd9370b0d80ccc7d08ac3","worktreeSha256":"d92c94bc4ec0a42c11251b140c9a2fda87dba1e2a11334f0999503fee662c1b1","hunkCount":0,"hunkBodySha256":[],"lastCommit":"a8a99824b5e4e0017021a7ca9a3c946ea94e85cd"},
        {"path":"scripts/selftest.mjs","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"0a2006c4633557589d87e1b711b5cb69cdebfbbd","indexOid":"0a2006c4633557589d87e1b711b5cb69cdebfbbd","worktreeGitOid":"25ccd16bf7ad9afc1af6c48c18a9ab2a346b07c0","worktreeSha256":"0daa10d20fad944144f65232b006cf92a40b846f655ca4fc83f5f7e8e11522e4","hunkCount":5,"hunkBodySha256":["9c5590b5a3eeab4bbf136afcb8cb3fe121d901f60304c2eb4bdab601c6c31d99","4b8f4e441e4c7613f27f1cf53d21d07a54b08614a784e1fa0d36da4fb13870cf","d2094f627c4c0a3085fd30e1912c5eace6f0b8a9e73ec5559714cbd0c07ba880","9a5a184464053206f35003bfd1f50cf1c28f5ed610d76440661c907a91e1cd70","51e5f6749314834fd7189a653ab6c53e0d66d4a9ade2a9022a5d71d639395980"],"lastCommit":"3d35a9d81403e5dc7cb7f7a0a0ede1db9211e899"},
        {"path":"tests/fx-regime-relative-value-lab.spec.mjs","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"a0a3ad4d8651523a46062e87ead88e8f28cf17cc","indexOid":"a0a3ad4d8651523a46062e87ead88e8f28cf17cc","worktreeGitOid":"a0a3ad4d8651523a46062e87ead88e8f28cf17cc","worktreeSha256":"05253d1da36f1c82b4ca4a92bf9074a954eb5b73432256488607d2729adba306","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"tests/feature-004-dirty-tree-collision.test.mjs","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":" M","staged":false,"unstaged":true,"headOid":"1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5","indexOid":"1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5","worktreeGitOid":"f40a1097202ef9742d20c2bc1fe9576061748b75","worktreeSha256":"a725c2ae0195398b821ad67eb982e6790bd2a17fc316084e00e09314c2b052a1","hunkCount":24,"hunkBodySha256":["483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc","f0ffd40a078bd4e94baace9ba4ff3cf88f5b5e6938a2e7ecb7acfbe725c41af0","a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d","93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008","d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1","082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a","eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4","5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7","dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1","fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3","cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5","4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb","012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4","b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e","6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd","a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58","56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d","2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a","f2b1ad844eb6a93aa4ea221a12e2050b1f7027031e97e4fe9fc6ae943120a7af","377330b9749d396b437589aceeed655461b219255b43e2c0380d29e7c33ed90d","f14ad05698a65d2392cdc631292381dc1be25d14f831a01570ea18fb6eaf9e9e","1a0acead5e92707cb01b43f17d69c86ea7a8da5cca74399f82212e2a2c246820","d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b","6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b"],"lastCommit":"248543eae6a400f98f086c01ab9669558ec94fd5"},
        {"path":"tests/feature-004-vehicle-universe.test.mjs","pathKind":"untracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"43dd49baf798ba35c16a7b55958ad69a182d02da","worktreeSha256":"ed7484a05b307718a9cdccf680737f9e7e2236fd3eb76d17999fe923fb898fea","hunkCount":0,"hunkBodySha256":[],"lastCommit":null},
        {"path":"tests/feature-004-tool-control-binding.test.mjs","pathKind":"untracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"2f9a503e09e99a15b3bab0f83de0e905b5fef37c","worktreeSha256":"254b06bd896ad23cb551519ac3c09b02cd5e9844f85ba0e14ebd8a89e842dc33","hunkCount":0,"hunkBodySha256":[],"lastCommit":null},
        {"path":"tests/feature-004-brief-eligibility.test.mjs","pathKind":"untracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"90ce6957c0a2c2c8e23564219d6dc575ee97cb55","worktreeSha256":"839a63005a4a6c2590b057991a7a0054509d1a7c573d2e5ebb7088f147e5ba30","hunkCount":0,"hunkBodySha256":[],"lastCommit":null},
        {"path":"tests/feature-004-journey-evidence-refresh.test.mjs","pathKind":"untracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"e3af42bc77a84700139f35da3b531016ad71dcce","worktreeSha256":"b90647c274eafa3f3ad58b3f8de8747b163c83d343d4ddaf39a2037089f923ac","hunkCount":0,"hunkBodySha256":[],"lastCommit":null},
        {"path":"tests/fixtures/fx-regime/commonjs-determinism-input.json","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"76ccad1bf3e9b765c41bd4018fe44e02509ec14b","indexOid":"76ccad1bf3e9b765c41bd4018fe44e02509ec14b","worktreeGitOid":"76ccad1bf3e9b765c41bd4018fe44e02509ec14b","worktreeSha256":"ee8f285acd1b5486b23368f9bea8f09c4841bee165466dac17d983ea0f11ed70","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"tests/fixtures/fx-regime/foundation-cases.json","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"51d0c4d4b7cc71aef0e8da90f67e42ab83f45c29","indexOid":"51d0c4d4b7cc71aef0e8da90f67e42ab83f45c29","worktreeGitOid":"51d0c4d4b7cc71aef0e8da90f67e42ab83f45c29","worktreeSha256":"97fb1b6764315844d01e92501dee0b0e85b297b55e448977a6c30723b956dad4","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"tests/fixtures/fx-regime/foundation-harness.html","pathKind":"tracked","classification":"scope1-required","ownerAttribution":"specs/004-fx-regime-relative-value-lab::SCOPE-01","feature004OwnershipClaim":true,"status":"","staged":false,"unstaged":false,"headOid":"1cd59adf65d855843e9c81c754d3a5e1a7752328","indexOid":"1cd59adf65d855843e9c81c754d3a5e1a7752328","worktreeGitOid":"1cd59adf65d855843e9c81c754d3a5e1a7752328","worktreeSha256":"968401c534357e001f1bf23315844684fcf983e08ae455a04e1ea9cc1e72d523","hunkCount":0,"hunkBodySha256":[],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"}
    ],
    "foreignProtectedPaths": [
        {"path":".vscode/mcp.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"40104920b4105e12d3a01d9822af858c1c6ae74d","indexOid":"40104920b4105e12d3a01d9822af858c1c6ae74d","worktreeGitOid":"1f8a0c6555de9c82aa03f040fb4bcc4b1fd30225","worktreeSha256":"1f00297e2044f12303fbec8574bd339bbc981c2b6c3e3384339ee6bed533aa76","hunkCount":1,"hunkBodySha256":["96fad9d268098b8ca2793c8425bb8a36c34f0151c6baadf66d86d52020404815"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"docs/Product-Review-and-Roadmap.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"5908e77e172fb78f7ef5dd2db1203aae7fd2016e","indexOid":"5908e77e172fb78f7ef5dd2db1203aae7fd2016e","worktreeGitOid":"f23c99707989d580ffeca6c50434723380c0c763","worktreeSha256":"ff8cce305ac0385e99468de29205e84ee31f645e05f171eb8cedb6b891ed7379","hunkCount":22,"hunkBodySha256":["40176ae5f2fd464650ca58f7dc1418000778aa030a833849ca73fa0c7cd71e6f","c2fc7186a7065431cd96698264544aca8692ab2ef1dfe819c552486b0de0ffc6","1bf7916f52f145246d6f5d6af63f51b7ad235bb924d00af2ed231895c6249e51","c898b3c4ceb05354cfd53927723fef141cee2e5e42b381cd86b812c4ce78299a","78d6f39d3d15fc9f75a5d782a30481755e272541c6f288f2f828a1e24e56ede9","9a826b1633153762527d70a30df0bd743c6fe88b963d6f8ec514e0f881105c11","3ab6ae72fdef851b3bc133d3df0071b58997d95418f1b1800b07dd7ea622a88e","d3ee434ec8900dd1a85dd90119ea84c3cb6702ead97dbac8777e5ce349bdb17c","62e7bd1559f26066d6968ecc73f5c73f2281989d10315de9e9335711eebf8bc5","1ec0d81f07ae7f0c1bdb6bcda9bb6072f6901dc8b4678443ac2ae49fa6e50d79","841f1222eb2a9e9910d5e61787f8dd9878fa5233c02c9cb39976972ab2f11acf","f7563d17145dc8e476313c04af545043d47bcc3a9cd48f842ae42bc9e0aa7152","1731322e6747831c90e984d216682edc1747b5d2df500116e9d43abb35acacb5","c80816800a9f6cf410a86b121a0a87c8755be294c1795c0e7fa38d7e90ba571a","1fc1863a8336fe1623609c2bc3052923f58398e564e42ca587aac6732d576881","fe919b89d0488181844118d28a8c7befcefa7a54a89de24f36ee09aefae0ee27","800abd9bd9362c6646220c4a9fd760a419bfeb0510d438325e5a7d4a2c0e29fd","013fbfe7ae59bf5c8d2096238f1bea7b8518a515b7b9b0a85c2938a87d6ecb6b","7129c5219ca7026d43dff3110698e58716e268b7fe4b5042b4b52ce90f4f9a6a","f4cbd2d99b0445e7852e57982b60988852fa71a6df6155c4661e421cbfe8ce3d","472486e79a7de2cfa3dd938f46ca22d199a9e77511c1f857e3c13a66e6e8f114","eab169ccd6d6da24b04fc2616c6dce1c675c84bcf4ee43fbecdae569f69c33e3"],"lastCommit":"225455ddc40fe995c9e2203f613a57a5bde57e3a"},
        {"path":"market-brief.page.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"53484c1bdd2eabab0590dd5dac89bdeabcb0e5d5","indexOid":"53484c1bdd2eabab0590dd5dac89bdeabcb0e5d5","worktreeGitOid":"c55cbfa4eacfe60f61d67f56d31f34d76876da0f","worktreeSha256":"9792a1a53e8ff5916cf5cae33d69e616c6b7e783f72c4fbecba09f67991c601c","hunkCount":1,"hunkBodySha256":["a834f27ed6982a084b291913eb7a43d04c1f1e5872ea8612a531e11faea0b1d2"],"lastCommit":"4bfbe0aec1a8c69b747e5eb711a669b254d66cca"},
        {"path":"market-brief.payload.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"1d976fe2b8187bc09d249adc5c1a34077b76040b","indexOid":"1d976fe2b8187bc09d249adc5c1a34077b76040b","worktreeGitOid":"1ad26c4bbc4e95c8a3a727ba93f7b12743d29bb4","worktreeSha256":"656e390b4796ad3868c7cbd47cee7fcc0e98ef0caf3dcc45a9a7b495c7597cb3","hunkCount":3,"hunkBodySha256":["8ff942b2e73379828d484e52e9c425a10ec56c98d5779bc514beef4a33e840d1","711c3adab72880be532bec18be084642217be8dd4d45ebd3c7f9a545a538bc91","765b9839846ace258e6b7667dadb7d02248df9acba9e6c459089172f1f0d9c7e"],"lastCommit":"4bfbe0aec1a8c69b747e5eb711a669b254d66cca"},
        {"path":"scripts/audit-reader-legibility.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"9922c89f1ce0facb0ffc6506a053d8ce78b0d747","indexOid":"9922c89f1ce0facb0ffc6506a053d8ce78b0d747","worktreeGitOid":"58f74f93f1c0e4dd7b924da90c1d4af01e48762f","worktreeSha256":"526720add76ac2bcc9f8bac03f1e20b3d386f96f56bec863141305c813574c9d","hunkCount":2,"hunkBodySha256":["15fa5c8bbc209aab30c4b9d4712c991dd693ffa8219e7410bd45907be77cd7c4","4c82b6cc05427bab22c20a518c925e7a85615bb7d2347ee490f0b1b5b8760fe9"],"lastCommit":"f04ddf120b4747a5e679df148dd125e752231a41"},
        {"path":"scripts/brief-narrative-parallel.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/012-market-action-center-and-guided-tools","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"041130a7cb7a4546e8a2015873d221d646f7dbdf","indexOid":"041130a7cb7a4546e8a2015873d221d646f7dbdf","worktreeGitOid":"e6e32e213dcc2fb5ed560759aa2b40a51ccea1a7","worktreeSha256":"c2be11bf7df1a4018f476d243de2eb8571a091adc05e419a7a6f97cf2e095bd3","hunkCount":1,"hunkBodySha256":["bfa4f9d9969bc6463af6fecdc297271ab905e43cef128f3b5824709e5c7c32ae"],"lastCommit":"c1712252cdb2af79b2dab32774bde74a0a037961"},
        {"path":"scripts/brief-refresh.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"74c4993c6fde668b7d1d990f1b36a95efc22b69b","indexOid":"74c4993c6fde668b7d1d990f1b36a95efc22b69b","worktreeGitOid":"9194b4945ccb8a485a22eed5b9b8246b9db79faa","worktreeSha256":"abc4526d92ab90f9da157e4a76e7d9c9eaaeee226ab070305f90592532303d71","hunkCount":3,"hunkBodySha256":["d66267aed028c365d7c7ebef1e6f7fbdc5a5d33c08d1660b9920ef030140afc7","bc0a19b2b589bdb79e8ec6c6fb6bb8b99c5df2e04114db46ba6475fbcda720f4","9a369dd4c785f25b401cbe98b5249299dd9cc743f0993a623376bead3b669f5c"],"lastCommit":"89c373246e0cb41523772ef56c812ce6d44ff4d2"},
        {"path":"scripts/owner-state.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"c7fe54f64f9f439db19058e50c2b1f827a1ca97e","indexOid":"c7fe54f64f9f439db19058e50c2b1f827a1ca97e","worktreeGitOid":"68c39c6b1a4d53eac2131ebad70680d8415a62a2","worktreeSha256":"7e4d624566d5ad4771d0ee5165cd27a3a30eb4b9f54d8948c16d0b65abbaae7f","hunkCount":1,"hunkBodySha256":["f555a28523c4b62dbd01e503a38e1627ffccba2dde7facde127715da45510d95"],"lastCommit":"a9f45aba1c3b538b470e4f4a2333e6c2d2d5ff11"},
        {"path":"scripts/validate-brief-payload.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","indexOid":"7bd6639ce774a6b2a04f5cebf5254684a9f3ba28","worktreeGitOid":"65ebf47f452b61c673f82418715b0b4097d98485","worktreeSha256":"c080caf4aea67b0cfa321b80f5ecfce0d9c9b037793bf0b97fbd7081e4d834f0","hunkCount":2,"hunkBodySha256":["bdc485e3f023dfc46483489ed43a6ae07b291504ad649c726e2ba516610f8cc9","222fc8a1d8527b6f6cbbc6ffb1ebb49c8e336cc7a4ca60cf70a3a8ecbdeb1911"],"lastCommit":"932efdd9912bfc264ae96ded90f6410fe4cc5537"},
        {"path":"specs/001-causal-rotation-intelligence/state.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/001-causal-rotation-intelligence","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"a18bd2627a3c8328415eb2e945d3806afc85572f","indexOid":"a18bd2627a3c8328415eb2e945d3806afc85572f","worktreeGitOid":"04271bf2d3453986e5ad166ddc4a48e482d8c4e0","worktreeSha256":"f06d6b0881dd1b9020ef64b6f0c451deaa208c43d8ebe35b3abf8560c6195811","hunkCount":2,"hunkBodySha256":["ff682802543a5d797017cef4d117fd61855aa287a95d42e280d92491cadd0e1c","84208f26ef49abaa011727ef3b50bffe5c5512130d3c52a161f686ffee73ae70"],"lastCommit":"de0c03389a343e5154af40e2ef885b59f3f75111"},
        {"path":"specs/004-fx-regime-relative-value-lab/design.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.design::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"536d9137c34cdcd44da76db2269ac5b2bca4a56e","indexOid":"536d9137c34cdcd44da76db2269ac5b2bca4a56e","worktreeGitOid":"d39ec89147a4f452dfa1a07d1e621c81a2331f37","worktreeSha256":"eb88414fa5c49c3d6ea9470e941c451cd8f0eb497aa8b47f944b51631bf48b8f","hunkCount":71,"hunkBodySha256":["63e41a79752f6866888010d9f5106b5c424d7ea09fe8894e060ea7cba9dbeb3c","39424b297d8345973aabd40c9f99c564ff2eeda27881a13eea6e03de813b5f6d","c4b12525d7151455a761aef6d1ab411c7e86e58930e4b34cd806aa6af32da09f","32440cc3ac89c46112d6a1c09b0f8ea67b8edd156318c805600304e0a36a6a15","a84053d3ba0835bdf5b76ced958e89c9ab05d94d4f882c36eb2f8adfd3e2cd5e","9041448d52633205ffddc954269f52a61a27d98828915d70c4eafee3125f5331","3835d39eb16bfdaa9cc270f2c7581f5315b8c515957547f82b696d56ff736cc1","c23f63961f7aef1bcb8b5627d7568b9673e316d621c794ec05c7c1586822b653","97bc74a4c349c993cd0fa9a6b34c59beb8cee5c0c219e239027c275b03e17c9d","0f91bd4eba5699d7ed880ce521400d9071034608e5e80cea69e238cce49abecd","4968093fb22c7033bbd39bf568821aed1afc56a037767ab0338319fb4d884b39","3f9aa36812a46749945760f305513b45b6e9e86795badeeaf1ac4183a0129638","b8ca869753fb0c4fe4020e6e266ed0c97582eb1f99f16305fd1a0375d300f620","3680ba59c59e31e927bc1b1d455eed0e721d274fabc05dbab38ebf89587f7787","4806bb49555717ff9c772439e6e12b83f0e6fcfa51a3878c4e426819603b4ec4","3dc4ccffbc4454cf92792dbe40652dbe80362f267dd020dc7813df854627b5d6","cc33b5263a83be909a7a4a015707a6a6bf973b2c542e4e1718704c834ab27a9a","52a42604021423fcc95545943a2df131ad133371bc9c29e77e7bde8b797c4691","db22b72f4ded169bb0c096f6eb634da15ef9cb99ca69c08258b662397405be89","fd10202a7cd0107ea494ba42559a11bbe2a49b6a2b4b7e768d4e7b1e54231db7","80040692b68468ffdcac8a2709080471dff1f3d0fbede270cc166f733785068a","fa972e21af1b46a1457a60550f1bbe294dbec39c90f288a8ec50e1917acbe06c","ac25866291f647dc09d6b9e5e04ce0fefffeba0b7518e31f8259f1668b588dbf","e96b4c837c4235913522b3c80025ea9d352727bd48d344e52506b2e9ba0458d1","870b73c487ea1daca5bedeba0d18687e4074d99f8096881278e588aadb428558","c0216f6637bc06964a40b222d589c8215c745ebd8d648bb58e179142452f0b78","9bc12c7152615c2f2e3f611e19ec81689e92785c3ad870994d9eaa4a7e85f6e6","5ed4b58c0658bbb5ba64dbf4a670d9fd4cde284d50521baf282c703be497d7c0","70c4e112081a7be694800ddf964f4cc09bb08f23546ec078860a17633485fa27","90bb21ecdaaba3a87d44598690aec357a08b177d30c21d8fe5ebe8f77e14f6eb","44ad1ba64a60306bc6eb123762c40f34acb5f1df54a4622e317ddf66f777020b","d3ff2398e1060f77006a3d2487bb29471279e217d1642813e0b86c331955619b","2b26193364e16893f2d1161b604b0ad08c2ab68101f91cc42add616a578fbca8","d869b0989d5629324d1977a1cefb20d9baad5f0c148183cf07bb2db5cb5056ba","a15098dbe7906c2be1ab7587085c77a009e823b9e2acd2545c70d8c6a6d66446","8adfedced96549951b0ab45d7b18982d73ed067087c19739712a44f088705a5c","2bebf7e2c9033ec531dc1097a047c21d7897d60890923d41f4f2cef27f38ca2e","e9518e0ee1bc49ba1de91f92484ca58cfb4aa08b0f1dece4462fb61ad637f88f","e7c0c765ebf619999b2e6e4457b98b19d8ee100f1655080db5293c1e0a8f86f3","b4d43bcae77b6095d92ef2c8aa7754fe3325d008ce81894632f061a230d7c15f","f105f89e3f25db666c3d5da1c54877a66704383ec73d6bdc65066611d0b8038c","9b46d61ccb352558fab201cd26c10d893a05c8f3c92d33f0f9dbe4e96dc320f9","aba3848f688f5f9200dd5c6080483cad39b3c7691099b889fb92e5e5479f3261","8c08f72211437baebbe804a68c53ba100460ba5fdbc5f02e281b85d45d918867","1697aad234f161c7ecda8e6b3c010db25704937ad27f70818bbbbff0bdadf89c","dd6cf756e0394719e9f15b34e14681be8fa03937028aab70e4ad2c354c0ef62a","8559cc02da6f1f7710d046c001883230574e96b9c48546a0d441adc3d186095b","979d7ed1364ed800084bc819cc6a2baa11631338644bde31023b3cc02c92f7e1","af5d62298c0624a8433adfd736c8c9b1c7110f2a6020e7b6b4f6a75236fc05ad","a2bfb243b0242418fb735618091be413dd06c97456099583ad76ad664e64a056","a50c97195c1d1dcdb8576603d480c3a62c32bfb53ba5bef8a15144f5ed5d70b0","4aafc66687b57dc0d5e1598f12c3a0cbbd22e358ab74367567a5a1764b09858a","4909cecfb7db6066e773ce70dc73fb5b8778d5c8ec98f605c03e9ef5fd1c7d57","c13499c703d2804f5d3e9614fd6ddca01ee858d9a92f8418fe7e036111285061","0fe75f470e7ebc43b9647923a1540e5795d78c79297feee9d93af9a189971ace","288d55b61fa90255bda397542d2d4ef977c8066358548597eb8c0db5563b7bbc","e326492def7b93762c46777e8fa758d9c6bbd6d3fd9de84d230e8eb31a7606bb","4023e95871b3457257b75611687b113a781b9d76ae6bd1441d4d96e68965f8e3","d412f4265a85cdebbadf89cca61c2310b97a576a14e73a0409f1a29ccb6e5ef8","166926dbe30bbc2f5ef53dbf3e76c1aa4bbfcb19cce320c36e3eb23d46c86b42","6c699ce240b2be2ead335ea92d7e39a2b6d4c6abc8b2f44c21b5bcb9fc830872","a8e4d8f2768254a7866b834a00f11d6e93c44ed8df96cbf2ec418570b1f02937","3de8c315d2fe75ef26691950c0cbaa4274f0b288a6fec0e77e8eb5e161672563","7de9ed2a67a2c70e48c57eb8d32f5a734c5588bece5374b96d15b2ed0492f17d","8322ccaab446c7eb5f8e494c225de8f596f99dc0509754852b044d2fefeaac93","7d508ea4a9ff8445b22ffc9b4184957eafd7d64ec6905cb4740e2f3c3e6f48bb","610ed3f3d469c513583ed04427fc1b2c274c554871d7c239c584f9f4b896ddf2","b8b8a6f942631d6e392f9e53cf5deaa43ed1fec6e17e257d863a56350f74ceab","4ea5a40ad699d0291d1b3ea9ae4cfa25a2fc3a70091d905a5b4b30dc5dfdd01b","74810fa85a2394601a03f1495427575defc0c4f8a84bd9f13eb5619e6cbc9ac4","39f16d0df2a92569030eff734e8a1e399930b40fffaab60f6c5d444f50d23c46"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"specs/004-fx-regime-relative-value-lab/scenario-manifest.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.plan::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"e5415a4e86d3728665347503e6ef30ac052474c1","indexOid":"e5415a4e86d3728665347503e6ef30ac052474c1","worktreeGitOid":"afca194101adb4f34867a07f283f1ccc8bcf011e","worktreeSha256":"62d466dbcde311b7d6b81b084da3cea844312d2008e79ceb5a242f5fba4963ef","hunkCount":35,"hunkBodySha256":["776b13da1e94107002b36d9707f659180ed1f493cbca7f2fea3ac1c28ee69b1c","72669b2d482b9b711bad8567dc9985d17e8c0184f5c984f1ac3fb01dd0df517d","339f9928d8bd1af673d405fd261cac15646972413342cb06f150f97a529e7285","571aa24520a4fd60ade97b98a012232ee23382ce8b5dfe573b63cffa357a6732","44ffd63bc5757a5310143bec1a8bf2b07454c7ade4602fd1a6378b01b598c184","b530a9843f88b9d930a9c89528edddb4c815e7adf28cc0d7952cd468136574f8","67b546e92e68c05a1f91cb0d3f7bdc6f9b01e2df5d45062993239f6a4691d586","d506714516fb47d871144cb549aa9e0642458ee9942c6d0c5ed67ddf8433da3c","2e3f605265e5ae810071cafa80bfce231d5ed41c51580195846a47b0263e6676","4f6ffc782dfe62fa9d6b9d6ca1a24e7e8d3fc42b9ad5b5d660e42e18b53c841b","53fcd3da039c279fb5bf789fde22789d6c3145f8f23ee0b5e5ce31c2de202ba7","a8f36a3654095d69051474051dfbd11cb5be0b02fb554247133576b8ca518e43","ab76815386ec242eacf7cd6b74d7cc9537da8b9b828423646718a4235e71d255","d2f7444a44f8f7f3fd3ec5ce007cd6c55847521047a04acda5db7aaf526de7ad","d3d3ca7e5faefa6aa61fab837033628fdf3150e9a44d3ae72bc04c52370c19a2","3a00939b23524930b38e29900d8361d5caf8c55db830b9f3cdcae20c2afa18c3","5a33c0a5e4db72d3af5a501afca24790f570ac6fd0a9ac6577a0a33a8ff1750e","6dd739988fb61d8827a42462ecf98cf539386e1c01f9278bbfce2d570ca2c971","4be29e4b5b73b1d2e3899c56d305584844fdf0a266beae55e5fcdc9e09948a5d","3fd0bb001002e3427e82044934453607b9f5621fd7874088c3284cc25c5dc442","1ba97e168390c08e9f58b7fedc7d1a9f449fef38d0e59300e351540bf6d60f6f","8032915005057080b891d9d6f47fa000e04281a9c856e269f0c35b410721b446","449ea28f60750f5cde95d99dfbb29bd819098a63284458e359ce6270919dc495","906b60ade354b9394adb0d7983419d62cae374ab84eedafc12ab7b7e50e1decd","1155bf29080fb81384dea5abcab473adb981b5a7c51895271e4af641d82227a9","a446d96c0ade8fbf442c483b4d9b26ccad8f2e145c8981793210883c2a463309","1f0b15c9d7b572e2d0f33f202ef22eca85dc3b6a1bd3374990ee2870edb50da2","db42de9085ce910ef3e54be83c6cf6274110be400cc7b4899c471bd2a04cfac2","516b43465f158c52608d3661f9352234515d87609e0d0661ea57c08aaaf5693d","1053f2a9c70299e76848f1c6b7aa53cf527c0372b9efeb3feee87c9bec11d138","e598473d527b5a3d734dd3a3083c93f27fa0b767c3df4c80f4caf82f6d9db587","ef3480c8a6f41402b7d3f302fef2157326100fc90ea776d44fc2beac0b8dee0e","fdbf7ec9414a2dfe5944ae4984aa08b1e335b52ae637d9a432c011a4cdf72a8f","31beb77e6b7b730840983748a6fc9aa7771cc984c0f55cef2de37922f02c3c82","29cb628c4d99dd35254e9993f8aef8039873cbe254859f29b9c977ab1c76f808"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"specs/004-fx-regime-relative-value-lab/scopes.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.plan::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"8be70cf56fd0031c44b999eb38666018efb0f69d","indexOid":"8be70cf56fd0031c44b999eb38666018efb0f69d","worktreeGitOid":"b25aac528f83de1b69c556e6590dab5b277f3276","worktreeSha256":"71504cc062bef9a4403695e1a2d720c16d40198542264bfaa6f6e290fff335ac","hunkCount":84,"hunkBodySha256":["556117c9b4b5445952dc229dbfc6b4aa3afe65765fdb4f398c3430dc1a3261e9","894c7bce06b7f79bfc8770a50c43ce893b7c375bf1a649dd110a831028d1e2e2","145219197f3ddaf8b18eb2600ef42826b8a12126c8e8f61da31ff258631080bd","1f30ff32a01d290a00cc65ce2252b57d10581e20a14448ef442aa72273bec8c0","47b577c4165ffb30fe2508443e2805efe2c39e9b99c70bb85236056709c51f15","e9ceb405e5b7552578c05b5669d90151bef868420b663db9e179e4b75473dd9a","a8bfd992e6b1a91266ef0f6f9fb41309b3e85ae279ddb8750b1118f7dca64958","f8b6fce6ad4a4b827e280da83b778dd378b797c772beca93e06b2da619ad507c","ec8cb2712756b6cf60a69426f0aeae56a55fa1f84a1af8cea8a6576d41c02575","b49830dfadb0f43636c0116d206d098b09b641ccc9138c1052f1aa5f06c2dd91","1fc06be199fdce4680b79ba01b08fd75581e4a925a6c918f87f9cbd32cfb8d3c","c8316019385c20e984a190d72b65261e1096dbf965daeb89aeb49437afc6f5f5","ad2b93f5965406a763627061dc997d9a00f5b2564ccfad7715b732bc0cd019a8","1703901a3faf186c7cbb4eaacad7350aa72019604ef541dcc1b79201d32a4f1e","c7f40277b51c2bd706f9587a45b9083be3b6d90fc20fee53842b814ea87eb32f","a0a84fb6c6c0dac91935a955c4a6ac15c17f1ae8d3f06fc3d46ed526708685b5","73b58c9d8100ead70c4f495b23096dc1117957833e0cbc441cfa7b8b65e08076","4e94f843c56383f5d8ac22f05f351d4f73d7571eff76723b394d08b4b12a190e","671c87f6288b31e167a590253dc7ece6819ca78a48f7b7cd0b8be2335256bc8e","5d47f5d056e30a7bb9fed7eed4aedd0faa5ade96ca17a4a79344e1f7412e4d90","f536c0ae608b8f300f0679428d71d2cf5fefa27edd7db136760d71eff3ee9d89","d92e224122b496d887f930d97cc737f4874a51aa73e0e02613e46c804e297ad0","7470def2a668d0bd478541dcc0ebc62aca82045e3fce80d06c420b59ae1888b5","e81d632385aadfee321327927d76862ca63097abb3579c633c29a9b353bfdc6b","ae34f8cf4513e310613dc1ad6a03a419da5d57bf7a1a6d49d4896e5446c04b66","d4ecd33a960d8e8297755809f1bcbfdcf41831321d868137dbe4a1a57fb5c5af","326b848422a189b292b2eb4e37ef0558a284736db556e0649554f0c912d6c68f","88f39adef0de5e851447b108924d3973f3bc3bfeee945831d102e0c9db34af0d","486f2267cf3aab4d4d3bb18ca65897d4745dffc4705de3640704a897b3e61db2","71b10f59f8ba9c5ff9012c7894d82e0171721ba03b1fb011200e1373cc69e4da","57ab3a9dcc3f13b7daeaaed5b49879657aecdb3f86f13e4914193cb3a5dd0931","5061a6a7c8f3327dd4aa2ffe543c3477b6061db7e0b9a4524e4ddb69d0a8f197","0cf7ac4acb9f13b72d38be130e6e6a359d7ab5b5cdb4f07046860582a809a3f7","d8e405dd51a86ba6a67c039bd140a45078d07f8b7eb1766e7ce5cf937e59d7c2","940deb879995b9aa730b5edbd8528ea66e41a24aabbb327563769176faffba91","b60a3197d831ab627719edaed29a090f5f6fa241d4a78daf65101505a128c8c4","25b71486d37880dda50a916e2a5f7cdae029a65b571fdee0df535868c8214b48","a7365aaa1339bb1fdb8b53804c89c85a1c2dda4377a08a932e4bde9be9fcde22","8912095e0c96831aa83288db5255cb613c79957466c9b8789e81964d1f51016a","8b471a145ad9c10e8dcf0c989051eb3b61b79a74038d92fa8e7dc61fcc9ba4b3","b5ece2acd0126253ea8558110d85ba0bec60caf69b4dab35fcf84e161cb2d5de","8f7f2318fd0546793f9a2ed3703be68d4270b6ab7446bf867038804e676d4d14","4e7893fcb680211b1f62a7b9cccdae94429076d1955d1430d69e92ca708a050d","43e77f7c4156f02723da8f72694c4266f95a954850bb4261471e18321cd38369","8c71ba8cfb4fe8886c8a778c9c6f666c977405b436d3d9b4247ad93280907138","5635bd668bbc7fff8df73076cdc56cb0f387349c7be009298a2d82820ac51533","916c4a11ed0206dc7d874f968b9fb8922b3a43c35b343b35815e04ebec03098b","626f21a86229b0a41bdcbc8d7ee4c897e5f5d4c234e0fdac63f1c72409b9578d","696f015c7070c7f6335cf84d9f805958e21d18efa9d8f1222570fe140ce45413","23343126430a2446448361b7c55f1f541e3a7b9a76a60ca81c6321b2d7d9e457","e7eced7b52dde09ccbb068f3494786df5681de1f0913a52ed74f663e4c55a29d","624e518151fa3485b237710f9015c4a7cd4ef526f3e42fa5f8f32d0abacbe81d","24e1b19cd2894260f8c87f0404103e6e9fbdc75bd465bd0db3a43ef54b6b7c6d","431f7561625c60bae72232b8caa307b5d3deb14ba676655a5bcb0be9e0f0c7f8","204209a610f5436d99caec6baec76b54c13257c01029e8f9c88f7595afa53fdb","4d93345707023d9020f3d5a268678e26959779c5853779494fc15718d6bac18b","985e4b2b6f71f07146de0293f1a00ed9919895ec2b219bc02534486d41c4c595","a90d85213646cddd73083e60f24d74f1f7e4c0da12089ec942f556a3d1ad7ede","aeb6f5d51355b627833a883b2da8a52982fb33f5062e877ac0fcf3b128ec12fc","dffefcc7a1630ec7a4eb8c593f8d1d8cd707c4731200016b2ed9edbbafb39149","d43108364a53385d410c36488b3518f6848ea0b5e635945023886ab898f2dca9","b2a7ab4501ea285cafd0194cc02e3fe421413b4226bfdd4c162c601639af5dfc","66abfa4349298f863ea883b95f78335c1273a9b9ed0d64553d857852733fdad8","62f78e3ad26dd8373a1e93cf10a7454bf163c9613d8ef81ab78384cee326d29d","59c06120744cb5932ccb5d3f7890f8e88efa6100ed9c367b48e92160f7e897c9","91d6f36e4923afa3d293bbc9f3d9e01333e42d3aaace68dace91a91c464a850f","215376ad10f166c3356378b3560ece8b8a74ad1f2aac356b22c904aeeff238dc","da9a8c1f519c33b39984c357a016d1faba5eab52c1496d4775fdca0a2aeb923a","0da9c6d5dfc4d239712450f5c81a43c6d04217fb2d18240d38050724aa7ce911","6ef96258b82cc57f1d4d018b00f14dadbdf6542183a8f1fa8a14f4301cd1a125","1d5791e2f9f9f173349f02e42488e9100fa0e59193409f2ce5699758a9321062","3fe01ca02637b3a62c60f7b1ca6852ec9781b92e1e0770611965db2ed9c170ce","c55424d55c10035d6910c5f242d26175d5ca9369a17ed4e1d959a91812f0f00f","329888840945f4a7135885f765bfc4bedb00389004ef233cad7bc4b20b487272","0269d4b3ebae41a761e2011c77bf213dff5b25dd13335190120cd0f2916c0d09","e8773c70879f7382a8fe41795af97f45a076003b6ef38de46354951fe4669c93","9e8413cb7961997b70bdc9eed796558def9457c22174749f7b582528411f4537","2e3b6934a11f0be4c279000f3fccdf11a834eb3cc72dcb08d3605fe068dcc9e7","ad8dea340f56b309fc19ed7c994cd7d68286cce171c2f28b8f20899fddbf5a1f","bdf663f77d25c9fe472bdadcd5086f4ef978bcc04060e0503f16c3febc8bc0f8","2aeed9e1a48e8c09ca3ae56a8a75cd310f14187af454ecb5d8bf3464e17ff987","ba7797a2ab086d97faf1a4a6b603bb09fb7bf7b933ba61a888bf35588d1c827a","04492460564a63a7c6a6ab85b00df9f579589c1eecb95f2b7da137b005db9e7a","b5daeeb5d037d3170fa899223dc2e7d7b791d01d100ddd9266c523dc63324dac"],"lastCommit":"248543eae6a400f98f086c01ab9669558ec94fd5"},
        {"path":"specs/004-fx-regime-relative-value-lab/spec.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.analyst::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"a180a2c5e9dacb4fcac9351badf621b2e8e30ce1","indexOid":"a180a2c5e9dacb4fcac9351badf621b2e8e30ce1","worktreeGitOid":"04dc0ef3857cd47977b50ebc7277d50096e7e08a","worktreeSha256":"115ba15431da2d827a96131faf163df7ffc4d800d8cf25d9cb818082348b3fd1","hunkCount":83,"hunkBodySha256":["2c900f7c78d0ea998bd956a5a11c293a3aadbd73f1d4b143141175af133a28fa","3261c11d3332197a7366caba2a87b02a5aac1d9627e5cb24baef324ee813584e","98e2d1ee9a5a32e3f3a2d20a61148ce9e776e1ff515805cedd0501d299c6919b","598d5a149c22a9795dd71b9d5be32871d191e3a30052cb669ffcf7f3bd509f7f","d34a742fe9d2d2b65b717e7e98e10ee1b722ddcbbe0bb2ebf92b36d664437c2c","ba7adec2b6ea213bd8ea83edf0d990e3542c511a41ef04d49336b10b4e59c6fd","3f222c97cc095ef3cc189663ef42b24d586155a481bcd108bcd8f2860cf465c4","46ed6f8a90bedbb4cb08525f1492d71cb097c9ce17ae076be91e230c5e69da4d","f114c71507c5a89a94c19c96cc875c36d6241fe81d066ceb78c809299c555f32","65a51b0a8da97a475058d56a48ccf665336674f9d81cbdf981a0e51607e49e80","70e1c0dc91022be13a8b12ca6e6421b7b4f32e2d6b36852ebdb46db359a1725c","20798ecd99ebd283cdd77dc74169f8ed5c6e29979aa4602ef5875205d9b94e60","0ca28c871c383353e93fba7e6414f638cfd5ec33a3270f879aaa22d4506d86ad","93019386e9b72457e7a63c76e9e4ce233c847962bd4e780a9d0876aa80eb2ab9","b758abed7d43ce68b966aab40bc022ed922bdb4a08c16ae9ebe4ac24b1354ece","3a8d3b6c70d0530f4b6025d99158a7243d39332489d405621605297f6a16e02f","9e300e2605c522f27958be65bd3347925e05d711a43597003dd1133a71ead081","72df4ef49956434fd907017a8262f3269158ea4755deb5cfe80b282455d5542c","d6deead3ed031fa26bf380d16d25696808bad0619ebf8ddc85c56c5cbd42b2e0","7b7ef1f5075fddec2b08c09974eed43ed6a9bc16c6bea2a906b91a9a20919b78","fa82fbbbb38c9b3f9a533880546049d1a8881bbd9e414e09a549c3fdbcf90ca6","ce6c755c00ec69b2d3e3e30c65aa4d33424bec044b8a863d7094cdb78b1ae40a","9b8bc5f2db0d8884257980adb8677ed44eec67112638f5878577faab32e76b5c","4a72144d72525f39c6021a9fcc391e07040876e247a9080ced1e4f64205a78f3","ef3e5ba0c585dac609800a6b13921bb2caa19b35819b17a57fe379500957c8c3","15fb35dd4eabdde48c911f518e97d8b50e9ff1816cdf1d381ff867aabc5723ab","85bad1d1523b40ac40357deaf80e65ecfbd4543182ce4e15928737277c7643df","9f4e6b88463d2acbb64593d71d5ce19349d5cfd8eb434065f263b1ed103c7384","40acd400d1cea0776c47480205960f7a62f06a6d352a9a59166b25ae2fe68b9d","aa667ab73d9177f43410475f9b2c15e679489a3e9921afd808e7b030982fc126","51de91165b020d84d7d3084758d35ec5f6f19d31e1ccf740719314af14098d35","adad8b0eb3ba6264858ec780c75884ecfac6ef4c99e222d984bd4d38e39bda59","58ab6c93461573e5d04fc8692d59288ca6241fc12c34ad1632f6c70d86b8dc92","b4a09364a7f792ff7d03274bd7454727768b19bfe331878d4cc297b646fe1bf0","182931d0178f48dbc63606bd09209717caee9ad8ec1169afee3c3bdde7aa6f52","2b2ebd34ee786c8644171cde28d60dbec53e5826b434f7b946ea7205c351bd17","a69dd63d1e307a70e7749625b68cdeb2b306e3666ea591683355df4a57d71867","a52ad971177d9ebe38dca4246f603f0cf450c9173620564358f7c4c013421842","9ec8995d25d3eb4962cad7e3019a850d8cb6a6f4ae5a393cd47290d3c985c8f3","652ff0b9774001ff83a8fe9559034847214b9a4e2371d04dff60e4226ac423ee","3ea93478f6a2a1b81613e5fda6bb1228f9abc1cda09429124e3d1c70a51a0fa9","9e2fdf85fbef78458af38180a00d69bd3fb6b1fcfc05bc9c061704850e763eba","d863775911c8cb21b006b3ade778d021ae81dd5a4a0fe28e42dbefe4299ed432","f25037c293ac186f8923ef9b1a7b3d507a07cf468d7f68ba41c42b4814d71b79","5e782803b48dd35583096d7e1f6fc2e019159a20b06b7b5c73a536f582632f90","f85c37604302e5469637c149614e099f2d774516c85e0ffecf3e299dfb465baf","08aa5b5a9f41593547da98b15a51784cb0504ad861e1758edde93feb8954c189","db0bc13c46fb009d8804f55a813813834c0780b59204e5a3d3cefd167c667ef9","c7295d37cbb332dab523fec8cafea33d6c4e73e795530e1880b3a11aa3152aea","3497a0518965ed7d2ccbd3f8f4ee2bb63349847a2d549c23c3c3f53d86983ac8","c432d76a138ee5400fd163b5fe7f8cc1e8e96b2b3e6d95181214560e630c1dc4","9936f02f8f97e0f7ae277d84fc49d9202c19e25f1436f733144f61140d617fef","d11eed8525012221c68c7004602ae58f1a7f6dab2880cf2b54574eb34c5211f6","60676500479e57025c253ea9213e5c94e7b157aa80af0c41d3082c845dcde3a4","0a5d55a168c994db5fe5f58e2dbbe4929d510e5127aa393ccfd2c577498ea7bd","7905a8c96e7ea0f12cc04ff93bf133014dea8ce4a1c7e0acaa0466111cf1513a","9ed5829a4ae21db76e656bb5777548cc17801aedacba6f162cd0c6898ed28100","f888af7d5a97c262425e2474b1585b30b86ce129479d61b507d05bb9aa9ed8b5","2e108bc8424e9cc001197d5d8385fa0c7b25c79365c4c5cf682b0f92c1f64058","e049d68d3c8e4fc6035a77f5baca2139c73804f266c8418278732be52e11d6e3","45f1c0f8ed9d464e983f90de498ca78bbc74cae2a0e62a86e95ebef42db063a8","de8eb0368e8a877bf4cbba8ecdf84dbbd69616eec7444fec4600ca2e5e093494","7a36f1d92fec4d18cfe5c2a61ca3f91ae930cd6ecd6dedbc5bf8a70b5021aba5","79f821835a3ef8ef6b42ea53e125f6381e35d955b7474cb27a247a59bcd90b74","dc58846990d3490349da490ef2e55ef884b153d5f4a4ca4f94077838a828a59e","12fcacecfaf9247d976ed90e38c44b01d6a2bae5305361b32b740a6c0324473b","43c954ec21fb82a389e5c2135104764225abc15b413a011994c986366b05ce99","be08761d36b988ad53b43653f12dc2c3bcf572675786241a9cd23e70705b9595","4f98eb7ee97392a73df9f45e4694b2de715b333d6848824d3d5b0fe4ccc27d70","0814fb5152e85734768c3e6e0486924366f6cd706ab312c3f7b10d3cfa3672bc","2fe39d36d977e9f27c778193c10599aba8f571c2ee1772d111eaac9d5b13abfa","2e4d591ce640bd627269dda9874b58e3696106debefdb7665e7f0a91e47d6cc6","caae6b76487c00471cde69eafda261e27a2c7ea7260997e549fac3bde35f12c7","66824ea37ccaf89ecb5d5c1f9a8074e721debca753b7208ffee2517c12344d33","ef3f2400667d4d24213ea5a3e6a31abd25b418619a18edb6cc75543133a7d967","e94a5b76090d50b73dcc01de15a336d480fef43b057970d339b2db4b8e839fa4","0cd135b8fc99450a90aa9ee613c7afd5d43cd928b74f096472b4b38c8f9bbe4c","436bb8266e7afa2778dfdf978b5cb59ad4ed5ad2e74a05b373020cc042f358cb","fdb7f6b734e2f7d5c3b9aab0d99646c01cab4deb92cd45018ccca3efb37c67e5","b5bb2351f6a28264437f03b8a9603780d8c84662219992edbdd3f205a6611a70","76d6b7df0f396a0de85b138106344683e9320b94fabed15616e77ab8b5fb3217","435b5bc9423592d678a8800a7ba34dc6c373523ec7aeffb20649b57c3a0ca9cb","b48052aa94c6205d7d58e04696bdcbe67975658ab79725079684526beea89f68"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"specs/004-fx-regime-relative-value-lab/state.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.plan::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"48b76d7e6f25df232c8aee12b716230870497c92","indexOid":"48b76d7e6f25df232c8aee12b716230870497c92","worktreeGitOid":"7c602265f74b5d521af39a91c7df96b9c6931f29","worktreeSha256":"789a7ccc3297554fa82c10d25992b2d9fd9567383dd9a8f2a32f36b48a5103b7","hunkCount":15,"hunkBodySha256":["7e52bdf8810db41b81620e0c448882f80407002e0e03983e7118e268bfca4781","5c4e0714db4de8d176988d1e9b347209c712bdf9dd4358ffc3c8288d2e35158a","9d191030b5926df4d6447481082f6129bd86af50ff311374de06ec0dbb4fd2b7","9f8f90656dc6f7c63d53c5a0dc8ef1d3491bd4559db7287b614c7ee91c1df3d6","770eafbe08b7de110404c4df81571fa32641ea3d76363304d6c2134fc8bc6afa","43a38f7f4d9c8275db13d33bcef3692dd83e4cda009a4802e04ea9d0bff742af","735a28c74e36e669da0e681e3d8c03f642e1e544d6982692be851e8da0fe19aa","688ebf1b35c814e89c5f73f77af627703ba5b420935df32875416cd923397b6c","b041c333d26ba90e5a9caf1322a5bfa77e6315836cb0b743dc9f1dfd2b02616a","0fc3172e3e7a021405798481242e80733fa100b13c1804cfc3665540e305cc54","11f6bd60f91ee64e8cbed5b377c523046c0059503c7896ccc19312f2b86a09d7","e4809865a175354054c52eef2e93f27b8db155a6fba2d9e56646e63845a7370f","9ff8358e82f1578762021daf6f79d607bdf0b33de6f98a2ef9d50271af94c076","6e17eaea086675de5f5a79eb7fce2e3bf06d0f9f81f5368b7fe2b273fceb372d","37150f7f049b575f007a4b4b2b1a0a6d2c73c808b25c9ed8a196da280b2c6cae"],"lastCommit":"de0c03389a343e5154af40e2ef885b59f3f75111"},
        {"path":"specs/004-fx-regime-relative-value-lab/test-plan.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.plan::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"ad889299d290518d5ba991fa78c04a45f32ae049","indexOid":"ad889299d290518d5ba991fa78c04a45f32ae049","worktreeGitOid":"e2e8803d8f58255a5b459027bb5c1114b3de9513","worktreeSha256":"4d25cdb02904ac9e5d395f76fc9162e6c6dbed89d29eb75edd64de067413ad2a","hunkCount":6,"hunkBodySha256":["28a2618627cdf1f05e2023e498bfebcdb7fc694bb33d347c6f57e4ca5a625502","2b7835e4fb1218963b93efc9f44872207e6145563dcf567bf4b3de0661679c0d","8f7ebf491c084f6a36da1037b8a48b8934acaa12e180c46b70807710d0be00af","6045374e147efb56c6acbc8bf422f2eae2348627960c3067ec8075df3bfc5925","060948901ace52c824cf6e83cc344ac347f5a0d696d74ff1edf7846d72d48c89","f3265d081f3f23f30c082e1d7c0944d1bdfaf2ef833c44a15e0a44393e169b23"],"lastCommit":"248543eae6a400f98f086c01ab9669558ec94fd5"},
        {"path":"specs/004-fx-regime-relative-value-lab/uservalidation.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"bubbles.plan::specs/004-fx-regime-relative-value-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"726a1409b12a4625d9709a4252c03713baca5ebb","indexOid":"726a1409b12a4625d9709a4252c03713baca5ebb","worktreeGitOid":"8137e019ffba0c525b292ebcb9c988b450d1f73b","worktreeSha256":"7bfc13db69d3c3553897f510d61d99f4293bfbaf385d2a9d5f4ffcbb8b56c5fb","hunkCount":7,"hunkBodySha256":["51576eb6243f33e7a327b91bec585b03d6b4bbbebe79bd66e1ae186831540c43","d0f478c0739b89423997dd4a672b63d54574c9b54158495357d9a7bba3f67219","9b9dfe3e267d4d652c694dadb0fb40fafb0e4fb58555b2ba5f3ab19514ab61ee","546ed8d93aaab471f0492943620ad74989c6acb604e9c0f0f4e121b7705a7b1b","cd3ee3c61b6edad97279fed730f974d89b93e294e41b0e2159d782fd6d105162","8b480b4fbeebe92fc1fedef2c279fdac82fd0a33f509ef6ec2c64781b90c6c67","92e04d8ddaf83c361f090cfc19326e627c06fb0f3e7be7a2120729ee5a701158"],"lastCommit":"db06c29650ba351770297acefa658f51cbc4ff00"},
        {"path":"specs/007-technical-analysis-decision-lab/state.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/007-technical-analysis-decision-lab","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"2691cfa1c2c8bf76cd01aa05cdb5c1a55e0ae23b","indexOid":"2691cfa1c2c8bf76cd01aa05cdb5c1a55e0ae23b","worktreeGitOid":"b1d4209c0071292187f0d9284833c7f67f2f0cd3","worktreeSha256":"5a105a131e67b515e2f323e6f07f67bc90c972e77c08da18c319d7cd31b5fc3d","hunkCount":2,"hunkBodySha256":["73173baaf785304af262b79b839e8e65aa69d3997c88c79665f81903efc70b62","84208f26ef49abaa011727ef3b50bffe5c5512130d3c52a161f686ffee73ae70"],"lastCommit":"de0c03389a343e5154af40e2ef885b59f3f75111"},
        {"path":"specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/012-market-action-center-and-guided-tools::SCOPE-15","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"199adcf3d748dcb6a020f6fac0995fa713e97b07","indexOid":"199adcf3d748dcb6a020f6fac0995fa713e97b07","worktreeGitOid":"a97dc38b0083eb365f68a8cb6c6269a023e49966","worktreeSha256":"8513bdd4c0c5e270202feb9988885fc6ae36aea8151d5557de5e79c38c0c0643","hunkCount":2,"hunkBodySha256":["ee53e2457375211a97521aec0757928a4663076c8c7b948ab922a817807d3e34","f5660f9026d8b55cf5062bd411cd4d55a3775add1cfd9e31956076d59fabfcdf"],"lastCommit":"82beeab96746c341814fd4cbed6d2502e6d9086e"},
        {"path":"specs/015-recommendation-outcome-ledger-and-track-record/state.json","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/015-recommendation-outcome-ledger-and-track-record","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"5ab629313ad46938a0abfb85b30ebcc1399bc6b7","indexOid":"5ab629313ad46938a0abfb85b30ebcc1399bc6b7","worktreeGitOid":"659e594e3c8206dd6ba202340f14b12f13e0a924","worktreeSha256":"10d00cdb8881c48cf0b7925ebcb75e037f455b5a7e86506adf1b1673d0bc35c4","hunkCount":1,"hunkBodySha256":["b6e1cb8596648a3efdad7f2d1aca9c922b359384973bbac9f82849e2b3281673"],"lastCommit":"de0c03389a343e5154af40e2ef885b59f3f75111"},
        {"path":"tests/simple-production-bridge.integration.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/012-market-action-center-and-guided-tools::SCOPE-15","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"618f0c5b923fd3e9cd6dadd625dcd851f919328c","indexOid":"618f0c5b923fd3e9cd6dadd625dcd851f919328c","worktreeGitOid":"775e30ecaa0be645e8d6c13bf507d10a9ae36116","worktreeSha256":"9ae46e26c2c6e02509bbf0ec5da65b5e2d5bde7fc6ecd3f47d893e1f32f1451e","hunkCount":5,"hunkBodySha256":["9bf7e774721616cb49a3c7798af6457353949b35269ff391cb298a8b6d3efdd0","8c44aeabb9150daf182ec651423bf8e7f0e919c7ceb8087d3036b2f90e5d69bd","7ddfa59abf163beef02699127f820b8fba86b160a3c142b18d263d131165ea1b","52c9ad166272574dd9fe51cf7b5404f6ed1e30fa885d45fd89723e2019ee0417","583c3a4d62e2bc73875ba7f88502fe006e57f1b0ba43b77fb1abf14b051789ff"],"lastCommit":"34fa28dd889b086bbed32cce99ad626c9c89b320"},
        {"path":"tests/simple-production-bridge.unit.mjs","pathKind":"tracked","classification":"foreign-unrelated","ownerAttribution":"specs/012-market-action-center-and-guided-tools::SCOPE-15; shared-with-BUG-004","feature004OwnershipClaim":false,"status":" M","staged":false,"unstaged":true,"headOid":"caff6f2801bc4e5addc9b5e570d25226e49b86bf","indexOid":"caff6f2801bc4e5addc9b5e570d25226e49b86bf","worktreeGitOid":"13de6a1f8560b89510a110de9c4db7c05ce877d4","worktreeSha256":"3c71690f08a6b72b0dd069cfc23336819caef37a10b207ee595cead1503edb68","hunkCount":2,"hunkBodySha256":["9bf7e774721616cb49a3c7798af6457353949b35269ff391cb298a8b6d3efdd0","943ea538ffb36c0396822cd1e06c99c6c7c69e6d320e264154966bde6124f202"],"lastCommit":"016e2a19a6867ae5bb201e8593d29fbbdbb01858"},
        {"path":"scripts/reader-vocabulary.mjs","pathKind":"untracked","classification":"foreign-unrelated","ownerAttribution":"owner: unknown","feature004OwnershipClaim":false,"status":"??","staged":false,"unstaged":true,"headOid":null,"indexOid":null,"worktreeGitOid":"04cb7c87be882daa8bb4d8d64aeb0945c09d7002","worktreeSha256":"efdcf4423add22be185d50d35ccba457eff27b731880624f4a48d91f0de9c09a","hunkCount":0,"hunkBodySha256":[],"lastCommit":null}
    ],
    "collisionParserSelfIdentity": {"path":"tests/feature-004-dirty-tree-collision.test.mjs","mode":"normalized-self-pins/v1","pinLiterals":["DURABLE_EVIDENCE_BLOCK_SHA256","CURRENT_IDENTITY_V4_BLOCK_SHA256"],"normalizedPinValue":"0000000000000000000000000000000000000000000000000000000000000000","worktreeGitOid":"f40a1097202ef9742d20c2bc1fe9576061748b75","worktreeSha256":"a725c2ae0195398b821ad67eb982e6790bd2a17fc316084e00e09314c2b052a1","hunkCount":24,"hunkBodySha256":["483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc","f0ffd40a078bd4e94baace9ba4ff3cf88f5b5e6938a2e7ecb7acfbe725c41af0","a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d","93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008","d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1","082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a","eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4","5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7","dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1","fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3","cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5","4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb","012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4","b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e","6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd","a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58","56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d","2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a","f2b1ad844eb6a93aa4ea221a12e2050b1f7027031e97e4fe9fc6ae943120a7af","377330b9749d396b437589aceeed655461b219255b43e2c0380d29e7c33ed90d","f14ad05698a65d2392cdc631292381dc1be25d14f831a01570ea18fb6eaf9e9e","1a0acead5e92707cb01b43f17d69c86ea7a8da5cca74399f82212e2a2c246820","d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b","6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b"]},
    "preservationContract": {"allTenPredecessorBlocksRemainByteIdentical":true,"durableEvidenceBlockHashIsPinned":true,"exactNineteenScope1PathsRequired":true,"allForeignDirtyAndUntrackedPathsSeparatelyClassified":true,"foreignPathsGrantNoFeature004Ownership":true,"normalizedSelfPinsRequired":true,"missingExtraStagedOrDriftedIdentityFailsClosed":true,"reportPathIsProtectedByMarkerPinsInsteadOfRecursiveIdentity":true}
}
```
<!-- feature004-dirty-collision-current-identity-v4:end -->

## Collision Lifecycle Successor - `F004-COLLISION-F010-LIFECYCLE-DRIFT-001`

### Summary

The durable evidence block and v4 identity remain exact at their pinned marker-inclusive hashes. The immutable Feature 010 owner return still records the noncompletion state observed on 2026-07-17. Feature 010 later reached a certified done state on 2026-07-30. The five current-state assertions in `validateOwnerSettledSuccessor` therefore compare two valid lifecycle moments as though they were one state.

The v5 block preserves both moments. It authorizes one existing semantic hunk replacement. It also authorizes additive v5 schema, pin, and adversarial coverage owned by `bubbles.test`. The three plan-owned identities below capture this handoff after `scopes.md`, `test-plan.json`, and `state.json` routing changed. No product, Feature 010, checkbox, scope status, or certification byte changed.

### Completion Statement

Planning defines the closed successor and routes parser execution to `bubbles.test`. Scope 1 remains In Progress. Scope 2 remains locked. A green collision result and BUG-002 replay remain test-owned and are not claimed here.

<!-- feature004-dirty-collision-current-identity-v5:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-current-identity/v5",
    "findingId": "F004-COLLISION-F010-LIFECYCLE-DRIFT-001",
    "capturedAt": "2026-08-04T01:51:24Z",
    "extendsContracts": [
        {
            "marker": "feature004-dirty-collision-current-identity-v4",
            "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6"
        },
        {
            "marker": "feature004-scope1-durable-evidence-v1",
            "rawBlockSha256": "3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd"
        }
    ],
    "historicalOwnerReturn": {
        "owner": "bubbles.implement",
        "packet": "specs/010-company-fundamentals-and-brief-lab",
        "scope": "Scope 01",
        "phase": "implement",
        "executionHistorySelector": {
            "agent": "bubbles.implement",
            "executionModel": "direct-authorized-runner",
            "parentAgent": "bubbles.goal",
            "startedAt": "2026-07-17T00:14:13Z",
            "finishedAt": "2026-07-17T00:34:15Z",
            "outcome": "route_required",
            "evidenceRef": "scopes/01-contract-config-validator-publication-foundation/report.md#final-concurrent-owner-reconciliation---2026-07-17t003415z"
        },
        "statusBefore": "not_started",
        "statusAfter": "not_started",
        "scopesCompleted": [],
        "exactEvidenceCompletionClaims": {
            "scopeComplete": false,
            "featureComplete": false,
            "bug003Complete": false,
            "bug002Complete": false
        },
        "capturedNonCompletionState": {
            "featureStatus": "not_started",
            "scopeStatus": "not_started",
            "certificationStatus": "not_started",
            "completedPhaseClaims": [
                "spec-review"
            ],
            "completedScopes": []
        }
    },
    "certifiedSuccessor": {
        "status": "done",
        "certifiedAt": "2026-07-30T14:41:30Z",
        "certificationStatus": "done",
        "executionScopeProgress": [
            {
                "scope": 1,
                "status": "done"
            },
            {
                "scope": 2,
                "status": "done"
            },
            {
                "scope": 3,
                "status": "done"
            },
            {
                "scope": 4,
                "status": "done"
            },
            {
                "scope": 5,
                "status": "done"
            },
            {
                "scope": 6,
                "status": "done"
            },
            {
                "scope": 7,
                "status": "done"
            },
            {
                "scope": 8,
                "status": "done"
            }
        ],
        "completedScopeCount": 8,
        "uniqueCompletedScopeCount": 8,
        "certifiedCompletedPhases": [
            "implement",
            "test",
            "regression",
            "simplify",
            "gaps",
            "harden",
            "stabilize",
            "security",
            "validate",
            "audit",
            "chaos",
            "docs",
            "spec-review"
        ]
    },
    "resolvedTransition": {
        "id": "TR-F010-SCOPE01-TEST-OWNERSHIP-01",
        "status": "resolved",
        "routedTo": "bubbles.test",
        "findingIds": [
            "F010-INDEPENDENT-VERIFICATION-001"
        ],
        "resolvedAt": "2026-07-17T02:07:35Z",
        "resolvedBy": "bubbles.test",
        "outcome": "route_required"
    },
    "planOwnedPathTransitions": [
        {
            "path": "specs/004-fx-regime-relative-value-lab/scopes.md",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v4",
                "field": "foreignProtectedPaths[path=specs/004-fx-regime-relative-value-lab/scopes.md]"
            },
            "previousWorktreeGitOid": "b25aac528f83de1b69c556e6590dab5b277f3276",
            "previousWorktreeSha256": "71504cc062bef9a4403695e1a2d720c16d40198542264bfaa6f6e290fff335ac",
            "inheritedClassification": "foreign-unrelated",
            "inheritedOwnerAttribution": "bubbles.plan::specs/004-fx-regime-relative-value-lab",
            "inheritedFeature004OwnershipClaim": false,
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/scopes.md",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "8be70cf56fd0031c44b999eb38666018efb0f69d",
                "indexOid": "8be70cf56fd0031c44b999eb38666018efb0f69d",
                "worktreeGitOid": "b1566d7d4cb86865ae444ad1a1ee88c14fba25cf",
                "worktreeSha256": "69aa381dd855cbce4412ee88fa87ac2cf13f212c6de69c89082042c2ebbb25f2",
                "hunkCount": 84,
                "hunkBodySha256": [
                    "556117c9b4b5445952dc229dbfc6b4aa3afe65765fdb4f398c3430dc1a3261e9",
                    "894c7bce06b7f79bfc8770a50c43ce893b7c375bf1a649dd110a831028d1e2e2",
                    "145219197f3ddaf8b18eb2600ef42826b8a12126c8e8f61da31ff258631080bd",
                    "1f30ff32a01d290a00cc65ce2252b57d10581e20a14448ef442aa72273bec8c0",
                    "47b577c4165ffb30fe2508443e2805efe2c39e9b99c70bb85236056709c51f15",
                    "e9ceb405e5b7552578c05b5669d90151bef868420b663db9e179e4b75473dd9a",
                    "a8bfd992e6b1a91266ef0f6f9fb41309b3e85ae279ddb8750b1118f7dca64958",
                    "f8b6fce6ad4a4b827e280da83b778dd378b797c772beca93e06b2da619ad507c",
                    "ec8cb2712756b6cf60a69426f0aeae56a55fa1f84a1af8cea8a6576d41c02575",
                    "6531d68157d941b4b9459b282a293a6f8167e6b176ce804a777880547e9b44c2",
                    "1fc06be199fdce4680b79ba01b08fd75581e4a925a6c918f87f9cbd32cfb8d3c",
                    "c8316019385c20e984a190d72b65261e1096dbf965daeb89aeb49437afc6f5f5",
                    "ad2b93f5965406a763627061dc997d9a00f5b2564ccfad7715b732bc0cd019a8",
                    "1703901a3faf186c7cbb4eaacad7350aa72019604ef541dcc1b79201d32a4f1e",
                    "c7f40277b51c2bd706f9587a45b9083be3b6d90fc20fee53842b814ea87eb32f",
                    "a0a84fb6c6c0dac91935a955c4a6ac15c17f1ae8d3f06fc3d46ed526708685b5",
                    "73b58c9d8100ead70c4f495b23096dc1117957833e0cbc441cfa7b8b65e08076",
                    "4e94f843c56383f5d8ac22f05f351d4f73d7571eff76723b394d08b4b12a190e",
                    "671c87f6288b31e167a590253dc7ece6819ca78a48f7b7cd0b8be2335256bc8e",
                    "5d47f5d056e30a7bb9fed7eed4aedd0faa5ade96ca17a4a79344e1f7412e4d90",
                    "f536c0ae608b8f300f0679428d71d2cf5fefa27edd7db136760d71eff3ee9d89",
                    "b47d3ca6047b2e5c6a08a0f40fbaeb5924e2135b59d61ed34013051205c08e7b",
                    "7470def2a668d0bd478541dcc0ebc62aca82045e3fce80d06c420b59ae1888b5",
                    "2c311ebb6154c4af9332ae2b54df39d75cf14a4fa0f6d53c001b8cdc27d4accc",
                    "ae34f8cf4513e310613dc1ad6a03a419da5d57bf7a1a6d49d4896e5446c04b66",
                    "d4ecd33a960d8e8297755809f1bcbfdcf41831321d868137dbe4a1a57fb5c5af",
                    "326b848422a189b292b2eb4e37ef0558a284736db556e0649554f0c912d6c68f",
                    "88f39adef0de5e851447b108924d3973f3bc3bfeee945831d102e0c9db34af0d",
                    "13aed448be4927231a6c97fbd77eec2dd19346cc7d35ec89d9c846653b420eac",
                    "71b10f59f8ba9c5ff9012c7894d82e0171721ba03b1fb011200e1373cc69e4da",
                    "57ab3a9dcc3f13b7daeaaed5b49879657aecdb3f86f13e4914193cb3a5dd0931",
                    "5061a6a7c8f3327dd4aa2ffe543c3477b6061db7e0b9a4524e4ddb69d0a8f197",
                    "0cf7ac4acb9f13b72d38be130e6e6a359d7ab5b5cdb4f07046860582a809a3f7",
                    "d8e405dd51a86ba6a67c039bd140a45078d07f8b7eb1766e7ce5cf937e59d7c2",
                    "940deb879995b9aa730b5edbd8528ea66e41a24aabbb327563769176faffba91",
                    "b60a3197d831ab627719edaed29a090f5f6fa241d4a78daf65101505a128c8c4",
                    "25b71486d37880dda50a916e2a5f7cdae029a65b571fdee0df535868c8214b48",
                    "a7365aaa1339bb1fdb8b53804c89c85a1c2dda4377a08a932e4bde9be9fcde22",
                    "8912095e0c96831aa83288db5255cb613c79957466c9b8789e81964d1f51016a",
                    "8b471a145ad9c10e8dcf0c989051eb3b61b79a74038d92fa8e7dc61fcc9ba4b3",
                    "b5ece2acd0126253ea8558110d85ba0bec60caf69b4dab35fcf84e161cb2d5de",
                    "8f7f2318fd0546793f9a2ed3703be68d4270b6ab7446bf867038804e676d4d14",
                    "4e7893fcb680211b1f62a7b9cccdae94429076d1955d1430d69e92ca708a050d",
                    "43e77f7c4156f02723da8f72694c4266f95a954850bb4261471e18321cd38369",
                    "8c71ba8cfb4fe8886c8a778c9c6f666c977405b436d3d9b4247ad93280907138",
                    "5635bd668bbc7fff8df73076cdc56cb0f387349c7be009298a2d82820ac51533",
                    "916c4a11ed0206dc7d874f968b9fb8922b3a43c35b343b35815e04ebec03098b",
                    "626f21a86229b0a41bdcbc8d7ee4c897e5f5d4c234e0fdac63f1c72409b9578d",
                    "696f015c7070c7f6335cf84d9f805958e21d18efa9d8f1222570fe140ce45413",
                    "23343126430a2446448361b7c55f1f541e3a7b9a76a60ca81c6321b2d7d9e457",
                    "e7eced7b52dde09ccbb068f3494786df5681de1f0913a52ed74f663e4c55a29d",
                    "624e518151fa3485b237710f9015c4a7cd4ef526f3e42fa5f8f32d0abacbe81d",
                    "24e1b19cd2894260f8c87f0404103e6e9fbdc75bd465bd0db3a43ef54b6b7c6d",
                    "431f7561625c60bae72232b8caa307b5d3deb14ba676655a5bcb0be9e0f0c7f8",
                    "204209a610f5436d99caec6baec76b54c13257c01029e8f9c88f7595afa53fdb",
                    "4d93345707023d9020f3d5a268678e26959779c5853779494fc15718d6bac18b",
                    "985e4b2b6f71f07146de0293f1a00ed9919895ec2b219bc02534486d41c4c595",
                    "a90d85213646cddd73083e60f24d74f1f7e4c0da12089ec942f556a3d1ad7ede",
                    "aeb6f5d51355b627833a883b2da8a52982fb33f5062e877ac0fcf3b128ec12fc",
                    "dffefcc7a1630ec7a4eb8c593f8d1d8cd707c4731200016b2ed9edbbafb39149",
                    "d43108364a53385d410c36488b3518f6848ea0b5e635945023886ab898f2dca9",
                    "b2a7ab4501ea285cafd0194cc02e3fe421413b4226bfdd4c162c601639af5dfc",
                    "66abfa4349298f863ea883b95f78335c1273a9b9ed0d64553d857852733fdad8",
                    "62f78e3ad26dd8373a1e93cf10a7454bf163c9613d8ef81ab78384cee326d29d",
                    "59c06120744cb5932ccb5d3f7890f8e88efa6100ed9c367b48e92160f7e897c9",
                    "91d6f36e4923afa3d293bbc9f3d9e01333e42d3aaace68dace91a91c464a850f",
                    "215376ad10f166c3356378b3560ece8b8a74ad1f2aac356b22c904aeeff238dc",
                    "da9a8c1f519c33b39984c357a016d1faba5eab52c1496d4775fdca0a2aeb923a",
                    "0da9c6d5dfc4d239712450f5c81a43c6d04217fb2d18240d38050724aa7ce911",
                    "6ef96258b82cc57f1d4d018b00f14dadbdf6542183a8f1fa8a14f4301cd1a125",
                    "1d5791e2f9f9f173349f02e42488e9100fa0e59193409f2ce5699758a9321062",
                    "3fe01ca02637b3a62c60f7b1ca6852ec9781b92e1e0770611965db2ed9c170ce",
                    "c55424d55c10035d6910c5f242d26175d5ca9369a17ed4e1d959a91812f0f00f",
                    "329888840945f4a7135885f765bfc4bedb00389004ef233cad7bc4b20b487272",
                    "0269d4b3ebae41a761e2011c77bf213dff5b25dd13335190120cd0f2916c0d09",
                    "e8773c70879f7382a8fe41795af97f45a076003b6ef38de46354951fe4669c93",
                    "9e8413cb7961997b70bdc9eed796558def9457c22174749f7b582528411f4537",
                    "2e3b6934a11f0be4c279000f3fccdf11a834eb3cc72dcb08d3605fe068dcc9e7",
                    "ad8dea340f56b309fc19ed7c994cd7d68286cce171c2f28b8f20899fddbf5a1f",
                    "bdf663f77d25c9fe472bdadcd5086f4ef978bcc04060e0503f16c3febc8bc0f8",
                    "2aeed9e1a48e8c09ca3ae56a8a75cd310f14187af454ecb5d8bf3464e17ff987",
                    "ba7797a2ab086d97faf1a4a6b603bb09fb7bf7b933ba61a888bf35588d1c827a",
                    "04492460564a63a7c6a6ab85b00df9f579589c1eecb95f2b7da137b005db9e7a",
                    "b5daeeb5d037d3170fa899223dc2e7d7b791d01d100ddd9266c523dc63324dac"
                ],
                "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5"
            },
            "disposition": "plan-owned-v5-lifecycle-successor"
        },
        {
            "path": "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v4",
                "field": "foreignProtectedPaths[path=specs/004-fx-regime-relative-value-lab/test-plan.json]"
            },
            "previousWorktreeGitOid": "e2e8803d8f58255a5b459027bb5c1114b3de9513",
            "previousWorktreeSha256": "4d25cdb02904ac9e5d395f76fc9162e6c6dbed89d29eb75edd64de067413ad2a",
            "inheritedClassification": "foreign-unrelated",
            "inheritedOwnerAttribution": "bubbles.plan::specs/004-fx-regime-relative-value-lab",
            "inheritedFeature004OwnershipClaim": false,
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/test-plan.json",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "ad889299d290518d5ba991fa78c04a45f32ae049",
                "indexOid": "ad889299d290518d5ba991fa78c04a45f32ae049",
                "worktreeGitOid": "60abaa254e93fe18f4c0333658f2ca98d5b9fa72",
                "worktreeSha256": "8924fe6b62c5e88c6fd636522025009800faa0e99e0a1c4a777bcc9f5536f414",
                "hunkCount": 8,
                "hunkBodySha256": [
                    "0b402b979367b2f8775139d71f05b21a2e5af05593aa0bf474150836f0c55a4f",
                    "01312c8fb60cfd03503b42ce838a91c4def3b35b584dd27126328640dc7b1312",
                    "e00a427b31ef3db18d116cb14de1a29ea2fe2c7d801eabab3393627331fb4fa4",
                    "06b6ca14081a89e8d9e247c5336d0c27295a9ee7b9b017285bf1a03cbbf0088a",
                    "4016c506231aad1752ea68f1d6e8917c1d72c3d927ad1ebf14646d37dbfeda9e",
                    "da2acdff223a721a29c97009d5629a488f25dd6be9ff6fb65e68d0ec11f5736e",
                    "868ee0cf23c435a5991a962e6c52d1a83f0da53fbcbee1f5fb830ad4c839961e",
                    "a7e6c34226565146cd0231eb6285353a126ef98d7d80daefc6429341a41a1e1e"
                ],
                "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5"
            },
            "disposition": "plan-owned-v5-lifecycle-successor"
        },
        {
            "path": "specs/004-fx-regime-relative-value-lab/state.json",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v4",
                "field": "foreignProtectedPaths[path=specs/004-fx-regime-relative-value-lab/state.json]"
            },
            "previousWorktreeGitOid": "7c602265f74b5d521af39a91c7df96b9c6931f29",
            "previousWorktreeSha256": "789a7ccc3297554fa82c10d25992b2d9fd9567383dd9a8f2a32f36b48a5103b7",
            "inheritedClassification": "foreign-unrelated",
            "inheritedOwnerAttribution": "bubbles.plan::specs/004-fx-regime-relative-value-lab",
            "inheritedFeature004OwnershipClaim": false,
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/state.json",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "48b76d7e6f25df232c8aee12b716230870497c92",
                "indexOid": "48b76d7e6f25df232c8aee12b716230870497c92",
                "worktreeGitOid": "5a9da353e9af8ef50f22d7bafd8ad2303024f1e0",
                "worktreeSha256": "72faf0c5913f4d3e9746c23a7cfbf5c5c24e922c575500f3ab98da412c3524b1",
                "hunkCount": 16,
                "hunkBodySha256": [
                    "7e52bdf8810db41b81620e0c448882f80407002e0e03983e7118e268bfca4781",
                    "5c4e0714db4de8d176988d1e9b347209c712bdf9dd4358ffc3c8288d2e35158a",
                    "9d191030b5926df4d6447481082f6129bd86af50ff311374de06ec0dbb4fd2b7",
                    "9f8f90656dc6f7c63d53c5a0dc8ef1d3491bd4559db7287b614c7ee91c1df3d6",
                    "6dbaeca817fb5597c6fcbf009c7e66d5a87b36cc7a77ecef1cb99d1c402cf0bc",
                    "833a29bd010345bafa61dd9f004e2e5535ede746be4caf13e8304466179850ad",
                    "735a28c74e36e669da0e681e3d8c03f642e1e544d6982692be851e8da0fe19aa",
                      "688ebf1b35c814e89c5f73f77af627703ba5b420935df32875416cd923397b6c",
                    "b041c333d26ba90e5a9caf1322a5bfa77e6315836cb0b743dc9f1dfd2b02616a",
                    "0fc3172e3e7a021405798481242e80733fa100b13c1804cfc3665540e305cc54",
                    "11f6bd60f91ee64e8cbed5b377c523046c0059503c7896ccc19312f2b86a09d7",
                    "e4809865a175354054c52eef2e93f27b8db155a6fba2d9e56646e63845a7370f",
                    "49696290d0fc52b8e7c57ce4808c2eeabf48f3924ceff5513d1e7aeafcd7801a",
                    "956a1d98c8dbb4d83f32b99ef564f197180b3ae1630ebc91dabdabc6f8af18dd",
                    "ac34a972711f00a513306727b4e87a31e81c37dbfa1e9317b58932d4e2eef481",
                    "1e8e8818270469dd1e96ed56353730ef61e2189371149011ca3277102f6cc9fc"
                ],
                "lastCommit": "de0c03389a343e5154af40e2ef885b59f3f75111"
            },
            "disposition": "plan-owned-v5-lifecycle-successor"
        }
    ],
    "parserBeforeSemanticEdit": {
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "rawWorktreeGitOid": "50e367ed041b11f6dbfe0f8e1a907a1348b009f6",
        "rawWorktreeSha256": "c524337816983f22675d5a7b024ea394d852c9f1273697d81dc48baf901c25dc",
        "byteLength": 164198,
        "capturedOldLineRange": {
            "start": 1187,
            "end": 1191
        },
        "normalizedV1Identity": {
            "path": "tests/feature-004-dirty-tree-collision.test.mjs",
            "mode": "normalized-self-pins/v1",
            "pinLiterals": [
                "DURABLE_EVIDENCE_BLOCK_SHA256",
                "CURRENT_IDENTITY_V4_BLOCK_SHA256"
            ],
            "normalizedPinValue": "0000000000000000000000000000000000000000000000000000000000000000",
            "worktreeGitOid": "f40a1097202ef9742d20c2bc1fe9576061748b75",
            "worktreeSha256": "a725c2ae0195398b821ad67eb982e6790bd2a17fc316084e00e09314c2b052a1",
            "hunkCount": 24,
            "hunkBodySha256": [
                "483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc",
                "f0ffd40a078bd4e94baace9ba4ff3cf88f5b5e6938a2e7ecb7acfbe725c41af0",
                "a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d",
                "93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008",
                "d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1",
                "082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a",
                "eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4",
                "5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7",
                "dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1",
                "fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3",
                "cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5",
                "4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb",
                "012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4",
                "b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e",
                "6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd",
                "a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58",
                "56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d",
                "2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a",
                "f2b1ad844eb6a93aa4ea221a12e2050b1f7027031e97e4fe9fc6ae943120a7af",
                "377330b9749d396b437589aceeed655461b219255b43e2c0380d29e7c33ed90d",
                "f14ad05698a65d2392cdc631292381dc1be25d14f831a01570ea18fb6eaf9e9e",
                "1a0acead5e92707cb01b43f17d69c86ea7a8da5cca74399f82212e2a2c246820",
                "d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b",
                "6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b"
            ]
        }
    },
    "parserTransition": {
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "function": "validateOwnerSettledSuccessor",
        "semanticTransitionCount": 1,
        "allowedHunk": {
            "capturedLineRange": {
                "start": 1187,
                "end": 1191
            },
            "hashInput": "lines-joined-with-lf-no-trailing-newline",
            "oldAssertionCount": 5,
            "oldSha256": "c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848",
            "oldLines": [
                "  assert.equal(featureTenState.status, owner.nonCompletionState.featureStatus);",
                "  assert.equal(featureTenState.execution.scopeProgress[0].status, owner.nonCompletionState.scopeStatus);",
                "  assert.equal(featureTenState.certification.status, owner.nonCompletionState.certificationStatus);",
                "  assert.deepEqual(featureTenState.execution.completedPhaseClaims, owner.nonCompletionState.completedPhaseClaims);",
                "  assert.deepEqual(featureTenState.certification.completedScopes, owner.nonCompletionState.completedScopes);"
            ],
            "newSha256": "56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae",
            "newLines": [
                "  assert.deepEqual({",
                "    agent: executionMatches[0].agent,",
                "    startedAt: executionMatches[0].startedAt,",
                "    finishedAt: executionMatches[0].finishedAt,",
                "    statusBefore: executionMatches[0].statusBefore,",
                "    statusAfter: executionMatches[0].statusAfter,",
                "    scopesCompleted: executionMatches[0].scopesCompleted,",
                "    completionClaims: {",
                "      scopeComplete: executionMatches[0].exactEvidence.scopeComplete,",
                "      featureComplete: executionMatches[0].exactEvidence.featureComplete,",
                "      bug003Complete: executionMatches[0].exactEvidence.bug003Complete,",
                "      bug002Complete: executionMatches[0].exactEvidence.bug002Complete",
                "    }",
                "  }, {",
                "    agent: 'bubbles.implement',",
                "    startedAt: '2026-07-17T00:14:13Z',",
                "    finishedAt: '2026-07-17T00:34:15Z',",
                "    statusBefore: 'not_started',",
                "    statusAfter: 'not_started',",
                "    scopesCompleted: [],",
                "    completionClaims: {",
                "      scopeComplete: false,",
                "      featureComplete: false,",
                "      bug003Complete: false,",
                "      bug002Complete: false",
                "    }",
                "  }, 'Feature 010 historical owner-return entry remains exact after later certification');",
                "  assert.equal(featureTenState.status, 'done', 'Feature 010 current status is the exact certified successor');",
                "  assert.equal(featureTenState.certifiedAt, '2026-07-30T14:41:30Z', 'Feature 010 certification timestamp is exact');",
                "  assert.equal(featureTenState.certification.status, 'done', 'Feature 010 current certification status is done');",
                "  assert.deepEqual(featureTenState.execution.scopeProgress.map(({ scope, status }) => ({ scope, status })), [",
                "    { scope: 1, status: 'done' },",
                "    { scope: 2, status: 'done' },",
                "    { scope: 3, status: 'done' },",
                "    { scope: 4, status: 'done' },",
                "    { scope: 5, status: 'done' },",
                "    { scope: 6, status: 'done' },",
                "    { scope: 7, status: 'done' },",
                "    { scope: 8, status: 'done' }",
                "  ], 'Feature 010 current execution has exactly eight ordered done scopes');",
                "  assert.equal(featureTenState.certification.completedScopes.length, 8, 'Feature 010 current certification has exactly eight completed scopes');",
                "  assert.equal(new Set(featureTenState.certification.completedScopes).size, 8, 'Feature 010 current certification completed scopes are unique');",
                "  assert.deepEqual(featureTenState.certification.certifiedCompletedPhases, [",
                "    'implement',",
                "    'test',",
                "    'regression',",
                "    'simplify',",
                "    'gaps',",
                "    'harden',",
                "    'stabilize',",
                "    'security',",
                "    'validate',",
                "    'audit',",
                "    'chaos',",
                "    'docs',",
                "    'spec-review'",
                "  ], 'Feature 010 current certification phases are exact and ordered');"
            ]
        },
        "structuralAdditions": {
            "newPinConstant": "const CURRENT_IDENTITY_V5_BLOCK_SHA256 = '<marker-inclusive-v5-sha256>';",
            "newPinPlacement": "immediately after CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "normalizedV1MustRemainByteIdentical": true,
            "normalizedV2MustBeAdditive": true,
            "v5SchemaParserMustBeAdditive": true,
            "v5AdversarialCasesMustBeAdditive": true,
            "existingEvidenceIdentityAndAdversarialBytesMayNotChange": true
        }
    },
    "normalizedSelfPins": {
        "mode": "normalized-self-pins/v2",
        "pinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256"
        ],
        "retainedPinValues": {
            "DURABLE_EVIDENCE_BLOCK_SHA256": "c5ed7a110a2a743d2aef3b32c0655a2fd3c20c7ca6c9ee2ecef2716654ef7268",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256": "64ddfd9bb8a2adbaa218eb1a7f0efbe62746a51b7fcdc0ad2444debf297da30c"
        },
        "capturePin": {
            "name": "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "valueDuringCapture": "0000000000000000000000000000000000000000000000000000000000000000",
            "finalValueSource": "feature004-dirty-collision-current-identity-v5 marker-inclusive no-trailing-newline SHA-256"
        },
        "captureSequence": [
            "Validate the raw durable and v4 hashes before reading v5.",
            "Validate parserBeforeSemanticEdit against the current parser before changing existing semantic bytes.",
            "Add the v5 pin, v2 normalizer, closed v5 parser, and additive adversarial cases without changing v1 or predecessor bytes.",
            "Set the v5 pin to 64 zeroes while computing the normalized v2 identity.",
            "Apply exactly parserTransition.allowedHunk and no other replacement of existing semantic bytes.",
            "Compute the marker-inclusive v5 hash and replace only the zero v5 pin value.",
            "Require v2 normalization and the exact transition contract to reproduce the authorized successor."
        ],
        "failClosed": "Reject missing, duplicate, renamed, reordered, non-64-hex, or extra pin literals. Reject any changed v1 byte, predecessor parser byte, evidence byte, identity byte, or prior adversarial byte."
    },
    "adversarialMutations": [
        "mutated historical owner-return selector, status, scopesCompleted, or false completion claim",
        "absent, not_started, in_progress, blocked, unknown, or extra current Feature 010 status",
        "wrong or missing certifiedAt",
        "missing, extra, duplicate, reordered, or non-done execution scope",
        "missing, extra, or duplicate completed scope",
        "extra, missing, duplicate, or reordered certified phase",
        "mutated, unresolved, duplicated, or missing TR-F010-SCOPE01-TEST-OWNERSHIP-01",
        "missing, duplicate, malformed, reordered, or unknown v5 field",
        "changed durable or v4 hash",
        "changed plan-owned successor identity",
        "missing, duplicate, renamed, reordered, or changed v2 pin",
        "any existing parser replacement outside parserTransition.allowedHunk",
        "any mutation of predecessor evidence, identity, or adversarial bytes"
    ],
    "preservationContract": {
        "v4RemainsByteIdentical": true,
        "durableEvidenceRemainsByteIdentical": true,
        "allPredecessorHashesRemainMandatory": true,
        "historicalOwnerReturnRemainsNoncompletionEvidence": true,
        "currentFeatureTenStateMustMatchCertifiedSuccessor": true,
        "resolvedTransitionRemainsExact": true,
        "planOwnedPathTransitionCount": 3,
        "testPlanRowCount": 84,
        "testPlanDodParityCount": 84,
        "scopeOneStatus": "In Progress",
        "scopeTwoStatus": "Not Started",
        "featureStatus": "in_progress",
        "certificationStatus": "in_progress",
        "feature004CompletedScopes": [],
        "productEditsAllowed": false,
        "featureTenEditsAllowed": false,
        "gitStateMutationAllowed": false,
        "unrelatedDirtyWorkMustRemainUnchanged": true
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-COLLISION-LIFECYCLE-SUCCESSOR-001",
        "testEditBoundary": "tests/feature-004-dirty-tree-collision.test.mjs only",
        "requiredActions": [
            "Add only CURRENT_IDENTITY_V5_BLOCK_SHA256 and the additive normalized-self-pins/v2 family. Keep both existing pin values and every normalized-self-pins/v1 byte unchanged.",
            "Parse exactly one v5 block with the exact ordered schema above after validating durable evidence and v4 by raw hash.",
            "Overlay only the three planOwnedPathTransitions before recomputing current v4 path identities.",
            "Apply exactly parserTransition.allowedHunk inside validateOwnerSettledSuccessor.",
            "Add every listed adversarial mutation without weakening or changing any predecessor adversarial case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs and require three passes, zero failures, zero skips, and zero todo tests.",
            "Replay the unchanged BUG-002 verification after the final parser is green.",
            "Return no product edit, Feature 010 edit, checkbox change, status change, Scope 2 pickup, certification mutation, Git-state mutation, or unrelated dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-current-identity-v5:end -->

## Foreign Roadmap Identity Successor - `F004-COLLISION-FOREIGN-ROADMAP-V6`

### Summary

The exact v4 and v5 report blocks remain byte-identical at their marker-inclusive hashes. The v4 foreign-path inventory records an earlier 22-hunk `docs/Product-Review-and-Roadmap.md` identity. The same unstaged foreign-unrelated path is now stable at the exact 25-hunk identity below. This successor overlays only that roadmap identity. It grants no semantic approval, acceptance, Feature 004 ownership, completion, or certification, and it does not apply the separately authorized v5 parser transition.

### Completion Statement

Planning records one closed v6 identity and routes parser implementation to `bubbles.test`. Scope 1 remains In Progress, Scope 2 remains locked, every checkbox remains unchanged, and product, test, roadmap, generated, status, and certification surfaces remain untouched.

<!-- feature004-dirty-collision-foreign-roadmap-v6:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-foreign-roadmap/v6",
    "findingId": "F004-COLLISION-FOREIGN-ROADMAP-V6",
    "capturedAt": "2026-08-04T02:27:05Z",
    "extendsContracts": [
        {
            "marker": "feature004-dirty-collision-current-identity-v5",
            "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6"
        },
        {
            "marker": "feature004-dirty-collision-current-identity-v4",
            "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6"
        }
    ],
    "previousRoadmapIdentity": {
        "path": "docs/Product-Review-and-Roadmap.md",
        "pathKind": "tracked",
        "classification": "foreign-unrelated",
        "ownerAttribution": "owner: unknown",
        "feature004OwnershipClaim": false,
        "status": " M",
        "staged": false,
        "unstaged": true,
        "headOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
        "indexOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
        "worktreeGitOid": "f23c99707989d580ffeca6c50434723380c0c763",
        "worktreeSha256": "ff8cce305ac0385e99468de29205e84ee31f645e05f171eb8cedb6b891ed7379",
        "hunkCount": 22,
        "hunkBodySha256": [
            "40176ae5f2fd464650ca58f7dc1418000778aa030a833849ca73fa0c7cd71e6f",
            "c2fc7186a7065431cd96698264544aca8692ab2ef1dfe819c552486b0de0ffc6",
            "1bf7916f52f145246d6f5d6af63f51b7ad235bb924d00af2ed231895c6249e51",
            "c898b3c4ceb05354cfd53927723fef141cee2e5e42b381cd86b812c4ce78299a",
            "78d6f39d3d15fc9f75a5d782a30481755e272541c6f288f2f828a1e24e56ede9",
            "9a826b1633153762527d70a30df0bd743c6fe88b963d6f8ec514e0f881105c11",
            "3ab6ae72fdef851b3bc133d3df0071b58997d95418f1b1800b07dd7ea622a88e",
            "d3ee434ec8900dd1a85dd90119ea84c3cb6702ead97dbac8777e5ce349bdb17c",
            "62e7bd1559f26066d6968ecc73f5c73f2281989d10315de9e9335711eebf8bc5",
            "1ec0d81f07ae7f0c1bdb6bcda9bb6072f6901dc8b4678443ac2ae49fa6e50d79",
            "841f1222eb2a9e9910d5e61787f8dd9878fa5233c02c9cb39976972ab2f11acf",
            "f7563d17145dc8e476313c04af545043d47bcc3a9cd48f842ae42bc9e0aa7152",
            "1731322e6747831c90e984d216682edc1747b5d2df500116e9d43abb35acacb5",
            "c80816800a9f6cf410a86b121a0a87c8755be294c1795c0e7fa38d7e90ba571a",
            "1fc1863a8336fe1623609c2bc3052923f58398e564e42ca587aac6732d576881",
            "fe919b89d0488181844118d28a8c7befcefa7a54a89de24f36ee09aefae0ee27",
            "800abd9bd9362c6646220c4a9fd760a419bfeb0510d438325e5a7d4a2c0e29fd",
            "013fbfe7ae59bf5c8d2096238f1bea7b8518a515b7b9b0a85c2938a87d6ecb6b",
            "7129c5219ca7026d43dff3110698e58716e268b7fe4b5042b4b52ce90f4f9a6a",
            "f4cbd2d99b0445e7852e57982b60988852fa71a6df6155c4661e421cbfe8ce3d",
            "472486e79a7de2cfa3dd938f46ca22d199a9e77511c1f857e3c13a66e6e8f114",
            "eab169ccd6d6da24b04fc2616c6dce1c675c84bcf4ee43fbecdae569f69c33e3"
        ],
        "lastCommit": "225455ddc40fe995c9e2203f613a57a5bde57e3a"
    },
    "foreignRoadmapOverlay": {
        "overlayCount": 1,
        "path": "docs/Product-Review-and-Roadmap.md",
        "previousIdentityRef": {
            "marker": "feature004-dirty-collision-current-identity-v4",
            "field": "foreignProtectedPaths[path=docs/Product-Review-and-Roadmap.md]"
        },
        "currentIdentity": {
            "path": "docs/Product-Review-and-Roadmap.md",
            "pathKind": "tracked",
            "classification": "foreign-unrelated",
            "ownerAttribution": "owner: unknown",
            "feature004OwnershipClaim": false,
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
            "indexOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
            "worktreeGitOid": "016656d4bc39799cb976e02208f8a3ec81bdabc6",
            "worktreeSha256": "8cb06fb713f25b52423604d7a0e196fa3017e685b756cfd5873604a588d068e6",
            "byteLength": 94895,
            "additions": 555,
            "deletions": 0,
            "hunkCount": 25,
            "hunkBodySha256": [
                "40176ae5f2fd464650ca58f7dc1418000778aa030a833849ca73fa0c7cd71e6f",
                "c2fc7186a7065431cd96698264544aca8692ab2ef1dfe819c552486b0de0ffc6",
                "1bf7916f52f145246d6f5d6af63f51b7ad235bb924d00af2ed231895c6249e51",
                "c898b3c4ceb05354cfd53927723fef141cee2e5e42b381cd86b812c4ce78299a",
                "78d6f39d3d15fc9f75a5d782a30481755e272541c6f288f2f828a1e24e56ede9",
                "9a826b1633153762527d70a30df0bd743c6fe88b963d6f8ec514e0f881105c11",
                "3ab6ae72fdef851b3bc133d3df0071b58997d95418f1b1800b07dd7ea622a88e",
                "d3ee434ec8900dd1a85dd90119ea84c3cb6702ead97dbac8777e5ce349bdb17c",
                "62e7bd1559f26066d6968ecc73f5c73f2281989d10315de9e9335711eebf8bc5",
                "1ec0d81f07ae7f0c1bdb6bcda9bb6072f6901dc8b4678443ac2ae49fa6e50d79",
                "841f1222eb2a9e9910d5e61787f8dd9878fa5233c02c9cb39976972ab2f11acf",
                "f7563d17145dc8e476313c04af545043d47bcc3a9cd48f842ae42bc9e0aa7152",
                "02491a633017d8c81d2e8f2d9690b0cf24f7af339f6ec7362d40dce6919c284b",
                "122f93a2cdce610e161c7e40628966c766bc20c6db421ac4378a0dd725c33c22",
                "1731322e6747831c90e984d216682edc1747b5d2df500116e9d43abb35acacb5",
                "c80816800a9f6cf410a86b121a0a87c8755be294c1795c0e7fa38d7e90ba571a",
                "1fc1863a8336fe1623609c2bc3052923f58398e564e42ca587aac6732d576881",
                "fe919b89d0488181844118d28a8c7befcefa7a54a89de24f36ee09aefae0ee27",
                "800abd9bd9362c6646220c4a9fd760a419bfeb0510d438325e5a7d4a2c0e29fd",
                "013fbfe7ae59bf5c8d2096238f1bea7b8518a515b7b9b0a85c2938a87d6ecb6b",
                "7129c5219ca7026d43dff3110698e58716e268b7fe4b5042b4b52ce90f4f9a6a",
                "f4cbd2d99b0445e7852e57982b60988852fa71a6df6155c4661e421cbfe8ce3d",
                "472486e79a7de2cfa3dd938f46ca22d199a9e77511c1f857e3c13a66e6e8f114",
                "eab169ccd6d6da24b04fc2616c6dce1c675c84bcf4ee43fbecdae569f69c33e3",
                "e0245b20de8fd8a4c8889edb6c1495e203ed5f9b2f8405d47a7ab2e27a727f5e"
            ],
            "lastCommit": "225455ddc40fe995c9e2203f613a57a5bde57e3a"
        },
        "currentAuthor": "unknown",
        "semanticApproval": false,
        "semanticAcceptance": false,
        "ownershipTransfer": false,
        "completionClaim": false,
        "certificationClaim": false,
        "disposition": "foreign-unrelated-current-identity-only"
    },
    "pendingV5SemanticTransition": {
        "marker": "feature004-dirty-collision-current-identity-v5",
        "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6",
        "status": "authorized-unapplied",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "function": "validateOwnerSettledSuccessor",
        "oldHunkSha256": "c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848",
        "newHunkSha256": "56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae",
        "semanticTransitionCount": 1,
        "applicationOrder": "after-foreign-roadmap-v6-overlay"
    },
    "planningRoutingTransitions": [
        {
            "path": "specs/004-fx-regime-relative-value-lab/scopes.md",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v5",
                "field": "planOwnedPathTransitions[path=specs/004-fx-regime-relative-value-lab/scopes.md].currentIdentity"
            },
            "previousWorktreeGitOid": "b1566d7d4cb86865ae444ad1a1ee88c14fba25cf",
            "previousWorktreeSha256": "69aa381dd855cbce4412ee88fa87ac2cf13f212c6de69c89082042c2ebbb25f2",
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/scopes.md",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "8be70cf56fd0031c44b999eb38666018efb0f69d",
                "indexOid": "8be70cf56fd0031c44b999eb38666018efb0f69d",
                "worktreeGitOid": "bb6e657a93b01bac99824608d97604aea0f4f98b",
                "worktreeSha256": "e69f1184f4c2e770185f9e35c43ce0d85bc9476de3520e4cc2712c9f9cbcc1a3",
                "hunkCount": 84,
                "hunkBodySha256": [
                    "556117c9b4b5445952dc229dbfc6b4aa3afe65765fdb4f398c3430dc1a3261e9",
                    "894c7bce06b7f79bfc8770a50c43ce893b7c375bf1a649dd110a831028d1e2e2",
                    "145219197f3ddaf8b18eb2600ef42826b8a12126c8e8f61da31ff258631080bd",
                    "1f30ff32a01d290a00cc65ce2252b57d10581e20a14448ef442aa72273bec8c0",
                    "47b577c4165ffb30fe2508443e2805efe2c39e9b99c70bb85236056709c51f15",
                    "e9ceb405e5b7552578c05b5669d90151bef868420b663db9e179e4b75473dd9a",
                    "a8bfd992e6b1a91266ef0f6f9fb41309b3e85ae279ddb8750b1118f7dca64958",
                    "f8b6fce6ad4a4b827e280da83b778dd378b797c772beca93e06b2da619ad507c",
                    "ec8cb2712756b6cf60a69426f0aeae56a55fa1f84a1af8cea8a6576d41c02575",
                    "667958dc5467dcdc2eca15d19bda9d78be1a6379942f103f49078b1a1c6f476e",
                    "1fc06be199fdce4680b79ba01b08fd75581e4a925a6c918f87f9cbd32cfb8d3c",
                    "c8316019385c20e984a190d72b65261e1096dbf965daeb89aeb49437afc6f5f5",
                    "ad2b93f5965406a763627061dc997d9a00f5b2564ccfad7715b732bc0cd019a8",
                    "1703901a3faf186c7cbb4eaacad7350aa72019604ef541dcc1b79201d32a4f1e",
                    "c7f40277b51c2bd706f9587a45b9083be3b6d90fc20fee53842b814ea87eb32f",
                    "a0a84fb6c6c0dac91935a955c4a6ac15c17f1ae8d3f06fc3d46ed526708685b5",
                    "73b58c9d8100ead70c4f495b23096dc1117957833e0cbc441cfa7b8b65e08076",
                    "4e94f843c56383f5d8ac22f05f351d4f73d7571eff76723b394d08b4b12a190e",
                    "671c87f6288b31e167a590253dc7ece6819ca78a48f7b7cd0b8be2335256bc8e",
                    "5d47f5d056e30a7bb9fed7eed4aedd0faa5ade96ca17a4a79344e1f7412e4d90",
                    "f536c0ae608b8f300f0679428d71d2cf5fefa27edd7db136760d71eff3ee9d89",
                    "e24556004cf67bbce8e4788573b8d94905fac05480e00d97494df0e299514b1c",
                    "7470def2a668d0bd478541dcc0ebc62aca82045e3fce80d06c420b59ae1888b5",
                    "071a3a0e82563038f8600a127b111cb153e8a84e1d0a0cf015567306f0f79ce6",
                    "ae34f8cf4513e310613dc1ad6a03a419da5d57bf7a1a6d49d4896e5446c04b66",
                    "d4ecd33a960d8e8297755809f1bcbfdcf41831321d868137dbe4a1a57fb5c5af",
                    "326b848422a189b292b2eb4e37ef0558a284736db556e0649554f0c912d6c68f",
                    "88f39adef0de5e851447b108924d3973f3bc3bfeee945831d102e0c9db34af0d",
                    "91c84aa775f5ce692b7a4e7777df6ee277378dd82484edf63ca0a83d0d14c384",
                    "71b10f59f8ba9c5ff9012c7894d82e0171721ba03b1fb011200e1373cc69e4da",
                    "57ab3a9dcc3f13b7daeaaed5b49879657aecdb3f86f13e4914193cb3a5dd0931",
                    "5061a6a7c8f3327dd4aa2ffe543c3477b6061db7e0b9a4524e4ddb69d0a8f197",
                    "0cf7ac4acb9f13b72d38be130e6e6a359d7ab5b5cdb4f07046860582a809a3f7",
                    "d8e405dd51a86ba6a67c039bd140a45078d07f8b7eb1766e7ce5cf937e59d7c2",
                    "940deb879995b9aa730b5edbd8528ea66e41a24aabbb327563769176faffba91",
                    "b60a3197d831ab627719edaed29a090f5f6fa241d4a78daf65101505a128c8c4",
                    "25b71486d37880dda50a916e2a5f7cdae029a65b571fdee0df535868c8214b48",
                    "a7365aaa1339bb1fdb8b53804c89c85a1c2dda4377a08a932e4bde9be9fcde22",
                    "8912095e0c96831aa83288db5255cb613c79957466c9b8789e81964d1f51016a",
                    "8b471a145ad9c10e8dcf0c989051eb3b61b79a74038d92fa8e7dc61fcc9ba4b3",
                    "b5ece2acd0126253ea8558110d85ba0bec60caf69b4dab35fcf84e161cb2d5de",
                    "8f7f2318fd0546793f9a2ed3703be68d4270b6ab7446bf867038804e676d4d14",
                    "4e7893fcb680211b1f62a7b9cccdae94429076d1955d1430d69e92ca708a050d",
                    "43e77f7c4156f02723da8f72694c4266f95a954850bb4261471e18321cd38369",
                    "8c71ba8cfb4fe8886c8a778c9c6f666c977405b436d3d9b4247ad93280907138",
                    "5635bd668bbc7fff8df73076cdc56cb0f387349c7be009298a2d82820ac51533",
                    "916c4a11ed0206dc7d874f968b9fb8922b3a43c35b343b35815e04ebec03098b",
                    "626f21a86229b0a41bdcbc8d7ee4c897e5f5d4c234e0fdac63f1c72409b9578d",
                    "696f015c7070c7f6335cf84d9f805958e21d18efa9d8f1222570fe140ce45413",
                    "23343126430a2446448361b7c55f1f541e3a7b9a76a60ca81c6321b2d7d9e457",
                    "e7eced7b52dde09ccbb068f3494786df5681de1f0913a52ed74f663e4c55a29d",
                    "624e518151fa3485b237710f9015c4a7cd4ef526f3e42fa5f8f32d0abacbe81d",
                    "24e1b19cd2894260f8c87f0404103e6e9fbdc75bd465bd0db3a43ef54b6b7c6d",
                    "431f7561625c60bae72232b8caa307b5d3deb14ba676655a5bcb0be9e0f0c7f8",
                    "204209a610f5436d99caec6baec76b54c13257c01029e8f9c88f7595afa53fdb",
                    "4d93345707023d9020f3d5a268678e26959779c5853779494fc15718d6bac18b",
                    "985e4b2b6f71f07146de0293f1a00ed9919895ec2b219bc02534486d41c4c595",
                    "a90d85213646cddd73083e60f24d74f1f7e4c0da12089ec942f556a3d1ad7ede",
                    "aeb6f5d51355b627833a883b2da8a52982fb33f5062e877ac0fcf3b128ec12fc",
                    "dffefcc7a1630ec7a4eb8c593f8d1d8cd707c4731200016b2ed9edbbafb39149",
                    "d43108364a53385d410c36488b3518f6848ea0b5e635945023886ab898f2dca9",
                    "b2a7ab4501ea285cafd0194cc02e3fe421413b4226bfdd4c162c601639af5dfc",
                    "4553dbfd8f06ac7557b2fc123ff739afab8bafd9a8d7fc4f7f19a3b3e3bd2385",
                    "e48f3b6118e40ea7be3633488f7c528412b40974cebfe43be83028b8799fa5fc",
                    "2fff60e084c520847c4190372d7f5806d60f56d54116689e8ea26734ebedb13f",
                    "91d6f36e4923afa3d293bbc9f3d9e01333e42d3aaace68dace91a91c464a850f",
                    "215376ad10f166c3356378b3560ece8b8a74ad1f2aac356b22c904aeeff238dc",
                    "da9a8c1f519c33b39984c357a016d1faba5eab52c1496d4775fdca0a2aeb923a",
                    "0da9c6d5dfc4d239712450f5c81a43c6d04217fb2d18240d38050724aa7ce911",
                    "6ef96258b82cc57f1d4d018b00f14dadbdf6542183a8f1fa8a14f4301cd1a125",
                    "1d5791e2f9f9f173349f02e42488e9100fa0e59193409f2ce5699758a9321062",
                    "3fe01ca02637b3a62c60f7b1ca6852ec9781b92e1e0770611965db2ed9c170ce",
                    "c55424d55c10035d6910c5f242d26175d5ca9369a17ed4e1d959a91812f0f00f",
                    "329888840945f4a7135885f765bfc4bedb00389004ef233cad7bc4b20b487272",
                    "0269d4b3ebae41a761e2011c77bf213dff5b25dd13335190120cd0f2916c0d09",
                    "e8773c70879f7382a8fe41795af97f45a076003b6ef38de46354951fe4669c93",
                    "9e8413cb7961997b70bdc9eed796558def9457c22174749f7b582528411f4537",
                    "2e3b6934a11f0be4c279000f3fccdf11a834eb3cc72dcb08d3605fe068dcc9e7",
                    "ad8dea340f56b309fc19ed7c994cd7d68286cce171c2f28b8f20899fddbf5a1f",
                    "bdf663f77d25c9fe472bdadcd5086f4ef978bcc04060e0503f16c3febc8bc0f8",
                    "2aeed9e1a48e8c09ca3ae56a8a75cd310f14187af454ecb5d8bf3464e17ff987",
                    "ba7797a2ab086d97faf1a4a6b603bb09fb7bf7b933ba61a888bf35588d1c827a",
                    "04492460564a63a7c6a6ab85b00df9f579589c1eecb95f2b7da137b005db9e7a",
                    "b5daeeb5d037d3170fa899223dc2e7d7b791d01d100ddd9266c523dc63324dac"
                ],
                "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5"
            },
            "disposition": "plan-owned-v6-routing-only"
        },
        {
            "path": "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v5",
                "field": "planOwnedPathTransitions[path=specs/004-fx-regime-relative-value-lab/test-plan.json].currentIdentity"
            },
            "previousWorktreeGitOid": "60abaa254e93fe18f4c0333658f2ca98d5b9fa72",
            "previousWorktreeSha256": "8924fe6b62c5e88c6fd636522025009800faa0e99e0a1c4a777bcc9f5536f414",
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/test-plan.json",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "ad889299d290518d5ba991fa78c04a45f32ae049",
                "indexOid": "ad889299d290518d5ba991fa78c04a45f32ae049",
                "worktreeGitOid": "4443a61391a5d81c3eb2bda9b697a79b5532091a",
                "worktreeSha256": "5d0725da0935271a5c944d09fd116196f555e21d8181b9c6e9e863306855e1df",
                "hunkCount": 8,
                "hunkBodySha256": [
                    "80c9a90e4bf14a6775e465bd453356e9b5aa069427598f33fbd21bf08eead12c",
                    "01312c8fb60cfd03503b42ce838a91c4def3b35b584dd27126328640dc7b1312",
                    "e00a427b31ef3db18d116cb14de1a29ea2fe2c7d801eabab3393627331fb4fa4",
                    "7f30204021af3d9c19999d120c906526ec0bde1f1785ed6682b9e9d1dcbb67e4",
                    "6412118202b789ec0d0113e903e5e04e52b51d278b0245e9b3cdd204fea3261e",
                    "e035d7be549a93303006105f026a0e8b7f8ae872bbc3f98da68e50a6d9b8f9b8",
                    "38aec630b924b7fd26c5771b5e792b5781d1f70d33e9d364ef00aa00781cfe6d",
                    "f5af664f7bc2df2e909d664dfd1a1821aa0976ec419063e05063391103d9a7ca"
                ],
                "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5"
            },
            "disposition": "plan-owned-v6-routing-only"
        },
        {
            "path": "specs/004-fx-regime-relative-value-lab/state.json",
            "previousIdentityRef": {
                "marker": "feature004-dirty-collision-current-identity-v5",
                "field": "planOwnedPathTransitions[path=specs/004-fx-regime-relative-value-lab/state.json].currentIdentity"
            },
            "previousWorktreeGitOid": "5a9da353e9af8ef50f22d7bafd8ad2303024f1e0",
            "previousWorktreeSha256": "72faf0c5913f4d3e9746c23a7cfbf5c5c24e922c575500f3ab98da412c3524b1",
            "currentIdentity": {
                "path": "specs/004-fx-regime-relative-value-lab/state.json",
                "pathKind": "tracked",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "48b76d7e6f25df232c8aee12b716230870497c92",
                "indexOid": "48b76d7e6f25df232c8aee12b716230870497c92",
                "worktreeGitOid": "f066dc1c72b91f7af1f1d179f7f9c6859d031527",
                "worktreeSha256": "3bca984b698419b79b8ba5db222b24841e48067994c65afdd6c38e9264c502c9",
                "hunkCount": 16,
                "hunkBodySha256": [
                    "7e52bdf8810db41b81620e0c448882f80407002e0e03983e7118e268bfca4781",
                    "5c4e0714db4de8d176988d1e9b347209c712bdf9dd4358ffc3c8288d2e35158a",
                    "9d191030b5926df4d6447481082f6129bd86af50ff311374de06ec0dbb4fd2b7",
                    "9f8f90656dc6f7c63d53c5a0dc8ef1d3491bd4559db7287b614c7ee91c1df3d6",
                    "fb2758738d96a824378a9fb1f8cd81292bee83d70ea44f3b9ffa345b504b2ec8",
                    "fb3c12f3ae2f855ef74e5edc362a0d49f5f8d0d57cf4e7f744c498529b012d14",
                    "735a28c74e36e669da0e681e3d8c03f642e1e544d6982692be851e8da0fe19aa",
                    "688ebf1b35c814e89c5f73f77af627703ba5b420935df32875416cd923397b6c",
                    "b041c333d26ba90e5a9caf1322a5bfa77e6315836cb0b743dc9f1dfd2b02616a",
                    "0fc3172e3e7a021405798481242e80733fa100b13c1804cfc3665540e305cc54",
                    "11f6bd60f91ee64e8cbed5b377c523046c0059503c7896ccc19312f2b86a09d7",
                    "e4809865a175354054c52eef2e93f27b8db155a6fba2d9e56646e63845a7370f",
                    "5f298814cf0b5f0b0ed2d15a9a24a78fecacd579e8ada5c0cedf849ab517dbbf",
                    "15852a057428a6bbfdddddf611980e2bb5cc9ac2f0b8b438a8a0027b440dbe52",
                    "ddb9a3e19817590ca07ca1cb0e397eb6fd5d3b068aa23ae94b4a78cb8eada260",
                    "1e8e8818270469dd1e96ed56353730ef61e2189371149011ca3277102f6cc9fc"
                ],
                "lastCommit": "de0c03389a343e5154af40e2ef885b59f3f75111"
            },
            "disposition": "plan-owned-v6-routing-only"
        }
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
        "pinCountDelta": 1,
        "normalizedMode": "normalized-self-pins/v3",
        "retainedPinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256"
        ],
        "applicationOrder": [
            "validate every predecessor and exact v4/v5 marker-inclusive hash",
            "parse exactly one closed v6 block",
            "overlay only the roadmap old-v4 identity with the exact 25-hunk current identity",
            "apply the three planning-routing transitions separately from the one-path foreign overlay",
            "apply the already-authorized v5 five-assertion semantic transition",
            "recompute the complete current identity matrix and fail closed on any remaining drift"
        ],
        "testEditBoundary": "one v6 pin/schema/adversarial branch plus the already-authorized v5 assertion transition",
        "productEditsAllowed": false
    },
    "adversarialMutations": [
        "missing, duplicate, malformed, reordered, or unknown v6 field",
        "wrong v5 or v4 parent hash",
        "path other than docs/Product-Review-and-Roadmap.md",
        "wrong roadmap status, staging state, head or index OID, worktree OID, SHA-256, byte length, additions, deletions, hunk count, hunk order, or hunk hash",
        "subset comparison or any changed non-roadmap v4 identity",
        "roadmap author inference, Feature 004 ownership, semantic approval, acceptance, completion, or certification inference",
        "v5 semantic transition applied before v6 roadmap overlay",
        "missing, duplicate, renamed, reordered, non-64-hex, or extra v6 pin",
        "planning-routing transition omitted, duplicated, reordered, broadened, or changed",
        "parser mutation outside the v6 schema/pin/adversarial branch and exact v5 transition"
    ],
    "preservationContract": {
        "v4RemainsByteIdentical": true,
        "v5RemainsByteIdentical": true,
        "everyPredecessorRemainsMandatory": true,
        "onlyRoadmapV4IdentityMayOverlay": true,
        "allOtherV4IdentitiesRemainExact": true,
        "roadmapCurrentAuthorRemainsUnknown": true,
        "roadmapClassificationRemainsForeignUnrelated": true,
        "roadmapFeature004OwnershipClaimRemainsFalse": true,
        "roadmapSemanticApprovalRemainsFalse": true,
        "v5SemanticTransitionRemainsUnappliedByPlanning": true,
        "v6OverlayMustPrecedeV5SemanticTransition": true,
        "planningRoutingTransitionCount": 3,
        "scopeOneStatus": "In Progress",
        "scopeTwoStatus": "Not Started",
        "featureStatus": "in_progress",
        "certificationStatus": "in_progress",
        "feature004CompletedScopes": [],
        "productEditsAllowed": false,
        "testEditsAllowedByPlanning": false,
        "roadmapEditsAllowed": false,
        "generatedEditsAllowed": false,
        "checkboxEditsAllowed": false,
        "statusEditsAllowed": false,
        "certificationEditsAllowed": false,
        "gitStateMutationAllowed": false,
        "unrelatedDirtyWorkMustRemainUnchanged": true
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-FOREIGN-ROADMAP-V6-001",
        "requiredActions": [
            "Add exactly one FOREIGN_ROADMAP_V6_BLOCK_SHA256 pin and one closed v6 parser branch while preserving every predecessor pin, parser requirement, and adversarial case.",
            "Validate exact v4 and v5 hashes, then overlay only docs/Product-Review-and-Roadmap.md from its old v4 identity to the exact 25-hunk v6 identity.",
            "Preserve every other v4 identity and apply the three plan-owned v6 routing transitions separately.",
            "Apply the already-authorized v5 semantic assertion transition only after the v6 roadmap overlay validates.",
            "Add every listed v6 adversarial mutation without weakening any predecessor case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs RED then GREEN and replay unchanged BUG-002 verification.",
            "Return no product, roadmap, generated, Feature 010, checkbox, status, Scope 2, certification, Git-state, or unrelated dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-foreign-roadmap-v6:end -->

## Foreign-Set Identity Successor - `F004-COLLISION-FOREIGN-SET-V7`

### Summary

The exact v4, v5, and v6 blocks remain byte-identical at their marker-inclusive hashes. V6 remains valid historical input, but its roadmap identity is no longer the live identity. The current NUL-safe inventory also contains exactly two foreign paths absent from v4 after excluding report recursion and the session lock file.

This v7 successor overlays the current roadmap identity and adds only those two paths. It grants no semantic approval, ownership transfer, Feature 004 ownership, acceptance, completion, checkbox, status, or certification claim.

### Completion Statement

Planning records one closed v7 foreign-set contract and routes parser implementation to `bubbles.test`. Scope 1 remains In Progress. Scope 2 remains locked. Tests, product files, foreign files, generated artifacts, checkboxes, status, and certification remain unchanged.

<!-- feature004-dirty-collision-foreign-set-v7:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-foreign-set/v7",
    "findingId": "F004-COLLISION-FOREIGN-SET-V7",
    "capturedAt": "2026-08-04T03:09:08.744Z",
    "extendsContracts": [
        {
            "marker": "feature004-dirty-collision-foreign-roadmap-v6",
            "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740"
        },
        {
            "marker": "feature004-dirty-collision-current-identity-v5",
            "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6"
        },
        {
            "marker": "feature004-dirty-collision-current-identity-v4",
            "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6"
        }
    ],
    "inventoryProof": {
        "v4CapturedPathCount": 42,
        "v4ExistingForeignPath": ".vscode/mcp.json",
        "reportRecursionExclusion": "specs/004-fx-regime-relative-value-lab/report.md",
        "lockFileExclusion": ".specify/memory/bubbles.session.json.flock",
        "currentUncapturedPathCount": 2,
        "currentUncapturedPaths": [
            "docs/Improvement-Plan.md",
            "etf-momentum-lab.html"
        ],
        "roadmapAlreadyCapturedByV4": true,
        "onlyDeclaredExclusionsAllowed": true,
        "inventoryCommandMode": "git status --porcelain=v1 -z --untracked-files=all"
    },
    "v6HistoricalContract": {
        "marker": "feature004-dirty-collision-foreign-roadmap-v6",
        "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740",
        "schemaAndHashValidationRequired": true,
        "historicalOverlayValidationRequired": true,
        "liveCurrentComparisonWhenV7Present": false,
        "disposition": "mandatory-historical-input"
    },
    "foreignSetOverlay": {
        "overlayCount": 3,
        "roadmapSuccessorCount": 1,
        "newPathCount": 2,
        "pathOrder": [
            "docs/Product-Review-and-Roadmap.md",
            "docs/Improvement-Plan.md",
            "etf-momentum-lab.html"
        ],
        "diffMode": "git diff --no-ext-diff --unified=0",
        "hunkHashInput": "ordered changed lines with plus or minus prefix joined by LF with no trailing LF",
        "currentIdentities": [
            {
                "path": "docs/Product-Review-and-Roadmap.md",
                "basePresence": "v4-v6-successor",
                "previousIdentityRef": "feature004-dirty-collision-foreign-roadmap-v6.foreignRoadmapOverlay.currentIdentity",
                "pathKind": "tracked",
                "classification": "foreign-unrelated",
                "ownerAttribution": "owner: unknown",
                "feature004OwnershipClaim": false,
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
                "indexOid": "5908e77e172fb78f7ef5dd2db1203aae7fd2016e",
                "worktreeGitOid": "f1286d2db719048541b5843040640126a68d74db",
                "worktreeSha256": "ce3ce690906bbac5466ce0571d089557487559502f3ab15f9b5818db45798d2d",
                "byteLength": 100995,
                "additions": 623,
                "deletions": 0,
                "hunkCount": 25,
                "hunkBodySha256": [
                    "40176ae5f2fd464650ca58f7dc1418000778aa030a833849ca73fa0c7cd71e6f",
                    "c2fc7186a7065431cd96698264544aca8692ab2ef1dfe819c552486b0de0ffc6",
                    "1bf7916f52f145246d6f5d6af63f51b7ad235bb924d00af2ed231895c6249e51",
                    "c898b3c4ceb05354cfd53927723fef141cee2e5e42b381cd86b812c4ce78299a",
                    "78d6f39d3d15fc9f75a5d782a30481755e272541c6f288f2f828a1e24e56ede9",
                    "9a826b1633153762527d70a30df0bd743c6fe88b963d6f8ec514e0f881105c11",
                    "3ab6ae72fdef851b3bc133d3df0071b58997d95418f1b1800b07dd7ea622a88e",
                    "d3ee434ec8900dd1a85dd90119ea84c3cb6702ead97dbac8777e5ce349bdb17c",
                    "62e7bd1559f26066d6968ecc73f5c73f2281989d10315de9e9335711eebf8bc5",
                    "1ec0d81f07ae7f0c1bdb6bcda9bb6072f6901dc8b4678443ac2ae49fa6e50d79",
                    "841f1222eb2a9e9910d5e61787f8dd9878fa5233c02c9cb39976972ab2f11acf",
                    "f7563d17145dc8e476313c04af545043d47bcc3a9cd48f842ae42bc9e0aa7152",
                    "02491a633017d8c81d2e8f2d9690b0cf24f7af339f6ec7362d40dce6919c284b",
                    "c6bd99e27fd2b40bd16620b25af914a61f6dc44fa81461d48629f674f5400ec2",
                    "1731322e6747831c90e984d216682edc1747b5d2df500116e9d43abb35acacb5",
                    "c80816800a9f6cf410a86b121a0a87c8755be294c1795c0e7fa38d7e90ba571a",
                    "1fc1863a8336fe1623609c2bc3052923f58398e564e42ca587aac6732d576881",
                    "fe919b89d0488181844118d28a8c7befcefa7a54a89de24f36ee09aefae0ee27",
                    "800abd9bd9362c6646220c4a9fd760a419bfeb0510d438325e5a7d4a2c0e29fd",
                    "013fbfe7ae59bf5c8d2096238f1bea7b8518a515b7b9b0a85c2938a87d6ecb6b",
                    "8ba35d67554b27caec631f3e8b3ff768e0782dfd2f0dccb150ec8036b19fad46",
                    "f4cbd2d99b0445e7852e57982b60988852fa71a6df6155c4661e421cbfe8ce3d",
                    "472486e79a7de2cfa3dd938f46ca22d199a9e77511c1f857e3c13a66e6e8f114",
                    "eab169ccd6d6da24b04fc2616c6dce1c675c84bcf4ee43fbecdae569f69c33e3",
                    "e0245b20de8fd8a4c8889edb6c1495e203ed5f9b2f8405d47a7ab2e27a727f5e"
                ],
                "lastCommit": "225455ddc40fe995c9e2203f613a57a5bde57e3a"
            },
            {
                "path": "docs/Improvement-Plan.md",
                "basePresence": "absent-from-v4",
                "previousIdentityRef": null,
                "pathKind": "tracked",
                "classification": "foreign-unrelated",
                "ownerAttribution": "owner: unknown",
                "feature004OwnershipClaim": false,
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "db0e08c9f80ceb5b777988bf446daf0544c8dc3e",
                "indexOid": "db0e08c9f80ceb5b777988bf446daf0544c8dc3e",
                "worktreeGitOid": "d37371251409bb8e4f24a861cd03dcebc7f7c5df",
                "worktreeSha256": "f84105b20bb5e47593426d14305fb16b60700cf143cda4af1a540eefcc40004e",
                "byteLength": 46804,
                "additions": 26,
                "deletions": 4,
                "hunkCount": 1,
                "hunkBodySha256": [
                    "a0a3bd81e86d9c8b5343a286145a67a6712f0352cf3d13b39ade2c8793f1da75"
                ],
                "lastCommit": "32e2ff6c96859519b41de5bf79bacb26b838787c"
            },
            {
                "path": "etf-momentum-lab.html",
                "basePresence": "absent-from-v4",
                "previousIdentityRef": null,
                "pathKind": "tracked",
                "classification": "foreign-unrelated",
                "ownerAttribution": "owner: unknown",
                "possibleContext": "Feature 012 shared adapter context",
                "possibleContextVerified": false,
                "feature004OwnershipClaim": false,
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "a415eb92540178d21a32e9ec67e2d0131261baea",
                "indexOid": "a415eb92540178d21a32e9ec67e2d0131261baea",
                "worktreeGitOid": "47fcd1a3a7db0e2cb3fd9d177abb1ebc7d193343",
                "worktreeSha256": "6383f4ae6ba145a5e7a343b75813cba33c1ca7c58392200f76b7cb14bc016136",
                "byteLength": 252209,
                "additions": 32,
                "deletions": 0,
                "hunkCount": 2,
                "hunkBodySha256": [
                    "740cd6aebe1b7d8f4a24123fb0f227d1976cad2af3ff6aaaddef3df2b7b1f334",
                    "3ddb91b0641e19fee5c4a6639ce87779f3a6ed86a34c97c38dd829857e6ea38c"
                ],
                "lastCommit": "76168e86e2030634d9fa740026c2f1e9733de53c"
            }
        ],
        "semanticApproval": false,
        "semanticAcceptance": false,
        "ownershipTransfer": false,
        "completionClaim": false,
        "certificationClaim": false
    },
    "pendingV5SemanticTransition": {
        "marker": "feature004-dirty-collision-current-identity-v5",
        "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6",
        "status": "authorized-unapplied",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "function": "validateOwnerSettledSuccessor",
        "oldHunkSha256": "c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848",
        "newHunkSha256": "56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae",
        "semanticTransitionCount": 1,
        "applicationOrder": "after-foreign-set-v7-overlay"
    },
    "parserOrder": [
        "validate exact v4 and construct its complete 42-path base inventory",
        "validate exact v6 schema, raw hash, parent hashes, and historical roadmap overlay without a live-current comparison",
        "parse exactly one closed v7 block, overlay the roadmap successor, and add exactly two foreign paths while preserving both exclusions",
        "apply the exact authorized v5 five-assertion semantic transition",
        "recompute the complete current matrix and reject every remaining, duplicate, missing, reordered, excluded, or newly introduced path"
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "FOREIGN_SET_V7_BLOCK_SHA256",
        "pinCountDelta": 1,
        "normalizedMode": "normalized-self-pins/v4",
        "retainedPinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256"
        ],
        "applicationOrder": [
            "validate every predecessor and exact v4, v5, and v6 marker-inclusive hash",
            "validate v6 as historical schema and overlay input without comparing it to live bytes when v7 exists",
            "parse exactly one closed v7 block",
            "overlay the roadmap successor and add exactly docs/Improvement-Plan.md and etf-momentum-lab.html",
            "apply the already-authorized v5 five-assertion semantic transition",
            "recompute the complete current identity matrix with both exclusions intact"
        ],
        "testEditBoundary": "one v7 pin, schema, parser, and adversarial branch plus the already-authorized v5 assertion transition",
        "productEditsAllowed": false
    },
    "adversarialMutations": [
        "missing, duplicate, malformed, reordered, or unknown v7 field",
        "wrong v6, v5, or v4 parent hash",
        "wrong path set, path order, duplicate addition, missing addition, or extra addition",
        "changed report-recursion or flock exclusion",
        "missing or changed inherited .vscode/mcp.json record",
        "wrong classification, owner attribution, possible-context verification, or Feature 004 ownership flag",
        "wrong status, staging flags, HEAD or index OID, worktree OID, SHA-256, byte length, additions, deletions, hunk count, hunk order, hunk hash, or last commit",
        "subset comparison or any changed inherited v4 or v6 identity",
        "semantic approval, acceptance, ownership transfer, completion, checkbox, status, or certification inference",
        "v5 semantic transition before v7 or v6 live-current comparison when v7 exists",
        "v6 schema or raw hash not validated",
        "missing, duplicate, renamed, reordered, non-64-hex, or changed v7 pin",
        "parser mutation outside the v7 schema, pin, adversarial branch, and exact v5 transition"
    ],
    "preservationContract": {
        "v4RemainsByteIdentical": true,
        "v5RemainsByteIdentical": true,
        "v6RemainsByteIdentical": true,
        "everyPredecessorRemainsMandatory": true,
        "allUnchangedV4AndV6IdentitiesRemainExact": true,
        "roadmapCurrentAuthorRemainsUnknown": true,
        "newPathCurrentAuthorsRemainUnknown": true,
        "allThreePathsRemainForeignUnrelated": true,
        "allThreeFeature004OwnershipClaimsRemainFalse": true,
        "semanticApprovalRemainsFalse": true,
        "ownershipTransferRemainsFalse": true,
        "v5SemanticTransitionRemainsUnappliedByPlanning": true,
        "v7OverlayMustPrecedeV5SemanticTransition": true,
        "reportRecursionExclusionRemainsExact": true,
        "lockFileExclusionRemainsExact": true,
        "scopeOneStatus": "In Progress",
        "scopeTwoStatus": "Not Started",
        "featureStatus": "in_progress",
        "certificationStatus": "in_progress",
        "feature004CompletedScopes": [],
        "productEditsAllowed": false,
        "testEditsAllowedByPlanning": false,
        "foreignPathEditsAllowed": false,
        "generatedEditsAllowed": false,
        "checkboxEditsAllowed": false,
        "statusEditsAllowed": false,
        "certificationEditsAllowed": false,
        "gitStateMutationAllowed": false,
        "unrelatedDirtyWorkMustRemainUnchanged": true
    },
    "planningRouting": {
        "updatedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            "specs/004-fx-regime-relative-value-lab/scopes.md",
            "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "specs/004-fx-regime-relative-value-lab/state.json"
        ],
        "transitionRequestId": "TR-F004-SCOPE01-FOREIGN-SET-V7-001",
        "nextRequiredOwner": "bubbles.test",
        "scopeStatusChanged": false,
        "checkboxChanged": false,
        "featureStatusChanged": false,
        "certificationChanged": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-FOREIGN-SET-V7-001",
        "requiredActions": [
            "Add exactly one FOREIGN_SET_V7_BLOCK_SHA256 pin and one closed v7 parser branch while preserving every predecessor pin, parser requirement, and adversarial case.",
            "Validate v4, validate v6 as historical input, apply the exact three-path v7 foreign set, then apply the exact v5 five-assertion transition.",
            "Add every listed v7 adversarial mutation without weakening any predecessor case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs RED then GREEN and replay unchanged BUG-002 verification.",
            "Return no product, foreign-document, generated, checkbox, status, Scope 2, certification, Git-state, or unrelated-dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-foreign-set-v7:end -->

## Post-Commit Collision Successor - `F004-COLLISION-POST-COMMIT-V9`

### Summary

Concurrent foreign work committed at exact HEAD `62776e7e6102fa07019aa006cc0d7ff07085190e`. That commit promoted some historical dirty records into HEAD without proving Feature 004 completion. The NUL-safe post-routing inventory contains exactly 23 porcelain paths: ten dirty Scope 1 paths, eleven surviving foreign dirty paths, report recursion, and the session flock exclusion.

This additive v9 successor preserves v4, durable evidence, v5, v6, and v7 as immutable history. It records all 19 required Scope 1 paths, including nine clean HEAD/index promotions, and exactly the eleven surviving foreign dirty paths without ownership transfer. Exact identity commitments cover every full current record, including status, staging flags, HEAD/index/worktree IDs, worktree SHA-256 and byte length, numstat, ordered hunk hashes, and last commit.

### Completion Statement

Planning records one closed v9 post-commit matrix and routes parser implementation to `bubbles.test`. Scope 1 remains In Progress. Scope 2 remains locked. No product, test, foreign, generated, checkmark, scope-status, top-level-status, or certification byte is changed by this report append.

<!-- feature004-dirty-collision-post-commit-v9:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-post-commit/v9",
    "findingId": "F004-COLLISION-POST-COMMIT-V9",
    "capturedAt": "2026-08-04T04:10:08.591Z",
    "requiredHead": "62776e7e6102fa07019aa006cc0d7ff07085190e",
    "extendsContracts": [
        { "marker": "feature004-dirty-collision-foreign-set-v7", "rawBlockSha256": "aec36d5c5287c4b84a81f56eff2d1e8ab6131ac699f048590bb63377009d7239" },
        { "marker": "feature004-dirty-collision-foreign-roadmap-v6", "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740" },
        { "marker": "feature004-dirty-collision-current-identity-v5", "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6" },
        { "marker": "feature004-dirty-collision-current-identity-v4", "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6" },
        { "marker": "feature004-scope1-durable-evidence-v1", "rawBlockSha256": "3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd" }
    ],
    "historicalValidation": {
        "v4SchemaAndHashRequired": true,
        "durableEvidenceSchemaAndHashRequired": true,
        "v6SchemaHashParentsAndOverlayRequired": true,
        "v7SchemaHashParentsAndOverlayRequired": true,
        "v6LiveCurrentComparisonWhenV9Present": false,
        "v7LiveCurrentComparisonWhenV9Present": false,
        "disposition": "mandatory-history-before-v9"
    },
    "identityContract": {
        "fullRecordOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status", "staged",
            "unstaged", "headOid", "indexOid", "worktreeGitOid",
            "worktreeSha256", "byteLength", "additions", "deletions",
            "hunkCount", "hunkBodySha256", "lastCommit"
        ],
        "identitySha256Input": "JSON.stringify of the full record with the exact ordered fields above",
        "hunkSequenceSha256Input": "JSON.stringify of the complete ordered hunkBodySha256 array",
        "diffMode": "git diff --no-ext-diff --unified=0",
        "hunkHashInput": "ordered changed lines with plus or minus prefix joined by LF with no trailing LF",
        "inventoryMode": "git status --porcelain=v1 -z --untracked-files=all",
        "matrixSha256Input": "JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records",
        "matrixSha256": "93ce0cf879f994d7d2df0df3d00da21a6bd5e3c8324ca230e577cc93f459ff42"
    },
    "inventoryProof": {
        "porcelainPathCount": 23,
        "dirtyRequiredPathCount": 10,
        "foreignDirtyPathCount": 11,
        "excludedDirtyPathCount": 2,
        "requiredPathCount": 19,
        "requiredTransitionCounts": {
            "clean-head-index-promotion": 9,
            "still-dirty-exact-identity": 5,
            "untracked-exact-identity": 5
        },
        "priorV7ForeignPathsNowClean": [
            "docs/Product-Review-and-Roadmap.md",
            "docs/Improvement-Plan.md",
            "etf-momentum-lab.html"
        ],
        "cleanHistoricalForeignRecordsRetained": false,
        "completionInferenceFromCommit": false
    },
    "postCommitMatrix": {
        "requiredRecords": [
            { "path": "rlfx.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "5a729cc70e75bc2b48b2e74e55a8e542d84fbc034653a0cef0d2f7d8811b09e7", "identitySha256": "525b71ed4a6cbf80b14c362453c68dcd37ca8f4e4558bc0c2f49d861f75a0a9a" },
            { "path": "fx-regime-universe.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "0f7056581629f933c0e06102d730e6ecaefd8486608613926db91925057db6b2" },
            { "path": "fx-vehicle-universe.json", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "613366f26f229b3754d88df42c48f9410bc5dec4332ceb5a06785613a8ff3e6c" },
            { "path": "rldata.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "ec357b0ec768e5c9f2f8056dcf593cf0a56c860ac2a8a91c1067a19dbcfb46a3" },
            { "path": "rlexperience.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 3, "hunkSequenceSha256": "1f64e0780e7d952e53de8d4b473a0f3d33864d76badf077718dd0a8ba0dac2bd", "identitySha256": "10650a9cd625d39be5aadec3f37797c909a29d60191a421636c6d69224a9039f" },
            { "path": "rlviews.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "24d67af1d980635208ffe18e804756068ed56c75ba5543a9d42a66156fb35645" },
            { "path": "rlbrief.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5a7838490395f6b2b9f941ea9b3750d7fa9f37ae5bb6ade4f7376637e407b187", "identitySha256": "fe51c658b7772da65118be89e301d5fdb7779a7b19104c69b344d42c7104a1ac" },
            { "path": "rljourney.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 13, "hunkSequenceSha256": "3b01c60e930ae612cd6a69a01e977e1deca1f193d1a51eeea81b2deccf6e7a79", "identitySha256": "b0128c975f14c5472c517175a26824402c2dc340563b7bd0a69c80d5509be11a" },
            { "path": "scripts/fetch-bars.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a412242cc4bdca2ab65130695d721c13198875aff4133f237ad2df46c7952ac" },
            { "path": "scripts/selftest.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "11bddb714b91359458f8caaa5a21ef709dec928c878443a4aaddf19f26e2c847" },
            { "path": "tests/fx-regime-relative-value-lab.spec.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c36b72bf1662f36e4dda767956ad655672365a667e585817c5bd7f1927d41302" },
            { "path": "tests/feature-004-dirty-tree-collision.test.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 26, "hunkSequenceSha256": "00d67d39086e104da50d3817a0b85f6979a1efecb293228e108c4ef268c9f7bf", "identitySha256": "22547f9234d3f104c69f6eda5f853c9059ef26cfc2f2d77c8125f2d34c561eb4" },
            { "path": "tests/feature-004-vehicle-universe.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "e57a8e13ec578d8cee974bda22d236244793a17e80527b0e8a7c8708108cefbd" },
            { "path": "tests/feature-004-tool-control-binding.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "66de3dfba52efc3690e14961f725b59cc3c98a6bde1b40ed49db2cfebe13b5cb" },
            { "path": "tests/feature-004-brief-eligibility.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a3c16a2bf2a7d51af863db88fa0eebb9452c0d02f032a26f585830e952fdd6e" },
            { "path": "tests/feature-004-journey-evidence-refresh.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "7962da9053ee525ad2d07eed36f428515c22af4a708f3c995a184a69ed1c80b9" },
            { "path": "tests/fixtures/fx-regime/commonjs-determinism-input.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c707cb9b4a7f089d031a0fb7a61abdf9de508035e6d00711b05218f0e2059420" },
            { "path": "tests/fixtures/fx-regime/foundation-cases.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "68694eac1df09cd7c0138a5396e4ba61d89a7f739947c715abece95d91e7355a" },
            { "path": "tests/fixtures/fx-regime/foundation-harness.html", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "da4d41ddf6ae195c344359ae3364b4d5ee38769e75ebe461f523909735250091" }
        ],
        "foreignRecords": [
            { "path": ".vscode/mcp.json", "pathKind": "tracked", "classification": "foreign-workspace-config", "ownerAttribution": "workspace configuration owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 1, "hunkSequenceSha256": "dbf753f6980868c0b054ce961646d416425ee9be4a0608c2bae4b8fe8e515000", "identitySha256": "f090545003da6f9c8a76b561478ec588b30b1d4a6e8ebca7feaf3a4fc1f65355" },
            { "path": "specs/004-fx-regime-relative-value-lab/design.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.design", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 71, "hunkSequenceSha256": "bfa586bea91d6f24ab6d415aeaf0e3b05503ff89b3a06e17275ade1aa59ba2f6", "identitySha256": "c36453d3df794801304a2d894c875a2c113b30f608420a9dbd9e8c65c01d33af" },
            { "path": "specs/004-fx-regime-relative-value-lab/scenario-manifest.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 35, "hunkSequenceSha256": "31a7688c6aeee847833b1a0580f40b452ae5f43ff24a83297aea259344a4ee22", "identitySha256": "5ecec468cc9f3eabf401705d3895be12ec208e75532d67bbbe6713d21b7d5401" },
            { "path": "specs/004-fx-regime-relative-value-lab/scopes.md", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 84, "hunkSequenceSha256": "3f1ec13e9e60ce58fc20982525d766883e1ae22e7e750b9fdd5c11756120e0b7", "identitySha256": "57bfea4e381582c847e3997566135fc409ead4bddf92a9eaf572f06226dd0637" },
            { "path": "specs/004-fx-regime-relative-value-lab/spec.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.analyst", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 83, "hunkSequenceSha256": "1600c7bbd39309576fe01879c610efba800fc75e00b930502b276f187f4235cb", "identitySha256": "1319136a4c702266af752729ef005822775fa3c1b34c390697e8e14bdf3ec460" },
            { "path": "specs/004-fx-regime-relative-value-lab/state.json", "pathKind": "tracked", "classification": "foreign-planning-routing-artifact", "ownerAttribution": "bubbles.plan (execution routing only)", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 16, "hunkSequenceSha256": "27006225737b63981801080060d44b3dd649c29978ce549e384f61b495c431f0", "identitySha256": "22a484cc71a499a13ac2be877694d74ca06f254a1873bfb9b51c8e9c79a8fbbe" },
            { "path": "specs/004-fx-regime-relative-value-lab/test-plan.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 12, "hunkSequenceSha256": "b2591a64fa423abfc6e83bb902216b5e519703e586e182a10e07a858398c9485", "identitySha256": "ae394108ee9f80cca73346c196b10be4fd11604c00303781ab10dffe7360e77c" },
            { "path": "specs/004-fx-regime-relative-value-lab/uservalidation.md", "pathKind": "tracked", "classification": "foreign-human-artifact", "ownerAttribution": "human owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "59e99281784193abe2849d1212070eaecfe207c2dd3e9803c3dfc9ac8fd551a9", "identitySha256": "2e32600b550c5223a4efff04a7fb76c9039356d628f8d5194fe1dc57db1338a6" },
            { "path": "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md", "pathKind": "tracked", "classification": "foreign-feature-artifact", "ownerAttribution": "Feature 012 / bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "f0643c470ccdc3db73eea1d5f8a1723c21cb92b7f956cbe946b82b15e83c96c1", "identitySha256": "813796929e23ba8bcd1a7562508b613195c9a82b3b4f686b3670aecabbf7c55f" },
            { "path": "tests/simple-production-bridge.integration.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 5, "hunkSequenceSha256": "5cf0ff5ad42cfd15cf1809d752a344f3ca53f07145e454ef2e6b2f90ea86a188", "identitySha256": "0f0a293df781a720a343a223c91d09bb5fe93472dd723a61a0b725286f02c966" },
            { "path": "tests/simple-production-bridge.unit.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5323c304fbe291d9c7afe6a2e35758624bf00790aa0c8829cd46bf4951f304b8", "identitySha256": "561b3b064b3d81537878a774762a95e2d4396144fcb25d8234a09c57b89c5a7e" }
        ],
        "excludedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            ".specify/memory/bubbles.session.json.flock"
        ],
        "ownershipTransfer": false,
        "semanticApproval": false,
        "completionClaim": false,
        "certificationClaim": false
    },
    "pendingV5SemanticTransition": {
        "marker": "feature004-dirty-collision-current-identity-v5",
        "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6",
        "status": "already-physical-requires-validation-after-v9",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "function": "validateOwnerSettledSuccessor",
        "oldHunkSha256": "c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848",
        "newHunkSha256": "56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae",
        "semanticTransitionCount": 1,
        "applicationOrder": "after-post-commit-v9-matrix"
    },
    "parserOrder": [
        "validate exact v4 and durable-evidence schemas, hashes, and historical records without live-current comparison",
        "validate exact v6 and v7 schemas, hashes, parent links, and historical overlays without live-current comparison",
        "parse exactly one closed v9 block and apply the complete 19-required plus 11-foreign post-commit matrix at the exact required HEAD",
        "validate and apply the already-physical v5 five-assertion semantic transition only after v9",
        "recompute complete current dirty-path equality with exactly report recursion and the session flock excluded"
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "POST_COMMIT_V9_BLOCK_SHA256",
        "pinValueSource": "marker-inclusive, no-trailing-newline SHA-256 of this report block",
        "pinCountDelta": 1,
        "normalizedMode": "normalized-self-pins/v5",
        "retainedPinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256"
        ],
        "testEditBoundary": "one v9 pin, version/schema/current-matrix parser branch, and adversarial cases; preserve every existing parser byte outside that additive boundary",
        "productEditsAllowed": false
    },
    "adversarialMutations": [
        "wrong required HEAD before append, after append, or during parser adoption",
        "missing, extra, duplicate, or reordered required or foreign path",
        "clean historical foreign path retained or current dirty path omitted",
        "clean-promotion, still-dirty, or untracked transition mismatch",
        "wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash",
        "wrong classification, owner attribution, Feature 004 ownership flag, or ownership transfer",
        "changed, missing, extra, reordered, or matrix-included exclusion",
        "wrong, missing, duplicate, or reordered predecessor marker or hash",
        "v5 validation before v9 or v6/v7 live-current comparison when v9 exists",
        "semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference",
        "missing, duplicate, renamed, reordered, non-64-hex, or changed v9 pin",
        "parser mutation outside the additive v9 pin/version/schema/current-matrix/adversarial branch"
    ],
    "captureStability": {
        "preAppendMatrixSha256": "93ce0cf879f994d7d2df0df3d00da21a6bd5e3c8324ca230e577cc93f459ff42",
        "postAppendMustMatch": true,
        "headMustRemainExact": true,
        "rollbackBoundary": "remove only incomplete v9 planning additions and return blocked",
        "foreignOrProductRollbackAllowed": false
    },
    "planningRouting": {
        "updatedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            "specs/004-fx-regime-relative-value-lab/scopes.md",
            "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "specs/004-fx-regime-relative-value-lab/state.json"
        ],
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V9-001",
        "nextRequiredOwner": "bubbles.test",
        "scopeStatusChanged": false,
        "checkboxChanged": false,
        "featureStatusChanged": false,
        "certificationChanged": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V9-001",
        "requiredActions": [
            "Add exactly one POST_COMMIT_V9_BLOCK_SHA256 pin and one closed v9 parser branch while preserving every predecessor byte and pin.",
            "Validate v4, durable evidence, v6, and v7 as history; apply the exact v9 matrix; then validate the already-physical v5 transition.",
            "Add every listed v9 adversarial mutation without weakening any predecessor case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs RED then GREEN and replay unchanged BUG-002 verification.",
            "Return no product, planning, foreign, generated, checkbox, status, Scope 2, certification, Git-state, or unrelated-dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-post-commit-v9:end -->

## Post-Commit Collision Current-Matrix Successor - `F004-COLLISION-POST-COMMIT-V9` v10

### Summary

The repository advanced from the immutable v9 HEAD `62776e7e6102fa07019aa006cc0d7ff07085190e` to exact HEAD `153a686c937017ae20a438f7a4a423cf76b019b3`. The v9 block remains mandatory, byte-identical history at marker-inclusive SHA-256 `fc6367325829099019f47966f54da67a33a88db13c49404c0416f51511f5a921`. It is not false evidence and is not rewritten by this successor.

An exact reconstruction of the pre-v9 parser source still yields 26 hunks, but yields hunk-sequence SHA-256 `fd95cbfe2d2ed31fb98253a41fa6bff338ae61448c64195c6e9c27875cb44f52` and full-record identity SHA-256 `c2440767b87968f198d0f8fdc306b018c20d318cb1ba89c4a5c0618c17e0ed4a`, rather than v9's immutable commitments. Recomputing the HEAD-versus-reconstructed-source diff through Git reproduced that result, so the hunk-boundary-filter hypothesis is falsified. The v10 successor records that mismatch as an exact historical disposition and makes the current HEAD plus current matrix authoritative for live comparison without relaxing or deleting any v9 assertion.

### Completion Statement

Planning appends one closed v10 successor and routes its exact additive parser handoff to `bubbles.test`. Scope 1 remains In Progress. Scope 2 remains Not Started. This append makes no product, test, foreign, generated, checkbox, scope-status, top-level-status, or certification change.

<!-- feature004-dirty-collision-post-commit-v10:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-post-commit/v10",
    "findingId": "F004-COLLISION-POST-COMMIT-V9",
    "successorRevision": "v10",
    "capturedAt": "2026-08-04T05:31:28.575Z",
    "requiredHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
    "successorOf": {
        "marker": "feature004-dirty-collision-post-commit-v9",
        "rawBlockSha256": "8101b4b8f0c0c6da62d9c391c0e65e696294a3e90fd6e04b261c4647b31c6356",
        "contractVersion": "feature004-dirty-collision-post-commit/v9",
        "requiredHead": "62776e7e6102fa07019aa006cc0d7ff07085190e",
        "relation": "additive-current-matrix-successor",
        "predecessorDisposition": "mandatory-immutable-history",
        "successorRequiredReasons": [
            "repository-head-advanced",
            "v9-parser-self-identity-non-reproducible-under-v9-reconstruction"
        ]
    },
    "extendsContracts": [
        { "marker": "feature004-dirty-collision-post-commit-v9", "rawBlockSha256": "8101b4b8f0c0c6da62d9c391c0e65e696294a3e90fd6e04b261c4647b31c6356" },
        { "marker": "feature004-dirty-collision-foreign-set-v7", "rawBlockSha256": "aec36d5c5287c4b84a81f56eff2d1e8ab6131ac699f048590bb63377009d7239" },
        { "marker": "feature004-dirty-collision-foreign-roadmap-v6", "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740" },
        { "marker": "feature004-dirty-collision-current-identity-v5", "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6" },
        { "marker": "feature004-dirty-collision-current-identity-v4", "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6" },
        { "marker": "feature004-scope1-durable-evidence-v1", "rawBlockSha256": "3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd" }
    ],
    "historicalValidation": {
        "allPredecessorMarkersHashesSchemasAndOrderRequired": true,
        "v9MarkerInclusiveBytesRequired": true,
        "v9MarkerInclusiveByteLength": 23091,
        "v9RequiredHeadValueRequired": true,
        "v9RequiredHeadComparedToLiveHeadWhenV10Present": false,
        "v9LiveMatrixComparisonWhenV10Present": false,
        "v9CommittedSelfIdentityValuesRequired": true,
        "v9ObservedReconstructionMismatchRequired": true,
        "v9EvidenceFalse": false,
        "v9AssertionDeletionOrWeakeningAllowed": false,
        "disposition": "mandatory-history-before-v10-with-exact-self-identity-disposition"
    },
    "v9SelfIdentityDisposition": {
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "v9CommittedRecord": {
            "hunkCount": 26,
            "hunkSequenceSha256": "00d67d39086e104da50d3817a0b85f6979a1efecb293228e108c4ef268c9f7bf",
            "identitySha256": "22547f9234d3f104c69f6eda5f853c9059ef26cfc2f2d77c8125f2d34c561eb4"
        },
        "observedUnderExactV9Reconstruction": {
            "function": "postCommitV9HistoricalParserIdentity",
            "repositoryHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
            "pathKind": "tracked",
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "indexOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "worktreeGitOid": "6d08a005e2e3f453e889b608c36ff302ede92a1e",
            "worktreeSha256": "182eb1fb66d67269c584d712fd3409fa221043805bc24e449b040c6542011d42",
            "byteLength": 237174,
            "additions": 2020,
            "deletions": 57,
            "hunkCount": 37,
            "hunkBodySha256": [
                "483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc",
                "aeae41364a0f7f3e30dcb417bbb1f350368c5ec9f99d82d3b7d97fd3f3cac93c",
                "d4cb34dd60951480280717e56f345dd4ecb7d24f58162fb2aba59de4d39f2562",
                "a53b8f779ab50592fe999d619706126e2212a6451cd2268131b128d518bb2c92",
                "228a58d354d0bdcc27c9008d2fcc0e06c92c4c0ea9e3b8b2bf50f9f274f3c005",
                "a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d",
                "93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008",
                "d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1",
                "1d357b1c7f346ccc80020caf3b497b4cdc645c1c7dcaed6ca8b3934374aaff47",
                "259852ab9614101ad1306d52df7c539c9d436ae6af9e7b5739165af0bbef81a0",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "03877572e1e5bbcc8749ab918b5f7fde5065a3da6239f7db8d65e2f529e8ac82",
                "082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a",
                "eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4",
                "fbd48f5d8b0c1c8da36e0937f1fbe357f6d1cc7925da80894c01053dc508193c",
                "ea642b29c9f5f67929b34dbe75f4be7cd6d0e4c2e50b50af3b8595a4d1f4b346",
                "fd7fb3cdc657adfe72254a24104ac76ff557f2d4edd6519ff215ae7b19bd6f8c",
                "5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7",
                "dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1",
                "fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3",
                "cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5",
                "4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb",
                "012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4",
                "b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e",
                "6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd",
                "a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58",
                "56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d",
                "2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a",
                "aaa495f885257770901d78fa28e559ae60947d1f7a596433d0f5c503814ae68a",
                "b13afbcc1b1046ebd6e0e55081105bf0b61654d5ee8327307473eb166e154a93",
                "377330b9749d396b437589aceeed655461b219255b43e2c0380d29e7c33ed90d",
                "f14ad05698a65d2392cdc631292381dc1be25d14f831a01570ea18fb6eaf9e9e",
                "1a0acead5e92707cb01b43f17d69c86ea7a8da5cca74399f82212e2a2c246820",
                "d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b",
                "6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b",
                "0ad97ac396a02c70a2603509d19575c6fd0fbf7e355f2c905cb0302b05705b5a"
            ],
            "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5",
            "hunkSequenceSha256": "9d7c1bc3138b7e1cb1bb527bb676542fe51f5a354a63c443cee80884fd5392ed",
            "identitySha256": "e8b3ed9d39bf26126b5befdd25e1f96ac4bea360875b1b069ec1eed9117abd44"
        },
        "discriminatingCheck": {
            "source": "reconstructed historical parser source with exact v9 additions removed",
            "diff": "Git recomputation of HEAD versus reconstructed source",
            "result": "same-observed-mismatch-tuple",
            "hunkBoundaryFilterHypothesis": "falsified",
            "safeV9OnlyParserFixAvailable": false
        },
        "validationRule": "validate the exact v9 block, pin, schema, required HEAD value, committed self tuple, and observed mismatch tuple; never replace one tuple with the other; never run v9 as the live-current matrix when v10 exists",
        "assertionRelaxationAllowed": false
    },
    "identityContract": {
        "fullRecordOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status", "staged",
            "unstaged", "headOid", "indexOid", "worktreeGitOid",
            "worktreeSha256", "byteLength", "additions", "deletions",
            "hunkCount", "hunkBodySha256", "lastCommit"
        ],
        "summaryOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status",
            "hunkCount", "hunkSequenceSha256", "identitySha256"
        ],
        "identitySha256Input": "JSON.stringify of the complete full record with the exact ordered fields above",
        "hunkSequenceSha256Input": "JSON.stringify of the complete ordered hunkBodySha256 array",
        "diffMode": "git diff --no-ext-diff --unified=0",
        "hunkHashInput": "ordered changed lines with plus or minus prefix joined by LF with no trailing LF",
        "inventoryMode": "git status --porcelain=v1 -z --untracked-files=all",
        "matrixSha256Input": "JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records",
        "matrixSha256": "78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a",
        "summariesAloneSatisfyMatrixValidation": false,
        "parserSelfCapture": {
            "captureMode": "normalized-self-pins/v5-pre-v10",
            "retainedPinNames": [
                "DURABLE_EVIDENCE_BLOCK_SHA256",
                "CURRENT_IDENTITY_V4_BLOCK_SHA256",
                "CURRENT_IDENTITY_V5_BLOCK_SHA256",
                "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
                "FOREIGN_SET_V7_BLOCK_SHA256",
                "POST_COMMIT_V9_BLOCK_SHA256"
            ],
            "path": "tests/feature-004-dirty-tree-collision.test.mjs",
            "pathKind": "tracked",
            "classification": "feature004-scope1-required",
            "ownerAttribution": "Feature 004 Scope 1",
            "feature004OwnershipClaim": true,
            "transitionClass": "still-dirty-exact-identity",
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "indexOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "worktreeGitOid": "4d4adca491d87f8df83ff247bac1b496340242ba",
            "worktreeSha256": "fc0560f81d6a995dce3eb4d13f8ba3759dd4422a2fdc60fa7741958cbb784e8f",
            "byteLength": 284620,
            "additions": 2855,
            "deletions": 57,
            "hunkCount": 37,
            "hunkBodySha256": [
                "483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc",
                "aeae41364a0f7f3e30dcb417bbb1f350368c5ec9f99d82d3b7d97fd3f3cac93c",
                "d4cb34dd60951480280717e56f345dd4ecb7d24f58162fb2aba59de4d39f2562",
                "bd646d505e2b55ce37604be5939a2288d6713a856f9a29aa6b9a3acc7e9529a7",
                "228a58d354d0bdcc27c9008d2fcc0e06c92c4c0ea9e3b8b2bf50f9f274f3c005",
                "a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d",
                "93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008",
                "d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1",
                "1d357b1c7f346ccc80020caf3b497b4cdc645c1c7dcaed6ca8b3934374aaff47",
                "259852ab9614101ad1306d52df7c539c9d436ae6af9e7b5739165af0bbef81a0",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "03877572e1e5bbcc8749ab918b5f7fde5065a3da6239f7db8d65e2f529e8ac82",
                "082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a",
                "eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4",
                "fbd48f5d8b0c1c8da36e0937f1fbe357f6d1cc7925da80894c01053dc508193c",
                "ea642b29c9f5f67929b34dbe75f4be7cd6d0e4c2e50b50af3b8595a4d1f4b346",
                "fd7fb3cdc657adfe72254a24104ac76ff557f2d4edd6519ff215ae7b19bd6f8c",
                "5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7",
                "dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1",
                "fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3",
                "cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5",
                "4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb",
                "012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4",
                "b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e",
                "6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd",
                "a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58",
                "56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d",
                "2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a",
                "277d4c43cdaeeb290a3e3ef95cb2dc167bbcd14c3aa276ce5bcdd310e43c918c",
                "b13afbcc1b1046ebd6e0e55081105bf0b61654d5ee8327307473eb166e154a93",
                "377330b9749d396b437589aceeed655461b219255b43e2c0380d29e7c33ed90d",
                "f14ad05698a65d2392cdc631292381dc1be25d14f831a01570ea18fb6eaf9e9e",
                "1a0acead5e92707cb01b43f17d69c86ea7a8da5cca74399f82212e2a2c246820",
                "d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b",
                "6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b",
                "0ad97ac396a02c70a2603509d19575c6fd0fbf7e355f2c905cb0302b05705b5a"
            ],
            "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5",
            "hunkSequenceSha256": "01a449768987cac42aa6b63640b7e308e23cf23b8ef3222e1264082dc3731715",
            "identitySha256": "f777010cd48f8f6d36ea28ec0b30b21c5dddcd975d782c48fe1814d2b1687c51"
        }
    },
    "inventoryProof": {
        "porcelainPathCount": 23,
        "porcelainPathOrder": [
            ".vscode/mcp.json",
            "rlbrief.js",
            "rlexperience.js",
            "rlfx.js",
            "rljourney.js",
            "specs/004-fx-regime-relative-value-lab/design.md",
            "specs/004-fx-regime-relative-value-lab/report.md",
            "specs/004-fx-regime-relative-value-lab/scenario-manifest.json",
            "specs/004-fx-regime-relative-value-lab/scopes.md",
            "specs/004-fx-regime-relative-value-lab/spec.md",
            "specs/004-fx-regime-relative-value-lab/state.json",
            "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "specs/004-fx-regime-relative-value-lab/uservalidation.md",
            "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md",
            "tests/feature-004-dirty-tree-collision.test.mjs",
            "tests/simple-production-bridge.integration.mjs",
            "tests/simple-production-bridge.unit.mjs",
            ".specify/memory/bubbles.session.json.flock",
            "fx-vehicle-universe.json",
            "tests/feature-004-brief-eligibility.test.mjs",
            "tests/feature-004-journey-evidence-refresh.test.mjs",
            "tests/feature-004-tool-control-binding.test.mjs",
            "tests/feature-004-vehicle-universe.test.mjs"
        ],
        "dirtyRequiredPathCount": 10,
        "foreignDirtyPathCount": 11,
        "excludedDirtyPathCount": 2,
        "requiredPathCount": 19,
        "matrixRecordCount": 30,
        "requiredTransitionCounts": {
            "clean-head-index-promotion": 9,
            "still-dirty-exact-identity": 5,
            "untracked-exact-identity": 5
        },
        "pathClassification": {
            "classificationBasis": "canonical artifact ownership plus explicit Feature 004, Feature 012, and workspace context; never dirtiness, commit authorship, or path history",
            "matrixForeignRecordSemantics": "foreignRecords means outside the Feature 004 Scope 1 required set; it does not override canonical artifact ownership",
            "uservalidationOwnershipSemantics": "bubbles.plan owns the artifact structure and the human owner owns semantic acceptance; no acceptance is inferred",
            "scope1CurrentPaths": [
                "rlbrief.js",
                "rlexperience.js",
                "rlfx.js",
                "rljourney.js",
                "tests/feature-004-dirty-tree-collision.test.mjs",
                "fx-vehicle-universe.json",
                "tests/feature-004-brief-eligibility.test.mjs",
                "tests/feature-004-journey-evidence-refresh.test.mjs",
                "tests/feature-004-tool-control-binding.test.mjs",
                "tests/feature-004-vehicle-universe.test.mjs"
            ],
            "planningOwnedCurrentPaths": [
                "specs/004-fx-regime-relative-value-lab/report.md",
                "specs/004-fx-regime-relative-value-lab/scenario-manifest.json",
                "specs/004-fx-regime-relative-value-lab/scopes.md",
                "specs/004-fx-regime-relative-value-lab/state.json",
                "specs/004-fx-regime-relative-value-lab/test-plan.json",
                "specs/004-fx-regime-relative-value-lab/uservalidation.md"
            ],
            "feature012BridgeCurrentPaths": [
                "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md",
                "tests/simple-production-bridge.integration.mjs",
                "tests/simple-production-bridge.unit.mjs"
            ],
            "workspaceConfigCurrentPaths": [
                ".vscode/mcp.json"
            ],
            "foreignSpecialistCurrentPaths": [
                "specs/004-fx-regime-relative-value-lab/design.md",
                "specs/004-fx-regime-relative-value-lab/spec.md"
            ],
            "sessionRuntimeExclusionPaths": [
                ".specify/memory/bubbles.session.json.flock"
            ],
            "ownershipInferredFromDirtiness": false,
            "ownershipInferredFromCommit": false,
            "ownershipInferredFromHistory": false
        },
        "completionInferenceFromInventory": false
    },
    "currentMatrix": {
        "requiredRecords": [
            { "path": "rlfx.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "5a729cc70e75bc2b48b2e74e55a8e542d84fbc034653a0cef0d2f7d8811b09e7", "identitySha256": "525b71ed4a6cbf80b14c362453c68dcd37ca8f4e4558bc0c2f49d861f75a0a9a" },
            { "path": "fx-regime-universe.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "0f7056581629f933c0e06102d730e6ecaefd8486608613926db91925057db6b2" },
            { "path": "fx-vehicle-universe.json", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "613366f26f229b3754d88df42c48f9410bc5dec4332ceb5a06785613a8ff3e6c" },
            { "path": "rldata.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "ec357b0ec768e5c9f2f8056dcf593cf0a56c860ac2a8a91c1067a19dbcfb46a3" },
            { "path": "rlexperience.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 3, "hunkSequenceSha256": "1f64e0780e7d952e53de8d4b473a0f3d33864d76badf077718dd0a8ba0dac2bd", "identitySha256": "10650a9cd625d39be5aadec3f37797c909a29d60191a421636c6d69224a9039f" },
            { "path": "rlviews.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "24d67af1d980635208ffe18e804756068ed56c75ba5543a9d42a66156fb35645" },
            { "path": "rlbrief.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5a7838490395f6b2b9f941ea9b3750d7fa9f37ae5bb6ade4f7376637e407b187", "identitySha256": "fe51c658b7772da65118be89e301d5fdb7779a7b19104c69b344d42c7104a1ac" },
            { "path": "rljourney.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 13, "hunkSequenceSha256": "3b01c60e930ae612cd6a69a01e977e1deca1f193d1a51eeea81b2deccf6e7a79", "identitySha256": "b0128c975f14c5472c517175a26824402c2dc340563b7bd0a69c80d5509be11a" },
            { "path": "scripts/fetch-bars.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a412242cc4bdca2ab65130695d721c13198875aff4133f237ad2df46c7952ac" },
            { "path": "scripts/selftest.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "874df4c56efa470155e06d55a9e937e7ce117abe9ab725304c94cf09a8a2a4a5" },
            { "path": "tests/fx-regime-relative-value-lab.spec.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c36b72bf1662f36e4dda767956ad655672365a667e585817c5bd7f1927d41302" },
            { "path": "tests/feature-004-dirty-tree-collision.test.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 37, "hunkSequenceSha256": "01a449768987cac42aa6b63640b7e308e23cf23b8ef3222e1264082dc3731715", "identitySha256": "f777010cd48f8f6d36ea28ec0b30b21c5dddcd975d782c48fe1814d2b1687c51" },
            { "path": "tests/feature-004-vehicle-universe.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "e57a8e13ec578d8cee974bda22d236244793a17e80527b0e8a7c8708108cefbd" },
            { "path": "tests/feature-004-tool-control-binding.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "66de3dfba52efc3690e14961f725b59cc3c98a6bde1b40ed49db2cfebe13b5cb" },
            { "path": "tests/feature-004-brief-eligibility.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a3c16a2bf2a7d51af863db88fa0eebb9452c0d02f032a26f585830e952fdd6e" },
            { "path": "tests/feature-004-journey-evidence-refresh.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "7962da9053ee525ad2d07eed36f428515c22af4a708f3c995a184a69ed1c80b9" },
            { "path": "tests/fixtures/fx-regime/commonjs-determinism-input.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c707cb9b4a7f089d031a0fb7a61abdf9de508035e6d00711b05218f0e2059420" },
            { "path": "tests/fixtures/fx-regime/foundation-cases.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "68694eac1df09cd7c0138a5396e4ba61d89a7f739947c715abece95d91e7355a" },
            { "path": "tests/fixtures/fx-regime/foundation-harness.html", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "da4d41ddf6ae195c344359ae3364b4d5ee38769e75ebe461f523909735250091" }
        ],
        "foreignRecords": [
            { "path": ".vscode/mcp.json", "pathKind": "tracked", "classification": "foreign-workspace-config", "ownerAttribution": "workspace configuration owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 1, "hunkSequenceSha256": "dbf753f6980868c0b054ce961646d416425ee9be4a0608c2bae4b8fe8e515000", "identitySha256": "f090545003da6f9c8a76b561478ec588b30b1d4a6e8ebca7feaf3a4fc1f65355" },
            { "path": "specs/004-fx-regime-relative-value-lab/design.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.design", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 71, "hunkSequenceSha256": "bfa586bea91d6f24ab6d415aeaf0e3b05503ff89b3a06e17275ade1aa59ba2f6", "identitySha256": "c36453d3df794801304a2d894c875a2c113b30f608420a9dbd9e8c65c01d33af" },
            { "path": "specs/004-fx-regime-relative-value-lab/scenario-manifest.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 35, "hunkSequenceSha256": "31a7688c6aeee847833b1a0580f40b452ae5f43ff24a83297aea259344a4ee22", "identitySha256": "5ecec468cc9f3eabf401705d3895be12ec208e75532d67bbbe6713d21b7d5401" },
            { "path": "specs/004-fx-regime-relative-value-lab/scopes.md", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 84, "hunkSequenceSha256": "3f1ec13e9e60ce58fc20982525d766883e1ae22e7e750b9fdd5c11756120e0b7", "identitySha256": "57bfea4e381582c847e3997566135fc409ead4bddf92a9eaf572f06226dd0637" },
            { "path": "specs/004-fx-regime-relative-value-lab/spec.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.analyst", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 83, "hunkSequenceSha256": "1600c7bbd39309576fe01879c610efba800fc75e00b930502b276f187f4235cb", "identitySha256": "1319136a4c702266af752729ef005822775fa3c1b34c390697e8e14bdf3ec460" },
            { "path": "specs/004-fx-regime-relative-value-lab/state.json", "pathKind": "tracked", "classification": "foreign-planning-routing-artifact", "ownerAttribution": "bubbles.plan (execution routing only)", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 16, "hunkSequenceSha256": "27006225737b63981801080060d44b3dd649c29978ce549e384f61b495c431f0", "identitySha256": "22a484cc71a499a13ac2be877694d74ca06f254a1873bfb9b51c8e9c79a8fbbe" },
            { "path": "specs/004-fx-regime-relative-value-lab/test-plan.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 12, "hunkSequenceSha256": "b2591a64fa423abfc6e83bb902216b5e519703e586e182a10e07a858398c9485", "identitySha256": "ae394108ee9f80cca73346c196b10be4fd11604c00303781ab10dffe7360e77c" },
            { "path": "specs/004-fx-regime-relative-value-lab/uservalidation.md", "pathKind": "tracked", "classification": "foreign-human-artifact", "ownerAttribution": "human owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "59e99281784193abe2849d1212070eaecfe207c2dd3e9803c3dfc9ac8fd551a9", "identitySha256": "2e32600b550c5223a4efff04a7fb76c9039356d628f8d5194fe1dc57db1338a6" },
            { "path": "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md", "pathKind": "tracked", "classification": "foreign-feature-artifact", "ownerAttribution": "Feature 012 / bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "f0643c470ccdc3db73eea1d5f8a1723c21cb92b7f956cbe946b82b15e83c96c1", "identitySha256": "813796929e23ba8bcd1a7562508b613195c9a82b3b4f686b3670aecabbf7c55f" },
            { "path": "tests/simple-production-bridge.integration.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 5, "hunkSequenceSha256": "5cf0ff5ad42cfd15cf1809d752a344f3ca53f07145e454ef2e6b2f90ea86a188", "identitySha256": "0f0a293df781a720a343a223c91d09bb5fe93472dd723a61a0b725286f02c966" },
            { "path": "tests/simple-production-bridge.unit.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5323c304fbe291d9c7afe6a2e35758624bf00790aa0c8829cd46bf4951f304b8", "identitySha256": "561b3b064b3d81537878a774762a95e2d4396144fcb25d8234a09c57b89c5a7e" }
        ],
        "excludedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            ".specify/memory/bubbles.session.json.flock"
        ],
        "excludedRecords": [
            {
                "path": "specs/004-fx-regime-relative-value-lab/report.md",
                "status": " M",
                "classification": "planning-owned-report-recursion-exclusion",
                "ownerAttribution": "bubbles.plan",
                "matrixEligible": false,
                "completionInferenceEligible": false
            },
            {
                "path": ".specify/memory/bubbles.session.json.flock",
                "status": "??",
                "classification": "session-runtime-lock-exclusion",
                "ownerAttribution": "session runtime",
                "matrixEligible": false,
                "completionInferenceEligible": false
            }
        ],
        "ownershipTransfer": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completionClaim": false,
        "checkboxClaim": false,
        "scopeStatusClaim": false,
        "topLevelStatusClaim": false,
        "certificationClaim": false
    },
    "inferenceContract": {
        "excludedPathsEligibleForMatrixInference": false,
        "excludedPathsEligibleForCompletionInference": false,
        "dirtyStateImpliesOwnership": false,
        "commitStateImpliesOwnership": false,
        "historyImpliesOwnership": false,
        "cleanPromotionImpliesApproval": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completion": false,
        "checkbox": false,
        "scopeStatus": false,
        "topLevelStatus": false,
        "certification": false
    },
    "parserOrder": [
        "validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and historical commitment through v9",
        "validate v9's exact required HEAD value and committed parser-self tuple as immutable history, then require the exact recorded v9 reconstruction mismatch tuple without substituting either tuple",
        "parse exactly one closed v10 block and require the exact current HEAD, 23-path porcelain order, classification groups, 30-record matrix, two exclusions, and zero-inference flags",
        "reconstruct the pre-v10 parser by removing only the exact v10 pin, normalized-family declaration, and closed v10 branch, then normalize the retained v5 pin family and compare the complete parser record",
        "recompute every complete required and foreign record, the matrix hash, and dirty-path equality while keeping both exclusions ineligible",
        "validate the already-physical v5 five-assertion semantic transition only after the v10 current matrix",
        "run all predecessor adversarial cases as mandatory history before the v10 adversarial cases"
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "POST_COMMIT_V10_BLOCK_SHA256",
        "pinValueSource": "marker-inclusive, no-trailing-newline SHA-256 of this v10 report block",
        "pinCountDelta": 1,
        "captureMode": "normalized-self-pins/v5-pre-v10",
        "normalizedMode": "normalized-self-pins/v6",
        "normalizedPinFamilyName": "NORMALIZED_SELF_PIN_NAMES_V6",
        "retainedPinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256",
            "POST_COMMIT_V9_BLOCK_SHA256"
        ],
        "normalizedPinFamilyOrder": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256",
            "POST_COMMIT_V9_BLOCK_SHA256",
            "POST_COMMIT_V10_BLOCK_SHA256"
        ],
        "reconstructionMode": "strip the exact v10 pin, NORMALIZED_SELF_PIN_NAMES_V6 declaration, and closed v10 branch; then normalize exactly NORMALIZED_SELF_PIN_NAMES_V5",
        "currentMatrixSelector": "v10-only",
        "predecessorValidationMode": "v9-and-all-predecessors-remain-mandatory-history",
        "testEditBoundary": "add exactly one v10 pin, one NORMALIZED_SELF_PIN_NAMES_V6 declaration, one closed FEATURE-004-COLLISION-POST-COMMIT-V10 parser/adversarial branch, and the minimum assignment that selects v10 as current; preserve every existing parser byte outside that additive boundary",
        "v9BranchEditAllowed": false,
        "predecessorEditAllowed": false,
        "productEditsAllowed": false,
        "planningEditsAllowed": false,
        "foreignEditsAllowed": false
    },
    "adversarialMutations": [
        "wrong current HEAD before append, after append, or during v10 parser adoption",
        "missing, duplicate, malformed, reordered, non-64-hex, or changed v10 marker or pin",
        "changed v9 marker-inclusive bytes, hash, byte length, schema, field order, required HEAD value, predecessor link, or committed self tuple",
        "missing, changed, or unexpectedly accepted v9 reconstruction mismatch tuple",
        "v9 committed self tuple replaced by the observed tuple or observed tuple replaced by the committed tuple",
        "v9 live HEAD or live matrix comparison executed as current when v10 exists",
        "any predecessor skipped because v10 exists",
        "missing, extra, duplicate, or reordered porcelain, required, foreign, classification-group, or excluded path",
        "wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash",
        "wrong Scope 1, planning-owned, Feature 012 bridge, workspace-config, foreign-specialist, or session-runtime classification",
        "ownership inferred from dirtiness, commit state, or history",
        "changed, missing, extra, reordered, matrix-included, or completion-inference-eligible exclusion",
        "wrong parser capture mode, retained pin family, v6 pin-family order, reconstruction order, or current-matrix selector",
        "semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference",
        "parser mutation outside the exact additive v10 pin, normalized-family, parser/adversarial branch, and current-selector boundary"
    ],
    "captureStability": {
        "preAppendMatrixSha256": "78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a",
        "postAppendMustMatch": true,
        "headMustRemainExact": true,
        "porcelainOrderMustRemainExact": true,
        "rollbackBoundary": "remove only an incomplete v10 report append and return blocked",
        "v9OrPredecessorRollbackAllowed": false,
        "foreignOrProductRollbackAllowed": false
    },
    "planningRouting": {
        "updatedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md"
        ],
        "otherPlanningArtifactUpdateMechanicallyRequired": false,
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V10-001",
        "nextRequiredOwner": "bubbles.test",
        "scopeStatusChanged": false,
        "checkboxChanged": false,
        "featureStatusChanged": false,
        "certificationChanged": false,
        "scopeTwoStarted": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V10-001",
        "requiredActions": [
            "Add exactly one POST_COMMIT_V10_BLOCK_SHA256 pin, one NORMALIZED_SELF_PIN_NAMES_V6 declaration, and one closed v10 parser/adversarial branch within the stated edit boundary.",
            "Validate every predecessor as mandatory immutable history, including the exact v9 committed tuple and exact v9 observed mismatch tuple.",
            "Use v10 as the sole live-current matrix at exact HEAD 153a686c937017ae20a438f7a4a423cf76b019b3.",
            "Reconstruct the pre-v10 parser exactly, normalize the retained v5 pin family, and validate all complete record, sequence, identity, inventory, exclusion, and matrix commitments.",
            "Implement every listed v10 adversarial mutation without deleting or weakening any predecessor case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs RED then GREEN and replay unchanged BUG-002 verification.",
            "Return no product, planning, foreign, generated, checkbox, status, Scope 2, certification, Git-state, or unrelated-dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-post-commit-v10:end -->

<!-- feature004-dirty-collision-post-commit-v11:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-post-commit/v11",
    "findingId": "F004-COLLISION-POST-COMMIT-V10",
    "successorRevision": "v11",
    "capturedAt": "2026-08-04T07:19:39.141Z",
    "requiredHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
    "successorOf": {
        "marker": "feature004-dirty-collision-post-commit-v10",
        "rawBlockSha256": "109efb870bc5f352088bfaf4f8b3df1b54e9cea9ad36f97df7508feefe287497",
        "markerInclusiveByteLength": 41318,
        "contractVersion": "feature004-dirty-collision-post-commit/v10",
        "requiredHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
        "matrixSha256": "78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a",
        "relation": "additive-current-matrix-successor",
        "predecessorDisposition": "mandatory-immutable-history",
        "historicalCollisionValidation": {
            "result": "green",
            "testsPassed": 3,
            "testsFailed": 0,
            "source": "operator-grounded continuation fact",
            "satisfiesCurrentLiveComparison": false
        },
        "successorRequiredReasons": [
            "dirty-inventory-expanded-after-v10",
            "v10-live-matrix-refuses-current-27-path-inventory"
        ]
    },
    "extendsContracts": [
        { "marker": "feature004-dirty-collision-post-commit-v10", "rawBlockSha256": "109efb870bc5f352088bfaf4f8b3df1b54e9cea9ad36f97df7508feefe287497" },
        { "marker": "feature004-dirty-collision-post-commit-v9", "rawBlockSha256": "8101b4b8f0c0c6da62d9c391c0e65e696294a3e90fd6e04b261c4647b31c6356" },
        { "marker": "feature004-dirty-collision-foreign-set-v7", "rawBlockSha256": "aec36d5c5287c4b84a81f56eff2d1e8ab6131ac699f048590bb63377009d7239" },
        { "marker": "feature004-dirty-collision-foreign-roadmap-v6", "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740" },
        { "marker": "feature004-dirty-collision-current-identity-v5", "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6" },
        { "marker": "feature004-dirty-collision-current-identity-v4", "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6" },
        { "marker": "feature004-scope1-durable-evidence-v1", "rawBlockSha256": "3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd" }
    ],
    "historicalValidation": {
        "allPredecessorMarkersHashesSchemasAndOrderThroughV10Required": true,
        "v10MarkerInclusiveBytesRequired": true,
        "v10MarkerInclusiveByteLength": 41318,
        "v10RequiredHeadValueRequired": true,
        "v10MatrixSha256Required": true,
        "v10HistoricalCollisionResult": "green-3-of-3-before-additive-inventory",
        "v10HistoricalResultSatisfiesCurrentLiveComparison": false,
        "v10RequiredHeadComparedToLiveHeadWhenV11Present": false,
        "v10LiveMatrixComparisonWhenV11Present": false,
        "v9NonReproducibleSelfIdentityDispositionRequired": true,
        "v9CommittedAndObservedTuplesRequired": true,
        "v9EvidenceFalse": false,
        "predecessorAssertionDeletionOrWeakeningAllowed": false,
        "disposition": "mandatory-history-through-v10-before-v11"
    },
    "v9SelfIdentityDisposition": {
        "sourceContractMarker": "feature004-dirty-collision-post-commit-v10",
        "sourceContractSha256": "109efb870bc5f352088bfaf4f8b3df1b54e9cea9ad36f97df7508feefe287497",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "v9CommittedRecord": {
            "hunkCount": 26,
            "hunkSequenceSha256": "00d67d39086e104da50d3817a0b85f6979a1efecb293228e108c4ef268c9f7bf",
            "identitySha256": "22547f9234d3f104c69f6eda5f853c9059ef26cfc2f2d77c8125f2d34c561eb4"
        },
        "observedUnderExactV9Reconstruction": {
            "hunkCount": 26,
            "hunkSequenceSha256": "9d7c1bc3138b7e1cb1bb527bb676542fe51f5a354a63c443cee80884fd5392ed",
            "identitySha256": "e8b3ed9d39bf26126b5befdd25e1f96ac4bea360875b1b069ec1eed9117abd44"
        },
        "disposition": "non-reproducible-self-identity",
        "committedTupleReopened": false,
        "observedTupleReopened": false,
        "tupleSubstitutionAllowed": false,
        "validationRule": "validate both exact tuples through the immutable v10 contract; never replace, overwrite, or compare either tuple as the v11 live-current parser identity"
    },
    "identityContract": {
        "fullRecordOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status", "staged",
            "unstaged", "headOid", "indexOid", "worktreeGitOid",
            "worktreeSha256", "byteLength", "additions", "deletions",
            "hunkCount", "hunkBodySha256", "lastCommit"
        ],
        "summaryOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status",
            "hunkCount", "hunkSequenceSha256", "identitySha256"
        ],
        "identitySha256Input": "JSON.stringify of the complete full record with the exact ordered fields above",
        "hunkSequenceSha256Input": "JSON.stringify of the complete ordered hunkBodySha256 array",
        "diffMode": "git diff --no-ext-diff --unified=0",
        "hunkHashInput": "ordered changed lines with plus or minus prefix joined by LF with no trailing LF",
        "inventoryMode": "git status --porcelain=v1 -z --untracked-files=all",
        "matrixSha256Input": "JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records",
        "matrixSha256": "450f4110582ec2451438369ec8bb1e693815272dd93d6a975f5f1ea2a5ad5ba3",
        "summariesAloneSatisfyMatrixValidation": false,
        "additiveForeignFullRecordsRequired": true,
        "parserSelfCapture": {
            "captureMode": "normalized-self-pins/v6-pre-v11",
            "retainedPinNames": [
                "DURABLE_EVIDENCE_BLOCK_SHA256",
                "CURRENT_IDENTITY_V4_BLOCK_SHA256",
                "CURRENT_IDENTITY_V5_BLOCK_SHA256",
                "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
                "FOREIGN_SET_V7_BLOCK_SHA256",
                "POST_COMMIT_V9_BLOCK_SHA256",
                "POST_COMMIT_V10_BLOCK_SHA256"
            ],
            "path": "tests/feature-004-dirty-tree-collision.test.mjs",
            "pathKind": "tracked",
            "classification": "feature004-scope1-required",
            "ownerAttribution": "Feature 004 Scope 1",
            "feature004OwnershipClaim": true,
            "transitionClass": "still-dirty-exact-identity",
            "status": " M",
            "staged": false,
            "unstaged": true,
            "headOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "indexOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5",
            "worktreeGitOid": "7421ff8245e5662e2847d51677886a0d766c4e20",
            "worktreeSha256": "b5e13046d6639d33bf0244b3718567a69d75c3333ed3067d14d7a15fbc425bcc",
            "byteLength": 341634,
            "additions": 3917,
            "deletions": 137,
            "hunkCount": 43,
            "hunkBodySha256": [
                "483a7d0132e46fbadf5a59ae34ab86a43b510ad25712eb13c15158f9f96909dc",
                "aeae41364a0f7f3e30dcb417bbb1f350368c5ec9f99d82d3b7d97fd3f3cac93c",
                "d4cb34dd60951480280717e56f345dd4ecb7d24f58162fb2aba59de4d39f2562",
                "94723e39f3eaf6ca632e90fdb87555a4697320c4f8aea7887b9fb3867f2c8532",
                "228a58d354d0bdcc27c9008d2fcc0e06c92c4c0ea9e3b8b2bf50f9f274f3c005",
                "a8817a8a5fafb2f06d96a943b4552e97ca7f7784e472e5f9055307051a1e322d",
                "93a555d05790ff147c91fa460e21454aa31d49243588db2db8d56a93230bc008",
                "d5e246c68ab5b99d1fa6ebc55752fc4507d1275ba16b3c063828664a315e31d1",
                "1d357b1c7f346ccc80020caf3b497b4cdc645c1c7dcaed6ca8b3934374aaff47",
                "259852ab9614101ad1306d52df7c539c9d436ae6af9e7b5739165af0bbef81a0",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "10c5c1b126c1b9dfa2763a16a393652a67161356f42e115dc8d234b474840c68",
                "03877572e1e5bbcc8749ab918b5f7fde5065a3da6239f7db8d65e2f529e8ac82",
                "082224ee61a922c00be7ab20790e0e0eb86df0d67f1d97be3eaffd0a6eef874a",
                "eb665f4f8fd8116c3f0883766f0df8deae97a638428eb9ee4ca99428b0c020d4",
                "fbd48f5d8b0c1c8da36e0937f1fbe357f6d1cc7925da80894c01053dc508193c",
                "ea642b29c9f5f67929b34dbe75f4be7cd6d0e4c2e50b50af3b8595a4d1f4b346",
                "fd7fb3cdc657adfe72254a24104ac76ff557f2d4edd6519ff215ae7b19bd6f8c",
                "5b7d579651eaa2632e9526beb2f6fc37f1d8346bc082b316dc51388fa7b2c6b7",
                "dad9da3edf75b5ce9bccc92d208185375e194c8f7b757059733ee70dfd6712a1",
                "fa65c70bd10772d7f32cec31d2ee4225f23c6af05540b22a80789c0a70b819d3",
                "cb0b48bd5097ce46f5e03bdf433ab36f125a2a102db7ba70f17c04afa88e49d5",
                "4c4b40344bdc9297d63a67476fa102d8608b16e213749548a200f30f931416bb",
                "012d6feddca2a39e305a40a7be03069951de389293d4e84b425d18e73959a7d4",
                "b0d1ad9384b8e486bbc448541d2d50e7da354264621d9c352dc687bfb29a164e",
                "6672d4007b8162a5471ce353a884e3052e60be5f79c88080a4b29cd48f71c1fd",
                "a2902975af55c6fd914e734dbb402dac37c8187e07e174987a7c97240b187b58",
                "56bc98088012519a144d0d4702fafa2160549548105d6a2ab1ad02758ff0474d",
                "2a36e2b667bbf782c1c08235800c2ed7c968316fbcba13edbac466e8abfa6a2a",
                "302420da3b76bfb57857b1ab701431f2b269bc5290d175cd298662b858deeab6",
                "79e34f2203ff270f5406cdf265cd227ac9aa3f144c299338bf0b233e7a9f4081",
                "209d45c88754186fac80bab4ed313d855940515a202aeb89373848ee1aca4082",
                "c61bc5599b382e220b36f632c1f38814c44b3db788976079447b2172c5640854",
                "cd0dd55e2f6b66eafe0ad63050f7f26904a1f71d9a1ab64304974896aa4baa05",
                "07d437b4fb6684de6e8b4dd3bebb2327ddd70974cbc89eec8c9dc18693551120",
                "a1391f7cd8cd79c01f91b5911eab4068f361ca83494ab25a0c9b2b446f4b62d8",
                "9da75b01053f7c988fde46505fe5797d4154f77edea880a771f255484b78c4a4",
                "a4447cad98f290ad5d70c63d3e7c76a6d2beea46f883f8fc9164e25d82208381",
                "d8fee55565247501fc1f2de202e76ca7d2784d78664ba650136216447fc32e6b",
                "6c43110e70190b2de8f6d32675ba679a10650c365224b92c97103d2ffd27089b",
                "0ad97ac396a02c70a2603509d19575c6fd0fbf7e355f2c905cb0302b05705b5a",
                "6b9b412ef3cc1e6a8d118e4dc9459299d76e7315d19d06ebb5c9ff4dea1e0836",
                "a2a3ccadb27b435611e640337c94f1d58a2239db75c91ec078976385238f5614"
            ],
            "lastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5",
            "hunkSequenceSha256": "a45d453312f592b111a8ee4a19a4d7dac124dfe9c5c94233ba16798feb2e862f",
            "identitySha256": "d12c360ef7037024d48fe93722f5efdddb863199697e8c5af701d4c077cbaaa3"
        }
    },
    "inventoryProof": {
        "porcelainPathCount": 27,
        "porcelainPathOrder": [
            ".vscode/mcp.json",
            "rlbrief.js",
            "rlexperience.js",
            "rlfx.js",
            "rljourney.js",
            "specs/004-fx-regime-relative-value-lab/design.md",
            "specs/004-fx-regime-relative-value-lab/report.md",
            "specs/004-fx-regime-relative-value-lab/scenario-manifest.json",
            "specs/004-fx-regime-relative-value-lab/scopes.md",
            "specs/004-fx-regime-relative-value-lab/spec.md",
            "specs/004-fx-regime-relative-value-lab/state.json",
            "specs/004-fx-regime-relative-value-lab/test-plan.json",
            "specs/004-fx-regime-relative-value-lab/uservalidation.md",
            "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md",
            "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md",
            "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md",
            "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json",
            "tests/feature-004-dirty-tree-collision.test.mjs",
            "tests/playwright-runtime.foundation.functional.mjs",
            "tests/simple-production-bridge.integration.mjs",
            "tests/simple-production-bridge.unit.mjs",
            ".specify/memory/bubbles.session.json.flock",
            "fx-vehicle-universe.json",
            "tests/feature-004-brief-eligibility.test.mjs",
            "tests/feature-004-journey-evidence-refresh.test.mjs",
            "tests/feature-004-tool-control-binding.test.mjs",
            "tests/feature-004-vehicle-universe.test.mjs"
        ],
        "dirtyRequiredPathCount": 10,
        "foreignDirtyPathCount": 15,
        "excludedDirtyPathCount": 2,
        "requiredPathCount": 19,
        "matrixRecordCount": 34,
        "requiredTransitionCounts": {
            "clean-head-index-promotion": 9,
            "still-dirty-exact-identity": 5,
            "untracked-exact-identity": 5
        },
        "pathClassification": {
            "classificationBasis": "canonical artifact ownership plus explicit Feature 004, Feature 012, BUG-002, and workspace context; never dirtiness, commit authorship, or path history",
            "matrixForeignRecordSemantics": "foreignRecords means outside the Feature 004 Scope 1 required set; it does not override canonical artifact ownership",
            "uservalidationOwnershipSemantics": "bubbles.plan owns the artifact structure and the human owner owns semantic acceptance; no acceptance is inferred",
            "scope1CurrentPaths": [
                "rlbrief.js",
                "rlexperience.js",
                "rlfx.js",
                "rljourney.js",
                "tests/feature-004-dirty-tree-collision.test.mjs",
                "fx-vehicle-universe.json",
                "tests/feature-004-brief-eligibility.test.mjs",
                "tests/feature-004-journey-evidence-refresh.test.mjs",
                "tests/feature-004-tool-control-binding.test.mjs",
                "tests/feature-004-vehicle-universe.test.mjs"
            ],
            "planningOwnedCurrentPaths": [
                "specs/004-fx-regime-relative-value-lab/report.md",
                "specs/004-fx-regime-relative-value-lab/scenario-manifest.json",
                "specs/004-fx-regime-relative-value-lab/scopes.md",
                "specs/004-fx-regime-relative-value-lab/state.json",
                "specs/004-fx-regime-relative-value-lab/test-plan.json",
                "specs/004-fx-regime-relative-value-lab/uservalidation.md"
            ],
            "feature012BridgeCurrentPaths": [
                "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md",
                "tests/simple-production-bridge.integration.mjs",
                "tests/simple-production-bridge.unit.mjs"
            ],
            "bug002PlanningCurrentPaths": [
                "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md",
                "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md",
                "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json"
            ],
            "bug002TestCurrentPaths": [
                "tests/playwright-runtime.foundation.functional.mjs"
            ],
            "additiveSinceV10Paths": [
                "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md",
                "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md",
                "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json",
                "tests/playwright-runtime.foundation.functional.mjs"
            ],
            "workspaceConfigCurrentPaths": [
                ".vscode/mcp.json"
            ],
            "foreignSpecialistCurrentPaths": [
                "specs/004-fx-regime-relative-value-lab/design.md",
                "specs/004-fx-regime-relative-value-lab/spec.md"
            ],
            "sessionRuntimeExclusionPaths": [
                ".specify/memory/bubbles.session.json.flock"
            ],
            "ownershipInferredFromDirtiness": false,
            "ownershipInferredFromCommit": false,
            "ownershipInferredFromHistory": false
        },
        "completionInferenceFromInventory": false
    },
    "currentMatrix": {
        "requiredRecords": [
            { "path": "rlfx.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "5a729cc70e75bc2b48b2e74e55a8e542d84fbc034653a0cef0d2f7d8811b09e7", "identitySha256": "525b71ed4a6cbf80b14c362453c68dcd37ca8f4e4558bc0c2f49d861f75a0a9a" },
            { "path": "fx-regime-universe.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "0f7056581629f933c0e06102d730e6ecaefd8486608613926db91925057db6b2" },
            { "path": "fx-vehicle-universe.json", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "613366f26f229b3754d88df42c48f9410bc5dec4332ceb5a06785613a8ff3e6c" },
            { "path": "rldata.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "ec357b0ec768e5c9f2f8056dcf593cf0a56c860ac2a8a91c1067a19dbcfb46a3" },
            { "path": "rlexperience.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 3, "hunkSequenceSha256": "1f64e0780e7d952e53de8d4b473a0f3d33864d76badf077718dd0a8ba0dac2bd", "identitySha256": "10650a9cd625d39be5aadec3f37797c909a29d60191a421636c6d69224a9039f" },
            { "path": "rlviews.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "24d67af1d980635208ffe18e804756068ed56c75ba5543a9d42a66156fb35645" },
            { "path": "rlbrief.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5a7838490395f6b2b9f941ea9b3750d7fa9f37ae5bb6ade4f7376637e407b187", "identitySha256": "fe51c658b7772da65118be89e301d5fdb7779a7b19104c69b344d42c7104a1ac" },
            { "path": "rljourney.js", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 13, "hunkSequenceSha256": "3b01c60e930ae612cd6a69a01e977e1deca1f193d1a51eeea81b2deccf6e7a79", "identitySha256": "b0128c975f14c5472c517175a26824402c2dc340563b7bd0a69c80d5509be11a" },
            { "path": "scripts/fetch-bars.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a412242cc4bdca2ab65130695d721c13198875aff4133f237ad2df46c7952ac" },
            { "path": "scripts/selftest.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "874df4c56efa470155e06d55a9e937e7ce117abe9ab725304c94cf09a8a2a4a5" },
            { "path": "tests/fx-regime-relative-value-lab.spec.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c36b72bf1662f36e4dda767956ad655672365a667e585817c5bd7f1927d41302" },
            { "path": "tests/feature-004-dirty-tree-collision.test.mjs", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 43, "hunkSequenceSha256": "a45d453312f592b111a8ee4a19a4d7dac124dfe9c5c94233ba16798feb2e862f", "identitySha256": "d12c360ef7037024d48fe93722f5efdddb863199697e8c5af701d4c077cbaaa3" },
            { "path": "tests/feature-004-vehicle-universe.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "e57a8e13ec578d8cee974bda22d236244793a17e80527b0e8a7c8708108cefbd" },
            { "path": "tests/feature-004-tool-control-binding.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "66de3dfba52efc3690e14961f725b59cc3c98a6bde1b40ed49db2cfebe13b5cb" },
            { "path": "tests/feature-004-brief-eligibility.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "4a3c16a2bf2a7d51af863db88fa0eebb9452c0d02f032a26f585830e952fdd6e" },
            { "path": "tests/feature-004-journey-evidence-refresh.test.mjs", "pathKind": "untracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "untracked-exact-identity", "status": "??", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "7962da9053ee525ad2d07eed36f428515c22af4a708f3c995a184a69ed1c80b9" },
            { "path": "tests/fixtures/fx-regime/commonjs-determinism-input.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "c707cb9b4a7f089d031a0fb7a61abdf9de508035e6d00711b05218f0e2059420" },
            { "path": "tests/fixtures/fx-regime/foundation-cases.json", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "68694eac1df09cd7c0138a5396e4ba61d89a7f739947c715abece95d91e7355a" },
            { "path": "tests/fixtures/fx-regime/foundation-harness.html", "pathKind": "tracked", "classification": "feature004-scope1-required", "ownerAttribution": "Feature 004 Scope 1", "feature004OwnershipClaim": true, "transitionClass": "clean-head-index-promotion", "status": "", "hunkCount": 0, "hunkSequenceSha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "identitySha256": "da4d41ddf6ae195c344359ae3364b4d5ee38769e75ebe461f523909735250091" }
        ],
        "foreignRecords": [
            { "path": ".vscode/mcp.json", "pathKind": "tracked", "classification": "foreign-workspace-config", "ownerAttribution": "workspace configuration owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 1, "hunkSequenceSha256": "dbf753f6980868c0b054ce961646d416425ee9be4a0608c2bae4b8fe8e515000", "identitySha256": "f090545003da6f9c8a76b561478ec588b30b1d4a6e8ebca7feaf3a4fc1f65355" },
            { "path": "specs/004-fx-regime-relative-value-lab/design.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.design", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 71, "hunkSequenceSha256": "bfa586bea91d6f24ab6d415aeaf0e3b05503ff89b3a06e17275ade1aa59ba2f6", "identitySha256": "c36453d3df794801304a2d894c875a2c113b30f608420a9dbd9e8c65c01d33af" },
            { "path": "specs/004-fx-regime-relative-value-lab/scenario-manifest.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 35, "hunkSequenceSha256": "31a7688c6aeee847833b1a0580f40b452ae5f43ff24a83297aea259344a4ee22", "identitySha256": "5ecec468cc9f3eabf401705d3895be12ec208e75532d67bbbe6713d21b7d5401" },
            { "path": "specs/004-fx-regime-relative-value-lab/scopes.md", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 84, "hunkSequenceSha256": "3f1ec13e9e60ce58fc20982525d766883e1ae22e7e750b9fdd5c11756120e0b7", "identitySha256": "57bfea4e381582c847e3997566135fc409ead4bddf92a9eaf572f06226dd0637" },
            { "path": "specs/004-fx-regime-relative-value-lab/spec.md", "pathKind": "tracked", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.analyst", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 83, "hunkSequenceSha256": "1600c7bbd39309576fe01879c610efba800fc75e00b930502b276f187f4235cb", "identitySha256": "1319136a4c702266af752729ef005822775fa3c1b34c390697e8e14bdf3ec460" },
            { "path": "specs/004-fx-regime-relative-value-lab/state.json", "pathKind": "tracked", "classification": "foreign-planning-routing-artifact", "ownerAttribution": "bubbles.plan (execution routing only)", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 16, "hunkSequenceSha256": "27006225737b63981801080060d44b3dd649c29978ce549e384f61b495c431f0", "identitySha256": "22a484cc71a499a13ac2be877694d74ca06f254a1873bfb9b51c8e9c79a8fbbe" },
            { "path": "specs/004-fx-regime-relative-value-lab/test-plan.json", "pathKind": "tracked", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 12, "hunkSequenceSha256": "b2591a64fa423abfc6e83bb902216b5e519703e586e182a10e07a858398c9485", "identitySha256": "ae394108ee9f80cca73346c196b10be4fd11604c00303781ab10dffe7360e77c" },
            { "path": "specs/004-fx-regime-relative-value-lab/uservalidation.md", "pathKind": "tracked", "classification": "foreign-human-artifact", "ownerAttribution": "human owner", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 7, "hunkSequenceSha256": "59e99281784193abe2849d1212070eaecfe207c2dd3e9803c3dfc9ac8fd551a9", "identitySha256": "2e32600b550c5223a4efff04a7fb76c9039356d628f8d5194fe1dc57db1338a6" },
            { "path": "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md", "pathKind": "tracked", "classification": "foreign-feature-artifact", "ownerAttribution": "Feature 012 / bubbles.plan", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "f0643c470ccdc3db73eea1d5f8a1723c21cb92b7f956cbe946b82b15e83c96c1", "identitySha256": "813796929e23ba8bcd1a7562508b613195c9a82b3b4f686b3670aecabbf7c55f" },
            { "path": "tests/simple-production-bridge.integration.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 5, "hunkSequenceSha256": "5cf0ff5ad42cfd15cf1809d752a344f3ca53f07145e454ef2e6b2f90ea86a188", "identitySha256": "0f0a293df781a720a343a223c91d09bb5fe93472dd723a61a0b725286f02c966" },
            { "path": "tests/simple-production-bridge.unit.mjs", "pathKind": "tracked", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 2, "hunkSequenceSha256": "5323c304fbe291d9c7afe6a2e35758624bf00790aa0c8829cd46bf4951f304b8", "identitySha256": "561b3b064b3d81537878a774762a95e2d4396144fcb25d8234a09c57b89c5a7e" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md", "pathKind": "tracked", "classification": "foreign-bug-planning-evidence", "ownerAttribution": "bubbles.plan/BUG-002", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 1, "hunkSequenceSha256": "c2406c1231bd7ba6ea8476e812e6762e1a6d61083e5c6e35fe0fca915afb5b91", "identitySha256": "d12d8da5059ecac153bd44f7fa638247569ddeea84660a05800c8ac2a4d574ee" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md", "pathKind": "tracked", "classification": "foreign-bug-planning-contract", "ownerAttribution": "bubbles.plan/BUG-002", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 1, "hunkSequenceSha256": "7a44e948edd49fc70ae257f2eef543d75b9d06dcd54f5e88d2fddbe5997a8825", "identitySha256": "bc3da688763fe7e85b83b26ed89f92173357b7f814454ad3acfbf686ad6d059b" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json", "pathKind": "tracked", "classification": "foreign-bug-planning-contract", "ownerAttribution": "bubbles.plan/BUG-002", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 10, "hunkSequenceSha256": "0170d671a35a6067c134936d9d6fe6ed64fa98f9e03aaad1ea879cc0d8c0cd50", "identitySha256": "a86ea2be3d6539e790831309bb420e1a3dca451ad0f5399b2c86ebe0c524c562" },
            { "path": "tests/playwright-runtime.foundation.functional.mjs", "pathKind": "tracked", "classification": "foreign-bug-test", "ownerAttribution": "bubbles.test/BUG-002", "feature004OwnershipClaim": false, "transitionClass": "still-dirty-exact-identity", "status": " M", "hunkCount": 3, "hunkSequenceSha256": "03395629d92f8b001924065976c19a28764cbeda261254bdde460d31b09cff59", "identitySha256": "82350774670b1ff2e67857169dc7d5854abcf89ea7e20fb0ba98976499be6d94" }
        ],
        "additiveForeignFullRecords": [
            {
                "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md",
                "pathKind": "tracked",
                "classification": "foreign-bug-planning-evidence",
                "ownerAttribution": "bubbles.plan/BUG-002",
                "feature004OwnershipClaim": false,
                "transitionClass": "still-dirty-exact-identity",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "a0e966351dcdcff06f1079882941fee63f123d63",
                "indexOid": "a0e966351dcdcff06f1079882941fee63f123d63",
                "worktreeGitOid": "723c7db82652385ce9b615d4f3815393f7d60513",
                "worktreeSha256": "579492ba243c82fccbfac0789707b1fc3b1b740ce9bad02d40b02fcdec173425",
                "byteLength": 416707,
                "additions": 108,
                "deletions": 0,
                "hunkCount": 1,
                "hunkBodySha256": [
                    "cc9a447c7cd9cde09be07eb4ad34a18683beff0db834a19bc45819b1a3182eb0"
                ],
                "lastCommit": "58af30fb539cedf85d1a1d2e096b4bace0687c40"
            },
            {
                "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md",
                "pathKind": "tracked",
                "classification": "foreign-bug-planning-contract",
                "ownerAttribution": "bubbles.plan/BUG-002",
                "feature004OwnershipClaim": false,
                "transitionClass": "still-dirty-exact-identity",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "4a375ff94554c2d3eec40ffb35da0f9cf780ceb8",
                "indexOid": "4a375ff94554c2d3eec40ffb35da0f9cf780ceb8",
                "worktreeGitOid": "66b1ce2b6e709d5dab05daa9a11e97fd8e5db29d",
                "worktreeSha256": "3e20620e351213bf589cdcea09bbbbba64425dbcaabee0c2b6072a59a9e08038",
                "byteLength": 62714,
                "additions": 134,
                "deletions": 0,
                "hunkCount": 1,
                "hunkBodySha256": [
                    "247bea94efc027a820fe91894ed282661c07da1fe34d950f7b74c5e9712b9d72"
                ],
                "lastCommit": "e4dfe8dd3c9c70638b5478b715f8d35bd73d5b92"
            },
            {
                "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json",
                "pathKind": "tracked",
                "classification": "foreign-bug-planning-contract",
                "ownerAttribution": "bubbles.plan/BUG-002",
                "feature004OwnershipClaim": false,
                "transitionClass": "still-dirty-exact-identity",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "872c3fc6a5e70e6f2d5c165e3e8220c8ab16694f",
                "indexOid": "872c3fc6a5e70e6f2d5c165e3e8220c8ab16694f",
                "worktreeGitOid": "788463709c5837435ca02c1a675f042147c59ce4",
                "worktreeSha256": "fca22716b7e5e69de77e366852f7d29a992485181a7a5d15266745b409c3a1d6",
                "byteLength": 26878,
                "additions": 126,
                "deletions": 14,
                "hunkCount": 10,
                "hunkBodySha256": [
                    "1e3ed4bc05bba638180f160b999e4a2aa24f77e62daebb35e50a345a64cae5df",
                    "72d8e9e7fdff85c974d8ebc9c25a0a60af29f280b14777a849623c636b88c69e",
                    "406092f7d5ba073af84c4c2ddfea41f9fe1908d76f33cfe81da049368ccb10bc",
                    "6a079cefa2fa390a3fe71783dbe30009a53f57bbaa16ea5dd7f89cd0d2239da3",
                    "34e18d2346941cd9f90d5b2870ee3a5b2311543b23756a0e4f0f25c61cb50eb8",
                    "5f076914b62c4bb2be4673208233c13eef2ae6f0ac5addc7d54f583e7509d8f4",
                    "c544a2d499ef604ac46a74afbc05f9e66765c3d02e5f5ce81d50b129bb2c8aac",
                    "b054c0252c981f5d8c5be5dece1bf9a962c2ee00212bad3e5603f32e5301164d",
                    "3198aa1c2f1cfb33a49395f50dd2631df5dd7b47c02c7288ba02ba5d37e60f94",
                    "fc359a55c952cfc295b35675f9169a85e456d2814cc80afe28b54cfb16ee39e5"
                ],
                "lastCommit": "afb8546bc35179640c0b63ec15c1464b74f912a0"
            },
            {
                "path": "tests/playwright-runtime.foundation.functional.mjs",
                "pathKind": "tracked",
                "classification": "foreign-bug-test",
                "ownerAttribution": "bubbles.test/BUG-002",
                "feature004OwnershipClaim": false,
                "transitionClass": "still-dirty-exact-identity",
                "status": " M",
                "staged": false,
                "unstaged": true,
                "headOid": "ada41bb73cc11880b005488e6d71ea94d204cb4e",
                "indexOid": "ada41bb73cc11880b005488e6d71ea94d204cb4e",
                "worktreeGitOid": "7f6e2504c6e6f71edcb8f7c5cad4b3420a8275f7",
                "worktreeSha256": "649e534dcd83669f36620f3384db7e1938adf2db63c231694bb6f0ecc2cfa591",
                "byteLength": 9926,
                "additions": 60,
                "deletions": 39,
                "hunkCount": 3,
                "hunkBodySha256": [
                    "08ed9da4b0e0a2c4dd7ad22ee24c697d0f4b4519b85693b114dd70c4b601399d",
                    "35954e54762770eb710906f4021d8ffe59cfdf61623f52655693f1386e20912a",
                    "8098126e24b164ac5e88edf128dfa1c074c70b976c75d1156cb605a54014ac6d"
                ],
                "lastCommit": "c5c86dda09e613b8eaab3f7d173817475813e3c0"
            }
        ],
        "excludedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            ".specify/memory/bubbles.session.json.flock"
        ],
        "excludedRecords": [
            {
                "path": "specs/004-fx-regime-relative-value-lab/report.md",
                "status": " M",
                "classification": "planning-owned-report-recursion-exclusion",
                "ownerAttribution": "bubbles.plan",
                "matrixEligible": false,
                "completionInferenceEligible": false
            },
            {
                "path": ".specify/memory/bubbles.session.json.flock",
                "status": "??",
                "classification": "session-runtime-lock-exclusion",
                "ownerAttribution": "session runtime",
                "matrixEligible": false,
                "completionInferenceEligible": false
            }
        ],
        "ownershipTransfer": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completionClaim": false,
        "checkboxClaim": false,
        "scopeStatusClaim": false,
        "topLevelStatusClaim": false,
        "certificationClaim": false
    },
    "inferenceContract": {
        "excludedPathsEligibleForMatrixInference": false,
        "excludedPathsEligibleForCompletionInference": false,
        "dirtyStateImpliesOwnership": false,
        "commitStateImpliesOwnership": false,
        "historyImpliesOwnership": false,
        "cleanPromotionImpliesApproval": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completion": false,
        "checkbox": false,
        "scopeStatus": false,
        "topLevelStatus": false,
        "certification": false
    },
    "parserOrder": [
        "validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and historical commitment through v10",
        "validate v10's exact marker-inclusive bytes, 39470-byte length, required HEAD, matrix hash, and historical 3-of-3 result without using v10 for current live comparison",
        "validate v9's exact non-reproducible-self-identity disposition and both immutable tuples through v10 without substitution or live-current comparison",
        "parse exactly one closed v11 block and require the exact current HEAD, 27-path porcelain order, classification groups, 34-record matrix, four additive full records, two exclusions, and zero-inference flags",
        "reconstruct the pre-v11 parser by removing only the exact v11 pin, normalized-family declaration, and closed v11 branch, then normalize the retained v6 pin family and compare the complete parser record",
        "recompute every complete required and foreign record, every summary, every additive full record, the matrix hash, and dirty-path equality while keeping both exclusions ineligible",
        "validate the already-physical v5 five-assertion semantic transition only after the v11 current matrix",
        "run all predecessor adversarial cases as mandatory history before the v11 adversarial cases"
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "POST_COMMIT_V11_BLOCK_SHA256",
        "pinValueSource": "marker-inclusive, no-trailing-newline SHA-256 of this v11 report block",
        "pinCountDelta": 1,
        "captureMode": "normalized-self-pins/v6-pre-v11",
        "normalizedMode": "normalized-self-pins/v7",
        "normalizedPinFamilyName": "NORMALIZED_SELF_PIN_NAMES_V7",
        "retainedPinLiterals": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256",
            "POST_COMMIT_V9_BLOCK_SHA256",
            "POST_COMMIT_V10_BLOCK_SHA256"
        ],
        "normalizedPinFamilyOrder": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256",
            "POST_COMMIT_V9_BLOCK_SHA256",
            "POST_COMMIT_V10_BLOCK_SHA256",
            "POST_COMMIT_V11_BLOCK_SHA256"
        ],
        "closedTopLevelFieldOrder": [
            "contractVersion", "findingId", "successorRevision", "capturedAt", "requiredHead",
            "successorOf", "extendsContracts", "historicalValidation", "v9SelfIdentityDisposition",
            "identityContract", "inventoryProof", "currentMatrix", "inferenceContract",
            "parserOrder", "parserHandoff", "adversarialMutations", "captureStability",
            "planningRouting", "testOwnerHandoff"
        ],
        "closedCurrentMatrixFieldOrder": [
            "requiredRecords", "foreignRecords", "additiveForeignFullRecords",
            "excludedPaths", "excludedRecords", "ownershipTransfer", "semanticApproval",
            "semanticAcceptance", "completionClaim", "checkboxClaim", "scopeStatusClaim",
            "topLevelStatusClaim", "certificationClaim"
        ],
        "reconstructionMode": "strip the exact v11 pin, NORMALIZED_SELF_PIN_NAMES_V7 declaration, and closed v11 branch; then normalize exactly NORMALIZED_SELF_PIN_NAMES_V6",
        "currentMatrixSelector": "v11-only",
        "predecessorValidationMode": "v10-v9-and-all-predecessors-remain-mandatory-immutable-history",
        "testEditBoundary": "add exactly one v11 pin, one NORMALIZED_SELF_PIN_NAMES_V7 declaration, one closed FEATURE-004-COLLISION-POST-COMMIT-V11 parser/adversarial branch, and the minimum assignment that selects v11 as current; preserve every existing parser byte outside that additive boundary",
        "onlyAllowedEditedPath": "tests/feature-004-dirty-tree-collision.test.mjs",
        "v10BranchEditAllowed": false,
        "v9BranchEditAllowed": false,
        "predecessorEditAllowed": false,
        "productEditsAllowed": false,
        "planningEditsAllowed": false,
        "bug002ArtifactEditsAllowed": false,
        "foreignEditsAllowed": false,
        "reportEditAllowed": false
    },
    "adversarialMutations": [
        "wrong current HEAD before append, after append, or during v11 parser adoption",
        "missing, duplicate, malformed, reordered, non-64-hex, or changed v11 marker or pin",
        "changed v10 marker-inclusive bytes, hash, byte length, schema, field order, required HEAD, matrix hash, predecessor link, parser-self record, or exact historical 3-of-3 result",
        "v10 historical 3-of-3 result used to satisfy the v11 current live comparison",
        "v10 23-path inventory accepted as current after v11 exists",
        "v10 live HEAD or live matrix comparison executed as current when v11 exists",
        "changed v9 committed tuple, changed v9 observed tuple, either tuple substituted for the other, or the non-reproducible disposition reopened",
        "any predecessor skipped because v11 exists",
        "missing, extra, duplicate, or reordered porcelain, required, foreign, additive, classification-group, or excluded path",
        "wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash",
        "wrong BUG-002 planning-evidence, planning-contract, or test classification or owner attribution",
        "foundation replay-local protected content-record digest substituted for its complete normal full record",
        "ownership inferred from dirtiness, commit state, or history",
        "changed, missing, extra, reordered, matrix-included, or completion-inference-eligible exclusion",
        "wrong parser capture mode, retained pin family, v7 pin-family order, reconstruction order, closed schema, field order, or current-matrix selector",
        "semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference",
        "parser mutation outside the exact additive v11 pin, normalized-family, parser/adversarial branch, and current-selector boundary"
    ],
    "captureStability": {
        "preAppendMatrixSha256": "450f4110582ec2451438369ec8bb1e693815272dd93d6a975f5f1ea2a5ad5ba3",
        "postAppendMustMatch": true,
        "headMustRemainExact": true,
        "porcelainOrderMustRemainExact": true,
        "rollbackBoundary": "remove only an incomplete v11 report append and return blocked",
        "v10OrPredecessorRollbackAllowed": false,
        "foreignOrProductRollbackAllowed": false
    },
    "planningRouting": {
        "updatedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md"
        ],
        "otherPlanningArtifactUpdateMechanicallyRequired": false,
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V11-001",
        "nextRequiredOwner": "bubbles.test",
        "scopeStatusChanged": false,
        "checkboxChanged": false,
        "featureStatusChanged": false,
        "certificationChanged": false,
        "scopeTwoStarted": false
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V11-001",
        "requiredActions": [
            "Edit only tests/feature-004-dirty-tree-collision.test.mjs.",
            "Add exactly one POST_COMMIT_V11_BLOCK_SHA256 pin, one NORMALIZED_SELF_PIN_NAMES_V7 declaration, and one closed v11 parser/adversarial branch within the stated edit boundary.",
            "Validate v10, v9, and every predecessor as mandatory immutable history, including v10's exact historical 3-of-3 result and v9's exact committed and observed non-reproducible-self-identity tuples.",
            "Use v11 as the sole live-current matrix at exact HEAD 153a686c937017ae20a438f7a4a423cf76b019b3.",
            "Reconstruct the pre-v11 parser exactly, normalize the retained v6 pin family, and validate every complete record, summary, sequence, identity, inventory, ownership, exclusion, and matrix commitment.",
            "Implement every listed v11 adversarial mutation without deleting or weakening any predecessor case.",
            "Run node --test tests/feature-004-dirty-tree-collision.test.mjs and require 3 of 3 green.",
            "Then follow BUG-002's active sequence: rerun the repaired foundation and Gate 1 immediately if its contract requires those checks, and resume BUG-002 at Gate 2; do not re-edit the already-repaired foundation file.",
            "Return no product, report, planning, BUG-002 artifact, foreign, generated, checkbox, status, Scope 2, certification, Git-state, or unrelated-dirty-byte change."
        ],
        "historicalFoundationResult": {
            "result": "green",
            "testsPassed": 5,
            "testsFailed": 0,
            "source": "operator-grounded continuation fact",
            "currentFileSha256": "649e534dcd83669f36620f3384db7e1938adf2db63c231694bb6f0ecc2cfa591",
            "reEditRequired": false
        },
        "bug002ResumeGate": 2,
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-post-commit-v11:end -->

## Feature 004 Dirty Collision Post-Commit v12

### Summary

This plan-owned v12 successor addresses `F004-V12-PLAN-001` and `F004-COLLISION-HISTORICAL-CLEAN-RECORD-LIVE-BYTE-DRIFT`. Global `capturedHead` is provenance only and is never a live equality gate. Current validation is instead path-scoped: the complete dirty inventory and its required, foreign, and excluded partition are exact, while every clean parser authority is protected by an ordered closure carrying captured-head tree mode, type, blob, content SHA-256, byte length, and path last commit. The closure also protects the reconstructed pre-v12 parser source, the exact pre-v12 report prefix, and the current append-only tool-ledger stable-key and receipt selectors.

Historical clean records resolve only from `<predecessor.requiredHead>:<path>`. Historical dirty and untracked records retain their predecessor-captured or deterministic authority because a clean Git tree cannot reconstruct their bytes. Unrelated commits outside the complete protected closure are accepted only when every protected path and the exact dirty inventory remain unchanged. No command result is promoted to green test evidence by this planning append.

### Completion Statement

Planning appends exactly one closed v12 contract and routes the additive parser work to `bubbles.test`. Scope 1 remains In Progress. Scope 2 is unavailable. No checkbox, scope status, feature status, certification, test, product, foreign artifact, Git state, or predecessor byte is changed by this append.

<!-- feature004-dirty-collision-post-commit-v12:start -->
```json
{
    "contractVersion": "feature004-dirty-collision-post-commit/v12",
    "findingIds": [
        "F004-V12-PLAN-001",
        "F004-COLLISION-HISTORICAL-CLEAN-RECORD-LIVE-BYTE-DRIFT"
    ],
    "successorRevision": "v12",
    "capturedAt": "2026-08-05T00:11:24.049Z",
    "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8",
    "headPolicy": {
        "capturedHeadRole": "provenance-only",
        "liveHeadEqualityRequired": false,
        "unrelatedHeadMovementPolicy": "accepted-only-when-protected-closure-and-dirty-inventory-remain-exact",
        "protectedPathContentModeOrLastCommitDriftAllowed": false,
        "protectedTouchRevertAllowed": false
    },
    "successorOf": {
        "marker": "feature004-dirty-collision-post-commit-v11",
        "rawBlockSha256": "491a45cade63f7182f7f6381ed019906084efafc3a6ece1f4c077c27d5790c24",
        "markerInclusiveByteLength": 49810,
        "contractVersion": "feature004-dirty-collision-post-commit/v11",
        "requiredHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
        "relation": "additive-path-scoped-authority-closure-successor",
        "predecessorDisposition": "mandatory-immutable-history",
        "successorRequiredReasons": [
            "global-head-equality-confuses-provenance-with-live-authority",
            "historical-clean-record-validation-must-not-substitute-live-worktree-bytes",
            "current-dirty-inventory-expanded-after-v11"
        ]
    },
    "extendsContracts": [
        { "marker": "feature004-dirty-collision-post-commit-v11", "rawBlockSha256": "491a45cade63f7182f7f6381ed019906084efafc3a6ece1f4c077c27d5790c24" },
        { "marker": "feature004-dirty-collision-post-commit-v10", "rawBlockSha256": "109efb870bc5f352088bfaf4f8b3df1b54e9cea9ad36f97df7508feefe287497" },
        { "marker": "feature004-dirty-collision-post-commit-v9", "rawBlockSha256": "8101b4b8f0c0c6da62d9c391c0e65e696294a3e90fd6e04b261c4647b31c6356" },
        { "marker": "feature004-dirty-collision-foreign-set-v7", "rawBlockSha256": "aec36d5c5287c4b84a81f56eff2d1e8ab6131ac699f048590bb63377009d7239" },
        { "marker": "feature004-dirty-collision-foreign-roadmap-v6", "rawBlockSha256": "287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740" },
        { "marker": "feature004-dirty-collision-current-identity-v5", "rawBlockSha256": "511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6" },
        { "marker": "feature004-dirty-collision-current-identity-v4", "rawBlockSha256": "546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6" },
        { "marker": "feature004-scope1-durable-evidence-v1", "rawBlockSha256": "3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd" }
    ],
    "historicalValidation": {
        "allPredecessorMarkersHashesSchemasFieldOrderAndParentLinksRequired": true,
        "allPredecessorRequiredHeadValuesRemainImmutable": true,
        "predecessorRequiredHeadsAreHistoricalSelectorsOnly": true,
        "predecessorRequiredHeadsComparedToLiveHead": false,
        "historicalCleanRecordAdapter": {
            "source": "<predecessor.requiredHead>:<path>",
            "treeFields": ["mode", "type", "blobOid"],
            "contentFields": ["contentSha256", "byteLength", "lastCommit"],
            "liveWorktreeBytesAllowed": false,
            "liveIndexBytesAllowed": false,
            "revisionPathOrBlobSubstitutionAllowed": false
        },
        "historicalDirtyAndUntrackedAdapter": {
            "source": "predecessor-captured-or-deterministic-authority",
            "cleanGitTreeReconstructionAllowed": false,
            "priorCapturedIdentityWeakeningAllowed": false
        },
        "v10Discriminator": {
            "requiredHead": "153a686c937017ae20a438f7a4a423cf76b019b3",
            "path": "scripts/selftest.mjs",
            "treeRef": "153a686c937017ae20a438f7a4a423cf76b019b3:scripts/selftest.mjs",
            "treeMode": "100644",
            "treeType": "blob",
            "blobOid": "d6e1602527b5cf2c9cefcff362d4e93908ecc635",
            "expectedIdentitySha256": "874df4c56efa470155e06d55a9e937e7ce117abe9ab725304c94cf09a8a2a4a5",
            "liveByteSubstitutionAllowed": false
        },
        "v11RequiredHeadComparedToLiveHead": false,
        "v11LiveMatrixComparisonAllowed": false,
        "v10RequiredHeadComparedToLiveHead": false,
        "v10LiveMatrixComparisonAllowed": false,
        "v9RequiredHeadComparedToLiveHead": false,
        "v9CommittedAndObservedNonReproducibleTuplesRemainRequired": true,
        "historicalValidationSatisfiesV12CurrentValidation": false,
        "predecessorAssertionDeletionOrWeakeningAllowed": false,
        "disposition": "mandatory-immutable-history-through-v11-before-path-scoped-v12"
    },
    "identityContract": {
        "fullRecordOrderedFields": [
            "path", "pathKind", "classification", "ownerAttribution",
            "feature004OwnershipClaim", "transitionClass", "status", "staged",
            "unstaged", "headOid", "indexOid", "worktreeGitOid",
            "worktreeSha256", "byteLength", "additions", "deletions",
            "hunkCount", "hunkBodySha256", "lastCommit"
        ],
        "recordIdentitySha256Input": "JSON.stringify(complete-full-record-with-ordered-fields)",
        "recordCommitmentAlignment": "same-index-as-the-exact-path-array",
        "hunkSequenceSha256Input": "JSON.stringify(complete-ordered-hunkBodySha256-array)",
        "diffMode": "git diff --no-ext-diff --unified=0",
        "hunkHashInput": "ordered changed lines with plus or minus prefix joined by LF with no trailing LF",
        "inventoryMode": "git status --porcelain=v1 -z --untracked-files=all",
        "inventorySha256Input": "JSON.stringify(ordered-{status,path}-entries)",
        "inventorySha256": "8241bc6b27eac0d0a2543142b3d5bb6883f727cc1920fd3f899989a73fc9d723",
        "matrixSha256Input": "JSON.stringify({requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records",
        "matrixSha256": "3d680812db545c65f341ee3091a10c4211a5790fdc62ff9b34cbae5b7574ef62",
        "summariesOrPathListsAloneSatisfyMatrixValidation": false,
        "parserSelfCapture": {
            "captureMode": "normalized-self-pins/v7-pre-v12",
            "retainedPinNames": [
                "DURABLE_EVIDENCE_BLOCK_SHA256",
                "CURRENT_IDENTITY_V4_BLOCK_SHA256",
                "CURRENT_IDENTITY_V5_BLOCK_SHA256",
                "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
                "FOREIGN_SET_V7_BLOCK_SHA256",
                "POST_COMMIT_V9_BLOCK_SHA256",
                "POST_COMMIT_V10_BLOCK_SHA256",
                "POST_COMMIT_V11_BLOCK_SHA256"
            ],
            "rawWorktreeGitOid": "5822763c394ca131c099f40ee2dbb58059b2cf76",
            "rawContentSha256": "e654c0969bcc360d44f5be1ad54cd1e0d1b13cc27315588097b45f3a7bcc0a52",
            "rawByteLength": 396177,
            "normalizedWorktreeGitOid": "938c10ccf0459f446af6029754e1b20f7e01c4b5",
            "normalizedContentSha256": "c038ab212975c648f4426c0779cd0c73bab9818db04aab0deaf1f6a57f55a26e",
            "normalizedByteLength": 396177,
            "fullRecordIdentitySha256": "ae1c1f8bd53a055e1aee20f35e469abe2a424bfc2f13d87c8da0ab6da22c561c"
        }
    },
    "inventoryProof": {
        "porcelainPathCount": 67,
        "porcelainEntries": [
            { "status": " M", "path": ".vscode/mcp.json" },
            { "status": " M", "path": "rlbrief.js" },
            { "status": " M", "path": "rlexperience.js" },
            { "status": " M", "path": "rlfx.js" },
            { "status": " M", "path": "rljourney.js" },
            { "status": " M", "path": "scripts/validate-spec-test-paths.baseline" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/design.md" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/report.md" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/scenario-manifest.json" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/scopes.md" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/spec.md" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/state.json" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/test-plan.json" },
            { "status": " M", "path": "specs/004-fx-regime-relative-value-lab/uservalidation.md" },
            { "status": " M", "path": "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md" },
            { "status": " M", "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md" },
            { "status": " M", "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md" },
            { "status": " M", "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json" },
            { "status": " M", "path": "tests/company-fundamentals-lab.spec.mjs" },
            { "status": " M", "path": "tests/contextual-tooltip.spec.mjs" },
            { "status": " M", "path": "tests/feature-004-dirty-tree-collision.test.mjs" },
            { "status": " M", "path": "tests/journey.spec.mjs" },
            { "status": " M", "path": "tests/playwright-runtime.foundation.functional.mjs" },
            { "status": " M", "path": "tests/simple-production-bridge.integration.mjs" },
            { "status": " M", "path": "tests/simple-production-bridge.unit.mjs" },
            { "status": " M", "path": "tests/simple-production-wiring.spec.mjs" },
            { "status": " M", "path": "tests/tool-experience.spec.mjs" },
            { "status": "??", "path": ".specify/memory/bubbles.session.json.flock" },
            { "status": "??", "path": "fx-vehicle-universe.json" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/bug.md" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/design.md" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/report.md" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/scenario-manifest.json" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/scopes.md" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/spec.md" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/state.json" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/test-plan.json" },
            { "status": "??", "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/uservalidation.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/bug.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/design.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/report.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/scenario-manifest.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/scopes.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/spec.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/state.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/uservalidation.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/bug.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/design.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/report.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/scenario-manifest.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/scopes.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/spec.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/state.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/uservalidation.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/bug.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/design.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/report.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/scenario-manifest.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/scopes.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/spec.md" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/state.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/test-plan.json" },
            { "status": "??", "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/uservalidation.md" },
            { "status": "??", "path": "tests/feature-004-brief-eligibility.test.mjs" },
            { "status": "??", "path": "tests/feature-004-journey-evidence-refresh.test.mjs" },
            { "status": "??", "path": "tests/feature-004-tool-control-binding.test.mjs" },
            { "status": "??", "path": "tests/feature-004-vehicle-universe.test.mjs" }
        ],
        "inventorySha256": "8241bc6b27eac0d0a2543142b3d5bb6883f727cc1920fd3f899989a73fc9d723",
        "requiredPathCount": 19,
        "dirtyRequiredPathCount": 10,
        "cleanRequiredPathCount": 9,
        "foreignDirtyPathCount": 55,
        "excludedDirtyPathCount": 2,
        "matrixRecordCount": 74,
        "requiredTransitionCounts": {
            "clean-head-index-promotion": 9,
            "still-dirty-exact-identity": 5,
            "untracked-exact-identity": 5
        },
        "classificationBasis": "canonical artifact ownership plus explicit Feature 004, Feature 010, Feature 012, BUG-002, and workspace context; never dirtiness, commit authorship, or path history",
        "completionInferenceFromInventory": false,
        "ownershipInferredFromDirtiness": false,
        "ownershipInferredFromCommit": false,
        "ownershipInferredFromHistory": false
    },
    "currentMatrix": {
        "requiredRecordSharedContract": {
            "classification": "feature004-scope1-required",
            "ownerAttribution": "Feature 004 Scope 1",
            "feature004OwnershipClaim": true
        },
        "requiredRecordCommitments": [
            { "path": "rlfx.js", "identitySha256": "525b71ed4a6cbf80b14c362453c68dcd37ca8f4e4558bc0c2f49d861f75a0a9a" },
            { "path": "fx-regime-universe.json", "identitySha256": "0f7056581629f933c0e06102d730e6ecaefd8486608613926db91925057db6b2" },
            { "path": "fx-vehicle-universe.json", "identitySha256": "613366f26f229b3754d88df42c48f9410bc5dec4332ceb5a06785613a8ff3e6c" },
            { "path": "rldata.js", "identitySha256": "ec357b0ec768e5c9f2f8056dcf593cf0a56c860ac2a8a91c1067a19dbcfb46a3" },
            { "path": "rlexperience.js", "identitySha256": "10650a9cd625d39be5aadec3f37797c909a29d60191a421636c6d69224a9039f" },
            { "path": "rlviews.js", "identitySha256": "24d67af1d980635208ffe18e804756068ed56c75ba5543a9d42a66156fb35645" },
            { "path": "rlbrief.js", "identitySha256": "fe51c658b7772da65118be89e301d5fdb7779a7b19104c69b344d42c7104a1ac" },
            { "path": "rljourney.js", "identitySha256": "b0128c975f14c5472c517175a26824402c2dc340563b7bd0a69c80d5509be11a" },
            { "path": "scripts/fetch-bars.mjs", "identitySha256": "4a412242cc4bdca2ab65130695d721c13198875aff4133f237ad2df46c7952ac" },
            { "path": "scripts/selftest.mjs", "identitySha256": "b2e06d4ebab28db5f099695aa3fe01f6f5091d1899ee87fe5b039f1dcf5a5a38" },
            { "path": "tests/fx-regime-relative-value-lab.spec.mjs", "identitySha256": "c36b72bf1662f36e4dda767956ad655672365a667e585817c5bd7f1927d41302" },
            { "path": "tests/feature-004-dirty-tree-collision.test.mjs", "identitySha256": "ae1c1f8bd53a055e1aee20f35e469abe2a424bfc2f13d87c8da0ab6da22c561c" },
            { "path": "tests/feature-004-vehicle-universe.test.mjs", "identitySha256": "e57a8e13ec578d8cee974bda22d236244793a17e80527b0e8a7c8708108cefbd" },
            { "path": "tests/feature-004-tool-control-binding.test.mjs", "identitySha256": "66de3dfba52efc3690e14961f725b59cc3c98a6bde1b40ed49db2cfebe13b5cb" },
            { "path": "tests/feature-004-brief-eligibility.test.mjs", "identitySha256": "4a3c16a2bf2a7d51af863db88fa0eebb9452c0d02f032a26f585830e952fdd6e" },
            { "path": "tests/feature-004-journey-evidence-refresh.test.mjs", "identitySha256": "7962da9053ee525ad2d07eed36f428515c22af4a708f3c995a184a69ed1c80b9" },
            { "path": "tests/fixtures/fx-regime/commonjs-determinism-input.json", "identitySha256": "c707cb9b4a7f089d031a0fb7a61abdf9de508035e6d00711b05218f0e2059420" },
            { "path": "tests/fixtures/fx-regime/foundation-cases.json", "identitySha256": "68694eac1df09cd7c0138a5396e4ba61d89a7f739947c715abece95d91e7355a" },
            { "path": "tests/fixtures/fx-regime/foundation-harness.html", "identitySha256": "da4d41ddf6ae195c344359ae3364b4d5ee38769e75ebe461f523909735250091" }
        ],
        "foreignRecordCommitments": [
            { "path": ".vscode/mcp.json", "classification": "foreign-workspace-config", "ownerAttribution": "workspace configuration owner", "identitySha256": "f090545003da6f9c8a76b561478ec588b30b1d4a6e8ebca7feaf3a4fc1f65355" },
            { "path": "scripts/validate-spec-test-paths.baseline", "classification": "foreign-project-validation-baseline", "ownerAttribution": "Research Lab validation owner", "identitySha256": "1037831909f3800e5e4ef382bcae3d1ef7f4d41996d5ad8f8b8ec9292c6a2167" },
            { "path": "specs/004-fx-regime-relative-value-lab/design.md", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.design", "identitySha256": "c36453d3df794801304a2d894c875a2c113b30f608420a9dbd9e8c65c01d33af" },
            { "path": "specs/004-fx-regime-relative-value-lab/scenario-manifest.json", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "identitySha256": "5ecec468cc9f3eabf401705d3895be12ec208e75532d67bbbe6713d21b7d5401" },
            { "path": "specs/004-fx-regime-relative-value-lab/scopes.md", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "identitySha256": "57bfea4e381582c847e3997566135fc409ead4bddf92a9eaf572f06226dd0637" },
            { "path": "specs/004-fx-regime-relative-value-lab/spec.md", "classification": "foreign-specialist-artifact", "ownerAttribution": "bubbles.analyst", "identitySha256": "1319136a4c702266af752729ef005822775fa3c1b34c390697e8e14bdf3ec460" },
            { "path": "specs/004-fx-regime-relative-value-lab/state.json", "classification": "foreign-planning-routing-artifact", "ownerAttribution": "bubbles.plan (execution routing only)", "identitySha256": "22a484cc71a499a13ac2be877694d74ca06f254a1873bfb9b51c8e9c79a8fbbe" },
            { "path": "specs/004-fx-regime-relative-value-lab/test-plan.json", "classification": "foreign-planning-artifact", "ownerAttribution": "bubbles.plan", "identitySha256": "ae394108ee9f80cca73346c196b10be4fd11604c00303781ab10dffe7360e77c" },
            { "path": "specs/004-fx-regime-relative-value-lab/uservalidation.md", "classification": "foreign-human-artifact", "ownerAttribution": "human owner", "identitySha256": "2e32600b550c5223a4efff04a7fb76c9039356d628f8d5194fe1dc57db1338a6" },
            { "path": "specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md", "classification": "foreign-feature-artifact", "ownerAttribution": "Feature 012 / bubbles.plan", "identitySha256": "813796929e23ba8bcd1a7562508b613195c9a82b3b4f686b3670aecabbf7c55f" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/report.md", "classification": "foreign-bug-planning-evidence", "ownerAttribution": "bubbles.plan/BUG-002", "identitySha256": "d12d8da5059ecac153bd44f7fa638247569ddeea84660a05800c8ac2a4d574ee" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md", "classification": "foreign-bug-planning-contract", "ownerAttribution": "bubbles.plan/BUG-002", "identitySha256": "bc3da688763fe7e85b83b26ed89f92173357b7f814454ad3acfbf686ad6d059b" },
            { "path": "specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json", "classification": "foreign-bug-planning-contract", "ownerAttribution": "bubbles.plan/BUG-002", "identitySha256": "a86ea2be3d6539e790831309bb420e1a3dca451ad0f5399b2c86ebe0c524c562" },
            { "path": "tests/company-fundamentals-lab.spec.mjs", "classification": "foreign-feature010-bug-test", "ownerAttribution": "Feature 010 BUG-001 / bubbles.test", "identitySha256": "104faf608b757ef3eecf24192f46e1af2d94f7be67e3ae89ca576ef003d4cb61" },
            { "path": "tests/contextual-tooltip.spec.mjs", "classification": "foreign-feature012-bug-test", "ownerAttribution": "Feature 012 BUG-006 / bubbles.test", "identitySha256": "d259ddf74c03431b3a22d0684c7b520cbd4d54345d60c9d0bd68bc8393c8933c" },
            { "path": "tests/journey.spec.mjs", "classification": "foreign-feature012-bug-test", "ownerAttribution": "Feature 012 BUG-005 / bubbles.test", "identitySha256": "49780f0489f738f95c90e6f57592b3067fb8f8dd4f9be01ea003729ee8125de3" },
            { "path": "tests/playwright-runtime.foundation.functional.mjs", "classification": "foreign-bug-test", "ownerAttribution": "bubbles.test/BUG-002", "identitySha256": "8ca6152e5a8512f28d73357b1a6da4ddd4b8f967508bb27f66db9ef49cbee712" },
            { "path": "tests/simple-production-bridge.integration.mjs", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "identitySha256": "0f0a293df781a720a343a223c91d09bb5fe93472dd723a61a0b725286f02c966" },
            { "path": "tests/simple-production-bridge.unit.mjs", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "identitySha256": "561b3b064b3d81537878a774762a95e2d4396144fcb25d8234a09c57b89c5a7e" },
            { "path": "tests/simple-production-wiring.spec.mjs", "classification": "foreign-feature-test", "ownerAttribution": "Feature 012 / bubbles.test", "identitySha256": "66ba71b0e069bd52e8368978320bbaf44ddb66e20d5e05e681c50279e5f69a9a" },
            { "path": "tests/tool-experience.spec.mjs", "classification": "foreign-feature012-bug-test", "ownerAttribution": "Feature 012 BUG-007 / bubbles.test", "identitySha256": "98be9f88bdc810448b327218dbbafa81d90459fe20a29cfcecad982fe69067d6" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/bug.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "dba81fab426581a1bc0dde3068c1cc15f2ccf254e00662d0174c9c8e4bc87615" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/design.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "97f288d2dd7c32e5cb193caffec0153ec62df1123af98536fdfa44078d536563" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/report.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "fb97dfcd45243f0f019357b9aca874a3e7e16e0a475cdee772a8c254f0c61fab" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/scenario-manifest.json", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "041f3f4f9695f80115c8fa034ab3706041a3e4ad5b0a31602cd74345ca2e8b77" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/scopes.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "a8a5b5162313f53b2782402d5c2356e153fc2f61459d55d4b6e5640144969917" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/spec.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "7c68c4fffc4cdec545c57a52e108a2d297845619aaebc96232c81c46ebd9d4b4" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/state.json", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "c0277111554b9e724ffc127ce83a9d15bc5338ff112a3a35d3fd8f161889b88e" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/test-plan.json", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "91b6c1ce1a04327a16a43de534c3bc5e8c1168841ff911dcb88e7f46c3d4f982" },
            { "path": "specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget/uservalidation.md", "classification": "foreign-feature010-bug-artifact", "ownerAttribution": "Feature 010 BUG-001 artifact owners", "identitySha256": "5911b69e531a8a3bfe176e5c044898af5effadd4e3666c018d4570fa48a4c981" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/bug.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "d7dfb17ad82d5218905b9f7eb3fe031745cdbf159a0b1b00db77596d59c92d4d" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/design.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "ce45e43dc9eccb4aa713471a6308924f18136e3a70e7d11d84a7e27f1a91ce20" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/report.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "d6d5948d2beacd04bab05e970cf2f1b290a949b95bf03aace2ed72871c07b38e" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/scenario-manifest.json", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "48884228677f02e2c65b9f10eb3b84a77dd0f2314cf59df63cf97739cdc888b3" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/scopes.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "c9d9c1b17fc2d48b8adf61acd24f9897603994769d3b60ffe84b9647f9b2e586" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/spec.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "461c97a06be74b781363f7b6098d8c7e08befd3c61dba35ff7fe4394716f44b3" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/state.json", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "98ebfaa8e58cbfc989d221f26e1b81a23eea8d271b3500c4e189e1bbe3c5e109" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/uservalidation.md", "classification": "foreign-feature012-bug005-artifact", "ownerAttribution": "Feature 012 BUG-005 artifact owners", "identitySha256": "bbecb1f77c067660409681f1c53ba2e105cac347eecbc1da122ddd56cee40358" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/bug.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "186e8da3e1ef7a7af26871651da397d385ce201f166e9f419c8daaad1004193f" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/design.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "9aedc8caaf2b55aee6ce54b4b2c73e2fd772ea21e881ea6da05795d19c5b5589" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/report.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "a12e1f4cb9a2e435519da2530c71033173a2006ca0ad907e24a5c9051a7a0751" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/scenario-manifest.json", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "91df03be3f0fd08581b02796b4075a85b2641715f886a420972da29f63d76818" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/scopes.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "b5ce330c990c3f04fc85bf27ce4370279c56844c62a79a5589ebf6edd045aa0c" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/spec.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "59bba317ecf57dc4e87a4922b52b1fcfec3148d42e79b6eacdb4a646f1d5d5b8" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/state.json", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "0aefc546bdfdde52bc418a404414353979e416bff21a591459c624bba7e8fd92" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/uservalidation.md", "classification": "foreign-feature012-bug006-artifact", "ownerAttribution": "Feature 012 BUG-006 artifact owners", "identitySha256": "fb833ed57ea090a0f9f06dfe039b7f3028c926e877cf3ddcfa02b9b7a79e652c" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/bug.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "ccfdf516a4b2482345dee77f1becad738ad2ae0ae8ec86bf093dc1fa70475175" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/design.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "ff8bf800d223c789736a697d20b1085897832828fe3ecab783e90727e365df3e" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/report.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "441576a3f3d573a598da6369452633b2b29b84ba5283fe9848fcad0d56d93094" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/scenario-manifest.json", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "5a7300521dd3b9fc974c1852d7e37c89b45b01e87c71e0af1d01848df2d15c64" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/scopes.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "829847f82c698354acf55280c19c7d7e258441210e79eba833c805e300f98360" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/spec.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "3b5d2d8f43a057e1f63ee317be381a9f28d307a0db4eb135fc07bc9447dc0a96" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/state.json", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "daf141e3daf410bc50ba71dccd6c3f8ead6a9aa778a398d984fb3de1831f1cd4" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/test-plan.json", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "aced74dee172898c5b17aa5acfafbee5b5451d70a9ab1d9b62ce57355b839756" },
            { "path": "specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/uservalidation.md", "classification": "foreign-feature012-bug007-artifact", "ownerAttribution": "Feature 012 BUG-007 artifact owners", "identitySha256": "39b3a920a0fb933a6dff5d0ef490c9099c1015331e42f10bee61188cb2f8f11d" }
        ],
        "excludedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md",
            ".specify/memory/bubbles.session.json.flock"
        ],
        "excludedRecords": [
            { "path": "specs/004-fx-regime-relative-value-lab/report.md", "status": " M", "classification": "planning-owned-report-prefix-exclusion", "ownerAttribution": "bubbles.plan", "matrixEligible": false, "completionInferenceEligible": false },
            { "path": ".specify/memory/bubbles.session.json.flock", "status": "??", "classification": "session-runtime-lock-exclusion", "ownerAttribution": "session runtime", "matrixEligible": false, "completionInferenceEligible": false }
        ],
        "matrixSha256": "3d680812db545c65f341ee3091a10c4211a5790fdc62ff9b34cbae5b7574ef62",
        "fullRecordsMustBeRecomputed": true,
        "ownershipTransfer": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completionClaim": false,
        "checkboxClaim": false,
        "scopeStatusClaim": false,
        "topLevelStatusClaim": false,
        "certificationClaim": false
    },
    "protectedAuthorityClosure": {
        "derivedDirectCleanAuthorityPaths": [
            "fx-regime-universe.json",
            "rldata.js",
            "rlviews.js",
            "scripts/fetch-bars.mjs",
            "scripts/selftest.mjs",
            "tests/fx-regime-relative-value-lab.spec.mjs",
            "tests/fixtures/fx-regime/commonjs-determinism-input.json",
            "tests/fixtures/fx-regime/foundation-cases.json",
            "tests/fixtures/fx-regime/foundation-harness.html",
            "specs/006-trend-dynamics-cycle-lab/report.md",
            "specs/006-trend-dynamics-cycle-lab/state.json",
            "specs/010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md",
            "specs/010-company-fundamentals-and-brief-lab/state.json"
        ],
        "orderedEntries": [
            { "kind": "clean-git-tree", "path": "fx-regime-universe.json", "authorityRole": "Feature 004 required clean universe input", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "75ab66d267a4df54b05d00f4d59ca88452eec6fd", "contentSha256": "8abeecdf6ea23e5e15e8080ecbd9ecbe4b507959b7637ec79c4a7933061fc927", "byteLength": 36879, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
            { "kind": "clean-git-tree", "path": "rldata.js", "authorityRole": "Feature 004 required clean shared data input", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "3afe3b673746e7be23790b4846a004f4a7f3c5ef", "contentSha256": "fc65480db17ad92600e46832ea86548378acc334e1b3454f5bac133966088772", "byteLength": 55536, "lastCommit": "76168e86e2030634d9fa740026c2f1e9733de53c" },
            { "kind": "clean-git-tree", "path": "rlviews.js", "authorityRole": "Feature 004 required clean view contract", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "dca0b579390907f8f1b59ee88a5082c5f311b5a4", "contentSha256": "4aba205dd62ce44af83df0aec29438382fa40dc980220a929a0c87e0b6dd706f", "byteLength": 15463, "lastCommit": "5d30675c3743b78e879ab4b1f26625bc014f0163" },
            { "kind": "clean-git-tree", "path": "scripts/fetch-bars.mjs", "authorityRole": "Feature 004 required clean fetch authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "6384588c656492cc7dcdd9370b0d80ccc7d08ac3", "contentSha256": "d92c94bc4ec0a42c11251b140c9a2fda87dba1e2a11334f0999503fee662c1b1", "byteLength": 20566, "lastCommit": "a8a99824b5e4e0017021a7ca9a3c946ea94e85cd" },
            { "kind": "clean-git-tree", "path": "scripts/selftest.mjs", "authorityRole": "Feature 004 required clean selftest and Feature 006/010 marker authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "5d316bc9850820f6995b81f8f64d7ba80e4b0bc2", "contentSha256": "49054b052e0849044e227e34704f996e6e78e9accf04d17c7ac1cdc995737d53", "byteLength": 570458, "lastCommit": "331138187bf298e204acf39ee3fe1fd615ebebc6" },
            { "kind": "clean-git-tree", "path": "tests/fx-regime-relative-value-lab.spec.mjs", "authorityRole": "Feature 004 required clean live scenario authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "a0a3ad4d8651523a46062e87ead88e8f28cf17cc", "contentSha256": "05253d1da36f1c82b4ca4a92bf9074a954eb5b73432256488607d2729adba306", "byteLength": 17790, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
            { "kind": "clean-git-tree", "path": "tests/fixtures/fx-regime/commonjs-determinism-input.json", "authorityRole": "Feature 004 required clean CommonJS fixture", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "76ccad1bf3e9b765c41bd4018fe44e02509ec14b", "contentSha256": "ee8f285acd1b5486b23368f9bea8f09c4841bee165466dac17d983ea0f11ed70", "byteLength": 389, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
            { "kind": "clean-git-tree", "path": "tests/fixtures/fx-regime/foundation-cases.json", "authorityRole": "Feature 004 required clean foundation fixture", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "51d0c4d4b7cc71aef0e8da90f67e42ab83f45c29", "contentSha256": "97fb1b6764315844d01e92501dee0b0e85b297b55e448977a6c30723b956dad4", "byteLength": 10126, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
            { "kind": "clean-git-tree", "path": "tests/fixtures/fx-regime/foundation-harness.html", "authorityRole": "Feature 004 required clean foundation harness", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "1cd59adf65d855843e9c81c754d3a5e1a7752328", "contentSha256": "968401c534357e001f1bf23315844684fcf983e08ae455a04e1ea9cc1e72d523", "byteLength": 309, "lastCommit": "db06c29650ba351770297acefa658f51cbc4ff00" },
            { "kind": "clean-git-tree", "path": "specs/006-trend-dynamics-cycle-lab/report.md", "authorityRole": "Feature 006 direct report-anchor authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "aaebd1ec49328a2e281b048801bb98d635591bec", "contentSha256": "bdf334d44aaa450bbd4bc22a8c017450947bfa67edf4389d142395fb719c866d", "byteLength": 88555, "lastCommit": "10da20995fd3bc3d3c65ce06c870592adbe8fd94" },
            { "kind": "clean-git-tree", "path": "specs/006-trend-dynamics-cycle-lab/state.json", "authorityRole": "Feature 006 direct execution-history authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "a66d6bb8a1e51c59abc0567c3586470fc2a85f6f", "contentSha256": "0273c6a414746c06cbf70fe263f8fca44124da4ffa1d48d5967ca65e1cd80a19", "byteLength": 26776, "lastCommit": "de0c03389a343e5154af40e2ef885b59f3f75111" },
            { "kind": "clean-git-tree", "path": "specs/010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md", "authorityRole": "Feature 010 direct report-anchor authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "ab5cc6444930283e99c51cc1adae1104ed0a0480", "contentSha256": "e7831fdf610b976b6856364880dd040e03551b44f4e1ac6787c8ec5b4bf89db4", "byteLength": 153687, "lastCommit": "d3d953a33ea9ea5beddea6a84c1539598fba6b3f" },
            { "kind": "clean-git-tree", "path": "specs/010-company-fundamentals-and-brief-lab/state.json", "authorityRole": "Feature 010 direct lifecycle-state authority", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "b9e5f88413b492cdac0962d11aecb3547baf4c01", "contentSha256": "bfda83f5488512fb1f025a177a2dbb32681869e22a0269938b8cc945ed2d82a6", "byteLength": 112575, "lastCommit": "e5f687cb0eed161bcd9189cf6a6ad3871138aa5e" },
            { "kind": "path-scoped-live-parser-source", "path": "tests/feature-004-dirty-tree-collision.test.mjs", "authorityRole": "current parser source reconstructed before the additive v12 branch", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5", "capturedHeadContentSha256": "83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d", "capturedHeadByteLength": 133796, "capturedHeadLastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5", "liveStatus": " M", "rawWorktreeGitOid": "5822763c394ca131c099f40ee2dbb58059b2cf76", "rawContentSha256": "e654c0969bcc360d44f5be1ad54cd1e0d1b13cc27315588097b45f3a7bcc0a52", "rawByteLength": 396177, "normalizedPinFamily": "normalized-self-pins/v7-pre-v12", "normalizedPinNames": ["DURABLE_EVIDENCE_BLOCK_SHA256", "CURRENT_IDENTITY_V4_BLOCK_SHA256", "CURRENT_IDENTITY_V5_BLOCK_SHA256", "FOREIGN_ROADMAP_V6_BLOCK_SHA256", "FOREIGN_SET_V7_BLOCK_SHA256", "POST_COMMIT_V9_BLOCK_SHA256", "POST_COMMIT_V10_BLOCK_SHA256", "POST_COMMIT_V11_BLOCK_SHA256"], "normalizedWorktreeGitOid": "938c10ccf0459f446af6029754e1b20f7e01c4b5", "normalizedContentSha256": "c038ab212975c648f4426c0779cd0c73bab9818db04aab0deaf1f6a57f55a26e", "normalizedByteLength": 396177, "pathLastCommit": "248543eae6a400f98f086c01ab9669558ec94fd5" },
            { "kind": "append-prefix", "path": "specs/004-fx-regime-relative-value-lab/report.md", "authorityRole": "exact immutable report prefix before the v12 append", "capturedHead": "2061f7db1c0c4c7bda4a70654f7fa1790c02b8a8", "treeMode": "100644", "treeType": "blob", "blobOid": "16202cd0fd8153eba1957459823aa4f94d0a04eb", "capturedHeadContentSha256": "e8767cefab5d17072c30e614f040fc63eed774110fac9bd2cb5cd0bb149c3b28", "capturedHeadByteLength": 259002, "capturedHeadLastCommit": "c7a3a50cde8cc2d653ab8de439bc7a8e2da29888", "prefixStartByte": 0, "prefixEndByteExclusive": 524389, "prefixContentSha256": "b5d25b5608da4e4d9cc64c4db6db805c5638471413b8644de1fbecebeff1835d", "prefixByteLength": 524389, "pathLastCommit": "c7a3a50cde8cc2d653ab8de439bc7a8e2da29888" },
            { "kind": "append-only-ledger-selector", "path": ".specify/runtime/tool-calls.jsonl", "authorityRole": "current semantic stable-key and receipt selection contract", "toolLogPath": ".specify/runtime/tool-calls.jsonl", "stableKeyFields": ["sessionId", "agent", "spec", "scope", "cmd", "exitCode", "stdoutHash", "tags"], "receiptFields": ["sessionId", "agent", "spec", "scope", "cmd", "exitCode", "stdoutHash", "tags", "rawOutputLines", "rawOutputSha256"], "stableKeyEncoding": "JSON.stringify(stableKeyFields.map(field => receipt[field]))", "scalarComparison": "strict-equality", "tagComparison": "JSON-stringified-exact-ordered-equality", "rowParsing": "nonempty-LF-or-CRLF-delimited-JSON-object-rows", "duplicatePolicy": "zero-duplicate-complete-stable-keys", "matchCardinality": "zero-or-all-declared-receipts", "partialSetPolicy": "fail-closed", "allMatchSource": "current-tool-log", "zeroOrAbsentMatchSource": "committed-marker-pinned-markdown", "selectedRowContradictionPolicy": "rawOutputLines-or-rawOutputSha256-presence-must-match-declaration", "appendOnlyGrowthAllowed": true, "ledgerContentPinned": false, "historicalAbsoluteLineAuthority": false, "receiptSelectors": [{"sessionId":"vscode-e24db39cf992f7ccd8ec75209602db59","agent":"bubbles.test","spec":"004-fx-regime-relative-value-lab","scope":"SCOPE-01","cmd":"node tests/provider-credentials.stress.mjs","exitCode":0,"stdoutHash":"da71c907a5d058ae5f0557c68d88c2667a8e06e6be96128009d29abb8d9a5a68","tags":["provider","stress","BASE-SEC-01","BASE-SEC-02","BASE-SEC-03"]},{"sessionId":"vscode-e24db39cf992f7ccd8ec75209602db59","agent":"bubbles.test","spec":"004-fx-regime-relative-value-lab","scope":"SCOPE-01","cmd":"node tests/provider-credentials.load.mjs","exitCode":0,"stdoutHash":"bdf2d697b46916bbe7e32b88887e3b6a37d36106e2e9281013fb68418511271a","tags":["provider","load","BASE-SEC-01","BASE-SEC-02","BASE-SEC-03"]}], "semanticSelectorSha256": "1ff127e5c3ed62153a94b06ffd78b071821ed6c21dcbc2bd344d3b3c148f7d7d" }
        ],
        "closureSha256Input": "JSON.stringify(orderedEntries)",
        "closureSha256": "e61f3c52ebfea482d272075a4de9754acab20170700d0e618bb5c1ff64ce61b4",
        "orderedEntryCount": 16,
        "additionalCleanDirectAuthorityOmitted": false,
        "omissionOrReorderAllowed": false,
        "cleanCurrentValidation": "compare each protected path at current HEAD by mode, type, blob, content SHA-256, byte length, and path lastCommit without comparing global HEAD",
        "parserCurrentValidation": "strip only the v12 pin, NORMALIZED_SELF_PIN_NAMES_V8 declaration, and closed v12 branch; then compare raw pre-v12 source and normalized-self-pins/v7 identity",
        "reportCurrentValidation": "hash bytes [0,520131) and require the exact prefix length and SHA-256",
        "selectorCurrentValidation": "require the exact stable-key order, receipt-field order, two receipt selectors, and semantic selector SHA-256"
    },
    "inferenceContract": {
        "capturedHeadImpliesLiveHeadEquality": false,
        "unrelatedHeadMovementImpliesDrift": false,
        "dirtyStateImpliesOwnership": false,
        "commitStateImpliesOwnership": false,
        "historyImpliesOwnership": false,
        "cleanClosureImpliesApproval": false,
        "historicalValidationUsesLiveBytes": false,
        "historicalValidationSatisfiesCurrentValidation": false,
        "excludedPathsEligibleForMatrixInference": false,
        "excludedPathsEligibleForCompletionInference": false,
        "semanticApproval": false,
        "semanticAcceptance": false,
        "completion": false,
        "checkbox": false,
        "scopeStatus": false,
        "topLevelStatus": false,
        "certification": false
    },
    "parserOrder": [
        "validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and immutable requiredHead value through v11",
        "validate historical clean records only through <predecessor.requiredHead>:<path> and retain predecessor-captured authority for historical dirty or untracked records",
        "require the exact v10 scripts/selftest.mjs discriminator at requiredHead 153a686c937017ae20a438f7a4a423cf76b019b3",
        "parse exactly one closed v12 block and treat capturedHead as provenance rather than a global live-equality gate",
        "validate the exact 67-entry dirty inventory and its 19-required, 55-foreign, and two-exclusion partition",
        "recompute all 74 complete full records and require every aligned record identity plus matrix SHA-256",
        "validate all 16 protected authority entries in order, including every derived direct clean input, reconstructed parser source, report prefix, and ledger selector",
        "validate current v12 authority independently after historical validation; historical success cannot satisfy current validation",
        "run all predecessor and v12 adversarial branches before returning any test result"
    ],
    "parserHandoff": {
        "owner": "bubbles.test",
        "path": "tests/feature-004-dirty-tree-collision.test.mjs",
        "newPinLiteral": "POST_COMMIT_V12_BLOCK_SHA256",
        "pinValueSource": "marker-inclusive, no-trailing-newline SHA-256 of this v12 report block",
        "pinCountDelta": 1,
        "captureMode": "normalized-self-pins/v7-pre-v12",
        "normalizedMode": "normalized-self-pins/v8",
        "normalizedPinFamilyName": "NORMALIZED_SELF_PIN_NAMES_V8",
        "normalizedPinFamilyOrder": [
            "DURABLE_EVIDENCE_BLOCK_SHA256",
            "CURRENT_IDENTITY_V4_BLOCK_SHA256",
            "CURRENT_IDENTITY_V5_BLOCK_SHA256",
            "FOREIGN_ROADMAP_V6_BLOCK_SHA256",
            "FOREIGN_SET_V7_BLOCK_SHA256",
            "POST_COMMIT_V9_BLOCK_SHA256",
            "POST_COMMIT_V10_BLOCK_SHA256",
            "POST_COMMIT_V11_BLOCK_SHA256",
            "POST_COMMIT_V12_BLOCK_SHA256"
        ],
        "newBranchMarker": "FEATURE-004-COLLISION-POST-COMMIT-V12",
        "currentSelector": "feature004-dirty-collision-post-commit-v12-only",
        "pathScopedLiveAuthorityValidatorRequired": true,
        "cleanHistoryGitTreeAdapterRequired": true,
        "appendOnlyLedgerCurrentSelectorRequired": true,
        "historicalValidationCannotSatisfyV12CurrentValidation": true,
        "existingV10V11AndPredecessorBytesEditable": false,
        "testEditBoundary": "add exactly one v12 pin, one NORMALIZED_SELF_PIN_NAMES_V8 declaration, one closed v12 parser/adversarial branch, the path-scoped live authority validator, the clean-history Git-tree adapter, and the current selector",
        "onlyAllowedEditedPath": "tests/feature-004-dirty-tree-collision.test.mjs",
        "reportEditAllowed": false,
        "planningArtifactEditAllowed": false,
        "productEditAllowed": false,
        "foreignEditAllowed": false,
        "gitOperationAllowed": false
    },
    "adversarialMutations": [
        "protected authority closure omission",
        "protected authority closure reorder",
        "protected clean path committed content, mode, type, blob, byte-length, or lastCommit drift",
        "protected clean path touch-revert that restores bytes but changes path lastCommit",
        "live worktree or index byte substitution for a historical clean record",
        "wrong historical requiredHead revision, path, tree mode, type, blob, content hash, byte length, or lastCommit",
        "historical dirty or untracked record reconstructed from a clean Git tree",
        "current dirty path misclassified as clean closure authority",
        "stale, missing, extra, duplicate, or reordered dirty inventory entry",
        "missing, extra, duplicate, reordered, or changed required, foreign, or excluded record commitment",
        "ownership, owner-attribution, classification, exclusion-eligibility, or zero-inference drift",
        "changed v10 discriminator head, path, blob, or expected identity",
        "v11, v10, v9, or any predecessor byte, pin, field, requiredHead, historical tuple, or assertion weakened",
        "historical validation used to satisfy v12 current validation",
        "wrong report prefix length or hash, duplicate marker, malformed JSON, closed-schema drift, field reorder, or wrong marker-inclusive pin",
        "wrong matrix, inventory, closure, selector, record-identity, or parser-source hash",
        "edit outside tests/feature-004-dirty-tree-collision.test.mjs during the test handoff",
        "unrelated HEAD movement outside the complete protected closure rejected despite exact closure and dirty inventory"
    ],
    "captureStability": {
        "preAppendInventorySha256": "8241bc6b27eac0d0a2543142b3d5bb6883f727cc1920fd3f899989a73fc9d723",
        "preAppendMatrixSha256": "3d680812db545c65f341ee3091a10c4211a5790fdc62ff9b34cbae5b7574ef62",
        "preAppendClosureSha256": "e61f3c52ebfea482d272075a4de9754acab20170700d0e618bb5c1ff64ce61b4",
        "preAppendReportPrefixSha256": "b5d25b5608da4e4d9cc64c4db6db805c5638471413b8644de1fbecebeff1835d",
        "preAppendReportPrefixByteLength": 524389,
        "postAppendInventoryMatrixClosureAndPrefixMustMatch": true,
        "markerInclusiveBlockHashMustBeComputedAfterAppend": true,
        "markerUniquenessAndClosedJsonSchemaRequired": true,
        "globalHeadMustRemainExact": false,
        "unrelatedHeadMovementOutsideProtectedClosureAllowed": true,
        "protectedContentModeOrLastCommitDriftAllowed": false,
        "rollbackBoundary": "remove only an incomplete v12 report append and return blocked",
        "v11OrPredecessorRollbackAllowed": false,
        "foreignOrProductRollbackAllowed": false
    },
    "repositoryBinding": {
        "repositoryRoot": "/home/redacted/research-lab",
        "repositoryAlias": "research-lab",
        "repositoryResolution": {
            "sessionId": "vscode-e24db39cf992f7ccd8ec75209602db59",
            "decisionId": "rb:vscode-e24db39cf992f7ccd8ec75209602db59:46",
            "controlRevision": 46,
            "controlPathDigest": "sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa",
            "authority": "concrete-target",
            "transition": "confirmed",
            "scopeKind": "command",
            "scopeId": null,
            "targetKind": "absolute-target",
            "pathVisibility": "local",
            "actionable": true
        }
    },
    "planningRouting": {
        "updatedPaths": [
            "specs/004-fx-regime-relative-value-lab/report.md"
        ],
        "addressedFindingIds": [
            "F004-V12-PLAN-001",
            "F004-COLLISION-HISTORICAL-CLEAN-RECORD-LIVE-BYTE-DRIFT"
        ],
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V12-001",
        "nextRequiredOwner": "bubbles.test",
        "scopeStatusChanged": false,
        "checkboxChanged": false,
        "featureStatusChanged": false,
        "certificationChanged": false,
        "scopeOneStatus": "In Progress",
        "scopeTwoState": "unavailable"
    },
    "testOwnerHandoff": {
        "owner": "bubbles.test",
        "transitionRequestId": "TR-F004-SCOPE01-POST-COMMIT-V12-001",
        "onlyAllowedEditedPath": "tests/feature-004-dirty-tree-collision.test.mjs",
        "requiredActions": [
            "Add exactly one POST_COMMIT_V12_BLOCK_SHA256 pin after computing this marker-inclusive block hash.",
            "Add exactly one NORMALIZED_SELF_PIN_NAMES_V8 family in the declared order.",
            "Add one closed v12 parser and adversarial branch without changing any v10, v11, or predecessor byte.",
            "Implement the path-scoped live authority validator and accept unrelated HEAD movement only outside the complete protected closure.",
            "Implement the clean-history Git-tree adapter using <predecessor.requiredHead>:<path>; never use live bytes for historical clean records.",
            "Retain prior captured or deterministic authority for historical dirty and untracked records.",
            "Implement the current append-only ledger selector with the exact stable-key, receipt, cardinality, contradiction, and fallback semantics.",
            "Validate prefix, marker uniqueness, JSON/schema/order, marker-inclusive pin, inventory, all full-record identities, matrix hash, closure hash, and selector hash.",
            "Add adversarial cases for closure omission/reorder, protected commit, touch-revert, live-byte substitution, wrong historical revision/path/blob, dirty-as-clean, inventory drift, ownership/exclusion/inference drift, predecessor weakening, historical-current substitution, and out-of-bound edit.",
            "Do not claim a green test result from this planning append; historical validation cannot satisfy v12 current validation.",
            "Return no report, planning, product, foreign, generated, checkbox, status, Scope 2, certification, Git-state, or unrelated-dirty-byte change."
        ],
        "nextRequiredOwner": "bubbles.test"
    }
}
```
<!-- feature004-dirty-collision-post-commit-v12:end -->

<!-- feature004-dirty-collision-post-commit-v13:start -->
```json
{
"schemaVersion":"feature004-post-commit-v13-capture-envelope/v1",
"marker":"feature004-dirty-collision-post-commit-v13",
"encoding":"br-canonical-json-utf8-b64/v1",
"compressedPayloadSha256":[
"02d2d6a5eae5949d7300afdcae032eab",
"bc09b9d65c4d516cc8b725485cd8a502"
],
"compressedPayloadByteLength":35539,
"payloadSha256":[
"0011fda7d1625e94717ac18aff344340",
"afae44b1dfe4b818ddf83a5d87922287"
],
"payloadByteLength":263371,
"payloadBase64LineLength":56,
"payloadBase64":[
"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",
"WI8tlkLOBw=="
],
"markerInclusiveByteLength":51512,
"normalizedSelfSha256":[
"70a3d917e176e40502cd7f336786aba2",
"b619a68e3dc6385e9473ad733402024b"
]
}
```
<!-- feature004-dirty-collision-post-commit-v13:end -->

<!-- feature004-dirty-collision-scoped-evidence-v14:start -->
```json
{
"schemaVersion":"feature004-scoped-evidence-v14-capture-envelope/v1",
"marker":"feature004-dirty-collision-scoped-evidence-v14",
"encoding":"br-canonical-json-utf8-b64/v1",
"compressedPayloadSha256":[
"6355a120e5f62e015ab24f49fbc2fd2f",
"bddc8019cf8672c80c87c2eb5acbfb8d"
],
"compressedPayloadByteLength":9329,
"payloadSha256":[
"e93c065c2684d8e22906deb1524abf54",
"4d1f43e9df0f502637c20b72f38f3333"
],
"payloadByteLength":47821,
"payloadBase64LineLength":56,
"payloadBase64":[
"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",
"NuqcHAM="
],
"markerInclusiveByteLength":14082,
"normalizedSelfSha256":[
"58d581d874cea8764d30d7dbb9664bc8",
"6be383d138a43b9a95980d25d46dbcea"
]
}
```
<!-- feature004-dirty-collision-scoped-evidence-v14:end -->

<!-- feature004-dirty-collision-multi-item-evidence-v15:start -->
```json
{
"schemaVersion":"feature004-multi-item-evidence-v15-capture-envelope/v1",
"marker":"feature004-dirty-collision-multi-item-evidence-v15",
"encoding":"br-canonical-json-utf8-b64/v1",
"compressedPayloadSha256":[
"b56138a9343ead56661c2283fe81f2f5",
"8552066b2f5f3df1de39fc3c7c785b13"
],
"compressedPayloadByteLength":1485,
"payloadSha256":[
"037fdad1f9de914fe675b26ab5fcd8e2",
"5e0df3904fd7ab094ddce5e909121112"
],
"payloadByteLength":3913,
"payloadBase64LineLength":56,
"payloadBase64":[
"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",
"+P08z9/TqGPPLlm7UFwc"
],
"markerInclusiveByteLength":2888,
"normalizedSelfSha256":[
"d1f20f8893fcef93fc1c67b4128e6dc7",
"c3f2a23dd00eda7e89c3273d38d6b51a"
]
}
```
<!-- feature004-dirty-collision-multi-item-evidence-v15:end -->

