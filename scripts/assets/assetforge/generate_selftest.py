#!/usr/bin/env python3
"""Convention (p) self-test for the licence gate, the spend cap and the cost arithmetic.

A client that refused everything would look identical to a working one from its output, so
both directions are seeded: every refusal must be SEEN to fire, and the CLEARED path must
be seen to pass. The cases plant the defect in the form it really occurs:

  the BARRED provider   R099 note: this case used to read the LIVE openai mark, which was
                        BARRED. When Ticket 456254 cleared that mark for development-stage
                        artwork the case broke, because it was asserting on DATA rather than
                        on the CODE PATH. A provider's mark is a fact that can legitimately
                        change; the refusal it triggers must be provable regardless. So the
                        case now seeds a BARRED entry itself, built from the REAL R084
                        assessment the gate still preserves under `superseded_assessment`.
                        Same defect, same wording, same code path, no longer hostage to
                        which provider happens to be barred today.
  the spend cap         seeded by writing a ledger that is already near the cap, which is
                        how a cap is really reached: not by one huge call but by the
                        twentieth small one in an unattended run.
  the absent register   the live state of this repository today, so this case also proves
                        the composer's refusal is real rather than a message nobody reaches.

Run: scripts/assets/.venv/bin/python scripts/assets/assetforge/generate_selftest.py
"""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import generate as G  # noqa: E402
from compose import ComposerRefusal, compose, load_rows  # noqa: E402

SYNTHETIC_REGISTER = {
    "base": "cyberpunk automotive slot symbol, neon rim light, brushed metal",
    "negative": "text, watermark, blurry",
}


def main() -> int:
    results: list[tuple[str, bool, str]] = []

    def rec(name: str, ok: bool, detail: str = "") -> None:
        results.append((name, ok, detail))

    gate = G.load_gate()

    # ---- SEEDED REFUSALS -----------------------------------------------------
    # Seeded from the gate's own preserved R084 assessment, so the planted defect is the
    # real historical one in its real form rather than an invented fixture.
    barred_gate = {"providers": {"openai": dict(gate["providers"]["openai"])}}
    barred_gate["providers"]["openai"].update(
        gate["providers"]["openai"]["superseded_assessment"]
    )
    try:
        G.require_cleared("openai", barred_gate)
        rec("BARRED provider refused", False, "a BARRED-marked provider passed the gate")
    except G.GateRefusal as e:
        rec("BARRED provider refused", "marked BARRED" in str(e) and "real money gambling" in str(e),
            str(e)[:74])

    # And the live openai mark is now CLEARED, scoped by Ticket 456254. Asserted so the
    # unblock itself is covered rather than merely assumed.
    try:
        entry = G.require_cleared("openai", gate)
        rec("openai CLEARED for artwork per Ticket 456254",
            entry["scope"]["ticket"] == "456254", "scoped clearance in force")
    except G.GateRefusal as e:
        rec("openai CLEARED for artwork per Ticket 456254", False, str(e)[:74])

    try:
        G.require_cleared("midjourney", gate)
        rec("unassessed provider refused", False, "an unassessed provider passed")
    except G.GateRefusal as e:
        rec("unassessed provider refused", "never been assessed" in str(e), str(e)[:74])

    try:
        G.load_style_register()
        rec("absent style register refused", False, "a register was loaded from nowhere")
    except ComposerRefusal as e:
        rec("absent style register refused", "does not exist" in str(e), str(e)[:74])

    rows = load_rows()
    for bad_id, cls in (("BR-01", "KEEP"), ("SC-04", "DEAD"), ("DOC-01", "REGEN")):
        try:
            compose(rows[bad_id], SYNTHETIC_REGISTER)
            rec(f"{cls} row refused by composer", False, f"{bad_id} composed")
        except ComposerRefusal as e:
            rec(f"{cls} row refused by composer", cls in str(e), str(e)[:60])

    with tempfile.TemporaryDirectory() as td:
        out = Path(td)
        # Seed a ledger already near the cap, then require the next call to refuse.
        G.ledger_path(out).parent.mkdir(parents=True, exist_ok=True)
        G.ledger_path(out).write_text(json.dumps({"cost_usd": 9.98}) + "\n", encoding="utf-8")
        real_loader = G.load_style_register
        G.load_style_register = lambda *a, **k: SYNTHETIC_REGISTER   # isolate the cap
        try:
            G.generate_one("SY-01", provider="stability", model="sd3.5-large", seed=1,
                           out_dir=out, cap_usd=10.0, dry_run=True)
            rec("spend cap refuses past the limit", False, "a call ran at USD 9.98 of a 10.00 cap")
        except G.GateRefusal as e:
            rec("spend cap refuses past the limit", "session spend cap reached" in str(e), str(e)[:74])
        finally:
            G.load_style_register = real_loader

        rec("ledger totals are read back", abs(G.spent_usd(out) - 9.98) < 1e-9,
            f"spent_usd read {G.spent_usd(out)}")

    # ---- CONTROLS. Without these the refusals above prove nothing. -----------
    try:
        entry = G.require_cleared("stability", gate)
        rec("CLEARED provider passes", entry["mark"] == "CLEARED", "stability CLEARED")
    except G.GateRefusal as e:
        rec("CLEARED provider passes", False, str(e)[:74])

    credits, usd = G.cost_of(gate["providers"]["stability"], "sd3.5-large")
    rec("cost arithmetic from the captured price", credits == 6.5 and abs(usd - 0.065) < 1e-9,
        f"{credits} cr = USD {usd}")
    credits_t, usd_t = G.cost_of(gate["providers"]["stability"], "sd3.5-large-turbo")
    rec("turbo price too", credits_t == 4 and abs(usd_t - 0.04) < 1e-9, f"{credits_t} cr = USD {usd_t}")

    spec = compose(rows["SY-01"], SYNTHETIC_REGISTER)
    rec("composer oversamples to twice delivery", spec["generate_dims"] == [480, 480],
        f"delivery {spec['delivery_dims']} -> generate {spec['generate_dims']}")
    rec("alpha row asks for a chroma field", "chroma-key green" in spec["prompt"],
        "green field requested")
    spec_bg = compose(rows["SC-01"], SYNTHETIC_REGISTER)
    rec("opaque row asks for no transparency", "full-bleed opaque" in spec_bg["prompt"],
        "opaque scene requested")
    rec("composer is deterministic",
        compose(rows["SY-01"], SYNTHETIC_REGISTER) == spec, "same inputs, same prompt")
    rec("aspect picker rounds to a supported ratio",
        G._nearest_aspect(3840, 2160) == "16:9" and G._nearest_aspect(480, 480) == "1:1",
        f"3840x2160 -> {G._nearest_aspect(3840,2160)}, 480x480 -> {G._nearest_aspect(480,480)}")

    print("ASSETFORGE GENERATE SELF-TEST\n")
    for name, ok, detail in results:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name:38s} {detail}")
    failed = [n for n, ok, _ in results if not ok]
    print()
    if failed:
        print(f"SELF-TEST FAILED: {len(failed)} of {len(results)}: {', '.join(failed)}")
        return 1
    print(f"SELF-TEST PASSED: {len(results)}/{len(results)} cases, every seeded refusal fired "
          f"and every control held.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
