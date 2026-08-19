#!/usr/bin/env node
/* Budget-coherence guard for Playwright wait declarations (BUG-009, INV-009-1..3).
 *
 * A wait declaration — `expect(...).toX(..., { timeout: N })`, `expect.poll(..., { timeout: N })`,
 * `page.waitFor*(..., { timeout: N })` — states how long the author is willing to wait. The
 * enclosing test budget states how long the runner will let the whole test run. When N exceeds
 * that budget the declaration is UNREACHABLE: the runner aborts first, and it does so with an
 * error naming a number the author never wrote. Playwright itself never warns; it honours the
 * smaller value silently. This guard makes the contradiction visible.
 *
 * Attribution is PER TEST, never per file. A file-scoped comparison (largest declaration versus
 * weakest test) red-lines correct code — it flags a 60 s wait that sits inside a test declaring
 * setTimeout(120_000) merely because a sibling test in the same file declares nothing. A guard
 * that red-lines correct code gets switched off, so per-test attribution is the whole design.
 *
 * A declaration written inside a module-level helper is attributed to the MINIMUM effective budget
 * across every test that reaches it, directly or transitively. A helper cannot inspect its caller,
 * so its declared wait is only as honourable as the weakest test that reaches it.
 *
 * A declaration whose value is a helper PARAMETER (`{ timeout }`, `{ timeout: budget }`) has no
 * single value — it is whatever each caller passes, defaulting to the parameter default. Those are
 * resolved per call path and reported against the path with the least slack. Without that, such a
 * site is UNRESOLVED, which is a budget the guard cannot police while appearing to police the file
 * it lives in — the same shape of blind spot this guard exists to close.
 *
 * There is no AST parser here on purpose: no parser exists in node_modules (acorn, espree, esprima
 * and meriyah are all absent) and this repository is deliberately build-free. The constructs that
 * must be recognised — `test(`, `test.setTimeout(`, `test.slow(`, `timeout:` — are a small and
 * syntactically simple set, and the scrub pass removes the realistic sources of confusion.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const CONFIG_REL = 'playwright.config.mjs';

/* Playwright's own per-test default, used ONLY when the config declares no timeout. It is not a
   preference: it is what the runner enforces, and `--list` reports timeout=30000 for both
   projects of this repository. Deriving the config value first (below) means that if someone
   later sets a config timeout, the guard tracks it instead of contradicting it. */
const PLAYWRIGHT_DEFAULT_TIMEOUT_MS = 30000;

/* `test.slow()` triples the current timeout. Three times the 30 s default is 90 s, which is why
   slow() cannot express a 120 s helper wait — the distinction that made one of the three known
   sites survive review. */
const SLOW_MULTIPLIER = 3;

const SKIP_DIRS = new Set(['node_modules', '.git', '_site', 'dist', 'build', 'coverage']);

/* ---------------------------------------------------------------- scrubbing */

/* Blank comments, string literals, template literals and regex literals, preserving both length
   and newlines so every offset and line number computed afterwards still refers to the real file.
   This is load-bearing rather than defensive: this repository comments heavily around its budgets,
   and simple-production-wiring.spec.mjs discusses a 600 s budget in prose directly above the code
   that declares one. Without the scrub, prose and fixture strings become declarations. */
