import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "rounded-[20px] shadow-[0_2px_12px_rgba(45,158,107,0.08)] border border-[rgba(45,158,107,0.08)] bg-[#FFFFFF]",
          headerTitle: "text-[20px] font-semibold text-[#1A2E25]",
          headerSubtitle: "text-[13px] text-[#6B8C7A]",
          formButtonPrimary: "bg-[#2D9E6B] hover:bg-[#259060] rounded-full h-12 text-[15px] font-medium",
          formFieldInput: "rounded-[14px] border-[rgba(45,158,107,0.12)] h-12 text-[15px]",
          formFieldLabel: "text-[13px] text-[#1A2E25] font-medium",
          footerActionLink: "text-[#2D9E6B] hover:text-[#259060]",
          identityPreviewEditButton: "text-[#2D9E6B]",
          socialButtonsBlockButton: "rounded-[14px] border-[rgba(45,158,107,0.12)] h-12",
          dividerLine: "bg-[rgba(45,158,107,0.08)]",
          dividerText: "text-[11px] text-[#6B8C7A]",
          footer: "hidden",
        },
        layout: {
          logoPlacement: "none",
          socialButtonsPlacement: "bottom",
        },
      }}
      redirectUrl="/home"
      signUpUrl="/sign-up"
    />
  )
}
