"""
Full acceptance test suite for ClaimPilot v2.4.0.

These tests are the automated gate. Every test here must pass
before the release is considered shippable.
"""

from __future__ import annotations

import importlib
import io
import json
import os
import sys
import zipfile

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config.states import ALL_STATES, TIER1_STATES, TIER2_STATES, get_state, is_tier1, tier_label
from components.sources_verification import sources_for_export
from core.pii_guard import sanitize_export_dict, validate_export_json
from export.binder import EXPECTED_BINDER_FILES, generate_binder_zip
from export.case_summary import generate_case_summary_json
from export.sources_json import generate_sources_json
from export.readme_txt import generate_readme_txt


# ===========================================================================
# GATE 1: Coverage honesty — Tier 1 vs Tier 2
# ===========================================================================

class TestGate1CoverageHonesty:
    """Crystal-clear coverage honesty in UI and exports."""

    def test_tier1_states_list(self):
        """There must be a defined list of Tier 1 states."""
        assert TIER1_STATES == sorted(["CA", "FL", "GA", "IL", "NJ", "NY", "OH", "PA", "TX", "WA"])

    def test_tier2_never_has_official_form_url(self):
        for abbr in TIER2_STATES:
            state = get_state(abbr)
            assert state.official_form_url is None

    def test_tier1_always_has_official_form_url(self):
        for abbr in TIER1_STATES:
            state = get_state(abbr)
            assert state.official_form_url is not None

    def test_tier_labels_are_distinct(self):
        t1 = tier_label("CA")
        t2 = tier_label("OR")
        assert t1 != t2
        assert "Supported" in t1
        assert "Guidance" in t2

    def test_every_state_in_exactly_one_tier(self):
        all_categorized = set(TIER1_STATES) | set(TIER2_STATES)
        assert len(all_categorized) >= 51
        assert len(set(TIER1_STATES) & set(TIER2_STATES)) == 0

    def test_coverage_in_export_sources_json(self):
        for abbr in ["CA", "OR"]:
            data = sources_for_export(abbr)
            assert "coverage_tier" in data
            assert "coverage_label" in data
            assert data["coverage_tier"] in (1, 2)

    def test_coverage_in_case_summary(self, sample_intake, sample_evidence):
        for state, expected_tier in [("CA", 1), ("OR", 2)]:
            content = generate_case_summary_json(sample_intake, sample_evidence, state)
            data = json.loads(content)
            assert data["coverage_tier"] == expected_tier


# ===========================================================================
# GATE 2: Zero crash tolerance for extreme inputs
# ===========================================================================

class TestGate2ZeroCrash:
    """No crashes on edge-case or extreme inputs."""

    def test_empty_intake_export(self, tier1_state):
        """Empty intake should not crash binder generation."""
        empty = {
            "claimant_name": "",
            "claimant_email": "",
            "claimant_phone": "",
            "claimant_address": "",
            "respondent_name": "",
            "respondent_address": "",
            "state": tier1_state,
            "claim_type": "",
            "incident_date": None,
            "amount_claimed": 0,
            "description": "",
            "resolution_attempted": "",
            "desired_outcome": "",
        }
        binder = generate_binder_zip(empty, [], tier1_state)
        assert len(binder) > 0

    def test_very_long_description(self, sample_intake, tier1_state):
        """Very long text should not crash."""
        sample_intake["description"] = "A" * 50000
        binder = generate_binder_zip(sample_intake, [], tier1_state)
        assert len(binder) > 0

    def test_special_characters_in_names(self, sample_intake, tier1_state):
        """Unicode and special chars should not crash."""
        sample_intake["claimant_name"] = "José García-López"
        sample_intake["respondent_name"] = "Müller & Söhne GmbH"
        binder = generate_binder_zip(sample_intake, [], tier1_state)
        assert len(binder) > 0

    def test_max_amount(self, sample_intake, tier1_state):
        sample_intake["amount_claimed"] = 25000.00
        binder = generate_binder_zip(sample_intake, [], tier1_state)
        assert len(binder) > 0

    def test_zero_amount(self, sample_intake, tier1_state):
        sample_intake["amount_claimed"] = 0
        binder = generate_binder_zip(sample_intake, [], tier1_state)
        assert len(binder) > 0

    def test_many_evidence_items(self, sample_intake, tier1_state):
        """50 evidence items should not crash."""
        items = [
            {
                "item_id": f"ev-{i:03d}",
                "label": f"Item {i}",
                "file_name": f"file_{i}.pdf",
                "file_type": "application/pdf",
                "file_size_bytes": 1000 * i,
                "description": f"Description for item {i}",
                "date_added": "2025-07-01T10:00:00",
            }
            for i in range(50)
        ]
        binder = generate_binder_zip(sample_intake, items, tier1_state)
        assert len(binder) > 0

    def test_unknown_state_doesnt_crash(self, sample_intake):
        """Unknown state abbreviation should not crash."""
        binder = generate_binder_zip(sample_intake, [], "XX")
        assert len(binder) > 0


