"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db/prisma"
import { getDbUser } from "@/lib/auth/auth"
import { scanResultSchema } from "@/types"

import type { ApiResponse, ScanResult } from "@/types"

export async function saveOrder(
  input: ScanResult
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await getDbUser()
    const validated = scanResultSchema.parse(input)

    const savedOrder = await prisma.order.create({
      data: {
        userId: user.id,
        restaurant: validated.restaurant,
        category: validated.category,
        items: validated.items,
        plasticG: validated.plasticG,
        actualG: validated.actualG,
        unrequested: validated.unrequested,
        weather: validated.weather,
        pm25: validated.pm25,
        usedMessage: validated.usedMessage,
        lenses: validated.lenses,
        scannedAt: new Date(validated.scannedAt),
      },
    })

    revalidatePath("/home")
    revalidatePath("/history")
    revalidatePath("/report")

    return { success: true, data: { id: savedOrder.id } }
  } catch (error) {
    console.error("saveOrder error:", error)
    return { success: false, error: "저장이 안 됐어. 다시 해볼게" }
  }
}

export async function getOrderHistory(): Promise<ApiResponse<ScanResult[]>> {
  try {
    const user = await getDbUser()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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
    console.error("getOrderHistory error:", error)
    return { success: false, error: "기록을 불러올 수 없어" }
  }
}

export async function getScanById(
  id: string
): Promise<ApiResponse<ScanResult | null>> {
  try {
    const user = await getDbUser()
    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
    })
    if (!order) return { success: true, data: null }
    const result: ScanResult = {
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
    }
    return { success: true, data: result }
  } catch {
    return { success: false, error: "기록을 불러오지 못했어." }
  }
}

export async function getUserStats(): Promise<
  ApiResponse<{ totalScans: number; totalPlasticG: number }>
> {
  try {
    const user = await getDbUser()
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      select: { plasticG: true, actualG: true },
    })
    return {
      success: true,
      data: {
        totalScans: orders.length,
        totalPlasticG: orders.reduce(
          (sum, o) => sum + (o.actualG ?? o.plasticG),
          0
        ),
      },
    }
  } catch {
    return { success: false, error: "통계를 불러오지 못했어." }
  }
}

export async function deleteAllOrders(): Promise<ApiResponse<void>> {
  try {
    const user = await getDbUser()

    await prisma.order.deleteMany({
      where: { userId: user.id },
    })

    revalidatePath("/home")
    revalidatePath("/history")
    revalidatePath("/report")

    return { success: true, data: undefined }
  } catch (error) {
    console.error("deleteAllOrders error:", error)
    return { success: false, error: "삭제가 안 됐어. 다시 해볼게" }
  }
}
