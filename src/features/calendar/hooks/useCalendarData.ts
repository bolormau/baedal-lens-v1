import { useMemo } from "react"
import type { ScanResult } from "@/types"
import type { CalendarMonth } from "../types/calendar.types"
import { buildCalendarMonth } from "../utils/calendarHelpers"

export function useCalendarData(orders: ScanResult[]) {
  const months = useMemo(() => {
    const now = new Date()
    const monthSet = new Set<string>()
    monthSet.add(`${now.getFullYear()}-${now.getMonth()}`)

    for (const o of orders) {
      const d = new Date(o.scannedAt)
      monthSet.add(`${d.getFullYear()}-${d.getMonth()}`)
    }

    const result: CalendarMonth[] = []
    for (const key of monthSet) {
      const [y, m] = key.split("-").map(Number)
      result.push(buildCalendarMonth(y, m, orders))
    }

    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [orders])

  function getMonth(year: number, month: number): CalendarMonth {
    return months.find((m) => m.year === year && m.month === month)
      ?? buildCalendarMonth(year, month, orders)
  }

  return { months, getMonth }
}
