# AssetForge

The arc-two art pipeline. **Nothing installs on the owner's machine**: no weights, no
models, no UIs. Hosted APIs through a thin client, per the R084 constraint on record.

R083 assessed local SD 3.5 and stopped: `docs/art/ASSETFORGE_FEASIBILITY_2026-08-22.md`.
R084 replaced that route with hosted APIs behind a blocking licence gate.

## The licence gate comes first

`docs/licences/PROVIDER_GATE_2026-08-22.md` is the ruling; `provider_gate.json` is the
machine-readable form that `generate.py` reads on **every** call.

| Provider | Mark |
|---|---|
| Stability AI (`sd3.5-large`, `sd3.5-large-turbo`) | **CLEARED** |
| OpenAI (`gpt-image-1`) | **CLEARED for development-stage artwork only** (R099, Ticket 456254). Not for operating gambling, wagers, payments or player interaction. Was BARRED at R084; see `docs/legal/openai-ticket-456254-ruling.md` |

A client that merely omitted OpenAI would silently become wrong the day somebody added it
back. One that refuses by mark stays right, so the mark is enforced in code.

**A MARK IS NOT A CLIENT, and R100 made that structural.** OpenAI is CLEARED and still
cannot be called, because `generate.py` has no OpenAI client: it implements Stability only.
Until R100 the call site invoked `stability_generate` with no branch on provider, so a
priced OpenAI call would have sent `OPENAI_API_KEY` to `api.stability.ai`. That was proven
by an offline probe before the guard existed. `CLIENTS` now maps provider to client and
`require_client()` refuses anything absent from it, seeded in the self-test with a synthetic
CLEARED-but-unimplemented provider so the case survives an OpenAI client being added later.

**So the two OpenAI blockers today are:** no client, and no committed credit price. Neither
is a licence question and neither is fixed by editing the gate.

## `compose.py`, the deterministic prompt composer

Production prompts are BUILT by merging the committed style register with each
`art_manifest_arc2.csv` row, so no hand-written prompt can drift from the manifest. The
same row plus the same register always yields the same prompt, which is what makes a
regeneration reproducible.

**It runs.** The register it expects landed at `docs/art/style_register.json` in R100,
derived from the committed design system, the arc-2 handover, the manifest and the arc-2
batch prompt records rather than written fresh. Four of its keys are operative: `base` and
`negative` are required, `per_role` is merged per manifest id, and `camera` is named by the
loader's own refusal message but is not yet read by `compose()`. Everything else in the file
is documentation, including a `derivation` block giving the source of every operative clause
and an `open_questions` block naming the tensions it deliberately did not resolve.

Twenty-nine of the thirty REPLACE rows compose cleanly. `SC-03` raises `ValueError` rather
than refusing, because its `target_dimensions` cell reads `800x640 source` and `compose()`
parses that field with `int()`.

## `generate.py`, the hosted-API client

```
scripts/assets/.venv/bin/python scripts/assets/assetforge/generate.py --id SY-01 --dry-run
```

Keys come from env (`STABILITY_API_KEY`) and are never committed. Every call appends
provider, model, full prompt and negative, parameters, seed, request id and cost to a
provenance ledger before the image counts as delivered. Outputs go to
`.scratch/assetforge/`, gitignored per (h.1). Per-image cost is printed. A **USD 10
session cap** is checked before each call against the ledger's running total, because
spending is the owner's under rule 1 and a cap checked afterwards is not a cap.

Costs are read from the captured pricing, not from memory: 1 credit = USD $0.01,
`sd3.5-large` 6.5 credits ($0.065), `sd3.5-large-turbo` 4 ($0.040).

## `ingest.py`, the candidate QA pass

Handles **both alpha routes**, decided by measurement rather than a flag:

- **native**, the provider returned a cutout: the supplied alpha is preserved and only the
  edge despill runs.
- **key**, the render arrived on a chroma field: green-key knockout, then despill.

An RGBA source whose alpha is uniformly opaque is an RGB image wearing four channels and
correctly takes the key route.

Then delivery downscale, 64px silhouette, dimension assertion, and refusal of anything
without a manifest row or outside the 30 REPLACE rows. Exit 2 on any refusal so it can
gate a chain.

## The self-tests, convention (p)

```
scripts/assets/.venv/bin/python scripts/assets/assetforge/ingest_selftest.py     # 17 cases
scripts/assets/.venv/bin/python scripts/assets/assetforge/generate_selftest.py   # 16 cases
```

Between them they have been seen RED on four real defects, which is the only reason their
green counts:

1. A residual metric measured pre-despill, so a broken despill and a working one produced
   the same number.
2. **A green halo in the delivered file.** RGBA was downscaled without premultiplying
   alpha, so Lanczos averaged the key colour of fully transparent pixels back into every
   edge pixel. Caught by the first end-to-end run, not by the test.
3. A despill ceiling that resampled up to 46/255 on the delivered edge.
4. **The native route destroyed the provider's cutout.** The keyer reads RGB only, so on
   an already-transparent PNG it computed a fresh matte from colour and returned a fully
   opaque image. Measured: a 71.3% transparent source came back 0% transparent, with
   correct dimensions and format throughout, so nothing downstream could have seen it.

## Emoji: no gate was added here, because one already exists

R084 TASK 4 asked for an emoji sweep. `frontend/scripts/machine_tell_gate.mjs` already
flags the emoji planes, `U+FE0F`, and the symbol, dingbat, arrow and geometric-shape
blocks, carries seeded emoji and dingbat cases, and runs three ways in CI: `--self-test`,
`--source`, and source-and-dist after a build. A second gate for the same class would be
two sources of truth. Verified rather than duplicated; see the session report.
