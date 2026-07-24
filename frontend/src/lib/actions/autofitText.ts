// autofitText.ts — OWNER AUDIT REMEDIATION B1/B2: HUD/win-banner number auto-fit.
//
// A Svelte action that shrinks an element's font-size (via a CSS custom
// property, --autofit-scale, multiplied into the element's own font-size
// rule) just enough that its content fits its own box width, so values up
// to $999,999.99 (HUD plates) / $1,000,000.00 (win banner) never truncate
// or overflow. Re-measures whenever the watched value changes (the
// action's `update` hook), not just once on mount.
//
// Usage: <span class="p-stat-value" use:autofitText={displayText}>{displayText}</span>

const MIN_SCALE = 0.4
const MAX_ITERATIONS = 6

function fit(node: HTMLElement) {
  // Reset before measuring - a previously-applied shrink would make the
  // element FIT trivially, hiding whether the natural (1.0) size overflows.
  node.style.setProperty('--autofit-scale', '1')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Iterative, not a single linear-ratio pass: fixed-pixel CSS (e.g.
      // letter-spacing: 2px) doesn't shrink proportionally with font-size,
      // so a one-shot clientWidth/scrollWidth ratio can under-correct -
      // confirmed the hard way (one pass left a real ~14px overflow on a
      // 13-character amount). Re-measure after each adjustment instead.
      let scale = 1
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const overflow = node.scrollWidth - node.clientWidth
        if (overflow <= 0 || node.clientWidth <= 0) break
        const ratio = node.clientWidth / node.scrollWidth
        const nextScale = Math.max(MIN_SCALE, scale * ratio * 0.98) // 2% margin per pass
        if (Math.abs(nextScale - scale) < 0.005) break // converged
        scale = nextScale
        node.style.setProperty('--autofit-scale', scale.toFixed(3))
        if (scale <= MIN_SCALE) break
      }
    })
  })
}

export function autofitText(node: HTMLElement, value: unknown) {
  fit(node)
  return {
    update() {
      fit(node)
    },
  }
}
