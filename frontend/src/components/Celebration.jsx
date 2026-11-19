import { useEffect } from 'react';

const colors = ['#ffd772', '#ff8e72', '#f49aaa', '#8ee2bc', '#9bd7ff', '#fff8e9'];
const bursts = [
  { x: 25, y: 34 },
  { x: 72, y: 27 },
  { x: 52, y: 48 }
];

const Celebration = ({ id, onComplete }) => {
  useEffect(() => {
    const timeout = window.setTimeout(() => onComplete(id), 1900);
    return () => window.clearTimeout(timeout);
  }, [id, onComplete]);

  return (
    <div className="celebration-layer" aria-hidden="true">
      {bursts.map((burst, burstIndex) => (
        <div
          key={`burst-${burstIndex}`}
          className="firework-burst"
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        >
          {Array.from({ length: 16 }, (_, index) => (
            <i
              key={index}
              className="firework-spark"
              style={{
                '--angle': `${index * 22.5}deg`,
                '--distance': `${48 + ((index * 13 + burstIndex * 17) % 72)}px`,
                '--spark-color': colors[(index + burstIndex) % colors.length],
                animationDelay: `${burstIndex * 90}ms`
              }}
            />
          ))}
        </div>
      ))}
      {Array.from({ length: 36 }, (_, index) => (
        <i
          key={`confetti-${index}`}
          className="confetti-piece"
          style={{
            '--confetti-left': `${(index * 37 + 11) % 100}%`,
            '--confetti-color': colors[index % colors.length],
            '--confetti-delay': `${(index * 29) % 520}ms`,
            '--confetti-duration': `${1050 + ((index * 47) % 700)}ms`,
            '--confetti-spin': `${index % 2 ? 540 : -540}deg`
          }}
        />
      ))}
    </div>
  );
};

export default Celebration;
