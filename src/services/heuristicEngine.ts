import {
  MeddpiccAuditResult,
  MeddpiccPillarKey,
  PillarEvaluation,
  HeuristicEngineMode,
  NetworkStatus
} from '../types/meddpicc';
import { AgentConfig } from '../types/ecosystem';

// Local storage key for engine mode preference
const MODE_STORAGE_KEY = 'revenue_heuristic_engine_mode';

let cachedNetworkStatus: NetworkStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  effectiveMode: 'live_api',
  latencyMs: null,
  lastChecked: new Date().toISOString(),
  serverReachable: true
};

const listeners: Array<(status: NetworkStatus) => void> = [];

export function getHeuristicMode(): HeuristicEngineMode {
  if (typeof localStorage === 'undefined') return 'auto';
  return (localStorage.getItem(MODE_STORAGE_KEY) as HeuristicEngineMode) || 'auto';
}

export function setHeuristicMode(mode: HeuristicEngineMode): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }
  refreshNetworkStatus();
}

export function subscribeNetworkStatus(callback: (status: NetworkStatus) => void): () => void {
  listeners.push(callback);
  callback(cachedNetworkStatus);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(status: NetworkStatus) {
  cachedNetworkStatus = status;
  listeners.forEach(cb => cb(status));
}

// Active health check to test actual reachability & latency
export async function refreshNetworkStatus(): Promise<NetworkStatus> {
  const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const mode = getHeuristicMode();

  if (!browserOnline || mode === 'force_local') {
    const status: NetworkStatus = {
      isOnline: browserOnline,
      effectiveMode: 'local_deterministic',
      latencyMs: null,
      lastChecked: new Date().toISOString(),
      serverReachable: false
    };
    notifyListeners(status);
    return status;
  }

  const startTime = Date.now();
  let reachable = false;
  let latency: number | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      latency = Date.now() - startTime;
      reachable = true;
    }
  } catch {
    reachable = false;
  }

  const effectiveMode = (mode === 'force_live' || (mode === 'auto' && reachable))
    ? 'live_api'
    : 'local_deterministic';

  const status: NetworkStatus = {
    isOnline: browserOnline,
    effectiveMode,
    latencyMs: latency,
    lastChecked: new Date().toISOString(),
    serverReachable: reachable
  };

  notifyListeners(status);
  return status;
}

// Setup browser listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => refreshNetworkStatus());
  window.addEventListener('offline', () => refreshNetworkStatus());
}

/**
 * DETERMINISTIC MEDDPICC SCORING ENGINE
 * Operates offline with zero network dependency.
 * Analyzes deal notes, stages, and prospect signals against weighted qualification rules.
 */
