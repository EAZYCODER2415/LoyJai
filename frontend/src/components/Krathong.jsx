import React, { useEffect, useRef } from 'react';
import { clampSceneValue, getRiverBounds, getRiverSpawnY } from '../sceneBounds.js';

const KrathongSprite = ({ accent = '#f49aaa', candle = '#f5be57', base = 'banana' }) => (
  <svg viewBox="0 0 240 190" role="img" aria-label="Illuminated Loy Krathong">
    <defs>
      <linearGradient id="krathongLeaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#27ad78" />
        <stop offset="1" stopColor="#08745c" />
      </linearGradient>
      <filter id="krathongGlow"><feGaussianBlur stdDeviation="4" /></filter>
    </defs>
    <ellipse cx="120" cy="150" rx="82" fill="#25a66f" opacity=".25" filter="url(#krathongGlow)" />
    {base === 'lotus' ? (
      <g fill={accent} opacity=".92">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse key={angle} cx="120" cy="86" rx="19" ry="48" transform={`rotate(${angle} 120 120)`} />
        ))}
      </g>
    ) : (
      <g fill="url(#krathongLeaf)">
        <path d="M38 138L65 72l27 76zM72 148l27-92 21 92zM120 150l22-92 28 92zM155 148l24-76 26 66zM120 150l-82-12 82-39 82 39z" />
        <path d="M20 140l100 38 100-38-100-31z" />
      </g>
    )}
    <rect x="94" y="132" width="52" height="42" rx="4" fill="#087b64" />
    <g>
      <rect x="88" y="74" width="12" height="68" rx="5" fill={candle} />
      <rect x="140" y="74" width="12" height="68" rx="5" fill="#f7f1d7" />
      <ellipse cx="94" cy="72" rx="8" ry="13" fill="#ff8a32" />
      <circle cx="94" cy="67" r="6" fill="#ffd66b" />
      <g stroke="#dfe6df" strokeWidth="4" strokeLinecap="round">
        <path d="M120 68v74M128 75v67" />
      </g>
    </g>
    <KrathongFlowers accent={accent} />
  </svg>
);

export const KrathongFlowers = ({ accent = '#f49aaa' }) => (
  <g>
    {[
      [72, 130],
      [168, 130],
      [120, 118]
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        {[0, 72, 144, 216, 288].map(angle => (
          <ellipse
            key={angle}
            cx={x}
            cy={y - 6}
            rx="4.5"
            ry="7"
            fill={accent}
            stroke="#fff8e9"
            strokeWidth="1"
            transform={`rotate(${angle} ${x} ${y})`}
          />
        ))}
        <circle cx={x} cy={y} r="3" fill="#ffd66b" />
      </g>
    ))}
  </g>
);

const getPerspectiveScale = (y) => Math.max(0.78, Math.min(1, 0.78 + (y / window.innerHeight) * 0.22));

