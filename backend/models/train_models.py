import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

MODELS_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(MODELS_DIR, '..', 'data')

def train_all_models():
    print("=== CyberShield AI X Model Training & Calibration ===")
    
    # 1. Train Text Scam Detector (TF-IDF + SGD Logistic Regression)
    text_data_path = os.path.join(DATA_DIR, 'sample_scam_messages.json')
    if os.path.exists(text_data_path):
        with open(text_data_path, 'r', encoding='utf-8') as f:
            scam_data = json.load(f)
            
        texts = [item['text'] for item in scam_data]
        labels = [item['label'] for item in scam_data]
        
        # Augment synthetic sample size for robust vectorizer vocabulary
        augmented_texts = texts * 5
        augmented_labels = labels * 5
        
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1000)
        X_vec = vectorizer.fit_transform(augmented_texts)
        
        text_model = SGDClassifier(loss='log_loss', max_iter=1000, random_state=42)
        text_model.fit(X_vec, augmented_labels)
        
        joblib.dump(vectorizer, os.path.join(MODELS_DIR, 'text_vectorizer.joblib'))
        joblib.dump(text_model, os.path.join(MODELS_DIR, 'text_model.joblib'))
        print("[OK] Scam Text NLP Model & TF-IDF Vectorizer trained and saved.")

    # 2. Train URL Phishing Classifier (Random Forest)
    url_data_path = os.path.join(DATA_DIR, 'sample_phishing_urls.json')
    if os.path.exists(url_data_path):
        with open(url_data_path, 'r', encoding='utf-8') as f:
            url_samples = json.load(f)
            
        from detectors.url_detector import extract_url_features
        X_feats = []
        y_labels = []
        for s in url_samples:
            f = extract_url_features(s['url'])
            vec = [
                f['url_len'], f['hostname_len'], f['dot_count'], f['hyphen_count'],
                f['at_symbol'], f['is_ip'], f['has_port'], f['is_https'],
                f['is_punycode'], f['is_shortener'], f['tld_suspicious'], f['brand_misuse'], f['entropy']
            ]
            X_feats.append(vec)
            y_labels.append(s['label'])
            
        # Augment
        X_feats = X_feats * 5
        y_labels = y_labels * 5
        
        url_model = RandomForestClassifier(n_estimators=50, random_state=42)
        url_model.fit(X_feats, y_labels)
        joblib.dump(url_model, os.path.join(MODELS_DIR, 'url_model.joblib'))
        print("[OK] URL Structural Phishing Classifier trained and saved.")

    # 3. Train Network Intrusion Isolation Forest
    net_data_path = os.path.join(DATA_DIR, 'sample_network_traffic.csv')
    if os.path.exists(net_data_path):
        df = pd.read_csv(net_data_path)
        feature_cols = [
            'Flow_Duration', 'Total_Fwd_Packets', 'Total_Bwd_Packets',
            'Flow_Bytes_s', 'Flow_Packets_s', 'Fwd_Packet_Length_Mean',
            'Bwd_Packet_Length_Mean', 'SYN_Flag_Count', 'ACK_Flag_Count',
            'URG_Flag_Count', 'Header_Length'
        ]
        
        X_net = df[feature_cols].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_net)
        
        iso_forest = IsolationForest(contamination=0.25, random_state=42)
        iso_forest.fit(X_scaled)
        
        joblib.dump(scaler, os.path.join(MODELS_DIR, 'network_scaler.joblib'))
        joblib.dump(iso_forest, os.path.join(MODELS_DIR, 'network_iso_forest.joblib'))
        print("[OK] Network Intrusion Isolation Forest & Scaler trained and saved.")

    print("=== All Models Successfully Trained ===")

if __name__ == '__main__':
    train_all_models()
