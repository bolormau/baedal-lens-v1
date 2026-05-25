"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, ImageIcon, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScanStore } from "@/stores/useScanStore"
import { useUIStore } from "@/stores/useUIStore"
import { compressImage } from "./utils/imageCompressor"
import type { ScanResult, ImpactLensData, FoodCategory } from "@/types"

const SYSTEM_PROMPT = `You are a Korean food delivery plastic analyzer. Analyze the receipt or packaging photo. Return ONLY valid JSON with no markdown.

JSON shape:
{"restaurant":"<Korean name>","category":"<CHICKEN|CHINESE|PIZZA|SNACK|BURGER|KOREAN|OTHER>","items":[{"name":"<Korean>","quantity":<number>,"plasticG":<grams>}],"plasticG":<total>,"actualG":<total>,"unrequested":["<item>"]}

unrequested: Items that physically arrived in the delivery bag but are NOT listed as ordered menu items on the receipt. This means ONLY:
- Sauce cups (소스컵, 케첩팩, 마요소스, 피클컵)
- Disposable utensils (나무젓가락, 포크, 스푼, 이쑤시개)
- Plastic bags (비닐봉투)
- Straws (빨대)
- Napkins and wet wipes (냅킨, 물티슈)
- Condiment packets (핫소스팩, 파마산치즈팩)

NEVER include in unrequested:
- Any food item the customer ordered (치킨, 피자, 콜라 etc.)
- Any item that appears in the receipt as a menu item
- Packaging containers that the food comes IN

If nothing unrequested was found, return empty array: []

Respond ONLY with the JSON object, no explanation.`

function selectLenses(plasticG: number, category: FoodCategory, unrequested: string[]): ImpactLensData[] {
  const decompositionYear = new Date().getFullYear() + 400
  const bottles = Math.round(plasticG / 31)
  const annualG = plasticG * 52
  const treesPerYear = Math.max(1, Math.round(annualG * 6 / 57 / 365))
  const unrequestedCount = unrequested.length

  const lenses = {
    invisibility: {
      type: "invisibility" as const,
      emoji: "👻",
      text: unrequestedCount > 0
        ? `${unrequested.join(", ")} — 주문 안 했는데 왔어. 이것만 ${unrequestedCount}개, 매주 시키면 1년에 ${unrequestedCount * 52}개야.`
        : "소스컵 등은 주문한 게 아니야. 그냥 딸려왔어.",
    },
    time: {
      type: "time" as const,
      emoji: "⏰",
      text: `오늘 배달된 플라스틱 ${plasticG}g, ${decompositionYear}년에도 어딘가에 있어. 네 자녀의 자녀가 살아있을 때까지.`,
    },
    scale: {
      type: "scale" as const,
      emoji: "⚖️",
      text: `${plasticG}g = 페트병 ${bottles}개 무게. 한 주에 3번 시키면 페트병 ${bottles * 3}개야.`,
    },
    accumulation: {
      type: "accumulation" as const,
      emoji: "📦",
      text: `이 페이스면 1년 뒤 배달 플라스틱만 ${annualG}g. 나무 ${treesPerYear}그루가 1년 내내 흡수해야 하는 양이야.`,
    },
  }
  if (unrequested.length > 0) return [lenses.invisibility, lenses.time, lenses.scale]
  if (category === "CHICKEN") return [lenses.scale, lenses.accumulation, lenses.time]
  return [lenses.scale, lenses.time, lenses.accumulation]
}

