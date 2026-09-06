import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CinematicHero.css';

gsap.registerPlugin(ScrollTrigger);

/* ================================================
   Scene Definitions & Media Configuration
   ================================================ */

const SCENES = [
  { id: 'hero', index: 0, desktop: '/videos/16_9%20intro.mp4', mobile: '/videos/9_16%20intro.mp4' },
  { id: 'temple', index: 1, desktop: '/videos/16_9%20temple.mp4', mobile: '/videos/9_16%20temple.mp4' },
  { id: 'street', index: 2, desktop: '/videos/16_9%20street.mp4', mobile: '/videos/9_16%20street.mp4' },
  { id: 'beach', index: 3, desktop: '/videos/16_9%20beach.mp4', mobile: '/videos/9_16%20beach.mp4' },
  { id: 'desert', index: 4, desktop: '/videos/16_9%20desert.mp4', mobile: '/videos/9_16%20desert.mp4' },
];

const VIDEOS = SCENES.reduce((acc, scene) => {
  acc[scene.id] = { desktop: scene.desktop, mobile: scene.mobile };
  return acc;
}, {});

/* ================================================
   Responsive Video Hook
   ================================================ */

function useResponsiveVideo(desktopSrc, mobileSrc) {
  const getSource = () => {
    if (typeof window === 'undefined') return desktopSrc;
    const isMobileWidth = window.innerWidth <= 768;
    return isMobileWidth ? mobileSrc : desktopSrc;
  };

  const [src, setSrc] = useState(getSource);

  useEffect(() => {
    const mqlMobile = window.matchMedia('(max-width: 768px)');

    const updateSrc = () => {
      const isMobileWidth = window.innerWidth <= 768;
      setSrc(isMobileWidth ? mobileSrc : desktopSrc);
    };

    mqlMobile.addEventListener('change', updateSrc);
    window.addEventListener('resize', updateSrc);

    return () => {
      mqlMobile.removeEventListener('change', updateSrc);
      window.removeEventListener('resize', updateSrc);
    };
  }, [desktopSrc, mobileSrc]);

  return src;
}

/* ================================================
   Framer Motion Variants (Hero initial entrance)
   ================================================ */

const EASE_CINEMATIC = [0.16, 1, 0.3, 1];

const titleVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.2, ease: EASE_CINEMATIC, delay: 0.8 },
  },
};

const taglineVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE_CINEMATIC, delay: 1.2 },
  },
};

const scrollVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_CINEMATIC, delay: 2 },
  },
};

/* ================================================
   CinematicHero Component
   ================================================ */

