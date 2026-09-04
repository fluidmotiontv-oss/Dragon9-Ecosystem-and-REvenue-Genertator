export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  archetype: string;
  systemPrompt: string;
  tools: {
    search_web: boolean;
    send_email: boolean;
    crm_writeback: boolean;
    stripe_billing_event: boolean;
  };
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
