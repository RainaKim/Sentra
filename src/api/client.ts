// ---------------------------------------------------------------------------
// API Client — src/api/client.ts
//
// All network calls go through this module.
// To switch to a deployed backend, change ONLY `VITE_API_BASE_URL` in your
// environment / .env file. See src/config.ts for details.
//
// NOTE: All contract-defined endpoints carry the /v1 prefix per api_contract_v1.md.
// The base URL is host-only (e.g. http://localhost:8000); /v1 is part of the path.
// ---------------------------------------------------------------------------

import { API_BASE_URL } from "../config";
import type {
  ApiError,
  AuthResponse,
  Company,
  CreateDecisionResponse,
  DecisionResponse,
  DemoFixture,
  UserResponse,
  WorkspaceMetrics,
  WorkspaceDecisionsResponse,
  ReasoningTraceResponse,
  SimulationResponse,
  RiskHistoryResponse,
  EvidenceResponse,
  AgentsResponse,
  AgentItem,
  EscalationRulesResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json() as ApiError;
      if (typeof errBody.detail === "string") {
        message = errBody.detail;
      } else if (Array.isArray(errBody.detail)) {
        message = errBody.detail.map((d) => d.msg).join(", ");
      }
    } catch {
      // fall through with status message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** POST /v1/auth/login — 401 on bad credentials, 403 if inactive */
export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /v1/auth/signup — 409 if email already registered */
export async function apiSignup(
  email: string,
  password: string,
  name?: string,
  role?: import("./types").UserRole,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
    }),
  });
}

/** GET /v1/me — 401 if token expired/invalid, 403 if account inactive */
export async function getMe(token: string): Promise<UserResponse> {
  return apiFetch<UserResponse>("/v1/me", {}, token);
}

