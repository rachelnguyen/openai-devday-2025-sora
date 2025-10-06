"use client"

import type React from "react"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { motion } from "framer-motion"
import * as THREE from "three"

// Magical particles orbiting the button
function OrbitingParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 30

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const radius = 2 + Math.random() * 0.5
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1
    positions[i * 3 + 2] = Math.sin(angle) * radius

    // Cyan to purple gradient
    colors[i * 3] = 0.4 + Math.random() * 0.6
    colors[i * 3 + 1] = 0.6 + Math.random() * 0.4
    colors[i * 3 + 2] = 1
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Pulsing glow rings
function GlowRings() {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (ring1Ref.current) {
      ring1Ref.current.scale.setScalar(1 + Math.sin(time * 2) * 0.2)
      ring1Ref.current.material.opacity = 0.3 + Math.sin(time * 2) * 0.2
    }

    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(1 + Math.sin(time * 2 + Math.PI / 3) * 0.2)
      ring2Ref.current.material.opacity = 0.3 + Math.sin(time * 2 + Math.PI / 3) * 0.2
    }

    if (ring3Ref.current) {
      ring3Ref.current.scale.setScalar(1 + Math.sin(time * 2 + (Math.PI * 2) / 3) * 0.2)
      ring3Ref.current.material.opacity = 0.3 + Math.sin(time * 2 + (Math.PI * 2) / 3) * 0.2
    }
  })

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.04, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.03, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Sparkle effects
function Sparkles() {
  const sparklesRef = useRef<THREE.Points>(null)
  const count = 50

  const positions = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    scales[i] = Math.random()
  }

  useFrame((state) => {
    if (sparklesRef.current) {
      const time = state.clock.elapsedTime
      const geometry = sparklesRef.current.geometry
      const scalesAttr = geometry.attributes.scale as THREE.BufferAttribute

      for (let i = 0; i < count; i++) {
        scalesAttr.array[i] = Math.abs(Math.sin(time * 2 + i * 0.5))
      }
      scalesAttr.needsUpdate = true
    }
  })

  return (
    <points ref={sparklesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-scale" count={count} array={scales} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Main 3D scene
function Scene() {
  return (
    <>
      <OrbitingParticles />
      <GlowRings />
      <Sparkles />
    </>
  )
}

interface MagicalButton3DProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function MagicalButton3D({ onClick, children, className }: MagicalButton3DProps) {
  return (
    <div className="relative flex-1">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </div>

      {/* Button with enhanced glow animation */}
      <motion.button
        onClick={onClick}
        className={className}
        animate={{
          boxShadow: [
            "0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)",
            "0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)",
            "0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.button>
    </div>
  )
}
