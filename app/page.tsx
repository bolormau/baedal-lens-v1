import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { ArrowRight, Camera, Cpu, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { Logo } from "@/features/shared/logo/Logo"

export default async function LandingPage() {
  const { userId } = await auth()
  
  // If user is already signed in, redirect to home
  if (userId) {
    redirect("/home")
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between bg-[#F0F5F2]/95 px-4 backdrop-blur-sm">
        <Logo variant="horizontal" theme="light" />
        <Button
          asChild
          className="h-9 rounded-full bg-[#2D9E6B] px-4 text-[13px] font-medium text-[#FFFFFF] shadow-[var(--dl-shadow-button)]"
        >
          <Link href="/sign-up">시작하기</Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F5F2] to-[#E8F5EE] px-4 pb-16 pt-12">
        <div className="mx-auto max-w-[480px] text-center">
          <h1 className="text-balance text-[28px] font-bold leading-tight text-[#1A2E25]">
            배달이 남긴 것들,
            <br />
            이제 보여줄게
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6B8C7A]">
            영수증 한 장으로 시작하는
            <br />
            나만의 플라스틱 기록
          </p>

          <div className="mt-8 flex justify-center">
            <LensCharacter expression="excited" size="large" animate />
          </div>

          <Button
            asChild
            className="mt-8 h-12 w-full max-w-[280px] rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF] shadow-[var(--dl-shadow-button)]"
          >
            <Link href="/sign-up">
              렌즈와 시작하기
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>

          {/* Floating chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["치킨이 71%", "비 오는 날 3.2배", "소스컵 186g"].map((text) => (
              <span
                key={text}
                className="rounded-full bg-[#FFFFFF] px-3 py-1.5 text-[11px] text-[#6B8C7A] shadow-[var(--dl-shadow-card)]"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-[480px]">
          <h2 className="text-center text-[20px] font-semibold text-[#1A2E25]">
            딱 3단계야
          </h2>

          <div className="mt-8 flex flex-col gap-6">
            <Step
              icon={<Camera size={24} className="text-[#2D9E6B]" />}
              title="찍어"
              description="배달 영수증이나 용기 사진을"
              expression="curious"
            />
            <Step
              icon={<Cpu size={24} className="text-[#2D9E6B]" />}
              title="AI가 분석해"
              description="플라스틱 사용량을 자동 계산"
              expression="thinking"
            />
            <Step
              icon={<Lightbulb size={24} className="text-[#2D9E6B]" />}
              title="몰랐던 걸 알게 돼"
              description="숨겨진 패턴과 습관을 발견"
              expression="surprised"
            />
          </div>
        </div>
      </section>

      {/* Impact Lenses Preview */}
      <section className="bg-[#E8F5EE] px-4 py-12">
        <div className="mx-auto max-w-[480px]">
          <h2 className="text-center text-[20px] font-semibold text-[#1A2E25]">
            숫자가 아니라 실감으로 알려줘
          </h2>

          <div className="mt-8 flex flex-col gap-3">
            <LensCard
              borderColor="#F5A623"
              emoji="⏳"
              text="지금 시킨 소스컵, 2425년에도 어딘가에 있어."
            />
            <LensCard
              borderColor="#2D9E6B"
              emoji="📏"
              text="이번 용기 다 모으면 페트병 6개 무게야."
            />
            <LensCard
              borderColor="#E8685A"
              emoji="👻"
              text="소스컵 3개는 주문한 게 아니야. 그냥 딸려왔어."
            />
          </div>
        </div>
      </section>

      {/* AI Analyzer Section */}
      <section className="bg-[#1A2E25] px-4 py-12">
        <div className="mx-auto max-w-[480px] text-center">
          <h2 className="text-[20px] font-semibold text-[#FFFFFF]">
            쓸수록 더 똑똑해져
          </h2>
          <p className="mt-2 text-[13px] text-[#6B8C7A]">
            AI가 네 주문 패턴을 분석해서 매주 새로운 인사이트를 줘
          </p>

          <div className="mt-8 flex justify-center">
            <LensCharacter expression="excited" size="medium" animate />
          </div>

          <div className="mt-6 flex flex-col gap-2 text-left">
            {[
              "패턴 감지 완료 — 치킨이 71%",
              "날씨 상관관계 발견 — 비 오는 날 3.2배",
              "주문량 증가 추적 중",
              "소스컵 누적 집계 중",
            ].map((text, i) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-[12px] bg-[rgba(45,158,107,0.1)] p-3"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    i < 2 ? "bg-[#2D9E6B]" : "bg-[#F5A623]"
                  }`}
                />
                <span className="text-[13px] text-[#FFFFFF]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Character Introduction */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-[480px] text-center">
          <LensCharacter expression="curious" size="large" animate />
          <h2 className="mt-6 text-[20px] font-semibold text-[#1A2E25]">
            안녕, 나는 렌즈야
          </h2>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["반말로 대화해", "판단 안 해", "매주 새로운 발견", "데이터로만 말해"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[#E8F5EE] px-3 py-1.5 text-[11px] text-[#2D9E6B]"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2D9E6B] px-4 py-12">
        <div className="mx-auto max-w-[480px] text-center">
          <h2 className="text-[20px] font-semibold text-[#FFFFFF]">
            지금 나의 배달 기록 시작하기
          </h2>
          <Button
            asChild
            className="mt-6 h-12 rounded-full bg-[#FFFFFF] px-8 text-[15px] font-medium text-[#2D9E6B]"
          >
            <Link href="/sign-up">무료로 시작하기</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <Logo variant="horizontal" theme="light" />
        <p className="mt-2 text-[11px] text-[#6B8C7A]">
          지구를 위한 작은 렌즈
        </p>
      </footer>
    </div>
  )
}

function Step({
  icon,
  title,
  description,
  expression,
}: {
  icon: React.ReactNode
  title: string
  description: string
  expression: "curious" | "thinking" | "surprised"
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] bg-[#FFFFFF] p-5 shadow-[var(--dl-shadow-card)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-[15px] font-medium text-[#1A2E25]">{title}</h3>
        <p className="text-[13px] text-[#6B8C7A]">{description}</p>
      </div>
      <LensCharacter expression={expression} size="small" />
    </div>
  )
}

function LensCard({
  borderColor,
  emoji,
  text,
}: {
  borderColor: string
  emoji: string
  text: string
}) {
  return (
    <div
      className="rounded-[20px] bg-[#FFFFFF] p-4 shadow-[var(--dl-shadow-card)]"
      style={{ borderLeft: `1px solid ${borderColor}` }}
    >
      <p className="text-[13px] leading-relaxed text-[#6B8C7A]">
        {emoji} {text}
      </p>
    </div>
  )
}
