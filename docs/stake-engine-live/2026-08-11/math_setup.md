<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_setup
- resolved_url: https://stake-engine.com/docs/math/setup
- fetched: 2026-08-11
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText, direct transport from the owner's machine.

---
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

