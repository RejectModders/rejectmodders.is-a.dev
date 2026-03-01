import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Log CSP violations server-side — swap for a real reporting service if needed
    console.warn("[CSP Violation]", JSON.stringify(body, null, 2))
  } catch {
    // ignore malformed bodies
  }

  return new NextResponse(null, { status: 204 })
}

// Browsers send CSP reports as application/csp-report or application/json
export const runtime = "edge"

