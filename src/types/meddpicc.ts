export type MeddpiccPillarKey =
  | 'metrics'
  | 'economicBuyer'
  | 'decisionCriteria'
  | 'decisionProcess'
  | 'paperProcess'
  | 'identifiedPain'
  | 'champion'
  | 'competition';

export interface PillarEvaluation {
  key: MeddpiccPillarKey;
  name: string;
  shortCode: 'M' | 'E' | 'D' | 'D' | 'P' | 'I' | 'C' | 'C';
  score: number; // 0 - 100
  status: 'strong' | 'moderate' | 'weak' | 'gap';
  finding: string;
  gap: boolean;
  recommendation: string;
}

export interface MeddpiccAuditResult {
  source: 'live_api' | 'local_deterministic';
  modelUsed?: string;
  timestamp: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'F';
  qualificationStatus: string;
  summary: string;
  pillars: Record<MeddpiccPillarKey, PillarEvaluation>;
  singlePointFailures: string[];
  surgicalRecommendations: string[];
  estimatedRoi: number;
  latencyMs?: number;
  engineReason?: string;
}

export type HeuristicEngineMode = 'auto' | 'force_live' | 'force_local';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveMode: 'live_api' | 'local_deterministic';
  latencyMs: number | null;
  lastChecked: string;
  serverReachable: boolean;
}
