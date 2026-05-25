"use client"

import Link from "next/link"
import { Settings, ArrowDown, ArrowUp, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { Logo } from "@/features/shared/logo/Logo"
import { LivePlasticCounter } from "./components/LivePlasticCounter"
import {
  formatTimeGreeting,
  formatPlasticWeight,
  formatBottleEquivalent,
  formatTrend,
  formatDate,
} from "@/lib/formatters"

import type { ScanResult, LensExpression } from "@/types"

export type HomeFeatureProps = {
  userName: string
  district: string
  orders: ScanResult[]
  totalScans: number
  totalPlasticG: number
}

export function HomeFeature({ userName, district, orders, totalScans, totalPlasticG }: HomeFeatureProps) {
  const hour = new Date().getHours()
  const greeting = formatTimeGreeting(hour, userName || "친구")

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const thisWeekOrders = orders.filter((o) => new Date(o.scannedAt) >= weekStart)
  const thisWeekTotal = thisWeekOrders.reduce((sum, o) => sum + o.plasticG, 0)

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekTotal = orders
    .filter((o) => { const d = new Date(o.scannedAt); return d >= prevWeekStart && d < weekStart })
    .reduce((sum, o) => sum + o.plasticG, 0)

  const trend = formatTrend(thisWeekTotal, prevWeekTotal)
  const bottles = formatBottleEquivalent(thisWeekTotal)
  const hasOrders = orders.length > 0
  const recentOrder = orders[0]

  const getExpression = (): LensExpression => {
    if (hour >= 22 || hour < 6) return "sleeping"
    if (hour >= 6 && hour < 11) return "excited"
    return "curious"
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <header className="flex items-center justify-between">
        <Logo variant="horizontal" theme="light" />
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[rgba(45,158,107,0.08)]" aria-label="설정">
          <Settings size={20} className="text-[#6B8C7A]" />
        </Link>
      </header>

      <div className="mt-4 flex items-center gap-4 rounded-[20px] bg-[#E8F5EE] p-5">
        <LensCharacter expression={getExpression()} size="medium" animate />
        <div>
          <p className="text-[15px] font-medium text-[#1A2E25]">{greeting}</p>
          <p className="mt-1 text-[13px] text-[#6B8C7A]">오늘도 렌즈랑 기록해보자</p>
        </div>
      </div>

      {!hasOrders ? (
        <div className="mt-8 flex flex-col items-center text-center">
          <LensCharacter expression="excited" size="large" animate />
          <p className="mt-6 text-[17px] font-medium text-[#1A2E25]">첫 번째 영수증을 찍어봐!</p>
          <Button asChild className="relative mt-6 h-12 w-full rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF] shadow-[var(--dl-shadow-button)]">
            <Link href="/scan"><span className="relative z-10">영수증 스캔하기</span></Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Live counter */}
          <div className="mt-3"><LivePlasticCounter /></div>

          {/* Stats chips */}
          <div className="mt-3 flex gap-2">
            <span className="flex-1 rounded-full bg-[#FFFFFF] px-3 py-2 text-center text-[12px] text-[#6B8C7A] shadow-[var(--dl-shadow-card)]">내 총 스캔: {totalScans}회</span>
            <span className="flex-1 rounded-full bg-[#FFFFFF] px-3 py-2 text-center text-[12px] text-[#6B8C7A] shadow-[var(--dl-shadow-card)]">내 총 플라스틱: {formatPlasticWeight(totalPlasticG)}</span>
          </div>

          {/* Week stat */}
          <div className="mt-3 rounded-[20px] bg-[#FFFFFF] p-5 shadow-[var(--dl-shadow-card)]">
            {thisWeekOrders.length === 0 ? (
              <div className="flex flex-col items-center py-2">
                <LensCharacter expression="sleeping" size="medium" />
                <p className="mt-3 text-[13px] text-[#6B8C7A]">이번 주 기록이 없어</p>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[#6B8C7A]">이번 주 플라스틱</p>
                <p className="mt-2 font-mono text-[40px] font-bold text-[#1A2E25]">{formatPlasticWeight(thisWeekTotal)}</p>
                <div className="mt-2 flex items-center gap-2">
                  {trend.direction !== "same" && (
                    <span className={`flex items-center gap-1 text-[13px] ${trend.direction === "down" ? "text-[#2D9E6B]" : "text-[#E8685A]"}`}>
                      {trend.direction === "down" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                      {trend.percent}%
                    </span>
                  )}
                  <span className="text-[13px] text-[#6B8C7A]">지난주보다</span>
                </div>
                <p className="mt-1 text-[13px] text-[#6B8C7A]">= 페트병 {bottles}개</p>
              </>
            )}
          </div>

          <Button asChild className="mt-3 h-12 w-full rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF] shadow-[var(--dl-shadow-button)]">
            <Link href="/scan">영수증 스캔하기</Link>
          </Button>

          <Button asChild variant="ghost" className="mt-2 h-12 w-full rounded-full text-[15px] text-[#6B8C7A]">
            <Link href="/report">이번 주 리포트 보기 <ChevronRight size={16} className="ml-1" /></Link>
          </Button>

          {recentOrder && (
            <Link href={`/history/${recentOrder.id}`} className="mt-3 flex items-center gap-4 rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] transition-all hover:opacity-[0.92] active:scale-[0.97]">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
                <span className="text-[20px]">{district}</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-[#1A2E25]">{recentOrder.restaurant}</p>
                <p className="text-[11px] text-[#6B8C7A]">{formatDate(new Date(recentOrder.scannedAt))}</p>
              </div>
              <span className="text-[13px] font-medium text-[#2D9E6B]">{formatPlasticWeight(recentOrder.plasticG)}</span>
              <ChevronRight size={16} className="text-[#6B8C7A]" />
            </Link>
          )}
        </>
      )}
    </div>
  )
}

export { HomeFeature as default }
