'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadLinksPreset } from '@tsparticles/preset-links';
import type { Engine } from '@tsparticles/engine';

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadLinksPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      color: { value: ['#3b82f6', '#a855f7', '#22d3ee'] },
      links: { color: '#64748b', distance: 150, enable: true, opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.8, direction: 'none' as const, random: true, outModes: 'out' as const },
      number: { value: 80, density: { enable: true, area: 800 } },
      opacity: { value: 0.4 },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  if (!init) return null;

  return <Particles id="tsparticles" options={options} className="absolute inset-0 z-0 pointer-events-none" />;
}
