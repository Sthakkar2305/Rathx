import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import './SiteContent.css';

const CAPABILITIES = [
  ['01', 'OUTDOOR ADVERTISING', 'A high-impact digital canvas that moves toward the audience, not away from it.'],
  ['02', 'DIGITAL INFORMATION', 'Deliver timely wayfinding, public notices, and local information in the moment.'],
  ['03', 'EVENT DEPLOYMENT', 'Arrive, activate, and connect a temporary venue without fixed infrastructure.'],
  ['04', 'PUBLIC CONNECTIVITY', 'Extend reliable Wi-Fi and device power into the spaces people share.'],
  ['05', 'TOURISM INFORMATION', 'Give visitors a clear, always-on entry point to destinations and experiences.'],
  ['06', 'SMART CITY APPLICATIONS', 'One autonomous asset for communication, utility, visibility, and data.'],
];

const SERVICES = [
  ['01', 'OUTDOOR ADVERTISING', 'A high-impact digital canvas that moves toward the audience, not away from it.'],
  ['02', 'DIGITAL INFORMATION', 'Deliver timely wayfinding, public notices, and local information in the moment.'],
  ['03', 'EVENT DEPLOYMENT', 'Arrive, activate, and connect a temporary venue without fixed infrastructure.'],
  ['04', 'PUBLIC CONNECTIVITY', 'Extend reliable Wi-Fi and device power into the spaces people share.'],
  ['05', 'TOURISM INFORMATION', 'Give visitors a clear, always-on entry point to destinations and experiences.'],
  ['06', 'SMART CITY APPLICATIONS', 'One autonomous asset for communication, utility, visibility, and data.'],
];

const SPECIFICATIONS = [
  ['01', '55"', 'OUTDOOR DISPLAY'], ['02', '600 W', 'SOLAR POWERED'],
  ['03', '100 W PD', 'MOBILE CHARGING'], ['04', 'AI', 'SMART CAMERA'],
  ['05', 'UV-C', 'WATER STATION'], ['06', '5.2 kWh', 'LITHIUM ENERGY STORAGE'],
];

const APPLICATIONS = [
  ['TEMPLES', 'Respectful, low-impact digital utility for heritage spaces.'],
  ['CITIES', 'A mobile public layer for high-footfall urban districts.'],
  ['BEACHES', 'Connection and hydration along the coast.'],
  ['DESERTS', 'Autonomous infrastructure where the grid does not reach.'],
  ['TOURISM', 'A more useful first touchpoint for every visitor.'],
  ['EVENTS', 'Instant presence for crowds, venues, and partners.'],
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (index = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: index * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const revealOrbit = {
  hidden: { opacity: 0, rotateZ: -360, z: -500, scale: 0.4 },
  visible: (index = 0) => ({
    opacity: 1, 
    rotateZ: 0, 
    z: 0, 
    scale: 1,
    transition: { delay: index * 0.15, duration: 1.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

function DepthSection({ children, className, id }) {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [32, 0, -20]), {
    stiffness: 85,
    damping: 24,
    mass: 0.45,
  });
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -1.25]), {
    stiffness: 85,
    damping: 24,
    mass: 0.45,
  });

  return (
    <motion.section
      ref={sectionRef}
      className={className}
      id={id}
      style={prefersReducedMotion ? undefined : {
        y,
        rotateX,
        transformPerspective: 1600,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </motion.section>
  );
}

function DepthSurface({ children, className, depth = 7, lift = -10, ...props }) {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [depth, -depth]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-depth, depth]), {
    stiffness: 180,
    damping: 22,
  });

  function handlePointerMove(event) {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetDepth() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.article
      {...props}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetDepth}
      style={{ transformPerspective: 1200, transformStyle: 'preserve-3d', rotateX, rotateY }}
      whileHover={prefersReducedMotion ? undefined : { y: lift, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      {children}
    </motion.article>
  );
}

function LazyProductVideo() {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [source, setSource] = useState(() => (
    window.innerWidth <= 768 ? '/videos/9_16%20desert.mp4' : '/videos/16_9%20desert.mp4'
  ));

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const updateSource = () => setSource(
      media.matches ? '/videos/9_16%20desert.mp4' : '/videos/16_9%20desert.mp4',
    );
    media.addEventListener('change', updateSource);
    return () => media.removeEventListener('change', updateSource);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? source : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label="RATH X product deployment in a desert environment"
    />
  );
}

