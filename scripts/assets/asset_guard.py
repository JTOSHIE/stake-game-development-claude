#!/usr/bin/env python3
"""asset_guard.py - refuses to regenerate assets over uncommitted asset work (R101).

WHY THIS EXISTS, and the number was measured rather than argued. `npm run assets` chains
THREE generators, build.py then flame_jets.py then symbol_fx.py, and every one of them
writes straight into frontend/public/assets/themes/future-spinner/ with no check of any
kind. R101 ran that chain against a COPY of the working tree and diffed by sha256:

    16 of the 27 arc-2 placeholder rasters were overwritten with different bytes
    17 files absent from HEAD were created

Nothing warned, nothing prompted, and the exit code was 0. A session that ran the command
to refresh one icon would have destroyed the whole visual test set and been told it
succeeded. That is the defect this module exists to make impossible.

R097 predicted the same hazard from reading build.py as text and put the second figure at
15. It was 17. The two it could not see, l2_fuse_static.png and m3_flame_static.png, are
written by symbol_fx.py, the THIRD script in the chain, which does not even name them in
its own summary line. The lesson is in this module's design: the guard is called by all
three generators, not by the one that was easiest to read.

WHAT IT PROTECTS, and deliberately no more. Only TRACKED files under the asset output root
that differ from HEAD, which is exactly the set that carries unrecoverable work. Untracked
files there are not guarded: creating a file destroys nothing, and refusing on untracked
output would make the guard fire on its own generators' normal products.

Usage in a generator, as the first statement of main():

    from asset_guard import require_clean_outputs
    require_clean_outputs("build.py")

THE OVERRIDE IS AN ENVIRONMENT VARIABLE, and that is a deliberate choice rather than a
convenience. None of the three generators takes command-line arguments, so a --force flag
would have to be added to all three and would still only guard the npm route: a session
running `python scripts/assets/build.py` directly would sail past it. An env var read
inside the guard covers every route into the code, which is the property that matters.

    ALLOW_ASSETS_OVERWRITE=1 npm run assets

Self-test, convention (p): builds a REAL throwaway git repository, commits a real asset
file, dirties it, and requires the refusal to fire, plus the override and clean-tree
controls. The git plumbing is where a status-parsing guard actually goes wrong, so the
plumbing is what is tested.

    scripts/assets/.venv/bin/python scripts/assets/asset_guard.py --self-test
"""

import os
import subprocess
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO = os.path.dirname(os.path.dirname(_HERE))

# The one tree the three generators write into. Kept as a constant rather than derived from
# manifest.json's output_root so the guard cannot be disarmed by editing the manifest.
OUTPUT_ROOT = "frontend/public/assets/themes/future-spinner"

OVERRIDE_ENV = "ALLOW_ASSETS_OVERWRITE"

# Status codes that mean a tracked file carries work not in HEAD. 'M' modified, 'D' deleted,
# 'R' renamed, 'C' copied, 'A' added-to-index. '?' (untracked) is deliberately absent: see
# the module docstring. 'U' (unmerged) is included because a regeneration during a conflict
# would discard the resolution.
_AT_RISK_CODES = set("MDRCAU")


class DirtyAssetsError(RuntimeError):
    """Regenerating would overwrite tracked asset work that is not in HEAD."""


