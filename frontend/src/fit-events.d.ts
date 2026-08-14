// R060: the autofitText action's fitoverflow CustomEvent, declared for
// svelte-check so `on:fitoverflow` on a plain element typechecks. The action
// dispatches it when even MIN_SCALE cannot fit the string (the compact-tier
// signal); see src/lib/actions/autofitText.ts.
declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:fitoverflow'?: (event: CustomEvent<{ overflowing: boolean }>) => void
  }
}