function StaggeredReveal({ index, children, x=[0,0], y=[0,0], z=[0,0], rotateX=[0,0], rotateY=[0,0], scale=[1,1], staggerOffset=0.1 }) {
  const variants = {
    hidden: { opacity: 0, x: x[0], y: y[0], z: z[0], rotateX: rotateX[0], rotateY: rotateY[0], scale: scale[0] },
    visible: { 
      opacity: 1, x: x[1], y: y[1], z: z[1], rotateX: rotateX[1], rotateY: rotateY[1], scale: scale[1],
      transition: { delay: index * staggerOffset, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={variants} style={{ transformPerspective: 1400 }}>
      {children}
    </motion.div>
  );
}

function RevealBlock({ children, className, id, x=[0,0], y=[0,0], z=[0,0], rotateX=[0,0], rotateY=[0,0], scale=[1,1] }) {
  const variants = {
    hidden: { opacity: 0, x: x[0], y: y[0], z: z[0], rotateX: rotateX[0], rotateY: rotateY[0], scale: scale[0] },
    visible: { 
      opacity: 1, x: x[1], y: y[1], z: z[1], rotateX: rotateX[1], rotateY: rotateY[1], scale: scale[1],
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div id={id} className={className} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={variants} style={{ transformPerspective: 1400 }}>
      {children}
    </motion.div>
  );
}

function CapabilityOrbitSection({ capabilities }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'center center'],
  });

  return (
    <div className="capability-orbit" ref={containerRef}>
      <div className="capability-orbit__core">
        <span>RATH</span><b>X</b><small>OFF-GRID / ONLINE</small>
      </div>
      {capabilities.map(([number, title, description], index) => {
        const start = Math.min(index * 0.08, 0.5);
        const end = Math.min(start + 0.45, 1);
        const rotateZ = useTransform(scrollYProgress, [start, end], [-360, 0]);
        const z = useTransform(scrollYProgress, [start, end], [-600, 0]);
        const scale = useTransform(scrollYProgress, [start, end], [0.3, 1]);
        const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

        return (
          <motion.div
            key={title}
            className="capability-wrapper"
            style={{ 
              position: 'absolute', 
              inset: 0, 
              transformOrigin: 'center center', 
              pointerEvents: 'none',
              rotateZ, 
              z, 
              scale, 
              opacity 
            }}
          >
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
              <DepthSurface className={`capability-tile capability-tile--${index + 1}`} depth={10} lift={-13}>
                <span>{number}</span><h3>{title}</h3><p>{description}</p>
              </DepthSurface>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function SiteContent() {
  const [formStatus, setFormStatus] = useState('idle');
  function submitEnquiry(event) {
    event.preventDefault();
    setFormStatus('sent');
    event.currentTarget.reset();
  }

  return (
    <main className="site-content" id="site-content">
      <div className="site-content__ambient" aria-hidden="true">
        <span className="site-content__orb site-content__orb--cyan" />
        <span className="site-content__orb site-content__orb--amber" />
        <span className="site-content__grid-glow" />
      </div>

      <DepthSection className="site-section site-section--about" id="about">
        <div className="site-container about-layout">
          <RevealBlock className="about-copy" x={[-50, 0]} rotateY={[-20, 0]}>
            <span className="section-eyebrow">01 / THE PLATFORM</span>
            <h2 className="about-headline"><span>RATH X</span> BUILT TO MOVE.</h2>
            <p>RATH X is a self-sustaining outdoor platform that brings power, communication, information, and public utility to the places that need them most. One mobile unit. A living layer of smart infrastructure.</p>
          </RevealBlock>
          <CapabilityOrbitSection capabilities={CAPABILITIES} />
        </div>
      </DepthSection>

      <DepthSection className="site-section site-section--services" id="services">
        <div className="site-container">
          <RevealBlock className="section-header section-header--split" y={[40, 0]} rotateX={[-15, 0]}>
            <div><span className="section-eyebrow">02 / SERVICE LAYER</span><h2 className="section-title">ONE PLATFORM.<br />SIX POSSIBILITIES.</h2></div>
            <p>RATH X turns an outdoor location into a useful, connected, brand-ready place without the lead time of permanent construction.</p>
          </RevealBlock>
          <RevealBlock className="services-list" y={[0, 0]}>
            {SERVICES.map(([number, title, description], index) => (
              <StaggeredReveal key={title} index={index} x={[-100, 0]} rotateY={[-25, 0]}>
                <DepthSurface className="service-row" depth={2} lift={-3}>
                  <span className="service-row__number">{number}</span><h3>{title}</h3><p>{description}</p><span className="service-row__arrow">↗</span>
                </DepthSurface>
              </StaggeredReveal>
            ))}
          </RevealBlock>
        </div>
      </DepthSection>

      <DepthSection className="site-section site-section--product" id="product">
        <div className="site-container">
          <RevealBlock className="section-header" y={[40, 0]} rotateX={[-15, 0]}>
            <span className="section-eyebrow">03 / RATH X PRODUCT</span><h2 className="section-title">A MOBILE COMMAND<br />POINT FOR THE OUTDOORS.</h2>
          </RevealBlock>
          <div className="product-deck">
            <RevealBlock className="product-visual" rotateY={[20, 0]} scale={[0.9, 1]}>
              <LazyProductVideo />
              <div className="product-visual__shade" />
              <div className="product-visual__hud"><span>RATH X / NOMADIC NODE</span><i /><span>STATUS: ACTIVE</span></div>
              <div className="product-visual__title"><span>AUTONOMOUS</span><strong>01</strong></div>
            </RevealBlock>
            <RevealBlock className="spec-deck" y={[0, 0]}>
              {SPECIFICATIONS.map(([number, value, label], index) => (
                <StaggeredReveal key={label} index={index} x={[40, 0]} rotateY={[30, 0]}>
                  <DepthSurface className="spec-panel" depth={5} lift={-6}>
                    <span>{number}</span><b>{value}</b><p>{label}</p>
                  </DepthSurface>
                </StaggeredReveal>
              ))}
            </RevealBlock>
          </div>
        </div>
      </DepthSection>

      <DepthSection className="site-section site-section--applications" id="applications">
        <div className="site-container">
          <RevealBlock className="section-header" y={[40, 0]} rotateX={[-15, 0]}>
            <span className="section-eyebrow">04 / DEPLOYMENT TERRITORIES</span><h2 className="section-title">WHEREVER PEOPLE<br />GATHER, RATH X WORKS.</h2>
          </RevealBlock>
          <RevealBlock className="applications-grid" y={[0, 0]}>
            {APPLICATIONS.map(([title, description], index) => (
              <StaggeredReveal key={title} index={index} z={[-300, 0]} rotateX={[25, 0]} rotateY={[-15, 0]}>
                <DepthSurface className={`application-card application-card--${index + 1}`} depth={9} lift={-14}>
                  <span>0{index + 1}</span><h3>{title}</h3><p>{description}</p><i aria-hidden="true" />
                </DepthSurface>
              </StaggeredReveal>
            ))}
          </RevealBlock>
        </div>
      </DepthSection>

      <DepthSection className="site-section site-section--cta" id="contact">
        <div className="site-container cta-layout">
          <RevealBlock className="cta-copy" x={[-50, 0]} rotateY={[-15, 0]}>
            <span className="section-eyebrow">05 / START A CONVERSATION</span><h2>READY TO MOVE OUTDOOR CONNECTIVITY FORWARD?</h2><p>Tell us where you want to deploy. We will shape the right RATH X configuration for your environment, audience, and ambition.</p>
            <div className="cta-actions"><a href="https://sconnect-mu.vercel.app/" target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn--primary">REQUEST A DEMO <span>↗</span></a><a href="mailto:contact@sconnect.global" className="cta-btn cta-btn--secondary">CONTACT US <span>↗</span></a></div>
          </RevealBlock>
          <RevealBlock className="enquiry-form-wrapper" y={[80, 0]} rotateX={[25, 0]}>
            <form className="enquiry-form" id="enquiry" onSubmit={submitEnquiry}>
              <div className="form-heading"><span>ENQUIRY / 01</span><b>LET&apos;S BUILD THE NEXT MOVE.</b></div>
              <label>Name<input required name="name" type="text" placeholder="Your name" /></label>
              <label>Company<input required name="company" type="text" placeholder="Company name" /></label>
              <div className="form-pair"><label>Phone<input required name="phone" type="tel" placeholder="Phone number" /></label><label>Email<input required name="email" type="email" placeholder="Email address" /></label></div>
              <label>Message<textarea required name="message" rows="4" placeholder="Tell us about your deployment" /></label>
              <button type="submit" className="form-submit">SEND ENQUIRY <span>↗</span></button>
              {formStatus === 'sent' && <p className="form-status" role="status">Thank you. Your enquiry is ready for the RATH X team.</p>}
            </form>
          </RevealBlock>
        </div>
      </DepthSection>

      <footer className="site-footer">
        <div className="site-container footer-container">
          <div className="footer-brand-wrap">
            <img 
              src="/cropped-rathx-logo-light.png" 
              alt="RATH X Logo" 
              className="footer-logo-img" 
            />
            <span className="footer-tagline">BY S-CONNECT / OUTDOOR DIGITAL INFRASTRUCTURE</span>
          </div>
          <p>© {new Date().getFullYear()} S-CONNECT. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </main>
  );
}