# ===========================================================================
# GATE 3: No PII leakage
# ===========================================================================

class TestGate3NoPIILeakage:
    """No PII in logs, errors, or exports where it shouldn't be."""

    def test_case_summary_no_binary(self, sample_intake, sample_evidence, tier1_state):
        content = generate_case_summary_json(sample_intake, sample_evidence, tier1_state)
        data = json.loads(content)
        violations = validate_export_json(data)
        assert violations == []

    def test_sources_json_no_binary(self, tier1_state):
        content = generate_sources_json(tier1_state)
        data = json.loads(content)
        violations = validate_export_json(data)
        assert violations == []

    def test_logger_redacts_ssn(self):
        from core.logger import redact_pii
        assert "123-45-6789" not in redact_pii("SSN is 123-45-6789")

    def test_logger_redacts_email(self):
        from core.logger import redact_pii
        assert "test@example.com" not in redact_pii("Email: test@example.com")

    def test_production_error_safe(self, monkeypatch):
        monkeypatch.setenv("CLAIMPILOT_PRODUCTION", "true")
        import core.logger as lg
        importlib.reload(lg)
        msg = lg.safe_error_message(ValueError("user@pii.com crashed"))
        assert "user@pii.com" not in msg


# ===========================================================================
# GATE 4: Safe monetization hooks
# ===========================================================================

class TestGate4Monetization:
    """Feature flags for legally sensitive features."""

    def test_attorney_marketplace_default_off(self, monkeypatch):
        monkeypatch.delenv("ENABLE_ATTORNEY_MARKETPLACE", raising=False)
        import config.feature_flags as ff
        importlib.reload(ff)
        assert ff.ENABLE_ATTORNEY_MARKETPLACE is False

    def test_disclaimer_text_complete(self):
        from config.settings import ATTORNEY_MARKETPLACE_DISCLAIMER
        assert "Not a law firm" in ATTORNEY_MARKETPLACE_DISCLAIMER
        assert "attorney-client" in ATTORNEY_MARKETPLACE_DISCLAIMER.lower()

    def test_no_outcome_claims_in_codebase(self):
        base = os.path.join(os.path.dirname(__file__), "..")
        banned = ["win rate", "success rate", "guaranteed outcome", "you will win"]
        for root, _dirs, filenames in os.walk(base):
            if "__pycache__" in root or ".git" in root:
                continue
            for f in filenames:
                if f.endswith(".py"):
                    path = os.path.join(root, f)
                    with open(path) as fh:
                        content = fh.read().lower()
                    for phrase in banned:
                        if phrase in content and "test_" not in f:
                            pytest.fail(f"Banned phrase '{phrase}' in {path}")


# ===========================================================================
# GATE 5: Export package completeness
# ===========================================================================

class TestGate5ExportPackage:
    """Binder ZIP is complete and correctly populated."""

    def test_all_six_files(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            for name in EXPECTED_BINDER_FILES:
                assert name in zf.namelist()

    def test_readme_mentions_all_files(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        for name in EXPECTED_BINDER_FILES:
            assert name in content

    def test_pdfs_valid_header(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            for pdf in ["DemandLetter.pdf", "ClaimForm.pdf", "EvidenceIndex.pdf"]:
                assert zf.read(pdf)[:5] == b"%PDF-"

    def test_json_files_parse(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            for jf in ["CaseSummary.json", "Sources.json"]:
                data = json.loads(zf.read(jf))
                assert isinstance(data, dict)

    def test_sources_appendix_in_export(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            sources = json.loads(zf.read("Sources.json"))
            assert "sources" in sources
            assert "coverage_tier" in sources


# ===========================================================================
# GATE 6: Publish-ready docs
# ===========================================================================

class TestGate6DocsReady:
    """Privacy/terms, support, refund placeholders present."""

    def test_privacy_summary_exists(self):
        from config.settings import PRIVACY_SUMMARY
        assert len(PRIVACY_SUMMARY) > 20

    def test_legal_disclaimer_exists(self):
        from config.settings import LEGAL_DISCLAIMER
        assert "not a law firm" in LEGAL_DISCLAIMER.lower()

    def test_support_email_exists(self):
        from config.settings import SUPPORT_EMAIL
        assert "@" in SUPPORT_EMAIL

    def test_refund_placeholder_marked(self):
        from config.settings import REFUND_PLACEHOLDER
        assert "PLACEHOLDER" in REFUND_PLACEHOLDER

    def test_docs_directory_exists(self):
        docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
        assert os.path.isdir(docs_dir)
