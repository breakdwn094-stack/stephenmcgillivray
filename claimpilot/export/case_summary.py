"""
CaseSummary.json generation for ClaimPilot v2.4.0 (Workstream C).

Contains metadata ONLY -- no raw file contents, no PII beyond what's
needed for the case filing, no base64, no binary.
"""

from __future__ import annotations

import json
from datetime import date
from typing import Any, Dict, List

from config.settings import APP_VERSION
from config.states import get_state, tier_label
from core.pii_guard import sanitize_export_dict, validate_export_json


def generate_case_summary_json(
    intake: Dict[str, Any],
    evidence_items: List[Dict[str, Any]],
    state_abbr: str,
) -> str:
    """
    Generate the CaseSummary.json content.
    Returns a JSON string. Contains metadata only.
    """
    state = get_state(state_abbr)

    summary = {
        "claimpilot_version": APP_VERSION,
        "generated_date": date.today().isoformat(),
        "coverage_status": tier_label(state_abbr),
        "coverage_tier": state.tier if state else None,
        "state": state_abbr,
        "state_name": state.name if state else None,
        "claim_type": intake.get("claim_type", ""),
        "incident_date": intake.get("incident_date"),
        "amount_claimed": intake.get("amount_claimed", 0),
        "has_description": bool(intake.get("description")),
        "has_resolution_attempted": bool(intake.get("resolution_attempted")),
        "has_desired_outcome": bool(intake.get("desired_outcome")),
        "evidence_count": len(evidence_items),
        "evidence_items": [
            {
                "item_id": item.get("item_id", ""),
                "label": item.get("label", ""),
                "file_name": item.get("file_name", ""),
                "file_type": item.get("file_type", ""),
                "file_size_bytes": item.get("file_size_bytes", 0),
                "date_added": item.get("date_added", ""),
            }
            for item in evidence_items
        ],
    }

    # Safety: sanitize and validate
    summary = sanitize_export_dict(summary)
    violations = validate_export_json(summary)
    if violations:
        raise ValueError(f"Export safety violation: {'; '.join(violations)}")

    return json.dumps(summary, indent=2, default=str)
