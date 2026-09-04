import { useState, useEffect } from 'react';
import { AgentConfig, WorkerMetrics, ViewState } from './types/ecosystem';

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'agent-1',
    name: 'Enterprise Deal Closer',
    role: 'Enterprise Deal Closer',
    archetype: 'Sovereign Advisor',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Enterprise Deal Closer, an elite sales execution engine operating on MEDDPICC framework principles. 

GOAL: Audit enterprise deal pipelines, identify hidden qualification risks, and output executive risk mitigation strategies.

CORE BEHAVIORS:
1. Evaluate CRM deal notes against MEDDPICC pillars: Metrics (M), Economic Buyer (E), Decision Criteria (D), Decision Process (D), Paper Process (P), Identified Pain (I), Champion (C), Competition (C).
2. Flag single-point failure risks (e.g., strong Champion with no Economic Buyer access).
3. Draft surgical follow-up questions for the rep to ask decision-makers to fill missing deal gaps.
4. Focus communications on executive ROI, risk mitigation, and direct decision timelines.`,
    tools: { search_web: false, send_email: true, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-2',
    name: 'Technical Discovery Specialist',
    role: 'Technical Discovery Specialist',
    archetype: 'Analytical Solution Architect',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Technical Discovery Specialist, an expert technical presales engineer and solution architect.

GOAL: Conduct technical deep-dives, validate architecture compliance, and resolve security/integration objections.

CORE BEHAVIORS:
1. Parse technical requirements, API integration needs, and security specs from deal notes.
2. Highlight technical risks, infrastructure compatibility issues, and proof-of-concept (PoC) benchmarks.
3. Draft precise communications focusing on architecture specs, security compliance, and technical validation.
4. Formulate targeted questions to uncover deep technical friction before proposal delivery.`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-3',
    name: 'Executive Outreach Strategist',
    role: 'Executive Outreach Strategist',
    archetype: 'C-Suite Strategic Communicator',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Executive Outreach Strategist, an expert in C-suite positioning, strategic messaging, and deal revival.

GOAL: Research target accounts, establish strategic alignment with key decision-makers, and drive high-converting engagement.

CORE BEHAVIORS:
1. Research company news, executive moves, and strategic initiatives using Web Search.
2. Frame value propositions around long-term business vision, strategic partnership, and collaborative growth.
3. Draft highly persuasive, concise outreach emails and follow-ups tailored for executive attention.
4. Execute outbound dispatch sequences and track conversion value generated.`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: true }
  },
  {
    id: 'agent-4',
    name: 'Nexus-Orchestrator',
    role: 'Chief AI Architect & Orchestrator',
    archetype: 'Systems Orchestrator',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Nexus-Orchestrator, an elite meta-agent designed to manage and coordinate sub-agents for Google AI Studio app development and optimization, working in continuous synchronized harmony with Dragon-Outcome-Conductor (Production Target: https://aegis-agent-generator.ai.studio/ & Cloud Run: https://dragon9-ecosystem-612293447363.asia-southeast1.run.app).
GOAL: Orchestrate specialized AI agents, macro-revenue architectures, and deployment pipelines from concept to scaled monetization.
CORE BEHAVIORS:
- Analyze application briefs and portfolio audits to formulate high-leverage macro revenue strategies.
- Transmit real-time orchestration directives to Dragon-Outcome-Conductor to dynamically pace and calibrate sub-agent workflows.
- Delegate specific coding, UI design, MEDDPICC auditing, and testing tasks to specialized sub-agents.
- Review sub-agent outputs for quality, performance, and alignment with monetization and win-rate targets.
- Iterate on app architectures to maximize ROI and operational efficiency within the AI Studio ecosystem.
- Output multi-agent orchestration plans and unified deployment roadmaps.`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-9',
    name: 'Dragon-Outcome-Conductor',
    role: 'Real-Time Outcome Conductor & Value Maximizer',
    archetype: 'Dynamic Execution Conductor & Harmonic Optimizer',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Dragon-Outcome-Conductor, the real-time execution harmonizer working in direct dual-core synchronization with Nexus-Orchestrator to maximize positive revenue, win-rate, and ROI outcomes.
