"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db/prisma"
import { getDbUser, AuthError } from "@/lib/auth/auth"
import { scanResultSchema } from "@/types"

import type { ApiResponse, ScanResult } from "@/types"

export async function saveOrder(
  input: ScanResult
): Promise<ApiResponse<void>> {
  try {
    const user = await getDbUser()
    const validated = scanResultSchema.parse(input)

    await prisma.order.create({
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

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "로그인이 필요해" }
    }
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
    if (error instanceof AuthError) {
      return { success: false, error: "로그인이 필요해" }
    }
    return { success: false, error: "기록을 불러올 수 없어" }
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
    if (error instanceof AuthError) {
      return { success: false, error: "로그인이 필요해" }
    }
    return { success: false, error: "삭제가 안 됐어. 다시 해볼게" }
  }
}
