import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { formatPlasticWeight } from "@/lib/formatters"
import { formatTimeHHMM } from "@/lib/formatters"
import { IMPACT_CONFIG, calculateBottles, calculateTreeDays } from "../utils/calendarHelpers"
import type { CalendarDay } from "../types/calendar.types"

const CATEGORY_EMOJI: Record<string, string> = {
  CHICKEN: "🍗", CHINESE: "🥡", PIZZA: "🍕",
  SNACK: "🍜", BURGER: "🍔", KOREAN: "🍚", OTHER: "🍱",
}

type Props = {
  day: CalendarDay | null
  isOpen: boolean
  onClose: () => void
}

export function DayDetailSheet({ day, isOpen, onClose }: Props) {
  if (!day) return null
  const cfg = IMPACT_CONFIG[day.impactLevel]
  const bottles = calculateBottles(day.totalPlasticG)
  const treeDays = calculateTreeDays(day.totalPlasticG)
  const decompYear = new Date().getFullYear() + 400

  const allUnrequested = day.orders.flatMap((o) => o.unrequested)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] bg-[#FFFFFF] px-5 pb-8 pt-5 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[rgba(45,158,107,0.15)]" />

        <SheetHeader className="mb-4 flex flex-col items-center gap-2">
          <LensCharacter expression={cfg.lensExpression} size="medium" animate />
          <SheetTitle className="text-[17px] font-semibold text-[#1A2E25]">
            {day.date.getMonth() + 1}월 {day.date.getDate()}일
          </SheetTitle>
          {/* Impact badge */}
          <div
            className="rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}
          >
            {cfg.emoji} {cfg.label}
          </div>
        </SheetHeader>

        {/* Plastic total */}
        <div className="mb-4 text-center">
          <p className="font-mono text-[40px] font-bold text-[#1A2E25] leading-none">
            {formatPlasticWeight(day.totalPlasticG)}
          </p>
        </div>

        {/* Impact facts */}
        <div className="mb-4 flex gap-2">
          {[
            { icon: "🌳", label: `나무 ${treeDays}일치 CO2` },
            { icon: "🍶", label: `페트병 ${bottles}개 무게` },
            { icon: "⏳", label: `${decompYear}년까지 분해 안 됨` },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1 rounded-[14px] bg-[#F0F5F2] px-2 py-2">
              <span className="text-[16px]">{icon}</span>
              <span className="text-center text-[9px] leading-snug text-[#6B8C7A]">{label}</span>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="mb-4">
          <p className="mb-2 text-[13px] font-medium text-[#1A2E25]">
            이날의 주문 {day.orderCount}건
          </p>
          <div className="space-y-2">
            {day.orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 rounded-[14px] bg-[#F0F5F2] px-3 py-2.5"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#E8F5EE]">
                  <span className="text-[16px]">{CATEGORY_EMOJI[order.category] ?? "🍱"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-medium text-[#1A2E25]">{order.restaurant}</p>
                  <p className="text-[11px] text-[#6B8C7A]">{formatTimeHHMM(order.scannedAt)}</p>
                </div>
                <span className="text-[13px] font-medium text-[#2D9E6B]">
                  {formatPlasticWeight(order.plasticG)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unrequested items */}
        {allUnrequested.length > 0 && (
          <div className="rounded-[14px] border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] px-3 py-3">
            <p className="mb-1.5 text-[13px] font-medium text-[#1A2E25]">
              요청하지 않은 항목 발견 👻
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allUnrequested.map((item, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[rgba(245,166,35,0.12)] px-2 py-0.5 text-[11px] text-[#1A2E25]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
