import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { heroState } from '../../lib/heroState';
import { canvasTex, mulberry } from '../../lib/procedural';
import { ProductRow } from './Products';

/**
 * Scene 03's 3D world: the water surface plane (y = 12) seen from above becomes a sunlit, limewashed table with dappled light.
 * The food photography itself lives in DOM layers above the canvas (see sections/Ingredient.jsx).
 */
export const FOOD_ORIGIN = new THREE.Vector3(0, 12, 0);

const CAUSTIC = `
  float caustic(vec2 uv, float time){
    vec2 p = mod(uv*6.28318, 6.28318) - 250.; vec2 i = p; float c = 1.;
    for(int n=0;n<3;n++){ float t = time*(1.-(3.5/float(n+1)));
      i = p + vec2(cos(t-i.x)+sin(t+i.y), sin(t-i.y)+cos(t+i.x));
      c += 1./length(vec2(p.x/(sin(i.x+t)/.005), p.y/(cos(i.y+t)/.005))); }
    c /= 3.; c = 1.17 - pow(c, 1.4); return pow(abs(c), 6.); }`;

/** Limewashed plaster/stone: warm cream with soft mottling. */
function Table() {
  const tex = useMemo(() => {
    const r = mulberry(77);
    const t = canvasTex(512, (g, s) => {
      g.fillStyle = '#f1e2c2'; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 70; i++) {
        const x = r() * s, y = r() * s, rad = 40 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, r() > 0.5 ? 'rgba(196,160,98,.10)' : 'rgba(255,250,235,.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(120,95,60,.06)'; g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(22, 22); t.anisotropy = 4;
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={tex} roughness={0.92} />
    </mesh>
  );
}

/** The water's rippled light, carried over as dappled sunlight on the table. Same caustic pattern as the surface above it. */
function Dapple() {
  const u = useMemo(() => ({ uTime: { value: 0 }, uA: { value: 0 } }), []);
  useFrame(({ clock }) => { u.uTime.value = clock.elapsedTime; u.uA.value = heroState.food * (0.22 + 0.22 * heroState.invite); });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} renderOrder={3}>
      <planeGeometry args={[60, 60]} />
      <shaderMaterial
        transparent depthWrite={false} uniforms={u}
        vertexShader="varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }"
        fragmentShader={`varying vec3 vW; uniform float uTime; uniform float uA; ${CAUSTIC}
          void main(){ float v = clamp(caustic(vW.xz*.12, uTime*.25), 0., 1.);
            gl_FragColor = vec4(1., .93, .66, v*uA*smoothstep(26., 6., length(vW.xz))); }`}
      />
    </mesh>
  );
}

/** Scene 05: the table turns deep forest green (a translucent layer over the cream), so the dappled golden light reads like the water again. */
function ForestFloor() {
  const m = useRef();
  useFrame(() => { m.current.opacity = heroState.invite; });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} receiveShadow renderOrder={1}>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial ref={m} color="#174A3A" roughness={0.9} transparent opacity={0} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

/** Warm natural sunlight, low from the upper left. */
export function FoodSun({ full }) {
  const sun = useRef(), fill = useRef();
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const t = sun.current.target; t.position.copy(FOOD_ORIGIN); scene.add(t);
    return () => { scene.remove(t); };
  }, [scene]);
  const gold = useMemo(() => new THREE.Color('#ffe3b0'), []), deep = useMemo(() => new THREE.Color('#ffc874'), []);
  useFrame(() => { const f = heroState.food, inv = heroState.invite; sun.current.intensity = 3.2 * f * (1 - 0.4 * inv); sun.current.color.copy(gold).lerp(deep, inv); fill.current.intensity = 0.9 * f * (1 - 0.7 * inv); });
  return (
    <>
      <directionalLight
        ref={sun} position={[-6, 21, 5]} color="#ffe3b0" intensity={0} castShadow={full}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9}
        shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0005} shadow-normalBias={0.02}
      />
      <directionalLight ref={fill} position={[7, 15, -3]} color="#ffe0b0" intensity={0} />
    </>
  );
}

export function FoodSet({ full }) {
  const root = useRef();
  useFrame(() => { root.current.visible = heroState.food > 0.001; });
  return (
    <group ref={root} position={FOOD_ORIGIN} visible={false}>
      <Table />
      <ForestFloor />
      <Dapple />
      <ProductRow full={full} />
    </group>
  );
}
