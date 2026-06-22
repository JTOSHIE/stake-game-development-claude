#!/usr/bin/env python3
"""
Live RGS endpoint test for Future Spinner: authenticate, play, end-round.

This exercises the exact request shapes the game's rgsService.ts uses against a
real Stake Engine RGS, using only the Python standard library (no install
needed). Run it once the game is deployed to staging and you have the launch
parameters (rgs_url and sessionID) from the Stake portal.

Usage:
  python3 rgs_endpoint_test.py --rgs-url https://<staging-rgs-host> --session <SESSION_ID>
  # or via environment:
  RGS_URL=... RGS_SESSION=... python3 rgs_endpoint_test.py

Contract (from frontend/src/lib/services/rgsService.ts):
  POST {rgs_url}/wallet/authenticate   {"sessionID": ...}
       -> {balance, minBet, maxBet, stepBet, betLevels[], currency, round}   (micros)
  POST {rgs_url}/wallet/play           {"sessionID": ..., "amount": "<micros>"}
       -> {events[], balance, roundId, win}                                   (micros)
  POST {rgs_url}/wallet/end-round      {"sessionID": ..., "roundId": ...}     (only if win > 0)
       -> {balance, roundId}
All requests: Content-Type application/json. Money is integer micros (1.0 = 1_000_000).
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

CURRENCY_SCALE = 1_000_000


def post(url, body, timeout=20):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except Exception:
            return e.code, {"error": "non-json", "status": e.code}
    except Exception as e:
        return None, {"error": "transport", "detail": str(e)}


def show(step, status, body):
    print(f"\n--- {step} --- HTTP {status}")
    print(json.dumps(body, indent=2)[:1200])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rgs-url", default=os.environ.get("RGS_URL"))
    ap.add_argument("--session", default=os.environ.get("RGS_SESSION"))
    ap.add_argument("--amount", type=int, default=None,
                    help="bet amount in micros; default = authenticate minBet")
    args = ap.parse_args()

    if not args.rgs_url or not args.session:
        print("ERROR: provide --rgs-url and --session (or RGS_URL / RGS_SESSION env).")
        sys.exit(2)

    rgs = args.rgs_url.rstrip("/")
    sid = args.session
    print(f"RGS: {rgs}\nsession: {sid[:8]}...")

    # 1. authenticate
    st, auth = post(f"{rgs}/wallet/authenticate", {"sessionID": sid})
    show("authenticate", st, auth)
    if st != 200 or "balance" not in auth:
        print("\nVERDICT: FAIL at authenticate (no valid session or schema mismatch).")
        sys.exit(1)
    bal = auth["balance"] / CURRENCY_SCALE
    print(f"  balance={bal:.2f} {auth.get('currency')}  betLevels={auth.get('betLevels')}")

    amount = args.amount if args.amount is not None else auth.get("minBet", CURRENCY_SCALE)

    # 2. play
    st, play = post(f"{rgs}/wallet/play", {"sessionID": sid, "amount": str(amount)})
    show("play", st, play)
    if st != 200 or "roundId" not in play:
        print("\nVERDICT: FAIL at play.")
        sys.exit(1)
    win = play.get("win", 0)
    print(f"  roundId={play['roundId']}  win={win/CURRENCY_SCALE:.2f}  events={len(play.get('events', []))}")

    # 3. end-round (only on a win, matching the game's flow)
    if win and win > 0:
        st, end = post(f"{rgs}/wallet/end-round", {"sessionID": sid, "roundId": play["roundId"]})
        show("end-round", st, end)
        if st != 200:
            print("\nVERDICT: FAIL at end-round.")
            sys.exit(1)
        print(f"  post-credit balance={end.get('balance', 0)/CURRENCY_SCALE:.2f}")
    else:
        print("\n(end-round skipped: zero-win round, closed automatically by the RGS)")

    print("\nVERDICT: PASS, authenticate, play"
          + (", end-round" if win and win > 0 else "") + " completed against the live RGS.")


if __name__ == "__main__":
    main()
