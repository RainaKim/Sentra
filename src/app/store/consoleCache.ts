import type { DecisionResponse, Company, WorkspaceDecision } from '../../api/types';

export interface ConsoleCacheEntry {
  cacheKey: string;
  flowState: {
    companyId?: string;
    decisionText?: string;
    decisionTextEn?: string;
    agentName?: string;
    agentNameEn?: string;
    department?: string;
    departmentEn?: string;
    workspaceDecisionId?: string;
  };
  result: DecisionResponse | null;
  traceLog: { text: string; color: string }[];
  prefetchedCompany: Company | null;
  analysisStep: number;
}

/** Module-level cache shared between GovernanceConsole and analysis tool screens. */
export let consoleCache: ConsoleCacheEntry | null = null;

export function setConsoleCache(entry: ConsoleCacheEntry | null): void {
  consoleCache = entry;
}

// ---------------------------------------------------------------------------
// In-flight analysis tracking — survives component unmounts
// ---------------------------------------------------------------------------
export type AnalysisListener = (cache: ConsoleCacheEntry) => void;

/** Active cancel function for an in-flight SSE stream (if any). */
let inflightCancel: (() => void) | null = null;
/** The cache key for the currently in-flight analysis. */
let inflightKey: string | null = null;
/** Listeners that get called on every cache update (component re-mounts subscribe here). */
const listeners = new Set<AnalysisListener>();

export function getInflightKey(): string | null {
  return inflightKey;
}

export function setInflight(key: string, cancel: () => void): void {
  // If there's a previous in-flight for a different key, cancel it
  if (inflightCancel && inflightKey !== key) {
    inflightCancel();
  }
  inflightKey = key;
  inflightCancel = cancel;
}

export function clearInflight(): void {
  inflightKey = null;
  inflightCancel = null;
}

/** Update the cache AND notify any mounted listeners. */
export function updateCacheAndNotify(entry: ConsoleCacheEntry): void {
  consoleCache = entry;
  listeners.forEach((fn) => fn(entry));
}

export function subscribeCache(fn: AnalysisListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Workspace decisions cache — populated by WorkspaceDashboard, read by AgentBoundaries */
export let workspaceDecisionsCache: WorkspaceDecision[] = [];

export function setWorkspaceDecisionsCache(items: WorkspaceDecision[]): void {
  workspaceDecisionsCache = items;
}

export function consoleCacheKey(
  fs: { companyId?: string; decisionText?: string; workspaceDecisionId?: string } | null
): string | null {
  if (!fs?.companyId || !fs?.decisionText) return null;
  return fs.workspaceDecisionId ?? `${fs.companyId}:${fs.decisionText}`;
}
