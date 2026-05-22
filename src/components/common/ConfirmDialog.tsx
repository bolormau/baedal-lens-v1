"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUIStore } from "@/stores/useUIStore"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"

export function ConfirmDialog() {
  const { confirmDialogOpen, confirmDialogConfig, setConfirmDialogOpen } =
    useUIStore()

  if (!confirmDialogConfig) return null

  const handleConfirm = async () => {
    await confirmDialogConfig.onConfirm()
    setConfirmDialogOpen(false)
  }

  return (
    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
      <DialogContent className="max-w-[320px] rounded-[24px] bg-[#FFFFFF] p-6 animate-scale-in">
        <DialogHeader className="flex flex-col items-center gap-4">
          <LensCharacter
            expression={confirmDialogConfig.expression}
            size="medium"
          />
          <DialogTitle className="text-[17px] font-semibold text-[#1A2E25]">
            {confirmDialogConfig.title}
          </DialogTitle>
          <DialogDescription className="text-center text-[13px] text-[#6B8C7A]">
            {confirmDialogConfig.description}
          </DialogDescription>
          {confirmDialogConfig.subtext && (
            <p className="text-center text-[11px] text-[#6B8C7A]">
              {confirmDialogConfig.subtext}
            </p>
          )}
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setConfirmDialogOpen(false)}
            className="h-12 flex-1 rounded-full border-[rgba(45,158,107,0.12)] text-[15px]"
          >
            {confirmDialogConfig.cancelLabel}
          </Button>
          <Button
            variant={confirmDialogConfig.destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            className="h-12 flex-1 rounded-full text-[15px]"
          >
            {confirmDialogConfig.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
