import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function BackgroundMesh() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950 pointer-events-none">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-40 bg-indigo-600/30"
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 50, mass: 1 }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 bg-emerald-600/20"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 300,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 40, mass: 1.2 }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
}
