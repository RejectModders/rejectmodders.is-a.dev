import { NextRequest, NextResponse } from "next/server"

// Cache for 24 hours at the CDN/browser level
const CACHE_TTL = 60 * 60 * 24 // 24h in seconds

// Allowlist of trusted avatar hosts to prevent open-proxy abuse
const ALLOWED_HOSTS = [
  "avatars.githubusercontent.com",
  "github.com",
  "unavatar.io",
  "www.gravatar.com",
  "i.ytimg.com",
  "yt3.ggpht.com",
  "pbs.twimg.com",
  "cdn.discordapp.com",
  "i.imgur.com",
  "giffiles.alphacoders.com",
]

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  // Validate it's a real URL from an allowed host
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
    // next: { revalidate } makes Next.js cache this fetch result in the Data Cache
    // so the upstream host only gets hit once per TTL, not on every request
    const upstream = await fetch(url, {
      next: { revalidate: CACHE_TTL },
      headers: {
        "User-Agent": "rejectmodders.is-a.dev avatar-cache/1.0",
      },
    })

    if (!upstream.ok) {
      return new NextResponse("Avatar fetch failed", { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") ?? "image/png"
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`,
        "CDN-Cache-Control": `public, max-age=${CACHE_TTL}`,
        "Vary": "Accept",
      },
    })
  } catch {
    return new NextResponse("Failed to fetch avatar", { status: 502 })
  }
}

