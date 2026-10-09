import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'cybershield.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=30000;")
    except Exception:
        pass
    return conn

def init_db():
    conn = get_db()
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    log_audit("SYSTEM_INIT", "System", "CyberShield AI X Backend DB initialized", "INFO")

def log_audit(action, actor="SOC Analyst", details="", severity="INFO", target="System"):
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO audit_logs (action, actor, details, severity, target) VALUES (?, ?, ?, ?, ?)",
            (action, actor, details, severity, target)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging audit: {e}")

def get_all_incidents():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        item = dict(r)
        item['indicators'] = json.loads(item['indicators']) if item['indicators'] else []
        item['reasoning'] = json.loads(item['reasoning']) if item['reasoning'] else []
        item['xai_data'] = json.loads(item['xai_data']) if item['xai_data'] else {}
        item['recommended_steps'] = json.loads(item['recommended_steps']) if item['recommended_steps'] else []
        results.append(item)
    return results

def get_incident_by_id(incident_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    item = dict(r)
    item['indicators'] = json.loads(item['indicators']) if item['indicators'] else []
    item['reasoning'] = json.loads(item['reasoning']) if item['reasoning'] else []
    item['xai_data'] = json.loads(item['xai_data']) if item['xai_data'] else {}
    item['recommended_steps'] = json.loads(item['recommended_steps']) if item['recommended_steps'] else []
    return item

def create_incident(incident_data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO incidents (id, title, category, risk_score, severity, confidence, indicators, reasoning, xai_data, recommended_steps, status, target_identifier, analyst_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_data['id'],
        incident_data['title'],
        incident_data['category'],
        incident_data['risk_score'],
        incident_data['severity'],
        incident_data['confidence'],
        json.dumps(incident_data.get('indicators', [])),
        json.dumps(incident_data.get('reasoning', [])),
        json.dumps(incident_data.get('xai_data', {})),
        json.dumps(incident_data.get('recommended_steps', [])),
        incident_data.get('status', 'NEW'),
        incident_data.get('target_identifier', ''),
        incident_data.get('analyst_notes', '')
    ))
    conn.commit()
    conn.close()
    log_audit("INCIDENT_CREATED", "System", f"Created incident {incident_data['id']}: {incident_data['title']}", incident_data['severity'], incident_data['id'])

def update_incident_status(incident_id, status, notes=None):
    conn = get_db()
    cursor = conn.cursor()
    if notes is not None:
        cursor.execute("UPDATE incidents SET status = ?, analyst_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (status, notes, incident_id))
    else:
        cursor.execute("UPDATE incidents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (status, incident_id))
    conn.commit()
    conn.close()
    log_audit("INCIDENT_STATUS_CHANGE", "SOC Analyst", f"Updated status of {incident_id} to {status}", "MEDIUM", incident_id)

def add_to_watchlist(item, item_type, reason, status="BLOCKED"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO watchlist (item, item_type, reason, status)
        VALUES (?, ?, ?, ?)
    """, (item, item_type, reason, status))
    conn.commit()
    conn.close()
    log_audit("WATCHLIST_ADD", "SOC Analyst", f"Added {item} ({item_type}) to watchlist [SIMULATION]", "HIGH", item)

def get_watchlist():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM watchlist ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_audit_logs(limit=100):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
