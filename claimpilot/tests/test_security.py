"""
Workstream D tests — Security / Privacy / No PII leaks.

Acceptance criteria:
- In production mode, console.* is not called with PII-like strings
- Export JSON never contains base64/file binary or raw PDF bytes
- Logger redacts PII patterns
- Error messages don't leak user data in production
"""

from __future__ import annotations

import base64
import importlib
import json
import logging
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.pii_guard import (
    contains_pii_field_name,
    contains_raw_pdf_bytes,
    is_base64_binary,
    sanitize_export_dict,
    validate_export_json,
)


class TestPIIRedaction:
    """Logger must redact PII patterns."""

    def test_redact_ssn(self):
        from core.logger import redact_pii
        assert "[SSN-REDACTED]" in redact_pii("SSN: 123-45-6789")

    def test_redact_email(self):
        from core.logger import redact_pii
        assert "[EMAIL-REDACTED]" in redact_pii("Contact: jane@example.com")

    def test_redact_phone(self):
        from core.logger import redact_pii
        result = redact_pii("Call 555-123-4567 now")
        assert "555-123-4567" not in result

    def test_safe_error_message_production(self, monkeypatch):
        monkeypatch.setenv("CLAIMPILOT_PRODUCTION", "true")
        import core.logger as lg
        importlib.reload(lg)
        msg = lg.safe_error_message(ValueError("User jane@example.com not found"))
        assert "jane@example.com" not in msg
        assert "ValueError" in msg


class TestProductionLogging:
    """In production mode, debug/info logging must be suppressed."""

    def test_production_mode_suppresses_debug(self, monkeypatch):
        monkeypatch.setenv("CLAIMPILOT_PRODUCTION", "true")
        import core.logger as lg
        importlib.reload(lg)
        # In production, logger level should be WARNING or higher
        assert lg._logger.level >= logging.WARNING

    def test_dev_mode_allows_debug(self, monkeypatch):
        monkeypatch.setenv("CLAIMPILOT_PRODUCTION", "false")
        import core.logger as lg
        importlib.reload(lg)
        assert lg._logger.level <= logging.DEBUG


class TestNoBase64InExport:
    """Export JSON must never contain base64-encoded binary data."""

    def test_detect_base64_binary(self):
        # Create a base64 string that looks like binary
        binary_data = b"%PDF-1.4 " + bytes(range(256)) * 2
        b64 = base64.b64encode(binary_data).decode()
        assert is_base64_binary(b64)

    def test_short_strings_not_flagged(self):
        assert not is_base64_binary("hello world")
        assert not is_base64_binary("SGVsbG8=")  # too short

    def test_sanitize_removes_base64(self):
        binary_data = b"%PDF-1.4 " + bytes(range(256)) * 2
        b64 = base64.b64encode(binary_data).decode()
        data = {"name": "test", "file_content": b64}
        clean = sanitize_export_dict(data)
        assert clean["name"] == "test"
        assert clean["file_content"] == "[binary content removed]"

    def test_sanitize_removes_bytes(self):
        data = {"name": "test", "raw": b"some bytes"}
        clean = sanitize_export_dict(data)
        assert clean["raw"] == "[binary content removed]"

    def test_validate_catches_violations(self):
        binary_data = b"%PDF-1.4 " + bytes(range(256)) * 2
        b64 = base64.b64encode(binary_data).decode()
        data = {"nested": {"content": b64}}
        violations = validate_export_json(data)
        assert len(violations) > 0

    def test_clean_data_passes_validation(self):
        data = {
            "state": "CA",
            "tier": 1,
            "items": [{"id": "1", "label": "test"}],
        }
        violations = validate_export_json(data)
        assert len(violations) == 0


class TestNoPDFBytesInExport:
    """Export JSON must never contain raw PDF bytes."""

    def test_detect_pdf_in_string(self):
        assert contains_raw_pdf_bytes("%PDF-1.4 content here")

    def test_detect_pdf_in_bytes(self):
        assert contains_raw_pdf_bytes(b"%PDF-1.4 content here")

    def test_normal_string_not_flagged(self):
        assert not contains_raw_pdf_bytes("just a normal string")


class TestExportSafetyEndToEnd:
    """Full export pipeline must produce safe output."""

    def test_case_summary_is_safe(self, sample_intake, sample_evidence, tier1_state):
        from export.case_summary import generate_case_summary_json
        content = generate_case_summary_json(sample_intake, sample_evidence, tier1_state)
        data = json.loads(content)
        violations = validate_export_json(data)
        assert len(violations) == 0

    def test_sources_json_is_safe(self, tier1_state):
        from export.sources_json import generate_sources_json
        content = generate_sources_json(tier1_state)
        data = json.loads(content)
        violations = validate_export_json(data)
        assert len(violations) == 0


class TestPIIFieldDetection:
    """Utility correctly identifies PII field names."""

    def test_detects_email(self):
        assert contains_pii_field_name("claimant_email")

    def test_detects_ssn(self):
        assert contains_pii_field_name("ssn")

    def test_normal_field_not_flagged(self):
        assert not contains_pii_field_name("claim_type")
        assert not contains_pii_field_name("amount")
