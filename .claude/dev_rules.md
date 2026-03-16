# DecisionGovernance AI – Engineering Playbook

Internal coding standards and reasoning workflow for all code generated in this project.
These rules are non-negotiable. Every code change must satisfy every applicable section below.

---

## 1. Architecture Reasoning

Before writing a single line of code, Claude must perform a three-step analysis:

1. **Schema audit** – Browse the live backend source at `/Users/RainaKim/Desktop/decision-governance-layer`. Read the relevant models, schemas, and API route definitions directly from that directory. Do not create or maintain a copy of the schema in this repo. Identify every field, its type, whether it is nullable, and whether it is optional in API responses.
2. **API contract review** – Identify the exact endpoint(s) the feature will consume by reading the route files in the backend directory. Note the response shape, error envelope, pagination strategy, and any field-level guarantees or caveats.
3. **Abstraction inventory** – Search existing code for hooks, utilities, and components that already solve part of the problem. Reuse first; build only what is missing.

Only after completing all three steps should implementation begin.

> **Rule:** Never design UI state before the backend contract is understood. Never invent a new hook before checking whether one already exists.

### Backend source of truth

The canonical schema and API contract live exclusively in the backend repository:

```
/Users/RainaKim/Desktop/decision-governance-layer
```

- **Always read schema from this path.** Do not duplicate, copy, or mirror schema definitions into the frontend repo.
- When the backend schema changes, re-read from this path — do not rely on previously cached or summarized information.
- If a field cannot be found in this directory, it does not exist. Do not invent it.

---

## 2. Type-First Development

All TypeScript types must be defined and finalized **before** writing any UI logic, hooks, or utility functions.

### Workflow

```
1. Define domain types  →  2. Define API response types  →  3. Define component prop types  →  4. Implement logic
```

### Standards

- Mirror backend field names exactly. Do not rename or alias fields at the type boundary unless a documented transform layer exists.
- Mark every field that the backend may omit as optional (`field?: T`) or nullable (`field: T | null`). Never assume presence.
- Use `unknown` for unvalidated external data; narrow it with a type guard before use.
- Prefer explicit union types over loose `string` or `number` where a field has a known set of values (e.g., `status: 'active' | 'inactive' | 'pending'`).
- Do not use `any`. If a type is genuinely unknown, use `unknown` and document why.
- Co-locate types with the module that owns them. Shared types live in a dedicated `types/` directory.

```ts
// Good
interface RiskSignal {
  id: string;
  score: number;           // 0–100, always present
  label: string;
  evidence: Evidence[];    // may be empty, never null
  resolvedAt: string | null;
}

// Bad – fields invented, nullability ignored
interface RiskSignal {
  id: any;
  score: any;
  notes: string; // field does not exist in backend schema
}
```

---

## 3. Backend API Contract Integration

### Non-negotiable constraints

- **Never invent fields.** If a field is not in the backend schema or API response, it does not exist in the frontend type.
- **Never hard-code data** that is supposed to come from the API.
- **Never silently transform field names** at the fetch layer without a documented, typed mapper function.
- **Validate response shape** at the API boundary. If the response deviates from the expected type, surface the error explicitly rather than continuing with corrupt state.

### Integration checklist before connecting a new endpoint

- [ ] Confirm the HTTP method, path, auth requirements, and rate-limit behavior.
- [ ] Document every field in the response that the UI will consume.
- [ ] Identify fields that are conditionally present (e.g., only returned when a feature flag is enabled).
- [ ] Confirm error envelope shape (e.g., `{ error: { code, message } }`).
- [ ] Define TypeScript types before writing the fetch call.

### Data fetching conventions

- All API calls go through a shared fetch/client abstraction — never raw `fetch` scattered across components.
- Return typed `Result<T, ApiError>` or use React Query with explicit `select` transforms — never mutate raw API data in-place.
- Pagination, loading, and error states must all be handled; partial handling is a bug.

---

## 4. Defensive UI Programming

The UI must never crash when optional or nullable data is absent. Defensive handling is not optional — it is the default.

### Null and undefined safety

```ts
// Good
const score = signal?.score ?? 0;
const label = signal?.label ?? 'Unknown';
const items = response?.items ?? [];

// Bad – will throw if signal is undefined
const score = signal.score;
```

### Array safety

- Always default arrays to `[]` before calling `.map()`, `.filter()`, or `.reduce()`.
- Never assume an array returned from the API is non-empty. Guard for the empty state explicitly.

### Rendering safety

- Guard every conditional render with a defined fallback UI (skeleton, empty state, or error state).
- Do not render a component that depends on data until that data is confirmed loaded and non-null.
- Never render raw `undefined` or `null` into JSX — this produces silent blank areas.

```tsx
// Good
{signal ? <SignalCard signal={signal} /> : <EmptySignalState />}

// Bad – renders nothing silently when signal is undefined
{signal && <SignalCard signal={signal} />}
```

### Error boundary coverage

- Wrap every major page section and data-dependent widget in an error boundary.
- Error boundaries must render a meaningful fallback, not a blank screen.

---

## 5. React Component Design Rules

### Composability over monoliths

- A component that exceeds ~150 lines of JSX is a signal to decompose.
- Split by responsibility: data-fetching, layout, and presentation are separate concerns.
- Container components own data and pass it down; presentational components are pure renderers.

### Prop design

- Prop interfaces must be defined above the component, not inline.
- Avoid prop drilling beyond two levels — lift to context or co-locate state with the consuming component.
- Boolean props should be positive by default (`isDisabled`, not `isEnabled={false}`).
- Event handler props are prefixed `on` (`onSelect`, `onDismiss`).

