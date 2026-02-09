"""
Delete My Data component for ClaimPilot v2.4.0 (Workstream E).

Provides a clear flow for users to wipe all their data from the app.
"""

from __future__ import annotations

import streamlit as st

from core.data_manager import delete_all_user_data
from core.error_boundary import safe_render


@safe_render("Delete My Data")
def render_delete_data() -> None:
    """Render the 'Delete My Data' section."""
    st.header("Delete My Data")
    st.markdown(
        "This will permanently remove all data you have entered into ClaimPilot, including:"
    )
    st.markdown(
        "- Intake form fields (names, addresses, claim details)\n"
        "- Evidence metadata\n"
        "- Generated documents cache\n"
        "- Browser session storage for this app"
    )
    st.markdown("**This action cannot be undone.**")

    # Two-step confirmation
    confirm = st.checkbox(
        "I understand this will delete all my data and cannot be undone.",
        key="delete_confirm_checkbox",
    )

    if confirm:
        if st.button(
            "Delete all my data",
            key="delete_all_button",
            type="primary",
        ):
            delete_all_user_data()
            # Also inject JS to clear localStorage/sessionStorage
            st.components.v1.html(
                """
                <script>
                    try { window.localStorage.clear(); } catch(e) {}
                    try { window.sessionStorage.clear(); } catch(e) {}
                </script>
                """,
                height=0,
            )
            st.success("All your data has been deleted.")
            st.balloons()
