'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const SNIPPETS = [
  'const', 'let', 'var', 'function', 'return',
  'import', 'export', 'from', 'async', 'await',
  'if', 'else', 'for', 'while', 'try', 'catch',
  'React', 'Next.js', 'TypeScript', '<div>',
  '{}', '[]', '()', '=>', '...', '&&', '||',
  'npm', 'yarn', 'git', 'docker', 'sql',
  'console.log', 'useEffect', 'useState'
];

function CodeFragment({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  const rotSpeed = useMemo(() => [
    (Math.random() - 0.5) * 0.01,
    (Math.random() - 0.5) * 0.01,
    (Math.random() - 0.5) * 0.01
  ], []);

  const meshRef = useRef<any>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setActive(true), Math.random() * 1000);
    return () => clearTimeout(timeout);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotSpeed[0];
      meshRef.current.rotation.y += rotSpeed[1];
      meshRef.current.rotation.z += rotSpeed[2];

      const targetScale = active ? 1 : 0;
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2);
      
      meshRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Text
        ref={meshRef}
        position={position}
        fontSize={0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={1}
        scale={[0, 0, 0]} 
      >
        {text}
      </Text>
    </Float>
  );
}

export function FloatingCode() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fragments = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      text: SNIPPETS[i % SNIPPETS.length],
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        Math.random() * 10 - 5
      ] as [number, number, number],
    }));
  }, []);

  if (!mounted) return null;

  const color = resolvedTheme === 'dark' ? '#475569' : '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.6,
        filter: 'blur(3px)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>

        <fog attach="fog" args={[resolvedTheme === 'dark' ? '#0f172a' : '#ffffff', 5, 25]} />
        {fragments.map((frag, i) => (
          <CodeFragment 
            key={i} 
            text={frag.text} 
            position={frag.position} 
            color={color} 
          />
        ))}
      </Canvas>
    </motion.div>
  );
}
