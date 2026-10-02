import test from 'node:test';
import assert from 'node:assert/strict';
import { defuseMovingAverageAbbreviation as d } from '../scripts/moving-average-abbreviation.mjs';

test('moving-average idioms are no longer ticker-shaped', () => {
    assert.doesNotMatch(d('FBTC has a tangled MA stack'), /\bMA\b/);
    assert.doesNotMatch(d('price above the 50-day MA'), /\bMA\b/);
    assert.doesNotMatch(d('a clean MA cross and MA support'), /\bMA\b/);
});

test('bare MA stays ticker-shaped so a Mastercard claim is still scanned', () => {
    assert.match(d('MA rose 3% to 540'), /\bMA\b/);
    assert.match(d('We like MA here'), /\bMA\b/);
});
