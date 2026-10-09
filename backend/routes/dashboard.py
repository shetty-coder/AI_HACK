from flask import Blueprint, jsonify
from database.db import get_all_incidents, get_watchlist, get_audit_logs

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    incidents = get_all_incidents()
    total_events = len(incidents) + 120 # Add baseline scan events
    open_incidents = len([i for i in incidents if i['status'] in ['NEW', 'INVESTIGATING']])
    critical_count = len([i for i in incidents if i['severity'] == 'CRITICAL'])
    high_count = len([i for i in incidents if i['severity'] == 'HIGH'])
    medium_count = len([i for i in incidents if i['severity'] == 'MEDIUM'])
    low_count = len([i for i in incidents if i['severity'] in ['LOW', 'INFO']])

    # Security Posture calculation (100 is best, deducts for open critical/highs)
    posture_score = max(15, 100 - (critical_count * 15 + high_count * 8 + open_incidents * 3))
    
    if posture_score >= 80:
        posture_status = "OPTIMAL / STABLE"
    elif posture_score >= 60:
        posture_status = "ELEVATED THREAT RISK"
    elif posture_score >= 40:
        posture_status = "CRITICAL SOC ALERT"
    else:
        posture_status = "ACTIVE SYSTEM COMPROMISE"

    # Severity Distribution
    severity_distribution = [
        {'name': 'CRITICAL', 'value': critical_count, 'color': '#EF4444'},
        {'name': 'HIGH', 'value': high_count, 'color': '#F97316'},
        {'name': 'MEDIUM', 'value': medium_count, 'color': '#F59E0B'},
        {'name': 'LOW / INFO', 'value': low_count, 'color': '#10B981'}
    ]

    # Category breakdown
    categories = {}
    for i in incidents:
        cat = i['category']
        categories[cat] = categories.get(cat, 0) + 1
    category_data = [{'category': k, 'count': v} for k, v in categories.items()]

    watchlist = get_watchlist()
    audit_logs = get_audit_logs(limit=10)

    # Synthetic Trend Data for Recharts
    trend_data = [
        {'time': '00:00', 'urls': 12, 'messages': 24, 'network_anomalies': 5},
        {'time': '04:00', 'urls': 8, 'messages': 18, 'network_anomalies': 2},
        {'time': '08:00', 'urls': 25, 'messages': 42, 'network_anomalies': 18},
        {'time': '12:00', 'urls': 40, 'messages': 65, 'network_anomalies': 32},
        {'time': '16:00', 'urls': 30, 'messages': 50, 'network_anomalies': 22},
        {'time': '20:00', 'urls': 18, 'messages': 30, 'network_anomalies': 10},
    ]

    return jsonify({
        'posture_score': posture_score,
        'posture_status': posture_status,
        'total_events': total_events,
        'open_incidents': open_incidents,
        'critical_count': critical_count,
        'high_count': high_count,
        'watchlist_count': len(watchlist),
        'severity_distribution': severity_distribution,
        'category_distribution': category_data,
        'trend_data': trend_data,
        'recent_incidents': incidents[:8],
        'recent_audit_logs': audit_logs
    })
