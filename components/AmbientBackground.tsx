'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export const AmbientBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate deterministic star dust particles on client mount to avoid hydration mismatch
    const stars: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.8 ? 2.5 : Math.random() > 0.4 ? 1.8 : 1.2,
      opacity: Math.random() * 0.7 + 0.2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(stars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-space-950">
      {/* Deep Space Background Mesh Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.18),rgba(255,255,255,0))]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />

      {/* Floating Anti-Gravity Nebula Orbs */}
      <motion.div
        animate={{
          x: [0, 35, -25, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full bg-violet-glow/10 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 45, -30, 0],
          scale: [1, 0.9, 1.12, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-cyan-neon/10 blur-[130px]"
      />

      <motion.div
        animate={{
          y: [0, -25, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-2/3 left-1/2 -translate-x-1/2 w-[36rem] h-[18rem] rounded-full bg-gradient-to-r from-violet-deep/20 via-cyan-neon/15 to-transparent blur-[140px]"
      />

      {/* Zero-gravity Star Dust particles */}
      {particles.map((star) => (
        <span
          key={star.id}
          className="particle-star"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Subtle Gravitational Vector Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};
