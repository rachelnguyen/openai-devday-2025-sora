"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MagicalButton3D } from "./MagicalButton3D"

interface VideoCardProps {
  videoUrl: string
  prompt: string
  onDreamAgain: () => void
  onShare: () => void
  onDownload: () => void
  type?: "video" | "image" // Added type prop to handle both videos and images
  isDownloading?: boolean // Added isDownloading prop
}

export function VideoCard({
  videoUrl,
  prompt,
  onDreamAgain,
  onShare,
  onDownload,
  type = "video",
  isDownloading = false, // Added isDownloading prop with default
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full space-y-6"
    >
      {/* Video/Image Container */}
      <div className="group relative overflow-hidden rounded-2xl glass neon-glow-hover transition-all duration-300">
        {type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-square w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-4">
                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/20"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={toggleMute}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/20"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <img src={videoUrl || "/placeholder.svg"} alt={prompt} className="aspect-square w-full object-cover" />

            {/* Image Indicator Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-xl">
              <ImageIcon className="h-4 w-4 text-white" />
              <span className="text-xs font-medium text-white">Image</span>
            </div>
          </>
        )}

        {/* Prompt Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <p className="text-sm text-white text-balance line-clamp-2">{prompt}</p>
        </div>
      </div>

      {type === "image" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3"
        >
          <p className="text-sm text-cyan-300">
            Video generation is currently unavailable. Generated an image instead using DALL-E.
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <MagicalButton3D
          onClick={onDreamAgain}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary/80 to-primary px-6 py-3 font-semibold text-white hover:from-primary hover:to-primary/90 transition-all"
        >
          Dream Again
        </MagicalButton3D>
        <Button
          onClick={onShare}
          variant="outline"
          className="rounded-xl border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10"
        >
          Share
        </Button>
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="outline"
          className="rounded-xl border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Downloading...
            </span>
          ) : (
            "Download"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
