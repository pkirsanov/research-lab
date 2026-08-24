/*
 * tests/portfolio-doc-integration.functional.mjs — Feature 008 Scope 29, TP-29-01 and TP-29-05.
 *
 * SCN-008-055. Every other Feature 008 carrier proves the PRODUCT is correct. Nothing proved that
 * what the repository PUBLISHES about the product is still true. Those are different failures: a
 * tool can route correctly for a year while its note keeps sending readers to a hash that was
 * renamed in Scope 26, and no suite notices, because no suite reads the note.
 *
 * The specific defect this file exists to catch was live in the tree when it was written:
 * `notes/portfolio-survival-allocation-lab.md` documented the first tab as `#workspace`, a hash
 * `routeFromHash()` does not recognise and silently discards. A reader following the published
 * table landed on the Brief panel by FALLBACK, not by the route the note named. The note was wrong
 * and the product was right, so the correct repair is to the note.
 *
 * WHY THIS IS NOT A RECEIPT
 *
 * Every answer is derived from a real file at run time, and the same derivation is then challenged:
 *
 *   - The set of legal route hashes is parsed out of `ROUTE_TABS` in the shipped tool. It is not
 *     written here. If Scope 26 had renamed `brief` to something else, this file would demand the
 *     note say THAT, without being edited.
 *   - Registry, landing, navigation, README and notes-index membership are parsed from
 *     `tools.json`, `index.html`, `rlnav.js`, `README.md` and `notes/README.md`.
 *   - The test inventory the note publishes is checked against the test files that actually exist.
 *   - The scope count the note publishes is checked against the scope directories that exist.
 *
 * `auditPublicationTruth` is a pure function over a surface bundle. The first test feeds it the
 * REAL tree and requires zero findings. The adversarial test feeds it MUTATED bundles — a restored
 * `#workspace`, a tool dropped from the registry, dropped from navigation, stripped of its note,
 * and a note that claims a capability count the product does not have — and requires each one to be
 * REJECTED by name. A checker that cannot produce those findings fails there, so this file cannot
 * degrade into an assertion that passes whatever it is shown.
 *
 * THE WORKING TREE IS NEVER MUTATED. Mutations are string edits on in-memory copies. A sha256 over
 * every surface read from disk is taken before the first case and again after the last one.
 *
 * ONE VOCABULARY IS DECLARED, AND IT IS NOT THE ANSWER. `DELIVERED_CONTRACTS` maps a contract the
 * product may expose to the words a note may use to document it. WHICH contracts are required is
 * read off the product, not declared: a contract absent from the shipped page imposes no
 * documentation duty, and a contract present in it imposes one. The declaration is the dictionary,
 * never the verdict.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOOL_ID = "portfolio-survival-allocation-lab";
const TOOL_FILE = `${TOOL_ID}.html`;
const NOTE_PATH = `notes/${TOOL_ID}.md`;
const SPEC_DIR = "specs/008-portfolio-survival-and-brief-lab";

const read = (relative) => readFileSync(join(ROOT, relative), "utf8");

/* Number words the published prose may use for a count. A count is only ever COMPARED against a
   number derived from the tree; this list just lets the comparison read English. */
const NUMBER_WORDS = Object.freeze({
  four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, "twenty-five": 25,
  "twenty-six": 26, "twenty-seven": 27, "twenty-eight": 28, "twenty-nine": 29, thirty: 30
});

/* Contract → acceptable documentation vocabulary. Presence in the shipped page is what creates the
   obligation; this table only says what satisfying it may look like in prose. */
