#!/usr/bin/env node

/* One declarative model profile is shared by the scheduler preflight and the
   narrative worker. Changing the default profile or its model in
   brief-narrative-models.json is sufficient for the next scheduled run; env
   variables remain explicit one-run overrides. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROVIDERS = new Set(['copilot', 'omlx']);

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveNarrativeModelConfig(options = {}) {
  const root = options.root || process.cwd();
  const env = options.env || process.env;
  const configPath = resolve(root, env.BRIEF_NARRATIVE_MODEL_CONFIG || 'brief-narrative-models.json');
  let config;
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); }
  catch (error) { throw new Error(`cannot read narrative model config ${configPath}: ${error.message}`); }
  if (config?.contractVersion !== 'brief-narrative-models/v1' || !config.profiles || typeof config.profiles !== 'object') {
    throw new Error('brief-narrative-models.json must declare contractVersion brief-narrative-models/v1 and profiles');
  }
  const profileName = env.BRIEF_NARRATIVE_PROFILE || config.defaultProfile;
  const profile = config.profiles[profileName];
  if (!profile || typeof profile !== 'object') throw new Error(`unknown narrative model profile: ${profileName}`);
  const provider = env.BRIEF_NARRATIVE_PROVIDER || profile.provider;
  const model = env.BRIEF_MODEL || profile.model;
  const omlxBaseUrl = env.BRIEF_NARRATIVE_OMLX_BASE_URL || profile.omlxBaseUrl || '';
  // No artificial ceiling: this runs against a local OMLX/Bonsai server on this machine, so there
  // is no per-token cost to guard against, only the model's own real context/output budget (which
  // the caller sizes per-lane against maxOutputBytes downstream). BRIEF_OMLX_MAX_TOKENS and the
  // profile's own omlxMaxTokens remain simply-configured knobs; the fallback default is raised
  // from the old 3072/4096 hard caps to 8192 so a full, honestly-grounded completion is not
  // truncated mid-JSON-object before the model finishes reasoning.
  const omlxMaxTokens = positiveInteger(env.BRIEF_OMLX_MAX_TOKENS || profile.omlxMaxTokens, 8192);
  if (!PROVIDERS.has(provider)) throw new Error(`narrative provider must be one of ${[...PROVIDERS].join(', ')}`);
  if (typeof model !== 'string' || !model.trim()) throw new Error('narrative model must be a non-empty string');
  if (provider === 'omlx' && !/^https?:\/\/[^/?#]+\/?$/.test(omlxBaseUrl)) {
    throw new Error('an omlx profile must provide an http(s) base URL without a query or fragment');
  }
  return { configPath, profile: profileName, provider, model, omlxBaseUrl, omlxMaxTokens };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const config = resolveNarrativeModelConfig();
    if (process.argv.includes('--lines')) {
      process.stdout.write(`profile=${config.profile}\nprovider=${config.provider}\nmodel=${config.model}\nomlxBaseUrl=${config.omlxBaseUrl}\nomlxMaxTokens=${config.omlxMaxTokens}\n`);
    } else {
      process.stdout.write(JSON.stringify(config) + '\n');
    }
  } catch (error) {
    process.stderr.write(`[brief-model-config] ${error.message}\n`);
    process.exit(1);
  }
}
