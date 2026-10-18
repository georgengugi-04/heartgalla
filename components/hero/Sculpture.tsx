"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * An abstract sculptural form: two interlaced knots, one clay-toned and one bronze. It is deliberately not modelled on
 * any specific object, pattern or tradition. It stands for material, weave and hand-work in general, so no
 * culturally specific or restricted form is used as decoration.
 */
function Form({ active }: { active: boolean }) {
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g || !active) return;
    // gentle response to the pointer, plus a very slow sway: no spinning
    const tx = state.pointer.y * 0.35;
    const ty = state.pointer.x * 0.5 + Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    g.rotation.x += (tx - g.rotation.x) * Math.min(1, dt * 2);
    g.rotation.y += (ty - g.rotation.y) * Math.min(1, dt * 2);
  });
  return (
    <group ref={group} rotation={[0.35, -0.5, 0]}>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 220, 28, 2, 3]} />
        <meshStandardMaterial color="#b1583a" roughness={0.78} metalness={0.05} />
      </mesh>
      <mesh scale={0.82} rotation={[Math.PI / 2, 0.4, 0]}>
        <torusKnotGeometry args={[1, 0.085, 260, 16, 3, 2]} />
        <meshStandardMaterial color="#b8974f" roughness={0.38} metalness={0.7} />
      </mesh>
    </group>
  );
}

export default function Sculpture({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <hemisphereLight args={["#f4efe6", "#17352c", 0.7]} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffe2b8" />
      <directionalLight position={[-4, -1, -2]} intensity={1.1} color="#5f8f7a" />
      <Form active={active} />
    </Canvas>
  );
}
