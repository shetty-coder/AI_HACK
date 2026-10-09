import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Terminal, BookOpen, Layers } from 'lucide-react';

export const EducationPage: React.FC = () => {
  const [activeTactic, setActiveTactic] = useState('Initial Access');

  const mitreMatrix = [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566.001', name: 'Spearphishing Attachment', desc: 'Malicious EML or document payloads delivered via direct email.' },
        { id: 'T1566.002', name: 'Spearphishing Link', desc: 'Credential harvester or typosquatting links delivered via SMS/chat.' },
        { id: 'T1190', name: 'Exploit Public-Facing Application', desc: 'Targeting web application vulnerabilities to gain perimeter execution.' }
      ]
    },
    {
      tactic: 'Reconnaissance',
      techniques: [
        { id: 'T1598', name: 'Phishing for Information', desc: 'Urgent social engineering prompts coaxing victims into sharing OTPs or credentials.' },
        { id: 'T1593', name: 'Search Open Technical Databases', desc: 'Scanning WHOIS, passive DNS, and code repos for victim credentials.' }
      ]
    },
    {
      tactic: 'Discovery',
      techniques: [
        { id: 'T1046', name: 'Network Service Discovery', desc: 'Automated SYN sweeps and port scans to locate open web or SSH ports.' }
      ]
    },
    {
      tactic: 'Exfiltration',
      techniques: [
        { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', desc: 'High byte-rate outbound connections transferring sensitive internal data.' }
      ]
    },
    {
      tactic: 'Impact',
      techniques: [
        { id: 'T1498', name: 'Network Denial of Service', desc: 'Asymmetric packet floods aimed at exhausting firewall socket pools.' }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" />
          MODULE K — CYBER SAFETY EDUCATION & MITRE ATT&CK MATRIX
        </div>
        <h2 className="text-2xl font-black text-slate-100">Cybersecurity Knowledge Base & MITRE ATT&CK Explorer</h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore attack techniques, scam red flags, and defensive SOC playbooks integrated across CyberShield AI X.
        </p>
      </div>

      {/* MITRE ATT&CK Explorer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            MITRE ATT&CK Enterprise Matrix Mapping
          </h3>
          <span className="text-xs text-purple-400 font-mono">v14 Knowledge Base</span>
        </div>

        {/* Tactic Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
          {mitreMatrix.map((item) => (
            <button
              key={item.tactic}
              onClick={() => setActiveTactic(item.tactic)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-colors shrink-0 ${
                activeTactic === item.tactic
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.tactic}
            </button>
          ))}
        </div>

        {/* Selected Tactic Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mitreMatrix
            .find((m) => m.tactic === activeTactic)
            ?.techniques.map((tech) => (
              <div key={tech.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-purple-400">{tech.id}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{activeTactic}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{tech.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Phishing & Scam Awareness Playbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            URL Phishing Indicators Checklist
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">•</span> Raw IP hosts in place of standard domains (e.g. <code>http://192.168.1.1/login</code>)</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">•</span> Typosquatting brand names (e.g. <code>paypaI.com</code>, <code>g00gle.com</code>)</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">•</span> High-risk suspicious TLDs (e.g. <code>.tk</code>, <code>.xyz</code>, <code>.top</code>)</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">•</span> URL shortener links obscuring destination target</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 font-bold">•</span> Punycode homograph Cyrillic/Greek character tricks</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            SMS & Scam Text Red Flags
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">•</span> Unsolicited requests for One-Time Passwords (OTPs) or PINs</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">•</span> Fake job offers demanding initial registration or processing fees</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">•</span> Immediate threats of bank account suspension or KYC expiration</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">•</span> Peer-to-peer UPI handles demanding customs or parcel delivery fees</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
