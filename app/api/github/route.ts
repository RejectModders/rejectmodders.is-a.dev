import { NextResponse } from "next/server"
import { GITHUB_USERNAME, GITHUB_API_URL, CACHE_DURATION_API, CACHE_DURATION_API_STALE } from "@/config/constants"

export const revalidate = 600 // 10 minutes
export const dynamic = "force-dynamic"

const ORGS = ["disutils", "vulnradar"]
const SKIP = ["RejectModders", ".github", "LICENSE"]

interface GHRepo { id: number; fork: boolean; archived: boolean; name: string }

async function fetchJSON(url: string): Promise<GHRepo[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    next: { revalidate: CACHE_DURATION_API, tags: ["github"] },
  })
  if (!res.ok) return []
  return res.json()
}

export async function GET() {
  try {
    const results = await Promise.all([
      fetchJSON(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=public`),
      ...ORGS.map(org => fetchJSON(`${GITHUB_API_URL}/orgs/${org}/repos?sort=updated&per_page=100&type=public`)),
    ])

    const all: GHRepo[] = results.flat()
    const seen = new Set<number>()
    const unique = all.filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return !r.fork && !SKIP.includes(r.name)
    })

    return NextResponse.json(unique, {
      headers: { 
        "Cache-Control": `public, s-maxage=${CACHE_DURATION_API}, stale-while-revalidate=${CACHE_DURATION_API_STALE}`,
        "CDN-Cache-Control": `public, s-maxage=${CACHE_DURATION_API}, stale-while-revalidate=${CACHE_DURATION_API_STALE}`,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${CACHE_DURATION_API}, stale-while-revalidate=${CACHE_DURATION_API_STALE}`,
      },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
