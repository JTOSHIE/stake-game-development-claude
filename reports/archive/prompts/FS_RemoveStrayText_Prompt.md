# FUTURE SPINNER — REMOVE STRAY WIN POD TEXT
## One line fix — remove leftover text rendering outside pod
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without stopping

---

## THE FIX

The white "0.2× / 0.00" text is rendering outside the pod div.
This is old CSS text from a previous version that survived in the DOM.

Read WinPod.svelte and confirm the ONLY thing rendered is:

```svelte
{#if isActive}
  <div class="win-pod">
    <img class="pod-frame" ... />
    <div class="pod-content">
      <div class="pod-label">MULTIPLIER</div>
      <div class="pod-mult">{multText}</div>
      <div class="pod-divider"></div>
      <div class="pod-label">WIN</div>
      <div class="pod-amt">{amtText}</div>
    </div>
  </div>
{/if}
```

Nothing outside the `{#if isActive}` block. Nothing else.

Also check App.svelte — confirm there is no second `<WinPod />` instance
and no inline multiplier/win text anywhere near the grid-wrapper:

```bash
grep -n "WinPod\|multiplier\|0\.2\|pod" ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/WinPod.svelte
```

If anything is outside the {#if} block — delete it.

Then build and commit:
```bash
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1 && npm run build 2>&1
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md
cd ~/math-sdk && git add -A
git commit -m "fix(win-pod): remove all stray text outside isActive guard"
git push origin main
```
