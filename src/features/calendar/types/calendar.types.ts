import type { ScanResult, LensExpression } from "@/types"

export type DayImpactLevel =
  | "none"      // no orders
  | "low"       // plasticG < 100
  | "medium"    // plasticG 100-249
  | "high"      // plasticG 250-399
  | "critical"  // plasticG >= 400

export type CalendarDay = {
  date: Date
  dateString: string        // "2025-05-15"
  isCurrentMonth: boolean
  isToday: boolean
  orders: ScanResult[]
  totalPlasticG: number
  impactLevel: DayImpactLevel
  orderCount: number
  hasUnrequested: boolean
}

export type CalendarMonth = {
  year: number
  month: number             // 0-indexed
  days: CalendarDay[]
  totalPlasticG: number
  totalOrders: number
  worstDay: CalendarDay | null
  bestDay: CalendarDay | null  // day with orders but least plastic
}

export type ImpactConfig = {
  level: DayImpactLevel
  bgColor: string
  borderColor: string
  textColor: string
  lensExpression: LensExpression
  label: string
  emoji: string
}
