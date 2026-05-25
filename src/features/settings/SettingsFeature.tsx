"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { ArrowLeft, Pencil, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { useUIStore } from "@/stores/useUIStore"
import { updateUserProfile, getUserProfile } from "@/lib/actions/user.actions"
import { deleteAllOrders } from "@/lib/actions/scan.actions"
import { useEffect } from "react"

const DISTRICTS = ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"] as const

export function SettingsFeature() {
  const router = useRouter()
  const { user } = useUser()
  const { addToast, setConfirmDialogConfig, setConfirmDialogOpen } = useUIStore()
  const [name, setName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [district, setDistrict] = useState("")
  const [isFormal, setIsFormal] = useState(false)

  useEffect(() => {
    getUserProfile().then((r) => {
      if (r.success) {
        setName(r.data.name)
        setDistrict(r.data.district)
        setIsFormal(r.data.toneMode === "formal")
      }
    })
  }, [])

  async function saveName() {
    setEditingName(false)
    await updateUserProfile({ name })
    addToast({ type: "success", message: "이름이 저장됐어" })
  }

  async function saveDistrict(val: string) {
    setDistrict(val)
    await updateUserProfile({ district: val })
  }

  async function saveTone(val: boolean) {
    setIsFormal(val)
    await updateUserProfile({ toneMode: val ? "formal" : "friend" })
  }

  function confirmDeleteData() {
    setConfirmDialogConfig({
      title: "스캔 기록 삭제",
      description: "모든 스캔 기록이 삭제돼. 되돌릴 수 없어.",
      expression: "surprised",
      confirmLabel: "삭제",
      cancelLabel: "취소",
      destructive: true,
      onConfirm: async () => {
        await deleteAllOrders()
        addToast({ type: "success", message: "기록 삭제됨" })
        router.push("/home")
      },
    })
    setConfirmDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#F0F5F2] p-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(45,158,107,0.08)]">
          <ArrowLeft size={20} className="text-[#6B8C7A]" />
        </button>
        <p className="text-[15px] font-medium text-[#1A2E25]">설정</p>
        <div className="w-10" />
      </header>

      <main className="px-4 space-y-4">
        {/* Section 1 — 내 정보 */}
        <section>
          <p className="mb-2 px-1 text-[12px] font-medium text-[#6B8C7A]">내 정보</p>
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#6B8C7A]">이름</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-32 rounded-[10px] border border-[rgba(45,158,107,0.15)] px-2 py-1 text-[13px] text-[#1A2E25] outline-none" autoFocus />
                  <button onClick={saveName}><Check size={16} className="text-[#2D9E6B]" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#1A2E25]">{name || "—"}</span>
                  <button onClick={() => setEditingName(true)}><Pencil size={14} className="text-[#6B8C7A]" /></button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#6B8C7A]">동네</span>
              <Select value={district} onValueChange={saveDistrict}>
                <SelectTrigger className="h-8 w-32 rounded-[10px] border-[rgba(45,158,107,0.15)] text-[13px]">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#6B8C7A]">이메일</span>
              <span className="text-[13px] text-[#1A2E25]">{user?.primaryEmailAddress?.emailAddress ?? "—"}</span>
            </div>
          </div>
        </section>

        {/* Section 2 — 앱 설정 */}
        <section>
          <p className="mb-2 px-1 text-[12px] font-medium text-[#6B8C7A]">앱 설정</p>
          <div className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#1A2E25]">렌즈 말투</span>
              <Switch checked={isFormal} onCheckedChange={saveTone} />
            </div>
            <div className="flex items-center gap-3 rounded-[14px] bg-[#E8F5EE] p-3">
              <LensCharacter expression="curious" size="small" />
              <p className="text-[12px] text-[#1A2E25]">{isFormal ? "안녕하세요. 이번 배달에서 플라스틱이 감지됐습니다." : "이번 배달, 플라스틱 꽤 나왔어!"}</p>
            </div>
          </div>
        </section>

        {/* Section 3 — 계정 */}
        <section>
          <p className="mb-2 px-1 text-[12px] font-medium text-[#6B8C7A]">계정</p>
          <div className="rounded-[20px] bg-[#FFFFFF] p-2 shadow-[var(--dl-shadow-card)]">
            <SignOutButton redirectUrl="/">
              <Button variant="ghost" className="h-12 w-full rounded-full border border-[rgba(45,158,107,0.15)] text-[#1A2E25]">
                로그아웃
              </Button>
            </SignOutButton>
          </div>
        </section>

        {/* Section 4 — 데이터 */}
        <section>
          <p className="mb-2 px-1 text-[12px] font-medium text-[#6B8C7A]">데이터</p>
          <div className="rounded-[20px] bg-[#FFFFFF] p-2 shadow-[var(--dl-shadow-card)]">
            <Button variant="ghost" onClick={confirmDeleteData} className="h-12 w-full rounded-full text-[#E8685A]">
              스캔 기록 모두 삭제
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
