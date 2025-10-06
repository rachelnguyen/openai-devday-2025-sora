"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { PromptForm } from "@/components/PromptForm"
import { StatusTicker } from "@/components/StatusTicker"
import { VideoCard } from "@/components/VideoCard"
import { ShareMenu } from "@/components/ShareMenu"
import { pollVideoStatus } from "@/lib/poll"

// Dynamically import 3D scene with no SSR to avoid edge runtime issues
const MagicalScene3D = dynamic(
  () => import("@/components/MagicalScene3D").then((mod) => mod.MagicalScene3D),
  { 
    ssr: false,
    loading: () => null
  }
)

// Remove edge runtime - it's incompatible with React Three Fiber
// export const runtime = 'edge'

type AppState = "idle" | "generating" | "completed" | "error"
type MediaType = "video" | "image"
type StatusType = "queued" | "processing"

interface VideoGenerationResult {
  videoUrl?: string
  type?: MediaType
}

interface ErrorResult {
  message?: string
}

export default function Home() {
  // State management
  const [state, setState] = useState<AppState>("idle")
  const [prompt, setPrompt] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>("video")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusType>("queued")
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const inputRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Poll for video status
  const pollForVideo = useCallback(async (id: string) => {
    const result = await pollVideoStatus(id, (currentStatus) => {
      if (currentStatus === "queued" || currentStatus === "processing") {
        setStatus(currentStatus)
      }
    })

    if (result.data?.videoUrl) {
      setVideoUrl(result.data.videoUrl)
      setMediaType(result.data.type || "video")
      setState("completed")
    } else if (result.error) {
      setError(result.error.message || "Failed to generate video")
      setState("error")
    } else if (result.timedOut) {
      setError("Video generation timed out. Please try again.")
      setState("error")
    }
  }, [])

  // Check URL params on mount for shared videos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedPrompt = params.get("prompt")
    const sharedId = params.get("id")

    if (sharedPrompt && sharedId) {
      setPrompt(sharedPrompt)
      setVideoId(sharedId)
      setState("generating")
      pollForVideo(sharedId)
    }
  }, [pollForVideo])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (userPrompt: string) => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    // Reset state
    setPrompt(userPrompt)
    setState("generating")
    setError(null)
    setVideoUrl(null)
    setVideoId(null)
    setMediaType("video")
    setStatus("queued")

    try {
      const response = await fetch("/api/sora/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to start generation (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.id) {
        throw new Error("No video ID returned from server")
      }

      setVideoId(data.id)
      if (data.type) {
        setMediaType(data.type)
      }

      // Start polling
      await pollForVideo(data.id)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
      setState("error")
    }
  }, [pollForVideo])

  // Reset to initial state
  const handleDreamAgain = useCallback(() => {
    setState("idle")
    setPrompt("")
    setVideoUrl(null)
    setVideoId(null)
    setError(null)
    setMediaType("video")
    setStatus("queued")

    // Focus input after animation
    setTimeout(() => {
      inputRef.current?.querySelector("input")?.focus()
    }, 300)
  }, [])

  // Open share menu
  const handleShare = useCallback(() => {
    setShowShareMenu(true)
  }, [])

  // Download video/image
  const handleDownload = useCallback(async () => {
    if (!videoUrl) return

    setIsDownloading(true)

    try {
      // Fetch the video/image as a blob to handle CORS
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch media file: ${response.status}`)
      }

      const blob = await response.blob()
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement("a")
      link.href = blobUrl
      const extension = mediaType === "image" ? "png" : "mp4"
      link.download = `soradreams-${videoId || Date.now()}.${extension}`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (err) {
      console.error("Download error:", err)
      
      // Fallback: try direct download
      try {
        const link = document.createElement("a")
        link.href = videoUrl
        link.target = "_blank"
        const extension = mediaType === "image" ? "png" : "mp4"
        link.download = `soradreams-${videoId || Date.now()}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackErr) {
        console.error("Fallback download also failed:", fallbackErr)
        setError("Failed to download. Please try right-clicking the video and selecting 'Save as'")
      }
    } finally {
      setIsDownloading(false)
    }
  }, [videoUrl, mediaType, videoId])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0f1e3a] to-[#0b1830]">
      <MagicalScene3D />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-30" />

      {/* Decorative crosses */}
      <div className="fixed top-20 left-20 text-primary/10 text-2xl pointer-events-none" aria-hidden="true">
        +
      </div>
      <div className="fixed top-40 right-32 text-primary/10 text-2xl pointer-events-none" aria-hidden="true">
        +
      </div>
      <div className="fixed bottom-32 left-40 text-primary/10 text-2xl pointer-events-none" aria-hidden="true">
        +
      </div>
      <div className="fixed bottom-20 right-20 text-primary/10 text-2xl pointer-events-none" aria-hidden="true">
        +
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo/Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 text-center"
          >
            <h1 className="font-[family-name:var(--font-orbitron)] text-5xl font-bold tracking-tight text-balance text-white sm:text-6xl md:text-7xl">
              Sora<span className="text-primary">Dreams</span>
            </h1>
            <p className="text-lg text-white/80 text-balance sm:text-xl">
              Transform your imagination into motion. One sentence, infinite possibilities.
            </p>
          </motion.div>

          {/* Main Content Area */}
          <div className="mt-12 min-h-[400px]">
            <AnimatePresence mode="wait">
              {state === "idle" && (
                <div ref={inputRef} key="idle">
                  <PromptForm onSubmit={handleSubmit} />
                </div>
              )}

              {state === "generating" && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-center rounded-2xl glass p-12"
                >
                  <StatusTicker status={status} />
                </motion.div>
              )}

              {state === "completed" && videoUrl && (
                <VideoCard
                  key="completed"
                  videoUrl={videoUrl}
                  prompt={prompt}
                  onDreamAgain={handleDreamAgain}
                  onShare={handleShare}
                  onDownload={handleDownload}
                  type={mediaType}
                  isDownloading={isDownloading}
                />
              )}

              {state === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 rounded-2xl glass p-8 text-center"
                >
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-red-400">Oops! Something went wrong</p>
                    <p className="text-white/80">{error}</p>
                  </div>
                  <button
                    onClick={handleDreamAgain}
                    className="rounded-xl bg-gradient-to-r from-primary/80 to-primary px-6 py-3 font-semibold text-white transition-all hover:from-primary hover:to-primary/90 hover:scale-105 active:scale-95"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 pb-8 text-center text-sm text-white/50 space-y-4">
        <p>
          Powered by OpenAI Sora • Built for DevDay 2025 •{" "}
          <a
            href="https://x.com/racheltnguyen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors text-white/70 hover:text-white"
          >
            View Source
          </a>
        </p>
        <div className="flex items-center justify-center gap-6">
          <a 
            href="mailto:rachel.nguyen@gazefi.ai" 
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            rachel.nguyen@gazefi.ai
          </a>
          <div className="flex items-center gap-4">
            {/* X (Twitter) Icon */}
            <a
              href="https://x.com/racheltnguyen"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Twitter/X"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/60 group-hover:text-white transition-colors"
              >
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="currentColor"
                />
              </svg>
            </a>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com/in/nguyenrachel/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="LinkedIn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/60 group-hover:text-white transition-colors"
              >
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  fill="currentColor"
                />
              </svg>
            </a>

            {/* GitHub Icon */}
            <a
              href="https://x.com/racheltnguyen"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="GitHub"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/60 group-hover:text-white transition-colors"
              >
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && videoId && (
          <ShareMenu 
            prompt={prompt} 
            videoId={videoId} 
            onClose={() => setShowShareMenu(false)} 
          />
        )}
      </AnimatePresence>
    </main>
  )
}