'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 20000;

const particleFunctionCode = `
const speed = addControl("speed", "Rotation Speed", 0.1, 3, 0.3);
const spread = addControl("spread", "Spread", 20, 150, 120);
const intensity = addControl("intensity", "Intensity", 0.1, 2, 1.3);

const countDiv = count;
const iNum = i;
const tVal = time * speed;

const phi = iNum * 2.39996 + tVal;
const theta = (iNum / countDiv) * Math.PI * 2;

const rBase = spread * (0.4 + 0.3 * Math.sin(iNum * 0.005 + tVal * 0.3));

const tx = rBase * Math.sin(phi) * Math.cos(theta);
const ty = rBase * Math.sin(phi) * Math.sin(theta);
const tz = rBase * Math.cos(phi);

const waveX = Math.sin(tx * 0.05 + tVal) * 5;
const waveY = Math.cos(ty * 0.05 + tVal * 1.1) * 5;
const waveZ = Math.sin(tz * 0.05 + tVal * 0.9) * 5;

target.set(tx + waveX * intensity, ty + waveY * intensity, tz + waveZ * intensity);

const hue = (iNum / countDiv + tVal * 0.02) % 1.0;
const sat = 0.7 + 0.3 * Math.sin(phi * 2 + tVal);
const light = 0.6 + 0.4 * Math.sin(theta * 3 + tVal * 2);

color.setHSL(hue * 0.5 + 0.55, sat, light * intensity);
`;

function createParticleUpdater(code: string) {
  const controls: Record<string, number> = {};
  const addControl = (id: string, label: string, min: number, max: number, initial: number) => {
    controls[id] = initial;
    return controls[id];
  };
  const setInfo = () => {};
  const annotate = () => {};
  
  const fn = new Function('i', 'count', 'target', 'color', 'time', 'addControl', 'setInfo', 'annotate', code);
  
  return {
    update: (i: number, count: number, target: THREE.Vector3, color: THREE.Color, time: number) => {
      fn(i, count, target, color, time, addControl, setInfo, annotate);
    },
    getControls: () => controls,
  };
}

export default function NeuralBackground({ subtle = false, blurred = false }: { subtle?: boolean; blurred?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState({ speed: 1.0, spread: 60, intensity: 1.0 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const simSpeed = subtle ? 0.3 : 1.0;
    const baseOpacity = subtle ? 0.8 : (blurred ? 0.6 : 1.0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.002);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 0.5;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uOpacity: { value: baseOpacity },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uPixelRatio;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (96.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          float glow = exp(-dist * 3.0) * 0.5;
          
          vec3 finalColor = vColor + vColor * glow;
          gl_FragColor = vec4(finalColor, alpha * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const particleUpdater = createParticleUpdater(particleFunctionCode);

    const dummyTarget = new THREE.Vector3();
    const dummyColor = new THREE.Color();
    const clock = new THREE.Clock();
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / W - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * simSpeed;

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = Math.sin(t * 0.08) * 5 + mouse.x * 2;
      camera.position.y = Math.cos(t * 0.06) * 3 + mouse.y * 2;
      camera.position.z = 120 + Math.sin(t * 0.05) * 5;
      camera.lookAt(0, 0, 0);

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleUpdater.update(
          i,
          PARTICLE_COUNT,
          dummyTarget,
          dummyColor,
          t
        );

        posAttr.setXYZ(i, dummyTarget.x, dummyTarget.y, dummyTarget.z);
        
        const hsl = { h: 0, s: 0, l: 0 };
        dummyColor.getHSL(hsl);
        colAttr.setXYZ(i, dummyColor.r, dummyColor.g, dummyColor.b);
        
        const pulse = 1.5 + Math.sin(t * 2 + i * 0.01) * 0.5;
        sizeAttr.setX(i, pulse * (subtle ? 1 : 2));
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      material.uniforms.uTime.value = t;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [subtle, blurred]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    />
  );
}