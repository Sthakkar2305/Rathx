import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import FloatingNav from './components/FloatingNav';
import CinematicHero from './components/CinematicHero';
import SiteContent from './components/SiteContent';
import './App.css';

export default function App() {
  const [isNavReady, setIsNavReady] = useState(false);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      setIsNavReady(true);
    }, 1600);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        {/* Floating Navigation Header */}
        <FloatingNav revealed={isNavReady} />

        {/* Subtle organic film texture (minimal opacity to ensure vibrant video clarity) */}
        <div className="grain-overlay" aria-hidden="true" style={{ opacity: 0.015 }} />

        {/* 3D Scroll-Driven Cinematic Hero Experience */}
        <CinematicHero onReady={() => setIsNavReady(true)} />

        {/* Website Content (Architecture, Capabilities, Specs, Deployments & CTA) */}
        <SiteContent />
      </div>
    </MotionConfig>
  );
}
