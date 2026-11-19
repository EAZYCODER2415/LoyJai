import React, { useEffect, useRef } from 'react';

const LanternSprite = ({ glow = 'gold', style = 'traditional' }) => {
  const flame = glow === 'pink' ? '#ff9cba' : glow === 'white' ? '#fff6cc' : '#ffc75a';
  return (
    <svg viewBox="0 0 180 230" role="img" aria-label="Illuminated sky lantern">
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor={flame} stopOpacity=".95" />
          <stop offset=".7" stopColor={flame} stopOpacity=".48" />
          <stop offset="1" stopColor={flame} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lanternPaper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow === 'pink' ? '#ffb4a8' : glow === 'white' ? '#fff8df' : '#ffaf45'} />
          <stop offset="1" stopColor={glow === 'pink' ? '#dd6f87' : glow === 'white' ? '#e8c96e' : '#ed7429'} />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="118" rx="78" ry="104" fill="url(#lanternGlow)" />
      {style === 'crystal' ? (
        <path d="M90 18L142 62l-18 124H56L38 62z" fill="rgba(255,255,255,.22)" stroke={flame} strokeWidth="4" />
      ) : (
        <path d="M90 18c35 0 52 32 48 70l-12 98H54L42 88c-4-38 13-70 48-70z" fill="url(#lanternPaper)" stroke="#ffe4a0" strokeWidth="3" />
      )}
      <path d="M54 186h72l-8 18H62z" fill="#5d3d31" />
      <rect x="78" y="166" width="24" height="21" rx="3" fill="#f7dd73" />
      <ellipse cx="90" cy="172" rx="8" ry="13" fill="#ff9a35" />
    </svg>
  );
};

const Lantern = ({ lantern, onFadeComplete, onLanternClick }) => {
  const lanternRef = useRef(null);

  useEffect(() => {
    let currentTop = lantern.topOff;
    let animationFrame;
    let fadeTimeout;
    let fadeInTimeout;
    let glowTimeout;
    let ascentTimeout;
    let isFading = false;
    const isLooping = lantern.phase === 'looping';

    if (isLooping && lanternRef.current) {
      lanternRef.current.classList.add('is-fading-in');
      fadeInTimeout = window.setTimeout(() => {
        lanternRef.current?.classList.remove('is-fading-in');
      }, 700);
    }

    if (!isLooping && lanternRef.current) {
      lanternRef.current.classList.add('is-large-entering');
      glowTimeout = window.setTimeout(() => {
        lanternRef.current?.classList.remove('is-large-entering');
        lanternRef.current?.classList.add('is-large-glowing');
      }, 700);
      ascentTimeout = window.setTimeout(() => {
        lanternRef.current?.classList.remove('is-large-glowing');
        animationFrame = requestAnimationFrame(animateLantern);
      }, 1500);
    }

    const animateLantern = () => {
      if (!lanternRef.current) return;

      if (isLooping && currentTop <= 0 && !isFading) {
        isFading = true;
        lanternRef.current.classList.add('is-fading-out');
        fadeTimeout = window.setTimeout(() => {
          currentTop = window.innerHeight * 0.42;
          lanternRef.current?.style.setProperty('top', `${currentTop}px`);
          lanternRef.current?.style.setProperty('left', `${Math.floor(Math.random() * 70) + 15}%`);
          lanternRef.current?.classList.remove('is-fading-out');
          lanternRef.current?.classList.add('is-fading-in');
          window.setTimeout(() => lanternRef.current?.classList.remove('is-fading-in'), 700);
          isFading = false;
          animationFrame = requestAnimationFrame(animateLantern);
        }, 700);
        return;
      }

      currentTop -= isLooping ? 0.0875 : 0.2;
      lanternRef.current.style.top = `${currentTop}px`;

      if (!isLooping && currentTop < -100) {
        lanternRef.current.classList.add('is-fading');
        fadeTimeout = window.setTimeout(() => onFadeComplete(lantern.id), 700);
        return;
      }

      animationFrame = requestAnimationFrame(animateLantern);
    };

    if (isLooping) {
      animationFrame = requestAnimationFrame(animateLantern);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(fadeInTimeout);
      window.clearTimeout(glowTimeout);
      window.clearTimeout(ascentTimeout);
    };
  }, [lantern, onFadeComplete]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLanternClick(lantern);
    }
  };

  return (
    <div
      className={`lantern lantern-${lantern.customization?.style || 'traditional'} lantern-glow-${lantern.customization?.glow || 'gold'} ${lantern.phase === 'looping' ? 'is-looping' : 'is-large'}${lantern.releaseSize === 'small' ? ' is-small-release' : ''}`}
      ref={lanternRef}
      tabIndex="0"
      aria-label={`Lantern by ${lantern.name}`}
      role="button"
      onClick={() => {
        onLanternClick(lantern);
      }}
      onKeyDown={handleKeyDown}
      style={{
        left: `${lantern.xPosition ?? 50}%`,
        position: 'fixed',
        zIndex: lantern.phase === 'large' ? 20 : 3,
        top: `${lantern.topOff}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="lantern-sprite-art" style={{ width: '100%', height: '100%' }} aria-hidden="true">
        <LanternSprite
          glow={lantern.customization?.glow}
          style={lantern.customization?.style}
        />
      </div>
    </div>
  );
};

export default Lantern;