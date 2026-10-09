import urllib.parse
import re
import math
import os
import joblib

TRUSTED_BRANDS = [
    'paypal', 'google', 'microsoft', 'apple', 'amazon', 'facebook',
    'instagram', 'netflix', 'bankofamerica', 'chase', 'hdfc', 'icici',
    'sbi', 'paytm', 'wellsfargo', 'binance', 'coinbase', 'outlook', 'yahoo'
]

URL_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'buff.ly', 'ow.ly', 'rb.gy'
]

SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.zip', '.mov', '.buzz', '.monster'
]

def calculate_entropy(text):
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum([p * math.log(p, 2) for p in prob])

def extract_url_features(url):
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname or ''
    path = parsed.path or ''
    query = parsed.query or ''
    scheme = parsed.scheme or ''
    port = parsed.port
    
    # Structural features
    url_len = len(url)
    hostname_len = len(hostname)
    dot_count = hostname.count('.')
    hyphen_count = hostname.count('-')
    at_symbol = 1 if '@' in url else 0
    is_ip = 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) else 0
    has_port = 1 if port and port not in [80, 443] else 0
    is_https = 1 if scheme.lower() == 'https' else 0
    is_punycode = 1 if hostname.startswith('xn--') or 'xn--' in hostname else 0
    is_shortener = 1 if any(s in hostname.lower() for s in URL_SHORTENERS) else 0
    tld_suspicious = 1 if any(hostname.lower().endswith(tld) for tld in SUSPICIOUS_TLDS) else 0
    entropy = calculate_entropy(url)
    
    # Brand typosquatting check
    brand_mentions = []
    brand_misuse = 0
    for brand in TRUSTED_BRANDS:
        if brand in hostname.lower() and not hostname.lower().endswith(f".{brand}.com") and hostname.lower() != f"{brand}.com":
            brand_misuse = 1
            brand_mentions.append(brand)
        # Check for typosquatting (e.g., paypaI, g00gle)
        typo_patterns = [
            brand.replace('o', '0'), brand.replace('l', 'I'), brand.replace('l', '1'),
            brand.replace('e', '3'), brand.replace('a', '@'), brand.replace('i', '1')
        ]
        for typo in typo_patterns:
            if typo != brand and typo in hostname.lower():
                brand_misuse = 1
                brand_mentions.append(f"typo of {brand} ({typo})")

    return {
        'url_len': url_len,
        'hostname_len': hostname_len,
        'dot_count': dot_count,
        'hyphen_count': hyphen_count,
        'at_symbol': at_symbol,
        'is_ip': is_ip,
        'has_port': has_port,
        'is_https': is_https,
        'is_punycode': is_punycode,
        'is_shortener': is_shortener,
        'tld_suspicious': tld_suspicious,
        'brand_misuse': brand_misuse,
        'brand_mentions': list(set(brand_mentions)),
        'entropy': entropy,
        'hostname': hostname,
        'scheme': scheme,
        'path': path
    }

