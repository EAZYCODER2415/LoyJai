import React, { useEffect, useRef, useState } from 'react';

const KRATHONG_IMAGE = 'https://png.pngtree.com/png-clipart/20221130/original/pngtree-loy-krathong-fesival-clipart-transparent-background-png-image_8745179.png';

const getRiverSpawnY = () => window.innerHeight * (0.48 + Math.random() * 0.2);
const getPerspectiveScale = (y) => Math.max(0.78, Math.min(1, 0.78 + (y / window.innerHeight) * 0.22));

const Krathong = ({ krathong, onComplete }) => {
  const krathongRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const element = krathongRef.current;
    if (!element) return undefined;

    let animationFrame;
    let fadeTimeout;
    let fadeInTimeout;
    const isNew = krathong.phase === 'new';
    const startTime = performance.now();
    const startX = isNew ? 50 : -12;
    let baseY = getRiverSpawnY();
    let startedGlide = !isNew;
    let currentX = startX;
    let previousTime = startTime;

    element.style.left = `${startX}%`;
    element.style.top = `${baseY}px`;
    element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(baseY)})`;
    element.classList.add(isNew ? 'krathong-entering' : 'krathong-fade-in');

    const animate = (now) => {
      const elapsed = now - startTime;
      const frameScale = (now - previousTime) / (1000 / 60);
      previousTime = now;

      if (isNew && elapsed >= 1500) startedGlide = true;
      if (isNew && !startedGlide) {
        const lift = Math.min(elapsed / 1500, 1) * 42;
        const y = baseY - lift;
        element.style.top = `${y}px`;
        element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(y)})`;
      } else {
        currentX += ((0.45 * frameScale) / window.innerWidth) * 100;
        const x = currentX;
        const glideElapsed = isNew ? elapsed - 1500 : elapsed;
        const y = (isNew ? baseY - 42 : baseY) + Math.sin(glideElapsed / 280) * 9;
        element.style.left = `${x}%`;
        element.style.top = `${y}px`;
        element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(y)})`;

        if (x >= 112) {
          element.classList.remove('krathong-entering', 'krathong-fade-in');
          element.classList.add('krathong-fade-out');
          fadeTimeout = window.setTimeout(() => {
            if (isNew) {
              onComplete(krathong.id);
              return;
            }

            currentX = -12;
            baseY = getRiverSpawnY();
            previousTime = performance.now();
            element.style.left = `${currentX}%`;
            element.style.top = `${baseY}px`;
            element.style.transform = `translate(-50%, -50%) scale(${getPerspectiveScale(baseY)})`;
            element.classList.remove('krathong-fade-out');
            element.classList.add('krathong-fade-in');
            fadeInTimeout = window.setTimeout(() => {
              element.classList.remove('krathong-fade-in');
              animationFrame = requestAnimationFrame(animate);
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
    };
  }, [krathong.id, krathong.phase, onComplete]);

  const toggleDetails = () => {
    setShowDetails(previous => !previous);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDetails();
    }
  };

  return (
    <div
      ref={krathongRef}
      className={`krathong ${krathong.phase === 'new' ? 'is-new' : 'is-looping'}${showDetails ? ' is-details-visible' : ''}`}
      role="button"
      aria-label={`Krathong by ${krathong.name}`}
      tabIndex="0"
      aria-expanded={showDetails}
      onClick={toggleDetails}
      onKeyDown={handleKeyDown}
    >
      <img src={KRATHONG_IMAGE} alt="Loy Krathong floral raft" />
      <div className="krathong-wish">
        <h2>{krathong.name}</h2>
        <p>{krathong.wish}</p>
      </div>
    </div>
  );
};

export default Krathong;
