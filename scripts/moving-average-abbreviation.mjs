// "MA" is both the moving-average abbreviation and Mastercard's tracked ticker, so it cannot be
// blanket-exempted from the OMLX fact-binding ticker scan. This defuses only the unambiguous
// moving-average idioms: "<n>-day MA" and "MA" directly followed by a moving-average noun
// ("MA stack", "MA cross", ...). A bare "MA" or "MA rose 3%" still reads as Mastercard.
const MA_NOUN = 'stack|stacks|cross|crosses|crossover|slope|support|resistance|confluence|cluster|alignment|structure|ribbon|distance|reclaim|bounce|rejection|test|retest|trend|filter|band|bands';

export function defuseMovingAverageAbbreviation(text) {
    return String(text)
        .replace(/(-day|day)(\s+)MA\b/g, '$1$2ma')
        .replace(new RegExp(`\\bMA(\\s+(?:${MA_NOUN})\\b)`, 'g'), 'ma$1');
}
