"""
Case intake form component for ClaimPilot v2.4.0.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

import streamlit as st

from core.data_manager import get_intake_data, set_intake_data
from core.error_boundary import safe_render


@safe_render("Intake Form")
def render_intake_form(selected_state: Optional[str]) -> None:
    """Render the case intake form."""
    st.header("Case Intake")

    existing = get_intake_data()

    with st.form("intake_form", clear_on_submit=False):
        st.subheader("Your Information")
        col1, col2 = st.columns(2)
        with col1:
            claimant_name = st.text_input(
                "Full name",
                value=existing.get("claimant_name", ""),
                key="intake_claimant_name",
            )
            claimant_email = st.text_input(
                "Email",
                value=existing.get("claimant_email", ""),
                key="intake_claimant_email",
            )
        with col2:
            claimant_phone = st.text_input(
                "Phone",
                value=existing.get("claimant_phone", ""),
                key="intake_claimant_phone",
            )
            claimant_address = st.text_area(
                "Address",
                value=existing.get("claimant_address", ""),
                key="intake_claimant_address",
                height=80,
            )

        st.subheader("Respondent Information")
        col3, col4 = st.columns(2)
        with col3:
            respondent_name = st.text_input(
                "Respondent name",
                value=existing.get("respondent_name", ""),
                key="intake_respondent_name",
            )
        with col4:
            respondent_address = st.text_area(
                "Respondent address",
                value=existing.get("respondent_address", ""),
                key="intake_respondent_address",
                height=80,
            )

        st.subheader("Claim Details")
        claim_type = st.selectbox(
            "Claim type",
            ["small_claims", "property_damage", "contract_dispute", "personal_injury", "other"],
            index=0,
            key="intake_claim_type",
        )
        incident_date = st.date_input(
            "Date of incident",
            value=date.today() - timedelta(days=30),
            key="intake_incident_date",
        )
        amount = st.number_input(
            "Amount claimed ($)",
            min_value=0.0,
            max_value=25000.0,
            value=float(existing.get("amount_claimed", 0)),
            step=100.0,
            key="intake_amount",
        )
        description = st.text_area(
            "Describe what happened",
            value=existing.get("description", ""),
            key="intake_description",
            height=150,
            help="Include relevant dates, amounts, and communications.",
        )
        resolution = st.text_area(
            "What steps have you taken to resolve this?",
            value=existing.get("resolution_attempted", ""),
            key="intake_resolution",
            height=100,
        )
        desired = st.text_area(
            "What outcome are you seeking?",
            value=existing.get("desired_outcome", ""),
            key="intake_desired",
            height=80,
        )

        submitted = st.form_submit_button("Save intake information")

        if submitted:
            data = {
                "claimant_name": claimant_name,
                "claimant_email": claimant_email,
                "claimant_phone": claimant_phone,
                "claimant_address": claimant_address,
                "respondent_name": respondent_name,
                "respondent_address": respondent_address,
                "state": selected_state or "",
                "claim_type": claim_type,
                "incident_date": incident_date.isoformat() if incident_date else None,
                "amount_claimed": amount,
                "description": description,
                "resolution_attempted": resolution,
                "desired_outcome": desired,
            }
            set_intake_data(data)
            st.success("Intake information saved.")
