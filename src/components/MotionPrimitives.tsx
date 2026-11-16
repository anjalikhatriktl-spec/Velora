import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

export const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="h-[2px] w-full bg-[#B8935A] origin-left"
    />
  );
};

export const RevealSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}> = ({ children, className = '', delay = 0, id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 'some' }}
    transition={{ duration: 0.75, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.section>
);

export const FadeUp: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 'some' }}
    transition={{ duration: 0.7, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

export const EditorialImageReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, clipPath: 'inset(6% 0% 0% 0%)' }}
    whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
    viewport={{ once: true, amount: 'some' }}
    transition={{ duration: 0.9, delay, ease: LUXURY_EASE }}
    className={`overflow-hidden ${className}`}
  >
    <motion.div
      initial={{ scale: 1.07 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 1.1, delay, ease: LUXURY_EASE }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  </motion.div>
);

export const ParallaxImageFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  range?: [string, string];
}> = ({ children, className = '', range = ['-6%', '6%'] }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], range);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-[114%] -mt-[7%] will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 'some' }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.68, ease: LUXURY_EASE },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const PagePreloader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setVisible(false), prefersReduced ? 50 : 780);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-4%' }}
          transition={{ duration: 0.55, ease: LUXURY_EASE }}
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#141210] text-[#FAF8F4] pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="text-center space-y-3"
          >
            <p className="text-[11px] tracking-[0.36em] uppercase text-[#B8935A]">
              Haute Parfumerie
            </p>
            <span className="block font-serif text-3xl sm:text-5xl tracking-[0.28em] font-normal uppercase text-[#FAF8F4]">
              VELORA
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.12, ease: LUXURY_EASE }}
              className="h-[1px] w-24 bg-[#B8935A]/60 mx-auto origin-center"
            />
            <p className="text-xs tracking-[0.2em] uppercase text-[#E6DDD1]/80">
              Discover Your Signature Scent
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
