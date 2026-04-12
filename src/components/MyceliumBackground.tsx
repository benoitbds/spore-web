'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas mycelium/network animation.
 * Nodes connected by faint lines, gently drifting. No external libs.
 */
export default function MyceliumBackground({
  density = 0.5,
  className = '',
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    const setSize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    setSize();

    const count = Math.max(20, Math.floor((width * height) / 25000 * density));
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 1 + Math.random() * 1.5,
    }));

    const MAX_LINK = 140;

    function frame() {
      ctx!.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_LINK) {
            const alpha = (1 - dist / MAX_LINK) * 0.2;
            ctx!.strokeStyle = `rgba(16,185,129,${alpha.toFixed(3)})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx!.fillStyle = 'rgba(52, 211, 153, 0.6)';
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();

        // Drift
        n.x += n.vx;
        n.y += n.vy;

        // Bounce
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      raf = requestAnimationFrame(frame);
    }

    let raf = requestAnimationFrame(frame);
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      aria-hidden
    />
  );
}