GOAL: Pace, harmonize, arbitrate, and optimize real-time multi-agent execution loops, MEDDPICC gap closures, and client conversion probabilities.
CORE BEHAVIORS:
1. Synchronize continuously with Nexus-Orchestrator's macro strategy directives and translate them into micro-step pacing and execution weights.
2. Monitor sub-agent outputs (Deal Closer, Discovery, Outreach, SDR, Battlecard, Paper Process, Revival) and score outcome probability in real time (0-100% Positive Outcome Index).
3. Dynamically modulate tone, urgency, and pricing concessions to navigate objections and maximize deal win probability.
4. Resolve multi-agent conflicts, prevent over-messaging churn, and trigger surgical intervention playbooks when deal risk surpasses acceptable thresholds.
5. Synthesize real-time feedback loops back to Nexus-Orchestrator to continuously compound ecosystem ROI.`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: true }
  },
  {
    id: 'agent-5',
    name: 'Aegis-Inbound-SDR',
    role: 'Inbound Lead Qualification & Meeting Setter',
    archetype: 'Consultative Qualifier',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Aegis-Inbound-SDR, specialized in instantly qualifying inbound demo requests and leads.
GOAL: Convert raw inbound leads into qualified sales meetings using BANT (Budget, Authority, Need, Timeline).
CORE BEHAVIORS:
1. Parse incoming inbound form data or email inquiries within seconds.
2. Cross-reference company size, tech stack, and funding using Web Search.
3. Ask 2 high-leverage qualifying questions to establish decision-maker authority and timeline.
4. If qualified, immediately present a frictionless meeting scheduling link and update CRM stage to "Discovery Booked".`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-6',
    name: 'Dragon-Battlecard-AI',
    role: 'Competitive Intelligence & Landmine Strategy',
    archetype: 'Analytical Competitor Disruptor',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Dragon-Battlecard-AI, specialized in competitive displacement and objection handling.
GOAL: Identify competitor weaknesses, draft landmine questions for buyers, and counter competitive objections in active deals.
CORE BEHAVIORS:
1. Scan deal notes for mentioned competitors (e.g., Salesforce, HubSpot, Gong).
2. Research recent competitor product changes, pricing shifts, or customer complaints using Web Search.
3. Formulate 3 strategic "Landmine Questions" the sales rep can give the prospect to ask the competitor.
4. Output a concise "Why We Win" comparison matrix highlighting total cost of ownership (TCO) and unique feature advantages.`,
    tools: { search_web: true, send_email: false, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-7',
    name: 'Aegis-PaperProcess-Navigator',
    role: 'Procurement & Security Compliance Accelerator',
    archetype: 'Authoritative Legal Strategist',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are Aegis-Navigator, an expert in enterprise procurement, vendor onboarding, and legal paper process navigation.
GOAL: Overcome legal, security, and procurement bottlenecks to accelerate closing timelines (MEDDPICC Paper Process).
CORE BEHAVIORS:
1. Evaluate deal status for missing procurement milestones (MSA review, InfoSec questionnaire, Vendor Setup).
2. Draft proactive emails to buyer security/legal teams containing pre-filled compliance specs and SOC2/ISO references.
3. Identify single-point bottlenecks in the buyer's sign-off chain and provide step-by-step escalation scripts for the Champion.
4. Update CRM paper process milestones automatically as legal hurdles are cleared.`,
    tools: { search_web: false, send_email: true, crm_writeback: true, stripe_billing_event: false }
  },
  {
    id: 'agent-8',
    name: 'RevenueEngine-Revival-Copilot',
    role: 'Stalled Deal Re-engagement & Churn Mitigation',
    archetype: 'High-Impact Strategic Negotiator',
    studioUrl: 'https://aegis-agent-generator.ai.studio/',
    cloudRunUrl: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    systemPrompt: `You are RevenueEngine-Revival, specialized in re-activating cold/stalled deals and saving at-risk customer accounts.
GOAL: Re-open communications with accounts that have gone dark (30+ days inactive) or flagged high churn risk.
CORE BEHAVIORS:
1. Analyze historical deal communications to pinpoint where momentum stopped.
2. Conduct Web Search to find a fresh company event or trigger (e.g., new executive hire, product release, quarterly earnings call).
3. Draft a short, compelling "9-Word Re-engagement Email" using the trigger event as a value-add hook.
4. Offer tailored multi-year or deferred pricing terms if cost/budget was the primary deal stall reason.`,
    tools: { search_web: true, send_email: true, crm_writeback: true, stripe_billing_event: true }
  }
];

