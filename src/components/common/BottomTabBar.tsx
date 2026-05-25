"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, CalendarDays, BarChart2, Settings } from "lucide-react"

const TABS = [
  { href: "/home",     label: "홈",      icon: Home         },
  { href: "/scan",     label: "스캔",    icon: Camera       },
  { href: "/calendar", label: "캘린더",  icon: CalendarDays },
  { href: "/report",   label: "리포트",  icon: BarChart2    },
  { href: "/settings", label: "설정",    icon: Settings     },
] as const

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FFFFFF] border-t border-[rgba(45,158,107,0.08)]"
      aria-label="메인 네비게이션"
    >
      <div className="mx-auto flex h-full max-w-[480px] items-center justify-around px-4">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 py-2"
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={isActive ? "text-[#2D9E6B]" : "text-[#6B8C7A]"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#2D9E6B]" />
                )}
              </div>
              <span
                className={`text-[11px] ${
                  isActive
                    ? "font-medium text-[#2D9E6B]"
                    : "text-[#6B8C7A]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
