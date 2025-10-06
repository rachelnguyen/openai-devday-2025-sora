"use client"

import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromptFormProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
}

const DEFAULT_PROMPTS = [
  "Developers assembling glowing open models like constellations in a digital sky.",
  "A futuristic pavilion filled with holographic code blocks connecting themselves.",
  "Artists and coders painting with light as AI shapes vivid worlds around them.",
  "A neon theater where Sora dreams in motion, ImageGen sketches the scene, and Codex writes the story.",
  "An AI orchestra performing with brushes of color, code, and sound on a glowing stage.",
  "Floating data orbs measuring AI agents as they learn and evolve in real time.",
  "An elegant control room where interactive AI agents visualize their own progress through shimmering metrics.",
  "A panoramic shot of OpenAI DevDay 2025 — glowing booths, curious minds, and AI dreams flickering across holographic screens.",
]

export function PromptForm({ onSubmit, disabled }: PromptFormProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim())
    }
  }

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="w-full space-y-6"
    >
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/80">Try these DevDay 2025 prompts:</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DEFAULT_PROMPTS.map((defaultPrompt, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => handlePromptSelect(defaultPrompt)}
              disabled={disabled}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-white/85 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative z-10 line-clamp-3">{defaultPrompt}</div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your dream... (e.g., a cat astronaut sipping boba on the moon)"
          disabled={disabled}
          maxLength={240}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white placeholder:text-white/50 backdrop-blur-xl transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Video prompt"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/50">{prompt.length}/240</div>
      </div>

      <Button
        type="submit"
        disabled={disabled || !prompt.trim()}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary/80 to-primary px-8 py-6 text-lg font-semibold text-white transition-all hover:from-primary hover:to-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          {disabled ? "Dreaming..." : "Generate Dream"}
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </Button>

      <p className="text-center text-sm text-white/60">Your prompt will be transformed into a 5-second video</p>
    </motion.form>
  )
}
