#!/usr/bin/env node
import { runShadowAuthor, resolveShadowRuntimeProfile } from './brief-route-runtime.mjs';

const INPUT_ERROR = {
  contractVersion: 'brief-shadow-error/v1',
  code: 'B030-VALIDATION',
  reason: 'stdin-invalid',
  field: 'stdin'
};

function emitRefusal(error) {
  process.stderr.write(JSON.stringify({
    contractVersion: 'brief-shadow-refusal/v1',
    authoritative: false,
    error
  }));
  process.exitCode = 2;
}

async function readBoundedInput(maxBytes) {
  const chunks = [];
  let total = 0;
  for await (const chunk of process.stdin) {
    total += chunk.length;
    if (total > maxBytes) return { ok: false, error: INPUT_ERROR };
    chunks.push(chunk);
  }
  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    return { ok: false, error: INPUT_ERROR };
  }
  return { ok: true, value };
}

async function main() {
  if (process.argv.length !== 2) {
    emitRefusal({
      contractVersion: 'brief-shadow-error/v1',
      code: 'B030-SHADOW-PROFILE',
      reason: 'unknown-argument',
      field: 'argv'
    });
    return;
  }
  const profile = resolveShadowRuntimeProfile(process.env);
  if (!profile.ok) {
    emitRefusal(profile.error);
    return;
  }
  const input = await readBoundedInput(profile.value.limits.chatMaxRequestBytes);
  if (!input.ok) {
    emitRefusal(input.error);
    return;
  }
  const result = await runShadowAuthor(input.value, {
    environment: process.env,
    resolvedProfile: profile.value
  });
  if (!result.ok) {
    emitRefusal(result.error);
    return;
  }
  process.stdout.write(JSON.stringify(result.value));
}

main().catch(() => emitRefusal({
  contractVersion: 'brief-shadow-error/v1',
  code: 'B030-ROUTE-UNAVAILABLE',
  reason: 'shadow-process-failed',
  field: 'process'
}));