/** PATCH /v1/me — update name and/or department_name */
export async function updateMe(
  token: string,
  data: import("./types").UpdateMeRequest,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/v1/me", { method: "PATCH", body: JSON.stringify(data) }, token);
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/** GET / — health / service info */
export async function getServiceInfo(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/");
}

/** GET /health — detailed health + graph counts */
export async function getHealth(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/health");
}

/** GET /v1/companies — returns list of demo companies (3 items) */
export async function getCompanies(token?: string): Promise<Company[]> {
  const data = await apiFetch<unknown>("/v1/companies", {}, token);

  // Handle new backend format: {companies: [...], total: N}
  if (data && typeof data === 'object' && 'companies' in data) {
    const companies = (data as { companies: unknown }).companies;
    if (Array.isArray(companies)) {
      return companies as Company[];
    }
  }

  // Fallback: handle old format (direct array)
  if (Array.isArray(data)) {
    return data as Company[];
  }

  console.warn("[API] /v1/companies unexpected format:", data);
  return [];
}

/** GET /v1/companies/{company_id} */
export async function getCompany(companyId: string): Promise<Company> {
  return apiFetch<Company>(`/v1/companies/${companyId}`);
}

/**
 * POST /v1/decisions — creates a decision, returns 202.
 *
 * Body contract (api_contract_v1.md):
 *   company_id   string  — backend company identifier (e.g. "nexus_dynamics")
 *   input_text   string  — the decision text
 *   use_o1_governance  bool (optional, default false)
 *   use_o1_graph       bool (optional, default false)
 */
export async function createDecision(
  params: { company_id: string; input_text: string; lang?: string; agent_name?: string; agent_name_en?: string; workspace_decision_id?: string },
  token?: string,
): Promise<CreateDecisionResponse> {
  const body = JSON.stringify({
    company_id: params.company_id,
    input_text: params.input_text,
    use_o1_governance: false,
    use_o1_graph: false,
    ...(params.lang ? { lang: params.lang } : {}),
    ...(params.agent_name ? { agent_name: params.agent_name } : {}),
    ...(params.agent_name_en ? { agent_name_en: params.agent_name_en } : {}),
    ...(params.workspace_decision_id ? { workspace_decision_id: params.workspace_decision_id } : {}),
  });
  const resp = await apiFetch<CreateDecisionResponse>("/v1/decisions", {
    method: "POST",
    body,
  }, token);

  if (!resp?.decision_id) {
    throw new Error("POST /v1/decisions returned no decision_id");
  }
  return resp;
}

/**
 * POST /v1/workspace/decisions — creates workspace record + pipeline + runs governance.
 * Returns { workspace_decision_id, analysis_decision_id, stream_url }
 * Use analysis_decision_id for SSE streaming and full result fetch.
 */
export interface CreateWorkspaceDecisionResponse {
  workspace_decision_id: string;
  analysis_decision_id: string;
  stream_url?: string;
}

export async function createWorkspaceDecision(
  params: { company_id: string; input_text: string; lang?: string; agent_name?: string; agent_name_en?: string; department?: string; department_en?: string },
  token?: string,
): Promise<CreateWorkspaceDecisionResponse> {
  const body = JSON.stringify({
    company_id: params.company_id,
    input_text: params.input_text,
    use_o1_governance: false,
    use_o1_graph: false,
    ...(params.lang ? { lang: params.lang } : {}),
    ...(params.agent_name ? { agent_name: params.agent_name } : {}),
    ...(params.agent_name_en ? { agent_name_en: params.agent_name_en } : {}),
    ...(params.department ? { department: params.department } : {}),
    ...(params.department_en ? { department_en: params.department_en } : {}),
  });
  const resp = await apiFetch<CreateWorkspaceDecisionResponse>("/v1/workspace/decisions", {
    method: "POST",
    body,
  }, token);

  if (!resp?.analysis_decision_id) {
    throw new Error("POST /v1/workspace/decisions returned no analysis_decision_id");
  }
  return resp;
}

/** GET /v1/decisions/{id} — full ConsolePayloadResponse */
export async function getDecision(
  decisionId: string,
  token?: string,
  lang?: string,
): Promise<DecisionResponse> {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const resp = await apiFetch<DecisionResponse>(
    `/v1/decisions/${decisionId}${qs}`,
    {},
    token,
  );
  if (!resp?.decision_id) {
    throw new Error("GET /v1/decisions/{id} returned no decision_id");
  }
  return resp;
}

// ---------------------------------------------------------------------------
// SSE streaming — primary transport, no polling fallback
// Contract: GET /v1/decisions/{id}/stream
// Wire format: event: <type>\ndata: <json>\n\n
// Named events: "step" (×5) then "complete". Errors via "error" event.
// ---------------------------------------------------------------------------

export interface SSEEvent {
  type: string;
  data: unknown;
}

export type SSEEventCallback = (event: SSEEvent) => void;

/**
 * Opens an SSE connection to GET /v1/decisions/{id}/stream.
 *
 * Returns the EventSource immediately — the caller is responsible for
 * calling `.close()` on unmount / completion.
 *
 * Named events ("step", "complete", "error") are forwarded to `onEvent`
 * with their event type preserved.
 *
 * On connection error `onError` is called and the EventSource is closed.
 */
export function streamDecision(
  decisionId: string,
  onEvent: SSEEventCallback,
  onError?: (err: Event) => void,
  token?: string,
  lang?: string,
): EventSource {
  const base = `${API_BASE_URL}/v1/decisions/${decisionId}/stream`;
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (lang) params.set('lang', lang);
  const qs = params.toString();
  const url = qs ? `${base}?${qs}` : base;
  const es = new EventSource(url);

  const handleMessage = (type: string) => (evt: MessageEvent) => {
    try {
      const parsed: unknown = JSON.parse(evt.data);
      onEvent({ type, data: parsed });
    } catch {
      onEvent({ type, data: evt.data });
    }
  };

  es.onmessage = handleMessage("message");

  // Backend emits named events: step, complete, error
  for (const eventName of ["step", "complete", "error"]) {
    es.addEventListener(eventName, handleMessage(eventName) as EventListener);
  }

  es.onerror = (err) => {
    es.close();
    onError?.(err);
  };

  return es;
}

/** GET /v1/workspace/metrics — summary counts for today */
export async function getWorkspaceMetrics(token: string): Promise<WorkspaceMetrics> {
  return apiFetch<WorkspaceMetrics>("/v1/workspace/metrics", {}, token);
}

/** GET /v1/workspace/decisions — paginated decision feed */
export async function getWorkspaceDecisions(
  token: string,
  params?: {
    status?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  },
): Promise<WorkspaceDecisionsResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  if (params?.sort) query.set("sort", params.sort);
  const qs = query.toString();
  return apiFetch<WorkspaceDecisionsResponse>(
    `/v1/workspace/decisions${qs ? `?${qs}` : ""}`,
    {},
    token,
  );
}

/** GET /v1/workspace/agents — returns agents for the authenticated user's company */
export async function getWorkspaceAgents(
  token: string,
  params?: { status?: string },
): Promise<AgentsResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiFetch<AgentsResponse>(
    `/v1/workspace/agents${qs ? `?${qs}` : ""}`,
    {},
    token,
  );
}

