"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function ParticlesBackground() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 28 }, (_, idx) => ({
        id: idx,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.14),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(6,182,212,0.1),transparent_30%)]" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background:
              particle.id % 3 === 0
                ? "rgba(59,130,246,0.45)"
                : particle.id % 3 === 1
                ? "rgba(168,85,247,0.4)"
                : "rgba(34,211,238,0.45)",
            boxShadow:
              particle.id % 3 === 0
                ? "0 0 12px rgba(59,130,246,0.45)"
                : particle.id % 3 === 1
                ? "0 0 10px rgba(168,85,247,0.4)"
                : "0 0 10px rgba(34,211,238,0.45)",
          }}
          animate={{
            y: [0, -28, 0],
            opacity: [0.25, 0.8, 0.25],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}