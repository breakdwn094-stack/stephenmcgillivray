"""
Workstream B tests — Compliance-safe marketing & upsells.

Acceptance criteria:
- No numerical 'win rate' or outcome claims in code
- Attorney marketplace default (flag OFF) shows 'Coming soon' with no pricing/CTA
- Flag ON includes mandatory disclaimer
"""

from __future__ import annotations

import importlib
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestNoWinRateClaims:
    """No numerical win rate or outcome claims anywhere in the codebase."""

    def _get_all_python_files(self) -> list[str]:
        base = os.path.join(os.path.dirname(__file__), "..")
        files = []
        for root, _dirs, filenames in os.walk(base):
            # Skip __pycache__ and .git
            if "__pycache__" in root or ".git" in root:
                continue
            for f in filenames:
                if f.endswith(".py"):
                    files.append(os.path.join(root, f))
        return files

    def test_no_win_rate_claims(self):
        banned_phrases = [
            "win rate",
            "success rate",
            "% of cases won",
            "percent of cases",
            "guaranteed outcome",
            "guaranteed result",
            "you will win",
        ]
        violations = []
        for filepath in self._get_all_python_files():
            with open(filepath) as fh:
                content = fh.read().lower()
                for phrase in banned_phrases:
                    if phrase in content:
                        # Allow it inside test files that are checking for absence
                        rel = os.path.relpath(filepath)
                        if "test_compliance" not in rel and "test_acceptance" not in rel:
                            violations.append(f"{rel}: contains '{phrase}'")
        assert not violations, f"Banned outcome claims found:\n" + "\n".join(violations)


class TestAttorneyMarketplaceDefault:
    """With ENABLE_ATTORNEY_MARKETPLACE=false (default), marketplace is hidden."""

    def test_flag_defaults_to_off(self, monkeypatch):
        monkeypatch.delenv("ENABLE_ATTORNEY_MARKETPLACE", raising=False)
        # Re-import to pick up env change
        import config.feature_flags as ff
        importlib.reload(ff)
        assert ff.ENABLE_ATTORNEY_MARKETPLACE is False

    def test_flag_on_when_set(self, monkeypatch):
        monkeypatch.setenv("ENABLE_ATTORNEY_MARKETPLACE", "true")
        import config.feature_flags as ff
        importlib.reload(ff)
        assert ff.ENABLE_ATTORNEY_MARKETPLACE is True

    def test_flag_off_when_explicitly_false(self, monkeypatch):
        monkeypatch.setenv("ENABLE_ATTORNEY_MARKETPLACE", "false")
        import config.feature_flags as ff
        importlib.reload(ff)
        assert ff.ENABLE_ATTORNEY_MARKETPLACE is False


class TestAttorneyMarketplaceDisclaimer:
    """When flag is ON, mandatory disclaimer must be present."""

    def test_disclaimer_text_exists(self):
        from config.settings import ATTORNEY_MARKETPLACE_DISCLAIMER
        assert "Not a law firm" in ATTORNEY_MARKETPLACE_DISCLAIMER
        assert "No attorney-client relationship" in ATTORNEY_MARKETPLACE_DISCLAIMER

    def test_disclaimer_used_in_marketplace_component(self):
        """The marketplace module must reference the disclaimer constant."""
        import components.attorney_marketplace as am
        import inspect
        source = inspect.getsource(am)
        assert "ATTORNEY_MARKETPLACE_DISCLAIMER" in source


class TestLegalDisclaimer:
    """Core legal disclaimer must be present and complete."""

    def test_legal_disclaimer_content(self):
        from config.settings import LEGAL_DISCLAIMER
        assert "not a law firm" in LEGAL_DISCLAIMER.lower()
        assert "legal advice" in LEGAL_DISCLAIMER.lower()
        assert "attorney" in LEGAL_DISCLAIMER.lower()
