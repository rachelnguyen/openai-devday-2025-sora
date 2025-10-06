import { type NextRequest, NextResponse } from "next/server"
import { startGeneration, validatePrompt } from "@/lib/sora"

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 10000 // 10 seconds
const MAX_REQUESTS = 1

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(ip)

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false
  }

  rateLimitMap.set(ip, now)

  // Clean up old entries
  if (rateLimitMap.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW
    for (const [key, value] of rateLimitMap.entries()) {
      if (value < cutoff) {
        rateLimitMap.delete(key)
      }
    }
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
    }

    // Parse request body
    const body = await request.json()
    const { prompt } = body

    // Validate prompt
    const validation = validatePrompt(prompt)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Start generation
    const result = await startGeneration(validation.sanitized!)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Generation error:", error)

    const message = error instanceof Error ? error.message : "Failed to start generation"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
