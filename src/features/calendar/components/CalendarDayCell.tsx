import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { IMPACT_CONFIG } from "../utils/calendarHelpers"
import type { CalendarDay } from "../types/calendar.types"

type Props = {
  day: CalendarDay
  onSelect: (day: CalendarDay) => void
}

export function CalendarDayCell({ day, onSelect }: Props) {
  const cfg = IMPACT_CONFIG[day.impactLevel]
  const hasOrders = day.orderCount > 0

  return (
    <button
      onClick={() => hasOrders && onSelect(day)}
      disabled={!hasOrders}
      aria-label={`${day.date.getDate()}일${hasOrders ? ` ${day.totalPlasticG}g` : ""}`}
      className={[
        "flex flex-col items-center justify-start gap-0.5 rounded-[12px] border px-0.5 py-1",
        "aspect-square w-full transition-all duration-200",
        hasOrders
          ? "cursor-pointer active:scale-95 hover:opacity-80"
          : "cursor-default",
      ].join(" ")}
      style={{
        backgroundColor: cfg.bgColor,
        borderColor: cfg.borderColor,
        borderWidth: "1px",
      }}
    >
      {/* Date number */}
      <div className="flex items-center justify-center">
        {day.isToday ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2D9E6B] text-[11px] font-bold text-white">
            {day.date.getDate()}
          </span>
        ) : (
          <span
            className={[
              "text-[11px] font-medium",
              !day.isCurrentMonth ? "opacity-30" : "",
            ].join(" ")}
            style={{ color: day.isCurrentMonth ? "#1A2E25" : "#6B8C7A" }}
          >
            {day.date.getDate()}
          </span>
        )}
      </div>

      {/* Lens character */}
      <div className={hasOrders ? "" : "opacity-20"}>
        <LensCharacter expression={cfg.lensExpression} size="micro" animate={false} />
      </div>

      {/* Plastic grams */}
      {hasOrders ? (
        <div className="flex flex-col items-center">
          <span
            className={[
              "text-[9px] leading-none",
              day.impactLevel === "critical" ? "font-bold" : "",
            ].join(" ")}
            style={{ color: cfg.textColor }}
          >
            {day.totalPlasticG}g
          </span>
          {day.hasUnrequested && (
            <span className="text-[8px] leading-none mt-0.5">👻</span>
          )}
        </div>
      ) : null}
    </button>
  )
}
