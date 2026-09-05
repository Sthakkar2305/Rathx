import { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';
import './CinematicHero.css';

gsap.registerPlugin(ScrollTrigger);

/* ================================================
   Scene Definitions
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
   Smooth Video Seeking Helper (Bidirectional Scrubbing)
   ================================================ */

const SCENE_SCRUB_SECONDS = 7.0; // Scrub entire 6-7 seconds of motion for each scene as requested

const seekVideo = (video, targetTime) => {
  if (!video) return;
  const duration = (video.duration && !isNaN(video.duration)) ? video.duration : 10;
  const maxSafeTime = Math.min(duration - 0.05, SCENE_SCRUB_SECONDS);
  const clamped = Math.max(0.01, Math.min(targetTime, maxSafeTime));

  video._targetTime = clamped;

  if (Math.abs(video.currentTime - clamped) < 0.02) return;

  if (video.seeking) {
    return;
  }

  try {
    video.currentTime = clamped;
  } catch {
    // Ignore seek errors
  }
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

  /* Atmosphere & Stage Refs */
  const card3dRef           = useRef(null);
  const stageRef            = useRef(null);
  const parallaxLayerRef    = useRef(null);
  const beachAtmosphereRef  = useRef(null);
  const desertAtmosphereRef = useRef(null);
  const streetSeparatorRef  = useRef(null);
  const beachSeparatorRef   = useRef(null);
  const desertSeparatorRef  = useRef(null);
  const exitFadeRef         = useRef(null);
  const heroReadyRef        = useRef(false);

  const prefersReducedMotion = useReducedMotion();

  /* Responsive video sources */
  const heroSrc   = useResponsiveVideo(VIDEOS.hero.desktop, VIDEOS.hero.mobile);
  const templeSrc = useResponsiveVideo(VIDEOS.temple.desktop, VIDEOS.temple.mobile);
  const streetSrc = useResponsiveVideo(VIDEOS.street.desktop, VIDEOS.street.mobile);
  const beachSrc  = useResponsiveVideo(VIDEOS.beach.desktop, VIDEOS.beach.mobile);
  const desertSrc = useResponsiveVideo(VIDEOS.desert.desktop, VIDEOS.desert.mobile);

  /* Setup video frame scrubbing listeners and ensure video pause */
  useEffect(() => {
    const videos = [
      heroVideoRef.current,
      templeVideoRef.current,
      streetVideoRef.current,
      beachVideoRef.current,
      desertVideoRef.current,
    ];

    const handleSeeked = (e) => {
      const video = e.target;
      if (video && typeof video._targetTime === 'number') {
        const diff = Math.abs(video.currentTime - video._targetTime);
        if (diff > 0.02) {
          try {
            video.currentTime = video._targetTime;
          } catch {}
        }
      }
    };

    const handleLoaded = (e) => {
      const video = e.target;
      if (!video) return;
      video.pause();
      if (typeof video._targetTime === 'number') {
        try {
          video.currentTime = video._targetTime;
        } catch {}
      } else {
        try {
          video.currentTime = 0.01;
        } catch {}
      }
    };

    videos.forEach((video) => {
      if (!video) return;
      video.pause();
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('loadedmetadata', handleLoaded);
      video.addEventListener('canplay', handleLoaded);
    });

    // High-frequency sync ticker for smooth forward & reverse frame scrubbing
    const tickerCallback = () => {
      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i];
        if (vid && typeof vid._targetTime === 'number' && !vid.seeking) {
          if (Math.abs(vid.currentTime - vid._targetTime) > 0.03) {
            try {
              vid.currentTime = vid._targetTime;
            } catch {}
          }
        }
      }
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
      videos.forEach((video) => {
        if (!video) return;
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('canplay', handleLoaded);
      });
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

  /* ---- GSAP Scroll-driven Timeline ---- */
  useGSAP(() => {
    if (prefersReducedMotion) return undefined;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3, // Instantaneous, buttery bidirectional frame scrubbing
      },
    });

    /*
     * Continuous 5-Act Cinematic Narrative with Real-Time 3D Frame Scrubbing:
     *
     * In EACH of the 5 scenes:
     * - The scene layer is 100% visible and pristine.
     * - The video scrubs continuously through the entire 6-7 seconds (0.0s -> 7.0s) as you scroll down.
     * - When you reverse scroll (scroll up), the video scrubs backwards (7.0s -> 0.0s) smoothly!
     * - Clean scene crossfades occur strictly at the boundaries between chapters.
     */

    /* ---- Real-Time 3D Card Enlargement on Initial Scroll ---- */
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

    /* ---- Video Scrubbing Tracking Object ---- */
    const videoProgress = {
      hero: 0,
      temple: 0,
      street: 0,
      beach: 0,
      desert: 0,
    };

    /* ================================================================
       ACT 0: HERO INTRO (0.00 -> 0.20)
       - Dedicated Video Scrub: 0.0s -> 7.0s across 0.00 -> 0.17
       ================================================================ */
    tl.to(videoProgress, {
      hero: 1.0,
      ease: 'none',
      duration: 0.17,
      onUpdate: () => {
        const vid = heroVideoRef.current;
        if (vid) seekVideo(vid, videoProgress.hero * SCENE_SCRUB_SECONDS);
      },
    }, 0.00);

    // Hero Text exit
    tl.to(heroContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.04,
      ease: 'power2.in',
    }, 0.12);

    // Crossfade: Hero -> Temple
    tl.to(heroLayerRef.current, {
      autoAlpha: 0,
      scale: 1.03,
      duration: 0.04,
      ease: 'power1.inOut',
    }, 0.16);

    tl.fromTo(templeLayerRef.current,
      { autoAlpha: 0, scale: 0.97 },
      { autoAlpha: 1, scale: 1.0, duration: 0.04, ease: 'power1.inOut' },
      0.16
    );

    /* ================================================================
       ACT 1: TEMPLE SCENE (0.20 -> 0.40)
       - Dedicated Video Scrub: 0.0s -> 7.0s across 0.20 -> 0.37
       ================================================================ */
    tl.to(videoProgress, {
      temple: 1.0,
      ease: 'none',
      duration: 0.17,
      onUpdate: () => {
        const vid = templeVideoRef.current;
        if (vid) seekVideo(vid, videoProgress.temple * SCENE_SCRUB_SECONDS);
      },
    }, 0.20);

    // Temple text entrance
    tl.fromTo(templeContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' },
      0.20
    );

    // Temple text slow parallax drift
    tl.to(templeContentRef.current, {
      y: -15,
      duration: 0.10,
      ease: 'none',
    }, 0.24);

    // Temple text exit
    tl.to(templeContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.03,
      ease: 'power2.in',
    }, 0.34);

    // Crossfade: Temple -> Street
    tl.to(templeLayerRef.current, {
      autoAlpha: 0,
      scale: 1.03,
      duration: 0.04,
      ease: 'power1.inOut',
    }, 0.36);

    tl.fromTo(streetLayerRef.current,
      { autoAlpha: 0, scale: 0.97 },
      { autoAlpha: 1, scale: 1.0, duration: 0.04, ease: 'power1.inOut' },
      0.36
    );

    /* ================================================================
       ACT 2: URBAN MOBILITY / STREET SCENE (0.40 -> 0.60)
       - Dedicated Video Scrub: 0.0s -> 7.0s across 0.40 -> 0.57
       ================================================================ */
    tl.to(videoProgress, {
      street: 1.0,
      ease: 'none',
      duration: 0.17,
      onUpdate: () => {
        const vid = streetVideoRef.current;
        if (vid) seekVideo(vid, videoProgress.street * SCENE_SCRUB_SECONDS);
      },
    }, 0.40);

    // Street text & separator entrance
    tl.fromTo(streetContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' },
      0.40
    );

    if (streetSeparatorRef.current) {
      tl.fromTo(streetSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.03, ease: 'power2.out' },
        0.41
      );
    }

    // Street text drift
    tl.to(streetContentRef.current, {
      y: -15,
      duration: 0.10,
      ease: 'none',
    }, 0.44);

    // Street text exit
    tl.to(streetContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.03,
      ease: 'power2.in',
    }, 0.54);

    // Crossfade: Street -> Beach
    tl.to(streetLayerRef.current, {
      autoAlpha: 0,
      scale: 1.03,
      duration: 0.04,
      ease: 'power1.inOut',
    }, 0.56);

    tl.fromTo(beachLayerRef.current,
      { autoAlpha: 0, scale: 0.97 },
      { autoAlpha: 1, scale: 1.0, duration: 0.04, ease: 'power1.inOut' },
      0.56
    );

    /* ================================================================
       ACT 3: SEASHORE / BEACH SCENE (0.60 -> 0.80)
       - Dedicated Video Scrub: 0.0s -> 7.0s across 0.60 -> 0.77
       ================================================================ */
    tl.to(videoProgress, {
      beach: 1.0,
      ease: 'none',
      duration: 0.17,
      onUpdate: () => {
        const vid = beachVideoRef.current;
        if (vid) seekVideo(vid, videoProgress.beach * SCENE_SCRUB_SECONDS);
      },
    }, 0.60);

    // Beach text & separator entrance
    tl.fromTo(beachContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' },
      0.60
    );

    if (beachSeparatorRef.current) {
      tl.fromTo(beachSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.03, ease: 'power2.out' },
        0.61
      );
    }

    // Subtle coastal atmosphere haze
    if (beachAtmosphereRef.current) {
      tl.fromTo(beachAtmosphereRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05, ease: 'power1.out' },
        0.60
      );
      tl.to(beachAtmosphereRef.current,
        { autoAlpha: 0, duration: 0.04, ease: 'power1.in' },
        0.74
      );
    }

    // Beach text drift
    tl.to(beachContentRef.current, {
      y: -15,
      duration: 0.10,
      ease: 'none',
    }, 0.64);

    // Beach text exit
    tl.to(beachContentRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.03,
      ease: 'power2.in',
    }, 0.74);

    // Crossfade: Beach -> Desert
    tl.to(beachLayerRef.current, {
      autoAlpha: 0,
      scale: 1.03,
      duration: 0.04,
      ease: 'power1.inOut',
    }, 0.76);

    tl.fromTo(desertLayerRef.current,
      { autoAlpha: 0, scale: 0.97 },
      { autoAlpha: 1, scale: 1.0, duration: 0.04, ease: 'power1.inOut' },
      0.76
    );

    /* ================================================================
       ACT 4: DESERT CLIMAX SCENE (0.80 -> 1.00)
       - Dedicated Video Scrub: 0.0s -> 7.0s across 0.80 -> 0.96
       ================================================================ */
    tl.to(videoProgress, {
      desert: 1.0,
      ease: 'none',
      duration: 0.16,
      onUpdate: () => {
        const vid = desertVideoRef.current;
        if (vid) seekVideo(vid, videoProgress.desert * SCENE_SCRUB_SECONDS);
      },
    }, 0.80);

    // Desert text & separator entrance
    tl.fromTo(desertContentRef.current,
      { autoAlpha: 0, y: 35 },
      { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' },
      0.80
    );

    if (desertSeparatorRef.current) {
      tl.fromTo(desertSeparatorRef.current,
        { width: 0, autoAlpha: 0 },
        { width: 44, autoAlpha: 1, duration: 0.03, ease: 'power2.out' },
        0.81
      );
    }

    // Desert solar corona atmosphere
    if (desertAtmosphereRef.current) {
      tl.fromTo(desertAtmosphereRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05, ease: 'power1.out' },
        0.80
      );
    }

    // Desert camera movement simulation
    tl.to(desertLayerRef.current, {
      scale: 1.04,
      x: -10,
      y: -6,
      duration: 0.14,
      ease: 'sine.out',
    }, 0.82);

    // Desert text drift
    tl.to(desertContentRef.current, {
      y: -15,
      duration: 0.08,
      ease: 'none',
    }, 0.84);

    // Desert text exit
    tl.to(desertContentRef.current, {
      autoAlpha: 0,
      y: -35,
      duration: 0.03,
      ease: 'power2.in',
    }, 0.92);

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
        { autoAlpha: 1, duration: 0.06, ease: 'power1.inOut' },
        0.94
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
