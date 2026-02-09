"""
State coverage data for ClaimPilot v2.4.0.

Tier 1 ("Supported"): State-specific form mapping verified by legal review.
Tier 2 ("Guidance-only"): General template; user must verify local requirements.

10 Pilot Tier 1 States: CA, FL, GA, IL, NJ, NY, OH, PA, TX, WA
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
    # Court metadata — Tier 1 states
    court_name: str = ""
    court_division: str = ""
    form_number: str = ""
    max_claim_amount: int = 0
    filing_fee_range: str = ""


# ---------------------------------------------------------------------------
# Tier 1 states -- verified form mappings (10 pilot states)
# ---------------------------------------------------------------------------

_TIER1: List[StateCoverage] = [
    # --- California ---
    StateCoverage(
        name="California",
        abbreviation="CA",
        tier=1,
        sources=[
            StateSource(
                url="https://www.courts.ca.gov/selfhelp-smallclaims.htm",
                label="California Courts - Small Claims Self-Help",
                source_quality="official",
                last_reviewed_iso="2025-12-15",
            ),
            StateSource(
                url="https://www.courts.ca.gov/1062.htm",
                label="California Courts - Small Claims Forms",
                source_quality="official",
                last_reviewed_iso="2025-12-15",
            ),
        ],
        official_form_url="https://www.courts.ca.gov/documents/sc100.pdf",
        notes="SC-100 Plaintiff's Claim and ORDER to Go to Small Claims Court.",
        court_name="Superior Court of California",
        court_division="Small Claims Division",
        form_number="SC-100",
        max_claim_amount=12500,
        filing_fee_range="$30 - $75",
    ),

    # --- Florida ---
    StateCoverage(
        name="Florida",
        abbreviation="FL",
        tier=1,
        sources=[
            StateSource(
                url="https://www.flcourts.gov/Resources-Services/Court-Improvement/Self-Help-Information",
                label="Florida Courts - Self-Help Information",
                source_quality="official",
                last_reviewed_iso="2025-11-20",
            ),
            StateSource(
                url="https://www.flcourts.gov/content/download/403225/3459633/form7.010.pdf",
                label="Florida Small Claims Rules - Form 7.010",
                source_quality="official",
                last_reviewed_iso="2025-11-20",
            ),
        ],
        official_form_url="https://www.flcourts.gov/content/download/403225/3459633/form7.010.pdf",
        notes="Form 7.010 Statement of Claim (Small Claims).",
        court_name="County Court",
        court_division="Small Claims Division",
        form_number="Form 7.010",
        max_claim_amount=8000,
        filing_fee_range="$55 - $300",
    ),

    # --- Georgia ---
    StateCoverage(
        name="Georgia",
        abbreviation="GA",
        tier=1,
        sources=[
            StateSource(
                url="https://georgiacourts.gov/magistrate-court/",
                label="Georgia Courts - Magistrate Court",
                source_quality="official",
                last_reviewed_iso="2025-10-15",
            ),
            StateSource(
                url="https://georgiacourts.gov/wp-content/uploads/2019/07/CIVIL_CASE_FILING_INFORMATION_FORM.pdf",
                label="Georgia Magistrate Court - Civil Case Filing Form",
                source_quality="official",
                last_reviewed_iso="2025-10-15",
            ),
        ],
        official_form_url="https://georgiacourts.gov/wp-content/uploads/2019/07/CIVIL_CASE_FILING_INFORMATION_FORM.pdf",
        notes="Magistrate Court Statement of Claim. Georgia uses county-level magistrate courts.",
        court_name="Magistrate Court",
        court_division="Small Claims Division",
        form_number="Statement of Claim",
        max_claim_amount=15000,
        filing_fee_range="$45 - $75",
    ),

    # --- Illinois ---
    StateCoverage(
        name="Illinois",
        abbreviation="IL",
        tier=1,
        sources=[
            StateSource(
                url="https://www.illinoiscourts.gov/forms/approved-forms/",
                label="Illinois Courts - Approved Forms",
                source_quality="official",
                last_reviewed_iso="2025-09-10",
            ),
            StateSource(
                url="https://www.illinoiscourts.gov/Resources/1f27c27c-32b8-4e57-87c0-8f3e2ad657a4/SC_2_0_Small_Claims_Complaint.pdf",
                label="Illinois - Small Claims Complaint Form SC 2-1",
                source_quality="official",
                last_reviewed_iso="2025-09-10",
            ),
        ],
        official_form_url="https://www.illinoiscourts.gov/Resources/1f27c27c-32b8-4e57-87c0-8f3e2ad657a4/SC_2_0_Small_Claims_Complaint.pdf",
        notes="Form SC 2-1 Small Claims Complaint. Filed in Circuit Court.",
        court_name="Circuit Court of Illinois",
        court_division="Small Claims Division",
        form_number="SC 2-1",
        max_claim_amount=10000,
        filing_fee_range="$20 - $75",
    ),

    # --- New Jersey ---
    StateCoverage(
        name="New Jersey",
        abbreviation="NJ",
        tier=1,
        sources=[
            StateSource(
                url="https://www.njcourts.gov/self-help/small-claims",
                label="New Jersey Courts - Small Claims",
                source_quality="official",
                last_reviewed_iso="2025-10-01",
            ),
            StateSource(
                url="https://www.njcourts.gov/sites/default/files/forms/11789/dc_sm_clmntgd_0.pdf",
                label="New Jersey - Small Claims Plaintiff Guide",
                source_quality="official",
                last_reviewed_iso="2025-10-01",
            ),
        ],
        official_form_url="https://www.njcourts.gov/self-help/small-claims",
        notes="Small Claims Complaint. Filed in Superior Court, Special Civil Part.",
        court_name="Superior Court of New Jersey",
        court_division="Special Civil Part, Small Claims Section",
        form_number="Small Claims Complaint",
        max_claim_amount=5000,
        filing_fee_range="$15 - $50",
    ),

    # --- New York ---
    StateCoverage(
        name="New York",
        abbreviation="NY",
        tier=1,
        sources=[
            StateSource(
                url="https://nycourts.gov/courts/nyc/smallclaims/index.shtml",
                label="NYC Small Claims Court",
                source_quality="official",
                last_reviewed_iso="2025-11-01",
            ),
            StateSource(
                url="https://www.nycourts.gov/courts/nyc/smallclaims/startingcase.shtml",
                label="NYC - How to Start a Small Claims Case",
                source_quality="official",
                last_reviewed_iso="2025-11-01",
            ),
        ],
        official_form_url="https://nycourts.gov/courts/nyc/smallclaims/forms.shtml",
        notes="Small Claims Application. Filed in City/District/Town/Village Court.",
        court_name="Small Claims Court",
        court_division="Small Claims Part",
        form_number="Small Claims Application",
        max_claim_amount=10000,
        filing_fee_range="$15 - $20",
    ),

    # --- Ohio ---
    StateCoverage(
        name="Ohio",
        abbreviation="OH",
        tier=1,
        sources=[
            StateSource(
                url="https://www.supremecourt.ohio.gov/public/small-claims/",
                label="Ohio Supreme Court - Small Claims Information",
                source_quality="official",
                last_reviewed_iso="2025-09-25",
            ),
            StateSource(
                url="https://www.ohiolegalhelp.org/topic/small-claims",
                label="Ohio Legal Help - Small Claims Guide",
                source_quality="aggregator",
                last_reviewed_iso="2025-09-25",
            ),
        ],
        official_form_url="https://www.supremecourt.ohio.gov/public/small-claims/",
        notes="Small Claims Complaint. Filed in Municipal or County Court.",
        court_name="Municipal Court / County Court",
        court_division="Small Claims Division",
        form_number="Small Claims Complaint",
        max_claim_amount=6000,
        filing_fee_range="$30 - $65",
    ),

    # --- Pennsylvania ---
    StateCoverage(
        name="Pennsylvania",
        abbreviation="PA",
        tier=1,
        sources=[
            StateSource(
                url="https://www.pacourts.us/learn/minor-courts",
                label="Pennsylvania Courts - Minor Courts",
                source_quality="official",
                last_reviewed_iso="2025-08-30",
            ),
            StateSource(
                url="https://www.pacourts.us/forms/for-the-public",
                label="Pennsylvania Courts - Public Forms",
                source_quality="official",
                last_reviewed_iso="2025-08-30",
            ),
        ],
        official_form_url="https://www.pacourts.us/forms/for-the-public",
        notes="Civil Complaint (Statement of Claim). Filed in Magisterial District Court.",
        court_name="Magisterial District Court",
        court_division="Civil Division",
        form_number="Statement of Claim",
        max_claim_amount=12000,
        filing_fee_range="$45 - $125",
    ),

    # --- Texas ---
    StateCoverage(
        name="Texas",
        abbreviation="TX",
        tier=1,
        sources=[
            StateSource(
                url="https://www.txcourts.gov/rules-forms/forms/small-claims-forms/",
                label="Texas Courts - Small Claims Forms",
                source_quality="official",
                last_reviewed_iso="2025-11-10",
            ),
            StateSource(
                url="https://www.texasattorneygeneral.gov/consumer-protection/file-complaint",
                label="Texas Attorney General - Consumer Protection",
                source_quality="official",
                last_reviewed_iso="2025-11-10",
            ),
        ],
        official_form_url="https://www.txcourts.gov/rules-forms/forms/small-claims-forms/",
        notes="Petition in Justice Court (Small Claims). Filed in Justice Court (JP Court).",
        court_name="Justice Court",
        court_division="Small Claims",
        form_number="Petition in Small Claims Court",
        max_claim_amount=20000,
        filing_fee_range="$31 - $54",
    ),

    # --- Washington ---
    StateCoverage(
        name="Washington",
        abbreviation="WA",
        tier=1,
        sources=[
            StateSource(
                url="https://www.courts.wa.gov/newsinfo/resources/?fa=newsinfo_jury.smallclaims",
                label="Washington Courts - Small Claims Information",
                source_quality="official",
                last_reviewed_iso="2025-10-20",
            ),
            StateSource(
                url="https://www.atg.wa.gov/small-claims-court",
                label="Washington Attorney General - Small Claims Guide",
                source_quality="official",
                last_reviewed_iso="2025-10-20",
            ),
        ],
        official_form_url="https://www.courts.wa.gov/forms/?fa=forms.contribute&formID=31",
        notes="Notice of Small Claim. Filed in District Court.",
        court_name="District Court",
        court_division="Small Claims Department",
        form_number="Notice of Small Claim",
        max_claim_amount=10000,
        filing_fee_range="$14 - $29",
    ),
]

# ---------------------------------------------------------------------------
# Tier 2 states -- guidance only
# ---------------------------------------------------------------------------

_TIER2_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "HI": "Hawaii", "ID": "Idaho", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine",
    "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska",
    "NV": "Nevada", "NH": "New Hampshire", "NM": "New Mexico",
    "NC": "North Carolina", "ND": "North Dakota", "OK": "Oklahoma",
    "OR": "Oregon", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WV": "West Virginia", "WI": "Wisconsin",
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
