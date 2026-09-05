import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './HeroIntro.css';

/* ---- Video sources ---- */
const VIDEO_DESKTOP = '/videos/16_9%20intro.mp4';
const VIDEO_MOBILE  = '/videos/9_16%20intro.mp4';

/* ---- Framer Motion easing (cinematic ease-out) ---- */
const EASE_CINEMATIC = [0.16, 1, 0.3, 1];

/* ---- Animation variants ---- */
const fadeUpVariant = (delay = 0, yOffset = 30) => ({
  hidden: {
    opacity: 0,
    y: yOffset,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASE_CINEMATIC,
      delay,
    },
  },
});

const taglineVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: EASE_CINEMATIC,
      delay: 0.4,
    },
  },
};

const scrollVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: EASE_CINEMATIC,
      delay: 1.2,
    },
  },
};

/**
 * Determines the correct video source based on viewport orientation.
 * Uses matchMedia for responsive switching between landscape and portrait videos.
 */
function useResponsiveVideo() {
  const getSource = () => {
    if (typeof window === 'undefined') return VIDEO_DESKTOP;
    return window.matchMedia('(orientation: portrait)').matches
      ? VIDEO_MOBILE
      : VIDEO_DESKTOP;
  };

  const [src, setSrc] = useState(getSource);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    const handler = (e) => setSrc(e.matches ? VIDEO_MOBILE : VIDEO_DESKTOP);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return src;
}

export default function HeroIntro() {
  const videoRef = useRef(null);
  const videoSrc = useResponsiveVideo();

  /* Ensure video plays on mount (some browsers block autoplay) */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* Autoplay blocked — video stays on first frame */
      });
    }
  }, [videoSrc]);

  return (
    <section className="hero" id="hero-intro">
      {/* ---- Video Background ---- */}
      <div className="hero__video-wrap">
        <video
          ref={videoRef}
          key={videoSrc}
          className="hero__video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      {/* ---- Cinematic Overlays ---- */}
      <div className="hero__overlay hero__overlay--gradient" />
      <div className="hero__overlay hero__overlay--vignette" />
      <div className="hero__overlay hero__overlay--glow" />
      <div className="hero__overlay hero__overlay--depth" />

      {/* ---- Content ---- */}
      <motion.div
        className="hero__content"
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.h1
          className="hero__title"
          variants={fadeUpVariant(0.8, 30)}
        >
          RATH X
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="hero__tagline"
          variants={taglineVariant}
        >
          Powering Outdoor Connectivity
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          className="hero__scroll"
          variants={scrollVariant}
          aria-label="Scroll to explore"
        >
          <span className="hero__scroll-text">Scroll to Explore</span>
          <div className="hero__scroll-line" />
        </motion.div>
      </motion.div>
    </section>
  );
}
