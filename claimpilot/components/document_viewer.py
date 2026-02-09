"""
Document viewer / generator component for ClaimPilot v2.4.0.

Integrates with coverage panel to block/allow official form access.
"""

from __future__ import annotations

from typing import Optional

import streamlit as st

from components.coverage_panel import render_coverage_panel, render_document_access
from components.sources_verification import render_sources_section
from config.states import get_state, is_tier1
from core.data_manager import get_intake_data
from core.error_boundary import safe_render


@safe_render("Documents")
def render_document_viewer(state_abbr: Optional[str]) -> None:
    """Render the document generation and viewing interface."""
    st.header("Documents")

    # Always show coverage panel where user can generate/export
    render_coverage_panel(state_abbr)

    if not state_abbr:
        st.info("Select a state and complete the intake form to generate documents.")
        return

    intake = get_intake_data()
    if not intake.get("claimant_name") or not intake.get("description"):
        st.info("Complete the intake form (at minimum: name and claim description) to generate documents.")
        return

    st.markdown("---")

    # Document access depends on tier
    render_document_access(state_abbr)

    st.markdown("---")
    st.subheader("Generate Documents")

    state = get_state(state_abbr)
    tier = state.tier if state else 2

    if tier == 1:
        st.markdown("The following documents will use **verified state-specific form mapping**:")
    else:
        st.markdown(
            "The following documents use a **general template**. "
            "You must verify they meet your local court's requirements before filing."
        )

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Generate Demand Letter", key="gen_demand"):
            st.session_state["generated_docs"]["demand_letter"] = True
            st.success("Demand letter generated.")

        if st.button("Generate Claim Form", key="gen_claim"):
            st.session_state["generated_docs"]["claim_form"] = True
            st.success("Claim form generated.")

    with col2:
        if st.button("Generate Evidence Index", key="gen_evidence_idx"):
            st.session_state["generated_docs"]["evidence_index"] = True
            st.success("Evidence index generated.")

    # Sources section
    render_sources_section(state_abbr)
