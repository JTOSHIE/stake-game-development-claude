#!/usr/bin/env python3
"""Hosted-API image client. The licence gate and the spend cap are enforced here, not remembered.

No model, no weight and no UI installs on the owner's machine: this is a thin HTTP client
over provider APIs, per the R084 constraint on record.

FOUR THINGS THIS REFUSES TO DO, each because remembering is not a control:

  A PROVIDER IT HAS NO CLIENT FOR. See CLIENTS below. A licence mark says a provider MAY
  be called; it does not say this module knows HOW. Those are different questions and
  conflating them sends an API key to the wrong vendor.

  A BARRED PROVIDER. provider_gate.json carries the R084 TASK 0 marks and this module
  reads them on every call. OpenAI is BARRED because its Usage Policies prohibit "real
  money gambling" and its Services Agreement makes them contractually binding. A client
  that merely omitted OpenAI would silently become wrong the day somebody added it back;
  one that refuses by mark stays right.

  SPENDING PAST THE CAP. The session cap is USD 10 by default and is checked BEFORE each
  call against the ledger's running total, not after. Spending is the owner's under rule
  1, so the cap is the mechanism that keeps an unattended run from becoming a decision.

  GENERATING WITHOUT PROVENANCE. Every call appends provider, model, the full prompt and
  negative, every parameter, the seed, the request id and the cost to a ledger before the
  image is considered delivered. An asset whose prompt nobody recorded cannot be
  regenerated, and convention (l) makes that a committed artefact rather than a habit.

Outputs go to a gitignored scratch directory; only an owner-approved asset is ever copied
into the shipped tree.

Run: scripts/assets/.venv/bin/python scripts/assets/assetforge/generate.py --id SY-01 [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compose import ComposerRefusal, compose, load_rows, load_style_register  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
GATE = Path(__file__).resolve().parent / "provider_gate.json"
DEFAULT_OUT = REPO / ".scratch" / "assetforge" / "generate"
DEFAULT_CAP_USD = 10.0

STABILITY_ENDPOINT = "https://api.stability.ai/v2beta/stable-image/generate/sd3"


class GateRefusal(Exception):
    """A licence, credential or spend rule refused the call. Nothing was sent."""


def load_gate(path: Path = GATE) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def require_cleared(provider: str, gate: dict) -> dict:
    entry = gate["providers"].get(provider)
    if entry is None:
        raise GateRefusal(f"{provider!r} is not in provider_gate.json; it has never been assessed")
    if entry["mark"] != "CLEARED":
        raise GateRefusal(
            f"{provider} is marked {entry['mark']} by the R084 licence gate and no call "
            f"will be made. Reason: {entry['reason']} Evidence: {', '.join(entry['evidence'])}. "
            f"Changing this mark is a Fable ruling, not a code edit."
        )
    return entry


def ledger_path(out_dir: Path) -> Path:
    return out_dir / "generation_ledger.jsonl"


def spent_usd(out_dir: Path) -> float:
    p = ledger_path(out_dir)
    if not p.exists():
        return 0.0
    total = 0.0
    for line in p.read_text(encoding="utf-8").splitlines():
        if line.strip():
            total += json.loads(line).get("cost_usd", 0.0)
    return round(total, 6)


def cost_of(entry: dict, model: str) -> tuple[float, float]:
    m = entry["models"].get(model)
    if m is None or "credits" not in m:
        raise GateRefusal(f"{model!r} has no committed credit price in provider_gate.json")
    credits = float(m["credits"])
    return credits, round(credits * float(entry["credit_usd"]), 6)


def stability_generate(spec: dict, model: str, api_key: str, seed: int) -> tuple[bytes, str]:
    """One Stability call. Returns the image bytes and the request id."""
    w, h = spec["generate_dims"]
    fields = {
        "prompt": spec["prompt"],
        "negative_prompt": spec["negative_prompt"],
        "model": model,
        "mode": "text-to-image",
        "aspect_ratio": _nearest_aspect(w, h),
        "seed": str(seed),
        "output_format": "png",
    }
    boundary = "----assetforge"
    body = b""
    for k, v in fields.items():
        body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n").encode()
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        STABILITY_ENDPOINT, data=body, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Accept": "image/*",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return resp.read(), resp.headers.get("x-request-id", "")


def _nearest_aspect(w: int, h: int) -> str:
    """Stability takes an aspect ratio, not arbitrary dimensions, so the request states the
    nearest supported one and the exact delivery size is reached by the ingest downscale."""
    supported = {"1:1": 1.0, "16:9": 16/9, "9:16": 9/16, "3:2": 1.5, "2:3": 2/3,
                 "4:5": 0.8, "5:4": 1.25, "21:9": 21/9, "9:21": 9/21}
    target = w / h
    return min(supported, key=lambda k: abs(supported[k] - target))


# One client per provider, and a provider with no entry here is REFUSED rather than routed
# to somebody else's endpoint. Added R100. Until then generate_one called stability_generate
# unconditionally, with no branch on provider, which was correct while Stability was the only
# CLEARED provider and became a hazard the moment a second one was cleared: R099 cleared
# OpenAI, and an offline probe at R100 confirmed that a priced OpenAI call would have POSTed
# OPENAI_API_KEY to api.stability.ai with model=gpt-image-1. Sending a credential to the wrong
# vendor is not a near miss, so the refusal is structural rather than a note in a README.
CLIENTS = {"stability": stability_generate}


def require_client(provider: str, entry: dict):
    client = CLIENTS.get(provider)
    if client is None:
        raise GateRefusal(
            f"{provider!r} passes the licence gate but this module has no client for it, so "
            f"no call will be made. Implemented: {', '.join(sorted(CLIENTS))}. Refusing rather "
            f"than falling through to another provider's endpoint, which would send "
            f"{entry.get('env_key', 'the API key')} to the wrong vendor. Implementing a client "
            f"is a code change, not a gate edit."
        )
    return client


def generate_one(manifest_id: str, *, provider: str, model: str, seed: int,
                 out_dir: Path, cap_usd: float, dry_run: bool) -> dict:
    gate = load_gate()
    entry = require_cleared(provider, gate)
    client = require_client(provider, entry)

    register = load_style_register()               # refuses if absent
    rows = load_rows()
    if manifest_id not in rows:
        raise GateRefusal(f"no manifest row {manifest_id!r}")
    spec = compose(rows[manifest_id], register)

    credits, cost = cost_of(entry, model)
    already = spent_usd(out_dir)
    if already + cost > cap_usd:
        raise GateRefusal(
            f"session spend cap reached: USD {already:.3f} already spent, this call costs "
            f"{cost:.3f}, cap is {cap_usd:.2f}. Raising the cap is the owner's call under rule 1."
        )

    api_key = os.environ.get(entry["env_key"], "")
    if not api_key and not dry_run:
        raise GateRefusal(
            f"{entry['env_key']} is not set in the environment. Keys are read from env and "
            f"never committed. Re-run with --dry-run to exercise everything up to the call."
        )

    print(f"  {manifest_id}: {provider}/{model}  {credits} cr = USD {cost:.3f}  "
          f"(session {already:.3f} of {cap_usd:.2f})")

    out_dir.mkdir(parents=True, exist_ok=True)
    record = {
        "utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "provider": provider, "model": model,
        "manifest_id": manifest_id, "manifest_path": spec["manifest_path"],
        "prompt": spec["prompt"], "negative_prompt": spec["negative_prompt"],
        "generate_dims": spec["generate_dims"], "delivery_dims": spec["delivery_dims"],
        "aspect_ratio": _nearest_aspect(*spec["generate_dims"]),
        "seed": seed, "cost_credits": credits, "cost_usd": cost, "dry_run": dry_run,
    }

    if dry_run:
        record["request_id"] = ""
        record["cost_usd"] = 0.0        # a dry run spends nothing and must not consume cap
        record["image"] = None
    else:
        try:
            img, req_id = client(spec, model, api_key, seed)
        except urllib.error.HTTPError as exc:
            raise GateRefusal(f"{provider} returned HTTP {exc.code}: {exc.read()[:200]!r}") from exc
        dest = out_dir / f"{manifest_id}_{provider}_{model}_seed{seed}.png"
        dest.write_bytes(img)
        record["request_id"] = req_id
        record["image"] = str(dest)

    with ledger_path(out_dir).open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
    return record


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--id", dest="ids", action="append", required=True)
    ap.add_argument("--provider", default="stability")
    ap.add_argument("--model", default="sd3.5-large")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--cap-usd", type=float, default=DEFAULT_CAP_USD)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    out_dir = Path(args.out)
    ok = 0
    for i in args.ids:
        try:
            generate_one(i, provider=args.provider, model=args.model, seed=args.seed,
                         out_dir=out_dir, cap_usd=args.cap_usd, dry_run=args.dry_run)
            ok += 1
        except (GateRefusal, ComposerRefusal) as exc:
            print(f"  [REFUSED] {i}: {exc}", file=sys.stderr)
    print(f"\nGENERATE: {ok} of {len(args.ids)} produced, session spend USD "
          f"{spent_usd(out_dir):.3f} of cap {args.cap_usd:.2f}")
    return 0 if ok == len(args.ids) else 2


if __name__ == "__main__":
    raise SystemExit(main())
