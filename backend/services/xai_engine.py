def generate_xai_report(threat_type, target, risk_score, severity, confidence, evidence, reasoning, features=None, mitre_attack=None):
    """
    Synthesizes Explainable AI (XAI) breakdown including feature influences, matched rules, confidence factors,
    missing evidence context, and recommended verification steps.
    """
    feature_contributions = []
    
    if threat_type == 'URL' and features:
        if features.get('brand_misuse'):
            feature_contributions.append({'feature': 'Typosquatting / Brand Misuse', 'weight': '+40%', 'impact': 'HIGH_RISK', 'detail': f"Mentions: {', '.join(features.get('brand_mentions', []))}"})
        if features.get('is_ip'):
            feature_contributions.append({'feature': 'Raw IP Host Authority', 'weight': '+35%', 'impact': 'HIGH_RISK', 'detail': f"IP Host: {features.get('hostname')}"})
        if features.get('is_punycode'):
            feature_contributions.append({'feature': 'Punycode / IDN Homograph', 'weight': '+35%', 'impact': 'HIGH_RISK', 'detail': 'Contains non-Latin homograph characters'})
        if features.get('at_symbol'):
            feature_contributions.append({'feature': '@ Symbol Credentials Trick', 'weight': '+30%', 'impact': 'MEDIUM_RISK', 'detail': 'Browsers ignore lead text before @'})
        if features.get('tld_suspicious'):
            feature_contributions.append({'feature': 'High-Abuse TLD', 'weight': '+25%', 'impact': 'MEDIUM_RISK', 'detail': 'Domain ends with suspicious top-level domain'})
        if features.get('is_shortener'):
            feature_contributions.append({'feature': 'URL Shortener Redirection', 'weight': '+20%', 'impact': 'MEDIUM_RISK', 'detail': 'Target destination is obscured'})
        if features.get('is_https'):
            feature_contributions.append({'feature': 'HTTPS Protocol Present', 'weight': '-10%', 'impact': 'REDUCES_RISK', 'detail': 'Encryption active (does not guarantee server trust)'})
        else:
            feature_contributions.append({'feature': 'Plain HTTP (Unencrypted)', 'weight': '+15%', 'impact': 'MEDIUM_RISK', 'detail': 'Traffic subject to MITM eavesdropping'})

    elif threat_type == 'MESSAGE' or threat_type == 'EMAIL':
        feature_contributions.append({'feature': 'Financial & Urgent Keywords', 'weight': '+45%', 'impact': 'HIGH_RISK', 'detail': 'Words triggering panic or financial urgency'})
        feature_contributions.append({'feature': 'Unsolicited Contact Channel', 'weight': '+25%', 'impact': 'MEDIUM_RISK', 'detail': 'Inbound message from unknown sender handle'})
        if features and features.get('urls'):
            feature_contributions.append({'feature': 'Embedded Call-to-Action Link', 'weight': '+20%', 'impact': 'HIGH_RISK', 'detail': 'Contains external URL redirection'})

    elif threat_type == 'NETWORK':
        feature_contributions.append({'feature': 'Flow Byte Rate Outlier', 'weight': '+40%', 'impact': 'HIGH_RISK', 'detail': 'Transfer rates deviate >3 std-devs from normal'})
        feature_contributions.append({'feature': 'SYN / URG Flag Spikes', 'weight': '+35%', 'impact': 'HIGH_RISK', 'detail': 'Asymmetric handshake flags without ACK response'})
        feature_contributions.append({'feature': 'Short Flow Duration', 'weight': '+20%', 'impact': 'MEDIUM_RISK', 'detail': 'Rapid port scan probing signature'})

    missing_evidence = [
        "Passive DNS historical registration age verification.",
        "End-user device endpoint process tree correlation.",
        "Multi-factor authentication attempt server logs."
    ]

    verification_checklist = [
        "Verify domain creation timestamp on WHOIS registry.",
        "Check local DNS cache for recent resolution queries.",
        "Cross-reference source IP against active SOC threat feed IOC lists.",
        "Confirm whether end-user engaged with the prompt or released credentials."
    ]

    return {
        'target': target,
        'risk_score': risk_score,
        'severity': severity,
        'confidence_percentage': int(confidence * 100),
        'feature_contributions': feature_contributions,
        'evidence_summary': evidence,
        'model_reasoning': reasoning,
        'missing_evidence': missing_evidence,
        'verification_checklist': verification_checklist,
        'mitre_attack': mitre_attack or []
    }
