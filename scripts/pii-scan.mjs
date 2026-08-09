#!/usr/bin/env node
/*
 * Committed-surface PII scan.
 *
 * This repository is public and its `notes/`, `docs/`, `briefs/` and `data/`
 * directories are published verbatim to GitHub Pages, so a personal identifier
 * that reaches a commit is disclosed twice over — in the tree and in the git
 * history, which only a destructive rewrite can undo. A rewrite happened once
 * (2026-08); this guard exists so it does not have to happen again.
 *
 * It detects the exact classes that leaked before, each of which is mechanical
 * and therefore reliably matchable:
 *   personal-email    a mailbox at a consumer mail provider
 *   employer-email    a mailbox at a declared employer domain
 *   home-path         an absolute home directory naming a real account
 *   machine-hostname  an Apple device name, which embeds the owner's name
 *   denied-term       an operator-supplied term, matched by digest only
 *
 * A real name cannot be recognised by shape, so it is carried as a SHA-256
 * digest in `pii-scan.config.json`. The config therefore stays publishable: it
 * proves a term is forbidden without restating it. Candidate terms are drawn
 * only from runs of capitalised words, which is what names look like and which
 * keeps the digest comparison linear in file size.
 *
 * FINDINGS NEVER ECHO THE MATCHED TEXT. A scanner that prints what it found
 * copies the identifier into CI logs, pull-request annotations and terminal
 * scrollback — reproducing the disclosure it is meant to prevent. Output is
 * limited to rule, file, line, column and match length; open the cited line to
 * see the value.
 *
 * Usage:
 *   node scripts/pii-scan.mjs            scan; exit 1 on any finding
 *   node scripts/pii-scan.mjs --json     machine-readable findings
 *   node scripts/pii-scan.mjs --hash     read a term on stdin, print its digest
 *
 * Exit: 0 = clean, 1 = findings, 2 = the scan itself could not run.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = 'scripts/pii-scan.config.json';

/* Directories that never reach a commit, plus the config itself: it lists
   provider domains as bare hostnames, which no rule matches, but excluding it
   keeps the guard honest if a future rule ever widens. */
const SKIP_DIRS = new Set(['.git', 'node_modules', '_site', 'playwright-report', 'test-results', '.codegraph', '.brief-work']);

export function normalizeTerm(value) {
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
}

export function hashTerm(value) {
    return createHash('sha256').update(normalizeTerm(value), 'utf8').digest('hex');
}

export function loadConfig(root = ROOT) {
    const config = JSON.parse(readFileSync(join(root, CONFIG_PATH), 'utf8'));
    if (config.contractVersion !== 'pii-scan/v1') throw new Error('pii-scan config contract is invalid');
    return config;
}

/* Anchored at `@` so the provider must be the WHOLE domain. Without the anchor
   a host such as `query1.finance.yahoo.com` — which this repo's tests use as a
   hostile-URL fixture — would read as a consumer mailbox. */
function emailPattern(domains) {
    const alternation = domains.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp('[A-Za-z0-9._%+-]+@(?:' + alternation + ')(?![A-Za-z0-9.-])', 'gi');
}

function globToRegExp(glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const expanded = escaped.replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '(?:.*/)?');
    return new RegExp('^' + expanded + '$');
}

function buildAllow(config) {
    return (config.allow || []).map((entry) => {
        if (!entry || typeof entry.path !== 'string' || typeof entry.reason !== 'string' || entry.reason.length < 20) {
            throw new Error('every pii-scan allow entry needs a path and a substantive reason');
        }
        return { match: globToRegExp(entry.path), rules: new Set(entry.rules || []), path: entry.path };
    });
}

function isAllowed(allow, file, rule) {
    return allow.some((entry) => entry.match.test(file) && (entry.rules.size === 0 || entry.rules.has(rule)));
}

/* Windows of 2-3 consecutive capitalised words. One word is too noisy to be a
   useful name signal and four is longer than the names people commit. */
export function candidateTerms(line) {
    const runs = line.match(/[A-Z][A-Za-z'\u2019-]+(?: +[A-Z][A-Za-z'\u2019-]+)+/g) || [];
    const out = [];
    for (const run of runs) {
        const words = run.split(/ +/);
        for (let size = 2; size <= 3; size++) {
            for (let i = 0; i + size <= words.length; i++) out.push(words.slice(i, i + size).join(' '));
        }
    }
    return out;
}

export function scanText(text, rules) {
    const findings = [];
    const lines = text.split('\n');
    for (let n = 0; n < lines.length; n++) {
        const line = lines[n];
        for (const rule of rules.regex) {
            rule.pattern.lastIndex = 0;
            let m;
            while ((m = rule.pattern.exec(line)) !== null) {
                if (rule.accept && !rule.accept(m)) continue;
                findings.push({ rule: rule.id, line: n + 1, column: m.index + 1, length: m[0].length });
            }
        }
        if (rules.deniedHashes.size > 0) {
            for (const term of candidateTerms(line)) {
                if (rules.deniedHashes.has(hashTerm(term))) {
                    findings.push({ rule: 'denied-term', line: n + 1, column: line.indexOf(term) + 1, length: term.length });
                }
            }
        }
    }
    return findings;
}