def analyze_url(url):
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
        
    feats = extract_url_features(url)
    evidence = []
    reasoning = []
    rule_risk = 0

    if feats['is_ip']:
        rule_risk += 35
        evidence.append("Host is a raw IP address instead of a standard domain name.")
        reasoning.append("Raw IP hosts are frequently used by phishing servers to bypass domain reputation checks.")

    if feats['brand_misuse']:
        rule_risk += 45
        brands_str = ", ".join(feats['brand_mentions'])
        evidence.append(f"Lookalike / typosquatting brand misuse detected: {brands_str}.")
        reasoning.append("Phishers impersonate trusted brands using typos (e.g., 'paypaI', 'g00gle') or excessive subdomains.")

    if feats['tld_suspicious']:
        rule_risk += 30
        evidence.append("Domain uses a high-risk suspicious TLD frequently linked to abuse.")
        reasoning.append("TLDs like .tk, .xyz, .top, .buzz have low registration costs and high malicious registration rates.")

    if feats['is_shortener']:
        rule_risk += 20
        evidence.append("URL uses a shortening service that obscures the destination target.")
        reasoning.append("URL shorteners hide the real landing page, preventing pre-click domain verification.")

    if feats['is_punycode']:
        rule_risk += 35
        evidence.append("Domain uses Internationalized Domain Name (Punycode / IDN) characters.")
        reasoning.append("Punycode homograph attacks substitute lookalike Cyrillic/Greek characters for Latin letters.")

    if feats['at_symbol']:
        rule_risk += 30
        evidence.append("URL contains an '@' symbol in the authority component.")
        reasoning.append("The '@' symbol causes browsers to ignore preceding text as username credentials and connect to the host following '@'.")

    if feats['has_port']:
        rule_risk += 15
        evidence.append("URL specifies a non-standard HTTP/HTTPS port.")
        reasoning.append("Non-standard web ports (e.g. 8080, 9001) often indicate rogue dev servers or C2 endpoints.")

    if feats['url_len'] > 75:
        rule_risk += 15
        evidence.append(f"Excessively long URL string ({feats['url_len']} characters).")
        reasoning.append("Long URLs are used to hide suspicious tokens beyond the visible browser address bar.")

    if feats['dot_count'] >= 4:
        rule_risk += 15
        evidence.append(f"High number of subdomain dots ({feats['dot_count']} dots).")
        reasoning.append("Deeply nested subdomains attempt to mimic full brand domain hierarchies.")

    if not feats['is_https']:
        evidence.append("URL lacks HTTPS encryption (uses plain HTTP).")
        reasoning.append("Plain HTTP leaves user traffic susceptible to eavesdropping and credential sniffing.")

    # Calculate final risk score
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'url_model.joblib')
    ml_confidence = 0.85
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            # Feature vector: [url_len, hostname_len, dot_count, hyphen_count, at_symbol, is_ip, has_port, is_https, is_punycode, is_shortener, tld_suspicious, brand_misuse, entropy]
            X = [[feats['url_len'], feats['hostname_len'], feats['dot_count'], feats['hyphen_count'],
                  feats['at_symbol'], feats['is_ip'], feats['has_port'], feats['is_https'],
                  feats['is_punycode'], feats['is_shortener'], feats['tld_suspicious'], feats['brand_misuse'], feats['entropy']]]
            prob = model.predict_proba(X)[0][1]
            ml_risk = int(prob * 100)
            risk_score = int(0.6 * rule_risk + 0.4 * ml_risk)
            ml_confidence = round(float(max(prob, 1 - prob)), 2)
        except Exception as e:
            risk_score = min(100, rule_risk)
    else:
        risk_score = min(100, rule_risk)

    if risk_score >= 80:
        severity = "CRITICAL"
        category = "High-Risk Phishing & Impersonation"
    elif risk_score >= 60:
        severity = "HIGH"
        category = "Suspicious Phishing / Malicious Link"
    elif risk_score >= 35:
        severity = "MEDIUM"
        category = "Potentially Unwanted / Obscured Link"
    elif risk_score >= 15:
        severity = "LOW"
        category = "Low Risk / Unencrypted HTTP"
    else:
        severity = "INFO"
        category = "Benign URL"
        if not evidence:
            evidence.append("URL structure matches benign security patterns.")
            reasoning.append("Valid domain hierarchy, legitimate TLD, standard HTTPS protocol.")

    recommended_steps = [
        "Do NOT click or open the link in any production browser.",
        "Add the domain/IP to the SOC application watchlist.",
        "Query threat intelligence (VirusTotal / Safe Browsing) if API key configured.",
        "Check mail gateway logs for other recipients of this link."
    ]

    mitre_attack = []
    if risk_score >= 35:
        mitre_attack = [
            {"id": "T1566.002", "name": "Phishing: Spearphishing Link", "tactic": "Initial Access"},
            {"id": "T1600", "name": "Unsecured Communications", "tactic": "Command and Control"}
        ]

    return {
        'target': url,
        'threat_category': category,
        'risk_score': risk_score,
        'severity': severity,
        'confidence': ml_confidence,
        'evidence': evidence,
        'reasoning': reasoning,
        'recommended_steps': recommended_steps,
        'features': feats,
        'mitre_attack': mitre_attack
    }
