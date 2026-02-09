"""
Claim and intake data models for ClaimPilot v2.4.0.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any, Dict, List, Optional


@dataclass
class IntakeData:
    """User-entered claim intake information."""

    claimant_name: str = ""
    claimant_email: str = ""
    claimant_phone: str = ""
    claimant_address: str = ""
    respondent_name: str = ""
    respondent_address: str = ""
    state: str = ""
    claim_type: str = "small_claims"
    incident_date: Optional[date] = None
    amount_claimed: float = 0.0
    description: str = ""
    resolution_attempted: str = ""
    desired_outcome: str = ""

    def to_dict(self) -> Dict[str, Any]:
        d = {
            "claimant_name": self.claimant_name,
            "claimant_email": self.claimant_email,
            "claimant_phone": self.claimant_phone,
            "claimant_address": self.claimant_address,
            "respondent_name": self.respondent_name,
            "respondent_address": self.respondent_address,
            "state": self.state,
            "claim_type": self.claim_type,
            "incident_date": self.incident_date.isoformat() if self.incident_date else None,
            "amount_claimed": self.amount_claimed,
            "description": self.description,
            "resolution_attempted": self.resolution_attempted,
            "desired_outcome": self.desired_outcome,
        }
        return d

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> IntakeData:
        incident = d.get("incident_date")
        if isinstance(incident, str):
            incident = date.fromisoformat(incident)
        return cls(
            claimant_name=d.get("claimant_name", ""),
            claimant_email=d.get("claimant_email", ""),
            claimant_phone=d.get("claimant_phone", ""),
            claimant_address=d.get("claimant_address", ""),
            respondent_name=d.get("respondent_name", ""),
            respondent_address=d.get("respondent_address", ""),
            state=d.get("state", ""),
            claim_type=d.get("claim_type", "small_claims"),
            incident_date=incident,
            amount_claimed=float(d.get("amount_claimed", 0)),
            description=d.get("description", ""),
            resolution_attempted=d.get("resolution_attempted", ""),
            desired_outcome=d.get("desired_outcome", ""),
        )

    def metadata_only(self) -> Dict[str, Any]:
        """Return metadata suitable for export (no raw PII beyond names needed for forms)."""
        return {
            "state": self.state,
            "claim_type": self.claim_type,
            "incident_date": self.incident_date.isoformat() if self.incident_date else None,
            "amount_claimed": self.amount_claimed,
            "has_description": bool(self.description),
            "resolution_attempted": bool(self.resolution_attempted),
        }
