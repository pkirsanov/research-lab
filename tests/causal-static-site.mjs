/*
 * Shared static-file harness for the causal browser suites.
 *
 * Seven causal specs each carried a byte-identical copy of this server. That duplication was
 * found by the feature 001 simplify phase: a path-traversal guard or MIME entry fixed in one
 * copy would silently not exist in the other six, which is the kind of drift that makes a
 * harness bug look like a product bug.
 *
 * The root is a parameter because the Pages suite must serve the BUILT _site directory rather
 * than the working tree - serving the tree there would let a page pass that the real deployed
 * artifact never contains.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml'
};

/*
 * Returns a handle whose baseUrl is only valid after start(). Nothing is cached between runs:
 * every response is no-store so a suite can never pass on a stale bundle.
 */
export function createStaticSite(root = REPO_ROOT) {
  const serveRoot = resolve(root);
  let server = null;
  let baseUrl = '';

  return {
    get baseUrl() { return baseUrl; },
    async start() {
      server = createServer((request, response) => {
        const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
        const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
        const filePath = resolve(serveRoot, relative);
        /* Refuse anything that escapes the served root, so a traversal cannot read the repo. */
        if ((filePath !== serveRoot && !filePath.startsWith(serveRoot + sep))
          || !existsSync(filePath) || !statSync(filePath).isFile()) {
          response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('not found');
          return;
        }
        response.writeHead(200, {
          'content-type': MIME[extname(filePath)] || 'application/octet-stream',
          'cache-control': 'no-store'
        });
        createReadStream(filePath).pipe(response);
      });
      await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      return baseUrl;
    },
    async stop() {
      if (server) await new Promise((done) => server.close(done));
      server = null;
      baseUrl = '';
    }
  };
}
