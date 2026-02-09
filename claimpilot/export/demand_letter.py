"""
Demand letter PDF generation for ClaimPilot v2.4.0.

Generates a professional pre-litigation demand letter with:
- Sender's return address and date
- Via Certified Mail header
- Proper salutation and body structure
- Specific demand amount and deadline
- Statement of intent to file suit
- Professional closing with signature block
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict

from fpdf import FPDF

from config.settings import EXPORT_DISCLAIMER
from config.states import get_state, tier_label


def generate_demand_letter_pdf(
    intake: Dict[str, Any],
    state_abbr: str,
) -> bytes:
    """Generate a professional demand letter PDF. Returns PDF bytes."""
    state = get_state(state_abbr)
    coverage = tier_label(state_abbr) if state else "Unknown"
    state_name = state.name if state else state_abbr

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.set_margins(25, 20, 25)

    claimant_name = intake.get("claimant_name", "[Your Name]")
    claimant_addr = intake.get("claimant_address", "[Your Address]")
    respondent_name = intake.get("respondent_name", "[Respondent Name]")
    respondent_addr = intake.get("respondent_address", "[Respondent Address]")
    amount = intake.get("amount_claimed", 0)
    description = intake.get("description", "[Description of claim]")
    incident_date = intake.get("incident_date", "[Date of Incident]")
    resolution = intake.get("resolution_attempted", "")

    try:
        amount_str = f"${float(amount):,.2f}"
    except (ValueError, TypeError):
        amount_str = f"${amount}"

    today = date.today()
    deadline = today + timedelta(days=30)

    # ---- Sender's address block (top right) ----
    pdf.set_font("Helvetica", "", 11)
    for line in claimant_name.split("\n"):
        pdf.cell(0, 6, line.strip(), new_x="LMARGIN", new_y="NEXT", align="R")
    for line in claimant_addr.split("\n"):
        pdf.cell(0, 6, line.strip(), new_x="LMARGIN", new_y="NEXT", align="R")
    pdf.ln(3)

    # ---- Date ----
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, today.strftime("%B %d, %Y"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Delivery method ----
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(0, 6, "VIA CERTIFIED MAIL, RETURN RECEIPT REQUESTED", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Recipient address block ----
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, respondent_name, new_x="LMARGIN", new_y="NEXT")
    for line in respondent_addr.split("\n"):
        pdf.cell(0, 6, line.strip(), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # ---- Re: line ----
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, f"Re: Demand for Payment - {amount_str}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Salutation ----
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Dear {respondent_name}:", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Body paragraphs ----
    # Paragraph 1: Introduction and demand
    para1 = (
        f"I am writing to formally demand payment in the amount of {amount_str} "
        f"for damages arising from the matter described below. This letter serves "
        f"as a final demand before I pursue legal action."
    )
    pdf.multi_cell(0, 6, para1)
    pdf.ln(3)

    # Paragraph 2: Facts
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, "Statement of Facts", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    para2 = (
        f"On or about {incident_date}, the following occurred:\n\n"
        f"{description}"
    )
    pdf.multi_cell(0, 6, para2)
    pdf.ln(3)

    # Paragraph 3: Prior resolution attempts
    if resolution:
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 7, "Prior Attempts to Resolve", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        para3 = (
            f"I have previously attempted to resolve this matter informally: "
            f"{resolution}"
        )
        pdf.multi_cell(0, 6, para3)
        pdf.ln(3)

    # Paragraph 4: Demand
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, "Demand", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    para4 = (
        f"I hereby demand payment of {amount_str} to be received no later than "
        f"{deadline.strftime('%B %d, %Y')} (thirty days from the date of this letter). "
        f"Payment should be made by certified check or money order payable to "
        f"{claimant_name} and mailed to the address listed above."
    )
    pdf.multi_cell(0, 6, para4)
    pdf.ln(3)

    # Paragraph 5: Consequences
    court_name = ""
    if state and state.court_name:
        court_name = state.court_name
    else:
        court_name = "the appropriate court"

    max_claim_note = ""
    if state and state.max_claim_amount > 0:
        max_claim_note = (
            f" Under {state_name} law, small claims court handles claims "
            f"up to ${state.max_claim_amount:,}."
        )

    para5 = (
        f"If I do not receive payment by the deadline stated above, I intend to "
        f"file a claim in {court_name} in the State of {state_name} "
        f"to recover the amount owed, plus any applicable court costs and fees."
        f"{max_claim_note} "
        f"I reserve all rights and remedies available to me under the law."
    )
    pdf.multi_cell(0, 6, para5)
    pdf.ln(3)

    # Paragraph 6: Closing
    para6 = (
        "I hope we can resolve this matter without the need for litigation. "
        "Please contact me at the address above to discuss resolution."
    )
    pdf.multi_cell(0, 6, para6)
    pdf.ln(5)

    # ---- Closing and signature ----
    pdf.cell(0, 7, "Sincerely,", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(12)
    pdf.cell(0, 7, "________________________________________", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, claimant_name, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Enclosures ----
    pdf.set_font("Helvetica", "I", 10)
    pdf.cell(0, 6, "Enclosures: [List supporting documents]", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "cc: [Your records]", new_x="LMARGIN", new_y="NEXT")

    # ---- Disclaimer footer ----
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(0, 5, f"Coverage Status: {coverage}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "I", 7)
    pdf.multi_cell(0, 4, EXPORT_DISCLAIMER)
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 7)
    pdf.cell(0, 4, f"Generated by ClaimPilot on {today.isoformat()}", new_x="LMARGIN", new_y="NEXT")

    return pdf.output()
