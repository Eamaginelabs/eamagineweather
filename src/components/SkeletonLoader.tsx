
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'grid' | 'button' | 'text' | 'weather-card';
  count?: number;
}

const shimmer = {
  hidden: { opacity: 0.3 },
  visible: { 
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'card',
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'weather-card':
        return (
          <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 ${className}`}>
            <motion.div variants={shimmer} className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="h-6 bg-white/20 rounded w-3/4"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
              
              {/* Temperature */}
              <div className="space-y-2">
                <div className="h-12 bg-white/20 rounded w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded w-full"></div>
                  <div className="h-3 bg-white/20 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded w-full"></div>
                  <div className="h-3 bg-white/20 rounded w-3/4"></div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="pt-3 border-t border-white/10">
                <div className="h-6 bg-white/20 rounded-full w-full"></div>
              </div>
            </motion.div>
          </div>
        );

      case 'button':
        return (
          <motion.div 
            variants={shimmer}
            className={`h-12 bg-white/20 rounded-lg ${className}`}
          />
        );

      case 'text':
        return (
          <motion.div 
            variants={shimmer}
            className={`h-4 bg-white/20 rounded ${className}`}
          />
        );

      case 'grid':
        return (
          <motion.div 
            variants={stagger}
            initial="hidden"
            animate="visible"
            className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 ${className}`}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                variants={shimmer}
                className="h-12 bg-white/20 rounded-lg"
              />
            ))}
          </motion.div>
        );

      default: // 'card'
        return (
          <motion.div 
            variants={shimmer}
            className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4 ${className}`}
          >
            <div className="h-6 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-5/6"></div>
          </motion.div>
        );
    }
  };

  if (count > 1) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i} variants={shimmer}>
            {renderSkeleton()}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
    >
      {renderSkeleton()}
    </motion.div>
  );
};

export default SkeletonLoader;