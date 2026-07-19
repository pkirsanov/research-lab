/*
 * Feature 002 Scope 10 — shared-brief browser test harness.
 *
 * A NEW helper (imports the existing provider-credentials harness exports read-only; it does not
 * modify any prior test). `startBriefServer` serves the ephemeral `briefs/` fixture graph from a
 * temp dir and every other asset (rlapp.js, rlbrief.js, tools.json, the real pages) from ROOT, so
 * the real production shell boots and the shared mount verifies + renders the fixture. It records
 * a request log for selective-fetch assertions and supports content-type / status / registry
 * overrides for the fail-closed and added-source scenarios.
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { ROOT, loadPlaywright, browserLaunchOptions } from './provider-credentials.support.mjs';

export { ROOT, loadPlaywright, browserLaunchOptions };

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jsonl': 'application/x-ndjson; charset=utf-8'
};

const POINTER_PATHS = { '/briefs/current.json': 1, '/briefs/history-current.json': 1 };

function harnessHtml(toolId) {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' + '<meta name="rlbrief-enabled" content="1">' + '<title>Shared brief harness</title></head><body>' +
        '<main id="harness"><h1>Shared brief harness</h1>' +
        '<button id="harness-owner-control" type="button">Owner control</button></main>' +
        '<section data-rlbrief-mount data-tool-id="' + String(toolId).replace(/[^A-Za-z0-9-]/g, '') + '" ' +
        'data-simple-target="rlbrief-simple" data-power-target="rlbrief-power"></section>' +
        '<script src="/rlapp.js"></script></body></html>';
}

/**
 * Start an ephemeral static server.
 * options: { graphDir, registryOverride, contentTypeOverride:{path:ct}, statusOverride:{path:code} }
 */
export async function startBriefServer(options = {}) {
    const graphDir = options.graphDir || null;
    const registryOverride = options.registryOverride || null;
    const ctOverride = options.contentTypeOverride || {};
    const statusOverride = options.statusOverride || {};
    const requests = [];

    const server = createServer((request, response) => {
        const url = request.url || '/';
        const pathname = decodeURIComponent(url.split('?')[0]);
        const query = url.indexOf('?') >= 0 ? url.slice(url.indexOf('?') + 1) : '';
        requests.push(pathname);

        if (statusOverride[pathname]) {
            response.writeHead(statusOverride[pathname], { 'content-type': 'text/plain; charset=utf-8' });
            response.end('override');
            return;
        }

        if (pathname === '/rlbrief-harness.html') {
            const toolMatch = /(?:^|&)tool=([^&]*)/.exec(query);
            const toolId = toolMatch ? decodeURIComponent(toolMatch[1]) : 'sector-research-lab';
            response.writeHead(200, { 'cache-control': 'no-store', 'content-type': MIME['.html'], 'referrer-policy': 'no-referrer' });
            response.end(harnessHtml(toolId));
            return;
        }

        if (pathname === '/tools.json' && registryOverride) {
            response.writeHead(200, { 'cache-control': 'no-store', 'content-type': MIME['.json'] });
            response.end(JSON.stringify(registryOverride));
            return;
        }

        /* briefs/* is served from the ephemeral graph dir (immutable objects cacheable; pointers no-store) */
        if (graphDir && pathname.indexOf('/briefs/') === 0) {
            const rel = normalize(pathname.replace(/^\/+/, ''));
            const filePath = resolve(graphDir, rel);
            if ((filePath !== graphDir && !filePath.startsWith(graphDir + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
                response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
                response.end('not found');
                return;
            }
            const ct = ctOverride[pathname] || MIME[extname(filePath)] || 'application/octet-stream';
            response.writeHead(200, {
                'cache-control': POINTER_PATHS[pathname] ? 'no-store' : 'public, max-age=31536000, immutable',
                'content-type': ct, 'referrer-policy': 'no-referrer'
            });
            createReadStream(filePath).pipe(response);
            return;
        }

        /* everything else from the repo ROOT (rlapp.js, rlbrief.js, rldata.js, real pages, tools.json) */
        const rel = normalize(pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
        const filePath = resolve(ROOT, rel);
        if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
            response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('not found');
            return;
        }
        response.writeHead(200, {
            'cache-control': 'no-store', 'content-type': ctOverride[pathname] || MIME[extname(filePath)] || 'application/octet-stream',
            'referrer-policy': 'no-referrer'
        });
        createReadStream(filePath).pipe(response);
    });

    await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    return {
        baseUrl, requests,
        briefRequests: () => requests.filter((p) => p.indexOf('/briefs/') === 0),
        close: () => new Promise((done, fail) => { server.close((e) => e ? fail(e) : done()); server.closeAllConnections?.(); })
    };
}

export function harnessUrl(baseUrl, toolId) {
    return `${baseUrl}/rlbrief-harness.html?tool=${encodeURIComponent(toolId)}`;
}
