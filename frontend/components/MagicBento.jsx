import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

let stylesInjected = false;

const injectStyles = () => {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.innerHTML = `
    .magic-bento-wrapper {
      position: relative;
      display: block;
      width: 100%;
      --mb-radius: 32px;
      --mb-glow-color: 132, 0, 255;
      --mb-glow-x: 50%;
      --mb-glow-y: 50%;
      --mb-glow-intensity: 0;
      --mb-shadow-opacity: 0.2;
      isolation: isolate;
    }

    .magic-bento-wrapper .magic-bento__glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: var(--mb-radius);
      background: radial-gradient(circle at var(--mb-glow-x) var(--mb-glow-y),
        rgba(var(--mb-glow-color), 0.4) 0%,
        rgba(var(--mb-glow-color), 0.15) 35%,
        transparent 70%);
      opacity: var(--mb-glow-intensity);
      mix-blend-mode: screen;
      transition: opacity 0.25s ease;
      z-index: -1;
    }

    .magic-bento-wrapper::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--mb-radius);
      box-shadow:
        0 12px 30px rgba(6, 0, 16, 0.45),
        0 0 40px rgba(var(--mb-glow-color), var(--mb-shadow-opacity));
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: -2;
    }

    .magic-bento-wrapper.magic-bento--active::after {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
};

const MagicBento = ({
  children,
  className = '',
  glowColor = '132, 0, 255',
  radius = '32px',
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    injectStyles();
    const el = cardRef.current;
    if (!el) return;

    el.style.setProperty('--mb-radius', radius);
    el.style.setProperty('--mb-glow-color', glowColor);

    const resetTransform = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.35, ease: 'power3.out' });
      el.style.setProperty('--mb-glow-intensity', '0');
      el.classList.remove('magic-bento--active');
    };

    const handleMouseMove = (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      el.style.setProperty('--mb-glow-x', `${percentX}%`);
      el.style.setProperty('--mb-glow-y', `${percentY}%`);
      el.style.setProperty('--mb-glow-intensity', '1');
      el.classList.add('magic-bento--active');

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(el, {
          rotateX,
          rotateY,
          duration: 0.25,
          ease: 'power2.out',
          transformPerspective: 900
        });
      }

      if (enableMagnetism) {
        gsap.to(el, {
          x: (x - centerX) * 0.04,
          y: (y - centerY) * 0.04,
          duration: 0.25,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseLeave = () => {
      resetTransform();
    };

    const handleClick = (event) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const maxDim = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        left: ${event.clientX - rect.left - maxDim}px;
        top: ${event.clientY - rect.top - maxDim}px;
        width: ${maxDim * 2}px;
        height: ${maxDim * 2}px;
        border-radius: 999px;
        pointer-events: none;
        background: radial-gradient(circle, rgba(${glowColor},0.45) 0%, rgba(${glowColor},0.15) 45%, transparent 70%);
        opacity: 0.9;
        transform: scale(0);
        z-index: 10;
      `;
      el.appendChild(ripple);
      gsap.to(ripple, {
        scale: 1,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('click', handleClick);
    };
  }, [glowColor, radius, enableTilt, enableMagnetism, clickEffect]);

  return (
    <div ref={cardRef} className={`magic-bento-wrapper ${className}`} style={{ '--mb-radius': radius }}>
      <div className="magic-bento__glow" />
      {children}
    </div>
  );
};

export default MagicBento;

