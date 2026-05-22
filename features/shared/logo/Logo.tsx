export type LogoProps = {
  variant: "horizontal" | "stacked"
  theme: "light" | "dark"
  className?: string
}

export function Logo({ variant, theme, className = "" }: LogoProps) {
  const color = theme === "dark" ? "#FFFFFF" : "#1A2E25"
  const accentColor = theme === "dark" ? "#FFFFFF" : "#F5A623"

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 배달 */}
          <text x="10" y="28" fill={color} fontSize="20" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
            배달
          </text>
          {/* 렌즈 with magnifying glass replacing ㅇ */}
          <text x="58" y="28" fill={color} fontSize="20" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
            렌
          </text>
          {/* Magnifying glass for ㅇ in 렌 */}
          <circle cx="76" cy="18" r="6" stroke={accentColor} strokeWidth="2" fill="none" />
          <line x1="80" y1="22" x2="84" y2="26" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          <text x="86" y="28" fill={color} fontSize="20" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
            즈
          </text>
          {/* Leaf accent */}
          <ellipse cx="108" cy="12" rx="3" ry="6" fill="#2D9E6B" transform="rotate(15 108 12)" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 배달 */}
        <text x="0" y="20" fill={color} fontSize="16" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
          배달
        </text>
        {/* 렌즈 with magnifying glass effect */}
        <text x="44" y="20" fill={color} fontSize="16" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
          렌
        </text>
        {/* Small magnifying glass accent */}
        <circle cx="60" cy="10" r="4" stroke={accentColor} strokeWidth="1.5" fill="none" />
        <line x1="63" y1="13" x2="66" y2="16" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <text x="68" y="20" fill={color} fontSize="16" fontWeight="700" fontFamily="'Noto Sans KR', sans-serif">
          즈
        </text>
        {/* Leaf accent */}
        <ellipse cx="92" cy="8" rx="2" ry="4" fill="#2D9E6B" transform="rotate(15 92 8)" />
      </svg>
    </div>
  )
}
