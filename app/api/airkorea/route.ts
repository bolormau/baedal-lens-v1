import { NextResponse } from "next/server"

import type { PM25Level } from "@/types"

function valueToLevel(value: number): PM25Level {
  if (value <= 15) return "GOOD"
  if (value <= 35) return "MODERATE"
  if (value <= 75) return "BAD"
  return "VERY_BAD"
}

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
      const mockLevel: PM25Level = "MODERATE"
      return NextResponse.json({ success: true, data: mockLevel })
    }

    const url = new URL(
      "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty"
    )
    url.searchParams.set("stationName", district)
    url.searchParams.set("dataTerm", "DAILY")
    url.searchParams.set("pageNo", "1")
    url.searchParams.set("numOfRows", "1")
    url.searchParams.set("returnType", "json")
    url.searchParams.set("serviceKey", apiKey)
    url.searchParams.set("ver", "1.0")

    const response = await fetch(url.toString())

    if (!response.ok) {
      return NextResponse.json({ success: true, data: "MODERATE" as PM25Level })
    }

    const data = await response.json()
    const pm25Raw = data?.response?.body?.items?.[0]?.pm25Value

    if (pm25Raw === undefined || pm25Raw === null || pm25Raw === "-") {
      return NextResponse.json({ success: true, data: "MODERATE" as PM25Level })
    }

    const pm25Num = Number(pm25Raw)
    if (isNaN(pm25Num)) {
      return NextResponse.json({ success: true, data: "MODERATE" as PM25Level })
    }

    const level = valueToLevel(pm25Num)
    return NextResponse.json({ success: true, data: level })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "미세먼지 정보를 가져올 수 없어" },
      { status: 500 }
    )
  }
}