export function ScanFeature() {
  const router = useRouter()
  const { setCurrentScan, setScanState } = useScanStore()
  const { addToast } = useUIStore()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressed, setCompressed] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [heicWarning, setHeicWarning] = useState(false)

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isHeic = file.name.toLowerCase().endsWith(".heic")
    const valid = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    if (!valid.includes(file.type) && !isHeic) {
      addToast({ type: "error", message: "JPG, PNG, WEBP 이미지만 가능해 😅" }); return
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast({ type: "error", message: "파일이 너무 커 (최대 10MB) 😅" }); return
    }
    if (isHeic) setHeicWarning(true)
    setPreviewUrl(URL.createObjectURL(file))
    setIsCompressing(true)
    setCompressed(null)
    try {
      const b64 = await compressImage(file)
      setCompressed(b64)
    } catch {
      addToast({ type: "error", message: "이미지 처리 실패 😅 다시 시도해봐" })
    } finally {
      setIsCompressing(false)
      e.target.value = ""
    }
  }

  async function handleAnalyze() {
    if (!compressed) return
    setIsAnalyzing(true)
    setScanState({ status: "analyzing" })
    try {
      const cleanBase64 = compressed.includes(",") ? compressed.split(",")[1] : compressed
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: cleanBase64, mediaType: "image/jpeg", system: SYSTEM_PROMPT }),
      })
      const result = await res.json() as { success: boolean; data?: string; error?: string }
      if (!result.success || !result.data) throw new Error(result.error ?? "응답 없음")
      const jsonMatch = result.data.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("JSON 파싱 실패")
      const parsed = JSON.parse(jsonMatch[0]) as { restaurant: string; category: FoodCategory; items: Array<{name:string;quantity:number;plasticG:number}>; plasticG: number; actualG?: number; unrequested: string[] }
      const scan: ScanResult = {
        id: crypto.randomUUID(),
        scannedAt: new Date().toISOString(),
        restaurant: parsed.restaurant ?? "알 수 없는 가게",
        category: parsed.category ?? "OTHER",
        items: parsed.items ?? [],
        plasticG: parsed.plasticG ?? 0,
        actualG: parsed.actualG,
        unrequested: parsed.unrequested ?? [],
        weather: "SUNNY",
        pm25: "MODERATE",
        usedMessage: false,
        lenses: selectLenses(parsed.plasticG ?? 0, parsed.category ?? "OTHER", parsed.unrequested ?? []),
      }
      setCurrentScan(scan)
      setScanState({ status: "success", data: scan })
      router.push("/scan/result")
    } catch {
      setScanState({ status: "error", error: "분석 실패" })
      addToast({ type: "error", message: "AI 분석에 실패했어 😅 다시 시도해봐" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-20">
      <header className="flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <X size={20} className="text-[#6B8C7A]" />
        </button>
        <p className="text-[15px] font-medium text-[#1A2E25]">영수증 스캔</p>
        <div className="w-10" />
      </header>

      <main className="px-4 space-y-4">
        <div className="relative h-72 w-full rounded-[20px] bg-[#FFFFFF] shadow-[var(--dl-shadow-card)] overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="선택된 영수증" className="h-full w-full object-cover" />
              <button onClick={() => { setPreviewUrl(null); setCompressed(null); setHeicWarning(false) }} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] text-white">
                <X size={14} />
              </button>
              {isCompressing && <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-white bg-[rgba(0,0,0,0.4)] py-1">이미지 압축 중...</p>}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#6B8C7A]">
              <Camera size={40} />
              <p className="text-[13px]">영수증 또는 포장 사진을 선택해줘</p>
            </div>
          )}
        </div>

        {heicWarning && (
          <div className="rounded-[14px] bg-[#FFF8E7] border border-[rgba(245,166,35,0.3)] p-3 text-[12px] text-[#1A2E25]">
            iPhone 사진이네! 설정 → 카메라 → 포맷 → 호환성 우선으로 바꾸면 JPG로 찍혀 📱
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => cameraRef.current?.click()} className="h-12 rounded-full border-[rgba(45,158,107,0.15)] text-[#1A2E25]">
            <Camera size={16} className="mr-2" /> 카메라로 찍기
          </Button>
          <Button variant="outline" onClick={() => galleryRef.current?.click()} className="h-12 rounded-full border-[rgba(45,158,107,0.15)] text-[#1A2E25]">
            <ImageIcon size={16} className="mr-2" /> 앨범에서 선택
          </Button>
        </div>

        <Button onClick={handleAnalyze} disabled={!compressed || isCompressing || isAnalyzing} className="h-12 w-full rounded-full bg-[#2D9E6B] text-[15px] font-medium text-white disabled:opacity-40">
          {isAnalyzing ? <><Loader2 size={16} className="mr-2 animate-spin" />분석 중...</> : isCompressing ? "이미지 압축 중..." : <><Check size={16} className="mr-2" />분석하기</>}
        </Button>
      </main>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleImageSelect} className="hidden" />
    </div>
  )
}
