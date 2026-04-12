'use client';

import { motion } from 'framer-motion';

interface DomainBridgeProps {
  domainA: string;
  domainB: string;
  title?: string;
  compact?: boolean;
}

export default function DomainBridge({
  domainA,
  domainB,
  title,
  compact = false,
}: DomainBridgeProps) {
  return (
    <div className={`relative ${compact ? 'py-6' : 'py-10 md:py-16'}`}>
      {/* The bridge line (SVG for animation) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-full overflow-visible"
          viewBox="0 0 800 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="bridge-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>
            <filter id="bridge-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d="M 80 30 Q 400 -20 720 30"
            fill="none"
            stroke="url(#bridge-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#bridge-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />

          {/* Traveling particle */}
          <motion.circle
            r="3"
            fill="#34d399"
            filter="url(#bridge-glow)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#bridge-path" />
            </animateMotion>
          </motion.circle>
          <path id="bridge-path" d="M 80 30 Q 400 -20 720 30" fill="none" />
        </svg>
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <DomainBadge name={domainA} accent="emerald" />

        {title && !compact && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden md:flex flex-1 flex-col items-center px-8 text-center"
          >
            <span className="mb-2 text-xs uppercase tracking-[0.25em] text-mist-500">
              hypothèse
            </span>
            <span className="font-display text-lg md:text-xl leading-snug text-mist-100">
              {title.length > 90 ? title.slice(0, 90) + '…' : title}
            </span>
          </motion.div>
        )}

        <DomainBadge name={domainB} accent="cyan" />
      </div>

      {title && (!compact || true) && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className={`${compact ? 'block' : 'md:hidden'} mt-6 text-center`}
        >
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-mist-500">
            hypothèse
          </span>
          <span className="font-display text-base leading-snug text-mist-100">
            {title}
          </span>
        </motion.div>
      )}
    </div>
  );
}

function DomainBadge({
  name,
  accent,
}: {
  name: string;
  accent: 'emerald' | 'cyan';
}) {
  const colors =
    accent === 'emerald'
      ? {
          border: 'border-emerald-bio/40',
          glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
          dot: 'bg-emerald-glow',
        }
      : {
          border: 'border-cyan-bio/40',
          glow: 'shadow-[0_0_40px_rgba(6,182,212,0.15)]',
          dot: 'bg-cyan-glow',
        };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative z-10 flex items-center gap-2 rounded-full border ${colors.border} ${colors.glow} bg-ink-800/80 px-4 py-2 backdrop-blur-sm`}
    >
      <span className={`h-2 w-2 rounded-full ${colors.dot} animate-pulse-slow`} />
      <span className="text-sm font-medium text-mist-100 whitespace-nowrap">{name}</span>
    </motion.div>
  );
}
