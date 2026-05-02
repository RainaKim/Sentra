import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { LoginPage } from "./components/LoginPage";
import { AuthCallback } from "./components/AuthCallback";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { GovernanceConsole } from "./components/GovernanceConsole";
import { DecisionPackPage } from "./components/DecisionPackPage";
import { ProfileSettings } from "./components/ProfileSettings";
import { WorkspaceDashboard } from "./components/WorkspaceDashboard";
import { ReasoningTimeline } from "./components/ReasoningTimeline";
import { SimulationLab } from "./components/SimulationLab";
import { EvidenceExplorer } from "./components/EvidenceExplorer";
import { AgentBoundaries } from "./components/AgentBoundaries";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { Onboarding } from "./components/Onboarding";

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    // Dedicated OAuth callback — handles ?token= param, never the marketing page
    path: "/auth/callback",
    Component: AuthCallback,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicy,
  },
  {
    path: "/terms",
    Component: TermsOfService,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },

  // ── Protected routes — require authentication ───────────────────────────────
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/workspace",
        Component: WorkspaceDashboard,
      },
      {
        path: "/console",
        Component: GovernanceConsole,
      },
      {
        path: "/decision-pack",
        Component: DecisionPackPage,
      },
      {
        path: "/profile",
        Component: ProfileSettings,
      },
      {
        path: "/reasoning-timeline",
        Component: ReasoningTimeline,
      },
      {
        path: "/simulation-lab",
        Component: SimulationLab,
      },
      {
        path: "/evidence-explorer",
        Component: EvidenceExplorer,
      },
      {
        path: "/agent-boundaries",
        Component: AgentBoundaries,
      },
    ],
  },
]);
