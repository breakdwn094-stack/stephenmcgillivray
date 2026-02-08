"""
Sources.json generation for ClaimPilot v2.4.0 (Workstream C).
"""

from __future__ import annotations

import json
from datetime import date
from typing import Optional

from components.sources_verification import sources_for_export
from config.settings import APP_VERSION


def generate_sources_json(state_abbr: Optional[str]) -> str:
    """
    Generate the Sources.json content for the binder export.
    Includes state sources, lastReviewed, sourceQuality, coverageTier.
    """
    data = sources_for_export(state_abbr)
    data["claimpilot_version"] = APP_VERSION
    data["generated_date"] = date.today().isoformat()
    return json.dumps(data, indent=2, default=str)
