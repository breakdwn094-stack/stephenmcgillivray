"""
Workstream C tests — Export package hardening.

Acceptance criteria:
- Binder ZIP contains all 6 required files
- CaseSummary.json contains only metadata, no raw file contents
- Sources.json has required fields
- ReadMe.txt contains disclaimers and next steps
- All PDFs start with valid PDF header
- Coverage status appears in export headers
"""

from __future__ import annotations

import io
import json
import os
import sys
import zipfile

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from export.binder import EXPECTED_BINDER_FILES, generate_binder_zip
from export.case_summary import generate_case_summary_json
from export.claim_form import generate_claim_form_pdf
from export.demand_letter import generate_demand_letter_pdf
from export.evidence_index import generate_evidence_index_pdf
from export.readme_txt import generate_readme_txt
from export.sources_json import generate_sources_json


class TestBinderContents:
    """Binder ZIP must contain all 6 required files."""

    def test_all_files_present(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            names = zf.namelist()
            for expected in EXPECTED_BINDER_FILES:
                assert expected in names, f"Missing file: {expected}"

    def test_no_extra_files(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            names = set(zf.namelist())
            expected = set(EXPECTED_BINDER_FILES)
            extra = names - expected
            assert not extra, f"Unexpected files in binder: {extra}"

    def test_pdfs_are_valid(self, sample_intake, sample_evidence, tier1_state):
        binder = generate_binder_zip(sample_intake, sample_evidence, tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            for name in ["DemandLetter.pdf", "ClaimForm.pdf", "EvidenceIndex.pdf"]:
                content = zf.read(name)
                assert content[:5] == b"%PDF-", f"{name} is not a valid PDF"

    def test_binder_works_for_tier2(self, sample_intake, sample_evidence, tier2_state):
        """Binder must also work for Tier 2 states."""
        binder = generate_binder_zip(sample_intake, sample_evidence, tier2_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            assert len(zf.namelist()) == len(EXPECTED_BINDER_FILES)

    def test_binder_with_empty_evidence(self, sample_intake, tier1_state):
        binder = generate_binder_zip(sample_intake, [], tier1_state)
        with zipfile.ZipFile(io.BytesIO(binder)) as zf:
            assert "EvidenceIndex.pdf" in zf.namelist()


class TestCaseSummaryJson:
    """CaseSummary.json: metadata only, no raw file contents."""

    def test_valid_json(self, sample_intake, sample_evidence, tier1_state):
        content = generate_case_summary_json(sample_intake, sample_evidence, tier1_state)
        data = json.loads(content)
        assert isinstance(data, dict)

    def test_has_required_fields(self, sample_intake, sample_evidence, tier1_state):
        data = json.loads(generate_case_summary_json(sample_intake, sample_evidence, tier1_state))
        assert "claimpilot_version" in data
        assert "generated_date" in data
        assert "coverage_status" in data
        assert "coverage_tier" in data
        assert "evidence_count" in data
        assert "evidence_items" in data

    def test_no_raw_file_contents(self, sample_intake, sample_evidence, tier1_state):
        content = generate_case_summary_json(sample_intake, sample_evidence, tier1_state)
        data = json.loads(content)
        # Evidence items should only have metadata, not content
        for item in data.get("evidence_items", []):
            assert "content" not in item
            assert "data" not in item
            assert "bytes" not in item
            assert "base64" not in item

    def test_coverage_status_in_summary(self, sample_intake, sample_evidence, tier1_state):
        data = json.loads(generate_case_summary_json(sample_intake, sample_evidence, tier1_state))
        assert data["coverage_tier"] == 1
        assert "Supported" in data["coverage_status"]

    def test_tier2_coverage_in_summary(self, sample_intake, sample_evidence, tier2_state):
        data = json.loads(generate_case_summary_json(sample_intake, sample_evidence, tier2_state))
        assert data["coverage_tier"] == 2
        assert "Guidance-only" in data["coverage_status"]


class TestSourcesJson:
    """Sources.json must include required fields."""

    def test_valid_json(self, tier1_state):
        content = generate_sources_json(tier1_state)
        data = json.loads(content)
        assert isinstance(data, dict)

    def test_required_fields(self, tier1_state):
        data = json.loads(generate_sources_json(tier1_state))
        assert "state" in data
        assert "coverage_tier" in data
        assert "sources" in data
        assert "claimpilot_version" in data

    def test_source_entries_have_fields(self, tier1_state):
        data = json.loads(generate_sources_json(tier1_state))
        for src in data["sources"]:
            assert "url" in src
            assert "label" in src
            assert "source_quality" in src
            assert "last_reviewed_iso" in src


class TestReadmeTxt:
    """ReadMe.txt must contain disclaimers and next steps."""

    def test_contains_disclaimer(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        assert "not a law firm" in content.lower() or "legal advice" in content.lower()

    def test_contains_next_steps(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        assert "NEXT STEPS" in content

    def test_contains_file_list(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        for fname in EXPECTED_BINDER_FILES:
            assert fname in content, f"ReadMe.txt should mention {fname}"

    def test_contains_coverage_status(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        assert "Coverage Status" in content

    def test_contains_support_info(self, tier1_state):
        content = generate_readme_txt(tier1_state)
        assert "support@claimpilot.example.com" in content


class TestExportCoverageHeaders:
    """PDFs must include coverage status in headers."""

    def test_demand_letter_pdf_bytes(self, sample_intake, tier1_state):
        pdf_bytes = generate_demand_letter_pdf(sample_intake, tier1_state)
        assert pdf_bytes[:5] == b"%PDF-"
        assert len(pdf_bytes) > 100

    def test_claim_form_pdf_bytes(self, sample_intake, tier1_state):
        pdf_bytes = generate_claim_form_pdf(sample_intake, tier1_state)
        assert pdf_bytes[:5] == b"%PDF-"
        assert len(pdf_bytes) > 100

    def test_evidence_index_pdf_bytes(self, sample_evidence, tier1_state):
        pdf_bytes = generate_evidence_index_pdf(sample_evidence, tier1_state)
        assert pdf_bytes[:5] == b"%PDF-"
        assert len(pdf_bytes) > 100

    def test_evidence_index_empty_list(self, tier1_state):
        pdf_bytes = generate_evidence_index_pdf([], tier1_state)
        assert pdf_bytes[:5] == b"%PDF-"
