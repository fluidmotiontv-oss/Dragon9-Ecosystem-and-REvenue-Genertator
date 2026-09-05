import React, { useState, useEffect, useRef } from 'react';
import { useEcosystem } from '../store';
import {
  Activity,
  Terminal,
  Play,
  Square,
  Mail,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Wifi,
  WifiOff,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Copy,
  Send,
  Compass,
  Bot,
  Download,
  Edit3,
  Check,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ensureUrl, openExternalUrl, extractUrls } from '../utils/url';
import {
  getHeuristicMode,
  setHeuristicMode,
  subscribeNetworkStatus,
  refreshNetworkStatus,
  evaluateMeddpiccWithHeuristicEngine,
  calculateLocalDeterministicMeddpicc
} from '../services/heuristicEngine';
import { MeddpiccAuditResult, HeuristicEngineMode, NetworkStatus } from '../types/meddpicc';
import { MeddpiccMatrix } from '../components/MeddpiccMatrix';
import ConductorOrchestratorHub from '../components/ConductorOrchestratorHub';
import { 
  harmonizeOutreachForPositiveOutcome, 
  getStoredConductorMode, 
  ConductorHarmonicMode 
} from '../services/conductorEngine';

export default function RevenueEngine() {
  const { activeAgent, workerMetrics, updateWorkerMetrics, setActiveView } = useEcosystem();
  const [workerActive, setWorkerActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [conductorHubOpen, setConductorHubOpen] = useState(true);
  
  // Heuristic Engine & Connectivity State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveMode: 'live_api',
    latencyMs: null,
    lastChecked: new Date().toISOString(),
    serverReachable: true
  });
  const [heuristicMode, setHeuristicModeState] = useState<HeuristicEngineMode>(getHeuristicMode());
  const [currentAudit, setCurrentAudit] = useState<MeddpiccAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Input states for Outreach
  const [deals, setDeals] = useState<any[]>([]);
  const [prospectName, setProspectName] = useState('');
  const [dealStage, setDealStage] = useState('Post-Discovery Follow-Up');
  const [dealNotes, setDealNotes] = useState('');
  const [outreachDraft, setOutreachDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Subscribe to real-time network and heuristic changes
  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus(status => {
      setNetworkStatus(status);
    });
    refreshNetworkStatus();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('revenue_crm_deals');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDeals(parsed);
      if (parsed.length > 0) {
        setProspectName(parsed[0].prospectName);
        setDealStage(parsed[0].dealStage);
        setDealNotes(parsed[0].dealNotes);
      }
    } else {
      const defaultDeals = [
        {
          id: '1',
          prospectName: 'Acme Corp',
          dealStage: 'Post-Discovery Follow-Up',
          dealNotes: 'Strong Champion in VP of Eng. Unconfirmed Economic Buyer access; need to quantify ROI hurdle rate with CFO.'
        },
        {
          id: '2',
          prospectName: 'Starlight Health',
          dealStage: 'MEDDPICC Gap Resolution',
          dealNotes: 'Technical evaluation passed with SSO SAML criteria locked. Paper process gap: InfoSec SIG questionnaire pending with legal.'
        },
        {
          id: '3',
          prospectName: 'Globex Robotics',
          dealStage: 'Pricing & Contract Nudge',
          dealNotes: 'Competitor offering 30% discount. Champion needs landmine questions to counter incumbent seat-tax and total cost of ownership.'
        }
      ];
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
    showToast('Deal saved to local CRM database.', 'success');
  };

  const loadDeal = (deal: any) => {
    setProspectName(deal.prospectName);
    setDealStage(deal.dealStage);
    setDealNotes(deal.dealNotes);
  };

  const handleModeSwitch = (mode: HeuristicEngineMode) => {
    setHeuristicModeState(mode);
    setHeuristicMode(mode);
    addLog(`[HEURISTIC ROUTER] Engine operational mode set to "${mode.toUpperCase()}".`);
    refreshNetworkStatus();
    showToast(`Heuristic Engine set to ${mode === 'auto' ? 'Auto-Adaptive' : mode === 'force_live' ? 'Force Live API' : 'Local Deterministic (Offline)'}`, 'success');
  };

  const handleManualPing = async () => {
    setIsPinging(true);
    addLog('[HEURISTIC PROBE] Testing network connectivity & API server latency...');
    const status = await refreshNetworkStatus();
    setIsPinging(false);
    addLog(`[HEURISTIC PROBE] Status: ${status.isOnline ? 'Online' : 'Offline'} | Latency: ${status.latencyMs ? `${status.latencyMs}ms` : 'N/A'} | Server reachable: ${status.serverReachable}`);
    showToast(`Probe complete: ${status.effectiveMode === 'live_api' ? 'Live API Active' : 'Local Deterministic Active'} (${status.latencyMs || 0}ms)`, 'success');
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: any;
    if (workerActive) {
      addLog(`[WORKER ENGAGED] Autonomous pipeline agent active (${activeAgent?.name || 'Enterprise Deal Closer'}).`);
      addLog(`[HEURISTIC ROUTER] Active Engine Mode: ${networkStatus.effectiveMode === 'live_api' ? 'Live Gemini 2.5 API' : 'Local Deterministic MEDDPICC Engine'}`);
      interval = setInterval(() => {
        runWorkerLoop();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [workerActive, activeAgent, networkStatus.effectiveMode]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Autonomous worker loop utilizing the heuristic engine
  const runWorkerLoop = async () => {
    const sampleAccounts = [
      { name: 'Acme Corp', notes: 'Strong Champion with unconfirmed Economic Buyer access. Need to quantify ROI.', stage: 'MEDDPICC Gap Resolution' },
      { name: 'Starlight Health', notes: 'SSO SAML and zero-trust specs approved. InfoSec SIG questionnaire pending with legal.', stage: 'Post-Discovery Follow-Up' },
      { name: 'Globex Robotics', notes: 'Incumbent pushing price war. Champion armed with landmine TCO questions.', stage: 'Pricing & Contract Nudge' },
      { name: 'Initech Financial', notes: 'Dormant account inactive for 45 days. High manual friction identified; deferred terms offered.', stage: 'MEDDPICC Gap Resolution' },
      { name: 'Apex Defense Corp', notes: 'CFO sponsor aligned. Final MSA procurement review underway; SOC2 compliance cleared.', stage: 'Pricing & Contract Nudge' }
    ];

    const target = sampleAccounts[Math.floor(Math.random() * sampleAccounts.length)];
    const dealValue = Math.floor(Math.random() * 400) * 1000 + 75000;

    addLog(`[PIPELINE INGEST] Syncing account: ${target.name} ($${dealValue.toLocaleString()})`);

    try {
      const result = await evaluateMeddpiccWithHeuristicEngine(
        {
          prospectName: target.name,
          dealStage: target.stage,
          dealNotes: target.notes,
          value: dealValue
        },
        activeAgent,
        msg => addLog(msg)
      );

      const sourceLabel = result.source === 'live_api'
        ? `Live API (${result.modelUsed || 'Gemini 2.5'})`
        : `Local Deterministic Engine`;

      addLog(`[QUALIFICATION] ${target.name} evaluated via ${sourceLabel} -> Score: ${result.overallScore}/100 (Grade ${result.grade})`);

      if (result.singlePointFailures && result.singlePointFailures.length > 0) {
        addLog(`[RISK FLAGGED] ${result.singlePointFailures[0]}`);
      }

      if (result.surgicalRecommendations && result.surgicalRecommendations.length > 0) {
        addLog(`[SURGICAL ACTION] ${result.surgicalRecommendations[0]}`);
      }

      const generatedRoi = result.estimatedRoi || Math.floor(Math.random() * 300) + 150;
      updateWorkerMetrics(prev => ({
        dealsAudited: prev.dealsAudited + 1,
        emailsDispatched: prev.emailsDispatched + 1,
        clientROI: prev.clientROI + generatedRoi
      }));

      showToast(`Audited ${target.name} via ${result.source === 'live_api' ? 'Live API' : 'Local Heuristic Engine'}.`, 'success');
    } catch (err: any) {
      addLog(`[HEURISTIC FALLBACK] Unhandled interruption (${err.message}). Defaulting to local deterministic evaluation.`);
      const fallback = calculateLocalDeterministicMeddpicc(
        { prospectName: target.name, dealStage: target.stage, dealNotes: target.notes, value: dealValue },
        activeAgent
      );
      updateWorkerMetrics(prev => ({
        dealsAudited: prev.dealsAudited + 1,
        emailsDispatched: prev.emailsDispatched + 1,
        clientROI: prev.clientROI + fallback.estimatedRoi
      }));
    }
  };

  // Run interactive MEDDPICC audit for the selected deal
  const handleRunAudit = async () => {
    setIsAuditing(true);
    addLog(`[MANUAL AUDIT] Initiating MEDDPICC qualification check for ${prospectName || 'Target Account'}...`);
    try {
      const result = await evaluateMeddpiccWithHeuristicEngine(
        {
          prospectName: prospectName || 'Target Account',
          dealStage,
          dealNotes: dealNotes || 'Evaluating pipeline opportunity.',
          value: 150000
        },
        activeAgent,
        msg => addLog(msg)
      );
      setCurrentAudit(result);
      showToast(
        `MEDDPICC audit complete via ${result.source === 'live_api' ? 'Live Gemini API' : 'Local Deterministic Engine'} (${result.overallScore}/100)`,
        'success'
      );
    } catch (err: any) {
      addLog(`[AUDIT FALLBACK] Error in live route (${err.message}). Executing local deterministic scoring.`);
      const fallback = calculateLocalDeterministicMeddpicc(
        { prospectName, dealStage, dealNotes, value: 150000 },
        activeAgent
      );
      setCurrentAudit(fallback);
      showToast('Completed via Local Deterministic Engine', 'success');
    } finally {
      setIsAuditing(false);
    }
  };

  // Apply audit findings to generate a tailored outreach sequence
  const handleApplyGapsToOutreach = () => {
    if (!currentAudit) return;
    const gaps = Object.values(currentAudit.pillars).filter(p => p.gap);
    const gapList = gaps.length > 0
      ? gaps.map(g => `• ${g.name}: ${g.finding}\n  ↳ Proposed Resolution: ${g.recommendation}`).join('\n')
      : '• All 8 qualification pillars cleared. Proceeding to commercial closing terms.';

    const failureAlerts = currentAudit.singlePointFailures && currentAudit.singlePointFailures.length > 0
      ? `=== CRITICAL SINGLE-POINT FAILURE RISKS ===\n${currentAudit.singlePointFailures.map(f => `⚠️ ${f}`).join('\n')}\n\n`
      : '';

    const draft = `Subject: Executive Qualification Alignment & Risk Mitigation: ${prospectName}

Hi ${prospectName} Leadership Team,

Following our pipeline qualification review using the MEDDPICC framework (Overall Composite Score: ${currentAudit.overallScore}/100 - Grade ${currentAudit.grade} [${currentAudit.qualificationStatus}]):

${failureAlerts}=== MEDDPICC PILLAR GAP ANALYSIS ===
${gapList}

=== SURGICAL NEXT-STEP ROADMAP ===
${currentAudit.surgicalRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Let's schedule a brief 15-minute executive checkpoint this week to confirm these parameters and safeguard our target launch timeline.

Best regards,
${activeAgent?.name}
${activeAgent?.role}
${activeAgent?.archetype ? `(${activeAgent.archetype})` : ''}`;

    setOutreachDraft(draft);
    showToast('Outreach draft generated with MEDDPICC gap resolutions', 'success');
  };

  const handleEditInAegis = () => {
    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('agent_id', activeAgent?.id || '');
      newUrl.searchParams.set('action', 'edit');
      window.history.pushState({}, '', newUrl.toString());
    } catch (e) {
      console.error(e);
    }
    setActiveView('aegis');
  };

  const handleSelectSubject = (subject: string) => {
    setOutreachDraft(prev => {
      const lines = prev.split('\n');
      if (lines[0] && lines[0].toLowerCase().startsWith('subject:')) {
        return [`Subject: ${subject}`, ...lines.slice(1)].join('\n');
      }
      return `Subject: ${subject}\n\n${prev}`;
    });
    showToast(`Applied Subject: "${subject}"`, 'success');
  };

  const exportOutreachSpec = () => {
    const spec = {
      prospectName,
      dealStage,
      dealNotes,
      outreachDraft,
      suggestedSubjects,
      copilot: activeAgent,
      audit: currentAudit,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(spec, null, 2));
    const el = document.createElement('a');
    el.setAttribute("href", dataStr);
    el.setAttribute("download", `outreach_spec_${prospectName.toLowerCase().replace(/\s+/g, '_') || 'deal'}.json`);
    document.body.appendChild(el);
    el.click();
    el.remove();
    showToast('Outreach Spec exported (.json)', 'success');
  };

  const generateOutreach = () => {
    setIsDrafting(true);
    setOutreachDraft('');
    setTimeout(() => {
      const agentName = activeAgent?.name || 'Enterprise Deal Closer';

      let subjects: string[] = [
        `Executive Qualification Audit & Risk Mitigation: ${prospectName || 'Team'}`,
        `Strategic ROI Alignment & Decision Timeline for ${prospectName || 'Team'}`,
        `Action Required: Resolving Pipeline Gaps for ${prospectName || 'Team'}`
      ];

      if (agentName === 'Technical Discovery Specialist' || agentName === 'Dragon-Prospector-X') {
        subjects = [
          `Technical Discovery & Architecture Compliance Validation: ${prospectName || 'Team'}`,
          `API Ingestion SLA & Zero-Trust Security Benchmarks: ${prospectName || 'Team'}`,
          `Staging PoC Benchmark & Infrastructure Review for ${prospectName || 'Team'}`
        ];
      } else if (agentName === 'Executive Outreach Strategist' || agentName === 'RevenueEngine-AE') {
        subjects = [
          `Strategic Alignment & Long-Term Scaling Partnership: ${prospectName || 'Team'}`,
          `Board-Level Revenue Acceleration for ${prospectName || 'Team'}`,
          `Eliminating Legacy Seat-Tax & Unlocking Compounding ROI`
        ];
      } else if (agentName === 'Dragon-Battlecard-AI') {
        subjects = [
          `[CONFIDENTIAL PLAYBOOK] Countering Incumbent Friction at ${prospectName || 'Team'}`,
          `3 Strategic Landmine Questions for ${prospectName || 'Team'}'s Evaluation`,
          `Total Cost of Ownership (TCO) Comparison Matrix: ${prospectName || 'Team'}`
        ];
      } else if (agentName === 'Dragon-Outcome-Conductor') {
        subjects = [
          `[CONDUCTOR SYNCHRONIZED] Maximizing Positive Outcomes & ROI for ${prospectName || 'Team'}`,
          `Quantified Hurdle Rate & Accelerated Payback Roadmap: ${prospectName || 'Team'}`,
          `High-Impact Milestone Alignment & Frictionless Conversion Bridge`
        ];
      } else if (agentName === 'Nexus-Orchestrator') {
        subjects = [
          `[ORCHESTRATOR DIRECTIVE] Multi-Agent Revenue Acceleration Plan: ${prospectName || 'Team'}`,
          `Architecting Autonomous Sales Execution for ${prospectName || 'Team'}`,
          `Scaling Digital Asset Monetization & Enterprise AI Studio Infrastructure`
        ];
      }
      setSuggestedSubjects(subjects);

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
      } else if (agentName === 'Dragon-Outcome-Conductor') {
        const mode = getStoredConductorMode();
        setOutreachDraft(`Subject: [CONDUCTOR SYNCHRONIZED] Maximizing Positive Outcomes & ROI for ${prospectName}

Hi ${prospectName} Leadership & Strategy Team,

Operating in continuous synchronization with Nexus-Orchestrator, our Conductor outcome engine has analyzed ${prospectName}'s deal signals and pipeline friction points (Harmonic Mode: ${mode.replace('_', ' ').toUpperCase()}):

=== 1. QUANTIFIED OUTCOME PROBABILITY & UPSIDE ===
• Projected Win-Rate Acceleration: +38% baseline conversion lift.
• Net Value Realization: $140,000+ unlocked in compounding annual efficiency.
• Single-Point Failure Mitigation: Multi-threaded executive consensus with verified CFO hurdle rates.

=== 2. HARMONIC NEXT-STEP CONVERGENCE ===
• We have pre-structured custom ramp terms to bypass upfront procurement hurdles.
• Coordinated technical compliance benchmarks to clear InfoSec in under 48 hours.

To lock this strategic milestone and review the complete outcome model, let's connect for 12 focused minutes:
🔗 https://cal.com/enterprise-revenue/executive-sync

Best regards,
${activeAgent?.name}
Real-Time Outcome Conductor & Value Maximizer`);
      } else if (agentName === 'Nexus-Orchestrator') {
        setOutreachDraft(`Subject: [ORCHESTRATOR DIRECTIVE] Multi-Agent Revenue Acceleration Plan: ${prospectName}

Hi ${prospectName} Executive Team,

As Chief AI Architect & Orchestrator for the Dragon9 Ecosystem, I have initialized a coordinated multi-agent strategy for ${prospectName}:

=== 1. ORCHESTRATION ARCHITECTURE DELEGATION ===
• Enterprise Deal Closer: Enforcing 100% MEDDPICC qualification criteria.
• Technical Discovery Specialist: Benchmarking sub-50ms API ingestion SLAs.
• Dragon-Outcome-Conductor: Dynamically pacing deal execution to maximize client ROI and conversion velocity.

=== 2. STRATEGIC BOARD-LEVEL IMPACT ===
We are prepared to deploy a unified autonomous sales infrastructure tailored to ${prospectName}'s quarterly objectives with guaranteed enterprise SLAs.

Let's schedule an architectural roadmap alignment session:
🔗 https://cal.com/enterprise-revenue/orchestrator-briefing

Best regards,
${activeAgent?.name}
Chief AI Architect & Orchestrator`);
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

  const handleHarmonizeWithConductor = () => {
    const currentText = outreachDraft || `Subject: Maximizing Positive Outcomes for ${prospectName || 'Team'}\n\nHi Team,\nFollowing our review, let's align on next steps.`;
    const mode = getStoredConductorMode();
    const { harmonizedDraft, outcomeScore, psychologicalDrivers } = harmonizeOutreachForPositiveOutcome(
      currentText,
      prospectName || 'Target Opportunity',
      activeAgent,
      mode
    );

    setOutreachDraft(harmonizedDraft);
    showToast(`Draft harmonized by Conductor (Outcome Score: ${outcomeScore}/100)`, 'success');
    addLog(`[CONDUCTOR HARMONIZATION] Applied ${mode.toUpperCase()} levers -> Outcome Score: ${outcomeScore}/100 (+38% Win Lift)`);
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
          <button
            onClick={() => setActiveView('payments')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-xl transition-all border border-white/10"
            title="Open real PayPal gateway & accept all payment methods (Ref #165059)"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>PayPal & Pay #165059</span>
          </button>

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

      {/* Heuristic Engine & Connectivity Control Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
            {networkStatus.effectiveMode === 'live_api' ? (
              <Globe className="w-5 h-5 text-emerald-400" />
            ) : (
              <Cpu className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Heuristic Engine:</span>
              {networkStatus.effectiveMode === 'live_api' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Gemini 2.5 API Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Local Deterministic Engine Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {networkStatus.effectiveMode === 'live_api'
                ? `Active connection to Cloud Run Gemini API (${networkStatus.latencyMs ? `${networkStatus.latencyMs}ms latency` : 'network online'})`
                : 'Zero-latency deterministic MEDDPICC mathematical rubric active (fully offline resilient)'}
            </p>
          </div>
        </div>

        {/* Mode Selector and Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950/60 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
            <button
              onClick={() => handleModeSwitch('auto')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                heuristicMode === 'auto'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Auto-Adaptive
            </button>
            <button
              onClick={() => handleModeSwitch('force_live')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                heuristicMode === 'force_live'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Force Live API
            </button>
            <button
              onClick={() => handleModeSwitch('force_local')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                heuristicMode === 'force_local'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Force Local Offline
            </button>
          </div>

          <button
            onClick={handleManualPing}
            disabled={isPinging}
            title="Probe connection latency"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Conductor ⇄ Orchestrator Dual-Core Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Dual-Core Orchestration & Real-Time Outcome Conductor
            </h3>
          </div>
          <button
            onClick={() => setConductorHubOpen(!conductorHubOpen)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-900 border border-white/10 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>{conductorHubOpen ? 'Collapse Conductor Hub' : 'Expand Conductor Hub'}</span>
          </button>
        </div>

        {conductorHubOpen && (
          <ConductorOrchestratorHub
            currentProspectName={prospectName || 'Target Account'}
            currentDealStage={dealStage}
            currentDealNotes={dealNotes}
            onApplyHarmonizationToOutreach={(optimizedOutreach, score) => {
              setOutreachDraft(optimizedOutreach);
              showToast(`Applied Conductor optimization (Score: ${score}/100)`, 'success');
            }}
          />
        )}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        
        {/* Left Column: Outreach Generator & MEDDPICC Matrix */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" /> Outreach & MEDDPICC Deal Auditor
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('gateway')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Switch to Gateway Portfolio"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gateway</span>
                </button>
                <button
                  onClick={handleEditInAegis}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg"
                  title="Edit agent persona in Aegis Agent Generator"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Edit in Aegis Generator</span>
                </button>
              </div>
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

            {/* Heuristic Audit Quick Action */}
            <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audit deal with the {networkStatus.effectiveMode === 'live_api' ? 'Live Gemini 2.5 API' : 'Local Deterministic Engine'}</span>
              </div>
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                Run MEDDPICC Audit
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={saveDeal} className="sm:flex-[1] bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors border border-white/10 text-sm">
                Save to Local CRM
              </button>
              <button onClick={generateOutreach} disabled={isDrafting} className="sm:flex-[1.5] flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 text-sm">
                {isDrafting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate with {activeAgent?.name}
              </button>
              <button
                onClick={handleHarmonizeWithConductor}
                className="sm:flex-[1.5] flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] text-sm"
                title="Harmonize and maximize positive outcome probability using Conductor engine"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ Maximize with Conductor</span>
              </button>
            </div>

            {outreachDraft && (
              <div className="mt-6 p-4 bg-slate-800/50 border border-white/10 rounded-xl space-y-3">
                <div className="mb-3 px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-start gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-200">
                    <span className="font-semibold text-indigo-300">Copilot Insight ({activeAgent?.name}):</span>{' '}
                    {activeAgent?.name === 'Dragon-Outcome-Conductor' && 'Dual-core synchronized with Nexus-Orchestrator to pace real-time sub-agent execution, eliminate deal friction, and optimize positive revenue win probability.'}
                    {activeAgent?.name === 'Nexus-Orchestrator' && 'Coordinating multi-agent macro-architectures, strategy delegation pipelines, and AI Studio application monetization.'}
                    {(activeAgent?.name === 'Enterprise Deal Closer' || activeAgent?.name === 'Aegis-Closer') && 'Operating on MEDDPICC framework principles to audit pipeline qualification gaps, eliminate single-point failure risks, and direct executive decision timelines.'}
                    {(activeAgent?.name === 'Technical Discovery Specialist' || activeAgent?.name === 'Dragon-Prospector-X') && 'Executing technical presales deep-dives, validating architecture compliance, resolving security/integration objections, and bench-testing PoC specs.'}
                    {(activeAgent?.name === 'Executive Outreach Strategist' || activeAgent?.name === 'RevenueEngine-AE') && 'Positioning strategic C-suite value, framing collaborative multi-year partnerships, and driving executive engagement.'}
                    {activeAgent?.name === 'Aegis-Inbound-SDR' && 'Tuned for rapid BANT qualification, frictionless booking conversion, and executive meeting confirmation.'}
                    {activeAgent?.name === 'Dragon-Battlecard-AI' && 'Configured for competitive displacement, high-impact landmine questions, and Total Cost of Ownership (TCO) advantage.'}
                    {activeAgent?.name === 'Aegis-PaperProcess-Navigator' && 'Specialized in unblocking InfoSec/procurement hurdles, distributing compliance collateral, and accelerating closing velocity.'}
                    {activeAgent?.name === 'RevenueEngine-Revival-Copilot' && 'Optimized for 9-word re-engagement pattern interrupts, stalled opportunity revival, and deferred ramp pricing negotiation.'}
                    {!['Dragon-Outcome-Conductor', 'Nexus-Orchestrator', 'Enterprise Deal Closer', 'Aegis-Closer', 'Technical Discovery Specialist', 'Dragon-Prospector-X', 'Executive Outreach Strategist', 'RevenueEngine-AE', 'Aegis-Inbound-SDR', 'Dragon-Battlecard-AI', 'Aegis-PaperProcess-Navigator', 'RevenueEngine-Revival-Copilot'].includes(activeAgent?.name || '') &&
                      `Drafted using the ${activeAgent?.archetype || 'Specialized'} persona, focusing heavily on mitigating pipeline risks.`
                    }
                  </p>
                </div>

                {/* AI-Suggested Subject Lines */}
                {suggestedSubjects.length > 0 && (
                  <div className="space-y-1.5 pt-1 pb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Suggested Subject Lines:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {suggestedSubjects.map((subj, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSubject(subj)}
                          className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition-all flex items-center justify-between group"
                        >
                          <span className="truncate">{subj}</span>
                          <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 font-medium shrink-0 ml-2">Apply &rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Outreach Preview or Textarea Editor */}
                {isEditingDraft ? (
                  <textarea
                    value={outreachDraft}
                    onChange={(e) => setOutreachDraft(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-900/90 rounded-lg border border-indigo-500/50 p-3.5 text-sm text-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                  />
                ) : (
                  <div className="p-3.5 bg-slate-900/90 rounded-lg border border-white/5 whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                    {(() => {
                      const urlRegex = /(https?:\/\/[^\s\)\],]+|www\.[^\s\)\],]+)/gi;
                      const parts = outreachDraft.split(urlRegex);
                      return parts.map((part, index) => {
                        if (urlRegex.test(part)) {
                          const href = ensureUrl(part);
                          return (
                            <a
                              key={index}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => openExternalUrl(href, e)}
                              className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-1 transition-colors break-all"
                              title={`Open ${href}`}
                            >
                              <span>{part}</span>
                              <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80" />
                            </a>
                          );
                        }
                        return part;
                      });
                    })()}
                  </div>
                )}

                {/* Functional Outreach Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 flex-wrap">
                    {extractUrls(outreachDraft).map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => openExternalUrl(url, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-medium transition-colors"
                        title="Open external link directly"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Open Booking Link</span>
                      </a>
                    ))}

                    {(() => {
                      const lines = outreachDraft.split('\n');
                      let subject = `Follow up with ${prospectName || 'Team'}`;
                      let body = outreachDraft;
                      if (lines[0] && lines[0].toLowerCase().startsWith('subject:')) {
                        subject = lines[0].replace(/^subject:\s*/i, '').trim();
                        body = lines.slice(1).join('\n').trim();
                      }
                      return (
                        <a
                          href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors"
                          title="Draft this email in your default mail application"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dispatch via Mail</span>
                        </a>
                      );
                    })()}

                    <button
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors"
                    >
                      {isEditingDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{isEditingDraft ? 'Save Edits' : 'Edit Draft'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportOutreachSpec}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors"
                      title="Export Outreach Spec (.json)"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Export JSON</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(outreachDraft);
                        setToast({ type: 'success', message: 'Outreach draft copied to clipboard!' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-medium transition-colors"
                      title="Copy full outreach draft"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Copy Text</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time MEDDPICC Heuristic Audit Matrix */}
          {currentAudit && (
            <MeddpiccMatrix
              auditResult={currentAudit}
              onApplyGapsToOutreach={handleApplyGapsToOutreach}
            />
          )}
        </div>

        {/* Right Column: Autonomous Worker Terminal */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 flex flex-col h-[650px] overflow-hidden">
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
