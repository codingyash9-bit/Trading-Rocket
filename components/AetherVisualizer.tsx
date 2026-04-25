'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SECTORS = [
  { name: 'FINANCE', color: '#60a5fa', pos: [0, 0, 0], sentiment: 0.8 },
  { name: 'IT', color: '#a78bfa', pos: [4, 2, -3], sentiment: 0.4 },
  { name: 'ENERGY', color: '#f59e0b', pos: [-4, -2, -2], sentiment: -0.2 },
  { name: 'AUTO', color: '#f43f5e', pos: [3, -3, 2], sentiment: 0.6 },
  { name: 'PHARMA', color: '#10b981', pos: [-3, 3, 1], sentiment: 0.1 },
];

function SectorNode({ name, color, position, sentiment }: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y += Math.sin(t + position[0]) * 0.005;
    mesh.current.rotation.y += 0.01;
  });

  const glowIntensity = (sentiment + 1) / 2;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <mesh ref={mesh}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={glowIntensity}
            transparent 
            opacity={0.8}
          />
        </mesh>
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="white"
          font="/fonts/monospace.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
}

function NeuralConnections() {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 500; i++) {
      p.push(Math.random() * 20 - 10);
    }
    return new Float32Array(p);
  }, []);

  return (
    <Points positions={points} stride={3}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function AetherVisualizer() {
  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden bg-slate-950/50 border border-white/5 relative">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AETHER SECTOR NEURAL MAP
        </h3>
        <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-widest">Real-time Sentiment Clustering</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {SECTORS.map((s) => (
          <SectorNode key={s.name} {...s} />
        ))}
        
        <NeuralConnections />
      </Canvas>
      
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <p className="text-[10px] text-white/20 font-mono uppercase">Interception Status</p>
        <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-tighter">Active Neural Sync</p>
      </div>
    </div>
  );
}
