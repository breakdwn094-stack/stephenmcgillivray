"""
Data manager for ClaimPilot v2.4.0.

Handles storage, retrieval, and deletion of user data.
Uses Streamlit session_state as primary store (no server-side persistence
in this version).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import streamlit as st

from core.logger import log_info

# Keys managed by ClaimPilot in session_state
_SESSION_KEYS = [
    "intake_data",
    "evidence_items",
    "generated_docs",
    "selected_state",
    "claim_type",
    "export_cache",
    "chat_history",
]


def init_session() -> None:
    """Ensure all session keys exist with safe defaults."""
    defaults: Dict[str, Any] = {
        "intake_data": {},
        "evidence_items": [],
        "generated_docs": {},
        "selected_state": None,
        "claim_type": None,
        "export_cache": None,
        "chat_history": [],
    }
    for key, default in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default


def get_intake_data() -> Dict[str, Any]:
    init_session()
    return dict(st.session_state.get("intake_data", {}))


def set_intake_data(data: Dict[str, Any]) -> None:
    init_session()
    st.session_state["intake_data"] = dict(data)


def get_evidence_items() -> List[Dict[str, Any]]:
    init_session()
    return list(st.session_state.get("evidence_items", []))


def add_evidence_item(item: Dict[str, Any]) -> None:
    init_session()
    st.session_state["evidence_items"].append(item)


def get_selected_state() -> Optional[str]:
    init_session()
    return st.session_state.get("selected_state")


def set_selected_state(abbr: Optional[str]) -> None:
    init_session()
    st.session_state["selected_state"] = abbr


def get_generated_docs() -> Dict[str, Any]:
    init_session()
    return dict(st.session_state.get("generated_docs", {}))


def set_generated_docs(docs: Dict[str, Any]) -> None:
    init_session()
    st.session_state["generated_docs"] = docs


def delete_all_user_data() -> None:
    """
    Wipe ALL user data from session state.
    This is the 'Delete My Data' action.
    """
    for key in _SESSION_KEYS:
        if key in st.session_state:
            del st.session_state[key]
    # Re-initialize with safe defaults
    init_session()
    log_info("All user data deleted from session.")
