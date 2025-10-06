"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Copy, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareMenuProps {
  prompt: string
  videoId: string
  onClose: () => void
}

export function ShareMenu({ prompt, videoId, onClose }: ShareMenuProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}?prompt=${encodeURIComponent(prompt)}&id=${videoId}` : ""

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShareX = () => {
    const text = `Check out my AI-generated video: "${prompt}"`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-2xl glass p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Share Your Dream</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Close">
            ×
          </Button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleCopyLink}
            className="w-full justify-start gap-3 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleShareX}
            className="w-full justify-start gap-3 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10"
            variant="outline"
          >
            <Share2 className="h-5 w-5" />
            <span>Share on X</span>
          </Button>
        </div>

        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-white/60 break-all">{shareUrl}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
