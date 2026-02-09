"""
Shared test fixtures for ClaimPilot v2.4.0 test suite.
"""

from __future__ import annotations

import os
import sys
from typing import Any, Dict, List

import pytest

# Ensure claimpilot package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


@pytest.fixture
def sample_intake() -> Dict[str, Any]:
    """Minimal valid intake data."""
    return {
        "claimant_name": "Jane Doe",
        "claimant_email": "jane@example.com",
        "claimant_phone": "555-123-4567",
        "claimant_address": "123 Main St\nAnytown, CA 90210",
        "respondent_name": "Acme Corp",
        "respondent_address": "456 Oak Ave\nSometown, CA 90211",
        "state": "CA",
        "claim_type": "small_claims",
        "incident_date": "2025-06-15",
        "amount_claimed": 5000.00,
        "description": "Vendor failed to deliver contracted services worth $5,000.",
        "resolution_attempted": "Sent two written requests for refund.",
        "desired_outcome": "Full refund of $5,000.",
    }


@pytest.fixture
def sample_evidence() -> List[Dict[str, Any]]:
    """Sample evidence items (metadata only)."""
    return [
        {
            "item_id": "ev-001",
            "label": "Contract",
            "file_name": "contract.pdf",
            "file_type": "application/pdf",
            "file_size_bytes": 45000,
            "description": "Signed service contract",
            "date_added": "2025-07-01T10:00:00",
        },
        {
            "item_id": "ev-002",
            "label": "Email correspondence",
            "file_name": "emails.pdf",
            "file_type": "application/pdf",
            "file_size_bytes": 12000,
            "description": "Email thread requesting refund",
            "date_added": "2025-07-02T14:30:00",
        },
    ]


@pytest.fixture
def tier1_state() -> str:
    return "CA"


@pytest.fixture
def tier2_state() -> str:
    return "OR"


@pytest.fixture(autouse=True)
def set_production_mode_off(monkeypatch: pytest.MonkeyPatch) -> None:
    """Default to non-production mode for tests (unless overridden)."""
    monkeypatch.setenv("CLAIMPILOT_PRODUCTION", "false")
