import { useEffect } from 'react';
import { motion } from 'framer-motion';

import Button from '../../components/common/Button';
import { OrangeDots, CodeBrackets } from '../../components/common/Decorations';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const float = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 — Page Not Found';
  }, []);

  return (
    <main className="bg-cream min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Floating decorations */}
      <motion.div
        variants={float}
        animate="animate"
        className="absolute top-24 left-8 md:left-24 opacity-20"
      >
        <CodeBrackets size={64} />
      </motion.div>
      <motion.div
        variants={float}
        animate="animate"
        style={{ animationDelay: '1s' }}
        className="absolute bottom-32 right-8 md:right-24 opacity-20"
      >
        <CodeBrackets size={80} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-40 right-16 md:right-48 opacity-15"
      >
        <CodeBrackets size={48} />
      </motion.div>

      <OrangeDots className="absolute top-20 right-12 hidden md:flex" count={4} size="lg" />
      <OrangeDots className="absolute bottom-20 left-12 hidden md:flex" count={3} size="md" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 text-center py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[260px] font-display font-bold leading-none text-black select-none"
          >
            OOPS!
          </motion.p>

          <motion.div variants={fadeUp} custom={1} className="flex justify-center mb-4">
            <OrangeDots count={3} size="lg" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={2}
            className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-4"
          >
            Page Not Found.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={3}
            className="text-medium-gray text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          <motion.div variants={fadeUp} custom={4}>
            <Button to="/" variant="primary" size="lg" arrow>
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
