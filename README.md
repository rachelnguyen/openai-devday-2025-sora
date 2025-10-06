# SoraDreams

A production-ready AI video generation web app powered by OpenAI Sora. Transform your imagination into motion with a single sentence.

## Features

- **AI Video Generation**: Generate 5-second videos from text prompts using OpenAI Sora
- **Beautiful UI**: Dark theme with glassmorphism, neon accents, and smooth animations
- **Real-time Status**: Live polling with animated status messages during generation
- **Share & Download**: Copy shareable links and download generated videos
- **Mock Mode**: Test the full experience with a demo video (no API key required)
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Accessible**: Keyboard navigation and screen reader support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: OpenAI Sora / Azure OpenAI

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key with Sora access (or use mock mode)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy the environment example:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. Configure your environment (see below)

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables


### Mock Mode (Recommended for Testing)

The app defaults to mock mode since the native OpenAI Sora API is not yet publicly available (as of 2025).

\`\`\`env
USE_SORA_MOCK=true
\`\`\`

This uses a demo video to simulate the full generation experience without requiring API credentials.

### Native OpenAI API (Future)

When the OpenAI Sora API becomes publicly available:

\`\`\`env
USE_SORA_MOCK=false
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### Azure OpenAI (Available Now)

If you have access to Azure OpenAI Sora preview:

\`\`\`env
USE_SORA_MOCK=false
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your_azure_api_key_here
AZURE_OPENAI_API_VERSION=2024-12-01-preview
\`\`\`

**Note**: The app automatically detects which API to use based on your configuration.

## API Status

As of 2025, the OpenAI Sora API is not yet publicly available. This app supports:

- **Mock Mode** (default): Uses a demo video for testing
- **Azure OpenAI**: For users with Azure OpenAI Sora preview access
- **Native OpenAI**: Ready for when the API becomes available

The API integration is centralized in `lib/sora.ts` for easy updates when endpoints change.

## Project Structure

\`\`\`
/app
  /api/sora
    /generate/route.ts    # Start video generation
    /status/route.ts      # Poll generation status
  layout.tsx              # Root layout with fonts
  page.tsx                # Main application page
  globals.css             # Global styles and theme

/components
  Particles.tsx           # Animated particle background
  PromptForm.tsx          # Input form for prompts
  StatusTicker.tsx        # Animated status messages
  VideoCard.tsx           # Glass card with video player
  ShareMenu.tsx           # Share and download actions

/lib
  sora.ts                 # Sora API client (OpenAI + Azure)
  poll.ts                 # Polling utility with backoff

/public
  demo.mp4                # Demo video for mock mode
\`\`\`

## API Routes

### POST /api/sora/generate
Start a new video generation job.

**Request:**
\`\`\`json
{
  "prompt": "a cat astronaut sipping boba on the moon"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "gen_abc123",
  "status": "queued"
}
\`\`\`

### GET /api/sora/status?id={id}
Check the status of a generation job.

**Response (processing):**
\`\`\`json
{
  "id": "gen_abc123",
  "status": "processing"
}
\`\`\`

**Response (completed):**
\`\`\`json
{
  "id": "gen_abc123",
  "status": "succeeded",
  "videoUrl": "https://..."
}
\`\`\`

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables (see above)
4. Deploy


## Troubleshooting

### "API request failed: 404"

This means the native OpenAI Sora API is not available. Solutions:

1. **Use Mock Mode** (recommended for testing):
   - Set `USE_SORA_MOCK=true` in your environment variables
   
2. **Use Azure OpenAI** (if you have access):
   - Configure Azure OpenAI credentials as shown above

3. **Wait for Public Release**:
   - The native OpenAI API will be supported automatically when available

### Video not playing

- Ensure your browser supports MP4 video playback
- Check browser console for errors
- Try a different browser (Chrome, Safari, Firefox)

## License

MIT

## Built for DevDay 2025

A delightful demo showcasing the magic of AI video generation.


## Author

Email: rachel.nguyen@gazefi.ai
X: https://x.com/racheltnguyen
Linkedin: https://www.linkedin.com/in/nguyenrachel/
Github: https://github.com/rachelnguyen