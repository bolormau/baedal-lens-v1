import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { Logo } from "@/features/shared/logo/Logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#F0F5F2] dl-bg-pattern">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Logo variant="stacked" theme="light" className="mb-6" />
        <LensCharacter expression="excited" size="medium" animate />
        <div className="mt-6 w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  )
}
