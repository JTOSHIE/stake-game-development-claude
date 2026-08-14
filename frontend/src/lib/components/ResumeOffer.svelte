<script lang="ts">
  /**
   * ResumeOffer.svelte - TR-099. "Continue where you left off?"
   *
   * Shown once, at boot, when a round the RGS is still holding matches a stored
   * presentation cursor. Specification: `docs/design/FEATURE_RESUME_DESIGN.md`.
   *
   * IT IS AN OFFER, NOT AN ASSUMPTION, and the second reason is the one that
   * matters. A player who left because something looked wrong needs a route to
   * the WHOLE round; auto-resuming would remove that route at exactly the
   * moment they most want it. So declining is a real button, not a dismissal,
   * and it plays the round from the start. Both choices settle identically and
   * pay identically: this decides where an animation begins and nothing else.
   *
   * There is deliberately no close control and no scrim dismissal. Every other
   * overlay in this build can be waved away because nothing waits on it; this
   * one gates the presentation of a round the player is owed, so it asks a
   * question with two answers rather than three.
   */
  import { createEventDispatcher } from 'svelte'
  import { setModalOpen } from '../stores/modalGuard'
  import { onDestroy } from 'svelte'
  import { tr } from '../i18n/tr'

  export let open = false
  /** How many free spins the player already watched. */
  export let playedSpins = 0
  /** How many the round awarded in total. */
  export let totalSpins = 0

  const dispatch = createEventDispatcher<{ resume: void; restart: void }>()

  $: setModalOpen('resume-offer', open)
  onDestroy(() => setModalOpen('resume-offer', false))

  let resumeBtn: HTMLButtonElement | null = null
  $: if (open && resumeBtn) resumeBtn.focus()

  function resume(): void { open = false; dispatch('resume') }
  function restart(): void { open = false; dispatch('restart') }

  function handleKey(e: KeyboardEvent): void {
    if (!open) return
    if (e.key === 'Enter') { e.preventDefault(); resume() }
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if open}
  <div class="ro-scrim fs-scrim" aria-hidden="true"></div>

  <div class="ro-panel" role="dialog" aria-modal="true"
       aria-label={$tr('resumeTitle')} data-testid="resume-offer">
    <span class="ro-title">{$tr('resumeTitle')}</span>
    <!-- The position in the player's terms, one-based, because "you watched 6"
         is a sentence and "index 5" is not. -->
    <p class="ro-body" data-testid="resume-position">
      {$tr('resumeBody', { played: String(playedSpins), total: String(totalSpins) })}
    </p>
    <div class="ro-actions">
      <button class="ro-btn ro-btn--primary" bind:this={resumeBtn}
              on:click={resume} data-testid="resume-continue">{$tr('resumeContinue')}</button>
      <button class="ro-btn" on:click={restart} data-testid="resume-restart">{$tr('resumeRestart')}</button>
    </div>
  </div>
{/if}

<style>
  /* R068 bidi isolation, the "where needed" of the stage pin: sentence
     elements take their base direction from their own first strong character
     (unicode-bidi: plaintext), so Arabic prose reads natively (trailing
     punctuation at its correct end) inside the ltr-pinned stage, while every
     Latin-script locale resolves ltr and renders byte-identically. Box
     geometry stays pinned; this affects only inline bidi ordering. */
  .ro-body { unicode-bidi: plaintext; }

  .ro-panel {
    --sig-cyan: var(--theme-primary, #00FFFF);
    --sig-gold: #FFD700;

    position: fixed;
    left: 50%;
    top: 50%;
    /* Counter-scaled for the same reason BetSelector is: `.game-wrapper` scales
       fixed descendants, so a 44px control would not be 44px on the glass. */
    transform: translate(-50%, -50%) scale(calc(1 / var(--scrim-scale, 1)));
    z-index: 140;              /* above the HUD, below the max-win hold (150) */
    width: min(440px, calc(100vw - 32px));
    padding: 18px 20px 20px;
    border-radius: 12px;
    text-align: center;
    background: linear-gradient(180deg, rgba(14, 10, 30, 0.98), rgba(8, 6, 20, 0.99));
    border: 1px solid color-mix(in srgb, var(--sig-cyan) 38%, transparent);
    box-shadow:
      0 0 28px color-mix(in srgb, var(--sig-cyan) 22%, transparent),
      0 18px 44px rgba(0, 0, 0, 0.6);
  }
  .ro-scrim { z-index: 139; background: rgba(4, 2, 12, 0.72); }

  .ro-title {
    display: block;
    font-family: var(--fs-font-display);
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 0.16em;
    color: color-mix(in srgb, var(--sig-cyan) 88%, #fff);
  }
  .ro-body {
    margin: 10px 0 16px;
    font-family: var(--fs-font-display);
    font-size: 12px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.76);
  }
  .ro-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .ro-btn {
    min-height: 44px;
    min-width: 132px;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--fs-font-display);
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f4f1ff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
  }
  .ro-btn:hover { border-color: color-mix(in srgb, var(--sig-cyan) 60%, transparent); }
  .ro-btn:focus-visible { outline: 2px solid var(--sig-cyan); outline-offset: 2px; }
  .ro-btn--primary {
    color: #0a0510;
    border: none;
    background: linear-gradient(135deg, var(--sig-gold), #FF9A2E 50%, var(--sig-gold));
  }

  @media (max-width: 460px), (max-height: 320px) {
    .ro-panel { width: calc(100vw - 16px); padding: 12px 14px 14px; }
    .ro-title { font-size: 13px; }
    .ro-btn { min-width: 118px; font-size: 11px; }
  }
</style>
