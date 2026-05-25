import { IMPACT_CONFIG } from "../utils/calendarHelpers"
import type { DayImpactLevel } from "../types/calendar.types"

const LEVELS: DayImpactLevel[] = ["none", "low", "medium", "high", "critical"]

export function CalendarLegend() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {LEVELS.map((level) => {
        const cfg = IMPACT_CONFIG[level]
        return (
          <div
            key={level}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#FFFFFF] px-2.5 py-1 shadow-[0_1px_4px_rgba(45,158,107,0.06)]"
          >
            <span className="text-[10px]">{cfg.emoji}</span>
            <span className="text-[11px] text-[#6B8C7A] whitespace-nowrap">
              {cfg.label.split(" (")[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
