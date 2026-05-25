"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { getScanById } from "@/lib/actions/scan.actions"
import { formatPlasticWeight, formatDate } from "@/lib/formatters"
import type { ScanResult } from "@/types"

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = { CHICKEN:"🍗", CHINESE:"🥡", PIZZA:"🍕", SNACK:"🍜", BURGER:"🍔", KOREAN:"🍚", OTHER:"🍱" }
  return map[cat] ?? "🍱"
}

export function HistoryDetailFeature({ id }: { id: string }) {
  const router = useRouter()
  const [order, setOrder] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getScanById(id).then((r) => {
      if (r.success) setOrder(r.data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#2D9E6B] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-[#6B8C7A]">기록을 찾을 수 없어</p>
        <Button onClick={() => router.push("/history")} className="rounded-full bg-[#2D9E6B] text-white">목록으로</Button>
      </div>
    )
  }

  const firstLens = order.lenses[0]

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#F0F5F2] p-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <ArrowLeft size={20} className="text-[#6B8C7A]" />
        </button>
        <p className="text-[15px] font-medium text-[#1A2E25]">상세 보기</p>
        <div className="w-10" />
      </header>

      <main className="px-4 space-y-3">
        {/* Restaurant header */}
        <div className="rounded-[20px] bg-[#FFFFFF] p-5 shadow-[var(--dl-shadow-card)] flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#E8F5EE] text-[24px]">
            {getCategoryEmoji(order.category)}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#1A2E25]">{order.restaurant}</p>
            <p className="text-[12px] text-[#6B8C7A]">{formatDate(new Date(order.scannedAt))}</p>
          </div>
        </div>

        {/* Plastic total */}
        <div className="rounded-[20px] bg-[#1A2E25] p-5 text-center">
          <p className="text-[12px] text-[#6B8C7A]">플라스틱 총량</p>
          <p className="mt-1 text-[32px] font-bold text-white">{formatPlasticWeight(order.plasticG)}</p>
          <p className="text-[12px] text-[#6B8C7A]">= 페트병 {Math.round(order.plasticG / 31)}개</p>
        </div>

        {/* Lens insight */}
        {firstLens && (
          <div className="rounded-[20px] bg-[#E8F5EE] p-4 flex items-start gap-3">
            <LensCharacter expression="thinking" size="small" />
            <p className="text-[13px] text-[#1A2E25] leading-relaxed">{firstLens.emoji} {firstLens.text}</p>
          </div>
        )}

        {/* Items */}
        <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
          <p className="text-[13px] font-medium text-[#1A2E25] mb-3">주문 내역</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#1A2E25]">{item.name}</p>
                  <p className="text-[11px] text-[#6B8C7A]">{item.quantity}개</p>
                </div>
                <span className="text-[12px] font-medium text-[#2D9E6B]">{formatPlasticWeight(item.plasticG)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unrequested */}
        {order.unrequested.length > 0 && (
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] border border-[rgba(245,166,35,0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={14} className="text-[#F5A623]" />
              <p className="text-[13px] font-medium text-[#1A2E25]">비요청 항목</p>
            </div>
            {order.unrequested.map((item, i) => (
              <p key={i} className="text-[12px] text-[#6B8C7A]">• {item}</p>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