/** PUT /v1/workspace/agents/:id — update agent boundary config */
export async function updateWorkspaceAgent(
  token: string,
  agentId: string,
  body: { autonomy: string; risk_threshold: number; financial_limit: number },
): Promise<AgentItem> {
  return apiFetch<AgentItem>(
    `/v1/workspace/agents/${encodeURIComponent(agentId)}`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    token,
  );
}

/** GET /v1/fixtures?company_id={companyId} — returns demo fixtures for a company */
export async function getFixtures(companyId: string): Promise<DemoFixture[]> {
  const data = await apiFetch<unknown>(
    `/v1/fixtures?company_id=${encodeURIComponent(companyId)}`,
  );
  if (!Array.isArray(data)) {
    console.warn("[API] /v1/fixtures did not return an array:", data);
    return [];
  }
  return data as DemoFixture[];
}

// ---------------------------------------------------------------------------
// Reasoning Timeline
// ---------------------------------------------------------------------------

/** GET /v1/decisions/{id}/reasoning-trace */
export async function getReasoningTrace(
  decisionId: string,
  token?: string,
): Promise<ReasoningTraceResponse> {
  return apiFetch<ReasoningTraceResponse>(
    `/v1/decisions/${decisionId}/reasoning-trace`,
    {},
    token,
  );
}

// ---------------------------------------------------------------------------
// Simulation Lab
// ---------------------------------------------------------------------------

/** POST /v1/decisions/{id}/simulate */
export async function runSimulation(
  decisionId: string,
  token?: string,
): Promise<SimulationResponse> {
  return apiFetch<SimulationResponse>(
    `/v1/decisions/${decisionId}/simulate`,
    { method: "POST", body: JSON.stringify({}) },
    token,
  );
}

/** GET /v1/decisions/{id}/risk-history */
export async function getRiskHistory(
  decisionId: string,
  months?: number,
  token?: string,
): Promise<RiskHistoryResponse> {
  const qs = months ? `?months=${months}` : "";
  return apiFetch<RiskHistoryResponse>(
    `/v1/decisions/${decisionId}/risk-history${qs}`,
    {},
    token,
  );
}

// ---------------------------------------------------------------------------
// Evidence Explorer
// ---------------------------------------------------------------------------

/** GET /v1/decisions/{id}/evidence */
export async function getEvidence(
  decisionId: string,
  params?: { type?: string; status?: string; relevance?: string; q?: string },
  token?: string,
): Promise<EvidenceResponse> {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.status) query.set("status", params.status);
  if (params?.relevance) query.set("relevance", params.relevance);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return apiFetch<EvidenceResponse>(
    `/v1/decisions/${decisionId}/evidence${qs ? `?${qs}` : ""}`,
    {},
    token,
  );
}

// ---------------------------------------------------------------------------
// Agent Boundaries
// ---------------------------------------------------------------------------

/** GET /v1/agents */
export async function getAgents(
  params?: { status?: string; department?: string },
  token?: string,
): Promise<AgentsResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.department) query.set("department", params.department);
  const qs = query.toString();
  return apiFetch<AgentsResponse>(
    `/v1/agents${qs ? `?${qs}` : ""}`,
    {},
    token,
  );
}

/** GET /v1/agents/{id} */
export async function getAgent(
  agentId: string,
  token?: string,
): Promise<AgentItem> {
  return apiFetch<AgentItem>(`/v1/agents/${agentId}`, {}, token);
}

/** POST /v1/agents */
export async function createAgent(
  data: Omit<AgentItem, "id">,
  token?: string,
): Promise<AgentItem> {
  return apiFetch<AgentItem>(
    "/v1/agents",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
}

/** PATCH /v1/agents/{id} */
export async function updateAgent(
  agentId: string,
  data: Partial<AgentItem>,
  token?: string,
): Promise<AgentItem> {
  return apiFetch<AgentItem>(
    `/v1/agents/${agentId}`,
    { method: "PATCH", body: JSON.stringify(data) },
    token,
  );
}

/** GET /v1/escalation-rules */
export async function getEscalationRules(
  token?: string,
): Promise<EscalationRulesResponse> {
  return apiFetch<EscalationRulesResponse>("/v1/escalation-rules", {}, token);
}

/** GET /v1/decisions/{id}/pdf — downloads the decision pack as PDF */
export async function downloadDecisionPDF(decisionId: string): Promise<Blob> {
  const url = `${API_BASE_URL}/v1/decisions/${decisionId}/pdf`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `PDF download failed: ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }

  return res.blob();
}
