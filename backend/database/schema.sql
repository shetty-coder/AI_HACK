-- CyberShield AI X SQLite Database Schema

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    severity TEXT NOT NULL,
    confidence REAL NOT NULL,
    indicators TEXT NOT NULL, -- JSON string
    reasoning TEXT NOT NULL, -- JSON string
    xai_data TEXT, -- JSON string
    recommended_steps TEXT, -- JSON string
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, INVESTIGATING, CONTAINED, RESOLVED
    analyst_notes TEXT,
    target_identifier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_results (
    id TEXT PRIMARY KEY,
    target TEXT NOT NULL,
    scan_type TEXT NOT NULL, -- URL, MESSAGE, EMAIL, NETWORK
    result_data TEXT NOT NULL, -- JSON string
    risk_score INTEGER NOT NULL,
    severity TEXT NOT NULL,
    incident_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(incident_id) REFERENCES incidents(id)
);

CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT NOT NULL UNIQUE,
    item_type TEXT NOT NULL, -- URL, IP, SENDER, DOMAIN
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'BLOCKED',
    added_by TEXT DEFAULT 'CyberShield AI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'SOC Analyst',
    target TEXT,
    severity TEXT DEFAULT 'INFO',
    details TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
