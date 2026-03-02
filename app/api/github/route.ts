import { NextResponse } from "next/server"

export const revalidate = 300

const ORGS = ["disutils", "vulnradar"]
const USER = "RejectModders"
const SKIP = ["RejectModders", ".github", "LICENSE"]

interface GHRepo { id: number; fork: boolean; archived: boolean; name: string }

async function fetchJSON(url: string): Promise<GHRepo[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function GET() {
  try {
    const results = await Promise.all([
      fetchJSON(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100&type=public`),
      ...ORGS.map(org => fetchJSON(`https://api.github.com/orgs/${org}/repos?sort=updated&per_page=100&type=public`)),
    ])

    const all: GHRepo[] = results.flat()
    const seen = new Set<number>()
    const unique = all.filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return !r.fork && !SKIP.includes(r.name)
    })

    return NextResponse.json(unique, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
