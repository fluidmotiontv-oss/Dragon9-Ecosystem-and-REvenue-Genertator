import { AgentConfig } from '../types/ecosystem';

export type ConductorHarmonicMode = 
  | 'enterprise_value'
  | 'velocity_maximizer'
  | 'risk_shielded_consensus'
  | 'revival_surge'
  | 'adaptive_orchestration';

export interface OutcomePillars {
  winProbability: number; // 0-100
  roiMultiplier: number; // 1.0 - 5.0x
  velocityScore: number; // 0-100
  riskMitigation: number; // 0-100
  consensusIndex: number; // 0-100
}

export interface ConductorDirective {
  id: string;
  timestamp: string;
  source: 'Nexus-Orchestrator' | 'Dragon-Outcome-Conductor';
  targetAgent: string;
  mode: ConductorHarmonicMode;
  macroDirective: string;
  microHarmonization: string;
  positiveOutcomePacing: string;
  expectedLift: string;
  activeStatus: 'executing' | 'synchronized' | 'optimizing';
}

export interface OutcomeSimulationResult {
  accountName: string;
  baselineWinRate: number;
  optimizedWinRate: number;
  projectedDealValue: number;
  unlockedIncrementalRoi: number;
  criticalDrivers: string[];
  recommendedPlaybook: string;
  orchestratorStrategy: string;
  conductorHarmonization: string;
  suggestedAction: string;
}

const STORAGE_KEY_MODE = 'dragon9_conductor_mode';
const STORAGE_KEY_DIRECTIVES = 'dragon9_conductor_directives';

export function getStoredConductorMode(): ConductorHarmonicMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MODE);
    if (saved) return saved as ConductorHarmonicMode;
  } catch {}
  return 'adaptive_orchestration';
}

export function setStoredConductorMode(mode: ConductorHarmonicMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
    window.dispatchEvent(new CustomEvent('conductor_mode_updated', { detail: mode }));
  } catch {}
}

export function getStoredDirectives(): ConductorDirective[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DIRECTIVES);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultDirectives();
}

export function saveDirectives(directives: ConductorDirective[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DIRECTIVES, JSON.stringify(directives));
    window.dispatchEvent(new CustomEvent('conductor_directives_updated', { detail: directives }));
  } catch {}
}

export function getDefaultDirectives(): ConductorDirective[] {
  return [
    {
      id: 'dir-1',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      source: 'Nexus-Orchestrator',
      targetAgent: 'Enterprise Deal Closer',
      mode: 'enterprise_value',
      macroDirective: 'Establish board-level ROI justification & eliminate single points of failure in Q3 pipeline.',
      microHarmonization: 'Pace discovery questions around CFO payback hurdles; pre-empt vendor consolidation objections.',
      positiveOutcomePacing: 'Synchronized (Harmonic 1.4x)',
      expectedLift: '+38% Win-Rate Lift',
      activeStatus: 'synchronized'
    },
    {
      id: 'dir-2',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString('en-US', { hour12: false }),
      source: 'Dragon-Outcome-Conductor',
      targetAgent: 'Technical Discovery Specialist',
      mode: 'risk_shielded_consensus',
      macroDirective: 'De-risk enterprise architecture and fast-track InfoSec SAML 2.0 / zero-trust benchmarks.',
      microHarmonization: 'Distribute pre-filled SOC2 compliance packs to shorten PoC latency from 21 days to 48 hours.',
      positiveOutcomePacing: 'Accelerated (Harmonic 2.1x)',
      expectedLift: '+$140k Incremental Contract Value',
      activeStatus: 'executing'
    },
    {
      id: 'dir-3',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString('en-US', { hour12: false }),
      source: 'Dragon-Outcome-Conductor',
      targetAgent: 'Dragon-Battlecard-AI',
      mode: 'velocity_maximizer',
      macroDirective: 'Neutralize competitor seat-tax pricing models across active opportunities.',
      microHarmonization: 'Arm Champion with 3 tactical landmine questions highlighting zero token markup and offline PWA agility.',
      positiveOutcomePacing: 'Dynamic Surge',
      expectedLift: '+45% Competitive Displacement Rate',
      activeStatus: 'optimizing'
    }
  ];
}

/**
 * Simulates and maximizes positive outcome probability for a specific deal context
 */
