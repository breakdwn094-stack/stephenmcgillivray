"""
Feature flags for ClaimPilot v2.4.0.

All legally-sensitive features must be behind flags.
Defaults are set for maximum safety (OFF for anything risky).
"""

import os


def _flag(name: str, default: bool = False) -> bool:
    """Read a boolean feature flag from environment variables."""
    val = os.environ.get(name, "")
    if val.lower() in ("1", "true", "yes", "on"):
        return True
    if val.lower() in ("0", "false", "no", "off"):
        return False
    return default


# Attorney marketplace / review features.
# Default OFF -- requires explicit opt-in.
ENABLE_ATTORNEY_MARKETPLACE: bool = _flag("ENABLE_ATTORNEY_MARKETPLACE", False)

# When True, the app is in production mode (no debug logging, no PII in console).
PRODUCTION_MODE: bool = _flag("CLAIMPILOT_PRODUCTION", True)

# Show placeholder policy text (refund, terms drafts). Default OFF.
# Only enable during internal review / staging.
SHOW_PLACEHOLDER_POLICIES: bool = _flag("SHOW_PLACEHOLDER_POLICIES", False)

# When True, enable detailed analytics/telemetry (requires consent).
ENABLE_ANALYTICS: bool = _flag("ENABLE_ANALYTICS", False)
