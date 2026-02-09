"""
State coverage data for ClaimPilot v2.4.0.

Tier 1 ("Supported"): State-specific form mapping verified by legal review.
Tier 2 ("Guidance-only"): General template; user must verify local requirements.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass(frozen=True)
class StateSource:
    """A single source for a state's legal forms / requirements."""

    url: str
    label: str
    source_quality: str  # "official" | "aggregator"
    last_reviewed_iso: Optional[str] = None  # ISO-8601 date or None


@dataclass(frozen=True)
class StateCoverage:
    """Coverage metadata for a single US state."""

    name: str
    abbreviation: str
    tier: int  # 1 or 2
    sources: List[StateSource] = field(default_factory=list)
    official_form_url: Optional[str] = None  # Only for Tier 1
    notes: str = ""


# ---------------------------------------------------------------------------
# Tier 1 states -- verified form mappings
# ---------------------------------------------------------------------------

_TIER1: List[StateCoverage] = [
    StateCoverage(
        name="California",
        abbreviation="CA",
        tier=1,
        sources=[
            StateSource(
                url="https://www.courts.ca.gov/selfhelp-smallclaims.htm",
                label="California Courts Self-Help",
                source_quality="official",
                last_reviewed_iso="2025-12-15",
            ),
        ],
        official_form_url="https://www.courts.ca.gov/documents/sc100.pdf",
        notes="Small Claims SC-100 form mapping verified.",
    ),
    StateCoverage(
        name="Texas",
        abbreviation="TX",
        tier=1,
        sources=[
            StateSource(
                url="https://www.txcourts.gov/rules-forms/forms/",
                label="Texas Courts Forms",
                source_quality="official",
                last_reviewed_iso="2025-11-20",
            ),
        ],
        official_form_url="https://www.txcourts.gov/media/smallclaims.pdf",
        notes="Justice Court small claims petition form mapping verified.",
    ),
    StateCoverage(
        name="New York",
        abbreviation="NY",
        tier=1,
        sources=[
            StateSource(
                url="https://nycourts.gov/courts/nyc/smallclaims/forms.shtml",
                label="NYC Small Claims Forms",
                source_quality="official",
                last_reviewed_iso="2025-10-30",
            ),
        ],
        official_form_url="https://nycourts.gov/courts/nyc/smallclaims/forms/claimform.pdf",
        notes="NYC Small Claims Court form mapping verified.",
    ),
    StateCoverage(
        name="Florida",
        abbreviation="FL",
        tier=1,
        sources=[
            StateSource(
                url="https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Forms",
                label="Florida Courts Forms",
                source_quality="official",
                last_reviewed_iso="2025-09-10",
            ),
        ],
        official_form_url="https://www.flcourts.gov/content/download/smallclaims.pdf",
        notes="Florida Small Claims form 7.010 mapping verified.",
    ),
    StateCoverage(
        name="Illinois",
        abbreviation="IL",
        tier=1,
        sources=[
            StateSource(
                url="https://www.illinoiscourts.gov/forms/approved-forms/",
                label="Illinois Courts Approved Forms",
                source_quality="official",
                last_reviewed_iso="2025-08-25",
            ),
        ],
        official_form_url="https://www.illinoiscourts.gov/forms/smallclaims.pdf",
        notes="Illinois Small Claims Complaint form mapping verified.",
    ),
]

# ---------------------------------------------------------------------------
# Tier 2 states -- guidance only
# ---------------------------------------------------------------------------

_TIER2_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine",
    "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska",
    "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin",
    "WY": "Wyoming", "DC": "District of Columbia",
}


def _build_tier2() -> List[StateCoverage]:
    result = []
    for abbr, name in sorted(_TIER2_NAMES.items(), key=lambda x: x[1]):
        result.append(
            StateCoverage(
                name=name,
                abbreviation=abbr,
                tier=2,
                sources=[
                    StateSource(
                        url=f"https://www.nolo.com/legal-encyclopedia/small-claims-court-{name.lower().replace(' ', '-')}.html",
                        label=f"Nolo: {name} Small Claims Guide",
                        source_quality="aggregator",
                        last_reviewed_iso=None,
                    ),
                ],
                official_form_url=None,
                notes="General template only. User must verify local court requirements.",
            )
        )
    return result


_TIER2: List[StateCoverage] = _build_tier2()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

ALL_STATES: Dict[str, StateCoverage] = {}
for _sc in _TIER1 + _TIER2:
    ALL_STATES[_sc.abbreviation] = _sc

TIER1_STATES: List[str] = sorted(sc.abbreviation for sc in _TIER1)
TIER2_STATES: List[str] = sorted(sc.abbreviation for sc in _TIER2)


def get_state(abbreviation: str) -> Optional[StateCoverage]:
    """Return StateCoverage for a given abbreviation, or None."""
    return ALL_STATES.get(abbreviation.upper())


def is_tier1(abbreviation: str) -> bool:
    return abbreviation.upper() in TIER1_STATES


def tier_label(abbreviation: str) -> str:
    """Human-readable tier label."""
    if is_tier1(abbreviation):
        return "Supported (Tier 1)"
    return "Guidance-only (Tier 2)"