export function buildRules(config) {
    const allowedSegments = new Set((config.homePathAllowedSegments || []).map((s) => s.toLowerCase()));
    return {
        regex: [
            { id: 'personal-email', pattern: emailPattern(config.personalEmailDomains || []) },
            { id: 'employer-email', pattern: emailPattern(config.employerEmailDomains || []) },
            {
                id: 'home-path',
                pattern: /\/(?:Users|home)\/([A-Za-z0-9._<>-]+)/g,
                // A placeholder such as `<user>` is the documented stand-in, not an account.
                accept: (m) => !m[1].startsWith('<') && !allowedSegments.has(m[1].toLowerCase())
            },
            // Device names embed their owner: Apple defaults to "<Given-name>s-MacBook-Pro",
            // and a managed Windows/Cloud-PC host to "CPC-<user-prefix>-<id>".
            { id: 'machine-hostname', pattern: /\b(?:[A-Za-z0-9]{2,}-(?:MacBook-?(?:Pro|Air)|iMac|Mac-(?:mini|Studio|Pro))|CPC-[A-Za-z0-9]+-[A-Za-z0-9]+)\b/g }
        ],
        deniedHashes: new Set(config.deniedTermHashes || [])
    };
}

function listTrackedFiles(root) {
    try {
        const out = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
        const files = out.split('\0').filter(Boolean);
        if (files.length > 0) return files;
    } catch { /* fall through to a walk when git is unavailable */ }
    const files = [];
    (function walk(dir) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith('.') && SKIP_DIRS.has(entry.name)) continue;
            const full = join(dir, entry.name);
            if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) walk(full); }
            else if (entry.isFile()) files.push(relative(root, full).split(sep).join('/'));
        }
    })(root);
    return files;
}

/* Commit messages are a second committed surface. `git ls-files` cannot reach
   them, so a file-only scan reports clean while an identifier sits in history
   forever — which is exactly how `/home/<user>` survived an earlier scrub. In a
   shallow CI clone this sees the tip commit, which is the one being added. */
export function listCommitMessages(root) {
    let out;
    try {
        out = execFileSync('git', ['-C', root, 'log', '--format=%H%x1f%B%x1e'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    } catch { return []; }
    const records = [];
    for (const raw of out.split('\u001e')) {
        const record = raw.replace(/^\n+/, '');
        const split = record.indexOf('\u001f');
        if (split === -1) continue;
        records.push({ sha: record.slice(0, split), message: record.slice(split + 1) });
    }
    return records;
}

export function runPiiScan({ root = ROOT } = {}) {
    const config = loadConfig(root);
    const rules = buildRules(config);
    const allow = buildAllow(config);
    const findings = [];
    let filesScanned = 0;
    let messagesScanned = 0;

    for (const file of listTrackedFiles(root)) {
        if (file === CONFIG_PATH) continue;
        if (file.split('/').some((seg) => SKIP_DIRS.has(seg))) continue;
        let text;
        try {
            if (statSync(join(root, file)).size > 32 * 1024 * 1024) continue;
            text = readFileSync(join(root, file), 'utf8');
        } catch { continue; }
        if (text.indexOf('\u0000') !== -1) continue; // binary
        filesScanned++;
        for (const finding of scanText(text, rules)) {
            if (isAllowed(allow, file, finding.rule)) continue;
            findings.push({ file, ...finding });
        }
    }

    for (const { sha, message } of listCommitMessages(root)) {
        const label = `git-message:${sha.slice(0, 12)}`;
        messagesScanned++;
        for (const finding of scanText(message, rules)) {
            if (isAllowed(allow, label, finding.rule)) continue;
            findings.push({ file: label, ...finding });
        }
    }
    findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
    return { ok: findings.length === 0, findings, filesScanned, messagesScanned };
}

/* Rule and location only. The matched text is deliberately withheld. */
export function formatFindings(result) {
    const lines = result.findings.map((f) => `[pii-scan] ${f.file}:${f.line}:${f.column} rule=${f.rule} length=${f.length}`);
    lines.push(`[pii-scan] files=${result.filesScanned} messages=${result.messagesScanned} findings=${result.findings.length} ${result.ok ? 'OK' : 'FAIL'}`);
    if (!result.ok) {
        lines.push('[pii-scan] The matched text is withheld on purpose — printing it would copy the identifier into CI logs.');
        lines.push('[pii-scan] Open each cited line. Remove the identifier, or add a reasoned entry to scripts/pii-scan.config.json "allow".');
        lines.push('[pii-scan] A git-message:<sha> finding lives in a commit message, not a file — it needs a history rewrite (git filter-repo --message-callback), not an edit.');
    }
    return lines.join('\n');
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

/* Guarded so importing this module (selftest does) never runs the CLI, and
   wrapped in an async IIFE so the module itself stays synchronous to evaluate. */
if (process.argv[1] && process.argv[1].endsWith('pii-scan.mjs')) {
    (async () => {
        if (process.argv.includes('--hash')) {
            const term = (await readStdin()).replace(/\n+$/, '');
            if (!normalizeTerm(term)) { console.error('[pii-scan] no term on stdin'); process.exit(2); }
            console.log(hashTerm(term));
            return;
        }
        let result;
        try {
            result = runPiiScan();
        } catch (error) {
            console.error('[pii-scan] scan could not run: ' + error.message);
            process.exit(2);
        }
        console.log(process.argv.includes('--json') ? JSON.stringify(result) : formatFindings(result));
        process.exitCode = result.ok ? 0 : 1;
    })();
}