const Krathong = ({ krathong, isFocused = false, onComplete, onShare }) => {
  const krathongRef = useRef(null);

  useEffect(() => {
    const element = krathongRef.current;
    if (!element) return undefined;

    let animationFrame;
    let fadeTimeout;
    let fadeInTimeout;
    let animationStartTimeout;
    const isNew = krathong.phase === 'new';
    const startTime = performance.now();
    let bounds = getRiverBounds();
    const startX = isNew ? 50 : krathong.xPosition ?? bounds.min;
    let baseY = clampSceneValue(krathong.topOff ?? getRiverSpawnY(), bounds.minY, bounds.maxY);
    let startedGlide = !isNew;
    let currentX = clampSceneValue(startX, bounds.min, bounds.max);
    let previousTime = startTime;

    const handleResize = () => {
      bounds = getRiverBounds();
      currentX = clampSceneValue(currentX, bounds.min, bounds.max);
      baseY = clampSceneValue(baseY, bounds.minY, bounds.maxY);
      element.style.left = `${currentX}%`;
      element.style.top = `${baseY}px`;
      element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(baseY)})`;
    };

    window.addEventListener('resize', handleResize);
    element.style.left = `${currentX}%`;
    element.style.top = `${baseY}px`;
    element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(baseY)})`;
    element.classList.add(isNew ? 'krathong-entering' : 'krathong-fade-in');

    const animate = (now) => {
      const elapsed = now - startTime;
      const frameScale = (now - previousTime) / (1000 / 60);
      previousTime = now;

      if (isNew && elapsed >= 6000) startedGlide = true;
      if (isNew && !startedGlide) {
        const lift = Math.min(elapsed / 6000, 1) * 42;
        const y = baseY - lift;
        element.style.top = `${y}px`;
        element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(y)})`;
      } else {
        currentX += ((0.1125 * frameScale) / window.innerWidth) * 100;
        const x = currentX;
        const glideElapsed = isNew ? elapsed - 6000 : elapsed;
        const y = (isNew ? baseY - 42 : baseY) + Math.sin(glideElapsed / 1120) * 9;
        element.style.left = `${x}%`;
        element.style.top = `${y}px`;
        element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(y)})`;

        if (x >= bounds.max) {
          element.classList.remove('krathong-entering', 'krathong-fade-in');
          element.classList.add('krathong-fade-out');
          fadeTimeout = window.setTimeout(() => {
            if (isNew) {
              onComplete(krathong.id);
              return;
            }

            bounds = getRiverBounds();
            currentX = bounds.min;
            baseY = getRiverSpawnY();
            previousTime = performance.now();
            element.style.left = `${currentX}%`;
            element.style.top = `${baseY}px`;
            element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(baseY)})`;
            element.classList.remove('krathong-fade-out');
            element.classList.add('krathong-fade-in');
            fadeInTimeout = window.setTimeout(() => {
              element.classList.remove('krathong-fade-in');
              if (isNew) {
                animationFrame = requestAnimationFrame(animate);
              } else {
                animationStartTimeout = window.setTimeout(() => {
                  animationFrame = requestAnimationFrame(animate);
                }, krathong.animationDelayMs || 0);
              }
            }, 700);
          }, 700);
          return;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(fadeInTimeout);
      window.clearTimeout(animationStartTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [krathong.id, krathong.phase, krathong.xPosition, krathong.topOff, krathong.animationDelayMs, onComplete]);

  const openWish = () => {
    if (onShare) onShare(krathong);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWish();
    }
  };

  return (
    <div
      ref={krathongRef}
      data-wish-id={String(krathong.id)}
      className={`krathong krathong-base-${krathong.customization?.base || 'banana'} krathong-incense-${krathong.customization?.incense || 'classic'} ${krathong.phase === 'new' ? 'is-new' : 'is-looping'}${krathong.featured ? ' is-featured' : ''}${krathong.isMine ? ' is-mine' : ''}${isFocused ? ' is-focused' : ''}${krathong.retiring ? ' is-retiring' : ''}`}
      role="button"
      aria-label={`Krathong by ${krathong.name}`}
      tabIndex="0"
      onClick={openWish}
      onKeyDown={handleKeyDown}
      style={{
        '--candle-color': krathong.customization?.candle === 'pink'
          ? '#f49aaa'
          : krathong.customization?.candle === 'white'
            ? '#f7f3df'
            : '#f5be57',
        '--accent-color': krathong.customization?.accent === 'gold'
          ? '#f5be57'
          : krathong.customization?.accent === 'white'
            ? '#f7f3df'
            : '#f49aaa'
      }}
    >
      <div className="krathong-sprite-art" aria-hidden="true">
        <KrathongSprite
          base={krathong.customization?.base}
          candle={krathong.customization?.candle === 'pink' ? '#f49aaa' : krathong.customization?.candle === 'white' ? '#f7f3df' : '#f5be57'}
          accent={krathong.customization?.accent === 'gold' ? '#f5be57' : krathong.customization?.accent === 'white' ? '#f7f3df' : '#f49aaa'}
        />
      </div>
    </div>
  );
};

export default Krathong;
