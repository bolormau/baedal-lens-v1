"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Cpu, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { updateUserProfile } from "@/lib/actions/user.actions"

const SEOUL_DISTRICTS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구",
  "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구",
  "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구",
  "은평구", "종로구", "중구", "중랑구",
] as const

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해줘").max(20, "20자 이내로 입력해줘"),
  district: z.string().min(1, "동네를 선택해줘"),
})

type FormData = z.infer<typeof formSchema>

export default function IntroPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      district: "",
    },
  })

  const nameValue = form.watch("name")

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleSkip = () => {
    setCurrentSlide(2)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateUserProfile({
        name: data.name,
        district: data.district,
        hasCompletedOnboarding: true,
      })

      if (result.success) {
        localStorage.setItem("dl-onboarding-complete", "true")
        router.push("/home")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* Dot indicator */}
      <div className="mb-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentSlide ? "w-4 bg-[#2D9E6B]" : "bg-[rgba(45,158,107,0.2)]"
            }`}
          />
        ))}
      </div>

      {/* Slide 1 */}
      {currentSlide === 0 && (
        <div className="flex flex-col items-center text-center animate-slide-up">
          <LensCharacter expression="excited" size="large" animate />
          <h1 className="mt-6 text-[20px] font-semibold text-[#1A2E25]">
            안녕! 나는 렌즈야
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6B8C7A]">
            네 배달 영수증을 분석해서
            <br />
            네가 몰랐던 것들을 알려줄게
          </p>
          <Button
            onClick={handleNext}
            className="mt-8 h-12 w-full max-w-[320px] rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF]"
          >
            다음
          </Button>
          <button
            onClick={handleSkip}
            className="mt-4 text-[13px] text-[#6B8C7A]"
          >
            건너뛰기
          </button>
        </div>
      )}

      {/* Slide 2 */}
      {currentSlide === 1 && (
        <div className="flex flex-col items-center text-center animate-slide-up">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
                <Camera size={24} className="text-[#2D9E6B]" />
              </div>
              <span className="text-[13px] text-[#1A2E25]">찍어</span>
              <LensCharacter expression="curious" size="small" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
                <Cpu size={24} className="text-[#2D9E6B]" />
              </div>
              <span className="text-[13px] text-[#1A2E25]">AI가 분석해</span>
              <LensCharacter expression="thinking" size="small" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E8F5EE]">
                <Lightbulb size={24} className="text-[#2D9E6B]" />
              </div>
              <span className="text-[13px] text-[#1A2E25]">알게 돼</span>
              <LensCharacter expression="surprised" size="small" />
            </div>
          </div>
          <Button
            onClick={handleNext}
            className="mt-8 h-12 w-full max-w-[320px] rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF]"
          >
            다음
          </Button>
        </div>
      )}

      {/* Slide 3 - Form */}
      {currentSlide === 2 && (
        <div className="w-full max-w-[320px] animate-slide-up">
          <div className="flex justify-center">
            <LensCharacter
              expression={nameValue ? "excited" : "curious"}
              size="medium"
              animate
            />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[15px] font-medium text-[#1A2E25]">
                너 이름이 뭐야?
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="닉네임도 괜찮아"
                className="h-12 rounded-[14px] border-[rgba(45,158,107,0.12)] text-[15px] placeholder:text-[#6B8C7A]"
              />
              {form.formState.errors.name && (
                <p className="text-[11px] text-[#E8685A]">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-[15px] font-medium text-[#1A2E25]">
                어느 동네야?
              </Label>
              <Select
                value={form.watch("district")}
                onValueChange={(value) => form.setValue("district", value)}
              >
                <SelectTrigger className="h-12 rounded-[14px] border-[rgba(45,158,107,0.12)] text-[15px]">
                  <SelectValue placeholder="동네를 선택해줘" />
                </SelectTrigger>
                <SelectContent>
                  {SEOUL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.district && (
                <p className="text-[11px] text-[#E8685A]">
                  {form.formState.errors.district.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
              className="h-12 w-full rounded-full bg-[#2D9E6B] text-[15px] font-medium text-[#FFFFFF] disabled:opacity-40"
            >
              {isSubmitting ? "저장 중..." : "시작하기"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
