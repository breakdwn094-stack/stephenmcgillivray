# Changelog

## v2.4.0 — 2026-02-08 (Commercial Hardening Release)

### Workstream A: Coverage & Trust UX
- **Added** Coverage Status panel displayed on every generate/export surface, clearly distinguishing Tier 1 (Supported — state-specific form mapping verified) from Tier 2 (Guidance-only — general template, user must verify local requirements).
- **Added** Coverage badges in state selector dropdown showing tier status for every state.
- **Added** Document access gating: Tier 1 states can access official form PDF links; Tier 2 states see "Find your local court forms" CTA with source links instead.
- **Added** Sources & Verification section showing sourceQuality badge (official vs aggregator), lastReviewedISO or "Not yet verified", and a "What this means" explainer tooltip.
- **Defined** Tier 1 states: CA, FL, IL, NY, TX (with official sources and review dates).

### Workstream B: Compliance-Safe Marketing & Upsells
- **Removed** all numerical "win rate" and outcome claims from the codebase.
- **Added** ENABLE_ATTORNEY_MARKETPLACE feature flag (default OFF). When OFF, UI shows "Coming soon" with no pricing or purchase CTA. When ON, mandatory disclaimer is displayed: "Not a law firm. No attorney-client relationship is formed through this app."
- **Added** automated test verifying no banned outcome phrases exist in the codebase.

### Workstream C: Export Package Hardening
- **Added** complete binder ZIP export containing all 6 required files:
  - DemandLetter.pdf — draft demand letter with coverage status header
  - ClaimForm.pdf — state-appropriate claim form with coverage status header
  - EvidenceIndex.pdf — tabular index of all evidence items
  - CaseSummary.json — metadata only (no raw file contents, no binary, no base64)
  - Sources.json — state sources, lastReviewed, sourceQuality, coverageTier
  - ReadMe.txt — package contents, disclaimers, and next steps
- **Added** automated tests verifying all files present, PDFs valid, JSONs parseable, and no binary/PII leakage.

### Workstream D: Security / Privacy / No PII Leaks
- **Added** central logger utility (core/logger.py) with environment guard: production mode suppresses debug/info logs and redacts PII patterns (SSN, email, phone, ZIP) from all log output.
- **Added** PII guard utility (core/pii_guard.py) with base64 binary detection, raw PDF byte detection, and export sanitization.
- **Added** safe_error_message() that strips stack traces and redacts PII in production mode.
- **Added** automated tests verifying PII redaction, production log suppression, and export JSON safety.

### Workstream E: UX Quality
- **Added** error boundary decorator (@safe_render) for every tab — crashes degrade gracefully with a user-friendly message instead of breaking the entire app.
- **Added** accessibility CSS: keyboard focus-visible indicators for all interactive elements including tabs, buttons, and inputs.
- **Added** "Delete My Data" flow that clears intake fields, evidence metadata, generated docs cache, and browser localStorage/sessionStorage.
- **Added** Privacy & Terms tab with privacy summary, terms of use, refund policy placeholder, and support contact.

### Documentation
- **Added** RELEASE_READINESS.md with automated test gate list, manual checklist, and Tier 1 state roster.
- **Added** docs/PRIVACY_SUMMARY.md, docs/SUPPORT.md, docs/REFUND_POLICY.md.
- **Added** comprehensive automated test suite: 70+ tests across 5 test files covering all workstreams plus a full acceptance gate.
