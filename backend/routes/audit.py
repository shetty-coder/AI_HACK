from flask import Blueprint, jsonify, send_file, request, Response
from database.db import get_audit_logs, get_incident_by_id
from services.report_generator import generate_pdf_report, generate_json_report
import io
import json

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/audit/logs', methods=['GET'])
def fetch_audit_logs():
    limit = request.args.get('limit', default=100, type=int)
    logs = get_audit_logs(limit=limit)
    return jsonify(logs)

@audit_bp.route('/reports/<incident_id>/pdf', methods=['GET'])
def download_pdf_report(incident_id):
    inc = get_incident_by_id(incident_id)
    if not inc:
        return jsonify({'error': 'Incident not found'}), 404

    pdf_bytes = generate_pdf_report(inc)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"CyberShield_Report_{incident_id}.pdf"
    )

@audit_bp.route('/reports/<incident_id>/json', methods=['GET'])
def download_json_report(incident_id):
    inc = get_incident_by_id(incident_id)
    if not inc:
        return jsonify({'error': 'Incident not found'}), 404

    json_report = generate_json_report(inc)
    return Response(
        json.dumps(json_report, indent=2),
        mimetype='application/json',
        headers={'Content-Disposition': f'attachment;filename=CyberShield_Report_{incident_id}.json'}
    )
