interface SoraGenerationRequest {
  prompt: string
  model?: string
  duration_seconds?: number
  size?: string
  format?: string
}

interface SoraGenerationResponse {
  id: string
  status: "queued" | "processing" | "succeeded" | "failed"
  output?: {
    url: string
  }
  error?: {
    message: string
  }
}

interface GenerationResult {
  id: string
  status: string
  type?: "video" | "image"
}

const USE_MOCK = process.env.USE_SORA_MOCK !== "false" // Default to true
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview"

// Determine which API to use
const USE_AZURE = !!(AZURE_ENDPOINT && AZURE_API_KEY)
const OPENAI_API_BASE = "https://api.openai.com/v1/video/generations"
const AZURE_API_BASE = AZURE_ENDPOINT
  ? `${AZURE_ENDPOINT}/openai/v1/video/generations/jobs?api-version=${AZURE_API_VERSION}`
  : ""

const DALLE_API_BASE = "https://api.openai.com/v1/images/generations"

/**
 * Generate an image using DALL-E as fallback
 */
async function generateImageFallback(prompt: string): Promise<GenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  console.log("[rn] Falling back to DALL-E image generation")

  try {
    const response = await fetch(DALLE_API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.trim(),
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `DALL-E API request failed: ${response.status}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E")
    }

    // Create a unique ID for this image generation
    const imageId = `dalle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store the image URL in memory for retrieval
    imageCache.set(imageId, imageUrl)

    return {
      id: imageId,
      status: "succeeded",
      type: "image",
    }
  } catch (error) {
    console.error("DALL-E generation error:", error)
    throw error
  }
}

const imageCache = new Map<string, string>()

/**
 * Start a new video generation job with DALL-E fallback
 */
export async function startGeneration(prompt: string): Promise<GenerationResult> {
  // Mock mode for development
  if (USE_MOCK) {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log("[rn] Using mock mode - generating demo video")
    return {
      id: mockId,
      status: "queued",
      type: "video",
    }
  }

  try {
    if (USE_AZURE) {
      const result = await startAzureGeneration(prompt)
      return { ...result, type: "video" }
    }

    // Try native OpenAI Sora API
    const result = await startOpenAIGeneration(prompt)
    return { ...result, type: "video" }
  } catch (error) {
    console.log("[rn] Sora API failed, falling back to DALL-E image generation")
    // Fallback to DALL-E image generation
    return await generateImageFallback(prompt)
  }
}

/**
 * Start generation using native OpenAI API
 */
