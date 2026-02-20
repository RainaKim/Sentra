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
  Company,
  CreateDecisionResponse,
  DecisionResponse,
  DemoFixture,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
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
export async function getCompanies(): Promise<Company[]> {
  const data = await apiFetch<unknown>("/v1/companies");
  if (!Array.isArray(data)) {
    console.warn("[API] /v1/companies did not return an array:", data);
    return [];
  }
  return data as Company[];
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
export async function createDecision(params: {
  company_id: string;
  input_text: string;
}): Promise<CreateDecisionResponse> {
  const body = JSON.stringify({
    company_id: params.company_id,
    input_text: params.input_text,
    use_o1_governance: false,
    use_o1_graph: false,
  });
  const resp = await apiFetch<CreateDecisionResponse>("/v1/decisions", {
    method: "POST",
    body,
  });

  if (!resp?.decision_id) {
    throw new Error("POST /v1/decisions returned no decision_id");
  }
  return resp;
}

/** GET /v1/decisions/{id} — full ConsolePayloadResponse */
export async function getDecision(
  decisionId: string,
): Promise<DecisionResponse> {
  const resp = await apiFetch<DecisionResponse>(
    `/v1/decisions/${decisionId}`,
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
): EventSource {
  const url = `${API_BASE_URL}/v1/decisions/${decisionId}/stream`;
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
