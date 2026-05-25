"use server"

import { prisma } from "@/lib/db/prisma"
import { getDbUser } from "@/lib/auth/auth"
import { THRESHOLDS } from "@/lib/config"

import type { ApiResponse, ScanResult, ReportData, AnalyzerStatusItem, CategoryBreakdownItem, FoodCategory } from "@/types"
import type { Order } from "@prisma/client"

function toScanResult(order: Order): ScanResult {
  return {
    id: order.id,
    scannedAt: order.scannedAt.toISOString(),
    restaurant: order.restaurant,
    category: order.category,
    items: order.items as ScanResult["items"],
    plasticG: order.plasticG,
    actualG: order.actualG ?? undefined,
    unrequested: order.unrequested,
    weather: order.weather,
    pm25: order.pm25,
    usedMessage: order.usedMessage,
    lenses: order.lenses as ScanResult["lenses"],
  }
}

function computeAnalyzerStatus(orders: Order[]): AnalyzerStatusItem[] {
  const catCount = new Map<string, number>()
  for (const o of orders) catCount.set(o.category, (catCount.get(o.category) ?? 0) + 1)
  const topCat = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0]
  const topPct = orders.length > 0 && topCat ? Math.round((topCat[1] / orders.length) * 100) : 0

  const rainy = orders.filter((o) => o.weather === "RAINY").length
  const sunny = orders.filter((o) => o.weather === "SUNNY").length
  const multiplier = rainy > 0 && sunny > 0 ? (rainy / sunny).toFixed(1) : null

  const totalExtras = orders.reduce((s, o) => s + o.unrequested.length, 0)

  const patternDone = orders.length >= 2
  const correlDone = rainy > 0 && sunny > 0
  const escalDone = orders.length >= 4

  return [
    { done: patternDone, text: patternDone ? `패턴 감지 완료 — ${topCat?.[0] ?? ""}이 ${topPct}%` : `패턴 감지 중 — ${Math.max(0, 2 - orders.length)}번 더 필요해` },
    { done: correlDone, text: correlDone ? `날씨 상관관계 발견 — 비 오는 날 ${multiplier}배` : "날씨 데이터 수집 중" },
    { done: escalDone, text: escalDone ? "주문량 변화 추적 완료" : `추적 중 — ${Math.max(0, 4 - orders.length)}번 더 필요해` },
    { done: true, text: `비요청 항목 누적: 총 ${totalExtras}개 감지` },
  ]
}

async function getAIInsight(orders: ScanResult[], totalG: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return "더 많은 데이터가 쌓이면 AI 인사이트가 생성돼."
  const summary = orders.slice(0, 10)
    .map((o) => `${o.restaurant} (${o.category}): ${o.plasticG}g, 미요청 ${o.unrequested.length}개`)
    .join("\n")
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: `당신은 렌즈(Lens), 한국 배달 앱의 환경 데이터 분석가야. 검사 결과를 전달하는 의사처럼 — 차분하고, 직접적이고, 구체적이고, 미화하지 않는 — 사실적인 인사이트를 전달해.

톤 규칙:
- 사실만 말해. 의견 없음.
- 격려하는 말 금지: 잘했어, 훌륭해, 괜찮아, 좋아, 잘하고 있어 절대 사용 금지.
- 미화 금지: 나쁜 건 아니야 절대 사용 금지.
- 인사이트 끝에 😊 금지.
- 항상 구체적인 숫자 비교 포함.
- 나무일(tree-days) 또는 페트병 환산으로 끝내. 안심으로 끝내지 마.

나쁜 예: '비 오는 날 치킨이 좀 많긴 한데, 나쁜 건 아니야 😊'
좋은 예: '비 오는 날 치킨 주문이 3.2배야. 지난달 비 온 날 8일 동안 플라스틱 2,080g. 나무 한 그루가 219일 동안 흡수해야 하는 CO2야.'`,
        messages: [{ role: "user", content: `배달 기록 분석해줘. 한국어 2문장.\n총 ${totalG}g, ${orders.length}번 주문:\n${summary}` }],
      }),
    })
    if (!res.ok) return "인사이트를 생성하지 못했어."
    const data = await res.json() as { content?: Array<{ text: string }> }
    return data.content?.[0]?.text ?? "인사이트를 생성하지 못했어."
  } catch {
    return "인사이트를 생성하지 못했어."
  }
}

export async function getWeeklyReport(): Promise<ApiResponse<ReportData>> {
  try {
    const user = await getDbUser()
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { scannedAt: "desc" },
    })

    const scanResults = orders.map(toScanResult)
    const totalG = orders.reduce((s, o) => s + (o.actualG ?? o.plasticG), 0)

    const catMap = new Map<string, number>()
    for (const o of orders) catMap.set(o.category, (catMap.get(o.category) ?? 0) + o.plasticG)
    const categoryBreakdown: CategoryBreakdownItem[] = [...catMap.entries()]
      .map(([cat, g]) => ({ category: cat as FoodCategory, plasticG: g, percentage: totalG > 0 ? Math.round((g / totalG) * 100) : 0 }))
      .sort((a, b) => b.plasticG - a.plasticG)

    const now = new Date()
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7); weekStart.setHours(0, 0, 0, 0)
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const thisWeekG = orders.filter((o) => new Date(o.scannedAt) >= weekStart).reduce((s, o) => s + (o.actualG ?? o.plasticG), 0)
    const prevWeekG = orders.filter((o) => { const d = new Date(o.scannedAt); return d >= prevWeekStart && d < weekStart }).reduce((s, o) => s + (o.actualG ?? o.plasticG), 0)

    const analyzerStatus = computeAnalyzerStatus(orders)
    const canShowInsight = orders.length >= THRESHOLDS.scansForInsight
    const canShowMirror = orders.length >= THRESHOLDS.scansForMirror

    const insight = canShowInsight ? await getAIInsight(scanResults, totalG) : ""

    return { success: true, data: { orders: scanResults, totalG, insight, analyzerStatus, canShowInsight, canShowMirror, categoryBreakdown, thisWeekG, prevWeekG } }
  } catch {
    return { success: false, error: "리포트를 불러오지 못했어." }
  }
}

export async function getWeeklyOrders(
  startDate: string,
  endDate: string
): Promise<ApiResponse<ScanResult[]>> {
  try {
    const user = await getDbUser()
    const orders = await prisma.order.findMany({
      where: { userId: user.id, scannedAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      orderBy: { scannedAt: "desc" },
    })
    return { success: true, data: orders.map(toScanResult) }
  } catch {
    return { success: false, error: "리포트를 불러올 수 없어" }
  }
}
