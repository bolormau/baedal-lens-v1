import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"

import type { User } from "@prisma/client"

export class AuthError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "AuthError"
  }
}

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new AuthError("Not authenticated")
  return userId
}

export async function getDbUser(): Promise<User> {
  const userId = await getAuthUserId()
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })
  if (!user) throw new AuthError("User not found in database")
  return user
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  return userId
}

export async function requireDbUser(): Promise<User> {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
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
