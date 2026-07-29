<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: front_end_ui
- resolved_url: https://stake-engine.com/docs/front-end/ui
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Front End Ui - API Documentation
- chars: 1226
- sha256: 73612c616fd4734fa395c57c9030506e42f4092255e931b15476c6948fa19790
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

UI

We have provided solutions for the UI, which are /packages/components-ui-pixi and /packages/components-ui-html. They are functional with a few features like auto gaming, turbo mode, bonus button, responsiveness and so on, but they are not as beautiful.

<script lang="ts">
	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';
</script>

<App>
  <UI>
    {#snippet gameName()}
      <UiGameName name="LINES GAME" />
    {/snippet}
    {#snippet logo()}
      <Text
        anchor={{ x: 1, y: 0 }}
        text="ADD YOUR LOGO"
        style={{
          fontFamily: 'proxima-nova',
          fontSize: REM * 1.5,
          fontWeight: '600',
          lineHeight: REM * 2,
          fill: 0xffffff,
        }}
      />
    {/snippet}
  </UI>
</App>

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</Modals>



For the branding purpose, we recommend you to regard them as just an example of UI packages instead of applying them directly to your final product. It would be a good choice to use them as a starting point and add more style to them to build your UI. It is completely fine to ignore them and build your own UI from scratch.
