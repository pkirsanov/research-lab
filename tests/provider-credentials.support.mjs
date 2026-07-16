import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CONTROLLED_POLICY = `
    controlled: Object.freeze({
      id: "controlled",
      label: "Controlled test provider",
      note: "Test-only same-document policy",
      enrollmentUrl: "https://controlled.invalid/enroll",
      browserOriginAuthorization: "verified",
      authorizationEvidence: Object.freeze(["test-only-policy"]),
      authTransport: "header",
      authHeaderName: "X-Controlled-Test",
      requestOrigins: Object.freeze(["https://controlled.invalid"]),
      operations: Object.freeze({ ping: Object.freeze({ id: "ping" }) }),
      eligibleDocuments: Object.freeze(["index.html", "controlled.html"]),
      cspProfile: "credential-capable-v1"
    }),`;

export function controlledRldataSource(source) {
  const marker = 'var PROVIDER_POLICIES = Object.freeze({';
  const controlled = source.replace(marker, marker + CONTROLLED_POLICY);
  if (controlled === source) throw new Error('controlled provider policy marker not found');
  return controlled;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8'
};

export function createStorage(options = {}) {
  const values = new Map(Object.entries(options.initial || {}));
  const failRemove = new Set(options.failRemove || []);
  const failSet = new Set(options.failSet || []);
  return {
    clear() { values.clear(); },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    get length() { return values.size; },
    removeItem(key) {
      key = String(key);
      if (failRemove.has(key)) throw new Error('storage remove failed');
      values.delete(key);
    },
    failRemove(key) { failRemove.add(String(key)); },
    failSet(key) { failSet.add(String(key)); },
    setItem(key, value) {
      key = String(key);
      if (failSet.has(key)) throw new Error('storage write failed');
      values.set(key, String(value));
    },
    snapshot() { return Object.fromEntries(values); }
  };
}

export function loadRldata(options = {}) {
  const productionSource = readFileSync(resolve(ROOT, 'rldata.js'), 'utf8');
  const source = options.controlled ? controlledRldataSource(productionSource) : productionSource;
  const localStorage = options.localStorage || createStorage();
  const sessionStorage = options.sessionStorage || createStorage();
  const listeners = new Map();
  const location = {
    href: 'https://research.invalid' + (options.pathname || '/index.html'),
    pathname: options.pathname || '/index.html',
    protocol: 'https:'
  };
  const root = {
    addEventListener(type, listener) {
      const handlers = listeners.get(type) || [];
      handlers.push(listener);
      listeners.set(type, handlers);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) || []) listener.call(root, event);
      return true;
    },
    location
  };
  const api = Function(
    'globalThis',
    'window',
    'localStorage',
    'sessionStorage',
    'fetch',
    'location',
    'document',
    `${source}\nreturn globalThis.RLDATA;`
  )(root, root, localStorage, sessionStorage, options.fetch, location, undefined);
  return {
    api,
    dispatchLifecycle(type, detail = {}) { root.dispatchEvent({ type, ...detail }); },
    localStorage,
    root,
    sessionStorage
  };
}

export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch (localResolutionError) {
    const cacheRoot = resolve(process.env.npm_config_cache || resolve(homedir(), '.npm'), '_npx');
    const candidates = existsSync(cacheRoot)
      ? readdirSync(cacheRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => resolve(cacheRoot, entry.name, 'node_modules', 'playwright'))
        .filter((packageDir) => {
          const manifest = resolve(packageDir, 'package.json');
          if (!existsSync(manifest)) return false;
          try { return JSON.parse(readFileSync(manifest, 'utf8')).name === 'playwright'; } catch (error) { return false; }
        })
        .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)
      : [];
    if (!candidates.length) throw new Error('Playwright runtime unavailable: no local or cached package exists', { cause: localResolutionError });
    return import(pathToFileURL(resolve(candidates[0], 'index.mjs')).href);
  }
}

export function browserLaunchOptions() {
  const candidates = process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : process.platform === 'linux'
      ? ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
      : [];
  const executablePath = candidates.find((candidate) => existsSync(candidate));
  return executablePath ? { executablePath, headless: true } : { headless: true };
}

export async function startStaticServer() {
  const server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    if (requestPath === '/__bug001__/controlled-rldata.js') {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': MIME['.js'],
        'referrer-policy': 'no-referrer'
      });
      response.end(controlledRldataSource(readFileSync(resolve(ROOT, 'rldata.js'), 'utf8')));
      return;
    }
    if (requestPath === '/__bug001__/controlled.html') {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-security-policy': "default-src 'self'; script-src 'self'; connect-src https://controlled.invalid; object-src 'none'; base-uri 'none'; form-action 'none'",
        'content-type': MIME['.html'],
        'referrer-policy': 'no-referrer'
      });
      response.end('<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Controlled provider lifecycle</title></head><body><main id="controlled-runtime">Controlled provider lifecycle</main><script src="/__bug001__/controlled-rldata.js"></script></body></html>');
      return;
    }
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'referrer-policy': 'no-referrer'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolveClosed, rejectClosed) => {
      server.close((error) => error ? rejectClosed(error) : resolveClosed());
      server.closeAllConnections?.();
    })
  };
}