import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { heroState } from '../../../lib/heroState';
import { radialTex } from '../../../lib/procedural';
import Placeholder from './Placeholder';

/**
 * ── SWAP POINT ─────────────────────────────────────────────────────────────
 * To use a professionally modelled GLB, replace the body of <Model /> with:
 *
 *   const { scene } = useGLTF('/models/crayfish.glb');   // from @react-three/drei
 *   return <primitive object={scene} />;
 *
 * Contract the rest of the scene relies on: head toward +Z, +Y up, feet at y ≈ -1,
 * roughly 6.5 units long. Idle float, yaw, parallax and the contact shadow live below,
 * so they carry over untouched.
 */
function Model({ detail }) {
  return <Placeholder detail={detail} />;
}

function ContactShadow() {
  const tex = useMemo(() => radialTex('rgba(2,12,8,.95)', 'rgba(2,12,8,0)', 0.05), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.985, 0.1]} scale={[3.4, 7.6, 1]} renderOrder={1}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent opacity={0.75} depthWrite={false} fog={false} />
    </mesh>
  );
}

export default function Crayfish({ detail = 'high' }) {
  const yaw = useRef(), bob = useRef();
  const { size } = useThree();
  const portrait = THREE.MathUtils.clamp((1.2 - size.width / size.height) / 0.7, 0, 1);
  const baseYaw = THREE.MathUtils.lerp(1.0, 0.5, portrait);

  useFrame(({ clock }, dt) => {
    heroState.cray = yaw.current; // the camera rig frames poses in this group's local space
    const t = clock.elapsedTime;
    bob.current.position.y = Math.sin(t * 0.7) * 0.015;
    bob.current.rotation.z = Math.sin(t * 0.5) * 0.012;
    const target = baseYaw + heroState.px * 0.16;
    yaw.current.rotation.y += (target - yaw.current.rotation.y) * (1 - Math.exp(-dt * 2.5));
  });

  return (
    <group ref={yaw} rotation={[0, baseYaw, 0]}>
      <ContactShadow />
      <group ref={bob}>
        <Model detail={detail} />
      </group>
    </group>
  );
}
