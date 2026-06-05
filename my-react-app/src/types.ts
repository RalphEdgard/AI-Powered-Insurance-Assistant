export type InputMode = "TEXT" | "VOICE";

export type Intent =
  | "REFERRAL_REQUIREMENTS"
  | "PRESCRIPTION_REFILL_SUPPORT"
  | "CLAIMS_OR_DEDUCTIBLE_INFORMATION"
  | "MEMBER_ID_OR_VERIFICATION"
  | "HUMAN_AGENT_REQUEST"
  | "URGENT_CLINICAL_CONCERN"
  | "UNSUPPORTED_REQUEST";

export type Route =
  | "SELF_SERVICE_RESPONSE"
  | "BENEFITS_INFORMATION"
  | "EMERGENCY_ESCALATION"
  | "HUMAN_ESCALATION"
  | "MEMBER_SERVICES_ESCALATION"
  | "ABSTENTION";

export interface PlanSummary {
  plan_id: string;
  plan_name: string;
  plan_type: string;
  coverage_year: number;
  state: string;
}

export interface Citation {
  document: string;
  section: string;
  version: string;
}

export interface RetrievedEvidence {
  chunk_id?: string;
  document: string;
  section: string;
  version: string;
  relevance_score?: number;
  excerpt?: string;
}

export interface ConversationQueryRequest {
  plan_id: string;
  question: string;
  input_mode: InputMode;
}

export interface ConversationQueryResponse {
  conversation_id: string;
  intent: Intent;
  answer: string;
  cited_sources: Citation[];
  retrieved_evidence?: RetrievedEvidence[];
  grounded: boolean;
  route: Route;
  requires_human_escalation: boolean;
  escalation_reason: string | null;
  latency_ms: number;
  provider: string;
}