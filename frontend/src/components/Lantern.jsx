import React, { useEffect, useRef } from 'react';
import { clampSceneValue, getHorizontalBounds, getLanternBounds, getLanternDimensions, getLanternSpawnY } from '../sceneBounds.js';

const LanternSprite = ({ glow = 'gold', style = 'traditional', idPrefix }) => {
  const glowId = `${idPrefix}-glow`;
  const paperId = `${idPrefix}-paper`;
  const flame = glow === 'pink' ? '#ff9cba' : glow === 'white' ? '#fff6cc' : '#ffc75a';
  return (
    <svg viewBox="0 0 180 230" role="img" aria-label="Illuminated sky lantern">
      <defs>
        <radialGradient id={glowId} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor={flame} stopOpacity=".95" />
          <stop offset=".7" stopColor={flame} stopOpacity=".48" />
          <stop offset="1" stopColor={flame} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={paperId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow === 'pink' ? '#ffb4a8' : glow === 'white' ? '#fff8df' : '#ffaf45'} />
          <stop offset="1" stopColor={glow === 'pink' ? '#dd6f87' : glow === 'white' ? '#e8c96e' : '#ed7429'} />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="118" rx="78" ry="104" fill={`url(#${glowId})`} />
      {style === 'crystal' ? (
        <path d="M90 18L142 62l-18 124H56L38 62z" fill="rgba(255,255,255,.22)" stroke={flame} strokeWidth="4" />
      ) : (
        <path d="M90 18c35 0 52 32 48 70l-12 98H54L42 88c-4-38 13-70 48-70z" fill={`url(#${paperId})`} stroke="#ffe4a0" strokeWidth="3" />
      )}
      <path d="M54 186h72l-8 18H62z" fill="#5d3d31" />
      <rect x="78" y="166" width="24" height="21" rx="3" fill="#f7dd73" />
      <ellipse cx="90" cy="172" rx="8" ry="13" fill="#ff9a35" />
    </svg>
  );
};

const Lantern = ({ lantern, isFocused = false, onFadeComplete, onLanternClick }) => {
  const lanternRef = useRef(null);

  useEffect(() => {
    const isLooping = lantern.phase === 'looping';
    const isLarge = !isLooping && lantern.releaseSize !== 'small';
    let { width: itemWidth, height: itemHeight } = getLanternDimensions(isLarge);
    let bounds = getLanternBounds(itemWidth, itemHeight);
    let currentTop = clampSceneValue(lantern.topOff, bounds.minY, bounds.maxY);
    let currentLeft = clampSceneValue(lantern.xPosition ?? 50, bounds.min, bounds.max);
    let animationFrame;
    let fadeTimeout;
    let fadeInTimeout;
    let glowTimeout;
    let ascentTimeout;
    let animationStartTimeout;
    let isFading = false;
    const handleResize = () => {
      ({ width: itemWidth, height: itemHeight } = getLanternDimensions(isLarge));
      bounds = getLanternBounds(itemWidth, itemHeight);
      currentTop = clampSceneValue(currentTop, bounds.minY, bounds.maxY);
      currentLeft = clampSceneValue(currentLeft, bounds.min, bounds.max);
      lanternRef.current?.style.setProperty('top', `${currentTop}px`);
      lanternRef.current?.style.setProperty('left', `${currentLeft}%`);
    };

    lanternRef.current?.style.setProperty('top', `${currentTop}px`);
    lanternRef.current?.style.setProperty('left', `${currentLeft}%`);
    window.addEventListener('resize', handleResize);

    if (isLooping && lanternRef.current) {
      lanternRef.current.classList.add('is-fading-in');
      fadeInTimeout = window.setTimeout(() => {
        lanternRef.current?.classList.remove('is-fading-in');
      }, 700);
      animationStartTimeout = window.setTimeout(() => {
        animationFrame = requestAnimationFrame(animateLantern);
      }, lantern.animationDelayMs || 0);
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

      if (currentTop <= -itemHeight && !isFading) {
        isFading = true;
        lanternRef.current.classList.add('is-fading-out');
        fadeTimeout = window.setTimeout(() => {
          if (!isLooping) {
            onFadeComplete(lantern.id);
            return;
          }

          const smallSize = getLanternDimensions();
          currentTop = getLanternSpawnY(smallSize.width, smallSize.height, true);
          const xBounds = getHorizontalBounds(smallSize.width);
          currentLeft = xBounds.min + Math.random() * (xBounds.max - xBounds.min);
          lanternRef.current?.style.setProperty('top', `${currentTop}px`);
          lanternRef.current?.style.setProperty('left', `${currentLeft}%`);
          lanternRef.current?.classList.remove('is-fading-out');
          lanternRef.current?.classList.add('is-fading-in');
          fadeInTimeout = window.setTimeout(() => lanternRef.current?.classList.remove('is-fading-in'), 700);
          isFading = false;
          animationFrame = requestAnimationFrame(animateLantern);
        }, 700);
        return;
      }

      currentTop -= isLooping ? 0.0875 : 0.2;
      lanternRef.current.style.top = `${currentTop}px`;

      animationFrame = requestAnimationFrame(animateLantern);
    };

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(fadeInTimeout);
      window.clearTimeout(glowTimeout);
      window.clearTimeout(ascentTimeout);
      window.clearTimeout(animationStartTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [lantern.id, lantern.phase, lantern.topOff, lantern.animationDelayMs, onFadeComplete]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLanternClick(lantern);
    }
  };

  return (
    <div
      className={`lantern lantern-${lantern.customization?.style || 'traditional'} lantern-glow-${lantern.customization?.glow || 'gold'} ${lantern.phase === 'looping' ? 'is-looping' : 'is-large'}${lantern.releaseSize === 'small' ? ' is-small-release' : ''}${lantern.featured ? ' is-featured' : ''}${lantern.isMine ? ' is-mine' : ''}${isFocused ? ' is-focused' : ''}${lantern.retiring ? ' is-retiring' : ''}`}
      ref={lanternRef}
      data-wish-id={String(lantern.id)}
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
          idPrefix={`lantern-${String(lantern.id).replace(/[^a-zA-Z0-9_-]/g, '')}`}
        />
      </div>
    </div>
  );
};

export default Lantern;