"""
Workstream A tests — Coverage & Trust UX (Tier 1 vs Tier 2).

Acceptance criteria:
- Tier 2 states never display Tier 1 "official form" messaging
- Coverage badges appear in state selector and in export headers
- Exports include coverage status and sources appendix
"""

from __future__ import annotations

import json
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config.states import (
    ALL_STATES,
    TIER1_STATES,
    TIER2_STATES,
    get_state,
    is_tier1,
    tier_label,
)
from components.sources_verification import sources_for_export


class TestTierClassification:
    """Verify Tier 1 and Tier 2 state classification."""

    def test_tier1_states_exist(self):
        assert len(TIER1_STATES) > 0

    def test_tier2_states_exist(self):
        assert len(TIER2_STATES) > 0

    def test_all_states_covered(self):
        """Every state must be in exactly one tier."""
        all_abbrs = set(TIER1_STATES) | set(TIER2_STATES)
        # At least 50 states + DC
        assert len(all_abbrs) >= 51

    def test_no_overlap(self):
        overlap = set(TIER1_STATES) & set(TIER2_STATES)
        assert len(overlap) == 0, f"States in both tiers: {overlap}"

    def test_tier1_contains_expected(self):
        for abbr in ["CA", "TX", "NY", "FL", "IL"]:
            assert is_tier1(abbr), f"{abbr} should be Tier 1"

    def test_tier2_does_not_contain_tier1(self):
        for abbr in TIER1_STATES:
            assert abbr not in TIER2_STATES


class TestTier2NeverShowsTier1Messaging:
    """Tier 2 states must never show 'official form' messaging."""

    def test_tier2_has_no_official_form_url(self):
        for abbr in TIER2_STATES:
            state = get_state(abbr)
            assert state is not None
            assert state.official_form_url is None, (
                f"Tier 2 state {abbr} has an official_form_url — this must be None"
            )

    def test_tier2_label_says_guidance(self):
        for abbr in TIER2_STATES:
            label = tier_label(abbr)
            assert "Guidance-only" in label
            assert "Supported" not in label

    def test_tier1_label_says_supported(self):
        for abbr in TIER1_STATES:
            label = tier_label(abbr)
            assert "Supported" in label
            assert "Guidance-only" not in label


class TestCoverageBadges:
    """Coverage badges must appear in state selector and export headers."""

    def test_every_state_has_a_badge(self):
        for abbr in ALL_STATES:
            label = tier_label(abbr)
            assert label, f"No badge for {abbr}"
            assert "Tier" in label

    def test_tier1_badge_format(self):
        label = tier_label("CA")
        assert label == "Supported (Tier 1)"

    def test_tier2_badge_format(self):
        label = tier_label("WA")
        assert label == "Guidance-only (Tier 2)"


class TestExportCoverageStatus:
    """Exports must include coverage status and sources appendix."""

    def test_sources_export_tier1(self):
        data = sources_for_export("CA")
        assert data["coverage_tier"] == 1
        assert "Supported" in data["coverage_label"]
        assert len(data["sources"]) > 0
        for src in data["sources"]:
            assert "url" in src
            assert "source_quality" in src
            assert "last_reviewed_iso" in src

    def test_sources_export_tier2(self):
        data = sources_for_export("WA")
        assert data["coverage_tier"] == 2
        assert "Guidance-only" in data["coverage_label"]
        assert len(data["sources"]) > 0

    def test_sources_export_none_state(self):
        data = sources_for_export(None)
        assert data["coverage_tier"] is None

    def test_tier1_sources_are_official(self):
        for abbr in TIER1_STATES:
            data = sources_for_export(abbr)
            official_count = sum(
                1 for s in data["sources"] if s["source_quality"] == "official"
            )
            assert official_count > 0, f"Tier 1 state {abbr} has no official sources"

    def test_tier1_sources_have_review_date(self):
        for abbr in TIER1_STATES:
            data = sources_for_export(abbr)
            for src in data["sources"]:
                if src["source_quality"] == "official":
                    assert src["last_reviewed_iso"] is not None, (
                        f"Tier 1 state {abbr} official source missing review date"
                    )
