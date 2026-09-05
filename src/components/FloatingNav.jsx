import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './FloatingNav.css';

const NAV_ITEMS = [
  { label: 'HOME', href: '#cinematic-hero', id: 'cinematic-hero' },
  { label: 'ABOUT', href: '#about', id: 'about' },
  { label: 'SERVICES', href: '#services', id: 'services' },
  { label: 'PRODUCT', href: '#product', id: 'product' },
  { label: 'APPLICATIONS', href: '#applications', id: 'applications' },
  { label: 'CONTACT', href: '#contact', id: 'contact' },
];

const EASE_CINEMATIC = [0.16, 1, 0.3, 1];

const PRODUCT_SPECS = [
  { label: 'LED screen', value: '2560 × 1280 mm' },
  { label: 'Screen area', value: 'approx. 4 m²' },
  { label: 'LED pitch', value: 'P10' },
  { label: 'Brightness', value: '≥5,500 nits' },
  { label: 'Overall trailer', value: '2700 × 1800 × 2300 mm' },
  { label: 'Solar panels', value: '4 × 180 W' },
  { label: 'Total solar capacity', value: '720 W' },
  { label: 'Battery', value: '12 × 2V 400Ah' },
  { label: 'Battery storage', value: 'approx. 9.6 kWh' },
  { label: 'Average LED consumption', value: 'approx. 50 W/m²' },
];

function ProductMegaMenu({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mega-menu"
          initial={{ opacity: 0, rotateX: -15, y: -20, transformPerspective: 1200 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: 10, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mega-menu__header">
            <span>Specifications</span>
            <strong>JCT E-F4 Solar</strong>
          </div>
          <ul className="mega-menu__list">
            {PRODUCT_SPECS.map((spec, i) => (
              <motion.li
                key={spec.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="mega-menu__value">{spec.value}</span>
                <span className="mega-menu__label">{spec.label}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FloatingNav({ revealed }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('cinematic-hero');
  const [isProductHovered, setIsProductHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries[0]) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-18% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.65],
      },
    );

    const elements = NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div className="floating-nav-shell">
        <motion.nav
          className={`floating-nav${revealed ? ' floating-nav--visible' : ''}${isScrolled ? ' floating-nav--scrolled' : ''}`}
          aria-label="Primary"
          initial={false}
          animate={{
            opacity: revealed ? 1 : 0,
            y: revealed ? 0 : -18,
            scale: revealed ? 1 : 0.97,
          }}
          transition={{
            duration: 0.9,
            ease: EASE_CINEMATIC,
          }}
        >
          <a className="floating-nav__brand" href="#cinematic-hero" onClick={() => setIsMenuOpen(false)}>
            <img 
              src="/cropped-rathx-logo-light.png" 
              alt="RATH X Logo" 
              className="floating-nav__logo-img" 
            />
          </a>

          <div className="floating-nav__links">
            {NAV_ITEMS.map((item, index) => {
              const isProduct = item.id === 'product';
              return (
                <div 
                  key={item.id} 
                  className="floating-nav__item-wrapper"
                  onMouseEnter={() => isProduct && setIsProductHovered(true)}
                  onMouseLeave={() => isProduct && setIsProductHovered(false)}
                >
                  <motion.a
                    className={`floating-nav__link${activeId === item.id ? ' is-active' : ''}`}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={false}
                    animate={{
                      opacity: revealed ? 1 : 0,
                      y: revealed ? 0 : -10,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: revealed ? 0.18 + index * 0.05 : 0,
                      ease: EASE_CINEMATIC,
                    }}
                  >
                    {item.label}
                  </motion.a>
                  
                  {isProduct && <ProductMegaMenu isOpen={isProductHovered} />}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={`floating-nav__toggle${isMenuOpen ? ' is-open' : ''}`}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_CINEMATIC }}
          >
            <motion.div
              className="mobile-nav__panel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.55, ease: EASE_CINEMATIC }}
            >
              <div className="mobile-nav__topbar">
                <img 
                  src="/cropped-rathx-logo-light.png" 
                  alt="RATH X Logo" 
                  className="mobile-nav__logo-img" 
                />
                <button
                  type="button"
                  className="mobile-nav__close"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span />
                  <span />
                </button>
              </div>

              <div className="mobile-nav__links">
                {NAV_ITEMS.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    className="mobile-nav__link"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.08 + index * 0.06,
                      ease: EASE_CINEMATIC,
                    }}
                  >
                    <span className="mobile-nav__index">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.label}</span>
                  </motion.a>
                ))}
              </div>

              <motion.div
                className="mobile-nav__meta"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, delay: 0.45, ease: EASE_CINEMATIC }}
              >
                Future-ready infrastructure for mobility, energy, and connected public space.
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
