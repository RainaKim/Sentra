import { useEffect } from "react";
import { useNavigate } from "react-router";
import Navigation from "./Navigation";
import { Hero } from "./Hero";
import { ProblemSection } from "./landing/ProblemSection";
import { GovernancePipeline } from "./landing/GovernancePipeline";
import { ConsoleDeepDive } from "./landing/ConsoleDeepDive";
import { OntologySection } from "./landing/OntologySection";
import { DifferentiatorsSection } from "./landing/DifferentiatorsSection";
import { ScoutSwarmSection } from "./landing/ScoutSwarmSection";
import { HybridRAGSection } from "./landing/HybridRAGSection";
import { ProductModules } from "./landing/ProductModules";
import { CTABanner } from "./CTABanner";
import { Footer } from "./Footer";
import { TrustStrip } from "./landing/TrustStrip";
import { MidPageCTA } from "./landing/MidPageCTA";
import { ComplianceBadgeStrip } from "./landing/ComplianceBadgeStrip";
import { IntegrationStrip } from "./landing/IntegrationStrip";

export function Landing() {
  const navigate = useNavigate();

  // Backend sends token to /?token=... — forward to the dedicated callback handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      navigate(`/auth/callback?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <TrustStrip />
        <ComplianceBadgeStrip />
        <section id="problem-pipeline">
          <ProblemSection />
          <GovernancePipeline />
          <IntegrationStrip />
          <ConsoleDeepDive />
        </section>
        <section id="why-us">
          <OntologySection />
          <HybridRAGSection />
          <ScoutSwarmSection />
          <DifferentiatorsSection />
        </section>
        <MidPageCTA />
        <section id="product-modules">
          <ProductModules />
        </section>
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
