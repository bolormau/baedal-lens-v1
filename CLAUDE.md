# 배달렌즈 — Project Context

## What this is
Korean environmental AI web app. Scans food delivery receipts,
tracks plastic usage, surfaces behavioral insights via AI character 렌즈.

## Stack
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4,
shadcn/ui, Zustand, React Hook Form + Zod, Clerk auth,
Prisma ORM, PostgreSQL (Neon), Vercel deployment.
Lucide React icons only. Recharts for charts. No framer-motion.

## Key rules
- Korean text only in UI, no English labels
- No `any` TypeScript
- No toLocaleString anywhere — use /lib/formatters.ts
- All colors from 8-color system only (#F0F5F2, #FFFFFF,
  #2D9E6B, #E8F5EE, #F5A623, #E8685A, #1A2E25, #6B8C7A)
- All borders 1px max
- Fonts: Noto Sans KR (Korean) + DM Sans (numbers) only
- All env vars through /lib/config.ts only
- Never prisma in client components
- Never auth() in client components
- All thresholds via THRESHOLDS constant in config.ts
- isDemoMode controls demo behavior

## File limits
page.tsx 30 lines, layout.tsx 50 lines,
components 150 lines, hooks 80 lines, actions 80 lines

## Folder structure
/src/app — routes
/src/features — feature modules
/src/components/common — shared UI
/src/lib — server utilities, actions, auth
/src/stores — Zustand only
/src/types — shared types
/prisma — schema + seed

## Commands (yarn only, never npx)
yarn dev
yarn build
yarn prisma migrate dev --name [name]
yarn prisma db push
yarn prisma studio
yarn prisma generate
yarn prisma db seed

## Current status
[UPDATE THIS as you build]
- Auth: working
- DB: connected (Neon)
- Landing page: done
- Home: in progress