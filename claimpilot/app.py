"""
ClaimPilot v2.4.0 — Main Streamlit Application.

Commercial-ready small claims guidance tool with:
- Crystal-clear coverage honesty (Tier 1 vs Tier 2)
- Zero crash tolerance (error boundaries on every tab)
- No PII leakage
- Safe monetization hooks (feature-flagged)
- Publish-ready docs
"""

from __future__ import annotations

import streamlit as st

from components.attorney_marketplace import render_attorney_marketplace
from components.coverage_panel import render_coverage_panel
from components.delete_data import render_delete_data
from components.document_viewer import render_document_viewer
from components.evidence_manager import render_evidence_manager
from components.intake_form import render_intake_form
from components.state_selector import render_state_selector
from config.feature_flags import SHOW_PLACEHOLDER_POLICIES
from config.settings import (
    APP_NAME,
    APP_TAGLINE,
    APP_VERSION,
    LEGAL_DISCLAIMER,
    PRIVACY_SUMMARY,
    SUPPORT_EMAIL,
)
from core.data_manager import get_evidence_items, get_intake_data, init_session
from core.error_boundary import safe_render
from export.binder import generate_binder_zip


# ---------------------------------------------------------------------------
# Privacy & Terms tab renderer
# ---------------------------------------------------------------------------
@safe_render("Privacy & Terms")
def _render_privacy_tab() -> None:
    st.header("Privacy & Terms")

    st.subheader("Privacy Summary")
    st.markdown(PRIVACY_SUMMARY)

    st.subheader("Terms of Use")
    st.markdown(LEGAL_DISCLAIMER)

    st.subheader("Refund Policy")
    if SHOW_PLACEHOLDER_POLICIES:
        st.markdown(
            "[REFUND POLICY PLACEHOLDER] "
            "Refund terms to be finalized before public launch. "
            f"Contact {SUPPORT_EMAIL} for questions."
        )
    else:
        st.markdown(
            f"For refund inquiries, please contact **{SUPPORT_EMAIL}**."
        )

    st.subheader("Support")
    st.markdown(f"For questions or issues, contact: **{SUPPORT_EMAIL}**")


# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title=f"{APP_NAME} v{APP_VERSION}",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Accessibility: inject CSS for focus states
# ---------------------------------------------------------------------------
st.markdown(
    """
    <style>
    /* Keyboard focus indicators */
    *:focus-visible {
        outline: 3px solid #1E88E5 !important;
        outline-offset: 2px !important;
    }
    button:focus-visible {
        outline: 3px solid #1E88E5 !important;
        outline-offset: 2px !important;
    }
    [role="tab"]:focus-visible {
        outline: 3px solid #1E88E5 !important;
        outline-offset: 2px !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Initialize session
# ---------------------------------------------------------------------------
init_session()

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.title(f"⚖️ {APP_NAME}")
    st.caption(f"v{APP_VERSION} — {APP_TAGLINE}")
    st.markdown("---")

    # State selector
    selected_state = render_state_selector()

    st.markdown("---")

    # Export binder
    st.subheader("Export")
    render_coverage_panel(selected_state)

    if selected_state:
        intake = get_intake_data()
        if intake.get("claimant_name") and intake.get("description"):
            evidence = get_evidence_items()
            binder_bytes = generate_binder_zip(intake, evidence, selected_state)
            st.download_button(
                label="Download case binder (ZIP)",
                data=binder_bytes,
                file_name=f"ClaimPilot_Binder_{selected_state}.zip",
                mime="application/zip",
                key="download_binder",
                type="primary",
            )
        else:
            st.info("Complete the intake form to enable export.")
    else:
        st.info("Select a state to enable export.")

    st.markdown("---")
    st.caption(LEGAL_DISCLAIMER)

# ---------------------------------------------------------------------------
# Main content — tabs with keyboard navigation and aria labels
# ---------------------------------------------------------------------------
st.title(f"⚖️ {APP_NAME}")
st.markdown(f"*{APP_TAGLINE}*")

tab_intake, tab_evidence, tab_docs, tab_attorney, tab_privacy, tab_delete = st.tabs([
    "📋 Case Intake",
    "📎 Evidence",
    "📄 Documents",
    "👤 Attorney Review",
    "🔒 Privacy & Terms",
    "🗑️ Delete My Data",
])

with tab_intake:
    render_intake_form(selected_state)

with tab_evidence:
    render_evidence_manager()

with tab_docs:
    render_document_viewer(selected_state)

with tab_attorney:
    render_attorney_marketplace()

with tab_privacy:
    _render_privacy_tab()

with tab_delete:
    render_delete_data()
