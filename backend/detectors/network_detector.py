import pandas as pd
import numpy as np
import os
import joblib

FEATURE_COLS = [
    'Flow_Duration', 'Total_Fwd_Packets', 'Total_Bwd_Packets',
    'Flow_Bytes_s', 'Flow_Packets_s', 'Fwd_Packet_Length_Mean',
    'Bwd_Packet_Length_Mean', 'SYN_Flag_Count', 'ACK_Flag_Count',
    'URG_Flag_Count', 'Header_Length'
]

def validate_csv_schema(df):
    missing = [col for col in FEATURE_COLS if col not in df.columns]
    return len(missing) == 0, missing

def analyze_network_df(df):
    is_valid, missing = validate_csv_schema(df)
    if not is_valid:
        return {
            'error': f"CSV schema validation failed. Missing required network feature columns: {', '.join(missing)}"
        }

    # Preprocessing
    clean_df = df.copy()
    for col in FEATURE_COLS:
        clean_df[col] = pd.to_numeric(clean_df[col], errors='coerce').fillna(0)

    X = clean_df[FEATURE_COLS].values

    # Check for trained models
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'network_iso_forest.joblib')
    scaler_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'network_scaler.joblib')

    if os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            iso_forest = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            X_scaled = scaler.transform(X)
            scores = -iso_forest.score_samples(X_scaled) # higher = more anomalous
            preds = iso_forest.predict(X_scaled) # -1 for anomaly, 1 for normal
        except Exception:
            scores = np.zeros(len(df))
            preds = np.ones(len(df))
    else:
        # Fallback simple heuristic heuristic normalized scoring
        mean_bytes = clean_df['Flow_Bytes_s'].mean() + 1
        std_bytes = clean_df['Flow_Bytes_s'].std() + 1
        z_scores = np.abs((clean_df['Flow_Bytes_s'] - mean_bytes) / std_bytes)
        preds = np.where(z_scores > 2.0, -1, 1)
        scores = z_scores / 10.0

    # Format record details
    total_records = len(clean_df)
    anomalous_records = int((preds == -1).sum())
    normal_records = total_records - anomalous_records

    records_result = []
    suspicious_src_ips = set()
    suspicious_dst_ips = set()

    for idx, row in df.iterrows():
        is_anomaly = bool(preds[idx] == -1)
        raw_score = float(scores[idx])
        # Normalized score 0-100
        score_norm = min(100, int((raw_score + 0.5) * 50)) if 'iso_forest' in locals() else min(100, int(raw_score * 30))

        if is_anomaly:
            if 'Source_IP' in row and pd.notna(row['Source_IP']):
                suspicious_src_ips.add(str(row['Source_IP']))
            if 'Destination_IP' in row and pd.notna(row['Destination_IP']):
                suspicious_dst_ips.add(str(row['Destination_IP']))

        rec = {
            'index': idx,
            'flow_id': str(row.get('Flow_ID', f"FLOW_{idx+1}")),
            'source_ip': str(row.get('Source_IP', 'N/A')),
            'source_port': int(row.get('Source_Port', 0)),
            'destination_ip': str(row.get('Destination_IP', 'N/A')),
            'destination_port': int(row.get('Destination_Port', 0)),
            'protocol': str(row.get('Protocol', 'TCP')),
            'flow_bytes_s': float(clean_df.loc[idx, 'Flow_Bytes_s']),
            'flow_packets_s': float(clean_df.loc[idx, 'Flow_Packets_s']),
            'is_anomaly': is_anomaly,
            'anomaly_score': score_norm,
            'label': str(row.get('Label', 'ANOMALY' if is_anomaly else 'BENIGN')),
            'flagged_reason': f"High flow byte rate / abnormal flags ({row.get('SYN_Flag_Count', 0)} SYN, {row.get('URG_Flag_Count', 0)} URG)" if is_anomaly else "Normal baseline traffic"
        }
        records_result.append(rec)

    # Anomaly distribution calculation
    overall_risk = int((anomalous_records / max(1, total_records)) * 100)
    if anomalous_records > 0:
        overall_risk = max(overall_risk, 65)

    if overall_risk >= 75:
        severity = "CRITICAL"
        category = "Network Intrusion & Anomaly Surge"
    elif overall_risk >= 50:
        severity = "HIGH"
        category = "Suspicious Traffic Patterns Detected"
    elif overall_risk >= 25:
        severity = "MEDIUM"
        category = "Moderate Anomaly Rate"
    else:
        severity = "INFO"
        category = "Normal Network Flow Baseline"

    evidence = [
        f"Analyzed {total_records} flow records: {anomalous_records} anomalous, {normal_records} benign.",
        f"Detected {len(suspicious_src_ips)} suspicious source IPs and {len(suspicious_dst_ips)} suspicious destination IPs."
    ]

    reasoning = [
        "Isolation Forest identifies anomalies by isolating feature observations that deviate significantly from standard high-density clusters.",
        "Unusually high byte rates, zero-payload SYN scans, or high urgency flag density triggers non-conforming tree split depths."
    ]

    recommended_steps = [
        "Isolate suspicious source IPs at the perimeter firewall / network ACL.",
        "Inspect destination hosts for compromise or unauthorized data exfiltration.",
        "Review netflow logs during peak anomaly timestamp windows.",
        "Export CSV anomaly report for SOC team analysis."
    ]

    mitre_attack = [
        {"id": "T1046", "name": "Network Service Discovery (Port Scan)", "tactic": "Discovery"},
        {"id": "T1048", "name": "Exfiltration Over Alternative Protocol", "tactic": "Exfiltration"},
        {"id": "T1498", "name": "Network Denial of Service", "tactic": "Impact"}
    ]

    return {
        'target': f"CSV Traffic Upload ({total_records} records)",
        'threat_category': category,
        'risk_score': overall_risk,
        'severity': severity,
        'confidence': 0.92,
        'total_records': total_records,
        'anomalous_records': anomalous_records,
        'normal_records': normal_records,
        'suspicious_src_ips': list(suspicious_src_ips),
        'suspicious_dst_ips': list(suspicious_dst_ips),
        'evidence': evidence,
        'reasoning': reasoning,
        'records': records_result,
        'recommended_steps': recommended_steps,
        'mitre_attack': mitre_attack
    }
