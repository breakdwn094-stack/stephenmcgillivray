"""
Evidence manager component for ClaimPilot v2.4.0.
"""

from __future__ import annotations

import uuid
from datetime import datetime

import streamlit as st

from core.data_manager import add_evidence_item, get_evidence_items
from core.error_boundary import safe_render


@safe_render("Evidence")
def render_evidence_manager() -> None:
    """Render the evidence upload and management interface."""
    st.header("Evidence")

    # Upload
    st.markdown("Upload files that support your claim (receipts, photos, contracts, correspondence).")
    uploaded = st.file_uploader(
        "Upload evidence",
        accept_multiple_files=True,
        type=["pdf", "png", "jpg", "jpeg", "doc", "docx", "txt"],
        key="evidence_uploader",
    )

    if uploaded:
        for f in uploaded:
            # Check for duplicates by name
            existing = get_evidence_items()
            names = {e["file_name"] for e in existing}
            if f.name not in names:
                item = {
                    "item_id": str(uuid.uuid4()),
                    "label": f.name.rsplit(".", 1)[0],
                    "file_name": f.name,
                    "file_type": f.type or "application/octet-stream",
                    "file_size_bytes": f.size,
                    "description": "",
                    "date_added": datetime.now().isoformat(),
                }
                add_evidence_item(item)

    # Display existing evidence
    items = get_evidence_items()
    if items:
        st.subheader(f"Evidence items ({len(items)})")
        for item in items:
            with st.expander(f"{item['label']} ({item['file_name']})"):
                st.markdown(f"**Type:** {item['file_type']}")
                st.markdown(f"**Size:** {item['file_size_bytes']:,} bytes")
                st.markdown(f"**Added:** {item['date_added']}")
    else:
        st.info("No evidence uploaded yet.")
