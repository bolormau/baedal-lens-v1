"use client"

import { useState, useEffect } from "react"
import { LensCharacter } from "@/features/shared/lens-character/LensCharacter"
import { formatPlasticWeight } from "@/lib/formatters"

const GRAMS_PER_SECOND = 3461

export function LivePlasticCounter() {
  const [grams, setGrams] = useState(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    return Math.round(((Date.now() - startOfDay.getTime()) / 1000) * GRAMS_PER_SECOND)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setGrams((prev) => prev + Math.round(GRAMS_PER_SECOND * 0.1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-[20px] bg-[#1A2E25] p-5">
      <div className="absolute right-4 top-4">
        <LensCharacter expression="surprised" size="small" />
      </div>
      <p className="text-[12px] text-[#6B8C7A]">지금 이 순간 한국의 배달 플라스틱</p>
      <p className="mt-1 font-mono text-[32px] font-bold text-white">
        {formatPlasticWeight(grams)}
      </p>
      <p className="text-[12px] text-[#6B8C7A]">= 페트병 {Math.floor(grams / 31).toLocaleString()}개</p>
      <p className="mt-1 text-[11px] text-[#6B8C7A]">오늘 하루만</p>
    </div>
  )
}
