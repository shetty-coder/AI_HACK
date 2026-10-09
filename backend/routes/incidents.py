from flask import Blueprint, request, jsonify
from database.db import get_all_incidents, get_incident_by_id, update_incident_status, add_to_watchlist, get_watchlist, log_audit

incidents_bp = Blueprint('incidents', __name__)

@incidents_bp.route('/incidents', methods=['GET'])
def list_incidents():
    incidents = get_all_incidents()
    return jsonify(incidents)

@incidents_bp.route('/incidents/<incident_id>', methods=['GET'])
def fetch_incident(incident_id):
    inc = get_incident_by_id(incident_id)
    if not inc:
        return jsonify({'error': 'Incident not found'}), 404
    return jsonify(inc)

@incidents_bp.route('/incidents/<incident_id>/status', methods=['PATCH'])
def update_status(incident_id):
    data = request.get_json() or {}
    status = data.get('status')
    notes = data.get('notes')
    if status not in ['NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED']:
        return jsonify({'error': 'Invalid status value'}), 400

    inc = get_incident_by_id(incident_id)
    if not inc:
        return jsonify({'error': 'Incident not found'}), 404

    update_incident_status(incident_id, status, notes)
    return jsonify({'message': f'Incident {incident_id} updated to {status}', 'id': incident_id, 'status': status})

@incidents_bp.route('/incidents/<incident_id>/simulate-action', methods=['POST'])
def simulate_action(incident_id):
    data = request.get_json() or {}
    action_type = data.get('action_type') # BLOCK_URL, BLOCK_SENDER, ISOLATE_HOST, REVOKE_SESSION
    target = data.get('target', '')

    inc = get_incident_by_id(incident_id)
    if not inc:
        return jsonify({'error': 'Incident not found'}), 404

    sim_result = {}
    if action_type == 'BLOCK_URL':
        add_to_watchlist(target or inc['target_identifier'], 'URL', f"Block requested for incident {incident_id}")
        sim_result = {
            'action': 'BLOCK_URL',
            'status': 'SUCCESS [SIMULATION]',
            'message': f"Added URL/Domain {target or inc['target_identifier']} to internal SOC watchlist."
        }
    elif action_type == 'BLOCK_SENDER':
        add_to_watchlist(target or inc['target_identifier'], 'SENDER', f"Block requested for incident {incident_id}")
        sim_result = {
            'action': 'BLOCK_SENDER',
            'status': 'SUCCESS [SIMULATION]',
            'message': f"Added Sender {target or inc['target_identifier']} to internal spam filter blocklist."
        }
    elif action_type == 'ISOLATE_HOST':
        log_audit("HOST_ISOLATION_SIMULATION", details=f"Simulated EDR host isolation for {target or 'Endpoint'}", severity="HIGH", target=target)
        sim_result = {
            'action': 'ISOLATE_HOST',
            'status': 'SUCCESS [SIMULATION]',
            'message': f"Simulated network connection cut & host containment for {target or 'Affected Endpoint'}."
        }
    elif action_type == 'REVOKE_SESSION':
        log_audit("SESSION_REVOCATION_SIMULATION", details=f"Simulated session revocation for {target or 'User Account'}", severity="MEDIUM", target=target)
        sim_result = {
            'action': 'REVOKE_SESSION',
            'status': 'SUCCESS [SIMULATION]',
            'message': f"Simulated OAuth & Active Directory token revocation for {target or 'Target Session'}."
        }
    else:
        return jsonify({'error': 'Unknown action type'}), 400

    # Auto update incident status to CONTAINED if action taken
    update_incident_status(incident_id, 'CONTAINED', f"Simulated response action '{action_type}' executed by SOC analyst.")
    return jsonify(sim_result)

@incidents_bp.route('/watchlist', methods=['GET'])
def fetch_watchlist():
    items = get_watchlist()
    return jsonify(items)
