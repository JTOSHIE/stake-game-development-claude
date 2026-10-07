// autofitText.ts, OWNER AUDIT REMEDIATION B1/B2: HUD/win-banner number auto-fit.
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
      // R060 COMPACT TIER (Fable ruling): when even MIN_SCALE cannot fit the
      // string, the element must not double-clip; it switches to the compact
      // form instead. The action cannot swap text it does not own (several
      // consumers render structured children, the banner's digit boxes among
      // them), so it REPORTS: `data-fit-overflow` lands on the node and a
      // `fitoverflow` CustomEvent fires, and a consumer that supplied a
      // compact form re-renders with it, which re-enters this fit through
      // the update hook. Consumers with no compact form keep today's floor.
      const finallyOverflows = node.scrollWidth - node.clientWidth > 1 && node.clientWidth > 0
      const had = node.dataset.fitOverflow === '1'
      if (finallyOverflows !== had) {
        if (finallyOverflows) node.dataset.fitOverflow = '1'
        else delete node.dataset.fitOverflow
        node.dispatchEvent(new CustomEvent('fitoverflow', { detail: { overflowing: finallyOverflows } }))
      }
    })
  })
}

// R153: RE-FIT WHEN A WEB FONT ARRIVES. fit() measures two frames after mount, and a node whose
// face is not loaded yet is measured in the fallback font; when the real face lands the text
// widens and nothing re-measured it. That was latent until R153 moved the hamburger menu's
// MUSIC/SOUND labels from Orbitron to Exo 2: on main those labels fetched Orbitron 700 when the
// menu opened, so the face was already there when PAYTABLE opened from it; on the R153 tip it
// arrived only with the paytable, after the fit, and money_fit_gate caught the Bet Modes prices
// overflowing by 5 to 9px (main passed the same load, measured side by side). So every live node
// is kept in one set, and one `loadingdone` listener re-fits them all whenever a face finishes.
const live = new Set<HTMLElement>()
let listening = false
function onFontsLoaded() {
  for (const node of live) fit(node)
}

export function autofitText(node: HTMLElement, value: unknown) {
  live.add(node)
  if (!listening && typeof document !== 'undefined' && document.fonts?.addEventListener) {
    document.fonts.addEventListener('loadingdone', onFontsLoaded)
    listening = true
  }
  fit(node)
  return {
    update() {
      fit(node)
    },
    destroy() {
      live.delete(node)
    },
  }
}
