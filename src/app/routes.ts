import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { GovernanceConsole } from "./components/GovernanceConsole";
import { DecisionPackPage } from "./components/DecisionPackPage";
import { ProfileSettings } from "./components/ProfileSettings";
import { WorkspaceDashboard } from "./components/WorkspaceDashboard";

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
]);