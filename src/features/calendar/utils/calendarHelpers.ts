import type { ScanResult } from "@/types"
import type { DayImpactLevel, ImpactConfig, CalendarDay, CalendarMonth } from "../types/calendar.types"

export const IMPACT_CONFIG: Record<DayImpactLevel, ImpactConfig> = {
  none: {
    level: "none",
    bgColor: "#F0F5F2",
    borderColor: "rgba(45,158,107,0.08)",
    textColor: "#6B8C7A",
    lensExpression: "sleeping",
    label: "주문 없음",
    emoji: "😴",
  },
  low: {
    level: "low",
    bgColor: "#E8F5EE",
    borderColor: "#2D9E6B",
    textColor: "#1A2E25",
    lensExpression: "curious",
    label: "낮음 (100g 미만)",
    emoji: "🟢",
  },
  medium: {
    level: "medium",
    bgColor: "#FFF8E8",
    borderColor: "#F5A623",
    textColor: "#1A2E25",
    lensExpression: "thinking",
    label: "보통 (100-249g)",
    emoji: "🟡",
  },
  high: {
    level: "high",
    bgColor: "#FFF0EE",
    borderColor: "#E8685A",
    textColor: "#1A2E25",
    lensExpression: "surprised",
    label: "높음 (250-399g)",
    emoji: "🔴",
  },
  critical: {
    level: "critical",
    bgColor: "#FFEBE8",
    borderColor: "#C0392B",
    textColor: "#C0392B",
    lensExpression: "surprised",
    label: "매우 높음 (400g+)",
    emoji: "🔴",
  },
}

export function getImpactLevel(plasticG: number): DayImpactLevel {
  if (plasticG === 0) return "none"
  if (plasticG < 100) return "low"
  if (plasticG < 250) return "medium"
  if (plasticG < 400) return "high"
  return "critical"
}

export function getDayImpactConfig(plasticG: number): ImpactConfig {
  return IMPACT_CONFIG[getImpactLevel(plasticG)]
}

export function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getKoreanMonthLabel(year: number, month: number): string {
  return `${year}년 ${month + 1}월`
}

export function calculateCO2(plasticG: number): number {
  return plasticG * 6
}

export function calculateTreeDays(plasticG: number): number {
  return Math.round((plasticG * 6) / 57)
}

export function calculateBottles(plasticG: number): number {
  return Math.round(plasticG / 31)
}

export function buildCalendarMonth(
  year: number,
  month: number,
  orders: ScanResult[]
): CalendarMonth {
  const today = new Date()
  const todayStr = formatDateString(today)

  // Build date range: first Sunday on/before 1st of month to fill grid
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const totalCells = Math.ceil((startOffset + lastOfMonth.getDate()) / 7) * 7

  // Group orders by dateString
  const ordersByDate = new Map<string, ScanResult[]>()
  for (const order of orders) {
    const d = new Date(order.scannedAt)
    const key = formatDateString(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    const existing = ordersByDate.get(key) ?? []
    existing.push(order)
    ordersByDate.set(key, existing)
  }

  const days: CalendarDay[] = []
  let monthTotalG = 0
  let monthTotalOrders = 0

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(year, month, 1 - startOffset + i)
    const dateString = formatDateString(cellDate)
    const isCurrentMonth = cellDate.getMonth() === month && cellDate.getFullYear() === year
    const isToday = dateString === todayStr
    const dayOrders = ordersByDate.get(dateString) ?? []
    const totalPlasticG = dayOrders.reduce((s, o) => s + o.plasticG, 0)
    const hasUnrequested = dayOrders.some((o) => o.unrequested.length > 0)

    if (isCurrentMonth) {
      monthTotalG += totalPlasticG
      monthTotalOrders += dayOrders.length
    }

    days.push({
      date: cellDate,
      dateString,
      isCurrentMonth,
      isToday,
      orders: dayOrders,
      totalPlasticG,
      impactLevel: dayOrders.length > 0 ? getImpactLevel(totalPlasticG) : "none",
      orderCount: dayOrders.length,
      hasUnrequested,
    })
  }

  // Worst and best days (only current month days with orders)
  const activeDays = days.filter((d) => d.isCurrentMonth && d.orderCount > 0)
  const worstDay = activeDays.reduce<CalendarDay | null>(
    (acc, d) => (acc === null || d.totalPlasticG > acc.totalPlasticG ? d : acc),
    null
  )
  const bestDay = activeDays.reduce<CalendarDay | null>(
    (acc, d) => (acc === null || d.totalPlasticG < acc.totalPlasticG ? d : acc),
    null
  )

  return { year, month, days, totalPlasticG: monthTotalG, totalOrders: monthTotalOrders, worstDay, bestDay }
}
