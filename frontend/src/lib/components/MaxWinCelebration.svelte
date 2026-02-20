<script lang="ts">
  /**
   * MaxWinCelebration.svelte — Dedicated full-screen overlay for the 5,000× wincap.
   *
   * Requires the player to explicitly click COLLECT to dismiss.
   * While visible, auto-play is already halted by App.svelte.
   * z-index 150 — above game UI (50) and PaytableModal (100), below LoadingScreen (200).
   */

  import { createEventDispatcher, onDestroy } from 'svelte'

  export let show: boolean = false

  const dispatch = createEventDispatcher<{ collect: void }>()

  // ── Particles ────────────────────────────────────────────────────────────────

  interface Particle {
    x:     number   // % left
    y:     number   // % top
    size:  number   // px
    delay: number   // s
    dur:   number   // s
    color: string
    angle: number   // deg — used for radial burst direction
  }

  const COLORS = [
    '#ffd700', '#ffec80', '#fff4c0',  // gold tones
    '#00ffff', '#80ffff',              // cyan
    '#ff00ff', '#ff88ff',              // magenta
    '#ffffff',                          // white flash
  ]

  function makeParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
      x:     10 + Math.random() * 80,
      y:     10 + Math.random() * 80,
      size:  4  + Math.random() * 10,
      delay: Math.random() * 1.6,
      dur:   1.0 + Math.random() * 1.4,
      color: COLORS[i % COLORS.length],
      angle: Math.random() * 360,
    }))
  }

  let particles: Particle[] = []
  $: if (show) particles = makeParticles(90)
  $: if (!show) particles = []

  // ── Keyboard dismiss ─────────────────────────────────────────────────────────
  function handleKey(e: KeyboardEvent): void {
    if (show && e.key === 'Enter') collect()
  }

  function collect(): void {
    dispatch('collect')
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if show}
  <div class="max-win-overlay" role="dialog" aria-modal="true" aria-label="Max Win reached">

    <!-- Rotating halo ring behind everything -->
    <div class="halo-ring" aria-hidden="true"></div>

    <!-- Particle field -->
    {#each particles as p}
      <div
        class="particle"
        style="
          left:{p.x}%;
          top:{p.y}%;
          width:{p.size}px;
          height:{p.size}px;
          background:{p.color};
          box-shadow:0 0 {Math.round(p.size)}px {p.color};
          animation-delay:{p.delay}s;
          animation-duration:{p.dur}s;
          --angle:{p.angle}deg;
        "
        aria-hidden="true"
      ></div>
    {/each}

    <!-- Content -->
    <div class="content">

      <div class="crown" aria-hidden="true">★ ★ ★</div>

      <h1 class="headline">MAX WIN<br>REACHED!</h1>

      <div class="multiplier-wrap">
        <span class="multiplier-value">5,000</span><span class="multiplier-x">×</span>
        <span class="multiplier-label">BET</span>
      </div>

      <button class="collect-btn" on:click={collect} aria-label="Collect max win">
        COLLECT
      </button>

      <p class="hint" aria-live="polite">Press COLLECT or hit Enter to continue</p>

    </div>
  </div>
{/if}

<style>
  /* ── Overlay ────────────────────────────────────────────────────────────── */
  .max-win-overlay {
    position: fixed;
    inset: 0;
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(
      ellipse at center,
      rgba(20, 8, 50, 0.97) 0%,
      rgba(6, 4, 20, 0.99) 100%
    );
  }

  /* ── Rotating halo ring ─────────────────────────────────────────────────── */
  .halo-ring {
    position: absolute;
    inset: -10%;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      rgba(255, 215, 0, 0.07) 15%,
      rgba(0, 255, 255, 0.10) 30%,
      rgba(255, 0, 255, 0.07) 45%,
      transparent 60%,
      rgba(255, 215, 0, 0.05) 75%,
      rgba(0, 255, 255, 0.08) 90%,
      transparent 100%
    );
    animation: halo-spin 6s linear infinite;
    pointer-events: none;
  }

  @keyframes halo-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Particles ──────────────────────────────────────────────────────────── */
  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: burst-out 1s ease-out forwards;
  }

  @keyframes burst-out {
    0%   { transform: scale(1.5) translate(0, 0);                      opacity: 1;   }
    40%  { transform: scale(2.2) translate(0, -18px);                  opacity: 0.9; }
    100% { transform: scale(0)   translate(calc(cos(var(--angle)) * 80px), calc(sin(var(--angle)) * -120px)); opacity: 0; }
  }

  /* ── Content container ──────────────────────────────────────────────────── */
  .content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 0 1.5rem;
    text-align: center;
    animation: content-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes content-enter {
    0%   { opacity: 0; transform: scale(0.4);  }
    60%  { opacity: 1; transform: scale(1.08); }
    100% {             transform: scale(1.0);  }
  }

  /* ── Crown stars ────────────────────────────────────────────────────────── */
  .crown {
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    color: #ffd700;
    letter-spacing: 0.4em;
    text-shadow:
      0 0 10px rgba(255, 215, 0, 0.9),
      0 0 22px rgba(255, 200, 0, 0.6);
    animation: crown-pulse 1.4s ease-in-out infinite alternate;
  }

  @keyframes crown-pulse {
    from { opacity: 0.75; transform: scale(0.97); }
    to   { opacity: 1;    transform: scale(1.04); }
  }

  /* ── Headline ───────────────────────────────────────────────────────────── */
  .headline {
    font-family: Impact, 'Arial Black', 'Segoe UI Black', system-ui, sans-serif;
    font-size: clamp(3rem, 13vw, 7.5rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fffbe0;
    /* Multi-layer gold + cyan neon corona */
    text-shadow:
      0 0  4px #ffffff,
      0 0 12px #ffd700,
      0 0 28px rgba(255, 200, 0, 1),
      0 0 55px rgba(255, 140, 0, 0.9),
      0 0 90px rgba(0,  220, 255, 0.5),
      0 0 140px rgba(0, 180, 255, 0.3),
      0 5px 0   rgba(0, 0, 0, 0.8);
    animation: headline-glow 2s ease-in-out infinite alternate;
  }

  @keyframes headline-glow {
    from {
      text-shadow:
        0 0  4px #ffffff,
        0 0 12px #ffd700,
        0 0 28px rgba(255, 200, 0, 1),
        0 0 55px rgba(255, 140, 0, 0.9),
        0 0 90px rgba(0,  220, 255, 0.5),
        0 0 140px rgba(0, 180, 255, 0.3),
        0 5px 0   rgba(0, 0, 0, 0.8);
    }
    to {
      text-shadow:
        0 0  6px #ffffff,
        0 0 18px #ffd700,
        0 0 38px rgba(255, 220, 0, 1),
        0 0 70px rgba(255, 160, 0, 1),
        0 0 110px rgba(0, 240, 255, 0.65),
        0 0 180px rgba(0, 200, 255, 0.4),
        0 5px 0   rgba(0, 0, 0, 0.8);
    }
  }

  /* ── Multiplier ─────────────────────────────────────────────────────────── */
  .multiplier-wrap {
    display: flex;
    align-items: baseline;
    gap: 0.15em;
    margin-top: 0.2rem;
    animation: multiplier-pulse 1.1s ease-in-out infinite alternate;
  }

  @keyframes multiplier-pulse {
    from { transform: scale(1.0);  }
    to   { transform: scale(1.08); }
  }

  .multiplier-value {
    font-family: 'Courier New', monospace;
    font-size: clamp(3.5rem, 15vw, 9rem);
    font-weight: 900;
    color: #ffd700;
    line-height: 1;
    text-shadow:
      0 0  6px #fffbe0,
      0 0 16px #ffd700,
      0 0 36px rgba(255, 215, 0, 0.9),
      0 0 70px rgba(255, 180, 0, 0.7),
      0 4px 0   rgba(0, 0, 0, 0.7);
  }

  .multiplier-x {
    font-family: Impact, 'Arial Black', system-ui, sans-serif;
    font-size: clamp(2rem, 8vw, 5rem);
    color: #ffc832;
    text-shadow: 0 0 18px rgba(255, 200, 50, 0.8);
    align-self: flex-end;
    padding-bottom: 0.15em;
  }

  .multiplier-label {
    font-family: Impact, 'Arial Black', system-ui, sans-serif;
    font-size: clamp(1.2rem, 5vw, 3rem);
    color: rgba(255, 200, 50, 0.7);
    letter-spacing: 0.2em;
    text-shadow: 0 0 10px rgba(255, 200, 50, 0.5);
    align-self: flex-end;
    padding-bottom: 0.2em;
  }

  /* ── COLLECT button ─────────────────────────────────────────────────────── */
  .collect-btn {
    margin-top: 1rem;
    padding: 0.9rem 3.5rem;
    font-family: Impact, 'Arial Black', system-ui, sans-serif;
    font-size: clamp(1.1rem, 4vw, 1.6rem);
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #0a0510;
    background: linear-gradient(135deg, #ffd700 0%, #ff9500 50%, #ffd700 100%);
    background-size: 200% 100%;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow:
      0 0 24px rgba(255, 215, 0, 0.8),
      0 0 50px rgba(255, 150, 0, 0.45),
      0 4px 0   rgba(0, 0, 0, 0.5);
    animation:
      collect-fadein 0.4s 0.9s ease both,
      collect-shine  2.4s 1.3s linear infinite,
      collect-press-idle 1.6s 0.9s ease-in-out infinite alternate;
    transition: transform 0.08s, box-shadow 0.08s;
  }

  .collect-btn:hover {
    box-shadow:
      0 0 34px rgba(255, 215, 0, 1),
      0 0 70px rgba(255, 180, 0, 0.6),
      0 4px 0   rgba(0, 0, 0, 0.5);
  }

  .collect-btn:active {
    transform: scale(0.95) translateY(2px);
    box-shadow:
      0 0 18px rgba(255, 215, 0, 0.7),
      0 2px 0   rgba(0, 0, 0, 0.5);
  }

  @keyframes collect-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes collect-shine {
    0%   { background-position: 200% 0; }
    100% { background-position:   0% 0; }
  }

  @keyframes collect-press-idle {
    from { transform: scale(1.0); }
    to   { transform: scale(1.03); }
  }

  /* ── Hint text ──────────────────────────────────────────────────────────── */
  .hint {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.28);
    animation: collect-fadein 0.4s 1.5s ease both;
    user-select: none;
  }
</style>
