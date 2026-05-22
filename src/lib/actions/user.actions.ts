"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/db/prisma"
import { getDbUser } from "@/lib/auth/auth"

import type { ApiResponse, UserProfile, ToneMode } from "@/types"

const updateProfileSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  district: z.string().optional(),
  toneMode: z.enum(["friend", "formal"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  hasCompletedOnboarding: z.boolean().optional(),
})

export async function updateUserProfile(
  input: Partial<UserProfile>
): Promise<ApiResponse<void>> {
  try {
    const user = await getDbUser()
    const validated = updateProfileSchema.parse(input)

    const updateData: Record<string, unknown> = {}

    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.district !== undefined) updateData.district = validated.district
    if (validated.toneMode !== undefined) {
      updateData.toneMode = validated.toneMode === "friend" ? "FRIEND" : "FORMAL"
    }
    if (validated.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = validated.notificationsEnabled
    }
    if (validated.hasCompletedOnboarding !== undefined) {
      updateData.hasCompletedOnboarding = validated.hasCompletedOnboarding
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    revalidatePath("/home")
    revalidatePath("/settings")

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "저장이 안 됐어. 다시 해볼게" }
  }
}

export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const user = await getDbUser()

    const profile: UserProfile = {
      name: user.name,
      district: user.district,
      toneMode: user.toneMode === "FRIEND" ? "friend" : "formal",
      notificationsEnabled: user.notificationsEnabled,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    }

    return { success: true, data: profile }
  } catch (error) {
    return { success: false, error: "프로필을 불러올 수 없어" }
  }
}
