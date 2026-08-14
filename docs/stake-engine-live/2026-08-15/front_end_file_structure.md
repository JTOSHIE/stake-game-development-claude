<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: front_end_file_structure
- resolved_url: https://stake-engine.com/docs/front-end/file-structure
- fetched: 2026-08-15
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText, direct transport from the owner's machine.

---
File Structure

The file structure is in a way of structure of TurboRepo to achieve a monorepo. Besides the files for the configurations of TurboRepo, sveltekit, eslint, typescript, git and so on, here is a list of of key modules of (/apps) and /packages.

root
  |_apps
  |  |_cluster
  |  |_lines
  |  |_price
  |  |_scatter
  |  |_ways
  |
  |_packages
     |_config-*
     |_constants-*
     |_state-*
     |_utils-*
     |_components-*
     |_pixi-*

/apps

For each game, it has an individual folder in the apps, for example /apps/lines.

/apps/lines/package.json: Find the module name of the app here.
{
  "name": "lines",
  ...
}

To run the app in DEV mode instead of in the storybook: Run pnpm run dev --filter=<MODULE_NAME> in the terminal.
pnpm run dev --filter=lines

/apps/lines/src/routes/%2Bpage.svelte: This is the entry file of sample game apps/lines in a sveltekit way. It is a combination of two things:
setContext()(/apps/lines/src/game/context.ts#L14): A function that sets all the svelte-context required and used in this app and in the /packages. As we already know, only children-level components can access the context. That is why we set the context at the entry level of the app.
<Game \/>(/apps/lines/src/components/Game.svelte): The entry svelte component to the game. It includes all the components of the game.
// +page.svelte

<script lang="ts">
  import Game from '../components/Game.svelte';
  import { setContext } from '../game/context';

  setContext();
</script>

<Game />

/apps/lines/src/stories/ComponentsGame.stories.svelte: You will find the same pattern in this storybook or other Mode<GAME_MODE>Book.stories.svelte and Mode<GAME_MODE>BookEvent.stories.svelte.
// ComponentsGame.stories.svelte

<script lang="ts">
  ...
  import Game from '../components/Game.svelte';
  import { setContext } from '../game/context';

  ...
  setContext();
</script>

<Story name="component (loadingScreen)">
  <StoryLocale lang="en">
    <Game />
  </StoryLocale>
</Story>

We can render <Game \/>(/apps/lines/src/components/Game.svelte) component in the app or in the storybook. Either way it requires the context to set in advance, otherwise the children or the descendants will throw errors if they use the getContext()(/apps/lines/src/game/context.ts#L21) from /apps or getContext() (/packages/components-ui-pixi/src/context.ts#L8) from /packages.
/packages

For every TurboRepo local package, you can import and use them in an app or in another local package directly without publishing them to npm. Our codebase benefits considerably from a monorepo because it brings reusability, readability, maintainability, code splitting and so on. Here is an example of importing local packages with workspace:* in /apps/lines/package.json:

// package.json

{
  "name": "lines",
  ...,
  "devDependencies": {
    ...,
    "config-ts": "workspace:*",
  },
  "dependencies": {
    ...,
    "pixi-svelte": "workspace:*",
    "constants-shared": "workspace:*",
    "state-shared": "workspace:*",
    "utils-shared": "workspace:*",
    "components-shared": "workspace:*",
  }
}


The naming convention of packages is a combination of <PACKAGE_TYPE>, hyphen and <SPECIAL_DEPENDENCY> or <SPECIAL_USAGE>. For example, components-pixi is a local package that the package type is “components” and the special dependency is pixi-svelte.

config-*:
/packages/config-lingui: This local package contains reusable configurations of npm package lingui.
/packages/config-storybook: This local package contains reusable configurations of npm package storybook.
packages/config-svelte: This local package contains reusable configurations of npm package svelte.
/packages/config-ts: This local package contains reusable configurations of npm package typescript.
/packages/config-vite: This local package contains reusable configurations of npm package vite.
pixi-*
/packages/pixi-svelte: This local package contains reusable svelte components/functions/types based on pixijs and svelte.
It creates stateApp and AppContext as a svelte-context.
It also builds and publishes pixi-svelte of npm.
packages/pixi-svelte-storybook: This is a storybook for components in pixi-svelte.
constants-*:
/packages/constants-shared: This local package contains reusable global constants.
state-*:
/packages/state-shared: This local package contains reusable global svelte-$state.
utils-*:
/packages/utils-book: This local package contains reusable functions/types that are related to book and bookEvent.
/packages/utils-fetcher: This local package contains reusable functions/types based on fetch API.
/packages/utils-shared: This local package contains reusable functions/types, except for lodash and lingui.
/packages/utils-slots: This local package contains reusable functions/types for slots game, for example creating reel and spinning the board.
/packages/utils-sound: This local package contains reusable functions/types based on npm package howler for music and sound effect.
/packages/utils-event-emitter: This local package contains reusable functions/types to achieve our event-driven programming.
It creates eventEmitter and ContextEventEmitter as a svelte-context
/packages/utils-xstate: This local package contains reusable functions/types based on npm package xstate.
It creates stateXstate, stateXstateDerived and ContextXstate as a svelte-context
/packages/utils-layout: This local package contains reusable functions/types for our layout system of pixijs.
It creates stateLayout, stateLayoutDerived and ContextLayout as a svelte-context
components-*:
/packages/components-layout: This local package contains reusable svelte components based on another local package utils-layout.
/packages/components-pixi: This local package contains reusable svelte components based on pixi-svelte.
/packages/components-shared: This local package contains reusable svelte components based on html.
/packages/components-storybook: This local package contains reusable svelte components for storybooks.
/packages/components-ui-pixi: This local package contains reusable svelte pixi-svelte components for the game UI.
packages/components-ui-html: This local package contains reusable svelte html components for the game UI.

For *-shared packages, they are created to be reused as much as possible by other apps and packages. Instead of having a special dependency or usage, they should have a minimum list of dependencies and a broad set of use cases.

pixi-svelte, utils-event-emitter, utils-layout and utils-xstate they have functions to create corresponding svelte-context. For the contexts, they can be used by either an app or a local components-* package by just calling the getContext<CONTEXT_NAME>(). For example, components in components-layout use getContextLayout() from utils-layout. In this way, we can regard pixi-svelte as an integration of “utils-pixi-svelte” and “components-pixi-svelte”.
