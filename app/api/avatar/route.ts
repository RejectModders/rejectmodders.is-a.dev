import { NextRequest, NextResponse } from "next/server"

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
      next: { revalidate: false },
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
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
        "CDN-Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Vary": "Accept",
      },
    })
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 })
  }
}

