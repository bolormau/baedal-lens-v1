import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"

import type { User } from "@prisma/client"

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  return userId
}

export async function getDbUser(): Promise<User> {
  const userId = await getAuthUserId()
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })
  if (!user) redirect("/sign-in")
  return user
}

export async function getDbUserOrNull(): Promise<User | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })
  return user
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await currentUser()
  return user?.emailAddresses[0]?.emailAddress ?? null
}
