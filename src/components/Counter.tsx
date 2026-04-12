'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export default function Counter({
  value,
  label,
  suffix = '',
  decimals = 0,
  duration = 2,
}: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    latest.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
      const unsub = rounded.on('change', (v) => setDisplay(v));
      return () => {
        controls.stop();
        unsub();
      };
    }
  }, [inView, value, duration, motionValue, rounded]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      <div className="font-display text-5xl md:text-7xl text-mist-100 tabular-nums">
        {display}
        {suffix && <span className="text-emerald-glow">{suffix}</span>}
      </div>
      <div className="mt-2 text-sm uppercase tracking-[0.2em] text-mist-500">
        {label}
      </div>
    </motion.div>
  );
}
