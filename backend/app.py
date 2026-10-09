import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

from database.db import init_db
from models.train_models import train_all_models

from routes.analyze import analyze_bp
from routes.incidents import incidents_bp
from routes.graph import graph_bp
from routes.dashboard import dashboard_bp
from routes.copilot import copilot_bp
from routes.audit import audit_bp
from routes.settings import settings_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(analyze_bp, url_prefix='/api')
app.register_blueprint(incidents_bp, url_prefix='/api')
app.register_blueprint(graph_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(copilot_bp, url_prefix='/api')
app.register_blueprint(audit_bp, url_prefix='/api')
app.register_blueprint(settings_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'HEALTHY',
        'platform': 'CyberShield AI X Platform',
        'mode': 'OFFLINE_DEMO_READY',
        'database': 'SQLite persistent storage connected'
    })

def startup_init():
    print("Initializing CyberShield AI X SQLite Database...")
    init_db()
    
    models_exist = os.path.exists(os.path.join(os.path.dirname(__file__), 'models', 'text_model.joblib'))
    if not models_exist:
        print("Pretrained models not detected. Training initial ML models...")
        train_all_models()
    else:
        print("ML model artifacts detected.")

with app.app_context():
    startup_init()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[OK] CyberShield AI X Backend listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False, threaded=True)
