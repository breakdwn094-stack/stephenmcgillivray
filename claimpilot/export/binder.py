"""
Binder (ZIP) export for ClaimPilot v2.4.0 (Workstream C).

Assembles all documents into a single ZIP download:
  - DemandLetter.pdf
  - ClaimForm.pdf
  - EvidenceIndex.pdf
  - CaseSummary.json
  - Sources.json
  - ReadMe.txt
"""

from __future__ import annotations

import io
import zipfile
from typing import Any, Dict, List

from export.case_summary import generate_case_summary_json
from export.claim_form import generate_claim_form_pdf
from export.demand_letter import generate_demand_letter_pdf
from export.evidence_index import generate_evidence_index_pdf
from export.readme_txt import generate_readme_txt
from export.sources_json import generate_sources_json


def generate_binder_zip(
    intake: Dict[str, Any],
    evidence_items: List[Dict[str, Any]],
    state_abbr: str,
) -> bytes:
    """
    Generate the complete binder ZIP package.
    Returns raw ZIP bytes ready for download.
    """
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. DemandLetter.pdf
        demand_pdf = generate_demand_letter_pdf(intake, state_abbr)
        zf.writestr("DemandLetter.pdf", demand_pdf)

        # 2. ClaimForm.pdf
        claim_pdf = generate_claim_form_pdf(intake, state_abbr)
        zf.writestr("ClaimForm.pdf", claim_pdf)

        # 3. EvidenceIndex.pdf
        evidence_pdf = generate_evidence_index_pdf(evidence_items, state_abbr)
        zf.writestr("EvidenceIndex.pdf", evidence_pdf)

        # 4. CaseSummary.json (metadata only)
        case_json = generate_case_summary_json(intake, evidence_items, state_abbr)
        zf.writestr("CaseSummary.json", case_json)

        # 5. Sources.json
        sources_json = generate_sources_json(state_abbr)
        zf.writestr("Sources.json", sources_json)

        # 6. ReadMe.txt
        readme = generate_readme_txt(state_abbr)
        zf.writestr("ReadMe.txt", readme)

    return buf.getvalue()


EXPECTED_BINDER_FILES = [
    "DemandLetter.pdf",
    "ClaimForm.pdf",
    "EvidenceIndex.pdf",
    "CaseSummary.json",
    "Sources.json",
    "ReadMe.txt",
]
