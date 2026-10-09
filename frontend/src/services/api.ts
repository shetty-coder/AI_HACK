import { AnalysisResult, Incident, SOCStats, AuditLog, WatchlistItem, ThreatGraphData } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; platform: string; mode: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeMessage(text: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeEml(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/analyze/eml`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeNetworkCsv(file?: File, useSample: boolean = false): Promise<AnalysisResult> {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/analyze/network`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } else {
    const res = await fetch(`${API_BASE}/analyze/network`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ use_sample: useSample }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  if (!res.ok) throw new Error('Incident not found');
  return res.json();
}

export async function updateIncidentStatus(id: string, status: string, notes?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  return res.json();
}

export async function executeSimulatedAction(id: string, action_type: string, target?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${id}/simulate-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action_type, target }),
  });
  return res.json();
}

export async function fetchThreatGraph(): Promise<ThreatGraphData> {
  const res = await fetch(`${API_BASE}/graph/threat-network`);
  return res.json();
}

export async function fetchDashboardStats(): Promise<SOCStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return res.json();
}

export async function queryCopilot(query: string, incident_id?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/copilot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, incident_id }),
  });
  return res.json();
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/audit/logs?limit=${limit}`);
  return res.json();
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE}/watchlist`);
  return res.json();
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/settings`);
  return res.json();
}

export async function saveSettings(settings: Record<string, string>): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function seedDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/seed-demo-data`, {
    method: 'POST',
  });
  return res.json();
}
