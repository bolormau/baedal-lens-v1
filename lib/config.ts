import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AIRKOREA_API_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
})

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  AIRKOREA_API_KEY: process.env.AIRKOREA_API_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export const THRESHOLDS = {
  scansForBaseline: isDemoMode ? 2 : 5,
  scansForInsight: isDemoMode ? 2 : 14,
  scansForMirror: isDemoMode ? 3 : 28,
  weekDurationDays: isDemoMode ? 1 : 7,
  ordersForBreakdown: isDemoMode ? 1 : 3,
} as const

export const config = {
  ...env,
  isDemoMode,
  THRESHOLDS,
} as const
