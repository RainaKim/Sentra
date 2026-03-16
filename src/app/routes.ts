import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { GovernanceConsole } from "./components/GovernanceConsole";
import { DecisionPackPage } from "./components/DecisionPackPage";
import { ProfileSettings } from "./components/ProfileSettings";
import { WorkspaceDashboard } from "./components/WorkspaceDashboard";
import { ReasoningTimeline } from "./components/ReasoningTimeline";
import { SimulationLab } from "./components/SimulationLab";
import { EvidenceExplorer } from "./components/EvidenceExplorer";
import { AgentBoundaries } from "./components/AgentBoundaries";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
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
    path: "/workspace",
    Component: WorkspaceDashboard,
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
]);