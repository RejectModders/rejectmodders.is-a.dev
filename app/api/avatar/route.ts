import { NextRequest, NextResponse } from "next/server"

// Cache avatars for 2 hours — Next.js Data Cache keeps the upstream fetch result
export const revalidate = 7200

// Allowlist of trusted hosts to prevent open-proxy abuse
const ALLOWED_HOSTS = [
  // GitHub avatars
  "avatars.githubusercontent.com",
  "github.com",
  // Social avatars
  "unavatar.io",
  "www.gravatar.com",
  "pbs.twimg.com",
  "cdn.discordapp.com",
  // YouTube thumbnails
  "i.ytimg.com",
  "yt3.ggpht.com",
  // Image hosts
  "i.imgur.com",
  "giffiles.alphacoders.com",
  // Spotify stats cards
  "spotify-github-profile.kittinanx.com",
  "spotify-recently-played-readme.vercel.app",
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new NextResponse("Host not allowed", { status: 403 })
  }

  try {
    const upstream = await fetch(url, {
      // Cache the upstream response in Next.js Data Cache for 2 hours.
      // This means the actual outbound HTTP request fires at most once per
      // 2-hour window — subsequent requests are served from the cache.
      next: { revalidate: 7200, tags: ["avatars"] },
      headers: {
        "User-Agent": "rejectmodders.dev image-cache/1.0",
      },
    })

    if (!upstream.ok) {
      return new NextResponse("Upstream fetch failed", { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") ?? "image/png"
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Tell the browser (and CDN) to cache the response for 2 hours,
        // and serve stale for up to 4 hours while revalidating in the background.
        "Cache-Control": "public, max-age=7200, s-maxage=7200, stale-while-revalidate=14400",
        "Vary": "Accept",
      },
    })
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 })
  }
}

