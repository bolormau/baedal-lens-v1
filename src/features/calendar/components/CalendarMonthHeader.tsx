import { ChevronLeft, ChevronRight } from "lucide-react"
import { getKoreanMonthLabel } from "../utils/calendarHelpers"

type Props = {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
}

export function CalendarMonthHeader({ year, month, onPrev, onNext, canGoNext }: Props) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[rgba(45,158,107,0.08)]"
        aria-label="이전 달"
      >
        <ChevronLeft size={20} className="text-[#6B8C7A]" />
      </button>
      <p className="text-[17px] font-medium text-[#1A2E25]">
        {getKoreanMonthLabel(year, month)}
      </p>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[rgba(45,158,107,0.08)] disabled:opacity-40"
        aria-label="다음 달"
      >
        <ChevronRight size={20} className="text-[#6B8C7A]" />
      </button>
    </div>
  )
}
