import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-[#F0F5F2] px-4 py-4 pb-24">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Legend */}
      <div className="mb-3 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>

      {/* Summary card */}
      <Skeleton className="mb-3 h-40 w-full rounded-[20px]" />

      {/* Calendar grid */}
      <div className="rounded-[20px] bg-[#FFFFFF] p-3 shadow-[0_2px_12px_rgba(45,158,107,0.08)]">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="mb-1 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="aspect-square w-full rounded-[12px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
