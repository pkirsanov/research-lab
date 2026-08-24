# BUG-021: A Pack Read That Never Completes Leaves The Route Waiting Without End

**Filed at commit:** `7f0c6ce38`

**Filed by:** a `bubbles.stabilize` round against the Lifetime Tax Strategy Lab
route. That round is authorised to record findings and file bug artifacts. It is
not authorised to change a shipped file, and it changed none.

**Severity:** Low to Medium. The route never lies and never renders a wrong
figure, but it can wait forever without ever saying it has given up.

## Summary

`loadJson` in the route performs `window.fetch` with no time bound, and no stage
of the boot chain that consumes it imposes one. A declared pack whose response
never arrives therefore leaves the page at `truthState = Loading` indefinitely.
Measured: after twenty seconds the body still carried no `data-rl-tax-state`
attribute at all.

Every other damage mode reaches a terminal, named state within about sixty
milliseconds. This one has no terminal state.

## Why This Matters

The route is otherwise exemplary under damage. A missing pack, a truncated pack,
an empty body, malformed bytes, valid JSON in the wrong shape, a missing module
and a missing configuration each produce a named `RLTAX-` refusal and no figure.
The single gap is the case where the response is neither delivered nor refused.

A reader in that state cannot distinguish "still loading, be patient" from "this
will never finish". The word on screen is `Loading`, which is true and stays true
for as long as the page is open. The route's stated discipline elsewhere is that
what it cannot do is named; here it is not named because the code path that would
name it is never reached.

A slow read is handled correctly. A three second delay on the medicare pack
delayed the ready state by exactly that and then settled normally. The defect is
specific to a read that does not complete.

## Reproduction

1. Serve the repository over an origin that accepts the request for one declared
   pack and never writes a response and never closes the socket.
2. Open the route.
3. Observe that `truthState` reads `Loading`, that `document.body` carries no
   `data-rl-tax-state` attribute, and that neither changes.

Any of the nine declared documents will do. The medicare pack was used because it
is last in the boot chain, so every earlier stage is known to have completed.

## Observed Against Expected

| | Observed | Expected |
|---|---|---|
| `data-rl-tax-state` after 20s | absent | a terminal value |
| `truthState` after 20s | `Loading` | a named refusal |
| Time to a terminal state | none reached | bounded |
| A named `RLTAX-` code | none | one naming the document that did not arrive |
| A wrong figure rendered | none | none |

## Root Cause

```
function loadJson(path) {
    return window.fetch(path, { cache: "no-store", credentials: "same-origin" })
        .then(function (response) {
            if (!response.ok) throw new Error(path);
            return response.json();
        });
}
```

There is no `AbortController`, no `setTimeout`, and no `Promise.race`. The
returned promise settles only when the network settles.

The chain above it is fully prepared for a failure and needs no new refusal code
to express one. The configuration and federal-pack stages already terminate in a
`.catch` that emits `RLTAX-CONFIG-INVALID` and sets `data-rl-tax-state` to
`config-blocked`. Each optional pack family already terminates in its own
`.catch(function () { return null; })`, which leaves that jurisdiction, year or
domain unresolved and lets the existing per-domain refusals name it. A rejection
caused by a bound would flow into those same handlers and produce the behaviour
that is already correct for a missing pack.

What is missing is only the bound itself.

## Not Established

- Whether a real deployment target can produce this state. It was produced with a
  server that accepts and never answers. Whether a checkout opened from a local
  file path, or a static host, can stall in the same way was not measured.
- Whether a partially delivered body that then stalls behaves the same as one
  that never starts. Only the never-starts case was driven.
- What bound would be right. This round measured that there is none; it did not
  measure what a tolerable one would be.
