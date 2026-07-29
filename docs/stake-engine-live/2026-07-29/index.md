<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: index
- resolved_url: https://stake-engine.com/docs
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: API Documentation
- chars: 1881
- sha256: 3ab104e083557057f2cc2da4c6358d1f483de92555417d4777bc39493bb303b2
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

API Documentation

The Stake Development Kit is a comprehensive framework designed to simplify the creation, simulation, and optimization of slot games. Whether you're an independent developer or part of a dedicated studio, the SDK empowers you to bring your gaming vision to life with precision and efficiency. By leveraging the Carrot Remote Gaming Server (RGS), developers can seamlessly integrate their games on Stake.com, facilitating smooth and scalable deployments.

What Does the SDK Offer?

The SDK is an optional software package handling both the client-side rendering of games in-browser, and the generation of static files containing all possible game results.

Math Framework: A Python-based engine for defining game rules, simulating outcomes, and optimizing win distributions. It generates all necessary backend and configuration files, lookup tables, and simulation results.
Frontend Framework: A PixieJS/Svelte-based toolkit for creating visually engaging slot games. This component integrates seamlessly with the math engine's outputs, ensuring consistency between game logic and player experience.
Stake Engine Game Format Criteria

For verification, testing and security purposes, games uploaded to Stake Engine must consist of static files. Developers utilizing their own frontend and/or math solutions are welcome to upload compatible file-formats to the Admin Control Panel (ACP). All possible game-outcomes must be contained within compressed game-files, typically separated out by modes. Each outcome must be mapped to a corresponding CSV file summarizing a single game-round by a simulation number, probability of selection, and final payout multiplier. When a betting round is initiated a simulation number is selected at a frequency proportional to the simulation weighting, and the corresponding game events are returned though the /play API response.
