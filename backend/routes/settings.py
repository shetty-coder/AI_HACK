from flask import Blueprint, request, jsonify
from database.db import get_db, log_audit, create_incident, init_db
import json
import os

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings', methods=['GET'])
def get_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings")
    rows = cursor.fetchall()
    conn.close()
    
    res = {}
    for r in rows:
        # Mask sensitive keys
        val = r['value']
        if 'KEY' in r['key'] or 'SECRET' in r['key']:
            val = '••••••••' + val[-4:] if len(val) > 4 else '••••••••'
        res[r['key']] = val
    return jsonify(res)

@settings_bp.route('/settings', methods=['POST'])
def save_settings():
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()
    for k, v in data.items():
        if v and not v.startswith('••••'):
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
    conn.commit()
    conn.close()
    
    log_audit("SETTINGS_UPDATE", details="Updated application API key settings", severity="INFO")
    return jsonify({'message': 'Settings saved successfully'})

@settings_bp.route('/seed-demo-data', methods=['POST'])
def seed_demo_data():
    """Seeds synthetic incident data into local SQLite database for demonstration."""
    sample_urls_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_phishing_urls.json')
    sample_scams_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_scam_messages.json')

    from detectors.url_detector import analyze_url
    from detectors.text_detector import analyze_text

    seeded_count = 0
    if os.path.exists(sample_urls_path):
        with open(sample_urls_path, 'r', encoding='utf-8') as f:
            urls_data = json.load(f)
            for item in urls_data:
                res = analyze_url(item['url'])
                if res['risk_score'] >= 20:
                    inc_id = f"INC-SEED-{seeded_count+101}"
                    create_incident({
                        'id': inc_id,
                        'title': f"Phishing / Impersonation Link: {item['url'][:40]}",
                        'category': res['threat_category'],
                        'risk_score': res['risk_score'],
                        'severity': res['severity'],
                        'confidence': res['confidence'],
                        'indicators': res['evidence'],
                        'reasoning': res['reasoning'],
                        'xai_data': {'mitre_attack': res['mitre_attack']},
                        'recommended_steps': res['recommended_steps'],
                        'status': 'NEW' if seeded_count % 2 == 0 else 'INVESTIGATING',
                        'target_identifier': item['url']
                    })
                    seeded_count += 1

    if os.path.exists(sample_scams_path):
        with open(sample_scams_path, 'r', encoding='utf-8') as f:
            scam_data = json.load(f)
            for item in scam_data:
                res = analyze_text(item['text'])
                if res['risk_score'] >= 20:
                    inc_id = f"INC-SEED-{seeded_count+101}"
                    create_incident({
                        'id': inc_id,
                        'title': f"Scam Message: {res['threat_category']}",
                        'category': res['threat_category'],
                        'risk_score': res['risk_score'],
                        'severity': res['severity'],
                        'confidence': res['confidence'],
                        'indicators': res['evidence'],
                        'reasoning': res['reasoning'],
                        'xai_data': {'mitre_attack': res['mitre_attack']},
                        'recommended_steps': res['recommended_steps'],
                        'status': 'RESOLVED' if seeded_count % 3 == 0 else 'NEW',
                        'target_identifier': item['text'][:50]
                    })
                    seeded_count += 1

    log_audit("SEED_DEMO_DATA", details=f"Seeded {seeded_count} synthetic incidents into local SQLite DB", severity="INFO")
    return jsonify({'message': f'Successfully seeded {seeded_count} demo incidents into database', 'count': seeded_count})
