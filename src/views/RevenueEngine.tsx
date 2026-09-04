import React, { useState, useEffect, useRef } from 'react';
import { useEcosystem } from '../store';
import { Activity, Terminal, Play, Square, Mail, RefreshCw, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RevenueEngine() {
  const { activeAgent, workerMetrics, updateWorkerMetrics, setActiveView } = useEcosystem();
  const [workerActive, setWorkerActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Input states for Outreach
  const [deals, setDeals] = useState<any[]>([]);
  const [prospectName, setProspectName] = useState('');
  const [dealStage, setDealStage] = useState('Post-Discovery Follow-Up');
  const [dealNotes, setDealNotes] = useState('');
  const [outreachDraft, setOutreachDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('revenue_crm_deals');
    if (saved) {
      setDeals(JSON.parse(saved));
    } else {
      const defaultDeals = [{ id: '1', prospectName: 'Acme Corp', dealStage: 'Post-Discovery Follow-Up', dealNotes: 'Missing Economic Buyer access. Need to quantify ROI.' }];
      setDeals(defaultDeals);
      localStorage.setItem('revenue_crm_deals', JSON.stringify(defaultDeals));
      setProspectName(defaultDeals[0].prospectName);
      setDealStage(defaultDeals[0].dealStage);
      setDealNotes(defaultDeals[0].dealNotes);
    }
  }, []);

  const saveDeal = () => {
    const newDeal = { id: Math.random().toString(36).substring(7), prospectName, dealStage, dealNotes };
    const updated = [...deals, newDeal];
    setDeals(updated);
    localStorage.setItem('revenue_crm_deals', JSON.stringify(updated));
    showToast('Deal saved to local storage.', 'success');
  };

  const loadDeal = (deal: any) => {
    setProspectName(deal.prospectName);
    setDealStage(deal.dealStage);
    setDealNotes(deal.dealNotes);
  };

  const deleteDeal = (id: string) => {
    const updated = deals.filter(d => d.id !== id);
    setDeals(updated);
    localStorage.setItem('revenue_crm_deals', JSON.stringify(updated));
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: any;
    if (workerActive) {
      addLog(`[WORKER INIT] Worker engine engaged for active persona: ${activeAgent?.name}`);
      interval = setInterval(() => {
        runWorkerLoop();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [workerActive, activeAgent]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const runWorkerLoop = () => {
    if (Math.random() < 0.2) {
      // 20% error rate
      addLog(`[SYSTEM ERROR] CRM Rate Limit exceeded during pipeline sync.`);
      showToast(`Critical Error: CRM API Rate Limit Exceeded`, 'error');
      setWorkerActive(false);
      return;
    }

    const companies = ['Acme Corp', 'Starlight Health', 'Globex', 'Soylent Corp', 'Initech'];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const dealValue = Math.floor(Math.random() * 500) * 1000 + 50000;
    const roiGen = Math.floor(Math.random() * 300) + 150;

    const agentName = activeAgent?.name || 'Enterprise Deal Closer';

    if (agentName === 'Enterprise Deal Closer' || agentName === 'Aegis-Closer') {
      addLog(`[MEDDPICC AUDIT] Evaluating ${company} against M, E, D, D, P, I, C, C qualification pillars...`);
      setTimeout(() => {
        addLog(`[RISK AUDIT] Single-point failure flagged: Strong Champion with unconfirmed Economic Buyer access.`);
        setTimeout(() => {
          addLog(`[SURGICAL ACTION] Executive risk mitigation strategy & follow-up questions drafted -> ROI: +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`MEDDPICC audit complete for ${company}. Deal qualification risks mitigated.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'Technical Discovery Specialist' || agentName === 'Dragon-Prospector-X') {
      addLog(`[TECH DEEP-DIVE] Parsing API integration specs and architecture compliance for ${company}...`);
      setTimeout(() => {
        addLog(`[SECURITY VALIDATION] Validating zero-trust VPC peering, SSO SAML specs, and PoC benchmarks.`);
        setTimeout(() => {
          addLog(`[CLEARANCE COMPLETE] Deep technical friction resolved -> Architecture Validation Approved | ROI: +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`Technical discovery passed for ${company}. Architecture compliance cleared.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'Executive Outreach Strategist' || agentName === 'RevenueEngine-AE') {
      addLog(`[EXEC RESEARCH] Web Search scanning ${company} strategic initiatives and executive transitions...`);
      setTimeout(() => {
        addLog(`[STRATEGIC POSITIONING] Framing collaborative partnership around long-term business vision.`);
        setTimeout(() => {
          addLog(`[OUTBOUND DISPATCH] Persuasive C-suite executive outreach dispatched -> High-converting engagement booked | ROI: +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`Executive outreach dispatched to ${company} leadership. Engagement secured.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'Aegis-Inbound-SDR') {
      addLog(`[INBOUND DETECTED] Lead inbound from ${company} -> Parsing BANT qualification fields...`);
      setTimeout(() => {
        addLog(`[WEB RESEARCH] Verified ${company} headcount & tech stack -> Authority score: 94/100.`);
        setTimeout(() => {
          addLog(`[CALENDAR DISPATCH] Scheduling link sent -> Stage updated: 'Discovery Booked' | ROI: +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`Inbound lead at ${company} qualified and meeting booked.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'Dragon-Battlecard-AI') {
      addLog(`[COMPETITIVE RADAR] Scanning deal notes for competitor displacement vectors at ${company}...`);
      setTimeout(() => {
        addLog(`[LANDMINE GEN] Formulating 3 strategic trap questions & TCO matrix vs incumbent.`);
        setTimeout(() => {
          addLog(`[CRM ENRICH] Battlecard attached to ${company} record -> Objection countered | +$${roiGen} Value`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`Battlecard generated for ${company}. Incumbent displacement armed.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'Aegis-PaperProcess-Navigator') {
      addLog(`[PROCUREMENT AUDIT] Auditing sign-off chain for ${company} -> Reviewing InfoSec questionnaire...`);
      setTimeout(() => {
        addLog(`[COMPLIANCE DISPATCH] Pre-filled SOC2 & ISO 27001 pack routed to ${company} Legal Champion.`);
        setTimeout(() => {
          addLog(`[STAGE ADVANCE] Procurement roadblock cleared -> Paper process acceleration: +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`InfoSec cleared for ${company}. Closing timeline accelerated.`, 'success');
        }, 1000);
      }, 1000);
    } else if (agentName === 'RevenueEngine-Revival-Copilot') {
      addLog(`[DORMANT SCAN] Flagged ${company} (inactive 30+ days) -> Searching recent market events...`);
      setTimeout(() => {
        addLog(`[TRIGGER HOOK] Found recent executive expansion -> Drafting 9-word re-activation hook.`);
        setTimeout(() => {
          addLog(`[REVIVAL DISPATCH] Deferred pricing proposal sent to ${company} -> Pipeline revived | +$${roiGen}`);
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));
          showToast(`Stalled deal at ${company} re-engaged with deferred terms.`, 'success');
        }, 1000);
      }, 1000);
    } else {
      addLog(`[CRM SYNC] Ingesting deal record: ${company} ($${dealValue.toLocaleString()}) -> Checking schema...`);
      setTimeout(() => {
        addLog(`[RISK AUDIT] GAP DETECTED: Evaluating MEDDPICC criteria based on ${activeAgent?.archetype} persona.`);
        setTimeout(() => {
          addLog(`[API DISPATCH] Outreach queued via Resend API -> Deals Audited: +1 | Client ROI: +$${roiGen}`);
          
          updateWorkerMetrics(prev => ({
            dealsAudited: prev.dealsAudited + 1,
            emailsDispatched: prev.emailsDispatched + 1,
            clientROI: prev.clientROI + roiGen
          }));

          showToast(`Successfully audited ${company}. +$${roiGen} ROI logged.`, 'success');
        }, 1000);
      }, 1000);
    }
  };

  const generateOutreach = () => {
    setIsDrafting(true);
    setOutreachDraft('');
    setTimeout(() => {
      const agentName = activeAgent?.name || 'Enterprise Deal Closer';

      if (agentName === 'Enterprise Deal Closer' || agentName === 'Aegis-Closer') {
        setOutreachDraft(`Subject: Executive Qualification Audit & Risk Mitigation: ${prospectName}

Hi ${prospectName} Decision Team,

In conducting our pipeline qualification audit against the MEDDPICC framework (Metrics, Economic Buyer, Decision Process, Paper Process, Identified Pain, Champion):

1. Single-Point Failure Assessment:
While our teams share strong alignment with your internal Champion, we have not formally locked our quantified business case with the designated Economic Buyer.

2. Surgical Follow-up & Decision Timelines:
• What is the required fiscal hurdle rate or ROI payback period required by your executive committee?
• What specific paper process milestones (InfoSec security rider, legal terms, vendor onboarding) are required to safeguard your quarterly launch window?

Let's schedule a brief 15-minute executive review to review our quantified business case and establish decision milestones.

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else if (agentName === 'Technical Discovery Specialist' || agentName === 'Dragon-Prospector-X') {
        setOutreachDraft(`Subject: Technical Discovery & Architecture Compliance Validation: ${prospectName}

Hi ${prospectName} Engineering & Architecture Team,

Following our technical deep-dive into your infrastructure requirements, API integration specs, and security compliance standards:

=== 1. ARCHITECTURAL VALIDATION BENCHMARKS ===
• API Ingestion SLA: High-throughput webhook endpoints with sub-50ms latency response.
• Enterprise Security: End-to-end TLS 1.3 encryption, zero-trust token authorization, and SOC 2 Type II controls.
• Proof-of-Concept (PoC) Benchmark: 99.99% autonomous agent loop execution without gateway timeout.

=== 2. TARGETED TECHNICAL VALIDATION QUESTIONS ===
1. Are there custom firewall proxy layers, VPC boundary restrictions, or self-hosted identity providers (SAML 2.0 / OIDC) we should benchmark during our initial staging PoC?
2. What are the key latency and schema compliance benchmarks your architecture review board mandates prior to full production cutover?

Attached is our full architectural specification sheet for technical presales sign-off.

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else if (agentName === 'Executive Outreach Strategist' || agentName === 'RevenueEngine-AE') {
        setOutreachDraft(`Subject: Strategic Alignment & Long-Term Scaling Partnership: ${prospectName}

Hi ${prospectName} Leadership Team,

I have been closely analyzing ${prospectName}'s market expansion, strategic executive moves, and recent operational initiatives.

Rather than approaching your organization as another point vendor, our focus is establishing a strategic partnership anchored around your executive priorities:
• Executive Vision: Unlocking autonomous execution across digital assets to compress deal cycles and amplify operational velocity.
• Risk-Mitigated ROI: Eliminating legacy infrastructure seat-tax penalization while guaranteeing measurable bottom-line value.
• Strategic Scalability: Establishing an enterprise-grade agent orchestration foundation designed for long-term compounding returns.

Would you be open to a 10-minute strategic briefing this week to explore how this aligns with your board-level targets?

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else if (agentName === 'Aegis-Inbound-SDR') {
        setOutreachDraft(`Subject: Fast-tracking your evaluation: ${prospectName} demo request

Hi ${prospectName} Team,

Thanks for reaching out to us! I conducted a preliminary analysis of your company size and current pipeline setup.

To ensure we connect you with the right technical architect and prepare a custom demo environment:
1. Authority & Stakeholders: Besides yourself, who on your leadership team is evaluating this solution?
2. Timeline & Goal: Are you targeting an active deployment this quarter, or establishing a benchmark for next year?

If you are ready to explore immediate ROI, select a frictionless 20-minute slot on our calendar:
🔗 https://cal.com/enterprise-revenue/fast-track

Looking forward to our conversation.

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else if (agentName === 'Dragon-Battlecard-AI') {
        const comp = dealNotes.toLowerCase().includes('salesforce') ? 'Salesforce' : dealNotes.toLowerCase().includes('hubspot') ? 'HubSpot' : dealNotes.toLowerCase().includes('gong') ? 'Gong' : 'Incumbent Platform';
        setOutreachDraft(`Subject: [CONFIDENTIAL PLAYBOOK] Countering ${comp} at ${prospectName}

=== 1. THREE STRATEGIC LANDMINE QUESTIONS FOR THE BUYER ===
Give these questions to your internal Champion to ask ${comp} on their next call:
• Landmine #1: "Does your agent orchestration require custom API fees or per-token markups when scaling autonomous loops?"
• Landmine #2: "Can your system run fully offline as a local-first PWA with zero external server dependency?"
• Landmine #3: "What is your verified Year 2 contract price escalation cap for enterprise licenses?"

=== 2. "WHY WE WIN" COMPARISON MATRIX ===
• Total Cost of Ownership (TCO): 40% reduction in annual spend (Zero seat-tax penalization).
• Deployment Agility: Instant deployment with full localStorage & Service Worker persistence.
• Extensibility: Hot-swappable enterprise agent roster with native JSON/runner export.

Recommendation: Arm Champion with Landmine #1 before tomorrow's pricing review.

Prepared by: ${activeAgent?.name} (${activeAgent?.archetype})`);
      } else if (agentName === 'Aegis-PaperProcess-Navigator') {
        setOutreachDraft(`Subject: Expedited Security & Procurement Packet: ${prospectName}

Hi ${prospectName} Legal and Procurement Team,

To ensure zero friction and keep our target onboarding milestone on track, here is our complete compliance package:

✅ Master Services Agreement (MSA) Standard Terms & Mutual NDA
✅ SOC 2 Type II Compliance Report & ISO 27001 Certification
✅ Standardized Information Gathering (SIG) Completed Questionnaire
✅ Data Processing Addendum (DPA) with standard EU/US GDPR clauses

CHAMPION ESCALATION SCRIPT (if vendor approval is delayed > 3 business days):
"Hi [Legal Lead], our engineering leadership has confirmed that delaying the security rider review past Friday will push our implementation past the quarterly launch window. Can we greenlight the pre-filled SOC2 pack under expedited review?"

CRM Milestone Updated: "Procurement / Legal Review In Progress".

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else if (agentName === 'RevenueEngine-Revival-Copilot') {
        setOutreachDraft(`Subject: ${prospectName} - 9-word pulse check

Hi Team,

Have you completely given up on automating your revenue execution this quarter?

Context & Re-engagement Hook:
I noticed ${prospectName}'s recent market announcements and hiring initiatives. If budget timing or payment terms were the primary reason our discussions stalled 30+ days ago, we have unlocked:
• Deferred Net-90 billing
• Structured multi-year price-lock ramp terms
• Fast-track zero-migration onboarding

Would you be open to a 5-minute sync this Thursday to review revised terms?

Best regards,
${activeAgent?.name}
${activeAgent?.role}`);
      } else {
        setOutreachDraft(`Subject: Following up on ${prospectName} evaluation

Hi Team,

Based on our recent analysis, I noticed we are currently missing alignment with the core Economic Buyer. 
As a ${activeAgent?.archetype}, my recommendation is to immediately request a brief ROI review session.

Let's discuss how we can quantify the business impact.

Best,
${activeAgent?.name}`);
      }

      setIsDrafting(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-16 px-4">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            RevenueEngine AI
          </h1>
          <p className="text-slate-400 mt-2">Pipeline analysis, automated outreach, and autonomous execution.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 px-6 py-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">DEALS AUDITED</p>
              <p className="text-lg font-bold text-white">{workerMetrics.dealsAudited}</p>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">DISPATCHED</p>
              <p className="text-lg font-bold text-white">{workerMetrics.emailsDispatched}</p>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">CLIENT ROI</p>
              <p className="text-lg font-bold text-emerald-400">${workerMetrics.clientROI.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
        
        {/* Left Column: Outreach Generator */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" /> Outreach Generator
              </h2>
              <button onClick={() => setActiveView('aegis')} className="text-sm text-indigo-400 hover:text-indigo-300">
                Edit Persona in Aegis
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-400">Prospect / Account</label>
                  {deals.length > 0 && (
                    <select 
                      onChange={e => {
                        const deal = deals.find(d => d.id === e.target.value);
                        if (deal) loadDeal(deal);
                      }}
                      className="text-xs bg-slate-800/50 border border-white/10 rounded text-slate-300 focus:outline-none"
                    >
                      <option value="">Load Deal...</option>
                      {deals.map(d => <option key={d.id} value={d.id}>{d.prospectName}</option>)}
                    </select>
                  )}
                </div>
                <input type="text" value={prospectName} onChange={e => setProspectName(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Deal Stage Trigger</label>
                <select value={dealStage} onChange={e => setDealStage(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  <option>Post-Discovery Follow-Up</option>
                  <option>MEDDPICC Gap Resolution</option>
                  <option>Pricing & Contract Nudge</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">MEDDPICC Notes / Gaps</label>
              <textarea value={dealNotes} onChange={e => setDealNotes(e.target.value)} rows={3} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            
            <div className="flex gap-3">
              <button onClick={saveDeal} className="flex-[1] bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors border border-white/10 text-sm">
                Save to Local CRM
              </button>
              <button onClick={generateOutreach} disabled={isDrafting} className="flex-[2] flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50">
                {isDrafting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Sequence with {activeAgent?.name}
              </button>
            </div>

            {outreachDraft && (
              <div className="mt-6 p-4 bg-slate-800/50 border border-white/10 rounded-xl">
                <div className="mb-3 px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-start gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-200">
                    <span className="font-semibold text-indigo-300">Copilot Insight ({activeAgent?.name}):</span>{' '}
                    {(activeAgent?.name === 'Enterprise Deal Closer' || activeAgent?.name === 'Aegis-Closer') && 'Operating on MEDDPICC framework principles to audit pipeline qualification gaps, eliminate single-point failure risks, and direct executive decision timelines.'}
                    {(activeAgent?.name === 'Technical Discovery Specialist' || activeAgent?.name === 'Dragon-Prospector-X') && 'Executing technical presales deep-dives, validating architecture compliance, resolving security/integration objections, and bench-testing PoC specs.'}
                    {(activeAgent?.name === 'Executive Outreach Strategist' || activeAgent?.name === 'RevenueEngine-AE') && 'Positioning strategic C-suite value, framing collaborative multi-year partnerships, and driving executive engagement.'}
                    {activeAgent?.name === 'Aegis-Inbound-SDR' && 'Tuned for rapid BANT qualification, frictionless booking conversion, and executive meeting confirmation.'}
                    {activeAgent?.name === 'Dragon-Battlecard-AI' && 'Configured for competitive displacement, high-impact landmine questions, and Total Cost of Ownership (TCO) advantage.'}
                    {activeAgent?.name === 'Aegis-PaperProcess-Navigator' && 'Specialized in unblocking InfoSec/procurement hurdles, distributing compliance collateral, and accelerating closing velocity.'}
                    {activeAgent?.name === 'RevenueEngine-Revival-Copilot' && 'Optimized for 9-word re-engagement pattern interrupts, stalled opportunity revival, and deferred ramp pricing negotiation.'}
                    {activeAgent?.name === 'Nexus-Orchestrator' && 'Coordinating multi-agent workflows, code generation pipelines, and AI Studio application monetization.'}
                    {!['Enterprise Deal Closer', 'Aegis-Closer', 'Technical Discovery Specialist', 'Dragon-Prospector-X', 'Executive Outreach Strategist', 'RevenueEngine-AE', 'Aegis-Inbound-SDR', 'Dragon-Battlecard-AI', 'Aegis-PaperProcess-Navigator', 'RevenueEngine-Revival-Copilot', 'Nexus-Orchestrator'].includes(activeAgent?.name || '') &&
                      `Drafted using the ${activeAgent?.archetype || 'Specialized'} persona, focusing heavily on mitigating pipeline risks.`
                    }
                  </p>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans">{outreachDraft}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Autonomous Worker Terminal */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Agent Worker Mode
              </h2>
              <div className="flex items-center gap-3">
                {workerActive ? (
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    WORKER ACTIVE
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full border border-white/10">
                    SYSTEM IDLE
                  </span>
                )}
                <button 
                  onClick={() => setWorkerActive(!workerActive)}
                  className={`p-2 rounded-xl transition-colors ${workerActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                >
                  {workerActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-[#0a0a0a] overflow-y-auto font-mono text-xs leading-relaxed space-y-2 custom-scrollbar">
              {logs.length === 0 && !workerActive && (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Click the play button to start the autonomous loop.
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : log.includes('GAP DETECTED') ? 'text-amber-400' : log.includes('API DISPATCH') ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 pointer-events-none"
          >
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-xl ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}`}>
              {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <TrendingUp className="w-5 h-5 text-emerald-400" />}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
