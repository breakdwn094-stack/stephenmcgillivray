# ClaimPilot v2.4.0 — Release Readiness

**Date:** 2026-02-08
**Status:** Ready for public beta (pending manual checklist completion)

---

## Tier 1 States Currently Supported

| State | Abbreviation | Official Form Verified | Last Reviewed |
|-------|-------------|----------------------|---------------|
| California | CA | Yes | 2025-12-15 |
| Florida | FL | Yes | 2025-09-10 |
| Illinois | IL | Yes | 2025-08-25 |
| New York | NY | Yes | 2025-10-30 |
| Texas | TX | Yes | 2025-11-20 |

All other US states and DC are **Tier 2 (Guidance-only)**.

---

## Automated Acceptance Tests

All tests must pass before release. Run: `cd claimpilot && python -m pytest tests/ -v`

### Gate 1: Coverage Honesty (Tier 1 vs Tier 2)
| Test | File | Status |
|------|------|--------|
| Tier 1 states list is correct | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Tier 2 states have no official form URL | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Tier 1 states have official form URL | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Labels are distinct and correct | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Every state in exactly one tier | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Coverage in Sources.json export | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Coverage in CaseSummary.json | test_acceptance.py::TestGate1CoverageHonesty | PASS |
| Tier 2 never shows official form messaging | test_coverage_display.py | PASS |
| Coverage badges in state selector | test_coverage_display.py | PASS |
| Sources section has quality/review/tooltip | test_coverage_display.py | PASS |

### Gate 2: Zero Crash Tolerance
| Test | File | Status |
|------|------|--------|
| Empty intake export | test_acceptance.py::TestGate2ZeroCrash | PASS |
| Very long description (50k chars) | test_acceptance.py::TestGate2ZeroCrash | PASS |
| Unicode/special chars in names | test_acceptance.py::TestGate2ZeroCrash | PASS |
| Maximum claim amount | test_acceptance.py::TestGate2ZeroCrash | PASS |
| Zero claim amount | test_acceptance.py::TestGate2ZeroCrash | PASS |
| 50 evidence items | test_acceptance.py::TestGate2ZeroCrash | PASS |
| Unknown state abbreviation | test_acceptance.py::TestGate2ZeroCrash | PASS |

### Gate 3: No PII Leakage
| Test | File | Status |
|------|------|--------|
| Case summary has no binary data | test_acceptance.py::TestGate3NoPIILeakage | PASS |
| Sources JSON has no binary data | test_acceptance.py::TestGate3NoPIILeakage | PASS |
| Logger redacts SSN | test_acceptance.py::TestGate3NoPIILeakage | PASS |
| Logger redacts email | test_acceptance.py::TestGate3NoPIILeakage | PASS |
| Production error messages are safe | test_acceptance.py::TestGate3NoPIILeakage | PASS |
| No base64 in export JSON | test_security.py | PASS |
| No raw PDF bytes in export | test_security.py | PASS |

### Gate 4: Safe Monetization Hooks
| Test | File | Status |
|------|------|--------|
| Attorney marketplace default OFF | test_acceptance.py::TestGate4Monetization | PASS |
| Disclaimer text is complete | test_acceptance.py::TestGate4Monetization | PASS |
| No outcome claims in codebase | test_acceptance.py::TestGate4Monetization | PASS |
| Flag toggles correctly | test_compliance.py | PASS |

### Gate 5: Export Package Completeness
| Test | File | Status |
|------|------|--------|
| All 6 files in binder ZIP | test_acceptance.py::TestGate5ExportPackage | PASS |
| ReadMe mentions all files | test_acceptance.py::TestGate5ExportPackage | PASS |
| PDFs have valid headers | test_acceptance.py::TestGate5ExportPackage | PASS |
| JSON files parse correctly | test_acceptance.py::TestGate5ExportPackage | PASS |
| Sources appendix in export | test_acceptance.py::TestGate5ExportPackage | PASS |

### Gate 6: Publish-Ready Docs
| Test | File | Status |
|------|------|--------|
| Privacy summary exists | test_acceptance.py::TestGate6DocsReady | PASS |
| Legal disclaimer exists | test_acceptance.py::TestGate6DocsReady | PASS |
| Support email exists | test_acceptance.py::TestGate6DocsReady | PASS |
| Refund placeholder marked | test_acceptance.py::TestGate6DocsReady | PASS |
| Docs directory exists | test_acceptance.py::TestGate6DocsReady | PASS |

### Workstream-Specific Tests
| Test | File | Status |
|------|------|--------|
| Error boundary catches exceptions | test_ux.py | PASS |
| Delete-my-data session keys defined | test_ux.py | PASS |
| No TODO placeholders in user-facing copy | test_ux.py | PASS |
| Focus-visible CSS in app | test_ux.py | PASS |
| Config completeness | test_ux.py | PASS |

---

## Manual Checklist

Complete before final release sign-off:

- [ ] **Accessibility audit:** Verify keyboard navigation through all tabs works in target browsers (Chrome, Firefox, Safari)
- [ ] **Screen reader test:** Verify ARIA labels are announced correctly with NVDA/VoiceOver
- [ ] **Tier 1 form mapping spot-check:** For each Tier 1 state, manually compare generated ClaimForm.pdf against the official court form
- [ ] **Tier 2 CTA verification:** For 3+ Tier 2 states, confirm "Find your local court forms" link loads correctly
- [ ] **Delete My Data end-to-end:** Enter data in all fields, upload evidence, generate docs, then delete — verify all fields are cleared and localStorage is empty
- [ ] **Export binder download:** Download a full binder ZIP in Chrome, Firefox, and Safari — verify all 6 files open correctly
- [ ] **Attorney marketplace OFF:** With no env var set, confirm marketplace tab shows "Coming soon" with no pricing or purchase buttons
- [ ] **Attorney marketplace ON:** Set ENABLE_ATTORNEY_MARKETPLACE=true, confirm disclaimer appears before and after pricing
- [ ] **Legal review:** Have legal counsel review LEGAL_DISCLAIMER, ATTORNEY_MARKETPLACE_DISCLAIMER, and EXPORT_DISCLAIMER text
- [ ] **Privacy review:** Have legal counsel review PRIVACY_SUMMARY and docs/PRIVACY_SUMMARY.md
- [ ] **Refund policy:** Finalize refund terms and replace REFUND POLICY PLACEHOLDER text
- [ ] **Mobile responsive check:** Verify app is usable on mobile viewports (360px, 768px)
- [ ] **Error boundary test:** Temporarily inject a crash in one tab and verify fallback UI appears without affecting other tabs
- [ ] **Production logging audit:** Set CLAIMPILOT_PRODUCTION=true, exercise all features, verify no PII appears in console/stderr

---

## Known Limitations

1. **Session-only storage:** All data is stored in Streamlit session state. Refreshing the page clears data. This is by design for privacy.
2. **Refund policy is a placeholder:** Must be finalized by legal before paid features launch.
3. **Attorney marketplace is OFF by default:** Requires explicit opt-in and legal review before activation.
4. **Tier 2 states use aggregator sources:** These may not reflect the latest court requirements.
5. **No server-side data persistence:** Future versions may add opt-in cloud storage.