export function calculateLocalDeterministicMeddpicc(
  deal: { prospectName: string; dealStage: string; dealNotes: string; value?: number },
  agent?: AgentConfig | null
): MeddpiccAuditResult {
  const start = Date.now();
  const notesLower = (deal.dealNotes || '').toLowerCase();
  const stage = deal.dealStage || 'Post-Discovery Follow-Up';
  const name = deal.prospectName || 'Target Account';

  // Pillar 1: Metrics (M) - Quantifiable Business Outcome
  const hasRoiTerms = /\b(roi|payback|metric|kpi|margin|cost reduction|revenue|\$|%|savings|annual spend)\b/i.test(notesLower);
  const hasNegativeMetrics = /\b(missing roi|unquantified|no business case|no metrics|need to quantify)\b/i.test(notesLower);
  let metricsScore = 55;
  if (hasRoiTerms) metricsScore += 30;
  if (hasNegativeMetrics) metricsScore -= 45;
  metricsScore = Math.max(15, Math.min(95, metricsScore));

  const metricsGap = metricsScore < 60;
  const metricsPillar: PillarEvaluation = {
    key: 'metrics',
    name: 'Metrics (M)',
    shortCode: 'M',
    score: metricsScore,
    status: metricsScore >= 75 ? 'strong' : metricsScore >= 60 ? 'moderate' : metricsScore >= 40 ? 'weak' : 'gap',
    gap: metricsGap,
    finding: metricsGap
      ? 'Quantified financial impact or ROI payback schedule is absent or contested.'
      : 'Identified measurable KPIs and financial justification aligned with deal value.',
    recommendation: metricsGap
      ? 'Build a 3-year Total Cost of Ownership (TCO) model with verified payback < 6 months.'
      : 'Confirm executive hurdle rate benchmarks prior to contract proposal.'
  };

  // Pillar 2: Economic Buyer (E) - P&L Authority & Veto Power
  const hasEbTerms = /\b(cfo|ceo|cro|vp|budget owner|p&l|executive buyer|economic buyer|board)\b/i.test(notesLower);
  const hasEbMissing = /\b(missing eb|missing economic buyer|no eb|unconfirmed eb|no access|need eb access|lacks executive)\b/i.test(notesLower);
  let ebScore = 50;
  if (hasEbTerms) ebScore += 35;
  if (hasEbMissing) ebScore -= 50;
  ebScore = Math.max(10, Math.min(95, ebScore));

  const ebGap = ebScore < 60;
  const ebPillar: PillarEvaluation = {
    key: 'economicBuyer',
    name: 'Economic Buyer (E)',
    shortCode: 'E',
    score: ebScore,
    status: ebScore >= 75 ? 'strong' : ebScore >= 60 ? 'moderate' : ebScore >= 40 ? 'weak' : 'gap',
    gap: ebGap,
    finding: ebGap
      ? 'Economic Buyer with unilateral P&L veto authority has not been directly engaged.'
      : 'Direct access or established sponsorship with the budget holder verified.',
    recommendation: ebGap
      ? 'Arm internal Champion with an executive 1-pager to sponsor an introductory 15-minute briefing with the budget owner.'
      : 'Validate fiscal year cut-off dates and discretionary expenditure thresholds.'
  };

  // Pillar 3: Decision Criteria (D) - Technical & Commercial Requirements
  const hasDcTerms = /\b(criteria|spec|specs|technical|latency|benchmark|compliance|sla|api|sso|security)\b/i.test(notesLower);
  const hasDcMissing = /\b(unclear criteria|vague specs|criteria missing|moving goalpost)\b/i.test(notesLower);
  let dcScore = 65;
  if (hasDcTerms) dcScore += 25;
  if (hasDcMissing) dcScore -= 35;
  dcScore = Math.max(20, Math.min(95, dcScore));

  const dcGap = dcScore < 60;
  const dcPillar: PillarEvaluation = {
    key: 'decisionCriteria',
    name: 'Decision Criteria (D)',
    shortCode: 'D',
    score: dcScore,
    status: dcScore >= 75 ? 'strong' : dcScore >= 60 ? 'moderate' : dcScore >= 40 ? 'weak' : 'gap',
    gap: dcGap,
    finding: dcGap
      ? 'Formal evaluation matrix and technical baseline criteria have not been locked.'
      : 'Technical and architectural parameters are defined and map to our differentiated capabilities.',
    recommendation: dcGap
      ? 'Distribute our architecture compliance rubric to frame evaluation criteria in our favor.'
      : 'Lock technical acceptance sign-off prior to commercial negotiations.'
  };

  // Pillar 4: Decision Process (D) - Sequence of Events to Close
  const hasDpTerms = /\b(timeline|process|committee|milestone|steps|stage|sign-off|quarter|schedule|launch window)\b/i.test(notesLower);
  const hasDpMissing = /\b(undefined timeline|unknown process|unclear steps|delay)\b/i.test(notesLower);
  let dpScore = 60;
  if (hasDpTerms) dpScore += 25;
  if (hasDpMissing) dpScore -= 30;
  if (stage.includes('Contract') || stage.includes('Pricing')) dpScore += 10;
  dpScore = Math.max(20, Math.min(95, dpScore));

  const dpGap = dpScore < 60;
  const dpPillar: PillarEvaluation = {
    key: 'decisionProcess',
    name: 'Decision Process (D)',
    shortCode: 'D',
    score: dpScore,
    status: dpScore >= 75 ? 'strong' : dpScore >= 60 ? 'moderate' : dpScore >= 40 ? 'weak' : 'gap',
    gap: dpGap,
    finding: dpGap
      ? 'Step-by-step consensus timeline and stakeholder sign-off stages remain vague.'
      : 'Defined review gates and sequential approval schedule established.',
    recommendation: dpGap
      ? 'Establish a mutual close plan with concrete calendar dates for security, legal, and executive sign-off.'
      : 'Verify committee voting quorum and scheduled board review meetings.'
  };

  // Pillar 5: Paper Process (P) - Legal, Procurement, & InfoSec
  const hasPpTerms = /\b(msa|nda|infosec|procurement|legal|security questionnaire|soc2|sig|contract|rider)\b/i.test(notesLower);
  const hasPpMissing = /\b(procurement delay|legal block|infosec blocker|paper process gap|redlines)\b/i.test(notesLower);
  let ppScore = 55;
  if (hasPpTerms) ppScore += 30;
  if (hasPpMissing) ppScore -= 35;
  if (stage.includes('Contract')) ppScore += 15;
  ppScore = Math.max(15, Math.min(95, ppScore));

  const ppGap = ppScore < 60;
  const ppPillar: PillarEvaluation = {
    key: 'paperProcess',
    name: 'Paper Process (P)',
    shortCode: 'P',
    score: ppScore,
    status: ppScore >= 75 ? 'strong' : ppScore >= 60 ? 'moderate' : ppScore >= 40 ? 'weak' : 'gap',
    gap: ppGap,
    finding: ppGap
      ? 'Legal, InfoSec, and vendor onboarding tracks have not commenced in parallel.'
      : 'Procurement paperwork, standard MSA terms, and compliance certificates in flight.',
    recommendation: ppGap
      ? 'Dispatch pre-cleared SOC2 Type II package and standard MSA terms to shorten legal cycle by 14 days.'
      : 'Confirm legal signature authority thresholds with Champion.'
  };

  // Pillar 6: Identified Pain (I) - Compelling Business Event & Cost of Inaction
  const hasPainTerms = /\b(pain|problem|friction|legacy|loss|bottleneck|inefficiency|manual|stalled|urgent|risk)\b/i.test(notesLower);
  const hasPainMissing = /\b(no pain|nice to have|low urgency|not critical)\b/i.test(notesLower);
  let painScore = 70;
  if (hasPainTerms) painScore += 20;
  if (hasPainMissing) painScore -= 40;
  painScore = Math.max(20, Math.min(95, painScore));

  const painGap = painScore < 60;
  const painPillar: PillarEvaluation = {
    key: 'identifiedPain',
    name: 'Identified Pain (I)',
    shortCode: 'I',
    score: painScore,
    status: painScore >= 75 ? 'strong' : painScore >= 60 ? 'moderate' : painScore >= 40 ? 'weak' : 'gap',
    gap: painGap,
    finding: painGap
      ? 'Prospect perceives solution as optional ("nice-to-have") rather than business-critical.'
      : 'Severe operational bottleneck and compounding cost of inaction explicitly acknowledged.',
    recommendation: painGap
      ? 'Conduct an operational audit to quantify daily revenue leakage caused by current manual workflow.'
      : 'Tie business pain directly to executive OKRs to protect deal urgency.'
  };

  // Pillar 7: Champion (C) - Powerful Internal Advocate
  const hasChampTerms = /\b(champion|advocate|internal lead|sponsor|ally|vp of|head of)\b/i.test(notesLower);
  const hasChampMissing = /\b(no champion|weak champion|untested champion|neutral lead)\b/i.test(notesLower);
  let champScore = 75;
  if (hasChampTerms) champScore += 15;
  if (hasChampMissing) champScore -= 45;
  champScore = Math.max(20, Math.min(95, champScore));

  const champGap = champScore < 60;
  const champPillar: PillarEvaluation = {
    key: 'champion',
    name: 'Champion (C)',
    shortCode: 'C',
    score: champScore,
    status: champScore >= 75 ? 'strong' : champScore >= 60 ? 'moderate' : champScore >= 40 ? 'weak' : 'gap',
    gap: champGap,
    finding: champGap
      ? 'Internal contact lacks organizational capital or political leverage to drive consensus.'
      : 'Credible internal advocate actively navigating internal roadblocks and sharing intel.',
    recommendation: champGap
      ? 'Test Champion credibility by requesting an introduction to an adjacent stakeholder before committing further resources.'
      : 'Arm Champion with confidential competitive battlecard and ROI justification slides.'
  };

  // Pillar 8: Competition (C) - Incumbents & Do-Nothing Inertia
  const hasCompTerms = /\b(competitor|competition|salesforce|hubspot|gong|incumbent|in-house|alternative|build vs buy)\b/i.test(notesLower);
  const hasCompMissing = /\b(unknown competition|uncontested|no competitor)\b/i.test(notesLower);
  let compScore = 65;
  if (hasCompTerms) compScore += 20;
  if (hasCompMissing) compScore -= 15;
  compScore = Math.max(20, Math.min(95, compScore));

  const compGap = compScore < 60;
  const compPillar: PillarEvaluation = {
    key: 'competition',
    name: 'Competition (C)',
    shortCode: 'C',
    score: compScore,
    status: compScore >= 75 ? 'strong' : compScore >= 60 ? 'moderate' : compScore >= 40 ? 'weak' : 'gap',
    gap: compGap,
    finding: compGap
      ? 'Competitive landscape or internal "do-nothing" inertia has not been mapped.'
      : 'Incumbent vulnerabilities identified with defensive battlecards armed.',
    recommendation: compGap
      ? 'Ask discovery trap questions to expose incumbent seat-tax penalization and maintenance overhead.'
      : 'Deliver 3 strategic landmine questions to Champion to neutralize competitor pricing bids.'
  };

  // Weighted Composite Calculation
  // M: 15%, E: 20%, D: 10%, D: 10%, P: 10%, I: 15%, C: 15%, C: 5%
  const composite = Math.round(
    metricsScore * 0.15 +
    ebScore * 0.20 +
    dcScore * 0.10 +
    dpScore * 0.10 +
    ppScore * 0.10 +
    painScore * 0.15 +
    champScore * 0.15 +
    compScore * 0.05
  );

  // Determine Grade
  let grade: 'A' | 'B' | 'C' | 'F' = 'B';
  let qualificationStatus = 'Qualified with Manageable Risks';
  if (composite >= 85) {
    grade = 'A';
    qualificationStatus = 'Prime Enterprise Opportunity (High Win Probability)';
  } else if (composite >= 70) {
    grade = 'B';
    qualificationStatus = 'Qualified Opportunity (Targeted Gap Resolution Needed)';
  } else if (composite >= 50) {
    grade = 'C';
    qualificationStatus = 'Vulnerable Opportunity (Critical Single-Point Failures Present)';
  } else {
    grade = 'F';
    qualificationStatus = 'Disqualified / High Slippage Risk (Urgent Intervention Required)';
  }

  // Single-Point Failure Detection
  const singlePointFailures: string[] = [];
  if (champScore >= 70 && ebScore < 50) {
    singlePointFailures.push(
      'Fatal Champion Trap: Strong internal advocate without confirmed Economic Buyer alignment. Vulnerable to budget freeze.'
    );
  }
  if (metricsScore < 50) {
    singlePointFailures.push(
      'Unquantified Business Case: Deal lacks clear ROI hurdle rate; vulnerable to "Do Nothing" executive rejection.'
    );
  }
  if (ppScore < 50 && (stage.includes('Contract') || stage.includes('Pricing'))) {
    singlePointFailures.push(
      'Procurement Blindspot: Target close stage reached without active InfoSec / Legal paper process review.'
    );
  }
  if (painScore < 50) {
    singlePointFailures.push(
      'Weak Executive Priority: Core pain not connected to board-level mandate; deal likely to stall past quarter-end.'
    );
  }

  // Surgical Recommendations
  const surgicalRecommendations: string[] = [];
  if (ebGap) {
    surgicalRecommendations.push(
      `Secure 15-minute briefing with the designated Economic Buyer for ${name} using Champion endorsement.`
    );
  }
  if (metricsGap) {
    surgicalRecommendations.push(
      `Calculate quantified cost-of-inaction model proving >300% annualized ROI for ${name}.`
    );
  }
  if (ppGap) {
    surgicalRecommendations.push(
      `Pre-emptively route SOC 2 Type II compliance pack and standard vendor terms to ${name} Procurement.`
    );
  }
  if (surgicalRecommendations.length === 0) {
    surgicalRecommendations.push(
      `Maintain weekly cadence with Champion to execute final signature milestones ahead of quarter end.`
    );
  }

  const estimatedRoi = Math.max(120000, Math.round((deal.value || 150000) * (composite / 50)));

  const latencyMs = Date.now() - start;

  return {
    source: 'local_deterministic',
    timestamp: new Date().toISOString(),
    overallScore: composite,
    grade,
    qualificationStatus,
    summary: `Local Deterministic MEDDPICC engine evaluated ${name} with a composite score of ${composite}/100 (Grade ${grade}). ${singlePointFailures.length > 0 ? `${singlePointFailures.length} critical single-point failure(s) identified.` : 'All primary qualification criteria aligned.'}`,
    pillars: {
      metrics: metricsPillar,
      economicBuyer: ebPillar,
      decisionCriteria: dcPillar,
      decisionProcess: dpPillar,
      paperProcess: ppPillar,
      identifiedPain: painPillar,
      champion: champPillar,
      competition: compPillar
    },
    singlePointFailures,
    surgicalRecommendations,
    estimatedRoi,
    latencyMs,
    engineReason: 'Computed locally via deterministic rule heuristics (Zero latency / Offline resilient)'
  };
}