const DELIVERED_CONTRACTS = Object.freeze([
  {
    id: "immutable-workspace-compute",
    /* Scope 26 published the one-compute guarantee as readable state on `#workspaceCompute`. */
    productMarker: "data-compute-token",
    notePhrases: ["data-compute-token", "compute token", "one compute", "one-compute"]
  },
  {
    id: "return-context-navigation",
    /* Scope 26 also published cross-page return ownership, consumed by `rlnav.js`. */
    productMarker: "ReturnContext",
    notePhrases: ["ReturnContext", "return context", "return-context", "return strip"]
  },
  {
    id: "accessible-tablist",
    /* Scope 27 published manual-activation tab semantics. */
    productMarker: 'role="tablist"',
    notePhrases: ["tablist", "manual activation", "manual-activation", "roving"]
  },
  {
    id: "immutable-dossier-audit",
    /* Scope 25 published the append-oriented dossier with corrections rather than edits. */
    productMarker: "dossierCorrection",
    notePhrases: ["dossierCorrection", "correction", "append-oriented", "append-only"]
  }
]);

/* ---------------------------------------------------------------------------
   Derivation — every value below comes out of a real file
   --------------------------------------------------------------------------- */

/* The shipped route table. `ROUTE_TABS` is the single definition `routeFromHash` validates against,
   so parsing it yields exactly the hashes a reader can actually land on. */
function productRouteHashes(productSource) {
  const table = /var ROUTE_TABS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/.exec(productSource);
  if (!table) return [];
  return Array.from(table[1].matchAll(/hash:\s*"([^"]+)"/g)).map((match) => match[1]);
}

function landingToolIds(landingSource) {
  return Array.from(landingSource.matchAll(/\bid:\s*'([^']+)'/g))
    .map((match) => match[1])
    .filter((id) => id !== "next-tool");
}

function navToolFiles(navSource) {
  return Array.from(navSource.matchAll(/\bfile:\s*"([^"]+\.html)"/g))
    .map((match) => match[1])
    .filter((file) => file !== "index.html");
}

/* The hashes the NOTE publishes for the tool, read out of its tab table. */
function noteRouteHashes(note) {
  return Array.from(note.matchAll(/^\|[^|\n]*\|\s*`#([a-z0-9-]+)`\s*\|/gm)).map((match) => match[1]);
}

/* Any `<tool>.html#hash` deep link published anywhere. */
function deepLinkHashes(source) {
  const pattern = new RegExp(`${TOOL_ID}\\.html#([a-z0-9-]+)`, "g");
  return Array.from(source.matchAll(pattern)).map((match) => match[1]);
}

/* Scans EVERY "<count> <noun>" hit and returns the first that resolves to a number. Taking only the
   first syntactic hit would read "a scoped finding" as the scope count and report "no count stated"
   for a note that plainly states one. */
function spelledCount(source, nounPattern) {
  const pattern = new RegExp(`\\b([a-z-]+|\\d+)[\\s-]${nounPattern}\\b`, "gi");
  for (const match of source.matchAll(pattern)) {
    const token = match[1].toLowerCase();
    if (/^\d+$/.test(token)) return Number(token);
    if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, token)) return NUMBER_WORDS[token];
  }
  return null;
}

/* Feature 008 test carriers that actually exist, by the declared suffix families. */
function featureTestFiles(entries) {
  return entries
    .filter((name) => name.startsWith("portfolio-"))
    .filter((name) => /\.(unit|functional|integration|e2e|test|spec)\.mjs$/.test(name))
    .sort();
}

/* ---------------------------------------------------------------------------
   The checker
   --------------------------------------------------------------------------- */

