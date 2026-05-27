import React, { useMemo } from 'react';
import './Particles.css';

const Particles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 8,
        size: 4 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="hero-particle"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.dur}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