export function scrubNonCode(source) {
  const out = source.split('');
  const n = source.length;

  const blank = (from, to) => {
    for (let k = Math.max(0, from); k < Math.min(to, n); k++) {
      if (out[k] !== '\n') out[k] = ' ';
    }
  };

  /* A `/` is a regex only where a value cannot already have ended. Anything else is division. */
  const REGEX_PRECEDERS = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>', 'return', 'typeof', 'case', 'in', 'of', 'do', 'else', 'yield', 'await', 'new', 'delete', 'void', 'instanceof']);

  let previousToken = '';
  let i = 0;

  const readTemplate = (start) => {
    let k = start + 1;
    while (k < n) {
      const ch = source[k];
      if (ch === '\\') { k += 2; continue; }
      if (ch === '`') return k + 1;
      if (ch === '$' && source[k + 1] === '{') {
        let depth = 1;
        k += 2;
        while (k < n && depth > 0) {
          const inner = source[k];
          if (inner === '\\') { k += 2; continue; }
          if (inner === '`') { k = readTemplate(k); continue; }
          if (inner === '{') depth++;
          else if (inner === '}') depth--;
          k++;
        }
        continue;
      }
      k++;
    }
    return n;
  };

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '/' && next === '/') {
      let k = i;
      while (k < n && source[k] !== '\n') k++;
      blank(i, k);
      i = k;
      previousToken = '';
      continue;
    }

    if (ch === '/' && next === '*') {
      let k = i + 2;
      while (k < n && !(source[k] === '*' && source[k + 1] === '/')) k++;
      k = Math.min(n, k + 2);
      blank(i, k);
      i = k;
      previousToken = '';
      continue;
    }

    if (ch === '"' || ch === "'") {
      let k = i + 1;
      while (k < n) {
        if (source[k] === '\\') { k += 2; continue; }
        if (source[k] === ch || source[k] === '\n') { k++; break; }
        k++;
      }
      blank(i, k);
      i = k;
      previousToken = 'x';
      continue;
    }

    if (ch === '`') {
      const end = readTemplate(i);
      blank(i, end);
      i = end;
      previousToken = 'x';
      continue;
    }

    if (ch === '/' && REGEX_PRECEDERS.has(previousToken)) {
      let k = i + 1;
      let inClass = false;
      let closed = -1;
      while (k < n && source[k] !== '\n') {
        if (source[k] === '\\') { k += 2; continue; }
        if (source[k] === '[') inClass = true;
        else if (source[k] === ']') inClass = false;
        else if (source[k] === '/' && !inClass) { closed = k; break; }
        k++;
      }
      /* An unterminated "regex" on one line was division after all. Refusing to blank bounds the
         damage of the heuristic to nothing. */
      if (closed >= 0) {
        while (closed + 1 < n && /[a-z]/.test(source[closed + 1])) closed++;
        blank(i, closed + 1);
        i = closed + 1;
        previousToken = 'x';
        continue;
      }
    }

    if (/\s/.test(ch)) { i++; continue; }

    if (/[A-Za-z_$]/.test(ch)) {
      let k = i;
      while (k < n && /[\w$]/.test(source[k])) k++;
      previousToken = source.slice(i, k);
      i = k;
      continue;
    }

    previousToken = ch;
    i++;
  }

  return out.join('');
}

/* ------------------------------------------------------- structural helpers */

function matchPair(text, openIndex, open, close) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function lineOf(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (lineStarts[mid] <= offset) low = mid; else high = mid - 1;
  }
  return low + 1;
}

function computeLineStarts(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1);
  return starts;
}

function parseNumber(raw) {
  return Number.parseInt(String(raw).replace(/_/g, ''), 10);
}

/* A declared budget is policeable only where it reduces to a number. An arithmetic expression, a
   call or a property read is left unresolved rather than guessed at, because a guess in this
   direction invents permission the author never wrote. */
function evaluateNumericExpression(text, constants) {
  if (text === null || text === undefined) return null;
  const trimmed = String(text).trim();
  if (/^[0-9][0-9_]*$/.test(trimmed)) return parseNumber(trimmed);
  if (/^[A-Za-z_$][\w$]*$/.test(trimmed) && constants.has(trimmed)) return constants.get(trimmed);
  return null;
}

/* A helper's parameters, POSITIONALLY. A destructured or rest parameter still occupies its slot;
   dropping it would misalign every later index and attribute a caller's argument to the wrong
   name. Such slots carry a null name, so an identifier can never match one by accident. */
function parseParameterList(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length) { parts.push(text.slice(start, i)); break; }
    const ch = text[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }

  const params = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    let inner = 0;
    let eq = -1;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '(' || ch === '[' || ch === '{') inner++;
      else if (ch === ')' || ch === ']' || ch === '}') inner--;
      else if (ch === '=' && inner === 0 && trimmed[i + 1] !== '=' && trimmed[i + 1] !== '>') { eq = i; break; }
    }
    const name = (eq >= 0 ? trimmed.slice(0, eq) : trimmed).trim();
    params.push({
      name: /^[A-Za-z_$][\w$]*$/.test(name) ? name : null,
      defaultText: eq >= 0 ? trimmed.slice(eq + 1).trim() : null
    });
  }
  return params;
}

/* Split a call's arguments at depth 1 so an options object can be told apart from the callback.
   `test('name', { timeout: N }, async () => {...})` declares a TEST budget, not a wait budget;
   without this split the guard would compare that number against itself. */
