export function formatPlasticWeight(grams: number): string {
  const str = String(grams)
  let result = ""
  let count = 0
  for (let i = str.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result = "," + result
    }
    result = str[i] + result
    count++
  }
  return `${result}g`
}

export function formatBottleEquivalent(grams: number): number {
  return Math.floor(grams / 52)
}

export function formatWeekRange(start: Date, end: Date): string {
  const startMonth = start.getMonth() + 1
  const startDay = start.getDate()
  const endMonth = end.getMonth() + 1
  const endDay = end.getDate()
  return `${startMonth}월 ${startDay}일 – ${endMonth}월 ${endDay}일`
}

export function formatTrend(
  current: number,
  previous: number
): { direction: "up" | "down" | "same"; percent: number } {
  if (previous === 0) {
    return { direction: "same", percent: 0 }
  }
  const diff = current - previous
  const percent = Math.round(Math.abs(diff / previous) * 100)
  if (diff > 0) return { direction: "up", percent }
  if (diff < 0) return { direction: "down", percent }
  return { direction: "same", percent: 0 }
}

export function formatTimeGreeting(hour: number, name: string): string {
  const particle = formatNameWithParticle(name)
  if (hour >= 6 && hour < 11) {
    return `좋은 아침이야 ${particle}`
  }
  if (hour >= 11 && hour < 17) {
    return `안녕 ${particle}`
  }
  if (hour >= 17 && hour < 22) {
    return `저녁 배달 시켰어?`
  }
  return `늦었다 ${particle}`
}

export function formatMonthHeader(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}년 ${month}월`
}

export function formatNameWithParticle(name: string): string {
  if (!name || name.length === 0) return name
  const lastChar = name.charCodeAt(name.length - 1)
  if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
    return `${name}야`
  }
  const hasBatchim = (lastChar - 0xAC00) % 28 !== 0
  return hasBatchim ? `${name}아` : `${name}야`
}

export function formatDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const period = hour < 12 ? "오전" : "오후"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const paddedMinute = String(minute).padStart(2, "0")
  return `${month}월 ${day}일 ${period} ${displayHour}:${paddedMinute}`
}

export function formatCO2(grams: number): string {
  return `${(grams * 6).toLocaleString()}g CO₂`
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "어제"
  if (diffDays < 7) return `${diffDays}일 전`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatTimeHHMM(date: Date | string): string {
  const d = new Date(date)
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}
