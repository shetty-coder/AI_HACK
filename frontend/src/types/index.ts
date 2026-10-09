export type SeverityLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
}

export interface FeatureContribution {
  feature: string;
  weight: string;
  impact: 'HIGH_RISK' | 'MEDIUM_RISK' | 'REDUCES_RISK';
  detail: string;
}

export interface XaiReport {
  target: string;
  risk_score: number;
  severity: SeverityLevel;
  confidence_percentage: number;
  feature_contributions: FeatureContribution[];
  evidence_summary: string[];
  model_reasoning: string[];
  missing_evidence: string[];
  verification_checklist: string[];
  mitre_attack: MitreTechnique[];
}

export interface Incident {
  id: string;
  title: string;
  category: string;
  risk_score: number;
  severity: SeverityLevel;
  confidence: number;
  indicators: string[];
  reasoning: string[];
  xai_data: Partial<XaiReport>;
  recommended_steps: string[];
  status: IncidentStatus;
  analyst_notes?: string;
  target_identifier: string;
  created_at: string;
  updated_at?: string;
}

export interface AnalysisResult {
  target: string;
  threat_category: string;
  risk_score: number;
  severity: SeverityLevel;
  confidence: number;
  evidence: string[];
  reasoning: string[];
  recommended_steps: string[];
  incident_id?: string;
  xai_report: XaiReport;
  disclaimer?: string;
  mitre_attack?: MitreTechnique[];
  highlights?: Array<{ start: number; end: number; text: string; category: string }>;
  entities?: { urls: string[]; phones: string[]; upis: string[]; emails: string[] };
  headers?: Record<string, any>;
  embedded_urls_analysis?: any[];
  records?: any[];
  total_records?: number;
  anomalous_records?: number;
  normal_records?: number;
  suspicious_src_ips?: string[];
  suspicious_dst_ips?: string[];
  reputation_vt?: any;
  reputation_gsb?: any;
}

export interface SOCStats {
  posture_score: number;
  posture_status: string;
  total_events: number;
  open_incidents: number;
  critical_count: number;
  high_count: number;
  watchlist_count: number;
  severity_distribution: Array<{ name: string; value: number; color: string }>;
  category_distribution: Array<{ category: string; count: number }>;
  trend_data: Array<{ time: string; urls: number; messages: number; network_anomalies: number }>;
  recent_incidents: Incident[];
  recent_audit_logs: AuditLog[];
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  severity: SeverityLevel;
  details: string;
}

export interface WatchlistItem {
  id: number;
  item: string;
  item_type: string;
  reason: string;
  status: string;
  added_by: string;
  created_at: string;
}

export interface ThreatNode {
  id: string;
  label: string;
  type: 'hub' | 'incident' | 'entity' | 'mitre';
  severity: SeverityLevel;
  data: Record<string, any>;
}

export interface ThreatEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ThreatGraphData {
  nodes: ThreatNode[];
  edges: ThreatEdge[];
  total_incidents_mapped: number;
}
