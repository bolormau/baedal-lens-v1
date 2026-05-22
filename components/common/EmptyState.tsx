import Link from "next/link"

import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"

export type EmptyStateProps = {
  message: string
  subMessage?: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({
  message,
  subMessage,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <LensCharacter expression="sleeping" size="large" animate={false} />
      <p className="text-center text-[17px] font-medium text-[#1A2E25]">
        {message}
      </p>
      {subMessage && (
        <p className="text-center text-[13px] text-[#6B8C7A]">{subMessage}</p>
      )}
      {ctaLabel && ctaHref && (
        <Button
          asChild
          className="mt-2 h-12 rounded-full bg-[#2D9E6B] px-6 text-[15px] font-medium text-[#FFFFFF] shadow-[var(--dl-shadow-button)]"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  )
}
