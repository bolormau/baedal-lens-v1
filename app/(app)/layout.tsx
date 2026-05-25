import { getAuthUserId } from "@/lib/auth/auth"

import { BottomTabBar } from "@/components/common/BottomTabBar"
import { ToastProvider } from "@/features/shared/toast/ToastProvider"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getAuthUserId()

  return (
    <div className="relative min-h-screen bg-[#F0F5F2] pb-16">
      {children}
      <BottomTabBar />
      <ToastProvider />
      <ConfirmDialog />
    </div>
  )
}
