import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { Webhook } from "svix"

import { prisma } from "@/lib/db/prisma"

type WebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string }>
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    )
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(webhookSecret)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  const { type, data } = event

  try {
    if (type === "user.created") {
      const email = data.email_addresses?.[0]?.email_address || ""

      await prisma.user.create({
        data: {
          clerkId: data.id,
          email,
          name: "",
          district: "",
          toneMode: "FRIEND",
          notificationsEnabled: false,
          hasCompletedOnboarding: false,
        },
      })
    }

    if (type === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: data.id },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    )
  }
}
