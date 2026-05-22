"use client"

import { isDemoMode } from "@/lib/config"

import type { LensExpression } from "@/types"

export type LensCharacterProps = {
  expression: LensExpression
  size: "large" | "medium" | "small" | "micro"
  animate?: boolean
}

const SIZES = {
  large: 80,
  medium: 48,
  small: 32,
  micro: 24,
} as const

export function LensCharacter({
  expression,
  size,
  animate = false,
}: LensCharacterProps) {
  const px = SIZES[size]
  const animationClass = animate
    ? isDemoMode
      ? "animate-float-fast"
      : "animate-float"
    : ""

  return (
    <div
      className={`inline-flex items-center justify-center ${animationClass}`}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <circle cx="40" cy="44" r="32" fill="#2D9E6B" />

        {/* Moss texture leaves */}
        <ellipse cx="28" cy="52" rx="8" ry="5" fill="#259060" opacity="0.6" />
        <ellipse cx="52" cy="48" rx="6" ry="4" fill="#259060" opacity="0.5" />
        <ellipse cx="40" cy="58" rx="7" ry="4" fill="#259060" opacity="0.4" />

        {/* Leaf crown */}
        <ellipse cx="32" cy="16" rx="4" ry="8" fill="#259060" transform="rotate(-20 32 16)" />
        <ellipse cx="40" cy="12" rx="3" ry="7" fill="#2D9E6B" />
        <ellipse cx="48" cy="16" rx="4" ry="8" fill="#259060" transform="rotate(20 48 16)" />

        {/* Eyes */}
        <Eyes expression={expression} />

        {/* Cheeks */}
        <circle cx="24" cy="46" r="4" fill="#F5A623" opacity="0.3" />
        <circle cx="56" cy="46" r="4" fill="#F5A623" opacity="0.3" />

        {/* Mouth */}
        <Mouth expression={expression} />

        {/* Magnifying glass (right nub-hand) */}
        <MagnifyingGlass expression={expression} />

        {/* Sleep zzz */}
        {expression === "sleeping" && <SleepZzz />}
      </svg>
    </div>
  )
}

function Eyes({ expression }: { expression: LensExpression }) {
  switch (expression) {
    case "curious":
      return (
        <>
          <circle cx="32" cy="40" r="6" fill="white" />
          <circle cx="48" cy="40" r="6" fill="white" />
          <circle cx="33" cy="39" r="3" fill="#1A2E25" />
          <circle cx="49" cy="39" r="3" fill="#1A2E25" />
        </>
      )
    case "excited":
      return (
        <>
          <circle cx="32" cy="40" r="6" fill="white" />
          <circle cx="48" cy="40" r="6" fill="white" />
          {/* Star pupils */}
          <path d="M32 37l1 2 2-1-1 2 1 2-2-1-1 2-1-2-2 1 1-2-1-2 2 1z" fill="#1A2E25" />
          <path d="M48 37l1 2 2-1-1 2 1 2-2-1-1 2-1-2-2 1 1-2-1-2 2 1z" fill="#1A2E25" />
        </>
      )
    case "thinking":
      return (
        <>
          <circle cx="32" cy="40" r="6" fill="white" />
          <circle cx="48" cy="40" r="5" fill="white" />
          <circle cx="33" cy="40" r="3" fill="#1A2E25" />
          {/* Squinted eye */}
          <line x1="44" y1="40" x2="52" y2="40" stroke="#1A2E25" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case "surprised":
      return (
        <>
          <ellipse cx="32" cy="40" rx="6" ry="7" fill="white" />
          <ellipse cx="48" cy="40" rx="6" ry="7" fill="white" />
          <ellipse cx="33" cy="40" rx="3" ry="4" fill="#1A2E25" />
          <ellipse cx="49" cy="40" rx="3" ry="4" fill="#1A2E25" />
        </>
      )
    case "sleeping":
      return (
        <>
          <line x1="27" y1="40" x2="37" y2="40" stroke="#1A2E25" strokeWidth="2" strokeLinecap="round" />
          <line x1="43" y1="40" x2="53" y2="40" stroke="#1A2E25" strokeWidth="2" strokeLinecap="round" />
        </>
      )
  }
}

function Mouth({ expression }: { expression: LensExpression }) {
  switch (expression) {
    case "curious":
      return <path d="M36 50 Q40 53 44 50" stroke="#1A2E25" strokeWidth="2" fill="none" strokeLinecap="round" />
    case "excited":
      return <path d="M34 49 Q40 56 46 49" stroke="#1A2E25" strokeWidth="2" fill="none" strokeLinecap="round" />
    case "thinking":
      return <path d="M36 50 Q40 50 44 52" stroke="#1A2E25" strokeWidth="2" fill="none" strokeLinecap="round" />
    case "surprised":
      return <ellipse cx="40" cy="52" rx="4" ry="5" fill="#1A2E25" />
    case "sleeping":
      return <path d="M36 50 Q40 52 44 50" stroke="#1A2E25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  }
}

function MagnifyingGlass({ expression }: { expression: LensExpression }) {
  const spinClass = expression === "thinking" ? "animate-spin-slow" : ""
  return (
    <g className={spinClass} style={{ transformOrigin: "68px 36px" }}>
      <circle cx="68" cy="36" r="8" stroke="#F5A623" strokeWidth="2" fill="none" />
      <line x1="74" y1="42" x2="78" y2="46" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="36" r="3" fill="#F5A623" opacity="0.2" />
    </g>
  )
}

function SleepZzz() {
  return (
    <g className="animate-float">
      <text x="58" y="28" fill="#6B8C7A" fontSize="8" fontWeight="bold">z</text>
      <text x="64" y="22" fill="#6B8C7A" fontSize="10" fontWeight="bold">z</text>
      <text x="70" y="14" fill="#6B8C7A" fontSize="12" fontWeight="bold">z</text>
    </g>
  )
}
