import { create } from "zustand"

import type { ScanResult, ScanState } from "@/types"

type ScanStoreState = {
  currentScan: ScanResult | null
  scanState: ScanState
  isDemoFilling: boolean
}

type ScanStoreActions = {
  setCurrentScan: (scan: ScanResult | null) => void
  setScanState: (state: ScanState) => void
  setIsDemoFilling: (filling: boolean) => void
  resetScan: () => void
}

export const useScanStore = create<ScanStoreState & ScanStoreActions>(
  (set) => ({
    currentScan: null,
    scanState: { status: "idle" },
    isDemoFilling: false,

    setCurrentScan: (scan) => set({ currentScan: scan }),
    setScanState: (scanState) => set({ scanState }),
    setIsDemoFilling: (filling) => set({ isDemoFilling: filling }),
    resetScan: () =>
      set({
        currentScan: null,
        scanState: { status: "idle" },
        isDemoFilling: false,
      }),
  })
)
