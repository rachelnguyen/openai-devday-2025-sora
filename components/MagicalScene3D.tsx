"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, Float, Sparkles } from "@react-three/drei"
import * as THREE from "three"

// Floating orbs with glow effect
function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null)

  const orbs = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10 - 5] as [
        number,
        number,
        number,
      ],
      scale: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.5 + 0.3,
      color: i % 3 === 0 ? "#38bdf8" : i % 3 === 1 ? "#60a5fa" : "#818cf8",
    }))
  }, [])

  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={orbsRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed} rotationIntensity={0.5} floatIntensity={2}>
          <mesh position={orb.position}>
            <sphereGeometry args={[orb.scale, 32, 32]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
            {/* Glow effect */}
            <mesh scale={1.5}>
              <sphereGeometry args={[orb.scale, 32, 32]} />
              <meshBasicMaterial color={orb.color} transparent opacity={0.1} side={THREE.BackSide} />
            </mesh>
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Animated rings
function CosmicRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.1
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={ringsRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, i * (Math.PI / 3)]}>
          <torusGeometry args={[5 + i * 2, 0.05, 16, 100]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Particle field with depth
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      const color = new THREE.Color(i % 3 === 0 ? "#38bdf8" : i % 3 === 1 ? "#60a5fa" : "#818cf8")
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function MagicalScene3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }} gl={{ alpha: true, antialias: true }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#818cf8" />

        {/* Background stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />

        {/* Magical sparkles */}
        <Sparkles count={100} scale={20} size={2} speed={0.3} opacity={0.4} color="#38bdf8" />

        {/* 3D Elements */}
        <FloatingOrbs />
        <CosmicRings />
        <ParticleField />
      </Canvas>
    </div>
  )
}
