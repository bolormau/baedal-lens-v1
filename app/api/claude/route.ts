import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

type MessageContent =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }

type Message = {
  role: "user" | "assistant"
  content: MessageContent[]
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "인증이 필요해" },
        { status: 401 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API 키가 설정되지 않았어" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      system,
      messages: bodyMessages,
      imageBase64,
      mediaType = "image/jpeg",
    } = body as {
      system?: string
      messages?: Message[]
      imageBase64?: string
      mediaType?: string
    }

    let messages: Message[]

    if (bodyMessages && bodyMessages.length > 0) {
      messages = bodyMessages
    } else if (imageBase64) {
      const content: MessageContent[] = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: imageBase64,
          },
        },
        {
          type: "text",
          text: "이 배달 영수증 또는 포장 사진을 분석해줘.",
        },
      ]
      messages = [{ role: "user", content }]
    } else {
      return NextResponse.json(
        { success: false, error: "messages 또는 imageBase64가 필요해" },
        { status: 400 }
      )
    }

    const requestBody: Record<string, unknown> = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages,
    }
    if (system) {
      requestBody.system = system
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { success: false, error: `Claude API 오류: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""

    return NextResponse.json({ success: true, data: content })
  } catch (error) {
    console.error("Claude route error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "잠깐, 뭔가 잘못됐어" },
      { status: 500 }
    )
  }
}
