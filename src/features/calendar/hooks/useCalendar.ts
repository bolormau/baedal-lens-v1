"use client"

import { useState } from "react"
import type { CalendarDay } from "../types/calendar.types"

export function useCalendar(initialYear: number, initialMonth: number) {
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const now = new Date()
  const canGoNext =
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth < now.getMonth())

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (!canGoNext) return
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function selectDay(day: CalendarDay) {
    if (day.orders.length === 0) return
    setSelectedDay(day)
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
    setSelectedDay(null)
  }

  return {
    currentYear,
    currentMonth,
    selectedDay,
    isSheetOpen,
    canGoNext,
    goToPrevMonth,
    goToNextMonth,
    selectDay,
    closeSheet,
  }
}
