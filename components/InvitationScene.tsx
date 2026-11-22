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
  const seeds = useMemo(() => Array.from({ length: 56 }, (_, index) => ({
    position: [
      ((index * 19) % 21) / 5 - 2,
      ((index * 11) % 27) / 6 - 2.2,
      ((index * 7) % 23) / 8 - 1.4,
    ] as [number, number, number],
    scale: 0.011 + (index % 4) * 0.006,
  })), []);

  return (
    <Instances limit={60} range={60}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#f7d277" transparent opacity={0.72} />
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
            <meshPhysicalMaterial color="#251912" roughness={0.28} metalness={0.45} clearcoat={0.65} clearcoatRoughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.092]}>
            <planeGeometry args={[1.84, 2.72]} />
            <meshStandardMaterial color="#332013" roughness={0.68} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.98, 0.112]}>
            <planeGeometry args={[1.35, 0.012]} />
            <meshBasicMaterial color="#e1af4d" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, -1.02, 0.112]}>
            <planeGeometry args={[1.35, 0.012]} />
            <meshBasicMaterial color="#e1af4d" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.04, 0.16]} rotation={[0, 0.15, 0]}>
            <torusGeometry args={[0.42, 0.025, 12, 64]} />
            <meshStandardMaterial color="#c99435" metalness={0.92} roughness={0.23} />
          </mesh>
          <mesh position={[0, 0.04, 0.185]}>
            <sphereGeometry args={[0.24, 32, 16]} />
            <meshPhysicalMaterial color="#d8a83e" metalness={0.78} roughness={0.19} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.04, 0.435]} scale={[0.5, 0.5, 0.5]}>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshBasicMaterial color="#fff2bc" />
          </mesh>
        </group>
      </Float>

      <group ref={ticket} position={[1.72, 0, -0.28]} rotation={[0, -0.82, 0]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[2.35, 1.42, 0.11]} />
          <meshPhysicalMaterial color="#d1a447" metalness={0.7} roughness={0.24} clearcoat={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[2.12, 1.18]} />
          <meshStandardMaterial color="#1a120d" roughness={0.58} metalness={0.3} />
        </mesh>
        <mesh position={[-0.42, 0, 0.075]}>
          <planeGeometry args={[0.012, 0.85]} />
          <meshBasicMaterial color="#d6a949" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.43, 0, 0.075]}>
          <planeGeometry args={[0.012, 0.85]} />
          <meshBasicMaterial color="#d6a949" transparent opacity={0.85} />
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
      <perspectiveCamera ref={camera} makeDefault position={[0, 0, 6.2]} fov={38} />
      <color attach="background" args={['#0c0908']} />
      <fog attach="fog" args={['#0c0908', 5, 13]} />
      <ambientLight intensity={0.25} color="#fedb92" />
      <spotLight position={[2.8, 4.5, 4.8]} intensity={180} color="#ffd68a" angle={0.42} penumbra={0.9} castShadow />
      <pointLight position={[-3.8, -1.8, 2.2]} intensity={35} color="#75422e" />
      <pointLight position={[0, 0.4, 3.5]} intensity={18} color="#ffde9b" />
      <Stars radius={8} depth={5} count={240} factor={1.4} saturation={0.15} fade speed={0.35} />
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

  useEffect(() => setSupported(canUseWebGL()), []);

  if (supported === false) {
    return <div className="webgl-fallback" role="img" aria-label="A Lumina invitation card"><span>L</span><small>WebGL is unavailable. Event details remain below.</small></div>;
  }

  return (
    <Canvas dpr={[1, 1.5]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <SceneContents {...props} />
    </Canvas>
  );
}
