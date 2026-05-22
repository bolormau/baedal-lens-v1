export function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1" aria-label="불러오는 중...">
      <span className="loading-dot h-2 w-2 rounded-full bg-[#2D9E6B]" />
      <span className="loading-dot h-2 w-2 rounded-full bg-[#2D9E6B]" />
      <span className="loading-dot h-2 w-2 rounded-full bg-[#2D9E6B]" />
    </div>
  )
}
