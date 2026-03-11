// ---------------------------------------------------------------------------
// Decision Runner — src/api/decisionRunner.ts
//
// Orchestrates the full decision analysis flow:
//   1. POST /decisions  → get decision_id
//   2. Open SSE stream  → /decisions/{id}/stream (primary transport)
//   3. On complete event → GET /decisions/{id} for full payload
//
// Polling has been intentionally removed. SSE is the only transport.
// ---------------------------------------------------------------------------

import { createDecision, getDecision, streamDecision } from "./client";
import type { DecisionResponse } from "./types";

// ---------------------------------------------------------------------------
// Progress types
// ---------------------------------------------------------------------------

export type ProgressStage =
  | "extracting"
  | "evaluating_governance"
  | "building_graph"
  | "reasoning"
  | "building_decision_pack"
  | "complete"
  | "failed";

export interface ProgressUpdate {
  /** 1 = Extraction, 2 = Policy Engine, 3 = Reasoning, 4 = Complete */
  stepIndex: number;
  stage: ProgressStage;
  percent?: number;
  message?: string;
}

export interface RunDecisionCallbacks {
  onProgress: (update: ProgressUpdate) => void;
  onComplete: (result: DecisionResponse) => void;
  onError: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapStepToProgress(
  step: string | undefined,
  percent: number | undefined,
): { stepIndex: number; stage: ProgressStage } {
  if (!step) {
    const idx =
      percent != null
        ? Math.max(1, Math.min(3, Math.ceil((percent / 100) * 3)))
        : 1;
    return { stepIndex: idx, stage: "extracting" };
  }

  const s = step.toLowerCase();
  if (s.includes("extract"))
    return { stepIndex: 1, stage: "extracting" };
  if (
    s.includes("governance") ||
    s.includes("policy") ||
    s.includes("evaluat")
  )
    return { stepIndex: 2, stage: "evaluating_governance" };
  if (s.includes("graph"))
    return { stepIndex: 2, stage: "building_graph" };
  if (s.includes("reason"))
    return { stepIndex: 3, stage: "reasoning" };
  if (s.includes("pack") || s.includes("build"))
    return { stepIndex: 4, stage: "building_decision_pack" };

  return { stepIndex: 1, stage: "extracting" };
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/**
 * Runs the full decision governance flow and reports progress via callbacks.
 *
 * @param params    { companyId, decisionText }
 * @param callbacks { onProgress, onComplete, onError }
 * @returns         A cleanup function — call it to abort the SSE stream early.
 */
export function runDecisionFlow(
  params: { companyId: string; decisionText: string; token?: string; lang?: string; agentName?: string; agentNameEn?: string; department?: string; departmentEn?: string; workspaceDecisionId?: string },
  callbacks: RunDecisionCallbacks,
): () => void {
  const { onProgress, onComplete, onError } = callbacks;
  let es: EventSource | null = null;
  let cancelled = false;

  const cleanup = () => {
    cancelled = true;
    es?.close();
  };

  (async () => {
    try {
      // Step 1 — POST /decisions
      onProgress({
        stage: "extracting",
        stepIndex: 1,
        message: "분석 시작 중...",
      });

      const created = await createDecision({
        company_id: params.companyId,
        input_text: params.decisionText,
        lang: params.lang,
        agent_name: params.agentName,
        agent_name_en: params.agentNameEn,
        workspace_decision_id: params.workspaceDecisionId,
      }, params.token);

      if (cancelled) return;
      const decisionId = created.decision_id;
      onProgress({ stage: "extracting", stepIndex: 1 });

      // Step 2 — Open SSE and wait for terminal event
      await new Promise<void>((resolve, reject) => {
        es = streamDecision(
          decisionId,
          (evt) => {
            if (cancelled) return;

            const data = evt.data as Record<string, unknown>;
            const eventType = evt.type;

            // Raw SSE event log — helps diagnose whether step events arrive
            console.log(`[SSE] type="${eventType}"`, data);

            // Terminal: complete — only fire on the named "complete" event.
            // Do NOT check data.status here: step events can carry
            // status:"processing" (or similar) and must not short-circuit.
            if (eventType === "complete") {
              resolve();
              return;
            }
            // Fallback: unnamed message event that explicitly signals complete
            if (
              eventType === "message" &&
              (data?.status === "complete" || data?.event === "complete")
            ) {
              resolve();
              return;
            }

            // Terminal: error / failed
            if (
              eventType === "error" ||
              data?.status === "failed" ||
              data?.event === "failed"
            ) {
              reject(
                new Error(
                  (data?.message as string) ??
                    "Backend reported decision processing as failed",
                ),
              );
              return;
            }

            // Progress event — backend step event shape:
            // { step: 1-5, label: "extracting", message: "..." }
            // Prefer `label` (string stage name); fall back to stepNum mapping.
            const label = (data?.label ?? data?.current_step) as
              | string
              | undefined;
            const stepNum = data?.step as number | undefined;
            const percent = data?.percent_complete as number | undefined;
            // If no string label, derive one from the numeric step index
            const STEP_LABELS: ProgressStage[] = [
              "extracting",
              "evaluating_governance",
              "building_graph",
              "reasoning",
              "building_decision_pack",
            ];
            const derivedLabel =
              label ??
              (stepNum != null && stepNum >= 1 && stepNum <= 5
                ? STEP_LABELS[stepNum - 1]
                : undefined);
            const { stepIndex, stage } = mapStepToProgress(
              derivedLabel,
              percent,
            );
            onProgress({ stage, stepIndex, percent, message: data?.message as string | undefined });
          },
          (err) => {
            if (!cancelled) {
              reject(
                new Error(
                  `SSE connection error: ${(err as ErrorEvent).message ?? "unknown"}`,
                ),
              );
            }
          },
          params.token,
          params.lang,
        );
      });

      if (cancelled) return;

      // Step 3 — Fetch full result
      onProgress({ stage: "building_decision_pack", stepIndex: 4 });
      const result = await getDecision(decisionId, params.token, params.lang);

      if (cancelled) return;

      onProgress({ stage: "complete", stepIndex: 4 });
      onComplete(result);
    } catch (err) {
      if (!cancelled) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      es?.close();
    }
  })();

  return cleanup;
}
