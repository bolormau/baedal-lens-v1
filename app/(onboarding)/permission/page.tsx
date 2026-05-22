"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { useUIStore } from "@/stores/useUIStore"

export default function PermissionPage() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("dl-permission-seen")
    if (seen === "true") {
      router.push("/home")
    } else {
      setHasChecked(true)
    }
  }, [router])

  const handleEnableNotifications = async () => {
    localStorage.setItem("dl-permission-seen", "true")

    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        addToast({ type: "success", message: "알림 설정 완료!" })
      }
    }

    router.push("/home")
  }

  const handleSkip = () => {
    localStorage.setItem("dl-permission-seen", "true")
    router.push("/home")
  }

  if (!hasChecked) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <LensCharacter expression="excited" size="large" animate />

      <h1 className="mt-6 text-center text-[20px] font-semibold text-[#1A2E25]">
        매주 새로운 발견을 알려줄게
      </h1>

      <p className="mt-4 text-center text-[13px] text-[#6B8C7A]">
        주간 리포트가 준비되면 알림으로 알려줄게
      </p>

      <div className="mt-8 w-full max-w-[320px] space-y-3">
        <Button
          onClick={handleEnableNotifications}
          className="h-12 w-full rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF]"
        >
          알림 받을게
        </Button>

        <Button
          onClick={handleSkip}
          variant="ghost"
          className="h-12 w-full rounded-full text-[15px] text-[#6B8C7A]"
        >
          나중에
        </Button>
      </div>
    </div>
  )
}
