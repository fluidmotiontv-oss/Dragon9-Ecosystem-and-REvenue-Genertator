export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  archetype: string;
  systemPrompt: string;
  studioUrl?: string;
  cloudRunUrl?: string;
  tools: {
    search_web: boolean;
    send_email: boolean;
    crm_writeback: boolean;
    stripe_billing_event: boolean;
  };
}

export interface PortfolioApp {
  id: string;
  name: string;
  url?: string;
  description: string;
  category?: string;
}

export interface AppAuditTask {
  id: string;
  appId?: string;
  appName: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  category: 'Architecture' | 'Monetization' | 'Compliance' | 'AI Integration';
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  estimatedHours?: number;
}

export interface AuditJobState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  totalApps: number;
  completedApps: number;
  timestamp?: string;
  errorMessage?: string;
}

export interface WorkerMetrics {
  dealsAudited: number;
  emailsDispatched: number;
  clientROI: number;
}

export interface Deal {
  id: string;
  companyName: string;
  value: number;
  stage: string;
  meddpicc: {
    metrics: boolean;
    economicBuyer: boolean;
    decisionCriteria: boolean;
    decisionProcess: boolean;
    paperProcess: boolean;
    identifiedPain: boolean;
    champion: boolean;
    competition: boolean;
  };
}

export type ViewState = 'gateway' | 'aegis' | 'revenue';
