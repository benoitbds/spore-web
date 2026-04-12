'use client';

import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  text: string;
  highlight?: string;
  as?: 'h1' | 'h2';
  className?: string;
}

export default function AnimatedTitle({
  text,
  highlight,
  as: Tag = 'h1',
  className = '',
}: AnimatedTitleProps) {
  const words = text.split(' ');

  return (
    <Tag className={className}>
      {words.map((word, i) => {
        const isHighlight = highlight && word.toLowerCase().includes(highlight.toLowerCase());
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.8,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`inline-block whitespace-pre ${isHighlight ? 'text-gradient-bio' : ''}`}
          >
            {word}{' '}
          </motion.span>
        );
      })}
    </Tag>
  );
}
