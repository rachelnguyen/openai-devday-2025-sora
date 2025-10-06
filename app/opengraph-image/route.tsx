import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prompt = searchParams.get("prompt") || "Transform your imagination into motion"

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b1220 0%, #0f1e3a 50%, #0b1830 100%)",
        fontFamily: "system-ui",
      }}
    >
      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          padding: "80px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "white",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Sora<span style={{ color: "#38bdf8" }}>Dreams</span>
        </h1>

        <p
          style={{
            fontSize: "32px",
            color: "rgba(255, 255, 255, 0.7)",
            margin: 0,
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {prompt}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <span>AI Video Generation</span>
          <span>•</span>
          <span>Powered by OpenAI Sora</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
