"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db/prisma"
import { getDbUser } from "@/lib/auth/auth"

import type { ApiResponse, ScanResult } from "@/types"

export async function getWeeklyOrders(
  startDate: string,
  endDate: string
): Promise<ApiResponse<ScanResult[]>> {
  try {
    const user = await getDbUser()

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        scannedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { scannedAt: "desc" },
    })

    const results: ScanResult[] = orders.map((order) => ({
      id: order.id,
      scannedAt: order.scannedAt.toISOString(),
      restaurant: order.restaurant,
      category: order.category,
      items: order.items as ScanResult["items"],
      plasticG: order.plasticG,
      actualG: order.actualG ?? undefined,
      unrequested: order.unrequested,
      weather: order.weather,
      pm25: order.pm25,
      usedMessage: order.usedMessage,
      lenses: order.lenses as ScanResult["lenses"],
    }))

    return { success: true, data: results }
  } catch (error) {
    return { success: false, error: "리포트를 불러올 수 없어" }
  }
}

type ReportInput = {
  weekStart: string
  weekEnd: string
  totalG: number
  insight: string
  narrative?: string
}

export async function saveWeeklyReport(
  input: ReportInput
): Promise<ApiResponse<void>> {
  try {
    const user = await getDbUser()

    await prisma.weeklyReport.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart: new Date(input.weekStart),
        },
      },
      update: {
        totalG: input.totalG,
        insight: input.insight,
        narrative: input.narrative,
      },
      create: {
        userId: user.id,
        weekStart: new Date(input.weekStart),
        weekEnd: new Date(input.weekEnd),
        totalG: input.totalG,
        insight: input.insight,
        narrative: input.narrative,
      },
    })

    revalidatePath("/report")

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "리포트 저장이 안 됐어" }
  }
}