function auditPublicationTruth(surfaces) {
  const findings = [];
  const add = (code, detail) => findings.push(`${code}: ${detail}`);

  const registryEntry = (surfaces.registry.tools || []).find((tool) => tool.id === TOOL_ID);
  if (!registryEntry) {
    add("registry-entry", `${TOOL_ID} is absent from tools.json`);
  } else {
    if (registryEntry.file !== TOOL_FILE) {
      add("registry-entry", `tools.json routes ${TOOL_ID} to ${registryEntry.file}`);
    }
    if (registryEntry.notes !== NOTE_PATH) {
      add("registry-entry", `tools.json declares notes ${String(registryEntry.notes)}`);
    }
  }

  if (!landingToolIds(surfaces.landingSource).includes(TOOL_ID)) {
    add("landing-parity", `${TOOL_ID} is absent from the index.html TOOLS array`);
  }
  if (!navToolFiles(surfaces.navSource).includes(TOOL_FILE)) {
    add("nav-parity", `${TOOL_FILE} is absent from the rlnav.js TOOLS array`);
  }
  if (!surfaces.noteExists) {
    add("notes-doc", `${NOTE_PATH} does not exist`);
  }
  if (!surfaces.notesIndex.includes(`${TOOL_ID}.md`)) {
    add("notes-index", `${TOOL_ID}.md is absent from the notes index`);
  }
  if (!surfaces.readme.includes(TOOL_FILE)) {
    add("readme-entry", `${TOOL_FILE} is absent from README.md`);
  }

  const productHashes = productRouteHashes(surfaces.productSource);
  if (productHashes.length === 0) {
    add("product-routes", "ROUTE_TABS could not be read from the shipped page");
  }
  const legal = new Set(productHashes);

  /* The note's published tab table must name the shipped routes — exactly, both directions. A hash
     the product dropped is a dead link; a hash the product added is an undocumented surface. */
  const published = noteRouteHashes(surfaces.note);
  for (const hash of published) {
    if (!legal.has(hash)) add("stale-hash", `the note publishes #${hash}, which is not a shipped route`);
  }
  for (const hash of productHashes) {
    if (!published.includes(hash)) add("undocumented-route", `the shipped route #${hash} is not published in the note`);
  }

  /* A deep link anywhere in an active surface must resolve to a shipped route. */
  for (const [name, source] of Object.entries(surfaces.deepLinkSurfaces)) {
    for (const hash of deepLinkHashes(source)) {
      if (!legal.has(hash)) add("stale-hash", `${name} deep-links #${hash}, which is not a shipped route`);
    }
  }

  /* "six-tab" is a claim about the product; the product is what settles it. */
  const claimedTabs = spelledCount(surfaces.note, "tab");
  if (claimedTabs === null) {
    add("tab-count", "the note states no tab count");
  } else if (claimedTabs !== productHashes.length) {
    add("tab-count", `the note claims ${claimedTabs} tabs; the page ships ${productHashes.length}`);
  }
  const registryTabs = registryEntry ? spelledCount(String(registryEntry.blurb || ""), "tab") : null;
  if (registryEntry && registryTabs !== null && registryTabs !== productHashes.length) {
    add("tab-count", `tools.json claims ${registryTabs} tabs; the page ships ${productHashes.length}`);
  }

  /* The published test inventory must name every carrier that exists, or it reads as complete
     while hiding the proofs added after it was last edited. */
  for (const file of surfaces.testFiles) {
    if (!surfaces.note.includes(file)) add("test-inventory", `the note omits tests/${file}`);
  }

  const claimedScopes = spelledCount(surfaces.note, "scopes?");
  if (claimedScopes === null) {
    add("scope-count", "the note states no scope count");
  } else if (claimedScopes !== surfaces.scopeCount) {
    add("scope-count", `the note claims ${claimedScopes} scopes; the feature has ${surfaces.scopeCount}`);
  }

  /* A contract the page ships must be documented. A contract it does not ship imposes no duty. */
  for (const contract of DELIVERED_CONTRACTS) {
    if (!surfaces.productSource.includes(contract.productMarker) && !surfaces.navSource.includes(contract.productMarker)) continue;
    const documented = contract.notePhrases.some((phrase) => surfaces.note.toLowerCase().includes(phrase.toLowerCase()));
    if (!documented) add("undocumented-contract", `${contract.id} ships but the note never describes it`);
  }

  return findings;
}

/* ---------------------------------------------------------------------------
   Surfaces
   --------------------------------------------------------------------------- */

const SURFACE_FILES = Object.freeze([
  "tools.json", "index.html", "rlnav.js", "README.md", "notes/README.md", NOTE_PATH, TOOL_FILE
]);

