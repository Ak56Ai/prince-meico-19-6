import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import PricingPlans from './components/PricingPlans';
import Features from './components/Features';
import StatsCounter from './components/StatsCounter';
import AboutSection from './components/AboutSection';
import DetailedPricing from './components/DetailedPricing';
import Newsletter from './components/Newsletter';
import ActiveIco from './pages/ActiveIco';
import Services from './pages/Services';
import Contact from './pages/Contact';
import GetMeCoin from './pages/GetMeCoin';
import OtherInfo from './pages/OtherInfo';
import Tokenomics from './pages/Tokenomics';
import Ecosystem from './pages/Ecosystem';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import Sitemap from './pages/Sitemap';
import Career from './pages/Career';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ParticleBackground from './components/ParticleBackground';
import NetworkIcoPage from './pages/NetworkIcoPage';

const Home = () => (
  <>
    <HeroSection />
    <PricingPlans />
    <Features />
    <StatsCounter />
    <AboutSection />
    <DetailedPricing />
    <Newsletter />
  </>
);

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-hidden">
          <ParticleBackground />
          <div className="relative z-10">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/active-ico" element={<ActiveIco />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/get-mecoin" element={<GetMeCoin />} />
                <Route path="/other-info" element={<OtherInfo />} />
                <Route path="/tokenomics" element={<Tokenomics />} />
                <Route path="/ecosystem" element={<Ecosystem />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/career" element={<Career />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/networks/:network" element={<NetworkIcoPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;