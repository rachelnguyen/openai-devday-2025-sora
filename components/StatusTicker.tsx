"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

const STATUS_MESSAGES = [
  "Dreaming...",
  "Collecting stardust...",
  "Rendering tiny masterpiece...",
  "Polishing pixels...",
  "Stitching frames...",
  "Adding magic...",
  "Almost there...",
]

interface StatusTickerProps {
  status: "queued" | "processing"
}

export function StatusTicker({ status }: StatusTickerProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 animate-ping">
          <div className="h-full w-full rounded-full bg-primary/20" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-medium text-white/80"
          role="status"
          aria-live="polite"
        >
          {STATUS_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
