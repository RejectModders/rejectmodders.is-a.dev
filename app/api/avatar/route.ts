import { NextRequest, NextResponse } from "next/server"

// Default cache TTL — 24 hours
const DEFAULT_TTL = 60 * 60 * 24

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

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get("url")
  const ttlParam = searchParams.get("ttl")
  const ttl = ttlParam ? Math.max(10, Math.min(parseInt(ttlParam), DEFAULT_TTL)) : DEFAULT_TTL

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
      next: { revalidate: ttl },
      headers: {
        "User-Agent": "rejectmodders.is-a.dev image-cache/1.0",
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
        "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${ttl}`,
        "CDN-Cache-Control": `public, max-age=${ttl}`,
        "Vary": "Accept",
      },
    })
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 })
  }
}

