<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_setup
- resolved_url: https://stake-engine.com/docs/math/setup
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Setup - API Documentation
- chars: 2126
- sha256: e382817a7f6ec4eec1f8d6c7d08bb55b48537fae593f4a2b2a8dcb5a493afc23
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Setup and installation

Running the math-sdk requires Python3 and PIP to be installed!

Rust/Cargo must also be installed for the optimization algorithm to run!

Clone the Math SDK repository to get started

git@github.com:StakeEngine/math-sdk.git

Makefile (recommended)

Assuming Make and a recent version of Python3 is installed on your machine, the easiest method of setting up the SDK is using the terminal to invoke:

make setup


This will setup and activate a Python virtual environment, installing all necessary packages as defined within requirements.txt, and install an editable math-sdk module.

Once the relavent parameters are set for a particular game, execute the run.py file using:

make run GAME=&lt;game_id&gt;

Installing Cargo (Only if using Optimization Algorithm)

If the optimization algorithm is being utilized, Rust and Cargo should be installed.

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

Manual installation

*Note: This installation is for Mac operating systems, Windows OS uses the prefix python (instead of python3)

Create and Activate a Virtual Environment

It’s recommended to use a virtual environment to manage dependencies. Using the Virtual Environment manager (venv), install Python version >=3.12 using:

python3 -m venv env


If you are using Mac, activate the env with:

source env/bin/activate   


If using a Windows computer use:

  env\Scripts\activate.bat

Install Dependencies

Use pip to install dependencies from the requirements.txt file:

python3 -m pip install -r requirements.txt

Install the Package in Editable Mode

Using the setup.py file, the package should be installed it in editable mode (for development purposes) with the command:

python3 -m pip install -e .


This allows modifications to the package source code to take effect without reinstallation.

Verify Installation

You can check that the package is installed by running:

python3 -m pip list


or testing the package import in Python:

python
>>> import your_package_name

Deactivating the Virtual Environment

When finished, deactivate the virtual environment with:

deactivate

