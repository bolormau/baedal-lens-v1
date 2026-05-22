import { requireAuth } from "@/lib/auth/auth"

import { BottomTabBar } from "@/components/common/BottomTabBar"
import { ToastProvider } from "@/features/shared/toast/ToastProvider"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { isDemoMode } from "@/lib/config"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="relative min-h-screen bg-[#F0F5F2] pb-16">
      {children}
      <BottomTabBar />
      <ToastProvider />
      <ConfirmDialog />

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="fixed right-3 top-[60px] z-50 pointer-events-none rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] px-2 py-0.5 text-[10px] text-[#F5A623]">
          데모
        </div>
      )}
    </div>
  )
}
