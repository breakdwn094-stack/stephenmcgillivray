"""
Claim form PDF generation for ClaimPilot v2.4.0.

Generates state-specific small claims court forms with proper legal structure:
- State court header with court name, division, form number
- Case number field
- Plaintiff / Defendant sections with full contact info
- Claim details with amount, description, dates
- Declaration under penalty of perjury
- Signature block with date
- Filing instructions and next steps
"""

from __future__ import annotations

from datetime import date
from typing import Any, Dict

from fpdf import FPDF

from config.settings import EXPORT_DISCLAIMER
from config.states import StateCoverage, get_state, tier_label


def _draw_box(pdf: FPDF, x: float, y: float, w: float, h: float) -> None:
    """Draw a rectangle outline."""
    pdf.rect(x, y, w, h)


def _section_header(pdf: FPDF, text: str) -> None:
    """Render a section header with background."""
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(230, 230, 230)
    pdf.cell(0, 7, f"  {text}", new_x="LMARGIN", new_y="NEXT", fill=True, border=1)
    pdf.set_fill_color(255, 255, 255)


def _labeled_field(pdf: FPDF, label: str, value: str, width: float = 0) -> None:
    """Render a label: value field row."""
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(45, 6, f"{label}:", new_x="RIGHT", new_y="TOP")
    pdf.set_font("Helvetica", "", 10)
    if width == 0:
        pdf.cell(0, 6, value, new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.cell(width, 6, value, new_x="RIGHT", new_y="TOP")


def _labeled_field_row(pdf: FPDF, fields: list[tuple[str, str]]) -> None:
    """Render multiple label-value pairs on one row."""
    col_width = (pdf.w - 20) / len(fields)
    for label, value in fields:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(30, 6, f"{label}:", new_x="RIGHT", new_y="TOP")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(col_width - 30, 6, value, new_x="RIGHT", new_y="TOP")
    pdf.ln(6)


def _underline_field(pdf: FPDF, label: str, value: str = "", width: float = 80) -> None:
    """Render a field with an underline for the value."""
    pdf.set_font("Helvetica", "B", 9)
    label_w = pdf.get_string_width(f"{label}: ") + 2
    pdf.cell(label_w, 6, f"{label}: ", new_x="RIGHT", new_y="TOP")
    pdf.set_font("Helvetica", "", 10)
    x = pdf.get_x()
    y = pdf.get_y()
    pdf.cell(width, 6, value, new_x="LMARGIN", new_y="NEXT")
    pdf.line(x, y + 6, x + width, y + 6)


def generate_claim_form_pdf(
    intake: Dict[str, Any],
    state_abbr: str,
) -> bytes:
    """Generate a state-specific claim form PDF. Returns PDF bytes."""
    state = get_state(state_abbr)
    coverage = tier_label(state_abbr) if state else "Unknown"
    state_name = state.name if state else state_abbr

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(15, 15, 15)

    # ---- Court header ----
    _render_court_header(pdf, state, state_name, state_abbr)

    pdf.ln(3)

    # ---- Case Number ----
    pdf.set_font("Helvetica", "B", 9)
    x = pdf.get_x()
    y = pdf.get_y()
    pdf.cell(0, 6, "", new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(pdf.w - 85, y)
    pdf.cell(30, 6, "Case No.: ", new_x="RIGHT", new_y="TOP")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(40, 6, "____________________", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(15)

    pdf.ln(2)

    # ---- Plaintiff Section ----
    _section_header(pdf, "PLAINTIFF / CLAIMANT (Person filing this claim)")
    pdf.ln(2)
    _labeled_field(pdf, "Full Legal Name", intake.get("claimant_name", ""))
    _labeled_field(pdf, "Street Address", intake.get("claimant_address", "").split("\n")[0] if intake.get("claimant_address") else "")
    if intake.get("claimant_address") and "\n" in intake["claimant_address"]:
        _labeled_field(pdf, "City, State, ZIP", intake["claimant_address"].split("\n")[1].strip())
    else:
        _labeled_field(pdf, "City, State, ZIP", "")
    _labeled_field(pdf, "Telephone", intake.get("claimant_phone", ""))
    _labeled_field(pdf, "Email Address", intake.get("claimant_email", ""))
    pdf.ln(3)

    # ---- Defendant Section ----
    _section_header(pdf, "DEFENDANT / RESPONDENT (Person or business you are suing)")
    pdf.ln(2)
    _labeled_field(pdf, "Full Legal Name", intake.get("respondent_name", ""))
    resp_addr = intake.get("respondent_address", "")
    if resp_addr and "\n" in resp_addr:
        parts = resp_addr.split("\n")
        _labeled_field(pdf, "Street Address", parts[0].strip())
        _labeled_field(pdf, "City, State, ZIP", parts[1].strip() if len(parts) > 1 else "")
    else:
        _labeled_field(pdf, "Street Address", resp_addr)
        _labeled_field(pdf, "City, State, ZIP", "")
    pdf.ln(3)

    # ---- Claim Details ----
    _section_header(pdf, "CLAIM DETAILS")
    pdf.ln(2)

    amount = intake.get("amount_claimed", 0)
    try:
        amount_str = f"${float(amount):,.2f}"
    except (ValueError, TypeError):
        amount_str = f"${amount}"

    _labeled_field(pdf, "Amount Claimed", amount_str)

    if state and state.max_claim_amount > 0:
        pdf.set_font("Helvetica", "I", 8)
        pdf.cell(0, 5, f"  (Maximum for {state_name} small claims: ${state.max_claim_amount:,})", new_x="LMARGIN", new_y="NEXT")

    _labeled_field(pdf, "Date of Incident", str(intake.get("incident_date", "")) if intake.get("incident_date") else "")
    _labeled_field(pdf, "Type of Claim", intake.get("claim_type", "small_claims").replace("_", " ").title())
    pdf.ln(2)

    # Description
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "DESCRIPTION OF CLAIM:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    description = intake.get("description", "")
    if description:
        pdf.multi_cell(0, 5, description)
    else:
        # Blank lines for handwriting
        for _ in range(5):
            y = pdf.get_y()
            pdf.line(15, y + 5, pdf.w - 15, y + 5)
            pdf.ln(6)
    pdf.ln(2)

    # Prior resolution attempts
    resolution = intake.get("resolution_attempted", "")
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "PRIOR ATTEMPTS TO RESOLVE:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    if resolution:
        pdf.multi_cell(0, 5, resolution)
    else:
        for _ in range(3):
            y = pdf.get_y()
            pdf.line(15, y + 5, pdf.w - 15, y + 5)
            pdf.ln(6)
    pdf.ln(2)

    # Desired outcome
    desired = intake.get("desired_outcome", "")
    if desired:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(0, 6, "RELIEF REQUESTED:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 5, desired)
        pdf.ln(2)

    # ---- Declaration / Certification ----
    if pdf.get_y() > 220:
        pdf.add_page()

    _section_header(pdf, "DECLARATION")
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 9)
    claimant_name = intake.get("claimant_name", "the undersigned")
    declaration = (
        f"I, {claimant_name}, declare under penalty of perjury that the foregoing "
        "is true and correct to the best of my knowledge. I understand that filing "
        "a false claim is a violation of law."
    )
    pdf.multi_cell(0, 5, declaration)
    pdf.ln(5)

    # Signature block
    sig_y = pdf.get_y()
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "Signature: ________________________________________     Date: _______________", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    pdf.cell(0, 6, "Printed Name: ______________________________________", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # ---- Filing Instructions ----
    _render_filing_instructions(pdf, state, state_name, state_abbr)

    # ---- Coverage & Disclaimer footer ----
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(0, 5, f"Coverage Status: {coverage}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "I", 7)
    pdf.multi_cell(0, 4, EXPORT_DISCLAIMER)
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 7)
    pdf.cell(0, 4, f"Generated by ClaimPilot on {date.today().isoformat()}", new_x="LMARGIN", new_y="NEXT")

    return pdf.output()


def _render_court_header(pdf: FPDF, state: StateCoverage | None, state_name: str, state_abbr: str) -> None:
    """Render the state-specific court header at the top of the form."""
    # Court name
    pdf.set_font("Helvetica", "B", 13)
    if state and state.court_name:
        pdf.cell(0, 8, state.court_name.upper(), new_x="LMARGIN", new_y="NEXT", align="C")
    else:
        pdf.cell(0, 8, f"SMALL CLAIMS COURT - {state_name.upper()}", new_x="LMARGIN", new_y="NEXT", align="C")

    # Division
    pdf.set_font("Helvetica", "B", 11)
    if state and state.court_division:
        pdf.cell(0, 7, state.court_division, new_x="LMARGIN", new_y="NEXT", align="C")
    else:
        pdf.cell(0, 7, "Small Claims Division", new_x="LMARGIN", new_y="NEXT", align="C")

    # Horizontal rule
    pdf.line(15, pdf.get_y(), pdf.w - 15, pdf.get_y())
    pdf.ln(2)

    # Form title and number
    pdf.set_font("Helvetica", "B", 14)
    title = "STATEMENT OF CLAIM"
    if state and state.form_number:
        title = f"STATEMENT OF CLAIM ({state.form_number})"
    pdf.cell(0, 9, title, new_x="LMARGIN", new_y="NEXT", align="C")

    # State name
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"State of {state_name}", new_x="LMARGIN", new_y="NEXT", align="C")

    # Horizontal rule
    pdf.line(15, pdf.get_y(), pdf.w - 15, pdf.get_y())
    pdf.ln(2)


def _render_filing_instructions(pdf: FPDF, state: StateCoverage | None, state_name: str, state_abbr: str) -> None:
    """Render state-specific filing instructions at the bottom."""
    _section_header(pdf, "FILING INSTRUCTIONS")
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 9)

    instructions = []

    if state and state.tier == 1:
        instructions.append(f"1. Complete this form and make {_num_copies(state_abbr)} copies.")
        instructions.append(f"2. File the original with the clerk of the {state.court_name if state.court_name else 'appropriate court'}.")

        if state.filing_fee_range:
            instructions.append(f"3. Pay the filing fee ({state.filing_fee_range}). Fee waivers may be available for qualifying individuals.")
        else:
            instructions.append("3. Pay the applicable filing fee. Fee waivers may be available.")

        instructions.append("4. Serve the defendant according to your state's rules of service.")
        instructions.append("5. Attend the scheduled hearing with all evidence and witnesses.")
        instructions.append("6. Bring copies of all documents listed in your Evidence Index.")

        if state.official_form_url:
            instructions.append(f"\nOfficial forms: {state.official_form_url}")
        if state.sources:
            instructions.append(f"More information: {state.sources[0].url}")
    else:
        instructions.append("1. Verify this form meets your local court's requirements.")
        instructions.append("2. Complete any additional required local forms.")
        instructions.append("3. File with the appropriate court clerk and pay the filing fee.")
        instructions.append("4. Serve the defendant according to your state's rules.")
        instructions.append("5. Attend the scheduled hearing with all evidence.")

    for line in instructions:
        pdf.multi_cell(0, 5, line)
        pdf.ln(1)


def _num_copies(state_abbr: str) -> str:
    """Return the recommended number of copies for filing."""
    copies = {
        "CA": "2", "FL": "2", "GA": "2", "IL": "3",
        "NJ": "2", "NY": "2", "OH": "2", "PA": "2",
        "TX": "2", "WA": "2",
    }
    return copies.get(state_abbr, "2-3")
