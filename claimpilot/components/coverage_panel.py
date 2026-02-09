"""
Coverage Status panel for ClaimPilot v2.4.0 (Workstream A).

Displayed everywhere a user can generate or export content.
Shows Tier 1 (Supported) vs Tier 2 (Guidance-only) status clearly.
"""

from __future__ import annotations

from typing import Optional

import streamlit as st

from config.states import StateCoverage, get_state, is_tier1, tier_label


def render_coverage_panel(state_abbr: Optional[str]) -> None:
    """
    Render the Coverage Status panel for the selected state.
    Must appear anywhere a user can generate/export.
    """
    if not state_abbr:
        st.info("Select a state to see coverage status.")
        return

    state = get_state(state_abbr)
    if not state:
        st.warning(f"Unknown state: {state_abbr}")
        return

    _render_for_state(state)


def _render_for_state(state: StateCoverage) -> None:
    """Render the panel body for a known state."""
    container = st.container()
    with container:
        if state.tier == 1:
            st.success(f"**Coverage Status: Supported (Tier 1)** — {state.name}")
            st.markdown(
                "State-specific form mapping has been verified. "
                "You may generate official court forms directly."
            )
        else:
            st.warning(f"**Coverage Status: Guidance-only (Tier 2)** — {state.name}")
            st.markdown(
                "ClaimPilot provides a general template for this state. "
                "**You must verify local court requirements before filing.** "
                "The generated documents are starting points, not final filings."
            )


def render_coverage_badge(state_abbr: Optional[str]) -> str:
    """Return a short badge string (for selectors, headers, etc.)."""
    if not state_abbr:
        return ""
    return tier_label(state_abbr)


def render_document_access(state_abbr: Optional[str]) -> None:
    """
    Render the Documents area:
    - Tier 1: allow access to official form PDF link.
    - Tier 2: show 'Find your local court forms' CTA instead.
    """
    if not state_abbr:
        st.info("Select a state to access documents.")
        return

    state = get_state(state_abbr)
    if not state:
        st.warning(f"Unknown state: {state_abbr}")
        return

    if state.tier == 1 and state.official_form_url:
        st.markdown(f"**Official Form PDF:** [Download official form]({state.official_form_url})")
    else:
        # Tier 2: block official form, show CTA
        st.info("Official court forms are not yet available for this state in ClaimPilot.")
        if state.sources:
            primary_source = state.sources[0]
            st.markdown(
                f"**Find your local court forms:** [{primary_source.label}]({primary_source.url})"
            )
        else:
            st.markdown(
                "**Find your local court forms:** Search your state court's website "
                "for small claims forms."
            )
