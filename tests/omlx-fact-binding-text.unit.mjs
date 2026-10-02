import test from 'node:test';
import assert from 'node:assert/strict';
import { stripNonPriceNumerals as s } from '../scripts/omlx-fact-binding-text.mjs';

const over100 = (t) => [...s(t).matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0])).filter((v) => v > 100);

test('look-backs, dates, percents and multiples are not price claims', () => {
    assert.deepEqual(over100('XLK 252-day momentum is -1% and 126 days of base'), []);
    assert.deepEqual(over100('XLK expiry 2026-10-02T21:00:00Z, by 2027, Oct 2, 2026'), []);
    assert.deepEqual(over100('XLK is 118.5% of its 200-day MA, 3.5x volume'), []);
});

test('a real price claim survives and is still checkable', () => {
    assert.deepEqual(over100('XLK 197.81 holds above 190.58'), [197.81, 190.58]);
    assert.deepEqual(over100('SPY close below 750 invalidates'), [750]);
});