function readSurfaces() {
  const note = read(NOTE_PATH);
  const landingSource = read("index.html");
  const navSource = read("rlnav.js");
  const readme = read("README.md");
  const productSource = read(TOOL_FILE);
  return {
    note,
    noteExists: existsSync(join(ROOT, NOTE_PATH)),
    registry: JSON.parse(read("tools.json")),
    landingSource,
    navSource,
    readme,
    notesIndex: read("notes/README.md"),
    productSource,
    deepLinkSurfaces: { [NOTE_PATH]: note, "index.html": landingSource, "rlnav.js": navSource, "README.md": readme },
    testFiles: featureTestFiles(readdirSync(join(ROOT, "tests"))),
    scopeCount: readdirSync(join(ROOT, SPEC_DIR, "scopes"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).length
  };
}

const surfaceDigest = () => createHash("sha256")
  .update(SURFACE_FILES.map((file) => read(file)).join("\u0000")).digest("hex");

const DIGEST_BEFORE = surfaceDigest();

/* ---------------------------------------------------------------------------
   TP-29-01
   --------------------------------------------------------------------------- */

test("SCN-008-055 every published Feature 008 surface states the shipped route and shipped limits", () => {
  const surfaces = readSurfaces();

  /* Guard the derivation itself. A regex that silently stopped matching would empty every set and
     make the audit below vacuous, so each derived set is required to be non-empty first. */
  const productHashes = productRouteHashes(surfaces.productSource);
  assert.ok(productHashes.length >= 2, `ROUTE_TABS must parse to the shipped routes, got ${JSON.stringify(productHashes)}`);
  assert.ok(landingToolIds(surfaces.landingSource).length > 1, "the landing TOOLS array must parse");
  assert.ok(navToolFiles(surfaces.navSource).length > 1, "the navigation TOOLS array must parse");
  assert.ok(surfaces.testFiles.length > 1, "the Feature 008 test carriers must enumerate");
  assert.ok(surfaces.scopeCount > 1, "the Feature 008 scope directories must enumerate");
  assert.ok(noteRouteHashes(surfaces.note).length >= 2, "the note tab table must parse");

  assert.deepEqual(auditPublicationTruth(surfaces), [],
    "every published Feature 008 surface must route to a shipped hash and claim only shipped behavior");
});

test("SCN-008-055 the registry, navigation, landing page, README and note agree on one Feature 008 tool", () => {
  const surfaces = readSurfaces();
  const registryIds = surfaces.registry.tools.map((tool) => tool.id);

  /* Registry order is the contract the landing page and navigation both mirror; comparing the whole
     ordered list means a tool cannot be quietly reordered into a different group either. */
  assert.deepEqual(landingToolIds(surfaces.landingSource), registryIds,
    "the landing registry must mirror tools.json exactly");
  assert.deepEqual(navToolFiles(surfaces.navSource).map((file) => file.replace(/\.html$/, "")), registryIds,
    "the navigation registry must mirror tools.json exactly");

  const entry = surfaces.registry.tools.find((tool) => tool.id === TOOL_ID);
  assert.ok(entry, `${TOOL_ID} must be registered`);
  assert.equal(entry.file, TOOL_FILE);
  assert.equal(entry.notes, NOTE_PATH);
  assert.ok(existsSync(join(ROOT, entry.file)), "the registered page must exist");
  assert.ok(existsSync(join(ROOT, entry.notes)), "the registered note must exist");
  assert.ok(surfaces.notesIndex.includes(`${TOOL_ID}.md`), "the note must be listed in the notes index");
  assert.ok(surfaces.readme.includes(TOOL_FILE), "the README must link the tool route");
});

/* ---------------------------------------------------------------------------
   TP-29-05
   --------------------------------------------------------------------------- */

test("Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth", (t) => {
  const real = readSurfaces();
  assert.deepEqual(auditPublicationTruth(real), [], "the shipped tree must be clean before it is mutated");

  const productHashes = productRouteHashes(real.productSource);
  const firstHash = productHashes[0];

  const mutations = [
    {
      name: "the note restores the superseded #workspace hash",
      expect: "stale-hash",
      mutate: (s) => ({ ...s, note: s.note.replace(`\`#${firstHash}\``, "`#workspace`") })
    },
    {
      name: "a published deep link points at a hash the router discards",
      expect: "stale-hash",
      mutate: (s) => {
        const readme = `${s.readme}\n\nSee [the workspace](${TOOL_ID}.html#workspace).\n`;
        return { ...s, readme, deepLinkSurfaces: { ...s.deepLinkSurfaces, "README.md": readme } };
      }
    },
    {
      name: "the tool is dropped from the registry",
      expect: "registry-entry",
      mutate: (s) => ({ ...s, registry: { ...s.registry, tools: s.registry.tools.filter((tool) => tool.id !== TOOL_ID) } })
    },
    {
      name: "the tool is dropped from navigation",
      expect: "nav-parity",
      mutate: (s) => ({ ...s, navSource: s.navSource.split(`file: "${TOOL_FILE}"`).join('file: "removed-lab.html"') })
    },
    {
      name: "the tool is dropped from the landing registry",
      expect: "landing-parity",
      mutate: (s) => ({ ...s, landingSource: s.landingSource.split(`id: '${TOOL_ID}'`).join("id: 'removed-lab'") })
    },
    {
      name: "the note is deleted while the registry still declares it",
      expect: "notes-doc",
      mutate: (s) => ({ ...s, noteExists: false })
    },
    {
      name: "the note is dropped from the notes index",
      expect: "notes-index",
      mutate: (s) => ({ ...s, notesIndex: s.notesIndex.split(`${TOOL_ID}.md`).join("removed-lab.md") })
    },
    {
      name: "the note claims more tabs than the page ships",
      expect: "tab-count",
      mutate: (s) => ({ ...s, note: s.note.replace(/\bsix-tab\b/, "twelve-tab") })
    },
    {
      name: "a shipped route is left undocumented",
      expect: "undocumented-route",
      mutate: (s) => ({ ...s, note: s.note.replace(`\`#${productHashes[productHashes.length - 1]}\``, "`#brief`") })
    },
    {
      name: "the published test inventory omits a carrier that exists",
      expect: "test-inventory",
      mutate: (s) => ({ ...s, testFiles: s.testFiles.concat("portfolio-unlisted.functional.mjs") })
    },
    {
      name: "the note understates how many scopes the feature has",
      expect: "scope-count",
      mutate: (s) => ({ ...s, scopeCount: s.scopeCount + 7 })
    },
    {
      name: "a shipped contract is described nowhere in the note",
      expect: "undocumented-contract",
      mutate: (s) => {
        let note = s.note;
        for (const phrase of DELIVERED_CONTRACTS.find((c) => c.id === "accessible-tablist").notePhrases) {
          note = note.replace(new RegExp(phrase, "gi"), "REDACTED");
        }
        return { ...s, note };
      }
    }
  ];

  for (const mutation of mutations) {
    const findings = auditPublicationTruth(mutation.mutate(readSurfaces()));
    assert.ok(findings.some((finding) => finding.startsWith(`${mutation.expect}:`)),
      `${mutation.name} must be rejected as ${mutation.expect}; got ${JSON.stringify(findings)}`);
  }

  /* Every declared finding code must be reachable by at least one mutation, so a code cannot be
     added to the checker and then never exercised. */
  const exercised = new Set(mutations.map((mutation) => mutation.expect));
  for (const code of ["stale-hash", "registry-entry", "nav-parity", "landing-parity", "notes-doc",
    "notes-index", "tab-count", "undocumented-route", "test-inventory", "scope-count",
    "undocumented-contract"]) {
    assert.ok(exercised.has(code), `finding code ${code} has no mutation proving it can fire`);
  }

  t.diagnostic(`${mutations.length} disposable mutations rejected`);
  assert.equal(surfaceDigest(), DIGEST_BEFORE, "the working tree must be byte-identical after mutation");
});
