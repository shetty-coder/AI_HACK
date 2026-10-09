import re
import os
import joblib

SCAM_KEYWORDS = {
    'OTP Theft': [
        r'\botp\b', r'one time password', r'verification code', r'share your otp', r'do not share', r'confirm code'
    ],
    'Banking Impersonation': [
        r'\bhdfc\b', r'\bicici\b', r'\bsbi\b', r'bank account', r'kyc\b', r'account suspended', r'account locked',
        r'update kyc', r'netbanking', r'credit card'
    ],
    'UPI / Financial Fraud': [
        r'\bupi\b', r'paytm', r'phonepe', r'gpay', r'@okicici', r'@axisbank', r'@ybl', r'transfer money', r'processing fee'
    ],
    'Fake Job Offer': [
        r'work from home', r'earn rs', r'registration fee', r'no experience needed', r'daily payout', r'part-time job'
    ],
    'Lottery & Advance Fee': [
        r'congratulations', r'won \$', r'lottery', r'claim your prize', r'claim bonus', r'lucky draw', r'reward'
    ],
    'Urgency & Threat': [
        r'urgent', r'immediately', r'within 12 hours', r'within 24 hours', r'permanently closed', r'expired', r'action required'
    ],
    'Crypto / Investment Scam': [
        r'crypto', r'bitcoin', r'guaranteed return', r'wealth multiplier', r'trading bot', r'double your investment'
    ],
    'Delivery Scam': [
        r'fedex', r'dhl', r'usps', r'package delivery', r'customs fee', r'unpaid fee', r'address update'
    ]
}

def extract_entities(text):
    urls = re.findall(r'https?://[^\s]+', text)
    phones = re.findall(r'\+?\d{10,12}', text)
    upis = re.findall(r'[a-zA-Z0-9.\-_]+@[a-zA-Z]+', text)
    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    # Filter out upis that are emails if upi format matches standard banking handles like @okicici, @ybl, @paytm
    upi_handles = ['@okicici', '@axisbank', '@ybl', '@paytm', '@sbi', '@icici', '@upi', '@okaxis', '@okhdfcbank']
    actual_upis = [u for u in upis if any(u.endswith(h) for h in upi_handles)]
    
    return {
        'urls': list(set(urls)),
        'phones': list(set(phones)),
        'upis': list(set(actual_upis)),
        'emails': list(set(emails))
    }

def find_highlights(text):
    highlights = []
    text_lower = text.lower()
    
    for category, patterns in SCAM_KEYWORDS.items():
        for pattern in patterns:
            for match in re.finditer(pattern, text_lower):
                highlights.append({
                    'start': match.start(),
                    'end': match.end(),
                    'text': text[match.start():match.end()],
                    'category': category
                })
    return highlights

def analyze_text(text):
    highlights = find_highlights(text)
    entities = extract_entities(text)
    
    evidence = []
    reasoning = []
    matched_categories = set()
    rule_score = 0
    
    for h in highlights:
        matched_categories.add(h['category'])
        
    for cat in matched_categories:
        if cat in ['OTP Theft', 'Banking Impersonation', 'UPI / Financial Fraud']:
            rule_score += 35
            evidence.append(f"Contains {cat} indicators: Sensitive credential/financial solicitation.")
            reasoning.append("Financial scams use urgent prompts to coax victims into releasing OTPs, PINs, or transferring money via UPI.")
        elif cat in ['Urgency & Threat', 'Fake Job Offer', 'Lottery & Advance Fee']:
            rule_score += 25
            evidence.append(f"Contains {cat} indicators: High urgency or unrealistic reward promises.")
            reasoning.append("Scammers rely on psychological triggers (fear of loss or lure of instant gain) to bypass critical thinking.")
        elif cat in ['Crypto / Investment Scam', 'Delivery Scam']:
            rule_score += 20
            evidence.append(f"Contains {cat} indicators.")
            reasoning.append("Delivery and investment scams lure users into clicking suspicious external links or paying fake fees.")

    if entities['urls']:
        rule_score += 20
        evidence.append(f"Contains embedded URLs: {', '.join(entities['urls'])}")
        reasoning.append("Embedded links in unverified SMS/messages often route to credential harvesting landing pages.")

    if entities['upis']:
        rule_score += 25
        evidence.append(f"Contains payment handles (UPI): {', '.join(entities['upis'])}")
        reasoning.append("Direct UPI addresses in unsolicited texts are strong signals of peer-to-peer financial extortion.")

    # Try trained model
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'text_model.joblib')
    vectorizer_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'text_vectorizer.joblib')
    
    ml_confidence = 0.88
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        try:
            model = joblib.load(model_path)
            vectorizer = joblib.load(vectorizer_path)
            vec = vectorizer.transform([text])
            prob = model.predict_proba(vec)[0][1]
            ml_risk = int(prob * 100)
            risk_score = int(0.5 * rule_score + 0.5 * ml_risk)
            ml_confidence = round(float(max(prob, 1 - prob)), 2)
        except Exception:
            risk_score = min(100, rule_score)
    else:
        risk_score = min(100, rule_score)

    if risk_score >= 80:
        severity = "CRITICAL"
        threat_category = "High-Confidence Scam / Financial Phishing"
    elif risk_score >= 60:
        severity = "HIGH"
        threat_category = "Suspicious Fraud / Social Engineering"
    elif risk_score >= 35:
        severity = "MEDIUM"
        threat_category = "Potentially Unwanted / Spam Message"
    elif risk_score >= 15:
        severity = "LOW"
        threat_category = "Low-Risk Message / Low Confidence Match"
    else:
        severity = "INFO"
        threat_category = "Benign Message"
        if not evidence:
            evidence.append("No scam keywords or social engineering tactics detected.")
            reasoning.append("Standard conversational or legitimate business communication language.")

    recommended_steps = [
        "Do NOT reply to the sender or click any embedded links.",
        "Do NOT share OTPs, PINs, or personal identity documents.",
        "Report sender number/handle to telecom carrier and local fraud registry.",
        "Flag message in mail gateway filters if delivered via corporate email."
    ]

    mitre_attack = []
    if risk_score >= 35:
        mitre_attack = [
            {"id": "T1566.002", "name": "Phishing: Spearphishing Link / Service", "tactic": "Initial Access"},
            {"id": "T1598", "name": "Phishing for Information", "tactic": "Reconnaissance"}
        ]

    return {
        'target': text[:80] + ('...' if len(text) > 80 else ''),
        'full_text': text,
        'threat_category': threat_category,
        'risk_score': risk_score,
        'severity': severity,
        'confidence': ml_confidence,
        'evidence': evidence,
        'reasoning': reasoning,
        'highlights': highlights,
        'entities': entities,
        'recommended_steps': recommended_steps,
        'mitre_attack': mitre_attack
    }
