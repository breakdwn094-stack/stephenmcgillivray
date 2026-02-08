"""
Error boundary utilities for ClaimPilot v2.4.0.

Provides safe fallback UI when any tab or component crashes.
"""

from __future__ import annotations

import functools
import traceback
from typing import Any, Callable

import streamlit as st

from config.settings import SUPPORT_EMAIL
from core.logger import _is_production, log_error, safe_error_message


def safe_render(tab_name: str) -> Callable:
    """
    Decorator that wraps a Streamlit render function in an error boundary.
    If the wrapped function raises, a safe fallback UI is shown instead.
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as exc:
                log_error("Error in tab '%s': %s", tab_name, safe_error_message(exc))
                _render_fallback(tab_name, exc)

        return wrapper

    return decorator


def fallback_message(tab_name: str) -> str:
    """Return the user-facing fallback error message for a tab."""
    return (
        "We encountered an unexpected error. Your data is safe. "
        "Please try refreshing the page. If the problem persists, "
        f"contact **{SUPPORT_EMAIL}**."
    )


def _render_fallback(tab_name: str, exc: BaseException) -> None:
    """Render a graceful fallback when a tab crashes."""
    st.error(f"Something went wrong in the {tab_name} section.")
    st.markdown(fallback_message(tab_name))
    if not _is_production():
        with st.expander("Developer details"):
            st.code(traceback.format_exc(), language="text")
