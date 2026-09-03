import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const START = '/* ---------- Feature 031 shock-transmission foundation (START) ---------- */';
const END = '/* ---------- Feature 031 shock-transmission foundation (END) ---------- */';
const BASELINE_SELFTEST_SHA256 = '98605f5e7eda14e09cebf62597953fcd21c5e7d710ea255e28c342ca1e806a0a';

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

test('Feature 031 foundation canary preserves the registered selftest inventory', () => {
  const source = readFileSync(new URL('../scripts/selftest.mjs', import.meta.url), 'utf8');
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  assert.ok(start >= 0, 'Feature 031 selftest sentinel start must exist');
  assert.ok(end > start, 'Feature 031 selftest sentinel end must follow start');
  assert.equal(source.indexOf(START, start + START.length), -1);
  assert.equal(source.indexOf(END, end + END.length), -1);
  const afterEnd = end + END.length;
  assert.equal(source[afterEnd], '\n');
  const withoutSentinel = source.slice(0, start) + source.slice(afterEnd + 1);
  assert.equal(sha256(withoutSentinel), BASELINE_SELFTEST_SHA256);
  assert.equal((source.match(/group\('Feature 031 shock-transmission foundation'\)/g) || []).length, 1);
  assert.ok(source.indexOf("group('Feature 031 shock-transmission foundation')") < source.indexOf('/* ---------- summary ---------- */'));

  const prior = globalThis.RLSHOCK;
  const sentinel = Object.freeze({ owner: 'scope-01-canary' });
  globalThis.RLSHOCK = sentinel;
  delete require.cache[require.resolve('../rlshock.js')];
  const commonJsApi = require('../rlshock.js');
  assert.equal(globalThis.RLSHOCK, sentinel);
  assert.equal(Object.isFrozen(commonJsApi), true);
  if (prior === undefined) delete globalThis.RLSHOCK;
  else globalThis.RLSHOCK = prior;

  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../rlshock.js', import.meta.url), 'utf8'), context, { filename: 'rlshock.js' });
  assert.equal(Object.isFrozen(context.RLSHOCK), true);
  assert.equal(vm.runInContext('RLSHOCK.digest({ b: 2, a: 1 })', context), commonJsApi.digest({ a: 1, b: 2 }));
  assert.equal(context.fetch, undefined);
  assert.equal(context.document, undefined);
});
