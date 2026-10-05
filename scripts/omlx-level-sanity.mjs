// An invalidation or escalation trigger is only actionable if it names a level the market has
// NOT yet reached. A level equal to the current price is already true the moment the card is
// published ("invalidated if a close above 512.80" when SPOT is 512.80), so it can never be
// falsified and tells the reader nothing. Return the first offending card, or null.
const TOLERANCE = 0.0005; // 0.05% of spot

function numbersIn(text) {
    return [...String(text ?? '').matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => Number(m[0].replace(/,/g, ''))).filter(Number.isFinite);
}

export function findAlreadyTrueLevel(items, instruments) {
    for (const item of Array.isArray(items) ? items : []) {
        const ticker = Object.keys(instruments || {}).find((t) => new RegExp(`\\b${t}\\b`).test(`${item?.headline ?? ''} ${item?.instrument ?? ''}`));
        const price = Number(instruments?.[ticker]?.price);
        if (!ticker || !Number.isFinite(price) || price <= 0) continue;
        for (const field of ['invalidation', 'escalationTrigger', 'trigger']) {
            const hit = numbersIn(item?.[field]).find((n) => Math.abs(n - price) / price <= TOLERANCE);
            if (hit !== undefined) return { ticker, field, level: hit, price };
        }
    }
    return null;
}

export function alreadyTrueLevelMessage(found) {
    return `OMLX fact binding refused ${found.ticker} ${found.field} level ${found.level} equal to the current price ${found.price}: it is already true, so it can never falsify the call. Name a level price has not yet reached, such as a moving average or a prior swing level from the factCard`;
}
