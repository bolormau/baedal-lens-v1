// TODO: remove before final demo
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/db/prisma"

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const orderCount = await prisma.order.count({ where: { userId: user.id } })
  const latestOrder = await prisma.order.findFirst({
    where: { userId: user.id },
    orderBy: { scannedAt: "desc" },
  })

  return NextResponse.json({ userId: user.id, orderCount, latestOrder })
}
