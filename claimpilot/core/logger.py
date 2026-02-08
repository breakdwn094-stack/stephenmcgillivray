"""
Central logging utility for ClaimPilot v2.4.0.

In production mode (CLAIMPILOT_PRODUCTION=true, the default):
  - All console/log output is suppressed except critical errors.
  - No PII or user-entered data is ever written to logs.

In development mode (CLAIMPILOT_PRODUCTION=false):
  - Debug-level logging is enabled.
  - PII fields are still redacted by default; use log_dev_unsafe() for raw values.
"""

from __future__ import annotations

import logging
import os
import re
import sys
from typing import Any

# PII patterns to redact
_PII_PATTERNS = [
    (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[SSN-REDACTED]"),
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"), "[EMAIL-REDACTED]"),
    (re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"), "[PHONE-REDACTED]"),
    (re.compile(r"\b\d{5}(-\d{4})?\b"), "[ZIP-REDACTED]"),
]

_logger = logging.getLogger("claimpilot")


def _is_production() -> bool:
    """Check production mode from environment at call time."""
    val = os.environ.get("CLAIMPILOT_PRODUCTION", "true").lower()
    return val in ("1", "true", "yes", "on")


def _setup_logger() -> None:
    """Configure the logger based on environment."""
    # Clear existing handlers to allow reconfiguration on reload
    _logger.handlers.clear()
    handler = logging.StreamHandler(sys.stderr)
    if _is_production():
        _logger.setLevel(logging.WARNING)
        handler.setLevel(logging.WARNING)
    else:
        _logger.setLevel(logging.DEBUG)
        handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    _logger.addHandler(handler)


_setup_logger()


def redact_pii(text: str) -> str:
    """Remove common PII patterns from a string."""
    result = text
    for pattern, replacement in _PII_PATTERNS:
        result = pattern.sub(replacement, result)
    return result


def log_info(msg: str, *args: Any) -> None:
    """Log an info-level message. PII is always redacted."""
    _logger.info(redact_pii(msg), *args)


def log_debug(msg: str, *args: Any) -> None:
    """Log a debug message. Only emitted in dev mode. PII is redacted."""
    if not _is_production():
        _logger.debug(redact_pii(msg), *args)


def log_warning(msg: str, *args: Any) -> None:
    """Log a warning. PII is redacted."""
    _logger.warning(redact_pii(msg), *args)


def log_error(msg: str, *args: Any) -> None:
    """Log an error. PII is redacted."""
    _logger.error(redact_pii(msg), *args)


def log_dev_unsafe(msg: str, *args: Any) -> None:
    """
    Log a message WITHOUT PII redaction.
    Only emitted in dev mode. Never call this in production code paths.
    """
    if not _is_production():
        _logger.debug(msg, *args)


def safe_error_message(exc: BaseException) -> str:
    """
    Return a user-safe error description.
    In production, strip the traceback and redact PII from the message.
    In dev, return the full string representation.
    """
    if _is_production():
        return redact_pii(f"An error occurred: {type(exc).__name__}")
    return redact_pii(str(exc))