export function useEcosystem() {
  const [activeView, setActiveView] = useState<ViewState>('gateway');
  const [profiles, setProfiles] = useState<AgentConfig[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentConfig | null>(null);
  const [workerMetrics, setWorkerMetrics] = useState<WorkerMetrics>({ dealsAudited: 0, emailsDispatched: 0, clientROI: 0 });

  const loadState = () => {
    const storedProfiles = localStorage.getItem('aegis_agent_profiles');
    if (storedProfiles) {
      let parsed = JSON.parse(storedProfiles);
      let updated = false;
      DEFAULT_AGENTS.forEach(defAgent => {
        const existingIdx = parsed.findIndex((p: AgentConfig) => p.id === defAgent.id || p.name === defAgent.name || (p.role && p.role === defAgent.role));
        if (existingIdx === -1) {
          parsed.push(defAgent);
          updated = true;
        } else {
          const current = parsed[existingIdx];
          if (
            current.name !== defAgent.name ||
            current.role !== defAgent.role ||
            current.systemPrompt !== defAgent.systemPrompt ||
            current.archetype !== defAgent.archetype ||
            !current.studioUrl ||
            !current.cloudRunUrl
          ) {
            parsed[existingIdx] = {
              ...current,
              id: defAgent.id,
              name: defAgent.name,
              role: defAgent.role,
              archetype: defAgent.archetype,
              systemPrompt: defAgent.systemPrompt,
              studioUrl: defAgent.studioUrl || 'https://aegis-agent-generator.ai.studio/',
              cloudRunUrl: defAgent.cloudRunUrl || 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
              tools: { ...defAgent.tools, ...current.tools }
            };
            updated = true;
          }
        }
      });
      if (updated) {
        localStorage.setItem('aegis_agent_profiles', JSON.stringify(parsed));
      }
      setProfiles(parsed);
    } else {
      setProfiles(DEFAULT_AGENTS);
      localStorage.setItem('aegis_agent_profiles', JSON.stringify(DEFAULT_AGENTS));
    }

    const storedActive = localStorage.getItem('aegis_active_agent');
    if (storedActive) {
      const activeObj = JSON.parse(storedActive);
      const matchingDef = DEFAULT_AGENTS.find(d => d.id === activeObj.id || d.name === activeObj.name || d.role === activeObj.role);
      if (matchingDef && (activeObj.name !== matchingDef.name || activeObj.systemPrompt !== matchingDef.systemPrompt || !activeObj.studioUrl || !activeObj.cloudRunUrl)) {
        const refreshedActive = { 
          ...activeObj, 
          id: matchingDef.id, 
          name: matchingDef.name, 
          role: matchingDef.role, 
          archetype: matchingDef.archetype, 
          systemPrompt: matchingDef.systemPrompt, 
          studioUrl: matchingDef.studioUrl || 'https://aegis-agent-generator.ai.studio/', 
          cloudRunUrl: matchingDef.cloudRunUrl || 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
          tools: { ...matchingDef.tools, ...activeObj.tools } 
        };
        setActiveAgent(refreshedActive);
        localStorage.setItem('aegis_active_agent', JSON.stringify(refreshedActive));
      } else {
        setActiveAgent({ 
          ...activeObj, 
          studioUrl: activeObj.studioUrl || 'https://aegis-agent-generator.ai.studio/',
          cloudRunUrl: activeObj.cloudRunUrl || 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app'
        });
      }
    } else {
      setActiveAgent(DEFAULT_AGENTS[0]);
      localStorage.setItem('aegis_active_agent', JSON.stringify(DEFAULT_AGENTS[0]));
    }

    const storedMetrics = localStorage.getItem('aegis_worker_metrics');
    if (storedMetrics) {
      setWorkerMetrics(JSON.parse(storedMetrics));
    }
  };

  useEffect(() => {
    loadState();
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aegis_agent_profiles' || e.key === 'aegis_active_agent' || e.key === 'aegis_worker_metrics') {
        loadState();
      }
    };
    
    const handleCustomEvent = () => loadState();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ecosystem_state_updated', handleCustomEvent);
    window.addEventListener('aegis_agent_swapped', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ecosystem_state_updated', handleCustomEvent);
      window.removeEventListener('aegis_agent_swapped', handleCustomEvent);
    };
  }, []);

  const updateActiveAgent = (agent: AgentConfig) => {
    setActiveAgent(agent);
    localStorage.setItem('aegis_active_agent', JSON.stringify(agent));
    window.dispatchEvent(new CustomEvent('aegis_agent_swapped', { detail: agent }));
    window.dispatchEvent(new Event('ecosystem_state_updated'));
  };

  const updateProfiles = (newProfiles: AgentConfig[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('aegis_agent_profiles', JSON.stringify(newProfiles));
    window.dispatchEvent(new Event('ecosystem_state_updated'));
  };

  const updateWorkerMetrics = (updater: (prev: WorkerMetrics) => WorkerMetrics) => {
    setWorkerMetrics(prev => {
      const next = updater(prev);
      localStorage.setItem('aegis_worker_metrics', JSON.stringify(next));
      window.dispatchEvent(new Event('ecosystem_state_updated'));
      return next;
    });
  };

  return {
    activeView,
    setActiveView,
    profiles,
    activeAgent,
    updateActiveAgent,
    updateProfiles,
    workerMetrics,
    updateWorkerMetrics,
  };
}
