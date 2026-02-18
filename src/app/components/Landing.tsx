import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { TrustIndicators } from './TrustIndicators';
import { ValueSection } from './ValueSection';
import { ProductDeepDive } from './ProductDeepDive';
import { HowItWorks } from './HowItWorks';
import { CTABanner } from './CTABanner';
import { Footer } from './Footer';

export function Landing() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'SUIT Variable, Inter, sans-serif' }}>
      <Navigation />
      <main>
        <Hero />
        <TrustIndicators />
        <ValueSection />
        <ProductDeepDive />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}