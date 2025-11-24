import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const MOBILE_BREAKPOINT = 768;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.innerHTML = `
    .magic-bento {
      position: relative;
      display: block;
      width: 100%;
      border-radius: 34px;
      isolation: isolate;
      --mb-glow-color: 132, 0, 255;
      --mb-glow-opacity: 0;
      --mb-glow-x: 50%;
      --mb-glow-y: 50%;
      --mb-spotlight-radius: 320px;
    }

    .magic-bento::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(
        circle at var(--mb-glow-x) var(--mb-glow-y),
        rgba(var(--mb-glow-color), 0.45) 0%,
        rgba(var(--mb-glow-color), 0.25) 35%,
        rgba(var(--mb-glow-color), 0.05) 60%,
        transparent 80%
      );
      opacity: var(--mb-glow-opacity);
      pointer-events: none;
      transition: opacity 0.35s ease;
      filter: blur(10px);
      z-index: 0;
    }

    .magic-bento::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      border: 1px solid rgba(var(--mb-glow-color), 0.2);
      box-shadow:
        0 0 30px rgba(var(--mb-glow-color), 0.35),
        inset 0 0 40px rgba(var(--mb-glow-color), 0.1);
      opacity: var(--mb-glow-opacity);
      pointer-events: none;
      transition: opacity 0.35s ease;
      z-index: 1;
    }

    .magic-bento__content {
      position: relative;
      border-radius: inherit;
      z-index: 2;
      width: 100%;
    }

    .magic-bento__particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(var(--mb-glow-color), 0.9);
      box-shadow: 0 0 6px rgba(var(--mb-glow-color), 0.8);
      pointer-events: none;
      z-index: 3;
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
};

const MagicBento = ({
  children,
  glowColor = '132, 0, 255',
  spotlightRadius = 400,
  particleCount = 12,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  textAutoHide = true, // kept for API parity
  className = ''
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    injectStyles();
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty('--mb-glow-color', glowColor);
    card.style.setProperty('--mb-spotlight-radius', `${spotlightRadius}px`);

    const createParticle = () => {
      const rect = card.getBoundingClientRect();
      const particle = document.createElement('span');
      particle.className = 'magic-bento__particle';
      particle.style.left = `${Math.random() * rect.width}px`;
      particle.style.top = `${Math.random() * rect.height}px`;
      card.appendChild(particle);

      const drift = gsap.to(particle, {
        duration: 3 + Math.random() * 2,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        opacity: 0.2 + Math.random() * 0.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
      particlesRef.current.push({ element: particle, animation: drift });
    };

    const clearParticles = () => {
      particlesRef.current.forEach(({ element, animation }) => {
        animation.kill();
        element.remove();
      });
      particlesRef.current = [];
    };

    const handleEnter = () => {
      if (enableStars && !isMobile && particlesRef.current.length === 0) {
        for (let i = 0; i < particleCount; i += 1) {
          createParticle();
        }
      }
    };

    const handleLeave = () => {
      card.style.setProperty('--mb-glow-opacity', '0');
      if (enableTilt || enableMagnetism) {
        gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.4, ease: 'power3.out' });
      }
      clearParticles();
    };

    const handleMove = (event) => {
      if (!enableSpotlight || isMobile) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--mb-glow-opacity', enableBorderGlow ? '1' : '0.6');
      card.style.setProperty('--mb-glow-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mb-glow-y', `${(y / rect.height) * 100}%`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(card, {
          rotateX,
          rotateY,
          duration: 0.2,
          ease: 'power2.out',
          transformPerspective: 900
        });
      }
      if (enableMagnetism) {
        gsap.to(card, {
          x: (x - centerX) * 0.04,
          y: (y - centerY) * 0.04,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (event) => {
      if (!clickEffect || isMobile) return;
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '999px';
      ripple.style.pointerEvents = 'none';
      ripple.style.width = `${rect.width * 1.2}px`;
      ripple.style.height = `${rect.width * 1.2}px`;
      ripple.style.left = `${event.clientX - rect.left - (rect.width * 1.2) / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - (rect.width * 1.2) / 2}px`;
      ripple.style.background = `radial-gradient(circle, rgba(${glowColor},0.45) 0%, rgba(${glowColor},0.1) 50%, transparent 75%)`;
      ripple.style.zIndex = 4;
      ripple.style.opacity = '0.8';
      card.appendChild(ripple);

      gsap.to(ripple, {
        scale: 1.4,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    };

    card.addEventListener('mouseenter', handleEnter);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('click', handleClick);

    return () => {
      card.removeEventListener('mouseenter', handleEnter);
      card.removeEventListener('mouseleave', handleLeave);
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('click', handleClick);
      clearParticles();
    };
  }, [
    glowColor,
    spotlightRadius,
    particleCount,
    enableStars,
    enableSpotlight,
    enableBorderGlow,
    enableTilt,
    enableMagnetism,
    clickEffect,
    isMobile
  ]);

  return (
    <div ref={cardRef} className={`magic-bento ${className}`}>
      <div className="magic-bento__content">{children}</div>
    </div>
  );
};

export default MagicBento;

