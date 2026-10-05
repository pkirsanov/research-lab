import test from 'node:test';
import assert from 'node:assert/strict';
import { findAlreadyTrueLevel as find } from '../scripts/omlx-level-sanity.mjs';

const instruments = { MSFT: { price: 512.8 }, SPY: { price: 763.99 } };

test('an invalidation equal to spot is refused', () => {
    const hit = find([{ headline: 'MSFT severe: monitor', invalidation: 'A daily close above 512.80.', escalationTrigger: 'A daily close below 485.01.' }], instruments);
    assert.deepEqual(hit, { ticker: 'MSFT', field: 'invalidation', level: 512.8, price: 512.8 });
});

test('distinct levels pass, and a different ticker price is not confused', () => {
    assert.equal(find([{ headline: 'MSFT: x', invalidation: 'A close below 485.01', escalationTrigger: 'A close above 530' }], instruments), null);
    assert.equal(find([{ headline: 'MSFT: x', invalidation: 'A close above 763.99' }], instruments), null);
});

test('unknown tickers and missing fields never throw', () => {
    assert.equal(find([{ headline: 'ZZZ: x', invalidation: 'close above 10' }, {}], instruments), null);
    assert.equal(find(undefined, instruments), null);
});
