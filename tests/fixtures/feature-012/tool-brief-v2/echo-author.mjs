#!/usr/bin/env node
/*
 * tests/fixtures/feature-012/tool-brief-v2/echo-author.mjs
 * ---------------------------------------------------------------------------
 * A REAL bounded author process for the Feature 012 Scope 11 boundary test.
 *
 * It is started by scripts/brief-author.mjs invokeAuthor() with shell:false and
 * a hard stdout/time ceiling, exactly as a production author is. It does NOT
 * author anything — it reports back what it was able to OBSERVE of the request
 * it was handed, so the test can assert on the author's actual field of view
 * rather than on a description of it.
 *
 * It reads stdin and writes stdout. It performs no network access, opens no
 * file, and starts no shell.
 */

const mode = (process.argv.find((a) => a.startsWith('--mode=')) || '--mode=inventory').slice('--mode='.length);

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

const raw = await readStdin();

if (mode === 'hang') {
  // never respond — proves the caller's timeout ceiling is real.
  setTimeout(() => process.exit(0), 60000);
} else if (mode === 'malformed') {
  process.stdout.write('this is not JSON');
  process.exit(0);
} else if (mode === 'oversize') {
  process.stdout.write(JSON.stringify({ pad: 'x'.repeat(64 * 1024) }));
  process.exit(0);
} else {
  const request = JSON.parse(raw);
  const data = request.data || {};
  const evidence = data.evidence || {};

  /* A credential is a KEY whose whole name is credential-shaped, or a VALUE carrying a
     credential prefix. Substring matching would flag `maxOutputTokens` — a bounded output
     cap — as a token, which is exactly the kind of false positive that trains a reader to
     ignore this signal. */
  const CREDENTIAL_KEY = /^(?:authorization|cookie|credential|apikey|api_key|api-key|password|passphrase|secret|token|accesstoken|access_token|bearer)$/i;
  const CREDENTIAL_VALUE = /^(?:Bearer\s|sk-|ghp_|xoxb-)/;
  function credentialSeen(value) {
    if (typeof value === 'string') return CREDENTIAL_VALUE.test(value);
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.some(credentialSeen);
    return Object.keys(value).some((k) => CREDENTIAL_KEY.test(k) || credentialSeen(value[k]));
  }

  process.stdout.write(JSON.stringify({
    contractVersion: 'tool-author-observation/v1',
    observed: {
      topLevelKeys: Object.keys(request),
      ownerReadSha256: data.ownerRead ? data.ownerRead.sha256 : null,
      evidenceBundleSha256: evidence.bundleSha256 || null,
      claimIds: (evidence.claims || []).map((c) => c.claimId),
      hasRawExcerptText: JSON.stringify(evidence).includes('excerpts'),
      capabilitiesGranted: Object.values(request.capabilities || {}).filter(Boolean).length,
      providerCredentialVisible:
        credentialSeen(request) ||
        Object.keys(process.env).some((k) => /^(?:BRIEF|RL|AUTHOR)_.*(?:KEY|TOKEN|SECRET|PASSWORD)$/.test(k))
    }
  }));
  process.exit(0);
}