def _porcelain(repo, output_root):
    """git status --porcelain for one subtree. Returns None if git cannot answer."""
    try:
        out = subprocess.run(
            ["git", "-C", repo, "status", "--porcelain", "--", output_root],
            capture_output=True, text=True, timeout=60,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if out.returncode != 0:
        return None
    return out.stdout


def at_risk(repo=_REPO, output_root=OUTPUT_ROOT):
    """Tracked files under output_root that differ from HEAD, as (code, path) pairs.

    Returns [] when the tree is clean, and None when git could not be consulted at all,
    which the caller must distinguish: an empty list is a measurement, None is ignorance.
    """
    raw = _porcelain(repo, output_root)
    if raw is None:
        return None
    found = []
    for line in raw.splitlines():
        if len(line) < 4:
            continue
        code, path = line[:2], line[3:]
        if "?" in code:                      # untracked: nothing to lose
            continue
        if not (_AT_RISK_CODES & set(code.strip())):
            continue
        if " -> " in path:                   # rename: the destination is what gets clobbered
            path = path.split(" -> ", 1)[1]
        found.append((code.strip(), path.strip().strip('"')))
    return sorted(found)


def require_clean_outputs(caller="the asset pipeline", repo=_REPO,
                          output_root=OUTPUT_ROOT, env=None):
    """Refuse to run when tracked asset files differ from HEAD. The default is SAFE."""
    env = os.environ if env is None else env
    override = str(env.get(OVERRIDE_ENV, "")).strip()

    risky = at_risk(repo, output_root)

    if risky is None:
        # Git could not be consulted. There is then no uncommitted work to protect, because
        # uncommitted is a git word, so this proceeds. It says so loudly rather than
        # silently, because silence is the whole failure this module answers.
        print(f"[asset_guard] NOTE: git could not be consulted about {output_root}, so no "
              f"uncommitted asset work could be detected. Proceeding.", file=sys.stderr)
        return

    if not risky:
        return

    if override and override != "0":
        print(f"[asset_guard] {OVERRIDE_ENV}={override} set: proceeding over "
              f"{len(risky)} modified asset file(s). They will be overwritten.",
              file=sys.stderr)
        return

    listing = "\n".join(f"    {code:<2} {path}" for code, path in risky[:40])
    more = "" if len(risky) <= 40 else f"\n    ... and {len(risky) - 40} more"
    raise DirtyAssetsError(
        f"REFUSED: {caller} would overwrite {len(risky)} asset file(s) that differ from "
        f"HEAD and are not committed. Regenerating would destroy that work with no way "
        f"back, because it exists nowhere else.\n\n"
        f"{listing}{more}\n\n"
        f"  To keep the work:      commit or stash it, then re-run.\n"
        f"  To see what changed:   git status -- {output_root}\n"
        f"  To discard it anyway:  {OVERRIDE_ENV}=1 <your command>\n\n"
        f"Nothing has been written."
    )


def guard_or_exit(caller="the asset pipeline", **kwargs):
    """require_clean_outputs for a command-line generator: a clean message, exit code 2.

    The raising form is kept for the self-test and for any caller that wants to handle the
    condition. A generator run by a person should not answer a foreseeable, correctable
    situation with a stack trace, so this is what the three generators call.
    """
    try:
        require_clean_outputs(caller, **kwargs)
    except DirtyAssetsError as exc:
        print(f"\n{exc}\n", file=sys.stderr)
        raise SystemExit(2)


# ---------------------------------------------------------------------------------------
# Convention (p) self-test. Seeds the defect in the form it really occurs: a tracked asset
# raster modified in the working tree, in a real git repository.
# ---------------------------------------------------------------------------------------

def _selftest():
    import shutil
    import tempfile

    results = []

    def rec(name, ok, detail=""):
        results.append((name, ok, detail))

    def git(repo, *args):
        subprocess.run(["git", "-C", repo, *args], check=True,
                       capture_output=True, text=True)

    tmp = tempfile.mkdtemp(prefix="asset_guard_selftest_")
    try:
        repo = os.path.join(tmp, "repo")
        assets = os.path.join(repo, OUTPUT_ROOT, "symbols")
        os.makedirs(assets)
        git_dir_init = ["init", "-q", "-b", "main"]
        subprocess.run(["git", "-C", repo, *git_dir_init], check=True,
                       capture_output=True, text=True)
        git(repo, "config", "user.email", "selftest@example.invalid")
        git(repo, "config", "user.name", "asset guard self-test")

        wild = os.path.join(assets, "wild.png")
        untracked = os.path.join(assets, "brand_mark.png")
        with open(wild, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"committed pixels")
        git(repo, "add", "--", os.path.join(OUTPUT_ROOT, "symbols", "wild.png"))
        git(repo, "commit", "-q", "-m", "seed a committed asset")

        # CONTROL FIRST. A clean tree must pass, or every refusal below proves nothing.
        try:
            require_clean_outputs("selftest", repo=repo, env={})
            rec("clean tree passes", True, "no refusal on a clean tree")
        except DirtyAssetsError as e:
            rec("clean tree passes", False, str(e)[:70])

        # An untracked file in the output tree must NOT trip the guard: creating a file
        # destroys nothing, and the generators create files as their normal product.
        with open(untracked, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"a file the build would emit")
        try:
            require_clean_outputs("selftest", repo=repo, env={})
            rec("untracked output does not trip the guard", True, "untracked ignored")
        except DirtyAssetsError as e:
            rec("untracked output does not trip the guard", False, str(e)[:70])

        # THE SEEDED DEFECT, in the form it really occurs: a tracked placeholder raster
        # replaced in the working tree and not committed. This is exactly the state the
        # 27 arc-2 placeholders are in.
        with open(wild, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"placeholder pixels nobody committed")
        try:
            require_clean_outputs("selftest", repo=repo, env={})
            rec("dirty tracked asset REFUSED by default", False,
                "the guard let a destructive run through")
        except DirtyAssetsError as e:
            msg = str(e)
            rec("dirty tracked asset REFUSED by default",
                "REFUSED" in msg and "wild.png" in msg and OVERRIDE_ENV in msg,
                "refusal names the file and the override")

        # The override must work, and must be explicit.
        try:
            require_clean_outputs("selftest", repo=repo, env={OVERRIDE_ENV: "1"})
            rec("explicit override proceeds", True, f"{OVERRIDE_ENV}=1 allowed the run")
        except DirtyAssetsError as e:
            rec("explicit override proceeds", False, str(e)[:70])

        # ...and an unset-shaped value must NOT count as an override, or a stray empty
        # export in a shell profile would silently disarm the guard for good.
        for falsey in ("", "0"):
            try:
                require_clean_outputs("selftest", repo=repo, env={OVERRIDE_ENV: falsey})
                rec(f"{OVERRIDE_ENV}={falsey!r} does NOT disarm the guard", False,
                    "a falsey override disarmed it")
            except DirtyAssetsError:
                rec(f"{OVERRIDE_ENV}={falsey!r} does NOT disarm the guard", True, "still refused")

        # A DELETED tracked asset is at risk too: regeneration would resurrect it and the
        # deliberate deletion would be lost. Restoring the committed bytes returns the tree
        # to clean WITHOUT a commit, because committing an identical file is not a no-op,
        # it is an error, which is the kind of git detail a hand-made fixture never meets.
        with open(wild, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"committed pixels")
        os.remove(wild)
        try:
            require_clean_outputs("selftest", repo=repo, env={})
            rec("deleted tracked asset REFUSED", False, "a deletion was not protected")
        except DirtyAssetsError as e:
            rec("deleted tracked asset REFUSED", "wild.png" in str(e), "deletion protected")

        # Scope control: dirt OUTSIDE the asset output root must not block a build. A guard
        # that fires on an unrelated edit would be turned off within a week.
        os.makedirs(os.path.join(repo, "frontend", "src"), exist_ok=True)
        elsewhere = os.path.join(repo, "frontend", "src", "App.svelte")
        with open(elsewhere, "w") as fh:
            fh.write("committed\n")
        git(repo, "add", "--", "frontend/src/App.svelte")
        git(repo, "commit", "-q", "-m", "seed a non-asset file")
        # Restore the asset to its committed bytes so the asset tree is clean again. No
        # commit: the content already matches HEAD, so there is nothing to record.
        with open(wild, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"committed pixels")
        os.remove(untracked)
        with open(elsewhere, "w") as fh:
            fh.write("edited outside the asset tree\n")
        try:
            require_clean_outputs("selftest", repo=repo, env={})
            rec("dirt outside the asset root is ignored", True, "scope held")
        except DirtyAssetsError as e:
            rec("dirt outside the asset root is ignored", False, str(e)[:70])

        # And ignorance is distinguished from cleanliness: a non-repository yields None.
        rec("non-repository returns None, not []",
            at_risk(repo=tmp + "/not-a-repo") is None, "ignorance is not cleanliness")

        # THE --require-clean CLI, exercised as a real SUBPROCESS, because that is how the
        # Node caller uses it. A function that works when imported proves nothing about an
        # exit code a different language reads.
        with open(wild, "wb") as fh:
            fh.write(b"\x89PNG\r\n\x1a\n" + b"dirty again for the CLI case")
        cli = [sys.executable, os.path.abspath(__file__), "--require-clean",
               "--repo", repo, "--caller", "a node caller"]
        run = subprocess.run(cli, capture_output=True, text=True,
                             env={k: v for k, v in os.environ.items()
                                  if k != OVERRIDE_ENV})
        rec("--require-clean exits 2 on a dirty tree",
            run.returncode == 2 and "REFUSED" in run.stderr,
            f"exit {run.returncode}, refusal on stderr")
        run_ok = subprocess.run(cli, capture_output=True, text=True,
                                env={**os.environ, OVERRIDE_ENV: "1"})
        rec("--require-clean exits 0 under the override",
            run_ok.returncode == 0, f"exit {run_ok.returncode}")

    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("ASSET GUARD SELF-TEST\n")
    for name, ok, detail in results:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name:48s} {detail}")
    failed = [n for n, ok, _ in results if not ok]
    print()
    if failed:
        print(f"SELF-TEST FAILED: {len(failed)} of {len(results)}: {', '.join(failed)}")
        return 1
    print(f"SELF-TEST PASSED: {len(results)}/{len(results)} cases, the seeded destructive "
          f"run was refused and every control held.")
    return 0


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        raise SystemExit(_selftest())
    if "--require-clean" in sys.argv:
        # Exit 2 with the refusal if the asset tree is dirty, 0 otherwise. This is the entry
        # point for NON-PYTHON writers, so that a Node generator enforces the same rule
        # through the same code rather than through a second implementation that can drift.
        # R102 added it for frontend/scripts/regen_interface_guide_icons.mjs, which
        # screenshots the live controls straight into the shipped ui/ directory.
        caller, repo = "the caller", _REPO
        for i, a in enumerate(sys.argv):
            if a == "--caller" and i + 1 < len(sys.argv):
                caller = sys.argv[i + 1]
            if a == "--repo" and i + 1 < len(sys.argv):
                repo = sys.argv[i + 1]      # for the self-test; production callers omit it
        guard_or_exit(caller, repo=repo)
        raise SystemExit(0)
    risky = at_risk()
    if risky is None:
        print("asset_guard: git could not be consulted")
    else:
        print(f"asset_guard: {len(risky)} tracked asset file(s) differ from HEAD under "
              f"{OUTPUT_ROOT}")
        for code, path in risky:
            print(f"  {code:<2} {path}")