/**
 * UNIFIED HEURISTIC ENGINE ROUTER
 * Proactively checks network connectivity.
 * Calls live Gemini API if online, or falls back to local deterministic engine seamlessly.
 */
export async function evaluateMeddpiccWithHeuristicEngine(
  deal: { prospectName: string; dealStage: string; dealNotes: string; value?: number },
  agent?: AgentConfig | null,
  onLog?: (msg: string) => void
): Promise<MeddpiccAuditResult> {
  const netStatus = await refreshNetworkStatus();
  const mode = getHeuristicMode();

  // If forced local or completely offline, use local deterministic immediately
  if (mode === 'force_local' || !netStatus.isOnline || !netStatus.serverReachable) {
    onLog?.(
      `[HEURISTIC ENGINE] Network ${!netStatus.isOnline ? 'offline' : 'unreachable'} or local mode forced -> Running Local Deterministic MEDDPICC Engine.`
    );
    return calculateLocalDeterministicMeddpicc(deal, agent);
  }

  // Attempt live API call with fallback
  onLog?.(`[HEURISTIC ENGINE] Network available (${netStatus.latencyMs || 25}ms) -> Dispatching live API call to /api/revenue-meddpicc-audit...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/revenue-meddpicc-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal,
        agent: agent
          ? { name: agent.name, role: agent.role, archetype: agent.archetype }
          : null
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Live API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.pillars) {
      onLog?.(`[HEURISTIC ENGINE] Live Gemini API call successful (Score: ${data.overallScore}/100, Grade: ${data.grade}).`);
      return {
        ...data,
        source: 'live_api',
        modelUsed: data.modelUsed || 'gemini-3.6-flash',
        engineReason: 'Evaluated via Live Gemini 3.6 Flash Server API'
      };
    } else {
      throw new Error('Malformed payload from live API');
    }
  } catch (error: any) {
    onLog?.(`[HEURISTIC FALLBACK] Live API call failed (${error.message || 'network timeout'}). Gracefully switching to Local Deterministic MEDDPICC Engine...`);
    
    // Smooth fallback to deterministic scoring
    const fallbackResult = calculateLocalDeterministicMeddpicc(deal, agent);
    fallbackResult.engineReason = `Fallback from Live API failure (${error.name === 'AbortError' ? 'Timeout' : 'Network error'}): Evaluated deterministically.`;
    return fallbackResult;
  }
}