export function simulatePositiveOutcome(
  accountName: string,
  dealStage: string,
  dealNotes: string,
  dealValue: number,
  activeAgent: AgentConfig | null,
  mode: ConductorHarmonicMode
): OutcomeSimulationResult {
  const notesLower = dealNotes.toLowerCase();
  
  // Baseline heuristic win-rate
  let baseline = 38;
  if (dealStage === 'Pricing & Contract Nudge') baseline += 20;
  if (dealStage === 'MEDDPICC Gap Resolution') baseline += 10;
  if (notesLower.includes('champion') || notesLower.includes('sponsor')) baseline += 8;
  if (notesLower.includes('cfo') || notesLower.includes('economic buyer')) baseline += 12;
  if (notesLower.includes('competitor') || notesLower.includes('discount')) baseline -= 10;
  if (notesLower.includes('stalled') || notesLower.includes('inactive')) baseline -= 15;
  baseline = Math.max(15, Math.min(65, baseline));

  // Conductor outcome optimization calculation
  let boost = 28;
  if (mode === 'enterprise_value') boost = 34;
  if (mode === 'velocity_maximizer') boost = 31;
  if (mode === 'risk_shielded_consensus') boost = 37;
  if (mode === 'revival_surge') boost = 42;
  if (mode === 'adaptive_orchestration') boost = 36;

  const optimized = Math.min(96, Math.max(baseline + 20, baseline + boost));
  const incrementalRoi = Math.round((dealValue * (optimized - baseline)) / 100 * 1.85);

  const criticalDrivers = [];
  if (notesLower.includes('cfo') || mode === 'enterprise_value') {
    criticalDrivers.push('Quantified 3-year payback horizon with verified hurdle rate');
  } else {
    criticalDrivers.push('C-Suite Economic Buyer formal alignment and sign-off');
  }
  
  if (notesLower.includes('competitor') || mode === 'velocity_maximizer') {
    criticalDrivers.push('Deployment of strategic landmine questions countering incumbent seat-tax');
  } else {
    criticalDrivers.push('Single-point failure elimination via champion multi-threading');
  }

  if (notesLower.includes('infosec') || notesLower.includes('legal') || mode === 'risk_shielded_consensus') {
    criticalDrivers.push('Fast-tracked SOC2 Type II compliance packet with mutual NDA bypass');
  } else {
    criticalDrivers.push('Frictionless meeting reservation bridge with calendar integration');
  }

  let recommendedPlaybook = 'Strategic MEDDPICC Gap Elimination & Executive Payback Synthesis';
  if (mode === 'velocity_maximizer') {
    recommendedPlaybook = 'Rapid High-Velocity BANT Qualification & Immediate Discovery Onboarding';
  } else if (mode === 'risk_shielded_consensus') {
    recommendedPlaybook = 'Multi-Stakeholder Consensus Shielding & Accelerated InfoSec Clearance';
  } else if (mode === 'revival_surge') {
    recommendedPlaybook = '9-Word Re-engagement Hook with Structured Deferred Net-90 Terms';
  }

  const orchestratorStrategy = `Nexus-Orchestrator Macro Plan: Scale portfolio revenue by targeting ${accountName} with prioritized ${mode.replace('_', ' ').toUpperCase()} directives.`;
  const conductorHarmonization = `Dragon-Outcome-Conductor Real-Time Pacing: Harmonizing ${activeAgent?.name || 'Copilot'} with dynamic outcome weights to lift win probability from ${baseline}% to ${optimized}%.`;
  const suggestedAction = `Trigger surgical outreach sequence addressing "${criticalDrivers[0]}" to lock immediate decision milestone.`;

  return {
    accountName: accountName || 'Target Opportunity',
    baselineWinRate: baseline,
    optimizedWinRate: optimized,
    projectedDealValue: dealValue || 150000,
    unlockedIncrementalRoi: incrementalRoi || 85000,
    criticalDrivers,
    recommendedPlaybook,
    orchestratorStrategy,
    conductorHarmonization,
    suggestedAction
  };
}

/**
 * Harmonizes outreach content to maximize conversion and positive outcome psychology
 */
export function harmonizeOutreachForPositiveOutcome(
  originalDraft: string,
  accountName: string,
  agent: AgentConfig | null,
  mode: ConductorHarmonicMode
): { harmonizedDraft: string; outcomeScore: number; psychologicalDrivers: string[] } {
  const agentName = agent?.name || 'Dragon-Outcome-Conductor';
  
  let header = `[CONDUCTOR OPTIMIZED OUTCOME SEQUENCE - HARMONIC MODE: ${mode.toUpperCase()}]`;
  let outcomeScore = 94;
  let psychologicalDrivers = [
    'Loss Aversion Mitigation (Executive Cost of Inaction)',
    'Cognitive Fluency & Single-Call-to-Action Focus',
    'Quantified Hurdle Rate & Compounding Payback Justification'
  ];

  if (mode === 'velocity_maximizer') {
    outcomeScore = 96;
    psychologicalDrivers = [
      'Ultra-low cognitive friction scheduling',
      'Instant value realization trigger',
      'Zero-commitment technical preview'
    ];
  } else if (mode === 'risk_shielded_consensus') {
    outcomeScore = 95;
    psychologicalDrivers = [
      'Pre-empted InfoSec / Procurement friction',
      'Multi-stakeholder risk mitigation guarantee',
      'Compliance certainty with pre-filled SOC2 rider'
    ];
  }

  const lines = originalDraft.split('\n');
  let subjectLine = lines[0] && lines[0].toLowerCase().startsWith('subject:') ? lines[0] : `Subject: Maximizing Positive Outcomes & Strategic Alignment: ${accountName}`;
  let body = lines.slice(1).join('\n').trim();

  const harmonizedDraft = `${subjectLine}

Hi ${accountName || 'Leadership'} Team,

${body ? body : `Following our strategic ecosystem review and multi-agent pipeline audit:

1. EXECUTIVE VALUE & RISK MITIGATION:
Our analysis reveals significant upside in eliminating manual workflow bottlenecks, removing legacy infrastructure seat-tax, and accelerating digital asset monetization for ${accountName}.

2. HARMONIZED ACTION MILESTONES:
• We have pre-aligned technical compliance specifications (TLS 1.3 / SOC 2 Type II / Zero-Trust API SLAs).
• Structured flexible ramp terms to eliminate upfront fiscal hurdles and guarantee measurable positive ROI.`}

=== CONDUCTOR VALUE CONVERGENCE INVITATION ===
To review our quantified business case and ensure complete alignment with your quarterly milestone targets, let's schedule a concise 12-minute executive checkpoint:
🔗 https://cal.com/enterprise-revenue/executive-sync

Best regards,
${agentName}
Strategic Outcome Harmonizer | Dragon9 Autonomous Sales Ecosystem`;

  return {
    harmonizedDraft,
    outcomeScore,
    psychologicalDrivers
  };
}
