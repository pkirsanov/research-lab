# Research Lab

A small static site of **interactive, single-file research tools** for the
AI-datacenter capex cycle and quant strategy modeling. Each tool is one
self-contained `.html` file (no build step, no dependencies, no network calls);
[`index.html`](index.html) is the landing page that links to them all.

> **Educational only — not investment advice.** Every figure is a hypothetical
> output from editable assumptions; no live market prices are used.

## Live site

Published via GitHub Pages (GitHub Actions). After the first deploy, the site is at:

```
https://pkirsanov.github.io/research-lab/
```

## Layout

```
.
├── index.html                  # landing page (renders from the TOOLS array inside it)
├── ai-capex-strategy-lab.html  # tool #1
├── msft-july-print-model.html  # tool #2
├── notes/                      # per-tool notes — notes/<tool-id>.md (methodology, data, handoff)
│   ├── README.md               # notes convention
│   └── msft-july-print-model.md
├── tools.json                  # machine-readable mirror of the tool registry (incl. notes path)
├── .nojekyll                   # serve files as-is (no Jekyll)
└── .github/workflows/pages.yml # GitHub Actions → Pages deploy (publishes repo root)
```

## Add a new tool

1. Drop a new single-file HTML at the repo root (e.g. `my-tool.html`).
2. Add one entry to the `TOOLS` array near the bottom of `index.html`.
3. (Optional) mirror it in `tools.json`.
4. Add per-tool notes at `notes/<tool-id>.md` (methodology, data, sources, assumptions, next-run checklist) and link them from a small footer in the tool's HTML + a `notes` field in the registry. See [`notes/README.md`](notes/README.md).
5. Commit & push — the `pages` workflow redeploys automatically.

The landing page renders straight from the inline `TOOLS` array, so it works
both offline (`file://`) and on GitHub Pages with no fetch/CORS dependency.

## Deploy mechanism

`.github/workflows/pages.yml` uploads the repo root as the Pages artifact and
deploys it on every push to `main`. Pages source must be set to **GitHub
Actions** (Settings → Pages → Build and deployment → Source).
