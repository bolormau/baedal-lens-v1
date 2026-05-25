"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, TrendingDown, TrendingUp, Share2 } from "lucide-react"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { getWeeklyReport } from "@/lib/actions/report.actions"
import { useUIStore } from "@/stores/useUIStore"
import { formatPlasticWeight, formatDate } from "@/lib/formatters"
import type { ReportData, ScanResult, CategoryBreakdownItem, FoodCategory } from "@/types"

function getWeeklyBreakdown(orders: ScanResult[]): CategoryBreakdownItem[] {
  const totalG = orders.reduce((s, o) => s + o.plasticG, 0)
  const catMap = new Map<string, number>()
  for (const o of orders) catMap.set(o.category, (catMap.get(o.category) ?? 0) + o.plasticG)
  return [...catMap.entries()]
    .map(([cat, g]) => ({
      category: cat as FoodCategory,
      plasticG: g,
      percentage: totalG > 0 ? Math.round((g / totalG) * 100) : 0,
    }))
    .sort((a, b) => b.plasticG - a.plasticG)
}

export function ReportFeature() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"all" | "week">("all")

  const fetchReport = useCallback(async () => {
    setLoading(true)
    const result = await getWeeklyReport()
    if (result.success) setData(result.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchReport() }, [fetchReport])

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const thisWeekOrders = data?.orders.filter((o) => new Date(o.scannedAt) >= sevenDaysAgo) ?? []
  const displayG = view === "all" ? (data?.totalG ?? 0) : (data?.thisWeekG ?? 0)
  const displayOrders = view === "all" ? (data?.orders ?? []) : thisWeekOrders
  const displayBreakdown = view === "all" ? (data?.categoryBreakdown ?? []) : getWeeklyBreakdown(thisWeekOrders)

  const plasticReduced = (data?.prevWeekG ?? 0) - (data?.thisWeekG ?? 0)
  const bottlesSaved = Math.round(Math.abs(plasticReduced) / 31)
  const treeDaysSaved = Math.round(Math.abs(plasticReduced) * 6 / 57)

  async function handleShare() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://baedal-lens.vercel.app"
    const text = `나는 이번 주 배달 플라스틱을 ${plasticReduced}g 줄였어\n= 페트병 ${bottlesSaved}개\n= 나무 ${treeDaysSaved}일치 CO2\n배달렌즈로 기록하기 → ${appUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        addToast({ type: "success", message: "클립보드에 복사됐어" })
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#F0F5F2] p-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <ArrowLeft size={20} className="text-[#6B8C7A]" />
        </button>
        <p className="text-[15px] font-medium text-[#1A2E25]">리포트</p>
        <button onClick={fetchReport} disabled={loading} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <RefreshCw size={18} className={`text-[#6B8C7A] ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-[#2D9E6B]" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[#6B8C7A]">데이터를 불러오지 못했어</p>
        </div>
      ) : (
        <main className="px-4 space-y-3">
          {/* Toggle */}
          <div className="flex gap-1 rounded-full bg-[#FFFFFF] p-1 shadow-[var(--dl-shadow-card)]">
            <button
              onClick={() => setView("all")}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-all ${view === "all" ? "bg-[#2D9E6B] text-white" : "text-[#6B8C7A]"}`}
            >
              전체 기록
            </button>
            <button
              onClick={() => setView("week")}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-all ${view === "week" ? "bg-[#2D9E6B] text-white" : "text-[#6B8C7A]"}`}
            >
              이번 주
            </button>
          </div>

          {/* Total stats */}
          <div className="rounded-[20px] bg-[#1A2E25] p-5 text-center">
            <p className="text-[13px] text-[#6B8C7A]">{view === "all" ? "전체 기록" : "이번 주"}</p>
            <p className="mt-1 text-[32px] font-bold text-white">{formatPlasticWeight(displayG)}</p>
            <p className="text-[13px] text-[#6B8C7A]">= 페트병 {Math.round(displayG / 31)}개 · {displayOrders.length}번 주문</p>
          </div>

          {/* Weekly Change */}
          {(data.thisWeekG > 0 || data.prevWeekG > 0) && (
            <div className={`rounded-[20px] p-4 ${plasticReduced > 0 ? "border border-[#2D9E6B] bg-[rgba(45,158,107,0.04)]" : "bg-[#FFFFFF] shadow-[var(--dl-shadow-card)]"}`}>
              <p className="text-[13px] font-medium text-[#1A2E25]">이번 주 변화</p>
              {plasticReduced > 0 ? (
                <>
                  <p className="mt-2 text-[15px] font-medium text-[#2D9E6B]">지난주보다 {plasticReduced}g 줄었어</p>
                  <p className="text-[13px] text-[#6B8C7A]">= 페트병 {bottlesSaved}개 덜 쓴 거야</p>
                  <p className="text-[13px] text-[#6B8C7A]">= 나무 {treeDaysSaved}일치 CO2 덜 배출한 거야</p>
                  <button
                    onClick={handleShare}
                    className="mt-3 flex w-full items-center justify-center gap-2 h-10 rounded-full border border-[#2D9E6B] text-[13px] text-[#2D9E6B]"
                  >
                    <Share2 size={14} />
                    공유하기
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-[15px] font-medium text-[#E8685A]">지난주보다 {Math.abs(plasticReduced)}g 늘었어</p>
                  <p className="text-[13px] text-[#6B8C7A]">= 페트병 {Math.round(Math.abs(plasticReduced) / 31)}개 더</p>
                </>
              )}
            </div>
          )}

          {/* Week comparison */}
          {(data.thisWeekG > 0 || data.prevWeekG > 0) && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-[#6B8C7A]">이번 주 vs 지난 주</p>
                <p className="mt-1 text-[17px] font-semibold text-[#1A2E25]">{formatPlasticWeight(data.thisWeekG)}</p>
              </div>
              {data.prevWeekG > 0 && (
                <div className="flex items-center gap-1">
                  {data.thisWeekG < data.prevWeekG
                    ? <TrendingDown size={20} className="text-[#2D9E6B]" />
                    : <TrendingUp size={20} className="text-[#E8685A]" />}
                  <span className={`text-[13px] font-medium ${data.thisWeekG < data.prevWeekG ? "text-[#2D9E6B]" : "text-[#E8685A]"}`}>
                    {`${Math.round(Math.abs((data.thisWeekG - data.prevWeekG) / data.prevWeekG) * 100)}%`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* AI Insight */}
          {data.canShowInsight && data.insight ? (
            <div className="rounded-[20px] bg-[#1A2E25] p-5">
              <div className="flex items-start gap-3">
                <LensCharacter expression="thinking" size="small" />
                <div className="flex-1">
                  <p className="text-[11px] text-[#6B8C7A]">렌즈의 인사이트</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white">{data.insight}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] bg-[#E8F5EE] p-4">
              <p className="text-[13px] text-[#2D9E6B]">스캔 {Math.max(0, 2 - data.orders.length)}번 더 하면 AI 인사이트가 생성돼 👁</p>
            </div>
          )}

          {/* Analyzer status */}
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] space-y-3">
            <p className="text-[13px] font-medium text-[#1A2E25]">분석 엔진</p>
            {data.analyzerStatus.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 text-[14px] ${item.done ? "text-[#2D9E6B]" : "text-[#6B8C7A]"}`}>{item.done ? "●" : "○"}</span>
                <p className="text-[12px] text-[#6B8C7A]">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {displayBreakdown.length > 0 && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
              <p className="text-[13px] font-medium text-[#1A2E25] mb-3">카테고리별</p>
              {displayBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.category} className="mb-2">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#6B8C7A]">{cat.category}</span>
                    <span className="text-[#1A2E25]">{cat.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F0F5F2]">
                    <div className="h-full rounded-full bg-[#2D9E6B]" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent scans */}
          {displayOrders.length > 0 && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
              <p className="text-[13px] font-medium text-[#1A2E25] mb-3">최근 기록</p>
              {displayOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-[rgba(45,158,107,0.06)] last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-[#1A2E25]">{order.restaurant}</p>
                    <p className="text-[11px] text-[#6B8C7A]">{formatDate(new Date(order.scannedAt))}</p>
                  </div>
                  <span className="text-[13px] font-medium text-[#2D9E6B]">{formatPlasticWeight(order.plasticG)}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}
