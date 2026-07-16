import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURE_ROOT = resolve(ROOT, 'tests/fixtures/portfolio-survival-allocation');

const MIME = Object.freeze({
  '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8'
});

export function fixture(name) {
  return readFileSync(resolve(FIXTURE_ROOT, name), 'utf8');
}

export function createStorage(options = {}) {
  const values = new Map(Object.entries(options.initial || {}));
  const failGet = new Set(options.failGet || []);
  const failRemove = new Set(options.failRemove || []);
  const failSet = new Set(options.failSet || []);
  const corruptAfterSet = new Map(Object.entries(options.corruptAfterSet || {}));
  const writes = [];
  return {
    clear() { values.clear(); },
    getItem(key) {
      key = String(key);
      if (failGet.has(key)) throw new Error('storage read failed');
      return values.has(key) ? values.get(key) : null;
    },
    failGet(key) { failGet.add(String(key)); },
    failRemove(key) { failRemove.add(String(key)); },
    failSet(key) { failSet.add(String(key)); },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    get length() { return values.size; },
    removeItem(key) {
      key = String(key);
      if (failRemove.has(key)) throw new Error('storage remove failed');
      values.delete(key);
    },
    setItem(key, value) {
      key = String(key);
      if (failSet.has(key)) throw new Error('storage write failed');
      writes.push({ key, value: String(value) });
      values.set(key, corruptAfterSet.has(key) ? corruptAfterSet.get(key) : String(value));
    },
    snapshot() { return Object.fromEntries(values); },
    writes() { return writes.slice(); }
  };
}

export async function startPortfolioServer() {
  const requests = [];
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    requests.push(Object.freeze({
      method: request.method || 'GET',
      pathname: requestUrl.pathname,
      search: requestUrl.search,
      referer: request.headers.referer || ''
    }));
    const requestPath = decodeURIComponent(requestUrl.pathname);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'referrer-policy': 'no-referrer' });
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
  return Object.freeze({
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    requests,
    close: () => new Promise((resolveClosed, rejectClosed) => {
      server.close((error) => error ? rejectClosed(error) : resolveClosed());
      server.closeAllConnections?.();
    })
  });
}