### Component file structure

```
ComponentName/
  index.tsx          – public export
  ComponentName.tsx  – implementation
  ComponentName.types.ts  – prop and domain types
  ComponentName.test.tsx  – unit tests (if applicable)
```

### Hooks

- Custom hooks encapsulate a single concern. A hook that manages fetch + transform + local UI state is doing too much — split it.
- Hooks that call the API own their own loading and error state.
- Never call hooks conditionally.

### Memoization

- Do not add `useMemo` or `useCallback` speculatively. Add them only when a measurable performance problem exists and profiling confirms the cause.
- Wrap components in `React.memo` only when the component renders frequently with unchanged props and profiling confirms the overhead.

---

## 6. Evidence Rendering Patterns

Signals, scores, and evidence references are first-class rendering primitives in this application.

### Core principle

Every signal, score, or piece of evidence must be renderable **independently** of the entity it belongs to. These are not display-only decorators — they carry semantic meaning and must be structured accordingly.

### Evidence reference integrity

- An evidence reference must always include its source identifier (e.g., `sourceId`, `documentId`).
- If the referenced source is unavailable, render a degraded but informative state — never silently omit the reference.
- Evidence items are never rendered as raw strings; they use a dedicated `EvidenceItem` component.

### Score rendering

- Scores are always rendered with their range context (e.g., "72 / 100", not just "72").
- A missing score (`null | undefined`) renders as a defined placeholder (e.g., "—" or "N/A"), never as 0.
- Score deltas (change over time) must indicate direction visually (up/down arrow or color), not numerically alone.

### Signal composition

- A signal card must function with partial data — if `evidence` is empty, render an empty evidence section; do not hide the card.
- Signal severity levels must be driven by backend-defined enumerations, not frontend-invented thresholds.

```tsx
// Good – evidence renders independently, degrades gracefully
<EvidenceList items={signal.evidence ?? []} sourceMap={sourceMap} />

// Bad – collapses silently when evidence is empty
{signal.evidence.length > 0 && <EvidenceList items={signal.evidence} />}
```

---

## 7. Error Handling

### API errors

- Every API call must handle three states: loading, success, and error — no exceptions.
- API error messages from the backend are displayed verbatim (after sanitization) only when they are user-safe. Map internal error codes to user-facing copy at a dedicated error-message layer.
- Network failures and timeout errors render a retry affordance when the action is idempotent.

### Unhandled edge cases

- Explicit `throw` statements in utility functions must include a message that identifies the function and the invalid input.
- All `catch` blocks must either re-throw (if the error cannot be handled at that scope), log (with context), or surface to the user. Silent swallowing of errors is forbidden.

### Form and mutation errors

- Mutation errors are surfaced inline, adjacent to the triggering action — not only in a global toast.
- Validation errors are shown per-field, not as a single generic message.

---

## 8. Performance Awareness

Performance is a correctness concern, not a polish concern. These rules apply from the start.

### Data fetching

- Fetch only the data the current view needs. Do not over-fetch to avoid a second request later.
- Paginated lists must use cursor- or page-based pagination — never fetch all records to display a subset.
- Cache API responses where stale-while-revalidate semantics are acceptable; do not re-fetch on every render.

### Rendering

- Lists of more than ~50 dynamic items must be virtualized.
- Images must specify explicit `width` and `height` or use `aspect-ratio` CSS to prevent layout shift.
- Heavy computation (sorting, filtering, aggregation) belongs in a `useMemo` with a minimal dependency array — but only after profiling confirms the need.

### Bundle

- Do not import an entire utility library to use one function. Import the specific function.
- Large components or route sections that are not needed on initial load must be lazy-loaded with `React.lazy`.

---

## 9. Code Review Checklist

Before any code is considered complete, Claude must internally verify every item below. A failing check must be resolved before the response is finalized.

### Duplication
- [ ] Is this logic already implemented in an existing hook, utility, or component?
- [ ] Is this type already defined elsewhere?

### Null safety
- [ ] Every optional field is accessed with optional chaining (`?.`) or a null check.
- [ ] Every array is defaulted to `[]` before iteration.
- [ ] No component renders `undefined` or `null` into JSX without a fallback.

### Type correctness
- [ ] No `any` types introduced.
- [ ] All new types mirror the backend schema exactly.
- [ ] All component prop types are explicitly defined.
- [ ] No type assertions (`as SomeType`) without a comment explaining why inference is insufficient.

### API contract fidelity
- [ ] No invented fields consumed from API responses.
- [ ] All three API states (loading, success, error) are handled.
- [ ] Error envelopes are parsed — raw response objects are not passed to the UI.

### Render correctness
- [ ] No unnecessary re-renders introduced (verify dependency arrays in `useEffect`, `useMemo`, `useCallback`).
- [ ] Conditional renders use explicit fallbacks, not silent `&&` short-circuits.
- [ ] No data-dependent component renders before its data is confirmed non-null.

### Component design
- [ ] No component exceeds ~150 lines of JSX without a documented reason.
- [ ] Prop drilling does not exceed two levels.
- [ ] Hooks are not called conditionally.

### Evidence and signals
- [ ] Score values render with range context and a null placeholder.
- [ ] Evidence items use the `EvidenceItem` component, not raw string rendering.
- [ ] Signal cards degrade gracefully with partial or empty data.

---

*This playbook is a living document. Update it when new patterns are established or existing rules prove insufficient. All rules apply project-wide unless a specific module has a documented, approved exception recorded in that module's README.*
