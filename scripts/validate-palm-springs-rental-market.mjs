import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPlaceBasedRentalMarketValidation } from './validate-place-based-rental-market.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.length !== 0 && args.length !== 2) {
  console.error('usage: node scripts/validate-palm-springs-rental-market.mjs [payload.json config.json]');
  process.exitCode = 2;
} else {
  const options = args.length === 2
    ? { payloadPath: path.resolve(root, args[0]), configPath: path.resolve(root, args[1]), expectedMarketId: 'palm-springs-ca' }
    : {};
  const result = runPlaceBasedRentalMarketValidation(options);
  console.log(`[pbrm-compat] command-shape=${args.length === 2 ? 'legacy-two-positional' : 'no-argument'}`);
  console.log('[pbrm-compat] expected-market=palm-springs-ca');
  console.log('[pbrm-compat] delegate=scripts/validate-place-based-rental-market.mjs');
  for (const line of result.lines) console.log(line);
  for (const finding of result.findings) console.error(`[pbrm-compat] finding=${finding.code} path=${finding.path} message=${finding.message}`);
  console.log(`[pbrm-compat] findings=${result.findings.length}`);
  console.log(`[pbrm-compat] ${result.ok ? 'OK' : 'FAIL'}`);
  process.exitCode = result.ok ? 0 : 1;
}