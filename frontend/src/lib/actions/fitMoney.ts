// fitMoney.ts, JOB 3(e) / TR-066 (2026-07-26).
//
// Renders a money value into a fixed-width slot at a legible size, and falls
// back to the ABBREVIATED form only when the full string physically cannot fit.
// The 400x225 mini-player strip is the only caller, per Fable's ruling closing
// TR-066: full precision everywhere else, abbreviation here and only here.
//
// WHY THIS EXISTS RATHER THAN autofitText.
//
// Two separate defects produced the owner's Popout S capture, in which the WIN
// readout was cut mid-glyph and the BALANCE dropped its cents.
//
//   1. `use:autofitText` was a NO-OP on this profile. The action sets a CSS
//      custom property, --autofit-scale, and the element's own font-size rule
//      has to multiply that property in for anything to happen.
//      `.p-stat-value`, `.c-stat-value` and `.fs-value` all do.
//      `.m-stat-value` did not: it was a flat `font-size: 11px`, so the action
//      wrote a property nothing read, for every day this profile has existed.
//      The comment sitting beside that rule said "autofitText already shrinks
//      the string to fit", which is how it went unnoticed. Fixed with the rule,
//      not here.
//
//   2. Shrinking alone cannot solve it anyway. Measured on the shipped build,
//      the BALANCE stat box at 400x225 is 84.2px wide including its label, so
//      the value has roughly 58px. `$52,431,098.76` needs about 95px at the
//      11px base size. Fitting it means about 0.61 scale, an effective 6.7px,
//      which is not a readable currency figure. Something has to give, and the
//      ruling says what: the least significant digits, in this profile only.
//
// THE DECISION IS MEASURED, NEVER THRESHOLDED. A "abbreviate above $1,000,000"
// rule would be a guess about a pixel width that depends on the currency
// symbol, the locale's separators, the bet ladder in play and whether the brand
// font actually loaded. This measures the real box, in the real build, at the
// real moment, and abbreviates exactly when the full form does not fit.
//
// Usage: <span class="m-stat-value" use:fitMoney={{ full, compact }}></span>
//
// The element is EMPTY in markup on purpose. The action owns its text, because
// the choice of which string to show is the outcome of a measurement that can
// only be taken after layout, and a value Svelte also rendered would fight it.

/**
 * Effective rendered size, in CSS px, below which a currency value on a
 * 400x225 popout stops being readable. "It fits" stops meaning anything once
 * the fit was bought by making the number unreadable.
 *
 * Published onto the element as `data-fit-floor` so the proof asserts against
 * the value the code actually used rather than against a second copy of the
 * number that could drift away from it.
 */
export const MINI_LEGIBLE_FLOOR_PX = 9

/** Matches autofitText, which this mirrors deliberately. */
const MAX_ITERATIONS = 6

export interface FitMoneyValue {
  /** Fully formatted value, e.g. "$52,431,098.76". Always tried first. */
  full: string
  /** Abbreviated fallback, e.g. "$52.43M". Used only when `full` cannot fit. */
  compact: string
  /** Override the legible floor. Omit outside tests. */
  floorPx?: number
}

function overflows(node: HTMLElement): boolean {
  return node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1
}

/**
 * Shrink until the content fits or the floor is reached. Iterative rather than
 * one linear pass for the reason autofitText records: fixed-pixel CSS such as
 * letter-spacing does not shrink with the font, so a single clientWidth /
 * scrollWidth ratio under-corrects.
 *
 * Returns the scale it settled on.
 */
function shrinkToFit(node: HTMLElement, minScale: number): number {
  let scale = 1
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (!overflows(node) || node.clientWidth <= 0) break
    const ratio = node.clientWidth / node.scrollWidth
    const next = Math.max(minScale, scale * ratio * 0.98) // 2% margin per pass
    if (Math.abs(next - scale) < 0.005) break // converged
    scale = next
    node.style.setProperty('--autofit-scale', scale.toFixed(3))
    if (scale <= minScale) break
  }
  return scale
}

export function fitMoney(node: HTMLElement, value: FitMoneyValue) {
  let current = value
  let pending: number | null = null

  function apply(text: string): void {
    if (node.textContent !== text) node.textContent = text
  }

  function measure(): void {
    pending = null
    const floorPx = current.floorPx ?? MINI_LEGIBLE_FLOOR_PX

    // Reset before measuring. A scale left over from the previous value would
    // make this one fit trivially and hide whether it really does.
    node.style.setProperty('--autofit-scale', '1')
    apply(current.full)

    const basePx = parseFloat(getComputedStyle(node).fontSize) || 0
    // A floor above the base size would mean the value cannot render legibly
    // even untouched, so clamp: never scale UP to reach the floor.
    const minScale = basePx > 0 ? Math.min(1, floorPx / basePx) : 1

    let mode: 'full' | 'compact' = 'full'
    let scale = shrinkToFit(node, minScale)

    if (overflows(node)) {
      // The full form cannot fit at the legible floor. This is the exact
      // condition Fable's ruling names, and the only one that licenses
      // abbreviation.
      mode = 'compact'
      node.style.setProperty('--autofit-scale', '1')
      apply(current.compact)
      scale = shrinkToFit(node, minScale)
    }

    node.dataset.fitMode = mode
    node.dataset.fitPx = (basePx * scale).toFixed(2)
    node.dataset.fitFloor = String(floorPx)
  }

  function schedule(): void {
    // Coalesced to one measurement per frame. The HUD win figure counts up at
    // frame rate, so an un-coalesced action would force a synchronous layout
    // several times per frame for the length of every win animation.
    if (pending !== null) cancelAnimationFrame(pending)
    pending = requestAnimationFrame(() => {
      pending = requestAnimationFrame(measure)
    })
  }

  // Paint the full form immediately so the slot is never blank for a frame,
  // then correct it once layout exists.
  apply(current.full)
  schedule()

  return {
    update(next: FitMoneyValue) {
      current = next
      apply(next.full)
      schedule()
    },
    destroy() {
      if (pending !== null) cancelAnimationFrame(pending)
    },
  }
}
