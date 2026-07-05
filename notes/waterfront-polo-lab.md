# Florida Waterfront × Masters Water-Polo Screener — Notes & Methodology

> **Audience: the next agent / analyst (or the owner) who continues this.**
> The tool (`waterfront-polo-lab.html`) is a single self-contained HTML file — all logic is inline;
> the editable dataset lives in `waterfront-polo-universe.json` (fetched to override the inline
> default when served over http; the inline copy keeps it working offline / `file://`).
>
> **As-of: 2026-07-05.** Prices are Redfin trailing-3-month medians (~May 2026).
>
> **Not financial / real-estate / relocation advice.** A research screen, not a recommendation.

---

## 0. Why this tool exists

It operationalizes a personal brief that emerged over a research thread:

- **Waterfront only** (lake / river / intracoastal / canal-bay / ocean).
- **$1–2M**, **2,500–3,000 sqft**, some **land / privacy** ("not crowded").
- **Gating filter:** within a **~40-minute drive of a Masters (adult) water-polo practice.**

The Masters constraint is the whole point: it is far sparser than *high-school* water polo (which is
what an earlier pass mistakenly anchored on). So the tool is a **drive-time screen around a club you
pin**, not a generic real-estate browser.

---

## 1. The model (exact — all in the one `<script>` block)

### 1.1 `haversineMi(aLat,aLon,bLat,bLon)`

Great-circle distance in statute miles (R = 3958.7613 mi). Invariants: `=0` at a point to itself,
symmetric, and matches known city pairs (Orlando↔Tampa ≈ 77–85 mi).

### 1.2 `driveMinutesApprox(miles, avgSpeedMph, roadFactor)`

`drive_min = miles × roadFactor ÷ avgSpeedMph × 60`. Defaults **38 mph, road-factor 1.25** (Florida
suburban/coastal mix). This is a **straight-line-plus-detour estimate, NOT a routed isochrone** — its
only job is first-pass screening; verify real drive time for any short-listed address. Monotone in
miles; `=0` at 0 miles; `null` on bad input.

### 1.3 `nearestClub(lat,lon,clubs)`

Closest club by `haversineMi`. (The UI actually screens against the **selected/pinned** club, but this
helper backs any "nearest of all clubs" logic and is unit-tested.)

### 1.4 `marketPasses(m, f)` — the filter

Pure predicate on a market `m` (with a precomputed `m.driveMin`) and a filter object `f`:

1. `withinOnly` → `m.driveMin ≤ f.minutes`
2. **budget-fit rank** `strong(3) > good(2) > partial(1) > over(0)` → `rank(m) ≥ rank(f.minFit)`
   — **this is the real budget test**, not the median price (see §2).
3. water type allowed, `m.flood ≤ maxFlood`, `m.surge ≤ maxSurge`, `m.land ≥ minLand`,
   `m.insBand ≤ maxIns`.

All five pure helpers are extracted and asserted in `scripts/selftest.mjs` (group
"waterfront-polo-lab.html").

---

## 2. Data honesty (READ THIS before trusting a number)

- **`medK` is a whole-market median** (all home types), **not** a waterfront 2.5–3k sqft price. A true
  waterfront home carries a premium. **Use the `budgetFit` field** (`strong/good/partial/over`) as the
  "does $1–2M buy waterfront + 2.5–3k + land here" read. `medK`/`ppsf`/`yoy`/`dom` are context.
- **`q` flags provenance:** `measured` = pulled from Redfin this session (Clermont, Windermere, Apollo
  Beach 33572, Ortega=Jax metro, Tampa, Fort Lauderdale, Boca YoY, etc.); `est` = metro-derived
  estimate to verify (Mount Dora, Fleming Island, Palm City, Parrish, Cape Coral, …).
- **The Masters-club layer is a SEED.** Adult water polo is sparse and rosters change. `confidence` is
  `reported` (metro with documented adult/college/Masters activity) or `seed` (educated placeholder).
  Named venues (Coral Springs Aquatic Complex, St. Pete North Shore, Sarasota Sharks, UCF, Bolles) are
  real facilities/clubs, but **whether a Masters water-polo practice currently trains there is exactly
  what the user must confirm.** The tool's value is the drive-time screen once **you** pin your real
  pool (dropdown or click-the-map custom pin).
- **Insurance bands** are *typical-home* ($2–6k / $5–9k / $8–20k+). A luxury coastal **waterfront** home
  stacks separate **wind** + **flood** and runs far higher; inland lakefront (Orlando) in an X flood
  zone is the cheapest by a wide margin — the single biggest cost lever.
- **Flood/surge** ordinals are directional framing (First Street / NOAA + 2024 storm evidence: Helene
  surge in Tampa Bay, Ian in the SW Gulf, Milton on the central Gulf). The deciding factor for any
  address is its **FEMA flood zone + finished-floor elevation** — pull it before offering.

---

## 3. What the screen currently says (default brief)

Default = Orlando club, 40 min, budget-fit ≥ Good, land ≥ Medium, surge ≤ Moderate. Standouts:

- **Orlando lakefront (Clermont, Mount Dora, Winter Garden, Lake Nona):** the only hub that passes
  *and* is inland (surge 0, lowest insurance). Best all-round fit.
- **Jacksonville river (Ortega, Fleming Island, Julington Creek):** cheapest waterfront → most land per
  dollar; low insurance; Bolles anchors the polo scene (verify a **Masters** practice).
- **Treasure Coast (Palm City, Sewalls Point, Vero):** best *saltwater* "uncrowded + land" fit; Atlantic
  hurricane exposure; county HS polo (verify Masters).
- **Tampa Bay (Apollo Beach) / Sarasota-Manatee (Parrish):** attainable waterfront + real Masters/club
  scenes, but **high Gulf surge** (2024 storms) — surge filter will drop them unless relaxed.
- **SW Gulf (Cape Coral, Punta Gorda):** cheapest waterfront + land, but Masters polo likely **>40 min**
  and Ian-zone surge — they fall out on the drive-time/surge filters, as intended.
- **SE Gold Coast (Ft. Lauderdale, Boca):** best water polo in FL but `budgetFit: over` — waterfront SF
  is $2M+ on small lots; excluded unless budget-fit set to "Any".

---

## 4. Next-run checklist

1. **Replace the Masters layer with real clubs.** Confirm each metro's Masters practice pool + schedule;
   set `lat/lon` to the actual pool; drop the `seed` placeholders that don't pan out.
2. **Upgrade `est` markets to `measured`** by pulling waterfront-filtered comps (Redfin was rate-limiting
   this session): median + typical sqft for *waterfront, $1–2M, 2,500–3,000 sqft* in each named
   neighborhood, not the whole metro.
3. **Add a real isochrone** if a routing key becomes available (OSRM/Mapbox), replacing
   `driveMinutesApprox`; keep the straight-line version as the offline fallback.
4. Optionally add **carrying-cost math** (insurance + property tax + HOA) per market and a $/mo column.
5. Consider a **flood-zone** field (X / AE / VE) per neighborhood once verified — it dominates insurance.

---

## 5. Files

- `waterfront-polo-lab.html` — the tool (self-contained).
- `waterfront-polo-universe.json` — editable markets + seed Masters clubs + drive model.
- `notes/waterfront-polo-lab.md` — this file.
- Registered in `index.html` (TOOLS array), `tools.json`, `README.md`; math asserted in
  `scripts/selftest.mjs`.
