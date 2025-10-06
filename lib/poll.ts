interface PollOptions {
  interval?: number // Initial interval in ms
  maxInterval?: number // Maximum interval in ms
  timeout?: number // Total timeout in ms
  backoffMultiplier?: number // Multiplier for exponential backoff
}

interface PollResult<T> {
  data?: T
  error?: Error
  timedOut?: boolean
}

/**
 * Poll a function until it returns a truthy value or times out
 * Uses exponential backoff with jitter
 */
export async function poll<T>(
  fn: () => Promise<T | null | undefined>,
  shouldContinue: (result: T) => boolean,
  options: PollOptions = {},
): Promise<PollResult<T>> {
  const { interval = 1500, maxInterval = 6000, timeout = 90000, backoffMultiplier = 1.5 } = options

  const startTime = Date.now()
  let currentInterval = interval
  let attempts = 0

  while (Date.now() - startTime < timeout) {
    attempts++

    try {
      const result = await fn()

      if (result && !shouldContinue(result)) {
        return { data: result }
      }

      // Wait before next attempt with exponential backoff + jitter
      const jitter = Math.random() * 200 // 0-200ms jitter
      const waitTime = Math.min(currentInterval + jitter, maxInterval)

      await new Promise((resolve) => setTimeout(resolve, waitTime))

      // Increase interval for next iteration
      currentInterval = Math.min(currentInterval * backoffMultiplier, maxInterval)
    } catch (error) {
      console.error(`Poll attempt ${attempts} failed:`, error)
      return { error: error as Error }
    }
  }

  return { timedOut: true }
}

/**
 * Poll the Sora status endpoint until video is ready
 */
export async function pollVideoStatus(
  id: string,
  onProgress?: (status: string) => void,
): Promise<PollResult<{ videoUrl: string; type?: "video" | "image" }>> {
  return poll(
    async () => {
      const response = await fetch(`/api/sora/status?id=${id}`)
      if (!response.ok) {
        throw new Error("Failed to check status")
      }
      const data = await response.json()

      // Call progress callback
      if (onProgress && data.status) {
        onProgress(data.status)
      }

      return data
    },
    (result) => {
      // Continue polling if still processing
      return result.status === "queued" || result.status === "processing"
    },
    {
      interval: 1500,
      maxInterval: 6000,
      timeout: 90000,
    },
  )
}
