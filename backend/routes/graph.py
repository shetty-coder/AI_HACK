from flask import Blueprint, jsonify
from database.db import get_all_incidents

graph_bp = Blueprint('graph', __name__)

@graph_bp.route('/graph/threat-network', methods=['GET'])
def get_threat_graph():
    incidents = get_all_incidents()
    
    nodes = []
    edges = []
    node_ids = set()

    # Central SOC Core Node
    soc_node_id = "SOC-HUB"
    nodes.append({
        'id': soc_node_id,
        'label': 'CyberShield SOC Command',
        'type': 'hub',
        'severity': 'INFO',
        'data': {'description': 'Central Security Operations Hub'}
    })
    node_ids.add(soc_node_id)

    for idx, inc in enumerate(incidents):
        inc_id = inc['id']
        if inc_id not in node_ids:
            nodes.append({
                'id': inc_id,
                'label': f"{inc_id}: {inc['title'][:25]}...",
                'type': 'incident',
                'severity': inc['severity'],
                'data': {
                    'risk_score': inc['risk_score'],
                    'category': inc['category'],
                    'status': inc['status'],
                    'indicators': inc['indicators']
                }
            })
            node_ids.add(inc_id)

            # Link incident to central hub
            edges.append({
                'id': f"e-{soc_node_id}-{inc_id}",
                'source': soc_node_id,
                'target': inc_id,
                'label': 'MONITORED_BY'
            })

        # Add target entity node (URL / IP / Sender)
        target = inc.get('target_identifier', '')
        if target:
            target_node_id = f"ENTITY-{hash(target) & 0xFFFFFF}"
            if target_node_id not in node_ids:
                nodes.append({
                    'id': target_node_id,
                    'label': target[:30],
                    'type': 'entity',
                    'severity': inc['severity'],
                    'data': {'full_identifier': target}
                })
                node_ids.add(target_node_id)

            edges.append({
                'id': f"e-{inc_id}-{target_node_id}",
                'source': inc_id,
                'target': target_node_id,
                'label': 'TARGETS'
            })

        # Add MITRE ATT&CK technique nodes from XAI
        xai_data = inc.get('xai_data', {})
        mitre_list = xai_data.get('mitre_attack', [])
        for m in mitre_list:
            mitre_id = f"MITRE-{m['id']}"
            if mitre_id not in node_ids:
                nodes.append({
                    'id': mitre_id,
                    'label': f"{m['id']}: {m['name']}",
                    'type': 'mitre',
                    'severity': 'HIGH',
                    'data': {'tactic': m['tactic'], 'technique_id': m['id']}
                })
                node_ids.add(mitre_id)

            edges.append({
                'id': f"e-{inc_id}-{mitre_id}",
                'source': inc_id,
                'target': mitre_id,
                'label': 'EXPLOITS_TECHNIQUE'
            })

    return jsonify({'nodes': nodes, 'edges': edges, 'total_incidents_mapped': len(incidents)})
