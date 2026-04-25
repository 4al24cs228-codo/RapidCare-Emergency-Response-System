import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Ambulance } from 'lucide-react';

const CursorAmbulance = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 20);
      mouseY.set(e.clientY - 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      className="hidden md:flex flex-col items-center"
    >
      <motion.div 
        animate={{ 
          y: [0, -4, 0],
          rotate: [-2, 2, -2]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"
      >
        <Ambulance size={40} />
      </motion.div>
      <div className="flex gap-1 mt-1">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping delay-75" />
      </div>
    </motion.div>
  );
};

export default CursorAmbulance;
