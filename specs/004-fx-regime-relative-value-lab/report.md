# Report: 004 FX Regime And Relative-Value Lab

Related artifacts: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This file is the single-file execution-evidence destination for the four sequential scopes in [scopes.md](scopes.md). `bubbles.plan` authored the planning structure and scenario/test contracts; it did not implement or certify product behavior.

The design records a prior `node scripts/selftest.mjs` result of 345 passed and 0 failed. The planning run executed the command again on 2026-07-14 and observed 344 passed and 1 failed: the current shared Market Brief payload omits registered `bond-regime-lab`, a pre-existing finding already recorded by spec 003. These observations are context only and are not execution evidence for any Feature 004 DoD item. `BASE-SEC-01`, `BASE-SEC-02`, `BASE-SEC-03`, and `BASE-BRIEF-01` remain protected assertions with their existing owners.

## Summary

- Scope order: reusable RLFX/source-envelope foundation -> direct FX route with truthful public unavailable states -> Global Rotation exact-date reconciliation -> atomic registration and Market Brief publication closure.
- Scenario coverage: all 26 business scenarios map one-to-one to `SCN-004-001` through `SCN-004-026`.
- Test handoff: 64 exact Markdown Test Plan rows are mirrored in the active `test-plan.json` inventory; scope counts are 22, 12, 10, and 20, and each row has one row-linked DoD item whose existing checkbox state is preserved.
- Planning repair: `CMD-BROWSER-FUNCTIONAL` now uses the executable unanchored literal `--grep "Browser functional"` in active Markdown and machine-readable planning. Historical anchored executions below remain verbatim evidence of the former command defect.
- Runtime boundary: controlled same-origin production-module cases are functional tests. E2E uses the real production route and current source posture with no request interception or fixture replacement; unavailable official-dollar/carry/REER/positioning/event states are expected public-v1 behavior.
- Dirty-tree boundary: exact non-secret identities and hunk hashes below protect every already-dirty shared path. `market-brief.config.json` requires a fresh implementation-time checkpoint because reported concurrent mutation makes the planning-time clean observation non-authoritative.

## Completion Statement

Implementation is nonterminal. Scope 1 remains In Progress; Scopes 2-4 remain Not Started. Existing implementation/test evidence and checkbox states are preserved, Scope 1 is not marked Done, and certification remains unchanged.

## Decision Record

- `rlfx.js` is the mandatory `foundation:true` capability and precedes all browser/headless overlays.
- Four single-file scopes are sufficient: each owns one outcome and the DAG is strictly sequential. Registration is held until Scope 4 so registry, Brief coverage, notes, and Bond coverage close atomically.
- The FX page is a separate owner; Global Rotation consumes decomposition only and Market Brief consumes owner reads only.
- Cross-owner Agreement/Divergence belongs to `RLBRIEF`, not RLFX; it compares independent leader-currency strength with Global approximate local-relative return.
- Optional evidence unavailable under its source contract is complete runtime behavior and is rendered as an exact unavailable state.
- Project config has no `testImpact` or `traceContracts`, so no inferred G079/G080 workflow is added.

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
    Repo: /Users/pkirsanov/Projects/research-lab
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
    Repo: /Users/pkirsanov/Projects/research-lab
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
