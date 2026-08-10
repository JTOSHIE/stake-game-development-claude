<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: rgs_example
- resolved_url: https://stake-engine.com/docs/rgs/example
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Rgs Example - API Documentation
- chars: 2273
- sha256: 0abf0a75716b792ae57c9060bd375ded48f4e7bd40d1d918fb32397d3c6c0836
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Getting Started with RGS Responses

This brief tutorial is intended to get you up and running with the RGS using a simple game called fifty-fifty.

Game Overview

The rules are straightforward:

You request a response from the RGS’s /play API.

You have a 50/50 chance of either:

2x your bet back
Losing your 1x bet.

Your balance is displayed alongside the outcome of the previously completed round. The JSON response for each round is shown on the right-hand side of the screen.

If your win is greater than 0, you’ll need to manually call the /end-round API to finalize the bet—just like in a custom frontend implementation.

For more information, see RGS Technical Details

Simple Math Results

Navigate to the math-sdk/games/fifty_fifty/ directory and execute the run.py script. This will generate:

A Zstandard-compressed set of simulation results
A lookup table matching each result to its simulation
The required index.json file

All necessary files to publish the game to the Stake Engine will be placed in library/publish_files/.

Simple Frontend Implementation

We’ll use Svelte 5 bundled with Vite to create a static frontend. We’ll initialize the project using Node Package Manager (NPM) and optionally Node Version Manager (NVM).

Note: This guide assumes you are using NPM version v22.16.0.

Setup Steps

Create the Vite project: npm create vite@latest

Edit the vite.config.ts file: Make sure the defineConfig function includes: base: "./" (under plugins),

Replace styles and main component:

Copy the contents of css.txt into your generated app.css
Replace the contents of app_svelte.txt into: src/App.svelte

Build the project: yarn build

Deploy:

Upload the contents of the dist/ folder to the Stake Engine under frontend files
What This Frontend Does

This simple Svelte app will:

Authenticate your session with the RGS
Request a response from the /play API
(If applicable) Call the /end-round API to finalize a win

Once the math/frontend files have been uploaded to Stake Engine, launcing the game should result in the following:

Pressing Place BET will populate the play/ response field with the RGS game round structure. If the round-win is >0, press END ROUND to finalise the bet, which will subsequently update your balance and close the bet.
