"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export type PageHeaderProps = {
  title: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export function PageHeader({
  title,
  showBack = false,
  rightElement,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#F0F5F2] px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(45,158,107,0.08)] active:scale-[0.97]"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} className="text-[#1A2E25]" />
          </button>
        )}
        <h1 className="text-[17px] font-semibold text-[#1A2E25]">{title}</h1>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  )
}
