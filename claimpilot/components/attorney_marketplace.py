"""
Attorney Marketplace component for ClaimPilot v2.4.0 (Workstream B).

Controlled by ENABLE_ATTORNEY_MARKETPLACE feature flag.
- Flag OFF (default): shows "Coming soon" with no pricing/purchase CTA.
- Flag ON: shows plans/pricing with mandatory legal disclaimer.
"""

from __future__ import annotations

import streamlit as st

from config.feature_flags import ENABLE_ATTORNEY_MARKETPLACE
from config.settings import ATTORNEY_MARKETPLACE_DISCLAIMER


def render_attorney_marketplace() -> None:
    """Render the Attorney Review / Marketplace section."""
    st.header("Attorney Review")

    if not ENABLE_ATTORNEY_MARKETPLACE:
        _render_coming_soon()
    else:
        _render_marketplace()


def _render_coming_soon() -> None:
    """Render the placeholder when the marketplace is disabled."""
    st.markdown(
        "**Coming soon.** Attorney review and marketplace features "
        "are not yet available. Check back for updates."
    )
    st.markdown(
        "_In the meantime, we recommend consulting a licensed attorney "
        "in your state for legal advice specific to your situation._"
    )


def _render_marketplace() -> None:
    """Render the marketplace when the flag is ON."""
    # Mandatory disclaimer -- always shown first
    st.warning(ATTORNEY_MARKETPLACE_DISCLAIMER)

    st.markdown("### Review Plans")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### Basic Review")
        st.markdown(
            "- Document review by a licensed attorney\n"
            "- Written feedback within 3 business days\n"
            "- One round of revisions"
        )
        st.markdown("**$149**")
        st.button("Request Basic Review", key="attorney_basic")

    with col2:
        st.markdown("#### Comprehensive Review")
        st.markdown(
            "- Full case evaluation\n"
            "- Document review and revision\n"
            "- 30-minute consultation call\n"
            "- Priority turnaround (1 business day)"
        )
        st.markdown("**$349**")
        st.button("Request Comprehensive Review", key="attorney_comprehensive")

    # Repeat disclaimer at bottom
    st.caption(ATTORNEY_MARKETPLACE_DISCLAIMER)
