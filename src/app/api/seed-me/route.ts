import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { seedMockOrdersForUser } from "@/lib/db/seed-mock-orders"

export async function POST(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "인증 필요" },
      { status: 401 }
    )
  }
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "유저 없음" },
        { status: 404 }
      )
    }

    const existingCount = await prisma.order.count({
      where: { userId: user.id },
    })
    if (existingCount >= 30) {
      return NextResponse.json({
        success: true,
        data: { message: "이미 시드됨", count: existingCount },
      })
    }

    await seedMockOrdersForUser(prisma, user.id)

    return NextResponse.json({
      success: true,
      data: { message: "시드 완료", userId: user.id },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "시드 실패" },
      { status: 500 }
    )
  }
}
