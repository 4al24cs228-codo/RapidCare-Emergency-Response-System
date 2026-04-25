import React from 'react';
import { motion } from 'framer-motion';

const ECGWaveform = () => {
  // A path representing a BIGGER ECG wave
  const path = "M 0 50 L 40 50 L 50 20 L 60 80 L 70 50 L 100 50 L 110 0 L 130 100 L 140 50 L 170 50 L 180 40 L 190 60 L 200 50 L 240 50";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10 z-0">
      <div className="relative w-full h-[60vh]">
        <svg
          viewBox="0 0 240 100"
          className="absolute inset-0 w-[400%] h-full flex"
          preserveAspectRatio="none"
        >
          <motion.path
            d={path + " " + path.replace(/M 0/g, "L 240").replace(/L/g, "L") + " " + path.replace(/M 0/g, "L 480").replace(/L/g, "L")} 
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.5"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
        
        {/* Subtle fade edges */}
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
};

export default ECGWaveform;
