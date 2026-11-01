import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { heroState } from '../../lib/heroState';
import { canvasTex, mulberry, radialTex } from '../../lib/procedural';

export const FLOOR_Y = -1;
const bedHeight = (x, z) =>
  (Math.sin(x * 0.9) * Math.cos(z * 0.7) * 0.5 + Math.sin(x * 2.3 + z * 1.7) * 0.2 + Math.sin(z * 0.35 + 1) * 0.9) *
  THREE.MathUtils.smoothstep(Math.hypot(x, z), 3, 9) * 0.35;

/** Freshwater riverbed: pale sand with patches of darker silt, scattered small stones, a few algae-dusted boulders.
 *  The bed fades out at its edge so it melts into the page's water gradient. */
export function Seabed({ detail = 1 }) {
  const { geo, map, mask, rocks, stones } = useMemo(() => {
    const n = Math.round(80 * detail), r = mulberry(5);
    const geo = new THREE.PlaneGeometry(44, 44, n, n);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, bedHeight(p.getX(i), p.getZ(i)));
    geo.computeVertexNormals();

    const map = canvasTex(512, (g, s) => {
      g.fillStyle = '#8a8058'; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 46; i++) { // muddy patches
        const x = r() * s, y = r() * s, rad = 40 + r() * 110;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, 'rgba(58,44,26,.42)'); gr.addColorStop(1, 'rgba(58,44,26,0)');
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 6000; i++) { // sand grain
        const v = 70 + r() * 120 | 0;
        g.fillStyle = `rgba(${v},${v - 6},${v - 34},.35)`;
        g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
      }
    });
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(7, 7);
    const mask = radialTex('#fff', '#000', 0.42, false);

    const rocks = Array.from({ length: 5 }, () => {
      const g = new THREE.IcosahedronGeometry(1, 3);
      const q = g.attributes.position;
      for (let i = 0; i < q.count; i++) {
        const k = 1 + Math.sin(q.getX(i) * 3.1 + q.getY(i) * 2.3) * 0.12 + Math.sin(q.getZ(i) * 4.7) * 0.08;
        q.setXYZ(i, q.getX(i) * k, q.getY(i) * k, q.getZ(i) * k);
      }
      g.computeVertexNormals();
      const a = r() * Math.PI * 1.2 + Math.PI * 0.9, d = 6 + r() * 7, s = 0.45 + r() * 0.8;
      return { g, pos: [Math.cos(a) * d, FLOOR_Y + s * 0.12, Math.sin(a) * d - 3], sc: [s * 1.4, s * 0.65, s] };
    });

    const pal = ['#7a735c', '#968a6a', '#5c5b4c', '#a59a7a', '#6a6f55'];
    const cnt = Math.round(190 * detail);
    const stones = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), cnt);
    const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), eu = new THREE.Euler(), cc = new THREE.Color();
    for (let i = 0; i < cnt; i++) {
      const a = r() * 6.28, d = 3.3 + r() * 9, sz = 0.06 + r() * 0.2, x = Math.cos(a) * d, z = Math.sin(a) * d;
      qt.setFromEuler(eu.set(r() * 0.6, r() * 6.28, r() * 0.6));
      m4.compose(new THREE.Vector3(x, FLOOR_Y + bedHeight(x, z) + sz * 0.15, z), qt, new THREE.Vector3(sz * (0.9 + r() * 0.5), sz * 0.55, sz * (0.9 + r() * 0.4)));
      stones.setMatrixAt(i, m4);
      stones.setColorAt(i, cc.set(pal[(r() * pal.length) | 0]).offsetHSL(0, 0, (r() - 0.5) * 0.08));
    }
    return { geo, map, mask, rocks, stones };
  }, [detail]);

  return (
    <group>
      <mesh geometry={geo} position={[0, FLOOR_Y, 0]}>
        <meshStandardMaterial map={map} color="#b3aa80" roughness={1} alphaMap={mask} transparent />
      </mesh>
      <primitive object={stones} />
      {rocks.map((rk, i) => (
        <mesh key={i} geometry={rk.g} position={rk.pos} scale={rk.sc}>
          <meshStandardMaterial color="#4a5238" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// Vertex colours: dark at the root, brighter toward the tip, so plants glow where light reaches them.
function tint(g, c0, c1, h) {
  const p = g.attributes.position, col = [], a = new THREE.Color(c0), b = new THREE.Color(c1), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { c.copy(a).lerp(b, THREE.MathUtils.clamp(p.getY(i) / h, 0, 1)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

// A tuft of long, narrow, curving ribbons, like eelgrass or vallisneria.
function tuftGeo(blades, seed) {
  const r = mulberry(seed), parts = [];
  for (let i = 0; i < blades; i++) {
    const h = 0.6 + r() * 0.5, w = 0.05 + r() * 0.04, g = new THREE.PlaneGeometry(w, h, 1, 6);
    g.translate(0, h / 2, 0);
    const p = g.attributes.position, curve = 0.15 + r() * 0.4;
    for (let v = 0; v < p.count; v++) {
      const t = p.getY(v) / h;
      p.setX(v, p.getX(v) * (1 - t * 0.7) + t * t * curve);
    }
    g.rotateY(r() * Math.PI * 2); g.translate((r() - 0.5) * 0.12, 0, (r() - 0.5) * 0.12);
    parts.push(tint(g, '#2a3b16', '#93b43e', h));
  }
  return mergeGeometries(parts);
}

// A river plant (pondweed-like): slim stem with alternating oval leaves.
function pondweedGeo() {
  const parts = [], H = 2;
  parts.push(tint(new THREE.CylinderGeometry(0.012, 0.02, H, 5).translate(0, H / 2, 0), '#35491c', '#6f9132', H));
  for (let i = 0; i < 7; i++) {
    const y = 0.3 + i * 0.25, g = new THREE.CircleGeometry(0.5, 10);
    g.scale(0.16, 0.34, 1); g.translate(0, 0.17, 0); g.rotateX(-0.9);
    g.rotateY(i * 2.4); g.translate(0, y, 0);
    parts.push(tint(g, '#3a5320', '#8fb040', H));
  }
  return mergeGeometries(parts);
}

/** Submerged grasses and river plants. Foreground tufts are shaded dark for depth; all sway as one slow current. */
export function Plants({ count = 26 }) {
  const group = useRef();
  const geos = useMemo(() => [tuftGeo(12, 1), tuftGeo(9, 2), tuftGeo(14, 3), pondweedGeo()], []);
  const items = useMemo(() => {
    const r = mulberry(3), out = [];
    for (let i = 0; out.length < count && i < 400; i++) {
      const x = (r() - 0.5) * 22, z = -10 + r() * 17;
      if (Math.hypot(x, (z - 0.5) * 0.8) < 3.4) continue; // keep the animal's footprint clear
      const weed = r() < 0.22, near = z > 3;
      out.push({ x, z, g: weed ? 3 : (r() * 3) | 0, s: weed ? 1.1 + r() * 0.9 : 1 + r() * 1.7, ry: r() * 6.28, near, ph: x * 0.3 + z * 0.2 });
    }
    return out;
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      c.rotation.z = Math.sin(t * 0.55 + items[i].ph) * 0.09;
      c.rotation.x = Math.sin(t * 0.4 + items[i].ph * 1.3) * 0.05;
    });
  });

  return (
    <group ref={group}>
      {items.map((b, i) => (
        <group key={i} position={[b.x, FLOOR_Y + bedHeight(b.x, b.z) - 0.04, b.z]} rotation-y={b.ry} scale={b.s}>
          <mesh geometry={geos[b.g]}>
            <meshStandardMaterial vertexColors color={b.near ? '#4a5a3a' : '#ffffff'} side={THREE.DoubleSide} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Suspended silt and sunbeams drifting through the river water.

/** Suspended silt and organic particles (small, sharp, drifting with the current) plus a few large soft discs near the lens as fake depth of field. */
export function Particles({ count = 420, fade }) {
  const snow = useRef();
  const bokeh = useRef();
  const dot = useMemo(() => radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 0.1), []);
  const data = useMemo(() => {
    const r = mulberry(9);
    const pos = new Float32Array(count * 3), spd = new Float32Array(count), seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(r() - 0.5) * 22, -1 + (0.5 * r() * r() + 0.5 * r()) * 13, -8 + r() * 17], i * 3);
      spd[i] = 0.01 + r() * 0.04; seed[i] = r() * 6.28;
    }
    const b = new Float32Array(14 * 3);
    for (let i = 0; i < 14; i++) b.set([(r() - 0.5) * 14, r() * 6, 3 + r() * 5], i * 3);
    return { pos, spd, seed, b };
  }, [count]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, a = snow.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + dt * (data.spd[i] + Math.sin(t * 0.4 + data.seed[i]) * 0.03);
      if (y > 12) y = -1;
      let x = a.getX(i) + dt * (0.14 + Math.sin(t * 0.3 + data.seed[i]) * 0.08);
      if (x > 11) x = -11;
      a.setY(i, y); a.setX(i, x);
    }
    a.needsUpdate = true;
    if (fade) { const o = fade(); snow.current.material.opacity = o; bokeh.current.material.opacity = o * 0.14; }
    bokeh.current.rotation.y = Math.sin(t * 0.05) * 0.1;
    bokeh.current.position.y = Math.sin(t * 0.12) * 0.25;
  });

  return (
    <>
      <points ref={snow} frustumCulled={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.pos, 3]} /></bufferGeometry>
        <pointsMaterial map={dot} size={0.1} sizeAttenuation transparent depthWrite={false} opacity={0.55} color="#f1dfa4" />
      </points>
      <points ref={bokeh} frustumCulled={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.b, 3]} /></bufferGeometry>
        <pointsMaterial map={dot} size={1.3} sizeAttenuation transparent depthWrite={false} opacity={0.09} color="#ffd77a" fog={false} />
      </points>
    </>
  );
}

/** Slanted shafts of light from the surface: soft planes, no volumetrics, near-free to render. */
export function LightShafts({ count = 5 }) {
  const group = useRef();
  const tex = useMemo(() => canvasTex(128, (g, s) => {
    const h = g.createLinearGradient(0, 0, s, 0);
    h.addColorStop(0, 'rgba(255,255,255,0)'); h.addColorStop(0.5, 'rgba(255,255,255,1)'); h.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = h; g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = 'destination-in';
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.65, 'rgba(0,0,0,.35)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = v; g.fillRect(0, 0, s, s);
  }), []);
  const shafts = useMemo(() => {
    const r = mulberry(21);
    return Array.from({ length: count }, (_, i) => ({ x: -9 + i * (14 / count) + r() * 1.5, z: -5 - r() * 4, w: 1.6 + r() * 2.4, o: 0.06 + r() * 0.07, ph: r() * 6.28 }));
  }, [count]);

  useFrame(({ clock }) => {
    const boost = 1 + heroState.surface * 3 + heroState.detail * 0.6; // rays strengthen as we close in and as we rise
    group.current.children.forEach((c, i) => {
      c.rotation.z = -0.38 + Math.sin(clock.elapsedTime * 0.12 + shafts[i].ph) * 0.04;
      c.material.opacity = Math.min(0.5, shafts[i].o * boost);
    });
  });

  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, 4.5, s.z]} rotation={[0, 0, -0.38]} scale={[s.w, 22, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={tex} color="#ffe9a8" transparent opacity={s.o} depthWrite={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The underside of the water, seen from below. Not a flat colour: a Snell's-window falloff (bright cone straight up, dark beyond),
 * and ripple caustics defined in WORLD space, so the pattern visibly swells and sharpens as the camera travels up toward it.
 */
export function Surface() {
  const mesh = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uCream: { value: 0 } }), []);
  useFrame(({ clock }) => {
    const o = THREE.MathUtils.smoothstep(heroState.surface, 0.15, 0.6);
    uniforms.uTime.value = clock.elapsedTime; uniforms.uOpacity.value = o; uniforms.uCream.value = heroState.cream; mesh.current.visible = o > 0.005;
  });
  return (
    <mesh ref={mesh} position={[0, 12, -6]} rotation-x={Math.PI / 2} visible={false} renderOrder={5}>
      <planeGeometry args={[120, 120]} />
      <shaderMaterial
        transparent depthWrite={false} uniforms={uniforms}
        vertexShader="varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }"
        fragmentShader={`
          varying vec3 vW; uniform float uTime; uniform float uOpacity; uniform float uCream;
          float caustic(vec2 uv, float time){
            vec2 p = mod(uv*6.28318, 6.28318) - 250.; vec2 i = p; float c = 1.;
            for(int n=0;n<3;n++){ float t = time*(1.-(3.5/float(n+1)));
              i = p + vec2(cos(t-i.x)+sin(t+i.y), sin(t-i.y)+cos(t+i.x));
              c += 1./length(vec2(p.x/(sin(i.x+t)/.005), p.y/(cos(i.y+t)/.005))); }
            c /= 3.; c = 1.17 - pow(c, 1.4); return pow(abs(c), 6.); }
          void main(){
            vec3 d = normalize(vW - cameraPosition);
            float up = d.y;                                   // 1 = looking straight up
            float win = smoothstep(.55, .70, up);             // Snell's window (~49° half-angle)
            vec2 uv = vW.xz * .22;
            float rip = clamp(caustic(uv, uTime*.35)*.8 + caustic(uv*1.9 + 3.1, uTime*.5)*.5, 0., 1.);
            vec3 col = mix(vec3(.93,.76,.34), vec3(1.,.97,.82), rip);
            col = mix(vec3(.14,.22,.08), col, win);           // beyond the window: dark water reflecting the bed
            col += vec3(.14,.11,.05) * smoothstep(.85, 1., up);
            col = mix(col, vec3(.95,.86,.66), uCream);        // meets the tabletop colour exactly at the crossing
            gl_FragColor = vec4(col, uOpacity);
          }`}
      />
    </mesh>
  );
}