function splitTopLevelArgs(text, openParen, closeParen) {
  const args = [];
  let depth = 0;
  let start = openParen + 1;
  for (let i = openParen; i < closeParen; i++) {
    const ch = text[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 1) {
      args.push({ start, end: i });
      start = i + 1;
    }
  }
  args.push({ start, end: closeParen });
  return args;
}

function collectCallRegions(scrubbed, pattern, kind) {
  const regions = [];
  pattern.lastIndex = 0;
  let match;
  while ((match = pattern.exec(scrubbed)) !== null) {
    const openParen = scrubbed.indexOf('(', match.index);
    if (openParen < 0) continue;
    const closeParen = matchPair(scrubbed, openParen, '(', ')');
    if (closeParen < 0) continue;
    regions.push({ kind, start: match.index, openParen, end: closeParen, variant: match[1] || null });
  }
  return regions;
}

/* Module-level helpers. A definition nested inside a test, a hook or another helper is not a
   module-level helper: its declarations belong to whatever encloses it. */
function collectFunctionDefinitions(scrubbed) {
  const definitions = [];

  const declared = /(?:^|[\n;}])[ \t]*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let match;
  while ((match = declared.exec(scrubbed)) !== null) {
    const nameStart = match.index + match[0].indexOf('function');
    const openParen = scrubbed.indexOf('(', match.index + match[0].length - 1);
    const closeParen = matchPair(scrubbed, openParen, '(', ')');
    if (closeParen < 0) continue;
    const brace = scrubbed.indexOf('{', closeParen);
    if (brace < 0) continue;
    const end = matchPair(scrubbed, brace, '{', '}');
    if (end < 0) continue;
    definitions.push({
      kind: 'helper',
      name: match[1],
      start: nameStart,
      end,
      params: parseParameterList(scrubbed.slice(openParen + 1, closeParen))
    });
  }

  const assigned = /(?:^|[\n;}])[ \t]*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?(\([^()]*\)|[A-Za-z_$][\w$]*)\s*(=>|\{)/g;
  while ((match = assigned.exec(scrubbed)) !== null) {
    const bodyStart = match.index + match[0].length - match[match.length - 1].length;
    const brace = scrubbed.indexOf('{', bodyStart);
    const nameStart = match.index + match[0].indexOf(match[1]);
    const params = parseParameterList(match[2].startsWith('(') ? match[2].slice(1, -1) : match[2]);
    if (brace >= 0 && scrubbed.slice(bodyStart, brace).trim().replace('=>', '').trim() === '') {
      const end = matchPair(scrubbed, brace, '{', '}');
      if (end >= 0) {
        definitions.push({ kind: 'helper', name: match[1], start: nameStart, end, params });
        continue;
      }
    }
    /* Expression-bodied arrow: the definition ends where its statement does. */
    let depth = 0;
    let i = bodyStart;
    for (; i < scrubbed.length; i++) {
      const ch = scrubbed[i];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) break; depth--; }
      else if (ch === ';' && depth === 0) break;
    }
    definitions.push({ kind: 'helper', name: match[1], start: nameStart, end: i, params });
  }

  return definitions;
}

function contains(region, offset) {
  return offset > region.start && offset < region.end;
}

/* `{ timeout: OWNER_HYDRATION_TIMEOUT_MS }` is a budget like any other; a guard that only reads
   digits would let the largest declaration in the corpus hide behind a name. This resolves
   module-level numeric constants; a budget carried in on a helper PARAMETER is resolved separately,
   per call path, against the argument each caller actually passes. */
function collectNumericConstants(scrubbed) {
  const constants = new Map();
  const pattern = /(?:^|[\n;}])[ \t]*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([0-9][0-9_]*)\s*[;\n]/g;
  let hit;
  while ((hit = pattern.exec(scrubbed)) !== null) constants.set(hit[1], parseNumber(hit[2]));
  return constants;
}

function innermost(regions, offset) {
  let best = null;
  for (const region of regions) {
    if (!contains(region, offset)) continue;
    if (!best || region.start > best.start) best = region;
  }
  return best;
}

/* ------------------------------------------------------------ config default */