async function startOpenAIGeneration(prompt: string): Promise<{ id: string; status: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const requestBody: SoraGenerationRequest = {
    model: "sora-1",
    prompt: prompt.trim(),
    duration_seconds: 5,
    size: "square",
    format: "mp4",
  }

  try {
    const response = await fetch(OPENAI_API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "The OpenAI Sora API is not yet publicly available. Please set USE_SORA_MOCK=true to use demo mode, or configure Azure OpenAI credentials.",
        )
      }
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API request failed: ${response.status}`)
    }

    const data: SoraGenerationResponse = await response.json()
    return {
      id: data.id,
      status: data.status,
    }
  } catch (error) {
    console.error("Sora generation error:", error)
    throw error
  }
}

/**
 * Start generation using Azure OpenAI API
 */
async function startAzureGeneration(prompt: string): Promise<{ id: string; status: string }> {
  if (!AZURE_API_KEY || !AZURE_ENDPOINT) {
    throw new Error("Azure OpenAI credentials are not configured")
  }

  const requestBody = {
    prompt: prompt.trim(),
    duration_seconds: 5,
    size: "square",
    format: "mp4",
  }

  try {
    const response = await fetch(AZURE_API_BASE, {
      method: "POST",
      headers: {
        "api-key": AZURE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Azure API request failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      status: "queued",
    }
  } catch (error) {
    console.error("Azure Sora generation error:", error)
    throw error
  }
}

/**
 * Check the status of a generation job
 */
export async function checkStatus(id: string): Promise<{
  id: string
  status: "queued" | "processing" | "succeeded" | "failed"
  videoUrl?: string
  error?: string
  type?: "video" | "image"
}> {
  if (id.startsWith("dalle_")) {
    const imageUrl = imageCache.get(id)
    if (imageUrl) {
      return {
        id,
        status: "succeeded",
        videoUrl: imageUrl, // Reuse videoUrl field for image URL
        type: "image",
      }
    }
    return {
      id,
      status: "failed",
      error: "Image not found",
      type: "image",
    }
  }

  // Mock mode - simulate processing then return demo video
  if (USE_MOCK) {
    // Simulate processing time (2-3 seconds)
    const createdAt = Number.parseInt(id.split("_")[1] || "0")
    const elapsed = Date.now() - createdAt

    if (elapsed < 2000) {
      return { id, status: "queued", type: "video" }
    } else if (elapsed < 3000) {
      return { id, status: "processing", type: "video" }
    } else {
      return {
        id,
        status: "succeeded",
        videoUrl: "https://pub-817e369ba858407788b831d759045d90.r2.dev/openai-devday-oct62025.mp4",
        type: "video",
      }
    }
  }

  if (USE_AZURE) {
    const result = await checkAzureStatus(id)
    return { ...result, type: "video" }
  }

  const result = await checkOpenAIStatus(id)
  return { ...result, type: "video" }
}

/**
 * Check status using native OpenAI API
 */
async function checkOpenAIStatus(id: string): Promise<{
  id: string
  status: "queued" | "processing" | "succeeded" | "failed"
  videoUrl?: string
  error?: string
}> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  try {
    const response = await fetch(`${OPENAI_API_BASE}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("The OpenAI Sora API is not yet publicly available. Please use mock mode or Azure OpenAI.")
      }
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API request failed: ${response.status}`)
    }

    const data: SoraGenerationResponse = await response.json()

    return {
      id: data.id,
      status: data.status,
      videoUrl: data.output?.url,
      error: data.error?.message,
    }
  } catch (error) {
    console.error("Sora status check error:", error)
    throw error
  }
}

/**
 * Check status using Azure OpenAI API
 */
async function checkAzureStatus(id: string): Promise<{
  id: string
  status: "queued" | "processing" | "succeeded" | "failed"
  videoUrl?: string
  error?: string
}> {
  if (!AZURE_API_KEY || !AZURE_ENDPOINT) {
    throw new Error("Azure OpenAI credentials are not configured")
  }

  try {
    const statusUrl = `${AZURE_ENDPOINT}/openai/v1/video/generations/jobs/${id}?api-version=${AZURE_API_VERSION}`
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "api-key": AZURE_API_KEY,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Azure API request failed: ${response.status}`)
    }

    const data = await response.json()

    // Map Azure status to our format
    let status: "queued" | "processing" | "succeeded" | "failed" = "processing"
    if (data.status === "notStarted") status = "queued"
    else if (data.status === "running") status = "processing"
    else if (data.status === "succeeded") status = "succeeded"
    else if (data.status === "failed") status = "failed"

    return {
      id: data.id,
      status,
      videoUrl: data.result?.url,
      error: data.error?.message,
    }
  } catch (error) {
    console.error("Azure status check error:", error)
    throw error
  }
}

/**
 * Validate and sanitize user prompt
 */
export function validatePrompt(prompt: string): {
  valid: boolean
  error?: string
  sanitized?: string
} {
  if (!prompt || typeof prompt !== "string") {
    return { valid: false, error: "Prompt is required" }
  }

  const trimmed = prompt.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: "Prompt cannot be empty" }
  }

  if (trimmed.length > 240) {
    return { valid: false, error: "Prompt must be 240 characters or less" }
  }

  // Strip HTML tags for security
  const sanitized = trimmed.replace(/<[^>]*>/g, "")

  return { valid: true, sanitized }
}
