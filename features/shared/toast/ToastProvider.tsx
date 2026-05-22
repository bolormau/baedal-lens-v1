"use client"

import { useEffect } from "react"

import { useUIStore } from "@/stores/useUIStore"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"

import type { LensExpression } from "@/types"

const EXPRESSION_MAP: Record<string, LensExpression> = {
  success: "curious",
  warning: "thinking",
  error: "surprised",
}

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore()

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 2500)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast flex w-full max-w-[360px] items-center gap-3 rounded-[14px] bg-[#FFFFFF] p-3 shadow-[var(--dl-shadow-card)]"
          style={{
            borderLeft: `1px solid ${
              toast.type === "success"
                ? "#2D9E6B"
                : toast.type === "warning"
                ? "#F5A623"
                : "#E8685A"
            }`,
          }}
          role="alert"
          aria-live="polite"
        >
          <LensCharacter
            expression={EXPRESSION_MAP[toast.type]}
            size="micro"
          />
          <p className="flex-1 text-[13px] text-[#1A2E25]">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  )
}
