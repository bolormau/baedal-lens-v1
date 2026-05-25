import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { formatPlasticWeight } from "@/lib/formatters"
import { calculateBottles, calculateTreeDays } from "../utils/calendarHelpers"
import type { CalendarMonth } from "../types/calendar.types"

type Props = {
  month: CalendarMonth
  prevMonthG?: number
}

export function MonthSummaryCard({ month, prevMonthG }: Props) {
  const bottles = calculateBottles(month.totalPlasticG)
  const treeDays = calculateTreeDays(month.totalPlasticG)
  const decompYear = new Date().getFullYear() + 400

  if (month.totalOrders === 0) {
    return (
      <div className="rounded-[20px] bg-[#FFFFFF] p-5 shadow-[0_2px_12px_rgba(45,158,107,0.08)] text-center">
        <p className="text-[13px] text-[#6B8C7A]">이번 달 기록이 없어</p>
        <p className="mt-1 text-[11px] text-[#6B8C7A]">영수증을 스캔하면 여기에 나타나</p>
      </div>
    )
  }

  const diff = prevMonthG !== undefined ? month.totalPlasticG - prevMonthG : null
  const improved = diff !== null && diff < 0
  const worsened = diff !== null && diff > 0

  return (
    <div className="rounded-[20px] bg-[#FFFFFF] p-5 shadow-[0_2px_12px_rgba(45,158,107,0.08)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6B8C7A]">이달의 배달 요약</p>
        <p className="text-[13px] font-medium text-[#1A2E25]">{month.totalOrders}번 주문</p>
      </div>

      {/* Main stat */}
      <div>
        <p className="font-mono text-[40px] font-bold text-[#1A2E25] leading-none">
          {formatPlasticWeight(month.totalPlasticG)}
        </p>
        <p className="mt-1 text-[12px] text-[#6B8C7A]">이번 달 플라스틱 총량</p>
      </div>

      {/* Impact chips */}
      <div className="flex gap-2">
        {[
          { icon: "🌳", label: `나무 ${treeDays}일치` },
          { icon: "🍶", label: `페트병 ${bottles}개` },
          { icon: "⏳", label: `${decompYear}년까지` },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-1 items-center gap-1.5 rounded-full bg-[#F0F5F2] px-2 py-1.5">
            <span className="text-[12px]">{icon}</span>
            <span className="text-[10px] text-[#6B8C7A] whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

      {/* Worst day */}
      {month.worstDay && (
        <div className="flex items-center gap-3 rounded-[14px] bg-[rgba(232,104,90,0.06)] border border-[rgba(232,104,90,0.12)] px-3 py-2.5">
          <LensCharacter expression="surprised" size="small" />
          <div>
            <p className="text-[12px] font-medium text-[#E8685A]">
              {month.worstDay.date.getMonth() + 1}월 {month.worstDay.date.getDate()}일 — 하루 최대 {formatPlasticWeight(month.worstDay.totalPlasticG)}
            </p>
            <p className="text-[11px] text-[#6B8C7A]">{month.worstDay.orderCount}번 주문</p>
          </div>
        </div>
      )}

      {/* Month comparison */}
      {diff !== null && diff !== 0 && (
        <div
          className="rounded-[14px] px-3 py-2"
          style={{
            backgroundColor: improved ? "rgba(45,158,107,0.06)" : "rgba(232,104,90,0.06)",
            border: `1px solid ${improved ? "rgba(45,158,107,0.12)" : "rgba(232,104,90,0.12)"}`,
          }}
        >
          <p
            className="text-[12px] font-medium"
            style={{ color: improved ? "#2D9E6B" : "#E8685A" }}
          >
            {improved
              ? `지난달보다 ${formatPlasticWeight(Math.abs(diff))} 줄었어`
              : `지난달보다 ${formatPlasticWeight(Math.abs(diff))} 늘었어`}
          </p>
        </div>
      )}

      {worsened && diff === null && null}
    </div>
  )
}
