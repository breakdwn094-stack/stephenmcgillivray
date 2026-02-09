"""
State selector with coverage badges for ClaimPilot v2.4.0 (Workstream A).
"""

from __future__ import annotations

from typing import Optional

import streamlit as st

from config.states import ALL_STATES, tier_label
from core.data_manager import get_selected_state, set_selected_state


def render_state_selector() -> Optional[str]:
    """
    Render a state selector dropdown with coverage tier badges.
    Returns the selected state abbreviation or None.
    """
    # Build options with tier badges
    options = ["-- Select your state --"]
    abbr_map = {}
    for abbr in sorted(ALL_STATES.keys(), key=lambda a: ALL_STATES[a].name):
        state = ALL_STATES[abbr]
        badge = tier_label(abbr)
        label = f"{state.name} ({abbr}) — {badge}"
        options.append(label)
        abbr_map[label] = abbr

    current = get_selected_state()
    default_idx = 0
    if current:
        for i, opt in enumerate(options):
            if current in opt:
                default_idx = i
                break

    selected_label = st.selectbox(
        "Select your state",
        options,
        index=default_idx,
        key="state_selector_widget",
        help="Coverage tier indicates whether ClaimPilot has verified form mapping for your state.",
    )

    if selected_label and selected_label != "-- Select your state --":
        abbr = abbr_map.get(selected_label)
        if abbr:
            set_selected_state(abbr)
            return abbr

    set_selected_state(None)
    return None
