import { type NextRequest, NextResponse } from "next/server"
import { checkStatus } from "@/lib/sora"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing generation ID" }, { status: 400 })
    }

    // Check status
    const result = await checkStatus(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Status check error:", error)

    const message = error instanceof Error ? error.message : "Failed to check status"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
