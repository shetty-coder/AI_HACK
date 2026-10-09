import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_json_report(incident):
    return {
        'report_metadata': {
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'platform': 'CyberShield AI X Platform v1.0',
            'security_classification': 'CONFIDENTIAL // SOC AUDIT REPORT'
        },
        'incident_summary': incident
    }

def generate_pdf_report(incident):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#0284C7'),
        spaceBefore=12,
        spaceAfter=6
    )
    normal_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4
    )
    bold_style = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )

    story = []

    # Header Title
    story.append(Paragraph("CyberShield AI X — Incident Audit Report", title_style))
    story.append(Paragraph(f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Classification: SOC INTERNAL USE", normal_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284C7'), spaceBefore=8, spaceAfter=15))

    # Key Metadata Table
    sev_color = colors.HexColor('#EF4444') if incident.get('severity') == 'CRITICAL' else \
                colors.HexColor('#F97316') if incident.get('severity') == 'HIGH' else \
                colors.HexColor('#F59E0B') if incident.get('severity') == 'MEDIUM' else \
                colors.HexColor('#10B981')

    meta_data = [
        [Paragraph("<b>Incident ID:</b>", normal_style), Paragraph(str(incident.get('id')), bold_style),
         Paragraph("<b>Severity:</b>", normal_style), Paragraph(f"<font color='{sev_color.hexval()}'><b>{incident.get('severity')}</b></font>", bold_style)],
        [Paragraph("<b>Threat Category:</b>", normal_style), Paragraph(str(incident.get('category')), normal_style),
         Paragraph("<b>Risk Score:</b>", normal_style), Paragraph(f"<b>{incident.get('risk_score')}/100</b>", bold_style)],
        [Paragraph("<b>Status:</b>", normal_style), Paragraph(str(incident.get('status')), normal_style),
         Paragraph("<b>Confidence:</b>", normal_style), Paragraph(f"<b>{int(incident.get('confidence', 0.85)*100)}%</b>", normal_style)],
        [Paragraph("<b>Target Identifier:</b>", normal_style), Paragraph(str(incident.get('target_identifier', 'N/A'))[:45], normal_style),
         Paragraph("<b>Timestamp:</b>", normal_style), Paragraph(str(incident.get('created_at')), normal_style)]
    ]

    t = Table(meta_data, colWidths=[110, 160, 90, 180])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Incident Title & Overview
    story.append(Paragraph("Incident Summary", heading_style))
    story.append(Paragraph(str(incident.get('title')), bold_style))
    story.append(Spacer(1, 6))

    # Detection Evidence
    story.append(Paragraph("Key Detection Evidence & Indicators", heading_style))
    indicators = incident.get('indicators', [])
    if isinstance(indicators, list) and indicators:
        for ind in indicators:
            story.append(Paragraph(f"• {ind}", normal_style))
    else:
        story.append(Paragraph("No explicit indicators listed.", normal_style))
    story.append(Spacer(1, 8))

    # Model Reasoning
    story.append(Paragraph("Explainable AI (XAI) Model Reasoning", heading_style))
    reasoning = incident.get('reasoning', [])
    if isinstance(reasoning, list) and reasoning:
        for r in reasoning:
            story.append(Paragraph(f"• {r}", normal_style))
    story.append(Spacer(1, 8))

    # Recommended Response Steps
    story.append(Paragraph("Guided Incident Containment & Recovery Actions", heading_style))
    steps = incident.get('recommended_steps', [])
    if isinstance(steps, list) and steps:
        for idx, step in enumerate(steps, 1):
            story.append(Paragraph(f"<b>{idx}.</b> {step}", normal_style))
    story.append(Spacer(1, 8))

    # Analyst Notes
    if incident.get('analyst_notes'):
        story.append(Paragraph("Analyst Notes & Audit Logs", heading_style))
        story.append(Paragraph(str(incident.get('analyst_notes')), normal_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
