"""
Evidence models for ClaimPilot v2.4.0.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class EvidenceItem:
    """A single piece of evidence attached to a claim."""

    item_id: str  # Unique identifier
    label: str  # User-facing label
    file_name: str  # Original file name
    file_type: str  # MIME type
    file_size_bytes: int
    description: str = ""
    date_added: str = ""  # ISO-8601

    def to_metadata_dict(self) -> Dict[str, Any]:
        """Return metadata only -- never include file content."""
        return {
            "item_id": self.item_id,
            "label": self.label,
            "file_name": self.file_name,
            "file_type": self.file_type,
            "file_size_bytes": self.file_size_bytes,
            "description": self.description,
            "date_added": self.date_added,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> EvidenceItem:
        return cls(
            item_id=d.get("item_id", ""),
            label=d.get("label", ""),
            file_name=d.get("file_name", ""),
            file_type=d.get("file_type", ""),
            file_size_bytes=int(d.get("file_size_bytes", 0)),
            description=d.get("description", ""),
            date_added=d.get("date_added", ""),
        )


def evidence_list_metadata(items: List[EvidenceItem]) -> List[Dict[str, Any]]:
    """Convert a list of evidence items to metadata-only dicts."""
    return [item.to_metadata_dict() for item in items]
