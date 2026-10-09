import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database.db import init_db, get_all_incidents, get_audit_logs
from detectors.url_detector import analyze_url
from detectors.text_detector import analyze_text
from detectors.network_detector import analyze_network_df
import pandas as pd

@pytest.fixture
def client():
    app.config['TESTING'] = True
    init_db()
    with app.test_client() as client:
        yield client

def test_url_detector_phishing():
    res = analyze_url("http://paypaI-security-update.com.account-verify-login.tk/signin")
    assert res['risk_score'] >= 50
    assert res['severity'] in ['MEDIUM', 'HIGH', 'CRITICAL']
    assert len(res['evidence']) > 0

def test_url_detector_benign():
    res = analyze_url("https://github.com/torvalds/linux")
    assert res['risk_score'] < 30
    assert res['severity'] in ['INFO', 'LOW']

def test_text_detector_scam():
    res = analyze_text("URGENT: Your HDFC bank account has been locked. Share OTP 892014 to verify KYC immediately.")
    assert res['risk_score'] >= 60
    assert "Banking Impersonation & OTP Theft" in res['threat_category'] or "Scam" in res['threat_category']
    assert len(res['highlights']) > 0

def test_network_detector(client):
    full_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_network_traffic.csv')
    df = pd.read_csv(full_path)
    res = analyze_network_df(df)
    assert res['total_records'] > 0
    assert res['anomalous_records'] >= 0

def test_api_health(client):
    rv = client.get('/api/health')
    json_data = rv.get_json()
    assert rv.status_code == 200
    assert json_data['status'] == 'HEALTHY'

def test_api_url_analysis(client):
    rv = client.post('/api/analyze/url', json={'url': 'http://192.168.1.105:8080/g00gle-login.php'})
    json_data = rv.get_json()
    assert rv.status_code == 200
    assert json_data['risk_score'] >= 50
    assert json_data['incident_id'] is not None

def test_incident_status_update(client):
    # First create an incident
    rv = client.post('/api/analyze/url', json={'url': 'http://amazn-reward-claim.top'})
    inc_id = rv.get_json()['incident_id']
    assert inc_id is not None

    # Update status
    patch_rv = client.patch(f'/api/incidents/{inc_id}/status', json={'status': 'CONTAINED', 'notes': 'Test contained'})
    assert patch_rv.status_code == 200
    assert patch_rv.get_json()['status'] == 'CONTAINED'

def test_simulated_action(client):
    rv = client.post('/api/analyze/url', json={'url': 'http://bad-domain-test.tk'})
    inc_id = rv.get_json()['incident_id']

    act_rv = client.post(f'/api/incidents/{inc_id}/simulate-action', json={'action_type': 'BLOCK_URL', 'target': 'http://bad-domain-test.tk'})
    assert act_rv.status_code == 200
    assert 'SUCCESS [SIMULATION]' in act_rv.get_json()['status']
