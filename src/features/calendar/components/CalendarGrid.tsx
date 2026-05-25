import { CalendarDayCell } from "./CalendarDayCell"
import type { CalendarDay } from "../types/calendar.types"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const

type Props = {
  calendarDays: CalendarDay[]
  onSelectDay: (day: CalendarDay) => void
}

export function CalendarGrid({ calendarDays, onSelectDay }: Props) {
  return (
    <div className="space-y-2">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1 text-center text-[11px] text-[#6B8C7A]">
            {wd}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <CalendarDayCell
            key={day.dateString}
            day={day}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  )
}
