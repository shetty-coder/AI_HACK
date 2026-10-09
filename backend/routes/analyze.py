from flask import Blueprint, request, jsonify
import uuid
import pandas as pd
import io
from detectors.url_detector import analyze_url
from detectors.text_detector import analyze_text
from detectors.eml_parser import parse_eml_content
from detectors.network_detector import analyze_network_df
from services.xai_engine import generate_xai_report
from services.external_api import check_virustotal_url, check_google_safebrowsing
from database.db import create_incident, get_db, log_audit

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/analyze/url', methods=['POST'])
def handle_url_analysis():
    data = request.get_json() or {}
    url = data.get('url', '').strip()
    if not url:
        return jsonify({'error': 'URL string is required'}), 400

    result = analyze_url(url)
    
    # Check reputation if requested/configured
    vt_res = check_virustotal_url(url)
    gsb_res = check_google_safebrowsing(url)
    result['reputation_vt'] = vt_res
    result['reputation_gsb'] = gsb_res

    # Generate XAI Report
    xai = generate_xai_report(
        'URL', result['target'], result['risk_score'], result['severity'],
        result['confidence'], result['evidence'], result['reasoning'],
        result['features'], result['mitre_attack']
    )
    result['xai_report'] = xai

    # Auto-create incident if risk_score >= 20
    incident_id = None
    if result['risk_score'] >= 20:
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        incident_data = {
            'id': incident_id,
            'title': f"Phishing / Malicious Link: {url[:50]}",
            'category': result['threat_category'],
            'risk_score': result['risk_score'],
            'severity': result['severity'],
            'confidence': result['confidence'],
            'indicators': result['evidence'],
            'reasoning': result['reasoning'],
            'xai_data': xai,
            'recommended_steps': result['recommended_steps'],
            'status': 'NEW',
            'target_identifier': url,
            'analyst_notes': 'Automatically created from multi-modal URL scan.'
        }
        create_incident(incident_data)
        
    result['incident_id'] = incident_id
    log_audit("SCAN_URL", details=f"Scanned URL: {url} (Risk: {result['risk_score']})", severity=result['severity'], target=url)

    return jsonify(result)

@analyze_bp.route('/analyze/message', methods=['POST'])
def handle_message_analysis():
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'Message text is required'}), 400

    result = analyze_text(text)
    xai = generate_xai_report(
        'MESSAGE', result['target'], result['risk_score'], result['severity'],
        result['confidence'], result['evidence'], result['reasoning'],
        None, result['mitre_attack']
    )
    result['xai_report'] = xai

    incident_id = None
    if result['risk_score'] >= 35:
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        incident_data = {
            'id': incident_id,
            'title': f"Scam / Social Engineering: {result['threat_category']}",
            'category': result['threat_category'],
            'risk_score': result['risk_score'],
            'severity': result['severity'],
            'confidence': result['confidence'],
            'indicators': result['evidence'],
            'reasoning': result['reasoning'],
            'xai_data': xai,
            'recommended_steps': result['recommended_steps'],
            'status': 'NEW',
            'target_identifier': text[:60],
            'analyst_notes': 'Created from AI Scam Message classification.'
        }
        create_incident(incident_data)
        
    result['incident_id'] = incident_id
    log_audit("SCAN_MESSAGE", details=f"Scanned Text Message (Risk: {result['risk_score']})", severity=result['severity'])
    return jsonify(result)

@analyze_bp.route('/analyze/eml', methods=['POST'])
def handle_eml_analysis():
    if 'file' not in request.files:
        return jsonify({'error': 'No EML file uploaded'}), 400
    file = request.files['file']
    if not file.filename.endswith('.eml'):
        return jsonify({'error': 'Only .eml files are supported'}), 400

    raw_bytes = file.read()
    result = parse_eml_content(raw_bytes)
    if 'error' in result:
        return jsonify(result), 400

    xai = generate_xai_report(
        'EMAIL', result['target'], result['risk_score'], result['severity'],
        result['confidence'], result['evidence'], result['reasoning'],
        None, result['mitre_attack']
    )
    result['xai_report'] = xai

    incident_id = None
    if result['risk_score'] >= 35:
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        incident_data = {
            'id': incident_id,
            'title': f"Email Threat: {result['headers']['subject'] or 'No Subject'}",
            'category': result['threat_category'],
            'risk_score': result['risk_score'],
            'severity': result['severity'],
            'confidence': result['confidence'],
            'indicators': result['evidence'],
            'reasoning': result['reasoning'],
            'xai_data': xai,
            'recommended_steps': result['recommended_steps'],
            'status': 'NEW',
            'target_identifier': result['headers']['from'],
            'analyst_notes': f"Parsed .eml file from {result['headers']['from']}"
        }
        create_incident(incident_data)
        
    result['incident_id'] = incident_id
    log_audit("SCAN_EML", details=f"Parsed EML File: {file.filename} (Risk: {result['risk_score']})", severity=result['severity'])
    return jsonify(result)

@analyze_bp.route('/analyze/network', methods=['POST'])
def handle_network_analysis():
    df = None
    if 'file' in request.files:
        file = request.files['file']
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Uploaded file must be CSV'}), 400
        df = pd.read_csv(io.BytesIO(file.read()))
    else:
        data = request.get_json() or {}
        if data.get('use_sample'):
            sample_path = 'data/sample_network_traffic.csv'
            import os
            full_path = os.path.join(os.path.dirname(__file__), '..', sample_path)
            df = pd.read_csv(full_path)
        else:
            return jsonify({'error': 'No CSV file provided and sample mode not flagged'}), 400

    result = analyze_network_df(df)
    if 'error' in result:
        return jsonify(result), 400

    xai = generate_xai_report(
        'NETWORK', result['target'], result['risk_score'], result['severity'],
        result['confidence'], result['evidence'], result['reasoning'],
        None, result['mitre_attack']
    )
    result['xai_report'] = xai

    incident_id = None
    if result['risk_score'] >= 35:
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        incident_data = {
            'id': incident_id,
            'title': f"Network Intrusion Anomaly Batch ({result['anomalous_records']} flagged flows)",
            'category': result['threat_category'],
            'risk_score': result['risk_score'],
            'severity': result['severity'],
            'confidence': result['confidence'],
            'indicators': result['evidence'],
            'reasoning': result['reasoning'],
            'xai_data': xai,
            'recommended_steps': result['recommended_steps'],
            'status': 'NEW',
            'target_identifier': f"Src IPs: {', '.join(result['suspicious_src_ips'][:3])}",
            'analyst_notes': 'Created from Isolation Forest network anomaly batch.'
        }
        create_incident(incident_data)

    result['incident_id'] = incident_id
    log_audit("SCAN_NETWORK", details=f"Analyzed {result['total_records']} network flow records (Anomalies: {result['anomalous_records']})", severity=result['severity'])
    return jsonify(result)
