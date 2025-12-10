import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const Loading = ({ isLoading }) => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ["/menu/1.png", "/menu/2.png", "/menu/3.png", "/menu/4.png", "/menu/5.png"];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 1000); // เปลี่ยนทุก 1.2 วินาที

    return () => clearInterval(interval);
  }, [isLoading, icons]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-main/40 bg-grid-pattern backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Smooth icon */}
      <AnimatePresence mode="wait">
        <motion.img
          key={iconIndex}
          src={icons[iconIndex]}
          alt="loading icon"
          className="w-32 h-32 object-contain mb-6 drop-shadow-lg"
        />
      </AnimatePresence>

      {/* Smooth bouncing dots */}
      <div className="flex gap-2">
         <span className="loading loading-dots loading-xl"/>
            
      </div>
    </div>
  );
};
