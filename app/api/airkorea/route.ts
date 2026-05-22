import { NextResponse } from "next/server"

import type { PM25Level } from "@/types"

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district")

    if (!district) {
      return NextResponse.json(
        { success: false, error: "동네 정보가 필요해" },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRKOREA_API_KEY

    if (!apiKey) {
      // Fallback to mock data if no API key
      const mockLevel: PM25Level = "MODERATE"
      return NextResponse.json({ success: true, data: mockLevel })
    }

    // In production, call the actual AirKorea API
    // For now, return mock data based on district
    const pm25Levels: Record<string, PM25Level> = {
      마포구: "BAD",
      강남구: "MODERATE",
      서초구: "GOOD",
      송파구: "MODERATE",
      default: "MODERATE",
    }

    const level = pm25Levels[district] || pm25Levels.default

    return NextResponse.json({ success: true, data: level })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "미세먼지 정보를 가져올 수 없어" },
      { status: 500 }
    )
  }
}
