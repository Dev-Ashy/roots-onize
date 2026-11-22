'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Instances, Instance, Stars } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export type StoryState = { progress: number; revealed: number };

type InvitationSceneProps = {
  storyState: React.MutableRefObject<StoryState>;
  onReveal: () => void;
};

function EmberField() {
  const seeds = useMemo(() => Array.from({ length: 20 }, (_, index) => ({
    position: [
      ((index * 19) % 21) / 5 - 2,
      ((index * 11) % 27) / 6 - 2.2,
      ((index * 7) % 23) / 8 - 1.4,
    ] as [number, number, number],
    scale: 0.009 + (index % 3) * 0.004,
  })), []);

  return (
    <Instances limit={24} range={24}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#4d694c" transparent opacity={0.62} />
      {seeds.map((seed, index) => <Instance key={index} position={seed.position} scale={seed.scale} />)}
    </Instances>
  );
}

function Invitation({ storyState, onReveal }: InvitationSceneProps) {
  const group = useRef<THREE.Group>(null);
  const invitation = useRef<THREE.Group>(null);
  const ticket = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current || !invitation.current || !ticket.current) return;
    const { progress, revealed } = storyState.current;
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointerX * 0.22 + progress * 0.5, 3.2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointerY * 0.15 - progress * 0.08, 3.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, Math.sin(state.clock.elapsedTime * 0.6) * 0.08 - progress * 0.18, 2.6, delta);

    invitation.current.rotation.y = THREE.MathUtils.damp(invitation.current.rotation.y, progress * Math.PI * 0.34 + revealed * Math.PI * 0.72, 2.7, delta);
    invitation.current.rotation.z = THREE.MathUtils.damp(invitation.current.rotation.z, -progress * 0.12 - revealed * 0.08, 2.7, delta);
    invitation.current.position.x = THREE.MathUtils.damp(invitation.current.position.x, revealed * -1.52, 2.6, delta);
    invitation.current.scale.setScalar(THREE.MathUtils.damp(invitation.current.scale.x, 1 - revealed * 0.13 + (hovered ? 0.025 : 0), 3.2, delta));

    ticket.current.position.x = THREE.MathUtils.damp(ticket.current.position.x, 1.72 - revealed * 1.15, 2.6, delta);
    ticket.current.rotation.y = THREE.MathUtils.damp(ticket.current.rotation.y, -0.82 + revealed * 0.42, 2.6, delta);
    ticket.current.visible = progress > 0.42 || revealed > 0.02;
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.35}>
        <group
          ref={invitation}
          onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          onClick={(event) => { event.stopPropagation(); onReveal(); }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.15, 3.05, 0.16]} />
            <meshPhysicalMaterial color="#fff5d5" roughness={0.32} metalness={0.08} clearcoat={0.35} clearcoatRoughness={0.38} />
          </mesh>
          <mesh position={[0, 0, 0.092]}>
            <planeGeometry args={[1.84, 2.72]} />
            <meshStandardMaterial color="#faf7ef" roughness={0.72} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.98, 0.112]}>
            <planeGeometry args={[1.35, 0.012]} />
            <meshBasicMaterial color="#4d694c" transparent opacity={0.72} />
          </mesh>
          <mesh position={[0, -1.02, 0.112]}>
            <planeGeometry args={[1.35, 0.012]} />
            <meshBasicMaterial color="#4d694c" transparent opacity={0.72} />
          </mesh>
          <mesh position={[0, 0.04, 0.16]} rotation={[0, 0.15, 0]}>
            <torusGeometry args={[0.42, 0.025, 12, 64]} />
            <meshStandardMaterial color="#4d694c" metalness={0.18} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.04, 0.185]}>
            <sphereGeometry args={[0.24, 32, 16]} />
            <meshPhysicalMaterial color="#668264" metalness={0.18} roughness={0.28} clearcoat={0.45} />
          </mesh>
          <mesh position={[0, 0.04, 0.435]} scale={[0.5, 0.5, 0.5]}>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshBasicMaterial color="#fff5d5" />
          </mesh>
        </group>
      </Float>

      <group ref={ticket} position={[1.72, 0, -0.28]} rotation={[0, -0.82, 0]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[2.35, 1.42, 0.11]} />
          <meshPhysicalMaterial color="#4d694c" metalness={0.12} roughness={0.38} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[2.12, 1.18]} />
          <meshStandardMaterial color="#fff5d5" roughness={0.58} metalness={0.05} />
        </mesh>
        <mesh position={[-0.42, 0, 0.075]}>
          <planeGeometry args={[0.012, 0.85]} />
          <meshBasicMaterial color="#4d694c" transparent opacity={0.72} />
        </mesh>
        <mesh position={[0.43, 0, 0.075]}>
          <planeGeometry args={[0.012, 0.85]} />
          <meshBasicMaterial color="#4d694c" transparent opacity={0.72} />
        </mesh>
      </group>
      <EmberField />
    </group>
  );
}

function SceneContents(props: InvitationSceneProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null);

  useFrame((_, delta) => {
    if (!camera.current) return;
    const { progress, revealed } = props.storyState.current;
    camera.current.position.z = THREE.MathUtils.damp(camera.current.position.z, 6.2 - progress * 1.25 - revealed * 0.35, 2.2, delta);
    camera.current.position.x = THREE.MathUtils.damp(camera.current.position.x, progress * 0.3, 2.2, delta);
    camera.current.lookAt(progress * 0.12, 0, 0);
  });

  return (
    <>
      <perspectiveCamera ref={camera} position={[0, 0, 6.2]} fov={38} />
      <color attach="background" args={['#fff5d5']} />
      <fog attach="fog" args={['#fff5d5', 6, 14]} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <spotLight position={[2.8, 4.5, 4.8]} intensity={80} color="#fff7df" angle={0.42} penumbra={0.9} castShadow />
      <pointLight position={[-3.8, -1.8, 2.2]} intensity={28} color="#dfe7d7" />
      <pointLight position={[0, 0.4, 3.5]} intensity={12} color="#ffffff" />
      <Stars radius={8} depth={5} count={40} factor={0.75} saturation={0.08} fade speed={0.12} />
      <Invitation {...props} />
    </>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function InvitationScene(props: InvitationSceneProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number'
      && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4;
    const lowConcurrency = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4;
    setSupported(!reducedMotion && !lowMemory && !lowConcurrency && canUseWebGL());
  }, []);

  if (supported === false) {
    return (
      <div className="webgl-fallback" role="img" aria-label="ROOTS event invitation">
        <img src="/roots-logo.png" alt="" />
        <span>December 17 · Abuja</span>
      </div>
    );
  }

  return (
    <Canvas dpr={[1, 1]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <SceneContents {...props} />
    </Canvas>
  );
}
