import { z } from "zod"

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

export const IMPACT_LENS = {
  TIME: "time",
  SCALE: "scale",
  ACCUMULATION: "accumulation",
  INVISIBILITY: "invisibility",
  COMPARISON: "comparison",
} as const
export type ImpactLens = typeof IMPACT_LENS[keyof typeof IMPACT_LENS]

export const LENS_EXPRESSION = {
  CURIOUS: "curious",
  EXCITED: "excited",
  THINKING: "thinking",
  SURPRISED: "surprised",
  SLEEPING: "sleeping",
} as const
export type LensExpression = typeof LENS_EXPRESSION[keyof typeof LENS_EXPRESSION]

export const FOOD_CATEGORY = {
  CHICKEN: "CHICKEN",
  CHINESE: "CHINESE",
  PIZZA: "PIZZA",
  SNACK: "SNACK",
  BURGER: "BURGER",
  KOREAN: "KOREAN",
  OTHER: "OTHER",
} as const
export type FoodCategory = typeof FOOD_CATEGORY[keyof typeof FOOD_CATEGORY]

export const WEATHER_TYPE = {
  SUNNY: "SUNNY",
  CLOUDY: "CLOUDY",
  RAINY: "RAINY",
} as const
export type WeatherType = typeof WEATHER_TYPE[keyof typeof WEATHER_TYPE]

export const PM25_LEVEL = {
  GOOD: "GOOD",
  MODERATE: "MODERATE",
  BAD: "BAD",
  VERY_BAD: "VERY_BAD",
} as const
export type PM25Level = typeof PM25_LEVEL[keyof typeof PM25_LEVEL]

export const TONE_MODE = {
  FRIEND: "friend",
  FORMAL: "formal",
} as const
export type ToneMode = typeof TONE_MODE[keyof typeof TONE_MODE]

// ═══════════════════════════════════════
// Zod Schemas
// ═══════════════════════════════════════

export const orderItemSchema = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  plasticG: z.number().nonnegative(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const impactLensDataSchema = z.object({
  type: z.enum(["time", "scale", "accumulation", "invisibility", "comparison"]),
  emoji: z.string(),
  text: z.string(),
})
export type ImpactLensData = z.infer<typeof impactLensDataSchema>

export const scanResultSchema = z.object({
  id: z.string().uuid(),
  scannedAt: z.string().datetime(),
  restaurant: z.string(),
  category: z.enum(["CHICKEN", "CHINESE", "PIZZA", "SNACK", "BURGER", "KOREAN", "OTHER"]),
  items: z.array(orderItemSchema),
  plasticG: z.number().nonnegative(),
  actualG: z.number().nonnegative().optional(),
  unrequested: z.array(z.string()),
  weather: z.enum(["SUNNY", "CLOUDY", "RAINY"]),
  pm25: z.enum(["GOOD", "MODERATE", "BAD", "VERY_BAD"]),
  usedMessage: z.boolean(),
  lenses: z.array(impactLensDataSchema),
})
export type ScanResult = z.infer<typeof scanResultSchema>

export const userProfileSchema = z.object({
  name: z.string().min(1).max(20),
  district: z.string(),
  toneMode: z.enum(["friend", "formal"]),
  notificationsEnabled: z.boolean(),
  hasCompletedOnboarding: z.boolean(),
})
export type UserProfile = z.infer<typeof userProfileSchema>

// ═══════════════════════════════════════
// State Types (Discriminated Unions)
// ═══════════════════════════════════════

export type ScanState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "analyzing" }
  | { status: "error"; error: string }
  | { status: "success"; data: ScanResult }

export type ReportState =
  | { status: "empty" }
  | { status: "loading" }
  | { status: "insufficient"; weeksRemaining: number }
  | { status: "ready"; data: WeeklyReport }

export type InsightState =
  | { status: "no_data" }
  | { status: "collecting"; scansRemaining: number }
  | { status: "ready"; insight: string; source: string }

export type MirrorState =
  | { status: "locked"; weeksRemaining: number }
  | { status: "unlocked"; narrative: string }

// ═══════════════════════════════════════
// Report Types
// ═══════════════════════════════════════

export type CategoryBreakdownItem = {
  category: FoodCategory
  plasticG: number
  percentage: number
}

export type AnalyzerStatusItem = {
  done: boolean
  text: string
}

export type WeeklyReport = {
  weekStart: string
  weekEnd: string
  totalG: number
  previousWeekG: number
  trend: number
  equivalent: number
  categories: CategoryBreakdownItem[]
  insight: string
  insightSource: string
  analyzerStatus: AnalyzerStatusItem[]
  mirrorStatus: MirrorState
}

// ═══════════════════════════════════════
// UI Types
// ═══════════════════════════════════════

export type ToastType = "success" | "warning" | "error"

export type Toast = {
  id: string
  type: ToastType
  message: string
}

export type ConfirmDialogConfig = {
  title: string
  description: string
  subtext?: string
  expression: LensExpression
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void | Promise<void>
  destructive?: boolean
}
