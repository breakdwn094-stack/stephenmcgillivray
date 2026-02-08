"""
Sources & Verification section for ClaimPilot v2.4.0 (Workstream A).

Shows sourceQuality badge, lastReviewedISO, and a tooltip explanation.
"""

from __future__ import annotations

from typing import Optional

import streamlit as st

from config.states import StateCoverage, get_state


def render_sources_section(state_abbr: Optional[str]) -> None:
    """Render the Sources & Verification section for a state."""
    if not state_abbr:
        return

    state = get_state(state_abbr)
    if not state:
        return

    st.markdown("---")
    st.subheader("Sources & Verification")

    if not state.sources:
        st.markdown("No sources available for this state.")
        return

    for source in state.sources:
        col1, col2, col3 = st.columns([2, 2, 3])

        with col1:
            quality = source.source_quality.capitalize()
            if source.source_quality == "official":
                st.markdown(f"**Source quality:** :green[{quality}]")
            else:
                st.markdown(f"**Source quality:** :orange[{quality}]")

        with col2:
            reviewed = source.last_reviewed_iso or "Not yet verified"
            st.markdown(f"**Last reviewed:** {reviewed}")

        with col3:
            st.markdown(f"[{source.label}]({source.url})")

    # Tooltip / explainer
    with st.expander("What this means"):
        st.markdown(
            "**Official** sources come directly from state court websites "
            "and have been reviewed by our team for accuracy.\n\n"
            "**Aggregator** sources come from trusted legal-information "
            "providers but may not reflect the latest changes. "
            "Always verify with your local court clerk before filing."
        )


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
