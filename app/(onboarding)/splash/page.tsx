"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { Logo } from "@/features/shared/logo/Logo"

export default function SplashPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => {
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }

      // Check localStorage for onboarding status as quick check
      const hasCompletedOnboarding = localStorage.getItem("dl-onboarding-complete")
      if (hasCompletedOnboarding === "true") {
        router.push("/home")
      } else {
        router.push("/intro")
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#2D9E6B]">
      <Logo variant="stacked" theme="dark" />
      <div className="mt-8">
        <LensCharacter expression="excited" size="large" animate />
      </div>
    </div>
  )
}
