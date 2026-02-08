"""
PII guard utilities for ClaimPilot v2.4.0.

Ensures that no personally-identifiable information leaks into
exports, logs, or error messages.
"""

from __future__ import annotations

import base64
import re
from typing import Any, Dict, List, Set

# Fields that are considered PII and must never appear in log output or
# unredacted error messages.
PII_FIELD_NAMES: Set[str] = {
    "full_name", "first_name", "last_name", "name",
    "email", "email_address",
    "phone", "phone_number",
    "ssn", "social_security",
    "address", "street_address", "mailing_address",
    "date_of_birth", "dob",
    "drivers_license", "license_number",
    "account_number", "policy_number",
}

# Pattern to detect likely base64-encoded binary content
_BASE64_PATTERN = re.compile(
    r"^(?:[A-Za-z0-9+/]{4}){10,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$"
)

# Byte sequences indicating PDF content
_PDF_HEADER = b"%PDF-"


def contains_pii_field_name(text: str) -> bool:
    """Check if a string looks like it contains a PII field name reference."""
    text_lower = text.lower()
    for field_name in PII_FIELD_NAMES:
        if field_name in text_lower:
            return True
    return False


def is_base64_binary(value: str) -> bool:
    """Check if a string appears to be base64-encoded binary data."""
    if not isinstance(value, str):
        return False
    stripped = value.strip()
    if len(stripped) < 40:
        return False
    if _BASE64_PATTERN.match(stripped):
        try:
            decoded = base64.b64decode(stripped[:100])
            if decoded.startswith(_PDF_HEADER):
                return True
            # Check for high-entropy binary (non-text bytes)
            non_text = sum(1 for b in decoded if b > 127 or (b < 32 and b not in (9, 10, 13)))
            return non_text > len(decoded) * 0.3
        except Exception:
            pass
    return False


def contains_raw_pdf_bytes(value: Any) -> bool:
    """Check if a value contains raw PDF byte content."""
    if isinstance(value, bytes):
        return _PDF_HEADER in value
    if isinstance(value, str):
        return "%PDF-" in value
    return False


def sanitize_export_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize a dictionary for safe export.
    Removes base64 binary, raw PDF bytes, and flags suspicious fields.
    Returns a new dict (does not mutate input).
    """
    clean: Dict[str, Any] = {}
    for key, value in data.items():
        if isinstance(value, dict):
            clean[key] = sanitize_export_dict(value)
        elif isinstance(value, list):
            clean[key] = [
                sanitize_export_dict(v) if isinstance(v, dict) else v
                for v in value
                if not (isinstance(v, str) and is_base64_binary(v))
            ]
        elif isinstance(value, str) and is_base64_binary(value):
            clean[key] = "[binary content removed]"
        elif isinstance(value, bytes):
            clean[key] = "[binary content removed]"
        elif contains_raw_pdf_bytes(value):
            clean[key] = "[binary content removed]"
        else:
            clean[key] = value
    return clean


def validate_export_json(data: Dict[str, Any]) -> List[str]:
    """
    Validate that an export dictionary is safe for distribution.
    Returns a list of violation descriptions (empty = safe).
    """
    violations: List[str] = []
    _check_dict_violations(data, "", violations)
    return violations


def _check_dict_violations(
    data: Dict[str, Any], path: str, violations: List[str]
) -> None:
    for key, value in data.items():
        current_path = f"{path}.{key}" if path else key
        if isinstance(value, str):
            if is_base64_binary(value):
                violations.append(f"{current_path}: contains base64 binary data")
            if contains_raw_pdf_bytes(value):
                violations.append(f"{current_path}: contains raw PDF bytes")
        elif isinstance(value, bytes):
            violations.append(f"{current_path}: contains raw bytes")
        elif isinstance(value, dict):
            _check_dict_violations(value, current_path, violations)
        elif isinstance(value, list):
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    _check_dict_violations(item, f"{current_path}[{i}]", violations)
                elif isinstance(item, str) and is_base64_binary(item):
                    violations.append(f"{current_path}[{i}]: contains base64 binary data")
                elif isinstance(item, bytes):
                    violations.append(f"{current_path}[{i}]: contains raw bytes")
