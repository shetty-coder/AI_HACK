import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastNotification, ToastMessage } from './components/common/ToastNotification';
import { GuidedDemoBar } from './components/common/GuidedDemoBar';
import {
  fetchDashboardStats,
  seedDemoData,
  fetchIncidents,
  analyzeUrl,
  analyzeMessage,
  analyzeNetworkCsv,
  executeSimulatedAction,
} from './services/api';
import { SOCStats, Incident } from './types';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UrlLabPage } from './pages/UrlLabPage';
import { MessageLabPage } from './pages/MessageLabPage';
import { NetworkLabPage } from './pages/NetworkLabPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { CorrelationGraphPage } from './pages/CorrelationGraphPage';
import { IncidentResponsePage } from './pages/IncidentResponsePage';
import { CopilotPage } from './pages/CopilotPage';
import { ReportsAuditPage } from './pages/ReportsAuditPage';
import { EducationPage } from './pages/EducationPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [stats, setStats] = useState<SOCStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentRole, setCurrentRole] = useState<string>('Tier-1 Analyst');
  const [demoStep, setDemoStep] = useState<number>(1);

  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadData = async () => {
    try {
      const [s, incList] = await Promise.all([fetchDashboardStats(), fetchIncidents()]);
      setStats(s);
      setIncidents(incList);
    } catch (err) {
      console.error('Failed to load SOC stats:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleNavigateToIncident = (id: string) => {
    setSelectedIncidentId(id);
    setActiveTab('investigation');
  };

  const handleSeedDemo = async () => {
    const res = await seedDemoData();
    await loadData();
    addToast('Demo Data Seeded', `Successfully created ${res.count} synthetic incidents in SQLite database.`, 'success');
    setActiveTab('dashboard');
  };

  // Automated Step Executor for Guided Hackathon Demo Bar
  const handleExecuteDemoStep = async (stepNumber: number) => {
    setDemoStep(stepNumber);
    if (stepNumber === 1) {
      setActiveTab('url-lab');
      addToast('Step 1: URL Analysis', 'Opening URL Intelligence Lab. Testing typosquatting URL: http://paypaI-login.tk', 'info');
      try {
        const res = await analyzeUrl('http://paypaI-security-update.com.account-verify-login.tk/signin');
        addToast('URL Scan Complete', `Flagged ${res.severity} severity phishing domain (${res.risk_score}/100 risk)`, 'warning');
        loadData();
      } catch (e) {}
    } else if (stepNumber === 2) {
      setActiveTab('message-lab');
      addToast('Step 2: Scam Text NLP', 'Analyzing HDFC Banking OTP Scam Message text...', 'info');
      try {
        const res = await analyzeMessage('URGENT: Your HDFC bank account 49102XX is locked. Share OTP 892014 to update KYC at http://hdfc-bank-verify-login.tk');
        addToast('Scam Text Classified', `Detected ${res.threat_category} (${res.risk_score}/100 risk)`, 'warning');
        loadData();
      } catch (e) {}
    } else if (stepNumber === 3) {
      setActiveTab('network-lab');
      addToast('Step 3: Network Intrusion ML', 'Running Isolation Forest unsupervised anomaly model on sample traffic CSV...', 'info');
      try {
        const res = await analyzeNetworkCsv(undefined, true);
        addToast('Network Anomaly Batch', `Flagged ${res.anomalous_records} anomalous network flows out of ${res.total_records}`, 'warning');
        loadData();
      } catch (e) {}
    } else if (stepNumber === 4) {
      const firstInc = incidents[0];
      if (firstInc) setSelectedIncidentId(firstInc.id);
      setActiveTab('investigation');
      addToast('Step 4: Explainable AI', 'Opening Threat Workspace. Inspecting feature influence contributions and model logic reasoning.', 'info');
    } else if (stepNumber === 5) {
      setActiveTab('threat-graph');
      addToast('Step 5: Threat Graph Topology', 'Rendering interactive React Flow Threat Correlation Graph linking Incidents & MITRE ATT&CK nodes.', 'info');
    } else if (stepNumber === 6) {
      setActiveTab('incident-response');
      const incToBlock = incidents[0];
      if (incToBlock) {
        try {
          const res = await executeSimulatedAction(incToBlock.id, 'BLOCK_URL');
          addToast('Simulated Action Executed', res.message, 'success');
          loadData();
        } catch (e) {}
      }
    } else if (stepNumber === 7) {
      setActiveTab('reports-audit');
      addToast('Step 7: Incident Reports & Audits', 'Generating downloadable PDF and JSON compliance audit reports.', 'info');
    } else if (stepNumber === 8) {
      setActiveTab('copilot');
      addToast('Step 8: AI Security Copilot', 'Asking Copilot to explain active incident context in plain English.', 'info');
    } else if (stepNumber === 9) {
      setActiveTab('dashboard');
      await loadData();
      addToast('Step 9: SOC Posture Score', 'Reviewing updated Security Posture Score & Recharts analytics feed!', 'success');
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} onSeedDemo={handleSeedDemo} onNavigateToIncident={handleNavigateToIncident} />;
      case 'dashboard':
        return <DashboardPage stats={stats} onNavigateToIncident={handleNavigateToIncident} onRefresh={loadData} />;
      case 'url-lab':
        return <UrlLabPage onNavigateToIncident={handleNavigateToIncident} />;
      case 'message-lab':
        return <MessageLabPage onNavigateToIncident={handleNavigateToIncident} />;
      case 'network-lab':
        return <NetworkLabPage onNavigateToIncident={handleNavigateToIncident} />;
      case 'investigation':
        return <InvestigationPage selectedIncidentId={selectedIncidentId} onNavigateToGraph={() => setActiveTab('threat-graph')} />;
      case 'threat-graph':
        return <CorrelationGraphPage />;
      case 'incident-response':
        return <IncidentResponsePage />;
      case 'copilot':
        return <CopilotPage />;
      case 'reports-audit':
        return <ReportsAuditPage />;
      case 'education':
        return <EducationPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage onNavigate={setActiveTab} onSeedDemo={handleSeedDemo} onNavigateToIncident={handleNavigateToIncident} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        onRefresh={loadData}
        openIncidentsCount={stats?.open_incidents || 0}
        incidents={incidents}
        onSelectIncident={handleNavigateToIncident}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'investigation') setSelectedIncidentId(null);
            setActiveTab(tab);
          }}
          openIncidentsCount={stats?.open_incidents || 0}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-24">
          {renderActivePage()}
        </main>
      </div>

      {/* Guided Hackathon Demo Floating Bar */}
      <GuidedDemoBar onExecuteStep={handleExecuteDemoStep} activeStep={demoStep} />

      {/* Floating Notification Toasts */}
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};

export default App;
