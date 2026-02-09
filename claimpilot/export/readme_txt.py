"""
ReadMe.txt generation for ClaimPilot v2.4.0 binder export (Workstream C).
"""

from __future__ import annotations

from datetime import date

from config.settings import (
    APP_VERSION,
    EXPORT_DISCLAIMER,
    LEGAL_DISCLAIMER,
    SUPPORT_EMAIL,
)
from config.states import tier_label


def generate_readme_txt(state_abbr: str) -> str:
    """Generate the ReadMe.txt for the binder ZIP."""
    coverage = tier_label(state_abbr)
    today = date.today().isoformat()

    return f"""ClaimPilot Case Binder
=====================
Version: {APP_VERSION}
Generated: {today}
Coverage Status: {coverage}

CONTENTS OF THIS PACKAGE
-------------------------
1. DemandLetter.pdf    - Draft demand letter based on your intake information.
2. ClaimForm.pdf       - Draft small claims court form for your state.
3. EvidenceIndex.pdf   - Index of all evidence items you uploaded.
4. CaseSummary.json    - Machine-readable case metadata (no raw file contents).
5. Sources.json        - Source URLs, quality ratings, and review dates for
                         the legal information used in this package.
6. ReadMe.txt          - This file.

DISCLAIMERS
-----------
{EXPORT_DISCLAIMER}

{LEGAL_DISCLAIMER}

NEXT STEPS
----------
1. Review all documents carefully for accuracy and completeness.
2. If your state coverage is "Guidance-only (Tier 2)", verify that the
   generated forms meet your local court's requirements before filing.
3. Consider having a licensed attorney review your documents.
4. Make copies of everything before submitting to the court.
5. File your claim with the appropriate court clerk.
6. Serve the respondent according to your state's rules.

SUPPORT
-------
Email: {SUPPORT_EMAIL}

Thank you for using ClaimPilot.
"""
