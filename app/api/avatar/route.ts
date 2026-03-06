import { NextRequest, NextResponse } from "next/server"
import {
  AVATAR_ALLOWED_HOSTS,
  CACHE_DURATION_AVATAR,
  CACHE_DURATION_AVATAR_STALE,
  AllowedHost
} from "@/config/constants"

// Cache avatars for 2 hours — Next.js Data Cache keeps the upstream fetch result
export const revalidate = 7200

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

  if (!AVATAR_ALLOWED_HOSTS.includes(parsed.hostname as AllowedHost)) {
    return new NextResponse("Host not allowed", { status: 403 })
  }

  try {
    const upstream = await fetch(url, {
      next: { revalidate: CACHE_DURATION_AVATAR, tags: ["avatars"] },
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
        "Cache-Control": `public, max-age=${CACHE_DURATION_AVATAR}, s-maxage=${CACHE_DURATION_AVATAR}, stale-while-revalidate=${CACHE_DURATION_AVATAR_STALE}`,
        "Vary": "Accept",
      },
    })
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 })
  }
}

