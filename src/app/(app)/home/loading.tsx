import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <div className="px-4 py-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-[8px] bg-[#E8F0EC]" />
        <Skeleton className="h-10 w-10 rounded-full bg-[#E8F0EC]" />
      </div>

      {/* Greeting card skeleton */}
      <Skeleton className="mt-4 h-24 w-full rounded-[20px] bg-[#E8F0EC]" />

      {/* Stat card skeleton */}
      <Skeleton className="mt-3 h-32 w-full rounded-[20px] bg-[#E8F0EC]" />

      {/* Button skeleton */}
      <Skeleton className="mt-3 h-12 w-full rounded-full bg-[#E8F0EC]" />
    </div>
  )
}
