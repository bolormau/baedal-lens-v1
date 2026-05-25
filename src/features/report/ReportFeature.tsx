"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { getWeeklyReport } from "@/lib/actions/report.actions"
import { formatPlasticWeight, formatDate } from "@/lib/formatters"
import type { ReportData } from "@/types"

export function ReportFeature() {
  const router = useRouter()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    const result = await getWeeklyReport()
    if (result.success) setData(result.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchReport() }, [fetchReport])

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
          {/* Total stats */}
          <div className="rounded-[20px] bg-[#1A2E25] p-5 text-center">
            <p className="text-[13px] text-[#6B8C7A]">전체 기록</p>
            <p className="mt-1 text-[32px] font-bold text-white">{formatPlasticWeight(data.totalG)}</p>
            <p className="text-[13px] text-[#6B8C7A]">= 페트병 {Math.round(data.totalG / 31)}개 · {data.orders.length}번 주문</p>
          </div>

          {/* Week comparison */}
          {(data.thisWeekG > 0 || data.prevWeekG > 0) && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-[#6B8C7A]">이번 주 vs 지난 주</p>
                <p className="mt-1 text-[17px] font-semibold text-[#1A2E25]">{formatPlasticWeight(data.thisWeekG)}</p>
              </div>
              {data.prevWeekG > 0 && (
                <div className="flex items-center gap-1">
                  {data.thisWeekG < data.prevWeekG ? <TrendingDown size={20} className="text-[#2D9E6B]" /> : <TrendingUp size={20} className="text-[#E8685A]" />}
                  <span className={`text-[13px] font-medium ${data.thisWeekG < data.prevWeekG ? "text-[#2D9E6B]" : "text-[#E8685A]"}`}>
                    {data.prevWeekG > 0 ? `${Math.round(Math.abs((data.thisWeekG - data.prevWeekG) / data.prevWeekG) * 100)}%` : "—"}
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
          {data.categoryBreakdown.length > 0 && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
              <p className="text-[13px] font-medium text-[#1A2E25] mb-3">카테고리별</p>
              {data.categoryBreakdown.slice(0, 4).map((cat) => (
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
          {data.orders.length > 0 && (
            <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
              <p className="text-[13px] font-medium text-[#1A2E25] mb-3">최근 기록</p>
              {data.orders.slice(0, 5).map((order) => (
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
