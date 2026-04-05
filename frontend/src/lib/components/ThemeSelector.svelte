<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { THEMES, type ThemeConfig } from '../config/themes'
  import { activeTheme, switchTheme } from '../stores/themeStore'

  const dispatch = createEventDispatcher<{ select: string; close: void }>()
  let selected = $activeTheme.id

  function handleSelect(theme: ThemeConfig): void {
    if (!theme.available) return
    selected = theme.id
  }

  function handleConfirm(): void {
    switchTheme(selected)
    dispatch('select', selected)
    // Full reload to reinitialise all assets cleanly
    setTimeout(() => window.location.reload(), 100)
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Select game theme">
  <div class="panel">

    <header>
      <h2 class="title">SELECT THEME</h2>
      <p class="sub">Same game. New world.</p>
    </header>

    <div class="grid">
      {#each THEMES as theme}
        <button
          class="card"
          class:active={selected === theme.id}
          class:locked={!theme.available}
          on:click={() => handleSelect(theme)}
          disabled={!theme.available}
          style="--p: {theme.palette.primary}; --s: {theme.palette.secondary}; --bg: {theme.palette.background}"
        >
          <div class="card-img">
            <img
              src="{theme.assetBase}/backgrounds/bg-1.jpg"
              alt="{theme.name}"
              on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div class="card-gradient"></div>
            {#if theme.comingSoon}
              <span class="badge">COMING SOON</span>
            {/if}
            {#if selected === theme.id}
              <span class="check">✓</span>
            {/if}
          </div>
          <div class="card-body">
            <h3 class="card-name" style="color: {theme.palette.primary}">{theme.name}</h3>
            <p class="card-desc">{theme.description}</p>
          </div>
        </button>
      {/each}
    </div>

    <footer>
      <button class="btn-cancel" on:click={() => dispatch('close')}>BACK</button>
      <button class="btn-confirm"
        style="--p: {THEMES.find(t=>t.id===selected)?.palette.primary ?? '#00ffff'}"
        on:click={handleConfirm}>
        PLAY THIS THEME
      </button>
    </footer>

  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .panel {
    width: min(96vw, 920px); max-height: 92vh; overflow-y: auto;
    background: rgba(8,8,20,0.98);
    border: 1px solid rgba(0,255,255,0.25); border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 0 60px rgba(0,255,255,0.08);
  }
  header { text-align: center; margin-bottom: 1.5rem; }
  .title {
    font-family: 'Courier New', monospace; font-size: clamp(1.2rem,3vw,2rem);
    font-weight: 900; letter-spacing: 0.3em;
    color: #00ffff; text-shadow: 0 0 20px rgba(0,255,255,0.5);
    margin: 0 0 0.3rem;
  }
  .sub {
    font-family: 'Courier New', monospace; font-size: 0.7rem;
    letter-spacing: 0.25em; color: rgba(255,255,255,0.4); margin: 0;
  }
  .grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr));
    gap: 0.9rem; margin-bottom: 1.5rem;
  }
  .card {
    background: rgba(10,10,20,0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; overflow: hidden;
    cursor: pointer; text-align: left; padding: 0;
    transition: all 0.2s ease;
  }
  .card:hover:not(:disabled) {
    border-color: var(--p);
    box-shadow: 0 0 18px color-mix(in srgb, var(--p) 35%, transparent);
    transform: translateY(-2px);
  }
  .card.active {
    border: 2px solid var(--p);
    box-shadow: 0 0 24px color-mix(in srgb, var(--p) 45%, transparent);
  }
  .card.locked { opacity: 0.35; cursor: not-allowed; }
  .card-img {
    position: relative; height: 130px; overflow: hidden;
    background: var(--bg);
  }
  .card-img img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; opacity: 0.65;
  }
  .card-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(8,8,20,0.9));
  }
  .badge {
    position: absolute; top: 8px; right: 8px;
    background: rgba(0,0,0,0.75); color: rgba(255,255,255,0.55);
    font-family: 'Courier New', monospace; font-size: 0.5rem;
    font-weight: 700; letter-spacing: 0.15em; padding: 3px 8px;
    border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);
  }
  .check {
    position: absolute; top: 8px; left: 8px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--p); color: #000;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 900;
  }
  .card-body { padding: 0.65rem; }
  .card-name {
    font-family: 'Courier New', monospace; font-size: 0.75rem;
    font-weight: 900; letter-spacing: 0.2em; margin: 0 0 0.35rem;
  }
  .card-desc {
    font-family: 'Courier New', monospace; font-size: 0.6rem;
    color: rgba(255,255,255,0.5); margin: 0; line-height: 1.5;
  }
  footer { display: flex; gap: 0.75rem; justify-content: flex-end; }
  .btn-cancel {
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.45); padding: 0.7rem 1.5rem;
    border-radius: 8px; font-family: 'Courier New', monospace;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.75); }
  .btn-confirm {
    background: transparent; border: 2px solid var(--p);
    color: var(--p); padding: 0.7rem 2rem; border-radius: 8px;
    font-family: 'Courier New', monospace; font-size: 0.75rem;
    font-weight: 900; letter-spacing: 0.2em; cursor: pointer;
    box-shadow: 0 0 12px color-mix(in srgb, var(--p) 25%, transparent);
    transition: all 0.15s;
  }
  .btn-confirm:hover {
    background: color-mix(in srgb, var(--p) 12%, transparent);
    box-shadow: 0 0 28px color-mix(in srgb, var(--p) 45%, transparent);
  }
  @media (max-width: 560px) {
    .panel { padding: 1rem; }
    .grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    footer { flex-direction: column; }
    .btn-cancel, .btn-confirm { width: 100%; text-align: center; }
  }
</style>
