import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Orbitron } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

// Get the base URL for metadata
const getBaseUrl = () => {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // For custom domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback to localhost
  return "http://localhost:3000"
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "SoraDreams - AI Video Generation",
  description:
    "Transform your imagination into motion. Generate stunning AI videos from text prompts powered by OpenAI Sora.",
  keywords: ["AI", "video generation", "Sora", "OpenAI", "text-to-video"],
  authors: [
    { name: "SoraDreams" }, 
    { name: "Rachel Nguyen", url: "mailto:rachel.nguyen@gazefi.ai" }
  ],
  openGraph: {
    title: "SoraDreams - AI Video Generation",
    description: "Transform your imagination into motion with AI-powered video generation.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SoraDreams - AI Video Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoraDreams - AI Video Generation",
    description: "Transform your imagination into motion with AI-powered video generation.",
    images: ["/opengraph-image"],
    creator: "@racheltnguyen",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}