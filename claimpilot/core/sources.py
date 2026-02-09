"""
Non-UI sources data helpers for ClaimPilot v2.4.0.

This module provides the ``sources_for_export`` function used by both
the Streamlit UI layer (components/sources_verification.py) and the
headless export layer (export/sources_json.py).  It intentionally has
**no** Streamlit dependency so that exports can run without a UI.
"""

from __future__ import annotations

from typing import Optional

from config.states import get_state


def sources_for_export(state_abbr: Optional[str]) -> dict:
    """Return source data formatted for JSON export."""
    if not state_abbr:
        return {"state": None, "sources": [], "coverage_tier": None}

    state = get_state(state_abbr)
    if not state:
        return {"state": state_abbr, "sources": [], "coverage_tier": None}

    return {
        "state": state.abbreviation,
        "state_name": state.name,
        "coverage_tier": state.tier,
        "coverage_label": f"Tier {state.tier}" + (
            " - Supported" if state.tier == 1 else " - Guidance-only"
        ),
        "sources": [
            {
                "url": s.url,
                "label": s.label,
                "source_quality": s.source_quality,
                "last_reviewed_iso": s.last_reviewed_iso,
            }
            for s in state.sources
        ],
    }
