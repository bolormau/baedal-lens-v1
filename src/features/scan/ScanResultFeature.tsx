"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { useScanStore } from "@/stores/useScanStore"
import { useUIStore } from "@/stores/useUIStore"
import { saveOrder, getUserStats } from "@/lib/actions/scan.actions"
import { formatPlasticWeight } from "@/lib/formatters"

function calcScore(plasticG: number, unreqCount: number): number {
  return Math.max(0, Math.min(100, 100 - Math.min(40, Math.round((plasticG / 500) * 40)) - unreqCount * 5))
}

function getEquivalent(g: number): string {
  if (g < 52) return `신용카드 ${Math.max(1, Math.round(g / 5))}장 무게`
  if (g < 156) return `500ml 페트병 ${Math.round(g / 31)}개 무게`
  if (g < 312) return `성인 손바닥 ${Math.round(g / 150)}개 무게`
  return `A4용지 ${Math.round(g / 5)}장 무게`
}

export function ScanResultFeature() {
  const router = useRouter()
  const { currentScan, setCurrentScan, setScanState } = useScanStore()
  const { addToast } = useUIStore()
  const hasSaved = useRef(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [stats, setStats] = useState<{ totalScans: number; totalPlasticG: number } | null>(null)

  useEffect(() => {
    if (!currentScan) { router.replace("/scan"); return }
  }, [currentScan, router])

  useEffect(() => {
    const scan = currentScan
    if (!scan || hasSaved.current) return
    hasSaved.current = true
    async function saveAndFetch() {
      setSaveStatus("saving")
      const result = await saveOrder(scan!)
      if (result.success) {
        setSaveStatus("saved")
        const s = await getUserStats()
        if (s.success) setStats(s.data)
      } else {
        setSaveStatus("error")
        addToast({ type: "error", message: result.error })
      }
    }
    saveAndFetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!currentScan) return null

  const score = calcScore(currentScan.plasticG, currentScan.unrequested.length)
  const decompositionYear = new Date().getFullYear() + 400
  const annualG = currentScan.plasticG * 52
  const scoreLabel = score >= 90 ? "훌륭해 🌿" : score >= 70 ? "괜찮아 😊" : score >= 50 ? "보통이야 😐" : "많이 나왔어 😮"
  const scoreColor = score >= 90 ? "#2D9E6B" : score >= 70 ? "#8BC34A" : score >= 50 ? "#F5A623" : "#E8685A"
  const expression = score >= 90 ? "excited" as const : score >= 70 ? "curious" as const : score >= 50 ? "thinking" as const : "surprised" as const

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#F0F5F2] p-4">
        <button onClick={() => { setCurrentScan(null); setScanState({ status: "idle" }); router.push("/home") }} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <ArrowLeft size={20} className="text-[#6B8C7A]" />
        </button>
        <p className="text-[15px] font-medium text-[#1A2E25]">분석 결과</p>
        <div className="w-10 text-right">
          {saveStatus === "saving" && <span className="text-[11px] text-[#6B8C7A]">저장 중...</span>}
          {saveStatus === "saved" && <span className="text-[11px] text-[#2D9E6B]">저장됨 ✓</span>}
          {saveStatus === "error" && <button onClick={() => { hasSaved.current = false; setSaveStatus("idle") }} className="text-[11px] text-[#E8685A]">재시도</button>}
        </div>
      </header>

      <main className="px-4 space-y-3">
        {/* Year Impact Card */}
        <div className="relative rounded-[20px] bg-[#1A2E25] p-6 text-center">
          <div className="absolute right-4 top-4"><LensCharacter expression="surprised" size="small" /></div>
          <p className="text-[13px] text-[#6B8C7A]">이 플라스틱은</p>
          <p className="mt-1 text-[28px] font-bold text-white">{decompositionYear}년까지</p>
          <p className="text-[15px] text-white">지구 어딘가에 있습니다</p>
          <p className="mt-3 text-[11px] text-[#6B8C7A]">플라스틱은 분해되지 않아요. 더 작은 미세플라스틱이 될 뿐이에요.</p>
        </div>

        {/* Score */}
        <div className="rounded-[20px] bg-[#FFFFFF] p-5 shadow-[var(--dl-shadow-card)] flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4" style={{ borderColor: scoreColor }}>
            <span className="text-[18px] font-bold" style={{ color: scoreColor }}>{score}</span>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-[#6B8C7A]">환경 점수</p>
            <p className="text-[17px] font-semibold text-[#1A2E25]">{scoreLabel}</p>
          </div>
          <LensCharacter expression={expression} size="medium" />
        </div>

        {/* Restaurant & items */}
        <div className="rounded-[20px] bg-[#FFFFFF] p-5 shadow-[var(--dl-shadow-card)]">
          <p className="text-[15px] font-semibold text-[#1A2E25]">{currentScan.restaurant}</p>
          <p className="mt-1 text-[13px] text-[#6B8C7A]">{currentScan.items.length}가지 · {formatPlasticWeight(currentScan.plasticG)}</p>
          {currentScan.lenses[0] && (
            <p className="mt-3 text-[13px] text-[#2D9E6B]">{currentScan.lenses[0].emoji} {currentScan.lenses[0].text}</p>
          )}
        </div>

        {/* Physical equivalent */}
        <div className="rounded-[20px] bg-[#E8F5EE] p-4">
          <p className="text-[13px] text-[#6B8C7A]">물리적 크기로 보면</p>
          <p className="mt-1 text-[17px] font-medium text-[#1A2E25]">= {getEquivalent(currentScan.plasticG)}</p>
        </div>

        {/* Annual projection */}
        <div className="rounded-[20px] bg-[rgba(245,166,35,0.08)] border border-[rgba(245,166,35,0.2)] p-4">
          <p className="text-[13px] text-[#6B8C7A]">이 페이스면 1년 뒤</p>
          <p className="mt-1 text-[15px] font-medium text-[#1A2E25]">{formatPlasticWeight(annualG)} = 페트병 {Math.round(annualG / 31)}개</p>
        </div>

        {/* Lifetime total */}
        {stats && (
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]">
            <p className="text-[13px] text-[#6B8C7A]">지금까지 내 배달 플라스틱</p>
            <p className="mt-1 text-[15px] font-medium text-[#1A2E25]">{formatPlasticWeight(stats.totalPlasticG)} = 페트병 {Math.round(stats.totalPlasticG / 31)}개</p>
            <p className="text-[11px] text-[#6B8C7A]">총 {stats.totalScans}번 스캔</p>
          </div>
        )}

        {/* Unrequested extras */}
        {currentScan.unrequested.length > 0 && (
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] border border-[rgba(245,166,35,0.3)]">
            <p className="text-[13px] font-semibold text-[#1A2E25]">요청하지 않은 플라스틱 발견 👀</p>
            <ul className="mt-2 space-y-1">
              {currentScan.unrequested.map((item, i) => <li key={i} className="text-[13px] text-[#6B8C7A]">• {item}</li>)}
            </ul>
            <p className="mt-2 text-[11px] text-[#6B8C7A]">추가 약 {currentScan.unrequested.length * 8}g</p>
          </div>
        )}

        <Button asChild variant="ghost" className="h-12 w-full rounded-full text-[15px] text-[#6B8C7A]">
          <a href="/history">기록 보러 가기 <ChevronRight size={16} className="ml-1" /></a>
        </Button>
      </main>
    </div>
  )
}
