export const NARRATIVE_WEB_ALLOWLIST = Object.freeze([
  'finance.yahoo.com', 'query1.finance.yahoo.com', 'query2.finance.yahoo.com',
  'production.dataviz.cnn.io', 'www.federalreserve.gov', 'www.bls.gov',
  'www.bea.gov', 'fred.stlouisfed.org', 'api.stlouisfed.org', 'www.cnbc.com',
  'www.reuters.com', 'www.marketwatch.com', 'www.investing.com',
  'www.cmegroup.com', 'www.treasurydirect.gov'
]);

export const RESEARCH_AGENDA_ALLOWED_HOSTS = Object.freeze(
  NARRATIVE_WEB_ALLOWLIST.map((host) => Object.freeze({ host, pathPrefix: '/' }))
);

export function narrativeAllowUrlArgs() {
  return Object.freeze(NARRATIVE_WEB_ALLOWLIST.map((host) => `--allow-url=${host}`));
}