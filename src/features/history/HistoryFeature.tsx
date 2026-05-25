"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/common/EmptyState"
import { getOrderHistory } from "@/lib/actions/scan.actions"
import { formatPlasticWeight, formatDate } from "@/lib/formatters"
import type { ScanResult } from "@/types"

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = { CHICKEN:"🍗", CHINESE:"🥡", PIZZA:"🍕", SNACK:"🍜", BURGER:"🍔", KOREAN:"🍚", OTHER:"🍱" }
  return map[cat] ?? "🍱"
}

export function HistoryFeature() {
  const router = useRouter()
  const [orders, setOrders] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    getOrderHistory().then((r) => {
      if (r.success) setOrders(r.data)
      setLoading(false)
    })
  }, [])

  const filtered = orders.filter((o) => o.restaurant.toLowerCase().includes(query.toLowerCase()))

  const grouped = filtered.reduce<Record<string, ScanResult[]>>((acc, o) => {
    const key = new Date(o.scannedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    if (!acc[key]) acc[key] = []
    acc[key].push(o)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24">
      <header className="sticky top-0 z-10 bg-[#F0F5F2]">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
            <ArrowLeft size={20} className="text-[#6B8C7A]" />
          </button>
          <p className="text-[15px] font-medium text-[#1A2E25]">스캔 기록</p>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8C7A]" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="가게명으로 검색" className="h-10 pl-9 rounded-full border-[rgba(45,158,107,0.12)] bg-[#FFFFFF] text-[13px]" />
          </div>
        </div>
      </header>

      <main className="px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-[#2D9E6B] border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message={query ? "검색 결과가 없어" : "아직 스캔 기록이 없어"} subMessage={query ? "다른 검색어로 시도해봐" : "영수증을 스캔하면 여기에 기록돼"} ctaLabel={query ? undefined : "스캔하러 가기"} ctaHref={query ? undefined : "/scan"} />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <p className="mb-2 text-[12px] font-medium text-[#6B8C7A]">{date}</p>
                <div className="space-y-2">
                  {items.map((order) => (
                    <button key={order.id} onClick={() => router.push(`/history/${order.id}`)} className="flex w-full items-center gap-3 rounded-[16px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] text-left hover:opacity-90 active:scale-[0.98]">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
                        <span className="text-[18px]">{getCategoryEmoji(order.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1A2E25] truncate">{order.restaurant}</p>
                        <p className="text-[11px] text-[#6B8C7A]">{order.items.length}가지 · {formatDate(new Date(order.scannedAt))}</p>
                      </div>
                      <span className="text-[13px] font-medium text-[#2D9E6B] flex-shrink-0">{formatPlasticWeight(order.plasticG)}</span>
                      <ChevronRight size={16} className="text-[#6B8C7A] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export { HistoryFeature as default }