export function resolveProjectDefault(root = ROOT) {
  const configFile = resolve(root, CONFIG_REL);
  if (!existsSync(configFile)) {
    return { value: PLAYWRIGHT_DEFAULT_TIMEOUT_MS, source: 'playwright-default (no config file)', configFile, declared: [] };
  }
  const raw = readFileSync(configFile, 'utf8');
  const scrubbed = scrubNonCode(raw);
  const lineStarts = computeLineStarts(raw);

  /* `expect: { timeout }` is the assertion default, a different quantity from the test budget. */
  const expectRanges = [];
  const expectKey = /\bexpect\s*:\s*\{/g;
  let hit;
  while ((hit = expectKey.exec(scrubbed)) !== null) {
    const brace = scrubbed.indexOf('{', hit.index);
    const end = matchPair(scrubbed, brace, '{', '}');
    if (end >= 0) expectRanges.push({ start: brace, end });
  }

  const declared = [];
  const timeoutKey = /\btimeout\s*:\s*([0-9][0-9_]*)/g;
  while ((hit = timeoutKey.exec(scrubbed)) !== null) {
    if (expectRanges.some((range) => hit.index > range.start && hit.index < range.end)) continue;
    declared.push({ value: parseNumber(hit[1]), line: lineOf(lineStarts, hit.index) });
  }

  if (declared.length === 0) {
    return { value: PLAYWRIGHT_DEFAULT_TIMEOUT_MS, source: 'playwright-default (config declares none)', configFile, declared };
  }
  /* Several projects may each declare one; a wait must be reachable under the weakest. */
  return {
    value: Math.min(...declared.map((entry) => entry.value)),
    source: CONFIG_REL + ' line(s) ' + declared.map((entry) => entry.line).join(','),
    configFile,
    declared
  };
}

/* ------------------------------------------------------------ file discovery */

/* `testMatch` decides what Playwright actually runs. Honouring it is not pedantry: tests/ also
   holds *.functional.mjs and *.test.mjs node-test files whose `timeout:` keys are execSync and
   node:test options with no Playwright test budget above them at all. Scanning those would
   manufacture violations out of correct code. */
export function resolveTestMatch(root = ROOT) {
  const configFile = resolve(root, CONFIG_REL);
  if (!existsSync(configFile)) return { patterns: ['**/*.spec.mjs'], source: 'fallback (no config file)' };
  const scrubbed = scrubNonCode(readFileSync(configFile, 'utf8'));
  const openParen = scrubbed.indexOf('testMatch');
  if (openParen < 0) return { patterns: ['**/*.spec.js', '**/*.spec.mjs', '**/*.spec.ts'], source: 'playwright-default testMatch' };
  const raw = readFileSync(configFile, 'utf8');
  const tail = raw.slice(openParen);
  const literals = tail.slice(0, tail.indexOf('\n') < 0 ? tail.length : tail.indexOf('\n') + 1);
  const found = [...literals.matchAll(/['"`]([^'"`]+)['"`]/g)].map((entry) => entry[1]);
  if (found.length === 0) return { patterns: ['**/*.spec.mjs'], source: 'fallback (unparsed testMatch)' };
  return { patterns: found, source: CONFIG_REL + ' testMatch' };
}

function globToRegExp(pattern) {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '*' && pattern[i + 1] === '*') {
      out += '.*';
      i++;
      if (pattern[i + 1] === '/') i++;
      continue;
    }
    if (ch === '*') { out += '[^/]*'; continue; }
    if (ch === '?') { out += '[^/]'; continue; }
    out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + out + '$');
}

function listFilesRecursive(absDir, root, collected) {
  let entries;
  try { entries = readdirSync(absDir); } catch { return collected; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const abs = join(absDir, entry);
    let info;
    try { info = statSync(abs); } catch { continue; }
    if (info.isDirectory()) listFilesRecursive(abs, root, collected);
    else if (info.isFile()) collected.push(abs);
  }
  return collected;
}

export function collectSpecFiles(root = ROOT) {
  const { patterns, source } = resolveTestMatch(root);
  const matchers = patterns.map(globToRegExp);
  const all = listFilesRecursive(root, root, []);
  const files = all
    .map((abs) => ({ abs, rel: relative(root, abs).split(sep).join('/') }))
    .filter((entry) => matchers.some((matcher) => matcher.test(entry.rel)))
    .sort((a, b) => a.rel.localeCompare(b.rel));
  return { files, patterns, source };
}

/* ----------------------------------------------------------- per-file model */

export function analyseSpecFile(relPath, source, projectDefault) {
  const scrubbed = scrubNonCode(source);
  const lineStarts = computeLineStarts(source);
  const at = (offset) => lineOf(lineStarts, offset);

  const tests = collectCallRegions(scrubbed, /\btest(?:\.(?:only|skip|fixme|fail))*\s*\(/g, 'test');
  const hooks = collectCallRegions(scrubbed, /\btest\.(beforeEach|afterEach|beforeAll|afterAll)\s*\(/g, 'hook');
  const describes = collectCallRegions(scrubbed, /\btest\.describe(?:\.(?:only|skip|fixme|serial|parallel))*\s*\(/g, 'describe');
  const configures = collectCallRegions(scrubbed, /\btest\.describe\.configure\s*\(/g, 'configure');

  const blockRegions = [...tests, ...hooks, ...describes];
  const helpers = collectFunctionDefinitions(scrubbed).filter((candidate) => {
    if (blockRegions.some((region) => contains(region, candidate.start))) return false;
    return !collectFunctionDefinitions(scrubbed).some((other) =>
      other !== candidate && other.start < candidate.start && other.end > candidate.end);
  });

  const setTimeouts = [];
  const setTimeoutRe = /\btest\.setTimeout\s*\(\s*([0-9][0-9_]*)\s*\)/g;
  let hit;
  while ((hit = setTimeoutRe.exec(scrubbed)) !== null) {
    setTimeouts.push({ offset: hit.index, value: parseNumber(hit[1]), line: at(hit.index) });
  }

  const slows = [];
  const slowRe = /\btest\.slow\s*\(\s*\)/g;
  while ((hit = slowRe.exec(scrubbed)) !== null) slows.push({ offset: hit.index, line: at(hit.index) });

  /* Option-object budgets on the test call itself, e.g. test('name', { timeout: N }, fn). */
  const optionRanges = [];
  for (const test of tests) {
    const args = splitTopLevelArgs(scrubbed, test.openParen, test.end);
    if (args.length < 3) continue;
    const candidate = args[1];
    if (scrubbed.slice(candidate.start, candidate.end).trim().startsWith('{')) {
      optionRanges.push(candidate);
      const inline = /\btimeout\s*:\s*([0-9][0-9_]*)/g;
      inline.lastIndex = 0;
      const slice = scrubbed.slice(candidate.start, candidate.end);
      let optionHit;
      while ((optionHit = inline.exec(slice)) !== null) {
        test.optionTimeout = Math.max(test.optionTimeout || 0, parseNumber(optionHit[1]));
      }
    }
  }

  const ownSetTimeout = (region) => {
    const values = setTimeouts
      .filter((entry) => contains(region, entry.offset))
      .filter((entry) => innermost(blockRegions, entry.offset) === region)
      .map((entry) => entry.value);
    return values.length ? Math.max(...values) : null;
  };

  const scopeOf = (region) => innermost(describes, region.start);

  const beforeEachBudget = (region) => {
    const scope = scopeOf(region);
    const applicable = hooks
      .filter((hook) => hook.variant === 'beforeEach' || hook.variant === 'beforeAll')
      .filter((hook) => {
        const hookScope = scopeOf(hook);
        if (!scope) return !hookScope;
        return hookScope === scope || !hookScope;
      });
    const values = applicable.map((hook) => ownSetTimeout(hook)).filter((value) => value !== null);
    return values.length ? Math.max(...values) : null;
  };

  const configureBudget = (region) => {
    const scope = scopeOf(region);
    const values = [];
    for (const configure of configures) {
      const configureScope = innermost(describes, configure.start);
      if (scope && configureScope !== scope && configureScope !== null) continue;
      const slice = scrubbed.slice(configure.openParen, configure.end);
      const found = [...slice.matchAll(/\btimeout\s*:\s*([0-9][0-9_]*)/g)].map((entry) => parseNumber(entry[1]));
      values.push(...found);
    }
    return values.length ? Math.max(...values) : null;
  };

  /* INV-009-1 precedence, applied in order and stopping at the first declaration that exists. */
  const budgetOf = (region) => {
    const own = ownSetTimeout(region);
    if (own !== null) return { value: own, source: 'test.setTimeout' };
    if (region.optionTimeout) return { value: region.optionTimeout, source: 'test option { timeout }' };
    if (slows.some((entry) => contains(region, entry.offset) && innermost(blockRegions, entry.offset) === region)) {
      return { value: SLOW_MULTIPLIER * projectDefault.value, source: 'test.slow() = ' + SLOW_MULTIPLIER + ' x default' };
    }
    const inherited = beforeEachBudget(region);
    if (inherited !== null) return { value: inherited, source: 'beforeEach test.setTimeout' };
    const configured = configureBudget(region);
    if (configured !== null) return { value: configured, source: 'describe.configure' };
    return { value: projectDefault.value, source: 'project default' };
  };

  for (const region of [...tests, ...hooks]) {
    region.budget = budgetOf(region);
    region.line = at(region.start);
    region.label = describeLabel(source, region);
  }

  /* Helper → the weakest test that can reach it. Transitive, with a visited set for recursion. */
  const helperByName = new Map(helpers.map((helper) => [helper.name, helper]));
  const containerOf = (offset) => innermost([...tests, ...hooks, ...helpers], offset);

  const callSitesOf = (helper) => {
    const sites = [];
    const callRe = new RegExp('\\b' + helper.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\(', 'g');
    let call;
    while ((call = callRe.exec(scrubbed)) !== null) {
      if (call.index >= helper.start && call.index <= helper.end) continue;
      sites.push(call.index);
    }
    return sites;
  };

  const resolveHelper = (helper, visited) => {
    if (visited.has(helper.name)) return [];
    visited.add(helper.name);
    const reached = [];
    for (const site of callSitesOf(helper)) {
      const owner = containerOf(site);
      if (!owner) continue;
      if (owner.kind === 'helper') {
        for (const inherited of resolveHelper(owner, visited)) {
          reached.push({ ...inherited, callSite: site, path: [helper.name + '()', ...inherited.path] });
        }
        continue;
      }
      reached.push({
        budget: owner.budget,
        line: owner.line,
        label: owner.label,
        callSite: site,
        path: [helper.name + '()']
      });
    }
    visited.delete(helper.name);
    return reached;
  };

  const constants = collectNumericConstants(scrubbed);

  /* A budget carried in on a helper PARAMETER has no single value: it is whatever each caller
     passes, falling back to the parameter default. Resolving it per call path is what closes the
     blind spot — an unresolved declaration is a budget the guard cannot police at all, and one
     that reads as policed because it sits in a file the guard reports on.

     The reported path is the one with the LEAST SLACK, since that is the caller that fails first.
     Every path must resolve: a single unreadable argument leaves the whole declaration unresolved
     rather than letting its readable siblings vouch for it. */
  const resolveParameterDeclaration = (helper, symbol, relPath, line) => {
    const index = (helper.params || []).findIndex((param) => param.name === symbol);
    if (index < 0) return null;

    const reached = resolveHelper(helper, new Set());
    if (reached.length === 0) {
      return {
        file: relPath,
        line,
        declared: evaluateNumericExpression(helper.params[index].defaultText, constants),
        attribution: helper.name + '() has no reaching test',
        budget: null,
        budgetSource: null,
        skipped: true
      };
    }

    let worst = null;
    for (const entry of reached) {
      const openParen = scrubbed.indexOf('(', entry.callSite);
      if (openParen < 0) return null;
      const closeParen = matchPair(scrubbed, openParen, '(', ')');
      if (closeParen < 0) return null;
      const slot = splitTopLevelArgs(scrubbed, openParen, closeParen)[index];
      const argText = slot ? scrubbed.slice(slot.start, slot.end).trim() : '';
      const declared = argText === ''
        ? evaluateNumericExpression(helper.params[index].defaultText, constants)
        : evaluateNumericExpression(argText, constants);
      if (declared === null) return null;
      const candidate = {
        declared,
        budget: entry.budget.value,
        budgetSource: entry.budget.source,
        origin: argText === '' ? 'parameter default' : 'caller argument',
        entry
      };
      if (!worst || candidate.declared - candidate.budget > worst.declared - worst.budget) worst = candidate;
    }

    return {
      file: relPath,
      line,
      declared: worst.declared,
      budget: worst.budget,
      budgetSource: worst.budgetSource,
      attribution: symbol + '=' + worst.declared + ' (' + worst.origin + ') ' +
        worst.entry.path.join(' -> ') + ' <- test at line ' + worst.entry.line + ' ' + worst.entry.label,
      reachingTests: reached.length,
      skipped: false
    };
  };

  const declarations = [];
  const unresolved = [];
  const declarationRe = /\btimeout\s*(?::\s*([0-9][0-9_]*)|:\s*([A-Za-z_$][\w$]*)|(?=\s*[,}]))/g;
  while ((hit = declarationRe.exec(scrubbed)) !== null) {
    const offset = hit.index;
    if (optionRanges.some((range) => offset >= range.start && offset < range.end)) continue;
    if (configures.some((configure) => offset > configure.start && offset < configure.end)) continue;

    const line = at(offset);
    const owner = containerOf(offset);
    /* `{ timeout }` shorthand names the symbol `timeout`; `timeout: name` names `name`. */
    const symbol = hit[2] !== undefined ? hit[2] : (hit[1] === undefined ? 'timeout' : null);

    let value = null;
    if (hit[1] !== undefined) value = parseNumber(hit[1]);
    else if (symbol !== null && constants.has(symbol)) value = constants.get(symbol);

    if (value === null && symbol !== null && owner && owner.kind === 'helper') {
      const resolved = resolveParameterDeclaration(owner, symbol, relPath, line);
      if (resolved) {
        declarations.push(resolved);
        continue;
      }
    }

    if (value === null) {
      unresolved.push({ file: relPath, line, expression: hit[2] ?? 'timeout (shorthand)' });
      continue;
    }

    if (!owner) {
      declarations.push({ file: relPath, line, declared: value, attribution: 'module scope (unreachable from any test)', budget: null, budgetSource: null, skipped: true });
      continue;
    }

    if (owner.kind === 'helper') {
      const reached = resolveHelper(owner, new Set());
      if (reached.length === 0) {
        declarations.push({ file: relPath, line, declared: value, attribution: owner.name + '() has no reaching test', budget: null, budgetSource: null, skipped: true });
        continue;
      }
      let weakest = reached[0];
      for (const entry of reached) if (entry.budget.value < weakest.budget.value) weakest = entry;
      declarations.push({
        file: relPath,
        line,
        declared: value,
        budget: weakest.budget.value,
        budgetSource: weakest.budget.source,
        attribution: weakest.path.join(' -> ') + ' <- test at line ' + weakest.line + ' ' + weakest.label,
        reachingTests: reached.length,
        skipped: false
      });
      continue;
    }

    declarations.push({
      file: relPath,
      line,
      declared: value,
      budget: owner.budget.value,
      budgetSource: owner.budget.source,
      attribution: (owner.kind === 'hook' ? 'hook ' : 'test at line ') + owner.line + ' ' + owner.label,
      reachingTests: 1,
      skipped: false
    });
  }

  return { file: relPath, tests, declarations, unresolved, testCount: tests.length };
}

function describeLabel(source, region) {
  const head = source.slice(region.openParen + 1, Math.min(source.length, region.openParen + 120));
  const quoted = head.match(/^\s*['"`]([^'"`]{0,70})/);
  return quoted ? "'" + quoted[1].trim() + "'" : '';
}

/* --------------------------------------------------------------- validation */

export function validatePlaywrightTimeoutBudgets(root = ROOT, options = {}) {
  const projectDefault = options.projectDefault
    ? { value: options.projectDefault, source: 'caller override' }
    : resolveProjectDefault(root);
  const { files, patterns, source: testMatchSource } = collectSpecFiles(root);

  const declarations = [];
  const unresolved = [];
  let testCount = 0;
  for (const entry of files) {
    const analysed = analyseSpecFile(entry.rel, readFileSync(entry.abs, 'utf8'), projectDefault);
    declarations.push(...analysed.declarations);
    unresolved.push(...analysed.unresolved);
    testCount += analysed.testCount;
  }

  const evaluated = declarations.filter((entry) => !entry.skipped);
  const violations = evaluated
    .filter((entry) => entry.declared > entry.budget)
    .sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));

  /* INV-009-3. A pattern that silently stops matching would reproduce exactly the blind spot this
     guard exists to close, and would do it while reporting success. */
  const vacuousReasons = [];
  if (files.length === 0) vacuousReasons.push('matched 0 spec file(s) for ' + patterns.join(', '));
  if (testCount === 0) vacuousReasons.push('found 0 test block(s)');
  if (declarations.length + unresolved.length === 0) vacuousReasons.push('found 0 timeout declaration(s)');

  return {
    root,
    projectDefault,
    testMatch: patterns,
    testMatchSource,
    scannedFiles: files.length,
    testCount,
    declarationCount: declarations.length,
    evaluatedCount: evaluated.length,
    skippedCount: declarations.length - evaluated.length,
    unresolved,
    declarations,
    violations,
    vacuous: vacuousReasons.length > 0,
    vacuousReasons,
    ok: vacuousReasons.length === 0 && violations.length === 0
  };
}

/* One line per finding, naming file, line, declared value, enclosing value and attribution, so a
   failure is directly actionable without opening the guard. */
export function formatTimeoutBudgetFindings(findings, indent = '') {
  const lines = [];
  if (findings.vacuous) {
    for (const reason of findings.vacuousReasons) {
      lines.push(indent + 'VACUOUS-SCAN: the guard ' + reason + ' — it cannot vouch for anything');
    }
    return lines;
  }
  for (const entry of findings.violations) {
    lines.push(indent + 'UNREACHABLE ' + entry.file + ':' + entry.line +
      ' declares ' + entry.declared + 'ms inside a ' + entry.budget + 'ms budget (' + entry.budgetSource + ')');
    lines.push(indent + '    attributed to ' + entry.attribution);
  }
  return lines;
}

/* --------------------------------------------------------------------- CLI */

const BYPASS_SHAPED = /^--(skip|force|ignore|bypass|no-verify|unsafe|allow)/i;

function printHelp() {
  console.log([
    'Usage: node scripts/validate-playwright-timeout-budgets.mjs [options]',
    '',
    '  --explain      list every declaration with its attributed budget, not just violations',
    '  --root <dir>   scan a different repo root (test seam)',
    '  -h, --help     this message',
    '',
    'Exit: 0 every declared wait is reachable; 1 an unreachable declaration or a vacuous scan;',
    '      2 unusable invocation.',
    '',
    'There is no --skip / --force / --ignore / --bypass flag. A wait that asks for more time than',
    'its test is given is fixed by raising the test budget, never by silencing the guard.'
  ].join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  let root = ROOT;
  let explain = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--explain') { explain = true; continue; }
    if (arg === '-h' || arg === '--help') { printHelp(); process.exit(0); }
    if (arg === '--root') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('[timeout-budgets] --root needs a path');
        process.exit(2);
      }
      root = resolve(value);
      i++;
      continue;
    }
    console.error("[timeout-budgets] unknown argument '" + arg + "'");
    if (BYPASS_SHAPED.test(arg)) {
      console.error('[timeout-budgets] there is no bypass flag and there never will be. Raise the ' +
        'enclosing test budget instead.');
    }
    process.exit(2);
  }

  const result = validatePlaywrightTimeoutBudgets(root);

  console.log('[timeout-budgets] scanned=' + result.scannedFiles +
    ' tests=' + result.testCount +
    ' declarations=' + result.declarationCount +
    ' evaluated=' + result.evaluatedCount +
    ' unattributed=' + result.skippedCount +
    ' unresolved=' + result.unresolved.length +
    ' violations=' + result.violations.length +
    ' default=' + result.projectDefault.value + 'ms (' + result.projectDefault.source + ')');

  if (explain) {
    for (const entry of result.declarations) {
      const verdict = entry.skipped ? 'SKIP' : (entry.declared > entry.budget ? 'FAIL' : 'ok  ');
      console.log('  ' + verdict + ' ' + entry.file + ':' + entry.line +
        ' declared=' + entry.declared +
        ' budget=' + (entry.budget === null ? '-' : entry.budget) +
        ' [' + entry.attribution + ']');
    }
    for (const entry of result.unresolved) {
      console.log('  ????  ' + entry.file + ':' + entry.line +
        ' declared=' + entry.expression + ' — not a literal and not a module constant, so unevaluated');
    }
  }

  for (const line of formatTimeoutBudgetFindings(result, '  ')) console.log(line);

  if (result.ok) {
    console.log('[timeout-budgets] OK — every declared wait fits the test budget that governs it');
    process.exit(0);
  }

  const reason = result.vacuous
    ? 'vacuous scan'
    : result.violations.length + ' declared wait(s) exceed the enclosing test budget';
  console.log('[timeout-budgets] FAIL — ' + reason);
  process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
