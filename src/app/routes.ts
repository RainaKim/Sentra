import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { GovernanceConsole } from "./components/GovernanceConsole";
import { DecisionPackPage } from "./components/DecisionPackPage";

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
]);