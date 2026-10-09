from flask import Blueprint, request, jsonify
from database.db import get_incident_by_id, get_all_incidents, log_audit

copilot_bp = Blueprint('copilot', __name__)

@copilot_bp.route('/copilot/query', methods=['POST'])
def handle_copilot_query():
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    incident_id = data.get('incident_id')

    if not query:
        return jsonify({'error': 'Query text is required'}), 400

    target_incident = None
    if incident_id:
        target_incident = get_incident_by_id(incident_id)

    q_lower = query.lower()
    response_text = ""
    suggested_actions = []

    if target_incident:
        if "explain" in q_lower or "what happened" in q_lower or "summary" in q_lower:
            response_text = (
                f"**Incident Summary ({target_incident['id']})**:\n\n"
                f"This incident was flagged as **{target_incident['severity']}** severity with a risk score of **{target_incident['risk_score']}/100**.\n\n"
                f"**Threat Category**: {target_incident['category']}\n"
                f"**Target Identifier**: `{target_incident['target_identifier']}`\n\n"
                f"**Key Findings**:\n" + "\n".join([f"- {ind}" for ind in target_incident['indicators']]) + "\n\n"
                f"**Model Reasoning**:\n" + "\n".join([f"- {r}" for r in target_incident['reasoning']])
            )
            suggested_actions = target_incident.get('recommended_steps', [])

        elif "contain" in q_lower or "remediate" in q_lower or "action" in q_lower:
            response_text = (
                f"**Prioritized Containment Checklist for {target_incident['id']}**:\n\n"
                f"1. **Immediate Quarantine**: Add `{target_incident['target_identifier']}` to SOC watchlist.\n"
                f"2. **Host Isolation (Simulated)**: If endpoint process exfiltration is observed, isolate host.\n"
                f"3. **Mail Gateway Rule**: Block sender handle and subject patterns.\n"
                f"4. **Credential Reset**: Revoke user tokens if OTP theft was attempted."
            )
            suggested_actions = [
                "Execute 'Add URL/Sender to Watchlist' in Incident Response panel",
                "Execute 'Simulated Host Isolation' for target endpoint",
                "Update incident status to CONTAINED"
            ]

        else:
            response_text = (
                f"Based on incident **{target_incident['id']}** (`{target_incident['title']}`):\n\n"
                f"The system calculated a **{target_incident['severity']}** risk level based on calibrated feature scoring. "
                f"Recommended SOC verification steps: {', '.join(target_incident.get('recommended_steps', [])[:2])}."
            )
            suggested_actions = target_incident.get('recommended_steps', [])

    else:
        # General cybersecurity knowledge queries
        if "mitre" in q_lower or "att&ck" in q_lower:
            response_text = (
                "**MITRE ATT&CK Mapping Overview in CyberShield AI X**:\n\n"
                "- **T1566 (Phishing)**: Spearphishing links and attachment delivery.\n"
                "- **T1046 (Network Service Discovery)**: Automated port scanning and SYN sweep probes.\n"
                "- **T1048 (Exfiltration)**: High-volume outbound flow anomalies over non-standard ports.\n"
                "- **T1598 (Phishing for Information)**: Urgent social engineering and OTP solicitation."
            )
        elif "phishing" in q_lower or "url" in q_lower:
            response_text = (
                "**How CyberShield AI X Detects URL Threats**:\n\n"
                "1. **Structural Feature Extraction**: URL length, entropy, raw IP authority, subdomains count, non-standard ports.\n"
                "2. **Typosquatting Engine**: Detects homograph substitutions (e.g. `paypaI`, `g00gle`) and Punycode (`xn--`).\n"
                "3. **Machine Learning Model**: Random Forest model trained on URL feature sets yielding calibrated 0-100 risk scores."
            )
        elif "network" in q_lower or "isolation forest" in q_lower:
            response_text = (
                "**Network Intrusion Detection Mechanics**:\n\n"
                "Our backend uses an **Isolation Forest** unsupervised anomaly detector. "
                "It isolates flow metrics (Flow Duration, Bytes/sec, SYN/URG flag ratios) that deviate from baseline clusters, "
                "flagging potential port scans, C2 beaconing, and denial-of-service sweeps."
            )
        else:
            all_incs = get_all_incidents()
            response_text = (
                f"I am your **CyberShield AI Security Copilot**. Currently monitoring **{len(all_incs)} active incidents** in local SQLite database.\n\n"
                "You can ask me to:\n"
                "- Explain a specific incident ID (e.g. 'Explain INC-9201A8')\n"
                "- Suggest containment playbooks for scam messages or network anomalies\n"
                "- Clarify MITRE ATT&CK technique mappings or XAI feature importance."
            )

    log_audit("COPILOT_QUERY", details=f"Copilot query: '{query[:40]}...'", severity="INFO")
    return jsonify({
        'query': query,
        'response': response_text,
        'suggested_actions': suggested_actions,
        'incident_context_used': bool(target_incident)
    })
