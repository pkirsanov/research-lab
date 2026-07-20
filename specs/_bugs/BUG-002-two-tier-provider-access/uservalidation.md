# User Validation: BUG-002 Two-Tier Provider Access

Uncheck an item to report it as broken (a user-reported regression). Items are
checked when the corresponding capability is implemented and evidenced.

## Capabilities

- [x] Providers appear as **enableable** (not permanently `disabled`) in the settings panel
- [x] A **tailnet proxy URL** can be entered and saved; the client probes it and shows the active tier
- [x] **Local browser keys** can be entered per provider and are stored only in this browser
- [x] Tier-1 proxy requests carry **no key in the browser**; Tier-2 sends the local key only to the owning provider
- [x] A keyed provider with neither proxy nor local key **fails closed** (`PROVIDER_KEY_MISSING`)
- [x] The evo-x2 proxy is **live** and returns real data (validated Yahoo passthrough)
- [ ] Off-tailnet fallback exercised end-to-end in a browser (pending; requires a real provider key)
- [ ] Regression suite (`provider-credentials.*`) reflects the two-tier model (SCOPE-03 in progress)

## Notes

Tier-2 local keys deliberately supersede the BUG-001 "no browser-stored
credential" rule for this single-user, bring-your-own-key educational tool. See
[bug.md](bug.md) "Why the BUG-001 reversal is acceptable".
