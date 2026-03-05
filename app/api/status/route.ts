import { NextResponse } from "next/server"

// Cache status for 10 minutes (600 seconds)
export const revalidate = 600

const BUILD_TIME = new Date().toISOString()

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      owner: "RejectModders",
      site: "rejectmodders.dev",
      build_time: BUILD_TIME,
      timestamp: new Date().toISOString(),
      uptime_since: BUILD_TIME,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    }
  )
}

