'use client';

import { usePathname } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const SNIPPETS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript',
  'const', 'let', 'import', 'export',
  '<div>', '{}', '()', '=>',
  'npm', 'git', 'docker', 'sql'
];

function Fragment({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  const config = useMemo(() => ({
    speed: 1 + Math.random(),
    rotationIntensity: 0.5 + Math.random(),
    floatIntensity: 1 + Math.random(),
    delay: Math.random() * 2
  }), []);

  return (
    <Float 
      speed={config.speed} 
      rotationIntensity={config.rotationIntensity} 
      floatIntensity={config.floatIntensity}
    >
      <group position={position}>
        <Html
          transform
          distanceFactor={15}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{
              delay: config.delay,
              duration: 0.5,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            style={{
              color: color,
              fontSize: '24px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </motion.div>
        </Html>
      </group>
    </Float>
  );
}

export function FloatingCode() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      text: SNIPPETS[i % SNIPPETS.length],
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      ] as [number, number, number]
    }));
  }, []);
  
  if (pathname !== '/' || !mounted) return null;

  const color = resolvedTheme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, 
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {items.map((item, i) => (
          <Fragment 
            key={i} 
            text={item.text} 
            position={item.position}
            color={color}
          />
        ))}
      </Canvas>
    </motion.div>
  );
}


