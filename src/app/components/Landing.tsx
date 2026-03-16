import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "./Navigation";
import { Hero } from "./Hero";
import { ProblemSection } from "./landing/ProblemSection";
import { GovernancePipeline } from "./landing/GovernancePipeline";
import { ConsoleDeepDive } from "./landing/ConsoleDeepDive";
import { OntologySection } from "./landing/OntologySection";
import { DifferentiatorsSection } from "./landing/DifferentiatorsSection";
import { ProductModules } from "./landing/ProductModules";
import { WorkflowSection } from "./landing/WorkflowSection";
import { IndustriesSection } from "./landing/IndustriesSection";
import { CTABanner } from "./CTABanner";
import { Footer } from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import { getMe } from "../../api/client";

export function Landing() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    getMe(token)
      .then((user) => {
        setAuth(user, token);
        if (!user.name || !user.company_id) {
          navigate("/profile?edit=true");
        }
      })
      .catch((err) =>
        console.error("[Landing] Failed to verify token:", err)
      );
  }, []);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "SUIT Variable, Inter, sans-serif" }}
    >
      <Navigation />
      <main>
        <Hero />
        <ProblemSection />
        <GovernancePipeline />
        <ConsoleDeepDive />
        <OntologySection />
        <DifferentiatorsSection />
        <ProductModules />
        <WorkflowSection />
        <IndustriesSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
