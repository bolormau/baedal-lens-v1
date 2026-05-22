import type { Metadata, Viewport } from "next"
import { Noto_Sans_KR, DM_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "배달렌즈 | 배달이 남긴 것들",
  description: "영수증 한 장으로 시작하는 나만의 플라스틱 기록. AI가 분석하는 배달 환경 앱.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "배달렌즈",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D9E6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko" className={`${notoSansKR.variable} ${dmSans.variable} bg-[#F0F5F2]`}>
        <body className="font-sans antialiased">
          {children}
          {process.env.NODE_ENV === "production" && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
