import { readFileSync } from 'node:fs';
import { startStaticServer } from './provider-credentials.support.mjs';

/* BUG-012 scope 02 — the committed reversal fixture reads committed bars.
 *
 * `research-agenda-lab.html?fixture=reversal` resolves `attemptedAt` against `data/bars/*.json`.
 * The DEPLOYED page must keep reading the live corpus — that is its job. What must not depend on a
 * scheduled refresh is the COMMITTED regression: `643d74bfd` rewrote the row behind the cutoff and
 * six green tests went red with no change to the test, the page or the model.
 *
 * So the pin lives on the test surface, not in the shipped page: the fixture's resolved bar inputs
 * are committed in `reversal-ui.bars.json` and served at the same URLs the page already requests.
 * The page performs the same real fetch and renders whatever it actually observed; only the bytes
 * behind those URLs are now reviewed rather than mutable. Changing what the fixture resolves takes
 * a commit to that file.
 */
const AGENDA_FIXTURE_PIN_PATH = 'tests/fixtures/research-agenda/reversal-ui.bars.json';

export function agendaFixtureBarOverrides() {
  const pin = JSON.parse(readFileSync(new URL(`../${AGENDA_FIXTURE_PIN_PATH}`, import.meta.url), 'utf8'));
  const overrides = {};
  for (const [symbol, barFile] of Object.entries(pin.bars)) {
    overrides[`data/bars/${symbol}.json`] = JSON.stringify(barFile);
  }
  // An emptied pin would serve nothing, the page would fall through to the mutable corpus, and the
  // coupling this scope removed would be back with every test still green.
  if (!Object.keys(overrides).length) throw new Error(`${AGENDA_FIXTURE_PIN_PATH} pins no bars`);
  return overrides;
}

export function startPinnedAgendaSite() {
  return startStaticServer({ overrides: agendaFixtureBarOverrides() });
}
