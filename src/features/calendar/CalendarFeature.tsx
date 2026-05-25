"use client"

import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { CalendarMonthHeader } from "./components/CalendarMonthHeader"
import { CalendarLegend } from "./components/CalendarLegend"
import { CalendarGrid } from "./components/CalendarGrid"
import { MonthSummaryCard } from "./components/MonthSummaryCard"
import { DayDetailSheet } from "./components/DayDetailSheet"
import { useCalendar } from "./hooks/useCalendar"
import { useCalendarData } from "./hooks/useCalendarData"
import type { ScanResult } from "@/types"

type Props = {
  orders: ScanResult[]
  userName: string
}

export function CalendarFeature({ orders, userName: _userName }: Props) {
  const now = new Date()
  const { currentYear, currentMonth, selectedDay, isSheetOpen, canGoNext, goToPrevMonth, goToNextMonth, selectDay, closeSheet } = useCalendar(now.getFullYear(), now.getMonth())
  const { getMonth } = useCalendarData(orders)

  const calMonth = getMonth(currentYear, currentMonth)

  // Find previous month data for comparison
  const prevMonthDate = currentMonth === 0
    ? { y: currentYear - 1, m: 11 }
    : { y: currentYear, m: currentMonth - 1 }
  const prevMonth = getMonth(prevMonthDate.y, prevMonthDate.m)
  const prevMonthG = prevMonth.totalOrders > 0 ? prevMonth.totalPlasticG : undefined

  if (orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F5F2] px-8 pb-24 text-center">
        <LensCharacter expression="sleeping" size="large" animate />
        <p className="text-[17px] font-medium text-[#1A2E25]">아직 배달 기록이 없어 😴</p>
        <p className="text-[13px] text-[#6B8C7A]">영수증을 스캔하면 캘린더에 나타나!</p>
        <Button asChild className="mt-2 h-12 w-full max-w-xs rounded-full bg-[#2D9E6B] text-[15px] font-medium text-white">
          <Link href="/scan">스캔하러 가기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24 px-4 py-4">
      {/* Page title */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[20px] font-semibold text-[#1A2E25]">배달 캘린더</p>
        <CalendarDays size={22} className="text-[#2D9E6B]" />
      </div>

      <div className="space-y-3">
        {/* Month nav */}
        <CalendarMonthHeader
          year={currentYear}
          month={currentMonth}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
          canGoNext={canGoNext}
        />

        {/* Legend */}
        <CalendarLegend />

        {/* Summary */}
        <MonthSummaryCard month={calMonth} prevMonthG={prevMonthG} />

        {/* Calendar grid */}
        <div className="rounded-[20px] bg-[#FFFFFF] p-3 shadow-[0_2px_12px_rgba(45,158,107,0.08)]">
          <CalendarGrid calendarDays={calMonth.days} onSelectDay={selectDay} />
        </div>
      </div>

      {/* Day detail sheet */}
      <DayDetailSheet day={selectedDay} isOpen={isSheetOpen} onClose={closeSheet} />
    </div>
  )
}
