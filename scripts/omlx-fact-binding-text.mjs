// The OMLX fact-binding price check compares every number above 100 that follows a ticker against
// that ticker's known price and moving-average levels. Several ordinary numerals are not prices and
// can never match one: look-back lengths ("252-day", "126-day"), calendar dates and years, percents,
// and multiples. Left in, they refuse a fully correct lane over prose such as "XLK 252-day momentum".
// This removes only those shapes; a bare price-like number is untouched and is still checked.
const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\.?';
const UNIT = '(?:day|days|d|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs|session|sessions|bar|bars|period|periods|hour|hours|minute|minutes|dma|sma|ema|ma)';

export function stripNonPriceNumerals(text) {
    return String(text)
        .replace(/\b(?:19|20)\d{2}-\d{2}-\d{2}(?:[T ][\d:.]+Z?)?\b/g, ' ')
        .replace(new RegExp(`\\b${MONTH}\\s+\\d{1,2},?\\s+(?:19|20)\\d{2}\\b`, 'gi'), ' ')
        .replace(/\b(?:in|by|since|during|of|for|until|through|fy|cy)\s+(?:19|20)\d{2}\b/gi, ' ')
        .replace(new RegExp(`\\b\\d+(?:\\.\\d+)?\\s?-?\\s?${UNIT}\\b`, 'gi'), ' ')
        .replace(/\b\d+(?:\.\d+)?\s?%/g, ' ')
        .replace(/\b\d+(?:\.\d+)?x\b/gi, ' ');
}