export default function CinematicHero({ onReady }) {
  /* Layer Refs */
  const containerRef        = useRef(null);
  const heroLayerRef        = useRef(null);
  const templeLayerRef      = useRef(null);
  const streetLayerRef      = useRef(null);
  const beachLayerRef       = useRef(null);
  const desertLayerRef      = useRef(null);

  /* Content Text Refs */
  const heroContentRef      = useRef(null);
  const templeContentRef    = useRef(null);
  const streetContentRef    = useRef(null);
  const beachContentRef     = useRef(null);
  const desertContentRef    = useRef(null);

  /* Video Element Refs */
  const heroVideoRef        = useRef(null);
  const templeVideoRef      = useRef(null);
  const streetVideoRef      = useRef(null);
  const beachVideoRef       = useRef(null);
  const desertVideoRef      = useRef(null);

  /* Atmosphere, Smoke & Stage Refs */
  const card3dRef           = useRef(null);
  const stageRef            = useRef(null);
  const parallaxLayerRef    = useRef(null);
  const smokeOverlayRef     = useRef(null);
  const beachAtmosphereRef  = useRef(null);
  const desertAtmosphereRef = useRef(null);
  const streetSeparatorRef  = useRef(null);
  const beachSeparatorRef   = useRef(null);
  const desertSeparatorRef  = useRef(null);
  const exitFadeRef         = useRef(null);
  const heroReadyRef        = useRef(false);

  /* Timeline Sync State Refs (Bypassing React re-renders completely for 60 FPS) */
  const scrubStateRef = useRef({
    hero: { target: 0, current: 0, duration: 10.03, isSeeking: false },
    temple: { target: 0, current: 0, duration: 10.03, isSeeking: false },
    street: { target: 0, current: 0, duration: 10.03, isSeeking: false },
    beach: { target: 0, current: 0, duration: 10.03, isSeeking: false },
    desert: { target: 0, current: 0, duration: 10.03, isSeeking: false },
  });

  const prefersReducedMotion = useReducedMotion();

  /* Responsive video sources */
  const heroSrc   = useResponsiveVideo(VIDEOS.hero.desktop, VIDEOS.hero.mobile);
  const templeSrc = useResponsiveVideo(VIDEOS.temple.desktop, VIDEOS.temple.mobile);
  const streetSrc = useResponsiveVideo(VIDEOS.street.desktop, VIDEOS.street.mobile);
  const beachSrc  = useResponsiveVideo(VIDEOS.beach.desktop, VIDEOS.beach.mobile);
  const desertSrc = useResponsiveVideo(VIDEOS.desert.desktop, VIDEOS.desert.mobile);

  /* ================================================
     High-Performance RAF Video Scrubbing Engine
     ================================================ */
  useEffect(() => {
    const videoMap = [
      { key: 'hero', ref: heroVideoRef },
      { key: 'temple', ref: templeVideoRef },
      { key: 'street', ref: streetVideoRef },
      { key: 'beach', ref: beachVideoRef },
      { key: 'desert', ref: desertVideoRef },
    ];

    const state = scrubStateRef.current;

    // Attach metadata listeners and ensure videos stay paused & preloaded
    const cleanups = [];
    videoMap.forEach(({ key, ref }) => {
      const vid = ref.current;
      if (!vid) return;

      vid.pause();

      const onMeta = () => {
        if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
          state[key].duration = vid.duration;
        }
      };

      const onSeeked = () => {
        state[key].isSeeking = false;
      };

      vid.addEventListener('loadedmetadata', onMeta);
      vid.addEventListener('canplay', onMeta);
      vid.addEventListener('seeked', onSeeked);

      if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
        state[key].duration = vid.duration;
      }

      cleanups.push(() => {
        vid.removeEventListener('loadedmetadata', onMeta);
        vid.removeEventListener('canplay', onMeta);
        vid.removeEventListener('seeked', onSeeked);
      });
    });

    let animationFrameId;
    let isRunning = true;

    // Dedicated requestAnimationFrame timeline scrubber loop
    const renderLoop = () => {
      if (!isRunning) return;

      for (let i = 0; i < videoMap.length; i++) {
        const { key, ref } = videoMap[i];
        const vid = ref.current;
        if (!vid) continue;

        const s = state[key];
        const target = s.target;
        const current = s.current;

        const diff = target - current;

        // Smoothly interpolate towards target time (lerp: 0.22 per frame)
        if (Math.abs(diff) > 0.003) {
          s.current += diff * 0.22;
        } else {
          s.current = target;
        }

        // Only dispatch seek when delta is significant and video is not saturated seeking
        const timeDelta = Math.abs(vid.currentTime - s.current);
        if (timeDelta > 0.02) {
          if (!vid.seeking && !s.isSeeking) {
            s.isSeeking = true;
            try {
              if (typeof vid.fastSeek === 'function') {
                vid.fastSeek(s.current);
              } else {
                vid.currentTime = s.current;
              }
            } catch {
              s.isSeeking = false;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      cleanups.forEach((fn) => fn());
    };
  }, [heroSrc, templeSrc, streetSrc, beachSrc, desertSrc]);

  useEffect(() => {
    heroReadyRef.current = false;
  }, [heroSrc]);

  const handleHeroReady = () => {
    if (heroReadyRef.current) return;
    heroReadyRef.current = true;
    onReady?.();
  };

  /* Subtle interactive mouse tilt */
  useEffect(() => {
    const container = containerRef.current;
    const pointer = window.matchMedia('(pointer: fine)');
    if (!container || !pointer.matches || prefersReducedMotion) return undefined;

    let frame;
    const updateCamera = (event) => {
      const bounds = container.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        container.style.setProperty('--camera-x', horizontal.toFixed(3));
        container.style.setProperty('--camera-y', vertical.toFixed(3));
      });
    };
    const resetCamera = () => {
      container.style.setProperty('--camera-x', '0');
      container.style.setProperty('--camera-y', '0');
    };

    container.addEventListener('pointermove', updateCamera, { passive: true });
    container.addEventListener('pointerleave', resetCamera);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('pointermove', updateCamera);
      container.removeEventListener('pointerleave', resetCamera);
    };
  }, [prefersReducedMotion]);

  /* ---- GSAP Scroll-driven Master Timeline ---- */
  useGSAP(() => {
    if (prefersReducedMotion) return undefined;

    const state = scrubStateRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15, // Responsive 60 FPS scroll tracking mapped to RAF lerp engine
      },
    });

    /* ---- 3D Card Enlargement on Initial Scroll ---- */
    if (card3dRef.current) {
      tl.fromTo(card3dRef.current,
        {
          scale: 0.88,
          rotateX: 4,
          translateZ: -60,
          borderRadius: '24px',
        },
        {
          scale: 1.0,
          rotateX: 0,
          translateZ: 0,
          borderRadius: '8px',
          duration: 0.04,
          ease: 'power1.out',
        },
        0.00
      );
    }

    /* ---- Master Progress Target Variables ---- */
    const timelineTargets = {
      heroProgress: 0,
      templeProgress: 0,
      streetProgress: 0,
      beachProgress: 0,
      desertProgress: 0,
    };

    /* ================================================================
       ACT 0: INTRO SCENE & FULL 10-SECOND SCRUB (0.000 -> 0.200)
       - Segment 1: 0.000 -> 0.060 maps to 0s -> 3.5s
       - Segment 2: 0.060 -> 0.120 maps to 3.5s -> 7.5s
       - Segment 3: 0.120 -> 0.170 maps to 7.5s -> 10.0s (full video timeline covered)
       - Reverses completely & smoothly on reverse scroll
       ================================================================ */
    tl.to(timelineTargets, {
      heroProgress: 1.0,
      ease: 'none',
      duration: 0.170,
      onUpdate: () => {
        const p = timelineTargets.heroProgress;
        const duration = state.hero.duration || 10.03;
        state.hero.target = Math.max(0.01, Math.min(p * duration, duration - 0.04));
      },
    }, 0.000);

    // Hero Text exit
    tl.to(heroContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.040,
      ease: 'power2.in',
    }, 0.110);

    // Smoke / Atmospheric Transition Effect at the end of Intro (0.160 -> 0.200)
    if (smokeOverlayRef.current) {
      tl.fromTo(smokeOverlayRef.current,
        { autoAlpha: 0, scale: 0.96, filter: 'blur(2px)' },
        { autoAlpha: 1, scale: 1.04, filter: 'blur(0px)', duration: 0.020, ease: 'power2.out' },
        0.160
      );
      tl.to(smokeOverlayRef.current,
        { autoAlpha: 0, scale: 1.08, filter: 'blur(4px)', duration: 0.020, ease: 'power2.in' },
        0.180
      );
    }

    // Seamless Crossfade: Hero -> Temple (0.170 -> 0.200)
    tl.to(heroLayerRef.current, {
      autoAlpha: 0,
      scale: 1.02,
      duration: 0.030,
      ease: 'power1.inOut',
    }, 0.170);

    tl.fromTo(templeLayerRef.current,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1.0, duration: 0.030, ease: 'power1.inOut' },
      0.170
    );

    /* ================================================================
       ACT 1: TEMPLE SCENE & FULL 10-SECOND SCRUB (0.200 -> 0.400)
       - Segment 1: 0.200 -> 0.260 maps to 0s -> 3.0s
       - Segment 2: 0.260 -> 0.320 maps to 3.0s -> 7.0s
       - Segment 3: 0.320 -> 0.370 maps to 7.0s -> end
       ================================================================ */
    tl.to(timelineTargets, {
      templeProgress: 1.0,
      ease: 'none',
      duration: 0.170,
      onUpdate: () => {
        const p = timelineTargets.templeProgress;
        const duration = state.temple.duration || 10.03;
        state.temple.target = Math.max(0.01, Math.min(p * duration, duration - 0.04));
      },
    }, 0.200);

    // Temple text entrance
    tl.fromTo(templeContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.035, ease: 'power2.out' },
      0.200
    );

    // Temple text parallax drift
    tl.to(templeContentRef.current, {
      y: -15,
      duration: 0.100,
      ease: 'none',
    }, 0.235);

    // Temple text exit
    tl.to(templeContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.035,
      ease: 'power2.in',
    }, 0.335);

    // Seamless Crossfade: Temple -> Street (0.370 -> 0.400)
    tl.to(templeLayerRef.current, {
      autoAlpha: 0,
      scale: 1.02,
      duration: 0.030,
      ease: 'power1.inOut',
    }, 0.370);

    tl.fromTo(streetLayerRef.current,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1.0, duration: 0.030, ease: 'power1.inOut' },
      0.370
    );

    /* ================================================================
       ACT 2: URBAN MOBILITY / STREET SCENE & FULL SCRUB (0.400 -> 0.600)
       - Full 0s -> 10s video scrubbing across scroll segment
       ================================================================ */
    tl.to(timelineTargets, {
      streetProgress: 1.0,
      ease: 'none',
      duration: 0.170,
      onUpdate: () => {
        const p = timelineTargets.streetProgress;
        const duration = state.street.duration || 10.03;
        state.street.target = Math.max(0.01, Math.min(p * duration, duration - 0.04));
      },
    }, 0.400);

    // Street text & separator entrance
    tl.fromTo(streetContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.035, ease: 'power2.out' },
      0.400
    );

    if (streetSeparatorRef.current) {
      tl.fromTo(streetSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.025, ease: 'power2.out' },
        0.410
      );
    }

    // Street text drift
    tl.to(streetContentRef.current, {
      y: -15,
      duration: 0.100,
      ease: 'none',
    }, 0.435);

    // Street text exit
    tl.to(streetContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.035,
      ease: 'power2.in',
    }, 0.535);

    // Seamless Crossfade: Street -> Beach (0.570 -> 0.600)
    tl.to(streetLayerRef.current, {
      autoAlpha: 0,
      scale: 1.02,
      duration: 0.030,
      ease: 'power1.inOut',
    }, 0.570);

    tl.fromTo(beachLayerRef.current,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1.0, duration: 0.030, ease: 'power1.inOut' },
      0.570
    );

    /* ================================================================
       ACT 3: SEASHORE / BEACH SCENE & FULL SCRUB (0.600 -> 0.800)
       - Full 0s -> 10s video scrubbing across scroll segment
       ================================================================ */
    tl.to(timelineTargets, {
      beachProgress: 1.0,
      ease: 'none',
      duration: 0.170,
      onUpdate: () => {
        const p = timelineTargets.beachProgress;
        const duration = state.beach.duration || 10.03;
        state.beach.target = Math.max(0.01, Math.min(p * duration, duration - 0.04));
      },
    }, 0.600);

    // Beach text & separator entrance
    tl.fromTo(beachContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.035, ease: 'power2.out' },
      0.600
    );

    if (beachSeparatorRef.current) {
      tl.fromTo(beachSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.025, ease: 'power2.out' },
        0.610
      );
    }

    // Coastal atmosphere haze
    if (beachAtmosphereRef.current) {
      tl.fromTo(beachAtmosphereRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.050, ease: 'power1.out' },
        0.600
      );
      tl.to(beachAtmosphereRef.current,
        { autoAlpha: 0, duration: 0.040, ease: 'power1.in' },
        0.730
      );
    }

    // Beach text drift
    tl.to(beachContentRef.current, {
      y: -15,
      duration: 0.100,
      ease: 'none',
    }, 0.635);

    // Beach text exit
    tl.to(beachContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.035,
      ease: 'power2.in',
    }, 0.735);

    // Seamless Crossfade: Beach -> Desert (0.770 -> 0.800)
    tl.to(beachLayerRef.current, {
      autoAlpha: 0,
      scale: 1.02,
      duration: 0.030,
      ease: 'power1.inOut',
    }, 0.770);

    tl.fromTo(desertLayerRef.current,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1.0, duration: 0.030, ease: 'power1.inOut' },
      0.770
    );

    /* ================================================================
       ACT 4: DESERT CLIMAX SCENE & FULL SCRUB (0.800 -> 1.000)
       - Full 0s -> 10s video scrubbing through the final end state
       ================================================================ */
    tl.to(timelineTargets, {
      desertProgress: 1.0,
      ease: 'none',
      duration: 0.160,
      onUpdate: () => {
        const p = timelineTargets.desertProgress;
        const duration = state.desert.duration || 10.03;
        state.desert.target = Math.max(0.01, Math.min(p * duration, duration - 0.04));
      },
    }, 0.800);

    // Desert text & separator entrance
    tl.fromTo(desertContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.035, ease: 'power2.out' },
      0.800
    );

    if (desertSeparatorRef.current) {
      tl.fromTo(desertSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.025, ease: 'power2.out' },
        0.810
      );
    }

    // Desert solar corona atmosphere
    if (desertAtmosphereRef.current) {
      tl.fromTo(desertAtmosphereRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.050, ease: 'power1.out' },
        0.800
      );
    }

    // Desert subtle cinematic scale
    tl.to(desertLayerRef.current, {
      scale: 1.03,
      x: -8,
      y: -5,
      duration: 0.140,
      ease: 'sine.out',
    }, 0.820);

    // Desert text drift
    tl.to(desertContentRef.current, {
      y: -15,
      duration: 0.080,
      ease: 'none',
    }, 0.835);

    // Desert text exit
    tl.to(desertContentRef.current, {
      autoAlpha: 0,
      y: -35,
      duration: 0.035,
      ease: 'power2.in',
    }, 0.915);

    // Subtle ambient parallax particles drift
    if (parallaxLayerRef.current) {
      tl.fromTo(parallaxLayerRef.current,
        { yPercent: 15, autoAlpha: 0 },
        { yPercent: -40, autoAlpha: 0.7, duration: 0.70, ease: 'none' },
        0.20
      );
    }

    // Seamless exit fade to site content
    if (exitFadeRef.current) {
      tl.fromTo(exitFadeRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.060, ease: 'power1.inOut' },
        0.940
      );
    }
  }, { scope: containerRef, dependencies: [prefersReducedMotion, heroSrc, templeSrc, streetSrc, beachSrc, desertSrc] });

  return (
    <section
      className={`cinematic ${prefersReducedMotion ? 'cinematic--reduced-motion' : ''}`}
      ref={containerRef}
      id="cinematic-hero"
      aria-label="RATH X Cinematic 3D Journey"
    >
      <div className="cinematic__viewport">

        {/* ======== 3D Stage & Full-Bleed Card ======== */}
        <div className="cinematic__stage" ref={stageRef}>
          <div className="cinematic__3d-card" ref={card3dRef}>

            {/* ======== Hero Layer (Chapter 00) ======== */}
            <div className="cinematic__layer cinematic__layer--hero" ref={heroLayerRef}>
              <video
                ref={heroVideoRef}
                key={heroSrc}
                className="cinematic__video cinematic__video--hero"
                src={heroSrc}
                onLoadedData={handleHeroReady}
                onCanPlay={handleHeroReady}
                muted
                playsInline
                preload="auto"
              />
              <div className="cinematic__overlay cinematic__overlay--glow" />
            </div>

            {/* ======== Temple Layer (Chapter 01) ======== */}
            <div className="cinematic__layer cinematic__layer--temple" ref={templeLayerRef}>
              <video
                ref={templeVideoRef}
                key={templeSrc}
                className="cinematic__video cinematic__video--temple"
                src={templeSrc}
                muted
                playsInline
                preload="auto"
              />
            </div>

            {/* ======== Street Layer (Chapter 02) ======== */}
            <div className="cinematic__layer cinematic__layer--street" ref={streetLayerRef}>
              <video
                ref={streetVideoRef}
                key={streetSrc}
                className="cinematic__video cinematic__video--street"
                src={streetSrc}
                muted
                playsInline
                preload="auto"
              />
              <div className="cinematic__overlay cinematic__overlay--street-glow" />
            </div>

            {/* ======== Beach Layer (Chapter 03 — Seashore) ======== */}
            <div className="cinematic__layer cinematic__layer--beach" ref={beachLayerRef}>
              <video
                ref={beachVideoRef}
                key={beachSrc}
                className="cinematic__video cinematic__video--beach"
                src={beachSrc}
                muted
                playsInline
                preload="auto"
              />
              <div className="cinematic__overlay cinematic__overlay--beach-glow" />
            </div>

            {/* ======== Desert Layer (Chapter 04 — Desert Climax) ======== */}
            <div className="cinematic__layer cinematic__layer--desert" ref={desertLayerRef}>
              <video
                ref={desertVideoRef}
                key={desertSrc}
                className="cinematic__video cinematic__video--desert"
                src={desertSrc}
                muted
                playsInline
                preload="auto"
              />
              <div className="cinematic__overlay cinematic__overlay--desert-glow" />
            </div>

            {/* ======== Smoke / Atmospheric Transition Effect ======== */}
            <div className="cinematic__smoke-overlay" ref={smokeOverlayRef} aria-hidden="true">
              <div className="cinematic__smoke-layer cinematic__smoke-layer--1" />
              <div className="cinematic__smoke-layer cinematic__smoke-layer--2" />
              <div className="cinematic__smoke-layer cinematic__smoke-layer--3" />
            </div>

            {/* ======== Subtle Coastal Atmospheric Effects ======== */}
            <div className="cinematic__atmosphere cinematic__atmosphere--beach" ref={beachAtmosphereRef} aria-hidden="true">
              <div className="cinematic__mist-haze" />
              <div className="cinematic__solar-flare" />
            </div>

            {/* ======== Subtle Desert Climax Atmospheric Effects ======== */}
            <div className="cinematic__atmosphere cinematic__atmosphere--desert" ref={desertAtmosphereRef} aria-hidden="true">
              <div className="cinematic__desert-corona" />
              <div className="cinematic__desert-haze" />
            </div>

            {/* ======== Subtle Ambient Parallax Particles ======== */}
            <div className="cinematic__parallax-layer" ref={parallaxLayerRef} aria-hidden="true">
              <div className="cinematic__parallax-particle cinematic__parallax-particle--1" />
              <div className="cinematic__parallax-particle cinematic__parallax-particle--2" />
              <div className="cinematic__parallax-particle cinematic__parallax-particle--3" />
            </div>

          </div>
        </div>

        {/* ======== Hero Content (Clean Unboxed Typography) ======== */}
        <motion.div
          className="cinematic__hero-content"
          ref={heroContentRef}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="cinematic__title" variants={titleVariant}>
            RATH X
          </motion.h1>

          <motion.p className="cinematic__tagline" variants={taglineVariant}>
            Powering Outdoor Connectivity
          </motion.p>

          <motion.div
            className="cinematic__scroll"
            variants={scrollVariant}
            aria-label="Scroll to explore"
          >
            <span className="cinematic__scroll-text">Scroll to Explore</span>
            <div className="cinematic__scroll-line" />
          </motion.div>
        </motion.div>

        {/* ======== Temple Scene Content (01 — Clean Unboxed Typography) ======== */}
        <div className="cinematic__scene-content cinematic__scene-content--temple" ref={templeContentRef}>
          <span className="cinematic__scene-index">01</span>
          <div className="cinematic__scene-separator" />
          <h2 className="cinematic__scene-title">Temple</h2>
          <p className="cinematic__scene-desc">
            Smart connectivity for public spaces.
          </p>
        </div>

        {/* ======== Street Scene Content (02 — Clean Unboxed Typography) ======== */}
        <div className="cinematic__scene-content cinematic__scene-content--street" ref={streetContentRef}>
          <span className="cinematic__scene-index">02</span>
          <div className="cinematic__scene-separator" ref={streetSeparatorRef} />
          <h2 className="cinematic__scene-title">URBAN MOBILITY</h2>
          <p className="cinematic__scene-desc">
            Digital infrastructure that moves with the city.
          </p>
        </div>

        {/* ======== Seashore Scene Content (03 — Clean Unboxed Typography) ======== */}
        <div className="cinematic__scene-content cinematic__scene-content--beach" ref={beachContentRef}>
          <span className="cinematic__scene-index">03</span>
          <div className="cinematic__scene-separator" ref={beachSeparatorRef} />
          <h2 className="cinematic__scene-title">SEASHORE</h2>
          <p className="cinematic__scene-desc">
            Connect people, information and experiences in high-footfall destinations.
          </p>
        </div>

        {/* ======== Desert Scene Content (04 Climax — Clean Unboxed Typography) ======== */}
        <div className="cinematic__scene-content cinematic__scene-content--desert" ref={desertContentRef}>
          <span className="cinematic__scene-index">04</span>
          <div className="cinematic__scene-separator" ref={desertSeparatorRef} />
          <h2 className="cinematic__scene-title">DESERT</h2>
          <p className="cinematic__scene-desc">
            Designed to bring connectivity beyond conventional infrastructure.
          </p>
        </div>

        {/* ======== Exit Transition Overlay to Website Content ======== */}
        <div className="cinematic__exit-fade" ref={exitFadeRef} aria-hidden="true" />

      </div>
    </section>
  );
}
