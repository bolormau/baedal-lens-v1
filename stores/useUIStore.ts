import { create } from "zustand"

import { isDemoMode } from "@/lib/config"
import type { Toast, ToastType, ConfirmDialogConfig } from "@/types"

type BottomSheetType = "messages" | "share" | null

type UIState = {
  isDemo: boolean
  bottomSheetOpen: boolean
  activeBottomSheet: BottomSheetType
  confirmDialogOpen: boolean
  confirmDialogConfig: ConfirmDialogConfig | null
  toasts: Toast[]
  pwaInstallPromptVisible: boolean
}

type UIActions = {
  setBottomSheetOpen: (open: boolean) => void
  setActiveBottomSheet: (sheet: BottomSheetType) => void
  setConfirmDialogOpen: (open: boolean) => void
  setConfirmDialogConfig: (config: ConfirmDialogConfig | null) => void
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  setPwaInstallPromptVisible: (visible: boolean) => void
  showToast: (message: string, type: ToastType) => void
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isDemo: isDemoMode,
  bottomSheetOpen: false,
  activeBottomSheet: null,
  confirmDialogOpen: false,
  confirmDialogConfig: null,
  toasts: [],
  pwaInstallPromptVisible: false,

  setBottomSheetOpen: (open) => set({ bottomSheetOpen: open }),
  setActiveBottomSheet: (sheet) => set({ activeBottomSheet: sheet }),
  setConfirmDialogOpen: (open) => set({ confirmDialogOpen: open }),
  setConfirmDialogConfig: (config) => set({ confirmDialogConfig: config }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  setPwaInstallPromptVisible: (visible) =>
    set({ pwaInstallPromptVisible: visible }),
  showToast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
    })),
}))
