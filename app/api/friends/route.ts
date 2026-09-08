import { NextResponse } from "next/server"
import friendsData from "@/data/friends.json"
import { CACHE_DURATION_API, CACHE_DURATION_API_STALE } from "@/config/constants"

// Backs the terminal easter egg's `friends` command - just needs names, so it
// returns the raw list rather than paying for avatar resolution.
export async function GET() {
  const names = (friendsData as { name: string }[]).map(f => ({ name: f.name }))

  return NextResponse.json(names, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_DURATION_API}, stale-while-revalidate=${CACHE_DURATION_API_STALE}`,
    },
  })
}
