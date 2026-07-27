PYTHON := python3
VENV_DIR := env
VENV_PY := $(VENV_DIR)/bin/python

ifeq ($(OS),Windows_NT)
	VENV_PY := $(VENV_DIR)\Scripts\python.exe
	ACTIVATE := $(VENV_DIR)\Scripts\activate.bat
else
	ACTIVATE := source $(VENV_DIR)/bin/activate
endif

makeVirtual:
	$(PYTHON) -m venv $(VENV_DIR)

pipInstall: makeVirtual
	$(VENV_PY) -m pip install --upgrade pip

pipPackages: pipInstall
	$(VENV_PY) -m pip install -r requirements.txt

packInstall: pipPackages
	$(VENV_PY) -m pip install -e .

setup: packInstall
	@echo "Virtual environment ready."
	@echo "To activate it, run:"
	@echo "$(ACTIVATE)"


run GAME:
	$(VENV_PY) games/$(GAME)/run.py
	@echo "Checking compression setting..."
	@if grep -q "compression = False" games/$(GAME)/run.py; then \
		echo "Compression is disabled, formatting books files..."; \
		$(VENV_PY) utils/format_books_json.py games/$(GAME) || echo "Warning: Failed to format books files"; \
	else \
		echo "Compression is enabled, skipping formatting."; \
	fi

test:
	cd $(CURDIR)
	pytest tests/

# test_run REMOVED 2026-07-28 (TR-088). It iterated TEST_NAMES, the six upstream
# 0_0_* sample games, which were removed with the rest of the SDK samples. It is
# NOT repointed at games/future_spinner: that package is locked and its run.py
# regenerates books and lookup tables, so a casual `make test_run` would rewrite
# published, frozen truth. Use `make run GAME=future_spinner` deliberately, or
# not at all.


clean:
	rm -rf env __pycache__ *.pyc