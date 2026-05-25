import { PrismaClient } from "@prisma/client"
import { seedMockOrdersForUser } from "../src/lib/db/seed-mock-orders"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findFirst({
    where: { email: "demo@baedallens.app" },
  })

  if (existing) {
    console.log("Demo user already exists, skipping seed.")
    return
  }

  const user = await prisma.user.create({
    data: {
      clerkId: "demo_user_seed",
      email: "demo@baedallens.app",
      name: "민준",
      district: "마포구",
      toneMode: "FRIEND",
      notificationsEnabled: false,
      hasCompletedOnboarding: true,
    },
  })

  await seedMockOrdersForUser(prisma, user.id)
  console.log(`Seeded 30 mock orders for demo user: ${user.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
