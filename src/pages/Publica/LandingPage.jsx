import React from 'react';

import CookieConsent from '../../components/cookieConsent';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TestimonialsSection from './components/TestimonialsSection';
import FeaturesSection from './components/FeaturesSection';
import PreventionSection from './components/PreventionSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import FooterSection from './components/FooterSection';
import Reveal from './components/common/Reveal';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">

            {/* BLUEPRINT BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-[1500px]">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                    }}
                />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] bg-sky-500/10 blur-[160px] rounded-full" />
            </div>

            <Navbar />

            <HeroSection />

            {/* TESTIMONIALS SECTION */}
            <Reveal delay={0.2}>
                <TestimonialsSection />
            </Reveal>

            <FeaturesSection />

            <PreventionSection />

            {/* PRICING SECTION */}
            <Reveal>
                <PricingSection />
            </Reveal>

            {/* FAQ SECTION */}
            <Reveal>
                <FAQSection />
            </Reveal>

            <CTASection />

            <FooterSection />

            <CookieConsent />
        </div>
    );
}
