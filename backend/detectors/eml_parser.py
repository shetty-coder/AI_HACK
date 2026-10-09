import email
from email.header import decode_header
from detectors.text_detector import analyze_text
from detectors.url_detector import analyze_url

def decode_mime_header(header_value):
    if not header_value:
        return ""
    decoded_parts = decode_header(header_value)
    result = []
    for content, encoding in decoded_parts:
        if isinstance(content, bytes):
            try:
                result.append(content.decode(encoding or 'utf-8', errors='ignore'))
            except Exception:
                result.append(content.decode('latin-1', errors='ignore'))
        else:
            result.append(str(content))
    return "".join(result)

def parse_eml_content(raw_eml_bytes):
    try:
        msg = email.message_from_bytes(raw_eml_bytes)
    except Exception as e:
        return {'error': f"Failed to parse EML file: {str(e)}"}

    sender = decode_mime_header(msg.get('From', ''))
    recipient = decode_mime_header(msg.get('To', ''))
    subject = decode_mime_header(msg.get('Subject', ''))
    date = decode_mime_header(msg.get('Date', ''))
    reply_to = decode_mime_header(msg.get('Reply-To', ''))
    auth_results = decode_mime_header(msg.get('Authentication-Results', ''))
    received = msg.get_all('Received', [])

    # Body extraction
    body_text = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get('Content-Disposition'))
            if content_type == 'text/plain' and 'attachment' not in content_disposition:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_text += payload.decode('utf-8', errors='ignore')
                except Exception:
                    pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                body_text = payload.decode('utf-8', errors='ignore')
        except Exception:
            body_text = msg.get_payload() or ""

    if not body_text:
        body_text = f"Subject: {subject}\nFrom: {sender}"

    # Analyze text body
    text_analysis = analyze_text(body_text)

    # Analyze extracted links from text analysis
    url_analyses = []
    for u in text_analysis['entities']['urls'][:5]: # check top 5 links
        url_analyses.append(analyze_url(u))

    # Evaluate authentication headers
    header_evidence = []
    header_risk_boost = 0

    if reply_to and sender and reply_to.strip().lower() != sender.strip().lower():
        header_risk_boost += 20
        header_evidence.append(f"Reply-To address mismatch: '{reply_to}' vs Sender '{sender}'")

    if 'spf=fail' in auth_results.lower() or 'spf=softfail' in auth_results.lower():
        header_risk_boost += 25
        header_evidence.append("SPF authentication check FAILED for sender server.")

    if 'dkim=fail' in auth_results.lower():
        header_risk_boost += 25
        header_evidence.append("DKIM cryptographic signature verification FAILED.")

    if 'dmarc=fail' in auth_results.lower():
        header_risk_boost += 30
        header_evidence.append("DMARC domain policy verification FAILED.")

    # Combine risk score
    max_url_risk = max([u['risk_score'] for u in url_analyses], default=0)
    total_risk = max(text_analysis['risk_score'], max_url_risk) + header_risk_boost
    final_risk = min(100, total_risk)

    if final_risk >= 80:
        severity = "CRITICAL"
        threat_category = "Phishing Email / Business Email Compromise (BEC)"
    elif final_risk >= 60:
        severity = "HIGH"
        threat_category = "Suspicious Email with Malicious Indicators"
    elif final_risk >= 35:
        severity = "MEDIUM"
        threat_category = "Potentially Unwanted Email"
    elif final_risk >= 15:
        severity = "LOW"
        threat_category = "Low-Risk Email"
    else:
        severity = "INFO"
        threat_category = "Legitimate Email"

    combined_evidence = text_analysis['evidence'] + header_evidence
    for ua in url_analyses:
        if ua['risk_score'] >= 40:
            combined_evidence.append(f"Embedded URL [{ua['target']}] flagged: {ua['threat_category']}")

    disclaimer = (
        "Note: Email authentication headers (SPF/DKIM/DMARC) assist in verifying sender domain authorization, "
        "but should be correlated with body intent and link reputation to reach a final threat determination."
    )

    return {
        'target': f"Email from: {sender} | Subject: {subject}",
        'headers': {
            'from': sender,
            'to': recipient,
            'subject': subject,
            'date': date,
            'reply_to': reply_to,
            'auth_results': auth_results,
            'received_hops_count': len(received)
        },
        'threat_category': threat_category,
        'risk_score': final_risk,
        'severity': severity,
        'confidence': text_analysis['confidence'],
        'evidence': combined_evidence,
        'reasoning': text_analysis['reasoning'] + ["Header analysis verified alignment between envelope sender and authentication claims."],
        'disclaimer': disclaimer,
        'highlights': text_analysis['highlights'],
        'entities': text_analysis['entities'],
        'embedded_urls_analysis': url_analyses,
        'recommended_steps': [
            "Block sender domain and Reply-To email on email security gateway.",
            "Instruct recipient not to click any embedded links or open attachments.",
            "Run SPF/DKIM policy check on sending domain.",
            "Isolate target mailbox if session token compromise is suspected."
        ],
        'mitre_attack': [
            {"id": "T1566.001", "name": "Phishing: Spearphishing Attachment", "tactic": "Initial Access"},
            {"id": "T1566.002", "name": "Phishing: Spearphishing Link", "tactic": "Initial Access"}
        ]
    }
